/**
 * API de productos - Funciones helper para queries y mutations
 */

import { query, mutation, backendUrl } from '@/lib/shared/graphql';
import { GET_PRODUCTS, GET_PRODUCT_BY_ID, GET_CATEGORIES, GET_PRODUCT_CATEGORIES, GET_PRODUCT_CATEGORY, SEARCH_PRODUCTS } from './queries';
import { CREATE_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT, UPDATE_PRODUCT_STOCK } from './mutations';
import type {
  Product,
  ProductsResponse,
  ProductFilters,
  ProductPaginationParams,
  ProductConnection,
  Category,
  ProductCategory,
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

// Legacy function - to be removed
export async function getCategories() {
  return query<{ categories: Category[] }>(GET_CATEGORIES);
}

/**
 * Obtiene las categorías de productos
 * @param branchType - Tipo de negocio (opcional): "restaurante", "dulceria", "tienda"
 * @param jwt - Token JWT de autenticación (opcional)
 * @returns Lista de categorías de productos
 */
export async function getProductCategories(branchType?: string, jwt?: string) {
  const normalizedBranchType = branchType ? branchType.toLowerCase() : branchType;
  return query<{ productCategories: ProductCategory[] }>(GET_PRODUCT_CATEGORIES, { branchType: normalizedBranchType }, jwt);
}

/**
 * Obtiene una categoría de producto por ID
 * @param id - ID de la categoría
 * @returns Categoría de producto
 */
export async function getProductCategory(id: string) {
  return query<{ productCategory: ProductCategory }>(GET_PRODUCT_CATEGORY, { id });
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

export async function updateProduct(productId: string, input: UpdateProductInput, jwt?: string) {
  const result = await mutation<{ updateProduct: Product }>(UPDATE_PRODUCT, { productId, input, jwt });
  return result.updateProduct;
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
