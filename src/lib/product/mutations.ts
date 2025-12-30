/**
 * Mutations GraphQL para productos
 */

import { gql } from 'graphql-request';

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!, $jwt: String) {
    createProduct(input: $input, jwt: $jwt) {
      id
      name
      description
      price
      currency
      weight
      image
      availability
      categoryId
      imageUrl
      createdAt
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: ProductUpdateInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      price
      description
      imageUrl
      stock
      updatedAt
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      success
      message
    }
  }
`;

export const UPDATE_PRODUCT_STOCK = gql`
  mutation UpdateProductStock($id: ID!, $stock: Int!) {
    updateProductStock(id: $id, stock: $stock) {
      id
      stock
      updatedAt
    }
  }
`;
