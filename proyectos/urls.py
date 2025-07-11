from django.urls import path
from . import views

app_name = 'proyectos'

urlpatterns = [
    path('', views.ProyectoListView.as_view(), name='lista_proyectos'),
    path('<int:pk>/', views.ProyectoDetalleView.as_view(), name='detalle_proyecto'),
]
