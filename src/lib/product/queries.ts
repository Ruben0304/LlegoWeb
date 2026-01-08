/**
 * Queries GraphQL para productos
 */

import { gql } from 'graphql-request';

export const GET_PRODUCTS = gql`
  query GetProducts(
    $first: Int!
    $after: String
    $ids: [String!]
    $branchId: String
    $categoryId: String
    $availableOnly: Boolean!
    $branchTipo: BranchTipo
    $radiusKm: Float
    $jwt: String
  ) {
    products(
      first: $first
      after: $after
      ids: $ids
      branchId: $branchId
      categoryId: $categoryId
      availableOnly: $availableOnly
      branchTipo: $branchTipo
      radiusKm: $radiusKm
      jwt: $jwt
    ) {
      edges {
        node {
          id
          name
          price
          description
          imageUrl
          availability
          categoryId
          branchId
          currency
          weight
          createdAt
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

export const GET_PRODUCT_BY_ID = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      price
      description
      imageUrl
      stock
      category {
        id
        name
        icon
        gradient
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      icon
      gradient
    }
  }
`;

export const SEARCH_PRODUCTS = gql`
  query SearchProducts(
    $query: String!
    $first: Int!
    $after: String
    $useVectorSearch: Boolean!
    $branchTipo: BranchTipo
    $radiusKm: Float
    $jwt: String
  ) {
    searchProducts(
      query: $query
      first: $first
      after: $after
      useVectorSearch: $useVectorSearch
      branchTipo: $branchTipo
      radiusKm: $radiusKm
      jwt: $jwt
    ) {
      edges {
        node {
          id
          name
          price
          imageUrl
          categoryId
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
