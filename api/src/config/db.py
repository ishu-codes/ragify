from os import getenv
from typing import Any, Dict

from dotenv import load_dotenv
from pymongo import AsyncMongoClient

load_dotenv()


uri = getenv("MONGODB_URI", "mongodb://localhost:27017/")
client: AsyncMongoClient[Dict[str, Any]] = AsyncMongoClient(uri)
db = client['ragify']

# def get_collection_name(workspace_id: str):
#     client.
