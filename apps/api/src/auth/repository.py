from uuid import UUID

from sqlalchemy import select

from ..config.db import async_session_maker
from .models import User


async def find_user_by_id(user_id: str):
    try:
        user_uuid = UUID(str(user_id))
    except (ValueError, AttributeError, TypeError):
        return None

    async with async_session_maker() as session:
        return await session.get(User, user_uuid)


async def find_user_by_email(email: str):
    async with async_session_maker() as session:
        result = await session.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()


async def create_user(data: dict):
    async with async_session_maker() as session:
        user = User(**data)
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user
