<script lang="ts">
  import type { Branch, Business } from '@/lib/business';

  interface Props {
    jwt: string;
    business: Business;
    onBranchCreated: (branch: Branch) => void;
    onCancel?: () => void;
  }

  let { jwt, business, onBranchCreated, onCancel }: Props = $props();

  // Branch fields
  let name = $state('');
  let address = $state('');
  let phone = $state('');
  let schedule = $state('Lun-Vie: 9:00-18:00');
  let deliveryRadius = $state<number | ''>('');

  let isSubmitting = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');

  const BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL || '';

  async function handleSubmit(e: Event) {
    e.preventDefault();
    isSubmitting = true;
    errorMessage = '';

    try {
      // Parse schedule string to object
      const scheduleObj: Record<string, string> = {};
      schedule.split(',').forEach(part => {
        const trimmed = part.trim();
        const colonIndex = trimmed.indexOf(':');
        if (colonIndex > 0) {
          const days = trimmed.slice(0, colonIndex).trim();
          const hours = trimmed.slice(colonIndex + 1).trim();
          if (days && hours) {
            scheduleObj[days] = hours;
          }
        }
      });

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
              }
            }
          `,
          variables: {
            jwt,
            input: {
              businessId: business.id,
              name: name || `${business.name} - Nueva Sucursal`,
              coordinates: { lat: 0, lng: 0 },
              phone,
              schedule: Object.keys(scheduleObj).length > 0 ? scheduleObj : { 'Lun-Dom': '9:00-21:00' },
              address,
              deliveryRadius: deliveryRadius ? Number(deliveryRadius) : undefined,
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
    } catch (error) {
      console.error('Error creating branch:', error);
      errorMessage = error instanceof Error ? error.message : 'Error al crear la sucursal';
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
      <h2 class="form-title">Nueva Sucursal</h2>
      <p class="form-subtitle">Agregar sucursal a {business.name}</p>
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

    <div class="form-actions">
      {#if onCancel}
        <button type="button" class="cancel-btn" onclick={onCancel}>
          Cancelar
        </button>
      {/if}
      <button type="submit" class="submit-btn" disabled={isSubmitting}>
        {#if isSubmitting}
          <span class="spinner"></span>
          Creando...
        {:else}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Agregar Sucursal
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

  .form-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: flex-end;
    margin-top: var(--spacing-md);
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
