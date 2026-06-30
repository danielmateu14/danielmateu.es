from django.contrib import admin
from .models import Proyecto, Tecnologia, ImagenProyecto

@admin.register(Tecnologia)
class TecnologiaAdmin(admin.ModelAdmin):
    list_display = ['nombre']
    search_fields = ['nombre']


class ImagenProyectoInline(admin.TabularInline):
    model = ImagenProyecto
    extra = 1
    fields = ['imagen', 'titulo', 'descripcion', 'orden']


@admin.register(Proyecto)
class ProyectoAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'fecha_creacion']
    list_filter = ['tecnologias', 'fecha_creacion']
    search_fields = ['titulo', 'descripcion']
    prepopulated_fields = {'slug': ('titulo',)}
    filter_horizontal = ['tecnologias']
    inlines = [ImagenProyectoInline]
