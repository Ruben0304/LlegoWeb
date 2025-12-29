/**
 * Types para el feature de productos
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: Category;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  gradient?: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  inStock?: boolean;
}
