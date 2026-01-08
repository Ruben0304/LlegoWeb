/**
 * Types para el feature de productos
 */

// ==================== PAGINATION TYPES ====================

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
  totalCount: number;
}

export interface ProductEdge {
  node: Product;
  cursor: string;
}

export interface ProductConnection {
  edges: ProductEdge[];
  pageInfo: PageInfo;
}

// ==================== PRODUCT TYPES ====================

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
  products: ProductConnection;
}

export interface ProductFilters {
  branchId?: string;
  categoryId?: string;
  availableOnly?: boolean;
  branchTipo?: string;
  radiusKm?: number;
}

export interface ProductPaginationParams {
  first: number;
  after?: string;
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
