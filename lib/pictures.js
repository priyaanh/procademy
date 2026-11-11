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

  /* ---------- diagrams drawn exactly: bar models (tape diagrams) and labeled shapes ----------
     The tutor writes a short block, the same way it writes a graph, and Procademy draws it to scale here:
       ```barmodel               ```shape
       Boys: 3                   rectangle 8 by 5 cm
       Girls: 5                  right triangle 6 8 ?
       total: 40                 circle radius 4
       ```                       angle 35
                                 ```
     A bar model never works the problem out: it shows only the numbers it is given. Nothing is sent anywhere. */
  const DG_LANGS = /^(barmodel|bar-model|bar_model|tape|tapediagram|tape-diagram|stripdiagram|shape|shapes|geometry)$/i;
  const isDiagram = lang => DG_LANGS.test(String(lang || ''));
  const kindOfDg = lang => (/shape|geometry/i.test(lang) ? 'shape' : 'barmodel');
  const NUM = '(-?\\d+(?:\\.\\d+)?)';
  const isNum = v => typeof v === 'number' && isFinite(v);
  const fmt = v => (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : String(Math.round(v * 100) / 100));
  const clip = (t, n) => { t = String(t || '').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; };

  function parseBars(body) {
    const spec = { rows: [], total: null, unit: null, title: '' };
    String(body || '').split('\n').map(l => l.trim()).filter(Boolean).slice(0, 12).forEach(line => {
      let m;
      if ((m = /^(?:title|caption)\s*[:=]\s*(.+)$/i.exec(line))) { spec.title = clip(m[1].replace(/"/g, ''), 60); return; }
      if ((m = /^(?:total|whole|altogether|in all)\s*[:=]\s*("?)([^"]{1,16})\1\s*$/i.exec(line))) { spec.total = m[2].trim(); return; }
      if ((m = /^(?:unit|each|one part|1 part|part)\s*[:=]\s*("?)([^"]{1,12})\1\s*$/i.exec(line))) { spec.unit = m[2].trim(); return; }
      m = /^(.{1,24}?)\s*[:=]\s*(\d{1,3}(?:\.\d+)?)\s*(parts?|units?|boxes|equal parts)?\s*(?:[,;(]\s*(\d{1,2})\s*shaded\s*\)?)?\s*(?:"([^"]{1,30})")?\s*$/i.exec(line);
      if (m) spec.rows.push({ label: clip(m[1].replace(/"/g, ''), 24), n: Number(m[2]), parts: !!m[3], shaded: m[4] != null ? Number(m[4]) : null, note: m[5] || '' });
    });
    if (!spec.rows.length) return null;
    // a count of equal parts (Boys: 3), or a quantity (Saved: 45) when the numbers are big and no row says "parts"
    spec.mode = spec.rows.every(r => r.parts || (r.n <= 12 && Number.isInteger(r.n))) ? 'units' : 'values';
    if (spec.mode === 'units') spec.rows.forEach(r => { r.n = Math.max(1, Math.min(12, Math.round(r.n))); if (r.shaded != null) r.shaded = Math.max(0, Math.min(r.n, r.shaded)); });
    return spec;
  }
  function barsSvg(spec) {
    const W = 440, L = 80, R = spec.total != null && spec.rows.length > 1 ? 60 : 12, RH = 34, GAP = 12;
    const top = spec.total != null && spec.rows.length === 1 ? 34 : 10;
    const H = top + spec.rows.length * (RH + GAP) - GAP + 12;
    const span = W - L - R;
    const out = [];
    if (spec.mode === 'units') {
      const most = Math.max.apply(null, spec.rows.map(r => r.n)), u = span / most;
      spec.rows.forEach((r, i) => {
        const y = top + i * (RH + GAP);
        out.push(`<text class="dg-label" x="${L - 10}" y="${y + RH / 2 + 5}" text-anchor="end">${esc(r.label)}</text>`);
        for (let k = 0; k < r.n; k++) {
          const on = r.shaded != null && k < r.shaded;
          out.push(`<rect class="dg-box${on ? ' on' : ''}" x="${(L + k * u).toFixed(1)}" y="${y}" width="${u.toFixed(1)}" height="${RH}" rx="3"/>`);
          if (spec.unit) out.push(`<text class="dg-val" x="${(L + k * u + u / 2).toFixed(1)}" y="${y + RH / 2 + 5}" text-anchor="middle">${esc(clip(spec.unit, 8))}</text>`);
        }
        if (r.note) out.push(`<text class="dg-note" x="${(L + r.n * u + 8).toFixed(1)}" y="${y + RH / 2 + 5}">${esc(r.note)}</text>`);
      });
    } else {
      const most = Math.max.apply(null, spec.rows.map(r => r.n)) || 1;
      spec.rows.forEach((r, i) => {
        const y = top + i * (RH + GAP), w = Math.max(28, span * r.n / most);
        out.push(`<text class="dg-label" x="${L - 10}" y="${y + RH / 2 + 5}" text-anchor="end">${esc(r.label)}</text>`);
        out.push(`<rect class="dg-box" x="${L}" y="${y}" width="${w.toFixed(1)}" height="${RH}" rx="3"/>`);
        out.push(`<text class="dg-val" x="${(L + w / 2).toFixed(1)}" y="${y + RH / 2 + 5}" text-anchor="middle">${esc(fmt(r.n))}</text>`);
      });
    }
    if (spec.total != null) {
      if (spec.rows.length === 1) {
        const r = spec.rows[0], w = spec.mode === 'units' ? span : Math.max(28, span);
        out.push(`<path class="dg-brace" d="M${L} ${top - 4} v-8 h${w} v8"/><text class="dg-total" x="${L + w / 2}" y="${top - 16}" text-anchor="middle">${esc(clip(spec.total, 16))}</text>`);
        void r;
      } else {
        const x = W - R + 10, y0 = top, y1 = top + spec.rows.length * (RH + GAP) - GAP;
        out.push(`<path class="dg-brace" d="M${x} ${y0} h8 v${y1 - y0} h-8"/><text class="dg-total" x="${x + 14}" y="${(y0 + y1) / 2 + 5}">${esc(clip(spec.total, 10))}</text>`);
      }
    }
    return `<svg class="dg-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(describeBars(spec))}">${out.join('')}</svg>`;
  }
  function describeBars(spec) {
    return 'a bar model: ' + spec.rows.map(r => `${r.label} ${spec.mode === 'units' ? `${r.n} equal part${r.n === 1 ? '' : 's'}${r.shaded != null ? `, ${r.shaded} shaded` : ''}` : fmt(r.n)}`).join('; ') +
      (spec.unit ? `; each part ${spec.unit}` : '') + (spec.total != null ? `; total ${spec.total}` : '');
  }

  /** a side length: a number (drawn to scale), or a short label such as x, 2x + 1 or ? */
  const sideOf = t => { t = String(t == null ? '' : t).trim().replace(/^"|"$/g, ''); const v = Number(t); return t && isFinite(v) && v > 0 ? { v, t: fmt(v) } : t ? { v: null, t: clip(t, 10) } : null; };
  function parseShapes(body) {
    const items = [];
    String(body || '').split('\n').map(l => l.trim().replace(/\s+/g, ' ')).filter(Boolean).slice(0, 4).forEach(line => {
      let m, unit = '';
      const um = /\s(cm|mm|m|km|in|ft|yd|mi|units?|inches|feet|meters|centimeters)\.?\s*$/i.exec(line);
      if (um) { unit = um[1].toLowerCase(); line = line.slice(0, um.index).trim(); }
      const low = line.toLowerCase().replace(/,/g, ' ').replace(/\s+and\s+/g, ' ').replace(/\b(with|sides?|of|legs?|length|lengths|that is|is)\b/g, ' ').replace(/\s+/g, ' ').trim();
      if ((m = /^square (\S+)$/.exec(low))) { const a = sideOf(m[1]); if (a) items.push({ type: 'rect', w: a, h: a, unit, square: true }); return; }
      if ((m = /^rectangle (?:width |w ?= ?|l ?= ?)?(\S+) (?:by|x|×|and|height|h ?= ?|w ?= ?)+ ?(\S+)$/.exec(low))) { const a = sideOf(m[1]), b = sideOf(m[2]); if (a && b) items.push({ type: 'rect', w: a, h: b, unit }); return; }
      if ((m = /^right triangle (\S+) (\S+)(?: (\S+))?$/.exec(low))) { const a = sideOf(m[1]), b = sideOf(m[2]); if (a && b) items.push({ type: 'right', a, b, c: sideOf(m[3]), unit }); return; }
      if ((m = /^triangle (\S+) (\S+) (\S+)$/.exec(low))) {
        const s3 = [sideOf(m[1]), sideOf(m[2]), sideOf(m[3])];
        if (s3.every(Boolean)) {
          const v = s3.map(x => x.v);
          const ok = v.every(isNum) && v[0] + v[1] > v[2] && v[0] + v[2] > v[1] && v[1] + v[2] > v[0];
          items.push({ type: 'tri', s: s3, scale: ok, unit });
        }
        return;
      }
      if ((m = /^circle (radius|r|diameter|d)\s*=?\s*(\S+)$/.exec(low)) || (m = /^circle (\S+) (radius|diameter)$/.exec(low))) {
        const isR = /^r/.test(m[1]) || /^r/.test(m[2]), val = sideOf(/^(radius|r|diameter|d)$/.test(m[1]) ? m[2] : m[1]);
        if (val) items.push({ type: 'circle', r: isR, val, unit }); return;
      }
      if ((m = /^angle (\d{1,3}(?:\.\d+)?)\s*(?:°|degrees?|deg)?$/.exec(low)) || (m = /^(\d{1,3}(?:\.\d+)?)\s*(?:°|degrees?|deg) angle$/.exec(low))) {
        const a = Number(m[1]); if (a > 0 && a < 360) items.push({ type: 'angle', a }); return;
      }
    });
    return items.length ? items : null;
  }
  const lab = (x, y, t, anchor) => `<text class="dg-label" x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor || 'middle'}">${esc(t)}</text>`;
  const withUnit = (s, unit) => (s.v != null && unit ? `${s.t} ${unit}` : s.t);
  /** a label for the side from p to q, set outside the shape (away from its center c) */
  function sideLabel(p, q, c, text) {
    const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    let nx = -(q[1] - p[1]), ny = q[0] - p[0];
    const len = Math.hypot(nx, ny) || 1; nx /= len; ny /= len;
    if ((mx - c[0]) * nx + (my - c[1]) * ny < 0) { nx = -nx; ny = -ny; }
    const x = mx + nx * 16, y = my + ny * 16 + 5;
    return lab(x, y, text, Math.abs(nx) > 0.6 ? (nx > 0 ? 'start' : 'end') : 'middle');
  }
  function shapeSvg(it) {
    const W = 260, H = 200, P = 52;
    let body = '', note = '';
    const fit = (pts) => {                       // scale points into the box, y up
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
      const x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
      const k = Math.min((W - 2 * P) / Math.max(1e-9, x1 - x0), (H - 2 * P) / Math.max(1e-9, y1 - y0));
      const ox = (W - (x1 - x0) * k) / 2, oy = (H - (y1 - y0) * k) / 2;
      return pts.map(p => [ox + (p[0] - x0) * k, H - (oy + (p[1] - y0) * k)]);
    };
    if (it.type === 'rect') {
      const w = it.w.v != null && it.h.v != null ? it.w.v : 1.6, h = it.w.v != null && it.h.v != null ? it.h.v : 1;
      const r = Math.max(w, h) / Math.min(w, h) > 6 ? (w > h ? [6, 1] : [1, 6]) : [w, h];
      const [a, b, c, d] = fit([[0, 0], [r[0], 0], [r[0], r[1]], [0, r[1]]]), ctr = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
      body = `<polygon class="dg-shape" points="${[a, b, c, d].map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}"/>` + sideLabel(a, b, ctr, withUnit(it.w, it.unit)) + (it.square ? '' : sideLabel(b, c, ctr, withUnit(it.h, it.unit)));
      note = it.square ? `a square with sides of ${withUnit(it.w, it.unit)}` : `a rectangle ${withUnit(it.w, it.unit)} by ${withUnit(it.h, it.unit)}`;
    } else if (it.type === 'right') {
      const a = it.a.v != null && it.b.v != null ? it.a.v : 4, b = it.a.v != null && it.b.v != null ? it.b.v : 3;
      const [A, B, C] = fit([[0, 0], [a, 0], [0, b]]), ctr = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
      const m = 12;
      body = `<polygon class="dg-shape" points="${[A, B, C].map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}"/><path class="dg-mark" d="M${A[0] + m} ${A[1]} v${-m} h${-m}"/>` +
        sideLabel(A, B, ctr, withUnit(it.a, it.unit)) + sideLabel(A, C, ctr, withUnit(it.b, it.unit)) + (it.c ? sideLabel(B, C, ctr, withUnit(it.c, it.unit)) : '');
      note = `a right triangle with legs ${withUnit(it.a, it.unit)} and ${withUnit(it.b, it.unit)}${it.c ? ` and hypotenuse ${withUnit(it.c, it.unit)}` : ''}`;
    } else if (it.type === 'tri') {
      // the longest side along the bottom; the third corner found from the other two sides
      const idx = [0, 1, 2].sort((i, j) => (it.s[j].v || 0) - (it.s[i].v || 0));
      const [c, a, b] = it.scale ? idx.map(i => it.s[i].v) : [5, 4, 3.5];
      const x = (b * b - a * a + c * c) / (2 * c), y = Math.sqrt(Math.max(0, b * b - x * x));
      const [A, B, C] = fit([[0, 0], [c, 0], [x, y]]), ctr = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
      body = `<polygon class="dg-shape" points="${[A, B, C].map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}"/>` +
        sideLabel(A, B, ctr, withUnit(it.s[idx[0]], it.unit)) + sideLabel(B, C, ctr, withUnit(it.s[idx[1]], it.unit)) + sideLabel(A, C, ctr, withUnit(it.s[idx[2]], it.unit));
      note = `a triangle with sides ${it.s.map(s => withUnit(s, it.unit)).join(', ')}`;
    } else if (it.type === 'circle') {
      const cx = W / 2, cy = H / 2, r = Math.min(W, H) / 2 - P / 2 - 4;
      body = `<circle class="dg-shape" cx="${cx}" cy="${cy}" r="${r}"/><circle class="dg-dot" cx="${cx}" cy="${cy}" r="3"/>` +
        (it.r ? `<path class="dg-line" d="M${cx} ${cy} H${cx + r}"/>${lab(cx + r / 2, cy - 8, 'r = ' + withUnit(it.val, it.unit))}`
          : `<path class="dg-line" d="M${cx - r} ${cy} H${cx + r}"/>${lab(cx, cy - 8, 'd = ' + withUnit(it.val, it.unit))}`);
      note = `a circle with ${it.r ? 'radius' : 'diameter'} ${withUnit(it.val, it.unit)}`;
    } else if (it.type === 'angle') {
      const vx = 70, vy = H - 50, len = 170, t = it.a * Math.PI / 180, ar = 38;
      const ex = vx + len * Math.cos(t), ey = vy - len * Math.sin(t);
      const big = it.a > 180 ? 1 : 0, mid = t / 2;
      body = `<path class="dg-line" d="M${vx + len} ${vy} H${vx} L${ex.toFixed(1)} ${ey.toFixed(1)}"/><circle class="dg-dot" cx="${vx}" cy="${vy}" r="3"/>` +
        (Math.abs(it.a - 90) < 1e-9 ? `<path class="dg-mark" d="M${vx + 16} ${vy} v-16 h-16"/>` : `<path class="dg-arc" d="M${vx + ar} ${vy} A${ar} ${ar} 0 ${big} 0 ${(vx + ar * Math.cos(t)).toFixed(1)} ${(vy - ar * Math.sin(t)).toFixed(1)}"/>`) +
        lab(vx + (ar + 22) * Math.cos(mid), vy - (ar + 22) * Math.sin(mid) + 5, fmt(it.a) + '°');
      note = `an angle of ${fmt(it.a)} degrees`;
    }
    return { svg: `<svg class="dg-svg dg-one" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(note)}">${body}</svg>`, note };
  }

  /** HTML for a ```barmodel or ```shape block (a placeholder while it is still arriving) */
  function diagram(lang, body, closed) {
    if (!closed) return '<div class="viz viz-wait">Drawing…</div>';
    if (kindOfDg(lang) === 'barmodel') {
      const spec = parseBars(body);
      if (!spec) return `<pre class="code">${esc(body)}</pre>`;
      return `<figure class="viz dg dg-bars">${spec.title ? `<figcaption class="dg-title">${esc(spec.title)}</figcaption>` : ''}<div class="dg-scroll">${barsSvg(spec)}</div></figure>`;
    }
    const items = parseShapes(body);
    if (!items) return `<pre class="code">${esc(body)}</pre>`;
    const drawn = items.map(shapeSvg), scaled = items.some(it => (it.type === 'rect' && it.w.v != null && it.h.v != null) || it.type === 'right' && it.a.v != null || it.type === 'tri' && it.scale);
    return `<figure class="viz dg dg-shapes"><div class="dg-row">${drawn.map(d => d.svg).join('')}</div>${scaled ? '<figcaption class="tiny muted">Drawn to scale by Procademy</figcaption>' : ''}</figure>`;
  }
  /** a drawing in words, for the tutor's context */
  function describe(viz) {
    const m = /^```([\w-]+)\n([\s\S]*?)\n?```$/.exec(String(viz || '').trim());
    if (!m || !isDiagram(m[1])) return '';
    if (kindOfDg(m[1]) === 'barmodel') { const spec = parseBars(m[2]); return spec ? describeBars(spec) : ''; }
    const items = parseShapes(m[2]); return items ? items.map(it => shapeSvg(it).note).join('; ') : '';
  }
  /** a bar model or a shape asked for in words ("draw a bar model for 3/5 of 40", "draw a rectangle 8 by 5 cm"), as a block, or null */
  function diagramFromRequest(text) {
    const s = String(text || '').replace(/[−–]/g, '-').replace(/\s+/g, ' ').trim();
    if (!s || s.length > 300) return null;
    const fence = (k, lines) => '```' + k + '\n' + lines.join('\n') + '\n```';
    if (/\b(bar|tape|strip)\s*(model|diagram)s?\b/i.test(s)) {
      const total = /\b(?:total(?: of| is)?|altogether|in all|sum(?: of| is)?)\s*(\d+(?:\.\d+)?)/i.exec(s) || /(\d+(?:\.\d+)?)\s*(?:[a-z]+\s+){0,2}(?:in all|altogether|in total|total)\b/i.exec(s);
      const t = total ? total[1] : null;
      let m = /(\d+)\s*\/\s*(\d+)\s+of\s+(\d+(?:\.\d+)?)/i.exec(s);
      if (m && Number(m[2]) <= 12 && Number(m[1]) <= Number(m[2])) return fence('barmodel', [`Whole: ${m[2]} parts, ${m[1]} shaded`, `total: ${m[3]}`]);
      m = /(\d{1,2})\s*(?::|to)\s*(\d{1,2})(?:\s*(?::|to)\s*(\d{1,2}))?/i.exec(s);
      if (m) {
        const names = (/\bof\s+([a-z][\w ]{0,20}?)\s+to\s+([a-z][\w ]{0,20}?)(?:\s+to\s+([a-z][\w ]{0,20}?))?(?:\s+is|\s+was|\s*[,.:]|\s+\d|$)/i.exec(s) || []).slice(1);
        const nums = [m[1], m[2], m[3]].filter(Boolean);
        const cap = w => w.charAt(0).toUpperCase() + w.slice(1);
        return fence('barmodel', nums.map((n, i) => `${cap(clip(names[i] || String.fromCharCode(65 + i), 20))}: ${n}`).concat(t ? [`total: ${t}`] : []));
      }
      return null;
    }
    if (!/\b(draw|sketch|show|make|picture|diagram)\b/i.test(s)) return null;
    let m;
    if ((m = new RegExp(`\\bsquare (?:with sides? (?:of )?)?${NUM}\\s*(cm|mm|m|in|ft|units?)?\\b`, 'i').exec(s))) return fence('shape', [`square ${m[1]}${m[2] ? ' ' + m[2] : ''}`]);
    if ((m = new RegExp(`\\brectangle\\b[^\\d]{0,24}${NUM}\\s*(cm|mm|m|in|ft|units?)?\\s*(?:by|x|×|and)\\s*${NUM}\\s*(cm|mm|m|in|ft|units?)?`, 'i').exec(s))) return fence('shape', [`rectangle ${m[1]} by ${m[3]}${m[4] || m[2] ? ' ' + (m[4] || m[2]) : ''}`]);
    if ((m = new RegExp(`\\bright triangle\\b[^\\d]{0,30}${NUM}\\s*(?:cm|mm|m|in|ft|units?)?\\s*(?:,|and|by)\\s*${NUM}\\s*(cm|mm|m|in|ft|units?)?`, 'i').exec(s))) return fence('shape', [`right triangle ${m[1]} ${m[2]}${m[3] ? ' ' + m[3] : ''}`]);
    if ((m = new RegExp(`\\btriangle\\b[^\\d]{0,30}${NUM}\\s*,?\\s*${NUM}\\s*,?\\s*(?:and\\s*)?${NUM}\\s*(cm|mm|m|in|ft|units?)?`, 'i').exec(s))) return fence('shape', [`triangle ${m[1]} ${m[2]} ${m[3]}${m[4] ? ' ' + m[4] : ''}`]);
    if ((m = new RegExp(`\\bcircle\\b[^\\d]{0,30}(radius|diameter)\\s*(?:of|is|=)?\\s*${NUM}\\s*(cm|mm|m|in|ft|units?)?`, 'i').exec(s))) return fence('shape', [`circle ${m[1].toLowerCase()} ${m[2]}${m[3] ? ' ' + m[3] : ''}`]);
    if ((m = /\b(\d{1,3})\s*(?:°|-?\s*degrees?)\s*angle\b|\bangle\b[^\d]{0,16}(\d{1,3})\s*(?:°|degrees?)/i.exec(s))) return fence('shape', [`angle ${m[1] || m[2]}`]);
    return null;
  }
  Object.assign(P, { isDiagram, diagram, describe, diagramFromRequest });

  window.PICTURES = P;
})();
