from google import genai
import pyodbc
from sqlalchemy import create_engine, text

def initialize_genai_client(api_key):
    return genai.Client(api_key=api_key)

def generate_sql_query(client, query):
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

    prompt = (
        f"Generate an optimized SQL Server query for the following request based on this db schema {schema_bd} . Give me just the query without any comments. Don't add any other character, nothing. "
        "Ensure it follows SQL Server syntax strictly: " + query
    )
    response = client.models.generate_content(
        model="gemini-2.0-flash", 
        contents=prompt)

    return response.text.strip()

def create_db_connection(server, database):
    connection_string = (
        f"mssql+pyodbc://@{server}/{database}?trusted_connection=yes&driver=ODBC+Driver+17+for+SQL+Server"
    )
    return create_engine(connection_string)

def execute_sql_query(engine, query):
    with engine.connect() as connection:
        result = connection.execute(text(query))
        return result.fetchall()

def main():
    api_key = "AIzaSyA_LLcHUt9wGtdX7wDOAbwtB5y4pzj9drY"
    client = initialize_genai_client(api_key)

    query = (
        "quel est le nombre d elections ?"
    )
    
    generated_sql = generate_sql_query(client, query)
    
    generated_sql = generated_sql.replace("```", "").replace("sql", "").strip()
    
    
    print("=========================================================Requête SQL générée :", generated_sql)
    
    server = 'localhost\\SQLEXPRESS03'
    database = 'electionapp'
    
    engine = create_db_connection(server, database)
    
    try:
        rows = execute_sql_query(engine, generated_sql)
        print("=========================================================================Résultats de la requête SQL :")
        for row in rows:
            print(row)
    except Exception as e:
        print("Erreur lors de l'exécution de la requête SQL :", str(e))

if __name__ == "__main__":
    main()
