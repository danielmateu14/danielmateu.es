# Migración para restaurar el campo imagen
from django.db import migrations, models, connection


def fix_imagen_field(apps, schema_editor):
    """Arregla el campo imagen en la base de datos (compatible con PostgreSQL y SQLite)"""
    table = 'proyectos_proyecto'
    with connection.cursor() as cursor:
        # Introspección agnóstica del motor: si la tabla no existe aún, no hay nada que arreglar
        if table not in connection.introspection.table_names(cursor):
            return
        columns = [
            col.name
            for col in connection.introspection.get_table_description(cursor, table)
        ]

        # Si existe imagen_nombre pero no imagen, renombrar
        if 'imagen_nombre' in columns and 'imagen' not in columns:
            cursor.execute('ALTER TABLE proyectos_proyecto RENAME COLUMN imagen_nombre TO imagen')
        # Si existen ambos, eliminar imagen_nombre
        elif 'imagen_nombre' in columns and 'imagen' in columns:
            cursor.execute('ALTER TABLE proyectos_proyecto DROP COLUMN imagen_nombre')
        # Si no existe imagen, crearla
        elif 'imagen' not in columns:
            cursor.execute('ALTER TABLE proyectos_proyecto ADD COLUMN imagen VARCHAR(100) NULL')


class Migration(migrations.Migration):

    dependencies = [
        ('proyectos', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(fix_imagen_field, migrations.RunPython.noop),
    ]
