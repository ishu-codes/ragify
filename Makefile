# Ragify - Adaptive RAG System Makefile

.PHONY: \
	help \
	install-docker \
	infra-up infra-down \
	api-java-up api-java-down \
	logs \
	ragify-server grpc-gen \
	test-api-python \


# ── Help ─────────────────────────────────────────────────────────────────────

help:
	@echo ""
	@echo "Ragify - Adaptive RAG System"
	@echo "─────────────────────────────────────────"
	@echo "make infra"
	@echo ""


# ── Setup ─────────────────────────────────────────────────────────────────────

install-docker:
	sudo apt remove $(dpkg --get-selections docker.io docker-compose docker-compose-v2 docker-doc docker-buildx podman-docker containerd runc | cut -f1)

	# Add Docker's official GPG key:
	sudo apt update
	sudo apt install ca-certificates curl
	sudo install -m 0755 -d /etc/apt/keyrings
	sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
	sudo chmod a+r /etc/apt/keyrings/docker.asc

	# Add the repository to Apt sources:
	sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
	Types: deb
	URIs: https://download.docker.com/linux/ubuntu
	Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
	Components: stable
	Architectures: $(dpkg --print-architecture)
	Signed-By: /etc/apt/keyrings/docker.asc
	EOF

	sudo apt update


	sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

	sudo systemctl start docker


# ── Run ─────────────────────────────────────────────────────────────────────

infra-up:
	cd infra/docker && \
    docker compose --env-file=../../.env up -d

infra-down:
	cd infra/docker && \
    docker compose --env-file=../../.env down

api-java-up:
	cd infra/docker && \
    docker compose -f docker-compose.api-java.yml --env-file=../../.env up -d --build

api-java-down:
	cd infra/docker && \
    docker compose -f docker-compose.api-java.yml --env-file=../../.env down

ragify-server:
	cd rag && .venv/bin/python -m src.grpc


grpc-gen:
	cd rag && bash scripts/gen_ragify_grpc.sh


# ── Build ─────────────────────────────────────────────────────────────────────

# ── Logs ─────────────────────────────────────────────────────────────────────

logs:
	cd infra/docker && \
	docker compose logs $(s) --tail=100

# ── Test ─────────────────────────────────────────────────────────────────────

test-api-python:
	cd api-python && .venv/bin/python -m pytest tests -v


# ── Keys ─────────────────────────────────────────────────────────────────────
