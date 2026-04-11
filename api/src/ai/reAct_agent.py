"""
ReAct agent setup for document retrieval and question answering.
"""

# import os

# from langchain.agents import create_tool
from langchain_core.prompts import ChatPromptTemplate

from src.ai.llm import llm
from src.ai.retriever import get_retriever
from src.config.settings import Config

# from src.utils.files import get_file_content

config = Config()

# Create ReAct agent prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", config.prompt("system_prompt")),
    ("human", "{input}"),
    ("ai", "{agent_scratchpad}")
])

def get_agent(workspace_id: str | None = None):
    # Initialize tools for specific workspace
    tools = [get_retriever(workspace_id)]

    # Initialize the agent
    agent = prompt | llm.bind_tools(tools)
    return agent


# agent_executor = AgentExecutor(
#     agent=react_agent,
#     tools=tools,
#     handle_parsing_errors=True,
#     max_iterations=2,
#     verbose=True,
#     return_intermediate_steps=True
# )
