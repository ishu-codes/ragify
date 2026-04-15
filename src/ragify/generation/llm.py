import os
from enum import Enum

from dotenv import load_dotenv

load_dotenv()

os.environ["OPENAI_API_KEY"] = os.getenv("LLM_API_KEY", "")


class LLMProvider(str, Enum):
    OLLAMA = "ollama"
    ANTHROPIC = "anthropic"
    OPENAI = "openai"


class LLM:
    def __init__(
        self,
        model: str | None = None,
        provider: LLMProvider = LLMProvider.OLLAMA,
    ):
        from src.ragify.utils.config import LLM_MODEL, LLM_URL

        self.model_name = model or LLM_MODEL
        self.provider = provider
        self._client = self._initialize_client(LLM_URL)

    def _initialize_client(self, base_url: str):
        match self.provider:
            case LLMProvider.OLLAMA:
                from langchain_ollama import ChatOllama

                return ChatOllama(model=self.model_name)

            case LLMProvider.ANTHROPIC:
                from langchain_anthropic import ChatAnthropic

                return ChatAnthropic(
                    model_name=self.model_name,
                    base_url=base_url,
                    api_key=os.getenv("LLM_API_KEY", ""),
                    timeout=40,
                    stop=[],
                )

            case _:
                from langchain_openai import ChatOpenAI

                return ChatOpenAI(
                    model=self.model_name,
                    base_url=base_url,
                    api_key=os.getenv("LLM_API_KEY", ""),
                )

    @property
    def client(self):
        return self._client

    def invoke(self, *args, **kwargs):
        return self._client.invoke(*args, **kwargs)

    def bind_tools(self, tools):
        return self._client.bind_tools(tools)

    def with_structured_output(self, schema):
        return self._client.with_structured_output(schema)

    def __getattr__(self, name):
        return getattr(self._client, name)


llm = LLM()
