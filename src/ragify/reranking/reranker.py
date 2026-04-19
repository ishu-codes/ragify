from typing import Sequence

from langchain_core.documents import Document

reranker_instance = None


class Reranker:
    def __init__(self, model: str | None = None, backend: str = "ollama"):
        from src.ragify.utils.config import RERANKER_MODEL

        self.model_name = model if model is not None else RERANKER_MODEL
        self.backend = backend
        self._tokenizer = None
        self._model = None
        self._load_model(self.model_name)

    def _load_model(self, model: str | None):
        if model is None:
            return

        if self.backend == "ollama":
            print(f"Using Ollama for reranking (falling back to embeddings)")
        elif self.backend == "transformers":
            try:
                from transformers import (
                    AutoModelForSequenceClassification,
                    AutoTokenizer,
                )

                self._tokenizer = AutoTokenizer.from_pretrained(model)
                self._model = AutoModelForSequenceClassification.from_pretrained(model)
                self._model.eval()
                print(f"Loaded transformers reranker: {model}")
            except Exception as e:
                print(f"Warning: Could not load reranker model {model}: {e}")
                self._tokenizer = None
                self._model = None
        elif self.backend == "huggingface":
            try:
                from sentence_transformers import CrossEncoder

                self._model = CrossEncoder(model)
                print(f"Loaded HuggingFace CrossEncoder reranker: {model}")
            except Exception as e:
                print(f"Warning: Could not load CrossEncoder {model}: {e}")
                self._model = None
        else:
            try:
                from transformers import (
                    AutoModelForSequenceClassification,
                    AutoTokenizer,
                )

                self._tokenizer = AutoTokenizer.from_pretrained(model)
                self._model = AutoModelForSequenceClassification.from_pretrained(model)
                self._model.eval()
                print(f"Loaded transformers reranker: {model}")
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
        if not docs:
            return list(docs)[:top_k]

        if self.backend == "ollama":
            return self._rerank_ollama(query, docs, top_k)

        if self.backend == "huggingface" and self._model is not None:
            return self._rerank_huggingface(query, docs, top_k)

        if self._model is None:
            print(f"Warning: Reranker model not loaded, skipping rerank")
            return list(docs)[:top_k]

        return self._rerank_transformers(query, docs, top_k)

    def _rerank_ollama(
        self, query: str, docs: Sequence[Document], top_k: int = 4
    ) -> list[Document]:
        return self._rerank_embeddings(query, docs, top_k)

    def _rerank_embeddings(
        self, query: str, docs: Sequence[Document], top_k: int = 4
    ) -> list[Document]:
        try:
            from src.ragify.retrieval import embeddings

            query_emb = embeddings.embed_query(query)
            doc_texts = [doc.page_content for doc in docs]
            doc_embs = embeddings.embed_documents(doc_texts)

            import numpy as np

            scores = []
            for doc_emb in doc_embs:
                score = np.dot(query_emb, doc_emb)
                scores.append(score)

            ranked = sorted(zip(docs, scores), key=lambda x: x[1], reverse=True)
            return [doc for doc, _ in ranked[:top_k]]
        except Exception as e:
            print(f"Embedding reranking failed: {e}")
            return list(docs)[:top_k]

    def _rerank_transformers(
        self, query: str, docs: Sequence[Document], top_k: int = 4
    ) -> list[Document]:
        try:
            import torch

            pairs = [[query, doc.page_content] for doc in docs]
            inputs = self._tokenizer(
                pairs, padding=True, truncation=True, return_tensors="pt"
            )

            with torch.no_grad():
                scores = self._model(**inputs).logits.view(-1)

            ranked = sorted(
                zip(docs, scores.tolist()), key=lambda x: x[1], reverse=True
            )
            return [doc for doc, _ in ranked[:top_k]]
        except Exception as e:
            print(f"Reranking failed: {e}")
            return list(docs)[:top_k]

    def _rerank_huggingface(
        self, query: str, docs: Sequence[Document], top_k: int = 4
    ) -> list[Document]:
        try:
            pairs = [(query, doc.page_content) for doc in docs]
            scores = self._model.predict(pairs)

            ranked = sorted(zip(docs, scores), key=lambda x: x[1], reverse=True)
            return [doc for doc, _ in ranked[:top_k]]
        except Exception as e:
            print(f"HuggingFace reranking failed: {e}")
            return list(docs)[:top_k]


def get_reranker(backend: str | None = None):
    from src.ragify.utils.config import RERANKER_BACKEND

    global reranker_instance
    if backend is None:
        backend = RERANKER_BACKEND
    if reranker_instance is None or reranker_instance.backend != backend:
        reranker_instance = Reranker(backend=backend)
    return reranker_instance


reranker = get_reranker()
