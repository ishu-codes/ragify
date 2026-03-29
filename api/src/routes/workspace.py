from fastapi import APIRouter

# from langchain_core.messages import AIMessage, HumanMessage
# from src.ai.graph_builder import builder
from src.db.workspace import create_workspace

# from src.types.query import QueryBody
from src.types.workspace import WorkspaceBody

router = APIRouter()

@router.post("/")
async def new_workspace(body: WorkspaceBody):
    return await create_workspace(body.user_id)
