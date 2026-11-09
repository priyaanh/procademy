/* Integer tiles (#/integers, #/integers/<add|sub|mul|div>/<a>_<b>, #/integers/build[/<n>]). Positive and negative
   numbers as + tiles and − tiles on a mat, the way CPM Course 2 chapters 2 and 3 model them: a + tile and a − tile
   together are a zero pair, worth 0, so zero pairs can be put on or taken off without changing the value. A step
   player walks through each problem (put the tiles on, circle the zero pairs, take them off, count; for − add zero
   pairs until there are enough to take away; for × put groups on, or take groups away when the number of groups is
   negative; ÷ asks how many groups make the number), with the same problem as moves on a number line and the rule
   in words. "Build it" is a free mat with a "make this number" challenge. solve() is pure: each step lists the tiles
   on the mat (stable ids, so the page can animate them from one step to the next). */
'use strict';
(function () {
  const V = window.VIEWS, H = V._h, esc = H.esc;

  // ---- numbers
  const sgn = x => (x > 0 ? 1 : x < 0 ? -1 : 0);
  const show = x => (x < 0 ? '−' : '') + Math.abs(x).toLocaleString('en-US');
  const par = x => (x < 0 ? `(${show(x)})` : show(x));
  const s1 = k => (k === 1 ? '' : 's');
  const word = (k, s) => `${k.toLocaleString('en-US')} ${s > 0 ? '+' : '−'} tile${s1(k)}`;
  const left = v => (v ? word(Math.abs(v), sgn(v)) : 'nothing at all, an empty mat');
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };

  // ---- tiles on the mat: {id, s (+1 or −1), mark ('pair' | 'take' | 'count'), g (group)}
  const tiles = (k, s, pre) => Array.from({ length: k }, (_, i) => ({ id: pre + i, s }));
  const zeroPairs = (k, pre) => tiles(k, 1, pre + 'p').concat(tiles(k, -1, pre + 'n')).map(t => Object.assign(t, { mark: 'pair' }));
  function snap(say, list) {
    const ts = list.map(t => Object.assign({}, t)), pos = ts.filter(t => t.s > 0).length, neg = ts.length - pos;
    return { say, tiles: ts, pos, neg, value: pos - neg };
  }
  const plain = list => list.map(t => ({ id: t.id, s: t.s }));
  const mark = (list, m) => list.map(t => Object.assign({}, t, { mark: m }));
  /** the first k tiles of each sign marked as zero pairs */
  function pairUp(list, k) {
    const seen = { 1: 0, '-1': 0 };
    return list.map(t => (seen[t.s]++ < k ? Object.assign({}, t, { mark: 'pair' }) : Object.assign({}, t)));
  }

  function addSteps(a, b) {
    const A = tiles(Math.abs(a), sgn(a), 'a'), B = tiles(Math.abs(b), sgn(b), 'b'), ans = a + b, eq = `${show(a)} + ${par(b)}`;
    const steps = [snap(a ? `Put ${show(a)} on the mat: ${word(Math.abs(a), sgn(a))}.` : 'Start with 0: an empty mat.', A)];
    let mat = A.concat(B);
    steps.push(snap(b ? `Add ${show(b)}: put ${word(Math.abs(b), sgn(b))} on the mat as well.` : 'Adding 0 puts nothing on the mat.', mat));
    const m = Math.min(steps[1].pos, steps[1].neg);
    if (m) {
      steps.push(snap(`A + tile and a − tile make a <b>zero pair</b>, worth 0. Circle them: ${m} zero pair${s1(m)}.`, pairUp(mat, m)));
      const out = new Set(pairUp(mat, m).filter(t => t.mark).map(t => t.id));
      mat = mat.filter(t => !out.has(t.id));
      steps.push(snap(`Take the zero pairs off. Each one is worth 0, so the mat is still worth the same.`, mat));
    }
    steps.push(snap(`${m ? 'Count the tiles that remain' : 'There are no zero pairs, so count the tiles'}: ${left(ans)}. So ${eq} = <b>${show(ans)}</b>.`, mark(mat, 'count')));
    return steps;
  }
  function subSteps(a, b) {
    const A = tiles(Math.abs(a), sgn(a), 'a'), ans = a - b, eq = `${show(a)} − ${par(b)}`, sb = sgn(b), need = Math.abs(b);
    const steps = [snap(a ? `Put ${show(a)} on the mat: ${word(Math.abs(a), sgn(a))}.` : 'Start with 0: an empty mat.', A)];
    let mat = A;
    if (b) {
      const have = mat.filter(t => t.s === sb).length;
      if (have < need) {
        const z = need - have;
        mat = zeroPairs(z, 'z').concat(mat);
        steps.push(snap(`To take away ${show(b)} you need ${word(need, sb)}, but there ${have ? `${have === 1 ? 'is' : 'are'} only ${have}` : 'are none'}. Add ${z} zero pair${s1(z)}: they are worth 0, so the mat is still worth ${show(a)}.`, mat));
        mat = plain(mat);
      }
      // take the last `need` tiles of that sign
      const ids = mat.filter(t => t.s === sb).slice(-need).map(t => t.id), take = new Set(ids);
      steps.push(snap(`Take away ${show(b)}: that is ${word(need, sb)}.`, mat.map(t => (take.has(t.id) ? Object.assign({}, t, { mark: 'take', g: 0 }) : t))));
      mat = mat.filter(t => !take.has(t.id));
    } else steps.push(snap('Taking away 0 takes nothing off.', mat));
    steps.push(snap(`Count the tiles that remain: ${left(ans)}. So ${eq} = <b>${show(ans)}</b>.`, mark(mat, 'count')));
    return steps;
  }
  function mulSteps(a, b) {
    const k = Math.abs(b), sb = sgn(b), ans = a * b, eq = `${show(a)} × ${par(b)}`, n = Math.abs(a);
    if (!a || !b) return [snap('Start with an empty mat. It is worth 0.', []), snap(`${!a ? `0 groups of any number is 0` : `${n} group${s1(n)} of 0 ${n === 1 ? 'is' : 'are'} still 0`}: the mat stays empty. So ${eq} = <b>0</b>.`, [])];
    if (a > 0) {
      const G = [];
      for (let g = 0; g < n; g++) tiles(k, sb, `g${g}_`).forEach(t => G.push(Object.assign(t, { g })));
      return [snap(`Put ${n} group${s1(n)} of ${par(b)} on the mat: ${n} × ${k} = ${word(n * k, sb)}.`, G),
        snap(`Count them: ${left(ans)}. So ${eq} = <b>${show(ans)}</b>.`, mark(plain(G), 'count'))];
    }
    const Z = zeroPairs(n * k, 'z');
    let i = 0;
    const T = plain(Z).map(t => (t.s === sb ? Object.assign(t, { mark: 'take', g: Math.floor(i++ / k) }) : t));
    return [snap('Start with an empty mat. It is worth 0.', []),
      snap(`${show(a)} groups means <b>taking away</b> ${n} group${s1(n)} of ${par(b)}. There is nothing to take, so first add ${n * k} zero pairs. The mat is still worth 0.`, Z),
      snap(`Take away ${n} group${s1(n)} of ${par(b)}: ${word(n * k, sb)}.`, T),
      snap(`Count the tiles that remain: ${left(ans)}. So ${eq} = <b>${show(ans)}</b>.`, mark(T.filter(t => t.s !== sb), 'count'))];
  }
  function divSteps(a, b) {
    const k = Math.abs(b), sb = sgn(b), q = a / b, n = Math.abs(a), eq = `${show(a)} ÷ ${par(b)}`;
    if (!a) return [snap(`0 is an empty mat. It takes 0 groups of ${par(b)} to make it. So ${eq} = <b>0</b>.`, [])];
    if (sgn(a) === sb) {
      const A = tiles(n, sgn(a), 'a');
      return [snap(`Put ${show(a)} on the mat: ${word(n, sgn(a))}. How many groups of ${par(b)} make it?`, A),
        snap(`Circle groups of ${par(b)}, ${word(k, sb)} each: ${q} group${s1(q)}.`, A.map((t, i) => Object.assign({}, t, { g: Math.floor(i / k) }))),
        snap(`${q} group${s1(q)} of ${par(b)} make${q === 1 ? 's' : ''} ${show(a)}, so ${eq} = <b>${show(q)}</b>.`, A.map((t, i) => Object.assign({}, t, { g: Math.floor(i / k), mark: 'count' })))];
    }
    const Z = zeroPairs(n, 'z'), m = Math.abs(q);
    let i = 0;
    const T = plain(Z).map(t => (t.s === sb ? Object.assign(t, { mark: 'take', g: Math.floor(i++ / k) }) : t));
    return [snap(`${eq} asks: how many groups of ${par(b)} make ${show(a)}? Putting groups of ${par(b)} on only makes ${sb > 0 ? 'positive' : 'negative'} numbers, so this time groups are taken away. Start with an empty mat.`, []),
      snap(`Add ${n} zero pairs, so there is something to take away. The mat is still worth 0.`, Z),
      snap(`Take away groups of ${par(b)} until ${show(a)} is left: ${m} group${s1(m)}.`, T),
      snap(`${show(a)} is left after taking away ${m} group${s1(m)}, and taking away is negative: ${show(q)} groups. So ${eq} = <b>${show(q)}</b>.`, mark(T.filter(t => t.s !== sb), 'count'))];
  }

  // ---- the rule in words
  function addRule(a, b) {
    const ans = a + b;
    if (!a || !b) return ['Adding 0 doesn’t change a number.', `${show(a)} + ${par(b)} = ${show(ans)}`];
    if (sgn(a) === sgn(b)) return ['Same signs: add the sizes and keep the sign.', `${Math.abs(a)} + ${Math.abs(b)} = ${Math.abs(ans)}`, `Both are ${a > 0 ? 'positive' : 'negative'}, so the answer is ${show(ans)}.`];
    if (a === -b) return ['They are opposites, so they cancel.', `${show(a)} + ${par(b)} = 0`];
    const big = Math.abs(a) > Math.abs(b) ? a : b;
    return ['Different signs: subtract the smaller size from the larger one.', `${Math.max(Math.abs(a), Math.abs(b))} − ${Math.min(Math.abs(a), Math.abs(b))} = ${Math.abs(ans)}`,
      `${show(big)} is farther from 0, so the answer is ${big > 0 ? 'positive' : 'negative'}: ${show(ans)}.`];
  }
  function rule(op, a, b) {
    if (op === 'add') return addRule(a, b);
    if (op === 'sub') return ['Subtracting is the same as adding the opposite.', `${show(a)} − ${par(b)} = ${show(a)} + ${par(-b)}`].concat(addRule(a, -b));
    const sym = op === 'mul' ? '×' : '÷', ans = op === 'mul' ? a * b : a / b;
    if (op === 'mul' && (!a || !b)) return ['Any number times 0 is 0.', `${show(a)} × ${par(b)} = 0`];
    if (op === 'div' && !a) return ['0 divided by any number (except 0) is 0.', `0 ÷ ${par(b)} = 0`];
    const same = sgn(a) === sgn(b);
    return [`${same ? 'Same signs give a positive answer' : 'Different signs give a negative answer'}.`, `${Math.abs(a).toLocaleString('en-US')} ${sym} ${Math.abs(b).toLocaleString('en-US')} = ${fmtQ(Math.abs(ans))}`,
      `so ${show(a)} ${sym} ${par(b)} = ${fmtQ(ans)}`].concat(op === 'div' && Number.isInteger(ans) ? [`Check: ${par(ans)} × ${par(b)} = ${show(a)} ✓`] : []);
  }
  const fmtQ = x => (Number.isInteger(x) ? show(x) : (Math.abs(x * 1e4 - Math.round(x * 1e4)) < 1e-9 ? '' : '≈ ') + (x < 0 ? '−' : '') + Math.abs(Math.round(x * 1e4) / 1e4).toLocaleString('en-US', { maximumFractionDigits: 4 }));

  // ---- the same problem as moves on a number line
  function niceStep(raw) {
    const p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
  }
  function numberLine(op, a, b, ans) {
    let moves;
    if (op === 'add' || op === 'sub') {
      const d = op === 'add' ? b : -b;
      moves = [{ from: 0, to: a, cls: 'a', n: 1, label: `start at ${show(a)}` }, { from: a, to: a + d, cls: 'b', n: 1, label: op === 'add' ? `+ ${par(b)}` : `− ${par(b)}${b < 0 ? ` is + ${show(-b)}` : ''}` }];
    } else if (op === 'mul') {
      const n = Math.abs(a), st = a >= 0 ? b : -b;
      moves = [{ from: 0, to: n * st, cls: 'a', n, label: a >= 0 ? `${n} jump${s1(n)} of ${par(b)}` : `${n} jump${s1(n)} of ${par(-b)}, the opposite of ${par(b)}` }];
    } else {
      const n = Math.abs(ans);
      moves = [{ from: 0, to: a, cls: 'a', n, label: ans >= 0 ? `${n} jump${s1(n)} of ${par(b)} reach ${show(a)}` : `${n} jump${s1(n)} of ${par(-b)}, the opposite of ${par(b)}` }];
    }
    const ends = op === 'div' ? [0, a] : [0, ans], pts = ends.concat(...moves.map(m => [m.from, m.to]));
    let lo = Math.min(...pts), hi = Math.max(...pts);
    const pad = Math.max(1, Math.round((hi - lo) * 0.06));
    lo -= pad; hi += pad;
    if (hi - lo < 10) { const c = (lo + hi) / 2; lo = Math.floor(c - 5); hi = lo + 10; }
    const W = 360, x0 = 22, x1 = 338, px = (x1 - x0) / (hi - lo), X = v => x0 + (v - lo) * px;
    const rowY = i => 30 + i * 30, Y = rowY(moves.length - 1) + 30;
    let g = `<line x1="${x0 - 8}" y1="${Y}" x2="${x1 + 8}" y2="${Y}" class="it-axis"/>`;
    const labW = Math.max(String(Math.round(Math.abs(lo))).length, String(Math.round(Math.abs(hi))).length) * 7.5 + 14, step = niceStep(Math.max(24, labW) / px), special = [...new Set(ends.concat(moves.map(m => m.to), op === 'mul' || op === 'div' ? [] : [a]))].sort((p, q) => p - q);
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
      g += `<line x1="${X(v).toFixed(1)}" y1="${Y - 5}" x2="${X(v).toFixed(1)}" y2="${Y + 5}" class="it-tick"/>`;
      if (!special.some(s => Math.abs(X(s) - X(v)) < labW * 0.85)) g += `<text x="${X(v).toFixed(1)}" y="${Y + 20}" text-anchor="middle" class="it-nl-n">${show(v)}</text>`;
    }
    if (step > 1 && px >= 8) for (let v = Math.ceil(lo); v <= hi; v++) if (v % step) g += `<line x1="${X(v).toFixed(1)}" y1="${Y - 2.5}" x2="${X(v).toFixed(1)}" y2="${Y + 2.5}" class="it-tick"/>`;
    let lastX = -1e9, low = false;
    special.forEach(s => {
      low = X(s) - lastX < 26 ? !low : false; lastX = X(s);
      g += `<line x1="${X(s).toFixed(1)}" y1="${Y - 6}" x2="${X(s).toFixed(1)}" y2="${Y + 6}" class="it-tick sp"/><text x="${X(s).toFixed(1)}" y="${Y + 20 + (low ? 14 : 0)}" text-anchor="middle" class="it-nl-n sp">${show(s)}</text>`;
    });
    const head = (x, y, ang, cls) => { const c = Math.cos(ang), s = Math.sin(ang), p = (dx, dy) => `${(x + dx * c - dy * s).toFixed(1)},${(y + dx * s + dy * c).toFixed(1)}`; return `<polygon points="${p(0, 0)} ${p(-9, -5)} ${p(-9, 5)}" class="it-head ${cls}"/>`; };
    moves.forEach((m, i) => {
      const y = rowY(i), a0 = X(m.from), a1 = X(m.to), seg = Math.abs(a1 - a0) / Math.max(1, m.n);
      g += `<line x1="${a0.toFixed(1)}" y1="${y}" x2="${a0.toFixed(1)}" y2="${Y}" class="it-drop"/><line x1="${a1.toFixed(1)}" y1="${y}" x2="${a1.toFixed(1)}" y2="${Y}" class="it-drop"/>`;
      if (m.from === m.to) g += `<circle cx="${a1.toFixed(1)}" cy="${y}" r="4" class="it-head ${m.cls}"/>`;
      else if (m.n > 1 && m.n <= 20 && seg >= 9) {
        const dir = Math.sign(a1 - a0), h = Math.min(12, seg * 0.45);
        for (let j = 0; j < m.n; j++) {
          const p = a0 + dir * seg * j, q = p + dir * seg, mid = (p + q) / 2;
          g += `<path d="M${p.toFixed(1)} ${y} Q${mid.toFixed(1)} ${(y - 2 * h).toFixed(1)} ${q.toFixed(1)} ${y}" class="it-arc ${m.cls}"/>`;
          if (j === m.n - 1) g += head(q, y, Math.atan2(2 * h, q - mid), m.cls);
          else g += `<circle cx="${q.toFixed(1)}" cy="${y}" r="2.5" class="it-head ${m.cls}"/>`;
        }
      } else g += `<line x1="${a0.toFixed(1)}" y1="${y}" x2="${(a1 - Math.sign(a1 - a0) * 6).toFixed(1)}" y2="${y}" class="it-arrow ${m.cls}"/>${head(a1, y, a1 > a0 ? 0 : Math.PI, m.cls)}`;
      const w = m.label.length * 7.2, lx = Math.min(W - 6 - w / 2, Math.max(6 + w / 2, (a0 + a1) / 2)), arcs = m.n > 1 && m.n <= 20 && seg >= 9;
      g += `<text x="${lx.toFixed(1)}" y="${(y - (arcs ? Math.min(12, seg * 0.45) + 9 : 8)).toFixed(1)}" text-anchor="middle" class="it-nl-lab">${esc(m.label)}</text>`;
    });
    const top = m => (m.n > 1 ? 30 : 26);
    const y0 = Math.min(...moves.map((m, i) => rowY(i) - top(m))) - 4;
    return `<svg class="it-nl" viewBox="0 ${Math.min(0, y0)} ${W} ${Y + 44 - Math.min(0, y0)}" role="img" aria-label="${esc(`On a number line: ${moves.map(m => m.label).join(', then ')}, ending at ${show(op === 'div' ? a : ans)}.`)}">${g}</svg>`;
  }

  const OPS = {
    add: { name: 'Add', sym: '+', f: [5, -3], steps: addSteps },
    sub: { name: 'Subtract', sym: '−', f: [3, -5], steps: subSteps },
    mul: { name: 'Multiply', sym: '×', f: [-3, 2], steps: mulSteps },
    div: { name: 'Divide', sym: '÷', f: [-8, -2], steps: divSteps },
  };
  const NOTES = {
    add: ['Order doesn’t matter in addition: 5 + (−3) and (−3) + 5 are both 2.'],
    sub: ['Order matters in subtraction: 3 − 5 = −2, but 5 − 3 = 2.', 'Subtracting a negative is like removing a debt: the result is greater.'],
    mul: ['A negative number of groups means taking groups away.', 'An even number of negative signs multiplies to a positive answer; an odd number gives a negative one.'],
    div: ['Dividing has the same sign rules as multiplying: same signs positive, different signs negative.', 'You can’t divide by 0: any number of groups of 0 makes only 0.'],
  };

  /** work out a problem: {error} or {answer, steps (null when too many tiles to draw), …} */
  function solve(op, vals) {
    const O = OPS[op];
    if (!O) return { error: 'This problem type doesn’t exist.' };
    const [a, b] = vals;
    for (const v of [a, b]) {
      if (!Number.isFinite(v)) return { error: 'Enter a whole number in each box, such as 7 or −4.' };
      if (!Number.isInteger(v)) return { error: 'Integer tiles only work with whole numbers (integers). For decimals and fractions, use the calculator.' };
      if (Math.abs(v) > 1e6) return { error: 'Use numbers from −1,000,000 to 1,000,000.' };
    }
    if (op === 'div' && b === 0) return { error: a ? `You can’t divide by 0: no number times 0 makes ${show(a)}.` : '0 ÷ 0 has no single answer, so it is undefined.' };
    const answer = op === 'add' ? a + b : op === 'sub' ? a - b : op === 'mul' ? a * b : a / b;
    const expr = `${show(a)} ${O.sym} ${par(b)}`, out = { op, a, b, answer, expr, rule: rule(op, a, b), notes: ['A + tile and a − tile make a zero pair. It is worth 0, so zero pairs can go on or come off the mat without changing its value.'].concat(NOTES[op]) };
    if (op === 'sub') out.same = `${show(a)} + ${par(-b)}`;
    if (op === 'div' && !Number.isInteger(answer)) {
      const g = gcd(a, b), sn = sgn(a) * sgn(b);
      return Object.assign(out, { steps: null, note: `${expr} = ${fmtQ(answer)} (that is ${sn < 0 ? '−' : ''}${Math.abs(a / g)}/${Math.abs(b / g)}), which isn’t a whole number, so it can’t be made from whole groups of tiles.` });
    }
    out.line = numberLine(op, a, b, answer);
    const big = op === 'mul' ? Math.abs(a) > 20 || Math.abs(b) > 20 || Math.abs(a * b) > 60 : op === 'div' ? Math.abs(a) > 60 || Math.abs(b) > 20 : Math.abs(a) > 20 || Math.abs(b) > 20;
    if (big) return Object.assign(out, { steps: null, note: `That is too many tiles to draw. The mat holds ${op === 'mul' ? 'numbers from −20 to 20, with an answer from −60 to 60' : op === 'div' ? 'numbers from −60 to 60, divided by −20 to 20' : 'numbers from −20 to 20'}. The answer is shown below with the rule.` });
    out.steps = O.steps(a, b);
    out.group = (op === 'mul' || op === 'div') && b ? Math.abs(b) : 0;
    return out;
  }

  // ---- drawing the mat. Tiles keep their id from step to step, so they slide, appear and disappear.
  const NS = 'http://www.w3.org/2000/svg', T = 20, G = 8, E = 8, PAD = 14, RG = 5, BG = 14, VW = 360;
  const reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /** columns per row (whole groups per row when there are groups) */
  function grid(group) {
    const avail = VW - 2 * PAD;
    if (!group || group > 12) return { cols: Math.floor((avail + G) / (T + G)), gap: 0, group: 0 };
    return { cols: Math.max(1, Math.floor((avail + G + E) / (group * (T + G) + E))) * group, gap: E, group };
  }
  const widthOf = (n, o) => n * (T + G) - G + (o.group ? (Math.ceil(n / o.group) - 1) * o.gap : 0);
  function layout(list, o) {
    const P = list.filter(t => t.s > 0), N = list.filter(t => t.s < 0), C = o.cols;
    const bands = Math.max(1, Math.ceil(Math.max(P.length, N.length) / C)), rows = [];
    const colX = c => o.x0 + c * (T + G) + (o.group ? Math.floor(c / o.group) * o.gap : 0);
    let y = PAD;
    for (let j = 0; j < bands; j++) {
      const hp = P.length > j * C, hn = N.length > j * C, yp = y;
      if (hp) y += T;
      if (hp && hn) y += RG;
      const yn = y;
      if (hn) y += T;
      rows.push({ yp, yn });
      y += BG;
    }
    const at = {}, h = list.length ? y - BG + PAD : 64;
    P.forEach((t, i) => { at[t.id] = { x: colX(i % C), y: rows[Math.floor(i / C)].yp, b: Math.floor(i / C) }; });
    N.forEach((t, i) => { at[t.id] = { x: colX(i % C), y: rows[Math.floor(i / C)].yn, b: Math.floor(i / C) }; });
    let marks = '';
    for (let i = 0; i < Math.min(P.length, N.length); i++) {
      if (P[i].mark !== 'pair' || N[i].mark !== 'pair') continue;
      const p = at[P[i].id], n = at[N[i].id];
      marks += `<rect x="${p.x - 3}" y="${p.y - 3}" width="${T + 6}" height="${n.y + T - p.y + 6}" rx="8" class="it-pair"/>`;
    }
    const boxes = {};
    list.forEach(t => {
      if (t.g === undefined) return;
      const p = at[t.id], key = `${t.s}|${p.b}|${t.g}`, bx = boxes[key] || (boxes[key] = { x0: p.x, x1: p.x, y: p.y, take: t.mark === 'take' });
      bx.x0 = Math.min(bx.x0, p.x); bx.x1 = Math.max(bx.x1, p.x);
    });
    Object.values(boxes).forEach(bx => { marks += `<rect x="${bx.x0 - 3}" y="${bx.y - 3}" width="${bx.x1 - bx.x0 + T + 6}" height="${T + 6}" rx="7" class="it-grp${bx.take ? ' take' : ''}"/>`; });
    return { at, h, marks };
  }
  const body = s => `<g class="it-body"><rect width="${T}" height="${T}" rx="4" class="it-sq"/><path d="${s > 0 ? `M5 10 H15 M10 5 V15` : 'M5 10 H15'}" class="it-sym"/></g>`;
  /** a mat in `box`; draw(list, opts) moves it to a new set of tiles */
  function Mat(box) {
    box.innerHTML = `<svg class="it-svg" viewBox="0 0 ${VW} 64" tabindex="0" role="img" aria-label="An empty mat"><rect class="it-bg" x="1" y="1" width="${VW - 2}" height="62" rx="12"/><g class="it-layer"></g><g class="it-marks"></g><text class="it-empty" x="${VW / 2}" y="37" text-anchor="middle">Empty mat, worth 0</text></svg>`;
    const svg = box.firstChild, bg = svg.querySelector('.it-bg'), layer = svg.querySelector('.it-layer'), marks = svg.querySelector('.it-marks'), empty = svg.querySelector('.it-empty'), live = new Map();
    function draw(list, o, label) {
      const L = layout(list, o), seen = new Set();
      svg.setAttribute('viewBox', `0 0 ${VW} ${L.h}`); bg.setAttribute('height', L.h - 2);
      empty.setAttribute('y', L.h / 2 + 5); empty.style.display = list.length ? 'none' : '';
      let d = 0;
      list.forEach(t => {
        const p = L.at[t.id];
        seen.add(t.id);
        let el = live.get(t.id);
        if (!el) {
          el = document.createElementNS(NS, 'g');
          el.innerHTML = body(t.s);
          el.style.transform = `translate(${p.x}px, ${p.y}px)`;
          el.style.setProperty('--d', Math.min(d++ * 16, 640) + 'ms');
          el.setAttribute('class', `it-tile ${t.s > 0 ? 'p' : 'n'} enter`);
          layer.appendChild(el); live.set(t.id, el);
        } else { el.classList.remove('enter'); el.style.transform = `translate(${p.x}px, ${p.y}px)`; }
        el.classList.toggle('take', t.mark === 'take');
        el.classList.toggle('count', t.mark === 'count');
      });
      live.forEach((el, id) => {
        if (seen.has(id)) return;
        live.delete(id);
        if (reduce()) el.remove(); else { el.classList.add('leave'); setTimeout(() => el.remove(), 320); }
      });
      marks.innerHTML = L.marks;
      svg.setAttribute('aria-label', label);
    }
    return { svg, draw };
  }
  const matLabel = (st, extra) => `${st.pos || st.neg ? `The mat has ${st.pos} + tile${s1(st.pos)} and ${st.neg} − tile${s1(st.neg)}, worth ${show(st.value)}` : 'An empty mat, worth 0'}.${extra ? ' ' + extra : ''}`;

  const read = s => { const t = String(s).replace(/[−–—]/g, '-').replace(/[\s()+,]/g, ''); return t === '' || t === '-' ? NaN : Number(t); };

  // ---- the page
  const GROUPS = [['Operations', ['add', 'sub', 'mul', 'div']], ['Free mat', ['build']]];
  function page(root, op, code) {
    let o = (OPS[op] || op === 'build') ? op : 'add', vals = OPS[o] ? OPS[o].f.slice() : [0, 0];
    if (code && OPS[o]) String(code).split('_').forEach((p, i) => { const v = Number(p); if (i < 2 && p !== '' && Number.isFinite(v)) vals[i] = v; });
    root.innerHTML = `<div class="sh-page it-page">
      <div class="card">
        <h1>Integer tiles</h1>
        <p class="muted small" style="margin:4px 0 10px">Positive and negative numbers as tiles: a + and a − make a zero pair, worth 0. Step through and watch the tiles move.</p>
        <div class="sh-kinds">${GROUPS.map(([g, keys]) => `<div class="sh-group"><span class="tiny muted">${g}</span><div class="sh-chips">${keys.map(x => `<button type="button" class="chip-btn${x === o ? ' on' : ''}" data-op="${x}" aria-pressed="${x === o}">${x === 'build' ? 'Build a number' : OPS[x].name}</button>`).join('')}</div></div>`).join('')}</div>
      </div>
      <div id="it-body" class="sh-page it-body"></div>
    </div>`;
    const wrap = root.querySelector('.it-page'), bodyEl = root.querySelector('#it-body');
    const q = s => bodyEl.querySelector(s);
    let touched = false, mat = null, r = null, step = 0, rolls = 0, t = null;
    // build mode
    let bt = [], nextId = 0, chal = Number(code) > 0 && o === 'build' ? Math.floor(Number(code)) : 1, solved = 0, done = false;
    const touch = () => { touched = true; if (window.BADGES) BADGES.flag('integers'); };

    function setup() {
      wrap.querySelectorAll('[data-op]').forEach(x => { x.classList.toggle('on', x.dataset.op === o); x.setAttribute('aria-pressed', String(x.dataset.op === o)); });
      if (o === 'build') return setupBuild();
      bodyEl.innerHTML = `<div class="card">
          <div class="it-ask">
            ${[0, 1].map(i => `${i ? `<span class="it-opsym" id="it-sym" aria-hidden="true">${OPS[o].sym}</span>` : ''}<div class="sh-field"><label class="small" for="it-f${i}">${i ? 'Second number' : 'First number'}</label><span class="it-numbox"><input id="it-f${i}" type="text" autocomplete="off" spellcheck="false" data-i="${i}" value="${show(vals[i]).replace(/,/g, '')}"><button type="button" class="it-flip" data-flip="${i}" aria-label="Change the sign of the ${i ? 'second' : 'first'} number">±</button></span></div>`).join('')}
            <button type="button" class="btn sm ghost" id="it-rand">Another problem</button>
          </div>
          <div class="it-eq" id="it-eq" aria-live="polite"></div>
          <div id="it-mat" class="it-mat"></div>
          <p class="it-say" id="it-say" aria-live="polite"></p>
          <div class="it-player" id="it-player"><button type="button" class="btn sm" id="it-back">← Back</button><span class="small muted" id="it-count"></span><button type="button" class="btn sm primary" id="it-next">Next →</button><button type="button" class="btn sm ghost" id="it-again">Start over</button></div>
        </div>
        <div id="it-out" class="sh-out"></div>`;
      mat = Mat(q('#it-mat'));
      render(true);
    }
    function opts() {
      const g = grid(r.group), most = Math.max(1, ...r.steps.map(s => Math.max(s.pos, s.neg)));
      return Object.assign(g, { x0: (VW - widthOf(Math.min(g.cols, most), g)) / 2 });
    }
    function render(fresh) {
      r = solve(o, vals);
      const O = OPS[o];
      q('#it-sym').textContent = O.sym;
      if (r.error) {
        root.__integers = { op: o, a: vals[0], b: vals[1], error: r.error };
        q('#it-eq').textContent = ''; q('#it-mat').hidden = true; q('#it-player').hidden = true;
        q('#it-say').innerHTML = `<span class="cx-err loud">${esc(r.error)}</span>`;
        q('#it-out').innerHTML = '';
        return;
      }
      if (fresh) step = 0;
      const drawn = !!r.steps;
      q('#it-mat').hidden = !drawn; q('#it-player').hidden = !drawn;
      if (drawn) showStep(); else { q('#it-eq').textContent = `${r.expr} = ${fmtQ(r.answer)}`; q('#it-say').innerHTML = `<span class="cx-err">${esc(r.note)}</span>`; hook(); }
      const res = [['Answer', fmtQ(r.answer), r.expr]];
      if (r.same) res.push(['Same as', r.same, 'adding the opposite']);
      if (o === 'div' && Number.isInteger(r.answer)) res.push(['Check', `${par(r.answer)} × ${par(r.b)}`, `= ${show(r.a)}`]);
      q('#it-out').innerHTML = `<div class="card"><div class="sh-res">${res.map(([l, v, s]) => `<div class="sh-tile"><span class="tiny muted">${l}</span><b>${v}</b>${s ? `<span class="tiny muted">${s}</span>` : ''}</div>`).join('')}</div></div>
        ${r.line ? `<div class="card"><h2>On a number line</h2><div class="it-line">${r.line}</div></div>` : ''}
        <div class="card"><h2>How it is found</h2>${drawn ? `<div class="sh-work"><h3>With the tiles</h3><ol class="it-steps">${r.steps.map((s, i) => `<li><button type="button" class="it-jump" data-step="${i}">${s.say}</button></li>`).join('')}</ol></div>` : ''}<div class="sh-work"><h3>With the rule</h3><div class="sh-lines">${r.rule.map(x => `<div>${esc(x)}</div>`).join('')}</div></div></div>
        <div class="card"><h2>Key facts</h2><ul class="nm-facts">${r.notes.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
      history.replaceState(null, '', `#/integers/${o}/${vals.join('_')}`);
      H.tutorCtx({ notes: `The student is on the integer tiles tool (+ and − tiles, zero pairs): ${H.plain(r.expr)} = ${H.plain(fmtQ(r.answer))}.${drawn ? ` They are on step ${step + 1} of ${r.steps.length}: ${H.plain(r.steps[step].say)}` : ''}` });
    }
    function showStep() {
      const st = r.steps[step], last = step === r.steps.length - 1;
      mat.draw(st.tiles, opts(), matLabel(st, `Step ${step + 1} of ${r.steps.length}.`));
      q('#it-say').innerHTML = st.say;
      q('#it-eq').innerHTML = `${esc(r.expr)} = ${last ? `<b>${esc(fmtQ(r.answer))}</b>` : '?'}`;
      q('#it-count').textContent = `Step ${step + 1} of ${r.steps.length}`;
      q('#it-back').disabled = step === 0; q('#it-next').disabled = last;
      bodyEl.querySelectorAll('.it-jump').forEach(b => b.classList.toggle('on', Number(b.dataset.step) === step));
      hook();
    }
    function hook() {
      const st = r.steps && r.steps[step];
      root.__integers = { op: o, a: r.a, b: r.b, answer: r.answer, step, steps: r.steps ? r.steps.length : 0, pos: st ? st.pos : null, neg: st ? st.neg : null, value: st ? st.value : null, drawn: !!r.steps };
    }
    function go(i) {
      if (!r || !r.steps) return;
      const n = Math.max(0, Math.min(r.steps.length - 1, i));
      if (n === step) return;
      step = n; showStep();
      H.tutorCtx({ notes: `The student is on the integer tiles tool (+ and − tiles, zero pairs): ${H.plain(r.expr)} = ${H.plain(fmtQ(r.answer))}. They are on step ${step + 1} of ${r.steps.length}: ${H.plain(r.steps[step].say)}` });
    }
    function another() {
      const R = RNG.make(`integers:${o}:${++rolls}`);
      if (o === 'div') { const b = R.nz(-6, 6), k = R.nz(-6, 6); vals = [b * k, b]; }
      else if (o === 'mul') vals = [R.nz(-5, 5), R.nz(-6, 6)];
      else vals = [R.nz(-9, 9), R.nz(-9, 9)];
      [0, 1].forEach(i => { q('#it-f' + i).value = show(vals[i]); });
      render(true);
    }

    // ---- Build a number: a free mat, and a challenge to show a number with an exact number of tiles
    function challenge(n) {
      const R = RNG.make('integers:build:' + n), v = R.int(-9, 9), extra = R.int(1, 5);
      return { value: v, total: Math.abs(v) + 2 * extra };
    }
    function setupBuild() {
      bodyEl.innerHTML = `<div class="card">
          <h2 style="margin:0 0 4px">Build a number</h2>
          <p class="small muted" style="margin:0 0 10px">Place tiles on the mat to see its value. Zero pairs are circled because they cancel.</p>
          <div class="it-tools">
            <button type="button" class="btn sm" data-act="p"><span class="it-chip p" aria-hidden="true"></span>Add a + tile</button>
            <button type="button" class="btn sm" data-act="n"><span class="it-chip n" aria-hidden="true"></span>Add a − tile</button>
            <button type="button" class="btn sm" data-act="zp">Add a zero pair</button>
            <button type="button" class="btn sm ghost" data-act="tp">Remove a + tile</button>
            <button type="button" class="btn sm ghost" data-act="tn">Remove a − tile</button>
            <button type="button" class="btn sm ghost" data-act="rz">Remove a zero pair</button>
            <button type="button" class="btn sm ghost" data-act="clear">Clear the mat</button>
          </div>
          <div id="it-mat" class="it-mat"></div>
          <p class="it-val" id="it-val" aria-live="polite"></p>
          <p class="small it-msg" id="it-msg" aria-live="polite"></p>
        </div>
        <div class="card">
          <h2 style="margin:0 0 4px">Make this number</h2>
          <p class="it-goal" id="it-goal"></p>
          <div id="it-goal-msg" class="small" aria-live="polite"></div>
          <div class="btn-row"><button type="button" class="btn sm primary" id="it-new">New challenge</button><span class="small muted" id="it-solved"></span></div>
        </div>
        <div class="card"><h2>Key facts</h2><ul class="nm-facts"><li>A number can be shown in many ways: 2 is two + tiles, or three + tiles and one − tile, or ten + tiles and eight − tiles.</li><li>Adding or removing a zero pair changes the number of tiles, but never the value of the mat.</li><li>To remove a tile that isn’t on the mat, add a zero pair first. This is how subtracting a negative works.</li></ul></div>`;
      mat = Mat(q('#it-mat'));
      drawBuild('');
    }
    function drawBuild(msg) {
      const P = bt.filter(x => x.s > 0), N = bt.filter(x => x.s < 0), m = Math.min(P.length, N.length);
      const list = pairUp(bt, m), value = P.length - N.length, goal = challenge(chal), g = grid(0);
      mat.draw(list, Object.assign(g, { x0: (VW - widthOf(g.cols, g)) / 2 }), matLabel({ pos: P.length, neg: N.length, value }));
      q('#it-val').innerHTML = `Value: <b>${show(value)}</b> · ${word(P.length, 1)}, ${word(N.length, -1)}${m ? ` · ${m} zero pair${s1(m)}` : ''}`;
      q('#it-msg').textContent = msg || '';
      q('#it-goal').innerHTML = `Show <b>${show(goal.value)}</b> using exactly <b>${goal.total}</b> tiles.`;
      let gm = '';
      if (value === goal.value && bt.length === goal.total) {
        if (!done) { done = true; solved++; }
        gm = `<span class="it-yes">✓ Correct: ${word(P.length, 1)} and ${word(N.length, -1)} make ${show(value)}.</span>`;
      } else if (touched && bt.length) {
        gm = value === goal.value ? `The value is ${show(value)}, but that uses ${bt.length} tile${s1(bt.length)}. Add or remove zero pairs: this changes the number of tiles without changing the value.`
          : bt.length === goal.total ? `That is ${goal.total} tiles, but their value is ${show(value)}.` : '';
      }
      q('#it-goal-msg').innerHTML = gm;
      q('#it-solved').textContent = solved ? `Solved: ${solved}` : '';
      const link = `#/integers/build${chal > 1 ? '/' + chal : ''}`;
      if (location.hash !== link) history.replaceState(null, '', link);          // not on every tile: browsers ignore a page that rewrites its address too often
      root.__integers = { op: 'build', pos: P.length, neg: N.length, value, goal, solved, done };
      H.tutorCtx({ notes: `The student is on the integer tiles free mat: ${P.length} + tiles and ${N.length} − tiles, worth ${value}. Their challenge: show ${goal.value} using exactly ${goal.total} tiles (so it needs zero pairs). Give hints about zero pairs; don't just give the answer.` });
    }
    function act(a) {
      const P = bt.filter(x => x.s > 0).length, N = bt.length - P;
      const drop = s => { for (let i = bt.length - 1; i >= 0; i--) if (bt[i].s === s) { bt.splice(i, 1); return; } };
      const full = s => (s > 0 ? P : N) >= 30;
      let msg = '';
      if (a === 'p' || a === 'n') { const s = a === 'p' ? 1 : -1; if (full(s)) msg = 'The mat is full. Remove some tiles first.'; else bt.push({ id: 't' + nextId++, s }); }
      else if (a === 'zp') { if (full(1) || full(-1)) msg = 'The mat is full. Remove some tiles first.'; else bt.push({ id: 't' + nextId++, s: 1 }, { id: 't' + nextId++, s: -1 }); }
      else if (a === 'tp' || a === 'tn') {
        const s = a === 'tp' ? 1 : -1;
        if (s > 0 ? P : N) drop(s); else msg = `There is no ${s > 0 ? '+' : '−'} tile to remove. Add a zero pair first, then remove its ${s > 0 ? '+' : '−'} tile.`;
      } else if (a === 'rz') { if (P && N) { drop(1); drop(-1); } else msg = 'There are no zero pairs on the mat.'; }
      else if (a === 'clear') bt = [];
      touch(); drawBuild(msg);
    }

    wrap.addEventListener('input', ev => {
      const el = ev.target;
      if (el.dataset.i === undefined || !bodyEl.contains(el)) return;
      touch();
      vals[Number(el.dataset.i)] = read(el.value);
      clearTimeout(t); t = setTimeout(() => render(true), 150);
    });
    wrap.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b || !wrap.contains(b) || b.disabled) return;
      if (b.dataset.op) {
        if (b.dataset.op === o) return;
        const was = o;
        o = b.dataset.op;
        if (o !== 'build') { const tryIt = OPS[was] ? solve(o, vals) : null; if (!tryIt || tryIt.error || !tryIt.steps) vals = OPS[o].f.slice(); }
        setup(); return;
      }
      if (b.dataset.act) return act(b.dataset.act);
      if (b.dataset.flip !== undefined) { const i = Number(b.dataset.flip); if (Number.isFinite(vals[i])) { vals[i] = -vals[i] || 0; q('#it-f' + i).value = show(vals[i]); touch(); render(true); } return; }
      if (b.dataset.step !== undefined) { touch(); go(Number(b.dataset.step)); q('#it-mat svg').focus({ preventScroll: true }); return; }
      if (b.id === 'it-next') { touch(); go(step + 1); }
      else if (b.id === 'it-back') { touch(); go(step - 1); }
      else if (b.id === 'it-again') { touch(); go(0); }
      else if (b.id === 'it-rand') { touch(); another(); }
      else if (b.id === 'it-new') { chal++; done = false; bt = []; drawBuild(''); }
    });
    wrap.addEventListener('keydown', ev => {
      if (o === 'build' || !ev.target.classList || !ev.target.classList.contains('it-svg')) return;
      const k = { ArrowRight: step + 1, ArrowDown: step + 1, ArrowLeft: step - 1, ArrowUp: step - 1, Home: 0, End: 1e9 }[ev.key];
      if (k === undefined) return;
      ev.preventDefault(); touch(); go(k);
    });
    setup();
  }

  const INTEGERS = { page, solve, OPS };
  window.INTEGERS = INTEGERS;
})();
