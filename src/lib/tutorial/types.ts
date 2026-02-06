/**
 * Types para el feature de tutoriales
 */

// ==================== TUTORIAL TYPES ====================

export enum AppTarget {
  CUSTOMER = "CUSTOMER",
  MERCHANT = "MERCHANT",
  BOTH = "BOTH"
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  videoUrl: string;         // Path del video en S3 (sin firma)
  videoUrlSigned?: string;  // URL firmada para visualización
  duration: number;         // Duración en segundos
  appTarget: AppTarget;     // Para qué app es el tutorial
  thumbnailUrl?: string;    // Path de la miniatura (sin firma)
  thumbnailUrlSigned?: string; // URL firmada de la miniatura
  order: number;            // Orden de visualización
  isActive: boolean;        // Estado activo/inactivo
  tags: string[];           // Tags para categorización
  createdAt: string;
  updatedAt: string;
}

// ==================== INPUT TYPES ====================

/**
 * Input para crear un tutorial
 */
export interface CreateTutorialInput {
  title: string;
  description: string;
  videoUrl: string;         // Path del video desde el upload
  duration: number;         // Duración en segundos
  appTarget: AppTarget;
  thumbnailUrl?: string;    // Path de la miniatura desde el upload
  order?: number;
  tags?: string[];
}

/**
 * Input para actualizar un tutorial
 */
export interface UpdateTutorialInput {
  title?: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  appTarget?: AppTarget;
  thumbnailUrl?: string;
  order?: number;
  tags?: string[];
}

// ==================== RESPONSE TYPES ====================

/**
 * Respuesta del endpoint de upload de video
 */
export interface UploadVideoResponse {
  video_path: string;
  video_url: string;
}

/**
 * Respuesta del endpoint de upload de thumbnail
 */
export interface UploadThumbnailResponse {
  thumbnail_path: string;
  thumbnail_url: string;
}

/**
 * Respuesta de queries que retornan tutoriales
 */
export interface TutorialsResponse {
  tutorials: Tutorial[];
}

export interface ActiveTutorialsResponse {
  activeTutorials: Tutorial[];
}

export interface TutorialsByAppResponse {
  tutorialsByApp: Tutorial[];
}

export interface TutorialResponse {
  tutorial: Tutorial;
}

export interface SearchTutorialsResponse {
  searchTutorials: Tutorial[];
}

export interface TutorialsByTagsResponse {
  tutorialsByTags: Tutorial[];
}

// ==================== MUTATION RESPONSE TYPES ====================

export interface CreateTutorialResponse {
  createTutorial: Tutorial;
}

export interface UpdateTutorialResponse {
  updateTutorial: Tutorial;
}

export interface DeleteTutorialResponse {
  deleteTutorial: {
    success: boolean;
    message: string;
  };
}

export interface ToggleTutorialActiveResponse {
  toggleTutorialActive: Tutorial;
}
