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

# Warm-up: hacer una query simple para establecer conexión con la DB
echo "Verificando conexión a la base de datos..."
python manage.py shell -c "from django.db import connection; connection.ensure_connection(); print('Conexión a DB establecida')" || echo "Advertencia: No se pudo verificar la conexión a DB"

# Determinar el puerto (Railway usa PORT, por defecto 8080)
PORT=${PORT:-8080}
echo "Iniciando servidor Gunicorn en puerto $PORT..."
echo "Variables de entorno: PORT=$PORT"

exec gunicorn portfolio.wsgi \
    --bind 0.0.0.0:$PORT \
    --workers 1 \
    --threads 2 \
    --timeout 120 \
    --log-level info \
    --access-logfile - \
    --error-logfile -
