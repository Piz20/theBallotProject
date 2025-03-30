from django.apps import AppConfig

class ElectionAppConfig(AppConfig):  # La classe doit respecter la convention PascalCase
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'election_app'

    def ready(self):
        import election_app.signals  # Import des signaux
