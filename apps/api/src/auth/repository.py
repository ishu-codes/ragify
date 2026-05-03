# import sys
# from pathlib import Path

from bson import ObjectId
from bson.errors import InvalidId

# sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent.parent))
from ..config.db import db


async def find_user_by_id(user_id: str):
    try:
        object_id = ObjectId(user_id)
    except InvalidId:
        return None

    return await db["users"].find_one({"_id": object_id})


async def find_user_by_email(email: str):
    return await db["users"].find_one({"email": email})


async def create_user(data: dict):
    return await db["users"].insert_one(data)
