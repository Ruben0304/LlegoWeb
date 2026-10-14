/**
 * API de autenticacion social - Funciones helper para mutations
 */

import { mutation } from '@/lib/shared/graphql';
import { LOGIN_WITH_GOOGLE, LOGIN_WITH_APPLE } from './mutations';
import type { AuthResponse, AppleLoginInput, SocialLoginInput } from './types';

/**
 * `headers`: cabeceras extra para el backend; los endpoints /api/auth/* pasan
 * las de reenvío de la IP del navegador (src/lib/shared/backend-proxy.ts).
 */
export async function loginWithGoogle(input: SocialLoginInput, headers?: Record<string, string>) {
  return mutation<{ loginWithGoogle: AuthResponse }>(LOGIN_WITH_GOOGLE, { input }, headers);
}

export async function loginWithApple(input: AppleLoginInput, headers?: Record<string, string>) {
  return mutation<{ loginWithApple: AuthResponse }>(LOGIN_WITH_APPLE, { input }, headers);
}

export * from './types';
export * from './mutations';
