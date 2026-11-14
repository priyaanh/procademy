/* Algebra 2. Polynomial arithmetic, complex numbers, factoring and dividing polynomials, polynomial
   graphs, rational exponents and radicals, exponential models and logarithms, transformations of
   functions, rational equations and nonlinear systems, trigonometry, and choosing a model. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v;
  const NAMES = ['Aisha', 'Mateo', 'Mei', 'Kwame', 'Sofia', 'Arjun', 'Leila', 'Tomas', 'Hana', 'Kofi', 'Ines', 'Diego', 'Yuki', 'Nia', 'Lucas', 'Fatima', 'Noah', 'Zara', 'Emeka', 'Rosa', 'Ana', 'Ben', 'Chloe', 'Dev', 'Grace', 'Omar', 'Ravi', 'Theo', 'Uma', 'Lena'];
  const p = s => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const X = V('x'), Y = V('y'), I = V('i');
  const wrap = x => x < 0 ? `(${N(x)})` : N(x);
  const P = c => M.poly(c, 'x');
  const sfrac = (num, den) => `<span class="frac"><span class="num">${num}</span><span class="den">${den}</span></span>`;
  const fx = (name, arg) => `${V(name)}(${arg})`;
  const root = (k, inner) => k === 2 ? M.sqrt(inner) : `<sup>${k}</sup>${M.sqrt(inner)}`;
  const key = s => A.normText(A.stripTags(s));

  /** the answer plus up to three wrong options: listed mistakes first, then perturb() until there are four */
  function options(answer, cands, perturb) {
    const out = [answer], seen = new Set([key(answer)]);
    const add = c => { if (c && out.length < 4 && !seen.has(key(c))) { seen.add(key(c)); out.push(c); } };
    cands.forEach(add);
    for (let g = 0; out.length < 4 && perturb && g < 60; g++) add(perturb());
    return out;
  }

  /* ----- polynomial helpers (coefficients highest power first) ----- */
  function pmul(a, b) {
    const out = new Array(a.length + b.length - 1).fill(0);
    a.forEach((x, i) => b.forEach((y, j) => { out[i + j] += x * y; }));
    return out;
  }
  const horner = (c, t) => c.reduce((acc, k) => acc * t + k, 0);
  /** synthetic division of c by (x − r): [quotient, remainder] */
  function synth(c, r) {
    const out = [c[0]];
    for (let i = 1; i < c.length; i++) out.push(c[i] + r * out[i - 1]);
    return [out.slice(0, -1), out[out.length - 1]];
  }
  /** read back a polynomial printed by M.poly, as a function of t (for verify) */
  function readPoly(html) {
    const s = String(html).replace(/<sup>([^<]*)<\/sup>/g, '^$1').replace(/<[^>]*>/g, '').replace(/−/g, '-').replace(/\s+/g, '').replace(/(\d),(?=\d{3})/g, '$1');
    const terms = s.match(/[+-]?[^+-]+/g) || [];
    const parts = terms.map(t => {
      const m = t.match(/^([+-]?)(\d*\.?\d*)(x(?:\^(\d+))?)?$/);
      if (!m || (!m[2] && !m[3])) throw new Error('cannot read term ' + t);
      return { c: (m[1] === '-' ? -1 : 1) * (m[2] ? Number(m[2]) : 1), k: m[3] ? (m[4] ? Number(m[4]) : 1) : 0 };
    });
    return t => parts.reduce((acc, q) => acc + q.c * Math.pow(t, q.k), 0);
  }
  /** "(2x + 1)(x² − 3)" → product of the factors, as a function of t */
  function readFactors(html) {
    const s = String(html).trim().replace(/^\(/, '').replace(/\)$/, '');
    const fs = s.split(')(').map(readPoly);
    return t => fs.reduce((acc, f) => acc * f(t), 1);
  }
  const sameAt = (f, g) => [-3, -2, -1, 0, 1, 2, 3, 5].every(t => Math.abs(f(t) - g(t)) < 1e-6 * Math.max(1, Math.abs(g(t))));

  /* ----- complex numbers ----- */
  function cx(a, b) {
    if (b === 0) return N(a);
    const im = (Math.abs(b) === 1 ? '' : N(Math.abs(b))) + I;
    if (a === 0) return (b < 0 ? '−' : '') + im;
    return `${N(a)} ${b < 0 ? '−' : '+'} ${im}`;
  }
  function readCx(html) {
    const t = A.stripTags(html).replace(/−/g, '-').replace(/\s+/g, '');
    if (!t.endsWith('i')) return [Number(t), 0];
    const k = Math.max(t.lastIndexOf('+'), t.lastIndexOf('-'));
    let re = 0, im;
    if (k > 0) { re = Number(t.slice(0, k)); im = t.slice(k, -1); } else im = t.slice(0, -1);
    im = (im === '' || im === '+') ? 1 : im === '-' ? -1 : Number(im);
    return [re, im];
  }

  A.course({
    id: 'algebra-2', title: 'Algebra 2', subject: 'High school', grade: 11, icon: 'A2', hue: 310,
    blurb: 'Polynomials and complex numbers, radicals, exponentials and logarithms, transformations, equations, trigonometry and modeling.',
    units: [
      { id: 'poly-arithmetic', title: 'Polynomial arithmetic', blurb: 'Adding, subtracting and multiplying polynomials.', skills: ['alg2.add-sub-polynomials', 'alg2.multiply-polynomials'] },
      { id: 'complex', title: 'Complex numbers', blurb: 'The imaginary unit, the complex plane, and arithmetic with a + bi.', skills: ['alg2.complex-plane', 'alg2.complex-operations'] },
      { id: 'factorization', title: 'Polynomial factorization', blurb: 'Sums and differences of cubes, grouping, and quadratic forms.', skills: ['alg2.factor-cubes', 'alg2.factor-grouping'] },
      { id: 'division', title: 'Polynomial division', blurb: 'Long and synthetic division, and the remainder theorem.', skills: ['alg2.divide-polynomials', 'alg2.remainder-theorem'] },
      { id: 'poly-graphs', title: 'Polynomial graphs', blurb: 'Zeros and their multiplicity, and end behavior.', skills: ['alg2.zeros-multiplicity', 'alg2.end-behavior'] },
      { id: 'radicals', title: 'Rational exponents and radicals', blurb: 'Fractional exponents, simplifying roots, and radical equations.', skills: ['alg2.rational-exponents', 'alg2.radical-equations'] },
      { id: 'exp-models', title: 'Exponential models', blurb: 'Growth and decay: computing with a model and reading one.', skills: ['alg2.exponential-models', 'alg2.exponential-rates'] },
      { id: 'logarithms', title: 'Logarithms', blurb: 'Evaluating logs, their properties, and solving exponential equations.', skills: ['alg2.evaluate-logs', 'alg2.solve-exponential'] },
      { id: 'transformations', title: 'Transformations of functions', blurb: 'Shifting, reflecting and stretching the graph of f.', skills: ['alg2.shifts-reflections', 'alg2.stretches'] },
      { id: 'equations', title: 'Equations', blurb: 'Rational equations and systems with a quadratic.', skills: ['alg2.rational-equations', 'alg2.quadratic-systems'] },
      { id: 'trig', title: 'Trigonometry', blurb: 'Radians, the unit circle, and the shape of a sinusoid.', skills: ['alg2.unit-circle', 'alg2.sinusoids'] },
      { id: 'modeling', title: 'Modeling', blurb: 'Choosing a linear, quadratic or exponential model and using it.', skills: ['alg2.choose-model', 'alg2.model-predict'] },
    ],
  });

  /* ---------- Unit 1: Polynomial arithmetic ---------- */
  A.skill({
    id: 'alg2.add-sub-polynomials', title: 'Adding and subtracting polynomials',
    learn: p(`A <b>polynomial</b> is a sum of terms such as 4${X}³, −2${X} and 7. The number in front of a term is its <b>coefficient</b>. Two terms are <b>like terms</b> when they have the same power of ${X}, and only like terms can be combined: 3${X}² + 5${X}² = 8${X}², but 3${X}² and 5${X} stay separate.`) +
      p('<b>To add, combine the coefficients of like terms. To subtract, change the sign of every term in the second polynomial, then add.</b> The most common slip is changing only the first sign, so write the subtraction out in full before you combine.') +
      example('Example 1: adding', `${big(`(${P([2, 5, -1])}) + (${P([1, -7, 4])})`)}Drop the parentheses and group like terms: ${X}² terms 2 + 1 = 3, ${X} terms 5 − 7 = −2, constants −1 + 4 = 3. Answer: <b>${P([3, -2, 3])}</b>.`) +
      example('Example 2: subtracting', `${big(`(${P([3, -2, 5])}) − (${P([1, 4, -6])})`)}Change every sign in the second polynomial: ${P([3, -2, 5])} − ${X}² − 4${X} + 6. Combine: ${X}² terms 3 − 1 = 2, ${X} terms −2 − 4 = −6, constants 5 + 6 = 11. Answer: <b>${P([2, -6, 11])}</b>.`),
    make(rng) {
      const L = rng.pick([3, 3, 4]), sub = rng.bool();
      const a = [rng.nz(-9, 9)], b = [rng.nz(-9, 9)];
      for (let i = 1; i < L; i++) { a.push(rng.int(-9, 9)); b.push(rng.nz(-9, 9)); }
      if (a[0] === (sub ? b[0] : -b[0])) a[0] += a[0] > 0 ? 1 : -1;
      const s = sub ? -1 : 1;
      const r = a.map((c, i) => c + s * b[i]);
      const ans = P(r);
      const cands = sub
        ? [P(a.map((c, i) => c + b[i])), P(a.map((c, i) => i === 0 ? c - b[0] : c + b[i])), P(r.map((c, i) => i === L - 1 ? a[i] + b[i] : c))]
        : [P(a.map((c, i) => i === L - 2 ? c - b[i] : c + b[i])), P(a.map((c, i) => i === L - 1 ? c - b[i] : c + b[i])), P(a.map((c, i) => c - b[i]))];
      const choices = options(ans, cands, () => { const k = rng.int(0, L - 1); return P(r.map((c, i) => i === k ? c + rng.pick([-2, -1, 1, 2]) : c)); });
      const neg = P(b.map(c => -c));
      const lines = r.map((c, i) => { const pw = L - 1 - i; const lab = pw === 0 ? 'constants' : (pw === 1 ? X : M.sup(X, pw)) + ' terms'; return `${lab}: ${N(a[i])} ${sub ? '−' : '+'} ${wrap(b[i])} = ${N(c)}`; }).join('; ');
      const hints = (sub ? [`Subtracting means changing the sign of <b>every</b> term of the second polynomial: −(${P(b)}) = ${neg}.`] : [`Adding means you can drop the parentheses and combine like terms: terms with the same power of ${X}.`])
        .concat([`Combine like terms. ${lines}.`, `The result is <b>${ans}</b>.`]);
      return { prompt: `${sub ? 'Subtract' : 'Add'} the polynomials.${big(`(${P(a)}) ${sub ? '−' : '+'} (${P(b)})`)}`, type: 'choice', choices, answer: ans, hints, params: { a, b, sub } };
    },
    challenge(rng) {   // "subtract B from A" flips the order; four or five terms, with gaps
      const L = rng.pick([4, 5]);
      const a = [rng.nz(-9, 9)], b = [rng.nz(-9, 9)];
      for (let i = 1; i < L; i++) { a.push(rng.chance(0.25) ? 0 : rng.int(-12, 12)); b.push(rng.chance(0.25) ? 0 : rng.nz(-12, 12)); }
      if (a[0] === b[0]) a[0] += a[0] > 0 ? 1 : -1;
      const r = a.map((c, i) => c - b[i]), ans = P(r);
      const cands = [P(b.map((c, i) => c - a[i])), P(a.map((c, i) => c + b[i])), P(a.map((c, i) => i === 0 ? c - b[0] : c + b[i]))];
      const choices = options(ans, cands, () => { const k = rng.int(1, L - 1); return P(r.map((c, i) => i === k ? c + rng.pick([-2, -1, 1, 2]) : c)); });
      const lines = r.map((c, i) => { const pw = L - 1 - i; if (!a[i] && !b[i]) return ''; const lab = pw === 0 ? 'constants' : (pw === 1 ? X : M.sup(X, pw)) + ' terms'; return `${lab}: ${N(a[i])} − ${wrap(b[i])} = ${N(c)}`; }).filter(Boolean).join('; ');
      return { prompt: `Subtract, and write the result as one polynomial.${big(`Subtract ${P(b)} from ${P(a)}`)}`, type: 'choice', choices, answer: ans, params: { a, b, sub: true },
        hints: [`“Subtract ${V('B')} from ${V('A')}” means ${V('A')} − ${V('B')}, so the polynomial named second comes first: (${P(a)}) − (${P(b)}).`, `Change the sign of every term of ${P(b)}, then combine like terms. ${lines}.`, `The result is <b>${ans}</b>.`] };
    },
    verify(q) { const { a, b, sub } = q.params; const f = readPoly(q.answer); return sameAt(f, t => horner(a, t) + (sub ? -1 : 1) * horner(b, t)); },
  });

  A.skill({
    id: 'alg2.multiply-polynomials', title: 'Multiplying polynomials',
    learn: p(`<b>To multiply two polynomials, multiply every term of the first by every term of the second, then combine like terms.</b> A <b>binomial</b> has two terms and a <b>trinomial</b> has three, so a binomial times a trinomial gives 2 × 3 = 6 small products before you combine.`) +
      p(`When two terms multiply, multiply the coefficients and add the exponents: 3${X} · 4${X}² = 12${X}³. To square a binomial, write it out twice: (${X} + 5)² = (${X} + 5)(${X} + 5) = ${X}² + 10${X} + 25. Forgetting the middle term, 10${X}, is the classic mistake.`) +
      example('Example 1: a binomial times a trinomial', `${big(`(${P([2, -1])})(${P([1, 3, -4])})`)}2${X} · (${P([1, 3, -4])}) = ${P([2, 6, -8, 0])}, and −1 · (${P([1, 3, -4])}) = ${P([-1, -3, 4])}. Add and combine: <b>${P(pmul([2, -1], [1, 3, -4]))}</b>.`) +
      example('Example 2: squaring a binomial', `${big(`(${P([3, -2])})²`)}(${P([3, -2])})(${P([3, -2])}) = 9${X}² − 6${X} − 6${X} + 4 = <b>${P([9, -12, 4])}</b>.`) +
      example('Example 3: just one coefficient', `${big(`The coefficient of ${X} in (${P([1, 4])})(${P([2, -3, 5])})`)}Only two products give an ${X} term: ${X} · 5 = 5${X} and 4 · (−3${X}) = −12${X}. So the coefficient is 5 − 12 = <b>−7</b>.`),
    make(rng) {
      const kind = rng.pick(['bin-bin', 'square', 'bin-tri', 'bin-tri', 'coef']);
      const a = [rng.pick([1, 1, 2, 3, -1, -2]), rng.nz(-7, 7)];
      let b;
      if (kind === 'bin-bin') b = [rng.pick([1, 2, 3, -1]), rng.nz(-7, 7)];
      else if (kind === 'square') b = a.slice();
      else b = [rng.pick([1, 2, -1, 3]), rng.int(-6, 6), rng.nz(-6, 6)];
      const r = pmul(a, b), ans = P(r);
      const shown = kind === 'square' ? `(${P(a)})²` : `(${P(a)})(${P(b)})`;
      const deg = r.length - 1;
      const t0 = M.term(a[0], 'x', 1), t1 = N(a[1]);
      const parts = [`${t0} · (${P(b)}) = ${P(pmul([a[0], 0], b))}`, `${t1} · (${P(b)}) = ${P(pmul([a[1]], b))}`];
      const hints = [(kind === 'square' ? `Write the square as a product: (${P(a)})(${P(a)}). ` : '') + `Multiply each term of ${P(a)} by the whole second factor.`, parts.join('; ') + '.', `Add the partial products, combining like terms.`];
      if (kind === 'coef') {
        const k = rng.int(1, deg - 1);
        hints[2] = `Add the partial products: ${ans}.`;
        hints.push(`The coefficient of ${k === 1 ? X : M.sup(X, k)} is <b>${N(r[deg - k])}</b>.`);
        return { prompt: `Multiply, then give the coefficient of ${k === 1 ? X : M.sup(X, k)} in the product.${big(shown)}`, type: 'number', answer: r[deg - k], hints, params: { kind, a, b, k } };
      }
      hints.push(`The product is <b>${ans}</b>.`);
      const drop = (i, j) => { const out = r.slice(); out[i + j] -= a[i] * b[j]; return P(out); };
      const cands = kind === 'square' ? [P([a[0] * a[0], 0, a[1] * a[1]]), P([a[0] * a[0], a[0] * a[1], a[1] * a[1]]), P([a[0] * a[0], -2 * a[0] * a[1], a[1] * a[1]])]
        : [drop(0, 1), drop(1, 0), drop(1, b.length - 2), P(r.map((c, i) => i === 1 ? -c : c))];
      const choices = options(ans, rng.shuffle(cands), () => { const k = rng.int(1, deg); return P(r.map((c, i) => i === k ? c + rng.pick([-2, -1, 1, 2]) : c)); });
      return { prompt: `Multiply and simplify.${big(shown)}`, type: 'choice', choices, answer: ans, hints, params: { kind, a, b } };
    },
    challenge(rng) {   // a trinomial times a trinomial: the whole product, or one coefficient of it
      const a = [rng.pick([1, 2, 3, -1, -2]), rng.nz(-5, 5), rng.nz(-6, 6)], b = [rng.pick([1, 2, -1, 3]), rng.int(-5, 5), rng.nz(-6, 6)];
      const r = pmul(a, b), ans = P(r), shown = `(${P(a)})(${P(b)})`;
      const tm = (c, pw) => (pw ? M.term(c, 'x', pw) : N(c));
      const byPow = k => { const out = []; a.forEach((x, i) => b.forEach((y, j) => { if (4 - i - j === k && x * y) out.push(`(${tm(x, 2 - i)})(${tm(y, 2 - j)})`); })); return out; };
      if (rng.bool()) {
        const k = rng.int(1, 3), ks = k === 1 ? X : M.sup(X, k);
        return { prompt: `Find the coefficient of ${ks} in the product, without multiplying everything out.${big(shown)}`, type: 'number', answer: r[4 - k], params: { kind: 'coef', a, b, k },
          hints: [`Only pairs of terms whose powers of ${X} add to ${k} make an ${ks} term.`, `Those pairs: ${byPow(k).join(' + ')}.`, `Add their coefficients: the coefficient of ${ks} is <b>${N(r[4 - k])}</b>.`] };
      }
      const drop = (i, j) => { const out = r.slice(); out[i + j] -= a[i] * b[j]; return P(out); };
      const choices = options(ans, rng.shuffle([drop(0, 1), drop(1, 1), drop(2, 1), drop(1, 2), P(r.map((c, i) => i === 2 ? -c : c))]), () => { const k = rng.int(1, 4); return P(r.map((c, i) => i === k ? c + rng.pick([-2, -1, 1, 2]) : c)); });
      return { prompt: `Multiply and simplify.${big(shown)}`, type: 'choice', choices, answer: ans, params: { kind: 'tri-tri', a, b },
        hints: [`Multiply each term of ${P(a)} by every term of ${P(b)}: up to nine small products.`, `Collect them by power: ${[4, 3, 2, 1, 0].map(k => `${k === 0 ? 'constants' : (k === 1 ? X : M.sup(X, k))} ${N(r[4 - k])}`).join(', ')}.`, `The product is <b>${ans}</b>.`] };
    },
    verify(q) {
      const { kind, a, b, k } = q.params;
      const prod = t => horner(a, t) * horner(b, t);
      if (kind === 'coef') {   // the coefficient of x^k by finite differences is messy; use the sum over i + j = degree − k instead
        const da = a.length - 1, db = b.length - 1; let c = 0;
        a.forEach((x, i) => b.forEach((y, j) => { if ((da - i) + (db - j) === k) c += x * y; }));
        return q.answer === c;
      }
      return sameAt(readPoly(q.answer), prod);
    },
  });

  /* ---------- Unit 2: Complex numbers ---------- */
  /** the complex plane from −6 to 6 with one point; the text alternative says where the point is, as the picture does */
  function planeSvg(a, b) {
    const S = 14, C = 100;
    let g = '';
    for (let k = -6; k <= 6; k++) {
      if (k === 0) continue;
      g += `<line x1="${C + k * S}" y1="16" x2="${C + k * S}" y2="184" stroke="var(--line)" stroke-width="0.6"/><line x1="16" y1="${C - k * S}" x2="184" y2="${C - k * S}" stroke="var(--line)" stroke-width="0.6"/>`;
    }
    g += `<line x1="12" y1="${C}" x2="188" y2="${C}" stroke="var(--muted)" stroke-width="1.2"/><line x1="${C}" y1="12" x2="${C}" y2="188" stroke="var(--muted)" stroke-width="1.2"/>`;
    g += `<text x="166" y="${C - 5}" font-size="11" fill="var(--muted)">Re</text><text x="${C + 5}" y="22" font-size="11" fill="var(--muted)">Im</text>`;
    g += `<text x="${C + 5 * S}" y="${C + 13}" font-size="10" text-anchor="middle" fill="var(--muted)">5</text><text x="${C - 4}" y="${C - 5 * S + 4}" font-size="10" text-anchor="end" fill="var(--muted)">5</text>`;
    g += `<circle cx="${C + a * S}" cy="${C - b * S}" r="4.5" class="dot"/>`;
    const where = `${a === 0 ? 'on the imaginary axis' : `${Math.abs(a)} ${Math.abs(a) === 1 ? 'unit' : 'units'} ${a < 0 ? 'left' : 'right'} of 0`} and ${b === 0 ? 'on the real axis' : `${Math.abs(b)} ${Math.abs(b) === 1 ? 'unit' : 'units'} ${b < 0 ? 'down' : 'up'}`}`;
    const label = `complex plane with real axis across and imaginary axis up, grid lines 1 unit apart, and one point ${where}`;
    return `<svg class="figure" viewBox="0 0 200 200" width="220" height="220" role="img" aria-label="${label}"><desc>${label}</desc>${g}</svg>`;
  }

  A.skill({
    id: 'alg2.complex-plane', title: 'The imaginary unit and the complex plane',
    learn: p(`The <b>imaginary unit</b> ${I} is the number whose square is −1: <b>${I}² = −1</b>. It lets you take square roots of negative numbers: √−1 = ${I} and √−25 = √25 · √−1 = 5${I}. A <b>complex number</b> has the form ${V('a')} + ${V('b')}${I}, with a <b>real part</b> ${V('a')} and an <b>imaginary part</b> ${V('b')}.`) +
      p(`<b>Powers of ${I} repeat in a cycle of four: ${I}¹ = ${I}, ${I}² = −1, ${I}³ = −${I}, ${I}⁴ = 1.</b> To find ${I}<sup>${V('n')}</sup>, divide ${V('n')} by 4 and use the remainder: 1 gives ${I}, 2 gives −1, 3 gives −${I}, and 0 gives 1.`) +
      p(`In the <b>complex plane</b>, the number ${V('a')} + ${V('b')}${I} is the point (${V('a')}, ${V('b')}): the real part runs across and the imaginary part runs up. Its <b>absolute value</b> |${V('a')} + ${V('b')}${I}| is its distance from 0, which is √(${V('a')}² + ${V('b')}²) by the Pythagorean theorem.`) +
      example('Example 1: a high power', `${big(`${I}<sup>27</sup>`)}27 = 4 × 6 + 3, so ${I}<sup>27</sup> = (${I}⁴)⁶ · ${I}³ = 1 · ${I}³ = <b>−${I}</b>.`) +
      example('Example 2: the square root of a negative', `${big(`${M.sqrt('−49')}`)}Split off −1: √−49 = √49 · √−1 = <b>7${I}</b>. With a minus sign in front, −√−49 = −7${I}.`) +
      example('Example 3: plotting and absolute value', `${planeSvg(3, -4)}The point is 3 right and 4 down, so it stands for <b>3 − 4${I}</b>. Its distance from 0 is √(3² + (−4)²) = √25, so |3 − 4${I}| = <b>5</b>.`),
    make(rng) {
      const kind = rng.pick(['power', 'power', 'sqrt', 'plane', 'plane', 'abs']);
      if (kind === 'power') {
        const n = rng.int(5, 99), r = n % 4;
        const labels = ['1', I, '−1', '−' + I];
        const answer = labels[r];
        return { prompt: `Simplify.${big(`${I}<sup>${n}</sup>`)}`, type: 'choice', choices: labels.slice(), keepOrder: true, answer, params: { kind, n },
          hints: [`The powers of ${I} cycle: ${I}¹ = ${I}, ${I}² = −1, ${I}³ = −${I}, ${I}⁴ = 1, then it starts again.`, `Divide ${n} by 4: ${n} = 4 × ${Math.floor(n / 4)} + ${r}, so ${I}<sup>${n}</sup> = ${r === 0 ? `(${I}⁴)<sup>${n / 4}</sup> = 1` : `${I}<sup>${r}</sup>`}.`, `${I}<sup>${n}</sup> = <b>${answer}</b>.`] };
      }
      if (kind === 'sqrt') {
        const k = rng.int(2, 12), sgn = rng.bool() ? 1 : -1;
        const shown = (sgn < 0 ? '−' : '') + M.sqrt('−' + N(k * k));
        const answer = cx(0, sgn * k);
        return { prompt: `Simplify.${big(shown)}`, type: 'choice', choices: [cx(0, k), cx(0, -k), N(k), N(-k)], keepOrder: true, answer, params: { kind, k, sgn },
          hints: [`Split off −1: √−${N(k * k)} = √${N(k * k)} · √−1.`, `√${N(k * k)} = ${k} and √−1 = ${I}, so √−${N(k * k)} = ${k}${I}.${sgn < 0 ? ' The minus sign in front stays.' : ''}`, `<b>${answer}</b>.`] };
      }
      const pairs = [[3, 4], [6, 8], [5, 12], [8, 15], [4, 3], [8, 6], [12, 5], [9, 12]];
      if (kind === 'abs') {
        const [x, y] = rng.pick(pairs), a = x * rng.sign(), b = y * rng.sign();
        const r = Math.round(Math.sqrt(x * x + y * y));
        return { prompt: `Find the absolute value (the distance from 0 in the complex plane).${big(`|${cx(a, b)}|`)}`, type: 'number', answer: r, params: { kind, a, b },
          hints: [`|${V('a')} + ${V('b')}${I}| = √(${V('a')}² + ${V('b')}²), the Pythagorean theorem on the point (${N(a)}, ${N(b)}).`, `${wrap(a)}² + ${wrap(b)}² = ${x * x} + ${y * y} = ${x * x + y * y}.`, `√${x * x + y * y} = <b>${r}</b>.`] };
      }
      let a = rng.nz(-6, 6), b = rng.nz(-6, 6);
      if (Math.abs(a) === Math.abs(b)) b = b > 0 ? (b === 6 ? 2 : b + 1) : (b === -6 ? -2 : b - 1);
      const answer = cx(a, b);
      return { prompt: `Which complex number is plotted? The horizontal axis is real and the vertical axis is imaginary; each grid line is 1 unit.${planeSvg(a, b)}`, type: 'choice', choices: [answer, cx(b, a), cx(a, -b), cx(-a, b)], answer, params: { kind, a, b },
        hints: [`A point (${V('a')}, ${V('b')}) in the complex plane stands for ${V('a')} + ${V('b')}${I}: across is the real part, up is the imaginary part.`, `The point is ${N(Math.abs(a))} ${a < 0 ? 'left' : 'right'} and ${N(Math.abs(b))} ${b < 0 ? 'down' : 'up'}: it is (${N(a)}, ${N(b)}).`, `So it is <b>${answer}</b>.`] };
    },
    challenge(rng) {   // large and combined powers of i, and absolute values from bigger right triangles
      if (rng.chance(0.3)) {
        const [x, y] = rng.pick([[7, 24], [24, 7], [20, 21], [21, 20], [9, 40], [40, 9], [12, 35], [35, 12], [8, 15], [15, 8], [28, 45], [33, 56]]);
        const a = x * rng.sign(), b = y * rng.sign(), r = Math.round(Math.sqrt(x * x + y * y));
        return { prompt: `Find the absolute value (the distance from 0 in the complex plane).${big(`|${cx(a, b)}|`)}`, type: 'number', answer: r, params: { kind: 'abs', a, b },
          hints: [`|${V('a')} + ${V('b')}${I}| = √(${V('a')}² + ${V('b')}²).`, `${wrap(a)}² + ${wrap(b)}² = ${N(x * x)} + ${N(y * y)} = ${N(x * x + y * y)}.`, `√${N(x * x + y * y)} = <b>${r}</b>.`] };
      }
      const form = rng.pick(['big', 'product', 'power']);
      let n, shown, first;
      if (form === 'big') { n = rng.int(100, 2999); shown = `${I}<sup>${n}</sup>`; first = `Only the remainder when ${N(n)} is divided by 4 matters.`; }
      else if (form === 'product') { const u = rng.int(11, 99), w = rng.int(11, 99); n = u + w; shown = `${I}<sup>${u}</sup> · ${I}<sup>${w}</sup>`; first = `Multiplying powers of the same base adds the exponents: ${I}<sup>${u} + ${w}</sup> = ${I}<sup>${n}</sup>.`; }
      else { const u = rng.int(3, 19), w = rng.int(3, 12); n = u * w; shown = `(${I}<sup>${u}</sup>)<sup>${w}</sup>`; first = `A power of a power multiplies the exponents: ${I}<sup>${u} × ${w}</sup> = ${I}<sup>${n}</sup>.`; }
      const r = n % 4, labels = ['1', I, '−1', '−' + I], answer = labels[r];
      return { prompt: `Simplify.${big(shown)}`, type: 'choice', choices: labels.slice(), keepOrder: true, answer, params: { kind: 'power', n },
        hints: [first, `${N(n)} = 4 × ${N(Math.floor(n / 4))} + ${r}, and ${I}⁴ = 1, so only ${I}<sup>${r}</sup> is left${r === 0 ? ', which is 1' : ''}.`, `<b>${answer}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'power') { let re = 1, im = 0; for (let k = 0; k < pr.n; k++) [re, im] = [-im, re]; return JSON.stringify(readCx(q.answer)) === JSON.stringify([re + 0, im + 0]); }
      if (pr.kind === 'sqrt') { const [re, im] = readCx(q.answer); return re === 0 && im * im === pr.k * pr.k && Math.sign(im) === pr.sgn; }
      if (pr.kind === 'abs') return q.answer === Math.hypot(pr.a, pr.b);
      const [re, im] = readCx(q.answer); return re === pr.a && im === pr.b;
    },
  });

  A.skill({
    id: 'alg2.complex-operations', title: 'Adding, subtracting and multiplying complex numbers',
    learn: p(`<b>To add or subtract complex numbers, combine the real parts with each other and the imaginary parts with each other</b>, the same way you combine like terms. When you subtract, the minus sign applies to both parts of the second number.`) +
      p(`<b>To multiply, use the distributive property (FOIL: first, outer, inner, last), then replace ${I}² with −1.</b> That last step turns the ${I}² term into a real number, which joins the other real part.`) +
      p(`The <b>conjugate</b> of ${V('a')} + ${V('b')}${I} is ${V('a')} − ${V('b')}${I}: the same number with the sign of the imaginary part changed. A number times its conjugate is always real: (${V('a')} + ${V('b')}${I})(${V('a')} − ${V('b')}${I}) = ${V('a')}² + ${V('b')}².`) +
      example('Example 1: subtracting', `${big(`(5 − 2${I}) − (−3 + 4${I})`)}Change both signs in the second number: 5 − 2${I} + 3 − 4${I}. Real parts 5 + 3 = 8, imaginary parts −2 − 4 = −6: <b>8 − 6${I}</b>.`) +
      example('Example 2: multiplying', `${big(`(2 + 3${I})(4 − ${I})`)}FOIL: 8 − 2${I} + 12${I} − 3${I}². Since ${I}² = −1, −3${I}² = +3. Combine: (8 + 3) + (−2 + 12)${I} = <b>11 + 10${I}</b>.`) +
      example('Example 3: times the conjugate', `${big(`(4 + 3${I})(4 − 3${I})`)}FOIL: 16 − 12${I} + 12${I} − 9${I}². The ${I} terms cancel and −9${I}² = +9, so the product is 16 + 9 = <b>25</b>.`),
    make(rng) {
      const op = rng.pick(['add', 'sub', 'mul', 'mul', 'conj']);
      const lim = op === 'add' || op === 'sub' ? 9 : 6;
      const a = rng.nz(-lim, lim), b = rng.nz(-lim, lim);
      let c = rng.nz(-lim, lim), d = rng.nz(-lim, lim);
      if (op === 'conj') { c = a; d = -b; }
      let re, im, cands, hints;
      if (op === 'add' || op === 'sub') {
        const s = op === 'add' ? 1 : -1;
        re = a + s * c; im = b + s * d;
        cands = op === 'add' ? [cx(a + c, b - d), cx(a - c, b + d), cx(a + c + b + d, 0)] : [cx(a - c, b + d), cx(a + c, b - d), cx(c - a, d - b)];
        hints = [op === 'sub' ? `Distribute the minus sign: −(${cx(c, d)}) = ${cx(-c, -d)}.` : `Group the real parts and the imaginary parts.`,
          `Real parts: ${N(a)} ${op === 'sub' ? '−' : '+'} ${wrap(c)} = ${N(re)}. Imaginary parts: ${N(b)} ${op === 'sub' ? '−' : '+'} ${wrap(d)} = ${N(im)}.`];
      } else {
        re = a * c - b * d; im = a * d + b * c;
        cands = [cx(a * c + b * d, a * d + b * c), cx(a * c, b * d), cx(a * c - b * d, a * d - b * c)];
        const wc = v => v < 0 ? `(${cx(0, v)})` : cx(0, v);
        hints = [`FOIL: ${N(a)} · ${wrap(c)} = ${N(a * c)}, ${N(a)} · ${wc(d)} = ${cx(0, a * d)}, ${cx(0, b)} · ${wrap(c)} = ${cx(0, b * c)}, and ${cx(0, b)} · ${wc(d)} = ${N(b * d)}${I}².`,
          `Replace ${I}² with −1: ${N(b * d)}${I}² = ${N(-b * d)}. Real part: ${N(a * c)} ${M.signed(-b * d)} = ${N(re)}. Imaginary part: ${N(a * d)} ${M.signed(b * c)} = ${N(im)}.`];
        if (op === 'conj') hints.push(`A number times its conjugate is always real: (${V('a')} + ${V('b')}${I})(${V('a')} − ${V('b')}${I}) = ${V('a')}² + ${V('b')}².`);
      }
      const answer = cx(re, im);
      hints.push(`The result is <b>${answer}</b>.`);
      const choices = options(answer, cands, () => cx(re + rng.pick([-2, -1, 1, 2]), im + rng.pick([-1, 0, 1])));
      const sym = op === 'add' ? '+' : op === 'sub' ? '−' : '';
      return { prompt: `${op === 'add' ? 'Add' : op === 'sub' ? 'Subtract' : 'Multiply'}. Write the answer as ${V('a')} + ${V('b')}${I}.${big(`(${cx(a, b)}) ${sym} (${cx(c, d)})`.replace(')  (', ')('))}`, type: 'choice', choices, answer, hints, params: { op, a, b, c, d } };
    },
    challenge(rng) {   // squares of complex numbers, and products with larger parts
      const sq = rng.bool();
      const a = rng.nz(-9, 9), b = rng.nz(-9, 9), c = sq ? a : rng.nz(-9, 9), d = sq ? b : rng.nz(-9, 9);
      const re = a * c - b * d, im = a * d + b * c, answer = cx(re, im);
      const cands = sq ? [cx(a * a + b * b, 2 * a * b), cx(a * a, b * b), cx(a * a - b * b, a * b)] : [cx(a * c + b * d, a * d + b * c), cx(a * c, b * d), cx(a * c - b * d, a * d - b * c)];
      const choices = options(answer, cands, () => cx(re + rng.pick([-2, -1, 1, 2]), im + rng.pick([-1, 0, 1])));
      const shown = sq ? `(${cx(a, b)})²` : `(${cx(a, b)})(${cx(c, d)})`;
      return { prompt: `Multiply. Write the answer as ${V('a')} + ${V('b')}${I}.${big(shown)}`, type: 'choice', choices, answer, params: { op: 'mul', a, b, c, d },
        hints: [sq ? `Write the square as a product, (${cx(a, b)})(${cx(a, b)}), then use FOIL.` : `Use FOIL: first, outer, inner, last.`, `The ${I}² term is ${N(b * d)}${I}², which is ${N(-b * d)} because ${I}² = −1. Real part: ${N(a * c)} ${M.signed(-b * d)} = ${N(re)}.`, `Imaginary part: ${N(a * d)} ${M.signed(b * c)} = ${N(im)}. The result is <b>${answer}</b>.`] };
    },
    verify(q) {
      const { op, a, b, c, d } = q.params;
      const [re, im] = readCx(q.answer);
      if (op === 'add') return re === a + c && im === b + d;
      if (op === 'sub') return re === a - c && im === b - d;
      // multiply as a 2 × 2 real matrix [[a, −b], [b, a]] acting on (c, d)
      return re === a * c + (-b) * d && im === b * c + a * d;
    },
  });

  /* ---------- Unit 3: Polynomial factorization ---------- */
  A.skill({
    id: 'alg2.factor-cubes', title: 'Factoring sums and differences of cubes',
    learn: p(`A <b>perfect cube</b> is a number or term that equals something multiplied by itself three times: 8 = 2³, 125 = 5³ and 27${X}³ = (3${X})³. The cubes to know are 1, 8, 27, 64, 125, 216 and 343.`) +
      p(`A sum or difference of two cubes always factors into a binomial times a trinomial: <b>${V('a')}³ + ${V('b')}³ = (${V('a')} + ${V('b')})(${V('a')}² − ${V('a')}${V('b')} + ${V('b')}²)</b> and <b>${V('a')}³ − ${V('b')}³ = (${V('a')} − ${V('b')})(${V('a')}² + ${V('a')}${V('b')} + ${V('b')}²)</b>.`) +
      p(`To remember the signs, think “same, opposite, always positive”: the binomial keeps the original sign, the middle term of the trinomial takes the opposite sign, and the last term is always +. First write each term as a cube to find ${V('a')} and ${V('b')}.`) +
      example('Example 1: a difference of cubes', `${big(P([8, 0, 0, -27]))}8${X}³ = (2${X})³ and 27 = 3³, so ${V('a')} = 2${X} and ${V('b')} = 3. Then (2${X} − 3)((2${X})² + 2${X} · 3 + 3²) = <b>(${P([2, -3])})(${P([4, 6, 9])})</b>.`) +
      example('Example 2: a sum of cubes', `${big(P([1, 0, 0, 64]))}${V('a')} = ${X} and ${V('b')} = 4, since 64 = 4³. Same sign, then opposite, then always positive: <b>(${P([1, 4])})(${P([1, -4, 16])})</b>.`),
    make(rng) {
      const m = rng.pick([1, 1, 2, 3, 4, 5]);
      let k = rng.int(1, 7);
      while (M.gcd(m, k) !== 1) k = rng.int(1, 7);
      const s = rng.sign();
      const shown = P([m ** 3, 0, 0, s * k ** 3]);
      const f = (bs, mid) => `(${P([m, bs * k])})(${P([m * m, mid, k * k])})`;
      const answer = f(s, -s * m * k);
      const cands = rng.shuffle([f(s, s * m * k), f(-s, s * m * k), f(s, -2 * s * m * k), f(s, 0)]);
      const choices = options(answer, cands, null);
      const aTxt = m === 1 ? X : `${m}${X}`;
      return { prompt: `Factor completely.${big(shown)}`, type: 'choice', choices, answer, params: { m, k, s },
        hints: [`Write both terms as cubes: ${M.term(m ** 3, 'x', 3)} = (${aTxt})³ and ${N(k ** 3)} = ${k}³. This is a ${s > 0 ? 'sum' : 'difference'} of cubes with ${V('a')} = ${aTxt}, ${V('b')} = ${k}.`,
          `Use ${V('a')}³ ${s > 0 ? '+' : '−'} ${V('b')}³ = (${V('a')} ${s > 0 ? '+' : '−'} ${V('b')})(${V('a')}² ${s > 0 ? '−' : '+'} ${V('a')}${V('b')} + ${V('b')}²).`,
          `${V('a')}² = ${M.term(m * m, 'x', 2)}, ${V('a')}${V('b')} = ${M.term(m * k, 'x', 1)}, ${V('b')}² = ${k * k}.`,
          `<b>${answer}</b>.`] };
    },
    challenge(rng) {   // a common factor to take out first, or larger cubes
      const s = rng.sign(), withG = rng.bool();
      const g = withG ? rng.pick([2, 3, 4, 5, 6]) : 1;
      const m = withG ? rng.pick([1, 1, 2, 3]) : rng.pick([3, 4, 5, 6]);
      let k = withG ? rng.int(1, 6) : rng.int(4, 10);
      while (M.gcd(m, k) !== 1 || (!withG && k === m)) k = withG ? rng.int(1, 6) : rng.int(4, 10);
      const shown = P([g * m ** 3, 0, 0, g * s * k ** 3]);
      const f = (bs, mid) => `${g > 1 ? g : ''}(${P([m, bs * k])})(${P([m * m, mid, k * k])})`;
      const answer = f(s, -s * m * k);
      const choices = options(answer, rng.shuffle([f(s, s * m * k), f(-s, s * m * k), f(s, -2 * s * m * k), f(s, 0)]), null);
      const aTxt = m === 1 ? X : `${m}${X}`;
      return { prompt: `Factor completely.${big(shown)}`, type: 'choice', choices, answer, params: { m, k, s, g },
        hints: [(g > 1 ? `First take out the common factor ${g}: ${shown} = ${g}(${P([m ** 3, 0, 0, s * k ** 3])}). ` : '') + `${M.term(m ** 3, 'x', 3)} = (${aTxt})³ and ${N(k ** 3)} = ${k}³, so this is a ${s > 0 ? 'sum' : 'difference'} of cubes.`,
          `Use ${V('a')}³ ${s > 0 ? '+' : '−'} ${V('b')}³ = (${V('a')} ${s > 0 ? '+' : '−'} ${V('b')})(${V('a')}² ${s > 0 ? '−' : '+'} ${V('a')}${V('b')} + ${V('b')}²) with ${V('a')} = ${aTxt} and ${V('b')} = ${k}.`,
          `<b>${answer}</b>.`] };
    },
    verify(q) {
      const { m, k, s } = q.params, g = q.params.g || 1;
      const lead = A.stripTags(q.answer).trim().match(/^(\d+)\s*\(/);   // a common factor written in front, as in 2(x − 3)(…)
      const f = readFactors(lead ? q.answer.trim().replace(/^\d+/, '') : q.answer), c = lead ? Number(lead[1]) : 1;
      return sameAt(t => c * f(t), t => g * (Math.pow(m * t, 3) + s * Math.pow(k, 3)));
    },
  });

  A.skill({
    id: 'alg2.factor-grouping', title: 'Factoring by grouping and quadratic forms',
    learn: p(`<b>Factoring by grouping</b> works on four terms. Split them into two pairs, take the greatest common factor (GCF) out of each pair, and look for a binomial that both pairs share. Then factor that shared binomial out. If the third term is negative, take out a negative factor so the two binomials match.`) +
      p(`A <b>quadratic form</b> is an expression like ${P([1, 0, -5, 0, 4])} that is a quadratic in disguise. Let ${V('u')} = ${X}²; then it reads ${V('u')}² − 5${V('u')} + 4, which factors as (${V('u')} − 1)(${V('u')} − 4). Put ${X}² back in place of ${V('u')} at the end: (${X}² − 1)(${X}² − 4).`) +
      example('Example 1: grouping', `${big(P([2, 5, 6, 15]))}Pair up: (2${X}³ + 5${X}²) + (6${X} + 15) = ${X}²(2${X} + 5) + 3(2${X} + 5). Both share 2${X} + 5, so the answer is <b>(${P([2, 5])})(${P([1, 0, 3])})</b>.`) +
      example('Example 2: a quadratic form', `${big(P([1, 0, 2, 0, -15]))}With ${V('u')} = ${X}², it is ${V('u')}² + 2${V('u')} − 15 = (${V('u')} + 5)(${V('u')} − 3). Replace ${V('u')}: <b>(${P([1, 0, 5])})(${P([1, 0, -3])})</b>.`),
    make(rng) {
      if (rng.chance(0.4)) {
        let u = rng.nz(-9, 9), v = rng.nz(-9, 9);
        while (v === u || u + v === 0) v = rng.nz(-9, 9);
        if (u > v) [u, v] = [v, u];
        const shown = P([1, 0, -(u + v), 0, u * v]);
        const g = (a, b) => `(${P([1, 0, a])})(${P([1, 0, b])})`;
        const answer = g(-u, -v);
        const choices = options(answer, [`(${P([1, -u])})(${P([1, -v])})`, g(u, v), g(-u, v), g(u, -v)], null);
        return { prompt: `Factor by treating the expression as a quadratic in ${X}². Give two quadratic factors.${big(shown)}`, type: 'choice', choices, answer, params: { kind: 'qform', u, v },
          hints: [`Let ${V('u')} = ${X}². Then ${X}⁴ = ${V('u')}², and the expression is ${M.poly([1, -(u + v), u * v], 'u')}.`, `Find two numbers that multiply to ${N(u * v)} and add to ${N(-(u + v))}: ${N(-u)} and ${N(-v)}. So it is (${M.poly([1, -u], 'u')})(${M.poly([1, -v], 'u')}).`, `Replace ${V('u')} with ${X}²: <b>${answer}</b>.`] };
      }
      const pp = rng.pick([1, 1, 2, 3]), r = rng.pick([1, 1, 2, 3]);
      let q = rng.nz(-6, 6); while (M.gcd(pp, q) !== 1) q = rng.nz(-6, 6);
      let s = rng.pick([1, 2, 3, 4, 5, 6, 7, 9, -2, -3, -5, -6, -7]); while (M.gcd(r, s) !== 1) s = rng.pick([1, 5, 7, -5, -7]);
      const coefs = [pp * r, q * r, pp * s, q * s];
      const g = (a, b, c, d) => `(${P([a, b])})(${P([c, 0, d])})`;
      const answer = g(pp, q, r, s);
      const cands = [g(pp, -q, r, s), g(pp, q, r, -s), pp !== r ? g(r, q, pp, s) : g(pp, s, r, q), g(pp, -q, r, -s)];
      const choices = options(answer, cands, () => g(pp, q + rng.pick([-1, 1]), r, s));
      const first = M.term(r, 'x', 2), common = P([pp, q]);
      return { prompt: `Factor by grouping.${big(P(coefs))}`, type: 'choice', choices, answer, params: { kind: 'group', coefs },
        hints: [`Group the first two terms and the last two terms: (${P([coefs[0], coefs[1], 0, 0])}) + (${P([coefs[2], coefs[3]])}).`, `Take out each pair's common factor: ${first}(${common}) ${s < 0 ? '−' : '+'} ${N(Math.abs(s))}(${common}).`, `Both groups share (${common}), so factor it out: (${common})(${P([r, 0, s])}).`, `<b>${answer}</b>.`] };
    },
    challenge(rng) {   // a quadratic form that keeps factoring: differences of squares inside
      const four = rng.bool();
      let [p, q] = rng.sample([1, 2, 3, 4, 5, 6], 2);
      if (four && p > q) [p, q] = [q, p];
      const u = p * p, v = four ? q * q : -q * q;
      const lin = r => `(${P([1, -r])})(${P([1, r])})`, sq = c => `(${P([1, 0, c])})`;
      const answer = four ? lin(p) + lin(q) : lin(p) + sq(q * q);
      const cands = four ? [sq(-u) + sq(-v), `${M.sup(`(${P([1, -p])})`, 2)}${M.sup(`(${P([1, q])})`, 2)}`, lin(p) + sq(q * q), lin(u) + lin(q * q)]
        : [sq(-u) + sq(q * q), lin(p) + lin(q), lin(q) + sq(p * p), lin(p) + sq(-q * q)];
      const choices = options(answer, cands, null);
      const shown = P([1, 0, -(u + v), 0, u * v]);
      return { prompt: `Factor completely over the integers.${big(shown)}`, type: 'choice', choices, answer, params: { kind: 'qform', u, v },
        hints: [`Let ${V('u')} = ${X}²: ${M.poly([1, -(u + v), u * v], 'u')} = (${M.poly([1, -u], 'u')})(${M.poly([1, -v], 'u')}), so the expression is ${sq(-u)}${sq(-v)}.`,
          `“Completely” means keep going. ${X}² − ${u} is a difference of squares, (${P([1, -p])})(${P([1, p])})${four ? `, and so is ${X}² − ${q * q}` : `, but ${X}² + ${q * q} is a sum of squares, which doesn't factor over the integers`}.`,
          `<b>${answer}</b>.`] };
    },
    verify(q) {
      const pr = q.params, f = readFactors(q.answer);
      if (pr.kind === 'qform') return sameAt(f, t => (t * t - pr.u) * (t * t - pr.v));
      return sameAt(f, t => horner(pr.coefs, t));
    },
  });

  /* ---------- Unit 4: Polynomial division ---------- */
  A.skill({
    id: 'alg2.divide-polynomials', title: 'Dividing polynomials by x − a',
    learn: p(`<b>Long division</b> of polynomials works like long division of numbers: divide the leading terms, multiply, subtract, bring down the next term, and repeat. The <b>quotient</b> is the answer on top. The <b>remainder</b> is what's left at the end, and its degree is lower than the divisor's.`) +
      p(`<b>Synthetic division</b> is a shortcut for dividing by ${X} − ${V('a')}. Write ${V('a')} and the coefficients of the dividend, using 0 for any missing power. Bring the first coefficient down. Then repeat: multiply by ${V('a')}, write the result under the next coefficient, and add.`) +
      p(`The last number in the bottom row is the remainder. The others are the coefficients of the quotient, whose degree is one less than the dividend's. Watch the sign: dividing by ${X} + 3 means ${V('a')} = −3.`) +
      example('Example 1: synthetic division', `${big(`(${P([1, -2, -5, 8])}) ÷ (${P([1, -3])})`)}Use 3 with the coefficients 1, −2, −5, 8. Bring down 1; 1 · 3 = 3, −2 + 3 = 1; 1 · 3 = 3, −5 + 3 = −2; −2 · 3 = −6, 8 − 6 = 2. Quotient <b>${P([1, 1, -2])}</b>, <b>remainder 2</b>.`) +
      example('Example 2: long division', `${big(`(${P([2, 3, -4, 1])}) ÷ (${P([1, 2])})`)}2${X}³ ÷ ${X} = 2${X}²; subtract 2${X}²(${X} + 2) to leave −${X}² − 4${X} + 1. Next −${X}² ÷ ${X} = −${X}; subtract −${X}(${X} + 2) to leave −2${X} + 1. Last −2${X} ÷ ${X} = −2; subtract −2(${X} + 2) to leave 5. Quotient <b>${P([2, -1, -2])}</b>, <b>remainder 5</b>.`),
    make(rng) {
      const kind = rng.pick(['long', 'synthetic']);
      const Q = [rng.pick([1, 1, 2, 3, -1]), rng.nz(-6, 6), rng.nz(-6, 6)];
      const r = rng.nz(-5, 5), R = rng.chance(0.35) ? 0 : rng.nz(-9, 9);
      const D = pmul(Q, [1, -r]); D[D.length - 1] += R;
      const fmt = (qq, rr) => `${P(qq)}, remainder ${N(rr)}`;
      const answer = fmt(Q, R);
      const [wq, wr] = synth(D, -r);
      const cands = [fmt(wq, wr), fmt(Q, -R || D[D.length - 1]), fmt(Q.map((c, i) => i === 1 ? -c : c), R), fmt(Q.concat(0), R)];
      const choices = options(answer, cands, () => fmt(Q.map((c, i) => i === 2 ? c + rng.pick([-2, -1, 1, 2]) : c), R));
      const div = P([1, -r]);
      let hints;
      if (kind === 'synthetic') {
        const [qq, rr] = synth(D, r), row = qq.concat(rr);
        hints = [`The divisor is ${div}, so use ${V('a')} = ${N(r)}. Write the coefficients: ${D.map(N).join(', ')}.`,
          `Bring down ${N(D[0])}. Then multiply by ${N(r)} and add, column by column: the bottom row is ${row.map(N).join(', ')}.`,
          `The last number, ${N(rr)}, is the remainder. The others, ${qq.map(N).join(', ')}, are the coefficients of a quadratic: ${P(qq)}.`,
          `<b>${answer}</b>.`];
      } else {
        const cur = D.slice(), steps = [];
        for (let i = 0; i < 3; i++) {
          const t = cur[i], pw = 2 - i;
          cur[i] = 0; cur[i + 1] += t * r;
          steps.push(`${M.term(cur[i] + t, 'x', 3 - i)} ÷ ${X} = ${M.term(t, pw ? 'x' : '', pw)}. Multiply ${M.term(t, pw ? 'x' : '', pw)}(${div}) and subtract; what is left is ${P(cur.slice(i + 1))}.`);
        }
        hints = ['Divide the leading terms: ' + steps[0], 'Repeat with what is left: ' + steps[1] + ' ' + steps[2], `The quotient collects the terms you wrote on top: ${P(Q)}. The last leftover, ${N(R)}, is the remainder.`, `<b>${answer}</b>.`];
      }
      return { prompt: `Divide using ${kind === 'long' ? 'long' : 'synthetic'} division.${big(`(${P(D)}) ÷ (${div})`)}`, type: 'choice', choices, answer, hints, params: { kind, D, r } };
    },
    challenge(rng) {   // a fourth-degree dividend with a missing power
      const r = rng.nz(-3, 3), gap = rng.int(1, 3);
      const D = [rng.pick([1, 2, -1, 3]), rng.int(-6, 6), rng.int(-6, 6), rng.int(-6, 6), rng.int(-9, 9)];
      D[gap] = 0;
      const fmt = (qq, rr) => `${P(qq)}, remainder ${N(rr)}`;
      const [Q, R] = synth(D, r), answer = fmt(Q, R);
      const [wq, wr] = synth(D.filter((c, i) => i !== gap), r), [sq_, sr] = synth(D, -r);
      const choices = options(answer, [fmt(wq, wr), fmt(sq_, sr), fmt(Q, R ? -R : 1), fmt(Q.map((c, i) => i === 1 ? -c : c), R)], () => fmt(Q.map((c, i) => i === 3 ? c + rng.pick([-2, -1, 1, 2]) : c), R));
      const div = P([1, -r]), row = Q.concat(R);
      return { prompt: `Divide. Watch for the missing power of ${X}.${big(`(${P(D)}) ÷ (${div})`)}`, type: 'choice', choices, answer, params: { kind: 'synthetic', D, r },
        hints: [`Use ${V('a')} = ${N(r)}, and write a 0 for the missing ${gap === 3 ? X : M.sup(X, 4 - gap)} term: ${D.map(N).join(', ')}.`, `Bring down ${N(D[0])}, then multiply by ${N(r)} and add, column by column: the bottom row is ${row.map(N).join(', ')}.`, `The last number is the remainder, and the others are the coefficients of a cubic: <b>${answer}</b>.`] };
    },
    verify(q) {
      const { D, r } = q.params;
      const [qs, rs] = q.answer.split(', remainder ');
      const f = readPoly(qs), R = A.parseNumber(A.stripTags(rs));
      return sameAt(t => f(t) * (t - r) + R, t => horner(D, t));
    },
  });

  A.skill({
    id: 'alg2.remainder-theorem', title: 'The remainder theorem',
    learn: p(`<b>The remainder theorem: when a polynomial ${fx('p', X)} is divided by ${X} − ${V('a')}, the remainder is ${fx('p', V('a'))}.</b> So you can find a remainder without dividing at all: substitute ${V('a')} for ${X}. Watch the sign: dividing by ${X} + 2 means ${V('a')} = −2.`) +
      p(`A special case is the <b>factor theorem</b>: ${X} − ${V('a')} is a <b>factor</b> of ${fx('p', X)}, meaning it divides ${fx('p', X)} with remainder 0, exactly when ${fx('p', V('a'))} = 0.`) +
      p(`Both theorems work backwards too. If you know the remainder, substituting ${V('a')} gives an equation you can solve for an unknown coefficient.`) +
      example('Example 1: finding a remainder', `${big(`${fx('p', X)} = ${P([2, 0, -3, 5])}, divided by ${P([1, 2])}`)}${V('a')} = −2: ${fx('p', '−2')} = 2(−8) − 3(−2) + 5 = −16 + 6 + 5 = <b>−5</b>, so the remainder is −5.`) +
      example('Example 2: a factor', `${big(`${P([1, -2])} is a factor of ${X}³ + ${V('k')}${X} − 6. Find ${V('k')}.`)}A factor leaves remainder 0, so ${fx('p', 2)} = 0: 8 + 2${V('k')} − 6 = 0, so 2${V('k')} = −2 and <b>${V('k')} = −1</b>.`) +
      example('Example 3: a given remainder', `${big(`${X}³ − ${X}² + ${V('k')}${X} + 4 leaves remainder 10 when divided by ${P([1, 1])}`)}${V('a')} = −1: −1 − 1 − ${V('k')} + 4 = 10, so 2 − ${V('k')} = 10 and <b>${V('k')} = −8</b>.`),
    make(rng) {
      const kind = rng.pick(['eval', 'eval', 'factor', 'rem-k']);
      const a = rng.nz(-4, 4);
      if (kind === 'eval') {
        const c = [rng.pick([1, 2, -1, 3]), rng.int(-5, 5), rng.int(-6, 6), rng.int(-9, 9)];
        const terms = c.map((k, i) => k * Math.pow(a, 3 - i));
        const ans = terms.reduce((s, t) => s + t, 0);
        return { prompt: `What is the remainder when ${fx('p', X)} is divided by ${P([1, -a])}?${big(`${fx('p', X)} = ${P(c)}`)}`, type: 'number', answer: ans, params: { kind, c, a },
          hints: [`By the remainder theorem the remainder is ${fx('p', N(a))}: ${P([1, -a])} = ${X} − ${wrap(a)}.`, `Substitute ${N(a)} term by term: ${c.slice(0, 3).map((k, i) => `${N(k)}·${wrap(a)}<sup>${3 - i}</sup> = ${N(terms[i])}`).join(', ')}, and the constant is ${N(c[3])}.`, `Add them: ${terms.map(wrap).join(' + ')} = ${N(ans)}.`, `The remainder is <b>${N(ans)}</b>.`] };
      }
      const b = rng.int(-5, 5), k = rng.int(-9, 9);
      const R = kind === 'factor' ? 0 : rng.nz(-9, 9);
      const d = R - (a ** 3 + b * a * a + k * a);
      const shown = `${P([1, b, 0, 0])} + ${V('k')}${X} ${M.signed(d)}`;
      const cond = kind === 'factor' ? `${P([1, -a])} is a factor of ${fx('p', X)}` : `the remainder is ${N(R)} when ${fx('p', X)} is divided by ${P([1, -a])}`;
      return { prompt: `Find ${V('k')} if ${cond}.${big(`${fx('p', X)} = ${shown}`)}`, type: 'number', answer: k, params: { kind, a, b, d, R },
        hints: [`The remainder theorem says ${fx('p', N(a))} = ${N(R)}${kind === 'factor' ? ' (a factor leaves remainder 0)' : ''}.`, `Substitute ${N(a)}: ${wrap(a)}³ ${b ? `${M.signed(b)}·${wrap(a)}² ` : ''}+ ${V('k')}·${wrap(a)} ${M.signed(d)} = ${N(R)}, which is ${N(a ** 3 + b * a * a + d)} ${a < 0 ? '−' : '+'} ${Math.abs(a) === 1 ? '' : N(Math.abs(a))}${V('k')} = ${N(R)}.`, `${M.term(a, 'k')} = ${N(R - (a ** 3 + b * a * a + d))}, so <b>${V('k')} = ${N(k)}</b>.`] };
    },
    challenge(rng) {   // a fourth- or fifth-degree polynomial, or an unknown coefficient with a larger divisor
      const a = rng.pick([-3, -2, 2, 3]);
      const sum = ts => ts.map((t, i) => (i === 0 ? N(t) : `${t < 0 ? '−' : '+'} ${N(Math.abs(t))}`)).join(' ');
      if (rng.chance(0.6)) {
        const deg = rng.pick([4, 5]), c = [rng.pick([1, 2, -1])];
        for (let i = 1; i <= deg; i++) c.push(rng.chance(0.3) ? 0 : rng.int(-6, 6));
        const terms = c.map((k, i) => k * Math.pow(a, deg - i)), ans = terms.reduce((s, t) => s + t, 0);
        return { prompt: `What is the remainder when ${fx('p', X)} is divided by ${P([1, -a])}?${big(`${fx('p', X)} = ${P(c)}`)}`, type: 'number', answer: ans, params: { kind: 'eval', c, a },
          hints: [`By the remainder theorem the remainder is ${fx('p', N(a))}, since ${P([1, -a])} = ${X} − ${wrap(a)}.`, `Substitute ${N(a)} term by term: ${sum(terms.filter((t, i) => c[i]))}.`, `The remainder is <b>${N(ans)}</b>.`] };
      }
      const b = rng.int(-4, 4), k = rng.int(-9, 9), R = rng.int(-20, 20);
      const d = R - (a ** 3 + b * a * a + k * a);
      const shown = `${P([1, b, 0, 0])} + ${V('k')}${X}${d ? ' ' + M.signed(d) : ''}`;
      const cond = R === 0 ? `${P([1, -a])} is a factor of ${fx('p', X)}` : `the remainder is ${N(R)} when ${fx('p', X)} is divided by ${P([1, -a])}`;
      return { prompt: `Find ${V('k')} if ${cond}.${big(`${fx('p', X)} = ${shown}`)}`, type: 'number', answer: k, params: { kind: 'rem-k', a, b, d, R },
        hints: [`The remainder theorem says ${fx('p', N(a))} = ${N(R)}.`, `Substitute ${N(a)}: ${sum([a ** 3, b * a * a, d].filter(t => t))} ${a < 0 ? '−' : '+'} ${Math.abs(a)}${V('k')} = ${N(R)}, so ${N(a ** 3 + b * a * a + d)} ${a < 0 ? '−' : '+'} ${Math.abs(a)}${V('k')} = ${N(R)}.`, `${M.term(a, 'k')} = ${N(R - (a ** 3 + b * a * a + d))}, so <b>${V('k')} = ${N(k)}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'eval') return synth(pr.c, pr.a)[1] === q.answer;
      return synth([1, pr.b, q.answer, pr.d], pr.a)[1] === pr.R;
    },
  });

  /* ---------- Unit 5: Polynomial graphs ---------- */
  const facTxt = (r, m) => { const base = r === 0 ? X : `(${P([1, -r])})`; return m > 1 ? M.sup(base, m) : base; };
  const leadTxt = c => c === 1 ? '' : c === -1 ? '−' : N(c);
  const expand = (lead, roots, mults, extra) => {
    let c = [lead];
    roots.forEach((r, i) => { for (let k = 0; k < mults[i]; k++) c = pmul(c, [1, -r]); });
    if (extra) c = pmul(c, [1, 0, extra]);
    return c;
  };
  const multOf = (coefs, r) => { let c = coefs, m = 0; while (c.length > 1) { const [qq, rem] = synth(c, r); if (rem !== 0) break; c = qq; m++; } return m; };
  const BEHAVE = ['It crosses the x-axis.', 'It touches the x-axis and turns around.', 'It crosses the x-axis and flattens out there.'];
  const behaveOf = m => m === 1 ? 0 : m % 2 === 0 ? 1 : 2;

  A.skill({
    id: 'alg2.zeros-multiplicity', title: 'Zeros of polynomials and their multiplicity',
    learn: p(`A <b>zero</b> of ${V('f')} is an ${X}-value where ${fx('f', X)} = 0, which is where the graph meets the ${X}-axis. In factored form you can read the zeros straight off: ${fx('f', X)} = (${X} − 2)(${X} + 5) is zero at ${X} = 2 and ${X} = −5.`) +
      p(`A factor that appears ${V('m')} times gives a zero of <b>multiplicity</b> ${V('m')}: in (${X} − 1)³ the zero 1 has multiplicity 3. <b>Odd multiplicity: the graph crosses the ${X}-axis. Even multiplicity: it touches the axis and turns back.</b> With multiplicity 3 or more, the graph also flattens out as it crosses.`) +
      p(`A factor like ${X}² + 4 has no real zeros, because ${X}² + 4 is always positive. The <b>degree</b> of ${V('f')} is its highest power of ${X} once it's multiplied out: add the exponents of all the factors, counting 2 for each quadratic factor.`) +
      example('Example 1: reading the zeros', `${big(`${fx('f', X)} = ${X}(${X} − 3)²(${X} + 1)`)}Zeros 0 (multiplicity 1, crosses), 3 (multiplicity 2, touches) and −1 (multiplicity 1, crosses). The degree is 1 + 2 + 1 = <b>4</b>.`) +
      example('Example 2: a factor with no real zeros', `${big(`${fx('f', X)} = (${X} + 2)³(${X}² + 9)`)}The only real zero is −2, with multiplicity 3, so the graph crosses and flattens there. ${X}² + 9 is never zero. So ${V('f')} has <b>1 distinct real zero</b>, and its degree is 3 + 2 = <b>5</b>.`),
    make(rng) {
      const kind = rng.pick(['mult', 'behave', 'behave', 'count', 'degree']);
      const roots = rng.sample([-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6], 3).sort((u, v) => (u === 0 ? -1 : 0) - (v === 0 ? -1 : 0));
      const mults = [rng.pick([1, 2, 3]), rng.pick([1, 2, 2, 3]), rng.pick([1, 1, 2, 4])];
      const lead = rng.pick([1, 1, 2, -1, -3]);
      const extra = (kind === 'count' || kind === 'degree') && rng.bool() ? rng.pick([1, 4, 9, 2]) : 0;
      const shown = `${fx('f', X)} = ${leadTxt(lead)}${roots.map((r, i) => facTxt(r, mults[i])).join('')}${extra ? `(${P([1, 0, extra])})` : ''}`;
      const j = rng.int(0, 2), r = roots[j], m = mults[j];
      const read = `The factor ${facTxt(r, 1)} appears with exponent ${m}${r === 0 ? ` (${X} is ${X} − 0)` : ''}, so ${X} = ${N(r)} is a zero of multiplicity ${m}.`;
      const params = { kind, roots, mults, lead, extra, r };
      if (kind === 'mult') return { prompt: `What is the multiplicity of the zero ${X} = ${N(r)}?${big(shown)}`, type: 'number', answer: m, params, hints: [`Find the factor that is zero when ${X} = ${N(r)}: it is ${facTxt(r, 1)}.`, read, `The multiplicity is <b>${m}</b>.`] };
      if (kind === 'behave') {
        const answer = BEHAVE[behaveOf(m)];
        return { prompt: `What does the graph of ${V('f')} do at ${X} = ${N(r)}?${big(shown)}`, type: 'choice', choices: BEHAVE.slice(), keepOrder: true, answer, params,
          hints: [read, m === 1 ? `Multiplicity 1 is odd, so the sign of ${V('f')} changes there and the graph passes straight through.` : m % 2 === 0 ? `${m} is even, so ${facTxt(r, m)} never goes negative: the sign of ${V('f')} does not change and the graph bounces off the axis.` : `${m} is odd, so the graph crosses; because the multiplicity is more than 1 it flattens out as it crosses.`, `<b>${answer}</b>`] };
      }
      if (kind === 'count') {
        return { prompt: `How many distinct real zeros does ${V('f')} have?${big(shown)}`, type: 'number', answer: 3, params,
          hints: [`Each linear factor gives one zero, however many times it is repeated: ${roots.map(N).join(', ')}.`, extra ? `${P([1, 0, extra])} is always at least ${extra}, so it is never zero and adds no real zeros.` : 'There are no other factors.', `There are <b>3</b> distinct real zeros.`] };
      }
      const deg = mults.reduce((s, k) => s + k, 0) + (extra ? 2 : 0);
      return { prompt: `What is the degree of ${V('f')}?${big(shown)}`, type: 'number', answer: deg, params,
        hints: [`The degree of a product is the sum of the degrees of the factors.`, `Add the exponents: ${mults.join(' + ')}${extra ? ' + 2 (for the quadratic factor)' : ''} = ${deg}.`, `The degree is <b>${deg}</b>.`] };
    },
    challenge(rng) {   // a difference of squares hides a repeated factor
      const r = rng.int(1, 6), sg = rng.sign(), j = rng.pick([1, 2]);
      let s = rng.pick([0, 0, rng.int(-6, 6)]); if (s === r || s === -r) s = 0;
      const m0 = rng.pick([1, 2, 3]), lead = rng.pick([1, 1, 2, -1, -3]);
      const roots = [s, sg * r, -sg * r], mults = [m0, 1 + j, 1];
      const shown = `${fx('f', X)} = ${leadTxt(lead)}${facTxt(s, m0)}(${P([1, 0, -r * r])})${facTxt(sg * r, j)}`;
      const kind = rng.pick(['mult', 'mult', 'behave', 'degree', 'count']);
      const ask = kind === 'mult' || kind === 'behave' ? rng.pick([1, 1, 2, 0]) : 1, z = roots[ask], m = mults[ask];
      const split = `${X}² − ${r * r} is a difference of squares: (${P([1, -r])})(${P([1, r])}). So ${facTxt(sg * r, 1)} appears ${1 + j} times in all, ${facTxt(-sg * r, 1)} appears once, and ${facTxt(s, 1)} appears ${m0 === 1 ? 'once' : m0 + ' times'}.`;
      const params = { kind, roots, mults, lead, extra: 0, r: z };
      if (kind === 'mult') return { prompt: `What is the multiplicity of the zero ${X} = ${N(z)}?${big(shown)}`, type: 'number', answer: m, params, hints: [`Break every factor into linear factors first.`, split, `The multiplicity of ${N(z)} is <b>${m}</b>.`] };
      if (kind === 'behave') {
        const answer = BEHAVE[behaveOf(m)];
        return { prompt: `What does the graph of ${V('f')} do at ${X} = ${N(z)}?${big(shown)}`, type: 'choice', choices: BEHAVE.slice(), keepOrder: true, answer, params, hints: [split, `The zero ${N(z)} has multiplicity ${m}, which is ${m % 2 ? 'odd' : 'even'}${m > 1 && m % 2 ? ' and more than 1' : ''}.`, `<b>${answer}</b>`] };
      }
      if (kind === 'count') return { prompt: `How many distinct real zeros does ${V('f')} have?${big(shown)}`, type: 'number', answer: 3, params, hints: [split, `The different zeros are ${roots.map(N).join(', ')}.`, `There are <b>3</b> distinct real zeros.`] };
      const deg = m0 + 2 + j;
      return { prompt: `What is the degree of ${V('f')}?${big(shown)}`, type: 'number', answer: deg, params, hints: [`The degree of a product is the sum of the degrees of its factors.`, `${m0} + 2 + ${j}, counting 2 for the quadratic factor.`, `The degree is <b>${deg}</b>.`] };
    },
    verify(q) {
      const pr = q.params, c = expand(pr.lead, pr.roots, pr.mults, pr.extra);
      if (pr.kind === 'mult') return q.answer === multOf(c, pr.r);
      if (pr.kind === 'behave') return q.answer === BEHAVE[behaveOf(multOf(c, pr.r))];
      if (pr.kind === 'count') { let n = 0; for (let t = -10; t <= 10; t++) if (horner(c, t) === 0) n++; return q.answer === n; }
      return q.answer === c.length - 1;
    },
  });

  const ENDS = ['−∞', '∞'];
  const endLabel = (l, r) => `As ${X} → −∞, ${fx('f', X)} → ${ENDS[l]}; as ${X} → ∞, ${fx('f', X)} → ${ENDS[r]}.`;
  const END_CHOICES = [endLabel(1, 1), endLabel(0, 0), endLabel(0, 1), endLabel(1, 0)];
  const joinTerms = list => list.map(([c, pw], i) => { const t = M.term(Math.abs(c), pw ? 'x' : '', pw); return i === 0 ? (c < 0 ? '−' : '') + t : (c < 0 ? ' − ' : ' + ') + t; }).join('');

  A.skill({
    id: 'alg2.end-behavior', title: 'End behavior of polynomials',
    learn: p(`The <b>end behavior</b> of a graph is where it heads at the far left and far right, as ${X} → −∞ and ${X} → ∞. Far from the origin, the <b>leading term</b> (the term with the highest power of ${X}) is so much bigger than the others that it alone decides this.`) +
      p(`<b>Even degree: both ends go the same way, up if the leading coefficient is positive and down if it's negative. Odd degree: the ends go opposite ways, rising to the right if the leading coefficient is positive and falling to the right if it's negative.</b>`) +
      p(`The leading term isn't always written first. In factored form, multiply the leading part of each factor: in (3 − ${X})(${X} + 1)², the leading term is (−${X})(${X}²) = −${X}³. Take care with a factor written in reverse order, such as 3 − ${X}, because its ${X}-term is negative.`) +
      example('Example 1: terms out of order', `${big(`${fx('f', X)} = 4 + 2${X} − 3${X}⁴`)}The leading term is −3${X}⁴: even degree, negative coefficient, so both ends go down. <b>As ${X} → −∞, ${fx('f', X)} → −∞; as ${X} → ∞, ${fx('f', X)} → −∞.</b>`) +
      example('Example 2: factored form', `${big(`${fx('f', X)} = −(${X} + 2)²(5 − ${X})`)}Multiply the leading parts: −1 · ${X}² · (−${X}) = ${X}³. Odd degree, positive coefficient, so it falls on the left and rises on the right. <b>As ${X} → −∞, ${fx('f', X)} → −∞; as ${X} → ∞, ${fx('f', X)} → ∞.</b>`),
    make(rng) {
      if (rng.chance(0.4)) {
        const roots = rng.sample([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], 3);
        const mults = [rng.pick([1, 2]), rng.pick([1, 2, 3]), 1];
        const back = rng.bool(), lead = rng.pick([1, 2, -1, -2, 3]);
        const facs = roots.map((r, i) => i === 2 && back ? (mults[i] > 1 ? M.sup(`(${N(r)} − ${X})`, mults[i]) : `(${N(r)} − ${X})`) : facTxt(r, mults[i]));
        const deg = mults[0] + mults[1] + mults[2];
        const sign = lead * (back ? -1 : 1);
        const rEnd = sign > 0 ? 1 : 0, lEnd = (deg % 2 === 0) === (sign > 0) ? 1 : 0;
        const answer = endLabel(lEnd, rEnd);
        return { prompt: `Describe the end behavior of ${V('f')}.${big(`${fx('f', X)} = ${leadTxt(lead)}${facs.join('')}`)}`, type: 'choice', choices: END_CHOICES.slice(), keepOrder: true, answer, params: { kind: 'factored', roots, mults, lead, back },
          hints: [`Multiply the leading part of each factor: ${N(lead)} · ${mults.map((m, i) => (i === 2 && back ? '(−' + X + ')' : X) + (m > 1 ? `<sup>${m}</sup>` : '')).join(' · ')}.`, `The leading term is ${M.term(sign, 'x', deg)}: degree ${deg} (${deg % 2 ? 'odd' : 'even'}), coefficient ${sign > 0 ? 'positive' : 'negative'}.`, `<b>${answer}</b>`] };
      }
      const deg = rng.int(2, 7), lead = rng.nz(-6, 6);
      const list = [[lead, deg]];
      [deg - 1, deg - 2, 1, 0].filter((pw, i, a) => pw >= 0 && pw < deg && a.indexOf(pw) === i).forEach(pw => { if (rng.chance(0.6)) list.push([rng.nz(-9, 9), pw]); });
      const order = rng.pick(['std', 'rev', 'mix']);
      let shownList = list.slice();
      if (order === 'rev') shownList.reverse(); else if (order === 'mix') shownList = rng.shuffle(shownList);
      const rEnd = lead > 0 ? 1 : 0, lEnd = (deg % 2 === 0) === (lead > 0) ? 1 : 0;
      const answer = endLabel(lEnd, rEnd);
      return { prompt: `Describe the end behavior of ${V('f')}.${big(`${fx('f', X)} = ${joinTerms(shownList)}`)}`, type: 'choice', choices: END_CHOICES.slice(), keepOrder: true, answer, params: { kind: 'std', list },
        hints: [`Find the term with the highest power of ${X}: ${M.term(lead, 'x', deg)}.`, `Degree ${deg} is ${deg % 2 ? 'odd, so the two ends go opposite ways' : 'even, so both ends go the same way'}; the leading coefficient ${N(lead)} is ${lead > 0 ? 'positive' : 'negative'}, so the right end goes ${lead > 0 ? 'up' : 'down'}.`, `<b>${answer}</b>`] };
    },
    challenge(rng) {   // several factors, some written backwards and some raised to powers
      const facs = [];
      for (let i = rng.int(2, 3); i > 0; i--) facs.push([rng.pick([1, 2, 3, -1, -2]), rng.nz(-6, 6), rng.pick([1, 1, 2, 3])]);
      if (rng.bool()) facs.unshift([1, 0, rng.int(1, 3)]);
      const lead = rng.pick([1, -1, 2, -2, 3, -4]);
      const show = ([c, d, p]) => { const base = d === 0 ? X : c < 0 ? `(${N(d)} − ${M.term(-c, 'x')})` : `(${P([c, d])})`; return p > 1 ? M.sup(base, p) : base; };
      const lc = facs.reduce((acc, [c, , p]) => acc * Math.pow(c, p), lead), deg = facs.reduce((acc, f) => acc + f[2], 0);
      const rEnd = lc > 0 ? 1 : 0, lEnd = (deg % 2 === 0) === (lc > 0) ? 1 : 0, answer = endLabel(lEnd, rEnd);
      const parts = facs.map(([c, , p]) => (c === 1 ? X : `(${M.term(c, 'x')})`) + (p > 1 ? `<sup>${p}</sup>` : ''));
      return { prompt: `Describe the end behavior of ${V('f')}.${big(`${fx('f', X)} = ${leadTxt(lead)}${facs.map(show).join('')}`)}`, type: 'choice', choices: END_CHOICES.slice(), keepOrder: true, answer, params: { kind: 'gen', lead, facs },
        hints: [`Multiply the leading part of each factor, minding the signs of factors written backwards: ${N(lead)} · ${parts.join(' · ')}.`, `The leading term is ${M.term(lc, 'x', deg)}: degree ${deg} (${deg % 2 ? 'odd' : 'even'}), coefficient ${lc > 0 ? 'positive' : 'negative'}.`, `<b>${answer}</b>`] };
    },
    verify(q) {
      const pr = q.params;
      const f = pr.kind === 'std' ? t => pr.list.reduce((s, [c, pw]) => s + c * Math.pow(t, pw), 0)
        : pr.kind === 'gen' ? t => pr.lead * pr.facs.reduce((s, [c, d, p]) => s * Math.pow(c * t + d, p), 1)
        : t => pr.lead * pr.roots.reduce((s, r, i) => s * Math.pow(i === 2 && pr.back ? r - t : t - r, pr.mults[i]), 1);
      return q.answer === endLabel(f(-1e4) > 0 ? 1 : 0, f(1e4) > 0 ? 1 : 0);
    },
  });

  /* ---------- Unit 6: Rational exponents and radicals ---------- */
  A.skill({
    id: 'alg2.rational-exponents', title: 'Rational exponents and simplifying radicals',
    learn: p(`<b>A fractional exponent is a root: ${V('a')}<sup>1/${V('n')}</sup> = ${root('<i>n</i>', V('a'))}, and ${V('a')}<sup>${V('m')}/${V('n')}</sup> = ${root('<i>n</i>', `${V('a')}<sup><i>m</i></sup>`)} = (${root('<i>n</i>', V('a'))})<sup><i>m</i></sup>.</b> The denominator ${V('n')} is the <b>index</b> of the root (2 for a square root, 3 for a cube root), and the numerator ${V('m')} is the power. A negative exponent means take the reciprocal: ${V('a')}<sup>−${V('k')}</sup> = 1/${V('a')}<sup>${V('k')}</sup>.`) +
      p(`To evaluate, take the root first, while the number is still small: 8<sup>2/3</sup> = (∛8)² = 2² = 4.`) +
      p(`<b>To simplify a square root, pull out the largest perfect-square factor:</b> √72 = √(36 · 2) = 6√2. Using a smaller square, such as √72 = √(4 · 18) = 2√18, leaves a square factor inside, so it isn't finished.`) +
      example('Example 1: evaluating', `${big(`16<sup>−3/4</sup>`)}The fourth root of 16 is 2, and 2³ = 8. The negative exponent flips it: <b>${F(1, 8)}</b>.`) +
      example('Example 2: exponent to radical and back', `${big(`${X}<sup>3/5</sup> and ${root(3, M.sup(X, 4))}`)}In ${X}<sup>3/5</sup> the 5 becomes the index and the 3 stays as the power: <b>${root(5, M.sup(X, 3))}</b>. Going the other way, the index 3 becomes the denominator: ${root(3, M.sup(X, 4))} = <b>${X}<sup>4/3</sup></b>.`) +
      example('Example 3: simplifying a root', `${big(M.sqrt(200))}The largest square that divides 200 is 100: √200 = √100 · √2 = <b>10√2</b>.`),
    make(rng) {
      const kind = rng.pick(['eval', 'eval', 'to-root', 'to-exp', 'simplify']);
      if (kind === 'eval') {
        const q = rng.pick([2, 2, 3, 3, 4, 5]);
        const k = q === 2 ? rng.int(2, 10) : q === 3 ? rng.int(2, 5) : rng.int(2, 3);
        let pw = rng.pick(q === 2 ? [1, 3] : q === 3 ? [1, 2] : q === 5 ? [1, 2] : [1, 3]);
        if (q === 2 && k > 5) pw = 1;
        const neg = rng.chance(0.3), base = k ** q, val = k ** pw;
        const ans = neg ? 1 / val : val;
        const shown = `${N(base)}<sup>${neg ? '−' : ''}${pw === 1 ? 1 : pw}/${q}</sup>`;
        return { prompt: `Evaluate.${neg ? ' Give a fraction.' : ''}${big(shown)}`, type: 'number', answer: ans, answerText: neg ? M.fracText(1, val) : undefined, params: { kind, base, pw, q, neg },
          hints: [`The denominator ${q} means a ${['', '', 'square', 'cube', 'fourth', 'fifth'][q]} root: ${root(q, N(base))} = ${k}, because ${k}<sup>${q}</sup> = ${N(base)}.`, pw > 1 ? `The numerator ${pw} is a power: ${k}<sup>${pw}</sup> = ${N(val)}.` : `The numerator is 1, so there is no further power.`].concat(neg ? [`The negative exponent means the reciprocal: 1 ÷ ${N(val)}.`] : []).concat([`<b>${neg ? M.fracText(1, val) : N(val)}</b>.`]) };
      }
      if (kind === 'to-root' || kind === 'to-exp') {
        let m = rng.int(2, 5), n = rng.int(2, 5);
        while (m === n || M.gcd(m, n) !== 1) { m = rng.int(2, 5); n = rng.int(2, 5); }
        const rad = (a, b) => root(b, M.sup(X, a));
        const ex = e => M.sup(X, e);
        if (kind === 'to-root') {
          const answer = rad(m, n);
          return { prompt: `Which radical is equal to this power?${big(ex(`${m}/${n}`))}`, type: 'choice', choices: [answer, rad(n, m), `${m}${root(n, X)}`, rad(m * n, n)], answer, params: { kind, m, n },
            hints: [`In ${X}<sup>${V('m')}/${V('n')}</sup>, the denominator ${V('n')} is the index of the root and the numerator ${V('m')} is the power.`, `Here the denominator is ${n} and the numerator is ${m}.`, `<b>${X}<sup>${m}/${n}</sup> = ${answer}</b>.`] };
        }
        const answer = ex(`${m}/${n}`);
        return { prompt: `Write the radical as a power of ${X}.${big(rad(m, n))}`, type: 'choice', choices: [answer, ex(`${n}/${m}`), ex(m * n), ex(m + n)], answer, params: { kind, m, n },
          hints: [`The index of the root (${n}) becomes the denominator of the exponent.`, `The power inside (${m}) becomes the numerator.`, `<b>${rad(m, n)} = ${answer}</b>.`] };
      }
      const b = rng.pick([2, 3, 5, 6, 7, 10, 11, 13]), s = rng.int(2, 9), n = s * s * b;
      const rt = (c, inner) => `${c}${M.sqrt(inner)}`;
      const answer = rt(s, b);
      const parts = [];
      for (let d = 2; d < s; d++) if (s % d === 0) parts.push(rt(d, n / (d * d)));
      const cands = [rt(s * s, b)].concat(rng.shuffle(parts)).concat(b !== s ? [rt(b, s)] : []);
      const choices = options(answer, cands, () => rt(s + rng.pick([-1, 1, 2]), b));
      return { prompt: `Simplify completely.${big(M.sqrt(n))}`, type: 'choice', choices, answer, params: { kind, n },
        hints: [`Look for the largest perfect square that divides ${n}: try 4, 9, 16, 25, 36, 49, 64.`, `${n} = ${s * s} · ${b}, and ${b} has no square factor left.`, `${M.sqrt(n)} = ${M.sqrt(s * s)} · ${M.sqrt(b)} = <b>${answer}</b>.`] };
    },
    challenge(rng) {   // larger bases and roots, negative exponents, and a product of roots to simplify
      if (rng.chance(0.35)) {
        const s = rng.int(2, 9), b = rng.pick([2, 3, 5, 6, 7, 10]), n = s * s * b, isSq = v => Number.isInteger(Math.sqrt(v));
        const ds = []; for (let d = 2; d * d < n; d++) if (n % d === 0 && !isSq(d) && !isSq(n / d)) ds.push(d);
        if (ds.length) {
          const d1 = rng.pick(ds), d2 = n / d1, rt = (c, inner) => `${c}${M.sqrt(inner)}`, answer = rt(s, b);
          const choices = options(answer, [M.sqrt(n), rt(s * s, b), rt(b, s), rt(s + 1, b)], null);
          return { prompt: `Multiply and simplify completely.${big(`${M.sqrt(d1)} · ${M.sqrt(d2)}`)}`, type: 'choice', choices, answer, params: { kind: 'simplify', n },
            hints: [`Multiply under one root: ${M.sqrt(d1)} · ${M.sqrt(d2)} = ${M.sqrt(n)}.`, `The largest perfect square that divides ${n} is ${s * s}: ${n} = ${s * s} · ${b}.`, `${M.sqrt(n)} = ${M.sqrt(s * s)} · ${M.sqrt(b)} = <b>${answer}</b>.`] };
        }
      }
      const [base, q, k] = rng.pick([[32, 5, 2], [243, 5, 3], [625, 4, 5], [1296, 4, 6], [343, 3, 7], [512, 3, 8], [729, 3, 9], [1000, 3, 10], [128, 7, 2], [64, 6, 2], [729, 6, 3], [256, 8, 2], [81, 4, 3], [216, 3, 6]]);
      const pws = []; for (let w = 2; w < q + 3; w++) if (M.gcd(w, q) === 1 && k ** w <= 1000) pws.push(w);
      const pw = rng.pick(pws), val = k ** pw, neg = rng.chance(0.45), ans = neg ? 1 / val : val;
      const name = ['', '', 'square', 'cube', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'][q];
      return { prompt: `Evaluate.${neg ? ' Give a fraction.' : ''}${big(`${N(base)}<sup>${neg ? '−' : ''}${pw}/${q}</sup>`)}`, type: 'number', answer: ans, answerText: neg ? M.fracText(1, val) : undefined, params: { kind: 'eval', base, pw, q, neg },
        hints: [`The denominator ${q} means the ${name} root: ${root(q, N(base))} = ${k}, because ${k}<sup>${q}</sup> = ${N(base)}.`, `The numerator ${pw} is a power: ${k}<sup>${pw}</sup> = ${N(val)}.`, (neg ? `The negative exponent means the reciprocal: ` : '') + `<b>${neg ? M.fracText(1, val) : N(val)}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'eval') return Math.abs(Math.pow(pr.base, (pr.neg ? -1 : 1) * pr.pw / pr.q) - q.answer) < 1e-9;
      if (pr.kind === 'to-root') { const t = A.stripTags(q.answer).replace(/\s+/g, ''); return t === `${pr.n === 2 ? '' : pr.n}√x${pr.m}`; }   // index n, then x to the m
      if (pr.kind === 'to-exp') return A.stripTags(q.answer).replace(/\s+/g, '') === `x${pr.m}/${pr.n}`;
      const t = A.stripTags(q.answer).replace(/\s+/g, '').split('√').map(Number);
      const [c, b] = t;
      let squareFree = true; for (let d = 2; d * d <= b; d++) if (b % (d * d) === 0) squareFree = false;
      return c * c * b === pr.n && squareFree;
    },
  });

  A.skill({
    id: 'alg2.radical-equations', title: 'Solving radical equations',
    learn: p(`A <b>radical equation</b> has the variable under a root. <b>To solve one, isolate the radical, then raise both sides to the power that undoes it</b>: square a square root, cube a cube root.`) +
      p(`Squaring can create <b>extraneous solutions</b>: answers to the squared equation that don't solve the original one. A square root is never negative, so if √(…) = ${X} − 4, any solution must make ${X} − 4 ≥ 0. <b>Always check every answer in the original equation.</b> Cube roots can be negative, so cubing never creates extraneous solutions.`) +
      example('Example 1: one square root', `${big(`${M.sqrt(P([2, 3]))} = 5`)}Square both sides: 2${X} + 3 = 25, so 2${X} = 22 and ${X} = 11. Check: √25 = 5 ✓. <b>${X} = 11</b>.`) +
      example('Example 2: an extraneous solution', `${big(`${M.sqrt(P([1, 2]))} = ${P([1, -10])}`)}Square: ${X} + 2 = ${X}² − 20${X} + 100, so ${X}² − 21${X} + 98 = 0 = (${X} − 7)(${X} − 14). Check 7: √9 = 3 but 7 − 10 = −3, so 7 is extraneous. Check 14: √16 = 4 = 14 − 10 ✓. <b>${X} = 14</b>.`) +
      example('Example 3: a cube root', `${big(`${root(3, P([1, -4]))} = −2`)}Cube both sides: ${X} − 4 = −8, so <b>${X} = −4</b>. Check: ∛(−8) = −2 ✓.`),
    make(rng) {
      const kind = rng.pick(['quad', 'quad', 'simple', 'cube']);
      if (kind === 'quad') {
        const q = rng.int(-3, 6), r1 = rng.int(q + 2, q + 7), r2 = 2 * q + 1 - r1;
        const pp = q * q - r1 * r2;
        const left = M.sqrt(P([1, pp])), right = P([1, -q]);
        return { prompt: `Solve. Check for an extraneous solution and give the one that works.${big(`${left} = ${right}`)}`, type: 'number', answer: r1, params: { kind, pp, q },
          hints: [`Square both sides: ${P([1, pp])} = (${right})² = ${P([1, -2 * q, q * q])}.`, `Move everything to one side: ${P([1, -(2 * q + 1), q * q - pp])} = 0, which factors as (${P([1, -r1])})(${P([1, -r2])}) = 0. So ${X} = ${N(r1)} or ${X} = ${N(r2)}.`,
            `Check ${X} = ${N(r2)}: the left side is ${M.sqrt(N(r2 + pp))} = ${N(Math.abs(r2 - q))}, but the right side is ${N(r2 - q)}. It is extraneous.`, `Check ${X} = ${N(r1)}: ${M.sqrt(N(r1 + pp))} = ${N(r1 - q)} ✓. <b>${X} = ${N(r1)}</b>.`] };
      }
      if (kind === 'simple') {
        const c = rng.int(1, 9), a = rng.nz(-5, 5), x = rng.int(-9, 12), b = c * c - a * x;
        return { prompt: `Solve.${big(`${M.sqrt(P([a, b]))} = ${c}`)}`, type: 'number', answer: x, params: { kind, a, b, c },
          hints: [`Square both sides: ${P([a, b])} = ${c * c}.`, `${M.term(a, 'x')} = ${N(c * c)} ${M.signed(-b)} = ${N(c * c - b)}, so ${X} = ${N(c * c - b)} ÷ ${wrap(a)}.`, `Check: ${M.sqrt(N(a * x + b))} = ${c} ✓. <b>${X} = ${N(x)}</b>.`] };
      }
      const c = rng.nz(-4, 4), a = rng.pick([1, 1, 2, -1]), x = rng.int(-10, 10), b = c ** 3 - a * x;
      return { prompt: `Solve.${big(`${root(3, P([a, b]))} = ${N(c)}`)}`, type: 'number', answer: x, params: { kind, a, b, c },
        hints: [`Cube both sides: ${P([a, b])} = ${wrap(c)}³ = ${N(c ** 3)}.`, a === 1 ? `Subtract: ${X} = ${N(c ** 3)} ${M.signed(-b)} = ${N(x)}.` : `${M.term(a, 'x')} = ${N(c ** 3 - b)}, so ${X} = ${N(x)}.`, `Cube roots can be negative, so nothing is extraneous. <b>${X} = ${N(x)}</b>.`] };
    },
    challenge(rng) {   // the root isn't alone yet: isolate it first
      const kind = rng.pick(['quad', 'quad', 'simple', 'cube']);
      if (kind === 'quad') {
        const q = rng.nz(-3, 6), r1 = rng.int(q + 2, q + 7), r2 = 2 * q + 1 - r1, pp = q * q - r1 * r2, left = M.sqrt(P([1, pp]));
        return { prompt: `Solve. Check for an extraneous solution and give the one that works.${big(`${left} ${M.signed(q)} = ${X}`)}`, type: 'number', answer: r1, params: { kind, pp, q },
          hints: [`Isolate the root: ${left} = ${P([1, -q])}. Then square both sides: ${P([1, pp])} = ${P([1, -2 * q, q * q])}.`, `So ${P([1, -(2 * q + 1), q * q - pp])} = 0, which factors as (${P([1, -r1])})(${P([1, -r2])}) = 0: ${X} = ${N(r1)} or ${X} = ${N(r2)}.`, `Check ${X} = ${N(r2)}: the left side is ${M.sqrt(N(r2 + pp))} ${M.signed(q)} = ${N(Math.abs(r2 - q) + q)}, not ${N(r2)}, so it is extraneous. <b>${X} = ${N(r1)}</b>.`] };
      }
      const k = rng.pick([2, 3, 4]), e = rng.nz(-9, 9);
      if (kind === 'simple') {
        const c = rng.int(1, 9), a = rng.nz(-5, 5), x = rng.int(-12, 15), b = c * c - a * x, rad = M.sqrt(P([a, b]));
        return { prompt: `Solve.${big(`${k}${rad} ${M.signed(e)} = ${N(k * c + e)}`)}`, type: 'number', answer: x, params: { kind, a, b, c },
          hints: [`Isolate the root: subtract ${wrap(e)} to get ${k}${rad} = ${N(k * c)}, then divide by ${k}: ${rad} = ${c}.`, `Square both sides: ${P([a, b])} = ${c * c}, so ${M.term(a, 'x')} = ${N(c * c - b)}.`, `${X} = ${N(c * c - b)} ÷ ${wrap(a)}. Check: ${M.sqrt(N(a * x + b))} = ${c} ✓. <b>${X} = ${N(x)}</b>.`] };
      }
      const c = rng.nz(-4, 4), a = rng.pick([1, 2, -1, 3]), x = rng.int(-12, 12), b = c ** 3 - a * x, rad = root(3, P([a, b]));
      return { prompt: `Solve.${big(`${k}${rad} ${M.signed(e)} = ${N(k * c + e)}`)}`, type: 'number', answer: x, params: { kind, a, b, c },
        hints: [`Isolate the root: subtract ${wrap(e)}, then divide by ${k}: ${rad} = ${N(c)}.`, `Cube both sides: ${P([a, b])} = ${N(c ** 3)}, so ${M.term(a, 'x')} = ${N(c ** 3 - b)}.`, `Cube roots can be negative, so nothing is extraneous. <b>${X} = ${N(x)}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      const ok = pr.kind === 'quad' ? t => t + pr.pp >= 0 && Math.abs(Math.sqrt(t + pr.pp) - (t - pr.q)) < 1e-9
        : pr.kind === 'simple' ? t => pr.a * t + pr.b >= 0 && Math.abs(Math.sqrt(pr.a * t + pr.b) - pr.c) < 1e-9
          : t => Math.abs(Math.cbrt(pr.a * t + pr.b) - pr.c) < 1e-9;
      const sols = []; for (let t = -60; t <= 60; t++) if (ok(t)) sols.push(t);
      return sols.length === 1 && sols[0] === q.answer;
    },
  });

  /* ---------- Unit 7: Exponential models ---------- */
  // everyday settings: (amount, growth word, step, time, unit word) → the question
  const DOUBLINGS = [
    (a, g, h, t) => `A bacteria culture in a school lab starts with ${N(a)} cells and ${g} every ${h} hours. How many cells are there after ${t} hours?`,
    (a, g, h, t) => `A patch of algae on a pond covers ${N(a)} square centimeters and ${g} every ${h} days. How many square centimeters does it cover after ${t} days?`,
    (a, g, h, t) => `A jar in a biology class holds ${N(a)} fruit flies, and the number ${g} every ${h} days. How many fruit flies are there after ${t} days?`,
    (a, g, h, t) => `The number of people who have heard about a neighborhood food drive is ${N(a)}, and it ${g} every ${h} days. How many people have heard about it after ${t} days?`,
    (a, g, h, t) => `A mint plant in a community garden covers ${N(a)} square inches and ${g} every ${h} weeks. How many square inches does it cover after ${t} weeks?`,
  ];
  const HALF_LIVES = [   // [question, unit]
    [(nm, a, h, t) => `A medicine has a half-life of ${h} hours. ${nm} takes a ${N(a)} mg dose. How much is left after ${t} hours?`, 'mg'],
    [(nm, a, h, t) => `A radioactive isotope used in a science lab has a half-life of ${h} days. A sample starts at ${N(a)} mg. How much is left after ${t} days?`, 'mg'],
    [(nm, a, h, t) => `${nm} adds ${N(a)} g of chlorine to a pool. Sunlight breaks it down with a half-life of ${h} hours. How much is left after ${t} hours?`, 'g'],
    [(nm, a, h, t) => `A hospital scan uses a tracer with a half-life of ${h} hours. A patient receives ${N(a)} mg. How much is left after ${t} hours?`, 'mg'],
  ];
  const PERCENT_MODELS = [   // [grows?, the situation, what the function gives]
    [true, (a, r) => `A town has ${N(a)} people, and its population grows by ${r}% each year.`, 'population'],
    [true, (a, r) => `A public library has ${N(a)} books, and its collection grows by ${r}% each year.`, 'number of books'],
    [true, (a, r) => `A city’s bike-share program has ${N(a)} members, and membership grows by ${r}% each year.`, 'number of members'],
    [true, (a, r) => `A farmers market sees ${N(a)} shoppers a season, and the number grows by ${r}% each year.`, 'number of shoppers'],
    [false, (a, r) => `A lake holds ${N(a)} fish, and the number falls by ${r}% each year.`, 'number of fish'],
    [false, (a, r) => `A city has ${N(a)} landline phones, and the number falls by ${r}% each year.`, 'number of landlines'],
    [false, (a, r) => `A forest has ${N(a)} ash trees, and a disease lowers the number by ${r}% each year.`, 'number of ash trees'],
  ];
  const ITEMS = { true: ['a painting', 'a rare coin collection', 'a plot of farmland', 'a vintage guitar', 'a sculpture'], false: ['a used car', 'a used motorcycle', 'a fishing boat', 'a tractor', 'a camper trailer'] };
  A.skill({
    id: 'alg2.exponential-models', title: 'Exponential growth and decay models',
    learn: p(`An <b>exponential model</b> multiplies by the same factor in each equal time step: <b>${fx('f', V('t'))} = ${V('a')} · ${V('b')}<sup>${V('t')}</sup></b>. Here ${V('a')} is the starting amount and ${V('b')} is the <b>growth factor</b>, the number you multiply by each step. If ${V('b')} &gt; 1 the amount grows; if 0 &lt; ${V('b')} &lt; 1 it decays (shrinks).`) +
      p(`<b>A percent change of ${V('r')} per step gives the factor ${V('b')} = 1 + ${V('r')} for growth and 1 − ${V('r')} for decay</b>, with ${V('r')} written as a decimal: growing 6% means × 1.06, and losing 6% means × 0.94.`) +
      p(`When something doubles every ${V('h')} hours, the number of doublings after ${V('t')} hours is ${V('t')} ÷ ${V('h')}, so ${fx('f', V('t'))} = ${V('a')} · 2<sup>${V('t')}/${V('h')}</sup>. The <b>half-life</b> is the time it takes to fall to half; it works the same way with ½ in place of 2.`) +
      example('Example 1: doubling', `A culture of 300 cells doubles every 4 hours. After 12 hours it has doubled 12 ÷ 4 = 3 times: 300 · 2³ = <b>2,400 cells</b>.`) +
      example('Example 2: half-life', `A 120 mg sample has a half-life of 5 days. After 15 days it has halved 15 ÷ 5 = 3 times: 120 · (½)³ = <b>15 mg</b>.`) +
      example('Example 3: a percent change', `A town of 5,000 people grows 4% a year, so ${fx('P', V('t'))} = 5,000(1.04)<sup>${V('t')}</sup>. After 2 years: 5,000 · 1.04² = 5,000 · 1.0816 = <b>5,408 people</b>.`),
    make(rng) {
      const kind = rng.pick(['double', 'half', 'percent', 'write']);
      const name = rng.pick(NAMES);
      if (kind === 'double') {
        const a = rng.pick([50, 100, 150, 200, 250, 300, 400]), g = rng.pick([2, 2, 3]), h = rng.int(2, 6), n = rng.int(2, g === 3 ? 4 : 5), t = h * n;
        const ans = a * g ** n;
        return { prompt: rng.pick(DOUBLINGS)(a, g === 2 ? 'doubles' : 'triples', h, t), type: 'number', answer: ans, params: { kind, a, g, h, t },
          hints: [`The model is ${N(a)} · ${g}<sup>${V('t')}/${h}</sup>.`, `In ${t} hours it ${g === 2 ? 'doubles' : 'triples'} ${t} ÷ ${h} = ${n} times: ${g}<sup>${n}</sup> = ${g ** n}.`, `${N(a)} · ${g ** n} = <b>${N(ans)}</b> cells.`] };
      }
      if (kind === 'half') {
        const n = rng.int(1, 4), m = rng.pick([3, 5, 6, 7, 9, 10, 15, 25]), a = m * 2 ** n, h = rng.pick([4, 5, 6, 8, 10, 12, 20, 30]), t = h * n;
        const [say, u] = rng.pick(HALF_LIVES), span = /days/.test(say(name, a, h, t)) ? 'days' : 'hours';
        return { prompt: say(name, a, h, t), type: 'number', answer: m, unit: u, params: { kind, a, h, t },
          hints: [`The model is ${N(a)} · (½)<sup>${V('t')}/${h}</sup>.`, `${t} ${span} is ${t} ÷ ${h} = ${n} half-lives, so multiply by ½ ${n === 1 ? 'once' : n + ' times'}: ÷ ${2 ** n}.`, `${N(a)} ÷ ${2 ** n} = <b>${N(m)} ${u}</b>.`] };
      }
      const grow = rng.bool(), r = rng.pick(grow ? [2, 3, 4, 5, 6, 8, 10, 12] : [5, 8, 10, 12, 15, 20]);
      const a = rng.pick([1200, 2500, 4000, 8000, 15000, 24000]);
      const b = grow ? (100 + r) / 100 : (100 - r) / 100;
      if (kind === 'write') {
        const T = V('t'), f = base => `${fx('P', T)} = ${N(a)}(${N(base)})<sup>${T}</sup>`;
        const answer = f(b), [, say, what] = rng.pick(PERCENT_MODELS.filter(m => m[0] === grow));
        return { prompt: `${say(a, r)} Which function gives the ${what} after ${T} years?`, type: 'choice', choices: [answer, f(grow ? (100 - r) / 100 : (100 + r) / 100), f(r / 100), f(grow ? 1 + r / 10 : r / 10)], answer, params: { kind, a, r, grow },
          hints: [`Each year the amount is multiplied by the same factor, so the model is ${N(a)} · ${V('b')}<sup>${T}</sup>.`, grow ? `Growing ${r}% means keeping 100% and adding ${r}%: ${V('b')} = 1 + 0.${String(r).padStart(2, '0')} = ${N(b)}.` : `Losing ${r}% leaves 100% − ${r}% = ${100 - r}%: ${V('b')} = ${N(b)}.`, `<b>${answer}</b>`] };
      }
      const t = rng.int(2, 6);
      let v = a; for (let k = 0; k < t; k++) v *= b;
      const ans = Math.round(v);
      return { prompt: `${name} buys ${rng.pick(ITEMS[grow])} for ${M.money(a)}. Its value ${grow ? 'rises' : 'falls'} by ${r}% per year. What is it worth after ${t} years, to the nearest dollar?`, type: 'number', answer: ans, unit: '$', tolerance: 1, params: { kind, a, r, grow, t },
        hints: [`The yearly factor is ${grow ? `1 + ${N(r / 100)}` : `1 − ${N(r / 100)}`} = ${N(b)}.`, `Value = ${N(a)} · ${N(b)}<sup>${t}</sup>, and ${N(b)}<sup>${t}</sup> ≈ ${N(M.round(Math.pow(b, t), 4))}.`, `${N(a)} · ${N(M.round(Math.pow(b, t), 4))} ≈ <b>${M.money(ans)}</b>.`] };
    },
    challenge(rng) {   // times in different units, and working backwards to a time
      const kind = rng.pick(['double', 'half', 'time']);
      if (kind === 'double') {
        const g = rng.pick([2, 2, 3]), hrs = rng.pick([1, 2]), hs = [10, 12, 15, 20, 30].filter(h => 60 * hrs / h <= (g === 3 ? 6 : 12));
        const h = rng.pick(hs), n = 60 * hrs / h, a = rng.pick([5, 10, 20, 25, 50]), ans = a * g ** n, dbl = g === 2 ? 'doubles' : 'triples';
        const what = rng.pick([['bacteria culture in a lab starts with', 'cells'], ['batch of yeast in warm bread dough starts with', 'cells'], ['test tube in a biology class starts with', 'bacteria']]);
        return { prompt: `A ${what[0]} ${a} ${what[1]}, and the number ${dbl} every ${h} minutes. How many ${what[1]} are there after ${hrs === 1 ? '1 hour' : hrs + ' hours'}?`, type: 'number', answer: ans, params: { kind, a, g, h, t: 60 * hrs },
          hints: [`Put both times in minutes: ${hrs === 1 ? '1 hour' : hrs + ' hours'} = ${60 * hrs} minutes.`, `${60 * hrs} ÷ ${h} = ${n}, so it ${dbl} ${n} times: multiply by ${g}<sup>${n}</sup> = ${N(g ** n)}.`, `${a} · ${N(g ** n)} = <b>${N(ans)}</b>.`] };
      }
      if (kind === 'half') {
        const h = rng.pick([6, 8, 12]), days = rng.pick([1, 2]), n = 24 * days / h, m = rng.pick([1, 2, 3, 5]), a = m * 2 ** n, name = rng.pick(NAMES);
        const [say, u] = rng.pick([[`A medicine has a half-life of ${h} hours. ${name} takes a ${N(a)} mg dose.`, 'mg'], [`${name} adds ${N(a)} g of chlorine to a pool, and sunlight breaks it down with a half-life of ${h} hours.`, 'g'], [`A tracer used in a hospital scan has a half-life of ${h} hours, and a patient receives ${N(a)} mg.`, 'mg']]);
        return { prompt: `${say} How much is left after ${days === 1 ? '1 day' : '2 days'}?`, type: 'number', answer: m, unit: u, params: { kind, a, h, t: 24 * days },
          hints: [`Put both times in hours: ${days === 1 ? '1 day' : '2 days'} = ${24 * days} hours.`, `${24 * days} ÷ ${h} = ${n} half-lives, so divide by 2<sup>${n}</sup> = ${2 ** n}.`, `${N(a)} ÷ ${2 ** n} = <b>${N(m)} ${u}</b>.`] };
      }
      const g = rng.pick([2, 2, 3]), h = rng.int(2, 8), a = rng.pick([50, 100, 200, 300]), n = rng.int(2, g === 2 ? 6 : 4), target = a * g ** n, dbl = g === 2 ? 'doubles' : 'triples';
      return { prompt: `A culture starts with ${a} cells and ${dbl} every ${h} hours. After how many hours will there be ${N(target)} cells?`, type: 'number', answer: h * n, unit: 'hours', params: { kind: 'time', a, g, h, target },
        hints: [`Divide: ${N(target)} ÷ ${a} = ${N(g ** n)}, which is ${g}<sup>${n}</sup>.`, `So it has to ${g === 2 ? 'double' : 'triple'} ${n} times, and each time takes ${h} hours.`, `${n} × ${h} = <b>${h * n} hours</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'double') return q.answer === pr.a * Math.pow(pr.g, pr.t / pr.h);
      if (pr.kind === 'half') return Math.abs(q.answer - pr.a * Math.pow(0.5, pr.t / pr.h)) < 1e-9;
      if (pr.kind === 'time') return Math.abs(pr.a * Math.pow(pr.g, q.answer / pr.h) - pr.target) < 1e-9 * pr.target;
      const b = 1 + (pr.grow ? 1 : -1) * pr.r / 100;
      if (pr.kind === 'write') return A.stripTags(q.answer).includes(`(${N(b)})`);
      return Math.abs(q.answer - pr.a * Math.pow(b, pr.t)) <= 0.5 + 1e-6;
    },
  });

  const PERIODS = [   // [halves?, what, time unit]
    [false, 'mold in a science-fair dish', 'days'], [false, 'algae in a fish tank', 'days'], [false, 'duckweed on a pond', 'weeks'], [false, 'yeast in a batch of bread dough', 'hours'],
    [true, 'a radioactive sample', 'days'], [true, 'a medicine in a patient’s blood', 'hours'], [true, 'a pesticide in garden soil', 'weeks'],
  ];
  const RATE_SETTINGS = ['number of visitors to a state park', 'number of students in a school district', 'number of members of a hiking club', 'number of fish in a reservoir', 'number of riders on a city bus line', 'number of bees in a community apiary'];
  A.skill({
    id: 'alg2.exponential-rates', title: 'Interpreting exponential models',
    learn: p(`In ${fx('f', V('t'))} = ${V('a')} · ${V('b')}<sup>${V('t')}</sup>, the number in front, ${V('a')}, is the value when ${V('t')} = 0: the <b>initial value</b>. The base ${V('b')} is the <b>growth factor</b> for each unit of time: ${V('b')} &gt; 1 means growth, and 0 &lt; ${V('b')} &lt; 1 means decay.`) +
      p(`<b>The percent rate is how far ${V('b')} is from 1.</b> A factor of 1.07 is a 7% increase; a factor of 0.82 is an 18% decrease, because 1 − 0.82 = 0.18. The factor isn't the rate itself: 1.07 means 7% growth, not 107%.`) +
      p(`An exponent like ${V('t')}/5 changes the time step: ${V('a')} · 2<sup>${V('t')}/5</sup> doubles every 5 units, because the exponent goes up by 1 each time ${V('t')} goes up by 5.`) +
      example('Example 1: decay', `${big(`${fx('V', V('t'))} = 9,000(0.88)<sup>${V('t')}</sup>`)}The initial value is $9,000. The factor 0.88 is less than 1, so it decays by 1 − 0.88 = 0.12: <b>12% per year</b>.`) +
      example('Example 2: growth', `${big(`${fx('f', V('t'))} = 650(1.045)<sup>${V('t')}</sup>`)}The initial value is 650. The factor is more than 1, and 1.045 − 1 = 0.045: <b>4.5% growth per year</b>.`) +
      example('Example 3: a doubling time', `${big(`${fx('A', V('t'))} = 80 · 2<sup>${V('t')}/6</sup>`)}The exponent ${V('t')}/6 reaches 1 when ${V('t')} = 6, so the amount <b>doubles every 6 days</b>.`),
    make(rng) {
      const kind = rng.pick(['describe', 'describe', 'rate', 'initial', 'period']);
      const T = V('t');
      if (kind === 'period') {
        const k = rng.int(2, 12), a = rng.pick([40, 60, 80, 120, 500]), [half, what, u] = rng.pick(PERIODS);
        return { prompt: `The amount of ${what} after ${T} ${u} is modeled below. How many ${u} does it take to ${half ? 'halve' : 'double'}?${big(`${fx('A', T)} = ${N(a)} · ${half ? '(½)' : '2'}<sup>${T}/${k}</sup>`)}`, type: 'number', answer: k, unit: u, params: { kind, a, k, half },
          hints: [`The amount ${half ? 'halves' : 'doubles'} each time the exponent ${T}/${k} goes up by 1.`, `${T}/${k} = 1 when ${T} = ${k}.`, `It ${half ? 'halves' : 'doubles'} every <b>${k} ${u}</b>.`] };
      }
      const grow = rng.bool(), r = rng.pick(grow ? [2, 3, 4, 5, 6, 7, 9, 15, 25] : [3, 4, 5, 8, 12, 15, 18, 30]);
      const b = grow ? (100 + r) / 100 : (100 - r) / 100, a = rng.pick([350, 800, 1500, 6000, 12000, 30000]);
      const shown = `${fx('f', T)} = ${N(a)}(${N(b)})<sup>${T}</sup>`;
      const hint1 = `The base ${N(b)} is ${grow ? 'more' : 'less'} than 1, so the model shows ${grow ? 'growth' : 'decay'}.`;
      const hint2 = grow ? `${N(b)} − 1 = ${N(r / 100)}, which is ${r}%.` : `1 − ${N(b)} = ${N(r / 100)}, which is ${r}%.`;
      const what = rng.pick(RATE_SETTINGS), ctx = `The ${what} ${T} years from now is modeled below.`;
      if (kind === 'initial') return { prompt: `${ctx} What is the initial value of the model?${big(shown)}`, type: 'number', answer: a, params: { kind, a, b }, hints: [`The initial value is ${fx('f', 0)}, the value when ${T} = 0.`, `${N(b)}<sup>0</sup> = 1, so ${fx('f', 0)} = ${N(a)} · 1 = <b>${N(a)}</b>.`] };
      if (kind === 'rate') return { prompt: `${ctx} By what percent does the ${what} ${grow ? 'increase' : 'decrease'} each year?${big(shown)}`, type: 'number', answer: r, unit: '%', params: { kind, b }, hints: [hint1, hint2, `It ${grow ? 'increases' : 'decreases'} by <b>${r}%</b> per year.`] };
      const d = (w, x) => `${w} of ${x}% per year`;
      const answer = d(grow ? 'growth' : 'decay', r);
      return { prompt: `${ctx} What does the model show?${big(shown)}`, type: 'choice', choices: [answer, d(grow ? 'decay' : 'growth', r), d(grow ? 'growth' : 'decay', Math.round(b * 100)), d(grow ? 'decay' : 'growth', Math.round(b * 100))], answer, params: { kind, b },
        hints: [hint1, hint2, `<b>${answer}</b>.`] };
    },
    challenge(rng) {   // an exponent that hides the yearly factor, or a base of 4 in place of 2
      const T = V('t');
      if (rng.chance(0.4)) {
        const k = 2 * rng.int(2, 8), a = rng.pick([40, 60, 80, 120, 500]), [half, what, u] = rng.pick(PERIODS);
        return { prompt: `The amount of ${what} after ${T} ${u} is modeled below. How many ${u} does it take to ${half ? 'halve' : 'double'}?${big(`${fx('A', T)} = ${N(a)} · ${half ? '(¼)' : '4'}<sup>${T}/${k}</sup>`)}`, type: 'number', answer: k / 2, unit: u, params: { kind: 'period', a, k, half, base: half ? 0.25 : 4 },
          hints: [`${half ? '¼ = (½)²' : '4 = 2²'}, so the model is ${N(a)} · ${half ? '(½)' : '2'}<sup>2${T}/${k}</sup>: it ${half ? 'halves' : 'doubles'} each time 2${T}/${k} goes up by 1.`, `2${T}/${k} = 1 when ${T} = ${k / 2}.`, `It ${half ? 'halves' : 'doubles'} every <b>${k / 2} ${u}</b>.`] };
      }
      const dd = rng.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]), b1 = (10 + dd) / 10, grow = dd > 0, pct = Math.abs((10 + dd) ** 2 - 100), yearly = (10 + dd) ** 2 / 100;
      const a = rng.pick([350, 800, 1500, 6000, 12000, 30000]), what = rng.pick(RATE_SETTINGS);
      const shown = `${fx('f', T)} = ${N(a)}(${N(b1)})<sup>2${T}</sup>`, ctx = `The ${what} ${T} years from now is modeled below.`;
      const hints = [`(${N(b1)})<sup>2${T}</sup> = ((${N(b1)})²)<sup>${T}</sup>, so the yearly factor is ${N(b1)}² = ${N(yearly)}.`, grow ? `${N(yearly)} − 1 = ${N(pct / 100)}, which is ${pct}%.` : `1 − ${N(yearly)} = ${N(pct / 100)}, which is ${pct}%.`];
      if (rng.bool()) return { prompt: `${ctx} By what percent does the ${what} ${grow ? 'increase' : 'decrease'} each year?${big(shown)}`, type: 'number', answer: pct, unit: '%', params: { kind: 'rate', b: b1 * b1 }, hints: hints.concat([`It ${grow ? 'increases' : 'decreases'} by <b>${pct}%</b> per year.`]) };
      const d = (w, x) => `${w} of ${x}% per year`, answer = d(grow ? 'growth' : 'decay', pct);
      return { prompt: `${ctx} What does the model show?${big(shown)}`, type: 'choice', choices: [answer, d(grow ? 'growth' : 'decay', Math.abs(dd) * 10), d(grow ? 'growth' : 'decay', Math.abs(dd) * 20), d(grow ? 'decay' : 'growth', pct)], answer, params: { kind: 'describe', b: b1 * b1 }, hints: hints.concat([`<b>${answer}</b>.`]) };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'period') { const f = t => pr.a * Math.pow(pr.base || (pr.half ? 0.5 : 2), t / pr.k); return Math.abs(f(q.answer) / f(0) - (pr.half ? 0.5 : 2)) < 1e-9; }
      if (pr.kind === 'initial') return q.answer === pr.a * Math.pow(pr.b, 0);
      const pct = Math.round(Math.abs(pr.b * 100 - 100));
      if (pr.kind === 'rate') return q.answer === pct;
      return q.answer === `${pr.b > 1 ? 'growth' : 'decay'} of ${pct}% per year`;
    },
  });

  /* ---------- Unit 8: Logarithms ---------- */
  const lg = (b, arg) => `log<sub>${b}</sub>${arg}`;
  A.skill({
    id: 'alg2.evaluate-logs', title: 'Evaluating logarithms',
    learn: p(`A <b>logarithm</b> answers the question “what power of ${V('b')} gives ${V('x')}?” <b>${lg(V('b'), ' ' + V('x'))} = ${V('y')} means ${V('b')}<sup>${V('y')}</sup> = ${V('x')}.</b> The number ${V('b')} is the <b>base</b>. So ${lg(2, ' 32')} = 5 because 2⁵ = 32, and ${lg(3, ` ${F(1, 9)}`)} = −2 because 3<sup>−2</sup> = ${F(1, 9)}.`) +
      p(`<b>Properties:</b> the log of a product is a sum, ${lg(V('b'), `(${V('m')}${V('n')})`)} = ${lg(V('b'), ' ' + V('m'))} + ${lg(V('b'), ' ' + V('n'))}; the log of a quotient is a difference, ${lg(V('b'), `(${V('m')}/${V('n')})`)} = ${lg(V('b'), ' ' + V('m'))} − ${lg(V('b'), ' ' + V('n'))}; and a power comes down in front, ${lg(V('b'), ` ${V('m')}<sup>${V('k')}</sup>`)} = ${V('k')} ${lg(V('b'), ' ' + V('m'))}.`) +
      p(`<b>Change of base:</b> ${lg(V('b'), ' ' + V('x'))} = log ${V('x')} ÷ log ${V('b')}. Here “log” with no base written is the <b>common log</b>, base 10, which every scientific calculator has.`) +
      example('Example 1: finding the power', `${big(`${lg(5, ' 125')} and ${lg(2, ` ${F(1, 8)}`)}`)}5³ = 125, so ${lg(5, ' 125')} = <b>3</b>. 2<sup>−3</sup> = ${F(1, 8)}, so ${lg(2, ` ${F(1, 8)}`)} = <b>−3</b>.`) +
      example('Example 2: combining logs', `${big(`${lg(6, ' 4')} + ${lg(6, ' 9')}`)}A sum is the log of a product: ${lg(6, ' (4 · 9)')} = ${lg(6, ' 36')} = <b>2</b>, since 6² = 36. A difference works the same way: ${lg(3, ' 54')} − ${lg(3, ' 2')} = ${lg(3, ' 27')} = 3.`) +
      example('Example 3: change of base', `${big(lg(3, ' 20'))}${lg(3, ' 20')} = log 20 ÷ log 3 ≈ 1.3010 ÷ 0.4771 ≈ <b>2.73</b>. Check: 3<sup>2.73</sup> ≈ 20.`) +
      example('Example 4: expanding', `${big(lg(2, ` (${sfrac(`${M.sup(X, 3)}${Y}`, V('z'))})`))}Quotient, then product, then power: ${lg(2, ` ${M.sup(X, 3)}`)} + ${lg(2, ' ' + Y)} − ${lg(2, ' ' + V('z'))} = <b>3${lg(2, ' ' + X)} + ${lg(2, ' ' + Y)} − ${lg(2, ' ' + V('z'))}</b>.`),
    make(rng) {
      const kind = rng.pick(['exact', 'exact', 'sum', 'diff', 'cob', 'expand']);
      if (kind === 'exact') {
        const b = rng.pick([2, 3, 4, 5, 10]), max = { 2: 6, 3: 4, 4: 3, 5: 3, 10: 4 }[b];
        const k = rng.int(-2, max), val = b ** Math.abs(k);
        const arg = k < 0 ? F(1, val) : N(val);
        return { prompt: `Evaluate.${big(lg(b, ' ' + arg))}`, type: 'number', answer: k, params: { kind, b, num: k < 0 ? 1 : val, den: k < 0 ? val : 1 },
          hints: [`Ask: ${b} to what power is ${arg}?`, k < 0 ? `${N(val)} = ${b}<sup>${-k}</sup>, and a reciprocal means a negative exponent: ${arg} = ${b}<sup>${k}</sup>.` : k === 0 ? `Any base to the power 0 is 1.` : `${b}<sup>${k}</sup> = ${N(val)}.`, `${lg(b, ' ' + arg)} = <b>${N(k)}</b>.`] };
      }
      if (kind === 'sum') {
        const b = rng.pick([6, 10, 12, 15]), k = b === 10 ? rng.int(2, 3) : 2, tot = b ** k;
        const divs = []; for (let d = 2; d < tot; d++) if (tot % d === 0 && d * d < tot && d !== b) divs.push(d);
        const m = rng.pick(divs), n = tot / m;
        return { prompt: `Evaluate.${big(`${lg(b, ' ' + N(m))} + ${lg(b, ' ' + N(n))}`)}`, type: 'number', answer: k, params: { kind, b, m, n },
          hints: [`Neither log is a whole number alone, so combine them: a sum of logs is the log of a product.`, `${lg(b, ` (${N(m)} · ${N(n)})`)} = ${lg(b, ' ' + N(tot))}.`, `${b}<sup>${k}</sup> = ${N(tot)}, so the value is <b>${k}</b>.`] };
      }
      if (kind === 'diff') {
        const b = rng.pick([2, 3, 5]), k = rng.int(1, 3), n = rng.pick([3, 5, 6, 7, 10].filter(x => x % b)), m = n * b ** k;
        return { prompt: `Evaluate.${big(`${lg(b, ' ' + N(m))} − ${lg(b, ' ' + N(n))}`)}`, type: 'number', answer: k, params: { kind, b, m, n },
          hints: [`A difference of logs is the log of a quotient.`, `${lg(b, ` (${N(m)} ÷ ${N(n)})`)} = ${lg(b, ' ' + N(m / n))}.`, `${b}<sup>${k}</sup> = ${N(m / n)}, so the value is <b>${k}</b>.`] };
      }
      if (kind === 'cob') {
        const b = rng.pick([2, 3, 5, 7]);
        let n = rng.int(5, 90); while (Math.abs(Math.round(Math.log(n) / Math.log(b)) - Math.log(n) / Math.log(b)) < 1e-9) n++;
        const lb = Math.log10(b), ln = Math.log10(n), ans = M.round(ln / lb, 2);
        return { prompt: `Use the change of base formula to evaluate. Round to two decimal places.${big(lg(b, ' ' + N(n)))}`, type: 'number', answer: ans, tolerance: 0.01, params: { kind, b, n },
          hints: [`${lg(b, ' ' + N(n))} = log ${N(n)} ÷ log ${b}.`, `log ${N(n)} ≈ ${N(M.round(ln, 4))} and log ${b} ≈ ${N(M.round(lb, 4))}.`, `${N(M.round(ln, 4))} ÷ ${N(M.round(lb, 4))} ≈ <b>${N(ans)}</b>.`] };
      }
      const b = rng.pick([2, 3, 5, 'b']), k = rng.int(2, 5);
      const L = v => `${lg(b === 'b' ? V('b') : b, ' ' + V(v))}`;
      const arg = sfrac(`${M.sup(X, k)}${Y}`, V('z'));
      const answer = `${k}${L('x')} + ${L('y')} − ${L('z')}`;
      const choices = [answer, `${L('x')} + ${k}${L('y')} − ${L('z')}`, `${k}${L('x')} − ${L('y')} + ${L('z')}`, `${k}${L('x')} + ${L('y')} + ${L('z')}`];
      return { prompt: `Expand using the properties of logarithms.${big(lg(b === 'b' ? V('b') : b, ` (${arg})`))}`, type: 'choice', choices, answer, params: { kind, k },
        hints: [`A quotient becomes a difference: the log of the numerator minus ${L('z')}.`, `A product becomes a sum: ${lg(b === 'b' ? V('b') : b, ` (${M.sup(X, k)}${Y})`)} = ${lg(b === 'b' ? V('b') : b, ' ' + M.sup(X, k))} + ${L('y')}.`, `A power comes down in front: ${lg(b === 'b' ? V('b') : b, ' ' + M.sup(X, k))} = ${k}${L('x')}. So the answer is <b>${answer}</b>.`] };
    },
    challenge(rng) {   // fractional answers from related bases, and condensing a multiple of a log
      if (rng.chance(0.6)) {
        const pb = rng.pick([2, 2, 3, 5]), maxI = { 2: 5, 3: 3, 5: 2 }[pb], maxJ = { 2: 7, 3: 5, 5: 4 }[pb];
        const i = rng.int(2, maxI); let j = rng.int(1, maxJ); while (j % i === 0) j = rng.int(1, maxJ);
        const neg = rng.chance(0.35), b = pb ** i, val = pb ** j, [n, d] = M.simp(neg ? -j : j, i), arg = neg ? F(1, val) : N(val);
        return { prompt: `Evaluate. Give a fraction.${big(lg(b, ' ' + arg))}`, type: 'number', answer: n / d, answerText: M.fracText(n, d), params: { kind: 'exact', b, num: neg ? 1 : val, den: neg ? val : 1 },
          hints: [`Write both numbers as powers of ${pb}: ${b} = ${pb}<sup>${i}</sup> and ${arg} = ${pb}<sup>${neg ? '−' : ''}${j}</sup>.`, `You need (${pb}<sup>${i}</sup>)<sup>${V('y')}</sup> = ${pb}<sup>${neg ? '−' : ''}${j}</sup>, so ${i}${V('y')} = ${neg ? '−' : ''}${j}.`, `${V('y')} = <b>${M.fracText(n, d)}</b>.`] };
      }
      const b = rng.pick([2, 3, 5]), k = rng.pick([2, 2, 3]), u = k === 2 ? rng.pick([1, 2]) : 1;
      const c = rng.pick([2, 3, 4, 5, 6, 7].filter(x => x % b)), m = c * b ** u, n = c ** k, e = u * k;
      return { prompt: `Evaluate.${big(`${k}${lg(b, ' ' + N(m))} − ${lg(b, ' ' + N(n))}`)}`, type: 'number', answer: e, params: { kind: 'condense', b, k, m, n },
        hints: [`Move the ${k} inside as a power: ${k}${lg(b, ' ' + N(m))} = ${lg(b, ` ${N(m)}<sup>${k}</sup>`)} = ${lg(b, ' ' + N(m ** k))}.`, `A difference of logs is the log of a quotient: ${lg(b, ` (${N(m ** k)} ÷ ${N(n)})`)} = ${lg(b, ' ' + N(m ** k / n))}.`, `${b}<sup>${e}</sup> = ${N(m ** k / n)}, so the value is <b>${e}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'exact') return Math.abs(Math.pow(pr.b, q.answer) - pr.num / pr.den) < 1e-9;
      if (pr.kind === 'sum') return Math.abs(Math.log(pr.m) / Math.log(pr.b) + Math.log(pr.n) / Math.log(pr.b) - q.answer) < 1e-9;
      if (pr.kind === 'diff') return Math.abs(Math.log(pr.m) / Math.log(pr.b) - Math.log(pr.n) / Math.log(pr.b) - q.answer) < 1e-9;
      if (pr.kind === 'condense') return Math.abs(pr.k * Math.log(pr.m) - Math.log(pr.n) - q.answer * Math.log(pr.b)) < 1e-9;
      if (pr.kind === 'cob') return Math.abs(Math.log2(pr.n) / Math.log2(pr.b) - q.answer) < 0.006;
      // numeric check of the expansion with x = 2, y = 3, z = 5: read the coefficient on each log and the signs
      const t = A.stripTags(q.answer).replace(/\s+/g, '');
      const m = t.match(/^(\d*)log\w+x([+−])(\d*)log\w+y([+−])log\w+z$/);
      if (!m) return false;
      const cx_ = Number(m[1] || 1), cy = Number(m[3] || 1), sy = m[2] === '+' ? 1 : -1, sz = m[4] === '+' ? 1 : -1;
      const lhs = Math.log(Math.pow(2, pr.k) * 3 / 5), rhs = cx_ * Math.log(2) + sy * cy * Math.log(3) + sz * Math.log(5);
      return Math.abs(lhs - rhs) < 1e-9;
    },
  });

  A.skill({
    id: 'alg2.solve-exponential', title: 'Solving exponential equations with logarithms',
    learn: p(`An <b>exponential equation</b> has the variable in an exponent. If both sides can be written as powers of the same base, set the exponents equal: 3<sup>${X} + 1</sup> = 81 = 3⁴ gives ${X} + 1 = 4, so ${X} = 3.`) +
      p(`<b>Otherwise, isolate the power, then take the log of both sides and bring the exponent down</b>: ${V('b')}<sup>${X}</sup> = ${V('c')} gives ${X} · log ${V('b')} = log ${V('c')}, so ${X} = log ${V('c')} ÷ log ${V('b')}. Divide out any number multiplying the power first.`) +
      p(`Doubling and tripling times work the same way: money growing 5% a year doubles when 1.05<sup>${V('t')}</sup> = 2. The starting amount cancels, so you don't need to know it.`) +
      example('Example 1: the same base', `${big(`2<sup>${P([3, -1])}</sup> = 32`)}32 = 2⁵, so 3${X} − 1 = 5. Then 3${X} = 6 and <b>${X} = 2</b>.`) +
      example('Example 2: using logs', `${big(`4 · 3<sup>${X}</sup> = 60`)}Divide by 4: 3<sup>${X}</sup> = 15. Take logs: ${X} = log 15 ÷ log 3 ≈ 1.1761 ÷ 0.4771 ≈ <b>2.46</b>.`) +
      example('Example 3: a doubling time', `Money grows 5% a year. It doubles when 1.05<sup>${V('t')}</sup> = 2, so ${V('t')} = log 2 ÷ log 1.05 ≈ 0.30103 ÷ 0.02119 ≈ <b>14.21 years</b>.`),
    make(rng) {
      const kind = rng.pick(['same-base', 'logs', 'logs', 'double']);
      if (kind === 'same-base') {
        const a = rng.pick([2, 2, 3, 5]), max = { 2: 6, 3: 4, 5: 3 }[a];
        const k = rng.int(1, max), pp = rng.pick([1, 1, 2, 3]), x = rng.int(-3, 4), c = k - pp * x;
        const expo = P([pp, c]);
        return { prompt: `Solve for ${X}.${big(`${a}<sup>${expo}</sup> = ${N(a ** k)}`)}`, type: 'number', answer: x, params: { kind, a, pp, c, k },
          hints: [`Write ${N(a ** k)} as a power of ${a}: ${a}<sup>${k}</sup>.`, `Equal powers of the same base have equal exponents: ${expo} = ${k}.`, `${M.term(pp, 'x')} = ${N(k - c)}, so <b>${X} = ${N(x)}</b>.`] };
      }
      if (kind === 'double') {
        const r = rng.pick([3, 4, 5, 6, 7, 8, 9, 12]), mult = rng.pick([2, 2, 3]), name = rng.pick(NAMES);
        const ans = M.round(Math.log(mult) / Math.log(1 + r / 100), 2);
        const dbl = mult === 2 ? 'doubles' : 'triples', say = rng.pick([
          `${name} invests money at ${r}% interest compounded once a year. How many years until it ${dbl}?`,
          `A town’s population grows ${r}% a year. How many years until it ${dbl}?`,
          `A scholarship fund earns ${r}% a year, added once a year. How many years until it ${dbl}?`,
          `${name}’s online chess club grows ${r}% a year. How many years until its membership ${dbl}?`,
          `The number of solar panels installed in a county grows ${r}% a year. How many years until it ${dbl}?`]);
        return { prompt: `${say} Round to two decimal places.`, type: 'number', answer: ans, tolerance: 0.01, unit: 'years', params: { kind, r, mult },
          hints: [`The amount ${mult === 2 ? 'doubles' : 'triples'} when ${N(1 + r / 100)}<sup>${V('t')}</sup> = ${mult}; the starting amount cancels.`, `Take logs: ${V('t')} = log ${mult} ÷ log ${N(1 + r / 100)}.`, `≈ ${N(M.round(Math.log10(mult), 4))} ÷ ${N(M.round(Math.log10(1 + r / 100), 4))} ≈ <b>${N(ans)} years</b>.`] };
      }
      const a = rng.pick([2, 3, 4, 5, 10]), b = rng.pick([2, 3, 5, 6]);
      let ratio = rng.int(3, 40); while (Math.abs(Math.log(ratio) / Math.log(b) - Math.round(Math.log(ratio) / Math.log(b))) < 1e-9) ratio++;
      const c = a * ratio, ans = M.round(Math.log10(ratio) / Math.log10(b), 2);
      return { prompt: `Solve for ${X}. Round to two decimal places.${big(`${N(a)} · ${b}<sup>${X}</sup> = ${N(c)}`)}`, type: 'number', answer: ans, tolerance: 0.01, params: { kind, a, b, c },
        hints: [`Isolate the power: divide both sides by ${a} to get ${b}<sup>${X}</sup> = ${N(ratio)}.`, `Take the log of both sides: ${X} · log ${b} = log ${N(ratio)}, so ${X} = log ${N(ratio)} ÷ log ${b}.`, `≈ ${N(M.round(Math.log10(ratio), 4))} ÷ ${N(M.round(Math.log10(b), 4))} ≈ <b>${N(ans)}</b>.`] };
    },
    challenge(rng) {   // two bases that are powers of one number, or a power with something added
      if (rng.bool()) {
        const pb = rng.pick([2, 2, 3]), [i, j] = rng.sample(pb === 2 ? [1, 2, 3, 4, 5] : [1, 2, 3], 2);
        const x = rng.int(-3, 5), c1 = rng.pick([1, 2]); let c2 = rng.pick([1, 2]); if (i * c1 === j * c2) c2 = c1;
        const d1 = rng.pick([-4, -3, -2, -1, 0, 1, 2, 3, 4].filter(v => (i * (c1 * x + v) - j * c2 * x) % j === 0)), d2 = (i * (c1 * x + d1) - j * c2 * x) / j;
        const b1 = pb ** i, b2 = pb ** j;
        return { prompt: `Solve for ${X}.${big(`${N(b1)}<sup>${P([c1, d1])}</sup> = ${N(b2)}<sup>${P([c2, d2])}</sup>`)}`, type: 'number', answer: x, params: { kind: 'two-base', b1, c1, d1, b2, c2, d2 },
          hints: [`Both bases are powers of ${pb}: ${N(b1)} = ${pb}<sup>${i}</sup> and ${N(b2)} = ${pb}<sup>${j}</sup>.`, `So ${pb}<sup>${i}(${P([c1, d1])})</sup> = ${pb}<sup>${j}(${P([c2, d2])})</sup>, and the exponents must be equal: ${P([i * c1, i * d1])} = ${P([j * c2, j * d2])}.`, `${M.term(i * c1 - j * c2, 'x')} = ${N(j * d2 - i * d1)}, so <b>${X} = ${N(x)}</b>.`] };
      }
      const a = rng.pick([2, 3, 4, 5]), b = rng.pick([2, 3, 5, 6, 7]), c = rng.nz(-20, 20);
      let ratio = rng.int(3, 60); while (Math.abs(Math.log(ratio) / Math.log(b) - Math.round(Math.log(ratio) / Math.log(b))) < 1e-9) ratio++;
      const d = a * ratio + c, ans = M.round(Math.log10(ratio) / Math.log10(b), 2);
      return { prompt: `Solve for ${X}. Round to two decimal places.${big(`${a} · ${b}<sup>${X}</sup> ${M.signed(c)} = ${N(d)}`)}`, type: 'number', answer: ans, tolerance: 0.01, params: { kind: 'logs2', a, b, c, d },
        hints: [`Isolate the power: ${c > 0 ? 'subtract' : 'add'} ${N(Math.abs(c))} to get ${a} · ${b}<sup>${X}</sup> = ${N(a * ratio)}, then divide by ${a}: ${b}<sup>${X}</sup> = ${N(ratio)}.`, `Take the log of both sides: ${X} = log ${N(ratio)} ÷ log ${b}.`, `≈ ${N(M.round(Math.log10(ratio), 4))} ÷ ${N(M.round(Math.log10(b), 4))} ≈ <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'same-base') return Math.pow(pr.a, pr.pp * q.answer + pr.c) === Math.pow(pr.a, pr.k);
      if (pr.kind === 'double') return Math.abs(Math.pow(1 + pr.r / 100, q.answer) - pr.mult) < 0.01 * pr.mult;
      if (pr.kind === 'two-base') {   // the logs of the two sides agree at the answer, and the equation is not the same on both sides
        const L = t => (pr.c1 * t + pr.d1) * Math.log(pr.b1) - (pr.c2 * t + pr.d2) * Math.log(pr.b2);
        return Math.abs(L(q.answer)) < 1e-9 && Math.abs(L(q.answer + 1) - L(q.answer)) > 1e-9;
      }
      if (pr.kind === 'logs2') { const g = t => pr.a * Math.pow(pr.b, t) + pr.c; return g(q.answer - 0.005) <= pr.d + 1e-9 && pr.d <= g(q.answer + 0.005) + 1e-9; }   // rounded to the nearest hundredth: the true x is within 0.005
      return Math.abs(Math.log2(pr.c / pr.a) / Math.log2(pr.b) - q.answer) < 0.006;
    },
  });

  /* ---------- Unit 9: Transformations of functions ---------- */
  const units_ = k => `${N(Math.abs(k))} unit${Math.abs(k) === 1 ? '' : 's'}`;
  const shiftLabel = (h, k) => `Shift ${units_(h)} ${h > 0 ? 'right' : 'left'} and ${units_(k)} ${k > 0 ? 'up' : 'down'}`;
  const reflLabel = (axis, k) => `Reflect across the ${axis}-axis, then shift ${units_(k)} ${k > 0 ? 'up' : 'down'}`;
  A.skill({
    id: 'alg2.shifts-reflections', title: 'Shifting and reflecting functions',
    learn: p(`A <b>transformation</b> moves or flips a graph. <b>${fx('f', `${X} − ${V('h')}`)} + ${V('k')} moves the graph of ${V('f')} right ${V('h')} and up ${V('k')}.</b> A change outside the function acts on the outputs and goes the way it looks: + 3 moves the graph up 3. A change inside acts on the inputs and goes the <b>opposite</b> way: ${fx('f', `${X} + 3`)} moves it left 3, because ${X} must be 3 less to give the same output.`) +
      p(`<b>−${fx('f', X)} reflects the graph across the ${X}-axis</b>: every output changes sign. <b>${fx('f', '−' + X)} reflects it across the ${Y}-axis</b>: every input changes sign.`) +
      p(`To move a point: (${V('a')}, ${V('b')}) on ${V('f')} becomes (${V('a')} + ${V('h')}, ${V('b')} + ${V('k')}) on ${fx('f', `${X} − ${V('h')}`)} + ${V('k')}.`) +
      example('Example 1: a shift', `${big(`${fx('g', X)} = ${fx('f', P([1, 4]))} − 2`)}Inside, + 4 moves the graph <b>4 left</b>; outside, − 2 moves it <b>2 down</b>. The point (1, 5) on ${V('f')} moves to (1 − 4, 5 − 2) = <b>(−3, 3)</b>.`) +
      example('Example 2: a reflection', `${big(`${fx('g', X)} = −${fx('f', X)} + 3`)}The minus sign is outside, so the graph <b>reflects across the ${X}-axis</b>, and then + 3 <b>shifts it up 3</b>. The point (2, 5) goes to (2, −5) and then to <b>(2, −2)</b>.`),
    make(rng) {
      const kind = rng.pick(['shift', 'shift', 'reflect', 'point']);
      const h = rng.nz(-6, 6), k = rng.nz(-6, 6);
      if (kind === 'reflect') {
        const axis = rng.pick(['x', 'y']);
        const g = axis === 'x' ? `−${fx('f', X)} ${M.signed(k)}` : `${fx('f', '−' + X)} ${M.signed(k)}`;
        const answer = reflLabel(axis, k);
        return { prompt: `How is the graph of ${V('g')} related to the graph of ${V('f')}?${big(`${fx('g', X)} = ${g}`)}`, type: 'choice', choices: [reflLabel('x', k), reflLabel('x', -k), reflLabel('y', k), reflLabel('y', -k)], keepOrder: true, answer, params: { kind, axis, k },
          hints: [axis === 'x' ? `The minus sign is outside, on the output: every ${Y}-value changes sign, a reflection across the ${X}-axis.` : `The minus sign is inside, on the input: ${X} is replaced by −${X}, a reflection across the ${Y}-axis.`, `${M.signed(k)} outside moves the graph ${k > 0 ? 'up' : 'down'} ${N(Math.abs(k))}.`, `<b>${answer}</b>.`] };
      }
      const g = `${fx('f', P([1, -h]))} ${M.signed(k)}`;
      const inside = `Inside, ${X} ${M.signed(-h)} moves the graph the opposite way to its sign: ${N(Math.abs(h))} ${h > 0 ? 'right' : 'left'}.`;
      const outside = `Outside, ${M.signed(k)} moves the graph ${N(Math.abs(k))} ${k > 0 ? 'up' : 'down'}.`;
      if (kind === 'point') {
        const a = rng.int(-5, 5), b = rng.int(-5, 5);
        const answer = M.pt(a + h, b + k);
        return { prompt: `The point ${M.pt(a, b)} is on the graph of ${V('f')}. Which point must be on the graph of ${V('g')}?${big(`${fx('g', X)} = ${g}`)}`, type: 'choice', choices: [answer, M.pt(a - h, b + k), M.pt(a + h, b - k), M.pt(a - h, b - k)], answer, params: { kind, a, b, h, k },
          hints: [inside + ' Add ' + N(h) + ' to the x-coordinate.', outside + ' Add ' + N(k) + ' to the y-coordinate.', `(${N(a)} ${M.signed(h)}, ${N(b)} ${M.signed(k)}) = <b>${answer}</b>.`] };
      }
      const answer = shiftLabel(h, k);
      return { prompt: `How is the graph of ${V('g')} related to the graph of ${V('f')}?${big(`${fx('g', X)} = ${g}`)}`, type: 'choice', choices: [answer, shiftLabel(-h, k), shiftLabel(h, -k), shiftLabel(-h, -k)], answer, params: { kind, h, k },
        hints: [inside, outside, `<b>${answer}</b>.`] };
    },
    verify(q) {
      const pr = q.params, t = A.stripTags(q.answer);
      if (pr.kind === 'point') {   // g(a + h) = f(a) + k must equal the point's y
        const [u, v] = t.replace(/−/g, '-').replace(/[()\s]/g, '').split(',').map(Number);
        return u - pr.h === pr.a && v === pr.b + pr.k;
      }
      const num = s => Number(s);
      const vert = t.match(/(\d+) units? (up|down)/);
      const kk = num(vert[1]) * (vert[2] === 'up' ? 1 : -1);
      if (pr.kind === 'reflect') return kk === pr.k && t.includes(`${pr.axis}-axis`);
      const hor = t.match(/(\d+) units? (right|left)/);
      return kk === pr.k && num(hor[1]) * (hor[2] === 'right' ? 1 : -1) === pr.h;
    },
  });

  A.skill({
    id: 'alg2.stretches', title: 'Stretching and compressing functions',
    learn: p(`<b>${V('a')} · ${fx('f', X)} stretches the graph vertically by a factor of ${V('a')}</b>: every ${Y}-value is multiplied by ${V('a')}, so the graph gets taller. If 0 &lt; ${V('a')} &lt; 1 the graph gets flatter instead, which is called a vertical <b>compression</b>.`) +
      p(`<b>${fx('f', `${V('b')}${X}`)} compresses the graph horizontally by a factor of 1/${V('b')}</b>: every ${X}-value is divided by ${V('b')}. As with shifts, a change inside works backwards: ${fx('f', '2' + X)} squeezes the graph toward the ${Y}-axis, and ${fx('f', `${F(1, 2)}${X}`)} stretches it to twice the width.`) +
      p(`For points: (${V('p')}, ${V('q')}) on ${V('f')} becomes (${V('p')}, ${V('a')}${V('q')}) on ${V('a')} · ${fx('f', X)}, and (${V('p')}/${V('b')}, ${V('q')}) on ${fx('f', V('b') + X)}.`) +
      example('Example 1: a horizontal change', `${big(`${fx('g', X)} = ${fx('f', '3' + X)}`)}The 3 is inside, so it is a <b>horizontal compression by a factor of 1/3</b>. Divide each ${X}-coordinate by 3: the point (6, 4) on ${V('f')} moves to <b>(2, 4)</b>.`) +
      example('Example 2: a vertical change', `${big(`${fx('g', X)} = ${F(1, 2)}${fx('f', X)}`)}The ${F(1, 2)} is outside, so it is a <b>vertical compression by a factor of 1/2</b>. Multiply each ${Y}-coordinate by ${F(1, 2)}: the point (4, −6) moves to <b>(4, −3)</b>.`),
    make(rng) {
      const k = rng.int(2, 5), kind = rng.pick(['describe', 'describe', 'point']);
      const form = rng.pick(['vs', 'vc', 'hc', 'hs']);
      const g = { vs: `${k}${fx('f', X)}`, vc: `${F(1, k)}${fx('f', X)}`, hc: fx('f', `${k}${X}`), hs: fx('f', `${F(1, k)}${X}`) }[form];
      if (kind === 'point') {
        const pp = k * rng.nz(-4, 4), qq = k * rng.nz(-4, 4);
        const pt = { vs: [pp, qq * k], vc: [pp, qq / k], hc: [pp / k, qq], hs: [pp * k, qq] };
        const answer = M.pt(...pt[form]);
        const choices = options(answer, [pt.vs, pt.vc, pt.hc, pt.hs].map(c => M.pt(...c)), null);
        return { prompt: `The point ${M.pt(pp, qq)} is on the graph of ${V('f')}. Which point must be on the graph of ${V('g')}?${big(`${fx('g', X)} = ${g}`)}`, type: 'choice', choices, answer, params: { kind, form, k, pp, qq },
          hints: [form[0] === 'v' ? `The factor is outside, so it acts on the ${Y}-coordinate; the ${X}-coordinate stays ${N(pp)}.` : `The factor is inside, so it acts on the ${X}-coordinate, backwards; the ${Y}-coordinate stays ${N(qq)}.`,
            { vs: `Multiply the ${Y}-coordinate by ${k}.`, vc: `Multiply the ${Y}-coordinate by ${M.fracText(1, k)}.`, hc: `Inside ×${k} means divide the ${X}-coordinate by ${k}.`, hs: `Inside ×${M.fracText(1, k)} means multiply the ${X}-coordinate by ${k}.` }[form], `<b>${answer}</b>.`] };
      }
      const L = { vs: `Vertical stretch by a factor of ${k}`, vc: `Vertical compression by a factor of 1/${k}`, hs: `Horizontal stretch by a factor of ${k}`, hc: `Horizontal compression by a factor of 1/${k}` };
      const answer = L[form];
      return { prompt: `How is the graph of ${V('g')} related to the graph of ${V('f')}?${big(`${fx('g', X)} = ${g}`)}`, type: 'choice', choices: [L.vs, L.vc, L.hs, L.hc], keepOrder: true, answer, params: { kind, form, k },
        hints: [form[0] === 'v' ? `The number multiplies the whole function (outside), so the change is vertical.` : `The number multiplies ${X} (inside), so the change is horizontal, and it works backwards.`,
          { vs: `Every ${Y}-value is multiplied by ${k}: the graph gets taller.`, vc: `Every ${Y}-value is multiplied by ${M.fracText(1, k)}: the graph gets flatter.`, hc: `Inside ×${k} divides every ${X}-value by ${k}: the graph gets narrower.`, hs: `Inside ×${M.fracText(1, k)} multiplies every ${X}-value by ${k}: the graph gets wider.` }[form], `<b>${answer}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      // a test function f(x) = x³ + x, which is one-to-one, and the transformed g
      const f = x => x * x * x + x;
      const g = { vs: x => pr.k * f(x), vc: x => f(x) / pr.k, hc: x => f(pr.k * x), hs: x => f(x / pr.k) }[pr.form];
      if (pr.kind === 'point') {
        const [u, v] = A.stripTags(q.answer).replace(/−/g, '-').replace(/[()\s]/g, '').split(',').map(Number);
        // (u, v) is the image of (pp, qq) when the same map takes a point of f to a point of g; test it on f's own point (pp, f(pp))
        const img = { vs: (x, y) => [x, pr.k * y], vc: (x, y) => [x, y / pr.k], hc: (x, y) => [x / pr.k, y], hs: (x, y) => [x * pr.k, y] }[pr.form];
        const [x1, y1] = img(pr.pp, f(pr.pp));
        return Math.abs(g(x1) - y1) < 1e-9 && JSON.stringify(img(pr.pp, pr.qq)) === JSON.stringify([u, v]);
      }
      const t = A.stripTags(q.answer);
      const vertical = Math.abs(g(1) / f(1) - (pr.form === 'vs' ? pr.k : pr.form === 'vc' ? 1 / pr.k : g(1) / f(1))) < 1e-9 && pr.form[0] === 'v';
      const wider = pr.form[0] === 'v' ? g(1) > f(1) : Math.abs(g(pr.k) - f(1)) < 1e-9;    // g(k) = f(1) only for the horizontal stretch
      return t.startsWith(vertical ? 'Vertical' : 'Horizontal') && t.includes(wider ? 'stretch' : 'compression');
    },
  });

  /* ---------- Unit 10: Equations ---------- */
  A.skill({
    id: 'alg2.rational-equations', title: 'Solving rational equations',
    learn: p(`A <b>rational equation</b> has the variable in a denominator. <b>Multiply both sides by the common denominator to clear the fractions, solve the equation that's left, then check that no solution makes a denominator zero.</b>`) +
      p(`When each side is a single fraction, you can <b>cross-multiply</b>: ${sfrac(V('a'), V('b'))} = ${sfrac(V('c'), V('d'))} gives ${V('a')}${V('d')} = ${V('b')}${V('c')}. A value that makes a denominator zero is <b>extraneous</b>: you throw it out even if it solves the cleared equation, because the original equation isn't defined there.`) +
      example('Example 1: cross-multiplying', `${big(`${sfrac('3', P([1, -1]))} = ${sfrac('2', P([1, 4]))}`)}Cross-multiply: 3(${X} + 4) = 2(${X} − 1), so 3${X} + 12 = 2${X} − 2 and ${X} = −14. Neither denominator is zero there, so <b>${X} = −14</b>.`) +
      example('Example 2: an extraneous solution', `${big(`${sfrac(M.sup(X, 2), P([1, -3]))} = ${sfrac(P([1, 6]), P([1, -3]))}`)}The denominators match, so ${X}² = ${X} + 6, ${X}² − ${X} − 6 = 0 and (${X} − 3)(${X} + 2) = 0. But ${X} = 3 makes the denominator zero, so it is extraneous. <b>${X} = −2</b>.`) +
      example('Example 3: clearing a denominator of x', `${big(`${sfrac('6', X)} + 2 = ${sfrac('18', X)}`)}Multiply every term by ${X}: 6 + 2${X} = 18, so 2${X} = 12 and <b>${X} = 6</b>, which isn't 0, so it works.`),
    make(rng) {
      const kind = rng.pick(['cross', 'cross', 'extraneous', 'recip']);
      if (kind === 'cross') {
        const x = rng.int(-8, 8), [pp, qq] = rng.sample([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6].filter(t => t !== x), 2);
        const s = rng.nz(-3, 3);
        let a = s * (x - pp), b = s * (x - qq); const g = M.gcd(a, b); a /= g; b /= g;
        return { prompt: `Solve for ${X}.${big(`${sfrac(N(a), P([1, -pp]))} = ${sfrac(N(b), P([1, -qq]))}`)}`, type: 'number', answer: x, params: { kind, a, b, pp, qq },
          hints: [`Cross-multiply: ${N(a)}(${P([1, -qq])}) = ${N(b)}(${P([1, -pp])}).`, `Expand: ${P([a, -a * qq])} = ${P([b, -b * pp])}. Collect: ${M.term(a - b, 'x')} = ${N(a * qq - b * pp)}.`, `${X} = ${N(a * qq - b * pp)} ÷ ${wrap(a - b)}. It does not make either denominator zero, so <b>${X} = ${N(x)}</b>.`] };
      }
      if (kind === 'extraneous') {
        const pp = rng.nz(-6, 6); let r = rng.int(-7, 7); if (r === pp) r = -pp === r ? r + 1 : -pp;
        const m = pp + r, n = -pp * r;
        return { prompt: `Solve for ${X}. Leave out any extraneous solution.${big(`${sfrac(M.sup(X, 2), P([1, -pp]))} = ${sfrac(P([m, n]), P([1, -pp]))}`)}`, type: 'number', answer: r, params: { kind, pp, m, n },
          hints: [`Multiply both sides by ${P([1, -pp])}: ${X}² = ${P([m, n])}.`, `Rearrange: ${P([1, -m, -n])} = 0, which factors as (${P([1, -pp])})(${P([1, -r])}) = 0, so ${X} = ${N(pp)} or ${X} = ${N(r)}.`, `${X} = ${N(pp)} makes the denominator zero, so it is extraneous. <b>${X} = ${N(r)}</b>.`] };
      }
      const x = rng.nz(-9, 9), b = rng.nz(-5, 5), a = rng.nz(-9, 9); let c = a + b * x; if (c === 0) c = 0;
      return { prompt: `Solve for ${X}.${big(`${sfrac(N(a), X)} ${M.signed(b)} = ${sfrac(N(c), X)}`)}`, type: 'number', answer: x, params: { kind, a, b, c },
        hints: [`Multiply every term by ${X}: ${N(a)} ${M.signed(b)}${X} = ${N(c)}.`, `${M.term(b, 'x')} = ${N(c)} − ${wrap(a)} = ${N(c - a)}.`, `${X} = ${N(c - a)} ÷ ${wrap(b)}, which is not 0, so <b>${X} = ${N(x)}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      const ok = pr.kind === 'cross' ? t => t !== pr.pp && t !== pr.qq && Math.abs(pr.a / (t - pr.pp) - pr.b / (t - pr.qq)) < 1e-9
        : pr.kind === 'extraneous' ? t => t !== pr.pp && Math.abs(t * t / (t - pr.pp) - (pr.m * t + pr.n) / (t - pr.pp)) < 1e-9
          : t => t !== 0 && Math.abs(pr.a / t + pr.b - pr.c / t) < 1e-9;
      const sols = []; for (let t = -50; t <= 50; t++) if (ok(t)) sols.push(t);
      return sols.length === 1 && sols[0] === q.answer;
    },
  });

  A.skill({
    id: 'alg2.quadratic-systems', title: 'Systems with a quadratic equation',
    learn: p(`A <b>system</b> is a set of equations that must all be true at once; its solutions are the points where the graphs meet. A line and a parabola can meet in two points, in one point (the line just touches), or not at all.`) +
      p(`<b>To solve, set the two expressions for ${Y} equal, move everything to one side, and solve the quadratic. Then substitute each ${X} into the line to find its ${Y}.</b>`) +
      p(`To count the solutions without finding them, use the <b>discriminant</b> ${V('b')}² − 4${V('a')}${V('c')} of that quadratic: positive means two solutions, zero means one, and negative means none.`) +
      example('Example 1: solving', `${big(`${Y} = ${P([1, -1, -4])} and ${Y} = ${P([1, 4])}`)}${P([1, -1, -4])} = ${P([1, 4])} gives ${P([1, -2, -8])} = 0 = (${X} − 4)(${X} + 2). Then ${Y} = 4 + 4 = 8 and ${Y} = −2 + 4 = 2: <b>(−2, 2) and (4, 8)</b>.`) +
      example('Example 2: counting solutions', `${big(`${Y} = ${P([1, 2, 5])} and ${Y} = ${P([2, 1])}`)}${P([1, 2, 5])} = ${P([2, 1])} gives ${P([1, 0, 4])} = 0. The discriminant is 0² − 4(1)(4) = −16, which is negative, so there are <b>no solutions</b>: the line passes below the parabola.`),
    make(rng) {
      const m = rng.nz(-4, 4), k = rng.int(-6, 6);
      if (rng.chance(0.35)) {
        const n = rng.pick([0, 1, 2]), b = m + 2 * rng.int(-3, 3), h = (b - m) / 2;
        const c = k + h * h + (n === 1 ? 0 : n === 0 ? rng.int(1, 6) : -rng.int(1, 9));
        return { prompt: `How many solutions does the system have?${big(`${Y} = ${P([1, b, c])}<br>${Y} = ${P([m, k])}`)}`, type: 'number', answer: n, params: { kind: 'count', b, c, m, k },
          hints: [`Set them equal and move everything to one side: ${P([1, b - m, c - k])} = 0.`, `Discriminant: ${wrap(b - m)}² − 4(1)${wrap(c - k)} = ${N((b - m) ** 2 - 4 * (c - k))}, which is ${n === 2 ? 'positive' : n === 1 ? 'zero' : 'negative'}.`, `So there ${n === 1 ? 'is' : 'are'} <b>${n}</b> solution${n === 1 ? '' : 's'}.`] };
      }
      let [r1, r2] = rng.sample([-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6], 2).sort((u, v) => u - v);
      if (r1 + r2 === 0) r2 += 1;
      const b = m - (r1 + r2), c = k + r1 * r2, y = t => m * t + k;
      const pair = (u, v) => `${M.pt(u, y(u))} and ${M.pt(v, y(v))}`;
      const answer = pair(r1, r2);
      const choices = options(answer, [pair(-r2, -r1), `${M.pt(r1, y(r2))} and ${M.pt(r2, y(r1))}`, pair(r1 + 1, r2 + 1)], null);
      return { prompt: `Solve the system.${big(`${Y} = ${P([1, b, c])}<br>${Y} = ${P([m, k])}`)}`, type: 'choice', choices, answer, params: { kind: 'solve', b, c, m, k },
        hints: [`Set the right sides equal: ${P([1, b, c])} = ${P([m, k])}, so ${P([1, b - m, c - k])} = 0.`, `Factor: (${P([1, -r1])})(${P([1, -r2])}) = 0, so ${X} = ${N(r1)} or ${X} = ${N(r2)}.`, `Use the line for ${Y}: ${Y} = ${N(m)}(${N(r1)}) ${M.signed(k)} = ${N(y(r1))} and ${Y} = ${N(m)}(${N(r2)}) ${M.signed(k)} = ${N(y(r2))}.`, `<b>${answer}</b>.`] };
    },
    verify(q) {
      const { kind, b, c, m, k } = q.params;
      const h = t => t * t + b * t + c - (m * t + k);
      if (kind === 'count') { const v = h(-(b - m) / 2); return q.answer === (v < 0 ? 2 : v === 0 ? 1 : 0); }
      const nums = A.stripTags(q.answer).replace(/−/g, '-').match(/-?\d+/g).map(Number);
      const pts = [[nums[0], nums[1]], [nums[2], nums[3]]];
      let roots = 0; for (let t = -30; t <= 30; t++) if (h(t) === 0) roots++;
      return roots === 2 && pts[0][0] !== pts[1][0] && pts.every(([u, v]) => v === u * u + b * u + c && v === m * u + k);
    },
  });

  /* ---------- Unit 11: Trigonometry ---------- */
  const piTxt = (n, d) => { [n, d] = M.simp(n, d); const top = `${n === 1 ? '' : n === -1 ? '−' : N(n)}π`; return d === 1 ? top : sfrac(top, d); };
  const TRIG_LAB = ['0', F(1, 2), sfrac(M.sqrt(2), 2), sfrac(M.sqrt(3), 2), '1'];
  const TRIG_VAL = [0, 0.5, Math.SQRT2 / 2, Math.sqrt(3) / 2, 1];
  const REF = { 0: 0, 30: 1, 45: 2, 60: 3, 90: 4 };
  const trigLabel = (idx, sgn) => (sgn < 0 && idx > 0 ? '−' : '') + TRIG_LAB[idx];
  function trigExact(fn, deg) {
    let s = ((fn === 'sin' ? deg : 90 - deg) % 360 + 360) % 360, ref, sgn;
    if (s <= 90) { ref = s; sgn = 1; } else if (s <= 180) { ref = 180 - s; sgn = 1; } else if (s <= 270) { ref = s - 180; sgn = -1; } else { ref = 360 - s; sgn = -1; }
    return [REF[ref], sgn];
  }

  const QUADRANT = ['first', 'second', 'third', 'fourth'];
  /** where an angle in standard position ends, in words */
  function endsIn(deg) {
    const d = ((deg % 360) + 360) % 360;
    if (d % 90 === 0) return 'on the ' + ['positive x-axis', 'positive y-axis', 'negative x-axis', 'negative y-axis'][d / 90];
    return `in the ${QUADRANT[Math.floor(d / 90)]} quadrant`;
  }
  /** a unit circle with an angle θ of deg degrees (0 to 360) in standard position, its ending side and point on the circle;
      opts.point labels that point, opts.ref labels the reference angle; opts.label is the text alternative */
  function unitCircleSvg(deg, opts) {
    opts = opts || {};
    const cx = 150, cy = 112, R = 82, f = v => v.toFixed(1);
    const at = (r, a) => [cx + r * Math.cos(a), cy - r * Math.sin(a)];
    const t = deg * Math.PI / 180, P = at(R, t), d = ((deg % 360) + 360) % 360;
    let g = `<line x1="40" y1="${cy}" x2="262" y2="${cy}" stroke="var(--muted)" stroke-width="1.2"/><line x1="${cx}" y1="14" x2="${cx}" y2="210" stroke="var(--muted)" stroke-width="1.2"/>`;
    g += `<text x="262" y="${cy - 6}" font-size="12" font-style="italic" fill="var(--muted)" text-anchor="end">x</text><text x="${cx + 6}" y="24" font-size="12" font-style="italic" fill="var(--muted)">y</text>`;
    g += `<text x="${cx + R + 4}" y="${cy + 15}" font-size="11" fill="var(--muted)">1</text><text x="${cx - R - 4}" y="${cy + 15}" font-size="11" fill="var(--muted)" text-anchor="end">−1</text>`;
    g += `<circle class="stroke light" cx="${cx}" cy="${cy}" r="${R}"/>`;
    if (d) {                                   // the angle θ, counterclockwise from the positive x-axis
      const r1 = 18, e = at(r1, t), m = at(r1 + 11, t / 2);
      g += `<path class="stroke" style="stroke-width:1.5" d="M${cx + r1},${cy} A${r1},${r1} 0 ${d > 180 ? 1 : 0} 0 ${f(e[0])},${f(e[1])}"/>`;
      g += `<text x="${f(m[0])}" y="${f(m[1] + 4)}" font-size="13" font-style="italic" text-anchor="middle">θ</text>`;
    }
    if (opts.ref && d % 90) {                  // the reference angle, between the ending side and the x-axis
      const q = Math.floor(d / 90), lo = [0, t, Math.PI, t][q], hi = [t, Math.PI, t, 2 * Math.PI][q], r2 = 30;
      const s0 = at(r2, lo), s1 = at(r2, hi), m = at(r2 + 14, (lo + hi) / 2);
      g += `<line x1="${f(P[0])}" y1="${f(P[1])}" x2="${f(P[0])}" y2="${cy}" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3"/>`;
      g += `<path class="stroke" style="stroke-width:1.5" d="M${f(s0[0])},${f(s0[1])} A${r2},${r2} 0 0 0 ${f(s1[0])},${f(s1[1])}"/>`;
      g += `<text x="${f(m[0])}" y="${f(m[1] + 4)}" font-size="11" text-anchor="middle">${opts.ref}</text>`;
    }
    g += `<line class="line" x1="${cx}" y1="${cy}" x2="${f(P[0])}" y2="${f(P[1])}"/><circle class="dot" cx="${f(P[0])}" cy="${f(P[1])}" r="4.5"/>`;
    if (opts.point) {
      const lx = Math.min(240, Math.max(60, P[0] + 24 * Math.cos(t))), ly = Math.sin(t) >= -1e-9 ? P[1] - 10 : P[1] + 20;
      g += `<text x="${f(lx)}" y="${f(ly)}" font-size="12" text-anchor="middle">${opts.point}</text>`;
    }
    const label = opts.label || `unit circle with an angle θ in standard position, ending ${endsIn(deg)}`;
    return `<svg class="figure" viewBox="0 0 300 222" width="300" height="222" role="img" aria-label="${label}"><desc>${label}</desc>${g}</svg>`;
  }

  A.skill({
    id: 'alg2.unit-circle', title: 'Radians and the unit circle',
    learn: p(`A <b>radian</b> is another unit for measuring angles. <b>A full turn is 360° = 2π radians, so 180° = π radians.</b> To change degrees to radians, multiply by π/180; to change radians to degrees, multiply by 180/π. The common ones: 90° = π/2, 60° = π/3, 45° = π/4 and 30° = π/6.`) +
      p(`The <b>unit circle</b> has radius 1 and its center at the origin. An angle θ in <b>standard position</b> starts on the positive ${X}-axis and turns counterclockwise. Where it ends, the point on the circle is <b>(cos θ, sin θ)</b>. The special values are 0, ½, √2/2, √3/2 and 1: for π/6 the point is (√3/2, ½), for π/4 it's (√2/2, √2/2), and for π/3 it's (½, √3/2).`) +
      p(`For other angles, find the <b>reference angle</b>: the acute angle between the ending side and the ${X}-axis. It gives the size of cos θ and sin θ, and the quadrant gives the sign. Cosine is negative on the left half of the circle, and sine is negative on the bottom half.`) +
      example('Example 1: converting', `${big(`150° and ${piTxt(7, 4)}`)}150° × π/180 = 150π/180 = <b>${piTxt(5, 6)}</b>. Going back, ${piTxt(7, 4)} × 180/π = 7 × 45 = <b>315°</b>.`) +
      example('Example 2: an exact value', `${big(`sin ${piTxt(5, 4)}`)}${unitCircleSvg(225, { point: '(−√2/2, −√2/2)', ref: '45°', label: 'unit circle with an angle θ of 225 degrees in standard position, ending in the third quadrant at the point (−√2/2, −√2/2), with a reference angle of 45 degrees to the negative x-axis' })}5π/4 = 225°, which ends in the third quadrant with a reference angle of 45°. sin 45° = √2/2, and sine is negative below the ${X}-axis: <b>−√2/2</b>.`),
    make(rng) {
      const kind = rng.pick(['to-deg', 'to-rad', 'value', 'value']);
      const d = rng.pick([2, 3, 4, 6, 6, 5, 9, 10, 12, 18]);   // 180/d is a whole number of degrees
      let n = rng.int(1, 2 * d - 1); while (M.gcd(n, d) !== 1) n = rng.int(1, 2 * d - 1);
      const deg = 180 * n / d;
      if (kind === 'to-deg') return { prompt: `Convert to degrees.${big(`${piTxt(n, d)} radians`)}`, type: 'number', answer: deg, unit: '°', params: { kind, n, d },
        hints: [`Replace π with 180°: ${piTxt(n, d)} = ${n === 1 ? '' : n + ' × '}180° ÷ ${d}.`, `180 ÷ ${d} = ${180 / d}${n === 1 ? '' : `, and ${n} × ${180 / d} = ${deg}`}.`, `<b>${deg}°</b>.`] };
      if (kind === 'to-rad') {
        const answer = piTxt(n, d);
        const choices = options(answer, [piTxt(d, n), piTxt(n, 2 * d), piTxt(2 * n, d)], () => piTxt(n + rng.pick([-1, 1]) * 1, d) );
        return { prompt: `Convert ${deg}° to radians.`, type: 'choice', choices, answer, params: { kind, deg },
          hints: [`Multiply by π/180: ${deg}° × π/180 = ${deg}π/180.`, `Simplify ${deg}/180 by dividing by ${M.gcd(deg, 180)}: ${M.fracText(deg, 180)}.`, `<b>${answer}</b> radians.`] };
      }
      const fn = rng.pick(['sin', 'cos']), dd = rng.pick([1, 2, 3, 4, 6, 6]);
      let nn = rng.int(0, 2 * dd - 1); while (M.gcd(nn, dd) !== 1 && nn !== 0) nn = rng.int(0, 2 * dd - 1);
      const dg = 180 * nn / dd;
      const [idx, sgn] = trigExact(fn, dg), [oidx] = trigExact(fn === 'sin' ? 'cos' : 'sin', dg);
      const answer = trigLabel(idx, sgn);
      const choices = options(answer, [trigLabel(idx, -sgn), trigLabel(oidx, sgn), trigLabel(oidx, -sgn)], () => trigLabel(rng.int(0, 4), rng.sign()));
      const ang = nn === 0 ? '0' : piTxt(nn, dd);
      const ref = { 0: 0, 1: 30, 2: 45, 3: 60, 4: 90 };
      const fig = unitCircleSvg(dg, { label: `unit circle with an angle θ of ${nn === 0 ? '0' : A.stripTags(ang).replace(/\s+/g, '').replace(/π(\d)/, 'π/$1')} radians in standard position, ending ${endsIn(dg)}` });
      return { prompt: `Find the exact value. The picture shows the angle on the unit circle.${big(`${fn} ${ang}`)}${fig}`, type: 'choice', choices, answer, params: { kind, fn, nn, dd },
        hints: [`${ang} radians is ${dg}°.`, `The point on the unit circle is (cos, sin); for ${dg}° the reference angle is ${ref[trigExact('sin', dg)[0]]}°, and ${fn === 'sin' ? 'sine is the y-coordinate' : 'cosine is the x-coordinate'}.`, `${fn} ${dg}° is ${sgn > 0 || idx === 0 ? 'not negative' : 'negative'} here: <b>${answer}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'to-deg') return Math.abs(pr.n * Math.PI / pr.d * 180 / Math.PI - q.answer) < 1e-9;
      if (pr.kind === 'to-rad') {   // read "nπ/d" back and compare in radians
        const t = A.stripTags(q.answer).replace(/\s+/g, '').replace(/−/g, '-');
        const m = t.match(/^(-?\d*)π(\d*)$/);
        const val = (m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1])) * Math.PI / (m[2] ? Number(m[2]) : 1);
        return Math.abs(val - pr.deg * Math.PI / 180) < 1e-9;
      }
      const th = pr.nn * Math.PI / pr.dd, want = pr.fn === 'sin' ? Math.sin(th) : Math.cos(th);
      const t = A.stripTags(q.answer).replace(/\s+/g, '');
      const neg = t.startsWith('−'), body = t.replace('−', '');
      const val = { '0': 0, '1': 1, '12': 0.5, '√22': Math.SQRT2 / 2, '√32': Math.sqrt(3) / 2 }[body];
      return Math.abs((neg ? -1 : 1) * val - want) < 1e-9;
    },
  });

  /** real things that rise and fall like a sinusoid: [max, min, unit, the situation] */
  const WAVES = [
    rng => { const mn = rng.int(1, 5), a = rng.int(10, 30); return [mn + 2 * a, mn, 'm', (mx, lo) => `A seat on a Ferris wheel is ${N(mx)} m above the ground at its highest point and ${N(lo)} m at its lowest.`]; },
    rng => { const mn = rng.int(2, 8), a = rng.int(1, 6); return [mn + 2 * a, mn, 'ft', (mx, lo) => `The water at a harbor dock is ${N(mx)} feet deep at high tide and ${N(lo)} feet deep at low tide.`]; },
    rng => { const mn = rng.int(40, 70), a = rng.int(5, 15); return [mn + 2 * a, mn, '°F', (mx, lo) => `Over one day, the temperature in a desert town rises to a high of ${N(mx)}°F and falls to a low of ${N(lo)}°F.`]; },
    rng => { const a = rng.pick([2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6]); return [12 + a, 12 - a, 'hours', (mx, lo) => `A northern city gets ${N(mx)} hours of daylight on its longest day and ${N(lo)} hours on its shortest.`]; },
    rng => { const mn = rng.int(8, 20), a = rng.int(3, 12); return [mn + 2 * a, mn, 'cm', (mx, lo) => `In a physics lab, a weight on a spring bobs up and down between ${N(mx)} cm and ${N(lo)} cm above the table.`]; },
  ];
  A.skill({
    id: 'alg2.sinusoids', title: 'Amplitude, midline and period',
    learn: p(`The graph of ${Y} = ${V('a')} sin(${V('b')}${X}) + ${V('d')}, or the same with cos, is a repeating wave called a <b>sinusoid</b>. <b>Amplitude = |${V('a')}|</b>, the distance from the middle of the wave to a peak. <b>Midline: ${Y} = ${V('d')}</b>, the horizontal line through the middle. <b>Period = 2π ÷ ${V('b')}</b>, the length of one full cycle.`) +
      p(`From the highest and lowest values (the maximum and minimum): the midline is halfway between them, (max + min) ÷ 2, and the amplitude is half the distance between them, (max − min) ÷ 2. A negative ${V('a')} flips the wave upside down but doesn't change the amplitude.`) +
      example('Example 1: reading an equation', `${big(`${Y} = −3 sin(${sfrac('π', 2)}${X}) + 1`)}Amplitude |−3| = <b>3</b>, midline <b>${Y} = 1</b>, and period 2π ÷ ${sfrac('π', 2)} = 2π · ${sfrac(2, 'π')} = <b>4</b>.`) +
      example('Example 2: from the highest and lowest points', `A seat on a Ferris wheel is 38 m above the ground at its highest and 2 m at its lowest. The midline is (38 + 2) ÷ 2 = <b>20 m</b>, and the amplitude is (38 − 2) ÷ 2 = <b>18 m</b>.`),
    make(rng) {
      const kind = rng.pick(['amp', 'mid', 'period', 'period', 'maxmin', 'context']);
      if (kind === 'context') {
        const [mx, mn, u, say] = rng.pick(WAVES)(rng), ask = rng.pick(['amplitude', 'midline']), ans = ask === 'amplitude' ? (mx - mn) / 2 : (mx + mn) / 2;
        return { prompt: `${say(mx, mn)} If this is modeled by a sinusoid, what is ${ask === 'amplitude' ? 'its amplitude' : 'the value of its midline'}?`, type: 'number', answer: ans, unit: u, params: { kind: 'maxmin', mx, mn, ask },
          hints: [ask === 'amplitude' ? `The amplitude is half the distance from the lowest value to the highest.` : `The midline is halfway between the highest and lowest values.`, ask === 'amplitude' ? `(${N(mx)} − ${N(mn)}) ÷ 2 = ${N(mx - mn)} ÷ 2.` : `(${N(mx)} + ${N(mn)}) ÷ 2 = ${N(mx + mn)} ÷ 2.`, `<b>${N(ans)} ${u}</b>.`] };
      }
      if (kind === 'maxmin') {
        const d = rng.int(-6, 6), a = rng.int(1, 7), ask = rng.pick(['amplitude', 'midline']), mx = d + a, mn = d - a;
        const ans = ask === 'amplitude' ? a : d;
        return { prompt: `A sinusoidal graph has a maximum value of ${N(mx)} and a minimum value of ${N(mn)}. ${ask === 'amplitude' ? 'What is its amplitude?' : `Its midline is ${Y} = ${V('k')}. What is ${V('k')}?`}`, type: 'number', answer: ans, params: { kind, mx, mn, ask },
          hints: [ask === 'amplitude' ? `The amplitude is half the distance from the minimum to the maximum.` : `The midline is halfway between the maximum and the minimum.`, ask === 'amplitude' ? `(${N(mx)} − ${wrap(mn)}) ÷ 2 = ${N(mx - mn)} ÷ 2.` : `(${N(mx)} + ${wrap(mn)}) ÷ 2 = ${N(mx + mn)} ÷ 2.`, `<b>${N(ans)}</b>.`] };
      }
      const a = rng.nz(-6, 6), d = rng.int(-5, 5), fn = rng.pick(['sin', 'cos']);
      const k = rng.int(1, 6), two = rng.bool();          // b = π/k (period 2k) or 2π/k (period k)
      const bTxt = piTxt(two ? 2 : 1, k);
      const per = two ? k : 2 * k;
      const shown = `${Y} = ${a === 1 ? '' : a === -1 ? '−' : N(a)}${fn}(${bTxt}${X})${d ? ' ' + M.signed(d) : ''}`;
      const params = { kind, a, d, fn, k, two };
      if (kind === 'amp') return { prompt: `What is the amplitude?${big(shown)}`, type: 'number', answer: Math.abs(a), params, hints: [`The amplitude is the absolute value of the number in front of ${fn}.`, `That number is ${N(a)}${a < 0 ? '; the minus sign only flips the wave' : ''}.`, `Amplitude = <b>${Math.abs(a)}</b>.`] };
      if (kind === 'mid') return { prompt: `The midline is ${Y} = ${V('k')}. What is ${V('k')}?${big(shown)}`, type: 'number', answer: d, params, hints: [`The midline is set by the number added at the end, which shifts the whole wave up or down.`, d ? `The wave is shifted by ${N(d)}.` : `Nothing is added, so the wave is centered on the ${X}-axis.`, `Midline ${Y} = <b>${N(d)}</b>.`] };
      return { prompt: `What is the period?${big(shown)}`, type: 'number', answer: per, params, hints: [`Period = 2π ÷ ${V('b')}, where ${V('b')} multiplies ${X}. Here ${V('b')} = ${bTxt}.`, `Dividing by ${bTxt} is the same as multiplying by its reciprocal, and the π cancels: 2π ÷ ${bTxt} = ${per}.`, `Period = <b>${per}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'maxmin') return q.answer === (pr.ask === 'amplitude' ? (pr.mx - pr.mn) / 2 : (pr.mx + pr.mn) / 2);
      const b = (pr.two ? 2 : 1) * Math.PI / pr.k, f = x => pr.a * Math[pr.fn](b * x) + pr.d;
      const ys = []; for (let i = 0; i <= 2400; i++) ys.push(f(i * 2 * pr.k / 2400 * 2));
      const mx = Math.max(...ys), mn = Math.min(...ys);
      if (pr.kind === 'amp') return Math.abs((mx - mn) / 2 - q.answer) < 1e-6;
      if (pr.kind === 'mid') return Math.abs((mx + mn) / 2 - q.answer) < 1e-6;
      const T = q.answer, pts = [0.1, 0.37, 1.3, 2.9];
      return pts.every(x => Math.abs(f(x + T) - f(x)) < 1e-9) && pts.some(x => Math.abs(f(x + T / 2) - f(x)) > 1e-6);
    },
  });

  /* ---------- Unit 12: Modeling ---------- */
  function modelTable(rng) {
    const type = rng.pick(['Linear', 'Quadratic', 'Exponential']);
    const xs = [0, 1, 2, 3, 4];
    let f, desc;
    if (type === 'Linear') { const m = rng.nz(-9, 9), c = rng.int(-10, 30); f = x => m * x + c; desc = { m, c }; }
    else if (type === 'Quadratic') { const a = rng.nz(-3, 3), b = rng.int(-6, 6), c = rng.int(-10, 20); f = x => a * x * x + b * x + c; desc = { a, b, c }; }
    else { const g = rng.pick([2, 3, 0.5]), c = g === 0.5 ? rng.pick([16, 32, 48, 64, 80]) * 2 : rng.pick([1, 2, 3, 4, 5, 6]) * rng.sign(); f = x => c * Math.pow(g, x); desc = { g, c }; }
    return { type, xs, ys: xs.map(f), f, desc };
  }
  const diffs = a => a.slice(1).map((v, i) => v - a[i]);
  function classify(ys) {
    const d1 = diffs(ys), d2 = diffs(d1);
    if (d1.every(v => v === d1[0])) return 'Linear';
    if (d2.every(v => v === d2[0])) return 'Quadratic';
    const r = ys.slice(1).map((v, i) => v / ys[i]);
    return r.every(v => Math.abs(v - r[0]) < 1e-12) ? 'Exponential' : 'none';
  }
  const tableOf = t => M.table([X, Y], t.xs.map((x, i) => [N(x), N(t.ys[i])]), { compact: true });

  A.skill({
    id: 'alg2.choose-model', title: 'Choosing a model from a table',
    learn: p(`When the ${X}-values in a table go up in equal steps, the ${Y}-values tell you which kind of function fits. Start with the <b>first differences</b>: subtract each ${Y}-value from the next one.`) +
      p(`<b>Linear: the first differences are constant. Quadratic: the first differences change, but the second differences (the differences of the differences) are constant. Exponential: the ratios of consecutive ${Y}-values are constant</b>, where you divide each ${Y}-value by the one before it.`) +
      example('Example 1: linear', `${big('y: 7, 4, 1, −2, −5')}The first differences are −3, −3, −3, −3, all the same, so the model is <b>linear</b>.`) +
      example('Example 2: quadratic', `${big('y: 1, 3, 9, 19, 33')}The first differences 2, 6, 10, 14 change, but the second differences are 4, 4, 4, so the model is <b>quadratic</b>.`) +
      example('Example 3: exponential', `${big('y: 3, 6, 12, 24, 48')}The differences 3, 6, 12, 24 aren't constant, and neither are their differences 3, 6, 12. But every ratio is 2, so the model is <b>exponential</b>.`),
    make(rng) {
      const t = modelTable(rng);
      const d1 = diffs(t.ys), d2 = diffs(d1);
      const hints = [`First differences: ${d1.map(N).join(', ')}.${t.type === 'Linear' ? ' They are all the same.' : ' They are not constant.'}`];
      if (t.type !== 'Linear') hints.push(t.type === 'Quadratic' ? `Second differences: ${d2.map(N).join(', ')}, all the same.` : `Second differences: ${d2.map(N).join(', ')}, not constant either. Ratios: each ${Y} is ${N(t.desc.g)} times the one before.`);
      hints.push(`The model is <b>${t.type.toLowerCase()}</b>.`);
      return { prompt: `Which kind of function fits the table best?${tableOf(t)}`, type: 'choice', choices: ['Linear', 'Quadratic', 'Exponential'], keepOrder: true, answer: t.type, hints, params: { ys: t.ys } };
    },
    verify(q) { return classify(q.params.ys) === q.answer; },
  });

  A.skill({
    id: 'alg2.model-predict', title: 'Using a model to predict',
    learn: p(`Once you know the kind of model, you can extend the table one step at a time. <b>Linear: keep adding the same difference. Quadratic: keep adding the same second difference to the first differences. Exponential: keep multiplying by the same ratio.</b>`) +
      p(`You can also write the rule. A linear table that starts at (0, ${V('c')}) with difference ${V('m')} is ${Y} = ${V('m')}${X} + ${V('c')}; an exponential one that starts at (0, ${V('c')}) with ratio ${V('g')} is ${Y} = ${V('c')} · ${V('g')}<sup>${X}</sup>.`) +
      example('Example 1: linear', `${big('y: 5, 8, 11, 14, 17')}The difference is always 3 and the table starts at 5, so ${Y} = 3${X} + 5 and ${Y}(7) = 21 + 5 = <b>26</b>.`) +
      example('Example 2: quadratic', `${big('y: 2, 5, 10, 17, 26')}First differences 3, 5, 7, 9; second differences all 2: quadratic. The next first difference is 11, so ${Y}(5) = 26 + 11 = 37, then 13 more: ${Y}(6) = <b>50</b>.`) +
      example('Example 3: exponential', `${big('y: 96, 48, 24, 12, 6')}Each value is half the one before, so ${Y} = 96 · (½)<sup>${X}</sup>. Keep halving: ${Y}(5) = 3 and ${Y}(6) = <b>1.5</b>.`),
    make(rng) {
      const t = modelTable(rng), target = rng.int(5, 7), ans = t.f(target);
      const d1 = diffs(t.ys), d2 = diffs(d1);
      const how = t.type === 'Linear' ? `The first differences are all ${N(d1[0])}: linear. Rule: ${Y} = ${P([t.desc.m, t.desc.c])}.`
        : t.type === 'Quadratic' ? `The second differences are all ${N(d2[0])}: quadratic. Keep growing the first differences by ${N(d2[0])}: ${[5, 6, 7].slice(0, target - 4).map(x => N(t.f(x) - t.f(x - 1))).join(', ')}.`
          : `Each value is ${N(t.desc.g)} times the one before: exponential. Rule: ${Y} = ${N(t.desc.c)} · ${t.desc.g === 0.5 ? '(½)' : t.desc.g}<sup>${X}</sup>.`;
      return { prompt: `The table shows a function that is linear, quadratic or exponential. What is ${Y} when ${X} = ${target}?${tableOf(t)}`, type: 'number', answer: ans, answerText: Number.isInteger(ans) ? undefined : M.fracText(Math.round(ans * 128), 128), params: { ys: t.ys, target },
        hints: [`Find the pattern: first differences ${d1.map(N).join(', ')}.`, how, `${Y}(${target}) = <b>${Number.isInteger(ans) ? N(ans) : M.fracText(Math.round(ans * 128), 128)}</b>.`] };
    },
    verify(q) {
      const ys = q.params.ys.slice(), type = classify(ys);
      while (ys.length <= q.params.target) {
        const n = ys.length;
        if (type === 'Exponential') ys.push(ys[n - 1] * ys[n - 1] / ys[n - 2]);
        else { const d1 = ys[n - 1] - ys[n - 2], d0 = ys[n - 2] - ys[n - 3]; ys.push(ys[n - 1] + d1 + (type === 'Quadratic' ? d1 - d0 : 0)); }
      }
      return Math.abs(ys[q.params.target] - q.answer) < 1e-9;
    },
  });
})();
