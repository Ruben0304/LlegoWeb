import type { APIRoute } from 'astro';

import { getBackendBaseUrl } from '@/lib/shared/graphql';

export const prerender = false;

async function proxyGraphqlRequest(request: Request): Promise<Response> {
  const targetUrl = `${getBackendBaseUrl()}/graphql`;
  const headers = new Headers();

  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('content-type', contentType);
  }

  const authorization = request.headers.get('authorization');
  if (authorization) {
    headers.set('authorization', authorization);
  }

  const accept = request.headers.get('accept');
  if (accept) {
    headers.set('accept', accept);
  }

  const method = request.method.toUpperCase();
  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.text();

  const backendResponse = await fetch(targetUrl, {
    method,
    headers,
    body,
  });

  const responseBody = await backendResponse.text();
  const responseHeaders = new Headers();
  const responseContentType = backendResponse.headers.get('content-type') ?? 'application/json';
  responseHeaders.set('content-type', responseContentType);

  return new Response(responseBody, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    return await proxyGraphqlRequest(request);
  } catch (error) {
    console.error('Error proxying GraphQL request:', error);
    return new Response(JSON.stringify({ error: 'No se pudo contactar el backend GraphQL.' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
};
