import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: '/',
          name: 'Linehaul Strong - Trucker Fitness & Gym GPS',
          short_name: 'Linehaul',
          description: 'Tactical fitness, truck-accessible gym GPS locator with nearby parking, and road training protocols built for commercial truck drivers by AJ Risner.',
          theme_color: '#080A0C',
          background_color: '#080A0C',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          categories: ['health', 'fitness', 'navigation', 'lifestyle'],
          shortcuts: [
            {
              name: 'Rest Stop Protocol',
              short_name: 'Rest Stop',
              description: 'Launch daily 4-day cab and rest stop workout',
              url: '/?tab=rest-stop',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
            },
            {
              name: 'Gyms & Truck Parking GPS',
              short_name: 'Gym GPS',
              description: 'Find commercial truck stop and 24/7 gym pairings',
              url: '/?tab=hub-runner',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
            },
            {
              name: 'Dock Door Drills',
              short_name: 'Dock Drills',
              description: '5-10 minute micro routines while waiting at shippers',
              url: '/?tab=dock-drills',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
            },
            {
              name: 'Workout Logbook',
              short_name: 'Logbook',
              description: 'Track your training consistency and recovery',
              url: '/?tab=logbook',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
            }
          ],
          icons: [
            {
              src: '/icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
