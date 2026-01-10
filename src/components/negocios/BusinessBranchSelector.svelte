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
    let showInactive = $state(false);

    const BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL || "";

    const selectedBusiness = $derived(
        businesses.find((b) => b.id === selectedBusinessId) || null,
    );

    const filteredBusinesses = $derived(
        showInactive ? businesses : businesses.filter(b => b.isActive)
    );

    const filteredBranches = $derived(
        showInactive ? branches : branches.filter(b => b.status === "active")
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

    function handleBusinessClick(business: Business) {
        selectedBusinessId = business.id;
        onBusinessSelected(business);
        loadBranches(business.id);
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

<div class="panel-container">
    <!-- Panel Header -->
    <div class="panel-header">
        <div class="header-left">
            <div class="header-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            </div>
            <div class="header-content">
                <h2 class="header-title">Panel de Ubicaciones</h2>
                <p class="header-subtitle">Gestiona tus negocios y sucursales</p>
            </div>
        </div>
        <div class="header-actions">
            <button 
                class="toggle-btn" 
                class:active={showInactive}
                onclick={() => showInactive = !showInactive}
                title={showInactive ? "Ocultar inactivos" : "Mostrar inactivos"}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    {#if showInactive}
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    {:else}
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                    {/if}
                </svg>
                <span>{showInactive ? "Ocultar" : "Mostrar"} inactivos</span>
            </button>
            <button class="btn-create-primary" onclick={onCreateBusiness}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Nuevo Negocio
            </button>
        </div>
    </div>

    {#if errorMessage}
        <div class="alert alert-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMessage}</span>
        </div>
    {/if}

    {#if filteredBusinesses.length === 0}
        <!-- Empty State -->
        <div class="empty-state">
            <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            </div>
            <h3 class="empty-title">
                {businesses.length === 0 ? "Sin negocios registrados" : "No hay negocios activos"}
            </h3>
            <p class="empty-description">
                {businesses.length === 0 
                    ? "Crea tu primer negocio para comenzar a gestionar productos y sucursales" 
                    : "Activa el toggle para ver negocios inactivos"}
            </p>
            {#if businesses.length === 0}
                <button class="btn-primary" onclick={onCreateBusiness}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Crear Primer Negocio
                </button>
            {/if}
        </div>
    {:else}
        <!-- Business Grid -->
        <div class="section">
            <div class="section-header">
                <h3 class="section-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    Negocios
                    <span class="count-badge">{filteredBusinesses.length}</span>
                </h3>
            </div>
            
            <div class="business-grid">
                {#each filteredBusinesses as business}
                    <div 
                        class="business-card" 
                        class:selected={selectedBusinessId === business.id}
                        class:inactive={!business.isActive}
                    >
                        {#if confirmDeleteId === business.id}
                            <div class="confirm-overlay">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                                <p class="confirm-message">¿Desactivar "{business.name}"?</p>
                                <div class="confirm-buttons">
                                    <button 
                                        class="btn-ghost" 
                                        onclick={handleCancelDelete}
                                        disabled={deletingBusinessId === business.id}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        class="btn-danger" 
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
                                class="card-content"
                                onclick={() => handleBusinessClick(business)}
                            >
                                <div class="card-left">
                                    <div class="business-avatar">
                                        {#if business.avatarUrl}
                                            <img src={business.avatarUrl} alt={business.name} />
                                        {:else}
                                            <span class="avatar-letter">{business.name.charAt(0).toUpperCase()}</span>
                                        {/if}
                                    </div>
                                    <div class="business-info">
                                        <h4 class="business-name">{business.name}</h4>
                                        <p class="business-type">{business.type}</p>
                                    </div>
                                </div>
                                <div class="card-right">
                                    <span class="status-badge" class:active={business.isActive}>
                                        <span class="status-dot"></span>
                                        {business.isActive ? "Activo" : "Inactivo"}
                                    </span>
                                    {#if selectedBusinessId === business.id}
                                        <div class="selected-check">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                    {:else}
                                        <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    {/if}
                                </div>
                            </button>
                            {#if onDeleteBusiness}
                                <button 
                                    class="delete-btn"
                                    onclick={(e) => handleDeleteClick(e, business.id)}
                                    title="Desactivar negocio"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                    <h3 class="section-title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        Sucursales de {selectedBusiness?.name}
                        {#if !isLoadingBranches}
                            <span class="count-badge">{filteredBranches.length}</span>
                        {/if}
                    </h3>
                    <button class="btn-create-secondary" onclick={handleCreateBranch}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Nueva Sucursal
                    </button>
                </div>

                {#if isLoadingBranches}
                    <div class="loading-state">
                        <span class="spinner"></span>
                        <span class="loading-text">Cargando sucursales...</span>
                    </div>
                {:else if filteredBranches.length === 0}
                    <div class="empty-branches">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <p>{branches.length === 0 ? "No hay sucursales registradas" : "No hay sucursales activas"}</p>
                        <button class="link-btn" onclick={handleCreateBranch}>
                            Crear primera sucursal
                        </button>
                    </div>
                {:else}
                    <div class="branches-grid">
                        {#each filteredBranches as branch}
                            <button 
                                class="branch-card" 
                                class:inactive={branch.status !== "active"}
                                onclick={() => handleBranchClick(branch)}
                            >
                                <div class="branch-left">
                                    <div class="branch-avatar">
                                        {#if branch.avatarUrl}
                                            <img src={branch.avatarUrl} alt={branch.name} />
                                        {:else}
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                <circle cx="12" cy="10" r="3" />
                                            </svg>
                                        {/if}
                                    </div>
                                    <div class="branch-info">
                                        <h5 class="branch-name">{branch.name}</h5>
                                        {#if branch.address}
                                            <p class="branch-address">{branch.address}</p>
                                        {/if}
                                    </div>
                                </div>
                                <div class="branch-right">
                                    <span class="status-badge status-sm" class:active={branch.status === "active"}>
                                        <span class="status-dot"></span>
                                        {branch.status === "active" ? "Activa" : "Inactiva"}
                                    </span>
                                    <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </div>
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}
    {/if}
</div>


<style>
    /* Container */
    .panel-container {
        height: 100%;
        padding: 24px;
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.06);
    }

    /* Panel Header */
    .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 32px;
        padding-bottom: 24px;
        border-bottom: 2px solid rgba(99, 102, 241, 0.15);
        flex-wrap: wrap;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .header-icon {
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
        border: 2px solid rgba(99, 102, 241, 0.3);
        border-radius: 16px;
        color: #a5b4fc;
        flex-shrink: 0;
    }

    .header-content {
        flex: 1;
    }

    .header-title {
        font-size: 22px;
        font-weight: 700;
        color: #f1f5f9;
        margin: 0 0 6px 0;
        letter-spacing: -0.02em;
    }

    .header-subtitle {
        font-size: 14px;
        color: #94a3b8;
        margin: 0;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
    }

    /* Toggle Button */
    .toggle-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: rgba(30, 41, 59, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        color: #94a3b8;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .toggle-btn:hover {
        background: rgba(30, 41, 59, 0.8);
        border-color: rgba(255, 255, 255, 0.15);
        color: #cbd5e1;
    }

    .toggle-btn.active {
        background: rgba(99, 102, 241, 0.15);
        border-color: rgba(99, 102, 241, 0.4);
        color: #a5b4fc;
    }

    .toggle-btn svg {
        flex-shrink: 0;
    }

    /* Primary Create Button */
    .btn-create-primary {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 11px 20px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        border: none;
        border-radius: 10px;
        color: white;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }

    .btn-create-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
    }

    .btn-create-primary:active {
        transform: translateY(0);
    }

    /* Alert */
    .alert {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 18px;
        border-radius: 12px;
        font-size: 14px;
        margin-bottom: 24px;
    }

    .alert-error {
        background: rgba(239, 68, 68, 0.12);
        border: 1px solid rgba(239, 68, 68, 0.3);
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
        padding: 64px 32px;
        background: rgba(30, 41, 59, 0.3);
        border: 2px dashed rgba(255, 255, 255, 0.1);
        border-radius: 16px;
    }

    .empty-icon {
        width: 96px;
        height: 96px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
        border-radius: 50%;
        color: #818cf8;
        margin-bottom: 24px;
    }

    .empty-title {
        font-size: 18px;
        font-weight: 600;
        color: #e2e8f0;
        margin: 0 0 10px 0;
    }

    .empty-description {
        font-size: 14px;
        color: #94a3b8;
        max-width: 400px;
        margin: 0 0 28px 0;
        line-height: 1.6;
    }

    .btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        border: none;
        border-radius: 10px;
        color: white;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }

    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
    }

    /* Section */
    .section {
        margin-bottom: 32px;
    }

    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 18px;
        flex-wrap: wrap;
        gap: 12px;
    }

    .section-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 16px;
        font-weight: 600;
        color: #e2e8f0;
        margin: 0;
    }

    .section-title svg {
        color: #818cf8;
    }

    .count-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        height: 24px;
        padding: 0 8px;
        background: rgba(99, 102, 241, 0.2);
        border: 1px solid rgba(99, 102, 241, 0.3);
        border-radius: 12px;
        color: #a5b4fc;
        font-size: 12px;
        font-weight: 600;
    }

    .btn-create-secondary {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        background: rgba(99, 102, 241, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.3);
        border-radius: 8px;
        color: #a5b4fc;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-create-secondary:hover {
        background: rgba(99, 102, 241, 0.2);
        border-color: rgba(99, 102, 241, 0.5);
        color: #c7d2fe;
    }

    /* Business Grid - REAL GRID LAYOUT */
    .business-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
        gap: 16px;
        margin-bottom: 8px;
    }

    @media (max-width: 1200px) {
        .business-grid {
            grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
        }
    }

    @media (max-width: 768px) {
        .business-grid {
            grid-template-columns: 1fr;
        }
    }

    .business-card {
        position: relative;
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(30, 41, 59, 0.5) 100%);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        height: 100%;
    }

    .business-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .business-card:hover {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(30, 41, 59, 0.8) 100%);
        border-color: rgba(99, 102, 241, 0.3);
        transform: translateY(-3px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.15);
    }

    .business-card:hover::before {
        opacity: 1;
    }

    .business-card.selected {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%);
        border-color: rgba(99, 102, 241, 0.5);
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25), 0 8px 24px rgba(99, 102, 241, 0.2);
    }

    .business-card.selected::before {
        opacity: 1;
    }

    .business-card.inactive {
        opacity: 0.6;
    }

    .card-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        width: 100%;
        padding: 18px 20px;
        background: none;
        border: none;
        text-align: left;
        cursor: pointer;
    }

    .card-left {
        display: flex;
        align-items: center;
        gap: 16px;
        flex: 1;
        min-width: 0;
    }

    .business-avatar {
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        border-radius: 12px;
        overflow: hidden;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
        transition: transform 0.3s ease;
    }

    .business-card:hover .business-avatar {
        transform: scale(1.08);
    }

    .business-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .avatar-letter {
        font-size: 24px;
        font-weight: 700;
        color: #ffffff;
    }

    .business-info {
        flex: 1;
        min-width: 0;
    }

    .business-name {
        font-size: 16px;
        font-weight: 600;
        color: #f1f5f9;
        margin: 0 0 4px 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        letter-spacing: -0.01em;
    }

    .business-type {
        font-size: 13px;
        color: #94a3b8;
        margin: 0;
        text-transform: capitalize;
    }

    .card-right {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;
    }

    /* Status Badge */
    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        font-size: 11px;
        font-weight: 600;
        border-radius: 20px;
        background: rgba(100, 116, 139, 0.25);
        border: 1px solid rgba(100, 116, 139, 0.3);
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.03em;
    }

    .status-badge.active {
        background: rgba(34, 197, 94, 0.15);
        border-color: rgba(34, 197, 94, 0.3);
        color: #4ade80;
    }

    .status-badge.status-sm {
        padding: 4px 10px;
        font-size: 10px;
    }

    .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }

    .selected-check {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        border-radius: 50%;
        color: white;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.5);
        animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes scaleIn {
        from {
            transform: scale(0);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    .chevron {
        color: #64748b;
        transition: all 0.3s ease;
    }

    .business-card:hover .chevron {
        color: #a5b4fc;
        transform: translateX(4px);
    }

    .delete-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 8px;
        color: #f87171;
        cursor: pointer;
        opacity: 0;
        transition: all 0.2s ease;
        z-index: 10;
    }

    .business-card:hover .delete-btn {
        opacity: 1;
    }

    .delete-btn:hover {
        background: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.5);
        color: #ef4444;
        transform: scale(1.1);
    }

    /* Confirm Overlay */
    .confirm-overlay {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 28px 20px;
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.08) 100%);
        text-align: center;
        height: 100%;
    }

    .confirm-overlay svg {
        color: #f87171;
    }

    .confirm-message {
        font-size: 14px;
        font-weight: 600;
        color: #fca5a5;
        margin: 0;
    }

    .confirm-buttons {
        display: flex;
        gap: 10px;
    }

    .btn-ghost {
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        color: #cbd5e1;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-ghost:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.12);
        color: #f1f5f9;
    }

    .btn-danger {
        padding: 8px 16px;
        background: #ef4444;
        border: 1px solid #dc2626;
        border-radius: 8px;
        color: white;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-danger:hover:not(:disabled) {
        background: #dc2626;
    }

    .btn-ghost:disabled,
    .btn-danger:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .spinner-sm {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    /* Branches Section */
    .branches-section {
        padding-top: 28px;
        margin-top: 28px;
        border-top: 2px solid rgba(99, 102, 241, 0.15);
    }

    .branches-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 14px;
    }

    @media (max-width: 768px) {
        .branches-grid {
            grid-template-columns: 1fr;
        }
    }

    .branch-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        width: 100%;
        padding: 16px 18px;
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 12px;
        text-align: left;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
    }

    .branch-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .branch-card:hover {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(30, 41, 59, 0.7) 100%);
        border-color: rgba(99, 102, 241, 0.25);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }

    .branch-card:hover::before {
        opacity: 1;
    }

    .branch-card.inactive {
        opacity: 0.6;
    }

    .branch-card:hover .chevron {
        color: #a5b4fc;
        transform: translateX(4px);
    }

    .branch-card:hover .branch-avatar {
        transform: scale(1.08);
    }

    .branch-left {
        display: flex;
        align-items: center;
        gap: 14px;
        flex: 1;
        min-width: 0;
    }

    .branch-avatar {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%);
        border: 1px solid rgba(99, 102, 241, 0.3);
        border-radius: 10px;
        overflow: hidden;
        flex-shrink: 0;
        color: #a5b4fc;
        transition: transform 0.3s ease;
    }

    .branch-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .branch-info {
        flex: 1;
        min-width: 0;
    }

    .branch-name {
        font-size: 14px;
        font-weight: 600;
        color: #e2e8f0;
        margin: 0 0 4px 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        letter-spacing: -0.01em;
    }

    .branch-address {
        font-size: 12px;
        color: #64748b;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.4;
    }

    .branch-right {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
    }

    /* Loading State */
    .loading-state {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 48px;
        color: #94a3b8;
    }

    .loading-text {
        font-size: 14px;
    }

    .spinner {
        width: 20px;
        height: 20px;
        border: 3px solid rgba(99, 102, 241, 0.2);
        border-top-color: #6366f1;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    /* Empty Branches */
    .empty-branches {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 48px 24px;
        background: rgba(30, 41, 59, 0.3);
        border: 2px dashed rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        text-align: center;
        color: #64748b;
    }

    .empty-branches svg {
        margin-bottom: 16px;
        opacity: 0.6;
    }

    .empty-branches p {
        font-size: 14px;
        margin: 0 0 16px 0;
        color: #94a3b8;
    }

    .link-btn {
        font-size: 13px;
        font-weight: 600;
        color: #818cf8;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 3px;
        transition: color 0.2s ease;
    }

    .link-btn:hover {
        color: #a5b4fc;
    }
</style>
