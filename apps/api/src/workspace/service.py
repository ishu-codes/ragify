import asyncio
import sys
from collections.abc import Callable
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

sys.path.insert(0, str(Path(__file__).resolve().parents[4]))

from bson.errors import InvalidId
from fastapi import HTTPException, UploadFile
from langchain_core.messages import AIMessage, HumanMessage, messages_from_dict

from src.utils.files import ensure_dir

from .repository import SessionRepository, UploadRepository, WorkspaceRepository
from .serializer import (
    serialize_session,
    serialize_session_messages,
    serialize_sessions,
    serialize_upload_status,
    serialize_workspace,
    serialize_workspaces,
)
from .utils import replace_extension

_magika = None


def _get_magika():
    global _magika
    if _magika is None:
        from magika import Magika

        _magika = Magika()
    return _magika


def _invalid_userId():
    raise HTTPException(status_code=400, detail="Invalid userId")


def _normalize_workspace_updates(name: str, description: str, tags: list[str]) -> dict:
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
    status = await UploadRepository.get_upload_status_by_id(status_id)
    if status is None:
        return

    logs = [
        *status.get("logs", []),
        {"message": message, "created_at": datetime.now(UTC).isoformat()},
    ]
    await UploadRepository.update_upload_status(status_id, {"logs": logs})
    _upload_log(status_id, message)


async def _set_file_status(
    status_id: str, file_id: str, next_status: str, error: str | None = None
):
    status = await UploadRepository.get_upload_status_by_id(status_id)
    if status is None:
        return

    next_files = []
    for file in status.get("files", []):
        if file["id"] == file_id:
            next_files.append({**file, "status": next_status, "error": error})
        else:
            next_files.append(file)

    await UploadRepository.update_upload_status(status_id, {"files": next_files})


async def _ensure_workspace_access(workspace_id: str, user_id: str):
    try:
        workspace = await WorkspaceRepository.get_workspace_by_id(workspace_id)
    except InvalidId as exc:
        raise HTTPException(
            status_code=404, detail="Workspace could not be found"
        ) from exc

    if workspace is None:
        raise HTTPException(status_code=404, detail="Workspace could not be found")

    if workspace["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Workspace access denied")

    return workspace


def _group_files_by_type(files: list[dict]) -> dict[str, list[dict]]:
    files_by_type: dict[str, list[dict]] = {}
    for file in files:
        files_by_type.setdefault(file["kind"], []).append(file)
    return files_by_type


def _read_markdown_file(storage_path: str) -> str:
    from src.utils.files import get_file_content

    content = get_file_content(storage_path)
    if not content:
        raise ValueError("File is empty")
    return content


def _convert_file_to_markdown(storage_path: str) -> str:
    from src.ragify.ingestion.transcoder import transcoder

    content = transcoder.convert_to_markdown(storage_path)
    if not content:
        raise ValueError("No valid content extracted")
    return content


async def _process_pdf_files(
    status_id: str, workspace_id: str, upload_dir: str, files: list[dict]
) -> tuple[int, int]:
    from src.ragify.ingestion.grobid_ingestion import GrobidIngestor

    try:
        ingestor = GrobidIngestor(workspace_id, upload_dir)
        ingestor.ingest()

        # PDFs processed successfully - update all PDF file statuses
        for file in files:
            await _set_file_status(status_id, file["id"], "completed")
            await _append_upload_log(
                status_id, f"Successfully processed PDF: {file['name']}"
            )
        return len(files), 0

    except Exception as exc:
        # Grobid processing failed - mark all PDFs as failed
        error_msg = str(exc)
        for file in files:
            await _set_file_status(status_id, file["id"], "failed", error_msg)
            await _append_upload_log(
                status_id,
                f"Failed to process PDF {file['name']}: {error_msg}",
            )
        return 0, len(files)


async def _process_text_files(
    status_id: str,
    workspace_id: str,
    files: list[dict],
    *,
    read_content: Callable[[str], str],
    chunk_type: str,
    file_label: str,
) -> tuple[int, int]:
    from langchain_core.documents import Document

    from src.ragify.ingestion.chunk_processor import process_section
    from src.ragify.retrieval import vector_store_manager

    successful_count = 0
    failed_count = 0

    for file in files:
        try:
            content = read_content(file["storage_path"])

            chunks = process_section([content])
            file_chunks = [
                Document(
                    page_content=chunk,
                    metadata={
                        "source": file["name"],
                        "chunk": i,
                        "chunk_type": chunk_type,
                    },
                )
                for i, chunk in enumerate(chunks)
            ]

            # Index chunks
            vector_store_manager.insert_documents(workspace_id, file_chunks)

            await _set_file_status(status_id, file["id"], "completed")
            await _append_upload_log(
                status_id,
                f"Successfully processed {file_label} file: {file['name']} ({len(chunks)} chunks)",
            )
            successful_count += 1

        except Exception as exc:
            await _set_file_status(status_id, file["id"], "failed", str(exc))
            await _append_upload_log(
                status_id,
                f"Failed to process {file_label} file {file['name']}: {exc}",
            )
            failed_count += 1

    return successful_count, failed_count


async def _finalize_upload_status(
    status_id: str, successful_count: int, failed_count: int
):
    if successful_count > 0:
        await UploadRepository.update_upload_status(
            status_id,
            {
                "status": "completed",
                "completed_at": datetime.now(UTC),
                "error": None,
            },
        )
        await _append_upload_log(
            status_id,
            f"Upload completed: {successful_count} file(s) processed successfully, {failed_count} failed",
        )
    elif failed_count > 0:
        await UploadRepository.update_upload_status(
            status_id,
            {
                "status": "failed",
                "completed_at": datetime.now(UTC),
                "error": f"All files failed to process. {failed_count} file(s) failed.",
            },
        )
        await _append_upload_log(
            status_id,
            f"Upload failed: all {failed_count} file(s) failed to process",
        )
    else:
        await UploadRepository.update_upload_status(
            status_id,
            {
                "status": "failed",
                "completed_at": datetime.now(UTC),
                "error": "No files were processed",
            },
        )
        await _append_upload_log(status_id, "Upload failed: no files were processed")


async def _process_uploaded_files(status_id: str, workspace_id: str, upload_dir: str):
    status = await UploadRepository.get_upload_status_by_id(status_id)
    if status is None:
        return

    await UploadRepository.update_upload_status(
        status_id, {"status": "processing", "error": None}
    )
    await _append_upload_log(status_id, "Starting background file processing")

    successful_count = 0
    failed_count = 0

    for file_type, files in _group_files_by_type(status.get("files", [])).items():
        await _append_upload_log(
            status_id, f"Processing {len(files)} {file_type} file(s)"
        )

        if file_type == "pdf":
            successful, failed = await _process_pdf_files(
                status_id, workspace_id, upload_dir, files
            )
        elif file_type == "md":
            successful, failed = await _process_text_files(
                status_id,
                workspace_id,
                files,
                read_content=_read_markdown_file,
                chunk_type="markdown",
                file_label="markdown",
            )
        else:
            successful, failed = await _process_text_files(
                status_id,
                workspace_id,
                files,
                read_content=_convert_file_to_markdown,
                chunk_type=file_type or "file",
                file_label=file_type,
            )

        successful_count += successful
        failed_count += failed

    await _finalize_upload_status(status_id, successful_count, failed_count)


# Workspace Service


class WorkspaceService:
    @staticmethod
    async def get_workspaces(user_id: str):
        if not user_id:
            _invalid_userId()

        workspaces = await WorkspaceRepository.get_all_workspaces(user_id)
        return serialize_workspaces(workspaces)

    @staticmethod
    async def get_workspace(workspace_id: str, user_id: str):
        workspace = await _ensure_workspace_access(workspace_id, user_id)
        return serialize_workspace(workspace)

    @staticmethod
    async def create_workspace(user_id: str):
        if not user_id:
            _invalid_userId()

        workspace = await WorkspaceRepository.create_new_workspace(user_id)
        print(workspace)
        if workspace:
            from src.ragify.retrieval import vector_store_manager

            vector_store_manager.create_collection(workspace["_id"])
        return serialize_workspace(workspace)

    @staticmethod
    async def update_workspace_details(
        workspace_id: str, user_id: str, name: str, description: str, tags: list[str]
    ):
        await _ensure_workspace_access(workspace_id, user_id)
        workspace = await WorkspaceRepository.update_workspace(
            workspace_id, _normalize_workspace_updates(name, description, tags)
        )
        return serialize_workspace(workspace)

    @staticmethod
    async def remove_workspace(workspace_id: str, user_id: str):
        await _ensure_workspace_access(workspace_id, user_id)
        await WorkspaceRepository.delete_workspace(workspace_id)
        await WorkspaceRepository.delete_workspace_sessions(workspace_id)

        upload_dir = _workspace_upload_dir(workspace_id)
        if upload_dir.exists():
            for child in upload_dir.iterdir():
                if child.is_file():
                    child.unlink()
            upload_dir.rmdir()

        return {"id": workspace_id}

    @staticmethod
    async def query_rag(
        workspace_id: str, user_id: str, session_id: str | None, query: str
    ):
        await _ensure_workspace_access(workspace_id, user_id)

        if not session_id:
            session = await SessionRepository.create_session(workspace_id)
        else:
            session = await SessionRepository.get_session_by_id(session_id)

        if session is None:
            raise HTTPException(status_code=404, detail="Session could not be found")

        chat_messages = messages_from_dict(session.get("messages", []))
        chat_messages.append(HumanMessage(content=query))

        from src.ragify.generation import builder

        result = builder.invoke(
            {"messages": chat_messages, "workspace_id": workspace_id}
        )
        output_text = result["messages"][-1].content
        chat_messages.append(AIMessage(content=output_text))

        await SessionRepository.update_messages(str(session["_id"]), chat_messages)
        return {
            "session_id": str(session["_id"]),
            "session_name": session.get("name", "Untitled Session"),
            "created_at": session["created_at"].isoformat(),
            "answer": output_text,
        }


# Session Service


class SessionService:
    @staticmethod
    async def get_workspace_sessions(workspace_id: str, user_id: str):
        await _ensure_workspace_access(workspace_id, user_id)
        sessions = await SessionRepository.get_sessions_by_workspace_id(workspace_id)
        return serialize_sessions(sessions)

    @staticmethod
    async def get_session_messages(workspace_id: str, session_id: str, user_id: str):
        await _ensure_workspace_access(workspace_id, user_id)

        session = await SessionRepository.get_session_by_id(session_id)
        if session is None or session["workspace_id"] != workspace_id:
            raise HTTPException(status_code=404, detail="Session could not be found")

        return serialize_session_messages(session)

    @staticmethod
    async def rename_session(
        workspace_id: str, session_id: str, user_id: str, name: str
    ):
        await _ensure_workspace_access(workspace_id, user_id)

        normalized_name = name.strip()
        if not normalized_name:
            raise HTTPException(status_code=400, detail="Session name is required")

        session = await SessionRepository.get_session_by_id(session_id)
        if session is None or session["workspace_id"] != workspace_id:
            raise HTTPException(status_code=404, detail="Session could not be found")

        session = await SessionRepository.update_session(
            session_id, {"name": normalized_name}
        )
        return serialize_session(session)

    @staticmethod
    async def remove_session(workspace_id: str, session_id: str, user_id: str):
        await _ensure_workspace_access(workspace_id, user_id)

        session = await SessionRepository.get_session_by_id(session_id)
        if session is None or session["workspace_id"] != workspace_id:
            raise HTTPException(status_code=404, detail="Session could not be found")

        await SessionRepository.delete_session(session_id)
        return {"id": session_id}

    @staticmethod
    async def remove_all_sessions(workspace_id: str, user_id: str):
        await _ensure_workspace_access(workspace_id, user_id)
        await WorkspaceRepository.delete_workspace_sessions(workspace_id)
        return {"workspace_id": workspace_id}


# Upload Service


class UploadService:
    @staticmethod
    async def get_upload_status(workspace_id: str, status_id: str, user_id: str):
        await _ensure_workspace_access(workspace_id, user_id)
        status = await UploadRepository.get_upload_status_by_id(status_id)

        if (
            status is None
            or status["workspace_id"] != workspace_id
            or status["user_id"] != user_id
        ):
            raise HTTPException(
                status_code=404, detail="Upload status could not be found"
            )

        return serialize_upload_status(status)

    @staticmethod
    async def determine_type_and_save_doc(file: UploadFile, upload_dir: Path):
        try:
            if not file.filename:
                return None

            file_id = str(uuid4())
            file_bytes = await file.read()

            magika_result = _get_magika().identify_bytes(file_bytes)
            mime_type = (
                magika_result.output.mime_type
                if magika_result.ok
                else "application/octet-stream"
            )
            # file_extension = replace_extension(file.filename, mime_type)
            filename = replace_extension(file.filename, mime_type)

            target_path = upload_dir / f"{file_id}-{filename}"
            target_path.write_bytes(file_bytes)

            return {
                "id": file_id,
                "name": filename,
                "kind": Path(filename).suffix.lower().lstrip(".") or "file",
                "size": len(file_bytes),
                "mime_type": mime_type,
                "storage_path": str(target_path),
                "status": "uploaded",
                "error": None,
                "created_at": datetime.now(UTC).isoformat(),
            }
        except Exception as err:
            print(f"[upload] failed receiving {file.filename}: {err}")

    @staticmethod
    async def upload_docs(
        workspace_id: str, user_id: str, files: list[UploadFile] | None
    ):
        await _ensure_workspace_access(workspace_id, user_id)

        if not files:
            raise HTTPException(status_code=400, detail="No documents provided")

        upload_dir = _workspace_upload_dir(workspace_id)
        ensure_dir(str(upload_dir))

        # material_records = filter(
        #     lambda record: record is not None,
        #     run_in_threads(
        #         lambda file: await UploadService.determine_type_and_save_doc(
        #             file, upload_dir
        #         ),
        #         files
        #     )
        # )
        material_records = list(
            filter(
                None,
                await asyncio.gather(
                    *(
                        UploadService.determine_type_and_save_doc(f, upload_dir)
                        for f in files
                    )
                ),
            )
        )

        if not material_records:
            raise HTTPException(
                status_code=400, detail="No files were uploaded successfully"
            )

        status = await UploadRepository.create_upload_status(
            workspace_id, user_id, material_records
        )
        status_id = str(status["_id"])
        await _append_upload_log(
            status_id, f"Received {len(material_records)} files from client"
        )
        asyncio.create_task(
            _process_uploaded_files(status_id, workspace_id, str(upload_dir))
        )

        return {
            "status_id": status_id,
            "message": f"Uploaded {len(material_records)} files. Processing started.",
        }
