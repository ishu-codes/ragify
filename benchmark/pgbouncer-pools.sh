#!/usr/bin/env bash

export PGPASSWORD='ragify'

printf "%-12s %14s %16s %12s\n" \
    "DATABASE" "CLIENTS" "SERVERS" "WAIT"

printf "%-12s %8s %8s %8s %8s %8s\n" \
    "" "active" "wait" "active" "idle" "max"

printf '%s\n' "------------------------------------------------------------"

psql -h localhost -p 6432 -U ragify -d pgbouncer -At -F '|' \
    -c "SHOW POOLS;" |
awk -F'|' '
{
    printf "%-12s %8s %8s %8s %8s %8s\n",
        $1,    # database
        $3,    # cl_active
        $4,    # cl_waiting
        $7,    # sv_active
        $9,    # sv_idle
        $13    # maxwait
}'
