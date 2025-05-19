import { gql } from '@apollo/client';

// Créer un message
export const CREATE_MESSAGE = gql`
  mutation CreateMessage($content: String!) {
    createMessage(content: $content) {
      message {
        id
        content
      }
    }
  }
`;

// Obtenir tous les messages
export const GET_ALL_MESSAGES = gql`
  query GetAllMessages {
    allMessages {
      id
      content
    }
  }
`;

// Obtenir un message par ID
export const GET_MESSAGE_BY_ID = gql`
  query GetMessage($id: Int!) {
    message(id: $id) {
      id
      content
    }
  }
`;

// Mettre à jour un message
export const UPDATE_MESSAGE = gql`
  mutation UpdateMessage($id: Int!, $content: String!) {
    updateMessage(id: $id, content: $content) {
      message {
        id
        content
      }
    }
  }
`;

// Supprimer un message
export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($id: Int!) {
    deleteMessage(id: $id) {
      success
    }
  }
`;