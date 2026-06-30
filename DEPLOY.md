# Despliegue gratis en Oracle Cloud Always Free

Guía para publicar **danielmateu.es** en una VM gratuita de Oracle Cloud
(Django + Gunicorn + Nginx + PostgreSQL + HTTPS con Let's Encrypt).

> Las imágenes subidas por el admin se guardan en el disco de la VM (`media/`) y
> **persisten** entre despliegues, por eso no hace falta almacenamiento externo.

---

## 1. Crear la VM (Always Free)

1. Crea cuenta en https://cloud.oracle.com (pide tarjeta para verificar, **no cobra** en el tier Always Free).
2. **Compute → Instances → Create Instance**:
   - Imagen: **Canonical Ubuntu 22.04**.
   - Shape: **VM.Standard.A1.Flex** (ARM Ampere, Always Free: hasta 4 OCPU / 24 GB) o `VM.Standard.E2.1.Micro` (x86).
   - Sube/guarda tu clave SSH.
3. Apunta la **IP pública** que te asigna.

### Abrir puertos 80 y 443
- **VCN**: Networking → Virtual Cloud Network → Subnet → **Security List** → añade *Ingress Rules*:
  - `0.0.0.0/0` TCP **80**
  - `0.0.0.0/0` TCP **443**
- **Firewall de la VM** (Ubuntu en Oracle trae iptables restrictivo):
  ```bash
  sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
  sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
  sudo netfilter-persistent save
  ```

---

## 2. DNS del dominio

En tu proveedor de `danielmateu.es`, crea:
- Registro **A**: `danielmateu.es` → IP pública de la VM
- Registro **A** (o CNAME): `www` → la misma IP (o `danielmateu.es`)

La propagación puede tardar minutos/horas. Comprueba con `ping danielmateu.es`.

---

## 3. Preparar el servidor

```bash
ssh ubuntu@TU_IP

sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-venv python3-pip git nginx \
    postgresql postgresql-contrib libpq-dev build-essential \
    libjpeg-dev zlib1g-dev   # (los 2 últimos para Pillow)
```

### Base de datos PostgreSQL
```bash
sudo -u postgres psql <<'SQL'
CREATE DATABASE danielmateu;
CREATE USER danieldb WITH PASSWORD 'TU_PASSWORD';
ALTER ROLE danieldb SET client_encoding TO 'utf8';
ALTER ROLE danieldb SET default_transaction_isolation TO 'read committed';
ALTER ROLE danieldb SET timezone TO 'Europe/Madrid';
GRANT ALL PRIVILEGES ON DATABASE danielmateu TO danieldb;
\c danielmateu
GRANT ALL ON SCHEMA public TO danieldb;
SQL
```

---

## 4. Desplegar el proyecto

```bash
cd /home/ubuntu
git clone TU_REPOSITORIO danielmateu.es   # o sube el código por scp/rsync
cd danielmateu.es

python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Variables de entorno
```bash
cp deploy/env.production.example .env
nano .env          # rellena SECRET_KEY, DATABASE_URL (con TU_PASSWORD), etc.
```
Genera una `SECRET_KEY` nueva:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Migraciones, superusuario y estáticos
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
mkdir -p media        # carpeta donde se guardarán las imágenes subidas
```

---

## 5. Gunicorn como servicio (systemd)

```bash
sudo cp deploy/gunicorn.service /etc/systemd/system/gunicorn.service
sudo systemctl daemon-reload
sudo systemctl enable --now gunicorn
sudo systemctl status gunicorn      # debe estar "active (running)"
```

---

## 6. Nginx

```bash
sudo cp deploy/nginx-danielmateu.conf /etc/nginx/sites-available/danielmateu
sudo ln -s /etc/nginx/sites-available/danielmateu /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```
Permite que Nginx (grupo `www-data`) lea los archivos:
```bash
sudo usermod -aG ubuntu www-data
sudo chmod 750 /home/ubuntu
```
Visita `http://danielmateu.es` — debería cargar (aún sin candado).

---

## 7. HTTPS gratis (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d danielmateu.es -d www.danielmateu.es
```
Certbot edita el Nginx y añade el 443 + redirección. Renovación automática:
```bash
sudo systemctl status certbot.timer
```

Ya tienes `https://danielmateu.es` ✅

---

## 8. Actualizar el sitio (cada cambio)

```bash
cd /home/ubuntu/danielmateu.es
source venv/bin/activate
git pull
pip install -r requirements.txt        # si cambiaron dependencias
python manage.py migrate               # si hay migraciones nuevas
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn
```

---

## Notas / problemas comunes

- **502 Bad Gateway** → gunicorn caído: `sudo journalctl -u gunicorn -n 50`.
- **Estáticos sin estilo** → faltó `collectstatic` o el `alias` de Nginx no apunta a `staticfiles/`.
- **Imágenes 403/404** → revisa permisos de `media/` y el `alias` de `/media/`.
- **DisallowedHost** → falta el dominio en `ALLOWED_HOSTS` del `.env`.
- `gunicorn_config.py` trae `forwarded_allow_ips='*'`; junto a `SECURE_PROXY_SSL_HEADER`
  ya configurado en `settings.py`, Django detecta bien el HTTPS detrás de Nginx.
