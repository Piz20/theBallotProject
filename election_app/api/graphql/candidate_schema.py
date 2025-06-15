import graphene
from graphene_django.types import DjangoObjectType
from ...models import Candidate, Election
from .utils import check_authentication
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils.text import slugify
import base64


class CandidateType(DjangoObjectType):
    class Meta:
        model = Candidate
        fields = '__all__'


class CreateCandidate(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String(required=True)
        electionId = graphene.Int(required=True)
        imageFile = graphene.String(required=False)
        imageUrl = graphene.String(required=False)

    success = graphene.Boolean()
    message = graphene.String()
    candidate = graphene.Field(CandidateType)

    def mutate(self, info, name, description, electionId, imageFile=None, imageUrl=None):
        user = check_authentication(info)
        if not user:
            return CreateCandidate(success=False, message="Authentification requise.")

        if Candidate.objects.filter(name=name).exists():
            return CreateCandidate(success=False, message="Le nom du candidat existe déjà.")

        if imageFile and imageUrl:
            return CreateCandidate(success=False, message="Ne fournissez pas imageFile et imageUrl en même temps.")

        try:
            election = Election.objects.get(id=electionId)
            candidate = Candidate(name=name, description=description, election=election)

            if imageFile:
                try:
                    format, imgstr = imageFile.split(';base64,')
                    ext = format.split('/')[-1]
                    image_data = ContentFile(base64.b64decode(imgstr), name=f"{slugify(name)}.{ext}")
                    image_path = default_storage.save(f"candidate_images/{image_data.name}", image_data)
                    candidate.image_file = image_path
                    candidate.image_url = None
                except Exception as e:
                    return CreateCandidate(success=False, message=f"Erreur upload image : {str(e)}")

            elif imageUrl:
                candidate.image_url = imageUrl
                candidate.image_file = None

            candidate.save()
            return CreateCandidate(success=True, message="Candidat créé avec succès", candidate=candidate)

        except Election.DoesNotExist:
            return CreateCandidate(success=False, message="Élection introuvable")


class UpdateCandidate(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)
        name = graphene.String()
        description = graphene.String()
        imageFile = graphene.String(required=False)
        imageUrl = graphene.String(required=False)

    success = graphene.Boolean()
    message = graphene.String()
    candidate = graphene.Field(CandidateType)

    def mutate(self, info, id, name=None, description=None, imageFile=None, imageUrl=None):
        user = check_authentication(info)
        if not user:
            return UpdateCandidate(success=False, message="Authentification requise.")

        try:
            candidate = Candidate.objects.get(id=id)
        except Candidate.DoesNotExist:
            return UpdateCandidate(success=False, message="Candidat introuvable.")

        if name and Candidate.objects.filter(name=name).exclude(id=id).exists():
            return UpdateCandidate(success=False, message="Nom déjà utilisé.")

        if name:
            candidate.name = name
        if description:
            candidate.description = description

        if imageFile and imageUrl:
            return UpdateCandidate(success=False, message="Ne fournissez pas imageFile et imageUrl en même temps.")

        if imageFile:
            try:
                format, imgstr = imageFile.split(';base64,')
                ext = format.split('/')[-1]
                image_data = ContentFile(base64.b64decode(imgstr), name=f"{slugify(candidate.name)}.{ext}")
                image_path = default_storage.save(f"candidate_images/{image_data.name}", image_data)
                candidate.image_file = image_path
                candidate.image_url = None
            except Exception as e:
                return UpdateCandidate(success=False, message=f"Erreur upload image : {str(e)}")

        elif imageUrl:
            candidate.image_url = imageUrl
            candidate.image_file = None

        candidate.save()
        return UpdateCandidate(success=True, message="Candidat mis à jour", candidate=candidate)


class DeleteCandidate(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, id):
        user = check_authentication(info)
        if not user:
            return DeleteCandidate(success=False, message="Authentification requise.")

        try:
            candidate = Candidate.objects.get(id=id)
            candidate.delete()
            return DeleteCandidate(success=True, message="Candidat supprimé.")
        except Candidate.DoesNotExist:
            return DeleteCandidate(success=False, message="Candidat introuvable.")


class Query(graphene.ObjectType):
    all_candidates = graphene.List(CandidateType)
    candidate = graphene.Field(CandidateType, id=graphene.Int(required=True))
    candidates_by_election = graphene.List(CandidateType, election_id=graphene.Int(required=True))  # 👈 ajouté

    def resolve_all_candidates(self, info):
        user = check_authentication(info)
        if not user:
            return None
        return Candidate.objects.all()

    def resolve_candidate(self, info, id):
        user = check_authentication(info)
        if not user:
            return None
        try:
            return Candidate.objects.get(id=id)
        except Candidate.DoesNotExist:
            return None

    def resolve_candidates_by_election(self, info, election_id):  # 👈 nouvelle méthode
        user = check_authentication(info)
        if not user:
            return None
        return Candidate.objects.filter(election__id=election_id)

class Mutation(graphene.ObjectType):
    create_candidate = CreateCandidate.Field()
    update_candidate = UpdateCandidate.Field()
    delete_candidate = DeleteCandidate.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
