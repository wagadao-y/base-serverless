import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { SERVER_PROXY_TARGET } from './.env';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],

  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  },
  server: {
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: SERVER_PROXY_TARGET,
        changeOrigin: true
      }
    },
    port: 5173
  }
});
