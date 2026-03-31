#!/usr/bin/env bash

set -e

BASE_URL='http://localhost:8000'
MONGO_PATH="mongodb://myuser:mypassword@localhost:27017/ragify?authSource=admin"

source .venv/bin/activate

case "$1" in
    dev)
        fastapi dev main.py
    ;;


    #  curl commands
    root)
        curl -X GET $BASE_URL
    ;;


    # workspaces
    workspaces)
        curl -X GET $BASE_URL/api/workspaces \
        -H "Content-Type: application/json" \
        -d "{
                \"user_id\": \"$2\"
            }"
    ;;

    workspace)
        curl -X POST $BASE_URL/api/workspaces \
        -H "Content-Type: application/json" \
        -d "{
                \"user_id\": \"$2\"
            }"
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

    # Data initialization
    create_collections)
        mongosh $MONGO_PATH --eval '
            db.createCollection("users")
            db.createCollection("workspaces")
            db.createCollection("sessions")
        '
    ;;

    # Delete collections
    drop_collections)
        mongosh $MONGO_PATH --eval '
            db.users.drop()
            db.workspaces.drop()
            db.sessions.drop()
        '
    ;;

    # insert_workspace)
    #     db.workspaces.insertOne({
    #         user_id: $2,

    #     })

    *)
        echo "Usage: $0 {dev|root|upload|query}"
        exit 1
    ;;
esac
