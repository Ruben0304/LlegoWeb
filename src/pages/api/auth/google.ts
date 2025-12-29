import type { APIRoute } from 'astro';

import { loginWithGoogle } from '@/lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { idToken, authorizationCode, nonce } = body ?? {};

    if (!idToken) {
      return new Response(JSON.stringify({ error: 'idToken requerido.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await loginWithGoogle({
      idToken,
      authorizationCode,
      nonce,
    });

    return new Response(JSON.stringify(result.loginWithGoogle), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en loginWithGoogle:', error);
    return new Response(JSON.stringify({ error: 'Error al autenticar con Google.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
