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

## Quickstart (Local)

### 1) Start infra (Mongo, Qdrant, Grobid)

From repo root:

```bash
./run.sh start
```

This uses `infra/docker/docker-compose.yml` with env from `infra/.env`.

### 2) Configure environment

Copy env templates and adjust values:

```bash
cp .env.example .env
cp infra/.env.example infra/.env
```

Common variables (see `.env.example`):

- `MONGODB_URI`
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
