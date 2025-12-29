<script lang="ts">
  import { onMount } from 'svelte';

  interface Feature {
    icon: string;
    title: string;
    description: string;
    stat: string;
    statLabel: string;
    color: string;
  }

  const features: Feature[] = [
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      title: 'Entregas ultra rápidas',
      description: 'Tu pedido llega en minutos, no en horas. Optimizamos cada ruta con IA para que recibas todo fresco.',
      stat: '~25',
      statLabel: 'min promedio',
      color: '#E1C78E'
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
      title: 'Seguimiento en vivo',
      description: 'Mira exactamente dónde está tu pedido en tiempo real. Sin sorpresas, sin esperas innecesarias.',
      stat: 'GPS',
      statLabel: 'tiempo real',
      color: '#B2D69A'
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
      title: 'Miles de opciones',
      description: 'Restaurantes, supermercados, tiendas de ropa y productos del campo. Todo en una sola app.',
      stat: '1000+',
      statLabel: 'comercios',
      color: '#5A8467'
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`,
      title: 'Pagos seguros',
      description: 'Paga como prefieras: tarjeta, transferencia o efectivo. Todas las transacciones están protegidas.',
      stat: '100%',
      statLabel: 'seguro',
      color: '#7C412B'
    }
  ];

  const stats = [
    { value: '50K+', label: 'Pedidos entregados' },
    { value: '4.9', label: 'Calificación promedio' },
    { value: '15min', label: 'Entrega más rápida' },
    { value: '24/7', label: 'Soporte disponible' }
  ];

  let sectionElement: HTMLElement;
  let isVisible = $state(false);
  let activeFeature = $state(0);

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible = true;
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionElement) {
      observer.observe(sectionElement);
    }

    // Auto-rotate features
    const interval = setInterval(() => {
      activeFeature = (activeFeature + 1) % features.length;
    }, 4000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  });
</script>

<section class="delivery-showcase" bind:this={sectionElement}>
  <!-- Background -->
  <div class="section-bg">
    <div class="bg-gradient"></div>
    <div class="bg-pattern"></div>
    <div class="floating-icons">
      <div class="float-icon icon-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="1" y="3" width="15" height="13" rx="2"/>
          <path d="M16 8h4l3 4v5h-7V8z"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      </div>
      <div class="float-icon icon-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      </div>
      <div class="float-icon icon-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      </div>
    </div>
  </div>

  <div class="container">
    <!-- Header -->
    <div class="section-header" class:visible={isVisible}>
      <div class="header-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        <span>Delivery inteligente</span>
      </div>
      <h2 class="headline">
        Todo lo que amas,<br/>
        <span class="gradient-text">en tu puerta.</span>
      </h2>
      <p class="subheadline">
        Combinamos tecnología de punta con logística eficiente para que recibas
        tus pedidos más rápido que nunca. Como Glovo, Uber Eats o Rappi, pero mejor.
      </p>
    </div>

    <!-- Main content grid -->
    <div class="content-grid" class:visible={isVisible}>
      <!-- Left: Route Animation -->
      <div class="route-animation-side">
        <div class="route-container">
          <svg class="route-canvas" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
            <defs>
              <!-- Gradients -->
              <linearGradient id="routeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#5A8467"/>
                <stop offset="100%" stop-color="#E1C78E"/>
              </linearGradient>
              <linearGradient id="routeTrailGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#5A8467" stop-opacity="0.8"/>
                <stop offset="100%" stop-color="#B2D69A" stop-opacity="0.3"/>
              </linearGradient>
              <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#E1C78E"/>
                <stop offset="100%" stop-color="#F5E6C3"/>
              </linearGradient>

              <!-- Filters -->
              <filter id="routeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="iconGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="6" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="vehicleGlow" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              <!-- Arrow marker for route end -->
              <marker id="arrowHead" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto-start-reverse">
                <path d="M 0 0 L 12 6 L 0 12 L 3 6 Z" fill="url(#arrowGradient)"/>
              </marker>
            </defs>

            <!-- Background route (gray base path) -->
            <path
              class="route-base"
              d="M 65 335
                 Q 65 280, 110 240
                 Q 155 200, 200 200
                 Q 245 200, 270 160
                 Q 295 120, 335 70"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              stroke-width="14"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- Route dashed pattern (like Google Maps) -->
            <path
              class="route-dashed"
              d="M 65 335
                 Q 65 280, 110 240
                 Q 155 200, 200 200
                 Q 245 200, 270 160
                 Q 295 120, 335 70"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              stroke-width="10"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-dasharray="2 18"
            />

            <!-- Animated route trail (follows the delivery) -->
            <path
              class="route-trail"
              d="M 65 335
                 Q 65 280, 110 240
                 Q 155 200, 200 200
                 Q 245 200, 270 160
                 Q 295 120, 335 70"
              fill="none"
              stroke="url(#routeTrailGradient)"
              stroke-width="6"
              stroke-linecap="round"
              stroke-linejoin="round"
              filter="url(#routeGlow)"
            />

            <!-- Active route with arrow (the line being drawn with arrow head) -->
            <path
              class="route-active"
              d="M 65 335
                 Q 65 280, 110 240
                 Q 155 200, 200 200
                 Q 245 200, 270 160
                 Q 295 120, 335 70"
              fill="none"
              stroke="url(#routeGradient)"
              stroke-width="5"
              stroke-linecap="round"
              stroke-linejoin="round"
              marker-end="url(#arrowHead)"
              filter="url(#routeGlow)"
            />

            <!-- Delivery vehicle (moto/scooter) traveling on route -->
            <g class="delivery-vehicle" filter="url(#vehicleGlow)">
              <animateMotion
                dur="4s"
                repeatCount="indefinite"
                rotate="auto"
                path="M 65 335
                      Q 65 280, 110 240
                      Q 155 200, 200 200
                      Q 245 200, 270 160
                      Q 295 120, 335 70"
                keyPoints="0;1"
                keyTimes="0;1"
                calcMode="spline"
                keySplines="0.25 0.1 0.25 1"
              />

              <!-- Vehicle glow/trail effect -->
              <ellipse rx="20" ry="8" fill="#E1C78E" opacity="0.15" transform="rotate(-45)">
                <animate attributeName="opacity" values="0.2;0.08;0.2" dur="0.8s" repeatCount="indefinite"/>
              </ellipse>

              <!-- Scooter body -->
              <g transform="rotate(-45)">
                <!-- Main body -->
                <ellipse cx="0" cy="0" rx="14" ry="10" fill="#E1C78E"/>
                <ellipse cx="0" cy="0" rx="14" ry="10" fill="none" stroke="white" stroke-width="1.5" opacity="0.5"/>

                <!-- Delivery box -->
                <rect x="-8" y="-14" width="16" height="10" rx="2" fill="#5A8467"/>
                <rect x="-8" y="-14" width="16" height="10" rx="2" fill="none" stroke="white" stroke-width="1" opacity="0.6"/>
                <text x="0" y="-8" text-anchor="middle" fill="white" font-size="6" font-weight="bold">L</text>

                <!-- Wheels hint -->
                <circle cx="-8" cy="8" r="4" fill="#333" stroke="white" stroke-width="1"/>
                <circle cx="8" cy="8" r="4" fill="#333" stroke="white" stroke-width="1"/>

                <!-- Speed lines -->
                <line x1="18" y1="-3" x2="28" y2="-3" stroke="white" stroke-width="1.5" opacity="0.6">
                  <animate attributeName="opacity" values="0.6;0.2;0.6" dur="0.3s" repeatCount="indefinite"/>
                </line>
                <line x1="20" y1="0" x2="32" y2="0" stroke="white" stroke-width="1.5" opacity="0.4">
                  <animate attributeName="opacity" values="0.4;0.1;0.4" dur="0.3s" repeatCount="indefinite" begin="0.1s"/>
                </line>
                <line x1="18" y1="3" x2="26" y2="3" stroke="white" stroke-width="1.5" opacity="0.5">
                  <animate attributeName="opacity" values="0.5;0.15;0.5" dur="0.3s" repeatCount="indefinite" begin="0.2s"/>
                </line>
              </g>
            </g>

            <!-- Progress checkpoints along route -->
            <g class="checkpoints">
              <!-- Checkpoint 1 -->
              <circle cx="90" cy="260" r="4" fill="#5A8467" opacity="0.6">
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" begin="1s"/>
              </circle>
              <!-- Checkpoint 2 -->
              <circle cx="155" cy="220" r="4" fill="#7A9E6B" opacity="0.6">
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" begin="2s"/>
              </circle>
              <!-- Checkpoint 3 -->
              <circle cx="245" cy="180" r="4" fill="#B2D69A" opacity="0.6">
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" begin="3s"/>
              </circle>
            </g>

            <!-- Start point (Store/Restaurant) -->
            <g class="start-point" filter="url(#iconGlow)">
              <!-- Outer pulse -->
              <circle cx="65" cy="335" r="48" fill="#5A8467" opacity="0.1">
                <animate attributeName="r" values="44;55;44" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.15;0.05;0.15" dur="3s" repeatCount="indefinite"/>
              </circle>
              <!-- Main circle -->
              <circle cx="65" cy="335" r="36" fill="#5A8467"/>
              <circle cx="65" cy="335" r="36" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
              <!-- Store icon -->
              <g transform="translate(65, 335)">
                <!-- Store roof with awning -->
                <path d="M-16 -6 L-20 -14 L20 -14 L16 -6" fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/>
                <!-- Store body -->
                <rect x="-16" y="-6" width="32" height="18" rx="2" fill="none" stroke="white" stroke-width="2"/>
                <!-- Door -->
                <rect x="-5" y="2" width="10" height="10" rx="1" fill="none" stroke="white" stroke-width="1.5"/>
                <!-- Windows -->
                <rect x="-14" y="-2" width="6" height="6" rx="1" fill="none" stroke="white" stroke-width="1.5"/>
                <rect x="8" y="-2" width="6" height="6" rx="1" fill="none" stroke="white" stroke-width="1.5"/>
              </g>
              <!-- Label -->
              <text x="65" y="385" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="10" font-weight="500">Tienda</text>
            </g>

            <!-- End point (Customer/Home) -->
            <g class="end-point" filter="url(#iconGlow)">
              <!-- Outer pulse (more active to indicate destination) -->
              <circle cx="335" cy="70" r="48" fill="#E1C78E" opacity="0.15">
                <animate attributeName="r" values="44;60;44" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2s" repeatCount="indefinite"/>
              </circle>
              <!-- Main circle -->
              <circle cx="335" cy="70" r="36" fill="#E1C78E"/>
              <circle cx="335" cy="70" r="36" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
              <!-- Home/Person icon -->
              <g transform="translate(335, 70)">
                <!-- House roof -->
                <path d="M-16 -2 L0 -16 L16 -2" fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/>
                <!-- House body -->
                <rect x="-12" y="-2" width="24" height="16" rx="1" fill="none" stroke="white" stroke-width="2"/>
                <!-- Door -->
                <rect x="-4" y="4" width="8" height="10" rx="1" fill="none" stroke="white" stroke-width="1.5"/>
                <!-- Window -->
                <rect x="6" y="2" width="5" height="5" rx="1" fill="none" stroke="white" stroke-width="1.5"/>
              </g>
              <!-- Label -->
              <text x="335" y="120" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="10" font-weight="500">Cliente</text>
            </g>

            <!-- ETA indicator -->
            <g class="eta-indicator">
              <rect x="175" y="85" width="50" height="22" rx="11" fill="rgba(0,0,0,0.6)"/>
              <rect x="175" y="85" width="50" height="22" rx="11" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
              <text x="200" y="100" text-anchor="middle" fill="white" font-size="10" font-weight="600">
                <tspan class="eta-time">~8 min</tspan>
              </text>
            </g>
          </svg>
        </div>
      </div>

      <!-- Right: Features -->
      <div class="features-side">
        <div class="features-grid">
          {#each features as feature, index}
            <button
              class="feature-card"
              class:active={activeFeature === index}
              style="--feature-color: {feature.color}; --delay: {index * 100}ms"
              onclick={() => activeFeature = index}
              type="button"
            >
              <div class="feature-icon">
                {@html feature.icon}
              </div>
              <div class="feature-content">
                <h3 class="feature-title">{feature.title}</h3>
                <p class="feature-description">{feature.description}</p>
              </div>
              <div class="feature-stat">
                <span class="stat-value">{feature.stat}</span>
                <span class="stat-label">{feature.statLabel}</span>
              </div>
              <div class="feature-indicator"></div>
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Stats bar -->
    <div class="stats-bar" class:visible={isVisible}>
      {#each stats as stat, index}
        <div class="stat-item" style="--delay: {index * 100 + 400}ms">
          <span class="stat-value">{stat.value}</span>
          <span class="stat-label">{stat.label}</span>
        </div>
      {/each}
    </div>

    <!-- CTA -->
    <div class="cta-section" class:visible={isVisible}>
      <div class="cta-content">
        <div class="cta-text">
          <h3>Tu próximo pedido está a un tap de distancia</h3>
          <p>Descarga la app y empieza a pedir hoy mismo</p>
        </div>
        <div class="cta-buttons">
          <a href="#descargar" class="cta-primary">
            <span>Descargar ahora</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
          <a href="#como-funciona" class="cta-secondary">
            Ver demo
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .delivery-showcase {
    position: relative;
    padding: 120px 0 160px;
    background: linear-gradient(180deg, #0a0a0a 0%, #000 50%, #0a0a0a 100%);
    overflow: hidden;
  }

  /* Background */
  .section-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .bg-gradient {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 40% at 70% 30%, rgba(225, 199, 142, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse 50% 30% at 30% 70%, rgba(90, 132, 103, 0.08) 0%, transparent 50%);
  }

  .bg-pattern {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  .floating-icons {
    position: absolute;
    inset: 0;
  }

  .float-icon {
    position: absolute;
    width: 48px;
    height: 48px;
    color: rgba(255, 255, 255, 0.06);
    animation: floatIcon 20s ease-in-out infinite;
  }

  .icon-1 { top: 15%; left: 10%; animation-delay: 0s; }
  .icon-2 { top: 60%; right: 8%; animation-delay: -7s; }
  .icon-3 { bottom: 20%; left: 15%; animation-delay: -14s; }

  @keyframes floatIcon {
    0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.06; }
    50% { transform: translateY(-20px) rotate(10deg); opacity: 0.1; }
  }

  .container {
    position: relative;
    z-index: 2;
    max-width: 1300px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* Header */
  .section-header {
    text-align: center;
    max-width: 700px;
    margin: 0 auto 80px;
    opacity: 0;
    transform: translateY(40px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .section-header.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .header-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(225, 199, 142, 0.1);
    border: 1px solid rgba(225, 199, 142, 0.2);
    border-radius: 100px;
    color: var(--color-secondary);
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 24px;
  }

  .headline {
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.1;
    color: #fff;
    margin-bottom: 20px;
  }

  .gradient-text {
    background: linear-gradient(135deg, #E1C78E 0%, #B2D69A 50%, #5A8467 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subheadline {
    font-size: 18px;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.5);
  }

  /* Content grid */
  .content-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 60px;
    margin-bottom: 80px;
    opacity: 0;
    transform: translateY(40px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
  }

  .content-grid.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* Route Animation */
  .route-animation-side {
    display: flex;
    justify-content: center;
    align-items: center;
    order: -1;
  }

  .route-container {
    position: relative;
    width: 340px;
    height: 340px;
  }

  .route-canvas {
    width: 100%;
    height: 100%;
  }

  /* Route base (background path) */
  .route-base {
    opacity: 1;
  }

  /* Route dashed pattern */
  .route-dashed {
    animation: dashMove 2s linear infinite;
  }

  @keyframes dashMove {
    0% {
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dashoffset: -40;
    }
  }

  /* Route trail that follows the vehicle */
  .route-trail {
    stroke-dasharray: 600;
    stroke-dashoffset: 600;
    animation: drawTrail 4s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
  }

  @keyframes drawTrail {
    0% {
      stroke-dashoffset: 600;
      opacity: 0;
    }
    5% {
      opacity: 0.6;
    }
    95% {
      opacity: 0.6;
    }
    100% {
      stroke-dashoffset: 0;
      opacity: 0;
    }
  }

  /* Active route with arrow */
  .route-active {
    stroke-dasharray: 600;
    stroke-dashoffset: 600;
    animation: drawRoute 4s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
  }

  @keyframes drawRoute {
    0% {
      stroke-dashoffset: 600;
      opacity: 0.3;
    }
    5% {
      opacity: 1;
    }
    95% {
      opacity: 1;
    }
    100% {
      stroke-dashoffset: 0;
      opacity: 0.3;
    }
  }

  /* Delivery vehicle */
  .delivery-vehicle {
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
  }

  /* Checkpoints */
  .checkpoints circle {
    filter: drop-shadow(0 0 4px currentColor);
  }

  /* Start and end points */
  .start-point, .end-point {
    transition: transform 0.3s ease;
  }

  .start-point:hover, .end-point:hover {
    transform: scale(1.05);
  }

  /* ETA indicator */
  .eta-indicator {
    animation: fadeInOut 4s ease-in-out infinite;
  }

  @keyframes fadeInOut {
    0%, 100% {
      opacity: 0.7;
    }
    50% {
      opacity: 1;
    }
  }

  /* Features */
  .features-side {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .features-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .feature-card {
    position: relative;
    display: grid;
    grid-template-columns: 56px 1fr auto;
    gap: 16px;
    align-items: center;
    padding: 20px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    text-align: left;
    opacity: 0;
    transform: translateX(20px);
  }

  .content-grid.visible .feature-card {
    opacity: 1;
    transform: translateX(0);
    transition-delay: var(--delay);
  }

  .feature-card:hover,
  .feature-card.active {
    background: rgba(255, 255, 255, 0.04);
    border-color: color-mix(in srgb, var(--feature-color) 30%, transparent);
    transform: translateX(8px);
  }

  .feature-card.active {
    background: color-mix(in srgb, var(--feature-color) 8%, transparent);
  }

  .feature-indicator {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    background: var(--feature-color);
    border-radius: 0 4px 4px 0;
    transition: height 0.3s ease;
  }

  .feature-card.active .feature-indicator {
    height: 60%;
  }

  .feature-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--feature-color) 10%, transparent);
    border-radius: 16px;
    color: var(--feature-color);
    transition: all 0.3s ease;
  }

  .feature-icon :global(svg) {
    width: 24px;
    height: 24px;
  }

  .feature-card.active .feature-icon {
    background: color-mix(in srgb, var(--feature-color) 20%, transparent);
    transform: scale(1.05);
  }

  .feature-content {
    min-width: 0;
  }

  .feature-title {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 4px;
    letter-spacing: -0.01em;
  }

  .feature-description {
    font-size: 13px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.4);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .feature-card.active .feature-description {
    color: rgba(255, 255, 255, 0.6);
  }

  .feature-stat {
    text-align: right;
    flex-shrink: 0;
  }

  .feature-stat .stat-value {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: var(--feature-color);
    letter-spacing: -0.02em;
  }

  .feature-stat .stat-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Stats bar */
  .stats-bar {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 24px;
    margin-bottom: 60px;
  }

  .stat-item {
    text-align: center;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .stats-bar.visible .stat-item {
    opacity: 1;
    transform: translateY(0);
    transition-delay: var(--delay);
  }

  .stat-item .stat-value {
    display: block;
    font-size: 32px;
    font-weight: 700;
    background: linear-gradient(135deg, #E1C78E, #B2D69A);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
    margin-bottom: 4px;
  }

  .stat-item .stat-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
  }

  /* CTA */
  .cta-section {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s;
  }

  .cta-section.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .cta-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    padding: 48px 32px;
    background: linear-gradient(135deg, rgba(2, 49, 51, 0.5) 0%, rgba(90, 132, 103, 0.25) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 32px;
    text-align: center;
  }

  .cta-text h3 {
    font-size: clamp(1.25rem, 3vw, 1.75rem);
    font-weight: 700;
    color: #fff;
    margin-bottom: 8px;
    letter-spacing: -0.02em;
  }

  .cta-text p {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.5);
  }

  .cta-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
  }

  .cta-primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 16px 32px;
    background: #fff;
    color: #000;
    font-size: 15px;
    font-weight: 600;
    border-radius: 100px;
    transition: all 0.3s ease;
  }

  .cta-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 40px rgba(255, 255, 255, 0.1);
  }

  .cta-primary svg {
    transition: transform 0.3s ease;
  }

  .cta-primary:hover svg {
    transform: translateX(4px);
  }

  .cta-secondary {
    display: inline-flex;
    align-items: center;
    padding: 16px 32px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    border-radius: 100px;
    transition: all 0.3s ease;
  }

  .cta-secondary:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.25);
  }

  /* Responsive */
  @media (min-width: 768px) {
    .stats-bar {
      grid-template-columns: repeat(4, 1fr);
      padding: 48px 60px;
    }

    .stat-item .stat-value {
      font-size: 40px;
    }

    .cta-content {
      flex-direction: row;
      justify-content: space-between;
      text-align: left;
      padding: 48px 60px;
    }
  }

  @media (min-width: 1024px) {
    .delivery-showcase {
      padding: 160px 0 200px;
    }

    .content-grid {
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: center;
    }

    .route-animation-side {
      order: 0;
    }

    .route-container {
      width: 420px;
      height: 420px;
    }

    .feature-card {
      padding: 24px;
    }

    .feature-title {
      font-size: 17px;
    }
  }

  @media (min-width: 1280px) {
    .route-container {
      width: 480px;
      height: 480px;
    }

    .content-grid {
      gap: 100px;
    }
  }
</style>
