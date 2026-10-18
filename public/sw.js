// Service worker: guarda o app no celular para abrir mesmo sem internet.
// Troque a versão quando mudar esta lógica, para descartar o cache antigo.
const CACHE = "dia-a-dia-v1";

// Na instalação, baixa a página e todos os arquivos que ela referencia.
// Os nomes dos arquivos do Vite mudam a cada build (index-AbC123.js),
// então lemos os nomes direto do HTML em vez de fixá-los aqui.
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      const html = await (await fetch("./", { cache: "no-store" })).text();
      const assets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
        .map((m) => m[1])
        .filter((url) => !url.startsWith("http"));
      await cache.addAll(["./", ...new Set(assets)]);
      await self.skipWaiting();
    })(),
  );
});

// Ao ativar uma versão nova, apaga os caches das versões antigas.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  // Página: tenta a rede primeiro (para receber atualizações) e cai no cache se estiver offline.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        try {
          const fresh = await fetch(request);
          cache.put("./", fresh.clone());
          return fresh;
        } catch {
          return (await cache.match("./")) ?? Response.error();
        }
      })(),
    );
    return;
  }

  // Demais arquivos (JS, CSS, ícones): cache primeiro. Como o nome muda a cada build,
  // um arquivo em cache nunca fica desatualizado.
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) (await caches.open(CACHE)).put(request, response.clone());
      return response;
    })(),
  );
});
