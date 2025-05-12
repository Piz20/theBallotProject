import { ApolloClient, InMemoryCache } from '@apollo/client';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
// Import the createUploadLink function from the apollo-upload-client package
const uploadLink = createUploadLink({
  uri: 'http://localhost:8000/graphql/',
  credentials: 'include',
  headers: {
    'Apollo-Require-Preflight': 'true', // Add this line
  },
});

const client = new ApolloClient({
  link: uploadLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    mutate: {
      context: {
        hasUpload: true, // Add this line
      },
    },
  },
});

export default client;
