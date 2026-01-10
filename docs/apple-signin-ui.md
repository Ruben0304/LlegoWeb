# Apple Sign-In - Interfaz de Usuario

## Vista del Panel de Login

El panel de negocios ahora muestra dos opciones de autenticación:

```
┌─────────────────────────────────────────┐
│                                         │
│              👤 (icono)                 │
│                                         │
│         Panel de Negocios               │
│   Gestiona tus productos y llega       │
│        a más clientes                   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  🔵  Continuar con Google        │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  🍎  Continuar con Apple         │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Al continuar, aceptas nuestros         │
│  Términos de Servicio y                 │
│  Política de Privacidad                 │
│                                         │
└─────────────────────────────────────────┘
```

## Características Visuales

### Botón de Google
- **Color:** Blanco (#FFFFFF)
- **Texto:** Negro (#1D1D1F)
- **Icono:** Logo de Google multicolor
- **Efecto hover:** Escala 1.02x con sombra elevada
- **Altura:** 54px
- **Border radius:** 12px

### Botón de Apple
- **Color:** Negro (#000000)
- **Texto:** Blanco (#FFFFFF)
- **Icono:** Logo de Apple blanco
- **Efecto hover:** Escala 1.02x, fondo #1A1A1A
- **Altura:** 54px
- **Border radius:** 12px

### Estados de Carga
Ambos botones muestran un spinner cuando están procesando:
```
┌───────────────────────────────────┐
│  ⟳  Conectando...                │
└───────────────────────────────────┘
```

## Página de Callback

Cuando el usuario es redirigido desde Apple, ve:

```
┌─────────────────────────────────────────┐
│                                         │
│              ⟳ (spinner)                │
│                                         │
│           Autenticando...               │
│      Por favor espera un momento        │
│                                         │
└─────────────────────────────────────────┘
```

### En caso de error:

```
┌─────────────────────────────────────────┐
│                                         │
│              ⚠️                         │
│                                         │
│      Error de autenticación             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ⚠️ Error de autenticación      │   │
│  │                                 │   │
│  │  No se pudo completar la        │   │
│  │  autenticación. Por favor       │   │
│  │  intenta nuevamente.            │   │
│  └─────────────────────────────────┘   │
│                                         │
│      [Volver al inicio]                 │
│                                         │
└─────────────────────────────────────────┘
```

## Flujo Visual Completo

```
1. Usuario en /negocios (no autenticado)
   ↓
   [Botón: Continuar con Apple]
   ↓
2. Click → Spinner "Conectando..."
   ↓
3. Redirige a Apple Sign-In
   ↓
   [Página de Apple con login]
   ↓
4. Usuario autentica en Apple
   ↓
5. Redirige a /auth/callback
   ↓
   [Spinner "Autenticando..."]
   ↓
6. Token guardado → Redirige a /negocios
   ↓
7. Usuario ve el panel autenticado
   ↓
   [Dashboard con productos]
```

## Responsive Design

### Desktop (> 640px)
- Botones centrados, ancho máximo 320px
- Espaciado generoso entre elementos
- Sombras y efectos hover completos

### Mobile (≤ 640px)
- Botones ocupan todo el ancho disponible
- Padding reducido
- Mantiene la misma funcionalidad

## Accesibilidad

- ✅ Botones con estados disabled claros
- ✅ Mensajes de error descriptivos
- ✅ Spinners con animación suave
- ✅ Contraste de color adecuado (WCAG AA)
- ✅ Navegación por teclado funcional
- ✅ Aria labels apropiados

## Consistencia de Diseño

Ambos botones (Google y Apple) siguen el mismo patrón:
- Misma altura y border radius
- Mismos efectos de hover y active
- Misma tipografía (SF Pro Display)
- Mismos estados de carga
- Misma experiencia de usuario

La única diferencia es el esquema de color, siguiendo las guías oficiales de cada plataforma.
