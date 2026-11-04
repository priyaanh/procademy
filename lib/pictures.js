/* Pictures from words: a free picture AI draws what the learner asks for ("draw me a castle").

   Only on request, and never for math: graphs, number lines and shapes are drawn exactly by lib/draw.js,
   because picture AIs get numbers and labels wrong. The service is Pollinations' free image API: no key,
   no account, one picture at a time, at most one every 45 seconds per connection, and sometimes full.
   Procademy waits and tries again by itself, with a countdown. Safe mode is always on, and requests that
   are not right for school are refused here, before anything is sent. What is sent: the words describing
   the picture. A finished picture is kept on this device (the Cache API), so saved chats show it again. */
'use strict';
(function () {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const BASE = 'https://image.pollinations.ai/prompt/';
  const GAP = 45;                    // seconds between free pictures
  const PATIENCE = 180;              // longest wait for a free slot, in seconds
  const CACHE = 'procademy-pictures-v1';
  const SIZE = 512;

  // math is drawn exactly by DRAW; these words send a request there instead
  const MATHY = /\b(graph|plot|chart|number\s*line|axis|axes|coordinate|equation|function|histogram|box\s*plot|dot\s*plot|fraction|triangle|rectangle|square|circle|polygon|angle|parabola|slope|line|segment|ray|vector|y\s*=|x\s*=|\d\s*\/\s*\d)\b/i;
  const ASK = /\b(?:picture|image|photo|illustration|drawing|painting|artwork|art|cartoon|poster|wallpaper|sketch)\s+(?:of|showing|with|for)\s+(.+)$|\b(?:draw|paint|generate|create|make|show)\s+(?:me\s+)?(?:a|an|some|the)?\s*(?:picture|image|photo|illustration|painting|cartoon|drawing|poster)\s+(?:of\s+)?(.+)$|^\s*(?:can you |could you |please )?(?:draw|paint)\s+(?:me\s+)?((?:a|an|some|the|my)\s+.+)$|\banother\s+(?:version|picture|one)\s+of:?\s+(.+)$/i;
  // not for a school site: refused before anything is sent
  const UNSAFE = /\b(nude|naked|nsfw|sex|sexy|porn|boob|breast|lingerie|bikini|underwear|gore|gory|blood(y)?|corpse|dead\s+body|kill(ing)?|murder|suicide|self[- ]harm|torture|behead|shoot(ing)?|gun|rifle|weapon|bomb|terror|drug|cocaine|weed|marijuana|alcohol|beer|vodka|cigarette|vape|nazi|swastika|racist|kkk)\b/i;

  /** the picture a message asks for: { prompt } or null (math requests go to DRAW instead) */
  function wants(text) {
    const s = String(text || '').trim();
    if (!s || s.length > 400) return null;
    const m = ASK.exec(s);
    if (!m) return null;
    const subject = (m[1] || m[2] || m[3] || m[4] || '').replace(/[?.!]+$/, '').replace(/\s+(please|pls|for me|thanks|thank you)$/i, '').trim();
    if (!subject || subject.length < 2) return null;
    if (MATHY.test(subject) && !/^(a|an|the|some)?\s*(picture|photo)/i.test(subject)) return null;
    return { prompt: subject };
  }
  const blocked = prompt => UNSAFE.test(String(prompt || ''));
  const urlOf = pic => `${BASE}${encodeURIComponent(pic.prompt)}?width=${SIZE}&height=${SIZE}&seed=${pic.seed}&safe=true&private=true`;
  const keyOf = pic => 'p' + (pic.seed >>> 0).toString(36) + '-' + Array.from(pic.prompt).reduce((h, c) => ((h << 5) + h + c.charCodeAt(0)) | 0, 5381).toString(36).replace('-', 'n');

  const states = new Map();          // key → { status: loading | waiting | ready | error, url, seconds, error }
  let nextFree = 0, queue = Promise.resolve();
  const P = {
    GAP,
    /** tests replace this with a fake fetch */
    fetch: (...a) => fetch(...a),
    wants, blocked, urlOf,
    /** a new picture request with a fresh random seed */
    make(prompt) { return { prompt: String(prompt).slice(0, 300), seed: Math.floor(Math.random() * 1e9) }; },
    state(pic) { return states.get(keyOf(pic)) || null; },
    /** the picture as HTML; starts loading it the first time */
    html(pic) {
      if (!pic || !pic.prompt) return '';
      const key = keyOf(pic);
      if (!states.has(key)) load(pic);
      return `<figure class="pic" data-pic="${key}">${inner(pic, states.get(key))}</figure>`;
    },
    _reset() { states.clear(); nextFree = 0; queue = Promise.resolve(); },
  };

  function inner(pic, st) {
    st = st || { status: 'loading' };
    const cap = `<figcaption class="tiny muted">${esc(pic.prompt)} · created by a free picture AI (Pollinations). AI pictures may show numbers and words incorrectly.</figcaption>`;
    if (st.status === 'ready') {
      return `<img src="${esc(st.url)}" alt="${esc('A picture of ' + pic.prompt)}" width="${SIZE}" height="${SIZE}" loading="lazy">${cap}
        <div class="viz-bar"><a class="viz-btn" href="${esc(st.url)}" download="procademy-picture.jpg">Save the picture</a><button type="button" class="viz-btn" data-ask="${esc('Another version of: ' + pic.prompt)}">Create another version</button></div>`;
    }
    if (st.status === 'error') return `<div class="pic-wait"><p>${esc(st.error)}</p><button type="button" class="viz-btn" data-ask="${esc('Another version of: ' + pic.prompt)}">Try again</button></div>${cap}`;
    const msg = st.status === 'waiting' ? `The free picture service creates one picture at a time. Your picture will start in ${st.seconds} s…` : 'Creating your picture (about 10 seconds)…';
    return `<div class="pic-wait"><span class="pic-spin" aria-hidden="true"></span><p>${esc(msg)}</p></div>${cap}`;
  }
  function set(pic, st) {
    const key = keyOf(pic);
    states.set(key, st);
    if (typeof document === 'undefined') return;
    document.querySelectorAll(`[data-pic="${key}"]`).forEach(el => { el.innerHTML = inner(pic, st); });
  }
  async function fromCache(url) {
    try { if (typeof caches === 'undefined') return null; const c = await caches.open(CACHE); const r = await c.match(url); return r ? URL.createObjectURL(await r.blob()) : null; } catch (e) { return null; }
  }
  async function toCache(url, blob) {
    try { if (typeof caches === 'undefined') return; const c = await caches.open(CACHE); await c.put(url, new Response(blob, { headers: { 'Content-Type': blob.type || 'image/jpeg' } })); } catch (e) { /* the picture still shows */ }
  }
  function load(pic) {
    if (blocked(pic.prompt)) { set(pic, { status: 'error', error: 'Procademy can’t create that picture. Request something suitable for school, such as a diagram for a word problem.' }); return; }
    set(pic, { status: 'loading' });
    const url = urlOf(pic);
    queue = queue.then(async () => {
      const kept = await fromCache(url);
      if (kept) { set(pic, { status: 'ready', url: kept }); return; }
      await fetchOne(pic, url);
    }).catch(() => set(pic, { status: 'error', error: 'An error occurred while creating the picture.' }));
  }
  async function countdown(pic, ms) {
    const until = Date.now() + ms;
    while (Date.now() < until) {
      set(pic, { status: 'waiting', seconds: Math.ceil((until - Date.now()) / 1000) });
      await new Promise(r => setTimeout(r, Math.min(1000, Math.max(0, until - Date.now()))));
    }
  }
  async function fetchOne(pic, url) {
    const started = Date.now();
    for (let tries = 0; tries < 14; tries++) {
      const wait = nextFree - Date.now();
      if (wait > 0) {
        if (Date.now() + wait - started > PATIENCE * 1000) break;
        await countdown(pic, wait);
      }
      set(pic, { status: 'loading' });
      let res;
      const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timer = setTimeout(() => ctrl && ctrl.abort(), 90000);
      try { res = await P.fetch(url, { signal: ctrl ? ctrl.signal : undefined, headers: { Accept: 'image/*' } }); }
      catch (e) { clearTimeout(timer); nextFree = Date.now() + 8000; continue; }
      clearTimeout(timer);
      const type = (res.headers.get('Content-Type') || '').toLowerCase();
      if (res.ok && /^image\/(jpeg|png|webp)/.test(type)) {
        const blob = await res.blob();
        if (blob.size > 1500) {
          nextFree = Date.now() + GAP * 1000;
          const obj = URL.createObjectURL(blob);
          set(pic, { status: 'ready', url: obj });
          toCache(url, blob);
          return;
        }
      }
      // busy (503), over the free limit (402, 429) or a hiccup: wait as long as it asks, then try again
      if ([402, 408, 425, 429, 500, 502, 503, 504].includes(res.status) || res.ok) {
        const ra = Number(res.headers.get('Retry-After'));
        nextFree = Date.now() + Math.min(60, Math.max(3, isFinite(ra) && ra > 0 ? ra : 12)) * 1000;
        continue;
      }
      set(pic, { status: 'error', error: res.status === 400 || res.status === 403 || res.status === 451 ? 'The picture service declined that request. Try describing the picture another way.' : 'The picture service couldn’t create that picture at this time.' });
      return;
    }
    set(pic, { status: 'error', error: 'The free picture service is very busy. Try again in a minute or two.' });
  }

  window.PICTURES = P;
})();
