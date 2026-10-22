<script lang="ts">
  import { ANDROID_DOWNLOAD_PATH, APP_STORE_URL } from '@/lib/site';

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Categorías', href: '/#categorias' },
      { name: 'Cómo funciona', href: '/#como-funciona' },
      { name: 'Llegó+', href: '/plus' },
      { name: 'Descargar la app', href: '/#descargar' },
      { name: 'Negocios y mensajeros', href: '/negocios' }
    ],
    support: [
      { name: 'Centro de ayuda', href: '/soporte' },
      { name: 'Contacto', href: '/soporte#contacto' },
      { name: 'Términos de uso', href: '/terminos' },
      { name: 'Política de privacidad', href: '/privacidad' },
      { name: 'Eliminar mi cuenta', href: '/eliminar-cuenta' }
    ]
  };
</script>

<footer class="footer">
  <div class="container">
    <div class="footer-main">
      <div class="footer-brand">
        <p class="footer-tagline">
          Todo tipo de negocios, cerca de ti o fuera de tu municipio. Pide desde Cuba o paga desde el exterior.
        </p>
        <div class="app-badges">
          <a href={APP_STORE_URL} class="ticket ticket--paper">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <span class="ticket-label">
              <span class="ticket-small">Descargar en</span>
              <span class="ticket-big">App Store</span>
            </span>
          </a>
          <a href={ANDROID_DOWNLOAD_PATH} class="ticket ticket--paper">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 9.99l-2.302 2.302-8.634-8.634z"/>
            </svg>
            <span class="ticket-label">
              <span class="ticket-small">Descargar</span>
              <span class="ticket-big">Android APK</span>
            </span>
          </a>
        </div>
      </div>

      <nav class="footer-links" aria-label="Pie de página">
        <div class="links-column">
          <h2 class="column-title">Producto</h2>
          <ul class="links-list">
            {#each footerLinks.product as link}
              <li><a href={link.href} class="footer-link">{link.name}</a></li>
            {/each}
          </ul>
        </div>

        <div class="links-column">
          <h2 class="column-title">Soporte</h2>
          <ul class="links-list">
            {#each footerLinks.support as link}
              <li><a href={link.href} class="footer-link">{link.name}</a></li>
            {/each}
          </ul>
        </div>
      </nav>
    </div>

    <p class="footer-wordmark" aria-hidden="true">Llegó</p>

    <div class="footer-bottom">
      <p class="copyright">&copy; {currentYear} Llegó. Todos los derechos reservados.</p>
      <img src="/img/isotipo.svg" width="320" height="212" alt="" class="footer-box" loading="lazy" decoding="async" />
    </div>
  </div>
</footer>

<style>
  .footer {
    position: relative;
    background: var(--ink-teal);
    color: var(--paper);
    padding: clamp(64px, 9vw, 112px) 0 32px;
    overflow: hidden;
  }

  .footer-main {
    display: grid;
    grid-template-columns: 1fr;
    gap: 48px;
  }

  .footer-tagline {
    max-width: 34ch;
    font-size: 18px;
    line-height: 1.5;
    font-weight: 500;
    margin-bottom: 28px;
  }

  .app-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .footer-links {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 32px;
  }

  .column-title {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: var(--ink-sun);
    margin-bottom: 12px;
  }

  .links-list {
    display: flex;
    flex-direction: column;
  }

  .footer-link {
    display: inline-block;
    padding: 7px 0;
    font-size: 15px;
    font-weight: 500;
    color: var(--paper);
    text-decoration: underline;
    text-decoration-color: transparent;
    text-underline-offset: 4px;
    text-decoration-thickness: 2px;
    transition: text-decoration-color 0.2s ease;
  }

  .footer-link:hover {
    text-decoration-color: var(--ink-sun);
  }

  /* La firma: LLEGÓ impreso a todo el ancho, en tinta sol sobre el teal */
  .footer-wordmark {
    margin: 88px 0 0;
    font-family: var(--font-display);
    font-weight: 900;
    text-transform: uppercase;
    font-size: clamp(120px, 30vw, 400px);
    line-height: 0.78;
    letter-spacing: -0.02em;
    color: var(--ink-sun);
    user-select: none;
  }

  .footer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-top: 24px;
    border-top: 2px solid rgba(255, 247, 230, 0.35);
  }

  .copyright {
    font-size: 14px;
    color: var(--paper);
  }

  .footer-box {
    width: 56px;
    height: auto;
  }

  @media (min-width: 768px) {
    .footer-main {
      grid-template-columns: 1.1fr 1fr;
      align-items: start;
    }
  }
</style>
