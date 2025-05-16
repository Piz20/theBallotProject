import { gql } from "@apollo/client";

// 🔍 Queries

export const GET_ALL_CANDIDATES = gql`
  query {
    allCandidates {
      id
      name
      bio
      voteCount
      profilePicture
      createdAt
      election {
        id
        name
      }
    }
  }
`;

export const GET_CANDIDATE_BY_ID = gql`
  query GetCandidate($id: Int!) {
    candidate(id: $id) {
      id
      name
      bio
      voteCount
      profilePicture
      createdAt
      election {
        id
        name
      }
    }
  }
`;

// ✍️ Mutations

export const CREATE_CANDIDATE = gql`
  mutation CreateCandidate(
    $name: String!
    $bio: String!
    $electionId: Int!
    $profilePicture: String
  ) {
    createCandidate(
      name: $name
      bio: $bio
      electionId: $electionId
      profilePicture: $profilePicture
    ) {
      success
      message
      candidate {
        id
        name
        bio
        voteCount
        profilePicture
        createdAt
        election {
          id
          name
        }
      }
    }
  }
`;

export const UPDATE_CANDIDATE = gql`
  mutation UpdateCandidate(
    $id: Int!
    $name: String
    $bio: String
    $electionId: Int
    $profilePicture: String
  ) {
    updateCandidate(
      id: $id
      name: $name
      bio: $bio
      electionId: $electionId
      profilePicture: $profilePicture
    ) {
      success
      message
      candidate {
        id
        name
        bio
        voteCount
        profilePicture
        createdAt
        election {
          id
          name
        }
      }
    }
  }
`;

export const DELETE_CANDIDATE = gql`
  mutation DeleteCandidate($id: Int!) {
    deleteCandidate(id: $id) {
      success
      message
    }
  }
`;
