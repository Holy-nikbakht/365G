const CACHE_VERSION = 'hamrah350-v9';
const CACHE_URLS = [
  './', './index.html', './manifest.webmanifest', './css/app.css',
  './js/app.js', './js/db.js', './js/jalali.js', './js/ui.js', './js/scoring.js',
  './js/ai.js', './js/gamification.js', './js/notify.js',
  './js/views/now.js', './js/views/today.js', './js/views/schedule.js',
  './js/views/calendar.js', './js/views/habits.js', './js/views/score.js',
  './js/views/domains.js', './js/views/journal.js', './js/views/ai.js',
  './js/views/reports.js', './js/views/more.js', './js/views/notify-ui.js',
  './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(CACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (!resp || resp.status !== 200 || resp.type !== 'basic') return resp;
        const clone = resp.clone();
        caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
        return resp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
