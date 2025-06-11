import { gql } from '@apollo/client';

export const GET_ALL_ELIGIBLE_EMAILS = gql`
  query GetAllEligibleEmails {
    allEligibleEmails {
      id
      email
      election {
        id
        name
      }
    }
  }
`;

export const GET_ELIGIBLE_EMAIL_BY_ID = gql`
  query GetEligibleEmailById($id: Int!) {
    eligibleEmailById(id: $id) {
      id
      email
      election {
        id
        name
      }
    }
  }
`;

export const GET_ELIGIBLE_EMAILS_BY_ELECTION = gql`
  query GetEligibleEmailsByElection($electionId: Int!) {
    eligibleEmailsByElection(electionId: $electionId) {
      id
      email
      election {
        id
        name
      }
    }
  }
`;

export const CREATE_ELIGIBLE_EMAIL = gql`
  mutation CreateEligibleEmail($electionId: Int!, $email: String!) {
    createEligibleEmail(electionId: $electionId, email: $email) {
      eligibleEmail {
        id
        email
        election {
          id
          name
        }
      }
    }
  }
`;

export const UPDATE_ELIGIBLE_EMAIL = gql`
  mutation UpdateEligibleEmail($id: Int!, $email: String) {
    updateEligibleEmail(id: $id, email: $email) {
      eligibleEmail {
        id
        email
        election {
          id
          name
        }
      }
    }
  }
`;

export const DELETE_ELIGIBLE_EMAIL = gql`
  mutation DeleteEligibleEmail($id: Int!) {
    deleteEligibleEmail(id: $id) {
      success
    }
  }
`;
