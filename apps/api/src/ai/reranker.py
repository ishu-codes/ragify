import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

from src.ai.config import RERANKER_MODEL

tokenizer = AutoTokenizer.from_pretrained(RERANKER_MODEL)
model = AutoModelForSequenceClassification.from_pretrained(RERANKER_MODEL)
model.eval()


def rerank_docs(query, docs, top_k=4):
    if not docs:
        return []
    pairs = [[query, doc.page_content] for doc in docs]

    inputs = tokenizer(pairs, padding=True, truncation=True, return_tensors="pt")

    with torch.no_grad():
        scores = model(**inputs).logits.view(-1)

    ranked = sorted(zip(docs, scores.tolist()), key=lambda x: x[1], reverse=True)
    return [doc for doc, _ in ranked[:top_k]]
