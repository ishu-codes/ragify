from fastapi import HTTPException

from .repository import create_user, find_user_by_email
from .schemas import LoginBody, RegisterBody
from .serializer import serialize_user
from .utils import create_access_token, hash_password, verify_password


def _invalid_credentials():
    raise HTTPException(status_code=400, detail="Invalid email or password")


async def register_user(user_info: RegisterBody):
    existing_user = await find_user_by_email(user_info.email)

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_pw = hash_password(user_info.password)

    result = await create_user(
        {"name": user_info.name, "email": user_info.email, "password": hashed_pw}
    )

    user = {
        "id": str(result.inserted_id),
        "name": user_info.name,
        "email": user_info.email,
    }

    return {
        "user": user,
        "access_token": create_access_token(user),
    }


async def login_user(user_info: LoginBody):
    user = await find_user_by_email(user_info.email)

    if user is None:
        raise HTTPException(404, detail="User does not exist!")
        # _invalid_credentials()

    if not verify_password(user_info.password, user["password"]):
        _invalid_credentials()

    return {
        "user": serialize_user(user),
        "access_token": create_access_token(user),
    }
