<script lang="ts">
    import type { Business } from "@/lib/business";

    interface Props {
        jwt: string;
        businesses: Business[];
        showInactive: boolean;
        onBusinessSelect: (business: Business) => void;
        onCreateBusiness: () => void;
        onDeleteBusiness?: (business: Business) => void;
    }

    let {
        jwt,
        businesses,
        showInactive,
        onBusinessSelect,
        onCreateBusiness,
        onDeleteBusiness,
    }: Props = $props();

    let deletingBusinessId = $state<string | null>(null);
    let confirmDeleteId = $state<string | null>(null);

    const BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL || "";

    const filteredBusinesses = $derived(
        showInactive ? businesses : businesses.filter(b => b.isActive)
    );

    function handleDeleteClick(e: Event, businessId: string) {
        e.stopPropagation();
        confirmDeleteId = businessId;
    }

    function handleCancelDelete() {
        confirmDeleteId = null;
    }

    async function handleConfirmDelete(business: Business) {
        deletingBusinessId = business.id;

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
                throw new Error(result.errors[0]?.message || "Error al desactivar negocio");
            }

            confirmDeleteId = null;
            onDeleteBusiness?.(business);
        } catch (error) {
            console.error("Error deactivating business:", error);
        } finally {
            deletingBusinessId = null;
        }
    }
</script>

<div class="business-selector">
    {#if filteredBusinesses.length === 0}
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
                    ? "Crea tu primer negocio para comenzar" 
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
        <div class="business-grid">
            {#each filteredBusinesses as business}
                <div 
                    class="business-card" 
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
                            onclick={() => onBusinessSelect(business)}
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
                                <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
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
    {/if}
</div>


<style>
    .business-selector {
        width: 100%;
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

    /* Business Grid - REAL GRID */
    .business-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 450px), 1fr));
        gap: 16px;
        width: 100%;
    }

    @media (min-width: 1400px) {
        .business-grid {
            grid-template-columns: repeat(2, 1fr);
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
        min-height: 90px;
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

    .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
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
        min-height: 90px;
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
</style>
