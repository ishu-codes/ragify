from fastapi import APIRouter

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
