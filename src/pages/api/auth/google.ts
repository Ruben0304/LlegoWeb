import type { APIRoute } from 'astro';

import { loginWithGoogle } from '@/lib/auth';
import { clientIpHeaders, getClientIp, safeClientAddress } from '@/lib/shared/backend-proxy';
import { describeGraphqlError } from '@/lib/shared/graphql';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const { request } = context;
  try {
    const body = await request.json();
    const { idToken, authorizationCode, nonce } = body ?? {};

    if (!idToken) {
      return new Response(JSON.stringify({ error: 'idToken requerido.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // La IP del navegador viaja al backend para que su rate limit no cuente
    // a todos los visitantes de la web como uno solo.
    const result = await loginWithGoogle(
      {
        idToken,
        authorizationCode,
        nonce,
      },
      clientIpHeaders(getClientIp(request, safeClientAddress(context)))
    );

    return new Response(JSON.stringify(result.loginWithGoogle), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Sin el error completo: incluye la petición con el token del proveedor.
    console.error('Error en loginWithGoogle:', describeGraphqlError(error));
    return new Response(JSON.stringify({ error: 'Error al autenticar con Google.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
