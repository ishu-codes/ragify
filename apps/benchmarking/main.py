from src.ragify.retrieval import embeddings, vector_store_manager
from src.ragify.reranking import reranker
from src.ragify.generation import llm


def get_vector_store(collection_name: str = "benchmark"):
    return vector_store_manager.get_or_create(collection_name)


retriever = RAGRetriever(embeddings.encode, get_vector_store, reranker=reranker.rerank)

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
