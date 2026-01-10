# Documentación del Proyecto Llego

Esta carpeta contiene la documentación técnica del proyecto.

## 📚 Índice de Documentación

### APIs y Endpoints
- **[businesses-branches-api.md](./businesses-branches-api.md)** - API de negocios y sucursales
- **[products-api.md](./products-api.md)** - API de productos
- **[users-api.md](./users-api.md)** - API de usuarios
- **[flujos-api.md](./flujos-api.md)** - Flujos de la API
- **[flujos-paginacion.md](./flujos-paginacion.md)** - Paginación en la API

### Autenticación
- **[apple-signin-summary.md](./apple-signin-summary.md)** - ✨ Resumen de implementación de Apple Sign-In
- **[apple-signin-implementation.md](./apple-signin-implementation.md)** - Detalles técnicos de Apple Sign-In
- **[apple-signin-ui.md](./apple-signin-ui.md)** - Diseño visual de Apple Sign-In

## 🆕 Últimas Actualizaciones

### Apple Sign-In (Enero 2026)
Se implementó Apple Sign-In en el panel de negocios con las siguientes características:
- Botón de autenticación con diseño oficial de Apple
- Flujo OAuth2 completo con redirección al backend
- Página de callback para manejar tokens JWT
- Manejo de errores robusto
- UI consistente con Google Sign-In

**Archivos relacionados:**
- `src/components/negocios/BusinessPanel.svelte`
- `src/pages/auth/callback.astro`
- `.env` y `.env.example`

## 🔗 Enlaces Útiles

- [Backend Repository](../README.md#backend) - Información sobre el backend
- [Environment Variables](./.env.example) - Variables de entorno necesarias
- [Project README](../README.md) - README principal del proyecto

## 📝 Convenciones

- Los archivos de API siguen el formato: `[recurso]-api.md`
- Los archivos de implementación siguen el formato: `[feature]-implementation.md`
- Los archivos de UI siguen el formato: `[feature]-ui.md`
- Los resúmenes siguen el formato: `[feature]-summary.md`

## 🤝 Contribuir

Al agregar nueva documentación:
1. Usa formato Markdown
2. Incluye ejemplos de código cuando sea relevante
3. Actualiza este README con enlaces a la nueva documentación
4. Usa emojis para mejorar la legibilidad (opcional pero recomendado)
