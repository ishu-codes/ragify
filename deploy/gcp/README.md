# Ragify on Google Cloud — deployment guide

This deploys Ragify as four Cloud Run services plus Cloud SQL, targeting a
personal/low-traffic workload with a minimal bill (~$8–12/mo, dominated by
Cloud SQL). Everything else stays inside free tiers.

## Architecture

| Service | Cloud Run service | Visibility |
|---|---|---|
| web-next (Next.js standalone) | `ragify-web` | public HTTPS |
| api-python (FastAPI) | `ragify-api` | public HTTPS |
| rag (gRPC + bundled Ollama) | `ragify-rag` | internal, gRPC/HTTP2 |
| Grobid (PDF parsing) | `ragify-grobid` | internal HTTP |
| PostgreSQL | Cloud SQL `db-f1-micro` | proxy-only (via sidecar) |
| Qdrant | Qdrant Cloud free tier | external HTTPS |

All services are in `us-central1` (required for internal Cloud Run traffic;
also free-tier eligible) with `min-instances=0` so they scale to zero.

## 1. One-time project setup

```bash
PROJECT_ID=ragify        # change to your project id
REGION=us-central1
gcloud config set project "$PROJECT_ID"

# Enable APIs
gcloud services enable run.googleapis.com sqladmin.googleapis.com \
  artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com

# Artifact Registry repo
gcloud artifacts repositories create ragify --repository-format=docker \
  --location="$REGION" --description="Ragify images"

# Cloud SQL (smallest tier; backups on, PITR off to keep the bill low)
gcloud sql instances create ragify-db \
  --database-version=POSTGRES_16 --tier=db-f1-micro \
  --region="$REGION" --storage-size=10 \
  --backup-start-time=02:00 --no-deletion-protection
gcloud sql databases create ragify --instance=ragify-db
# Pick a strong password and run:
#   gcloud sql users set-password postgres --instance=ragify-db --password=<password>
```

## 2. Secrets (Secret Manager, free tier)

Create one secret per line below. Replace values with your own. The database
URL uses `127.0.0.1:5432` because Cloud Run injects the Cloud SQL proxy sidecar
on localhost:

```bash
printf '%s' 'postgresql+asyncpg://postgres:<password>@127.0.0.1:5432/ragify' \
  | gcloud secrets create db-url --data-file=-
printf '%s' '<random jwt secret>' | gcloud secrets create jwt-secret --data-file=-
printf '%s' '<LLM API key>'        | gcloud secrets create llm-api-key --data-file=-
printf '%s' '<classifier key>'     | gcloud secrets create classification-api-key --data-file=-
printf '%s' '<Tavily key>'         | gcloud secrets create tavily-api-key --data-file=-
printf '%s' '<Qdrant API key>'     | gcloud secrets create qdrant-api-key --data-file=-
```

## 3. Qdrant Cloud (free tier)

Create a free cluster at <https://cloud.qdrant.io> (1 GB is enough for
personal use), copy the cluster URL and API key. The URL goes in `VECTORDB_URL`
below; the key is already stored as `qdrant-api-key`.

## 4. Build the images

First pass builds everything; the web image gets a placeholder API URL and is
rebuilt in step 6 with the real one:

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_API_URL=https://placeholder.invalid
```

## 5. Deploy

```bash
cd deploy/gcp
PROJECT_ID="$PROJECT_ID" \
VECTORDB_URL='https://<cluster>.aws.cloud.qdrant.io:6333' \
LLM_URL='https://api.openai.com/v1' \
LLM_MODEL='<model>' \
./deploy.sh
```

Optional environment variables: `CLASSIFICATION_URL`, `CLASSIFICATION_MODEL`,
`EMBED_MODEL`, `SQL_INSTANCE`, `REGION`, `REPO`, `TAG`. The script deploys
Grobid → rag → api → web, then sets API CORS to the web URL. Secrets are wired
by name (`--set-secrets`), so API keys never appear in service config.

## 6. Rebuild web with the real API URL

```bash
API_URL=$(gcloud run services describe ragify-api \
  --region us-central1 --format 'value(status.url)')
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_API_URL="$API_URL"
cd deploy/gcp && PROJECT_ID="$PROJECT_ID" \
  VECTORDB_URL='https://<cluster>.aws.cloud.qdrant.io:6333' \
  LLM_URL='https://api.openai.com/v1' LLM_MODEL='<model>' ./deploy.sh
```

## 7. Verify

```bash
WEB_URL=$(gcloud run services describe ragify-web --region us-central1 --format 'value(status.url)')
API_URL=$(gcloud run services describe ragify-api --region us-central1 --format 'value(status.url)')
curl -s "$API_URL/api/v1/auth/register" -X POST -H 'Content-Type: application/json' \
  -d '{"name":"t","email":"t@example.com","password":"password123"}'
```

Then open `$WEB_URL`, log in, create a workspace, upload a Markdown file, and
chat. Upload a PDF too — that exercises Grobid (first PDF after idle takes a
minute or two while Grobid cold-starts; subsequent ones are fast).

## 8. Cost guardrails

```bash
# Budget alert at $15/mo (replace billing account id)
gcloud billing budgets create \
  --billing-account=000000-000000-000000 \
  --display-name=ragify-budget --budget-amount=15 \
  --threshold-rule=percent=0.5 --threshold-rule=percent=0.9

# Confirm nothing is always-on
gcloud run services list --region us-central1 --format 'table(SERVICE, metadata.spec.template.metadata.annotations.autoscaling.knative.dev/minScale)'
```

Cloud SQL `db-f1-micro` (~$8/mo) + 10 GB storage + backups are the recurring
costs. Cloud Run, Artifact Registry, Secret Manager, and Cloud Build stay
inside free tiers at personal scale. To stop billing entirely, delete the
Cloud SQL instance and the four services (or the whole project).

## Known limits and notes

- Cloud Run caps request bodies at 32 MiB — keep uploaded documents under that.
- First query after idle cold-starts the rag service (~20–60 s incl. loading
  the baked-in Ollama embedding model); warm queries are fast.
- The rag image intentionally excludes torch/transformers (reranker only, not
  in the served graph), which keeps the image ~1–2 GB smaller and cold starts
  faster.
- gRPC between api and rag uses TLS (`RAGIFY_GRPC_TLS=true`) against the
  internal `*.run.app` endpoint; no extra networking or VPC needed.
- Custom domains: attach via `gcloud run domain-mappings create` if desired.
