# Migración para restaurar el campo imagen y eliminar imagen_nombre
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('proyectos', '0001_initial'),
    ]

    operations = [
        # Primero eliminar imagen_nombre si existe
        migrations.RemoveField(
            model_name='proyecto',
            name='imagen_nombre',
        ),
        # Luego añadir imagen si no existe
        migrations.AddField(
            model_name='proyecto',
            name='imagen',
            field=models.ImageField(blank=True, null=True, upload_to='proyectos/'),
        ),
    ]
