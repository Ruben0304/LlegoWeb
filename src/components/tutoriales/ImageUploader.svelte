<script lang="ts">
  interface Props {
    endpoint: string;           // REST endpoint para upload (e.g., '/upload/business/avatar')
    jwt: string;                // Token de autenticación
    label: string;              // Label del campo (e.g., 'Avatar', 'Portada')
    currentImageUrl?: string;   // URL de imagen existente (para edición)
    aspectRatio?: 'square' | 'wide';  // 'square' para avatar, 'wide' para cover
    onUploadComplete: (imagePath: string) => void;  // Callback con el path
    onError?: (error: string) => void;
  }

  let { 
    endpoint, 
    jwt, 
    label, 
    currentImageUrl = '', 
    aspectRatio = 'square',
    onUploadComplete,
    onError
  }: Props = $props();

  import { backendUrl } from '@/lib/shared/graphql';

  // Internal state
  let imageFile = $state<File | null>(null);
  let imagePreview = $state('');
  let imagePath = $state('');
  let isUploading = $state(false);
  let isDragging = $state(false);
  let errorMessage = $state('');
  let imageName = $state('');
  let fileInputRef: HTMLInputElement;

  // Allowed MIME types
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Initialize with current image if provided
  $effect(() => {
    if (currentImageUrl && !imagePreview && !imageFile) {
      imagePreview = currentImageUrl;
    }
  });

  function validateFile(file: File): string | null {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Por favor selecciona un archivo de imagen válido (PNG, JPG, JPEG, GIF, WebP)';
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return 'La imagen debe ser menor a 5MB';
    }

    return null;
  }

  async function uploadImage(file: File): Promise<void> {
    isUploading = true;
    errorMessage = '';

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${backendUrl}${endpoint}`, {
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

      const data = await response.json();
      // Compatibilidad con distintos endpoints:
      // - /upload/.../image -> image_path
      // - /upload/tutorial/thumbnail -> thumbnail_path
      const uploadedPath = data.image_path || data.thumbnail_path || '';

      if (!uploadedPath) {
        throw new Error('El servidor no devolvió la ruta de la imagen');
      }

      imagePath = uploadedPath;
      onUploadComplete(uploadedPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al subir la imagen';
      errorMessage = message;
      onError?.(message);
    } finally {
      isUploading = false;
    }
  }

  function handleFileSelect(file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      errorMessage = validationError;
      onError?.(validationError);
      return;
    }

    errorMessage = '';
    imageFile = file;
    imageName = file.name;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      imagePreview = result;
    };
    reader.readAsDataURL(file);

    // Upload immediately
    uploadImage(file);
  }

  function handleInputChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
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
    if (file) {
      handleFileSelect(file);
    }
  }

  function removeImage() {
    imageFile = null;
    imagePreview = '';
    imagePath = '';
    imageName = '';
    errorMessage = '';
    if (fileInputRef) {
      fileInputRef.value = '';
    }
    // Notify parent that image was removed
    onUploadComplete('');
  }

  function triggerFileInput() {
    fileInputRef?.click();
  }

  function retryUpload() {
    if (imageFile) {
      uploadImage(imageFile);
    }
  }
</script>

<div class="image-uploader">
  <label class="uploader-label">{label}</label>
  
  <input
    type="file"
    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
    bind:this={fileInputRef}
    onchange={handleInputChange}
    class="file-input-hidden"
  />

  {#if errorMessage}
    <div class="error-message">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>{errorMessage}</span>
      {#if imageFile}
        <button type="button" class="retry-btn" onclick={retryUpload}>
          Reintentar
        </button>
      {/if}
    </div>
  {/if}

  {#if imagePreview}
    <div class="image-preview-container">
      <div class="image-preview" class:square={aspectRatio === 'square'} class:wide={aspectRatio === 'wide'}>
        {#if isUploading}
          <div class="upload-overlay">
            <span class="spinner"></span>
            <span class="upload-progress-text">Subiendo...</span>
          </div>
        {/if}
        <img src={imagePreview} alt="Vista previa" />
      </div>
      <div class="image-info">
        <span class="image-name">{imageName || 'Imagen actual'}</span>
        <button type="button" class="remove-image-btn" onclick={removeImage} disabled={isUploading}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Eliminar
        </button>
      </div>
    </div>
  {:else}
    <button
      type="button"
      class="upload-area"
      class:dragging={isDragging}
      class:square={aspectRatio === 'square'}
      class:wide={aspectRatio === 'wide'}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      ondrop={handleDrop}
      onclick={triggerFileInput}
      disabled={isUploading}
    >
      {#if isUploading}
        <span class="spinner large"></span>
        <span class="upload-text">Subiendo imagen...</span>
      {:else}
        <div class="upload-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <span class="upload-text">Arrastra una imagen aquí</span>
        <span class="upload-subtext">o haz clic para seleccionar</span>
        <span class="upload-hint">PNG, JPG, GIF, WebP hasta 5MB</span>
      {/if}
    </button>
  {/if}
</div>

<style>
  .image-uploader {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .uploader-label {
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text-variant);
  }

  .file-input-hidden {
    display: none;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(255, 59, 48, 0.1);
    border: 1px solid rgba(255, 59, 48, 0.3);
    border-radius: var(--radius-md);
    color: #ff6b6b;
    font-size: var(--font-size-sm);
    animation: slideIn 0.3s ease;
  }

  .error-message span {
    flex: 1;
  }

  .retry-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-xs);
    font-weight: 500;
    color: #ff6b6b;
    background: rgba(255, 59, 48, 0.15);
    border-radius: var(--radius-sm);
    transition: all var(--transition-base);
  }

  .retry-btn:hover {
    background: rgba(255, 59, 48, 0.25);
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .upload-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-2xl) var(--spacing-lg);
    background: rgba(255, 255, 255, 0.03);
    border: 2px dashed rgba(255, 255, 255, 0.15);
    border-radius: var(--radius-xl);
    cursor: pointer;
    transition: all var(--transition-base);
  }

  .upload-area.square {
    aspect-ratio: 1 / 1;
    max-width: 200px;
  }

  .upload-area.wide {
    aspect-ratio: 16 / 9;
  }

  .upload-area:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .upload-area.dragging {
    background: rgba(225, 199, 142, 0.1);
    border-color: var(--color-secondary);
    border-style: solid;
  }

  .upload-area:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .upload-icon {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
    color: var(--color-text-variant);
    transition: all var(--transition-base);
  }

  .upload-area:hover:not(:disabled) .upload-icon,
  .upload-area.dragging .upload-icon {
    background: rgba(225, 199, 142, 0.15);
    color: var(--color-secondary);
    transform: scale(1.05);
  }

  .upload-text {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-text);
  }

  .upload-subtext {
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
  }

  .upload-hint {
    font-size: var(--font-size-xs);
    color: rgba(255, 255, 255, 0.4);
    margin-top: var(--spacing-xs);
  }

  .image-preview-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .image-preview {
    position: relative;
    border-radius: var(--radius-xl);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .image-preview.square {
    aspect-ratio: 1 / 1;
    max-width: 200px;
  }

  .image-preview.wide {
    aspect-ratio: 16 / 9;
  }

  .image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .upload-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    background: rgba(0, 0, 0, 0.7);
    z-index: 1;
  }

  .upload-progress-text {
    font-size: var(--font-size-sm);
    color: var(--color-text);
  }

  .image-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(255, 255, 255, 0.03);
    border-radius: var(--radius-md);
  }

  .image-name {
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }

  .remove-image-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-xs);
    font-weight: 500;
    color: #ff6b6b;
    background: rgba(255, 59, 48, 0.1);
    border-radius: var(--radius-md);
    transition: all var(--transition-base);
  }

  .remove-image-btn:hover:not(:disabled) {
    background: rgba(255, 59, 48, 0.2);
  }

  .remove-image-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .spinner.large {
    width: 32px;
    height: 32px;
    border-width: 3px;
    color: var(--color-secondary);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
