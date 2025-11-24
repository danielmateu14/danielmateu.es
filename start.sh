#!/bin/bash
# Script de inicio para Railway con reintentos de migración

echo "Esperando a que la base de datos esté lista..."
sleep 5

# Intentar migraciones con reintentos
MAX_RETRIES=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "Intento de migración #$((RETRY_COUNT + 1))..."

    if python manage.py migrate --noinput; then
        echo "Migraciones aplicadas exitosamente"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo "Fallo en migración, reintentando en 10 segundos..."
            sleep 10
        else
            echo "ERROR: No se pudieron aplicar las migraciones después de $MAX_RETRIES intentos"
            exit 1
        fi
    fi
done

echo "Iniciando servidor Gunicorn..."
exec gunicorn portfolio.wsgi --bind 0.0.0.0:$PORT --workers 1 --threads 2 --timeout 120 --log-level info
