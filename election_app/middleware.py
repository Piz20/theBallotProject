# election_app/middleware.py
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings

class DisableCSRFForGraphQL(MiddlewareMixin):
    def process_request(self, request):
        if request.path.startswith('/graphql/'):
            # Désactiver CSRF pour les requêtes GraphQL
            request.csrf_processing_done = True
