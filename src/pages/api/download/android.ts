import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const backendUrl = import.meta.env.BACKEND_URL.replace(/\/graphql$/, '');

  try {
    const response = await fetch(`${backendUrl}/download/android`, { redirect: 'manual' });
    const location = response.headers.get('location');

    if (!location) {
      return new Response('APK no disponible', { status: 404 });
    }

    return new Response(null, {
      status: 302,
      headers: { location },
    });
  } catch {
    return new Response('Error al obtener el enlace de descarga', { status: 500 });
  }
};
