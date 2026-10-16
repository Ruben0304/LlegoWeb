# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands are run from the root of the project:

- `npm run dev` - Start development server at localhost:4321
- `npm run build` - Build production site to ./dist/
- `npm run preview` - Preview production build locally
- `npm run astro ...` - Run Astro CLI commands (e.g., `npm run astro add`, `npm run astro check`)

## Project Overview

This is a marketing website for **Llegó**, a Spanish-language shopping app with AI capabilities. Built with Astro and Svelte.

## Architecture

### Tech Stack
- **Astro 5**: Static site generator and framework
- **Svelte 5**: Component framework (using modern `$state` and `$derived` runes)
- **TypeScript**: Type safety with strict config

### Project Structure

```
src/
├── pages/                    # Route files (file-based routing)
│   ├── index.astro           # Homepage
│   ├── plus.astro            # Llegó+ ("Próximamente")
│   ├── negocios.astro        # Registro de socios: solicitud para vender o ser mensajero (noindex)
│   ├── privacidad.astro      # Política de privacidad (fuente única, enlazada desde las apps)
│   ├── terminos.astro        # Términos y condiciones (fuente única, enlazada desde las apps)
│   ├── soporte.astro         # Centro de soporte / FAQ
│   ├── eliminar-cuenta.astro # Cómo eliminar la cuenta desde cada app o por correo
│   ├── tutoriales.astro      # Panel admin de tutoriales (con login Google/Apple, noindex)
│   ├── business-types.astro  # Panel admin de tipos de negocio (noindex)
│   ├── 404.astro             # Página no encontrada (noindex)
│   ├── robots.txt.ts         # robots.txt (prerenderizado, desde lib/seo.ts)
│   ├── sitemap.xml.ts        # Sitemap con las páginas públicas (prerenderizado, desde lib/seo.ts)
│   ├── auth/callback.astro   # Callback OAuth: guarda el JWT, lo quita de la URL y vuelve a returnTo
│   └── api/                  # Endpoints (proxy GraphQL con lista blanca, login social, descarga APK)
├── layouts/
│   ├── Layout.astro          # Main layout wrapper with SEO metadata
│   └── LegalLayout.astro     # Páginas legales/soporte: Navbar + Footer y columna de lectura
├── components/               # Svelte components organized by screen
│   ├── common/               # Navbar, Footer, ComingSoon, PrintTitle (titular a dos tintas), StoreTickets (descargas)
│   ├── home/                 # Home en Astro sin JS: Hero, Cartelera, TiraPelicula, DosOrillas, Ecosistema, Cierre
│   ├── tutoriales/           # Panel admin de tutoriales (TutorialPanel, TutorialForm, ...)
│   ├── negocios/             # Registro de socios (PartnerSignup, PartnerForm)
│   └── business-types/       # Panel admin de tipos de negocio
├── lib/                      # Business logic organized by feature
│   ├── shared/               # Cliente GraphQL; backend-proxy.ts (solo servidor) y lista blanca del proxy
│   ├── site.ts               # Correo/WhatsApp de soporte, tiempo de respuesta, URL pública, tiendas
│   ├── seo.ts                # Páginas del sitemap y rutas bloqueadas en robots.txt
│   ├── auth/                 # Login social (Google/Apple); session.ts = sesión en el navegador
│   ├── partner/              # Registro de socios (myPartnerAccess, submitPartnerRequest, teléfono)
│   ├── business-type/        # Business types feature
│   └── tutorial/             # Tutorials feature
└── styles/
    ├── global.css            # CSS custom properties and global styles
    └── legal.css             # Estilos del texto de las páginas legales
```

**Import aliases configured:**
- `@/*` maps to `src/*` for clean imports

### Key Architectural Patterns

#### 1. Layout System
All pages use [Layout.astro](src/layouts/Layout.astro) which handles:
- SEO metadata (title, description, keywords, OG tags)
- Structured data (JSON-LD)
- Global CSS import and the self-hosted fonts (Big Shoulders Display, Figtree)
- `theme` prop: `"paper"` (default) or `"ink"` for the admin panels
- The script that settles `.print` titles into register when they scroll into view

Pages pass props to Layout:
```astro
<Layout title={title} description={description} keywords={keywords}>
```

#### 2. Component Hydration Strategy
Astro components use client directives to control JavaScript hydration:
- `client:load` - Interactive components (Navbar, PartnerSignup, admin panels)
- Static sections (home, Footer) render on the server with no client JS

This minimizes initial JavaScript load.

#### 3. Design system ("carteles serigrafiados")
The full system is in [DESIGN.md](DESIGN.md); product facts in [PRODUCT.md](PRODUCT.md). In short:
- Paper ground (`--paper`) and the logo's flat inks in fields that own whole sections: `--ink-teal`, `--ink-orange`, `--ink-green`, `--ink-sun`; text in `--ink` (deep teal). Tokens live in [global.css](src/styles/global.css); older role names (`--color-text`, `--color-background`, ...) are aliases.
- Headlines: `PrintTitle.astro` (Big Shoulders Display, uppercase) with a second ink offset via `text-shadow` that settles into register on scroll. Body: Figtree.
- Actions are cinema tickets (`.ticket`, notched stub); downloads always go through `StoreTickets.astro`.
- Contrast: orange and sun fields take `--ink` text; teal fields take `--paper`. Never orange or sun text on paper.
- No gradient text, no eyebrow labels above headings, no emoji icons (two-ink SVG), no glass. Mobile and `prefers-reduced-motion` show the same content.
- `/tutoriales` and `/business-types` render with `data-theme="ink"` (dark teal); they only borrow type and palette.
- Check changes with `.claude/skills/impeccable/scripts/impeccable detect --json src` (or a URL; set `IMPECCABLE_BROWSER` to a Chromium binary). `cream-palette` is expected: the cream is the logo's.

#### 4. Svelte 5 Reactivity
Components use Svelte 5's runes syntax:
- `$state(value)` for reactive state
- `$derived(expression)` for computed values
- Standard `onMount()` lifecycle

Example from [Navbar.svelte](src/components/common/Navbar.svelte):
```ts
let isScrolled = $state(false);
let isMobileMenuOpen = $state(false);
```

#### 5. Component Organization
Components are organized by screen/feature for better maintainability:

**Importing components:**
```astro
---
// From index files (recommended)
import { Navbar, Footer } from '@/components/common';
import { Hero, Cartelera } from '@/components/home';

// Or individual imports
import Hero from '@/components/home/Hero.astro';
---
```

**Component folders:**
- `common/` - Shared components (Navbar, Footer, ComingSoon)
- `home/` - Homepage sections as Astro components with no client JS (Hero, Cartelera, TiraPelicula, DosOrillas, Ecosistema, Cierre)
- `tutoriales/` - Admin tutorials panel (TutorialPanel, TutorialForm, TutorialList, uploaders)
- `negocios/` - Registro de socios en /negocios (PartnerSignup: elegir tipo, login, formulario y estado; PartnerForm)
- `business-types/` - Admin business types panel

**Legal / contact data:** the support email, WhatsApp, response time, public site URL, store links (`APP_STORE_URL`, `ANDROID_DOWNLOAD_PATH`) and the partner apps (`PARTNER_APPS`, names and download links shown to approved partners) live in `src/lib/site.ts`. The apps link to `/privacidad` and `/terminos` on this site, so change texts here (not in the backend). The App Store link is not read from the backend's `appConfig.ios.storeUrl` (in production it holds a placeholder ID).

**SEO:** `SITE_URL` is also `site` in `astro.config.mjs`; `Layout.astro` builds canonical, `og:url` and `og:image` as absolute URLs on it (default image `public/og-image.jpg`, 1200x630). Pages with a user session or admin panels pass `noindex`. The sitemap and robots.txt lists live in `src/lib/seo.ts`.

#### 6. GraphQL & Backend Integration
Backend communication uses GraphQL with `graphql-request` client.

**Environment variables** (see `.env.example`; `.env` is not committed):
- `BACKEND_URL` - Backend **base** URL without `/graphql` (private, server-only). Railway private network: `http://<service>.railway.internal:<PORT>` (http and port), or the public backend URL.
- `WEB_PROXY_SECRET` - Server-only. Same value as the backend's `WEB_PROXY_SECRET`: server-side calls to the backend (`/api/auth/*`, `/api/download/android`) forward the visitor IP with it so the backend rate limit counts per visitor (`src/lib/shared/backend-proxy.ts`). Never import that module from client code.
- `PUBLIC_BACKEND_URL` - Public backend URL used by the browser.
- `PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client of type **Web application** (not the iOS one).

**No GraphQL proxy:** the browser calls `PUBLIC_BACKEND_URL` directly. The old `/api/graphql` proxy was removed because nothing used it.

**Feature-based organization:**
Each feature in `src/lib/` contains:
- `types.ts` - TypeScript interfaces and enums
- `queries.ts` - GraphQL queries (using gql template tag)
- `mutations.ts` - GraphQL mutations (using gql template tag)
- `index.ts` - Helper functions and exports

**Example usage:**
```astro
---
import { getTutorials } from '@/lib/tutorial';

// Server-side data fetching (the admin panels call it from the browser with the user's JWT)
const tutorials = await getTutorials(jwt);
---
```

**GraphQL client location:**
- Main client: `src/lib/shared/graphql.ts`
- See `src/lib/README.md` for detailed documentation

#### 7. Motion
- `.print` titles: the second ink starts offset and settles into register when the title enters the viewport (script in `Layout.astro`); already settled without JS or with reduced motion.
- The hero box slides in once on load; the mobile menu opens as a full orange poster (`clip-path`).

#### 8. Language & Content
- All content is in **Spanish** (ES)
- HTML lang="es" and locale="es_ES" set in Layout
- SEO optimized for Spanish-speaking markets

## Development Notes

- Light paper theme with the logo's inks (see DESIGN.md); admin panels use the dark `ink` theme
- Responsive breakpoints: 900px (two-column sections), 1024px (desktop hero)
- Image assets are in `/public/img/`; `logo-caja-*.webp` are crops of `icon.png`. Rasters carry their origin (`impeccable embed-prompt --scan public/img`)
- Theme color is `#fff7e6` (paper)

## Contrato GraphQL con el backend (CI)

Las operaciones GraphQL de la web son texto: si el backend renombra o quita un campo, o si
la app pide uno que no existe, el compilador no se entera y falla en el dispositivo del
usuario. Por eso el CI valida las operaciones contra el schema **real de producción**.

- **Qué comprueba.** `scripts/ci/validate_graphql_contract.py` descarga por introspección el
  schema de `https://llegobackend-production.up.railway.app/graphql` y valida todas las
  operaciones del repo:
  - las plantillas ``gql`...` `` de `src/lib/**` (auth, partner, tutorial, business-type) y de los componentes Svelte.

  Termina con código 1 si alguna es inválida e indica operación, archivo, línea y motivo.
- **Cuándo corre.** `.github/workflows/graphql-contract.yml`: en cada push a `main`, en cada
  pull request y a diario (el backend puede cambiar sin que haya commits aquí). Solo usa
  `ubuntu-latest`: no compila la app ni usa runners de macOS. Además, `.github/workflows/build.yml` ejecuta `npm ci && npm run build` en cada push a `main` y en cada pull request.
- **En local** (hace falta Python 3.9+ y red):

  ```bash
  python3 -m pip install "graphql-core>=3.2,<3.3"
  python3 scripts/ci/validate_graphql_contract.py                  # contra producción
  LLEGO_GRAPHQL_URL=http://localhost:8000/graphql \
    python3 scripts/ci/validate_graphql_contract.py                # contra un backend local
  python3 scripts/ci/validate_graphql_contract.py --schema-file /ruta/a/schema.graphql  # sin red
  ```

  `-v` lista cada operación válida y `--strict` cuenta como error las operaciones que no se
  pueden validar (las que se arman en tiempo de ejecución con interpolación, que se avisan
  como "No validadas"). En el workflow, la variable de repositorio `LLEGO_GRAPHQL_URL`
  (opcional) cambia el endpoint.
- **Si falla.** `Cannot query field "x" on type "Y"` significa que producción no tiene ese
  campo: o es nuevo y el backend aún no se ha desplegado (no publiques esta app hasta que
  lo esté), o está mal escrito o ya se retiró (corrige la operación). Si falla en el
  workflow diario sin cambios aquí, el backend cambió algo que esta app usa: avisa al equipo
  del backend antes de que lo noten los usuarios.
- El script es idéntico en todos los repos cliente (iOS, Android, Business, Mensajeros, web
  y panel admin); si lo modificas, cópialo a los demás.
