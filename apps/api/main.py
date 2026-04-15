from contextlib import asynccontextmanager
from os import getenv
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from src.auth.controller import router as auth_router
from src.config.db import close_mongodb_connection, connect_to_mongodb
from src.config.response import failure
from src.workspace.controller import router as workspace_router

load_dotenv(Path(__file__).resolve().parent / ".env")


def _get_cors_origins() -> list[str]:
    origins = getenv("CORS_ORIGINS", "http://localhost:3000")
    return [origin.strip() for origin in origins.split(",") if origin.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongodb()
    yield
    await close_mongodb_connection()


app = FastAPI(title="Ragify", lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(HTTPException)
async def global_http_exception_handler(_: Request, exception: HTTPException):
    return failure(str(exception.detail), exception.status_code)


@app.exception_handler(Exception)
async def global_exception_handler(_: Request, exception: Exception):
    return failure(str(exception), 500)


@app.get("/")
async def read_root():
    return {
        "name": "ragify",
        "version": "0.1",
        "project": "https://github.com/ishu-codes/ragify",
        "author": "Ishu Kumar",
    }


app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(workspace_router, prefix="/api/v1/workspaces", tags=["Workspace"])
