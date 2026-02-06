/**
 * Queries GraphQL para tutoriales
 */

import { gql } from 'graphql-request';

/**
 * Obtiene todos los tutoriales
 */
export const GET_TUTORIALS = gql`
  query GetTutorials {
    tutorials {
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
 * Obtiene solo los tutoriales activos
 */
export const GET_ACTIVE_TUTORIALS = gql`
  query GetActiveTutorials {
    activeTutorials {
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
 * Obtiene tutoriales por app target
 */
export const GET_TUTORIALS_BY_APP = gql`
  query GetTutorialsByApp($appTarget: AppTarget!) {
    tutorialsByApp(appTarget: $appTarget) {
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
 * Obtiene un tutorial por ID
 */
export const GET_TUTORIAL = gql`
  query GetTutorial($id: String!) {
    tutorial(id: $id) {
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
 * Busca tutoriales por query (título, descripción o tags)
 */
export const SEARCH_TUTORIALS = gql`
  query SearchTutorials($query: String!) {
    searchTutorials(query: $query) {
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
 * Obtiene tutoriales por tags
 */
export const GET_TUTORIALS_BY_TAGS = gql`
  query GetTutorialsByTags($tags: [String!]!) {
    tutorialsByTags(tags: $tags) {
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
