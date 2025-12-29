/**
 * Types para el feature de negocios y sucursales
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface CoordinatesType {
  type: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface Business {
  id: string;
  name: string;
  type: string;
  ownerId: string;
  globalRating: number;
  avatar?: string;
  coverImage?: string;
  description?: string;
  socialMedia?: Record<string, string>;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  avatarUrl?: string;
  coverUrl?: string;
}

export interface Branch {
  id: string;
  businessId: string;
  name: string;
  address?: string;
  coordinates: CoordinatesType;
  phone: string;
  schedule: Record<string, string>;
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
  type: string;
  avatar?: string;
  coverImage?: string;
  description?: string;
  socialMedia?: Record<string, string>;
  tags?: string[];
}

export interface RegisterBranchInput {
  name: string;
  coordinates: Coordinates;
  phone: string;
  schedule: Record<string, string>;
  address?: string;
  avatar?: string;
  coverImage?: string;
  deliveryRadius?: number;
  facilities?: string[];
}

export interface CreateBranchInput {
  businessId: string;
  name: string;
  coordinates: Coordinates;
  phone: string;
  schedule: Record<string, string>;
  address?: string;
  managerIds?: string[];
  avatar?: string;
  coverImage?: string;
  deliveryRadius?: number;
  facilities?: string[];
}

export interface UpdateBusinessInput {
  name?: string;
  type?: string;
  description?: string;
  socialMedia?: Record<string, string>;
  tags?: string[];
  isActive?: boolean;
  avatar?: string;
  coverImage?: string;
}

export interface UpdateBranchInput {
  name?: string;
  address?: string;
  phone?: string;
  schedule?: Record<string, string>;
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
  branches: Branch[];
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
