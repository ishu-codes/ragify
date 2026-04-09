from typing import Any, List, Optional

from langchain_core.messages import BaseMessage
from pydantic import BaseModel, Field


class Material(BaseModel):
    id: str
    name: str
    kind: str
    size: int
    mime_type: str
    storage_path: str
    created_at: str


class UploadStatusFile(BaseModel):
    id: str
    name: str
    kind: str
    size: int
    mime_type: str
    storage_path: str
    status: str
    error: Optional[str] = None
    created_at: str


class UploadStatusLog(BaseModel):
    message: str
    created_at: str


class UploadStatus(BaseModel):
    id: Optional[str] = Field(alias="_id")
    workspace_id: str
    user_id: str
    status: str
    files: List[UploadStatusFile]
    logs: List[UploadStatusLog]
    created_at: str
    updated_at: str
    completed_at: Optional[str] = None
    error: Optional[str] = None


class Session(BaseModel):
    id: Optional[str] = Field(alias="_id")
    workspace_id: str
    name: str
    messages: List[BaseMessage | dict[str, Any]]
    created_at: str


class Workspace(BaseModel):
    id: Optional[str] = Field(alias="_id")
    user_id: str
    name: str
    description: str
    tags: List[str]
    materials: List[Material]
    created_at: str

    class Config:
        populate_by_name = True


# For request/response
class WorkspaceBody(BaseModel):
    user_id: str


class QueryBody(BaseModel):
    session_id: Optional[str] = None
    query: str


class UpdateWorkspaceBody(BaseModel):
    name: str
    description: str = ""
    tags: List[str] = []


class UpdateSessionBody(BaseModel):
    name: str
