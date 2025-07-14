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

