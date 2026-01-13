/**
 * API de BusinessTypeConfig - Funciones helper para queries y mutations
 */

import { query, mutation, backendUrl } from '@/lib/shared/graphql';
import { GET_BUSINESS_TYPE_CONFIGS } from './queries';
import {
  CREATE_BUSINESS_TYPE_CONFIG,
  UPDATE_BUSINESS_TYPE_CONFIG,
  DEACTIVATE_BUSINESS_TYPE_CONFIG,
  DELETE_BUSINESS_TYPE_CONFIG,
} from './mutations';
import type {
  BusinessTypeConfig,
  CreateBusinessTypeConfigInput,
  UpdateBusinessTypeConfigInput,
  UploadModel3dResponse,
} from './types';

// ==================== QUERIES ====================

/**
 * Obtiene todos los BusinessTypeConfigs
 * @param lastSyncAt - Fecha opcional para sincronización incremental
 * @param jwt - Token JWT de autenticación
 * @returns Lista de BusinessTypeConfigs
 */
export async function getBusinessTypeConfigs(lastSyncAt?: string, jwt?: string) {
  return query<{ businessTypeConfigs: BusinessTypeConfig[] }>(
    GET_BUSINESS_TYPE_CONFIGS,
    { lastSyncAt },
    jwt
  );
}

// ==================== MUTATIONS ====================

/**
 * Sube un modelo 3D para BusinessType al servidor
 * @param modelFile - Archivo de modelo (.usdz o .glb, máx 50MB)
 * @param jwt - Token JWT de autenticación
 * @returns Respuesta con model_path y model_url
 */
export async function uploadBusinessTypeModel3d(
  modelFile: File,
  jwt: string
): Promise<UploadModel3dResponse> {
  const formData = new FormData();
  formData.append('model', modelFile);

  const response = await fetch(`${backendUrl}/upload/business-type/model3d`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('No autorizado');
    }
    if (response.status === 413) {
      throw new Error('Archivo muy grande (máx 50MB)');
    }
    if (response.status === 415) {
      throw new Error('Tipo no permitido (solo .usdz, .glb)');
    }
    const error = await response.text();
    throw new Error(`Error al subir modelo 3D: ${error}`);
  }

  return response.json();
}

/**
 * Crea un nuevo BusinessTypeConfig
 * @param input - Datos del BusinessTypeConfig
 * @param jwt - Token JWT de autenticación
 * @returns BusinessTypeConfig creado
 */
export async function createBusinessTypeConfig(
  input: CreateBusinessTypeConfigInput,
  jwt: string
): Promise<BusinessTypeConfig> {
  const result = await mutation<{ createBusinessTypeConfig: BusinessTypeConfig }>(
    CREATE_BUSINESS_TYPE_CONFIG,
    { input, jwt }
  );
  return result.createBusinessTypeConfig;
}

/**
 * Actualiza un BusinessTypeConfig existente
 * @param id - ID del BusinessTypeConfig
 * @param input - Datos a actualizar
 * @param jwt - Token JWT de autenticación
 * @returns BusinessTypeConfig actualizado
 */
export async function updateBusinessTypeConfig(
  id: string,
  input: UpdateBusinessTypeConfigInput,
  jwt: string
): Promise<BusinessTypeConfig> {
  const result = await mutation<{ updateBusinessTypeConfig: BusinessTypeConfig }>(
    UPDATE_BUSINESS_TYPE_CONFIG,
    { id, input, jwt }
  );
  return result.updateBusinessTypeConfig;
}

/**
 * Desactiva (soft delete) un BusinessTypeConfig
 * @param id - ID del BusinessTypeConfig
 * @param jwt - Token JWT de autenticación
 * @returns BusinessTypeConfig desactivado
 */
export async function deactivateBusinessTypeConfig(
  id: string,
  jwt: string
): Promise<BusinessTypeConfig> {
  const result = await mutation<{ deactivateBusinessTypeConfig: BusinessTypeConfig }>(
    DEACTIVATE_BUSINESS_TYPE_CONFIG,
    { id, jwt }
  );
  return result.deactivateBusinessTypeConfig;
}

/**
 * Elimina (hard delete) un BusinessTypeConfig
 * @param id - ID del BusinessTypeConfig
 * @param jwt - Token JWT de autenticación
 * @returns true si se eliminó correctamente
 */
export async function deleteBusinessTypeConfig(
  id: string,
  jwt: string
): Promise<boolean> {
  const result = await mutation<{ deleteBusinessTypeConfig: boolean }>(
    DELETE_BUSINESS_TYPE_CONFIG,
    { id, jwt }
  );
  return result.deleteBusinessTypeConfig;
}

// ==================== EXPORTS ====================

export * from './types';
export * from './queries';
export * from './mutations';
