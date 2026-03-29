from pydantic import BaseModel


class WorkspaceBody(BaseModel):
    user_id: str
