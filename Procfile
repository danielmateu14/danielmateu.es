web: gunicorn portfolio.wsgi
web: python manage.py migrate && python manage.py loaddata backup.json && gunicorn portfolio.wsgi
