import uuid
from collections import defaultdict
from pathlib import Path
from typing import Any

import numpy as np
import tiktoken
from grobid2json import convert_xml_to_json
from grobid_client.grobid_client import GrobidClient
from langchain_core.documents import Document
from ollama import ResponseError
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

from apps.api.src.utils.files import save_to_file
from apps.api.src.utils.json import save_to_json
from src.ragify.retrieval import VectorStoreManager, vector_store, vector_store_manager
from src.ragify.retrieval.embedder import embeddings
from src.ragify.utils.config import EMBED_MODEL, MAX_TOKENS, VECTOR_SIZE, VECTORDB_URL

COLLECTION = "benchmark"
SIM_THRESHOLD = 0.75
GROBID_URL = "http://localhost:8070"

client = QdrantClient(url=VECTORDB_URL)
tokenizer = tiktoken.get_encoding("cl100k_base")


# def init_collection():
#     client.recreate_collection(
#         collection_name=COLLECTION,
#         vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
#     )


def token_len(text: str) -> int:
    return len(tokenizer.encode(text))


def cosine(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def split_sentences(text: str) -> list[str]:
    return [s.strip() for s in text.split(". ") if s.strip()]


def semantic_chunk(text: str) -> list[str]:
    sentences = split_sentences(text)
    if not sentences:
        return []

    safe_sentences = [s for s in sentences if token_len(s) <= MAX_CHUNK_TOKENS]
    if not safe_sentences:
        return []

    try:
        emb = embeddings.encode(safe_sentences)
    except Exception:
        return safe_sentences

    chunks = []
    curr = [safe_sentences[0]]

    for i in range(1, len(safe_sentences)):
        sim = cosine(emb[i - 1], emb[i])
        if sim < SIM_THRESHOLD:
            chunks.append(" ".join(curr))
            curr = []
        curr.append(safe_sentences[i])

    if curr:
        chunks.append(" ".join(curr))

    return chunks


MAX_CHUNK_TOKENS = 4096


def dynamic_overlap(size: int) -> int:
    if size < 200:
        return 20
    elif size < 500:
        return 50
    return 100


def split_by_tokens(text: str, max_tokens: int = MAX_CHUNK_TOKENS) -> list[str]:
    words = text.split()
    chunks = []
    current = []
    current_len = 0

    for word in words:
        word_len = token_len(word)
        if current_len + word_len > max_tokens and current:
            chunks.append(" ".join(current))
            current = [word]
            current_len = word_len
        else:
            current.append(word)
            current_len += word_len

    if current:
        chunks.append(" ".join(current))

    return [c for c in chunks if token_len(c) <= max_tokens]


def merge_chunks(chunks: list[str]) -> list[str]:
    merged = []
    for i, c in enumerate(chunks):
        if i > 0:
            overlap = dynamic_overlap(token_len(c))
            merged[-1] += " " + c[:overlap]
        merged.append(c)
    return merged


def process_section(paragraphs: list[str]) -> list[str]:
    text = " ".join(paragraphs)
    t = token_len(text)

    if t < 300:
        return [text]

    elif t < 1500:
        chunks = []
        for p in paragraphs:
            if token_len(p) < 200:
                chunks.append(p)
            else:
                chunks.extend(split_sentences(p))
        chunks = merge_chunks(chunks)

    else:
        chunks = merge_chunks(semantic_chunk(text))

    final_chunks = []
    for chunk in chunks:
        if token_len(chunk) > MAX_CHUNK_TOKENS:
            final_chunks.extend(split_by_tokens(chunk))
        else:
            final_chunks.append(chunk)

    return final_chunks


def process_pdfs_with_grobid(pdfs_dir: str, output_dir: str | None = None) -> None:
    client_grobid = GrobidClient()
    # pdf_path_obj = Path(pdf_path)

    if output_dir:
        output_dir_path = Path(output_dir)
    else:
        output_dir_path = Path(pdfs_dir)

    output_dir_path.mkdir(parents=True, exist_ok=True)

    client_grobid.process(
        service="processFulltextDocument",
        input_path=pdfs_dir,
        output=str(output_dir_path),
        consolidate_header=True,
    )


def convert_tei_to_json(tei_path: str, paper_id: str | None = None) -> dict[str, Any]:
    from bs4 import BeautifulSoup

    if paper_id is None:
        paper_id = ".".join(Path(tei_path).stem.split(".")[:2])

    with open(tei_path, "rb") as f:
        xml_data = f.read()

    soup = BeautifulSoup(xml_data, "xml")
    paper = convert_xml_to_json(soup, paper_id, "")
    return paper.as_json()


def extract_sections_from_json(paper: dict[str, Any]) -> dict[str, Any]:
    sections = {
        "abstract": [],
        "body_text": [],
        "back_matter": [],
        "metadata": paper.get("metadata", {}),
    }

    for a in paper.get("abstract", []):
        sections["abstract"].append(a.get("text", ""))

    for para in paper.get("body_text", []):
        sections["body_text"].append(para)

    for para in paper.get("back_matter", []):
        sections["back_matter"].append(para)

    return sections


def ingest_paper_from_json(paper: dict[str, Any]) -> dict[str, str]:
    points = []
    parent_store = {}

    paper_id = paper.get("paper_id", "unknown")
    title = paper.get("metadata", {}).get("title", "Untitled")

    abstract_texts = [a.get("text", "") for a in paper.get("abstract", [])]
    abstract_text = " ".join([t for t in abstract_texts if t])

    if abstract_text:
        parent_id = f"{paper_id}_abstract"
        parent_store[parent_id] = abstract_text

        chunks = process_section([abstract_text])

        for i, chunk in enumerate(chunks):
            points.append(
                Document(
                    page_content=abstract_text,
                    metadata={
                        "id": str(uuid.uuid4()),
                        "paper_id": paper_id,
                        "title": title,
                        "section": "abstract",
                        "parent_id": parent_id,
                        "abstract_index": i,
                        "level": "child",
                    },
                )
            )

    sections = defaultdict(list)

    large_chunks = []

    for para in paper.get("body_text", []):
        sections[para.get("section", "unknown")].append(para.get("text", ""))

    for para in paper.get("back_matter", []):
        sections[para.get("section", "back_matter")].append(para.get("text", ""))

    for sec_name, paras in sections.items():
        parent_id = f"{paper_id}_{sec_name}"
        full_text = " ".join(paras)
        parent_store[parent_id] = full_text

        chunks = process_section(paras)
        # return

        # embedding_results = embeddings.encode(chunks)

        for i, chunk in enumerate(chunks):
            chunk_token_len = token_len(chunk)
            if chunk_token_len >= 300:
                large_chunks.append(
                    {
                        "token_len": chunk_token_len,
                        # "paper_id": paper_id,
                        "title": title,
                        "section": sec_name,
                        "chunk_index": i,
                        "chunk": chunk[:100],
                    }
                )
                # print(f'{parent_id}: {chunk_token_len}')

            points.append(
                Document(
                    page_content=chunk,
                    metadata={
                        "id": str(uuid.uuid4()),
                        "paper_id": paper_id,
                        "title": title,
                        "section": sec_name,
                        "parent_id": parent_id,
                        "chunk_index": i,
                        "level": "child",
                    },
                )
            )

    if large_chunks:
        save_to_json(
            f"./data/logs/large_chunks_{paper_id}.json",
            sorted(large_chunks, key=lambda i: i["token_len"], reverse=True),
        )

    try:
        if points:
            # vector_store_manager.create_collection(COLLECTION)
            # vector_store_manager.insert_points(COLLECTION, points)
            vector_store_manager.insert_documents(COLLECTION, points)
    except ResponseError as err:
        print(f"Error in {paper_id}: {err}")

    return parent_store


def ingest_xml(
    xml_path: str,
    output_dir: str | None = None,
    collection_name: str = "benchmark",
) -> dict[str, str]:
    global COLLECTION
    COLLECTION = collection_name
    print(f"Processing XML file: {xml_path}")

    # tei_path = process_pdf_with_grobid(pdf_path, output_dir)
    # print(f"  Generated TEI: {tei_path}")
    #

    paper = convert_tei_to_json(xml_path)
    json_path = xml_path.replace(".xml", ".json")

    save_to_json(json_path, paper)
    print(f"  Generated JSON: {json_path}")

    return ingest_paper_from_json(paper)


def ingest_pdfs_batch(
    pdfs_dir: str,
    output_dir: str | None = None,
    collection_name: str = "benchmark",
) -> list[dict[str, str]]:
    global COLLECTION
    COLLECTION = collection_name
    pdfs_path = Path(pdfs_dir)
    if not pdfs_path.exists():
        raise ValueError(f"PDFs directory not found: {pdfs_dir}")

    # process_pdfs_with_grobid(pdfs_dir, output_dir)

    xml_files = sorted(pdfs_path.glob("*.grobid.tei.xml"))
    results = []

    for i, file in enumerate(xml_files, start=1):
        print(f"\n[{i}/{len(xml_files)}] Processing: {file.name}")
        try:
            result = ingest_xml(str(file), output_dir, collection_name)
            results.append(result)
            print(f"  Done!")
        except Exception as e:
            print(f"  Error: {e}")

    return results
