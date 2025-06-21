import { gql } from "@apollo/client";

// 🔍 Queries

export const GET_ALL_CANDIDATES = gql`
  query {
    allCandidates {
      id
      name
      description
      voteCount
      imageUrl
      imageFile
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
      description
      voteCount
      imageUrl
      imageFile
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
    $description: String!
    $electionId: Int!
    $imageFile: String
    $imageUrl: String
  ) {
    createCandidate(
      name: $name
      description: $description
      electionId: $electionId
      imageFile: $imageFile
      imageUrl: $imageUrl
    ) {
      success
      message
      candidate {
        id
        name
        description
        voteCount
        imageFile
        imageUrl
        createdAt
        election {
          id
          name
        }
      }
    }
  }
`;

export const GET_CANDIDATES_BY_ELECTION_ID = gql`
  query GetCandidatesByElectionId($electionId: Int!) {
    candidatesByElection(electionId: $electionId) {
      id
      name
      description
      voteCount
      imageFile
      imageUrl
      createdAt
      election {
        id
        name
      }
    }
  }
`;


export const UPDATE_CANDIDATE = gql`
  mutation UpdateCandidate(
    $id: Int!
    $name: String
    $description: String
    $imageFile: String
    $imageUrl: String
  ) {
    updateCandidate(
      id: $id
      name: $name
      description: $description
      imageFile: $imageFile
      imageUrl: $imageUrl
    ) {
      success
      message
      candidate {
        id
        name
        description
        imageFile
        imageUrl
        voteCount
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
