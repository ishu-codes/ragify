from typing import List

from fastapi import APIRouter, Depends, File, Request, UploadFile

from ..auth.utils import authenticated_user, require_auth
from ..config.response import success
from .schemas import QueryBody, UpdateSessionBody, UpdateWorkspaceBody
from .service import (
    create_workspace,
    get_session_messages,
    get_upload_status,
    get_workspace,
    get_workspace_sessions,
    get_workspaces,
    query_rag,
    remove_all_sessions,
    remove_session,
    remove_workspace,
    rename_session,
    update_workspace_details,
    upload_docs,
)

router = APIRouter(dependencies=[Depends(require_auth)])


@router.get("/")
async def workspaces(request: Request):
    result = await get_workspaces(authenticated_user(request)["id"])
    return success(result)


@router.get("/{workspace_id}")
async def workspace_detail(workspace_id: str, request: Request):
    result = await get_workspace(workspace_id, authenticated_user(request)["id"])
    return success(result)


@router.post("/")
async def new_workspace(request: Request):
    result = await create_workspace(authenticated_user(request)["id"])
    return success(result)


@router.patch("/{workspace_id}")
async def update_workspace(
    workspace_id: str, body: UpdateWorkspaceBody, request: Request
):
    result = await update_workspace_details(
        workspace_id,
        authenticated_user(request)["id"],
        body.name,
        body.description,
        body.tags,
    )
    return success(result)


@router.delete("/{workspace_id}")
async def delete_workspace_route(workspace_id: str, request: Request):
    result = await remove_workspace(workspace_id, authenticated_user(request)["id"])
    return success(result)


@router.post("/{workspace_id}/upload")
async def workspace_upload(
    request: Request,
    workspace_id: str,
    files: List[UploadFile] = File(...),
):
    result = await upload_docs(workspace_id, authenticated_user(request)["id"], files)
    return success(result)


@router.get("/{workspace_id}/uploads/{status_id}")
async def workspace_upload_status(workspace_id: str, status_id: str, request: Request):
    result = await get_upload_status(
        workspace_id, status_id, authenticated_user(request)["id"]
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


@router.get("/{workspace_id}/sessions")
async def workspace_sessions(workspace_id: str, request: Request):
    result = await get_workspace_sessions(
        workspace_id, authenticated_user(request)["id"]
    )
    return success(result)


@router.get("/{workspace_id}/sessions/{session_id}/messages")
async def workspace_session_messages(
    workspace_id: str, session_id: str, request: Request
):
    result = await get_session_messages(
        workspace_id, session_id, authenticated_user(request)["id"]
    )
    return success(result)


@router.patch("/{workspace_id}/sessions/{session_id}")
async def update_session_name(
    workspace_id: str,
    session_id: str,
    body: UpdateSessionBody,
    request: Request,
):
    result = await rename_session(
        workspace_id,
        session_id,
        authenticated_user(request)["id"],
        body.name,
    )
    return success(result)


@router.delete("/{workspace_id}/sessions/{session_id}")
async def delete_session_route(workspace_id: str, session_id: str, request: Request):
    result = await remove_session(
        workspace_id,
        session_id,
        authenticated_user(request)["id"],
    )
    return success(result)


@router.delete("/{workspace_id}/sessions")
async def delete_all_sessions_route(workspace_id: str, request: Request):
    result = await remove_all_sessions(workspace_id, authenticated_user(request)["id"])
    return success(result)
