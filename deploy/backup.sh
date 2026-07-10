#!/usr/bin/env bash
# Copia de seguridad diaria: base de datos + imagenes subidas.
#
# Las imagenes que subes por el admin viven SOLO en el disco de este servidor
# (no van a git), asi que sin esto un servidor destruido = contenido perdido.
#
# Instalar el cron (como root):
#   ln -sf /var/www/danielmateu.es/deploy/backup.sh /etc/cron.daily/danielmateu-backup
#
# Restaurar:
#   gunzip -c /var/backups/danielmateu/db-FECHA.sql.gz | sudo -u postgres psql danielmateu
#   tar xzf /var/backups/danielmateu/media-FECHA.tar.gz -C /var/www/danielmateu.es
set -euo pipefail

APP_DIR="/var/www/danielmateu.es"
DEST="/var/backups/danielmateu"
KEEP_DAYS=14
STAMP="$(date +%F)"

mkdir -p "${DEST}"

sudo -u postgres pg_dump danielmateu | gzip > "${DEST}/db-${STAMP}.sql.gz"
tar czf "${DEST}/media-${STAMP}.tar.gz" -C "${APP_DIR}" media

find "${DEST}" -name '*.gz' -mtime +${KEEP_DAYS} -delete

echo "Backup en ${DEST} (${STAMP})"
