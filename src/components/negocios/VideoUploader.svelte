<script lang="ts">
  interface Props {
    endpoint: string;           // REST endpoint para upload (e.g., '/upload/tutorial/video')
    jwt: string;                // Token de autenticación
    label: string;              // Label del campo (e.g., 'Video del tutorial')
    currentVideoUrl?: string;   // URL del video existente (para edición)
    onUploadComplete: (videoPath: string, duration?: number) => void;  // Callback con el path y duración
    onError?: (error: string) => void;
    accept?: string;            // Tipos MIME aceptados
    maxSizeMB?: number;        // Tamaño máximo en MB
  }

  let {
    endpoint,
    jwt,
    label,
    currentVideoUrl = '',
    onUploadComplete,
    onError,
    accept = 'video/mp4,video/mov,video/avi,video/webm',
    maxSizeMB = 100
  }: Props = $props();

  import { backendUrl } from '@/lib/shared/graphql';

  // Internal state
  let videoFile = $state<File | null>(null);
  let videoPreview = $state('');
  let videoPath = $state('');
  let isUploading = $state(false);
  let isDragging = $state(false);
  let errorMessage = $state('');
  let videoName = $state('');
  let fileInputRef: HTMLInputElement;
  let uploadProgress = $state(0);
  let playbackError = $state('');

  // Allowed MIME types
  const ALLOWED_TYPES = accept.split(',').map(t => t.trim());
  const MAX_FILE_SIZE = maxSizeMB * 1024 * 1024;

  // Initialize with current video if provided
  $effect(() => {
    if (currentVideoUrl && !videoPreview && !videoFile) {
      videoPreview = currentVideoUrl;
    }
  });

  function validateFile(file: File): string | null {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Por favor selecciona un archivo de video válido (${ALLOWED_TYPES.join(', ')})`;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return `El video debe ser menor a ${maxSizeMB}MB`;
    }

    return null;
  }

  async function uploadVideo(file: File): Promise<void> {
    isUploading = true;
    errorMessage = '';
    uploadProgress = 0;

    try {
      const formData = new FormData();
      formData.append('video', file);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          uploadProgress = Math.round((e.loaded / e.total) * 100);
        }
      });

      const uploadPromise = new Promise<{video_path: string, video_url: string, duration?: number}>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Error al subir video: ${xhr.responseText}`));
          }
        };
        xhr.onerror = () => reject(new Error('Error de red al subir video'));
      });

      xhr.open('POST', `${backendUrl}${endpoint}`);
      xhr.setRequestHeader('Authorization', `Bearer ${jwt}`);
      xhr.send(formData);

      const data = await uploadPromise;
      videoPath = data.video_path;
      onUploadComplete(data.video_path, data.duration);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al subir el video';
      errorMessage = message;
      onError?.(message);
    } finally {
      isUploading = false;
      uploadProgress = 0;
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
    playbackError = '';
    videoFile = file;
    videoName = file.name;

    // Create preview URL
    videoPreview = URL.createObjectURL(file);

    // Upload immediately
    uploadVideo(file);
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

  function removeVideo() {
    if (videoPreview && videoFile) {
      URL.revokeObjectURL(videoPreview);
    }
    videoFile = null;
    videoPreview = '';
    videoPath = '';
    videoName = '';
    errorMessage = '';
    playbackError = '';
    uploadProgress = 0;
    if (fileInputRef) {
      fileInputRef.value = '';
    }
    // Notify parent that video was removed
    onUploadComplete('');
  }

  function triggerFileInput() {
    fileInputRef?.click();
  }

  function retryUpload() {
    if (videoFile) {
      uploadVideo(videoFile);
    }
  }

  function handleVideoPlaybackError(event: Event) {
    const video = event.currentTarget as HTMLVideoElement;
    const code = video.error?.code;

    const messageByCode: Record<number, string> = {
      1: 'La reproducción fue interrumpida por el navegador.',
      2: 'Error de red al cargar el video.',
      3: 'El formato o códec del video no es compatible.',
      4: 'No se pudo cargar la fuente del video.',
    };

    playbackError =
      (code && messageByCode[code]) ||
      'No se pudo reproducir este video. Prueba con MP4 (H.264 + AAC).';
  }

  function clearPlaybackError() {
    playbackError = '';
  }
</script>

<div class="video-uploader">
  <label class="uploader-label">{label}</label>

  <input
    type="file"
    accept={accept}
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
      {#if videoFile}
        <button type="button" class="retry-btn" onclick={retryUpload}>
          Reintentar
        </button>
      {/if}
    </div>
  {/if}

  {#if playbackError}
    <div class="error-message">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>{playbackError}</span>
    </div>
  {/if}

  {#if videoPreview}
    <div class="video-preview-container">
      <div class="video-preview">
        {#if isUploading}
          <div class="upload-overlay">
            <span class="spinner"></span>
            <span class="upload-progress-text">Subiendo... {uploadProgress}%</span>
            <div class="progress-bar">
              <div class="progress-fill" style="width: {uploadProgress}%"></div>
            </div>
          </div>
        {/if}
        <video
          src={videoPreview}
          controls
          playsinline
          preload="metadata"
          onerror={handleVideoPlaybackError}
          onloadeddata={clearPlaybackError}
        ></video>
      </div>
      <div class="video-info">
        <span class="video-name">{videoName || 'Video actual'}</span>
        <button type="button" class="remove-video-btn" onclick={removeVideo} disabled={isUploading}>
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
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      ondrop={handleDrop}
      onclick={triggerFileInput}
      disabled={isUploading}
    >
      {#if isUploading}
        <span class="spinner large"></span>
        <span class="upload-text">Subiendo video...</span>
        <span class="upload-subtext">{uploadProgress}%</span>
      {:else}
        <div class="upload-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <span class="upload-text">Arrastra un video aquí</span>
        <span class="upload-subtext">o haz clic para seleccionar</span>
        <span class="upload-hint">MP4, MOV, AVI, WebM hasta {maxSizeMB}MB</span>
      {/if}
    </button>
  {/if}
</div>

<style>
  .video-uploader {
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
    min-height: 200px;
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

  .video-preview-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .video-preview {
    position: relative;
    border-radius: var(--radius-xl);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.4);
  }

  .video-preview video {
    width: 100%;
    max-height: 300px;
    display: block;
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
    background: rgba(0, 0, 0, 0.8);
    z-index: 1;
  }

  .upload-progress-text {
    font-size: var(--font-size-sm);
    color: var(--color-text);
    font-weight: 600;
  }

  .progress-bar {
    width: 200px;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-secondary) 0%, var(--color-accent) 100%);
    transition: width 0.3s ease;
  }

  .video-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(255, 255, 255, 0.03);
    border-radius: var(--radius-md);
  }

  .video-name {
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 250px;
  }

  .remove-video-btn {
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

  .remove-video-btn:hover:not(:disabled) {
    background: rgba(255, 59, 48, 0.2);
  }

  .remove-video-btn:disabled {
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
