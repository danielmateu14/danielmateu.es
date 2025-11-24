from django.contrib import admin
from .models import Proyecto, Tecnologia

@admin.register(Tecnologia)
class TecnologiaAdmin(admin.ModelAdmin):
    list_display = ['nombre']
    search_fields = ['nombre']

@admin.register(Proyecto)
class ProyectoAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'fecha_creacion']
    list_filter = ['tecnologias', 'fecha_creacion']
    search_fields = ['titulo', 'descripcion']
    prepopulated_fields = {'slug': ('titulo',)}
    filter_horizontal = ['tecnologias']
