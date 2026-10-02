/**
 * Mutations GraphQL del registro de socios
 */

import { gql } from 'graphql-request';

/**
 * Envía la solicitud para vender en Llegó o ser mensajero
 */
export const SUBMIT_PARTNER_REQUEST = gql`
  mutation SubmitPartnerRequest($input: SubmitPartnerRequestInput!, $jwt: String!) {
    submitPartnerRequest(input: $input, jwt: $jwt) {
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
`;
