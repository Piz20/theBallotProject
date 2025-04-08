from fastapi import FastAPI
from sqlalchemy import create_engine, text
import google as genai
import pandas as pd
import json

app = FastAPI()

# Configuration Google Gemini
genai.Client(api_key="AIzaSyA_LLcHUt9wGtdX7wDOAbwtB5y4pzj9drY")

# Connexion SQL Server
server = 'localhost\\SQLEXPRESS03'
database = 'electionapp'
connection_string = f"mssql+pyodbc://@{server}/{database}?trusted_connection=yes&driver=ODBC+Driver+17+for+SQL+Server"
engine = create_engine(connection_string)

# Définition du schéma de la BD (extrait)
schema_bd = """
Le schéma de la base de données est le suivant :
Tables et colonnes :
- **auth_group** : (id: int, PRIMARY KEY), (name: nvarchar(150), UNIQUE)
- **auth_group_permissions** : (id: bigint, PRIMARY KEY), (group_id: int, FOREIGN KEY), (permission_id: int, FOREIGN KEY)
- **auth_permission** : (id: int, PRIMARY KEY), (name: nvarchar(255)), (content_type_id: int, FOREIGN KEY), (codename: nvarchar(100))
- **authtoken_token** : (key: nvarchar(40), PRIMARY KEY), (created: datetimeoffset), (user_id: bigint, FOREIGN KEY, UNIQUE)
- **django_admin_log** : (id: int, PRIMARY KEY), (action_time: datetimeoffset), (object_id: nvarchar(-1), NULLABLE), (object_repr: nvarchar(200)), (action_flag: smallint), (change_message: nvarchar(-1)), (content_type_id: int, FOREIGN KEY, NULLABLE), (user_id: bigint, FOREIGN KEY)
- **django_content_type** : (id: int, PRIMARY KEY), (app_label: nvarchar(100)), (model: nvarchar(100))
- **django_migrations** : (id: bigint, PRIMARY KEY), (app: nvarchar(255)), (name: nvarchar(255)), (applied: datetimeoffset)
- **django_session** : (session_key: nvarchar(40), PRIMARY KEY), (session_data: nvarchar(-1)), (expire_date: datetimeoffset)
- **election_app_candidate** : (id: int, PRIMARY KEY), (name: nvarchar(255)), (bio: nvarchar(-1)), (vote_count: int), (profile_picture: nvarchar(100), NULLABLE), (election_id: int, FOREIGN KEY)
- **election_app_customuser** : (id: bigint, PRIMARY KEY), (password: nvarchar(128)), (last_login: datetimeoffset, NULLABLE), (is_superuser: bit), (first_name: nvarchar(150)), (last_name: nvarchar(150)), (is_staff: bit), (is_active: bit), (date_joined: datetimeoffset), (name: nvarchar(255), NULLABLE), (matricule: nvarchar(100), NULLABLE), (gender: nvarchar(10), NULLABLE), (email: nvarchar(254), UNIQUE), (date_of_birth: date, NULLABLE), (elections: nvarchar(-1), NULLABLE), (profile_picture: nvarchar(100), NULLABLE)
- **election_app_customuser_groups** : (id: bigint, PRIMARY KEY), (customuser_id: bigint, FOREIGN KEY), (group_id: int, FOREIGN KEY)
- **election_app_customuser_user_permissions** : (id: bigint, PRIMARY KEY), (customuser_id: bigint, FOREIGN KEY), (permission_id: int, FOREIGN KEY)
- **election_app_election** : (id: int, PRIMARY KEY), (name: nvarchar(255), UNIQUE), (description: nvarchar(-1)), (start_date: datetimeoffset), (end_date: datetimeoffset)
- **election_app_election_voters** : (id: bigint, PRIMARY KEY), (election_id: int, FOREIGN KEY), (customuser_id: bigint, FOREIGN KEY)
- **election_app_vote** : (id: bigint, PRIMARY KEY), (candidate_id: int, FOREIGN KEY), (user_id: bigint, FOREIGN KEY)
"""

def generate_sql_query(prompt):
    """Utilise Google Gemini pour générer une requête SQL basée sur le prompt."""
    request = f"Crée une requête SQL Server optimisée pour cette base de données : {schema_bd}. La requête doit répondre à : {prompt}. Ne renvoie que la requête SQL."
    
    response = genai.GenerativeModel("gemini-1.5-flash").generate_content(request)
    
    return response.text.strip().replace("```sql", "").replace("```", "").strip()

@app.get("/query")
def execute_prompt(prompt: str):
    """Exécute une requête SQL générée par IA et renvoie les données JSON."""
    sql_query = generate_sql_query(prompt)
    
    try:
        with engine.connect() as connection:
            result = connection.execute(text(sql_query))
            df = pd.DataFrame(result.fetchall(), columns=result.keys())
        
        return {"query": sql_query, "data": df.to_dict(orient="records")}
    except Exception as e:
        return {"error": str(e)}

# Lancer l'API avec : uvicorn server:app --reload --host 0.0.0.0 --port 8000
