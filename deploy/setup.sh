#!/usr/bin/env bash
# =====================================================================
# Instalación automática de danielmateu.es en una VM Ubuntu 22.04
# (Oracle Cloud Always Free).
#
# USO (dentro de la VM, como usuario 'ubuntu'):
#   1) git clone https://github.com/danielmateu14/danielmateu.es.git
#   2) cd danielmateu.es
#   3) edita las VARIABLES de abajo (sobre todo DB_PASS y EMAIL)
#   4) bash deploy/setup.sh
#
# Es seguro re-ejecutarlo: salta lo que ya esté hecho.
# =====================================================================
set -euo pipefail

# ----------------------- VARIABLES A REVISAR -------------------------
DOMAIN="danielmateu.es"
DOMAIN_WWW="www.danielmateu.es"
EMAIL="TU_EMAIL@ejemplo.com"        # para el certificado HTTPS (Let's Encrypt)

DB_NAME="danielmateu"
DB_USER="danieldb"
DB_PASS="CAMBIA_ESTA_PASSWORD"      # contraseña del Postgres local

APP_DIR="/home/ubuntu/danielmateu.es"
# ---------------------------------------------------------------------

echo ">>> [1/8] Paquetes del sistema..."
sudo apt update
sudo apt install -y python3-venv python3-pip git nginx \
    postgresql postgresql-contrib libpq-dev build-essential \
    libjpeg-dev zlib1g-dev certbot python3-certbot-nginx

echo ">>> [2/8] Base de datos PostgreSQL..."
# Crea el rol y la BD solo si no existen.
sudo -u postgres psql <<SQL
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
      CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
   END IF;
END
\$\$;
SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec
\c ${DB_NAME}
GRANT ALL ON SCHEMA public TO ${DB_USER};
SQL

echo ">>> [3/8] Entorno virtual y dependencias..."
cd "${APP_DIR}"
python3 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt

echo ">>> [4/8] Archivo .env (si no existe)..."
if [ ! -f "${APP_DIR}/.env" ]; then
    SECRET=$(./venv/bin/python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
    cat > "${APP_DIR}/.env" <<ENV
SECRET_KEY=${SECRET}
DEBUG=False
ALLOWED_HOSTS=${DOMAIN},${DOMAIN_WWW}
DATABASE_URL=postgres://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}
ENV
    echo "    .env creado con SECRET_KEY nueva."
else
    echo "    .env ya existe, no se toca."
fi

echo ">>> [5/8] Migraciones, estáticos y carpeta media..."
set -a; source "${APP_DIR}/.env"; set +a
./venv/bin/python manage.py migrate --noinput
./venv/bin/python manage.py collectstatic --noinput
mkdir -p "${APP_DIR}/media"

echo ">>> [6/8] Servicio gunicorn (systemd)..."
sudo cp "${APP_DIR}/deploy/gunicorn.service" /etc/systemd/system/gunicorn.service
sudo systemctl daemon-reload
sudo systemctl enable --now gunicorn
sudo systemctl restart gunicorn

echo ">>> [7/8] Nginx..."
sudo cp "${APP_DIR}/deploy/nginx-danielmateu.conf" /etc/nginx/sites-available/danielmateu
sudo ln -sf /etc/nginx/sites-available/danielmateu /etc/nginx/sites-enabled/danielmateu
sudo rm -f /etc/nginx/sites-enabled/default
sudo usermod -aG ubuntu www-data || true
sudo chmod 750 /home/ubuntu
sudo nginx -t && sudo systemctl reload nginx

echo ">>> [8/8] HTTPS con Let's Encrypt..."
echo "    (Asegúrate de que el DNS de ${DOMAIN} ya apunta a esta VM)"
sudo certbot --nginx -d "${DOMAIN}" -d "${DOMAIN_WWW}" \
    --non-interactive --agree-tos -m "${EMAIL}" --redirect || \
    echo "    !! Certbot falló (¿DNS aún sin propagar?). Reintenta luego: sudo certbot --nginx -d ${DOMAIN} -d ${DOMAIN_WWW}"

echo ""
echo "=============================================="
echo " LISTO. Crea el superusuario del admin con:"
echo "   cd ${APP_DIR} && ./venv/bin/python manage.py createsuperuser"
echo " Visita: https://${DOMAIN}"
echo "=============================================="
