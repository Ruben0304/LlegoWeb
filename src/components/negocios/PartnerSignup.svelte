<script lang="ts">
  /**
   * Registro de socios (/negocios): elegir "vender en Llegó" o "ser mensajero",
   * iniciar sesión con Google o Apple, enviar la solicitud y ver su estado.
   *
   * El backend es la fuente de verdad (submitPartnerRequest / myPartnerAccess):
   * aprobar la solicitud en el Panel Admin es lo que da acceso a la app.
   * Todo el texto que viene del backend o del usuario se pinta con
   * interpolación de Svelte (escapada); nada se inserta como HTML.
   */
  import { onMount } from "svelte";

  import {
    clearSession,
    exchangeGoogleCredential,
    loadGoogleIdentity,
    readSession,
    startAppleSignIn,
    storeSession,
    type StoredSession,
  } from "@/lib/auth/session";
  import {
    formatPhone,
    getMyPartnerAccess,
    graphqlErrorMessage,
    isAuthError,
    submitPartnerRequest,
    type PartnerAccess,
    type PartnerRequest,
    type PartnerRequestKind,
    type SubmitPartnerRequestInput,
  } from "@/lib/partner";
  import {
    PARTNER_APPS,
    SUPPORT_EMAIL,
    type PartnerApp,
    SUPPORT_RESPONSE_TIME,
    SUPPORT_WHATSAPP_DISPLAY,
    supportMailtoUrl,
    supportWhatsappUrl,
  } from "@/lib/site";
  import PartnerForm from "./PartnerForm.svelte";

  const GOOGLE_CLIENT_ID = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID;
  const BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL || "";
  const RETURN_PATH = "/negocios";
  // Lo que eligió antes de irse a Apple, para seguir donde estaba al volver.
  const KIND_KEY = "llego.partner.kind";

  const OPTIONS: PartnerRequestKind[] = ["BUSINESS", "COURIER"];

  const KIND_COPY: Record<
    PartnerRequestKind,
    { choice: string; detail: string; noun: string; app: PartnerApp }
  > = {
    BUSINESS: {
      choice: "Quiero vender en Llegó",
      detail: "Registra tu negocio y recibe pedidos de clientes cerca de ti.",
      noun: "vender en Llegó",
      app: PARTNER_APPS.business,
    },
    COURIER: {
      choice: "Quiero ser mensajero",
      detail: "Reparte pedidos en tu zona y gana dinero con cada entrega.",
      noun: "ser mensajero",
      app: PARTNER_APPS.courier,
    },
  };

  let kind = $state<PartnerRequestKind | null>(null);
  let session = $state<StoredSession | null>(null);
  let access = $state<PartnerAccess | null>(null);
  let loadingAccess = $state(false);
  let accessError = $state("");

  let authBusy = $state(false);
  let authError = $state("");
  let googleUnavailable = $state(false);
  let googleReady = $state(false);
  let googleButtonEl = $state<HTMLDivElement | null>(null);

  let submitting = $state(false);
  let submitError = $state("");
  // Tras un rechazo se puede enviar una solicitud nueva.
  let retrying = $state(false);

  const latest = $derived<PartnerRequest | null>(
    !access || !kind
      ? null
      : kind === "BUSINESS"
        ? access.latestBusinessRequest
        : access.latestCourierRequest
  );
  const approved = $derived(
    !!access && !!kind && (kind === "BUSINESS" ? access.merchantApproved : access.courierApproved)
  );

  type View = "choose" | "login" | "loading" | "error" | "approved" | "pending" | "rejected" | "form";
  const view = $derived.by<View>(() => {
    if (!kind) return "choose";
    if (!session) return "login";
    if (accessError) return "error";
    if (loadingAccess || !access) return "loading";
    if (approved) return "approved";
    if (latest && (latest.status === "PENDING" || latest.status === "CONTACTED")) return "pending";
    if (latest && latest.status === "REJECTED" && !retrying) return "rejected";
    return "form";
  });

  const copy = $derived(kind ? KIND_COPY[kind] : null);
  const userLabel = $derived(session?.user?.email || session?.user?.name || "");
  // El nombre de la cuenta de Google sirve para rellenar el formulario; el que
  // /auth/callback deduce del email (login con Apple) no.
  const initialName = $derived.by(() => {
    const name = session?.user?.name?.trim() ?? "";
    const emailLocalPart = session?.user?.email?.split("@")[0] ?? "";
    return name && name !== "Usuario" && name !== emailLocalPart ? name : "";
  });

  function chooseKind(next: PartnerRequestKind) {
    kind = next;
    retrying = false;
    submitError = "";
    try {
      sessionStorage.setItem(KIND_KEY, next);
    } catch {
      // Sin sessionStorage (modo privado estricto): solo se pierde la elección al volver de Apple.
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function backToChoice() {
    kind = null;
    retrying = false;
    try {
      sessionStorage.removeItem(KIND_KEY);
    } catch {
      // ignorado
    }
  }

  async function loadAccess() {
    if (!session) return;
    loadingAccess = true;
    accessError = "";
    try {
      access = await getMyPartnerAccess(session.token);
      // Quien vuelve sin haber elegido ve directamente su última solicitud.
      if (!kind) {
        const latestRequest = mostRecent(access.latestBusinessRequest, access.latestCourierRequest);
        if (latestRequest) kind = latestRequest.type;
      }
    } catch (error) {
      if (isAuthError(error)) {
        signOut("Tu sesión venció. Inicia sesión de nuevo para continuar.");
      } else {
        accessError = graphqlErrorMessage(error, "No pudimos consultar tu solicitud. Revisa tu conexión e inténtalo de nuevo.");
      }
    } finally {
      loadingAccess = false;
    }
  }

  function mostRecent(a: PartnerRequest | null, b: PartnerRequest | null): PartnerRequest | null {
    if (!a) return b;
    if (!b) return a;
    return new Date(a.createdAt) >= new Date(b.createdAt) ? a : b;
  }

  function signIn(next: StoredSession) {
    session = next;
    authError = "";
    access = null;
    loadAccess();
  }

  function signOut(message = "") {
    clearSession();
    session = null;
    access = null;
    retrying = false;
    authError = message;
  }

  async function handleGoogleCredential(response: { credential?: string }) {
    if (!response?.credential) {
      authError = "No se pudo obtener tu cuenta de Google. Inténtalo de nuevo.";
      return;
    }
    authBusy = true;
    authError = "";
    try {
      const data = await exchangeGoogleCredential(response.credential);
      storeSession(data.accessToken, data.user, data.tokenType);
      signIn({ token: data.accessToken, user: data.user });
    } catch (error) {
      authError = error instanceof Error ? error.message : "No se pudo iniciar sesión con Google.";
    } finally {
      authBusy = false;
    }
  }

  async function handleApple() {
    if (!BACKEND_URL) {
      authError = "El inicio de sesión con Apple no está disponible ahora mismo. Usa Google.";
      return;
    }
    authBusy = true;
    authError = "";
    try {
      await startAppleSignIn(BACKEND_URL, RETURN_PATH);
      // La página se va a Apple; authBusy se queda mientras navega.
    } catch (error) {
      authError = error instanceof Error ? error.message : "No se pudo iniciar sesión con Apple.";
      authBusy = false;
    }
  }

  async function handleSubmit(input: SubmitPartnerRequestInput) {
    if (!session) return;
    submitting = true;
    submitError = "";
    try {
      await submitPartnerRequest(input, session.token);
      retrying = false;
      await loadAccess();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      if (isAuthError(error)) {
        signOut("Tu sesión venció. Inicia sesión de nuevo y vuelve a enviar la solicitud.");
      } else {
        submitError = graphqlErrorMessage(error, "No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.");
        // Puede que ya hubiera una solicitud (p. ej. enviada desde otra pestaña).
        loadAccess();
      }
    } finally {
      submitting = false;
    }
  }

  function formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });
  }

  function whatsappAbout(text: string): string {
    return supportWhatsappUrl(text);
  }

  onMount(async () => {
    try {
      const saved = sessionStorage.getItem(KIND_KEY);
      if (saved === "BUSINESS" || saved === "COURIER") kind = saved;
    } catch {
      // ignorado
    }

    const stored = readSession();
    if (stored) signIn(stored);

    if (!GOOGLE_CLIENT_ID) {
      googleUnavailable = true;
      return;
    }
    const google = await loadGoogleIdentity();
    if (!google) {
      googleUnavailable = true;
      return;
    }
    google.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleCredential });
    googleReady = true;
  });

  // El botón oficial de Google se pinta cada vez que aparece la pantalla de login.
  $effect(() => {
    if (!googleReady || !googleButtonEl) return;
    const target = googleButtonEl;
    loadGoogleIdentity().then((google) => {
      if (!google) return;
      target.replaceChildren();
      google.renderButton(target, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: 300,
        locale: "es",
      });
    });
  });
</script>

<section class="partner">
  <div class="partner-inner">
    <header class="partner-header">
      <span class="badge">Negocios y mensajeros</span>
      <h1 class="title">Súmate a Llegó</h1>
      <p class="subtitle">
        Vende en Llegó o reparte pedidos en tu zona. Envía tu solicitud y te llamaremos para conocerte.
      </p>
    </header>

    {#if session && view !== "choose"}
      <div class="session-bar">
        <span>Sesión iniciada{userLabel ? ` como ${userLabel}` : ""}</span>
        <button type="button" class="link-button" onclick={() => signOut()}>Cerrar sesión</button>
      </div>
    {/if}

    {#if view === "choose"}
      <div class="choices">
        {#each OPTIONS as option (option)}
          <button type="button" class="choice" onclick={() => chooseKind(option)}>
            <span class="choice-icon" aria-hidden="true">
              {#if option === "BUSINESS"}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l1.5-5h15L21 9" />
                  <path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9z" />
                  <path d="M5 13v7h14v-7" />
                  <path d="M10 20v-4h4v4" />
                </svg>
              {:else}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="5.5" cy="17.5" r="3.5" />
                  <circle cx="18.5" cy="17.5" r="3.5" />
                  <path d="M15 6h2l3 11.5" />
                  <path d="M5.5 17.5L9 9h6l-3.5 8.5" />
                  <path d="M12 6h-2" />
                </svg>
              {/if}
            </span>
            <span class="choice-title">{KIND_COPY[option].choice}</span>
            <span class="choice-detail">{KIND_COPY[option].detail}</span>
          </button>
        {/each}
      </div>
    {:else if copy}
      <div class="card">
        <div class="card-top">
          <span class="step-label">{copy.choice}</span>
          <button type="button" class="link-button" onclick={backToChoice}>Cambiar</button>
        </div>

        {#if view === "login"}
          <h2 class="card-title">Inicia sesión para continuar</h2>
          <p class="card-text">
            Usa la cuenta de Google o Apple con la que entrarás después en la app {copy.app.name}. Solo la usamos para identificarte.
          </p>

          {#if authError}
            <p class="form-error" role="alert">{authError}</p>
          {/if}

          <div class="auth-buttons">
            {#if googleUnavailable}
              <p class="card-note">El inicio de sesión con Google no está disponible ahora mismo.</p>
            {:else}
              <div class="google-button" bind:this={googleButtonEl}>
                {#if !googleReady}
                  <span class="card-note">Cargando Google...</span>
                {/if}
              </div>
            {/if}

            <button type="button" class="apple-button" onclick={handleApple} disabled={authBusy}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16.37 12.6c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.76 2.27-1.6 2.78-.41 6.9 1.15 9.16.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.99.72 1.24-.02 2.02-1.12 2.77-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.42-3.66zM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.02.61-2.67 1.37-.58.67-1.09 1.76-.96 2.8 1.02.08 2.06-.52 2.69-1.28z" />
              </svg>
              {authBusy ? "Conectando..." : "Continuar con Apple"}
            </button>
          </div>
        {:else if view === "loading"}
          <div class="loading" role="status">
            <span class="spinner" aria-hidden="true"></span>
            <span>Consultando tu solicitud...</span>
          </div>
        {:else if view === "error"}
          <p class="form-error" role="alert">{accessError}</p>
          <button type="button" class="btn btn-secondary" onclick={loadAccess}>Reintentar</button>
        {:else if view === "form" && kind}
          <h2 class="card-title">Cuéntanos sobre ti</h2>
          <p class="card-text">
            Revisamos cada solicitud a mano y te llamamos al teléfono que nos dejes.
          </p>
          <PartnerForm
            {kind}
            {initialName}
            {submitting}
            serverError={submitError}
            onsubmit={handleSubmit}
          />
        {:else if view === "pending" && latest}
          <span class="status-pill status-pending">
            {latest.status === "CONTACTED" ? "En revisión" : "Pendiente"}
          </span>
          <h2 class="card-title">Recibimos tu solicitud</h2>
          <p class="card-text strong">
            Tu solicitud está pendiente. Nos comunicaremos contigo al {formatPhone(latest.phone)}.
          </p>
          <dl class="summary">
            {#if latest.businessName}
              <dt>Negocio</dt>
              <dd>{latest.businessName}</dd>
            {/if}
            {#if latest.municipality}
              <dt>Municipio</dt>
              <dd>{latest.municipality}</dd>
            {/if}
            <dt>Enviada</dt>
            <dd>{formatDate(latest.createdAt)}</dd>
          </dl>
          <p class="card-note">
            ¿Ese teléfono no es correcto? Escríbenos por
            <a href={whatsappAbout(`Hola Llegó, envié una solicitud para ${copy.noun} y quiero corregir mi teléfono.`)} target="_blank" rel="noopener noreferrer">WhatsApp</a>.
          </p>
        {:else if view === "approved"}
          <span class="status-pill status-approved">Aprobada</span>
          <h2 class="card-title">¡Ya puedes {copy.noun}!</h2>
          <ol class="steps">
            <li>
              Descarga la app <strong>{copy.app.name}</strong>.
              {#if copy.app.downloadUrl}
                <a class="inline-link" href={copy.app.downloadUrl} target="_blank" rel="noopener noreferrer">Descargar {copy.app.name}</a>
              {:else}
                Si no la encuentras, <a class="inline-link" href={whatsappAbout(`Hola Llegó, mi solicitud para ${copy.noun} está aprobada. ¿Me envían el enlace para descargar ${copy.app.name}?`)} target="_blank" rel="noopener noreferrer">pídenos el enlace por WhatsApp</a>.
              {/if}
            </li>
            <li>
              Inicia sesión con la misma cuenta de Google o Apple que usaste aquí{userLabel ? ` (${userLabel})` : ""}.
            </li>
            {#if kind === "BUSINESS"}
              <li>Registra tu negocio y tus sucursales desde la app: quedarán aprobados al momento.</li>
            {:else}
              <li>Conéctate en la app para empezar a recibir pedidos cerca de ti.</li>
            {/if}
          </ol>
        {:else if view === "rejected"}
          <span class="status-pill status-rejected">No aprobada</span>
          <h2 class="card-title">Esta vez no pudimos aprobar tu solicitud</h2>
          <p class="card-text">
            Si crees que es un error o quieres saber más, escríbenos: te respondemos en {SUPPORT_RESPONSE_TIME}.
          </p>
          <div class="actions">
            <a class="btn btn-primary" href={whatsappAbout(`Hola Llegó, mi solicitud para ${copy.noun} no fue aprobada y quiero más información.`)} target="_blank" rel="noopener noreferrer">
              WhatsApp {SUPPORT_WHATSAPP_DISPLAY}
            </a>
            <a class="btn btn-secondary" href={supportMailtoUrl(`Solicitud para ${copy.noun}`)}>{SUPPORT_EMAIL}</a>
          </div>
          <button type="button" class="link-button retry" onclick={() => (retrying = true)}>
            Enviar una nueva solicitud
          </button>
        {/if}
      </div>

      {#if view !== "login" && view !== "loading"}
        <p class="other-kind">
          {kind === "BUSINESS" ? "¿Prefieres repartir pedidos?" : "¿Tienes un negocio?"}
          <button type="button" class="link-button" onclick={() => chooseKind(kind === "BUSINESS" ? "COURIER" : "BUSINESS")}>
            {kind === "BUSINESS" ? "Quiero ser mensajero" : "Quiero vender en Llegó"}
          </button>
        </p>
      {/if}
    {/if}
  </div>
</section>

<style>
  .partner {
    min-height: 100vh;
    padding: 120px 20px 80px;
    background: var(--color-background);
  }

  .partner-inner {
    max-width: 640px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .partner-header {
    text-align: center;
  }

  .badge {
    display: inline-flex;
    padding: 6px 14px;
    background: linear-gradient(135deg, var(--color-secondary), var(--color-accent));
    color: var(--color-primary);
    font-weight: 600;
    font-size: 13px;
    border-radius: 20px;
    margin-bottom: 20px;
  }

  .title {
    font-size: clamp(28px, 6vw, 40px);
    font-weight: 700;
    color: var(--color-text);
    letter-spacing: -0.02em;
    line-height: 1.15;
    margin-bottom: 12px;
  }

  .subtitle {
    font-size: var(--font-size-base);
    line-height: 1.7;
    color: var(--color-text-variant);
  }

  .session-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
    overflow-wrap: anywhere;
  }

  .choices {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }

  .choice {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 24px;
    text-align: left;
    border-radius: var(--radius-lg);
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02));
    color: var(--color-text);
    font: inherit;
    cursor: pointer;
    transition: transform var(--transition-fast), border-color var(--transition-fast);
  }

  .choice:hover,
  .choice:focus-visible {
    transform: translateY(-2px);
    border-color: var(--color-secondary);
    outline: none;
  }

  .choice-icon {
    display: inline-flex;
    padding: 10px;
    border-radius: var(--radius-md);
    background: rgba(225, 199, 142, 0.12);
    color: var(--color-secondary);
  }

  .choice-title {
    font-size: var(--font-size-lg);
    font-weight: 700;
  }

  .choice-detail {
    font-size: var(--font-size-sm);
    line-height: 1.6;
    color: var(--color-text-variant);
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 28px 24px;
    border-radius: var(--radius-xl);
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  }

  .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .step-label {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-secondary);
  }

  .card-title {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--color-text);
    letter-spacing: -0.01em;
  }

  .card-text {
    font-size: var(--font-size-base);
    line-height: 1.7;
    color: var(--color-text-variant);
  }

  .card-text.strong {
    color: var(--color-text);
  }

  .card-note {
    font-size: var(--font-size-sm);
    line-height: 1.6;
    color: var(--color-text-variant);
  }

  .card-note a,
  .inline-link {
    color: var(--color-secondary);
    text-decoration: underline;
  }

  .auth-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .google-button {
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .apple-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 300px;
    max-width: 100%;
    height: 44px;
    border-radius: var(--radius-full);
    border: 1px solid rgba(255, 255, 255, 0.25);
    background: #fff;
    color: #000;
    font: inherit;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
  }

  .apple-button:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  .loading {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--color-text-variant);
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(225, 199, 142, 0.2);
    border-top-color: var(--color-secondary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .status-pill {
    align-self: flex-start;
    padding: 4px 12px;
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .status-pending {
    background: rgba(225, 199, 142, 0.15);
    color: var(--color-secondary);
  }

  .status-approved {
    background: rgba(178, 214, 154, 0.15);
    color: var(--color-accent);
  }

  .status-rejected {
    background: rgba(255, 107, 107, 0.12);
    color: #ff8a8a;
  }

  .summary {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6px 16px;
    font-size: var(--font-size-sm);
  }

  .summary dt {
    color: var(--color-text-variant);
  }

  .summary dd {
    color: var(--color-text);
    overflow-wrap: anywhere;
  }

  .steps {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-left: 20px;
    color: var(--color-text);
    line-height: 1.6;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .btn {
    display: inline-block;
    padding: 12px 22px;
    border-radius: 10px;
    border: none;
    font: inherit;
    font-weight: 600;
    font-size: 15px;
    text-align: center;
    cursor: pointer;
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--color-secondary), var(--color-accent));
    color: var(--color-primary);
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: var(--color-text);
    align-self: flex-start;
  }

  .form-error {
    padding: 12px 14px;
    border-radius: var(--radius-md);
    background: rgba(255, 59, 48, 0.1);
    border: 1px solid rgba(255, 59, 48, 0.25);
    color: #ff8a8a;
    font-size: var(--font-size-sm);
    line-height: 1.5;
  }

  .link-button {
    padding: 0;
    border: none;
    background: none;
    color: var(--color-secondary);
    font: inherit;
    font-size: var(--font-size-sm);
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
  }

  .retry {
    align-self: flex-start;
  }

  .other-kind {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
  }

  @media (max-width: 480px) {
    .partner {
      padding: 100px 16px 64px;
    }

    .card {
      padding: 22px 18px;
    }
  }
</style>
