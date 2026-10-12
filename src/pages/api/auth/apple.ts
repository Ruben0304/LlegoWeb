import type { APIRoute } from 'astro';

import { loginWithApple } from '@/lib/auth';
import { clientIpHeaders, getClientIp, safeClientAddress } from '@/lib/shared/backend-proxy';
import { describeGraphqlError } from '@/lib/shared/graphql';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const { request } = context;
  try {
    const body = await request.json();
    const { identityToken, authorizationCode, nonce } = body ?? {};

    if (!identityToken) {
      return new Response(JSON.stringify({ error: 'identityToken requerido.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // La IP del navegador viaja al backend para que su rate limit no cuente
    // a todos los visitantes de la web como uno solo.
    const result = await loginWithApple(
      {
        identityToken,
        authorizationCode,
        nonce,
      },
      clientIpHeaders(getClientIp(request, safeClientAddress(context)))
    );

    return new Response(JSON.stringify(result.loginWithApple), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Sin el error completo: incluye la petición con el token del proveedor.
    console.error('Error en loginWithApple:', describeGraphqlError(error));
    return new Response(JSON.stringify({ error: 'Error al autenticar con Apple.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
