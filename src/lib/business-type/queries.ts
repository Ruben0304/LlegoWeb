/**
 * Queries GraphQL para BusinessTypeConfig
 */

import { gql } from 'graphql-request';

export const GET_BUSINESS_TYPE_CONFIGS = gql`
  query GetBusinessTypeConfigs($lastSyncAt: DateTime) {
    businessTypeConfigs(lastSyncAt: $lastSyncAt) {
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
