from typing import List

from bson.errors import InvalidId
from fastapi import HTTPException
from langchain_core.documents import Document
from langchain_core.messages import AIMessage, HumanMessage
from langchain_text_splitters import RecursiveCharacterTextSplitter

from src.ai.config import MAX_TOKENS, OVERLAP
from src.ai.graph_builder import builder
from src.ai.retriever import retriever_chain
from src.utils.files import get_file_content
from src.workspace.utils import ensure_md

from .repository import (
    create_new_workspace,
    get_all_workspaces,
    create_session,
    get_session_by_id,
    get_workspace_by_id,
    update_messages,
)
from .serializer import serialize_workspace, serialize_workspaces


def _invalid_userId():
    raise HTTPException(status_code=400, detail="Invalid userId")


async def _ensure_workspace_access(workspace_id: str, user_id: str):
    try:
        workspace = await get_workspace_by_id(workspace_id)
    except InvalidId as exc:
        raise HTTPException(
            status_code=404, detail="Workspace could not be found"
        ) from exc

    if workspace is None:
        raise HTTPException(status_code=404, detail="Workspace could not be found")

    if workspace["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Workspace access denied")

    return workspace


async def get_workspaces(user_id: str):
    if not user_id:
        _invalid_userId()

    workspaces = await get_all_workspaces(user_id)
    return serialize_workspaces(workspaces)


async def create_workspace(user_id: str):
    if not user_id:
        _invalid_userId()

    workspace = await create_new_workspace(user_id)
    return serialize_workspace(workspace)


async def upload_docs(
    workspace_id: str, user_id: str, session_id: str, docs: List[str] | None
):
    await _ensure_workspace_access(workspace_id, user_id)

    if not docs:
        raise HTTPException(status_code=400, detail="No documents provided")

    all_chunks = []
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=MAX_TOKENS,
        chunk_overlap=OVERLAP,
    )

    for doc_path in docs:
        try:
            content_path = ensure_md(doc_path)
            content = get_file_content(content_path)
            if not content:
                print(f"Skipping empty or missing file: {content_path}")
                continue

            # Chunk content
            chunks = text_splitter.split_text(content)
            for i, chunk in enumerate(chunks):
                all_chunks.append(
                    Document(
                        page_content=chunk, metadata={"source": doc_path, "chunk": i}
                    )
                )
        except Exception as e:
            print(f"Error processing document {doc_path}: {e}")
            continue

    if not all_chunks:
        raise HTTPException(
            status_code=400, detail="No valid content found in documents"
        )

    try:
        # Store in vector database
        retriever_chain(all_chunks, workspace_id)
        return f"Successfully processed {len(docs)} documents into {len(all_chunks)} chunks"

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to store documents in vector DB: {str(e)}"
        )


async def query_rag(
    workspace_id: str, user_id: str, session_id: str | None, query: str
):
    await _ensure_workspace_access(workspace_id, user_id)

    if session_id is None:
        session = await create_session(workspace_id)
    else:
        session = await get_session_by_id(session_id)

    if session is None:
        raise HTTPException(status_code=404, detail="Session could not be found")

    chat_messages = session.messages if (session is not None) else []
    chat_messages.append(HumanMessage(content=query))

    result = builder.invoke({"messages": chat_messages, "workspace_id": workspace_id})
    output_text = result["messages"][-1].content
    chat_messages.append(AIMessage(content=output_text))

    await update_messages(session.id, chat_messages)
    return {"result": result["messages"][-1]}
