# Implementación de Apple Sign-In

## Resumen

Se ha implementado Apple Sign-In en el panel de negocios siguiendo el flujo OAuth2 con redirección al backend.

## Archivos Modificados

### 1. `src/components/negocios/BusinessPanel.svelte`
- Agregado botón "Continuar con Apple" con estilos consistentes
- Implementada función `handleAppleLogin()` que:
  - Llama a `GET /apple/start` en el backend
  - Recibe la URL de autenticación de Apple
  - Redirige al usuario a Apple para autenticarse
- Agregada constante `APPLE_CLIENT_ID` desde variables de entorno

### 2. `src/pages/auth/callback.astro`
- Nueva página de callback que maneja la redirección desde el backend
- Captura el token JWT de los query params (`?token=...`)
- Decodifica el JWT para extraer información del usuario
- Guarda los datos en localStorage:
  - `llego.auth.accessToken`
  - `llego.auth.tokenType`
  - `llego.auth.user`
- Redirige automáticamente a `/negocios`
- Maneja errores con mensajes amigables

### 3. `.env` y `.env.example`
- Agregada variable de configuración:
  - `PUBLIC_APPLE_CLIENT_ID`: ID del cliente de Apple (opcional, solo para referencia)

## Flujo de Autenticación

```
1. Usuario hace clic en "Continuar con Apple"
   ↓
2. Frontend llama a GET /apple/start
   ↓
3. Backend responde con { auth_url, state }
   ↓
4. Frontend redirige a auth_url (página de Apple)
   ↓
5. Usuario se autentica en Apple
   ↓
6. Apple redirige al backend (POST /apple/callback)
   ↓
7. Backend valida y redirige a: https://tu-dominio.com/auth/callback?token=JWT
   ↓
8. Página de callback captura el token
   ↓
9. Token se guarda en localStorage
   ↓
10. Usuario es redirigido a /negocios
```

## Configuración Requerida

### Variables de Entorno (Frontend)

**No necesitas agregar nada nuevo al `.env`**. Solo asegúrate de tener:

```env
PUBLIC_BACKEND_URL=https://llegobackend-production.up.railway.app
```

El frontend solo necesita saber dónde está el backend para llamar a `/apple/start`.

### Backend

El backend ya debe tener configurados:

**Endpoints:**
- `GET /apple/start` - Inicia el flujo de autenticación
- `POST /apple/callback` - Recibe el callback de Apple

**Apple Developer Configuration:**
El redirect URI configurado en Apple Developer debe apuntar al **BACKEND**, no al frontend:
```
https://llegobackend-production.up.railway.app/apple/callback
```

**Flujo de redirección:**
1. Apple → Backend (`/apple/callback`)
2. Backend valida y redirige → Frontend (`https://tu-dominio.com/auth/callback?token=JWT`)

## Características

- ✅ Botón con diseño Apple oficial (fondo negro, texto blanco)
- ✅ Estados de carga con spinner
- ✅ Manejo de errores con mensajes descriptivos
- ✅ Validación de token JWT
- ✅ Almacenamiento seguro en localStorage
- ✅ Redirección automática después de autenticación
- ✅ Página de callback con diseño consistente
- ✅ Soporte para errores del backend

## Testing

Para probar la implementación:

1. Asegúrate de que el backend esté corriendo
2. Configura las variables de entorno correctamente
3. Navega a `/negocios`
4. Haz clic en "Continuar con Apple"
5. Completa el flujo de autenticación en Apple
6. Verifica que seas redirigido de vuelta al panel

## Notas

- El flujo es idéntico al de Google Sign-In pero usando el protocolo OAuth2 de Apple
- La página de callback es genérica y puede manejar tanto Google como Apple
- Los tokens se almacenan de la misma manera para ambos proveedores
- El backend es responsable de validar los tokens de Apple
