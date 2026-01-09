/**
 * Mutations GraphQL para productos
 */

import { gql } from 'graphql-request';

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!, $jwt: String) {
    create_product(input: $input, jwt: $jwt) {
      id
      name
      description
      price
      currency
      weight
      image
      availability
      categoryId
      category {
        id
        branchType
        name
        iconIos
        iconWeb
        iconAndroid
      }
      imageUrl
      createdAt
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($productId: String!, $input: UpdateProductInput!) {
    update_product(product_id: $productId, input: $input) {
      id
      name
      price
      description
      imageUrl
      availability
      categoryId
      category {
        id
        branchType
        name
        iconIos
        iconWeb
        iconAndroid
      }
      weight
      currency
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
