<script lang="ts">
  import type { Tutorial, AppTarget } from "@/lib/tutorial";

  interface Props {
    tutorials: Tutorial[];
    onDelete: (id: string) => void;
    onToggleActive: (id: string) => void;
    onEdit: (tutorial: Tutorial) => void;
  }

  let { tutorials, onDelete, onToggleActive, onEdit }: Props = $props();

  let searchQuery = $state("");
  let filterAppTarget = $state<AppTarget | "ALL">("ALL");
  let deleteConfirmId = $state<string | null>(null);

  const filteredTutorials = $derived(
    tutorials.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      const matchesFilter =
        filterAppTarget === "ALL" || t.appTarget === filterAppTarget;
      return matchesSearch && matchesFilter;
    }),
  );

  function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  function getAppTargetLabel(appTarget: AppTarget): string {
    const labels = {
      CUSTOMER: "Clientes",
      MERCHANT: "Comerciantes",
      BOTH: "Ambos",
    };
    return labels[appTarget] || appTarget;
  }

  function confirmDelete(id: string) {
    deleteConfirmId = id;
  }

  function cancelDelete() {
    deleteConfirmId = null;
  }

  function executeDelete(id: string) {
    onDelete(id);
    deleteConfirmId = null;
  }
</script>

<div class="tutorial-list-container">
  <div class="list-header">
    <div class="header-info">
      <div class="list-icon">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      </div>
      <div>
        <h2 class="list-title">Tus Tutoriales</h2>
        <p class="list-subtitle">
          {tutorials.length}
          {tutorials.length === 1 ? "tutorial" : "tutoriales"} en total
        </p>
      </div>
    </div>
  </div>

  {#if tutorials.length > 0}
    <div class="filters-container">
      <div class="search-container">
        <svg
          class="search-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          class="search-input"
          placeholder="Buscar tutoriales..."
          bind:value={searchQuery}
        />
        {#if searchQuery}
          <button class="clear-search" onclick={() => (searchQuery = "")}>
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
          </button>
        {/if}
      </div>

      <div class="filter-tabs">
        <button
          class="filter-tab"
          class:active={filterAppTarget === "ALL"}
          onclick={() => (filterAppTarget = "ALL")}
        >
          Todos
        </button>
        <button
          class="filter-tab"
          class:active={filterAppTarget === "CUSTOMER"}
          onclick={() => (filterAppTarget = "CUSTOMER")}
        >
          Clientes
        </button>
        <button
          class="filter-tab"
          class:active={filterAppTarget === "MERCHANT"}
          onclick={() => (filterAppTarget = "MERCHANT")}
        >
          Comerciantes
        </button>
        <button
          class="filter-tab"
          class:active={filterAppTarget === "BOTH"}
          onclick={() => (filterAppTarget = "BOTH")}
        >
          Ambos
        </button>
      </div>
    </div>
  {/if}

  <div class="tutorials-wrapper">
    {#if tutorials.length === 0}
      <div class="empty-state">
        <div class="empty-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </div>
        <h3>Sin tutoriales aún</h3>
        <p>Agrega tu primer tutorial usando el formulario</p>
      </div>
    {:else if filteredTutorials.length === 0}
      <div class="empty-state">
        <div class="empty-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h3>Sin resultados</h3>
        <p>No se encontraron tutoriales para "{searchQuery}"</p>
      </div>
    {:else}
      <div class="tutorials-list">
        {#each filteredTutorials as tutorial (tutorial.id)}
          <div class="tutorial-card" class:inactive={!tutorial.isActive}>
            {#if tutorial.thumbnailUrlSigned}
              <div class="tutorial-thumbnail">
                <img
                  src={tutorial.thumbnailUrlSigned}
                  alt={tutorial.title}
                  onerror={(e) => (e.currentTarget.style.display = "none")}
                />
                <div class="play-overlay">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </div>
            {:else}
              <div class="tutorial-thumbnail-placeholder">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            {/if}

            <div class="tutorial-content">
              <div class="tutorial-header">
                <h3 class="tutorial-title">{tutorial.title}</h3>
                <span class="tutorial-duration"
                  >{formatDuration(tutorial.duration)}</span
                >
              </div>

              <p class="tutorial-description">{tutorial.description}</p>

              <div class="tutorial-meta">
                <span class="tutorial-app-target"
                  >{getAppTargetLabel(tutorial.appTarget)}</span
                >
                <span class="tutorial-order">Orden: {tutorial.order}</span>
                {#if tutorial.tags.length > 0}
                  {#each tutorial.tags.slice(0, 2) as tag}
                    <span class="tutorial-tag">{tag}</span>
                  {/each}
                  {#if tutorial.tags.length > 2}
                    <span class="tutorial-tag-more"
                      >+{tutorial.tags.length - 2}</span
                    >
                  {/if}
                {/if}
              </div>

              <div class="tutorial-actions">
                <button
                  class="action-btn toggle-btn"
                  class:active={tutorial.isActive}
                  onclick={() => onToggleActive(tutorial.id)}
                  title={tutorial.isActive ? "Desactivar" : "Activar"}
                >
                  {#if tutorial.isActive}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Activo
                  {:else}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                      />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                    Inactivo
                  {/if}
                </button>

                <button
                  class="action-btn edit-btn"
                  onclick={() => onEdit(tutorial)}
                  title="Editar tutorial"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                    />
                    <path
                      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                    />
                  </svg>
                  Editar
                </button>

                {#if deleteConfirmId === tutorial.id}
                  <div class="delete-confirm">
                    <span>¿Eliminar?</span>
                    <button
                      class="confirm-yes"
                      onclick={() => executeDelete(tutorial.id)}>Sí</button
                    >
                    <button class="confirm-no" onclick={cancelDelete}>No</button
                    >
                  </div>
                {:else}
                  <button
                    class="action-btn delete-btn"
                    onclick={() => confirmDelete(tutorial.id)}
                    title="Eliminar tutorial"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path
                        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                      />
                    </svg>
                  </button>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .tutorial-list-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--spacing-lg);
  }

  .header-info {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .list-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      rgba(225, 199, 142, 0.2) 0%,
      rgba(211, 170, 122, 0.2) 100%
    );
    border-radius: var(--radius-lg);
    color: var(--color-secondary);
    flex-shrink: 0;
  }

  .list-title {
    font-size: var(--font-size-xl);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 2px;
  }

  .list-subtitle {
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
  }

  /* Filters */
  .filters-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .search-container {
    position: relative;
  }

  .search-icon {
    position: absolute;
    left: var(--spacing-lg);
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-variant);
  }

  .search-input {
    width: 100%;
    padding: var(--spacing-md) var(--spacing-lg);
    padding-left: calc(var(--spacing-lg) + 26px);
    font-size: var(--font-size-base);
    color: var(--color-text);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-lg);
    transition: all var(--transition-base);
  }

  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-secondary);
    background: rgba(255, 255, 255, 0.08);
  }

  .clear-search {
    position: absolute;
    right: var(--spacing-md);
    top: 50%;
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-variant);
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transition: all var(--transition-base);
  }

  .clear-search:hover {
    color: var(--color-text);
    background: rgba(255, 255, 255, 0.15);
  }

  .filter-tabs {
    display: flex;
    gap: var(--spacing-xs);
    padding: 4px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: var(--radius-lg);
    overflow-x: auto;
  }

  .filter-tab {
    flex: 1;
    min-width: fit-content;
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text-variant);
    background: transparent;
    border-radius: var(--radius-md);
    transition: all var(--transition-base);
  }

  .filter-tab:hover {
    color: var(--color-text);
    background: rgba(255, 255, 255, 0.05);
  }

  .filter-tab.active {
    color: var(--color-primary);
    background: linear-gradient(
      135deg,
      var(--color-secondary) 0%,
      var(--color-accent) 100%
    );
    font-weight: 600;
  }

  /* Tutorials Wrapper */
  .tutorials-wrapper {
    flex: 1;
    overflow-y: auto;
    margin: 0 calc(var(--spacing-lg) * -1);
    padding: 0 var(--spacing-lg);
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--spacing-3xl) var(--spacing-lg);
  }

  .empty-icon {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
    color: var(--color-text-variant);
    margin-bottom: var(--spacing-lg);
  }

  .empty-state h3 {
    font-size: var(--font-size-lg);
    font-weight: 600;
    margin-bottom: var(--spacing-xs);
  }

  .empty-state p {
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
  }

  /* Tutorials List */
  .tutorials-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .tutorial-card {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-xl);
    transition: all var(--transition-base);
  }

  .tutorial-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .tutorial-card.inactive {
    opacity: 0.6;
  }

  .tutorial-thumbnail,
  .tutorial-thumbnail-placeholder {
    width: 160px;
    height: 90px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    flex-shrink: 0;
  }

  .tutorial-thumbnail {
    position: relative;
  }

  .tutorial-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
    color: #fff;
    opacity: 0;
    transition: opacity var(--transition-base);
  }

  .tutorial-card:hover .play-overlay {
    opacity: 1;
  }

  .tutorial-thumbnail-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    color: var(--color-text-variant);
  }

  .tutorial-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .tutorial-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-md);
  }

  .tutorial-title {
    font-size: var(--font-size-base);
    font-weight: 600;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tutorial-duration {
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--color-text-variant);
    white-space: nowrap;
    background: rgba(255, 255, 255, 0.08);
    padding: 2px 8px;
    border-radius: var(--radius-sm);
  }

  .tutorial-description {
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .tutorial-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    flex-wrap: wrap;
  }

  .tutorial-app-target {
    font-size: var(--font-size-xs);
    color: var(--color-secondary);
    background: rgba(225, 199, 142, 0.15);
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    font-weight: 500;
  }

  .tutorial-order {
    font-size: var(--font-size-xs);
    color: var(--color-text-variant);
    background: rgba(255, 255, 255, 0.08);
    padding: 2px 8px;
    border-radius: var(--radius-sm);
  }

  .tutorial-tag {
    font-size: var(--font-size-xs);
    color: #5ac8fa;
    background: rgba(90, 200, 250, 0.15);
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    font-weight: 500;
  }

  .tutorial-tag-more {
    font-size: var(--font-size-xs);
    color: var(--color-text-variant);
    background: rgba(255, 255, 255, 0.08);
    padding: 2px 8px;
    border-radius: var(--radius-sm);
  }

  .tutorial-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-top: auto;
    padding-top: var(--spacing-xs);
  }

  .action-btn {
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

  .toggle-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .toggle-btn.active {
    color: #34c759;
    background: rgba(52, 199, 89, 0.1);
  }

  .edit-btn:hover {
    color: #5ac8fa;
    background: rgba(90, 200, 250, 0.1);
  }

  .delete-btn:hover {
    color: #ff6b6b;
    background: rgba(255, 59, 48, 0.1);
  }

  .delete-confirm {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: rgba(255, 59, 48, 0.1);
    border-radius: var(--radius-md);
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .delete-confirm span {
    font-size: var(--font-size-xs);
    color: #ff6b6b;
  }

  .confirm-yes,
  .confirm-no {
    padding: 4px 10px;
    font-size: var(--font-size-xs);
    font-weight: 600;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

  .confirm-yes {
    color: #fff;
    background: #ff3b30;
  }

  .confirm-yes:hover {
    background: #ff6b6b;
  }

  .confirm-no {
    color: var(--color-text-variant);
    background: rgba(255, 255, 255, 0.1);
  }

  .confirm-no:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  @media (max-width: 640px) {
    .tutorial-card {
      flex-direction: column;
    }

    .tutorial-thumbnail,
    .tutorial-thumbnail-placeholder {
      width: 100%;
      height: 180px;
    }

    .tutorial-header {
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .filter-tabs {
      overflow-x: scroll;
    }
  }
</style>
