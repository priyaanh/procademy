/* Offline support: network first, falling back to the last copy seen. Bump VERSION when files change shape.
   Old copies of the site are cleared on update; the tutor's saved pictures (procademy-pictures-*) are kept. */
const VERSION = 'procademy-v18';
const SHELL = ['./', './index.html', './app.css', './icon.svg', './manifest.webmanifest',
  './lib/boot.js', './lib/rng.js', './lib/math.js', './lib/content.js', './lib/store.js', './lib/engine.js', './lib/views.js', './lib/cpm-views.js', './lib/tutor-page.js', './lib/worksheet.js', './lib/calc.js', './lib/steps.js', './lib/sprint.js', './lib/prep.js', './lib/badges.js', './lib/challenge.js', './lib/report.js', './lib/account.js', './lib/move.js', './lib/learners.js', './lib/whatsnew.js', './lib/unlimited.js', './lib/words.js', './lib/vocab.js', './lib/setup.js', './lib/tiles.js', './lib/chance.js', './lib/calculator.js', './lib/numbers.js', './lib/data.js', './lib/shapes.js', './lib/percent.js', './lib/leap.js', './lib/fractions.js', './lib/integers.js', './lib/firebase-config.js', './lib/tutor.js', './lib/draw.js', './lib/pictures.js', './lib/files.js', './lib/coach.js', './lib/tutor-ui.js', './lib/tutor-worker.js', './lib/app.js',
  './content/k.js', './content/g1.js', './content/g2.js', './content/g3.js', './content/g4.js', './content/g5.js', './content/g6.js', './content/math7.js', './content/math8.js', './content/alg1.js', './content/geo.js', './content/alg2.js', './content/precalc.js', './content/int1.js', './content/int2.js', './content/int3.js', './cpm/cc1.js', './cpm/cc2.js', './cpm/cc3.js', './cpm/int1.js', './cpm/int2.js', './cpm/int3.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => /^procademy-v\d+$/.test(k) && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res; }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
