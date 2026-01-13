<script lang="ts">
  import { onMount } from "svelte";
  import { getBusinessTypeConfigs } from "@/lib/business-type";
  import type { BusinessTypeConfig } from "@/lib/business-type";
  import BusinessTypeForm from "./BusinessTypeForm.svelte";
  import BusinessTypeList from "./BusinessTypeList.svelte";

  // Auth state
  let jwt = $state<string | null>(null);
  let isAuthenticated = $state(false);
  let isLoading = $state(true);

  // Data
  let businessTypes = $state<BusinessTypeConfig[]>([]);
  let selectedBusinessType = $state<BusinessTypeConfig | null>(null);

  // UI State
  let activeView = $state<"list" | "form">("list");
  let loadError = $state("");

  onMount(async () => {
    // Check auth from localStorage
    const storedJwt = localStorage.getItem("jwt");
    if (storedJwt) {
      jwt = storedJwt;
      isAuthenticated = true;
      await loadBusinessTypes();
    }
    isLoading = false;
  });

  async function loadBusinessTypes() {
    if (!jwt) return;
    
    loadError = "";
    try {
      const response = await getBusinessTypeConfigs(undefined, jwt);
      businessTypes = response.businessTypeConfigs || [];
    } catch (error) {
      console.error("Error loading business types:", error);
      loadError = "Error al cargar los tipos de negocio";
    }
  }

  function handleSelect(bt: BusinessTypeConfig) {
    selectedBusinessType = bt;
    activeView = "form";
  }

  function handleSaved(bt: BusinessTypeConfig) {
    const index = businessTypes.findIndex((b) => b.id === bt.id);
    if (index >= 0) {
      businessTypes = [...businessTypes.slice(0, index), bt, ...businessTypes.slice(index + 1)];
    } else {
      businessTypes = [...businessTypes, bt];
    }
    
    if (!selectedBusinessType) {
      // Si era crear, volver a la lista
      activeView = "list";
    }
  }

  function handleDeleted(id: string) {
    businessTypes = businessTypes.filter((b) => b.id !== id);
    if (selectedBusinessType?.id === id) {
      selectedBusinessType = null;
      activeView = "list";
    }
  }

  function handleUpdated(bt: BusinessTypeConfig) {
    const index = businessTypes.findIndex((b) => b.id === bt.id);
    if (index >= 0) {
      businessTypes = [...businessTypes.slice(0, index), bt, ...businessTypes.slice(index + 1)];
    }
  }

  function showCreateForm() {
    selectedBusinessType = null;
    activeView = "form";
  }

  function showList() {
    selectedBusinessType = null;
    activeView = "list";
  }
</script>

<div class="panel-container">
  {#if isLoading}
    <div class="loading-state">
      <div class="spinner-large"></div>
      <p>Cargando...</p>
    </div>
  {:else if !isAuthenticated}
    <div class="auth-required">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <h2>Acceso Restringido</h2>
      <p>Debes iniciar sesión como administrador para gestionar los tipos de negocio.</p>
      <a href="/auth/login" class="login-btn">Iniciar Sesión</a>
    </div>
  {:else}
    <div class="panel-header">
      <div class="header-left">
        {#if activeView === "form"}
          <button class="back-btn" onclick={showList}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver
          </button>
        {/if}
        <h1 class="panel-title">
          {#if activeView === "list"}
            Gestión de Business Types
          {:else if selectedBusinessType}
            Editar: {selectedBusinessType.name}
          {:else}
            Crear Business Type
          {/if}
        </h1>
      </div>
      
      {#if activeView === "list"}
        <button class="create-btn" onclick={showCreateForm}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Crear Nuevo
        </button>
      {/if}
    </div>

    {#if loadError}
      <div class="error-banner">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {loadError}
        <button onclick={loadBusinessTypes}>Reintentar</button>
      </div>
    {/if}

    <div class="panel-content">
      {#if activeView === "list"}
        <BusinessTypeList
          {businessTypes}
          jwt={jwt!}
          onSelect={handleSelect}
          onDeleted={handleDeleted}
          onUpdated={handleUpdated}
        />
      {:else}
        <BusinessTypeForm
          jwt={jwt!}
          businessType={selectedBusinessType}
          onSaved={handleSaved}
        />
      {/if}
    </div>
  {/if}
</div>

<style>
  .panel-container {
    max-width: 900px;
    margin: 0 auto;
    padding: var(--spacing-xl);
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    color: var(--color-text-variant);
  }

  .spinner-large {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: var(--color-secondary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: var(--spacing-md);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .auth-required {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
    padding: var(--spacing-2xl);
  }

  .auth-required svg {
    color: var(--color-text-variant);
    margin-bottom: var(--spacing-lg);
    opacity: 0.5;
  }

  .auth-required h2 {
    font-size: var(--font-size-xl);
    font-weight: 700;
    margin-bottom: var(--spacing-sm);
  }

  .auth-required p {
    font-size: var(--font-size-base);
    color: var(--color-text-variant);
    margin-bottom: var(--spacing-xl);
    max-width: 400px;
  }

  .login-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-xl);
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-primary);
    background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent) 100%);
    border-radius: var(--radius-full);
    transition: all var(--transition-base);
  }

  .login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(225, 199, 142, 0.3);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-md);
    transition: all var(--transition-base);
  }

  .back-btn:hover {
    color: var(--color-text);
    background: rgba(255, 255, 255, 0.1);
  }

  .panel-title {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .create-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-primary);
    background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent) 100%);
    border-radius: var(--radius-full);
    transition: all var(--transition-base);
  }

  .create-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(225, 199, 142, 0.3);
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
    margin-bottom: var(--spacing-lg);
  }

  .error-banner button {
    margin-left: auto;
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-xs);
    color: #ff6b6b;
    background: rgba(255, 59, 48, 0.1);
    border-radius: var(--radius-sm);
    transition: all var(--transition-base);
  }

  .error-banner button:hover {
    background: rgba(255, 59, 48, 0.2);
  }

  .panel-content {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-2xl);
    padding: var(--spacing-xl);
  }

  @media (max-width: 768px) {
    .panel-container {
      padding: var(--spacing-md);
    }

    .panel-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);
    }

    .create-btn {
      width: 100%;
      justify-content: center;
    }
  }
</style>
