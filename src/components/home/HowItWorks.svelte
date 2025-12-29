<script lang="ts">
  import { onMount } from 'svelte';

  interface Step {
    number: string;
    title: string;
    description: string;
    icon: string;
    color: string;
  }

  const steps: Step[] = [
    {
      number: '01',
      title: 'Elige una categoría',
      description: 'Navega con un carrusel visual entre restaurantes, ropa, mercado y agro.',
      icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
      color: '#E1C78E'
    },
    {
      number: '02',
      title: 'Activa la búsqueda con IA',
      description: 'Mantén presionado para activar la búsqueda conversacional y dile qué buscas.',
      icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
      color: '#B2D69A'
    },
    {
      number: '03',
      title: 'Recibe y confirma',
      description: 'Obtén recomendaciones precisas y cierra tu pedido con menos pasos.',
      icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      color: '#5A8467'
    }
  ];

  let scrollY = $state(0);
  let windowHeight = $state(0);
  let sectionElement: HTMLElement;
  let sectionTop = $state(0);
  let isVisible = $state(false);

  onMount(() => {
    windowHeight = window.innerHeight;

    const updatePosition = () => {
      if (sectionElement) {
        const rect = sectionElement.getBoundingClientRect();
        sectionTop = rect.top + window.scrollY;

        // Check if section is in view
        if (rect.top < windowHeight * 0.8 && rect.bottom > 0) {
          isVisible = true;
        }
      }
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
      updatePosition();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => {
      windowHeight = window.innerHeight;
      updatePosition();
    }, { passive: true });

    setTimeout(updatePosition, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<section class="how-it-works" bind:this={sectionElement} id="como-funciona">
  <div class="section-bg">
    <div class="bg-gradient"></div>
    <div class="bg-lines"></div>
  </div>

  <div class="container">
    <!-- Header -->
    <div class="section-header" class:visible={isVisible}>
      <span class="section-eyebrow">Cómo funciona</span>
      <h2 class="section-headline">
        Comprar nunca fue<br/>
        <span class="highlight">tan fácil.</span>
      </h2>
      <p class="section-description">
        En solo 3 pasos tendrás lo que necesitas en camino.
      </p>
    </div>

    <!-- Steps -->
    <div class="steps-grid" class:visible={isVisible}>
      {#each steps as step, index}
        <div
          class="step-card"
          style="--delay: {index * 150}ms; --accent: {step.color}"
        >
          <div class="card-glow"></div>

          <div class="step-number-wrapper">
            <span class="step-number">{step.number}</span>
          </div>

          <div class="step-icon-wrapper">
            <div class="icon-bg"></div>
            <div class="icon">
              {@html step.icon}
            </div>
          </div>

          <h3 class="step-title">{step.title}</h3>
          <p class="step-description">{step.description}</p>

          {#if index < steps.length - 1}
            <div class="step-connector">
              <div class="connector-line"></div>
              <div class="connector-dot"></div>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- CTA -->
    <div class="cta-section" class:visible={isVisible}>
      <div class="cta-content">
        <p class="cta-text">¿Listo para empezar?</p>
        <a href="#descargar" class="cta-button">
          <span>Descargar ahora</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </a>
      </div>
    </div>
  </div>
</section>

<style>
  .how-it-works {
    position: relative;
    padding: 160px 0;
    background: #0a0a0a;
    overflow: hidden;
  }

  .section-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .bg-gradient {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 40% at 50% 0%, rgba(2, 49, 51, 0.3) 0%, transparent 60%),
      radial-gradient(ellipse 40% 30% at 80% 80%, rgba(225, 199, 142, 0.1) 0%, transparent 50%);
  }

  .bg-lines {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 100px 100px;
    mask-image: linear-gradient(180deg, transparent 0%, black 30%, black 70%, transparent 100%);
  }

  .container {
    position: relative;
    z-index: 2;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* Header */
  .section-header {
    text-align: center;
    margin-bottom: 80px;
    opacity: 0;
    transform: translateY(40px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .section-header.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .section-eyebrow {
    display: inline-block;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--color-secondary);
    margin-bottom: 20px;
  }

  .section-headline {
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.1;
    color: #fff;
    margin-bottom: 20px;
  }

  .highlight {
    background: linear-gradient(135deg, #E1C78E 0%, #B2D69A 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .section-description {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.5);
    max-width: 400px;
    margin: 0 auto;
  }

  /* Steps grid */
  .steps-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    margin-bottom: 80px;
  }

  .steps-grid.visible .step-card {
    opacity: 1;
    transform: translateY(0);
  }

  .step-card {
    position: relative;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 24px;
    padding: 40px 32px;
    opacity: 0;
    transform: translateY(40px);
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: var(--delay);
  }

  .step-card:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-4px);
  }

  .step-card:hover .card-glow {
    opacity: 1;
  }

  .card-glow {
    position: absolute;
    inset: -1px;
    background: linear-gradient(135deg, var(--accent), transparent 50%);
    border-radius: 24px;
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: -1;
    filter: blur(20px);
  }

  .step-number-wrapper {
    position: absolute;
    top: 24px;
    right: 24px;
  }

  .step-number {
    font-size: 48px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.06);
    letter-spacing: -0.02em;
    line-height: 1;
  }

  .step-icon-wrapper {
    position: relative;
    width: 72px;
    height: 72px;
    margin-bottom: 24px;
  }

  .icon-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--accent), rgba(255, 255, 255, 0.1));
    border-radius: 20px;
    opacity: 0.15;
  }

  .icon {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
  }

  .step-title {
    font-size: 22px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 12px;
    letter-spacing: -0.01em;
  }

  .step-description {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.6;
  }

  .step-connector {
    display: none;
  }

  /* CTA section */
  .cta-section {
    opacity: 0;
    transform: translateY(40px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: 0.4s;
  }

  .cta-section.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .cta-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 60px 40px;
    background: linear-gradient(135deg, rgba(2, 49, 51, 0.4) 0%, rgba(90, 132, 103, 0.2) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 32px;
    text-align: center;
  }

  .cta-text {
    font-size: 24px;
    font-weight: 600;
    color: #fff;
    letter-spacing: -0.02em;
  }

  .cta-button {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 18px 36px;
    background: #fff;
    color: #000;
    font-size: 16px;
    font-weight: 600;
    border-radius: 100px;
    transition: all 0.3s ease;
  }

  .cta-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .cta-button:hover svg {
    transform: translateY(2px);
  }

  .cta-button svg {
    transition: transform 0.3s ease;
  }

  /* Responsive */
  @media (min-width: 768px) {
    .steps-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 32px;
    }

    .step-card {
      text-align: left;
    }

    .step-connector {
      display: block;
      position: absolute;
      right: -32px;
      top: 56px;
      width: 32px;
      height: 2px;
    }

    .connector-line {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, var(--accent), transparent);
      opacity: 0.3;
    }

    .connector-dot {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 6px;
      height: 6px;
      background: var(--accent);
      border-radius: 50%;
      opacity: 0.5;
    }

    .step-card:last-child .step-connector {
      display: none;
    }

    .cta-content {
      flex-direction: row;
      justify-content: center;
      padding: 60px 80px;
    }
  }

  @media (min-width: 1024px) {
    .how-it-works {
      padding: 200px 0;
    }

    .step-card {
      padding: 48px 40px;
    }

    .steps-grid {
      gap: 48px;
    }

    .step-connector {
      right: -48px;
      width: 48px;
    }
  }
</style>
