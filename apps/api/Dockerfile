FROM python:3.11-slim

WORKDIR /app

# system deps
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# copy only required files
COPY pyproject.toml .
COPY src ./src
COPY apps/api ./apps/api

# install package
RUN pip install --no-cache-dir .

# run server
CMD ["uvicorn", "apps.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
