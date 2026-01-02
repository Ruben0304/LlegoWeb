# Design Document: Business & Branch Images and Location

## Overview

Esta funcionalidad extiende los formularios existentes de negocios y sucursales para incluir:
1. Upload de imágenes (avatar y portada) siguiendo el patrón establecido en ProductForm
2. Selector de ubicación con Google Maps para obtener coordenadas
3. Capacidad de editar negocios y sucursales existentes
4. Componente reutilizable de upload de imágenes

La implementación sigue los patrones existentes en el proyecto, utilizando Svelte 5 con runes, TypeScript, y la arquitectura de lib/ para lógica de negocio.

## Architecture

```mermaid
graph TB
    subgraph Components
        BP[BusinessPanel.svelte]
        BF[BusinessForm.svelte]
        BrF[BranchForm.svelte]
        IU[ImageUploader.svelte]
        LP[LocationPicker.svelte]
    end
    
    subgraph Lib
        BM[business/mutations.ts]
        BI[business/index.ts]
    end
    
    subgraph External
        REST[REST API - Upload]
        GQL[GraphQL API]
        GMAP[Google Maps API]
    end
    
    BP --> BF
    BP --> BrF
    BF --> IU
    BF --> BM
    BrF --> IU
    BrF --> LP
    BrF --> BM
    IU --> REST
    BF --> GQL
    BrF --> GQL
    LP --> GMAP


## Components and Interfaces

### ImageUploader Component

Componente reutilizable para upload de imágenes con drag & drop.

```typescript
// src/components/negocios/ImageUploader.svelte
interface ImageUploaderProps {
  endpoint: string;           // REST endpoint para upload (e.g., '/upload/business/avatar')
  jwt: string;                // Token de autenticación
  label: string;              // Label del campo (e.g., 'Avatar', 'Portada')
  currentImageUrl?: string;   // URL de imagen existente (para edición)
  aspectRatio?: 'square' | 'wide';  // 'square' para avatar, 'wide' para cover
  onUploadComplete: (imagePath: string) => void;  // Callback con el path
  onError?: (error: string) => void;
}

// Estado interno
interface ImageUploaderState {
  imageFile: File | null;
  imagePreview: string;
  imagePath: string;
  isUploading: boolean;
  isDragging: boolean;
  errorMessage: string;
}
```

### LocationPicker Component

Componente de mapa interactivo para seleccionar ubicación.

```typescript
// src/components/negocios/LocationPicker.svelte
interface LocationPickerProps {
  initialLat?: number;        // Latitud inicial (para edición)
  initialLng?: number;        // Longitud inicial (para edición)
  onLocationChange: (coords: { lat: number; lng: number }) => void;
}

interface LocationPickerState {
  map: google.maps.Map | null;
  marker: google.maps.Marker | null;
  lat: number;
  lng: number;
  isLoaded: boolean;
  error: string;
}
```

### Updated BusinessForm Props

```typescript
interface BusinessFormProps {
  jwt: string;
  business?: Business;        // Si se proporciona, modo edición
  onBusinessCreated: (business: Business) => void;
  onBusinessUpdated?: (business: Business) => void;
  onCancel?: () => void;
}
```

### Updated BranchForm Props

```typescript
interface BranchFormProps {
  jwt: string;
  business: Business;
  branch?: Branch;            // Si se proporciona, modo edición
  onBranchCreated: (branch: Branch) => void;
  onBranchUpdated?: (branch: Branch) => void;
  onCancel?: () => void;
}
```

## Data Models

### Upload Response (from REST API)

```typescript
interface UploadImageResponse {
  image_path: string;   // Path relativo para usar en GraphQL
  image_url: string;    // URL presignada para preview
}
```

### Business Upload Functions

```typescript
// src/lib/business/index.ts

async function uploadBusinessAvatar(
  imageFile: File,
  jwt: string
): Promise<UploadImageResponse>;

async function uploadBusinessCover(
  imageFile: File,
  jwt: string
): Promise<UploadImageResponse>;

async function uploadBranchAvatar(
  imageFile: File,
  jwt: string
): Promise<UploadImageResponse>;

async function uploadBranchCover(
  imageFile: File,
  jwt: string
): Promise<UploadImageResponse>;
```

### Environment Variables

```bash
# .env
PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Image Upload Returns Valid Path

*For any* valid image file (PNG, JPG, JPEG, GIF, WebP) under 5MB and valid JWT, uploading to any of the image endpoints SHALL return an object containing a non-empty `image_path` string.

**Validates: Requirements 1.1, 1.2, 2.1, 2.2**

### Property 2: Invalid File Type Rejection

*For any* file with a MIME type that is not an image type (not starting with 'image/'), the Image_Uploader SHALL reject the file before attempting upload.

**Validates: Requirements 2.4**

### Property 3: File Size Validation

*For any* file larger than 5MB (5 * 1024 * 1024 bytes), the Image_Uploader SHALL reject the file and not attempt upload.

**Validates: Requirements 1.4**

### Property 4: Form Submission Includes Image Paths

*For any* form submission where images have been uploaded, the GraphQL mutation variables SHALL include the `avatar` and/or `coverImage` fields with the corresponding `image_path` values.

**Validates: Requirements 1.3, 2.3**

### Property 5: Coordinate Updates from Map Interaction

*For any* click or marker drag event on the map with coordinates (lat, lng), the Location_Picker state SHALL update to reflect those exact coordinates, and the onLocationChange callback SHALL be invoked with those coordinates.

**Validates: Requirements 3.2, 3.3, 3.4**

### Property 6: Form Pre-population in Edit Mode

*For any* Business or Branch object passed to the form in edit mode, all form fields SHALL be initialized with the corresponding values from that object, including existing image URLs displayed as previews.

**Validates: Requirements 4.1, 4.2, 5.1, 5.2**

### Property 7: Map Initialization with Existing Coordinates

*For any* Branch with existing coordinates, when editing, the Location_Picker SHALL center the map on those coordinates and display a marker at that position.

**Validates: Requirements 5.3**

### Property 8: Update Mutation Contains Only Changed Fields

*For any* edit submission, the update mutation SHALL only include fields that differ from the original object values (excluding id and jwt).

**Validates: Requirements 4.4, 5.4**

### Property 9: List Updates After Creation

*For any* successful business or branch creation, the corresponding list in the parent component SHALL include the newly created item.

**Validates: Requirements 6.3, 6.4**

## Error Handling

### Image Upload Errors

| Error Condition | User Message | Recovery Action |
|----------------|--------------|-----------------|
| File too large (>5MB) | "La imagen debe ser menor a 5MB" | Allow retry with smaller file |
| Invalid file type | "Por favor selecciona un archivo de imagen válido" | Allow retry with valid type |
| Network error | "Error de conexión al subir imagen" | Show retry button |
| Server error (4xx/5xx) | "Error al subir imagen: {message}" | Show retry button |
| JWT expired | "Sesión expirada, por favor inicia sesión nuevamente" | Redirect to login |

### Google Maps Errors

| Error Condition | User Message | Recovery Action |
|----------------|--------------|-----------------|
| API key missing | "Configura PUBLIC_GOOGLE_MAPS_API_KEY en .env" | Show placeholder with instructions |
| API key invalid | "Error al cargar Google Maps. Verifica la API key." | Show placeholder |
| Network error | "No se pudo cargar el mapa. Verifica tu conexión." | Show retry button |

### Form Submission Errors

| Error Condition | User Message | Recovery Action |
|----------------|--------------|-----------------|
| GraphQL error | "{error.message}" | Keep form data, allow retry |
| Network error | "Error de conexión. Intenta nuevamente." | Keep form data, allow retry |
| Validation error | Show specific field errors | Highlight invalid fields |

## Testing Strategy

### Unit Tests

Los unit tests verificarán:
- Validación de tipo de archivo en ImageUploader
- Validación de tamaño de archivo en ImageUploader
- Parsing de coordenadas en LocationPicker
- Detección de campos cambiados para update mutations

### Property-Based Tests

Se utilizará **fast-check** como librería de property-based testing para TypeScript/JavaScript.

Configuración:
- Mínimo 100 iteraciones por test
- Cada test referenciará la propiedad del documento de diseño

Tests a implementar:
1. **Property 1**: Generar archivos de imagen válidos y verificar respuesta de upload
2. **Property 2**: Generar archivos con MIME types no-imagen y verificar rechazo
3. **Property 3**: Generar archivos de varios tamaños y verificar validación de 5MB
4. **Property 5**: Generar coordenadas aleatorias y verificar actualización de estado
5. **Property 6**: Generar objetos Business/Branch y verificar pre-población
6. **Property 8**: Generar pares de objetos (original, modificado) y verificar diff

### Integration Tests

- Flujo completo de crear negocio con imágenes
- Flujo completo de crear sucursal con imágenes y ubicación
- Flujo de edición de negocio existente
- Flujo de edición de sucursal existente
