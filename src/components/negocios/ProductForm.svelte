<script lang="ts">
  import { onMount } from "svelte";
  import {
    uploadProductImage,
    createProduct,
    updateProduct,
    getProductCategories,
  } from "@/lib/product";
  import type { Product, ProductCategory } from "@/lib/product";

  interface Props {
    branchId: string;
    branchTypes: string[]; // Array de tipos de branch: ["RESTAURANTE"], ["DULCERIA"], etc.
    jwt: string;
    onProductAdded: (product: Product) => void;
    product?: Product | null; // Optional: for edit mode
  }

  let {
    branchId,
    branchTypes,
    jwt,
    onProductAdded,
    product = null,
  }: Props = $props();

  // Estado para tipo de branch seleccionado (cuando hay múltiples)
  let selectedBranchType = $state(
    branchTypes.length === 1 ? branchTypes[0] : "",
  );

  // Form fields
  let name = $state("");
  let description = $state("");
  let weight = $state("");
  let price = $state<number | "">("");
  let currency = $state<"USD" | "CUP">("USD");
  let imageFile = $state<File | null>(null);
  let availability = $state(true);
  let categoryId = $state("");

  let isSubmitting = $state(false);
  let successMessage = $state("");
  let errorMessage = $state("");
  let imagePreview = $state("");
  let isDragging = $state(false);
  let fileInputRef: HTMLInputElement;
  let imageName = $state("");

  // Categories loaded from backend
  let categories = $state<ProductCategory[]>([]);
  let isLoadingCategories = $state(false);
  let categoriesError = $state("");

  // Modo de edición
  let isEditMode = $derived(product !== null);

  // Initialize form with product data if in edit mode
  $effect(() => {
    if (product) {
      name = product.name;
      description = product.description;
      weight = product.weight || "";
      price = product.price;
      currency = (product.currency as "USD" | "CUP") || "USD";
      availability = product.availability ?? true;
      categoryId = product.categoryId || "";
      if (product.imageUrl) {
        imagePreview = product.imageUrl;
        imageName = "Imagen actual";
      }
    }
  });

  // Categorías filtradas según el tipo de branch seleccionado
  let filteredCategories = $derived(
    selectedBranchType
      ? categories.filter(
          (cat) =>
            cat.branchType.toLowerCase() === selectedBranchType.toLowerCase(),
        )
      : categories,
  );

  // Load product categories based on branch types
  async function loadCategories() {
    if (branchTypes.length === 0) {
      categories = [];
      return;
    }

    isLoadingCategories = true;
    categoriesError = "";

    try {
      // Si hay múltiples tipos pero no se ha seleccionado ninguno, cargamos todos
      const typesToLoad = branchTypes;

      // Load categories for all branch types
      const categoryPromises = typesToLoad.map((branchType) =>
        getProductCategories(branchType, jwt),
      );

      const results = await Promise.all(categoryPromises);

      // Combine and deduplicate categories by ID
      const allCategories = results.flatMap(
        (result) => result.productCategories || [],
      );
      const uniqueCategories = Array.from(
        new Map(allCategories.map((cat) => [cat.id, cat])).values(),
      );

      categories = uniqueCategories;
    } catch (error) {
      console.error("Error loading categories:", error);
      categoriesError = "Error al cargar las categorías";
      categories = [];
    } finally {
      isLoadingCategories = false;
    }
  }

  // Load categories when component mounts or branchTypes change
  onMount(() => {
    loadCategories();
  });

  $effect(() => {
    // Reload categories if branchTypes or selectedBranchType change
    loadCategories();
  });

  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      errorMessage = "Por favor selecciona un archivo de imagen válido";
      return;
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      errorMessage = "La imagen debe ser menor a 5MB";
      return;
    }

    errorMessage = "";
    imageFile = file;
    imageName = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      imagePreview = result;
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

  function removeImage() {
    imageFile = null;
    imagePreview = "";
    imageName = "";
    if (fileInputRef) {
      fileInputRef.value = "";
    }
  }

  function triggerFileInput() {
    fileInputRef?.click();
  }

  function resetForm() {
    name = "";
    description = "";
    weight = "";
    price = "";
    currency = "USD";
    imageFile = null;
    availability = true;
    categoryId = "";
    imagePreview = "";
    imageName = "";
    errorMessage = "";
    if (fileInputRef) {
      fileInputRef.value = "";
    }
  }

  // Función para extraer el path de imagen desde imageUrl
  function extractImagePathFromUrl(imageUrl: string | undefined): string | undefined {
    if (!imageUrl) return undefined;
    // El imageUrl tiene formato: https://domain.com/products/filename.jpg
    // Necesitamos extraer: products/filename.jpg
    try {
      const url = new URL(imageUrl);
      // Remover el slash inicial del pathname
      return url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
    } catch {
      // Si no es una URL válida, intentar extraer el path directamente
      const match = imageUrl.match(/products\/[^?#]+/);
      return match ? match[0] : undefined;
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();

    // Validar que hay tipo de branch seleccionado si hay múltiples
    if (branchTypes.length > 1 && !selectedBranchType) {
      errorMessage =
        "Por favor selecciona el tipo de negocio para este producto";
      return;
    }

    // En modo creación, la imagen es obligatoria
    if (!isEditMode && !imageFile) {
      errorMessage = "Por favor selecciona una imagen para el producto";
      return;
    }

    isSubmitting = true;
    errorMessage = "";
    successMessage = "";

    try {
      // En edición, usar la imagen existente por defecto (extraer path de imageUrl si no hay image)
      let imagePath = product?.image || extractImagePathFromUrl(product?.imageUrl);

      // Si hay una nueva imagen, subirla
      if (imageFile) {
        const uploadResponse = await uploadProductImage(imageFile, jwt);
        imagePath = uploadResponse.image_path;
      }

      if (isEditMode && product) {
        // Modo edición: actualizar producto existente
        const updateInput = {
          name,
          description,
          price: Number(price),
          currency,
          weight: weight || undefined,
          categoryId: categoryId || undefined,
          availability,
          ...(imagePath && { image: imagePath }),
        };

        const updatedProduct = await updateProduct(
          product.id,
          updateInput,
          jwt,
        );
        onProductAdded(updatedProduct);
        successMessage = "Producto actualizado correctamente";
      } else {
        // Modo creación: crear nuevo producto
        const productInput = {
          branchId,
          name,
          description,
          price: Number(price),
          currency,
          image: imagePath!,
          weight: weight || undefined,
          categoryId: categoryId || undefined,
        };

        const createdProduct = await createProduct(productInput, jwt);
        onProductAdded(createdProduct);
        successMessage = "Producto agregado correctamente";
        resetForm();
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage = "";
      }, 3000);
    } catch (error) {
      console.error("Error al guardar producto:", error);
      errorMessage =
        error instanceof Error ? error.message : "Error al guardar el producto";
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="product-form-container">
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
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        {/if}
      </svg>
    </div>
    <div>
      <h2 class="form-title">
        {isEditMode ? "Editar Producto" : "Agregar Producto"}
      </h2>
      <p class="form-subtitle">
        {isEditMode
          ? "Modifica los datos del producto"
          : "Completa los datos del nuevo producto"}
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

  <form class="product-form" onsubmit={handleSubmit}>
    <!-- Name -->
    <div class="form-group">
      <label for="product-name">
        Nombre del producto
        <span class="required">*</span>
      </label>
      <input
        type="text"
        id="product-name"
        bind:value={name}
        placeholder="Ej: Hamburguesa Clásica"
        required
      />
    </div>

    <!-- Description -->
    <div class="form-group">
      <label for="product-description">
        Descripción
        <span class="required">*</span>
      </label>
      <textarea
        id="product-description"
        bind:value={description}
        placeholder="Describe tu producto..."
        rows="3"
        required
      ></textarea>
    </div>

    <!-- Price and Currency -->
    <div class="form-row">
      <div class="form-group flex-2">
        <label for="product-price">
          Precio
          <span class="required">*</span>
        </label>
        <div class="input-with-icon">
          <span class="input-icon">$</span>
          <input
            type="number"
            id="product-price"
            bind:value={price}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>
      </div>
      <div class="form-group flex-1">
        <label for="product-currency">Moneda</label>
        <div class="select-wrapper">
          <select id="product-currency" bind:value={currency}>
            <option value="USD">USD</option>
            <option value="CUP">CUP</option>
          </select>
          <svg
            class="select-arrow"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Weight -->
    <div class="form-group">
      <label for="product-weight">Peso / Unidad</label>
      <input
        type="text"
        id="product-weight"
        bind:value={weight}
        placeholder="Ej: 500g, 1kg, 1 unidad"
      />
    </div>

    <!-- Branch Type Selector (only if multiple types) -->
    {#if branchTypes.length > 1}
      <div class="form-group">
        <label for="branch-type-selector">
          Tipo de Negocio
          <span class="required">*</span>
        </label>
        <p class="field-hint">
          Selecciona en qué categoría de negocio aparecerá este producto
        </p>
        <div class="radio-group">
          {#each branchTypes as branchType}
            <label class="radio-option">
              <input
                type="radio"
                name="branch-type"
                value={branchType}
                bind:group={selectedBranchType}
              />
              <span class="radio-label">
                {branchType === "RESTAURANTE"
                  ? "Restaurante"
                  : branchType === "DULCERIA"
                    ? "Dulcería"
                    : branchType === "TIENDA"
                      ? "Tienda"
                      : branchType}
              </span>
            </label>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Category -->
    <div class="form-group">
      <label for="product-category">
        Categoría
        {#if isLoadingCategories}
          <span class="loading-text">(cargando...)</span>
        {/if}
      </label>
      <div class="select-wrapper">
        <select
          id="product-category"
          bind:value={categoryId}
          disabled={isLoadingCategories ||
            filteredCategories.length === 0 ||
            (branchTypes.length > 1 && !selectedBranchType)}
        >
          <option value="">Sin categoría</option>
          {#each filteredCategories as cat}
            <option value={cat.id}>{cat.name}</option>
          {/each}
        </select>
        <svg
          class="select-arrow"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {#if categoriesError}
        <span class="field-error">{categoriesError}</span>
      {/if}
      {#if branchTypes.length > 1 && !selectedBranchType}
        <span class="field-hint">Primero selecciona el tipo de negocio</span>
      {/if}
    </div>

    <!-- Image Upload -->
    <div class="form-group">
      <label
        >Imagen del producto {#if !isEditMode}<span class="required">*</span
          >{/if}</label
      >
      {#if isEditMode}
        <p class="field-hint">Deja en blanco para mantener la imagen actual</p>
      {/if}
      <input
        type="file"
        accept="image/*"
        bind:this={fileInputRef}
        onchange={handleInputChange}
        class="file-input-hidden"
      />

      {#if imagePreview}
        <div class="image-preview-container">
          <div class="image-preview">
            <img src={imagePreview} alt="Vista previa" />
          </div>
          <div class="image-info">
            <span class="image-name">{imageName}</span>
            <button
              type="button"
              class="remove-image-btn"
              onclick={removeImage}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
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
        >
          <div class="upload-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <span class="upload-text">Arrastra una imagen aquí</span>
          <span class="upload-subtext">o haz clic para seleccionar</span>
          <span class="upload-hint">PNG, JPG hasta 5MB</span>
        </button>
      {/if}
    </div>

    <!-- Availability Toggle -->
    <div class="form-group-toggle">
      <div class="toggle-info">
        <label for="product-availability">Disponibilidad</label>
        <span class="toggle-description"
          >El producto estará visible para los clientes</span
        >
      </div>
      <label class="toggle-switch">
        <input
          type="checkbox"
          id="product-availability"
          bind:checked={availability}
        />
        <span class="toggle-slider"></span>
      </label>
    </div>

    <!-- Hidden branchId -->
    <input type="hidden" value={branchId} />

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
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          {/if}
        </svg>
        {isEditMode ? "Guardar Cambios" : "Agregar Producto"}
      {/if}
    </button>
  </form>
</div>

<style>
  .product-form-container {
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

  .product-form {
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

  .loading-text {
    font-size: var(--font-size-xs);
    color: rgba(255, 255, 255, 0.4);
    font-weight: 400;
    margin-left: var(--spacing-xs);
  }

  .field-error {
    font-size: var(--font-size-xs);
    color: #ff6b6b;
    margin-top: var(--spacing-xs);
    display: block;
  }

  .form-group input,
  .form-group textarea,
  .form-group select {
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
  .form-group textarea:focus,
  .form-group select:focus {
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

  .flex-2 {
    flex: 2;
  }

  .input-with-icon {
    position: relative;
  }

  .input-icon {
    position: absolute;
    left: var(--spacing-lg);
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-variant);
    font-weight: 500;
  }

  .input-with-icon input {
    padding-left: calc(var(--spacing-lg) + 16px);
  }

  .select-wrapper {
    position: relative;
  }

  .select-wrapper select {
    appearance: none;
    cursor: pointer;
    padding-right: calc(var(--spacing-lg) + 20px);
  }

  .select-arrow {
    position: absolute;
    right: var(--spacing-lg);
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-variant);
    pointer-events: none;
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
    background: rgba(225, 199, 142, 0.1);
    border-color: var(--color-secondary);
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
    border-radius: var(--radius-xl);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .image-preview img {
    width: 100%;
    max-height: 200px;
    object-fit: cover;
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

  .remove-image-btn:hover {
    background: rgba(255, 59, 48, 0.2);
  }

  /* Toggle Switch */
  .form-group-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md);
    background: rgba(255, 255, 255, 0.03);
    border-radius: var(--radius-lg);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .toggle-info label {
    display: block;
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 2px;
  }

  .toggle-description {
    font-size: var(--font-size-xs);
    color: var(--color-text-variant);
  }

  .toggle-switch {
    position: relative;
    width: 51px;
    height: 31px;
    flex-shrink: 0;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 34px;
    transition: all 0.3s ease;
  }

  .toggle-slider::before {
    position: absolute;
    content: "";
    height: 27px;
    width: 27px;
    left: 2px;
    bottom: 2px;
    background: #fff;
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .toggle-switch input:checked + .toggle-slider {
    background: #34c759;
  }

  .toggle-switch input:checked + .toggle-slider::before {
    transform: translateX(20px);
  }

  .toggle-switch input:focus + .toggle-slider {
    box-shadow: 0 0 0 4px rgba(52, 199, 89, 0.2);
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

  /* Field Hint */
  .field-hint {
    font-size: var(--font-size-xs);
    color: rgba(255, 255, 255, 0.5);
    margin-top: var(--spacing-xs);
    display: block;
  }

  @media (max-width: 480px) {
    .form-row {
      flex-direction: column;
    }
  }
</style>
