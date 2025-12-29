/**
 * ARCHIVO DE EJEMPLO - Cómo usar el cliente GraphQL
 *
 * Este archivo muestra ejemplos de cómo realizar queries y mutations
 * desde diferentes contextos en Astro.
 */

import { query, mutation } from '@/lib/graphql';
import { gql } from 'graphql-request';

// ====================
// DEFINIR QUERIES
// ====================

const GET_PRODUCTS = gql`
  query GetProducts($limit: Int, $offset: Int) {
    products(limit: $limit, offset: $offset) {
      id
      name
      price
      description
      imageUrl
    }
  }
`;

const GET_PRODUCT_BY_ID = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      price
      description
      imageUrl
      category {
        id
        name
      }
    }
  }
`;

// ====================
// DEFINIR MUTATIONS
// ====================

const CREATE_ORDER = gql`
  mutation CreateOrder($input: OrderInput!) {
    createOrder(input: $input) {
      id
      status
      total
      createdAt
    }
  }
`;

// ====================
// FUNCIONES DE EJEMPLO
// ====================

/**
 * Ejemplo 1: Obtener lista de productos
 */
export async function getProducts(limit = 10, offset = 0) {
  try {
    const data = await query(GET_PRODUCTS, { limit, offset });
    return data;
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    throw error;
  }
}

/**
 * Ejemplo 2: Obtener un producto específico
 */
export async function getProductById(id: string) {
  try {
    const data = await query(GET_PRODUCT_BY_ID, { id });
    return data;
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    throw error;
  }
}

/**
 * Ejemplo 3: Crear una orden
 */
export async function createOrder(orderInput: any) {
  try {
    const data = await mutation(CREATE_ORDER, { input: orderInput });
    return data;
  } catch (error) {
    console.error('Error creando orden:', error);
    throw error;
  }
}

// ====================
// USO EN ARCHIVOS .ASTRO
// ====================

/**
 * EJEMPLO en src/pages/productos.astro:
 *
 * ---
 * import Layout from '@/layouts/Layout.astro';
 * import { getProducts } from '@/lib/graphql-example';
 *
 * // Esta llamada se ejecuta en el servidor durante el build
 * // o en cada request si usas SSR
 * const productos = await getProducts(20, 0);
 * ---
 *
 * <Layout title="Productos">
 *   <div class="products-grid">
 *     {productos.products.map((producto) => (
 *       <div class="product-card">
 *         <img src={producto.imageUrl} alt={producto.name} />
 *         <h3>{producto.name}</h3>
 *         <p>{producto.price}</p>
 *       </div>
 *     ))}
 *   </div>
 * </Layout>
 */

// ====================
// USO EN API ROUTES
// ====================

/**
 * EJEMPLO en src/pages/api/products/[id].ts:
 *
 * import type { APIRoute } from 'astro';
 * import { getProductById } from '@/lib/graphql-example';
 *
 * export const GET: APIRoute = async ({ params }) => {
 *   try {
 *     const product = await getProductById(params.id!);
 *     return new Response(JSON.stringify(product), {
 *       status: 200,
 *       headers: { 'Content-Type': 'application/json' }
 *     });
 *   } catch (error) {
 *     return new Response(JSON.stringify({ error: 'Product not found' }), {
 *       status: 404,
 *       headers: { 'Content-Type': 'application/json' }
 *     });
 *   }
 * };
 */

// ====================
// TIPOS TYPESCRIPT (OPCIONAL)
// ====================

/**
 * Puedes definir tipos para tus datos GraphQL:
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category?: {
    id: string;
    name: string;
  };
}

export interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
}

/**
 * Y usarlos con genéricos en las funciones:
 */
export async function getProductsTyped(limit = 10, offset = 0) {
  const data = await query<{ products: Product[] }>(GET_PRODUCTS, {
    limit,
    offset,
  });
  return data.products;
}
