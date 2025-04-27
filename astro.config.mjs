// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://your-portfolio-site.com',
  compressHTML: true,
  build: {
    assets: '_assets'
  },
  vite: {
    build: {
      cssMinify: true
    },
    ssr: {
      noExternal: ['astro']
    }
  }
});
