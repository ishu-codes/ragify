# Ragify

Adaptive RAG app for building per-workspace knowledge bases from uploaded documents and chatting with them.

Includes:

- `apps/api`: FastAPI backend (auth, workspaces, uploads, chat/query)
- `apps/web`: Next.js web UI (workspaces, uploads, chat)
- `src/ragify`: core RAG pipeline (ingestion, context-aware chunking, embeddings/vector store, LangGraph routing)
- Infra: Docker Compose for MongoDB, Qdrant, and Grobid

## Architecture

- **Storage**: MongoDB for users/workspaces/sessions
- **Vector DB**: Qdrant per workspace collection
- **Ingestion**:
  - PDFs: Grobid-based parsing (batch) + indexing
  - Markdown/other files: convert to Markdown, chunk, index
- **Generation**: LangGraph workflow that routes queries (`index` vs `general` vs `search`) and can optionally call Tavily search
- **Service boundary**: the API never imports `src/ragify` directly. ragify-rag
  runs as a separate gRPC server (`src/ragify/grpc`) and the API talks to it
  through `ragify_client` (`apps/api/src/ragify_client`), a small library that
  mirrors the ragify API surface (`vector_store_manager`, `builder`,
  `GrobidIngestor`, ...) so the transport stays invisible to callers.

## gRPC (API ↔ ragify-rag)

The shared contract lives in [`src/ragify/grpc/ragify.proto`](src/ragify/grpc/ragify.proto)
and covers three services:

- `VectorStoreService` — workspace collection create/delete and document insert
- `IngestionService` — chunking, markdown conversion, document ingestion and PDF (Grobid) ingestion
- `RagService` — RAG graph query execution

Start the ragify-rag server (default `0.0.0.0:50051`):

```bash
python -m src.ragify.grpc
# or: make ragify-server
```

Configure the endpoint with `RAGIFY_GRPC_ENDPOINT` (client) and
`RAGIFY_GRPC_HOST` / `RAGIFY_GRPC_PORT` (server); see `.env.example`.

After editing the proto, regenerate both copies of the stubs:

```bash
make grpc-gen
```

## Quickstart (Local)

### 1) Start infra (Mongo, Qdrant, Grobid)

From repo root:

```bash
./run.sh start
```

This uses `infra/docker/docker-compose.yml` with env from the root `.env`.

### 2) Configure environment

The project uses a single `.env` file at the repo root. Create it if missing and adjust values as needed.

Common variables (see `.env`):

- `DATABASE_URL` (PostgreSQL connection string)
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `VECTORDB_URL` (Qdrant)
- `JWT_SECRET`
- `LLM_URL`, `LLM_MODEL`, `LLM_API_KEY`
- `TAVILY_API_KEY` (optional, for web search route)

### 3) Run the API

```bash
cd apps/api
./run.sh dev
```

API runs on `http://localhost:8000` and exposes routes under `/api/v1`.

### 4) Run the web app

```bash
cd apps/web
pnpm install
pnpm dev
```

Default UI: `http://localhost:3000`.

## API Endpoints (high level)

- `POST /api/v1/auth/register`, `POST /api/v1/auth/login`
- `GET /api/v1/workspaces`, `POST /api/v1/workspaces`
- `POST /api/v1/workspaces/{workspaceId}/upload` (multi-file)
- `POST /api/v1/workspaces/{workspaceId}/query`
- `GET /api/v1/workspaces/{workspaceId}/sessions`

## Docker

- `apps/api/Dockerfile`: builds and runs `uvicorn apps.api.main:app`
- `apps/web/Dockerfile`: builds Next.js standalone output
- `infra/docker/docker-compose.yml`: MongoDB, Qdrant, Grobid

## Notes

- Workspace data is stored under `apps/api/storage/workspaces/<workspace_id>/`.
- Qdrant collections are created per `workspace_id`.
