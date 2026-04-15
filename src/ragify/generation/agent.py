from langchain_core.prompts import ChatPromptTemplate

from src.ragify.generation.llm import llm
from src.ragify.generation.prompts import prompts


class Agent:
    def __init__(self, tools=None):
        self.tools = tools or []
        self._prompt = ChatPromptTemplate.from_messages(
            [
                ("system", prompts.system_prompt),
                ("human", "{input}"),
                ("ai", "{agent_scratchpad}"),
            ]
        )

    def create(self):
        return self._prompt | llm.bind_tools(self.tools)


def create_agent(tools):
    return Agent(tools=tools).create()


def get_agent(workspace_id: str | None = None):
    from src.ragify.retrieval import get_retriever

    tools = [get_retriever(workspace_id)]
    return create_agent(tools)
