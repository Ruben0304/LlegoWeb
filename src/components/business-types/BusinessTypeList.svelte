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

<div class="list-container">
  <div class="list-header">
    <h2 class="list-title">Business Types</h2>
    <span class="list-count">{businessTypes.length} tipos</span>
  </div>

  {#if businessTypes.length === 0}
    <div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
      <p>No hay tipos de negocio</p>
      <span>Crea el primero usando el formulario</span>
    </div>
  {:else}
    <div class="list">
      {#each businessTypes as bt (bt.id)}
        <div class="list-item" class:inactive={!bt.isActive}>
          <button class="item-main" onclick={() => onSelect(bt)}>
            <div class="item-icon" style="background: linear-gradient(135deg, {bt.gradient.darkColor}, {bt.gradient.lightColor})">
              <span>{bt.icon}</span>
            </div>
            <div class="item-info">
              <div class="item-header">
                <span class="item-name">{bt.name}</span>
                <span class="item-key">{bt.key}</span>
              </div>
              <p class="item-description">{bt.description}</p>
              <div class="item-meta">
                <span class="meta-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                  v{bt.model3dVersion}
                </span>
                <span class="meta-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  {bt.features.length} features
                </span>
                <span class="meta-item">
                  Orden: {bt.sortOrder}
                </span>
                {#if !bt.isActive}
                  <span class="status-badge inactive">Inactivo</span>
                {:else}
                  <span class="status-badge active">Activo</span>
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
              <button class="action-btn edit" onclick={() => onSelect(bt)} title="Editar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button class="action-btn delete" onclick={() => handleDelete(bt.id)} title="Eliminar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

<style>
  .list-container {
    height: 100%;
  }

  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--spacing-lg);
  }

  .list-title {
    font-size: var(--font-size-xl);
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .list-count {
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-full);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-3xl);
    text-align: center;
    color: var(--color-text-variant);
  }

  .empty-state svg {
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
  }

  .empty-state p {
    font-size: var(--font-size-base);
    font-weight: 500;
    margin-bottom: var(--spacing-xs);
  }

  .empty-state span {
    font-size: var(--font-size-sm);
    opacity: 0.7;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .list-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-xl);
    transition: all var(--transition-base);
  }

  .list-item:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .list-item.inactive {
    opacity: 0.6;
  }

  .item-main {
    flex: 1;
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
  }

  .item-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-lg);
    font-size: 24px;
    flex-shrink: 0;
  }

  .item-info {
    flex: 1;
    min-width: 0;
  }

  .item-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
  }

  .item-name {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-text);
  }

  .item-key {
    font-size: var(--font-size-xs);
    color: var(--color-secondary);
    padding: 2px 6px;
    background: rgba(225, 199, 142, 0.1);
    border-radius: var(--radius-sm);
  }

  .item-description {
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
    margin-bottom: var(--spacing-sm);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    flex-wrap: wrap;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: var(--font-size-xs);
    color: rgba(255, 255, 255, 0.5);
  }

  .status-badge {
    font-size: var(--font-size-xs);
    padding: 2px 8px;
    border-radius: var(--radius-full);
  }

  .status-badge.active {
    background: rgba(52, 199, 89, 0.1);
    color: #34c759;
  }

  .status-badge.inactive {
    background: rgba(255, 59, 48, 0.1);
    color: #ff6b6b;
  }

  .item-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .action-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    transition: all var(--transition-base);
  }

  .action-btn.edit {
    color: var(--color-text-variant);
    background: rgba(255, 255, 255, 0.05);
  }

  .action-btn.edit:hover {
    color: var(--color-secondary);
    background: rgba(225, 199, 142, 0.1);
  }

  .action-btn.delete {
    color: var(--color-text-variant);
    background: rgba(255, 255, 255, 0.05);
  }

  .action-btn.delete:hover {
    color: #ff6b6b;
    background: rgba(255, 59, 48, 0.1);
  }

  .confirm-delete {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-xs);
  }

  .confirm-delete span {
    color: #ff6b6b;
  }

  .confirm-btn {
    padding: 4px 8px;
    font-size: var(--font-size-xs);
    color: #fff;
    background: #ff6b6b;
    border-radius: var(--radius-sm);
  }

  .confirm-btn:hover {
    background: #ff5252;
  }

  .cancel-btn {
    padding: 4px 8px;
    font-size: var(--font-size-xs);
    color: var(--color-text-variant);
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-sm);
  }

  .cancel-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }
</style>
