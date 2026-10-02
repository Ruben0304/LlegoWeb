/**
 * Sesión del navegador (solo cliente): dónde se guarda el JWT, cómo se lee y
 * cómo se inicia sesión con Google o Apple.
 *
 * Las mismas claves de localStorage que usan /auth/callback y el panel de
 * tutoriales, para que la sesión sea una sola en todo el sitio.
 */

import type { AuthResponse, AuthUser } from './types';

export const AUTH_TOKEN_KEY = 'llego.auth.accessToken';
export const AUTH_TOKEN_TYPE_KEY = 'llego.auth.tokenType';
export const AUTH_USER_KEY = 'llego.auth.user';

/** Ruta a la que vuelve /auth/callback tras el login con Apple (sessionStorage). */
export const AUTH_RETURN_TO_KEY = 'llego.auth.returnTo';

export type StoredSession = {
  token: string;
  user: Partial<AuthUser> | null;
};

type JwtPayload = {
  user_id?: string;
  sub?: string;
  role?: string;
  exp?: number;
  name?: string;
  email?: string;
};

/** Payload del JWT sin verificar la firma (solo para leer `exp` y datos de pantalla). */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

/** True si el JWT ya venció (o no se puede leer). El backend lo emite por 30 días. */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return true;
  if (!payload.exp) return false;
  return payload.exp * 1000 <= Date.now();
}

export function storeSession(token: string, user: Partial<AuthUser> | null, tokenType = 'bearer') {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_TOKEN_TYPE_KEY, tokenType);
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }
}

/** Sesión guardada y vigente, o null (si venció se borra). */
export function readSession(): StoredSession | null {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return null;
    if (isTokenExpired(token)) {
      clearSession();
      return null;
    }
    const rawUser = localStorage.getItem(AUTH_USER_KEY);
    const user = rawUser ? (JSON.parse(rawUser) as Partial<AuthUser>) : null;
    return { token, user };
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_TOKEN_TYPE_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

/**
 * Solo rutas del propio sitio ("/negocios"), nunca "//otro-dominio" ni URLs
 * absolutas: el destino sale de sessionStorage y no debe poder sacar al usuario
 * del sitio.
 */
export function isSafeReturnPath(path: string | null | undefined): path is string {
  return !!path && path.startsWith('/') && !path.startsWith('//') && !path.includes('\\');
}

export function setReturnTo(path: string) {
  if (isSafeReturnPath(path)) {
    sessionStorage.setItem(AUTH_RETURN_TO_KEY, path);
  }
}

/** Destino guardado por setReturnTo (y lo borra), o `fallback`. */
export function consumeReturnTo(fallback: string): string {
  try {
    const path = sessionStorage.getItem(AUTH_RETURN_TO_KEY);
    sessionStorage.removeItem(AUTH_RETURN_TO_KEY);
    return isSafeReturnPath(path) ? path : fallback;
  } catch {
    return fallback;
  }
}

/** Lo que usamos de Google Identity Services (https://accounts.google.com/gsi/client). */
export type GoogleIdentityServices = {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
  }) => void;
  renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
};

const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client';

/** Carga el script de Google Identity Services (una vez) y lo devuelve, o null si no carga. */
export async function loadGoogleIdentity(): Promise<GoogleIdentityServices | null> {
  const current = () =>
    (window as unknown as { google?: { accounts?: { id?: GoogleIdentityServices } } }).google?.accounts?.id ??
    null;
  if (current()) return current();

  const loaded = await new Promise<boolean>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_IDENTITY_SCRIPT}"]`);
    if (existing) {
      if (current()) {
        resolve(true);
        return;
      }
      existing.addEventListener('load', () => resolve(true), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = GOOGLE_IDENTITY_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
  return loaded ? current() : null;
}

/** Intercambia la credencial de Google Identity Services por un JWT de Llegó. */
export async function exchangeGoogleCredential(credential: string): Promise<AuthResponse> {
  const response = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: credential }),
  });
  const data = (await response.json().catch(() => null)) as AuthResponse | { error?: string } | null;
  if (!response.ok || !data || 'error' in data) {
    const message = data && 'error' in data && data.error ? data.error : 'No se pudo iniciar sesión con Google.';
    throw new Error(message);
  }
  return data;
}

/**
 * Inicia el login con Apple en el navegador: el backend devuelve la URL de
 * Apple y, al terminar, redirige a /auth/callback?token=..., que guarda la
 * sesión y vuelve a `returnTo`.
 *
 * `redirect_scheme` tiene que ser una URL de WEB_AUTH_CALLBACK_URLS del backend
 * (api/endpoints/apple_auth.py); si este origen no está en la lista responde 400.
 */
export async function startAppleSignIn(backendUrl: string, returnTo: string): Promise<void> {
  const callbackUrl = `${window.location.origin}/auth/callback`;
  const base = backendUrl.replace(/\/+$/, '');
  let response: Response;
  try {
    response = await fetch(`${base}/apple/start?redirect_scheme=${encodeURIComponent(callbackUrl)}`);
  } catch {
    throw new Error('No se pudo contactar con el servidor para iniciar sesión con Apple.');
  }
  if (response.status === 400) {
    throw new Error('El inicio de sesión con Apple no está disponible en esta dirección. Usa Google o inténtalo desde la web oficial de Llegó.');
  }
  if (!response.ok) {
    throw new Error('No se pudo iniciar sesión con Apple. Inténtalo de nuevo.');
  }
  const data = (await response.json().catch(() => null)) as { auth_url?: string } | null;
  if (!data?.auth_url || !isAppleAuthUrl(data.auth_url)) {
    throw new Error('No se pudo iniciar sesión con Apple. Inténtalo de nuevo.');
  }
  setReturnTo(returnTo);
  window.location.assign(data.auth_url);
}

/** La URL de autorización debe ser de Apple (appleid.apple.com) y por https. */
function isAppleAuthUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname === 'apple.com' || url.hostname.endsWith('.apple.com'));
  } catch {
    return false;
  }
}
