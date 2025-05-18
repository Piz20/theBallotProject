import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';

const uploadLink = createUploadLink({
  uri: 'http://localhost:8000/graphql/',
  credentials: 'include',
  headers: {
    'Apollo-Require-Preflight': 'true',
  },
});

// Logger Apollo Link pour afficher les requêtes et variables
const loggerLink = new ApolloLink((operation, forward) => {
  console.log('GraphQL Request:', {
    query: operation.query.loc?.source.body,  // la requête GraphQL en string
    variables: operation.variables,           // les variables envoyées
  });
  return forward(operation);
});

// Compose les links : loggerLink puis uploadLink
const link = ApolloLink.from([loggerLink, uploadLink]);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  defaultOptions: {
    mutate: {
      context: {
        hasUpload: true,
      },
    },
  },
});

export default client;
