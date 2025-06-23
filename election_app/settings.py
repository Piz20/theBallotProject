import os
from pathlib import Path

from datetime import timedelta  # Importer timedelta
from corsheaders.defaults import default_headers  # Import default_headers


# Ton secret key pour signer le JWT

# Other settings...

SECRET_KEY = "LEbIgPiz20"
SITE_URL = "http://127.0.0.1:8000"  # URL de ton site en local
LOCAL_TUNNEL_URL = "https://theballotproject.loca.lt"  # URL de ton site sur ngrok

LOGIN_URL = '/login/'
LOGIN_REDIRECT_URL = '/elections/'  # URL vers laquelle rediriger après la connexion

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-tempkey')

DEBUG = True

EMAIL_BACKEND = "sendgrid_backend.SendgridBackend"
DEFAULT_FROM_EMAIL = "eminiantpisani@gmail.com"

ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'theballotproject.loca.lt']

# Session Cookie settings
SESSION_ENGINE = 'django.contrib.sessions.backends.db'  # Utiliser la base de données pour stocker les sessions
SESSION_COOKIE_AGE = 60 * 60 * 24 * 30  # 30 jours en secondes
SESSION_EXPIRE_AT_BROWSER_CLOSE = False  # Expirer la session lorsque l'utilisateur ferme le navigateur
SESSION_SAVE_EVERY_REQUEST = True  # Sauvegarde la session à chaque requête
# Si tu veux un système de token, utilise un cookie sécurisé
CSRF_COOKIE_SECURE = True  # Assure-toi d'utiliser HTTPS pour les cookies CSRF

CSRF_TRUSTED_ORIGINS = [
    'https://theballotproject.loca.lt',
    'http://localhost:8000',
    'http://localhost:3000',
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    'http://localhost:8080',
    'http://localhost:3000',  # Ajoute cette ligne pour autoriser ton frontend local
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = list(default_headers) + [
    'authorization',
    'x-csrftoken',
    'apollo-require-preflight',  # ➕ Header manquant pour Apollo

]


INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework.authtoken',  # Module pour les tokens d'authentification
    'election_app',  # Assurez-vous que cette ligne est présente
    'rest_framework',
    'corsheaders',
]



MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'election_app.middleware.DisableCSRFForGraphQL',  # Ajoutez cette ligne
    'django.middleware.common.CommonMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',  # Vous pouvez laisser ceci actif si vous utilisez un middleware personnalisé pour GraphQL
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

]




ROOT_URLCONF = 'election_app.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'election_app.wsgi.application'

# Configuration de la base de données (MSSQL)
DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': 'electionapp',
        'HOST': 'localhost\\SQLEXPRESS01',
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
            'TrustServerCertificate': 'yes',
            'Encrypt': 'no',
            'trusted_connection': 'yes',
        },
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Etc/GMT'

USE_I18N = True
USE_TZ = True


STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "election_app", "static"),
]

STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

STATIC_URL = '/static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'election_app.CustomUser'
X_FRAME_OPTIONS = 'SAMEORIGIN'
MESSAGE_STORAGE = 'django.contrib.messages.storage.session.SessionStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

REST_FRAMEWORK = {
  'DEFAULT_AUTHENTICATION_CLASSES': (
    'rest_framework.authentication.SessionAuthentication',
    'rest_framework.authentication.BasicAuthentication',
    'rest_framework.authentication.TokenAuthentication',
),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
} 