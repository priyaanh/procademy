/* Puzzles (#/puzzles): a puzzle of the day of every kind, at the learner's grade, with a difficulty choice
   (Easier, Just right, Harder) shared by all of them, and an archive of past days (#/puzzles/archive).
   Beside Leap and Balance (lib/leap.js, lib/balance.js) there are three more, each made fresh from a seed by
   the code below and checked by it before it is shown:
   - Target (#/puzzles/target): combine the numbers with + − × ÷ to make the target; a search over every way of
     combining them proves a way exists, and shows one after a win.
   - Cages (#/puzzles/cages): fill a grid so each row and column has every number once, and each outlined cage
     makes its number with its operation; a solver checks the grid has exactly one answer.
   - Cross-number (#/puzzles/cross): a crossword with numbers; every clue is worked out by the code and has to
     equal its entry, and crossing entries share their digits.
   Then a daily three (#/puzzles/three: a missing number, a pattern and a comparison), and a game for two on one
   device (#/puzzles/duel, Factor grab). Clues change with the season, and the hub has a drawn seasonal picture.
   Hints come in steps that nudge before they tell. What is solved is kept on this device
   (procademy.puzzles.v1): { diff, done: { date: { kind: stars } }, three: { date: score }, duel: { games } }. */
'use strict';
(function () {
  const V = window.VIEWS, H = V._h, esc = H.esc, S = window.STORE;
  const KEY = 'procademy.puzzles.v1';
  const icon = (n, s) => (window.ICONS ? ICONS.svg(n, s) : '');

  /* ---------- what is kept ---------- */
  function load() {
    let o = null;
    try { o = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { o = null; }
    if (!o || typeof o !== 'object' || Array.isArray(o)) o = {};
    if (!o.done || typeof o.done !== 'object') o.done = {};
    if (!o.three || typeof o.three !== 'object') o.three = {};
    return o;
  }
  function save(o) {
    const days = Object.keys(o.done).sort();
    days.slice(0, Math.max(0, days.length - 120)).forEach(d => { delete o.done[d]; });         // four months is plenty
    const td = Object.keys(o.three).sort(); td.slice(0, Math.max(0, td.length - 120)).forEach(d => { delete o.three[d]; });
    try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* a private window: this visit only */ }
  }
  const today = () => S.today();
  const DIFFS = [['easier', 'Easier'], ['normal', 'Just right'], ['harder', 'Harder']];
  /** the daily puzzles' difficulty: 'easier', 'normal' or 'harder' */
  const diff = () => { const d = load().diff; return DIFFS.some(x => x[0] === d) ? d : 'normal'; };
  function setDiff(d) { const o = load(); o.diff = DIFFS.some(x => x[0] === d) ? d : 'normal'; save(o); }
  /** the difficulty chips at the top of a daily puzzle (wired by wireDiff) */
  const diffChips = () => `<div class="pz-diff" role="group" aria-label="Difficulty"><span class="small muted">Difficulty:</span>${DIFFS.map(([k, l]) => `<button type="button" class="chip-btn${diff() === k ? ' on' : ''}" data-diff="${k}" aria-pressed="${diff() === k}">${l}</button>`).join('')}</div>`;
  function wireDiff(root, redraw) {
    root.querySelectorAll('[data-diff]').forEach(b => b.addEventListener('click', ev => {
      ev.stopPropagation();
      if (b.dataset.diff === diff()) return;
      setDiff(b.dataset.diff); redraw();
      const again = root.querySelector(`[data-diff="${b.dataset.diff}"]`); if (again) again.focus();
    }));
  }
  /** a daily puzzle was solved (any kind, any day) */
  function solved(kind, date, stars) {
    const o = load(), d = o.done[date] || (o.done[date] = {});
    d[kind] = Math.max(d[kind] || 0, stars || 1);
    save(o);
    if (window.BADGES) BADGES.check();
  }
  /** the daily puzzles solved on a day, by kind: Leap and Balance keep their own */
  function doneOn(date) {
    const o = load(), out = Object.assign({}, o.done[date] || {});
    const side = k => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v && v.daily && v.daily[date]; } catch (e) { return 0; } };
    const l = side('procademy.leap.v1'), b = side('procademy.balance.v1');
    if (l) out.leap = Math.max(out.leap || 0, l);
    if (b) out.balance = Math.max(out.balance || 0, b);
    if (o.three[date] != null) out.three = o.three[date];
    return out;
  }
  /** days with a daily puzzle solved (any kind), newest first */
  function solvedDays() {
    const o = load(), days = new Set(Object.keys(o.done));
    ['procademy.leap.v1', 'procademy.balance.v1'].forEach(k => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); Object.keys((v && v.daily) || {}).forEach(d => days.add(d)); } catch (e) { /* fine */ } });
    return [...days].filter(d => /^\d{4}-\d\d-\d\d$/.test(d)).sort().reverse();
  }
  const solvedToday = () => Object.keys(doneOn(today())).some(k => k !== 'three');

  /* ---------- exact fractions [n, d] ---------- */
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const Q = (n, d) => { d = d === undefined ? 1 : d; if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g + 0, d / g]; };
  const qs = a => (a[1] === 1 ? (a[0] < 0 ? '−' + -a[0] : String(a[0])) : `${a[0] < 0 ? '−' : ''}${Math.abs(a[0])}/${a[1]}`);
  const OPS = {
    '+': (a, b) => Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]),
    '−': (a, b) => Q(a[0] * b[1] - b[0] * a[1], a[1] * b[1]),
    '×': (a, b) => Q(a[0] * b[0], a[1] * b[1]),
    '÷': (a, b) => (b[0] === 0 ? null : Q(a[0] * b[1], a[1] * b[0])),
  };

  /* ---------- the grade and the difficulty: a step from 1 (gentlest) to 5 ---------- */
  function step(kind) {
    const p = S.get().profile, g = p.adult ? 9 : p.grade == null ? 7 : p.grade;
    const base = g <= 2 ? 1 : g <= 4 ? 2 : g <= 6 ? 3 : g <= 8 ? 4 : 5, d = diff();
    return Math.max(1, Math.min(5, base + (d === 'easier' ? -1 : d === 'harder' ? 1 : 0)));
  }

  /* ================= Target: make the target from the numbers ================= */
  const TARGET_STEPS = [null,
    { n: 3, max: 6, ops: ['+', '−'], lo: 4, hi: 15, neg: false, frac: false },
    { n: 3, max: 9, ops: ['+', '−', '×'], lo: 6, hi: 30, neg: false, frac: false },
    { n: 4, max: 9, ops: ['+', '−', '×', '÷'], lo: 12, hi: 36, neg: false, frac: false, like: 24 },
    { n: 4, max: 12, ops: ['+', '−', '×', '÷'], lo: 20, hi: 60, neg: false, frac: false },
    { n: 4, max: 13, ops: ['+', '−', '×', '÷'], lo: 18, hi: 48, neg: true, frac: true, like: 24 }];
  /** combine a and b with op, as numbers and as writing (with only the brackets it needs) */
  function join(a, op, b) {
    const v = OPS[op](a.v, b.v);
    if (!v) return null;
    const br = (x, need) => (need ? `(${x.e})` : x.e);
    const e = op === '+' ? `${a.e} + ${b.e}` : op === '−' ? `${a.e} − ${br(b, b.p === 1)}` : op === '×' ? `${br(a, a.p === 1)} × ${br(b, b.p === 1)}` : `${br(a, a.p === 1)} ÷ ${br(b, b.p <= 2)}`;
    return { v, e, p: op === '+' || op === '−' ? 1 : 2, steps: (a.steps || []).concat(b.steps || [], [`${qs(a.v)} ${op} ${qs(b.v)} = ${qs(v)}`]) };
  }
  /** every value the numbers can make, using each once: value key → { count, e, steps } */
  function reach(nums, T) {
    const out = new Map();
    const go = list => {
      if (list.length === 1) { const k = qs(list[0].v), had = out.get(k); if (had) had.count++; else out.set(k, { v: list[0].v, count: 1, e: list[0].e, steps: list[0].steps }); return; }
      for (let i = 0; i < list.length; i++) for (let j = 0; j < list.length; j++) {
        if (i === j) continue;
        const rest = list.filter((_, k) => k !== i && k !== j);
        T.ops.forEach(op => {
          if ((op === '+' || op === '×') && i > j) return;            // the same either way round
          const r = join(list[i], op, list[j]);
          if (!r || (!T.frac && r.v[1] !== 1) || (!T.neg && r.v[0] < 0)) return;
          go(rest.concat([r]));
        });
      }
    };
    go(nums.map(n => ({ v: Q(n), e: String(n), p: 3, steps: [] })));
    return out;
  }
  /** today's Target: { nums, target, way: { e, steps }, step, T } (a way always exists: it is found first) */
  function makeTarget(seed, st) {
    const T = TARGET_STEPS[st], R = RNG.make('target:' + seed + ':' + st);
    for (let tries = 0; tries < 200; tries++) {
      const nums = Array.from({ length: T.n }, () => R.int(1, T.max)).sort((a, b) => a - b);
      const all = reach(nums, T);
      let cands = [...all.values()].filter(x => x.v[1] === 1 && x.v[0] >= T.lo && x.v[0] <= T.hi && !nums.includes(x.v[0]));
      if (!cands.length) continue;
      if (T.like && all.has(String(T.like)) && R.chance(0.7)) cands = [all.get(String(T.like))];
      else if (st >= 3) { const few = cands.filter(x => x.count <= 6); if (few.length) cands = few; }
      const pick = R.pick(cands);
      return { nums, target: pick.v[0], way: { e: pick.e, steps: pick.steps }, step: st, T };
    }
    return { nums: [2, 3, 4], target: 10, way: { e: '2 × 3 + 4', steps: ['2 × 3 = 6', '6 + 4 = 10'] }, step: st, T: TARGET_STEPS[1] };
  }
  /** is there still a way from these numbers? (for hints and dead ends) */
  function wayFrom(vals, target, T) {
    const go = list => {
      if (list.length === 1) return list[0].v[1] === 1 && list[0].v[0] === target ? list[0] : null;
      for (let i = 0; i < list.length; i++) for (let j = 0; j < list.length; j++) {
        if (i === j) continue;
        for (const op of T.ops) {
          if ((op === '+' || op === '×') && i > j) continue;
          const r = join(list[i], op, list[j]);
          if (!r || (!T.frac && r.v[1] !== 1) || (!T.neg && r.v[0] < 0)) continue;
          const w = go(list.filter((_, k) => k !== i && k !== j).concat([r]));
          if (w) return w;
        }
      }
      return null;
    };
    return go(vals.map(v => ({ v, e: qs(v), p: 3, steps: [] })));
  }

  /* ================= Cages: a Latin square with arithmetic cages ================= */
  const CAGE_STEPS = [null, { n: 3, ops: ['+'] }, { n: 4, ops: ['+', '−'] }, { n: 4, ops: ['+', '−', '×', '÷'] }, { n: 5, ops: ['+', '−', '×', '÷'] }, { n: 6, ops: ['+', '−', '×', '÷'] }];
  /** does a cage's list of numbers make its clue? */
  function cageOk(c, vals) {
    if (c.op === '=') return vals[0] === c.t;
    if (c.op === '+') return vals.reduce((a, b) => a + b, 0) === c.t;
    if (c.op === '×') return vals.reduce((a, b) => a * b, 1) === c.t;
    if (c.op === '−') return Math.abs(vals[0] - vals[1]) === c.t;
    return Math.max(...vals) / Math.min(...vals) === c.t;
  }
  /** count the grid's answers, up to `cap` (a puzzle is kept only if there is exactly one) */
  function cageSolve(n, cages, cap, given) {
    const cell = [], g = Array(n * n).fill(0), rows = Array.from({ length: n }, () => new Set()), cols = Array.from({ length: n }, () => new Set());
    cages.forEach((c, k) => c.cells.forEach(i => { cell[i] = k; }));
    let count = 0, first = null;
    const partialOk = c => {
      const vals = c.cells.map(i => g[i]).filter(Boolean), left = c.cells.length - vals.length;
      if (!left) return cageOk(c, vals);
      if (c.op === '+') { const s = vals.reduce((a, b) => a + b, 0); return s + left <= c.t && s + left * n >= c.t; }
      if (c.op === '×') { const p = vals.reduce((a, b) => a * b, 1); return c.t % p === 0; }
      return true;
    };
    (function go(i) {
      if (count >= cap) return;
      if (i === n * n) { count++; if (!first) first = g.slice(); return; }
      const r = Math.floor(i / n), cc = i % n;
      const opts = given && given[i] ? [given[i]] : Array.from({ length: n }, (_, k) => k + 1);
      for (const v of opts) {
        if (rows[r].has(v) || cols[cc].has(v)) continue;
        g[i] = v; rows[r].add(v); cols[cc].add(v);
        if (partialOk(cages[cell[i]])) go(i + 1);
        g[i] = 0; rows[r].delete(v); cols[cc].delete(v);
        if (count >= cap) return;
      }
    })(0);
    return { count, first };
  }
  /** today's Cages: { n, cages: [{ cells, op, t }], sol } — checked to have exactly one answer */
  function makeCages(seed, st) {
    const T = CAGE_STEPS[st], n = T.n;
    for (let tries = 0; tries < 400; tries++) {
      const R = RNG.make('cages:' + seed + ':' + st + (tries ? ':' + tries : ''));
      // a Latin square: shifted rows, then rows, columns and numbers shuffled
      const base = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (r + c) % n + 1));
      const rp = R.shuffle([...Array(n).keys()]), cp = R.shuffle([...Array(n).keys()]), sp = R.shuffle([...Array(n).keys()].map(k => k + 1));
      const sol = []; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) sol.push(sp[base[rp[r]][cp[c]] - 1]);
      // cages: grown from random cells, mostly two or three cells
      const owner = Array(n * n).fill(-1), cages = [];
      const nb = i => { const r = Math.floor(i / n), c = i % n, out = []; if (r) out.push(i - n); if (r < n - 1) out.push(i + n); if (c) out.push(i - 1); if (c < n - 1) out.push(i + 1); return out; };
      for (const i of R.shuffle([...Array(n * n).keys()])) {
        if (owner[i] >= 0) continue;
        const want = R.pick(n <= 3 ? [1, 2, 2, 3] : [1, 2, 2, 2, 3, 3, 4]), cells = [i]; owner[i] = cages.length;
        while (cells.length < want) {
          const free = [].concat(...cells.map(nb)).filter(j => owner[j] < 0);
          if (!free.length) break;
          const j = R.pick(free); owner[j] = cages.length; cells.push(j);
        }
        cages.push({ cells: cells.sort((a, b) => a - b) });
      }
      if (cages.filter(c => c.cells.length === 1).length > Math.max(1, Math.floor(n / 2))) continue;
      cages.forEach(c => {
        const vals = c.cells.map(i => sol[i]);
        if (vals.length === 1) { c.op = '='; c.t = vals[0]; return; }
        const can = T.ops.filter(op => op === '+' || op === '×' || (vals.length === 2 && (op === '−' || (op === '÷' && Math.max(...vals) % Math.min(...vals) === 0))));
        c.op = R.pick(can.length > 1 && can.includes('÷') && R.chance(0.5) ? ['÷'] : can);
        c.t = c.op === '+' ? vals.reduce((a, b) => a + b, 0) : c.op === '×' ? vals.reduce((a, b) => a * b, 1) : c.op === '−' ? Math.abs(vals[0] - vals[1]) : Math.max(...vals) / Math.min(...vals);
      });
      const res = cageSolve(n, cages, 2);
      if (res.count !== 1 || res.first.join() !== sol.join()) continue;
      return { n, cages, sol, step: st };
    }
    return null;
  }
  /** the ways a cage can be filled, as sorted lists of numbers (for hints and the explanation) */
  function cageCombos(c, n) {
    const out = new Set(), k = c.cells.length;
    (function go(list) {
      if (list.length === k) { if (cageOk(c, list)) out.add(list.slice().sort((a, b) => a - b).join('')); return; }
      for (let v = 1; v <= n; v++) go(list.concat(v));
    })([]);
    return [...out].map(s => s.split('').map(Number));
  }
  const cageClue = c => (c.op === '=' ? String(c.t) : `${c.t}${c.op}`);
  const OP_WORD = { '+': 'add to', '×': 'multiply to', '−': 'a difference of', '÷': 'one divided by the other is' };
  const cageWords = c => (c.op === '=' ? `the given number ${c.t}` : `${c.cells.length} cells that ${c.op === '−' ? `have a difference of ${c.t}` : c.op === '÷' ? `divide to make ${c.t}` : `${OP_WORD[c.op]} ${c.t}`}`);

  /* ================= Cross-number: a crossword with numbers ================= */
  const SEASONS = {
    fall: { name: 'fall', things: [(a, b) => `${a} rows of ${b} pumpkins: how many pumpkins?`, (a, b) => `${a} baskets with ${b} apples in each: how many apples?`, (a, b) => `${a} piles of ${b} leaves: how many leaves?`], art: 'leaf' },
    winter: { name: 'winter', things: [(a, b) => `${a} boxes of ${b} mittens: how many mittens?`, (a, b) => `${a} windows with ${b} paper snowflakes on each: how many snowflakes?`, (a, b) => `${a} trays of ${b} mugs of cocoa: how many mugs?`], art: 'snow' },
    spring: { name: 'spring', things: [(a, b) => `${a} rows of ${b} tulips: how many tulips?`, (a, b) => `${a} packets of ${b} seeds: how many seeds?`, (a, b) => `${a} boxes of ${b} kites: how many kites?`], art: 'flower' },
    summer: { name: 'summer', things: [(a, b) => `${a} buckets of ${b} shells: how many shells?`, (a, b) => `${a} trays of ${b} cups of lemonade: how many cups?`, (a, b) => `${a} rows of ${b} sunflowers: how many sunflowers?`], art: 'sun' },
  };
  /** the season on a day: fall in September to November, and so on */
  const season = iso => { const m = Number((iso || today()).slice(5, 7)); return m >= 9 && m <= 11 ? 'fall' : m === 12 || m <= 2 ? 'winter' : m <= 5 ? 'spring' : 'summer'; };
  const CROSS_STEPS = [null, { n: 4, maxLen: 3 }, { n: 4, maxLen: 3 }, { n: 5, maxLen: 3 }, { n: 5, maxLen: 3 }, { n: 5, maxLen: 4 }];
  /** a grid of open cells (true) and blocks: every entry 2 or more long, every open cell in an entry, all joined */
  function crossGrid(R, n, maxLen) {
    for (let tries = 0; tries < 400; tries++) {
      const open = Array(n * n).fill(true);
      const blocks = R.int(Math.floor(n * n / 6), Math.floor(n * n / 3.2));
      for (let k = 0; k < blocks; k++) { const i = R.int(0, n * n - 1); open[i] = false; open[n * n - 1 - i] = false; }          // symmetric, like a crossword
      const runs = [];
      for (const dir of ['across', 'down']) for (let a = 0; a < n; a++) {
        let run = [];
        for (let b = 0; b <= n; b++) {
          const i = dir === 'across' ? a * n + b : b * n + a;
          if (b < n && open[i]) run.push(i);
          else { if (run.length >= 2) runs.push({ dir, cells: run }); run = []; }
        }
      }
      if (runs.some(r => r.cells.length > maxLen)) continue;
      const inRun = new Set([].concat(...runs.map(r => r.cells)));
      if (open.some((o, i) => o && !inRun.has(i))) continue;
      // every open cell is reachable from the first, and most cells cross two entries
      const cells = open.map((o, i) => o ? i : -1).filter(i => i >= 0);
      if (cells.length < n * n * 0.55) continue;
      const seen = new Set([cells[0]]), todo = [cells[0]];
      while (todo.length) { const i = todo.pop(); [i - n, i + n, i % n ? i - 1 : -1, i % n < n - 1 ? i + 1 : -1].forEach(j => { if (j >= 0 && j < n * n && open[j] && !seen.has(j)) { seen.add(j); todo.push(j); } }); }
      if (seen.size !== cells.length) continue;
      const both = cells.filter(i => runs.filter(r => r.cells.includes(i)).length === 2).length;
      if (both < cells.length * 0.6) continue;
      return { open, runs };
    }
    return null;
  }
  /** a clue for a number: { text, value } — the value is worked out from the clue, and must equal the entry */
  function clueFor(v, R, st, sea, stories) {
    const opts = [];
    const facs = []; for (let a = 2; a <= 12; a++) if (v % a === 0 && v / a >= 2 && (v / a <= 12 || (st >= 3 && v / a <= 99))) facs.push([a, v / a]);
    if (facs.length) { const [a, b] = R.pick(facs); opts.push({ text: `${a} × ${b}`, value: a * b }); }
    if (facs.length && st >= 2 && stories) { const [a, b] = R.pick(facs); opts.push({ text: R.pick(SEASONS[sea].things)(a, b), value: a * b, story: true }); }
    { const a = R.int(1, v - 1); opts.push({ text: `${a} + ${v - a}`, value: a + (v - a) }); }
    { const b = R.int(1, Math.min(60, v)); opts.push({ text: `${v + b} − ${b}`, value: v + b - b }); }
    if (v % 2 === 0 && st >= 2) opts.push({ text: `Half of ${v * 2}`, value: v * 2 / 2 });
    if (st >= 2) opts.push({ text: `Double ${v / 2}`, value: v, skip: v % 2 !== 0 });
    if (st >= 3) { const r = Math.round(Math.sqrt(v)); if (r * r === v) opts.push({ text: `${r}²`, value: r * r }); }
    if (st >= 3) { const k = R.pick([2, 3, 4, 5, 6]); opts.push({ text: `${v * k} ÷ ${k}`, value: v * k / k }); }
    if (st >= 4 && v % 10 === 0 && v <= 990) opts.push({ text: `10% of ${v * 10}`, value: v * 10 / 10 });
    if (st >= 4) { const near = []; for (let a = 3; a <= 12; a++) for (let b = a; b <= 12; b++) if (v - a * b >= 1 && v - a * b <= 20) near.push([a, b]); if (near.length) { const [a, b] = R.pick(near); opts.push({ text: `${a} × ${b} + ${v - a * b}`, value: a * b + (v - a * b) }); } }
    if (st >= 5 && v % 4 === 0) opts.push({ text: `25% of ${v * 4}`, value: v * 4 / 4 });
    const good = opts.filter(o => !o.skip && o.value === v);
    const story = good.find(o => o.story);
    return story && R.chance(0.35) ? story : R.pick(good.filter(o => !o.story).length ? good.filter(o => !o.story) : good);
  }
  /** today's Cross-number: { n, open, entries: [{ num, dir, cells, value, clue }], digits } */
  function makeCross(seed, st, sea) {
    const T = CROSS_STEPS[st], R = RNG.make('cross:' + seed + ':' + st);
    for (let tries = 0; tries < 30; tries++) {
      const grid = crossGrid(R, T.n, T.maxLen);
      if (!grid) continue;
      const n = T.n, digits = Array(n * n).fill(null);
      const firsts = new Set(grid.runs.map(r => r.cells[0]));
      grid.open.forEach((o, i) => { if (o) digits[i] = firsts.has(i) ? R.int(1, 9) : R.int(st <= 2 ? 1 : 0, 9); });
      // number the entries like a crossword: left to right, top to bottom
      let num = 0; const numOf = {};
      for (let i = 0; i < n * n; i++) if (grid.runs.some(r => r.cells[0] === i)) numOf[i] = ++num;
      const entries = grid.runs.map(r => ({ num: numOf[r.cells[0]], dir: r.dir, cells: r.cells, value: Number(r.cells.map(i => digits[i]).join('')) }))
        .sort((a, b) => (a.dir === b.dir ? a.num - b.num : a.dir === 'across' ? -1 : 1));
      let ok = true, stories = 2;
      entries.forEach(e => { e.clue = clueFor(e.value, R, st, sea, stories > 0); if (!e.clue || e.clue.value !== e.value) ok = false; else if (e.clue.story) stories--; });
      if (!ok) continue;
      return { n, open: grid.open, entries, digits, numOf, step: st };
    }
    return null;
  }
  /** the code's own check: every clue works out to its entry, and every entry reads off the grid's digits */
  function checkCross(pz) {
    return !!pz && pz.entries.every(e => e.clue.value === e.value && Number(e.cells.map(i => pz.digits[i]).join('')) === e.value && pz.digits[e.cells[0]] !== 0);
  }

  /* ================= the daily three: a missing number, a pattern, a comparison ================= */
  function makeThree(seed, st) {
    const R = RNG.make('three:' + seed + ':' + st), out = [];
    // 1. a missing number
    {
      const a = R.int(2, st <= 2 ? 9 : 12), b = R.int(2, st <= 2 ? 9 : 12), k = R.int(0, st <= 1 ? 1 : 3);
      const forms = [
        { q: `□ + ${a} = ${a + b}`, a: b, why: `${a + b} − ${a} = ${b}` },
        { q: `${a + b} − □ = ${a}`, a: b, why: `${a + b} − ${b} = ${a}` },
        { q: `□ × ${a} = ${a * b}`, a: b, why: `${a * b} ÷ ${a} = ${b}` },
        { q: `${a * b} ÷ □ = ${a}`, a: b, why: `${a} × ${b} = ${a * b}, so ${a * b} ÷ ${b} = ${a}` },
      ];
      const fm = x => (x < 0 ? '−' + -x : String(x));
      if (st >= 4) forms.push({ q: `□ − ${a} = −${b}`, a: a - b, why: `−${b} + ${a} = ${fm(a - b)}` });
      if (st >= 5) forms.push({ q: `${a}□ − ${b} = ${a * a - b}`, a: a, why: `${a}² = ${a * a}, and ${a * a} − ${b} = ${a * a - b}`, sup: true });
      const f = st >= 4 ? R.pick(forms) : forms[Math.min(k, forms.length - 1)];
      if (f.sup) out.push({ kind: 'missing', title: 'The missing number', q: `□ squared, minus ${b}, is ${a * a - b}. What is □? (It’s positive.)`, a: a, why: f.why });
      else out.push({ kind: 'missing', title: 'The missing number', q: `What number goes in the box? ${f.q}`, a: f.a, why: f.why });
    }
    // 2. the next number in a pattern
    {
      const geo = st >= 3 && R.chance(0.35);
      if (geo) { const s0 = R.int(1, 5), r = R.int(2, 3), list = [s0, s0 * r, s0 * r * r, s0 * r * r * r]; out.push({ kind: 'pattern', title: 'What comes next?', q: `${list.join(', ')}, …`, a: list[3] * r, why: `Each number is ${r} times the one before: ${list[3]} × ${r} = ${list[3] * r}.` }); }
      else { const s0 = R.int(st >= 4 ? -20 : 1, 20), d = R.pick(st >= 4 ? [-7, -4, -3, 3, 4, 6, 7, 9] : [2, 3, 4, 5, 6, 10]), list = [0, 1, 2, 3].map(k => s0 + k * d); out.push({ kind: 'pattern', title: 'What comes next?', q: `${list.map(x => (x < 0 ? '−' + -x : x)).join(', ')}, …`, a: list[3] + d, why: `Each number is ${d > 0 ? d + ' more' : -d + ' less'} than the one before: ${list[3] < 0 ? '−' + -list[3] : list[3]} ${d > 0 ? '+' : '−'} ${Math.abs(d)} = ${list[3] + d < 0 ? '−' + -(list[3] + d) : list[3] + d}.` }); }
    }
    // 3. which is greater?
    {
      if (st <= 2) { const a = R.int(11, 99); let x = R.int(11, 99); if (x === a) x = a === 99 ? 98 : a + 1; out.push({ kind: 'compare', title: 'Which is greater?', choices: [String(a), String(x)], a: a > x ? 0 : 1, why: Math.floor(a / 10) === Math.floor(x / 10) ? `They have the same tens, and ${Math.max(a, x)} has more ones.` : `${Math.max(a, x)} has more tens.` }); }
      else {
        const pairs = [[[1, 2], [3, 5]], [[2, 3], [3, 4]], [[3, 8], [1, 3]], [[5, 6], [7, 8]], [[2, 5], [3, 8]], [[4, 7], [3, 5]], [[5, 9], [4, 7]], [[7, 10], [2, 3]]];
        const [p, q] = R.pick(pairs), flip = R.bool(), A = flip ? q : p, B = flip ? p : q;
        const big = A[0] * B[1] > B[0] * A[1] ? 0 : 1;
        out.push({ kind: 'compare', title: 'Which is greater?', choices: [`${A[0]}/${A[1]}`, `${B[0]}/${B[1]}`], a: big, why: `Compare with a common denominator: ${A[0]}/${A[1]} = ${A[0] * B[1]}/${A[1] * B[1]} and ${B[0]}/${B[1]} = ${B[0] * A[1]}/${A[1] * B[1]}, so ${big ? `${B[0]}/${B[1]}` : `${A[0]}/${A[1]}`} is greater.` });
      }
    }
    return out;
  }

  /* ================= the puzzle of the day: which kinds suit the learner's grade ================= */
  const KINDS = {
    leap: { name: 'Leap', icon: 'flag', line: 'Reach the flag on the number line, using every card once.', href: d => (d === today() ? '#/leap/daily' : '#/leap/day/' + d) },
    balance: { name: 'Balance', icon: 'balance', line: 'Place every weight so the seesaw is level.', href: d => (d === today() ? '#/balance/daily' : '#/balance/day/' + d) },
    target: { name: 'Target', icon: 'target', line: 'Combine the numbers with + − × ÷ to make the target.', href: d => '#/puzzles/target' + (d === today() ? '' : '/' + d) },
    cages: { name: 'Cages', icon: 'tiles', line: 'Fill the grid so every row and column has each number once, and every cage makes its number.', href: d => '#/puzzles/cages' + (d === today() ? '' : '/' + d) },
    cross: { name: 'Cross-number', icon: 'story', line: 'A crossword where every answer is a number.', href: d => '#/puzzles/cross' + (d === today() ? '' : '/' + d) },
  };
  /** the puzzles that suit the learner, best first: gentle ones for younger learners, grids and cross-numbers later */
  function forGrade() {
    const p = S.get().profile, g = p.adult ? 12 : p.grade;
    if (g == null) return ['leap', 'balance', 'target', 'cages', 'cross'];
    if (g <= 2) return ['target', 'leap', 'balance'];
    if (g <= 5) return ['target', 'balance', 'leap', 'cages'];
    if (g <= 8) return ['leap', 'cages', 'target', 'cross', 'balance'];
    return ['cages', 'cross', 'target', 'leap', 'balance'];
  }
  const dayNum = iso => Math.round(Date.UTC(...iso.split('-').map((v, i) => Number(v) - (i === 1 ? 1 : 0))) / 864e5);
  /** the puzzle of the day for Home: it takes turns among the ones that suit the grade */
  function todayPick() {
    const list = forGrade(), t = today(), k = list[dayNum(t) % list.length], K = KINDS[k];
    return { kind: k, name: K.name, icon: K.icon, href: K.href(t), sub: `Today’s ${K.name} puzzle: ${K.line.charAt(0).toLowerCase() + K.line.slice(1)}`, done: solvedToday() };
  }


  /* ================= the pages ================= */
  const longDate = iso => new Date(iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const shortDate = iso => new Date(iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const okDate = d => (/^\d{4}-\d\d-\d\d$/.test(d || '') && d <= today() && d >= '2026-01-01' ? d : today());
  const STAR = '10,1.5 12.6,7.2 18.8,7.8 14.1,12 15.5,18.2 10,15 4.5,18.2 5.9,12 1.2,7.8 7.4,7.2';
  const starIcons = n => `<svg width="60" height="20" viewBox="0 0 60 20" aria-hidden="true" style="vertical-align:-4px">${[0, 1, 2].map(k => `<polygon points="${STAR}" transform="translate(${k * 20} 0)" fill="${k < n ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>`).join('')}</svg>`;
  const starsFor = paid => (paid === 0 ? 3 : paid <= 2 ? 2 : 1);
  const HOW_HINTS = 'Hints come one step at a time: a nudge first (free), then two that tell you more. Those two cost a star each.';
  const HOW_STARS = 'Scoring: three stars with no paid hints and no wrong finishes, two stars with one or two, otherwise one.';
  /** keys for a puzzle page, while it is on screen (never while typing in a box or the tutor) */
  function onKeys(wrap, fn) {
    const h = ev => {
      if (!wrap.isConnected) { document.removeEventListener('keydown', h); return; }
      if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.defaultPrevented || (ev.target && ev.target.closest && ev.target.closest('input, textarea, select, [contenteditable="true"], .tutor'))) return;
      fn(ev, (ev.key || '').toLowerCase());
    };
    document.addEventListener('keydown', h);
  }
  /** a drawn picture for the season, in the one blue: a leaf, a snowflake, a flower or the sun */
  function seasonArt(sea, size) {
    const s = size || 120, g = {
      leaf: '<path d="M60 14c14 14 30 18 40 16-2 14 2 26 8 32-12 4-20 14-22 26-10-6-20-6-26-2-6-4-16-4-26 2-2-12-10-22-22-26 6-6 10-18 8-32 10 2 26-2 40-16z" class="pz-art-fill"/><path d="M60 28v80M60 56l-18-14M60 56l18-14M60 76l-24-12M60 76l24-12" class="pz-art-line"/>',
      snow: '<g class="pz-art-line">' + [0, 60, 120].map(a => `<g transform="rotate(${a} 60 60)"><path d="M60 14v92M60 30l-10-10M60 30l10-10M60 90l-10 10M60 90l10 10M60 46l-14-8M60 46l14-8M60 74l-14 8M60 74l14 8"/></g>`).join('') + '</g><circle cx="60" cy="60" r="8" class="pz-art-fill"/>',
      flower: [0, 72, 144, 216, 288].map(a => `<ellipse cx="60" cy="36" rx="14" ry="22" transform="rotate(${a} 60 60)" class="pz-art-fill"/>`).join('') + '<circle cx="60" cy="60" r="13" class="pz-art-core"/><path d="M60 82v30M60 100c-8-8-18-8-22-4M60 104c8-8 18-8 22-4" class="pz-art-line"/>',
      sun: '<circle cx="60" cy="60" r="24" class="pz-art-fill"/>' + Array.from({ length: 12 }, (_, k) => `<path d="M60 22v-12" transform="rotate(${k * 30} 60 60)" class="pz-art-line"/>`).join('') + '<circle cx="60" cy="60" r="24" class="pz-art-line" fill="none"/>',
    }[SEASONS[sea].art];
    return `<svg viewBox="0 0 120 120" width="${s}" height="${s}" class="pz-art-svg" aria-hidden="true" focusable="false">${g}</svg>`;
  }
  /** the frame every daily puzzle shares: a heading, the difficulty, the board, a status line, buttons, the why */
  function shell(root, kind, date, how, redraw) {
    const K = KINDS[kind], past = date !== today();
    root.innerHTML = `<div class="pz-page" data-kind="${kind}">
      <div class="card pz-head"><div><h1>${K.name}</h1><p class="muted small">${K.line}</p></div>
        <nav class="lp-nav" aria-label="Puzzles"><a class="chip-btn" href="#/puzzles">All puzzles</a><a class="chip-btn" href="#/puzzles/archive">Past puzzles</a></nav></div>
      <div class="pz-main">
        <section class="card pz-board" aria-labelledby="pz-title">
          <div class="row between pz-top"><h2 id="pz-title">${past ? 'Puzzle for ' + esc(longDate(date)) : 'Today’s puzzle'}</h2><span class="small muted" id="pz-best"></span></div>
          ${diffChips()}
          <div id="pz-body"></div>
          <div class="lp-status" id="pz-status" aria-live="polite"></div>
          <div class="btn-row" id="pz-btns"></div>
          <p class="tiny muted lp-keys" id="pz-keys"></p>
          <div id="pz-why"></div>
        </section>
        <aside class="card pz-side"><h2>How it works</h2><ul class="nm-facts">${how.map(li => `<li>${li}</li>`).join('')}<li>${HOW_HINTS}</li><li>${HOW_STARS}</li></ul></aside>
      </div></div>`;
    wireDiff(root, redraw);
    const best = (doneOn(date) || {})[kind];
    root.querySelector('#pz-best').textContent = best ? `Best: ${best} of 3 stars` : '';
    const q = s => root.querySelector(s);
    return { q, wrap: root.querySelector('.pz-page'), status: html => { q('#pz-status').innerHTML = html; } };
  }
  const winHtml = (stars, extra) => `<div class="lp-win"><b>Solved. <span class="lp-stars" role="img" aria-label="${stars} of 3 stars">${starIcons(stars)}</span></b>${extra || ''}<div class="btn-row"><a class="btn primary sm" href="#/puzzles">More puzzles</a><button type="button" class="btn ghost sm" id="pz-again">Play again</button></div></div>`;
  const broken = root => { root.innerHTML = '<div class="card empty"><h1>This puzzle couldn’t be made</h1><p class="muted">Try another day’s puzzle, or another difficulty.</p><a class="btn primary" href="#/puzzles">All puzzles</a></div>'; };
  const OPNAME = { '+': 'plus', '−': 'minus', '×': 'times', '÷': 'divided by' };

  /* ---------- Target ---------- */
  function targetPage(root, date) {
    date = okDate(date);
    const st = step('target'), pz = makeTarget(date, st), T = pz.T, goal = pz.target;
    const ui = shell(root, 'target', date, [
      'Select a number, then an operation, then another number. The two numbers are replaced by the answer.',
      'Keep going until one number is left: it has to be the target. Every number is used exactly once.',
      T.frac ? 'Fractions and negative numbers are fine on the way.' : 'Every step has to come out to a whole number that isn’t negative.',
    ], () => targetPage(root, date));
    const { q, wrap, status } = ui;
    let tiles, hist, sel, op, paid = 0, won = false, ended = false, hintStep = 0;
    const KEYS = 'abcd';
    q('#pz-btns').innerHTML = '<button type="button" class="btn sm" id="tg-undo" aria-keyshortcuts="U">Undo</button><button type="button" class="btn sm ghost" id="tg-restart" aria-keyshortcuts="R">Start again</button><button type="button" class="btn sm ghost" id="tg-hint" aria-keyshortcuts="H">Show a hint</button>';
    q('#pz-keys').innerHTML = 'Keys: <kbd>A</kbd> to <kbd>' + KEYS[pz.nums.length - 1].toUpperCase() + '</kbd> choose a number, <kbd>+</kbd> <kbd>-</kbd> <kbd>*</kbd> <kbd>/</kbd> choose an operation, <kbd>U</kbd> undoes, <kbd>H</kbd> gives a hint.';
    function reset() { tiles = pz.nums.map(n => ({ v: Q(n), e: String(n), p: 3, steps: [] })); hist = []; sel = null; op = null; ended = false; hintStep = 0; }
    function draw() {
      q('#pz-body').innerHTML = `<div class="tg-goal"><span class="small muted">Make</span><b class="tg-target">${goal}</b></div>
        <div class="tg-tiles" role="group" aria-label="Numbers">${tiles.map((t, i) => `<button type="button" class="tg-tile${sel === i ? ' sel' : ''}" data-tile="${i}" aria-pressed="${sel === i}" aria-keyshortcuts="${KEYS[i].toUpperCase()}"${won ? ' disabled' : ''}><span class="tg-key" aria-hidden="true">${KEYS[i].toUpperCase()}</span>${qs(t.v)}</button>`).join('')}</div>
        <div class="tg-ops" role="group" aria-label="Operations">${T.ops.map(o => `<button type="button" class="tg-op${op === o ? ' sel' : ''}" data-op="${o}" aria-pressed="${op === o}" aria-label="${OPNAME[o]}"${won ? ' disabled' : ''}>${o}</button>`).join('')}</div>
        <div class="tg-trail small muted">${hist.length ? esc(tiles.map(t => t.steps).flat().join(' · ')) : ''}</div>`;
      q('#tg-undo').disabled = !hist.length || won; q('#tg-restart').disabled = !hist.length; q('#tg-hint').disabled = won;
      root.__target = { nums: pz.nums.slice(), target: goal, tiles: tiles.map(t => qs(t.v)), sel, op, won, paid, hintStep, way: pz.way.e, step: st };
    }
    function combine(a, b) {
      const A = tiles[a], B = tiles[b], r = join(A, op, B);
      const what = `${qs(A.v)} ${op} ${qs(B.v)}`;
      if (!r) { status('You can’t divide by 0. Choose another number.'); return; }
      if (!T.frac && r.v[1] !== 1) { status(`${what} doesn’t come out to a whole number. Try another pair.`); op = null; draw(); return; }
      if (!T.neg && r.v[0] < 0) { status(`${what} would go below zero. Try the other way round.`); op = null; draw(); return; }
      hist.push(tiles.slice());
      const next = tiles.filter((_, k) => k !== a && k !== b); next.splice(Math.min(a, b), 0, r);
      tiles = next; sel = tiles.length > 1 ? Math.min(a, b) : null; op = null; hintStep = 0;
      if (tiles.length > 1) { status(`${what} = <b>${qs(r.v)}</b>. ${tiles.length} numbers left.`); draw(); return; }
      if (r.v[1] === 1 && r.v[0] === goal) return win(r);
      if (!ended) { paid++; ended = true; }
      status(`That makes <b>${qs(r.v)}</b>, not ${goal}. Undo a step and try another way.`); draw();
    }
    function win(r) {
      won = true;
      const stars = starsFor(paid);
      solved('target', date, stars);
      status(winHtml(stars, `<div class="small">As one expression: <b class="lp-expr">${esc(r.e)} = ${goal}</b></div>`));
      const theirs = r.e.replace(/\s/g, ''), other = pz.way.e.replace(/\s/g, '') !== theirs ? pz.way.e : '';
      q('#pz-why').innerHTML = `<details class="lp-explain" open><summary>How it works</summary><ol class="small">${r.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
        <p class="small">Brackets show what was worked out first: without them, × and ÷ come before + and −.${other ? ` Another way: <b class="lp-expr">${esc(other)} = ${goal}</b>.` : ''}</p></details>`;
      draw(); root.__target.stars = stars;
      const a = q('#pz-again'); if (a) a.focus();
    }
    function hintMe() {
      const w = wayFrom(tiles.map(t => t.v), goal, T);
      if (!w) { status('There’s no way to the target from these numbers. Undo a step or start again.'); return; }
      if (hintStep === 0) {
        hintStep = 1;
        const pairs = []; for (let a = 2; a * a <= goal && pairs.length < 3; a++) if (goal % a === 0) pairs.push(`${a} × ${goal / a}`);
        status(pairs.length ? `Think about the last step. ${goal} is ${pairs.join(', or ')}, among other ways. Could your numbers make the two parts of one of those?`
          : `Think about the last step. ${goal} doesn’t split into a times fact, so the last step is likely + or −. What would you add to one of your numbers to get there?`);
        draw(); return;
      }
      paid++;
      if (hintStep === 1 && w.steps.length > 1) { hintStep = 2; status(`One way finishes with <b>${esc(w.steps[w.steps.length - 1])}</b>. Can you make both of those numbers?`); draw(); return; }
      hintStep = 3; status(`Start with <b>${esc(w.steps[0])}</b>.`); draw();
    }
    wrap.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b || b.disabled || !wrap.contains(b) || b.dataset.diff) return;
      if (b.dataset.tile !== undefined) {
        const i = Number(b.dataset.tile);
        if (sel === null || (sel !== i && op === null)) { sel = i; status(op ? '' : `Now choose an operation for ${qs(tiles[i].v)}.`); }
        else if (sel === i) { sel = null; op = null; status(''); }
        else return combine(sel, i);
        draw(); const f = q(`[data-tile="${i}"]`); if (f) f.focus(); return;
      }
      if (b.dataset.op) { if (sel === null) { status('Choose a number first.'); return; } op = op === b.dataset.op ? null : b.dataset.op; status(op ? `${qs(tiles[sel].v)} ${op} … now choose another number.` : ''); draw(); const f = q(`[data-op="${b.dataset.op}"]`); if (f) f.focus(); return; }
      if (b.id === 'tg-undo' && hist.length) { tiles = hist.pop(); sel = null; op = null; ended = false; hintStep = 0; status('Undone.'); draw(); }
      else if (b.id === 'tg-restart') { const p0 = paid; reset(); paid = p0; won = false; q('#pz-why').innerHTML = ''; status(`Make ${goal} from ${pz.nums.join(', ')}.`); draw(); }
      else if (b.id === 'tg-hint') hintMe();
      else if (b.id === 'pz-again') { reset(); paid = 0; won = false; q('#pz-why').innerHTML = ''; status(`Make ${goal} from ${pz.nums.join(', ')}.`); draw(); }
    });
    onKeys(wrap, (ev, k) => {
      const click = el => { if (el && !el.disabled) { ev.preventDefault(); el.click(); } };
      const map = { '+': '+', '-': '−', '−': '−', '*': '×', 'x': '×', '×': '×', '/': '÷', '÷': '÷' };
      if (KEYS.includes(k) && k.length === 1) click(q(`[data-tile="${KEYS.indexOf(k)}"]`));
      else if (map[k]) click(q(`[data-op="${map[k]}"]`));
      else if (k === 'u' || k === 'backspace') click(q('#tg-undo'));
      else if (k === 'h') click(q('#tg-hint'));
      else if (k === 'r') click(q('#tg-restart'));
    });
    reset(); draw();
    status(`Make <b>${goal}</b> from ${pz.nums.join(', ')}, using each number once.`);
    H.tutorCtx({ notes: `The student is playing Target: make ${goal} from ${pz.nums.join(', ')} using ${T.ops.join(' ')}, each number once. Give hints about the last step or useful factor pairs; don't give the whole answer unless asked.` });
  }

  /* ---------- Cages ---------- */
  function cagesPage(root, date) {
    date = okDate(date);
    const st = step('cages'), pz = makeCages(date, st);
    if (!pz) return broken(root);
    const n = pz.n, owner = [], head = pz.cages.map(c => c.cells[0]);
    pz.cages.forEach((c, k) => c.cells.forEach(i => { owner[i] = k; }));
    const ui = shell(root, 'cages', date, [
      `Fill the grid with the numbers 1 to ${n}, so that every row and every column has each number exactly once.`,
      'Each outlined cage has a number and an operation in its corner: its cells have to make that number. 7+ means they add to 7, 12× that they multiply to 12.',
      '− and ÷ cages have two cells: take the smaller from the larger, or divide the larger by the smaller. A cage with just a number is that number.',
      'Select a cell, then press a number below or type it. Arrow keys move between cells.',
    ], () => cagesPage(root, date));
    const { q, wrap, status } = ui;
    let vals = Array(n * n).fill(0), cur = 0, paid = 0, won = false, hintStep = 0, bad = new Set(), lastFull = false;
    q('#pz-btns').innerHTML = '<button type="button" class="btn sm ghost" id="cg-restart" aria-keyshortcuts="R">Clear the grid</button><button type="button" class="btn sm ghost" id="cg-hint" aria-keyshortcuts="H">Show a hint</button>';
    q('#pz-keys').innerHTML = `Keys: arrows move, <kbd>1</kbd> to <kbd>${n}</kbd> fill a cell, <kbd>Delete</kbd> clears it, <kbd>H</kbd> gives a hint.`;
    const rc = i => [Math.floor(i / n), i % n];
    const dups = () => { const d = new Set(); for (let i = 0; i < n * n; i++) { if (!vals[i]) continue; const [r, c] = rc(i); for (let j = 0; j < n * n; j++) { if (j === i || vals[j] !== vals[i]) continue; const [r2, c2] = rc(j); if (r2 === r || c2 === c) d.add(i); } } return d; };
    function cellHtml(i) {
      const [r, c] = rc(i), k = owner[i], cg = pz.cages[k], b = [];
      if (r === 0 || owner[i - n] !== k) b.push('bt'); if (c === 0 || owner[i - 1] !== k) b.push('bl');
      if (r === n - 1 || owner[i + n] !== k) b.push('bb'); if (c === n - 1 || owner[i + 1] !== k) b.push('br');
      const d = dupSet.has(i);
      return `<button type="button" class="cg-cell ${b.join(' ')}${cur === i ? ' cur' : ''}${d ? ' dup' : ''}${bad.has(k) ? ' bad' : ''}" data-i="${i}" tabindex="${cur === i ? 0 : -1}" aria-label="Row ${r + 1}, column ${c + 1}: ${vals[i] || 'empty'}${d ? ', repeated in its row or column' : ''}. Cage ${esc(cageClue(cg))}, ${esc(cageWords(cg))}."${won ? ' disabled' : ''}>${head[k] === i ? `<span class="cg-clue" aria-hidden="true">${esc(cageClue(cg))}</span>` : ''}<span class="cg-v" aria-hidden="true">${vals[i] || ''}</span></button>`;
    }
    let dupSet = new Set();
    function draw(focus) {
      dupSet = dups();
      q('#pz-body').innerHTML = `<div class="cg-grid" style="--n:${n}" role="group" aria-label="The grid, ${n} by ${n}">${Array.from({ length: n * n }, (_, i) => cellHtml(i)).join('')}</div>
        <div class="cg-pad" role="group" aria-label="Numbers">${Array.from({ length: n }, (_, k) => `<button type="button" class="cg-key" data-put="${k + 1}"${won ? ' disabled' : ''}>${k + 1}</button>`).join('')}<button type="button" class="cg-key wide" data-put="0"${won ? ' disabled' : ''}>Clear</button></div>`;
      q('#cg-hint').disabled = won;
      if (focus) { const c = q(`.cg-cell[data-i="${cur}"]`); if (c) c.focus(); }
      root.__cages = { n, cages: pz.cages.map(c => ({ cells: c.cells.slice(), op: c.op, t: c.t })), sol: pz.sol.slice(), vals: vals.slice(), cur, won, paid, hintStep, step: st };
    }
    function put(v) {
      if (won) return;
      vals[cur] = v; hintStep = 0; bad = new Set();
      const full = vals.every(Boolean);
      if (full && vals.join() === pz.sol.join()) return win();
      if (full && !lastFull) {
        paid++;
        pz.cages.forEach((c, k) => { if (!cageOk(c, c.cells.map(i => vals[i]))) bad.add(k); });
        const d = dups().size;
        status(`Not quite yet.${bad.size ? ` ${bad.size === 1 ? 'One cage doesn’t' : bad.size + ' cages don’t'} make ${bad.size === 1 ? 'its' : 'their'} number (outlined).` : ''}${d ? ' Some rows or columns repeat a number.' : ''}`);
      } else if (!full) status('');
      lastFull = full;
      draw(true);
    }
    function win() {
      won = true;
      const stars = starsFor(paid);
      solved('cages', date, stars);
      status(winHtml(stars));
      const ranked = pz.cages.filter(c => c.op !== '=').map(c => ({ c, combos: cageCombos(c, n) })).sort((a, b) => a.combos.length - b.combos.length).slice(0, 5);
      q('#pz-why').innerHTML = `<details class="lp-explain" open><summary>How it fits together</summary><ul class="small">
        <li>Each row and column holds 1 to ${n} once, so a number used in a row rules it out for the rest of that row.</li>
        ${ranked.map(({ c, combos }) => `<li>The cage <b>${esc(cageClue(c))}</b> (${c.cells.length} cells) can only be ${combos.map(x => x.join(', ')).join(' or ')}. Here it is ${c.cells.map(i => pz.sol[i]).join(', ')}.</li>`).join('')}</ul></details>`;
      draw(); root.__cages.stars = stars;
      const a = q('#pz-again'); if (a) a.focus();
    }
    /** what a cell could still be: not in its row or column (counting only correct entries), and in one of its cage's ways */
    function cands(i) {
      const [r, c] = rc(i), used = new Set();
      for (let j = 0; j < n * n; j++) { const [r2, c2] = rc(j); if (j !== i && (r2 === r || c2 === c) && vals[j] && vals[j] === pz.sol[j]) used.add(vals[j]); }
      const ok = new Set([].concat(...cageCombos(pz.cages[owner[i]], n)));
      return Array.from({ length: n }, (_, k) => k + 1).filter(v => ok.has(v) && !used.has(v));
    }
    function hintMe() {
      const open = vals.map((v, i) => i).filter(i => vals[i] !== pz.sol[i]);
      if (!open.length) return;
      if (hintStep === 0) {
        hintStep = 1;
        const single = pz.cages.find(c => c.op === '=' && vals[c.cells[0]] !== c.t);
        if (single) { status('Start with the cages of one cell: the number in the corner is the number that goes there.'); draw(); return; }
        const best = pz.cages.filter(c => c.cells.some(i => vals[i] !== pz.sol[i])).map(c => ({ c, combos: cageCombos(c, n) })).sort((a, b) => a.combos.length - b.combos.length)[0];
        status(`Look at the cage <b>${esc(cageClue(best.c))}</b>: its ${best.c.cells.length} cells can only be ${best.combos.slice(0, 4).map(x => x.join(', ')).join(' or ')}${best.combos.length > 4 ? ', and a few more' : ''}. Which of those fits its rows and columns?`);
        draw(); return;
      }
      paid++;
      const pick = open.map(i => ({ i, c: cands(i) })).sort((a, b) => a.c.length - b.c.length)[0];
      if (hintStep === 1 && pick.c.length > 1) {
        hintStep = 2; cur = pick.i;
        status(`The selected cell can only be ${pick.c.join(' or ')}, once you check its cage, its row and its column.`);
        draw(true); return;
      }
      hintStep = 3; cur = pick.i;
      status(`The selected cell is <b>${pz.sol[pick.i]}</b>.`);
      put(pz.sol[pick.i]);
      if (!won) status(`The selected cell is <b>${pz.sol[pick.i]}</b>.`);
    }
    wrap.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b || b.disabled || !wrap.contains(b) || b.dataset.diff) return;
      if (b.dataset.i !== undefined) { cur = Number(b.dataset.i); draw(true); return; }
      if (b.dataset.put !== undefined) { put(Number(b.dataset.put)); return; }
      if (b.id === 'cg-restart') { vals = Array(n * n).fill(0); bad = new Set(); lastFull = false; status('The grid is clear.'); draw(); }
      else if (b.id === 'cg-hint') hintMe();
      else if (b.id === 'pz-again') { vals = Array(n * n).fill(0); bad = new Set(); lastFull = false; won = false; paid = 0; q('#pz-why').innerHTML = ''; status(''); draw(true); }
    });
    onKeys(wrap, (ev, k) => {
      if (won) return;
      const mv = { arrowleft: [0, -1], arrowright: [0, 1], arrowup: [-1, 0], arrowdown: [1, 0] }[k];
      if (mv) { ev.preventDefault(); const [r, c] = rc(cur); cur = Math.max(0, Math.min(n - 1, r + mv[0])) * n + Math.max(0, Math.min(n - 1, c + mv[1])); draw(true); return; }
      if (/^[1-9]$/.test(k) && Number(k) <= n) { ev.preventDefault(); put(Number(k)); return; }
      if (k === 'backspace' || k === 'delete' || k === '0') { ev.preventDefault(); put(0); return; }
      if (k === 'h') { ev.preventDefault(); hintMe(); }
    });
    draw();
    status(`Fill each row and column with 1 to ${n}, and make every cage’s number.`);
    H.tutorCtx({ notes: `The student is solving Cages, a ${n} by ${n} grid puzzle: each row and column has 1 to ${n} once, and each cage makes its number with its operation. Cages: ${pz.cages.map(c => cageClue(c) + ' over ' + c.cells.length + ' cells').join('; ')}. Give hints about which numbers a cage can hold; don't give the whole answer unless asked.` });
  }

  /* ---------- Cross-number ---------- */
  function crossPage(root, date) {
    date = okDate(date);
    const st = step('cross'), sea = season(date), pz = makeCross(date, st, sea);
    if (!checkCross(pz)) return broken(root);
    const n = pz.n, opens = pz.open.map((o, i) => (o ? i : -1)).filter(i => i >= 0);
    const ui = shell(root, 'cross', date, [
      'Work out each clue and write the answer in the grid, one digit in each square, reading across or down.',
      'Answers that cross share a digit, so each one you solve gives you digits for others.',
      `Select a square, then type or press digits; select it again to switch between across and down. This ${SEASONS[sea].name}, a few clues are about the season.`,
    ], () => crossPage(root, date));
    const { q, wrap, status } = ui;
    let vals = Array(n * n).fill(null), cur = opens[0], dir = 'across', paid = 0, won = false, hintStep = 0, wrong = new Set(), lastFull = false;
    const entryAt = (i, d) => pz.entries.find(e => e.dir === d && e.cells.includes(i)) || null;
    if (!entryAt(cur, dir)) dir = 'down';
    q('#pz-btns').innerHTML = '<button type="button" class="btn sm ghost" id="cn-restart" aria-keyshortcuts="R">Clear the grid</button><button type="button" class="btn sm ghost" id="cn-hint" aria-keyshortcuts="H">Show a hint</button>';
    q('#pz-keys').innerHTML = 'Keys: type digits, arrows move, <kbd>Space</kbd> switches across and down, <kbd>Backspace</kbd> goes back, <kbd>H</kbd> gives a hint.';
    const Dir = d => (d === 'across' ? 'Across' : 'Down');
    function draw(focus) {
      const e = entryAt(cur, dir) || entryAt(cur, dir === 'across' ? 'down' : 'across');
      if (e) dir = e.dir;
      const k = pz.entries.indexOf(e);
      q('#pz-body').innerHTML = `<div class="cn-wrap"><div class="cn-grid" style="--n:${n}" role="group" aria-label="The grid, ${n} by ${n}">${Array.from({ length: n * n }, (_, i) => {
        if (!pz.open[i]) return '<span class="cn-block" aria-hidden="true"></span>';
        const inE = e && e.cells.includes(i), bad = pz.entries.some((x, j) => wrong.has(j) && x.cells.includes(i));
        const ac = entryAt(i, 'across'), dn = entryAt(i, 'down');
        return `<button type="button" class="cn-cell${inE ? ' on' : ''}${cur === i ? ' cur' : ''}${bad ? ' bad' : ''}" data-i="${i}" tabindex="${cur === i ? 0 : -1}" aria-label="${[ac && `${ac.num} Across`, dn && `${dn.num} Down`].filter(Boolean).join(', ')}: ${vals[i] == null ? 'empty' : vals[i]}"${won ? ' disabled' : ''}>${pz.numOf[i] ? `<span class="cn-num" aria-hidden="true">${pz.numOf[i]}</span>` : ''}<span class="cn-v" aria-hidden="true">${vals[i] == null ? '' : vals[i]}</span></button>`;
      }).join('')}</div>
        <p class="cn-active" aria-live="polite">${e ? `<b>${e.num} ${Dir(e.dir)}</b> <span>${esc(e.clue.text)}</span>` : ''}</p>
        <div class="cg-pad" role="group" aria-label="Digits">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d => `<button type="button" class="cg-key" data-put="${d}"${won ? ' disabled' : ''}>${d}</button>`).join('')}<button type="button" class="cg-key wide" data-put="x"${won ? ' disabled' : ''}>Clear</button></div></div>
        <div class="cn-clues">${['across', 'down'].map(d => `<div><h3>${Dir(d)}</h3><ol>${pz.entries.map((x, j) => x.dir !== d ? '' : `<li><button type="button" class="cn-clue${j === k ? ' on' : ''}${wrong.has(j) ? ' bad' : ''}" data-entry="${j}" aria-pressed="${j === k}"><b>${x.num}</b><span>${esc(x.clue.text)}</span></button></li>`).join('')}</ol></div>`).join('')}</div>`;
      q('#cn-hint').disabled = won;
      if (focus) { const c = q(`.cn-cell[data-i="${cur}"]`); if (c) c.focus(); }
      root.__cross = { n, entries: pz.entries.map(x => ({ num: x.num, dir: x.dir, cells: x.cells.slice(), value: x.value, clue: x.clue.text })), digits: pz.digits.slice(), vals: vals.slice(), cur, dir, won, paid, hintStep, step: st, season: sea };
    }
    function advance(back) {
      const e = entryAt(cur, dir); if (!e) return;
      const at = e.cells.indexOf(cur), to = e.cells[at + (back ? -1 : 1)];
      if (to !== undefined) cur = to;
    }
    function put(d) {
      if (won) return;
      if (d === 'x') { vals[cur] = null; } else { vals[cur] = d; advance(false); }
      hintStep = 0; wrong = new Set();
      const full = opens.every(i => vals[i] != null);
      if (full && opens.every(i => vals[i] === pz.digits[i])) return win();
      if (full && !lastFull) {
        paid++;
        pz.entries.forEach((e, j) => { if (e.cells.some(i => vals[i] !== pz.digits[i])) wrong.add(j); });
        status(`Not quite yet: ${wrong.size === 1 ? 'one answer doesn’t' : wrong.size + ' answers don’t'} match ${wrong.size === 1 ? 'its clue' : 'their clues'} (outlined).`);
      } else if (!full) status('');
      lastFull = full;
      draw(true);
    }
    function win() {
      won = true;
      const stars = starsFor(paid);
      solved('cross', date, stars);
      status(winHtml(stars));
      q('#pz-why').innerHTML = `<details class="lp-explain" open><summary>Every clue, worked out</summary><ul class="small cn-worked">${pz.entries.map(e => `<li><b>${e.num} ${Dir(e.dir)}:</b> ${esc(e.clue.text)} <span class="muted">→</span> <b>${e.value}</b></li>`).join('')}</ul></details>`;
      draw(); root.__cross.stars = stars;
      const a = q('#pz-again'); if (a) a.focus();
    }
    /** the clue that is quickest in your head: a times fact, then a small sum */
    const ease = e => (/^\d+ × \d+$/.test(e.clue.text) ? 0 : /^(Half|Double)/.test(e.clue.text) ? 1 : e.clue.story ? 3 : 2) * 1000 + e.value;
    function hintMe() {
      const left = pz.entries.map((e, j) => ({ e, j })).filter(x => x.e.cells.some(i => vals[i] !== pz.digits[i]));
      if (!left.length) return;
      if (hintStep === 0) {
        hintStep = 1;
        const easy = left.slice().sort((a, b) => ease(a.e) - ease(b.e))[0];
        cur = easy.e.cells.find(i => vals[i] !== pz.digits[i]); dir = easy.e.dir;
        status(`Try <b>${easy.e.num} ${Dir(easy.e.dir)}</b> next: ${esc(easy.e.clue.text)}. Its digits are also the first clues to the answers it crosses.`);
        draw(true); return;
      }
      paid++;
      const e = entryAt(cur, dir) && entryAt(cur, dir).cells.some(i => vals[i] !== pz.digits[i]) ? entryAt(cur, dir) : left[0].e;
      dir = e.dir;
      if (hintStep === 1) {
        hintStep = 2;
        const i = e.cells.find(c => vals[c] !== pz.digits[c]); vals[i] = pz.digits[i]; cur = i;
        status(`One digit of ${e.num} ${Dir(e.dir)} is filled in for you.`);
        draw(true); return;
      }
      hintStep = 3;
      e.cells.forEach(i => { vals[i] = pz.digits[i]; }); cur = e.cells[e.cells.length - 1];
      status(`${e.num} ${Dir(e.dir)} is <b>${e.value}</b>.`);
      if (opens.every(i => vals[i] === pz.digits[i])) return win();
      draw(true);
    }
    wrap.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b || b.disabled || !wrap.contains(b) || b.dataset.diff) return;
      if (b.dataset.i !== undefined) {
        const i = Number(b.dataset.i);
        if (i === cur && entryAt(i, dir === 'across' ? 'down' : 'across')) dir = dir === 'across' ? 'down' : 'across';
        cur = i; if (!entryAt(cur, dir)) dir = dir === 'across' ? 'down' : 'across';
        draw(true); return;
      }
      if (b.dataset.entry !== undefined) { const e = pz.entries[Number(b.dataset.entry)]; dir = e.dir; cur = e.cells.find(i => vals[i] == null) ?? e.cells[0]; draw(true); return; }
      if (b.dataset.put !== undefined) { put(b.dataset.put === 'x' ? 'x' : Number(b.dataset.put)); return; }
      if (b.id === 'cn-restart') { vals = Array(n * n).fill(null); wrong = new Set(); lastFull = false; status('The grid is clear.'); draw(); }
      else if (b.id === 'cn-hint') hintMe();
      else if (b.id === 'pz-again') { vals = Array(n * n).fill(null); wrong = new Set(); lastFull = false; won = false; paid = 0; q('#pz-why').innerHTML = ''; status(''); draw(true); }
    });
    onKeys(wrap, (ev, k) => {
      if (won) return;
      const mv = { arrowleft: [0, -1], arrowright: [0, 1], arrowup: [-1, 0], arrowdown: [1, 0] }[k];
      if (mv) {
        ev.preventDefault();
        let [r, c] = [Math.floor(cur / n), cur % n];
        for (let s = 0; s < n; s++) { r += mv[0]; c += mv[1]; if (r < 0 || c < 0 || r >= n || c >= n) break; if (pz.open[r * n + c]) { cur = r * n + c; break; } }
        dir = mv[0] ? 'down' : 'across'; if (!entryAt(cur, dir)) dir = dir === 'across' ? 'down' : 'across';
        draw(true); return;
      }
      if (/^[0-9]$/.test(k)) { ev.preventDefault(); put(Number(k)); return; }
      if (k === 'backspace') { ev.preventDefault(); if (vals[cur] == null) advance(true); vals[cur] = null; lastFull = false; draw(true); return; }
      if (k === 'delete') { ev.preventDefault(); put('x'); return; }
      if (k === ' ') { if (entryAt(cur, dir === 'across' ? 'down' : 'across')) { ev.preventDefault(); dir = dir === 'across' ? 'down' : 'across'; draw(true); } return; }
      if (k === 'h') { ev.preventDefault(); hintMe(); }
    });
    draw();
    status('Choose a clue, or a square in the grid, and fill in the digits.');
    H.tutorCtx({ notes: `The student is solving a cross-number puzzle (a crossword with numbers). Clues: ${pz.entries.map(e => `${e.num} ${e.dir}: ${e.clue.text}`).join('; ')}. Help them work out a clue step by step; don't give whole answers unless asked.` });
  }

  /* ---------- the daily three ---------- */
  function threePage(root, date) {
    date = okDate(date);
    const st = step('three'), items = makeThree(date, st), o = load(), had = o.three[date];
    const answered = items.map(() => null);
    const parse = v => { const t = String(v).trim().replace(/−/g, '-'); return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN; };
    root.innerHTML = `<div class="pz-page th-page">
      <div class="card pz-head"><div><h1>Daily three</h1><p class="muted small">${date === today() ? 'Three quick questions, new every day: a missing number, a pattern and a comparison. One try each.' : 'The three questions for ' + esc(longDate(date)) + '.'}</p></div>
        <nav class="lp-nav" aria-label="Puzzles"><a class="chip-btn" href="#/puzzles">All puzzles</a><a class="chip-btn" href="#/puzzles/archive">Past puzzles</a></nav></div>
      ${had != null ? `<p class="th-before small muted">You did these already: ${had} of 3 right. Try them again for practice; your first score is kept.</p>` : ''}
      <div class="th-grid">${items.map((it, k) => `<section class="card th-item" data-k="${k}" aria-labelledby="th-h${k}"><span class="th-n" aria-hidden="true">${k + 1}</span><h2 id="th-h${k}">${esc(it.title)}</h2>
        ${it.kind === 'compare' ? `<div class="th-choices" role="group" aria-label="${esc(it.title)}">${it.choices.map((c, j) => `<button type="button" class="btn th-choice" data-pick="${j}">${esc(c)}</button>`).join('')}</div>`
          : `<p class="th-q">${esc(it.q)}</p><form class="th-form" novalidate><input type="text" inputmode="numeric" autocomplete="off" aria-label="Your answer" class="th-in"><button type="submit" class="btn sm primary">Check</button></form>`}
        <div class="th-res small" aria-live="polite"></div></section>`).join('')}</div>
      <div class="card th-sum" id="th-sum" hidden></div></div>`;
    const wrap = root.querySelector('.th-page');
    function mark(k, right, shown) {
      if (answered[k] != null) return;
      answered[k] = right;
      S.countAnswer(right);
      const box = wrap.querySelector(`.th-item[data-k="${k}"]`), it = items[k];
      box.classList.add(right ? 'right' : 'wrong');
      box.querySelectorAll('button, input').forEach(x => { x.disabled = true; });
      box.querySelector('.th-res').innerHTML = `<b>${right ? 'Correct.' : `Not quite. The answer is ${esc(shown)}.`}</b> ${esc(it.why)}`;
      if (answered.every(x => x != null)) {
        const n = answered.filter(Boolean).length;
        if (had == null) { const o2 = load(); o2.three[date] = n; save(o2); if (window.BADGES) BADGES.check(); if (window.APP) APP.refreshStats(); }
        const sum = wrap.querySelector('#th-sum'); sum.hidden = false;
        sum.innerHTML = `<h2>${n === 3 ? 'All three right. Well done.' : `${n} of 3 right.`}</h2><p class="small muted">${n === 3 ? 'Come back tomorrow for three new ones.' : 'Read the explanations above, then try a puzzle.'}</p><div class="btn-row"><a class="btn primary sm" href="#/puzzles">More puzzles</a><a class="btn sm" href="#/puzzles/archive">Past days</a></div>`;
        root.__three.score = n;
      }
      root.__three.answered = answered.slice();
    }
    wrap.querySelectorAll('.th-form').forEach(f => f.addEventListener('submit', ev => {
      ev.preventDefault();
      const k = Number(f.closest('.th-item').dataset.k), v = parse(f.querySelector('input').value);
      if (isNaN(v)) { f.closest('.th-item').querySelector('.th-res').textContent = 'Type a number, then Check.'; return; }
      mark(k, Math.abs(v - items[k].a) < 1e-9, items[k].a < 0 ? '−' + -items[k].a : String(items[k].a));
    }));
    wrap.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => { const k = Number(b.closest('.th-item').dataset.k); mark(k, Number(b.dataset.pick) === items[k].a, items[k].choices[items[k].a]); }));
    root.__three = { items: items.map(it => ({ kind: it.kind, a: it.a, choices: it.choices || null })), answered: answered.slice(), score: null };
    H.tutorCtx({ notes: 'The student is doing the Daily three: a missing number, a number pattern and a comparison. Help them reason; don’t just give answers.' });
  }

  /* ---------- Factor grab: a game for two on one device ---------- */
  function duelPage(root) {
    const o = load(), p = S.get().profile, g = p.adult ? 9 : p.grade == null ? 7 : p.grade;
    let names = Array.isArray(o.duelNames) && o.duelNames.length === 2 ? o.duelNames.map(x => String(x).slice(0, 16)) : ['Player 1', 'Player 2'];
    let N = [20, 30, 40].includes(o.duelN) ? o.duelN : g <= 4 ? 20 : g <= 8 ? 30 : 40;
    const factors = (x, avail) => { const out = []; for (let d = 1; d < x; d++) if (x % d === 0 && avail.has(d)) out.push(d); return out; };
    function setup() {
      root.innerHTML = `<div class="pz-page">
        <div class="card pz-head"><div><h1>Factor grab</h1><p class="muted small">A game for two players on one device. Take turns choosing numbers: you keep the number, and your opponent gets its factors.</p></div>
          <nav class="lp-nav" aria-label="Puzzles"><a class="chip-btn" href="#/puzzles">All puzzles</a></nav></div>
        <div class="pz-main"><section class="card"><h2>Who’s playing?</h2>
          <form id="fg-form" class="fg-form" novalidate>
            <label class="field"><span class="label">First player</span><input id="fg-a" type="text" maxlength="16" autocomplete="off" value="${esc(names[0])}"></label>
            <label class="field"><span class="label">Second player</span><input id="fg-b" type="text" maxlength="16" autocomplete="off" value="${esc(names[1])}"></label>
            <label class="field"><span class="label">Numbers on the board</span><select id="fg-n">${[20, 30, 40].map(k => `<option value="${k}"${k === N ? ' selected' : ''}>1 to ${k}</option>`).join('')}</select></label>
            <div class="btn-row"><button type="submit" class="btn primary">Start the game</button></div></form></section>
          <aside class="card pz-side"><h2>How to play</h2><ul class="nm-facts">
            <li>On your turn, choose a number that still has at least one of its factors on the board (a smaller number that divides into it).</li>
            <li>You score the number you chose. Your opponent scores every factor of it still on the board, and they all leave the board.</li>
            <li>When no number with a factor is left, the game ends. The highest total wins.</li>
            <li>Think ahead: a big prime number gives away only 1, but a number like 24 hands your opponent a lot.</li></ul></aside></div></div>`;
      root.querySelector('#fg-form').addEventListener('submit', ev => {
        ev.preventDefault();
        names = [root.querySelector('#fg-a').value.trim() || 'Player 1', root.querySelector('#fg-b').value.trim() || 'Player 2'].map(x => x.replace(/[<>]/g, '').slice(0, 16));
        if (names[0] === names[1]) names[1] += ' (2)';
        N = Number(root.querySelector('#fg-n').value) || 30;
        const o2 = load(); o2.duelNames = names; o2.duelN = N; save(o2);
        play();
      });
    }
    function play() {
      const avail = new Set(Array.from({ length: N }, (_, k) => k + 1)), owner = {}, score = [0, 0];
      let turn = 0, last = '', over = false;
      const legal = x => avail.has(x) && factors(x, avail).length > 0;
      root.innerHTML = `<div class="pz-page">
        <div class="card pz-head"><div><h1>Factor grab</h1><p class="muted small">${esc(names[0])} and ${esc(names[1])}, 1 to ${N}.</p></div>
          <nav class="lp-nav" aria-label="Game"><button type="button" class="chip-btn" id="fg-new">New players</button><a class="chip-btn" href="#/puzzles">All puzzles</a></nav></div>
        <div class="pz-main"><section class="card pz-board">
          <div class="fg-scores" id="fg-scores"></div>
          <p class="lp-status" id="fg-status" aria-live="polite"></p>
          <div class="fg-board" id="fg-board" role="group" aria-label="Numbers"></div>
          <div id="fg-end"></div></section>
          <aside class="card pz-side"><h2>Rules</h2><ul class="nm-facts">
            <li>Choose a number with at least one factor still on the board.</li>
            <li>You score it; your opponent scores its factors on the board.</li>
            <li>Filled squares are ${esc(names[0])}’s, outlined squares are ${esc(names[1])}’s.</li></ul></aside></div></div>`;
      const q = s => root.querySelector(s);
      function draw() {
        q('#fg-scores').innerHTML = names.map((nm, k) => `<div class="fg-score p${k}${!over && turn === k ? ' on' : ''}"><span>${esc(nm)}</span><b>${score[k]}</b></div>`).join('');
        q('#fg-board').innerHTML = Array.from({ length: N }, (_, k) => k + 1).map(x => {
          const who = owner[x], ok = !over && legal(x);
          return `<button type="button" class="fg-n${who != null ? ' p' + who : ''}" data-n="${x}"${ok ? '' : ' disabled'} aria-label="${x}${who != null ? `, ${esc(names[who])}’s` : ok ? '' : ', no factor left on the board'}">${x}</button>`;
        }).join('');
        q('#fg-status').innerHTML = over ? last : `${last ? last + ' ' : ''}<b>${esc(names[turn])}’s turn.</b>`;
        root.__duel = { N, names: names.slice(), score: score.slice(), turn, over, avail: [...avail] };
      }
      function take(x) {
        const gets = factors(x, avail), other = 1 - turn;
        score[turn] += x; owner[x] = turn; avail.delete(x);
        gets.forEach(d => { score[other] += d; owner[d] = other; avail.delete(d); });
        last = `${esc(names[turn])} took ${x}; ${esc(names[other])} gets ${gets.join(', ')} (${gets.reduce((a, b) => a + b, 0)}).`;
        turn = other;
        if (![...avail].some(legal)) finish();
        draw();
        const next = q('.fg-n:not([disabled])'); if (next) next.focus();
      }
      function finish() {
        over = true;
        const left = [...avail].sort((a, b) => a - b), w = score[0] === score[1] ? -1 : score[0] > score[1] ? 0 : 1;
        last += ` <b>${w < 0 ? `It’s a tie, ${score[0]} each.` : `${esc(names[w])} wins, ${score[w]} to ${score[1 - w]}.`}</b>`;
        const o2 = load(); o2.duel = { games: ((o2.duel || {}).games || 0) + 1 }; save(o2);
        if (window.BADGES) BADGES.check();
        q('#fg-end').innerHTML = `<details class="lp-explain" open><summary>About this game</summary><ul class="small">
          ${left.length ? `<li>${left.join(', ')} stayed on the board: none of ${left.length === 1 ? 'it has' : 'them have'} a factor left, so nobody scores ${left.length === 1 ? 'it' : 'them'}.</li>` : ''}
          <li>Prime numbers have only 1 and themselves as factors, so taking one gives your opponent just 1, if 1 is still there.</li>
          <li>Numbers with many factors, like 12, 24 or 36, give a lot away. Taking them late, after their factors are gone, is safer.</li></ul></details>
          <div class="btn-row"><button type="button" class="btn primary" id="fg-again">Play again</button><button type="button" class="btn" id="fg-new2">New players</button></div>`;
      }
      root.querySelector('.pz-page').addEventListener('click', ev => {
        const b = ev.target.closest('button'); if (!b || b.disabled) return;
        if (b.dataset.n) take(Number(b.dataset.n));
        else if (b.id === 'fg-again') play();
        else if (b.id === 'fg-new' || b.id === 'fg-new2') setup();
      });
      draw();
    }
    setup();
    H.tutorCtx({ notes: 'The students are playing Factor grab, a two-player factors game: choose a number with a factor still on the board; you score it and your opponent scores its remaining factors. Help with factors and strategy.' });
  }

  /* ---------- the hub and the archive ---------- */
  function hub(root) {
    const t = today(), done = doneOn(t), mine = forGrade(), all = mine.concat(Object.keys(KINDS).filter(k => !mine.includes(k))), sea = season(t);
    const n = all.filter(k => done[k]).length;
    const card = (k, i) => { const K = KINDS[k]; return `<div class="card pz-card${done[k] ? ' done' : ''}"><span class="tool-ic">${icon(done[k] ? 'check' : K.icon, 22)}</span>
      <div class="pz-card-text"><h3><a class="pz-go" href="${K.href(t)}">${K.name}</a>${i === 0 && mine.includes(k) ? ' <span class="chip">Suggested for you</span>' : ''}</h3><p class="small muted">${K.line}</p>
      <span class="small${done[k] ? '' : ' muted'}">${done[k] ? `Solved today · ${done[k]} of 3 stars` : 'Not solved yet'}</span></div></div>`; };
    const more = [
      ['#/puzzles/three', 'Daily three', done.three != null ? `Done today: ${done.three} of 3 right.` : 'Three quick questions: a missing number, a pattern and a comparison.', 'sparkle'],
      ['#/puzzles/duel', 'Factor grab', 'A game for two on one device: take a number, and your opponent gets its factors.', 'person'],
      ['#/leap/negatives', 'Leap number lines', 'Leap with negatives, fractions and decimals, each with its own levels.', 'flag'],
      ['#/sprint/times/race', 'Race the computer', 'A race to 20 math facts against a computer runner, at the speed you choose.', 'timer'],
      ['#/map', 'Treasure map', 'A map of your course that fills in as you master skills.', 'globe'],
      ['#/trophies', 'Trophy room', 'Your badges, stickers, streak calendar and certificates in one place.', 'trophy'],
    ];
    root.innerHTML = `<div class="pz-hub">
      <div class="card pz-hero"><div class="pz-hero-text"><h1>Puzzles</h1><p class="muted">A new puzzle of every kind each day, at your level. This ${SEASONS[sea].name}, the cross-number has a few ${SEASONS[sea].name} clues.</p>
        ${diffChips()}<div class="btn-row"><a class="btn sm" href="#/puzzles/archive">${icon('calendar', 18)} Past puzzles</a><a class="btn sm" href="#/trophies">${icon('trophy', 18)} Trophy room</a></div></div>
        <div class="pz-art">${seasonArt(sea, 128)}</div></div>
      <div class="section-title"><h2>Today’s puzzles</h2><span class="small muted">${n} of ${all.length} solved</span></div>
      <div class="grid fit pz-today">${all.map(card).join('')}</div>
      <div class="section-title"><h2>More to play</h2></div>
      <div class="grid fit pz-more">${more.map(([h, nm, line, ic]) => `<div class="card pz-card"><span class="tool-ic">${icon(ic, 22)}</span><div class="pz-card-text"><h3><a class="pz-go" href="${h}">${nm}</a></h3><p class="small muted">${line}</p></div></div>`).join('')}</div></div>`;
    wireDiff(root, () => hub(root));
    H.tutorCtx(null);
  }
  function archive(root) {
    let span = 14;
    const draw = () => {
      const days = Array.from({ length: span }, (_, k) => S.dayShift(today(), -k));
      root.innerHTML = `<div class="pz-page">
        <div class="card pz-head"><div><h1>Past puzzles</h1><p class="muted small">Every daily puzzle from the last ${span} days. Solve any you missed: your stars are kept with the day.</p></div>
          <nav class="lp-nav" aria-label="Puzzles"><a class="chip-btn" href="#/puzzles">All puzzles</a></nav></div>
        <div class="pz-arch">${days.map(d => { const done = doneOn(d), kinds = Object.keys(KINDS); return `<section class="card pz-day${d === today() ? ' today' : ''}" aria-label="${esc(longDate(d))}"><h2>${esc(shortDate(d))}${d === today() ? ' <span class="chip">Today</span>' : ''}</h2>
          <ul class="pz-day-list">${kinds.map(k => `<li><a href="${KINDS[k].href(d)}">${KINDS[k].name}</a>${done[k] ? `<span class="pz-got" aria-label="solved, ${done[k]} of 3 stars">${icon('check', 14)} ${done[k]}</span>` : ''}</li>`).join('')}
            <li><a href="#/puzzles/three${d === today() ? '' : '/' + d}">Daily three</a>${done.three != null ? `<span class="pz-got" aria-label="done, ${done.three} of 3 right">${icon('check', 14)} ${done.three}/3</span>` : ''}</li></ul>
          <p class="tiny muted pz-day-n">${Object.keys(done).length ? `${Object.keys(done).length} done` : 'None done yet'}</p></section>`; }).join('')}</div>
        ${span < 56 ? '<div class="btn-row" style="justify-content:center"><button type="button" class="btn" id="arch-more">Show two more weeks</button></div>' : ''}</div>`;
      const m = root.querySelector('#arch-more');
      if (m) m.addEventListener('click', () => { span = Math.min(56, span + 14); draw(); const c = root.querySelectorAll('.pz-day')[span - 14]; if (c) { const a = c.querySelector('a'); if (a) a.focus(); } });
    };
    draw();
    H.tutorCtx(null);
  }

  const PUZZLES = { KEY, load, diff, setDiff, diffChips, wireDiff, solved, doneOn, solvedDays, solvedToday, step, season, SEASONS, KINDS, forGrade, todayPick, dayNum,
    makeTarget, reach, wayFrom, makeCages, cageSolve, cageOk, cageCombos, cageClue, cageWords, makeCross, checkCross, clueFor, makeThree, TARGET_STEPS, CAGE_STEPS, CROSS_STEPS, Q, qs, OPS,
    hub, archive, targetPage, cagesPage, crossPage, threePage, duelPage, seasonArt };
  window.PUZZLES = PUZZLES;
})();
