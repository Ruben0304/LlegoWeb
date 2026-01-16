/**
 * Types para el feature de negocios y sucursales
 */

// ==================== PAGINATION TYPES ====================

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
  totalCount: number;
}

export interface BranchEdge {
  node: Branch;
  cursor: string;
}

export interface BranchConnection {
  edges: BranchEdge[];
  pageInfo: PageInfo;
}

// ==================== COORDINATE TYPES ====================

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface CoordinatesType {
  type: string;
  coordinates: [number, number]; // [lng, lat]
}

// Enum para tipos de sucursal
export enum BranchTipo {
  RESTAURANTE = 'RESTAURANTE',
  DULCERIA = 'DULCERIA',
  TIENDA = 'TIENDA',
}

// Labels en español para los tipos de sucursal
export const BRANCH_TIPO_LABELS: Record<BranchTipo, string> = {
  [BranchTipo.RESTAURANTE]: 'Restaurante',
  [BranchTipo.DULCERIA]: 'Dulcería',
  [BranchTipo.TIENDA]: 'Tienda',
};

export interface Business {
  id: string;
  name: string;
  type?: string;  // Optional - backend BusinessType doesn't include this field
  ownerId?: string;
  globalRating?: number;
  avatar?: string;
  coverImage?: string;
  description?: string;
  socialMedia?: Record<string, string>;
  tags?: string[];
  isActive: boolean;
  createdAt?: string;
  avatarUrl?: string;
  coverUrl?: string;
}

export interface Branch {
  id: string;
  businessId: string;
  name: string;
  tipos: BranchTipo[];  // Array de tipos de sucursal (obligatorio)
  address?: string;
  coordinates: CoordinatesType;
  phone: string;
  schedule: Record<string, string | string[]>;  // Backend may return string or string[]
  managerIds: string[];
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  coverImage?: string;
  deliveryRadius?: number;
  facilities: string[];
  createdAt: string;
  avatarUrl?: string;
  coverUrl?: string;
}

// Input types para mutations
export interface CreateBusinessInput {
  name: string;
  avatar?: string;
  description?: string;
  socialMedia?: Record<string, string>;
  tags?: string[];
}

export interface RegisterBranchInput {
  name: string;
  tipos: BranchTipo[];  // Obligatorio al crear
  coordinates: Coordinates;
  phone: string;
  schedule: Record<string, string[]>;  // Backend expects array of time ranges
  address?: string;
  avatar?: string;
  coverImage?: string;
  deliveryRadius?: number;
  facilities?: string[];
}

export interface CreateBranchInput {
  businessId: string;
  name: string;
  tipos: BranchTipo[];  // Obligatorio al crear
  coordinates: Coordinates;
  phone: string;
  schedule: Record<string, string[]>;  // Backend expects array of time ranges
  address?: string;
  managerIds?: string[];
  avatar?: string;
  coverImage?: string;
  deliveryRadius?: number;
  facilities?: string[];
}

export interface UpdateBusinessInput {
  name?: string;
  description?: string;
  socialMedia?: Record<string, string>;
  tags?: string[];
  isActive?: boolean;
  avatar?: string;
}

export interface UpdateBranchInput {
  name?: string;
  tipos?: BranchTipo[];  // Opcional al actualizar
  address?: string;
  phone?: string;
  schedule?: Record<string, string[]>;  // Backend expects array of time ranges
  status?: 'active' | 'inactive' | 'pending';
  deliveryRadius?: number;
  facilities?: string[];
  managerIds?: string[];
  avatar?: string;
  coverImage?: string;
}

// Response types
export interface BusinessesResponse {
  businesses: Business[];
}

export interface BranchesResponse {
  branches: BranchConnection;
}

export interface BranchPaginationParams {
  first: number;
  after?: string;
}

/**
 * Respuesta del endpoint de upload de imagen
 */
export interface UploadImageResponse {
  image_path: string;
  image_url: string;
}

// Tipos de negocio disponibles
export const BUSINESS_TYPES = [
  { id: 'restaurant', label: 'Restaurante' },
  { id: 'store', label: 'Tienda' },
  { id: 'supermarket', label: 'Supermercado' },
  { id: 'pharmacy', label: 'Farmacia' },
  { id: 'bakery', label: 'Panadería' },
  { id: 'cafe', label: 'Cafetería' },
  { id: 'electronics', label: 'Electrónica' },
  { id: 'clothing', label: 'Ropa' },
  { id: 'services', label: 'Servicios' },
  { id: 'other', label: 'Otro' },
] as const;

export type BusinessType = typeof BUSINESS_TYPES[number]['id'];
