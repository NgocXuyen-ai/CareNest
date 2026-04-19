#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.prod"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [ -z "${SERVER_NAME:-}" ] || [ -z "${LETSENCRYPT_EMAIL:-}" ]; then
  echo "SERVER_NAME and LETSENCRYPT_EMAIL must be set in .env.prod"
  exit 1
fi

mkdir -p "$ROOT_DIR/deploy/certbot/conf" "$ROOT_DIR/deploy/certbot/www"

docker run --rm -p 80:80 \
  -v "$ROOT_DIR/deploy/certbot/conf:/etc/letsencrypt" \
  -v "$ROOT_DIR/deploy/certbot/www:/var/www/certbot" \
  certbot/certbot certonly --standalone \
  --non-interactive \
  --agree-tos \
  --email "$LETSENCRYPT_EMAIL" \
  -d "$SERVER_NAME"

echo "Certificate issued for $SERVER_NAME"
