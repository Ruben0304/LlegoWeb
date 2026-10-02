/**
 * Registro de socios - helpers para la página /negocios (se usan desde el navegador
 * con el JWT del usuario).
 */

import { ClientError } from 'graphql-request';

import { mutation, query } from '@/lib/shared/graphql';
import { SUBMIT_PARTNER_REQUEST } from './mutations';
import { MY_PARTNER_ACCESS } from './queries';
import type {
  MyPartnerAccessResponse,
  PartnerAccess,
  PartnerRequest,
  SubmitPartnerRequestInput,
  SubmitPartnerRequestResponse,
} from './types';

/** Estado de acceso del usuario y su última solicitud de cada tipo. */
export async function getMyPartnerAccess(jwt: string): Promise<PartnerAccess> {
  const result = await query<MyPartnerAccessResponse>(MY_PARTNER_ACCESS, { jwt });
  return result.myPartnerAccess;
}

/** Envía la solicitud; el backend valida y normaliza el teléfono. */
export async function submitPartnerRequest(
  input: SubmitPartnerRequestInput,
  jwt: string
): Promise<PartnerRequest> {
  const result = await mutation<SubmitPartnerRequestResponse>(SUBMIT_PARTNER_REQUEST, { input, jwt });
  return result.submitPartnerRequest;
}

/** Mensaje legible de un error GraphQL (el backend los escribe en español). */
export function graphqlErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ClientError) {
    const message = error.response.errors?.[0]?.message;
    if (message) return message;
  }
  return fallback;
}

/** True si el backend rechazó el JWT (vencido, de otro entorno o ausente). */
export function isAuthError(error: unknown): boolean {
  const message = graphqlErrorMessage(error, '');
  return message === 'Invalid JWT' || message === 'Autenticación requerida';
}

export * from './phone';
export * from './types';
export * from './queries';
export * from './mutations';
