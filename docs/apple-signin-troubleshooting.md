# Apple Sign-In - Troubleshooting Específico

## 🔴 Error: "Safari no puede abrir la dirección porque no es válida"

### Síntoma
Después de hacer clic en "Continuar con Apple", aparece una URL en Safari como:
```
https://appleid.apple.com/auth/authorize?client_id=com.llegoweb&redirect_uri=...
```

Y Safari muestra: "Safari no puede abrir la dirección porque no es válida"

### Causas Posibles

#### 1. Service ID no configurado correctamente en Apple Developer

**Verifica en Apple Developer Console:**

1. Ve a [Apple Developer Console](https://developer.apple.com/account/resources/identifiers/list/serviceId)
2. Busca tu Service ID (ej: `com.llegoweb`)
3. Verifica que esté **habilitado** "Sign in with Apple"
4. Haz clic en "Configure" junto a "Sign in with Apple"
5. Verifica:
   - **Primary App ID**: Debe estar seleccionado tu App ID
   - **Domains and Subdomains**: Debe incluir tu dominio (ej: `llegobackend-production.up.railway.app`)
   - **Return URLs**: Debe incluir `https://llegobackend-production.up.railway.app/apple/callback`

**IMPORTANTE:** Después de hacer cambios, haz clic en "Save" y luego "Continue" y "Save" nuevamente.

#### 2. Dominio no verificado

Apple requiere que verifiques el dominio antes de usar Sign in with Apple.

**Para verificar:**
1. En Apple Developer Console, ve a tu Service ID
2. En "Domains and Subdomains", agrega tu dominio
3. Apple te dará un archivo para descargar
4. Sube ese archivo a tu servidor en `https://tu-dominio/.well-known/apple-developer-domain-association.txt`

**Para Railway:**
Si tu backend está en Railway, necesitas verificar el dominio de Railway. Esto puede ser complicado porque no tienes acceso al directorio `.well-known`.

**Solución alternativa:**
- Usa un dominio personalizado que controles
- O contacta al soporte de Railway para ayuda con la verificación

#### 3. Client ID incorrecto

En la URL veo: `client_id=com.llegoweb`

**Verifica en el backend:**
```env
APPLE_CLIENT_ID=com.llegoweb  # ¿Es este el correcto?
```

Este debe coincidir **exactamente** con el Service ID en Apple Developer Console.

#### 4. Redirect URI no coincide

En la URL veo: `redirect_uri=https%3A%2F%2Fllegobackend-production.up.railway.app%2Fapple%2Fcallback`

Decodificado: `https://llegobackend-production.up.railway.app/apple/callback`

**Verifica en Apple Developer Console:**
- El Return URL debe ser **exactamente**: `https://llegobackend-production.up.railway.app/apple/callback`
- Sin espacios, sin caracteres extra
- Con HTTPS (no HTTP)

### Soluciones

#### Solución 1: Verificar configuración completa

1. **En Apple Developer Console:**
   ```
   Service ID: com.llegoweb (o el que uses)
   Sign in with Apple: ✅ Enabled
   Domains: llegobackend-production.up.railway.app
   Return URLs: https://llegobackend-production.up.railway.app/apple/callback
   ```

2. **En el backend (.env):**
   ```env
   APPLE_CLIENT_ID=com.llegoweb
   APPLE_TEAM_ID=tu_team_id
   APPLE_KEY_ID=tu_key_id
   APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
   FRONTEND_URL=https://tu-dominio-frontend.com
   ```

3. **Guarda todos los cambios** en Apple Developer Console

4. **Espera 5-10 minutos** para que los cambios se propaguen

#### Solución 2: Usar dominio personalizado

Si Railway no permite verificar el dominio, considera:

1. Configurar un dominio personalizado (ej: `api.llego.com`)
2. Apuntar ese dominio a Railway
3. Verificar ese dominio en Apple Developer
4. Actualizar el redirect URI a `https://api.llego.com/apple/callback`

#### Solución 3: Testing en localhost

Para desarrollo local:

1. En Apple Developer, agrega:
   ```
   Domains: localhost
   Return URLs: http://localhost:3000/apple/callback
   ```

2. Usa ngrok o similar para tener HTTPS:
   ```bash
   ngrok http 3000
   ```

3. Usa la URL de ngrok en Apple Developer

### Debugging

Abre la consola del navegador (F12) y busca los logs:

```
🍎 Iniciando Apple Sign In...
Backend URL: https://llegobackend-production.up.railway.app
Response status: 200
Backend response: { auth_url: "...", state: "..." }
Auth URL recibida: https://appleid.apple.com/auth/authorize?...
State guardado: abc123...
🚀 Redirigiendo a Apple...
```

Si ves un error antes de "🚀 Redirigiendo a Apple...", el problema está en el backend.

Si ves "🚀 Redirigiendo a Apple..." pero Safari dice que la URL no es válida, el problema está en la configuración de Apple Developer.

### Checklist de Verificación

- [ ] Service ID existe en Apple Developer Console
- [ ] "Sign in with Apple" está habilitado
- [ ] Dominio está agregado en "Domains and Subdomains"
- [ ] Return URL está agregado y es exacto
- [ ] Dominio está verificado (archivo .well-known)
- [ ] APPLE_CLIENT_ID en backend coincide con Service ID
- [ ] Esperaste 5-10 minutos después de hacer cambios
- [ ] Backend responde correctamente a /apple/start
- [ ] La URL generada es válida (empieza con https://appleid.apple.com)

### Contacto con Apple

Si todo lo anterior está correcto y sigue sin funcionar:

1. Ve a [Apple Developer Support](https://developer.apple.com/contact/)
2. Selecciona "Sign in with Apple"
3. Describe el problema con la URL exacta que genera tu backend
4. Incluye tu Service ID y Team ID

### Alternativa Temporal: Solo Google

Mientras resuelves el problema con Apple, los usuarios pueden seguir usando Google Sign-In que ya funciona correctamente.
