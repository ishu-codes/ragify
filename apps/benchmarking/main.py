import json
import os
import sys
from pathlib import Path
from typing import Any

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from src.ragify.evaluation import RAGEvaluator, RetrievalEngine
from src.ragify.ingestion.grobid_ingestion import (
    convert_tei_to_json,
    ingest_paper_from_json,
    ingest_pdfs_batch,
    ingest_xml,
    process_pdfs_with_grobid,
)
from src.ragify.ingestion.transcoder import transcoder
from src.ragify.retrieval import embeddings, vector_store_manager


def load_json_file(path: str) -> list[dict[str, Any]]:
    with open(path, "r") as f:
        return json.load(f)


def load_config(config_path: str) -> dict[str, Any]:
    with open(config_path, "r") as f:
        return yaml.safe_load(f)


def get_vector_store(collection_name: str = "benchmark"):
    return vector_store_manager.get_or_create(collection_name)


def ingest_papers_grobid(papers_dir: str, collection_name: str = "benchmark"):
    from src.ragify.ingestion.grobid_ingestion import COLLECTION

    # process_pdfs_with_grobid(papers_dir, papers_dir)

    papers_path = Path(papers_dir)
    pdfs = sorted(papers_path.glob("*.grobid.tei.xml"))

    print(f"Found {len(pdfs)} files to Jsonify")

    for i, pdf in enumerate(pdfs, start=1):
        print(f"{i}) {pdf.name}: ", end="")
        try:
            ingest_xml(str(pdf), str(papers_path), collection_name)
            print("Done")
        except Exception as e:
            print(f"Error\n{e}\n")

    print(f"Finished processing {len(pdfs)} papers with GroBID")


def ingest_papers(papers_dir: str, collection_name: str = "benchmark"):
    papers_path = Path(papers_dir)
    pdfs = sorted([f for f in papers_path.iterdir() if f.suffix.lower() == ".pdf"])

    print(f"Found {len(pdfs)} PDFs to process")

    for i, pdf in enumerate(pdfs, start=1):
        print(f"{i}) {pdf.name}: ", end="")
        try:
            transcoder.process_pdf(str(pdf), collection_name, pdf.stem)
            print("Done")
        except Exception as e:
            print(f"Error\n{e}\n")

    print(f"Finished processing {len(pdfs)} papers")


def run_baseline(
    config: dict[str, Any], queries: list[dict[str, Any]]
) -> dict[str, Any]:
    engine = RetrievalEngine(
        embed_fn=embeddings.encode,
        vector_store_fn=get_vector_store,
        reranker=None,
    )

    evaluator = RAGEvaluator(
        retrieval_engine=engine,
        llm_generate=None,
    )

    k = config.get("top_k", 5)
    experiment_name = config.get("experiment_name", "baseline")

    print(f"Running {experiment_name}...")
    result = evaluator.run_benchmark(queries, k=k, experiment_name=experiment_name)

    return {
        "experiment_name": result.experiment_name,
        "doc_recall_at_k": result.doc_recall_at_k,
        "chunk_relevance_at_k": result.chunk_relevance_at_k,
        "generation_score": result.generation_score,
        "avg_latency_ms": result.avg_latency_ms,
        "p95_latency_ms": result.p95_latency_ms,
        "total_queries": result.total_queries,
    }


def run_with_reranker(
    config: dict[str, Any], queries: list[dict[str, Any]]
) -> dict[str, Any]:
    from src.ragify.reranking import reranker

    initial_k = config.get("initial_k", 25)

    engine = RetrievalEngine(
        embed_fn=embeddings.encode,
        vector_store_fn=get_vector_store,
        reranker=reranker.rerank,
    )

    evaluator = RAGEvaluator(
        retrieval_engine=engine,
        llm_generate=None,
    )

    k = config.get("top_k", 5)
    experiment_name = config.get("experiment_name", "rerank")

    print(f"Running {experiment_name} (initial_k={initial_k}, top_k={k})...")
    result = evaluator.run_benchmark(
        queries, k=k, experiment_name=experiment_name, initial_k=initial_k
    )

    return {
        "experiment_name": result.experiment_name,
        "doc_recall_at_k": result.doc_recall_at_k,
        "chunk_relevance_at_k": result.chunk_relevance_at_k,
        "generation_score": result.generation_score,
        "avg_latency_ms": result.avg_latency_ms,
        "p95_latency_ms": result.p95_latency_ms,
        "total_queries": result.total_queries,
    }


def benchmark():
    queries = load_json_file("./data/queries.json")
    print(f"Loaded {len(queries)} queries")

    baseline_config = load_config("./config/baseline.yaml")
    rerank_config = load_config("./config/rerank.yaml")

    print("=" * 60)
    print("Running BASELINE (without reranker)...")
    print("=" * 60)
    baseline_result = run_baseline(baseline_config, queries)
    print(f"Results: {json.dumps(baseline_result, indent=2)}")

    print("\n" + "=" * 60)
    print("Running RERANK (with reranker)...")
    print("=" * 60)
    rerank_result = run_with_reranker(rerank_config, queries)
    print(f"Results: {json.dumps(rerank_result, indent=2)}")

    print("\n" + "=" * 60)
    print("COMPARISON")
    print("=" * 60)
    print(f"{'Metric':<20} {'Baseline':<12} {'With Reranker':<12} {'Delta':<12}")
    print("-" * 60)

    metrics = [
        ("Doc Recall@K", "doc_recall_at_k"),
        ("Chunk Relevance@K", "chunk_relevance_at_k"),
        ("Avg Latency (ms)", "avg_latency_ms"),
    ]

    for name, key in metrics:
        base = baseline_result.get(key, 0) or 0
        rerank = rerank_result.get(key, 0) or 0
        delta = rerank - base
        delta_str = f"+{delta:.4f}" if delta >= 0 else f"{delta:.4f}"
        print(f"{name:<20} {base:<12.4f} {rerank:<12.4f} {delta_str:<12}")


def main():
    papers_dir = "./data/papers"
    collection_name = "benchmark"

    # print("=" * 60)
    # print("INGESTING PAPERS WITH GROBID + CONTEXT-AWARE CHUNKING")
    # print("=" * 60)
    # ingest_papers_grobid(papers_dir, collection_name)

    print("\n" + "=" * 60)
    print("RUNNING BENCHMARK")
    print("=" * 60)
    benchmark()


if __name__ == "__main__":
    main()
