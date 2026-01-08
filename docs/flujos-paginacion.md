# Guía de Migración: Paginación con Cursor

## Cambios Importantes

Las queries `products`, `branches`, `searchProducts` y `searchBranches` ahora usan **paginación por cursor** en lugar de offset/limit.

### Antes (offset/limit)
```graphql
query {
  products(limit: 20, offset: 0) {
    id
    name
  }
}
```

### Ahora (cursor)
```graphql
query {
  products(first: 20, availableOnly: true) {
    edges {
      node {
        id
        name
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
      totalCount
    }
  }
}
```

---

## Estructura de Respuesta

### ProductConnection / BranchConnection

```typescript
interface Connection {
  edges: Edge[];
  pageInfo: PageInfo;
}

interface Edge {
  node: Product | Branch;  // El objeto real
  cursor: string;          // Cursor único para este elemento
}

interface PageInfo {
  hasNextPage: boolean;      // ¿Hay más páginas?
  hasPreviousPage: boolean;  // ¿Hay páginas anteriores?
  startCursor: string | null; // Cursor del primer elemento
  endCursor: string | null;   // Cursor del último elemento
  totalCount: number;         // Total de elementos
}
```

---

## Ejemplos de Uso

### 1. Productos - Primera Carga

```typescript
import { getProducts } from '@/lib/product';

const result = await getProducts(
  { branchTipo: 'RESTAURANTE', availableOnly: true },
  { first: 20 }
);

const products = result.products.edges.map(edge => edge.node);
const hasMore = result.products.pageInfo.hasNextPage;
const nextCursor = result.products.pageInfo.endCursor;
const total = result.products.pageInfo.totalCount;
```

### 2. Productos - Cargar Más (Scroll Infinito)

```typescript
const result = await getProducts(
  { branchTipo: 'RESTAURANTE', availableOnly: true },
  { first: 20, after: nextCursor }
);

const moreProducts = result.products.edges.map(edge => edge.node);
```

### 3. Búsqueda de Productos

```typescript
import { searchProducts } from '@/lib/product';

const result = await searchProducts(
  'hamburguesa',
  { first: 20 },
  { useVectorSearch: true, branchTipo: 'RESTAURANTE' }
);

const products = result.searchProducts.edges.map(edge => edge.node);
```

### 4. Sucursales - Primera Carga

```graphql
query GetBranches($businessId: String!, $jwt: String!) {
  branches(first: 20, businessId: $businessId, jwt: $jwt) {
    edges {
      node {
        id
        name
        address
        avatarUrl
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
      totalCount
    }
  }
}
```

### 5. Sucursales - Cargar Más

```graphql
query GetMoreBranches($businessId: String!, $after: String!, $jwt: String!) {
  branches(first: 20, after: $after, businessId: $businessId, jwt: $jwt) {
    edges {
      node {
        id
        name
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

---

## Componente Svelte - Ejemplo Completo

```svelte
<script lang="ts">
  import { getProducts } from '@/lib/product';
  import type { Product, ProductConnection } from '@/lib/product/types';

  let products: Product[] = [];
  let loading = false;
  let hasMore = true;
  let endCursor: string | null = null;

  async function loadProducts() {
    if (loading || !hasMore) return;
    
    loading = true;
    try {
      const result = await getProducts(
        { branchTipo: 'RESTAURANTE', availableOnly: true },
        { first: 20, after: endCursor || undefined }
      );

      const newProducts = result.products.edges.map(edge => edge.node);
      products = [...products, ...newProducts];
      
      hasMore = result.products.pageInfo.hasNextPage;
      endCursor = result.products.pageInfo.endCursor;
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      loading = false;
    }
  }

  // Cargar productos iniciales
  $: if (products.length === 0) loadProducts();
</script>

<div class="products-list">
  {#each products as product (product.id)}
    <div class="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </div>
  {/each}

  {#if hasMore}
    <button on:click={loadProducts} disabled={loading}>
      {loading ? 'Cargando...' : 'Cargar más'}
    </button>
  {/if}
</div>
```

---

## Componente con Scroll Infinito

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { getProducts } from '@/lib/product';
  import type { Product } from '@/lib/product/types';

  let products: Product[] = [];
  let loading = false;
  let hasMore = true;
  let endCursor: string | null = null;
  let scrollContainer: HTMLDivElement;

  async function loadMore() {
    if (loading || !hasMore) return;
    
    loading = true;
    const result = await getProducts(
      { availableOnly: true },
      { first: 20, after: endCursor || undefined }
    );

    products = [...products, ...result.products.edges.map(e => e.node)];
    hasMore = result.products.pageInfo.hasNextPage;
    endCursor = result.products.pageInfo.endCursor;
    loading = false;
  }

  function handleScroll() {
    if (!scrollContainer) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 100;
    
    if (scrolledToBottom && hasMore && !loading) {
      loadMore();
    }
  }

  onMount(() => {
    loadMore();
  });
</script>

<div 
  bind:this={scrollContainer}
  on:scroll={handleScroll}
  class="scroll-container"
>
  {#each products as product (product.id)}
    <div class="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </div>
  {/each}

  {#if loading}
    <div class="loading">Cargando...</div>
  {/if}
</div>

<style>
  .scroll-container {
    height: 100vh;
    overflow-y: auto;
  }
</style>
```

---

## Ventajas de la Paginación por Cursor

1. **Consistencia**: No se pierden ni duplican elementos cuando se agregan/eliminan items durante la paginación
2. **Performance**: Más eficiente en bases de datos grandes
3. **Ordenamiento estable**: Los cursores mantienen el orden incluso con cambios en los datos
4. **Información útil**: `totalCount` te da el total sin hacer una query adicional

---

## Migración de Código Existente

### Antes
```typescript
const { products, total } = await getProducts(
  { categoryId: 'cat1' },
  { limit: 20, offset: 0 }
);
```

### Después
```typescript
const result = await getProducts(
  { categoryId: 'cat1', availableOnly: true },
  { first: 20 }
);

const products = result.products.edges.map(edge => edge.node);
const total = result.products.pageInfo.totalCount;
```

---

## Notas Importantes

- El parámetro `first` es **requerido** (no tiene valor por defecto)
- El parámetro `availableOnly` es **requerido** para products
- Los cursores son opacos (no intentes decodificarlos o modificarlos)
- Guarda el `endCursor` para la siguiente página
- Usa `hasNextPage` para saber si hay más datos
