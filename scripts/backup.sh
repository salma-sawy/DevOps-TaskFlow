#!/usr/bin/env bash

set -euo pipefail


backup_dir="/opt/backups"

mkdir -p "$backup_dir"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)


set -a
source "$(dirname "$0")/../backend/.env"
set +a


PGPASSWORD="$PGPASSWORD" pg_dump -h "$PGHOST" -U "$PGUSER" "$PGDATABASE" > "$backup_dir/devopsapp_$TIMESTAMP.sql"
echo "Backup saved to $backup_dir/devopsapp_$TIMESTAMP.sql"
