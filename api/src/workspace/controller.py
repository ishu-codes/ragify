from fastapi import APIRouter, Depends, Request

from src.auth.utils import authenticated_user, require_auth
from src.config.response import success

from .schemas import QueryBody, UploadBody
from .service import create_workspace, get_workspaces, query_rag, upload_docs

router = APIRouter(dependencies=[Depends(require_auth)])


@router.get("/")
async def workspaces(request: Request):
    result = await get_workspaces(authenticated_user(request)["id"])
    return success(result)


@router.post("/")
async def new_workspace(request: Request):
    result = await create_workspace(authenticated_user(request)["id"])
    return success(result)


@router.post("/{workspace_id}/upload")
async def workspace_upload(
    request: Request,
    workspace_id: str,
    body: UploadBody,
):
    """
    Handle document uploads, process them, and store in vector database.
    """
    result = await upload_docs(
        workspace_id, authenticated_user(request)["id"], body.session_id, body.docs
    )
    return success(result)


@router.post("/{workspace_id}/query")
async def workspace_query(
    request: Request,
    workspace_id: str,
    body: QueryBody,
):
    result = await query_rag(
        workspace_id, authenticated_user(request)["id"], body.session_id, body.query
    )
    return success(result)
