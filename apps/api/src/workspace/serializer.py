from .models import Session, UploadStatus, Workspace


def serialize_material(material: dict) -> dict:
    return {
        "id": material["id"],
        "name": material["name"],
        "kind": material["kind"],
        "size": material["size"],
        "mime_type": material["mime_type"],
        "storage_path": material["storage_path"],
        "created_at": material["created_at"],
    }


def serialize_upload_status_file(file: dict) -> dict:
    return {
        "id": file["id"],
        "name": file["name"],
        "kind": file["kind"],
        "size": file["size"],
        "mime_type": file["mime_type"],
        "storage_path": file["storage_path"],
        "status": file.get("status", "uploaded"),
        "error": file.get("error"),
        "created_at": file["created_at"],
    }


def serialize_upload_status(status: UploadStatus) -> dict:
    return {
        "id": str(status.id),
        "workspace_id": str(status.workspace_id),
        "user_id": str(status.user_id),
        "status": status.status,
        "files": [
            serialize_upload_status_file(file) for file in status.files
        ],
        "logs": status.logs,
        "created_at": status.created_at.isoformat(),
        "updated_at": status.updated_at.isoformat(),
        "completed_at": status.completed_at.isoformat()
        if status.completed_at is not None
        else None,
        "error": status.error,
    }


def serialize_workspace(workspace: Workspace) -> dict:
    return {
        "id": str(workspace.id),
        "user_id": str(workspace.user_id),
        "name": workspace.name,
        "description": workspace.description,
        "tags": workspace.tags,
        "materials": [
            serialize_material(material) for material in workspace.materials
        ],
        "created_at": workspace.created_at.isoformat(),
    }


def serialize_workspaces(workspaces: list[Workspace]) -> list[dict]:
    return [serialize_workspace(workspace) for workspace in workspaces]


def serialize_session(session: Session) -> dict:
    return {
        "id": str(session.id),
        "workspace_id": str(session.workspace_id),
        "name": session.name,
        "message_count": len(session.messages),
        "created_at": session.created_at.isoformat(),
    }


def serialize_sessions(sessions: list[Session]) -> list[dict]:
    return [serialize_session(session) for session in sessions]


def serialize_session_message(message: dict, index: int) -> dict:
    return {
        "id": f"msg-{index}",
        "role": "assistant" if message.get("type") == "ai" else "user",
        "content": message.get("data", {}).get("content", ""),
        "createdAt": message.get("data", {})
        .get("additional_kwargs", {})
        .get("created_at", ""),
    }


def serialize_session_messages(session: Session) -> dict:
    messages = session.messages
    return {
        "id": str(session.id),
        "workspace_id": str(session.workspace_id),
        "name": session.name,
        "created_at": session.created_at.isoformat(),
        "messages": [
            serialize_session_message(msg, i) for i, msg in enumerate(messages)
        ],
    }
