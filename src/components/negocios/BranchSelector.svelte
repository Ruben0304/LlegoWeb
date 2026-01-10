<script lang="ts">
    import type { Branch } from "@/lib/business";

    interface Props {
        branches: Branch[];
        showInactive: boolean;
        isLoading: boolean;
        onBranchSelect: (branch: Branch) => void;
        onCreateBranch: () => void;
    }

    let {
        branches,
        showInactive,
        isLoading,
        onBranchSelect,
        onCreateBranch,
    }: Props = $props();

    const filteredBranches = $derived(
        showInactive ? branches : branches.filter(b => b.status === "active")
    );
</script>

<div class="branch-selector">
    {#if isLoading}
        <div class="loading-state">
            <span class="spinner"></span>
            <span class="loading-text">Cargando sucursales...</span>
        </div>
    {:else if filteredBranches.length === 0}
        <div class="empty-branches">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
            </svg>
            <p>{branches.length === 0 ? "No hay sucursales registradas" : "No hay sucursales activas"}</p>
            <button class="btn-primary" onclick={onCreateBranch}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Crear Primera Sucursal
            </button>
        </div>
    {:else}
        <div class="branches-grid">
            {#each filteredBranches as branch}
                <button 
                    class="branch-card" 
                    class:inactive={branch.status !== "active"}
                    onclick={() => onBranchSelect(branch)}
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
                        <span class="status-badge" class:active={branch.status === "active"}>
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

<style>
    .branch-selector {
        width: 100%;
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

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    /* Empty Branches */
    .empty-branches {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 64px 32px;
        background: rgba(30, 41, 59, 0.3);
        border: 2px dashed rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        text-align: center;
        color: #64748b;
    }

    .empty-branches svg {
        margin-bottom: 20px;
        color: #818cf8;
    }

    .empty-branches p {
        font-size: 14px;
        margin: 0 0 24px 0;
        color: #94a3b8;
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

    /* Branches Grid */
    .branches-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 380px), 1fr));
        gap: 14px;
        width: 100%;
    }

    @media (min-width: 1400px) {
        .branches-grid {
            grid-template-columns: repeat(2, 1fr);
        }
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
        min-height: 80px;
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

    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 10px;
        font-size: 10px;
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
</style>
