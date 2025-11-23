# 📋 Description Complète du Projet TheBallotProject

## 🎯 Vue d'Ensemble

**TheBallotProject** est une plateforme web complète de gestion d'élections conçue pour faciliter l'organisation, le suivi et l'analyse des processus électoraux. Le projet combine une architecture moderne full-stack avec des capacités avancées d'intelligence artificielle pour fournir des analyses prédictives et des visualisations de données.

### Objectifs Principaux
- Gestion sécurisée des entités électorales (électeurs, candidats, élections, votes)
- Interface utilisateur moderne et intuitive
- Analyse de données assistée par IA via l'API Gemini
- Visualisation interactive des résultats électoraux
- Système de requêtes SQL générées dynamiquement par IA

---

## 🏗️ Architecture Technique

### Stack Technologique

#### Backend
- **Framework** : Django 5.0.14
- **API** : GraphQL (Graphene 3.4.3) + Django REST Framework
- **Base de données** : Microsoft SQL Server (Azure SQL Database)
- **ORM** : Django ORM + SQLAlchemy (pour requêtes dynamiques)
- **Authentification** : JWT + Sessions Django
- **Serveur WSGI** : Gunicorn (pour production)

#### Frontend
- **Framework** : Next.js 15.5.4 (React 18.3.1)
- **Styling** : Tailwind CSS 3.3.3
- **UI Components** : Radix UI
- **GraphQL Client** : Apollo Client 3.13.8
- **State Management** : Zustand 5.0.4
- **Formulaires** : React Hook Form 7.60.0
- **Visualisation** : Recharts 2.12.7, D3.js (généré dynamiquement)
<!--  -->
#### Intelligence Artificielle
- **API** : Google Gemini 2.0 Flash
- **Utilisations** :
  - Génération de requêtes SQL à partir de prompts en langage naturel
  - Génération de code D3.js pour visualisations
  - Analyse et formatage de données électorales
  - Recherche intelligente d'électeurs

#### Infrastructure
- **Déploiement Frontend** : Vercel
- **Déploiement Backend** : Render / Railway
- **Base de données** : Azure SQL Server
- **Email** : SendGrid
- **Stockage** : Firebase (pour certaines fonctionnalités)

---

## 📁 Structure du Projet

### Backend (Django)

```
election_app/
├── api/
│   └── graphql/
│       ├── schema.py                    # Schéma GraphQL principal
│       ├── election_schema.py           # Schéma pour les élections
│       ├── user_schema.py               # Schéma pour les utilisateurs
│       ├── vote_schema.py               # Schéma pour les votes
│       ├── candidate_schema.py          # Schéma pour les candidats
│       ├── query_generator_schema.py    # Génération SQL/IA dynamique
│       ├── eligible_email_schema.py    # Gestion des emails éligibles
│       ├── mail_schema.py               # Envoi d'emails
│       ├── message_schema.py            # Messages système
│       ├── serializers.py               # Sérialiseurs GraphQL
│       └── utils.py                     # Utilitaires GraphQL
├── models.py                            # Modèles de données Django
├── views.py                             # Vues Django (templates)
├── forms.py                             # Formulaires Django
├── urls.py                              # Configuration des routes
├── settings.py                          # Configuration Django
├── config.py                            # Configuration centralisée
├── middleware.py                        # Middleware personnalisé
├── admin.py                             # Interface d'administration
├── static/                              # Fichiers statiques (CSS, JS, images)
└── templatetags/                        # Tags de template personnalisés
```

### Frontend (Next.js)

```
theballotproject/
├── app/
│   ├── layout.tsx                        # Layout principal
│   ├── page.tsx                         # Page d'accueil
│   ├── ApolloWrapper.tsx                # Wrapper Apollo Client
│   ├── auth/
│   │   ├── layout.tsx                   # Layout authentification
│   │   └── page.tsx                     # Page de connexion
│   └── elections/
│       ├── page.tsx                     # Liste des élections
│       ├── create/
│       │   └── page.tsx                 # Création d'élection
│       ├── [id]/
│       │   ├── details/
│       │   │   └── page.tsx             # Détails d'une élection
│       │   └── settings/
│       │       └── page.tsx             # Paramètres d'élection
│       └── statistics/
│           └── page.tsx                 # Statistiques
├── components/
│   ├── ui/                              # Composants UI réutilisables (Radix UI)
│   ├── election-settings/               # Composants de configuration
│   │   ├── candidates/                 # Gestion des candidats
│   │   ├── election/                   # Configuration élection
│   │   └── voters/                      # Gestion des électeurs
│   └── ...
├── lib/
│   ├── apolloClient.ts                  # Configuration Apollo Client
│   ├── mutations/                       # Mutations GraphQL
│   └── utils.ts                         # Utilitaires
├── hooks/                               # Hooks React personnalisés
├── interfaces/                          # Types TypeScript
└── types/                               # Définitions de types
```

---

## 🗄️ Modèle de Données

### Modèles Principaux

#### CustomUser
- **Description** : Utilisateur personnalisé (remplace le modèle User par défaut de Django)
- **Champs principaux** :
  - `email` (unique, requis)
  - `name`, `matricule`, `gender`
  - `date_of_birth`
  - `profile_picture`
  - `elections` (ManyToMany avec Election)
- **Authentification** : Basée sur l'email (pas de username)

#### Election
- **Description** : Représente une élection
- **Champs principaux** :
  - `name` (unique)
  - `description`
  - `start_date`, `end_date`
  - `status` (draft, upcoming, active, completed)
  - `image_file` ou `image_url`
  - `created_by` (ForeignKey vers CustomUser)
- **Relations** :
  - Plusieurs candidats (Candidate)
  - Plusieurs votes (Vote)
  - Plusieurs emails éligibles (EligibleEmail)

#### Candidate
- **Description** : Candidat dans une élection
- **Champs principaux** :
  - `name` (unique)
  - `description`
  - `vote_count` (compteur de votes)
  - `image_file` ou `image_url`
  - `election` (ForeignKey vers Election)

#### Vote
- **Description** : Vote d'un utilisateur pour un candidat
- **Contraintes** :
  - Un utilisateur ne peut voter qu'une fois par élection (unique_together)
  - Le candidat doit appartenir à l'élection
- **Champs** :
  - `user`, `candidate`, `election`
  - `created_at`

#### EligibleEmail
- **Description** : Liste des emails autorisés à participer à une élection
- **Champs** :
  - `election` (ForeignKey)
  - `email` (unique par élection)

#### Message
- **Description** : Messages système génériques

---

## 🔌 API GraphQL

### Endpoints

#### Queries (Requêtes)

1. **Elections**
   - `allElections` : Liste toutes les élections
   - `election(id)` : Détails d'une élection
   - `electionsByStatus(status)` : Élections filtrées par statut

2. **Candidates**
   - `allCandidates` : Liste tous les candidats
   - `candidate(id)` : Détails d'un candidat
   - `candidatesByElection(electionId)` : Candidats d'une élection

3. **Users**
   - `me` : Informations de l'utilisateur connecté
   - `allUsers` : Liste tous les utilisateurs
   - `user(id)` : Détails d'un utilisateur

4. **Votes**
   - `allVotes` : Liste tous les votes
   - `voteByUserAndElection(userId, electionId)` : Vote d'un utilisateur pour une élection

5. **Query Generator (IA)**
   - `run(prompt)` : Génère et exécute une requête SQL à partir d'un prompt
   - `runForGraphs(prompt)` : Génère du code D3.js pour visualiser des données
   - `voterSearch(prompt)` : Recherche intelligente d'électeurs via IA
   - `autoDashboardStats` : Génère automatiquement des statistiques pour le tableau de bord

6. **Eligible Emails**
   - `allEligibleEmails` : Liste tous les emails éligibles
   - `eligibleEmail(id)` : Détails d'un email éligible

7. **Messages**
   - `allMessages` : Liste tous les messages

#### Mutations (Modifications)

1. **Elections**
   - `createElection` : Créer une élection
   - `updateElection` : Modifier une élection
   - `deleteElection` : Supprimer une élection

2. **Candidates**
   - `createCandidate` : Créer un candidat
   - `updateCandidate` : Modifier un candidat
   - `deleteCandidate` : Supprimer un candidat

3. **Users**
   - `registerUser` : Inscription d'un nouvel utilisateur
   - `loginUser` : Connexion
   - `logoutUser` : Déconnexion
   - `updateUserProfile` : Mettre à jour le profil
   - `deleteUserAccount` : Supprimer le compte

4. **Votes**
   - `createVote` : Enregistrer un vote
   - `updateVote` : Modifier un vote
   - `deleteVote` : Supprimer un vote

5. **Eligible Emails**
   - `createEligibleEmail` : Ajouter un email éligible
   - `updateEligibleEmail` : Modifier un email éligible
   - `deleteEligibleEmail` : Supprimer un email éligible

6. **Mail**
   - Mutations pour l'envoi d'emails (notifications, invitations)

7. **Messages**
   - `createMessage` : Créer un message

---

## 🤖 Fonctionnalités IA (Gemini)

### 1. Génération de Requêtes SQL

**Fichier** : `election_app/api/graphql/query_generator_schema.py`

- **Fonction** : `generate_sql_query(prompt)`
- **Description** : Convertit un prompt en langage naturel en requête SQL Server optimisée
- **Processus** :
  1. Récupération dynamique du schéma de la base de données
  2. Envoi du schéma + prompt à Gemini
  3. Génération de la requête SQL
  4. Nettoyage et formatage de la réponse

### 2. Génération de Visualisations D3.js

**Fonction** : `generate_d3_code(prompt, data)`

- **Description** : Génère du code HTML/CSS/JavaScript avec D3.js pour visualiser des données
- **Caractéristiques** :
  - Détection automatique du type de graphique approprié
  - Légendes et tooltips interactifs
  - Explications textuelles sous le graphique
  - Gestion des cas sans données graphiques

### 3. Recherche Intelligente d'Électeurs

**Fonction** : `voter_search_gemini(prompt, data)`

- **Description** : Recherche complexe d'utilisateurs basée sur des critères en langage naturel
- **Capacités** :
  - Jointures complexes
  - Filtres temporels dynamiques
  - Calculs et comparaisons
  - Retour au format JSON structuré

### 4. Statistiques Automatiques du Tableau de Bord

**Fonction** : `generate_dashboard_stats()`

- **Description** : Génère automatiquement 3 statistiques clés pour le tableau de bord
- **Format** : Chaque statistique contient :
  - `title` : Titre de la statistique
  - `value` : Valeur numérique ou pourcentage
  - `change` : Variation temporelle (ex: "+2 ce mois", "+18% vs dernier mois")

---

## 🎨 Interface Utilisateur

### Pages Principales

#### Backend (Django Templates)
- **Index** : Page d'accueil
- **Login/Register** : Authentification
- **Profile** : Profil utilisateur
- **Elections** : Liste des élections (upcoming/past)
- **Election Details** : Détails d'une élection avec candidats et votes
- **About/Contact/Features/Help** : Pages informatives
- **Gemini** : Interface de test pour les fonctionnalités IA

#### Frontend (Next.js)
- **Page d'accueil** : Landing page
- **Authentification** : Connexion/Inscription
- **Liste des élections** : Vue d'ensemble avec filtres
- **Création d'élection** : Formulaire de création
- **Détails d'élection** : Vue détaillée avec statistiques
- **Paramètres d'élection** : Configuration (candidats, électeurs éligibles)
- **Statistiques** : Tableau de bord avec visualisations

### Composants UI

Le projet utilise une bibliothèque de composants basée sur Radix UI :
- Formulaires (Input, Textarea, Select, Checkbox, Radio)
- Navigation (Tabs, Breadcrumb, Menu)
- Feedback (Alert, Toast, Dialog, Alert Dialog)
- Affichage (Card, Avatar, Badge, Table)
- Layout (Separator, Scroll Area, Resizable)
- Et bien d'autres...

---

## ⚙️ Configuration

### Fichiers de Configuration

1. **`election_app/config.py`** : Configuration centralisée
   - Variables d'environnement avec valeurs par défaut
   - Base de données, API keys, URLs, CORS, sessions

2. **`.env`** : Variables d'environnement locales (non versionné)
   - Contient les secrets et configurations spécifiques à l'environnement

3. **`env.example`** : Modèle de configuration
   - Template pour les nouveaux développeurs

4. **`election_app/settings.py`** : Configuration Django
   - Importe les variables depuis `config.py`
   - Configuration des apps, middleware, base de données, etc.

### Variables d'Environnement Principales

```env
# Base de données
DB_SERVER_NAME=localhost\SQLEXPRESS02
DB_NAME=electionapp

# API externes
GEMINI_API_KEY=your_key_here

# Django
DJANGO_SECRET_KEY=your_secret_key
DEBUG=True

# Email
EMAIL_BACKEND=sendgrid_backend.SendgridBackend
DEFAULT_FROM_EMAIL=your_email@example.com

# URLs
SITE_URL=http://127.0.0.1:8000
LOCAL_TUNNEL_URL=https://yourproject.loca.lt

# CORS et sécurité
ALLOWED_HOSTS=localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=https://yourproject.loca.lt
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

---

## 🔐 Sécurité

### Authentification
- **Sessions Django** : Authentification basée sur les sessions
- **JWT** : Support pour les tokens JWT (via REST Framework)
- **CSRF Protection** : Protection CSRF activée (désactivée pour GraphQL via middleware personnalisé)
- **CORS** : Configuration stricte des origines autorisées

### Protection des Données
- **ORM Django** : Protection contre les injections SQL
- **Validation** : Validation des formulaires et modèles
- **Permissions** : Système de permissions Django
- **Secrets** : Variables d'environnement pour les clés sensibles

### Middleware Personnalisé
- **DisableCSRFForGraphQL** : Désactive CSRF pour les requêtes GraphQL (nécessaire pour Apollo Client)

---

## 📊 Base de Données

### Connexion
- **Moteur** : SQL Server via `mssql-django` et `pyodbc`
- **Driver** : ODBC Driver 17 for SQL Server
- **Authentification** : Trusted Connection (Windows Authentication)

### Schéma Dynamique
Le système récupère automatiquement le schéma de la base de données pour :
- Générer des requêtes SQL intelligentes
- Valider les structures de données
- Fournir des informations à l'IA

### Migrations
- **Système** : Django Migrations
- **Fichiers** : `election_app/migrations/`
- **Commandes** : `python manage.py makemigrations`, `python manage.py migrate`

---

## 🚀 Déploiement

### Backend (Django)

**Sur Render/Railway** :
1. Créer un service web Python
2. **Build command** : `pip install -r requirements.txt && python manage.py migrate`
3. **Start command** : `gunicorn election_app.wsgi:application --log-file -`
4. Configurer les variables d'environnement

### Frontend (Next.js)

**Sur Vercel** :
1. Connecter le repository GitHub
2. Vercel détecte automatiquement Next.js
3. Configurer `NEXT_PUBLIC_API_URL` pointant vers le backend
4. Déploiement automatique à chaque push

### Prérequis
- Python 3.12+
- Node.js 18+
- SQL Server (Azure SQL Database ou local)
- ODBC Driver 17 for SQL Server

---

## 📦 Dépendances Principales

### Backend (Python)
- Django 5.0.14
- graphene 3.4.3
- graphene-django 3.2.3
- mssql-django 1.5
- pyodbc 5.2.0
- google-genai 1.0.0
- pandas 2.3.1
- SQLAlchemy 2.0.41
- django-cors-headers 4.7.0
- djangorestframework 3.16.0
- python-dotenv 1.0.1
- gunicorn 23.0.0

### Frontend (Node.js)
- next 15.5.4
- react 18.3.1
- @apollo/client 3.13.8
- tailwindcss 3.3.3
- react-hook-form 7.60.0
- recharts 2.12.7
- zustand 5.0.4
- lucide-react 0.446.0
- @radix-ui/* (multiples composants UI)

---

## 🔄 Flux de Données

### Requête GraphQL Typique

1. **Client (Next.js)** : Envoie une requête GraphQL via Apollo Client
2. **Apollo Client** : Gère le cache et les requêtes
3. **Backend (Django)** : Reçoit la requête via `/graphql/`
4. **Graphene** : Résout la requête en appelant les resolvers
5. **Resolvers** : Interrogent les modèles Django
6. **ORM Django** : Convertit en requêtes SQL
7. **SQL Server** : Exécute la requête
8. **Retour** : Données sérialisées en JSON via GraphQL

### Requête IA (Gemini)

1. **Client** : Envoie un prompt via `run` ou `runForGraphs`
2. **Resolver** : Appelle `generate_sql_query(prompt)`
3. **Gemini** : Génère la requête SQL
4. **Backend** : Exécute la requête SQL
5. **Gemini** (optionnel) : Génère du code D3.js ou formate les données
6. **Client** : Reçoit les résultats ou le code HTML/JS

---

## 🧪 Tests et Qualité

### Validation
- Validation des modèles Django
- Validation des formulaires
- Validation des schémas GraphQL
- Validation TypeScript côté frontend

### Logs
- Logs Django pour le backend
- Console logs Apollo Client pour le frontend
- Logs d'erreur pour les requêtes IA

---

## 📈 Fonctionnalités Futures

### Améliorations Prévues
- **WebSockets** : Suivi en temps réel du dépouillement
- **Tableau interactif** : Visualisation géographique avec alertes IA
- **Export automatique** : Génération de rapports CSV/PDF via IA
- **Notifications push** : Alertes en temps réel
- **Multi-tenant** : Support de plusieurs organisations
- **Audit trail** : Historique complet des actions

---

## 👥 Contribution

### Structure de Développement
- **Méthodologie** : Approche agile avec livraisons incrémentales
- **Documentation** : UML (cas d'utilisation, diagrammes de classes)
- **CI/CD** : Pipeline léger pour automatiser les déploiements

### Standards de Code
- **Backend** : PEP 8 (Python)
- **Frontend** : ESLint + TypeScript strict
- **Commits** : Messages descriptifs

---

## 📝 Notes Techniques

### Points d'Attention

1. **Connexion SQL Server** : Utilise l'échappement des backslashes pour les noms de serveur Windows
2. **Sérialisation JSON** : Gestion spéciale des dates et Decimal pour la compatibilité JSON
3. **Upload de fichiers** : Support des images via `apollo-upload-client`
4. **CORS** : Configuration spécifique pour Apollo Client avec credentials
5. **CSRF** : Désactivé pour GraphQL mais activé pour les autres endpoints

### Optimisations

- **Cache Apollo** : Mise en cache des requêtes GraphQL
- **Lazy loading** : Chargement différé des images
- **Pagination** : Support de la pagination pour les grandes listes
- **Indexation DB** : Index sur les champs fréquemment recherchés

---

## 📞 Support

### Auteur
**Piz (TheBallotProject)**
- Email : eminiantpisani@yahoo.fr

### Licence
Projet sous licence MIT.

---

## 📚 Ressources

### Documentation Externe
- [Django Documentation](https://docs.djangoproject.com/)
- [Graphene Documentation](https://docs.graphene-python.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [Google Gemini API](https://ai.google.dev/)

### Fichiers de Référence
- `README.md` : Guide d'installation et démarrage rapide
- `CONFIGURATION.md` : Guide détaillé de configuration
- `schema.sql` : Schéma SQL de référence (si disponible)

---

*Dernière mise à jour : 2025*

