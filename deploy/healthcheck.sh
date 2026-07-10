#!/usr/bin/env bash
# Vigila que el portfolio y la demo respondan, y los levanta si no.
#
# ALCANCE: corre en la propia maquina. Detecta que gunicorn se ha muerto o se ha
# quedado colgado, y lo reinicia. NO puede avisar si el servidor entero cae:
# para eso hace falta un servicio externo (UptimeRobot, healthchecks.io...).
#
# Instalar:
#   ln -sf /var/www/danielmateu.es/deploy/healthcheck.service /etc/systemd/system/
#   ln -sf /var/www/danielmateu.es/deploy/healthcheck.timer   /etc/systemd/system/
#   systemctl daemon-reload && systemctl enable --now healthcheck.timer
set -uo pipefail

ESTADO="/var/lib/site-health"
mkdir -p "${ESTADO}"

# ruta -> servicio que la sirve
declare -A RUTAS=(
    ["/"]="gunicorn"
    ["/proyectos/"]="gunicorn"
    ["/proyectos/ready4padel/"]="ready4padel"
)

comprobar() {
    # 3 intentos antes de dar por muerta una ruta: un timeout aislado no es
    # una caida, y reiniciar gunicorn por un pico de carga seria peor.
    for _ in 1 2 3; do
        code=$(curl -sk --max-time 10 -o /dev/null -w '%{http_code}' \
               -H 'Host: danielmateu.es' "https://127.0.0.1$1" 2>/dev/null)
        [[ "${code}" =~ ^(200|301|302)$ ]] && return 0
        sleep 2
    done
    return 1
}

fallos=0
declare -A ya_reiniciado=()

for ruta in "${!RUTAS[@]}"; do
    servicio="${RUTAS[$ruta]}"
    if comprobar "${ruta}"; then
        continue
    fi

    fallos=$((fallos + 1))
    logger -t healthcheck "FALLO: ${ruta} no responde (servicio ${servicio})"

    if [[ -z "${ya_reiniciado[$servicio]:-}" ]]; then
        ya_reiniciado[$servicio]=1
        logger -t healthcheck "reiniciando ${servicio}"
        systemctl restart "${servicio}" && sleep 5
        if comprobar "${ruta}"; then
            logger -t healthcheck "RECUPERADO: ${ruta} tras reiniciar ${servicio}"
            fallos=$((fallos - 1))
        else
            logger -t healthcheck "SIGUE CAIDO: ${ruta} tras reiniciar ${servicio}"
        fi
    fi
done

# Si han caido TODAS las rutas, el problema no es gunicorn: es nginx, que es por
# donde pasan todas. Reiniciar los backends no arregla nada.
if (( fallos == ${#RUTAS[@]} )); then
    logger -t healthcheck "todas las rutas caidas: reiniciando nginx"
    systemctl restart nginx && sleep 3
    fallos=0
    for ruta in "${!RUTAS[@]}"; do
        comprobar "${ruta}" || fallos=$((fallos + 1))
    done
    (( fallos == 0 )) && logger -t healthcheck "RECUPERADO: nginx reiniciado"
fi

if (( fallos == 0 )); then
    date -Iseconds > "${ESTADO}/ULTIMO_OK"
    rm -f "${ESTADO}/FALLANDO"
else
    date -Iseconds > "${ESTADO}/FALLANDO"
    exit 1
fi
