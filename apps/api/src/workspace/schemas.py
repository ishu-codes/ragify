from pydantic import BaseModel


# Workspace
class WorkspaceBody(BaseModel):
    user_id: str


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
