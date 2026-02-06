<script lang="ts">
  import { onMount } from "svelte";
  import { backendUrl } from "@/lib/shared/graphql";
  import {
    createTutorial,
    updateTutorial,
  } from "@/lib/tutorial";
  import type { Tutorial, AppTarget } from "@/lib/tutorial";
  import VideoUploader from "./VideoUploader.svelte";
  import ImageUploader from "./ImageUploader.svelte";

  interface Props {
    jwt: string;
    onTutorialAdded: (tutorial: Tutorial) => void;
    tutorial?: Tutorial | null; // Optional: for edit mode
  }

  let { jwt, onTutorialAdded, tutorial = null }: Props = $props();

  // Form fields
  let title = $state("");
  let description = $state("");
  let duration = $state<number | "">(0);
  let appTarget = $state<AppTarget>("CUSTOMER" as AppTarget);
  let order = $state<number | "">(0);
  let tags = $state("");
  let videoPath = $state("");
  let thumbnailPath = $state("");

  let isSubmitting = $state(false);
  let successMessage = $state("");
  let errorMessage = $state("");

  // Modo de edición
  let isEditMode = $derived(tutorial !== null);

  function resolveMediaUrl(url?: string | null): string {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    const base = backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl;
    const path = url.startsWith("/") ? url.slice(1) : url;
    return `${base}/${path}`;
  }

  // Initialize form with tutorial data if in edit mode
  $effect(() => {
    if (tutorial) {
      title = tutorial.title;
      description = tutorial.description;
      duration = tutorial.duration;
      appTarget = tutorial.appTarget;
      order = tutorial.order;
      tags = tutorial.tags.join(", ");
      videoPath = tutorial.videoUrl || "";
      thumbnailPath = tutorial.thumbnailUrl || "";
    }
  });

  function handleVideoUploadComplete(path: string, videoDuration?: number) {
    videoPath = path;
    // If duration is provided from upload, use it
    if (videoDuration && videoDuration > 0) {
      duration = Math.round(videoDuration);
    }
  }

  function handleVideoUploadError(error: string) {
    errorMessage = error;
  }

  function handleThumbnailUploadComplete(path: string) {
    thumbnailPath = path;
  }

  function handleThumbnailUploadError(error: string) {
    errorMessage = error;
  }

  function resetForm() {
    title = "";
    description = "";
    duration = 0;
    appTarget = "CUSTOMER" as AppTarget;
    order = 0;
    tags = "";
    videoPath = "";
    thumbnailPath = "";
    errorMessage = "";
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();

    // En modo creación, el video es obligatorio
    if (!isEditMode && !videoPath) {
      errorMessage = "Por favor sube un video para el tutorial";
      return;
    }

    if (!duration || duration <= 0) {
      errorMessage = "Por favor ingresa la duración del video en segundos";
      return;
    }

    isSubmitting = true;
    errorMessage = "";
    successMessage = "";

    try {
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      if (isEditMode && tutorial) {
        // Modo edición: actualizar tutorial existente
        const updateInput = {
          title,
          description,
          duration: Number(duration),
          appTarget,
          order: Number(order) || undefined,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
          ...(videoPath && { videoUrl: videoPath }),
          ...(thumbnailPath && { thumbnailUrl: thumbnailPath }),
        };

        const updatedTutorial = await updateTutorial(tutorial.id, updateInput, jwt);
        onTutorialAdded(updatedTutorial);
        successMessage = "Tutorial actualizado correctamente";
      } else {
        // Modo creación: crear nuevo tutorial
        const tutorialInput = {
          title,
          description,
          videoUrl: videoPath,
          duration: Number(duration),
          appTarget,
          order: Number(order) || 0,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
          ...(thumbnailPath && { thumbnailUrl: thumbnailPath }),
        };

        const createdTutorial = await createTutorial(tutorialInput, jwt);
        onTutorialAdded(createdTutorial);
        successMessage = "Tutorial agregado correctamente";
        resetForm();
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage = "";
      }, 3000);
    } catch (error) {
      console.error("Error al guardar tutorial:", error);
      errorMessage =
        error instanceof Error ? error.message : "Error al guardar el tutorial";
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="tutorial-form-container">
  <div class="form-header">
    <div class="form-icon">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        {#if isEditMode}
          <path
            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
          />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        {:else}
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        {/if}
      </svg>
    </div>
    <div>
      <h2 class="form-title">
        {isEditMode ? "Editar Tutorial" : "Agregar Tutorial"}
      </h2>
      <p class="form-subtitle">
        {isEditMode
          ? "Modifica los datos del tutorial"
          : "Completa los datos del nuevo tutorial"}
      </p>
    </div>
  </div>

  {#if successMessage}
    <div class="success-message">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {successMessage}
    </div>
  {/if}

  {#if errorMessage}
    <div class="error-message">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {errorMessage}
    </div>
  {/if}

  <form class="tutorial-form" onsubmit={handleSubmit}>
    <!-- Title -->
    <div class="form-group">
      <label for="tutorial-title">
        Título del tutorial
        <span class="required">*</span>
      </label>
      <input
        type="text"
        id="tutorial-title"
        bind:value={title}
        placeholder="Ej: Cómo hacer un pedido"
        required
      />
    </div>

    <!-- Description -->
    <div class="form-group">
      <label for="tutorial-description">
        Descripción
        <span class="required">*</span>
      </label>
      <textarea
        id="tutorial-description"
        bind:value={description}
        placeholder="Describe el contenido del tutorial..."
        rows="3"
        required
      ></textarea>
    </div>

    <!-- App Target -->
    <div class="form-group">
      <label for="tutorial-app-target">
        Dirigido a
        <span class="required">*</span>
      </label>
      <p class="field-hint">
        Selecciona quién verá este tutorial
      </p>
      <div class="radio-group">
        <label class="radio-option">
          <input
            type="radio"
            name="app-target"
            value="CUSTOMER"
            bind:group={appTarget}
          />
          <span class="radio-label">Cliente</span>
        </label>
        <label class="radio-option">
          <input
            type="radio"
            name="app-target"
            value="MERCHANT"
            bind:group={appTarget}
          />
          <span class="radio-label">Negocios</span>
        </label>
      </div>
    </div>

    <!-- Duration and Order -->
    <div class="form-row">
      <div class="form-group flex-1">
        <label for="tutorial-duration">
          Duración (segundos)
          <span class="required">*</span>
        </label>
        <input
          type="number"
          id="tutorial-duration"
          bind:value={duration}
          placeholder="180"
          min="1"
          required
        />
      </div>
      <div class="form-group flex-1">
        <label for="tutorial-order">Orden</label>
        <input
          type="number"
          id="tutorial-order"
          bind:value={order}
          placeholder="0"
          min="0"
        />
      </div>
    </div>

    <!-- Tags -->
    <div class="form-group">
      <label for="tutorial-tags">Tags</label>
      <input
        type="text"
        id="tutorial-tags"
        bind:value={tags}
        placeholder="pedidos, básico, cliente (separados por coma)"
      />
      <span class="field-hint">Separa los tags con comas</span>
    </div>

    <!-- Video Upload -->
    <div class="form-group">
      <VideoUploader
        endpoint="/upload/tutorial/video"
        {jwt}
        label="Video del tutorial {isEditMode ? '' : '*'}"
        currentVideoUrl={resolveMediaUrl(tutorial?.videoUrlSigned || tutorial?.videoUrl)}
        onUploadComplete={handleVideoUploadComplete}
        onError={handleVideoUploadError}
        maxSizeMB={100}
      />
      {#if isEditMode}
        <span class="field-hint">Deja en blanco para mantener el video actual</span>
      {/if}
    </div>

    <!-- Thumbnail Upload -->
    <div class="form-group">
      <ImageUploader
        endpoint="/upload/tutorial/thumbnail"
        {jwt}
        label="Miniatura (opcional)"
        currentImageUrl={resolveMediaUrl(
          tutorial?.thumbnailUrlSigned || tutorial?.thumbnailUrl,
        )}
        aspectRatio="wide"
        onUploadComplete={handleThumbnailUploadComplete}
        onError={handleThumbnailUploadError}
      />
      <span class="field-hint">Imagen para previsualización del video (16:9 recomendado)</span>
    </div>

    <!-- Submit Button -->
    <button type="submit" class="submit-btn" disabled={isSubmitting}>
      {#if isSubmitting}
        <span class="spinner"></span>
        {isEditMode ? "Guardando..." : "Agregando..."}
      {:else}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          {#if isEditMode}
            <path
              d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
            />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          {:else}
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          {/if}
        </svg>
        {isEditMode ? "Guardar Cambios" : "Agregar Tutorial"}
      {/if}
    </button>
  </form>
</div>

<style>
  .tutorial-form-container {
    height: 100%;
  }

  .form-header {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
  }

  .form-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      rgba(90, 132, 103, 0.2) 0%,
      rgba(178, 214, 154, 0.2) 100%
    );
    border-radius: var(--radius-lg);
    color: var(--color-accent);
    flex-shrink: 0;
  }

  .form-title {
    font-size: var(--font-size-xl);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 2px;
  }

  .form-subtitle {
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
  }

  .success-message {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: rgba(52, 199, 89, 0.1);
    border: 1px solid rgba(52, 199, 89, 0.3);
    border-radius: var(--radius-md);
    color: #34c759;
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-lg);
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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
    margin-bottom: var(--spacing-lg);
    animation: slideIn 0.3s ease;
  }

  .tutorial-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .form-group label {
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text-variant);
  }

  .required {
    color: #ff6b6b;
    margin-left: 2px;
  }

  .field-hint {
    font-size: var(--font-size-xs);
    color: rgba(255, 255, 255, 0.5);
    margin-top: var(--spacing-xs);
    display: block;
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-base);
    font-family: inherit;
    color: var(--color-text);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-lg);
    transition: all var(--transition-base);
  }

  .form-group input::placeholder,
  .form-group textarea::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--color-secondary);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 4px rgba(225, 199, 142, 0.1);
  }

  .form-group textarea {
    resize: vertical;
    min-height: 80px;
  }

  .form-row {
    display: flex;
    gap: var(--spacing-md);
  }

  .flex-1 {
    flex: 1;
  }

  /* Radio Group */
  .radio-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .radio-option {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-base);
  }

  .radio-option:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .radio-option input[type="radio"] {
    width: 20px;
    height: 20px;
    margin: 0;
    cursor: pointer;
    accent-color: var(--color-secondary);
  }

  .radio-option input[type="radio"]:checked + .radio-label {
    color: var(--color-secondary);
    font-weight: 600;
  }

  .radio-option:has(input[type="radio"]:checked) {
    background: rgba(225, 199, 142, 0.1);
    border-color: var(--color-secondary);
  }

  .radio-label {
    font-size: var(--font-size-base);
    color: var(--color-text);
    transition: all var(--transition-base);
  }

  /* Submit Button */
  .submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    width: 100%;
    padding: var(--spacing-md) var(--spacing-xl);
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-primary);
    background: linear-gradient(
      135deg,
      var(--color-secondary) 0%,
      var(--color-accent) 100%
    );
    border-radius: var(--radius-full);
    transition: all var(--transition-base);
    margin-top: var(--spacing-sm);
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(225, 199, 142, 0.3);
  }

  .submit-btn:disabled {
    opacity: 0.6;
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
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 480px) {
    .form-row {
      flex-direction: column;
    }
  }
</style>
