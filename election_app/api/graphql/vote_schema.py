import graphene
from graphene_django.types import DjangoObjectType
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from ...models import Candidate, Vote, Election
from .utils import check_authentication  # Importer la fonction de vérification d'authentification

# Type GraphQL pour Vote
class VoteType(DjangoObjectType):
    class Meta:
        model = Vote
        fields = '__all__'  # Inclure tous les champs du modèle Vote

# Mutation GraphQL pour créer un vote ou le mettre à jour
class CreateOrUpdateVote(graphene.Mutation):
    class Arguments:
        candidate_id = graphene.Int(required=True)
        election_id = graphene.Int(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    vote = graphene.Field(VoteType)

    def mutate(self, info, candidate_id, election_id):
        check_authentication(info.context.user)  # Vérification d'authentification

        candidate = get_object_or_404(Candidate, id=candidate_id)
        election = get_object_or_404(Election, id=election_id)

        # Vérifier si le candidat appartient à l'élection
        if candidate.election != election:
            raise ValidationError("Le candidat sélectionné ne fait pas partie de cette élection.")

        # Vérifier si l'utilisateur a déjà voté dans cette élection
        existing_vote = Vote.objects.filter(user=info.context.user, election=election).first()

        if existing_vote:
            if existing_vote.candidate != candidate:
                # Mettre à jour le vote en changeant de candidat
                existing_vote.candidate.vote_count -= 1
                existing_vote.candidate.save()

                existing_vote.candidate = candidate
                existing_vote.save()

                candidate.vote_count += 1
                candidate.save()

                return CreateOrUpdateVote(success=True, message="Votre vote a été mis à jour avec succès.", vote=existing_vote)
            else:
                return CreateOrUpdateVote(success=True, message="Vous avez déjà voté pour ce candidat.", vote=existing_vote)

        # Si l'utilisateur n'a pas encore voté, créer un nouveau vote
        new_vote = Vote.objects.create(user=info.context.user, candidate=candidate, election=election)
        candidate.vote_count += 1
        candidate.save()

        return CreateOrUpdateVote(success=True, message="Votre vote a été enregistré avec succès.", vote=new_vote)

# Mutation GraphQL pour supprimer un vote
class DeleteVote(graphene.Mutation):
    class Arguments:
        vote_id = graphene.Int(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, vote_id):
        check_authentication(info.context.user)  # Vérification d'authentification

        vote = get_object_or_404(Vote, id=vote_id)

        # Vérifier si le vote appartient à l'utilisateur authentifié
        if vote.user != info.context.user:
            raise ValidationError("Vous ne pouvez supprimer que votre propre vote.")

        # Mettre à jour le nombre de votes du candidat
        vote.candidate.vote_count -= 1
        vote.candidate.save()

        # Supprimer le vote
        vote.delete()

        return DeleteVote(success=True, message="Votre vote a été supprimé avec succès.")

# Schéma GraphQL
class Mutation(graphene.ObjectType):
    create_or_update_vote = CreateOrUpdateVote.Field()
    delete_vote = DeleteVote.Field()

class Query(graphene.ObjectType):
    all_votes = graphene.List(VoteType)
    vote_by_id = graphene.Field(VoteType, id=graphene.Int(required=True))

    def resolve_all_votes(self, info):
        check_authentication(info.context.user)  # Vérification d'authentification
        return Vote.objects.all()

    def resolve_vote_by_id(self, info, id):
        check_authentication(info.context.user)  # Vérification d'authentification
        try:
            return Vote.objects.get(pk=id)
        except Vote.DoesNotExist:
            return None

schema = graphene.Schema(query=Query, mutation=Mutation)
