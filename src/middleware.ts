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

/** Tipos de texto que vale la pena comprimir. */
const COMPRIMIBLE = /^(text\/|application\/(json|xml|javascript|graphql-response\+json))/;

/**
 * Railway sirve comprimidos los archivos estáticos, pero no el HTML que se genera en cada
 * petición: la portada son ~42 KB que con gzip quedan en ~9. Las páginas que se generan al
 * compilar (prerender) no se tocan: comprimirlas aquí guardaría gzip en el archivo.
 */
function comprimir(request: Request, response: Response): Response {
  const tipo = response.headers.get('Content-Type') ?? '';
  const aceptaGzip = /\bgzip\b/.test(request.headers.get('Accept-Encoding') ?? '');
  if (
    !response.body ||
    request.method === 'HEAD' ||
    !aceptaGzip ||
    !COMPRIMIBLE.test(tipo) ||
    response.headers.has('Content-Encoding')
  ) {
    return response;
  }
  const headers = new Headers(response.headers);
  headers.set('Content-Encoding', 'gzip');
  headers.delete('Content-Length');
  headers.append('Vary', 'Accept-Encoding');
  return new Response(response.body.pipeThrough(new CompressionStream('gzip')), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  for (const [nombre, valor] of Object.entries(CABECERAS)) {
    if (!response.headers.has(nombre)) response.headers.set(nombre, valor);
  }
  return context.isPrerendered ? response : comprimir(context.request, response);
});
