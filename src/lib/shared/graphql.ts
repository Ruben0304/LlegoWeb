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
const SERVER_BACKEND_URL = import.meta.env.BACKEND_URL;
const PUBLIC_BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL;
const BACKEND_URL = import.meta.env.SSR ? SERVER_BACKEND_URL : PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  const missingVar = import.meta.env.SSR ? 'BACKEND_URL' : 'PUBLIC_BACKEND_URL';
  throw new Error(
    `${missingVar} no está definida. Asegúrate de crear un archivo .env con esta variable.`
  );
}

// Exportar la URL base del backend para uso en endpoints REST
export const backendUrl = BACKEND_URL;

// URL del endpoint GraphQL (concatena /graphql a la URL base)
const GRAPHQL_ENDPOINT = `${BACKEND_URL}/graphql`;

// Crear cliente GraphQL
export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  // Opciones adicionales que puedes configurar:
  headers: {
    // Ejemplo: agregar headers de autenticación si es necesario
    // 'Authorization': `Bearer ${import.meta.env.API_TOKEN}`,
  },
  // timeout: 10000, // Timeout en ms
  // credentials: 'include', // Para enviar cookies
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
    // Si se proporciona un JWT, crear un cliente con headers de autenticación
    if (jwt) {
      const authenticatedClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });
      return await authenticatedClient.request<T>(query, variables);
    }

    return await graphqlClient.request<T>(query, variables);
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
    return await graphqlClient.request<T>(mutation, variables);
  } catch (error) {
    console.error('Error en GraphQL mutation:', error);
    throw error;
  }
}
