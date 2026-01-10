# Apple Sign-In - Diagrama de Flujo Completo

## 🔄 Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (tu-dominio.com)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. Usuario hace clic en "Continuar con Apple"                      │
│     ↓                                                                │
│  2. handleAppleLogin() llama a:                                      │
│     GET https://llegobackend-production.up.railway.app/apple/start  │
│                                                                       │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  BACKEND (llegobackend-production)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  3. Backend responde con:                                            │
│     {                                                                │
│       "auth_url": "https://appleid.apple.com/auth/authorize?...",   │
│       "state": "abc123randomstate"                                   │
│     }                                                                │
│                                                                       │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (tu-dominio.com)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  4. Frontend redirige al usuario a auth_url:                         │
│     window.location.href = auth_url                                  │
│                                                                       │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    APPLE (appleid.apple.com)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  5. Usuario ve la página de login de Apple                           │
│  6. Usuario ingresa sus credenciales de Apple ID                     │
│  7. Usuario autoriza la aplicación                                   │
│                                                                       │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  BACKEND (llegobackend-production)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  8. Apple redirige a:                                                │
│     POST https://llegobackend-production.up.railway.app/apple/callback│
│     (Este es el redirect_uri configurado en Apple Developer)         │
│                                                                       │
│  9. Backend recibe el código de autorización                         │
│ 10. Backend valida el código con Apple                               │
│ 11. Backend genera JWT token                                         │
│ 12. Backend redirige al frontend con el token:                       │
│     https://tu-dominio.com/auth/callback?token=eyJhbGc...            │
│                                                                       │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│              FRONTEND (tu-dominio.com/auth/callback)                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ 13. Página de callback captura el token de la URL                    │
│ 14. Decodifica el JWT para obtener datos del usuario                 │
│ 15. Guarda en localStorage:                                          │
│     - llego.auth.accessToken = token                                 │
│     - llego.auth.tokenType = "bearer"                                │
│     - llego.auth.user = { id, name, email, role }                    │
│ 16. Redirige automáticamente a:                                      │
│     window.location.href = "/negocios"                               │
│                                                                       │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                FRONTEND (tu-dominio.com/negocios)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ 17. BusinessPanel.svelte restaura la sesión desde localStorage       │
│ 18. Usuario ve el panel de negocios autenticado                      │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔑 Configuraciones Importantes

### En Apple Developer Console:
```
Service ID: com.llego.web
Redirect URI: https://llegobackend-production.up.railway.app/apple/callback
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
              ⚠️ IMPORTANTE: Apunta al BACKEND, no al frontend
```

### En el Backend (.env):
```env
APPLE_CLIENT_ID=com.llego.web
APPLE_TEAM_ID=tu_team_id
APPLE_KEY_ID=tu_key_id
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
FRONTEND_URL=https://tu-dominio.com
```

### En el Frontend (.env):
```env
PUBLIC_BACKEND_URL=https://llegobackend-production.up.railway.app
PUBLIC_APPLE_CLIENT_ID=com.llego.web  # Opcional, solo para referencia
```

## ❌ Errores Comunes

### Error 1: Redirect URI Mismatch
```
❌ INCORRECTO en Apple Developer:
   Redirect URI: https://tu-dominio.com/auth/callback

✅ CORRECTO en Apple Developer:
   Redirect URI: https://llegobackend-production.up.railway.app/apple/callback
```

### Error 2: Frontend URL en Backend
```
❌ INCORRECTO en backend:
   Redirigir a: https://backend.com/auth/callback?token=...

✅ CORRECTO en backend:
   Redirigir a: https://tu-dominio-frontend.com/auth/callback?token=...
```

## 📝 Resumen de URLs

| Paso | URL | Descripción |
|------|-----|-------------|
| 1 | `https://llegobackend.../apple/start` | Frontend pide URL de auth |
| 2 | `https://appleid.apple.com/auth/authorize?...` | Usuario autentica en Apple |
| 3 | `https://llegobackend.../apple/callback` | Apple envía código al backend |
| 4 | `https://tu-dominio.com/auth/callback?token=...` | Backend redirige al frontend |
| 5 | `https://tu-dominio.com/negocios` | Usuario llega al panel |

## 🎯 Puntos Clave

1. **Apple NUNCA redirige directamente al frontend**
2. **El redirect_uri en Apple Developer apunta al BACKEND**
3. **El backend valida y luego redirige al frontend con el token**
4. **El frontend solo necesita capturar el token de la URL**
5. **No necesitas configurar redirect_uri en el frontend**
