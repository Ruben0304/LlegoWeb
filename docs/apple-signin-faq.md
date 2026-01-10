# Apple Sign-In - Preguntas Frecuentes (FAQ)

## ❓ Preguntas Generales

### ¿Dónde configuro el redirect_uri en Apple Developer?

En **Apple Developer Console**, el redirect_uri debe apuntar al **BACKEND**:
```
https://llegobackend-production.up.railway.app/apple/callback
```

**NO** debe apuntar al frontend (`https://tu-dominio.com/auth/callback`).

### ¿Por qué el redirect_uri apunta al backend y no al frontend?

Porque Apple usa el flujo OAuth2 con código de autorización. El flujo es:
1. Apple → Backend (con código de autorización)
2. Backend valida el código con Apple
3. Backend genera JWT
4. Backend → Frontend (con JWT)

Esto es más seguro porque el frontend nunca ve el código de autorización de Apple.

### ¿Necesito configurar algo en el frontend para el redirect_uri?

No. El frontend solo necesita:
- La URL del backend (`PUBLIC_BACKEND_URL`)
- Opcionalmente el client ID (`PUBLIC_APPLE_CLIENT_ID`)

### ¿Qué hace la página `/auth/callback` en el frontend?

Esta página:
1. Captura el token JWT de la URL (`?token=...`)
2. Lo decodifica para obtener datos del usuario
3. Lo guarda en localStorage
4. Redirige al usuario a `/negocios`

Es el último paso del flujo, después de que el backend ya validó todo con Apple.

## 🔧 Configuración

### ¿Qué variables de entorno necesito en el frontend?

**Solo necesitas la que ya tienes:**

```env
PUBLIC_BACKEND_URL=https://llegobackend-production.up.railway.app
```

No necesitas agregar nada más para Apple Sign-In.

### ¿Qué variables de entorno necesita el backend?

```env
APPLE_CLIENT_ID=com.llego.web
APPLE_TEAM_ID=tu_team_id
APPLE_KEY_ID=tu_key_id
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
FRONTEND_URL=https://tu-dominio.com
```

### ¿Cómo obtengo las credenciales de Apple?

1. Ve a [Apple Developer Console](https://developer.apple.com/)
2. Crea un Service ID (esto es tu `APPLE_CLIENT_ID`)
3. Configura el redirect URI apuntando al backend
4. Crea una Key para Sign in with Apple
5. Descarga el archivo `.p8` (esto es tu `APPLE_PRIVATE_KEY`)

## 🐛 Troubleshooting

### Error: "Safari no puede abrir la dirección porque no es válida"

**Causa:** Configuración incorrecta en Apple Developer Console o dominio no verificado.

**Solución:** 
1. Verifica que el Service ID esté correctamente configurado en Apple Developer
2. Asegúrate de que el dominio esté verificado (archivo `.well-known`)
3. Verifica que el Return URL sea exactamente: `https://llegobackend-production.up.railway.app/apple/callback`
4. Espera 5-10 minutos después de hacer cambios en Apple Developer

**Ver:** [apple-signin-troubleshooting.md](./apple-signin-troubleshooting.md) para guía detallada.

### Error: "redirect_uri_mismatch"

**Causa:** El redirect_uri configurado en Apple Developer no coincide con el que usa el backend.

**Solución:** Verifica que en Apple Developer tengas:
```
https://llegobackend-production.up.railway.app/apple/callback
```

### Error: "invalid_client"

**Causa:** El `APPLE_CLIENT_ID` en el backend no coincide con el Service ID de Apple Developer.

**Solución:** Verifica que ambos sean exactamente iguales (ej: `com.llego.web`).

### El usuario es redirigido pero no se autentica

**Causa:** El backend no está redirigiendo correctamente al frontend con el token.

**Solución:** Verifica que el backend tenga configurado `FRONTEND_URL` correctamente y que redirija a:
```
https://tu-dominio.com/auth/callback?token=JWT
```

### La página de callback muestra "Token no encontrado"

**Causa:** El backend no está enviando el token en la URL.

**Solución:** Verifica los logs del backend para ver si hay errores al generar el JWT.

### El token se guarda pero el usuario no ve el panel

**Causa:** Posible error al decodificar el JWT o al restaurar la sesión.

**Solución:** 
1. Abre la consola del navegador
2. Verifica que `localStorage.getItem('llego.auth.accessToken')` tenga un valor
3. Verifica que no haya errores en la consola

## 🔄 Flujo de Datos

### ¿Qué datos recibe el backend de Apple?

Apple envía:
- `code`: Código de autorización (de un solo uso)
- `state`: Estado para validación CSRF
- `id_token`: Token JWT con información del usuario (opcional)

### ¿Qué datos envía el backend al frontend?

El backend envía un JWT que contiene:
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "name": "Usuario",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### ¿Dónde se almacena el token en el frontend?

En `localStorage` con las siguientes keys:
- `llego.auth.accessToken`: El JWT completo
- `llego.auth.tokenType`: "bearer"
- `llego.auth.user`: Objeto JSON con datos del usuario

## 🔒 Seguridad

### ¿Es seguro almacenar el token en localStorage?

Para aplicaciones web SPA (Single Page Application), localStorage es una opción común. Consideraciones:

**Pros:**
- Persiste entre sesiones
- Fácil de implementar
- Compatible con todos los navegadores

**Contras:**
- Vulnerable a XSS (Cross-Site Scripting)

**Mitigaciones:**
- Usa HTTPS siempre
- Implementa CSP (Content Security Policy)
- Valida y sanitiza todas las entradas
- Usa tokens con expiración corta

### ¿El frontend valida el token?

No. El frontend solo decodifica el token para mostrar información del usuario. La validación real la hace el backend en cada request a la API GraphQL.

### ¿Qué pasa si alguien modifica el token en localStorage?

El backend rechazará el token modificado porque no pasará la verificación de firma JWT. El usuario verá errores de autenticación.

## 📱 Compatibilidad

### ¿Funciona en todos los navegadores?

Sí, el flujo OAuth2 funciona en todos los navegadores modernos. Apple Sign-In es compatible con:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Navegadores móviles

### ¿Funciona en aplicaciones móviles?

Este flujo está diseñado para web. Para aplicaciones móviles nativas, Apple tiene SDKs específicos:
- iOS: `AuthenticationServices` framework
- Android: Apple Sign-In REST API

## 🚀 Producción

### ¿Qué debo cambiar antes de ir a producción?

1. Actualiza `FRONTEND_URL` en el backend con tu dominio real
2. Verifica que el redirect_uri en Apple Developer sea correcto
3. Usa HTTPS en todos los endpoints
4. Configura variables de entorno en tu plataforma de hosting
5. Prueba el flujo completo en staging primero

### ¿Necesito un dominio verificado?

Sí, Apple requiere que verifiques el dominio en Apple Developer Console antes de usar Sign in with Apple en producción.

### ¿Puedo usar localhost para desarrollo?

Sí, pero debes configurarlo en Apple Developer:
```
http://localhost:3000/apple/callback
```

O usar un túnel como ngrok para tener HTTPS.
