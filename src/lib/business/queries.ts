/**
 * Queries GraphQL para negocios y sucursales
 */

import { gql } from 'graphql-request';

export const GET_BUSINESSES = gql`
  query GetBusinesses($jwt: String) {
    businesses(jwt: $jwt) {
      id
      name
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
    $first: Int
    $after: String
    $businessId: String
    $tipo: BranchTipo
    $radiusKm: Float
    $jwt: String
  ) {
    branches(
      first: $first
      after: $after
      businessId: $businessId
      tipo: $tipo
      radiusKm: $radiusKm
      jwt: $jwt
    ) {
      edges {
        cursor
        node {
          ...ScoredBranchCoreFields
        }
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

  fragment ScoredBranchCoreFields on ScoredBranchType {
    id
    businessId
    name
    address
    phone
    isActive
    tipos
    useAppMessaging
    vehicles
    accounts {
      cardNumber
      cardHolderName
      bankName
      isActive
    }
    qrPayments {
      value
      isActive
    }
    phones {
      phone
      isActive
    }
    paymentMethodIds
    avatar
    coverImage
    socialMedia
    coordinates {
      ...CoordinatesFields
    }
    schedule
    managerIds
    createdAt
    avatarUrl
    coverUrl
    wallet {
      ...WalletBalanceFields
    }
    walletStatus
  }

  fragment CoordinatesFields on CoordinatesType {
    type
    coordinates
  }

  fragment WalletBalanceFields on WalletBalanceType {
    local
    usd
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
  query GetMyBusinessesWithBranches($jwt: String!) {
    getMyBusinessesWithBranches(jwt: $jwt) {
      ...BusinessRoleFields
      branches {
        ...BranchCoreFields
      }
    }
  }

  fragment BusinessRoleFields on BusinessWithBranchesType {
    id
    name
    ownerId
    avatar
    description
    tags
    globalRating
    isActive
    createdAt
    avatarUrl
    isOwner
    role
  }

  fragment BranchCoreFields on BranchType {
    id
    businessId
    name
    address
    phone
    tipos
    useAppMessaging
    vehicles
    accounts {
      cardNumber
      cardHolderName
      bankName
      isActive
    }
    qrPayments {
      value
      isActive
    }
    phones {
      phone
      isActive
    }
    paymentMethodIds
    managerIds
    avatar
    coverImage
    avatarUrl
    coverUrl
    isActive
    socialMedia
    coordinates {
      ...CoordinatesFields
    }
    schedule
    createdAt
    wallet {
      ...WalletBalanceFields
    }
    walletStatus
  }

  fragment CoordinatesFields on CoordinatesType {
    type
    coordinates
  }

  fragment WalletBalanceFields on WalletBalanceType {
    local
    usd
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
