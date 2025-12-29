<script lang="ts">
  interface Category {
    id: string;
    name: string;
    description: string;
    items: string[];
    gradient: string;
    icon: string;
  }

  const categories: Category[] = [
    {
      id: 'restaurants',
      name: 'Restaurantes',
      description: 'Descubre los mejores sabores cerca de ti',
      items: ['Comida y bebidas', 'Gourmet', 'Fast food', 'Sushi', 'Postres', 'Bebidas'],
      gradient: 'var(--gradient-restaurants)',
      icon: '🍽️'
    },
    {
      id: 'clothing',
      name: 'Ropa',
      description: 'Moda para toda la familia',
      items: ['Hombre', 'Mujer', 'Ninos', 'Deportivo', 'Accesorios'],
      gradient: 'var(--gradient-clothing)',
      icon: '👕'
    },
    {
      id: 'market',
      name: 'Mercado',
      description: 'Todo lo que necesitas para tu hogar',
      items: ['Frescos', 'Despensa', 'Bebidas', 'Hogar', 'Cuidado personal'],
      gradient: 'var(--gradient-market)',
      icon: '🛒'
    },
    {
      id: 'agro',
      name: 'Agro',
      description: 'Productos frescos del campo',
      items: ['Vegetales', 'Mascotas', 'Jardin', 'Frutas', 'Herramientas'],
      gradient: 'var(--gradient-agro)',
      icon: '🌿'
    }
  ];

  let activeCategory = $state(0);

  function setActiveCategory(index: number) {
    activeCategory = index;
  }
</script>

<section class="categories" id="categorias">
  <div class="container">
    <div class="section-header">
      <span class="section-tag">Categorias</span>
      <h2 class="section-title">Todo lo que buscas, en un solo lugar</h2>
      <p class="section-description">
        Explora nuestras categorias y encuentra exactamente lo que necesitas con la ayuda de nuestra IA.
      </p>
    </div>

    <div class="categories-nav">
      {#each categories as category, index}
        <button
          class="category-tab"
          class:active={activeCategory === index}
          onclick={() => setActiveCategory(index)}
          aria-selected={activeCategory === index}
        >
          <span class="tab-icon">{category.icon}</span>
          <span class="tab-name">{category.name}</span>
        </button>
      {/each}
    </div>

    <div class="categories-content">
      {#each categories as category, index}
        {#if activeCategory === index}
          <div class="category-card" style="background: {category.gradient}">
            <div class="card-content">
              <div class="card-header">
                <span class="card-icon">{category.icon}</span>
                <h3 class="card-title">{category.name}</h3>
              </div>
              <p class="card-description">{category.description}</p>
              <ul class="card-items">
                {#each category.items as item}
                  <li class="card-item">{item}</li>
                {/each}
              </ul>
              <button class="card-cta">
                Explorar {category.name}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
            <div class="card-visual">
              <div class="visual-circle"></div>
              <div class="visual-circle secondary"></div>
            </div>
          </div>
        {/if}
      {/each}
    </div>

    <div class="categories-grid">
      {#each categories as category, index}
        <button
          class="category-mini-card"
          class:active={activeCategory === index}
          onclick={() => setActiveCategory(index)}
        >
          <div class="mini-gradient" style="background: {category.gradient}"></div>
          <span class="mini-icon">{category.icon}</span>
          <span class="mini-name">{category.name}</span>
        </button>
      {/each}
    </div>
  </div>
</section>

<style>
  .categories {
    padding: var(--spacing-4xl) 0;
    background: var(--color-surface);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);
  }

  .section-header {
    text-align: center;
    margin-bottom: var(--spacing-3xl);
  }

  .section-tag {
    display: inline-block;
    padding: var(--spacing-xs) var(--spacing-md);
    background: var(--color-surface-variant);
    color: var(--color-button);
    font-size: var(--font-size-sm);
    font-weight: 600;
    border-radius: var(--radius-full);
    margin-bottom: var(--spacing-md);
  }

  .section-title {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    color: var(--color-primary);
    letter-spacing: -0.02em;
    margin-bottom: var(--spacing-md);
  }

  .section-description {
    font-size: var(--font-size-lg);
    color: var(--color-text-variant);
    max-width: 540px;
    margin: 0 auto;
  }

  .categories-nav {
    display: none;
    justify-content: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-2xl);
  }

  .category-tab {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-xl);
    background: var(--color-surface-variant);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text);
    transition: all var(--transition-base);
  }

  .category-tab:hover {
    background: var(--color-primary);
    color: var(--color-surface);
  }

  .category-tab.active {
    background: var(--color-primary);
    color: var(--color-surface);
  }

  .tab-icon {
    font-size: var(--font-size-lg);
  }

  .categories-content {
    margin-bottom: var(--spacing-2xl);
  }

  .category-card {
    position: relative;
    border-radius: var(--radius-xl);
    padding: var(--spacing-2xl);
    overflow: hidden;
    min-height: 400px;
    display: flex;
    align-items: center;
  }

  .card-content {
    position: relative;
    z-index: 2;
    color: white;
    max-width: 500px;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .card-icon {
    font-size: 2.5rem;
  }

  .card-title {
    font-size: var(--font-size-3xl);
    font-weight: 700;
  }

  .card-description {
    font-size: var(--font-size-lg);
    opacity: 0.9;
    margin-bottom: var(--spacing-xl);
  }

  .card-items {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xl);
  }

  .card-item {
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    backdrop-filter: blur(10px);
  }

  .card-cta {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-xl);
    background: rgba(255, 255, 255, 0.95);
    color: var(--color-primary);
    font-weight: 600;
    border-radius: var(--radius-full);
    transition: all var(--transition-base);
  }

  .card-cta:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .card-visual {
    position: absolute;
    right: -100px;
    top: 50%;
    transform: translateY(-50%);
  }

  .visual-circle {
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
  }

  .visual-circle.secondary {
    position: absolute;
    width: 250px;
    height: 250px;
    top: 50%;
    left: 50%;
    transform: translate(-30%, -50%);
    background: rgba(255, 255, 255, 0.15);
  }

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }

  .category-mini-card {
    position: relative;
    padding: var(--spacing-xl);
    background: var(--color-surface-variant);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
    transition: all var(--transition-base);
    overflow: hidden;
  }

  .category-mini-card:hover,
  .category-mini-card.active {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  .category-mini-card.active {
    border: 2px solid var(--color-primary);
  }

  .mini-gradient {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity var(--transition-base);
  }

  .category-mini-card:hover .mini-gradient,
  .category-mini-card.active .mini-gradient {
    opacity: 0.1;
  }

  .mini-icon {
    font-size: 2rem;
    position: relative;
    z-index: 1;
  }

  .mini-name {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text);
    position: relative;
    z-index: 1;
  }

  @media (min-width: 640px) {
    .categories-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (min-width: 768px) {
    .categories-nav {
      display: flex;
    }

    .categories-grid {
      display: none;
    }

    .category-card {
      padding: var(--spacing-3xl);
    }
  }

  @media (min-width: 1024px) {
    .card-visual {
      right: 50px;
    }

    .visual-circle {
      width: 500px;
      height: 500px;
    }
  }
</style>
