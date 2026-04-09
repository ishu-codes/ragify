from fastapi import APIRouter, Depends, Request

from .utils import authenticated_user, require_auth
from src.config.response import success

from .schemas import LoginBody, RegisterBody
from .service import login_user, register_user

router = APIRouter()


@router.post("/register")
async def register(body: RegisterBody):
    result = await register_user(body)
    return success(result, 201)


@router.post("/login")
async def login(body: LoginBody):
    result = await login_user(body)
    return success(result)


@router.get("/session", dependencies=[Depends(require_auth)])
async def session(request: Request):
    return success({"user": authenticated_user(request)})
