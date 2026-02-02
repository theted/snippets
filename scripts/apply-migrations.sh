#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${RDS_HOST:-}" || -z "${RDS_DB:-}" || -z "${RDS_USER:-}" || -z "${RDS_PASSWORD:-}" ]]; then
  echo "Missing required RDS_* environment variables." >&2
  exit 1
fi

RDS_PORT=${RDS_PORT:-5432}

for migration in $(ls -1 db/migrations/*.sql | sort); do
  echo "Applying ${migration}..."
  PGPASSWORD="$RDS_PASSWORD" psql \
    --host="$RDS_HOST" \
    --port="$RDS_PORT" \
    --username="$RDS_USER" \
    --dbname="$RDS_DB" \
    --file="$migration"
  echo "Applied ${migration}."
  echo ""
done
