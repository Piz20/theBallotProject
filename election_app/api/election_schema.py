import graphene
from graphene_django.types import DjangoObjectType
from ..models import Election
from .utils import check_authentication  # Importer la fonction de vérification d'authentification

# Définir le type GraphQL pour Election
class ElectionType(DjangoObjectType):
    class Meta:
        model = Election
        fields = '__all__'  # Inclure tous les champs du modèle Election


# Mutation pour créer une élection
class CreateElection(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        start_date = graphene.DateTime(required=True)
        end_date = graphene.DateTime(required=True)
        description = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    election = graphene.Field(ElectionType)

    def mutate(self, info, name, start_date, end_date, description):
        user = check_authentication(info)  # Vérifier l'authentification
        if not user:
            return CreateElection(success=False, message="Authentification requise.")

        # Vérifier si une élection avec le même nom existe déjà
        if Election.objects.filter(name=name).exists():
            return CreateElection(success=False, message="Une élection avec ce nom existe déjà.")

        try:
            # Créer l'élection
            election = Election.objects.create(
                name=name,
                start_date=start_date,
                end_date=end_date,
                description=description
            )
            return CreateElection(success=True, message="Élection créée avec succès!", election=election)
        except Exception as e:
            return CreateElection(success=False, message=str(e))


# Mutation pour mettre à jour une élection
class UpdateElection(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)
        name = graphene.String()
        start_date = graphene.DateTime()
        end_date = graphene.DateTime()
        description = graphene.String()

    success = graphene.Boolean()
    message = graphene.String()
    election = graphene.Field(ElectionType)

    def mutate(self, info, id, name=None, start_date=None, end_date=None, description=None):
        user = check_authentication(info)  # Vérifier l'authentification
        if not user:
            return UpdateElection(success=False, message="Authentification requise.")

        try:
            # Récupérer l'élection existante
            election = Election.objects.get(id=id)

            # Vérifier si le nom a été changé et si ce nouveau nom existe déjà
            if name and name != election.name:
                if Election.objects.filter(name=name).exists():
                    return UpdateElection(success=False, message="Une élection avec ce nom existe déjà.")

            # Mettre à jour les champs si nécessaire
            if name:
                election.name = name
            if start_date:
                election.start_date = start_date
            if end_date:
                election.end_date = end_date
            if description:
                election.description = description

            election.save()
            return UpdateElection(success=True, message="Élection mise à jour avec succès!", election=election)

        except Election.DoesNotExist:
            return UpdateElection(success=False, message="L'élection n'a pas été trouvée.")
        except Exception as e:
            return UpdateElection(success=False, message=str(e))


# Mutation pour supprimer une élection
class DeleteElection(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, id):
        user = check_authentication(info)  # Vérifier l'authentification
        if not user:
            return DeleteElection(success=False, message="Authentification requise.")

        try:
            election = Election.objects.get(id=id)
            election.delete()
            return DeleteElection(success=True, message="Élection supprimée avec succès!")
        except Election.DoesNotExist:
            return DeleteElection(success=False, message="L'élection n'a pas été trouvée.")
        except Exception as e:
            return DeleteElection(success=False, message=str(e))


# Requête pour lister et obtenir une élection
class Query(graphene.ObjectType):
    all_elections = graphene.List(ElectionType)
    election = graphene.Field(ElectionType, id=graphene.Int())

    def resolve_all_elections(self, info):
        user = check_authentication(info)  # Vérifier l'authentification
        if not user:
            return None
        return Election.objects.all()

    def resolve_election(self, info, id):
        user = check_authentication(info)  # Vérifier l'authentification
        if not user:
            return None
        try:
            return Election.objects.get(id=id)
        except Election.DoesNotExist:
            return None


# Mutations groupées pour Election
class Mutation(graphene.ObjectType):
    create_election = CreateElection.Field()
    update_election = UpdateElection.Field()
    delete_election = DeleteElection.Field()


# Schéma final pour les mutations et requêtes d'élections
schema = graphene.Schema(query=Query, mutation=Mutation)
