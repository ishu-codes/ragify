from typing import Optional

from pydantic import BaseModel


class QueryBody(BaseModel):
    workspace_id: Optional[str]
    session_id: Optional[str]
    query: str
