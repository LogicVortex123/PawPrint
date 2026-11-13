/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Production builds call this API when VITE_API_URL is not set.
const DEPLOYED_API_URL = 'https://pawprint-2.onrender.com';

// Vercel sets VERCEL=1. A localhost API URL must not be baked into that build.
function assertDeployApiUrl(mode: string) {
  if (process.env.VERCEL !== '1' || mode !== 'production') return;
  const apiUrl = (process.env.VITE_API_URL || DEPLOYED_API_URL).trim().replace(/\/$/, '');
  const localhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(apiUrl);
  if (!apiUrl.startsWith('https://') || localhost) {
    throw new Error(
      'Set VITE_API_URL to https://pawprint-2.onrender.com (no trailing slash) in the Vercel project’s environment variables, then redeploy. Vite bakes this value into the browser bundle.',
    );
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  assertDeployApiUrl(mode);
  return {
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
  };
});
