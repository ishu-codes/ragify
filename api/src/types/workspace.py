from typing import List, Optional

from pydantic import BaseModel


class WorkspaceBody(BaseModel):
    user_id: str


class UploadBody(BaseModel):
    session_id: str
    docs: Optional[List[str]] = []


class QueryBody(BaseModel):
    workspace_id: Optional[str]
    session_id: Optional[str]
    query: str
