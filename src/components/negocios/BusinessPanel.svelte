<script lang="ts">
  import { onMount } from 'svelte';
  import ProductForm from './ProductForm.svelte';
  import ProductList from './ProductList.svelte';

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
  let business = $state<Business | null>(null);
  let products = $state<Product[]>([]);

  let googleInitialized = $state(false);

  let isLoading = $state(false);
  let errorMessage = $state('');

  const AUTH_TOKEN_KEY = 'llego.auth.accessToken';
  const AUTH_TOKEN_TYPE_KEY = 'llego.auth.tokenType';
  const AUTH_USER_KEY = 'llego.auth.user';

  const GOOGLE_CLIENT_ID = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID;

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

  function handleGoogleLogin() {
    if (!window.google?.accounts?.id) {
      errorMessage = 'Google Sign In no está disponible.';
      return;
    }

    window.google.accounts.id.prompt();
  }

  function handleLogout() {
    isAuthenticated = false;
    business = null;
    products = [];
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
      }
    }
  });

  declare global {
    interface Window {
      google?: {
        accounts?: {
          id?: {
            initialize: (config: { client_id: string; callback: (response: any) => void }) => void;
            prompt: () => void;
          };
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

        <div class="auth-content">
          <button
            type="button"
            class="google-signin-btn"
            onclick={handleGoogleLogin}
            disabled={isLoading || !googleInitialized}
          >
            {#if isLoading}
              <span class="spinner"></span>
              <span>Conectando...</span>
            {:else}
              <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continuar con Google</span>
            {/if}
          </button>

          <p class="auth-terms">
            Al continuar, aceptas nuestros <a href="/terminos">Términos de Servicio</a> y <a href="/privacidad">Política de Privacidad</a>
          </p>
        </div>
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
    min-height: 100vh;
    display: flex;
    align-items: center;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);
    width: 100%;
  }

  /* Auth Container */
  .auth-container {
    max-width: 400px;
    margin: 0 auto;
    padding: var(--spacing-3xl) var(--spacing-2xl);
  }

  .auth-header {
    text-align: center;
    margin-bottom: var(--spacing-3xl);
  }

  .auth-icon {
    width: 88px;
    height: 88px;
    margin: 0 auto var(--spacing-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 24px;
    color: var(--color-secondary);
    backdrop-filter: blur(20px);
  }

  .auth-title {
    font-size: 2rem;
    font-weight: 600;
    letter-spacing: -0.025em;
    margin-bottom: var(--spacing-sm);
    color: #fff;
  }

  .auth-subtitle {
    color: rgba(255, 255, 255, 0.5);
    font-size: var(--font-size-base);
    font-weight: 400;
  }

  /* Error Message */
  .error-message {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-lg);
    background: rgba(255, 59, 48, 0.08);
    border: 1px solid rgba(255, 59, 48, 0.2);
    border-radius: 12px;
    color: #ff6b6b;
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-xl);
  }

  /* Auth Content */
  .auth-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xl);
  }

  /* Google Sign In Button - Apple Style */
  .google-signin-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    max-width: 320px;
    height: 54px;
    padding: 0 24px;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
    font-size: 17px;
    font-weight: 500;
    letter-spacing: -0.01em;
    color: #1d1d1f;
    background: #ffffff;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.08),
      0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .google-signin-btn:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.12),
      0 8px 24px rgba(0, 0, 0, 0.08);
  }

  .google-signin-btn:active:not(:disabled) {
    transform: scale(0.98);
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.1),
      0 2px 6px rgba(0, 0, 0, 0.05);
  }

  .google-signin-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .google-signin-btn .google-icon {
    flex-shrink: 0;
  }

  .google-signin-btn span {
    white-space: nowrap;
  }

  /* Auth Terms */
  .auth-terms {
    text-align: center;
    font-size: 12px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.35);
    max-width: 280px;
  }

  .auth-terms a {
    color: rgba(255, 255, 255, 0.5);
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .auth-terms a:hover {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: underline;
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-top-color: #1d1d1f;
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
