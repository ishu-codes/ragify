from pydantic import BaseModel


class QueryBody(BaseModel):
    session_id: str
    query: str
