<script lang="ts">
    import { onMount } from "svelte";

    interface Step {
        id: string;
        number: string;
        title: string;
        subtitle: string;
        description: string;
        highlight: string;
        color: string;
        image: string;
    }

    const steps: Step[] = [
        {
            id: "explore",
            number: "01",
            title: "Explora",
            subtitle: "con un toque",
            description:
                "Desliza entre categorías y descubre miles de opciones. Restaurantes, tiendas, supermercados y productos del campo.",
            highlight: "Carrusel intuitivo",
            color: "#E1C78E",
            image: "/img/captura-1-hero.webp",
        },
        {
            id: "ai-search",
            number: "02",
            title: "Habla",
            subtitle: "con nuestra IA",
            description:
                "Mantén presionado y dile qué buscas. Nuestra IA conversacional entiende exactamente lo que necesitas.",
            highlight: "Búsqueda por voz",
            color: "#B2D69A",
            image: "/img/captura-2-hero.webp",
        },
        {
            id: "confirm",
            number: "03",
            title: "Recibe",
            subtitle: "en minutos",
            description:
                "Confirma tu pedido y rastréalo en tiempo real. Tu orden llega a tu puerta en minutos.",
            highlight: "Entrega express",
            color: "#5A8467",
            image: "/img/captura-3-hero.webp",
        },
    ];

    let sectionRef: HTMLElement;
    let windowHeight = $state(0);
    let sectionTop = $state(0);
    let sectionHeight = $state(0);
    let isReducedMotion = $state(false);
    let isMobile = $state(false);
    type ImageLoadState = "idle" | "loading" | "loaded" | "error";

    // Scroll progress within the section (0 to 1)
    let sectionProgress = $state(0);
    let lowMotionMode = $derived(isMobile || isReducedMotion);
    let loadedStepImageSources = $state<(string | null)[]>(
        steps.map(() => null),
    );
    let stepImageLoadStates = $state<ImageLoadState[]>(
        steps.map(() => "idle"),
    );
    const stepImageLoadPromises = new Map<number, Promise<void>>();

    // Current active step (0, 1, 2)
    let activeStep = $derived(
        lowMotionMode
            ? 0
            : Math.min(
                  steps.length - 1,
                  Math.floor(sectionProgress * steps.length),
              ),
    );

    // Progress within current step (0 to 1)
    let stepProgress = $derived(() => {
        if (lowMotionMode) return 0;
        const stepSize = 1 / steps.length;
        const stepStart = activeStep * stepSize;
        return Math.min(
            1,
            Math.max(0, (sectionProgress - stepStart) / stepSize),
        );
    });

    onMount(() => {
        const reducedMotionQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        );

        const updateViewportState = () => {
            windowHeight = window.innerHeight;
            isMobile = window.innerWidth <= 768;
            isReducedMotion = reducedMotionQuery.matches;
            if (isMobile || isReducedMotion) {
                sectionProgress = 0;
            }
        };

        updateViewportState();

        const updateMetrics = () => {
            if (isMobile || isReducedMotion) return;
            if (sectionRef) {
                const rect = sectionRef.getBoundingClientRect();
                sectionTop = rect.top + window.scrollY;
                sectionHeight = sectionRef.offsetHeight;

                // Calculate how far we've scrolled into the section
                const scrollIntoSection = window.scrollY - sectionTop;
                const scrollableDistance = sectionHeight - windowHeight;

                if (scrollIntoSection <= 0) {
                    sectionProgress = 0;
                } else if (scrollIntoSection >= scrollableDistance) {
                    sectionProgress = 1;
                } else {
                    sectionProgress = scrollIntoSection / scrollableDistance;
                }
            }
        };

        const handleScroll = () => {
            if (isMobile || isReducedMotion) return;
            updateMetrics();
        };

        const handleResize = () => {
            updateViewportState();
            updateMetrics();
        };

        const handleReducedMotionChange = () => {
            isReducedMotion = reducedMotionQuery.matches;
            if (isReducedMotion) {
                sectionProgress = 0;
            } else {
                updateMetrics();
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleResize, { passive: true });
        if (typeof reducedMotionQuery.addEventListener === "function") {
            reducedMotionQuery.addEventListener(
                "change",
                handleReducedMotionChange,
            );
        } else {
            reducedMotionQuery.addListener(handleReducedMotionChange);
        }

        // Initial calculation
        if (!isMobile && !isReducedMotion) {
            setTimeout(updateMetrics, 100);
        }

        markVisibleStepRangeForLoad(activeStep);

        let idlePreloadId: number | undefined;
        if (!isMobile && !isReducedMotion) {
            if ("requestIdleCallback" in window) {
                idlePreloadId = window.requestIdleCallback(() => {
                    steps.forEach((_, index) => {
                        void ensureStepImageLoaded(index);
                    });
                }) as unknown as number;
            } else {
                idlePreloadId = window.setTimeout(() => {
                    steps.forEach((_, index) => {
                        void ensureStepImageLoaded(index);
                    });
                }, 1600);
            }
        }

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
            if (typeof reducedMotionQuery.removeEventListener === "function") {
                reducedMotionQuery.removeEventListener(
                    "change",
                    handleReducedMotionChange,
                );
            } else {
                reducedMotionQuery.removeListener(handleReducedMotionChange);
            }
            if (idlePreloadId !== undefined) {
                if ("cancelIdleCallback" in window) {
                    window.cancelIdleCallback(idlePreloadId);
                } else {
                    window.clearTimeout(idlePreloadId);
                }
            }
        };
    });

    // Phone slides in from right and out to left
    function getPhoneTransform(index: number): string {
        if (index < activeStep) {
            // Previous phones exit to the left
            return `translateX(-150%)`;
        } else if (index > activeStep) {
            // Next phones wait on the right
            return `translateX(150%)`;
        } else {
            // Active phone is centered
            return `translateX(0)`;
        }
    }

    function getPhoneOpacity(index: number): number {
        if (index === activeStep) return 1;
        return 0;
    }

    function getOptimizedStepImageSource(image: string): string {
        const image320 = image.replace("-hero.webp", "-hero-320.webp");
        return window.devicePixelRatio > 1.3 ? image : image320;
    }

    function setStepImageLoadState(index: number, state: ImageLoadState) {
        stepImageLoadStates = stepImageLoadStates.map((current, i) =>
            i === index ? state : current,
        );
    }

    function setLoadedStepImageSource(index: number, source: string | null) {
        loadedStepImageSources = loadedStepImageSources.map((current, i) =>
            i === index ? source : current,
        );
    }

    function ensureStepImageLoaded(index: number): Promise<void> {
        if (index < 0 || index >= steps.length) return Promise.resolve();
        if (
            stepImageLoadStates[index] === "loaded" ||
            stepImageLoadStates[index] === "error"
        ) {
            return Promise.resolve();
        }

        const pendingLoad = stepImageLoadPromises.get(index);
        if (pendingLoad) return pendingLoad;

        setStepImageLoadState(index, "loading");

        const fallbackSource = steps[index].image;
        const source = getOptimizedStepImageSource(fallbackSource);
        const loadPromise = new Promise<void>((resolve) => {
            const preloadImage = new Image();
            preloadImage.src = source;

            preloadImage.onload = async () => {
                try {
                    await preloadImage.decode();
                } catch {
                    // decode can fail on some browsers even after successful load
                }
                setLoadedStepImageSource(index, source);
                setStepImageLoadState(index, "loaded");
                stepImageLoadPromises.delete(index);
                resolve();
            };

            preloadImage.onerror = () => {
                // Fallback to the original source if optimized preload fails
                setLoadedStepImageSource(index, fallbackSource);
                setStepImageLoadState(index, "error");
                stepImageLoadPromises.delete(index);
                resolve();
            };
        });

        stepImageLoadPromises.set(index, loadPromise);
        return loadPromise;
    }

    function markStepImageForLoad(index: number) {
        if (index < 0 || index >= steps.length) return;
        void ensureStepImageLoaded(index);
    }

    function markVisibleStepRangeForLoad(index: number) {
        markStepImageForLoad(index);
        markStepImageForLoad((index + 1) % steps.length);
        markStepImageForLoad((index - 1 + steps.length) % steps.length);
    }

    // Calculate line progress (fills as we scroll through steps)
    function getLineProgress(): number {
        // Progress from 0 to 100 based on which step we're on
        const stepSize = 1 / steps.length;
        const baseProgress = activeStep / steps.length;
        const withinStepProgress = stepProgress() * stepSize;
        return Math.min(100, (baseProgress + withinStepProgress) * 100);
    }

    $effect(() => {
        markVisibleStepRangeForLoad(activeStep);
    });
</script>

<section class="scrollytelling" bind:this={sectionRef} id="como-funciona">
    <!-- Background -->
    <div class="section-bg">
        <div
            class="bg-gradient"
            style="--active-color: {steps[activeStep]?.color || steps[0].color}"
        ></div>
        <div class="bg-grid"></div>
    </div>

    <!-- Sticky container - this stays fixed while scrolling through the section -->
    <div class="sticky-wrapper">
        <div class="sticky-content">
            <!-- Left side: Phones that slide in/out -->
            <div class="phone-container">
                <div
                    class="phone-glow"
                    style="background: radial-gradient(ellipse at center, {steps[
                        activeStep
                    ]?.color || steps[0].color} 0%, transparent 70%);"
                ></div>

                <div class="phones-wrapper">
                    {#each steps as step, index}
                        <div
                            class="phone-slide"
                            style="
                transform: {getPhoneTransform(index)};
                opacity: {getPhoneOpacity(index)};
              "
                        >
                            <div class="phone-frame">
                                <img
                                    src={loadedStepImageSources[index] ?? undefined}
                                    sizes="(min-width: 1280px) 304px, (min-width: 1024px) 280px, 240px"
                                    alt="Paso {step.number}"
                                    class="phone-screenshot"
                                    loading={index === 0 ? "eager" : "lazy"}
                                    decoding="async"
                                    fetchpriority={index === 0 ? "high" : "low"}
                                    width="640"
                                    height="1390"
                                />
                                {#if activeStep === index &&
                                    stepImageLoadStates[index] !== "loaded" &&
                                    stepImageLoadStates[index] !== "error"}
                                    <div class="phone-loading-overlay">
                                        <div
                                            class="ios-spinner"
                                            role="status"
                                            aria-label="Cargando imagen"
                                        ></div>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>

                <!-- Step indicators -->
                <div class="step-dots">
                    {#each steps as step, index}
                        <button
                            class="step-dot"
                            class:active={activeStep === index}
                            style="--dot-color: {step.color}"
                            aria-label="Paso {index + 1}"
                        >
                            <span class="dot-inner"></span>
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Right side: Timeline steps -->
            <div class="content-container">
                <div class="section-header">
                    <span class="eyebrow">Cómo funciona</span>
                    <h2 class="headline">
                        Pedir nunca fue<br />
                        <span class="highlight">tan natural.</span>
                    </h2>
                </div>

                <div class="timeline">
                    <!-- Progress line -->
                    <div class="timeline-track">
                        <div
                            class="timeline-progress"
                            style="height: {getLineProgress()}%"
                        ></div>
                    </div>

                    <!-- Steps -->
                    {#each steps as step, index}
                        <div
                            class="timeline-step"
                            class:active={activeStep === index}
                            class:completed={index < activeStep}
                            style="--step-color: {step.color}"
                        >
                            <!-- Step indicator -->
                            <div class="step-indicator">
                                <span class="step-number">{step.number}</span>
                                <div class="indicator-glow"></div>
                            </div>

                            <!-- Step content -->
                            <div class="step-content">
                                <h3 class="step-title">
                                    {step.title}
                                    <span class="step-subtitle"
                                        >{step.subtitle}</span
                                    >
                                </h3>

                                <p class="step-description">
                                    {step.description}
                                </p>

                                <span class="step-badge">
                                    {step.highlight}
                                </span>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</section>

<style>
    .scrollytelling {
        position: relative;
        /* Height determines how much scroll is needed to go through all steps */
        height: 300vh;
        background: #000;
    }

    /* Background effects */
    .section-bg {
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
    }

    .bg-gradient {
        position: absolute;
        inset: 0;
        background: radial-gradient(
            ellipse 80% 60% at 30% 40%,
            color-mix(in srgb, var(--active-color) 15%, transparent) 0%,
            transparent 60%
        );
        transition: background 0.6s ease;
    }

    .bg-grid {
        position: absolute;
        inset: 0;
        background-image:
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.02) 1px,
                transparent 1px
            );
        background-size: 60px 60px;
        mask-image: radial-gradient(
            ellipse at 50% 50%,
            black 20%,
            transparent 70%
        );
    }

    /* Sticky wrapper - stays in view while scrolling */
    .sticky-wrapper {
        position: sticky;
        top: 0;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
    }

    .sticky-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 48px;
        width: 100%;
        max-width: 1200px;
        padding: 0 24px;
    }

    /* Phone container */
    .phone-container {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        overflow: hidden;
    }

    .phone-glow {
        position: absolute;
        inset: -80px;
        opacity: 0.3;
        filter: blur(60px);
        transition: background 0.6s ease;
        z-index: -1;
    }

    .phones-wrapper {
        position: relative;
        width: 240px;
        height: 500px;
    }

    .phone-slide {
        position: absolute;
        inset: 0;
        transition:
            transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 0.5s ease;
        will-change: transform, opacity;
    }

    .phone-frame {
        position: relative;
        --screen-inset: 3px;
        width: 100%;
        height: 100%;
        background: linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 50%, #000 100%);
        border-radius: 48px;
        padding: 3px;
        box-shadow:
      /* Outer shadows for depth */
            0 60px 120px -30px rgba(0, 0, 0, 0.8),
            0 40px 80px -20px rgba(0, 0, 0, 0.6),
            0 20px 40px -10px rgba(0, 0, 0, 0.4),
            /* Inner border highlight */ inset 0 0 0 1px
                rgba(255, 255, 255, 0.12),
            inset 0 1px 2px rgba(255, 255, 255, 0.15),
            /* Subtle outer glow */ 0 0 0 1px rgba(0, 0, 0, 0.5);
        transform-style: preserve-3d;
    }

    .phone-frame::before {
        content: "";
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

    .phone-screenshot {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 45px;
        object-fit: cover;
        display: block;
        z-index: 1;
    }

    .phone-loading-overlay {
        position: absolute;
        inset: var(--screen-inset);
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 45px;
        background:
            radial-gradient(
                circle at 30% 20%,
                rgba(255, 255, 255, 0.08) 0%,
                transparent 50%
            ),
            linear-gradient(180deg, rgba(12, 12, 12, 0.9), rgba(6, 6, 6, 0.95));
        pointer-events: none;
    }

    .ios-spinner {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2.5px solid rgba(255, 255, 255, 0.22);
        border-top-color: rgba(255, 255, 255, 0.95);
        animation: iosSpinner 0.75s linear infinite;
    }

    @keyframes iosSpinner {
        to {
            transform: rotate(360deg);
        }
    }

    /* Step dots */
    .step-dots {
        display: flex;
        gap: 12px;
    }

    .step-dot {
        width: 12px;
        height: 12px;
        padding: 0;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
    }

    .step-dot.active {
        background: var(--dot-color);
        transform: scale(1.2);
    }

    .step-dot.active::after {
        content: "";
        position: absolute;
        inset: -4px;
        border: 2px solid var(--dot-color);
        border-radius: 50%;
        opacity: 0.5;
        animation: dotPulse 2s ease-in-out infinite;
    }

    @keyframes dotPulse {
        0%,
        100% {
            transform: scale(1);
            opacity: 0.5;
        }
        50% {
            transform: scale(1.3);
            opacity: 0;
        }
    }

    .dot-inner {
        display: none;
    }

    /* Content container */
    .content-container {
        text-align: center;
        max-width: 500px;
    }

    .section-header {
        margin-bottom: 32px;
    }

    .eyebrow {
        display: inline-block;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: var(--color-secondary);
        margin-bottom: 12px;
    }

    .headline {
        font-size: clamp(1.75rem, 5vw, 2.5rem);
        font-weight: 700;
        letter-spacing: -0.03em;
        line-height: 1.1;
        color: #fff;
    }

    .highlight {
        background: linear-gradient(135deg, #e1c78e 0%, #b2d69a 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    /* Timeline */
    .timeline {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding-left: 48px;
    }

    .timeline-track {
        position: absolute;
        left: 16px;
        top: 8px;
        bottom: 8px;
        width: 2px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 1px;
        overflow: hidden;
    }

    .timeline-progress {
        width: 100%;
        background: linear-gradient(
            180deg,
            #e1c78e 0%,
            #b2d69a 50%,
            #5a8467 100%
        );
        border-radius: 1px;
        transition: height 0.3s ease-out;
    }

    /* Timeline step */
    .timeline-step {
        position: relative;
        display: flex;
        gap: 16px;
        opacity: 0.4;
        transform: translateX(0);
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .timeline-step.completed {
        opacity: 0.6;
    }

    .timeline-step.active {
        opacity: 1;
        transform: translateX(8px);
    }

    /* Step indicator */
    .step-indicator {
        position: absolute;
        left: -48px;
        top: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(255, 255, 255, 0.15);
        border-radius: 50%;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .timeline-step.completed .step-indicator {
        background: color-mix(in srgb, var(--step-color) 20%, transparent);
        border-color: var(--step-color);
    }

    .timeline-step.active .step-indicator {
        background: var(--step-color);
        border-color: var(--step-color);
        transform: scale(1.15);
        box-shadow: 0 0 20px
            color-mix(in srgb, var(--step-color) 50%, transparent);
    }

    .step-number {
        font-size: 11px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.5);
        letter-spacing: 0.05em;
        transition: color 0.4s ease;
    }

    .timeline-step.completed .step-number {
        color: var(--step-color);
    }

    .timeline-step.active .step-number {
        color: #000;
    }

    .indicator-glow {
        position: absolute;
        inset: -8px;
        border-radius: 50%;
        background: var(--step-color);
        opacity: 0;
        filter: blur(12px);
        transition: opacity 0.4s ease;
    }

    .timeline-step.active .indicator-glow {
        opacity: 0.4;
        animation: glowPulse 2s ease-in-out infinite;
    }

    @keyframes glowPulse {
        0%,
        100% {
            opacity: 0.4;
            transform: scale(1);
        }
        50% {
            opacity: 0.2;
            transform: scale(1.2);
        }
    }

    /* Step content */
    .step-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        text-align: left;
        padding-bottom: 8px;
    }

    .step-title {
        font-size: clamp(1.1rem, 3vw, 1.4rem);
        font-weight: 700;
        color: rgba(255, 255, 255, 0.6);
        letter-spacing: -0.02em;
        line-height: 1.2;
        transition: color 0.4s ease;
    }

    .timeline-step.active .step-title {
        color: #fff;
    }

    .step-subtitle {
        display: block;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.3);
        transition: color 0.4s ease;
    }

    .timeline-step.active .step-subtitle {
        color: rgba(255, 255, 255, 0.5);
    }

    .step-description {
        font-size: 14px;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.3);
        max-width: 320px;
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .timeline-step.active .step-description {
        max-height: 100px;
        opacity: 1;
        color: rgba(255, 255, 255, 0.6);
    }

    .step-badge {
        display: inline-flex;
        align-self: flex-start;
        padding: 4px 12px;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 100px;
        font-size: 10px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.3);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0;
        transform: translateY(-8px);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        transition-delay: 0.1s;
    }

    .timeline-step.active .step-badge {
        opacity: 1;
        transform: translateY(0);
        background: color-mix(in srgb, var(--step-color) 15%, transparent);
        border-color: color-mix(in srgb, var(--step-color) 30%, transparent);
        color: var(--step-color);
    }

    /* Desktop layout */
    @media (min-width: 1024px) {
        .sticky-content {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 80px;
            padding: 0 60px;
        }

        .phone-container {
            flex-shrink: 0;
        }

        .phones-wrapper {
            width: 280px;
            height: 600px;
        }

        .content-container {
            text-align: left;
            max-width: 500px;
        }

        .section-header {
            margin-bottom: 40px;
        }

        .headline {
            font-size: clamp(2rem, 4vw, 3rem);
        }

        .timeline {
            gap: 28px;
            padding-left: 56px;
        }

        .timeline-track {
            left: 18px;
        }

        .step-indicator {
            left: -56px;
            width: 36px;
            height: 36px;
        }

        .step-number {
            font-size: 12px;
        }

        .step-title {
            font-size: clamp(1.2rem, 2.5vw, 1.5rem);
        }

        .step-description {
            font-size: 15px;
            max-width: 380px;
        }

        .step-dots {
            position: absolute;
            bottom: -40px;
            left: 50%;
            transform: translateX(-50%);
        }
    }

    @media (min-width: 1280px) {
        .phones-wrapper {
            width: 304px;
            height: 660px;
        }

        .phone-frame {
            --screen-inset: 4px;
            padding: 4px;
        }

        .sticky-content {
            gap: 120px;
        }

        .timeline {
            gap: 32px;
        }
    }

    @media (max-width: 768px), (prefers-reduced-motion: reduce) {
        .scrollytelling {
            height: auto;
            min-height: 100vh;
        }

        .section-bg {
            position: absolute;
        }

        .sticky-wrapper {
            position: relative;
            height: auto;
            min-height: 100vh;
            padding: 88px 0 72px;
        }

        .phone-glow {
            filter: blur(24px);
            opacity: 0.2;
        }

        .phone-slide {
            transition: none;
        }

        .timeline-step,
        .timeline-step.active {
            transform: none;
        }

        .indicator-glow {
            filter: none;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .bg-gradient,
        .timeline-progress,
        .timeline-step,
        .step-indicator,
        .step-title,
        .step-subtitle,
        .step-description,
        .step-badge,
        .phone-slide {
            transition: none !important;
        }

        .step-dot.active::after,
        .timeline-step.active .indicator-glow {
            animation: none !important;
        }
    }
</style>
