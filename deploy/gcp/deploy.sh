#!/usr/bin/env bash
# Deploys the Ragify containers to Cloud Run.
#
# Prerequisites (see deploy/gcp/README.md):
#   - gcloud authenticated with the target project selected
#   - Artifact Registry repo, Cloud SQL instance, and Secret Manager secrets
#   - images already built (gcloud builds submit --config cloudbuild.yaml)
#
# Usage:
#   PROJECT_ID=my-project ./deploy.sh
set -euo pipefail

PROJECT_ID="${PROJECT_ID:?Set PROJECT_ID or select the project with: gcloud config set project}"
REGION="${REGION:-us-central1}"
REPO="${REPO:-ragify}"
TAG="${TAG:-latest}"
SQL_INSTANCE="${SQL_INSTANCE:-ragify-db}"
GROBID_IMAGE="${GROBID_IMAGE:-grobid/grobid:0.9.0-crf}"

REGISTRY="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO"

# External services
VECTORDB_URL="${VECTORDB_URL:?Set VECTORDB_URL (Qdrant Cloud cluster URL, e.g. https://xxxx.aws.cloud.qdrant.io:6333)}"
LLM_URL="${LLM_URL:-}"
LLM_MODEL="${LLM_MODEL:-}"
CLASSIFICATION_URL="${CLASSIFICATION_URL:-}"
CLASSIFICATION_MODEL="${CLASSIFICATION_MODEL:-}"
EMBED_MODEL="${EMBED_MODEL:-qllama/bge-small-en-v1.5:latest}"

# Secret names (created in step 2 of the README)
DB_URL_SECRET="${DB_URL_SECRET:-db-url}"
JWT_SECRET_NAME="${JWT_SECRET_NAME:-jwt-secret}"
LLM_API_KEY_SECRET="${LLM_API_KEY_SECRET:-llm-api-key}"
CLASSIFICATION_API_KEY_SECRET="${CLASSIFICATION_API_KEY_SECRET:-classification-api-key}"
TAVILY_API_KEY_SECRET="${TAVILY_API_KEY_SECRET:-tavily-api-key}"
QDRANT_API_KEY_SECRET="${QDRANT_API_KEY_SECRET:-qdrant-api-key}"

echo "==> Deploying Grobid (internal HTTP, scale-to-zero)"
gcloud run deploy ragify-grobid \
  --image "$GROBID_IMAGE" \
  --region "$REGION" --project "$PROJECT_ID" \
  --allow-unauthenticated --ingress internal \
  --min-instances 0 --max-instances 3 \
  --memory 2Gi --cpu 1 --timeout 3600 --concurrency 10 --port 8070

GROBID_URL=$(gcloud run services describe ragify-grobid \
  --region "$REGION" --project "$PROJECT_ID" --format 'value(status.url)')

echo "==> Deploying rag (internal gRPC, scale-to-zero)"
RAG_ENV="RAGIFY_GRPC_PORT=8080,EMBED_MODEL=${EMBED_MODEL},VECTORDB_URL=${VECTORDB_URL},GROBID_URL=${GROBID_URL}"
[[ -n "$LLM_URL" ]] && RAG_ENV="$RAG_ENV,LLM_URL=${LLM_URL}"
[[ -n "$LLM_MODEL" ]] && RAG_ENV="$RAG_ENV,LLM_MODEL=${LLM_MODEL}"
[[ -n "$CLASSIFICATION_URL" ]] && RAG_ENV="$RAG_ENV,CLASSIFICATION_URL=${CLASSIFICATION_URL}"
[[ -n "$CLASSIFICATION_MODEL" ]] && RAG_ENV="$RAG_ENV,CLASSIFICATION_MODEL=${CLASSIFICATION_MODEL}"

RAG_SECRETS="LLM_API_KEY=${LLM_API_KEY_SECRET}:latest,VECTORDB_API_KEY=${QDRANT_API_KEY_SECRET}:latest"
[[ -n "$CLASSIFICATION_API_KEY_SECRET" ]] && RAG_SECRETS="$RAG_SECRETS,CLASSIFICATION_API_KEY=${CLASSIFICATION_API_KEY_SECRET}:latest"
[[ -n "$TAVILY_API_KEY_SECRET" ]] && RAG_SECRETS="$RAG_SECRETS,TAVILY_API_KEY=${TAVILY_API_KEY_SECRET}:latest"

gcloud run deploy ragify-rag \
  --image "$REGISTRY/rag:$TAG" \
  --region "$REGION" --project "$PROJECT_ID" \
  --allow-unauthenticated --ingress internal --use-http2 \
  --min-instances 0 --max-instances 3 \
  --memory 2Gi --cpu 1 --timeout 3600 --concurrency 10 --port 8080 \
  --set-env-vars "$RAG_ENV" \
  --set-secrets "$RAG_SECRETS"

RAG_URL=$(gcloud run services describe ragify-rag \
  --region "$REGION" --project "$PROJECT_ID" --format 'value(status.url)')
RAG_GRPC_ENDPOINT="${RAG_URL#https://}:443"

echo "==> Deploying api-python (public HTTP, scale-to-zero)"
gcloud run deploy ragify-api \
  --image "$REGISTRY/api-python:$TAG" \
  --region "$REGION" --project "$PROJECT_ID" \
  --allow-unauthenticated \
  --min-instances 0 --max-instances 3 \
  --memory 1Gi --cpu 1 --timeout 600 --concurrency 40 --port 8080 \
  --add-cloudsql-instances "$PROJECT_ID:$REGION:$SQL_INSTANCE" \
  --set-env-vars "RAGIFY_GRPC_ENDPOINT=${RAG_GRPC_ENDPOINT},RAGIFY_GRPC_TLS=true,CORS_ORIGINS=http://localhost:3000" \
  --set-secrets "DATABASE_URL=${DB_URL_SECRET}:latest,JWT_SECRET=${JWT_SECRET_NAME}:latest"

API_URL=$(gcloud run services describe ragify-api \
  --region "$REGION" --project "$PROJECT_ID" --format 'value(status.url)')

echo "==> Deploying web-next (public HTTP, scale-to-zero)"
gcloud run deploy ragify-web \
  --image "$REGISTRY/web-next:$TAG" \
  --region "$REGION" --project "$PROJECT_ID" \
  --allow-unauthenticated \
  --min-instances 0 --max-instances 3 \
  --memory 512Mi --cpu 1 --timeout 300 --concurrency 80 --port 8080

WEB_URL=$(gcloud run services describe ragify-web \
  --region "$REGION" --project "$PROJECT_ID" --format 'value(status.url)')

echo "==> Pointing API CORS at the deployed web app"
gcloud run services update ragify-api \
  --region "$REGION" --project "$PROJECT_ID" \
  --update-env-vars "CORS_ORIGINS=${WEB_URL}"

cat <<EOF

Deployment complete.
  Web:      $WEB_URL
  API:      $API_URL
  RAG:      $RAG_URL (internal gRPC)
  Grobid:   $GROBID_URL (internal HTTP)

Notes:
  - The web image must be built with NEXT_PUBLIC_API_URL=$API_URL
    (see README two-pass flow; then re-run this script).
  - First request after idle will cold-start (~20-60s).
  - Cloud SQL ($SQL_INSTANCE) is the main recurring cost.
EOF
