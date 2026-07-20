const CACHE = 'scribe-v8-2026-07-19G';
const SHELL = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
// App shell: cache-first. CDN/model files: network with cache fallback
// (the AI library additionally keeps model weights in its own browser cache for offline use).
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    e.respondWith(caches.match(e.request, {ignoreSearch:true}).then(r => r || fetch(e.request)));
  } else {
    e.respondWith(
      caches.open('scribe-ext').then(c =>
        fetch(e.request).then(res => { if(res.ok) c.put(e.request, res.clone()); return res; })
        .catch(() => c.match(e.request))
      )
    );
  }
});
