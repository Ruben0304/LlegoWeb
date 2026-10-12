import { ClientError, GraphQLClient } from 'graphql-request';

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
  // En el servidor también se mira process.env: si BACKEND_URL no existía al
  // compilar, Astro deja import.meta.env.BACKEND_URL vacío para siempre.
  const url = import.meta.env.SSR
    ? import.meta.env.BACKEND_URL || process.env.BACKEND_URL
    : import.meta.env.PUBLIC_BACKEND_URL;
  if (!url) {
    const missingVar = import.meta.env.SSR ? 'BACKEND_URL' : 'PUBLIC_BACKEND_URL';
    throw new Error(
      `${missingVar} no está definida. Asegúrate de crear un archivo .env con esta variable.`
    );
  }
  // La variable es la URL base (sin /graphql). Si alguien la configura con
  // /graphql o con barra final se tolera, para no acabar en /graphql/graphql.
  return url.trim().replace(/\/+$/, '').replace(/\/graphql$/, '');
}

// Exportar la URL base del backend para uso en endpoints REST
export function getBackendBaseUrl(): string {
  return getBackendUrl();
}

/** @deprecated usa getBackendBaseUrl() */
export const backendUrl = import.meta.env.BACKEND_URL ?? import.meta.env.PUBLIC_BACKEND_URL ?? '';

/**
 * Resumen de un error GraphQL para la consola, sin la petición: el ClientError
 * de graphql-request la incluye entera (variables con el JWT o el token de
 * Google).
 */
export function describeGraphqlError(error: unknown): string {
  if (error instanceof ClientError) {
    const messages = error.response.errors?.map((e) => e.message).join(' | ');
    return `HTTP ${error.response.status}${messages ? `: ${messages}` : ''}`;
  }
  return error instanceof Error ? error.message : String(error);
}

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
    console.error('Error en GraphQL query:', describeGraphqlError(error));
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
  variables?: Record<string, any>,
  headers?: Record<string, string>
): Promise<T> {
  try {
    if (headers && Object.keys(headers).length > 0) {
      return await new GraphQLClient(getGraphqlEndpoint(), { headers }).request<T>(mutation, variables);
    }
    return await getClient().request<T>(mutation, variables);
  } catch (error) {
    console.error('Error en GraphQL mutation:', describeGraphqlError(error));
    throw error;
  }
}
