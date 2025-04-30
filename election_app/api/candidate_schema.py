import graphene
from graphene_django.types import DjangoObjectType
from django.db import models
from ..models import Candidate, Election
from .utils import check_authentication  # Importer la fonction de vérification d'authentification

# Type GraphQL pour Candidate
class CandidateType(DjangoObjectType):
    class Meta:
        model = Candidate
        fields = '__all__'  # Inclure tous les champs du modèle Candidate


# Mutations GraphQL sécurisées
class CreateCandidate(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        bio = graphene.String(required=True)
        election_id = graphene.Int(required=True)
        profile_picture = graphene.String()  # URL de l'image ou base64

    success = graphene.Boolean()
    message = graphene.String()
    candidate = graphene.Field(CandidateType)

    def mutate(self, info, name, bio, election_id, profile_picture=None):
        user = check_authentication(info)  # Vérification de l'authentification
        if not user:
            return CreateCandidate(success=False, message="Authentification requise.")

        if Candidate.objects.filter(name=name).exists():
            return CreateCandidate(success=False, message="Le nom du candidat existe déjà.")

        try:
            election = Election.objects.get(id=election_id)
            candidate = Candidate(name=name, bio=bio, election=election)

            if profile_picture:
                candidate.profile_picture = profile_picture

            candidate.save()
            return CreateCandidate(success=True, message="Candidat créé avec succès", candidate=candidate)

        except Election.DoesNotExist:
            return CreateCandidate(success=False, message="L'élection spécifiée n'existe pas.")


class UpdateCandidate(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)
        name = graphene.String()
        bio = graphene.String()
        election_id = graphene.Int()
        profile_picture = graphene.String()
    
    success = graphene.Boolean()
    message = graphene.String()
    candidate = graphene.Field(CandidateType)
  
    def mutate(self, info, id, name=None, bio=None, election_id=None, profile_picture=None):
        user = check_authentication(info)  # Vérification de l'authentification
        if not user:
            return UpdateCandidate(success=False, message="Authentification requise.")

        try:
            candidate = Candidate.objects.get(id=id)
        except Candidate.DoesNotExist:
            return UpdateCandidate(success=False, message="Le candidat n'existe pas.")

        if name and Candidate.objects.filter(name=name).exclude(id=id).exists():
            return UpdateCandidate(success=False, message="Le nom du candidat existe déjà.")

        if name:
            candidate.name = name
        if bio:
            candidate.bio = bio
        if election_id:
            try:
                election = Election.objects.get(id=election_id)
                candidate.election = election
            except Election.DoesNotExist:
                return UpdateCandidate(success=False, message="L'élection spécifiée n'existe pas.")
        if profile_picture:
            candidate.profile_picture = profile_picture

        candidate.save()

        return UpdateCandidate(success=True, message="Candidat mis à jour avec succès", candidate=candidate)


class DeleteCandidate(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, id):
        user = check_authentication(info)  # Vérification de l'authentification
        if not user:
            return DeleteCandidate(success=False, message="Authentification requise.")

        try:
            candidate = Candidate.objects.get(id=id)
            candidate.delete()
            return DeleteCandidate(success=True, message="Candidat supprimé avec succès")
        except Candidate.DoesNotExist:
            return DeleteCandidate(success=False, message="Le candidat n'existe pas.")


# Requête GraphQL
class Query(graphene.ObjectType):
    all_candidates = graphene.List(CandidateType)
    candidate = graphene.Field(CandidateType, id=graphene.Int(required=True))

    def resolve_all_candidates(self, info):
        user = check_authentication(info)  # Vérification de l'authentification
        if not user:
            return None
        return Candidate.objects.all()

    def resolve_candidate(self, info, id):
        user = check_authentication(info)  # Vérification de l'authentification
        if not user:
            return None
        try:
            return Candidate.objects.get(pk=id)
        except Candidate.DoesNotExist:
            return None


# Schéma final
class Mutation(graphene.ObjectType):
    create_candidate = CreateCandidate.Field()
    update_candidate = UpdateCandidate.Field()
    delete_candidate = DeleteCandidate.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)
