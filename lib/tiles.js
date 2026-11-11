/* Algebra tiles (#/tiles): CPM's equation mat and expression comparison mat (Core Connections chapter 6,
   and Course 3 chapter 2), worked with "legal moves":
     · take the same tile away from both sides (tap it on one side, then on the other)
     · remove a zero pair: a tile and its opposite on the same side (tap one, then the other)
     · add the same tile to both sides
     · flip every tile (multiply both sides by −1), on the equation mat
     · split both sides into equal groups, when x is alone
   Every move is written down as algebra next to the tiles, and each line is checked by the step checker,
   so the tiles and the symbols are always seen together. On CPM's paper mats a tile in the negative region
   counts as its opposite; here a negative tile is drawn dashed and labelled −x or −1.
   #/tiles is the equation mat, #/tiles/compare the comparison mat, #/tiles/eq/<code> opens an equation. */
'use strict';
(function () {
  const S = window.STORE, V = window.VIEWS, H = V._h, esc = H.esc, St = window.STEPS, D = window.DRAW;
  const OPP = { xp: 'xn', xn: 'xp', up: 'un', un: 'up' };
  const NAME = { xp: 'x', xn: '−x', up: '1', un: '−1' };
  const SIDE = ['left', 'right'];
  const MAX = 30;                                                   // tiles of one kind on one side, while working
  const fromLinear = (a, b) => ({ xp: Math.max(a, 0), xn: Math.max(-a, 0), up: Math.max(b, 0), un: Math.max(-b, 0) });
  const coef = s => s.xp - s.xn, cons = s => s.up - s.un;
  const clone = m => m.map(s => Object.assign({}, s));
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const frac = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; n /= g; d /= g; return d === 1 ? String(n) : `${n}/${d}`; };
  const neg = s => String(s).replace(/-/g, '−');
  const art = n => (n === 'x' ? 'an ' : 'a ') + n;               // an x, a −x, a 1, a −1

  /** a side written from its tiles: 2x − x + 3 − 1 (ascii for the step checker) */
  function expr(s, ascii) {
    const m = ascii ? '-' : '−', parts = [], xt = k => (k === 1 ? 'x' : k + 'x');
    if (s.xp) parts.push(['+', xt(s.xp)]);
    if (s.xn) parts.push(['-', xt(s.xn)]);
    if (s.up) parts.push(['+', String(s.up)]);
    if (s.un) parts.push(['-', String(s.un)]);
    if (!parts.length) return '0';
    return parts.map(([sg, t], i) => (i === 0 ? (sg === '-' ? m + t : t) : ` ${sg === '-' ? m : '+'} ${t}`)).join('');
  }
  const line = (m, ascii, mid) => `${expr(m[0], ascii)} ${mid || '='} ${expr(m[1], ascii)}`;

  /** x alone with k tiles on one side, only numbers on the other: { xs, k, n } */
  function ready(m) {
    for (let s = 0; s < 2; s++) {
      const a = m[s], b = m[1 - s];
      if (a.xp > 0 && !a.xn && !a.up && !a.un && !b.xp && !b.xn && !(b.up && b.un)) return { xs: s, k: a.xp, n: cons(b) };
    }
    return null;
  }
  const noX = m => !m[0].xp && !m[0].xn && !m[1].xp && !m[1].xn;

  /** one legal move → { mat, says } or { error } */
  function apply(m, mv) {
    const n = clone(m);
    if (mv.t === 'both') {
      if (!(m[0][mv.k] > 0 && m[1][mv.k] > 0)) return { error: `Both sides need ${art(NAME[mv.k])} tile to take one away from both.` };
      n[0][mv.k]--; n[1][mv.k]--;
      return { mat: n, says: `Took ${NAME[mv.k]} away from both sides` };
    }
    if (mv.t === 'zero') {
      const k = mv.k.endsWith('p') ? mv.k : OPP[mv.k];
      if (!(m[mv.s][k] > 0 && m[mv.s][OPP[k]] > 0)) return { error: 'A zero pair is a tile and its opposite on the same side.' };
      n[mv.s][k]--; n[mv.s][OPP[k]]--;
      return { mat: n, says: `Removed a zero pair (${NAME[k]} and ${NAME[OPP[k]]}) from the ${SIDE[mv.s]} side` };
    }
    if (mv.t === 'add') {
      if (m[0][mv.k] >= MAX || m[1][mv.k] >= MAX) return { error: 'The mat can’t hold more of those tiles. Remove some first.' };
      n[0][mv.k]++; n[1][mv.k]++;
      return { mat: n, says: `Added ${NAME[mv.k]} to both sides` };
    }
    if (mv.t === 'flip') {
      n.forEach(s => { [s.xp, s.xn] = [s.xn, s.xp]; [s.up, s.un] = [s.un, s.up]; });
      return { mat: n, says: 'Flipped every tile: multiplied both sides by −1' };
    }
    if (mv.t === 'split') {
      const r = ready(m);
      if (!r || r.k < 2 || r.n % r.k) return { error: 'Split only when x is alone on one side and the numbers divide evenly.' };
      n[r.xs] = fromLinear(1, 0); n[1 - r.xs] = fromLinear(0, r.n / r.k);
      return { mat: n, says: `Split both sides into ${r.k} equal groups and kept one group of each` };
    }
    return { error: 'That isn’t a legal move.' };
  }

  /** what to try next (the hint) */
  function hint(m, mode) {
    for (let s = 0; s < 2; s++) for (const k of ['xp', 'up']) if (m[s][k] && m[s][OPP[k]]) return `On the ${SIDE[s]} side, ${art(NAME[k])} and ${art(NAME[OPP[k]])} make a zero pair. Tap one, then the other, to remove them.`;
    for (const k of ['xp', 'xn', 'up', 'un']) if (m[0][k] && m[1][k]) return `Both sides have ${art(NAME[k])} tile. Tap one on each side to take it away from both sides.`;
    if (mode === 'compare') {
      const d = coef(m[0]) - coef(m[1]);
      return d === 0 ? 'The x tiles are gone (or match), so compare the numbers that remain.' : 'One side has x tiles that the other doesn’t. Which side is greater depends on the value of x. Is there a value of x that makes them equal?';
    }
    if (noX(m)) return cons(m[0]) === cons(m[1]) ? 'No x tiles remain and the sides match: every number is a solution.' : 'No x tiles remain and the sides don’t match: no number is a solution.';
    const xs = [0, 1].filter(s => m[s].xp || m[s].xn);
    if (xs.length === 2) { const s = m[0].xn ? 0 : 1; return `There are x tiles on both sides, with opposite signs. Add x to both sides: then the −x on the ${SIDE[s]} side has a zero pair.`; }
    const s = xs[0], o = 1 - s;
    for (const k of ['up', 'un']) if (m[s][k]) return `To get x alone, the ${NAME[k]} tiles next to it must go. Add ${NAME[OPP[k]]} to both sides: each one makes a zero pair with ${art(NAME[k])} on the ${SIDE[s]} side.`;
    if (m[s].xn) return 'x is alone, but the tiles are −x. Flip every tile (multiply both sides by −1) to make them x.';
    if (m[o].up && m[o].un) return `Simplify the ${SIDE[o]} side by removing its zero pairs.`;
    const r = ready(m);
    if (r && r.k > 1) return `There are ${r.k} x tiles. Split both sides into ${r.k} equal groups: one x matches one group.`;
    return 'x is alone. Read the value it equals.';
  }

  /** the end of the equation: { kind: 'solved', value } | { kind: 'all' | 'none' } | null */
  function outcome(m) {
    const r = ready(m);
    if (r && r.k === 1) return { kind: 'solved', value: r.n };
    if (r && r.n % r.k) return { kind: 'solved', value: r.n / r.k, frac: frac(r.n, r.k), uneven: true };
    if (noX(m)) return cons(m[0]) === cons(m[1]) ? { kind: 'all' } : { kind: 'none' };
    return null;
  }
  /** a comparison: which is greater, from the tiles */
  function compareTruth(m) {
    const a = coef(m[0]) - coef(m[1]), b = cons(m[0]) - cons(m[1]);
    if (a === 0) return { ans: b > 0 ? 'left' : b < 0 ? 'right' : 'equal' };
    return { ans: 'depends', at: -b / a, leftBigger: a > 0 ? 'greater' : 'less' };        // left − right = a x + b
  }

  /** an equation or comparison to start from */
  function make(mode, kind, rand) {
    const r = RNG.make('tiles:' + (rand || Math.random()));
    for (let tries = 0; tries < 200; tries++) {
      let a, b, c, d;
      if (mode === 'compare') {
        a = r.int(0, 4); c = kind === 'depends' || (kind === 'mixed' && r.bool()) ? r.pick([0, 1, 2, 3, 4].filter(v => v !== a)) : a;
        b = r.int(-5, 7); d = r.int(-5, 7);
        if (a !== c) { const x = r.int(-3, 5); d = (a - c) * x + b; }
        if (!a && !c) continue;
      } else {
        const k = kind === 'mixed' ? r.pick(['one', 'two', 'both', 'neg']) : kind;
        const x = k === 'neg' ? r.nz(-5, 5) : r.int(1, 6);
        if (k === 'one') { a = 1; b = r.int(1, 8); c = 0; }
        else if (k === 'two') { a = r.int(2, 4); b = r.int(0, 6); c = 0; }
        else if (k === 'both') { c = r.int(1, 3); a = c + r.int(1, 3); b = r.int(0, 6); if (r.bool()) [a, c] = [c, a]; }
        else { a = r.nz(-3, 4); c = r.nz(-3, 3); if (a === c) continue; b = r.int(-6, 6); }
        d = (a - c) * x + b;
        if (k !== 'neg' && d < 0) continue;
        if (Math.abs(b) + Math.abs(d) > 16 || Math.abs(a) + Math.abs(c) > 8) continue;      // the working never crowds the mat
      }
      const L = fromLinear(a, b), R = fromLinear(c, d);
      if ([L, R].some(s => Object.values(s).some(v => v > 12))) continue;
      if (mode === 'compare' && r.bool()) { const s = r.pick([L, R]); s.up++; s.un++; }                 // something to tidy first
      if (mode !== 'compare' && kind === 'neg' && r.bool()) { const s = r.pick([L, R]); if (r.bool()) { s.up++; s.un++; } else if (s.xp || s.xn) { s.xp++; s.xn++; } }
      return [L, R];
    }
    return [fromLinear(2, 3), fromLinear(1, 7)];
  }
  /** typed: "2x + 3 = x - 4" → tiles, or { error } */
  function build(text, mode) {
    const raw = String(text || '').trim();
    if (!raw) return { error: 'Enter an equation first, such as 2x + 3 = x + 7.' };
    let sides;
    if (mode === 'compare') sides = raw.split(/\s*(?:,|\?|\bvs\.?|\band\b|=|<=|>=|<|>)\s*/i).filter(Boolean);
    else { const p = St.parse(raw); if (p.error) return { error: p.error }; if (p.kind !== 'eq') return { error: 'The equation mat needs an equation, with one = sign.' }; sides = [p.L, p.R]; }
    if (sides.length !== 2) return { error: mode === 'compare' ? 'Enter two expressions, such as 2x + 3 and x + 7.' : 'Enter one equation.' };
    const out = [];
    for (const t of sides) {
      const p = St.parse(t);
      if (p.error || p.kind !== 'expr') return { error: 'Procademy can’t read “' + t + '”.' };
      if (p.vars.some(v => v !== p.vars[0]) || p.vars.length > 1) return { error: 'Use only one variable, x.' };
      const f = p.f, c0 = f(0), a = f(1) - c0;
      if (![2, -3, 5].every(x => Math.abs(f(x) - (a * x + c0)) < 1e-9)) return { error: 'These algebra tiles show only x and numbers: no x², x × x or division by x.' };
      if (!Number.isInteger(Math.round(a * 1e9) / 1e9) || !Number.isInteger(Math.round(c0 * 1e9) / 1e9)) return { error: 'Each tile is a whole unit. Use whole numbers only.' };
      const s = fromLinear(Math.round(a), Math.round(c0));
      if (Object.values(s).some(v => v > 12)) return { error: 'That would need too many tiles. Keep each number at 12 or less.' };
      out.push(s);
    }
    if (mode !== 'compare' && noX(out)) return { error: 'There is no x to solve for.' };
    return { mat: out };
  }

  const tile = (s, k, i, sel) => `<button type="button" class="tl-tile ${k[0] === 'x' ? 'x' : 'u'}${k[1] === 'n' ? ' neg' : ''}${sel && sel.s === s && sel.k === k && sel.i === i ? ' sel' : ''}" data-s="${s}" data-k="${k}" data-i="${i}" aria-label="${NAME[k]} tile, ${SIDE[s]} side" aria-pressed="${!!(sel && sel.s === s && sel.k === k && sel.i === i)}">${NAME[k]}</button>`;
  const sideHtml = (m, s, sel) => { const t = k => Array.from({ length: m[s][k] }, (_, i) => tile(s, k, i, sel)).join(''); return `<div class="tl-row">${t('xp')}${t('xn')}</div><div class="tl-row">${t('up')}${t('un')}</div>`; };

  /* ---------- factoring: x², x and 1 tiles arranged into a rectangle; its length and width are the factors ---------- */
  const sgnTerm = (k, v, first) => (k === 0 ? '' : `${k < 0 ? (first ? '−' : ' − ') : first ? '' : ' + '}${Math.abs(k) === 1 && v ? '' : Math.abs(k)}${v}`);
  /** ax² + bx + c written out: x² + 5x + 6, 2x² − x − 3 */
  const quadText = (a, b, c) => (sgnTerm(a, 'x²', true) + sgnTerm(b, 'x', !a) + sgnTerm(c, '', !a && !b)) || '0';
  /** px + q written out, for a side of the rectangle */
  const sideText = (p, q) => (sgnTerm(p, 'x', true) + sgnTerm(q, '', !p)) || '0';
  /** typed "x^2 + 5x + 6" → { a, b, c } with whole numbers, or { error } */
  function quad(text) {
    const raw = String(text || '').replace(/\s*=\s*0\s*$/, '').trim();
    if (!raw) return { error: 'Enter an expression to factor, such as x² + 5x + 6.' };
    const p = St.parse(raw);
    if (p.error) return { error: p.error };
    if (p.kind !== 'expr') return { error: 'Enter an expression, such as x² + 5x + 6, with no = or < sign.' };
    if (p.vars.length > 1 || (p.vars[0] && p.vars[0] !== 'x')) return { error: 'Use the letter x, and only x.' };
    const f = x => p.f(x, 0), c = f(0), a = (f(1) + f(-1)) / 2 - c, b = (f(1) - f(-1)) / 2;
    if (![2, -3, 5, 0.5].every(x => Math.abs(f(x) - (a * x * x + b * x + c)) < 1e-9 * (1 + Math.abs(f(x))))) return { error: 'Factoring tiles show x², x and 1 tiles only: no x³, and no dividing by x.' };
    const w = v => Math.abs(v - Math.round(v)) < 1e-9;
    if (![a, b, c].every(w)) return { error: 'Each tile is a whole tile. Use whole numbers only.' };
    const A = Math.round(a), B = Math.round(b), C = Math.round(c);
    if (A === 0) return { error: 'There is no x² tile, so there is no rectangle to build. Try one with x², such as x² + 5x + 6.' };
    if (A < 0) return { error: 'Start with a positive x² term. (To factor −x² + …, factor out −1 first.)' };
    if (A > 4 || Math.abs(B) > 20 || Math.abs(C) > 36) return { error: 'That would need too many tiles. Keep x² to 4 or fewer, x to 20 or fewer, and the number to 36 or less.' };
    return { a: A, b: B, c: C };
  }
  /** every way (px + q)(rx + s) makes ax² + bx + c with whole numbers, p ≤ r */
  function factorings(a, b, c) {
    const out = [], lim = Math.max(Math.abs(c), Math.abs(b), 1);
    for (let p = 1; p <= a; p++) {
      if (a % p) continue;
      const r = a / p;
      if (p > r) continue;
      for (let q = -lim; q <= lim; q++) {
        let ss = [];
        if (c === 0) ss = q === 0 ? (b % p === 0 ? [b / p] : []) : [0];
        else if (q !== 0 && c % q === 0) ss = [c / q];
        ss.forEach(s2 => { if (p * s2 + r * q === b && !out.some(o => o.p === p && o.q === q && o.r === r && o.s === s2) && !(p === r && out.some(o => o.q === s2 && o.s === q))) out.push({ p, q, r, s: s2 }); });
      }
    }
    return out;
  }
  /** the tiles a rectangle (px + q) by (rx + s) holds */
  const holds = (p, q, r, s) => ({ a: p * r, b: p * s + q * r, c: q * s });
  /** the rectangle drawn with tiles: x² squares in the corner, x tiles along the sides, 1 tiles in the far corner */
  function rectSvg(p, q, r, s) {
    const X = 66, U = 24, G = 2, L = 44, T = 30;
    const cols = [].concat(Array(r).fill(X), Array(Math.abs(s)).fill(U)), rows = [].concat(Array(p).fill(X), Array(Math.abs(q)).fill(U));
    const Wd = cols.reduce((t, w) => t + w + G, 0), Ht = rows.reduce((t, h) => t + h + G, 0);
    let body = '', y = T;
    rows.forEach((h, j) => {
      let x = L;
      cols.forEach((w, i) => {
        const big = j < p, wide = i < r, kind = big && wide ? 'x2' : big || wide ? 'x' : 'u';
        const neg = (big ? 1 : Math.sign(q)) * (wide ? 1 : Math.sign(s)) < 0;
        const lab = kind === 'x2' ? 'x²' : kind === 'x' ? 'x' : '1';
        body += `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" rx="3" class="tf-t ${kind}${neg ? ' neg' : ''}"/>`;
        if (Math.min(w, h) >= 16) body += `<text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle" class="tf-l">${neg ? '−' : ''}${lab}</text>`;
        x += w + G;
      });
      y += h + G;
    });
    // the length and the width
    let x = L;
    cols.forEach((w, i) => { body += `<text x="${x + w / 2}" y="${T - 10}" text-anchor="middle" class="tf-d">${i < r ? 'x' : s < 0 ? '−1' : '1'}</text>`; x += w + G; });
    y = T;
    rows.forEach((h, j) => { body += `<text x="${L - 8}" y="${y + h / 2 + 4}" text-anchor="end" class="tf-d">${j < p ? 'x' : q < 0 ? '−1' : '1'}</text>`; y += h + G; });
    return `<svg class="tf-svg" viewBox="0 0 ${L + Wd + 6} ${T + Ht + 6}" style="max-width:${Math.min(620, L + Wd + 6)}px" role="img" aria-label="${esc(`A rectangle of tiles ${sideText(p, q)} tall and ${sideText(r, s)} long`)}">${body}</svg>`;
  }
  /** the tiles of ax² + bx + c in a pile, before they are arranged */
  function pileHtml(a, b, c) {
    const t = (n, cls, lab) => Array.from({ length: Math.abs(n) }, () => `<span class="tf-p ${cls}${n < 0 ? ' neg' : ''}" aria-hidden="true">${n < 0 ? '−' : ''}${lab}</span>`).join('');
    return `<div class="tf-pile" role="img" aria-label="${esc(`${a} x² tile${a === 1 ? '' : 's'}, ${Math.abs(b)} ${b < 0 ? 'negative ' : ''}x tile${Math.abs(b) === 1 ? '' : 's'} and ${Math.abs(c)} ${c < 0 ? 'negative ' : ''}1 tile${Math.abs(c) === 1 ? '' : 's'}`)}">${t(a, 'x2', 'x²')}${t(b, 'x', 'x')}${t(c, 'u', '1')}</div>`;
  }
  const FACTOR_EX = ['x² + 5x + 6', 'x² + 7x + 12', 'x² + 2x − 8', 'x² − 9', 'x² − 6x + 9', '2x² + 7x + 3'];
  function factorPage(root, code, head) {
    const mem = V.tools && V.tools.pref ? V.tools.pref('tiles') : {};
    let text = (code && D.decode(code)) || (typeof mem.factor === 'string' && mem.factor) || FACTOR_EX[0], Q = null, dims = null;
    root.innerHTML = `<div class="tiles-page">
      <div class="card">${head}
        <p class="muted small" style="margin:6px 0 10px">Arrange the x², x and 1 tiles into a rectangle. The rectangle’s length and width are the factors: (length)(width) is the expression.</p>
        ${V.tools && V.tools.how ? V.tools.how('tiles') : ''}
        <form class="tl-own" id="tf-form"><input id="tf-in" autocomplete="off" spellcheck="false" autocapitalize="off" aria-label="An expression to factor" value="${esc(text)}"><button class="btn sm" type="submit">Use it</button></form>
        <div class="tf-ex" role="group" aria-label="Examples">${FACTOR_EX.map(e => `<button type="button" class="chip-btn" data-ex="${esc(e)}">${esc(e)}</button>`).join('')}</div>
        <div id="tf-board"></div>
      </div>
    </div>`;
    const wrap = root.querySelector('.tiles-page'), board = root.querySelector('#tf-board');
    function start(t) {
      text = t; const r = quad(t);
      if (r.error) { Q = null; board.innerHTML = `<p class="cx-err loud" style="margin:12px 0 0">${esc(r.error)}</p>`; root.__factor = { error: r.error }; return; }
      Q = r; dims = { p: 1, q: 1, r: r.a, s: 1 };
      if (V.tools && V.tools.pref) V.tools.pref('tiles', { factor: t });
      draw();
    }
    function draw() {
      const { a, b, c } = Q, all = factorings(a, b, c), h = holds(dims.p, dims.q, dims.r, dims.s);
      const right = h.a === a && h.b === b && h.c === c;
      const pairs = a === 1 && c !== 0 ? (() => { const out = []; for (let k = 1; k <= Math.abs(c); k++) if (c % k === 0) { const m = c / k; [[k, m], [-k, -m]].forEach(([u, v]) => { if (!out.some(o => (o[0] === u && o[1] === v) || (o[0] === v && o[1] === u))) out.push([u, v]); }); } return out; })() : [];
      const num = (id, v, lab) => `<label class="tf-num"><span class="visually-hidden">${lab}</span><input type="number" id="${id}" value="${v}" min="${id.endsWith('p') || id.endsWith('r') ? 1 : -36}" max="${id.endsWith('p') || id.endsWith('r') ? 4 : 36}" step="1" inputmode="numeric"></label>`;
      const sideIn = (pk, qk, lab) => `<span class="tf-side">(${a === 1 ? 'x' : `${num('tf-' + pk, dims[pk], lab + ': how many x')}x`} + ${num('tf-' + qk, dims[qk], lab + ': the number')})</span>`;
      let say;
      if (right) say = `<p class="feedback good">That works. ${esc(quadText(a, b, c))} = <b>(${esc(sideText(dims.p, dims.q))})(${esc(sideText(dims.r, dims.s))})</b></p>`;
      else if (h.a !== a) say = `<p class="small">This rectangle needs ${h.a} x² tile${h.a === 1 ? '' : 's'}, but there ${a === 1 ? 'is' : 'are'} ${a}. Make the x parts of the two sides multiply to ${a}.</p>`;
      else if (h.c !== c) say = `<p class="small">The corner holds ${neg(dims.q)} × ${neg(dims.s)} = ${neg(h.c)} in 1 tiles, but there ${Math.abs(c) === 1 ? 'is' : 'are'} ${neg(c)}. Choose two numbers that multiply to ${neg(c)}.</p>`;
      else say = `<p class="small">The 1 tiles fit, but the sides hold ${neg(h.b)} in x tiles and there ${Math.abs(b) === 1 ? 'is' : 'are'} ${neg(b)}. ${a === 1 ? `Find two numbers that multiply to ${neg(c)} and add to ${neg(b)}.` : 'Try another pair.'}</p>`;
      board.innerHTML = `<h2 class="tf-h">${esc(quadText(a, b, c))}</h2>
        <div class="tf-grid">
          <div><h3 class="small">The tiles</h3>${pileHtml(a, b, c)}</div>
          <div><h3 class="small">Build the rectangle</h3>
            <div class="tf-dims">${sideIn('p', 'q', 'The height')}<span aria-hidden="true">by</span>${sideIn('r', 's', 'The length')}</div>
            ${pairs.length ? `<div class="tf-pairs"><span class="tiny muted">Numbers that multiply to ${neg(c)}:</span>${pairs.map(([u, v]) => `<button type="button" class="chip-btn${right && ((dims.q === u && dims.s === v) || (dims.q === v && dims.s === u)) ? ' on' : ''}" data-pair="${u},${v}">${neg(u)} and ${neg(v)}</button>`).join('')}</div>` : ''}
            ${rectSvg(dims.p, dims.q, dims.r, dims.s)}
            <div aria-live="polite">${say}</div>
            ${right ? `<p class="small muted" style="margin:4px 0 0">Check: (${esc(sideText(dims.p, dims.q))})(${esc(sideText(dims.r, dims.s))}) = ${esc(quadText(dims.p * dims.r, 0, 0))}${dims.p * dims.s ? ` ${dims.p * dims.s < 0 ? '−' : '+'} ${Math.abs(dims.p * dims.s)}x` : ''}${dims.q * dims.r ? ` ${dims.q * dims.r < 0 ? '−' : '+'} ${Math.abs(dims.q * dims.r)}x` : ''}${dims.q * dims.s ? ` ${dims.q * dims.s < 0 ? '−' : '+'} ${Math.abs(dims.q * dims.s)}` : ''} = ${esc(quadText(a, b, c))}</p>` : ''}
            ${!right && all.length ? '<button type="button" class="btn sm ghost" id="tf-show">Show me</button>' : ''}
            ${!all.length ? `<p class="small">No rectangle can be made: ${esc(quadText(a, b, c))} can’t be factored with whole numbers.</p>` : ''}
          </div>
        </div>`;
      root.__factor = { a, b, c, dims: Object.assign({}, dims), right, ways: all.map(f => `(${sideText(f.p, f.q)})(${sideText(f.r, f.s)})`) };
      if (right && window.BADGES) BADGES.flag('tiles');
      H.tutorCtx({ notes: `The student is factoring ${quadText(a, b, c)} with algebra tiles, arranging them into a rectangle. They are trying (${sideText(dims.p, dims.q)})(${sideText(dims.r, dims.s)})${right ? ', which is right' : ', which isn’t right yet'}. Don’t give the factors before they have tried.` });
    }
    wrap.addEventListener('submit', ev => { ev.preventDefault(); start(root.querySelector('#tf-in').value); });
    wrap.addEventListener('click', ev => {
      const ex = ev.target.closest('[data-ex]'), pr = ev.target.closest('[data-pair]');
      if (ex) { root.querySelector('#tf-in').value = ex.dataset.ex; start(ex.dataset.ex); }
      else if (pr && Q) { const [u, v] = pr.dataset.pair.split(',').map(Number); dims = { p: 1, q: u, r: 1, s: v }; draw(); }
      else if (ev.target.id === 'tf-show' && Q) { const f = factorings(Q.a, Q.b, Q.c)[0]; if (f) { dims = { p: f.p, q: f.q, r: f.r, s: f.s }; draw(); } }
    });
    wrap.addEventListener('change', ev => {
      const m = /^tf-([pqrs])$/.exec(ev.target.id || ''); if (!m || !Q) return;
      const v = Math.round(Number(ev.target.value));
      if (!Number.isFinite(v)) return;
      dims[m[1]] = m[1] === 'p' || m[1] === 'r' ? Math.max(1, Math.min(4, v)) : Math.max(-36, Math.min(36, v));
      draw();
      const again = root.querySelector('#' + ev.target.id); if (again) again.focus();
    });
    start(text);
    if (code) history.replaceState(null, '', '#/tiles/factor');
  }
  function page(root, mode, code) {
    const tabs = m => `<div class="row between" style="flex-wrap:wrap;gap:8px"><h1 style="margin:0">Algebra tiles</h1>
          <div class="tabs" role="tablist" aria-label="Mat">${[['solve', '#/tiles', 'Equation mat'], ['compare', '#/tiles/compare', 'Comparison mat'], ['factor', '#/tiles/factor', 'Factoring']].map(([k, h, t]) => `<a role="tab" class="tab${m === k ? ' on' : ''}" aria-selected="${m === k}" href="${h}">${t}</a>`).join('')}</div></div>`;
    if (mode === 'factor') return factorPage(root, code, tabs('factor'));
    mode = mode === 'compare' ? 'compare' : 'solve';
    const KINDS = mode === 'compare' ? [['mixed', 'Mixed'], ['same', 'Same x tiles'], ['depends', 'It depends on x']] : [['mixed', 'Mixed'], ['one', 'One step'], ['two', 'Two steps'], ['both', 'x on both sides'], ['neg', 'With negatives']];
    let kind = 'mixed', start, mat, hist, sel, msg, done, hinted, answered;
    root.innerHTML = `<div class="tiles-page">
      <div class="card">
        ${tabs(mode)}
        <p class="muted small" style="margin:6px 0 10px">${mode === 'solve' ? 'Solve by making legal moves until x is alone. Tap a tile, then a matching tile on the other side to take both away, or its opposite on the same side to remove a zero pair.' : 'Which side is greater? Simplify both sides with legal moves first: take matching tiles from both sides and remove zero pairs.'}</p>
        <div class="tl-pick">
          <label class="small" for="tl-kind">Type</label><select id="tl-kind">${KINDS.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select>
          <button class="btn sm" id="tl-new" type="button">New ${mode === 'solve' ? 'equation' : 'comparison'}</button>
          <form id="tl-own" class="tl-own"><input id="tl-eq" autocomplete="off" spellcheck="false" autocapitalize="off" aria-label="${mode === 'solve' ? 'Your own equation' : 'Your own two expressions'}" placeholder="${mode === 'solve' ? 'Or enter your own: 2x + 3 = x - 4' : 'Or enter your own: 2x + 3 and x - 4'}"><button class="btn sm" type="submit">Build</button></form>
        </div>
        <div id="tl-board"></div>
      </div>
      <div class="card"><h2>Your moves, in algebra</h2><ol class="tl-log" id="tl-log"></ol>
        <p class="tiny muted" style="margin:6px 0 0">${mode === 'solve' ? 'Each line is checked by the step checker: ✓ means it has the same solution as the line before.' : 'Each legal move keeps the comparison the same: whichever side was greater still is.'}</p></div>
      <details class="card tl-rules"><summary><b>The legal moves</b></summary><ul class="small">
        <li><b>Take away matching tiles</b> from both sides (an x from each, or a 1 from each). Both sides stay balanced.</li>
        <li><b>Remove a zero pair</b> from one side: x and −x, or 1 and −1, add up to zero.</li>
        <li><b>Add the same tile</b> to both sides.</li>
        ${mode === 'solve' ? '<li><b>Flip every tile</b> on both sides (multiply both sides by −1): if −x = 3, then x = −3.</li><li><b>Split into equal groups</b> when x is alone: if 3x = 12, one x matches one of 3 equal groups, 4.</li>' : '<li>On a comparison mat, flipping is <b>not</b> legal: multiplying by −1 swaps which side is greater.</li>'}
        <li>On CPM’s paper mats a tile in the negative region counts as its opposite. Here a negative tile is dashed and labeled −x or −1.</li></ul></details>
    </div>`;
    const wrap = root.querySelector('.tiles-page'), board = root.querySelector('#tl-board'), log = root.querySelector('#tl-log');   // listeners go on wrap: root is shared by every page

    function begin(m) { start = clone(m); mat = clone(m); hist = [{ mat: clone(m), says: mode === 'solve' ? 'The equation' : 'The two expressions' }]; sel = null; msg = ''; done = mode === 'solve' ? outcome(mat) : null; hinted = false; answered = null; draw(); }
    function fresh() { begin(make(mode, kind)); }
    function move(mv) {
      const r = apply(mat, mv);
      sel = null;
      if (r.error) { msg = r.error; return draw(); }
      mat = r.mat; hist.push({ mat: clone(mat), says: r.says }); msg = '';
      if (mode === 'solve') { const o = outcome(mat); if (o) finish(o); }
      draw();
    }
    function finish(o) {
      done = o;
      const pts = hinted ? 5 : 10;
      S.countAnswer(!hinted); S.addPoints(pts);
      S.logEvent({ kind: 'tiles', title: 'Algebra tiles: ' + line(start, true), right: hinted ? 0 : 1, total: 1, pts, changes: [] });
      if (window.BADGES) BADGES.flag('tiles');
      if (window.APP) APP.refreshStats();
    }
    function tap(s, k, i) {
      if (done) return;
      if (!sel) { sel = { s, k, i }; msg = ''; return draw(); }
      if (sel.s === s && sel.k === k) { sel = sel.i === i ? null : { s, k, i }; return draw(); }
      if (sel.s !== s && sel.k === k) return move({ t: 'both', k });
      if (sel.s === s && OPP[sel.k] === k) return move({ t: 'zero', s, k });
      if (sel.s !== s && OPP[sel.k] === k) { const a1 = art(NAME[sel.k]); msg = `${a1[0].toUpperCase() + a1.slice(1)} on one side and ${art(NAME[k])} on the other aren’t a legal pair. Take matching tiles from both sides, or a tile and its opposite from the same side.`; sel = { s, k, i }; return draw(); }
      sel = { s, k, i }; draw();
    }
    function draw() {
      const ct = mode === 'compare' ? compareTruth(mat) : null;
      const r = ready(mat);
      const sym = mode === 'compare' ? (answered && answered.right ? ({ left: '>', right: '<', equal: '=', depends: '?' })[ct.ans] : '?') : '=';
      board.innerHTML = `
        <div class="tl-mat${done ? ' is-done' : ''}">
          <div class="tl-side" aria-label="Left side"><div class="tl-label">${mode === 'compare' ? 'Mat A' : 'Left side'}</div>${sideHtml(mat, 0, sel)}</div>
          <div class="tl-mid" aria-hidden="true">${sym}</div>
          <div class="tl-side" aria-label="Right side"><div class="tl-label">${mode === 'compare' ? 'Mat B' : 'Right side'}</div>${sideHtml(mat, 1, sel)}</div>
        </div>
        <div class="tl-line" id="tl-line">${esc(line(mat, false, mode === 'compare' ? '?' : '='))}</div>
        <div class="tl-msg" id="tl-msg" aria-live="polite">${msg ? `<div class="coach-note"><span>${esc(msg)}</span></div>` : ''}</div>
        ${done ? doneHtml() : `
        <div class="tl-moves">
          <span class="small muted">Add to both sides:</span>${['xp', 'xn', 'up', 'un'].map(k => `<button type="button" class="btn sm tl-add" data-add="${k}">+ ${NAME[k]}</button>`).join('')}
        </div>
        <div class="btn-row" style="margin-top:8px">
          ${mode === 'solve' && r && r.k > 1 && r.n % r.k === 0 ? `<button type="button" class="btn primary" id="tl-split">Split into ${r.k} equal groups</button>` : ''}
          ${mode === 'solve' ? '<button type="button" class="btn sm ghost" id="tl-flip">Flip every tile</button>' : ''}
          <button type="button" class="btn sm ghost" id="tl-undo" ${hist.length > 1 ? '' : 'disabled'}>Undo</button>
          <button type="button" class="btn sm ghost" id="tl-hint">Suggest a next move</button>
          <button type="button" class="btn sm ghost" id="tl-restart" ${hist.length > 1 ? '' : 'disabled'}>Start over</button>
        </div>
        ${mode === 'compare' ? compareHtml(ct) : ''}`}`;
      drawLog();
      root.__tiles = { mat: clone(mat), start: clone(start), done, sel, hist: hist.length, answered };
    }
    function doneHtml() {
      const o = done, x0 = o.value;
      const sub = s => { const a = coef(s), b = cons(s); return a * x0 + b; };
      const check = o.kind === 'solved' ? `${neg(line(start).replace(/(\d)x/g, '$1(' + (o.frac || x0) + ')').replace(/\bx\b/g, '(' + (o.frac || x0) + ')').replace(/−x/g, '−(' + (o.frac || x0) + ')'))} → ${neg(+sub(start[0]).toFixed(4))} = ${neg(+sub(start[1]).toFixed(4))} ✓` : '';
      return `<div class="feedback good"><span>${o.kind === 'solved' ? `<b>x = ${neg(o.frac || x0)}</b>${o.uneven ? ' (the numbers don’t divide evenly into tiles, so x is a fraction)' : ''}. Check it in the first equation: ${esc(check)}` : o.kind === 'all' ? 'The two sides are always equal: <b>every number</b> is a solution.' : 'The two sides can never balance: there is <b>no solution</b>.'}</span></div>
        <div class="btn-row"><button type="button" class="btn primary" id="tl-next">Next equation →</button><a class="btn" href="#/steps/${D.encode(line(start, true) + '\n')}">Solve it in the step checker</a></div>`;
    }
    function compareHtml(ct) {
      if (answered && answered.right && ct.ans === 'depends') {
        const atOk = answered.at != null && Math.abs(answered.at - ct.at) < 1e-9;
        return `<div class="feedback good"><span>Correct: it depends on x.</span></div>
          ${atOk ? `<div class="feedback good"><span>Correct. They are equal when <b>x = ${neg(frac(Math.round(ct.at * 1000), 1000))}</b>. For larger values of x, Mat A is ${ct.leftBigger}; for smaller values, it is ${ct.leftBigger === 'greater' ? 'less' : 'greater'}.</span></div><div class="btn-row"><button type="button" class="btn primary" id="tl-next">Next comparison →</button></div>`
            : `<div class="tl-at"><label for="tl-at-in">Which value of x makes them equal?</label> <span class="row" style="gap:6px"><span>x =</span><input id="tl-at-in" inputmode="decimal" autocomplete="off" style="width:6em"><button type="button" class="btn sm primary" id="tl-at-go">Check</button></span>${answered.at != null ? '<div class="coach-note"><span>Incorrect. Substitute that value of x into both expressions and check whether they are equal.</span></div>' : ''}</div>`}`;
      }
      if (answered && answered.right) return `<div class="feedback good"><span>${ct.ans === 'equal' ? 'Correct: they are equal for every value of x.' : `Correct: Mat ${ct.ans === 'left' ? 'A' : 'B'} is greater for every value of x.`}</span></div><div class="btn-row"><button type="button" class="btn primary" id="tl-next">Next comparison →</button></div>`;
      return `<div class="tl-answer"><b>Which is greater?</b><div class="btn-row" style="margin-top:6px">${[['left', 'Mat A'], ['right', 'Mat B'], ['equal', 'They are equal'], ['depends', 'It depends on x']].map(([v, t]) => `<button type="button" class="btn sm" data-ans="${v}">${t}</button>`).join('')}</div>
        ${answered ? `<div class="coach-note"><span>${answered.ans === 'depends' ? 'Look again: if both sides have the same x tiles, the value of x doesn’t change which side is greater.' : ct.ans === 'depends' ? 'Try a few values of x on both sides. Is the same side always greater?' : 'Incorrect. Remove matching tiles and zero pairs first, then compare what remains.'}</span></div>` : ''}</div>`;
    }
    function drawLog() {
      if (mode === 'solve') {
        const res = St.check(hist.map(h => line(h.mat, true)));
        log.innerHTML = hist.map((h, i) => `<li><span class="tl-eq">${esc(line(h.mat))}</span> <span class="tiny muted">${esc(h.says)}</span> ${i ? `<span class="tl-ok${res[i].status === 'ok' || res[i].status === 'solved' ? '' : ' bad'}">${res[i].status === 'ok' || res[i].status === 'solved' ? '✓' : '✗'}</span>` : ''}</li>`).join('');
      } else log.innerHTML = hist.map(h => `<li><span class="tl-eq">${esc(expr(h.mat[0]))} <span class="muted">?</span> ${esc(expr(h.mat[1]))}</span> <span class="tiny muted">${esc(h.says)}</span></li>`).join('');
    }

    wrap.addEventListener('click', ev => {
      const t = ev.target.closest('button'); if (!t || !wrap.contains(t)) return;
      if (t.classList.contains('tl-tile')) return tap(Number(t.dataset.s), t.dataset.k, Number(t.dataset.i));
      if (t.dataset.add) return move({ t: 'add', k: t.dataset.add });
      if (t.dataset.ans) {
        const ct = compareTruth(mat), right = t.dataset.ans === ct.ans, already = answered && answered.right;
        if (already) return;
        answered = { ans: t.dataset.ans, right };
        if (right) { S.countAnswer(!hinted); S.addPoints(hinted ? 3 : 5); S.logEvent({ kind: 'tiles', title: 'Comparison mat: ' + expr(start[0], true) + ' ? ' + expr(start[1], true), right: hinted ? 0 : 1, total: 1, pts: hinted ? 3 : 5, changes: [] }); if (window.BADGES) BADGES.flag('tiles'); if (window.APP) APP.refreshStats(); }
        else if (!right) hinted = true;
        return draw();
      }
      switch (t.id) {
        case 'tl-split': return move({ t: 'split' });
        case 'tl-flip': return move({ t: 'flip' });
        case 'tl-undo': if (hist.length > 1) { hist.pop(); mat = clone(hist[hist.length - 1].mat); sel = null; msg = ''; draw(); } return;
        case 'tl-restart': return begin(start);
        case 'tl-hint': hinted = true; msg = hint(mat, mode); return draw();
        case 'tl-new': case 'tl-next': return fresh();
        case 'tl-at-go': {
          const v = ACADEMY.parseNumber(root.querySelector('#tl-at-in').value);
          if (isNaN(v)) return;
          answered.at = v; return draw();
        }
      }
    });
    wrap.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.id === 'tl-at-in') { ev.preventDefault(); root.querySelector('#tl-at-go').click(); } });
    root.querySelector('#tl-kind').addEventListener('change', ev => { kind = ev.target.value; fresh(); });
    root.querySelector('#tl-own').addEventListener('submit', ev => {
      ev.preventDefault();
      const b = build(root.querySelector('#tl-eq').value, mode);
      if (b.error) { msg = b.error; return draw(); }
      begin(b.mat);
    });
    const typed = code && D.decode(code);
    const b = typed ? build(typed, mode) : null;
    if (b && b.mat) { begin(b.mat); root.querySelector('#tl-eq').value = typed; } else fresh();
    if (code) history.replaceState(null, '', mode === 'compare' ? '#/tiles/compare' : '#/tiles');
    H.tutorCtx({ notes: `The student is using algebra tiles on CPM's ${mode === 'solve' ? 'equation mat' : 'expression comparison mat'} (legal moves: remove matching tiles from both sides, remove zero pairs, add the same tile to both sides${mode === 'solve' ? ', flip all tiles, split into equal groups' : ''}). Currently: ${line(mat, true, mode === 'compare' ? '?' : '=')}.` });
  }

  window.TILES = { page, apply, hint, ready, outcome, compareTruth, make, build, expr, line, fromLinear, quad, factorings, quadText };
})();
