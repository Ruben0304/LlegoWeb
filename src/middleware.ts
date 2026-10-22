import { defineMiddleware } from 'astro:middleware';

/**
 * Cabeceras de seguridad en todas las respuestas (producción no enviaba ninguna).
 *
 * El JWT de la sesión vive en localStorage, así que conviene que nadie pueda enmarcar el
 * sitio ni cargar objetos. `script-src` solo admite scripts del propio sitio y de Google
 * Identity: un `<script src>` inyectado desde otro dominio no carga. Los scripts en línea
 * (Layout, callback, islas de Astro) siguen permitidos; quitarlos exige hashes o nonces.
 */
const CABECERAS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy':
    "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; " +
    "script-src 'self' 'unsafe-inline' https://accounts.google.com",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  for (const [nombre, valor] of Object.entries(CABECERAS)) {
    if (!response.headers.has(nombre)) response.headers.set(nombre, valor);
  }
  return response;
});
