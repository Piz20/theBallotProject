import graphene
from graphene_django.types import DjangoObjectType
from ...models import EligibleEmail, Election # Assurez-vous que Election est bien importé de votre models.py

# --- Types GraphQL ---

# Le type ElectionType doit exister pour que EligibleEmailType puisse y faire référence.
# Si vous avez déjà un schéma global, ce type devrait déjà être défini.
# Je l'inclus ici pour la clarté, mais ne le dupliquez pas si vous l'avez ailleurs.
class ElectionType(DjangoObjectType):
    class Meta:
        model = Election
        fields = ('id', 'name') # Exposez les champs nécessaires pour la relation

# Type pour le modèle EligibleEmail
class EligibleEmailType(DjangoObjectType):
    class Meta:
        model = EligibleEmail
        fields = ('id', 'email', 'election') # Exposez les champs souhaités, y compris 'id'

# --- Requêtes (Queries) pour EligibleEmail ---

class EligibleEmailQuery(graphene.ObjectType):
    # Récupérer tous les emails éligibles
    all_eligible_emails = graphene.List(EligibleEmailType)

    # Récupérer un email éligible par son ID
    eligible_email_by_id = graphene.Field(EligibleEmailType, id=graphene.Int())

    # Récupérer tous les emails pour une élection donnée par son ID
    eligible_emails_by_election = graphene.List(EligibleEmailType, election_id=graphene.Int())


    def resolve_all_eligible_emails(root, info):
        return EligibleEmail.objects.all()

    def resolve_eligible_email_by_id(root, info, id):
        try:
            return EligibleEmail.objects.get(pk=id)
        except EligibleEmail.DoesNotExist:
            return None

    def resolve_eligible_emails_by_election(root, info, election_id):
        try:
            election = Election.objects.get(pk=election_id)
            return EligibleEmail.objects.filter(election=election)
        except Election.DoesNotExist:
            return [] # Retourne une liste vide si l'élection n'existe pas

# --- Mutations (pour créer, modifier, supprimer EligibleEmail) ---

# Mutation pour créer un EligibleEmail
class CreateEligibleEmail(graphene.Mutation):
    class Arguments:
        election_id = graphene.Int(required=True)
        email = graphene.String(required=True)

    eligible_email = graphene.Field(EligibleEmailType) # Le champ 'eligible_email' retourné inclura son 'id'

    def mutate(root, info, election_id, email):
        try:
            election = Election.objects.get(pk=election_id)
        except Election.DoesNotExist:
            raise Exception("Élection introuvable.")

        # Vérifier si l'email existe déjà pour cette élection pour éviter les doublons
        if EligibleEmail.objects.filter(election=election, email=email).exists():
            raise Exception("Cet email est déjà éligible pour cette élection.")

        eligible_email = EligibleEmail(election=election, email=email)
        eligible_email.save()
        return CreateEligibleEmail(eligible_email=eligible_email)

# Mutation pour mettre à jour un EligibleEmail
class UpdateEligibleEmail(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True) # ID requis pour identifier l'objet à mettre à jour
        email = graphene.String(required=False) # L'email n'est pas requis si on ne veut pas le changer

    eligible_email = graphene.Field(EligibleEmailType) # Le champ 'eligible_email' retourné inclura son 'id'

    def mutate(root, info, id, email=None):
        try:
            eligible_email = EligibleEmail.objects.get(pk=id)
        except EligibleEmail.DoesNotExist:
            raise Exception("Email éligible introuvable.")

        if email is not None:
            # Vérifier les doublons si l'email est modifié (exclut l'objet actuel)
            if EligibleEmail.objects.filter(election=eligible_email.election, email=email).exclude(pk=id).exists():
                raise Exception("Un autre email similaire existe déjà pour cette élection.")
            eligible_email.email = email

        eligible_email.save()
        return UpdateEligibleEmail(eligible_email=eligible_email)

# Mutation pour supprimer un EligibleEmail
class DeleteEligibleEmail(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True) # ID requis pour identifier l'objet à supprimer

    # Indique si la suppression a réussi
    success = graphene.Boolean()
    # On pourrait aussi retourner l'ID de l'objet supprimé si utile
    # id = graphene.Int()

    def mutate(root, info, id):
        try:
            eligible_email = EligibleEmail.objects.get(pk=id)
            eligible_email_id = eligible_email.id # Capture l'ID avant la suppression si besoin
            eligible_email.delete()
            return DeleteEligibleEmail(success=True) #, id=eligible_email_id
        except EligibleEmail.DoesNotExist:
            raise Exception("Email éligible introuvable.")
        except Exception as e:
            # Gérer d'autres erreurs potentielles
            raise Exception(f"Erreur lors de la suppression : {e}")

# --- Intégration dans les classes Query et Mutation globales ---

# Votre classe Query principale (qui combine toutes les requêtes)
# Si vous avez déjà une classe Query existante, ajoutez les champs d'EligibleEmailQuery à celle-ci.
class Query(
    EligibleEmailQuery, # Inclut toutes les requêtes définies ci-dessus pour EligibleEmail
    graphene.ObjectType # Hérite aussi de graphene.ObjectType
):
    pass # Vos autres requêtes globales iraient ici

# Votre classe Mutation principale (qui combine toutes les mutations)
# Si vous avez déjà une classe Mutation existante, ajoutez les champs d'EligibleEmailMutation à celle-ci.
class Mutation(graphene.ObjectType):
    create_eligible_email = CreateEligibleEmail.Field()
    update_eligible_email = UpdateEligibleEmail.Field()
    delete_eligible_email = DeleteEligibleEmail.Field()
    # Vos autres mutations globales iraient ici (ex: create_custom_user, update_election, etc.)

# Définition du schéma global
schema = graphene.Schema(query=Query, mutation=Mutation)