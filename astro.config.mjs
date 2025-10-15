import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dragosroua.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
  output: 'static',
});