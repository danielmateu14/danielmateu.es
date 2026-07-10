#!/usr/bin/env bash
# Copia de seguridad diaria: base de datos + imagenes subidas + configuracion.
#
# Las imagenes que subes por el admin viven SOLO en el disco de este servidor
# (no van a git), asi que sin esto un servidor destruido = contenido perdido.
#
# El script se verifica a si mismo: compara lo que hay en la BD con lo que
# acaba de escribir en el dump, y comprueba que el tar se puede leer. Sin esto,
# un dump vacio se guardaba como si nada y el fallo solo se descubria el dia
# que hacia falta restaurar.
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
DB="danielmateu"

mkdir -p "${DEST}"
chmod 700 "${DEST}"   # los dumps y el .env no son para todo el mundo

fallo() { echo "BACKUP FALLIDO: $*" >&2; exit 1; }

# ---------------------------------------------------------------------------
# 1) Base de datos
# ---------------------------------------------------------------------------
DB_GZ="${DEST}/db-${STAMP}.sql.gz"
sudo -u postgres pg_dump "${DB}" | gzip > "${DB_GZ}"

# Comprobar que el dump refleja de verdad la BD. Se cuenta una tabla con
# contenido real; si la BD esta vacia el backup se hace igual, pero avisa.
filas_en_bd() {
    sudo -u postgres psql -At -d "${DB}" -c "SELECT count(*) FROM $1"
}
filas_en_dump() {
    # el bloque COPY termina en una linea con solo "\."
    gunzip -c "${DB_GZ}" \
        | awk -v t="COPY public.$1 " 'index($0,t)==1 {p=1;next} p&&/^\\\.$/{exit} p{n++} END{print n+0}'
}

gunzip -t "${DB_GZ}" 2>/dev/null || fallo "el dump ${DB_GZ} esta corrupto"

for tabla in proyectos_proyecto proyectos_tecnologia proyectos_imagenproyecto; do
    en_bd="$(filas_en_bd "${tabla}")"
    en_dump="$(filas_en_dump "${tabla}")"
    [[ "${en_bd}" == "${en_dump}" ]] \
        || fallo "${tabla}: la BD tiene ${en_bd} filas pero el dump ${en_dump}"
    echo "  ${tabla}: ${en_bd} filas respaldadas"
done

if [[ "$(filas_en_bd proyectos_proyecto)" -eq 0 ]]; then
    echo "  AVISO: no hay ningun proyecto en la BD. El backup es correcto," >&2
    echo "         pero no hay nada que respaldar. ¿Es esto lo esperado?" >&2
fi

# ---------------------------------------------------------------------------
# 2) Imagenes subidas
# ---------------------------------------------------------------------------
MEDIA_GZ="${DEST}/media-${STAMP}.tar.gz"
tar czf "${MEDIA_GZ}" -C "${APP_DIR}" media
tar tzf "${MEDIA_GZ}" >/dev/null 2>&1 || fallo "el tar ${MEDIA_GZ} no se puede leer"

en_disco="$(find "${APP_DIR}/media" -type f | wc -l)"
en_tar="$(tar tzf "${MEDIA_GZ}" | grep -vc '/$' || true)"
[[ "${en_disco}" == "${en_tar}" ]] \
    || fallo "media: ${en_disco} ficheros en disco pero ${en_tar} en el tar"
echo "  media: ${en_disco} ficheros respaldados"

# ---------------------------------------------------------------------------
# 3) Configuracion (SECRET_KEY, credenciales de la BD). Sin esto, restaurar en
#    una maquina nueva obliga a reconstruir el .env a mano.
# ---------------------------------------------------------------------------
CONF_GZ="${DEST}/config-${STAMP}.tar.gz"
tar czf "${CONF_GZ}" -C / \
    var/www/danielmateu.es/.env \
    etc/nginx/sites-available/danielmateu \
    etc/systemd/system/gunicorn.service 2>/dev/null || true
chmod 600 "${CONF_GZ}"

# ---------------------------------------------------------------------------
# 4) Rotacion y marca de exito
# ---------------------------------------------------------------------------
find "${DEST}" -name '*.gz' -mtime +${KEEP_DAYS} -delete
date -Iseconds > "${DEST}/ULTIMO_OK"

echo "Backup verificado en ${DEST} (${STAMP})"
