"""
Configuración de Gunicorn para producción en Railway
Optimizado para manejo de cold starts y alta disponibilidad
"""
import multiprocessing
import os

# Dirección de binding
bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"

# Workers y threads (conservador para Railway)
workers = 1
threads = int(os.environ.get('GUNICORN_THREADS', 2))
worker_class = 'gthread'
worker_connections = 1000

# Timeouts
timeout = 180  # 3 minutos para cold start
graceful_timeout = 120
keepalive = 5

# Reiniciar workers después de X requests (previene memory leaks)
max_requests = 1000
max_requests_jitter = 50

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Preload app deshabilitado para evitar problemas con migraciones
preload_app = False

# Configuración de proceso
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# Server mechanics
forwarded_allow_ips = '*'
proxy_protocol = False
proxy_allow_ips = '*'

def when_ready(server):
    """Called just after the server is started."""
    server.log.info("Servidor Gunicorn iniciado correctamente")

def on_starting(server):
    """Called just before the master process is initialized."""
    server.log.info("Inicializando servidor Gunicorn...")

def on_reload(server):
    """Called to recycle workers during a reload via SIGHUP."""
    server.log.info("Recargando workers...")

def worker_int(worker):
    """Called just after a worker exited on SIGINT or SIGQUIT."""
    worker.log.info("Worker interrumpido por usuario")

def worker_abort(worker):
    """Called when a worker received the SIGABRT signal."""
    worker.log.info("Worker abortado")
