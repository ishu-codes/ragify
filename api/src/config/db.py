from os import getenv
from pathlib import Path
from typing import Any, Dict

from dotenv import load_dotenv
from pymongo import AsyncMongoClient

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


uri = getenv("MONGODB_URI", "mongodb://localhost:27017/")
client: AsyncMongoClient[Dict[str, Any]] = AsyncMongoClient(uri)
db = client["ragify"]

print("MongoDB connected successfully!")

# def get_collection_name(workspace_id: str):
#     client.
