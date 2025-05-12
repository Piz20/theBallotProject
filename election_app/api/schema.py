import graphene

from election_app.api import election_schema, user_schema, vote_schema, candidate_schema , query_generator_schema , mail_schema,  image_schema

class Query(
    election_schema.Query,
    user_schema.Query,
    vote_schema.Query,
    candidate_schema.Query,
    query_generator_schema.Query,
    image_schema.Query,
    graphene.ObjectType,
):
    pass

class Mutation(
    election_schema.Mutation,
    user_schema.Mutation ,
    vote_schema.Mutation,
    candidate_schema.Mutation,
    mail_schema.Mutation, 
    image_schema.Mutation,   
    graphene.ObjectType,
):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)
