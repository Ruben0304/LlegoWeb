# Componentes

Los componentes están organizados por pantalla y funcionalidad.

## Estructura

```
components/
├── common/          # Componentes reutilizables (Navbar, Footer, etc.)
├── home/            # Componentes de la página principal
├── plus/            # Componentes de la página Plus (pricing)
└── negocios/        # Componentes del panel de negocios
```

## Uso

### Importación Individual

```astro
---
import Navbar from '@/components/common/Navbar.svelte';
import Hero from '@/components/home/Hero.svelte';
---
```

### Importación desde index (recomendado)

```astro
---
import { Navbar, Footer } from '@/components/common';
import { Hero, Categories } from '@/components/home';
import { Pricing, Benefits } from '@/components/plus';
import { BusinessPanel, ProductForm } from '@/components/negocios';
---
```

## Carpetas

### [common/](common/)
Componentes reutilizables en múltiples páginas:
- **Navbar** - Barra de navegación principal
- **Footer** - Pie de página

### [home/](home/)
Componentes de la página principal (index.astro):
- **Hero** - Sección hero con parallax
- **Categories** - Categorías de productos
- **DeliveryShowcase** - Animación de entrega
- **FeatureShowcase** - Showcase de características
- **HowItWorks** - Cómo funciona la app
- **ScrollytellingHowItWorks** - Versión scrollytelling

### [plus/](plus/)
Componentes de la página Plus (plus.astro):
- **PlusHeroStory** - Hero storytelling de Plus
- **PricingHero** - Hero de pricing
- **Pricing** - Planes y precios
- **PricingFAQ** - Preguntas frecuentes
- **Benefits** - Beneficios de Plus

### [negocios/](negocios/)
Componentes del panel de negocios (negocios.astro):
- **BusinessPanel** - Panel principal de negocio
- **ProductForm** - Formulario de productos
- **ProductList** - Lista de productos
