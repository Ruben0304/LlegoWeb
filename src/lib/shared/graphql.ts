import { GraphQLClient } from 'graphql-request';

/**
 * Cliente GraphQL configurado para comunicarse con el backend.
 *
 * IMPORTANTE: En SSR usa BACKEND_URL (sin PUBLIC_) y en cliente usa
 * PUBLIC_BACKEND_URL. Esto evita errores en hidratacion cuando el modulo
 * se importa desde componentes del navegador.
 *
 * - BACKEND_URL solo está disponible en el servidor (server-side)
 * - PUBLIC_BACKEND_URL si se expone al navegador del cliente
 * - Se puede usar en archivos .astro, API routes, y getStaticProps
 * - Ideal para usar con el dominio privado de Railway (.railway.internal)
 *
 * La URL base del backend se obtiene de BACKEND_URL y se concatena /graphql
 * para el endpoint GraphQL. Esto permite usar la misma variable base para
 * endpoints REST.
 */
function getBackendUrl(): string {
  const SERVER_BACKEND_URL = import.meta.env.BACKEND_URL;
  const PUBLIC_BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL;
  const url = import.meta.env.SSR ? SERVER_BACKEND_URL : PUBLIC_BACKEND_URL;
  if (!url) {
    const missingVar = import.meta.env.SSR ? 'BACKEND_URL' : 'PUBLIC_BACKEND_URL';
    throw new Error(
      `${missingVar} no está definida. Asegúrate de crear un archivo .env con esta variable.`
    );
  }
  return url;
}

// Exportar la URL base del backend para uso en endpoints REST
export function getBackendBaseUrl(): string {
  return getBackendUrl();
}

/** @deprecated usa getBackendBaseUrl() */
export const backendUrl = import.meta.env.BACKEND_URL ?? import.meta.env.PUBLIC_BACKEND_URL ?? '';

function getGraphqlEndpoint(): string {
  return `${getBackendUrl()}/graphql`;
}

function getClient(): GraphQLClient {
  return new GraphQLClient(getGraphqlEndpoint());
}

// Crear cliente GraphQL (lazy - solo se instancia al usarse)
export const graphqlClient = new Proxy({} as GraphQLClient, {
  get(_target, prop) {
    return getClient()[prop as keyof GraphQLClient];
  },
});

/**
 * Helper para hacer queries GraphQL con tipos
 *
 * Ejemplo de uso en un archivo .astro:
 *
 * ```astro
 * ---
 * import { query } from '@/lib/graphql';
 * import { gql } from 'graphql-request';
 *
 * const GET_PRODUCTS = gql`
 *   query GetProducts {
 *     products {
 *       id
 *       name
 *       price
 *     }
 *   }
 * `;
 *
 * const data = await query(GET_PRODUCTS);
 * ---
 * ```
 */
export async function query<T = any>(
  query: string,
  variables?: Record<string, any>,
  jwt?: string
): Promise<T> {
  try {
    const endpoint = getGraphqlEndpoint();
    if (jwt) {
      const authenticatedClient = new GraphQLClient(endpoint, {
        headers: { 'Authorization': `Bearer ${jwt}` },
      });
      return await authenticatedClient.request<T>(query, variables);
    }
    return await getClient().request<T>(query, variables);
  } catch (error) {
    console.error('Error en GraphQL query:', error);
    throw error;
  }
}

/**
 * Helper para hacer mutations GraphQL con tipos
 *
 * Ejemplo de uso:
 *
 * ```astro
 * ---
 * import { mutation } from '@/lib/graphql';
 * import { gql } from 'graphql-request';
 *
 * const CREATE_ORDER = gql`
 *   mutation CreateOrder($input: OrderInput!) {
 *     createOrder(input: $input) {
 *       id
 *       status
 *     }
 *   }
 * `;
 *
 * const result = await mutation(CREATE_ORDER, { input: { ... } });
 * ---
 * ```
 */
export async function mutation<T = any>(
  mutation: string,
  variables?: Record<string, any>
): Promise<T> {
  try {
    return await getClient().request<T>(mutation, variables);
  } catch (error) {
    console.error('Error en GraphQL mutation:', error);
    throw error;
  }
}
