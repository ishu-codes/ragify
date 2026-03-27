#!/usr/bin/env bash

set -e

BASE_URL='http://localhost:8000'

source .venv/bin/activate

case "$1" in
    dev)
        fastapi dev main.py
    ;;


    #  curl commands
    root)
        curl -X GET $BASE_URL
    ;;


    upload)
        curl -X POST $BASE_URL/api/docs/upload \
        -H "Content-Type: application/json" \
        -d '{
                "session_id": "123abc"
            }'
    ;;

    query)
        curl -X POST $BASE_URL/api/query \
        -H "Content-Type: application/json" \
        -d '{
                "session_id": "123abc",
                "query": "What is Rag?"
            }'
    ;;

    *)
        echo "Usage: $0 {dev|root|upload|query}"
        exit 1
    ;;
esac
