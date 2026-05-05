from os import environ

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

from src.ragify.utils.config import LLM_API_KEY, LLM_MODEL, LLM_URL

load_dotenv()

environ["OPENAI_API_KEY"] = LLM_API_KEY

class LLM:
    def __init__(
        self,
    ):
        self.model_name = LLM_MODEL
        self._client = ChatOpenAI(
            model=self.model_name,
            base_url=LLM_URL,
            api_key=LLM_API_KEY
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
