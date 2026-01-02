# Implementation Plan: Business & Branch Images and Location

## Overview

Implementación de upload de imágenes y selector de ubicación para negocios y sucursales, siguiendo el patrón existente de ProductForm.

## Tasks

- [x] 1. Configurar variable de entorno para Google Maps
  - Agregar `PUBLIC_GOOGLE_MAPS_API_KEY` a `.env.example`
  - Documentar en el archivo la necesidad de obtener una API key de Google Cloud Console
  - _Requirements: 7.1_

- [x] 2. Crear funciones de upload de imágenes en lib/business
  - [x] 2.1 Implementar funciones de upload en `src/lib/business/index.ts`
    - Crear `uploadBusinessAvatar(imageFile, jwt)`
    - Crear `uploadBusinessCover(imageFile, jwt)`
    - Crear `uploadBranchAvatar(imageFile, jwt)`
    - Crear `uploadBranchCover(imageFile, jwt)`
    - Seguir el patrón de `uploadProductImage` en lib/product
    - _Requirements: 1.1, 1.2, 2.1, 2.2_

  - [ ]* 2.2 Write property test for image upload functions
    - **Property 1: Image Upload Returns Valid Path**
    - **Validates: Requirements 1.1, 1.2, 2.1, 2.2**

- [x] 3. Crear componente ImageUploader reutilizable
  - [x] 3.1 Crear `src/components/negocios/ImageUploader.svelte`
    - Implementar props: endpoint, jwt, label, currentImageUrl, aspectRatio, onUploadComplete, onError
    - Implementar drag & drop con visual feedback
    - Implementar click para seleccionar archivo
    - Implementar preview de imagen con opción de eliminar
    - Implementar validación de tipo de archivo (solo imágenes)
    - Implementar validación de tamaño (máx 5MB)
    - Implementar estados de loading y error
    - Estilos consistentes con ProductForm
    - _Requirements: 1.4, 1.5, 1.6, 2.4, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 3.2 Write property test for file validation
    - **Property 2: Invalid File Type Rejection**
    - **Property 3: File Size Validation**
    - **Validates: Requirements 1.4, 2.4**

- [x] 4. Crear componente LocationPicker con Google Maps
  - [x] 4.1 Crear `src/components/negocios/LocationPicker.svelte`
    - Implementar carga dinámica de Google Maps API
    - Implementar props: initialLat, initialLng, onLocationChange
    - Implementar mapa interactivo con marker draggable
    - Implementar click en mapa para posicionar marker
    - Mostrar coordenadas actuales (lat, lng)
    - Manejar caso de API key faltante con mensaje de error
    - Estilos consistentes con el resto de la aplicación
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 7.2, 7.3_

  - [ ]* 4.2 Write property test for coordinate updates
    - **Property 5: Coordinate Updates from Map Interaction**
    - **Validates: Requirements 3.2, 3.3, 3.4**

- [ ] 5. Checkpoint - Verificar componentes base
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Actualizar BusinessForm con soporte de imágenes y edición
  - [x] 6.1 Modificar `src/components/negocios/BusinessForm.svelte`
    - Agregar prop opcional `business` para modo edición
    - Agregar prop `onBusinessUpdated` para callback de edición
    - Integrar ImageUploader para avatar
    - Integrar ImageUploader para cover/portada
    - Pre-poblar campos cuando `business` está presente
    - Mostrar imágenes existentes como preview en modo edición
    - Llamar `registerBusiness` o `updateBusiness` según el modo
    - Incluir image_path en las mutations
    - _Requirements: 1.3, 4.1, 4.2, 4.3, 4.4_

  - [ ]* 6.2 Write property test for form pre-population
    - **Property 6: Form Pre-population in Edit Mode**
    - **Validates: Requirements 4.1, 4.2**

- [x] 7. Actualizar BranchForm con soporte de imágenes, ubicación y edición
  - [x] 7.1 Modificar `src/components/negocios/BranchForm.svelte`
    - Agregar prop opcional `branch` para modo edición
    - Agregar prop `onBranchUpdated` para callback de edición
    - Integrar ImageUploader para avatar
    - Integrar ImageUploader para cover/portada
    - Integrar LocationPicker para selección de coordenadas
    - Pre-poblar campos cuando `branch` está presente
    - Mostrar imágenes existentes como preview en modo edición
    - Centrar mapa en coordenadas existentes en modo edición
    - Llamar `createBranch` o `updateBranch` según el modo
    - Incluir image_path y coordinates en las mutations
    - _Requirements: 2.3, 3.5, 5.1, 5.2, 5.3, 5.4_

  - [ ]* 7.2 Write property test for map initialization
    - **Property 7: Map Initialization with Existing Coordinates**
    - **Validates: Requirements 5.3**

- [ ] 8. Checkpoint - Verificar formularios actualizados
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Actualizar BusinessPanel para soportar edición
  - [x] 9.1 Modificar `src/components/negocios/BusinessPanel.svelte`
    - Agregar botón de editar en la vista de negocio seleccionado
    - Agregar botón de editar en la vista de sucursal seleccionada
    - Pasar business/branch existente a los formularios en modo edición
    - Manejar callbacks de actualización
    - Actualizar listas después de crear/editar
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 9.2 Write property test for list updates
    - **Property 9: List Updates After Creation**
    - **Validates: Requirements 6.3, 6.4**

- [x] 10. Actualizar exports en index.ts
  - Agregar ImageUploader y LocationPicker a `src/components/negocios/index.ts`
  - Agregar funciones de upload a exports de `src/lib/business/index.ts`
  - _Requirements: N/A (housekeeping)_

- [x] 11. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.
  - Verificar flujo completo de crear negocio con imágenes
  - Verificar flujo completo de crear sucursal con imágenes y ubicación
  - Verificar flujo de edición de negocio
  - Verificar flujo de edición de sucursal

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- El patrón de upload sigue exactamente el de ProductForm: subir imagen primero, obtener path, luego enviar con GraphQL
