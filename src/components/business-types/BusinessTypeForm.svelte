<script lang="ts">
  import { onMount } from "svelte";
  import {
    uploadBusinessTypeModel3d,
    createBusinessTypeConfig,
    updateBusinessTypeConfig,
  } from "@/lib/business-type";
  import type {
    BusinessTypeConfig,
    Feature,
    GradientConfigInput,
    CameraConfigInput,
  } from "@/lib/business-type";

  interface Props {
    jwt: string;
    onSaved: (config: BusinessTypeConfig) => void;
    businessType?: BusinessTypeConfig | null;
  }

  let { jwt, onSaved, businessType = null }: Props = $props();

  // Form fields - Basic
  let key = $state("");
  let name = $state("");
  let description = $state("");
  let icon = $state("");
  let glowColor = $state("#FFFFFF");
  let sortOrder = $state<number>(0);
  let isActive = $state(true);

  // Model 3D
  let model3dFileName = $state("");
  let model3dFile = $state<File | null>(null);
  let model3dPreview = $state("");

  // Gradient
  let gradientDarkColor = $state("#000000");
  let gradientMediumColor = $state("#333333");
  let gradientLightColor = $state("#666666");
  let gradientVeryLightColor = $state("#999999");
  let gradientOverlayColor = $state("#FFFFFF");

  // Camera
  let cameraPositionX = $state<number>(0);
  let cameraPositionY = $state<number>(0);
  let cameraPositionZ = $state<number>(5);
  let cameraEulerX = $state<number | undefined>(undefined);
  let cameraEulerY = $state<number | undefined>(undefined);
  let cameraEulerZ = $state<number | undefined>(undefined);

  // Features
  let features = $state<Feature[]>([]);

  // Push notifications (solo para crear)
  let pushTitle = $state("");
  let pushBody = $state("");

  // UI State
  let isSubmitting = $state(false);
  let successMessage = $state("");
  let errorMessage = $state("");
  let isDragging = $state(false);
  let fileInputRef: HTMLInputElement;

  let isEditMode = $derived(businessType !== null);

  // Initialize form with businessType data if in edit mode
  $effect(() => {
    if (businessType) {
      key = businessType.key;
      name = businessType.name;
      description = businessType.description;
      icon = businessType.icon;
      glowColor = businessType.glowColor;
      sortOrder = businessType.sortOrder;
      isActive = businessType.isActive;
      model3dFileName = businessType.model3dFileName;
      
      if (businessType.model3dPresignedUrl) {
        model3dPreview = businessType.model3dPresignedUrl;
      }

      // Gradient
      gradientDarkColor = businessType.gradient.darkColor;
      gradientMediumColor = businessType.gradient.mediumColor;
      gradientLightColor = businessType.gradient.lightColor;
      gradientVeryLightColor = businessType.gradient.veryLightColor;
      gradientOverlayColor = businessType.gradient.overlayColor;

      // Camera
      cameraPositionX = businessType.camera.positionX;
      cameraPositionY = businessType.camera.positionY;
      cameraPositionZ = businessType.camera.positionZ;
      cameraEulerX = businessType.camera.eulerX;
      cameraEulerY = businessType.camera.eulerY;
      cameraEulerZ = businessType.camera.eulerZ;

      // Features
      features = [...businessType.features];
    }
  });

  function handleFileSelect(file: File) {
    const validExtensions = [".usdz", ".glb"];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    
    if (!validExtensions.includes(ext)) {
      errorMessage = "Solo se permiten archivos .usdz o .glb";
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      errorMessage = "El archivo debe ser menor a 50MB";
      return;
    }

    errorMessage = "";
    model3dFile = file;
    model3dFileName = file.name;
    model3dPreview = file.name;
  }

  function handleInputChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) handleFileSelect(file);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    const file = e.dataTransfer?.files[0];
    if (file) handleFileSelect(file);
  }

  function removeModel() {
    model3dFile = null;
    model3dPreview = "";
    model3dFileName = "";
    if (fileInputRef) fileInputRef.value = "";
  }

  function triggerFileInput() {
    fileInputRef?.click();
  }

  function addFeature() {
    features = [...features, { icon: "", title: "", subtitle: "", sortOrder: features.length }];
  }

  function removeFeature(index: number) {
    features = features.filter((_, i) => i !== index);
    // Reorder sortOrder
    features = features.map((f, i) => ({ ...f, sortOrder: i }));
  }

  function updateFeature(index: number, field: keyof Feature, value: string | number) {
    features = features.map((f, i) => (i === index ? { ...f, [field]: value } : f));
  }

  function resetForm() {
    key = "";
    name = "";
    description = "";
    icon = "";
    glowColor = "#FFFFFF";
    sortOrder = 0;
    isActive = true;
    model3dFileName = "";
    model3dFile = null;
    model3dPreview = "";
    gradientDarkColor = "#000000";
    gradientMediumColor = "#333333";
    gradientLightColor = "#666666";
    gradientVeryLightColor = "#999999";
    gradientOverlayColor = "#FFFFFF";
    cameraPositionX = 0;
    cameraPositionY = 0;
    cameraPositionZ = 5;
    cameraEulerX = undefined;
    cameraEulerY = undefined;
    cameraEulerZ = undefined;
    features = [];
    pushTitle = "";
    pushBody = "";
    errorMessage = "";
    if (fileInputRef) fileInputRef.value = "";
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (!isEditMode && !model3dFile) {
      errorMessage = "Por favor selecciona un modelo 3D";
      return;
    }

    isSubmitting = true;
    errorMessage = "";
    successMessage = "";

    try {
      let model3dUrl = businessType?.model3dUrl;

      // Si hay un nuevo archivo, subirlo primero
      if (model3dFile) {
        const uploadResponse = await uploadBusinessTypeModel3d(model3dFile, jwt);
        model3dUrl = uploadResponse.model_path;
      }

      const gradient: GradientConfigInput = {
        darkColor: gradientDarkColor,
        mediumColor: gradientMediumColor,
        lightColor: gradientLightColor,
        veryLightColor: gradientVeryLightColor,
        overlayColor: gradientOverlayColor,
      };

      const camera: CameraConfigInput = {
        positionX: cameraPositionX,
        positionY: cameraPositionY,
        positionZ: cameraPositionZ,
        eulerX: cameraEulerX,
        eulerY: cameraEulerY,
        eulerZ: cameraEulerZ,
      };

      if (isEditMode && businessType) {
        const updateInput = {
          name,
          description,
          icon,
          model3dFileName,
          ...(model3dUrl && { model3dUrl }),
          gradient,
          camera,
          glowColor,
          features,
          sortOrder,
          isActive,
        };

        const updated = await updateBusinessTypeConfig(businessType.id, updateInput, jwt);
        onSaved(updated);
        successMessage = "BusinessType actualizado correctamente";
      } else {
        const createInput = {
          key,
          name,
          description,
          icon,
          model3dFileName,
          model3dUrl,
          gradient,
          camera,
          glowColor,
          features,
          sortOrder,
          ...(pushTitle && { pushTitle }),
          ...(pushBody && { pushBody }),
        };

        const created = await createBusinessTypeConfig(createInput, jwt);
        onSaved(created);
        successMessage = "BusinessType creado correctamente";
        resetForm();
      }

      setTimeout(() => {
        successMessage = "";
      }, 3000);
    } catch (error) {
      console.error("Error al guardar BusinessType:", error);
      errorMessage = error instanceof Error ? error.message : "Error al guardar";
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="bt-form-container">
  <div class="bt-form-header">
    <div class="bt-form-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        {#if isEditMode}
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        {:else}
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        {/if}
      </svg>
    </div>
    <div>
      <h2 class="bt-form-title">{isEditMode ? "Editar BusinessType" : "Crear BusinessType"}</h2>
      <p class="bt-form-subtitle">{isEditMode ? "Modifica los datos" : "Completa los datos del nuevo tipo"}</p>
    </div>
  </div>

  {#if successMessage}
    <div class="bt-success-message">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {successMessage}
    </div>
  {/if}

  {#if errorMessage}
    <div class="bt-error-message">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {errorMessage}
    </div>
  {/if}

  <form class="bt-business-type-form" onsubmit={handleSubmit}>
    <!-- Basic Info Section -->
    <div class="bt-section">
      <h3 class="bt-section-title">Información Básica</h3>
      
      {#if !isEditMode}
        <div class="bt-form-group">
          <label for="bt-key">Key <span class="bt-required">*</span></label>
          <input type="text" id="bt-key" bind:value={key} placeholder="Ej: FARMACIA" required />
          <span class="bt-field-hint">Identificador único (no editable después)</span>
        </div>
      {/if}

      <div class="bt-form-group">
        <label for="bt-name">Nombre <span class="bt-required">*</span></label>
        <input type="text" id="bt-name" bind:value={name} placeholder="Ej: Farmacias" required />
      </div>

      <div class="bt-form-group">
        <label for="bt-description">Descripción <span class="bt-required">*</span></label>
        <textarea id="bt-description" bind:value={description} placeholder="Describe este tipo de negocio..." rows="3" required></textarea>
      </div>

      <div class="bt-form-row">
        <div class="form-group flex-1">
          <label for="bt-icon">Icono <span class="bt-required">*</span></label>
          <input type="text" id="bt-icon" bind:value={icon} placeholder="Ej: 💊" required />
        </div>
        <div class="form-group flex-1">
          <label for="bt-sort">Orden</label>
          <input type="number" id="bt-sort" bind:value={sortOrder} min="0" />
        </div>
      </div>

      <div class="bt-form-group">
        <label for="bt-glow">Glow Color</label>
        <div class="bt-color-input-wrapper">
          <input type="color" id="bt-glow" bind:value={glowColor} />
          <input type="text" bind:value={glowColor} placeholder="#FFFFFF" />
        </div>
      </div>
    </div>

    <!-- Model 3D Section -->
    <div class="bt-section">
      <h3 class="bt-section-title">Modelo 3D</h3>
      
      <div class="bt-form-group">
        <label for="bt-model-name">Nombre del archivo <span class="bt-required">*</span></label>
        <input type="text" id="bt-model-name" bind:value={model3dFileName} placeholder="Ej: farmacia.usdz" required />
      </div>

      <div class="bt-form-group">
        <label>Archivo del modelo {#if !isEditMode}<span class="bt-required">*</span>{/if}</label>
        {#if isEditMode}
          <p class="bt-field-hint">Deja en blanco para mantener el modelo actual</p>
        {/if}
        <input type="file" accept=".usdz,.glb" bind:this={fileInputRef} onchange={handleInputChange} class="bt-file-input-hidden" />

        {#if model3dPreview}
          <div class="bt-file-preview-container">
            <div class="bt-file-preview">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              <span class="bt-file-name">{model3dFileName || model3dPreview}</span>
            </div>
            <button type="button" class="bt-remove-file-btn" onclick={removeModel}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Eliminar
            </button>
          </div>
        {:else}
          <button type="button" class="bt-upload-area" class:dragging={isDragging} ondragover={handleDragOver} ondragleave={handleDragLeave} ondrop={handleDrop} onclick={triggerFileInput}>
            <div class="bt-upload-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <span class="bt-upload-text">Arrastra un modelo 3D aquí</span>
            <span class="bt-upload-subtext">o haz clic para seleccionar</span>
            <span class="bt-upload-hint">.usdz, .glb hasta 50MB</span>
          </button>
        {/if}
      </div>
    </div>

    <!-- Gradient Section -->
    <div class="bt-section">
      <h3 class="bt-section-title">Gradiente</h3>
      <div class="bt-gradient-preview" style="background: linear-gradient(135deg, {gradientDarkColor}, {gradientMediumColor}, {gradientLightColor}, {gradientVeryLightColor})"></div>
      
      <div class="bt-form-row">
        <div class="form-group flex-1">
          <label>Dark Color</label>
          <div class="bt-color-input-wrapper">
            <input type="color" bind:value={gradientDarkColor} />
            <input type="text" bind:value={gradientDarkColor} />
          </div>
        </div>
        <div class="form-group flex-1">
          <label>Medium Color</label>
          <div class="bt-color-input-wrapper">
            <input type="color" bind:value={gradientMediumColor} />
            <input type="text" bind:value={gradientMediumColor} />
          </div>
        </div>
      </div>
      <div class="bt-form-row">
        <div class="form-group flex-1">
          <label>Light Color</label>
          <div class="bt-color-input-wrapper">
            <input type="color" bind:value={gradientLightColor} />
            <input type="text" bind:value={gradientLightColor} />
          </div>
        </div>
        <div class="form-group flex-1">
          <label>Very Light Color</label>
          <div class="bt-color-input-wrapper">
            <input type="color" bind:value={gradientVeryLightColor} />
            <input type="text" bind:value={gradientVeryLightColor} />
          </div>
        </div>
      </div>
      <div class="bt-form-group">
        <label>Overlay Color</label>
        <div class="bt-color-input-wrapper">
          <input type="color" bind:value={gradientOverlayColor} />
          <input type="text" bind:value={gradientOverlayColor} />
        </div>
      </div>
    </div>

    <!-- Camera Section -->
    <div class="bt-section">
      <h3 class="bt-section-title">Cámara</h3>
      <div class="bt-form-row">
        <div class="form-group flex-1">
          <label>Position X</label>
          <input type="number" bind:value={cameraPositionX} step="0.1" />
        </div>
        <div class="form-group flex-1">
          <label>Position Y</label>
          <input type="number" bind:value={cameraPositionY} step="0.1" />
        </div>
        <div class="form-group flex-1">
          <label>Position Z</label>
          <input type="number" bind:value={cameraPositionZ} step="0.1" />
        </div>
      </div>
      <div class="bt-form-row">
        <div class="form-group flex-1">
          <label>Euler X</label>
          <input type="number" bind:value={cameraEulerX} step="0.1" placeholder="Opcional" />
        </div>
        <div class="form-group flex-1">
          <label>Euler Y</label>
          <input type="number" bind:value={cameraEulerY} step="0.1" placeholder="Opcional" />
        </div>
        <div class="form-group flex-1">
          <label>Euler Z</label>
          <input type="number" bind:value={cameraEulerZ} step="0.1" placeholder="Opcional" />
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="bt-section">
      <h3 class="bt-section-title">Features</h3>
      
      {#each features as feature, index}
        <div class="bt-feature-item">
          <div class="bt-feature-header">
            <span class="bt-feature-number">#{index + 1}</span>
            <button type="button" class="bt-remove-feature-btn" onclick={() => removeFeature(index)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div class="bt-form-row">
            <div class="form-group flex-1">
              <label>Icono</label>
              <input type="text" value={feature.icon} oninput={(e) => updateFeature(index, 'icon', (e.target as HTMLInputElement).value)} placeholder="Ej: ⭐" />
            </div>
            <div class="form-group flex-2">
              <label>Título</label>
              <input type="text" value={feature.title} oninput={(e) => updateFeature(index, 'title', (e.target as HTMLInputElement).value)} placeholder="Título del feature" />
            </div>
          </div>
          <div class="bt-form-group">
            <label>Subtítulo</label>
            <input type="text" value={feature.subtitle} oninput={(e) => updateFeature(index, 'subtitle', (e.target as HTMLInputElement).value)} placeholder="Descripción breve" />
          </div>
        </div>
      {/each}

      <button type="button" class="bt-add-feature-btn" onclick={addFeature}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Agregar Feature
      </button>
    </div>

    <!-- Push Notifications (solo crear) -->
    {#if !isEditMode}
      <div class="bt-section">
        <h3 class="bt-section-title">Push Notification (Opcional)</h3>
        <p class="bt-field-hint">Se enviará una notificación push al crear este tipo de negocio</p>
        
        <div class="bt-form-group">
          <label for="bt-push-title">Título</label>
          <input type="text" id="bt-push-title" bind:value={pushTitle} placeholder="Título de la notificación" />
        </div>
        <div class="bt-form-group">
          <label for="bt-push-body">Mensaje</label>
          <textarea id="bt-push-body" bind:value={pushBody} placeholder="Cuerpo de la notificación" rows="2"></textarea>
        </div>
      </div>
    {/if}

    <!-- Active Toggle (solo editar) -->
    {#if isEditMode}
      <div class="bt-form-group-toggle">
        <div class="bt-toggle-info">
          <label for="bt-active">Estado</label>
          <span class="bt-toggle-description">El tipo de negocio estará visible</span>
        </div>
        <label class="bt-toggle-switch">
          <input type="checkbox" id="bt-active" bind:checked={isActive} />
          <span class="bt-toggle-slider"></span>
        </label>
      </div>
    {/if}

    <!-- Submit Button -->
    <button type="submit" class="bt-submit-btn" disabled={isSubmitting}>
      {#if isSubmitting}
        <span class="bt-spinner"></span>
        {isEditMode ? "Guardando..." : "Creando..."}
      {:else}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          {#if isEditMode}
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          {:else}
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          {/if}
        </svg>
        {isEditMode ? "Guardar Cambios" : "Crear BusinessType"}
      {/if}
    </button>
  </form>
</div>


