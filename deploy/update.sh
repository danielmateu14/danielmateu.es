#!/usr/bin/env bash
# Actualiza el sitio en la VM tras hacer cambios y push a GitHub.
# Uso (dentro de la VM):  bash deploy/update.sh
set -euo pipefail

APP_DIR="/home/ubuntu/danielmateu.es"
cd "${APP_DIR}"

echo ">>> git pull..."
git pull

echo ">>> dependencias..."
./venv/bin/pip install -r requirements.txt

echo ">>> migraciones + estáticos..."
set -a; source "${APP_DIR}/.env"; set +a
./venv/bin/python manage.py migrate --noinput
./venv/bin/python manage.py collectstatic --noinput

echo ">>> reiniciando gunicorn..."
sudo systemctl restart gunicorn

echo ">>> Hecho. https://danielmateu.es"
