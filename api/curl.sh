#!/usr/bin/env bash

set -e

BASE_URL='http://localhost:8000'

case "$1" in
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
        echo "Usage: $0 {root|upload|query}"
        exit 1
    ;;
esac
