/**
 * API de tutoriales - Funciones helper para queries y mutations
 */

import { query, mutation, backendUrl } from '@/lib/shared/graphql';
import {
  GET_TUTORIALS,
  GET_ACTIVE_TUTORIALS,
  GET_TUTORIALS_BY_APP,
  GET_TUTORIAL,
  SEARCH_TUTORIALS,
  GET_TUTORIALS_BY_TAGS
} from './queries';
import {
  CREATE_TUTORIAL,
  UPDATE_TUTORIAL,
  DELETE_TUTORIAL,
  TOGGLE_TUTORIAL_ACTIVE
} from './mutations';
import type {
  Tutorial,
  AppTarget,
  CreateTutorialInput,
  UpdateTutorialInput,
  TutorialsResponse,
  ActiveTutorialsResponse,
  TutorialsByAppResponse,
  TutorialResponse,
  SearchTutorialsResponse,
  TutorialsByTagsResponse,
  CreateTutorialResponse,
  UpdateTutorialResponse,
  DeleteTutorialResponse,
  ToggleTutorialActiveResponse,
  UploadVideoResponse,
  UploadThumbnailResponse
} from './types';

// ==================== QUERIES ====================

/**
 * Obtiene todos los tutoriales
 */
export async function getTutorials(jwt?: string): Promise<Tutorial[]> {
  const result = await query<TutorialsResponse>(GET_TUTORIALS, {}, jwt);
  return result.tutorials;
}

/**
 * Obtiene solo los tutoriales activos
 */
export async function getActiveTutorials(jwt?: string): Promise<Tutorial[]> {
  const result = await query<ActiveTutorialsResponse>(GET_ACTIVE_TUTORIALS, {}, jwt);
  return result.activeTutorials;
}

/**
 * Obtiene tutoriales por app target
 * @param appTarget - App target (CUSTOMER, MERCHANT, BOTH)
 */
export async function getTutorialsByApp(appTarget: AppTarget, jwt?: string): Promise<Tutorial[]> {
  const result = await query<TutorialsByAppResponse>(GET_TUTORIALS_BY_APP, { appTarget }, jwt);
  return result.tutorialsByApp;
}

/**
 * Obtiene un tutorial por ID
 * @param id - ID del tutorial
 */
export async function getTutorial(id: string, jwt?: string): Promise<Tutorial> {
  const result = await query<TutorialResponse>(GET_TUTORIAL, { id }, jwt);
  return result.tutorial;
}

/**
 * Busca tutoriales por query (título, descripción o tags)
 * @param searchQuery - Texto a buscar
 */
export async function searchTutorials(searchQuery: string, jwt?: string): Promise<Tutorial[]> {
  const result = await query<SearchTutorialsResponse>(SEARCH_TUTORIALS, { query: searchQuery }, jwt);
  return result.searchTutorials;
}

/**
 * Obtiene tutoriales por tags
 * @param tags - Array de tags a buscar
 */
export async function getTutorialsByTags(tags: string[], jwt?: string): Promise<Tutorial[]> {
  const result = await query<TutorialsByTagsResponse>(GET_TUTORIALS_BY_TAGS, { tags }, jwt);
  return result.tutorialsByTags;
}

// ==================== MUTATIONS ====================

/**
 * Sube un video de tutorial al servidor
 * @param videoFile - Archivo de video (File object)
 * @param jwt - Token JWT de autenticación
 * @returns Respuesta con video_path y video_url
 */
export async function uploadTutorialVideo(
  videoFile: File,
  jwt: string
): Promise<UploadVideoResponse> {
  const formData = new FormData();
  formData.append('video', videoFile);

  const response = await fetch(`${backendUrl}/upload/tutorial/video`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error al subir video: ${error}`);
  }

  return response.json();
}

/**
 * Sube una miniatura de tutorial al servidor
 * @param thumbnailFile - Archivo de imagen (File object)
 * @param jwt - Token JWT de autenticación
 * @returns Respuesta con thumbnail_path y thumbnail_url
 */
export async function uploadTutorialThumbnail(
  thumbnailFile: File,
  jwt: string
): Promise<UploadThumbnailResponse> {
  const formData = new FormData();
  formData.append('thumbnail', thumbnailFile);

  const response = await fetch(`${backendUrl}/upload/tutorial/thumbnail`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error al subir miniatura: ${error}`);
  }

  return response.json();
}

/**
 * Crea un nuevo tutorial
 * @param input - Datos del tutorial
 * @param jwt - Token JWT de autenticación
 * @returns Tutorial creado
 */
export async function createTutorial(
  input: CreateTutorialInput,
  jwt: string
): Promise<Tutorial> {
  const result = await mutation<CreateTutorialResponse>(CREATE_TUTORIAL, { input, jwt });
  return result.createTutorial;
}

/**
 * Actualiza un tutorial existente
 * @param tutorialId - ID del tutorial
 * @param input - Datos a actualizar
 * @param jwt - Token JWT de autenticación
 * @returns Tutorial actualizado
 */
export async function updateTutorial(
  tutorialId: string,
  input: UpdateTutorialInput,
  jwt: string
): Promise<Tutorial> {
  const result = await mutation<UpdateTutorialResponse>(UPDATE_TUTORIAL, {
    id: tutorialId,
    input,
    jwt,
  });
  return result.updateTutorial;
}

/**
 * Elimina un tutorial
 * @param tutorialId - ID del tutorial
 * @param jwt - Token JWT de autenticación
 */
export async function deleteTutorial(
  tutorialId: string,
  jwt: string
): Promise<{ success: boolean; message: string }> {
  const result = await mutation<DeleteTutorialResponse>(DELETE_TUTORIAL, { tutorialId, jwt });
  return result.deleteTutorial;
}

/**
 * Activa/desactiva un tutorial
 * @param tutorialId - ID del tutorial
 * @param jwt - Token JWT de autenticación
 * @returns Tutorial actualizado
 */
export async function toggleTutorialActive(
  tutorialId: string,
  jwt: string
): Promise<Tutorial> {
  const result = await mutation<ToggleTutorialActiveResponse>(TOGGLE_TUTORIAL_ACTIVE, { tutorialId, jwt });
  return result.toggleTutorialActive;
}

// ==================== EXPORTS ====================

export * from './types';
export * from './queries';
export * from './mutations';
