<script lang="ts">
  type Currency = 'USD' | 'CUP';
  type Period = 'monthly' | 'annual';

  interface PriceData {
    monthly: { USD: number; CUP: number };
    annual: { USD: number; CUP: number };
  }

  const prices: PriceData = {
    monthly: { USD: 14.99, CUP: 3750 },
    annual: { USD: 99.99, CUP: 25000 }
  };

  const originalPrices: PriceData = {
    monthly: { USD: 14.99, CUP: 3750 },
    annual: { USD: 179.88, CUP: 45000 }
  };

  let currency = $state<Currency>('USD');
  let period = $state<Period>('annual');

  let currentPrice = $derived(prices[period][currency]);
  let originalPrice = $derived(originalPrices[period][currency]);
  let savings = $derived(period === 'annual' ? Math.round((1 - prices.annual[currency] / originalPrices.annual[currency]) * 100) : 0);
  let monthlyEquivalent = $derived(period === 'annual' ? (prices.annual[currency] / 12) : prices.monthly[currency]);

  function formatPrice(price: number, curr: Currency): string {
    if (curr === 'USD') {
      return `$${price.toFixed(2)}`;
    }
    return `${price.toLocaleString('es-CU')} CUP`;
  }

  function formatPriceShort(price: number, curr: Currency): string {
    if (curr === 'USD') {
      return `$${price.toFixed(2)}`;
    }
    return `${Math.round(price).toLocaleString('es-CU')}`;
  }

  const features = [
    {
      title: 'IA Mas Inteligente',
      description: 'Modelo avanzado con respuestas mas precisas y contextuales',
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M12 17.5c-1.5 0-2.5.5-2.5.5v.5h5v-.5s-1-.5-2.5-.5"/></svg>`
    },
    {
      title: 'Compra Asistida',
      description: 'La IA completa pedidos por ti y sugiere las mejores opciones',
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`
    },
    {
      title: 'Mensajeria con Ahorro',
      description: 'Gratis en rango local, descuentos en mensajeria a distancia',
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
    },
    {
      title: 'Cashback Exclusivo',
      description: 'Recibe hasta 5% de cada compra de vuelta a tu balance',
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
    },
    {
      title: 'Soporte Prioritario',
      description: 'Atencion preferente 24/7 por chat y llamada',
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"/></svg>`
    },
    {
      title: 'Ofertas Exclusivas',
      description: 'Acceso anticipado a promociones y descuentos especiales',
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/></svg>`
    }
  ];
</script>

<section class="pricing" id="planes">
  <div class="container">
    <!-- Section Header -->
    <div class="section-header">
      <span class="section-eyebrow">Planes y Precios</span>
      <h2 class="section-title">
        Un plan. Todo incluido.
      </h2>
      <p class="section-subtitle">
        Empieza tu prueba gratis de 7 dias. Sin compromisos. Cancela cuando quieras.
      </p>
    </div>

    <!-- Toggle Controls -->
    <div class="toggle-controls">
      <!-- Currency Toggle -->
      <div class="toggle-group">
        <span class="toggle-label" class:active={currency === 'USD'}>USD</span>
        <button
          class="toggle-switch"
          onclick={() => currency = currency === 'USD' ? 'CUP' : 'USD'}
          aria-label="Cambiar moneda"
        >
          <span class="toggle-thumb" class:right={currency === 'CUP'}></span>
        </button>
        <span class="toggle-label" class:active={currency === 'CUP'}>CUP</span>
      </div>

      <div class="toggle-divider"></div>

      <!-- Period Toggle -->
      <div class="toggle-group">
        <span class="toggle-label" class:active={period === 'monthly'}>Mensual</span>
        <button
          class="toggle-switch"
          onclick={() => period = period === 'monthly' ? 'annual' : 'monthly'}
          aria-label="Cambiar periodo"
        >
          <span class="toggle-thumb" class:right={period === 'annual'}></span>
        </button>
        <span class="toggle-label" class:active={period === 'annual'}>
          Anual
          {#if period !== 'annual'}
            <span class="savings-hint">-{savings}%</span>
          {/if}
        </span>
      </div>
    </div>

    <!-- Pricing Card -->
    <div class="pricing-card">
      <div class="card-glow"></div>

      <div class="card-content">
        <!-- Price Display -->
        <div class="price-section">
          <div class="price-header">
            <div class="plan-badge">
              <span class="badge-icon">+</span>
              <span>Llego+</span>
            </div>

            {#if period === 'annual' && savings > 0}
              <div class="savings-badge">
                Ahorra {savings}%
              </div>
            {/if}
          </div>

          <div class="price-display">
            <span class="price-amount">{formatPrice(currentPrice, currency)}</span>
            <span class="price-period">/{period === 'annual' ? 'ano' : 'mes'}</span>
          </div>

          {#if period === 'annual'}
            <div class="price-details">
              <span class="price-original">{formatPrice(originalPrice, currency)}</span>
              <span class="price-equivalent">
                Solo {formatPriceShort(monthlyEquivalent, currency)}{currency === 'CUP' ? ' CUP' : ''}/mes
              </span>
            </div>
          {/if}

          <p class="price-trial">
            Prueba gratis por 7 dias
          </p>
        </div>

        <!-- CTA Button -->
        <button class="cta-button">
          <span>Empezar prueba gratis</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>

        <!-- Features Grid -->
        <div class="features-section">
          <h3 class="features-title">Todo lo que incluye:</h3>

          <div class="features-grid">
            {#each features as feature}
              <div class="feature-item">
                <div class="feature-icon">
                  {@html feature.icon}
                </div>
                <div class="feature-content">
                  <h4 class="feature-name">{feature.title}</h4>
                  <p class="feature-description">{feature.description}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- Trust Indicators -->
    <div class="trust-section">
      <div class="trust-item">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
        <span>Pagos 100% seguros</span>
      </div>
      <div class="trust-item">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        <span>Cancela en cualquier momento</span>
      </div>
      <div class="trust-item">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span>Garantia de satisfaccion</span>
      </div>
    </div>

    <!-- Social Proof -->
    <div class="social-proof">
      <div class="avatars">
        <div class="avatar" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">M</div>
        <div class="avatar" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">A</div>
        <div class="avatar" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">L</div>
        <div class="avatar" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">C</div>
        <div class="avatar" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">R</div>
      </div>
      <p class="proof-text">
        <strong>+2,500</strong> personas ya disfrutan de Llego+
      </p>
    </div>
  </div>
</section>

<style>
  .pricing {
    padding: var(--spacing-4xl) 0;
    background: linear-gradient(180deg, #000 0%, #0a0a0a 50%, #000 100%);
    position: relative;
    overflow: hidden;
  }

  .pricing::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 800px;
    height: 400px;
    background: radial-gradient(ellipse at center, rgba(225, 199, 142, 0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);
    position: relative;
  }

  /* Section Header */
  .section-header {
    text-align: center;
    margin-bottom: var(--spacing-3xl);
  }

  .section-eyebrow {
    display: inline-block;
    padding: var(--spacing-xs) var(--spacing-md);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--color-secondary);
    font-size: var(--font-size-sm);
    font-weight: 500;
    border-radius: var(--radius-full);
    margin-bottom: var(--spacing-lg);
    letter-spacing: 0.05em;
  }

  .section-title {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    color: var(--color-text);
    letter-spacing: -0.03em;
    margin-bottom: var(--spacing-md);
  }

  .section-subtitle {
    font-size: var(--font-size-lg);
    color: var(--color-text-variant);
    max-width: 480px;
    margin: 0 auto;
  }

  /* Toggle Controls */
  .toggle-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-3xl);
    flex-wrap: wrap;
  }

  .toggle-group {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .toggle-label {
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text-variant);
    transition: color var(--transition-fast);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .toggle-label.active {
    color: var(--color-text);
  }

  .savings-hint {
    padding: 2px 6px;
    background: var(--color-accent);
    color: var(--color-primary);
    font-size: 10px;
    font-weight: 700;
    border-radius: var(--radius-sm);
  }

  .toggle-switch {
    width: 44px;
    height: 24px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-full);
    position: relative;
    cursor: pointer;
    transition: background var(--transition-fast);
  }

  .toggle-switch:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: var(--color-secondary);
    border-radius: 50%;
    transition: transform var(--transition-base);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .toggle-thumb.right {
    transform: translateX(20px);
  }

  .toggle-divider {
    width: 1px;
    height: 24px;
    background: rgba(255, 255, 255, 0.1);
  }

  /* Pricing Card */
  .pricing-card {
    position: relative;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-2xl);
    overflow: hidden;
  }

  .card-glow {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--color-secondary), transparent);
  }

  .card-content {
    padding: var(--spacing-3xl);
  }

  /* Price Section */
  .price-section {
    text-align: center;
    padding-bottom: var(--spacing-2xl);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: var(--spacing-2xl);
  }

  .price-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
  }

  .plan-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-md);
    background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent) 100%);
    color: var(--color-primary);
    font-weight: 600;
    font-size: var(--font-size-sm);
    border-radius: var(--radius-full);
  }

  .badge-icon {
    font-weight: 700;
  }

  .savings-badge {
    padding: var(--spacing-xs) var(--spacing-sm);
    background: rgba(178, 214, 154, 0.15);
    color: var(--color-accent);
    font-size: var(--font-size-xs);
    font-weight: 600;
    border-radius: var(--radius-sm);
    border: 1px solid rgba(178, 214, 154, 0.3);
  }

  .price-display {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-sm);
  }

  .price-amount {
    font-size: clamp(3rem, 10vw, 4.5rem);
    font-weight: 700;
    color: var(--color-text);
    letter-spacing: -0.03em;
    line-height: 1;
  }

  .price-period {
    font-size: var(--font-size-lg);
    color: var(--color-text-variant);
  }

  .price-details {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .price-original {
    font-size: var(--font-size-base);
    color: var(--color-text-variant);
    text-decoration: line-through;
    opacity: 0.6;
  }

  .price-equivalent {
    font-size: var(--font-size-sm);
    color: var(--color-accent);
    font-weight: 500;
  }

  .price-trial {
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
  }

  /* CTA Button */
  .cta-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg) var(--spacing-2xl);
    background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent) 100%);
    color: var(--color-primary);
    font-weight: 600;
    font-size: var(--font-size-lg);
    border-radius: var(--radius-lg);
    transition: all var(--transition-base);
    box-shadow: 0 4px 20px rgba(225, 199, 142, 0.3);
    margin-bottom: var(--spacing-2xl);
  }

  .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(225, 199, 142, 0.4);
  }

  .cta-button svg {
    transition: transform var(--transition-fast);
  }

  .cta-button:hover svg {
    transform: translateX(4px);
  }

  /* Features Section */
  .features-section {
    text-align: left;
  }

  .features-title {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text-variant);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: var(--spacing-xl);
  }

  .features-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  .feature-item {
    display: flex;
    gap: var(--spacing-md);
  }

  .feature-icon {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-secondary);
  }

  .feature-content {
    flex: 1;
    min-width: 0;
  }

  .feature-name {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: var(--spacing-xs);
  }

  .feature-description {
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
    line-height: 1.5;
  }

  /* Trust Section */
  .trust-section {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--spacing-xl);
    margin-top: var(--spacing-3xl);
    padding-top: var(--spacing-2xl);
  }

  .trust-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
  }

  .trust-item svg {
    color: var(--color-button);
  }

  /* Social Proof */
  .social-proof {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    margin-top: var(--spacing-3xl);
  }

  .avatars {
    display: flex;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid #000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: white;
    margin-left: -8px;
  }

  .avatar:first-child {
    margin-left: 0;
  }

  .proof-text {
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
  }

  .proof-text strong {
    color: var(--color-text);
  }

  /* Responsive */
  @media (min-width: 640px) {
    .features-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 768px) {
    .card-content {
      padding: var(--spacing-4xl);
    }

    .features-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-xl);
    }

    .feature-item {
      flex-direction: column;
      text-align: center;
    }

    .feature-icon {
      margin: 0 auto var(--spacing-md);
    }
  }

  @media (max-width: 480px) {
    .toggle-controls {
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .toggle-divider {
      width: 40px;
      height: 1px;
    }
  }
</style>
