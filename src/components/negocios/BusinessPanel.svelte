<script lang="ts">
  import { onMount } from 'svelte';
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

  type AuthUser = {
    id: string;
    name: string;
    email: string;
    role: string;
  };

  type AuthResponse = {
    accessToken: string;
    tokenType: string;
    user: AuthUser;
  };

  let isAuthenticated = $state(false);
  let currentView = $state<AuthView>('login');
  let business = $state<Business | null>(null);
  let products = $state<Product[]>([]);

  let googleButtonContainer = $state<HTMLDivElement | null>(null);
  let googleInitialized = $state(false);
  let appleReady = $state(false);

  // Form states
  let loginEmail = $state('');
  let loginPassword = $state('');
  let registerName = $state('');
  let registerEmail = $state('');
  let registerPassword = $state('');
  let registerConfirmPassword = $state('');

  let isLoading = $state(false);
  let errorMessage = $state('');

  const AUTH_TOKEN_KEY = 'llego.auth.accessToken';
  const AUTH_TOKEN_TYPE_KEY = 'llego.auth.tokenType';
  const AUTH_USER_KEY = 'llego.auth.user';

  const GOOGLE_CLIENT_ID = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID;
  const APPLE_CLIENT_ID = import.meta.env.PUBLIC_APPLE_CLIENT_ID;
  const APPLE_REDIRECT_URI = import.meta.env.PUBLIC_APPLE_REDIRECT_URI;

  function storeAuth(data: AuthResponse) {
    localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
    localStorage.setItem(AUTH_TOKEN_TYPE_KEY, data.tokenType);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  }

  function maskToken(token: string) {
    if (token.length <= 12) {
      return `${token.slice(0, 3)}...`;
    }
    return `${token.slice(0, 6)}...${token.slice(-6)}`;
  }

  function clearAuth() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_TYPE_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }

  function setAuthenticatedUser(data: AuthResponse) {
    business = {
      id: data.user.id,
      name: data.user.name || data.user.email,
      branchId: 'default',
    };
    isAuthenticated = true;
  }

  function restoreSession() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userRaw = localStorage.getItem(AUTH_USER_KEY);

    if (!token || !userRaw) {
      return;
    }

    try {
      const user = JSON.parse(userRaw) as AuthUser;
      setAuthenticatedUser({
        accessToken: token,
        tokenType: localStorage.getItem(AUTH_TOKEN_TYPE_KEY) || 'bearer',
        user,
      });
    } catch (error) {
      console.error('No se pudo restaurar la sesion:', error);
      clearAuth();
    }
  }

  function loadScript(src: string) {
    return new Promise<boolean>((resolve) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
      if (existing) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  async function exchangeSocialToken(endpoint: string, payload: Record<string, string | null | undefined>) {
    isLoading = true;
    errorMessage = '';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as AuthResponse | { error?: string } | null;

      if (!response.ok || !data || 'error' in data) {
        console.error('Auth error:', {
          endpoint,
          status: response.status,
          payload: data,
        });
        errorMessage = (data && 'error' in data && data.error) || 'No se pudo autenticar.';
        return;
      }

      storeAuth(data);
      setAuthenticatedUser(data);
      console.info('Auth success:', {
        endpoint,
        userId: data.user.id,
        email: data.user.email,
      });
      window.location.assign('/negocios');
    } catch (error) {
      console.error('Error en autenticacion social:', error);
      errorMessage = 'Ocurrió un error al autenticar.';
    } finally {
      isLoading = false;
    }
  }

  async function handleGoogleCredentialResponse(response: { credential?: string }) {
    if (!response?.credential) {
      errorMessage = 'No se pudo obtener el token de Google.';
      return;
    }

    console.info('Google credential recibido:', maskToken(response.credential));
    await exchangeSocialToken('/api/auth/google', {
      idToken: response.credential,
    });
  }

  async function handleAppleLogin() {
    if (!window.AppleID?.auth) {
      errorMessage = 'Apple Sign In no está disponible.';
      return;
    }

    try {
      const response = await window.AppleID.auth.signIn();
      const authorization = response?.authorization;

      if (!authorization?.id_token) {
        errorMessage = 'No se pudo obtener el token de Apple.';
        return;
      }

      console.info('Apple identity token recibido:', maskToken(authorization.id_token));
      await exchangeSocialToken('/api/auth/apple', {
        identityToken: authorization.id_token,
        authorizationCode: authorization.code,
      });
    } catch (error) {
      console.error('Error en Apple Sign In:', error);
      errorMessage = 'No se pudo autenticar con Apple.';
    }
  }

  function renderGoogleButton() {
    if (!googleButtonContainer || !window.google?.accounts?.id) {
      return;
    }

    googleButtonContainer.innerHTML = '';
    window.google.accounts.id.renderButton(googleButtonContainer, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      width: 320,
    });
  }

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
    clearAuth();
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

  $effect(() => {
    if (currentView !== 'login' || !googleInitialized) {
      return;
    }

    renderGoogleButton();
  });

  onMount(async () => {
    restoreSession();

    if (GOOGLE_CLIENT_ID) {
      const googleLoaded = await loadScript('https://accounts.google.com/gsi/client');
      if (googleLoaded && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });
        googleInitialized = true;
        renderGoogleButton();
      }
    }

    if (APPLE_CLIENT_ID && APPLE_REDIRECT_URI) {
      const appleLoaded = await loadScript(
        'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'
      );
      if (appleLoaded && window.AppleID?.auth) {
        window.AppleID.auth.init({
          clientId: APPLE_CLIENT_ID,
          scope: 'name email',
          redirectURI: APPLE_REDIRECT_URI,
          usePopup: true,
        });
        appleReady = true;
      }
    }
  });

  declare global {
    interface Window {
      google?: {
        accounts?: {
          id?: {
            initialize: (config: { client_id: string; callback: (response: any) => void }) => void;
            renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
          };
        };
      };
      AppleID?: {
        auth?: {
          init: (config: Record<string, unknown>) => void;
          signIn: () => Promise<any>;
        };
      };
    }
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
          <div class="social-login">
            <div class="social-buttons">
              <div class="google-button" bind:this={googleButtonContainer}></div>
              <button
                type="button"
                class="apple-button"
                onclick={handleAppleLogin}
                disabled={isLoading || !appleReady}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16.365 1.43c0 1.14-.48 2.23-1.26 3.1-.79.88-2.09 1.56-3.33 1.46-.1-1.12.46-2.29 1.22-3.08.8-.87 2.16-1.52 3.37-1.48ZM19.29 8.27c-1.86-1.1-4.47-.97-5.98.42-1.37 1.26-1.87 3.41-.76 5.4.6 1.07 1.4 2.13 2.45 2.13 1.01 0 1.4-.65 2.62-.65 1.25 0 1.56.65 2.64.63 1.12-.02 1.82-1 2.4-2.07.72-1.21 1.01-2.39 1.02-2.45-.02-.01-1.95-.75-1.97-2.97-.02-1.86 1.51-2.74 1.58-2.79-.86-1.26-2.2-1.4-2.99-1.45Z"/>
                </svg>
                Continuar con Apple
              </button>
            </div>
            <div class="social-divider">
              <span>o continúa con correo</span>
            </div>
          </div>
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

  .social-login {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
  }

  .social-buttons {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: center;
  }

  .google-button :global(div) {
    width: 100%;
  }

  .apple-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    width: 100%;
    max-width: 320px;
    padding: var(--spacing-md);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: #fff;
    background: #000;
    border-radius: var(--radius-full);
    transition: all var(--transition-base);
  }

  .apple-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .social-divider {
    position: relative;
    text-align: center;
    color: var(--color-text-variant);
    font-size: var(--font-size-xs);
  }

  .social-divider::before,
  .social-divider::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 35%;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }

  .social-divider::before {
    left: 0;
  }

  .social-divider::after {
    right: 0;
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
