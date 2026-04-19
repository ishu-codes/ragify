from typing import Sequence

from langchain_core.documents import Document

reranker_instance = None


class Reranker:
    def __init__(self, model: str | None = None):
        self.model_name = model
        self._tokenizer = None
        self._model = None
        self._load_model(model)

    def _load_model(self, model: str | None):
        if model is None:
            return
        try:
            from src.ragify.utils.config import RERANKER_MODEL
            from transformers import AutoModelForSequenceClassification, AutoTokenizer

            actual_model = model or RERANKER_MODEL
            self._tokenizer = AutoTokenizer.from_pretrained(actual_model)
            self._model = AutoModelForSequenceClassification.from_pretrained(
                actual_model
            )
            self._model.eval()
        except Exception as e:
            print(f"Warning: Could not load reranker model {model}: {e}")
            self._tokenizer = None
            self._model = None

    @property
    def tokenizer(self):
        return self._tokenizer

    @property
    def model(self):
        return self._model

    def rerank(
        self, query: str, docs: Sequence[Document], top_k: int = 4
    ) -> list[Document]:
        if not docs or self._model is None:
            return list(docs)[:top_k]

        try:
            pairs = [[query, doc.page_content] for doc in docs]
            inputs = self._tokenizer(
                pairs, padding=True, truncation=True, return_tensors="pt"
            )

            with __import__("torch").no_grad():
                scores = self._model(**inputs).logits.view(-1)

            ranked = sorted(
                zip(docs, scores.tolist()), key=lambda x: x[1], reverse=True
            )
            return [doc for doc, _ in ranked[:top_k]]
        except Exception as e:
            print(f"Reranking failed: {e}")
            return list(docs)[:top_k]


def get_reranker():
    global reranker_instance
    if reranker_instance is None:
        reranker_instance = Reranker()
    return reranker_instance


reranker = get_reranker()
