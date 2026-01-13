<script lang="ts">
  import type { BusinessTypeConfig } from "@/lib/business-type";
  import { deleteBusinessTypeConfig, deactivateBusinessTypeConfig } from "@/lib/business-type";

  interface Props {
    businessTypes: BusinessTypeConfig[];
    jwt: string;
    onSelect: (bt: BusinessTypeConfig) => void;
    onDeleted: (id: string) => void;
    onUpdated: (bt: BusinessTypeConfig) => void;
  }

  let { businessTypes, jwt, onSelect, onDeleted, onUpdated }: Props = $props();

  let deletingId = $state<string | null>(null);
  let confirmDeleteId = $state<string | null>(null);

  async function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      confirmDeleteId = id;
      return;
    }

    deletingId = id;
    try {
      await deleteBusinessTypeConfig(id, jwt);
      onDeleted(id);
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      deletingId = null;
      confirmDeleteId = null;
    }
  }

  async function handleToggleActive(bt: BusinessTypeConfig) {
    try {
      if (bt.isActive) {
        const updated = await deactivateBusinessTypeConfig(bt.id, jwt);
        onUpdated({ ...bt, isActive: updated.isActive });
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  }

  function cancelDelete() {
    confirmDeleteId = null;
  }
</script>

<div class="bt-list-container">
  <div class="bt-list-header">
    <h2 class="bt-list-title">Business Types</h2>
    <span class="bt-list-count">{businessTypes.length} tipos</span>
  </div>

  {#if businessTypes.length === 0}
    <div class="bt-empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
      <p>No hay tipos de negocio</p>
      <span>Crea el primero usando el formulario</span>
    </div>
  {:else}
    <div class="bt-list">
      {#each businessTypes as bt (bt.id)}
        <div class="bt-list-item" class:inactive={!bt.isActive}>
          <button class="bt-item-main" onclick={() => onSelect(bt)}>
            <div class="bt-item-icon" style="background: linear-gradient(135deg, {bt.gradient.darkColor}, {bt.gradient.lightColor})">
              <span>{bt.icon}</span>
            </div>
            <div class="bt-item-info">
              <div class="bt-item-header">
                <span class="bt-item-name">{bt.name}</span>
                <span class="bt-item-key">{bt.key}</span>
              </div>
              <p class="bt-item-description">{bt.description}</p>
              <div class="bt-item-meta">
                <span class="bt-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                  v{bt.model3dVersion}
                </span>
                <span class="bt-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  {bt.features.length} features
                </span>
                <span class="bt-meta-item">
                  Orden: {bt.sortOrder}
                </span>
                {#if !bt.isActive}
                  <span class="bt-status-badge inactive">Inactivo</span>
                {:else}
                  <span class="bt-status-badge active">Activo</span>
                {/if}
              </div>
            </div>
          </button>
          
          <div class="item-actions">
            {#if confirmDeleteId === bt.id}
              <div class="confirm-delete">
                <span>¿Eliminar?</span>
                <button class="confirm-btn" onclick={() => handleDelete(bt.id)} disabled={deletingId === bt.id}>
                  {deletingId === bt.id ? "..." : "Sí"}
                </button>
                <button class="cancel-btn" onclick={cancelDelete}>No</button>
              </div>
            {:else}
              <button class="bt-action-btn edit" onclick={() => onSelect(bt)} title="Editar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button class="bt-action-btn delete" onclick={() => handleDelete(bt.id)} title="Eliminar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

