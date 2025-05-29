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
      eligibleEmails
    }
  }
`;

export const GET_ELECTION_BY_ID = gql`
   query($id: Int!) {
    election(id: $id) {
      id
      name
      description
      startDate
      endDate
      status
      createdAt
      imageUrl
      imageFile
      eligibleEmails
    
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
    $eligibleEmails: [String]
  ) {
    createElection(
      name: $name
      description: $description
      startDate: $startDate
      endDate: $endDate
      imageUrl: $imageUrl
      imageFile: $imageFile
      eligibleEmails: $eligibleEmails
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
        eligibleEmails
      }
    }
  }
`;


export const UPDATE_ELECTION = gql`
  mutation UpdateElection(
    $id: Int!
    $name: String
    $description: String
    $startDate: DateTime
    $endDate: DateTime
    $status: String
    $eligibleEmails: [String]
    $imageFile: String
    $imageUrl: String
  ) {
    updateElection(
      id: $id
      name: $name
      description: $description
      startDate: $startDate
      endDate: $endDate
      status: $status
      eligibleEmails: $eligibleEmails
      imageFile: $imageFile
      imageUrl: $imageUrl
    ) {
      success
      message
      election {
        id
        name
        description
        startDate
        endDate
        status
        eligibleEmails
        imageUrl
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
