/**
 * Queries GraphQL para negocios y sucursales
 */

import { gql } from 'graphql-request';

export const GET_BUSINESSES = gql`
  query GetBusinesses($jwt: String) {
    businesses(jwt: $jwt) {
      id
      name
      type
      avatarUrl
      coverUrl
      globalRating
      isActive
      description
      tags
    }
  }
`;

export const GET_BUSINESS = gql`
  query GetBusiness($id: String!, $jwt: String) {
    business(id: $id, jwt: $jwt) {
      id
      name
      type
      description
      avatarUrl
      coverUrl
      tags
      isActive
      ownerId
      globalRating
      createdAt
    }
  }
`;

export const GET_BRANCHES = gql`
  query GetBranches($businessId: String, $jwt: String) {
    branches(businessId: $businessId, jwt: $jwt) {
      id
      businessId
      name
      address
      phone
      status
      avatarUrl
      coverUrl
      deliveryRadius
      facilities
      schedule
      coordinates {
        coordinates
      }
    }
  }
`;

export const GET_BRANCH = gql`
  query GetBranch($id: String!, $jwt: String) {
    branch(id: $id, jwt: $jwt) {
      id
      businessId
      name
      address
      phone
      schedule
      facilities
      avatarUrl
      coverUrl
      status
      deliveryRadius
      managerIds
      coordinates {
        coordinates
      }
    }
  }
`;

export const GET_MY_BUSINESSES = gql`
  query GetMyBusinesses($jwt: String!) {
    businesses(jwt: $jwt) {
      id
      name
      type
      avatarUrl
      isActive
      description
    }
  }
`;

export const GET_MY_BRANCHES = gql`
  query GetMyBranches($businessId: String!, $jwt: String!) {
    branches(businessId: $businessId, jwt: $jwt) {
      id
      name
      address
      status
      avatarUrl
      phone
    }
  }
`;
