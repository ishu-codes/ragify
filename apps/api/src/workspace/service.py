import asyncio
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import List
from uuid import uuid4

from bson.errors import InvalidId
from fastapi import HTTPException, UploadFile
from langchain_core.documents import Document
from langchain_core.messages import AIMessage, HumanMessage, messages_from_dict

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent.parent))

from src.ragify.generation import builder
from src.ragify.ingestion import ingestion, transcoder
from src.ragify.retrieval import get_retriever, vector_store_manager
from src.utils.files import ensure_dir

from .repository import (
    append_workspace_materials,
    create_new_workspace,
    create_session,
    create_upload_status,
    delete_session,
    delete_workspace,
    delete_workspace_sessions,
    get_all_workspaces,
    get_session_by_id,
    get_sessions_by_workspace_id,
    get_upload_status_by_id,
    get_workspace_by_id,
    update_messages,
    update_session,
    update_upload_status,
    update_workspace,
)
from .serializer import (
    serialize_session,
    serialize_session_messages,
    serialize_sessions,
    serialize_upload_status,
    serialize_workspace,
    serialize_workspaces,
)


def _invalid_userId():
    raise HTTPException(status_code=400, detail="Invalid userId")


def _normalize_workspace_updates(name: str, description: str, tags: List[str]) -> dict:
    normalized_name = name.strip()
    if not normalized_name:
        raise HTTPException(status_code=400, detail="Workspace name is required")

    return {
        "name": normalized_name,
        "description": description.strip(),
        "tags": [tag.strip() for tag in tags if tag.strip()],
    }


def _workspace_upload_dir(workspace_id: str) -> Path:
    return Path(__file__).resolve().parents[2] / "storage" / "workspaces" / workspace_id


def _upload_log(status_id: str, message: str):
    print(f"[upload:{status_id}] {message}")


async def _append_upload_log(status_id: str, message: str):
    status = await get_upload_status_by_id(status_id)
    if status is None:
        return

    logs = [
        *status.get("logs", []),
        {"message": message, "created_at": datetime.now(UTC).isoformat()},
    ]
    await update_upload_status(status_id, {"logs": logs})
    _upload_log(status_id, message)


async def _set_file_status(
    status_id: str, file_id: str, next_status: str, error: str | None = None
):
    status = await get_upload_status_by_id(status_id)
    if status is None:
        return

    next_files = []
    for file in status.get("files", []):
        if file["id"] == file_id:
            next_files.append({**file, "status": next_status, "error": error})
        else:
            next_files.append(file)

    await update_upload_status(status_id, {"files": next_files})


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


async def _process_uploaded_files(status_id: str, workspace_id: str):
    status = await get_upload_status_by_id(status_id)
    if status is None:
        return

    all_chunks: list[Document] = []
    successful_materials: list[dict] = []

    await update_upload_status(status_id, {"status": "processing", "error": None})
    await _append_upload_log(status_id, "Starting background file processing")

    for file in status.get("files", []):
        file_name = file["name"]
        file_path = file["storage_path"]
        file_kind = file["kind"]

        await _set_file_status(status_id, file["id"], "processing")
        await _append_upload_log(status_id, f"Processing {file_name}")

        try:
            suffix = Path(file_path).suffix.lower()
            if suffix == ".pdf":
                await _append_upload_log(
                    status_id, f"Parsing PDF into markdown for {file_name}"
                )
            elif suffix == ".md":
                await _append_upload_log(
                    status_id, f"Reading markdown content for {file_name}"
                )
            else:
                await _append_upload_log(
                    status_id,
                    f"Converting {file_kind or 'file'} into markdown for {file_name}",
                )

            content = transcoder.convert_to_markdown(file_path)
            if not content:
                await _set_file_status(
                    status_id, file["id"], "failed", "No valid content extracted"
                )
                await _append_upload_log(
                    status_id, f"Skipping {file_name}: no valid content extracted"
                )
                continue

            chunks = ingester.split_text(content)
            for i, chunk in enumerate(chunks):
                all_chunks.append(
                    Document(
                        page_content=chunk, metadata={"source": file_name, "chunk": i}
                    )
                )

            successful_materials.append(
                {k: v for k, v in file.items() if k not in {"status", "error"}}
            )
            await _set_file_status(status_id, file["id"], "completed")
            await _append_upload_log(
                status_id, f"Processed {file_name} into {len(chunks)} chunks"
            )
        except Exception as exc:
            await _set_file_status(status_id, file["id"], "failed", str(exc))
            await _append_upload_log(status_id, f"Failed processing {file_name}: {exc}")

    if not all_chunks:
        await update_upload_status(
            status_id,
            {
                "status": "failed",
                "completed_at": datetime.now(UTC),
                "error": "No valid content found in uploaded documents",
            },
        )
        await _append_upload_log(
            status_id, "Upload failed: no valid content found in uploaded documents"
        )
        return

    try:
        await _append_upload_log(
            status_id, f"Indexing {len(all_chunks)} chunks into vector database"
        )
        ingester.index_documents(all_chunks, workspace_id)
        await append_workspace_materials(workspace_id, successful_materials)
        await update_upload_status(
            status_id,
            {
                "status": "completed",
                "completed_at": datetime.now(UTC),
                "error": None,
            },
        )
        await _append_upload_log(
            status_id,
            f"Finished processing {len(successful_materials)} files successfully",
        )
    except Exception as exc:
        await update_upload_status(
            status_id,
            {
                "status": "failed",
                "completed_at": datetime.now(UTC),
                "error": str(exc),
            },
        )
        await _append_upload_log(
            status_id, f"Upload failed while storing vectors: {exc}"
        )


async def get_workspaces(user_id: str):
    if not user_id:
        _invalid_userId()

    workspaces = await get_all_workspaces(user_id)
    return serialize_workspaces(workspaces)


async def get_workspace(workspace_id: str, user_id: str):
    workspace = await _ensure_workspace_access(workspace_id, user_id)
    return serialize_workspace(workspace)


async def create_workspace(user_id: str):
    if not user_id:
        _invalid_userId()

    workspace = await create_new_workspace(user_id)
    print(workspace)
    if workspace:
        vector_store_manager.create_collection(workspace["_id"])
    return serialize_workspace(workspace)


async def update_workspace_details(
    workspace_id: str, user_id: str, name: str, description: str, tags: List[str]
):
    await _ensure_workspace_access(workspace_id, user_id)
    workspace = await update_workspace(
        workspace_id, _normalize_workspace_updates(name, description, tags)
    )
    return serialize_workspace(workspace)


async def remove_workspace(workspace_id: str, user_id: str):
    await _ensure_workspace_access(workspace_id, user_id)
    await delete_workspace(workspace_id)
    await delete_workspace_sessions(workspace_id)

    upload_dir = _workspace_upload_dir(workspace_id)
    if upload_dir.exists():
        for child in upload_dir.iterdir():
            if child.is_file():
                child.unlink()
        upload_dir.rmdir()

    return {"id": workspace_id}


async def get_workspace_sessions(workspace_id: str, user_id: str):
    await _ensure_workspace_access(workspace_id, user_id)
    sessions = await get_sessions_by_workspace_id(workspace_id)
    return serialize_sessions(sessions)


async def get_session_messages(workspace_id: str, session_id: str, user_id: str):
    await _ensure_workspace_access(workspace_id, user_id)

    session = await get_session_by_id(session_id)
    if session is None or session["workspace_id"] != workspace_id:
        raise HTTPException(status_code=404, detail="Session could not be found")

    return serialize_session_messages(session)


async def get_upload_status(workspace_id: str, status_id: str, user_id: str):
    await _ensure_workspace_access(workspace_id, user_id)
    status = await get_upload_status_by_id(status_id)

    if (
        status is None
        or status["workspace_id"] != workspace_id
        or status["user_id"] != user_id
    ):
        raise HTTPException(status_code=404, detail="Upload status could not be found")

    return serialize_upload_status(status)


async def rename_session(workspace_id: str, session_id: str, user_id: str, name: str):
    await _ensure_workspace_access(workspace_id, user_id)

    normalized_name = name.strip()
    if not normalized_name:
        raise HTTPException(status_code=400, detail="Session name is required")

    session = await get_session_by_id(session_id)
    if session is None or session["workspace_id"] != workspace_id:
        raise HTTPException(status_code=404, detail="Session could not be found")

    session = await update_session(session_id, {"name": normalized_name})
    return serialize_session(session)


async def remove_session(workspace_id: str, session_id: str, user_id: str):
    await _ensure_workspace_access(workspace_id, user_id)

    session = await get_session_by_id(session_id)
    if session is None or session["workspace_id"] != workspace_id:
        raise HTTPException(status_code=404, detail="Session could not be found")

    await delete_session(session_id)
    return {"id": session_id}


async def remove_all_sessions(workspace_id: str, user_id: str):
    await _ensure_workspace_access(workspace_id, user_id)
    await delete_workspace_sessions(workspace_id)
    return {"workspace_id": workspace_id}


async def upload_docs(workspace_id: str, user_id: str, files: List[UploadFile] | None):
    await _ensure_workspace_access(workspace_id, user_id)

    if not files:
        raise HTTPException(status_code=400, detail="No documents provided")

    upload_dir = _workspace_upload_dir(workspace_id)
    ensure_dir(str(upload_dir))
    material_records = []

    for upload in files:
        try:
            if not upload.filename:
                continue

            file_id = str(uuid4())
            target_path = upload_dir / f"{file_id}-{upload.filename}"
            file_bytes = await upload.read()
            target_path.write_bytes(file_bytes)

            material_records.append(
                {
                    "id": file_id,
                    "name": upload.filename,
                    "kind": Path(upload.filename).suffix.lower().lstrip(".") or "file",
                    "size": len(file_bytes),
                    "mime_type": upload.content_type or "application/octet-stream",
                    "storage_path": str(target_path),
                    "status": "uploaded",
                    "error": None,
                    "created_at": datetime.now(UTC).isoformat(),
                }
            )
        except Exception as exc:
            print(f"[upload] failed receiving {upload.filename}: {exc}")

    if not material_records:
        raise HTTPException(
            status_code=400, detail="No files were uploaded successfully"
        )

    status = await create_upload_status(workspace_id, user_id, material_records)
    status_id = str(status["_id"])
    await _append_upload_log(
        status_id, f"Received {len(material_records)} files from client"
    )
    asyncio.create_task(_process_uploaded_files(status_id, workspace_id))

    return {
        "status_id": status_id,
        "message": f"Uploaded {len(material_records)} files. Processing started.",
    }


async def query_rag(
    workspace_id: str, user_id: str, session_id: str | None, query: str
):
    await _ensure_workspace_access(workspace_id, user_id)

    if not session_id:
        session = await create_session(workspace_id)
    else:
        session = await get_session_by_id(session_id)

    if session is None:
        raise HTTPException(status_code=404, detail="Session could not be found")

    chat_messages = messages_from_dict(session.get("messages", []))
    chat_messages.append(HumanMessage(content=query))

    result = builder.invoke({"messages": chat_messages, "workspace_id": workspace_id})
    output_text = result["messages"][-1].content
    chat_messages.append(AIMessage(content=output_text))

    await update_messages(str(session["_id"]), chat_messages)
    return {
        "session_id": str(session["_id"]),
        "session_name": session.get("name", "Untitled Session"),
        "created_at": session["created_at"].isoformat(),
        "answer": output_text,
    }
