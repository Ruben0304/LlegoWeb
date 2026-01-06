<script lang="ts">
  import { BUSINESS_TYPES, type Business, type RegisterBranchInput, BranchTipo, BRANCH_TIPO_LABELS } from '@/lib/business';
  import ImageUploader from './ImageUploader.svelte';
  import LocationPicker from './LocationPicker.svelte';

  interface Props {
    jwt: string;
    business?: Business;        // Si se proporciona, modo edición
    onBusinessCreated: (business: Business) => void;
    onBusinessUpdated?: (business: Business) => void;
    onCancel?: () => void;
  }

  let { jwt, business, onBusinessCreated, onBusinessUpdated, onCancel }: Props = $props();

  // Determine if we're in edit mode
  const isEditMode = $derived(!!business);

  // Business fields - initialize with existing data if in edit mode
  let name = $state(business?.name ?? '');
  let type = $state(business?.type ?? 'restaurant');
  let description = $state(business?.description ?? '');
  
  // Image paths for mutations
  let avatarPath = $state(business?.avatar ?? '');

  // First branch fields (only used in create mode)
  let branchName = $state('');
  let branchAddress = $state('');
  let branchPhone = $state('');
  let branchSchedule = $state('Lun-Vie: 9:00-18:00');
  let branchCoordinates = $state({ lat: 23.1136, lng: -82.3666 }); // Default: Havana, Cuba
  let branchTipos = $state<BranchTipo[]>([]);

  let isSubmitting = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');

  const BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL || '';

  // Track original values for detecting changes in edit mode
  const originalValues = business ? {
    name: business.name,
    type: business.type,
    description: business.description ?? '',
    avatar: business.avatar ?? '',
  } : null;

  function handleAvatarUpload(imagePath: string) {
    avatarPath = imagePath;
  }

  function handleImageError(error: string) {
    errorMessage = error;
  }

  function handleBranchLocationChange(coords: { lat: number; lng: number }) {
    branchCoordinates = coords;
  }

  function handleBranchTipoToggle(tipo: BranchTipo) {
    if (branchTipos.includes(tipo)) {
      branchTipos = branchTipos.filter(t => t !== tipo);
    } else {
      branchTipos = [...branchTipos, tipo];
    }
  }

  // Get only changed fields for update mutation
  function getChangedFields(): Record<string, unknown> {
    if (!originalValues) return {};
    
    const changes: Record<string, unknown> = {};
    
    if (name !== originalValues.name) changes.name = name;
    if (type !== originalValues.type) changes.type = type;
    if (description !== originalValues.description) changes.description = description || undefined;
    if (avatarPath !== originalValues.avatar) changes.avatar = avatarPath || undefined;
    
    return changes;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    isSubmitting = true;
    errorMessage = '';

    // Validate branch tipos in create mode
    if (!isEditMode && branchTipos.length === 0) {
      errorMessage = 'Debes seleccionar al menos un tipo para la sucursal';
      isSubmitting = false;
      return;
    }

    try {
      if (isEditMode && business) {
        // Update existing business
        const changedFields = getChangedFields();
        
        if (Object.keys(changedFields).length === 0) {
          successMessage = 'No hay cambios para guardar';
          isSubmitting = false;
          return;
        }

        const response = await fetch(`${BACKEND_URL}/graphql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            query: `
              mutation UpdateBusiness(
                $businessId: String!
                $input: UpdateBusinessInput!
                $jwt: String
              ) {
                updateBusiness(businessId: $businessId, input: $input, jwt: $jwt) {
                  id
                  name
                  type
                  description
                  avatarUrl
                  coverUrl
                  isActive
                }
              }
            `,
            variables: {
              jwt,
              businessId: business.id,
              input: changedFields,
            },
          }),
        });

        const result = await response.json();

        if (result.errors) {
          throw new Error(result.errors[0]?.message || 'Error al actualizar el negocio');
        }

        if (result.data?.updateBusiness) {
          successMessage = '¡Negocio actualizado correctamente!';
          onBusinessUpdated?.(result.data.updateBusiness);
        }
      } else {
        // Create new business
        // Parse schedule string to object
        // Format: "Lun-Vie: 9:00-18:00, Sab: 10:00-14:00"
        // Backend expects: { "Lun-Vie": ["9:00-18:00"], "Sab": ["10:00-14:00"] }
        const scheduleObj: Record<string, string[]> = {};
        branchSchedule.split(',').forEach(part => {
          const trimmed = part.trim();
          const colonIndex = trimmed.indexOf(':');
          if (colonIndex > 0) {
            const days = trimmed.slice(0, colonIndex).trim();
            const hours = trimmed.slice(colonIndex + 1).trim();
            if (days && hours) {
              scheduleObj[days] = [hours];
            }
          }
        });

        const branchInput: RegisterBranchInput = {
          name: branchName || `${name} - Principal`,
          tipos: branchTipos,
          coordinates: { lat: branchCoordinates.lat, lng: branchCoordinates.lng },
          phone: branchPhone,
          schedule: Object.keys(scheduleObj).length > 0 ? scheduleObj : { 'Lun-Dom': ['9:00-21:00'] },
          address: branchAddress,
        };

        const response = await fetch(`${BACKEND_URL}/graphql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            query: `
              mutation RegisterBusiness(
                $businessInput: CreateBusinessInput!
                $branchesInput: [RegisterBranchInput!]!
                $jwt: String
              ) {
                registerBusiness(
                  businessInput: $businessInput
                  branchesInput: $branchesInput
                  jwt: $jwt
                ) {
                  id
                  name
                  type
                  avatarUrl
                  coverUrl
                  isActive
                }
              }
            `,
            variables: {
              jwt,
              businessInput: {
                name,
                type,
                description: description || undefined,
                avatar: avatarPath || undefined,
              },
              branchesInput: [branchInput],
            },
          }),
        });

        const result = await response.json();

        if (result.errors) {
          throw new Error(result.errors[0]?.message || 'Error al crear el negocio');
        }

        if (result.data?.registerBusiness) {
          successMessage = '¡Negocio creado correctamente!';
          onBusinessCreated(result.data.registerBusiness);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      errorMessage = error instanceof Error ? error.message : 'Error al procesar el negocio';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="business-form-container">
  <div class="form-header">
    <div class="form-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </div>
    <div>
      <h2 class="form-title">{isEditMode ? 'Editar Negocio' : 'Crear Negocio'}</h2>
      <p class="form-subtitle">{isEditMode ? 'Actualiza la información de tu negocio' : 'Registra tu negocio para comenzar a vender'}</p>
    </div>
  </div>

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

  {#if successMessage}
    <div class="success-message">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      {successMessage}
    </div>
  {/if}

  <form class="business-form" onsubmit={handleSubmit}>
    <div class="form-section">
      <h3 class="section-title">Información del Negocio</h3>

      <!-- Name -->
      <div class="form-group">
        <label for="business-name">
          Nombre del negocio
          <span class="required">*</span>
        </label>
        <input
          type="text"
          id="business-name"
          bind:value={name}
          placeholder="Ej: Mi Restaurante"
          required
        />
      </div>

      <!-- Type -->
      <div class="form-group">
        <label for="business-type">
          Tipo de negocio
          <span class="required">*</span>
        </label>
        <div class="select-wrapper">
          <select id="business-type" bind:value={type} required>
            {#each BUSINESS_TYPES as businessType}
              <option value={businessType.id}>{businessType.label}</option>
            {/each}
          </select>
          <svg class="select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      <!-- Description -->
      <div class="form-group">
        <label for="business-description">Descripción</label>
        <textarea
          id="business-description"
          bind:value={description}
          placeholder="Describe tu negocio..."
          rows="3"
        ></textarea>
      </div>
    </div>

    <!-- Images Section -->
    <div class="form-section">
      <h3 class="section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        Imagen de Perfil
      </h3>

      <div class="images-container">
        <!-- Avatar -->
        <ImageUploader
          endpoint="/upload/business/avatar"
          {jwt}
          label="Avatar"
          currentImageUrl={business?.avatarUrl}
          aspectRatio="square"
          onUploadComplete={handleAvatarUpload}
          onError={handleImageError}
        />
      </div>
    </div>

    {#if !isEditMode}
      <div class="form-section">
        <h3 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Primera Sucursal
        </h3>

        <!-- Branch Name -->
        <div class="form-group">
          <label for="branch-name">Nombre de la sucursal</label>
          <input
            type="text"
            id="branch-name"
            bind:value={branchName}
            placeholder="Ej: Sucursal Centro (opcional)"
          />
        </div>

        <!-- Branch Types -->
        <div class="form-group">
          <label>
            Tipo de Sucursal
            <span class="required">*</span>
          </label>
          <p class="input-hint" style="margin-bottom: var(--spacing-md);">
            Selecciona al menos un tipo que mejor describa tu sucursal
          </p>
          <div class="tipo-options">
            {#each Object.values(BranchTipo) as tipo}
              <button
                type="button"
                class="tipo-option"
                class:selected={branchTipos.includes(tipo)}
                onclick={() => handleBranchTipoToggle(tipo)}
              >
                <div class="tipo-checkbox">
                  {#if branchTipos.includes(tipo)}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  {/if}
                </div>
                <span class="tipo-label">{BRANCH_TIPO_LABELS[tipo]}</span>
              </button>
            {/each}
          </div>
        </div>

        <!-- Branch Address -->
        <div class="form-group">
          <label for="branch-address">
            Dirección
            <span class="required">*</span>
          </label>
          <input
            type="text"
            id="branch-address"
            bind:value={branchAddress}
            placeholder="Ej: Av. Principal #123"
            required
          />
        </div>

        <!-- Branch Phone -->
        <div class="form-group">
          <label for="branch-phone">
            Teléfono
            <span class="required">*</span>
          </label>
          <input
            type="tel"
            id="branch-phone"
            bind:value={branchPhone}
            placeholder="Ej: +53 5555 5555"
            required
          />
        </div>

        <!-- Schedule -->
        <div class="form-group">
          <label for="branch-schedule">Horario</label>
          <input
            type="text"
            id="branch-schedule"
            bind:value={branchSchedule}
            placeholder="Ej: Lun-Vie: 9:00-18:00"
          />
          <span class="input-hint">Separa múltiples horarios con comas</span>
        </div>

        <!-- Location -->
        <LocationPicker
          onLocationChange={handleBranchLocationChange}
        />
      </div>
    {/if}

    <div class="form-actions">
      {#if onCancel}
        <button type="button" class="cancel-btn" onclick={onCancel}>
          Cancelar
        </button>
      {/if}
      <button type="submit" class="submit-btn" disabled={isSubmitting}>
        {#if isSubmitting}
          <span class="spinner"></span>
          {isEditMode ? 'Guardando...' : 'Creando...'}
        {:else}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            {#if isEditMode}
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            {:else}
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            {/if}
          </svg>
          {isEditMode ? 'Guardar Cambios' : 'Crear Negocio'}
        {/if}
      </button>
    </div>
  </form>
</div>


<style>
  .business-form-container {
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

  .business-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
  }

  .form-section {
    padding: var(--spacing-lg);
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-xl);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .section-title svg {
    color: var(--color-secondary);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }

  .form-group:last-child {
    margin-bottom: 0;
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

  .input-hint {
    font-size: var(--font-size-xs);
    color: rgba(255, 255, 255, 0.4);
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

  .images-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
  }

  .form-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: flex-end;
  }

  .cancel-btn {
    padding: var(--spacing-md) var(--spacing-xl);
    font-size: var(--font-size-base);
    font-weight: 500;
    color: var(--color-text-variant);
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-full);
    transition: all var(--transition-base);
  }

  .cancel-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--color-text);
  }

  .submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-xl);
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-primary);
    background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent) 100%);
    border-radius: var(--radius-full);
    transition: all var(--transition-base);
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

  /* Branch Type Selector Styles */
  .tipo-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--spacing-md);
  }

  .tipo-option {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-lg);
    transition: all var(--transition-base);
    cursor: pointer;
  }

  .tipo-option:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(225, 199, 142, 0.3);
  }

  .tipo-option.selected {
    background: linear-gradient(135deg, rgba(225, 199, 142, 0.15) 0%, rgba(178, 214, 154, 0.15) 100%);
    border-color: var(--color-secondary);
  }

  .tipo-checkbox {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-base);
    flex-shrink: 0;
  }

  .tipo-option.selected .tipo-checkbox {
    background: var(--color-secondary);
    border-color: var(--color-secondary);
    color: var(--color-primary);
  }

  .tipo-label {
    font-size: var(--font-size-base);
    font-weight: 500;
    color: var(--color-text);
  }


  @media (max-width: 480px) {
    .form-actions {
      flex-direction: column;
    }

    .cancel-btn,
    .submit-btn {
      width: 100%;
      justify-content: center;
    }
  }
</style>
