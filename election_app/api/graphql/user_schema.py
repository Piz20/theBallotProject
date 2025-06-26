import graphene
from graphql import GraphQLError
from datetime import datetime, date
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from graphene_django.types import DjangoObjectType
from .utils import check_authentication

CustomUser = get_user_model()

class UserType(DjangoObjectType):
    # Alias camelCase pour certains champs si besoin
    date_of_birth = graphene.String(name="dateOfBirth")
    profile_picture = graphene.String(name="profilePicture")

    class Meta:
        model = CustomUser
        fields = '__all__'

    def resolve_date_of_birth(self, info):
        # Convertir date en string YYYY-MM-DD
        if self.date_of_birth:
            return self.date_of_birth.strftime("%Y-%m-%d")
        return None

    def resolve_profile_picture(self, info):
        return self.profile_picture


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
        date_of_birth = graphene.String(name="dateOfBirth")
        profile_picture = graphene.String(name="profilePicture")

    def mutate(self, info, email, password, name=None, matricule=None, gender=None, date_of_birth=None, profile_picture=None):
        check_authentication(info, must_be_authenticated=False)

        if CustomUser.objects.filter(email=email).exists():
            raise GraphQLError("Email: Email already in use.")

        parsed_birth_date = None
        if date_of_birth:
            try:
                parsed_birth_date = datetime.strptime(date_of_birth, "%Y-%m-%d").date()
            except ValueError:
                raise GraphQLError("Date of Birth: Invalid date format. Expected: YYYY-MM-DD.")

            today = date.today()
            age = today.year - parsed_birth_date.year - (
                (today.month, today.day) < (parsed_birth_date.month, parsed_birth_date.day)
            )
            if age < 18:
                raise GraphQLError("Date of Birth: User must be at least 18 years old.")
            if age > 200:
                raise GraphQLError("Date of Birth: Invalid age. Please enter a realistic date of birth.")

        user = CustomUser(
            email=email,
            name=name,
            matricule=matricule,
            gender=gender,
            date_of_birth=parsed_birth_date,
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
        remember_me = graphene.Boolean(required=False, default_value=False)

    def mutate(self, info, email, password, remember_me):
        check_authentication(info, must_be_authenticated=False)

        user = authenticate(username=email, password=password)
        if user is not None:
            login(info.context, user)
            if remember_me:
                info.context.session.set_expiry(1209600)  # 2 weeks
            else:
                info.context.session.set_expiry(86400)  # 1 day

            return LoginUser(
                success=True,
                message="Login successful",
                details=f"User {user.get_username()} with email {user.email} has logged in."
            )
        else:
            return LoginUser(success=False, message="Invalid credentials")


class LogoutUser(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()
    details = graphene.String()

    def mutate(self, info):
        user = check_authentication(info, must_be_authenticated=True)
        logout(info.context)
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
        date_of_birth = graphene.String(name="dateOfBirth")
        profile_picture = graphene.String(name="profilePicture")

    def mutate(self, info, name=None, matricule=None, gender=None, email=None, date_of_birth=None, profile_picture=None):
        user = info.context.user
        if user.is_anonymous:
            raise GraphQLError("Not logged in!")

        if date_of_birth:
            try:
                date_of_birth = datetime.strptime(date_of_birth, "%Y-%m-%d").date()
            except ValueError:
                raise GraphQLError("Invalid date format. Expected: YYYY-MM-DD.")

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
        user_id = graphene.Int(required=True, name="userId")

    def mutate(self, info, user_id):
        user = check_authentication(info, must_be_authenticated=True)
        if user.id != user_id:
            raise GraphQLError("You are not authorized to delete this account.")
        try:
            user_to_delete = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            raise GraphQLError("User not found.")
        user_to_delete.delete()
        return DeleteUserAccount(success=True, message="Account deleted successfully.")


class Query(graphene.ObjectType):
    user = graphene.Field(UserType, id=graphene.Int(required=True))
    all_users = graphene.List(UserType)
    me = graphene.Field(UserType)

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


class Mutation(graphene.ObjectType):
    register_user = RegisterUser.Field()
    login_user = LoginUser.Field()
    logout_user = LogoutUser.Field()
    update_user_profile = UpdateUserProfile.Field()
    delete_user_account = DeleteUserAccount.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
