import { defineMiddleware } from 'astro:middleware';
import { PREVIEW_COOKIE, PROXY_HEADER, VERSION_COOKIE, redesignOrigin, safePath } from './lib/version';

/** Cabeceras que no se copian entre la petición reenviada y la respuesta. */
const HOP_BY_HOP = ['connection', 'keep-alive', 'transfer-encoding', 'content-encoding', 'content-length', 'host'];
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function cookie(name: string, value: string, secure: boolean, maxAge = COOKIE_MAX_AGE): string {
  return `${name}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure ? '; Secure' : ''}`;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request } = context;
  const secure = url.protocol === 'https:';

  // Cambiar de versión: fija las cookies y vuelve a la página.
  if (url.pathname === '/version') {
    const v = url.searchParams.get('v');
    const headers = new Headers({ Location: safePath(url.searchParams.get('to')), 'Cache-Control': 'no-store' });
    if (v === 'salir') {
      headers.append('Set-Cookie', cookie(VERSION_COOKIE, '', secure, 0));
      headers.append('Set-Cookie', cookie(PREVIEW_COOKIE, '', secure, 0));
    } else {
      headers.append('Set-Cookie', cookie(VERSION_COOKIE, v === 'rediseno' ? 'rediseno' : 'actual', secure));
      headers.append('Set-Cookie', cookie(PREVIEW_COOKIE, '1', secure));
    }
    return new Response(null, { status: 302, headers });
  }

  const origin = redesignOrigin();
  const wantsRedesign = context.cookies.get(VERSION_COOKIE)?.value === 'rediseno';
  if (!origin || !wantsRedesign || url.pathname === '/comparar') {
    return next();
  }

  // Reenviar al servicio del rediseño y devolver su respuesta en este dominio.
  const target = new URL(url.pathname + url.search, origin);
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.set('x-forwarded-host', url.host);
  headers.set(PROXY_HEADER, '1');

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: 'manual',
    });
  } catch {
    // Si el rediseño no responde, se ve la versión actual.
    return next();
  }

  const out = new Headers(upstream.headers);
  for (const name of HOP_BY_HOP) out.delete(name);
  const location = out.get('location');
  if (location?.startsWith(origin)) out.set('location', location.slice(origin.length) || '/');
  out.set('X-Robots-Tag', 'noindex, nofollow');

  return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: out });
});
