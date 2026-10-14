import type { APIRoute } from 'astro';

import { DISALLOWED_PATHS } from '@/lib/seo';
import { SITE_URL } from '@/lib/site';

// Se genera al compilar: no depende de la petición.
export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL(SITE_URL);
  const body = [
    'User-agent: *',
    'Allow: /',
    ...DISALLOWED_PATHS.map((path) => `Disallow: ${path}`),
    '',
    `Sitemap: ${new URL('/sitemap.xml', base).href}`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
