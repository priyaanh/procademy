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
      if (m[0][mv.k] >= MAX || m[1][mv.k] >= MAX) return { error: 'The mat is full of those tiles. Try removing some first.' };
      n[0][mv.k]++; n[1][mv.k]++;
      return { mat: n, says: `Added ${NAME[mv.k]} to both sides` };
    }
    if (mv.t === 'flip') {
      n.forEach(s => { [s.xp, s.xn] = [s.xn, s.xp]; [s.up, s.un] = [s.un, s.up]; });
      return { mat: n, says: 'Flipped every tile: multiplied both sides by −1' };
    }
    if (mv.t === 'split') {
      const r = ready(m);
      if (!r || r.k < 2 || r.n % r.k) return { error: 'Split when x is alone on one side, and the numbers share out evenly.' };
      n[r.xs] = fromLinear(1, 0); n[1 - r.xs] = fromLinear(0, r.n / r.k);
      return { mat: n, says: `Split both sides into ${r.k} equal groups and kept one group of each` };
    }
    return { error: 'That isn’t a move.' };
  }

  /** what to try next (the hint) */
  function hint(m, mode) {
    for (let s = 0; s < 2; s++) for (const k of ['xp', 'up']) if (m[s][k] && m[s][OPP[k]]) return `On the ${SIDE[s]} side, ${art(NAME[k])} and ${art(NAME[OPP[k]])} make a zero pair. Tap one, then the other, to remove them.`;
    for (const k of ['xp', 'xn', 'up', 'un']) if (m[0][k] && m[1][k]) return `Both sides have ${art(NAME[k])} tile. Tap one on each side to take it away from both sides.`;
    if (mode === 'compare') {
      const d = coef(m[0]) - coef(m[1]);
      return d === 0 ? 'The x tiles are gone (or match), so just compare the numbers that are left.' : 'One side has x tiles the other doesn’t. Which side is greater depends on what x is. Is there an x that makes them equal?';
    }
    if (noX(m)) return cons(m[0]) === cons(m[1]) ? 'No x tiles are left and the sides match: every number works.' : 'No x tiles are left and the sides don’t match: no number works.';
    const xs = [0, 1].filter(s => m[s].xp || m[s].xn);
    if (xs.length === 2) { const s = m[0].xn ? 0 : 1; return `There are x tiles on both sides, with opposite signs. Add x to both sides: then the −x on the ${SIDE[s]} side has a zero pair.`; }
    const s = xs[0], o = 1 - s;
    for (const k of ['up', 'un']) if (m[s][k]) return `To get x alone, the ${NAME[k]} tiles next to it must go. Add ${NAME[OPP[k]]} to both sides: each one makes a zero pair with ${art(NAME[k])} on the ${SIDE[s]} side.`;
    if (m[s].xn) return 'x is alone, but the tiles are −x. Flip every tile (multiply both sides by −1) to make them x.';
    if (m[o].up && m[o].un) return `Tidy the ${SIDE[o]} side: remove its zero pairs.`;
    const r = ready(m);
    if (r && r.k > 1) return `There are ${r.k} x tiles. Split both sides into ${r.k} equal groups: one x matches one group.`;
    return 'x is alone. Read off what it equals.';
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
    if (!raw) return { error: 'Type an equation first, like 2x + 3 = x + 7.' };
    let sides;
    if (mode === 'compare') sides = raw.split(/\s*(?:,|\?|\bvs\.?|\band\b|=|<=|>=|<|>)\s*/i).filter(Boolean);
    else { const p = St.parse(raw); if (p.error) return { error: p.error }; if (p.kind !== 'eq') return { error: 'The equation mat needs an equation, with one = sign.' }; sides = [p.L, p.R]; }
    if (sides.length !== 2) return { error: mode === 'compare' ? 'Type two expressions, like 2x + 3 and x + 7.' : 'Type one equation.' };
    const out = [];
    for (const t of sides) {
      const p = St.parse(t);
      if (p.error || p.kind !== 'expr') return { error: 'Procademy can’t read “' + t + '”.' };
      if (p.vars.some(v => v !== p.vars[0]) || p.vars.length > 1) return { error: 'Use one letter (x).' };
      const f = p.f, c0 = f(0), a = f(1) - c0;
      if (![2, -3, 5].every(x => Math.abs(f(x) - (a * x + c0)) < 1e-9)) return { error: 'Algebra tiles here show x and numbers: no x², x × x or dividing by x.' };
      if (!Number.isInteger(Math.round(a * 1e9) / 1e9) || !Number.isInteger(Math.round(c0 * 1e9) / 1e9)) return { error: 'Tiles are whole: use whole numbers.' };
      const s = fromLinear(Math.round(a), Math.round(c0));
      if (Object.values(s).some(v => v > 12)) return { error: 'That needs too many tiles. Keep each number to 12 or less.' };
      out.push(s);
    }
    if (mode !== 'compare' && noX(out)) return { error: 'There is no x to solve for.' };
    return { mat: out };
  }

  const tile = (s, k, i, sel) => `<button type="button" class="tl-tile ${k[0] === 'x' ? 'x' : 'u'}${k[1] === 'n' ? ' neg' : ''}${sel && sel.s === s && sel.k === k && sel.i === i ? ' sel' : ''}" data-s="${s}" data-k="${k}" data-i="${i}" aria-label="${NAME[k]} tile, ${SIDE[s]} side" aria-pressed="${!!(sel && sel.s === s && sel.k === k && sel.i === i)}">${NAME[k]}</button>`;
  const sideHtml = (m, s, sel) => { const t = k => Array.from({ length: m[s][k] }, (_, i) => tile(s, k, i, sel)).join(''); return `<div class="tl-row">${t('xp')}${t('xn')}</div><div class="tl-row">${t('up')}${t('un')}</div>`; };

  function page(root, mode, code) {
    mode = mode === 'compare' ? 'compare' : 'solve';
    const KINDS = mode === 'compare' ? [['mixed', 'Mixed'], ['same', 'Same x tiles'], ['depends', 'It depends on x']] : [['mixed', 'Mixed'], ['one', 'One step'], ['two', 'Two steps'], ['both', 'x on both sides'], ['neg', 'With negatives']];
    let kind = 'mixed', start, mat, hist, sel, msg, done, hinted, answered;
    root.innerHTML = `<div class="tiles-page">
      <div class="card">
        <div class="row between" style="flex-wrap:wrap;gap:8px"><h1 style="margin:0">Algebra tiles</h1>
          <div class="tabs" role="tablist" aria-label="Mat"><a role="tab" class="tab${mode === 'solve' ? ' on' : ''}" aria-selected="${mode === 'solve'}" href="#/tiles">Equation mat</a><a role="tab" class="tab${mode === 'compare' ? ' on' : ''}" aria-selected="${mode === 'compare'}" href="#/tiles/compare">Comparison mat</a></div></div>
        <p class="muted small" style="margin:6px 0 10px">${mode === 'solve' ? 'Solve by making legal moves until x is alone. Tap a tile, then a matching tile on the other side to take both away, or its opposite on the same side to remove a zero pair.' : 'Which side is greater? Simplify both sides with legal moves first: take matching tiles from both sides and remove zero pairs.'}</p>
        <div class="tl-pick">
          <label class="small" for="tl-kind">Kind</label><select id="tl-kind">${KINDS.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select>
          <button class="btn sm" id="tl-new" type="button">↻ New ${mode === 'solve' ? 'equation' : 'comparison'}</button>
          <form id="tl-own" class="tl-own"><input id="tl-eq" autocomplete="off" spellcheck="false" autocapitalize="off" aria-label="${mode === 'solve' ? 'Your own equation' : 'Your own two expressions'}" placeholder="${mode === 'solve' ? 'Or type one: 2x + 3 = x - 4' : 'Or type two: 2x + 3 and x - 4'}"><button class="btn sm" type="submit">Build</button></form>
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
        <div class="tl-msg" id="tl-msg" aria-live="polite">${msg ? `<div class="coach-note">🧭 <span>${esc(msg)}</span></div>` : ''}</div>
        ${done ? doneHtml() : `
        <div class="tl-moves">
          <span class="small muted">Add to both sides:</span>${['xp', 'xn', 'up', 'un'].map(k => `<button type="button" class="btn sm tl-add" data-add="${k}">+ ${NAME[k]}</button>`).join('')}
        </div>
        <div class="btn-row" style="margin-top:8px">
          ${mode === 'solve' && r && r.k > 1 && r.n % r.k === 0 ? `<button type="button" class="btn primary" id="tl-split">Split into ${r.k} equal groups</button>` : ''}
          ${mode === 'solve' ? '<button type="button" class="btn sm ghost" id="tl-flip">Flip every tile</button>' : ''}
          <button type="button" class="btn sm ghost" id="tl-undo" ${hist.length > 1 ? '' : 'disabled'}>↶ Undo</button>
          <button type="button" class="btn sm ghost" id="tl-hint">💡 What next?</button>
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
      return `<div class="feedback good">✅ <span>${o.kind === 'solved' ? `<b>x = ${neg(o.frac || x0)}</b>${o.uneven ? ' (the numbers don’t share out evenly into tiles, so x is a fraction)' : ''}. Check it in the first equation: ${esc(check)}` : o.kind === 'all' ? 'The sides are always the same: <b>every number</b> is a solution.' : 'The sides can never balance: there is <b>no solution</b>.'}</span></div>
        <div class="btn-row"><button type="button" class="btn primary" id="tl-next">Next equation →</button><a class="btn" href="#/steps/${D.encode(line(start, true) + '\n')}">Solve it in the step checker</a></div>`;
    }
    function compareHtml(ct) {
      if (answered && answered.right && ct.ans === 'depends') {
        const atOk = answered.at != null && Math.abs(answered.at - ct.at) < 1e-9;
        return `<div class="feedback good">✅ <span>Right: it depends on x.</span></div>
          ${atOk ? `<div class="feedback good">✅ <span>They’re equal when <b>x = ${neg(frac(Math.round(ct.at * 1000), 1000))}</b>. For bigger x, Mat A is ${ct.leftBigger}; for smaller x, it is ${ct.leftBigger === 'greater' ? 'less' : 'greater'}.</span></div><div class="btn-row"><button type="button" class="btn primary" id="tl-next">Next comparison →</button></div>`
            : `<div class="tl-at"><label for="tl-at-in">Which x makes them equal?</label> <span class="row" style="gap:6px"><span>x =</span><input id="tl-at-in" inputmode="decimal" autocomplete="off" style="width:6em"><button type="button" class="btn sm primary" id="tl-at-go">Check</button></span>${answered.at != null ? '<div class="coach-note">🧭 <span>Not quite. Try that x in both expressions: are they the same?</span></div>' : ''}</div>`}`;
      }
      if (answered && answered.right) return `<div class="feedback good">✅ <span>${ct.ans === 'equal' ? 'Right: they are equal, whatever x is.' : `Right: Mat ${ct.ans === 'left' ? 'A' : 'B'} is greater, whatever x is.`}</span></div><div class="btn-row"><button type="button" class="btn primary" id="tl-next">Next comparison →</button></div>`;
      return `<div class="tl-answer"><b>Which is greater?</b><div class="btn-row" style="margin-top:6px">${[['left', 'Mat A'], ['right', 'Mat B'], ['equal', 'They’re equal'], ['depends', 'It depends on x']].map(([v, t]) => `<button type="button" class="btn sm" data-ans="${v}">${t}</button>`).join('')}</div>
        ${answered ? `<div class="coach-note">🧭 <span>${answered.ans === 'depends' ? 'Look again: if both sides have the same x tiles, x doesn’t change which side is bigger.' : ct.ans === 'depends' ? 'Try a few values of x in both sides: does the same side always win?' : 'Not that one. Take away matching tiles and zero pairs first, then compare what’s left.'}</span></div>` : ''}</div>`;
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

  window.TILES = { page, apply, hint, ready, outcome, compareTruth, make, build, expr, line, fromLinear };
})();
