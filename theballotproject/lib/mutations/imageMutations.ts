import { gql } from "@apollo/client";

/**
 * Mutation pour télécharger une image.
 */
export const UPLOAD_IMAGE = gql`
  mutation UploadImage($image: String!) {
    uploadImage(image: $image) {
      image {
        id
        image
      }
    }
  }
`;

/**
 * Mutation pour récupérer toutes les images téléchargées.
 */
export const GET_ALL_IMAGES = gql`
  query GetAllImages {
    allImages {
      id
      image
    }
  }
`;

/**
 * Mutation pour récupérer une image par son ID.
 */
export const GET_IMAGE_BY_ID = gql`
  query GetImageById($id: Int!) {
    imageById(id: $id) {
      id
      image
    }
  }
`;
