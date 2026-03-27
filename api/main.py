from typing import List, Optional

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

@app.get("/")
def read_root():
    return {
        "name": "ragify",
        "version": "0.1",
        "project": "github.com/ishu-codes/ragify",
        "author": "Ishu Kumar"
    }



class UploadBody(BaseModel):
    session_id: str
    docs: Optional[List[str]] = []

@app.post("/api/docs/upload")
def upload_docs(body: UploadBody, q: str | None = None):
    return {"body": body}



class QueryBody(BaseModel):
    session_id: str
    query: str

@app.post("/api/query")
def query_rag(body: QueryBody):
    return {"body": body}
