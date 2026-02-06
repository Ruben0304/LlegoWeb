<script lang="ts">
  import { onMount } from "svelte";
  import type { Tutorial } from "@/lib/tutorial";
  import {
    getTutorials,
    deleteTutorial,
    toggleTutorialActive,
  } from "@/lib/tutorial";
  import TutorialForm from "./TutorialForm.svelte";
  import TutorialList from "./TutorialList.svelte";

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
  let currentUser = $state<AuthUser | null>(null);
  let jwt = $state("");

  // Tutorials state
  let tutorials = $state<Tutorial[]>([]);
  let editingTutorial = $state<Tutorial | null>(null);
  let isLoadingTutorials = $state(false);
  let tutorialError = $state("");

  // Loading states
  let googleInitialized = $state(false);
  let googleButtonRef: HTMLDivElement | null = $state(null);
  let isLoading = $state(false);
  let errorMessage = $state("");

  const AUTH_TOKEN_KEY = "llego.auth.accessToken";
  const AUTH_TOKEN_TYPE_KEY = "llego.auth.tokenType";
  const AUTH_USER_KEY = "llego.auth.user";

  const GOOGLE_CLIENT_ID = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID;
  const BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL || "";

  function storeAuth(data: AuthResponse) {
    if (typeof window === "undefined") return;
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
    if (typeof window === "undefined") return;
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_TYPE_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }

  function setAuthenticatedUser(data: AuthResponse) {
    currentUser = data.user;
    jwt = data.accessToken;
    isAuthenticated = true;
  }

  function restoreSession() {
    if (typeof window === "undefined") {
      console.log("restoreSession: No se ejecuta en SSR");
      return;
    }

    console.log("restoreSession: Buscando datos en localStorage...");
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userRaw = localStorage.getItem(AUTH_USER_KEY);

    console.log("restoreSession: Token encontrado?", !!token);
    console.log("restoreSession: User encontrado?", !!userRaw);

    if (!token || !userRaw) {
      console.log("restoreSession: No hay sesión guardada");
      return;
    }

    try {
      const user = JSON.parse(userRaw) as AuthUser;
      console.log("restoreSession: Usuario parseado:", user.email);

      setAuthenticatedUser({
        accessToken: token,
        tokenType: localStorage.getItem(AUTH_TOKEN_TYPE_KEY) || "bearer",
        user,
      });

      console.log("✅ Sesión restaurada exitosamente para:", user.email);
      console.log("✅ isAuthenticated ahora es:", isAuthenticated);
    } catch (error) {
      console.error("❌ Error al restaurar sesión:", error);
      clearAuth();
    }
  }

  function loadScript(src: string) {
    return new Promise<boolean>((resolve) => {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${src}"]`,
      );
      if (existing) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  async function exchangeSocialToken(
    endpoint: string,
    payload: Record<string, string | null | undefined>,
  ) {
    isLoading = true;
    errorMessage = "";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as
        | AuthResponse
        | { error?: string }
        | null;

      if (!response.ok || !data || "error" in data) {
        console.error("Auth error:", {
          endpoint,
          status: response.status,
          payload: data,
        });
        errorMessage =
          (data && "error" in data && data.error) || "No se pudo autenticar.";
        return;
      }

      storeAuth(data);
      setAuthenticatedUser(data);
      console.info("Auth success:", {
        endpoint,
        userId: data.user.id,
        email: data.user.email,
      });

      // Load tutorials after authentication
      await loadTutorials();
    } catch (error) {
      console.error("Error en autenticacion social:", error);
      errorMessage = "Ocurrió un error al autenticar.";
    } finally {
      isLoading = false;
    }
  }

  async function handleGoogleCredentialResponse(response: {
    credential?: string;
  }) {
    if (!response?.credential) {
      errorMessage = "No se pudo obtener el token de Google.";
      return;
    }

    console.info("Google credential recibido:", maskToken(response.credential));
    await exchangeSocialToken("/api/auth/google", {
      idToken: response.credential,
    });
  }

  function handleGoogleLogin() {
    if (!googleButtonRef) {
      errorMessage = "Google Sign In no está disponible.";
      return;
    }

    const googleBtn = googleButtonRef.querySelector(
      'div[role="button"]',
    ) as HTMLElement;
    if (googleBtn) {
      googleBtn.click();
    } else {
      window.google?.accounts?.id?.prompt();
    }
  }

  async function handleAppleLogin() {
    isLoading = true;
    errorMessage = "";

    try {
      console.log("🍎 Iniciando Apple Sign In...");
      console.log("Backend URL:", BACKEND_URL);

      const response = await fetch(`${BACKEND_URL}/apple/start`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error:", errorText);
        throw new Error("No se pudo iniciar el flujo de Apple Sign In");
      }

      const data = await response.json();
      console.log("Backend response:", data);

      if (!data.auth_url) {
        throw new Error("No se recibió la URL de autenticación");
      }

      console.log("Auth URL recibida:", data.auth_url);

      if (data.state) {
        sessionStorage.setItem("apple_auth_state", data.state);
        console.log("State guardado:", data.state);
      }

      console.log("🚀 Redirigiendo a Apple...");
      window.location.assign(data.auth_url);
    } catch (error) {
      console.error("❌ Error en Apple Sign In:", error);
      errorMessage = error instanceof Error ? error.message : "Error al iniciar sesión con Apple";
      isLoading = false;
    }
  }

  function handleLogout() {
    isAuthenticated = false;
    currentUser = null;
    jwt = "";
    tutorials = [];
    editingTutorial = null;
    isLoadingTutorials = false;
    tutorialError = "";
    clearAuth();
  }

  // Load tutorials for the current user
  async function loadTutorials() {
    if (!jwt) return;

    isLoadingTutorials = true;
    tutorialError = "";

    try {
      tutorials = await getTutorials(jwt);
    } catch (error) {
      console.error("Error loading tutorials:", error);
      tutorialError =
        error instanceof Error ? error.message : "Error al cargar tutoriales";
      tutorials = [];
    } finally {
      isLoadingTutorials = false;
    }
  }

  // Tutorial handlers
  function handleTutorialAdded(tutorial: Tutorial) {
    editingTutorial = null;
    loadTutorials();
  }

  async function handleTutorialDeleted(tutorialId: string) {
    try {
      await deleteTutorial(tutorialId, jwt);
      tutorials = tutorials.filter((t) => t.id !== tutorialId);
    } catch (error) {
      console.error("Error deleting tutorial:", error);
      tutorialError =
        error instanceof Error ? error.message : "Error al eliminar tutorial";
    }
  }

  async function handleTutorialToggleActive(tutorialId: string) {
    try {
      const updatedTutorial = await toggleTutorialActive(tutorialId, jwt);
      tutorials = tutorials.map((t) =>
        t.id === tutorialId ? updatedTutorial : t,
      );
    } catch (error) {
      console.error("Error toggling tutorial:", error);
      tutorialError =
        error instanceof Error
          ? error.message
          : "Error al cambiar estado del tutorial";
    }
  }

  function handleTutorialEdit(tutorial: Tutorial) {
    editingTutorial = tutorial;
  }

  function renderHiddenGoogleButton() {
    if (!googleButtonRef || !window.google?.accounts?.id) {
      return;
    }

    googleButtonRef.innerHTML = "";
    window.google.accounts.id.renderButton(googleButtonRef, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      width: 300,
    });
    googleInitialized = true;
  }

  onMount(async () => {
    console.log("TutorialPanel onMount iniciado");
    restoreSession();

    if (isAuthenticated && jwt) {
      console.log("Cargando tutoriales...");
      await loadTutorials();
    } else {
      console.log("No hay sesión activa, mostrando login");
    }

    if (GOOGLE_CLIENT_ID) {
      const googleLoaded = await loadScript(
        "https://accounts.google.com/gsi/client",
      );
      if (googleLoaded && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });
        renderHiddenGoogleButton();
      }
    }
  });

  $effect(() => {
    if (googleButtonRef && window.google?.accounts?.id && !googleInitialized) {
      renderHiddenGoogleButton();
    }
  });

  declare global {
    interface Window {
      google?: {
        accounts?: {
          id?: {
            initialize: (config: {
              client_id: string;
              callback: (response: any) => void;
            }) => void;
            renderButton: (
              element: HTMLElement,
              options: Record<string, unknown>,
            ) => void;
            prompt: () => void;
          };
        };
      };
    }
  }
</script>

<section class="tutorial-panel">
  <div class="container">
    {#if !isAuthenticated}
      <div class="auth-container">
        <div class="auth-header">
          <div class="auth-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <h1 class="auth-title">Gestión de Tutoriales</h1>
          <p class="auth-subtitle">
            Administra los tutoriales de Llegó
          </p>
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
              <svg
                class="google-icon"
                viewBox="0 0 24 24"
                width="20"
                height="20"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continuar con Google</span>
            {/if}
          </button>

          <button
            type="button"
            class="apple-signin-btn"
            onclick={handleAppleLogin}
            disabled={isLoading}
          >
            {#if isLoading}
              <span class="spinner-dark"></span>
              <span>Conectando...</span>
            {:else}
              <svg
                class="apple-icon"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span>Continuar con Apple</span>
            {/if}
          </button>

          <!-- Hidden Google button for OAuth flow -->
          <div
            class="google-hidden-btn"
            bind:this={googleButtonRef}
            aria-hidden="true"
          ></div>

          <p class="auth-terms">
            Al continuar, aceptas nuestros <a href="/terminos"
              >Términos de Servicio</a
            >
            y <a href="/privacidad">Política de Privacidad</a>
          </p>
        </div>
      </div>
    {:else}
      <div class="dashboard">
        <header class="dashboard-header">
          <div class="user-info">
            <div class="user-avatar">
              {currentUser?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h1 class="user-name">{currentUser?.name || "Usuario"}</h1>
              <p class="user-meta">
                {tutorials.length}
                {tutorials.length === 1 ? "tutorial" : "tutoriales"}
              </p>
            </div>
          </div>
          <div class="header-actions">
            <a href="/negocios" class="back-btn">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Panel de Negocios
            </a>
            <button class="logout-btn" onclick={handleLogout}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </header>

        <div class="dashboard-content">
          {#if tutorialError}
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
              {tutorialError}
            </div>
          {/if}
          {#if isLoadingTutorials}
            <div class="loading-container">
              <span class="spinner-lg"></span>
              <p>Cargando tutoriales...</p>
            </div>
          {:else}
            <div class="dashboard-grid">
              <div class="form-section">
                <TutorialForm
                  {jwt}
                  onTutorialAdded={handleTutorialAdded}
                  tutorial={editingTutorial}
                />
              </div>
              <div class="list-section">
                <TutorialList
                  {tutorials}
                  onDelete={handleTutorialDeleted}
                  onToggleActive={handleTutorialToggleActive}
                  onEdit={handleTutorialEdit}
                />
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  .tutorial-panel {
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
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.08) 0%,
      rgba(255, 255, 255, 0.02) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 24px;
    color: var(--color-accent);
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

  /* Google Sign In Button */
  .google-signin-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    max-width: 320px;
    height: 54px;
    padding: 0 24px;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI",
      Roboto, sans-serif;
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

  /* Apple Sign In Button */
  .apple-signin-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    max-width: 320px;
    height: 54px;
    padding: 0 24px;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI",
      Roboto, sans-serif;
    font-size: 17px;
    font-weight: 500;
    letter-spacing: -0.01em;
    color: #ffffff;
    background: #000000;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.3),
      0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .apple-signin-btn:hover:not(:disabled) {
    transform: scale(1.02);
    background: #1a1a1a;
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.4),
      0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .apple-signin-btn:active:not(:disabled) {
    transform: scale(0.98);
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.3),
      0 2px 6px rgba(0, 0, 0, 0.2);
  }

  .apple-signin-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .apple-signin-btn .apple-icon {
    flex-shrink: 0;
  }

  .apple-signin-btn span {
    white-space: nowrap;
  }

  .spinner-dark {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  /* Hidden Google Button */
  .google-hidden-btn {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
    opacity: 0;
    pointer-events: none;
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

  .spinner-lg {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Loading Container */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-lg);
    padding: var(--spacing-4xl);
    color: var(--color-text-variant);
  }

  /* Dashboard */
  .dashboard {
    animation: fadeIn 0.5s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: var(--spacing-xl);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: var(--spacing-2xl);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }

  .user-avatar {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--color-primary);
    background: linear-gradient(
      135deg,
      var(--color-accent) 0%,
      var(--color-secondary) 100%
    );
    border-radius: var(--radius-xl);
  }

  .user-name {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 2px;
  }

  .user-meta {
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text-variant);
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-full);
    transition: all var(--transition-base);
    text-decoration: none;
  }

  .back-btn:hover {
    color: var(--color-text);
    background: rgba(255, 255, 255, 0.1);
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

  /* Dashboard Content */
  .dashboard-content {
    min-height: 400px;
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

    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }

    .form-section,
    .list-section {
      padding: var(--spacing-lg);
    }
  }
</style>
