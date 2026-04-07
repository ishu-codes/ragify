def serialize_workspace(workspace: dict) -> dict:
    return {
        "id": str(workspace["_id"]),
        "user_id": workspace["user_id"],
        "created_at": workspace["created_at"].isoformat(),
    }


def serialize_workspaces(workspaces: list[dict]) -> list[dict]:
    return [serialize_workspace(workspace) for workspace in workspaces]
