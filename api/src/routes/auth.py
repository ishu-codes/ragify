from fastapi import APIRouter

from src.types.auth import LoginBody, RegisterBody

router = APIRouter()

@router.post("/login")
def login(body: LoginBody):
    pass


@router.post("/register")
def register(body: RegisterBody):
    pass
