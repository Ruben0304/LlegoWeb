/**
 * Datos de contacto y URLs públicas del sitio.
 *
 * Fuente única para páginas legales, soporte, "Próximamente" y el registro de
 * socios (/negocios): si cambia el correo, el WhatsApp o el tiempo de
 * respuesta, se cambia aquí y se refleja en todo el sitio. Las apps (iOS, Android, negocios, mensajeros) enlazan a
 * SITE_URL + /privacidad y /terminos.
 */

/** URL pública de la web (la web es la fuente única de los textos legales). */
export const SITE_URL = 'https://llegoweb-production.up.railway.app';

/** Correo de soporte. */
export const SUPPORT_EMAIL = 'rubianclaude@gmail.com';

/** WhatsApp de soporte (mismo número que la sección Soporte de LlegoBusiness). */
export const SUPPORT_WHATSAPP_NUMBER = '5358412294';
export const SUPPORT_WHATSAPP_DISPLAY = '+53 5841 2294';

/** Tiempo de respuesta que prometemos en todo el sitio. */
export const SUPPORT_RESPONSE_TIME = '24 a 48 horas';

/** Fecha de última actualización de la política de privacidad y los términos. */
export const LEGAL_LAST_UPDATED = '1 de octubre de 2026';

/** App de un socio: nombre tal como aparece en las tiendas y enlace de descarga, si lo hay. */
export type PartnerApp = {
  name: string;
  downloadUrl: string | null;
};

/**
 * Apps de los socios (registro de /negocios). Cuando haya un enlace público de
 * descarga, ponlo en `downloadUrl` y la página lo mostrará a los socios
 * aprobados; mientras sea null, les ofrece pedir el enlace por WhatsApp.
 */
export const PARTNER_APPS: Record<'business' | 'courier', PartnerApp> = {
  business: { name: 'LlegoBusiness', downloadUrl: null },
  courier: { name: 'Llego Mensajeros', downloadUrl: null },
};

/** Enlace de WhatsApp de soporte, con un texto prellenado opcional. */
export function supportWhatsappUrl(text?: string): string {
  const base = `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Enlace mailto de soporte, con asunto opcional. */
export function supportMailtoUrl(subject?: string): string {
  const base = `mailto:${SUPPORT_EMAIL}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}
