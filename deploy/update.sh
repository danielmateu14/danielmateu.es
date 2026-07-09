#!/usr/bin/env bash
# Actualiza el sitio tras hacer push a GitHub.
# Uso (dentro del servidor, como root):  bash deploy/update.sh
set -euo pipefail

APP_DIR="/var/www/danielmateu.es"
cd "${APP_DIR}"

echo ">>> git pull..."
git pull

echo ">>> dependencias..."
./venv/bin/pip install -r requirements.txt

echo ">>> migraciones + estaticos..."
set -a; source "${APP_DIR}/.env"; set +a
./venv/bin/python manage.py migrate --noinput
./venv/bin/python manage.py collectstatic --noinput

# El pull y el collectstatic corren como root: devuelve los ficheros a www-data,
# o gunicorn no podra escribir en media/ y nginx no leera los estaticos nuevos.
chown -R www-data:www-data "${APP_DIR}/media" "${APP_DIR}/staticfiles"

echo ">>> reiniciando gunicorn..."
systemctl restart gunicorn

echo ">>> Hecho. https://danielmateu.es"
