from fastapi import APIRouter
from langchain_core.messages import AIMessage, HumanMessage

from src.ai.graph_builder import builder
from src.db.workspace import create_session, get_session_by_id, update_messages
from src.types.query import QueryBody

router = APIRouter()

@router.post("/")
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
