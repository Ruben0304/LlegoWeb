<script lang="ts">
  import ProductForm from './ProductForm.svelte';
  import ProductList from './ProductList.svelte';

  type AuthView = 'login' | 'register';
  type Product = {
    id: string;
    name: string;
    description: string;
    weight: string;
    price: number;
    currency: 'USD' | 'CUP';
    image: string;
    availability: boolean;
    categoryId?: string;
  };

  type Business = {
    id: string;
    name: string;
    branchId: string;
  };

  let isAuthenticated = $state(false);
  let currentView = $state<AuthView>('login');
  let business = $state<Business | null>(null);
  let products = $state<Product[]>([]);

  // Form states
  let loginEmail = $state('');
  let loginPassword = $state('');
  let registerName = $state('');
  let registerEmail = $state('');
  let registerPassword = $state('');
  let registerConfirmPassword = $state('');

  let isLoading = $state(false);
  let errorMessage = $state('');

  function switchView(view: AuthView) {
    currentView = view;
    errorMessage = '';
  }

  function handleLogin(e: Event) {
    e.preventDefault();
    isLoading = true;
    errorMessage = '';

    // Simulate login - replace with actual API call
    setTimeout(() => {
      isLoading = false;
      // Demo login
      business = {
        id: 'demo-business',
        name: loginEmail.split('@')[0] || 'Mi Negocio',
        branchId: 'branch-001'
      };
      isAuthenticated = true;
    }, 1000);
  }

  function handleRegister(e: Event) {
    e.preventDefault();
    if (registerPassword !== registerConfirmPassword) {
      errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    isLoading = true;
    errorMessage = '';

    // Simulate registration - replace with actual API call
    setTimeout(() => {
      isLoading = false;
      business = {
        id: 'new-business',
        name: registerName,
        branchId: 'branch-001'
      };
      isAuthenticated = true;
    }, 1000);
  }

  function handleLogout() {
    isAuthenticated = false;
    business = null;
    products = [];
    loginEmail = '';
    loginPassword = '';
    currentView = 'login';
  }

  function handleProductAdded(product: Product) {
    products = [...products, { ...product, id: `prod-${Date.now()}` }];
  }

  function handleProductDeleted(productId: string) {
    products = products.filter(p => p.id !== productId);
  }

  function handleProductToggleAvailability(productId: string) {
    products = products.map(p =>
      p.id === productId ? { ...p, availability: !p.availability } : p
    );
  }
</script>

<section class="business-panel">
  <div class="container">
    {#if !isAuthenticated}
      <div class="auth-container">
        <div class="auth-header">
          <div class="auth-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h1 class="auth-title">Panel de Negocios</h1>
          <p class="auth-subtitle">Gestiona tus productos y llega a más clientes</p>
        </div>

        <div class="auth-tabs">
          <button
            class="auth-tab"
            class:active={currentView === 'login'}
            onclick={() => switchView('login')}
          >
            Iniciar Sesión
          </button>
          <button
            class="auth-tab"
            class:active={currentView === 'register'}
            onclick={() => switchView('register')}
          >
            Registrarse
          </button>
        </div>

        {#if errorMessage}
          <div class="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {errorMessage}
          </div>
        {/if}

        {#if currentView === 'login'}
          <form class="auth-form" onsubmit={handleLogin}>
            <div class="form-group">
              <label for="login-email">Correo electrónico</label>
              <input
                type="email"
                id="login-email"
                bind:value={loginEmail}
                placeholder="tu@negocio.com"
                required
                autocomplete="email"
              />
            </div>
            <div class="form-group">
              <label for="login-password">Contraseña</label>
              <input
                type="password"
                id="login-password"
                bind:value={loginPassword}
                placeholder="••••••••"
                required
                autocomplete="current-password"
              />
            </div>
            <button type="submit" class="submit-btn" disabled={isLoading}>
              {#if isLoading}
                <span class="spinner"></span>
                Iniciando...
              {:else}
                Iniciar Sesión
              {/if}
            </button>
          </form>
        {:else}
          <form class="auth-form" onsubmit={handleRegister}>
            <div class="form-group">
              <label for="register-name">Nombre del negocio</label>
              <input
                type="text"
                id="register-name"
                bind:value={registerName}
                placeholder="Mi Restaurante"
                required
              />
            </div>
            <div class="form-group">
              <label for="register-email">Correo electrónico</label>
              <input
                type="email"
                id="register-email"
                bind:value={registerEmail}
                placeholder="tu@negocio.com"
                required
                autocomplete="email"
              />
            </div>
            <div class="form-group">
              <label for="register-password">Contraseña</label>
              <input
                type="password"
                id="register-password"
                bind:value={registerPassword}
                placeholder="••••••••"
                required
                minlength="8"
                autocomplete="new-password"
              />
            </div>
            <div class="form-group">
              <label for="register-confirm">Confirmar contraseña</label>
              <input
                type="password"
                id="register-confirm"
                bind:value={registerConfirmPassword}
                placeholder="••••••••"
                required
                minlength="8"
                autocomplete="new-password"
              />
            </div>
            <button type="submit" class="submit-btn" disabled={isLoading}>
              {#if isLoading}
                <span class="spinner"></span>
                Registrando...
              {:else}
                Crear Cuenta
              {/if}
            </button>
          </form>
        {/if}
      </div>
    {:else}
      <div class="dashboard">
        <header class="dashboard-header">
          <div class="business-info">
            <div class="business-avatar">
              {business?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 class="business-name">{business?.name}</h1>
              <p class="business-meta">{products.length} {products.length === 1 ? 'producto' : 'productos'}</p>
            </div>
          </div>
          <button class="logout-btn" onclick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Cerrar Sesión
          </button>
        </header>

        <div class="dashboard-content">
          <div class="dashboard-grid">
            <div class="form-section">
              <ProductForm
                branchId={business?.branchId || ''}
                onProductAdded={handleProductAdded}
              />
            </div>
            <div class="list-section">
              <ProductList
                {products}
                onDelete={handleProductDeleted}
                onToggleAvailability={handleProductToggleAvailability}
              />
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  .business-panel {
    padding: var(--spacing-xl) 0 var(--spacing-4xl);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);
  }

  /* Auth Container */
  .auth-container {
    max-width: 420px;
    margin: 0 auto;
    padding: var(--spacing-2xl);
  }

  .auth-header {
    text-align: center;
    margin-bottom: var(--spacing-2xl);
  }

  .auth-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto var(--spacing-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(225, 199, 142, 0.15) 0%, rgba(90, 132, 103, 0.15) 100%);
    border-radius: 50%;
    color: var(--color-secondary);
  }

  .auth-title {
    font-size: var(--font-size-3xl);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: var(--spacing-sm);
    background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .auth-subtitle {
    color: var(--color-text-variant);
    font-size: var(--font-size-base);
  }

  /* Auth Tabs */
  .auth-tabs {
    display: flex;
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-lg);
    padding: 4px;
    margin-bottom: var(--spacing-xl);
  }

  .auth-tab {
    flex: 1;
    padding: var(--spacing-md);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text-variant);
    background: transparent;
    border-radius: var(--radius-md);
    transition: all var(--transition-base);
  }

  .auth-tab:hover {
    color: var(--color-text);
  }

  .auth-tab.active {
    background: rgba(255, 255, 255, 0.1);
    color: var(--color-text);
  }

  /* Error Message */
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

  /* Form Styles */
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .form-group label {
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text-variant);
  }

  .form-group input {
    width: 100%;
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-base);
    color: var(--color-text);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-lg);
    transition: all var(--transition-base);
  }

  .form-group input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--color-secondary);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 4px rgba(225, 199, 142, 0.1);
  }

  .submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    width: 100%;
    padding: var(--spacing-md) var(--spacing-xl);
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #000;
    background: #fff;
    border-radius: var(--radius-full);
    transition: all var(--transition-base);
    margin-top: var(--spacing-sm);
  }

  .submit-btn:hover:not(:disabled) {
    background: var(--color-secondary);
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(225, 199, 142, 0.3);
  }

  .submit-btn:disabled {
    opacity: 0.6;
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

  /* Dashboard */
  .dashboard {
    animation: fadeIn 0.5s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: var(--spacing-xl);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: var(--spacing-2xl);
  }

  .business-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }

  .business-avatar {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--color-primary);
    background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent) 100%);
    border-radius: var(--radius-xl);
  }

  .business-name {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 2px;
  }

  .business-meta {
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text-variant);
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-full);
    transition: all var(--transition-base);
  }

  .logout-btn:hover {
    color: #ff6b6b;
    background: rgba(255, 59, 48, 0.1);
  }

  /* Dashboard Grid */
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-2xl);
  }

  .form-section,
  .list-section {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-2xl);
    padding: var(--spacing-xl);
  }

  @media (max-width: 968px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .auth-container {
      padding: var(--spacing-lg);
    }

    .dashboard-header {
      flex-direction: column;
      gap: var(--spacing-lg);
      align-items: flex-start;
    }

    .form-section,
    .list-section {
      padding: var(--spacing-lg);
    }
  }
</style>
