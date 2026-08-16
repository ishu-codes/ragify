<!--# Ragify-->

![Ragify Banner](docs/banner.png)

Adaptive RAG app for building per-workspace knowledge bases: upload documents into isolated workspaces, then chat with them. The browser app, the HTTP API and the RAG engine are three separate services that talk to each other over well-defined boundaries.

## Repository layout

| Directory                                   | Role                                                          | Tech                                       |
| ------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------ |
| [`web/`](web/README.md)                     | Browser app: landing page, auth, workspaces, chat, uploads    | Vite, React 19, TypeScript, Tailwind v4    |
| [`api-python/`](api-python/README.md)       | HTTP API: auth, workspaces, uploads, sessions, query          | FastAPI, SQLAlchemy (async), asyncpg       |
| [`rag/`](rag/README.md)                     | RAG gRPC server: ingestion, embeddings, retrieval, generation | Python, gRPC, LangGraph, LangChain, Qdrant |
| [`infra/`](infra/docker/docker-compose.yml) | Local infra via Docker Compose                                | PostgreSQL, Qdrant, Grobid                 |

## Architecture

The API never imports RAG code. `api-python` talks to `rag` exclusively over gRPC; `rag` never talks to PostgreSQL or the browser. Storage and models are split accordingly: PostgreSQL owns users/workspaces/sessions, Qdrant owns per-workspace vector collections.

```mermaid
flowchart LR
    subgraph UI["web - Vite + React"]
        SPA["SPA: auth, workspaces, chat"]
    end
    subgraph API["api-python - FastAPI"]
        AUTH["Auth"]
        WS["Workspaces / Uploads / Sessions"]
        QUERY["Query"]
        CLIENT["ragify_client (gRPC stubs)"]
    end
    subgraph RAG["rag - gRPC server"]
        VS["VectorStoreService"]
        ING["IngestionService"]
        RAGQ["RagService (LangGraph)"]
    end
    PG[("PostgreSQL")]
    QD[("Qdrant")]
    OLL["Ollama"]
    GB["Grobid"]
    LLM["LLM provider"]

    SPA -->|"HTTP :8000 /api/v1"| AUTH
    SPA -->|"HTTP :8000 /api/v1"| WS
    SPA -->|"HTTP :8000 /api/v1"| QUERY
    AUTH --> PG
    WS --> PG
    WS --> CLIENT
    QUERY --> CLIENT
    CLIENT -->|"gRPC :50051"| VS
    CLIENT -->|"gRPC :50051"| ING
    CLIENT -->|"gRPC :50051"| RAGQ
    VS --> QD
    ING --> GB
    ING --> OLL
    RAGQ --> QD
    RAGQ --> OLL
    RAGQ --> LLM
```

### Chat query flow

```mermaid
sequenceDiagram
    participant UI as Web app
    participant API as FastAPI
    participant RAG as rag gRPC server
    participant QD as Qdrant
    participant OLL as Ollama
    participant LLM as LLM provider

    UI->>API: POST /api/v1/workspaces/{id}/query
    API->>RAG: RagService.Query (gRPC)
    RAG->>RAG: route query: index / general / search
    RAG->>OLL: embed query
    RAG->>QD: similarity search
    RAG->>LLM: generate grounded answer
    RAG-->>API: QueryResponse.answer
    API-->>UI: answer + session id
```

## Quickstart

### 1. Prerequisites

- Python 3.12 and [uv](https://docs.astral.sh/uv/)
- Node.js and pnpm
- Docker and Docker Compose
- [Ollama](https://ollama.com) for local embeddings

### 2. Environment

```bash
cp .env.example .env
```

Fill in at least `LLM_URL`, `LLM_MODEL` and `LLM_API_KEY` (the API needs an OpenAI-compatible provider). `CLASSIFICATION_URL`, `CLASSIFICATION_MODEL` and `CLASSIFICATION_API_KEY` are used for query routing; `TAVILY_API_KEY` enables the web-search route.

### 3. Start infra (PostgreSQL, Qdrant, Grobid)

```bash
make infra-up
```

### 4. Start the RAG gRPC server

```bash
make ragify-server
```

Equivalent to `cd rag && .venv/bin/python -m src.grpc`. Make sure Ollama is running first:

```bash
ollama serve
ollama pull qllama/bge-small-en-v1.5
```

### 5. Start the API

```bash
cd api-python
uv sync
.venv/bin/python -m alembic upgrade head
.venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### 6. Start the web app

```bash
cd web
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

## Ports

| Service               | Port            |
| --------------------- | --------------- |
| Web (Vite dev server) | `3000`          |
| API (FastAPI)         | `8000`          |
| RAG gRPC              | `50051`         |
| PostgreSQL            | `5432`          |
| Qdrant (HTTP / gRPC)  | `6333` / `6334` |
| Grobid                | `8070`          |
| Ollama                | `11434`         |

## API endpoints

All routes are prefixed with `/api/v1` and require a `Bearer` token except `auth/register` and `auth/login`.

| Method                     | Path                                     | Description                        |
| -------------------------- | ---------------------------------------- | ---------------------------------- |
| `POST`                     | `/auth/register`                         | Create a user                      |
| `POST`                     | `/auth/login`                            | Get a JWT                          |
| `GET`                      | `/auth/session`                          | Current user                       |
| `GET` / `POST`             | `/workspaces/`                           | List / create workspaces           |
| `GET` / `PATCH` / `DELETE` | `/workspaces/{id}`                       | Get / update / delete a workspace  |
| `POST`                     | `/workspaces/{id}/upload`                | Upload files (multipart)           |
| `GET`                      | `/workspaces/{id}/uploads/{status_id}`   | Upload status                      |
| `POST`                     | `/workspaces/{id}/query`                 | Chat query against a workspace     |
| `GET`                      | `/workspaces/{id}/sessions`              | List chat sessions                 |
| `GET` / `PATCH` / `DELETE` | `/workspaces/{id}/sessions/{session_id}` | Session messages / rename / delete |
| `DELETE`                   | `/workspaces/{id}/sessions`              | Delete all sessions in a workspace |

## gRPC contract (API <-> rag)

The shared contract lives in [`rag/src/grpc/ragify.proto`](rag/src/grpc/ragify.proto) and covers three services:

- `VectorStoreService`: workspace collection create/delete and document insert
- `IngestionService`: section chunking, markdown conversion, document ingestion and PDF (Grobid) ingestion
- `RagService`: RAG graph query execution

The API talks to these through `ragify_client` in [`api-python/src/ragify_client/`](api-python/src/ragify_client), a thin gRPC facade that mirrors the RAG service surface. Endpoint: `RAGIFY_GRPC_ENDPOINT` (client), `RAGIFY_GRPC_HOST` / `RAGIFY_GRPC_PORT` (server).

After editing the proto, regenerate both copies of the stubs:

```bash
make grpc-gen
```

## Configuration

The repo uses one root `.env` file. See `.env.example` for the full list. Key variables:

| Variable                                                                 | Used by      | Default                                                    |
| ------------------------------------------------------------------------ | ------------ | ---------------------------------------------------------- |
| `DATABASE_URL`                                                           | API          | `postgresql+asyncpg://ragify:ragify@localhost:5432/ragify` |
| `JWT_SECRET`                                                             | API          | -                                                          |
| `CORS_ORIGINS`                                                           | API          | `http://localhost:3000`                                    |
| `VECTORDB_URL`                                                           | RAG          | `http://localhost:6333/`                                   |
| `EMBED_MODEL`                                                            | RAG (Ollama) | `qllama/bge-small-en-v1.5:latest`                          |
| `LLM_URL` / `LLM_MODEL` / `LLM_API_KEY`                                  | RAG          | -                                                          |
| `CLASSIFICATION_URL` / `CLASSIFICATION_MODEL` / `CLASSIFICATION_API_KEY` | RAG          | -                                                          |
| `TAVILY_API_KEY`                                                         | RAG          | -                                                          |
| `RAGIFY_GRPC_HOST` / `RAGIFY_GRPC_PORT`                                  | RAG          | `0.0.0.0` / `50051`                                        |
| `RAGIFY_GRPC_ENDPOINT`                                                   | API          | `localhost:50051`                                          |

## Makefile targets

```bash
make infra-up      # docker compose up (Postgres, Qdrant, Grobid)
make infra-down    # docker compose down
make ragify-server # run the RAG gRPC server
make grpc-gen      # regenerate gRPC stubs from ragify.proto
```

## Notes

- Workspace uploads are stored under `api-python/storage/workspaces/<workspace_id>/`.
- Qdrant collections are created per workspace id.
- The API service intentionally contains no AI/ML code: all ingestion, retrieval and generation happens in `rag/`.
