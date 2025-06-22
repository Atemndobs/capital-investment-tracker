import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', 'VITE_');
    return {
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt'],
          manifest: {
            name: 'Capital Investment Tracker',
            short_name: 'Investment Tracker',
            description: 'Track and manage your capital investments with detailed analytics and insights',
            theme_color: '#6A4DF3',
            background_color: '#161718',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            icons: [
              {
                src: 'icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'icons/icon-384x384.png',
                sizes: '384x384',
                type: 'image/png'
              },
              {
                src: 'icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                  }
                }
              },
              {
                urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'gstatic-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                  }
                }
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'process.env.SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
        'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
        'process.env.PUBLIC_POSTHOG_KEY': JSON.stringify(env.VITE_PUBLIC_POSTHOG_KEY),
        'process.env.PUBLIC_POSTHOG_HOST': JSON.stringify(env.VITE_PUBLIC_POSTHOG_HOST)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      esbuild: {
        jsx: 'automatic'
      }
    };
});
