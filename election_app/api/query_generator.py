from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from sqlalchemy import create_engine, text
from google import genai
from election_app.api.utils import reformat_html
import pandas as pd

# Clé API Gemini
api_key = "AIzaSyA_LLcHUt9wGtdX7wDOAbwtB5y4pzj9drY"

# Initialisation du client Gemini
def initialize_genai_client(api_key):
    return genai.Client(api_key=api_key)

client = initialize_genai_client(api_key)

# Connexion à SQL Server
server = 'localhost\\SQLEXPRESS03'
database = 'electionapp'
connection_string = f"mssql+pyodbc://@{server}/{database}?trusted_connection=yes&driver=ODBC+Driver+17+for+SQL+Server"
engine = create_engine(connection_string)

# Schéma de la base de données
schema_bd = """
Le schéma de la base de données est le suivant :
Tables et colonnes :
- auth_group : (id: int, PRIMARY KEY), (name: nvarchar(150), UNIQUE)
- auth_group_permissions : (id: bigint, PRIMARY KEY), (group_id: int, FOREIGN KEY), (permission_id: int, FOREIGN KEY)
- auth_permission : (id: int, PRIMARY KEY), (name: nvarchar(255)), (content_type_id: int, FOREIGN KEY), (codename: nvarchar(100))
- authtoken_token : (key: nvarchar(40), PRIMARY KEY), (created: datetimeoffset), (user_id: bigint, FOREIGN KEY, UNIQUE)
- django_admin_log : (id: int, PRIMARY KEY), (action_time: datetimeoffset), (object_id: nvarchar(-1), NULLABLE), (object_repr: nvarchar(200)), (action_flag: smallint), (change_message: nvarchar(-1)), (content_type_id: int, FOREIGN KEY, NULLABLE), (user_id: bigint, FOREIGN KEY)
- django_content_type : (id: int, PRIMARY KEY), (app_label: nvarchar(100)), (model: nvarchar(100))
- django_migrations : (id: bigint, PRIMARY KEY), (app: nvarchar(255)), (name: nvarchar(255)), (applied: datetimeoffset)
- django_session : (session_key: nvarchar(40), PRIMARY KEY), (session_data: nvarchar(-1)), (expire_date: datetimeoffset)
- election_app_candidate : (id: int, PRIMARY KEY), (name: nvarchar(255)), (bio: nvarchar(-1)), (vote_count: int), (profile_picture: nvarchar(100), NULLABLE), (election_id: int, FOREIGN KEY)
- election_app_customuser : (id: bigint, PRIMARY KEY), (password: nvarchar(128)), (last_login: datetimeoffset, NULLABLE), (is_superuser: bit), (first_name: nvarchar(150)), (last_name: nvarchar(150)), (is_staff: bit), (is_active: bit), (date_joined: datetimeoffset), (name: nvarchar(255), NULLABLE), (matricule: nvarchar(100), NULLABLE), (gender: nvarchar(10), NULLABLE), (email: nvarchar(254), UNIQUE), (date_of_birth: date, NULLABLE), (elections: nvarchar(-1), NULLABLE), (profile_picture: nvarchar(100), NULLABLE)
- election_app_customuser_groups : (id: bigint, PRIMARY KEY), (customuser_id: bigint, FOREIGN KEY), (group_id: int, FOREIGN KEY)
- election_app_customuser_user_permissions : (id: bigint, PRIMARY KEY), (customuser_id: bigint, FOREIGN KEY), (permission_id: int, FOREIGN KEY)
- election_app_election : (id: int, PRIMARY KEY), (name: nvarchar(255), UNIQUE), (description: nvarchar(-1)), (start_date: datetimeoffset), (end_date: datetimeoffset)
- election_app_election_eligible_voters : (id: bigint, PRIMARY KEY), (election_id: int, FOREIGN KEY), (customuser_id: bigint, FOREIGN KEY)
- election_app_vote : (id: bigint, PRIMARY KEY), (created_at: datetimeoffset), (candidate_id: int, FOREIGN KEY), (election_id: int, FOREIGN KEY), (user_id: bigint, FOREIGN KEY)
"""


# Génération de requête SQL à partir du prompt
def generate_sql_query(prompt):
    request = f"Crée une requête SQL Server optimisée pour cette base : {schema_bd}. Réponds à : {prompt}. Ne renvoie que la requête SQL. Et ne te base que sur le schema de la BD transmis , toutes les colomnes necessaires y sont specifiees"
    response = client.models.generate_content(model="gemini-2.0-flash", contents=request)
    return response.text.strip().replace("```sql", "").replace("```", "").strip()



# Fonction pour récupérer les données réelles à partir de la base de données
def get_data_from_db(prompt):
    sql_query = generate_sql_query(prompt)  # Générer la requête SQL basée sur le prompt
    
    try:
        with engine.connect() as connection:
            result = connection.execute(text(sql_query))
            df = pd.DataFrame(result.fetchall(), columns=result.keys())
        return df.to_dict(orient="records")  # Retourner les données sous forme de dictionnaire
    except Exception as e:
        raise Exception(f"Erreur lors de l'exécution de la requête SQL : {e}")

# Fonction pour générer le code D3.js
def generate_d3_code(prompt, data):
    request = f"""  
     Voici le schéma de ma base de données {schema_bd} ,
     donne-moi le code HTML avec un beau css , et une legende du graphique , bref quelque chose de tres detaille meme lorsqu on survol avec la souris , une belle mise en page intelligente du graphique en utilisant d3js qui peut illustrer la requête suivante : {prompt}
     Voici les données associées : {data}
     
     surtout n ajoute aucun commentaire je veux juste le code executable dans le navigateur
     """
    
    # Appel à l'API Gemini pour générer le code D3.js avec les données réelles
    response = client.models.generate_content(model="gemini-2.0-flash", contents=request)
    return response.text.strip()



# Vue principale
class QueryViewSet(viewsets.ViewSet):

    @action(detail=False, methods=["get"])
    def run(self, request):
        prompt = request.query_params.get("prompt", "")
        if not prompt:
            return Response({"error": "Le paramètre 'prompt' est requis."}, status=status.HTTP_400_BAD_REQUEST)

        sql_query = generate_sql_query(prompt)

        try:
            with engine.connect() as connection:
                result = connection.execute(text(sql_query))
                df = pd.DataFrame(result.fetchall(), columns=result.keys())

            return Response({
                "query": sql_query,
                "data": df.to_dict(orient="records")
            })

        except Exception as e:
            return Response({"error": str(e), "query": sql_query}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
    @action(detail=False, methods=["get"])
    def run_for_graphs(self, request):
        # Récupérer le paramètre 'prompt' depuis la requête
        prompt = request.query_params.get("prompt", "")
        
        if not prompt:
            return Response({"error": "Le paramètre 'prompt' est requis."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Récupérer les données réelles de la base de données pour le graphique
            data = get_data_from_db(prompt)
            
            # Générer le code D3.js avec les données réelles
            html_content = generate_d3_code(prompt, data)
            
            reformatedHTML = reformat_html(html_content)

            return Response(reformatedHTML, content_type="text/html")

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)