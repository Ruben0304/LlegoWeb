/**
 * Descarga del APK de Android: pide al backend el enlace firmado
 * (GET /download/android, que responde 302) y redirige al navegador.
 *
 * Quien llega aquí es una persona que tocó "Descargar": si algo falla (backend
 * sin configurar, caído o lento) ve una página corta con el motivo y cómo
 * seguir, nunca un 500 en blanco.
 */

import type { APIRoute } from 'astro';

import { clientIpHeaders, fetchWithTimeout, getClientIp, isTimeoutError, safeClientAddress } from '@/lib/shared/backend-proxy';
import { getBackendBaseUrl } from '@/lib/shared/graphql';
import { SUPPORT_EMAIL, supportWhatsappUrl } from '@/lib/site';

export const prerender = false;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Página mínima (sin layout ni JS) con el mensaje y enlaces para seguir. */
function friendlyError(status: number, message: string): Response {
  const whatsapp = escapeHtml(supportWhatsappUrl('Hola, no puedo descargar la app de Llegó para Android.'));
  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Descarga no disponible | Llegó</title>
<style>
  /* Mismas tintas que el sitio (DESIGN.md), sin fuentes propias: página mínima */
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #ffffff; color: #124939; padding: 24px; box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  main { max-width: 440px; text-align: center; }
  h1 { font-family: inherit; font-size: 2.2rem; font-weight: 900;
    text-transform: uppercase; line-height: 1; margin: 0 0 14px; text-shadow: 0.045em 0.035em 0 #f9b41e; }
  p { color: rgba(18, 73, 57, 0.8); line-height: 1.5; margin: 0 0 24px; }
  a { display: inline-flex; align-items: center; min-height: 48px; margin: 4px; padding: 10px 20px;
    border-radius: 6px; text-decoration: none; background: #176545; color: #ffffff; font-weight: 700; }
  a.secondary { background: transparent; color: #124939; box-shadow: inset 0 0 0 2px #124939; }
  a:focus-visible { outline: 3px solid #f9b41e; outline-offset: 3px; }
  .note { margin: 24px 0 0; font-size: 0.9rem; }
</style>
</head>
<body>
<main>
  <h1>No pudimos iniciar la descarga</h1>
  <p>${escapeHtml(message)}</p>
  <a href="/api/download/android">Intentar de nuevo</a>
  <a class="secondary" href="${whatsapp}" rel="noopener noreferrer">Escribir a soporte</a>
  <a class="secondary" href="/">Volver al inicio</a>
  <p class="note">También puedes escribirnos a ${escapeHtml(SUPPORT_EMAIL)}.</p>
</main>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export const GET: APIRoute = async (context) => {
  let backendUrl: string;
  try {
    backendUrl = getBackendBaseUrl();
  } catch (error) {
    console.error('[api/download/android] Backend sin configurar:', error instanceof Error ? error.message : error);
    return friendlyError(503, 'La descarga no está disponible en este momento. Inténtalo de nuevo más tarde.');
  }

  try {
    // La app pide el APK de su arquitectura (?abi=arm64-v8a); el backend valida el valor
    const abi = context.url.searchParams.get('abi');
    const query = abi ? `?abi=${encodeURIComponent(abi)}` : '';
    const response = await fetchWithTimeout(`${backendUrl}/download/android${query}`, {
      redirect: 'manual',
      headers: clientIpHeaders(getClientIp(context.request, safeClientAddress(context))),
    });
    const location = response.headers.get('location');

    if (!location) {
      return friendlyError(404, 'La app de Android no está disponible para descargar ahora mismo. Inténtalo más tarde o escríbenos.');
    }

    // El enlace firmado caduca: que nadie (navegador ni CDN) guarde la redirección.
    return new Response(null, {
      status: 302,
      headers: { location, 'cache-control': 'no-store' },
    });
  } catch (error) {
    if (isTimeoutError(error)) {
      console.error('[api/download/android] El backend no respondió a tiempo');
      return friendlyError(504, 'El servidor tardó demasiado en responder. Inténtalo de nuevo en unos segundos.');
    }
    console.error('[api/download/android] No se pudo contactar el backend:', error instanceof Error ? error.message : error);
    return friendlyError(502, 'No pudimos conectar con el servidor. Inténtalo de nuevo en unos minutos.');
  }
};
