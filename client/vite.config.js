import { defineConfig } from 'vite';
export default defineConfig({ server: { proxy: { '/api': process.env.FAULTKART_API_URL || 'http://127.0.0.1:4000' } } });
