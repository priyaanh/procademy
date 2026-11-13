/* Algebra 2. Polynomial arithmetic, complex numbers, factoring and dividing polynomials, polynomial
   graphs, rational exponents and radicals, exponential models and logarithms, transformations of
   functions, rational equations and nonlinear systems, trigonometry, and choosing a model. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v;
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
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
      const m = rng.pick([1, 1, 2, 3, 4]);
      let k = rng.int(1, 6);
      while (M.gcd(m, k) !== 1) k = rng.int(1, 6);
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
    verify(q) { const { m, k, s } = q.params; return sameAt(readFactors(q.answer), t => Math.pow(m * t, 3) + s * Math.pow(k, 3)); },
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
    verify(q) {
      const pr = q.params;
      const f = pr.kind === 'std' ? t => pr.list.reduce((s, [c, pw]) => s + c * Math.pow(t, pw), 0)
        : t => pr.lead * pr.roots.reduce((s, r, i) => s * Math.pow(i === 2 && pr.back ? r - t : t - r, pr.mults[i]), 1);
      return q.answer === endLabel(f(-1e4) > 0 ? 1 : 0, f(1e4) > 0 ? 1 : 0);
    },
  });

  /* ---------- Unit 6: Rational exponents and radicals ---------- */
  A.skill({
    id: 'alg2.rational-exponents', title: 'Rational exponents and simplifying radicals',
    learn: p(`<b>A fractional exponent is a root: ${V('a')}<sup>1/${V('n')}</sup> = ${root('<i>n</i>', V('a'))}, and ${V('a')}<sup>${V('m')}/${V('n')}</sup> = ${root('<i>n</i>', `${V('a')}<sup><i>m</i></sup>`)} = (${root('<i>n</i>', V('a'))})<sup><i>m</i></sup>.</b> The denominator is the root; the numerator is the power. A negative exponent means take the reciprocal.`) +
      p(`To evaluate, take the root first, while the number is still small: 8<sup>2/3</sup> = (∛8)² = 2² = 4.`) +
      p(`<b>To simplify a square root, pull out the largest perfect-square factor:</b> √72 = √(36 · 2) = 6√2. Using a smaller square, like √72 = 2√18, leaves a square inside, so it is not finished.`) +
      example('Example', `${big(`16<sup>−3/4</sup>`)}The fourth root of 16 is 2, and 2³ = 8. The negative exponent flips it: <b>${F(1, 8)}</b>.`),
    make(rng) {
      const kind = rng.pick(['eval', 'eval', 'to-root', 'to-exp', 'simplify']);
      if (kind === 'eval') {
        const q = rng.pick([2, 2, 3, 3, 4]);
        const k = q === 2 ? rng.int(2, 10) : q === 3 ? rng.int(2, 5) : rng.int(2, 3);
        let pw = rng.pick(q === 2 ? [1, 3] : q === 3 ? [1, 2] : [1, 3]);
        if (q === 2 && k > 5) pw = 1;
        const neg = rng.chance(0.3), base = k ** q, val = k ** pw;
        const ans = neg ? 1 / val : val;
        const shown = `${N(base)}<sup>${neg ? '−' : ''}${pw === 1 ? 1 : pw}/${q}</sup>`;
        return { prompt: `Evaluate.${neg ? ' Give a fraction.' : ''}${big(shown)}`, type: 'number', answer: ans, answerText: neg ? M.fracText(1, val) : undefined, params: { kind, base, pw, q, neg },
          hints: [`The denominator ${q} means a ${q === 2 ? 'square' : q === 3 ? 'cube' : 'fourth'} root: ${root(q, N(base))} = ${k}, because ${k}<sup>${q}</sup> = ${N(base)}.`, pw > 1 ? `The numerator ${pw} is a power: ${k}<sup>${pw}</sup> = ${N(val)}.` : `The numerator is 1, so there is no further power.`].concat(neg ? [`The negative exponent means the reciprocal: 1 ÷ ${N(val)}.`] : []).concat([`<b>${neg ? M.fracText(1, val) : N(val)}</b>.`]) };
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
      const b = rng.pick([2, 3, 5, 6, 7, 10]), s = rng.int(2, 8), n = s * s * b;
      const rt = (c, inner) => `${c}${M.sqrt(inner)}`;
      const answer = rt(s, b);
      const parts = [];
      for (let d = 2; d < s; d++) if (s % d === 0) parts.push(rt(d, n / (d * d)));
      const cands = [rt(s * s, b)].concat(rng.shuffle(parts)).concat(b !== s ? [rt(b, s)] : []);
      const choices = options(answer, cands, () => rt(s + rng.pick([-1, 1, 2]), b));
      return { prompt: `Simplify completely.${big(M.sqrt(n))}`, type: 'choice', choices, answer, params: { kind, n },
        hints: [`Look for the largest perfect square that divides ${n}: try 4, 9, 16, 25, 36, 49, 64.`, `${n} = ${s * s} · ${b}, and ${b} has no square factor left.`, `${M.sqrt(n)} = ${M.sqrt(s * s)} · ${M.sqrt(b)} = <b>${answer}</b>.`] };
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
    learn: p(`<b>To solve a radical equation, isolate the radical, then raise both sides to the power that undoes it</b>: square a square root, cube a cube root.`) +
      p(`Squaring can create <b>extraneous solutions</b>: answers to the squared equation that do not solve the original one. A square root is never negative, so if √(…) = ${X} − 4, any solution must make ${X} − 4 ≥ 0. <b>Always check every answer in the original equation.</b> Cube roots can be negative, so cubing does not create extraneous solutions.`) +
      example('Example', `${big(`${M.sqrt(P([1, 2]))} = ${P([1, -10])}`)}Square: ${X} + 2 = ${X}² − 20${X} + 100, so ${X}² − 21${X} + 98 = 0 = (${X} − 7)(${X} − 14). Check 7: √9 = 3 but 7 − 10 = −3, so 7 is extraneous. Check 14: √16 = 4 = 14 − 10 ✓. <b>${X} = 14</b>.`),
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
  A.skill({
    id: 'alg2.exponential-models', title: 'Exponential growth and decay models',
    learn: p(`An exponential model multiplies by the same factor in each equal time step: <b>${fx('f', V('t'))} = ${V('a')} · ${V('b')}<sup>${V('t')}</sup></b>, where ${V('a')} is the starting amount and ${V('b')} is the growth factor. If ${V('b')} &gt; 1 it grows; if 0 &lt; ${V('b')} &lt; 1 it decays.`) +
      p(`<b>A percent change of ${V('r')} per step gives the factor ${V('b')} = 1 + ${V('r')} for growth and 1 − ${V('r')} for decay</b>, with ${V('r')} as a decimal: growing 6% is × 1.06, losing 6% is × 0.94.`) +
      p(`When something doubles every ${V('h')} hours, the number of doublings after ${V('t')} hours is ${V('t')} ÷ ${V('h')}: ${fx('f', V('t'))} = ${V('a')} · 2<sup>${V('t')}/${V('h')}</sup>. Half-life works the same way with ½.`) +
      example('Example', `A 120 mg sample has a half-life of 5 days. After 15 days it has halved 15 ÷ 5 = 3 times: 120 · (½)³ = <b>15 mg</b>.`),
    make(rng) {
      const kind = rng.pick(['double', 'half', 'percent', 'write']);
      const name = rng.pick(NAMES);
      if (kind === 'double') {
        const a = rng.pick([50, 100, 150, 200, 250, 300, 400]), g = rng.pick([2, 2, 3]), h = rng.int(2, 6), n = rng.int(2, g === 3 ? 4 : 5), t = h * n;
        const ans = a * g ** n;
        return { prompt: `A bacteria culture starts with ${N(a)} cells and ${g === 2 ? 'doubles' : 'triples'} every ${h} hours. How many cells are there after ${t} hours?`, type: 'number', answer: ans, params: { kind, a, g, h, t },
          hints: [`The model is ${N(a)} · ${g}<sup>${V('t')}/${h}</sup>.`, `In ${t} hours it ${g === 2 ? 'doubles' : 'triples'} ${t} ÷ ${h} = ${n} times: ${g}<sup>${n}</sup> = ${g ** n}.`, `${N(a)} · ${g ** n} = <b>${N(ans)}</b> cells.`] };
      }
      if (kind === 'half') {
        const n = rng.int(1, 4), m = rng.pick([3, 5, 6, 7, 9, 10, 15, 25]), a = m * 2 ** n, h = rng.pick([4, 5, 6, 8, 10, 12, 20, 30]), t = h * n;
        return { prompt: `A medicine has a half-life of ${h} hours. ${name} takes a ${N(a)} mg dose. How much is left after ${t} hours?`, type: 'number', answer: m, unit: 'mg', params: { kind, a, h, t },
          hints: [`The model is ${N(a)} · (½)<sup>${V('t')}/${h}</sup>.`, `${t} hours is ${t} ÷ ${h} = ${n} half-lives, so multiply by ½ ${n === 1 ? 'once' : n + ' times'}: ÷ ${2 ** n}.`, `${N(a)} ÷ ${2 ** n} = <b>${N(m)} mg</b>.`] };
      }
      const grow = rng.bool(), r = rng.pick(grow ? [2, 3, 4, 5, 6, 8, 10, 12] : [5, 8, 10, 12, 15, 20]);
      const a = rng.pick([1200, 2500, 4000, 8000, 15000, 24000]);
      const b = grow ? (100 + r) / 100 : (100 - r) / 100;
      if (kind === 'write') {
        const T = V('t'), f = base => `${fx('P', T)} = ${N(a)}(${N(base)})<sup>${T}</sup>`;
        const answer = f(b);
        return { prompt: `${grow ? 'A town has' : 'A lake holds'} ${N(a)} ${grow ? 'people, and its population grows' : 'fish, and the number falls'} by ${r}% each year. Which function gives the ${grow ? 'population' : 'number of fish'} after ${T} years?`, type: 'choice', choices: [answer, f(grow ? (100 - r) / 100 : (100 + r) / 100), f(r / 100), f(grow ? 1 + r / 10 : r / 10)], answer, params: { kind, a, r, grow },
          hints: [`Each year the amount is multiplied by the same factor, so the model is ${N(a)} · ${V('b')}<sup>${T}</sup>.`, grow ? `Growing ${r}% means keeping 100% and adding ${r}%: ${V('b')} = 1 + 0.${String(r).padStart(2, '0')} = ${N(b)}.` : `Losing ${r}% leaves 100% − ${r}% = ${100 - r}%: ${V('b')} = ${N(b)}.`, `<b>${answer}</b>`] };
      }
      const t = rng.int(2, 6);
      let v = a; for (let k = 0; k < t; k++) v *= b;
      const ans = Math.round(v);
      return { prompt: `${name} buys ${grow ? 'a painting' : 'a used car'} for ${M.money(a)}. Its value ${grow ? 'rises' : 'falls'} by ${r}% per year. What is it worth after ${t} years, to the nearest dollar?`, type: 'number', answer: ans, unit: '$', tolerance: 1, params: { kind, a, r, grow, t },
        hints: [`The yearly factor is ${grow ? `1 + ${N(r / 100)}` : `1 − ${N(r / 100)}`} = ${N(b)}.`, `Value = ${N(a)} · ${N(b)}<sup>${t}</sup>, and ${N(b)}<sup>${t}</sup> ≈ ${N(M.round(Math.pow(b, t), 4))}.`, `${N(a)} · ${N(M.round(Math.pow(b, t), 4))} ≈ <b>${M.money(ans)}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'double') return q.answer === pr.a * Math.pow(pr.g, pr.t / pr.h);
      if (pr.kind === 'half') return Math.abs(q.answer - pr.a * Math.pow(0.5, pr.t / pr.h)) < 1e-9;
      const b = 1 + (pr.grow ? 1 : -1) * pr.r / 100;
      if (pr.kind === 'write') return A.stripTags(q.answer).includes(`(${N(b)})`);
      return Math.abs(q.answer - pr.a * Math.pow(b, pr.t)) <= 0.5 + 1e-6;
    },
  });

  A.skill({
    id: 'alg2.exponential-rates', title: 'Interpreting exponential models',
    learn: p(`In ${fx('f', V('t'))} = ${V('a')} · ${V('b')}<sup>${V('t')}</sup>, the number in front, ${V('a')}, is the value at ${V('t')} = 0: the <b>initial value</b>. The base ${V('b')} is the <b>growth factor</b> for each unit of time.`) +
      p(`<b>The percent rate is the distance of ${V('b')} from 1.</b> A factor of 1.07 is a 7% increase; a factor of 0.82 is an 18% decrease, because 1 − 0.82 = 0.18. The factor is not the rate: 1.07 is not 107% growth.`) +
      p(`An exponent like ${V('t')}/5 changes the time step: ${V('a')} · 2<sup>${V('t')}/5</sup> doubles every 5 units, since the exponent goes up by 1 each time ${V('t')} goes up by 5.`) +
      example('Example', `${big(`${fx('V', V('t'))} = 9,000(0.88)<sup>${V('t')}</sup>`)}Initial value $9,000. The factor 0.88 is less than 1, so it decays by 1 − 0.88 = 0.12: <b>12% per year</b>.`),
    make(rng) {
      const kind = rng.pick(['describe', 'describe', 'rate', 'initial', 'period']);
      const T = V('t');
      if (kind === 'period') {
        const k = rng.int(2, 12), a = rng.pick([40, 60, 80, 120, 500]), half = rng.bool();
        return { prompt: `The amount of ${half ? 'a substance' : 'mold'} after ${T} days is modeled below. How many days does it take to ${half ? 'halve' : 'double'}?${big(`${fx('A', T)} = ${N(a)} · ${half ? '(½)' : '2'}<sup>${T}/${k}</sup>`)}`, type: 'number', answer: k, unit: 'days', params: { kind, a, k, half },
          hints: [`The amount ${half ? 'halves' : 'doubles'} each time the exponent ${T}/${k} goes up by 1.`, `${T}/${k} = 1 when ${T} = ${k}.`, `It ${half ? 'halves' : 'doubles'} every <b>${k} days</b>.`] };
      }
      const grow = rng.bool(), r = rng.pick(grow ? [2, 3, 4, 5, 6, 7, 9, 15, 25] : [3, 4, 5, 8, 12, 15, 18, 30]);
      const b = grow ? (100 + r) / 100 : (100 - r) / 100, a = rng.pick([350, 800, 1500, 6000, 12000, 30000]);
      const shown = `${fx('f', T)} = ${N(a)}(${N(b)})<sup>${T}</sup>`;
      const hint1 = `The base ${N(b)} is ${grow ? 'more' : 'less'} than 1, so the model shows ${grow ? 'growth' : 'decay'}.`;
      const hint2 = grow ? `${N(b)} − 1 = ${N(r / 100)}, which is ${r}%.` : `1 − ${N(b)} = ${N(r / 100)}, which is ${r}%.`;
      if (kind === 'initial') return { prompt: `What is the initial value of the model?${big(shown)}`, type: 'number', answer: a, params: { kind, a, b }, hints: [`The initial value is ${fx('f', 0)}, the value when ${T} = 0.`, `${N(b)}<sup>0</sup> = 1, so ${fx('f', 0)} = ${N(a)} · 1 = <b>${N(a)}</b>.`] };
      if (kind === 'rate') return { prompt: `By what percent does the quantity ${grow ? 'increase' : 'decrease'} each year?${big(shown)}`, type: 'number', answer: r, unit: '%', params: { kind, b }, hints: [hint1, hint2, `It ${grow ? 'increases' : 'decreases'} by <b>${r}%</b> per year.`] };
      const d = (w, x) => `${w} of ${x}% per year`;
      const answer = d(grow ? 'growth' : 'decay', r);
      return { prompt: `What does the model show? ${T} is in years.${big(shown)}`, type: 'choice', choices: [answer, d(grow ? 'decay' : 'growth', r), d(grow ? 'growth' : 'decay', Math.round(b * 100)), d(grow ? 'decay' : 'growth', Math.round(b * 100))], answer, params: { kind, b },
        hints: [hint1, hint2, `<b>${answer}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'period') { const f = t => pr.a * Math.pow(pr.half ? 0.5 : 2, t / pr.k); return Math.abs(f(q.answer) / f(0) - (pr.half ? 0.5 : 2)) < 1e-9; }
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
    learn: p(`<b>${lg(V('b'), ' ' + V('x'))} = ${V('y')} means ${V('b')}<sup>${V('y')}</sup> = ${V('x')}.</b> A logarithm answers the question “what power of ${V('b')} gives ${V('x')}?” So ${lg(2, ' 32')} = 5 because 2⁵ = 32, and ${lg(3, ` ${F(1, 9)}`)} = −2 because 3<sup>−2</sup> = ${F(1, 9)}.`) +
      p(`<b>Properties:</b> ${lg(V('b'), `(${V('m')}${V('n')})`)} = ${lg(V('b'), ' ' + V('m'))} + ${lg(V('b'), ' ' + V('n'))}, ${lg(V('b'), `(${V('m')}/${V('n')})`)} = ${lg(V('b'), ' ' + V('m'))} − ${lg(V('b'), ' ' + V('n'))}, and ${lg(V('b'), ` ${V('m')}<sup>${V('k')}</sup>`)} = ${V('k')} ${lg(V('b'), ' ' + V('m'))}. A sum of logs with the same base is the log of a product.`) +
      p(`<b>Change of base:</b> ${lg(V('b'), ' ' + V('x'))} = log ${V('x')} ÷ log ${V('b')}, using the common log (base 10) on a calculator.`) +
      example('Example', `${big(`${lg(6, ' 4')} + ${lg(6, ' 9')}`)}Combine: ${lg(6, ' (4 · 9)')} = ${lg(6, ' 36')} = <b>2</b>, since 6² = 36.`),
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
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'exact') return Math.abs(Math.pow(pr.b, q.answer) - pr.num / pr.den) < 1e-9;
      if (pr.kind === 'sum') return Math.abs(Math.log(pr.m) / Math.log(pr.b) + Math.log(pr.n) / Math.log(pr.b) - q.answer) < 1e-9;
      if (pr.kind === 'diff') return Math.abs(Math.log(pr.m) / Math.log(pr.b) - Math.log(pr.n) / Math.log(pr.b) - q.answer) < 1e-9;
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
    learn: p(`If both sides can be written as powers of the same base, set the exponents equal: 3<sup>${X} + 1</sup> = 81 = 3⁴ gives ${X} + 1 = 4, so ${X} = 3.`) +
      p(`<b>Otherwise, isolate the power, then take the log of both sides and bring the exponent down</b>: ${V('b')}<sup>${X}</sup> = ${V('c')} gives ${X} = log ${V('c')} ÷ log ${V('b')}. Divide out any coefficient in front of the power first.`) +
      example('Example', `${big(`4 · 3<sup>${X}</sup> = 60`)}Divide by 4: 3<sup>${X}</sup> = 15. Take logs: ${X} = log 15 ÷ log 3 ≈ 1.1761 ÷ 0.4771 ≈ <b>2.46</b>.`),
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
        return { prompt: `${name} invests money at ${r}% interest compounded once a year. How many years until it ${mult === 2 ? 'doubles' : 'triples'}? Round to two decimal places.`, type: 'number', answer: ans, tolerance: 0.01, unit: 'years', params: { kind, r, mult },
          hints: [`The amount ${mult === 2 ? 'doubles' : 'triples'} when ${N(1 + r / 100)}<sup>${V('t')}</sup> = ${mult}; the starting amount cancels.`, `Take logs: ${V('t')} = log ${mult} ÷ log ${N(1 + r / 100)}.`, `≈ ${N(M.round(Math.log10(mult), 4))} ÷ ${N(M.round(Math.log10(1 + r / 100), 4))} ≈ <b>${N(ans)} years</b>.`] };
      }
      const a = rng.pick([2, 3, 4, 5, 10]), b = rng.pick([2, 3, 5, 6]);
      let ratio = rng.int(3, 40); while (Math.abs(Math.log(ratio) / Math.log(b) - Math.round(Math.log(ratio) / Math.log(b))) < 1e-9) ratio++;
      const c = a * ratio, ans = M.round(Math.log10(ratio) / Math.log10(b), 2);
      return { prompt: `Solve for ${X}. Round to two decimal places.${big(`${N(a)} · ${b}<sup>${X}</sup> = ${N(c)}`)}`, type: 'number', answer: ans, tolerance: 0.01, params: { kind, a, b, c },
        hints: [`Isolate the power: divide both sides by ${a} to get ${b}<sup>${X}</sup> = ${N(ratio)}.`, `Take the log of both sides: ${X} · log ${b} = log ${N(ratio)}, so ${X} = log ${N(ratio)} ÷ log ${b}.`, `≈ ${N(M.round(Math.log10(ratio), 4))} ÷ ${N(M.round(Math.log10(b), 4))} ≈ <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'same-base') return Math.pow(pr.a, pr.pp * q.answer + pr.c) === Math.pow(pr.a, pr.k);
      if (pr.kind === 'double') return Math.abs(Math.pow(1 + pr.r / 100, q.answer) - pr.mult) < 0.01 * pr.mult;
      return Math.abs(Math.log2(pr.c / pr.a) / Math.log2(pr.b) - q.answer) < 0.006;
    },
  });

  /* ---------- Unit 9: Transformations of functions ---------- */
  const units_ = k => `${N(Math.abs(k))} unit${Math.abs(k) === 1 ? '' : 's'}`;
  const shiftLabel = (h, k) => `Shift ${units_(h)} ${h > 0 ? 'right' : 'left'} and ${units_(k)} ${k > 0 ? 'up' : 'down'}`;
  const reflLabel = (axis, k) => `Reflect across the ${axis}-axis, then shift ${units_(k)} ${k > 0 ? 'up' : 'down'}`;
  A.skill({
    id: 'alg2.shifts-reflections', title: 'Shifting and reflecting functions',
    learn: p(`<b>${fx('f', `${X} − ${V('h')}`)} + ${V('k')} moves the graph of ${V('f')} right ${V('h')} and up ${V('k')}.</b> The change outside the function acts on outputs and goes the way it looks: + 3 moves up. The change inside acts on inputs and goes the <b>opposite</b> way: ${fx('f', `${X} + 3`)} moves left 3, because the input must be 3 less to give the same output.`) +
      p(`<b>−${fx('f', X)} reflects across the ${X}-axis</b> (outputs change sign). <b>${fx('f', '−' + X)} reflects across the ${Y}-axis</b> (inputs change sign).`) +
      p(`To move a point: (${V('a')}, ${V('b')}) on ${V('f')} becomes (${V('a')} + ${V('h')}, ${V('b')} + ${V('k')}) on ${fx('f', `${X} − ${V('h')}`)} + ${V('k')}.`) +
      example('Example', `${big(`${fx('g', X)} = ${fx('f', P([1, 4]))} − 2`)}Inside + 4 moves the graph <b>4 left</b>; outside − 2 moves it <b>2 down</b>. The point (1, 5) on ${V('f')} moves to (−3, 3).`),
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
    learn: p(`<b>${V('a')} · ${fx('f', X)} stretches the graph vertically by a factor of ${V('a')}</b>: every ${Y}-value is multiplied by ${V('a')}. If 0 &lt; ${V('a')} &lt; 1 it is a vertical compression.`) +
      p(`<b>${fx('f', `${V('b')}${X}`)} compresses the graph horizontally by a factor of 1/${V('b')}</b>: every ${X}-value is divided by ${V('b')}. As with shifts, the inside change works backwards, so ${fx('f', '2' + X)} squeezes the graph toward the ${Y}-axis, and ${fx('f', `${X}/2`)} stretches it to twice the width.`) +
      p(`For points: (${V('p')}, ${V('q')}) on ${V('f')} becomes (${V('p')}, ${V('a')}${V('q')}) on ${V('a')} · ${fx('f', X)}, and (${V('p')}/${V('b')}, ${V('q')}) on ${fx('f', V('b') + X)}.`) +
      example('Example', `${big(`${fx('g', X)} = ${fx('f', '3' + X)}`)}The 3 is inside, so it is a <b>horizontal compression by a factor of 1/3</b>. The point (6, 4) on ${V('f')} moves to (2, 4).`),
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
    learn: p(`A rational equation has the variable in a denominator. <b>Multiply both sides by the common denominator to clear the fractions, solve the equation that is left, then check that no solution makes a denominator zero.</b>`) +
      p(`When each side is a single fraction, you can cross-multiply: ${sfrac(V('a'), V('b'))} = ${sfrac(V('c'), V('d'))} gives ${V('a')}${V('d')} = ${V('b')}${V('c')}. A value that makes a denominator zero is <b>extraneous</b>: it is thrown out even if it solves the cleared equation.`) +
      example('Example', `${big(`${sfrac(M.sup(X, 2), P([1, -3]))} = ${sfrac(P([1, 6]), P([1, -3]))}`)}Same denominators, so ${X}² = ${X} + 6, ${X}² − ${X} − 6 = 0, (${X} − 3)(${X} + 2) = 0. But ${X} = 3 makes the denominator zero, so it is extraneous. <b>${X} = −2</b>.`),
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
    learn: p(`A line and a parabola can meet in two points, one point (the line just touches), or not at all. <b>To solve, set the two expressions for ${Y} equal, move everything to one side, and solve the quadratic. Then substitute each ${X} into the line to get its ${Y}.</b>`) +
      p(`To count the solutions without finding them, look at the discriminant ${V('b')}² − 4${V('a')}${V('c')} of that quadratic: positive means two, zero means one, negative means none.`) +
      example('Example', `${big(`${Y} = ${P([1, -1, -4])} and ${Y} = ${P([1, 4])}`)}${P([1, -1, -4])} = ${P([1, 4])} gives ${P([1, -2, -8])} = 0 = (${X} − 4)(${X} + 2). Then ${Y} = 4 + 4 = 8 and ${Y} = −2 + 4 = 2: <b>(−2, 2) and (4, 8)</b>.`),
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

  A.skill({
    id: 'alg2.unit-circle', title: 'Radians and the unit circle',
    learn: p(`<b>A full turn is 360° = 2π radians, so 180° = π radians.</b> To change degrees to radians multiply by π/180; to change radians to degrees multiply by 180/π. 90° = π/2, 60° = π/3, 45° = π/4, 30° = π/6.`) +
      p(`On the unit circle (radius 1), the point at angle θ is (cos θ, sin θ). <b>The special values are 0, ½, √2/2, √3/2 and 1</b>: for π/6 the point is (√3/2, ½), for π/4 it is (√2/2, √2/2), for π/3 it is (½, √3/2).`) +
      p(`For other angles, find the reference angle (the angle to the nearest part of the ${X}-axis) and then the sign from the quadrant: cosine is negative on the left half, sine is negative on the bottom half.`) +
      example('Example', `${big(`sin ${piTxt(5, 4)}`)}5π/4 = 225°, in the third quadrant, with reference angle 45°. sin 45° = √2/2 and sine is negative below the axis: <b>−√2/2</b>.`),
    make(rng) {
      const kind = rng.pick(['to-deg', 'to-rad', 'value', 'value']);
      const d = rng.pick([2, 3, 4, 6, 6]);
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
      return { prompt: `Find the exact value.${big(`${fn} ${ang}`)}`, type: 'choice', choices, answer, params: { kind, fn, nn, dd },
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

  A.skill({
    id: 'alg2.sinusoids', title: 'Amplitude, midline and period',
    learn: p(`The graph of ${Y} = ${V('a')} sin(${V('b')}${X}) + ${V('d')} (or with cos) is a wave. <b>Amplitude = |${V('a')}|</b>, the distance from the middle to a peak. <b>Midline: ${Y} = ${V('d')}</b>, the horizontal line through the middle. <b>Period = 2π ÷ ${V('b')}</b>, the length of one full cycle.`) +
      p(`From a maximum and minimum: the midline is halfway between them, (max + min) ÷ 2, and the amplitude is half the distance, (max − min) ÷ 2. A negative ${V('a')} flips the wave but does not change the amplitude.`) +
      example('Example', `${big(`${Y} = −3 sin(${sfrac('π', 2)}${X}) + 1`)}Amplitude |−3| = <b>3</b>, midline <b>${Y} = 1</b>, period 2π ÷ (π/2) = <b>4</b>.`),
    make(rng) {
      const kind = rng.pick(['amp', 'mid', 'period', 'period', 'maxmin']);
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
    learn: p(`When the ${X}-values go up in equal steps, the ${Y}-values tell you which kind of function fits:`) +
      p(`<b>Linear: the first differences are constant. Quadratic: the first differences change, but the second differences (differences of the differences) are constant. Exponential: the ratios of consecutive ${Y}-values are constant.</b>`) +
      p(`Work out the first differences first. If they are not constant, check the second differences and the ratios.`) +
      example('Example', `${big('y: 3, 6, 12, 24, 48')}Differences 3, 6, 12, 24 are not constant, and neither are their differences 3, 6, 12. But every ratio is 2, so the model is <b>exponential</b>.`),
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
    learn: p(`Once you know the kind of model, you can extend the table. <b>Linear: keep adding the same difference. Quadratic: keep adding the same second difference to the first differences. Exponential: keep multiplying by the same ratio.</b>`) +
      p(`You can also write the rule. A linear table starting at (0, ${V('c')}) with difference ${V('m')} is ${Y} = ${V('m')}${X} + ${V('c')}; an exponential one with ratio ${V('g')} is ${Y} = ${V('c')} · ${V('g')}<sup>${X}</sup>.`) +
      example('Example', `${big('y: 2, 5, 10, 17, 26')}First differences 3, 5, 7, 9; second differences all 2: quadratic. Next first difference 11, so ${Y}(5) = 26 + 11 = 37, then 13 more: ${Y}(6) = <b>50</b>.`),
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
