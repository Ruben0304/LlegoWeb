import type { APIRoute } from 'astro';

import { PUBLIC_PAGES } from '@/lib/seo';
import { SITE_URL } from '@/lib/site';

// Se genera al compilar: no depende de la petición.
export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL(SITE_URL);
  const urls = PUBLIC_PAGES.map((path) => `  <url><loc>${new URL(path, base).href}</loc></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
