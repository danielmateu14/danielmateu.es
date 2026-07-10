#!/usr/bin/env bash
# Avisa al entrar por SSH si el backup diario lleva demasiado sin funcionar.
#
# cron manda los errores por correo, pero en esta maquina no hay MTA: el aviso
# se perderia. Esto lo pone donde si se ve.
#
# Instalar (como root):
#   ln -sf /var/www/danielmateu.es/deploy/motd-backup-check.sh \
#          /etc/update-motd.d/99-backup-check
MARCA="/var/backups/danielmateu/ULTIMO_OK"
MAX_HORAS=36   # el cron corre a diario; 36h da margen a un dia saltado

if [[ ! -f "${MARCA}" ]]; then
    printf '\n  \033[1;31m!! El backup de danielmateu.es no se ha completado NUNCA\033[0m\n'
    printf '     Revisa: /etc/cron.daily/danielmateu-backup\n\n'
    exit 0
fi

edad_h=$(( ( $(date +%s) - $(date -r "${MARCA}" +%s) ) / 3600 ))
if (( edad_h > MAX_HORAS )); then
    printf '\n  \033[1;31m!! El ultimo backup correcto fue hace %s horas\033[0m\n' "${edad_h}"
    printf '     Ejecuta a mano: /etc/cron.daily/danielmateu-backup\n\n'
else
    printf '\n  \033[0;32mBackup verificado hace %sh\033[0m (%s)\n\n' \
        "${edad_h}" "$(cat "${MARCA}")"
fi
