from fastapi import FastAPI

from src.routes import docs, query

app = FastAPI()

@app.get("/")
def read_root():
    return {
        "name": "ragify",
        "version": "0.1",
        "project": "github.com/ishu-codes/ragify",
        "author": "Ishu Kumar"
    }


app.include_router(docs.router, prefix="/docs", tags=["Docs"])
app.include_router(query.router, prefix="/query", tags=["Query"])
