// Caché sencilla: tras la primera visita la web funciona sin conexión.
const V = 'fichas-v2';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V && k !== 'fichas-preview').map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  // vista previa del PDF generada en la página (se guarda en 'fichas-preview' con un nombre legible)
  if (new URL(e.request.url).pathname.indexOf('/preview/') !== -1) {
    e.respondWith(caches.open('fichas-preview').then((c) => c.match(e.request, { ignoreSearch: true })).then((r) => r || new Response('', { status: 404 })));
    return;
  }
  e.respondWith(
    fetch(e.request).then((r) => {
      const c = r.clone();
      caches.open(V).then((ch) => ch.put(e.request, c));
      return r;
    }).catch(() => caches.match(e.request))
  );
});
