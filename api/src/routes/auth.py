from fastapi import APIRouter

from src.types.auth import LoginBody, RegisterBody

router = APIRouter()

@router.post("/login")
async def login(body: LoginBody):
    pass


@router.post("/register")
async def register(body: RegisterBody):
    pass
