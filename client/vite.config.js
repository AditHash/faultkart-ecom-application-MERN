import { defineConfig } from 'vite';

// Local development defaults to loopback. Compose config overrides these values
// to let the separate frontend container proxy /api to the API container.
export default defineConfig({
  server: {
    host: process.env.VITE_HOST || '127.0.0.1',
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:4000',
        changeOrigin: true
      }
    }
  }
});
