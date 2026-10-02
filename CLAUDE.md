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
│   ├── tutoriales.astro      # Panel admin de tutoriales (con login Google/Apple)
│   ├── business-types.astro  # Panel admin de tipos de negocio
│   ├── auth/callback.astro   # Callback OAuth: guarda el JWT, lo quita de la URL y vuelve a returnTo
│   └── api/                  # Endpoints (proxy GraphQL, login social, descarga APK)
├── layouts/
│   ├── Layout.astro          # Main layout wrapper with SEO metadata
│   └── LegalLayout.astro     # Shell de las páginas legales/soporte (© dinámico)
├── components/               # Svelte components organized by screen
│   ├── common/               # Reusable components (Navbar, Footer, ComingSoon)
│   ├── home/                 # Home page components (Hero, FeatureShowcase, etc.)
│   ├── tutoriales/           # Panel admin de tutoriales (TutorialPanel, TutorialForm, ...)
│   ├── negocios/             # Registro de socios (PartnerSignup, PartnerForm)
│   └── business-types/       # Panel admin de tipos de negocio
├── lib/                      # Business logic organized by feature
│   ├── shared/               # Shared config (GraphQL client)
│   ├── site.ts               # Correo/WhatsApp de soporte, tiempo de respuesta, URL pública
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
- Global CSS import
- Intersection Observer setup for scroll animations

Pages pass props to Layout:
```astro
<Layout title={title} description={description} keywords={keywords}>
```

#### 2. Component Hydration Strategy
Astro components use client directives to control JavaScript hydration:
- `client:load` - Critical interactive components (Navbar, Hero)
- `client:visible` - Defer loading until component is visible (Footer, FeatureShowcase)

This minimizes initial JavaScript load.

#### 3. CSS Variables System
[global.css](src/styles/global.css) defines a comprehensive design system with CSS custom properties:
- Brand colors (`--color-primary`, `--color-secondary`, etc.)
- Category gradients (`--gradient-restaurants`, `--gradient-clothing`, etc.)
- Typography scale, spacing, border radius, shadows, transitions, z-index layers

Always use these variables instead of hardcoded values.

#### 4. Svelte 5 Reactivity
Components use Svelte 5's runes syntax:
- `$state(value)` for reactive state
- `$derived(expression)` for computed values
- Standard `onMount()` lifecycle

Example from [Hero.svelte](src/components/home/Hero.svelte):
```ts
let scrollY = $state(0);
let opacity = $derived(Math.max(0, 1 - scrollY / (windowHeight * 0.6)));
```

#### 5. Component Organization
Components are organized by screen/feature for better maintainability:

**Importing components:**
```astro
---
// From index files (recommended)
import { Navbar, Footer } from '@/components/common';
import { Hero, FeatureShowcase } from '@/components/home';

// Or individual imports
import Hero from '@/components/home/Hero.svelte';
---
```

**Component folders:**
- `common/` - Shared components (Navbar, Footer, ComingSoon)
- `home/` - Homepage components (Hero, DeliveryShowcase, FeatureShowcase, ScrollytellingHowItWorks)
- `tutoriales/` - Admin tutorials panel (TutorialPanel, TutorialForm, TutorialList, uploaders)
- `negocios/` - Registro de socios en /negocios (PartnerSignup: elegir tipo, login, formulario y estado; PartnerForm)
- `business-types/` - Admin business types panel

**Legal / contact data:** the support email, WhatsApp, response time, public site URL and the partner apps (`PARTNER_APPS`, names and download links shown to approved partners) live in `src/lib/site.ts`. The apps link to `/privacidad` and `/terminos` on this site, so change texts here (not in the backend).

#### 6. GraphQL & Backend Integration
Backend communication uses GraphQL with `graphql-request` client.

**Environment variables:**
- `BACKEND_URL` - Backend GraphQL endpoint (private, server-only)
- Located in `.env` file (not committed to git)
- For Railway deployments, use private domain: `https://service-name.railway.internal/graphql`

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

#### 7. Scroll Animations
- Layout includes an Intersection Observer that adds `.animate-in` class to `.animate-on-scroll` elements
- Staggered animation delays using nth-child selectors
- Parallax effects in Hero using scroll-based transforms

#### 8. Language & Content
- All content is in **Spanish** (ES)
- HTML lang="es" and locale="es_ES" set in Layout
- SEO optimized for Spanish-speaking markets

## Development Notes

- The site uses a dark theme with Apple-inspired design (see CSS variables)
- Responsive breakpoints: 1024px (desktop), 1280px (large desktop)
- Image assets are in `/public/img/`
- Theme color is `#023133` (teal)
