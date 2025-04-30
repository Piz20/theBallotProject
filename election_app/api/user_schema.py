import graphene
from graphql import GraphQLError
from datetime import datetime
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from graphene_django.types import DjangoObjectType
from .utils import check_authentication  # Importer la fonction de vérification d'authentification

# Récupérer le modèle d'utilisateur
CustomUser = get_user_model()

# Type GraphQL pour l'utilisateur
class UserType(DjangoObjectType):
    class Meta:
        model = CustomUser
        fields = '__all__'

# Mutation pour l'enregistrement de l'utilisateur
class RegisterUser(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()
    user = graphene.Field(UserType)

    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)
        name = graphene.String()
        matricule = graphene.String()
        gender = graphene.String()
        date_of_birth = graphene.String()  # format string "YYYY-MM-DD"
        profile_picture = graphene.String()

    def mutate(self, info, email, password, name=None, matricule=None, gender=None, date_of_birth=None, profile_picture=None):
        # Vérifier si l'utilisateur est déjà connecté
        check_authentication(info, must_be_authenticated=False)
        
        if date_of_birth:
            try:
                date_of_birth = datetime.strptime(date_of_birth, "%Y-%m-%d").date()
            except ValueError:
                raise GraphQLError("Invalid date format. Expected: YYYY-MM-DD.")

        if CustomUser.objects.filter(email=email).exists():
            raise GraphQLError("Email already in use.")

        user = CustomUser(
            email=email,
            name=name,
            matricule=matricule,
            gender=gender,
            date_of_birth=date_of_birth,
            profile_picture=profile_picture
        )
        user.set_password(password)
        user.save()

        return RegisterUser(success=True, message="User registered successfully", user=user)

class LoginUser(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()
    details = graphene.String()

    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    def mutate(self, info, email, password):
        # Vérifier si l'utilisateur est déjà connecté
        check_authentication(info, must_be_authenticated=False)

        # Essayer d'authentifier l'utilisateur
        user = authenticate(username=email, password=password)

        if user is not None:
            login(info.context, user)  # Cela crée une session pour l'utilisateur

            return LoginUser(success=True, message="Login successful", details=f"User {user.name} with email {user.email} has logged in.")
        else:
            return LoginUser(success=False, message="Invalid credentials")

# Mutation pour la déconnexion de l'utilisateur
class LogoutUser(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()
    details = graphene.String()
    
    def mutate(self, info):
        # Vérification de l'authentification
        user = check_authentication(info, must_be_authenticated=True)
        
        # Déconnecter l'utilisateur
        logout(info.context)  # Cela supprime la session de l'utilisateur
        
        return LogoutUser(success=True, message="Logout successful.", details=f"User {user.name} with ID {user.id} has logged out.")

class UpdateUserProfile(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()
    user = graphene.Field(UserType)

    class Arguments:
        name = graphene.String()
        matricule = graphene.String()
        gender = graphene.String()
        email = graphene.String()
        date_of_birth = graphene.String()
        profile_picture = graphene.String()

    def mutate(self, info, name=None, matricule=None, gender=None, email=None, date_of_birth=None, profile_picture=None):
        # Récupérer l'utilisateur actuel depuis le contexte
        user = info.context.user
        
        if user.is_anonymous:
            raise GraphQLError("Not logged in!")
        
        # Si une date de naissance est spécifiée, convertir le format
        if date_of_birth:
            try:
                date_of_birth = datetime.strptime(date_of_birth, "%Y-%m-%d").date()
            except ValueError:
                raise GraphQLError("Invalid date format. Expected: YYYY-MM-DD.")
        
        # Mettre à jour les champs de l'utilisateur
        user.name = name if name is not None else user.name
        user.matricule = matricule if matricule is not None else user.matricule
        user.gender = gender if gender is not None else user.gender
        user.email = email if email is not None else user.email
        user.date_of_birth = date_of_birth if date_of_birth is not None else user.date_of_birth
        user.profile_picture = profile_picture if profile_picture is not None else user.profile_picture
        user.save()

        return UpdateUserProfile(success=True, message="Profile updated successfully", user=user)


# Mutation pour la suppression du compte utilisateur
class DeleteUserAccount(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        user_id = graphene.Int(required=True)

    def mutate(self, info, user_id):
        # Vérification de l'authentification
        user = check_authentication(info, must_be_authenticated=True)
        
        # Vérification que l'utilisateur a les droits pour supprimer ce compte
        if user.id != user_id:
            raise GraphQLError("You are not authorized to delete this account.")
        
        try:
            user_to_delete = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            raise GraphQLError("User not found.")
        
        user_to_delete.delete()

        return DeleteUserAccount(success=True, message="Account deleted successfully.")

# Définir les Mutations globales
class Mutation(graphene.ObjectType):
    register_user = RegisterUser.Field()
    login_user = LoginUser.Field()
    logout_user = LogoutUser.Field()
    update_user_profile = UpdateUserProfile.Field()
    delete_user_account = DeleteUserAccount.Field()

# Définir les Queries globales
class Query(graphene.ObjectType):
    user = graphene.Field(UserType, id=graphene.Int(required=True))
    all_users = graphene.List(UserType)
    me = graphene.Field(UserType)  # Ajouter cette ligne pour la query `me`

    def resolve_user(self, info, id):
        try:
            return CustomUser.objects.get(id=id)
        except CustomUser.DoesNotExist:
            raise GraphQLError("User not found.")

    def resolve_all_users(self, info):
        return CustomUser.objects.all()
    
    def resolve_me(self, info):
        user = info.context.user
        if user.is_anonymous:
            raise GraphQLError("Not logged in!")
        return user

# Définir le schéma principal
schema = graphene.Schema(query=Query, mutation=Mutation)
