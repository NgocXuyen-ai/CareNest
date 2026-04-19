#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.prod.yml"
ENV_FILE="$ROOT_DIR/.env.prod"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE"
  echo "Create $ENV_FILE before deploying."
  exit 1
fi

if grep -q $'\r' "$ENV_FILE"; then
  echo "$ENV_FILE contains Windows CRLF line endings."
  echo "Run: dos2unix $ENV_FILE"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [ -z "${SERVER_NAME:-}" ]; then
  echo "SERVER_NAME is required in .env.prod"
  exit 1
fi

if [ -z "${SPRING_DATASOURCE_URL:-}" ]; then
  echo "SPRING_DATASOURCE_URL is required in .env.prod"
  exit 1
fi

DB_HOST="$(echo "$SPRING_DATASOURCE_URL" | sed -E 's#^jdbc:postgresql://([^/:?]+).*$#\1#')"
if [ -n "$DB_HOST" ] && ! getent hosts "$DB_HOST" >/dev/null 2>&1; then
  echo "Cannot resolve database host from SPRING_DATASOURCE_URL: $DB_HOST"
  echo "Fix DNS on VPS or update the connection string."
  exit 1
fi

SSL_CERT_PATH="${SSL_CERT_PATH:-/etc/nginx/certs/origin.crt}"
SSL_KEY_PATH="${SSL_KEY_PATH:-/etc/nginx/certs/origin.key}"

if [[ "$SSL_CERT_PATH" == /etc/nginx/certs/* ]]; then
  HOST_CERT_PATH="$ROOT_DIR/deploy/certs/${SSL_CERT_PATH#/etc/nginx/certs/}"
  if [ ! -f "$HOST_CERT_PATH" ]; then
    echo "TLS certificate file not found: $HOST_CERT_PATH"
    exit 1
  fi
else
  echo "Skipping certificate precheck for SSL_CERT_PATH=$SSL_CERT_PATH"
fi

if [[ "$SSL_KEY_PATH" == /etc/nginx/certs/* ]]; then
  HOST_KEY_PATH="$ROOT_DIR/deploy/certs/${SSL_KEY_PATH#/etc/nginx/certs/}"
  if [ ! -f "$HOST_KEY_PATH" ]; then
    echo "TLS key file not found: $HOST_KEY_PATH"
    exit 1
  fi
else
  echo "Skipping certificate precheck for SSL_KEY_PATH=$SSL_KEY_PATH"
fi

cd "$ROOT_DIR"

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --remove-orphans

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
