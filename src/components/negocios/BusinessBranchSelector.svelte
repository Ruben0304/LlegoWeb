<script lang="ts">
    import type { Business, Branch } from "@/lib/business";

    interface Props {
        jwt: string;
        businesses: Business[];
        onBusinessSelected: (business: Business) => void;
        onBranchSelected: (branch: Branch) => void;
        onCreateBusiness: () => void;
        onCreateBranch: (business: Business) => void;
    }

    let {
        jwt,
        businesses,
        onBusinessSelected,
        onBranchSelected,
        onCreateBusiness,
        onCreateBranch,
    }: Props = $props();

    let selectedBusinessId = $state<string>("");
    let branches = $state<Branch[]>([]);
    let isLoadingBranches = $state(false);
    let errorMessage = $state("");

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
            query GetBranches($businessId: String!, $jwt: String!) {
              branches(businessId: $businessId, jwt: $jwt) {
                id
                businessId
                name
                address
                phone
                status
                avatarUrl
              }
            }
          `,
                    variables: { businessId, jwt },
                }),
            });

            const result = await response.json();

            if (result.errors) {
                throw new Error(
                    result.errors[0]?.message || "Error al cargar sucursales",
                );
            }

            branches = result.data?.branches || [];
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
</script>

<div class="selector-container">
    <div class="selector-header">
        <div class="selector-icon">
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        </div>
        <div>
            <h2 class="selector-title">Seleccionar Ubicación</h2>
            <p class="selector-subtitle">Elige dónde agregar el producto</p>
        </div>
    </div>

    {#if errorMessage}
        <div class="error-message">
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {errorMessage}
        </div>
    {/if}

    {#if businesses.length === 0}
        <!-- No businesses yet -->
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
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            </div>
            <h3 class="empty-title">Sin negocios registrados</h3>
            <p class="empty-text">
                Crea tu primer negocio para comenzar a agregar productos
            </p>
            <button class="create-btn primary" onclick={onCreateBusiness}>
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Crear Negocio
            </button>
        </div>
    {:else}
        <!-- Business selector -->
        <div class="form-group">
            <label for="business-select">
                Negocio
                <span class="required">*</span>
            </label>
            <div class="select-wrapper">
                <select
                    id="business-select"
                    value={selectedBusinessId}
                    onchange={handleBusinessChange}
                >
                    <option value="">Selecciona un negocio</option>
                    {#each businesses as business}
                        <option value={business.id}>{business.name}</option>
                    {/each}
                </select>
                <svg
                    class="select-arrow"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>
        </div>

        {#if selectedBusinessId}
            <!-- Selected business card -->
            <div class="selected-business-card">
                <div class="business-avatar">
                    {#if selectedBusiness?.avatarUrl}
                        <img
                            src={selectedBusiness.avatarUrl}
                            alt={selectedBusiness.name}
                        />
                    {:else}
                        <span
                            >{selectedBusiness?.name
                                .charAt(0)
                                .toUpperCase()}</span
                        >
                    {/if}
                </div>
                <div class="business-info">
                    <span class="business-name">{selectedBusiness?.name}</span>
                    <span class="business-type">{selectedBusiness?.type}</span>
                </div>
                <div
                    class="business-status"
                    class:active={selectedBusiness?.isActive}
                >
                    {selectedBusiness?.isActive ? "Activo" : "Inactivo"}
                </div>
            </div>

            <!-- Branch list section -->
            <div class="branches-section">
                <div class="section-header">
                    <h3 class="section-title">
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <path
                                d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                            />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        Sucursales
                    </h3>
                    <button class="add-branch-btn" onclick={handleCreateBranch}>
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Agregar
                    </button>
                </div>

                {#if isLoadingBranches}
                    <div class="loading-state">
                        <span class="spinner"></span>
                        <span>Cargando sucursales...</span>
                    </div>
                {:else if branches.length === 0}
                    <div class="empty-branches">
                        <p>No hay sucursales registradas</p>
                        <button
                            class="create-branch-link"
                            onclick={handleCreateBranch}
                        >
                            Crear primera sucursal
                        </button>
                    </div>
                {:else}
                    <div class="branches-list">
                        {#each branches as branch}
                            <button
                                class="branch-card"
                                onclick={() => handleBranchClick(branch)}
                            >
                                <div class="branch-avatar">
                                    {#if branch.avatarUrl}
                                        <img
                                            src={branch.avatarUrl}
                                            alt={branch.name}
                                        />
                                    {:else}
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                        >
                                            <path
                                                d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                                            />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                    {/if}
                                </div>
                                <div class="branch-info">
                                    <span class="branch-name"
                                        >{branch.name}</span
                                    >
                                    {#if branch.address}
                                        <span class="branch-address"
                                            >{branch.address}</span
                                        >
                                    {/if}
                                </div>
                                <div
                                    class="branch-status"
                                    class:active={branch.status === "active"}
                                >
                                    {branch.status === "active"
                                        ? "Activa"
                                        : "Inactiva"}
                                </div>
                                <svg
                                    class="branch-arrow"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                >
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}

        <!-- Create new business option -->
        <div class="create-business-section">
            <div class="divider">
                <span>o</span>
            </div>
            <button class="create-btn secondary" onclick={onCreateBusiness}>
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Crear Nuevo Negocio
            </button>
        </div>
    {/if}
</div>

<style>
    .selector-container {
        height: 100%;
    }

    .selector-header {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-xl);
    }

    .selector-icon {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(
            135deg,
            rgba(90, 132, 103, 0.2) 0%,
            rgba(178, 214, 154, 0.2) 100%
        );
        border-radius: var(--radius-lg);
        color: var(--color-accent);
        flex-shrink: 0;
    }

    .selector-title {
        font-size: var(--font-size-xl);
        font-weight: 700;
        letter-spacing: -0.02em;
        margin-bottom: 2px;
    }

    .selector-subtitle {
        font-size: var(--font-size-sm);
        color: var(--color-text-variant);
    }

    .error-message {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-md);
        background: rgba(255, 59, 48, 0.1);
        border: 1px solid rgba(255, 59, 48, 0.3);
        border-radius: var(--radius-md);
        color: #ff6b6b;
        font-size: var(--font-size-sm);
        margin-bottom: var(--spacing-lg);
    }

    /* Empty State */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: var(--spacing-3xl) var(--spacing-lg);
    }

    .empty-icon {
        width: 88px;
        height: 88px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 50%;
        color: var(--color-text-variant);
        margin-bottom: var(--spacing-xl);
    }

    .empty-title {
        font-size: var(--font-size-lg);
        font-weight: 600;
        margin-bottom: var(--spacing-sm);
    }

    .empty-text {
        font-size: var(--font-size-sm);
        color: var(--color-text-variant);
        max-width: 280px;
        margin-bottom: var(--spacing-xl);
    }

    /* Form Group */
    .form-group {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-lg);
    }

    .form-group label {
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--color-text-variant);
    }

    .required {
        color: #ff6b6b;
        margin-left: 2px;
    }

    .select-wrapper {
        position: relative;
    }

    .select-wrapper select {
        width: 100%;
        padding: var(--spacing-md) var(--spacing-lg);
        padding-right: calc(var(--spacing-lg) + 20px);
        font-size: var(--font-size-base);
        font-family: inherit;
        color: var(--color-text);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: var(--radius-lg);
        appearance: none;
        cursor: pointer;
        transition: all var(--transition-base);
    }

    .select-wrapper select:focus {
        outline: none;
        border-color: var(--color-secondary);
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 0 0 4px rgba(225, 199, 142, 0.1);
    }

    .select-arrow {
        position: absolute;
        right: var(--spacing-lg);
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-text-variant);
        pointer-events: none;
    }

    /* Selected Business Card */
    .selected-business-card {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: var(--radius-lg);
        margin-bottom: var(--spacing-xl);
    }

    .business-avatar {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(
            135deg,
            var(--color-secondary) 0%,
            var(--color-accent) 100%
        );
        border-radius: var(--radius-md);
        overflow: hidden;
        flex-shrink: 0;
    }

    .business-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .business-avatar span {
        font-size: var(--font-size-lg);
        font-weight: 700;
        color: var(--color-primary);
    }

    .business-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
    }

    .business-name {
        font-size: var(--font-size-base);
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .business-type {
        font-size: var(--font-size-xs);
        color: var(--color-text-variant);
        text-transform: capitalize;
    }

    .business-status {
        padding: 4px 10px;
        font-size: var(--font-size-xs);
        font-weight: 500;
        border-radius: var(--radius-full);
        background: rgba(255, 255, 255, 0.1);
        color: var(--color-text-variant);
    }

    .business-status.active {
        background: rgba(52, 199, 89, 0.15);
        color: #34c759;
    }

    /* Branches Section */
    .branches-section {
        margin-bottom: var(--spacing-xl);
    }

    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--spacing-md);
    }

    .section-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: var(--font-size-sm);
        font-weight: 600;
        color: var(--color-text-variant);
    }

    .section-title svg {
        color: var(--color-secondary);
    }

    .add-branch-btn {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-xs) var(--spacing-sm);
        font-size: var(--font-size-xs);
        font-weight: 500;
        color: var(--color-secondary);
        background: rgba(225, 199, 142, 0.1);
        border-radius: var(--radius-full);
        transition: all var(--transition-base);
    }

    .add-branch-btn:hover {
        background: rgba(225, 199, 142, 0.2);
    }

    .loading-state {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-xl);
        color: var(--color-text-variant);
        font-size: var(--font-size-sm);
    }

    .spinner {
        width: 18px;
        height: 18px;
        border: 2px solid transparent;
        border-top-color: var(--color-secondary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .empty-branches {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--spacing-xl);
        background: rgba(255, 255, 255, 0.02);
        border: 1px dashed rgba(255, 255, 255, 0.1);
        border-radius: var(--radius-lg);
        text-align: center;
    }

    .empty-branches p {
        font-size: var(--font-size-sm);
        color: var(--color-text-variant);
        margin-bottom: var(--spacing-md);
    }

    .create-branch-link {
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--color-secondary);
        background: none;
        padding: 0;
        text-decoration: underline;
        text-underline-offset: 3px;
    }

    .create-branch-link:hover {
        color: var(--color-accent);
    }

    .branches-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .branch-card {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        width: 100%;
        padding: var(--spacing-md);
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: var(--radius-lg);
        text-align: left;
        transition: all var(--transition-base);
        cursor: pointer;
    }

    .branch-card:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.1);
    }

    .branch-avatar {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.08);
        border-radius: var(--radius-md);
        overflow: hidden;
        flex-shrink: 0;
        color: var(--color-text-variant);
    }

    .branch-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .branch-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
    }

    .branch-name {
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--color-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .branch-address {
        font-size: var(--font-size-xs);
        color: var(--color-text-variant);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .branch-status {
        padding: 3px 8px;
        font-size: 10px;
        font-weight: 500;
        border-radius: var(--radius-full);
        background: rgba(255, 255, 255, 0.1);
        color: var(--color-text-variant);
        flex-shrink: 0;
    }

    .branch-status.active {
        background: rgba(52, 199, 89, 0.15);
        color: #34c759;
    }

    .branch-arrow {
        color: var(--color-text-variant);
        flex-shrink: 0;
        transition: transform var(--transition-base);
    }

    .branch-card:hover .branch-arrow {
        transform: translateX(4px);
        color: var(--color-secondary);
    }

    /* Create Business Section */
    .create-business-section {
        margin-top: var(--spacing-xl);
    }

    .divider {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-lg);
    }

    .divider::before,
    .divider::after {
        content: "";
        flex: 1;
        height: 1px;
        background: rgba(255, 255, 255, 0.1);
    }

    .divider span {
        font-size: var(--font-size-xs);
        color: var(--color-text-variant);
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }

    /* Buttons */
    .create-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
        width: 100%;
        padding: var(--spacing-md) var(--spacing-xl);
        font-size: var(--font-size-base);
        font-weight: 600;
        border-radius: var(--radius-full);
        transition: all var(--transition-base);
    }

    .create-btn.primary {
        color: var(--color-primary);
        background: linear-gradient(
            135deg,
            var(--color-secondary) 0%,
            var(--color-accent) 100%
        );
    }

    .create-btn.primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(225, 199, 142, 0.3);
    }

    .create-btn.secondary {
        color: var(--color-text);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .create-btn.secondary:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
    }
</style>
