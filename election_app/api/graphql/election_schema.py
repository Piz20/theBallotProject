import graphene
from graphene_django.types import DjangoObjectType
from ...models import Election
from .utils import check_authentication  # Importer la fonction de vérification d'authentification
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.core.validators import MaxLengthValidator, URLValidator
from django.core.exceptions import ValidationError
from django.utils.timezone import now
from django.utils.text import slugify
from graphene_file_upload.scalars import Upload
import base64

# Définir le type GraphQL pour Election
class ElectionType(DjangoObjectType):
    class Meta:
        model = Election
        fields = '__all__'  # Inclure tous les champs du modèle Election




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



# Mutation pour créer une élection
class CreateElection(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String(required=True)
        start_date = graphene.DateTime(required=False)
        end_date = graphene.DateTime(required=False)
        image_url = graphene.String(required=False)  # URL de l'image
        image_file = graphene.String(required=False)  # Image en base64 (au lieu de Upload)

    success = graphene.Boolean()
    message = graphene.String()
    election = graphene.Field(ElectionType)  # Type GraphQL pour retourner l'élection

    def mutate(self, info, name, description, start_date=None, end_date=None, image_url=None, image_file=None):
        # Vérifier l'authentification de l'utilisateur
        user = check_authentication(info)
        if not user:
            return CreateElection(success=False, message="Authentification requise.")
        
        # Vérifier si une élection avec ce nom existe déjà
        if Election.objects.filter(name=name).exists():
            return CreateElection(success=False, message="Une élection avec ce nom existe déjà.")

        # Vérifier que l'utilisateur soumet soit image_url soit image_file, mais pas les deux
        if image_url and image_file:
            return CreateElection(success=False, message="Vous ne pouvez pas soumettre à la fois une URL d'image et un fichier image.")
        
        # Variable pour stocker le chemin de l'image
        image_path = None

        # Si un fichier image en base64 est fourni, gérer l'upload
        if image_file:
            try:
                # Décoder l'image base64
                format, imgstr = image_file.split(';base64,')  # Récupérer la partie après ";base64,"
                ext = format.split('/')[-1]  # Récupérer l'extension de l'image (ex. 'png', 'jpeg')
                image_data = ContentFile(base64.b64decode(imgstr), name=f"{slugify(name)}.{ext}")
                
                # Sauvegarder l'image sur le serveur avec un nom unique basé sur le nom de l'élection
                image_path = default_storage.save(f"election_images/{image_data.name}", image_data)
            except Exception as e:
                return CreateElection(success=False, message=f"Erreur lors de l'upload de l'image : {str(e)}")
        
        # Si un image_url est fourni, il sera utilisé tel quel
        if not image_url and not image_file:
            return CreateElection(success=False, message="Vous devez fournir une URL ou un fichier image.")

        try:
            # Créer l'élection avec les informations fournies
            election = Election.objects.create(
                name=name,
                start_date=start_date,
                end_date=end_date,
                description=description,
                image_url=image_url if image_url else None,  # Utilise image_url s'il est fourni
                image_file=image_path if image_file else None,  # Utilise image_file s'il est téléchargé
                created_by=user  # Assigner l'utilisateur authentifié à created_by
            )
            return CreateElection(success=True, message="Élection créée avec succès!", election=election)
        except Exception as e:
            return CreateElection(success=False, message=f"Erreur lors de la création de l'élection : {str(e)}")


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
    election = graphene.Field(ElectionType, id=graphene.Int(required=True))

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
