from django.shortcuts import render
from proyectos.models import Proyecto

def inicio(request):
    proyectos_destacados = Proyecto.objects.order_by('-fecha_creacion')[:3]
    return render(request, 'home/inicio.html', {'proyectos_destacados': proyectos_destacados})

def inic():
    return