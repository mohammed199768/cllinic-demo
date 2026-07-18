/* OurClinic production service worker. No user-entered data is cached. */
const VERSION = "our-clinic-v3";
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const MEDIA_CACHE = `${VERSION}-media`;
const OFFLINE_URL = "/~offline";
const PRECACHE = [OFFLINE_URL, "/icon.svg", "/pwa/icon-192.png", "/pwa/icon-512.png"];
const LARGE_MEDIA = /\/clinic-media\/(?:video|frames)\//;
let developmentDetected = false;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("our-clinic-") && !key.startsWith(VERSION)).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

async function trim(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - maxEntries)).map((key) => cache.delete(key)));
}

async function networkFirst(request) {
  const cache = await caches.open(PAGE_CACHE);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);
  try {
    const response = await fetch(request, { signal: controller.signal });
    if (response.headers.get("x-ourclinic-runtime") === "development") {
      developmentDetected = true;
      await Promise.all([
        self.registration.unregister(),
        caches.keys().then((keys) => Promise.all(
          keys.filter((key) => key.startsWith("our-clinic-")).map((key) => caches.delete(key)),
        )),
      ]);
      return response;
    }
    if (response.ok) { await cache.put(request, response.clone()); await trim(PAGE_CACHE, 24); }
    return response;
  } catch {
    return (await cache.match(request)) || (await caches.match(OFFLINE_URL));
  } finally { clearTimeout(timeout); }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || LARGE_MEDIA.test(url.pathname) || url.pathname === "/sw.js") return;
  if (developmentDetected) { event.respondWith(fetch(request)); return; }
  if (request.mode === "navigate") { event.respondWith(networkFirst(request)); return; }
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(caches.open(STATIC_CACHE).then(async (cache) => (await cache.match(request)) || fetch(request).then((response) => { if (response.ok) cache.put(request, response.clone()); return response; })));
    return;
  }
  if (/\.(?:png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(url.pathname)) {
    event.respondWith(caches.open(MEDIA_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request).then((response) => { if (response.ok) { cache.put(request, response.clone()); trim(MEDIA_CACHE, 60); } return response; }).catch(() => cached);
      return cached || network;
    }));
  }
});
