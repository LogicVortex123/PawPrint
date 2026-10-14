/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Fail instead of drifting to 5174 — Google Sign-In only works on origins
    // registered for the OAuth client, so the dev URL must stay fixed
    strictPort: true,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Libraries change rarely — a separate chunk stays cached across app deploys
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['zustand', 'lucide-react'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
