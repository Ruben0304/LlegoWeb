<script lang="ts">
  import type { Branch, Business } from '@/lib/business';
  import ImageUploader from './ImageUploader.svelte';
  import LocationPicker from './LocationPicker.svelte';

  interface Props {
    jwt: string;
    business: Business;
    branch?: Branch;            // Si se proporciona, modo edición
    onBranchCreated: (branch: Branch) => void;
    onBranchUpdated?: (branch: Branch) => void;
    onCancel?: () => void;
  }

  let { jwt, business, branch, onBranchCreated, onBranchUpdated, onCancel }: Props = $props();

  // Determine if we're in edit mode
  const isEditMode = $derived(!!branch);

  // Helper to extract coordinates from branch
  function getInitialLat(): number {
    if (branch?.coordinates?.coordinates) {
      // coordinates.coordinates is [lng, lat]
      return branch.coordinates.coordinates[1];
    }
    return 23.1136; // Default: Havana, Cuba
  }

  function getInitialLng(): number {
    if (branch?.coordinates?.coordinates) {
      // coordinates.coordinates is [lng, lat]
      return branch.coordinates.coordinates[0];
    }
    return -82.3666; // Default: Havana, Cuba
  }

  // Branch fields - initialize with existing data if in edit mode
  let name = $state(branch?.name ?? '');
  let address = $state(branch?.address ?? '');
  let phone = $state(branch?.phone ?? '');
  
  // Convert schedule object to string for display
  // Backend format: { "Lun-Vie": ["9:00-18:00"] } or legacy { "Lun-Vie": "9:00-18:00" }
  function scheduleToString(schedule?: Record<string, string | string[]>): string {
    if (!schedule || Object.keys(schedule).length === 0) {
      return 'Lun-Vie: 9:00-18:00';
    }
    return Object.entries(schedule)
      .map(([days, hours]) => {
        const hoursStr = Array.isArray(hours) ? hours.join(', ') : hours;
        return `${days}: ${hoursStr}`;
      })
      .join(', ');
  }
  
  let schedule = $state(scheduleToString(branch?.schedule));
  let deliveryRadius = $state<number | ''>(branch?.deliveryRadius ?? '');

  // Image paths for mutations
  let avatarPath = $state(branch?.avatar ?? '');
  let coverPath = $state(branch?.coverImage ?? '');

  // Coordinates for location
  let coordinates = $state({ lat: getInitialLat(), lng: getInitialLng() });

  let isSubmitting = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');

  const BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL || '';

  // Track original values for detecting changes in edit mode
  const originalValues = branch ? {
    name: branch.name,
    address: branch.address ?? '',
    phone: branch.phone,
    schedule: scheduleToString(branch.schedule),
    deliveryRadius: branch.deliveryRadius ?? '',
    avatar: branch.avatar ?? '',
    coverImage: branch.coverImage ?? '',
    lat: getInitialLat(),
    lng: getInitialLng(),
  } : null;

  function handleAvatarUpload(imagePath: string) {
    avatarPath = imagePath;
  }

  function handleCoverUpload(imagePath: string) {
    coverPath = imagePath;
  }

  function handleImageError(error: string) {
    errorMessage = error;
  }

  function handleLocationChange(coords: { lat: number; lng: number }) {
    coordinates = coords;
  }

  // Parse schedule string to object
  // Format: "Lun-Vie: 9:00-18:00, Sab: 10:00-14:00"
  // Backend expects: { "Lun-Vie": ["9:00-18:00"], "Sab": ["10:00-14:00"] }
  function parseSchedule(scheduleStr: string): Record<string, string[]> {
    const scheduleObj: Record<string, string[]> = {};
    scheduleStr.split(',').forEach(part => {
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
    return Object.keys(scheduleObj).length > 0 ? scheduleObj : { 'Lun-Dom': ['9:00-21:00'] };
  }

  // Get only changed fields for update mutation
  function getChangedFields(): Record<string, unknown> {
    if (!originalValues) return {};
    
    const changes: Record<string, unknown> = {};
    
    if (name !== originalValues.name) changes.name = name;
    if (address !== originalValues.address) changes.address = address || undefined;
    if (phone !== originalValues.phone) changes.phone = phone;
    if (schedule !== originalValues.schedule) changes.schedule = parseSchedule(schedule);
    if (deliveryRadius !== originalValues.deliveryRadius) {
      changes.deliveryRadius = deliveryRadius ? Number(deliveryRadius) : undefined;
    }
    if (avatarPath !== originalValues.avatar) changes.avatar = avatarPath || undefined;
    if (coverPath !== originalValues.coverImage) changes.coverImage = coverPath || undefined;
    
    return changes;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    isSubmitting = true;
    errorMessage = '';

    try {
      if (isEditMode && branch) {
        // Update existing branch
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
              mutation UpdateBranch(
                $branchId: String!
                $input: UpdateBranchInput!
                $jwt: String
              ) {
                updateBranch(branchId: $branchId, input: $input, jwt: $jwt) {
                  id
                  name
                  address
                  phone
                  status
                  avatarUrl
                  coverUrl
                }
              }
            `,
            variables: {
              jwt,
              branchId: branch.id,
              input: changedFields,
            },
          }),
        });

        const result = await response.json();

        if (result.errors) {
          throw new Error(result.errors[0]?.message || 'Error al actualizar la sucursal');
        }

        if (result.data?.updateBranch) {
          successMessage = '¡Sucursal actualizada correctamente!';
          onBranchUpdated?.(result.data.updateBranch);
        }
      } else {
        // Create new branch
        const scheduleObj = parseSchedule(schedule);

        const response = await fetch(`${BACKEND_URL}/graphql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            query: `
              mutation CreateBranch($input: CreateBranchInput!, $jwt: String) {
                createBranch(input: $input, jwt: $jwt) {
                  id
                  name
                  address
                  phone
                  status
                  avatarUrl
                  coverUrl
                }
              }
            `,
            variables: {
              jwt,
              input: {
                businessId: business.id,
                name: name || `${business.name} - Nueva Sucursal`,
                coordinates: { lat: coordinates.lat, lng: coordinates.lng },
                phone,
                schedule: scheduleObj,
                address,
                deliveryRadius: deliveryRadius ? Number(deliveryRadius) : undefined,
                avatar: avatarPath || undefined,
                coverImage: coverPath || undefined,
              },
            },
          }),
        });

        const result = await response.json();

        if (result.errors) {
          throw new Error(result.errors[0]?.message || 'Error al crear la sucursal');
        }

        if (result.data?.createBranch) {
          successMessage = '¡Sucursal creada correctamente!';
          onBranchCreated(result.data.createBranch);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      errorMessage = error instanceof Error ? error.message : 'Error al procesar la sucursal';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="branch-form-container">
  <div class="form-header">
    <div class="form-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>
    <div>
      <h2 class="form-title">{isEditMode ? 'Editar Sucursal' : 'Nueva Sucursal'}</h2>
      <p class="form-subtitle">{isEditMode ? `Actualizar ${branch?.name}` : `Agregar sucursal a ${business.name}`}</p>
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

  <form class="branch-form" onsubmit={handleSubmit}>
    <!-- Basic Info Section -->
    <div class="form-section">
      <h3 class="section-title">Información Básica</h3>

      <!-- Name -->
      <div class="form-group">
        <label for="branch-name">Nombre de la sucursal</label>
        <input
          type="text"
          id="branch-name"
          bind:value={name}
          placeholder="Ej: Sucursal Centro"
        />
      </div>

      <!-- Address -->
      <div class="form-group">
        <label for="branch-address">
          Dirección
          <span class="required">*</span>
        </label>
        <input
          type="text"
          id="branch-address"
          bind:value={address}
          placeholder="Ej: Av. Principal #123"
          required
        />
      </div>

      <!-- Phone -->
      <div class="form-group">
        <label for="branch-phone">
          Teléfono
          <span class="required">*</span>
        </label>
        <input
          type="tel"
          id="branch-phone"
          bind:value={phone}
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
          bind:value={schedule}
          placeholder="Ej: Lun-Vie: 9:00-18:00"
        />
        <span class="input-hint">Separa múltiples horarios con comas</span>
      </div>

      <!-- Delivery Radius -->
      <div class="form-group">
        <label for="branch-radius">Radio de entrega (km)</label>
        <input
          type="number"
          id="branch-radius"
          bind:value={deliveryRadius}
          placeholder="Ej: 5"
          step="0.5"
          min="0"
        />
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
        Imágenes
      </h3>

      <div class="images-grid">
        <!-- Avatar -->
        <ImageUploader
          endpoint="/upload/branch/avatar"
          {jwt}
          label="Avatar"
          currentImageUrl={branch?.avatarUrl}
          aspectRatio="square"
          onUploadComplete={handleAvatarUpload}
          onError={handleImageError}
        />

        <!-- Cover -->
        <ImageUploader
          endpoint="/upload/branch/cover"
          {jwt}
          label="Portada"
          currentImageUrl={branch?.coverUrl}
          aspectRatio="wide"
          onUploadComplete={handleCoverUpload}
          onError={handleImageError}
        />
      </div>
    </div>

    <!-- Location Section -->
    <div class="form-section">
      <h3 class="section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        Ubicación
      </h3>

      <LocationPicker
        initialLat={getInitialLat()}
        initialLng={getInitialLng()}
        onLocationChange={handleLocationChange}
      />
    </div>

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
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            {/if}
          </svg>
          {isEditMode ? 'Guardar Cambios' : 'Agregar Sucursal'}
        {/if}
      </button>
    </div>
  </form>
</div>


<style>
  .branch-form-container {
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
    background: linear-gradient(135deg, rgba(225, 199, 142, 0.2) 0%, rgba(178, 214, 154, 0.2) 100%);
    border-radius: var(--radius-lg);
    color: var(--color-secondary);
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

  .branch-form {
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

  .form-group input {
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

  .form-group input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--color-secondary);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 4px rgba(225, 199, 142, 0.1);
  }

  .input-hint {
    font-size: var(--font-size-xs);
    color: rgba(255, 255, 255, 0.4);
  }

  .images-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--spacing-xl);
    align-items: start;
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

  @media (max-width: 640px) {
    .images-grid {
      grid-template-columns: 1fr;
    }
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
