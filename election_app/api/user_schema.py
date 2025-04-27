import graphene
from graphene_django.types import DjangoObjectType
from django.contrib.auth import get_user_model
from graphql import GraphQLError
from datetime import datetime
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

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
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    def mutate(self, info, email, password):
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise GraphQLError("User with this email does not exist.")
        
        if not user.check_password(password):
            raise GraphQLError("Incorrect password.")
        
        if not user.is_active:
            raise GraphQLError("User account is inactive.")
        
        # Créer un token d'accès avec SimpleJWT
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)  # Token d'accès

        return LoginUser(success=True, message="Login successful", token=access_token)
# Mutation pour la déconnexion de l'utilisateur
class LogoutUser(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info):
        user = info.context.user  # Récupérer l'utilisateur authentifié via JWT

        # Vérifier si l'utilisateur est authentifié
        if not user.is_authenticated:
            raise GraphQLError("User is not authenticated.")
        
        # En réalité, il n'y a rien à faire ici pour la déconnexion avec JWT
        # Si tu veux juste une réponse indiquant que l'utilisateur est déconnecté :
        return LogoutUser(success=True, message="Logout successful.")

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

# Mutation pour supprimer le compte de l'utilisateur
class DeleteUserAccount(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        user_id = graphene.Int(required=True)

    def mutate(self, info, user_id):
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            raise GraphQLError("User not found")
        
        user.delete()

        return DeleteUserAccount(success=True, message="Account deleted successfully")

# Schéma GraphQL (Query + Mutation)
class Mutation(graphene.ObjectType):
    register_user = RegisterUser.Field()
    login_user = LoginUser.Field()
    logout_user = LogoutUser.Field()
    update_user_profile = UpdateUserProfile.Field()
    delete_user_account = DeleteUserAccount.Field()

# Query pour récupérer un utilisateur et tous les utilisateurs
class Query(graphene.ObjectType):
    user = graphene.Field(UserType, id=graphene.Int(required=True))
    all_users = graphene.List(UserType)

    def resolve_user(self, info, id):
        try:
            return CustomUser.objects.get(id=id)
        except CustomUser.DoesNotExist:
            raise GraphQLError("User not found")

    def resolve_all_users(self, info):
        return CustomUser.objects.all()

# Définir le schéma principal
schema = graphene.Schema(query=Query, mutation=Mutation)
