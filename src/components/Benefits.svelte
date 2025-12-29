<script lang="ts">
  import { onMount } from 'svelte';

  interface Benefit {
    icon: string;
    title: string;
    description: string;
    highlight?: string;
  }

  const benefits: Benefit[] = [
    {
      icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M12 17.5c-1.5 0-2.5.5-2.5.5v.5h5v-.5s-1-.5-2.5-.5"/></svg>`,
      title: 'IA mas inteligente',
      description: 'Nuestro modelo avanzado entiende mejor tus necesidades. Busquedas mas precisas, recomendaciones personalizadas y respuestas contextuales.',
      highlight: 'GPT-4 Level'
    },
    {
      icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
      title: 'Compra asistida por IA',
      description: 'La IA puede completar pedidos por ti, sugerir alternativas mejores y optimizar tu carrito para maximo ahorro.',
      highlight: 'Automatico'
    },
    {
      icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      title: 'Mensajeria con ahorro',
      description: 'Mensajes gratis dentro de tu zona. Descuentos en mensajeria a distancia. Comunicate sin preocuparte por costos.',
      highlight: 'Gratis local'
    },
    {
      icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
      title: 'Cashback en cada compra',
      description: 'Recibe hasta 5% de cada compra de vuelta a tu balance. Acumula y usa tu saldo cuando quieras.',
      highlight: 'Hasta 5%'
    }
  ];

  let sectionRef: HTMLElement | null = null;
  let isVisible = $state(false);

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible = true;
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef) {
      observer.observe(sectionRef);
    }

    return () => observer.disconnect();
  });
</script>

<section class="benefits" bind:this={sectionRef}>
  <div class="container">
    <div class="section-header" class:visible={isVisible}>
      <span class="section-eyebrow">Por que Llego+</span>
      <h2 class="section-title">
        Cada beneficio pensado<br />
        <span class="title-highlight">para ti</span>
      </h2>
      <p class="section-description">
        No es solo una suscripcion. Es una experiencia de compra completamente nueva.
      </p>
    </div>

    <div class="benefits-grid">
      {#each benefits as benefit, index}
        <div
          class="benefit-card"
          class:visible={isVisible}
          style="--delay: {index * 100}ms"
        >
          <div class="card-inner">
            <div class="card-header">
              <div class="benefit-icon">
                {@html benefit.icon}
              </div>
              {#if benefit.highlight}
                <span class="benefit-highlight">{benefit.highlight}</span>
              {/if}
            </div>

            <h3 class="benefit-title">{benefit.title}</h3>
            <p class="benefit-description">{benefit.description}</p>
          </div>
        </div>
      {/each}
    </div>

    <!-- Comparison Section -->
    <div class="comparison" class:visible={isVisible}>
      <div class="comparison-header">
        <h3 class="comparison-title">Llego vs Llego+</h3>
        <p class="comparison-subtitle">Todo lo que ganas al suscribirte</p>
      </div>

      <div class="comparison-table">
        <div class="comparison-row header">
          <div class="comparison-feature">Caracteristica</div>
          <div class="comparison-free">Gratis</div>
          <div class="comparison-plus">Plus</div>
        </div>

        <div class="comparison-row">
          <div class="comparison-feature">Busqueda con IA</div>
          <div class="comparison-free">Basica</div>
          <div class="comparison-plus">
            <span class="plus-value">Avanzada</span>
          </div>
        </div>

        <div class="comparison-row">
          <div class="comparison-feature">Compra asistida</div>
          <div class="comparison-free">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          <div class="comparison-plus">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>

        <div class="comparison-row">
          <div class="comparison-feature">Mensajeria local</div>
          <div class="comparison-free">Pago</div>
          <div class="comparison-plus">
            <span class="plus-value">Gratis</span>
          </div>
        </div>

        <div class="comparison-row">
          <div class="comparison-feature">Cashback</div>
          <div class="comparison-free">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          <div class="comparison-plus">
            <span class="plus-value">Hasta 5%</span>
          </div>
        </div>

        <div class="comparison-row">
          <div class="comparison-feature">Soporte</div>
          <div class="comparison-free">Estandar</div>
          <div class="comparison-plus">
            <span class="plus-value">Prioritario</span>
          </div>
        </div>

        <div class="comparison-row">
          <div class="comparison-feature">Ofertas exclusivas</div>
          <div class="comparison-free">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          <div class="comparison-plus">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .benefits {
    padding: var(--spacing-4xl) 0;
    background: #000;
    position: relative;
    overflow: hidden;
  }

  .benefits::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 50%;
    background: radial-gradient(ellipse at center bottom, rgba(90, 132, 103, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);
    position: relative;
  }

  /* Section Header */
  .section-header {
    text-align: center;
    margin-bottom: var(--spacing-4xl);
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .section-header.visible {
    opacity: 1;
    transform: translateY(0);
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
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700;
    color: var(--color-text);
    letter-spacing: -0.03em;
    line-height: 1.1;
    margin-bottom: var(--spacing-lg);
  }

  .title-highlight {
    background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .section-description {
    font-size: var(--font-size-lg);
    color: var(--color-text-variant);
    max-width: 540px;
    margin: 0 auto;
  }

  /* Benefits Grid */
  .benefits-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-4xl);
  }

  .benefit-card {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: var(--delay);
  }

  .benefit-card.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .card-inner {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-xl);
    padding: var(--spacing-2xl);
    height: 100%;
    transition: all var(--transition-base);
  }

  .card-inner:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-4px);
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: var(--spacing-lg);
  }

  .benefit-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, rgba(225, 199, 142, 0.15) 0%, rgba(178, 214, 154, 0.15) 100%);
    border: 1px solid rgba(225, 199, 142, 0.2);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-secondary);
  }

  .benefit-highlight {
    padding: var(--spacing-xs) var(--spacing-sm);
    background: rgba(178, 214, 154, 0.15);
    color: var(--color-accent);
    font-size: var(--font-size-xs);
    font-weight: 600;
    border-radius: var(--radius-sm);
    border: 1px solid rgba(178, 214, 154, 0.2);
  }

  .benefit-title {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: var(--spacing-sm);
    letter-spacing: -0.01em;
  }

  .benefit-description {
    font-size: var(--font-size-base);
    color: var(--color-text-variant);
    line-height: 1.6;
  }

  /* Comparison Section */
  .comparison {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s;
  }

  .comparison.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .comparison-header {
    text-align: center;
    margin-bottom: var(--spacing-2xl);
  }

  .comparison-title {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: var(--spacing-sm);
  }

  .comparison-subtitle {
    font-size: var(--font-size-base);
    color: var(--color-text-variant);
  }

  .comparison-table {
    max-width: 600px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-xl);
    overflow: hidden;
  }

  .comparison-row {
    display: grid;
    grid-template-columns: 1fr 80px 80px;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    align-items: center;
  }

  .comparison-row:last-child {
    border-bottom: none;
  }

  .comparison-row.header {
    background: rgba(255, 255, 255, 0.03);
    font-weight: 600;
    font-size: var(--font-size-sm);
    color: var(--color-text-variant);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .comparison-feature {
    font-size: var(--font-size-sm);
    color: var(--color-text);
  }

  .comparison-free,
  .comparison-plus {
    text-align: center;
    font-size: var(--font-size-sm);
  }

  .comparison-free {
    color: var(--color-text-variant);
  }

  .comparison-free svg {
    color: rgba(255, 255, 255, 0.3);
  }

  .comparison-plus {
    color: var(--color-accent);
  }

  .comparison-plus svg {
    color: var(--color-accent);
  }

  .plus-value {
    font-weight: 600;
  }

  /* Responsive */
  @media (min-width: 640px) {
    .benefits-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .comparison-row {
      grid-template-columns: 1fr 100px 100px;
    }
  }

  @media (min-width: 1024px) {
    .benefits-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>
