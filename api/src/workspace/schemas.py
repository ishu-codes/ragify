
from typing import List, Optional

from langchain_core.messages import BaseMessage
from pydantic import BaseModel, Field


class Session(BaseModel):
    id: Optional[str] = Field(alias='_id')
    workspace_id: str
    messages: List[BaseMessage]
    created_at: str

class Workspace(BaseModel):
    id: Optional[str] = Field(alias='_id')
    user_id: str
    # sessions: List[Session]
    created_at: str

    class Config:
        populate_by_name = True


# For request/response
class WorkspaceBody(BaseModel):
    user_id: str


class UploadBody(BaseModel):
    session_id: str
    docs: Optional[List[str]] = []


class QueryBody(BaseModel):
    session_id: str
    query: str
