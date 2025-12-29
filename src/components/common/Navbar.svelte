<script lang="ts">
  import { onMount } from 'svelte';

  let isScrolled = $state(false);
  let isMobileMenuOpen = $state(false);

  onMount(() => {
    const handleScroll = () => {
      isScrolled = window.scrollY > 50;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });

  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
  }

  function closeMobileMenu() {
    isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }
</script>

<nav class="navbar" class:scrolled={isScrolled}>
  <div class="navbar-container">
    <a href="/" class="logo" aria-label="Llegó - Inicio">
      <img src="/icon.png" alt="Llegó" class="logo-icon" />
      <span class="logo-text">Llegó</span>
    </a>

    <div class="nav-links" class:open={isMobileMenuOpen}>
      <a href="/#categorias" class="nav-link" onclick={closeMobileMenu}>Categorías</a>
      <a href="/#como-funciona" class="nav-link" onclick={closeMobileMenu}>Cómo funciona</a>
      <a href="/plus" class="nav-link" onclick={closeMobileMenu}>Llegó+</a>
      <a href="/negocios" class="nav-link" onclick={closeMobileMenu}>Negocios</a>
      <a href="/#descargar" class="nav-cta" onclick={closeMobileMenu}>
        <span>Descargar</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </a>
    </div>

    <button
      class="mobile-menu-btn"
      aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
      aria-expanded={isMobileMenuOpen}
      onclick={toggleMobileMenu}
    >
      <span class="hamburger" class:open={isMobileMenuOpen}></span>
    </button>
  </div>
</nav>

{#if isMobileMenuOpen}
  <div class="mobile-overlay" onclick={closeMobileMenu} role="button" tabindex="-1"></div>
{/if}

<style>
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: var(--z-navbar);
    padding: 16px 0;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    background: transparent;
  }

  .navbar.scrolled {
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 12px 0;
  }

  .navbar-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 10;
  }

  .logo-icon {
    width: 36px;
    height: 36px;
    object-fit: contain;
    transition: transform 0.3s ease;
  }

  .logo:hover .logo-icon {
    transform: scale(1.05);
  }

  .logo-text {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 36px;
  }

  .nav-link {
    position: relative;
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
    transition: color 0.3s ease;
    letter-spacing: -0.01em;
  }

  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 1px;
    background: linear-gradient(90deg, var(--color-secondary), var(--color-button));
    transition: width 0.3s ease;
  }

  .nav-link:hover {
    color: #fff;
  }

  .nav-link:hover::after {
    width: 100%;
  }

  .nav-cta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #000;
    background: #fff;
    padding: 10px 20px;
    border-radius: 100px;
    transition: all 0.3s ease;
  }

  .nav-cta:hover {
    background: var(--color-secondary);
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(225, 199, 142, 0.3);
  }

  .nav-cta svg {
    transition: transform 0.3s ease;
  }

  .nav-cta:hover svg {
    transform: translateY(2px);
  }

  .mobile-menu-btn {
    display: none;
    width: 44px;
    height: 44px;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    z-index: 10;
  }

  .hamburger {
    position: relative;
    width: 22px;
    height: 2px;
    background: #fff;
    transition: all 0.3s ease;
  }

  .hamburger::before,
  .hamburger::after {
    content: '';
    position: absolute;
    left: 0;
    width: 22px;
    height: 2px;
    background: #fff;
    transition: all 0.3s ease;
  }

  .hamburger::before {
    top: -7px;
  }

  .hamburger::after {
    top: 7px;
  }

  .hamburger.open {
    background: transparent;
  }

  .hamburger.open::before {
    transform: translateY(7px) rotate(45deg);
  }

  .hamburger.open::after {
    transform: translateY(-7px) rotate(-45deg);
  }

  .mobile-overlay {
    display: none;
  }

  @media (max-width: 768px) {
    .mobile-menu-btn {
      display: flex;
    }

    .nav-links {
      position: fixed;
      top: 0;
      right: -100%;
      width: 100%;
      height: 100vh;
      background: linear-gradient(180deg, #0a0a0a 0%, #111 100%);
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 32px;
      transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .nav-links.open {
      right: 0;
    }

    .nav-link {
      font-size: 24px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.8);
    }

    .nav-link:hover {
      color: #fff;
    }

    .nav-link::after {
      display: none;
    }

    .nav-cta {
      font-size: 18px;
      padding: 16px 40px;
      margin-top: 16px;
    }

    .mobile-overlay {
      display: block;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: calc(var(--z-navbar) - 1);
      backdrop-filter: blur(4px);
    }
  }
</style>
