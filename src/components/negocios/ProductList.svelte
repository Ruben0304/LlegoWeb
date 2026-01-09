<script lang="ts">
  import type { Product } from '@/lib/product';

  interface Props {
    products: Product[];
    onDelete: (id: string) => void;
    onToggleAvailability: (id: string) => void;
  }

  let { products, onDelete, onToggleAvailability }: Props = $props();

  let searchQuery = $state('');
  let deleteConfirmId = $state<string | null>(null);

  const filteredProducts = $derived(
    products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  function formatPrice(price: number, currency?: string) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(price);
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

<div class="product-list-container">
  <div class="list-header">
    <div class="header-info">
      <div class="list-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      </div>
      <div>
        <h2 class="list-title">Tus Productos</h2>
        <p class="list-subtitle">{products.length} {products.length === 1 ? 'producto' : 'productos'} en tu catálogo</p>
      </div>
    </div>
  </div>

  {#if products.length > 0}
    <div class="search-container">
      <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="text"
        class="search-input"
        placeholder="Buscar productos..."
        bind:value={searchQuery}
      />
      {#if searchQuery}
        <button class="clear-search" onclick={() => searchQuery = ''}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      {/if}
    </div>
  {/if}

  <div class="products-wrapper">
    {#if products.length === 0}
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
        <h3>Sin productos aún</h3>
        <p>Agrega tu primer producto usando el formulario</p>
      </div>
    {:else if filteredProducts.length === 0}
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <h3>Sin resultados</h3>
        <p>No se encontraron productos para "{searchQuery}"</p>
      </div>
    {:else}
      <div class="products-list">
        {#each filteredProducts as product (product.id)}
          <div class="product-card" class:unavailable={!product.availability}>
            {#if product.imageUrl || product.image}
              <div class="product-image">
                <img src={product.imageUrl || product.image} alt={product.name} onerror={(e) => e.currentTarget.style.display = 'none'} />
              </div>
            {:else}
              <div class="product-image-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
            {/if}

            <div class="product-content">
              <div class="product-header">
                <h3 class="product-name">{product.name}</h3>
                <span class="product-price">{formatPrice(product.price, product.currency)}</span>
              </div>

              <p class="product-description">{product.description}</p>

              <div class="product-meta">
                {#if product.category}
                  <span class="product-category">{product.category.name}</span>
                {/if}
                {#if product.weight}
                  <span class="product-weight">{product.weight}</span>
                {/if}
              </div>

              <div class="product-actions">
                <button
                  class="action-btn toggle-btn"
                  class:active={product.availability}
                  onclick={() => onToggleAvailability(product.id)}
                  title={product.availability ? 'Desactivar' : 'Activar'}
                >
                  {#if product.availability}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Visible
                  {:else}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                    Oculto
                  {/if}
                </button>

                {#if deleteConfirmId === product.id}
                  <div class="delete-confirm">
                    <span>¿Eliminar?</span>
                    <button class="confirm-yes" onclick={() => executeDelete(product.id)}>Sí</button>
                    <button class="confirm-no" onclick={cancelDelete}>No</button>
                  </div>
                {:else}
                  <button
                    class="action-btn delete-btn"
                    onclick={() => confirmDelete(product.id)}
                    title="Eliminar producto"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
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
  .product-list-container {
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
    background: linear-gradient(135deg, rgba(225, 199, 142, 0.2) 0%, rgba(211, 170, 122, 0.2) 100%);
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

  /* Search */
  .search-container {
    position: relative;
    margin-bottom: var(--spacing-lg);
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

  /* Products Wrapper */
  .products-wrapper {
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

  /* Products List */
  .products-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .product-card {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-xl);
    transition: all var(--transition-base);
  }

  .product-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .product-card.unavailable {
    opacity: 0.6;
  }

  .product-image {
    width: 80px;
    height: 80px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    flex-shrink: 0;
  }

  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .product-image-placeholder {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-lg);
    color: var(--color-text-variant);
    flex-shrink: 0;
  }

  .product-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .product-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-md);
  }

  .product-name {
    font-size: var(--font-size-base);
    font-weight: 600;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .product-price {
    font-size: var(--font-size-sm);
    font-weight: 700;
    color: var(--color-accent);
    white-space: nowrap;
  }

  .product-description {
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .product-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    flex-wrap: wrap;
  }

  .product-category {
    font-size: var(--font-size-xs);
    color: var(--color-secondary);
    background: rgba(225, 199, 142, 0.15);
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    font-weight: 500;
  }

  .product-weight {
    font-size: var(--font-size-xs);
    color: var(--color-text-variant);
    background: rgba(255, 255, 255, 0.08);
    padding: 2px 8px;
    border-radius: var(--radius-sm);
  }

  .product-actions {
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
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
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

  @media (max-width: 480px) {
    .product-card {
      flex-direction: column;
    }

    .product-image,
    .product-image-placeholder {
      width: 100%;
      height: 140px;
    }

    .product-header {
      flex-direction: column;
      gap: var(--spacing-xs);
    }
  }
</style>
