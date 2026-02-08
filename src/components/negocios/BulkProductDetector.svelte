<script lang="ts">
  import {
    detectFromMenu,
    detectFromShowcase,
  } from "@/lib/product";
  import type { DetectedProduct } from "@/lib/product";

  interface Props {
    jwt: string;
    onProductsDetected: (products: DetectedProduct[]) => void;
  }

  let { jwt, onProductsDetected }: Props = $props();

  type DetectionMode = "menu" | "showcase";

  let mode = $state<DetectionMode>("menu");
  let imageFile = $state<File | null>(null);
  let imagePreview = $state("");
  let isDetecting = $state(false);
  let errorMessage = $state("");
  let isDragging = $state(false);
  let fileInputRef: HTMLInputElement;

  function handleFileSelect(file: File) {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      errorMessage = "Solo se permiten imágenes JPEG, PNG o WebP";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      errorMessage = "La imagen debe ser menor a 10MB";
      return;
    }

    errorMessage = "";
    imageFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
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

  function removeImage() {
    imageFile = null;
    imagePreview = "";
    if (fileInputRef) fileInputRef.value = "";
  }

  function triggerFileInput() {
    fileInputRef?.click();
  }

  async function handleDetect() {
    if (!imageFile) {
      errorMessage = "Selecciona una imagen primero";
      return;
    }

    isDetecting = true;
    errorMessage = "";

    try {
      const detectFn = mode === "menu" ? detectFromMenu : detectFromShowcase;
      const result = await detectFn(imageFile, jwt);

      if (!result.products || result.products.length === 0) {
        errorMessage = "No se detectaron productos en la imagen. Intenta con otra foto.";
        return;
      }

      onProductsDetected(result.products);
    } catch (error) {
      console.error("Error detecting products:", error);
      errorMessage = error instanceof Error ? error.message : "Error al analizar la imagen";
    } finally {
      isDetecting = false;
    }
  }
</script>

<div class="bulk-detector">
  <div class="detector-header">
    <div class="detector-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    </div>
    <div>
      <h3 class="detector-title">Cargar productos con IA</h3>
      <p class="detector-subtitle">Sube una foto y detectaremos los productos automáticamente</p>
    </div>
  </div>

  <!-- Mode selector -->
  <div class="mode-selector">
    <button
      type="button"
      class="mode-btn"
      class:active={mode === "menu"}
      onclick={() => (mode = "menu")}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
      Cargar Menú
    </button>
    <button
      type="button"
      class="mode-btn"
      class:active={mode === "showcase"}
      onclick={() => (mode = "showcase")}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
      Cargar Vitrina
    </button>
  </div>

  <p class="mode-hint">
    {#if mode === "menu"}
      Sube una foto de un menú impreso o digital con nombres y precios
    {:else}
      Sube una foto de una vitrina, estante o exhibidor de productos
    {/if}
  </p>

  {#if errorMessage}
    <div class="error-message">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {errorMessage}
    </div>
  {/if}

  <!-- Image upload -->
  <input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    bind:this={fileInputRef}
    onchange={handleInputChange}
    class="file-input-hidden"
  />

  {#if imagePreview}
    <div class="image-preview-container">
      <div class="image-preview">
        <img src={imagePreview} alt="Imagen a analizar" />
      </div>
      <div class="image-actions">
        <button type="button" class="remove-image-btn" onclick={removeImage}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Cambiar imagen
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
    >
      <div class="upload-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>
      <span class="upload-text">Arrastra una foto aquí</span>
      <span class="upload-subtext">o haz clic para seleccionar</span>
      <span class="upload-hint">JPEG, PNG o WebP hasta 10MB</span>
    </button>
  {/if}

  <!-- Detect button -->
  <button
    type="button"
    class="detect-btn"
    disabled={!imageFile || isDetecting}
    onclick={handleDetect}
  >
    {#if isDetecting}
      <span class="spinner"></span>
      Analizando imagen...
    {:else}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      Detectar Productos
    {/if}
  </button>
</div>

<style>
  .bulk-detector {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .detector-header {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .detector-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(90, 200, 250, 0.2) 0%, rgba(100, 210, 255, 0.2) 100%);
    border-radius: var(--radius-lg);
    color: #5ac8fa;
    flex-shrink: 0;
  }

  .detector-title {
    font-size: var(--font-size-xl);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 2px;
  }

  .detector-subtitle {
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
  }

  .mode-selector {
    display: flex;
    gap: var(--spacing-sm);
  }

  .mode-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text-variant);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-base);
  }

  .mode-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .mode-btn.active {
    color: #5ac8fa;
    background: rgba(90, 200, 250, 0.1);
    border-color: rgba(90, 200, 250, 0.3);
  }

  .mode-hint {
    font-size: var(--font-size-xs);
    color: rgba(255, 255, 255, 0.5);
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: rgba(255, 59, 48, 0.1);
    border: 1px solid rgba(255, 59, 48, 0.3);
    border-radius: var(--radius-md);
    color: #ff6b6b;
    font-size: var(--font-size-sm);
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .file-input-hidden {
    display: none;
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

  .upload-area:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .upload-area.dragging {
    background: rgba(90, 200, 250, 0.1);
    border-color: #5ac8fa;
    border-style: solid;
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

  .upload-area:hover .upload-icon,
  .upload-area.dragging .upload-icon {
    background: rgba(90, 200, 250, 0.15);
    color: #5ac8fa;
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
    border-radius: var(--radius-xl);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .image-preview img {
    width: 100%;
    max-height: 250px;
    object-fit: cover;
  }

  .image-actions {
    display: flex;
    justify-content: flex-end;
  }

  .remove-image-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-xs);
    font-weight: 500;
    color: var(--color-text-variant);
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-md);
    transition: all var(--transition-base);
  }

  .remove-image-btn:hover {
    color: var(--color-text);
    background: rgba(255, 255, 255, 0.1);
  }

  .detect-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    width: 100%;
    padding: var(--spacing-md) var(--spacing-xl);
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #5ac8fa 0%, #007aff 100%);
    border-radius: var(--radius-full);
    transition: all var(--transition-base);
  }

  .detect-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(90, 200, 250, 0.3);
  }

  .detect-btn:disabled {
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

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
