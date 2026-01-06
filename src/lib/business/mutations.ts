/**
 * Mutations GraphQL para negocios y sucursales
 */

import { gql } from 'graphql-request';

export const REGISTER_BUSINESS = gql`
  mutation RegisterBusiness(
    $businessInput: CreateBusinessInput!
    $branchesInput: [RegisterBranchInput!]!
    $jwt: String
  ) {
    registerBusiness(
      businessInput: $businessInput
      branchesInput: $branchesInput
      jwt: $jwt
    ) {
      id
      name
      type
      avatarUrl
      coverUrl
      isActive
    }
  }
`;

export const UPDATE_BUSINESS = gql`
  mutation UpdateBusiness(
    $businessId: String!
    $input: UpdateBusinessInput!
    $jwt: String
  ) {
    updateBusiness(businessId: $businessId, input: $input, jwt: $jwt) {
      id
      name
      type
      description
      avatarUrl
      coverUrl
      isActive
    }
  }
`;

export const CREATE_BRANCH = gql`
  mutation CreateBranch($input: CreateBranchInput!, $jwt: String) {
    createBranch(input: $input, jwt: $jwt) {
      id
      name
      tipos
      address
      phone
      status
      avatarUrl
      coverUrl
    }
  }
`;

export const UPDATE_BRANCH = gql`
  mutation UpdateBranch(
    $branchId: String!
    $input: UpdateBranchInput!
    $jwt: String
  ) {
    updateBranch(branchId: $branchId, input: $input, jwt: $jwt) {
      id
      name
      tipos
      status
      avatarUrl
      address
      phone
    }
  }
`;

export const ADD_BRANCH_TO_USER = gql`
  mutation AddBranchToUser($input: AddBranchInput!, $jwt: String) {
    addBranchToUser(input: $input, jwt: $jwt) {
      id
      branchIds
    }
  }
`;

export const REMOVE_BRANCH_FROM_USER = gql`
  mutation RemoveBranchFromUser($input: RemoveBranchInput!, $jwt: String) {
    removeBranchFromUser(input: $input, jwt: $jwt) {
      id
      branchIds
    }
  }
`;
