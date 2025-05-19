import graphene
from graphene_django import DjangoObjectType
from ...models import Message

# Type GraphQL basé sur le modèle Django
class MessageType(DjangoObjectType):
    class Meta:
        model = Message
        fields = ("id", "content")

# Query pour lister ou récupérer un message
class Query(graphene.ObjectType):
    all_messages = graphene.List(MessageType)
    message = graphene.Field(MessageType, id=graphene.Int(required=True))

    def resolve_all_messages(root, info):
        return Message.objects.all()

    def resolve_message(root, info, id):
        try:
            return Message.objects.get(pk=id)
        except Message.DoesNotExist:
            return None

# Mutation pour créer un message
class CreateMessage(graphene.Mutation):
    class Arguments:
        content = graphene.String(required=True)

    message = graphene.Field(MessageType)

    def mutate(root, info, content):
        msg = Message.objects.create(content=content)
        return CreateMessage(message=msg)

# Root des mutations
class Mutation(graphene.ObjectType):
    create_message = CreateMessage.Field()

# Schéma GraphQL final
schema = graphene.Schema(query=Query, mutation=Mutation)
