/**
 * Business feature exports
 * API de negocios y sucursales - Funciones helper para queries y mutations
 */

import { backendUrl } from '@/lib/shared/graphql';
import type { UploadImageResponse } from './types';

// ==================== IMAGE UPLOAD FUNCTIONS ====================

/**
 * Sube una imagen de avatar para un negocio
 * @param imageFile - Archivo de imagen (File object)
 * @param jwt - Token JWT de autenticación
 * @returns Respuesta con image_path e image_url
 */
export async function uploadBusinessAvatar(
  imageFile: File,
  jwt: string
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${backendUrl}/upload/business/avatar`, {
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
 * Sube una imagen de portada para un negocio
 * @param imageFile - Archivo de imagen (File object)
 * @param jwt - Token JWT de autenticación
 * @returns Respuesta con image_path e image_url
 */
export async function uploadBusinessCover(
  imageFile: File,
  jwt: string
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${backendUrl}/upload/business/cover`, {
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
 * Sube una imagen de avatar para una sucursal
 * @param imageFile - Archivo de imagen (File object)
 * @param jwt - Token JWT de autenticación
 * @returns Respuesta con image_path e image_url
 */
export async function uploadBranchAvatar(
  imageFile: File,
  jwt: string
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${backendUrl}/upload/branch/avatar`, {
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
 * Sube una imagen de portada para una sucursal
 * @param imageFile - Archivo de imagen (File object)
 * @param jwt - Token JWT de autenticación
 * @returns Respuesta con image_path e image_url
 */
export async function uploadBranchCover(
  imageFile: File,
  jwt: string
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${backendUrl}/upload/branch/cover`, {
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

// ==================== EXPORTS ====================

export * from './types';
export * from './queries';
export * from './mutations';
