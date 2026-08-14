from pydantic import BaseModel
from pydantic.config import ConfigDict


class WorkspaceInfo(BaseModel):
    id: int
    name: str
    desc: str
    tags: list[str]
    materials: list
    user_id: int


# Workspace
class WorkspaceRequest(BaseModel):
    user_id: str


class WorkspaceResponse(WorkspaceInfo):
    model_config = ConfigDict(from_attributes=True)


class QueryBody(BaseModel):
    session_id: str | None = None
    query: str


class UpdateWorkspaceBody(BaseModel):
    name: str
    description: str = ""
    tags: list[str] = []


# Session
class UpdateSessionBody(BaseModel):
    name: str
