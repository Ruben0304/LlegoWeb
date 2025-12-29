/**
 * Queries GraphQL para productos
 */

import { gql } from 'graphql-request';

export const GET_PRODUCTS = gql`
  query GetProducts(
    $limit: Int
    $offset: Int
    $categoryId: String
    $minPrice: Float
    $maxPrice: Float
    $searchTerm: String
    $inStock: Boolean
  ) {
    products(
      limit: $limit
      offset: $offset
      categoryId: $categoryId
      minPrice: $minPrice
      maxPrice: $maxPrice
      searchTerm: $searchTerm
      inStock: $inStock
    ) {
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
    total: productsCount(
      categoryId: $categoryId
      minPrice: $minPrice
      maxPrice: $maxPrice
      searchTerm: $searchTerm
      inStock: $inStock
    )
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
  query SearchProducts($searchTerm: String!, $limit: Int) {
    searchProducts(searchTerm: $searchTerm, limit: $limit) {
      id
      name
      price
      imageUrl
      category {
        id
        name
      }
    }
  }
`;
