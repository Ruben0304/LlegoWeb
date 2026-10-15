<script lang="ts">
  interface Feature {
    id: string;
    title: string;
    description: string;
    gradient: string;
    /** Color de la categoría para el icono (el tono claro de su degradado). */
    color: string;
    /** Trazos SVG (viewBox 24x24, stroke 1.75) */
    icon: string;
  }

  const features: Feature[] = [
    {
      id: 'restaurants',
      title: 'Restaurantes',
      description: 'Descubre los mejores lugares cerca de ti',
      gradient: 'linear-gradient(135deg, #B34026 0%, #D9734D 100%)',
      color: '#D9734D',
      icon: '<path d="M7 2v9a3 3 0 0 0 3 3v8"/><path d="M4 2v6a3 3 0 0 0 3 3"/><path d="M10 2v6a3 3 0 0 1-3 3"/><path d="M17 22V2c-2.5 1.5-4 4.5-4 8v3h4"/>'
    },
    {
      id: 'clothing',
      title: 'Ropa',
      description: 'Moda y estilo para toda la familia',
      gradient: 'linear-gradient(135deg, #1A7361 0%, #66A68C 100%)',
      color: '#66A68C',
      icon: '<path d="M8 3 4 5 2 10l3 1.5V21h14v-9.5L22 10l-2-5-4-2a4 4 0 0 1-8 0z"/>'
    },
    {
      id: 'market',
      title: 'Mercado',
      description: 'Todo lo que necesitas para tu hogar',
      gradient: 'linear-gradient(135deg, #1A5973 0%, #668CA6 100%)',
      color: '#7FA6C2',
      icon: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6"/>'
    },
    {
      id: 'agro',
      title: 'Agro',
      description: 'Productos frescos directo del campo',
      gradient: 'linear-gradient(135deg, #73611A 0%, #A69966 100%)',
      color: '#BFB27A',
      icon: '<path d="M5 21c0-9 5-15 15-16-.5 9-6 14-13 14"/><path d="M5 21c2-5 5-8 9-10"/>'
    }
  ];
</script>

<section class="feature-showcase" id="categorias">
  <div class="container">
    <!-- Section header -->
    <div class="section-intro">
      <h2 class="section-headline">
        Todo lo que necesitas.<br/>
        <span class="highlight">En un solo lugar.</span>
      </h2>
    </div>

    <!-- Feature grid -->
    <div class="features-grid">
      {#each features as feature}
        <div class="feature-item" style="--gradient: {feature.gradient}; --cat-color: {feature.color}">
          <div class="feature-icon-wrapper">
            <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              {@html feature.icon}
            </svg>
          </div>
          <h3 class="feature-title">{feature.title}</h3>
          <p class="feature-description">{feature.description}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .feature-showcase {
    position: relative;
    background: #000;
    padding: 120px 0;
    overflow: hidden;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* Section intro */
  .section-intro {
    text-align: center;
    margin-bottom: 80px;
  }

  .section-headline {
    font-size: clamp(2.25rem, 7vw, 4rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.1;
    color: #fff;
    text-wrap: balance;
  }

  .highlight {
    color: var(--color-highlight);
  }

  /* Features grid */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    max-width: 1000px;
    margin: 0 auto;
  }

  .feature-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 28px 14px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 24px;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
  }

  .feature-item::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--gradient);
    opacity: 0;
    transition: opacity 0.4s ease;
    border-radius: 24px;
  }

  .feature-item:hover {
    transform: translateY(-8px);
    border-color: transparent;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .feature-item:hover::before {
    opacity: 0.08;
  }

  .feature-icon-wrapper {
    position: relative;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
    color: var(--cat-color);
    z-index: 2;
  }

  .feature-icon {
    width: 40px;
    height: 40px;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .feature-item:hover .feature-icon {
    transform: scale(1.08);
  }

  .feature-title {
    font-size: 19px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 8px;
    letter-spacing: -0.02em;
    position: relative;
    z-index: 2;
  }

  .feature-description {
    font-size: 14px;
    line-height: 1.5;
    color: var(--color-text-variant);
    text-wrap: pretty;
    position: relative;
    z-index: 2;
  }

  /* Responsive */
  @media (max-width: 767px) {
    .feature-showcase {
      padding: 88px 0;
    }

    .section-intro {
      margin-bottom: 40px;
    }
  }

  @media (min-width: 768px) {
    .features-grid {
      gap: 24px;
    }

    .feature-item {
      padding: 48px 28px;
    }

    .feature-icon-wrapper {
      width: 64px;
      height: 64px;
    }

    .feature-icon {
      width: 52px;
      height: 52px;
    }

    .feature-title {
      font-size: 22px;
    }

    .feature-description {
      font-size: 15px;
    }
  }

  @media (min-width: 1024px) {
    .feature-showcase {
      padding: 160px 0;
    }

    .section-intro {
      margin-bottom: 100px;
    }

    .features-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }

    .feature-item {
      padding: 48px 28px;
    }
  }
</style>
