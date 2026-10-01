# Componentes

Los componentes están organizados por pantalla y funcionalidad.

## Estructura

```
components/
├── common/          # Componentes reutilizables (Navbar, Footer, ComingSoon)
├── home/            # Componentes de la página principal
├── tutoriales/      # Panel admin de tutoriales
└── business-types/  # Panel admin de tipos de negocio
```

## Uso

### Importación Individual

```astro
---
import Navbar from '@/components/common/Navbar.svelte';
import Hero from '@/components/home/Hero.svelte';
---
```

### Importación desde index

```astro
---
import { Navbar, Footer } from '@/components/common';
import { Hero, FeatureShowcase } from '@/components/home';
---
```

## Carpetas

### [common/](common/)
Componentes reutilizables en múltiples páginas:
- **Navbar** - Barra de navegación principal
- **Footer** - Pie de página (enlaces legales y de soporte, © dinámico)
- **ComingSoon** - Página "Próximamente" (usada en /plus y /negocios)

### [home/](home/)
Componentes de la página principal (index.astro):
- **Hero** - Sección hero con parallax
- **FeatureShowcase** - Showcase de categorías
- **DeliveryShowcase** - Animación de entrega
- **ScrollytellingHowItWorks** - Cómo funciona (scrollytelling)

### [tutoriales/](tutoriales/)
Panel admin de tutoriales (tutoriales.astro), con inicio de sesión Google/Apple:
- **TutorialPanel** - Panel principal (login + listado)
- **TutorialForm** / **TutorialList** - Alta/edición y listado
- **ImageUploader** / **VideoUploader** - Subida de miniatura y video

### [business-types/](business-types/)
Panel admin de tipos de negocio (business-types.astro). Reutiliza la sesión
que se inicia en /tutoriales.
