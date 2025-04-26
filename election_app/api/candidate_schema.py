import graphene
from graphene_django.types import DjangoObjectType
from django.db import models
from ..models import Candidate, Election

# Type GraphQL pour Candidate
class CandidateType(DjangoObjectType):
    class Meta:
        model = Candidate
        fields = '__all__'  # Inclure tous les champs du modèle Candidate

class Query(graphene.ObjectType):
    all_candidates = graphene.List(CandidateType)
    candidate = graphene.Field(CandidateType, id=graphene.Int(required=True))

    def resolve_all_candidates(self, info):
        return Candidate.objects.all()

    def resolve_candidate(self, info, id):
        try:
            return Candidate.objects.get(pk=id)
        except Candidate.DoesNotExist:
            return None

# Mutations GraphQL
class CreateCandidate(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        bio = graphene.String(required=True)
        election_id = graphene.Int(required=True)
        profile_picture = graphene.String()  # URL de l'image, ou fichier en base64 pour gérer le téléchargement d'images

    success = graphene.Boolean()
    message = graphene.String()
    candidate = graphene.Field(CandidateType)

    def mutate(self, info, name, bio, election_id, profile_picture=None):
        # Récupérer l'élection par son ID
        election = Election.objects.get(id=election_id)

        # Créer un nouveau candidat
        candidate = Candidate(name=name, bio=bio, election=election)
        
        if profile_picture:
            # Gérer le profil image, ici il faut traiter l'image, par exemple télécharger l'image si en base64
            # Tu peux envisager de stocker directement l'URL ou utiliser un service de stockage d'images
            candidate.profile_picture = profile_picture

        candidate.save()
        return CreateCandidate(success=True, message="Candidate created successfully", candidate=candidate)


class UpdateCandidate(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)
        name = graphene.String()
        bio = graphene.String()
        election_id = graphene.Int()
        profile_picture = graphene.String()  # URL ou base64

    success = graphene.Boolean()
    message = graphene.String()
    candidate = graphene.Field(CandidateType)

    def mutate(self, info, id, name=None, bio=None, election_id=None, profile_picture=None):
        # Récupérer le candidat existant
        candidate = Candidate.objects.get(id=id)

        if name:
            candidate.name = name
        if bio:
            candidate.bio = bio
        if election_id:
            election = Election.objects.get(id=election_id)
            candidate.election = election
        if profile_picture:
            candidate.profile_picture = profile_picture

        candidate.save()
        return UpdateCandidate(success=True, message="Candidate updated successfully", candidate=candidate)


class DeleteCandidate(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, id):
        # Supprimer le candidat
        candidate = Candidate.objects.get(id=id)
        candidate.delete()
        return DeleteCandidate(success=True, message="Candidate deleted successfully")


# Schéma GraphQL
class Mutation(graphene.ObjectType):
    create_candidate = CreateCandidate.Field()
    update_candidate = UpdateCandidate.Field()
    delete_candidate = DeleteCandidate.Field()



schema = graphene.Schema(query=Query, mutation=Mutation)
