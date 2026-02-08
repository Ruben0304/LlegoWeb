<script lang="ts">
  import {
    uploadProductImage,
    createProduct,
    getProductCategories,
  } from "@/lib/product";
  import type {
    DraftProduct,
    DetectedProduct,
    Product,
    ProductCategory,
  } from "@/lib/product";
  import { onMount } from "svelte";

  interface Props {
    detectedProducts: DetectedProduct[];
    branchId: string;
    branchTypes: string[];
    jwt: string;
    onAllCreated: () => void;
    onCancel: () => void;
  }

  let {
    detectedProducts,
    branchId,
    branchTypes,
    jwt,
    onAllCreated,
    onCancel,
  }: Props = $props();

  let drafts = $state<DraftProduct[]>([]);
  let isBatchCreating = $state(false);
  let batchProgress = $state(0);
  let batchTotal = $state(0);
  let batchError = $state("");
  let batchSuccess = $state("");

  // Categories
  let categories = $state<ProductCategory[]>([]);
  let isLoadingCategories = $state(false);

  // Initialize drafts from detected products
  $effect(() => {
    if (detectedProducts.length > 0 && drafts.length === 0) {
      drafts = detectedProducts.map((p, i) => ({
        ...p,
        _id: `draft-${Date.now()}-${i}`,
        _imageFile: null,
        _imagePreview: "",
        _expanded: false,
        _status: "pending" as const,
        _error: undefined,
        categoryId: undefined,
      }));
    }
  });

  let pendingDrafts = $derived(drafts.filter((d) => d._status === "pending"));
  let completedDrafts = $derived(drafts.filter((d) => d._status === "done"));
  let errorDrafts = $derived(drafts.filter((d) => d._status === "error"));

  async function loadCategories() {
    if (branchTypes.length === 0) return;
    isLoadingCategories = true;
    try {
      const promises = branchTypes.map((bt) => getProductCategories(bt, jwt));
      const results = await Promise.all(promises);
      const allCats = results.flatMap((r) => r.productCategories || []);
      categories = Array.from(
        new Map(allCats.map((c) => [c.id, c])).values(),
      );
    } catch (e) {
      console.error("Error loading categories:", e);
    } finally {
      isLoadingCategories = false;
    }
  }

  onMount(() => {
    loadCategories();
  });

  function toggleExpand(draftId: string) {
    drafts = drafts.map((d) =>
      d._id === draftId ? { ...d, _expanded: !d._expanded } : d,
    );
  }

  function updateDraft(
    draftId: string,
    updates: Partial<DraftProduct>,
  ) {
    drafts = drafts.map((d) =>
      d._id === draftId ? { ...d, ...updates } : d,
    );
  }

  function removeDraft(draftId: string) {
    drafts = drafts.filter((d) => d._id !== draftId);
  }

  function handleImageSelect(draftId: string, e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      updateDraft(draftId, {
        _imageFile: file,
        _imagePreview: ev.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  }

  function removeImage(draftId: string) {
    updateDraft(draftId, {
      _imageFile: null,
      _imagePreview: "",
    });
  }

  function formatPrice(price: number, currency?: string) {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(price);
  }

  async function createSingleProduct(draft: DraftProduct): Promise<boolean> {
    updateDraft(draft._id, { _status: "uploading" });

    try {
      let imagePath = "";

      // Upload image if one was selected
      if (draft._imageFile) {
        updateDraft(draft._id, { _status: "uploading" });
        const uploadResp = await uploadProductImage(draft._imageFile, jwt);
        imagePath = uploadResp.image_path;
      }

      // Create product via GraphQL
      updateDraft(draft._id, { _status: "creating" });
      await createProduct(
        {
          branchId,
          name: draft.name,
          description: draft.description,
          price: draft.price,
          currency: draft.currency || "USD",
          image: imagePath,
          weight: draft.weight || undefined,
          categoryId: draft.categoryId || undefined,
        },
        jwt,
      );

      updateDraft(draft._id, { _status: "done" });
      return true;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Error al crear producto";
      updateDraft(draft._id, { _status: "error", _error: msg });
      return false;
    }
  }

  async function handleBatchCreate() {
    const toCreate = drafts.filter(
      (d) => d._status === "pending" || d._status === "error",
    );
    if (toCreate.length === 0) return;

    isBatchCreating = true;
    batchProgress = 0;
    batchTotal = toCreate.length;
    batchError = "";
    batchSuccess = "";

    let successes = 0;
    let failures = 0;

    for (const draft of toCreate) {
      const ok = await createSingleProduct(draft);
      if (ok) successes++;
      else failures++;
      batchProgress++;
    }

    isBatchCreating = false;

    if (failures === 0) {
      batchSuccess = `${successes} producto${successes !== 1 ? "s" : ""} creado${successes !== 1 ? "s" : ""} correctamente`;
      setTimeout(() => {
        onAllCreated();
      }, 1500);
    } else {
      batchError = `${successes} creado${successes !== 1 ? "s" : ""}, ${failures} con error. Puedes reintentar los que fallaron.`;
    }
  }

  function retryFailed() {
    drafts = drafts.map((d) =>
      d._status === "error" ? { ...d, _status: "pending" as const, _error: undefined } : d,
    );
    batchError = "";
  }
</script>

<div class="draft-list-container">
  <div class="draft-header">
    <div class="draft-header-info">
      <div class="draft-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      </div>
      <div>
        <h3 class="draft-title">Borrador de productos</h3>
        <p class="draft-subtitle">
          {drafts.length} producto{drafts.length !== 1 ? "s" : ""} detectado{drafts.length !== 1 ? "s" : ""}
          {#if completedDrafts.length > 0}
            &middot; {completedDrafts.length} creado{completedDrafts.length !== 1 ? "s" : ""}
          {/if}
        </p>
      </div>
    </div>
    <button type="button" class="cancel-btn" onclick={onCancel} disabled={isBatchCreating}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
      Cancelar
    </button>
  </div>

  {#if batchSuccess}
    <div class="success-message">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      {batchSuccess}
    </div>
  {/if}

  {#if batchError}
    <div class="error-banner">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>{batchError}</span>
      <button type="button" class="retry-btn" onclick={retryFailed}>Reintentar</button>
    </div>
  {/if}

  {#if isBatchCreating}
    <div class="progress-bar-container">
      <div class="progress-bar">
        <div class="progress-fill" style="width: {(batchProgress / batchTotal) * 100}%"></div>
      </div>
      <span class="progress-text">{batchProgress} / {batchTotal}</span>
    </div>
  {/if}

  <div class="drafts-list">
    {#each drafts as draft (draft._id)}
      <div class="draft-card" class:done={draft._status === "done"} class:error={draft._status === "error"} class:processing={draft._status === "uploading" || draft._status === "creating"}>
        <!-- Compact row -->
        <div class="draft-compact" onclick={() => draft._status === "pending" || draft._status === "error" ? toggleExpand(draft._id) : null}>
          <div class="draft-status-indicator">
            {#if draft._status === "done"}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34c759" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            {:else if draft._status === "error"}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            {:else if draft._status === "uploading" || draft._status === "creating"}
              <span class="spinner-sm"></span>
            {:else if draft._imagePreview}
              <div class="draft-thumb">
                <img src={draft._imagePreview} alt="" />
              </div>
            {:else}
              <div class="draft-thumb-placeholder">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
            {/if}
          </div>

          <div class="draft-compact-info">
            <span class="draft-name">{draft.name}</span>
            <span class="draft-price">{formatPrice(draft.price, draft.currency)}</span>
          </div>

          {#if draft._status === "pending" || draft._status === "error"}
            <div class="draft-compact-actions">
              <button type="button" class="expand-btn" onclick={(e) => { e.stopPropagation(); toggleExpand(draft._id); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  class:rotated={draft._expanded}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              <button type="button" class="remove-draft-btn" onclick={(e) => { e.stopPropagation(); removeDraft(draft._id); }} title="Eliminar borrador">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          {/if}

          {#if draft._status === "uploading"}
            <span class="status-label uploading">Subiendo foto...</span>
          {:else if draft._status === "creating"}
            <span class="status-label creating">Creando...</span>
          {/if}
        </div>

        {#if draft._error}
          <div class="draft-error">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {draft._error}
          </div>
        {/if}

        <!-- Expanded details -->
        {#if draft._expanded && (draft._status === "pending" || draft._status === "error")}
          <div class="draft-expanded">
            <!-- Image upload for this draft -->
            <div class="draft-field">
              <label class="draft-label">Foto del producto</label>
              {#if draft._imagePreview}
                <div class="draft-image-preview">
                  <img src={draft._imagePreview} alt={draft.name} />
                  <button type="button" class="remove-img-sm" onclick={() => removeImage(draft._id)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              {:else}
                <label class="add-photo-btn">
                  <input
                    type="file"
                    accept="image/*"
                    class="file-input-hidden"
                    onchange={(e) => handleImageSelect(draft._id, e)}
                  />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  Agregar foto
                </label>
              {/if}
            </div>

            <!-- Editable fields -->
            <div class="draft-field">
              <label class="draft-label">Nombre</label>
              <input
                type="text"
                class="draft-input"
                value={draft.name}
                oninput={(e) => updateDraft(draft._id, { name: (e.target as HTMLInputElement).value })}
              />
            </div>

            <div class="draft-field">
              <label class="draft-label">Descripción</label>
              <textarea
                class="draft-input draft-textarea"
                rows="2"
                value={draft.description}
                oninput={(e) => updateDraft(draft._id, { description: (e.target as HTMLTextAreaElement).value })}
              ></textarea>
            </div>

            <div class="draft-field-row">
              <div class="draft-field flex-2">
                <label class="draft-label">Precio</label>
                <input
                  type="number"
                  class="draft-input"
                  step="0.01"
                  min="0"
                  value={draft.price}
                  oninput={(e) => updateDraft(draft._id, { price: parseFloat((e.target as HTMLInputElement).value) || 0 })}
                />
              </div>
              <div class="draft-field flex-1">
                <label class="draft-label">Moneda</label>
                <select
                  class="draft-input"
                  value={draft.currency}
                  onchange={(e) => updateDraft(draft._id, { currency: (e.target as HTMLSelectElement).value })}
                >
                  <option value="USD">USD</option>
                  <option value="CUP">CUP</option>
                </select>
              </div>
            </div>

            <div class="draft-field">
              <label class="draft-label">Peso / Unidad</label>
              <input
                type="text"
                class="draft-input"
                placeholder="Ej: 500g, 1kg"
                value={draft.weight}
                oninput={(e) => updateDraft(draft._id, { weight: (e.target as HTMLInputElement).value })}
              />
            </div>

            {#if categories.length > 0}
              <div class="draft-field">
                <label class="draft-label">Categoría</label>
                <select
                  class="draft-input"
                  value={draft.categoryId || ""}
                  onchange={(e) => updateDraft(draft._id, { categoryId: (e.target as HTMLSelectElement).value || undefined })}
                >
                  <option value="">Sin categoría</option>
                  {#each categories as cat}
                    <option value={cat.id}>{cat.name}</option>
                  {/each}
                </select>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  {#if drafts.length > 0 && !batchSuccess}
    <button
      type="button"
      class="batch-create-btn"
      disabled={isBatchCreating || pendingDrafts.length === 0 && errorDrafts.length === 0}
      onclick={handleBatchCreate}
    >
      {#if isBatchCreating}
        <span class="spinner"></span>
        Creando productos...
      {:else}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Aceptar creación ({pendingDrafts.length + errorDrafts.length} producto{pendingDrafts.length + errorDrafts.length !== 1 ? "s" : ""})
      {/if}
    </button>
  {/if}
</div>

<style>
  .draft-list-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .draft-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-md);
  }

  .draft-header-info {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .draft-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(255, 204, 0, 0.2) 0%, rgba(255, 159, 10, 0.2) 100%);
    border-radius: var(--radius-lg);
    color: #ffcc00;
    flex-shrink: 0;
  }

  .draft-title {
    font-size: var(--font-size-xl);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 2px;
  }

  .draft-subtitle {
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
  }

  .cancel-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text-variant);
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-full);
    transition: all var(--transition-base);
    flex-shrink: 0;
  }

  .cancel-btn:hover:not(:disabled) {
    color: #ff6b6b;
    background: rgba(255, 59, 48, 0.1);
  }

  .cancel-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
    animation: slideIn 0.3s ease;
  }

  .error-banner {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: rgba(255, 59, 48, 0.1);
    border: 1px solid rgba(255, 59, 48, 0.3);
    border-radius: var(--radius-md);
    color: #ff6b6b;
    font-size: var(--font-size-sm);
    flex-wrap: wrap;
  }

  .error-banner span {
    flex: 1;
  }

  .retry-btn {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: #ff6b6b;
    background: rgba(255, 59, 48, 0.15);
    border-radius: var(--radius-md);
    transition: all var(--transition-base);
  }

  .retry-btn:hover {
    background: rgba(255, 59, 48, 0.25);
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .progress-bar-container {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .progress-bar {
    flex: 1;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #34c759, #30d158);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: var(--font-size-xs);
    color: var(--color-text-variant);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .drafts-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .draft-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: all var(--transition-base);
  }

  .draft-card:hover {
    border-color: rgba(255, 255, 255, 0.1);
  }

  .draft-card.done {
    opacity: 0.6;
    border-color: rgba(52, 199, 89, 0.2);
  }

  .draft-card.error {
    border-color: rgba(255, 59, 48, 0.3);
  }

  .draft-card.processing {
    border-color: rgba(90, 200, 250, 0.3);
    background: rgba(90, 200, 250, 0.03);
  }

  .draft-compact {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    cursor: pointer;
  }

  .draft-card.done .draft-compact,
  .draft-card.processing .draft-compact {
    cursor: default;
  }

  .draft-status-indicator {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .draft-thumb {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .draft-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .draft-thumb-placeholder {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-md);
    color: var(--color-text-variant);
  }

  .spinner-sm {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(90, 200, 250, 0.2);
    border-top-color: #5ac8fa;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .draft-compact-info {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-sm);
  }

  .draft-name {
    font-size: var(--font-size-sm);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .draft-price {
    font-size: var(--font-size-sm);
    font-weight: 700;
    color: var(--color-accent);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .draft-compact-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    flex-shrink: 0;
  }

  .expand-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-variant);
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-md);
    transition: all var(--transition-base);
  }

  .expand-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .expand-btn svg {
    transition: transform 0.2s ease;
  }

  .expand-btn svg.rotated {
    transform: rotate(180deg);
  }

  .remove-draft-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-variant);
    background: transparent;
    border-radius: var(--radius-md);
    transition: all var(--transition-base);
  }

  .remove-draft-btn:hover {
    color: #ff6b6b;
    background: rgba(255, 59, 48, 0.1);
  }

  .status-label {
    font-size: var(--font-size-xs);
    font-weight: 500;
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .status-label.uploading {
    color: #5ac8fa;
    background: rgba(90, 200, 250, 0.1);
  }

  .status-label.creating {
    color: #ffcc00;
    background: rgba(255, 204, 0, 0.1);
  }

  .draft-error {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-xs);
    color: #ff6b6b;
    background: rgba(255, 59, 48, 0.05);
  }

  .draft-expanded {
    padding: 0 var(--spacing-md) var(--spacing-md);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding-top: var(--spacing-md);
    animation: expandIn 0.2s ease;
  }

  @keyframes expandIn {
    from { opacity: 0; max-height: 0; }
    to { opacity: 1; max-height: 600px; }
  }

  .draft-field {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .draft-field-row {
    display: flex;
    gap: var(--spacing-md);
  }

  .flex-1 { flex: 1; }
  .flex-2 { flex: 2; }

  .draft-label {
    font-size: var(--font-size-xs);
    font-weight: 500;
    color: var(--color-text-variant);
  }

  .draft-input {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-sm);
    font-family: inherit;
    color: var(--color-text);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-md);
    transition: all var(--transition-base);
  }

  .draft-input:focus {
    outline: none;
    border-color: var(--color-secondary);
    background: rgba(255, 255, 255, 0.08);
  }

  .draft-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .draft-textarea {
    resize: vertical;
    min-height: 50px;
  }

  select.draft-input {
    appearance: none;
    cursor: pointer;
  }

  .file-input-hidden {
    display: none;
  }

  .add-photo-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-xs);
    font-weight: 500;
    color: var(--color-text-variant);
    background: rgba(255, 255, 255, 0.05);
    border: 1px dashed rgba(255, 255, 255, 0.15);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-base);
    width: fit-content;
  }

  .add-photo-btn:hover {
    color: var(--color-secondary);
    background: rgba(225, 199, 142, 0.1);
    border-color: rgba(225, 199, 142, 0.3);
  }

  .draft-image-preview {
    position: relative;
    display: inline-block;
    width: 80px;
    height: 80px;
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .draft-image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .remove-img-sm {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    border-radius: 50%;
    transition: all var(--transition-base);
  }

  .remove-img-sm:hover {
    background: rgba(255, 59, 48, 0.8);
  }

  .batch-create-btn {
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
  }

  .batch-create-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(225, 199, 142, 0.3);
  }

  .batch-create-btn:disabled {
    opacity: 0.5;
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
    .draft-field-row {
      flex-direction: column;
    }
  }
</style>
