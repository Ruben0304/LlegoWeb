/**
 * API de productos - Funciones helper para queries y mutations
 */

import { query, mutation } from '@/lib/shared/graphql';
import { GET_PRODUCTS, GET_PRODUCT_BY_ID, GET_CATEGORIES, SEARCH_PRODUCTS } from './queries';
import { CREATE_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT, UPDATE_PRODUCT_STOCK } from './mutations';
import type { Product, ProductsResponse, ProductFilters, Category } from './types';

// ==================== QUERIES ====================

export async function getProducts(
  filters: ProductFilters = {},
  pagination = { limit: 20, offset: 0 }
) {
  const variables = {
    ...pagination,
    ...filters,
  };

  return query<ProductsResponse>(GET_PRODUCTS, variables);
}

export async function getProductById(id: string) {
  return query<{ product: Product }>(GET_PRODUCT_BY_ID, { id });
}

export async function getCategories() {
  return query<{ categories: Category[] }>(GET_CATEGORIES);
}

export async function searchProducts(searchTerm: string, limit = 10) {
  return query<{ searchProducts: Product[] }>(SEARCH_PRODUCTS, { searchTerm, limit });
}

// ==================== MUTATIONS ====================

export async function createProduct(input: Partial<Product>) {
  return mutation<{ createProduct: Product }>(CREATE_PRODUCT, { input });
}

export async function updateProduct(id: string, input: Partial<Product>) {
  return mutation<{ updateProduct: Product }>(UPDATE_PRODUCT, { id, input });
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
