/**
 * Vista previa de versiones del diseño en el mismo dominio.
 *
 * El servicio principal (rama main) puede mostrar la versión de otra rama
 * (claude/rediseno) desplegada como un segundo servicio: si el visitante tiene
 * la cookie `llego_version=rediseno` y existe REDESIGN_ORIGIN, el middleware
 * reenvía la petición a ese servicio y devuelve su respuesta tal cual.
 *
 * - /version?v=actual|rediseno&to=/ruta  fija la versión y vuelve a la ruta.
 * - /version?v=salir                     borra las cookies (vista normal).
 * - /comparar?ruta=/                     las dos versiones lado a lado.
 *
 * El selector flotante solo aparece a quien activó la vista previa
 * (cookie `llego_preview`), así que el público no lo ve.
 *
 * Este archivo, src/middleware.ts, VersionSwitch.astro y comparar.astro son
 * idénticos en las dos ramas.
 */

export const VERSION_COOKIE = 'llego_version';
export const PREVIEW_COOKIE = 'llego_preview';
/** Cabecera que el servicio principal añade al reenviar al rediseño. */
export const PROXY_HEADER = 'x-llego-preview-proxy';

export type DesignVersion = 'actual' | 'rediseno';

/** Origen del servicio con el rediseño (p. ej. https://llegoweb-rediseno.up.railway.app), sin barra final. */
export function redesignOrigin(): string | null {
  const raw = (typeof process !== 'undefined' ? process.env.REDESIGN_ORIGIN : undefined) ?? import.meta.env.REDESIGN_ORIGIN;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.origin;
  } catch {
    return null;
  }
}

/** Ruta interna segura para redirigir (evita redirecciones abiertas como //otro.com). */
export function safePath(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return '/';
  return value;
}
