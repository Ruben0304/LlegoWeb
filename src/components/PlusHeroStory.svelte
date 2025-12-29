<script lang="ts">
  import { onMount } from 'svelte';

  let scrollY = $state(0);
  let mounted = $state(false);

  onMount(() => {
    mounted = true;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });

  let opacity = $derived(Math.max(0, 1 - scrollY / 500));
  let scale = $derived(Math.max(0.9, 1 - scrollY / 2000));
</script>

<section class="plus-hero">
  <div class="hero-content" style="opacity: {opacity}; transform: scale({scale})">
    <!-- Plus Badge -->
    <div class="plus-badge" class:visible={mounted}>
      <div class="badge-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
      <span>Llegó Plus</span>
    </div>

    <!-- Main Title -->
    <h1 class="hero-title" class:visible={mounted}>
      <span class="title-line">El poder de la IA.</span>
      <span class="title-line">En tus compras.</span>
      <span class="title-line title-accent">Sin limites.</span>
    </h1>

    <!-- Description -->
    <p class="hero-description" class:visible={mounted}>
      Una experiencia de compra completamente nueva. Mas inteligente, mas rapida, mas tuya.
    </p>

    <!-- CTA Buttons -->
    <div class="hero-cta" class:visible={mounted}>
      <button class="btn-hero-primary">
        Prueba gratis por 7 dias
      </button>
      <a href="#planes" class="btn-hero-secondary">
        Ver planes
      </a>
    </div>

    <!-- Price Tag -->
    <p class="price-tag" class:visible={mounted}>
      Desde $5.75/mes
    </p>
  </div>

  <!-- Gradient Background -->
  <div class="gradient-bg">
    <div class="gradient-orb orb-1"></div>
    <div class="gradient-orb orb-2"></div>
    <div class="gradient-orb orb-3"></div>
  </div>

  <!-- Scroll Indicator -->
  <div class="scroll-indicator" style="opacity: {opacity}">
    <div class="scroll-dot"></div>
  </div>
</section>

<style>
  .plus-hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #000000 100%);
  }

  .hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: var(--spacing-2xl) var(--spacing-lg);
    max-width: 1000px;
    margin: 0 auto;
    will-change: opacity, transform;
    transition: all var(--transition-smooth);
  }

  /* Plus Badge */
  .plus-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-lg);
    background: rgba(225, 199, 142, 0.1);
    border: 1px solid rgba(225, 199, 142, 0.2);
    border-radius: var(--radius-full);
    margin-bottom: var(--spacing-2xl);
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .plus-badge.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .badge-icon {
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, var(--color-secondary), var(--color-accent));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
  }

  .plus-badge span {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-secondary);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* Hero Title */
  .hero-title {
    font-size: clamp(3rem, 10vw, 7rem);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.04em;
    margin-bottom: var(--spacing-xl);
    color: #ffffff;
  }

  .title-line {
    display: block;
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .hero-title.visible .title-line:nth-child(1) {
    opacity: 1;
    transform: translateY(0);
    transition-delay: 0.2s;
  }

  .hero-title.visible .title-line:nth-child(2) {
    opacity: 1;
    transform: translateY(0);
    transition-delay: 0.4s;
  }

  .hero-title.visible .title-line:nth-child(3) {
    opacity: 1;
    transform: translateY(0);
    transition-delay: 0.6s;
  }

  .title-accent {
    background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Description */
  .hero-description {
    font-size: clamp(1.125rem, 2vw, 1.5rem);
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.7);
    max-width: 600px;
    margin: 0 auto var(--spacing-2xl);
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: 0.8s;
  }

  .hero-description.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* CTA Buttons */
  .hero-cta {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: center;
    margin-bottom: var(--spacing-lg);
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: 1s;
  }

  .hero-cta.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .btn-hero-primary {
    padding: 1rem 2.5rem;
    font-size: var(--font-size-lg);
    font-weight: 600;
    background: linear-gradient(135deg, var(--color-secondary), #d4b87d);
    color: var(--color-primary);
    border-radius: var(--radius-full);
    transition: all var(--transition-base);
    box-shadow: 0 4px 20px rgba(225, 199, 142, 0.3);
  }

  .btn-hero-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(225, 199, 142, 0.5);
  }

  .btn-hero-secondary {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-secondary);
    transition: all var(--transition-base);
  }

  .btn-hero-secondary:hover {
    color: #ffffff;
  }

  /* Price Tag */
  .price-tag {
    font-size: var(--font-size-sm);
    color: rgba(255, 255, 255, 0.5);
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: 1.2s;
  }

  .price-tag.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* Gradient Background */
  .gradient-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
  }

  .gradient-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);
    opacity: 0.3;
    animation: float 20s ease-in-out infinite;
  }

  .orb-1 {
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(225, 199, 142, 0.4) 0%, transparent 70%);
    top: -200px;
    right: -200px;
    animation-delay: 0s;
  }

  .orb-2 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(178, 214, 154, 0.3) 0%, transparent 70%);
    bottom: -150px;
    left: -150px;
    animation-delay: 7s;
  }

  .orb-3 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(2, 49, 51, 0.5) 0%, transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation-delay: 14s;
  }

  @keyframes float {
    0%, 100% {
      transform: translate(0, 0) scale(1);
    }
    33% {
      transform: translate(30px, -30px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
  }

  /* Scroll Indicator */
  .scroll-indicator {
    position: absolute;
    bottom: var(--spacing-2xl);
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    transition: opacity var(--transition-base);
  }

  .scroll-dot {
    width: 6px;
    height: 6px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 50%;
    animation: scroll-bounce 2s ease-in-out infinite;
  }

  @keyframes scroll-bounce {
    0%, 100% {
      transform: translateY(0);
      opacity: 1;
    }
    50% {
      transform: translateY(10px);
      opacity: 0.5;
    }
  }

  /* Responsive */
  @media (min-width: 768px) {
    .hero-cta {
      flex-direction: row;
      gap: var(--spacing-lg);
    }
  }

  @media (max-width: 767px) {
    .plus-hero {
      min-height: 90vh;
    }

    .hero-title {
      font-size: clamp(2.5rem, 8vw, 4rem);
    }
  }
</style>
