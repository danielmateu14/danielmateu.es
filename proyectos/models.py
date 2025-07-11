from django.db import models

class Tecnologia(models.Model):
    nombre = models.CharField(max_length=50)
    icono = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.nombre

class Proyecto(models.Model):
    ESTADOS = [
        ('desarrollo', 'En Desarrollo'),
        ('completado', 'Completado'),
        ('mantenimiento', 'Mantenimiento'),
    ]

    titulo = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    descripcion_corta = models.TextField()
    descripcion_larga = models.TextField(blank=True, null=True)
    fecha_creacion = models.DateField()
    duracion = models.CharField(max_length=100, blank=True, null=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, blank=True, null=True)
    imagen = models.ImageField(upload_to='proyectos/', blank=True, null=True)
    url_demo = models.URLField(blank=True, null=True)
    url_github = models.URLField(blank=True, null=True)
    icono = models.CharField(max_length=100, blank=True, null=True)
    categoria = models.CharField(max_length=50, default="general")
    tecnologias = models.ManyToManyField(Tecnologia, blank=True)

    def __str__(self):
        return self.titulo
