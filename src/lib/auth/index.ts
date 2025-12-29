/**
 * API de autenticacion social - Funciones helper para mutations
 */

import { mutation } from '@/lib/shared/graphql';
import { LOGIN_WITH_GOOGLE, LOGIN_WITH_APPLE } from './mutations';
import type { AuthResponse, AppleLoginInput, SocialLoginInput } from './types';

export async function loginWithGoogle(input: SocialLoginInput) {
  return mutation<{ loginWithGoogle: AuthResponse }>(LOGIN_WITH_GOOGLE, { input });
}

export async function loginWithApple(input: AppleLoginInput) {
  return mutation<{ loginWithApple: AuthResponse }>(LOGIN_WITH_APPLE, { input });
}

export * from './types';
export * from './mutations';
