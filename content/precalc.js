/* Precalculus. Composite and inverse functions, trigonometry, complex numbers, rational functions,
   conic sections, vectors, matrices, probability and combinatorics, and series. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v;
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = s => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const X = V('x'), Y = V('y'), I = V('i'), TH = V('θ');
  const wrap = x => x < 0 ? `(${N(x)})` : N(x);
  const sfrac = (num, den) => `<span class="frac"><span class="num">${num}</span><span class="den">${den}</span></span>`;
  const fn = (name, arg) => `${V(name)}(${arg})`;
  const DEG = Math.PI / 180;
  const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1e-9 : tol);
  const key = s => A.normText(A.stripTags(s));
  /** the first k candidates that read differently from `answer` and from each other */
  function distinct(answer, cands, k) {
    const seen = new Set([key(answer)]), out = [];
    for (const c of cands) {
      const kk = key(c);
      if (!seen.has(kk)) { seen.add(kk); out.push(c); }
      if (out.length === k) break;
    }
    return out;
  }
  /** an angle given in twelfths of π, written the way a textbook does: 0, π/6, 5π/4, −π/3 */
  function rad(k) {
    if (k === 0) return '0';
    const [n, d] = M.simp(k, 12);
    return (n < 0 ? '−' : '') + (Math.abs(n) === 1 ? '' : Math.abs(n)) + 'π' + (d === 1 ? '' : '/' + d);
  }
  /** a matrix as a plain HTML table with bracket-like side rules */
  const mat = rows => `<table class="matrix" style="display:inline-table;border-collapse:separate;border-spacing:0;border-left:2px solid currentColor;border-right:2px solid currentColor;border-radius:4px;vertical-align:middle;margin:2px 4px"><tbody>${rows.map(r => `<tr>${r.map(c => `<td style="padding:3px 10px;text-align:center">${typeof c === 'number' ? N(c) : c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const vec = (a, b) => `⟨${typeof a === 'number' ? N(a) : a}, ${typeof b === 'number' ? N(b) : b}⟩`;
  /** "(x − 3)", "(x + 2)" or just "x" */
  const shift = (v, h) => h === 0 ? V(v) : `(${V(v)} ${h > 0 ? '−' : '+'} ${N(Math.abs(h))})`;
  const shift2 = (v, h) => M.sup(shift(v, h), 2);
  /** evaluate polynomial coefficients (highest power first) at x */
  const evalP = (c, x) => c.reduce((s, ci) => s * x + ci, 0);
  /** "3(−2)² − 4(−2) + 1": the polynomial with the number substituted, for hints */
  function subst(c, x) {
    const deg = c.length - 1;
    let out = '';
    c.forEach((ci, i) => {
      if (ci === 0) return;
      const pw = deg - i, mag = Math.abs(ci);
      const body = pw === 0 ? N(mag) : (mag === 1 ? '' : N(mag)) + `(${N(x)})` + (pw > 1 ? `<sup>${pw}</sup>` : '');
      out += out === '' ? (ci < 0 ? '−' : '') + body : (ci < 0 ? ' − ' : ' + ') + body;
    });
    return out || '0';
  }
  const fact = n => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };
  const nCr = (n, r) => { let c = 1; for (let i = 1; i <= r; i++) c = c * (n - r + i) / i; return Math.round(c); };
  const nPr = (n, r) => { let c = 1; for (let i = 0; i < r; i++) c *= n - i; return c; };
  const popcount = m => { let c = 0; while (m) { c += m & 1; m >>= 1; } return c; };

  A.course({
    id: 'precalculus', title: 'Precalculus', subject: 'High school', grade: 12, icon: '∫', hue: 345,
    blurb: 'Composite and inverse functions, trigonometry, complex numbers, rational functions, conic sections, vectors, matrices, probability and combinatorics, and series.',
    units: [
      { id: 'composite-inverse', title: 'Composite and inverse functions', blurb: 'Feeding one function into another, and running a function backwards.', skills: ['pre.composite-functions', 'pre.inverse-functions'] },
      { id: 'trigonometry', title: 'Trigonometry', blurb: 'Inverse trig values, the laws of sines and cosines, identities, and trig equations.', skills: ['pre.inverse-trig', 'pre.law-of-sines-cosines', 'pre.trig-identities', 'pre.trig-equations'] },
      { id: 'complex', title: 'Complex numbers', blurb: 'Modulus, argument and polar form, and multiplying in polar form.', skills: ['pre.complex-polar-form', 'pre.multiply-polar'] },
      { id: 'rational', title: 'Rational functions', blurb: 'Vertical asymptotes, holes, and end behavior.', skills: ['pre.rational-asymptotes-holes', 'pre.rational-end-behavior'] },
      { id: 'conics', title: 'Conic sections', blurb: 'Telling the conics apart, and reading the features of ellipses, hyperbolas and parabolas.', skills: ['pre.identify-conics', 'pre.conic-features'] },
      { id: 'vectors', title: 'Vectors', blurb: 'Components, magnitude and unit vectors; adding, scaling and the dot product.', skills: ['pre.vector-components', 'pre.vector-operations'] },
      { id: 'matrices', title: 'Matrices', blurb: 'Adding and scaling, multiplying, determinants and inverses.', skills: ['pre.matrix-add-scale', 'pre.matrix-multiply', 'pre.determinant-inverse'] },
      { id: 'probability', title: 'Probability and combinatorics', blurb: 'Counting arrangements and selections, and the probability of compound events.', skills: ['pre.permutations-combinations', 'pre.compound-probability'] },
      { id: 'series', title: 'Series', blurb: 'Sums of arithmetic and geometric sequences, sigma notation, and infinite geometric series.', skills: ['pre.finite-series', 'pre.infinite-geometric-series'] },
    ],
  });

  /* ---------- Unit 1: Composite and inverse functions ---------- */
  A.skill({
    id: 'pre.composite-functions', title: 'Evaluating composite functions',
    learn: p(`A composite function feeds the output of one function into another. ${fn('f', fn('g', X))}, also written (${V('f')} ∘ ${V('g')})(${X}), means “do ${V('g')} first, then do ${V('f')} to the result.”`) +
      p(`<b>Work from the inside out: evaluate the inner function first, then use that output as the input of the outer function.</b> Order matters: ${fn('f', fn('g', 2))} and ${fn('g', fn('f', 2))} are usually different numbers.`) +
      example('Example', `${fn('f', X)} = 2${X} + 1 and ${fn('g', X)} = ${X}² − 3. Find ${fn('f', fn('g', 4))}.<br>Inside first: ${fn('g', 4)} = 16 − 3 = 13. Then ${fn('f', 13)} = 2(13) + 1 = <b>27</b>.`),
    make(rng) {
      const quadF = rng.bool();
      const f = quadF ? [rng.nz(-3, 3), rng.int(-5, 5), rng.int(-9, 9)] : [rng.nz(-5, 5), rng.nz(-9, 9)];
      const g = quadF || rng.bool() ? [rng.nz(-5, 5), rng.nz(-9, 9)] : [rng.nz(-2, 2), rng.int(-4, 4), rng.int(-6, 6)];
      const order = rng.pick(['fg', 'gf', 'fg']);
      const k = rng.int(-4, 4);
      const [outer, inner, on, inn] = order === 'fg' ? [f, g, 'f', 'g'] : [g, f, 'g', 'f'];
      const mid = evalP(inner, k), ans = evalP(outer, mid);
      return {
        prompt: `${fn('f', X)} = ${M.poly(f)} and ${fn('g', X)} = ${M.poly(g)}.${big(`${fn(on, fn(inn, N(k)))} = ?`)}`,
        type: 'number', answer: ans, params: { f, g, order, k },
        hints: [`Work from the inside out: find ${fn(inn, N(k))} first.`,
          `${fn(inn, N(k))} = ${subst(inner, k)} = ${N(mid)}.`,
          `Now put ${N(mid)} into ${V(on)}: ${fn(on, N(mid))} = ${subst(outer, mid)}.`,
          `So ${fn(on, fn(inn, N(k)))} = <b>${N(ans)}</b>.`],
      };
    },
    verify(q) {
      const { f, g, order, k } = q.params;
      const ev = (c, x) => c.map((ci, i) => ci * Math.pow(x, c.length - 1 - i)).reduce((a, b) => a + b, 0);
      const v = order === 'fg' ? ev(f, ev(g, k)) : ev(g, ev(f, k));
      return near(v, q.answer);
    },
  });

  /* options for an inverse question: each is { html, fn } and the first is the true inverse */
  function inverseOptions(p) {
    const { kind, a, b } = p;
    if (kind === 'linear') return [
      { html: sfrac(`${X} ${M.signed(-b)}`, N(a)), fn: t => (t - b) / a },
      { html: sfrac(`${X} ${M.signed(b)}`, N(a)), fn: t => (t + b) / a },
      { html: `${sfrac(X, N(a))} ${M.signed(-b)}`, fn: t => t / a - b },
      { html: sfrac('1', `${M.term(a, 'x')} ${M.signed(b)}`), fn: t => 1 / (a * t + b) },
    ];
    if (kind === 'cube') return [
      { html: `∛(${X} ${M.signed(-b)})`, fn: t => Math.cbrt(t - b) },
      { html: `∛(${X} ${M.signed(b)})`, fn: t => Math.cbrt(t + b) },
      { html: `${X}³ ${M.signed(-b)}`, fn: t => t * t * t - b },
      { html: `(${X} ${M.signed(-b)})³`, fn: t => Math.pow(t - b, 3) },
    ];
    // f(x) = (x + a)/(x − b)  →  f⁻¹(x) = (bx + a)/(x − 1)
    return [
      { html: sfrac(`${M.term(b, 'x')} ${M.signed(a)}`, `${X} − 1`), fn: t => (b * t + a) / (t - 1) },
      { html: sfrac(`${X} ${M.signed(-b)}`, `${X} ${M.signed(a)}`), fn: t => (t - b) / (t + a) },
      { html: sfrac(`${M.term(b, 'x')} ${M.signed(-a)}`, `${X} − 1`), fn: t => (b * t - a) / (t - 1) },
      { html: sfrac(`${M.term(a, 'x')} ${M.signed(b)}`, `${X} − 1`), fn: t => (a * t + b) / (t - 1) },
    ];
  }
  const inverseForward = ({ kind, a, b }) => kind === 'linear' ? t => a * t + b : kind === 'cube' ? t => t * t * t + b : t => (t + a) / (t - b);
  const inverseRule = ({ kind, a, b }) => kind === 'linear' ? M.poly([a, b]) : kind === 'cube' ? `${X}³ ${M.signed(b)}` : sfrac(`${X} ${M.signed(a)}`, `${X} ${M.signed(-b)}`);

  A.skill({
    id: 'pre.inverse-functions', title: 'Finding inverse functions',
    learn: p(`The inverse of ${V('f')}, written ${M.sup(V('f'), '−1')}, undoes ${V('f')}: if ${V('f')} sends 3 to 10, then ${M.sup(V('f'), '−1')} sends 10 back to 3. So ${fn('f', fn(M.sup('f', '−1'), X))} = ${X}.`) +
      p(`<b>To find an inverse: write ${Y} = ${fn('f', X)}, swap ${X} and ${Y}, then solve for ${Y}.</b> Undo the operations of ${V('f')} in reverse order. To find a single value ${fn(M.sup('f', '−1'), V('k'))}, you can instead solve ${fn('f', X)} = ${V('k')}.`) +
      example('Example', `${fn('f', X)} = 3${X} − 5. Swap: ${X} = 3${Y} − 5. Add 5: ${X} + 5 = 3${Y}. Divide by 3: <b>${fn(M.sup('f', '−1'), X)} = ${sfrac(`${X} + 5`, '3')}</b>.`),
    make(rng) {
      const kind = rng.pick(['linear', 'linear', 'cube', 'rational', 'value']);
      const finv = fn(M.sup('f', '−1'), X);
      if (kind === 'value') {
        const a = rng.pick([2, 3, 4, 5, -2, -3, -4]), b = rng.nz(-9, 9), m = rng.int(-6, 6), k = a * m + b;
        return { prompt: `${fn('f', X)} = ${M.poly([a, b])}.${big(`${fn(M.sup('f', '−1'), N(k))} = ?`)}`, type: 'number', answer: m, params: { kind, a, b, k },
          hints: [`${fn(M.sup('f', '−1'), N(k))} is the input that makes ${V('f')} give ${N(k)}. Solve ${M.poly([a, b])} = ${N(k)}.`,
            `${b < 0 ? 'Add' : 'Subtract'} ${N(Math.abs(b))}: ${M.term(a, 'x')} = ${N(k - b)}.`,
            `Divide by ${N(a)}: ${X} = <b>${N(m)}</b>.`] };
      }
      const a = kind === 'linear' ? rng.pick([2, 3, 4, 5, 6, -2, -3, -4, -5]) : rng.nz(-6, 6);
      let b = rng.nz(-9, 9);
      if (kind === 'rational') { while (b === 1 || b === -a || b === a) b = rng.nz(-6, 6); }
      const params = { kind, a, b };
      const opts = inverseOptions(params);
      const steps = kind === 'linear'
        ? [`Swap: ${X} = ${M.term(a, 'y')} ${M.signed(b)}.`, `${b < 0 ? 'Add' : 'Subtract'} ${N(Math.abs(b))}: ${X} ${M.signed(-b)} = ${M.term(a, 'y')}. Then divide by ${N(a)}.`]
        : kind === 'cube'
          ? [`Swap: ${X} = ${Y}³ ${M.signed(b)}.`, `${b < 0 ? 'Add' : 'Subtract'} ${N(Math.abs(b))} first, then take the cube root of both sides (undo in reverse order).`]
          : [`Swap and clear the fraction: ${X}(${Y} ${M.signed(-b)}) = ${Y} ${M.signed(a)}, so ${X}${Y} ${M.signed(-b)}${X} = ${Y} ${M.signed(a)}.`, `Gather the ${Y} terms: ${X}${Y} − ${Y} = ${M.term(b, 'x')} ${M.signed(a)}, so ${Y}(${X} − 1) = ${M.term(b, 'x')} ${M.signed(a)}. Divide by ${X} − 1.`];
      return {
        prompt: `Find the inverse of${big(`${fn('f', X)} = ${inverseRule(params)}`)}`,
        type: 'choice', answer: `${finv} = ${opts[0].html}`, choices: opts.map(o => `${finv} = ${o.html}`), params,
        hints: [`Write ${Y} = ${inverseRule(params)}, then swap ${X} and ${Y}.`, ...steps, `<b>${finv} = ${opts[0].html}</b>.`],
      };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'value') { const f = inverseForward({ kind: 'linear', a: p.a, b: p.b }); return near(f(q.answer), p.k); }
      const f = inverseForward(p), opts = inverseOptions(p);
      const good = opts.filter(o => [2.5, 3.7, -1.3, 7.1].every(t => near(f(o.fn(t)), t, 1e-7)));
      return good.length === 1 && q.answer.endsWith(good[0].html);
    },
  });

  /* ---------- Unit 2: Trigonometry ---------- */
  const SPECIAL = [   // value, html, for sine/cosine
    [-1, '−1'], [-Math.sqrt(3) / 2, '−' + F(M.sqrt(3), 2)], [-Math.SQRT2 / 2, '−' + F(M.sqrt(2), 2)], [-0.5, '−' + F(1, 2)], [0, '0'],
    [0.5, F(1, 2)], [Math.SQRT2 / 2, F(M.sqrt(2), 2)], [Math.sqrt(3) / 2, F(M.sqrt(3), 2)], [1, '1']];
  const SPECIAL_TAN = [[-Math.sqrt(3), '−' + M.sqrt(3)], [-1, '−1'], [-Math.sqrt(3) / 3, '−' + F(M.sqrt(3), 3)], [0, '0'], [Math.sqrt(3) / 3, F(M.sqrt(3), 3)], [1, '1'], [Math.sqrt(3), M.sqrt(3)]];
  const TRIG = { sin: Math.sin, cos: Math.cos, tan: Math.tan };
  /** angles k·π/12 in [0, 2π) with f(angle) = v, found by checking every twelfth */
  const twelfths = (f, v) => { const out = []; for (let k = 0; k < 24; k++) if (near(TRIG[f](k * Math.PI / 12), v, 1e-9)) out.push(k); return out; };

  A.skill({
    id: 'pre.inverse-trig', title: 'Evaluating inverse trig functions',
    learn: p(`sin, cos and tan repeat, so to undo them each inverse gives just one angle, from a fixed range. <b>arcsin and arctan give angles from −π/2 to π/2; arccos gives angles from 0 to π.</b>`) +
      p(`To evaluate, ask “which angle in the range has this sine (cosine, tangent)?” Use the unit-circle values: sin π/6 = 1/2, sin π/4 = √2/2, sin π/3 = √3/2, and so on. A negative input to arcsin or arctan gives a negative angle; a negative input to arccos gives an angle in the second quadrant.`) +
      example('Example', `${big(`arccos(−${F(1, 2)})`)}cos π/3 = 1/2, and arccos must land between 0 and π, so take the second-quadrant angle: π − π/3 = <b>2π/3</b>. (−π/3 has the wrong range, and 4π/3 is too big.)`),
    make(rng) {
      const f = rng.pick(['sin', 'cos', 'tan']);
      const [v, html] = rng.pick(f === 'tan' ? SPECIAL_TAN : SPECIAL);
      const inv = { sin: Math.asin, cos: Math.acos, tan: Math.atan }[f];
      const ans = Math.round(inv(v) * 12 / Math.PI);           // in twelfths of π
      const outside = f === 'sin' ? (ans >= 0 ? 12 - ans : 24 + ans) : f === 'cos' ? -ans : ans + 12;
      const swapRef = f === 'cos' ? 6 - ans : Math.sign(ans) * (6 - Math.abs(ans));   // mixing up π/6 and π/3 (sine with cosine)
      const cands = [-ans, outside, swapRef, 12 - ans, ans + 12, 6, -6, 2, 4, 8].map(rad);
      const wrong = distinct(rad(ans), cands, 3);
      const range = f === 'cos' ? '0 to π' : '−π/2 to π/2';
      return {
        prompt: `Evaluate. Give the answer in radians.${big(`arc${f}(${html})`)}`,
        type: 'choice', answer: rad(ans), choices: [rad(ans), ...wrong], params: { f, v },
        hints: [`arc${f} gives an angle from ${range}.`,
          `Which angle in that range has ${f} equal to ${html}? Start from the reference angle in the first quadrant.`,
          `${f} ${rad(ans)} = ${html}, and ${rad(ans)} is in the range, so arc${f}(${html}) = <b>${rad(ans)}</b>.`],
      };
    },
    verify(q) {
      const { f, v } = q.params;
      const inv = { sin: Math.asin, cos: Math.acos, tan: Math.atan }[f](v);
      const m = q.answer.match(/^(−?)(\d*)(π)?(?:\/(\d+))?$/);
      if (!m) return 'unparsed ' + q.answer;
      const val = q.answer === '0' ? 0 : (m[1] ? -1 : 1) * (m[2] ? Number(m[2]) : 1) * Math.PI / (m[4] ? Number(m[4]) : 1);
      return near(val, inv, 1e-9);
    },
  });

  A.skill({
    id: 'pre.law-of-sines-cosines', title: 'The law of sines and the law of cosines',
    learn: p(`In any triangle ${V('ABC')}, side ${V('a')} is opposite angle ${V('A')}, side ${V('b')} opposite ${V('B')}, and side ${V('c')} opposite ${V('C')}.`) +
      p(`<b>Law of sines:</b> ${sfrac(V('a'), 'sin ' + V('A'))} = ${sfrac(V('b'), 'sin ' + V('B'))} = ${sfrac(V('c'), 'sin ' + V('C'))}. Use it when you know an angle and the side opposite it. <b>Law of cosines:</b> ${V('c')}² = ${V('a')}² + ${V('b')}² − 2${V('ab')} cos ${V('C')}. Use it for two sides and the angle between them, or for all three sides.`) +
      p('Keep your calculator in degree mode, and round only at the end.') +
      example('Example', `${V('a')} = 8, ${V('b')} = 11, ${V('C')} = 40°. Find ${V('c')}.<br>${V('c')}² = 64 + 121 − 2(8)(11) cos 40° ≈ 185 − 134.8 = 50.2, so ${V('c')} ≈ <b>7.1</b>.`),
    make(rng) {
      const kind = rng.pick(['sinSide', 'sinAngle', 'cosSide', 'cosAngle']);
      const r1 = x => M.round(x, 1);
      let prompt, ans, hints, params;
      if (kind === 'sinSide') {
        const Aa = rng.int(25, 80), Bb = rng.int(25, Math.min(100, 160 - Aa)), a = rng.int(5, 30);
        const raw = a * Math.sin(Bb * DEG) / Math.sin(Aa * DEG); ans = r1(raw); params = { kind, Aa, Bb, a };
        prompt = `In triangle ${V('ABC')}, ${V('A')} = ${Aa}°, ${V('B')} = ${Bb}°, and ${V('a')} = ${a}. Find ${V('b')}, rounded to the nearest tenth.`;
        hints = [`You know angle ${V('A')} and its opposite side ${V('a')}, so use the law of sines: ${sfrac(V('b'), `sin ${Bb}°`)} = ${sfrac(a, `sin ${Aa}°`)}.`, `Multiply both sides by sin ${Bb}°: ${V('b')} = ${sfrac(`${a} sin ${Bb}°`, `sin ${Aa}°`)} = ${sfrac(N(M.round(a * Math.sin(Bb * DEG), 4)), N(M.round(Math.sin(Aa * DEG), 4)))}.`, `${V('b')} ≈ <b>${N(ans)}</b>.`];
      } else if (kind === 'sinAngle') {
        const Aa = rng.int(30, 80), a = rng.int(10, 30), b = rng.int(4, a - 2);
        const s = b * Math.sin(Aa * DEG) / a; ans = r1(Math.asin(s) / DEG); params = { kind, Aa, a, b };
        prompt = `In triangle ${V('ABC')}, ${V('A')} = ${Aa}°, ${V('a')} = ${a}, and ${V('b')} = ${b}. Angle ${V('B')} is acute. Find ${V('B')} in degrees, rounded to the nearest tenth.`;
        hints = [`Law of sines with the angles on top: ${sfrac(`sin ${V('B')}`, b)} = ${sfrac(`sin ${Aa}°`, a)}.`, `sin ${V('B')} = ${sfrac(`${b} sin ${Aa}°`, a)} ≈ ${N(M.round(s, 4))}.`, `${V('B')} = arcsin(${N(M.round(s, 4))}) ≈ <b>${N(ans)}°</b>.`];
      } else if (kind === 'cosSide') {
        const a = rng.int(4, 20), b = rng.int(4, 20), Cc = rng.int(20, 140);
        const c2 = a * a + b * b - 2 * a * b * Math.cos(Cc * DEG); ans = r1(Math.sqrt(c2)); params = { kind, a, b, Cc };
        prompt = `In triangle ${V('ABC')}, ${V('a')} = ${a}, ${V('b')} = ${b}, and ${V('C')} = ${Cc}°. Find ${V('c')}, rounded to the nearest tenth.`;
        hints = [`You know two sides and the angle between them, so use the law of cosines: ${V('c')}² = ${V('a')}² + ${V('b')}² − 2${V('ab')} cos ${V('C')}.`, `${V('c')}² = ${a * a} + ${b * b} − 2(${a})(${b}) cos ${Cc}° ≈ ${N(M.round(c2, 2))}.`, `${V('c')} = ${M.sqrt(N(M.round(c2, 2)))} ≈ <b>${N(ans)}</b>.`];
      } else {
        let a, b, c;
        do { a = rng.int(4, 18); b = rng.int(4, 18); c = rng.int(4, 18); } while (c >= a + b || a >= b + c || b >= a + c || c === a && c === b);
        const cosC = (a * a + b * b - c * c) / (2 * a * b); ans = r1(Math.acos(cosC) / DEG); params = { kind, a, b, c };
        prompt = `A triangle has sides ${V('a')} = ${a}, ${V('b')} = ${b}, and ${V('c')} = ${c}. Find angle ${V('C')}, opposite side ${V('c')}, in degrees, rounded to the nearest tenth.`;
        hints = [`Three sides: use the law of cosines and solve for the angle: cos ${V('C')} = ${sfrac(`${V('a')}² + ${V('b')}² − ${V('c')}²`, `2${V('ab')}`)}.`, `cos ${V('C')} = ${sfrac(`${a * a} + ${b * b} − ${c * c}`, `2(${a})(${b})`)} = ${F(a * a + b * b - c * c, 2 * a * b)} ≈ ${N(M.round(cosC, 4))}.`, `${V('C')} = arccos(${N(M.round(cosC, 4))}) ≈ <b>${N(ans)}°</b>.`];
      }
      return { prompt, type: 'number', answer: ans, tolerance: 0.05, unit: kind === 'sinAngle' || kind === 'cosAngle' ? '°' : undefined, hints, params };
    },
    verify(q) {
      const p = q.params, tol = 0.051;
      if (p.kind === 'sinSide') {           // find c by the law of sines, then b by the law of cosines
        const Cc = 180 - p.Aa - p.Bb, c = p.a * Math.sin(Cc * DEG) / Math.sin(p.Aa * DEG);
        return near(Math.sqrt(p.a * p.a + c * c - 2 * p.a * c * Math.cos(p.Bb * DEG)), q.answer, tol);
      }
      if (p.kind === 'sinAngle') {          // brute force the acute angle B that fits a/sin A = b/sin B
        let best = 0, err = Infinity;
        for (let B = 0; B <= 90; B += 0.001) { const e = Math.abs(p.a * Math.sin(B * DEG) - p.b * Math.sin(p.Aa * DEG)); if (e < err) { err = e; best = B; } }
        return near(best, q.answer, tol);
      }
      if (p.kind === 'cosSide') {           // coordinates: C at the origin, B along the x-axis
        const Bp = [p.a, 0], Ap = [p.b * Math.cos(p.Cc * DEG), p.b * Math.sin(p.Cc * DEG)];
        return near(Math.hypot(Bp[0] - Ap[0], Bp[1] - Ap[1]), q.answer, tol);
      }
      const s = (p.a + p.b + p.c) / 2, K = Math.sqrt(s * (s - p.a) * (s - p.b) * (s - p.c));   // Heron
      let C = Math.asin(Math.min(1, 2 * K / (p.a * p.b))) / DEG;
      if (p.c * p.c > p.a * p.a + p.b * p.b) C = 180 - C;
      return near(C, q.answer, tol);
    },
  });

  /* Simplifying trig expressions: each item is [expression HTML, expression as a function, answer, three wrong answers, the step] */
  const T = { s: Math.sin, c: Math.cos, t: Math.tan };
  const IDOPT = {
    '1': () => 1, '−1': () => -1, '2': () => 2,
    'sin θ': t => T.s(t), 'cos θ': t => T.c(t), 'tan θ': t => T.t(t), 'sec θ': t => 1 / T.c(t), 'csc θ': t => 1 / T.s(t), 'cot θ': t => 1 / T.t(t),
    '−sin θ': t => -T.s(t), '−cos θ': t => -T.c(t), '2 sin θ': t => 2 * T.s(t), '2 cos θ': t => 2 * T.c(t),
    'sin²θ': t => T.s(t) ** 2, 'cos²θ': t => T.c(t) ** 2, 'tan²θ': t => T.t(t) ** 2, 'sec²θ': t => T.c(t) ** -2, 'csc²θ': t => T.s(t) ** -2, 'cot²θ': t => T.t(t) ** -2,
    'cos 2θ': t => T.c(2 * t), 'sin 2θ': t => T.s(2 * t),
  };
  const th = s => s.replace(/θ/g, TH);
  const IDENTITIES = [
    ['1 − cos²θ', t => 1 - T.c(t) ** 2, 'sin²θ', ['cos²θ', 'tan²θ', '1'], 'From sin²θ + cos²θ = 1, subtract cos²θ from both sides.'],
    ['1 − sin²θ', t => 1 - T.s(t) ** 2, 'cos²θ', ['sin²θ', 'cot²θ', '1'], 'From sin²θ + cos²θ = 1, subtract sin²θ from both sides.'],
    ['1 + tan²θ', t => 1 + T.t(t) ** 2, 'sec²θ', ['csc²θ', 'cot²θ', 'cos²θ'], 'Divide sin²θ + cos²θ = 1 by cos²θ: tan²θ + 1 = sec²θ.'],
    ['1 + cot²θ', t => 1 + T.t(t) ** -2, 'csc²θ', ['sec²θ', 'tan²θ', 'sin²θ'], 'Divide sin²θ + cos²θ = 1 by sin²θ: 1 + cot²θ = csc²θ.'],
    ['sec²θ − tan²θ', t => T.c(t) ** -2 - T.t(t) ** 2, '1', ['−1', '2', 'cot²θ'], 'Rearrange 1 + tan²θ = sec²θ: sec²θ − tan²θ = 1.'],
    ['tan θ cos θ', t => T.t(t) * T.c(t), 'sin θ', ['cos θ', 'sin²θ', 'cot θ'], `Write tan θ as ${sfrac('sin θ', 'cos θ')}; the cos θ cancels.`],
    ['sin θ cot θ', t => T.s(t) / T.t(t), 'cos θ', ['sin θ', 'tan θ', 'cos²θ'], `Write cot θ as ${sfrac('cos θ', 'sin θ')}; the sin θ cancels.`],
    [sfrac('1 − cos²θ', 'sin θ'), t => (1 - T.c(t) ** 2) / T.s(t), 'sin θ', ['cos θ', 'sin²θ', 'csc θ'], `The top is sin²θ, and ${sfrac('sin²θ', 'sin θ')} = sin θ.`],
    ['cos²θ − sin²θ', t => T.c(t) ** 2 - T.s(t) ** 2, 'cos 2θ', ['sin 2θ', '1', '2 cos θ'], 'This is the double-angle formula cos 2θ = cos²θ − sin²θ.'],
    ['2 sin θ cos θ', t => 2 * T.s(t) * T.c(t), 'sin 2θ', ['cos 2θ', 'sin²θ', '1'], 'This is the double-angle formula sin 2θ = 2 sin θ cos θ.'],
    ['sec θ cos θ', t => T.c(t) / T.c(t), '1', ['cos²θ', 'tan θ', '−1'], `sec θ = ${sfrac('1', 'cos θ')}, so the product is ${sfrac('cos θ', 'cos θ')}.`],
    [sfrac('tan θ', 'sec θ'), t => T.t(t) * T.c(t), 'sin θ', ['cos θ', 'csc θ', 'sin²θ'], `${sfrac('sin θ', 'cos θ')} ÷ ${sfrac('1', 'cos θ')} = ${sfrac('sin θ', 'cos θ')} × cos θ.`],
    ['csc θ tan θ', t => T.t(t) / T.s(t), 'sec θ', ['cot θ', 'cos θ', 'sin θ'], `${sfrac('1', 'sin θ')} × ${sfrac('sin θ', 'cos θ')}: the sin θ cancels, leaving ${sfrac('1', 'cos θ')}.`],
    [sfrac('sec²θ − 1', 'tan θ'), t => (T.c(t) ** -2 - 1) / T.t(t), 'tan θ', ['cot θ', 'sec θ', '1'], 'The top is tan²θ (from 1 + tan²θ = sec²θ), and tan²θ ÷ tan θ = tan θ.'],
    ['sin(−θ)', t => T.s(-t), '−sin θ', ['sin θ', 'cos θ', '−cos θ'], 'Sine is an odd function: sin(−θ) = −sin θ.'],
    ['cos(−θ)', t => T.c(-t), 'cos θ', ['−cos θ', 'sin θ', '−sin θ'], 'Cosine is an even function: cos(−θ) = cos θ.'],
    [`sin(${sfrac('π', '2')} − θ)`, t => T.s(Math.PI / 2 - t), 'cos θ', ['sin θ', '−cos θ', '−sin θ'], 'Cofunction identity: the sine of the complement is the cosine.'],
    ['1 − 2 sin²θ', t => 1 - 2 * T.s(t) ** 2, 'cos 2θ', ['sin 2θ', 'cos²θ', '1'], 'One form of the double-angle formula is cos 2θ = 1 − 2 sin²θ.'],
    ['cot θ sec θ', t => 1 / T.t(t) / T.c(t), 'csc θ', ['sec θ', 'sin θ', 'tan θ'], `${sfrac('cos θ', 'sin θ')} × ${sfrac('1', 'cos θ')} = ${sfrac('1', 'sin θ')}.`],
    ['(sin θ + cos θ)² − 1', t => (T.s(t) + T.c(t)) ** 2 - 1, 'sin 2θ', ['cos 2θ', '2 cos θ', '2 sin θ'], 'Expand: sin²θ + 2 sin θ cos θ + cos²θ − 1. The squares add to 1, leaving 2 sin θ cos θ.'],
  ];

  A.skill({
    id: 'pre.trig-identities', title: 'Using trig identities',
    learn: p(`An identity is an equation that is true for every angle. The ones you use most are the <b>Pythagorean identities</b> sin²${TH} + cos²${TH} = 1, 1 + tan²${TH} = sec²${TH} and 1 + cot²${TH} = csc²${TH}; the <b>quotient and reciprocal identities</b> tan ${TH} = ${sfrac('sin ' + TH, 'cos ' + TH)}, sec ${TH} = ${sfrac('1', 'cos ' + TH)}; and the <b>double-angle formulas</b> sin 2${TH} = 2 sin ${TH} cos ${TH}, cos 2${TH} = cos²${TH} − sin²${TH}.`) +
      p('To simplify, rewrite everything in terms of sine and cosine, cancel what you can, and look for one of the patterns above.') +
      example('Example', `${big(`sec ${TH} − sin ${TH} tan ${TH}`)}In sines and cosines: ${sfrac('1', 'cos ' + TH)} − ${sfrac('sin²' + TH, 'cos ' + TH)} = ${sfrac('1 − sin²' + TH, 'cos ' + TH)} = ${sfrac('cos²' + TH, 'cos ' + TH)} = <b>cos ${TH}</b>.`),
    make(rng) {
      const idx = rng.int(0, IDENTITIES.length - 1);
      const [expr, , ans, wrong, why] = IDENTITIES[idx];
      return {
        prompt: `Simplify.${big(th(expr))}`, type: 'choice', answer: th(ans), choices: [ans, ...wrong].map(th), params: { idx },
        hints: ['Rewrite in terms of sine and cosine, or look for a Pythagorean or double-angle pattern.', th(why), `So ${th(expr)} = <b>${th(ans)}</b>.`],
      };
    },
    verify(q) {
      const [, f, , wrong] = IDENTITIES[q.params.idx];
      const ts = [0.3, 0.7, 1.1, 2.3];
      const same = k => ts.every(t => near(IDOPT[k](t), f(t), 1e-9));
      const right = Object.keys(IDOPT).find(k => th(k) === q.answer);
      return !!right && same(right) && wrong.every(k => !same(k));
    },
  });

  /* trig equations: [value, value HTML, a linear equation that has this value (or null)]; ${'$'}F marks the function */
  const EQ_SINCOS = [
    [0.5, F(1, 2), '2 $F − 1 = 0'], [-0.5, '−' + F(1, 2), '2 $F + 1 = 0'], [Math.sqrt(3) / 2, F(M.sqrt(3), 2), `2 $F − ${M.sqrt(3)} = 0`],
    [-Math.sqrt(3) / 2, '−' + F(M.sqrt(3), 2), `2 $F + ${M.sqrt(3)} = 0`], [Math.SQRT2 / 2, F(M.sqrt(2), 2), `2 $F − ${M.sqrt(2)} = 0`],
    [-Math.SQRT2 / 2, '−' + F(M.sqrt(2), 2), `2 $F + ${M.sqrt(2)} = 0`], [1, '1', '$F − 1 = 0'], [-1, '−1', '$F + 1 = 0'], [0, '0', null]];
  const EQ_TAN = [[1, '1', '$F − 1 = 0'], [-1, '−1', '$F + 1 = 0'], [Math.sqrt(3), M.sqrt(3), `$F − ${M.sqrt(3)} = 0`], [-Math.sqrt(3), '−' + M.sqrt(3), `$F + ${M.sqrt(3)} = 0`],
    [Math.sqrt(3) / 3, F(M.sqrt(3), 3), `${M.sqrt(3)} $F − 1 = 0`], [-Math.sqrt(3) / 3, '−' + F(M.sqrt(3), 3), `${M.sqrt(3)} $F + 1 = 0`], [0, '0', null]];
  const solText = ks => ks.slice().sort((a, b) => a - b).map(rad).join(', ');
  const parseRad = s => {
    const m = s.trim().match(/^(−?)(\d*)(π)?(?:\/(\d+))?$/);
    if (!m) return NaN;
    if (!m[3]) return Number(m[2]) * (m[1] ? -1 : 1);
    return (m[1] ? -1 : 1) * (m[2] ? Number(m[2]) : 1) * Math.PI / (m[4] ? Number(m[4]) : 1);
  };

  A.skill({
    id: 'pre.trig-equations', title: 'Solving basic trig equations',
    learn: p(`To solve an equation like 2 sin ${X} − 1 = 0, first <b>get the trig function alone</b>: sin ${X} = 1/2. Then find the reference angle from the unit circle (here π/6).`) +
      p(`<b>Then find every angle in [0, 2π) with that value.</b> Sine is positive in quadrants I and II, cosine in I and IV, tangent in I and III. Most values give two answers in one turn of the circle; ±1 and 0 for sine and cosine are special points on the axes. Tangent repeats every π, so its two answers are π apart.`) +
      example('Example', `${big(`2 cos ${X} + ${M.sqrt(3)} = 0`)}cos ${X} = −${F(M.sqrt(3), 2)}. The reference angle is π/6, and cosine is negative in quadrants II and III: ${X} = π − π/6 and π + π/6, so <b>${X} = 5π/6, 7π/6</b>.`),
    make(rng) {
      const f = rng.pick(['sin', 'cos', 'tan']);
      const row = rng.pick(f === 'tan' ? EQ_TAN : EQ_SINCOS);
      const [v, vh, lin] = row;
      const useLin = lin && rng.chance(0.6);
      const eq = useLin ? lin.replace('$F', `${f} ${X}`) : `${f} ${X} = ${vh}`;
      const sol = twelfths(f, v);
      const other = f === 'sin' ? 'cos' : f === 'cos' ? 'sin' : 'tan';
      const cands = [twelfths(f, -v), v !== 0 && f === 'tan' ? twelfths('tan', 1 / v) : twelfths(other, v), sol.length > 1 ? [sol[0]] : [(sol[0] + 12) % 24],
        sol.includes(0) ? [...sol, 24] : [sol[0], (sol[0] + 6) % 24], f === 'tan' ? [sol[0], (12 - sol[0] + 24) % 24] : [sol[0], (sol[0] + 12) % 24], [2, 10], [4, 8], [3, 21], [9, 15]]
        .filter(c => c.length && new Set(c).size === c.length).map(solText);
      const ans = solText(sol);
      const quads = { sin: v > 0 ? 'I and II' : 'III and IV', cos: v > 0 ? 'I and IV' : 'II and III', tan: v > 0 ? 'I and III' : 'II and IV' }[f];
      return {
        prompt: `Solve for ${X} in the interval 0 ≤ ${X} &lt; 2π.${big(eq)}`, type: 'choice', answer: ans, choices: [ans, ...distinct(ans, cands, 3)], params: { f, v },
        hints: [useLin ? `Get ${f} ${X} alone: ${f} ${X} = ${vh}.` : `${f} ${X} is already alone and equals ${vh}.`,
          v === 0 || Math.abs(v) === 1 && f !== 'tan' ? `${vh} is an axis point on the unit circle, so look for the angles on the axes where ${f} is ${vh}.` : `Find the reference angle, then use the quadrants where ${f} is ${v > 0 ? 'positive' : 'negative'}: ${quads}.`,
          `The solutions in [0, 2π) are <b>${X} = ${ans}</b>.`],
      };
    },
    verify(q) {
      const { f, v } = q.params, TAU = 2 * Math.PI;
      const x1 = { sin: Math.asin, cos: Math.acos, tan: Math.atan }[f](v);
      const x2 = f === 'sin' ? Math.PI - x1 : f === 'cos' ? TAU - x1 : x1 + Math.PI;
      const norm = x => { let y = ((x % TAU) + TAU) % TAU; if (near(y, TAU, 1e-9)) y = 0; return y; };
      const want = [norm(x1), norm(x2)].sort((a, b) => a - b).filter((x, i, arr) => i === 0 || !near(x, arr[i - 1], 1e-9));
      const got = q.answer.split(',').map(parseRad);
      return got.length === want.length && got.every((g, i) => near(g, want[i], 1e-9));
    },
  });

  /* ---------- Unit 3: Complex numbers ---------- */
  const rootTxt = (k, r) => (k === 1 ? '' : N(k)) + M.sqrt(r);                  // "3√2", "√3"
  /** a + bi from HTML parts of the real and imaginary sizes */
  function cplx(a, b, ah, bh) {
    const im = b === 0 ? '' : (bh === '1' ? '' : bh) + I;
    if (a === 0) return b === 0 ? '0' : (b < 0 ? '−' : '') + im;
    return (a < 0 ? '−' : '') + ah + (b === 0 ? '' : (b < 0 ? ' − ' : ' + ') + im);
  }
  const polarTxt = (rh, t) => rh === '1' ? `cos ${t}° + ${I} sin ${t}°` : `${rh}(cos ${t}° + ${I} sin ${t}°)`;
  /** a complex number on a special angle: numeric parts, HTML parts, modulus (number and HTML), angle */
  function specialComplex(rng) {
    const fam = rng.pick(['axis', '45', '30', '60', '45', '30']), k = rng.int(1, 5);
    const t = { axis: rng.pick([0, 90, 180, 270]), 45: rng.pick([45, 135, 225, 315]), 30: rng.pick([30, 150, 210, 330]), 60: rng.pick([60, 120, 240, 300]) }[fam];
    const sx = Math.sign(Math.round(Math.cos(t * DEG) * 1e6)), sy = Math.sign(Math.round(Math.sin(t * DEG) * 1e6));
    let ah, bh, a, b, r, rh;
    if (fam === 'axis') { r = k + 1; rh = N(r); a = sx * r; b = sy * r; ah = bh = N(r); }
    else if (fam === '45') { a = sx * k; b = sy * k; ah = bh = N(k); r = k * Math.SQRT2; rh = rootTxt(k, 2); }
    else if (fam === '30') { a = sx * k * Math.sqrt(3); b = sy * k; ah = rootTxt(k, 3); bh = N(k); r = 2 * k; rh = N(r); }
    else { a = sx * k; b = sy * k * Math.sqrt(3); ah = N(k); bh = rootTxt(k, 3); r = 2 * k; rh = N(r); }
    return { fam, k, t, a, b, z: cplx(a, b, ah, bh), r, rh, r2: Math.round(r * r) };
  }

  A.skill({
    id: 'pre.complex-polar-form', title: 'Modulus, argument and polar form',
    learn: p(`Plot ${V('a')} + ${V('b')}${I} as the point (${V('a')}, ${V('b')}). Its <b>modulus</b> is the distance from the origin, |${V('z')}| = ${M.sqrt(`${V('a')}² + ${V('b')}²`)}. Its <b>argument</b> is the angle from the positive real axis, measured counterclockwise.`) +
      p(`<b>Polar form:</b> ${V('z')} = ${V('r')}(cos ${TH} + ${I} sin ${TH}), where ${V('r')} is the modulus and ${TH} the argument. To find ${TH}, use tan ${TH} = ${sfrac(V('b'), V('a'))} for the reference angle, then <b>check the quadrant</b> from the signs of ${V('a')} and ${V('b')}; a calculator's arctan alone is wrong whenever ${V('a')} is negative.`) +
      example('Example', `${big(`−2 + 2${I}`)}|${V('z')}| = ${M.sqrt('4 + 4')} = 2${M.sqrt(2)}. The reference angle is 45°, and the point (−2, 2) is in quadrant II, so ${TH} = 135°. ${V('z')} = <b>2${M.sqrt(2)}(cos 135° + ${I} sin 135°)</b>.`),
    make(rng) {
      const kind = rng.pick(['modulus', 'argument', 'polar', 'polar']);
      if (kind === 'modulus') {
        const [x, y, h] = rng.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25], [9, 12, 15], [12, 16, 20]]);
        const [u, w] = rng.bool() ? [x, y] : [y, x];
        const a = u * rng.sign(), b = w * rng.sign();
        return { prompt: `Find the modulus.${big(`|${cplx(a, b, N(Math.abs(a)), N(Math.abs(b)))}|`)}`, type: 'number', answer: h, params: { kind, a, b },
          hints: [`The modulus is the distance from 0 to the point (${N(a)}, ${N(b)}): ${M.sqrt(`${V('a')}² + ${V('b')}²`)}.`, `${M.sqrt(`${wrap(a)}² + ${wrap(b)}²`)} = ${M.sqrt(`${a * a} + ${b * b}`)} = ${M.sqrt(h * h)}.`, `The modulus is <b>${h}</b>.`] };
      }
      const z = specialComplex(rng);
      const quad = z.t % 90 === 0 ? `the point lies on an axis` : `the point (${z.a < 0 ? '−' : '+'}, ${z.b < 0 ? '−' : '+'}) is in quadrant ${['I', 'II', 'III', 'IV'][Math.floor(z.t / 90)]}`;
      const ref = z.t % 90 === 0 ? 0 : Math.min(z.t % 180, 180 - z.t % 180);
      const argHint = z.t % 90 === 0 ? `The number lies on an axis, so read the angle straight off: ${z.t}°.` : `The reference angle is ${ref}°, and ${quad}, so ${TH} = ${z.t}°.`;
      if (kind === 'argument') {
        return { prompt: `Find the argument of ${V('z')}, in degrees from 0° up to 360°.${big(`${V('z')} = ${z.z}`)}`, type: 'number', answer: z.t, unit: '°', params: { kind, a: z.a, b: z.b },
          hints: [`Plot the point and decide which quadrant it is in from the signs of the real and imaginary parts.`, z.t % 90 === 0 ? argHint : `Use tan ${TH} = ${sfrac('imaginary part', 'real part')} for the reference angle (ignore the signs): ${ref}°.`, `${argHint} The argument is <b>${z.t}°</b>.`] };
      }
      const opts = [[z.r, z.rh, z.t], [z.r, z.rh, (z.t + 180) % 360], [z.r, z.rh, (360 - z.t) % 360], [z.r2, N(z.r2), z.t], [z.r, z.rh, (z.t + 90) % 360]];
      const html = opts.map(o => polarTxt(o[1], o[2]));
      const ans = html[0], wrong = distinct(ans, html.slice(1), 3);
      return { prompt: `Write ${V('z')} in polar form.${big(`${V('z')} = ${z.z}`)}`, type: 'choice', answer: ans, choices: [ans, ...wrong],
        params: { kind, a: z.a, b: z.b, opts: opts.filter((o, i) => i === 0 || wrong.includes(html[i])) },
        hints: [`The modulus: ${V('r')} = ${M.sqrt(`${V('a')}² + ${V('b')}²`)} = ${M.sqrt(z.r2)} = ${z.rh}.`, argHint, `<b>${V('z')} = ${ans}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'modulus') return near(Math.hypot(p.a, p.b), q.answer);
      if (p.kind === 'argument') return near(((Math.atan2(p.b, p.a) / DEG) + 360) % 360, q.answer, 1e-6);
      const fits = o => near(o[0] * Math.cos(o[2] * DEG), p.a, 1e-9) && near(o[0] * Math.sin(o[2] * DEG), p.b, 1e-9);
      const good = p.opts.filter(fits);
      return good.length === 1 && polarTxt(good[0][1], good[0][2]) === q.answer;
    },
  });

  A.skill({
    id: 'pre.multiply-polar', title: 'Multiplying and dividing complex numbers in polar form',
    learn: p(`Polar form makes multiplication easy. <b>To multiply, multiply the moduli and add the arguments. To divide, divide the moduli and subtract the arguments.</b>`) +
      p(`Raising to a power is repeated multiplication, which gives <b>De Moivre's theorem</b>: [${V('r')}(cos ${TH} + ${I} sin ${TH})]${M.sup('', V('n'))} = ${M.sup(V('r'), V('n'))}(cos ${V('n')}${TH} + ${I} sin ${V('n')}${TH}). If an angle comes out at 360° or more, or below 0°, add or subtract 360° to bring it back into [0°, 360°).`) +
      example('Example', `3(cos 50° + ${I} sin 50°) · 4(cos 100° + ${I} sin 100°) = (3 · 4)(cos 150° + ${I} sin 150°) = <b>12(cos 150° + ${I} sin 150°)</b>.`),
    make(rng) {
      const kind = rng.pick(['mul', 'mul', 'div', 'pow']);
      const ang = () => 15 * rng.int(1, 23);
      const mod = x => ((x % 360) + 360) % 360;
      let prompt, opts, hint1, hint2;
      if (kind === 'pow') {
        const r = rng.int(1, 3), n = rng.int(2, r === 3 ? 3 : 5), t = ang();
        const rn = Math.pow(r, n);
        prompt = `Simplify. Give the angle from 0° up to 360°.${big(`[${polarTxt(N(r), t)}]<sup>${n}</sup>`)}`;
        opts = [[rn, mod(n * t)], [n * r, mod(n * t)], [rn, t], [n * r, t], [rn, mod(n * t + 180)]];
        hint1 = `De Moivre: raise the modulus to the power and multiply the angle by it. ${M.sup(r, n)} = ${rn}.`;
        hint2 = `${n} × ${t}° = ${n * t}°${n * t >= 360 ? `, and taking away 360° until it is under 360° gives ${mod(n * t)}°` : ''}.`;
        return build({ kind, r, n, t });
      }
      const r2 = rng.int(1, 6), t1 = ang(), t2 = ang();
      if (kind === 'mul') {
        const r1 = rng.int(2, 6);
        prompt = `Multiply. Give the angle from 0° up to 360°.${big(`${polarTxt(N(r1), t1)} · ${polarTxt(N(r2), t2)}`)}`;
        opts = [[r1 * r2, mod(t1 + t2)], [r1 + r2, mod(t1 + t2)], [r1 * r2, mod(t1 - t2)], [r1 + r2, mod(t1 - t2)], [r1 * r2, mod(t1 + t2 + 180)]];
        hint1 = `Multiply the moduli: ${r1} × ${r2} = ${r1 * r2}.`;
        hint2 = `Add the angles: ${t1}° + ${t2}° = ${t1 + t2}°${t1 + t2 >= 360 ? `, which is ${mod(t1 + t2)}° after taking away 360°` : ''}.`;
        return build({ kind, r1, t1, r2, t2 });
      }
      const m = rng.int(1, 5), r1 = r2 * m;
      prompt = `Divide. Give the angle from 0° up to 360°.${big(`${sfrac(polarTxt(N(r1), t1), polarTxt(N(r2), t2))}`)}`;
      opts = [[m, mod(t1 - t2)], [m, mod(t1 + t2)], [r1 - r2 || r1 * r2, mod(t1 - t2)], [m, mod(t2 - t1)], [r1 * r2, mod(t1 - t2)]];
      hint1 = `Divide the moduli: ${r1} ÷ ${r2} = ${m}.`;
      hint2 = `Subtract the angles: ${t1}° − ${t2}° = ${t1 - t2}°${t1 - t2 < 0 ? `; add 360° to get ${mod(t1 - t2)}°` : ''}.`;
      return build({ kind, r1, t1, r2, t2 });
      function build(params) {
        const html = opts.map(o => polarTxt(N(o[0]), o[1]));
        const ans = html[0], wrong = distinct(ans, html.slice(1), 3);
        params.opts = opts.filter((o, i) => i === 0 || wrong.includes(html[i]));
        return { prompt, type: 'choice', answer: ans, choices: [ans, ...wrong], params, hints: [hint1, hint2, `<b>${ans}</b>`] };
      }
    },
    verify(q) {
      const p = q.params;
      const rect = (r, t) => [r * Math.cos(t * DEG), r * Math.sin(t * DEG)];
      const mulc = (u, w) => [u[0] * w[0] - u[1] * w[1], u[0] * w[1] + u[1] * w[0]];
      let want;
      if (p.kind === 'pow') { want = [1, 0]; for (let i = 0; i < p.n; i++) want = mulc(want, rect(p.r, p.t)); }
      else if (p.kind === 'mul') want = mulc(rect(p.r1, p.t1), rect(p.r2, p.t2));
      else { const u = rect(p.r1, p.t1), w = rect(p.r2, p.t2), d = w[0] * w[0] + w[1] * w[1]; want = mulc(u, [w[0] / d, -w[1] / d]); }
      const good = p.opts.filter(o => { const z = rect(o[0], o[1]); return near(z[0], want[0], 1e-7) && near(z[1], want[1], 1e-7); });
      return good.length === 1 && polarTxt(N(good[0][0]), good[0][1]) === q.answer;
    },
  });

  /* ---------- Unit 4: Rational functions ---------- */
  const xeq = a => `${X} = ${N(a)}`;
  function describeRational(holes, vas) {
    const h = holes.length ? `hole at ${holes.map(xeq).join(' and ')}` : 'no hole';
    const v = vas.length ? `vertical asymptote${vas.length > 1 ? 's' : ''} at ${vas.map(xeq).join(' and ')}` : 'no vertical asymptote';
    return `${h}; ${v}`;
  }
  const lin = a => `(${X} ${M.signed(-a)})`;

  A.skill({
    id: 'pre.rational-asymptotes-holes', title: 'Vertical asymptotes and holes',
    learn: p(`A rational function is a fraction of polynomials. Where the denominator is zero the function is undefined, and the graph does one of two things there.`) +
      p(`<b>Factor the top and the bottom first. A factor that cancels makes a hole; a factor left in the denominator makes a vertical asymptote.</b> At a hole the graph is a line with one missing point; at an asymptote it shoots up or down.`) +
      p(`To find the height of a hole, cancel the common factor and substitute into what is left.`) +
      example('Example', `${big(`${fn('f', X)} = ${sfrac(`${X}² − ${X} − 6`, `${X}² − 9`)}`)}Factor: ${sfrac(`(${X} − 3)(${X} + 2)`, `(${X} − 3)(${X} + 3)`)}. (${X} − 3) cancels: <b>hole at ${X} = 3</b>. (${X} + 3) is left: <b>vertical asymptote at ${X} = −3</b>. The hole's height is ${sfrac('3 + 2', '3 + 3')} = ${F(5, 6)}.`),
    make(rng) {
      const kind = rng.pick(['hole', 'hole', 'none', 'holeY']);
      const vals = rng.sample([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6], 3);
      const [a, b, c] = vals, k = rng.pick([1, 1, 2, 3]);
      const showFactored = rng.bool();
      const num = kind === 'none' ? [k, -k * b] : [k, -k * (a + b), k * a * b];
      const den = [1, -(a + c), a * c];
      const numF = (k === 1 ? '' : N(k)) + (kind === 'none' ? lin(b) : lin(a) + lin(b)), denF = lin(a) + lin(c);
      const fx = `${fn('f', X)} = ${showFactored ? sfrac(numF, denF) : sfrac(M.poly(num), M.poly(den))}`;
      const factor = showFactored ? `It is already factored: ${sfrac(numF, denF)}.` : `Factor: ${sfrac(numF, denF)}.`;
      if (kind === 'holeY') {
        const [n, d] = M.simp(k * (a - b), a - c);
        return { prompt: `The graph of ${V('f')} has a hole. What is its ${Y}-coordinate?${big(fx)}`, type: 'number', answer: n / d, answerText: M.fracText(n, d), params: { kind, num, den, a },
          hints: [factor, `${lin(a)} cancels, so the hole is at ${X} = ${N(a)}. What is left is ${sfrac((k === 1 ? '' : N(k)) + lin(b), lin(c))}.`, `Substitute ${X} = ${N(a)}: ${sfrac(`${k === 1 ? '' : N(k)}(${N(a)} ${M.signed(-b)})`, `${N(a)} ${M.signed(-c)}`)} = <b>${M.fracText(n, d)}</b>.`] };
      }
      const [lo, hi] = a < c ? [a, c] : [c, a];
      const ans = kind === 'hole' ? describeRational([a], [c]) : describeRational([], [lo, hi]);
      const cands = kind === 'hole'
        ? [describeRational([], [lo, hi]), describeRational([c], [a]), describeRational([a], [b]), describeRational([b], [c])]
        : [describeRational([a], [c]), describeRational([], [-hi, -lo]), describeRational([c], [a]), describeRational([], [b])];
      return { prompt: `Which describes the graph of ${V('f')}?${big(fx)}`, type: 'choice', answer: ans, choices: [ans, ...distinct(ans, cands, 3)], params: { kind, num, den },
        hints: [factor, kind === 'hole' ? `${lin(a)} is on the top and the bottom, so it cancels: a hole at ${X} = ${N(a)}.` : `No factor appears on both the top and the bottom, so nothing cancels and there are no holes.`,
          kind === 'hole' ? `${lin(c)} stays in the denominator: a vertical asymptote at ${X} = ${N(c)}.` : `Each denominator factor gives a vertical asymptote: ${X} = ${N(lo)} and ${X} = ${N(hi)}.`, `<b>${ans[0].toUpperCase() + ans.slice(1)}</b>.`] };
    },
    verify(q) {
      const { kind, num, den } = q.params;
      if (kind === 'holeY') { const x = q.params.a + 1e-7; return near(evalP(num, x) / evalP(den, x), q.answer, 1e-5); }
      const holes = [], vas = [];
      for (let x = -10; x <= 10; x++) if (evalP(den, x) === 0) (evalP(num, x) === 0 ? holes : vas).push(x);
      return describeRational(holes, vas) === q.answer;
    },
  });

  A.skill({
    id: 'pre.rational-end-behavior', title: 'End behavior of rational functions',
    learn: p(`Far out to the left and right, only the leading terms of the top and bottom matter. Compare the degree of the numerator (${V('n')}) with the degree of the denominator (${V('d')}).`) +
      p(`<b>If ${V('n')} &lt; ${V('d')}, the horizontal asymptote is ${Y} = 0. If ${V('n')} = ${V('d')}, it is ${Y} = the ratio of the leading coefficients. If ${V('n')} &gt; ${V('d')}, there is no horizontal asymptote</b> (the graph grows without bound; when ${V('n')} = ${V('d')} + 1 it follows a slant line).`) +
      example('Example', `${big(`${fn('f', X)} = ${sfrac(`6${X}² − ${X} + 4`, `3${X}² + 5`)}`)}Both degrees are 2, so the asymptote is the ratio of leading coefficients: ${Y} = ${F(6, 3, { raw: true })} = <b>${Y} = 2</b>.`),
    make(rng) {
      const m = rng.int(1, 3), n = rng.int(1, 3);
      const poly = deg => { const c = [rng.nz(-6, 6)]; for (let i = 0; i < deg; i++) c.push(rng.int(-9, 9)); if (c[deg] === 0) c[deg] = rng.nz(-9, 9); return c; };
      const num = poly(m), den = poly(n);
      const [pn, qd] = [num[0], den[0]];
      const yeq = (a, b) => `${Y} = ${M.fracText(a, b)}`;
      const ans = m < n ? `${Y} = 0` : m === n ? yeq(pn, qd) : 'no horizontal asymptote';
      const cands = [`${Y} = 0`, yeq(pn, qd), 'no horizontal asymptote', yeq(num[m], den[n]), yeq(qd, pn), `${Y} = ${N(pn)}`, `${Y} = 1`];
      const why = m < n ? `The numerator's degree (${m}) is less than the denominator's (${n}), so the fraction shrinks toward 0.`
        : m === n ? `The degrees are equal (${m}), so the asymptote is the ratio of the leading coefficients: ${Y} = ${F(pn, qd, { raw: true })} = ${M.fracText(pn, qd)}.`
          : `The numerator's degree (${m}) is bigger than the denominator's (${n}), so the function grows without bound.`;
      return { prompt: `What is the horizontal asymptote of the graph?${big(`${fn('f', X)} = ${sfrac(M.poly(num), M.poly(den))}`)}`, type: 'choice', answer: ans, choices: [ans, ...distinct(ans, cands, 3)], params: { num, den },
        hints: [`Compare the degrees: the top has degree ${m} and the bottom has degree ${n}.`, why, `<b>${ans[0].toUpperCase() === 'N' ? 'There is no horizontal asymptote' : ans}</b>.`] };
    },
    verify(q) {
      const { num, den } = q.params;
      const f = x => evalP(num, x) / evalP(den, x);
      const v1 = f(1e6), v2 = f(2e6);
      if (Math.abs(v2) > 1e4 && Math.abs(v2) > Math.abs(v1)) return q.answer === 'no horizontal asymptote';
      const got = A.parseNumber(A.stripTags(q.answer).replace(/^\s*y\s*=\s*/, ''));
      return near(got, v2, 1e-4);
    },
  });

  /* ---------- Unit 5: Conic sections ---------- */
  /** "4x² − 9y² + 8x − 36y − 68 = 0" from [coef, variable HTML] pairs and a constant */
  function generalForm(terms, c) {
    let out = '';
    [...terms, [c, '']].forEach(([k, vh]) => {
      if (k === 0) return;
      const mag = Math.abs(k), body = vh ? (mag === 1 ? '' : N(mag)) + vh : N(mag);
      out += out === '' ? (k < 0 ? '−' : '') + body : (k < 0 ? ' − ' : ' + ') + body;
    });
    return out + ' = 0';
  }
  const CONICS = ['Circle', 'Ellipse', 'Parabola', 'Hyperbola'];
  const classify = (Ax, Cy) => Ax === 0 || Cy === 0 ? 'Parabola' : Ax === Cy ? 'Circle' : Ax * Cy > 0 ? 'Ellipse' : 'Hyperbola';

  A.skill({
    id: 'pre.identify-conics', title: 'Identifying conic sections from their equations',
    learn: p(`Every conic can be written as ${V('A')}${X}² + ${V('C')}${Y}² + ${V('D')}${X} + ${V('E')}${Y} + ${V('F')} = 0. You can tell which conic it is just from the squared terms, without completing the square.`) +
      p(`<b>Only one squared term (${V('A')} or ${V('C')} is 0): parabola. ${V('A')} = ${V('C')}: circle. Same sign but different: ellipse. Opposite signs: hyperbola.</b>`) +
      example('Example', `${big(`4${X}² − 9${Y}² + 8${X} − 36${Y} − 68 = 0`)}Both ${X}² and ${Y}² appear, with coefficients 4 and −9. They have opposite signs, so this is a <b>hyperbola</b>.`),
    make(rng) {
      const type = rng.pick(CONICS), h = rng.int(-5, 5), k = rng.int(-5, 5);
      let Ax, Cy, D, E, c;
      if (type === 'Circle') { const r = rng.int(1, 6); [Ax, Cy, D, E, c] = [1, 1, -2 * h, -2 * k, h * h + k * k - r * r]; }
      else if (type === 'Ellipse' || type === 'Hyperbola') {
        const [a, b] = rng.sample([2, 3, 4, 5], 2), s = type === 'Ellipse' ? 1 : -1;
        [Ax, Cy, D, E, c] = [b * b, s * a * a, -2 * h * b * b, -2 * s * k * a * a, b * b * h * h + s * a * a * k * k - a * a * b * b];
      } else {
        const pp = rng.nz(-3, 3);
        [Ax, Cy, D, E, c] = [1, 0, -2 * h, -4 * pp, h * h + 4 * pp * k];
        if (rng.bool()) [Ax, Cy, D, E] = [Cy, Ax, E, D];       // the sideways parabola
      }
      const mlt = rng.pick([1, 1, 2, -1, 3]);
      [Ax, Cy, D, E, c] = [Ax, Cy, D, E, c].map(t => t * mlt);
      const eq = generalForm([[Ax, `${X}²`], [Cy, `${Y}²`], [D, X], [E, Y]], c);
      const ans = classify(Ax, Cy);
      const rule = { Parabola: 'Only one variable is squared, so it is a parabola.', Circle: `The coefficients are equal, so it is a circle.`, Ellipse: 'They have the same sign but are different, so it is an ellipse.', Hyperbola: 'They have opposite signs, so it is a hyperbola.' }[ans];
      return { prompt: `Which conic section does this equation describe?${big(eq)}`, type: 'choice', answer: ans, choices: CONICS.slice(), keepOrder: true, params: { Ax, Cy, D, E, c },
        hints: [`Ignore the ${X}, ${Y} and constant terms; look only at the squared terms.`, `The coefficient of ${X}² is ${N(Ax)} and the coefficient of ${Y}² is ${N(Cy)}. ${rule}`, `<b>${ans}</b>.`] };
    },
    verify(q) {   // a parabola has one squared term; otherwise, an ellipse or circle has no points far from the origin, a hyperbola does
      const { Ax, Cy, D, E, c } = q.params;
      if (Ax === 0 || Cy === 0) return q.answer === 'Parabola';
      const realY = x => E * E - 4 * Cy * (Ax * x * x + D * x + c) >= 0;     // some y on the curve at this x?
      const realX = y => D * D - 4 * Ax * (Cy * y * y + E * y + c) >= 0;
      const far = [1e4, -1e4].some(t => realY(t) || realX(t));
      return q.answer === (far ? 'Hyperbola' : Ax === Cy ? 'Circle' : 'Ellipse');
    },
  });

  A.skill({
    id: 'pre.conic-features', title: 'Features of ellipses, hyperbolas and parabolas',
    learn: p(`<b>Ellipse</b> ${sfrac(M.sup(`(${X} − ${V('h')})`, 2), M.sup(V('a'), 2))} + ${sfrac(M.sup(`(${Y} − ${V('k')})`, 2), M.sup(V('b'), 2))} = 1: center (${V('h')}, ${V('k')}); the axis lengths are 2${V('a')} and 2${V('b')}, and the longer one is the major axis.`) +
      p(`<b>Hyperbola</b> ${sfrac(M.sup(`(${X} − ${V('h')})`, 2), M.sup(V('a'), 2))} − ${sfrac(M.sup(`(${Y} − ${V('k')})`, 2), M.sup(V('b'), 2))} = 1: the asymptotes pass through the center with slopes ±${sfrac(V('b'), V('a'))}. If the ${Y} term comes first, the slopes are ±${sfrac(V('a'), V('b'))}: always ${sfrac('√(number under y)', '√(number under x)')}.`) +
      p(`<b>Parabola</b> (${X} − ${V('h')})² = 4${V('p')}(${Y} − ${V('k')}): vertex (${V('h')}, ${V('k')}), focus (${V('h')}, ${V('k')} + ${V('p')}), directrix ${Y} = ${V('k')} − ${V('p')}. The focus is ${V('p')} inside the curve and the directrix is ${V('p')} outside.`) +
      example('Example', `${big(`(${X} − 2)² = 12(${Y} + 1)`)}4${V('p')} = 12, so ${V('p')} = 3. The vertex is (2, −1), the focus is (2, −1 + 3) = (2, 2), and the directrix is <b>${Y} = −4</b>.`),
    make(rng) {
      const kind = rng.pick(['major', 'minor', 'centre', 'slope', 'slope', 'directrix', 'focus']);
      const h = rng.int(-6, 6), k = rng.int(-6, 6);
      if (kind === 'major' || kind === 'minor' || kind === 'centre') {
        const [a, b] = rng.sample([2, 3, 4, 5, 6, 7], 2);
        const eq = `${sfrac(shift2('x', h), a * a)} + ${sfrac(shift2('y', k), b * b)} = 1`;
        if (kind === 'centre') {
          const ans = M.pt(h, k), cands = [M.pt(-h, -k), M.pt(k, h), M.pt(h, -k), M.pt(-h, k), M.pt(h + 1, k - 1)];
          return { prompt: `What is the center of this ellipse?${big(eq)}`, type: 'choice', answer: ans, choices: [ans, ...distinct(ans, cands, 3)], params: { kind, h, k },
            hints: [`Compare with (${X} − ${V('h')})² and (${Y} − ${V('k')})². The center is (${V('h')}, ${V('k')}), and the signs flip.`, `${shift('x', h)} gives ${V('h')} = ${N(h)}, and ${shift('y', k)} gives ${V('k')} = ${N(k)}.`, `The center is <b>${ans}</b>.`] };
        }
        const ans = 2 * (kind === 'major' ? Math.max(a, b) : Math.min(a, b));
        return { prompt: `What is the length of the ${kind} axis of this ellipse?${big(eq)}`, type: 'number', answer: ans, params: { kind, d: [a * a, b * b] },
          hints: [`The numbers under the squares are ${a * a} and ${b * b}, so the semi-axes are ${M.sqrt(a * a)} = ${a} and ${M.sqrt(b * b)} = ${b}.`, `The ${kind} axis uses the ${kind === 'major' ? 'larger' : 'smaller'} one, ${ans / 2}, and is twice as long.`, `The ${kind} axis has length <b>${ans}</b>.`] };
      }
      if (kind === 'slope') {
        const [a, b] = rng.sample([1, 2, 3, 4, 5, 6], 2), xFirst = rng.bool();
        const eq = xFirst ? `${sfrac(shift2('x', h), a * a)} − ${sfrac(shift2('y', k), b * b)} = 1` : `${sfrac(shift2('y', k), a * a)} − ${sfrac(shift2('x', h), b * b)} = 1`;
        const [n, d] = xFirst ? [b, a] : [a, b];
        const [sn, sd] = M.simp(n, d);
        return { prompt: `What is the positive slope of the asymptotes of this hyperbola?${big(eq)}`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, a, b, h, k, xFirst },
          hints: [`The slope is ${sfrac('rise', 'run')} = ${sfrac('√(number under ' + Y + ')', '√(number under ' + X + ')')}.`, `Under ${Y}: ${xFirst ? b * b : a * a}, so the rise is ${n}. Under ${X}: ${xFirst ? a * a : b * b}, so the run is ${d}.`, `The asymptotes have slopes ±${F(n, d)}; the positive slope is <b>${M.fracText(sn, sd)}</b>.`] };
      }
      const pp = rng.nz(-3, 3), vert = rng.bool();
      const eq = vert ? `${shift2('x', h)} = ${N(4 * pp)}${shift('y', k)}` : `${shift2('y', k)} = ${N(4 * pp)}${shift('x', h)}`;
      const vtx = `The vertex is ${M.pt(h, k)} and 4${V('p')} = ${N(4 * pp)}, so ${V('p')} = ${N(pp)}.`;
      if (kind === 'directrix') {
        const ans = vert ? k - pp : h - pp, w = vert ? Y : X;
        return { prompt: `The directrix of this parabola is the line ${w} = ?${big(eq)}`, type: 'number', answer: ans, params: { kind, h, k, pp, vert },
          hints: [vtx, `The directrix is ${V('p')} units from the vertex on the side away from the focus: ${w} = ${N(vert ? k : h)} − ${wrap(pp)}.`, `The directrix is <b>${w} = ${N(ans)}</b>.`] };
      }
      const opts = vert ? [[h, k + pp], [h, k - pp], [h + pp, k], [h, k + 4 * pp]] : [[h + pp, k], [h - pp, k], [h, k + pp], [h + 4 * pp, k]];
      const html = opts.map(o => M.pt(o[0], o[1]));
      return { prompt: `What is the focus of this parabola?${big(eq)}`, type: 'choice', answer: html[0], choices: html, params: { kind, h, k, pp, vert, opts },
        hints: [vtx, `The focus is ${V('p')} units from the vertex along the axis, inside the curve: ${vert ? `(${N(h)}, ${N(k)} + ${wrap(pp)})` : `(${N(h)} + ${wrap(pp)}, ${N(k)})`}.`, `The focus is <b>${html[0]}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'centre') return q.answer === M.pt(p.h, p.k);
      if (p.kind === 'major' || p.kind === 'minor') return near(2 * Math.sqrt((p.kind === 'major' ? Math.max : Math.min)(...p.d)), q.answer);
      if (p.kind === 'slope') {           // rise over run of the upper branch, far from the centre
        const y = x => p.xFirst ? p.k + p.b * Math.sqrt((x - p.h) ** 2 / (p.a * p.a) - 1) : p.k + p.a * Math.sqrt(1 + (x - p.h) ** 2 / (p.b * p.b));
        return near((y(2e5) - y(1e5)) / 1e5, q.answer, 1e-4);
      }
      // points on the parabola, in the orientation (u, w) where (u − U)² = 4p(w − W)
      const [U, W] = p.vert ? [p.h, p.k] : [p.k, p.h];
      const pts = [2, 6, -4].map(t => [U + t * p.pp, W + t * t * p.pp / 4]);
      if (p.kind === 'directrix') return pts.every(([u, w]) => near(Math.hypot(u - U, w - (W + p.pp)), Math.abs(w - q.answer), 1e-9));
      const good = p.opts.filter(o => {
        const [fu, fw] = p.vert ? o : [o[1], o[0]];
        return pts.every(([u, w]) => near(Math.hypot(u - fu, w - fw), Math.abs(w - (2 * W - fw)), 1e-9));
      });
      return good.length === 1 && M.pt(good[0][0], good[0][1]) === q.answer;
    },
  });

  /* ---------- Unit 6: Vectors ---------- */
  const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25], [9, 12, 15]];
  const bv = s => `<b>${V(s)}</b>`;
  const fv = (n, d) => F(n, d);

  A.skill({
    id: 'pre.vector-components', title: 'Vector components, magnitude and unit vectors',
    learn: p(`A vector has a size and a direction. In component form ${bv('v')} = ⟨${V('a')}, ${V('b')}⟩ it moves ${V('a')} across and ${V('b')} up. <b>The vector from ${V('P')} to ${V('Q')} is ${V('Q')} − ${V('P')}</b> (end minus start).`) +
      p(`<b>Magnitude:</b> ‖${bv('v')}‖ = ${M.sqrt(`${V('a')}² + ${V('b')}²`)}. <b>From magnitude and direction:</b> ${bv('v')} = ⟨‖${bv('v')}‖ cos ${TH}, ‖${bv('v')}‖ sin ${TH}⟩. <b>Unit vector:</b> divide each component by the magnitude, so the new vector has length 1 and the same direction.`) +
      example('Example', `${bv('v')} = ⟨−6, 8⟩. ‖${bv('v')}‖ = ${M.sqrt('36 + 64')} = 10, so the unit vector in its direction is <b>⟨${F(-6, 10, { raw: true })}, ${F(8, 10, { raw: true })}⟩ = ⟨−${F(3, 5)}, ${F(4, 5)}⟩</b>.`),
    make(rng) {
      const kind = rng.pick(['points', 'magnitude', 'direction', 'unit']);
      if (kind === 'points') {
        const P = [rng.int(-8, 8), rng.int(-8, 8)], Q = [rng.int(-8, 8), rng.int(-8, 8)];
        if (Q[0] === P[0]) Q[0] += 3;
        const opts = [[Q[0] - P[0], Q[1] - P[1]], [P[0] - Q[0], P[1] - Q[1]], [Q[0] + P[0], Q[1] + P[1]], [Q[1] - P[1], Q[0] - P[0]], [Q[0] - P[0], P[1] - Q[1]]];
        const html = opts.map(o => vec(o[0], o[1])), wrong = distinct(html[0], html.slice(1), 3);
        return { prompt: `Find the component form of the vector from ${V('P')}${M.pt(P[0], P[1])} to ${V('Q')}${M.pt(Q[0], Q[1])}.`, type: 'choice', answer: html[0], choices: [html[0], ...wrong], params: { kind, P, Q, opts: opts.filter((o, i) => i === 0 || wrong.includes(html[i])) },
          hints: [`End minus start: subtract ${V('P')} from ${V('Q')}.`, `⟨${N(Q[0])} − ${wrap(P[0])}, ${N(Q[1])} − ${wrap(P[1])}⟩.`, `<b>${html[0]}</b>.`] };
      }
      if (kind === 'magnitude') {
        let a, b;
        if (rng.chance(0.5)) { const [x, y] = rng.pick(TRIPLES); [a, b] = (rng.bool() ? [x, y] : [y, x]).map(t => t * rng.sign()); }
        else { a = rng.nz(-9, 9); b = rng.nz(-9, 9); }
        const raw = Math.sqrt(a * a + b * b), exact = Number.isInteger(raw), ans = M.round(raw, 1);
        return { prompt: `Find the magnitude of ${bv('v')} = ${vec(a, b)}${exact ? '' : ', rounded to the nearest tenth'}.`, type: 'number', answer: ans, tolerance: exact ? undefined : 0.05, params: { kind, a, b },
          hints: [`‖${bv('v')}‖ = ${M.sqrt(`${V('a')}² + ${V('b')}²`)}.`, `${M.sqrt(`${wrap(a)}² + ${wrap(b)}²`)} = ${M.sqrt(`${a * a} + ${b * b}`)} = ${M.sqrt(a * a + b * b)}.`, `‖${bv('v')}‖ ${exact ? '=' : '≈'} <b>${N(ans)}</b>.`] };
      }
      if (kind === 'direction') {
        const r = rng.int(3, 20); let t = rng.int(5, 355); if (t % 90 === 0) t += 7;
        const comp = rng.pick(['horizontal', 'vertical']), f = comp === 'horizontal' ? 'cos' : 'sin';
        const ans = M.round(r * Math[f](t * DEG), 1);
        return { prompt: `A vector ${bv('v')} has magnitude ${r} and direction angle ${t}° (measured counterclockwise from the positive ${X}-axis). Find its ${comp} component, rounded to the nearest tenth.`, type: 'number', answer: ans, tolerance: 0.05, params: { kind, r, t, comp },
          hints: [`The ${comp} component is ‖${bv('v')}‖ ${f} ${TH}.`, `${r} ${f} ${t}° ≈ ${r} × ${N(M.round(Math[f](t * DEG), 4))}.`, `The ${comp} component is about <b>${N(ans)}</b>.`] };
      }
      const [x, y, c] = rng.pick(TRIPLES);
      const [a, b] = (rng.bool() ? [x, y] : [y, x]).map(t => t * rng.sign()), s = Math.abs(a) + Math.abs(b);
      const opts = [[a, c, b, c], [c, a, c, b], [b, c, a, c], [a, s, b, s]];
      const html = opts.map(o => vec(fv(o[0], o[1]), fv(o[2], o[3])));
      return { prompt: `Find the unit vector in the direction of ${bv('v')} = ${vec(a, b)}.`, type: 'choice', answer: html[0], choices: html, params: { kind, a, b, opts },
        hints: [`First the magnitude: ‖${bv('v')}‖ = ${M.sqrt(`${a * a} + ${b * b}`)} = ${c}.`, `Divide each component by ${c}.`, `<b>${html[0]}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'points') { const good = p.opts.filter(o => p.P[0] + o[0] === p.Q[0] && p.P[1] + o[1] === p.Q[1]); return good.length === 1 && vec(good[0][0], good[0][1]) === q.answer; }
      if (p.kind === 'magnitude') { let s = 0; for (const t of [p.a, p.b]) s += t * t; return near(Math.pow(s, 0.5), q.answer, 0.051); }
      if (p.kind === 'direction') { const t = p.comp === 'horizontal' ? 90 - p.t : p.t; return near(p.r * Math.sin(t * DEG), q.answer, 0.051); }
      const good = p.opts.filter(o => { const u = [o[0] / o[1], o[2] / o[3]]; return near(Math.hypot(u[0], u[1]), 1) && near(u[0] * p.b - u[1] * p.a, 0) && u[0] * p.a + u[1] * p.b > 0; });
      return good.length === 1 && vec(fv(good[0][0], good[0][1]), fv(good[0][2], good[0][3])) === q.answer;
    },
  });

  A.skill({
    id: 'pre.vector-operations', title: 'Adding and scaling vectors, and the dot product',
    learn: p(`<b>Vectors add and scale component by component:</b> ⟨${V('a')}, ${V('b')}⟩ + ⟨${V('c')}, ${V('d')}⟩ = ⟨${V('a')} + ${V('c')}, ${V('b')} + ${V('d')}⟩, and ${V('k')}⟨${V('a')}, ${V('b')}⟩ = ⟨${V('ka')}, ${V('kb')}⟩. A negative scalar reverses the direction.`) +
      p(`<b>The dot product</b> multiplies matching components and adds: ⟨${V('a')}, ${V('b')}⟩ · ⟨${V('c')}, ${V('d')}⟩ = ${V('ac')} + ${V('bd')}. The answer is a number, not a vector. It also equals ‖${bv('u')}‖‖${bv('v')}‖ cos ${TH}, so the angle between two vectors is ${TH} = arccos ${sfrac(`${bv('u')} · ${bv('v')}`, `‖${bv('u')}‖‖${bv('v')}‖`)}. A dot product of 0 means the vectors are perpendicular.`) +
      example('Example', `${bv('u')} = ⟨2, −1⟩, ${bv('v')} = ⟨3, 4⟩. 2${bv('u')} − ${bv('v')} = ⟨4 − 3, −2 − 4⟩ = <b>⟨1, −6⟩</b>, and ${bv('u')} · ${bv('v')} = 6 + (−4) = <b>2</b>.`),
    make(rng) {
      const kind = rng.pick(['combo', 'combo', 'dot', 'angle']);
      const u = [rng.nz(-6, 6), rng.int(-6, 6)], v = [rng.int(-6, 6), rng.nz(-6, 6)];
      const given = `${bv('u')} = ${vec(u[0], u[1])} and ${bv('v')} = ${vec(v[0], v[1])}.`;
      if (kind === 'combo') {
        const k = rng.pick([2, 3, 4, -2, -3, 1]), m = rng.pick([2, 3, -1, -2, -3, -4]);
        const expr = `${k === 1 ? '' : k === -1 ? '−' : N(k)}${bv('u')} ${m < 0 ? '−' : '+'} ${Math.abs(m) === 1 ? '' : N(Math.abs(m))}${bv('v')}`;
        const lc = (a, b) => [a * u[0] + b * v[0], a * u[1] + b * v[1]];
        const opts = [lc(k, m), lc(k, -m), lc(k, Math.sign(m)), lc(Math.sign(k), m), [k * u[0] + m * v[1], k * u[1] + m * v[0]]];
        const html = opts.map(o => vec(o[0], o[1])), wrong = distinct(html[0], html.slice(1), 3);
        return { prompt: `${given} Find${big(expr)}`, type: 'choice', answer: html[0], choices: [html[0], ...wrong], params: { kind, u, v, k, m, opts: opts.filter((o, i) => i === 0 || wrong.includes(html[i])) },
          hints: [`Scale first: ${N(k)}${bv('u')} = ${vec(k * u[0], k * u[1])} and ${N(m)}${bv('v')} = ${vec(m * v[0], m * v[1])}.`, `Add the matching components: ⟨${N(k * u[0])} + ${wrap(m * v[0])}, ${N(k * u[1])} + ${wrap(m * v[1])}⟩.`, `<b>${html[0]}</b>.`] };
      }
      const dot = u[0] * v[0] + u[1] * v[1];
      if (kind === 'dot') {
        return { prompt: `${given} Find ${bv('u')} · ${bv('v')}.`, type: 'number', answer: dot, params: { kind, u, v },
          hints: [`Multiply the matching components, then add.`, `${wrap(u[0])}(${N(v[0])}) + ${wrap(u[1])}(${N(v[1])}) = ${N(u[0] * v[0])} + ${wrap(u[1] * v[1])}.`, `${bv('u')} · ${bv('v')} = <b>${N(dot)}</b>.`] };
      }
      const nu = Math.hypot(u[0], u[1]), nv = Math.hypot(v[0], v[1]), ans = M.round(Math.acos(Math.max(-1, Math.min(1, dot / (nu * nv)))) / DEG, 1);
      return { prompt: `${given} Find the angle between ${bv('u')} and ${bv('v')} in degrees, rounded to the nearest tenth.`, type: 'number', answer: ans, unit: '°', tolerance: 0.05, params: { kind, u, v },
        hints: [`Use cos ${TH} = ${sfrac(`${bv('u')} · ${bv('v')}`, `‖${bv('u')}‖‖${bv('v')}‖`)}.`, `${bv('u')} · ${bv('v')} = ${N(dot)}, ‖${bv('u')}‖ = ${M.sqrt(u[0] * u[0] + u[1] * u[1])}, ‖${bv('v')}‖ = ${M.sqrt(v[0] * v[0] + v[1] * v[1])}, so cos ${TH} ≈ ${N(M.round(dot / (nu * nv), 4))}.`, `${TH} = arccos(${N(M.round(dot / (nu * nv), 4))}) ≈ <b>${N(ans)}°</b>.`] };
    },
    verify(q) {
      const p = q.params, { u, v } = p;
      if (p.kind === 'combo') {
        const good = p.opts.filter(o => o[0] - p.k * u[0] === p.m * v[0] && o[1] - p.k * u[1] === p.m * v[1]);
        return good.length === 1 && vec(good[0][0], good[0][1]) === q.answer;
      }
      const a1 = Math.atan2(u[1], u[0]), a2 = Math.atan2(v[1], v[0]);
      let d = Math.abs(a1 - a2) / DEG; if (d > 180) d = 360 - d;
      if (p.kind === 'dot') return near(Math.hypot(...u) * Math.hypot(...v) * Math.cos(d * DEG), q.answer, 1e-6);
      return near(d, q.answer, 0.051);
    },
  });

  /* ---------- Unit 7: Matrices ---------- */
  const randMat = (rng, r, c, lo, hi) => Array.from({ length: r }, () => Array.from({ length: c }, () => rng.int(lo, hi)));
  const mapM = (P, Q, f) => P.map((row, i) => row.map((x, j) => f(x, Q ? Q[i][j] : 0)));
  const mulM = (P, Q) => P.map(row => Q[0].map((_, j) => row.reduce((s, x, k) => s + x * Q[k][j], 0)));
  const transpose = P => P[0].map((_, j) => P.map(r => r[j]));
  const named = (name, P) => `${V(name)} = ${mat(P)}`;
  const ROWS = ['first', 'second', 'third'];

  A.skill({
    id: 'pre.matrix-add-scale', title: 'Adding, subtracting and scaling matrices',
    learn: p(`A matrix is a rectangle of numbers; a 2 × 3 matrix has 2 rows and 3 columns. <b>To add or subtract matrices of the same size, add or subtract the entries in matching positions.</b> Matrices of different sizes cannot be added.`) +
      p(`<b>To multiply a matrix by a number (a scalar), multiply every entry by it.</b> For something like 3${V('A')} − 2${V('B')}, scale each matrix first, then subtract entry by entry.`) +
      example('Example', `${V('A')} = ${mat([[1, -2], [0, 4]])}, ${V('B')} = ${mat([[3, 1], [-5, 2]])}. 2${V('A')} − ${V('B')} = ${mat([['2 − 3', '−4 − 1'], ['0 − (−5)', '8 − 2']])} = <b>${mat([[-1, -5], [5, 6]])}</b>.`),
    make(rng) {
      const kind = rng.pick(['sum', 'sum', 'entry']);
      if (kind === 'sum') {
        const P = randMat(rng, 2, 2, -9, 9), Q = randMat(rng, 2, 2, -9, 9), op = rng.pick(['+', '−']);
        if (!Q.flat().some(x => x < 0)) Q[1][0] = -Q[1][0] || -3;
        const add = (x, y) => op === '+' ? x + y : x - y;
        const opts = [mapM(P, Q, add), mapM(P, Q, op === '+' ? (x, y) => x - y : (x, y) => x + y), mapM(P, Q, (x, y) => op === '+' ? x + Math.abs(y) : x - Math.abs(y)), op === '+' ? transpose(mapM(P, Q, add)) : mapM(Q, P, (x, y) => x - y),
          mapM(P, Q, (x, y) => add(x, y) + 1)];
        const html = opts.map(mat), wrong = distinct(html[0], html.slice(1), 3);
        return { prompt: `${named('A', P)} &nbsp; ${named('B', Q)}${big(`${V('A')} ${op} ${V('B')} = ?`)}`, type: 'choice', answer: html[0], choices: [html[0], ...wrong],
          params: { kind, P, Q, op, opts: opts.filter((o, i) => i === 0 || wrong.includes(html[i])) },
          hints: [`${op === '+' ? 'Add' : 'Subtract'} the entries in matching positions.`, `Top left: ${N(P[0][0])} ${op} ${wrap(Q[0][0])} = ${N(add(P[0][0], Q[0][0]))}. Bottom left: ${N(P[1][0])} ${op} ${wrap(Q[1][0])} = ${N(add(P[1][0], Q[1][0]))}. Do the other two the same way.`, `${V('A')} ${op} ${V('B')} = <b>${html[0]}</b>`] };
      }
      const P = randMat(rng, 2, 3, -6, 6), Q = randMat(rng, 2, 3, -6, 6);
      const k = rng.pick([2, 3, 4, -2, -1]), m = rng.pick([2, 3, -2, -3, -1]);
      const i = rng.int(0, 1), j = rng.int(0, 2), ans = k * P[i][j] + m * Q[i][j];
      const expr = `${k === -1 ? '−' : N(k)}${V('A')} ${m < 0 ? '−' : '+'} ${Math.abs(m) === 1 ? '' : N(Math.abs(m))}${V('B')}`;
      return { prompt: `${named('A', P)} &nbsp; ${named('B', Q)}<p>What is the entry in the ${ROWS[i]} row, ${ROWS[j]} column of ${expr}?</p>`, type: 'number', answer: ans, params: { kind, P, Q, k, m, i, j },
        hints: [`You only need one position: row ${i + 1}, column ${j + 1}. In ${V('A')} it is ${N(P[i][j])}; in ${V('B')} it is ${N(Q[i][j])}.`, `Scale each: ${N(k)} × ${wrap(P[i][j])} = ${N(k * P[i][j])} and ${N(m)} × ${wrap(Q[i][j])} = ${N(m * Q[i][j])}.`, `${N(k * P[i][j])} + ${wrap(m * Q[i][j])} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'entry') { const R = mapM(mapM(p.P, null, x => p.k * x), mapM(p.Q, null, x => p.m * x), (x, y) => x + y); return R[p.i][p.j] === q.answer; }
      const good = p.opts.filter(o => o.every((row, i) => row.every((x, j) => (p.op === '+' ? x - p.Q[i][j] : x + p.Q[i][j]) === p.P[i][j])));
      return good.length === 1 && mat(good[0]) === q.answer;
    },
  });

  A.skill({
    id: 'pre.matrix-multiply', title: 'Multiplying matrices',
    learn: p(`<b>To find the entry in row ${V('i')}, column ${V('j')} of ${V('AB')}, multiply row ${V('i')} of ${V('A')} by column ${V('j')} of ${V('B')}: multiply matching entries and add.</b> This is the dot product of a row and a column.`) +
      p(`The product only exists when ${V('A')} has as many columns as ${V('B')} has rows; a 2 × 3 matrix times a 3 × 2 matrix gives a 2 × 2 matrix. Order matters: ${V('AB')} and ${V('BA')} are usually different.`) +
      example('Example', `${mat([[1, 2], [3, 0]])} ${mat([[4, -1], [2, 5]])}: top left = 1·4 + 2·2 = 8, top right = 1·(−1) + 2·5 = 9, bottom left = 3·4 + 0·2 = 12, bottom right = 3·(−1) + 0·5 = −3. So the product is <b>${mat([[8, 9], [12, -3]])}</b>.`),
    make(rng) {
      if (rng.chance(0.65)) {
        let P, Q, opts, html, wrong, tries = 0;
        do {
          P = randMat(rng, 2, 2, -5, 6); Q = randMat(rng, 2, 2, -5, 6);
          opts = [mulM(P, Q), mulM(Q, P), mapM(P, Q, (x, y) => x * y), mulM(P, transpose(Q))];
          html = opts.map(mat); wrong = distinct(html[0], html.slice(1), 3);
        } while (wrong.length < 3 && ++tries < 20);
        if (wrong.length < 3) { opts.push(mapM(opts[0], null, x => x + 1), mapM(opts[0], null, x => -x)); html = opts.map(mat); wrong = distinct(html[0], html.slice(1), 3); }
        const C = opts[0];
        return { prompt: `${named('A', P)} &nbsp; ${named('B', Q)}${big(`${V('AB')} = ?`)}`, type: 'choice', answer: html[0], choices: [html[0], ...wrong], params: { kind: 'full', P, Q, opts: opts.filter((o, i) => i === 0 || wrong.includes(html[i])) },
          hints: [`Each entry is a row of ${V('A')} times a column of ${V('B')}.`, `Top left: row 1 · column 1 = ${N(P[0][0])}·${wrap(Q[0][0])} + ${N(P[0][1])}·${wrap(Q[1][0])} = ${N(C[0][0])}. Top right: row 1 · column 2 = ${N(P[0][0])}·${wrap(Q[0][1])} + ${N(P[0][1])}·${wrap(Q[1][1])} = ${N(C[0][1])}.`,
            `Bottom row: ${N(P[1][0])}·${wrap(Q[0][0])} + ${N(P[1][1])}·${wrap(Q[1][0])} = ${N(C[1][0])} and ${N(P[1][0])}·${wrap(Q[0][1])} + ${N(P[1][1])}·${wrap(Q[1][1])} = ${N(C[1][1])}.`, `${V('AB')} = <b>${html[0]}</b>`] };
      }
      const P = randMat(rng, 2, 3, -4, 5), Q = randMat(rng, 3, 2, -4, 5), i = rng.int(0, 1), j = rng.int(0, 1);
      const ans = mulM(P, Q)[i][j];
      const terms = [0, 1, 2].map(t => `${N(P[i][t])}·${wrap(Q[t][j])}`);
      return { prompt: `${named('A', P)} &nbsp; ${named('B', Q)}<p>What is the entry in the ${ROWS[i]} row, ${ROWS[j]} column of ${V('AB')}?</p>`, type: 'number', answer: ans, params: { kind: 'entry', P, Q, i, j },
        hints: [`Use row ${i + 1} of ${V('A')}: (${P[i].map(N).join(', ')}) and column ${j + 1} of ${V('B')}: (${Q.map(r => N(r[j])).join(', ')}).`, `Multiply matching entries and add: ${terms.join(' + ')}.`, `The entry is <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      // C is right when C·e = A(B·e) for each standard basis vector e, i.e. column j of C is A times column j of B
      const colsOK = C => [0, 1].every(j => { const bj = p.Q.map(r => [r[j]]); const want = mulM(p.P, bj); return C.every((row, i) => row[j] === want[i][0]); });
      if (p.kind === 'entry') { const bj = p.Q.map(r => [r[p.j]]); return mulM(p.P, bj)[p.i][0] === q.answer; }
      const good = p.opts.filter(colsOK);
      return good.length === 1 && mat(good[0]) === q.answer;
    },
  });

  const det2 = P => P[0][0] * P[1][1] - P[0][1] * P[1][0];
  const det3 = P => P[0][0] * (P[1][1] * P[2][2] - P[1][2] * P[2][1]) - P[0][1] * (P[1][0] * P[2][2] - P[1][2] * P[2][0]) + P[0][2] * (P[1][0] * P[2][1] - P[1][1] * P[2][0]);
  /** determinant by row reduction, as a second opinion */
  function detGauss(P) {
    const a = P.map(r => r.slice()), n = a.length; let d = 1;
    for (let c = 0; c < n; c++) {
      let piv = c; while (piv < n && Math.abs(a[piv][c]) < 1e-12) piv++;
      if (piv === n) return 0;
      if (piv !== c) { [a[piv], a[c]] = [a[c], a[piv]]; d = -d; }
      d *= a[c][c];
      for (let r = c + 1; r < n; r++) { const f = a[r][c] / a[c][c]; for (let k = c; k < n; k++) a[r][k] -= f * a[c][k]; }
    }
    return d;
  }

  A.skill({
    id: 'pre.determinant-inverse', title: 'Determinants and inverses of matrices',
    learn: p(`<b>The determinant of ${mat([[V('a'), V('b')], [V('c'), V('d')]])} is ${V('ad')} − ${V('bc')}.</b> For a 3 × 3 matrix, expand along the top row: each entry times the 2 × 2 determinant left when you cross out its row and column, with signs + − +.`) +
      p(`<b>The inverse of a 2 × 2 matrix is ${sfrac('1', V('ad') + ' − ' + V('bc'))}${mat([[V('d'), '−' + V('b')], ['−' + V('c'), V('a')]])}</b>: swap the diagonal entries, change the signs of the other two, and divide everything by the determinant. If the determinant is 0, there is no inverse.`) +
      example('Example', `${V('A')} = ${mat([[5, 3], [3, 2]])}. det ${V('A')} = 10 − 9 = 1, so ${M.sup(V('A'), '−1')} = <b>${mat([[2, -3], [-3, 5]])}</b>. Check: ${V('A')}${M.sup(V('A'), '−1')} gives the identity.`),
    make(rng) {
      const kind = rng.pick(['det2', 'det3', 'inverse', 'inverse']);
      if (kind === 'det2') {
        const P = randMat(rng, 2, 2, -9, 9), d = det2(P);
        return { prompt: `Find the determinant.${big(mat(P))}`, type: 'number', answer: d, params: { kind, P },
          hints: [`For ${mat([[V('a'), V('b')], [V('c'), V('d')]])} the determinant is ${V('ad')} − ${V('bc')}.`, `${N(P[0][0])}·${wrap(P[1][1])} − ${wrap(P[0][1])}·${wrap(P[1][0])} = ${N(P[0][0] * P[1][1])} − ${wrap(P[0][1] * P[1][0])}.`, `The determinant is <b>${N(d)}</b>.`] };
      }
      if (kind === 'det3') {
        const P = randMat(rng, 3, 3, -4, 4), d = det3(P);
        const minor = (i, j) => P.filter((_, r) => r !== i).map(r => r.filter((_, c) => c !== j));
        const ms = [0, 1, 2].map(j => det2(minor(0, j)));
        return { prompt: `Find the determinant.${big(mat(P))}`, type: 'number', answer: d, params: { kind, P },
          hints: [`Expand along the top row with signs + − +: ${N(P[0][0])}·(minor) − ${wrap(P[0][1])}·(minor) + ${wrap(P[0][2])}·(minor).`, `The three 2 × 2 minors are ${ms.map(N).join(', ')}.`, `${N(P[0][0])}(${N(ms[0])}) − ${wrap(P[0][1])}(${N(ms[1])}) + ${wrap(P[0][2])}(${N(ms[2])}) = <b>${N(d)}</b>.`] };
      }
      let a, b, c, d, D;
      do { a = rng.int(-5, 6); b = rng.nz(-5, 5); c = rng.nz(-5, 5); d = rng.int(-5, 6); D = a * d - b * c; } while (![1, -1, 2, -2].includes(D) || a === d);
      const P = [[a, b], [c, d]];
      const opts = [[[d, -b], [-c, a], D], [[a, -b], [-c, d], D], [[d, b], [c, a], D], [[d, -b], [-c, a], -D]];
      const html = opts.map(([r1, r2, den]) => mat([r1.map(x => F(x, den)), r2.map(x => F(x, den))]));
      return { prompt: `Find the inverse.${big(`${V('A')} = ${mat(P)}`)}`, type: 'choice', answer: html[0], choices: html,
        params: { kind, P, opts },
        hints: [`First the determinant: ${N(a)}·${wrap(d)} − ${wrap(b)}·${wrap(c)} = ${N(D)}.`, `Swap ${N(a)} and ${N(d)}, and change the signs of ${N(b)} and ${N(c)}: ${mat([[d, -b], [-c, a]])}.`, `Divide every entry by ${N(D)}: <b>${M.sup(V('A'), '−1')} = ${html[0]}</b>`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind !== 'inverse') return near(detGauss(p.P), q.answer, 1e-6);
      const isI = R => near(R[0][0], 1) && near(R[0][1], 0) && near(R[1][0], 0) && near(R[1][1], 1);
      const good = p.opts.filter(([r1, r2, den]) => isI(mulM(p.P, [r1.map(x => x / den), r2.map(x => x / den)])));
      return good.length === 1 && mat([good[0][0].map(x => F(x, good[0][2])), good[0][1].map(x => F(x, good[0][2]))]) === q.answer;
    },
  });

  /* ---------- Unit 8: Probability and combinatorics ---------- */
  const Pn = (n, r) => `<sub>${n}</sub>P<sub>${r}</sub>`, Cn = (n, r) => `<sub>${n}</sub>C<sub>${r}</sub>`;
  const WORD_P = [
    (nm, n, r) => [`A club of ${n} members chooses a president${r === 3 ? ', a vice president and a treasurer' : ' and a vice president'}. No one holds two jobs. In how many ways can the jobs be filled?`, 'The jobs are different, so order matters.'],
    (nm, n, r) => [`${n} runners are in a race. In how many ways can ${r === 3 ? 'first, second and third' : r === 2 ? 'first and second' : 'first through fourth'} place be awarded?`, 'Places are different, so order matters.'],
    (nm, n, r) => [`${nm} has ${n} different books and will line up ${r} of them on a shelf. How many different arrangements are possible?`, 'A different order on the shelf is a different arrangement, so order matters.'],
  ];
  const WORD_C = [
    (nm, n, r) => [`A pizza shop offers ${n} toppings. How many different pizzas can be made with exactly ${r} different toppings?`, 'A pizza with mushrooms and olives is the same as one with olives and mushrooms, so order does not matter.'],
    (nm, n, r) => [`A committee of ${r} is chosen from a class of ${n} students. How many different committees are possible?`, 'The committee members have no different roles, so order does not matter.'],
    (nm, n, r) => [`${nm} has ${n} different books and will pack ${r} of them for a trip. How many different sets of books can ${nm} pack?`, 'Only which books matter, not their order.'],
  ];

  A.skill({
    id: 'pre.permutations-combinations', title: 'Permutations and combinations',
    learn: p(`Both count ways to pick ${V('r')} things from ${V('n')}. The question is: <b>does order matter?</b> If swapping two chosen items gives a different outcome (first and second place, president and treasurer), it is a permutation. If only the group matters (a committee, a hand of cards), it is a combination.`) +
      p(`<b>Permutations:</b> ${Pn(V('n'), V('r'))} = ${sfrac(V('n') + '!', `(${V('n')} − ${V('r')})!`)}, the product of ${V('r')} numbers counting down from ${V('n')}. <b>Combinations:</b> ${Cn(V('n'), V('r'))} = ${sfrac(Pn(V('n'), V('r')), V('r') + '!')}, because each group of ${V('r')} can be ordered in ${V('r')}! ways.`) +
      example('Example', `Choose 3 of 8 students for a committee. Order does not matter: ${Cn(8, 3)} = ${sfrac('8 · 7 · 6', '3 · 2 · 1')} = ${sfrac(336, 6)} = <b>56</b>.`),
    make(rng) {
      const kind = rng.pick(['P', 'C', 'P', 'C', 'nP', 'nC']);
      const n = rng.int(5, 12), r = rng.int(2, kind[0] === 'n' ? 4 : 3), nm = rng.pick(NAMES);
      const perm = kind.endsWith('P'), ans = perm ? nPr(n, r) : nCr(n, r);
      const down = Array.from({ length: r }, (_, i) => n - i).join(' · ');
      const work = perm ? `${Pn(n, r)} = ${down} = ${N(ans)}` : `${Cn(n, r)} = ${sfrac(down, Array.from({ length: r }, (_, i) => r - i).join(' · '))} = ${sfrac(N(nPr(n, r)), fact(r))} = ${N(ans)}`;
      if (kind[0] === 'n') {
        return { prompt: `Evaluate.${big(perm ? Pn(n, r) : Cn(n, r))}`, type: 'number', answer: ans, params: { n, r, perm },
          hints: [perm ? `${Pn(V('n'), V('r'))} multiplies ${r} numbers counting down from ${n}.` : `${Cn(V('n'), V('r'))} = ${sfrac(Pn(V('n'), V('r')), V('r') + '!')}: count down ${r} numbers from ${n}, then divide by ${r}!.`, `<b>${work}</b>.`] };
      }
      const [text, why] = rng.pick(perm ? WORD_P : WORD_C)(nm, n, r);
      return { prompt: text, type: 'number', answer: ans, params: { n, r, perm },
        hints: [why, perm ? `So use ${Pn(n, r)}: ${r} choices in a row, from ${n}, then ${n - 1}, and so on.` : `So use ${Cn(n, r)}: count the ordered choices, then divide by the ${fact(r)} orders of each group.`, `<b>${work}</b>.`] };
    },
    verify(q) {
      const { n, r, perm } = q.params;
      if (!perm) { let c = 0; for (let m = 0; m < (1 << n); m++) if (popcount(m) === r) c++; return c === q.answer; }
      const count = (used, left) => { if (!left) return 1; let c = 0; for (let i = 0; i < n; i++) if (!(used & (1 << i))) c += count(used | (1 << i), left - 1); return c; };
      return count(0, r) === q.answer;
    },
  });

  const COLOURS = [['red', 'blue'], ['green', 'yellow'], ['black', 'white'], ['purple', 'orange']];

  A.skill({
    id: 'pre.compound-probability', title: 'Probability of compound events',
    learn: p(`For two events in a row, <b>multiply the probabilities: P(${V('A')} and ${V('B')}) = P(${V('A')}) · P(${V('B')} given ${V('A')})</b>. With replacement the second probability is unchanged; without replacement, one item is gone, so both the count you want and the total may drop by 1.`) +
      p(`“At least one” is easiest through the complement: P(at least one) = 1 − P(none). When choosing a group at random, P = ${sfrac('number of groups you want', 'number of possible groups')}, counting both with combinations.`) +
      example('Example', `A bag has 5 red and 3 blue marbles. Two are drawn without replacement. P(both red) = ${F(5, 8)} · ${F(4, 7)} = ${F(20, 56, { raw: true })} = <b>${F(5, 14)}</b>.`),
    make(rng) {
      const kind = rng.pick(['both', 'repl', 'atLeast', 'group', 'dice']);
      const [c1, c2] = rng.pick(COLOURS), r = rng.int(2, 7), b = rng.int(2, 7), n = r + b;
      const fr = (x, y) => [x, y];
      let prompt, num, den, hints;
      if (kind === 'both') {
        [num, den] = fr(r * (r - 1), n * (n - 1));
        prompt = `A bag has ${r} ${c1} and ${b} ${c2} marbles. Two marbles are drawn without replacement. What is the probability that both are ${c1}?`;
        hints = [`First draw: ${F(r, n, { raw: true })}. One ${c1} marble is gone, so the second draw is ${F(r - 1, n - 1, { raw: true })}.`, `Multiply: ${F(r, n, { raw: true })} · ${F(r - 1, n - 1, { raw: true })} = ${F(num, den, { raw: true })}.`];
      } else if (kind === 'repl') {
        [num, den] = fr(r * b, n * n);
        prompt = `A bag has ${r} ${c1} and ${b} ${c2} marbles. A marble is drawn, put back, and a second marble is drawn. What is the probability that the first is ${c1} and the second is ${c2}?`;
        hints = [`With replacement the draws are independent: P(${c1}) = ${F(r, n, { raw: true })} and P(${c2}) = ${F(b, n, { raw: true })}.`, `Multiply: ${F(r, n, { raw: true })} · ${F(b, n, { raw: true })} = ${F(num, den, { raw: true })}.`];
      } else if (kind === 'atLeast') {
        [num, den] = fr(n * (n - 1) - b * (b - 1), n * (n - 1));
        prompt = `A bag has ${r} ${c1} and ${b} ${c2} marbles. Two marbles are drawn without replacement. What is the probability that at least one is ${c1}?`;
        hints = [`Use the complement: P(at least one ${c1}) = 1 − P(both ${c2}).`, `P(both ${c2}) = ${F(b, n, { raw: true })} · ${F(b - 1, n - 1, { raw: true })} = ${F(b * (b - 1), n * (n - 1), { raw: true })}, so the answer is 1 − ${F(b * (b - 1), n * (n - 1), { raw: true })} = ${F(num, den, { raw: true })}.`];
      } else if (kind === 'group') {
        const s = rng.int(3, 7), t = rng.int(3, 7), tot = s + t;
        [num, den] = fr(nCr(s, 3), nCr(tot, 3));
        prompt = `A class has ${s} students who play chess and ${t} who do not. Three students are picked at random. What is the probability that all three play chess? Give your answer as a fraction.`;
        hints = [`Count groups: the number of possible groups of 3 is ${Cn(tot, 3)} = ${nCr(tot, 3)}.`, `The groups of 3 chess players: ${Cn(s, 3)} = ${nCr(s, 3)}. So P = ${F(num, den, { raw: true })}.`];
        const [sn, sd] = M.simp(num, den);
        return { prompt, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, s, t }, hints: [...hints, `Simplified: <b>${M.fracText(sn, sd)}</b>.`] };
      } else {
        const s = rng.int(2, 12); let cnt = 0;
        for (let i = 1; i <= 6; i++) { const j = s - i; if (j >= 1 && j <= 6) cnt++; }
        [num, den] = fr(cnt, 36);
        prompt = `Two fair dice are rolled. What is the probability that the numbers add to ${s}? Give your answer as a fraction.`;
        hints = [`There are 6 × 6 = 36 equally likely outcomes.`, `List the pairs that add to ${s}: there are ${cnt}. So P = ${F(cnt, 36, { raw: true })}.`];
        const [sn, sd] = M.simp(num, den);
        return { prompt, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, s }, hints: [...hints, `Simplified: <b>${M.fracText(sn, sd)}</b>.`] };
      }
      const [sn, sd] = M.simp(num, den);
      return { prompt: prompt + ' Give your answer as a fraction.', type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, r, b }, hints: [...hints, `Simplified: <b>${M.fracText(sn, sd)}</b>.`] };
    },
    verify(q) {   // count outcomes one by one
      const p = q.params;
      if (p.kind === 'dice') { let c = 0; for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (i + j === p.s) c++; return near(c / 36, q.answer); }
      if (p.kind === 'group') {
        const tot = p.s + p.t; let all = 0, good = 0;
        for (let m = 0; m < (1 << tot); m++) if (popcount(m) === 3) { all++; if ((m >> p.s) === 0) good++; }
        return near(good / all, q.answer);
      }
      const bag = [...Array(p.r).fill(1), ...Array(p.b).fill(0)];
      let all = 0, good = 0;
      for (let i = 0; i < bag.length; i++) for (let j = 0; j < bag.length; j++) {
        if (p.kind !== 'repl' && i === j) continue;
        all++;
        if (p.kind === 'both' ? bag[i] && bag[j] : p.kind === 'repl' ? bag[i] && !bag[j] : bag[i] || bag[j]) good++;
      }
      return near(good / all, q.answer);
    },
  });

  /* ---------- Unit 9: Series ---------- */
  /** Σ with limits above and below */
  const sigma = (top, bottom, body) => `<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1;margin-right:4px"><small>${top}</small><span style="font-size:1.6em">Σ</span><small>${bottom}</small></span>${body}`;
  const K = V('k');

  A.skill({
    id: 'pre.finite-series', title: 'Arithmetic and geometric series',
    learn: p(`A series is the sum of the terms of a sequence. <b>Arithmetic series</b> (add ${V('d')} each time): ${M.sub(V('S'), V('n'))} = ${sfrac(V('n'), 2)}(${M.sub(V('a'), 1)} + ${M.sub(V('a'), V('n'))}), the number of terms times the average of the first and last. The last term is ${M.sub(V('a'), V('n'))} = ${M.sub(V('a'), 1)} + (${V('n')} − 1)${V('d')}.`) +
      p(`<b>Geometric series</b> (multiply by ${V('r')} each time): ${M.sub(V('S'), V('n'))} = ${sfrac(`${M.sub(V('a'), 1)}(1 − ${M.sup(V('r'), V('n'))})`, `1 − ${V('r')}`)}. In sigma notation, ${sigma(V('n'), `${K} = 1`, `(…)`)} means “substitute ${K} = 1, 2, …, ${V('n')} and add the results”.`) +
      example('Example', `${big(sigma(20, `${K} = 1`, `(3${K} + 2)`))}The terms are 5, 8, …, 62: arithmetic with 20 terms. ${M.sub(V('S'), 20)} = ${sfrac(20, 2)}(5 + 62) = 10 × 67 = <b>670</b>.`),
    make(rng) {
      const kind = rng.pick(['arith', 'geo', 'sigArith', 'sigGeo', 'word']);
      if (kind === 'arith' || kind === 'sigArith' || kind === 'word') {
        let a, d; const n = rng.int(8, 30);
        let prompt;
        if (kind === 'sigArith') {
          const pk = rng.nz(-5, 6), c = rng.int(-9, 9); a = pk + c; d = pk;
          prompt = `Evaluate.${big(sigma(n, `${K} = 1`, `(${M.poly([pk, c], 'k')})`))}`;
        } else if (kind === 'word') {
          a = rng.int(2, 15); d = rng.int(1, 5);
          const nm = rng.pick(NAMES);
          prompt = `${nm} saves $${a} in the first week and $${d} more each week than the week before. How much has ${nm} saved in total after ${n} weeks?`;
        } else {
          a = rng.int(-20, 20); d = rng.nz(-7, 9);
          prompt = `Find the sum of the first ${n} terms of the arithmetic series.${big(`${[0, 1, 2, 3].map(i => i ? wrap(a + i * d) : N(a)).join(' + ')} + …`)}`;
        }
        const last = a + (n - 1) * d, ans = n * (a + last) / 2;
        return { prompt, type: 'number', answer: ans, unit: kind === 'word' ? '$' : undefined, params: { kind, a, d, n },
          hints: [kind === 'sigArith' ? `Substitute ${K} = 1 and ${K} = ${n}: the first term is ${N(a)} and the last is ${N(last)}; the terms go up by ${N(d)} each time, so this is arithmetic.` : `It is arithmetic: the first term is ${N(a)} and the common difference is ${N(d)}.`,
            `The ${M.ordinal(n)} term is ${N(a)} + (${n} − 1)(${N(d)}) = ${N(last)}.`, `${M.sub(V('S'), n)} = ${sfrac(n, 2)}(${N(a)} + ${wrap(last)}) = <b>${N(ans)}</b>.`] };
      }
      const a = rng.nz(-5, 6), r = rng.pick([2, 3, -2, -3, 2, 4]), n = rng.int(4, r === 4 || Math.abs(r) === 3 ? 6 : 8);
      const ans = a * (1 - Math.pow(r, n)) / (1 - r);
      const prompt = kind === 'sigGeo' ? `Evaluate.${big(sigma(n, `${K} = 1`, `${N(a)}${wrap(r)}<sup>${K} − 1</sup>`))}`
        : `Find the sum of the first ${n} terms of the geometric series.${big(`${[0, 1, 2].map(i => i ? wrap(a * Math.pow(r, i)) : N(a)).join(' + ')} + …`)}`;
      return { prompt, type: 'number', answer: ans, params: { kind, a, r, n },
        hints: [`It is geometric: the first term is ${N(a)} and the common ratio is ${N(r)}, with ${n} terms.`, `${M.sub(V('S'), n)} = ${sfrac(`${N(a)}(1 − ${M.sup(wrap(r), n)})`, `1 − ${wrap(r)}`)} = ${sfrac(`${N(a)}(1 − ${wrap(Math.pow(r, n))})`, N(1 - r))}.`, `${M.sub(V('S'), n)} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {   // add the terms one at a time
      const p = q.params; let s = 0, t = p.a;
      for (let i = 0; i < p.n; i++) { s += t; t = p.d != null ? t + p.d : t * p.r; }
      return near(s, q.answer);
    },
  });

  const RATIOS = [[1, 2], [-1, 2], [1, 3], [-1, 3], [2, 3], [-2, 3], [1, 4], [3, 4], [-1, 4], [2, 5], [-3, 5], [1, 5]];

  A.skill({
    id: 'pre.infinite-geometric-series', title: 'Infinite geometric series',
    learn: p(`If the common ratio is between −1 and 1, the terms shrink toward 0 and the sum of infinitely many of them settles on a finite number. <b>When |${V('r')}| &lt; 1, ${M.sub(V('a'), 1)} + ${M.sub(V('a'), 1)}${V('r')} + ${M.sub(V('a'), 1)}${V('r')}² + … = ${sfrac(M.sub(V('a'), 1), `1 − ${V('r')}`)}.</b> If |${V('r')}| ≥ 1, the series has no sum.`) +
      p(`A repeating decimal is an infinite geometric series in disguise: 0.777… = 0.7 + 0.07 + 0.007 + …, with ${M.sub(V('a'), 1)} = ${F(7, 10)} and ${V('r')} = ${F(1, 10)}, so it equals ${sfrac(F(7, 10), F(9, 10))} = ${F(7, 9)}.`) +
      example('Example', `${big(`12 − 4 + ${F(4, 3)} − …`)}${M.sub(V('a'), 1)} = 12 and ${V('r')} = −${F(1, 3)}. The sum is ${sfrac(12, `1 + ${F(1, 3)}`)} = ${sfrac(12, F(4, 3))} = <b>9</b>.`),
    make(rng) {
      const kind = rng.pick(['list', 'list', 'sigma', 'decimal']);
      if (kind === 'decimal') {
        const two = rng.bool();
        let digits = two ? rng.int(10, 98) : rng.int(1, 8);
        if (two && digits % 11 === 0) digits += 1;
        const nines = two ? 99 : 9, [sn, sd] = M.simp(digits, nines);
        const rep = two ? String(digits).padStart(2, '0') : String(digits), shown = '0.' + rep.repeat(two ? 3 : 5) + '…';
        return { prompt: `Write the repeating decimal as a fraction in simplest form.${big(shown)}`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, rep },
          hints: [`Split it up: ${two ? `0.${rep} + 0.00${rep} + …` : `0.${rep} + 0.0${rep} + …`}. That is geometric with ${M.sub(V('a'), 1)} = ${F(digits, two ? 100 : 10, { raw: true })} and ${V('r')} = ${F(1, two ? 100 : 10)}.`,
            `Sum = ${sfrac(F(digits, two ? 100 : 10, { raw: true }), `1 − ${F(1, two ? 100 : 10)}`)} = ${F(digits, nines, { raw: true })}.`, `In simplest form: <b>${M.fracText(sn, sd)}</b>.`] };
      }
      const [rn, rd] = rng.pick(RATIOS);
      const a = rng.nz(-9, 9) * (rng.bool() ? rd * rd : rd);       // keep the first few terms whole where we can
      const [sn, sd] = M.simp(a * rd, rd - rn);
      const term = i => F(a * Math.pow(rn, i), Math.pow(rd, i));
      const rf = F(rn, rd);
      const prompt = kind === 'sigma' ? `Find the sum.${big(sigma('∞', `${K} = 1`, `${N(a)}(${rf})<sup>${K} − 1</sup>`))}`
        : `Find the sum of the infinite geometric series.${big(`${[0, 1, 2].map(term).join(' + ').replace(/\+ −/g, '− ')} + …`)}`;
      return { prompt, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, a, rn, rd },
        hints: [`The first term is ${M.sub(V('a'), 1)} = ${N(a)} and the common ratio is ${V('r')} = ${rf}. Since |${V('r')}| &lt; 1, the sum exists.`, `Sum = ${sfrac(M.sub(V('a'), 1), `1 − ${V('r')}`)} = ${sfrac(N(a), `1 − ${rn < 0 ? `(${rf})` : rf}`)} = ${sfrac(N(a), F(rd - rn, rd))}.`, `The sum is <b>${M.fracText(sn, sd)}</b>.`] };
    },
    verify(q) {   // partial sums
      const p = q.params; let s = 0;
      if (p.kind === 'decimal') { const L = p.rep.length; for (let i = 1; i <= 8; i++) s += Number(p.rep) / Math.pow(10, L * i); return near(s, q.answer, 1e-7); }
      let t = p.a; for (let i = 0; i < 400; i++) { s += t; t *= p.rn / p.rd; }
      return near(s, q.answer, 1e-9 * Math.max(1, Math.abs(q.answer)));
    },
  });
})();
