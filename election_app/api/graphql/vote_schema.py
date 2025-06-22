import graphene
from graphene_django.types import DjangoObjectType
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from ...models import Candidate, Vote, Election, CustomUser # Assurez-vous d'importer votre modèle User
from .utils import check_authentication  # Fonction de vérification d'authentification

# Type GraphQL pour User (si ce n'est pas déjà défini ailleurs et importé)
class UserType(DjangoObjectType):
    class Meta:
        model = CustomUser # Remplacez User par le nom de votre modèle User si différent (ex: CustomUser)
        fields = ('id', 'name', 'email') # Ajustez les champs selon votre modèle User

# Type GraphQL pour Candidate (doit être disponible pour le champ 'candidate' dans VoteType)
class CandidateType(DjangoObjectType):
    class Meta:
        model = Candidate
        fields = ('id', 'name', 'vote_count') # Incluez les champs nécessaires pour le front-end

# Type GraphQL pour Election (doit être disponible pour le champ 'election' dans VoteType)
class ElectionType(DjangoObjectType):
    class Meta:
        model = Election
        fields = ('id', 'name') # Incluez les champs nécessaires

# Type GraphQL pour Vote
class VoteType(DjangoObjectType):
    class Meta:
        model = Vote
        fields = '__all__'

    # Assurez-vous que les champs liés (user, candidate, election) sont bien définis ici
    user = graphene.Field(UserType)
    candidate = graphene.Field(CandidateType)
    election = graphene.Field(ElectionType)


# Mutation GraphQL pour créer ou mettre à jour un vote
class CreateOrUpdateVote(graphene.Mutation):
    class Arguments:
        candidate_id = graphene.Int(required=True)
        election_id = graphene.Int(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    vote = graphene.Field(VoteType)

    def mutate(self, info, candidate_id, election_id):
        user = check_authentication(info)  # On récupère l'utilisateur authentifié

        candidate = get_object_or_404(Candidate, id=candidate_id)
        election = get_object_or_404(Election, id=election_id)

        # Vérifie que le candidat appartient bien à cette élection
        if candidate.election != election:
            raise ValidationError("Le candidat sélectionné ne fait pas partie de cette élection.")

        # Vérifie si l'utilisateur a déjà voté dans cette élection
        existing_vote = Vote.objects.filter(user=user, election=election).first()

        if existing_vote:
            if existing_vote.candidate != candidate:
                # Mise à jour du vote
                existing_vote.candidate.vote_count -= 1
                existing_vote.candidate.save()

                existing_vote.candidate = candidate
                existing_vote.save()

                candidate.vote_count += 1
                candidate.save()

                return CreateOrUpdateVote(success=True, message="Votre vote a été mis à jour avec succès.", vote=existing_vote)
            else:
                return CreateOrUpdateVote(success=True, message="Vous avez déjà voté pour ce candidat.", vote=existing_vote)

        # Création d'un nouveau vote
        new_vote = Vote.objects.create(user=user, candidate=candidate, election=election)
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
        user = check_authentication(info)

        vote = get_object_or_404(Vote, id=vote_id)

        if vote.user != user:
            raise ValidationError("Vous ne pouvez supprimer que votre propre vote.")

        vote.candidate.vote_count -= 1
        vote.candidate.save()

        vote.delete()

        return DeleteVote(success=True, message="Votre vote a été supprimé avec succès.")

# Déclaration des mutations
class Mutation(graphene.ObjectType):
    create_or_update_vote = CreateOrUpdateVote.Field()
    delete_vote = DeleteVote.Field()

# Requête GraphQL pour lire les votes
class Query(graphene.ObjectType):
    all_votes = graphene.List(VoteType)
    vote_by_id = graphene.Field(VoteType, id=graphene.Int(required=True))

    # --- Nouvelle Query pour GetUserVoteInElection ---
    user_vote_in_election = graphene.Field(
        VoteType,
        election_id=graphene.Int(required=True),
        description="Récupère le vote de l'utilisateur authentifié pour une élection donnée."
    )

    def resolve_all_votes(self, info):
        check_authentication(info)
        return Vote.objects.all()

    def resolve_vote_by_id(self, info, id):
        check_authentication(info)
        try:
            return Vote.objects.get(pk=id)
        except Vote.DoesNotExist:
            return None

    def resolve_user_vote_in_election(self, info, election_id):
        user = check_authentication(info) # Assurez-vous que l'utilisateur est authentifié
        
        try:
            election = Election.objects.get(id=election_id)
        except Election.DoesNotExist:
            return None # Ou raise une erreur si l'élection n'existe pas est une condition d'erreur

        # Retourne le premier vote trouvé par l'utilisateur pour cette élection
        return Vote.objects.filter(user=user, election=election).first()

# Schéma GraphQL principal
schema = graphene.Schema(query=Query, mutation=Mutation)