<script lang="ts">
  type Product = {
    id: string;
    name: string;
    description: string;
    weight: string;
    price: number;
    currency: 'USD' | 'CUP';
    image: string;
    availability: boolean;
    categoryId?: string;
  };

  interface Props {
    branchId: string;
    onProductAdded: (product: Product) => void;
  }

  let { branchId, onProductAdded }: Props = $props();

  // Form fields
  let name = $state('');
  let description = $state('');
  let weight = $state('');
  let price = $state<number | ''>('');
  let currency = $state<'USD' | 'CUP'>('USD');
  let imageData = $state('');
  let availability = $state(true);
  let categoryId = $state('');

  let isSubmitting = $state(false);
  let successMessage = $state('');
  let imagePreview = $state('');
  let isDragging = $state(false);
  let fileInputRef: HTMLInputElement;
  let imageName = $state('');

  // Categories (can be fetched from API later)
  const categories = [
    { id: '', label: 'Sin categoría' },
    { id: 'food', label: 'Comida' },
    { id: 'drinks', label: 'Bebidas' },
    { id: 'desserts', label: 'Postres' },
    { id: 'electronics', label: 'Electrónica' },
    { id: 'clothing', label: 'Ropa' },
    { id: 'home', label: 'Hogar' },
    { id: 'other', label: 'Otros' }
  ];

  function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    imageName = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      imageData = result;
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
    imageData = '';
    imagePreview = '';
    imageName = '';
    if (fileInputRef) {
      fileInputRef.value = '';
    }
  }

  function triggerFileInput() {
    fileInputRef?.click();
  }

  function resetForm() {
    name = '';
    description = '';
    weight = '';
    price = '';
    currency = 'USD';
    imageData = '';
    availability = true;
    categoryId = '';
    imagePreview = '';
    imageName = '';
    if (fileInputRef) {
      fileInputRef.value = '';
    }
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    isSubmitting = true;

    // Create product object
    const product: Product = {
      id: '',
      name,
      description,
      weight,
      price: Number(price) || 0,
      currency,
      image: imageData,
      availability,
      categoryId: categoryId || undefined
    };

    // Simulate API call
    setTimeout(() => {
      isSubmitting = false;
      onProductAdded(product);
      successMessage = 'Producto agregado correctamente';
      resetForm();

      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage = '';
      }, 3000);
    }, 800);
  }
</script>

<div class="product-form-container">
  <div class="form-header">
    <div class="form-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </div>
    <div>
      <h2 class="form-title">Agregar Producto</h2>
      <p class="form-subtitle">Completa los datos del nuevo producto</p>
    </div>
  </div>

  {#if successMessage}
    <div class="success-message">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      {successMessage}
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
          <svg class="select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
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

    <!-- Category -->
    <div class="form-group">
      <label for="product-category">Categoría</label>
      <div class="select-wrapper">
        <select id="product-category" bind:value={categoryId}>
          {#each categories as cat}
            <option value={cat.id}>{cat.label}</option>
          {/each}
        </select>
        <svg class="select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </div>

    <!-- Image Upload -->
    <div class="form-group">
      <label>Imagen del producto</label>
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
            <button type="button" class="remove-image-btn" onclick={removeImage}>
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
        >
          <div class="upload-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
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
        <span class="toggle-description">El producto estará visible para los clientes</span>
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
        Agregando...
      {:else}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Agregar Producto
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
    background: linear-gradient(135deg, rgba(90, 132, 103, 0.2) 0%, rgba(178, 214, 154, 0.2) 100%);
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
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
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
    background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent) 100%);
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
    to { transform: rotate(360deg); }
  }

  @media (max-width: 480px) {
    .form-row {
      flex-direction: column;
    }
  }
</style>
