/**
 * Types para el feature de BusinessTypeConfig
 */

// ==================== GRADIENT CONFIG ====================

export interface GradientConfig {
  darkColor: string;
  mediumColor: string;
  lightColor: string;
  veryLightColor: string;
  overlayColor: string;
}

export interface GradientConfigInput {
  darkColor: string;
  mediumColor: string;
  lightColor: string;
  veryLightColor: string;
  overlayColor: string;
}

// ==================== CAMERA CONFIG ====================

export interface CameraConfig {
  positionX: number;
  positionY: number;
  positionZ: number;
  eulerX?: number;
  eulerY?: number;
  eulerZ?: number;
}

export interface CameraConfigInput {
  positionX: number;
  positionY: number;
  positionZ: number;
  eulerX?: number;
  eulerY?: number;
  eulerZ?: number;
}

// ==================== FEATURE ====================

export interface Feature {
  icon: string;
  title: string;
  subtitle: string;
  sortOrder: number;
}

export interface FeatureInput {
  icon: string;
  title: string;
  subtitle: string;
  sortOrder: number;
}

// ==================== BUSINESS TYPE CONFIG ====================

export interface BusinessTypeConfig {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  model3dFileName: string;
  model3dUrl?: string;
  model3dPresignedUrl?: string;
  model3dVersion: number;
  gradient: GradientConfig;
  camera: CameraConfig;
  glowColor: string;
  features: Feature[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== INPUT TYPES ====================

export interface CreateBusinessTypeConfigInput {
  key: string;
  name: string;
  description: string;
  icon: string;
  model3dFileName: string;
  model3dUrl?: string;
  gradient: GradientConfigInput;
  camera: CameraConfigInput;
  glowColor: string;
  features: FeatureInput[];
  sortOrder: number;
  pushTitle?: string;
  pushBody?: string;
}

export interface UpdateBusinessTypeConfigInput {
  name?: string;
  description?: string;
  icon?: string;
  model3dFileName?: string;
  model3dUrl?: string;
  model3dVersion?: number;
  gradient?: GradientConfigInput;
  camera?: CameraConfigInput;
  glowColor?: string;
  features?: FeatureInput[];
  sortOrder?: number;
  isActive?: boolean;
}

// ==================== UPLOAD RESPONSE ====================

export interface UploadModel3dResponse {
  model_path: string;
  model_url: string;
}
