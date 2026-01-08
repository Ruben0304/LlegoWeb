/**
 * API de productos - Funciones helper para queries y mutations
 */

import { query, mutation, backendUrl } from '@/lib/shared/graphql';
import { GET_PRODUCTS, GET_PRODUCT_BY_ID, GET_CATEGORIES, SEARCH_PRODUCTS } from './queries';
import { CREATE_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT, UPDATE_PRODUCT_STOCK } from './mutations';
import type {
  Product,
  ProductsResponse,
  ProductFilters,
  Category,
  CreateProductInput,
  UpdateProductInput,
  UploadImageResponse
} from './types';

// ==================== QUERIES ====================

export async function getProducts(
  filters: ProductFilters = {},
  pagination: ProductPaginationParams = { first: 20 }
) {
  const variables = {
    ...pagination,
    ...filters,
    availableOnly: filters.availableOnly ?? true,
  };

  return query<ProductsResponse>(GET_PRODUCTS, variables);
}

export async function getProductById(id: string) {
  return query<{ product: Product }>(GET_PRODUCT_BY_ID, { id });
}

export async function getCategories() {
  return query<{ categories: Category[] }>(GET_CATEGORIES);
}

export async function searchProducts(
  searchQuery: string,
  pagination: ProductPaginationParams = { first: 20 },
  options: {
    useVectorSearch?: boolean;
    branchTipo?: string;
    radiusKm?: number;
    jwt?: string;
  } = {}
) {
  const variables = {
    query: searchQuery,
    ...pagination,
    useVectorSearch: options.useVectorSearch ?? true,
    branchTipo: options.branchTipo,
    radiusKm: options.radiusKm,
    jwt: options.jwt,
  };

  return query<{ searchProducts: ProductConnection }>(SEARCH_PRODUCTS, variables);
}

// ==================== MUTATIONS ====================

/**
 * Sube una imagen de producto al servidor
 * @param imageFile - Archivo de imagen (File object)
 * @param jwt - Token JWT de autenticación
 * @returns Respuesta con image_path e image_url
 */
export async function uploadProductImage(
  imageFile: File,
  jwt: string
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${backendUrl}/upload/product/image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error al subir imagen: ${error}`);
  }

  return response.json();
}

/**
 * Crea un nuevo producto
 * @param input - Datos del producto
 * @param jwt - Token JWT de autenticación
 * @returns Producto creado
 */
export async function createProduct(
  input: CreateProductInput,
  jwt: string
): Promise<Product> {
  const result = await mutation<{ createProduct: Product }>(CREATE_PRODUCT, { input, jwt });
  return result.createProduct;
}

export async function updateProduct(id: string, input: UpdateProductInput, jwt?: string) {
  return mutation<{ updateProduct: Product }>(UPDATE_PRODUCT, { id, input, jwt });
}

export async function deleteProduct(id: string) {
  return mutation<{ deleteProduct: { success: boolean; message: string } }>(
    DELETE_PRODUCT,
    { id }
  );
}

export async function updateProductStock(id: string, stock: number) {
  return mutation<{ updateProductStock: Product }>(UPDATE_PRODUCT_STOCK, { id, stock });
}

// ==================== EXPORTS ====================

export * from './types';
export * from './queries';
export * from './mutations';
