<script lang="ts">
  type Currency = 'USD' | 'CUP';
  type Period = 'monthly' | 'annual';

  const prices = {
    monthly: { USD: 15, CUP: 3750 },
    annual: { USD: 100, CUP: 25000 }
  };

  let currency = $state<Currency>('USD');
  let period = $state<Period>('annual');

  let currentPrice = $derived(prices[period][currency]);

  function formatPrice(price: number, curr: Currency): string {
    if (curr === 'USD') return `$${price}`;
    return `${price.toLocaleString('es-CU')}`;
  }
</script>

<section class="hero">
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="badge">
        Llegó+
      </div>
      <h1 class="title">Compra mas inteligente</h1>
      <p class="subtitle">IA avanzada y beneficios exclusivos</p>
    </div>

    <!-- Main Content -->
    <div class="content">
      <!-- Pricing Card -->
      <div class="pricing-card">
        <!-- Toggles -->
        <div class="toggles">
          <div class="toggle-group">
            <button class="toggle-btn" class:active={currency === 'USD'} onclick={() => currency = 'USD'}>USD</button>
            <button class="toggle-btn" class:active={currency === 'CUP'} onclick={() => currency = 'CUP'}>CUP</button>
          </div>
          <div class="toggle-group">
            <button class="toggle-btn" class:active={period === 'monthly'} onclick={() => period = 'monthly'}>Mes</button>
            <button class="toggle-btn" class:active={period === 'annual'} onclick={() => period = 'annual'}>
              Ano <span class="save">-44%</span>
            </button>
          </div>
        </div>

        <!-- Price -->
        <div class="price">
          <span class="amount">{formatPrice(currentPrice, currency)}</span>
          <span class="unit">{currency === 'CUP' ? ' CUP' : ''}/{period === 'annual' ? 'ano' : 'mes'}</span>
        </div>

        <!-- CTA -->
        <button class="cta">Probar gratis 7 dias</button>
        <p class="note">Cancela cuando quieras</p>
      </div>

      <!-- Comparison Table -->
      <div class="comparison">
        <div class="comparison-header">
          <span></span>
          <span>Gratis</span>
          <span class="plus-header">Plus</span>
        </div>

        <div class="comparison-row">
          <span>IA para buscar</span>
          <span class="check dim">Basica</span>
          <span class="check plus">Avanzada</span>
        </div>

        <div class="comparison-row">
          <span>Compra asistida</span>
          <span class="x">✕</span>
          <span class="check plus">✓</span>
        </div>

        <div class="comparison-row">
          <span>Mensajeria local</span>
          <span class="check dim">Pago</span>
          <span class="check plus">Gratis</span>
        </div>

        <div class="comparison-row">
          <span>Cashback</span>
          <span class="x">✕</span>
          <span class="check plus">5%</span>
        </div>

        <div class="comparison-row">
          <span>Soporte</span>
          <span class="check dim">Normal</span>
          <span class="check plus">Prioritario</span>
        </div>
      </div>
    </div>

    <!-- Trust -->
    <p class="trust">+2,500 suscriptores · Pagos seguros</p>
  </div>
</section>

<style>
  .hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 100px 20px 60px;
    background: #000;
  }

  .container {
    max-width: 480px;
    width: 100%;
  }

  /* Header */
  .header {
    text-align: center;
    margin-bottom: 32px;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    background: linear-gradient(135deg, var(--color-secondary), var(--color-accent));
    color: var(--color-primary);
    font-weight: 600;
    font-size: 13px;
    border-radius: 20px;
    margin-bottom: 16px;
  }

  .title {
    font-size: 32px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 16px;
    color: rgba(255,255,255,0.5);
  }

  /* Content */
  .content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Pricing Card */
  .pricing-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 24px;
  }

  .toggles {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
  }

  .toggle-group {
    flex: 1;
    display: flex;
    background: rgba(255,255,255,0.05);
    border-radius: 8px;
    padding: 3px;
  }

  .toggle-btn {
    flex: 1;
    padding: 8px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.4);
    border-radius: 6px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .toggle-btn.active {
    background: rgba(255,255,255,0.1);
    color: #fff;
  }

  .save {
    font-size: 10px;
    padding: 2px 4px;
    background: var(--color-accent);
    color: #000;
    border-radius: 3px;
    font-weight: 700;
  }

  .price {
    text-align: center;
    margin-bottom: 20px;
  }

  .amount {
    font-size: 48px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
  }

  .unit {
    font-size: 16px;
    color: rgba(255,255,255,0.5);
  }

  .cta {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, var(--color-secondary), var(--color-accent));
    color: var(--color-primary);
    font-weight: 600;
    font-size: 15px;
    border-radius: 10px;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(225,199,142,0.3);
  }

  .note {
    text-align: center;
    font-size: 12px;
    color: rgba(255,255,255,0.4);
    margin-top: 12px;
  }

  /* Comparison */
  .comparison {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    overflow: hidden;
  }

  .comparison-header {
    display: grid;
    grid-template-columns: 1fr 70px 70px;
    padding: 12px 16px;
    background: rgba(255,255,255,0.03);
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .plus-header {
    color: var(--color-secondary);
  }

  .comparison-row {
    display: grid;
    grid-template-columns: 1fr 70px 70px;
    padding: 12px 16px;
    border-top: 1px solid rgba(255,255,255,0.05);
    font-size: 13px;
    color: rgba(255,255,255,0.8);
  }

  .comparison-row span:not(:first-child) {
    text-align: center;
  }

  .check.dim {
    color: rgba(255,255,255,0.4);
  }

  .check.plus {
    color: var(--color-accent);
    font-weight: 500;
  }

  .x {
    color: rgba(255,255,255,0.2);
  }

  /* Trust */
  .trust {
    text-align: center;
    font-size: 13px;
    color: rgba(255,255,255,0.3);
    margin-top: 24px;
  }

  @media (max-width: 400px) {
    .toggles {
      flex-direction: column;
    }

    .title {
      font-size: 28px;
    }

    .amount {
      font-size: 40px;
    }
  }
</style>
