<script lang="ts">
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Categorías', href: '/#categorias' },
      { name: 'Cómo funciona', href: '/#como-funciona' },
      { name: 'Llegó+', href: '/plus' },
      { name: 'Descargar App', href: '/#descargar' }
    ],
    company: [
      { name: 'Acerca de', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Empleos', href: '#' },
      { name: 'Prensa', href: '#' }
    ],
    support: [
      { name: 'Centro de ayuda', href: '#' },
      { name: 'Contacto', href: '#' },
      { name: 'Términos de uso', href: '#' },
      { name: 'Privacidad', href: '#' }
    ]
  };

  const socialLinks = [
    { name: 'Instagram', href: '#', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>` },
    { name: 'Twitter', href: '#', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>` },
    { name: 'Facebook', href: '#', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>` },
    { name: 'LinkedIn', href: '#', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>` }
  ];
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
          <a href="#" class="app-badge">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <span>App Store</span>
          </a>
          <a href="#" class="app-badge">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 9.99l-2.302 2.302-8.634-8.634z"/>
            </svg>
            <span>Google Play</span>
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
          <h4 class="column-title">Empresa</h4>
          <ul class="links-list">
            {#each footerLinks.company as link}
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
      <div class="social-links">
        {#each socialLinks as social}
          <a href={social.href} class="social-link" aria-label={social.name}>
            {@html social.icon}
          </a>
        {/each}
      </div>

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
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding-top: 40px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .social-links {
    display: flex;
    gap: 8px;
  }

  .social-link {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.3s ease;
  }

  .social-link:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.15);
    color: #fff;
    transform: translateY(-2px);
  }

  .copyright {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.3);
    text-align: center;
  }

  /* Responsive */
  @media (min-width: 640px) {
    .footer-links {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (min-width: 768px) {
    .footer-main {
      grid-template-columns: 1.2fr 2fr;
    }

    .footer-bottom {
      flex-direction: row;
      justify-content: space-between;
    }
  }

  @media (min-width: 1024px) {
    .footer {
      padding: 120px 0 50px;
    }
  }
</style>
