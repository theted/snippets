#!/usr/bin/env bash
set -euo pipefail

run_migration() {
  local migration=$1

  echo "Applying ${migration}..."

  if [[ -n "${DATABASE_URL:-}" ]]; then
    psql "$DATABASE_URL" --file="$migration"
  else
    local host=$2
    local port=$3
    local database=$4
    local user=$5
    local password=$6

    PGPASSWORD="$password" psql \
      --host="$host" \
      --port="$port" \
      --username="$user" \
      --dbname="$database" \
      --file="$migration"
  fi

  echo "Applied ${migration}."
  echo ""
}

if [[ -n "${DATABASE_URL:-}" ]]; then
  for migration in $(ls -1 db/migrations/*.sql | sort); do
    run_migration "$migration"
  done
  exit 0
fi

DB_HOST=${POSTGRES_HOST:-${RDS_HOST:-}}
DB_PORT=${POSTGRES_PORT:-${RDS_PORT:-5432}}
DB_NAME=${POSTGRES_DB:-${RDS_DB:-}}
DB_USER=${POSTGRES_USER:-${RDS_USER:-}}
DB_PASSWORD=${POSTGRES_PASSWORD:-${RDS_PASSWORD:-}}

if [[ -z "${DB_HOST:-}" || -z "${DB_NAME:-}" || -z "${DB_USER:-}" || -z "${DB_PASSWORD:-}" ]]; then
  echo "Missing DATABASE_URL or POSTGRES_*/RDS_* connection variables." >&2
  exit 1
fi

for migration in $(ls -1 db/migrations/*.sql | sort); do
  run_migration "$migration" "$DB_HOST" "$DB_PORT" "$DB_NAME" "$DB_USER" "$DB_PASSWORD"
done
