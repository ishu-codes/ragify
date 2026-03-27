from fastapi import APIRouter

from src.types.query import QueryBody

router = APIRouter()

@router.post("/")
def query_rag(body: QueryBody):
    return {"body": body}
