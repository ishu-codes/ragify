from collections.abc import AsyncGenerator
from os import getenv

from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

load_dotenv()


DATABASE_URL = getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://ragify:ragify@localhost:5432/ragify",
)

engine = create_async_engine(DATABASE_URL, pool_pre_ping=True)

async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def connect_to_database() -> None:
    async with engine.connect() as connection:
        await connection.execute(text("SELECT 1"))
    print("PostgreSQL connected successfully!")


async def close_database_connection() -> None:
    await engine.dispose()
