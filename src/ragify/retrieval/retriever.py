from typing import Optional

from langchain_core.documents import Document
from langchain_core.tools import create_retriever_tool

# from src.ragify.retrieval.embedder import embeddings
from src.ragify.retrieval.vector_store import vector_store_manager


class RetrieverTool:
    def __init__(self, workspace_id: Optional[str] = None):
        self.workspace_id = workspace_id
        self._tool = None
        self._initialize()

    def _initialize(self):
        if self.workspace_id:
            vector_store = vector_store_manager.get_or_create(self.workspace_id)
        else:
            vector_store = vector_store_manager.get_or_create(
                "dummy",
                documents=[
                    Document(
                        page_content="No docs have been uploaded yet.",
                        metadata={"source": "initialization"},
                    )
                ],
            )
        retriever = vector_store.as_retriever()
        self._tool = create_retriever_tool(
            retriever,
            "retriever_user_uploaded_docs",
            "Use this tool **only** to answer questions about user-uploaded documents.",
        )

    @property
    def tool(self):
        return self._tool

    def invoke(self, query: str, k: int = 4) -> list[Document]:
        if self._tool is None:
            return []
        return self._tool.invoke(query, k=k)

    def retrieve(self, query: str, k: int = 4) -> list[Document]:
        return self.invoke(query, k)


def get_retriever(workspace_id: str | None = None):
    retriever_tool = RetrieverTool(workspace_id=workspace_id)
    return retriever_tool.tool
