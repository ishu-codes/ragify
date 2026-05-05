
from langchain_openai import ChatOpenAI

from src.ragify.utils.config import (
    CLASSIFICATION_API_KEY,
    CLASSIFICATION_MODEL,
    CLASSIFICATION_URL,
)


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
        return self._client.with_structured_output(schema)
        # return self._client

classification_model = ClassificationModel()
