import { defineMiddleware } from 'astro:middleware';

/**
 * Cabeceras de seguridad en todas las respuestas (producción no enviaba ninguna).
 *
 * El JWT de la sesión vive en localStorage, así que conviene que nadie pueda enmarcar el
 * sitio ni cargar objetos. No se fija `script-src`: hay scripts en línea (Layout, callback)
 * y el de Google Identity; restringirlos exige nonces y se deja para más adelante.
 */
const CABECERAS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  for (const [nombre, valor] of Object.entries(CABECERAS)) {
    if (!response.headers.has(nombre)) response.headers.set(nombre, valor);
  }
  return response;
});
