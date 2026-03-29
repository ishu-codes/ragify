"""
ReAct agent setup for document retrieval and question answering.
"""

# import os

# from langchain.agents import create_tool
from langchain_core.prompts import ChatPromptTemplate

from src.ai.llm import llm
from src.ai.retriever import get_retriever
from src.config.settings import Config
from src.utils.files import get_file_content

config = Config()

# Initialize tools
tools = [get_retriever()]

# Load document description if available
description = get_file_content("./src/ai/description.txt", None)

# Create ReAct agent prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", config.prompt("system_prompt")),
    ("human", "{input}"),
    ("ai", "{agent_scratchpad}")
])

# Initialize the ReAct agent and executor
# react_agent = create_agent(llm, tools, prompt)
agent = prompt | llm.bind_tools(tools)


# agent_executor = AgentExecutor(
#     agent=react_agent,
#     tools=tools,
#     handle_parsing_errors=True,
#     max_iterations=2,
#     verbose=True,
#     return_intermediate_steps=True
# )
