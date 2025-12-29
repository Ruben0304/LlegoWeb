# Cliente GraphQL - Llegó Backend

Esta carpeta contiene la configuración del cliente GraphQL para comunicarse con el backend de Llegó.

## Archivos

- **[graphql.ts](graphql.ts)** - Cliente GraphQL configurado con variable de entorno privada
- **[graphql-example.ts](graphql-example.ts)** - Ejemplos de uso con queries y mutations

## Configuración

### 1. Variables de Entorno

La URL del backend se configura mediante la variable `BACKEND_URL` en el archivo [.env](.env) (raíz del proyecto).

**IMPORTANTE:** Esta variable NO tiene el prefijo `PUBLIC_`, por lo que:
- ✅ Solo está disponible en el servidor (server-side)
- ✅ NO se expone al navegador del cliente
- ✅ Se puede usar en archivos `.astro`, API routes, y `getStaticProps`
- ✅ Es segura para usar con dominios privados de Railway

### 2. Railway - Dominio Privado

Para máxima seguridad y rendimiento, usa el dominio privado de Railway:

```env
BACKEND_URL=https://nombre-de-tu-servicio.railway.internal/graphql
```

#### Ventajas del dominio privado (.railway.internal):
- **Seguridad**: No expuesto a Internet pública
- **Rendimiento**: Comunicación dentro de la red interna de Railway
- **Sin costos de egress**: No consume ancho de banda público

#### Cómo encontrar tu dominio privado en Railway:
1. Ve a tu proyecto en Railway
2. Selecciona el servicio del backend
3. En la pestaña "Settings" → "Networking"
4. Copia el "Private Domain" (termina en `.railway.internal`)

### 3. Variables de Entorno en Railway

Configura la variable `BACKEND_URL` en Railway:

1. Ve a tu proyecto en Railway
2. Selecciona el servicio de frontend (este proyecto)
3. Pestaña "Variables"
4. Agrega: `BACKEND_URL=https://tu-backend.railway.internal/graphql`

## Uso

### En páginas Astro (.astro)

```astro
---
import Layout from '@/layouts/Layout.astro';
import { query } from '@/lib/graphql';
import { gql } from 'graphql-request';

const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      price
    }
  }
`;

// Esta llamada se ejecuta en el servidor
const { products } = await query(GET_PRODUCTS);
---

<Layout title="Productos">
  <div class="products">
    {products.map(product => (
      <div class="product-card">
        <h3>{product.name}</h3>
        <p>${product.price}</p>
      </div>
    ))}
  </div>
</Layout>
```

### En API Routes

```typescript
// src/pages/api/products.ts
import type { APIRoute } from 'astro';
import { query } from '@/lib/graphql';
import { gql } from 'graphql-request';

export const GET: APIRoute = async () => {
  const data = await query(gql`
    query { products { id name } }
  `);

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
};
```

### Con funciones helper

Ver ejemplos completos en [graphql-example.ts](graphql-example.ts).

## Testing Local

Para probar localmente con tu backend:

1. Copia [.env.example](.env.example) a [.env](.env)
2. Actualiza `BACKEND_URL` con tu URL local o de desarrollo:
   ```env
   BACKEND_URL=http://localhost:4000/graphql
   ```
3. Reinicia el servidor de desarrollo: `npm run dev`

## Solución de Problemas

### Error: "BACKEND_URL no está definida"
- Verifica que existe el archivo [.env](.env)
- Verifica que la variable `BACKEND_URL` está definida
- Reinicia el servidor de desarrollo

### Error de conexión en Railway
- Verifica que el dominio privado es correcto
- Verifica que ambos servicios están en el mismo proyecto de Railway
- Verifica que el backend está corriendo y aceptando conexiones

### CORS errors
- Si usas el dominio privado, NO deberías tener problemas de CORS
- Si usas el dominio público, configura CORS en tu backend
