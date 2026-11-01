/* Leap: a number-line puzzle (#/leap, #/leap/<level>, #/leap/daily). A frog sits on a number line and has to
   land exactly on the flag. Each card is a move (+5, −3, ×2, ÷2, ×(−1), later +½); every card must be used once,
   in any order, and some spots are holes the frog must not land on. Adding and subtracting end in the same place
   whatever the order, so the first levels are about dodging holes; once × and ÷ arrive the order changes where
   you end up, which is the order of operations seen as movement, and the win writes the moves as one expression
   with the brackets it needs. Levels are built from a seed (level 7 is the same puzzle for everyone) and each is
   checked to have a way through and only one or two orders that work. Progress: localStorage procademy.leap.v1. */
'use strict';
(function () {
  const V = window.VIEWS, H = V._h, esc = H.esc;
  const KEY = 'procademy.leap.v1';

  // ---- exact fractions [n, d]
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const Q = (n, d) => { d = d === undefined ? 1 : d; if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g + 0, d / g]; };
  const add = (a, b) => Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  const mul = (a, b) => Q(a[0] * b[0], a[1] * b[1]);
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];
  const val = a => a[0] / a[1];
  const FR = { '1/2': '½', '1/4': '¼', '3/4': '¾', '1/3': '⅓', '2/3': '⅔' };
  function show(a) {
    const [n, d] = a, m = Math.abs(n), s = n < 0 ? '−' : '';
    if (d === 1) return s + m;
    const w = Math.floor(m / d), r = m % d;
    return s + (w || '') + (FR[r + '/' + d] || `${r}/${d}`);
  }
  function apply(p, c) {
    if (c.op === '+') return add(p, c.v);
    if (c.op === '−') return add(p, [-c.v[0], c.v[1]]);
    if (c.op === '×') return mul(p, c.v);
    return mul(p, Q(c.v[1], c.v[0]));
  }
  const label = c => c.op + (c.v[0] < 0 ? `(${show(c.v)})` : show(c.v));

  // ---- building a level
  function tier(level) {
    if (level === 1) return { n: 3, kinds: ['add'], range: 12, start: 4, holes: 2, minHoles: 1, maxSol: 4 };
    if (level === 2) return { n: 3, kinds: ['add'], range: 12, start: 5, holes: 3, minHoles: 2, maxSol: 2 };
    if (level <= 4) return { n: 3, kinds: ['add'], range: 14, start: 6, holes: 3, minHoles: 2, maxSol: 1 };
    if (level <= 7) return { n: 4, kinds: ['add', 'add', 'add', 'dbl', 'neg'], range: 20, start: 6, holes: 4, minHoles: 2, maxSol: 2, need: true };
    if (level <= 11) return { n: 4, kinds: ['add', 'add', 'mul', 'div', 'neg'], range: 30, start: 8, holes: 4, minHoles: 2, maxSol: 2, need: true };
    if (level <= 16) return { n: 5, kinds: ['add', 'add', 'mul', 'div', 'neg'], range: 40, start: 9, holes: 5, minHoles: 3, maxSol: 2, need: true };
    return { n: 5, kinds: ['add', 'add', 'frac', 'mul', 'div', 'neg'], range: 30, start: 6, holes: 5, minHoles: 3, maxSol: 2, need: true, frac: true };
  }
  function card(rng, kind, level) {
    if (kind === 'add') return { op: rng.bool() ? '+' : '−', v: Q(rng.int(1, level >= 8 ? 12 : 9)) };
    if (kind === 'dbl') return { op: '×', v: Q(2) };
    if (kind === 'neg') return { op: '×', v: Q(-1) };
    if (kind === 'mul') return { op: '×', v: Q(rng.pick(level >= 12 ? [2, 3, -2] : [2, 3])) };
    if (kind === 'div') return { op: '÷', v: Q(rng.pick(level >= 12 ? [2, 3, -2] : [2])) };
    return rng.pick([{ op: '+', v: Q(1, 2) }, { op: '−', v: Q(1, 2) }, { op: '×', v: Q(1, 2) }, { op: '+', v: Q(3, 2) }, { op: '−', v: Q(5, 2) }]);
  }
  function orders(n) {
    const out = [], a = [...Array(n).keys()];
    (function go(k) { if (k === n) return out.push(a.slice()); for (let i = k; i < n; i++) { [a[k], a[i]] = [a[i], a[k]]; go(k + 1); [a[k], a[i]] = [a[i], a[k]]; } })(0);
    return out;
  }
  /** the puzzle for a level: {level, start, target, cards, holes, solution (card order), ways (orders that work)} */
  function make(level, seed) {
    const T = tier(level), rng = RNG.make(seed || 'leap:' + level);
    const fine = p => Math.abs(val(p)) <= T.range && (T.frac ? [1, 2, 4].includes(p[1]) : p[1] === 1);
    for (let tries = 0; tries < 2000; tries++) {
      const cards = Array.from({ length: T.n }, () => card(rng, rng.pick(T.kinds), level));
      if (!cards.some(c => c.op === '+' || c.op === '−')) continue;
      if (T.need && !cards.some(c => c.op === '×' || c.op === '÷')) continue;
      if (cards.filter(c => c.op === '×' && c.v[0] === -1).length > 1) continue;
      if (T.frac && !cards.some(c => c.v[1] > 1)) continue;
      const start = Q(rng.int(-T.start, T.start));
      const paths = orders(T.n).map(o => { let p = start; return { o, pos: o.map(i => (p = apply(p, cards[i]))) }; });
      const ok = paths.filter(x => x.pos.every(fine));
      if (!ok.length) continue;
      const sol = rng.pick(ok), target = sol.pos[sol.pos.length - 1];
      if (Math.abs(val(target) - val(start)) < 2 || Math.abs(val(target)) > T.range) continue;
      const mine = new Set(sol.pos.map(String)), holes = [];
      const blocked = x => x.pos.slice(0, -1).some(p => holes.some(h => same(h, p)));
      const ways = () => paths.filter(x => same(x.pos[x.pos.length - 1], target) && !blocked(x));
      while (holes.length < T.holes) {
        const win = ways();
        if (win.length <= T.maxSol && holes.length >= T.minHoles) break;
        const score = new Map();
        paths.filter(x => !blocked(x)).forEach(x => new Set(x.pos.slice(0, -1).filter(p => p[1] === 1 && !mine.has(String(p)) && !same(p, start) && !same(p, target) && Math.abs(val(p)) <= T.range).map(p => p[0])).forEach(k => {
          score.set(k, (score.get(k) || 0) + (win.includes(x) ? 10 : 1));
        }));
        if (!score.size) break;
        holes.push(Q([...score.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0]));
      }
      const w = ways();
      if (w.length > T.maxSol || holes.length < T.minHoles) continue;
      return { level, start, target, cards, holes: holes.sort((a, b) => val(a) - val(b)), solution: sol.o, ways: w.length };
    }
    return null;
  }
  /** a way to finish from here, as card indices, or null */
  function finish(pz, pos, left) {
    if (!left.length) return same(pos, pz.target) ? [] : null;
    for (const i of left) {
      const p = apply(pos, pz.cards[i]);
      if (pz.holes.some(h => same(h, p))) continue;
      const rest = finish(pz, p, left.filter(j => j !== i));
      if (rest) return [i].concat(rest);
    }
    return null;
  }
  /** the moves as one expression with the brackets they need: (3 + 4) × 2 − 5 */
  function expression(start, cards) {
    let e = show(start), low = false;
    cards.forEach(c => {
      if (c.op === '+' || c.op === '−') { e = `${e} ${c.op} ${show(c.v)}`; low = true; }
      else { e = `${low ? `(${e})` : e} ${c.op} ${c.v[0] < 0 ? `(${show(c.v)})` : show(c.v)}`; low = false; }
    });
    return e;
  }

  // ---- progress
  function load() { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s === 'object') return { level: Math.max(1, Number(s.level) || 1), stars: s.stars || {}, daily: s.daily || {} }; } catch (e) { /* private window */ } return { level: 1, stars: {}, daily: {} }; }
  function save(st) { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* private window */ } }
  const today = () => (window.STORE && STORE.today ? STORE.today() : new Date().toISOString().slice(0, 10));
  const starStr = n => '★'.repeat(n) + '☆'.repeat(3 - n);

  function page(root, which) {
    const st = load(), daily = which === 'daily';
    let level = daily ? 12 : Math.min(st.level, Math.max(1, Math.floor(Number(which)) || st.level));
    root.innerHTML = `<div class="lp-page">
      <div class="card lp-head">
        <div><h1 style="margin:0">Leap</h1><p class="muted small" style="margin:4px 0 0">Get the frog 🐸 to the flag 🏁. Use <b>every card once</b>, in any order, and don’t land in a hole.</p></div>
        <div class="lp-nav" id="lp-nav"></div>
      </div>
      <div class="card lp-board">
        <div class="row between lp-top"><h2 style="margin:0" id="lp-title"></h2><span class="small muted" id="lp-best"></span></div>
        <div class="lp-line" id="lp-line"></div>
        <div class="lp-status" id="lp-status" aria-live="polite"></div>
        <div class="lp-cards" id="lp-cards"></div>
        <div class="lp-trail small muted" id="lp-trail"></div>
        <div class="btn-row"><button type="button" class="btn sm" id="lp-undo">↩ Undo</button><button type="button" class="btn sm ghost" id="lp-restart">Start again</button><button type="button" class="btn sm ghost" id="lp-hint">💡 Hint</button></div>
      </div>
      <div class="card"><h2>How it works</h2><ul class="nm-facts">
        <li>Tap a card and the frog jumps: <b>+</b> and <b>−</b> move it right and left, <b>×</b> and <b>÷</b> stretch or shrink its distance from 0, and <b>×(−1)</b> flips it to the other side of 0.</li>
        <li>Adding and subtracting give the same answer in any order. Multiplying and dividing don’t mix that way: (3 + 4) × 2 is 14, but 3 × 2 + 4 is 10.</li>
        <li>Work backwards from the flag: the last card has to land exactly on it. If the last card is × 2, the frog must be at half the flag just before.</li>
        <li>Stars: ★★★ with no splashes, hints or wrong finishes; ★★ with one or two.</li>
      </ul></div>
    </div>`;
    const wrap = root.querySelector('.lp-page'), q = s => root.querySelector(s);
    let pz, pos, moves, mistakes, won, ended, hint, view, frogX = null, splash = false;

    function nav() {
      const total = Object.values(st.stars).reduce((a, b) => a + b, 0);
      q('#lp-nav').innerHTML = daily
        ? `<a class="chip-btn" href="#/leap/${st.level}">← Levels</a><span class="small muted">★ ${total}</span>`
        : `<button type="button" class="btn sm ghost" id="lp-prev" aria-label="Previous level"${level <= 1 ? ' disabled' : ''}>‹</button><span class="small"><b>Level ${level}</b></span><button type="button" class="btn sm ghost" id="lp-next" aria-label="Next level"${level >= st.level ? ' disabled' : ''}>›</button>
           <a class="chip-btn" href="#/leap/daily">📅 Today’s puzzle${st.daily[today()] ? ' ✓' : ''}</a><span class="small muted" title="Stars from every level">★ ${total}</span>`;
    }
    function start() {
      pz = make(level, daily ? 'leap:daily:' + today() : null);
      pos = pz.start; moves = []; mistakes = 0; won = false; ended = false; hint = null; view = null; frogX = null;
      q('#lp-title').textContent = daily ? 'Today’s puzzle' : `Level ${level}`;
      const best = daily ? st.daily[today()] : st.stars[level];
      q('#lp-best').textContent = best ? `Best: ${starStr(best)}` : '';
      status(`Start at <b>${show(pz.start)}</b>. Land on <b>${show(pz.target)}</b>${pz.holes.length ? `, and miss the hole${pz.holes.length > 1 ? 's' : ''} at ${pz.holes.map(show).join(', ')}` : ''}.`);
      nav(); draw(false);
      H.tutorCtx({ notes: `The student is playing Leap, a number-line puzzle: start at ${show(pz.start)}, reach ${show(pz.target)} using every card once (${pz.cards.map(label).join(', ')}), never landing on ${pz.holes.map(show).join(', ')}. Give hints about working backwards or the order of operations; don't give the whole answer unless asked.` });
    }
    function status(html) { q('#lp-status').innerHTML = html; }
    function draw(animate) {
      // the view keeps its range unless something falls outside it
      const pts = [pz.start, pz.target, pos].concat(pz.holes, moves.map(m => m.to)).map(val);
      let lo = Math.floor(Math.min(...pts)) - 2, hi = Math.ceil(Math.max(...pts)) + 2;
      if (hi - lo < 12) { lo = Math.floor((lo + hi) / 2 - 6); hi = lo + 12; }
      let rescaled = false;
      if (!view || lo < view.lo || hi > view.hi) { view = { lo, hi }; rescaled = true; }
      const W = 360, x0 = 16, x1 = 344, px = (x1 - x0) / (view.hi - view.lo), X = v => x0 + (v - view.lo) * px, Y = 112;
      const step = [1, 2, 5, 10, 20, 50, 100, 200, 500].find(s => s * px >= 24) || 1000;
      const special = [pz.start, pz.target].concat(pz.holes).filter(p => p[1] === 1).map(p => p[0]);
      let g = `<line x1="${x0 - 8}" y1="${Y}" x2="${x1 + 8}" y2="${Y}" class="lp-axis"/>`;
      for (let v = Math.ceil(view.lo); v <= view.hi; v++) {
        const major = v % step === 0, sp = special.includes(v);
        if (px >= 5 || major) g += `<line x1="${X(v).toFixed(1)}" y1="${Y - (major ? 6 : 3)}" x2="${X(v).toFixed(1)}" y2="${Y + (major ? 6 : 3)}" class="lp-tick"/>`;
        if (major || sp) g += `<text x="${X(v).toFixed(1)}" y="${Y + 22}" text-anchor="middle" class="lp-num${sp ? ' sp' : ''}${v === pz.target[0] && pz.target[1] === 1 ? ' goal' : ''}">${v < 0 ? '−' + -v : v}</text>`;
      }
      [pz.target].filter(p => p[1] !== 1).forEach(p => { g += `<text x="${X(val(p)).toFixed(1)}" y="${Y + 22}" text-anchor="middle" class="lp-num sp goal">${show(p)}</text>`; });
      g += pz.holes.map(h => `<ellipse cx="${X(val(h)).toFixed(1)}" cy="${Y}" rx="9" ry="5" class="lp-hole"><title>A hole at ${show(h)}</title></ellipse>`).join('');
      g += moves.map(m => {
        const a = X(val(m.from)), b = X(val(m.to)), h = Math.max(14, Math.min(46, Math.abs(b - a) * 0.4));
        return `<path d="M${a.toFixed(1)} ${Y - 2} Q${((a + b) / 2).toFixed(1)} ${(Y - 2 - 2 * h).toFixed(1)} ${b.toFixed(1)} ${Y - 2}" class="lp-arc"/><text x="${((a + b) / 2).toFixed(1)}" y="${(Y - 6 - h).toFixed(1)}" text-anchor="middle" class="lp-jump">${esc(label(pz.cards[m.i]))}</text>`;
      }).join('');
      g += `<text x="${(X(val(pz.target)) + 7).toFixed(1)}" y="${Y - 3}" text-anchor="middle" class="lp-flag" aria-hidden="true">🏁</text>`;
      const box = q('#lp-line');
      const fx = X(val(pos));
      if (!box.firstChild) box.innerHTML = `<svg viewBox="0 0 ${W} 140" role="img" aria-label=""><g class="lp-static"></g><g class="lp-frog"><text x="0" y="${Y - 4}" text-anchor="middle" class="lp-frog-t">🐸</text></g></svg>`;
      const svg = box.querySelector('svg'), frog = svg.querySelector('.lp-frog'), ft = frog.firstChild;
      svg.querySelector('.lp-static').innerHTML = g;
      svg.setAttribute('aria-label', `Number line: the frog is at ${show(pos)}, the flag at ${show(pz.target)}${pz.holes.length ? `, holes at ${pz.holes.map(show).join(', ')}` : ''}.`);
      frog.classList.toggle('still', !animate || rescaled || frogX === null);
      frog.style.transform = `translate(${fx.toFixed(1)}px, 0)`;
      ft.textContent = splash ? '💦' : '🐸';
      if (animate && !rescaled) { ft.classList.remove('hop'); void ft.getBoundingClientRect(); ft.classList.add('hop'); }
      frogX = fx;
      // cards and trail
      const used = new Set(moves.map(m => m.i));
      q('#lp-cards').innerHTML = pz.cards.map((c, i) => `<button type="button" class="lp-card${used.has(i) ? ' used' : ''}${hint === i ? ' hint' : ''}" data-card="${i}"${used.has(i) || won ? ' disabled' : ''} aria-label="${esc(label(c))}${used.has(i) ? ', used' : ''}">${esc(label(c))}</button>`).join('');
      q('#lp-trail').textContent = moves.length ? [show(pz.start)].concat(moves.flatMap(m => [label(pz.cards[m.i]), show(m.to)])).join(' → ') : '';
      q('#lp-undo').disabled = !moves.length || won;
      q('#lp-restart').disabled = !moves.length;
      q('#lp-hint').disabled = won;
      root.__leap = { level: daily ? 'daily' : level, start: show(pz.start), target: show(pz.target), cards: pz.cards.map(label), holes: pz.holes.map(show), pos: show(pos), used: moves.length, won, mistakes, solution: pz.solution.slice(), ways: pz.ways };
    }
    function play(i) {
      if (won || splash || moves.some(m => m.i === i)) return;
      const to = apply(pos, pz.cards[i]);
      hint = null;
      if (pz.holes.some(h => same(h, to))) {
        mistakes++;
        moves.push({ i, from: pos, to }); pos = to; splash = true; draw(true);
        status(`💦 Splash! ${show(to)} is a hole. Try the cards in a different order.`);
        setTimeout(() => { if (!pz || moves[moves.length - 1] === undefined || moves[moves.length - 1].i !== i) return; moves.pop(); pos = moves.length ? moves[moves.length - 1].to : pz.start; splash = false; draw(true); }, 900);
        return;
      }
      moves.push({ i, from: pos, to }); pos = to; draw(true);
      if (moves.length < pz.cards.length) {
        status(same(pos, pz.target) ? `You’re on the flag, but every card has to be used. ${pz.cards.length - moves.length} to go.` : `The frog is at <b>${show(pos)}</b>. ${pz.cards.length - moves.length} card${pz.cards.length - moves.length > 1 ? 's' : ''} left.`);
        return;
      }
      if (!same(pos, pz.target)) {
        if (!ended) mistakes++;
        ended = true;
        status(`Every card is used and the frog ended on <b>${show(pos)}</b>, not ${show(pz.target)}. Undo and try another order.`);
        return;
      }
      won = true;
      const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
      if (daily) st.daily[today()] = Math.max(st.daily[today()] || 0, stars);
      else { st.stars[level] = Math.max(st.stars[level] || 0, stars); st.level = Math.max(st.level, level + 1); }
      save(st);
      if (window.BADGES && (st.level > 10 || Object.keys(st.daily).length)) BADGES.flag('leap');
      const expr = expression(pz.start, moves.map(m => pz.cards[m.i]));
      status(`<div class="lp-win"><b>🎉 Solved! <span class="lp-stars" aria-label="${stars} of 3 stars">${starStr(stars)}</span></b>
        <div class="small">As one expression: <b class="lp-expr">${esc(expr)} = ${esc(show(pz.target))}</b></div>
        <div class="btn-row">${daily ? `<a class="btn primary sm" href="#/leap/${st.level}">Back to the levels</a>` : `<button type="button" class="btn primary sm" id="lp-go">Level ${level + 1} →</button>`}<button type="button" class="btn ghost sm" id="lp-again">Play it again</button></div></div>`);
      draw(false); nav();
      root.__leap.stars = stars; root.__leap.expression = expr;
    }
    wrap.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b || !wrap.contains(b) || b.disabled || splash) return;
      if (b.dataset.card !== undefined) return play(Number(b.dataset.card));
      if (b.id === 'lp-undo' && moves.length) { moves.pop(); pos = moves.length ? moves[moves.length - 1].to : pz.start; splash = false; hint = null; status(`Back to <b>${show(pos)}</b>.`); draw(true); }
      else if (b.id === 'lp-restart') { pos = pz.start; moves = []; splash = false; hint = null; ended = false; won = false; status(`Start at <b>${show(pz.start)}</b>. Land on <b>${show(pz.target)}</b>.`); draw(true); }
      else if (b.id === 'lp-hint') {
        const used = new Set(moves.map(m => m.i)), way = finish(pz, pos, pz.cards.map((_, i) => i).filter(i => !used.has(i)));
        if (!way) { status('From here no order reaches the flag. Undo a move or start again.'); return; }
        mistakes++; hint = way[0]; draw(false);
        status(`Try <b>${esc(label(pz.cards[way[0]]))}</b> next.`);
      }
      else if (b.id === 'lp-again') start();
      else if (b.id === 'lp-go') { level++; history.replaceState(null, '', '#/leap/' + level); start(); }
      else if (b.id === 'lp-prev' && level > 1) { level--; history.replaceState(null, '', '#/leap/' + level); start(); }
      else if (b.id === 'lp-next' && level < st.level) { level++; history.replaceState(null, '', '#/leap/' + level); start(); }
    });
    start();
  }

  const LEAP = { page, make, finish, apply, label, show, expression, tier, KEY };
  window.LEAP = LEAP;
})();
