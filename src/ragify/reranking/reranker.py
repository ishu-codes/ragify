from typing import Sequence

from langchain_core.documents import Document
from transformers import AutoModelForSequenceClassification, AutoTokenizer

from src.ragify.utils.config import RERANKER_MODEL


class Reranker:
    def __init__(self, model: str = RERANKER_MODEL):
        self.model_name = model
        self._tokenizer = AutoTokenizer.from_pretrained(model)
        self._model = AutoModelForSequenceClassification.from_pretrained(model)
        self._model.eval()

    @property
    def tokenizer(self):
        return self._tokenizer

    @property
    def model(self):
        return self._model

    def rerank(
        self, query: str, docs: Sequence[Document], top_k: int = 4
    ) -> list[Document]:
        if not docs:
            return []

        pairs = [[query, doc.page_content] for doc in docs]
        inputs = self._tokenizer(
            pairs, padding=True, truncation=True, return_tensors="pt"
        )

        with __import__("torch").no_grad():
            scores = self._model(**inputs).logits.view(-1)

        ranked = sorted(zip(docs, scores.tolist()), key=lambda x: x[1], reverse=True)
        return [doc for doc, _ in ranked[:top_k]]


reranker = Reranker()
