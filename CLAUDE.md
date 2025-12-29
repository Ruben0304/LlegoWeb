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
│   ├── plus.astro            # Pricing/subscription page
│   └── negocios.astro        # Business panel page
├── layouts/
│   └── Layout.astro          # Main layout wrapper with SEO metadata
├── components/               # Svelte components organized by screen
│   ├── common/               # Reusable components (Navbar, Footer)
│   ├── home/                 # Home page components (Hero, Categories, etc.)
│   ├── plus/                 # Plus page components (Pricing, Benefits, etc.)
│   └── negocios/             # Business panel components (BusinessPanel, ProductForm, etc.)
├── lib/                      # Business logic organized by feature
│   ├── shared/               # Shared config (GraphQL client, utils)
│   ├── product/              # Product feature (types, queries, mutations)
│   ├── business/             # Business feature
│   └── auth/                 # Auth feature
└── styles/
    └── global.css            # CSS custom properties and global styles
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
import { Hero, Categories } from '@/components/home';
import { Pricing, Benefits } from '@/components/plus';

// Or individual imports
import Hero from '@/components/home/Hero.svelte';
---
```

**Component folders:**
- `common/` - Shared components (Navbar, Footer)
- `home/` - Homepage components (Hero, Categories, DeliveryShowcase, FeatureShowcase, HowItWorks, ScrollytellingHowItWorks)
- `plus/` - Plus page components (PlusHeroStory, PricingHero, Pricing, PricingFAQ, Benefits)
- `negocios/` - Business panel components (BusinessPanel, ProductForm, ProductList)

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
import { getProducts, type Product } from '@/lib/product';

// Server-side data fetching
const { products } = await getProducts({ limit: 20 });
---

<div>
  {products.map(product => <ProductCard {...product} />)}
</div>
```

**GraphQL client location:**
- Main client: `src/lib/shared/graphql.ts`
- Example usage: `src/lib/shared/graphql-example.ts`
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
