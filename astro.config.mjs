// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://portanio.vercel.app',
  integrations: [svelte(), sitemap(), icon()],
  vite: {
    plugins: [tailwindcss()]
  }
});