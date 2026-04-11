from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

from src.ai.config import VECTOR_SIZE, VECTORDB_URL
from src.ai.embeddings import embeddings


def create_vector_collection(
    collection_name: str,
    url: str = VECTORDB_URL,
    api_key: str | None = None,
    vector_size: int = VECTOR_SIZE
):
    client = QdrantClient(url=url, api_key=api_key)

    if collection_name not in [c.name for c in client.get_collections().collections]:
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(
                size=vector_size,
                distance=Distance.COSINE,
            ),
        )
        print(f"Collection created: {collection_name}")
    else:
        print(f"Collection already exists: {collection_name}")


    return QdrantVectorStore(
        client=client,
        collection_name=collection_name,
        embedding=embeddings,
    )
