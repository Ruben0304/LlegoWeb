<script lang="ts">
    import type { Business, Branch } from "@/lib/business";

    interface Props {
        jwt: string;
        businesses: Business[];
        onBusinessSelected: (business: Business) => void;
        onBranchSelected: (branch: Branch) => void;
        onCreateBusiness: () => void;
        onCreateBranch: (business: Business) => void;
        onDeleteBusiness?: (business: Business) => void;
    }

    let {
        jwt,
        businesses,
        onBusinessSelected,
        onBranchSelected,
        onCreateBusiness,
        onCreateBranch,
        onDeleteBusiness,
    }: Props = $props();

    let selectedBusinessId = $state<string>("");
    let branches = $state<Branch[]>([]);
    let isLoadingBranches = $state(false);
    let errorMessage = $state("");
    let deletingBusinessId = $state<string | null>(null);
    let confirmDeleteId = $state<string | null>(null);

    const BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL || "";

    const selectedBusiness = $derived(
        businesses.find((b) => b.id === selectedBusinessId) || null,
    );

    async function loadBranches(businessId: string) {
        if (!businessId) {
            branches = [];
            return;
        }

        isLoadingBranches = true;
        errorMessage = "";

        try {
            const response = await fetch(`${BACKEND_URL}/graphql`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt}`,
                },
                body: JSON.stringify({
                    query: `
            query GetBranches($first: Int!, $businessId: String!, $jwt: String!) {
              branches(first: $first, businessId: $businessId, jwt: $jwt) {
                edges {
                  node {
                    id
                    businessId
                    name
                    tipos
                    address
                    phone
                    status
                    avatarUrl
                  }
                }
                pageInfo {
                  hasNextPage
                  endCursor
                  totalCount
                }
              }
            }
          `,
                    variables: { first: 100, businessId, jwt },
                }),
            });

            const result = await response.json();

            if (result.errors) {
                throw new Error(
                    result.errors[0]?.message || "Error al cargar sucursales",
                );
            }

            branches = result.data?.branches?.edges?.map((edge: any) => edge.node) || [];
        } catch (error) {
            console.error("Error loading branches:", error);
            errorMessage =
                error instanceof Error
                    ? error.message
                    : "Error al cargar sucursales";
            branches = [];
        } finally {
            isLoadingBranches = false;
        }
    }

    function handleBusinessChange(e: Event) {
        const target = e.target as HTMLSelectElement;
        selectedBusinessId = target.value;

        if (selectedBusinessId && selectedBusiness) {
            onBusinessSelected(selectedBusiness);
            loadBranches(selectedBusinessId);
        } else {
            branches = [];
        }
    }

    function handleBranchClick(branch: Branch) {
        onBranchSelected(branch);
    }

    function handleCreateBranch() {
        if (selectedBusiness) {
            onCreateBranch(selectedBusiness);
        }
    }

    function handleDeleteClick(e: Event, businessId: string) {
        e.stopPropagation();
        confirmDeleteId = businessId;
    }

    function handleCancelDelete() {
        confirmDeleteId = null;
    }

    async function handleConfirmDelete(business: Business) {
        deletingBusinessId = business.id;
        errorMessage = "";

        try {
            const response = await fetch(`${BACKEND_URL}/graphql`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt}`,
                },
                body: JSON.stringify({
                    query: `
                        mutation DeactivateBusiness($businessId: String!, $input: UpdateBusinessInput!, $jwt: String) {
                            updateBusiness(businessId: $businessId, input: $input, jwt: $jwt) {
                                id
                                isActive
                            }
                        }
                    `,
                    variables: { 
                        businessId: business.id, 
                        input: { isActive: false },
                        jwt 
                    },
                }),
            });

            const result = await response.json();

            if (result.errors) {
                throw new Error(
                    result.errors[0]?.message || "Error al desactivar negocio",
                );
            }

            if (selectedBusinessId === business.id) {
                selectedBusinessId = "";
                branches = [];
            }

            confirmDeleteId = null;
            onDeleteBusiness?.(business);
        } catch (error) {
            console.error("Error deactivating business:", error);
            errorMessage =
                error instanceof Error
                    ? error.message
                    : "Error al desactivar negocio";
        } finally {
            deletingBusinessId = null;
        }
    }
</script>

<div class="selector-container">
    <!-- Header -->
    <div class="selector-header">
        <div class="header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        </div>
        <div class="header-content">
            <h2 class="header-title">Seleccionar Ubicación</h2>
            <p class="header-subtitle">Elige el negocio y sucursal</p>
        </div>
    </div>

    {#if errorMessage}
        <div class="alert alert-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMessage}</span>
        </div>
    {/if}

    {#if businesses.length === 0}
        <!-- Empty State -->
        <div class="empty-state">
            <div class="empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            </div>
            <h3 class="empty-title">Sin negocios registrados</h3>
            <p class="empty-description">Crea tu primer negocio para comenzar a agregar productos</p>
            <button class="btn btn-primary" onclick={onCreateBusiness}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Crear Negocio
            </button>
        </div>
    {:else}
        <!-- Business Selection -->
        <div class="section">
            <div class="section-label">
                <span class="label-text">Negocio</span>
                <span class="label-required">*</span>
            </div>
            
            <div class="business-grid">
                {#each businesses as business}
                    <div 
                        class="business-card" 
                        class:selected={selectedBusinessId === business.id}
                        class:deleting={deletingBusinessId === business.id}
                    >
                        {#if confirmDeleteId === business.id}
                            <div class="confirm-overlay">
                                <p class="confirm-message">¿Desactivar este negocio?</p>
                                <div class="confirm-buttons">
                                    <button 
                                        class="btn btn-ghost btn-sm" 
                                        onclick={handleCancelDelete}
                                        disabled={deletingBusinessId === business.id}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        class="btn btn-danger btn-sm" 
                                        onclick={() => handleConfirmDelete(business)}
                                        disabled={deletingBusinessId === business.id}
                                    >
                                        {#if deletingBusinessId === business.id}
                                            <span class="spinner-sm"></span>
                                        {:else}
                                            Desactivar
                                        {/if}
                                    </button>
                                </div>
                            </div>
                        {:else}
                            <button 
                                class="business-card-content"
                                onclick={() => {
                                    selectedBusinessId = business.id;
                                    if (selectedBusiness) {
                                        onBusinessSelected(selectedBusiness);
                                        loadBranches(business.id);
                                    }
                                }}
                            >
                                <div class="business-avatar">
                                    {#if business.avatarUrl}
                                        <img src={business.avatarUrl} alt={business.name} />
                                    {:else}
                                        <span class="avatar-letter">{business.name.charAt(0).toUpperCase()}</span>
                                    {/if}
                                </div>
                                <div class="business-details">
                                    <span class="business-name">{business.name}</span>
                                    <span class="business-type">{business.type}</span>
                                </div>
                                <div class="business-meta">
                                    <span class="status-badge" class:active={business.isActive}>
                                        <span class="status-dot"></span>
                                        {business.isActive ? "Activo" : "Inactivo"}
                                    </span>
                                </div>
                                {#if selectedBusinessId === business.id}
                                    <div class="selected-indicator">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                {/if}
                            </button>
                            {#if onDeleteBusiness}
                                <button 
                                    class="card-action-btn"
                                    onclick={(e) => handleDeleteClick(e, business.id)}
                                    title="Desactivar negocio"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="18" y1="6" x2="6" y2="18"/>
                                        <line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                            {/if}
                        {/if}
                    </div>
                {/each}
            </div>
        </div>

        {#if selectedBusinessId}
            <!-- Branches Section -->
            <div class="section branches-section">
                <div class="section-header">
                    <div class="section-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span class="label-text">Sucursales</span>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick={handleCreateBranch}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Nueva
                    </button>
                </div>

                {#if isLoadingBranches}
                    <div class="loading-state">
                        <span class="spinner"></span>
                        <span class="loading-text">Cargando sucursales...</span>
                    </div>
                {:else if branches.length === 0}
                    <div class="empty-branches">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <p>No hay sucursales registradas</p>
                        <button class="link-btn" onclick={handleCreateBranch}>
                            Crear primera sucursal
                        </button>
                    </div>
                {:else}
                    <div class="branches-grid">
                        {#each branches as branch}
                            <button class="branch-card" onclick={() => handleBranchClick(branch)}>
                                <div class="branch-avatar">
                                    {#if branch.avatarUrl}
                                        <img src={branch.avatarUrl} alt={branch.name} />
                                    {:else}
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                    {/if}
                                </div>
                                <div class="branch-details">
                                    <span class="branch-name">{branch.name}</span>
                                    {#if branch.address}
                                        <span class="branch-address">{branch.address}</span>
                                    {/if}
                                </div>
                                <div class="branch-meta">
                                    <span class="status-badge status-sm" class:active={branch.status === "active"}>
                                        <span class="status-dot"></span>
                                        {branch.status === "active" ? "Activa" : "Inactiva"}
                                    </span>
                                </div>
                                <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}

        <!-- Create New Business -->
        <div class="divider-section">
            <div class="divider-line"></div>
            <span class="divider-text">o</span>
            <div class="divider-line"></div>
        </div>
        
        <button class="btn btn-secondary btn-full" onclick={onCreateBusiness}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Crear Nuevo Negocio
        </button>
    {/if}
</div>


<style>
    /* Container */
    .selector-container {
        height: 100%;
        padding: 4px;
    }

    /* Header */
    .selector-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 28px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .header-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
        border: 1px solid rgba(99, 102, 241, 0.25);
        border-radius: 12px;
        color: #a5b4fc;
        flex-shrink: 0;
    }

    .header-content {
        flex: 1;
    }

    .header-title {
        font-size: 18px;
        font-weight: 600;
        color: #f1f5f9;
        margin: 0 0 4px 0;
        letter-spacing: -0.01em;
    }

    .header-subtitle {
        font-size: 13px;
        color: #94a3b8;
        margin: 0;
    }

    /* Alert */
    .alert {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        border-radius: 10px;
        font-size: 13px;
        margin-bottom: 20px;
    }

    .alert-error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.25);
        color: #fca5a5;
    }

    .alert-error svg {
        flex-shrink: 0;
        color: #f87171;
    }

    /* Empty State */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 48px 24px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px dashed rgba(255, 255, 255, 0.1);
        border-radius: 16px;
    }

    .empty-icon {
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(99, 102, 241, 0.1);
        border-radius: 50%;
        color: #818cf8;
        margin-bottom: 20px;
    }

    .empty-title {
        font-size: 16px;
        font-weight: 600;
        color: #e2e8f0;
        margin: 0 0 8px 0;
    }

    .empty-description {
        font-size: 13px;
        color: #94a3b8;
        max-width: 260px;
        margin: 0 0 24px 0;
        line-height: 1.5;
    }

    /* Sections */
    .section {
        margin-bottom: 24px;
    }

    .section-label {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 12px;
    }

    .section-label svg {
        color: #818cf8;
    }

    .label-text {
        font-size: 12px;
        font-weight: 600;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .label-required {
        color: #f87171;
        font-size: 14px;
    }

    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
    }

    /* Business Grid */
    .business-grid {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .business-card {
        position: relative;
        background: rgba(30, 41, 59, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        transition: all 0.2s ease;
        overflow: hidden;
    }

    .business-card:hover {
        background: rgba(30, 41, 59, 0.8);
        border-color: rgba(255, 255, 255, 0.12);
    }

    .business-card.selected {
        background: rgba(99, 102, 241, 0.1);
        border-color: rgba(99, 102, 241, 0.4);
        box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2);
    }

    .business-card.deleting {
        opacity: 0.5;
        pointer-events: none;
    }

    .business-card-content {
        display: flex;
        align-items: center;
        gap: 14px;
        width: 100%;
        padding: 14px 16px;
        background: none;
        border: none;
        text-align: left;
        cursor: pointer;
    }

    .business-avatar {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        border-radius: 10px;
        overflow: hidden;
        flex-shrink: 0;
    }

    .business-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .avatar-letter {
        font-size: 18px;
        font-weight: 700;
        color: #ffffff;
    }

    .business-details {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .business-name {
        font-size: 14px;
        font-weight: 600;
        color: #f1f5f9;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .business-type {
        font-size: 12px;
        color: #94a3b8;
        text-transform: capitalize;
    }

    .business-meta {
        flex-shrink: 0;
    }

    /* Status Badge */
    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 10px;
        font-size: 11px;
        font-weight: 500;
        border-radius: 20px;
        background: rgba(100, 116, 139, 0.2);
        color: #94a3b8;
    }

    .status-badge.active {
        background: rgba(34, 197, 94, 0.15);
        color: #4ade80;
    }

    .status-badge.status-sm {
        padding: 4px 8px;
        font-size: 10px;
    }

    .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
    }

    .selected-indicator {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #6366f1;
        border-radius: 50%;
        color: white;
        flex-shrink: 0;
    }

    .card-action-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(239, 68, 68, 0.1);
        border: none;
        border-radius: 6px;
        color: #f87171;
        cursor: pointer;
        opacity: 0;
        transition: all 0.2s ease;
    }

    .business-card:hover .card-action-btn {
        opacity: 1;
    }

    .card-action-btn:hover {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
    }

    /* Confirm Overlay */
    .confirm-overlay {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 20px;
        background: rgba(239, 68, 68, 0.08);
        text-align: center;
    }

    .confirm-message {
        font-size: 13px;
        font-weight: 500;
        color: #fca5a5;
        margin: 0;
    }

    .confirm-buttons {
        display: flex;
        gap: 8px;
    }

    /* Branches Section */
    .branches-section {
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .branches-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .branch-card {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px 14px;
        background: rgba(30, 41, 59, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 10px;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .branch-card:hover {
        background: rgba(30, 41, 59, 0.7);
        border-color: rgba(255, 255, 255, 0.1);
    }

    .branch-card:hover .chevron-icon {
        transform: translateX(3px);
        color: #a5b4fc;
    }

    .branch-avatar {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(99, 102, 241, 0.15);
        border-radius: 8px;
        overflow: hidden;
        flex-shrink: 0;
        color: #818cf8;
    }

    .branch-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .branch-details {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .branch-name {
        font-size: 13px;
        font-weight: 500;
        color: #e2e8f0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .branch-address {
        font-size: 11px;
        color: #64748b;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .branch-meta {
        flex-shrink: 0;
    }

    .chevron-icon {
        color: #64748b;
        flex-shrink: 0;
        transition: all 0.2s ease;
    }

    /* Loading State */
    .loading-state {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 32px;
        color: #94a3b8;
    }

    .loading-text {
        font-size: 13px;
    }

    .spinner {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(99, 102, 241, 0.2);
        border-top-color: #6366f1;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    .spinner-sm {
        width: 12px;
        height: 12px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-top-color: currentColor;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    /* Empty Branches */
    .empty-branches {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32px 20px;
        background: rgba(30, 41, 59, 0.3);
        border: 1px dashed rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        text-align: center;
        color: #64748b;
    }

    .empty-branches svg {
        margin-bottom: 12px;
        opacity: 0.5;
    }

    .empty-branches p {
        font-size: 13px;
        margin: 0 0 12px 0;
        color: #94a3b8;
    }

    .link-btn {
        font-size: 13px;
        font-weight: 500;
        color: #818cf8;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 3px;
    }

    .link-btn:hover {
        color: #a5b4fc;
    }

    /* Divider */
    .divider-section {
        display: flex;
        align-items: center;
        gap: 16px;
        margin: 28px 0 20px;
    }

    .divider-line {
        flex: 1;
        height: 1px;
        background: rgba(255, 255, 255, 0.08);
    }

    .divider-text {
        font-size: 11px;
        font-weight: 500;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }

    /* Buttons */
    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 600;
        border-radius: 10px;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-sm {
        padding: 6px 12px;
        font-size: 12px;
        border-radius: 8px;
    }

    .btn-full {
        width: 100%;
        padding: 14px 20px;
    }

    .btn-primary {
        padding: 12px 24px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
    }

    .btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
    }

    .btn-secondary {
        padding: 14px 20px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #e2e8f0;
    }

    .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.18);
    }

    .btn-outline {
        padding: 6px 12px;
        background: transparent;
        border: 1px solid rgba(99, 102, 241, 0.4);
        color: #a5b4fc;
    }

    .btn-outline:hover {
        background: rgba(99, 102, 241, 0.1);
        border-color: rgba(99, 102, 241, 0.6);
    }

    .btn-ghost {
        background: rgba(255, 255, 255, 0.08);
        color: #94a3b8;
    }

    .btn-ghost:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.12);
        color: #e2e8f0;
    }

    .btn-danger {
        background: #ef4444;
        color: white;
    }

    .btn-danger:hover:not(:disabled) {
        background: #dc2626;
    }

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
