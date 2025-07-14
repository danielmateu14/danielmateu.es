from django.views.generic import ListView, DetailView
from .models import Proyecto

from django.views.generic import ListView, DetailView
from .models import Proyecto

class ProyectoListView(ListView):
    model = Proyecto
    template_name = 'proyecto_list.html'
    context_object_name = 'proyectos'
    paginate_by = 6

    def get_queryset(self):
        return Proyecto.objects.all().order_by('-fecha_creacion')

class ProyectoDetalleView(DetailView):
    model = Proyecto
    template_name = 'proyectos/proyecto_detalle.html'
    context_object_name = 'proyecto'
    slug_field = 'slug'
    slug_url_kwarg = 'pk'

