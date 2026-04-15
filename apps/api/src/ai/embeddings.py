
from typing import Sequence

from langchain_ollama import OllamaEmbeddings
from ollama import embed

from src.ai.config import EMBED_MODEL

embeddings = OllamaEmbeddings(model=EMBED_MODEL)


def encode(input: str|Sequence[str]):
    res = embed(
        model=EMBED_MODEL,
        input=input
    )
    return res.get('embeddings')
