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
  query GetBranches(
    $first: Int!
    $after: String
    $businessId: String
    $onlyActive: Boolean
    $tipo: BranchTipo
    $jwt: String
  ) {
    branches(
      first: $first
      after: $after
      businessId: $businessId
      onlyActive: $onlyActive
      tipo: $tipo
      jwt: $jwt
    ) {
      edges {
        node {
          id
          businessId
          name
          tipos
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
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
        totalCount
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
      tipos
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
  query GetMyBranches(
    $first: Int!
    $after: String
    $businessId: String!
    $jwt: String!
  ) {
    branches(
      first: $first
      after: $after
      businessId: $businessId
      jwt: $jwt
    ) {
      edges {
        node {
          id
          name
          tipos
          address
          status
          avatarUrl
          phone
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
        totalCount
      }
    }
  }
`;
