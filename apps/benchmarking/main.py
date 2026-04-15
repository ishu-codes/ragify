from api.src.ai.embeddings import encode
from api.src.ai.llm import llm
from api.src.ai.reranker import rerank_docs
from api.src.ai.retriever import vector_store
from api.src.utils.json import load_json_file
from benchmarking.src.evaluator import Evaluator, RAGRetriever
from benchmarking.src.utils.config import load_config
from benchmarking.src.utils.logger import create_run_id, save_summary

config = load_config("configs/rerank.yaml")

retriever = RAGRetriever(encode, vector_store, reranker=rerank_docs)

evaluator = Evaluator(
    retriever,
    llm_generate=llm,
    # llm_judge=llm_judge_fn  # optional
)

queries = load_json_file("./data/queries.json")

# results = evaluator.run(queries, k=5)
# print(results)

def main():
    run_id = create_run_id(config.experiment_name)
    results = evaluator.run(queries, k=config.top_k, run_id=run_id)

    if config.save_results:
        save_summary(results, run_id)


if __name__ == "__main__":
    main()
