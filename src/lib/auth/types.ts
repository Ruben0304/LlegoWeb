export type SocialLoginInput = {
  idToken: string;
  authorizationCode?: string | null;
  nonce?: string | null;
};

export type AppleLoginInput = {
  identityToken: string;
  authorizationCode?: string | null;
  nonce?: string | null;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  createdAt?: string;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
};
