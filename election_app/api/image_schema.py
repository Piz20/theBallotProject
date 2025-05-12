import graphene
from graphene_django.types import DjangoObjectType
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
import base64
from io import BytesIO
from ..models import ImageTest
from .utils import check_authentication  # Importer la fonction de vérification d'authentification

class ImageTestType(DjangoObjectType):
    class Meta:
        model = ImageTest
        fields = ('id', 'image')

class Query(graphene.ObjectType):
    all_images = graphene.List(ImageTestType)

    def resolve_all_images(self, info):
        check_authentication(info, must_be_authenticated=True)  # Vérification de l'authentification
        return ImageTest.objects.all()

    image_by_id = graphene.Field(ImageTestType, id=graphene.Int(required=True))

    def resolve_image_by_id(self, info, id):
        check_authentication(info, must_be_authenticated=True)  # Vérification de l'authentification
        try:
            return ImageTest.objects.get(id=id)
        except ImageTest.DoesNotExist:
            raise ValidationError("Image not found.")

class UploadImage(graphene.Mutation):
    class Arguments:
        image = graphene.String(required=True)  # Le fichier image sera téléchargé sous forme de base64

    image = graphene.Field(ImageTestType)

    def mutate(self, info, image):
        user = check_authentication(info, must_be_authenticated=True)  # Vérification de l'authentification
        
        # Convertir l'image base64 en fichier
        try:
            format, imgstr = image.split(';base64,')  # Récupérer la partie après ";base64,"
            ext = format.split('/')[-1]  # Récupérer l'extension de l'image (ex. 'png', 'jpeg')
            image_data = ContentFile(base64.b64decode(imgstr), name=f"uploaded_image.{ext}")
            
            # Créer une instance de ImageTest pour sauvegarder l'image dans la base de données
            image_instance = ImageTest.objects.create(image=image_data)
            return UploadImage(image=image_instance)
        
        except Exception as e:
            raise ValidationError(f"Image upload failed: {str(e)}")

class Mutation(graphene.ObjectType):
    upload_image = UploadImage.Field()

# Assurez-vous d'ajouter cette mutation à votre schéma principal
schema = graphene.Schema(query=Query, mutation=Mutation)
