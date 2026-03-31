from datetime import datetime
from typing import List

from bson import ObjectId
from langchain_core.messages import BaseMessage

from src.config.db import db
from src.models.workspace import Session, Workspace


# ----- Workspace -----
async def get_workspaces(user_id: str):
    cursor = db["workspaces"].find({"user_id": user_id})
    results = await cursor.to_list(length=None)
    return [Workspace(**doc) for doc in results]

async def create_workspace(user_id: str):
    print("Workspace creation initiated")
    result = await db['workspaces'].insert_one({
        "user_id": user_id,
        "created_at": datetime.now()
    })
    print("Workspace created")
    return await get_workspace_by_id(result.inserted_id)

async def get_workspace_by_id(workspace_id: str):
    doc = await db['workspaces'].find_one({"_id": ObjectId(workspace_id)})
    return Workspace(**doc) if (doc is not None) else None


# ----- Session -----

async def create_session(workspace_id: str):
    result = await db['sessions'].insert_one({
        "workspace_id": workspace_id,
        "messages": [],
        "created_at": datetime.now()
    })
    return await get_session_by_id(result.inserted_id)

async def get_session_by_id(session_id: str):
    doc = await db['sessions'].find_one({"_id": ObjectId(session_id)})
    return Session(**doc) if (doc is not None) else None

async def update_messages(session_id: str, messages: List[BaseMessage]):
    await db['sessions'].update_one(
        {"_id": session_id},
        {"messages": messages}
    )
