<script lang="ts">
  import { onMount } from 'svelte';

  let scrollY = $state(0);
  let windowHeight = $state(0);
  let isLoaded = $state(false);

  // Carousel state
  let currentImageIndex = $state(0);
  let isTransitioning = $state(false);

  const images = [
    '/img/captura restaurante.png',
    '/img/captura 1.png',
    '/img/captura 2.png',
    '/img/captura 3.png'
  ];

  // Color themes for each image (restaurants, clothing, market, agro)
  const colorThemes = [
    {
      primary: 'rgba(128, 38, 26, 0.8)', // Red for restaurants
      secondary: 'rgba(179, 64, 38, 0.5)',
      tertiary: 'rgba(217, 115, 77, 0.4)'
    },
    {
      primary: 'rgba(13, 77, 64, 0.8)', // Green for clothing
      secondary: 'rgba(26, 115, 97, 0.5)',
      tertiary: 'rgba(102, 166, 140, 0.4)'
    },
    {
      primary: 'rgba(13, 51, 77, 0.8)', // Blue for market
      secondary: 'rgba(26, 89, 115, 0.5)',
      tertiary: 'rgba(102, 140, 166, 0.4)'
    },
    {
      primary: 'rgba(77, 64, 13, 0.8)', // Yellow for agro
      secondary: 'rgba(115, 97, 26, 0.5)',
      tertiary: 'rgba(166, 153, 102, 0.4)'
    }
  ];

  let currentTheme = $derived(colorThemes[currentImageIndex]);

  function nextImage() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentImageIndex = (currentImageIndex + 1) % images.length;
    setTimeout(() => {
      isTransitioning = false;
    }, 600);
  }

  function prevImage() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    setTimeout(() => {
      isTransitioning = false;
    }, 600);
  }

  onMount(() => {
    windowHeight = window.innerHeight;

    // Trigger entrance animations
    setTimeout(() => {
      isLoaded = true;
    }, 100);

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const handleResize = () => {
      windowHeight = window.innerHeight;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  });

  // Parallax and fade calculations
  let opacity = $derived(Math.max(0, 1 - scrollY / (windowHeight * 0.6)));
  let translateY = $derived(scrollY * 0.5);
  let scale = $derived(1 + scrollY * 0.0003);
  let blurAmount = $derived(Math.min(scrollY * 0.02, 10));
</script>

<section class="hero" id="inicio">
  <!-- Animated background -->
  <div class="hero-bg" style="transform: scale({scale}); filter: blur({blurAmount}px);">
    <div class="gradient-mesh" style="
      background:
        radial-gradient(ellipse 80% 50% at 50% -20%, {currentTheme.primary} 0%, transparent 50%),
        radial-gradient(ellipse 60% 40% at 100% 50%, {currentTheme.secondary} 0%, transparent 50%),
        radial-gradient(ellipse 50% 30% at 0% 80%, {currentTheme.tertiary} 0%, transparent 50%),
        linear-gradient(180deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%);
    "></div>
    <div class="floating-orbs">
      <div class="orb orb-1" style="background: radial-gradient(circle, {currentTheme.primary} 0%, transparent 70%);"></div>
      <div class="orb orb-2" style="background: radial-gradient(circle, {currentTheme.tertiary} 0%, transparent 70%);"></div>
      <div class="orb orb-3" style="background: radial-gradient(circle, {currentTheme.secondary} 0%, transparent 70%);"></div>
      <div class="orb orb-4" style="background: radial-gradient(circle, {currentTheme.tertiary} 0%, transparent 70%);"></div>
    </div>
    <div class="grid-overlay"></div>
    <div class="noise-overlay"></div>
  </div>

  <!-- Main content -->
  <div class="hero-content" style="opacity: {opacity}; transform: translateY({translateY}px);">
    <div class="content-wrapper" class:loaded={isLoaded}>
      <!-- Badge -->
      <div class="hero-badge">
        <span class="badge-glow"></span>
        <span class="badge-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </span>
        <span class="badge-text">Compras inteligentes con IA</span>
      </div>

      <!-- Main title -->
      <h1 class="hero-title">
        <span class="title-line title-line-1">
          <span class="word">Descubre.</span>
        </span>
        
        <span class="title-line title-line-3">
          <span class="word gradient-text">Llegó.</span>
        </span>
      </h1>

      <!-- Subtitle -->
      <p class="hero-subtitle">
        La primera app de compras con IA conversacional.<br/>
        Restaurantes, ropa, mercado y agro en un solo lugar.
      </p>

      <!-- CTA Buttons -->
      <div class="hero-actions" id="descargar">
        <a href="#" class="btn-primary">
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          <span class="btn-content">
            <span class="btn-label">Descargar en</span>
            <span class="btn-store">App Store</span>
          </span>
        </a>
        <a href="#" class="btn-primary">
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 9.99l-2.302 2.302-8.634-8.634z"/>
          </svg>
          <span class="btn-content">
            <span class="btn-label">Disponible en</span>
            <span class="btn-store">Google Play</span>
          </span>
        </a>
      </div>

      <!-- Secondary link -->
      <a href="/plus" class="hero-link">
        <span>Conoce Llegó+</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
    </div>
  </div>

  <!-- Phone mockup with screenshot -->
  <div class="hero-device" class:loaded={isLoaded} style="opacity: {opacity}; transform: translateY({translateY * 0.3}px);">
    <div class="device-glow"></div>

    <!-- Navigation arrows -->
    <button class="carousel-arrow carousel-arrow-left" onclick={prevImage} aria-label="Imagen anterior">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </button>

    <div class="phone-frame">
      <div class="carousel-container">
        {#each images as image, index}
          <img
            src={image}
            alt="Llegó App {index + 1}"
            class="phone-screenshot"
            class:active={currentImageIndex === index}
            class:prev={currentImageIndex > index || (currentImageIndex === 0 && index === images.length - 1)}
            class:next={currentImageIndex < index || (currentImageIndex === images.length - 1 && index === 0)}
          />
        {/each}
      </div>
    </div>

    <button class="carousel-arrow carousel-arrow-right" onclick={nextImage} aria-label="Siguiente imagen">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>

    <!-- Carousel indicators -->
    <div class="carousel-indicators">
      {#each images as _, index}
        <button
          class="indicator"
          class:active={currentImageIndex === index}
          onclick={() => {
            if (!isTransitioning) {
              isTransitioning = true;
              currentImageIndex = index;
              setTimeout(() => {
                isTransitioning = false;
              }, 600);
            }
          }}
          aria-label="Ir a imagen {index + 1}"
        ></button>
      {/each}
    </div>
  </div>

  <!-- Scroll indicator -->
  <div class="scroll-indicator" style="opacity: {opacity}">
    <div class="scroll-line">
      <div class="scroll-dot"></div>
    </div>
    <span class="scroll-text">Scroll</span>
  </div>
</section>

<style>
  .hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #000;
  }

  /* Background */
  .hero-bg {
    position: absolute;
    inset: -50px;
    z-index: 0;
    will-change: transform, filter;
  }

  .gradient-mesh {
    position: absolute;
    inset: 0;
    transition: background 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .floating-orbs {
    position: absolute;
    inset: 0;
  }

  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.5;
    animation: float 20s ease-in-out infinite;
    transition: background 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .orb-1 {
    width: 400px;
    height: 400px;
    top: 10%;
    left: 20%;
    animation-delay: 0s;
  }

  .orb-2 {
    width: 300px;
    height: 300px;
    top: 60%;
    right: 15%;
    animation-delay: -5s;
  }

  .orb-3 {
    width: 250px;
    height: 250px;
    bottom: 20%;
    left: 10%;
    animation-delay: -10s;
  }

  .orb-4 {
    width: 350px;
    height: 350px;
    top: 30%;
    right: 30%;
    animation-delay: -15s;
  }

  @keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(30px, -30px) scale(1.05); }
    50% { transform: translate(-20px, 20px) scale(0.95); }
    75% { transform: translate(-30px, -20px) scale(1.02); }
  }

  .grid-overlay {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }

  .noise-overlay {
    position: absolute;
    inset: 0;
    opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  }

  /* Content */
  .hero-content {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 1400px;
    padding: 120px 24px 60px;
    will-change: transform, opacity;
  }

  .content-wrapper {
    max-width: 700px;
    overflow: visible;
  }

  .content-wrapper > * {
    opacity: 0;
    transform: translateY(40px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: visible;
  }

  .content-wrapper.loaded > * {
    opacity: 1;
    transform: translateY(0);
  }

  .content-wrapper.loaded .hero-badge { transition-delay: 0.1s; }
  .content-wrapper.loaded .hero-title { transition-delay: 0.2s; }
  .content-wrapper.loaded .hero-subtitle { transition-delay: 0.4s; }
  .content-wrapper.loaded .hero-actions { transition-delay: 0.5s; }
  .content-wrapper.loaded .hero-link { transition-delay: 0.6s; }

  /* Badge */
  .hero-badge {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 8px 16px 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 100px;
    margin-bottom: 32px;
    backdrop-filter: blur(10px);
  }

  .badge-glow {
    position: absolute;
    inset: -1px;
    border-radius: 100px;
    background: linear-gradient(90deg, rgba(225, 199, 142, 0.3), rgba(90, 132, 103, 0.3));
    opacity: 0;
    transition: opacity 0.3s;
  }

  .hero-badge:hover .badge-glow {
    opacity: 1;
  }

  .badge-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, var(--color-primary), var(--color-button));
    border-radius: 50%;
    color: white;
  }

  .badge-text {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: -0.01em;
  }

  /* Title */
  .hero-title {
    margin-bottom: 24px;
    overflow: visible;
  }

  .title-line {
    display: block;
    overflow: visible;
  }

  .word {
    display: inline-block;
    font-size: clamp(3rem, 12vw, 7rem);
    font-weight: 700;
    letter-spacing: -0.04em;
    line-height: 1.15;
    color: #fff;
    overflow: visible;
  }

  .gradient-text {
    background: linear-gradient(135deg, #E1C78E 0%, #B2D69A 50%, #5A8467 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Subtitle */
  .hero-subtitle {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 40px;
    max-width: 480px;
  }

  /* Actions */
  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 32px;
  }

  .btn-primary {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 24px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 14px;
    color: #fff;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .btn-primary:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }

  .btn-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-label {
    font-size: 11px;
    opacity: 0.7;
    letter-spacing: 0.02em;
  }

  .btn-store {
    font-size: 16px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  /* Link */
  .hero-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 500;
    color: var(--color-secondary);
    transition: all 0.3s ease;
  }

  .hero-link:hover {
    gap: 12px;
  }

  .hero-link svg {
    transition: transform 0.3s ease;
  }

  .hero-link:hover svg {
    transform: translateX(4px);
  }

  /* Device */
  .hero-device {
    display: none;
    position: absolute;
    right: 8%;
    top: 50%;
    transform: translateY(-50%);
    z-index: 3;
    will-change: transform, opacity;
  }

  .hero-device.loaded {
    animation: deviceEntrance 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
  }

  @keyframes deviceEntrance {
    from {
      opacity: 0;
      transform: translateY(-40%) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(-50%) scale(1);
    }
  }

  .device-glow {
    position: absolute;
    inset: -100px;
    background: radial-gradient(ellipse at center, rgba(225, 199, 142, 0.2) 0%, transparent 60%);
    z-index: -1;
    animation: glowPulse 4s ease-in-out infinite;
  }

  @keyframes glowPulse {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
  }

  .phone-frame {
    position: relative;
    width: 267px;
    height: 580px;
    background: linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 50%, #000 100%);
    border-radius: 48px;
    padding: 3px;
    box-shadow:
      /* Outer shadows for depth */
      0 60px 120px -30px rgba(0, 0, 0, 0.8),
      0 40px 80px -20px rgba(0, 0, 0, 0.6),
      0 20px 40px -10px rgba(0, 0, 0, 0.4),
      /* Inner border highlight */
      inset 0 0 0 1px rgba(255, 255, 255, 0.12),
      inset 0 1px 2px rgba(255, 255, 255, 0.15),
      /* Subtle outer glow */
      0 0 0 1px rgba(0, 0, 0, 0.5);
    transform-style: preserve-3d;
  }

  .phone-frame::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 48px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 50%,
      rgba(0, 0, 0, 0.3) 100%
    );
    pointer-events: none;
  }

  /* Carousel container */
  .carousel-container {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 45px;
    overflow: hidden;
  }

  .phone-screenshot {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border-radius: 45px;
    object-fit: cover;
    display: block;
    z-index: 1;
    opacity: 0;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    transform: scale(1.1);
  }

  .phone-screenshot.active {
    opacity: 1;
    transform: scale(1);
    z-index: 2;
  }

  .phone-screenshot.prev {
    transform: scale(0.95) translateX(-20px);
  }

  .phone-screenshot.next {
    transform: scale(0.95) translateX(20px);
  }

  /* Carousel arrows */
  .carousel-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
  }

  .carousel-arrow:hover {
    background: rgba(0, 0, 0, 0.8);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-50%) scale(1.1);
  }

  .carousel-arrow:active {
    transform: translateY(-50%) scale(0.95);
  }

  .carousel-arrow-left {
    left: -70px;
  }

  .carousel-arrow-right {
    right: -70px;
  }

  .carousel-arrow svg {
    width: 24px;
    height: 24px;
  }

  /* Carousel indicators */
  .carousel-indicators {
    position: absolute;
    bottom: -50px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    z-index: 10;
  }

  .indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;
  }

  .indicator:hover {
    background: rgba(255, 255, 255, 0.5);
    transform: scale(1.2);
  }

  .indicator.active {
    width: 24px;
    border-radius: 4px;
    background: linear-gradient(135deg, var(--color-primary), var(--color-button));
  }

  /* Scroll indicator */
  .scroll-indicator {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    z-index: 10;
  }

  .scroll-line {
    width: 1px;
    height: 60px;
    background: rgba(255, 255, 255, 0.2);
    position: relative;
    overflow: hidden;
  }

  .scroll-dot {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 3px;
    height: 10px;
    background: var(--color-secondary);
    border-radius: 2px;
    animation: scrollDown 2s ease-in-out infinite;
  }

  @keyframes scrollDown {
    0% { top: 0; opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }

  .scroll-text {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: rgba(255, 255, 255, 0.4);
  }

  /* Responsive */
  @media (min-width: 1024px) {
    .hero-content {
      padding: 0 60px;
    }

    .hero-device {
      display: block;
    }

    .content-wrapper {
      max-width: 600px;
    }

    .carousel-arrow {
      display: flex;
    }
  }

  @media (min-width: 1280px) {
    .hero-device {
      right: 12%;
    }

    .phone-frame {
      width: 304px;
      height: 660px;
      padding: 4px;
    }

    .carousel-arrow-left {
      left: -80px;
    }

    .carousel-arrow-right {
      right: -80px;
    }
  }

  @media (max-width: 1023px) {
    .carousel-arrow {
      display: none;
    }

    .carousel-indicators {
      display: flex;
    }
  }
</style>
