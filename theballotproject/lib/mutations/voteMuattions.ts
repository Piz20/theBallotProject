import { gql } from "@apollo/client";

// =================== QUERIES ===================

export const GET_ALL_VOTES = gql`
  query {
    allVotes {
      id
      user {
        id
        name
        email
      }
      candidate {
        id
        name
        voteCount
        election {
          id
          name
        }
      }
      election {
        id
        name
      }
    }
  }
`;

export const GET_VOTES_BY_ELECTION = gql`
  query GetVotesByElection($electionId: Int!) {
    votesByElection(electionId: $electionId) {
      id
      user {
        id
        name
        email
      }
      candidate {
        id
        name
        voteCount
      }
      election {
        id
        name
      }
    }
  }
`;

export const GET_USER_VOTE_IN_ELECTION = gql`
  query GetUserVoteInElection($electionId: Int!) {
    userVoteInElection(electionId: $electionId) {
      id
      candidate {
        id
        name
      }
      election {
        id
        name
      }
    }
  }
`;

export const GET_VOTE_BY_ID = gql`
  query VoteById($id: Int!) {
    voteById(id: $id) {
      id
      user {
        id
        name
        email
      }
      candidate {
        id
        name
        voteCount
      }
      election {
        id
        name
      }
    }
  }
`;

// =================== MUTATIONS ===================

export const CREATE_OR_UPDATE_VOTE = gql`
  mutation CreateOrUpdateVote($candidateId: Int!, $electionId: Int!) {
    createOrUpdateVote(candidateId: $candidateId, electionId: $electionId) {
      success
      message
      vote {
        id
        user {
          id
          name
          email
        }
        candidate {
          id
          name
          voteCount
        }
        election {
          id
          name
        }
      }
    }
  }
`;

export const DELETE_VOTE = gql`
  mutation DeleteVote($voteId: Int!) {
    deleteVote(voteId: $voteId) {
      success
      message
    }
  }
`;