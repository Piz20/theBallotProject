import graphene
from graphene_django.types import DjangoObjectType
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from graphql import GraphQLError
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserUpdateSerializer
from datetime import datetime

# Récupérer le modèle d'utilisateur
CustomUser = get_user_model()

# Type GraphQL pour l'utilisateur
class UserType(DjangoObjectType):
    class Meta:
        model = CustomUser
        fields = '__all__'  # Inclure tous les champs du modèle CustomUser

# Mutation pour l'enregistrement de l'utilisateur
class RegisterUser(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()
    user = graphene.Field(UserType)

    class Arguments:
        email = graphene.String()
        password = graphene.String()
        name = graphene.String()
        matricule = graphene.String()
        gender = graphene.String()
        date_of_birth = graphene.String()  # Nous recevons la date sous forme de string
        profile_picture = graphene.String()

    def mutate(self, info, email, password, name=None, matricule=None, gender=None, date_of_birth=None, profile_picture=None):
        # Conversion de la date de naissance en objet datetime.date si fourni
        if date_of_birth:
            try:
                # Convertir la date de naissance au format "YYYY-MM-DD"
                date_of_birth = datetime.strptime(date_of_birth, "%Y-%m-%d").date()
            except ValueError:
                raise GraphQLError("Invalid date format. Expected format: YYYY-MM-DD.")
        
        # Crée un nouvel utilisateur
        user = CustomUser(
            email=email,
            password=password,
            name=name,
            matricule=matricule,
            gender=gender,
            date_of_birth=date_of_birth,
            profile_picture=profile_picture
        )
        user.set_password(password)  # Ne pas oublier de crypter le mot de passe
        user.save()

        return RegisterUser(success=True, message="User registered successfully", user=user)

class LoginUser(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()
    token = graphene.String()

    class Arguments:
        email = graphene.String()  # Utilisation de l'email au lieu du nom d'utilisateur
        password = graphene.String()

    def mutate(self, info, email, password):
        # Authentifier l'utilisateur avec l'email
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise GraphQLError("User with this email does not exist.")
        
        # Vérifier le mot de passe
        if not user.check_password(password):
            raise GraphQLError("Incorrect password.")

        # Générer ou récupérer le token d'authentification
        token, created = Token.objects.get_or_create(user=user)
        
        return LoginUser(success=True, message="Login successful", token=token.key)

class LogoutUser(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        email = graphene.String(required=True)

    def mutate(self, info, email):
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return LogoutUser(success=False, message="User with this email does not exist.")

        try:
            token = Token.objects.get(user=user)
            token.delete()
            return LogoutUser(success=True, message="Logout successful.")
        except Token.DoesNotExist:
            return LogoutUser(success=False, message="User is not authenticated (no token found).")


# Mutation pour la mise à jour du profil de l'utilisateur
class UpdateUserProfile(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()
    user = graphene.Field(UserType)

    class Arguments:
        user_id = graphene.Int()
        name = graphene.String()
        matricule = graphene.String()
        gender = graphene.String()
        email = graphene.String()
        date_of_birth = graphene.String()  # Récupère la date en string
        profile_picture = graphene.String()

    def mutate(self, info, user_id, name=None, matricule=None, gender=None, email=None, date_of_birth=None, profile_picture=None):
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            raise GraphQLError("User not found")

        # Conversion de la date de naissance en objet datetime.date si fourni
        if date_of_birth:
            try:
                date_of_birth = datetime.strptime(date_of_birth, "%Y-%m-%d").date()
            except ValueError:
                raise GraphQLError("Invalid date format. Expected format: YYYY-MM-DD.")

        # Mise à jour des informations de l'utilisateur
        user.name = name if name is not None else user.name
        user.matricule = matricule if matricule is not None else user.matricule
        user.gender = gender if gender is not None else user.gender
        user.email = email if email is not None else user.email
        user.date_of_birth = date_of_birth if date_of_birth is not None else user.date_of_birth
        user.profile_picture = profile_picture if profile_picture is not None else user.profile_picture
        user.save()

        return UpdateUserProfile(success=True, message="Profile updated successfully", user=user)

class DeleteUserAccount(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        user_id = graphene.Int(required=True)  # Acceptation de l'ID de l'utilisateur

    def mutate(self, info, user_id):
        try:
            # Récupérer l'utilisateur par son ID
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            raise GraphQLError("User not found")
        
        # Supprimer l'utilisateur
        user.delete()

        return DeleteUserAccount(success=True, message="Account deleted successfully")


# Le schéma GraphQL
class Mutation(graphene.ObjectType):
    register_user = RegisterUser.Field()
    login_user = LoginUser.Field()
    logout_user = LogoutUser.Field()
    update_user_profile = UpdateUserProfile.Field()
    delete_user_account = DeleteUserAccount.Field()

# Requêtes GraphQL
class Query(graphene.ObjectType):
    user = graphene.Field(UserType, id=graphene.Int(required=True))
    all_users = graphene.List(UserType)

    def resolve_user(self, info, id):
        # Récupère un utilisateur en fonction de son ID
        try:
            return CustomUser.objects.get(id=id)
        except CustomUser.DoesNotExist:
            raise GraphQLError("User not found")

    def resolve_all_users(self, info):
        return CustomUser.objects.all()

# Définir le schéma principal
schema = graphene.Schema(query=Query, mutation=Mutation)
