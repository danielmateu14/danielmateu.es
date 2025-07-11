from django.views.generic import ListView, DetailView
from .models import Proyecto

class ProyectoListView(ListView):
    model = Proyecto
    template_name = 'proyecto_list.html'
    context_object_name = 'proyectos'
    paginate_by = 6

    def get_queryset(self):
        try:
            return Proyecto.objects.all().order_by('-fecha_creacion')
        except Exception as e:
            # Puedes registrar el error aquí si usas logging
            return Proyecto.objects.none()


class ProyectoDetalleView(DetailView):
    model = Proyecto
    template_name = 'proyecto_detalle.html'
    context_object_name = 'proyecto'
    slug_field = 'slug'
    slug_url_kwarg = 'pk'
