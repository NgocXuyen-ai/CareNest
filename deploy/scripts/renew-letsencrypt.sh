#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

mkdir -p "$ROOT_DIR/deploy/certbot/conf" "$ROOT_DIR/deploy/certbot/www"

docker run --rm \
  -v "$ROOT_DIR/deploy/certbot/conf:/etc/letsencrypt" \
  -v "$ROOT_DIR/deploy/certbot/www:/var/www/certbot" \
  certbot/certbot renew --webroot -w /var/www/certbot

docker compose --env-file "$ROOT_DIR/.env.prod" -f "$ROOT_DIR/docker-compose.prod.yml" exec nginx nginx -s reload

echo "Certificate renewal complete"
