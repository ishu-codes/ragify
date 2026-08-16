# Ragify - Adaptive RAG System Makefile

.PHONY: \
	help \
	infra-up infra-down \
	ragify-server grpc-gen \


# ── Help ─────────────────────────────────────────────────────────────────────

help:
	@echo ""
	@echo "Ragify - Adaptive RAG System"
	@echo "─────────────────────────────────────────"
	@echo "make infra"
	@echo ""


# ── Setup ─────────────────────────────────────────────────────────────────────



# ── Run ─────────────────────────────────────────────────────────────────────

infra-up:
	cd infra/docker && \
    docker compose --env-file=../../.env up -d

infra-down:
	cd infra/docker && \
    docker compose --env-file=../../.env down

ragify-server:
	python -m src.ragify.grpc

grpc-gen:
	bash scripts/gen_ragify_grpc.sh


# ── Build ─────────────────────────────────────────────────────────────────────




# ── Keys ─────────────────────────────────────────────────────────────────────
