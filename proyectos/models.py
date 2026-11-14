from django.db import models
class Tecnologia(models.Model):
    nombre = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre

class Proyecto(models.Model):
    titulo = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    descripcion = models.TextField()
    fecha_creacion = models.DateField(auto_now_add=True)
    imagen = models.ImageField(upload_to='proyectos/', blank=True, null=True)
    url_github = models.URLField(blank=True, null=True)
    url_demo = models.URLField(blank=True, null=True)
    # Segunda demo (el panel de gestión): si está, el botón «Demo» se convierte en un desplegable con las dos
    url_demo_panel = models.URLField('Demo del panel', blank=True, null=True,
                                     help_text='Con esto, el botón Demo despliega dos opciones: la web y el panel.')
    demo_label = models.CharField('Nombre de la demo principal', max_length=40, default='Web',
                                  help_text='Primera opción del desplegable (p. ej. «Tienda»).')
    demo_panel_label = models.CharField('Nombre de la demo del panel', max_length=40, default='Panel de gestión')
    tecnologias = models.ManyToManyField('Tecnologia', blank=True)
    orden = models.PositiveIntegerField(
        default=0,
        help_text='Posición en el listado y en la portada (menor = antes). '
                  'La portada muestra los tres primeros.',
    )

    class Meta:
        ordering = ['orden', '-fecha_creacion']

    def __str__(self):
        return self.titulo

    @property
    def resumen(self):
        """Texto de las tarjetas: los párrafos en prosa de la descripción.

        Se saltan los bloques con título en MAYÚSCULAS y las listas de
        viñetas. Sobra texto a propósito: la tarjeta lo recorta con "…" a
        lo que quepa (ver [data-fill-clamp] en base.js).
        """
        parrafos = []
        for p in self.descripcion.strip().split('\n\n'):
            p = p.strip()
            primera = p.split('\n', 1)[0]
            if not p or p.startswith('•') or (primera.isupper() and len(primera) < 80):
                continue
            parrafos.append(' '.join(p.split()))
        return ' '.join(parrafos)


class ImagenProyecto(models.Model):
    """Imagen de la galería/slideshow de un proyecto."""
    proyecto = models.ForeignKey(
        Proyecto,
        related_name='imagenes_galeria',
        on_delete=models.CASCADE,
    )
    imagen = models.ImageField(upload_to='proyectos/galeria/')
    titulo = models.CharField(max_length=200, blank=True)
    descripcion = models.CharField(max_length=300, blank=True)
    orden = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['orden', 'id']
        verbose_name = 'Imagen de proyecto'
        verbose_name_plural = 'Imágenes de proyecto'

    def __str__(self):
        return f"{self.proyecto.titulo} · {self.titulo or self.pk}"

