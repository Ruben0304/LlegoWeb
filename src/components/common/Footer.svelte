<script lang="ts">
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Categorías', href: '/#categorias' },
      { name: 'Cómo funciona', href: '/#como-funciona' },
      { name: 'Llegó+', href: '/plus' },
      { name: 'Descargar App', href: '/#descargar' },
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
  <div class="footer-bg">
    <div class="bg-gradient"></div>
    <div class="bg-grid"></div>
  </div>

  <div class="container">
    <!-- Main footer content -->
    <div class="footer-main">
      <div class="footer-brand">
        <a href="/" class="footer-logo">
          <span class="logo-text">Llegó</span>
        </a>
        <p class="footer-tagline">
          Compras inteligentes con IA. Encuentra, compara y compra en segundos.
        </p>
        <div class="app-badges">
          <a href="https://apps.apple.com/us/app/llego/id6755007388" class="app-badge">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <span>App Store</span>
          </a>
          <a href="/api/download/android" class="app-badge">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 9.99l-2.302 2.302-8.634-8.634z"/>
            </svg>
            <span>Android APK</span>
          </a>
        </div>
      </div>

      <div class="footer-links">
        <div class="links-column">
          <h4 class="column-title">Producto</h4>
          <ul class="links-list">
            {#each footerLinks.product as link}
              <li><a href={link.href} class="footer-link">{link.name}</a></li>
            {/each}
          </ul>
        </div>

        <div class="links-column">
          <h4 class="column-title">Soporte</h4>
          <ul class="links-list">
            {#each footerLinks.support as link}
              <li><a href={link.href} class="footer-link">{link.name}</a></li>
            {/each}
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="footer-bottom">
      <p class="copyright">
        &copy; {currentYear} Llegó. Todos los derechos reservados.
      </p>
    </div>
  </div>
</footer>

<style>
  .footer {
    position: relative;
    background: #050505;
    padding: 100px 0 40px;
    overflow: hidden;
  }

  .footer-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .bg-gradient {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  }

  .bg-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse at center top, black 0%, transparent 50%);
  }

  .container {
    position: relative;
    z-index: 2;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* Main content */
  .footer-main {
    display: grid;
    grid-template-columns: 1fr;
    gap: 60px;
    margin-bottom: 60px;
  }

  .footer-brand {
    max-width: 320px;
  }

  .footer-logo {
    display: inline-block;
    margin-bottom: 20px;
  }

  .logo-text {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .footer-tagline {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.6;
    margin-bottom: 28px;
  }

  .app-badges {
    display: flex;
    gap: 12px;
  }

  .app-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .app-badge:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  /* Links */
  .footer-links {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
  }

  .column-title {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 20px;
  }

  .links-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .footer-link {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    transition: color 0.3s ease;
  }

  .footer-link:hover {
    color: #fff;
  }

  /* Bottom bar */
  .footer-bottom {
    display: flex;
    justify-content: center;
    padding-top: 40px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .copyright {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.3);
    text-align: center;
  }

  /* Responsive */
  @media (min-width: 768px) {
    .footer-main {
      grid-template-columns: 1.2fr 2fr;
    }
  }

  @media (min-width: 1024px) {
    .footer {
      padding: 120px 0 50px;
    }
  }
</style>
