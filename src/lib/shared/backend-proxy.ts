/**
 * Llamadas del servidor de la web al backend en nombre de un navegador
 * (login social, descarga del APK). SOLO SERVIDOR: lee
 * WEB_PROXY_SECRET, que nunca debe llegar al navegador. No lo importes desde
 * componentes Svelte ni desde código que se ejecute en el cliente.
 *
 * El backend ve la IP del servidor de la web, no la del visitante, así que todos
 * compartirían el mismo cubo de rate limit. Por eso se reenvía la IP del
 * navegador junto con un secreto compartido: el backend solo la acepta si el
 * secreto coincide con su WEB_PROXY_SECRET (LlegoBackend, utils/client_ip.py).
 * Sin secreto configurado no se reenvía nada.
 */

import { isIP } from 'node:net';

/** Cabeceras que entiende el backend (utils/client_ip.py). */
export const PROXY_SECRET_HEADER = 'X-Llego-Proxy-Secret';
export const CLIENT_IP_HEADER = 'X-Llego-Client-IP';

/** Tiempo máximo de espera al backend desde los endpoints de la web. */
export const BACKEND_TIMEOUT_MS = 10_000;

function proxySecret(): string {
  // import.meta.env cubre `astro dev` (.env); process.env, la variable definida
  // solo en tiempo de ejecución (Railway) aunque no existiera al compilar.
  return import.meta.env.WEB_PROXY_SECRET || process.env.WEB_PROXY_SECRET || '';
}

/**
 * IP del navegador. Detrás del edge de Railway la conexión viene del proxy:
 * X-Real-IP la pone el edge con la IP del cliente (documentado en Railway,
 * Public Networking > Specs & Limits). Que el edge sobrescriba la que mande el
 * propio cliente lo afirma el soporte de Railway, no la documentación: hay que
 * comprobarlo en producción (LlegoBackend, context.md §6 "IP del cliente").
 * `clientAddress` (Astro) es el respaldo: primer X-Forwarded-For o la IP del
 * socket.
 */
export function getClientIp(request: Request, clientAddress?: string): string | null {
  const candidates = [request.headers.get('x-real-ip'), clientAddress];
  for (const candidate of candidates) {
    const ip = candidate?.trim();
    if (ip && isIP(ip)) return ip;
  }
  return null;
}

/** `clientAddress` de Astro sin lanzar si no está disponible. */
export function safeClientAddress(context: { clientAddress: string }): string | undefined {
  try {
    return context.clientAddress;
  } catch {
    return undefined;
  }
}

/**
 * Cabeceras para reenviar la IP del navegador al backend. Vacío si no hay
 * WEB_PROXY_SECRET o no se conoce la IP (el backend usará la del servidor).
 */
export function clientIpHeaders(clientIp: string | null): Record<string, string> {
  const secret = proxySecret();
  if (!secret || !clientIp) return {};
  return {
    [PROXY_SECRET_HEADER]: secret,
    [CLIENT_IP_HEADER]: clientIp,
    // Llega intacta por la red privada de Railway; por el dominio público el
    // edge la reescribe, por eso el backend lee primero X-Llego-Client-IP.
    'X-Forwarded-For': clientIp,
  };
}

/** fetch con tiempo máximo: aborta y lanza si el backend no responde a tiempo. */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = BACKEND_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** True si el error viene de abortar por tiempo (fetchWithTimeout). */
export function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError');
}
