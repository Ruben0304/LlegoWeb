/**
 * Mutations GraphQL para tutoriales
 */

import { gql } from 'graphql-request';

/**
 * Crea un nuevo tutorial
 */
export const CREATE_TUTORIAL = gql`
  mutation CreateTutorial($input: CreateTutorialInput!, $jwt: String!) {
    createTutorial(input: $input, jwt: $jwt) {
      id
      title
      description
      videoUrl
      videoUrlSigned
      duration
      appTarget
      thumbnailUrl
      thumbnailUrlSigned
      order
      isActive
      tags
      createdAt
      updatedAt
    }
  }
`;

/**
 * Actualiza un tutorial existente
 */
export const UPDATE_TUTORIAL = gql`
  mutation UpdateTutorial($id: String!, $input: UpdateTutorialInput!, $jwt: String!) {
    updateTutorial(id: $id, input: $input, jwt: $jwt) {
      id
      title
      description
      videoUrl
      videoUrlSigned
      duration
      appTarget
      thumbnailUrl
      thumbnailUrlSigned
      order
      isActive
      tags
      createdAt
      updatedAt
    }
  }
`;

/**
 * Elimina un tutorial. El backend devuelve un Boolean (sin subcampos).
 */
export const DELETE_TUTORIAL = gql`
  mutation DeleteTutorial($id: String!, $jwt: String!) {
    deleteTutorial(id: $id, jwt: $jwt)
  }
`;

/**
 * Activa/desactiva un tutorial
 */
export const TOGGLE_TUTORIAL_ACTIVE = gql`
  mutation ToggleTutorialActive($id: String!, $jwt: String!) {
    toggleTutorialActive(id: $id, jwt: $jwt) {
      id
      title
      description
      videoUrl
      videoUrlSigned
      duration
      appTarget
      thumbnailUrl
      thumbnailUrlSigned
      order
      isActive
      tags
      createdAt
      updatedAt
    }
  }
`;
