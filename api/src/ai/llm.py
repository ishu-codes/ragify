"""
OpenAI LLM initialization and configuration.
"""

import os

from dotenv import load_dotenv

# from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama

from src.ai.config import LLM_MODEL, LLM_URL

load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("LLM_API_KEY", "")

# llm = ChatOpenAI(model=LLM_MODEL, base_url=LLM_URL)
llm = ChatOllama(model=LLM_MODEL)
