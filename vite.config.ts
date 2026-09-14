import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'Inkify',
        short_name: 'Inkify',
        description: 'Offline-first notes & sketch PWA',
        theme_color: '#6366f1',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        categories: ['productivity', 'utilities'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        screenshots: [
          {
            src: 'screenshots/hero-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
          },
          {
            src: 'screenshots/hero-narrow.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
          },
        ],
        shortcuts: [
          {
            name: 'New Note',
            short_name: 'Note',
            url: '/notes/new',
            icons: [{ src: 'icons/shortcut-note.png', sizes: '96x96' }],
          },
          {
            name: 'New Sketch',
            short_name: 'Sketch',
            url: '/sketch/new',
            icons: [{ src: 'icons/shortcut-sketch.png', sizes: '96x96' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: true },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          tiptap: ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/pm'],
        },
      },
    },
  },
});
