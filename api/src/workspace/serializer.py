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


def serialize_upload_status(status: dict) -> dict:
    return {
        "id": str(status["_id"]),
        "workspace_id": status["workspace_id"],
        "user_id": status["user_id"],
        "status": status["status"],
        "files": [
            serialize_upload_status_file(file) for file in status.get("files", [])
        ],
        "logs": status.get("logs", []),
        "created_at": status["created_at"].isoformat(),
        "updated_at": status["updated_at"].isoformat(),
        "completed_at": status["completed_at"].isoformat()
        if status.get("completed_at")
        else None,
        "error": status.get("error"),
    }


def serialize_workspace(workspace: dict) -> dict:
    return {
        "id": str(workspace["_id"]),
        "user_id": workspace["user_id"],
        "name": workspace.get("name", "Untitled Workspace"),
        "description": workspace.get("description", ""),
        "tags": workspace.get("tags", []),
        "materials": [
            serialize_material(material) for material in workspace.get("materials", [])
        ],
        "created_at": workspace["created_at"].isoformat(),
    }


def serialize_workspaces(workspaces: list[dict]) -> list[dict]:
    return [serialize_workspace(workspace) for workspace in workspaces]


def serialize_session(session: dict) -> dict:
    return {
        "id": str(session["_id"]),
        "workspace_id": session["workspace_id"],
        "name": session.get("name", "Untitled Session"),
        "message_count": len(session.get("messages", [])),
        "created_at": session["created_at"].isoformat(),
    }


def serialize_sessions(sessions: list[dict]) -> list[dict]:
    return [serialize_session(session) for session in sessions]
