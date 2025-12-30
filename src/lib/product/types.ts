/**
 * Types para el feature de productos
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  image?: string;
  category?: Category;
  categoryId?: string;
  stock?: number;
  currency?: string;
  weight?: string;
  availability?: boolean;
  branchId?: string;
  createdAt?: string;
  updatedAt?: string;
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

/**
 * Input para crear un producto
 * Se requiere al menos uno de: branchId o businessId
 */
export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  image: string; // Path de la imagen desde el upload
  branchId?: string;
  businessId?: string;
  currency?: string;
  weight?: string;
  categoryId?: string;
}

/**
 * Input para actualizar un producto
 */
export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  weight?: string;
  availability?: boolean;
  categoryId?: string;
  image?: string;
}

/**
 * Respuesta del endpoint de upload de imagen
 */
export interface UploadImageResponse {
  image_path: string;
  image_url: string;
}
