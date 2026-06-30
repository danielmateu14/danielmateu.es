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
    tecnologias = models.ManyToManyField('Tecnologia', blank=True)

    def __str__(self):
        return self.titulo


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

