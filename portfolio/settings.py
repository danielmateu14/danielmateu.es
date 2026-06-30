from pathlib import Path
import os
import dj_database_url
from dotenv import load_dotenv
load_dotenv()


BASE_DIR = Path(__file__).resolve().parent.parent
#CLAVE
SECRET_KEY = os.environ.get('SECRET_KEY')

DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Hosts permitidos: se leen de la variable de entorno ALLOWED_HOSTS (separados por comas).
# En local, con DEBUG=True, no hace falta tocar nada.
ALLOWED_HOSTS = [
    h.strip() for h in os.environ.get(
        'ALLOWED_HOSTS',
        'danielmateu.es,www.danielmateu.es,127.0.0.1,localhost'
    ).split(',') if h.strip()
]

# Archivos estáticos
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [BASE_DIR / 'static']
# En producción usamos el manifest (hashes + compresión + cache busting).
# En desarrollo (DEBUG) servimos los fuentes directamente: así los cambios en
# CSS/JS se ven al recargar sin tener que ejecutar collectstatic ni reiniciar.
if DEBUG:
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'
else:
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Archivos media
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Aplicaciones propias
APPS_PROPIAS = [
    'home',
    'proyectos',
]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
] + APPS_PROPIAS

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'portfolio.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'portfolio.wsgi.application'

# Base de datos
# Prioridad:
#   1) USE_SQLITE=True  -> SQLite local (desarrollo sin Postgres).
#   2) DATABASE_URL set -> se parsea (recomendado en producción, p.ej. Postgres en la VM).
#   3) Variables DB_*   -> compatibilidad con la configuración antigua (Railway).
if os.environ.get('USE_SQLITE', 'False').lower() in ('true', '1', 'yes'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
elif os.environ.get('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.parse(
            os.environ['DATABASE_URL'],
            conn_max_age=600,
            conn_health_checks=True,
            # Postgres local (en la misma VM) no necesita SSL.
            ssl_require=os.environ.get('DB_SSL', 'False').lower() in ('true', '1', 'yes'),
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME'),
            'USER': os.environ.get('DB_USER'),
            'PASSWORD': os.environ.get('DB_PASSWORD'),
            'HOST': os.environ.get('DB_HOST'),
            'PORT': os.environ.get('DB_PORT', '5432'),
            'CONN_MAX_AGE': None,
            'CONN_HEALTH_CHECKS': True,
            'OPTIONS': {
                'sslmode': 'require',
                'connect_timeout': 60,
            },
        }
    }


AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

CSRF_TRUSTED_ORIGINS = [
    "https://danielmateu.es",
    "https://www.danielmateu.es",
]

# ===== Seguridad en producción (solo cuando DEBUG=False) =====
# Asume que Nginx termina el TLS y pasa la petición por HTTP al gunicorn local.
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000          # 1 año
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True


LANGUAGE_CODE = 'es-es'
TIME_ZONE = 'Europe/Madrid'
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
