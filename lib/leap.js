/* Leap: a number-line puzzle (#/leap, #/leap/<level>, #/leap/daily). A frog sits on a number line and has to
   land exactly on the flag. Each card is a move (+5, −3, ×2, ÷2, ×(−1), later +½); every card must be used once,
   in any order, and some spots are holes the frog must not land on. Adding and subtracting end in the same place
   whatever the order, so the first levels are about dodging holes; once × and ÷ arrive the order changes where
   you end up, which is the order of operations seen as movement, and the win writes the moves as one expression
   with the brackets it needs. Levels are built from a seed (level 7 is the same puzzle for everyone) and each is
   checked to have a way through and only one or two orders that work. Progress: localStorage procademy.leap.v1.
   Three more number lines, each with its own levels (#/leap/negatives, /fractions, /decimals): jumps below zero,
   halves and quarters, and tenths. Past daily puzzles open at #/leap/day/<date>. Hints come in steps (a nudge,
   then the last card, then the next card), the whole game works from the keyboard (1 to 9 play a card, U undoes,
   H hints, R starts again, N goes on), and a solved puzzle explains each jump. */
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
  /** a number as a mixed number (or, on the decimals line, as a decimal) */
  function show(a, dec) {
    const [n, d] = a, m = Math.abs(n), s = n < 0 ? '−' : '';
    if (d === 1) return s + m;
    if (dec) return s + String(Math.round(m / d * 100) / 100);
    const w = Math.floor(m / d), r = m % d;
    return s + (w || '') + (FR[r + '/' + d] || `${r}/${d}`);
  }
  function apply(p, c) {
    if (c.op === '+') return add(p, c.v);
    if (c.op === '−') return add(p, [-c.v[0], c.v[1]]);
    if (c.op === '×') return mul(p, c.v);
    return mul(p, Q(c.v[1], c.v[0]));
  }
  const label = (c, dec) => c.op + (c.v[0] < 0 ? `(${show(c.v, dec)})` : show(c.v, dec));
  /** a card read aloud: "plus negative 3", "times 1/2" */
  const say = (a, dec) => (a[0] < 0 ? 'negative ' : '') + (a[1] === 1 || dec ? show([Math.abs(a[0]), a[1]], dec) : `${Math.abs(a[0])}/${a[1]}`);
  const spoken = (c, dec) => ({ '+': 'plus', '−': 'minus', '×': 'times', '÷': 'divided by' })[c.op] + ' ' + say(c.v, dec);

  /* ---- the three extra number lines: each has its own levels */
  const PACKS = {
    negatives: { name: 'Negatives', blurb: 'Jumps below zero: adding and subtracting negative numbers, and flips across 0.' },
    fractions: { name: 'Fractions', blurb: 'Halves and quarters: land between the whole numbers.' },
    decimals: { name: 'Decimals', blurb: 'Tenths: jumps like +0.7 and −1.5.' },
  };
  const PACK_LEVELS = 12;

  // ---- building a level
  function tier(level, pack) {
    if (pack) {
      const k = Math.min(3, Math.floor((level - 1) / 3));
      if (pack === 'negatives') return { n: [3, 3, 4, 5][k], kinds: [['nadd'], ['nadd', 'nadd', 'neg'], ['nadd', 'nadd', 'neg', 'nmul'], ['nadd', 'nadd', 'nadd', 'neg', 'nmul']][k], range: [12, 15, 20, 24][k], start: 8, holes: [2, 3, 4, 4][k], minHoles: [1, 2, 2, 3][k], maxSol: [3, 2, 2, 2][k], dens: [1], minDist: 2 };
      if (pack === 'fractions') return { n: [3, 3, 4, 4][k], kinds: [['fadd'], ['fadd', 'fadd', 'dbl'], ['fadd', 'fadd', 'dbl', 'half'], ['fadd', 'fadd', 'dbl', 'half', 'neg']][k], range: [5, 6, 8, 8][k], start: 3, holes: [2, 3, 3, 4][k], minHoles: [1, 1, 2, 2][k], maxSol: [3, 2, 2, 2][k], dens: [1, 2, 4], minDist: 1, frac: true, startDen: 2 };
      return { n: [3, 3, 4, 4][k], kinds: [['dadd'], ['dadd', 'dadd', 'dbl'], ['dadd', 'dadd', 'dbl', 'neg'], ['dadd', 'dadd', 'dbl', 'neg', 'half']][k], range: [5, 6, 8, 8][k], start: 3, holes: [2, 3, 3, 4][k], minHoles: [1, 1, 2, 2][k], maxSol: [3, 2, 2, 2][k], dens: [1, 2, 5, 10], minDist: 1, frac: true, startDen: 10 };
    }
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
    if (kind === 'half') return { op: '÷', v: Q(2) };
    if (kind === 'mul') return { op: '×', v: Q(rng.pick(level >= 12 ? [2, 3, -2] : [2, 3])) };
    if (kind === 'div') return { op: '÷', v: Q(rng.pick(level >= 12 ? [2, 3, -2] : [2])) };
    if (kind === 'nadd') return { op: rng.bool() ? '+' : '−', v: Q(rng.int(1, 9) * (rng.chance(0.65) ? -1 : 1)) };
    if (kind === 'nmul') return rng.pick([{ op: '×', v: Q(-2) }, { op: '×', v: Q(2) }, { op: '÷', v: Q(-2) }]);
    if (kind === 'fadd') return { op: rng.bool() ? '+' : '−', v: Q(rng.pick([1, 2, 3, 5, 6, 7, 4]), 4) };
    if (kind === 'dadd') return { op: rng.bool() ? '+' : '−', v: Q(rng.pick([1, 2, 3, 4, 6, 7, 8, 9, 12, 15, 5]), 10) };
    return rng.pick([{ op: '+', v: Q(1, 2) }, { op: '−', v: Q(1, 2) }, { op: '×', v: Q(1, 2) }, { op: '+', v: Q(3, 2) }, { op: '−', v: Q(5, 2) }]);
  }
  function orders(n) {
    const out = [], a = [...Array(n).keys()];
    (function go(k) { if (k === n) return out.push(a.slice()); for (let i = k; i < n; i++) { [a[k], a[i]] = [a[i], a[k]]; go(k + 1); [a[k], a[i]] = [a[i], a[k]]; } })(0);
    return out;
  }
  /** the puzzle for a level: {level, start, target, cards, holes, solution (card order), ways (orders that work)};
      pack is one of the extra number lines (negatives, fractions, decimals), or none for the main levels */
  function make(level, seed, pack) {
    if (pack && !PACKS[pack]) pack = null;
    const T = tier(level, pack), rng = RNG.make(seed || (pack ? `leap:${pack}:${level}` : 'leap:' + level));
    const fine = p => Math.abs(val(p)) <= T.range && (T.dens ? T.dens.includes(p[1]) : T.frac ? [1, 2, 4].includes(p[1]) : p[1] === 1);
    const spot = p => (T.dens ? T.dens.includes(p[1]) : p[1] === 1);          // where a hole can go
    for (let tries = 0; tries < 2000; tries++) {
      const cards = Array.from({ length: T.n }, () => card(rng, rng.pick(T.kinds), level));
      if (!cards.some(c => c.op === '+' || c.op === '−')) continue;
      if (T.need && !cards.some(c => c.op === '×' || c.op === '÷')) continue;
      if (cards.filter(c => c.op === '×' && c.v[0] === -1).length > 1) continue;
      if (T.frac && !cards.some(c => c.v[1] > 1)) continue;
      if (pack === 'negatives' && !cards.some(c => c.v[0] < 0)) continue;
      const start = T.startDen ? Q(rng.int(-T.start * T.startDen, T.start * T.startDen), T.startDen) : Q(rng.int(-T.start, T.start));
      const paths = orders(T.n).map(o => { let p = start; return { o, pos: o.map(i => (p = apply(p, cards[i]))) }; });
      const ok = paths.filter(x => x.pos.every(fine));
      if (!ok.length) continue;
      const sol = rng.pick(ok), target = sol.pos[sol.pos.length - 1];
      if (Math.abs(val(target) - val(start)) < (T.minDist || 2) || Math.abs(val(target)) > T.range) continue;
      const mine = new Set(sol.pos.map(String)), holes = [];
      const blocked = x => x.pos.slice(0, -1).some(p => holes.some(h => same(h, p)));
      const ways = () => paths.filter(x => same(x.pos[x.pos.length - 1], target) && !blocked(x));
      while (holes.length < T.holes) {
        const win = ways();
        if (win.length <= T.maxSol && holes.length >= T.minHoles) break;
        const score = new Map();          // a spot (by value) → [the spot, how many paths it blocks]
        paths.filter(x => !blocked(x)).forEach(x => new Set(x.pos.slice(0, -1).filter(p => spot(p) && !mine.has(String(p)) && !same(p, start) && !same(p, target) && Math.abs(val(p)) <= T.range).map(String)).forEach(k => {
          const s = score.get(k) || [k.split(',').map(Number), 0];
          s[1] += win.includes(x) ? 10 : 1; score.set(k, s);
        }));
        if (!score.size) break;
        holes.push([...score.values()].sort((a, b) => b[1] - a[1] || val(a[0]) - val(b[0]))[0][0]);
      }
      const w = ways();
      if (w.length > T.maxSol || holes.length < T.minHoles) continue;
      return { level, pack: pack || null, start, target, cards, holes: holes.sort((a, b) => val(a) - val(b)), solution: sol.o, ways: w.length };
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
  function expression(start, cards, dec) {
    let e = show(start, dec), low = false;
    cards.forEach(c => {
      const v = c.v[0] < 0 ? `(${show(c.v, dec)})` : show(c.v, dec);
      if (c.op === '+' || c.op === '−') { e = `${e} ${c.op} ${v}`; low = true; }
      else { e = `${low ? `(${e})` : e} ${c.op} ${v}`; low = false; }
    });
    return e;
  }
  /** what one jump does, in words: "+5 moves 5 to the right: 3 → 8." */
  function explainMove(c, from, to, dec) {
    const s = x => show(x, dec), m = s([Math.abs(c.v[0]), c.v[1]]), arrow = `${s(from)} → ${s(to)}`, l = label(c, dec);
    if (c.op === '+' && c.v[0] > 0) return `${l} moves ${m} to the right: ${arrow}.`;
    if (c.op === '+') return `${l} moves ${m} to the left, because adding a negative is the same as subtracting: ${arrow}.`;
    if (c.op === '−' && c.v[0] > 0) return `${l} moves ${m} to the left: ${arrow}.`;
    if (c.op === '−') return `${l} moves ${m} to the right, because subtracting a negative is the same as adding: ${arrow}.`;
    const k = Math.abs(val(c.v)), flip = c.v[0] < 0;
    const stretch = c.op === '×' ? (k === 1 ? '' : k === 2 ? 'doubles the distance from 0' : k === 3 ? 'triples the distance from 0' : k === 0.5 ? 'halves the distance from 0' : `multiplies the distance from 0 by ${m}`)
      : (k === 2 ? 'halves the distance from 0' : k === 3 ? 'makes the distance from 0 a third as long' : `divides the distance from 0 by ${m}`);
    if (!stretch) return `${l} flips the marker to the other side of 0: ${arrow}.`;
    return `${l} ${stretch}${flip ? ' and flips it to the other side of 0' : ''}: ${arrow}.`;
  }

  // ---- progress
  function load() { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s === 'object') return { level: Math.max(1, Number(s.level) || 1), stars: s.stars || {}, daily: s.daily || {}, packs: s.packs && typeof s.packs === 'object' ? s.packs : {} }; } catch (e) { /* private window */ } return { level: 1, stars: {}, daily: {}, packs: {} }; }
  function save(st) { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* private window */ } }
  const today = () => (window.STORE && STORE.today ? STORE.today() : new Date().toISOString().slice(0, 10));
  const starStr = n => `${n} of 3 stars`;
  // three drawn stars, the earned ones filled (color from .lp-stars)
  const STAR = '10,1.5 12.6,7.2 18.8,7.8 14.1,12 15.5,18.2 10,15 4.5,18.2 5.9,12 1.2,7.8 7.4,7.2';
  const starIcons = n => `<svg width="60" height="20" viewBox="0 0 60 20" aria-hidden="true" style="vertical-align:-4px">${[0, 1, 2].map(k => `<polygon points="${STAR}" transform="translate(${k * 20} 0)" fill="${k < n ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>`).join('')}</svg>`;
  /** a pack's own progress: { level, stars } */
  const packState = (st, pack) => { const p = st.packs[pack] || {}; return { level: Math.min(PACK_LEVELS, Math.max(1, Number(p.level) || 1)), stars: p.stars && typeof p.stars === 'object' ? p.stars : {} }; };

  /** the daily puzzles' difficulty (Easier, Just right, Harder), shared by every puzzle of the day (lib/puzzles.js) */
  const diff = () => (window.PUZZLES && PUZZLES.diff ? PUZZLES.diff() : 'normal');
  /** the puzzle of the day, at the learner's grade: adding and subtracting to 5th grade, then ×, ÷ and negatives
      (6th), longer ones (7th) and fractions (8th up); level 12 when the grade isn't known. Easier and Harder move
      it a step down or up. */
  const DAILY = [2, 2, 2, 3, 4, 4, 9, 14, 18];
  const dailyLevel = d => {
    const p = STORE.get().profile, L = p.grade == null ? 12 : p.grade >= 9 ? 24 : DAILY[p.grade];
    d = d || diff();
    return d === 'easier' ? Math.max(1, L - 4) : d === 'harder' ? Math.min(30, L + 5) : L;
  };
  const dailySeed = (date, d) => 'leap:daily:' + date + (d && d !== 'normal' ? ':' + d : '');
  const longDate = iso => new Date(iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  /** the page: which is a level number, 'daily' or null; opts { pack, date } (a pack's levels, or a past daily) */
  function page(root, which, opts) {
    opts = opts || {};
    const st = load(), pack = PACKS[opts.pack] ? opts.pack : null, daily = !pack && which === 'daily';
    const date = daily && /^\d{4}-\d\d-\d\d$/.test(opts.date || '') && opts.date <= today() ? opts.date : today(), past = daily && date !== today();
    const dec = pack === 'decimals', S2 = x => show(x, dec), L2 = c => label(c, dec);
    const ps = pack ? packState(st, pack) : null, top = pack ? ps.level : st.level;
    let level = daily ? dailyLevel() : Math.min(top, Math.max(1, Math.floor(Number(which)) || top));
    const base = pack ? `#/leap/${pack}/` : '#/leap/';
    root.innerHTML = `<div class="lp-page">
      <div class="card lp-head">
        <div><h1 style="margin:0">Leap${pack ? `: ${PACKS[pack].name}` : ''}</h1><p class="muted small" style="margin:4px 0 0">Move the marker along the number line to the flag. Use <b>every card exactly once</b>, in any order, and don’t land on a hole.</p></div>
        <div class="lp-nav" id="lp-nav"></div>
        <nav class="lp-packs small" aria-label="Number lines"><span class="muted">Number lines:</span>${[['', 'Whole numbers']].concat(Object.keys(PACKS).map(k => [k, PACKS[k].name])).map(([k, n]) => `<a class="chip-btn${(pack || '') === k ? ' on' : ''}" href="#/leap${k ? '/' + k : ''}"${(pack || '') === k ? ' aria-current="page"' : ''}>${n}</a>`).join('')}</nav>
      </div>
      <div class="card lp-board">
        <div class="row between lp-top"><h2 style="margin:0" id="lp-title"></h2><span class="small muted" id="lp-best"></span></div>
        ${daily && window.PUZZLES && PUZZLES.diffChips ? PUZZLES.diffChips() : ''}
        <div class="lp-line" id="lp-line"></div>
        <div class="lp-status" id="lp-status" aria-live="polite"></div>
        <div class="lp-cards" id="lp-cards" role="group" aria-label="Cards"></div>
        <div class="lp-trail small muted" id="lp-trail"></div>
        <div class="btn-row"><button type="button" class="btn sm" id="lp-undo" aria-keyshortcuts="U">Undo</button><button type="button" class="btn sm ghost" id="lp-restart" aria-keyshortcuts="R">Start again</button><button type="button" class="btn sm ghost" id="lp-hint" aria-keyshortcuts="H">Show a hint</button></div>
        <p class="tiny muted lp-keys">Keys: <kbd>1</kbd> to <kbd>5</kbd> play a card, <kbd>U</kbd> undoes, <kbd>H</kbd> gives a hint, <kbd>R</kbd> starts again.</p>
        <div id="lp-why"></div>
      </div>
      <div class="card"><h2>How it works</h2><ul class="nm-facts">
        <li>Select a card to move the marker: <b>+</b> and <b>−</b> move it right and left, <b>×</b> and <b>÷</b> stretch or shrink its distance from 0, and <b>×(−1)</b> moves it to the opposite side of 0.</li>
        ${pack === 'negatives' ? '<li>Adding a negative number moves left, like subtracting: 3 + (−5) = −2. Subtracting a negative moves right: 3 − (−5) = 8.</li>' : pack === 'fractions' ? '<li>Each whole number is split into quarters on the line. Two quarters make a half, and four quarters make 1.</li>' : pack === 'decimals' ? '<li>Each whole number is split into tenths. 0.5 is five tenths, the same as a half.</li>' : '<li>Additions and subtractions give the same result in any order. Multiplication and division don’t: (3 + 4) × 2 is 14, but 3 × 2 + 4 is 10.</li>'}
        <li>Work backward from the flag: the last card must land exactly on it. If the last card is × 2, the marker must be at half the flag’s value immediately before that move.</li>
        <li>Hints come one step at a time: a nudge first (free), then the last card of a way through, then the next card. The last two cost a star.</li>
        <li>Scoring: three stars for a solution with no holes, paid hints or incorrect finishes; two stars with one or two of these; otherwise one star.</li>
      </ul></div>
    </div>`;
    const wrap = root.querySelector('.lp-page'), q = s => root.querySelector(s);
    let pz, pos, moves, mistakes, won, ended, hint, view, frogX = null, splash = false, hintStep = 0;

    function nav() {
      const stars = pack ? ps.stars : st.stars, total = Object.values(stars).reduce((a, b) => a + b, 0);
      const arch = window.PUZZLES ? '<a class="chip-btn" href="#/puzzles/archive">Past puzzles</a>' : '';
      q('#lp-nav').innerHTML = daily
        ? `<a class="chip-btn" href="#/leap/${st.level}">← Levels</a>${arch}<span class="small muted">Stars: ${total}</span>`
        : `<button type="button" class="btn sm ghost" id="lp-prev" aria-label="Previous level"${level <= 1 ? ' disabled' : ''}>‹</button><span class="small"><b>Level ${level}</b>${pack ? ` of ${PACK_LEVELS}` : ''}</span><button type="button" class="btn sm ghost" id="lp-next" aria-label="Next level"${level >= top ? ' disabled' : ''}>›</button>
           ${pack ? '' : `<a class="chip-btn" href="#/leap/daily">Today’s puzzle${st.daily[today()] ? ' (solved)' : ''}</a>`}<span class="small muted" title="Stars from every level">Stars: ${total}</span>`;
    }
    function start() {
      pz = daily ? make(level, dailySeed(date, diff())) : make(level, null, pack);
      pos = pz.start; moves = []; mistakes = 0; won = false; ended = false; hint = null; view = null; frogX = null; hintStep = 0;
      q('#lp-title').textContent = daily ? (past ? `Puzzle for ${longDate(date)}` : 'Today’s puzzle') : `Level ${level}`;
      const best = daily ? st.daily[date] : (pack ? ps.stars : st.stars)[level];
      q('#lp-best').textContent = best ? `Best: ${starStr(best)}` : '';
      q('#lp-why').innerHTML = '';
      status(`Start at <b>${S2(pz.start)}</b> and land on <b>${S2(pz.target)}</b>${pz.holes.length ? `, avoiding the hole${pz.holes.length > 1 ? 's' : ''} at ${pz.holes.map(S2).join(', ')}` : ''}.`);
      nav(); draw(false);
      H.tutorCtx({ notes: `The student is playing Leap, a number-line puzzle: start at ${S2(pz.start)}, reach ${S2(pz.target)} using every card once (${pz.cards.map(L2).join(', ')}), never landing on ${pz.holes.map(S2).join(', ')}. Give hints about working backwards or the order of operations; don't give the whole answer unless asked.` });
    }
    function status(html) { q('#lp-status').innerHTML = html; }
    function draw(animate) {
      // the view keeps its range unless something falls outside it
      const narrow = pack === 'fractions' || pack === 'decimals';
      const pts = [pz.start, pz.target, pos].concat(pz.holes, moves.map(m => m.to)).map(val);
      let lo = Math.floor(Math.min(...pts)) - (narrow ? 1 : 2), hi = Math.ceil(Math.max(...pts)) + (narrow ? 1 : 2);
      const span = narrow ? 6 : 12;
      if (hi - lo < span) { lo = Math.floor((lo + hi) / 2 - span / 2); hi = lo + span; }
      let rescaled = false;
      if (!view || lo < view.lo || hi > view.hi) { view = { lo, hi }; rescaled = true; }
      const W = 360, x0 = 16, x1 = 344, px = (x1 - x0) / (view.hi - view.lo), X = v => x0 + (v - view.lo) * px, Y = 112;
      const step = [1, 2, 5, 10, 20, 50, 100, 200, 500].find(s => s * px >= 24) || 1000;
      const special = [pz.start, pz.target].concat(pz.holes).filter(p => p[1] === 1).map(p => p[0]);
      let g = `<line x1="${x0 - 8}" y1="${Y}" x2="${x1 + 8}" y2="${Y}" class="lp-axis"/>`;
      // the fraction and decimal lines: a small tick for each quarter or tenth
      const sub = pack === 'fractions' ? 4 : pack === 'decimals' ? 10 : 0;
      if (sub && px / sub >= 4) for (let v = view.lo; v < view.hi; v++) for (let k = 1; k < sub; k++) { const x = X(v + k / sub); g += `<line x1="${x.toFixed(1)}" y1="${Y - (k * 2 === sub ? 4 : 2)}" x2="${x.toFixed(1)}" y2="${Y + (k * 2 === sub ? 4 : 2)}" class="lp-tick lp-sub"/>`; }
      for (let v = Math.ceil(view.lo); v <= view.hi; v++) {
        const major = v % step === 0, sp = special.includes(v);
        if (px >= 5 || major) g += `<line x1="${X(v).toFixed(1)}" y1="${Y - (major ? 6 : 3)}" x2="${X(v).toFixed(1)}" y2="${Y + (major ? 6 : 3)}" class="lp-tick"/>`;
        if (major || sp) g += `<text x="${X(v).toFixed(1)}" y="${Y + 22}" text-anchor="middle" class="lp-num${sp ? ' sp' : ''}${v === pz.target[0] && pz.target[1] === 1 ? ' goal' : ''}">${v < 0 ? '−' + -v : v}</text>`;
      }
      // points between whole numbers are labeled on a second row, so they never sit on a whole number's label
      [pz.start, pz.target].concat(pz.holes).filter((p, i, a) => p[1] !== 1 && a.findIndex(x => same(x, p)) === i).forEach(p => { g += `<text x="${X(val(p)).toFixed(1)}" y="${Y + 38}" text-anchor="middle" class="lp-num sp${same(p, pz.target) ? ' goal' : ''}">${S2(p)}</text>`; });
      g += pz.holes.map(h => `<ellipse cx="${X(val(h)).toFixed(1)}" cy="${Y}" rx="9" ry="5" class="lp-hole"><title>A hole at ${S2(h)}</title></ellipse>`).join('');
      g += moves.map(m => {
        const a = X(val(m.from)), b = X(val(m.to)), h = Math.max(14, Math.min(46, Math.abs(b - a) * 0.4));
        return `<path d="M${a.toFixed(1)} ${Y - 2} Q${((a + b) / 2).toFixed(1)} ${(Y - 2 - 2 * h).toFixed(1)} ${b.toFixed(1)} ${Y - 2}" class="lp-arc"/><text x="${((a + b) / 2).toFixed(1)}" y="${(Y - 6 - h).toFixed(1)}" text-anchor="middle" class="lp-jump">${esc(L2(pz.cards[m.i]))}</text>`;
      }).join('');
      const fl = X(val(pz.target)).toFixed(1);
      g += `<g class="lp-flag" aria-hidden="true"><line x1="${fl}" y1="${Y}" x2="${fl}" y2="${Y - 30}" stroke="currentColor" stroke-width="2"/><path d="M${fl} ${Y - 30} l15 5 l-15 5 z" fill="var(--ok)"/></g>`;
      const box = q('#lp-line');
      const fx = X(val(pos));
      const hasFrac = [pz.start, pz.target].concat(pz.holes).some(p => p[1] !== 1);
      if (!box.firstChild) box.innerHTML = `<svg viewBox="0 0 ${W} ${hasFrac ? 150 : 140}" role="img" aria-label=""><g class="lp-static"></g><g class="lp-frog"><g class="lp-frog-t" style="color:var(--primary)"><path d="M0 ${Y - 3} l-6 -11 h12 z" fill="currentColor"/><circle cx="0" cy="${Y - 21}" r="9" fill="currentColor"/><circle cx="0" cy="${Y - 21}" r="3.5" fill="var(--surface)"/></g></g></svg>`;
      const svg = box.querySelector('svg'), frog = svg.querySelector('.lp-frog'), ft = frog.firstChild;
      svg.querySelector('.lp-static').innerHTML = g;
      svg.setAttribute('aria-label', `Number line from ${S2([view.lo, 1])} to ${S2([view.hi, 1])}: the marker is at ${S2(pos)}, the flag at ${S2(pz.target)}${pz.holes.length ? `, holes at ${pz.holes.map(S2).join(', ')}` : ''}.${moves.length ? ` Jumps so far: ${moves.map(m => L2(pz.cards[m.i])).join(', ')}.` : ''}`);
      frog.classList.toggle('still', !animate || rescaled || frogX === null);
      frog.style.transform = `translate(${fx.toFixed(1)}px, 0)`;
      ft.style.color = splash ? 'var(--bad)' : 'var(--primary)';
      if (animate && !rescaled) { ft.classList.remove('hop'); void ft.getBoundingClientRect(); ft.classList.add('hop'); }
      frogX = fx;
      // cards and trail
      const used = new Set(moves.map(m => m.i));
      q('#lp-cards').innerHTML = pz.cards.map((c, i) => `<button type="button" class="lp-card${used.has(i) ? ' used' : ''}${hint === i ? ' hint' : ''}" data-card="${i}"${used.has(i) || won ? ' disabled' : ''} aria-keyshortcuts="${i + 1}" aria-label="Card ${i + 1}: ${esc(spoken(c, dec))}${used.has(i) ? ', used' : hint === i ? ', the hint' : ''}">${esc(L2(c))}</button>`).join('');
      q('#lp-trail').textContent = moves.length ? [S2(pz.start)].concat(moves.flatMap(m => [L2(pz.cards[m.i]), S2(m.to)])).join(' → ') : '';
      q('#lp-undo').disabled = !moves.length || won;
      q('#lp-restart').disabled = !moves.length;
      q('#lp-hint').disabled = won;
      const kk = root.querySelectorAll('.lp-keys kbd')[1]; if (kk) kk.textContent = String(pz.cards.length);
      root.__leap = { level: daily ? 'daily' : level, pack, date: daily ? date : null, start: S2(pz.start), target: S2(pz.target), cards: pz.cards.map(L2), holes: pz.holes.map(S2), pos: S2(pos), used: moves.length, won, mistakes, solution: pz.solution.slice(), ways: pz.ways, hintStep };
    }
    /** keep the keyboard where it was: on the next card still to play, or the undo button */
    function refocus(had) {
      if (!had) return;
      const next = q('.lp-card:not([disabled])') || q('#lp-go') || q('#lp-again') || q('#lp-undo:not([disabled])');
      if (next) next.focus();
    }
    function play(i) {
      if (won || splash || moves.some(m => m.i === i) || !pz.cards[i]) return;
      const had = wrap.contains(document.activeElement);
      const to = apply(pos, pz.cards[i]);
      hint = null; hintStep = 0;
      if (pz.holes.some(h => same(h, to))) {
        mistakes++;
        moves.push({ i, from: pos, to }); pos = to; splash = true; draw(true);
        status(`The marker landed in the hole at ${S2(to)}. Try the cards in a different order.`);
        setTimeout(() => { if (!pz || moves[moves.length - 1] === undefined || moves[moves.length - 1].i !== i) return; moves.pop(); pos = moves.length ? moves[moves.length - 1].to : pz.start; splash = false; draw(true); refocus(had); }, 900);
        return;
      }
      moves.push({ i, from: pos, to }); pos = to; draw(true);
      if (moves.length < pz.cards.length) {
        status(same(pos, pz.target) ? `The marker is on the flag, but every card must be used. Cards remaining: ${pz.cards.length - moves.length}.` : `The marker is at <b>${S2(pos)}</b>. Cards remaining: ${pz.cards.length - moves.length}.`);
        refocus(had);
        return;
      }
      if (!same(pos, pz.target)) {
        if (!ended) mistakes++;
        ended = true;
        status(`All cards are used, and the marker ended on <b>${S2(pos)}</b> rather than ${S2(pz.target)}. Undo a move and try another order.`);
        refocus(had);
        return;
      }
      won = true;
      const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
      if (daily) st.daily[date] = Math.max(st.daily[date] || 0, stars);
      else if (pack) { ps.stars[level] = Math.max(ps.stars[level] || 0, stars); ps.level = Math.min(PACK_LEVELS, Math.max(ps.level, level + 1)); st.packs[pack] = { level: ps.level, stars: ps.stars }; }
      else { st.stars[level] = Math.max(st.stars[level] || 0, stars); st.level = Math.max(st.level, level + 1); }
      save(st);
      if (window.BADGES && (st.level > 10 || Object.keys(st.daily).length)) BADGES.flag('leap');
      if (daily && window.PUZZLES && PUZZLES.solved) PUZZLES.solved('leap', date, stars);
      const played = moves.map(m => pz.cards[m.i]), expr = expression(pz.start, played, dec);
      const more = !pack || level < PACK_LEVELS;
      status(`<div class="lp-win"><b>Solved. <span class="lp-stars" role="img" aria-label="${starStr(stars)}">${starIcons(stars)}</span></b>
        <div class="small">As one expression: <b class="lp-expr">${esc(expr)} = ${esc(S2(pz.target))}</b></div>
        <div class="btn-row">${daily ? `<a class="btn primary sm" href="#/leap/${st.level}">Return to the levels</a>` : more ? `<button type="button" class="btn primary sm" id="lp-go" aria-keyshortcuts="N">Level ${level + 1} →</button>` : '<a class="btn primary sm" href="#/leap">Back to the whole numbers</a>'}<button type="button" class="btn ghost sm" id="lp-again">Play again</button></div></div>`);
      q('#lp-why').innerHTML = why(played);
      draw(false); nav();
      root.__leap.stars = stars; root.__leap.expression = expr;
      refocus(had);
    }
    /** after a win: each jump in words, and what a different order would have done */
    function why(played) {
      let p = pz.start;
      const lines = played.map(c => { const from = p; p = apply(p, c); return `<li>${esc(explainMove(c, from, p, dec))}</li>`; });
      const dealt = pz.cards.map((_, i) => i), order = moves.map(m => m.i);
      let other = '';
      if (dealt.join() !== order.join()) {
        let e = pz.start, hole = false;
        dealt.forEach(i => { e = apply(e, pz.cards[i]); if (pz.holes.some(h => same(h, e))) hole = true; });
        const list = pz.cards.map(L2).map(esc).join(', ');
        other = !same(e, pz.target) ? `<p class="small">In the order they were dealt (${list}), the cards would end on <b>${esc(S2(e))}</b> instead: multiplying or dividing at a different moment changes every jump after it.</p>`
          : hole ? `<p class="small">In the order they were dealt (${list}), the cards reach the flag too, but that path drops into a hole on the way.</p>` : '';
      }
      return `<details class="lp-explain" open><summary>Why it works</summary><ol class="small">${lines.join('')}</ol>${other}</details>`;
    }
    function hintMe() {
      const used = new Set(moves.map(m => m.i)), left = pz.cards.map((_, i) => i).filter(i => !used.has(i)), way = finish(pz, pos, left);
      if (!way) { status('No order of the remaining cards reaches the flag from here. Undo a move or start again.'); return; }
      if (hintStep === 0) {
        // a nudge: what to think about, not which card (free)
        hintStep = 1;
        const risky = left.filter(i => pz.holes.some(h => same(h, apply(pos, pz.cards[i]))));
        status(risky.length ? `Look before you jump: from ${S2(pos)}, ${risky.length === 1 ? 'one of your cards lands' : `${risky.length} of your cards land`} in a hole. Find ${risky.length === 1 ? 'it' : 'them'}, and play ${risky.length === 1 ? 'it' : 'them'} later.`
          : `Work backward from the flag at ${S2(pz.target)}: the last card has to land exactly on it. Which card could make that last jump?`);
        root.__leap.hintStep = hintStep;
        return;
      }
      mistakes++;
      if (hintStep === 1 && way.length > 1) {
        hintStep = 2;
        status(`One way through ends with <b>${esc(L2(pz.cards[way[way.length - 1]]))}</b>. Where must the marker be just before that card?`);
        root.__leap.hintStep = hintStep; root.__leap.mistakes = mistakes;
        return;
      }
      hintStep = 3; hint = way[0]; draw(false);
      status(`Play <b>${esc(L2(pz.cards[way[0]]))}</b> next.`);
    }
    const go = n => { level = n; history.replaceState(null, '', base + level); start(); };
    wrap.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b || !wrap.contains(b) || b.disabled || splash) return;
      if (b.dataset.card !== undefined) return play(Number(b.dataset.card));
      if (b.id === 'lp-undo' && moves.length) { moves.pop(); pos = moves.length ? moves[moves.length - 1].to : pz.start; splash = false; hint = null; hintStep = 0; ended = false; status(`The marker is back at <b>${S2(pos)}</b>.`); draw(true); }
      else if (b.id === 'lp-restart') { pos = pz.start; moves = []; splash = false; hint = null; hintStep = 0; ended = false; won = false; q('#lp-why').innerHTML = ''; status(`Start at <b>${S2(pz.start)}</b> and land on <b>${S2(pz.target)}</b>.`); draw(true); }
      else if (b.id === 'lp-hint') hintMe();
      else if (b.id === 'lp-again') start();
      else if (b.id === 'lp-go') go(level + 1);
      else if (b.id === 'lp-prev' && level > 1) go(level - 1);
      else if (b.id === 'lp-next' && level < top) go(level + 1);
    });
    if (daily && window.PUZZLES && PUZZLES.wireDiff) PUZZLES.wireDiff(root, () => page(root, which, opts));
    // the keyboard: 1 to 9 play a card, U or Backspace undoes, H hints, R starts again, N goes to the next level
    const onKey = ev => {
      if (!wrap.isConnected) { document.removeEventListener('keydown', onKey); return; }
      if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.defaultPrevented || (ev.target && ev.target.closest && ev.target.closest('input, textarea, select, [contenteditable="true"], .tutor'))) return;
      const k = (ev.key || '').toLowerCase(), click = id => { const b = q(id); if (b && !b.disabled) { ev.preventDefault(); b.click(); } };
      if (/^[1-9]$/.test(k)) { const b = q(`.lp-card[data-card="${Number(k) - 1}"]`); if (b && !b.disabled) { ev.preventDefault(); b.click(); } }
      else if (k === 'u' || k === 'backspace') click('#lp-undo');
      else if (k === 'h') click('#lp-hint');
      else if (k === 'r') click('#lp-restart');
      else if (k === 'n') click('#lp-go');
    };
    document.addEventListener('keydown', onKey);
    start();
  }

  const LEAP = { page, make, finish, apply, label, show, expression, explainMove, tier, dailyLevel, dailySeed, PACKS, PACK_LEVELS, load, KEY };
  window.LEAP = LEAP;
})();
