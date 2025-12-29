import type { APIRoute } from 'astro';

import { loginWithApple } from '@/lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { identityToken, authorizationCode, nonce } = body ?? {};

    if (!identityToken) {
      return new Response(JSON.stringify({ error: 'identityToken requerido.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await loginWithApple({
      identityToken,
      authorizationCode,
      nonce,
    });

    return new Response(JSON.stringify(result.loginWithApple), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en loginWithApple:', error);
    return new Response(JSON.stringify({ error: 'Error al autenticar con Apple.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
