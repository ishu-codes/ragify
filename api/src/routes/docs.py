from fastapi import APIRouter

from src.types.docs import UploadBody

router = APIRouter()


@router.post("/upload")
async def upload_docs(body: UploadBody):
    return {"body": body}
