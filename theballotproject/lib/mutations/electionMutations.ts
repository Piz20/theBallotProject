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
  query GetElection($id: Int!) {
    election(id: $id) {
      id
      name
      description
      startDate
      endDate
      status
      createdAt
      createdBy {
        id
        name
        email
      }
      eligibleVoters {
        id  
        name
        email}
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
  $id: Int!, 
  $name: String, 
  $start_date: DateTime, 
  $end_date: DateTime, 
  $description: String, 
  $status: String,
  $eligible_voters_ids: [Int],
  $candidate_ids: [Int]
) {
  updateElection(
    id: $id, 
    name: $name, 
    startDate: $start_date, 
    endDate: $end_date, 
    description: $description, 
    status: $status,
    eligibleVotersIds: $eligible_voters_ids,
    candidateIds: $candidate_ids
  ) {
    success
    message
    election {
      id
      name
      status
      startDate
      endDate
      description
      eligibleVoters { id name }
      candidates { id name }
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
