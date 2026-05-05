
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI

from src.ragify.utils.config import (
    CLASSIFICATION_API_KEY,
    CLASSIFICATION_MODEL,
    CLASSIFICATION_URL,
)
from src.ragify.generation.schema import RouteIdentifier


class ClassificationModel:
    def __init__(self) -> None:
        self._model_name = CLASSIFICATION_MODEL
        self._client = ChatOpenAI(
            model=CLASSIFICATION_MODEL,
            base_url=CLASSIFICATION_URL,
            api_key=CLASSIFICATION_API_KEY
        )

    @property
    def client(self):
        return self._client

    def classify(self, schema):
        # For models that don't support structured output, use JSON mode
        try:
            return self._client.with_structured_output(schema)
        except Exception:
            # Fallback: use JSON output parser
            prompt = PromptTemplate(
                template="Classify the query. Available routes: index, general, web. Query: {question} Context: {context}",
                input_variables=["question", "context"],
            )
            parser = JsonOutputParser(pydantic_object=schema)
            return prompt | self._client.bind(response_format={"type": "json_object"}) | parser


classification_model = ClassificationModel()

