#!/usr/bin/env bash
# =====================================================================
# Instalación automática de danielmateu.es en un servidor Hetzner Cloud
# (Ubuntu 24.04 LTS, acceso como root).
#
# USO (dentro del servidor, como root):
#   mkdir -p /var/www && cd /var/www
#   git clone https://github.com/danielmateu14/danielmateu.es.git
#   cd danielmateu.es
#   EMAIL=tu@email.com bash deploy/setup.sh
#
# Es seguro re-ejecutarlo: salta lo que ya esté hecho.
# =====================================================================
set -euo pipefail

DOMAIN="${DOMAIN:-danielmateu.es}"
DOMAIN_WWW="${DOMAIN_WWW:-www.danielmateu.es}"
EMAIL="${EMAIL:?Define EMAIL=tu@email.com para los avisos de caducidad del certificado}"

DB_NAME="${DB_NAME:-danielmateu}"
DB_USER="${DB_USER:-danieldb}"

APP_DIR="/var/www/danielmateu.es"
APP_USER="www-data"

if [ "$(id -u)" -ne 0 ]; then
    echo "Ejecutalo como root." >&2
    exit 1
fi

echo ">>> [1/9] Paquetes del sistema..."
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y python3-venv python3-dev git nginx \
    postgresql postgresql-contrib libpq-dev build-essential \
    libjpeg-dev zlib1g-dev certbot python3-certbot-nginx \
    fail2ban unattended-upgrades

echo ">>> [2/9] Swap de 2 GB (el servidor viene sin swap)..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo 'vm.swappiness=10' > /etc/sysctl.d/99-swappiness.conf
    sysctl -p /etc/sysctl.d/99-swappiness.conf
else
    echo "    /swapfile ya existe."
fi

echo ">>> [3/9] PostgreSQL (rol + base de datos)..."
# La password se genera una sola vez y se guarda fuera del repo.
PW_FILE=/root/.danielmateu_db_password
if [ ! -f "${PW_FILE}" ]; then
    openssl rand -hex 24 > "${PW_FILE}"
    chmod 600 "${PW_FILE}"
fi
DB_PASS="$(cat "${PW_FILE}")"

sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
      CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
   ELSE
      ALTER ROLE ${DB_USER} PASSWORD '${DB_PASS}';
   END IF;
END
\$\$;
SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec
SQL
sudo -u postgres psql -v ON_ERROR_STOP=1 -d "${DB_NAME}" \
    -c "GRANT ALL ON SCHEMA public TO ${DB_USER};"

echo ">>> [4/9] Entorno virtual y dependencias..."
cd "${APP_DIR}"
git config --global --add safe.directory "${APP_DIR}" || true
[ -d venv ] || python3 -m venv venv
./venv/bin/pip install --upgrade pip wheel
./venv/bin/pip install -r requirements.txt

echo ">>> [5/9] Archivo .env..."
if [ ! -f "${APP_DIR}/.env" ]; then
    SECRET=$(./venv/bin/python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
    # Comillas simples: el secreto puede llevar $ # % & ... y asi lo leen igual
    # de bien `source` (bash) y `EnvironmentFile` (systemd).
    cat > "${APP_DIR}/.env" <<ENV
SECRET_KEY='${SECRET}'
DEBUG=False
ALLOWED_HOSTS='${DOMAIN},${DOMAIN_WWW}'
DATABASE_URL='postgres://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}'
ENV
    echo "    .env creado con SECRET_KEY nueva."
else
    echo "    .env ya existe, no se toca."
fi
chown root:${APP_USER} "${APP_DIR}/.env"
chmod 640 "${APP_DIR}/.env"

echo ">>> [6/9] Migraciones, estaticos y permisos..."
set -a; source "${APP_DIR}/.env"; set +a
mkdir -p "${APP_DIR}/media"
./venv/bin/python manage.py migrate --noinput
./venv/bin/python manage.py collectstatic --noinput
# Nginx sirve static/ y media/; gunicorn escribe en media/ al subir imagenes.
chown -R ${APP_USER}:${APP_USER} "${APP_DIR}/media" "${APP_DIR}/staticfiles"

echo ">>> [7/9] Servicio gunicorn (systemd)..."
cp "${APP_DIR}/deploy/gunicorn.service" /etc/systemd/system/gunicorn.service
systemctl daemon-reload
systemctl enable gunicorn
systemctl restart gunicorn

echo ">>> [8/9] Nginx..."
cp "${APP_DIR}/deploy/nginx-danielmateu.conf" /etc/nginx/sites-available/danielmateu
ln -sf /etc/nginx/sites-available/danielmateu /etc/nginx/sites-enabled/danielmateu
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ">>> [9/9] HTTPS con Let's Encrypt..."
echo "    (El DNS de ${DOMAIN} debe apuntar YA a la IP de este servidor)"
if certbot --nginx -d "${DOMAIN}" -d "${DOMAIN_WWW}" \
        --non-interactive --agree-tos -m "${EMAIL}" --redirect; then
    echo "    Certificado instalado."
else
    echo ""
    echo "    !! Certbot fallo (lo tipico: el DNS aun no ha propagado)."
    echo "    !! OJO: hasta que esto funcione el sitio NO carga, porque con"
    echo "    !! DEBUG=False Django redirige a https:// y todavia no hay 443."
    echo "    !! Reintenta: certbot --nginx -d ${DOMAIN} -d ${DOMAIN_WWW} --redirect"
fi

echo ""
echo "=============================================="
echo " LISTO. Crea el superusuario del admin con:"
echo "   cd ${APP_DIR} && set -a && source .env && set +a \\"
echo "     && ./venv/bin/python manage.py createsuperuser"
echo " Visita: https://${DOMAIN}"
echo "=============================================="
