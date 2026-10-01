// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  // Las rutas /privacy y /terms (nombres en inglés, enlazadas desde versiones
  // antiguas de las apps y del backend) apuntan a las páginas en español.
  redirects: {
    '/privacy': '/privacidad',
    '/terms': '/terminos'
  },
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [svelte()]
});
