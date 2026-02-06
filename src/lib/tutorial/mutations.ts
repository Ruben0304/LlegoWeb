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
  mutation UpdateTutorial($tutorialId: String!, $input: UpdateTutorialInput!, $jwt: String!) {
    updateTutorial(tutorialId: $tutorialId, input: $input, jwt: $jwt) {
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
 * Elimina un tutorial
 */
export const DELETE_TUTORIAL = gql`
  mutation DeleteTutorial($tutorialId: String!, $jwt: String!) {
    deleteTutorial(tutorialId: $tutorialId, jwt: $jwt) {
      success
      message
    }
  }
`;

/**
 * Activa/desactiva un tutorial
 */
export const TOGGLE_TUTORIAL_ACTIVE = gql`
  mutation ToggleTutorialActive($tutorialId: String!, $jwt: String!) {
    toggleTutorialActive(tutorialId: $tutorialId, jwt: $jwt) {
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
