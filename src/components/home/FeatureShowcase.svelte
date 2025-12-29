<script lang="ts">
  interface Feature {
    id: string;
    title: string;
    description: string;
    gradient: string;
    icon: string;
  }

  const features: Feature[] = [
    {
      id: 'restaurants',
      title: 'Restaurantes',
      description: 'Descubre los mejores lugares cerca de ti',
      gradient: 'linear-gradient(135deg, #B34026 0%, #D9734D 100%)',
      icon: '🍽️'
    },
    {
      id: 'clothing',
      title: 'Ropa',
      description: 'Moda y estilo para toda la familia',
      gradient: 'linear-gradient(135deg, #1A7361 0%, #66A68C 100%)',
      icon: '👕'
    },
    {
      id: 'market',
      title: 'Mercado',
      description: 'Todo lo que necesitas para tu hogar',
      gradient: 'linear-gradient(135deg, #1A5973 0%, #668CA6 100%)',
      icon: '🛒'
    },
    {
      id: 'agro',
      title: 'Agro',
      description: 'Productos frescos directo del campo',
      gradient: 'linear-gradient(135deg, #73611A 0%, #A69966 100%)',
      icon: '🌿'
    }
  ];
</script>

<section class="feature-showcase" id="categorias">
  <div class="container">
    <!-- Section header -->
    <div class="section-intro">
      <span class="section-eyebrow">Categorías</span>
      <h2 class="section-headline">
        Todo lo que necesitas.<br/>
        <span class="gradient-text">En un solo lugar.</span>
      </h2>
    </div>

    <!-- Feature grid -->
    <div class="features-grid">
      {#each features as feature}
        <div class="feature-item" style="--gradient: {feature.gradient}">
          <div class="feature-icon-wrapper">
            <div class="icon-glow"></div>
            <span class="feature-icon">{feature.icon}</span>
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

  .section-eyebrow {
    display: inline-block;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-secondary);
    margin-bottom: 20px;
  }

  .section-headline {
    font-size: clamp(2.5rem, 7vw, 4rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.1;
    color: #fff;
  }

  .gradient-text {
    background: linear-gradient(135deg, #E1C78E 0%, #B2D69A 50%, #5A8467 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Features grid */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 32px;
    max-width: 1000px;
    margin: 0 auto;
  }

  .feature-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 48px 24px;
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
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
  }

  .icon-glow {
    position: absolute;
    inset: -20px;
    background: var(--gradient);
    filter: blur(30px);
    opacity: 0;
    transition: opacity 0.4s ease;
    border-radius: 50%;
  }

  .feature-item:hover .icon-glow {
    opacity: 0.4;
  }

  .feature-icon {
    position: relative;
    font-size: 48px;
    z-index: 2;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .feature-item:hover .feature-icon {
    transform: scale(1.1);
  }

  .feature-title {
    font-size: 24px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 12px;
    letter-spacing: -0.02em;
    position: relative;
    z-index: 2;
  }

  .feature-description {
    font-size: 15px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.5);
    position: relative;
    z-index: 2;
  }

  /* Responsive */
  @media (min-width: 768px) {
    .features-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 40px;
    }

    .feature-item {
      padding: 56px 32px;
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
