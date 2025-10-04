"""
Configuration centralisée pour l'application Election App
Ce fichier contient toutes les configurations sensibles et non-sensibles
"""
import os
from pathlib import Path

# Chemin de base du projet
BASE_DIR = Path(__file__).resolve().parent.parent

# Configuration de la base de données
DB_SERVER_NAME = os.getenv('DB_SERVER_NAME', 'localhost\\SQLEXPRESS02')
DB_NAME = os.getenv('DB_NAME', 'electionapp')

# Configuration des API externes
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyBDXE7XuiFnWPU5z9Y2E8zoCIxR2Ix7jqc')

# Configuration Django
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'LEbIgPiz20')
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

# Configuration email
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'sendgrid_backend.SendgridBackend')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'eminiantpisani@gmail.com')

# Configuration des URLs
SITE_URL = os.getenv('SITE_URL', 'http://127.0.0.1:8000')
LOCAL_TUNNEL_URL = os.getenv('LOCAL_TUNNEL_URL', 'https://theballotproject.loca.lt')

# Configuration CORS
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,theballotproject.loca.lt').split(',')

# Configuration CSRF
CSRF_TRUSTED_ORIGINS = os.getenv('CSRF_TRUSTED_ORIGINS', 'https://theballotproject.loca.lt,http://localhost:8000,http://localhost:3000').split(',')

# Configuration CORS
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:8000,http://127.0.0.1:8000,http://localhost:8080,http://localhost:3000').split(',')

# Configuration de session
SESSION_COOKIE_AGE = int(os.getenv('SESSION_COOKIE_AGE', '2592000'))  # 30 jours
SESSION_EXPIRE_AT_BROWSER_CLOSE = os.getenv('SESSION_EXPIRE_AT_BROWSER_CLOSE', 'False').lower() == 'true'
SESSION_SAVE_EVERY_REQUEST = os.getenv('SESSION_SAVE_EVERY_REQUEST', 'True').lower() == 'true'

# Configuration de sécurité
CSRF_COOKIE_SECURE = os.getenv('CSRF_COOKIE_SECURE', 'True').lower() == 'true'

