import graphene
from graphene_django.types import DjangoObjectType
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from ..models import Candidate, Vote, Election


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

                return CreateOrUpdateVote(success=True, message="Your vote has been updated successfully.", vote=existing_vote)
            else:
                return CreateOrUpdateVote(success=True, message="You have already voted for this candidate.", vote=existing_vote)

        # Si l'utilisateur n'a pas encore voté, créer un nouveau vote
        new_vote = Vote.objects.create(user=info.context.user, candidate=candidate, election=election)
        candidate.vote_count += 1
        candidate.save()

        return CreateOrUpdateVote(success=True, message="Your vote has been recorded successfully.", vote=new_vote)


# Mutation GraphQL pour supprimer un vote
class DeleteVote(graphene.Mutation):
    class Arguments:
        vote_id = graphene.Int(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, vote_id):
        vote = get_object_or_404(Vote, id=vote_id)

        # Vérifier si le vote appartient à l'utilisateur authentifié
        if vote.user != info.context.user:
            raise ValidationError("You can only delete your own vote.")

        # Mettre à jour le nombre de votes du candidat
        vote.candidate.vote_count -= 1
        vote.candidate.save()

        # Supprimer le vote
        vote.delete()

        return DeleteVote(success=True, message="Your vote has been successfully deleted.")


# Schéma GraphQL
class Mutation(graphene.ObjectType):
    create_or_update_vote = CreateOrUpdateVote.Field()  # Cette ligne est essentielle
    delete_vote = DeleteVote.Field()

class Query(graphene.ObjectType):
    all_votes = graphene.List(VoteType)  # Nom plus clair et standard
    vote_by_id = graphene.Field(VoteType, id=graphene.Int(required=True))

    def resolve_all_votes(self, info):
        return Vote.objects.all()

    def resolve_vote_by_id(self, info, id):
        try:
            return Vote.objects.get(pk=id)
        except Vote.DoesNotExist:
            return None  # O


schema = graphene.Schema(query=Query, mutation=Mutation)
