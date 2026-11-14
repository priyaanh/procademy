/* Moving progress to another computer without an account or a file: Profile makes a link that carries
   the progress itself (compressed, after the # of the address, so no website ever receives it), and
   opening the link on the other computer copies it there — added to what is already there, or instead
   of it. The link is untrusted input on arrival: it is size-limited, and every field is checked and
   turned into the right type before anything is used. Anyone with a link can copy that progress, so it is
   meant to be sent only to yourself. */
'use strict';
(function () {
  const S = window.STORE, V = window.VIEWS, D = window.DRAW, H = V._h, esc = H.esc;
  const SPRINTS = 'procademy.sprints.v1';
  const MAX = 3 * 1024 * 1024;                     // the most a link may unpack to

  /* ---------- packing: JSON → deflate → base64url (z…), or plain base64url (j…) where there is no deflate ---------- */
  const b64 = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const unb64 = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const canZip = () => typeof CompressionStream === 'function' && typeof DecompressionStream === 'function';
  async function through(bytes, stream) { const r = new Response(new Blob([bytes]).stream().pipeThrough(stream)); return new Uint8Array(await r.arrayBuffer()); }
  async function pack(obj) {
    const raw = new TextEncoder().encode(JSON.stringify(obj));
    return canZip() ? 'z' + b64(await through(raw, new CompressionStream('deflate-raw'))) : 'j' + b64(raw);
  }
  async function unpack(code) {
    if (typeof code !== 'string' || code.length > MAX || !/^[zj][A-Za-z0-9_-]+$/.test(code)) throw new Error('bad');
    let raw = unb64(code.slice(1));
    if (code[0] === 'z') {
      // read it bit by bit, so a link built to unpack into something huge is stopped early
      const reader = new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader(), parts = [];
      let n = 0;
      for (;;) { const { done, value } = await reader.read(); if (done) break; n += value.length; if (n > MAX) { reader.cancel(); throw new Error('too big'); } parts.push(value); }
      raw = new Uint8Array(n); let at = 0; parts.forEach(p => { raw.set(p, at); at += p.length; });
    }
    return JSON.parse(new TextDecoder().decode(raw));
  }

  /* ---------- what goes in, and what is let back in ---------- */
  /** the progress to send: everything, with the activity log shortened so the link stays short */
  function payload() {
    const st = JSON.parse(JSON.stringify(S.get()));
    st.log = st.log.slice(0, 120);
    let sprints = {};
    try { sprints = JSON.parse(localStorage.getItem(SPRINTS) || '{}') || {}; } catch (e) { /* none */ }
    return { app: 'procademy-move', v: 1, made: Date.now(), state: st, sprints };
  }
  const snum = v => { const x = Number(v); return isFinite(x) ? Math.max(-1e9, Math.min(1e9, x)) : 0; };
  const num = (v, max) => { const x = Number(v); return isFinite(x) ? Math.max(0, Math.min(max == null ? 1e12 : max, x)) : 0; };
  const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
  const ID = /^[a-z0-9:.-]{1,80}$/i, DAY = /^\d{4}-\d{2}-\d{2}$/;
  /** a progress object from a link, rebuilt field by field with the right types; anything unknown is dropped */
  function clean(p) {
    if (!p || p.app !== 'procademy-move' || !p.state || typeof p.state !== 'object') throw new Error('not procademy');
    const s = p.state, out = S.blank();
    const pr = s.profile || {};
    out.profile = Object.assign(out.profile, {
      name: str(pr.name, 40), theme: ['system', 'light', 'dark'].includes(pr.theme) ? pr.theme : 'system', textSize: ['small', 'normal', 'medium', 'large', 'xlarge', 'xxlarge'].includes(pr.textSize) ? pr.textSize : 'normal',
      enrolled: Array.isArray(pr.enrolled) ? pr.enrolled.filter(x => typeof x === 'string' && ID.test(x)).slice(0, 50) : [],
      goal: [10, 20, 30, 50].includes(pr.goal) ? pr.goal : undefined,
      grade: pr.grade == null || pr.grade === '' ? undefined : num(pr.grade, 12),
      avatar: pr.avatar && typeof pr.avatar === 'object' ? Object.assign({ emoji: str(pr.avatar.emoji, 8), hue: num(pr.avatar.hue, 360) },
        ...['shape', 'face', 'pattern', 'frame', 'shade'].filter(k => typeof pr.avatar[k] === 'string' && /^[a-z0-9-]{1,20}$/.test(pr.avatar[k])).map(k => ({ [k]: pr.avatar[k] }))) : undefined,
      banner: typeof pr.banner === 'string' && /^[a-z0-9-]{1,20}$/.test(pr.banner) ? pr.banner : undefined,
      cpm: pr.cpm && typeof pr.cpm === 'object' && ID.test(String(pr.cpm.book)) && ID.test(String(pr.cpm.lesson)) ? { book: String(pr.cpm.book), lesson: String(pr.cpm.lesson) } : null,
    });
    out.points = num(s.points);
    Object.keys(s.skills || {}).slice(0, 2000).forEach(id => { const k = s.skills[id]; if (!ID.test(id) || !k || typeof k !== 'object') return; out.skills[id] = { level: num(k.level, 4) | 0, tries: num(k.tries), right: num(k.right), sets: num(k.sets), last: num(k.last), ivl: num(k.ivl, 365), due: DAY.test(k.due) ? k.due : undefined }; });
    Object.keys(s.days || {}).slice(0, 5000).forEach(d => { const k = s.days[d]; if (!DAY.test(d) || !k) return; out.days[d] = { q: num(k.q), right: num(k.right), pts: num(k.pts) }; if (k.daily) out.days[d].daily = num(k.daily, 99); });
    out.log = (Array.isArray(s.log) ? s.log : []).slice(0, 500).filter(e => e && typeof e === 'object').map(e => ({ t: num(e.t), kind: str(e.kind, 30), course: str(e.course, 80) || null, unit: str(e.unit, 80) || null, skill: typeof e.skill === 'string' && ID.test(e.skill) ? e.skill : null, title: str(e.title, 120) || undefined, right: num(e.right, 999), total: num(e.total, 999), pts: num(e.pts, 1e6), changes: (Array.isArray(e.changes) ? e.changes : []).slice(0, 50).filter(c => c && ID.test(String(c.skillId))).map(c => ({ skillId: String(c.skillId), from: num(c.from, 4) | 0, to: num(c.to, 4) | 0 })) }));
    out.missed = (Array.isArray(s.missed) ? s.missed : []).slice(0, 200).filter(m => m && ID.test(String(m.skill)) && typeof m.seed === 'string').map(m => ({ skill: String(m.skill), seed: m.seed.slice(0, 60), t: num(m.t) }));
    out.recent = (Array.isArray(s.recent) ? s.recent : []).filter(x => typeof x === 'string' && ID.test(x)).slice(0, 12);
    Object.keys(s.mistakes || {}).slice(0, 30).forEach(k => { const m = s.mistakes[k]; if (!/^[a-z-]{1,20}$/.test(k) || !m) return; const sk = {}; Object.keys(m.skills || {}).slice(0, 200).forEach(id => { if (ID.test(id)) sk[id] = num(m.skills[id]); }); out.mistakes[k] = { n: num(m.n), skills: sk }; });
    ['badges', 'flags'].forEach(f => Object.keys(s[f] || {}).slice(0, 100).forEach(k => { if (/^[a-z0-9-]{1,30}$/.test(k)) out[f][k] = num(s[f][k]); }));
    Object.keys(s.words || {}).slice(0, 1000).forEach(k => { const w = s.words[k]; if (!/^[a-z0-9-]{1,40}$/.test(k) || !w) return; out.words[k] = { ivl: num(w.ivl, 365), due: DAY.test(w.due) ? w.due : S.today(), seen: num(w.seen), right: num(w.right) }; });
    if (Array.isArray(pr.starredWords)) out.profile.starredWords = pr.starredWords.filter(x => typeof x === 'string' && /^[a-z0-9-]{1,40}$/.test(x)).slice(0, 300);
    out.saved = num(s.saved);
    const sprints = {};
    Object.keys(p.sprints || {}).slice(0, 30).forEach(id => { const d = p.sprints[id]; if (!/^[a-z-]{1,20}$/.test(id) || !d) return; sprints[id] = { best: num(d.best, 9999), plays: num(d.plays), last: num(d.last), weak: (Array.isArray(d.weak) ? d.weak : []).slice(0, 30).filter(w => w && typeof w.q === 'string').map(w => ({ key: str(w.key, 40), q: str(w.q, 40), a: snum(w.a), unit: str(w.unit, 4) })) }; });
    return { state: out, sprints, made: num(p.made) };
  }
  const summary = st => {
    const q = Object.values(st.days).reduce((a, d) => a + (d.q || 0), 0), practised = Object.keys(st.skills).length;
    return { name: st.profile.name, q, practised, mastered: Object.values(st.skills).filter(k => k.level === 4).length, badges: Object.keys(st.badges).length };
  };
  const hasProgress = st => Object.values(st.days || {}).some(d => d.q) || Object.keys(st.skills || {}).length > 0;

  /* ---------- QR codes, so a phone can open a link from the screen (qrcode-generator, loaded when asked) ---------- */
  const QR_LIB = 'https://cdn.jsdelivr.net/npm/qrcode-generator@2.0.4/dist/qrcode.js';
  let qrLoading = null;
  function loadQr() {
    if (window.qrcode) return Promise.resolve(window.qrcode);
    if (!qrLoading) qrLoading = new Promise((res, rej) => { const s = document.createElement('script'); s.src = QR_LIB; s.crossOrigin = 'anonymous'; s.onload = () => res(window.qrcode); s.onerror = () => { qrLoading = null; rej(new Error('The QR code generator couldn’t be loaded.')); }; document.head.appendChild(s); });
    return qrLoading;
  }
  /** a QR code for some text, as an SVG, or null when the text is too long for one */
  async function qr(text) {
    if (String(text).length > 2900) return null;
    const make = MOVE.qrLib ? MOVE.qrLib : await loadQr();
    const q = make(0, 'L'); q.addData(String(text), 'Byte'); q.make();
    return q.createSvgTag({ cellSize: 4, margin: 3, scalable: true });
  }
  /** a "QR code" button that shows one under itself, for url (or url(), read when pressed) */
  function qrButton(el, url) {
    const text = () => String(typeof url === 'function' ? url() : url);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn sm'; b.textContent = 'Show QR code';
    if (text().length > 2900) { b.disabled = true; b.title = 'This link is too long for a QR code. Send it by email instead.'; }
    b.addEventListener('click', async () => {
      const box = el.querySelector('.qr-box') || el.appendChild(Object.assign(document.createElement('div'), { className: 'qr-box' }));
      if (!box.hidden && box.innerHTML) { box.hidden = true; return; }
      box.hidden = false; box.innerHTML = '<p class="small muted">Creating the QR code…</p>';
      try { const svg = await qr(text()); box.innerHTML = svg ? `<div class="qr">${svg}</div><p class="tiny muted">Point a phone or tablet camera at it to open the link on that device.</p>` : '<p class="small">This link is too long for a QR code. Send it by email instead.</p>'; }
      catch (e) { box.innerHTML = `<p class="small">${esc(e.message)}</p>`; }
    });
    return b;
  }
  /** where links should open: this site, or (from the one-file offline build) the website */
  const siteBase = () => (/^https?:$/.test(location.protocol) ? location.href.split('#')[0] : 'https://priyaanh.github.io/procademy/index.html');
  /* ---------- making a link (on Profile and in Settings) ---------- */
  function box() {
    return `<div class="move-box"><p class="muted small" style="margin:0 0 8px">Without an account, you can transfer your progress with a link: create it here, send it to yourself by email or message, and open it on the other computer. No files are needed, and no website stores the link.</p>
      <button class="btn sm" type="button" id="mv-make">Create a transfer link</button><div id="mv-out"></div></div>`;
  }
  function wire(root) {
    const b = root.querySelector('#mv-make');
    if (!b) return;
    b.addEventListener('click', async () => {
      const out = root.querySelector('#mv-out');
      out.innerHTML = '<p class="small muted">Preparing your progress…</p>';
      let code;
      try { code = await pack(payload()); } catch (e) { out.innerHTML = '<p class="small" style="color:var(--bad)">The link couldn’t be created in this browser.</p>'; return; }
      const url = siteBase() + '#/move/' + code;
      MOVE._last = url;
      const s = summary(S.get());
      out.innerHTML = `<div class="mv-ready"><p class="small"><b>Your transfer link is ready</b> (${s.q} questions, ${H.plural(s.practised, 'skill')} practiced · ${Math.ceil(url.length / 1024)} KB).</p>
        <input class="mv-url" readonly value="${esc(url)}" aria-label="Your transfer link">
        <div class="btn-row"><button class="btn sm primary" id="mv-copy" type="button">Copy the link</button>${navigator.share ? '<button class="btn sm" id="mv-share" type="button">Send it…</button>' : ''}</div>
        <p class="tiny muted">The link contains your progress as it is now. Anyone with the link could copy your progress, so send it only to yourself. Some chat apps shorten very long links; email is the most reliable option.</p></div>`;
      out.querySelector('#mv-copy').addEventListener('click', () => { try { navigator.clipboard.writeText(url).then(() => V.toast('Transfer link copied.'), () => { out.querySelector('.mv-url').select(); V.toast('Select the link and copy it.'); }); } catch (e) { out.querySelector('.mv-url').select(); } });
      const sh = out.querySelector('#mv-share');
      if (sh) sh.addEventListener('click', () => navigator.share({ title: 'My Procademy progress', url }).catch(() => {}));
      out.querySelector('.mv-url').addEventListener('focus', ev => ev.target.select());
      out.querySelector('.btn-row').appendChild(qrButton(out, url));
    });
  }

  /* ---------- opening a link: #/move/<code> ---------- */
  async function page(root, code) {
    root.innerHTML = '<div class="card"><p class="muted">Opening the transfer link…</p></div>';
    let got;
    try { got = clean(await unpack(code)); } catch (e) {
      root.innerHTML = `<div class="card empty"><h1>This transfer link doesn’t work</h1><p class="muted">It may have been shortened when it was sent (some chat apps shorten long links). Create a new link on the other computer and send it by email.</p><a class="btn primary" href="#/">Home</a></div>`;
      return;
    }
    const from = summary(got.state), here = S.get(), mine = hasProgress(here);
    const when = got.made ? new Date(got.made).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
    root.innerHTML = `<div class="card move-card">
      <h1>Transfer progress to this computer</h1>
      <p>Progress${from.name ? ` from <b>${esc(from.name)}</b>` : ''}${when ? `, created ${esc(when)}` : ''}: <b>${from.q}</b> questions, ${H.plural(from.practised, 'skill')} practiced, ${from.mastered} mastered, ${H.plural(from.badges, 'badge')}.</p>
      ${mine ? `<p class="muted">This computer already has progress (${summary(here).q} questions). Do you want to add the link’s progress to it, or use only the link’s progress?</p>
        <div class="btn-row" style="justify-content:center"><button class="btn primary" id="mv-add">Add to this computer’s progress</button><button class="btn" id="mv-replace">Use only the link’s progress</button><a class="btn ghost" href="#/">Cancel</a></div>
        <p class="tiny muted">Adding keeps the best of both: the higher level of every skill, both histories and every badge.</p>`
        : `<div class="btn-row" style="justify-content:center"><button class="btn primary" id="mv-replace">Use this progress on this computer</button><a class="btn ghost" href="#/">Cancel</a></div>`}</div>`;
    const done = msg => { history.replaceState(null, '', '#/'); if (window.APP) { APP.applyPrefs(); APP.refreshStats(); APP.render(); } V.toast(msg); };
    const add = root.querySelector('#mv-add'), rep = root.querySelector('#mv-replace');
    if (add) add.addEventListener('click', () => {
      S.replace(window.ACCOUNT ? ACCOUNT.merge(S.get(), got.state) : got.state);
      try { localStorage.setItem(SPRINTS, window.ACCOUNT ? ACCOUNT.mergeSprints(localStorage.getItem(SPRINTS), JSON.stringify(got.sprints)) : JSON.stringify(got.sprints)); } catch (e) { /* fine */ }
      done('Progress added to this computer.');
    });
    rep.addEventListener('click', () => {
      S.replace(got.state);
      try { localStorage.setItem(SPRINTS, JSON.stringify(got.sprints)); } catch (e) { /* fine */ }
      done('Your progress is now on this computer.');
    });
  }

  const MOVE = { pack, unpack, payload, clean, box, wire, page, siteBase, qr, qrButton, qrLib: null, _last: null };
  window.MOVE = MOVE;
})();
