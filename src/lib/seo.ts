/**
 * Qué páginas ven los buscadores. Lo usan /sitemap.xml y /robots.txt.
 *
 * El sitemap lista solo páginas públicas e indexables. Las que muestran la
 * sesión o datos de cada usuario (/negocios) o son paneles de administración
 * (/tutoriales, /business-types) llevan `noindex` en el Layout; los paneles,
 * /auth y /api además se bloquean en robots.txt.
 */

/** Rutas públicas e indexables (las que llevan `index, follow`). */
export const PUBLIC_PAGES = ['/', '/plus', '/soporte', '/privacidad', '/terminos', '/eliminar-cuenta'] as const;

/** Prefijos que los rastreadores no deben visitar. */
export const DISALLOWED_PATHS = ['/tutoriales', '/business-types', '/auth/', '/api/'] as const;
