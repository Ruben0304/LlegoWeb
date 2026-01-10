<script lang="ts">
    import type { Business, Branch } from "@/lib/business";
    import BusinessSelector from "./BusinessSelector.svelte";
    import BranchSelector from "./BranchSelector.svelte";

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

    let selectedBusiness = $state<Business | null>(null);
    let branches = $state<Branch[]>([]);
    let isLoadingBranches = $state(false);
    let errorMessage = $state("");
    let showInactive = $state(false);

    const BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL || "";

    async function loadBranches(businessId: string) {
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
              }
            }
          `,
                    variables: { first: 100, businessId, jwt },
                }),
            });

            const result = await response.json();

            if (result.errors) {
                throw new Error(result.errors[0]?.message || "Error al cargar sucursales");
            }

            branches = result.data?.branches?.edges?.map((edge: any) => edge.node) || [];
        } catch (error) {
            console.error("Error loading branches:", error);
            errorMessage = error instanceof Error ? error.message : "Error al cargar sucursales";
            branches = [];
        } finally {
            isLoadingBranches = false;
        }
    }

    function handleBusinessSelect(business: Business) {
        selectedBusiness = business;
        onBusinessSelected(business);
        loadBranches(business.id);
    }

    function handleBranchSelect(branch: Branch) {
        onBranchSelected(branch);
    }

    function handleCreateBranch() {
        if (selectedBusiness) {
            onCreateBranch(selectedBusiness);
        }
    }

    function handleBackToBusinesses() {
        selectedBusiness = null;
        branches = [];
    }
</script>

<div class="panel-container">
    <!-- Panel Header -->
    <div class="panel-header">
        <div class="header-left">
            {#if selectedBusiness}
                <button class="back-btn" onclick={handleBackToBusinesses} aria-label="Volver a negocios">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
            {/if}
            <div class="header-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    {#if selectedBusiness}
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    {:else}
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    {/if}
                </svg>
            </div>
            <div class="header-content">
                <h2 class="header-title">
                    {#if selectedBusiness}
                        Sucursales de {selectedBusiness.name}
                    {:else}
                        Panel de Ubicaciones
                    {/if}
                </h2>
                <p class="header-subtitle">
                    {#if selectedBusiness}
                        Selecciona una sucursal para continuar
                    {:else}
                        Selecciona un negocio para ver sus sucursales
                    {/if}
                </p>
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
            {#if selectedBusiness}
                <button class="btn-create-primary" onclick={handleCreateBranch}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Nueva Sucursal
                </button>
            {:else}
                <button class="btn-create-primary" onclick={onCreateBusiness}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Nuevo Negocio
                </button>
            {/if}
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

    <!-- Content Area -->
    <div class="panel-content">
        {#if selectedBusiness}
            <BranchSelector
                branches={branches}
                {showInactive}
                isLoading={isLoadingBranches}
                onBranchSelect={handleBranchSelect}
                onCreateBranch={handleCreateBranch}
            />
        {:else}
            <BusinessSelector
                {jwt}
                {businesses}
                {showInactive}
                onBusinessSelect={handleBusinessSelect}
                onCreateBusiness={onCreateBusiness}
                onDeleteBusiness={onDeleteBusiness}
            />
        {/if}
    </div>
</div>


<style>
    /* Container - NO MAX-WIDTH RESTRICTION */
    .panel-container {
        width: 100%;
        min-height: 500px;
        padding: 28px;
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
        gap: 12px;
        flex: 1;
        min-width: 0;
    }

    .back-btn {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(30, 41, 59, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        color: #94a3b8;
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
    }

    .back-btn:hover {
        background: rgba(30, 41, 59, 0.8);
        border-color: rgba(99, 102, 241, 0.3);
        color: #a5b4fc;
        transform: translateX(-2px);
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
        min-width: 0;
    }

    .header-title {
        font-size: 22px;
        font-weight: 700;
        color: #f1f5f9;
        margin: 0 0 6px 0;
        letter-spacing: -0.02em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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
        white-space: nowrap;
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
        white-space: nowrap;
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

    /* Content Area - FULL WIDTH */
    .panel-content {
        width: 100%;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .panel-container {
            padding: 20px;
        }

        .panel-header {
            flex-direction: column;
            align-items: flex-start;
        }

        .header-left {
            width: 100%;
        }

        .header-actions {
            width: 100%;
            justify-content: flex-start;
        }

        .header-title {
            font-size: 18px;
        }

        .toggle-btn span {
            display: none;
        }
    }
</style>
