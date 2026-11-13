/* Offline support: network first, falling back to the last copy seen. Bump VERSION when files change shape.
   Old copies of the site are cleared on update; the tutor's saved pictures (procademy-pictures-*) are kept. */
const VERSION = 'procademy-v28';
const SHELL = ['./', './index.html', './app.css', './icon.svg', './icon-192.png', './apple-touch-icon.png', './manifest.webmanifest',
  './lib/boot.js', './lib/rng.js', './lib/math.js', './lib/content.js', './lib/store.js', './lib/engine.js', './lib/icons.js', './lib/prereq.js', './lib/views.js', './lib/cpm-views.js', './lib/tutor-page.js', './lib/worksheet.js', './lib/calc.js', './lib/steps.js', './lib/sprint.js', './lib/prep.js', './lib/badges.js', './lib/challenge.js', './lib/report.js', './lib/account.js', './lib/move.js', './lib/learners.js', './lib/whatsnew.js', './lib/unlimited.js', './lib/topicbank.js', './lib/topics.js', './lib/words.js', './lib/vocab.js', './lib/typing.js', './lib/es-questions.js', './lib/setup.js', './lib/tiles.js', './lib/chance.js', './lib/calculator.js', './lib/geometry.js', './lib/measure.js', './lib/numbers.js', './lib/data.js', './lib/shapes.js', './lib/percent.js', './lib/leap.js', './lib/balance.js', './lib/fractions.js', './lib/integers.js', './lib/firebase-config.js', './lib/tutor.js', './lib/draw.js', './lib/pictures.js', './lib/files.js', './lib/coach.js', './lib/tutor-ui.js', './lib/tutor-worker.js', './lib/placement.js', './lib/install.js', './lib/family.js', './lib/quicksearch.js', './lib/help.js', './lib/lang.js', './lib/app.js',
  './content/k.js', './content/g1.js', './content/g2.js', './content/g3.js', './content/g4.js', './content/g5.js', './content/g6.js', './content/math7.js', './content/math8.js', './content/alg1.js', './content/geo.js', './content/alg2.js', './content/precalc.js', './content/calc.js', './content/trig.js', './content/stats.js', './content/calcbc.js', './content/sat.js', './content/comp.js', './content/finance.js', './content/logic.js', './content/hindi.js', './content/int1.js', './content/int2.js', './content/int3.js', './cpm/cc1.js', './cpm/cc2.js', './cpm/cc3.js', './cpm/int1.js', './cpm/int2.js', './cpm/int3.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => /^procademy-v\d+$/.test(k) && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// the network first, so a fix is seen at once; but when the network is down, or slower than SLOW, the copy kept
// from last time is shown straight away (and the fresh one still replaces it for next time)
const SLOW = 3000;
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  const net = fetch(e.request).then(res => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); } return res; });
  e.respondWith(new Promise(resolve => {
    let done = false;
    const answer = r => { if (!done && r) { done = true; resolve(r); } };
    const timer = setTimeout(() => caches.match(e.request).then(answer), SLOW);         // slow: only this file's own copy will do
    net.then(r => { clearTimeout(timer); answer(r); }, () => { clearTimeout(timer); caches.match(e.request).then(r => r || caches.match('./index.html')).then(r => answer(r || Response.error())); });
  }));
  e.waitUntil(net.catch(() => {}));
});
