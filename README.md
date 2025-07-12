🗳️ TheBallotProject
📌 Description
TheBallotProject est une plateforme web de gestion d’élections, conçue pour faciliter l’organisation et le suivi des processus électoraux tout en exploitant des capacités avancées d’analyse de données assistées par intelligence artificielle.
Elle offre :

la gestion sécurisée des entités électorales (électeurs, bureaux de vote, candidats, résultats),

des outils analytiques utilisant des modèles IA via l’API Gemini,

et une interface moderne pensée pour la visualisation et l’optimisation des prises de décision.

🚀 Fonctionnalités principales
✅ Gestion des scrutins et des bulletins
✅ Tableau de bord en temps réel des données électorales
✅ Requêtes IA (via Gemini) pour générer des analyses prédictives, des insights et des rapports textuels
✅ Architecture modulaire et sécurisée, avec séparation claire du front-end et du back-end
✅ Historique des événements et journaux d’audit

🏗️ Architecture technique
Couche	Technologie	Description
Frontend	Next.js (déployé sur Vercel)	Interface utilisateur, SSR et API Routes pour quelques interactions front
Backend	Django REST Framework	Gestion de la logique métier, API sécurisée JWT
IA / NLP	API Gemini	Analyse intelligente des données et génération de rapports
Base de données	Azure SQL Server	Stockage des données électorales et historiques
Authentification	JWT + Django	Sécurisation des accès utilisateurs

⚙️ Stack détaillée
Python 3.12, Django 4+, DRF

mssql-django, pyodbc pour la connexion à SQL Server Azure

django-cors-headers pour sécuriser les échanges avec le frontend

gunicorn pour le déploiement sur Render / Railway

Next.js 14, avec SSR optimisé pour le SEO et la rapidité

Vercel pour le hosting du front

Render / Railway pour le backend

Utilisation de dotenv pour gérer les variables sensibles

Appels à Gemini (via HTTP API) pour des analyses électorales automatiques

🧭 Méthodologie
Développement suivant une approche agile, avec livraisons incrémentales et tests continus.

Utilisation d’UML (cas d’utilisation, diagrammes de classes, séquences) pour clarifier la structure et les interactions.

Mise en place d’un pipeline de CI/CD léger pour automatiser les déploiements.

🔥 Installation locale
⚙️ Prérequis
Python 3.12

Node.js 18+

SQL Server (ex: Azure SQL Database)

Drivers ODBC 17 (pour Windows / Linux)

📦 Backend (Django)
bash
Copy
Edit
git clone https://github.com/ton-utilisateur/TheBallotProject.git
cd TheBallotProject
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate sous Windows
pip install -r requirements.txt
Configure ton .env (ou tes variables d’environnement) :

ini
Copy
Edit
DJANGO_SECRET_KEY=ton_secret
DEBUG=True
DATABASE_NAME=ton_db
DATABASE_USER=ton_user
DATABASE_PASSWORD=ton_password
DATABASE_HOST=ton_server.database.windows.net
DATABASE_PORT=1433
Puis :

bash
Copy
Edit
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
🚀 Frontend (Next.js)
bash
Copy
Edit
cd frontend
npm install
npm run dev
(frontend configuré pour appeler le backend via une variable NEXT_PUBLIC_API_URL)

🚀 Déploiement
✈️ Sur Vercel (Frontend)
Connecte ton repo GitHub

Vercel détectera automatiquement Next.js

Renseigne NEXT_PUBLIC_API_URL=https://api.theballotproject.com

☁️ Sur Render ou Railway (Backend)
Crée un service web Python

Start command :

bash
Copy
Edit
gunicorn TheBallotProject.wsgi:application --log-file -
Build command :

bash
Copy
Edit
pip install -r requirements.txt && python manage.py migrate
Ajoute tes variables :

Copy
Edit
DJANGO_SECRET_KEY, DATABASE_NAME, DATABASE_USER, etc.
🤖 Usage IA
Le backend expose des endpoints pour envoyer des données électorales (votes, tendances, historiques) et obtenir :

des analyses prédictives (probabilité de victoire, clustering géographique),

des synthèses textuelles intelligentes des résultats,

ou encore des recommandations stratégiques (ex: augmenter la couverture dans certaines zones).

Tout est orchestré via des appels à l’API Gemini.

✅ Tests & Sécurité
Vérifications automatiques sur les modèles (validations d’intégrité)

JWT pour sécuriser les endpoints API

Protection contre les injections SQL via l’ORM Django

Historisation et logs pour audit

🧩 Exemples d’extensions futures
🚀 Ajout de websocket pour suivre en temps réel le dépouillement
🚀 Tableau interactif des zones géographiques avec alertes IA
🚀 Export CSV / PDF auto-générés des synthèses IA

🙌 Auteur
Piz (TheBallotProject)
✉️ eminiantpisani@yahoo.fr

📜 Licence
Projet sous licence MIT.

