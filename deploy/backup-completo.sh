#!/usr/bin/env bash
# Copia COMPLETA del servidor en un solo archivo, para bajarla al disco externo.
#
# backup.sh (diario) solo cubre el portfolio y se queda en este mismo disco: si
# el disco muere, muere con el. Esto mete en UN .tar.gz todo lo necesario para
# levantar el servidor entero en una maquina nueva:
#
#   bd/        un volcado por base PostgreSQL + los roles, y copia en caliente
#              (consistente) de cada SQLite, en bd/sqlite/<su ruta original>
#   var/www/   todos los proyectos: codigo, .git, .env, media
#              (sin venv, node_modules ni staticfiles: se regeneran)
#   var/lib/   datos que viven fuera de /var/www (videos de marketing,
#              importaciones de la tienda...)
#   etc/       nginx, systemd, cron, certificados, fail2ban, postgres, ssh
#   entorno/   pip freeze de cada venv, paquetes apt, servicios activos
#   LEEME.txt  que hay dentro y como restaurarlo
#
# Uso (como root):   backup-completo
#   Deja el archivo en /var/backups/completo/ (guarda los 3 ultimos) e imprime
#   el comando para bajarlo desde el PC de Windows.
#
# Instalar el atajo:
#   ln -sf /var/www/danielmateu.es/deploy/backup-completo.sh /usr/local/bin/backup-completo
set -euo pipefail
cd /   # sudo -u postgres se queja si no puede entrar en el directorio actual

DEST="/var/backups/completo"
GUARDAR=3
STAMP="$(date +%F_%H%M)"
NOMBRE="portfolio-completo-${STAMP}"
FINAL="${DEST}/${NOMBRE}.tar.gz"
PARCIAL="${DEST}/.${NOMBRE}.tar.gz.parcial"   # solo se renombra si todo sale bien
DISCO_PC='D:\backups_portfolio'
SSH_HOST="Portfolio"   # alias de ~/.ssh/config en el PC (ver DEPLOY-HETZNER.md)

# Datos de las apps fuera de /var/www (rutas DB_PATH, MEDIA_ROOT... de los .env)
DATOS_APPS=(bicis ciclossarabia marketing marketing-dev papeleria ready4padel restaurante)

fallo() { echo "COPIA FALLIDA: $*" >&2; exit 1; }

mkdir -p "${DEST}"
chmod 700 "${DEST}"   # dentro van los .env y los volcados: solo root

libre_mb="$(df -Pm "${DEST}" | awk 'NR==2 {print $4}')"
(( libre_mb > 3000 )) || fallo "solo quedan ${libre_mb} MB libres en el disco"

W="$(mktemp -d "${DEST}/.trabajo.XXXXXX")"
trap 'rm -rf "${W}" "${PARCIAL}"' EXIT
mkdir -p "${W}/bd/sqlite" "${W}/entorno/pip-freeze"

# ---------------------------------------------------------------------------
# 1) PostgreSQL: roles + un volcado por base (sin las test_* que deja Django)
# ---------------------------------------------------------------------------
echo "Bases de datos PostgreSQL:"
sudo -u postgres pg_dumpall --globals-only > "${W}/bd/postgres-roles.sql"

mapfile -t BASES < <(sudo -u postgres psql -Atc "
    SELECT datname FROM pg_database
    WHERE NOT datistemplate AND datname <> 'postgres' AND datname NOT LIKE 'test\_%'
    ORDER BY 1")

for db in "${BASES[@]}"; do
    dump="${W}/bd/${db}.dump"
    sudo -u postgres pg_dump -Fc "${db}" > "${dump}"
    # El volcado tiene que listarse entero y traer todas las tablas de la base
    en_bd="$(sudo -u postgres psql -At -d "${db}" -c \
        "SELECT count(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema')")"
    en_dump="$(pg_restore -l "${dump}" | grep -c ' TABLE [a-z_]* ' || true)"
    [[ "${en_bd}" == "${en_dump}" ]] \
        || fallo "${db}: la base tiene ${en_bd} tablas pero el volcado ${en_dump}"
    printf '  %-20s %3s tablas  %s\n' "${db}" "${en_bd}" "$(du -h "${dump}" | cut -f1)"
done

# ---------------------------------------------------------------------------
# 2) SQLite: copia con la API de backup (un cp de una base en uso puede salir
#    a medias). Las originales se excluyen del tar (solo bajo var/, de ahi el
#    --anchored) y van aqui, en bd/sqlite/<ruta original>.
# ---------------------------------------------------------------------------
echo "Bases SQLite:"
mapfile -t SQLITES < <(find /var/www "${DATOS_APPS[@]/#//var/lib/}" \
    -name '*.sqlite3' -type f -size +0 -not -path '*/venv/*' 2>/dev/null | sort -u)

for src in "${SQLITES[@]}"; do
    dst="${W}/bd/sqlite${src}"
    mkdir -p "$(dirname "${dst}")"
    python3 - "${src}" "${dst}" <<'PY'
import sqlite3, sys
origen = sqlite3.connect(f"file:{sys.argv[1]}?mode=ro", uri=True)
copia = sqlite3.connect(sys.argv[2])
origen.backup(copia)
ok = copia.execute("PRAGMA integrity_check").fetchone()[0]
copia.close(); origen.close()
sys.exit(0 if ok == "ok" else f"integrity_check: {ok}")
PY
    chown --reference="${src}" "${dst}"
    chmod --reference="${src}" "${dst}"
    printf '  %-45s %s\n' "${src}" "$(du -h "${dst}" | cut -f1)"
done

# ---------------------------------------------------------------------------
# 3) Entorno: lo necesario para recrear venvs y paquetes con las mismas versiones
# ---------------------------------------------------------------------------
for venv in $(find /var/www -maxdepth 3 -type d \( -name venv -o -name .venv \) -not -path '*/node_modules/*'); do
    proyecto="$(basename "$(dirname "${venv}")")"
    {
        echo "# $("${venv}/bin/python" --version 2>&1) — ${venv}"
        "${venv}/bin/python" -m pip freeze 2>/dev/null
    } > "${W}/entorno/pip-freeze/${proyecto}.txt" || true
done
apt-mark showmanual > "${W}/entorno/paquetes-apt.txt"
systemctl list-unit-files --state=enabled --no-legend > "${W}/entorno/servicios-activos.txt"
for u in $(ls /var/spool/cron/crontabs 2>/dev/null); do
    crontab -l -u "${u}" > "${W}/entorno/crontab-${u}.txt" 2>/dev/null || true
done

# ---------------------------------------------------------------------------
# 4) LEEME
# ---------------------------------------------------------------------------
cat > "${W}/LEEME.txt" <<EOF
COPIA COMPLETA DEL SERVIDOR — danielmateu.es y todos sus proyectos
Fecha:    $(date '+%F %H:%M %Z')
Servidor: $(hostname) ($(curl -s -m 5 http://169.254.169.254/hetzner/v1/metadata/public-ipv4 || echo 'IP desconocida')), Hetzner nbg1
Sistema:  $(. /etc/os-release; echo "${PRETTY_NAME}"), PostgreSQL $(sudo -u postgres psql -Atc 'SHOW server_version' | cut -d' ' -f1)

ATENCION: contiene los .env (claves, contraseñas de BD, tokens de redes) y datos
personales de clientes de la tienda. Guardalo en un sitio seguro.

QUE HAY DENTRO
  bd/postgres-roles.sql    usuarios de PostgreSQL con sus contraseñas
  bd/<base>.dump           una base por fichero: ${BASES[*]}
  bd/sqlite/...            SQLite copiadas en caliente, con su ruta original
  var/www/                 todos los proyectos (sin venv, node_modules ni staticfiles)
  var/lib/                 datos de las apps fuera de /var/www
  etc/                     nginx, systemd, cron, letsencrypt, fail2ban, postgresql, ssh
  entorno/                 pip freeze por proyecto, paquetes apt, servicios activos, crontabs
  No incluye Redis: solo es cache y cola de tareas, se rellena solo.

RESTAURAR UN SOLO PROYECTO (ej. marketing), en el servidor actual
  mkdir /root/r && tar xzf ${NOMBRE}.tar.gz -C /root/r
  systemctl stop marketing marketing-q
  sudo -u postgres pg_restore --clean --if-exists -d marketing /root/r/bd/marketing.dump
  rsync -a /root/r/var/lib/marketing/ /var/lib/marketing/      # si hace falta
  systemctl start marketing marketing-q
  Una SQLite: cp -a /root/r/bd/sqlite/var/lib/bicis/db.sqlite3 /var/lib/bicis/

RESTAURAR TODO EN UN SERVIDOR NUEVO (Ubuntu 24.04)
  1. apt-get update && xargs -a entorno/paquetes-apt.txt apt-get install -y
  2. tar xzf ${NOMBRE}.tar.gz -C /root/r
     cp -a /root/r/var/www/. /var/www/   ;   cp -a /root/r/var/lib/. /var/lib/
     cp -a /root/r/etc/. /etc/           (revisa antes etc/ssh si cambias de clave)
     cp -a /root/r/bd/sqlite/. /
  3. sudo -u postgres psql -f /root/r/bd/postgres-roles.sql
     for f in /root/r/bd/*.dump; do sudo -u postgres pg_restore --create -d postgres "\$f"; done
  4. En cada proyecto:  python3 -m venv venv
                        venv/bin/pip install -r /root/r/entorno/pip-freeze/<proyecto>.txt
                        venv/bin/python manage.py collectstatic --noinput
  5. systemctl daemon-reload && systemctl enable --now <servicios de entorno/servicios-activos.txt>
     nginx -t && systemctl reload nginx
  6. Apunta el DNS a la IP nueva (los certificados de etc/letsencrypt siguen valiendo).
EOF

# ---------------------------------------------------------------------------
# 5) Empaquetar
# ---------------------------------------------------------------------------
SISTEMA=()
for p in etc/nginx etc/letsencrypt etc/systemd/system etc/cron.d etc/cron.daily \
         etc/fail2ban etc/postgresql etc/redis etc/ssh/sshd_config etc/ssh/sshd_config.d \
         etc/sudoers.d etc/logrotate.d etc/update-motd.d etc/hosts \
         root/.ssh/authorized_keys usr/local/bin var/spool/cron/crontabs; do
    [[ -e "/${p}" || -L "/${p}" ]] && SISTEMA+=("${p}")
done
DATOS=()
for app in "${DATOS_APPS[@]}"; do
    [[ -d "/var/lib/${app}" ]] && DATOS+=("var/lib/${app}")
done

echo "Empaquetando (medio minuto aprox.)..."
rc=0
nice -n 10 ionice -c3 tar -czf "${PARCIAL}" \
    --warning=no-file-changed --warning=no-file-removed --warning=no-file-ignored \
    --exclude=venv --exclude=.venv --exclude=node_modules --exclude=staticfiles \
    --exclude=__pycache__ --exclude='*.pyc' --exclude=.cache \
    --exclude='var/lib/marketing/tmp' \
    --anchored --exclude='var/*.sqlite3' --exclude='var/*.sqlite3-journal' \
    --exclude='var/*.sqlite3-wal' --exclude='var/*.sqlite3-shm' \
    -C "${W}" LEEME.txt bd entorno \
    -C / var/www "${DATOS[@]}" "${SISTEMA[@]}" || rc=$?
# 1 = algun fichero cambio mientras se leia (logs, sesiones): no invalida la copia
(( rc <= 1 )) || fallo "tar termino con codigo ${rc}"

# ---------------------------------------------------------------------------
# 6) Verificar el archivo y publicarlo
# ---------------------------------------------------------------------------
gzip -t "${PARCIAL}" || fallo "el archivo esta corrupto"
LISTA="$(tar tzf "${PARCIAL}")"
for imprescindible in LEEME.txt bd/postgres-roles.sql bd/danielmateu.dump \
                      var/www/danielmateu.es/manage.py var/www/danielmateu.es/.env \
                      etc/nginx/sites-available/danielmateu; do
    grep -qx "${imprescindible}" <<< "${LISTA}" || fallo "falta ${imprescindible} en el archivo"
done
for src in "${SQLITES[@]}"; do
    grep -qx "bd/sqlite${src}" <<< "${LISTA}" || fallo "falta la copia de ${src} en el archivo"
done

chmod 600 "${PARCIAL}"
mv "${PARCIAL}" "${FINAL}"
( cd "${DEST}" && sha256sum "${NOMBRE}.tar.gz" > "${NOMBRE}.tar.gz.sha256" )

# Rotacion: solo las ${GUARDAR} ultimas en el servidor (el historico vive en el disco externo)
ls -1t "${DEST}"/portfolio-completo-*.tar.gz | tail -n +$((GUARDAR + 1)) \
    | while read -r viejo; do rm -f "${viejo}" "${viejo}.sha256"; done

TAM="$(du -h "${FINAL}" | cut -f1)"
HASH="$(cut -d' ' -f1 "${FINAL}.sha256")"
cat <<EOF

Copia verificada: ${FINAL}
  Tamaño:  ${TAM}   ($(wc -l <<< "${LISTA}") elementos)
  SHA256:  ${HASH}

Para bajarla al disco externo, en PowerShell en el PC:

  mkdir ${DISCO_PC} -Force > \$null; scp ${SSH_HOST}:${FINAL} ${DISCO_PC}\\

EOF
