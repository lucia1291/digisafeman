const CACHE_NAME = "digisafeman-v2";
const ASSETS = [
  "/digisafeman/",
  "/digisafeman/index.html",
  "/digisafeman/manifest.webmanifest",

  "/digisafeman/style/style.css",
  "/digisafeman/style/fontstyle.css",
  "/digisafeman/style/hamMenuHidden.css",

  "/digisafeman/js/menu.js",
  "/digisafeman/js/header.js",
  "/digisafeman/js/bottomnav.js",
  "/digisafeman/js/breadcrumb.js",

  "/digisafeman/resources/icons/icon-192.png",
  "/digisafeman/resources/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("fetch", (event) => {
  event.respondWith(caches.match(event.request).then((r) => r || fetch(event.request)));
});


self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});