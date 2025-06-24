import graphene
from graphene_django.types import DjangoObjectType
from ...models import Election, CustomUser, Candidate, EligibleEmail
from .utils import check_authentication
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils.text import slugify
import base64


class ElectionType(DjangoObjectType):
    eligible_emails = graphene.List(graphene.String, name='eligibleEmails')
    image_file = graphene.String(name="imageFile")
    image_url = graphene.String(name="imageUrl")
    start_date = graphene.DateTime(name="startDate")
    end_date = graphene.DateTime(name="endDate")
    created_at = graphene.DateTime(name="createdAt")
    updated_at = graphene.DateTime(name="updatedAt")

    class Meta:
        model = Election
        fields = '__all__'

    def resolve_eligible_emails(self, info):
        if self.eligible_emails.exists():
            return list(self.eligible_emails.values_list('email', flat=True))
        return []

    def resolve_image_file(self, info):
        return self.image_file

    def resolve_image_url(self, info):
        return self.image_url

    def resolve_start_date(self, info):
        return self.start_date

    def resolve_end_date(self, info):
        return self.end_date

    def resolve_created_at(self, info):
        return self.created_at

    def resolve_updated_at(self, info):
        return self.updated_at


class UpdateElection(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)
        name = graphene.String()
        description = graphene.String()
        start_date = graphene.DateTime(name="startDate")
        end_date = graphene.DateTime(name="endDate")
        status = graphene.String()
        image_file = graphene.String(name="imageFile")
        image_url = graphene.String(name="imageUrl")
        eligible_emails = graphene.List(graphene.String, name="eligibleEmails")

    success = graphene.Boolean()
    message = graphene.String()
    election = graphene.Field(ElectionType)

    def mutate(
        self, info, id, name=None, description=None, start_date=None, end_date=None,
        status=None, image_file=None, image_url=None, eligible_emails=None
    ):
        user = check_authentication(info)
        if not user:
            return UpdateElection(success=False, message="Authentification requise.")

        try:
            election = Election.objects.get(id=id)

            if name and name != election.name:
                if Election.objects.filter(name=name).exclude(id=id).exists():
                    return UpdateElection(success=False, message="Une autre élection porte déjà ce nom.")
                election.name = name

            if description is not None:
                election.description = description
            if start_date is not None:
                election.start_date = start_date
            if end_date is not None:
                election.end_date = end_date
            if status is not None:
                election.status = status

            if image_url and image_file:
                return UpdateElection(success=False, message="Vous ne pouvez pas soumettre à la fois une URL d'image et un fichier image.")

            if image_file:
                try:
                    format, imgstr = image_file.split(';base64,')
                    ext = format.split('/')[-1]
                    image_data = ContentFile(base64.b64decode(imgstr), name=f"{slugify(election.name)}.{ext}")
                    image_path = default_storage.save(f"election_images/{image_data.name}", image_data)
                    election.image_file = image_path
                    election.image_url = None
                except Exception as e:
                    return UpdateElection(success=False, message=f"Erreur lors de l'upload de l'image : {str(e)}")
            elif image_url:
                election.image_url = image_url
                election.image_file = None

            if eligible_emails is not None:
                election.eligible_emails.all().delete()
                new_emails = [EligibleEmail(election=election, email=email) for email in set(eligible_emails)]
                EligibleEmail.objects.bulk_create(new_emails)

            election.save()

            return UpdateElection(success=True, message="Élection mise à jour avec succès!", election=election)

        except Election.DoesNotExist:
            return UpdateElection(success=False, message="L'élection n'a pas été trouvée.")
        except Exception as e:
            return UpdateElection(success=False, message=str(e))


class CreateElection(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String(required=True)
        start_date = graphene.DateTime(name="startDate", required=False)
        end_date = graphene.DateTime(name="endDate", required=False)
        image_url = graphene.String(name="imageUrl", required=False)
        image_file = graphene.String(name="imageFile", required=False)
        eligible_emails = graphene.List(graphene.String, name="eligibleEmails")

    success = graphene.Boolean()
    message = graphene.String()
    election = graphene.Field(ElectionType)

    def mutate(self, info, name, description, start_date=None, end_date=None, image_url=None, image_file=None, eligible_emails=None):
        user = check_authentication(info)
        if not user:
            return CreateElection(success=False, message="Authentification requise.")

        if Election.objects.filter(name=name).exists():
            return CreateElection(success=False, message="Une élection avec ce nom existe déjà.")

        if image_url and image_file:
            return CreateElection(success=False, message="Vous ne pouvez pas soumettre à la fois une URL d'image et un fichier image.")

        image_path = None

        if image_file:
            try:
                format, imgstr = image_file.split(';base64,')
                ext = format.split('/')[-1]
                image_data = ContentFile(base64.b64decode(imgstr), name=f"{slugify(name)}.{ext}")
                image_path = default_storage.save(f"election_images/{image_data.name}", image_data)
            except Exception as e:
                return CreateElection(success=False, message=f"Erreur lors de l'upload de l'image : {str(e)}")

        if not image_url and not image_file:
            return CreateElection(success=False, message="Vous devez fournir une URL ou un fichier image.")

        try:
            election = Election.objects.create(
                name=name,
                start_date=start_date,
                end_date=end_date,
                description=description,
                image_url=image_url if image_url else None,
                image_file=image_path if image_file else None,
                created_by=user
            )

            if eligible_emails:
                new_emails = [EligibleEmail(election=election, email=email) for email in set(eligible_emails)]
                EligibleEmail.objects.bulk_create(new_emails)

            return CreateElection(success=True, message="Élection créée avec succès!", election=election)
        except Exception as e:
            return CreateElection(success=False, message=f"Erreur lors de la création de l'élection : {str(e)}")


class DeleteElection(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, id):
        user = check_authentication(info)
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


class Query(graphene.ObjectType):
    all_elections = graphene.List(ElectionType)
    election = graphene.Field(ElectionType, id=graphene.Int(required=True))

    def resolve_all_elections(self, info):
        user = check_authentication(info)
        if not user:
            return None
        return Election.objects.all()

    def resolve_election(self, info, id):
        user = check_authentication(info)
        if not user:
            return None
        try:
            return Election.objects.get(id=id)
        except Election.DoesNotExist:
            return None


class Mutation(graphene.ObjectType):
    create_election = CreateElection.Field()
    update_election = UpdateElection.Field()
    delete_election = DeleteElection.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
