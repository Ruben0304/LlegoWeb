# Llegó Web

Web pública de **Llegó**, la app de delivery en Cuba: landing, páginas legales
(fuente única de privacidad y términos para todas las apps), soporte, registro de
negocios y mensajeros, y los paneles internos de tutoriales y tipos de negocio.

Astro 5 (SSR con `@astrojs/node`) + Svelte 5. Todo el contenido está en español.

## Páginas

| Ruta | Qué es | Buscadores |
|---|---|---|
| `/` | Landing y enlaces de descarga | indexable |
| `/plus` | Llegó+ ("Próximamente") | indexable |
| `/soporte` | Preguntas frecuentes y contacto | indexable |
| `/privacidad`, `/terminos` | Textos legales (las apps enlazan aquí) | indexable |
| `/eliminar-cuenta` | Cómo borrar la cuenta desde cada app | indexable |
| `/negocios` | Registro de negocios y mensajeros (con sesión) | `noindex` |
| `/tutoriales`, `/business-types` | Paneles de administración | `noindex` + bloqueados en `robots.txt` |
| `/auth/callback` | Vuelta del login con Apple | `noindex` + bloqueado |
| `/api/*` | Proxy GraphQL, login social, descarga del APK | bloqueado |

`/sitemap.xml` y `/robots.txt` se generan al compilar a partir de `src/lib/seo.ts`.

## Requisitos

- Node.js 20.3+ o 22+ (los que admite Astro 5) y npm 9.6.5+.
- Un backend de Llegó accesible (LlegoBackend), local o desplegado.

## Puesta en marcha

```sh
npm ci
cp .env.example .env   # y rellena las variables
npm run dev            # http://localhost:4321
```

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo en `localhost:4321` |
| `npm run build` | Compila a `./dist/` (servidor Node + estáticos) |
| `npm run preview` | Sirve la compilación localmente |
| `npm run start` | Arranca la compilación (`node ./dist/server/entry.mjs`); usa `HOST` y `PORT` |

## Variables de entorno

Detalle y ejemplos en [`.env.example`](.env.example).

| Variable | Dónde se usa | Notas |
|---|---|---|
| `BACKEND_URL` | Servidor | URL base del backend, **sin `/graphql`** |
| `WEB_PROXY_SECRET` | Servidor | Mismo valor que `WEB_PROXY_SECRET` del backend; sin él no se reenvía la IP del visitante |
| `PUBLIC_BACKEND_URL` | Navegador | URL pública del backend |
| `PUBLIC_GOOGLE_CLIENT_ID` | Navegador | Client ID de Google de tipo **Aplicación web** |

Las variables sin `PUBLIC_` nunca llegan al navegador. Si se definen solo al
arrancar (no al compilar), el servidor las lee igualmente de `process.env`.

## Dónde cambiar las cosas

- **Correo y WhatsApp de soporte, tiempo de respuesta, URL pública, enlaces de las
  tiendas y apps de socios:** `src/lib/site.ts`.
- **Textos legales:** `src/pages/privacidad.astro`, `src/pages/terminos.astro` y
  `src/pages/eliminar-cuenta.astro` (y la fecha en `LEGAL_LAST_UPDATED` de `site.ts`).
- **Páginas del sitemap y rutas bloqueadas:** `src/lib/seo.ts`.
- **Operaciones GraphQL:** `src/lib/<funcionalidad>/queries.ts` y `mutations.ts`. El
  navegador las envía directamente a `PUBLIC_BACKEND_URL` (no hay proxy GraphQL en la web).

## Seguridad del servidor

- Las llamadas del servidor al backend reenvían la IP del visitante con el secreto
  compartido (`src/lib/shared/backend-proxy.ts`, solo servidor), para que el rate limit
  del backend cuente por visitante y no por servidor de la web.

## Despliegue

Railway, con `npm run build` como build y `npm run start` como arranque. El dominio
público está en `SITE_URL` (`src/lib/site.ts`) y en `site` de `astro.config.mjs`: si
cambia, cambia ahí (canonical, Open Graph, sitemap y robots dependen de él) y en
`WEB_AUTH_CALLBACK_URLS` del backend.

Más detalle de arquitectura y convenciones en [CLAUDE.md](CLAUDE.md).
