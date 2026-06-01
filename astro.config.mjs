import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { fileURLToPath, URL } from 'node:url';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
const projectId = env.PUBLIC_SANITY_PROJECT_ID || 'hct2hzrl';
const dataset = env.PUBLIC_SANITY_DATASET || 'production';
const apiVersion = env.PUBLIC_SANITY_API_VERSION || '2026-05-27';

export default defineConfig({
  site: env.PUBLIC_SITE_URL || 'https://tahiti-guest-boat.com',
  vite: {
    plugins: [tailwindcss()],
    server: {
      hmr: false,
    },
    optimizeDeps: {
      include: ['react/compiler-runtime'],
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
  integrations: [
    sitemap(),
    sanity({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
    }),
    react({
      include: [/\.[tj]sx$/],
    }),
  ],
});
