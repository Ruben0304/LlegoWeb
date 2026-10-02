# Lib - Features y Servicios

Esta carpeta contiene la lógica de negocio, servicios, y funcionalidades organizadas por feature.

## Estructura

```
lib/
├── shared/          # Configuración compartida (cliente GraphQL)
├── site.ts          # Datos de contacto/soporte y URL pública de la web
├── auth/            # Login social (Google/Apple): types, mutations; session.ts (sesión en el navegador)
├── partner/         # Registro de socios (types, queries, mutations, teléfono)
├── business-type/   # Tipos de negocio (types, queries, mutations)
└── tutorial/        # Tutoriales (types, queries, mutations)
```

## Uso

### Importar desde un feature

```astro
---
// Importar todo el feature
import { getTutorials, createTutorial, type Tutorial } from '@/lib/tutorial';

// O importar específicamente
import { GET_TUTORIALS } from '@/lib/tutorial/queries';
import type { Tutorial } from '@/lib/tutorial/types';
---
```

### Usar el cliente GraphQL compartido

```astro
---
import { query, mutation } from '@/lib/shared/graphql';
import { gql } from 'graphql-request';

const data = await query(gql`{ ... }`);
---
```

## Carpetas

### [shared/](shared/)
Configuración y utilidades compartidas:
- **[graphql.ts](shared/graphql.ts)** - Cliente GraphQL configurado
- **[README.md](shared/README.md)** - Documentación del cliente GraphQL

### [tutorial/](tutorial/)
Feature de tutoriales con estructura completa:
- **[types.ts](tutorial/types.ts)** - Tipos TypeScript
- **[queries.ts](tutorial/queries.ts)** - Queries GraphQL
- **[mutations.ts](tutorial/mutations.ts)** - Mutations GraphQL
- **[index.ts](tutorial/index.ts)** - Funciones helper y exports

### [business-type/](business-type/)
Feature de tipos de negocio (misma estructura).

### [auth/](auth/)
Login social con Google y Apple (types, mutations). **[session.ts](auth/session.ts)** es la
sesión en el navegador: claves de localStorage compartidas con `/auth/callback`, login con
Google Identity Services y con Apple (`/apple/start?redirect_scheme=<origen>/auth/callback`,
que el backend solo acepta si está en `WEB_AUTH_CALLBACK_URLS`) y la ruta de vuelta tras el
callback (`setReturnTo`/`consumeReturnTo`, solo rutas del propio sitio).

### [partner/](partner/)
Registro de socios de `/negocios`: `getMyPartnerAccess`, `submitPartnerRequest` y
`normalizePhone` (misma regla que `utils/phone.py` del backend: 8 dígitos → `+53XXXXXXXX`).

## Agregar un nuevo feature

1. Crear carpeta con el nombre del feature:
   ```bash
   mkdir src/lib/mi-feature
   ```

2. Crear archivos base:
   ```bash
   touch src/lib/mi-feature/{types.ts,queries.ts,mutations.ts,index.ts}
   ```

3. Seguir la estructura de [tutorial/](tutorial/) como ejemplo

## Convenciones

- **types.ts** - Interfaces, enums, tipos TypeScript
- **queries.ts** - Solo queries GraphQL (con gql tagged template)
- **mutations.ts** - Solo mutations GraphQL (con gql tagged template)
- **index.ts** - Funciones helper que usan el cliente GraphQL + re-exports

## Variables de Entorno

El cliente GraphQL usa `BACKEND_URL` (privada, solo servidor).
Ver [shared/README.md](shared/README.md) para más detalles.
