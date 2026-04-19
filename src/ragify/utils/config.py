from os import getenv

from dotenv import load_dotenv

load_dotenv()

EMBED_MODEL = getenv("EMBED_MODEL", "qllama/bge-small-en-v1.5:latest")
RERANKER_MODEL = getenv("RERANKER_MODEL", "BAAI/bge-reranker-v2-m3")
# RERANKER_MODEL = getenv("RERANKER_MODEL", "BAAI/bge-reranker-base")
RERANKER_BACKEND = getenv("RERANKER_BACKEND", "transformers")
# RERANKER_MODEL = getenv("RERANKER_MODEL", "Felladrin/gguf-Q8_0-bge-reranker-v2-m3")

LLM_MODEL = getenv("LLM_MODEL", "llama3.2")
LLM_URL = getenv("LLM_URL", "http://localhost:11434")
LLM_API_KEY = getenv("LLM_API_KEY", "")

VECTORDB_URL = getenv("VECTORDB_URL", "http://localhost:6333/")
COLLECTION_NAME = getenv("COLLECTION_NAME", "documents")
VECTOR_SIZE = int(getenv("VECTOR_SIZE", "384"))
MAX_TOKENS = int(getenv("MAX_TOKENS", "400"))
OVERLAP = int(getenv("OVERLAP", "50"))
