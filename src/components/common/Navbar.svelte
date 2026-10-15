<script lang="ts">
    import { onMount } from "svelte";

    let isScrolled = $state(false);
    let isMobileMenuOpen = $state(false);

    const links = [
        { href: "/#categorias", label: "Categorías" },
        { href: "/#como-funciona", label: "Cómo funciona" },
        { href: "/plus", label: "Llegó+" },
        { href: "/negocios", label: "Negocios y mensajeros" },
    ];

    onMount(() => {
        const handleScroll = () => {
            isScrolled = window.scrollY > 8;
        };

        const handleKeydown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isMobileMenuOpen) closeMobileMenu();
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("keydown", handleKeydown);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("keydown", handleKeydown);
            document.body.style.overflow = "";
        };
    });

    function toggleMobileMenu() {
        isMobileMenuOpen = !isMobileMenuOpen;
        document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    }

    function closeMobileMenu() {
        isMobileMenuOpen = false;
        document.body.style.overflow = "";
    }
</script>

<header class="navbar" class:scrolled={isScrolled} class:menu-open={isMobileMenuOpen}>
    <nav class="navbar-container" aria-label="Principal">
        <a href="/" class="logo" aria-label="Llegó, ir al inicio" onclick={closeMobileMenu}>
            <img
                src="/img/logo-caja-320.webp"
                width="320"
                height="210"
                alt=""
                class="logo-icon"
                decoding="async"
            />
            <span class="logo-text">Llegó</span>
        </a>

        <div class="nav-links" id="nav-links" class:open={isMobileMenuOpen}>
            {#each links as link (link.href)}
                <a href={link.href} class="nav-link" onclick={closeMobileMenu}>{link.label}</a>
            {/each}
            <a href="/#descargar" class="ticket nav-cta" onclick={closeMobileMenu}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 3v12" />
                    <path d="m7 10 5 5 5-5" />
                    <path d="M5 21h14" />
                </svg>
                <span>Descargar</span>
            </a>
        </div>

        <button
            class="mobile-menu-btn"
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="nav-links"
            onclick={toggleMobileMenu}
        >
            <span class="hamburger" class:open={isMobileMenuOpen}></span>
        </button>
    </nav>
</header>

<style>
    .navbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: var(--z-navbar);
        background: var(--paper);
        box-shadow: 0 1px 0 transparent;
        transition: box-shadow 0.3s ease;
    }

    .navbar.scrolled {
        box-shadow: 0 2px 0 var(--ink);
    }

    .navbar-container {
        max-width: 1240px;
        margin: 0 auto;
        padding: 10px var(--gutter);
        min-height: 68px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 2;
        color: var(--ink);
    }

    .logo-icon {
        width: 50px;
        height: auto;
        transition: transform 0.4s var(--ease-out);
    }

    .logo:hover .logo-icon {
        transform: translateX(4px);
    }

    .logo-text {
        font-family: var(--font-display);
        font-size: 30px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.01em;
        line-height: 1;
    }

    .nav-links {
        display: flex;
        align-items: center;
        gap: 28px;
    }

    .nav-link {
        position: relative;
        padding: 10px 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--ink);
    }

    .nav-link::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 4px;
        height: 4px;
        background: var(--ink-orange);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.35s var(--ease-out);
    }

    .nav-link:hover::after {
        transform: scaleX(1);
    }

    .nav-cta {
        min-height: 44px;
        padding: 8px 20px 8px 18px;
        font-family: var(--font-display);
        font-size: 18px;
        text-transform: uppercase;
        letter-spacing: 0.02em;
    }

    .mobile-menu-btn {
        display: none;
        width: 48px;
        height: 48px;
        align-items: center;
        justify-content: center;
        z-index: 2;
        margin-right: -10px;
    }

    .hamburger,
    .hamburger::before,
    .hamburger::after {
        width: 26px;
        height: 3px;
        background: var(--ink);
        transition: transform 0.3s var(--ease-out), background-color 0.2s ease;
    }

    .hamburger {
        position: relative;
    }

    .hamburger::before,
    .hamburger::after {
        content: "";
        position: absolute;
        left: 0;
    }

    .hamburger::before {
        top: -8px;
    }

    .hamburger::after {
        top: 8px;
    }

    .hamburger.open {
        background: transparent;
    }

    .hamburger.open::before {
        transform: translateY(8px) rotate(45deg);
    }

    .hamburger.open::after {
        transform: translateY(-8px) rotate(-45deg);
    }

    @media (max-width: 900px) {
        .mobile-menu-btn {
            display: flex;
        }

        .navbar.menu-open {
            background: var(--ink-orange);
        }

        /* Menú a pantalla completa: un cartel naranja con los enlaces en grande */
        .nav-links {
            position: fixed;
            inset: 0;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            gap: 4px;
            padding: 96px var(--gutter) 48px;
            overflow: hidden;
            background: var(--ink-orange);
            visibility: hidden;
            clip-path: inset(0 0 100% 0);
            transition:
                clip-path 0.5s var(--ease-out),
                visibility 0s linear 0.5s;
        }

        .nav-links.open {
            visibility: visible;
            clip-path: inset(0 0 0 0);
            transition:
                clip-path 0.5s var(--ease-out),
                visibility 0s;
        }

        .nav-link {
            font-family: var(--font-display);
            font-size: clamp(36px, 10vw, 64px);
            max-width: 100%;
            font-weight: 800;
            text-transform: uppercase;
            line-height: 1;
            padding: 6px 0;
        }

        .nav-link::after {
            display: none;
        }

        .nav-cta {
            margin-top: 28px;
            min-height: 56px;
            font-size: 24px;
            padding: 10px 28px 10px 24px;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .nav-links,
        .nav-links.open,
        .hamburger,
        .hamburger::before,
        .hamburger::after,
        .logo-icon {
            transition: none;
        }
    }
</style>
