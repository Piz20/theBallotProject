import datetime
import json
import os

import graphene
import pandas as pd
from dotenv import load_dotenv
from election_app.api.graphql.utils import reformat_result
from google import genai
from graphene.types.generic import GenericScalar
from sqlalchemy import create_engine, text
import decimal

# Load environment variables
load_dotenv()

# Gemini API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialisation du client Gemini
def initialize_genai_client(api_key):
    # Added a check for GEMINI_API_KEY to ensure it's not None
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found. Please set it in your .env file.")
    return genai.Client(api_key=api_key)

client = initialize_genai_client("AIzaSyBDXE7XuiFnWPU5z9Y2E8zoCIxR2Ix7jqc")

# Connexion à SQL Server
server = 'DESKTOP-IIMUDN9\\SQLEXPRESS'
database = 'electionapp'
connection_string = f"mssql+pyodbc://@{server}/{database}?trusted_connection=yes&driver=ODBC+Driver 17 for SQL Server"
engine = create_engine(connection_string)

# Function to dynamically get the database schema (simplified to just tables and columns)
def get_dynamic_schema():
    schema_info = ["Le schéma de la base de données est le suivant :", "Tables et colonnes :"]
    try:
        with engine.connect() as connection:
            # SQL query to get all columns from all base tables
            sql_query = """
            SELECT
                TABLE_SCHEMA AS SchemaName,
                TABLE_NAME AS TableName,
                COLUMN_NAME AS ColumnName,
                DATA_TYPE AS DataType,
                CASE IS_NULLABLE WHEN 'YES' THEN 'NULLABLE' ELSE 'NOT NULL' END AS Nullability
            FROM
                INFORMATION_SCHEMA.COLUMNS
            WHERE
                TABLE_NAME IN (SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE')
            ORDER BY
                TABLE_SCHEMA,
                TABLE_NAME,
                ORDINAL_POSITION;
            """
            result = connection.execute(text(sql_query))
            
            current_table = None
            for row in result:
                table_name = row.TableName
                col_name = row.ColumnName
                data_type = row.DataType
                nullability = row.Nullability

                if table_name != current_table:
                    if current_table is not None:
                        schema_info.append("\n") # Add a blank line for separation
                    schema_info.append(f"- {table_name} :")
                    current_table = table_name
                
                # Format the column information
                col_string = f"  - ({col_name}: {data_type}"
                if nullability == 'NULLABLE':
                    col_string += ", NULLABLE"
                col_string += ")"
                schema_info.append(col_string)
                
        return "\n".join(schema_info)
    except Exception as e:
        print(f"Error getting dynamic schema: {e}")
        # Fallback to an empty string or handle error appropriately if dynamic schema fails
        return "Erreur lors de la récupération du schéma dynamique de la base de données."

# Dynamically get the schema at startup
schema_bd = get_dynamic_schema()

# Génération de requête SQL à partir du prompt
def generate_sql_query(prompt):
    request = f"Crée une requête SQL Server optimisée pour cette base : {schema_bd}. Réponds à : {prompt}. Ne renvoie que la requête SQL. Et ne te base que sur le schema de la BD transmis , toutes les colomnes necessaires y sont specifiees"
    response = client.models.generate_content(model="gemini-2.0-flash", contents=request)
    return response.text.strip().replace("```sql", "").replace("```", "").strip()

# Fonction pour récupérer les données réelles à partir de la base de données (MODIFIED)
def get_data_from_db(sql_query):
    try:
        with engine.connect() as connection:
            result = connection.execute(text(sql_query))
            df = pd.DataFrame(result.fetchall(), columns=result.keys())

        # Conversion pour sérialisation JSON
        for col in df.columns:
            if pd.api.types.is_datetime64_any_dtype(df[col]):
                df[col] = df[col].apply(lambda x:
                    x.isoformat(timespec='milliseconds') if pd.notna(x) and isinstance(x, datetime.datetime) else
                    x.isoformat() if pd.notna(x) and isinstance(x, datetime.date) else
                    None
                )
            elif pd.api.types.is_object_dtype(df[col]):
                df[col] = df[col].apply(lambda x:
                    x.isoformat(timespec='milliseconds') if hasattr(x, 'isoformat') and isinstance(x, datetime.datetime) and pd.notna(x) else
                    x.isoformat() if hasattr(x, 'isoformat') and isinstance(x, datetime.date) and pd.notna(x) else
                    float(x) if isinstance(x, decimal.Decimal) else
                    x
                )
            elif pd.api.types.is_numeric_dtype(df[col]):
                df[col] = df[col].apply(lambda x: float(x) if isinstance(x, decimal.Decimal) else x)

        return df.to_dict(orient="records")

    except Exception as e:
        raise Exception(f"Erreur lors de l'exécution de la requête SQL : {e}")
    
# Fonction pour générer le code D3.js
def generate_d3_code(prompt, data):
    request = f"""
    Voici le schéma de ma base de données : {schema_bd}.

    Donne-moi le code HTML avec un beau CSS, une légende du graphique, bref quelque chose de très détaillé, même lorsqu’on survole avec la souris , tu dois etre capable de representer tous les graphes de d3js . Je dois pouvoir faire des comparaisons avec n'importe quoi

    Il y aura des explications précises en dessous du graphique. Il doit aussi y avoir la possibilité que la requête ne retourne pas de résultats graphiques, mais par exemple des données simples avec des explications écrites. Tu dois avoir assez de jugeote pour savoir si l’on doit afficher un graphique ou non, même si ce n’est pas précisé explicitement.

    Une belle mise en page intelligente du graphique en utilisant D3.js qui peut illustrer la requête suivante : {prompt}.

    Voici les données associées : {data}.

    Surtout, n’ajoute aucun commentaire. Je veux juste le code exécutable dans le navigateur.
    """

    # Appel à l'API Gemini pour générer le code D3.js avec les données réelles
    response = client.models.generate_content(model="gemini-2.0-flash", contents=request)
    return response.text.strip()

def voter_search_gemini(prompt, data):
    request = f"""
   Voici le schéma de ma base de données : {schema_bd}.

Retourne la liste des utilisateurs correspondant à la requête suivante : {prompt}.

Le résultat doit être un tableau JSON d’objets issus de la table des utilisateurs, incluant **tous les champs** sans exception.

Si aucun utilisateur ne correspond, retourne un tableau JSON vide (`[]`).

Les dates doivent être traitées en temps réel pour les comparaisons.

Tu dois pouvoir effectuer des opérations complexes : jointures, filtres, tris, calculs et comparaisons.

Voici également les données associées : {data}.

Ne fournis aucun commentaire, uniquement les données JSON strictes.
"""

    # Appel à l'API Gemini pour générer le code D3.js avec les données réelles
    response = client.models.generate_content(model="gemini-2.0-flash", contents=request)
    return response.text.strip()



def generate_dashboard_stats():
    prompt = f"""
Voici le schéma de ma base de données :
{schema_bd}

Génère **une requête SQL Server unique** pour calculer 3 statistiques électorales clés pour un tableau de bord.
Les statistiques doivent inclure :
- "title" (ex : "Élections actives")
- "value" (nombre ou pourcentage)
- "change" (variation temporelle ex. "+2 ce mois", "+18% vs dernier mois")

La requête doit retourner **exactement** ces trois lignes (une par statistique) sous forme d’un tableau :
- Chaque ligne doit avoir : "title", "value", "change"

Réponds uniquement avec la requête SQL.
    """

    try:
        # Étape 1 : Génération de la requête SQL par Gemini
        sql_query = generate_sql_query(prompt)

        # Étape 2 : Exécution de la requête et récupération des données
        results = get_data_from_db(sql_query)

        # Étape 3 : Vérification de la structure
        expected_keys = {"title", "value", "change"}
        if all(isinstance(row, dict) and expected_keys.issubset(row.keys()) for row in results):
            return results
        else:
            raise ValueError("Résultat inattendu : chaque ligne doit contenir 'title', 'value' et 'change'.")

    except Exception as e:
        return {
            "error": str(e)
        }


# Définition du Query GraphQL
class Query(graphene.ObjectType):
    run = graphene.Field(GenericScalar, prompt=graphene.String(required=True))
    run_for_graphs = graphene.Field(graphene.String, prompt=graphene.String(required=True))
    voter_search = graphene.Field(GenericScalar, prompt=graphene.String(required=True)) # GraphQL field name
    auto_dashboard_stats = graphene.Field(GenericScalar)

    def resolve_run(self, info, prompt):
        sql_query = generate_sql_query(prompt)

        try:
            with engine.connect() as connection:
                result = connection.execute(text(sql_query))
                df = pd.DataFrame(result.fetchall(), columns=result.keys())

            # --- REVISED FIX FOR JSON SERIALIZATION IN RESOLVE_RUN ---
            # Apply the same datetime serialization here as well for direct queries
            for col in df.columns:
                if pd.api.types.is_datetime64_any_dtype(df[col]):
                    df[col] = df[col].apply(lambda x: 
                        x.isoformat(timespec='milliseconds') if pd.notna(x) and isinstance(x, datetime.datetime) else 
                        x.isoformat() if pd.notna(x) and isinstance(x, datetime.date) else 
                        None
                    )
                elif pd.api.types.is_object_dtype(df[col]):
                    df[col] = df[col].apply(lambda x: 
                        x.isoformat(timespec='milliseconds') if hasattr(x, 'isoformat') and isinstance(x, datetime.datetime) and pd.notna(x) else 
                        x.isoformat() if hasattr(x, 'isoformat') and isinstance(x, datetime.date) and pd.notna(x) else 
                        x
                    )
            # --- END REVISED FIX ---

            return {
                "query": sql_query,
                "data": df.to_dict(orient="records")
            }
        except Exception as e:
            return {
                "error": str(e),
                "query": sql_query
            }

    def resolve_run_for_graphs(self, info, prompt):
        try:
            # First, generate the SQL query
            sql_query = generate_sql_query(prompt)
            # Then, get the data using the generated SQL query
            data = get_data_from_db(sql_query)
            html_content = generate_d3_code(prompt, data)
            reformated_html = reformat_result(html_content)
            return reformated_html
        except Exception as e:
            # Return error as string for this specific field type
            return str(e)

    def resolve_voter_search(self, info, prompt):
        sql_query = "" 
        data = None 
        try:
            # Step 1: Generate the SQL query
            sql_query = generate_sql_query(prompt)
            
            # Step 2: Get the data from the database using the generated SQL query
            data = get_data_from_db(sql_query)
            
            # Step 3: Use Gemini to format or refine the voter search results
            gemini_formatted_data_str = voter_search_gemini(prompt, json.dumps(data))
            reformated_gemini_formatted_data_str = reformat_result(gemini_formatted_data_str)
            
            final_data = [] # Initialize as an empty list, ensuring consistent type

            # Attempt to parse the JSON string returned by Gemini
            try:
                parsed_gemini_output = json.loads(reformated_gemini_formatted_data_str)
                
                # IMPORTANT: Ensure the parsed output is actually a list of objects, as expected for 'data'.
                # If Gemini sometimes returns a single object or something else, handle it.
                if isinstance(parsed_gemini_output, list):
                    final_data = parsed_gemini_output
                else:
                    # If it's valid JSON but not a list, raise a ValueError to be caught below
                    raise ValueError(f"Gemini returned valid JSON, but it's not a list: {type(parsed_gemini_output)}")

            except json.JSONDecodeError as e:
                # If Gemini's output isn't valid JSON after reformatting
                # We return an error message in the 'error' field.
                # 'data' will remain an empty list, maintaining schema consistency.
                return {
                    "error": f"Gemini did not return valid JSON for voter search: {e}. Raw output: {reformated_gemini_formatted_data_str[:200]}...",
                    "prompt_used": prompt,
                    "sql_query": sql_query,
                    "data": [] # Ensures 'data' is always a list for the frontend
                }
            except ValueError as e:
                # Catch the ValueError from the isinstance check or other parsing issues
                return {
                    "error": str(e),
                    "prompt_used": prompt,
                    "sql_query": sql_query,
                    "data": [] # Ensures 'data' is always a list for the frontend
                }

            return {
                "sql_query": sql_query,
                "data": final_data # This will now consistently be a list (possibly empty)
            }
        except Exception as e:
            # Catch any other unexpected errors during the entire process
            # and return a structured error response.
            return {
                "error": str(e),
                "prompt_used": prompt,
                "sql_query": sql_query,  # Include the generated SQL query even on error
                "data": [] # Ensures 'data' is always a list on any critical error
            }
    
    def resolve_auto_dashboard_stats(self, info):
        return generate_dashboard_stats()

schema = graphene.Schema(query=Query)