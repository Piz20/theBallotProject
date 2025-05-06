// mutations.tsx

import { gql } from "@apollo/client";

/**
 * Mutation pour l'enregistrement d'un nouvel utilisateur.
 */
export const REGISTER_USER = gql`
  mutation RegisterUser(
    $email: String!
    $password: String!
    $name: String
    $matricule: String
    $gender: String
    $dateOfBirth: String
    $profilePicture: String
  ) {
    registerUser(
      email: $email
      password: $password
      name: $name
      matricule: $matricule
      gender: $gender
      dateOfBirth: $dateOfBirth
      profilePicture: $profilePicture
    ) {
      success
      message
      user {
        id
        email
        name
      }
    }
  }
`;

/**
 * Mutation pour se connecter (login) avec email et mot de passe.
 */
export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      success
      message
      details
    }
  }
`;

/**
 * Mutation pour se déconnecter (logout) de la session actuelle.
 */
export const LOGOUT_USER = gql`
  mutation LogoutUser {
    logoutUser {
      success
      message
      details
    }
  }
`;

/**
 * Mutation pour mettre à jour le profil utilisateur.
 * Tous les champs sont optionnels : on n'envoie que ceux qu'on veut modifier.
 */
export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile(
    $name: String
    $matricule: String
    $gender: String
    $email: String
    $dateOfBirth: String
    $profilePicture: String
  ) {
    updateUserProfile(
      name: $name
      matricule: $matricule
      gender: $gender
      email: $email
      dateOfBirth: $dateOfBirth
      profilePicture: $profilePicture
    ) {
      success
      message
      user {
        id
        name
        email
        gender
        profilePicture
      }
    }
  }
`;

/**
 * Mutation pour supprimer le compte utilisateur courant (avec confirmation par ID).
 */
export const DELETE_USER_ACCOUNT = gql`
  mutation DeleteUserAccount($userId: Int!) {
    deleteUserAccount(userId: $userId) {
      success
      message
    }
  }
`;
