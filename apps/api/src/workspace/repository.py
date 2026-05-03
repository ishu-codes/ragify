from datetime import UTC, datetime
from typing import List

from bson import ObjectId
from langchain_core.messages import BaseMessage
from langchain_core.messages.base import message_to_dict

from ..config.db import db

# ----- Workspace -----


async def get_workspace_by_id(workspace_id: str):
    return await db["workspaces"].find_one({"_id": ObjectId(workspace_id)})
    # return Workspace(**doc) if (doc is not None) else None


async def get_all_workspaces(user_id: str):
    cursor = db["workspaces"].find({"user_id": user_id})
    return await cursor.to_list(length=None)


async def create_new_workspace(user_id: str):
    result = await db["workspaces"].insert_one(
        {
            "user_id": user_id,
            "name": "Untitled Workspace",
            "description": "",
            "tags": [],
            "materials": [],
            "created_at": datetime.now(),
        }
    )
    return await get_workspace_by_id(result.inserted_id)
    # return {
    #     "id": result.inserted_id,
    #     "user_id": user_id,
    #     "created_at": datetime.now()
    # }


async def update_workspace(workspace_id: str, updates: dict):
    await db["workspaces"].update_one(
        {"_id": ObjectId(workspace_id)},
        {"$set": updates},
    )
    return await get_workspace_by_id(workspace_id)


async def append_workspace_materials(workspace_id: str, materials: list[dict]):
    await db["workspaces"].update_one(
        {"_id": ObjectId(workspace_id)},
        {"$push": {"materials": {"$each": materials}}},
    )
    return await get_workspace_by_id(workspace_id)


async def delete_workspace(workspace_id: str):
    await db["workspaces"].delete_one({"_id": ObjectId(workspace_id)})


async def delete_workspace_sessions(workspace_id: str):
    await db["sessions"].delete_many({"workspace_id": workspace_id})


# ----- Session -----


async def get_session_by_id(session_id: str):
    return await db["sessions"].find_one({"_id": ObjectId(session_id)})
    # return Session(**doc) if (doc is not None) else None


async def get_sessions_by_workspace_id(workspace_id: str):
    cursor = db["sessions"].find({"workspace_id": workspace_id}).sort("created_at", -1)
    return await cursor.to_list(length=None)


async def create_session(workspace_id: str):
    result = await db["sessions"].insert_one(
        {
            "workspace_id": workspace_id,
            "name": "Untitled Session",
            "messages": [],
            "created_at": datetime.now(),
        }
    )
    return await get_session_by_id(result.inserted_id)


async def update_session(session_id: str, updates: dict):
    updates["updated_at"] = datetime.now(UTC).isoformat()
    await db["sessions"].update_one(
        {"_id": ObjectId(session_id)},
        {"$set": updates},
    )
    return await get_session_by_id(session_id)


async def delete_session(session_id: str):
    await db["sessions"].delete_one({"_id": ObjectId(session_id)})


async def update_messages(session_id: str, messages: List[BaseMessage]):
    return await db["sessions"].update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"messages": [message_to_dict(message) for message in messages]}},
    )


# ----- Upload Status -----


async def create_upload_status(workspace_id: str, user_id: str, files: list[dict]):
    now = datetime.now(UTC)
    result = await db["upload_statuses"].insert_one(
        {
            "workspace_id": workspace_id,
            "user_id": user_id,
            "status": "uploaded",
            "files": files,
            "logs": [],
            "created_at": now,
            "updated_at": now,
            "completed_at": None,
            "error": None,
        }
    )
    return await get_upload_status_by_id(str(result.inserted_id))


async def get_upload_status_by_id(status_id: str):
    return await db["upload_statuses"].find_one({"_id": ObjectId(status_id)})


async def update_upload_status(status_id: str, updates: dict):
    updates["updated_at"] = datetime.now(UTC)
    await db["upload_statuses"].update_one(
        {"_id": ObjectId(status_id)}, {"$set": updates}
    )
    return await get_upload_status_by_id(status_id)
