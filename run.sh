#!/usr/bin/env bash

set -e

case "$1" in
    start)
        cd infra/docker && docker-compose \
            --env-file=../.env \
            up -d
    ;;

    stop)
        docker compose \
            --env-file=api/.env \
            down
    ;;

    *)
        echo "Usage: $0 {start|stop}"
        exit 1
    ;;
esac
