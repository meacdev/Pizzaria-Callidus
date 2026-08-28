/// <reference lib="webworker" />
// @ts-nocheck
// (o tsconfig do projeto usa lib "DOM", que conflita com os tipos de Service Worker;
//  o Vite/esbuild processa este arquivo separado do `tsc -b` do build principal)
//
// IMPORTANTE: rode `npm install workbox-expiration` — é o único pacote workbox
// usado aqui que ainda não está no seu package.json (os outros quatro já estão).

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope;

// injetado automaticamente pelo vite-plugin-pwa no build (lista de assets do app)
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Ativa o novo SW imediatamente, sem esperar todas as abas antigas fecharem
self.skipWaiting();
self.addEventListener('activate', () => {
  self.clients.claim();
});

// --- Cache dos dados do cardápio (pizzas, bebidas, combos) ---
// StaleWhileRevalidate: mostra o que já tem em cache na hora, e atualiza em segundo plano.
// Bom pra esse caso: cardápio muda pouco, mas não pode ficar preso a uma versão velha pra sempre.
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'pizzaria-api-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 }), // 1 dia
    ],
  }),
);

// --- Cache de imagens (logo, banner, fotos de produtos externas) ---
// CacheFirst: imagem não muda depois de publicada, não precisa checar rede toda vez.
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'pizzaria-imagens-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }), // 30 dias
    ],
  }),
);

// --- Navegação (rotas do app, tipo /cardapio, /checkout etc.) ---
// NetworkFirst: tenta buscar a versão mais nova da rede; se estiver offline, cai no cache.
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pizzaria-paginas-cache',
  }),
);
