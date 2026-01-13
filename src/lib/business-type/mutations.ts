/**
 * Mutations GraphQL para BusinessTypeConfig
 */

import { gql } from 'graphql-request';

export const CREATE_BUSINESS_TYPE_CONFIG = gql`
  mutation CreateBusinessTypeConfig($input: CreateBusinessTypeConfigInput!, $jwt: String!) {
    createBusinessTypeConfig(input: $input, jwt: $jwt) {
      id
      key
      name
      description
      icon
      model3dFileName
      model3dUrl
      model3dPresignedUrl
      model3dVersion
      gradient {
        darkColor
        mediumColor
        lightColor
        veryLightColor
        overlayColor
      }
      camera {
        positionX
        positionY
        positionZ
        eulerX
        eulerY
        eulerZ
      }
      glowColor
      features {
        icon
        title
        subtitle
        sortOrder
      }
      sortOrder
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_BUSINESS_TYPE_CONFIG = gql`
  mutation UpdateBusinessTypeConfig($id: String!, $input: UpdateBusinessTypeConfigInput!, $jwt: String!) {
    updateBusinessTypeConfig(id: $id, input: $input, jwt: $jwt) {
      id
      key
      name
      description
      icon
      model3dFileName
      model3dUrl
      model3dPresignedUrl
      model3dVersion
      gradient {
        darkColor
        mediumColor
        lightColor
        veryLightColor
        overlayColor
      }
      camera {
        positionX
        positionY
        positionZ
        eulerX
        eulerY
        eulerZ
      }
      glowColor
      features {
        icon
        title
        subtitle
        sortOrder
      }
      sortOrder
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DEACTIVATE_BUSINESS_TYPE_CONFIG = gql`
  mutation DeactivateBusinessTypeConfig($id: String!, $jwt: String!) {
    deactivateBusinessTypeConfig(id: $id, jwt: $jwt) {
      id
      isActive
    }
  }
`;

export const DELETE_BUSINESS_TYPE_CONFIG = gql`
  mutation DeleteBusinessTypeConfig($id: String!, $jwt: String!) {
    deleteBusinessTypeConfig(id: $id, jwt: $jwt)
  }
`;
