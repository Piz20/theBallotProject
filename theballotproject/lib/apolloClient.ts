import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';

// Fonction récursive pour détecter le type des variables
function detectType(value: any): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'array (empty)';
    return `array of ${detectType(value[0])}`;
  }
  if (value instanceof Date) return 'date';
  if (typeof value === 'object') return 'object';
  return typeof value;
}

const uploadLink = createUploadLink({
  uri: 'http://localhost:8000/graphql/',
  credentials: 'include',
  headers: {
    'Apollo-Require-Preflight': 'true',
  },
});

const loggerLink = new ApolloLink((operation, forward) => {
  console.log('GraphQL Request:', {
    query: operation.query.loc?.source.body,
    variables: operation.variables,
  });

  if (operation.variables && typeof operation.variables === 'object') {
    console.log('Types des variables :');
    Object.entries(operation.variables).forEach(([key, value]) => {
      console.log(`- ${key}: ${detectType(value)}`);
    });
  } else {
    console.log('Aucune variable ou format inattendu.');
  }

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
