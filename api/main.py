from fastapi import FastAPI, HTTPException, Request

from src.auth.controller import router as auth_router
from src.workspace.controller import router as workspace_router

from src.config.response import failure

app = FastAPI(title="Ragify")

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
        "author": "Ishu Kumar"
    }


app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(workspace_router, prefix="/api/v1/workspaces", tags=["Workspace"])
