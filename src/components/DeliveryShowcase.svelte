<script lang="ts">
  import { onMount } from "svelte";

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
      title: "Entregas ultra rápidas",
      description:
        "Tu pedido llega en minutos, no en horas. Optimizamos cada ruta con IA para que recibas todo fresco.",
      stat: "~25",
      statLabel: "min promedio",
      color: "#E1C78E",
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
      title: "Seguimiento en vivo",
      description:
        "Mira exactamente dónde está tu pedido en tiempo real. Sin sorpresas, sin esperas innecesarias.",
      stat: "GPS",
      statLabel: "tiempo real",
      color: "#B2D69A",
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
      title: "Miles de opciones",
      description:
        "Restaurantes, supermercados, tiendas de ropa y productos del campo. Todo en una sola app.",
      stat: "1000+",
      statLabel: "comercios",
      color: "#5A8467",
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`,
      title: "Pagos seguros",
      description:
        "Paga como prefieras: tarjeta, transferencia o efectivo. Todas las transacciones están protegidas.",
      stat: "100%",
      statLabel: "seguro",
      color: "#7C412B",
    },
  ];

  const stats = [
    { value: "50K+", label: "Pedidos entregados" },
    { value: "4.9", label: "Calificación promedio" },
    { value: "15min", label: "Entrega más rápida" },
    { value: "24/7", label: "Soporte disponible" },
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
      { threshold: 0.2 },
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
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <rect x="1" y="3" width="15" height="13" rx="2" />
          <path d="M16 8h4l3 4v5h-7V8z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      </div>
      <div class="float-icon icon-2">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      </div>
      <div class="float-icon icon-3">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
          />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>
    </div>
  </div>

  <div class="container">
    <!-- Header -->
    <div class="section-header" class:visible={isVisible}>
      <div class="header-badge">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          width="16"
          height="16"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        <span>Delivery inteligente</span>
      </div>
      <h2 class="headline">
        Todo lo que amas,<br />
        <span class="gradient-text">en tu puerta.</span>
      </h2>
      <p class="subheadline">
        Combinamos tecnología de punta con logística eficiente para que recibas
        tus pedidos más rápido que nunca. Como Glovo, Uber Eats o Rappi, pero
        mejor.
      </p>
    </div>

    <!-- Main content grid -->
    <div class="content-grid" class:visible={isVisible}>
      <!-- Left: Delivery Animation -->
      <div class="route-animation-side">
        <div class="route-container">
          <svg
            class="route-canvas"
            viewBox="0 0 400 400"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient
                id="roadGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stop-color="#333" />
                <stop offset="100%" stop-color="#444" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <!-- 1. SCENERY BACKGROUND -->

            <!-- Road -->
            <path
              d="M 70 240 Q 200 320 350 240"
              fill="none"
              stroke="#2a2a2a"
              stroke-width="40"
              stroke-linecap="round"
            />
            <!-- Road markings -->
            <path
              id="deliveryPath"
              d="M 70 240 Q 200 320 350 240"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              stroke-width="2"
              stroke-dasharray="10 15"
              stroke-linecap="round"
            />

            <!-- 2. RESTAURANT (Left) -->
            <g class="restaurant-group" transform="translate(0, 160)">
              <!-- Base -->
              <rect x="0" y="40" width="80" height="70" fill="#2d2d2d" rx="2" />
              <rect
                x="5"
                y="45"
                width="70"
                height="60"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                stroke-width="1"
              />

              <!-- Awning (Red/White stripes) -->
              <path d="M-5 40 L5 20 L75 20 L85 40" fill="#c0392b" />
              <path
                d="M-5 40 L5 20 L15 40 M15 20 L25 40 M35 20 L45 40 M55 20 L65 40 M75 20 L85 40"
                stroke="rgba(255,255,255,0.9)"
                stroke-width="2"
                fill="none"
              />

              <!-- Sign -->
              <rect
                x="10"
                y="0"
                width="60"
                height="15"
                rx="2"
                fill="#1a1a1a"
                stroke="#E1C78E"
                stroke-width="1"
              />
              <text
                x="40"
                y="11"
                text-anchor="middle"
                fill="#E1C78E"
                font-size="8"
                font-family="serif"
                font-weight="bold"
                letter-spacing="1">PIZZERIA</text
              >

              <!-- Window & Door -->
              <rect
                x="10"
                y="60"
                width="25"
                height="40"
                fill="#3d2b1f"
                rx="1"
              />
              <!-- Door -->
              <rect
                x="45"
                y="60"
                width="25"
                height="25"
                fill="#87CEEB"
                opacity="0.3"
              />
              <!-- Window -->
              <rect
                x="45"
                y="60"
                width="25"
                height="25"
                fill="none"
                stroke="#555"
                stroke-width="1"
              />

              <!-- Chef at door handing pizza -->
              <g transform="translate(30, 88)">
                <!-- Chef hat -->
                <rect x="-6" y="-26" width="12" height="6" rx="2" fill="#fff" />
                <rect x="-8" y="-32" width="16" height="8" rx="3" fill="#fff" />
                <!-- Head -->
                <circle cx="0" cy="-16" r="5" fill="#f1c27d" />
                <!-- Body -->
                <rect
                  x="-6"
                  y="-10"
                  width="12"
                  height="16"
                  rx="2"
                  fill="#fff"
                  stroke="rgba(0,0,0,0.1)"
                  stroke-width="0.6"
                />
                <rect x="-5" y="-6" width="10" height="2" fill="#e74c3c" />
                <rect x="-5" y="-2" width="10" height="2" fill="#e74c3c" />

                <!-- Arm -->
                <path
                  d="M0 -2 L16 4"
                  stroke="#f1c27d"
                  stroke-width="3"
                  stroke-linecap="round"
                >
                  <animate
                    attributeName="d"
                    values="M0 -2 L12 2;M0 -2 L26 -4;M0 -2 L12 2"
                    dur="6s"
                    repeatCount="indefinite"
                    keyTimes="0;0.12;1"
                  />
                </path>
              </g>

              <!-- Pizza Box (Handover animation) -->
              <g>
                <rect
                  x="52"
                  y="80"
                  width="16"
                  height="4"
                  fill="#E1C78E"
                  stroke="#8B4513"
                  stroke-width="0.5"
                >
                  <!-- 0-1s: Wait, 1-1.5s: Move to Moto, 1.5-4.5s: Hide (in bag), 4.5s: Deliver -->
                  <animate
                    attributeName="opacity"
                    values="1;1;0;0;0"
                    dur="6s"
                    repeatCount="indefinite"
                    keyTimes="0;0.15;0.2;0.8;1"
                  />
                  <animate
                    attributeName="x"
                    values="52;52;70;70"
                    dur="6s"
                    repeatCount="indefinite"
                    keyTimes="0;0.1;0.2;1"
                  />
                </rect>
                <path
                  d="M55 80 L60 76 L65 80"
                  fill="none"
                  stroke="#C88E44"
                  stroke-width="0.8"
                >
                  <animate
                    attributeName="opacity"
                    values="0;0;1;0;0"
                    dur="6s"
                    repeatCount="indefinite"
                    keyTimes="0;0.08;0.14;0.2;1"
                  />
                  <animate
                    attributeName="transform"
                    values="translate(0, 0); translate(0, 0); translate(18, 18); translate(18, 18); translate(18, 18)"
                    dur="6s"
                    repeatCount="indefinite"
                    keyTimes="0;0.08;0.14;0.2;1"
                  />
                </path>
              </g>
            </g>

            <!-- 3. MOTO (Moving along path) -->
            <g>
              <animateMotion
                dur="6s"
                repeatCount="indefinite"
                rotate="auto"
                keyPoints="0;0;0.7;0.85;0.85;1"
                keyTimes="0;0.25;0.6;0.78;0.9;1"
                calcMode="linear"
              >
                <mpath href="#deliveryPath" />
              </animateMotion>

              <g transform="translate(0, -15)">
                <!-- Adjust moto to sit ON the line -->

                <!-- Moto Body -->
                <path d="M-15 0 L15 0 L12 -12 L-10 -10 Z" fill="#E1C78E" />
                <circle
                  cx="-10"
                  cy="0"
                  r="6"
                  fill="#1a1a1a"
                  stroke="#555"
                  stroke-width="2"
                />
                <circle
                  cx="10"
                  cy="0"
                  r="6"
                  fill="#1a1a1a"
                  stroke="#555"
                  stroke-width="2"
                />

                <!-- Seat & Handlebars -->
                <path d="M-5 -10 L5 -10" stroke="#333" stroke-width="3" />
                <path d="M12 -12 L14 -18" stroke="#ccc" stroke-width="2" />

                <!-- Driver -->
                <g transform="translate(0, -12)">
                  <circle cx="0" cy="-8" r="6" fill="#333" />
                  <!-- Helmet -->
                  <path d="M-4 0 Q0 5 4 0" fill="#E1C78E" />
                  <!-- Body -->
                  <rect
                    x="2"
                    y="-10"
                    width="4"
                    height="3"
                    fill="rgba(255,255,255,0.5)"
                  />
                  <!-- Visor -->
                </g>

                <!-- Llego Bag -->
                <g transform="translate(-14, -18)">
                  <rect
                    x="0"
                    y="0"
                    width="14"
                    height="12"
                    rx="1"
                    fill="#5A8467"
                    stroke="#fff"
                    stroke-width="0.5"
                  />
                  <rect
                    x="2"
                    y="-6"
                    width="10"
                    height="3"
                    fill="#E1C78E"
                    stroke="#8B4513"
                    stroke-width="0.4"
                    opacity="0"
                  >
                    <animate
                      attributeName="opacity"
                      values="0;0;1;0;0"
                      dur="6s"
                      repeatCount="indefinite"
                      keyTimes="0;0.16;0.22;0.3;1"
                    />
                    <animate
                      attributeName="y"
                      values="-6;-6;2;2;2"
                      dur="6s"
                      repeatCount="indefinite"
                      keyTimes="0;0.16;0.22;0.3;1"
                    />
                  </rect>
                  <rect
                    x="2"
                    y="5"
                    width="10"
                    height="3"
                    fill="#E1C78E"
                    stroke="#8B4513"
                    stroke-width="0.4"
                    opacity="0"
                  >
                    <animate
                      attributeName="opacity"
                      values="0;0;1;1;0"
                      dur="6s"
                      repeatCount="indefinite"
                      keyTimes="0;0.2;0.25;0.8;1"
                    />
                  </rect>
                  <text
                    x="7"
                    y="9"
                    text-anchor="middle"
                    fill="white"
                    font-size="6"
                    font-weight="900"
                    font-family="sans-serif">L</text
                  >
                  <!-- Flap animation when pizza enters -->
                  <rect x="0" y="0" width="14" height="4" fill="#4a6e56">
                    <animate
                      attributeName="height"
                      values="4;0;4;4"
                      dur="6s"
                      repeatCount="indefinite"
                      keyTimes="0;0.15;0.2;1"
                    />
                  </rect>
                </g>

                <g
                  class="speed-lines"
                  opacity="0.6"
                  transform="translate(-25, 0)"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="10"
                    y2="0"
                    stroke="#fff"
                    stroke-width="1"
                  >
                    <animate
                      attributeName="opacity"
                      values="0;1;0"
                      dur="0.2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="x1"
                      values="-5;0"
                      dur="0.2s"
                      repeatCount="indefinite"
                    />
                  </line>
                </g>
              </g>
            </g>

            <!-- 4. HOUSE / CUSTOMER (Right) -->
            <g class="house-group" transform="translate(350, 150)">
              <!-- House Base -->
              <path
                d="M-36 60 L0 30 L36 60 L36 124 L-36 124 Z"
                fill="#d7c2a2"
                stroke="rgba(0,0,0,0.08)"
                stroke-width="1"
              />
              <path
                d="M-40 60 L0 26 L40 60 L40 66 L-40 66 Z"
                fill="#9a6b45"
              />
              <rect x="-36" y="116" width="72" height="8" fill="#b08b69" />
              <rect
                x="-8"
                y="80"
                width="16"
                height="44"
                fill="#7a5a3a"
              />
              <!-- Door -->
              <circle cx="6" cy="102" r="1" fill="#cda434" />
              <!-- Knob -->
              <rect x="-30" y="60" width="60" height="4" fill="#9a6b45" />
              <rect
                x="-30"
                y="82"
                width="20"
                height="28"
                fill="#8ea1ad"
                opacity="0.85"
              />
              <rect
                x="10"
                y="82"
                width="20"
                height="28"
                fill="#8ea1ad"
                opacity="0.85"
              />
              <rect x="-18" y="86" width="6" height="22" fill="#dbe4ea" opacity="0.7" />
              <rect x="12" y="86" width="6" height="22" fill="#dbe4ea" opacity="0.7" />

              <!-- Customer (clean minimal style) -->
              <g transform="translate(16, 95)">
                <!-- Legs -->
                <rect x="-5" y="24" width="4" height="14" rx="2" fill="#4a5568" />
                <rect x="1" y="24" width="4" height="14" rx="2" fill="#4a5568" />

                <!-- Body -->
                <rect x="-7" y="6" width="14" height="20" rx="5" fill="#68a67d" />

                <!-- Head -->
                <circle cx="0" cy="-4" r="10" fill="#f7dcc5" />

                <!-- Hair -->
                <path d="M-9 -6 Q-10 -16 0 -16 Q10 -16 9 -6" fill="#7a5c45" />

                <!-- Eyes (simple closed happy eyes) -->
                <path d="M-5 -4 Q-3.5 -6 -2 -4" fill="none" stroke="#5a4a3a" stroke-width="1.2" stroke-linecap="round" />
                <path d="M2 -4 Q3.5 -6 5 -4" fill="none" stroke="#5a4a3a" stroke-width="1.2" stroke-linecap="round" />

                <!-- Smile -->
                <path d="M-3 2 Q0 5 3 2" fill="none" stroke="#c9a88a" stroke-width="1" stroke-linecap="round" />

                <!-- Arms -->
                <path
                  d="M-7 12 L-14 8"
                  stroke="#f7dcc5"
                  stroke-width="3.5"
                  stroke-linecap="round"
                >
                  <animate
                    attributeName="d"
                    values="M-7 12 L-11 10;M-7 12 L-16 6;M-7 12 L-20 0;M-7 12 L-12 14"
                    dur="6s"
                    repeatCount="indefinite"
                    keyTimes="0;0.6;0.8;1"
                  />
                </path>
                <path
                  d="M7 12 L14 8"
                  stroke="#f7dcc5"
                  stroke-width="3.5"
                  stroke-linecap="round"
                >
                  <animate
                    attributeName="d"
                    values="M7 12 L11 10;M7 12 L16 6;M7 12 L20 0;M7 12 L12 14"
                    dur="6s"
                    repeatCount="indefinite"
                    keyTimes="0;0.6;0.8;1"
                  />
                </path>
              </g>

              <!-- Delivered Pizza (Appears after moto arrives) -->
              <g opacity="0">
                <animate
                  attributeName="opacity"
                  values="0;0;1;1;0"
                  dur="6s"
                  repeatCount="indefinite"
                  keyTimes="0;0.75;0.8;0.95;1"
                />
                <rect
                  x="-56"
                  y="92"
                  width="16"
                  height="4"
                  fill="#E1C78E"
                  stroke="#8B4513"
                  stroke-width="0.5"
                />
              </g>

              <!-- REWARDS (Money & Stars) -->
              <g transform="translate(0, 80)" opacity="0">
                <animate
                  attributeName="opacity"
                  values="0;0;1;0"
                  dur="6s"
                  repeatCount="indefinite"
                  keyTimes="0;0.85;0.9;1"
                />
                <animate
                  attributeName="transform"
                  values="translate(0, 80); translate(0, 80); translate(0, 52); translate(0, 40)"
                  dur="6s"
                  repeatCount="indefinite"
                  keyTimes="0;0.85;0.95;1"
                />

                <text
                  x="-20"
                  y="0"
                  fill="#85bb65"
                  font-weight="bold"
                  font-size="14">$</text
                >
                <text x="20" y="-10" fill="#FFD700" font-size="12">⭐</text>
                <text x="0" y="-20" fill="#FFD700" font-size="10">⭐</text>
                <text
                  x="-10"
                  y="-15"
                  fill="#85bb65"
                  font-weight="bold"
                  font-size="10">$</text
                >
              </g>
            </g>

            <!-- Labels -->
            <text
              x="50"
              y="290"
              text-anchor="middle"
              fill="rgba(255,255,255,0.4)"
              font-size="10"
              font-family="sans-serif">Restaurante</text
            >
            <text
              x="350"
              y="290"
              text-anchor="middle"
              fill="rgba(255,255,255,0.4)"
              font-size="10"
              font-family="sans-serif">Tu Casa</text
            >
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
              onclick={() => (activeFeature = index)}
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a href="#como-funciona" class="cta-secondary"> Ver demo </a>
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
    background: radial-gradient(
        ellipse 60% 40% at 70% 30%,
        rgba(225, 199, 142, 0.08) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse 50% 30% at 30% 70%,
        rgba(90, 132, 103, 0.08) 0%,
        transparent 50%
      );
  }

  .bg-pattern {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(
        circle at 25% 25%,
        rgba(255, 255, 255, 0.02) 1px,
        transparent 1px
      ),
      radial-gradient(
        circle at 75% 75%,
        rgba(255, 255, 255, 0.02) 1px,
        transparent 1px
      );
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

  .icon-1 {
    top: 15%;
    left: 10%;
    animation-delay: 0s;
  }
  .icon-2 {
    top: 60%;
    right: 8%;
    animation-delay: -7s;
  }
  .icon-3 {
    bottom: 20%;
    left: 15%;
    animation-delay: -14s;
  }

  @keyframes floatIcon {
    0%,
    100% {
      transform: translateY(0) rotate(0deg);
      opacity: 0.06;
    }
    50% {
      transform: translateY(-20px) rotate(10deg);
      opacity: 0.1;
    }
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
    background: linear-gradient(135deg, #e1c78e 0%, #b2d69a 50%, #5a8467 100%);
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

  /* Delivery Animation */
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
    overflow: visible;
  }

  /* Route that gets drawn behind the moto */
  .delivery-route {
    stroke-dasharray: 400;
    stroke-dashoffset: 400;
    animation: drawRoute 5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes drawRoute {
    0% {
      stroke-dashoffset: 400;
      opacity: 0;
    }
    5% {
      opacity: 1;
    }
    95% {
      opacity: 1;
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dashoffset: 0;
      opacity: 0;
    }
  }

  /* Preview route (faint dotted line) */
  .route-preview {
    animation: previewPulse 5s ease-in-out infinite;
  }

  @keyframes previewPulse {
    0%,
    100% {
      opacity: 0.15;
    }
    50% {
      opacity: 0.08;
    }
  }

  /* Moto group */
  .moto-group {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
  }

  /* Store and Customer groups */
  .store-group,
  .customer-group {
    transition: transform 0.3s ease;
  }

  /* Route arrow that follows the path */
  .route-arrow {
    filter: drop-shadow(0 0 8px rgba(225, 199, 142, 0.8));
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
    background: linear-gradient(135deg, #e1c78e, #b2d69a);
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
    background: linear-gradient(
      135deg,
      rgba(2, 49, 51, 0.5) 0%,
      rgba(90, 132, 103, 0.25) 100%
    );
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
