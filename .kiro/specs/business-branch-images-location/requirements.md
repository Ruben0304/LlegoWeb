# Requirements Document

## Introduction

Esta funcionalidad extiende los formularios de negocios y sucursales para incluir soporte completo de imágenes (avatar y portada) siguiendo el patrón existente de productos, además de integrar Google Maps para seleccionar ubicaciones y obtener coordenadas automáticamente.

## Glossary

- **Business_Form**: Componente de formulario para crear y editar negocios
- **Branch_Form**: Componente de formulario para crear y editar sucursales
- **Image_Uploader**: Componente reutilizable para subir imágenes con drag & drop
- **Location_Picker**: Componente de mapa interactivo para seleccionar ubicación
- **Avatar**: Imagen de perfil cuadrada del negocio o sucursal
- **Cover_Image**: Imagen de portada rectangular del negocio o sucursal
- **Coordinates**: Par de valores latitud/longitud que representan una ubicación geográfica

## Requirements

### Requirement 1: Upload de Imágenes para Negocios

**User Story:** Como dueño de negocio, quiero poder agregar una imagen de avatar y una imagen de portada a mi negocio, para que los clientes puedan identificarlo visualmente.

#### Acceptance Criteria

1. WHEN a user selects an avatar image for a business, THE Business_Form SHALL upload the image to the REST endpoint `/upload/business/avatar` and receive an `image_path`
2. WHEN a user selects a cover image for a business, THE Business_Form SHALL upload the image to the REST endpoint `/upload/business/cover` and receive an `image_path`
3. WHEN the business is submitted, THE Business_Form SHALL include the `image_path` values in the GraphQL mutation
4. WHEN an image file exceeds 5MB, THE Image_Uploader SHALL reject the file and display an error message
5. WHEN a user drags an image over the upload area, THE Image_Uploader SHALL provide visual feedback indicating the drop zone is active
6. WHEN an image is selected, THE Image_Uploader SHALL display a preview of the image with option to remove it

### Requirement 2: Upload de Imágenes para Sucursales

**User Story:** Como dueño de negocio, quiero poder agregar una imagen de avatar y una imagen de portada a cada sucursal, para diferenciarlas visualmente.

#### Acceptance Criteria

1. WHEN a user selects an avatar image for a branch, THE Branch_Form SHALL upload the image to the REST endpoint `/upload/branch/avatar` and receive an `image_path`
2. WHEN a user selects a cover image for a branch, THE Branch_Form SHALL upload the image to the REST endpoint `/upload/branch/cover` and receive an `image_path`
3. WHEN the branch is submitted, THE Branch_Form SHALL include the `image_path` values in the GraphQL mutation
4. THE Image_Uploader SHALL accept only image file types (PNG, JPG, JPEG, GIF, WebP)

### Requirement 3: Selección de Ubicación con Google Maps

**User Story:** Como dueño de negocio, quiero poder seleccionar la ubicación de mi sucursal en un mapa interactivo, para que los clientes puedan encontrarla fácilmente.

#### Acceptance Criteria

1. WHEN the Branch_Form loads, THE Location_Picker SHALL display a Google Maps component
2. WHEN a user clicks on the map, THE Location_Picker SHALL place a marker at that location and update the coordinates
3. WHEN a user drags the marker, THE Location_Picker SHALL update the coordinates to the new position
4. WHEN coordinates are updated, THE Location_Picker SHALL display the latitude and longitude values
5. WHEN the branch is submitted, THE Branch_Form SHALL include the selected coordinates in the GraphQL mutation
6. IF the Google Maps API key is not configured, THEN THE Location_Picker SHALL display an error message indicating configuration is required

### Requirement 4: Edición de Negocios Existentes

**User Story:** Como dueño de negocio, quiero poder editar la información de mis negocios existentes, incluyendo imágenes, para mantener los datos actualizados.

#### Acceptance Criteria

1. WHEN editing a business, THE Business_Form SHALL pre-populate all fields with existing data
2. WHEN editing a business with existing images, THE Business_Form SHALL display the current images as previews
3. WHEN a user changes an image during edit, THE Business_Form SHALL upload the new image and update the `image_path`
4. WHEN the edit is submitted, THE Business_Form SHALL call the `updateBusiness` mutation with only the changed fields

### Requirement 5: Edición de Sucursales Existentes

**User Story:** Como dueño de negocio, quiero poder editar la información de mis sucursales existentes, incluyendo imágenes y ubicación, para mantener los datos actualizados.

#### Acceptance Criteria

1. WHEN editing a branch, THE Branch_Form SHALL pre-populate all fields with existing data
2. WHEN editing a branch with existing images, THE Branch_Form SHALL display the current images as previews
3. WHEN editing a branch with existing coordinates, THE Location_Picker SHALL center the map on those coordinates and display the marker
4. WHEN the edit is submitted, THE Branch_Form SHALL call the `updateBranch` mutation with only the changed fields

### Requirement 6: Creación de Múltiples Negocios y Sucursales

**User Story:** Como dueño de múltiples negocios, quiero poder crear nuevos negocios y agregar sucursales adicionales a cada uno.

#### Acceptance Criteria

1. WHEN a user has existing businesses, THE Business_Panel SHALL display an option to create a new business
2. WHEN viewing a business, THE Business_Panel SHALL display an option to add a new branch
3. WHEN a new business is created successfully, THE Business_Panel SHALL update the list to include the new business
4. WHEN a new branch is created successfully, THE Business_Panel SHALL update the branch list for that business

### Requirement 7: Configuración de Google Maps API

**User Story:** Como desarrollador, quiero poder configurar la API key de Google Maps mediante variables de entorno, para habilitar la funcionalidad de mapas.

#### Acceptance Criteria

1. THE system SHALL read the Google Maps API key from the environment variable `PUBLIC_GOOGLE_MAPS_API_KEY`
2. WHEN the API key is present, THE Location_Picker SHALL load the Google Maps JavaScript API
3. IF the API key is missing or invalid, THEN THE Location_Picker SHALL display a placeholder with instructions

### Requirement 8: Componente Reutilizable de Upload de Imágenes

**User Story:** Como desarrollador, quiero un componente reutilizable para upload de imágenes, para mantener consistencia en toda la aplicación.

#### Acceptance Criteria

1. THE Image_Uploader SHALL accept props for: endpoint URL, label, current image URL, and onChange callback
2. THE Image_Uploader SHALL support drag and drop functionality
3. THE Image_Uploader SHALL support click to select file
4. WHEN an upload fails, THE Image_Uploader SHALL display the error message and allow retry
5. WHILE an upload is in progress, THE Image_Uploader SHALL display a loading indicator
