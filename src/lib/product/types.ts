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
  category?: ProductCategory;
  categoryId?: string;
  stock?: number;
  currency?: string;
  weight?: string;
  availability?: boolean;
  branchId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductCategory {
  id: string;
  branchType: string; // "restaurante", "dulceria", "tienda"
  name: string;
  iconIos: string;
  iconWeb: string;
  iconAndroid: string;
  createdAt?: string;
}

// Legacy Category interface - to be removed after full migration
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

// ==================== BULK DETECTION TYPES ====================

/**
 * Producto detectado por IA desde una imagen de menú o vitrina
 */
export interface DetectedProduct {
  name: string;
  description: string;
  price: number;
  currency: string;
  weight: string;
}

/**
 * Respuesta de los endpoints de detección de productos
 */
export interface DetectedProductList {
  products: DetectedProduct[];
}

/**
 * Producto borrador con estado local para edición y foto
 */
export interface DraftProduct extends DetectedProduct {
  _id: string; // ID temporal local
  _imageFile?: File | null; // Foto seleccionada
  _imagePreview?: string; // Preview de la foto
  _expanded: boolean; // Si está expandido en la lista
  _status: "pending" | "uploading" | "creating" | "done" | "error";
  _error?: string;
  categoryId?: string;
}
