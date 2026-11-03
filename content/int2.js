/* Integrated Math 2. Factoring, quadratic equations and functions, exponents and radicals, complex
   numbers, similarity and right-triangle trigonometry, circles, probability. Follows the CPM Core
   Connections Integrated II course (Khan Academy's "Integrated math 2" covers the same ground). */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v, S = M.sup, R = M.sqrt;
  const X = V('x'), Y = V('y'), I = V('i');
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = (s) => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const wrap = x => x < 0 ? `(${N(x)})` : N(x);
  const sq = s => S(s, 2);                                       // s²
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const coef = a => a === 1 ? '' : a === -1 ? '−' : N(a);         // the coefficient in front of a bracket
  const key = s => A.normText(A.stripTags(s));
  /** the first `need` candidates that read differently from the answer and from each other */
  function distinct(answer, cands, need) {
    const seen = new Set([key(answer)]), out = [];
    for (const c of cands) { const k = key(c); if (!seen.has(k)) { seen.add(k); out.push(c); if (out.length === need) break; } }
    return out;
  }
  /** √n = k√r with r square-free: rootParts(72) → [6, 2] */
  function rootParts(n) { let k = 1, r = n; for (let f = 2; f * f <= r; f++) while (r % (f * f) === 0) { r /= f * f; k *= f; } return [k, r]; }
  const squareFree = r => rootParts(r)[0] === 1;
  /** k√r as HTML: rad(6, 2) → 6√2, rad(1, 2) → √2, rad(5, 1) → 5; a `mid` goes between them: rad(2, 3, i) → 2i√3 */
  function rad(k, r, mid) { mid = mid || ''; if (r === 1) return N(k) + mid; return (k === 1 ? '' : k === -1 ? '−' : N(k)) + mid + R(N(r)); }
  /** ⁿ√x */
  const nroot = (n, x) => (n === 2 ? '' : `<sup>${n}</sup>`) + R(x);
  /** multiply two coefficient lists (highest power first) */
  function mulPoly(a, b) { const out = new Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((y, j) => { out[i + j] += x * y; })); return out; }
  const evalPoly = (coefs, x) => coefs.reduce((acc, c) => acc * x + c, 0);
  /** (px + r)(qx + s), the two brackets in a fixed order so the same factorisation always reads the same */
  function factors2(p1, r, q1, s) {
    if (p1 > q1 || (p1 === q1 && r > s)) [p1, r, q1, s] = [q1, s, p1, r];
    return `(${M.poly([p1, r])})(${M.poly([q1, s])})`;
  }
  /** (x − h)² as HTML, or x² when h is 0 */
  const sqBin = (varName, h) => h === 0 ? sq(V(varName)) : sq(`(${M.poly([1, -h], varName)})`);
  /** a + bi */
  function cplx(re, im) {
    const imPart = Math.abs(im) === 1 ? I : N(Math.abs(im)) + I;
    if (im === 0) return N(re);
    if (re === 0) return (im < 0 ? '−' : '') + imPart;
    return `${N(re)} ${im < 0 ? '−' : '+'} ${imPart}`;
  }
  /** a right triangle with the right angle at C (bottom right), A bottom left, B top right; `angleAt` marks A or B */
  function triFig(bottom, right, hyp, angleAt, angleLabel) {
    const arc = angleAt === 'A' ? '<path class="stroke light" d="M60,150 A40,40 0 0 0 54,130"/>' : angleAt === 'B' ? '<path class="stroke light" d="M240,60 A40,40 0 0 1 206,40"/>' : '';
    const lab = angleLabel ? (angleAt === 'A' ? `<text x="64" y="144" font-size="14">${angleLabel}</text>` : `<text x="196" y="66" font-size="14" text-anchor="end">${angleLabel}</text>`) : '';
    return `<svg class="figure" viewBox="0 0 300 184" width="300" height="184" role="img" aria-label="right triangle ABC"><polygon class="fill" points="20,150 240,150 240,20"/><path class="stroke" d="M226,150 V136 H240"/>${arc}${lab}<text x="4" y="168">A</text><text x="246" y="168">C</text><text x="246" y="16">B</text><text x="130" y="174" text-anchor="middle">${bottom}</text><text x="252" y="92">${right}</text><text x="110" y="78" text-anchor="middle">${hyp}</text></svg>`;
  }
  /** a circle with named points on it (angles in degrees) joined by the given segments; 'O' is the centre */
  function circleFig(points, segments, arc) {
    const cx = 110, cy = 100, rr = 80;
    const pos = {};
    Object.keys(points).forEach(k => { const t = points[k] * Math.PI / 180; pos[k] = [cx + rr * Math.cos(t), cy - rr * Math.sin(t)]; });
    pos.O = [cx, cy];
    const seg = segments.map(([a, b]) => `<line class="stroke" x1="${pos[a][0].toFixed(1)}" y1="${pos[a][1].toFixed(1)}" x2="${pos[b][0].toFixed(1)}" y2="${pos[b][1].toFixed(1)}"/>`).join('');
    let arcPath = '';
    if (arc) { const [a, b] = arc; const sweep = ((points[b] - points[a]) % 360 + 360) % 360; arcPath = `<path class="stroke" style="stroke-width:5;opacity:.45" d="M${pos[a][0].toFixed(1)},${pos[a][1].toFixed(1)} A${rr},${rr} 0 ${sweep > 180 ? 1 : 0} 0 ${pos[b][0].toFixed(1)},${pos[b][1].toFixed(1)}"/>`; }
    const labels = Object.keys(pos).map(k => { const [x, y] = pos[k]; const dx = k === 'O' ? 6 : (x - cx) / rr * 14, dy = k === 'O' ? -6 : (cy - y) / rr * -14; return `<text x="${(x + dx).toFixed(1)}" y="${(y + dy + 5).toFixed(1)}" text-anchor="middle" font-size="15">${k}</text>`; }).join('');
    return `<svg class="figure" viewBox="0 0 220 200" width="220" height="200" role="img" aria-label="circle"><circle class="stroke light" cx="${cx}" cy="${cy}" r="${rr}"/>${arcPath}${seg}${pos.O && segments.some(s => s.includes('O')) ? `<circle cx="${cx}" cy="${cy}" r="2.5" fill="currentColor"/>` : ''}${labels}</svg>`;
  }

  A.course({
    id: 'int-2', title: 'Integrated Math 2', subject: 'High school', grade: 10, icon: '🧩', hue: 330,
    blurb: 'Factoring and quadratics, radicals and complex numbers, similar and right triangles with trigonometry, circles, and probability.',
    units: [
      { id: 'factoring', title: 'Factoring', blurb: 'Pulling out common factors, factoring trinomials, and the difference of squares.', skills: ['int2.gcf-factoring', 'int2.factor-trinomials-a1', 'int2.factor-trinomials-a', 'int2.difference-of-squares'] },
      { id: 'quadratic-equations', title: 'Quadratic equations', blurb: 'Four ways to solve: factoring, square roots, completing the square, and the quadratic formula.', skills: ['int2.solve-by-factoring', 'int2.solve-square-roots', 'int2.complete-the-square', 'int2.quadratic-formula'] },
      { id: 'quadratic-functions', title: 'Quadratic functions', blurb: 'Parabolas: vertex, axis, intercepts, transformations, and what they model.', skills: ['int2.parabola-features', 'int2.transformations', 'int2.quadratic-models'] },
      { id: 'radicals', title: 'Exponents and radicals', blurb: 'Fraction exponents, and simplifying and combining square roots.', skills: ['int2.rational-exponents', 'int2.radicals'] },
      { id: 'complex', title: 'Complex numbers', blurb: 'The imaginary unit, and arithmetic with a + bi.', skills: ['int2.imaginary-numbers', 'int2.complex-arithmetic'] },
      { id: 'triangles', title: 'Similarity and right triangles', blurb: 'Scale factors, the Pythagorean theorem, special right triangles, and trigonometric ratios.', skills: ['int2.similar-triangles', 'int2.pythagorean-theorem', 'int2.special-right-triangles', 'int2.trig-ratios', 'int2.solve-right-triangles'] },
      { id: 'circles', title: 'Circles', blurb: 'Arcs and sectors, inscribed angles, and the equation of a circle.', skills: ['int2.arc-sector', 'int2.inscribed-angles', 'int2.circle-equation'] },
      { id: 'probability', title: 'Probability', blurb: '“And” and “or”, conditional probability from two-way tables, and expected value.', skills: ['int2.compound-probability', 'int2.conditional-probability', 'int2.expected-value'] },
      { id: 'logic-proof', title: 'Logic and proof', blurb: 'Conjectures and counterexamples, converses, proof by contradiction, and the reason behind each step of a proof.', skills: ['int2.counterexamples', 'int2.converses', 'int2.proof-by-contradiction', 'int2.proof-reasons'] },
      { id: 'parabolas-more', title: 'More about parabolas', blurb: 'Writing a quadratic from its x-intercepts, quadratic inequalities, and the parabola as a focus and a directrix.', skills: ['int2.write-quadratic', 'int2.quadratic-inequalities', 'int2.focus-directrix'] },
      { id: 'quads-centers', title: 'Quadrilaterals and triangle centers', blurb: 'Sides, angles and diagonals of parallelograms, rectangles and rhombuses, and the centroid, circumcenter and incenter of a triangle.', skills: ['int2.quadrilateral-properties', 'int2.triangle-centers'] },
      { id: 'area-volume-probability', title: 'Area, similar solids and geometric probability', blurb: 'The area of a regular polygon from its apothem, how area and volume scale in similar solids, and probability as a ratio of lengths or areas.', skills: ['int2.regular-polygon-area', 'int2.similar-solids', 'int2.geometric-probability'] },
      { id: 'circle-lines', title: 'Circles: chords, tangents and secants', blurb: 'The perpendicular from the center to a chord, chords that cross, tangent lines, and the angles and lengths made by tangents and secants.', skills: ['int2.chords', 'int2.intersecting-chords', 'int2.tangent-lines', 'int2.tangents-secants'] },
      { id: 'tangent-ratio', title: 'The tangent ratio', blurb: 'Slope ratios as the tangent of an angle, finding missing legs, and heights and distances from angles of elevation and depression.', skills: ['int2.tangent-ratio', 'int2.tangent-applications'] },
    ],
  });

  /* ---------- Unit 1: Factoring ---------- */
  A.skill({
    id: 'int2.gcf-factoring', title: 'Factoring with the greatest common factor',
    learn: p(`The <b>greatest common factor</b> (GCF) of a polynomial is the biggest expression that divides every term: the GCF of the coefficients, times the lowest power of ${X} that appears in every term.`) +
      p(`Factoring it out is the distributive property in reverse: divide each term by the GCF and write the quotients in parentheses. For 6${sq(X)} + 9${X}, the GCF of 6 and 9 is 3 and both terms contain ${X}, so the GCF is 3${X} and 6${sq(X)} + 9${X} = 3${X}(2${X} + 3). Check by multiplying back.`) +
      p('Always look for a GCF first, before trying any other factoring method.') +
      example('Example', `${big(`Factor 8${S(X, 3)} − 12${sq(X)}`)}The GCF of 8 and 12 is 4; the lowest power of ${X} is ${sq(X)}. Divide: 8${S(X, 3)} ÷ 4${sq(X)} = 2${X} and −12${sq(X)} ÷ 4${sq(X)} = −3. So <b>4${sq(X)}(2${X} − 3)</b>.`),
    make(rng) {
      const g = rng.int(2, 7), vp = rng.int(1, 3), tri = rng.chance(0.4);
      let inner;
      do { inner = tri ? [rng.int(1, 5), rng.nz(-6, 6), rng.nz(-6, 6)] : [rng.int(1, 6), rng.nz(-7, 7)]; } while (inner.reduce((a, b) => M.gcd(a, b)) !== 1);
      const full = inner.map(c => g * c).concat(new Array(vp).fill(0));        // g·x^vp · inner, as coefficients
      const render = (gg, pw, inn) => `${M.term(gg, 'x', pw)}(${M.poly(inn)})`;
      const answer = render(g, vp, inner), gcf = M.term(g, 'x', vp);
      const cands = [render(g, vp === 1 ? 2 : vp - 1, inner), render(g, vp, inner.map((c, i) => i === inner.length - 1 ? -c : c)), render(g, vp, [g * inner[0]].concat(inner.slice(1))), render(g === 2 ? 3 : g - 1, vp, inner)];
      const choices = rng.shuffle([answer].concat(distinct(answer, cands, 3)));
      const terms = full.map((c, i) => c === 0 ? null : M.term(c, 'x', full.length - 1 - i)).filter(Boolean);
      return { prompt: `Factor out the greatest common factor.${big(M.poly(full))}`, type: 'choice', answer, choices, params: { full },
        hints: [`The GCF of the coefficients ${M.list(full.filter(c => c).map(c => N(Math.abs(c))))} is ${N(g)}.`,
          `Every term contains at least ${S(X, vp)}, so the GCF is ${gcf}.`,
          `Divide each term by ${gcf}: ${M.list(terms.map((t, i) => `${t} ÷ ${gcf} = ${M.term(inner[i], 'x', inner.length - 1 - i)}`))}.`,
          `<b>${answer}</b>. Multiply back to check: ${M.poly(full)}.`] };
    },
    verify(q) {
      const full = q.params.full;                      // re-derive the GCF from the expanded polynomial itself
      const g = full.filter(c => c !== 0).reduce((a, b) => M.gcd(a, b));
      let vp = 0; for (let i = full.length - 1; i >= 0 && full[i] === 0; i--) vp++;
      const inner = full.slice(0, full.length - vp).map(c => c / g);
      return q.answer === `${M.term(g, 'x', vp)}(${M.poly(inner)})`;
    },
  });

  A.skill({
    id: 'int2.factor-trinomials-a1', title: 'Factoring quadratics: leading coefficient 1',
    learn: p(`To factor ${sq(X)} + ${V('b')}${X} + ${V('c')}, look for two numbers that <b>multiply to ${V('c')}</b> and <b>add to ${V('b')}</b>. If they are ${V('r')} and ${V('s')}, then ${sq(X)} + ${V('b')}${X} + ${V('c')} = (${X} + ${V('r')})(${X} + ${V('s')}).`) +
      p(`The signs tell you where to look. If ${V('c')} is positive, both numbers have the same sign as ${V('b')}. If ${V('c')} is negative, the numbers have different signs, and the one with the bigger size takes the sign of ${V('b')}.`) +
      p('Check by multiplying out (FOIL, or a generic rectangle): you should get the original trinomial back.') +
      example('Example', `${big(`Factor ${M.poly([1, -2, -15])}`)}We need a product of −15 and a sum of −2: the pair is 3 and −5. So <b>(${X} + 3)(${X} − 5)</b>. Check: ${sq(X)} − 5${X} + 3${X} − 15 = ${M.poly([1, -2, -15])}. ✓`),
    make(rng) {
      let r, s;
      do { r = rng.nz(-9, 9); s = rng.nz(-9, 9); } while (r === s || r + s === 0);
      if (r > s) [r, s] = [s, r];
      const b = r + s, c = r * s;
      const fac = (u, w) => u <= w ? `(${M.poly([1, u])})(${M.poly([1, w])})` : `(${M.poly([1, w])})(${M.poly([1, u])})`;
      const answer = fac(r, s);
      const pairs = [];
      for (let u = -Math.abs(c); u <= Math.abs(c); u++) if (u && c % u === 0 && u <= c / u) pairs.push([u, c / u]);
      const shown = pairs.filter(([u]) => c < 0 || (u > 0) === (b > 0));
      const cands = [fac(-r, -s), fac(r, -s), fac(-r, s)].concat(pairs.filter(([u, w]) => u + w !== b).map(([u, w]) => fac(u, w)));
      const choices = rng.shuffle([answer].concat(distinct(answer, cands, 3)));
      return { prompt: `Factor.${big(M.poly([1, b, c]))}`, type: 'choice', answer, choices, params: { b, c },
        hints: [`Find two numbers that multiply to ${N(c)} and add to ${N(b)}. ${c > 0 ? `Since ${N(c)} is positive, both numbers are ${b > 0 ? 'positive' : 'negative'}.` : `Since ${N(c)} is negative, one number is positive and one is negative.`}`,
          `Pairs that multiply to ${N(c)}: ${shown.map(([u, w]) => `${N(u)} and ${N(w)}`).join('; ')}. Which pair adds to ${N(b)}?`,
          `${N(r)} × ${wrap(s)} = ${N(c)} and ${N(r)} + ${wrap(s)} = ${N(b)}.`,
          `<b>${answer}</b>. Check: ${M.poly(mulPoly([1, r], [1, s]))}. ✓`] };
    },
    verify(q) {
      const { b, c } = q.params;
      for (let r = -100; r <= 100; r++) {            // brute force the pair
        if (r === 0 || c % r !== 0) continue;
        const s = c / r;
        if (r + s === b && r <= s) return q.answer === `(${M.poly([1, r])})(${M.poly([1, s])})`;
      }
      return false;
    },
  });

  A.skill({
    id: 'int2.factor-trinomials-a', title: 'Factoring quadratics: leading coefficient not 1',
    learn: p(`When the leading coefficient ${V('a')} is not 1, the factors look like (${V('p')}${X} + ${V('r')})(${V('q')}${X} + ${V('s')}) with ${V('p')}${V('q')} = ${V('a')} and ${V('r')}${V('s')} = ${V('c')}. The middle term comes from the outer and inner products: ${V('b')} = ${V('p')}${V('s')} + ${V('q')}${V('r')}.`) +
      p(`A reliable method is to <b>split the middle term</b>: find two numbers that multiply to ${V('a')}·${V('c')} and add to ${V('b')}, use them to write ${V('b')}${X} as two terms, then factor by grouping. (In a generic rectangle, those two numbers are the two side products.)`) +
      example('Example', `${big(`Factor ${M.poly([2, 7, 3])}`)}${V('a')}·${V('c')} = 6. Numbers that multiply to 6 and add to 7: 1 and 6. Split: 2${sq(X)} + ${X} + 6${X} + 3 = ${X}(2${X} + 1) + 3(2${X} + 1) = <b>(2${X} + 1)(${X} + 3)</b>.`),
    make(rng) {
      let p1, q1, r, s, a, b, c;
      do {
        p1 = rng.int(1, 3); q1 = rng.int(1, 3); if (p1 === 1 && q1 === 1) q1 = rng.int(2, 3);
        r = rng.nz(-5, 5); s = rng.nz(-5, 5);
        a = p1 * q1; b = p1 * s + q1 * r; c = r * s;
      } while (b === 0 || M.gcd(M.gcd(a, b), c) !== 1);
      const answer = factors2(p1, r, q1, s);
      const cands = [factors2(p1, -r, q1, -s), factors2(p1, s, q1, r), factors2(1, r, a, s), factors2(a, r, 1, s), factors2(p1, -r, q1, s), factors2(p1, r, q1, -s)];
      const choices = rng.shuffle([answer].concat(distinct(answer, cands, 3)));
      const m1 = p1 * s, m2 = q1 * r, shared = M.poly([q1, s]);
      const sgn = (k, t) => `${k < 0 ? ' − ' : ' + '}${t}`;
      return { prompt: `Factor.${big(M.poly([a, b, c]))}`, type: 'choice', answer, choices, params: { a, b, c },
        hints: [`Multiply ${V('a')}·${V('c')} = ${N(a)} × ${wrap(c)} = ${N(a * c)}. Find two numbers that multiply to ${N(a * c)} and add to ${N(b)}: they are ${N(m1)} and ${N(m2)}.`,
          `Split the middle term: ${M.term(a, 'x', 2)}${sgn(m1, M.term(Math.abs(m1), 'x'))}${sgn(m2, M.term(Math.abs(m2), 'x'))}${sgn(c, N(Math.abs(c)))}.`,
          `Group and factor each pair: ${M.term(p1, 'x')}(${shared})${sgn(r, `${N(Math.abs(r))}(${shared})`)}. Both groups share (${shared}).`,
          `<b>${answer}</b>. Check the middle term: ${N(p1)}·${wrap(s)} + ${N(q1)}·${wrap(r)} = ${N(b)}. ✓`] };
    },
    verify(q) {
      const { a, b, c } = q.params;
      for (let p1 = 1; p1 <= a; p1++) {               // brute force over every p·q = a and r·s = c
        if (a % p1 !== 0) continue;
        const q1 = a / p1;
        for (let r = -Math.abs(c); r <= Math.abs(c); r++) {
          if (r === 0 || c % r !== 0) continue;
          const s = c / r;
          if (p1 * s + q1 * r === b) return q.answer === factors2(p1, r, q1, s);
        }
      }
      return false;
    },
  });

  A.skill({
    id: 'int2.difference-of-squares', title: 'Factoring a difference of squares',
    learn: p(`A <b>difference of squares</b> is one perfect square minus another: ${sq(V('a'))} − ${sq(V('b'))}. It always factors as <b>(${V('a')} + ${V('b')})(${V('a')} − ${V('b')})</b>. Multiplying back, the middle terms cancel: −${V('a')}${V('b')} + ${V('a')}${V('b')} = 0.`) +
      p(`To spot one: two terms, a minus between them, and both terms perfect squares (1, 4, 9, 16, 25, … and even powers of ${X}). ${sq(X)} − 49 = (${X} + 7)(${X} − 7) and 9${sq(X)} − 16 = (3${X} + 4)(3${X} − 4). A <i>sum</i> of squares like ${sq(X)} + 49 does not factor over the real numbers.`) +
      example('Example', `${big(`Factor 25${sq(X)} − 36`)}25${sq(X)} = ${sq(`(5${X})`)} and 36 = ${sq(6)}. So <b>(5${X} + 6)(5${X} − 6)</b>.`),
    make(rng) {
      const kind = rng.pick(['x', 'x', 'ax', 'ax', 'rev']);
      let a = 1, k = rng.int(2, 12);
      if (kind === 'ax') { a = rng.int(2, 7); k = rng.int(1, 9); while (M.gcd(a, k) !== 1) k = rng.int(1, 9); }
      const A2 = a * a, K2 = k * k;
      const fac = (aa, kk) => kind === 'rev' ? `(${N(kk)} + ${M.term(aa, 'x')})(${N(kk)} − ${M.term(aa, 'x')})` : `(${M.poly([aa, kk])})(${M.poly([aa, -kk])})`;
      const sqr = (aa, kk, sign) => kind === 'rev' ? sq(`(${N(kk)} ${sign} ${M.term(aa, 'x')})`) : sq(`(${M.poly([aa, sign === '+' ? kk : -kk])})`);
      const answer = fac(a, k);
      const cands = [sqr(a, k, '−'), sqr(a, k, '+'), fac(a, K2), fac(A2, k), fac(a, 2 * k), fac(a, k + 1)];
      const choices = rng.shuffle([answer].concat(distinct(answer, cands, 3)));
      const expr = kind === 'rev' ? `${N(K2)} − ${M.term(A2, 'x', 2)}` : M.poly([A2, 0, -K2]);
      const axSq = a === 1 ? sq(X) : sq(`(${M.term(a, 'x')})`);
      return { prompt: `Factor.${big(expr)}`, type: 'choice', answer, choices, params: { kind, A2, K2 },
        hints: ['Two terms, both perfect squares, with a minus between them: this is a difference of squares.',
          kind === 'rev' ? `${N(K2)} = ${sq(N(k))} and ${M.term(A2, 'x', 2)} = ${axSq}, so ${V('a')} = ${N(k)} and ${V('b')} = ${M.term(a, 'x')}.` : `${M.term(A2, 'x', 2)} = ${axSq} and ${N(K2)} = ${sq(N(k))}, so ${V('a')} = ${M.term(a, 'x')} and ${V('b')} = ${N(k)}.`,
          `Use ${sq(V('a'))} − ${sq(V('b'))} = (${V('a')} + ${V('b')})(${V('a')} − ${V('b')}): <b>${answer}</b>.`] };
    },
    verify(q) {
      const { kind, A2, K2 } = q.params;
      const a = Math.sqrt(A2), k = Math.sqrt(K2);
      if (!Number.isInteger(a) || !Number.isInteger(k)) return false;
      return q.answer === (kind === 'rev' ? `(${N(k)} + ${M.term(a, 'x')})(${N(k)} − ${M.term(a, 'x')})` : `(${M.poly([a, k])})(${M.poly([a, -k])})`);
    },
  });

  /* ---------- Unit 2: Quadratic equations ---------- */
  A.skill({
    id: 'int2.solve-by-factoring', title: 'Solving quadratics by factoring',
    learn: p(`The <b>zero product property</b>: if ${V('A')} · ${V('B')} = 0, then ${V('A')} = 0 or ${V('B')} = 0. So once a quadratic is written as a product that equals zero, each factor gives one solution.`) +
      p(`Steps: get everything on one side so the equation reads “… = 0”, factor, set each factor equal to 0, and solve the two little equations. (${X} − 3)(${X} + 5) = 0 gives ${X} = 3 or ${X} = −5. Watch the signs: the solutions are the <i>opposites</i> of the numbers in the factors.`) +
      example('Example', `${big(`Solve ${M.poly([1, 2, -24])} = 0`)}Factor: (${X} + 6)(${X} − 4) = 0. Then ${X} + 6 = 0 or ${X} − 4 = 0, so <b>${X} = −6 or ${X} = 4</b>. Check 4: 16 + 8 − 24 = 0. ✓`),
    make(rng) {
      let r, s;
      do { r = rng.nz(-9, 9); s = rng.nz(-9, 9); } while (r === s || r + s === 0);
      if (r > s) [r, s] = [s, r];
      const b = -(r + s), c = r * s;                                   // x² + bx + c = (x − r)(x − s)
      const moved = rng.chance(0.3);
      const eqn = moved ? `${M.poly([1, b, 0])} = ${N(-c)}` : `${M.poly([1, b, c])} = 0`;
      const factored = `(${M.poly([1, -r])})(${M.poly([1, -s])}) = 0`;
      const kind = rng.pick(['small', 'large', 'pair', 'pair']);
      const pairTxt = (u, w) => `${X} = ${N(Math.min(u, w))} or ${X} = ${N(Math.max(u, w))}`;
      const hints = [moved ? `First get 0 on one side: ${c < 0 ? 'subtract' : 'add'} ${N(Math.abs(c))} from both sides to get ${M.poly([1, b, c])} = 0.` : 'One side is already 0, so factor the other side.',
        `Two numbers that multiply to ${N(c)} and add to ${N(b)} are ${N(-r)} and ${N(-s)}, so the equation becomes ${factored}.`,
        `Zero product property: ${M.poly([1, -r])} = 0 or ${M.poly([1, -s])} = 0.`];
      if (kind === 'pair') {
        const answer = pairTxt(r, s);
        return { prompt: `Solve.${big(eqn)}`, type: 'choice', answer, choices: rng.shuffle([answer, pairTxt(-r, -s), pairTxt(r, -s), pairTxt(-r, s)]), params: { kind, b, c }, hints: hints.concat(`<b>${answer}</b>.`) };
      }
      const ans = kind === 'small' ? r : s;
      return { prompt: `Solve. Enter the ${kind === 'small' ? 'smaller' : 'larger'} solution.${big(eqn)}`, type: 'number', answer: ans, params: { kind, b, c },
        hints: hints.concat(`${X} = ${N(r)} or ${X} = ${N(s)}. The ${kind === 'small' ? 'smaller' : 'larger'} solution is <b>${N(ans)}</b>.`) };
    },
    verify(q) {
      const { kind, b, c } = q.params, f = x => x * x + b * x + c;
      const roots = []; for (let x = -60; x <= 60; x++) if (f(x) === 0) roots.push(x);     // brute force the roots
      if (roots.length !== 2) return false;
      if (kind === 'pair') return q.answer === `${X} = ${N(roots[0])} or ${X} = ${N(roots[1])}`;
      return q.answer === (kind === 'small' ? roots[0] : roots[1]);
    },
  });

  A.skill({
    id: 'int2.solve-square-roots', title: 'Solving quadratics with square roots',
    learn: p(`If an equation has a squared expression and no plain ${X} term, isolate the square and take the square root of both sides. Remember <b>both</b> roots: if ${sq(X)} = 49 then ${X} = 7 or ${X} = −7, written ${X} = ±7.`) +
      p(`The same works when a whole expression in parentheses is squared: ${sq(`(${X} − 2)`)} = 25 gives ${X} − 2 = ±5, so ${X} = 2 + 5 = 7 or ${X} = 2 − 5 = −3. Undo everything around the square first: move a constant across, divide away a coefficient.`) +
      example('Example', `${big(`3${sq(X)} − 12 = 63`)}Add 12: 3${sq(X)} = 75. Divide by 3: ${sq(X)} = 25. Square root: <b>${X} = ±5</b>.`),
    make(rng) {
      const kind = rng.pick(['plain', 'coef', 'shift', 'shift', 'const', 'both']);
      const root = rng.int(2, 12), k = root * root;
      if (kind === 'shift') {
        const h = rng.nz(-8, 8), which = rng.bool(), lo = h - root, hi = h + root, ans = which ? hi : lo;
        return { prompt: `Solve. Enter the ${which ? 'larger' : 'smaller'} solution.${big(`${sq(`(${M.poly([1, -h])})`)} = ${N(k)}`)}`, type: 'number', answer: ans, params: { kind, h, k, which },
          hints: [`Take the square root of both sides, keeping both signs: ${M.poly([1, -h])} = ±${N(root)}.`,
            `${h < 0 ? 'Subtract' : 'Add'} ${N(Math.abs(h))} ${h < 0 ? 'from' : 'to'} both sides: ${X} = ${N(h)} ± ${N(root)}.`,
            `${X} = ${N(hi)} or ${X} = ${N(lo)}. The ${which ? 'larger' : 'smaller'} solution is <b>${N(ans)}</b>.`] };
      }
      const a = kind === 'coef' || kind === 'both' ? rng.int(2, 5) : 1, d = kind === 'const' || kind === 'both' ? rng.nz(-30, 30) : 0;
      const rhs = a * k + d;
      const hints = [];
      if (d) hints.push(`${d < 0 ? 'Add' : 'Subtract'} ${N(Math.abs(d))} ${d < 0 ? 'to' : 'from'} both sides: ${M.term(a, 'x', 2)} = ${N(a * k)}.`);
      if (a !== 1) hints.push(`Divide both sides by ${N(a)}: ${sq(X)} = ${N(k)}.`);
      if (!hints.length) hints.push(`${sq(X)} is already by itself.`);
      hints.push(`Take the square root of both sides: ${X} = ±${R(N(k))} = ±${N(root)}.`, `The two solutions are ${N(root)} and ${N(-root)}; the positive one is <b>${N(root)}</b>.`);
      return { prompt: `Solve. Enter the positive solution.${big(`${M.poly([a, 0, d])} = ${N(rhs)}`)}`, type: 'number', answer: root, params: { kind, a, d, rhs }, hints };
    },
    verify(q) {
      const P = q.params, x = q.answer;
      if (P.kind === 'shift') return (x - P.h) * (x - P.h) === P.k && (P.which ? x > P.h : x < P.h);     // substitute back
      return P.a * x * x + P.d === P.rhs && x > 0;
    },
  });

  A.skill({
    id: 'int2.complete-the-square', title: 'Completing the square',
    learn: p(`A <b>perfect square trinomial</b> is the square of a binomial: ${sq(X)} + 6${X} + 9 = ${sq(`(${X} + 3)`)}. The constant is always the square of half the middle coefficient: (6 ÷ 2)² = 9.`) +
      p(`To write ${Y} = ${sq(X)} + ${V('b')}${X} + ${V('c')} in <b>vertex form</b> ${Y} = ${sq(`(${X} − ${V('h')})`)} + ${V('k')}: take half of ${V('b')}, square it, add it <i>and</i> subtract it so the value does not change, then fold the perfect square. The vertex is (${V('h')}, ${V('k')}); mind the sign, since ${sq(`(${X} + 3)`)} means ${V('h')} = −3.`) +
      example('Example', `${big(`${Y} = ${M.poly([1, 8, 10])}`)}Half of 8 is 4, and ${sq(4)} = 16. ${Y} = (${sq(X)} + 8${X} + 16) + 10 − 16 = <b>${sq(`(${X} + 4)`)} − 6</b>. The vertex is (−4, −6).`),
    make(rng) {
      const m = rng.nz(-7, 7), c = rng.int(-12, 15);
      const b = 2 * m, k = c - m * m;
      const vf = (mm, kk) => `${Y} = ${sq(`(${M.poly([1, mm])})`)}${kk === 0 ? '' : ' ' + M.signed(kk)}`;
      const answer = vf(m, k);
      const cands = [vf(-m, k), vf(m, c), vf(m, c + m * m), vf(-m, c), vf(b, c - b * b)];
      const choices = rng.shuffle([answer].concat(distinct(answer, cands, 3)));
      return { prompt: `Complete the square to write the function in vertex form.${big(`${Y} = ${M.poly([1, b, c])}`)}`, type: 'choice', answer, choices, params: { b, c },
        hints: [`Half of ${N(b)} is ${N(m)}, and ${wrap(m)}² = ${N(m * m)}. That is the constant that completes the square.`,
          `Add it and subtract it: ${Y} = (${M.poly([1, b, m * m])}) ${M.signed(c)} − ${N(m * m)}.`,
          `The trinomial is a perfect square: ${M.poly([1, b, m * m])} = ${sq(`(${M.poly([1, m])})`)}. And ${N(c)} − ${N(m * m)} = ${N(k)}.`,
          `<b>${answer}</b>. The vertex is ${M.pt(-m, k)}.`] };
    },
    verify(q) {
      const { b, c } = q.params, f = x => x * x + b * x + c;
      let best = -20, bestV = f(-20);                 // brute-force the minimum: that is the vertex
      for (let x = -20; x <= 20; x += 0.5) if (f(x) < bestV) { bestV = f(x); best = x; }
      return q.answer === `${Y} = ${sq(`(${M.poly([1, -best])})`)}${bestV === 0 ? '' : ' ' + M.signed(bestV)}`;
    },
  });

  A.skill({
    id: 'int2.quadratic-formula', title: 'The quadratic formula and the discriminant',
    learn: p(`Any quadratic ${V('a')}${sq(X)} + ${V('b')}${X} + ${V('c')} = 0 can be solved with the <b>quadratic formula</b>: ${X} = ${F(`−${V('b')} ± ${R(`${sq(V('b'))} − 4${V('a')}${V('c')}`)}`, `2${V('a')}`)}. Write down ${V('a')}, ${V('b')} and ${V('c')} with their signs first, then substitute carefully.`) +
      p(`The part under the root, ${sq(V('b'))} − 4${V('a')}${V('c')}, is the <b>discriminant</b>. It tells you how many real solutions there are before you solve: <b>positive → two</b>, <b>zero → exactly one</b> (a repeated root), <b>negative → none</b> (the parabola misses the ${X}-axis).`) +
      example('Example', `${big(`${M.poly([2, -3, -4])} = 0`)}${V('a')} = 2, ${V('b')} = −3, ${V('c')} = −4. Discriminant: 9 − 4(2)(−4) = 41, positive, so two solutions. ${X} = ${F(`3 ± ${R(41)}`, 4)}, so ${X} ≈ <b>2.35</b> or ${X} ≈ <b>−0.85</b>.`),
    make(rng) {
      const kind = rng.pick(['root', 'root', 'count', 'disc']);
      let a, b, c, D;
      do { a = rng.int(1, 3); b = rng.nz(-9, 9); c = rng.nz(-9, 9); D = b * b - 4 * a * c; } while (kind === 'root' && D <= 0);
      if (kind === 'count' && rng.chance(0.3)) { const m = rng.nz(-5, 5); a = 1; b = 2 * m; c = m * m; D = 0; }     // a repeated root now and then
      const eqn = `${M.poly([a, b, c])} = 0`;
      const h1 = `Identify ${V('a')} = ${N(a)}, ${V('b')} = ${N(b)}, ${V('c')} = ${N(c)}.`;
      const h2 = `Discriminant: ${sq(V('b'))} − 4${V('a')}${V('c')} = ${wrap(b)}² − 4(${N(a)})(${wrap(c)}) = ${N(b * b)} − ${wrap(4 * a * c)} = ${N(D)}.`;
      if (kind === 'disc') return { prompt: `What is the discriminant of this equation?${big(eqn)}`, type: 'number', answer: D, params: { kind, a, b, c }, hints: [h1, `Substitute into ${sq(V('b'))} − 4${V('a')}${V('c')}: ${wrap(b)}² − 4(${N(a)})(${wrap(c)}).`, `${N(b * b)} − ${wrap(4 * a * c)} = <b>${N(D)}</b>.`] };
      const counts = ['Two real solutions', 'One real solution', 'No real solutions'];
      if (kind === 'count') {
        const ans = D > 0 ? counts[0] : D === 0 ? counts[1] : counts[2];
        return { prompt: `How many real solutions does this equation have?${big(eqn)}`, type: 'choice', choices: counts, keepOrder: true, answer: ans, params: { kind, a, b, c },
          hints: [h1, h2, `The discriminant is ${D > 0 ? 'positive' : D === 0 ? 'zero' : 'negative'}, so there ${D === 0 ? 'is' : 'are'} <b>${ans.toLowerCase()}</b>.`] };
      }
      const which = rng.bool(), rt = Math.sqrt(D), rt3 = M.round(rt, 3);
      const ans = M.round((-b + (which ? 1 : -1) * rt) / (2 * a), 2);
      return { prompt: `Use the quadratic formula to solve. Enter the ${which ? 'larger' : 'smaller'} solution, rounded to two decimal places if needed.${big(eqn)}`, type: 'number', answer: ans, tolerance: 0.006, params: { kind, a, b, c, which },
        hints: [h1, `Substitute: ${X} = ${F(`${N(-b)} ± ${R(`${wrap(b)}² − 4(${N(a)})(${wrap(c)})`)}`, `2(${N(a)})`)}.`,
          `${h2} So ${X} = ${F(`${N(-b)} ± ${R(N(D))}`, N(2 * a))}, and ${R(N(D))} ${rt3 === rt ? '=' : '≈'} ${N(rt3)}.`,
          `The ${which ? 'larger' : 'smaller'} solution uses the ${which ? '+' : '−'} sign: ${X} = ${F(`${N(-b)} ${which ? '+' : '−'} ${N(rt3)}`, N(2 * a))} ≈ <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const { kind, a, b, c, which } = q.params, f = x => a * x * x + b * x + c;
      const xv = -b / (2 * a), fv = f(xv);                            // the vertex decides everything
      if (kind === 'disc') return Math.abs(q.answer - (-4 * a * fv)) < 1e-6;
      if (kind === 'count') return q.answer === (a * fv < -1e-9 ? 'Two real solutions' : Math.abs(fv) < 1e-9 ? 'One real solution' : 'No real solutions');
      const x = q.answer, slope = Math.abs(2 * a * x + b);
      if (Math.abs(f(x)) > slope * 0.0051 + 1e-6) return false;      // f(x) ≈ 0, allowing for the rounding of x
      return which ? x >= xv - 0.006 : x <= xv + 0.006;
    },
  });

  /* ---------- Unit 3: Quadratic functions ---------- */
  A.skill({
    id: 'int2.parabola-features', title: 'Features of parabolas',
    learn: p(`The graph of ${Y} = ${V('a')}${sq(X)} + ${V('b')}${X} + ${V('c')} is a parabola. It opens up if ${V('a')} is positive and down if ${V('a')} is negative. Its <b>axis of symmetry</b> is the vertical line ${X} = ${F(`−${V('b')}`, `2${V('a')}`)}, and the <b>vertex</b> sits on that line: substitute that ${X} to get its ${Y}-coordinate.`) +
      p(`The <b>${Y}-intercept</b> is where ${X} = 0, so it is simply (0, ${V('c')}). The <b>${X}-intercepts</b> (also called zeros or roots) are where ${Y} = 0; in factored form ${Y} = ${V('a')}(${X} − ${V('r')})(${X} − ${V('s')}) they are ${X} = ${V('r')} and ${X} = ${V('s')}, and the axis of symmetry runs halfway between them.`) +
      example('Example', `${big(`${Y} = ${M.poly([2, -8, 5])}`)}Axis: ${X} = −(−8) ÷ (2 · 2) = 2. Vertex: ${Y} = 2(4) − 16 + 5 = −3, so the vertex is <b>(2, −3)</b>. The ${Y}-intercept is (0, 5).`),
    make(rng) {
      const kind = rng.pick(['axis', 'vertex', 'vertex', 'yint', 'xint']);
      if (kind === 'xint') {
        const a = rng.pick([1, 1, -1, 2]);
        let r = rng.nz(-7, 7), s = rng.nz(-7, 7); while (s === r || s === -r) s = rng.nz(-7, 7); if (r > s) [r, s] = [s, r];
        const coefs = mulPoly([a], mulPoly([1, -r], [1, -s]));
        const fact = `${coef(a)}(${M.poly([1, -r])})(${M.poly([1, -s])})`;
        const shown = rng.bool() ? fact : M.poly(coefs);
        const pts = (u, w) => `${M.pt(Math.min(u, w), 0)} and ${M.pt(Math.max(u, w), 0)}`;
        const answer = pts(r, s);
        return { prompt: `What are the ${X}-intercepts of the graph?${big(`${Y} = ${shown}`)}`, type: 'choice', answer, choices: rng.shuffle([answer, pts(-r, -s), pts(r, -s), pts(-r, s)]), params: { kind, coefs, r, s },
          hints: [`The ${X}-intercepts are the points where ${Y} = 0.`, `${shown === fact ? 'The function is already factored' : 'Factor'}: ${Y} = ${fact}. Set each factor equal to 0.`, `${X} = ${N(r)} or ${X} = ${N(s)}, so the intercepts are <b>${answer}</b>.`] };
      }
      const a = rng.pick([1, 1, -1, 2, -2, 3]), h = rng.nz(-6, 6), k = rng.int(-9, 9);
      const b = -2 * a * h, c = a * h * h + k;                        // vertex (h, k) written out in standard form
      const fn = `${Y} = ${M.poly([a, b, c])}`;
      const h1 = `Read off ${V('a')} = ${N(a)}, ${V('b')} = ${N(b)}, ${V('c')} = ${N(c)}.`;
      const h2 = `Axis of symmetry: ${X} = ${F(`−${V('b')}`, `2${V('a')}`)} = ${F(N(-b), N(2 * a))} = ${N(h)}`;
      if (kind === 'axis') return { prompt: `What is the axis of symmetry of the graph? Enter the number ${V('k')} in its equation ${X} = ${V('k')}.${big(fn)}`, type: 'number', answer: h, params: { kind, a, b, c }, hints: [h1, `${h2}.`, `The axis of symmetry is the line <b>${X} = ${N(h)}</b>.`] };
      if (kind === 'yint') return { prompt: `What is the ${Y}-intercept of the graph? Enter its ${Y}-coordinate.${big(fn)}`, type: 'number', answer: c, params: { kind, a, b, c }, hints: [`The ${Y}-intercept is where ${X} = 0.`, `Substitute ${X} = 0: every term with an ${X} disappears, leaving ${Y} = ${N(c)}.`, `The ${Y}-intercept is (0, ${N(c)}), so the answer is <b>${N(c)}</b>.`] };
      const answer = M.pt(h, k);
      const choices = rng.shuffle([answer].concat(distinct(answer, [M.pt(-h, k), M.pt(h, c), M.pt(k, h), M.pt(h, -k), M.pt(-h, -k)], 3)));
      return { prompt: `What is the vertex of the parabola?${big(fn)}`, type: 'choice', answer, choices, params: { kind, a, b, c },
        hints: [h1, `${h2}, so the vertex has ${X} = ${N(h)}.`, `Substitute ${X} = ${N(h)}: ${Y} = ${coef(a)}${wrap(h)}² ${M.signed(b)}(${N(h)}) ${M.signed(c)} = ${N(k)}.`, `The vertex is <b>${answer}</b>.`] };
    },
    verify(q) {
      const { kind, a, b, c, coefs, r, s } = q.params;
      if (kind === 'xint') return evalPoly(coefs, r) === 0 && evalPoly(coefs, s) === 0 && q.answer === `${M.pt(r, 0)} and ${M.pt(s, 0)}`;
      const f = x => a * x * x + b * x + c;
      if (kind === 'yint') return q.answer === f(0);
      let best = -30, bestV = f(-30);                                 // brute-force the extreme point on a half-unit grid
      for (let x = -30; x <= 30; x += 0.5) if ((a > 0 && f(x) < bestV) || (a < 0 && f(x) > bestV)) { bestV = f(x); best = x; }
      return kind === 'axis' ? q.answer === best : q.answer === M.pt(best, bestV);
    },
  });

  A.skill({
    id: 'int2.transformations', title: 'Transforming the parent function y = x²',
    learn: p(`Every parabola is a transformed copy of the parent graph ${Y} = ${sq(X)}. In <b>vertex form</b> ${Y} = ${V('a')}${sq(`(${X} − ${V('h')})`)} + ${V('k')}, the graph is shifted <b>${V('h')} units horizontally</b> and <b>${V('k')} units vertically</b>, so the vertex moves from (0, 0) to (${V('h')}, ${V('k')}).`) +
      p(`The horizontal shift is the counter-intuitive one: ${sq(`(${X} − 3)`)} shifts <i>right</i> 3, and ${sq(`(${X} + 3)`)} shifts <i>left</i> 3. The number ${V('a')} stretches the graph vertically (makes it narrower) when |${V('a')}| is bigger than 1, compresses it (makes it wider) when |${V('a')}| is between 0 and 1, and flips it upside down when ${V('a')} is negative.`) +
      example('Example', `${big(`${Y} = −2${sq(`(${X} + 1)`)} + 5`)}Compared with ${Y} = ${sq(X)}: reflected over the ${X}-axis, stretched vertically by a factor of 2, and shifted <b>left 1</b> and <b>up 5</b>. The vertex is (−1, 5).`),
    make(rng) {
      const kind = rng.pick(['describe', 'describe', 'equation', 'stretch']);
      const dir = (h, k) => `${h < 0 ? 'left' : 'right'} ${N(Math.abs(h))} and ${k < 0 ? 'down' : 'up'} ${N(Math.abs(k))}`;
      const vform = (a, h, k) => `${Y} = ${coef(a)}${sq(`(${M.poly([1, -h])})`)} ${M.signed(k)}`;
      const h = rng.nz(-7, 7), k = rng.nz(-7, 7);
      if (kind === 'describe') {
        const answer = `Shift ${dir(h, k)}`;
        return { prompt: `How is the graph of this function related to the graph of ${Y} = ${sq(X)}?${big(vform(1, h, k))}`, type: 'choice', answer, choices: rng.shuffle([answer, `Shift ${dir(-h, k)}`, `Shift ${dir(h, -k)}`, `Shift ${dir(-h, -k)}`]), params: { kind, h, k },
          hints: [`In ${Y} = ${sq(`(${X} − ${V('h')})`)} + ${V('k')} the vertex moves to (${V('h')}, ${V('k')}). The parentheses here hold (${M.poly([1, -h])}), so ${V('h')} = ${N(h)}: the sign inside the parentheses is flipped.`, `${V('k')} = ${N(k)} is added outside the parentheses, so the graph moves ${k < 0 ? 'down' : 'up'} ${N(Math.abs(k))}.`, `<b>Shift ${dir(h, k)}</b>: the vertex is now at ${M.pt(h, k)}.`] };
      }
      if (kind === 'equation') {
        const answer = vform(1, h, k);
        return { prompt: `Which function is the graph of ${Y} = ${sq(X)} shifted ${dir(h, k)}?`, type: 'choice', answer, choices: rng.shuffle([answer, vform(1, -h, k), vform(1, h, -k), vform(1, -h, -k)]), params: { kind, h, k },
          hints: [`A shift ${h < 0 ? 'left' : 'right'} ${N(Math.abs(h))} puts ${V('h')} = ${N(h)} inside the parentheses: (${X} − ${wrap(h)}) = (${M.poly([1, -h])}).`, `A shift ${k < 0 ? 'down' : 'up'} ${N(Math.abs(k))} adds ${N(k)} outside the parentheses.`, `<b>${answer}</b>.`] };
      }
      const a = rng.pick([2, 3, 4, -2, -3, 0.5, 0.25, -0.5]);
      const words = aa => cap((aa < 0 ? `reflected over the ${X}-axis and ` : '') + (Math.abs(aa) > 1 ? `stretched vertically by a factor of ${N(Math.abs(aa))}` : `compressed vertically by a factor of ${N(Math.abs(aa))}`));
      const answer = words(a);
      const choices = rng.shuffle([answer].concat(distinct(answer, [words(-a), words(1 / a), words(-1 / a), `Shifted ${a < 0 ? 'down' : 'up'} ${N(Math.abs(a))}`], 3)));
      return { prompt: `Compared with the graph of ${Y} = ${sq(X)}, the graph of this function is …${big(`${Y} = ${coef(a)}${sq(X)}`)}`, type: 'choice', answer, choices, params: { kind, a },
        hints: [`The number in front of ${sq(X)} is ${V('a')} = ${N(a)}. ${a < 0 ? 'It is negative, so the parabola is flipped to open downward.' : 'It is positive, so the parabola still opens upward.'}`, `|${V('a')}| = ${N(Math.abs(a))}, which is ${Math.abs(a) > 1 ? 'bigger than 1: every height is multiplied by ' + N(Math.abs(a)) + ', a vertical stretch (narrower).' : 'between 0 and 1: every height is multiplied by ' + N(Math.abs(a)) + ', a vertical compression (wider).'}`, `<b>${answer}</b>.`] };
    },
    verify(q) {
      const { kind, h, k, a } = q.params;
      if (kind === 'stretch') return q.answer === cap((a < 0 ? `reflected over the ${X}-axis and ` : '') + (Math.abs(a) > 1 ? `stretched vertically by a factor of ${N(Math.abs(a))}` : `compressed vertically by a factor of ${N(Math.abs(a))}`)) && Math.abs(a * 4 - (a * (2 * 2))) < 1e-9;
      const f = x => (x - h) * (x - h) + k;                            // brute-force the vertex of the shifted graph
      let best = -20, bestV = f(-20);
      for (let x = -20; x <= 20; x++) if (f(x) < bestV) { bestV = f(x); best = x; }
      const dirTxt = `${best < 0 ? 'left' : 'right'} ${N(Math.abs(best))} and ${bestV < 0 ? 'down' : 'up'} ${N(Math.abs(bestV))}`;
      return q.answer === (kind === 'describe' ? `Shift ${dirTxt}` : `${Y} = ${sq(`(${M.poly([1, -best])})`)} ${M.signed(bestV)}`);
    },
  });

  A.skill({
    id: 'int2.quadratic-models', title: 'Quadratic word problems',
    learn: p(`Things that are thrown or launched follow a parabola. If ${V('h')}(${V('t')}) is the height after ${V('t')} seconds, the highest point is the <b>vertex</b>: it happens at ${V('t')} = ${F(`−${V('b')}`, `2${V('a')}`)}, and the maximum height is ${V('h')} of that time. The object lands when ${V('h')}(${V('t')}) = 0: solve with factoring or the quadratic formula and keep the positive time.`) +
      p(`Area problems work the same way. A rectangle with a fixed amount of fencing ${V('P')} and width ${V('w')} has length ${V('P')}/2 − ${V('w')}, so its area ${V('A')} = ${V('w')}(${V('P')}/2 − ${V('w')}) is a parabola opening down, and the biggest area is at the vertex.`) +
      example('Example', `${big(`${V('h')}(${V('t')}) = −16${sq(V('t'))} + 64${V('t')} + 5`)}Vertex at ${V('t')} = −64 ÷ (2 · (−16)) = 2 seconds. Maximum height: ${V('h')}(2) = −64 + 128 + 5 = <b>69 feet</b>.`),
    make(rng) {
      const kind = rng.pick(['max', 'tmax', 'ground', 'area']);
      const name = rng.pick(NAMES), T = V('t');
      if (kind === 'area') {
        const P = rng.pick([40, 48, 60, 80, 100, 120, 160, 200]), w = P / 4, wantArea = rng.bool();
        const thing = rng.pick(['a rectangular garden', 'a dog pen', 'a vegetable patch', 'a chicken run']);
        return { prompt: `${name} has ${N(P)} meters of fencing for ${thing}. If the width is ${V('w')} meters, the area is ${V('A')}(${V('w')}) = ${V('w')}(${N(P / 2)} − ${V('w')}). ${wantArea ? 'What is the largest area possible?' : 'What width gives the largest area?'}`, type: 'number', answer: wantArea ? w * w : w, unit: wantArea ? 'm²' : 'm', params: { kind, P, wantArea },
          hints: [`Expand: ${V('A')} = −${sq(V('w'))} + ${N(P / 2)}${V('w')}. This parabola opens down, so its vertex is the maximum.`, `Vertex at ${V('w')} = ${F(`−${V('b')}`, `2${V('a')}`)} = ${F(N(-P / 2), N(-2))} = ${N(w)}, so the best shape is a ${N(w)} by ${N(w)} square.`, wantArea ? `Largest area: ${N(w)} × ${N(w)} = <b>${N(w * w)}</b> m².` : `The best width is <b>${N(w)}</b> m.`] };
      }
      const t2 = rng.pick([0.5, 1, 1.5]), t1 = rng.pick([1.5, 2, 2.5, 3, 4, 5].filter(t => t > t2));
      const v = 16 * (t1 - t2), h0 = 16 * t1 * t2;                    // h(t) = −16(t − t1)(t + t2) = −16t² + vt + h0
      const tmax = v / 32, hmax = h0 + v * v / 64, D = v * v + 64 * h0;
      const scene = rng.pick([`${name} throws a ball straight up from a balcony`, `A model rocket is launched from a platform`, `${name} tosses a stone upward from a bridge`, `A ball is kicked upward from the top of a ramp`]);
      const fnTxt = `${V('h')}(${T}) = ${M.poly([-16, v, h0], 't')}`;
      const intro = `${scene}. Its height in feet after ${T} seconds is ${fnTxt}.`;
      if (kind === 'ground') return { prompt: `${intro} After how many seconds does it hit the ground?`, type: 'number', answer: t1, unit: 's', params: { kind, v, h0 },
        hints: [`On the ground the height is 0: solve −16${sq(T)} + ${N(v)}${T} + ${N(h0)} = 0.`, `Quadratic formula with ${V('a')} = −16, ${V('b')} = ${N(v)}, ${V('c')} = ${N(h0)}: the discriminant is ${N(v * v)} + ${N(64 * h0)} = ${N(D)}, and ${R(N(D))} = ${N(Math.sqrt(D))}.`, `${T} = ${F(`−${N(v)} ± ${N(Math.sqrt(D))}`, '−32')} gives ${N(t1)} or ${N(-t2)}. Time cannot be negative, so it lands after <b>${N(t1)}</b> seconds.`] };
      const hints = [`The maximum height is at the vertex. With ${V('a')} = −16 and ${V('b')} = ${N(v)}, the vertex is at ${T} = ${F(`−${V('b')}`, `2${V('a')}`)} = ${F(N(-v), N(-32))} = ${N(tmax)} seconds.`];
      if (kind === 'tmax') return { prompt: `${intro} After how many seconds does it reach its maximum height?`, type: 'number', answer: tmax, unit: 's', params: { kind, v, h0 }, hints: hints.concat(`The maximum height is reached after <b>${N(tmax)}</b> seconds.`) };
      return { prompt: `${intro} What is its maximum height?`, type: 'number', answer: hmax, unit: 'ft', params: { kind, v, h0 },
        hints: hints.concat(`Substitute ${T} = ${N(tmax)}: ${V('h')} = −16(${N(tmax)})² + ${N(v)}(${N(tmax)}) + ${N(h0)} = ${N(-16 * tmax * tmax)} + ${N(v * tmax)} + ${N(h0)}.`, `The maximum height is <b>${N(hmax)}</b> feet.`) };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'area') {
        let bestW = 0, bestA = 0;                                    // scan every half-metre width
        for (let w = 0; w <= P.P / 2; w += 0.5) { const area = w * (P.P / 2 - w); if (area > bestA) { bestA = area; bestW = w; } }
        return Math.abs(q.answer - (P.wantArea ? bestA : bestW)) < 1e-9;
      }
      const h = t => -16 * t * t + P.v * t + P.h0;
      if (P.kind === 'ground') return q.answer > 0 && Math.abs(h(q.answer)) < 1e-9;
      let bestT = 0, bestH = h(0);                                   // scan the flight in small steps
      for (let t = 0; t <= 10; t += 0.005) if (h(t) > bestH + 1e-12) { bestH = h(t); bestT = t; }
      return Math.abs(q.answer - (P.kind === 'tmax' ? bestT : bestH)) < 1e-6;
    },
  });

  /* ---------- Unit 4: Exponents and radicals ---------- */
  A.skill({
    id: 'int2.rational-exponents', title: 'Rational exponents',
    learn: p(`A fraction in an exponent means a root: <b>${S(V('b'), `1/${V('n')}`)} = ${nroot(V('n'), V('b'))}</b>. So ${S(8, '1/3')} is the cube root of 8, which is 2. With a numerator too, the denominator is still the root and the numerator is a power: <b>${S(V('b'), `${V('m')}/${V('n')}`)} = ${nroot(V('n'), S(V('b'), V('m')))} = ${S(`(${nroot(V('n'), V('b'))})`, V('m'))}</b>. Taking the root first keeps the numbers small.`) +
      p(`${S(8, '2/3')} = ${S(`(${nroot(3, 8)})`, 2)} = ${sq(2)} = 4. A negative exponent still means “reciprocal”: ${S(8, '−2/3')} = ${F(1, 4)}. The same rule turns radicals into powers: ${nroot(5, S(X, 2))} = ${S(X, '2/5')}.`) +
      example('Example', `${big(S(16, '3/4'))}Fourth root first: ${nroot(4, 16)} = 2. Then the power: ${S(2, 3)} = <b>8</b>.`),
    make(rng) {
      const kind = rng.pick(['eval', 'eval', 'eval', 'power']);
      if (kind === 'power') {
        const n = rng.pick([2, 3, 3, 4, 5]), m = rng.pick([1, 2, 3, 5, 7].filter(x => x !== n && M.gcd(x, n) === 1));
        const e = (num, den) => den === 1 ? String(num) : `${num}/${den}`;
        const opts = m === 1 ? [{ t: S(X, e(1, n)), v: 1 / n }, { t: S(X, String(n)), v: n }, { t: S(X, `−1/${n}`), v: -1 / n }, { t: S(X, `−${n}`), v: -n }]
          : [{ t: S(X, e(m, n)), v: m / n }, { t: S(X, e(n, m)), v: n / m }, { t: S(X, e(m * n, 1)), v: m * n }, { t: S(X, e(1, m * n)), v: 1 / (m * n) }];
        return { prompt: `Write as a single power of ${X}.${big(nroot(n, m === 1 ? X : S(X, m)))}`, type: 'choice', answer: opts[0].t, choices: rng.shuffle(opts.map(o => o.t)), params: { kind, m, n, opts },
          hints: [`The index of the root (${N(n)}) becomes the denominator of the exponent: ${nroot(n, X)} = ${S(X, e(1, n))}.`, `The power inside (${N(m)}) is the numerator.`, `<b>${opts[0].t}</b>.`] };
      }
      const [r, n] = rng.pick([[2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [9, 2], [10, 2], [2, 3], [3, 3], [4, 3], [5, 3], [2, 4], [3, 4], [2, 5]]);
      const m = rng.pick([1, 2, 3].filter(x => x !== n && M.gcd(x, n) === 1 && Math.pow(r, x) <= 1000));
      const base = Math.pow(r, n), pw = Math.pow(r, m), neg = rng.chance(0.25);
      const ans = neg ? 1 / pw : pw;
      const hints = [`The denominator ${N(n)} is the root: ${nroot(n, N(base))} = ${N(r)}, because ${S(N(r), n)} = ${N(base)}.`, m === 1 ? `The numerator is 1, so there is no further power.` : `The numerator ${N(m)} is the power: ${S(N(r), m)} = ${N(pw)}.`];
      if (neg) hints.push(`The negative sign means the reciprocal: ${F(1, N(pw))}.`);
      hints.push(`<b>${S(N(base), `${neg ? '−' : ''}${m}/${n}`)} = ${neg ? F(1, pw) : N(pw)}</b>.`);
      return { prompt: `Evaluate.${big(S(N(base), `${neg ? '−' : ''}${m}/${n}`))}`, type: 'number', answer: ans, answerText: neg ? M.fracText(1, pw) : String(pw), params: { kind, base, m, n, neg }, hints };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'power') { const o = P.opts.find(x => x.t === q.answer); return !!o && Math.abs(Math.pow(2, o.v) - Math.pow(Math.pow(2, P.m), 1 / P.n)) < 1e-9; }
      return Math.abs(Math.pow(P.base, (P.neg ? -1 : 1) * P.m / P.n) - q.answer) < 1e-9 * Math.max(1, q.answer);
    },
  });

  A.skill({
    id: 'int2.radicals', title: 'Simplifying and combining radicals',
    learn: p(`A square root is <b>simplified</b> when the number under it has no perfect-square factor left. Use ${R(`${V('a')}${V('b')}`)} = ${R(V('a'))} · ${R(V('b'))}: find the largest perfect square that divides the radicand and take its root outside. ${R(72)} = ${R(36)} · ${R(2)} = 6${R(2)}.`) +
      p(`<b>Adding and subtracting</b> works like combining like terms: only like radicals combine. 3${R(5)} + 4${R(5)} = 7${R(5)}, but 3${R(5)} + 4${R(3)} stays as it is. Simplify first: ${R(8)} + ${R(2)} = 2${R(2)} + ${R(2)} = 3${R(2)}.`) +
      p(`<b>Multiplying</b>: multiply the outsides, multiply the insides, then simplify. 2${R(3)} · 5${R(6)} = 10${R(18)} = 10 · 3${R(2)} = 30${R(2)}.`) +
      example('Example', `${big(`Simplify ${R(50)}`)}The largest perfect square in 50 is 25: ${R(50)} = ${R(25)} · ${R(2)} = <b>5${R(2)}</b>.`),
    make(rng) {
      const kind = rng.pick(['simplify', 'simplify', 'add', 'mul']);
      const sqf = [2, 3, 5, 6, 7, 10, 11, 13];
      const val = o => o.k * Math.sqrt(o.r);
      const opts = (ans, cands) => {                                // the answer first, then up to three choices that differ in value and in text
        const out = [{ t: rad(ans.k, ans.r), k: ans.k, r: ans.r }];
        for (const c of cands) { const t = rad(c.k, c.r); if (out.length < 4 && c.k !== 0 && Math.abs(val(c) - val(ans)) > 1e-9 && !out.some(o => key(o.t) === key(t))) out.push({ t, k: c.k, r: c.r }); }
        return out;
      };
      const finish = (prompt, o, params, hints) => ({ prompt, type: 'choice', answer: o[0].t, choices: rng.shuffle(o.map(x => x.t)), params: Object.assign({ kind, opts: o }, params), hints });
      if (kind === 'simplify') {
        const k = rng.int(2, 7), r = rng.pick(sqf), n = k * k * r;
        const o = opts({ k, r }, [{ k: k * k, r }, { k: r, r: k }, { k: k + 1, r }, { k: k - 1, r }]);
        return finish(`Simplify.${big(R(N(n)))}`, o, { n }, [`Look for the largest perfect square that divides ${N(n)}: ${N(n)} = ${N(k * k)} × ${N(r)}.`, `${R(N(n))} = ${R(N(k * k))} · ${R(N(r))} = ${N(k)} · ${R(N(r))}.`, `<b>${o[0].t}</b>.`]);
      }
      if (kind === 'add') {
        const r = rng.pick(sqf), a = rng.int(2, 9), b = rng.int(1, 9), sub = rng.bool() && a > b, hidden = rng.chance(0.4) && b > 1 && b < 6;
        const total = sub ? a - b : a + b, second = hidden ? R(N(b * b * r)) : rad(b, r);
        const o = opts({ k: total, r }, [{ k: sub ? a + b : a - b, r }, { k: a * b, r }, hidden ? { k: sub ? a - b * b : a + b * b, r } : { k: total, r: sqf[(sqf.indexOf(r) + 1) % sqf.length] }, { k: total + 1, r }]);
        return finish(`Simplify.${big(`${rad(a, r)} ${sub ? '−' : '+'} ${second}`)}`, o, { a, b, r, sub, hidden }, [hidden ? `First simplify ${R(N(b * b * r))}: ${N(b * b * r)} = ${N(b * b)} × ${N(r)}, so ${R(N(b * b * r))} = ${rad(b, r)}.` : `Both terms are multiples of ${R(N(r))}, so they are like radicals.`, `${sub ? 'Subtract' : 'Add'} the numbers in front and keep the radical: ${N(a)} ${sub ? '−' : '+'} ${N(b)} = ${N(total)}.`, `<b>${o[0].t}</b>.`]);
      }
      const a = rng.int(2, 6), b = rng.int(2, 6), r = rng.pick(sqf.slice(0, 5)), s = rng.pick(sqf.slice(0, 5));
      const [k2, r2] = rootParts(r * s), [k3, r3] = rootParts(r + s);
      const o = opts({ k: a * b * k2, r: r2 }, [{ k: (a + b) * k2, r: r2 }, { k: a * b * k3, r: r3 }, { k: a * b * k2 * k2, r: r2 }, { k: a * b * k2 + 1, r: r2 }]);
      return finish(`Multiply and simplify.${big(`${rad(a, r)} · ${rad(b, s)}`)}`, o, { a, b, r, s }, [`Multiply the numbers in front and the numbers under the roots separately: ${N(a)} · ${N(b)} = ${N(a * b)} and ${R(N(r))} · ${R(N(s))} = ${R(N(r * s))}.`, k2 === 1 ? `${R(N(r * s))} has no perfect-square factor, so it is already simplified.` : `Simplify ${R(N(r * s))}: ${N(r * s)} = ${N(k2 * k2)} × ${N(r2)}, so ${R(N(r * s))} = ${rad(k2, r2)}.`, `<b>${o[0].t}</b>.`]);
    },
    verify(q) {
      const P = q.params, o = P.opts.find(x => x.t === q.answer);
      if (!o || !squareFree(o.r)) return false;                      // must be fully simplified
      const v = P.kind === 'simplify' ? Math.sqrt(P.n) : P.kind === 'add' ? P.a * Math.sqrt(P.r) + (P.sub ? -1 : 1) * Math.sqrt(P.b * P.b * P.r) : P.a * Math.sqrt(P.r) * P.b * Math.sqrt(P.s);
      return Math.abs(v - o.k * Math.sqrt(o.r)) < 1e-9;
    },
  });

  /* ---------- Unit 5: Complex numbers ---------- */
  A.skill({
    id: 'int2.imaginary-numbers', title: 'The imaginary unit',
    learn: p(`No real number squares to a negative, so mathematicians defined a new one: <b>${I} = ${R('−1')}</b>, which means <b>${sq(I)} = −1</b>. Square roots of negatives become multiples of ${I}: ${R('−36')} = ${R(36)} · ${R('−1')} = 6${I}, and ${R('−12')} = ${R(12)} · ${I} = 2${I}${R(3)} (simplify the root as usual).`) +
      p(`Powers of ${I} cycle every four: ${S(I, 1)} = ${I}, ${sq(I)} = −1, ${S(I, 3)} = −${I}, ${S(I, 4)} = 1, then it repeats. To find ${S(I, V('n'))}, divide ${V('n')} by 4 and look at the remainder: remainder 1 → ${I}, 2 → −1, 3 → −${I}, 0 → 1.`) +
      example('Example', `${big(S(I, 23))}23 ÷ 4 = 5 remainder 3, so ${S(I, 23)} has the same value as ${S(I, 3)}: <b>−${I}</b>.`),
    make(rng) {
      const kind = rng.pick(['power', 'power', 'sqrt', 'simplify']);
      if (kind === 'power') {
        const n = rng.int(5, 60), rem = n % 4, cycle = ['1', I, '−1', `−${I}`];
        return { prompt: `Simplify.${big(S(I, n))}`, type: 'choice', choices: cycle, keepOrder: true, answer: cycle[rem], params: { kind, n },
          hints: [`Powers of ${I} repeat every 4: ${I}, −1, −${I}, 1, ${I}, −1, …`, `${N(n)} ÷ 4 = ${N(Math.floor(n / 4))} remainder ${rem}, so ${S(I, n)} has the same value as ${S(I, rem === 0 ? 4 : rem)}.`, `<b>${S(I, n)} = ${cycle[rem]}</b>.`] };
      }
      const val = o => o.k * Math.sqrt(o.r) * (o.im ? 1 : -1000);   // keeps real and imaginary options apart
      const opts = (ans, cands) => {
        const out = [Object.assign({ t: rad(ans.k, ans.r, ans.im ? I : '') }, ans)];
        for (const c of cands) { const t = rad(c.k, c.r, c.im ? I : ''); if (out.length < 4 && Math.abs(val(c) - val(ans)) > 1e-9 && !out.some(o => key(o.t) === key(t))) out.push(Object.assign({ t }, c)); }
        return out;
      };
      if (kind === 'sqrt') {
        const k = rng.int(2, 12), K = k * k;
        const o = opts({ k, r: 1, im: true }, [{ k: -k, r: 1, im: false }, { k, r: 1, im: false }, { k: K, r: 1, im: true }, { k: k * 2, r: 1, im: true }]);
        return { prompt: `Simplify.${big(R(N(-K)))}`, type: 'choice', answer: o[0].t, choices: rng.shuffle(o.map(x => x.t)), params: { kind, K, opts: o },
          hints: [`Split off the negative: ${R(N(-K))} = ${R(N(K))} · ${R('−1')}.`, `${R(N(K))} = ${N(k)} and ${R('−1')} = ${I}.`, `<b>${o[0].t}</b>.`] };
      }
      const k = rng.int(2, 5), r = rng.pick([2, 3, 5, 6, 7]), K = k * k * r;
      const o = opts({ k, r, im: true }, [{ k, r, im: false }, { k: -k, r, im: false }, { k: r, r: k, im: true }, { k: k * k, r, im: true }]);
      return { prompt: `Simplify.${big(R(N(-K)))}`, type: 'choice', answer: o[0].t, choices: rng.shuffle(o.map(x => x.t)), params: { kind, K, opts: o },
        hints: [`Split off the negative: ${R(N(-K))} = ${R(N(K))} · ${R('−1')} = ${R(N(K))} · ${I}.`, `Simplify ${R(N(K))}: ${N(K)} = ${N(k * k)} × ${N(r)}, so ${R(N(K))} = ${rad(k, r)}.`, `<b>${o[0].t}</b> (the ${I} is usually written before the root so it is not mistaken for part of the radicand).`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'power') {
        let re = 1, im = 0;                                            // multiply by i, n times
        for (let j = 0; j < P.n; j++) [re, im] = [-im, re];
        return q.answer === (re === 1 ? '1' : re === -1 ? '−1' : im === 1 ? I : `−${I}`);
      }
      const o = P.opts.find(x => x.t === q.answer);
      return !!o && o.im === true && o.k > 0 && squareFree(o.r) && o.k * o.k * o.r === P.K;
    },
  });

  A.skill({
    id: 'int2.complex-arithmetic', title: 'Adding, subtracting, and multiplying complex numbers',
    learn: p(`A <b>complex number</b> has the form ${V('a')} + ${V('b')}${I}: a real part ${V('a')} and an imaginary part ${V('b')}. To <b>add or subtract</b>, combine real parts with real parts and imaginary parts with imaginary parts, just like like terms: (3 + 2${I}) + (1 − 5${I}) = 4 − 3${I}. When subtracting, distribute the minus over both parts.`) +
      p(`To <b>multiply</b>, expand with FOIL, replace ${sq(I)} with −1, and collect: (2 + 3${I})(1 − 4${I}) = 2 − 8${I} + 3${I} − 12${sq(I)} = 2 − 5${I} + 12 = 14 − 5${I}.`) +
      example('Example', `${big(`(4 − ${I})(2 + 3${I})`)}8 + 12${I} − 2${I} − 3${sq(I)} = 8 + 10${I} + 3 = <b>11 + 10${I}</b>.`),
    make(rng) {
      const op = rng.pick(['add', 'sub', 'mul', 'mul']);
      const a = rng.nz(-9, 9), b = rng.nz(-9, 9), c = rng.nz(-9, 9), d = rng.nz(-9, 9);
      const z = (re, im) => `(${cplx(re, im)})`;
      let re, im, cands, expr, hints;
      if (op === 'add') { re = a + c; im = b + d; expr = `${z(a, b)} + ${z(c, d)}`; cands = [[a + c, b - d], [a - c, b + d], [a + c, b * d], [a + c + 1, b + d]]; hints = [`Add the real parts: ${N(a)} + ${wrap(c)} = ${N(re)}.`, `Add the imaginary parts: ${N(b)}${I} + ${wrap(d)}${I} = ${N(im)}${I}.`]; }
      else if (op === 'sub') { re = a - c; im = b - d; expr = `${z(a, b)} − ${z(c, d)}`; cands = [[a - c, b + d], [a + c, b - d], [c - a, d - b], [a - c, b]]; hints = [`Distribute the minus sign: ${cplx(a, b)} − ${wrap(c)} − ${wrap(d)}${I}.`, `Real parts: ${N(a)} − ${wrap(c)} = ${N(re)}. Imaginary parts: ${N(b)}${I} − ${wrap(d)}${I} = ${N(im)}${I}.`]; }
      else { re = a * c - b * d; im = a * d + b * c; expr = `${z(a, b)}${z(c, d)}`; cands = [[a * c + b * d, im], [a * c, b * d], [re, a * d - b * c], [re, -im]]; hints = [`FOIL: ${N(a)}·${wrap(c)} + ${N(a)}·${wrap(d)}${I} + ${N(b)}${I}·${wrap(c)} + ${N(b)}${I}·${wrap(d)}${I} = ${N(a * c)} ${M.signed(a * d)}${I} ${M.signed(b * c)}${I} ${M.signed(b * d)}${sq(I)}.`, `${sq(I)} = −1, so ${N(b * d)}${sq(I)} = ${N(-b * d)}.`, `Collect: real ${N(a * c)} ${M.signed(-b * d)} = ${N(re)}; imaginary ${N(a * d)}${I} ${M.signed(b * c)}${I} = ${N(im)}${I}.`]; }
      const opts = [{ t: cplx(re, im), re, im }];
      for (const [r2, i2] of cands) { const t = cplx(r2, i2); if (opts.length < 4 && (r2 !== re || i2 !== im) && !opts.some(o => key(o.t) === key(t))) opts.push({ t, re: r2, im: i2 }); }
      return { prompt: `${op === 'add' ? 'Add' : op === 'sub' ? 'Subtract' : 'Multiply'}. Write the result in the form ${V('a')} + ${V('b')}${I}.${big(expr)}`, type: 'choice', answer: opts[0].t, choices: rng.shuffle(opts.map(o => o.t)), params: { op, a, b, c, d, opts }, hints: hints.concat(`<b>${opts[0].t}</b>.`) };
    },
    verify(q) {
      const { op, a, b, c, d, opts } = q.params, o = opts.find(x => x.t === q.answer);
      if (!o) return false;
      if (op === 'add') return o.re - a === c && o.im - b === d;        // undo the operation instead of redoing it
      if (op === 'sub') return o.re + c === a && o.im + d === b;
      const m1 = a * a + b * b;                                         // z1·z2·conj(z1) must equal z2·|z1|²
      return o.re * a + o.im * b === c * m1 && o.im * a - o.re * b === d * m1;
    },
  });

  /* ---------- Unit 6: Similarity and right triangles ---------- */
  const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];
  const toRad = d => d * Math.PI / 180;

  A.skill({
    id: 'int2.similar-triangles', title: 'Solving similar triangles',
    learn: p(`Two triangles are <b>similar</b> when one is a scaled copy of the other: corresponding angles are equal and <b>corresponding sides are in the same ratio</b>. That ratio is the <b>scale factor</b>. In △ABC ~ △DEF the order of the letters tells you which parts match: A ↔ D, B ↔ E, C ↔ F, so side AB matches DE, BC matches EF and AC matches DF.`) +
      p(`To find a missing side, find the scale factor from a pair of matching sides you know (new ÷ original), then multiply. Or set up a proportion and cross-multiply: ${F('AB', 'DE')} = ${F('BC', 'EF')}.`) +
      example('Example', `△ABC ~ △DEF with AB = 6, BC = 9 and DE = 10. The scale factor from ABC to DEF is 10 ÷ 6 = ${F(5, 3)}, so EF = 9 × ${F(5, 3)} = <b>15</b>.`),
    make(rng) {
      const [k, kTxt] = rng.pick([[2, '2'], [3, '3'], [1.5, '1.5'], [2.5, '2.5'], [0.5, '0.5'], [4, '4']]);
      const base = [rng.int(2, 9) * 2, rng.int(2, 9) * 2, rng.int(2, 9) * 2];
      const names = [['AB', 'DE'], ['BC', 'EF'], ['AC', 'DF']];
      const [known, ask] = rng.sample([0, 1, 2], 2);
      const reverse = rng.bool();                                     // ask for a side of the small triangle instead
      const small = base, large = base.map(s => s * k);
      const given = reverse ? { orig: large, img: small, from: 1, to: 0 } : { orig: small, img: large, from: 0, to: 1 };
      const ans = given.img[ask];
      const sentence = reverse
        ? `${names[known][1]} = ${N(large[known])}, ${names[ask][1]} = ${N(large[ask])} and ${names[known][0]} = ${N(small[known])}. Find ${names[ask][0]}.`
        : `${names[known][0]} = ${N(small[known])}, ${names[ask][0]} = ${N(small[ask])} and ${names[known][1]} = ${N(large[known])}. Find ${names[ask][1]}.`;
      const kk = reverse ? 1 / k : k;
      const sf = given.img[known] / given.orig[known];
      return { prompt: `△ABC ~ △DEF. ${sentence}`, type: 'number', answer: ans, params: { a1: given.orig[known], b1: given.img[known], a2: given.orig[ask] },
        hints: [`Match the sides by the order of the letters: ${names[known][0]} ↔ ${names[known][1]} and ${names[ask][0]} ↔ ${names[ask][1]}.`,
          `Scale factor: ${N(given.img[known])} ÷ ${N(given.orig[known])} = ${N(M.round(sf, 4))}${Math.abs(kk - sf) < 1e-9 && kk < 1 ? ` (${M.fracText(given.img[known], given.orig[known])})` : ''}.`,
          `Multiply the matching side: ${N(given.orig[ask])} × ${N(M.round(sf, 4))} = <b>${N(ans)}</b>.`] };
    },
    verify(q) { const { a1, b1, a2 } = q.params; return Math.abs(a1 * q.answer - b1 * a2) < 1e-9; },     // cross-multiply the proportion
  });

  A.skill({
    id: 'int2.pythagorean-theorem', title: 'The Pythagorean theorem',
    learn: p(`In a right triangle with legs ${V('a')} and ${V('b')} and hypotenuse ${V('c')} (the longest side, opposite the right angle): <b>${sq(V('a'))} + ${sq(V('b'))} = ${sq(V('c'))}</b>. To find the hypotenuse, add the squares and take the square root. To find a leg, subtract: ${sq(V('a'))} = ${sq(V('c'))} − ${sq(V('b'))}.`) +
      p(`Some whole-number triples come up again and again: 3-4-5, 5-12-13, 8-15-17, 7-24-25, and their multiples such as 6-8-10 or 9-12-15. Spotting one saves the arithmetic.`) +
      example('Example', `Legs 9 and 12. ${sq(9)} + ${sq(12)} = 81 + 144 = 225, and ${R(225)} = <b>15</b>. (It is 3-4-5 scaled by 3.)`),
    make(rng) {
      const t = rng.pick(TRIPLES), m = t[2] > 20 ? 1 : rng.int(1, t[2] > 13 ? 2 : 4);
      const [a, b, c] = t.map(x => x * m), kind = rng.pick(['hyp', 'leg', 'leg', 'word']);
      if (kind === 'word') {
        const name = rng.pick(NAMES);
        return { prompt: `${name} leans a ${N(c)}-foot ladder against a wall. The foot of the ladder is ${N(a)} feet from the wall. How high up the wall does the ladder reach?`, type: 'number', answer: b, unit: 'ft', params: { a, c, find: 'leg' },
          hints: [`The wall, the ground and the ladder form a right triangle; the ladder is the hypotenuse.`, `${sq(V('h'))} = ${sq(N(c))} − ${sq(N(a))} = ${N(c * c)} − ${N(a * a)} = ${N(b * b)}.`, `${V('h')} = ${R(N(b * b))} = <b>${N(b)}</b> feet.`] };
      }
      if (kind === 'hyp') return { prompt: `A right triangle has legs of length ${N(a)} and ${N(b)}. How long is the hypotenuse?${triFig(N(a), N(b), V('c'))}`, type: 'number', answer: c, params: { a, b, find: 'hyp' },
        hints: [`${sq(V('c'))} = ${sq(V('a'))} + ${sq(V('b'))} = ${sq(N(a))} + ${sq(N(b))}.`, `${N(a * a)} + ${N(b * b)} = ${N(c * c)}.`, `${V('c')} = ${R(N(c * c))} = <b>${N(c)}</b>.`] };
      return { prompt: `A right triangle has hypotenuse ${N(c)} and one leg ${N(a)}. How long is the other leg?${triFig(N(a), V('b'), N(c))}`, type: 'number', answer: b, params: { a, c, find: 'leg' },
        hints: [`The hypotenuse is ${N(c)}, so ${sq(V('b'))} = ${sq(V('c'))} − ${sq(V('a'))}.`, `${N(c * c)} − ${N(a * a)} = ${N(b * b)}.`, `${V('b')} = ${R(N(b * b))} = <b>${N(b)}</b>.`] };
    },
    verify(q) { const P = q.params; return P.find === 'hyp' ? Math.abs(Math.hypot(P.a, P.b) - q.answer) < 1e-9 : Math.abs(Math.hypot(P.a, q.answer) - P.c) < 1e-9; },
  });

  A.skill({
    id: 'int2.special-right-triangles', title: 'Special right triangles',
    learn: p(`A <b>45°-45°-90°</b> triangle is half a square. Its legs are equal, and the hypotenuse is <b>leg × ${R(2)}</b>. So legs of 5 give a hypotenuse of 5${R(2)}; a hypotenuse of 8${R(2)} gives legs of 8.`) +
      p(`A <b>30°-60°-90°</b> triangle is half an equilateral triangle. If the short leg (opposite 30°) is ${V('s')}, the hypotenuse is <b>2${V('s')}</b> and the long leg (opposite 60°) is <b>${V('s')}${R(3)}</b>. Always find the short leg first, then everything else follows.`) +
      example('Example', `A 30°-60°-90° triangle has hypotenuse 14. The short leg is 14 ÷ 2 = 7, and the long leg is <b>7${R(3)}</b>.`),
    make(rng) {
      const s = rng.int(2, 12), kind = rng.pick(['45leg', '45hyp', '30short', '30hyp', '30long']);
      let given, ask, ans, cands, hints;
      if (kind === '45leg') { given = `each leg is ${N(s)}`; ask = 'the hypotenuse'; ans = { k: s, r: 2 }; cands = [{ k: s, r: 3 }, { k: 2 * s, r: 1 }, { k: 2 * s, r: 2 }, { k: s + 1, r: 2 }]; hints = [`In a 45°-45°-90° triangle the hypotenuse is leg × ${R(2)}.`, `${N(s)} × ${R(2)} = <b>${rad(s, 2)}</b>.`]; }
      else if (kind === '45hyp') { given = `the hypotenuse is ${rad(s, 2)}`; ask = 'each leg'; ans = { k: s, r: 1 }; cands = [{ k: 2 * s, r: 1 }, { k: s, r: 2 }, { k: s, r: 3 }, { k: s + 1, r: 1 }]; hints = [`hypotenuse = leg × ${R(2)}, so leg = hypotenuse ÷ ${R(2)}.`, `${rad(s, 2)} ÷ ${R(2)} = <b>${N(s)}</b>.`]; }
      else if (kind === '30short') { given = `the short leg (opposite 30°) is ${N(s)}`; ask = 'the long leg'; ans = { k: s, r: 3 }; cands = [{ k: s, r: 2 }, { k: 2 * s, r: 1 }, { k: 2 * s, r: 3 }, { k: 3 * s, r: 1 }]; hints = [`The long leg is short leg × ${R(3)}.`, `${N(s)} × ${R(3)} = <b>${rad(s, 3)}</b>.`]; }
      else if (kind === '30hyp') { given = `the hypotenuse is ${N(2 * s)}`; ask = 'the long leg (opposite 60°)'; ans = { k: s, r: 3 }; cands = [{ k: 2 * s, r: 3 }, { k: s, r: 2 }, { k: s, r: 1 }, { k: 4 * s, r: 1 }]; hints = [`Find the short leg first: it is half the hypotenuse, ${N(2 * s)} ÷ 2 = ${N(s)}.`, `The long leg is short leg × ${R(3)}.`, `<b>${rad(s, 3)}</b>.`]; }
      else { given = `the long leg (opposite 60°) is ${rad(s, 3)}`; ask = 'the hypotenuse'; ans = { k: 2 * s, r: 1 }; cands = [{ k: s, r: 1 }, { k: 2 * s, r: 3 }, { k: s, r: 2 }, { k: 3 * s, r: 1 }]; hints = [`long leg = short leg × ${R(3)}, so the short leg is ${rad(s, 3)} ÷ ${R(3)} = ${N(s)}.`, `The hypotenuse is twice the short leg.`, `2 × ${N(s)} = <b>${N(2 * s)}</b>.`]; }
      const opts = [{ t: rad(ans.k, ans.r), v: ans.k * Math.sqrt(ans.r) }];
      cands.forEach(c => { const t = rad(c.k, c.r), v = c.k * Math.sqrt(c.r); if (opts.length < 4 && Math.abs(v - opts[0].v) > 1e-9 && !opts.some(o => key(o.t) === key(t))) opts.push({ t, v }); });
      return { prompt: `In a ${kind.startsWith('45') ? '45°-45°-90°' : '30°-60°-90°'} triangle, ${given}. What is ${ask}?`, type: 'choice', answer: opts[0].t, choices: rng.shuffle(opts.map(o => o.t)), params: { kind, s, opts }, hints };
    },
    verify(q) {
      const { kind, s, opts } = q.params, o = opts.find(x => x.t === q.answer);
      if (!o) return false;
      const want = kind === '45leg' ? s / Math.sin(toRad(45)) : kind === '45hyp' ? s * Math.SQRT2 * Math.cos(toRad(45))
        : kind === '30short' ? s * Math.tan(toRad(60)) : kind === '30hyp' ? 2 * s * Math.sin(toRad(60)) : s * Math.sqrt(3) / Math.sin(toRad(60));    // trig as the second opinion
      return Math.abs(o.v - want) < 1e-9;
    },
  });

  A.skill({
    id: 'int2.trig-ratios', title: 'Trigonometric ratios',
    learn: p(`In a right triangle, name the sides from the point of view of one acute angle: the <b>hypotenuse</b> is opposite the right angle, the <b>opposite</b> side is across from the angle, and the <b>adjacent</b> side is the leg touching it. Then <b>SOH CAH TOA</b>: sin = ${F('opposite', 'hypotenuse')}, cos = ${F('adjacent', 'hypotenuse')}, tan = ${F('opposite', 'adjacent')}.`) +
      p(`The ratios depend only on the angle, not on the size of the triangle, which is why similar triangles give the same values. Switching to the other acute angle swaps opposite and adjacent: sin A = cos B.`) +
      example('Example', `A right triangle has legs 8 and 15 and hypotenuse 17. For the angle opposite the side 8: sin = ${F(8, 17)}, cos = ${F(15, 17)}, tan = <b>${F(8, 15)}</b>.`),
    make(rng) {
      const t = rng.pick(TRIPLES.slice(0, 5)), m = rng.pick([1, 1, 2]);
      const swap = rng.bool(), [ac, bc] = swap ? [t[1] * m, t[0] * m] : [t[0] * m, t[1] * m], ab = t[2] * m;
      const ang = rng.pick(['A', 'B']), fn = rng.pick(['sin', 'cos', 'tan']);
      const opp = ang === 'A' ? bc : ac, adj = ang === 'A' ? ac : bc;
      const [num, den] = fn === 'sin' ? [opp, ab] : fn === 'cos' ? [adj, ab] : [opp, adj];
      const oppName = ang === 'A' ? 'BC' : 'AC', adjName = ang === 'A' ? 'AC' : 'BC';
      const word = { sin: 'opposite ÷ hypotenuse', cos: 'adjacent ÷ hypotenuse', tan: 'opposite ÷ adjacent' }[fn];
      return { prompt: `In right triangle ABC, angle C is the right angle. Find ${fn} ${ang} as a fraction in simplest form.${triFig(N(ac), N(bc), N(ab), ang)}`, type: 'number', answer: num / den, answerText: M.fracText(num, den), params: { ac, bc, ab, ang, fn },
        hints: [`From angle ${ang}: the hypotenuse is AB = ${N(ab)}, the opposite side is ${oppName} = ${N(opp)}, and the adjacent side is ${adjName} = ${N(adj)}.`,
          `${fn} = ${word} = ${F(num, den, { raw: true })}.`,
          `${M.gcd(num, den) > 1 ? `Simplify: ` : ''}${fn} ${ang} = <b>${M.fracText(num, den)}</b>.`] };
    },
    verify(q) {
      const { ac, bc, ab, ang, fn } = q.params;
      const A0 = Math.atan2(bc, ac), theta = ang === 'A' ? A0 : Math.PI / 2 - A0;      // measure the angle, then use Math's trig
      return Math.abs(ac * ac + bc * bc - ab * ab) < 1e-9 && Math.abs(Math[fn](theta) - q.answer) < 1e-9;
    },
  });

  A.skill({
    id: 'int2.solve-right-triangles', title: 'Solving right triangles with trigonometry',
    learn: p(`To find a <b>side</b>, pick the ratio that links the angle you know, the side you know, and the side you want. Write the equation, then solve: if sin 35° = ${F(V('x'), 12)}, then ${X} = 12 sin 35° ≈ 12 × 0.5736 ≈ 6.9. If the unknown ends up on the bottom, divide: tan 40° = ${F(9, V('x'))} gives ${X} = 9 ÷ tan 40°.`) +
      p(`To find an <b>angle</b>, form the ratio from two known sides and use the <b>inverse</b> function on a calculator: if tan ${V('A')} = ${F(5, 8)}, then ${V('A')} = tan<sup>−1</sup>(0.625) ≈ 32°.`) +
      example('Example', `A ramp makes a 20° angle with the ground and is 6 m long. Its height is the side opposite 20°, and the ramp is the hypotenuse: height = 6 sin 20° ≈ 6 × 0.3420 ≈ <b>2.1 m</b>.`),
    make(rng) {
      const kind = rng.pick(['side', 'side', 'angle']);
      if (kind === 'angle') {
        const ac = rng.int(3, 20), bc = rng.int(3, 20), ab = Math.hypot(ac, bc);
        const fn = rng.pick(['tan', 'sin', 'cos']);
        const f2 = fn !== 'tan' && Number.isInteger(ab) ? fn : 'tan';     // sin and cos only when the hypotenuse is a whole number
        const [num, den] = f2 === 'sin' ? [bc, ab] : f2 === 'cos' ? [ac, ab] : [bc, ac];
        const ans = Math.round(Math.atan2(bc, ac) * 180 / Math.PI);
        const labels = f2 === 'tan' ? [N(ac), N(bc), ''] : f2 === 'sin' ? ['', N(bc), N(ab)] : [N(ac), '', N(ab)];
        const inv = { sin: 'sin', cos: 'cos', tan: 'tan' }[f2], word = { sin: 'opposite ÷ hypotenuse', cos: 'adjacent ÷ hypotenuse', tan: 'opposite ÷ adjacent' }[f2];
        return { prompt: `In right triangle ABC, angle C is the right angle. Find the measure of angle A, to the nearest degree.${triFig(labels[0], labels[1], labels[2], 'A', '?')}`, type: 'number', answer: ans, unit: '°', params: { kind, num, den, fn: f2 },
          hints: [`From angle A, the sides you know are the ${f2 === 'tan' ? 'opposite and adjacent' : f2 === 'sin' ? 'opposite and hypotenuse' : 'adjacent and hypotenuse'}, so use ${inv}: ${inv} A = ${word} = ${F(num, den, { raw: true })} ≈ ${N(M.round(num / den, 4))}.`,
            `Use the inverse: A = ${inv}<sup>−1</sup>(${N(M.round(num / den, 4))}) ≈ ${N(M.round(Math.atan2(bc, ac) * 180 / Math.PI, 2))}°.`,
            `To the nearest degree, angle A ≈ <b>${N(ans)}°</b>.`] };
      }
      const deg = rng.int(15, 75), known = rng.pick(['hyp', 'adj', 'opp']);
      const want = rng.pick(['hyp', 'adj', 'opp'].filter(x => x !== known)), len = rng.int(4, 30);
      const sides = { hyp: 1, opp: Math.sin(toRad(deg)), adj: Math.cos(toRad(deg)) };
      const ans = M.round(len * sides[want] / sides[known], 1);
      const pair = [known, want].sort().join('-');
      const fn = pair === 'hyp-opp' ? 'sin' : pair === 'adj-hyp' ? 'cos' : 'tan';
      const val = M.round(Math[fn](toRad(deg)), 4);
      const top = fn === 'cos' ? 'adj' : 'opp', bottom = fn === 'tan' ? 'adj' : 'hyp';
      const lab = s => s === known ? N(len) : s === want ? X : '';
      const unknownOnTop = want === top;
      return { prompt: `In right triangle ABC, angle C is the right angle and angle A = ${N(deg)}°. Find ${X}, to the nearest tenth. (Use ${fn} ${N(deg)}° ≈ ${N(val)}.)${triFig(lab('adj'), lab('opp'), lab('hyp'), 'A', deg + '°')}`, type: 'number', answer: ans, tolerance: 0.05, params: { kind, deg, known, want, len },
        hints: [`From the ${N(deg)}° angle, ${N(len)} is the ${{ hyp: 'hypotenuse', opp: 'opposite side', adj: 'adjacent side' }[known]} and ${X} is the ${{ hyp: 'hypotenuse', opp: 'opposite side', adj: 'adjacent side' }[want]}, so use ${fn} = ${{ opp: 'opposite', adj: 'adjacent', hyp: 'hypotenuse' }[top]} ÷ ${{ opp: 'opposite', adj: 'adjacent', hyp: 'hypotenuse' }[bottom]}.`,
          `${fn} ${N(deg)}° = ${unknownOnTop ? F(X, N(len)) : F(N(len), X)}.`,
          unknownOnTop ? `Multiply: ${X} = ${N(len)} × ${fn} ${N(deg)}° ≈ ${N(len)} × ${N(val)} ≈ ${N(M.round(len * val, 3))}.` : `Solve for ${X}: ${X} = ${N(len)} ÷ ${fn} ${N(deg)}° ≈ ${N(len)} ÷ ${N(val)} ≈ ${N(M.round(len / val, 3))}.`,
          `To the nearest tenth, ${X} ≈ <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'angle') { const ratio = P.num / P.den, inv = { sin: Math.asin, cos: Math.acos, tan: Math.atan }[P.fn]; return Math.abs(inv(ratio) * 180 / Math.PI - q.answer) <= 0.5; }
      const opp = P.known === 'opp' ? P.len : null, t = toRad(P.deg);       // rebuild the whole triangle from the known side
      const hyp = P.known === 'hyp' ? P.len : P.known === 'opp' ? P.len / Math.sin(t) : P.len / Math.cos(t);
      const sides = { hyp, opp: opp != null ? opp : hyp * Math.sin(t), adj: Math.sqrt(hyp * hyp - Math.pow(opp != null ? opp : hyp * Math.sin(t), 2)) };
      return Math.abs(sides[P.want] - q.answer) <= 0.05 + 1e-9;
    },
  });

  /* ---------- Unit 7: Circles ---------- */
  A.skill({
    id: 'int2.arc-sector', title: 'Arc length and sector area',
    learn: p(`A central angle of ${V('θ')} degrees cuts off the fraction ${F(V('θ'), 360)} of the whole circle. So the <b>arc length</b> is that fraction of the circumference, ${F(V('θ'), 360)} · 2π${V('r')}, and the <b>sector area</b> is that fraction of the area, ${F(V('θ'), 360)} · π${sq(V('r'))}.`) +
      p(`Simplify the fraction first: 90° is ${F(1, 4)} of the circle, 120° is ${F(1, 3)}, 45° is ${F(1, 8)}. Keep units straight: arc length is a length (cm), sector area is an area (cm²).`) +
      example('Example', `Radius 6 cm, central angle 120°. ${F(120, 360, { raw: true })} = ${F(1, 3)}. Arc length = ${F(1, 3)} × 2 × 3.14 × 6 = <b>12.56 cm</b>. Sector area = ${F(1, 3)} × 3.14 × 36 = <b>37.68 cm²</b>.`),
    make(rng) {
      const deg = rng.pick([30, 40, 45, 60, 72, 90, 120, 135, 150, 180, 210, 240, 270, 300]), r = rng.int(2, 15), area = rng.bool();
      const frac = M.simp(deg, 360), whole = area ? 3.14 * r * r : 2 * 3.14 * r;
      const ans = M.round(whole * deg / 360, 2);
      return { prompt: `A circle has radius ${N(r)} cm. Find the ${area ? 'area of the sector' : 'length of the arc'} cut off by a central angle of ${N(deg)}°. Use 3.14 for π and round to the nearest hundredth.`, type: 'number', answer: ans, unit: area ? 'cm²' : 'cm', tolerance: 0.05, params: { deg, r, area },
        hints: [`The angle is ${F(deg, 360, { raw: true })} = ${F(frac[0], frac[1])} of the full circle.`,
          area ? `The whole circle's area is π${sq(V('r'))} = 3.14 × ${sq(N(r))} = ${N(M.round(whole, 4))} cm².` : `The whole circumference is 2π${V('r')} = 2 × 3.14 × ${N(r)} = ${N(M.round(whole, 4))} cm.`,
          `${F(frac[0], frac[1])} × ${N(M.round(whole, 4))} ≈ <b>${N(ans)}</b> ${area ? 'cm²' : 'cm'}.`] };
    },
    verify(q) {
      const { deg, r, area } = q.params, rad0 = toRad(deg);              // radians: s = rθ, A = r²θ/2, with 3.14 for π
      const v = area ? r * r * rad0 / 2 : r * rad0;
      return Math.abs(v * 3.14 / Math.PI - q.answer) <= 0.006;
    },
  });

  A.skill({
    id: 'int2.inscribed-angles', title: 'Inscribed angles',
    learn: p(`A <b>central angle</b> has its vertex at the center of the circle, and it has the same measure as the arc it cuts off. An <b>inscribed angle</b> has its vertex on the circle itself, and it is <b>half the measure of its intercepted arc</b>. So an inscribed angle is half the central angle that cuts off the same arc.`) +
      p(`Two consequences: inscribed angles that cut off the same arc are equal, and an inscribed angle that cuts off a semicircle (its sides go through the ends of a diameter) is always 90°.`) +
      example('Example', `Central angle AOB = 110°, and C is on the circle away from arc AB. The inscribed angle ACB cuts off the same arc, so it is 110° ÷ 2 = <b>55°</b>.`),
    make(rng) {
      const m = rng.pick([40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160]);
      const kind = rng.pick(['central', 'inscribed', 'arc', 'semi']);
      const aPos = 230, bPos = aPos + m, cPos = 50 + m / 2;
      if (kind === 'semi') {
        const x = rng.int(20, 70), fig = circleFig({ A: 180, B: 0, C: 2 * x }, [['A', 'B'], ['A', 'C'], ['C', 'B']]);
        return { prompt: `AB is a diameter of the circle with center O, and C is on the circle. Angle CAB = ${N(x)}°. What is angle CBA?${fig}`, type: 'number', answer: 90 - x, unit: '°', params: { kind, x },
          hints: [`Angle ACB is inscribed in a semicircle, so it is 90°.`, `The angles of triangle ABC add to 180°: ${N(x)}° + 90° + angle CBA = 180°.`, `Angle CBA = 180° − 90° − ${N(x)}° = <b>${N(90 - x)}°</b>.`] };
      }
      const fig = circleFig({ A: aPos, B: bPos, C: cPos }, [['O', 'A'], ['O', 'B'], ['C', 'A'], ['C', 'B']], ['A', 'B']);
      if (kind === 'central') return { prompt: `O is the center of the circle. The central angle AOB is ${N(m)}°. What is the inscribed angle ACB?${fig}`, type: 'number', answer: m / 2, unit: '°', params: { kind, m },
        hints: [`Both angles cut off the same arc AB. The central angle equals the arc, so arc AB = ${N(m)}°.`, `An inscribed angle is half its arc: ${N(m)}° ÷ 2 = <b>${N(m / 2)}°</b>.`] };
      if (kind === 'inscribed') return { prompt: `O is the center of the circle. The inscribed angle ACB is ${N(m / 2)}°. What is the central angle AOB?${fig}`, type: 'number', answer: m, unit: '°', params: { kind, m },
        hints: [`An inscribed angle is half the arc it cuts off, so arc AB = 2 × ${N(m / 2)}° = ${N(m)}°.`, `The central angle equals its arc: angle AOB = <b>${N(m)}°</b>.`] };
      return { prompt: `The inscribed angle ACB is ${N(m / 2)}°. What is the measure of the highlighted arc AB?${fig}`, type: 'number', answer: m, unit: '°', params: { kind, m },
        hints: [`An inscribed angle is half its intercepted arc.`, `So the arc is twice the angle: 2 × ${N(m / 2)}° = <b>${N(m)}°</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'semi') {                                          // coordinates: A(−1,0), B(1,0), C on the unit circle
        const t = toRad(2 * P.x), C = [Math.cos(t), Math.sin(t)];
        const ang = Math.atan2(C[1], 1 - C[0]) * 180 / Math.PI;        // angle at B between BA and BC
        return Math.abs(ang - q.answer) < 1e-6;
      }
      const a = toRad(230), b = toRad(230 + P.m), c = toRad(50 + P.m / 2);     // measure angle ACB from coordinates
      const v1 = [Math.cos(a) - Math.cos(c), Math.sin(a) - Math.sin(c)], v2 = [Math.cos(b) - Math.cos(c), Math.sin(b) - Math.sin(c)];
      const acb = Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(...v1) * Math.hypot(...v2))) * 180 / Math.PI;
      return Math.abs((P.kind === 'central' ? acb : 2 * acb) - q.answer) < 1e-6;
    },
  });

  A.skill({
    id: 'int2.circle-equation', title: 'Equation of a circle',
    learn: p(`A circle is every point at distance ${V('r')} from its center (${V('h')}, ${V('k')}). Writing that distance with the Pythagorean theorem gives the <b>equation of a circle</b>: <b>${sq(`(${X} − ${V('h')})`)} + ${sq(`(${Y} − ${V('k')})`)} = ${sq(V('r'))}</b>.`) +
      p(`Watch two things. The signs inside the parentheses are the opposite of the center's coordinates: center (−2, 5) gives ${sq(`(${X} + 2)`)} + ${sq(`(${Y} − 5)`)}. And the right side is the radius <i>squared</i>: radius 3 means = 9, and = 49 means the radius is 7.`) +
      example('Example', `Center (4, −1), radius 6: <b>${sq(`(${X} − 4)`)} + ${sq(`(${Y} + 1)`)} = 36</b>.`),
    make(rng) {
      const h = rng.int(-8, 8), k = rng.int(-8, 8), r = rng.int(2, 9);
      const eqn = (hh, kk, rr) => `${sqBin('x', hh)} + ${sqBin('y', kk)} = ${N(rr)}`;
      if (rng.chance(0.35)) {
        const wantR = rng.bool();
        return { prompt: `What is the ${wantR ? 'radius of the circle' : `${X}-coordinate of the center of the circle`}?${big(eqn(h, k, r * r))}`, type: 'number', answer: wantR ? r : h, params: { kind: wantR ? 'r' : 'h', h, k, r },
          hints: [`Compare with ${sq(`(${X} − ${V('h')})`)} + ${sq(`(${Y} − ${V('k')})`)} = ${sq(V('r'))}.`, wantR ? `${sq(V('r'))} = ${N(r * r)}, so ${V('r')} = ${R(N(r * r))}.` : `The part ${h === 0 ? sq(X) : `(${M.poly([1, -h])})`} means ${X} − ${wrap(h)}, so ${V('h')} = ${N(h)}.`, wantR ? `The radius is <b>${N(r)}</b>.` : `The center is ${M.pt(h, k)}, so its ${X}-coordinate is <b>${N(h)}</b>.`] };
      }
      const answer = eqn(h, k, r * r);
      const choices = rng.shuffle([answer].concat(distinct(answer, [eqn(-h, -k, r * r), eqn(h, k, r), eqn(-h, -k, r), eqn(k, h, r * r), eqn(h, -k, r * r), eqn(h, k, 2 * r)], 3)));
      return { prompt: `Which is the equation of the circle with center ${M.pt(h, k)} and radius ${N(r)}?`, type: 'choice', answer, choices, params: { kind: 'eq', h, k, r },
        hints: [`Use ${sq(`(${X} − ${V('h')})`)} + ${sq(`(${Y} − ${V('k')})`)} = ${sq(V('r'))} with ${V('h')} = ${N(h)}, ${V('k')} = ${N(k)}, ${V('r')} = ${N(r)}.`, `${X} − ${wrap(h)} = ${h === 0 ? X : M.poly([1, -h])} and ${Y} − ${wrap(k)} = ${k === 0 ? Y : M.poly([1, -k], 'y')}; the right side is ${sq(N(r))} = ${N(r * r)}.`, `<b>${answer}</b>.`] };
    },
    verify(q) {
      const { kind, h, k, r } = q.params;
      if (kind === 'r') return q.answer * q.answer === r * r && q.answer > 0;
      if (kind === 'h') return q.answer === h;
      // test four points that must lie on the circle against the chosen equation's own numbers
      const m = A.stripTags(q.answer).replace(/\s+/g, '').replace(/−/g, '-').match(/^(?:\(x([+-]\d+)\)|x)2\+(?:\(y([+-]\d+)\)|y)2=(\d+)$/);
      if (!m) return false;
      const hh = -(Number(m[1]) || 0), kk = -(Number(m[2]) || 0), rr = Number(m[3]);
      return [[h + r, k], [h - r, k], [h, k + r], [h, k - r]].every(([x, y]) => (x - hh) ** 2 + (y - kk) ** 2 === rr) && hh === h && kk === k;
    },
  });

  /* ---------- Unit 8: Probability ---------- */
  A.skill({
    id: 'int2.compound-probability', title: 'Probability of “and” and “or” events',
    learn: p(`<b>And, for independent events.</b> Two events are independent when one happening does not change the chance of the other (a coin and a die, or two spins of a spinner). Then <b>P(A and B) = P(A) · P(B)</b>.`) +
      p(`<b>Or.</b> If A and B cannot both happen (they are <b>mutually exclusive</b>), just add: P(A or B) = P(A) + P(B). If they can overlap, adding counts the overlap twice, so subtract it once: <b>P(A or B) = P(A) + P(B) − P(A and B)</b>.`) +
      example('Example', `A number is picked from 1 to 10. P(even or greater than 7)? Even: 5 numbers; greater than 7: 8, 9, 10, 3 numbers; both: 8 and 10, 2 numbers. P = ${F(5, 10, { raw: true })} + ${F(3, 10, { raw: true })} − ${F(2, 10, { raw: true })} = ${F(6, 10, { raw: true })} = <b>${F(3, 5)}</b>.`),
    make(rng) {
      const kind = rng.pick(['indep', 'indep', 'mutex', 'overlap', 'overlap']);
      const name = rng.pick(NAMES);
      const fracHint = (n, d) => `<b>${M.fracText(n, d)}</b>`;
      if (kind === 'indep') {
        const s1 = rng.pick([4, 5, 6, 8]), w1 = rng.int(1, s1 - 1), d = rng.pick([6, 10, 12]), w2 = rng.int(1, d - 1);
        const [n, dd] = M.simp(w1 * w2, s1 * d);
        return { prompt: `A spinner has ${N(s1)} equal sections, ${N(w1)} of them red. ${name} spins it and also rolls a fair ${N(d)}-sided die numbered 1 to ${N(d)}. What is the probability that the spinner lands on red <i>and</i> the die shows a number less than or equal to ${N(w2)}? Give a fraction.`, type: 'number', answer: n / dd, answerText: M.fracText(n, dd), params: { kind, s1, w1, d, w2 },
          hints: [`The spinner and the die do not affect each other, so the events are independent: multiply.`, `P(red) = ${F(w1, s1, { raw: true })} and P(at most ${N(w2)}) = ${F(w2, d, { raw: true })}.`, `${F(w1, s1, { raw: true })} × ${F(w2, d, { raw: true })} = ${F(w1 * w2, s1 * d, { raw: true })} = ${fracHint(n, dd)}.`] };
      }
      const top = rng.pick([10, 12, 15, 20, 24, 30]);
      const tests = { even: ['even', x => x % 2 === 0], odd: ['odd', x => x % 2 === 1], m3: ['a multiple of 3', x => x % 3 === 0], m4: ['a multiple of 4', x => x % 4 === 0], m5: ['a multiple of 5', x => x % 5 === 0] };
      const big1 = rng.int(Math.floor(top / 2), top - 2), small1 = rng.int(2, Math.floor(top / 3));
      tests.gt = [`greater than ${big1}`, x => x > big1]; tests.lt = [`less than ${small1}`, x => x < small1];
      let a, b;
      if (kind === 'mutex') [a, b] = rng.pick([['lt', 'gt'], ['gt', 'lt'], ['odd', 'm4'], ['m4', 'odd']]);
      else [a, b] = rng.pick([['even', 'm3'], ['even', 'm5'], ['m3', 'm5'], ['odd', 'm3'], ['even', 'gt'], ['m3', 'gt'], ['odd', 'lt'], ['m4', 'm3']]);
      const nums = Array.from({ length: top }, (_, i) => i + 1);
      const nA = nums.filter(tests[a][1]).length, nB = nums.filter(tests[b][1]).length, nAB = nums.filter(x => tests[a][1](x) && tests[b][1](x)).length;
      const tot = nA + nB - nAB, [n, dd] = M.simp(tot, top);
      const hints = [`Count: ${tests[a][0]} → ${N(nA)} numbers; ${tests[b][0]} → ${N(nB)} numbers.`,
        nAB === 0 ? `No number is both, so the events are mutually exclusive: just add, ${N(nA)} + ${N(nB)} = ${N(tot)}.` : `${N(nAB)} number${nAB === 1 ? ' is' : 's are'} both (${nums.filter(x => tests[a][1](x) && tests[b][1](x)).join(', ')}) and would be counted twice, so subtract: ${N(nA)} + ${N(nB)} − ${N(nAB)} = ${N(tot)}.`,
        `P = ${F(tot, top, { raw: true })} = ${fracHint(n, dd)}.`];
      return { prompt: `${name} picks a whole number from 1 to ${N(top)} at random. What is the probability that it is ${tests[a][0]} <i>or</i> ${tests[b][0]}? Give a fraction.`, type: 'number', answer: n / dd, answerText: M.fracText(n, dd), params: { kind, top, a, b, big1, small1 }, hints };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'indep') {                                         // list every (section, face) pair
        let hit = 0; for (let s = 1; s <= P.s1; s++) for (let f = 1; f <= P.d; f++) if (s <= P.w1 && f <= P.w2) hit++;
        return Math.abs(hit / (P.s1 * P.d) - q.answer) < 1e-12;
      }
      const t = { even: x => x % 2 === 0, odd: x => x % 2 === 1, m3: x => x % 3 === 0, m4: x => x % 4 === 0, m5: x => x % 5 === 0, gt: x => x > P.big1, lt: x => x < P.small1 };
      let hit = 0; for (let x = 1; x <= P.top; x++) if (t[P.a](x) || t[P.b](x)) hit++;
      return Math.abs(hit / P.top - q.answer) < 1e-12;
    },
  });

  A.skill({
    id: 'int2.conditional-probability', title: 'Conditional probability and two-way tables',
    learn: p(`<b>P(B | A)</b>, read “the probability of B given A”, is the chance of B when you already know A happened. Knowing A shrinks the group you are choosing from: <b>P(B | A) = ${F('number in both A and B', 'number in A')}</b>.`) +
      p(`In a two-way table, “given A” means: look only at the row (or column) for A, and use its total as the denominator. Order matters: P(B | A) and P(A | B) use different totals and are usually different.`) +
      example('Example', `${M.table(['', 'Likes soccer', 'Does not', 'Total'], [['7th grade', 18, 12, 30], ['8th grade', 10, 20, 30], ['Total', 28, 32, 60]], { compact: true })}P(likes soccer | 7th grade) = ${F(18, 30, { raw: true })} = <b>${F(3, 5)}</b>, but P(7th grade | likes soccer) = ${F(18, 28, { raw: true })} = ${F(9, 14)}.`),
    make(rng) {
      const [rows, cols] = rng.pick([
        [['Juniors', 'Seniors'], ['Has a pet', 'No pet']],
        [['Morning', 'Evening'], ['Ran', 'Walked']],
        [['Band', 'Choir'], ['Plays a sport', 'No sport']],
        [['Bus', 'Car'], ['Late', 'On time']]]);
      const t = [[rng.int(4, 30), rng.int(4, 30)], [rng.int(4, 30), rng.int(4, 30)]];
      const r0 = t[0][0] + t[0][1], c0 = t[0][0] + t[1][0], tot = r0 + t[1][0] + t[1][1];
      const table = M.table(['', cols[0], cols[1], 'Total'], [[rows[0], t[0][0], t[0][1], r0], [rows[1], t[1][0], t[1][1], t[1][0] + t[1][1]], ['Total', c0, t[0][1] + t[1][1], tot]]);
      const kind = rng.pick(['colGivenRow', 'rowGivenCol', 'joint']);
      const [num, den] = kind === 'colGivenRow' ? [t[0][0], r0] : kind === 'rowGivenCol' ? [t[0][0], c0] : [t[0][0], tot];
      const [n, d] = M.simp(num, den);
      const ask = kind === 'colGivenRow' ? `Someone is chosen at random from the “${rows[0]}” row. What is the probability that they are in the “${cols[0]}” column? That is, P(${cols[0]} | ${rows[0]}).`
        : kind === 'rowGivenCol' ? `Someone is chosen at random from the “${cols[0]}” column. What is the probability that they are in the “${rows[0]}” row? That is, P(${rows[0]} | ${cols[0]}).`
          : `Someone is chosen at random from everyone in the table. What is the probability that they are in the “${rows[0]}” row <i>and</i> the “${cols[0]}” column?`;
      return { prompt: `${table}${ask} Give a fraction.`, type: 'number', answer: n / d, answerText: M.fracText(n, d), params: { kind, t },
        hints: [kind === 'joint' ? `There is no “given” here, so the denominator is everyone: ${N(tot)}.` : `“Given ${kind === 'colGivenRow' ? rows[0] : cols[0]}” means look only at the ${kind === 'colGivenRow' ? `${rows[0]} row` : `${cols[0]} column`}. Its total, ${N(den)}, is the denominator.`,
          `The cell for ${rows[0]} and ${cols[0]} holds ${N(num)}.`, `P = ${F(num, den, { raw: true })} = <b>${M.fracText(n, d)}</b>.`] };
    },
    verify(q) {
      const { kind, t } = q.params;                                     // P(A and B) / P(A) with probabilities out of the grand total
      const all = t[0][0] + t[0][1] + t[1][0] + t[1][1], both = t[0][0] / all;
      const given = kind === 'colGivenRow' ? (t[0][0] + t[0][1]) / all : kind === 'rowGivenCol' ? (t[0][0] + t[1][0]) / all : 1;
      return Math.abs(both / given - q.answer) < 1e-12;
    },
  });

  A.skill({
    id: 'int2.expected-value', title: 'Expected value',
    learn: p(`The <b>expected value</b> of a game is the average result per play over the long run. Multiply each outcome by its probability and add: <b>E = Σ (value × probability)</b>. It does not have to be a value you can actually get on one play.`) +
      p(`If a game costs money to play, count the cost too: either subtract it from every outcome, or subtract it from the expected winnings at the end. A negative expected value means you lose money on average; an expected value of 0 means the game is <b>fair</b>.`) +
      example('Example', `A spinner has 4 equal sections worth $0, $0, $2 and $10. E = ${F(1, 4)}(0 + 0 + 2 + 10) = <b>$3</b> per spin. If a spin costs $4, the expected net result is $3 − $4 = −$1 per spin.`),
    make(rng) {
      const kind = rng.pick(['spinner', 'spinner', 'ticket']);
      const name = rng.pick(NAMES);
      if (kind === 'ticket') {
        const nT = rng.pick([50, 100, 200, 250, 500]), prize = rng.pick([20, 25, 40, 50, 100, 200]), cost = rng.pick([1, 2, 5]);
        const ans = M.round(prize / nT - cost, 2);
        return { prompt: `A raffle sells ${N(nT)} tickets for ${M.money(cost)} each, and one ticket wins ${M.money(prize)}. ${name} buys one ticket. What is ${name}'s expected net gain, in dollars? (It may be negative.)`, type: 'number', answer: ans, unit: '$', tolerance: 0.005, params: { kind, nT, prize, cost },
          hints: [`The chance of winning is ${F(1, nT)}, so the expected prize is ${F(1, nT)} × ${M.money(prize)} = ${M.money(M.round(prize / nT, 2))}.`, `Subtract the cost of the ticket: ${M.money(M.round(prize / nT, 2))} − ${M.money(cost)}.`, `The expected net gain is <b>${M.money(ans)}</b> per ticket.`] };
      }
      const n = rng.pick([4, 5, 10]), cost = rng.chance(0.5) ? rng.int(1, 5) : 0;
      const vals = Array.from({ length: n }, () => rng.pick([0, 0, 1, 2, 3, 5, 8, 10, 20]));
      const sum = vals.reduce((a, b) => a + b, 0), ans = M.round(sum / n - cost, 2);
      const counts = {}; vals.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
      const terms = Object.keys(counts).map(Number).sort((a, b) => a - b).map(v => `${N(v)} × ${F(counts[v], n, { raw: true })}`);
      return { prompt: `A spinner has ${N(n)} equal sections. Landing on a section wins that many dollars: ${vals.map(v => M.money(v)).join(', ')}.${cost ? ` Each spin costs ${M.money(cost)}.` : ''} What is the expected ${cost ? 'net gain' : 'amount won'} per spin, in dollars?${cost ? ' (It may be negative.)' : ''}`, type: 'number', answer: ans, unit: '$', tolerance: 0.005, params: { kind, vals, cost },
        hints: [`Each section has probability ${F(1, n)}. Group equal prizes: E = ${terms.join(' + ')}.`, `That is the total of the sections divided by ${N(n)}: ${N(sum)} ÷ ${N(n)} = ${N(M.round(sum / n, 2))}.`].concat(cost ? [`Subtract the ${M.money(cost)} cost: ${N(M.round(sum / n, 2))} − ${N(cost)}.`] : []).concat(`The expected ${cost ? 'net gain' : 'amount won'} is <b>${M.money(ans)}</b> per spin.`) };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'ticket') {                                        // total money in minus total money out, shared over every ticket
        const perTicket = (P.prize - P.nT * P.cost) / P.nT;
        return Math.abs(perTicket - q.answer) < 0.0051;
      }
      let total = 0; P.vals.forEach(v => { total += v - P.cost; });     // net result of one spin on each section, averaged
      return Math.abs(total / P.vals.length - q.answer) < 0.0051;
    },
  });

  /* ---------- Unit 9: Logic and proof ---------- */
  const isPrime = n => { if (!Number.isInteger(n) || n < 2) return false; for (let f = 2; f * f <= n; f++) if (n % f === 0) return false; return true; };
  const isOdd = n => Math.abs(n % 2) === 1;
  const close = (x, y) => Math.abs(x - y) < 1e-6;
  const nV = V('n'), ell = V('ℓ'), mV = V('m');
  /** a parallelogram with sides w and h (cm) and one angle a, described in words */
  const shapeTxt = s => s.a === 90 ? (s.w === s.h ? `a square with ${s.w} cm sides` : `a ${s.w} cm by ${s.h} cm rectangle`)
    : s.w === s.h ? `a rhombus with ${s.a}° and ${180 - s.a}° angles` : `a parallelogram with ${s.w} cm and ${s.h} cm sides and a ${s.a}° angle`;
  /* Conjectures: h is the hypothesis, c the conclusion. The case lists are sorted by hand (ce = counterexamples,
     sup = cases that fit, nh = cases where the hypothesis is false); verify() re-checks them with h and c. */
  const CONJ = [
    { s: `If ${nV} is a prime number, then ${nV} is odd.`, h: isPrime, c: isOdd, ce: [2], sup: [3, 5, 7, 11, 13, 17, 19, 23], nh: [1, 9, 15, 21, 25, 4, 6, 8] },
    { s: `If ${nV} is a multiple of 4, then ${nV} is a multiple of 8.`, h: n => n % 4 === 0, c: n => n % 8 === 0, ce: [4, 12, 20, 28, 36, 44], sup: [8, 16, 24, 32, 40, 48], nh: [2, 6, 10, 14, 18, 22] },
    { s: `If ${sq(nV)} &gt; 25, then ${nV} &gt; 5.`, h: n => n * n > 25, c: n => n > 5, ce: [-6, -7, -8, -9, -10], sup: [6, 7, 8, 9, 10], nh: [-5, -4, -3, -1, 0, 2, 4, 5] },
    { s: `If ${nV} is an integer, then ${sq(nV)} &gt; ${nV}.`, h: n => Number.isInteger(n), c: n => n * n > n, ce: [0, 1], sup: [2, 3, 4, 5, -1, -2, -3], nh: [] },
    { s: `If ${nV} is odd, then ${nV} + 2 is prime.`, h: isOdd, c: n => isPrime(n + 2), ce: [7, 13, 19, 23, 25], sup: [1, 3, 5, 9, 11, 15, 17], nh: [2, 4, 6, 8, 10, 12] },
    { s: `If ${nV} is divisible by 3, then ${nV} is divisible by 6.`, h: n => n % 3 === 0, c: n => n % 6 === 0, ce: [3, 9, 15, 21, 27, 33], sup: [6, 12, 18, 24, 30, 36], nh: [4, 8, 10, 14, 16, 20] },
    { s: `If ${nV} is a whole number, then ${M.poly([1, 1, 11], 'n')} is prime.`, h: n => Number.isInteger(n) && n >= 0, c: n => isPrime(n * n + n + 11), ce: [10, 11], sup: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], nh: [] },
    { s: 'If the sum of two whole numbers is even, then both numbers are even.', t: 'pair', h: ([a, b]) => (a + b) % 2 === 0, c: ([a, b]) => a % 2 === 0 && b % 2 === 0,
      ce: [[3, 5], [1, 7], [5, 9], [7, 11], [9, 13]], sup: [[2, 4], [6, 8], [4, 10], [2, 12]], nh: [[3, 4], [5, 8], [2, 7], [6, 9]] },
    { s: 'If the product of two integers is positive, then both integers are positive.', t: 'pair', h: ([a, b]) => a * b > 0, c: ([a, b]) => a > 0 && b > 0,
      ce: [[-3, -4], [-2, -5], [-6, -1], [-7, -2]], sup: [[3, 4], [2, 5], [6, 1], [7, 2]], nh: [[-3, 4], [2, -5], [-6, 1], [7, -2]] },
    { s: 'If two angles are supplementary, then one of them is obtuse.', t: 'ang', h: ([a, b]) => a + b === 180, c: ([a, b]) => a > 90 || b > 90,
      ce: [[90, 90]], sup: [[100, 80], [120, 60], [135, 45], [150, 30]], nh: [[60, 30], [120, 70], [45, 45], [100, 100]] },
    { s: 'If two angles are both acute, then together they make an acute angle.', t: 'ang', h: ([a, b]) => a < 90 && b < 90, c: ([a, b]) => a + b < 90,
      ce: [[50, 60], [45, 70], [80, 30], [60, 60]], sup: [[20, 30], [10, 40], [35, 25], [15, 60]], nh: [[100, 20], [120, 30], [95, 10]] },
    { s: 'If a quadrilateral has four right angles, then it is a square.', t: 'quad', h: q => q.a === 90, c: q => q.a === 90 && q.w === q.h,
      ce: [{ w: 3, h: 5, a: 90 }, { w: 2, h: 6, a: 90 }, { w: 4, h: 7, a: 90 }], sup: [{ w: 3, h: 3, a: 90 }, { w: 5, h: 5, a: 90 }], nh: [{ w: 4, h: 4, a: 60 }, { w: 3, h: 5, a: 70 }, { w: 5, h: 5, a: 120 }] },
    { s: 'If a quadrilateral has four congruent sides, then it is a square.', t: 'quad', h: q => q.w === q.h, c: q => q.a === 90 && q.w === q.h,
      ce: [{ w: 4, h: 4, a: 60 }, { w: 5, h: 5, a: 70 }, { w: 3, h: 3, a: 120 }], sup: [{ w: 3, h: 3, a: 90 }, { w: 6, h: 6, a: 90 }], nh: [{ w: 3, h: 5, a: 90 }, { w: 4, h: 6, a: 110 }] },
  ];
  const caseTxt = (t, x) => t === 'pair' ? `the pair ${N(x[0])} and ${N(x[1])}` : t === 'ang' ? `angles of ${N(x[0])}° and ${N(x[1])}°` : t === 'quad' ? shapeTxt(x) : `${nV} = ${N(x)}`;
  const partsTxt = (cj, x) => `For ${caseTxt(cj.t, x)}, the “if” part is ${cj.h(x) ? 'true' : 'false'} and the “then” part is ${cj.c(x) ? 'true' : 'false'}.`;
  const SHOWS = ['It is a counterexample, so the conjecture is false.', 'It fits the conjecture, but one example cannot prove it.', 'It proves that the conjecture is always true.', 'It does not test the conjecture: the “if” part is false.'];

  A.skill({
    id: 'int2.counterexamples', title: 'Conjectures and counterexamples',
    learn: p(`A <b>conjecture</b> is a statement you believe because of a pattern, but have not proved. Many are written as <b>if-then statements</b>, such as “If ${nV} is a multiple of 4, then ${nV} is even.” The “if” part is the <b>hypothesis</b> and the “then” part is the <b>conclusion</b>.`) +
      p(`Examples that fit a conjecture make it believable, but no number of examples proves it. One <b>counterexample</b> is enough to prove it false: <b>a case that makes the hypothesis true and the conclusion false</b>. A case where the hypothesis is false does not test the conjecture at all, because the statement promises nothing about it.`) +
      example('Example', `${big('If a number is prime, then it is odd.')}Try 7: prime and odd, so it fits, but that proves nothing. Try 9: not prime, so it does not test the claim. Try 2: prime but not odd, so <b>2 is a counterexample</b>, and the conjecture is false.`),
    make(rng) {
      const ci = rng.int(0, CONJ.length - 1), cj = CONJ[ci], intro = `<p>Conjecture: “${cj.s}”</p>`;
      if (rng.chance(0.55)) {
        const ce = rng.pick(cj.ce);
        let others;
        if (cj.nh.length) {
          const s2 = rng.sample(cj.sup, 2), n2 = rng.sample(cj.nh, 2);
          others = rng.bool() ? [s2[0], s2[1], n2[0]] : [s2[0], n2[0], n2[1]];
        } else others = rng.sample(cj.sup, 3);
        const opts = [ce].concat(others).map(x => ({ t: caseTxt(cj.t, x), x }));
        return { prompt: `${intro}Which of these is a counterexample?`, type: 'choice', answer: opts[0].t, choices: rng.shuffle(opts.map(o => o.t)), params: { ci, kind: 'find', opts },
          hints: ['A counterexample must make the “if” part true and the “then” part false.', others.map(x => partsTxt(cj, x)).join(' ') + ' None of these breaks the conjecture.',
            `${partsTxt(cj, ce)} So <b>${opts[0].t}</b> gives a counterexample, and the conjecture is false.`] };
      }
      const kind = rng.pick(['ce', 'sup', 'nh'].filter(k => cj[k].length)), x = rng.pick(cj[kind]);
      const ans = SHOWS[kind === 'ce' ? 0 : kind === 'sup' ? 1 : 3];
      const why = kind === 'ce' ? 'The “if” part holds but the “then” part fails, so the conjecture breaks.'
        : kind === 'sup' ? 'The case fits, but some other case might not, so one example cannot prove the conjecture.'
          : 'The conjecture only promises something when the “if” part is true, so this case tells you nothing.';
      return { prompt: `${intro}${rng.pick(NAMES)} tries ${caseTxt(cj.t, x)}. What does this example show?`, type: 'choice', answer: ans, choices: SHOWS, keepOrder: true, params: { ci, kind: 'judge', x },
        hints: ['Check the “if” part first, then the “then” part.', partsTxt(cj, x), `${why} <b>${ans}</b>`] };
    },
    verify(q) {
      const P = q.params, cj = CONJ[P.ci], isCE = x => cj.h(x) && !cj.c(x);
      if (P.kind === 'find') { const o = P.opts.find(y => y.t === q.answer); return !!o && isCE(o.x) && P.opts.filter(y => isCE(y.x)).length === 1; }
      return q.answer === SHOWS[isCE(P.x) ? 0 : cj.h(P.x) ? 1 : 3];
    },
  });

  /* Converses. Each statement "If S P, then it Q" is true by design; x describes a counterexample when the
     converse is false. verify() checks every truth value against a small world of numbers or shapes. */
  const vsub = (p1, p2) => [p1[0] - p2[0], p1[1] - p2[1]], vdot = (u, v) => u[0] * v[0] + u[1] * v[1], vcross = (u, v) => u[0] * v[1] - u[1] * v[0];
  /** what can be said about the quadrilateral with these vertices, in order */
  function quadInfo(P) {
    const s = [0, 1, 2, 3].map(i => vsub(P[(i + 1) % 4], P[i])), d1 = vsub(P[2], P[0]), d2 = vsub(P[3], P[1]);
    const eqSides = s.every(v => vdot(v, v) === vdot(s[0], s[0])), right = [0, 1, 2, 3].every(i => vdot(s[i], s[(i + 1) % 4]) === 0);
    const para = vcross(s[0], s[2]) === 0 && vcross(s[1], s[3]) === 0;
    return { eqSides, right, para, square: eqSides && right, rhombus: eqSides, rectangle: right, perpDiag: vdot(d1, d2) === 0, eqDiag: vdot(d1, d1) === vdot(d2, d2),
      bisect: P[0][0] + P[2][0] === P[1][0] + P[3][0] && P[0][1] + P[2][1] === P[1][1] + P[3][1], oneParallel: vcross(s[0], s[2]) === 0 || vcross(s[1], s[3]) === 0 };
  }
  /** the angle opposite each side of a triangle, by the law of cosines */
  const triAngles = ([a, b, c]) => [[a, b, c], [b, c, a], [c, a, b]].map(([x, y, z]) => Math.acos((y * y + z * z - x * x) / (2 * y * z)) * 180 / Math.PI);
  function triInfo(t) {
    const g = triAngles(t), s = t.slice().sort((x, y) => x - y), two = arr => close(arr[0], arr[1]) || close(arr[1], arr[2]) || close(arr[0], arr[2]);
    return { equi: close(t[0], t[1]) && close(t[1], t[2]), iso: two(t), congAng: two(g), right: g.some(x => close(x, 90)), acute2: g.filter(x => x < 90 - 1e-6).length >= 2, pyth: close(s[0] * s[0] + s[1] * s[1], s[2] * s[2]) };
  }
  const lineAngle = m => 90 - Math.atan(m) * 180 / Math.PI;           // angle between a line of slope m and a vertical transversal
  const WORLD = {
    num: Array.from({ length: 151 }, (_, i) => i - 30),
    whole: Array.from({ length: 121 }, (_, i) => i),
    tri: [[5, 5, 5], [5, 5, 8], [5, 5, 6], [3, 4, 5], [5, 12, 13], [5, 6, 7], [3, 5, 7], [1, 1, Math.SQRT2], [4, 4, 7]].map(triInfo),
    quad: [[[0, 0], [4, 0], [4, 4], [0, 4]], [[0, 0], [6, 0], [6, 3], [0, 3]], [[0, 0], [5, 0], [8, 4], [3, 4]], [[0, 0], [6, 0], [8, 3], [2, 3]],
      [[0, 0], [3, -2], [8, 0], [3, 2]], [[0, 0], [8, 0], [6, 3], [2, 3]], [[0, 0], [7, 0], [5, 3], [1, 3]], [[0, 0], [6, 1], [5, 4], [1, 3]]].map(quadInfo),
    ang: [{ a: 40, b: 40, rel: 'vertical' }, { a: 90, b: 90, rel: 'vertical' }, { a: 130, b: 130, rel: 'vertical' }, { a: 40, b: 140, rel: 'linear' }, { a: 90, b: 90, rel: 'linear' },
      { a: 120, b: 60, rel: 'linear' }, { a: 40, b: 40, rel: 'apart' }, { a: 70, b: 110, rel: 'apart' }, { a: 30, b: 60, rel: 'adjacent' }],
    lines: [[0.5, 0.5], [0.5, 1], [2, 2], [-1, 1], [0, 0], [0, 3]].map(([m1, m2]) => ({ par: m1 === m2, t1: lineAngle(m1), t2: lineAngle(m2) })),
    tripair: [[[3, 4, 5], [3, 4, 5]], [[3, 4, 5], [6, 8, 10]], [[5, 5, 5], [7, 7, 7]], [[4, 5, 6], [4, 5, 7]], [[5, 5, 8], [5, 5, 8]]],
  };
  const abc = `${sq(V('a'))} + ${sq(V('b'))} = ${sq(V('c'))}`;
  const CONV = [
    { S: 'a number', P: 'is a multiple of 10', nP: 'is not a multiple of 10', Q: 'is even', nQ: 'is not even', w: 'num', p: n => n % 10 === 0, q: n => n % 2 === 0, x: '12 is even, but it is not a multiple of 10' },
    { S: 'a whole number', P: 'is divisible by 6', nP: 'is not divisible by 6', Q: 'is divisible by 3', nQ: 'is not divisible by 3', w: 'whole', p: n => n % 6 === 0, q: n => n % 3 === 0, x: '9 is divisible by 3, but not by 6' },
    { S: 'a whole number', P: 'ends in 0', nP: 'does not end in 0', Q: 'is divisible by 5', nQ: 'is not divisible by 5', w: 'whole', p: n => String(n).endsWith('0'), q: n => n % 5 === 0, x: '15 is divisible by 5, but it ends in 5' },
    { S: 'a whole number', P: 'is divisible by both 2 and 3', nP: 'is not divisible by both 2 and 3', Q: 'is divisible by 6', nQ: 'is not divisible by 6', w: 'whole', p: n => n % 2 === 0 && n % 3 === 0, q: n => n % 6 === 0 },
    { S: 'a number', P: 'is negative', nP: 'is not negative', Q: 'has a positive square', nQ: 'does not have a positive square', w: 'num', p: n => n < 0, q: n => n * n > 0, x: '3 has a positive square, 9, but 3 is not negative' },
    { S: 'a triangle', P: 'is equilateral', nP: 'is not equilateral', Q: 'is isosceles', nQ: 'is not isosceles', w: 'tri', p: t => t.equi, q: t => t.iso, x: 'a triangle with sides 5, 5 and 8 is isosceles, but it is not equilateral' },
    { S: 'a triangle', P: 'has two congruent sides', nP: 'does not have two congruent sides', Q: 'has two congruent angles', nQ: 'does not have two congruent angles', w: 'tri', p: t => t.iso, q: t => t.congAng },
    { S: 'a triangle', P: 'is a right triangle', nP: 'is not a right triangle', Q: 'has two acute angles', nQ: 'does not have two acute angles', w: 'tri', p: t => t.right, q: t => t.acute2, x: 'an equilateral triangle has two (in fact three) acute angles, but no right angle' },
    { S: `a triangle with sides ${V('a')}, ${V('b')} and longest side ${V('c')}`, P: 'is a right triangle', nP: 'is not a right triangle', Q: `has ${abc}`, nQ: `does not have ${abc}`, w: 'tri', p: t => t.right, q: t => t.pyth },
    { S: 'a quadrilateral', P: 'is a square', nP: 'is not a square', Q: 'has four right angles', nQ: 'does not have four right angles', w: 'quad', p: s => s.square, q: s => s.right, x: 'a 3 by 6 rectangle has four right angles, but it is not a square' },
    { S: 'a quadrilateral', P: 'is a rhombus', nP: 'is not a rhombus', Q: 'has perpendicular diagonals', nQ: 'does not have perpendicular diagonals', w: 'quad', p: s => s.rhombus, q: s => s.perpDiag, x: 'a kite that is not a rhombus has perpendicular diagonals' },
    { S: 'a quadrilateral', P: 'is a parallelogram', nP: 'is not a parallelogram', Q: 'has diagonals that bisect each other', nQ: 'does not have diagonals that bisect each other', w: 'quad', p: s => s.para, q: s => s.bisect },
    { S: 'a quadrilateral', P: 'is a rectangle', nP: 'is not a rectangle', Q: 'has congruent diagonals', nQ: 'does not have congruent diagonals', w: 'quad', p: s => s.rectangle, q: s => s.eqDiag, x: 'an isosceles trapezoid has congruent diagonals, but it is not a rectangle' },
    { S: 'a quadrilateral', P: 'is a rhombus', nP: 'is not a rhombus', Q: 'has four congruent sides', nQ: 'does not have four congruent sides', w: 'quad', p: s => s.rhombus, q: s => s.eqSides },
    { S: 'two angles', it: 'they', P: 'are vertical angles', nP: 'are not vertical angles', Q: 'are congruent', nQ: 'are not congruent', w: 'ang', p: g => g.rel === 'vertical', q: g => g.a === g.b, x: 'two separate 40° angles are congruent, but they are not vertical angles' },
    { S: 'two angles', it: 'they', P: 'form a linear pair', nP: 'do not form a linear pair', Q: 'are supplementary', nQ: 'are not supplementary', w: 'ang', p: g => g.rel === 'linear', q: g => g.a + g.b === 180, x: 'a 70° angle and a 110° angle far apart are supplementary, but they do not form a linear pair' },
    { S: 'two lines cut by a transversal', it: 'they', P: 'are parallel', nP: 'are not parallel', Q: 'form congruent alternate interior angles', nQ: 'do not form congruent alternate interior angles', w: 'lines', p: l => l.par, q: l => close(l.t1, l.t2) },
    { S: 'two lines cut by a transversal', it: 'they', P: 'are parallel', nP: 'are not parallel', Q: 'form congruent corresponding angles', nQ: 'do not form congruent corresponding angles', w: 'lines', p: l => l.par, q: l => close(l.t1, l.t2) },
    { S: 'two lines cut by a transversal', it: 'they', P: 'are parallel', nP: 'are not parallel', Q: 'form supplementary same-side interior angles', nQ: 'do not form supplementary same-side interior angles', w: 'lines', p: l => l.par, q: l => close(l.t1 + (180 - l.t2), 180) },
    { S: 'two triangles', it: 'they', P: 'are congruent', nP: 'are not congruent', Q: 'have congruent corresponding angles', nQ: 'do not have congruent corresponding angles', w: 'tripair',
      p: ([s, t]) => s.every((x, i) => x === t[i]), q: ([s, t]) => triAngles(s).every((x, i) => close(x, triAngles(t)[i])), x: 'triangles with sides 3, 4, 5 and 6, 8, 10 have the same angles, but they are not congruent' },
  ];
  const ifThen = (it, a, b) => `If ${it.S} ${a}, then ${it.it || 'it'} ${b}.`;
  const holds = (it, fwd) => WORLD[it.w].every(w => fwd ? !it.p(w) || it.q(w) : !it.q(w) || it.p(w));
  const TRUTHS = ['Both the statement and its converse are true.', 'The statement is true, but its converse is false.', 'The statement is false, but its converse is true.', 'Both the statement and its converse are false.'];

  A.skill({
    id: 'int2.converses', title: 'Converses of conditional statements',
    learn: p(`A <b>conditional statement</b> has the form “If ${V('p')}, then ${V('q')}.” Its <b>converse</b> swaps the two parts: <b>“If ${V('q')}, then ${V('p')}.”</b> Nothing else changes, and no “not” is added. (Adding “not” to both parts gives a different statement, the inverse.)`) +
      p(`A true statement can have a false converse. “If a number is a multiple of 10, then it is even” is true, but its converse “If a number is even, then it is a multiple of 10” is false: 12 is a counterexample. So <b>a converse must be checked on its own</b>. Many geometry theorems come in true pairs: the parallel-line angle theorems and their converses are all true, and that is how you prove two lines are parallel.`) +
      example('Example', `${big('If two lines cut by a transversal are parallel, then they form congruent corresponding angles.')}Converse: <b>If two lines cut by a transversal form congruent corresponding angles, then they are parallel.</b> Both are true.`),
    make(rng) {
      const ii = rng.int(0, CONV.length - 1), it = CONV[ii], flip = rng.bool();
      const [H, C, nH, nC] = flip ? [it.Q, it.P, it.nQ, it.nP] : [it.P, it.Q, it.nP, it.nQ];
      const stmt = ifThen(it, H, C), conv = ifThen(it, C, H);
      if (rng.chance(0.5)) {
        const choices = [conv, ifThen(it, nH, nC), ifThen(it, nC, nH), stmt];
        return { prompt: `What is the converse of this statement?${big(stmt)}`, type: 'choice', answer: conv, choices: rng.shuffle(choices), params: { ii, kind: 'write', stmt },
          hints: ['The converse swaps the “if” part and the “then” part. It does not add any “not”.', `The “if” part is “${it.S} ${H}”. The “then” part is “${it.it || 'it'} ${C}”.`, `Swap them: <b>${conv}</b>`] };
      }
      const convFalse = !!it.x, stmtTrue = !(flip && convFalse), convTrue = !(convFalse && !flip);
      const ans = TRUTHS[stmtTrue ? (convTrue ? 0 : 1) : (convTrue ? 2 : 3)];
      const judge = (what, ok) => ok ? `The ${what} is true: no case makes its “if” part true and its “then” part false.` : `The ${what} is false: ${it.x}.`;
      return { prompt: `Statement: “${stmt}”<br>Converse: “${conv}”<br>Which is true?`, type: 'choice', answer: ans, choices: TRUTHS, keepOrder: true, params: { ii, kind: 'judge', flip },
        hints: ['Test each one separately: look for a case that makes the “if” part true and the “then” part false.', judge('statement', stmtTrue), judge('converse', convTrue), `<b>${ans}</b>`] };
    },
    verify(q) {
      const P = q.params, it = CONV[P.ii];
      if (P.kind === 'write') {                                         // pull the statement apart and swap its clauses
        const m = P.stmt.match(/^If (.+), then (.+)\.$/), pro = (it.it || 'it') + ' ';
        if (!m || !m[1].startsWith(it.S + ' ') || !m[2].startsWith(pro)) return false;
        return q.answer === `If ${it.S} ${m[2].slice(pro.length)}, then ${pro}${m[1].slice(it.S.length + 1)}.`;
      }
      const fwd = holds(it, true), back = holds(it, false), sT = P.flip ? back : fwd, cT = P.flip ? fwd : back;
      return q.answer === TRUTHS[sT ? (cT ? 0 : 1) : (cT ? 2 : 3)];
    },
  });

  /* Proof by contradiction: the opening assumption and the contradiction, for statements with clear answers. */
  const PBC = [
    { pr: 'A triangle cannot have two obtuse angles.', as: 'Suppose a triangle has two obtuse angles.',
      wa: ['Suppose a triangle has no obtuse angles.', 'Suppose a triangle has exactly one obtuse angle.', 'Suppose a triangle cannot have two obtuse angles.'],
      co: 'The two obtuse angles alone would add to more than 180°.', wc: ['Each obtuse angle would be greater than 90°.', 'The third angle of the triangle would have to be acute.', 'The longest side would be opposite the largest angle.'] },
    { pr: `${R(2)} is irrational.`, as: `Suppose ${R(2)} is rational, so ${R(2)} = ${F(V('a'), V('b'))} in lowest terms.`,
      wa: [`Suppose ${R(2)} is irrational, so it is not a fraction.`, `Suppose ${R(2)} is a whole number between 1 and 2.`, `Suppose ${R(2)} is a negative number.`],
      co: `Then ${V('a')} and ${V('b')} would both be even, so the fraction was not in lowest terms.`, wc: [`Then ${sq(V('a'))} would equal 2${sq(V('b'))}, so ${sq(V('a'))} would be an even number.`, `Then ${R(2)} would be about 1.414, between 1 and 2.`, `Then ${V('b')} could not be zero, because we cannot divide by zero.`] },
    { g: `Lines ${ell} and ${mV} are cut by a transversal, and the alternate interior angles are not congruent.`, pr: `${ell} and ${mV} are not parallel.`, as: `Suppose ${ell} and ${mV} are parallel.`,
      wa: [`Suppose ${ell} and ${mV} are not parallel.`, 'Suppose the alternate interior angles are congruent.', `Suppose ${ell} and ${mV} are perpendicular.`],
      co: 'That forces congruent alternate interior angles, against the given.', wc: [`Then ${ell} and ${mV} would never meet, however far they are extended.`, `Then the transversal would have to cross both ${ell} and ${mV}.`, `Then ${ell} and ${mV} would point in the same direction everywhere.`] },
    { g: `${sq(nV)} is even, where ${nV} is a whole number.`, pr: `${nV} is even.`, as: `Suppose ${nV} is odd.`,
      wa: [`Suppose ${nV} is even.`, `Suppose ${sq(nV)} is odd.`, `Suppose ${nV} is zero.`],
      co: `Then ${sq(nV)} would be odd, but it is given as even.`, wc: [`Then ${nV} + 1 would be an even number.`, `Then ${sq(nV)} would be larger than ${nV}.`, `Then ${nV} would leave a remainder of 1 when divided by 2.`] },
    { pr: 'There is no largest whole number.', as: `Suppose there is a largest whole number, ${V('N')}.`,
      wa: ['Suppose there is no largest whole number.', 'Suppose there is a smallest whole number, 0.', 'Suppose every whole number is even.'],
      co: `Then ${V('N')} + 1 would be a whole number larger than the largest one.`, wc: [`Then ${V('N')} would have to be a whole number.`, `Then ${V('N')} − 1 would be a whole number smaller than ${V('N')}.`, `Then ${V('N')} could be a very large number.`] },
    { g: 'In △ABC, AB ≠ AC.', pr: '∠B and ∠C are not congruent.', as: 'Suppose ∠B ≅ ∠C.',
      wa: ['Suppose ∠B and ∠C are not congruent.', 'Suppose AB = AC.', 'Suppose ∠A is a right angle.'],
      co: 'Then the sides opposite ∠B and ∠C would be equal, but AB ≠ AC.', wc: ['Then △ABC would still have exactly three angles.', 'Then ∠A would have to be the largest angle.', 'Then the angles of △ABC would add to 180°.'] },
    { pr: 'A triangle has at most one right angle.', as: 'Suppose a triangle has two right angles.',
      wa: ['Suppose a triangle has exactly one right angle.', 'Suppose a triangle has no right angles.', 'Suppose a triangle has at most one right angle.'],
      co: 'The two right angles add to 180°, leaving 0° for the third angle.', wc: ['Each right angle measures exactly 90°.', 'The side opposite a right angle is the longest side.', 'The other two angles of a right triangle are acute.'] },
    { g: `Point ${V('P')} is not on line ${ell}.`, pr: `At most one line through ${V('P')} is perpendicular to ${ell}.`, as: `Suppose two different lines through ${V('P')} are perpendicular to ${ell}.`,
      wa: [`Suppose exactly one line through ${V('P')} is perpendicular to ${ell}.`, `Suppose ${V('P')} is on line ${ell}.`, `Suppose no line through ${V('P')} is perpendicular to ${ell}.`],
      co: `The two lines and ${ell} would form a triangle with two right angles.`, wc: [`Both lines would pass through the point ${V('P')}.`, `Each of the two lines would make a 90° angle with ${ell}.`, `Line ${ell} would have to be horizontal.`] },
  ];

  A.skill({
    id: 'int2.proof-by-contradiction', title: 'Proof by contradiction',
    learn: p(`In a <b>proof by contradiction</b> you prove a statement by showing that its opposite is impossible. <b>Step 1: assume the opposite of what you want to prove</b> (the given facts stay true). <b>Step 2:</b> reason from that assumption until you reach a <b>contradiction</b>: something impossible, such as a result that clashes with the given or with a known fact. <b>Step 3:</b> conclude that the assumption was false, so the statement is true.`) +
      p(`Assuming the statement itself proves nothing, and neither does doubting the given. A true fact along the way is not a contradiction either; the contradiction is the step where two things cannot both hold.`) +
      example('Example', `${big('Prove: a triangle has at most one right angle.')}Assume a triangle has two right angles. Those two alone add to 90° + 90° = 180°, leaving 0° for the third angle, which is <b>impossible</b>. So the assumption is false: a triangle has at most one right angle.`),
    make(rng) {
      const kind = rng.pick(['assume', 'assume', 'contra', 'contra', 'eq', 'angle']);
      if (kind === 'eq') {
        const a = rng.int(2, 9), s = rng.int(-6, 9), b = rng.nz(-15, 15), c = a * s + b, k = s + rng.nz(-4, 4), v = a * k + b;
        return { prompt: `<p>Given: ${M.poly([a, b])} = ${N(c)}. Prove: ${X} ≠ ${N(k)}.</p>A proof by contradiction starts by assuming ${X} = ${N(k)}. Under that assumption, what number would ${M.poly([a, b])} equal?`, type: 'number', answer: v, params: { kind, a, b, c, k },
          hints: [`Substitute ${X} = ${N(k)}: ${N(a)}(${N(k)}) ${M.signed(b)}.`, `${N(a * k)} ${M.signed(b)} = ${N(v)}.`, `The left side would be <b>${N(v)}</b>, but the given says it is ${N(c)}. That contradiction proves ${X} ≠ ${N(k)}.`] };
      }
      if (kind === 'angle') {
        const al = rng.int(3, 12) * 5, be = rng.int(3, 12) * 5, real = 180 - al - be, ga = real + rng.pick([-20, -15, -10, -5, 5, 10, 15, 20]);
        return { prompt: `<p>Given: in △ABC, m∠A = ${N(al)}° and m∠B = ${N(be)}°. Prove: m∠C ≠ ${N(ga)}°.</p>A proof by contradiction starts by assuming m∠C = ${N(ga)}°. What would the three angles of the triangle then add up to?`, type: 'number', answer: al + be + ga, unit: '°', params: { kind, al, be, ga },
          hints: [`Add the three angles: ${N(al)}° + ${N(be)}° + ${N(ga)}°.`, `${N(al + be)}° + ${N(ga)}° = ${N(al + be + ga)}°.`, `They would add to <b>${N(al + be + ga)}°</b>, but every triangle's angles add to 180°. That contradiction proves m∠C ≠ ${N(ga)}°.`] };
      }
      const pi = rng.int(0, PBC.length - 1), it = PBC[pi], head = `${it.g ? `<p>Given: ${it.g}</p>` : ''}<p>Prove: ${it.pr}</p>`;
      if (kind === 'assume') return { prompt: `${head}To prove this by contradiction, what should you assume first?`, type: 'choice', answer: it.as, choices: rng.shuffle([it.as].concat(it.wa)), params: { kind, pi },
        hints: ['A proof by contradiction starts by assuming the opposite of what you want to prove. The given facts stay true.', `You want to prove “${it.pr}” Assume the opposite of that.`, `<b>${it.as}</b>`] };
      return { prompt: `${head}The proof begins: “${it.as}” Which statement is the contradiction that finishes the proof?`, type: 'choice', answer: it.co, choices: rng.shuffle([it.co].concat(it.wc)), params: { kind, pi },
        hints: ['A contradiction is something impossible: it clashes with the given, with the assumption, or with a known fact.', 'The other options are true facts or steps along the way; nothing about them is impossible.', `<b>${it.co}</b> So the assumption was false, and the statement is proved.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'eq') { const sol = (P.c - P.b) / P.a; return sol !== P.k && q.answer - P.c === P.a * (P.k - sol); }     // how far the left side misses
      if (P.kind === 'angle') return q.answer - 180 === P.ga - (180 - P.al - P.be) && q.answer !== 180;
      const it = PBC[P.pi], right = P.kind === 'assume' ? it.as : it.co, wrong = P.kind === 'assume' ? it.wa : it.wc;
      return q.answer === right && !wrong.includes(right);
    },
  });

  /* Reasons in proofs. Each proof is a list of [statement, reason key, extra]; extra.parts lists the congruent
     pairs (S = side, A = angle at a vertex) that a triangle congruence or similarity rests on. */
  const RS = { mid: 'Definition of midpoint', bis: 'Definition of angle bisector', perp: 'Definition of perpendicular lines', rightc: 'All right angles are congruent',
    refl: 'Reflexive property', vert: 'Vertical angles are congruent', alt: 'Alternate interior angles are congruent', corr: 'Corresponding angles are congruent',
    para: 'Definition of a parallelogram', rhom: 'Definition of a rhombus', linear: 'Angles in a linear pair are supplementary', tri180: 'The angles of a triangle add to 180°',
    subst: 'Substitution', subtr: 'Subtraction property of equality', cpctc: 'Corresponding parts of congruent triangles are congruent',
    simsides: 'Corresponding sides of similar triangles are proportional', SSS: 'SSS ≅', SAS: 'SAS ≅', ASA: 'ASA ≅', AAS: 'AAS ≅', HL: 'HL ≅', AA: 'AA ~', SASs: 'SAS ~', SSSs: 'SSS ~' };
  const WHY = { mid: 'A midpoint cuts a segment into two congruent pieces, and the given names a midpoint.', bis: 'An angle bisector cuts an angle into two congruent angles.',
    perp: 'Perpendicular lines meet to form right angles.', rightc: 'Both angles are right angles, and every right angle measures 90°.',
    refl: 'This part is shared by both triangles, and anything is congruent to itself.', vert: 'The two angles sit opposite each other where two segments cross.',
    alt: 'The lines are parallel, and the two angles are on opposite sides of the transversal, between the parallel lines.', corr: 'The lines are parallel, and the two angles are in matching positions where the transversal crosses each line.',
    para: 'A parallelogram is defined as a quadrilateral whose opposite sides are parallel.', rhom: 'A rhombus is defined as a quadrilateral with four congruent sides.',
    linear: 'The two angles together make a straight line.', tri180: 'These are the three angles of one triangle.', subst: 'A known measure has been put in place of the angle name.',
    subtr: 'The same amount has been subtracted from both sides of the equation.', cpctc: 'The triangles were already proved congruent, so their matching parts are congruent.',
    simsides: 'The triangles were already proved similar, so their matching sides share one ratio.', SSS: 'Three pairs of sides are congruent.',
    SAS: 'Two pairs of sides are congruent, and so are the angles between them.', ASA: 'Two pairs of angles are congruent, and so are the sides between them.',
    AAS: 'Two pairs of angles are congruent, and so is a pair of sides that is not between them.', HL: 'They are right triangles with congruent hypotenuses and a pair of congruent legs.',
    AA: 'Two pairs of angles are congruent, which is enough for similarity.' };
  const PROOFS = [
    { g: 'C is the midpoint of AE and of BD.', pr: '△ABC ≅ △EDC', rows: [['C is the midpoint of AE and of BD', 'given'], ['AC ≅ EC and BC ≅ DC', 'mid'], ['∠ACB ≅ ∠ECD', 'vert'],
      ['△ABC ≅ △EDC', 'SAS', { parts: [['S', 'AC'], ['S', 'BC'], ['A', 'C']], from: [1, 2] }], ['AB ≅ ED', 'cpctc']] },
    { g: 'AB ≅ AD, and AC bisects ∠BAD.', pr: '△ABC ≅ △ADC', rows: [['AB ≅ AD, and AC bisects ∠BAD', 'given'], ['∠BAC ≅ ∠DAC', 'bis'], ['AC ≅ AC', 'refl'],
      ['△ABC ≅ △ADC', 'SAS', { parts: [['S', 'AB'], ['A', 'A'], ['S', 'AC']], from: [0, 1, 2] }], ['BC ≅ DC', 'cpctc']] },
    { g: 'AE and BD cross at C, AB ∥ DE, and AC ≅ EC.', pr: '△ABC ≅ △EDC', rows: [['AB ∥ DE and AC ≅ EC', 'given'], ['∠BAC ≅ ∠DEC', 'alt'], ['∠ACB ≅ ∠ECD', 'vert'],
      ['△ABC ≅ △EDC', 'ASA', { parts: [['A', 'A'], ['S', 'AC'], ['A', 'C']], from: [0, 1, 2], near: ['AAS'] }], ['BC ≅ DC', 'cpctc']] },
    { g: 'CD ⟂ AB, and D is the midpoint of AB.', pr: 'AC ≅ BC', rows: [['CD ⟂ AB, and D is the midpoint of AB', 'given'], ['∠ADC and ∠BDC are right angles', 'perp'],
      ['∠ADC ≅ ∠BDC', 'rightc', { near: ['perp'] }], ['AD ≅ BD', 'mid'], ['CD ≅ CD', 'refl'], ['△ADC ≅ △BDC', 'SAS', { parts: [['S', 'AD'], ['A', 'D'], ['S', 'CD']], from: [2, 3, 4] }], ['AC ≅ BC', 'cpctc']] },
    { g: 'In △ABC, D is on AB, E is on AC, and DE ∥ BC.', pr: '△ADE ~ △ABC', rows: [['DE ∥ BC', 'given'], ['∠ADE ≅ ∠ABC', 'corr'], ['∠A ≅ ∠A', 'refl'],
      ['△ADE ~ △ABC', 'AA', { parts: [['A', 'D'], ['A', 'A']], from: [1, 2] }], [`${F('AD', 'AB')} = ${F('DE', 'BC')}`, 'simsides']] },
    { g: 'ABCD is a parallelogram with diagonal AC.', pr: 'AB ≅ CD', rows: [['ABCD is a parallelogram', 'given'], ['AB ∥ DC and AD ∥ BC', 'para'], ['∠BAC ≅ ∠DCA and ∠BCA ≅ ∠DAC', 'alt'],
      ['AC ≅ CA', 'refl'], ['△ABC ≅ △CDA', 'ASA', { parts: [['A', 'A'], ['S', 'AC'], ['A', 'C']], from: [2, 3], near: ['AAS'] }], ['AB ≅ CD', 'cpctc']] },
    { g: 'ABCD is a rhombus.', pr: 'Diagonal AC bisects ∠BAD.', rows: [['ABCD is a rhombus', 'given'], ['AB ≅ AD and CB ≅ CD', 'rhom'], ['AC ≅ AC', 'refl'],
      ['△ABC ≅ △ADC', 'SSS', { parts: [['S', 'AB'], ['S', 'CB'], ['S', 'AC']], from: [1, 2] }], ['∠BAC ≅ ∠DAC', 'cpctc'], ['AC bisects ∠BAD', 'bis']] },
    { g: 'BD ⟂ AC, and AB ≅ CB.', pr: 'AD ≅ CD', rows: [['BD ⟂ AC and AB ≅ CB', 'given'], ['∠ADB and ∠CDB are right angles', 'perp'], ['BD ≅ BD', 'refl'],
      ['△ABD ≅ △CBD', 'HL', { parts: [['A', 'D', 'right'], ['S', 'AB'], ['S', 'BD']], from: [0, 1, 2], near: ['SSS', 'SAS'] }], ['AD ≅ CD', 'cpctc']] },
    { g: '∠B ≅ ∠D, and AC bisects ∠BAD.', pr: 'AB ≅ AD', rows: [['∠B ≅ ∠D, and AC bisects ∠BAD', 'given'], ['∠BAC ≅ ∠DAC', 'bis'], ['AC ≅ AC', 'refl'],
      ['△ABC ≅ △ADC', 'AAS', { parts: [['A', 'B'], ['A', 'A'], ['S', 'AC']], from: [0, 1, 2], near: ['ASA'] }], ['AB ≅ AD', 'cpctc']] },
    { g: '∠1 and ∠2 form a linear pair, and m∠1 = 65°.', pr: 'm∠2 = 115°', rows: [['∠1 and ∠2 form a linear pair, and m∠1 = 65°', 'given'], ['m∠1 + m∠2 = 180°', 'linear'],
      ['65° + m∠2 = 180°', 'subst', { near: ['linear'] }], ['m∠2 = 115°', 'subtr', { near: ['subst'] }]] },
    { g: 'In △ABC, m∠A = 50° and m∠B = 60°.', pr: 'm∠C = 70°', rows: [['m∠A = 50° and m∠B = 60°', 'given'], ['m∠A + m∠B + m∠C = 180°', 'tri180'],
      ['50° + 60° + m∠C = 180°', 'subst', { near: ['tri180'] }], ['m∠C = 70°', 'subtr', { near: ['subst'] }]] },
  ];
  const CRITERIA = ['SSS', 'SAS', 'ASA', 'AAS', 'HL'], SIMS = ['AA', 'SASs', 'SSSs'];
  const FACTS = Object.keys(RS).filter(k => !CRITERIA.includes(k) && !SIMS.includes(k));
  /** the congruence or similarity shortcut that a list of congruent parts supports */
  function criterion(parts, sim) {
    const S = parts.filter(x => x[0] === 'S').map(x => x[1]), An = parts.filter(x => x[0] === 'A');
    if (sim) return An.length >= 2 ? 'AA' : S.length === 3 ? 'SSSs' : 'SASs';
    if (S.length === 3) return 'SSS';
    if (S.length === 2) { const v = An[0][1]; return S.every(s => s.includes(v)) ? 'SAS' : An[0][2] === 'right' && S.some(s => !s.includes(v)) ? 'HL' : 'SSA'; }
    return An.every(x => S[0].includes(x[1])) ? 'ASA' : 'AAS';
  }
  /** a quick test that a reason fits its statement: st = the statement, g = the given, before = earlier statements */
  const sameParts = (a, b) => a === b || a === [...b].reverse().join('');
  const RULES = {
    mid: (st, g) => /midpoint/.test(g) && !/[∠△]/.test(st), bis: (st, g) => /bisects/.test(st) || (/bisects/.test(g) && /∠/.test(st)),
    perp: (st, g) => /⟂/.test(g) && /right angles/.test(st), rightc: (st, g, before) => /right angles/.test(before) && /^∠\w+ ≅ ∠\w+$/.test(st),
    refl: st => { const m = st.match(/^(∠?)(\w+) ≅ (∠?)(\w+)$/); return !!m && m[1] === m[3] && sameParts(m[2], m[4]); },
    vert: st => { const m = st.match(/^∠(\w)(\w)(\w) ≅ ∠(\w)(\w)(\w)$/); return !!m && m[2] === m[5] && m[1] !== m[4] && m[3] !== m[6]; },
    alt: (st, g, before) => /∥/.test(g + before) && /∠/.test(st), corr: (st, g, before) => /∥/.test(g + before) && /∠/.test(st),
    para: (st, g) => /parallelogram/.test(g) && /∥/.test(st), rhom: (st, g) => /rhombus/.test(g) && !/[∠△]/.test(st),
    linear: (st, g) => /linear pair/.test(g) && /= 180°$/.test(st), tri180: st => (st.match(/m∠/g) || []).length === 3 && /= 180°$/.test(st),
    subst: st => /^\d+° \+/.test(st) && /= 180°$/.test(st), subtr: st => /^m∠\w = \d+°$/.test(st),
    cpctc: (st, g, before) => /△\w+ ≅ △/.test(before) && !/△/.test(st), simsides: (st, g, before) => /△\w+ ~ △/.test(before) && /=/.test(st),
  };

  A.skill({
    id: 'int2.proof-reasons', title: 'Reasons in proofs',
    learn: p(`Every step of a proof needs a <b>reason</b>: the given, a definition, a property, or a theorem. In a <b>two-column proof</b> the statements go on the left and the reasons on the right; in a <b>flowchart proof</b> each fact sits in a bubble with its reason underneath, and arrows show which facts lead to which.`) +
      p(`Common reasons: <b>definitions</b> (a midpoint makes two congruent segments; a bisector makes two congruent angles; perpendicular lines make right angles), the <b>reflexive property</b> for a side or angle the triangles share, <b>vertical angles</b>, angles made by <b>parallel lines</b>, the <b>triangle shortcuts</b> SSS, SAS, ASA, AAS and HL (and AA for similarity), and then <b>corresponding parts of congruent triangles are congruent</b> to reach the final goal.`) +
      example('Example', `Given: C is the midpoint of AE and of BD. The step “AC ≅ EC and BC ≅ DC” is justified by the <b>definition of midpoint</b>; “∠ACB ≅ ∠ECD” by <b>vertical angles are congruent</b>; and with two sides and the angle between them, “△ABC ≅ △EDC” by <b>SAS ≅</b>.`),
    make(rng) {
      const pi = rng.int(0, PROOFS.length - 1), pf = PROOFS[pi], ri = rng.int(1, pf.rows.length - 1), row = pf.rows[ri], ex = row[2] || {}, key = row[1];
      const isTri = !!ex.parts, avoid = [key].concat(ex.near || []);
      const pool = isTri ? (key === 'AA' ? ['SASs', 'SSSs', 'ASA', 'SAS'] : CRITERIA.concat(['AA'])) : FACTS;
      const choices = [RS[key]].concat(rng.sample(pool.filter(k => !avoid.includes(k)), 3).map(k => RS[k]));
      const head = `<p>Given: ${pf.g}<br>Prove: ${pf.pr}</p>`;
      const known = isTri ? ex.parts.map(x => x[0] === 'S' ? `side ${x[1]}` : `${x[2] === 'right' ? 'the right angle' : 'angle'} ${x[1]}`).join(', ') : '';
      let prompt;
      if (isTri && rng.bool()) prompt = `${head}In a flowchart proof, the bubbles ${ex.from.map(i => `“${pf.rows[i][0]}”`).join(', ')} all point to the bubble “${row[0]}”. Which reason belongs under that bubble?`;
      else prompt = `${head}${M.table(['Statement', 'Reason'], pf.rows.map((r, i) => [`${i + 1}. ${r[0]}`, i === ri ? '<b>?</b>' : r[1] === 'given' ? 'Given' : RS[r[1]]]))}What is the reason for step ${ri + 1}?`;
      return { prompt, type: 'choice', answer: RS[key], choices: rng.shuffle(choices), params: { pi, ri },
        hints: [isTri ? `List the congruent pairs you know, named by the first triangle's letters: ${known}.` : `Ask which earlier fact, definition or property makes “${row[0]}” true.`,
          WHY[key], `<b>${RS[key]}</b>.`] };
    },
    verify(q) {
      const P = q.params, pf = PROOFS[P.pi], row = pf.rows[P.ri], ex = row[2] || {};
      const key = Object.keys(RS).find(k => RS[k] === q.answer);
      if (!key || (ex.near || []).includes(key)) return false;
      if (ex.parts) return criterion(ex.parts, row[0].includes('~')) === key;          // work the shortcut out from the parts
      return !!RULES[key] && RULES[key](row[0], pf.g, pf.rows.slice(0, P.ri).map(r => r[0]).join(' ; '));
    },
  });


  /* ---------- Unit 10: More about parabolas ---------- */
  /** a grid for x in xr and y in yr, with the curve y = f(x), dashed lines y = c, and labelled dots [x, y, label] */
  function curveFig(f, xr, yr, opts) {
    opts = opts || {};
    const W = 260, H = 240, pad = 14;
    const px = x => +(pad + (x - xr[0]) / (xr[1] - xr[0]) * (W - 2 * pad)).toFixed(1), py = y => +(H - pad - (y - yr[0]) / (yr[1] - yr[0]) * (H - 2 * pad)).toFixed(1);
    const step = r => { const span = r[1] - r[0]; return span <= 16 ? 1 : span <= 32 ? 2 : span <= 80 ? 5 : 10; };
    const sx = step(xr), sy = step(yr);
    let g = '';
    for (let x = Math.ceil(xr[0] / sx) * sx; x <= xr[1]; x += sx) if (x !== 0) g += `<line class="light" x1="${px(x)}" y1="${py(yr[0])}" x2="${px(x)}" y2="${py(yr[1])}" stroke-width="1"/>`;
    for (let y = Math.ceil(yr[0] / sy) * sy; y <= yr[1]; y += sy) if (y !== 0) g += `<line class="light" x1="${px(xr[0])}" y1="${py(y)}" x2="${px(xr[1])}" y2="${py(y)}" stroke-width="1"/>`;
    if (yr[0] < 0 && yr[1] > 0) g += `<line class="stroke" x1="${px(xr[0])}" y1="${py(0)}" x2="${px(xr[1])}" y2="${py(0)}" stroke-width="1.5"/><text x="${px(xr[1]) - 4}" y="${py(0) - 6}" font-size="13" font-style="italic" text-anchor="end">x</text>`;
    if (xr[0] < 0 && xr[1] > 0) g += `<line class="stroke" x1="${px(0)}" y1="${py(yr[0])}" x2="${px(0)}" y2="${py(yr[1])}" stroke-width="1.5"/><text x="${px(0) + 6}" y="${py(yr[1]) + 12}" font-size="13" font-style="italic">y</text>`;
    (opts.hlines || []).forEach(([c, lab]) => { g += `<line class="stroke" x1="${px(xr[0])}" y1="${py(c)}" x2="${px(xr[1])}" y2="${py(c)}" stroke-width="1.5" stroke-dasharray="6 4"/><text x="${px(xr[1]) - 4}" y="${py(c) - 5}" font-size="12" text-anchor="end">${lab}</text>`; });
    let d = '', pen = false;
    for (let i = 0; i <= 160; i++) {
      const x = xr[0] + (xr[1] - xr[0]) * i / 160, y = f(x);
      if (y < yr[0] || y > yr[1]) { pen = false; continue; }
      d += `${pen ? 'L' : 'M'}${px(x)},${py(y)} `; pen = true;
    }
    g += `<path d="${d.trim()}" fill="none" stroke="var(--primary)" stroke-width="2.5"/>`;
    (opts.dots || []).forEach(([x, y, lab, pos]) => {
      const right = pos ? pos !== 'bl' && pos !== 'l' : px(x) < W - 70, below = pos === 'bl' || pos === 'br' || (!pos && py(y) < 24);
      g += `<circle cx="${px(x)}" cy="${py(y)}" r="4" fill="var(--primary)"/><text x="${px(x) + (right ? 7 : -7)}" y="${py(y) + (below ? 16 : -7)}" font-size="12" text-anchor="${right ? 'start' : 'end'}">${lab}</text>`;
    });
    return `<svg class="figure" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="graph of a parabola">${g}</svg>`;
  }
  /** a number as a coefficient in front of brackets: 1 → '', −1 → '−', 0.5 → ½ as a fraction */
  function coefTxt(a) {
    if (Number.isInteger(a)) return coef(a);
    for (let dd = 2; dd <= 12; dd++) if (Number.isInteger(M.round(a * dd, 9))) return (a < 0 ? '−' : '') + F(Math.abs(M.round(a * dd, 9)), dd);
    return N(a);
  }
  /** a value as a number or a fraction, for hints */
  function numTxt(a) { if (Number.isInteger(a)) return N(a); for (let dd = 2; dd <= 12; dd++) if (Number.isInteger(M.round(a * dd, 9))) return F(M.round(a * dd, 9), dd); return N(a); }
  /** solve for A in y = Ax² + Bx + C through three points, by Cramer's rule */
  function leadThrough(pts) {
    const det3 = m => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const D = det3(pts.map(([x]) => [x * x, x, 1])), DA = det3(pts.map(([x, y]) => [y, x, 1]));
    return DA / D;
  }

  A.skill({
    id: 'int2.write-quadratic', title: 'Writing quadratic equations from x-intercepts',
    learn: p(`If a parabola crosses the ${X}-axis at ${X} = ${V('r')} and ${X} = ${V('s')}, its equation can be written in <b>factored form</b>: <b>${Y} = ${V('a')}(${X} − ${V('r')})(${X} − ${V('s')})</b>. The intercepts fix the factors (watch the signs: an intercept at −3 gives the factor ${X} + 3), but many parabolas share those intercepts, some tall, some flat, some upside down.`) +
      p(`To pin down ${V('a')}, use <b>one more point</b> on the graph, such as the ${Y}-intercept or the vertex: substitute its ${X} and ${Y} into the equation and solve for ${V('a')}. A negative ${V('a')} means the parabola opens downward.`) +
      example('Example', `${big(`${X}-intercepts −1 and 3, passing through (1, −8)`)}${Y} = ${V('a')}(${X} + 1)(${X} − 3). Substitute (1, −8): −8 = ${V('a')}(2)(−2) = −4${V('a')}, so ${V('a')} = 2 and <b>${Y} = 2(${X} + 1)(${X} − 3)</b>.`),
    make(rng) {
      let r, s, a, x0, y0, kind;
      do {
        r = rng.int(-6, 5); s = rng.int(r + 1, 6); a = rng.pick([1, -1, 2, -2, 3, -3, 0.5, -0.5]);
        kind = rng.pick(['point', 'point', 'yint', 'vertex']);
        x0 = kind === 'yint' ? 0 : kind === 'vertex' ? (r + s) / 2 : rng.int(-6, 7);
        y0 = a * (x0 - r) * (x0 - s);
      } while (x0 === r || x0 === s || !Number.isInteger(x0) || !Number.isInteger(y0) || Math.abs(y0) > 24 || Math.abs(a * (s - r) * (s - r) / 4) > 30);
      const fac = v => v === 0 ? X : `(${M.poly([1, -v])})`;
      const eqTxt = (aa, u, w) => { if (w === 0) [u, w] = [w, u]; return `${Y} = ${coefTxt(aa)}${fac(u)}${fac(w)}`; };
      const what = kind === 'yint' ? `${Y}-intercept` : kind === 'vertex' ? 'vertex' : 'point';
      const prod = (x0 - r) * (x0 - s), asked = rng.bool() ? 'a' : 'eq', graph = rng.bool();
      let intro;
      if (graph) {
        const yv = a * ((s - r) / 2) * ((r - s) / 2), lo = Math.min(0, yv, y0), hi = Math.max(0, yv, y0), padY = Math.max(2, Math.round((hi - lo) / 8));
        intro = `The parabola crosses the ${X}-axis at the two labeled points and passes through the third.${curveFig(x => a * (x - r) * (x - s), [Math.min(r, x0) - 2, Math.max(s, x0) + 2], [lo - padY, hi + padY], { dots: [[r, 0, M.pt(r, 0), 'bl'], [s, 0, M.pt(s, 0), 'br'], [x0, y0, M.pt(x0, y0)]] })}`;
      } else intro = `A parabola has ${X}-intercepts ${M.pt(r, 0)} and ${M.pt(s, 0)}, and its ${what === 'point' ? 'graph passes through' : `${what} is`} ${M.pt(x0, y0)}.`;
      const hints = [`The ${X}-intercepts ${N(r)} and ${N(s)} give the factors: ${Y} = ${V('a')}${fac(r)}${fac(s)}.`,
        `Substitute ${M.pt(x0, y0)}: ${N(y0)} = ${V('a')}(${N(x0)} − ${wrap(r)})(${N(x0)} − ${wrap(s)}) = ${V('a')}(${N(x0 - r)})(${N(x0 - s)}) = ${N(prod)}${V('a')}.`];
      if (asked === 'a') return { prompt: `${intro} Its equation is ${Y} = ${V('a')}${fac(r)}${fac(s)}. What is ${V('a')}?`, type: 'number', answer: a, answerText: Number.isInteger(a) ? undefined : M.fracText(a * 2, 2), params: { asked, r, s, x0, y0 },
        hints: hints.concat(`Divide: ${V('a')} = ${N(y0)} ÷ ${wrap(prod)} = <b>${numTxt(a)}</b>.`) };
      const answer = eqTxt(a, r, s), target = mulPoly([a], mulPoly([1, -r], [1, -s]));
      const cands = [[a, -r, -s], [-a, r, s], [1 / a, r, s], [2 * a, r, s], [a, r, -s], [a, -r, s], [y0, r, s]];
      const opts = [{ t: answer, a, r, s }];
      for (const [aa, u, w] of cands) {
        if (opts.length === 4 || !aa || Math.abs(aa) > 30) continue;
        const poly = mulPoly([aa], mulPoly([1, -u], [1, -w])), t = eqTxt(aa, u, w);
        if (poly.every((c, i) => Math.abs(c - target[i]) < 1e-9) || opts.some(o => key(o.t) === key(t))) continue;
        opts.push({ t, a: aa, r: u, s: w });
      }
      return { prompt: `${intro} Which equation describes the parabola?`, type: 'choice', answer, choices: rng.shuffle(opts.map(o => o.t)), params: { asked, r, s, x0, y0, opts },
        hints: hints.concat(`Divide: ${V('a')} = ${N(y0)} ÷ ${wrap(prod)} = ${numTxt(a)}.`, `<b>${answer}</b>`) };
    },
    verify(q) {
      const P = q.params, pts = [[P.r, 0], [P.s, 0], [P.x0, P.y0]];
      if (P.asked === 'a') return Math.abs(leadThrough(pts) - q.answer) < 1e-9;              // fit y = Ax² + Bx + C through the three points
      const o = P.opts.find(x => x.t === q.answer);
      return !!o && pts.every(([x, y]) => Math.abs(o.a * (x - o.r) * (x - o.s) - y) < 1e-9);
    },
  });

  /** an interval of x (or t) values: k = 'in' for lo..hi, 'out' for below lo or above hi; st = strict */
  function setTxt(o, v) {
    const lt = o.st ? '&lt;' : '≤', gt = o.st ? '&gt;' : '≥';
    return o.k === 'in' ? `${N(o.lo)} ${lt} ${v} ${lt} ${N(o.hi)}` : `${v} ${lt} ${N(o.lo)} or ${v} ${gt} ${N(o.hi)}`;
  }
  const inSet = (o, x) => o.k === 'in' ? (o.st ? x > o.lo && x < o.hi : x >= o.lo && x <= o.hi) : (o.st ? x < o.lo || x > o.hi : x <= o.lo || x >= o.hi);
  const OPS = { '<': ['&lt;', (u, w) => u < w], '>': ['&gt;', (u, w) => u > w], '≤': ['≤', (u, w) => u <= w], '≥': ['≥', (u, w) => u >= w] };

  A.skill({
    id: 'int2.quadratic-inequalities', title: 'Quadratic inequalities',
    learn: p(`To solve a quadratic inequality such as ${M.poly([1, -2, -8])} &lt; 0, first solve the <b>equation</b> ${M.poly([1, -2, -8])} = 0: here (${X} + 2)(${X} − 4) = 0, so ${X} = −2 or ${X} = 4. Those two values split the number line, and the inequality is true on one side of the split and false on the other.`) +
      p(`Picture the parabola. One opening <b>up</b> is <b>below</b> the ${X}-axis <b>between</b> its zeros and above it outside them; one opening down is the other way round. So ${M.poly([1, -2, -8])} &lt; 0 for −2 &lt; ${X} &lt; 4. In a story, the same idea answers “when is the ball higher than 50 feet?”: solve height = 50, and the answer is the time <b>between</b> the two solutions.`) +
      example('Example', `${big(`${V('h')}(${V('t')}) = ${M.poly([-16, 56, 10], 't')}. When is ${V('h')} &gt; 50?`)}Set −16${sq(V('t'))} + 56${V('t')} + 10 = 50, then divide by −16: ${M.poly([1, -3.5, 2.5], 't')} = 0, so (${V('t')} − 1)(${V('t')} − 2.5) = 0. The ball is above 50 feet for <b>1 &lt; ${V('t')} &lt; 2.5</b> seconds.`),
    make(rng) {
      const kind = rng.pick(['interval', 'interval', 'duration', 'algebra', 'algebra']);
      if (kind === 'algebra') {
        const r = rng.int(-8, 6), s = rng.int(r + 1, 8), lead = rng.pick([1, 1, -1]), op = rng.pick(['<', '>', '≤', '≥']);
        const coefs = mulPoly([lead], mulPoly([1, -r], [1, -s])), st = op === '<' || op === '>', below = op === '<' || op === '≤';
        const inside = (lead > 0) === below, k = inside ? 'in' : 'out', kk = inside ? 'out' : 'in';
        const ans = { k, lo: r, hi: s, st };
        const cands = [{ k: kk, lo: r, hi: s, st }, { k, lo: r, hi: s, st: !st }, { k, lo: -s, hi: -r, st }, { k: kk, lo: -s, hi: -r, st }, { k: kk, lo: r, hi: s, st: !st }];
        const opts = [ans];
        cands.forEach(c => { if (opts.length < 4 && !opts.some(o => setTxt(o, X) === setTxt(c, X))) opts.push(c); });
        const fact = `${lead < 0 ? '−' : ''}(${M.poly([1, -r])})(${M.poly([1, -s])})`;
        return { prompt: `Solve.${big(`${M.poly(coefs)} ${OPS[op][0]} 0`)}`, type: 'choice', answer: setTxt(ans, X), choices: rng.shuffle(opts.map(o => setTxt(o, X))), params: { kind, coefs, op, opts },
          hints: [`Solve the equation first: ${M.poly(coefs)} = ${fact} = 0, so ${X} = ${N(r)} or ${X} = ${N(s)}.`,
            `The parabola opens ${lead > 0 ? 'up' : 'down'}, so it is ${lead > 0 ? 'below' : 'above'} the ${X}-axis between ${N(r)} and ${N(s)}, and ${lead > 0 ? 'above' : 'below'} it outside them.`,
            `You want ${OPS[op][0]} 0, which happens ${inside ? 'between' : 'outside'} the zeros${st ? '' : ', counting the zeros themselves'}: <b>${setTxt(ans, X)}</b>.`] };
      }
      const t1 = rng.pick([0.5, 1, 1.5, 2]), t2 = t1 + rng.pick([1, 1.5, 2, 2.5, 3]), c = rng.pick([0, 4, 5, 6, 8, 10]);
      const H = c + 16 * t1 * t2, b = 16 * (t1 + t2), T = V('t'), name = rng.pick(NAMES), strictQ = rng.chance(0.7);
      const scene = rng.pick([`${name} kicks a ball into the air`, `A model rocket is launched`, `${name} throws a ball upward`, `A pumpkin is launched from a catapult`]);
      const intro = `${scene}. Its height in feet after ${T} seconds is ${V('h')}(${T}) = ${M.poly([-16, b, c], 't')}.`;
      const hints = [`Set the height equal to ${N(H)}: ${M.poly([-16, b, c], 't')} = ${N(H)}, so ${M.poly([-16, b, c - H], 't')} = 0.`,
        `Divide by −16: ${M.poly([1, -(t1 + t2), t1 * t2], 't')} = 0, which factors as (${T} − ${N(t1)})(${T} − ${N(t2)}) = 0. The height is exactly ${N(H)} feet at ${T} = ${N(t1)} and ${T} = ${N(t2)}.`];
      if (kind === 'duration') return { prompt: `${intro} For how many seconds is it higher than ${N(H)} feet?`, type: 'number', answer: t2 - t1, unit: 's', params: { kind, b, c, H },
        hints: hints.concat(`The parabola opens down, so it is above ${N(H)} feet between those times: ${N(t2)} − ${N(t1)} = <b>${N(t2 - t1)}</b> seconds.`) };
      const ans = { k: 'in', lo: t1, hi: t2, st: strictQ }, tv = (t1 + t2) / 2;
      const cands = [{ k: 'out', lo: t1, hi: t2, st: strictQ }, { k: 'in', lo: 0, hi: t2, st: strictQ }, { k: 'in', lo: t1, hi: tv, st: strictQ }, { k: 'in', lo: tv, hi: t2, st: strictQ }];
      const opts = [ans].concat(rng.sample(cands, 3));
      return { prompt: `${intro} During which time interval is its height ${strictQ ? 'more than' : 'at least'} ${N(H)} feet?`, type: 'choice', answer: setTxt(ans, T), choices: rng.shuffle(opts.map(o => setTxt(o, T))), params: { kind, b, c, H, opts },
        hints: hints.concat(`The parabola opens down, so it is above ${N(H)} feet between those times${strictQ ? '' : ', and exactly at it at the two ends'}: <b>${setTxt(ans, T)}</b>.`) };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'algebra') {                                       // test a fine grid of x values against the chosen set
        const o = P.opts.find(x => setTxt(x, X) === q.answer); if (!o) return false;
        for (let x = -20; x <= 20; x += 0.25) if (OPS[P.op][1](evalPoly(P.coefs, x), 0) !== inSet(o, x)) return false;
        return true;
      }
      const h = t => -16 * t * t + P.b * t + P.c;
      const land = (P.b + Math.sqrt(P.b * P.b + 64 * P.c)) / 32;
      if (P.kind === 'duration') {                                      // add up the time spent above H in small steps
        let above = 0; const dt = 0.0005; for (let t = dt / 2; t < land; t += dt) if (h(t) > P.H) above += dt;
        return Math.abs(above - q.answer) < 0.002;
      }
      const o = P.opts.find(x => setTxt(x, V('t')) === q.answer); if (!o) return false;
      for (let t = 0; t <= land; t += 0.125) if ((o.st ? h(t) > P.H : h(t) >= P.H) !== inSet(o, t)) return false;
      return true;
    },
  });

  A.skill({
    id: 'int2.focus-directrix', title: 'Parabolas from a focus and directrix',
    learn: p(`A parabola can be defined without any equation: it is <b>every point that is the same distance from a fixed point, the focus, as from a fixed line, the directrix</b>. The <b>vertex</b> is halfway between the focus and the directrix, and the parabola wraps around the focus, opening away from the directrix.`) +
      p(`If the vertex is (${V('h')}, ${V('k')}) and the focus is ${V('p')} units above it (so the directrix is ${V('p')} units below), the equation is <b>${sq(`(${X} − ${V('h')})`)} = 4${V('p')}(${Y} − ${V('k')})</b>. A negative ${V('p')} means the focus is below the vertex and the parabola opens down. The same thing in “${Y} =” form is ${Y} = ${F(1, `4${V('p')}`)}${sq(`(${X} − ${V('h')})`)} + ${V('k')}.`) +
      example('Example', `Focus (2, 5), directrix ${Y} = 1. The vertex is halfway, at (2, 3), and the focus is ${V('p')} = 2 above it. So <b>${sq(`(${X} − 2)`)} = 8(${Y} − 3)</b>.`),
    make(rng) {
      const kind = rng.pick(['vertex', 'equation', 'equation', 'focus', 'directrix', 'dist']);
      const h = rng.int(-5, 5), k = rng.int(-5, 5), p = rng.pick([0.5, 1, 1, 2, 2, 3, -0.5, -1, -1, -2, -2, -3]);
      const fy = k + p, dy = k - p, foc = M.pt(h, fy), dirTxt = `${Y} = ${N(dy)}`;
      const eqTxt = (hh, kk, four) => `${sqBin('x', hh)} = ${four === 1 ? '' : four === -1 ? '−' : N(four)}${kk === 0 ? Y : `(${M.poly([1, -kk], 'y')})`}`;
      const given = `A parabola has focus ${foc} and directrix ${dirTxt}.`;
      const mid = `The vertex is halfway between the focus and the directrix: ${Y} = (${N(fy)} + ${wrap(dy)}) ÷ 2 = ${N(k)}, so it is ${M.pt(h, k)}.`;
      const pHint = `The focus is ${N(Math.abs(p))} unit${Math.abs(p) === 1 ? '' : 's'} ${p > 0 ? 'above' : 'below'} the vertex, so ${V('p')} = ${N(p)} and 4${V('p')} = ${N(4 * p)}.`;
      const pick = (answer, cands) => [answer].concat(distinct(answer, cands, 3));
      if (kind === 'vertex') {
        const answer = M.pt(h, k), ch = pick(answer, [foc, M.pt(h, dy), M.pt(h, fy - dy), M.pt(k, h), M.pt(h, k + 2 * p)]);
        return { prompt: `${given} What is its vertex?`, type: 'choice', answer, choices: rng.shuffle(ch), params: { kind, h, fy, dy, opts: ch },
          hints: ['The vertex is on the parabola, so it is the same distance from the focus as from the directrix: halfway between them.', mid, `<b>${answer}</b>.`] };
      }
      if (kind === 'equation') {
        const answer = eqTxt(h, k, 4 * p), ch = pick(answer, [eqTxt(h, k, p), eqTxt(h, k, -4 * p), eqTxt(-h, -k, 4 * p), eqTxt(h, fy, 4 * p), eqTxt(h, k, 2 * p)]);
        return { prompt: `${given} Which is its equation?`, type: 'choice', answer, choices: rng.shuffle(ch), params: { kind, h, fy, dy, opts: ch },
          hints: [mid, pHint, `Use ${sq(`(${X} − ${V('h')})`)} = 4${V('p')}(${Y} − ${V('k')}): <b>${answer}</b>.`] };
      }
      const a = 1 / (4 * p), shown = rng.bool() ? eqTxt(h, k, 4 * p) : `${Y} = ${coefTxt(a)}${sqBin('x', h)}${k === 0 ? '' : ' ' + M.signed(k)}`;
      const readP = shown.startsWith(Y) ? `In ${Y} = ${V('a')}${sq(`(${X} − ${V('h')})`)} + ${V('k')}, the vertex is (${V('h')}, ${V('k')}) = ${M.pt(h, k)} and ${V('a')} = ${F(1, `4${V('p')}`)}. Here ${V('a')} = ${numTxt(a)}, so 4${V('p')} = ${N(4 * p)} and ${V('p')} = ${N(p)}.`
        : `Compare with ${sq(`(${X} − ${V('h')})`)} = 4${V('p')}(${Y} − ${V('k')}): the vertex is ${M.pt(h, k)} and 4${V('p')} = ${N(4 * p)}, so ${V('p')} = ${N(p)}.`;
      if (kind === 'focus') {
        const answer = foc, ch = pick(answer, [M.pt(h, dy), M.pt(h, k + 4 * p), M.pt(h + p, k), M.pt(-h, fy), M.pt(h, k)]);
        return { prompt: `Where is the focus of this parabola?${big(shown)}`, type: 'choice', answer, choices: rng.shuffle(ch), params: { kind, h, k, a, opts: ch },
          hints: [readP, `The focus is ${V('p')} = ${N(p)} from the vertex along the axis: ${M.pt(h, k)} → ${M.pt(h, fy)}.`, `<b>${answer}</b>.`] };
      }
      if (kind === 'directrix') return { prompt: `The directrix of this parabola is a line ${Y} = ${V('c')}. What is ${V('c')}?${big(shown)}`, type: 'number', answer: dy, params: { kind, h, k, a },
        hints: [readP, `The directrix is ${V('p')} units on the other side of the vertex from the focus: ${Y} = ${N(k)} − ${wrap(p)}.`, `The directrix is ${Y} = ${N(dy)}, so ${V('c')} = <b>${N(dy)}</b>.`] };
      const j = rng.pick((Math.abs(p) <= 1 ? [2, 3] : [1, 2, 2]).filter(m => Math.abs(2 * p * m) <= 8)), u = 2 * p * j * rng.sign(), x0 = h + u, y0 = k + u * u / (4 * p), hw = Math.max(5, Math.abs(u) + 2);
      const fig = curveFig(x => k + (x - h) * (x - h) / (4 * p), [h - hw, h + hw], [Math.min(dy, fy, y0, k) - 3, Math.max(dy, fy, y0, k) + 3], { hlines: [[dy, `directrix ${Y} = ${N(dy)}`]], dots: [[h, fy, `F${foc}`, u > 0 ? 'l' : 'r'], [x0, y0, `P${M.pt(x0, y0)}`, u > 0 ? 'l' : 'r']] });
      return { prompt: `${given} The point P${M.pt(x0, y0)} is on the parabola. How far is P from the focus?${fig}`, type: 'number', answer: Math.abs(y0 - dy), params: { kind, h, fy, x0, y0 },
        hints: ['Every point on a parabola is the same distance from the focus as from the directrix.', `The distance from P to the horizontal line ${dirTxt} is straight up or down: |${N(y0)} − ${wrap(dy)}| = ${N(Math.abs(y0 - dy))}.`, `So P is <b>${N(Math.abs(y0 - dy))}</b> units from the focus too.`] };
    },
    verify(q) {
      const P = q.params, eqd = (x, y, fx, fyy, d) => Math.abs(Math.hypot(x - fx, y - fyy) - Math.abs(y - d)) < 1e-9;   // equidistant from focus and directrix
      if (P.kind === 'dist') return Math.abs(Math.hypot(P.x0 - P.h, P.y0 - P.fy) - q.answer) < 1e-9;
      const nums = t => A.stripTags(t).replace(/−/g, '-').match(/-?\d+(\.\d+)?/g).map(Number);
      if (P.kind === 'vertex') { const [vx, vy] = nums(q.answer); return vx === P.h && eqd(vx, vy, P.h, P.fy, P.dy); }
      if (P.kind === 'equation') {                                      // read h, k, 4p back out of the chosen equation and test points on it
        const t = A.stripTags(q.answer).replace(/\s+/g, '').replace(/−/g, '-');
        const m = t.match(/^(?:\(x([+-]\d+)\)|x)2=(-?\d*(?:\.\d+)?)(?:\(y([+-]\d+(?:\.\d+)?)\)|y)$/); if (!m) return false;
        const hh = -(Number(m[1]) || 0), four = m[2] === '' ? 1 : m[2] === '-' ? -1 : Number(m[2]), kk = -(Number(m[3]) || 0);
        return [-3, -1, 0, 2, 5].every(dx => eqd(hh + dx, kk + dx * dx / four, P.h, P.fy, P.dy));
      }
      const pts = [1, 2, -3].map(dx => [P.h + dx, P.k + P.a * dx * dx]);
      if (P.kind === 'directrix') { const fyy = 2 * P.k - q.answer; return pts.every(([x, y]) => eqd(x, y, P.h, fyy, q.answer)); }
      const [fx, fyy] = nums(q.answer);
      return pts.every(([x, y]) => eqd(x, y, fx, fyy, 2 * P.k - fyy));
    },
  });


  /* ---------- Unit 11: Quadrilaterals and triangle centers ---------- */
  const QUAD_PROPS = ['Both pairs of opposite sides are parallel.', 'Both pairs of opposite sides are congruent.', 'All four sides are congruent.', 'All four angles are right angles.',
    'The diagonals bisect each other.', 'The diagonals are congruent.', 'The diagonals are perpendicular.', 'Each diagonal bisects two of the angles.',
    'Both pairs of opposite angles are congruent.', 'Consecutive angles are supplementary.'];
  /* which properties every shape of each kind has (1) or not (0), in the order of QUAD_PROPS */
  const QUAD_TABLE = { parallelogram: [1, 1, 0, 0, 1, 0, 0, 0, 1, 1], rectangle: [1, 1, 0, 1, 1, 1, 0, 0, 1, 1], rhombus: [1, 1, 1, 0, 1, 0, 1, 1, 1, 1], square: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], kite: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0] };
  /* two sample shapes of each kind, for verify() to measure */
  const QUAD_SAMPLES = { parallelogram: [[[0, 0], [6, 0], [8, 3], [2, 3]], [[0, 0], [5, 0], [6, 4], [1, 4]]], rectangle: [[[0, 0], [6, 0], [6, 3], [0, 3]], [[0, 0], [4, 2], [3, 4], [-1, 2]]],
    rhombus: [[[0, 0], [5, 0], [8, 4], [3, 4]], [[0, 0], [2, 1], [3, 3], [1, 2]]], square: [[[0, 0], [4, 0], [4, 4], [0, 4]], [[0, 0], [3, 1], [2, 4], [-1, 3]]],
    kite: [[[0, 0], [3, -2], [8, 0], [3, 2]], [[0, 0], [2, -2], [7, 0], [2, 2]]] };
  /** measure all ten properties of the quadrilateral with these vertices */
  function quadProps(P) {
    const q = quadInfo(P), s = [0, 1, 2, 3].map(i => vsub(P[(i + 1) % 4], P[i]));
    const ang = i => { const u = vsub(P[(i + 3) % 4], P[i]), w = vsub(P[(i + 1) % 4], P[i]); return Math.acos(vdot(u, w) / Math.hypot(...u) / Math.hypot(...w)) * 180 / Math.PI; };
    const between = (i, j) => { const u = vsub(P[j], P[i]), w = vsub(P[(i + 1) % 4], P[i]); return Math.acos(vdot(u, w) / Math.hypot(...u) / Math.hypot(...w)) * 180 / Math.PI; };
    const halves = i => close(between(i, (i + 2) % 4) * 2, ang(i));        // the diagonal from vertex i splits its angle in half
    const g = [0, 1, 2, 3].map(ang);
    return [q.para, vdot(s[0], s[0]) === vdot(s[2], s[2]) && vdot(s[1], s[1]) === vdot(s[3], s[3]), q.eqSides, q.right, q.bisect, q.eqDiag, q.perpDiag,
      [0, 1, 2, 3].every(halves), close(g[0], g[2]) && close(g[1], g[3]), [0, 1, 2, 3].every(i => close(g[i] + g[(i + 1) % 4], 180))];
  }
  /** vertices on a 0–10 grid with labels A, B, C, D */
  function gridQuad(P) {
    const S = 20, pad = 12, W = 10 * S + 2 * pad, px = x => pad + x * S, py = y => pad + (10 - y) * S;
    let g = '';
    for (let k = 0; k <= 10; k++) g += `<line class="light" x1="${px(k)}" y1="${py(0)}" x2="${px(k)}" y2="${py(10)}" stroke-width="1"/><line class="light" x1="${px(0)}" y1="${py(k)}" x2="${px(10)}" y2="${py(k)}" stroke-width="1"/>`;
    g += `<polygon class="fill" points="${P.map(([x, y]) => `${px(x)},${py(y)}`).join(' ')}"/>`;
    const cx = P.reduce((t, v) => t + v[0], 0) / 4, cy = P.reduce((t, v) => t + v[1], 0) / 4;
    P.forEach(([x, y], i) => { const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1; g += `<circle cx="${px(x)}" cy="${py(y)}" r="3" fill="currentColor"/><text x="${(px(x) + dx / d * 12).toFixed(1)}" y="${(py(y) - dy / d * 12 + 5).toFixed(1)}" text-anchor="middle" font-size="14">${'ABCD'[i]}</text>`; });
    return `<svg class="figure" viewBox="0 0 ${W} ${W}" width="${W}" height="${W}" role="img" aria-label="quadrilateral ABCD on a grid">${g}</svg>`;
  }
  const QUAD_NAMES = ['Square', 'Rectangle', 'Rhombus', 'Parallelogram'];
  const sideSlope = (nm, d) => d[0] === 0 ? `${nm} is vertical` : d[1] === 0 ? `${nm} is horizontal` : `${nm} has slope ${M.fracText(d[1], d[0])}`;

  A.skill({
    id: 'int2.quadrilateral-properties', title: 'Properties of parallelograms, rectangles and rhombuses',
    learn: p(`A <b>parallelogram</b> has both pairs of opposite sides parallel. Then its opposite sides are congruent, its opposite angles are congruent, consecutive angles add to 180°, and <b>its diagonals bisect each other</b>.`) +
      p(`A <b>rectangle</b> is a parallelogram with four right angles, and it adds one more fact: <b>its diagonals are congruent</b>. A <b>rhombus</b> is a parallelogram with four congruent sides, and it adds: <b>its diagonals are perpendicular</b> and each diagonal bisects two angles. A <b>square</b> is both a rectangle and a rhombus, so it has every property. On a grid, test sides with the distance formula and right angles with slopes (perpendicular slopes multiply to −1).`) +
      example('Example', `In parallelogram ABCD the diagonals meet at E, with AE = 3${X} + 1 and EC = 5${X} − 7. The diagonals bisect each other, so 3${X} + 1 = 5${X} − 7, giving ${X} = 4. Then AE = 13 and <b>AC = 26</b>.`),
    make(rng) {
      const kind = rng.pick(['which', 'extra', 'algebra', 'algebra', 'grid']);
      if (kind === 'which') {
        const shape = rng.pick(['parallelogram', 'rectangle', 'rhombus', 'kite']), row = QUAD_TABLE[shape];
        const yes = rng.pick(row.map((v, i) => v ? i : -1).filter(i => i >= 0)), no = rng.sample(row.map((v, i) => v ? -1 : i).filter(i => i >= 0), 3);
        const answer = QUAD_PROPS[yes];
        return { prompt: `Which statement is true for every ${shape}?`, type: 'choice', answer, choices: rng.shuffle([yes].concat(no).map(i => QUAD_PROPS[i])), params: { kind, shape, idx: [yes].concat(no) },
          hints: [shape === 'kite' ? 'A kite has two pairs of congruent adjacent sides; it is usually not a parallelogram at all.' : `A ${shape} is a parallelogram${shape === 'parallelogram' ? '' : shape === 'rectangle' ? ' with four right angles' : ' with four congruent sides'}, so it has every parallelogram property${shape === 'parallelogram' ? '' : ' and some extra ones'}.`,
            `The other ${no.length === 2 ? 'two' : 'three'} can fail: ${no.map(i => QUAD_PROPS[i].replace(/\.$/, '').toLowerCase()).join('; ')}.`, `<b>${answer}</b>`] };
      }
      if (kind === 'extra') {
        const [big0, small] = rng.pick([['parallelogram', 'rectangle'], ['parallelogram', 'rhombus'], ['rectangle', 'square'], ['rhombus', 'square']]);
        const tb = QUAD_TABLE[big0], ts = QUAD_TABLE[small], idx = tb.map((_, i) => i);
        const yes = rng.pick(idx.filter(i => ts[i] && !tb[i])), both = rng.sample(idx.filter(i => ts[i] && tb[i]), 2), none = rng.pick(idx.filter(i => !ts[i]).concat(idx.filter(i => ts[i] && tb[i] && !both.includes(i))));
        const answer = QUAD_PROPS[yes];
        return { prompt: `Which property does every ${small} have, but not every ${big0}?`, type: 'choice', answer, choices: rng.shuffle([yes].concat(both, [none]).map(i => QUAD_PROPS[i])), params: { kind, big0, small, idx: [yes].concat(both, [none]) },
          hints: [`Every ${small} is a ${big0}, so it has all the ${big0} properties. You want one it has <i>extra</i>.`, `${both.map((i, j) => (j ? QUAD_PROPS[i].charAt(0).toLowerCase() + QUAD_PROPS[i].slice(1) : QUAD_PROPS[i]).replace(/\.$/, '')).join(', and ')}: every ${big0} has ${both.length > 1 ? 'these' : 'this'} already.`, `The extra one is <b>${answer}</b>`] };
      }
      if (kind === 'grid') {
        const type = rng.int(0, 3);
        let u, v;
        if (type === 0) { const [a, b] = rng.pick([[3, 0], [4, 0], [2, 1], [3, 1], [3, 2], [1, 2]]); u = [a, b]; v = [-b, a]; }
        else if (type === 1) [u, v] = rng.pick([[[4, 0], [0, 2]], [[5, 0], [0, 3]], [[2, 1], [-2, 4]], [[1, 2], [-4, 2]], [[3, 1], [-2, 6]], [[2, 2], [-3, 3]], [[6, 0], [0, 3]], [[3, 0], [0, 5]]]);
        else if (type === 2) [u, v] = rng.pick([[[5, 0], [3, 4]], [[4, 3], [0, 5]], [[2, 1], [1, 2]], [[3, 1], [1, 3]], [[4, 1], [1, 4]], [[3, 4], [5, 0]]]);
        else [u, v] = rng.pick([[[4, 0], [1, 2]], [[5, 1], [2, 3]], [[4, 1], [1, 3]], [[3, 0], [2, 2]], [[5, 0], [2, 3]], [[4, -1], [1, 3]]]);
        if (rng.bool()) { u = [-u[0], u[1]]; v = [-v[0], v[1]]; }
        let P = [[0, 0], u, [u[0] + v[0], u[1] + v[1]], v];
        const mx = Math.min(...P.map(t => t[0])), my = Math.min(...P.map(t => t[1])), Mx = Math.max(...P.map(t => t[0])), My = Math.max(...P.map(t => t[1]));
        const ox = rng.int(0, Math.max(0, 10 - (Mx - mx))) - mx, oy = rng.int(0, Math.max(0, 10 - (My - my))) - my;
        P = P.map(([x, y]) => [x + ox, y + oy]);
        const d2 = (i, j) => (P[i][0] - P[j][0]) ** 2 + (P[i][1] - P[j][1]) ** 2, answer = QUAD_NAMES[type];
        const right = vdot(vsub(P[1], P[0]), vsub(P[3], P[0])) === 0;
        return { prompt: `ABCD has vertices A${M.pt(...P[0])}, B${M.pt(...P[1])}, C${M.pt(...P[2])} and D${M.pt(...P[3])}. It is a parallelogram. What is its most specific name?${gridQuad(P)}`, type: 'choice', answer, choices: QUAD_NAMES, keepOrder: true, params: { kind, P },
          hints: [`Compare two neighboring sides with the distance formula: AB² = ${N(d2(0, 1))} and AD² = ${N(d2(0, 3))}, so ${d2(0, 1) === d2(0, 3) ? 'neighboring sides match and all four sides are congruent' : 'neighboring sides differ: it is not a rhombus or a square'}.`,
            `Check the angle at A with slopes: ${sideSlope('AB', u)} and ${sideSlope('AD', v)}. ${right ? (u[0] === 0 || u[1] === 0 ? 'One is horizontal and the other vertical' : 'They multiply to −1') + ', so the sides are perpendicular and the angles are right angles.' : 'They are not perpendicular, so the angles are not right angles.'}`,
            `<b>${answer}</b>.`] };
      }
      const t = rng.pick(['bisect', 'rectDiag', 'perp', 'side', 'consec', 'rhAngle']);
      const x = rng.int(2, 9);
      if (t === 'bisect' || t === 'rectDiag') {
        const p1 = rng.int(1, 5), q1 = rng.int(Math.max(-4, 2 - p1 * x), 10), L = p1 * x + q1, target = t === 'bisect' ? L : 2 * L;
        let r1 = rng.int(1, 7); if (r1 === (t === 'bisect' ? p1 : 2 * p1)) r1 += 1;
        const s1 = target - r1 * x, ask = rng.bool() ? 'x' : 'len', e1 = M.poly([p1, q1]), e2 = M.poly([r1, s1]);
        const prompt = t === 'bisect' ? `In parallelogram ABCD the diagonals meet at E. AE = ${e1} and EC = ${e2}. ${ask === 'x' ? `Find ${X}.` : 'How long is diagonal AC?'}`
          : `In rectangle ABCD the diagonals meet at E. AE = ${e1} and BD = ${e2}. ${ask === 'x' ? `Find ${X}.` : 'How long is diagonal BD?'}`;
        const eqn = t === 'bisect' ? `${e1} = ${e2}` : `2(${e1}) = ${e2}`;
        return { prompt, type: 'number', answer: ask === 'x' ? x : 2 * L, params: { kind, t, ask, p1, q1, r1, s1 },
          hints: [t === 'bisect' ? 'The diagonals of a parallelogram bisect each other, so AE = EC.' : 'A rectangle\'s diagonals bisect each other, so AC = 2 · AE, and they are congruent, so AC = BD.', `Solve ${eqn}: ${X} = ${N(x)}.`,
            ask === 'x' ? `<b>${X} = ${N(x)}</b>.` : `${t === 'bisect' ? `AE = ${N(L)}, so AC = 2 × ${N(L)}` : `BD = ${N(r1)}(${N(x)})${s1 ? " " + M.signed(s1) : ""}`} = <b>${N(2 * L)}</b>.`] };
      }
      if (t === 'perp') {
        const p1 = rng.int(2, 9), xx = rng.int(Math.ceil(50 / p1), Math.floor(100 / p1)), q1 = 90 - p1 * xx;
        return { prompt: `In rhombus ABCD the diagonals meet at E, and m∠AEB = (${M.poly([p1, q1])})°. Find ${X}.`, type: 'number', answer: xx, params: { kind, t, p1, q1 },
          hints: ['The diagonals of a rhombus are perpendicular, so ∠AEB is a right angle.', `${M.poly([p1, q1])} = 90, so ${N(p1)}${X} = ${N(90 - q1)}.`, `${X} = ${N(90 - q1)} ÷ ${N(p1)} = <b>${N(xx)}</b>.`] };
      }
      if (t === 'side') {
        const tr = rng.pick(TRIPLES.slice(0, 3)), m = rng.int(1, 3), a = tr[0] * m, b = tr[1] * m;
        return { prompt: `The diagonals of a rhombus are ${N(2 * a)} cm and ${N(2 * b)} cm long. How long is each side?`, type: 'number', answer: tr[2] * m, unit: 'cm', params: { kind, t, d1: 2 * a, d2: 2 * b },
          hints: ['The diagonals of a rhombus bisect each other at right angles, cutting the rhombus into four right triangles.', `Each triangle has legs ${N(2 * a)} ÷ 2 = ${N(a)} and ${N(2 * b)} ÷ 2 = ${N(b)}; the side of the rhombus is the hypotenuse.`, `${sq(N(a))} + ${sq(N(b))} = ${N(a * a + b * b)}, and ${R(N(a * a + b * b))} = <b>${N(tr[2] * m)}</b> cm.`] };
      }
      if (t === 'consec') {
        const Aang = rng.int(11, 26) * 5, Bang = 180 - Aang, p1 = rng.int(1, 4), r1 = rng.int(1, 4), xx = rng.int(5, 20), q1 = Aang - p1 * xx, s1 = Bang - r1 * xx, ask = rng.bool() ? 'x' : 'A';
        return { prompt: `In parallelogram ABCD, m∠A = (${M.poly([p1, q1])})° and m∠B = (${M.poly([r1, s1])})°. ${ask === 'x' ? `Find ${X}.` : 'Find m∠A.'}`, type: 'number', answer: ask === 'x' ? xx : Aang, unit: ask === 'x' ? undefined : '°', params: { kind, t, ask, p1, q1, r1, s1 },
          hints: ['∠A and ∠B are consecutive angles of a parallelogram, so they are supplementary.', `(${M.poly([p1, q1])}) + (${M.poly([r1, s1])}) = 180, so ${M.poly([p1 + r1, q1 + s1])} = 180 and ${X} = ${N(xx)}.`,
            ask === 'x' ? `<b>${X} = ${N(xx)}</b>.` : `m∠A = ${N(p1)}(${N(xx)}) ${M.signed(q1)} = <b>${N(Aang)}°</b>.`] };
      }
      const th = rng.int(10, 35) * 4;
      return { prompt: `In rhombus ABCD, m∠ABC = ${N(th)}°. What is m∠ABD, the angle between side BA and diagonal BD?`, type: 'number', answer: th / 2, unit: '°', params: { kind, t, th },
        hints: ['Each diagonal of a rhombus bisects the angles at its ends.', `Diagonal BD cuts ∠ABC into two equal parts.`, `${N(th)}° ÷ 2 = <b>${N(th / 2)}°</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'which' || P.kind === 'extra') {                   // measure the sample shapes instead of trusting the table
        const idx = QUAD_PROPS.indexOf(q.answer); if (idx < 0) return false;
        const always = (shape, i) => QUAD_SAMPLES[shape].every(c => quadProps(c)[i]);
        if (P.kind === 'which') return always(P.shape, idx) && P.idx.slice(1).every(i => !always(P.shape, i));
        return always(P.small, idx) && !always(P.big0, idx) && P.idx.slice(1).every(i => !always(P.small, i) || always(P.big0, i));
      }
      if (P.kind === 'grid') { const g = quadInfo(P.P); return g.para && q.answer === (g.square ? 'Square' : g.right ? 'Rectangle' : g.eqSides ? 'Rhombus' : 'Parallelogram'); }
      const solve = f => { for (let x = -100; x <= 200; x += 0.5) if (Math.abs(f(x)) < 1e-9) return x; return NaN; };
      if (P.t === 'bisect' || P.t === 'rectDiag') {
        const x = solve(x => (P.t === 'bisect' ? 1 : 2) * (P.p1 * x + P.q1) - (P.r1 * x + P.s1));
        return q.answer === (P.ask === 'x' ? x : 2 * (P.p1 * x + P.q1)) && P.p1 * x + P.q1 > 0;
      }
      if (P.t === 'perp') return P.p1 * q.answer + P.q1 === 90;
      if (P.t === 'side') return close(q.answer, Math.hypot(P.d1, P.d2) / 2);
      if (P.t === 'consec') { const x = solve(x => P.p1 * x + P.q1 + P.r1 * x + P.s1 - 180); return q.answer === (P.ask === 'x' ? x : P.p1 * x + P.q1); }
      const t = toRad(P.th), D = [1 + Math.cos(t), Math.sin(t)];        // B at the origin, A = (1, 0), C at angle th, D = A + C
      return close(Math.atan2(D[1], D[0]) * 180 / Math.PI, q.answer);
    },
  });

  const CENTERS = ['Centroid', 'Circumcenter', 'Incenter', 'Orthocenter'];
  const CENTER_DESC = [
    ['the meeting point of the three medians', 0], ['the balance point of a triangle cut from cardboard', 0], ['the point that splits each median in the ratio 2 : 1', 0],
    ['the meeting point of the perpendicular bisectors of the sides', 1], ['the point the same distance from all three vertices', 1], ['the center of the circle through all three vertices', 1],
    ['the meeting point of the three angle bisectors', 2], ['the point the same distance from all three sides', 2], ['the center of the largest circle that fits inside the triangle', 2],
    ['the meeting point of the three altitudes', 3]];
  const CENTER_STORY = [
    ['Three villages form a triangle. A cell tower must be the same distance from all three villages.', 1], ['A triangular park is bounded by three straight roads. A fountain must be the same distance from all three roads.', 2],
    ['A triangular sign should balance on a single post placed underneath it.', 0], ['The largest possible round table top is to be cut from a triangular board.', 2], ['A circular path must pass through three trees that form a triangle.', 1]];
  const CENTER_WHY = ['The centroid is where the medians meet; it is the balance point and splits each median 2 : 1.', 'The circumcenter is where the perpendicular bisectors meet; every point on a perpendicular bisector is the same distance from two vertices, so it is the same distance from all three.',
    'The incenter is where the angle bisectors meet; every point on an angle bisector is the same distance from two sides, so it is the same distance from all three.', 'The orthocenter is where the altitudes meet.'];

  A.skill({
    id: 'int2.triangle-centers', title: 'Triangle centers',
    learn: p(`Every triangle has several centers, each where three special lines meet. The <b>centroid</b> is where the three <b>medians</b> meet (a median joins a vertex to the midpoint of the opposite side). It is the balance point, and it <b>divides each median 2 : 1</b>: the part from the vertex is twice the part to the midpoint. Its coordinates are the averages of the vertices' coordinates.`) +
      p(`The <b>circumcenter</b> is where the <b>perpendicular bisectors</b> of the sides meet; it is the <b>same distance from all three vertices</b>, so it is the center of the circle through them. The <b>incenter</b> is where the <b>angle bisectors</b> meet; it is the <b>same distance from all three sides</b>, so it is the center of the largest circle that fits inside. (The orthocenter, where the altitudes meet, completes the set.)`) +
      example('Example', `G is the centroid of △ABC and AM is a median with AM = 18. AG is two thirds of the median and GM one third: <b>AG = 12</b> and GM = 6.`),
    make(rng) {
      const kind = rng.pick(['which', 'story', 'ratio', 'ratio', 'coords', 'angle', 'equal', 'right']);
      if (kind === 'which' || kind === 'story') {
        const [desc, ci] = rng.pick(kind === 'which' ? CENTER_DESC : CENTER_STORY), answer = CENTERS[ci];
        return { prompt: kind === 'which' ? `Which triangle center is ${desc}?` : `${desc} Which triangle center gives the right spot?`, type: 'choice', answer, choices: CENTERS, keepOrder: true, params: { kind, desc },
          hints: [kind === 'story' ? `Decide what must be equal or balanced: ${ci === 1 ? 'distances to three points (the vertices)' : ci === 2 ? 'distances to three lines (the sides)' : 'the weight on every side'}.` : 'Match the description to the lines that meet there: medians, perpendicular bisectors, angle bisectors or altitudes.', CENTER_WHY[ci], `<b>${answer}</b>.`] };
      }
      if (kind === 'ratio') {
        const g = rng.int(2, 15), vals = { AG: 2 * g, GM: g, AM: 3 * g }, [giv, ask] = rng.sample(['AG', 'GM', 'AM'], 2);
        return { prompt: `G is the centroid of △ABC, and AM is the median from A. ${giv} = ${N(vals[giv])}. What is ${ask}?`, type: 'number', answer: vals[ask], params: { kind, giv, ask, v: vals[giv] },
          hints: ['The centroid divides each median 2 : 1, so AG is twice GM, and the whole median AM is three times GM.', `${giv} = ${N(vals[giv])} gives GM = ${N(g)}${giv === 'GM' ? '' : giv === 'AG' ? ` (half of ${N(2 * g)})` : ` (a third of ${N(3 * g)})`}.`, `${ask} = <b>${N(vals[ask])}</b>.`] };
      }
      if (kind === 'coords') {
        let P;
        do { P = [0, 1, 2].map(() => [rng.int(-8, 8), rng.int(-8, 8)]); } while ((P[0][0] + P[1][0] + P[2][0]) % 3 || (P[0][1] + P[1][1] + P[2][1]) % 3 || vcross(vsub(P[1], P[0]), vsub(P[2], P[0])) === 0);
        const sx = P[0][0] + P[1][0] + P[2][0], sy = P[0][1] + P[1][1] + P[2][1], answer = M.pt(sx / 3, sy / 3);
        const mAB = [(P[0][0] + P[1][0]) / 2, (P[0][1] + P[1][1]) / 2];
        const ch = [answer].concat(distinct(answer, [M.pt(sx, sy), M.pt(sx / 2, sy / 2), M.pt(...mAB), M.pt(sy / 3, sx / 3), M.pt(-sx / 3, -sy / 3)], 3));
        return { prompt: `A triangle has vertices ${M.list(P.map(t => M.pt(...t)))}. Where is its centroid?`, type: 'choice', answer, choices: rng.shuffle(ch), params: { kind, P, opts: ch },
          hints: ['The centroid\'s coordinates are the averages of the three vertices\' coordinates.', `${X}: (${P.map((t, i) => i ? wrap(t[0]) : N(t[0])).join(' + ')}) ÷ 3 = ${N(sx)} ÷ 3 = ${N(sx / 3)}. ${Y}: (${P.map((t, i) => i ? wrap(t[1]) : N(t[1])).join(' + ')}) ÷ 3 = ${N(sy)} ÷ 3 = ${N(sy / 3)}.`, `<b>${answer}</b>.`] };
      }
      if (kind === 'angle') {
        const th = rng.int(15, 60) * 2;
        return { prompt: `I is the incenter of △ABC, and m∠ABC = ${N(th)}°. What is m∠IBC?`, type: 'number', answer: th / 2, unit: '°', params: { kind, th },
          hints: ['The incenter is where the angle bisectors meet, so BI bisects ∠ABC.', `So ∠IBC is half of ∠ABC.`, `${N(th)}° ÷ 2 = <b>${N(th / 2)}°</b>.`] };
      }
      if (kind === 'equal') {
        const inc = rng.bool(), x = rng.int(2, 9), p1 = rng.int(1, 4), r1 = p1 + rng.int(1, 3), q1 = rng.int(1, 12), L = p1 * x + q1, s1 = L - r1 * x;
        const prompt = inc ? `I is the incenter of △ABC. The distance from I to side AB is ${M.poly([p1, q1])}, and the distance from I to side BC is ${M.poly([r1, s1])}. Find ${X}.`
          : `O is the circumcenter of △ABC, with OA = ${M.poly([p1, q1])} and OB = ${M.poly([r1, s1])}. Find ${X}.`;
        return { prompt, type: 'number', answer: x, params: { kind, p1, q1, r1, s1 },
          hints: [inc ? 'The incenter is the same distance from all three sides.' : 'The circumcenter is the same distance from all three vertices.', `So ${M.poly([p1, q1])} = ${M.poly([r1, s1])}, which gives ${M.term(r1 - p1, 'x')} = ${N(q1 - s1)}.`, `<b>${X} = ${N(x)}</b>.`] };
      }
      const tr = rng.pick(TRIPLES.slice(0, 4)), m = rng.pick([1, 2]), [a, b, c] = tr.map(v => v * m);
      return { prompt: `A right triangle has legs ${N(a)} and ${N(b)}. How far is its circumcenter from each vertex?`, type: 'number', answer: c / 2, params: { kind, a, b },
        hints: [`The circumcenter of a right triangle is the midpoint of the hypotenuse (an angle inscribed in a semicircle is a right angle).`, `The hypotenuse is ${R(`${sq(N(a))} + ${sq(N(b))}`)} = ${N(c)}.`, `The circumradius is half of it: <b>${N(c / 2)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'which' || P.kind === 'story') {
        const d = P.desc;                                               // read the key words instead of the table
        const want = /median|balance/.test(d) ? 0 : /perpendicular bisector|vertices|villages|trees/.test(d) ? 1 : /angle bisector|sides|roads|inside|table top/.test(d) ? 2 : /altitude/.test(d) ? 3 : -1;
        return q.answer === CENTERS[want];
      }
      if (P.kind === 'ratio') {                                         // a triangle with its median along the x-axis: A(0, 0), M(len, 0)
        const am = P.giv === 'AM' ? P.v : P.giv === 'AG' ? P.v * 1.5 : P.v * 3, Mx = am, B = [Mx + 2, 3], C = [Mx - 2, -3], Gx = (0 + B[0] + C[0]) / 3;
        return close(q.answer, { AG: Gx, GM: Mx - Gx, AM: Mx }[P.ask]);
      }
      if (P.kind === 'coords') {                                        // intersect two medians
        const [A0, B0, C0] = P.P, mBC = [(B0[0] + C0[0]) / 2, (B0[1] + C0[1]) / 2], mAC = [(A0[0] + C0[0]) / 2, (A0[1] + C0[1]) / 2];
        const d1 = vsub(mBC, A0), d2 = vsub(mAC, B0), t = vcross(vsub(B0, A0), d2) / vcross(d1, d2), G = [A0[0] + t * d1[0], A0[1] + t * d1[1]];
        return q.answer === M.pt(M.round(G[0], 9), M.round(G[1], 9));
      }
      if (P.kind === 'angle') {                                         // build the triangle, find the incenter by the weighted average, measure ∠IBC
        const t = toRad(P.th), B0 = [0, 0], C0 = [6, 0], A0 = [4 * Math.cos(t), 4 * Math.sin(t)];
        const a = Math.hypot(...vsub(B0, C0)), b = Math.hypot(...vsub(A0, C0)), c = Math.hypot(...vsub(A0, B0));
        const I = [(a * A0[0] + b * B0[0] + c * C0[0]) / (a + b + c), (a * A0[1] + b * B0[1] + c * C0[1]) / (a + b + c)];
        return close(Math.atan2(I[1], I[0]) * 180 / Math.PI, q.answer);
      }
      if (P.kind === 'equal') return P.p1 * q.answer + P.q1 === P.r1 * q.answer + P.s1;
      const O = [P.a / 2, P.b / 2];                                     // right angle at the origin: the circumcenter is equidistant from (0,0), (a,0), (0,b)
      return close(Math.hypot(...O), q.answer) && close(Math.hypot(O[0] - P.a, O[1]), q.answer) && close(Math.hypot(O[0], O[1] - P.b), q.answer);
    },
  });


  /* ---------- Unit 12: Area, volume and geometric probability ---------- */
  const POLY_NAMES = { 5: 'pentagon', 6: 'hexagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: 'dodecagon' };
  /** shoelace area of a regular n-gon with circumradius R, built from its vertices */
  function ngonArea(n, R) {
    const v = Array.from({ length: n }, (_, k) => [R * Math.cos(2 * Math.PI * k / n), R * Math.sin(2 * Math.PI * k / n)]);
    return Math.abs(v.reduce((t, p1, k) => t + vcross(p1, v[(k + 1) % n]), 0)) / 2;
  }
  /** a regular n-gon with a horizontal bottom side, its apothem (dashed) and one radius; labels for the side, apothem and radius */
  function ngonFig(n, lab) {
    const cx = 120, cy = 100, Rd = 82, h = Math.PI / n;
    const pt = k => { const t = -Math.PI / 2 - h + 2 * Math.PI * k / n; return [cx + Rd * Math.cos(t), cy - Rd * Math.sin(t)]; };
    const pts = Array.from({ length: n }, (_, k) => pt(k)), [x1, y1] = pt(1), my = cy + Rd * Math.cos(h), f = v => v.toFixed(1);
    let g = `<polygon class="fill" points="${pts.map(([x, y]) => `${f(x)},${f(y)}`).join(' ')}"/><circle cx="${cx}" cy="${cy}" r="2.5" fill="currentColor"/>`;
    g += `<line class="stroke" x1="${cx}" y1="${cy}" x2="${cx}" y2="${f(my)}" stroke-dasharray="5 3"/><path class="stroke" d="M${cx + 9},${f(my)} V${f(my - 9)} H${cx}" stroke-width="1.5"/>`;
    if (lab.radius) g += `<line class="stroke" x1="${cx}" y1="${cy}" x2="${f(x1)}" y2="${f(y1)}"/><text x="${f((cx + x1) / 2 + 8)}" y="${f((cy + y1) / 2 - 2)}" font-size="13">${lab.radius}</text>`;
    if (lab.apothem) g += `<text x="${cx - 6}" y="${f((cy + my) / 2 + 4)}" font-size="13" text-anchor="end">${lab.apothem}</text>`;
    if (lab.side) g += `<text x="${cx}" y="${f(my + 17)}" font-size="13" text-anchor="middle">${lab.side}</text>`;
    return `<svg class="figure" viewBox="0 0 240 ${f(my + 24)}" width="240" height="${f(my + 24)}" role="img" aria-label="regular ${POLY_NAMES[n]}">${g}</svg>`;
  }

  A.skill({
    id: 'int2.regular-polygon-area', title: 'Area of regular polygons',
    learn: p(`A regular polygon with ${V('n')} sides splits into ${V('n')} congruent isosceles triangles that meet at its center. The <b>apothem</b> is the distance from the center straight to the middle of a side; it is the height of each triangle. Adding up the triangles gives <b>area = ½ × apothem × perimeter</b>.`) +
      p(`If you are not given the apothem, find it with right-triangle trigonometry. The apothem cuts one of the triangles in half, making a right triangle with angle ${F('180°', V('n'))} at the center, the apothem as the adjacent side, half a side as the opposite side, and the <b>radius</b> (center to vertex) as the hypotenuse. So apothem = ${F('half side', `tan(180°/${V('n')})`)}, or apothem = radius × cos(180°/${V('n')}).`) +
      example('Example', `A regular hexagon has sides of 10 cm. The center angle of each half-triangle is 180° ÷ 6 = 30°, so the apothem is 5 ÷ tan 30° ≈ 8.660 cm. Perimeter = 60 cm, so area ≈ ½ × 8.660 × 60 ≈ <b>259.8 cm²</b>.`),
    make(rng) {
      const n = rng.pick([5, 6, 6, 8, 9, 10, 12]), name = POLY_NAMES[n], half = 180 / n, hr = toRad(half), kind = rng.pick(['given', 'side', 'side', 'radius', 'apothem']);
      const r3 = v => N(M.round(v, 3)), tol = v => Math.max(0.05, M.round(v * 0.003, 2));
      const split = `A regular ${name} splits into ${n} congruent triangles at its center. The apothem cuts each in half, leaving a right triangle with a ${N(M.round(half, 2))}° angle at the center.`;
      if (kind === 'given') {
        const s = rng.int(3, 20), a = M.round(s / (2 * Math.tan(hr)), 1), P = n * s, ans = M.round(a * P / 2, 2);
        return { prompt: `A regular ${name} has sides of ${N(s)} cm and an apothem of ${N(a)} cm. What is its area?${ngonFig(n, { side: `${N(s)} cm`, apothem: `${N(a)} cm` })}`, type: 'number', answer: ans, unit: 'cm²', tolerance: 0.05, params: { kind, n, s, a },
          hints: ['Area of a regular polygon = ½ × apothem × perimeter.', `The perimeter is ${N(n)} × ${N(s)} = ${N(P)} cm.`, `½ × ${N(a)} × ${N(P)} = <b>${N(ans)}</b> cm².`] };
      }
      if (kind === 'side') {
        const s = rng.int(2, 20), a = s / 2 / Math.tan(hr), ans = M.round(n * s * a / 2, 1);
        return { prompt: `A regular ${name} has sides of ${N(s)} cm. Find its area, to the nearest tenth.${ngonFig(n, { side: `${N(s)} cm`, apothem: V('a') })}`, type: 'number', answer: ans, unit: 'cm²', tolerance: tol(ans), params: { kind, n, s },
          hints: [split, `Half a side, ${N(s / 2)}, is opposite that angle and the apothem is adjacent: apothem = ${N(s / 2)} ÷ tan ${N(M.round(half, 2))}° ≈ ${r3(a)} cm.`,
            `Perimeter = ${N(n)} × ${N(s)} = ${N(n * s)} cm, so area ≈ ½ × ${r3(a)} × ${N(n * s)} ≈ <b>${N(ans)}</b> cm².`] };
      }
      if (kind === 'radius') {
        const Rr = rng.int(2, 15), a = Rr * Math.cos(hr), hs = Rr * Math.sin(hr), ans = M.round(n * hs * a, 1);
        return { prompt: `A regular ${name} has a radius (center to vertex) of ${N(Rr)} cm. Find its area, to the nearest tenth.${ngonFig(n, { radius: `${N(Rr)} cm`, apothem: V('a') })}`, type: 'number', answer: ans, unit: 'cm²', tolerance: tol(ans), params: { kind, n, Rr },
          hints: [split + ` The radius, ${N(Rr)}, is its hypotenuse.`, `Apothem = ${N(Rr)} cos ${N(M.round(half, 2))}° ≈ ${r3(a)} cm, and half a side = ${N(Rr)} sin ${N(M.round(half, 2))}° ≈ ${r3(hs)} cm, so a side ≈ ${r3(2 * hs)} cm.`,
            `Perimeter ≈ ${N(n)} × ${r3(2 * hs)} ≈ ${r3(2 * n * hs)} cm, so area ≈ ½ × ${r3(a)} × ${r3(2 * n * hs)} ≈ <b>${N(ans)}</b> cm².`] };
      }
      const a = rng.int(2, 15), hs = a * Math.tan(hr), ans = M.round(n * a * hs, 1);
      return { prompt: `A regular ${name} has an apothem of ${N(a)} cm. Find its area, to the nearest tenth.${ngonFig(n, { apothem: `${N(a)} cm` })}`, type: 'number', answer: ans, unit: 'cm²', tolerance: tol(ans), params: { kind, n, a },
        hints: [split, `The apothem, ${N(a)}, is adjacent to that angle and half a side is opposite: half a side = ${N(a)} × tan ${N(M.round(half, 2))}° ≈ ${r3(hs)} cm, so a side ≈ ${r3(2 * hs)} cm.`,
          `Perimeter ≈ ${N(n)} × ${r3(2 * hs)} ≈ ${r3(2 * n * hs)} cm, so area ≈ ½ × ${N(a)} × ${r3(2 * n * hs)} ≈ <b>${N(ans)}</b> cm².`] };
    },
    verify(q) {
      const P = q.params, h = Math.PI / P.n;
      if (P.kind === 'given') { let t = 0; for (let k = 0; k < P.n; k++) t += P.s * P.a / 2; return Math.abs(t - q.answer) < 0.006; }   // n triangles of base s, height a
      const Rr = P.kind === 'side' ? P.s / (2 * Math.sin(h)) : P.kind === 'radius' ? P.Rr : P.a / Math.cos(h);     // the circumradius, then the shoelace formula
      return Math.abs(ngonArea(P.n, Rr) - q.answer) <= 0.05 + 1e-9;
    },
  });

  const SOLIDS = [['cylinders', 'heights'], ['cones', 'radii'], ['rectangular prisms', 'lengths'], ['square pyramids', 'heights'], ['spheres', 'radii'], ['cubes', 'edges']];
  const KPAIRS = [[1, 2], [2, 3], [3, 4], [2, 5], [3, 5], [1, 3], [4, 5], [3, 2], [2, 1], [5, 3], [4, 3], [5, 2]];
  /** surface area and volume of a box with sides proportional to 2 : 3 : 5, scaled to the length L */
  const boxSV = L => { const [a, b, c] = [2 * L, 3 * L, 5 * L]; return [2 * (a * b + b * c + a * c), a * b * c]; };

  A.skill({
    id: 'int2.similar-solids', title: 'Similar solids',
    learn: p(`Two solids are <b>similar</b> when every length of one is the same multiple ${V('k')} of the matching length of the other. That one <b>scale factor</b> ${V('k')} controls everything: <b>lengths multiply by ${V('k')}</b>, <b>areas (including surface area) by ${sq(V('k'))}</b>, and <b>volumes by ${S(V('k'), 3)}</b>. An area has two dimensions that each grow by ${V('k')}, and a volume has three.`) +
      p(`Work in the order length → area → volume. If you know a ratio of volumes, take the cube root to get ${V('k')}; from a ratio of areas, take the square root.`) +
      example('Example', `Two similar cones have heights 4 cm and 10 cm, so ${V('k')} = ${F(10, 4)} = ${F(5, 2)}. If the small cone holds 16 cm³, the large one holds 16 × ${S(`(${F(5, 2)})`, 3)} = 16 × ${F(125, 8)} = <b>250 cm³</b>.`),
    make(rng) {
      const [sol, lens] = rng.pick(SOLIDS), [pp, qq] = rng.pick(KPAIRS), kind = rng.pick(['area', 'volume', 'volume', 'fromVolume', 'ratio']);
      const m = rng.int(1, 4), L1 = qq * m, L2 = pp * m, kTxt = F(pp, qq), name = rng.pick(NAMES);
      if (kind === 'ratio') {
        const what = rng.pick(['surface areas', 'volumes']), choices = [`${pp} : ${qq}`, `${pp * pp} : ${qq * qq}`, `${pp ** 3} : ${qq ** 3}`], answer = choices[what === 'volumes' ? 2 : 1];
        return { prompt: `The ${lens} of two similar ${sol} are in the ratio ${pp} : ${qq}. What is the ratio of their ${what}?`, type: 'choice', answer, choices, keepOrder: true, params: { kind, pp, qq, what },
          hints: [`Lengths compare by the scale factor, ${pp} : ${qq}.`, what === 'volumes' ? 'Volumes have three dimensions, so cube both numbers.' : 'Areas have two dimensions, so square both numbers.', `<b>${answer}</b>.`] };
      }
      if (kind === 'area') {
        const w = rng.int(2, 15), S1 = qq * qq * w, S2 = pp * pp * w;
        return { prompt: `Two similar ${sol} have ${lens} of ${N(L1)} cm and ${N(L2)} cm. The first has a surface area of ${N(S1)} cm². What is the surface area of the second?`, type: 'number', answer: S2, unit: 'cm²', params: { kind, L1, L2, given: S1, pow: 2 },
          hints: [`The scale factor from the first to the second is ${N(L2)} ÷ ${N(L1)} = ${kTxt}.`, `Areas scale by ${sq(V('k'))} = ${F(pp * pp, qq * qq)}.`, `${N(S1)} × ${F(pp * pp, qq * qq)} = <b>${N(S2)}</b> cm².`] };
      }
      if (kind === 'volume') {
        const w = rng.int(1, 8), V1 = qq ** 3 * w, V2 = pp ** 3 * w;
        return { prompt: `Two similar ${sol} have ${lens} of ${N(L1)} cm and ${N(L2)} cm. The first has a volume of ${N(V1)} cm³. What is the volume of the second?`, type: 'number', answer: V2, unit: 'cm³', params: { kind, L1, L2, given: V1, pow: 3 },
          hints: [`The scale factor from the first to the second is ${N(L2)} ÷ ${N(L1)} = ${kTxt}.`, `Volumes scale by ${S(V('k'), 3)} = ${F(pp ** 3, qq ** 3)}.`, `${N(V1)} × ${F(pp ** 3, qq ** 3)} = <b>${N(V2)}</b> cm³.`] };
      }
      const w = rng.int(1, 6), V1 = qq ** 3 * w, V2 = pp ** 3 * w;
      return { prompt: `${name} has two similar ${sol} with volumes ${N(V1)} cm³ and ${N(V2)} cm³. The first has a ${{ heights: 'height', radii: 'radius', lengths: 'length', edges: 'edge' }[lens]} of ${N(L1)} cm. What is the matching length of the second?`, type: 'number', answer: L2, unit: 'cm', params: { kind, V1, V2, L1 },
        hints: [`The volume ratio is ${N(V2)} ÷ ${N(V1)} = ${F(V2, V1)} = ${F(pp ** 3, qq ** 3)}.`, `Volumes scale by ${S(V('k'), 3)}, so take the cube root: ${V('k')} = ${kTxt}.`, `${N(L1)} × ${kTxt} = <b>${N(L2)}</b> cm.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'ratio') { const [s1, v1] = boxSV(P.qq), [s2, v2] = boxSV(P.pp), r = P.what === 'volumes' ? v2 / v1 : s2 / s1; const [a, b] = q.answer.split(' : ').map(Number); return close(a / b, r); }
      if (P.kind === 'fromVolume') return close(q.answer, P.L1 * Math.cbrt(P.V2 / P.V1));
      const [s1, v1] = boxSV(P.L1), [s2, v2] = boxSV(P.L2);                   // measure two real boxes with those lengths
      return close(q.answer, P.given * (P.pow === 2 ? s2 / s1 : v2 / v1));
    },
  });

  /** figures for the probability skill: a target of rings, a spinner sector, a circle in a square, a rectangle in a rectangle */
  function probFig(kind, d) {
    const W = 200;
    let g = '';
    if (kind === 'target') { const sc = 88 / d.R; [d.R, d.r2, d.r1].forEach((r, i) => { if (r) g += `<circle cx="100" cy="100" r="${(r * sc).toFixed(1)}" ${i === (d.ring ? 1 : 2) ? 'class="fill"' : 'class="stroke"'}/>`; }); if (d.ring) g += `<circle cx="100" cy="100" r="${(d.r1 * sc).toFixed(1)}" fill="var(--surface)" class="stroke"/>`; }
    if (kind === 'sector') { const t = toRad(d.deg), x = 100 + 88 * Math.cos(t), y = 100 - 88 * Math.sin(t); g += `<circle class="stroke" cx="100" cy="100" r="88"/><path class="fill" d="M100,100 L188,100 A88,88 0 ${d.deg > 180 ? 1 : 0} 0 ${x.toFixed(1)},${y.toFixed(1)} Z"/><text x="${(100 + 30 * Math.cos(t / 2)).toFixed(1)}" y="${(104 - 30 * Math.sin(t / 2)).toFixed(1)}" font-size="13" text-anchor="middle">${d.deg}°</text>`; }
    if (kind === 'square') { const sc = 176 / d.s; g += `<rect class="stroke" x="12" y="12" width="176" height="176"/><circle class="fill" cx="100" cy="100" r="${(d.r * sc).toFixed(1)}"/>`; }
    if (kind === 'rect') { const sc = 176 / Math.max(d.W, d.H), w = d.W * sc, h = d.H * sc; g += `<rect class="stroke" x="12" y="12" width="${w.toFixed(1)}" height="${h.toFixed(1)}"/><rect class="fill" x="${(12 + w * 0.15).toFixed(1)}" y="${(12 + h * 0.2).toFixed(1)}" width="${(d.w * sc).toFixed(1)}" height="${(d.h * sc).toFixed(1)}"/>`; return `<svg class="figure" viewBox="0 0 ${(w + 24).toFixed(1)} ${(h + 24).toFixed(1)}" width="${(w + 24).toFixed(1)}" height="${(h + 24).toFixed(1)}" role="img" aria-label="a shaded rectangle inside a larger rectangle">${g}</svg>`; }
    return `<svg class="figure" viewBox="0 0 ${W} ${W}" width="${W}" height="${W}" role="img" aria-label="a target with a shaded region">${g}</svg>`;
  }

  A.skill({
    id: 'int2.geometric-probability', title: 'Geometric probability',
    learn: p(`When a point is chosen at random from a region, every part of the region is equally likely. So the probability of landing in a smaller part is a ratio of sizes: <b>P = ${F('length of the part', 'whole length')}</b> on a segment or a timeline, and <b>P = ${F('area of the part', 'whole area')}</b> on a board or a target.`) +
      p(`Use whatever formula the shapes need: rectangles (length × width), circles (π${sq(V('r'))}), sectors (${F(V('θ'), 360)} of the circle). Often π cancels. A dart landing in a sector of a round board has probability ${F(V('θ'), 360)}, and a bullseye of radius 2 on a target of radius 6 has probability ${F(`π · ${sq(2)}`, `π · ${sq(6)}`)} = ${F(4, 36)} = ${F(1, 9)}.`) +
      example('Example', `A bus comes every 12 minutes, and you arrive at a random time. You wait less than 3 minutes if you arrive in the last 3 minutes of the gap: P = ${F(3, 12)} = <b>${F(1, 4)}</b>.`),
    make(rng) {
      const kind = rng.pick(['segment', 'wait', 'target', 'target', 'sector', 'square', 'rect']), name = rng.pick(NAMES);
      const piTxt = k => k === 1 ? 'π' : `${N(k)}π`;
      const frac = (num, den, params, prompt, hints, fig) => { const [a, b] = M.simp(num, den); return { prompt: prompt + ' Give a fraction.' + (fig || ''), type: 'number', answer: a / b, answerText: M.fracText(a, b), params, hints: hints.concat(`P = ${F(num, den, { raw: true })} = <b>${M.fracText(a, b)}</b>.`) }; };
      if (kind === 'segment') {
        const L = rng.pick([10, 12, 15, 16, 20, 24, 30]), c = rng.int(0, L - 3), d = rng.int(c + 1, Math.min(L, c + Math.ceil(L * 0.7)));
        return frac(d - c, L, { kind, L, c, d }, `A point is chosen at random on a number line from 0 to ${N(L)}. What is the probability that it lies between ${N(c)} and ${N(d)}?`,
          [`The whole segment has length ${N(L)}; the part from ${N(c)} to ${N(d)} has length ${N(d)} − ${N(c)} = ${N(d - c)}.`]);
      }
      if (kind === 'wait') {
        const T = rng.pick([10, 12, 15, 20, 30]), w = rng.int(1, T - 1), less = rng.bool();
        return frac(less ? w : T - w, T, { kind, T, w, less }, `A train leaves every ${N(T)} minutes, and ${name} reaches the platform at a random time. What is the probability that ${name} waits ${less ? 'less' : 'more'} than ${N(w)} minutes?`,
          [`Every moment of the ${N(T)}-minute gap is equally likely, so compare lengths of time.`, `${name} waits ${less ? 'less' : 'more'} than ${N(w)} minutes when arriving ${less ? `in the last ${N(w)} minutes` : `in the first ${N(T - w)} minutes`} of the gap: ${N(less ? w : T - w)} minutes out of ${N(T)}.`]);
      }
      if (kind === 'target') {
        const r1 = rng.int(1, 4), r2 = r1 + rng.int(1, 3), R = r2 + rng.int(1, 4), ring = rng.bool();
        const num = ring ? r2 * r2 - r1 * r1 : r1 * r1;
        return frac(num, R * R, { kind, r1, r2, R, ring }, `A round target has radius ${N(R)} cm. Inside it are circles of radius ${N(r2)} cm and ${N(r1)} cm with the same center. A dart lands at a random point on the target. What is the probability that it lands ${ring ? `in the ring between the ${N(r1)} cm and ${N(r2)} cm circles` : `inside the ${N(r1)} cm circle`}?`,
          [`Compare areas. The whole target is π · ${sq(N(R))} = ${N(R * R)}π cm².`, ring ? `The ring is the ${N(r2)} cm circle minus the ${N(r1)} cm circle: ${piTxt(r2 * r2)} − ${piTxt(r1 * r1)} = ${piTxt(num)} cm². The π cancels.` : `The small circle is π · ${sq(N(r1))} = ${piTxt(r1 * r1)} cm². The π cancels.`], probFig('target', { R, r1, r2, ring }));
      }
      if (kind === 'sector') {
        const deg = rng.pick([30, 40, 45, 60, 72, 80, 90, 100, 120, 135, 150, 200, 210, 240, 270]);
        return frac(deg, 360, { kind, deg }, `A spinner is a circle with a shaded sector whose central angle is ${N(deg)}°. The arrow stops at a random angle. What is the probability that it stops in the shaded sector?`,
          [`The sector is ${F(deg, 360, { raw: true })} of the circle, whatever the radius: its area is ${F(deg, 360, { raw: true })} · π${sq(V('r'))}.`], probFig('sector', { deg }));
      }
      if (kind === 'square') {
        const s = rng.pick([4, 6, 8, 10, 12, 20]), r = rng.int(1, s / 2), ans = M.round(Math.PI * r * r / (s * s), 2);
        return { prompt: `A square board is ${N(s)} inches on each side, with a circle of radius ${N(r)} inches painted in the middle. A dart hits the board at a random point. What is the probability that it lands in the circle? Round to the nearest hundredth.${probFig('square', { s, r })}`, type: 'number', answer: ans, tolerance: 0.006, params: { kind, s, r },
          hints: [`Circle: π · ${sq(N(r))} ≈ ${N(M.round(Math.PI * r * r, 3))} in². Board: ${sq(N(s))} = ${N(s * s)} in².`, `P ≈ ${N(M.round(Math.PI * r * r, 3))} ÷ ${N(s * s)}.`, `P ≈ <b>${N(ans)}</b>.`] };
      }
      const Wd = rng.int(8, 14), Hd = rng.int(5, 9), w = rng.int(2, Math.floor(Wd * 0.6)), h = rng.int(2, Math.floor(Hd * 0.6));
      return frac(w * h, Wd * Hd, { kind, Wd, Hd, w, h }, `${[8, 11].includes(Wd) ? 'An' : 'A'} ${N(Wd)} m by ${N(Hd)} m field has a ${N(w)} m by ${N(h)} m sandpit in it. A ball dropped from a drone lands at a random point in the field. What is the probability that it lands in the sandpit?`,
        [`Sandpit: ${N(w)} × ${N(h)} = ${N(w * h)} m². Field: ${N(Wd)} × ${N(Hd)} = ${N(Wd * Hd)} m².`], probFig('rect', { W: Wd, H: Hd, w, h }));
    },
    verify(q) {
      const P = q.params, N0 = 250;
      const share = (inner, outer, x0, x1, y0, y1) => {                 // count points of a fine grid: in the part / in the whole
        let a = 0, b = 0;
        for (let i = 0; i < N0; i++) for (let j = 0; j < N0; j++) { const x = x0 + (x1 - x0) * (i + 0.5) / N0, y = y0 + (y1 - y0) * (j + 0.5) / N0; if (outer(x, y)) { b++; if (inner(x, y)) a++; } }
        return a / b;
      };
      let est;
      if (P.kind === 'segment' || P.kind === 'wait') {
        const L = P.kind === 'segment' ? P.L : P.T, inside = P.kind === 'segment' ? x => x > P.c && x < P.d : x => (P.less ? L - x < P.w : L - x > P.w);   // wait = time until the next train
        let a = 0; for (let i = 0; i < 100000; i++) if (inside(L * (i + 0.5) / 100000)) a++;
        est = a / 100000;
      } else if (P.kind === 'target') est = share((x, y) => { const d = Math.hypot(x, y); return P.ring ? d > P.r1 && d < P.r2 : d < P.r1; }, (x, y) => Math.hypot(x, y) < P.R, -P.R, P.R, -P.R, P.R);
      else if (P.kind === 'sector') est = share((x, y) => { const t = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360; return t < P.deg; }, (x, y) => Math.hypot(x, y) < 1, -1, 1, -1, 1);
      else if (P.kind === 'square') est = share((x, y) => Math.hypot(x, y) < P.r, () => true, -P.s / 2, P.s / 2, -P.s / 2, P.s / 2);
      else est = share((x, y) => x < P.w && y < P.h, () => true, 0, P.Wd, 0, P.Hd);
      return Math.abs(est - q.answer) < 0.012;
    },
  });


  /* ---------- Unit 13: Circles: chords, tangents and secants ---------- */
  const onC = deg => [Math.cos(toRad(deg)), Math.sin(toRad(deg))];
  const angAt = (V0, A0, B0) => { const u = vsub(A0, V0), w = vsub(B0, V0); return Math.acos(vdot(u, w) / Math.hypot(...u) / Math.hypot(...w)) * 180 / Math.PI; };
  /** where line p1p2 meets line p3p4 */
  function meet(p1, p2, p3, p4) { const d1 = vsub(p2, p1), d2 = vsub(p4, p3), t = vcross(vsub(p3, p1), d2) / vcross(d1, d2); return [p1[0] + t * d1[0], p1[1] + t * d1[1]]; }
  /** a circle of radius 1 at the origin O, drawn 70 px wide per unit, with named points, segments, highlighted arcs and labels */
  function circFig(o) {
    const rr = 70, pts = Object.assign({ O: [0, 0] }, o.pts), ext = o.arcs && o.arcs.length ? 1.45 : 1;
    const all = Object.values(pts).concat((o.notes || []).map(([x, y]) => [x + 1, y]), [[-ext, -ext], [ext, ext]]);
    const x0 = Math.min(...all.map(p => p[0])) * rr - 26, x1 = Math.max(...all.map(p => p[0])) * rr + 26, y0 = -Math.max(...all.map(p => p[1])) * rr - 26, y1 = -Math.min(...all.map(p => p[1])) * rr + 26;
    const X0 = p => +(p[0] * rr - x0).toFixed(1), Y0 = p => +(-p[1] * rr - y0).toFixed(1), at = k => pts[k];
    let g = `<circle class="stroke light" cx="${X0([0, 0])}" cy="${Y0([0, 0])}" r="${rr}"/>`;
    (o.arcs || []).forEach(([a, b, lab, lr]) => {
      const ta = Math.atan2(at(a)[1], at(a)[0]), tb = Math.atan2(at(b)[1], at(b)[0]), sweep = ((tb - ta) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI), tm = ta + sweep / 2;
      g += `<path class="stroke" style="stroke-width:5;opacity:.45" d="M${X0(at(a))},${Y0(at(a))} A${rr},${rr} 0 ${sweep > Math.PI ? 1 : 0} 0 ${X0(at(b))},${Y0(at(b))}"/>`;
      const lr0 = lr || 1.25;
      if (lab) g += `<text x="${X0([lr0 * Math.cos(tm), lr0 * Math.sin(tm)])}" y="${Y0([lr0 * Math.cos(tm), lr0 * Math.sin(tm)]) + 5}" text-anchor="middle" font-size="13">${lab}</text>`;
    });
    (o.segs || []).forEach(([a, b, dash]) => { g += `<line class="stroke" x1="${X0(at(a))}" y1="${Y0(at(a))}" x2="${X0(at(b))}" y2="${Y0(at(b))}"${dash ? ' stroke-dasharray="5 3"' : ''}/>`; });
    (o.right || []).forEach(([v, a, b]) => {
      const u = vsub(at(a), at(v)), w = vsub(at(b), at(v)), lu = Math.hypot(...u), lw = Math.hypot(...w), s = 9 / rr;
      const p1 = [at(v)[0] + u[0] / lu * s, at(v)[1] + u[1] / lu * s], p3 = [at(v)[0] + w[0] / lw * s, at(v)[1] + w[1] / lw * s], p2 = [p1[0] + w[0] / lw * s, p1[1] + w[1] / lw * s];
      g += `<path class="stroke" stroke-width="1.5" d="M${X0(p1)},${Y0(p1)} L${X0(p2)},${Y0(p2)} L${X0(p3)},${Y0(p3)}"/>`;
    });
    (o.segLabels || []).forEach(([a, b, lab, side]) => {
      const m = [(at(a)[0] + at(b)[0]) / 2, (at(a)[1] + at(b)[1]) / 2], d = vsub(at(b), at(a)), l = Math.hypot(...d), nx = -d[1] / l * (side || 1) * 0.17, ny = d[0] / l * (side || 1) * 0.17;
      g += `<text x="${X0([m[0] + nx, m[1] + ny])}" y="${Y0([m[0] + nx, m[1] + ny]) + 5}" text-anchor="middle" font-size="13">${lab}</text>`;
    });
    (o.angleLabels || []).forEach(([v, a, b, lab]) => {
      const u = vsub(at(a), at(v)), w = vsub(at(b), at(v)), lu = Math.hypot(...u), lw = Math.hypot(...w), bx = u[0] / lu + w[0] / lw, by = u[1] / lu + w[1] / lw, lb = Math.hypot(bx, by) || 1, r0 = o.angleR || 0.3;
      g += `<text x="${X0([at(v)[0] + bx / lb * r0, at(v)[1] + by / lb * r0])}" y="${Y0([at(v)[0] + bx / lb * r0, at(v)[1] + by / lb * r0]) + 5}" text-anchor="middle" font-size="13">${lab}</text>`;
    });
    (o.notes || []).forEach(([x, y, lab]) => { g += `<text x="${X0([x, y])}" y="${Y0([x, y]) + 5}" font-size="13">${lab}</text>`; });
    Object.keys(pts).forEach(k => {
      if (k === 'O' && !o.showO) return;
      const p0 = pts[k], d = Math.hypot(...p0), off = (o.off && o.off[k]) || (d < 0.05 ? [-0.14, 0.12] : [p0[0] / d * 0.17, p0[1] / d * 0.17]);
      g += `<circle cx="${X0(p0)}" cy="${Y0(p0)}" r="2.5" fill="currentColor"/><text x="${X0([p0[0] + off[0], p0[1] + off[1]])}" y="${Y0([p0[0] + off[0], p0[1] + off[1]]) + 5}" text-anchor="middle" font-size="14">${k}</text>`;
    });
    const W = +(x1 - x0).toFixed(1), H = +(y1 - y0).toFixed(1);
    return `<svg class="figure" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${o.label || 'circle'}">${g}</svg>`;
  }
  /** a secant from the outside point P0 through the circle point B0: returns [nearer point, B0] */
  function secant(P0, B0) { const d = vsub(B0, P0), t = (vdot(P0, P0) - 1) / vdot(d, d); return [[P0[0] + t * d[0], P0[1] + t * d[1]], B0]; }
  const BIG_TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20], [7, 24, 25], [15, 20, 25]];

  A.skill({
    id: 'int2.chords', title: 'Chords and the perpendicular from the center',
    learn: p(`A <b>chord</b> is a segment whose endpoints are on the circle. The key fact: <b>the perpendicular from the center to a chord bisects the chord</b>. (Equally, the perpendicular bisector of any chord passes through the center.) The two radii to the ends of the chord make an isosceles triangle, and the perpendicular splits it into two congruent right triangles.`) +
      p(`Each right triangle has the <b>radius as its hypotenuse</b>, the distance from the center to the chord as one leg, and <b>half the chord</b> as the other leg. So ${sq(V('r'))} = ${sq(V('d'))} + ${sq(`(${F('chord', 2)})`)}: know any two of radius, distance and chord, and the Pythagorean theorem gives the third. Chords the same distance from the center are congruent.`) +
      example('Example', `A circle has radius 13, and a chord is 5 units from the center. Half the chord is ${R(`${sq(13)} − ${sq(5)}`)} = ${R(144)} = 12, so the chord is <b>24</b> long.`),
    make(rng) {
      const kind = rng.pick(['chord', 'chord', 'dist', 'radius', 'half']), t = rng.pick(BIG_TRIPLES), swap = rng.bool(), d = swap ? t[1] : t[0], hc = swap ? t[0] : t[1], r = t[2];
      const pts = { A: [-hc / r, -d / r], B: [hc / r, -d / r], M: [0, -d / r] };
      const fig = (lr, ld, lam, lmb) => circFig({ pts, segs: [['A', 'B'], ['O', 'M'], ['O', 'A']], right: [['M', 'O', 'B']], showO: true, off: { M: [0, -0.15] },
        segLabels: [['O', 'A', lr, -1], ['O', 'M', ld, -1], ['A', 'M', lam || '', -1], ['M', 'B', lmb || '', -1]], label: 'circle with chord AB and the perpendicular OM from the center' });
      const intro = 'O is the center of the circle and OM ⟂ AB.';
      if (kind === 'half') {
        const giveHalf = rng.bool(), ans = giveHalf ? 2 * hc : hc;
        return { prompt: `${intro} ${giveHalf ? `AM = ${N(hc)}. How long is chord AB?` : `Chord AB = ${N(2 * hc)}. How long is MB?`}${fig('', '', giveHalf ? N(hc) : '', giveHalf ? '' : '?')}`, type: 'number', answer: ans, params: { kind, giveHalf, hc },
          hints: ['A perpendicular from the center to a chord bisects the chord.', 'So M is the midpoint of AB, and AM = MB = half of AB.', giveHalf ? `AB = 2 × ${N(hc)} = <b>${N(2 * hc)}</b>.` : `MB = ${N(2 * hc)} ÷ 2 = <b>${N(hc)}</b>.`] };
      }
      const H1 = 'The perpendicular from the center bisects the chord, so triangle OMA has a right angle at M and AM is half of AB. The radius OA is the hypotenuse.';
      if (kind === 'chord') return { prompt: `${intro} The radius is ${N(r)} and OM = ${N(d)}. How long is chord AB?${fig(N(r), N(d), '')}`, type: 'number', answer: 2 * hc, params: { kind, r, d },
        hints: [H1, `AM = ${R(`${sq(N(r))} − ${sq(N(d))}`)} = ${R(N(r * r - d * d))} = ${N(hc)}.`, `AB = 2 × ${N(hc)} = <b>${N(2 * hc)}</b>.`] };
      if (kind === 'dist') return { prompt: `${intro} The radius is ${N(r)} and chord AB = ${N(2 * hc)}. How far is the chord from the center (OM)?${fig(N(r), '', '')}`, type: 'number', answer: d, params: { kind, r, c: 2 * hc },
        hints: [H1, `AM = ${N(2 * hc)} ÷ 2 = ${N(hc)}.`, `OM = ${R(`${sq(N(r))} − ${sq(N(hc))}`)} = ${R(N(d * d))} = <b>${N(d)}</b>.`] };
      return { prompt: `${intro} Chord AB = ${N(2 * hc)} and OM = ${N(d)}. What is the radius of the circle?${fig('', N(d), '')}`, type: 'number', answer: r, params: { kind, d, c: 2 * hc },
        hints: [H1, `AM = ${N(2 * hc)} ÷ 2 = ${N(hc)}.`, `OA = ${R(`${sq(N(hc))} + ${sq(N(d))}`)} = ${R(N(r * r))} = <b>${N(r)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'half') return q.answer === (P.giveHalf ? P.hc * 2 : P.hc);
      if (P.kind === 'chord') { const x = Math.sqrt(P.r * P.r - P.d * P.d); return close(Math.hypot(2 * x, 0), q.answer); }      // where y = −d meets the circle
      if (P.kind === 'dist') return close(Math.hypot(P.c / 2, q.answer), P.r);
      return close(Math.hypot(P.c / 2, P.d), q.answer);
    },
  });

  A.skill({
    id: 'int2.intersecting-chords', title: 'Angles and segments of intersecting chords',
    learn: p(`When two chords cross at a point E inside a circle, they make two pairs of vertical angles. <b>Each angle is half the sum of the two arcs it and its vertical angle cut off</b>: if chords AB and CD meet at E, then m∠AEC = ½(arc AC + arc BD). The other pair of angles is supplementary to these, or half the sum of the other two arcs.`) +
      p(`The pieces of the chords obey a product rule: <b>AE · EB = CE · ED</b>. (Triangles AEC and DEB are similar, because inscribed angles on the same arc are equal.)`) +
      example('Example', `Chords AB and CD meet at E. Arc AC = 70° and arc BD = 110°, so m∠AEC = ½(70° + 110°) = <b>90°</b>. If AE = 4, EB = 6 and CE = 3, then 4 · 6 = 3 · ED, so <b>ED = 8</b>.`),
    make(rng) {
      const kind = rng.pick(['angle', 'angle', 'arc', 'other', 'seg', 'seg']);
      let x1, x2, y1, y2, a0, A0, B0, C0, D0, E0;
      do {
        x1 = rng.int(4, 15) * 10; x2 = rng.int(4, 15) * 10; y1 = rng.int(4, 15) * 10; y2 = 360 - x1 - x2 - y1;
        a0 = rng.int(0, 35) * 10; A0 = onC(a0); C0 = onC(a0 + x1); B0 = onC(a0 + x1 + y1); D0 = onC(a0 + x1 + y1 + x2); E0 = y2 >= 40 ? meet(A0, B0, C0, D0) : [1, 1];
      } while (y2 < 40 || Math.hypot(...E0) > 0.65);
      const pts = { A: A0, B: B0, C: C0, D: D0, E: E0 }, uc = vsub(C0, E0), ub = vsub(B0, E0), bis = [uc[0] / Math.hypot(...uc) + ub[0] / Math.hypot(...ub), uc[1] / Math.hypot(...uc) + ub[1] / Math.hypot(...ub)];
      const off = { E: [bis[0] / Math.hypot(...bis) * 0.17, bis[1] / Math.hypot(...bis) * 0.17] };
      const geo = { a0, x1, y1, x2 };
      if (kind === 'seg') {
        const [Pd, pairs] = rng.pick([[12, [[2, 6], [3, 4]]], [18, [[2, 9], [3, 6]]], [20, [[2, 10], [4, 5]]], [24, [[3, 8], [4, 6], [2, 12]]], [30, [[3, 10], [5, 6], [2, 15]]], [36, [[3, 12], [4, 9]]], [40, [[4, 10], [5, 8]]], [48, [[4, 12], [6, 8]]], [60, [[5, 12], [6, 10]]], [72, [[6, 12], [8, 9]]]]);
        const [p1, p2] = rng.sample(pairs, 2), [ae, eb] = rng.bool() ? p1 : [p1[1], p1[0]], [ce, ed] = rng.bool() ? p2 : [p2[1], p2[0]];
        const fig = circFig({ pts, off, segs: [['A', 'B'], ['C', 'D']], segLabels: [['A', 'E', N(ae)], ['E', 'B', N(eb)], ['C', 'E', N(ce)], ['E', 'D', X]], label: 'two chords crossing inside a circle' });
        return { prompt: `Chords AB and CD meet at E. AE = ${N(ae)}, EB = ${N(eb)} and CE = ${N(ce)}. Find ED. (The figure is not to scale.)${fig}`, type: 'number', answer: ed, params: { kind, ae, eb, ce },
          hints: ['For two chords crossing inside a circle, the products of the pieces are equal: AE · EB = CE · ED.', `${N(ae)} · ${N(eb)} = ${N(ce)} · ED, so ${N(Pd)} = ${N(ce)} · ED.`, `ED = ${N(Pd)} ÷ ${N(ce)} = <b>${N(ed)}</b>.`] };
      }
      const half = (x1 + x2) / 2;
      if (kind === 'arc') {
        const fig = circFig({ pts, off, segs: [['A', 'B'], ['C', 'D']], arcs: [['A', 'C', `${x1}°`], ['B', 'D', '?']], angleLabels: [['E', 'A', 'C', `${N(half)}°`]], label: 'two chords crossing inside a circle' });
        return { prompt: `Chords AB and CD meet at E. m∠AEC = ${N(half)}° and arc AC = ${N(x1)}°. What is the measure of arc BD?${fig}`, type: 'number', answer: x2, unit: '°', params: Object.assign({ kind }, geo),
          hints: ['An angle formed by two chords is half the sum of the arcs cut off by it and its vertical angle: m∠AEC = ½(arc AC + arc BD).', `${N(half)} = ½(${N(x1)} + arc BD), so ${N(x1)} + arc BD = ${N(2 * half)}.`, `Arc BD = ${N(2 * half)}° − ${N(x1)}° = <b>${N(x2)}°</b>.`] };
      }
      const fig = circFig({ pts, off, segs: [['A', 'B'], ['C', 'D']], arcs: [['A', 'C', `${x1}°`], ['B', 'D', `${x2}°`]], angleLabels: [kind === 'angle' ? ['E', 'A', 'C', '?'] : ['E', 'A', 'D', '?']], label: 'two chords crossing inside a circle' });
      if (kind === 'angle') return { prompt: `Chords AB and CD meet at E. Arc AC = ${N(x1)}° and arc BD = ${N(x2)}°. What is m∠AEC?${fig}`, type: 'number', answer: half, unit: '°', params: Object.assign({ kind }, geo),
        hints: ['∠AEC and its vertical angle ∠BED cut off arcs AC and BD.', 'An angle formed by two chords is half the sum of those two arcs.', `½(${N(x1)}° + ${N(x2)}°) = ½(${N(x1 + x2)}°) = <b>${N(half)}°</b>.`] };
      return { prompt: `Chords AB and CD meet at E. Arc AC = ${N(x1)}° and arc BD = ${N(x2)}°. What is m∠AED?${fig}`, type: 'number', answer: 180 - half, unit: '°', params: Object.assign({ kind }, geo),
        hints: [`First find m∠AEC = ½(arc AC + arc BD) = ½(${N(x1)}° + ${N(x2)}°) = ${N(half)}°.`, '∠AED and ∠AEC form a linear pair along chord CD, so they add to 180°.', `m∠AED = 180° − ${N(half)}° = <b>${N(180 - half)}°</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'seg') return P.ae * P.eb === P.ce * q.answer;
      const A0 = onC(P.a0), C0 = onC(P.a0 + P.x1), B0 = onC(P.a0 + P.x1 + P.y1), D0 = onC(P.a0 + P.x1 + P.y1 + P.x2), E0 = meet(A0, B0, C0, D0);   // measure the drawing
      const aec = angAt(E0, A0, C0);
      if (P.kind === 'angle') return close(aec, q.answer);
      if (P.kind === 'other') return close(angAt(E0, A0, D0), q.answer);
      return close(2 * aec - P.x1, q.answer);
    },
  });

  A.skill({
    id: 'int2.tangent-lines', title: 'Tangent lines to a circle',
    learn: p(`A <b>tangent</b> line touches a circle at exactly one point, the point of tangency. <b>A tangent is perpendicular to the radius drawn to the point of tangency.</b> So the radius, the tangent segment and the line from the center to an outside point make a right triangle, with the line to the center as the hypotenuse.`) +
      p(`From a point outside the circle you can draw exactly two tangents, and <b>the two tangent segments are congruent</b>: PA = PB. In the kite OAPB the angles at A and B are both 90°, so the angle at P and the central angle AOB add to 180°.`) +
      example('Example', `A circle has radius 5, and P is 13 units from the center O. The tangent PA is perpendicular to radius OA, so PA = ${R(`${sq(13)} − ${sq(5)}`)} = ${R(144)} = <b>12</b>.`),
    make(rng) {
      const kind = rng.pick(['length', 'length', 'dist', 'radius', 'equal', 'angle']);
      const draw = (rN, oN, extra, one) => { const al = Math.acos(rN / oN) * 180 / Math.PI; return Object.assign({ pts: one ? { A: onC(al), P: [oN / rN, 0] } : { A: onC(al), B: onC(-al), P: [oN / rN, 0] }, showO: true, off: { P: [0.15, 0] }, right: [['A', 'O', 'P']], label: 'tangents from P to a circle with center O' }, extra); };
      if (kind === 'angle') {
        const th = rng.int(6, 30) * 4, giveP = rng.bool(), oN = 1 / Math.cos(toRad((180 - th) / 2));
        const o = draw(1, oN, { segs: [['O', 'A'], ['O', 'B'], ['P', 'A'], ['P', 'B']], right: [['A', 'O', 'P'], ['B', 'O', 'P']], angleLabels: [giveP ? ['P', 'A', 'B', `${th}°`] : ['O', 'A', 'B', `${180 - th}°`], giveP ? ['O', 'A', 'B', '?'] : ['P', 'A', 'B', '?']], angleR: 0.28 });
        return { prompt: `PA and PB are tangent to the circle with center O. ${giveP ? `m∠APB = ${N(th)}°. What is m∠AOB?` : `m∠AOB = ${N(180 - th)}°. What is m∠APB?`}${circFig(o)}`, type: 'number', answer: giveP ? 180 - th : th, unit: '°', params: { kind, th, giveP },
          hints: ['Each tangent is perpendicular to its radius, so ∠OAP = ∠OBP = 90°.', 'The angles of quadrilateral OAPB add to 360°, so m∠AOB + m∠APB = 360° − 90° − 90° = 180°.', `${giveP ? 'm∠AOB' : 'm∠APB'} = 180° − ${N(giveP ? th : 180 - th)}° = <b>${N(giveP ? 180 - th : th)}°</b>.`] };
      }
      if (kind === 'equal') {
        const x = rng.int(2, 9), p1 = rng.int(1, 5), r1 = p1 + rng.int(1, 4), q1 = rng.int(1, 15), L = p1 * x + q1, s1 = L - r1 * x, ask = rng.bool() ? 'x' : 'PB';
        const o = draw(1, 2.2, { segs: [['O', 'A'], ['O', 'B'], ['P', 'A'], ['P', 'B']], right: [['A', 'O', 'P'], ['B', 'O', 'P']], segLabels: [['P', 'A', M.poly([p1, q1]), -1], ['P', 'B', M.poly([r1, s1]), 1]] });
        return { prompt: `PA and PB are tangent to the circle at A and B. PA = ${M.poly([p1, q1])} and PB = ${M.poly([r1, s1])}. ${ask === 'x' ? `Find ${X}.` : 'How long is PB?'}${circFig(o)}`, type: 'number', answer: ask === 'x' ? x : L, params: { kind, ask, p1, q1, r1, s1 },
          hints: ['Two tangent segments from the same outside point are congruent: PA = PB.', `${M.poly([p1, q1])} = ${M.poly([r1, s1])}, so ${M.term(r1 - p1, 'x')} = ${N(q1 - s1)} and ${X} = ${N(x)}.`, ask === 'x' ? `<b>${X} = ${N(x)}</b>.` : `PB = ${N(r1)}(${N(x)})${s1 ? ' ' + M.signed(s1) : ''} = <b>${N(L)}</b>.`] };
      }
      const t = rng.pick(BIG_TRIPLES), swap = rng.bool(), r = swap ? t[1] : t[0], pa = swap ? t[0] : t[1], op = t[2];
      const o = draw(r, op, { segs: [['O', 'A'], ['P', 'A'], ['O', 'P']], segLabels: [['O', 'A', kind === 'radius' ? '' : N(r), 1], ['A', 'P', kind === 'length' ? X : kind === 'radius' ? N(pa) : N(pa), 1], ['O', 'P', kind === 'dist' ? X : N(op), -1]] }, true);
      if (kind === 'radius') o.segLabels[0][2] = X;
      const H1 = 'The tangent PA is perpendicular to the radius OA, so triangle OAP has a right angle at A, with hypotenuse OP.';
      if (kind === 'length') return { prompt: `PA is tangent to the circle with center O at A. The radius is ${N(r)} and OP = ${N(op)}. How long is PA?${circFig(o)}`, type: 'number', answer: pa, params: { kind, r, op },
        hints: [H1, `PA = ${R(`${sq(N(op))} − ${sq(N(r))}`)} = ${R(N(op * op - r * r))}.`, `PA = <b>${N(pa)}</b>.`] };
      if (kind === 'dist') return { prompt: `PA is tangent to the circle with center O at A. The radius is ${N(r)} and PA = ${N(pa)}. How far is P from the center O?${circFig(o)}`, type: 'number', answer: op, params: { kind, r, pa },
        hints: [H1, `OP = ${R(`${sq(N(r))} + ${sq(N(pa))}`)} = ${R(N(op * op))}.`, `OP = <b>${N(op)}</b>.`] };
      return { prompt: `PA is tangent to the circle with center O at A. PA = ${N(pa)} and OP = ${N(op)}. What is the radius?${circFig(o)}`, type: 'number', answer: r, params: { kind, pa, op },
        hints: [H1, `OA = ${R(`${sq(N(op))} − ${sq(N(pa))}`)} = ${R(N(r * r))}.`, `The radius is <b>${N(r)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'equal') { const x = q.params.ask === 'x' ? q.answer : (P.q1 - P.s1) / (P.r1 - P.p1); return P.p1 * x + P.q1 === P.r1 * x + P.s1 && (P.ask === 'x' || q.answer === P.r1 * x + P.s1); }
      if (P.kind === 'angle') {                                           // draw it: tangent points at ±α on a unit circle, P on the x-axis
        const al = toRad((180 - P.th) / 2), A0 = [Math.cos(al), Math.sin(al)], B0 = [Math.cos(al), -Math.sin(al)], P0 = [1 / Math.cos(al), 0];
        return close(P.giveP ? angAt([0, 0], A0, B0) : angAt(P0, A0, B0), q.answer) && close(vdot(A0, vsub(P0, A0)), 0);
      }
      const r = P.kind === 'radius' ? q.answer : P.r, op = P.kind === 'dist' ? q.answer : P.op;      // tangent point from the angle at the center
      const al = Math.acos(r / op), A0 = [r * Math.cos(al), r * Math.sin(al)], pa = Math.hypot(op - A0[0], A0[1]);
      return P.kind === 'length' ? close(pa, q.answer) : close(pa, P.pa);
    },
  });

  A.skill({
    id: 'int2.tangents-secants', title: 'Tangents, secants and arcs',
    learn: p(`A <b>secant</b> is a line that cuts a circle twice. When two secants, a secant and a tangent, or two tangents meet at a point P <b>outside</b> the circle, the angle at P is <b>half the difference of the intercepted arcs</b>: ½(far arc − near arc). (Compare chords crossing <i>inside</i>, where you take half the sum.)`) +
      p(`Lengths follow a product rule measured from P. For a secant through A and B (A nearer) and a tangent PT: <b>PT² = PA · PB</b>. For two secants: <b>PA · PB = PC · PD</b>. In each product, multiply the outside part by the whole secant, not by the part inside the circle.`) +
      example('Example', `From P, a tangent touches the circle at T, and a secant cuts it at A and B, with PA = 4 and AB = 5. The whole secant is PB = 9, so PT² = 4 · 9 = 36 and <b>PT = 6</b>.`),
    make(rng) {
      const kind = rng.pick(['secants', 'tanSec', 'tangents', 'tanLen', 'tanLen', 'secLen']);
      const lab = 'lines from an outside point P to a circle';
      if (kind === 'secants') {
        let al, be, Px;
        do { al = rng.int(3, 12) * 5; be = rng.int(al / 5 + 4, 17) * 5; Px = meet(onC(180 - be), onC(al), [0, 0], [1, 0])[0]; } while (Px > 3.2 || Px < 1.5);
        const giveAngle = rng.bool(), pts = { A: onC(al), B: onC(180 - be), C: onC(-al), D: onC(180 + be), P: [Px, 0] };
        const fig = circFig({ pts, off: { P: [0.15, 0] }, segs: [['P', 'B'], ['P', 'D']], arcs: [['C', 'A', giveAngle ? '?' : `${2 * al}°`, 0.75], ['B', 'D', `${2 * be}°`]], notes: [[Px - 0.15, -0.38, `m∠P = ${giveAngle ? `${be - al}°` : '?'}`]], label: lab });
        return { prompt: `Two secants from P cut the circle at A and B and at C and D. Arc BD = ${N(2 * be)}° ${giveAngle ? `and m∠P = ${N(be - al)}°. What is the measure of arc AC?` : `and arc AC = ${N(2 * al)}°. What is m∠P?`}${fig}`, type: 'number', answer: giveAngle ? 2 * al : be - al, unit: '°', params: { kind, al, be, giveAngle },
          hints: ['For an angle formed outside the circle, m∠P = ½(far arc − near arc). Here the far arc is BD and the near arc is AC.',
            giveAngle ? `${N(be - al)} = ½(${N(2 * be)} − arc AC), so ${N(2 * be)} − arc AC = ${N(2 * (be - al))}.` : `m∠P = ½(${N(2 * be)}° − ${N(2 * al)}°) = ½(${N(2 * (be - al))}°).`,
            giveAngle ? `Arc AC = ${N(2 * be)}° − ${N(2 * (be - al))}° = <b>${N(2 * al)}°</b>.` : `m∠P = <b>${N(be - al)}°</b>.`] };
      }
      if (kind === 'tangents') {
        const minor = rng.int(20, 35) * 4, ga = minor / 2, giveArc = rng.bool(), pts = { T: onC(ga), U: onC(-ga), P: [1 / Math.cos(toRad(ga)), 0] };
        const fig = circFig({ pts, showO: true, off: { P: [0.15, 0] }, segs: [['P', 'T'], ['P', 'U']], arcs: [['U', 'T', giveArc ? `${minor}°` : '?', 0.75]], notes: [[1 / Math.cos(toRad(ga)) - 0.15, -0.38, `m∠P = ${giveArc ? '?' : `${180 - minor}°`}`]], label: lab });
        return { prompt: `PT and PU are tangent to the circle at T and U. ${giveArc ? `The minor arc TU is ${N(minor)}°. What is m∠P?` : `m∠P = ${N(180 - minor)}°. What is the minor arc TU?`}${fig}`, type: 'number', answer: giveArc ? 180 - minor : minor, unit: '°', params: { kind, minor, giveArc },
          hints: ['Two tangents cut the circle into a minor arc and a major arc that add to 360°. m∠P = ½(major arc − minor arc).',
            giveArc ? `The major arc is 360° − ${N(minor)}° = ${N(360 - minor)}°, so m∠P = ½(${N(360 - minor)}° − ${N(minor)}°).` : `With minor arc ${V('m')}, the major arc is 360 − ${V('m')}, so ${N(180 - minor)} = ½(360 − 2${V('m')}) = 180 − ${V('m')}.`,
            giveArc ? `m∠P = <b>${N(180 - minor)}°</b>.` : `Minor arc TU = 180° − ${N(180 - minor)}° = <b>${N(minor)}°</b>.`] };
      }
      if (kind === 'tanSec') {
        let x, y, Pp;
        do { x = rng.int(4, 14) * 10; y = rng.int(x / 10 + 4, 24) * 10; Pp = meet(onC(90 + y), onC(90 - x), [0, 1], [1, 1]); } while (x + y >= 340 || !(Pp[0] > 1.3 && Pp[0] < 3) || Math.hypot(...vsub(Pp, onC(90 - x))) > Math.hypot(...vsub(Pp, onC(90 + y))));
        const pts = { T: [0, 1], N: onC(90 - x), F: onC(90 + y), P: Pp }, giveAngle = rng.bool(), ang = (y - x) / 2;
        const fig = circFig({ pts, off: { P: [0, 0.16], T: [0, 0.16] }, segs: [['P', 'T'], ['P', 'F']], arcs: [['N', 'T', `${x}°`, 0.75], ['T', 'F', giveAngle ? '?' : `${y}°`]], notes: [[Pp[0] + 0.12, Pp[1] - 0.3, `m∠P = ${giveAngle ? `${ang}°` : '?'}`]], label: lab });
        return { prompt: `PT is tangent to the circle at T, and a secant from P cuts the circle at N and F. Arc TN = ${N(x)}° ${giveAngle ? `and m∠P = ${N(ang)}°. What is the measure of arc TF?` : `and arc TF = ${N(y)}°. What is m∠P?`}${fig}`, type: 'number', answer: giveAngle ? y : ang, unit: '°', params: { kind, x, y, giveAngle },
          hints: ['For an angle formed outside the circle, m∠P = ½(far arc − near arc). Here the far arc is TF and the near arc is TN.',
            giveAngle ? `${N(ang)} = ½(arc TF − ${N(x)}), so arc TF − ${N(x)} = ${N(2 * ang)}.` : `m∠P = ½(${N(y)}° − ${N(x)}°) = ½(${N(y - x)}°).`,
            giveAngle ? `Arc TF = ${N(2 * ang)}° + ${N(x)}° = <b>${N(y)}°</b>.` : `m∠P = <b>${N(ang)}°</b>.`] };
      }
      if (kind === 'tanLen') {
        const [e, w] = rng.pick([[4, 9], [2, 8], [3, 12], [4, 16], [1, 9], [5, 20], [2, 18], [3, 27], [8, 18], [9, 16], [4, 25], [6, 24], [1, 16], [3, 75]].filter(z => z[1] <= 40)), t = Math.sqrt(e * w), i = w - e, askT = rng.bool();
        const [A0, B0] = secant([2.4, 1], onC(212));
        const fig = circFig({ pts: { T: [0, 1], A: A0, B: B0, P: [2.4, 1] }, off: { P: [0.15, 0], T: [0, 0.16] }, segs: [['P', 'T'], ['P', 'B']], segLabels: [['T', 'P', askT ? X : N(t), 1], ['P', 'A', N(e), 1], ['A', 'B', askT ? N(i) : X, 1]], label: lab });
        return { prompt: `PT is tangent to the circle at T, and a secant from P cuts the circle at A and B, with A nearer to P. ${askT ? `PA = ${N(e)} and AB = ${N(i)}. How long is PT?` : `PT = ${N(t)} and PA = ${N(e)}. How long is AB?`} (The figure is not to scale.)${fig}`, type: 'number', answer: askT ? t : i, params: { kind, e, i, t, askT },
          hints: ['Tangent and secant from the same point: PT² = PA · PB, where PB is the whole secant.', askT ? `PB = ${N(e)} + ${N(i)} = ${N(w)}, so PT² = ${N(e)} · ${N(w)} = ${N(e * w)}.` : `${sq(N(t))} = ${N(e)} · PB, so PB = ${N(t * t)} ÷ ${N(e)} = ${N(w)}.`,
            askT ? `PT = ${R(N(e * w))} = <b>${N(t)}</b>.` : `AB = PB − PA = ${N(w)} − ${N(e)} = <b>${N(i)}</b>.`] };
      }
      const [Pd, pairs] = rng.pick([[24, [[2, 12], [3, 8], [4, 6]]], [30, [[2, 15], [3, 10], [5, 6]]], [36, [[2, 18], [3, 12], [4, 9]]], [40, [[2, 20], [4, 10], [5, 8]]], [48, [[3, 16], [4, 12], [6, 8]]], [60, [[3, 20], [4, 15], [5, 12], [6, 10]]], [72, [[3, 24], [4, 18], [6, 12], [8, 9]]]]);
      const [[e1, w1], [e2, w2]] = rng.sample(pairs, 2);
      const [A1, B1] = secant([2.3, 0], onC(150)), [C1, D1] = secant([2.3, 0], onC(205));
      const fig = circFig({ pts: { A: A1, B: B1, C: C1, D: D1, P: [2.3, 0] }, off: { P: [0.15, 0] }, segs: [['P', 'B'], ['P', 'D']], segLabels: [['P', 'A', N(e1), -1], ['A', 'B', N(w1 - e1), -1], ['P', 'C', N(e2), 1], ['C', 'D', X, 1]], label: lab });
      return { prompt: `Two secants from P cut the circle at A and B and at C and D, with A and C nearer to P. PA = ${N(e1)}, AB = ${N(w1 - e1)} and PC = ${N(e2)}. How long is CD? (The figure is not to scale.)${fig}`, type: 'number', answer: w2 - e2, params: { kind, e1, i1: w1 - e1, e2 },
        hints: ['For two secants from the same point: PA · PB = PC · PD, each outside part times its whole secant.', `PB = ${N(e1)} + ${N(w1 - e1)} = ${N(w1)}, so ${N(e1)} · ${N(w1)} = ${N(Pd)} = ${N(e2)} · PD, and PD = ${N(Pd)} ÷ ${N(e2)} = ${N(w2)}.`, `CD = PD − PC = ${N(w2)} − ${N(e2)} = <b>${N(w2 - e2)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'tanLen') { const pt = P.askT ? q.answer : P.t, i = P.askT ? P.i : q.answer; return close(pt * pt, P.e * (P.e + i)); }
      if (P.kind === 'secLen') return close(P.e1 * (P.e1 + P.i1), P.e2 * (P.e2 + q.answer));
      if (P.kind === 'secants') {                                        // measure the angle at P in the drawing
        const A0 = onC(P.al), B0 = onC(180 - P.be), P0 = meet(B0, A0, [0, 0], [1, 0]), ang = angAt(P0, A0, onC(-P.al));
        return P.giveAngle ? close(2 * P.be - 2 * ang, q.answer) : close(ang, q.answer);
      }
      if (P.kind === 'tangents') { const T0 = onC(P.minor / 2), P0 = [1 / Math.cos(toRad(P.minor / 2)), 0], ang = angAt(P0, T0, onC(-P.minor / 2)); return P.giveArc ? close(ang, q.answer) : close(180 - ang, q.answer); }
      const N0 = onC(90 - P.x), F0 = onC(90 + P.y), P0 = meet(F0, N0, [0, 1], [1, 1]), ang = angAt(P0, [0, 1], N0);
      return P.giveAngle ? close(2 * ang + P.x, q.answer) : close(ang, q.answer);
    },
  });


  /* ---------- Unit 14: The tangent ratio ---------- */
  const TAN_TABLE = [10, 20, 30, 40, 50, 60, 70, 80];
  const tan4 = d => M.round(Math.tan(toRad(d)), 4);

  A.skill({
    id: 'int2.tangent-ratio', title: 'The tangent ratio',
    learn: p(`In a right triangle, pick one of the acute angles. The leg across from it is the <b>opposite</b> side and the leg touching it is the <b>adjacent</b> side. Their ratio is the angle's <b>tangent</b>: <b>tan = ${F('opposite', 'adjacent')}</b>. It is the slope ratio of a slope triangle, rise over run, with the angle at the bottom.`) +
      p(`Similar right triangles have the same angles, so every right triangle with a 30° angle has the same ratio, tan 30° ≈ 0.577. That is why a table (or the calculator's tan key) can list one value for each angle. To find a missing leg, write tan = ${F('opposite', 'adjacent')} and solve: multiply when the unknown is opposite, divide when it is adjacent. The tangent grows as the angle grows, and tan 45° = 1.`) +
      example('Example', `A slope triangle has a 35° angle and a run of 12. Rise = 12 × tan 35° ≈ 12 × 0.7002 ≈ <b>8.4</b>.`),
    make(rng) {
      const kind = rng.pick(['ratio', 'ratio', 'side', 'side', 'table']);
      if (kind === 'ratio') {
        const ac = rng.int(2, 20), bc = rng.int(2, 20), ang = rng.pick(['A', 'B']), [num, den] = ang === 'A' ? [bc, ac] : [ac, bc];
        return { prompt: `In right triangle ABC, angle C is the right angle. Find tan ${ang} as a fraction in simplest form.${triFig(N(ac), N(bc), '', ang)}`, type: 'number', answer: num / den, answerText: M.fracText(num, den), params: { kind, ac, bc, ang },
          hints: [`From angle ${ang}, the opposite leg is ${ang === 'A' ? 'BC' : 'AC'} = ${N(num)} and the adjacent leg is ${ang === 'A' ? 'AC' : 'BC'} = ${N(den)}.`, `tan ${ang} = ${F('opposite', 'adjacent')} = ${F(num, den, { raw: true })}.`, `${M.gcd(num, den) > 1 ? 'Simplify: ' : ''}tan ${ang} = <b>${M.fracText(num, den)}</b>.`] };
      }
      if (kind === 'side') {
        const deg = rng.int(15, 70), len = rng.int(3, 30), want = rng.pick(['opp', 'adj']), t = tan4(deg);
        const ans = M.round(want === 'opp' ? len * Math.tan(toRad(deg)) : len / Math.tan(toRad(deg)), 1);
        const fig = triFig(want === 'adj' ? X : N(len), want === 'opp' ? X : N(len), '', 'A', deg + '°');
        return { prompt: `In right triangle ABC, angle C is the right angle and angle A = ${N(deg)}°. Find ${X}, to the nearest tenth. (Use tan ${N(deg)}° ≈ ${N(t)}.)${fig}`, type: 'number', answer: ans, tolerance: Math.max(0.05, M.round(ans * 0.002, 2)), params: { kind, deg, len, want },
          hints: [`From the ${N(deg)}° angle, ${want === 'opp' ? `${X} is opposite and ${N(len)} is adjacent` : `${N(len)} is opposite and ${X} is adjacent`}, so use the tangent.`,
            `tan ${N(deg)}° = ${want === 'opp' ? F(X, N(len)) : F(N(len), X)}.`,
            want === 'opp' ? `${X} = ${N(len)} × tan ${N(deg)}° ≈ ${N(len)} × ${N(t)} ≈ <b>${N(ans)}</b>.` : `${X} = ${N(len)} ÷ tan ${N(deg)}° ≈ ${N(len)} ÷ ${N(t)} ≈ <b>${N(ans)}</b>.`] };
      }
      let th, run, rise, guard = 0;
      do { th = rng.pick(TAN_TABLE.slice(1, 7)); run = rng.int(4, 20); rise = Math.round(run * Math.tan(toRad(th))); guard++; }
      while (guard < 50 && (rise < 1 || Math.abs(Math.atan2(rise, run) * 180 / Math.PI - th) > 2.5));
      const i0 = Math.max(0, Math.min(TAN_TABLE.length - 4, TAN_TABLE.indexOf(th) - rng.int(1, 2))), opts = TAN_TABLE.slice(i0, i0 + 4);
      const table = M.table(['Angle'].concat(opts.map(d => `${d}°`)), [['Slope ratio (tan)'].concat(opts.map(d => N(M.round(Math.tan(toRad(d)), 3))))], { compact: true });
      return { prompt: `A slope triangle has a rise of ${N(rise)} and a run of ${N(run)}. Use the table to decide which angle the slope makes with the horizontal, to the nearest 10°.${table}`, type: 'choice', answer: `${th}°`, choices: opts.map(d => `${d}°`), keepOrder: true, params: { kind, rise, run, opts },
        hints: ['The slope ratio is rise ÷ run, the tangent of the angle at the bottom of the slope triangle.', `${N(rise)} ÷ ${N(run)} ≈ ${N(M.round(rise / run, 3))}.`, `The closest value in the table is ${N(M.round(Math.tan(toRad(th)), 3))}, so the angle is about <b>${th}°</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'ratio') { const A0 = Math.atan2(P.bc, P.ac), th = P.ang === 'A' ? A0 : Math.PI / 2 - A0; return close(Math.tan(th), q.answer); }     // measure the angle, then use Math.tan
      if (P.kind === 'side') { const t = toRad(P.deg), want = P.want === 'opp' ? P.len * Math.sin(t) / Math.cos(t) : P.len * Math.cos(t) / Math.sin(t); return Math.abs(want - q.answer) <= 0.05 + 1e-9; }
      const deg = Math.atan2(P.rise, P.run) * 180 / Math.PI, best = P.opts.reduce((b, d) => Math.abs(d - deg) < Math.abs(b - deg) ? d : b);
      return q.answer === `${best}°`;
    },
  });

  A.skill({
    id: 'int2.tangent-applications', title: 'Using the tangent ratio',
    learn: p(`The tangent ratio finds heights and distances you cannot measure directly. The <b>angle of elevation</b> is the angle you look <i>up</i> from the horizontal; the <b>angle of depression</b> is the angle you look <i>down</i> from the horizontal. Draw the right triangle: the horizontal distance and the height are its legs.`) +
      p(`If the angle sits at the end of the horizontal distance, then <b>height = distance × tan(angle)</b> and <b>distance = height ÷ tan(angle)</b>. Remember to add any extra height, such as the observer's eye level, after you find the triangle's height. An angle of depression from a tower equals the angle of elevation from the ground back up, because the two horizontals are parallel.`) +
      example('Example', `${big('A tree casts a 20 m shadow when the sun is 38° above the horizon.')}Height = 20 × tan 38° ≈ 20 × 0.7813 ≈ <b>15.6 m</b>.`),
    make(rng) {
      const kind = rng.pick(['elevation', 'eye', 'depression', 'shadow', 'ramp', 'angle']), name = rng.pick(NAMES), deg = rng.int(12, 70), t = tan4(deg);
      const tolOf = v => Math.max(0.05, M.round(v * 0.002, 2));
      if (kind === 'angle') {
        const h = rng.int(5, 60), d = rng.int(5, 80), ans = Math.round(Math.atan2(h, d) * 180 / Math.PI);
        return { prompt: `${name} stands ${N(d)} m from the base of a ${N(h)} m tower on flat ground. What is the angle of elevation from the ground where ${name} stands to the top of the tower, to the nearest degree?`, type: 'number', answer: ans, unit: '°', params: { kind, h, d },
          hints: ['The height is opposite the angle and the ground distance is adjacent, so use the tangent.', `tan θ = ${F(N(h), N(d))} ≈ ${N(M.round(h / d, 4))}.`, `θ = tan<sup>−1</sup>(${N(M.round(h / d, 4))}) ≈ ${N(M.round(Math.atan2(h, d) * 180 / Math.PI, 2))}°, so about <b>${N(ans)}°</b>.`] };
      }
      if (kind === 'depression') {
        const h = rng.int(20, 120), ans = M.round(h / Math.tan(toRad(deg)), 1);
        return { prompt: `From the top of a ${N(h)} m cliff, ${name} sees a boat at an angle of depression of ${N(deg)}°. How far is the boat from the foot of the cliff, to the nearest tenth of a meter? (tan ${N(deg)}° ≈ ${N(t)})`, type: 'number', answer: ans, unit: 'm', tolerance: tolOf(ans), params: { kind, h, deg },
          hints: [`The angle of depression from the cliff top equals the angle of elevation from the boat up to the cliff top: ${N(deg)}°.`, `From the boat, the cliff (${N(h)} m) is opposite and the distance ${V('d')} is adjacent: tan ${N(deg)}° = ${F(N(h), V('d'))}.`, `${V('d')} = ${N(h)} ÷ ${N(t)} ≈ <b>${N(ans)}</b> m.`] };
      }
      if (kind === 'ramp') {
        const small = rng.int(3, 12), run = rng.int(2, 15), ans = M.round(run * Math.tan(toRad(small)), 2);
        return { prompt: `A wheelchair ramp makes a ${N(small)}° angle with the ground and covers a horizontal distance of ${N(run)} m. How high does it rise, to the nearest hundredth of a meter? (tan ${N(small)}° ≈ ${N(tan4(small))})`, type: 'number', answer: ans, unit: 'm', tolerance: 0.01, params: { kind, deg: small, d: run, eye: 0 },
          hints: ['The rise is opposite the angle and the horizontal distance is adjacent, so use the tangent.', `rise = ${N(run)} × tan ${N(small)}°.`, `rise ≈ ${N(run)} × ${N(tan4(small))} ≈ <b>${N(ans)}</b> m.`] };
      }
      const d = rng.int(5, 60), eye = kind === 'eye' ? rng.pick([1.4, 1.5, 1.6, 1.7]) : 0, ans = M.round(d * Math.tan(toRad(deg)) + eye, 1);
      const prompt = kind === 'shadow' ? `A flagpole casts a shadow ${N(d)} m long when the sun is ${N(deg)}° above the horizon. How tall is the flagpole, to the nearest tenth of a meter? (tan ${N(deg)}° ≈ ${N(t)})`
        : kind === 'eye' ? `${name} stands ${N(d)} m from a building and looks up at its top at an angle of elevation of ${N(deg)}°. ${name}'s eyes are ${N(eye)} m above the ground. How tall is the building, to the nearest tenth of a meter? (tan ${N(deg)}° ≈ ${N(t)})`
          : `From a point ${N(d)} m from the foot of a tree, the angle of elevation to the top of the tree is ${N(deg)}°. How tall is the tree, to the nearest tenth of a meter? (tan ${N(deg)}° ≈ ${N(t)})`;
      const legs = kind === 'shadow' ? 'the shadow is the adjacent leg and the pole is the opposite leg' : `the ground distance is the adjacent leg and the height${kind === 'eye' ? ' above eye level' : ''} is the opposite leg`;
      return { prompt, type: 'number', answer: ans, unit: 'm', tolerance: tolOf(ans), params: { kind, deg, d, eye },
        hints: [`Draw the right triangle: ${legs}. Use tan = ${F('opposite', 'adjacent')}.`, `opposite = ${N(d)} × tan ${N(deg)}° ≈ ${N(d)} × ${N(t)} ≈ ${N(M.round(d * Math.tan(toRad(deg)), 2))} m.`,
          kind === 'eye' ? `Add the eye height: ${N(M.round(d * Math.tan(toRad(deg)), 2))} + ${N(eye)} ≈ <b>${N(ans)}</b> m.` : `The height is about <b>${N(ans)}</b> m.`] };
    },
    verify(q) {
      const P = q.params;                                               // rebuild the triangle with the law of sines instead of tan
      if (P.kind === 'angle') return Math.abs(Math.asin(P.h / Math.hypot(P.h, P.d)) * 180 / Math.PI - q.answer) <= 0.5;
      const t = toRad(P.deg), sides = len => len * Math.sin(t) / Math.sin(Math.PI / 2 - t);
      if (P.kind === 'depression') return Math.abs(P.h * Math.sin(Math.PI / 2 - t) / Math.sin(t) - q.answer) <= q.tolerance + 1e-9;
      return Math.abs(sides(P.d) + P.eye - q.answer) <= (P.kind === 'ramp' ? 0.005 : 0.05) + 1e-9;
    },
  });

})();
