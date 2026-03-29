from fastapi import FastAPI

from src.routes import docs, query, workspace

app = FastAPI(title="Ragify")

@app.get("/")
async def read_root():
    return {
        "name": "ragify",
        "version": "0.1",
        "project": "github.com/ishu-codes/ragify",
        "author": "Ishu Kumar"
    }


app.include_router(docs.router, prefix="/docs", tags=["Docs"])
app.include_router(workspace.router, prefix="/workspace", tags=["Workspace"])
app.include_router(query.router, prefix="/query", tags=["Query"])
