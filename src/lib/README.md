# Lib - Features y Servicios

Esta carpeta contiene la lógica de negocio, servicios, y funcionalidades organizadas por feature.

## Estructura

```
lib/
├── shared/          # Configuración compartida (GraphQL client, utils)
├── product/         # Feature de productos (types, queries, mutations)
├── business/        # Feature de negocios (types, queries, mutations)
└── auth/            # Feature de autenticación (types, queries, mutations)
```

## Uso

### Importar desde un feature

```astro
---
// Importar todo el feature
import { getProducts, createProduct, type Product } from '@/lib/product';

// O importar específicamente
import { GET_PRODUCTS } from '@/lib/product/queries';
import type { Product } from '@/lib/product/types';
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
- **[graphql-example.ts](shared/graphql-example.ts)** - Ejemplos de uso
- **[README.md](shared/README.md)** - Documentación del cliente GraphQL

### [product/](product/) *(ejemplo)*
Feature de productos con estructura completa:
- **[types.ts](product/types.ts)** - Tipos TypeScript
- **[queries.ts](product/queries.ts)** - Queries GraphQL
- **[mutations.ts](product/mutations.ts)** - Mutations GraphQL
- **[index.ts](product/index.ts)** - Funciones helper y exports

### [business/](business/)
Feature de negocios (agregar types, queries, mutations según tu backend)

### [auth/](auth/)
Feature de autenticación (agregar types, queries, mutations según tu backend)

## Agregar un nuevo feature

1. Crear carpeta con el nombre del feature:
   ```bash
   mkdir src/lib/mi-feature
   ```

2. Crear archivos base:
   ```bash
   touch src/lib/mi-feature/{types.ts,queries.ts,mutations.ts,index.ts}
   ```

3. Seguir la estructura de [product/](product/) como ejemplo

## Convenciones

- **types.ts** - Interfaces, enums, tipos TypeScript
- **queries.ts** - Solo queries GraphQL (con gql tagged template)
- **mutations.ts** - Solo mutations GraphQL (con gql tagged template)
- **index.ts** - Funciones helper que usan el cliente GraphQL + re-exports

## Variables de Entorno

El cliente GraphQL usa `BACKEND_URL` (privada, solo servidor).
Ver [shared/README.md](shared/README.md) para más detalles.
