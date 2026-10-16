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
    { choice: string; detail: string; noun: string; app: PartnerApp; points: string[] }
  > = {
    BUSINESS: {
      choice: "Quiero vender en Llegó",
      detail: "Registra tu negocio y recibe pedidos de clientes cerca de ti.",
      noun: "vender en Llegó",
      app: PARTNER_APPS.business,
      points: ["Pedidos, catálogo y finanzas", "Combos y banners de promoción"],
    },
    COURIER: {
      choice: "Quiero ser mensajero",
      detail: "Reparte pedidos en tu zona y gana dinero con cada entrega.",
      noun: "ser mensajero",
      app: PARTNER_APPS.courier,
      points: ["Pedidos cerca de ti", "Entregas rápidas y seguras"],
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
  <header class="partner-band">
    <div class="band-inner">
      <div class="band-copy">
        <h1 class="title print display">
          <span class="print-line">Súmate</span>
          <span class="print-line">a Llegó</span>
        </h1>
        <p class="subtitle">
          Vende en Llegó o reparte pedidos en tu zona. Envía tu solicitud y te llamaremos para conocerte.
        </p>
      </div>
      <img class="band-box" src="/img/logo-caja-720.webp" width="720" height="472" alt="" decoding="async" />
    </div>
  </header>

  <div class="partner-inner" class:wide={view === "choose"}>

    {#if session && view !== "choose"}
      <div class="session-bar">
        <span>Sesión iniciada{userLabel ? ` como ${userLabel}` : ""}</span>
        <button type="button" class="link-button" onclick={() => signOut()}>Cerrar sesión</button>
      </div>
    {/if}

    {#if view === "choose"}
      <div class="choices">
        {#each OPTIONS as option (option)}
          <button type="button" class={["choice", option === "BUSINESS" ? "choice--business" : "choice--courier"]} onclick={() => chooseKind(option)}>
            <svg class="choice-art" viewBox="0 0 120 100" aria-hidden="true">
              {#if option === "BUSINESS"}
                <!-- tienda con toldo, a dos tintas -->
                <g class="ink-a">
                  <rect x="18" y="40" width="84" height="54" />
                  <path d="M10 40 20 14h80l10 26z" />
                </g>
                <g class="ink-b">
                  <path d="M10 40h20v6a10 10 0 0 1-20 0zM50 40h20v6a10 10 0 0 1-20 0zM90 40h20v6a10 10 0 0 1-20 0z" />
                  <rect x="30" y="58" width="22" height="36" />
                  <rect x="62" y="58" width="28" height="20" />
                </g>
              {:else}
                <!-- moto de reparto con la caja -->
                <g class="ink-a">
                  <circle cx="26" cy="74" r="18" />
                  <circle cx="94" cy="74" r="18" />
                  <rect x="12" y="24" width="34" height="26" />
                </g>
                <g class="ink-b">
                  <path class="line" d="M26 74 46 50h34l14 24M74 50l-6-22h12" />
                  <circle cx="26" cy="74" r="7" />
                  <circle cx="94" cy="74" r="7" />
                </g>
              {/if}
            </svg>
            <span class="choice-title">{KIND_COPY[option].choice}</span>
            <span class="choice-detail">{KIND_COPY[option].detail}</span>
            <span class="choice-points">
              {#each KIND_COPY[option].points as point}
                <span>{point}</span>
              {/each}
            </span>
            <span class="choice-go">
              Empezar
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
          </button>
        {/each}
      </div>
    {:else if copy}
      <div class={["card", kind === "BUSINESS" ? "card--business" : "card--courier"]}>
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
    padding: 0 0 96px;
    background: var(--color-background);
  }

  /* Cabecera: un cartel verde (la tinta de los socios) con la caja */
  .partner-band {
    background: var(--ink-green);
    color: var(--ink);
    padding: calc(68px + clamp(32px, 6vw, 64px)) var(--gutter) clamp(40px, 6vw, 64px);
    margin-bottom: clamp(32px, 5vw, 56px);
    overflow: hidden;
  }

  .band-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: grid;
    gap: 24px;
    align-items: end;
  }

  .title {
    font-size: clamp(64px, 13vw, 144px);
    font-weight: 900;
    color: var(--ink);
    margin-bottom: 18px;
    --print-under: var(--ink-sun);
  }

  .title .print-line {
    display: block;
  }

  .title .print-line + .print-line {
    padding-top: 0.1em;
  }

  .subtitle {
    max-width: 40ch;
    font-size: 19px;
    font-weight: 500;
    line-height: 1.55;
    color: var(--ink);
  }

  .band-box {
    width: clamp(180px, 34vw, 380px);
    height: auto;
    justify-self: end;
    transform: rotate(-8deg);
    filter: drop-shadow(8px 10px 0 rgba(2, 49, 51, 0.22));
  }

  .partner-inner {
    max-width: 680px;
    margin: 0 auto;
    padding: 0 var(--gutter);
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .partner-inner.wide {
    max-width: 1100px;
  }

  @media (min-width: 900px) {
    .band-inner {
      grid-template-columns: 1.4fr 1fr;
    }
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
    grid-template-columns: 1fr;
    gap: 20px;
  }

  /* Cada opción es un cartel entero que se puede pulsar */
  .choice {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    min-height: 360px;
    padding: 28px 26px 26px;
    text-align: left;
    border: 0;
    border-radius: 0;
    font: inherit;
    cursor: pointer;
    transition: transform 0.3s var(--ease-out);
  }

  .choice--business {
    background: var(--ink-teal);
    color: var(--paper);
    --art-a: var(--ink-sun);
    --art-b: var(--ink-teal-dark);
  }

  .choice--courier {
    background: var(--ink-orange);
    color: var(--ink);
    --art-a: var(--ink-cream);
    --art-b: var(--ink-teal);
  }

  .choice:hover,
  .choice:focus-visible {
    transform: translateY(-4px) rotate(-0.6deg);
  }

  .choice-art {
    width: 132px;
    height: auto;
    margin-bottom: 8px;
    overflow: visible;
  }

  .choice-art .ink-a {
    fill: var(--art-a);
  }

  .choice-art .ink-b {
    fill: var(--art-b);
    stroke: var(--art-b);
    stroke-width: 0;
    transform: translate(4px, 3px);
    mix-blend-mode: multiply;
  }

  .choice-art .line {
    fill: none;
    stroke-width: 8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .choice-title {
    font-family: var(--font-display);
    font-size: clamp(36px, 5vw, 52px);
    font-weight: 900;
    text-transform: uppercase;
    line-height: 0.95;
  }

  .choice--business .choice-title {
    color: var(--ink-sun);
  }

  .choice-detail {
    max-width: 34ch;
    font-size: 17px;
    font-weight: 500;
    line-height: 1.5;
  }

  .choice-points {
    display: grid;
    gap: 6px;
  }

  .choice-points span {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .choice-points span::before {
    content: "";
    width: 18px;
    height: 8px;
    border-radius: 0 999px 999px 0;
    background: currentColor;
  }

  .choice-go {
    margin-top: auto;
    padding-top: 18px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 800;
    text-transform: uppercase;
    text-decoration: underline;
    text-decoration-thickness: 3px;
    text-underline-offset: 6px;
  }

  .choice-go svg {
    transition: transform 0.3s var(--ease-out);
  }

  .choice:hover .choice-go svg {
    transform: translateX(6px);
  }

  @media (min-width: 900px) {
    .choices {
      grid-template-columns: 1fr 1fr;
      gap: 28px;
      align-items: start;
    }

    .choice--courier {
      margin-top: 48px;
    }
  }

  /* La solicitud: una hoja de papel con la franja de tinta de su tipo */
  .card {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 0 24px 28px;
    border-radius: 0;
    border: 2px solid var(--ink);
    background: #fffdf7;
  }

  .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 0 -24px 8px;
    padding: 12px 24px;
  }

  .card--business .card-top {
    background: var(--ink-teal);
    color: var(--paper);
  }

  .card--courier .card-top {
    background: var(--ink-orange);
    color: var(--ink);
  }

  .step-label {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .card-top .link-button {
    color: inherit;
  }

  .card-title {
    font-family: var(--font-display);
    font-size: 34px;
    font-weight: 800;
    text-transform: uppercase;
    line-height: 1;
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
    color: var(--ink-teal);
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
    border: none;
    background: #000;
    color: #fff;
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
    border: 3px solid var(--ink-line);
    border-top-color: var(--ink-teal);
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
    background: var(--ink-sun);
    color: var(--ink);
  }

  .status-approved {
    background: var(--ink-green);
    color: var(--ink);
  }

  .status-rejected {
    background: rgba(200, 60, 40, 0.12);
    color: #a3301c;
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
    min-height: 44px;
    padding: 12px 24px;
    border-radius: 6px;
    border: none;
    font: inherit;
    font-weight: 600;
    font-size: 15px;
    text-align: center;
    cursor: pointer;
  }

  .btn-primary {
    background: var(--ink);
    color: var(--paper);
    transition: background-color var(--transition-fast);
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--ink-teal);
  }

  .btn-secondary {
    background: transparent;
    border: 2px solid var(--ink);
    color: var(--color-text);
    align-self: flex-start;
  }

  .form-error {
    padding: 12px 14px;
    border-radius: var(--radius-md);
    background: rgba(200, 60, 40, 0.1);
    border: 2px solid rgba(163, 48, 28, 0.55);
    color: #a3301c;
    font-size: var(--font-size-sm);
    line-height: 1.5;
  }

  .link-button {
    padding: 10px 0;
    border: none;
    background: none;
    color: var(--ink-teal);
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
    .card {
      padding: 0 18px 22px;
    }

    .card-top {
      margin: 0 -18px 8px;
      padding: 12px 18px;
    }
  }
</style>
