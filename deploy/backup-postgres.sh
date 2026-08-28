#!/bin/sh
set -eu

mkdir -p /backups

while true; do
  timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
  temporary="/backups/${PGDATABASE}-${timestamp}.sql.gz.partial"
  destination="/backups/${PGDATABASE}-${timestamp}.sql.gz"

  pg_dump --clean --if-exists --no-owner --no-privileges | gzip -9 > "$temporary"
  mv "$temporary" "$destination"
  find /backups -type f -name '*.sql.gz' -mtime "+${BACKUP_RETENTION_DAYS}" -delete

  sleep 86400
done
