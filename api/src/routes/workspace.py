from fastapi import APIRouter
from langchain_core.messages import AIMessage, HumanMessage

from src.ai.graph_builder import builder
from src.db.workspace import (
    create_session,
    create_workspace,
    get_session_by_id,
    get_workspaces,
    update_messages,
)
from src.types.workspace import QueryBody, UploadBody, WorkspaceBody

router = APIRouter()

@router.get("/")
async def workspaces(body: WorkspaceBody):
    print("Request received")
    try:
        result = await get_workspaces(body.user_id)

        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@router.post("/")
async def new_workspace(body: WorkspaceBody):
    return await create_workspace(body.user_id)


@router.post("/:id/upload")
async def upload_docs(body: UploadBody):
    return {"body": body}


@router.post("/:id/query")
async def query_rag(body: QueryBody):
    if body.session_id is None:
        if body.workspace_id is None:
            raise Exception("session_id & workspace_id cannot be null at same time")
        session = await create_session(body.workspace_id)
    else:
        session = await get_session_by_id(body.session_id)

    if session is None:
        raise Exception("session could not be found")

    chat_messages = session.messages if (session is not None) else []
    chat_messages.append(HumanMessage(content=body.query))

    result = builder.invoke({"messages": chat_messages})
    output_text = result['messages'][-1].content
    chat_messages.append(AIMessage(content=output_text))

    await update_messages(session.id, chat_messages)
    return {
        "result": result["messages"][-1]
    }
