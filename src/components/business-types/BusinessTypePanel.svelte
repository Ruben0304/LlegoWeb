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

  // Auth storage keys (same as BusinessPanel)
  const AUTH_TOKEN_KEY = "llego.auth.accessToken";
  const AUTH_USER_KEY = "llego.auth.user";

  onMount(async () => {
    // Check auth from localStorage (same keys as BusinessPanel)
    const storedJwt = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    
    if (storedJwt && storedUser) {
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

<div class="bt-panel-container">
  {#if isLoading}
    <div class="bt-loading-state">
      <div class="bt-spinner-large"></div>
      <p>Cargando...</p>
    </div>
  {:else if !isAuthenticated}
    <div class="bt-auth-required">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <h2>Acceso Restringido</h2>
      <p>Debes iniciar sesión como administrador para gestionar los tipos de negocio.</p>
      <a href="/auth/login" class="btn btn-accent">Iniciar Sesión</a>
    </div>
  {:else}
    <div class="bt-panel-header">
      <div class="bt-header-left">
        {#if activeView === "form"}
          <button class="bt-back-btn" onclick={showList}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver
          </button>
        {/if}
        <h1 class="bt-panel-title">
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
        <button class="bt-create-btn" onclick={showCreateForm}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Crear Nuevo
        </button>
      {/if}
    </div>

    {#if loadError}
      <div class="error-message">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {loadError}
        <button onclick={loadBusinessTypes}>Reintentar</button>
      </div>
    {/if}

    <div class="bt-panel-content">
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
