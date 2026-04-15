from os import getenv

from dotenv import load_dotenv

load_dotenv()

EMBED_MODEL = getenv("EMBED_MODEL", "qllama/bge-small-en-v1.5")
RERANKER_MODEL = getenv("RERANKER_MODEL", "bona/bge-reranker-v2-m3:latest")

LLM_MODEL = getenv("LLM_MODEL", "claude-sonnet-4-6")
LLM_URL = getenv("LLM_URL", "http://localhost:8080/v1")

VECTORDB_URL = getenv("VECTORDB_URL", "http://localhost:6333/")
COLLECTION_NAME = getenv("COLLECTION_NAME", "documents")
VECTOR_SIZE = int(getenv("VECTOR_SIZE", "384"))
MAX_TOKENS = int(getenv("MAX_TOKENS", "400"))
OVERLAP = int(getenv("OVERLAP", "50"))
