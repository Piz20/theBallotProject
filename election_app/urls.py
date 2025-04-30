"""
URL configuration for election_app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views. Home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path , include
from django.conf import settings
from graphene_django.views import GraphQLView

from election_app.api.schema import schema
from . import views
from .views import remove_vote_view






urlpatterns = [

                  path('admin/', admin.site.urls),

                  path('', views.index_view, name='index'),

                  path('register/', views.register_view, name='register'),
                  path('login/', views.login_view, name='login'),
                  path('logout/', views.logout_view, name='logout'),
                  
                  path('profile/', views.profile_view, name='profile'),
                  path('about/', views.about_view, name='about'),
                  path('contact/', views.contact_view, name='contact'),
                  path('features/', views.features_view, name='features'),
                  
                  path('elections/', views.elections_view, name='elections'),
                  path('create_election/', views.create_election_view, name='create_election'),
                  path('elections/<int:election_id>/', views.election_details_view, name='election_details'),
                  path('elections/<int:election_id>/add-candidate/', views.add_candidate_view, name='add_candidate'),
                  path('elections/<int:election_id>/vote/<int:candidate_id>/', views.vote_view, name='vote'),
                  path('remove_vote/<int:candidate_id>/', remove_vote_view, name='remove_vote'),
                  path('help/', views.help_view, name='help'),
                  
                  path('gemini/', views.gemini_view, name='gemini'),
                                    
                
                path("graphql/", GraphQLView.as_view(graphiql=True, schema=schema)),


              ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
