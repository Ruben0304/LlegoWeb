/**
 * Queries GraphQL del registro de socios
 */

import { gql } from 'graphql-request';

/**
 * Acceso del usuario como negocio/mensajero y su última solicitud de cada tipo
 */
export const MY_PARTNER_ACCESS = gql`
  query MyPartnerAccess($jwt: String!) {
    myPartnerAccess(jwt: $jwt) {
      courierApproved
      merchantApproved
      latestCourierRequest {
        id
        type
        status
        fullName
        phone
        email
        businessName
        municipality
        notes
        createdAt
        updatedAt
        reviewedAt
      }
      latestBusinessRequest {
        id
        type
        status
        fullName
        phone
        email
        businessName
        municipality
        notes
        createdAt
        updatedAt
        reviewedAt
      }
    }
  }
`;
