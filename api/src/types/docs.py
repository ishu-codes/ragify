from typing import List, Optional

from pydantic import BaseModel


class UploadBody(BaseModel):
    session_id: str
    docs: Optional[List[str]] = []
