from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ..config.db import get_session
from ..config.response import success
from .schemas import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse
from .service import AuthService
from .utils import authenticated_user, require_auth

router = APIRouter()


@router.post("/register", response_model=RegisterResponse)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_session)):
    result = await AuthService.register_user(db, payload)
    return success(result, 201)


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_session)):
    result = await AuthService.login_user(db, payload)
    return success(result)


@router.get("/session", dependencies=[Depends(require_auth)])
async def session(request: Request):
    return success({"user": authenticated_user(request)})
