# Configuration de l'application Election App

## Structure de configuration

L'application utilise un système de configuration modulaire et sécurisé :

### Fichiers de configuration

1. **`election_app/config.py`** - Configuration centralisée avec valeurs par défaut
2. **`.env`** - Variables d'environnement locales (ignoré par Git)
3. **`env.example`** - Modèle de configuration pour les nouveaux développeurs
4. **`election_app/settings.py`** - Configuration Django qui importe les variables

### Variables d'environnement

#### Base de données
- `DB_SERVER_NAME` - Nom du serveur SQL Server (ex: `localhost\SQLEXPRESS02`)
- `DB_NAME` - Nom de la base de données (ex: `electionapp`)

#### API externes
- `GEMINI_API_KEY` - Clé API pour Gemini AI

#### Django
- `DJANGO_SECRET_KEY` - Clé secrète Django
- `DEBUG` - Mode debug (True/False)

#### Email
- `EMAIL_BACKEND` - Backend email (ex: `sendgrid_backend.SendgridBackend`)
- `DEFAULT_FROM_EMAIL` - Email expéditeur par défaut

#### URLs
- `SITE_URL` - URL locale de l'application
- `LOCAL_TUNNEL_URL` - URL tunnel (ngrok/localtunnel)

#### CORS et sécurité
- `ALLOWED_HOSTS` - Hôtes autorisés (séparés par des virgules)
- `CSRF_TRUSTED_ORIGINS` - Origines CSRF de confiance
- `CORS_ALLOWED_ORIGINS` - Origines CORS autorisées

## Installation sur une nouvelle machine

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd theBallotProject
   ```

2. **Créer le fichier .env**
   ```bash
   cp env.example .env
   ```

3. **Modifier le fichier .env** avec vos valeurs :
   - Changer `DB_SERVER_NAME` pour votre serveur SQL Server
   - Changer `DB_NAME` pour votre base de données
   - Ajouter votre clé API Gemini
   - Modifier les URLs selon votre environnement

4. **Installer les dépendances**
   ```bash
   pip install -r requirements.txt
   ```

5. **Appliquer les migrations**
   ```bash
   python manage.py migrate
   ```

## Sécurité

- Le fichier `.env` est ignoré par Git (déjà dans `.gitignore`)
- Ne jamais commiter de clés API ou mots de passe
- Utiliser `env.example` comme modèle pour les nouveaux développeurs
- Changer les clés par défaut en production

## Avantages de cette approche

✅ **Sécurité** : Les secrets ne sont pas dans le code source  
✅ **Flexibilité** : Facile de changer la configuration sans modifier le code  
✅ **Portabilité** : Fonctionne sur différentes machines avec des configurations différentes  
✅ **Centralisation** : Toute la configuration est dans `config.py`  
✅ **Environnements multiples** : Support dev/staging/production facilement  

