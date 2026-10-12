/**
 * Proxy GraphQL de la web hacia el backend (POST /api/graphql).
 *
 * Es público, así que no puede ser un túnel abierto al backend:
 * - Solo deja pasar las operaciones de la propia web, con el documento exacto
 *   (src/lib/shared/allowed-operations.ts).
 * - Cuerpo JSON de como mucho MAX_BODY_BYTES y espera al backend de como mucho
 *   BACKEND_TIMEOUT_MS.
 * - Reenvía la IP del navegador con el secreto compartido para que el rate limit
 *   del backend cuente por visitante y no por servidor de la web.
 * - Nunca devuelve errores internos (de red o 5xx del backend): solo mensajes
 *   genéricos; el detalle va al log del servidor.
 */

import type { APIRoute } from 'astro';

import { matchAllowedOperation } from '@/lib/shared/allowed-operations';
import {
  clientIpHeaders,
  fetchWithTimeout,
  getClientIp,
  isTimeoutError,
  safeClientAddress,
} from '@/lib/shared/backend-proxy';
import { getBackendBaseUrl } from '@/lib/shared/graphql';

export const prerender = false;

/** Las operaciones de la web pesan unos pocos KB; 100 KB deja margen de sobra. */
const MAX_BODY_BYTES = 100 * 1024;

function graphqlError(status: number, message: string): Response {
  return new Response(JSON.stringify({ errors: [{ message }] }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/** Lee el cuerpo sin pasar de `limit` bytes; null si es más grande. */
async function readBodyWithLimit(request: Request, limit: number): Promise<string | null> {
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > limit) return null;
  if (!request.body) return '';

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

type GraphqlBody = { query?: unknown; variables?: unknown; operationName?: unknown };

export const POST: APIRoute = async (context) => {
  const { request } = context;

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return graphqlError(415, 'La petición debe ser JSON.');
  }

  let rawBody: string | null;
  try {
    rawBody = await readBodyWithLimit(request, MAX_BODY_BYTES);
  } catch {
    return graphqlError(400, 'No se pudo leer la petición.');
  }
  if (rawBody === null) {
    return graphqlError(413, 'La petición es demasiado grande.');
  }

  let body: GraphqlBody;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return graphqlError(400, 'La petición no es un JSON válido.');
  }
  // Sin lotes (arrays) ni valores sueltos: un objeto con una operación.
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return graphqlError(400, 'La petición no es una operación GraphQL válida.');
  }

  const operationName = matchAllowedOperation(body.query, body.operationName);
  if (!operationName) {
    return graphqlError(403, 'Operación no permitida.');
  }

  const variables = body.variables ?? {};
  if (typeof variables !== 'object' || Array.isArray(variables)) {
    return graphqlError(400, 'Las variables deben ser un objeto.');
  }

  let backendUrl: string;
  try {
    backendUrl = getBackendBaseUrl();
  } catch (error) {
    console.error('[api/graphql] Backend sin configurar:', error instanceof Error ? error.message : error);
    return graphqlError(503, 'El servicio no está disponible en este momento. Inténtalo más tarde.');
  }

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    accept: 'application/json',
    ...clientIpHeaders(getClientIp(request, safeClientAddress(context))),
  };
  const authorization = request.headers.get('authorization');
  if (authorization) {
    headers.authorization = authorization;
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetchWithTimeout(`${backendUrl}/graphql`, {
      method: 'POST',
      headers,
      // Se reenvía solo lo validado (sin `extensions` ni otros campos).
      body: JSON.stringify({ query: body.query, variables, operationName }),
    });
  } catch (error) {
    if (isTimeoutError(error)) {
      console.error(`[api/graphql] ${operationName}: el backend no respondió a tiempo`);
      return graphqlError(504, 'El servidor tardó demasiado en responder. Inténtalo de nuevo.');
    }
    console.error(`[api/graphql] ${operationName}: no se pudo contactar el backend:`, error instanceof Error ? error.message : error);
    return graphqlError(502, 'No se pudo contactar con el servidor. Inténtalo de nuevo.');
  }

  const responseContentType = backendResponse.headers.get('content-type') ?? '';
  if (backendResponse.status >= 500 || !responseContentType.includes('application/json')) {
    console.error(`[api/graphql] ${operationName}: respuesta inesperada del backend (HTTP ${backendResponse.status})`);
    return graphqlError(502, 'El servidor no pudo completar la operación. Inténtalo de nuevo.');
  }

  let payload: { data?: unknown; errors?: Array<{ message?: unknown }> };
  try {
    payload = await backendResponse.json();
  } catch {
    console.error(`[api/graphql] ${operationName}: el backend devolvió un JSON inválido`);
    return graphqlError(502, 'El servidor no pudo completar la operación. Inténtalo de nuevo.');
  }

  // Solo `data` y el mensaje de cada error: los mensajes son los que la web
  // muestra al usuario (validaciones del backend en español); `locations`,
  // `path` y `extensions` no le sirven y pueden dar pistas del backend.
  const errors = Array.isArray(payload?.errors)
    ? payload.errors.map((error) => ({
        message: typeof error?.message === 'string' ? error.message : 'Error desconocido.',
      }))
    : undefined;

  return new Response(JSON.stringify({ data: payload?.data ?? null, ...(errors ? { errors } : {}) }), {
    status: backendResponse.status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
};
