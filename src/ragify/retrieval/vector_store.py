from langchain_qdrant import QdrantVectorStore
from langchain_core.documents import Document
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

from src.ragify.retrieval.embedder import embeddings
from src.ragify.utils.config import VECTOR_SIZE, VECTORDB_URL


class VectorStoreManager:
    def __init__(
        self,
        url: str = VECTORDB_URL,
        api_key: str | None = None,
        vector_size: int = VECTOR_SIZE,
    ):
        self.url = url
        self.api_key = api_key
        self.vector_size = vector_size
        self._client = QdrantClient(url=url, api_key=api_key)
        self._stores: dict[str, QdrantVectorStore] = {}

    def create_collection(self, collection_name: str) -> None:
        if collection_name not in [
            c.name for c in self._client.get_collections().collections
        ]:
            self._client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=self.vector_size,
                    distance=Distance.COSINE,
                ),
            )

    def get_or_create(
        self,
        collection_name: str,
        documents: list[Document] | None = None,
    ) -> QdrantVectorStore:
        if collection_name in self._stores:
            return self._stores[collection_name]

        if documents:
            store = QdrantVectorStore.from_documents(
                documents=documents,
                embedding=embeddings.client,
                url=self.url,
                collection_name=collection_name,
            )
        else:
            store = QdrantVectorStore.from_existing_collection(
                embedding=embeddings.client,
                url=self.url,
                collection_name=collection_name,
            )

        self._stores[collection_name] = store
        return store

    def get(self, collection_name: str) -> QdrantVectorStore | None:
        return self._stores.get(collection_name)


vector_store_manager = VectorStoreManager()
