from django.conf.urls import url
from lastdays import views


urlpatterns = [
    url(r'^$', views.index, name="index"),
    url(r'^configuration$', views.configuration, name="configuration"),
]
