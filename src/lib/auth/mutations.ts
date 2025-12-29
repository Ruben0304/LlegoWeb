import { gql } from 'graphql-request';

export const LOGIN_WITH_GOOGLE = gql`
  mutation LoginWithGoogle($input: SocialLoginInput!) {
    loginWithGoogle(input: $input) {
      accessToken
      tokenType
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const LOGIN_WITH_APPLE = gql`
  mutation LoginWithApple($input: AppleLoginInput!) {
    loginWithApple(input: $input) {
      accessToken
      tokenType
      user {
        id
        name
        email
        role
      }
    }
  }
`;
