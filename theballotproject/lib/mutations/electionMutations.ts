import { gql } from "@apollo/client";

// 🔍 Queries

export const GET_ALL_ELECTIONS = gql`
  query {
    allElections {
      id
      name
      description
      startDate
      endDate
      createdAt
      imageUrl
      imageFile
    }
  }
`;

export const GET_ELECTION_BY_ID = gql`
  query {
    election(id: $id) {
      id
      name
      description
      startDate
      endDate
    }
  }
`;

// ✍️ Mutations

export const CREATE_ELECTION = gql`
  mutation CreateElection(
    $name: String!
    $description: String!
    $startDate: DateTime
    $endDate: DateTime
    $imageUrl: String
    $imageFile: String
  ) {
    createElection(
      name: $name
      description: $description
      startDate: $startDate
      endDate: $endDate
      imageUrl: $imageUrl
      imageFile: $imageFile
    ) {
      success
      message
      election {
        id
        name
        description
        startDate
        endDate
        imageUrl
        
      }
    }
  }
`;


export const UPDATE_ELECTION = gql`
  mutation UpdateElection(
    $id: Int!
    $name: String
    $startDate: DateTime
    $endDate: DateTime
    $description: String
  ) {
    updateElection(
      id: $id
      name: $name
      startDate: $startDate
      endDate: $endDate
      description: $description
    ) {
      success
      message
      election {
        id
        name
        startDate
        endDate
        description
      }
    }
  }
`;

export const DELETE_ELECTION = gql`
  mutation DeleteElection($id: Int!) {
    deleteElection(id: $id) {
      success
      message
    }
  }
`;
