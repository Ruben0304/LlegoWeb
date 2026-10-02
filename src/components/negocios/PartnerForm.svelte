<script lang="ts">
  /**
   * Formulario de solicitud del registro de socios. Valida en el navegador con
   * la misma regla de teléfono que el backend (lib/partner/phone.ts) para avisar
   * antes de enviar; el backend vuelve a validar y su mensaje se muestra tal cual.
   */
  import {
    PHONE_HINT,
    formatPhone,
    normalizePhone,
    type PartnerRequestKind,
    type SubmitPartnerRequestInput,
  } from "@/lib/partner";

  type Props = {
    kind: PartnerRequestKind;
    initialName?: string;
    submitting: boolean;
    serverError: string;
    onsubmit: (input: SubmitPartnerRequestInput) => void;
  };

  let { kind, initialName = "", submitting, serverError, onsubmit }: Props = $props();

  const MAX_NAME = 120;
  const MAX_BUSINESS = 120;
  const MAX_MUNICIPALITY = 80;
  const MAX_NOTES = 1000;

  // Municipios de La Habana como sugerencia (se puede escribir cualquier otro).
  const HAVANA_MUNICIPALITIES = [
    "Arroyo Naranjo",
    "Boyeros",
    "Centro Habana",
    "Cerro",
    "Cotorro",
    "Diez de Octubre",
    "Guanabacoa",
    "La Habana del Este",
    "La Habana Vieja",
    "La Lisa",
    "Marianao",
    "Playa",
    "Plaza de la Revolución",
    "Regla",
    "San Miguel del Padrón",
  ];

  let fullName = $state(initialName);
  let phone = $state("");
  let businessName = $state("");
  let municipality = $state("");
  let notes = $state("");
  let attempted = $state(false);

  const isBusiness = $derived(kind === "BUSINESS");
  const normalizedPhone = $derived(normalizePhone(phone));

  const errors = $derived.by(() => {
    const result: Record<string, string> = {};
    const name = fullName.trim();
    if (name.length < 2) result.fullName = "Escribe tu nombre completo.";
    else if (name.length > MAX_NAME) result.fullName = `Máximo ${MAX_NAME} caracteres.`;

    if (!phone.trim()) result.phone = "El teléfono es obligatorio: te llamaremos a ese número.";
    else if (!normalizedPhone) result.phone = `Revisa el teléfono. ${PHONE_HINT}`;

    if (isBusiness) {
      const business = businessName.trim();
      if (!business) result.businessName = "Escribe el nombre de tu negocio.";
      else if (business.length > MAX_BUSINESS) result.businessName = `Máximo ${MAX_BUSINESS} caracteres.`;
    }

    const place = municipality.trim();
    if (!place) result.municipality = isBusiness ? "¿En qué municipio está tu negocio?" : "¿En qué municipio quieres repartir?";
    else if (place.length > MAX_MUNICIPALITY) result.municipality = `Máximo ${MAX_MUNICIPALITY} caracteres.`;

    if (notes.trim().length > MAX_NOTES) result.notes = `Máximo ${MAX_NOTES} caracteres.`;
    return result;
  });

  const hasErrors = $derived(Object.keys(errors).length > 0);

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    attempted = true;
    if (hasErrors || submitting) return;
    onsubmit({
      type: kind,
      fullName: fullName.trim(),
      phone: phone.trim(),
      businessName: isBusiness ? businessName.trim() : null,
      municipality: municipality.trim(),
      notes: notes.trim() || null,
    });
  }
</script>

<form class="partner-form" onsubmit={handleSubmit} novalidate>
  <div class="field">
    <label for="partner-name">Nombre completo</label>
    <input
      id="partner-name"
      type="text"
      autocomplete="name"
      maxlength={MAX_NAME}
      bind:value={fullName}
      aria-invalid={attempted && !!errors.fullName}
      aria-describedby="partner-name-error"
    />
    {#if attempted && errors.fullName}
      <p class="field-error" id="partner-name-error">{errors.fullName}</p>
    {/if}
  </div>

  <div class="field">
    <label for="partner-phone">Teléfono</label>
    <input
      id="partner-phone"
      type="tel"
      inputmode="tel"
      autocomplete="tel"
      placeholder="5XXXXXXX"
      bind:value={phone}
      aria-invalid={attempted && !!errors.phone}
      aria-describedby="partner-phone-help"
    />
    {#if attempted && errors.phone}
      <p class="field-error" id="partner-phone-help">{errors.phone}</p>
    {:else if normalizedPhone}
      <p class="field-help" id="partner-phone-help">Te llamaremos al {formatPhone(normalizedPhone)}.</p>
    {:else}
      <p class="field-help" id="partner-phone-help">{PHONE_HINT}</p>
    {/if}
  </div>

  {#if isBusiness}
    <div class="field">
      <label for="partner-business">Nombre del negocio</label>
      <input
        id="partner-business"
        type="text"
        autocomplete="organization"
        maxlength={MAX_BUSINESS}
        bind:value={businessName}
        aria-invalid={attempted && !!errors.businessName}
        aria-describedby="partner-business-error"
      />
      {#if attempted && errors.businessName}
        <p class="field-error" id="partner-business-error">{errors.businessName}</p>
      {/if}
    </div>
  {/if}

  <div class="field">
    <label for="partner-municipality">
      {isBusiness ? "Municipio del negocio" : "Municipio donde quieres repartir"}
    </label>
    <input
      id="partner-municipality"
      type="text"
      list="partner-municipalities"
      autocomplete="address-level2"
      maxlength={MAX_MUNICIPALITY}
      placeholder="Ej. Plaza de la Revolución"
      bind:value={municipality}
      aria-invalid={attempted && !!errors.municipality}
      aria-describedby="partner-municipality-error"
    />
    <datalist id="partner-municipalities">
      {#each HAVANA_MUNICIPALITIES as name (name)}
        <option value={name}></option>
      {/each}
    </datalist>
    {#if attempted && errors.municipality}
      <p class="field-error" id="partner-municipality-error">{errors.municipality}</p>
    {/if}
  </div>

  <div class="field">
    <label for="partner-notes">Notas <span class="optional">(opcional)</span></label>
    <textarea
      id="partner-notes"
      rows="3"
      maxlength={MAX_NOTES}
      placeholder={isBusiness
        ? "¿Qué vendes? ¿Haces entregas ya? Lo que quieras contarnos."
        : "¿Tienes bicicleta, moto u otro vehículo? ¿En qué horario puedes repartir?"}
      bind:value={notes}
      aria-describedby="partner-notes-error"
    ></textarea>
    {#if attempted && errors.notes}
      <p class="field-error" id="partner-notes-error">{errors.notes}</p>
    {/if}
  </div>

  {#if serverError}
    <p class="form-error" role="alert">{serverError}</p>
  {/if}

  <button type="submit" class="btn btn-primary" disabled={submitting}>
    {submitting ? "Enviando..." : "Enviar solicitud"}
  </button>
</form>

<style>
  .partner-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  label {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text);
  }

  .optional {
    font-weight: 400;
    color: var(--color-text-variant);
  }

  input,
  textarea {
    width: 100%;
    padding: 12px 14px;
    border-radius: var(--radius-md);
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.04);
    color: var(--color-text);
    font: inherit;
    font-size: var(--font-size-base);
    transition: border-color var(--transition-fast), background var(--transition-fast);
  }

  textarea {
    resize: vertical;
    min-height: 88px;
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: var(--color-secondary);
    background: rgba(255, 255, 255, 0.07);
  }

  input[aria-invalid="true"] {
    border-color: rgba(255, 107, 107, 0.7);
  }

  .field-help,
  .field-error {
    font-size: var(--font-size-xs);
    line-height: 1.5;
  }

  .field-help {
    color: var(--color-text-variant);
  }

  .field-error {
    color: #ff8a8a;
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

  .btn {
    padding: 14px 28px;
    border: none;
    border-radius: 10px;
    font: inherit;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--color-secondary), var(--color-accent));
    color: var(--color-primary);
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(225, 199, 142, 0.3);
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: wait;
  }
</style>
