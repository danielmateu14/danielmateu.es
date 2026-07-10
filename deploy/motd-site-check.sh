#!/usr/bin/env bash
# Avisa al entrar por SSH si el healthcheck no consigue levantar la web.
#   ln -sf /var/www/danielmateu.es/deploy/motd-site-check.sh /etc/update-motd.d/98-site-check
if [[ -f /var/lib/site-health/FALLANDO ]]; then
    printf '\n  \033[1;31m!! La web NO responde desde %s\033[0m\n' "$(cat /var/lib/site-health/FALLANDO)"
    printf '     El healthcheck ya intento reiniciar los servicios y no basto.\n'
    printf '     Mira: journalctl -t healthcheck -n 30\n\n'
fi
