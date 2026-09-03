import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
// Alvo do proxy do backend Flask. Fora do Docker é localhost:5001; dentro
// do docker-compose, o serviço do backend não é acessível por "localhost"
// (cada serviço tem sua própria rede), então o compose passa
// API_PROXY_TARGET=http://backend:5001 (o nome do serviço vira o host).
const apiProxyTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:5001';

export default defineConfig({
  base: '/Pizzaria-Callidus/',
  server: {
    // 0.0.0.0: preciso disso pra o Vite aceitar conexões vindas de fora do
    // container (senão só escuta em 127.0.0.1 e o host nunca alcança).
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      // Backend Flask (cadastro/login de funcionários), veja server/app.py.
      // Não colide com public/api/*.json, que é servido sob a base
      // "/Pizzaria-Callidus/api/...".
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: false,
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true, 
        type: 'module',
      },
      manifest: {
        name: 'Pizza Paradiso',
        short_name: 'Paradiso',
        description: 'Calma Calabreso!',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#ff2a2a',
        background_color: '#1a0d0a',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
      },
    }),
  ],
})