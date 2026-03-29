
from langchain_core.documents import Document
from langchain_core.tools import create_retriever_tool
from langchain_qdrant import QdrantVectorStore

from src.ai.config import VECTORDB_URL
from src.ai.embeddings import embeddings
from src.utils.files import get_file_content

vector_store = None

def retriever_chain(chunks: list[Document], workspace_id: str):
    global vector_store
    try:
        vectorstore = QdrantVectorStore.from_documents(
            documents=chunks,
            embedding=embeddings,
            url=VECTORDB_URL,
            collection_name=workspace_id
        )
        print("Vector store initialized")
        vector_store = vectorstore
        return vectorstore
    except Exception as e:
        print(f"Error storing docs: {e}")
        raise Exception(e)
        # return False

def get_retriever():
    global vector_store
    try:
        if vector_store is None:
            print("No docs uploaded yet")
            dummy_doc = Document(
                page_content="No docs have been uploaded yet.",
                metadata={"source": "initialization"}
            )
            vector_store = retriever_chain([dummy_doc], "dummy")

        retriever = vector_store.as_retriever()
        print("Using existing vectorstore")

        description = get_file_content("./src/ai/description.txt", None)
        retriever_tool = create_retriever_tool(
            retriever,
            "retriever_user_uploaded_docs",
            f"Use this tool **only** to answer questions about: {description}\n"
             "Don't use this tool to answer anything else."
        )
        return retriever_tool
    except Exception as e:
        print(f"Error initializing retriever: {e}")
        raise Exception(e)
