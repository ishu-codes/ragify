
from typing import Sequence

import ollama
from langchain_ollama import OllamaEmbeddings

from src.ai.config import EMBED_MODEL

embeddings = OllamaEmbeddings(model=EMBED_MODEL)


def encode(input: str|Sequence[str]):
    res = ollama.embed(
        model=EMBED_MODEL,
        input=input
    )
    return res.get('embeddings')
