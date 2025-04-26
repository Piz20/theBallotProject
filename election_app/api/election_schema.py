import graphene
from graphene_django.types import DjangoObjectType
from ..models import Election, CustomUser  # Assurez-vous que le chemin est correct

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
        try:
            election = Election.objects.create(
                name=name,
                start_date=start_date,
                end_date=end_date,
                description=description
            )
            return CreateElection(success=True, message="Election created successfully!", election=election)
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
        try:
            election = Election.objects.get(id=id)

            if name:
                election.name = name
            if start_date:
                election.start_date = start_date
            if end_date:
                election.end_date = end_date
            if description:
                election.description = description

            election.save()
            return UpdateElection(success=True, message="Election updated successfully!", election=election)
        except Election.DoesNotExist:
            return UpdateElection(success=False, message="Election not found.")
        except Exception as e:
            return UpdateElection(success=False, message=str(e))

# Mutation pour supprimer une élection
class DeleteElection(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, id):
        try:
            election = Election.objects.get(id=id)
            election.delete()
            return DeleteElection(success=True, message="Election deleted successfully!")
        except Election.DoesNotExist:
            return DeleteElection(success=False, message="Election not found.")
        except Exception as e:
            return DeleteElection(success=False, message=str(e))

# Requête pour lister et obtenir une élection
class ElectionQuery(graphene.ObjectType):
    elections = graphene.List(ElectionType)
    election = graphene.Field(ElectionType, id=graphene.Int())

    def resolve_elections(self, info):
        return Election.objects.all()

    def resolve_election(self, info, id):
        try:
            return Election.objects.get(id=id)
        except Election.DoesNotExist:
            return None

# Mutations groupées pour Election
class ElectionMutation(graphene.ObjectType):
    create_election = CreateElection.Field()
    update_election = UpdateElection.Field()
    delete_election = DeleteElection.Field()

# Schéma spécifique aux élections
schema = graphene.Schema(query=ElectionQuery, mutation=ElectionMutation)
