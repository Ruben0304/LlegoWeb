<script lang="ts">
  interface Props {
    imagePreview?: string;
    onImageSelect: (file: File, preview: string) => void;
    onImageRemove: () => void;
  }

  let { imagePreview = '', onImageSelect, onImageRemove }: Props = $props();

  let isDragging = $state(false);
  let errorMessage = $state('');
  let fileInputRef: HTMLInputElement;

  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Formato inválido. Usa PNG, JPG, GIF o WebP';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'La imagen debe ser menor a 5MB';
    }
    return null;
  }

  function handleFileSelect(file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      errorMessage = validationError;
      setTimeout(() => errorMessage = '', 3000);
      return;
    }

    errorMessage = '';

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      onImageSelect(file, preview);
    };
    reader.readAsDataURL(file);
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

  function triggerFileInput() {
    fileInputRef?.click();
  }
</script>

<div class="draft-image-uploader">
  <input
    type="file"
    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
    bind:this={fileInputRef}
    onchange={handleInputChange}
    class="file-input-hidden"
  />

  {#if errorMessage}
    <div class="error-message">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>{errorMessage}</span>
    </div>
  {/if}

  {#if imagePreview}
    <div class="preview-container">
      <img src={imagePreview} alt="Preview" class="preview-image" />
      <button type="button" class="remove-preview-btn" onclick={onImageRemove}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  {:else}
    <button
      type="button"
      class="drop-zone"
      class:dragging={isDragging}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      ondrop={handleDrop}
      onclick={triggerFileInput}
    >
      <div class="drop-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
      <span class="drop-text">Arrastra aquí o haz clic</span>
      <span class="drop-hint">PNG, JPG, GIF, WebP (máx. 5MB)</span>
    </button>
  {/if}
</div>

<style>
  .draft-image-uploader {
    width: 100%;
  }

  .file-input-hidden {
    display: none;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: rgba(255, 59, 48, 0.1);
    border: 1px solid rgba(255, 59, 48, 0.3);
    border-radius: var(--radius-md);
    color: #ff6b6b;
    font-size: var(--font-size-xs);
    margin-bottom: var(--spacing-xs);
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .drop-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
    width: 100%;
    padding: var(--spacing-lg);
    background: rgba(255, 255, 255, 0.03);
    border: 2px dashed rgba(255, 255, 255, 0.15);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-base);
  }

  .drop-zone:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .drop-zone.dragging {
    background: rgba(225, 199, 142, 0.1);
    border-color: var(--color-secondary);
    border-style: solid;
  }

  .drop-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
    color: var(--color-text-variant);
    transition: all var(--transition-base);
  }

  .drop-zone:hover .drop-icon,
  .drop-zone.dragging .drop-icon {
    background: rgba(225, 199, 142, 0.15);
    color: var(--color-secondary);
    transform: scale(1.05);
  }

  .drop-text {
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text);
  }

  .drop-hint {
    font-size: var(--font-size-xs);
    color: rgba(255, 255, 255, 0.4);
  }

  .preview-container {
    position: relative;
    width: 100%;
    height: 120px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .remove-preview-btn {
    position: absolute;
    top: var(--spacing-xs);
    right: var(--spacing-xs);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    border-radius: 50%;
    backdrop-filter: blur(4px);
    transition: all var(--transition-base);
  }

  .remove-preview-btn:hover {
    background: rgba(255, 59, 48, 0.8);
    transform: scale(1.1);
  }
</style>
