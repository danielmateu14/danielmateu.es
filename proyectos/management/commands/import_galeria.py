"""
Importa las imágenes de una carpeta a la galería de un proyecto del portfolio.

Las imágenes se ordenan por nombre de fichero (usa prefijos 01_, 02_, … para
controlar el orden). El "título" de cada imagen es el nombre del fichero sin
extensión (sin el prefijo numérico), y sirve de pie de foto en el slideshow.

Uso:
  python manage.py import_galeria electrogestion /var/www/danielmateu.es/capturas_electrogestion --reset --cover 1
"""
import re
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand, CommandError

from proyectos.models import Proyecto, ImagenProyecto

EXTS = {'.png', '.jpg', '.jpeg', '.webp', '.gif'}


class Command(BaseCommand):
    help = 'Importa imágenes de una carpeta a la galería de un proyecto.'

    def add_arguments(self, parser):
        parser.add_argument('slug', help='Slug del proyecto (p.ej. electrogestion)')
        parser.add_argument('carpeta', help='Carpeta con las imágenes')
        parser.add_argument('--reset', action='store_true', help='Borra la galería previa')
        parser.add_argument('--cover', type=int, default=None,
                            help='Índice (1..N) de la imagen que será la portada del proyecto')

    def handle(self, *args, **o):
        try:
            proy = Proyecto.objects.get(slug=o['slug'])
        except Proyecto.DoesNotExist:
            raise CommandError(f"No existe el proyecto con slug '{o['slug']}'.")

        carpeta = Path(o['carpeta'])
        if not carpeta.is_dir():
            raise CommandError(f'No existe la carpeta {carpeta}.')

        ficheros = sorted(f for f in carpeta.iterdir() if f.suffix.lower() in EXTS)
        if not ficheros:
            raise CommandError(f'No hay imágenes en {carpeta}.')

        if o['reset']:
            n = proy.imagenes_galeria.count()
            proy.imagenes_galeria.all().delete()
            self.stdout.write(f'Galería previa borrada ({n} imágenes).')

        for i, f in enumerate(ficheros, 1):
            titulo = re.sub(r'^\d+[_\-\s]*', '', f.stem).replace('_', ' ').strip()
            img = ImagenProyecto(proyecto=proy, titulo=titulo, orden=i)
            with open(f, 'rb') as fh:
                img.imagen.save(f.name, File(fh), save=True)
            marca = '  (portada)' if o['cover'] == i else ''
            self.stdout.write(self.style.SUCCESS(f'  {i:2}. {f.name} -> "{titulo}"{marca}'))
            if o['cover'] == i:
                with open(f, 'rb') as fh:
                    proy.imagen.save(f.name, File(fh), save=True)

        self.stdout.write(self.style.SUCCESS(
            f'Galería de "{proy.titulo}": {len(ficheros)} imágenes importadas.'))
