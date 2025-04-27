import graphene

from election_app.api import election_schema, user_schema, vote_schema, candidate_schema

class Query(
    election_schema.Query,
    user_schema.Query,
    vote_schema.Query,
    candidate_schema.Query,
    graphene.ObjectType,
):
    pass

class Mutation(
    election_schema.Mutation,
    user_schema.Mutation,
    vote_schema.Mutation,
    candidate_schema.Mutation,
    graphene.ObjectType,
):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)
