# Despliegue de danielmateu.es en Hetzner Cloud

Django + Gunicorn + Nginx + PostgreSQL + HTTPS (Let's Encrypt), en un solo
servidor. Acceso como `root` y codigo en `/var/www`, igual que el resto de tus
proyectos.

> Las imagenes que subes desde el admin se guardan en `media/`, en el disco del
> servidor. Persisten entre despliegues, pero **no** entre servidores: por eso
> hay un `deploy/backup.sh`.

---

## 1. Crear el servidor

En https://console.hetzner.cloud → **Add Server**:

| Campo | Valor | Por que |
|---|---|---|
| Location | **Nuremberg** o Falkenstein | Alemania, ~30 ms desde Espana |
| Type | **Shared → Cost-Optimized → Arm64 (Ampere) → CAX11** | 2 vCPU / 4 GB / 40 GB, lo mas barato que hay |
| Image | **Ubuntu 24.04 LTS** | Ver aviso abajo |
| Networking | Public IPv4 **+** IPv6 | Sin IPv4 media internet no te ve |
| SSH keys | La tuya (paso 2) | Si no, te mandan la password de root por email |
| Firewall | Uno nuevo: TCP 22, 80, 443 | Gratis, mejor que ufw |
| Backups | Opcional (+20%) | Lo cubre `deploy/backup.sh` |
| Name | `portfoliodaniel` | |

### No elijas Ubuntu 26.04

`requirements.txt` esta clavado a versiones de 2024. Con el Python que trae
26.04 (>= 3.13):

- `psycopg2-binary==2.9.9` no tiene wheels (llegaron en 2.9.10)
- `Pillow==10.4.0` tampoco
- `Django==4.2.15` soporta oficialmente hasta Python 3.12

`pip install` intentaria compilar desde fuente y lo mas probable es que reviente.
**Ubuntu 24.04 LTS trae Python 3.12**: todo instala desde wheel, sin compilar, y
tiene soporte hasta 2029.

### Sobre Arm64

El CAX11 y el CX23 son 2 vCPU / 4 GB / 40 GB, pero el ARM cuesta bastante menos.
Todas tus dependencias publican wheels `aarch64`, asi que no notaras diferencia.
Si prefieres no arriesgar, el CX23 (x86) funciona identico con esta misma guia.

---

## 2. Clave SSH

Sigues tu convencion de una clave por proyecto:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/portfolio -C "portfolio"
cat ~/.ssh/portfolio.pub          # pega esto en "SSH keys" de Hetzner
```

Ya tienes un `Host Portfolio` en `~/.ssh/config`, pero apunta a una IP vieja
(`46.224.182.9`) que Hetzner ya ha reciclado y hoy es de otra persona. Sustituye
la entrada por la IP nueva y anade la clave:

```
Host Portfolio
    HostName TU_IP_NUEVA
    User root
    IdentityFile ~/.ssh/portfolio
```

Y borra la huella antigua, o SSH se negara a conectar:

```bash
ssh-keygen -R 46.224.182.9
```

Ahora `ssh Portfolio` funciona, y con el la extension **Remote - SSH** de VSCode:
`F1` → *Remote-SSH: Connect to Host* → `Portfolio` → abre `/var/www/danielmateu.es`.

---

## 3. DNS

En el proveedor de `danielmateu.es`:

- **A** `danielmateu.es` → IP del servidor
- **A** `www` → la misma IP
- **AAAA** (opcional) para la IPv6

Espera a que propague **antes** del paso 5, o certbot fallara:

```bash
dig +short danielmateu.es
```

---

## 4. Traer el codigo

```bash
ssh Portfolio
mkdir -p /var/www && cd /var/www
git clone https://github.com/danielmateu14/danielmateu.es.git
cd danielmateu.es
```

## 5. Instalar

Un solo comando. Es idempotente: si algo falla, arreglalo y vuelve a lanzarlo.

```bash
EMAIL=tu@email.com bash deploy/setup.sh
```

Instala paquetes, crea 2 GB de swap, levanta PostgreSQL con una password
aleatoria (guardada en `/root/.danielmateu_db_password`), genera el `.env` con
una `SECRET_KEY` nueva, migra, hace `collectstatic`, arranca gunicorn como
servicio, configura Nginx y pide el certificado HTTPS.

Al terminar, crea tu usuario del admin:

```bash
cd /var/www/danielmateu.es
set -a && source .env && set +a
./venv/bin/python manage.py createsuperuser
```

Ya tienes `https://danielmateu.es` ✅

## 6. Backups

Las imagenes de `media/` y la base de datos solo viven en este disco:

```bash
ln -sf /var/www/danielmateu.es/deploy/backup.sh /etc/cron.daily/danielmateu-backup
bash deploy/backup.sh          # pruebalo una vez a mano
```

Guarda 14 dias en `/var/backups/danielmateu/`. Bajatelos de vez en cuando:

```bash
scp -r Portfolio:/var/backups/danielmateu ./backups-portfolio
```

---

## Actualizar el sitio

Tras un `git push`:

```bash
ssh Portfolio 'bash /var/www/danielmateu.es/deploy/update.sh'
```

---

## Problemas comunes

- **502 Bad Gateway** → gunicorn caido: `journalctl -u gunicorn -n 50`
- **El sitio no carga y certbot fallo** → con `DEBUG=False` Django fuerza
  `https://` y aun no hay 443. Arregla el DNS y ejecuta
  `certbot --nginx -d danielmateu.es -d www.danielmateu.es --redirect`
- **Estaticos sin estilo** → falto `collectstatic`, o el `alias` de Nginx no
  apunta a `staticfiles/`
- **Imagenes 403** → `chown -R www-data:www-data /var/www/danielmateu.es/media`
- **DisallowedHost** → falta el dominio en `ALLOWED_HOSTS` del `.env`
- **Se llena el disco** → `journalctl --vacuum-time=7d`

## Que quedo obsoleto

`DEPLOY.md` (Oracle Cloud) y `Procfile` + `start.sh` + `railway.json` (Railway)
describen despliegues que ya no usas. Los scripts de `deploy/` ahora asumen
Hetzner: `root`, `/var/www/danielmateu.es`, gunicorn como `www-data`.
