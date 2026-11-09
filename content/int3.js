/* Integrated Math 3. Polynomials, rational expressions, inverses and logarithms, trigonometric functions,
   non-right triangles, series, the normal distribution and sampling, and solids. Follows CPM Core
   Connections Integrated III and Khan Academy's Integrated math 3. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v, X = M.v('x');
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = (s) => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const key = s => A.normText(A.stripTags(s));
  const close = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1e-9 : tol);
  const rad = d => d * Math.PI / 180, degOf = r => r * 180 / Math.PI;
  const r1 = x => M.round(x, 1), r2 = x => M.round(x, 2);
  const pw = x => x < 0 ? `(${N(x)})` : N(x);
  const LOG = b => `log<sub>${b}</sub>`;

  /** the answer plus up to `n − 1` distractors that read differently from it and from each other */
  function options(answer, cands, n) {
    const out = [answer], seen = new Set([key(answer)]);
    for (const c of cands) { if (out.length >= (n || 4)) break; const k = key(c); if (!seen.has(k)) { seen.add(k); out.push(c); } }
    return out;
  }
  /** Horner evaluation, coefficients highest power first */
  const peval = (c, t) => c.reduce((s, k) => s * t + k, 0);
  const pmul = (a, b) => { const out = new Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((y, j) => { out[i + j] += x * y; })); return out; };
  /** "(x − 3)", "(2x + 5)": a linear factor px + q */
  const lin = (pp, q) => `(${M.term(pp, 'x')} ${M.signed(q)})`;
  /** a factored polynomial {lead, x, lins: [[p, q], …], quad} as text; equal neighbours become a square */
  function renderFac(f) {
    let s = f.lead === 1 ? '' : f.lead === -1 ? '−' : N(f.lead);
    if (f.x) s += X;
    for (let i = 0; i < f.lins.length; i++) {
      const [pp, q] = f.lins[i], nx = f.lins[i + 1];
      if (nx && nx[0] === pp && nx[1] === q) { s += M.sup(lin(pp, q), 2); i++; } else s += lin(pp, q);
    }
    if (f.quad) s += `(${M.poly(f.quad)})`;
    return s;
  }
  const evalFac = (f, t) => f.lead * (f.x ? t : 1) * f.lins.reduce((s, [pp, q]) => s * (pp * t + q), 1) * (f.quad ? peval(f.quad, t) : 1);

  A.course({
    id: 'int-3', title: 'Integrated Math 3', subject: 'High school', grade: 11, icon: 'IM3', hue: 20,
    blurb: 'Polynomials, rational expressions, logarithms, trigonometric functions, non-right triangles, series, the normal distribution, and solids.',
    units: [
      { id: 'polynomials', title: 'Polynomials', blurb: 'Factoring, dividing, the remainder theorem, and reading a graph from its zeros.', skills: ['int3.poly-factor', 'int3.poly-division', 'int3.poly-graphs'] },
      { id: 'rational', title: 'Rational expressions and equations', blurb: 'Fractions with polynomials on top and bottom.', skills: ['int3.rational-simplify', 'int3.rational-add', 'int3.rational-equations'] },
      { id: 'logarithms', title: 'Inverse functions and logarithms', blurb: 'Undoing a function, logarithms as inverses of exponentials, and models built from both.', skills: ['int3.inverse-functions', 'int3.log-properties', 'int3.exp-log-equations', 'int3.exp-log-models'] },
      { id: 'trig-functions', title: 'Trigonometric functions', blurb: 'Radians, the unit circle, sine and cosine graphs, and trig equations.', skills: ['int3.unit-circle', 'int3.sinusoid-graphs', 'int3.trig-equations'] },
      { id: 'triangles', title: 'Non-right triangles', blurb: 'The law of sines, the law of cosines, and area from two sides and an angle.', skills: ['int3.law-of-sines', 'int3.law-of-cosines'] },
      { id: 'series', title: 'Sequences and series', blurb: 'Adding up arithmetic and geometric sequences.', skills: ['int3.arithmetic-series', 'int3.geometric-series'] },
      { id: 'statistics', title: 'Statistics', blurb: 'The normal distribution, z-scores, sampling, and margin of error.', skills: ['int3.normal-distribution', 'int3.margin-of-error'] },
      { id: 'solids', title: '3D geometry', blurb: 'Slicing solids, and volume by Cavalieri’s principle.', skills: ['int3.cross-sections', 'int3.volume-cavalieri'] },
      { id: 'function-models', title: 'Modeling with functions', blurb: 'Area and volume as functions of one length, with their domains and best values.', skills: ['int3.area-models', 'int3.box-volume'] },
      { id: 'study-design', title: 'Surveys, studies, and data', blurb: 'Fair survey questions, the three kinds of study, what each can conclude, and relative frequency histograms.', skills: ['int3.survey-questions', 'int3.study-types', 'int3.study-conclusions', 'int3.relative-frequency'] },
      { id: 'simulation', title: 'Simulation and inference', blurb: 'Estimating probabilities with random digits, and testing whether a difference could be chance.', skills: ['int3.simulations', 'int3.randomization-tests'] },
      { id: 'polynomial-roots', title: 'Roots of polynomials', blurb: 'Possible rational roots, conjugate pairs, and building a polynomial from its roots.', skills: ['int3.rational-roots', 'int3.poly-from-roots'] },
      { id: 'more-trig', title: 'More trigonometry', blurb: 'The tangent graph, secant, cosecant and cotangent, sum and difference identities, and the ambiguous case.', skills: ['int3.tangent-function', 'int3.reciprocal-trig', 'int3.sum-difference-identities', 'int3.ambiguous-case'] },
      { id: 'induction-binomial', title: 'Induction and the binomial theorem', blurb: 'Proof by induction, expanding powers of binomials, and binomial probability.', skills: ['int3.induction', 'int3.binomial-theorem', 'int3.binomial-probability'] },
      { id: 'three-d', title: 'Three dimensions and three-variable systems', blurb: 'Points and planes in 3-D, systems of three equations, and fitting a parabola through three points.', skills: ['int3.points-3d', 'int3.plane-intercepts', 'int3.three-variable-systems', 'int3.curve-fitting'] },
    ],
  });

  /* ---------- Unit 1: Polynomials ---------- */
  A.skill({
    id: 'int3.poly-factor', title: 'Factoring higher-degree polynomials',
    learn: p('To factor a cubic, try these in order. <b>1. Take out a common factor</b>, often a power of ' + X + '. <b>2. Group:</b> with four terms, factor the first two and the last two and look for a shared binomial. <b>3. Use a pattern:</b> difference of squares, or a sum or difference of cubes.') +
      p(`The cube patterns are <b>${M.sup(V('a'), 3)} − ${M.sup(V('b'), 3)} = (${V('a')} − ${V('b')})(${M.sup(V('a'), 2)} + ${V('a')}${V('b')} + ${M.sup(V('b'), 2)})</b> and <b>${M.sup(V('a'), 3)} + ${M.sup(V('b'), 3)} = (${V('a')} + ${V('b')})(${M.sup(V('a'), 2)} − ${V('a')}${V('b')} + ${M.sup(V('b'), 2)})</b>. The sign in the binomial matches the original; the middle sign of the trinomial is the opposite.`) +
      p('“Factor completely” means keep going until no factor can be split again over the integers.') +
      example('Example', `${big(M.poly([1, 3, -4, -12]))}Group: ${M.sup(X, 2)}(${X} + 3) − 4(${X} + 3) = (${X} + 3)(${M.sup(X, 2)} − 4). The second factor is a difference of squares, so the answer is <b>(${X} + 3)(${X} − 2)(${X} + 2)</b>.`),
    make(rng) {
      const kind = rng.pick(['gcf', 'group', 'group', 'cubes']);
      let fac, wrong, coefs, hints;
      if (kind === 'gcf') {
        const a = rng.pick([1, 1, 2, 3, -1, -2]);
        let r = rng.nz(-6, 6), s = rng.nz(-6, 6);
        while (Math.abs(s) === Math.abs(r)) s = rng.nz(-6, 6);
        if (r > s) [r, s] = [s, r];
        coefs = [a, -a * (r + s), a * r * s, 0];
        fac = { lead: a, x: true, lins: [[1, -r], [1, -s]] };
        wrong = [{ lead: a, x: true, lins: [[1, r], [1, s]] }, { lead: a, x: false, lins: [[1, -r], [1, -s]] }, { lead: a, x: true, lins: [[1, -r], [1, s]] }, { lead: a, x: true, lins: [[1, r], [1, -s]] }];
        hints = [`Every term has a factor of ${a === 1 ? X : M.term(a, 'x')}. Take it out: ${renderFac({ lead: a, x: true, lins: [] })}(${M.poly([1, -(r + s), r * s])}).`,
          `Factor the quadratic: find two numbers that multiply to ${N(r * s)} and add to ${N(-(r + s))}. They are ${N(-r)} and ${N(-s)}.`,
          `So the polynomial is <b>${renderFac(fac)}</b>.`];
      } else if (kind === 'group') {
        const a = rng.nz(-7, 7); let b = rng.int(1, 6); if (b === Math.abs(a)) b = b === 6 ? 5 : b + 1;
        coefs = [1, a, -b * b, -a * b * b];
        fac = { lead: 1, x: false, lins: [[1, a], [1, -b], [1, b]] };
        wrong = [{ lead: 1, x: false, lins: [[1, a], [1, -b], [1, -b]] }, { lead: 1, x: false, lins: [[1, -a], [1, -b], [1, b]] }, { lead: 1, x: false, lins: [[1, a]], quad: [1, 0, b * b] }, { lead: 1, x: false, lins: [[1, a], [1, b], [1, b]] }];
        hints = [`Group the first two terms and the last two: (${M.poly([1, a, 0, 0])}) ${M.signed(-b * b)}${X} ${M.signed(-a * b * b)}.`,
          `Factor each group: ${M.sup(X, 2)}${lin(1, a)} − ${N(b * b)}${lin(1, a)} = ${lin(1, a)}(${M.poly([1, 0, -b * b])}).`,
          `${M.poly([1, 0, -b * b])} is a difference of squares: ${lin(1, -b)}${lin(1, b)}.`,
          `So the polynomial is <b>${renderFac(fac)}</b>.`];
      } else {
        const c = rng.pick([1, 1, 2]), k = rng.int(1, 5), sg = rng.pick([1, -1]);
        coefs = [c * c * c, 0, 0, sg * k * k * k];
        fac = { lead: 1, x: false, lins: [[c, sg * k]], quad: [c * c, -sg * c * k, k * k] };
        wrong = [{ lead: 1, x: false, lins: [[c, sg * k]], quad: [c * c, sg * c * k, k * k] }, { lead: 1, x: false, lins: [[c, -sg * k]], quad: [c * c, -sg * c * k, k * k] }, { lead: 1, x: false, lins: [[c, sg * k]], quad: [c * c, -2 * sg * c * k, k * k] }, { lead: 1, x: false, lins: [[c, -sg * k]], quad: [c * c, sg * c * k, k * k] }];
        hints = [`This is a ${sg > 0 ? 'sum' : 'difference'} of cubes: ${M.sup(c === 1 ? X : `(${M.term(c, 'x')})`, 3)} ${sg > 0 ? '+' : '−'} ${M.sup(N(k), 3)}, with ${V('a')} = ${M.term(c, 'x')} and ${V('b')} = ${N(k)}.`,
          `The binomial is (${V('a')} ${sg > 0 ? '+' : '−'} ${V('b')}) = ${lin(c, sg * k)}. The trinomial is ${M.sup(V('a'), 2)} ${sg > 0 ? '−' : '+'} ${V('a')}${V('b')} + ${M.sup(V('b'), 2)}, with the opposite middle sign.`,
          `So the polynomial is <b>${renderFac(fac)}</b>.`];
      }
      const answer = renderFac(fac);
      const choices = options(answer, wrong.map(renderFac));
      return { prompt: `Factor completely.${big(M.poly(coefs))}`, type: 'choice', choices, answer, hints, params: { kind, coefs, fac } };
    },
    verify(q) {
      const { coefs, fac } = q.params;
      if (q.answer !== renderFac(fac)) return 'answer does not match the factors';
      for (let t = -3; t <= 4; t++) if (!close(evalFac(fac, t), peval(coefs, t))) return `the factors and the polynomial differ at x = ${t}`;
      return true;
    },
  });

  A.skill({
    id: 'int3.poly-division', title: 'Polynomial division and the remainder theorem',
    learn: p(`To divide a polynomial by ${X} − ${V('a')}, <b>synthetic division</b> is quick: write the coefficients, bring the first one down, then repeatedly multiply by ${V('a')} and add to the next coefficient. The last number is the remainder; the others are the quotient’s coefficients, one degree lower.`) +
      p(`<b>The remainder theorem:</b> the remainder when ${V('p')}(${X}) is divided by ${X} − ${V('a')} is ${V('p')}(${V('a')}). So you can find a remainder just by substituting. If ${V('p')}(${V('a')}) = 0, then ${X} − ${V('a')} is a factor (the factor theorem).`) +
      p(`Careful with the sign: dividing by ${X} + 3 means ${V('a')} = −3.`) +
      example('Example', `Find the remainder when ${M.poly([1, -2, 0, 5])} is divided by ${X} − 2.${big(`${V('p')}(2) = 8 − 8 + 0 + 5 = 5`)}The remainder is <b>5</b>.`),
    make(rng) {
      const kind = rng.pick(['quot', 'rem', 'rem', 'factor']);
      const a = rng.nz(-4, 4);
      if (kind === 'quot') {
        const b = rng.nz(-6, 6), c = rng.nz(-9, 9);
        const qc = [1, b, c], coefs = pmul([1, -a], qc);
        const synth = []; coefs.slice(0, -1).reduce((acc, k, i) => { const v = i === 0 ? k : k + acc * -a; synth.push(v); return v; }, 0);
        const answer = M.poly(qc);
        const choices = options(answer, [M.poly(synth), M.poly([1, -b, c]), M.poly([1, b, -c]), M.poly([1, -b, -c]), M.poly([1, b + 1, c])]);
        return { prompt: `Divide. The remainder is 0.${big(`(${M.poly(coefs)}) ÷ ${lin(1, -a)}`)}`, type: 'choice', choices, answer, params: { kind, a, coefs, qc },
          hints: [`Use synthetic division with ${N(a)} (the number that makes ${lin(1, -a)} zero). The coefficients are ${coefs.map(N).join(', ')}.`,
            `Bring down 1. Multiply by ${N(a)} and add: ${N(coefs[1])} + ${pw(a)} = ${N(b)}. Then ${N(coefs[2])} + ${pw(a * b)} = ${N(c)}. Then ${N(coefs[3])} + ${pw(a * c)} = 0, the remainder.`,
            `The quotient is <b>${answer}</b>.`] };
      }
      const c3 = [1, rng.int(-5, 5), rng.int(-9, 9)];
      if (kind === 'rem') {
        const coefs = [rng.pick([1, 1, 2, -1]), ...c3.slice(1), rng.int(-12, 12)];
        const ans = peval(coefs, a);
        return { prompt: `Find the remainder when ${V('p')}(${X}) is divided by ${lin(1, -a)}.${big(`${V('p')}(${X}) = ${M.poly(coefs)}`)}`, type: 'number', answer: ans, params: { kind, a, coefs },
          hints: [`By the remainder theorem, the remainder is ${V('p')}(${N(a)}), because ${lin(1, -a)} is zero when ${X} = ${N(a)}.`,
            `Substitute: ${N(coefs[0])}(${N(a)})³ + ${N(coefs[1])}(${N(a)})² + ${N(coefs[2])}(${N(a)}) + ${N(coefs[3])} = ${N(coefs[0] * a ** 3)} + ${N(coefs[1] * a * a)} + ${N(coefs[2] * a)} + ${N(coefs[3])}.`.replace(/\+ −/g, '− '),
            `The remainder is <b>${N(ans)}</b>.`]};
      }
      const partial = peval([...c3, 0], a);
      const k = -partial;
      return { prompt: `For what value of ${V('k')} is ${lin(1, -a)} a factor of ${V('p')}(${X})?${big(`${V('p')}(${X}) = ${M.poly([...c3, 0])} + ${V('k')}`)}`, type: 'number', answer: k, params: { kind, a, coefs: [...c3, 0] },
        hints: [`By the factor theorem, ${lin(1, -a)} is a factor exactly when ${V('p')}(${N(a)}) = 0.`,
          `${V('p')}(${N(a)}) = ${N(a ** 3)} + ${N(c3[1] * a * a)} + ${N(c3[2] * a)} + ${V('k')} = ${N(partial)} + ${V('k')}.`.replace(/\+ −/g, '− '),
          `Set ${N(partial)} + ${V('k')} = 0, so ${V('k')} = <b>${N(k)}</b>.`.replace(/\+ −/g, '− ')] };
    },
    verify(q) {
      const { kind, a, coefs } = q.params;
      const synthRem = cs => cs.reduce((acc, c) => acc * a + c, 0);          // synthetic division, last value
      if (kind === 'quot') { for (let t = -2; t <= 3; t++) if (!close(peval(q.params.qc, t) * (t - a), peval(coefs, t))) return 'quotient times divisor is not the dividend'; return q.answer === M.poly(q.params.qc); }
      if (kind === 'rem') return q.answer === synthRem(coefs);
      const cs = coefs.slice(); cs[3] = q.answer; return synthRem(cs) === 0;
    },
  });
  A.skill({
    id: 'int3.poly-graphs', title: 'Zeros and graphs of polynomials',
    learn: p(`In factored form, a polynomial shows its zeros directly: ${V('f')}(${X}) = (${X} − 2)²(${X} + 1) is zero at ${X} = 2 and ${X} = −1. The power on a factor is the zero’s <b>multiplicity</b>.`) +
      p('<b>Odd multiplicity: the graph crosses the x-axis. Even multiplicity: it touches and turns back.</b> A multiplicity of 3 or more also flattens the graph out at the zero, like ' + M.sup(X, 3) + ' does at 0.') +
      p(`<b>End behavior</b> depends only on the leading term. Even degree: both ends point the same way (up if the leading coefficient is positive). Odd degree: the ends point opposite ways (rising on the right if the leading coefficient is positive). If you know one zero ${V('a')}, divide by ${X} − ${V('a')} to find the rest.`) +
      example('Example', `${big(`${V('f')}(${X}) = −2${X}${M.sup(`(${X} − 3)`, 2)}`)}The degree is 1 + 2 = 3 (odd) and the leading coefficient −2 is negative, so the graph <b>rises on the left and falls on the right</b>. It crosses at 0 and touches at 3.`),
    make(rng) {
      const kind = rng.pick(['cross', 'end', 'zero', 'zero']);
      if (kind === 'zero') {
        const roots = rng.sample([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6], 3).sort((x, y) => x - y);
        const coefs = pmul(pmul([1, -roots[0]], [1, -roots[1]]), [1, -roots[2]]);
        const gi = rng.int(0, 2), given = roots[gi], rest = roots.filter((_, i) => i !== gi);
        const askMax = rng.bool(), ans = askMax ? rest[1] : rest[0];
        const q1 = coefs[1] + given, q2 = coefs[2] + given * q1;
        return { prompt: `${X} = ${N(given)} is a zero of the polynomial below. Find the other two zeros, and enter the ${askMax ? 'greater' : 'smaller'} one.${big(`${V('f')}(${X}) = ${M.poly(coefs)}`)}`, type: 'number', answer: ans, params: { kind, coefs, given, askMax },
          hints: [`Since ${N(given)} is a zero, ${lin(1, -given)} is a factor. Divide it out with synthetic division using ${N(given)}.`,
            `The quotient is ${M.poly([1, q1, q2])}.`,
            `Factor it: ${M.poly([1, q1, q2])} = ${lin(1, -rest[0])}${lin(1, -rest[1])}, so the other zeros are ${N(rest[0])} and ${N(rest[1])}.`,
            `The ${askMax ? 'greater' : 'smaller'} one is <b>${N(ans)}</b>.`] };
      }
      const lead = rng.pick([1, 1, -1, 2, -2, 3, -3]);
      const k = rng.int(2, 3), roots = rng.sample([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5], k).sort((x, y) => x - y);
      const mults = roots.map(() => rng.pick([1, 1, 2, 2, 3]));
      const fTxt = (lead === 1 ? '' : lead === -1 ? '−' : N(lead)) + roots.map((r, i) => { const base = r === 0 ? X : lin(1, -r); return mults[i] > 1 ? M.sup(base, mults[i]) : base; }).join('');
      const fShow = `${V('f')}(${X}) = ${fTxt}`;
      const params = { kind, lead, roots, mults };
      if (kind === 'cross') {
        const i = rng.int(0, k - 1), r = roots[i], m = mults[i];
        const opts = ['It crosses the x-axis straight through.', 'It touches the x-axis and turns back.', 'It crosses the x-axis and flattens out.'];
        const answer = opts[m - 1];
        params.r = r;
        return { prompt: `What does the graph of ${V('f')} do at ${X} = ${N(r)}?${big(fShow)}`, type: 'choice', choices: opts, answer, params,
          hints: [`Find the factor that is zero at ${X} = ${N(r)}: ${r === 0 ? X : lin(1, -r)}. Its power is the multiplicity, ${m}.`,
            m % 2 ? `An odd multiplicity means the sign of ${V('f')} changes there, so the graph crosses.${m > 1 ? ' A multiplicity above 1 also makes it flat at the crossing.' : ' A multiplicity of 1 is a straight crossing.'}` : 'An even multiplicity means the sign does not change, so the graph only touches the axis.',
            `<b>${answer}</b>`] };
      }
      const deg = mults.reduce((s, m) => s + m, 0), sg = Math.sign(lead);
      const end = (l, r) => `As ${X} → −∞, ${V('f')}(${X}) → ${l}; as ${X} → ∞, ${V('f')}(${X}) → ${r}.`;
      const inf = s => s > 0 ? '∞' : '−∞';
      const L = deg % 2 ? -sg : sg;
      const answer = end(inf(L), inf(sg));
      const choices = [end('∞', '∞'), end('−∞', '−∞'), end('−∞', '∞'), end('∞', '−∞')];
      return { prompt: `Which describes the end behavior of ${V('f')}?${big(fShow)}`, type: 'choice', choices, answer, params,
        hints: [`Find the degree by adding the multiplicities: ${mults.join(' + ')} = ${deg}. The leading coefficient is ${N(lead)}.`,
          `${deg % 2 ? 'Odd' : 'Even'} degree, so the ends point ${deg % 2 ? 'in opposite directions' : 'the same way'}. With a ${sg > 0 ? 'positive' : 'negative'} leading coefficient, the right end goes to ${inf(sg)}.`,
          `<b>${answer}</b>`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'zero') {
        const found = []; for (let t = -10; t <= 10; t++) if (peval(P.coefs, t) === 0 && t !== P.given) found.push(t);
        return found.length === 2 && q.answer === (P.askMax ? Math.max(...found) : Math.min(...found));
      }
      const f = t => P.lead * P.roots.reduce((s, r, i) => s * Math.pow(t - r, P.mults[i]), 1);
      if (P.kind === 'cross') {
        const h = 1e-4, crosses = f(P.r - h) * f(P.r + h) < 0, m = Math.round(Math.log2(Math.abs(f(P.r + 2 * h) / f(P.r + h)))), flat = m > 1;   // f grows like hᵐ near the zero
        const want = !crosses ? 'touches' : flat ? 'flattens' : 'straight';
        return q.answer.includes(want);
      }
      const L = f(-1e4) > 0 ? '∞' : '−∞', R = f(1e4) > 0 ? '∞' : '−∞';
      return q.answer.endsWith(`→ ${R}.`) && q.answer.includes(`→ ${L};`);
    },
  });

  /* ---------- Unit 2: Rational expressions and equations ---------- */
  const lp = c => M.poly([1, c]);                 // "x + c"
  const fr = (nn, d) => F(nn, d);                 // a stacked fraction of two expressions
  A.skill({
    id: 'int3.rational-simplify', title: 'Simplifying, multiplying, and dividing rational expressions',
    learn: p('A rational expression is a fraction with polynomials on top and bottom. <b>To simplify, factor the top and bottom completely, then cancel common factors.</b> You may only cancel whole factors, never single terms: in ' + fr(lp(2), lp(5)) + ' nothing cancels.') +
      p('<b>To multiply</b>, factor everything, cancel any factor that appears on a top and a bottom, and multiply what is left. <b>To divide</b>, flip the second fraction and multiply.') +
      p('Values that make an original denominator zero stay excluded, even after the factor cancels.') +
      example('Example', `${big(fr(M.poly([1, 1, -6]), M.poly([1, 7, 12])))}Factor: ${fr(`(${lp(3)})(${lp(-2)})`, `(${lp(3)})(${lp(4)})`)}. Cancel ${X} + 3 to get <b>${fr(lp(-2), lp(4))}</b>.`),
    make(rng) {
      const kind = rng.pick(['simp', 'simp', 'mul', 'div']);
      const [a, b, c, d] = rng.sample([-7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7], 4);
      const quad = (u, v) => M.poly([1, u + v, u * v]);
      let prompt, hints, ansN, ansD, wrong;
      if (kind === 'simp') {
        prompt = `Simplify.${big(fr(quad(a, b), quad(a, c)))}`;
        ansN = b; ansD = c;
        wrong = [fr(lp(-b), lp(-c)), fr(lp(c), lp(b)), fr(lp(a), lp(c)), fr(lp(b), lp(a))];
        hints = [`Factor the top: ${quad(a, b)} = (${lp(a)})(${lp(b)}).`, `Factor the bottom: ${quad(a, c)} = (${lp(a)})(${lp(c)}).`, `Cancel the common factor ${lp(a)}: the result is <b>${fr(lp(b), lp(c))}</b>.`];
      } else if (kind === 'mul') {
        prompt = `Multiply and simplify.${big(`${fr(quad(a, b), quad(c, d))} · ${fr(lp(c), lp(a))}`)}`;
        ansN = b; ansD = d;
        wrong = [fr(lp(d), lp(b)), fr(lp(-b), lp(-d)), fr(lp(b), lp(c)), fr(lp(a), lp(d))];
        hints = [`Factor the first fraction: ${fr(`(${lp(a)})(${lp(b)})`, `(${lp(c)})(${lp(d)})`)}.`, `${lp(a)} appears on a top and a bottom, and so does ${lp(c)}. Cancel both.`, `What is left is <b>${fr(lp(b), lp(d))}</b>.`];
      } else {
        prompt = `Divide and simplify.${big(`${fr(quad(a, b), quad(c, d))} ÷ ${fr(lp(a), lp(c))}`)}`;
        ansN = b; ansD = d;
        wrong = [fr(lp(d), lp(b)), fr(lp(-b), lp(-d)), fr(lp(b), lp(c)), fr(lp(a), lp(d))];
        hints = [`Dividing means multiplying by the reciprocal: ${fr(quad(a, b), quad(c, d))} · ${fr(lp(c), lp(a))}.`, `Factor: ${fr(`(${lp(a)})(${lp(b)})`, `(${lp(c)})(${lp(d)})`)} · ${fr(lp(c), lp(a))}. Cancel ${lp(a)} and ${lp(c)}.`, `What is left is <b>${fr(lp(b), lp(d))}</b>.`];
      }
      const answer = fr(lp(ansN), lp(ansD));
      return { prompt, type: 'choice', choices: options(answer, wrong), answer, hints, params: { kind, a, b, c, d, ansN, ansD } };
    },
    verify(q) {
      const { kind, a, b, c, d, ansN, ansD } = q.params;
      if (q.answer !== fr(lp(ansN), lp(ansD))) return 'answer text does not match';
      const Q = (u, v, t) => t * t + (u + v) * t + u * v;
      for (const t of [0.37, 1.9, 8.3, -9.6]) {
        const orig = kind === 'simp' ? Q(a, b, t) / Q(a, c, t) : kind === 'mul' ? Q(a, b, t) / Q(c, d, t) * (t + c) / (t + a) : Q(a, b, t) / Q(c, d, t) / ((t + a) / (t + c));
        if (!close(orig, (t + ansN) / (t + ansD), 1e-9)) return `differs at x = ${t}`;
      }
      return true;
    },
  });

  A.skill({
    id: 'int3.rational-add', title: 'Adding and subtracting rational expressions',
    learn: p('Just as with number fractions, <b>you need a common denominator before you add or subtract</b>. When the denominators are different binomials, their product is the common denominator.') +
      p(`Rewrite each fraction over that denominator by multiplying its top and bottom by the missing factor, then combine the numerators. When subtracting, put the second numerator in parentheses so the minus sign reaches every term.`) +
      p('Never add the denominators: ' + fr(1, X) + ' + ' + fr(1, X) + ' is ' + fr(2, X) + ', not ' + fr(2, `2${X}`) + '.') +
      example('Example', `${big(`${fr(3, lp(1))} + ${fr(2, lp(-4))}`)}The common denominator is (${lp(1)})(${lp(-4)}). The numerator is 3(${lp(-4)}) + 2(${lp(1)}) = 3${X} − 12 + 2${X} + 2 = 5${X} − 10. So the sum is <b>${fr(M.poly([5, -10]), `(${lp(1)})(${lp(-4)})`)}</b>.`),
    make(rng) {
      const [pp, qq] = rng.sample([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6], 2);
      let a = rng.nz(-5, 6), b = rng.nz(-5, 6);
      const op = rng.pick(['+', '+', '−']);
      const sg = op === '+' ? 1 : -1;
      if (a + sg * b === 0) b = b + 1 === 0 ? 2 : b + 1;
      const num = [a + sg * b, a * qq + sg * b * pp];
      const den = `(${lp(pp)})(${lp(qq)})`;
      const answer = fr(M.poly(num), den);
      const wrong = [
        sg > 0 ? fr(N(a + b), M.poly([2, pp + qq])) : fr(M.poly([a - b, a * qq + b * pp]), den),
        fr(N(a + sg * b), den),
        fr(M.poly([a + sg * b, a * pp + sg * b * qq]), den),
        fr(M.poly([a + sg * b, -(a * qq + sg * b * pp)]), den),
        fr(N(a + sg * b), M.poly([2, pp + qq])),
      ];
      return { prompt: `${op === '+' ? 'Add' : 'Subtract'}. Leave the denominator factored.${big(`${fr(N(a), lp(pp))} ${op} ${fr(N(b), lp(qq))}`)}`, type: 'choice', choices: options(answer, wrong), answer, params: { a, b, pp, qq, sg, num },
        hints: [`The common denominator is ${den}.`,
          `Build up each numerator: ${N(a)}(${lp(qq)}) ${op} ${N(b)}(${lp(pp)}).`,
          `Expand: ${M.poly([a, a * qq])} ${op} (${M.poly([b, b * pp])}) = ${M.poly(num)}.`,
          `So the result is <b>${fr(M.poly(num), den)}</b>.`] };
    },
    verify(q) {
      const { a, b, pp, qq, sg, num } = q.params;
      for (const t of [0.5, 2.25, -7.5, 9.1]) if (!close(a / (t + pp) + sg * b / (t + qq), (num[0] * t + num[1]) / ((t + pp) * (t + qq)), 1e-9)) return `differs at x = ${t}`;
      return q.answer === fr(M.poly(num), `(${lp(pp)})(${lp(qq)})`);
    },
  });

  A.skill({
    id: 'int3.rational-equations', title: 'Rational equations',
    learn: p('<b>To solve a rational equation, multiply both sides by the common denominator.</b> The fractions disappear and you are left with an ordinary equation. When the equation is one fraction equal to another, cross-multiplying does the same job.') +
      p('Always check the answer in the original equation. A value that makes any denominator zero is <b>extraneous</b> and must be thrown out.') +
      p('Work problems are rational equations too: if one person does a job in ' + V('a') + ' hours and another in ' + V('b') + ' hours, together they finish ' + fr(1, V('a')) + ' + ' + fr(1, V('b')) + ' of the job each hour.') +
      example('Example', `${big(`${fr(6, lp(-1))} = ${fr(4, lp(1))}`)}Cross-multiply: 6(${lp(1)}) = 4(${lp(-1)}), so 6${X} + 6 = 4${X} − 4, 2${X} = −10 and <b>${X} = −5</b>. Neither denominator is zero at −5, so it stands.`),
    make(rng) {
      const kind = rng.pick(['split', 'cross', 'cross', 'work']);
      if (kind === 'work') {
        const [n1, n2] = rng.sample(NAMES, 2), [ta, tb] = rng.sample([2, 3, 4, 5, 6, 7, 8, 9, 10, 12], 2);
        const job = rng.pick(['paint a fence', 'weed the garden', 'wash the team’s van', 'stack the chairs in the hall']);
        const ans = r2(ta * tb / (ta + tb));
        return { prompt: `${n1} can ${job} alone in ${ta} hours. ${n2} can do it alone in ${tb} hours. How many hours does it take them working together? Round to the nearest hundredth.`, type: 'number', answer: ans, unit: 'hours', tolerance: 0.01, params: { kind, ta, tb },
          hints: [`In one hour ${n1} does ${fr(1, ta)} of the job and ${n2} does ${fr(1, tb)}. In ${V('t')} hours together they do the whole job: ${fr(V('t'), ta)} + ${fr(V('t'), tb)} = 1.`,
            `Multiply both sides by ${ta * tb}: ${tb}${V('t')} + ${ta}${V('t')} = ${ta * tb}, so ${ta + tb}${V('t')} = ${ta * tb}.`,
            `${V('t')} = ${fr(ta * tb, ta + tb, { raw: true })} ≈ <b>${N(ans)}</b> hours.`] };
      }
      if (kind === 'split') {
        const x = rng.nz(-6, 6), b = rng.nz(-5, 5);
        let a = rng.nz(-9, 9); let c = a + b * x; if (c === 0) { a += 1; if (a === 0) a = 2; c = a + b * x; }
        return { prompt: `Solve for ${X}.${big(`${fr(N(a), X)} ${M.signed(b)} = ${fr(N(c), X)}`)}`, type: 'number', answer: x, params: { kind, a, b, c },
          hints: [`Multiply every term by ${X}: ${N(a)} ${M.signed(b)}${X} = ${N(c)}.`,
            `Subtract ${pw(a)}: ${M.term(b, 'x')} = ${N(c - a)}.`,
            `Divide by ${pw(b)}: ${X} = <b>${N(x)}</b>, which does not make a denominator zero.`] };
      }
      const [x, pp, qq] = rng.sample([-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7], 3);
      const k = rng.pick([1, 2, 3, -1, -2]);
      const a = k * (x - pp), b = k * (x - qq);
      return { prompt: `Solve for ${X}.${big(`${fr(N(a), lp(-pp))} = ${fr(N(b), lp(-qq))}`)}`, type: 'number', answer: x, params: { kind, a, b, pp, qq },
        hints: [`Cross-multiply: ${N(a)}(${lp(-qq)}) = ${N(b)}(${lp(-pp)}).`,
          `Expand: ${M.poly([a, -a * qq])} = ${M.poly([b, -b * pp])}.`,
          `Collect the ${X} terms: ${M.term(a - b, 'x')} = ${N(a * qq - b * pp)}, so ${X} = <b>${N(x)}</b>. It does not make either denominator zero.`] };
    },
    verify(q) {
      const P = q.params, x = q.answer;
      if (P.kind === 'work') return close(x / P.ta + x / P.tb, 1, 0.005);
      if (P.kind === 'split') return x !== 0 && close(P.a / x + P.b, P.c / x);
      return x !== P.pp && x !== P.qq && close(P.a / (x - P.pp), P.b / (x - P.qq));
    },
  });



  /* ---------- Unit 3: Inverse functions and logarithms ---------- */
  A.skill({
    id: 'int3.inverse-functions', title: 'Inverse functions',
    learn: p(`The inverse ${M.sup(V('f'), '−1')} undoes ${V('f')}: <b>if ${V('f')}(${V('a')}) = ${V('b')}, then ${M.sup(V('f'), '−1')}(${V('b')}) = ${V('a')}</b>. Inputs and outputs trade places, so the graph of the inverse is the graph of ${V('f')} reflected in the line ${V('y')} = ${X}.`) +
      p(`<b>To find a formula for the inverse,</b> write ${V('y')} = ${V('f')}(${X}), swap ${X} and ${V('y')}, and solve for ${V('y')}. To find a single value ${M.sup(V('f'), '−1')}(${V('c')}), you can skip the formula and solve ${V('f')}(${X}) = ${V('c')} instead.`) +
      p('Exponential and logarithmic functions are inverses of each other: the inverse of 2<sup>' + X + '</sup> is ' + LOG(2) + ' ' + X + '.') +
      example('Example', `${V('f')}(${X}) = 3${X} − 5. Find ${M.sup(V('f'), '−1')}(7).${big(`3${X} − 5 = 7 → 3${X} = 12 → ${X} = 4`)}So ${M.sup(V('f'), '−1')}(7) = <b>4</b>. Check: ${V('f')}(4) = 7.`),
    make(rng) {
      const kind = rng.pick(['lin', 'lin', 'cube', 'exp', 'formula']);
      const fi = `${M.sup(V('f'), '−1')}`;
      if (kind === 'formula') {
        let a = rng.nz(-6, 6); if (Math.abs(a) === 1) a = 2 * a; const b = rng.nz(-9, 9);
        const answer = fr(`${X} ${M.signed(-b)}`, N(a));
        const wrong = [fr(`${X} ${M.signed(b)}`, N(a)), `${fr(X, N(a))} ${M.signed(-b)}`, fr(`${X} ${M.signed(-a)}`, N(b)), `${N(a)}${X} ${M.signed(-b)}`];
        return { prompt: `Find the inverse of ${V('f')}.${big(`${V('f')}(${X}) = ${M.poly([a, b])}`)}`, type: 'choice', choices: options(answer, wrong), answer, params: { kind, a, b },
          hints: [`Write ${V('y')} = ${M.poly([a, b])}, then swap the letters: ${X} = ${M.poly([a, b], 'y')}.`, `Solve for ${V('y')}: subtract ${pw(b)} from both sides, then divide by ${pw(a)}.`, `${fi}(${X}) = <b>${answer}</b>.`] };
      }
      let fTxt, y, c, hints, a, b, base, k;
      if (kind === 'lin') {
        a = rng.nz(-6, 6); b = rng.nz(-12, 12); y = rng.int(-8, 8); c = a * y + b;
        fTxt = M.poly([a, b]);
        hints = [`${fi}(${N(c)}) is the input that makes ${V('f')} equal ${N(c)}. Solve ${fTxt} = ${N(c)}.`, `${M.term(a, 'x')} = ${N(c - b)}, so ${X} = ${N(c - b)} ÷ ${pw(a)}.`, `${fi}(${N(c)}) = <b>${N(y)}</b>.`];
      } else if (kind === 'cube') {
        a = rng.pick([1, 2, -1]); b = rng.int(-10, 10); y = rng.int(-3, 4); c = a * y ** 3 + b;
        fTxt = M.poly([a, 0, 0, b]);
        hints = [`${fi}(${N(c)}) is the input that makes ${V('f')} equal ${N(c)}. Solve ${fTxt} = ${N(c)}.`, `${M.term(a, 'x', 3)} = ${N(c - b)}, so ${M.sup(X, 3)} = ${N((c - b) / a)}.`, `Take the cube root: ${fi}(${N(c)}) = <b>${N(y)}</b>.`];
      } else {
        base = rng.pick([2, 3, 5]); k = rng.int(-9, 9); y = rng.int(0, base === 2 ? 6 : 3); c = base ** y + k;
        fTxt = `${M.sup(N(base), X)} ${k ? M.signed(k) : ''}`.trim();
        hints = [`${fi}(${N(c)}) is the input that makes ${V('f')} equal ${N(c)}. Solve ${fTxt} = ${N(c)}.`, `${M.sup(N(base), X)} = ${N(c - k)}.`, `${N(c - k)} = ${M.sup(N(base), y)}, so ${fi}(${N(c)}) = <b>${N(y)}</b>.`];
      }
      return { prompt: `Find ${fi}(${N(c)}).${big(`${V('f')}(${X}) = ${fTxt}`)}`, type: 'number', answer: y, hints, params: { kind, a, b, base, k, c } };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'formula') { const g = t => (t - P.b) / P.a; for (const t of [-3, 0.5, 7]) if (!close(P.a * g(t) + P.b, t)) return 'not an inverse'; return q.answer === fr(`${X} ${M.signed(-P.b)}`, N(P.a)); }
      const y = q.answer;
      const fy = P.kind === 'lin' ? P.a * y + P.b : P.kind === 'cube' ? P.a * y * y * y + P.b : Math.pow(P.base, y) + P.k;
      return fy === P.c;      // the answer, put through f, gives back c
    },
  });

  A.skill({
    id: 'int3.log-properties', title: 'Evaluating logarithms and using their properties',
    learn: p(`A logarithm is an exponent. <b>${LOG(V('b'))} ${V('x')} = ${V('y')} means ${M.sup(V('b'), V('y'))} = ${V('x')}.</b> So ${LOG(2)} 32 = 5 because 2<sup>5</sup> = 32, and ${LOG(3)} ${fr(1, 9)} = −2 because 3<sup>−2</sup> = ${fr(1, 9)}.`) +
      p(`The properties come from the exponent rules: <b>${LOG(V('b'))} ${V('m')}${V('n')} = ${LOG(V('b'))} ${V('m')} + ${LOG(V('b'))} ${V('n')}</b>, <b>${LOG(V('b'))} (${V('m')}/${V('n')}) = ${LOG(V('b'))} ${V('m')} − ${LOG(V('b'))} ${V('n')}</b>, and <b>${LOG(V('b'))} ${M.sup(V('m'), V('k'))} = ${V('k')} ${LOG(V('b'))} ${V('m')}</b>.`) +
      p('These let you combine logs whose arguments are not powers of the base into one log that is.') +
      example('Example', `${big(`${LOG(6)} 4 + ${LOG(6)} 9`)}Combine: ${LOG(6)} (4 · 9) = ${LOG(6)} 36. Since 6<sup>2</sup> = 36, the value is <b>2</b>.`),
    make(rng) {
      const kind = rng.pick(['eval', 'eval', 'sum', 'diff', 'given']);
      if (kind === 'eval') {
        const b = rng.pick([2, 3, 4, 5, 10]), maxK = { 2: 7, 3: 5, 4: 4, 5: 4, 10: 5 }[b];
        const k = rng.chance(0.15) ? 0.5 : rng.int(-3, maxK);
        const arg = k === 0.5 ? M.sqrt(b) : k >= 0 ? N(b ** k) : F(1, b ** -k);
        const q = { prompt: `Evaluate.${big(`${LOG(b)} ${arg}`)}`, type: 'number', answer: k, params: { kind, b, x: Math.pow(b, k) },
          hints: [`Ask: ${N(b)} to what power gives ${arg}?`, k === 0.5 ? `A square root is a power of ${fr(1, 2)}: ${M.sqrt(b)} = ${M.sup(N(b), '1/2')}.` : k < 0 ? `${arg} = ${fr(1, M.sup(N(b), -k))} = ${M.sup(N(b), N(k))}.` : `${N(b ** k)} = ${M.sup(N(b), k)}.`, `So ${LOG(b)} ${arg} = <b>${k === 0.5 ? '1/2' : N(k)}</b>.`] };
        if (k === 0.5) q.answerText = '1/2';
        return q;
      }
      if (kind === 'sum') {
        const b = rng.pick([6, 10, 12, 15]), k = rng.int(2, 3), total = b ** k;
        const divs = []; for (let d = 2; d * d < total; d++) if (total % d === 0 && d % b !== 0) divs.push(d);
        let m = rng.pick(divs), n = total / m; if (rng.bool()) [m, n] = [n, m];
        return { prompt: `Evaluate.${big(`${LOG(b)} ${N(m)} + ${LOG(b)} ${N(n)}`)}`, type: 'number', answer: k, params: { kind, b, m, n },
          hints: [`Use the product rule: ${LOG(b)} ${N(m)} + ${LOG(b)} ${N(n)} = ${LOG(b)} (${N(m)} · ${N(n)}).`, `${N(m)} · ${N(n)} = ${N(total)} = ${M.sup(N(b), k)}.`, `So the value is <b>${k}</b>.`] };
      }
      if (kind === 'diff') {
        const b = rng.pick([2, 3, 5]), k = rng.int(1, 3); let n = rng.int(2, 9); if (n % b === 0) n += 1;
        const m = n * b ** k;
        return { prompt: `Evaluate.${big(`${LOG(b)} ${N(m)} − ${LOG(b)} ${N(n)}`)}`, type: 'number', answer: k, params: { kind, b, m, n },
          hints: [`Use the quotient rule: ${LOG(b)} ${N(m)} − ${LOG(b)} ${N(n)} = ${LOG(b)} ${fr(m, n, { raw: true })}.`, `${N(m)} ÷ ${N(n)} = ${N(b ** k)} = ${M.sup(N(b), k)}.`, `So the value is <b>${k}</b>.`] };
      }
      const u = rng.nz(-4, 5), w = rng.nz(-4, 5), pp = rng.int(1, 3), qq = rng.int(1, 3), op = rng.pick(['mul', 'div']);
      const sgn = op === 'mul' ? '+' : '−';
      const ans = pp * u + (op === 'mul' ? 1 : -1) * qq * w;
      const xp = pp > 1 ? M.sup(V('x'), pp) : V('x'), yq = qq > 1 ? M.sup(V('y'), qq) : V('y');
      const arg = op === 'mul' ? `${xp}${yq}` : `(${xp}/${yq})`;
      return { prompt: `${LOG(V('b'))} ${V('x')} = ${N(u)} and ${LOG(V('b'))} ${V('y')} = ${N(w)}. Find the value.${big(`${LOG(V('b'))} ${arg}`)}`, type: 'number', answer: ans, params: { kind, u, w, pp, qq, op },
        hints: [`Split with the ${op === 'mul' ? 'product' : 'quotient'} rule: ${LOG(V('b'))} ${xp} ${sgn} ${LOG(V('b'))} ${yq}.`,
          `Bring the powers down: ${pp > 1 ? pp + ' ' : ''}${LOG(V('b'))} ${V('x')} ${sgn} ${qq > 1 ? qq + ' ' : ''}${LOG(V('b'))} ${V('y')} = ${pp}(${N(u)}) ${sgn} ${qq}(${N(w)}).`,
          `That is ${N(pp * u)} ${sgn} ${pw(qq * w)} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params, L = (b, x) => Math.log10(x) / Math.log10(b);
      if (P.kind === 'eval') return close(L(P.b, P.x), q.answer, 1e-9);
      if (P.kind === 'sum') return close(L(P.b, P.m) + L(P.b, P.n), q.answer, 1e-9);
      if (P.kind === 'diff') return close(L(P.b, P.m) - L(P.b, P.n), q.answer, 1e-9);
      const x = Math.pow(2, P.u), y = Math.pow(2, P.w);              // try it with base 2
      const v = P.op === 'mul' ? Math.pow(x, P.pp) * Math.pow(y, P.qq) : Math.pow(x, P.pp) / Math.pow(y, P.qq);
      return close(Math.log2(v), q.answer, 1e-9);
    },
  });

  A.skill({
    id: 'int3.exp-log-equations', title: 'Solving exponential and logarithmic equations',
    learn: p(`<b>If both sides can be written as powers of the same base, set the exponents equal.</b> 3<sup>2${X} − 1</sup> = 243 = 3<sup>5</sup> gives 2${X} − 1 = 5, so ${X} = 3.`) +
      p(`<b>To solve a log equation, rewrite it in exponential form:</b> ${LOG(V('b'))} (expression) = ${V('k')} means expression = ${M.sup(V('b'), V('k'))}. Then check that the expression inside the log is positive.`) +
      p(`When the bases do not match, isolate the power and take a logarithm of both sides: ${M.sup(V('b'), X)} = ${V('c')} gives ${X} = ${fr(`log ${V('c')}`, `log ${V('b')}`)}. With base ${V('e')}, use the natural log: ${M.sup(V('e'), V('k') + X)} = ${V('c')} gives ${X} = ${fr(`ln ${V('c')}`, V('k'))}.`) +
      example('Example', `${big(`5 · ${M.sup('2', X)} = 60`)}Divide by 5: 2<sup>${X}</sup> = 12. Then ${X} = ${fr('log 12', 'log 2')} ≈ <b>3.58</b>.`),
    make(rng) {
      const kind = rng.pick(['same', 'log', 'unlike', 'ln']);
      if (kind === 'same') {
        const b = rng.pick([2, 3, 5]), maxE = { 2: 7, 3: 5, 5: 4 }[b];
        const e = rng.int(-2, maxE), a = rng.pick([1, 2, 3]), x = rng.nz(-4, 4), c = e - a * x;
        const val = e >= 0 ? N(b ** e) : F(1, b ** -e);
        return { prompt: `Solve for ${X}.${big(`${M.sup(N(b), M.poly([a, c]))} = ${val}`)}`, type: 'number', answer: x, params: { kind, b, a, c, e },
          hints: [`Write the right side as a power of ${b}: ${val} = ${M.sup(N(b), N(e))}.`, `Set the exponents equal: ${M.poly([a, c])} = ${N(e)}.`, `${M.term(a, 'x')} = ${N(e - c)}, so ${X} = <b>${N(x)}</b>.`] };
      }
      if (kind === 'log') {
        const b = rng.pick([2, 3, 5, 10]), k = rng.int(1, { 2: 6, 3: 4, 5: 3, 10: 3 }[b]);
        const a = rng.int(1, 4), x = rng.nz(-9, 12), c = b ** k - a * x;
        return { prompt: `Solve for ${X}.${big(`${LOG(b)} (${M.poly([a, c])}) = ${k}`)}`, type: 'number', answer: x, params: { kind, b, k, a, c },
          hints: [`Rewrite in exponential form: ${M.poly([a, c])} = ${M.sup(N(b), k)} = ${N(b ** k)}.`, `Subtract ${pw(c)} from both sides${a > 1 ? `, then divide by ${a}` : ''}.`, `${X} = <b>${N(x)}</b>. The inside of the log is then ${N(b ** k)}, which is positive, so it checks.`] };
      }
      if (kind === 'unlike') {
        const b = rng.pick([2, 3, 4, 1.5]), a = rng.int(2, 9);
        let m = rng.int(5, 60); while (Number.isInteger(Math.round(Math.log(m) / Math.log(b) * 1e9) / 1e9)) m += 1;
        const c = a * m, x = r2(Math.log(m) / Math.log(b));
        return { prompt: `Solve for ${X}. Round to the nearest hundredth.${big(`${N(a)} · ${M.sup(N(b), X)} = ${N(c)}`)}`, type: 'number', answer: x, tolerance: 0.01, params: { kind, b, a, c },
          hints: [`Isolate the power: divide by ${a} to get ${M.sup(N(b), X)} = ${N(m)}.`, `Take the log of both sides: ${X} log ${N(b)} = log ${N(m)}, so ${X} = ${fr(`log ${N(m)}`, `log ${N(b)}`)}.`, `${X} ≈ <b>${N(x)}</b>.`] };
      }
      const k = rng.int(1, 4), c = rng.pick([2, 3, 5, 7, 10, 12, 15, 20, 25, 40, 50]);
      const x = r2(Math.log(c) / k);
      return { prompt: `Solve for ${X}. Round to the nearest hundredth.${big(`${M.sup(V('e'), k === 1 ? X : k + X)} = ${N(c)}`)}`, type: 'number', answer: x, tolerance: 0.01, params: { kind, k, c },
        hints: [`Take the natural log of both sides: ${k === 1 ? X : k + X} = ln ${N(c)}.`, `ln ${N(c)} ≈ ${N(M.round(Math.log(c), 4))}${k > 1 ? `, and dividing by ${k} gives ${N(M.round(Math.log(c) / k, 4))}` : ''}.`, `${X} ≈ <b>${N(x)}</b>.`] };
    },
    verify(q) {
      const P = q.params, x = q.answer;
      if (P.kind === 'same') return close(Math.pow(P.b, P.a * x + P.c), Math.pow(P.b, P.e), 1e-9);
      if (P.kind === 'log') return close(Math.log(P.a * x + P.c) / Math.log(P.b), P.k, 1e-9);
      if (P.kind === 'unlike') return Math.abs(x - Math.log10(P.c / P.a) / Math.log10(P.b)) <= 0.005 + 1e-9;
      return Math.abs(x - Math.log10(P.c) / Math.log10(Math.E) / P.k) <= 0.005 + 1e-9;
    },
  });

  A.skill({
    id: 'int3.exp-log-models', title: 'Exponential and logarithmic models',
    learn: p(`A quantity that grows or shrinks by the same <b>percent</b> each period is exponential: <b>${V('A')} = ${V('P')}(1 + ${V('r')})<sup>${V('t')}</sup></b> for growth and ${V('P')}(1 − ${V('r')})<sup>${V('t')}</sup> for decay, with ${V('r')} as a decimal. Interest compounded continuously uses ${V('A')} = ${V('P')}${M.sup(V('e'), V('rt'))}.`) +
      p(`A half-life ${V('h')} gives ${V('A')} = ${M.sub(V('A'), 0)}(${fr(1, 2)})<sup>${V('t')}/${V('h')}</sup>. To find <b>when</b> a target is reached, set the formula equal to the target and solve with logarithms.`) +
      p(`Logarithmic scales squeeze huge ranges into small numbers: acidity is pH = −log[H<sup>+</sup>], so each step of 1 in pH is a factor of 10 in concentration.`) +
      example('Example', `A town of 4,000 grows 3% a year. When does it reach 6,000?${big(`4000(1.03)<sup>${V('t')}</sup> = 6000 → 1.03<sup>${V('t')}</sup> = 1.5 → ${V('t')} = ${fr('log 1.5', 'log 1.03')}`)}${V('t')} ≈ <b>13.7 years</b>.`),
    make(rng) {
      const kind = rng.pick(['growth', 'decay', 'half', 'when', 'ph', 'cont']);
      const name = rng.pick(NAMES);
      if (kind === 'growth' || kind === 'decay') {
        const grow = kind === 'growth', r = rng.pick(grow ? [2, 3, 4, 5, 6, 8] : [8, 10, 12, 15, 18]), t = rng.int(3, 12);
        const P0 = grow ? rng.int(4, 60) * 100 : rng.int(12, 40) * 1000, g = 1 + (grow ? r : -r) / 100;
        const ans = Math.round(P0 * Math.pow(g, t));
        const prompt = grow ? `A town has ${N(P0)} people and grows by ${r}% each year. About how many people live there after ${t} years? Round to the nearest whole number.`
          : `${name} buys a used car for ${M.money(P0)}. It loses ${r}% of its value each year. What is it worth after ${t} years? Round to the nearest dollar.`;
        return { prompt, type: 'number', answer: ans, unit: grow ? 'people' : '$', tolerance: 0.5, params: { kind, P0, r, t },
          hints: [`Each year multiplies the amount by ${N(g)}${grow ? '' : ` (100% − ${r}%)`}, so use ${N(P0)}(${N(g)})<sup>${t}</sup>.`, `${N(g)}<sup>${t}</sup> ≈ ${N(M.round(Math.pow(g, t), 5))}, and ${N(P0)} × ${N(M.round(Math.pow(g, t), 5))} ≈ ${N(M.round(P0 * Math.pow(g, t), 2))}.`, `Rounded, that is <b>${grow ? N(ans) : M.money(ans)}</b>.`] };
      }
      if (kind === 'half') {
        const A0 = rng.pick([40, 50, 80, 100, 120, 200, 250]), h = rng.pick([3, 5, 6, 8, 10, 12]), t = rng.int(2, 30);
        const ans = r1(A0 * Math.pow(0.5, t / h));
        return { prompt: `A medicine has a half-life of ${h} hours. ${name} takes a dose of ${A0} mg. How much is left in the body after ${t} hours? Round to the nearest tenth of a milligram.`, type: 'number', answer: ans, unit: 'mg', tolerance: 0.05, params: { kind, A0, h, t },
          hints: [`Use ${V('A')} = ${A0}(${fr(1, 2)})<sup>${V('t')}/${h}</sup>.`, `${t} hours is ${t}/${h} ≈ ${N(M.round(t / h, 4))} half-lives.`, `${A0} × 0.5<sup>${N(M.round(t / h, 4))}</sup> ≈ <b>${N(ans)} mg</b>.`] };
      }
      if (kind === 'when') {
        const P0 = rng.int(2, 9) * 1000, r = rng.pick([2, 3, 4, 5, 6, 7]), f = rng.pick([1.5, 2, 2.5, 3]);
        const T = P0 * f, g = 1 + r / 100, ans = r1(Math.log(f) / Math.log(g));
        return { prompt: `A town of ${N(P0)} people grows by ${r}% a year, so its population after ${V('t')} years is ${N(P0)}(${N(g)})<sup>${V('t')}</sup>. After how many years does the population reach ${N(T)}? Round to the nearest tenth.`, type: 'number', answer: ans, unit: 'years', tolerance: 0.05, params: { kind, P0, r, T },
          hints: [`Set up ${N(P0)}(${N(g)})<sup>${V('t')}</sup> = ${N(T)}, and divide by ${N(P0)}: ${N(g)}<sup>${V('t')}</sup> = ${N(f)}.`, `Take logs: ${V('t')} = ${fr(`log ${N(f)}`, `log ${N(g)}`)}.`, `${V('t')} ≈ <b>${N(ans)}</b> years.`] };
      }
      if (kind === 'ph') {
        const m = rng.pick([1.5, 2, 2.5, 3.2, 4, 5, 6.3, 8]), k = rng.int(3, 10);
        const ans = r2(k - Math.log10(m));
        return { prompt: `pH = −log[H<sup>+</sup>]. A solution has a hydrogen ion concentration of ${N(m)} × 10<sup>−${k}</sup> moles per liter. What is its pH? Round to the nearest hundredth.`, type: 'number', answer: ans, tolerance: 0.01, params: { kind, m, k },
          hints: [`pH = −log(${N(m)} × 10<sup>−${k}</sup>) = −(log ${N(m)} + log 10<sup>−${k}</sup>).`, `log ${N(m)} ≈ ${N(M.round(Math.log10(m), 4))} and log 10<sup>−${k}</sup> = −${k}.`, `pH ≈ ${k} − ${N(M.round(Math.log10(m), 4))} = <b>${N(ans)}</b>.`] };
      }
      const P0 = rng.int(5, 50) * 100, r = rng.pick([2, 2.5, 3, 4, 4.5, 5, 6]), t = rng.int(2, 20);
      const ans = r2(P0 * Math.exp(r / 100 * t)), rt = M.round(r / 100 * t, 4);
      return { prompt: `${name} deposits ${M.money(P0)} in an account paying ${r}% interest compounded continuously. How much is in the account after ${t} years? Round to the nearest cent.`, type: 'number', answer: ans, unit: '$', tolerance: 0.01, params: { kind, P0, r, t },
        hints: [`Use ${V('A')} = ${V('P')}${M.sup(V('e'), V('rt'))} with ${V('r')} = ${N(r / 100)} and ${V('t')} = ${t}.`, `${V('rt')} = ${N(rt)}, and ${M.sup(V('e'), N(rt))} ≈ ${N(M.round(Math.exp(rt), 6))}.`, `${N(P0)} × ${N(M.round(Math.exp(rt), 6))} ≈ <b>${M.money(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params, x = q.answer;
      if (P.kind === 'growth' || P.kind === 'decay') { let v = P.P0; for (let i = 0; i < P.t; i++) v *= 1 + (P.kind === 'growth' ? P.r : -P.r) / 100; return Math.abs(v - x) <= 0.5 + 1e-9; }
      if (P.kind === 'half') return Math.abs(P.A0 * Math.exp(-P.t * Math.LN2 / P.h) - x) <= 0.05 + 1e-9;
      if (P.kind === 'when') return Math.abs(P.P0 * Math.pow(1 + P.r / 100, x) / P.T - 1) < 0.004;
      if (P.kind === 'ph') return Math.abs(Math.pow(10, -x) / (P.m * Math.pow(10, -P.k)) - 1) < 0.012;
      const n = 1e6, v = P.P0 * Math.pow(1 + P.r / 100 / n, n * P.t);     // compounding a million times a year is nearly continuous
      return Math.abs(v - x) <= 0.01 + v * 1e-6;
    },
  });

  /* ---------- Unit 4: Trigonometric functions ---------- */
  /** kπ as stacked text: π/6, 5π/4, 2π */
  function piFrac(n, d) {
    [n, d] = M.simp(n, d);
    if (n === 0) return '0';
    const top = `${n === 1 ? '' : n === -1 ? '−' : N(n)}π`;
    return d === 1 ? top : F(top, d);
  }
  /** exact values on the unit circle, as HTML */
  const EXACT = [
    { v: 0, h: '0' }, { v: 0.5, h: F(1, 2) }, { v: Math.SQRT2 / 2, h: F(M.sqrt(2), 2) }, { v: Math.sqrt(3) / 2, h: F(M.sqrt(3), 2) }, { v: 1, h: '1' },
  ];
  function exactHtml(x) {
    const e = EXACT.find(e => close(e.v, Math.abs(x), 1e-9));
    return (x < -1e-12 ? '−' : '') + e.h;
  }
  const valueOf = h => { for (const e of EXACT) for (const s of [1, -1]) if ((s < 0 ? '−' : '') + e.h === h) return s * e.v; return NaN; };

  A.skill({
    id: 'int3.unit-circle', title: 'Radians and the unit circle',
    learn: p(`A <b>radian</b> is the angle that cuts off an arc as long as the radius. A full turn is 2π radians, so <b>180° = π radians</b>. To change degrees to radians multiply by ${F('π', 180)}; to change radians to degrees multiply by ${F(180, 'π')}.`) +
      p(`On the <b>unit circle</b> (radius 1), the point at angle θ is <b>(cos θ, sin θ)</b>. The special angles 30°, 45° and 60° give the values ${F(1, 2)}, ${F(M.sqrt(2), 2)} and ${F(M.sqrt(3), 2)}. In other quadrants, use the reference angle for the size and the quadrant for the sign: cosine is positive on the right, sine is positive on top.`) +
      example('Example', `Find cos ${F('5π', 6)}.${big(`${F('5π', 6)} = 150°`)}The reference angle is 30°, and 150° is in the second quadrant, where cosine is negative. So cos ${F('5π', 6)} = <b>−${F(M.sqrt(3), 2)}</b>.`),
    make(rng) {
      const kind = rng.pick(['d2r', 'r2d', 'exact', 'exact']);
      const degs = [30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
      const dg = rng.pick(kind === 'exact' ? degs.slice(0, -1).concat([0]) : degs);
      const [n, d] = M.simp(dg, 180);
      if (kind === 'd2r') {
        const answer = piFrac(n, d);
        const wrong = [piFrac(d, n), piFrac(n, 2 * d), piFrac(2 * n, d), piFrac(n + d, d), piFrac(n, d + 1)];
        return { prompt: `Convert ${M.deg(dg)} to radians.`, type: 'choice', choices: options(answer, wrong), answer, params: { kind, dg, n, d },
          hints: [`Multiply by ${F('π', 180)}: ${M.deg(dg)} × ${F('π', 180)} = ${F(dg + 'π', 180)}.`, `Simplify the fraction ${F(dg, 180, { raw: true })} = ${F(n, d)}.`, `${M.deg(dg)} = <b>${answer}</b> radians.`] };
      }
      if (kind === 'r2d') {
        return { prompt: `Convert ${piFrac(n, d)} radians to degrees.`, type: 'number', answer: dg, unit: '°', params: { kind, n, d },
          hints: [`Replace π with 180°: ${piFrac(n, d)} = ${n === 1 ? '' : `${n} × `}180°${d === 1 ? '' : ` ÷ ${d}`}.`, d === 1 ? `${n === 1 ? '' : `${n} × `}180 = ${dg}.` : `${n === 1 ? '' : `${n} × 180 = ${n * 180}, and `}${n * 180} ÷ ${d} = ${dg}.`, `${piFrac(n, d)} = <b>${M.deg(dg)}</b>.`] };
      }
      const fn = rng.pick(['sin', 'cos']);
      const s = Math.sin(rad(dg)), c = Math.cos(rad(dg)), val = fn === 'sin' ? s : c, other = fn === 'sin' ? c : s;
      const answer = exactHtml(val);
      const pool = [exactHtml(-val), exactHtml(other), exactHtml(-other), exactHtml(Math.abs(val) === 0.5 || close(Math.abs(val), 0.5) ? Math.sign(val || 1) * Math.SQRT2 / 2 : Math.sign(val || 1) * 0.5), '1', '0', '−1', F(1, 2)];
      const ref = dg % 180 === 0 || dg % 90 === 0 ? null : Math.min(dg % 180, 180 - dg % 180);
      const quad = Math.floor(dg / 90) + 1;
      return { prompt: `Find the exact value.${big(`${fn} ${dg === 0 ? '0' : piFrac(n, d)}`)}`, type: 'choice', choices: options(answer, pool), answer, params: { kind, fn, n, d },
        hints: [`Convert to degrees: ${dg === 0 ? '0' : piFrac(n, d)} = ${M.deg(dg)}.`,
          ref ? `The reference angle is ${M.deg(ref)}, and ${M.deg(dg)} is in quadrant ${quad}, where ${fn} is ${val > 0 ? 'positive' : 'negative'}.` : `${M.deg(dg)} lies on an axis: the unit-circle point there is (${N(Math.round(c))}, ${N(Math.round(s))}).`,
          `${fn} ${dg === 0 ? '0' : piFrac(n, d)} = <b>${answer}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'd2r') { const t = A.stripTags(q.answer).replace(/\s+/g, ''); const m = t.match(/^(−?\d*)π(\d*)$/); const k = (m[1] === '' ? 1 : m[1] === '−' ? -1 : Number(m[1])) / (m[2] ? Number(m[2]) : 1); return close(k * 180, P.dg); }
      if (P.kind === 'r2d') return close(q.answer * Math.PI / 180, P.n * Math.PI / P.d);
      const x = P.n * Math.PI / P.d;
      return close(valueOf(q.answer), P.fn === 'sin' ? Math.sin(x) : Math.cos(x), 1e-9);
    },
  });

  A.skill({
    id: 'int3.sinusoid-graphs', title: 'Graphs of sine and cosine',
    learn: p(`The graphs of ${V('y')} = ${V('a')} sin(${V('b')}${X}) + ${V('d')} and ${V('y')} = ${V('a')} cos(${V('b')}${X}) + ${V('d')} are waves. <b>The midline is ${V('y')} = ${V('d')}</b>, the level the wave rises above and falls below. <b>The amplitude is |${V('a')}|</b>, the distance from the midline to a peak.`) +
      p(`<b>The period is ${F('2π', V('b'))}</b>, the horizontal length of one full cycle. So the maximum value is ${V('d')} + |${V('a')}| and the minimum is ${V('d')} − |${V('a')}|. A negative ${V('a')} flips the wave upside down but does not change the amplitude.`) +
      example('Example', `${big(`${V('y')} = −3 cos(${F(`π${X}`, 4)}) + 5`)}Amplitude |−3| = 3, midline ${V('y')} = 5, period 2π ÷ ${F('π', 4)} = 8. The maximum is 5 + 3 = <b>8</b> and the minimum is <b>2</b>.`),
    make(rng) {
      const kind = rng.pick(['formula', 'formula', 'formula', 'wheel']);
      if (kind === 'wheel') {
        const name = rng.pick(NAMES), dia = rng.pick([20, 30, 40, 50, 60, 80, 100]), hub = dia / 2 + rng.int(1, 6), T = rng.pick([20, 30, 40, 45, 60, 90]);
        const ask = rng.pick(['amp', 'mid', 'per', 'max']);
        const ans = { amp: dia / 2, mid: hub, per: T, max: hub + dia / 2 }[ask];
        const what = { amp: 'the amplitude of the height function, in meters', mid: 'the midline height, in meters', per: 'the period, in seconds', max: 'the greatest height of the seat, in meters' }[ask];
        return { prompt: `A Ferris wheel is ${dia} m across and its center is ${hub} m above the ground. It turns once every ${T} seconds. ${name}’s seat height is a sinusoidal function of time. What is ${what}?`, type: 'number', answer: ans, unit: ask === 'per' ? 's' : 'm', params: { kind, dia, hub, T, ask },
          hints: [`The seat swings between the bottom and the top of the wheel, ${dia / 2} m (the radius) below and above the center.`, `So the midline is the center height ${hub} m, the amplitude is the radius ${dia / 2} m, and one full cycle takes ${T} s.`, `The answer is <b>${N(ans)} ${ask === 'per' ? 's' : 'm'}</b>.`] };
      }
      const fn = rng.pick(['sin', 'cos']), a = rng.pick([-5, -4, -3, -2, 2, 3, 4, 5, 6]), dd = rng.int(-6, 8), h = rng.pick([1, 2, 3, 4, 6]);
      const inner = h === 1 ? `π${X}` : F(`π${X}`, h);
      const fTxt = `${V('y')} = ${a === 1 ? '' : a === -1 ? '−' : N(a)} ${fn}(${inner})${dd ? ' ' + M.signed(dd) : ''}`.replace('=  ', '= ');
      const ask = rng.pick(['amp', 'per', 'mid', 'max', 'min']);
      const ans = { amp: Math.abs(a), per: 2 * h, mid: dd, max: dd + Math.abs(a), min: dd - Math.abs(a) }[ask];
      const what = { amp: 'the amplitude', per: 'the period', mid: `the midline (enter the number ${V('d')} in ${V('y')} = ${V('d')})`, max: 'the maximum value', min: 'the minimum value' }[ask];
      const hints = [`Match to ${V('y')} = ${V('a')} ${fn}(${V('b')}${X}) + ${V('d')}: ${V('a')} = ${N(a)}, ${V('b')} = ${h === 1 ? 'π' : F('π', h)}, ${V('d')} = ${N(dd)}.`];
      if (ask === 'per') hints.push(`Period = 2π ÷ ${h === 1 ? 'π' : F('π', h)} = 2π × ${h === 1 ? F(1, 'π') : F(h, 'π')} = ${2 * h}.`);
      else if (ask === 'amp') hints.push(`The amplitude is |${V('a')}| = |${N(a)}|. The sign only flips the wave.`);
      else if (ask === 'mid') hints.push(`The midline is ${V('y')} = ${V('d')}, the vertical shift.`);
      else hints.push(`The wave goes |${N(a)}| = ${Math.abs(a)} ${ask === 'max' ? 'above' : 'below'} the midline ${V('y')} = ${N(dd)}: ${N(dd)} ${ask === 'max' ? '+' : '−'} ${Math.abs(a)}.`);
      hints.push(`The ${ask === 'amp' ? 'amplitude' : ask === 'per' ? 'period' : ask === 'mid' ? 'midline is ' + V('y') + ' = ' + N(ans) + ', so the number' : ask === 'max' ? 'maximum' : 'minimum'} is <b>${N(ans)}</b>.`);
      return { prompt: `What is ${what}?${big(fTxt)}`, type: 'number', answer: ans, hints, params: { kind, fn, a, dd, h, ask } };
    },
    verify(q) {
      const P = q.params;
      let f, ask = P.ask, span;
      if (P.kind === 'wheel') { f = t => P.hub - (P.dia / 2) * Math.cos(2 * Math.PI * t / P.T); span = P.T; }
      else { const g = P.fn === 'sin' ? Math.sin : Math.cos; f = x => P.a * g(Math.PI * x / P.h) + P.dd; span = 2 * P.h; }
      const xs = []; for (let i = 0; i <= 480; i++) xs.push(2 * span * i / 480);
      const ys = xs.map(f), hi = Math.max(...ys), lo = Math.min(...ys);
      if (ask === 'per') { let per = null; for (let c = 1; c <= 200 && per === null; c++) if (xs.every(x => close(f(x + c), f(x), 1e-6))) per = c; return per === q.answer; }
      const got = { amp: (hi - lo) / 2, mid: (hi + lo) / 2, max: hi, min: lo }[ask];
      return close(got, q.answer, 1e-6);
    },
  });

  A.skill({
    id: 'int3.trig-equations', title: 'Solving trigonometric equations',
    learn: p(`<b>First isolate the trig function</b>, just as you would isolate ${X}: 2 sin ${X} + 1 = 0 becomes sin ${X} = −${F(1, 2)}.`) +
      p(`Then find the reference angle (here 30°) and use the signs to place the solutions. Sine is negative in quadrants 3 and 4, so in 0° ≤ ${X} &lt; 360° the solutions are 180° + 30° = 210° and 360° − 30° = 330°. <b>Sine and cosine equations usually have two solutions per turn</b>; an interval in the question tells you which one is wanted.`) +
      p(`When the value is not a special one, use the inverse key: sin ${X} = 0.4 gives ${X} = ${M.sup('sin', '−1')}(0.4) ≈ 23.6°, and the second solution is 180° − 23.6° = 156.4°.`) +
      example('Example', `Solve 2 cos ${X} = −${M.sqrt(3)} for 90° &lt; ${X} &lt; 180°.${big(`cos ${X} = −${F(M.sqrt(3), 2)}`)}The reference angle is 30°. In quadrant 2, ${X} = 180° − 30° = <b>150°</b>.`),
    make(rng) {
      const kind = rng.pick(['quad', 'quad', 'two', 'calc']);
      const fn = rng.pick(['sin', 'cos']), f = fn === 'sin' ? Math.sin : Math.cos;
      const lhs = `${fn} ${X}`;
      if (kind === 'calc') {
        const v = rng.int(15, 90) / 100, obtuse = fn === 'sin' && rng.bool(), neg = fn === 'cos' && rng.bool();
        const val = neg ? -v : v, base = fn === 'sin' ? degOf(Math.asin(v)) : degOf(Math.acos(val));
        const ans = r1(obtuse ? 180 - base : base);
        const lo = fn === 'sin' ? (obtuse ? 90 : 0) : 0, hi = fn === 'sin' ? (obtuse ? 180 : 90) : 180;
        return { prompt: `Solve for ${X}, where ${lo}° &lt; ${X} &lt; ${hi}°. Round to the nearest tenth of a degree.${big(`${lhs} = ${N(val)}`)}`, type: 'number', answer: ans, unit: '°', tolerance: 0.05, params: { kind, fn, val, lo, hi },
          hints: [`Use the inverse function: ${M.sup(fn, '−1')}(${N(val)}) ≈ ${N(r1(base))}°.`, obtuse ? `That is acute, but ${X} must be between 90° and 180°. Sine is also positive in quadrant 2: 180° − ${N(r1(base))}°.` : `That angle is in the interval ${lo}° to ${hi}°.`, `${X} ≈ <b>${N(ans)}°</b>.`] };
      }
      const th = rng.pick([30, 45, 60, 120, 135, 150, 210, 225, 240, 300, 315, 330]);
      const v = f(rad(th)), av = Math.abs(v), neg = v < 0;
      let eq;
      if (close(av, 0.5)) { const m = rng.nz(-5, 5); eq = `2 ${lhs} ${M.signed(m)} = ${N(Math.round(2 * v) + m)}`; }
      else if (close(av, Math.sqrt(3) / 2)) eq = `2 ${lhs} = ${neg ? '−' : ''}${M.sqrt(3)}`;
      else eq = `${M.sqrt(2)} ${lhs} = ${neg ? '−' : ''}1`;
      const ref = Math.min(th % 180, 180 - th % 180);
      const sols = []; for (let x = 0; x < 360; x++) if (close(f(rad(x)), v, 1e-9)) sols.push(x);
      const iso = `${lhs} = ${exactHtml(v)}`;
      if (kind === 'two') {
        const ans = Math.max(...sols);
        return { prompt: `Solve for ${X} in 0° ≤ ${X} &lt; 360°. There are two solutions; enter the larger one.${big(eq)}`, type: 'number', answer: ans, unit: '°', params: { kind, fn, v, lo: 0, hi: 360, big: true },
          hints: [`Isolate the function: ${iso}.`, `The reference angle is ${ref}°. ${fn === 'sin' ? 'Sine' : 'Cosine'} is ${neg ? 'negative' : 'positive'} in quadrants ${fn === 'sin' ? (neg ? '3 and 4' : '1 and 2') : (neg ? '2 and 3' : '1 and 4')}.`, `The solutions are ${sols.map(s => s + '°').join(' and ')}. The larger is <b>${ans}°</b>.`] };
      }
      const lo = Math.floor(th / 90) * 90, hi = lo + 90;
      return { prompt: `Solve for ${X}, where ${lo}° &lt; ${X} &lt; ${hi}°.${big(eq)}`, type: 'number', answer: th, unit: '°', params: { kind, fn, v, lo, hi },
        hints: [`Isolate the function: ${iso}.`, `The reference angle is ${ref}°, and the interval is quadrant ${lo / 90 + 1}.`, `In that quadrant the angle is ${lo === 0 ? `${ref}°` : lo === 90 ? `180° − ${ref}°` : lo === 180 ? `180° + ${ref}°` : `360° − ${ref}°`}, so ${X} = <b>${th}°</b>.`] };
    },
    verify(q) {
      const P = q.params, f = P.fn === 'sin' ? Math.sin : Math.cos, x = q.answer;
      if (P.kind === 'calc') return x > P.lo && x < P.hi && Math.abs(f(rad(x)) - P.val) < 0.002;
      const sols = []; for (let t = P.lo; t < P.hi; t += 0.5) if (t > P.lo || P.big) if (Math.abs(f(rad(t)) - P.v) < 1e-9) sols.push(t);
      return P.kind === 'two' ? sols.length === 2 && x === sols[1] : sols.length === 1 && x === sols[0];
    },
  });

  /* ---------- Unit 5: Non-right triangles ---------- */
  /** the triangle with side a = BC on the x-axis and angles B, C (degrees) at its ends: returns sides b, c */
  function buildAAS(a, B, C) {
    const t = a / (Math.cos(rad(B)) + Math.sin(rad(B)) * Math.cos(rad(C)) / Math.sin(rad(C)));     // distance from B to A
    return { c: t, b: t * Math.sin(rad(B)) / Math.sin(rad(C)) };
  }
  const heron = (a, b, c) => { const s = (a + b + c) / 2; return Math.sqrt(s * (s - a) * (s - b) * (s - c)); };
  function triFigure(lab) {
    return `<svg class="figure" viewBox="0 0 220 120" width="220" height="120" role="img" aria-label="triangle ABC"><polygon points="20,100 200,100 140,20" fill="none" stroke="currentColor" stroke-width="2"/>` +
      `<text x="8" y="112" font-size="14">A</text><text x="204" y="112" font-size="14">B</text><text x="136" y="14" font-size="14">C</text>` +
      `<text x="105" y="116" font-size="12">${lab.c || ''}</text><text x="176" y="58" font-size="12">${lab.a || ''}</text><text x="56" y="54" font-size="12">${lab.b || ''}</text></svg>`;
  }

  A.skill({
    id: 'int3.law-of-sines', title: 'The law of sines and triangle area',
    learn: p(`Label a triangle so side ${V('a')} is opposite angle ${V('A')}, ${V('b')} opposite ${V('B')}, and ${V('c')} opposite ${V('C')}. <b>The law of sines:</b> ${F(V('a'), `sin ${V('A')}`)} = ${F(V('b'), `sin ${V('B')}`)} = ${F(V('c'), `sin ${V('C')}`)}. Use it when you know an angle and the side opposite it.`) +
      p(`To find a side, set up the proportion and multiply. To find an angle, solve for its sine and use ${M.sup('sin', '−1')}. If you need the third angle, remember the angles add to 180°.`) +
      p(`<b>Area = ½${V('ab')} sin ${V('C')}</b>: two sides and the angle between them. The height to side ${V('a')} is ${V('b')} sin ${V('C')}, which is where both formulas come from.`) +
      example('Example', `${V('A')} = 40°, ${V('B')} = 75°, ${V('a')} = 10. Find ${V('b')}.${big(`${V('b')} = ${F(`10 sin 75°`, `sin 40°`)}`)}≈ ${F('9.659', '0.643')} ≈ <b>15.0</b>.`),
    make(rng) {
      const kind = rng.pick(['side', 'side3', 'angle', 'area']);
      if (kind === 'area') {
        const a = rng.int(4, 25), b = rng.int(4, 25), C = rng.pick([rng.int(20, 85), rng.int(95, 160)]);
        const ans = r1(0.5 * a * b * Math.sin(rad(C)));
        return { prompt: `In triangle ${V('ABC')}, ${V('a')} = ${a} cm, ${V('b')} = ${b} cm and the angle between them is ${V('C')} = ${C}°. Find the area. Round to the nearest tenth.${triFigure({ a: a, b: b })}`, type: 'number', answer: ans, unit: 'cm²', tolerance: 0.05, params: { kind, a, b, C },
          hints: [`Two sides and the included angle: Area = ½${V('ab')} sin ${V('C')}.`, `½ × ${a} × ${b} × sin ${C}° = ${N(a * b / 2)} × ${N(M.round(Math.sin(rad(C)), 4))}.`, `Area ≈ <b>${N(ans)} cm²</b>.`] };
      }
      if (kind === 'angle') {
        const Aa = rng.int(35, 120), a = rng.int(10, 30), b = rng.int(4, a - 2);
        const ans = r1(degOf(Math.asin(b * Math.sin(rad(Aa)) / a)));
        return { prompt: `In triangle ${V('ABC')}, ${V('A')} = ${Aa}°, ${V('a')} = ${a} and ${V('b')} = ${b}. Find angle ${V('B')}. Round to the nearest tenth of a degree.${triFigure({ a, b })}`, type: 'number', answer: ans, unit: '°', tolerance: 0.05, params: { kind, Aa, a, b },
          hints: [`Set up the law of sines: ${F(`sin ${V('B')}`, b)} = ${F(`sin ${Aa}°`, a)}.`, `sin ${V('B')} = ${F(`${b} sin ${Aa}°`, a)} ≈ ${N(M.round(b * Math.sin(rad(Aa)) / a, 4))}.`, `${V('b')} is shorter than ${V('a')}, so ${V('B')} is smaller than ${V('A')} and acute: ${V('B')} ≈ <b>${N(ans)}°</b>.`] };
      }
      const Aa = rng.int(30, 100), B = rng.int(25, 150 - Aa), C = 180 - Aa - B, a = rng.int(6, 30);
      if (kind === 'side') {
        const ans = r1(a * Math.sin(rad(B)) / Math.sin(rad(Aa)));
        return { prompt: `In triangle ${V('ABC')}, ${V('A')} = ${Aa}°, ${V('B')} = ${B}° and ${V('a')} = ${a}. Find ${V('b')}. Round to the nearest tenth.${triFigure({ a, b: V('b') + ' = ?' })}`, type: 'number', answer: ans, tolerance: 0.05, params: { kind, Aa, B, a },
          hints: [`You know ${V('A')} and the side opposite it, so use ${F(V('b'), `sin ${B}°`)} = ${F(a, `sin ${Aa}°`)}.`, `${V('b')} = ${F(`${a} sin ${B}°`, `sin ${Aa}°`)} ≈ ${F(N(M.round(a * Math.sin(rad(B)), 4)), N(M.round(Math.sin(rad(Aa)), 4)))}.`, `${V('b')} ≈ <b>${N(ans)}</b>.`] };
      }
      const ans = r1(a * Math.sin(rad(C)) / Math.sin(rad(Aa)));
      return { prompt: `In triangle ${V('ABC')}, ${V('A')} = ${Aa}°, ${V('B')} = ${B}° and ${V('a')} = ${a}. Find ${V('c')}. Round to the nearest tenth.${triFigure({ a, c: V('c') + ' = ?' })}`, type: 'number', answer: ans, tolerance: 0.05, params: { kind, Aa, B, a },
        hints: [`First find the third angle: ${V('C')} = 180° − ${Aa}° − ${B}° = ${C}°.`, `Law of sines: ${V('c')} = ${F(`${a} sin ${C}°`, `sin ${Aa}°`)}.`, `${V('c')} ≈ <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'area') { const c = Math.sqrt(P.a * P.a + P.b * P.b - 2 * P.a * P.b * Math.cos(rad(P.C))); return Math.abs(heron(P.a, P.b, c) - q.answer) <= 0.05 + 1e-9; }
      if (P.kind === 'angle') {
        // find c from a² = b² + c² − 2bc cos A (the positive root), then B from the law of cosines
        const ca = Math.cos(rad(P.Aa)), c = P.b * ca + Math.sqrt(P.a * P.a - P.b * P.b * (1 - ca * ca));
        const B = degOf(Math.acos((P.a * P.a + c * c - P.b * P.b) / (2 * P.a * c)));
        return Math.abs(B - q.answer) <= 0.05 + 1e-9;
      }
      const t = buildAAS(P.a, P.B, 180 - P.Aa - P.B);
      return Math.abs((P.kind === 'side' ? t.b : t.c) - q.answer) <= 0.05 + 1e-9;
    },
  });

  A.skill({
    id: 'int3.law-of-cosines', title: 'The law of cosines',
    learn: p(`When you know two sides and the angle between them, or all three sides, the law of sines cannot get started. Use <b>the law of cosines: ${M.sup(V('c'), 2)} = ${M.sup(V('a'), 2)} + ${M.sup(V('b'), 2)} − 2${V('ab')} cos ${V('C')}</b>.`) +
      p(`It is the Pythagorean theorem with a correction term: when ${V('C')} = 90°, cos ${V('C')} = 0 and the correction disappears. To find an angle from three sides, rearrange: cos ${V('C')} = ${F(`${M.sup(V('a'), 2)} + ${M.sup(V('b'), 2)} − ${M.sup(V('c'), 2)}`, `2${V('ab')}`)}. A negative cosine means the angle is obtuse.`) +
      example('Example', `${V('a')} = 7, ${V('b')} = 9, ${V('C')} = 50°. Find ${V('c')}.${big(`${M.sup(V('c'), 2)} = 49 + 81 − 126 cos 50° ≈ 49.0`)}${V('c')} ≈ √49.0 ≈ <b>7.0</b>.`),
    make(rng) {
      const kind = rng.pick(['side', 'side', 'angle']);
      if (kind === 'side') {
        const a = rng.int(4, 25), b = rng.int(4, 25), C = rng.int(25, 150);
        const c2 = a * a + b * b - 2 * a * b * Math.cos(rad(C)), ans = r1(Math.sqrt(c2));
        const ctx = rng.bool() ? null : rng.pick(NAMES);
        const prompt = ctx ? `${ctx} walks ${a} m along one side of a field, turns, and walks ${b} m along a second path. The angle between the two paths is ${C}°. How far is ${ctx} from the start, in a straight line? Round to the nearest tenth.`
          : `In triangle ${V('ABC')}, ${V('a')} = ${a}, ${V('b')} = ${b} and ${V('C')} = ${C}°. Find ${V('c')}. Round to the nearest tenth.${triFigure({ a, b, c: V('c') + ' = ?' })}`;
        return { prompt, type: 'number', answer: ans, unit: ctx ? 'm' : undefined, tolerance: 0.05, params: { kind, a, b, C },
          hints: [`Two sides and the angle between them: ${M.sup(V('c'), 2)} = ${a}² + ${b}² − 2(${a})(${b}) cos ${C}°.`, `= ${a * a + b * b} − ${2 * a * b}(${N(M.round(Math.cos(rad(C)), 4))}) ≈ ${N(M.round(c2, 2))}.`, `Take the square root: <b>${N(ans)}</b>.`] };
      }
      let a, b, c;
      do { a = rng.int(4, 20); b = rng.int(4, 20); c = rng.int(4, 20); } while (a + b <= c + 1 || a + c <= b + 1 || b + c <= a + 1);
      const cosC = (a * a + b * b - c * c) / (2 * a * b), ans = r1(degOf(Math.acos(cosC)));
      return { prompt: `A triangle has sides ${V('a')} = ${a}, ${V('b')} = ${b} and ${V('c')} = ${c}. Find angle ${V('C')}, the angle opposite side ${V('c')}. Round to the nearest tenth of a degree.${triFigure({ a, b, c })}`, type: 'number', answer: ans, unit: '°', tolerance: 0.05, params: { kind, a, b, c },
        hints: [`Rearrange the law of cosines: cos ${V('C')} = ${F(`${a}² + ${b}² − ${c}²`, `2(${a})(${b})`)}.`, `cos ${V('C')} = ${F(a * a + b * b - c * c, 2 * a * b, { raw: true })} ≈ ${N(M.round(cosC, 4))}${cosC < 0 ? ', which is negative, so the angle is obtuse' : ''}.`, `${V('C')} = ${M.sup('cos', '−1')}(${N(M.round(cosC, 4))}) ≈ <b>${N(ans)}°</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'side') { const bx = P.b * Math.cos(rad(P.C)), by = P.b * Math.sin(rad(P.C)); return Math.abs(Math.hypot(bx - P.a, by) - q.answer) <= 0.05 + 1e-9; }
      const s = Math.min(1, 2 * heron(P.a, P.b, P.c) / (P.a * P.b)), acute = Math.asin(s) * 180 / Math.PI;
      const C = P.c * P.c > P.a * P.a + P.b * P.b ? 180 - acute : acute;
      return Math.abs(C - q.answer) <= 0.05 + 1e-9;
    },
  });

  /* ---------- Unit 6: Sequences and series ---------- */
  const sigma = (n, body) => `<span class="sigma">∑<sub>${V('k')} = 1</sub><sup>${n}</sup></span> (${body})`;

  A.skill({
    id: 'int3.arithmetic-series', title: 'Arithmetic series',
    learn: p(`An arithmetic sequence adds the same difference ${V('d')} each time. Its ${V('n')}th term is ${M.sub(V('a'), V('n'))} = ${M.sub(V('a'), 1)} + (${V('n')} − 1)${V('d')}.`) +
      p(`<b>The sum of the first ${V('n')} terms is ${M.sub(V('S'), V('n'))} = ${F(V('n'), 2)}(${M.sub(V('a'), 1)} + ${M.sub(V('a'), V('n'))})</b>: the number of terms times the average of the first and last. Pairing the first and last, the second and second-to-last, and so on gives equal sums each time.`) +
      p(`If you are given the last term instead of ${V('n')}, solve ${M.sub(V('a'), 1)} + (${V('n')} − 1)${V('d')} = last for ${V('n')} first. Sigma notation ${sigma(V('n'), '…')} means “add the expression for ${V('k')} = 1, 2, …, ${V('n')}”.`) +
      example('Example', `${big('5 + 9 + 13 + … + 41')}${V('d')} = 4, and 5 + 4(${V('n')} − 1) = 41 gives ${V('n')} = 10. ${M.sub(V('S'), 10)} = ${F(10, 2, { raw: true })}(5 + 41) = 5 × 46 = <b>230</b>.`),
    make(rng) {
      const kind = rng.pick(['sum', 'list', 'sigma', 'seats']);
      const a1 = rng.int(-10, 20), d = rng.nz(-5, 8), n = rng.int(8, 30);
      const last = a1 + (n - 1) * d, S = n * (a1 + last) / 2;
      const steps = [`The last term is ${M.sub(V('a'), n)} = ${N(a1)} + ${n - 1}(${N(d)}) = ${N(last)}.`, `${M.sub(V('S'), n)} = ${F(n, 2, { raw: true })}(${N(a1)} + ${pw(last)}) = ${F(n, 2, { raw: true })} × ${N(a1 + last)}.`, `The sum is <b>${N(S)}</b>.`];
      if (kind === 'list') {
        const shown = [a1, a1 + d, a1 + 2 * d].map(N).join(' + ').replace(/\+ −/g, '+ (−').replace(/\(−(\d+)/g, '(−$1)');
        return { prompt: `Find the sum.${big(`${shown} + … + ${pw(last)}`)}`, type: 'number', answer: S, params: { a1, d, n },
          hints: [`The common difference is ${N(d)}. Find how many terms: ${N(a1)} + (${V('n')} − 1)(${N(d)}) = ${N(last)} gives ${V('n')} − 1 = ${n - 1}, so ${V('n')} = ${n}.`, steps[1], steps[2]] };
      }
      if (kind === 'sigma') {
        const pp = rng.nz(-4, 6), qq = rng.int(-9, 9);
        const s1 = pp + qq, sl = pp * n + qq, Ss = n * (s1 + sl) / 2;
        return { prompt: `Evaluate.${big(sigma(n, M.poly([pp, qq], 'k')))}`, type: 'number', answer: Ss, params: { a1: s1, d: pp, n },
          hints: [`The terms form an arithmetic sequence. The first (${V('k')} = 1) is ${N(s1)} and the last (${V('k')} = ${n}) is ${N(sl)}.`, `There are ${n} terms, so the sum is ${F(n, 2, { raw: true })}(${N(s1)} + ${pw(sl)}).`, `${F(n, 2, { raw: true })} × ${N(s1 + sl)} = <b>${N(Ss)}</b>.`] };
      }
      if (kind === 'seats') {
        const r = rng.int(10, 30), dd = rng.int(1, 4), rows = rng.int(10, 25), lr = r + (rows - 1) * dd, tot = rows * (r + lr) / 2;
        return { prompt: `The front row of a theater has ${r} seats, and each row behind it has ${dd} more seat${dd > 1 ? 's' : ''} than the row in front. There are ${rows} rows. How many seats are there in all?`, type: 'number', answer: tot, unit: 'seats', params: { a1: r, d: dd, n: rows },
          hints: [`The row sizes are arithmetic: ${r}, ${r + dd}, ${r + 2 * dd}, …. The last row has ${r} + ${rows - 1} × ${dd} = ${lr} seats.`, `Total = ${F(rows, 2, { raw: true })}(${r} + ${lr}).`, `That is <b>${N(tot)}</b> seats.`] };
      }
      return { prompt: `An arithmetic sequence has first term ${N(a1)} and common difference ${N(d)}. Find the sum of its first ${n} terms.`, type: 'number', answer: S, params: { a1, d, n }, hints: steps };
    },
    verify(q) { const { a1, d, n } = q.params; let s = 0; for (let k = 0; k < n; k++) s += a1 + k * d; return s === q.answer; },
  });

  A.skill({
    id: 'int3.geometric-series', title: 'Geometric series',
    learn: p(`A geometric sequence multiplies by the same ratio ${V('r')} each time: ${M.sub(V('a'), V('n'))} = ${M.sub(V('a'), 1)}${M.sup(V('r'), `${V('n')} − 1`)}.`) +
      p(`<b>The sum of the first ${V('n')} terms is ${M.sub(V('S'), V('n'))} = ${F(`${M.sub(V('a'), 1)}(1 − ${M.sup(V('r'), V('n'))})`, `1 − ${V('r')}`)}</b>. It comes from writing out ${M.sub(V('S'), V('n'))} and ${V('r')}${M.sub(V('S'), V('n'))} and subtracting: almost every term cancels.`) +
      p(`When |${V('r')}| &lt; 1 the terms shrink toward zero and ${M.sup(V('r'), V('n'))} vanishes, so the <b>infinite sum</b> is ${F(M.sub(V('a'), 1), `1 − ${V('r')}`)}. When |${V('r')}| ≥ 1 an infinite sum has no value.`) +
      example('Example', `${big('3 + 6 + 12 + … (8 terms)')}${V('r')} = 2, so ${M.sub(V('S'), 8)} = ${F('3(1 − 2<sup>8</sup>)', '1 − 2')} = ${F('3(−255)', '−1')} = <b>765</b>.`),
    make(rng) {
      const kind = rng.pick(['sum', 'sigma', 'infinite', 'infinite', 'savings']);
      if (kind === 'infinite') {
        const [rn, rd] = rng.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [-1, 2], [-1, 3], [1, 5], [2, 5]]);
        const a1 = rng.int(1, 12) * rd * rd;               // keeps the shown terms whole
        const [sn, sd] = M.simp(a1 * rd, rd - rn), terms = [a1, a1 * rn / rd, a1 * rn * rn / (rd * rd)];
        const shown = terms.map(N).join(' + ').replace(/\+ −/g, '− ');
        return { prompt: `Find the sum of the infinite geometric series.${big(`${shown} + …`)}`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, a1, r: rn / rd },
          hints: [`The ratio is ${V('r')} = ${N(terms[1])} ÷ ${N(a1)} = ${F(rn, rd)}. Since |${V('r')}| &lt; 1, the sum exists.`, `${V('S')} = ${F(M.sub(V('a'), 1), `1 − ${V('r')}`)} = ${F(N(a1), `1 − (${M.fracText(rn, rd)})`)} = ${F(N(a1), F(rd - rn, rd))}.`, `${V('S')} = <b>${M.fracText(sn, sd)}</b>.`] };
      }
      const r = rng.pick([2, 3, -2, -3, 2, 4]), n = rng.int(4, r === 4 || Math.abs(r) === 3 ? 6 : 9), a1 = rng.nz(-5, 6);
      const S = a1 * (1 - r ** n) / (1 - r);
      const work = [`Use ${M.sub(V('S'), n)} = ${F(`${pw(a1)}(1 − ${M.sup(pw(r), n)})`, `1 − ${pw(r)}`)}.`, `${M.sup(pw(r), n)} = ${N(r ** n)}, so ${M.sub(V('S'), n)} = ${F(`${pw(a1)}(${N(1 - r ** n)})`, N(1 - r))}.`, `The sum is <b>${N(S)}</b>.`];
      if (kind === 'sigma') {
        return { prompt: `Evaluate.${big(sigma(n, `${N(a1)} · ${M.sup(pw(r), `${V('k')} − 1`)}`))}`, type: 'number', answer: S, params: { kind, a1, r, n },
          hints: [`This is a geometric series with first term ${N(a1)} (at ${V('k')} = 1), ratio ${N(r)}, and ${n} terms.`].concat(work) };
      }
      if (kind === 'savings') {
        const name = rng.pick(NAMES), s1 = rng.pick([1, 2, 3, 5]), wk = rng.int(5, 10), tot = s1 * (2 ** wk - 1);
        return { prompt: `${name} saves ${M.money(s1)} in week 1 and doubles the amount saved each week after. How much has ${name} saved in total after ${wk} weeks?`, type: 'number', answer: tot, unit: '$', params: { kind, a1: s1, r: 2, n: wk },
          hints: [`The weekly amounts are geometric: ${M.money(s1)}, ${M.money(2 * s1)}, ${M.money(4 * s1)}, … with ${V('r')} = 2.`, `${M.sub(V('S'), wk)} = ${F(`${s1}(1 − ${M.sup(2, wk)})`, '1 − 2')} = ${s1}(${M.sup(2, wk)} − 1) = ${s1} × ${2 ** wk - 1}.`, `${name} has saved <b>${M.money(tot)}</b>.`] };
      }
      const shown = [a1, a1 * r, a1 * r * r].map(N).join(', ');
      return { prompt: `The geometric sequence ${shown}, … continues. Find the sum of its first ${n} terms.`, type: 'number', answer: S, params: { kind, a1, r, n },
        hints: [`The ratio is ${V('r')} = ${N(a1 * r)} ÷ ${pw(a1)} = ${N(r)}.`].concat(work) };
    },
    verify(q) {
      const P = q.params;
      let s = 0, t = P.a1;
      const terms = P.kind === 'infinite' ? 400 : P.n;
      for (let k = 0; k < terms; k++) { s += t; t *= P.r; }
      return close(s, q.answer, P.kind === 'infinite' ? 1e-6 : 1e-9);
    },
  });

  /* ---------- Unit 7: Statistics ---------- */
  const RULE_CDF = { '-3': 0.15, '-2': 2.5, '-1': 16, 0: 50, 1: 84, 2: 97.5, 3: 99.85 };      // percent below μ + kσ
  const SEG = [0.15, 2.35, 13.5, 34, 34, 13.5, 2.35, 0.15];                                 // below −3σ, …, above 3σ
  A.skill({
    id: 'int3.normal-distribution', title: 'The normal distribution and z-scores',
    learn: p(`A normal distribution is the symmetric bell curve, centered on the mean μ with spread σ. <b>The 68–95–99.7 rule:</b> about 68% of values lie within 1σ of the mean, 95% within 2σ, and 99.7% within 3σ.`) +
      p(`Halving those gives the pieces: 34% between μ and μ + σ, 13.5% between σ and 2σ, 2.35% between 2σ and 3σ, and 0.15% beyond 3σ, the same on each side. Add pieces to answer “what percent is between…” questions.`) +
      p(`<b>A z-score counts standard deviations from the mean: ${V('z')} = ${F(`${V('x')} − μ`, 'σ')}</b>. It lets you compare values from different distributions: the larger z is the more unusual (higher) result.`) +
      example('Example', `Heights have μ = 160 cm and σ = 8 cm. What percent are between 152 and 176?${big('152 = μ − σ, &nbsp; 176 = μ + 2σ')}34% + 34% + 13.5% = <b>81.5%</b>.`),
    make(rng) {
      const kind = rng.pick(['rule', 'rule', 'z', 'fromz', 'compare']);
      const ctx = rng.pick([{ what: 'adult heights', unit: 'cm', mu: [150, 180], sd: [5, 10] }, { what: 'scores on a test', unit: 'points', mu: [60, 80], sd: [4, 12] }, { what: 'apple weights', unit: 'g', mu: [140, 200], sd: [8, 20] }, { what: 'battery lifetimes', unit: 'hours', mu: [30, 60], sd: [2, 6] }]);
      const mu = rng.int(...ctx.mu), sd = rng.int(...ctx.sd) * (kind === 'z' ? 2 : 1);
      const intro = `${ctx.what.charAt(0).toUpperCase() + ctx.what.slice(1)} are normally distributed with mean ${mu} ${ctx.unit} and standard deviation ${sd} ${ctx.unit}.`;
      if (kind === 'rule') {
        const form = rng.pick(['between', 'between', 'above', 'below']);
        let k1, k2;
        if (form === 'between') { [k1, k2] = rng.sample([-3, -2, -1, 0, 1, 2, 3], 2).sort((x, y) => x - y); }
        else if (form === 'above') { k1 = rng.int(-2, 3); k2 = 4; } else { k1 = -4; k2 = rng.int(-3, 2); }
        const cdf = k => k <= -4 ? 0 : k >= 4 ? 100 : RULE_CDF[k];
        const ans = M.round(cdf(k2) - cdf(k1), 2);
        const at = k => mu + k * sd, zl = k => k === 0 ? 'μ' : `μ ${k > 0 ? '+' : '−'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}σ`;
        const ask = form === 'between' ? `between ${at(k1)} and ${at(k2)} ${ctx.unit}` : form === 'above' ? `above ${at(k1)} ${ctx.unit}` : `below ${at(k2)} ${ctx.unit}`;
        return { prompt: `${intro} Use the 68–95–99.7 rule: about what percent are ${ask}?`, type: 'number', answer: ans, unit: '%', params: { kind, k1, k2 },
          hints: [`Turn the values into standard deviations from the mean: ${form !== 'below' ? `${at(k1)} = ${zl(k1)}` : ''}${form === 'between' ? ' and ' : ''}${form !== 'above' ? `${at(k2)} = ${zl(k2)}` : ''}.`,
            `Add the pieces of the curve in that range: ${SEG.slice(k1 + 4, k2 + 4).map(s => N(s) + '%').join(' + ')}.`, `That is <b>${N(ans)}%</b>.`] };
      }
      if (kind === 'z' || kind === 'fromz') {
        const z = rng.pick([-2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3]), x = mu + z * sd;
        if (kind === 'z') return { prompt: `${intro} What is the z-score of a value of ${N(x)} ${ctx.unit}?`, type: 'number', answer: z, params: { kind, mu, sd, x },
          hints: [`${V('z')} = ${F(`${V('x')} − μ`, 'σ')} = ${F(`${N(x)} − ${mu}`, sd)}.`, `${N(x)} − ${mu} = ${N(x - mu)}, and ${N(x - mu)} ÷ ${sd} = ${N(z)}.`, `${V('z')} = <b>${N(z)}</b>.`] };
        return { prompt: `${intro} What value has a z-score of ${N(z)}?`, type: 'number', answer: x, unit: ctx.unit, params: { kind, mu, sd, z },
          hints: [`Solve ${V('z')} = ${F(`${V('x')} − μ`, 'σ')} for ${V('x')}: ${V('x')} = μ + ${V('z')}σ.`, `${V('x')} = ${mu} + ${pw(z)}(${sd}) = ${mu} ${M.signed(z * sd)}.`, `${V('x')} = <b>${N(x)}</b> ${ctx.unit}.`] };
      }
      const [n1, n2] = rng.sample(NAMES, 2);
      const m1 = rng.int(60, 80), s1 = rng.int(4, 10), m2 = rng.int(60, 80), s2 = rng.int(4, 10);
      let x1 = m1 + rng.int(2, 15), x2 = m2 + rng.int(2, 15);
      if (close((x1 - m1) / s1, (x2 - m2) / s2, 0.05)) x2 += 3;
      const z1 = (x1 - m1) / s1, z2 = (x2 - m2) / s2, answer = z1 > z2 ? n1 : n2;
      return { prompt: `${n1} scored ${x1} on a history test with mean ${m1} and standard deviation ${s1}. ${n2} scored ${x2} on a science test with mean ${m2} and standard deviation ${s2}. Who did better compared with their class?`, type: 'choice', choices: [n1, n2, 'They did equally well'], answer, params: { kind, x1, m1, s1, x2, m2, s2, n1, n2 },
        hints: [`Compare z-scores, not raw scores. ${n1}: ${F(`${x1} − ${m1}`, s1)} ≈ ${N(r2(z1))}.`, `${n2}: ${F(`${x2} − ${m2}`, s2)} ≈ ${N(r2(z2))}.`, `The larger z-score belongs to <b>${answer}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'rule') return close(SEG.slice(P.k1 + 4, P.k2 + 4).reduce((s, x) => s + x, 0), q.answer, 1e-9);
      if (P.kind === 'z') return close(P.mu + q.answer * P.sd, P.x);
      if (P.kind === 'fromz') return close((q.answer - P.mu) / P.sd, P.z);
      return q.answer === ((P.x1 - P.m1) * P.s2 > (P.x2 - P.m2) * P.s1 ? P.n1 : P.n2);
    },
  });

  const METHODS = ['Simple random sample', 'Stratified sample', 'Cluster sample', 'Systematic sample', 'Convenience sample'];
  A.skill({
    id: 'int3.margin-of-error', title: 'Sampling and margin of error',
    learn: p(`How a sample is chosen matters. In a <b>simple random sample</b> every group of the same size is equally likely. A <b>stratified</b> sample splits the population into groups and picks randomly from each; a <b>cluster</b> sample picks whole groups at random; a <b>systematic</b> sample takes every ${V('k')}th member of a list; a <b>convenience</b> sample takes whoever is easy to reach, and is usually biased.`) +
      p(`A sample proportion ${V('p̂')} only estimates the true proportion. <b>For 95% confidence, the margin of error is about ${V('z')}* ${M.sqrt(F(`${V('p̂')}(1 − ${V('p̂')})`, V('n')))} with ${V('z')}* = 1.96</b>. The interval ${V('p̂')} ± margin is likely to contain the truth. Bigger samples give smaller margins; four times the sample halves the margin.`) +
      example('Example', `In a sample of 400, 55% said yes.${big(`1.96 × ${M.sqrt(F('0.55 × 0.45', 400))} ≈ 0.049`)}The margin of error is about <b>4.9 percentage points</b>, so the interval is 50.1% to 59.9%.`),
    make(rng) {
      const kind = rng.pick(['moe', 'moe', 'interval', 'method', 'method']);
      const name = rng.pick(NAMES);
      if (kind === 'method') {
        const m = rng.int(0, 4), k = rng.int(3, 12), total = rng.int(20, 60) * 10;
        const what = rng.pick(['students at a school', 'members of a sports club', 'people who live in a town']);
        const desc = [
          `puts the names of all ${total} ${what} in a computer and has it choose ${k * 5} at random`,
          `splits the ${what} into age groups and chooses ${k} people at random from each group`,
          `divides the ${what} into ${k * 4} similar teams, picks ${Math.max(2, Math.round(k / 3))} teams at random, and surveys everyone on them`,
          `lists all ${total} ${what} alphabetically, picks a random start, and then surveys every ${M.ordinal(k)} person`,
          `surveys the first ${k * 5} of the ${what} who walk past ${name.endsWith('s') ? name + '’' : name + '’s'} table`,
        ][m];
        return { prompt: `${name} wants to survey the ${what}. ${name} ${desc}. What kind of sample is this?`, type: 'choice', choices: METHODS.slice(), answer: METHODS[m], params: { kind, m },
          hints: [`Ask how the people were chosen: by chance from everyone, by chance within groups, whole groups at once, by position in a list, or by who was easy to reach.`, ['Everyone had the same chance, and any group of that size could be chosen.', 'The population was split into groups and every group is represented.', 'Whole groups were chosen, and everyone in them was surveyed.', 'People were taken at a fixed spacing down a list.', 'Only people who happened to be nearby were asked.'][m], `It is a <b>${METHODS[m].toLowerCase()}</b>.`] };
      }
      const n = rng.pick([100, 200, 250, 400, 500, 600, 800, 1000, 1200, 1500, 2000]), ph = rng.int(25, 75);
      const moe = 1.96 * Math.sqrt(ph / 100 * (1 - ph / 100) / n) * 100;
      if (kind === 'moe') {
        const ans = r1(moe);
        return { prompt: `In a random sample of ${N(n)} voters, ${ph}% support a new park. Find the margin of error for 95% confidence, using ${V('z')}* = 1.96. Give it in percentage points, rounded to the nearest tenth.`, type: 'number', answer: ans, unit: '%', tolerance: 0.05, params: { kind, n, ph },
          hints: [`Use ${V('p̂')} = ${N(ph / 100)} and ${V('n')} = ${N(n)}: margin = 1.96 ${M.sqrt(F(`${N(ph / 100)} × ${N(1 - ph / 100)}`, N(n)))}.`, `${N(ph / 100)} × ${N(M.round(1 - ph / 100, 2))} ÷ ${N(n)} ≈ ${N(M.round(ph / 100 * (1 - ph / 100) / n, 7))}; its square root is ≈ ${N(M.round(Math.sqrt(ph / 100 * (1 - ph / 100) / n), 5))}.`, `Times 1.96 is ≈ ${N(M.round(moe / 100, 4))}, which is <b>${N(ans)} percentage points</b>.`] };
      }
      const me = rng.pick([2, 2.5, 3, 3.5, 4, 4.5, 5]), upper = rng.bool();
      const ans = M.round(ph + (upper ? me : -me), 1);
      return { prompt: `A poll reports that ${ph}% of residents want later library hours, with a margin of error of ${N(me)} percentage points. What is the ${upper ? 'upper' : 'lower'} end of the confidence interval?`, type: 'number', answer: ans, unit: '%', params: { kind, ph, me, upper },
        hints: [`The interval is the estimate plus or minus the margin: ${ph}% ± ${N(me)}%.`, `${upper ? 'Add' : 'Subtract'}: ${ph} ${upper ? '+' : '−'} ${N(me)} = ${N(ans)}.`, `The ${upper ? 'upper' : 'lower'} end is <b>${N(ans)}%</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'method') return q.answer === METHODS[P.m];
      if (P.kind === 'moe') { const se = Math.pow(P.ph * (100 - P.ph) / P.n, 0.5); return Math.abs(1.96 * se - q.answer) <= 0.05 + 1e-9; }    // in percent units directly
      const lo = P.ph - P.me, hi = P.ph + P.me;
      return close(q.answer, P.upper ? hi : lo);
    },
  });

  /* ---------- Unit 8: 3D geometry ---------- */
  const SHAPES = ['circle', 'ellipse', 'square', 'rectangle', 'triangle', 'trapezoid'];
  const SOLIDS = { cube: { base: 'square', side: 'square' }, box: { base: 'rectangle', side: 'rectangle' }, cylinder: { base: 'circle', side: 'rectangle', round: true }, cone: { base: 'circle', side: 'triangle', round: true }, pyramid: { base: 'square', side: 'triangle' }, tprism: { base: 'triangle', side: 'rectangle' }, sphere: { base: 'circle', side: 'circle', round: true } };
  const SOLID_NAME = { cube: 'a cube', box: 'a rectangular box that is not a cube', cylinder: 'a cylinder', cone: 'a cone', pyramid: 'a square pyramid', tprism: 'a triangular prism', sphere: 'a sphere' };
  const CUT_TEXT = { base: 'parallel to its base', side: 'perpendicular to its base, through its center', tilt: 'at a slant, without touching the base' };
  const SPINS = [['a rectangle', 'one of its sides', 'cylinder'], ['a right triangle', 'one of its legs', 'cone'], ['a semicircle', 'its diameter', 'sphere'], ['a right trapezoid', 'its side that is perpendicular to both bases', 'frustum (a cone with its top cut off)']];
  A.skill({
    id: 'int3.cross-sections', title: 'Cross-sections and solids of revolution',
    learn: p('A <b>cross-section</b> is the flat shape you see when a plane slices through a solid. <b>A slice parallel to the base of a prism, cylinder, pyramid or cone has the same shape as the base</b> (smaller, for a pyramid or cone). A slice straight down through the center shows the solid’s side profile: a rectangle for a prism or cylinder, a triangle for a pyramid or cone.') +
      p('Every slice of a sphere is a circle. A slanted slice through a cylinder or cone that misses the base is an <b>ellipse</b>.') +
      p('Spinning a flat shape around a line sweeps out a <b>solid of revolution</b>: a rectangle spun about one side makes a cylinder, a right triangle spun about a leg makes a cone, and a semicircle spun about its diameter makes a sphere.') +
      example('Example', 'A cone is sliced straight down through its tip and the center of its base. The slice cuts the base along a diameter and meets the tip, so it is a <b>triangle</b>.'),
    make(rng) {
      if (rng.chance(0.3)) {
        const [shape, axis, solid] = rng.pick(SPINS);
        const pool = ['cylinder', 'cone', 'sphere', 'frustum (a cone with its top cut off)', 'pyramid', 'prism'];
        const choices = options(solid, rng.shuffle(pool.filter(s => s !== solid)));
        return { prompt: `${shape.charAt(0).toUpperCase() + shape.slice(1)} is spun all the way around ${axis}. What solid does it sweep out?`, type: 'choice', choices, answer: solid, params: { spin: shape },
          hints: ['Picture the shape turning around the line, like a door on a hinge. Each point traces a circle around the line.', `The edge that is not on the line sweeps out the curved surface, and the result is a <b>${solid}</b>.`] };
      }
      const solid = rng.pick(Object.keys(SOLIDS)), S = SOLIDS[solid];
      const cuts = solid === 'sphere' ? ['base'] : S.round ? ['base', 'side', 'tilt'] : ['base', 'side'];
      const cut = rng.pick(cuts);
      const answer = cut === 'tilt' ? 'ellipse' : S[cut];
      const choices = options(answer, rng.shuffle(SHAPES.filter(s => s !== answer)));
      const how = solid === 'sphere' ? rng.pick(['by any flat plane', 'by a plane that misses its center', 'by a plane through its center']) : CUT_TEXT[cut];
      return { prompt: `${SOLID_NAME[solid].charAt(0).toUpperCase() + SOLID_NAME[solid].slice(1)} is sliced ${how}. What is the shape of the cross-section?`, type: 'choice', choices, answer, params: { solid, cut },
        hints: [cut === 'base' ? 'A slice parallel to the base copies the shape of the base.' : cut === 'side' ? 'A slice straight down through the center shows the side profile of the solid.' : 'A slanted slice through a round solid stretches the circle in one direction.',
          `So the cross-section is ${answer === 'ellipse' ? 'an' : 'a'} <b>${answer}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.spin) return { 'a rectangle': 'cylinder', 'a right triangle': 'cone', 'a semicircle': 'sphere', 'a right trapezoid': 'frustum (a cone with its top cut off)' }[P.spin] === q.answer;
      // a second description: what the solid looks like from above (base) and from the side (profile)
      const top = { cube: 'square', box: 'rectangle', cylinder: 'circle', cone: 'circle', pyramid: 'square', tprism: 'triangle', sphere: 'circle' }[P.solid];
      const front = { cube: 'square', box: 'rectangle', cylinder: 'rectangle', cone: 'triangle', pyramid: 'triangle', tprism: 'rectangle', sphere: 'circle' }[P.solid];
      return q.answer === (P.cut === 'tilt' ? 'ellipse' : P.cut === 'base' ? top : front);
    },
  });

  A.skill({
    id: 'int3.volume-cavalieri', title: 'Volume and Cavalieri’s principle',
    learn: p(`<b>Cavalieri’s principle:</b> if two solids have the same height and every horizontal slice of one has the same area as the matching slice of the other, the solids have the same volume. That is why a slanted (oblique) stack of coins has the same volume as a straight one, and why an oblique cylinder still has volume π${M.sup(V('r'), 2)}${V('h')}, with ${V('h')} the <b>perpendicular</b> height, not the slant length.`) +
      p(`<b>Prism or cylinder: ${V('V')} = ${V('Bh')}</b> (base area times height). <b>Pyramid or cone: ${V('V')} = ${F(1, 3)}${V('Bh')}</b>. <b>Sphere: ${V('V')} = ${F(4, 3)}π${M.sup(V('r'), 3)}</b>.`) +
      example('Example', `A cone has radius 3 cm and height 10 cm.${big(`${V('V')} = ${F(1, 3)} × π × 3² × 10 = 30π`)}≈ <b>94.2 cm³</b>.`),
    make(rng) {
      const kind = rng.pick(['cylinder', 'cone', 'sphere', 'pyramid', 'oblique', 'coins']);
      if (kind === 'coins') {
        const [n1, n2] = rng.sample(NAMES, 2), k = rng.int(10, 40);
        const opts = ['They have the same volume.', `${n1}’s stack has more volume.`, `${n2}’s stack has more volume.`];
        return { prompt: `${n1} and ${n2} each stack ${k} identical coins. ${n1}’s stack is perfectly straight; ${n2}’s leans to one side. How do the volumes compare?`, type: 'choice', choices: opts, answer: opts[0], params: { kind, k },
          hints: ['Compare the stacks slice by slice: at every height, each slice is one whole coin.', 'Same height and the same slice areas at every level, so Cavalieri’s principle applies.', `<b>They have the same volume.</b>`] };
      }
      const r = rng.int(2, 12), h = rng.int(3, 20);
      let ans, what, hints;
      if (kind === 'cylinder' || kind === 'oblique') {
        ans = r1(Math.PI * r * r * h);
        const slant = r1(Math.sqrt(h * h + rng.int(2, 8) ** 2));
        what = kind === 'cylinder' ? `a cylinder with radius ${r} cm and height ${h} cm` : `an oblique cylinder with radius ${r} cm. Its perpendicular height is ${h} cm and its slanted side is ${N(slant)} cm long`;
        hints = [kind === 'oblique' ? `By Cavalieri’s principle an oblique cylinder has the same volume as a straight one with the same perpendicular height. Ignore the slant length.` : `Use ${V('V')} = π${M.sup(V('r'), 2)}${V('h')}.`, `${V('V')} = π × ${r}² × ${h} = ${r * r * h}π.`, `${r * r * h}π ≈ <b>${N(ans)} cm³</b>.`];
      } else if (kind === 'cone') {
        ans = r1(Math.PI * r * r * h / 3);
        what = `a cone with radius ${r} cm and height ${h} cm`;
        hints = [`Use ${V('V')} = ${F(1, 3)}π${M.sup(V('r'), 2)}${V('h')}.`, `${V('V')} = ${F(1, 3)} × π × ${r}² × ${h} = ${F(r * r * h, 3)}π.`, `≈ <b>${N(ans)} cm³</b>.`];
      } else if (kind === 'sphere') {
        ans = r1(4 / 3 * Math.PI * r ** 3);
        what = `a sphere with radius ${r} cm`;
        hints = [`Use ${V('V')} = ${F(4, 3)}π${M.sup(V('r'), 3)}.`, `${r}³ = ${r ** 3}, so ${V('V')} = ${F(4 * r ** 3, 3)}π.`, `≈ <b>${N(ans)} cm³</b>.`];
      } else {
        ans = r1(r * r * h / 3);
        what = `a pyramid with a square base ${r} cm on each side and height ${h} cm`;
        hints = [`Use ${V('V')} = ${F(1, 3)}${V('Bh')}, where ${V('B')} is the base area.`, `${V('B')} = ${r}² = ${r * r} cm², so ${V('V')} = ${F(1, 3)} × ${r * r} × ${h}.`, `${V('V')} ≈ <b>${N(ans)} cm³</b>.`];
      }
      return { prompt: `Find the volume of ${what}. Round to the nearest tenth.`, type: 'number', answer: ans, unit: 'cm³', tolerance: Math.max(0.05, M.round(ans * 0.004, 2)), params: { kind, r, h },
        hints };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'coins') return q.answer.startsWith('They have the same');
      // Cavalieri in action: add up thin horizontal slices
      const { r, h } = P, n = 4000;
      let area, lo = 0, hi = h;
      if (P.kind === 'cylinder' || P.kind === 'oblique') area = () => Math.PI * r * r;
      else if (P.kind === 'cone') area = y => Math.PI * Math.pow(r * (1 - y / h), 2);
      else if (P.kind === 'pyramid') area = y => Math.pow(r * (1 - y / h), 2);
      else { area = y => Math.PI * (r * r - y * y); lo = -r; hi = r; }
      let v = 0; const dy = (hi - lo) / n; for (let i = 0; i < n; i++) v += area(lo + (i + 0.5) * dy) * dy;
      return Math.abs(v - q.answer) <= 0.05 + 1e-6 * v;
    },
  });

  /* ---------- Unit 9: Modeling with functions ---------- */
  const between = (lo, hi) => `${N(lo)} &lt; ${X} &lt; ${N(hi)}`;
  /** c·x(a − bx) as text: "x(20 − x)", "½x(30 − x)", "2x(40 − 2x)" */
  const cxForm = ([c, a, b]) => `${c === 1 ? '' : c === 0.5 ? '½' : N(c)}${X}(${N(a)} − ${b === 1 ? '' : N(b)}${X})`;
  A.skill({
    id: 'int3.area-models', title: 'Area as a function: domain and maximum',
    learn: p(`When a shape changes, its area often depends on one length. <b>Name that length ${X}, write every other length in terms of ${X}, then multiply to get the area function ${V('A')}(${X}).</b> A rectangle with a perimeter of 40 m and width ${X} has length 20 − ${X}, so ${V('A')}(${X}) = ${X}(20 − ${X}).`) +
      p(`<b>The domain is the set of ${X}-values that make every length positive.</b> Here ${X} &gt; 0 and 20 − ${X} &gt; 0, so the domain is 0 &lt; ${X} &lt; 20.`) +
      p(`Area functions like this are downward parabolas that are zero at both ends of the domain. <b>The maximum is at the vertex, halfway between the two zeros.</b> Substitute that ${X} to find the largest area.`) +
      example('Example', `A pen is built against a wall, with 60 m of fence for the other three sides. The two sides that meet the wall are ${X} m each, so the side parallel to the wall is 60 − 2${X}.${big(`${V('A')}(${X}) = ${X}(60 − 2${X}), &nbsp; 0 &lt; ${X} &lt; 30`)}The zeros are 0 and 30, so the vertex is at ${X} = 15. The largest area is 15 × 30 = <b>450 m²</b>.`),
    make(rng) {
      const shape = rng.pick(['rect', 'wall', 'tri']), ask = rng.pick(['max', 'max', 'best', 'domain', 'rule']);
      const m = rng.int(4, 24), name = rng.pick(NAMES);
      let total, form, wrong, setup, other, unit;
      if (shape === 'rect') {
        total = 4 * m; form = [1, 2 * m, 1]; unit = 'm';
        setup = `${name} marks out a rectangular garden with a perimeter of ${total} m. Its width is ${X} m.`; other = ['the length', `${N(2 * m)} − ${X}`];
        wrong = [[1, total, 1], [1, 2 * m, 2], [2, 2 * m, 1]];
      } else if (shape === 'wall') {
        total = 4 * m; form = [1, total, 2]; unit = 'm';
        setup = `${name} builds a rectangular pen against a long wall, using ${total} m of fence for the other three sides. The two sides that meet the wall are ${X} m long each.`; other = ['the side parallel to the wall', `${N(total)} − 2${X}`];
        wrong = [[1, total, 1], [2, total, 2], [1, 2 * m, 1]];
      } else {
        total = 2 * m; form = [0.5, total, 1]; unit = 'cm';
        setup = `The two legs of a right triangle add up to ${total} cm. One leg is ${X} cm long.`; other = ['the other leg', `${N(total)} − ${X}`];
        wrong = [[1, total, 1], [0.5, total, 2], [0.5, 2 * total, 1]];
      }
      const zero = form[1] / form[2], xs = zero / 2, best = form[0] * xs * (form[1] - form[2] * xs);
      const rule = `${V('A')}(${X}) = ${cxForm(form)}`;
      const h1 = `Write the other length in terms of ${X}: ${other[0]} is ${other[1]}. So ${rule}.`;
      const params = { shape, total, ask };
      if (ask === 'rule') {
        const all = [form].concat(wrong);
        params.forms = all; params.texts = all.map(cxForm);
        return { prompt: `${setup} Which function gives the area?`, type: 'choice', choices: options(cxForm(form), wrong.map(cxForm)), answer: cxForm(form), params,
          hints: [`Write the other length in terms of ${X}: ${other[0]} is ${other[1]}.`, shape === 'tri' ? `The area of a triangle is ½ × leg × leg.` : `The area of a rectangle is length × width.`, `So ${V('A')}(${X}) = <b>${cxForm(form)}</b>.`] };
      }
      if (ask === 'domain') {
        const answer = between(0, zero);
        return { prompt: `${setup} The area is ${rule}. What is the domain of this function in the situation?`, type: 'choice', choices: options(answer, [between(0, 2 * zero), between(0, xs), `${X} &gt; 0`]), answer, params,
          hints: [`Every length must be positive. The ${X}-length gives ${X} &gt; 0.`, `Also ${other[0]}, ${other[1]}, must be positive, which is true only while ${X} &lt; ${N(zero)}.`, `The domain is <b>${answer}</b>.`] };
      }
      const hv = `The area is zero at ${X} = 0 and at ${X} = ${N(zero)}. The vertex of the parabola is halfway between: ${X} = ${N(xs)}.`;
      if (ask === 'best') return { prompt: `${setup} What value of ${X} gives the largest possible area?`, type: 'number', answer: xs, unit, params,
        hints: [h1, hv, `The largest area comes at ${X} = <b>${N(xs)}</b> ${unit}.`] };
      return { prompt: `${setup} What is the largest possible area?`, type: 'number', answer: best, unit: unit + '²', params,
        hints: [h1, hv, `${V('A')}(${N(xs)}) = ${cxForm(form).replace(new RegExp(X.replace(/[()]/g, '\\$&'), 'g'), `(${N(xs)})`)} = <b>${N(best)} ${unit}²</b>.`] };
    },
    verify(q) {
      const P = q.params;
      // the area straight from the lengths in the story
      const area = x => P.shape === 'rect' ? x * (P.total - 2 * x) / 2 : P.shape === 'wall' ? x * (P.total - 2 * x) : x * (P.total - x) / 2;
      let hi = 0; while (area(hi + 0.5) > 0) hi += 0.5;
      const top = hi + 0.5;                                   // the first half-step where the area stops being positive
      if (P.ask === 'domain') return q.answer === between(0, top) && area(top) === 0;
      if (P.ask === 'rule') {
        const ok = P.forms.map(([c, a, b]) => [0.7, 2.3, 5.1].every(x => close(c * x * (a - b * x), area(x))));
        return ok.filter(Boolean).length === 1 && P.texts[ok.indexOf(true)] === q.answer;
      }
      let bx = 0, bA = -1; for (let x = 0; x <= top; x += 0.01) { const a = area(x); if (a > bA + 1e-9) { bA = a; bx = x; } }
      return P.ask === 'best' ? close(bx, q.answer, 0.006) : close(bA, q.answer, 1e-6);
    },
  });

  /** x^h (L − kl·x)(W − kw·x) as text */
  const boxForm = (L, W, [h, kl, kw]) => `${h ? X : ''}(${N(L)} − ${kl === 1 ? '' : N(kl)}${X})(${N(W)} − ${kw === 1 ? '' : N(kw)}${X})`;
  A.skill({
    id: 'int3.box-volume', title: 'Volume of an open box',
    learn: p(`An open box can be folded from a flat sheet by cutting a square of side ${X} from each corner and folding up the flaps. <b>Each pair of cuts takes ${X} off both ends of the length and of the width, and the flaps become the height ${X}.</b>`) +
      p(`For a sheet ${V('L')} by ${V('W')}, <b>${V('V')}(${X}) = ${X}(${V('L')} − 2${X})(${V('W')} − 2${X})</b>. Every length must be positive, so the domain is 0 &lt; ${X} &lt; ${F(V('W'), 2)}, where ${V('W')} is the shorter side.`) +
      p(`To find the best cut, make a table of ${V('V')}(${X}) or read the highest point of the graph. A tiny cut gives a flat box and a big cut gives a thin tower; the most volume is in between.`) +
      example('Example', `A sheet is 20 cm by 12 cm, and the cut is ${X} = 2 cm.${big(`${V('V')}(2) = 2(20 − 4)(12 − 4) = 2 × 16 × 8`)}The volume is <b>256 cm³</b>, and the domain is 0 &lt; ${X} &lt; 6.`),
    make(rng) {
      const ask = rng.pick(['eval', 'eval', 'domain', 'rule', 'best']), unit = rng.pick(['cm', 'in']);
      const W = rng.int(8, ask === 'best' ? 16 : 24), L = rng.int(W + 2, ask === 'best' ? 30 : 40), name = rng.pick(NAMES);
      const setup = `${name} makes an open box from a sheet of card ${L} ${unit} by ${W} ${unit}, cutting a square of side ${X} ${unit} from each corner and folding up the sides.`;
      const rule = `${V('V')}(${X}) = ${boxForm(L, W, [1, 2, 2])}`;
      const params = { ask, L, W };
      if (ask === 'eval') {
        const x = rng.int(2, W - 1) / 2, l = L - 2 * x, w = W - 2 * x, vol = x * l * w;
        params.x = x;
        return { prompt: `${setup} What is the volume of the box when ${X} = ${N(x)}?`, type: 'number', answer: vol, unit: unit + '³', params,
          hints: [`The box is ${L} − 2(${N(x)}) = ${N(l)} long, ${W} − 2(${N(x)}) = ${N(w)} wide and ${N(x)} tall.`, `${V('V')} = ${N(x)} × ${N(l)} × ${N(w)}.`, `The volume is <b>${N(vol)} ${unit}³</b>.`] };
      }
      if (ask === 'domain') {
        const answer = between(0, W / 2);
        return { prompt: `${setup} The volume is ${rule}. What is the domain of this function in the situation?`, type: 'choice', choices: options(answer, [between(0, L / 2), between(0, W), between(0, L)]), answer, params,
          hints: [`The height ${X} must be positive, and so must the length ${L} − 2${X} and the width ${W} − 2${X}.`, `The width runs out first: ${W} − 2${X} &gt; 0 means ${X} &lt; ${N(W / 2)}.`, `The domain is <b>${answer}</b>.`] };
      }
      if (ask === 'rule') {
        const forms = [[1, 2, 2], [1, 1, 1], [0, 2, 2], [1, 2, 1]];
        params.forms = forms; params.texts = forms.map(f => boxForm(L, W, f));
        const answer = params.texts[0];
        return { prompt: `${setup} Which function gives the volume of the box?`, type: 'choice', choices: options(answer, params.texts.slice(1)), answer, params,
          hints: [`A square is cut from both ends of each side, so the length shrinks by 2${X} to ${L} − 2${X}, and the width to ${W} − 2${X}.`, `The folded flaps make the height ${X}. Volume = height × length × width.`, `<b>${rule}</b>.`] };
      }
      const xs = []; for (let x = 1; 2 * x < W; x++) xs.push(x);
      const vols = xs.map(x => x * (L - 2 * x) * (W - 2 * x)), top = Math.max(...vols), bx = xs[vols.indexOf(top)];
      if (vols.filter(v => v === top).length > 1) return this.make(rng);
      return { prompt: `${setup} The cut must be a whole number of ${unit === 'cm' ? 'centimeters' : 'inches'}. Which cut gives the box with the greatest volume?`, type: 'number', answer: bx, unit, params,
        hints: [`Use ${rule}, for every whole-number cut from 1 up to ${xs[xs.length - 1]}.`, `${xs.map((x, i) => `${V('V')}(${x}) = ${N(vols[i])}`).join(', ')}.`, `The greatest volume is ${N(top)} ${unit}³, at ${X} = <b>${bx}</b>.`] };
    },
    verify(q) {
      const P = q.params, cubic = x => peval([4, -2 * (P.L + P.W), P.L * P.W, 0], x);   // the expanded volume
      if (P.ask === 'eval') return close(cubic(P.x), q.answer);
      if (P.ask === 'domain') { let hi = 0; while ([hi + 0.5, P.L - 2 * hi - 1, P.W - 2 * hi - 1].every(v => v > 0)) hi += 0.5; return q.answer === between(0, hi + 0.5); }
      if (P.ask === 'rule') {
        const ok = P.forms.map(([h, kl, kw]) => [0.6, 1.7, 3.2].every(x => close((h ? x : 1) * (P.L - kl * x) * (P.W - kw * x), cubic(x))));
        return ok.filter(Boolean).length === 1 && P.texts[ok.indexOf(true)] === q.answer;
      }
      // the true peak of the cubic, from V′(x) = 12x² − 4(L + W)x + LW = 0, then the better whole number beside it
      const peak = ((P.L + P.W) - Math.sqrt(P.L * P.L - P.L * P.W + P.W * P.W)) / 6;
      const lo = Math.max(1, Math.floor(peak)), hi2 = Math.min(Math.ceil(peak), Math.ceil(P.W / 2) - 1);
      return q.answer === (cubic(hi2) > cubic(lo) ? hi2 : lo);
    },
  });

  /* ---------- Unit 10: Surveys, studies and data ---------- */
  /** each topic: a fairly worded question, two that push toward an answer, and one that asks two things at once */
  const SURVEY_TOPICS = [
    { fair: 'Would you like the cafeteria to add more choices to the lunch menu, or keep the menu as it is?',
      lead: ['Don’t you agree that the cafeteria’s boring lunch menu needs more choices?', 'Most students want more lunch choices. Do you want more choices too?'],
      two: 'Should the cafeteria add more lunch choices and make the lunch period longer?' },
    { fair: 'Do you support or oppose building a skate park in Elm Park?',
      lead: ['Wouldn’t a skate park be a great way to keep teenagers healthy and active?', 'Should the town spend money on a noisy, dangerous skate park?'],
      two: 'Do you support building a skate park and a new swimming pool in Elm Park?' },
    { fair: 'Should the school day start at 8:00 a.m. or at 8:45 a.m.?',
      lead: ['Doctors say teenagers need more sleep. Shouldn’t school start later?', 'Wouldn’t starting school later just make students lazy?'],
      two: 'Should school start later in the morning and have a shorter lunch break?' },
    { fair: 'Should students be allowed to use their phones at lunch, yes or no?',
      lead: ['Should students be allowed to waste their whole lunch break staring at phones?', 'Since phones help students relax, shouldn’t they be allowed at lunch?'],
      two: 'Should students be allowed to use phones at lunch and listen to music in class?' },
    { fair: 'Do you support or oppose a rule that students wear school uniforms?',
      lead: ['Don’t you agree that uniforms would stop students teasing each other about clothes?', 'Should students be forced to wear ugly, uncomfortable uniforms every day?'],
      two: 'Should the school make students wear uniforms and ban hats?' },
    { fair: 'Should the town library stay open later on weekdays, or keep its current hours?',
      lead: ['Shouldn’t hard-working students be able to use the library in the evening?', 'The library is already open plenty of hours. Does it really need to stay open later?'],
      two: 'Should the library stay open later and stop charging late fees?' },
    { fair: 'Would you rather the class trip go to the science museum or to the aquarium?',
      lead: ['Would you rather go to the exciting aquarium or the dusty old science museum?', 'Teachers say the science museum is far more educational. Where should the class trip go?'],
      two: 'Should the class trip go to the aquarium and stay overnight in a hotel?' },
    { fair: 'Do you support or oppose adding bike lanes to Main Street?',
      lead: ['Do you support adding bike lanes to make Main Street safe for our children?', 'Do you support getting rid of parking spaces on Main Street to make room for bike lanes?'],
      two: 'Do you support adding bike lanes and lowering the speed limit on Main Street?' },
  ];
  const SURVEY_FAULTS = { lead: 'It pushes people toward one answer.', two: 'It asks about two different things at once.', fair: 'Nothing: it is worded fairly.', hard: 'It uses words most people would not understand.' };
  A.skill({
    id: 'int3.survey-questions', title: 'Biased and leading survey questions',
    learn: p('The way a survey question is worded can change the answers people give. <b>A fair question is neutral: it does not hint at which answer is “right”, and it asks about one thing only.</b>') +
      p('Watch for two common faults. A <b>leading</b> question pushes people toward an answer, with loaded words (“boring”, “waste”, “dangerous”), a reason for one side only, or a claim about what most people or experts think. A <b>double-barreled</b> question asks about two things at once, so someone who likes one part and not the other cannot answer honestly.') +
      p('To fix a question, remove the opinion words and give both sides equal weight: “Do you support or oppose …?” or “Would you rather A or B?”.') +
      example('Example', `${big('“Don’t you agree that the noisy new gym is a waste of money?”')}The words “Don’t you agree”, “noisy” and “waste” all push toward no, so this is <b>a leading question</b>. A fair version: “Do you support or oppose building the new gym?”`),
    make(rng) {
      const t = rng.int(0, SURVEY_TOPICS.length - 1), T = SURVEY_TOPICS[t];
      if (rng.bool()) {
        const answer = T.fair;
        return { prompt: 'A student council is writing a survey. Which question is worded most fairly?', type: 'choice', choices: [T.fair, T.lead[0], T.lead[1], T.two], answer, params: { kind: 'pick', t },
          hints: ['Look for opinion words, or a reason given for one side only: those push people toward an answer.', 'Also look for a question that asks about two things at once; it cannot be answered with one honest yes or no.', `The neutral one asks about one thing and favors neither answer: <b>“${answer}”</b>`] };
      }
      const variant = rng.pick(['fair', 'lead0', 'lead1', 'two']), text = variant === 'fair' ? T.fair : variant === 'two' ? T.two : T.lead[Number(variant.slice(4))];
      const fault = variant.startsWith('lead') ? 'lead' : variant, answer = SURVEY_FAULTS[fault];
      const why = { lead: 'The wording favors one answer: it uses loaded words, gives a reason for only one side, or says what others think.', two: 'It joins two separate proposals with “and”, so a person who wants one but not the other cannot answer.', fair: 'It names both options evenly, uses no opinion words, and asks about one thing only.' }[fault];
      return { prompt: `What, if anything, is wrong with this survey question?${big(`“${text}”`)}`, type: 'choice', choices: [SURVEY_FAULTS.lead, SURVEY_FAULTS.two, SURVEY_FAULTS.fair, SURVEY_FAULTS.hard], answer, params: { kind: 'fault', t, variant },
        hints: ['Check two things: does the wording hint at an answer, and does it ask about more than one thing?', why, `<b>${answer}</b>`] };
    },
    verify(q) {
      const P = q.params, T = SURVEY_TOPICS[P.t];
      if (P.kind === 'pick') return q.answer === T.fair && q.choices.length === 4;
      const text = P.variant === 'fair' ? T.fair : P.variant === 'two' ? T.two : T.lead[Number(P.variant.slice(4))];
      if (!q.prompt.includes(text)) return 'the question shown is not the one classified';
      // a second reading: the fair version is the only one with no loaded phrasing, and the two-part version is the one built with “and”
      const fault = text === T.fair ? 'fair' : text === T.two ? 'two' : T.lead.includes(text) ? 'lead' : null;
      return q.answer === SURVEY_FAULTS[fault];
    },
  });

  const STUDY_KINDS = ['Survey', 'Observational study', 'Experiment'];
  const STUDY_CASES = {
    Survey: [
      'A town council mails a questionnaire to 500 randomly chosen households, asking whether they would use a new bus route.',
      'A newspaper phones 1,000 adults chosen at random and asks which candidate they plan to vote for.',
      'The student council asks 120 students to rate the cafeteria food on a scale from 1 to 5.',
      'A sports club emails all of its members to ask which day of the week they would prefer for practice.',
    ],
    'Observational study': [
      'Researchers look through the medical records of 3,000 adults and compare the blood pressure of people who drink coffee with that of people who do not.',
      'A scientist watches a busy crossroads for a week and records how many drivers come to a full stop at the stop sign.',
      'Researchers compare the test scores of students who chose to take music lessons with the scores of students who did not.',
      'A biologist counts the birds visiting feeders in 40 gardens, noting which gardens have a pet cat.',
    ],
    Experiment: [
      'Researchers randomly split 60 volunteers into two groups. One group chews gum during a memory test and the other does not.',
      'A gardener randomly chooses 20 of her 40 tomato plants to get a new fertilizer, gives the other 20 plain water, and compares their heights after six weeks.',
      'A coach randomly assigns 30 runners to either a new warm-up routine or the usual one, then times them over 400 m.',
      'A teacher randomly assigns half of a class to study with flash cards and the other half to reread their notes, then gives everyone the same quiz.',
    ],
  };
  /** experiments with their parts named */
  const EXPERIMENTS = [
    { setup: 'Researchers randomly split 60 volunteers into two groups of 30. One group chews gum during a memory test and the other group does not. They count how many words each person remembers.',
      treat: 'The 30 volunteers who chew gum', ctrl: 'The 30 volunteers who do not chew gum', all: 'All 60 volunteers together', resp: 'How many words each person remembers', factor: 'Whether or not a person chews gum', size: 'The number of volunteers in each group' },
    { setup: 'A gardener randomly chooses 20 of her 40 tomato plants to get a new fertilizer and gives the other 20 plain water. After six weeks she measures the height of every plant.',
      treat: 'The 20 plants given the fertilizer', ctrl: 'The 20 plants given plain water', all: 'All 40 tomato plants together', resp: 'The height of each plant after six weeks', factor: 'Whether or not a plant gets the fertilizer', size: 'The number of plants in each group' },
    { setup: 'A coach randomly assigns 15 of 30 runners to a new warm-up routine; the other 15 do the usual warm-up. Then every runner is timed over 400 m.',
      treat: 'The 15 runners who do the new warm-up', ctrl: 'The 15 runners who do the usual warm-up', all: 'All 30 runners together', resp: 'Each runner’s time over 400 m', factor: 'Which warm-up routine a runner does', size: 'The number of runners in each group' },
    { setup: 'A teacher randomly assigns 14 of 28 students to study with flash cards; the other 14 reread their notes. Everyone then takes the same quiz, and the teacher records the scores.',
      treat: 'The 14 students who use flash cards', ctrl: 'The 14 students who reread their notes', all: 'All 28 students together', resp: 'Each student’s quiz score', factor: 'Which way a student studies', size: 'The number of students in each group' },
  ];
  const RANDOM_WHY = ['So the groups are alike in every way except the treatment.', 'So more subjects can take part in the study.', 'So the treatment is sure to show an effect.', 'So each subject ends up in the group they prefer.'];
  A.skill({
    id: 'int3.study-types', title: 'Surveys, observational studies, and experiments',
    learn: p('Statistical studies come in three kinds. <b>A survey asks people questions</b> about their opinions or habits. <b>An observational study watches or records what already happens</b>, without changing anything. <b>An experiment imposes a treatment</b>: the researcher decides which subjects get it.') +
      p('In an experiment, the <b>treatment group</b> gets the new thing being tested and the <b>control group</b> does not (it gets nothing, the usual thing, or a fake). The <b>response variable</b> is what is measured to compare the groups.') +
      p('<b>Subjects are assigned to the groups at random</b>, so that the groups are alike in every other way. Then a big difference in the response can be put down to the treatment.') +
      example('Example', `${big('A doctor randomly gives 50 patients a new cream and 50 patients a cream with no medicine, then measures how fast their rashes heal.')}The doctor decides who gets what, so this is an <b>experiment</b>. The treatment group gets the new cream, the control group gets the plain cream, and the response is healing time.`),
    make(rng) {
      const kind = rng.pick(['classify', 'classify', 'classify', 'part', 'part', 'random']);
      if (kind === 'classify') {
        const type = rng.pick(STUDY_KINDS), i = rng.int(0, 3), text = STUDY_CASES[type][i];
        return { prompt: `What kind of study is this?${big(text)}`, type: 'choice', choices: STUDY_KINDS.slice(), answer: type, keepOrder: true, params: { kind, type, i },
          hints: ['Ask: does the researcher decide who gets a treatment? If so, it is an experiment.', 'If not, ask: are people being asked questions (a survey), or is existing behavior or data just being watched and recorded (an observational study)?',
            `${type === 'Experiment' ? 'The researcher assigns the treatment' : type === 'Survey' ? 'People are asked questions and nothing is assigned' : 'Nothing is assigned and no one is asked questions; what already happens is recorded'}, so it is <b>${type === 'Experiment' ? 'an experiment' : type === 'Survey' ? 'a survey' : 'an observational study'}</b>.`] };
      }
      const e = rng.int(0, EXPERIMENTS.length - 1), E = EXPERIMENTS[e];
      if (kind === 'random') {
        return { prompt: `${E.setup} Why are the groups chosen at random?`, type: 'choice', choices: RANDOM_WHY.slice(), answer: RANDOM_WHY[0], params: { kind, e },
          hints: ['If subjects chose their own groups, the groups might differ in other ways too, such as health, effort or skill.', 'Random assignment spreads those other differences evenly, so only the treatment differs between the groups.', `<b>${RANDOM_WHY[0]}</b>`] };
      }
      const ask = rng.pick(['ctrl', 'treat', 'resp']);
      const answer = E[ask], what = { ctrl: 'the control group', treat: 'the treatment group', resp: 'the response variable' }[ask];
      const pool = ask === 'resp' ? [E.factor, E.size, E.all] : [ask === 'ctrl' ? E.treat : E.ctrl, E.all, E.resp];
      return { prompt: `${E.setup} What is ${what}?`, type: 'choice', choices: [answer].concat(pool), answer, params: { kind, e, ask },
        hints: [ask === 'resp' ? 'The response variable is what is measured at the end to compare the groups.' : 'The treatment group gets the new thing being tested; the control group gets nothing or the usual thing, for comparison.',
          ask === 'resp' ? 'What does the researcher record for every subject at the end?' : `Find the group that ${ask === 'ctrl' ? 'does not get' : 'gets'} the new thing.`, `${what.charAt(0).toUpperCase() + what.slice(1)}: <b>${answer.charAt(0).toLowerCase() + answer.slice(1)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'classify') {
        const text = STUDY_CASES[P.type][P.i];
        // a second reading of the description: assigning means an experiment; asking means a survey; otherwise observing
        const got = /random(ly)? (split|chooses|assigns)/.test(text) ? 'Experiment' : /\b(asks?|asking|questionnaire|phones|emails)\b/.test(text) ? 'Survey' : 'Observational study';
        return q.answer === got && got === P.type;
      }
      const E = EXPERIMENTS[P.e];
      if (P.kind === 'random') return q.answer === RANDOM_WHY[0];
      if (P.ask === 'resp') return q.answer === E.resp && /measure|count|time|record|scores?|height/i.test(E.setup);
      return q.answer === E[P.ask] && (P.ask === 'treat' ? !/not|usual|plain|reread/.test(E.treat) : /not|usual|plain|reread/.test(E.ctrl));
    },
  });

  /** studies that found a difference: observational ones show a link only; randomized experiments show cause and effect */
  const CONCLUSION_CASES = [
    { obs: true, text: 'Researchers studied the records of 2,000 students. Students who eat breakfast every day had higher grades, on average, than students who usually skip it.',
      cause: 'The study shows that eating breakfast raises students’ grades.', link: 'The study shows a link between breakfast and grades, but not a cause.', none: 'The study shows that eating breakfast has no link to grades.', reverse: 'The study shows that good grades make students eat breakfast.',
      lurk: 'how much sleep they get', assign: 'Randomly assign students to eat breakfast or skip it, then compare grades.', subj: 'students' },
    { obs: true, text: 'A study of 1,500 students found that those who play a musical instrument score higher on math tests, on average, than those who do not.',
      cause: 'The study shows that playing an instrument raises math scores.', link: 'The study shows a link between music and math scores, but not a cause.', none: 'The study shows that playing an instrument has no link to math.', reverse: 'The study shows that being good at math makes students play music.',
      lurk: 'family income', assign: 'Randomly assign students to take music lessons or not, then compare scores.', subj: 'students' },
    { obs: true, text: 'Over several summers, a city noticed that on days with more ice-cream sales there were also more swimming accidents.',
      cause: 'The data show that eating ice cream causes swimming accidents.', link: 'The data show a link between ice cream and accidents, but not a cause.', none: 'The data show that ice-cream sales have no link to accidents.', reverse: 'The data show that swimming accidents make people buy ice cream.',
      lurk: 'hot weather', assign: null, subj: 'days' },
    { obs: true, text: 'Researchers asked 800 teenagers to keep a diary for a month. Teens who spent more time on screens slept less, on average, than teens who spent less time on screens.',
      cause: 'The study shows that screen time makes teenagers sleep less.', link: 'The study shows a link between screens and sleep, but not a cause.', none: 'The study shows that screen time has no link to sleep.', reverse: 'The study shows that sleeping less makes teenagers use screens.',
      lurk: 'stress or homework', assign: 'Randomly assign teenagers a short or a long screen time, then compare sleep.', subj: 'teenagers' },
    { obs: true, text: 'A study of 1,200 children found that children with more books at home have larger vocabularies, on average.',
      cause: 'The study shows that having more books gives children more words.', link: 'The study shows a link between books and vocabulary, but not a cause.', none: 'The study shows that books at home have no link to vocabulary.', reverse: 'The study shows that a large vocabulary makes families buy books.',
      lurk: 'how often parents read with them', assign: null, subj: 'children' },
    { obs: false, text: 'Researchers randomly assigned 60 volunteers to chew gum or not during a memory test. The gum chewers remembered more words, on average, by much more than chance alone would explain.',
      cause: 'The study shows that chewing gum helped these people remember.', link: 'The study shows a link between gum and memory, but not a cause.', none: 'The study shows that chewing gum has no effect on memory.', reverse: 'The study shows that a good memory makes people chew gum.' },
    { obs: false, text: 'A gardener randomly chose 20 of 40 tomato plants to get a new fertilizer; the rest got plain water. After six weeks the fertilized plants were taller, on average, by much more than chance alone would explain.',
      cause: 'The study shows that the fertilizer made the plants grow taller.', link: 'The study shows a link between fertilizer and height, but not a cause.', none: 'The study shows that the fertilizer has no effect on height.', reverse: 'The study shows that tall plants take in more fertilizer.' },
    { obs: false, text: 'A coach randomly assigned 30 runners to a new warm-up routine or the usual one. The new-routine group ran 400 m faster, on average, by much more than chance alone would explain.',
      cause: 'The study shows that the new warm-up made these runners faster.', link: 'The study shows a link between warm-up and speed, but not a cause.', none: 'The study shows that the warm-up has no effect on speed.', reverse: 'The study shows that fast runners choose the new warm-up.' },
    { obs: false, text: 'A teacher randomly assigned half of a class to study with flash cards and half to reread their notes. The flash-card group scored higher on the quiz, on average, by much more than chance alone would explain.',
      cause: 'The study shows that flash cards raised these students’ scores.', link: 'The study shows a link between flash cards and scores, but not a cause.', none: 'The study shows that flash cards have no effect on scores.', reverse: 'The study shows that high scorers choose to use flash cards.' },
  ];
  A.skill({
    id: 'int3.study-conclusions', title: 'Cause and effect or association',
    learn: p('What a study can conclude depends on how its data were collected. <b>Only a randomized experiment can show cause and effect.</b> Because chance decided who got the treatment, the groups differ only in the treatment, so a difference too big for chance must come from the treatment.') +
      p('<b>An observational study can show an association (a link), but not cause and effect.</b> The groups chose themselves, so they may differ in other ways. A <b>lurking variable</b> that affects both things can create a link on its own: hot weather raises both ice-cream sales and swimming accidents.') +
      p('To test whether one thing causes another, design an experiment: randomly assign subjects to the treatment or to a control group and compare the results.') +
      example('Example', `${big('People who take the stairs at work are fitter, on average, than people who take the elevator.')}Nobody was assigned to the stairs, so this is observational. It shows <b>a link, not cause and effect</b>: fitter people may simply choose the stairs.`),
    make(rng) {
      const c = rng.int(0, CONCLUSION_CASES.length - 1), C = CONCLUSION_CASES[c];
      const kind = C.obs ? rng.pick(C.assign ? ['conclude', 'why', 'fix'] : ['conclude', 'why']) : 'conclude';
      if (kind === 'conclude') {
        const answer = C.obs ? C.link : C.cause;
        return { prompt: `${C.text} Which conclusion does this study support?`, type: 'choice', choices: [C.cause, C.link, C.none, C.reverse], answer, params: { kind, c },
          hints: ['First decide how the data were collected: did the researchers randomly assign the treatment, or just observe what people already did?',
            C.obs ? 'Nobody was assigned to a group, so this is an observational study. It can show a link, but other differences between the groups could be the real cause.' : 'The treatment was assigned at random and the difference was too big for chance, so this randomized experiment can show cause and effect.',
            `<b>${answer}</b>`] };
      }
      if (kind === 'why') {
        const answer = `Other differences, such as ${C.lurk}, could explain the link.`;
        const wrong = [`The study used far too many ${C.subj} to give a fair result.`, 'Only a survey can show that one thing causes another.', 'A link found in real data can never be trusted.'];
        return { prompt: `${C.text} Why can’t this study show that one of these things causes the other?`, type: 'choice', choices: [answer].concat(wrong), answer, params: { kind, c },
          hints: ['Nobody was randomly assigned, so the groups being compared may differ in other ways.', 'A lurking variable that affects both things can produce a link even if neither causes the other.', `<b>${answer}</b>`] };
      }
      const answer = C.assign;
      const wrong = [`Repeat the same study with twice as many ${C.subj}.`, `Ask the ${C.subj} whether they think one causes the other.`, 'Let each person choose a group, then compare the groups.'];
      return { prompt: `${C.text} How could researchers test whether there is cause and effect?`, type: 'choice', choices: [answer].concat(wrong), answer, params: { kind, c },
        hints: ['Cause and effect needs an experiment, where the researcher decides who gets the treatment.', 'The groups must be formed by chance, not by choice, so that they are alike in every other way.', `<b>${answer}</b>`] };
    },
    verify(q) {
      const P = q.params, C = CONCLUSION_CASES[P.c];
      const randomized = /randomly assigned|randomly chose/.test(C.text);          // read the design from the description itself
      if (randomized === C.obs) return 'the case is labeled with the wrong design';
      if (P.kind === 'conclude') return q.answer === (randomized ? C.cause : C.link);
      if (P.kind === 'why') return !randomized && q.answer.includes(C.lurk);
      return !randomized && /^Randomly assign/.test(q.answer);
    },
  });

  /** a histogram: bars over consecutive bins, each labelled with its value */
  function histogram(edges, vals, labels, yTitle, xTitle) {
    const k = vals.length, W0 = 40, Wd = 260, bw = Wd / k, top = Math.max(...vals), H = 120, base = 150;
    let s = `<svg class="figure" viewBox="0 0 320 200" width="320" height="200" role="img" aria-label="histogram of ${xTitle}">`;
    vals.forEach((v, i) => {
      const h = top ? v / top * H : 0, x = W0 + i * bw;
      s += `<rect x="${r1(x)}" y="${r1(base - h)}" width="${r1(bw)}" height="${r1(h)}" class="fill"/>`;
      s += `<text x="${r1(x + bw / 2)}" y="${r1(base - h - 5)}" font-size="12" text-anchor="middle">${labels[i]}</text>`;
    });
    s += `<line x1="${W0}" y1="${base}" x2="${W0 + Wd}" y2="${base}" class="stroke"/><line x1="${W0}" y1="${base}" x2="${W0}" y2="20" class="stroke"/>`;
    edges.forEach((e, i) => { s += `<text x="${r1(W0 + i * bw)}" y="${base + 16}" font-size="12" text-anchor="middle">${e}</text>`; });
    s += `<text x="${W0 + Wd / 2}" y="${base + 36}" font-size="12" text-anchor="middle">${xTitle}</text>`;
    s += `<text x="14" y="${base / 2 + 10}" font-size="12" text-anchor="middle" transform="rotate(-90 14 ${base / 2 + 10})">${yTitle}</text></svg>`;
    return s;
  }
  const HIST_CTX = [
    { intro: n => `${n} students recorded how many minutes they spent on homework last night.`, axis: 'minutes', subj: 'students', start: 0, w: 15, ge: v => `spent at least ${v} minutes`, lt: v => `spent less than ${v} minutes` },
    { intro: n => `A farmer measured the heights of ${n} sunflowers, in centimeters.`, axis: 'height (cm)', subj: 'sunflowers', start: 100, w: 20, ge: v => `were at least ${v} cm tall`, lt: v => `were shorter than ${v} cm` },
    { intro: n => `${n} runners were each timed over one mile, in minutes.`, axis: 'time (minutes)', subj: 'runners', start: 6, w: 1, ge: v => `took at least ${v} minutes`, lt: v => `took less than ${v} minutes` },
    { intro: n => `The ages of ${n} people at a concert were recorded.`, axis: 'age (years)', subj: 'people', start: 10, w: 10, ge: v => `were at least ${v} years old`, lt: v => `were younger than ${v}` },
  ];
  A.skill({
    id: 'int3.relative-frequency', title: 'Relative frequency histograms',
    learn: p(`A frequency histogram shows how many data values fall in each interval (bin). <b>A relative frequency histogram shows what fraction of all the data falls in each bin: relative frequency = ${F('frequency of the bin', 'total number of values')}</b>. It can be written as a decimal or a percent, and the bars always add up to 1, or 100%.`) +
      p('To find the share of the data in a range of bins, add their relative frequencies. To turn a relative frequency back into a count, multiply it by the total. Each bin here includes its left end but not its right end, so the bin 10–20 holds values from 10 up to, but not including, 20.') +
      p('Relative frequencies let you compare data sets of different sizes, because they do not depend on how many values were collected.') +
      example('Example', `40 students record their homework time. 6 of them are in the bin 30–45 minutes.${big(`${F(6, 40, { raw: true })} = 0.15`)}The relative frequency of that bin is <b>0.15</b>, or 15%.`),
    make(rng) {
      const ctx = rng.pick(HIST_CTX), kind = rng.pick(['bin', 'range', 'range', 'count']), k = rng.int(5, 6);
      const edges = []; for (let i = 0; i <= k; i++) edges.push(ctx.start + i * ctx.w);
      const binName = i => `${edges[i]}–${edges[i + 1]}`;
      if (kind === 'count') {
        const n = rng.pick([20, 40, 60, 80, 200]);
        let pcts; do { pcts = []; let left = 20; for (let i = 0; i < k - 1; i++) { const v = rng.int(0, Math.min(left, 8)); pcts.push(v); left -= v; } pcts.push(left); } while (Math.max(...pcts) > 9 || pcts.filter(v => v > 0).length < 4);
        pcts = pcts.map(v => v * 5);
        const i = rng.int(0, k - 1); if (pcts[i] === 0) return this.make(rng);
        const ans = pcts[i] * n / 100;
        return { prompt: `${ctx.intro(n)} The relative frequency histogram shows the results; each bar includes its left end but not its right end. How many ${ctx.subj} are in the bin ${binName(i)}?${histogram(edges, pcts, pcts.map(v => v + '%'), 'relative frequency', ctx.axis)}`, type: 'number', answer: ans, unit: ctx.subj, params: { kind, n, pct: pcts[i], pcts },
          hints: [`Read the bar for ${binName(i)}: ${pcts[i]}% of the ${ctx.subj}.`, `Multiply by the total: ${pcts[i]}% of ${n} = ${N(pcts[i] / 100)} × ${n}.`, `That is <b>${N(ans)}</b> ${ctx.subj}.`] };
      }
      const n = rng.pick([20, 25, 40, 50]);
      let counts; do { counts = []; let left = n; for (let i = 0; i < k - 1; i++) { const v = rng.int(0, Math.min(left, Math.round(n * 0.4))); counts.push(v); left -= v; } counts.push(left); } while (Math.max(...counts) > n * 0.45 || counts.filter(v => v > 0).length < 4);
      if (kind === 'bin') {
        const i = rng.int(0, k - 1); if (counts[i] === 0) return this.make(rng);
        const ans = counts[i] / n;
        return { prompt: `${ctx.intro(n)} The table shows the results; each bin includes its left end but not its right end. What is the relative frequency of the bin ${binName(i)}? Give a decimal.${M.table([ctx.axis.charAt(0).toUpperCase() + ctx.axis.slice(1), 'Frequency'], counts.map((c, j) => [binName(j), c]))}`, type: 'number', answer: ans, params: { kind, n, counts, i, ctx: HIST_CTX.indexOf(ctx) },
          hints: [`Relative frequency = frequency ÷ total. The total is ${n}.`, `${binName(i)} has ${counts[i]} ${ctx.subj}: ${F(counts[i], n, { raw: true })}.`, `${counts[i]} ÷ ${n} = <b>${N(ans)}</b>.`] };
      }
      const cut = rng.int(1, k - 1), above = rng.bool(), idx = counts.map((_, j) => j).filter(j => above ? j >= cut : j < cut);
      const got = idx.reduce((s, j) => s + counts[j], 0), ans = got / n * 100;
      return { prompt: `${ctx.intro(n)} The histogram shows the results; each bar includes its left end but not its right end. What percent of the ${ctx.subj} ${above ? ctx.ge(edges[cut]) : ctx.lt(edges[cut])}?${histogram(edges, counts, counts.map(String), 'frequency', ctx.axis)}`, type: 'number', answer: ans, unit: '%', params: { kind, n, counts, cut, above, ctx: HIST_CTX.indexOf(ctx) },
        hints: [`${above ? `At least ${edges[cut]}` : `Less than ${edges[cut]}`} means the bars ${M.list(idx.map(binName))}.`, `Add their frequencies: ${idx.map(j => counts[j]).join(' + ')} = ${got} out of ${n}.`, `${got} ÷ ${n} = ${N(got / n)}, which is <b>${N(ans)}%</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'count') { const tot = P.pcts.reduce((s, v) => s + v, 0); return tot === 100 && close(q.answer / P.n * 100, P.pct); }
      // rebuild a data list with one value per subject at its bin's middle, then count values directly
      const ctx = HIST_CTX[P.ctx], data = [];
      P.counts.forEach((c, j) => { for (let t = 0; t < c; t++) data.push(ctx.start + (j + 0.5) * ctx.w); });
      if (data.length !== P.n) return 'the counts do not add up to the total';
      if (P.kind === 'bin') { const lo = ctx.start + P.i * ctx.w; return close(data.filter(x => x >= lo && x < lo + ctx.w).length / data.length, q.answer); }
      const edge = ctx.start + P.cut * ctx.w, hits = data.filter(x => P.above ? x >= edge : x < edge).length;
      return close(100 * hits / data.length, q.answer);
    },
  });

  /* ---------- Unit 11: Simulation and inference ---------- */
  const dRange = (a, b) => a === b ? `${a}` : `${a}–${b}`;
  const pad2 = v => (v < 10 ? '0' : '') + v;
  const SIM_CTX = [
    { setup: (nm, pc) => `${nm} makes ${pc}% of free throws.`, one: 'one free throw', succ: 'a make', fail: 'a miss', group: r => `${r} free throws`,
      ev: { atleast1: () => 'at least one goes in', all: r => r === 2 ? 'both go in' : 'all three go in', exactly1: () => 'exactly one goes in', atleast2: () => 'at least two go in' } },
    { setup: (nm, pc) => `${nm} has a packet of seeds, and ${pc}% of these seeds sprout.`, one: 'one seed', succ: 'it sprouts', fail: 'it does not', group: r => `planting ${r} seeds`,
      ev: { atleast1: () => 'at least one seed sprouts', all: r => r === 2 ? 'both seeds sprout' : 'all three seeds sprout', exactly1: () => 'exactly one seed sprouts', atleast2: () => 'at least two seeds sprout' } },
    { setup: (nm, pc) => `${nm}’s school bus is late on ${pc}% of days.`, one: 'one day', succ: 'late', fail: 'on time', group: r => `${r} school days`,
      ev: { atleast1: () => 'the bus is late at least once', all: r => r === 2 ? 'the bus is late on both days' : 'the bus is late on all three days', exactly1: () => 'the bus is late exactly once', atleast2: () => 'the bus is late at least twice' } },
  ];
  const simHit = (ev, r, s) => ev === 'atleast1' ? s >= 1 : ev === 'all' ? s === r : ev === 'exactly1' ? s === 1 : s >= 2;
  A.skill({
    id: 'int3.simulations', title: 'Simulating probability with random digits',
    learn: p(`A <b>simulation</b> estimates a probability by acting out the situation with random numbers. <b>Give each outcome a share of the digits that matches its probability.</b> For a 30% chance, let 0, 1 and 2 mean “yes” and 3 to 9 mean “no”. For a 35% chance, use pairs of digits: 00 to 34 mean yes (35 of the 100 pairs).`) +
      p('Each <b>trial</b> acts out the whole situation once, using as many digits as it needs. Run many trials, count the ones where the event happens, and divide: <b>estimated probability = successful trials ÷ total trials</b>.') +
      p(`The estimate is close to the <b>theoretical probability</b>, which you can work out with the rules of probability, and it gets closer as you run more trials. For two independent 30% events, the chance both happen is 0.3 × 0.3 = 0.09.`) +
      example('Example', `A spinner lands on red 40% of the time; digits 0–3 mean red. To spin twice, read the digits in pairs:${big('37 &nbsp; 02 &nbsp; 85 &nbsp; 61 &nbsp; 49')}Trials with at least one red: 37, 02, 61, 49. The estimate is 4 ÷ 5 = <b>0.8</b>; the theory gives 1 − 0.6² = 0.84.`),
    make(rng) {
      const kind = rng.pick(['assign', 'estimate', 'estimate', 'theory']), ci = rng.int(0, SIM_CTX.length - 1), C = SIM_CTX[ci], nm = rng.pick(NAMES);
      if (kind === 'assign') {
        if (rng.bool()) {
          const k = rng.int(3, 8), dg = (a, b) => a === b ? `digit ${a} means` : `digits ${dRange(a, b)} mean`, say = (a, b) => { const t = `${dg(a, b)} ${C.succ}; ${dg(b + 1, 9)} ${C.fail}.`; return t.charAt(0).toUpperCase() + t.slice(1); };
          const answer = say(0, k - 1), wrong = [say(0, k), say(0, k - 2), k === 5 ? say(0, 6) : say(0, 9 - k)];
          return { prompt: `${C.setup(nm, 10 * k)} Which way of using one random digit (0 to 9) simulates ${C.one}?`, type: 'choice', choices: options(answer, wrong), answer, params: { kind, pc: 10 * k, digits: 1 },
            hints: ['There are 10 digits, 0 to 9, all equally likely, so each digit is worth 10%.', `${10 * k}% needs ${k} of the 10 digits for ${C.succ}.`, `0 to ${k - 1} is ${k} digits: <b>${answer}</b>`] };
        }
        const pc = rng.pick([15, 25, 35, 45, 55, 65, 75, 85]), say = (a, b) => `Pairs ${pad2(a)}–${pad2(b)} mean ${C.succ}; all other pairs mean ${C.fail}.`;
        const answer = say(0, pc - 1), wrong = [say(0, pc), say(1, pc - 1), say(pc, 99)];
        return { prompt: `${C.setup(nm, pc)} Which way of using pairs of random digits (00 to 99) simulates ${C.one}?`, type: 'choice', choices: options(answer, wrong), answer, params: { kind, pc, digits: 2 },
          hints: ['There are 100 pairs, 00 to 99, so each pair is worth 1%.', `${pc}% needs exactly ${pc} pairs. Count carefully: 00 to ${pad2(pc)} is ${pc + 1} pairs, one too many.`, `00 to ${pad2(pc - 1)} is ${pc} pairs: <b>${answer}</b>`] };
      }
      const r = rng.pick([2, 3, 3]), ev = rng.pick(r === 3 ? ['atleast1', 'all', 'exactly1', 'atleast2'] : ['atleast1', 'all', 'exactly1']), k = rng.int(2, 7), pr = k / 10;
      const evText = C.ev[ev](r);
      if (kind === 'theory') {
        const q1 = 1 - pr, th = M.round(ev === 'atleast1' ? 1 - q1 ** r : ev === 'all' ? pr ** r : ev === 'exactly1' ? r * pr * q1 ** (r - 1) : 3 * pr * pr * q1 + pr ** 3, 6);
        const trials = rng.pick([50, 100, 200]), got = Math.max(0, Math.min(trials, Math.round(th * trials) + rng.pick([-6, -4, -3, 3, 4, 6]) * trials / 100));
        const askDiff = rng.chance(0.4), est = got / trials, ans = askDiff ? M.round(Math.abs(est - th), 6) : th;
        const work = { atleast1: `1 − P(none) = 1 − ${N(q1)}${M.sup('', r)}`, all: `${N(pr)}${M.sup('', r)}`, exactly1: `${r} × ${N(pr)} × ${N(q1)}${r > 2 ? M.sup('', r - 1) : ''}`, atleast2: `3 × ${N(pr)}² × ${N(q1)} + ${N(pr)}³` }[ev];
        return { prompt: `${C.setup(nm, 10 * k)} ${nm} simulated ${C.group(r)} ${trials} times, and in ${got} of the trials ${evText}. ${askDiff ? `How far is the simulation’s estimate from the theoretical probability? Give a decimal.` : `What is the theoretical probability that ${evText}? Give an exact decimal.`}`, type: 'number', answer: ans, params: { kind, r, ev, pr, trials, got, askDiff },
          hints: [`Each ${C.one.replace('one ', '')} is independent, with probability ${N(pr)} of ${C.succ} and ${N(q1)} of ${C.fail}.`, `The theoretical probability is ${work} = ${N(th)}.`,
            askDiff ? `The estimate is ${got} ÷ ${trials} = ${N(est)}, and |${N(est)} − ${N(th)}| = <b>${N(ans)}</b>.` : `The probability is <b>${N(th)}</b>. (The simulation gave ${N(est)}, which is close.)`] };
      }
      const T = 20, groups = [];
      for (let t = 0; t < T; t++) { let g = ''; for (let i = 0; i < r; i++) g += rng.int(0, 9); groups.push(g); }
      const succ = g => [...g].filter(d => Number(d) < k).length, hits = groups.map((g, i) => simHit(ev, r, succ(g)) ? i + 1 : 0).filter(Boolean);
      const grid = `<table class="mtable compact"><tbody>${[0, 1, 2, 3].map(row => `<tr>${groups.slice(row * 5, row * 5 + 5).map((g, j) => `<td>${row * 5 + j + 1}: <b>${g}</b></td>`).join('')}</tr>`).join('')}</tbody></table>`;
      const ans = hits.length / T;
      return { prompt: `${C.setup(nm, 10 * k)} To simulate ${C.group(r)}, ${nm} reads random digits in groups of ${r}: digits ${dRange(0, k - 1)} mean ${C.succ} and ${dRange(k, 9)} mean ${C.fail}. Here are 20 trials. Estimate the probability that ${evText}. Give a decimal.${grid}`, type: 'number', answer: ans, params: { kind, r, ev, k, groups },
        hints: [`In each group, count the digits from 0 to ${k - 1}. The trial is a success when ${evText}.`, hits.length ? `The successful trials are numbers ${M.list(hits.map(String))}: ${hits.length} of the 20.` : 'None of the 20 trials is a success.', `The estimate is ${hits.length} ÷ 20 = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'assign') {
        // count how many digits (or pairs) the chosen rule gives to success
        const m = A.stripTags(q.answer).match(/(\d+)(?:–(\d+))?/), a = Number(m[1]), b = m[2] == null ? a : Number(m[2]);
        return (b - a + 1) * (P.digits === 1 ? 10 : 1) === P.pc && m[1].length === P.digits;
      }
      if (P.kind === 'theory') {
        // list every outcome of r trials with the digits model: 10^r equally likely strings
        let hit = 0, tot = 0, k = Math.round(P.pr * 10);
        for (let v = 0; v < 10 ** P.r; v++) { let s = 0; for (let i = 0, x = v; i < P.r; i++, x = Math.floor(x / 10)) if (x % 10 < k) s++; tot++; if (simHit(P.ev, P.r, s)) hit++; }
        const th = hit / tot;
        return close(q.answer, P.askDiff ? Math.abs(P.got / P.trials - th) : th, 1e-9);
      }
      let hits = 0;
      for (const g of P.groups) { let s = 0, x = Number(g); for (let i = 0; i < P.r; i++, x = Math.floor(x / 10)) if (x % 10 < P.k) s++; if (simHit(P.ev, P.r, s)) hits++; }
      return close(q.answer, hits / P.groups.length);
    },
  });

  const RERAND_CTX = [
    { what: 'the growth of plants', unit: 'cm', tLabel: 'New fertilizer', cLabel: 'Plain water', col: 'Growth (cm)', lo: 8, hi: 20,
      groups: 'plants given a new fertilizer and plants given plain water', more: d => `the plants given the new fertilizer grew ${d} cm more, on average, than the plants given plain water` },
    { what: 'quiz scores', unit: 'points', tLabel: 'Flash cards', cLabel: 'Reread notes', col: 'Quiz score (points)', lo: 10, hi: 20,
      groups: 'students who studied with flash cards and students who reread their notes', more: d => `the students who used flash cards scored ${d} points higher, on average, than the students who reread their notes` },
    { what: 'word recall', unit: 'words', tLabel: 'Chewed gum', cLabel: 'No gum', col: 'Words remembered', lo: 6, hi: 18,
      groups: 'volunteers who chewed gum during a memory test and volunteers who did not', more: d => `the volunteers who chewed gum remembered ${d} more words, on average, than those who did not` },
  ];
  const SIG = ['It is statistically significant: chance alone rarely gives a difference this big.', 'It is not statistically significant: chance alone often gives a difference this big.', 'It proves that the treatment has no effect at all.'];
  A.skill({
    id: 'int3.randomization-tests', title: 'Re-randomization tests',
    learn: p('An experiment finds that the treatment group did better than the control group on average. <b>Could the difference just be chance, from how the subjects happened to be split?</b> A <b>re-randomization test</b> checks this by acting out a world where the treatment does nothing.') +
      p('Put all the results together, shuffle them, deal them into two new groups of the same sizes, and record the difference in means. Repeat hundreds of times. <b>The share of re-randomized differences at least as large as the real one shows how often chance alone produces such a difference.</b>') +
      p('If that share is small, less than about 5%, the result is <b>statistically significant</b>: chance alone is an unlikely explanation. If it is large, chance could easily explain it. A result that is not significant does not prove the treatment does nothing; it just has not shown an effect.') +
      example('Example', `The treatment group’s mean was 3.4 points higher. In 500 re-randomizations, 8 differences were 3.4 or more.${big('8 ÷ 500 = 0.016 = 1.6%')}That is less than 5%, so the difference is <b>statistically significant</b>.`),
    make(rng) {
      const kind = rng.pick(['diff', 'share', 'share', 'decide']), C = rng.pick(RERAND_CTX);
      if (kind === 'diff') {
        const n = 5, gen = shift => { const v = []; for (let i = 0; i < n; i++) v.push(rng.int(C.lo, C.hi) + shift); return v; };
        const a = gen(rng.int(1, 4)), b = gen(0), sa = a.reduce((s, x) => s + x, 0), sb = b.reduce((s, x) => s + x, 0), ans = M.round((sa - sb) / n, 6);
        return { prompt: `An experiment compares ${C.groups}. What is the observed difference in means, treatment minus control?${M.table(['Group', C.col], [[C.tLabel, a.join(', ')], [C.cLabel, b.join(', ')]])}`, type: 'number', answer: ans, unit: C.unit, params: { kind, a, b },
          hints: [`Treatment mean: (${a.join(' + ')}) ÷ ${n} = ${sa} ÷ ${n} = ${N(sa / n)}.`, `Control mean: (${b.join(' + ')}) ÷ ${n} = ${sb} ÷ ${n} = ${N(sb / n)}.`, `The difference is ${N(sa / n)} − ${N(sb / n)} = <b>${N(ans)}</b> ${C.unit}.`] };
      }
      if (kind === 'share') {
        const vals = [-4, -3, -2, -1, 0, 1, 2, 3, 4], base = [1, 4, 11, 19, 30, 19, 11, 4, 1].map(w => Math.max(0, w + rng.int(-2, 2)));
        const tot = rng.pick([100, 200]), sum = base.reduce((s, x) => s + x, 0);
        const counts = base.map(w => Math.round(w * tot / sum)); counts[4] += tot - counts.reduce((s, x) => s + x, 0);
        const d = rng.pick([1, 2, 2, 3, 3]), ans = M.round(counts.filter((_, i) => vals[i] >= d).reduce((s, x) => s + x, 0) / tot * 100, 6);
        return { prompt: `In an experiment on ${C.what}, ${C.more(d)}. The results were re-randomized ${tot} times; the table shows how often each difference in means came up. In what percent of the re-randomizations was the difference at least ${d} ${C.unit}?${M.table(['Difference', ...vals.map(N)], [['Count', ...counts]])}`, type: 'number', answer: ans, unit: '%', params: { kind, vals, counts, d },
          hints: [`Look at the differences of ${d} or more: ${M.list(vals.filter(v => v >= d).map(N))}.`, `Their counts add to ${counts.filter((_, i) => vals[i] >= d).join(' + ')} = ${counts.filter((_, i) => vals[i] >= d).reduce((s, x) => s + x, 0)} out of ${tot}.`, `That is <b>${N(ans)}%</b> of the re-randomizations.`] };
      }
      const N0 = rng.pick([100, 200, 500, 1000]), sig = rng.bool(), x = sig ? rng.int(0, Math.floor(N0 / 100)) : rng.int(Math.ceil(N0 * 0.2), Math.floor(N0 * 0.45));
      const d = rng.int(2, 9) / 2, answer = sig ? SIG[0] : SIG[1];
      return { prompt: `In an experiment on ${C.what}, ${C.more(N(d))}. In ${N(N0)} re-randomizations of the results, ${N(x)} gave a difference of at least ${N(d)} ${C.unit}. What can you conclude?`, type: 'choice', choices: SIG.slice(), answer, params: { kind, N0, x },
        hints: [`Find the share of re-randomizations at least as extreme as the real result: ${N(x)} ÷ ${N(N0)} = ${N(M.round(x / N0 * 100, 2))}%.`, sig ? 'That is well under 5%, so chance alone rarely produces a difference this large.' : 'That is far above 5%, so chance alone often produces a difference this large. That does not prove there is no effect.', `<b>${answer}</b>`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'diff') { const n = P.a.length; let s = 0; for (let i = 0; i < n; i++) s += (P.a[i] - P.b[i]) / n; return close(s, q.answer); }   // mean of the paired gaps equals the gap in means
      if (P.kind === 'share') { const all = []; P.vals.forEach((v, i) => { for (let t = 0; t < P.counts[i]; t++) all.push(v); }); return close(100 * all.filter(v => v >= P.d).length / all.length, q.answer); }
      return q.answer === (P.x / P.N0 < 0.05 ? SIG[0] : SIG[1]);
    },
  });

  /* ---------- Unit 12: Roots of polynomials ---------- */
  const divisors = n => { const out = []; for (let d = 1; d <= Math.abs(n); d++) if (n % d === 0) out.push(d); return out; };
  /** every ± p/q with p | constant and q | leading, as reduced [p, q] pairs, smallest first */
  function rrtCandidates(lead, cons) {
    const seen = new Map();
    for (const pp of divisors(cons)) for (const qq of divisors(lead)) for (const s of [1, -1]) { const [a, b] = M.simp(s * pp, qq); seen.set(a + '/' + b, [a, b]); }
    return [...seen.values()].sort((u, v) => u[0] / u[1] - v[0] / v[1]);
  }
  A.skill({
    id: 'int3.rational-roots', title: 'The rational root theorem',
    learn: p(`<b>The rational root theorem:</b> if a polynomial has integer coefficients, every rational root, written in lowest terms as ${F(V('p'), V('q'))}, has <b>${V('p')} a factor of the constant term and ${V('q')} a factor of the leading coefficient</b>.`) +
      p(`So list ± (factors of the constant) ÷ (factors of the leading coefficient). That list is every rational number that <i>could</i> be a root. Test them by substituting or with synthetic division; once one works, divide it out and solve what is left.`) +
      p('The theorem only gives candidates. A polynomial may have no rational roots at all, and its other roots may be irrational or complex.') +
      example('Example', `${big(M.poly([2, -3, -8, -3]))}The candidates are ±1, ±3, ±${F(1, 2)}, ±${F(3, 2)}. Testing: 2(27) − 3(9) − 8(3) − 3 = 0, so <b>${X} = 3</b> is a root.`),
    make(rng) {
      const kind = rng.pick(['not', 'not', 'count', 'find']);
      if (kind === 'find') {
        const [pp, qq] = rng.pick([[1, 2], [3, 2], [-1, 2], [-3, 2], [1, 3], [2, 3], [-2, 3], [-1, 3], [5, 2], [-5, 2], [4, 3], [-4, 3], [2, 1], [-3, 1], [3, 1], [-2, 1]]);
        let b, d; do { b = rng.int(-4, 4); d = rng.int(-6, 6); } while (d === 0 || (b * b - 4 * d >= 0 && Number.isInteger(Math.sqrt(b * b - 4 * d))));
        const coefs = pmul([qq, -pp], [1, b, d]), cands = rrtCandidates(coefs[0], coefs[3]);
        const ans = pp / qq;
        return { prompt: `This polynomial has exactly one rational root. Find it.${big(`${V('p')}(${X}) = ${M.poly(coefs)}`)}`, type: 'number', answer: ans, answerText: M.fracText(pp, qq), params: { kind, coefs },
          hints: [`Candidates are ± factors of ${N(Math.abs(coefs[3]))} over factors of ${N(coefs[0])}: ${cands.filter(c => c[0] > 0).map(c => '±' + M.fracText(c[0], c[1])).join(', ')}.`,
            `Test them. ${V('p')}(${M.fracText(pp, qq)}) = 0, so ${lin(qq, -pp)} is a factor; the rest is ${M.poly([1, b, d])}, which has no rational roots.`, `The rational root is <b>${M.fracText(pp, qq)}</b>.`] };
      }
      const lead = rng.pick([2, 3, 4, 5, 6]), cons = rng.pick([2, 3, 4, 5, 6, 8, 9, 10, 12, 15]) * rng.sign();
      const coefs = [lead, rng.int(-9, 9), rng.int(-9, 9), cons], cands = rrtCandidates(lead, Math.abs(cons));
      const fac = n => divisors(n).join(', ');
      const h1 = `The constant term is ${N(cons)}; its factors are ${fac(Math.abs(cons))}. The leading coefficient is ${lead}; its factors are ${fac(lead)}.`;
      if (kind === 'count') {
        return { prompt: `How many different possible rational roots does the rational root theorem give for this polynomial?${big(`${V('p')}(${X}) = ${M.poly(coefs)}`)}`, type: 'number', answer: cands.length, params: { kind, coefs },
          hints: [h1, `Form every ${F(V('p'), V('q'))} with ${V('p')} from the first list and ${V('q')} from the second, simplify, and drop repeats: ${cands.filter(c => c[0] > 0).map(c => M.fracText(c[0], c[1])).join(', ')}.`, `That is ${cands.length / 2} positive values, and each can be + or −, so there are <b>${cands.length}</b>.`] };
      }
      // a number that is not a candidate: often a factor of the leading coefficient over a factor of the constant (upside down)
      const isCand = (a, b) => cands.some(c => c[0] * b === c[1] * a);
      const bads = [];
      for (const top of divisors(lead)) for (const bot of divisors(Math.abs(cons))) { const [a, b] = M.simp(top * rng.sign(), bot); if (!isCand(a, b)) bads.push([a, b]); }
      for (const extra of [7, 11, 13]) if (Math.abs(cons) % extra) bads.push([extra * rng.sign(), 1]);
      const bad = rng.pick(bads), goods = rng.sample(cands.filter(c => c[1] > 1 || rng.chance(0.5)), 3);
      if (goods.length < 3) return this.make(rng);
      const show = ([a, b]) => F(a, b);
      const answer = show(bad);
      return { prompt: `Which of these numbers <b>cannot</b> be a rational root of the polynomial?${big(`${V('p')}(${X}) = ${M.poly(coefs)}`)}`, type: 'choice', choices: [answer].concat(goods.map(show)), answer, params: { kind, coefs, bad, goods },
        hints: [h1, `A possible root, in lowest terms, has a numerator from the first list and a denominator from the second.`, `In ${M.fracText(bad[0], bad[1])}, ${lead % bad[1] ? `the denominator ${bad[1]} is not a factor of ${lead}` : `the numerator ${Math.abs(bad[0])} is not a factor of ${Math.abs(cons)}`}, so <b>${answer}</b> cannot be a root.`] };
    },
    verify(q) {
      const P = q.params, c = P.coefs, lead = c[0], cons = c[c.length - 1];
      // a reduced fraction a/b passes the theorem when a divides the constant and b divides the leading coefficient
      const ok = (a, b) => cons % a === 0 && lead % b === 0;
      if (P.kind === 'count') { let k = 0; for (let b = 1; b <= Math.abs(lead); b++) for (let a = -Math.abs(cons); a <= Math.abs(cons); a++) if (a && M.gcd(a, b) === 1 && ok(a, b)) k++; return k === q.answer; }
      if (P.kind === 'not') return !ok(P.bad[0], P.bad[1]) && P.goods.every(([a, b]) => ok(a, b)) && q.answer === F(P.bad[0], P.bad[1]);
      // exact test: q³·p(a/b) = Σ cᵢ aⁱ b³⁻ⁱ must be 0 at the answer and at no other candidate
      const roots = []; for (let b = 1; b <= Math.abs(lead); b++) for (let a = -Math.abs(cons); a <= Math.abs(cons); a++) if (a && M.gcd(a, b) === 1 && peval(c.map((ci, i) => ci * b ** i), a) === 0) roots.push(a / b);
      return roots.length === 1 && close(roots[0], q.answer);
    },
  });

  /** "3 + 2i", "−1 − 4i", "2 + √5" */
  const cplx = (a, b, root) => { const im = root ? M.sqrt(Math.abs(b)) : `${Math.abs(b) === 1 ? '' : N(Math.abs(b))}${V('i')}`; return a === 0 ? `${b < 0 ? '−' : ''}${im}` : `${N(a)} ${b < 0 ? '−' : '+'} ${im}`; };
  /** a polynomial (highest power first) at a complex number re + im·i, by Horner's rule */
  const cEval = (cs, re, im) => cs.reduce(([x, y], k) => [x * re - y * im + k, x * im + y * re], [0, 0]);
  A.skill({
    id: 'int3.poly-from-roots', title: 'Writing a polynomial from its roots',
    learn: p(`Each root ${V('r')} gives a factor (${X} − ${V('r')}), so a polynomial with roots ${V('r')}, ${V('s')}, ${V('t')} is ${V('a')}(${X} − ${V('r')})(${X} − ${V('s')})(${X} − ${V('t')}). Multiply out to get standard form.`) +
      p(`<b>Complex roots of a polynomial with real coefficients come in conjugate pairs: if ${V('a')} + ${V('b')}${V('i')} is a root, so is ${V('a')} − ${V('b')}${V('i')}.</b> In the same way, if the coefficients are rational and ${V('a')} + √${V('k')} is a root, so is ${V('a')} − √${V('k')}.`) +
      p(`A conjugate pair multiplies to a real quadratic: (${X} − (${V('a')} + ${V('b')}${V('i')}))(${X} − (${V('a')} − ${V('b')}${V('i')})) = <b>${M.sup(X, 2)} − 2${V('a')}${X} + (${M.sup(V('a'), 2)} + ${M.sup(V('b'), 2)})</b>, because ${M.sup(V('i'), 2)} = −1.`) +
      example('Example', `Roots 2 and 1 ± 3${V('i')}:${big(`(${X} − 2)(${M.sup(X, 2)} − 2${X} + 10)`)}Multiply out: <b>${M.poly([1, -4, 14, -20])}</b>.`),
    make(rng) {
      const kind = rng.pick(['pair', 'quad', 'cubic', 'cubic', 'const']), root = kind !== 'cubic' && kind !== 'const' && rng.chance(0.4);
      let a = rng.nz(-5, 5), b = rng.int(1, 6) * rng.sign();
      if (root) { b = rng.pick([2, 3, 5, 6, 7, 10]) * rng.sign(); }
      const rootTxt = cplx(a, b, root), conj = cplx(a, -b, root), coefWord = root ? 'rational' : 'real';
      if (kind === 'pair') {
        const wrong = [cplx(-a, b, root), cplx(-a, -b, root), root ? cplx(a, -b, false) : cplx(b, a, false), cplx(-b, a, false), N(a)].filter(w => key(w) !== key(rootTxt));
        return { prompt: `A polynomial with ${coefWord} coefficients has ${rootTxt} as a root. Which other number must also be a root?`, type: 'choice', choices: options(conj, wrong), answer: conj, params: { kind, a, b, root },
          hints: [root ? 'With rational coefficients, roots of the form a + √k come in pairs: the sign in front of the square root flips.' : 'With real coefficients, complex roots come in conjugate pairs: the sign of the imaginary part flips.', `Keep the real part ${N(a)} and change the sign of the ${root ? 'root' : 'imaginary'} part.`, `The other root is <b>${conj}</b>.`] };
      }
      const sum = 2 * a, prod = root ? a * a - Math.abs(b) : a * a + b * b;     // the pair gives x² − (sum)x + (product)
      const pairQuad = [1, -sum, prod];
      if (kind === 'quad') {
        const forms = [pairQuad, [1, sum, prod], [1, -sum, root ? a * a + Math.abs(b) : a * a - b * b], [1, -a, prod]];
        const texts = forms.map(f => M.poly(f));
        return { prompt: `Which quadratic, with leading coefficient 1, has roots ${rootTxt} and ${conj}?`, type: 'choice', choices: options(texts[0], texts.slice(1)), answer: texts[0], params: { kind, a, b, root, forms },
          hints: [`The sum of the roots is ${N(a)} + ${pw(a)} = ${N(sum)}. The product is ${pw(a)}² − (${root ? M.sqrt(Math.abs(b)) : (Math.abs(b) === 1 ? '' : N(Math.abs(b))) + V('i')})² = ${N(a * a)} ${root ? `− ${Math.abs(b)}` : `+ ${b * b}`} = ${N(prod)}${root ? '' : `, since ${M.sup(V('i'), 2)} = −1`}.`, `A quadratic with leading coefficient 1 is ${M.sup(X, 2)} − (sum)${X} + (product).`, `<b>${texts[0]}</b>`] };
      }
      const r = rng.nz(-5, 5), cubic = pmul([1, -r], pairQuad);
      if (kind === 'const') {
        return { prompt: `A cubic polynomial ${V('p')}(${X}) has leading coefficient 1 and roots ${N(r)}, ${rootTxt} and ${conj}. What is its constant term?`, type: 'number', answer: cubic[3], params: { kind, a, b, r },
          hints: [`The conjugate pair gives the factor ${M.poly(pairQuad)}; the root ${N(r)} gives ${lin(1, -r)}.`, `The constant term of ${lin(1, -r)}(${M.poly(pairQuad)}) is ${pw(-r)} × ${pw(prod)}.`, `That is <b>${N(cubic[3])}</b>.`] };
      }
      const forms = [cubic, pmul([1, r], pairQuad), pmul([1, -r], [1, sum, prod]), pmul([1, -r], [1, -sum, a * a - b * b])];
      const texts = forms.map(f => M.poly(f));
      return { prompt: `Which polynomial, with leading coefficient 1, has roots ${N(r)}, ${rootTxt} and ${conj}?`, type: 'choice', choices: options(texts[0], texts.slice(1)), answer: texts[0], params: { kind, a, b, r, forms },
        hints: [`The conjugate pair multiplies to ${M.sup(X, 2)} − ${pw(sum)}${X} + ${pw(prod)} = ${M.poly(pairQuad)}.`, `The root ${N(r)} gives the factor ${lin(1, -r)}. Multiply: ${lin(1, -r)}(${M.poly(pairQuad)}).`, `<b>${texts[0]}</b>`] };
    },
    verify(q) {
      const P = q.params, { a, b } = P;
      // is each of the roots really a root? complex roots by complex arithmetic, radical roots in decimals
      const vanishes = cs => (P.root ? [Math.sqrt(Math.abs(b)), -Math.sqrt(Math.abs(b))].every(t => close(peval(cs, a + t), 0, 1e-7))
        : [b, -b].every(t => { const [x, y] = cEval(cs, a, t); return close(x, 0, 1e-9) && close(y, 0, 1e-9); })) && (P.r == null || close(peval(cs, P.r), 0));
      if (P.kind === 'pair') {
        const want = P.root ? cplx(a, -b, true) : cplx(a, -b, false);
        if (P.root) return q.answer === want && close(peval([1, -2 * a, a * a - Math.abs(b)], a - Math.sign(b) * Math.sqrt(Math.abs(b))), 0, 1e-9);
        const [x, y] = cEval([1, -2 * a, a * a + b * b], a, -b);               // the conjugate satisfies the pair’s quadratic
        return q.answer === want && close(x, 0) && close(y, 0);
      }
      if (P.kind === 'const') { const cs = pmul([1, -P.r], [1, -2 * a, a * a + b * b]); return vanishes(cs) && cs[3] === q.answer && -P.r * (a * a + b * b) === q.answer; }
      const good = P.forms.map(vanishes);
      return good.filter(Boolean).length === 1 && good[0] && q.answer === M.poly(P.forms[0]);
    },
  });

  /* ---------- Unit 13: More trigonometry ---------- */
  const S2 = M.sqrt(2), S3 = M.sqrt(3), S6 = M.sqrt(6);
  /** exact values of tan, sec, csc and cot as HTML */
  const TVALS = [
    { v: 0, h: '0' }, { v: 1 / Math.sqrt(3), h: F(S3, 3) }, { v: 1, h: '1' }, { v: Math.sqrt(3), h: S3 },
    { v: Math.SQRT2, h: S2 }, { v: 2 / Math.sqrt(3), h: F(`2${S3}`, 3) }, { v: 2, h: '2' },
  ];
  const tvHtml = x => { if (x === null) return 'Undefined'; const e = TVALS.find(t => close(t.v, Math.abs(x), 1e-9)); return (x < -1e-12 ? '−' : '') + e.h; };
  const tvValue = h => { if (h === 'Undefined') return null; for (const t of TVALS) for (const s of [1, -1]) if ((s < 0 ? '−' : '') + t.h === h) return s * t.v; return NaN; };
  const snap0 = x => Math.abs(x) < 1e-12 ? 0 : x;
  const TRIG = {
    sin: d => Math.sin(rad(d)), cos: d => Math.cos(rad(d)),
    tan: d => close(Math.cos(rad(d)), 0, 1e-12) ? null : snap0(Math.tan(rad(d))),
    sec: d => close(Math.cos(rad(d)), 0, 1e-12) ? null : 1 / Math.cos(rad(d)),
    csc: d => close(Math.sin(rad(d)), 0, 1e-12) ? null : 1 / Math.sin(rad(d)),
    cot: d => close(Math.sin(rad(d)), 0, 1e-12) ? null : snap0(Math.cos(rad(d)) / Math.sin(rad(d))),
  };
  const angleTxt = (dg, inRad) => inRad ? (dg === 0 ? '0' : piFrac(...M.simp(dg, 180))) : M.deg(dg);
  /** "x = π/2" from n/d of π */
  const xEq = (n, d) => `${X} = ${n === 0 ? '0' : piFrac(n, d)}`;

  A.skill({
    id: 'int3.tangent-function', title: 'The tangent function',
    learn: p(`On the unit circle the point at angle θ is (cos θ, sin θ), and <b>tan θ = ${F('sin θ', 'cos θ')} = ${F(V('y'), V('x'))}</b>, the slope of the radius. So tan 45° = 1, tan 30° = ${F(S3, 3)} and tan 60° = ${S3}. Tangent is positive in quadrants 1 and 3, where ${V('x')} and ${V('y')} have the same sign.`) +
      p(`<b>When cos θ = 0, tangent is undefined</b>, so the graph of ${V('y')} = tan ${X} has vertical asymptotes at ${X} = ${F('π', 2)} + ${V('k')}π. Between them the graph rises from −∞ to ∞, crossing zero at ${X} = ${V('k')}π.`) +
      p(`<b>The period of tangent is π</b> (180°), half that of sine and cosine. For ${V('y')} = tan(${V('b')}${X}) the period is ${F('π', V('b'))}, and the asymptotes are squeezed together the same way.`) +
      example('Example', `Find tan ${F('5π', 6)}.${big(`${F('5π', 6)} = 150°: &nbsp; (cos, sin) = (−${F(S3, 2)}, ${F(1, 2)})`)}tan = ${F(1, 2)} ÷ (−${F(S3, 2)}) = −${F(1, S3)} = <b>−${F(S3, 3)}</b>.`),
    make(rng) {
      const kind = rng.pick(['exact', 'exact', 'period', 'asym', 'point']);
      if (kind === 'exact') {
        const dg = rng.pick([0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330]), inRad = rng.bool();
        const v = TRIG.tan(dg), answer = tvHtml(v), c = Math.cos(rad(dg)), s = Math.sin(rad(dg));
        const pool = v === null ? ['0', '1', '−1', S3] : [tvHtml(-v || 0), tvHtml(v === 0 ? 1 : 1 / v), 'Undefined', tvHtml(v === 0 ? -1 : -1 / v), '0', '1'];
        return { prompt: `Find the exact value.${big(`tan ${angleTxt(dg, inRad)}`)}`, type: 'choice', choices: options(answer, pool), answer, params: { kind, dg },
          hints: [`${inRad ? `${angleTxt(dg, true)} = ${M.deg(dg)}. ` : ''}The unit-circle point is (${exactHtml(c)}, ${exactHtml(s)}).`,
            v === null ? `tan = ${V('y')} ÷ ${V('x')}, and ${V('x')} = 0 here, so the division cannot be done.` : `tan = ${V('y')} ÷ ${V('x')} = ${exactHtml(s)} ÷ ${c < 0 ? `(${exactHtml(c)})` : exactHtml(c)}${dg % 180 === 0 ? ' = 0' : ''}.`,
            v === null ? `tan ${angleTxt(dg, inRad)} does not exist: <b>${answer}</b>.` : `tan ${angleTxt(dg, inRad)} is <b>${answer}</b>.`] };
      }
      if (kind === 'period') {
        if (rng.bool()) {
          const h = rng.pick([2, 3, 4, 5, 6, 8]), a = rng.pick([1, 2, 3, -1, -2]);
          return { prompt: `What is the period of this function?${big(`${V('y')} = ${a === 1 ? '' : a === -1 ? '−' : N(a)}tan(${F(`π${X}`, h)})`)}`, type: 'number', answer: h, params: { kind, b: Math.PI / h },
            hints: [`The period of ${V('y')} = tan(${V('b')}${X}) is ${F('π', V('b'))}. The number in front only stretches the graph vertically.`, `Here ${V('b')} = ${F('π', h)}, so the period is π ÷ ${F('π', h)} = π × ${F(h, 'π')}.`, `The period is <b>${h}</b>.`] };
        }
        const b = rng.pick([2, 3, 4, 6]), answer = piFrac(1, b);
        return { prompt: `What is the period of this function?${big(`${V('y')} = tan(${b}${X})`)}`, type: 'choice', choices: options(answer, [piFrac(2, b), piFrac(b, 1), piFrac(1, 2 * b)]), answer, params: { kind, b },
          hints: [`The period of ${V('y')} = tan ${X} is π, not 2π as for sine and cosine.`, `Multiplying ${X} by ${b} squeezes the graph, so the period is π ÷ ${b}.`, `The period is <b>${answer}</b>.`] };
      }
      if (kind === 'asym') {
        const b = rng.pick([1, 1, 2, 3, 4]), k = rng.int(0, 2 * b - 1);
        const good = [2 * k + 1, 2 * b], wrong = [[k, b], [k + 1, b], [4 * k + 1, 4 * b], [4 * k + 3, 4 * b]];
        const opts = [good].concat(wrong.filter(([n, d]) => n * 2 * b !== (2 * k + 1) * d)).slice(0, 4);
        const texts = opts.map(([n, d]) => xEq(...M.simp(n, d)));
        return { prompt: `Which line is a vertical asymptote of the graph?${big(`${V('y')} = tan${b === 1 ? ` ${X}` : `(${b}${X})`}`)}`, type: 'choice', choices: options(texts[0], texts.slice(1)), answer: texts[0], params: { kind, b, opts, texts },
          hints: [`Tangent is not defined where cosine is zero: ${b === 1 ? X : `${b}${X}`} = ${F('π', 2)} + ${V('k')}π.`, b === 1 ? `So the asymptotes are at ${X} = ${F('π', 2)}, ${F('3π', 2)}, ${F('5π', 2)}, … and ${X} = −${F('π', 2)}, ….` : `Divide by ${b}: ${X} = ${piFrac(1, 2 * b)} + ${V('k')}·${piFrac(1, b)}, which gives ${[0, 1, 2].map(j => piFrac(2 * j + 1, 2 * b)).join(', ')}, ….`, `<b>${texts[0]}</b> is an asymptote.`] };
      }
      const [x, y] = [rng.nz(-9, 9), rng.nz(-9, 9)];
      if (Math.abs(x) === Math.abs(y)) return this.make(rng);
      return { prompt: `The terminal side of angle θ passes through the point ${M.pt(x, y)}. Find tan θ.`, type: 'number', answer: y / x, answerText: M.fracText(y, x), params: { kind, x, y },
        hints: [`tan θ = ${F(V('y'), V('x'))} for any point (${V('x')}, ${V('y')}) on the terminal side; the distance from the origin cancels.`, `tan θ = ${F(N(y), N(x), { raw: true })}.`, `tan θ = <b>${M.fracText(y, x)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'exact') { const s = Math.sin(rad(P.dg)), c = Math.cos(rad(P.dg)); return Math.abs(c) < 1e-12 ? q.answer === 'Undefined' : close(tvValue(q.answer), s / c, 1e-9); }
      if (P.kind === 'period') {
        const f = x => Math.tan(P.b * x), pts = [0.13, 0.41, 0.77];
        const per = typeof q.answer === 'number' ? q.answer : Math.PI / P.b;
        if (typeof q.answer !== 'number' && q.answer !== piFrac(1, P.b)) return 'wrong period text';
        return pts.every(x => close(f(x + per), f(x), 1e-6)) && !pts.every(x => close(f(x + per / 2), f(x), 1e-6));
      }
      if (P.kind === 'asym') {
        const isAsym = ([n, d]) => close(Math.cos(P.b * n * Math.PI / d), 0, 1e-9);
        const hits = P.opts.map(isAsym);
        return hits.filter(Boolean).length === 1 && P.texts[hits.indexOf(true)] === q.answer;
      }
      return close(Math.tan(Math.atan2(P.y, P.x)), q.answer, 1e-9);
    },
  });

  A.skill({
    id: 'int3.reciprocal-trig', title: 'Secant, cosecant, and cotangent',
    learn: p(`Three more trig functions are the reciprocals of the first three: <b>sec θ = ${F(1, 'cos θ')}, csc θ = ${F(1, 'sin θ')}, cot θ = ${F(1, 'tan θ')} = ${F('cos θ', 'sin θ')}</b>. Each is undefined where the function on the bottom is zero, so sec 90° and csc 0° do not exist.`) +
      p(`To find an exact value, find the sine, cosine or tangent first, then flip it and tidy any root on the bottom: sec 30° = 1 ÷ ${F(S3, 2)} = ${F(2, S3)} = ${F(`2${S3}`, 3)}. In a right triangle, sec = ${F('hypotenuse', 'adjacent')}, csc = ${F('hypotenuse', 'opposite')} and cot = ${F('adjacent', 'opposite')}.`) +
      p('A reciprocal has the same sign as the function it flips: sec θ is negative wherever cos θ is.') +
      example('Example', `Find csc 210°.${big(`sin 210° = −${F(1, 2)}`)}So csc 210° = 1 ÷ (−${F(1, 2)}) = <b>−2</b>.`),
    make(rng) {
      const kind = rng.pick(['exact', 'exact', 'flip', 'triangle']), fn = rng.pick(['sec', 'csc', 'cot']);
      const base = { sec: 'cos', csc: 'sin', cot: 'tan' }[fn];
      if (kind === 'exact') {
        const dg = rng.pick([0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330]), inRad = rng.chance(0.4);
        const v = TRIG[fn](dg), answer = tvHtml(v), bv = TRIG[base](dg);
        const baseTxt = bv === null ? 'Undefined' : base === 'tan' ? tvHtml(bv) : exactHtml(bv);
        const pool = [v === null ? '0' : tvHtml(-v || 0), baseTxt, v === null ? '1' : 'Undefined', '1', '2', S2, F(`2${S3}`, 3), S3, F(S3, 3)];
        return { prompt: `Find the exact value.${big(`${fn} ${angleTxt(dg, inRad)}`)}`, type: 'choice', choices: options(answer, pool), answer, params: { kind, fn, dg },
          hints: [`${fn} is the reciprocal of ${base}. ${inRad ? `${angleTxt(dg, true)} = ${M.deg(dg)}, and ` : ''}${base} ${M.deg(dg)} ${bv === null ? 'is not defined' : `= ${baseTxt}`}.`,
            v === null ? `${base} ${M.deg(dg)} = 0, and 1 ÷ 0 cannot be done.` : bv === null ? `tan ${M.deg(dg)} is not defined because cos ${M.deg(dg)} = 0, so use cot = cos ÷ sin = 0 ÷ ${exactHtml(Math.sin(rad(dg)))} = 0.` : `Flip it: 1 ÷ ${bv < 0 ? `(${baseTxt})` : baseTxt}${Math.abs(Math.abs(v) - 2 / Math.sqrt(3)) < 1e-9 ? `, and ${F(2, S3)} = ${F(`2${S3}`, 3)}` : Math.abs(Math.abs(v) - 1 / Math.sqrt(3)) < 1e-9 ? `, and ${F(1, S3)} = ${F(S3, 3)}` : Math.abs(Math.abs(v) - Math.SQRT2) < 1e-9 ? `, and ${F(2, S2)} = ${S2}` : ''}.`,
            v === null ? `${fn} ${angleTxt(dg, inRad)} does not exist: <b>${answer}</b>.` : `${fn} ${angleTxt(dg, inRad)} = <b>${answer}</b>.`] };
      }
      if (kind === 'flip') {
        let n = rng.int(1, 9), d = rng.int(2, 9); if (base !== 'tan' && n >= d) [n, d] = [Math.max(1, d - n), d]; [n, d] = M.simp(n, d);
        if (d === 1 || n === 0) return this.make(rng);
        n *= rng.sign();
        return { prompt: `${base} θ = ${F(n, d)}. Find ${fn} θ.`, type: 'number', answer: d / n, answerText: M.fracText(d, n), params: { kind, fn, n, d },
          hints: [`${fn} θ = ${F(1, `${base} θ`)}.`, `1 ÷ ${n < 0 ? `(${F(n, d)})` : F(n, d)} flips the fraction.`, `${fn} θ = <b>${M.fracText(d, n)}</b>.`] };
      }
      const [aa, bb, cc] = rng.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]]);
      const [opp, adj] = rng.bool() ? [aa, bb] : [bb, aa];
      const [n, d] = { sec: [cc, adj], csc: [cc, opp], cot: [adj, opp] }[fn];
      const ratio = { sec: 'hypotenuse ÷ adjacent', csc: 'hypotenuse ÷ opposite', cot: 'adjacent ÷ opposite' }[fn];
      return { prompt: `In right triangle ${V('ABC')}, angle ${V('C')} is the right angle, ${V('BC')} = ${opp}, ${V('AC')} = ${adj} and ${V('AB')} = ${cc}. Find ${fn} ${V('A')}. Give a fraction.`, type: 'number', answer: n / d, answerText: M.fracText(n, d), params: { kind, fn, opp, adj, hyp: cc },
        hints: [`From angle ${V('A')}: the opposite side is ${V('BC')} = ${opp}, the adjacent side is ${V('AC')} = ${adj}, and the hypotenuse is ${V('AB')} = ${cc}.`, `${fn} ${V('A')} = ${ratio} = ${F(n, d, { raw: true })}.`, `${fn} ${V('A')} = <b>${M.fracText(n, d)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'exact') { const s = Math.sin(rad(P.dg)), c = Math.cos(rad(P.dg)); const den = P.fn === 'sec' ? c : s; if (Math.abs(den) < 1e-12) return q.answer === 'Undefined'; return close(tvValue(q.answer), P.fn === 'sec' ? 1 / c : P.fn === 'csc' ? 1 / s : c / s, 1e-9); }
      if (P.kind === 'flip') { const v = P.n / P.d; return close(q.answer * v, 1); }
      const A0 = Math.atan2(P.opp, P.adj);                // the angle itself, from its two legs
      if (!close(Math.hypot(P.opp, P.adj), P.hyp)) return 'not a right triangle';
      return close(q.answer, P.fn === 'sec' ? 1 / Math.cos(A0) : P.fn === 'csc' ? 1 / Math.sin(A0) : 1 / Math.tan(A0), 1e-9);
    },
  });

  /** θ = A ± B with A, B special angles, one of them 45° */
  const SUMDIFF = { 15: [45, 30, -1], 75: [45, 30, 1], 105: [60, 45, 1], 165: [120, 45, 1], 195: [150, 45, 1], 255: [210, 45, 1], 285: [240, 45, 1], 345: [300, 45, 1] };
  const SD_OPTS = [{ v: (Math.sqrt(6) + Math.SQRT2) / 4, h: F(`${S6} + ${S2}`, 4) }, { v: (Math.sqrt(6) - Math.SQRT2) / 4, h: F(`${S6} − ${S2}`, 4) },
    { v: (Math.SQRT2 - Math.sqrt(6)) / 4, h: F(`${S2} − ${S6}`, 4) }, { v: -(Math.sqrt(6) + Math.SQRT2) / 4, h: '−' + F(`${S6} + ${S2}`, 4) }];
  const PYTH = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];
  A.skill({
    id: 'int3.sum-difference-identities', title: 'Angle sum and difference identities',
    learn: p(`<b>sin(${V('A')} ± ${V('B')}) = sin ${V('A')} cos ${V('B')} ± cos ${V('A')} sin ${V('B')}</b> and <b>cos(${V('A')} ± ${V('B')}) = cos ${V('A')} cos ${V('B')} ∓ sin ${V('A')} sin ${V('B')}</b>. Note that the cosine formula flips the sign: cos(${V('A')} + ${V('B')}) has a minus in the middle.`) +
      p(`Use them to find exact values for angles that are sums or differences of special angles: 15° = 45° − 30°, 75° = 45° + 30°, 105° = 60° + 45°. Never split the function: sin(45° + 30°) is not sin 45° + sin 30°.`) +
      p(`They also work with any angles whose sine and cosine you know, such as angles in 3-4-5 or 5-12-13 right triangles.`) +
      example('Example', `${big('sin 15° = sin(45° − 30°) = sin 45° cos 30° − cos 45° sin 30°')}= ${F(S2, 2)} · ${F(S3, 2)} − ${F(S2, 2)} · ${F(1, 2)} = <b>${F(`${S6} − ${S2}`, 4)}</b>.`),
    make(rng) {
      const kind = rng.pick(['exact', 'exact', 'expand', 'triple']);
      if (kind === 'triple') {
        const [t1, t2] = rng.sample(PYTH, 2), fn = rng.pick(['sin', 'cos']), op = rng.pick([1, -1]);
        const sA = t1[0] / t1[2], cA = t1[1] / t1[2], sB = t2[0] / t2[2], cB = t2[1] / t2[2], den = t1[2] * t2[2];
        const num = fn === 'sin' ? t1[0] * t2[1] + op * t1[1] * t2[0] : t1[1] * t2[1] - op * t1[0] * t2[0];
        const giveA = rng.bool() ? `sin ${V('A')} = ${F(t1[0], t1[2])}` : `cos ${V('A')} = ${F(t1[1], t1[2])}`, giveB = rng.bool() ? `sin ${V('B')} = ${F(t2[0], t2[2])}` : `cos ${V('B')} = ${F(t2[1], t2[2])}`;
        const expr = `${fn}(${V('A')} ${op > 0 ? '+' : '−'} ${V('B')})`;
        const form = fn === 'sin' ? `sin ${V('A')} cos ${V('B')} ${op > 0 ? '+' : '−'} cos ${V('A')} sin ${V('B')}` : `cos ${V('A')} cos ${V('B')} ${op > 0 ? '−' : '+'} sin ${V('A')} sin ${V('B')}`;
        const vals = fn === 'sin' ? `${F(t1[0], t1[2])} · ${F(t2[1], t2[2])} ${op > 0 ? '+' : '−'} ${F(t1[1], t1[2])} · ${F(t2[0], t2[2])}` : `${F(t1[1], t1[2])} · ${F(t2[1], t2[2])} ${op > 0 ? '−' : '+'} ${F(t1[0], t1[2])} · ${F(t2[0], t2[2])}`;
        return { prompt: `${V('A')} and ${V('B')} are acute angles with ${giveA} and ${giveB}. Find ${expr}. Give a fraction.`, type: 'number', answer: num / den, answerText: M.fracText(num, den), params: { kind, t1, t2, fn, op },
          hints: [`Find the missing values with right triangles (or sin² + cos² = 1): sin ${V('A')} = ${F(t1[0], t1[2])}, cos ${V('A')} = ${F(t1[1], t1[2])}, sin ${V('B')} = ${F(t2[0], t2[2])}, cos ${V('B')} = ${F(t2[1], t2[2])}.`,
            `${expr} = ${form} = ${vals}.`, `= ${F(num, den, { raw: true })}${M.gcd(num, den) > 1 ? ` = ${M.fracText(num, den)}` : ''}, so the answer is <b>${M.fracText(num, den)}</b>.`] };
      }
      const th = Number(rng.pick(Object.keys(SUMDIFF))), [a, b, sg] = SUMDIFF[th], fn = rng.pick(['sin', 'cos']);
      const o = sg > 0 ? '+' : '−';
      const right = fn === 'sin' ? `sin ${M.deg(a)} cos ${M.deg(b)} ${o} cos ${M.deg(a)} sin ${M.deg(b)}` : `cos ${M.deg(a)} cos ${M.deg(b)} ${sg > 0 ? '−' : '+'} sin ${M.deg(a)} sin ${M.deg(b)}`;
      if (kind === 'expand') {
        const wrong = fn === 'sin' ? [`sin ${M.deg(a)} cos ${M.deg(b)} ${sg > 0 ? '−' : '+'} cos ${M.deg(a)} sin ${M.deg(b)}`, `cos ${M.deg(a)} cos ${M.deg(b)} ${sg > 0 ? '−' : '+'} sin ${M.deg(a)} sin ${M.deg(b)}`, `sin ${M.deg(a)} ${o} sin ${M.deg(b)}`]
          : [`cos ${M.deg(a)} cos ${M.deg(b)} ${o} sin ${M.deg(a)} sin ${M.deg(b)}`, `sin ${M.deg(a)} cos ${M.deg(b)} ${o} cos ${M.deg(a)} sin ${M.deg(b)}`, `cos ${M.deg(a)} ${o} cos ${M.deg(b)}`];
        return { prompt: `Which expression is equal to ${fn} ${M.deg(th)}?`, type: 'choice', choices: options(right, wrong), answer: right, params: { kind, th, fn, a, b, sg, texts: [right].concat(wrong) },
          hints: [`Write ${M.deg(th)} = ${M.deg(a)} ${o} ${M.deg(b)}.`, fn === 'sin' ? `The sine formula keeps the sign: sin(${V('A')} ${o} ${V('B')}) = sin ${V('A')} cos ${V('B')} ${o} cos ${V('A')} sin ${V('B')}.` : `The cosine formula flips the sign: cos(${V('A')} ${o} ${V('B')}) = cos ${V('A')} cos ${V('B')} ${sg > 0 ? '−' : '+'} sin ${V('A')} sin ${V('B')}.`, `<b>${right}</b>`] };
      }
      const val = fn === 'sin' ? Math.sin(rad(th)) : Math.cos(rad(th)), answer = SD_OPTS.find(e => close(e.v, val, 1e-9)).h;
      const ex = d => [exactHtml(Math.sin(rad(d))), exactHtml(Math.cos(rad(d)))];
      const [sa, ca] = ex(a), [sb, cb] = ex(b), par = h => h.startsWith('−') ? `(${h})` : h;
      const nums = fn === 'sin' ? `${par(sa)} · ${par(cb)} ${o} ${par(ca)} · ${par(sb)}` : `${par(ca)} · ${par(cb)} ${sg > 0 ? '−' : '+'} ${par(sa)} · ${par(sb)}`;
      return { prompt: `Find the exact value.${big(`${fn} ${M.deg(th)}`)}`, type: 'choice', choices: SD_OPTS.map(e => e.h), answer, params: { kind, th, fn },
        hints: [`Write ${M.deg(th)} = ${M.deg(a)} ${o} ${M.deg(b)}, two angles with known values.`, `${fn}(${M.deg(a)} ${o} ${M.deg(b)}) = ${right} = ${nums}.`, `Multiply and combine over 4: ${fn} ${M.deg(th)} = <b>${answer}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'triple') {
        const A0 = Math.asin(P.t1[0] / P.t1[2]), B0 = Math.asin(P.t2[0] / P.t2[2]), t = A0 + P.op * B0;
        return close(q.answer, P.fn === 'sin' ? Math.sin(t) : Math.cos(t), 1e-9);
      }
      const f = P.fn === 'sin' ? Math.sin : Math.cos;
      if (P.kind === 'expand') {
        // evaluate every option numerically: only the right one equals the function of the whole angle
        const term = t => { const w = t.split(' '); let v = 1; for (let i = 0; i < w.length; i += 2) v *= (w[i] === 'sin' ? Math.sin : Math.cos)(rad(Number(w[i + 1]))); return v; };
        const val = s => { const parts = A.stripTags(s).replace(/°/g, '').replace(/\s+/g, ' ').trim().split(/ ([+−]) /); let v = term(parts[0]); for (let i = 1; i < parts.length; i += 2) v += (parts[i] === '+' ? 1 : -1) * term(parts[i + 1]); return v; };
        const hits = P.texts.map(s => close(val(s), f(rad(P.th)), 1e-9));
        return hits.filter(Boolean).length === 1 && hits[0] && q.answer === P.texts[0];
      }
      const t = A.stripTags(q.answer).replace(/\s+/g, '');
      const num = { '√6+√24': (Math.sqrt(6) + Math.sqrt(2)) / 4, '√6−√24': (Math.sqrt(6) - Math.sqrt(2)) / 4, '√2−√64': (Math.sqrt(2) - Math.sqrt(6)) / 4, '−√6+√24': -(Math.sqrt(6) + Math.sqrt(2)) / 4 }[t];
      return close(num, f(rad(P.th)), 1e-9);
    },
  });

  const SSA_OPTS = ['No triangle', 'Exactly one triangle', 'Two triangles'];
  /** the positive values of c with a² = b² + c² − 2bc cos A (the law of cosines, solved for c) */
  const ssaSides = (Ad, a, b) => { const ca = Math.cos(rad(Ad)), D = b * b * ca * ca - (b * b - a * a); if (D < -1e-7) return []; const r = Math.abs(D) < 1e-7 ? 0 : Math.sqrt(D); return [...new Set([b * ca - r, b * ca + r].map(c => M.round(c, 9)))].filter(c => c > 1e-9); };
  A.skill({
    id: 'int3.ambiguous-case', title: 'The ambiguous case (SSA)',
    learn: p(`Knowing two sides and an angle <b>not</b> between them (SSA) may give no triangle, one, or two. Suppose you know angle ${V('A')}, the side ${V('a')} opposite it, and another side ${V('b')}. Side ${V('a')} swings from the end of ${V('b')}, and the question is how many times it can reach the third side.`) +
      p(`<b>When ${V('A')} is acute, compare ${V('a')} with the height ${V('h')} = ${V('b')} sin ${V('A')}:</b> if ${V('a')} &lt; ${V('h')} there is no triangle; if ${V('a')} = ${V('h')}, one right triangle; if ${V('h')} &lt; ${V('a')} &lt; ${V('b')}, two triangles; if ${V('a')} ≥ ${V('b')}, one. <b>When ${V('A')} is obtuse</b>, there is one triangle if ${V('a')} &gt; ${V('b')} and none otherwise.`) +
      p(`In the two-triangle case, the law of sines gives sin ${V('B')}, and both ${V('B')} and 180° − ${V('B')} work, because sine is positive in quadrants 1 and 2.`) +
      example('Example', `${V('A')} = 30°, ${V('a')} = 6, ${V('b')} = 10.${big(`${V('h')} = 10 sin 30° = 5`)}5 &lt; 6 &lt; 10, so there are <b>two triangles</b>: sin ${V('B')} = ${F('10 sin 30°', 6)} ≈ 0.833 gives ${V('B')} ≈ 56.4° or 123.6°.`),
    make(rng) {
      const kind = rng.pick(['count', 'count', 'count', 'angle', 'side']);
      if (kind === 'count') {
        const want = rng.int(0, 2);
        let Ad, a, b, h, ok = false, tries = 0;
        while (!ok && tries++ < 200) {
          const obtuse = want < 2 && rng.chance(0.3);
          Ad = obtuse ? rng.int(100, 140) : rng.int(20, 70); b = rng.int(6, 20); h = b * Math.sin(rad(Ad));
          if (obtuse) { a = want === 0 ? rng.int(3, b) : rng.int(b + 1, b + 8); ok = true; }
          else if (want === 1 && rng.chance(0.25)) { Ad = 30; b = 2 * rng.int(3, 10); a = b / 2; h = a; ok = true; }
          else if (want === 1) { a = rng.int(b, b + 8); ok = true; }
          else if (want === 0) { const top = Math.ceil(h - 0.5) - 1; if (top >= 2) { a = rng.int(2, top); ok = true; } }
          else { const lo = Math.floor(h + 0.5) + 1, hi = b - 1; if (lo <= hi) { a = rng.int(lo, hi); ok = true; } }
        }
        const answer = SSA_OPTS[want], acute = Ad < 90;
        return { prompt: `In triangle ${V('ABC')}, ${V('A')} = ${Ad}°, ${V('a')} = ${a} and ${V('b')} = ${b}. How many triangles have these measurements?`, type: 'choice', choices: SSA_OPTS.slice(), answer, keepOrder: true, params: { kind, Ad, a, b },
          hints: [acute ? `${V('A')} is acute, so find the height: ${V('h')} = ${V('b')} sin ${V('A')} = ${b} sin ${Ad}° ≈ ${N(r2(h))}.` : `${V('A')} is obtuse, so it must be the largest angle, and ${V('a')} must be the longest side: compare ${V('a')} = ${a} with ${V('b')} = ${b}.`,
            acute ? (want === 0 ? `${V('a')} = ${a} is shorter than the height, so it cannot reach the third side.` : want === 2 ? `${N(r2(h))} &lt; ${a} &lt; ${b}: ${V('a')} is longer than the height but shorter than ${V('b')}, so it can reach the third side in two places.` : a === h ? `${V('a')} equals the height exactly, so it meets the third side at a right angle, once.` : `${V('a')} = ${a} is at least as long as ${V('b')} = ${b}, so only one of its crossings lands on the correct side of ${V('A')}.`)
              : (want === 0 ? `${V('a')} is not longer than ${V('b')}, so no triangle is possible.` : `${V('a')} is longer than ${V('b')}, so exactly one triangle works.`),
            `<b>${answer}</b>.`] };
      }
      let Ad, a, b, h;
      do { Ad = rng.int(25, 65); b = rng.int(8, 20); h = b * Math.sin(rad(Ad)); a = Math.floor(h) + 1 <= b - 1 ? rng.int(Math.floor(h) + 1, b - 1) : 0; } while (!(a > h + 0.5 && a < b - 0.5));
      const sB = b * Math.sin(rad(Ad)) / a, B1 = degOf(Math.asin(sB)), B2 = 180 - B1;
      if (kind === 'angle') {
        const big2 = rng.bool(), ans = r1(big2 ? B2 : B1);
        return { prompt: `In triangle ${V('ABC')}, ${V('A')} = ${Ad}°, ${V('a')} = ${a} and ${V('b')} = ${b}. Two triangles fit these measurements. Find the ${big2 ? 'obtuse' : 'acute'} value of angle ${V('B')}. Round to the nearest tenth of a degree.`, type: 'number', answer: ans, unit: '°', tolerance: 0.05, params: { kind, Ad, a, b, big: big2 },
          hints: [`Law of sines: sin ${V('B')} = ${F(`${b} sin ${Ad}°`, a)} ≈ ${N(M.round(sB, 4))}.`, `${M.sup('sin', '−1')}(${N(M.round(sB, 4))}) ≈ ${N(r1(B1))}°. The other angle with the same sine is 180° − ${N(r1(B1))}° ≈ ${N(r1(B2))}°.`, `The ${big2 ? 'obtuse' : 'acute'} value is ${V('B')} ≈ <b>${N(ans)}°</b>.`] };
      }
      const C2 = 180 - Ad - B2, c2 = a * Math.sin(rad(C2)) / Math.sin(rad(Ad)), C1 = 180 - Ad - B1, c1 = a * Math.sin(rad(C1)) / Math.sin(rad(Ad));
      const shortSide = rng.bool(), ans = r1(shortSide ? c2 : c1);
      return { prompt: `In triangle ${V('ABC')}, ${V('A')} = ${Ad}°, ${V('a')} = ${a} and ${V('b')} = ${b}. Two triangles fit these measurements. Find the ${shortSide ? 'shorter' : 'longer'} possible length of side ${V('c')}. Round to the nearest tenth.`, type: 'number', answer: ans, tolerance: 0.05, params: { kind, Ad, a, b, shortSide },
        hints: [`Law of sines: sin ${V('B')} = ${F(`${b} sin ${Ad}°`, a)} ≈ ${N(M.round(sB, 4))}, so ${V('B')} ≈ ${N(r1(B1))}° or ${N(r1(B2))}°.`, `Then ${V('C')} = 180° − ${Ad}° − ${V('B')} ≈ ${N(r1(C1))}° or ${N(r1(C2))}°, and ${V('c')} = ${F(`${a} sin ${V('C')}`, `sin ${Ad}°`)} ≈ ${N(r1(c1))} or ${N(r1(c2))}.`, `The ${shortSide ? 'shorter' : 'longer'} length is <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params, cs = ssaSides(P.Ad, P.a, P.b);
      if (P.kind === 'count') return q.answer === SSA_OPTS[cs.length];
      if (cs.length !== 2) return 'expected two triangles';
      if (P.kind === 'side') return Math.abs((P.shortSide ? Math.min(...cs) : Math.max(...cs)) - q.answer) <= 0.05 + 1e-9;
      // angle B from the law of cosines in each triangle
      const Bs = cs.map(c => degOf(Math.acos((P.a * P.a + c * c - P.b * P.b) / (2 * P.a * c))));
      return Math.abs((P.big ? Math.max(...Bs) : Math.min(...Bs)) - q.answer) <= 0.05 + 1e-9;
    },
  });

  /* ---------- Unit 14: Induction and the binomial theorem ---------- */
  const KK = V('k'), NN = V('n');
  const k1 = `(${KK} + 1)`;
  /** sum formulas for induction: the left side, the right side, the (k + 1)th term and the target, each with a number version for checking */
  const INDUCT = [
    { lhs: v => `1 + 2 + 3 + … + ${v}`, rhs: v => F(`${v}(${v} + 1)`, 2), term: k => k, sum: n => n * (n + 1) / 2,
      next: [F(`${k1}(${KK} + 2)`, 2), k => (k + 1) * (k + 2) / 2], badNext: [[`${F(`${KK}(${KK} + 1)`, 2)} + 1`, k => k * (k + 1) / 2 + 1], [F(`${k1}${KK}`, 2), k => (k + 1) * k / 2], [F(`${KK}(${KK} + 2)`, 2), k => k * (k + 2) / 2]],
      add: [`${KK} + 1`, k => k + 1], badAdd: [[KK, k => k], [`${KK} + 2`, k => k + 2], [`2${KK} + 1`, k => 2 * k + 1]] },
    { lhs: v => `1 + 3 + 5 + … + (2${v} − 1)`, rhs: v => M.sup(v, 2), term: k => 2 * k - 1, sum: n => n * n,
      next: [M.sup(k1, 2), k => (k + 1) ** 2], badNext: [[`${M.sup(KK, 2)} + 1`, k => k * k + 1], [M.sup(`(${KK} + 2)`, 2), k => (k + 2) ** 2], [`${M.sup(KK, 2)} + ${KK}`, k => k * k + k]],
      add: [`2${KK} + 1`, k => 2 * k + 1], badAdd: [[`2${KK} − 1`, k => 2 * k - 1], [`2${KK}`, k => 2 * k], [`2${KK} + 3`, k => 2 * k + 3]] },
    { lhs: v => `2 + 4 + 6 + … + 2${v}`, rhs: v => `${v}(${v} + 1)`, term: k => 2 * k, sum: n => n * (n + 1),
      next: [`${k1}(${KK} + 2)`, k => (k + 1) * (k + 2)], badNext: [[`${KK}(${KK} + 1) + 2`, k => k * (k + 1) + 2], [M.sup(k1, 2), k => (k + 1) ** 2], [`${KK}(${KK} + 2)`, k => k * (k + 2)]],
      add: [`2${KK} + 2`, k => 2 * k + 2], badAdd: [[`2${KK}`, k => 2 * k], [`2${KK} + 1`, k => 2 * k + 1], [`${KK} + 1`, k => k + 1]] },
    { lhs: v => `1 + 2 + 4 + … + ${M.sup(2, `${v} − 1`)}`, rhs: v => `${M.sup(2, v)} − 1`, term: k => 2 ** (k - 1), sum: n => 2 ** n - 1,
      next: [`${M.sup(2, `${KK} + 1`)} − 1`, k => 2 ** (k + 1) - 1], badNext: [[`${M.sup(2, KK)} + 1`, k => 2 ** k + 1], [`2(${M.sup(2, KK)} − 1)`, k => 2 * (2 ** k - 1)], [`${M.sup(2, `${KK} + 1`)} + 1`, k => 2 ** (k + 1) + 1]],
      add: [M.sup(2, KK), k => 2 ** k], badAdd: [[M.sup(2, `${KK} − 1`), k => 2 ** (k - 1)], [M.sup(2, `${KK} + 1`), k => 2 ** (k + 1)], [`2${KK}`, k => 2 * k]] },
    { lhs: v => `1² + 2² + 3² + … + ${M.sup(v, 2)}`, rhs: v => F(`${v}(${v} + 1)(2${v} + 1)`, 6), term: k => k * k, sum: n => n * (n + 1) * (2 * n + 1) / 6,
      next: [F(`${k1}(${KK} + 2)(2${KK} + 3)`, 6), k => (k + 1) * (k + 2) * (2 * k + 3) / 6], badNext: [[F(`${k1}(${KK} + 2)(2${KK} + 1)`, 6), k => (k + 1) * (k + 2) * (2 * k + 1) / 6], [`${F(`${KK}(${KK} + 1)(2${KK} + 1)`, 6)} + 1`, k => k * (k + 1) * (2 * k + 1) / 6 + 1], [F(`${k1}(${KK} + 2)(2${KK} + 2)`, 6), k => (k + 1) * (k + 2) * (2 * k + 2) / 6]],
      add: [M.sup(k1, 2), k => (k + 1) ** 2], badAdd: [[M.sup(KK, 2), k => k * k], [`${M.sup(KK, 2)} + 1`, k => k * k + 1], [M.sup(`(${KK} + 2)`, 2), k => (k + 2) ** 2]] },
    { lhs: v => `1 + 4 + 7 + … + (3${v} − 2)`, rhs: v => F(`${v}(3${v} − 1)`, 2), term: k => 3 * k - 2, sum: n => n * (3 * n - 1) / 2,
      next: [F(`${k1}(3${KK} + 2)`, 2), k => (k + 1) * (3 * k + 2) / 2], badNext: [[F(`${k1}(3${KK} − 1)`, 2), k => (k + 1) * (3 * k - 1) / 2], [`${F(`${KK}(3${KK} − 1)`, 2)} + 1`, k => k * (3 * k - 1) / 2 + 1], [F(`${k1}(3${KK} + 3)`, 2), k => (k + 1) * (3 * k + 3) / 2]],
      add: [`3${KK} + 1`, k => 3 * k + 1], badAdd: [[`3${KK} − 2`, k => 3 * k - 2], [`3${KK} − 1`, k => 3 * k - 1], [`3${KK} + 4`, k => 3 * k + 4]] },
    { lhs: v => `3 + 9 + 27 + … + ${M.sup(3, v)}`, rhs: v => F(`${M.sup(3, `${v} + 1`)} − 3`, 2), term: k => 3 ** k, sum: n => (3 ** (n + 1) - 3) / 2,
      next: [F(`${M.sup(3, `${KK} + 2`)} − 3`, 2), k => (3 ** (k + 2) - 3) / 2], badNext: [[F(`${M.sup(3, `${KK} + 2`)} − 1`, 2), k => (3 ** (k + 2) - 1) / 2], [F(`${M.sup(3, `${KK} + 1`)} − 2`, 2), k => (3 ** (k + 1) - 2) / 2], [F(M.sup(3, `${KK} + 2`), 2), k => 3 ** (k + 2) / 2]],
      add: [M.sup(3, `${KK} + 1`), k => 3 ** (k + 1)], badAdd: [[M.sup(3, KK), k => 3 ** k], [M.sup(3, `${KK} + 2`), k => 3 ** (k + 2)], [`3${KK} + 3`, k => 3 * k + 3]] },
  ];
  const STEP_ORDER = [[0, 1, 2, 3], [1, 0, 2, 3], [0, 2, 1, 3], [1, 2, 3, 0]];
  A.skill({
    id: 'int3.induction', title: 'Proof by mathematical induction',
    learn: p(`<b>Mathematical induction</b> proves that a statement is true for every whole number ${NN} ≥ 1, in two steps. <b>Base case:</b> show it is true for ${NN} = 1. <b>Inductive step:</b> assume it is true for some ${NN} = ${KK}, and use that to show it is true for ${NN} = ${KK} + 1. Then it is true for 1, so for 2, so for 3, and so on, like a row of falling dominoes.`) +
      p(`For a sum formula, the inductive step goes like this: start from the assumed formula for ${KK}, <b>add the next term, the (${KK} + 1)th, to both sides</b>, and simplify the right side until it is the formula with ${KK} + 1 in place of ${NN}.`) +
      p('Checking a few values of n is not a proof, but it is a good way to test the formula and to see the base case.') +
      example('Example', `Prove 1 + 3 + 5 + … + (2${NN} − 1) = ${M.sup(NN, 2)}.${big(`Base: 1 = 1². &nbsp; Step: assume 1 + 3 + … + (2${KK} − 1) = ${M.sup(KK, 2)}.`)}Add the next term, 2${KK} + 1, to both sides: ${M.sup(KK, 2)} + 2${KK} + 1 = <b>${M.sup(k1, 2)}</b>, the formula for ${KK} + 1. So it holds for every ${NN} ≥ 1.`),
    make(rng) {
      const f = rng.int(0, INDUCT.length - 1), I = INDUCT[f], kind = rng.pick(['order', 'show', 'show', 'term', 'check']);
      const claim = `${I.lhs(NN)} = ${I.rhs(NN)}`;
      if (kind === 'check') {
        const m = rng.int(3, 6);
        const terms = []; for (let j = 1; j <= m; j++) terms.push(I.term(j));
        return { prompt: `Test the formula for ${NN} = ${m}. What number do both sides equal?${big(claim)}`, type: 'number', answer: I.sum(m), params: { kind, f, m },
          hints: [`The left side, up to the term for ${NN} = ${m}, is ${terms.join(' + ')}.`, `That adds to ${I.sum(m)}. Substitute ${NN} = ${m} into the right side and check it matches.`, `Both sides equal <b>${I.sum(m)}</b>.`] };
      }
      if (kind === 'order') {
        const steps = [`Check ${NN} = 1: both sides equal ${I.sum(1)}.`, `Assume ${I.lhs(KK)} = ${I.rhs(KK)} for some ${KK} ≥ 1.`, `Add ${I.add[0]} to both sides and show the right side becomes ${I.next[0]}.`, `Conclude the formula is true for every whole number ${NN} ≥ 1.`];
        const letters = rng.shuffle(['A', 'B', 'C', 'D']);                     // letters[i] labels step i
        const listed = ['A', 'B', 'C', 'D'].map(L => `<p><b>${L}.</b> ${steps[letters.indexOf(L)]}</p>`).join('');
        const texts = STEP_ORDER.map(o => o.map(i => letters[i]).join(', '));
        return { prompt: `These are the steps of a proof by induction of the formula below, out of order. Which order is correct?${big(claim)}${listed}`, type: 'choice', choices: texts.slice(), answer: texts[0], params: { kind, f, letters, texts },
          hints: ['An induction proof starts with the base case, the smallest value of n.', `Next comes the assumption for ${NN} = ${KK}, then the step that uses it to reach ${NN} = ${KK} + 1, and finally the conclusion.`, `The order is <b>${texts[0]}</b>.`] };
      }
      const assume = `${I.lhs(KK)} = ${I.rhs(KK)}`;
      if (kind === 'term') {
        const answer = I.add[0];
        return { prompt: `You are proving the formula below by induction. In the inductive step you assume<br>${big(assume)}What term do you add to both sides to reach ${NN} = ${KK} + 1?`, type: 'choice', choices: options(answer, I.badAdd.map(b => b[0])), answer, params: { kind, f },
          hints: [`The next term is the pattern’s term for ${NN} = ${KK} + 1, not for ${KK}.`, `Substitute ${KK} + 1 for ${NN} in the last term, ${I.lhs(NN).split(' + ').pop()}, and simplify.`, `The term to add is <b>${answer}</b>.`] };
      }
      const answer = I.next[0];
      return { prompt: `You are proving the formula below by induction, and you assume it is true for ${NN} = ${KK}. After adding the next term, ${I.add[0]}, to both sides, which expression must the right side equal?${big(claim)}`, type: 'choice', choices: options(answer, I.badNext.map(b => b[0])), answer, params: { kind, f },
        hints: [`To finish the inductive step you must reach the formula itself with ${NN} = ${KK} + 1.`, `Replace every ${NN} in ${I.rhs(NN)} by ${KK} + 1, then simplify.`, `The right side must equal <b>${answer}</b>.`] };
    },
    verify(q) {
      const P = q.params, I = INDUCT[P.f];
      // the formula itself must hold: brute-force sums for n = 1 … 12
      for (let n = 1, s = 0; n <= 12; n++) { s += I.term(n); if (!close(s, I.sum(n))) return `the formula fails at n = ${n}`; }
      if (P.kind === 'check') { let s = 0; for (let j = 1; j <= P.m; j++) s += I.term(j); return s === q.answer; }
      if (P.kind === 'order') return q.answer === P.texts[0] && P.texts[0] === [0, 1, 2, 3].map(i => P.letters[i]).join(', ');
      const ks = [1, 2, 3, 4, 5, 7];
      const [right, wrong, want] = P.kind === 'term' ? [I.add, I.badAdd, k => I.term(k + 1)] : [I.next, I.badNext, k => I.sum(k + 1)];
      if (!ks.every(k => close(right[1](k), want(k)))) return 'the shown answer does not equal the target';
      if (wrong.some(([, g]) => ks.every(k => close(g(k), want(k))))) return 'a distractor is also right';
      return q.answer === right[0];
    },
  });

  const nCk = (n, k) => { let c = 1; for (let i = 1; i <= k; i++) c = c * (n - k + i) / i; return Math.round(c); };
  const Cn = (n, k) => `<sub>${n}</sub>C<sub>${k}</sub>`;
  A.skill({
    id: 'int3.binomial-theorem', title: 'Pascal’s triangle and the binomial theorem',
    learn: p(`<b>The binomial theorem:</b> (${V('a')} + ${V('b')})<sup>${NN}</sup> = the sum of ${Cn(NN, KK)} ${M.sup(V('a'), `${NN} − ${KK}`)}${M.sup(V('b'), KK)} for ${KK} = 0 to ${NN}. The coefficients ${Cn(NN, KK)} are the numbers in row ${NN} of <b>Pascal’s triangle</b> (1; 1 1; 1 2 1; 1 3 3 1; 1 4 6 4 1; …), where each number is the sum of the two above it.`) +
      p(`For a term such as ${M.sup(X, 2)} in (2${X} − 3)<sup>5</sup>, use ${V('a')} = 2${X} and ${V('b')} = −3. <b>The coefficient is ${Cn(NN, KK)} times the powers of both numbers</b>: the powers of ${V('a')} and ${V('b')} always add to ${NN}. Keep the sign of ${V('b')}: a negative number to an odd power is negative.`) +
      example('Example', `Find the coefficient of ${M.sup(X, 2)} in (2${X} − 3)<sup>5</sup>.${big(`${Cn(5, 3)} (2${X})² (−3)³ = 10 × 4${M.sup(X, 2)} × (−27)`)}The coefficient is <b>−1,080</b>.`),
    make(rng) {
      const kind = rng.pick(['coef', 'coef', 'pascal', 'expand']);
      if (kind === 'pascal') {
        const n = rng.int(5, 10), k = rng.int(2, n - 2);
        return { prompt: `In the expansion of (${V('a')} + ${V('b')})<sup>${n}</sup>, what is the coefficient of ${M.sup(V('a'), n - k)}${M.sup(V('b'), k)}?`, type: 'number', answer: nCk(n, k), params: { kind, n, k, pp: 1, qq: 1, j: n - k },
          hints: [`The coefficient of ${M.sup(V('a'), n - k)}${M.sup(V('b'), k)} is ${Cn(n, k)}, the number of ways to choose ${V('b')} from ${k} of the ${n} factors.`, `${Cn(n, k)} = ${F(`${n}!`, `${k}! · ${n - k}!`)}, or read entry ${k} of row ${n} of Pascal’s triangle (counting from 0).`, `The coefficient is <b>${nCk(n, k)}</b>.`] };
      }
      if (kind === 'expand') {
        const n = rng.pick([3, 4]), qq = rng.nz(-3, 3);
        const right = [], noC = [], alt = [];
        for (let j = 0; j <= n; j++) { right.push(nCk(n, j) * qq ** j); noC.push(qq ** j); alt.push(nCk(n, j) * Math.abs(qq) ** j * (qq > 0 ? (j % 2 ? -1 : 1) : 1)); }
        const ends = [1].concat(new Array(n - 1).fill(0), [qq ** n]);
        const answer = M.poly(right), wrong = [M.poly(ends), M.poly(noC), M.poly(alt), M.poly(right.map((c, j) => j === 0 || j === n ? c : c / nCk(n, j) * n))];
        return { prompt: `Expand.${big(`(${X} ${M.signed(qq)})<sup>${n}</sup>`)}`, type: 'choice', choices: options(answer, wrong), answer, params: { kind, n, pp: 1, qq, j: null },
          hints: [`Row ${n} of Pascal’s triangle is ${[...Array(n + 1).keys()].map(j => nCk(n, j)).join(', ')}.`, `Each term is (row number) × ${M.sup(X, `${n} − ${KK}`)} × ${pw(qq)}<sup>${KK}</sup>, for ${KK} = 0 to ${n}.`, `<b>${answer}</b>`] };
      }
      const n = rng.int(3, 6), pp = rng.pick([1, 2, 3]), qq = rng.nz(-4, 4), j = rng.int(1, n - 1);
      const c = nCk(n, n - j) * pp ** j * qq ** (n - j);
      const base = `(${pp === 1 ? X : `${pp}${X}`} ${M.signed(qq)})<sup>${n}</sup>`;
      return { prompt: `What is the coefficient of ${j === 1 ? X : M.sup(X, j)} in the expansion of ${base}?`, type: 'number', answer: c, params: { kind, n, pp, qq, j },
        hints: [`In the ${j === 1 ? X : M.sup(X, j)} term, ${pp === 1 ? X : `${pp}${X}`} is raised to the power ${j} and ${N(qq)} to the power ${n - j}, since the powers add to ${n}: ${Cn(n, n - j)} (${pp === 1 ? X : `${pp}${X}`})<sup>${j}</sup> (${N(qq)})<sup>${n - j}</sup>.`,
          `${Cn(n, n - j)} = ${nCk(n, n - j)}${pp === 1 ? '' : `, ${pp}<sup>${j}</sup> = ${pp ** j}`} and (${N(qq)})<sup>${n - j}</sup> = ${N(qq ** (n - j))}.`, `${nCk(n, n - j)} × ${pp ** j} × ${pw(qq ** (n - j))} = <b>${N(c)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      let prod = [1]; for (let i = 0; i < P.n; i++) prod = pmul(prod, [P.pp, P.qq]);          // multiply the brackets out one at a time
      if (P.kind === 'expand') return q.answer === M.poly(prod);
      return prod[P.n - P.j] === q.answer;
    },
  });

  const BINOM_CTX = [
    { setup: (nm, n, pc) => `${nm} makes ${pc}% of free throws and takes ${n} shots.`, ps: [60, 70, 75, 80, 90], ev: k => `exactly ${k} of the shots go in`, one: 'a shot goes in', any: 'at least one shot goes in' },
    { setup: (nm, n, pc) => `${nm} guesses every answer on a ${n}-question quiz. Each question has ${pc === 25 ? 'four' : 'five'} choices.`, ps: [20, 25], ev: k => `exactly ${k} answers are right`, one: 'a guess is right', any: 'at least one answer is right' },
    { setup: (nm, n, pc) => `${nm} plants ${n} seeds. Each seed sprouts with probability ${N(pc / 100)}.`, ps: [60, 70, 80, 90], ev: k => `exactly ${k} seeds sprout`, one: 'a seed sprouts', any: 'at least one seed sprouts' },
    { setup: (nm, n, pc) => `A machine makes parts, and ${pc}% of them are faulty. ${nm} checks ${n} parts.`, ps: [5, 10, 20], ev: k => `exactly ${k} of the parts are faulty`, one: 'a part is faulty', any: 'at least one part is faulty' },
  ];
  A.skill({
    id: 'int3.binomial-probability', title: 'Binomial probability',
    learn: p(`A <b>binomial setting</b> has a fixed number ${NN} of independent trials, each a success with the same probability ${V('p')}. The chance of exactly ${KK} successes is <b>P(${KK}) = ${Cn(NN, KK)} ${M.sup(V('p'), KK)} (1 − ${V('p')})<sup>${NN} − ${KK}</sup></b>.`) +
      p(`${M.sup(V('p'), KK)}(1 − ${V('p')})<sup>${NN} − ${KK}</sup> is the chance of one particular order of ${KK} successes and ${NN} − ${KK} failures, and ${Cn(NN, KK)} counts how many orders there are. For “at least one”, use the complement: P(at least 1) = 1 − P(0) = 1 − (1 − ${V('p')})<sup>${NN}</sup>.`) +
      example('Example', `A player makes 70% of free throws and takes 5. P(exactly 4)?${big(`${Cn(5, 4)} (0.7)<sup>4</sup> (0.3)<sup>1</sup> = 5 × 0.2401 × 0.3`)}≈ <b>0.360</b>.`),
    make(rng) {
      const C = rng.pick(BINOM_CTX), pc = rng.pick(C.ps), pr = pc / 100, n = rng.int(4, 8), nm = rng.pick(NAMES), kind = rng.pick(['exact', 'exact', 'atleast', 'setup']);
      const q1 = M.round(1 - pr, 2);
      if (kind === 'setup') {
        const k = rng.int(1, n - 1), pp = N(pr), qp = N(q1);
        const answer = `${Cn(n, k)} (${pp})<sup>${k}</sup> (${qp})<sup>${n - k}</sup>`;
        const wrong = [`(${pp})<sup>${k}</sup> (${qp})<sup>${n - k}</sup>`, `${Cn(n, k)} (${pp})<sup>${n - k}</sup> (${qp})<sup>${k}</sup>`, `${Cn(n, k)} (${pp})<sup>${k}</sup>`];
        return { prompt: `${C.setup(nm, n, pc)} Which expression gives the probability that ${C.ev(k)}?`, type: 'choice', choices: options(answer, wrong), answer, params: { kind, n, k, pr },
          hints: [`Each of the ${n} trials is independent with P(success) = ${pp}, where success means ${C.one}.`, `One order of ${k} successes and ${n - k} failures has probability (${pp})<sup>${k}</sup>(${qp})<sup>${n - k}</sup>, and there are ${Cn(n, k)} orders.`, `<b>${answer}</b>`] };
      }
      if (kind === 'atleast') {
        const ans = M.round(1 - q1 ** n, 3);
        return { prompt: `${C.setup(nm, n, pc)} What is the probability that ${C.any}? Round to the nearest thousandth.`, type: 'number', answer: ans, tolerance: 0.0005, params: { kind, n, pr, k: null },
          hints: [`“At least one” is everything except “none”. P(none) = (${N(q1)})<sup>${n}</sup> ≈ ${N(M.round(q1 ** n, 5))}.`, `P(at least one) = 1 − ${N(M.round(q1 ** n, 5))}.`, `≈ <b>${N(ans)}</b>.`] };
      }
      let k = rng.int(1, n - 1); const pk = j => nCk(n, j) * pr ** j * q1 ** (n - j);
      if (pk(k) < 0.01) k = Math.round(n * pr) || 1;
      const ans = M.round(pk(k), 3);
      return { prompt: `${C.setup(nm, n, pc)} What is the probability that ${C.ev(k)}? Round to the nearest thousandth.`, type: 'number', answer: ans, tolerance: 0.0005, params: { kind, n, k, pr },
        hints: [`Use P = ${Cn(n, k)} (${N(pr)})<sup>${k}</sup> (${N(q1)})<sup>${n - k}</sup>.`, `${Cn(n, k)} = ${nCk(n, k)}, (${N(pr)})<sup>${k}</sup> ≈ ${N(M.round(pr ** k, 6))} and (${N(q1)})<sup>${n - k}</sup> ≈ ${N(M.round(q1 ** (n - k), 6))}.`, `Multiply: ≈ <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      // list every one of the 2ⁿ success/failure patterns and add up the matching ones
      let exact = 0, none = 0;
      for (let m = 0; m < 2 ** P.n; m++) {
        let s = 0, pr = 1; for (let i = 0; i < P.n; i++) { if (m >> i & 1) { s++; pr *= P.pr; } else pr *= 1 - P.pr; }
        if (s === P.k) exact += pr; if (s === 0) none += pr;
      }
      if (P.kind === 'setup') return q.answer.startsWith(Cn(P.n, P.k)) && close(nCk(P.n, P.k) * P.pr ** P.k * (1 - P.pr) ** (P.n - P.k), exact, 1e-9) && q.answer.includes(`(${N(P.pr)})<sup>${P.k}</sup>`);
      return Math.abs((P.kind === 'atleast' ? 1 - none : exact) - q.answer) <= 0.0005 + 1e-9;
    },
  });

  /* ---------- Unit 15: Three dimensions and three-variable systems ---------- */
  const Y = V('y'), Z = V('z');
  const pt3 = (x, y, z) => `(${N(x)}, ${N(y)}, ${N(z)})`;
  /** a picture of the box from the origin to (a, b, c): x comes toward you, y goes right, z goes up */
  function box3d(a, b, c) {
    const P = (x, y, z) => [M.round(100 + 22 * y - 9 * x, 1), M.round(175 - 20 * z + 7 * x, 1)];
    const seg = (p1, p2, cls) => `<line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}" ${cls}/>`;
    let s = `<svg class="figure" viewBox="0 0 280 250" width="280" height="250" role="img" aria-label="a point in three dimensions">`;
    s += seg(P(0, 0, 0), P(8, 0, 0), 'class="stroke"') + seg(P(0, 0, 0), P(0, 7, 0), 'class="stroke"') + seg(P(0, 0, 0), P(0, 0, 7), 'class="stroke"');
    const [xe, ye, ze] = [P(8.4, 0, 0), P(0, 7.3, 0), P(0, 0, 7.4)];
    s += `<text x="${xe[0] - 4}" y="${xe[1] + 6}" font-size="14" font-style="italic">x</text><text x="${ye[0] + 2}" y="${ye[1] + 5}" font-size="14" font-style="italic">y</text><text x="${ze[0] - 4}" y="${ze[1] - 2}" font-size="14" font-style="italic">z</text>`;
    const v = [0, 1].flatMap(i => [0, 1].flatMap(j => [0, 1].map(k => [i * a, j * b, k * c])));
    for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) { const d = [0, 1, 2].filter(t => v[i][t] !== v[j][t]); if (d.length === 1) s += seg(P(...v[i]), P(...v[j]), 'stroke="var(--muted)" stroke-dasharray="4 3" stroke-width="1.2"'); }
    const tick = (q, lab, dx, dy) => `<circle cx="${q[0]}" cy="${q[1]}" r="2.5" fill="currentColor"/><text x="${q[0] + dx}" y="${q[1] + dy}" font-size="12">${lab}</text>`;
    s += tick(P(a, 0, 0), a, -14, 4) + tick(P(0, b, 0), b, -3, 16) + tick(P(0, 0, c), c, -14, 4);
    const pp = P(a, b, c);
    s += `<circle cx="${pp[0]}" cy="${pp[1]}" r="5" fill="var(--primary)"/><text x="${pp[0] + 8}" y="${pp[1] - 6}" font-size="14" font-weight="700" stroke="var(--surface)" stroke-width="3" paint-order="stroke">P</text></svg>`;
    return s;
  }
  const QUADS = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9], [2, 6, 9, 11], [6, 6, 7, 11], [3, 4, 12, 13], [2, 10, 11, 15], [1, 12, 12, 17], [8, 9, 12, 17]];
  const WHERE = ['On the x-axis', 'On the y-axis', 'On the z-axis', 'In the xy-plane', 'In the xz-plane', 'In the yz-plane'];
  A.skill({
    id: 'int3.points-3d', title: 'Points in three dimensions',
    learn: p(`Three-dimensional space has three axes at right angles: ${X}, ${Y} and ${Z}. In a drawing the ${X}-axis usually points toward you, the ${Y}-axis to the right and the ${Z}-axis up. <b>A point (${X}, ${Y}, ${Z}) is reached by moving ${X} along the ${X}-axis, then ${Y} parallel to the ${Y}-axis, then ${Z} up.</b> Drawing the box with one corner at the origin and the opposite corner at the point makes it easy to see.`) +
      p(`<b>A coordinate of 0 puts the point in a coordinate plane:</b> ${X} = 0 is the ${Y}${Z}-plane, ${Y} = 0 the ${X}${Z}-plane, and ${Z} = 0 the ${X}${Y}-plane. With two zeros the point is on an axis.`) +
      p(`The distance between two points comes from the Pythagorean theorem used twice: <b>${V('d')} = √(Δ${X}² + Δ${Y}² + Δ${Z}²)</b>.`) +
      example('Example', `Find the distance from (1, 2, 3) to (3, 5, 9).${big('√(2² + 3² + 6²) = √(4 + 9 + 36) = √49')}The distance is <b>7</b>.`),
    make(rng) {
      const kind = rng.pick(['read', 'read', 'where', 'dist', 'dist']);
      if (kind === 'read') {
        const [a, b, c] = rng.sample([1, 2, 3, 4, 5, 6], 3);
        const answer = pt3(a, b, c), wrong = [pt3(b, a, c), pt3(a, c, b), pt3(c, b, a), pt3(b, c, a)];
        return { prompt: `What are the coordinates of point ${V('P')}? The dashed box runs from the origin to ${V('P')}.${box3d(a, b, c)}`, type: 'choice', choices: options(answer, wrong), answer, params: { kind, a, b, c },
          hints: [`The ${X}-axis comes toward you, the ${Y}-axis goes right and the ${Z}-axis goes up.`, `The box meets the ${X}-axis at ${a}, the ${Y}-axis at ${b} and the ${Z}-axis at ${c}.`, `${V('P')} is <b>${answer}</b>; coordinates are always written in the order (${X}, ${Y}, ${Z}).`] };
      }
      if (kind === 'where') {
        const w = rng.int(0, 5), c = [rng.nz(-7, 7), rng.nz(-7, 7), rng.nz(-7, 7)];
        if (w < 3) [0, 1, 2].forEach(i => { if (i !== w) c[i] = 0; }); else c[5 - w] = 0;      // planes xy, xz, yz have z, y, x = 0
        const contains = w < 3 ? [3, 4, 5].filter(pl => WHERE[pl].includes('xyz'[w])) : [];       // a point on an axis is also in the two planes through it
        const pool = rng.shuffle([0, 1, 2, 3, 4, 5].filter(i => i !== w && !contains.includes(i))).slice(0, 3);
        const answer = WHERE[w];
        return { prompt: `Where is the point ${pt3(...c)}?`, type: 'choice', choices: [answer].concat(pool.map(i => WHERE[i])), answer, params: { kind, c },
          hints: [`Look for the coordinates that are 0. Each 0 means the point has not moved in that direction.`, w < 3 ? `Two coordinates are 0, so the point only moves along the ${'xyz'[w]}-axis.` : `Only ${'xyz'[5 - w]} = 0, so the point stays in the plane of the other two axes.`, `The point is <b>${answer.charAt(0).toLowerCase() + answer.slice(1)}</b>.`] };
      }
      const q = rng.pick(QUADS), d = rng.shuffle(q.slice(0, 3)).map(t => t * rng.sign());
      const p1 = [rng.int(-5, 5), rng.int(-5, 5), rng.int(-5, 5)], p2 = p1.map((t, i) => t + d[i]);
      return { prompt: `Find the distance between ${pt3(...p1)} and ${pt3(...p2)}.`, type: 'number', answer: q[3], params: { kind, p1, p2 },
        hints: [`Find the change in each coordinate: Δ${X} = ${N(d[0])}, Δ${Y} = ${N(d[1])}, Δ${Z} = ${N(d[2])}.`, `${V('d')} = √(${d.map(t => `${pw(t)}²`).join(' + ')}) = √(${d.map(t => t * t).join(' + ')}) = √${q[3] * q[3]}.`, `The distance is <b>${q[3]}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'read') return q.answer === pt3(P.a, P.b, P.c);
      if (P.kind === 'dist') return close(Math.hypot(...P.p1.map((t, i) => t - P.p2[i])), q.answer);
      const zeros = P.c.map(t => t === 0);
      const want = zeros.filter(Boolean).length === 2 ? WHERE[zeros.indexOf(false)] : WHERE[{ 2: 3, 1: 4, 0: 5 }[zeros.indexOf(true)]];
      // no other option may also be true: a point on an axis also lies in the two planes through that axis
      const truths = q.choices.filter(ch => { const i = WHERE.indexOf(ch); return i < 3 ? zeros.filter((z, j) => j !== i).every(Boolean) : zeros[5 - i]; });
      return q.answer === want && truths.length === 1;
    },
  });

  /** "2x − 3y + z = 12" */
  const eq3 = (a, b, c, d) => {
    let s = '';
    [[a, X], [b, Y], [c, Z]].forEach(([k, v]) => { if (!k) return; const t = `${Math.abs(k) === 1 ? '' : N(Math.abs(k))}${v}`; s += s ? ` ${k < 0 ? '−' : '+'} ${t}` : `${k < 0 ? '−' : ''}${t}`; });
    return `${s} = ${N(d)}`;
  };
  const lcm = (a, b) => Math.abs(a * b) / M.gcd(a, b);
  /** "2(3) − 4(−1) + 5z": a plane's left side with x and y filled in */
  const sub3 = (a, b, c, x, y, zTxt) => `${N(a)}(${N(x)}) ${b < 0 ? '−' : '+'} ${N(Math.abs(b))}(${N(y)}) ${c < 0 ? '−' : '+'} ${Math.abs(c) === 1 && zTxt === Z ? '' : N(Math.abs(c))}${zTxt}`;
  A.skill({
    id: 'int3.plane-intercepts', title: 'Planes in three dimensions',
    learn: p(`An equation ${V('a')}${X} + ${V('b')}${Y} + ${V('c')}${Z} = ${V('d')} with all three variables graphs as a <b>plane</b>. A point lies on the plane when its coordinates make the equation true.`) +
      p(`<b>To sketch the plane, find where it crosses each axis.</b> On the ${X}-axis, ${Y} = ${Z} = 0, so the ${X}-intercept is ${F(V('d'), V('a'))}; in the same way the ${Y}-intercept is ${F(V('d'), V('b'))} and the ${Z}-intercept is ${F(V('d'), V('c'))}. Join the three intercepts to draw a triangle of the plane.`) +
      p(`To find a missing coordinate of a point on the plane, substitute the two you know and solve for the third.`) +
      example('Example', `${big(eq3(2, 3, 6, 12))}Set ${Y} = ${Z} = 0: 2${X} = 12, so the ${X}-intercept is <b>6</b>. Likewise the ${Y}-intercept is 4 and the ${Z}-intercept is 2.`),
    make(rng) {
      const kind = rng.pick(['intercept', 'intercept', 'missing', 'onplane', 'equation']);
      if (kind === 'intercept' || kind === 'equation') {
        const ints = rng.sample([1, 2, 3, 4, 6, 12], 3).map(t => t * rng.sign()), L = ints.reduce((m, t) => lcm(m, Math.abs(t)), 1);
        const [a, b, c] = ints.map(t => L / t);
        if (kind === 'equation') {
          const answer = eq3(a, b, c, L), wrong = [eq3(...ints, L), eq3(a, b, c, 1), eq3(-a, b, c, L), eq3(a, -b, -c, L)];
          return { prompt: `Which equation’s plane crosses the axes at ${pt3(ints[0], 0, 0)}, ${pt3(0, ints[1], 0)} and ${pt3(0, 0, ints[2])}?`, type: 'choice', choices: options(answer, wrong), answer, params: { kind, ints, opts: [[a, b, c, L], [...ints, L], [a, b, c, 1], [-a, b, c, L], [a, -b, -c, L]] },
            hints: [`Test each equation by putting in an intercept: ${pt3(ints[0], 0, 0)} needs the ${X}-coefficient times ${N(ints[0])} to equal the right side.`, `${F(`${X}`, pw(ints[0]))} + ${F(Y, pw(ints[1]))} + ${F(Z, pw(ints[2]))} = 1 has those intercepts; multiply by ${L} to clear the fractions.`, `<b>${answer}</b>`] };
        }
        const ask = rng.int(0, 2), name = 'xyz'[ask], coef = [a, b, c][ask];
        return { prompt: `Find the ${name}-intercept of the plane.${big(eq3(a, b, c, L))}`, type: 'number', answer: ints[ask], params: { kind, a, b, c, d: L, ask },
          hints: [`On the ${name}-axis the other two coordinates are 0.`, coef === 1 ? `So the equation becomes ${V(name)} = ${L}.` : `So ${M.term(coef, name)} = ${L}, and ${V(name)} = ${L} ÷ ${pw(coef)}.`, `The ${name}-intercept is <b>${N(ints[ask])}</b>, the point ${pt3(...[0, 1, 2].map(i => i === ask ? ints[ask] : 0))}.`] };
      }
      const a = rng.nz(-4, 4), b = rng.nz(-4, 4), c = rng.nz(-4, 4), pt = [rng.int(-5, 5), rng.int(-5, 5), rng.int(-5, 5)], d = a * pt[0] + b * pt[1] + c * pt[2];
      if (kind === 'missing') {
        return { prompt: `The point (${N(pt[0])}, ${N(pt[1])}, ${Z}) lies on the plane below. Find ${Z}.${big(eq3(a, b, c, d))}`, type: 'number', answer: pt[2], params: { kind, a, b, c, d, x: pt[0], y: pt[1] },
          hints: [`Substitute ${X} = ${N(pt[0])} and ${Y} = ${N(pt[1])}: ${sub3(a, b, c, pt[0], pt[1], Z)} = ${N(d)}.`, `${N(a * pt[0] + b * pt[1])} + ${M.term(c, 'z')} = ${N(d)}, so ${M.term(c, 'z')} = ${N(d - a * pt[0] - b * pt[1])}.`.replace('+ −', '− '), `${Z} = <b>${N(pt[2])}</b>.`] };
      }
      const cands = [[pt[0] + 1, pt[1], pt[2]], [pt[0], pt[1] - 1, pt[2]], [pt[1], pt[0], pt[2]], [pt[0], pt[1], -pt[2]], [-pt[0], -pt[1], -pt[2]]].filter(p3 => a * p3[0] + b * p3[1] + c * p3[2] !== d);
      const seenP = new Set([pt3(...pt)]), wrong = rng.shuffle(cands).filter(p3 => !seenP.has(pt3(...p3)) && seenP.add(pt3(...p3))).slice(0, 3);
      if (wrong.length < 3) return this.make(rng);
      const answer = pt3(...pt);
      return { prompt: `Which point lies on this plane?${big(eq3(a, b, c, d))}`, type: 'choice', choices: [answer].concat(wrong.map(p3 => pt3(...p3))), answer, params: { kind, a, b, c, d, pts: [pt].concat(wrong) },
        hints: ['Substitute each point into the left side and see which one gives the right side.', `For the right point, ${sub3(a, b, c, pt[0], pt[1], `(${N(pt[2])})`)} = ${N(d)}. The other points give different totals.`, `<b>${answer}</b> lies on the plane.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'intercept') { const pt = [0, 0, 0]; pt[P.ask] = q.answer; return P.a * pt[0] + P.b * pt[1] + P.c * pt[2] === P.d; }
      if (P.kind === 'missing') return P.a * P.x + P.b * P.y + P.c * q.answer === P.d;
      if (P.kind === 'onplane') { const on = P.pts.filter(([x, y, z]) => P.a * x + P.b * y + P.c * z === P.d); return on.length === 1 && q.answer === pt3(...on[0]); }
      // the equation must pass through all three intercept points; only the right option does
      const hits = P.opts.filter(([a, b, c, d]) => a * P.ints[0] === d && b * P.ints[1] === d && c * P.ints[2] === d);
      return hits.length === 1 && q.answer === eq3(...hits[0]);
    },
  });

  const det3 = m => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  /** "(2) − 3(1)": how to combine equation j with equation 1 to remove z */
  const combo = (j, m) => m === 0 ? `(${j}) already has no ${Z}` : `(${j}) ${m > 0 ? '−' : '+'} ${Math.abs(m) === 1 ? '' : Math.abs(m)}(1)`;
  A.skill({
    id: 'int3.three-variable-systems', title: 'Systems of three equations in three variables',
    learn: p(`A system of three linear equations in ${X}, ${Y} and ${Z} describes three planes; usually they meet at a single point (${X}, ${Y}, ${Z}). <b>To solve it, use elimination to remove one variable twice</b>, leaving two equations in two variables.`) +
      p(`<b>Step 1:</b> pick a variable, say ${Z}, and combine equations (1) and (2) to cancel it, then (1) and (3). <b>Step 2:</b> solve the two new equations for ${X} and ${Y}. <b>Step 3:</b> substitute back into one of the original equations to find ${Z}. Check the answer in all three equations.`) +
      example('Example', `${big(`${X} + ${Y} + ${Z} = 6<br>2${X} − ${Y} + ${Z} = 3<br>${X} + 2${Y} − ${Z} = 2`)}(2) − (1) gives ${X} − 2${Y} = −3, and (3) + (1) gives 2${X} + 3${Y} = 8. Solving, ${X} = 1 and ${Y} = 2, then (1) gives ${Z} = 3: <b>(1, 2, 3)</b>.`),
    make(rng) {
      let rows, sol, D, tries = 0;
      do {
        sol = [rng.int(-5, 5), rng.int(-5, 5), rng.int(-5, 5)];
        rows = [[rng.int(-3, 3), rng.int(-3, 3), rng.pick([1, -1])], [rng.int(-3, 3), rng.int(-3, 3), rng.int(-3, 3)], [rng.int(-3, 3), rng.int(-3, 3), rng.int(-3, 3)]];
        D = det3(rows); tries++;
      } while ((D === 0 || rows.some(r => r.filter(Boolean).length < 2)) && tries < 100);
      const ds = rows.map(r => r[0] * sol[0] + r[1] * sol[1] + r[2] * sol[2]);
      const c1 = rows[0][2], red = [1, 2].map(j => { const m = rows[j][2] * c1; return { j: j + 1, m, u: rows[j][0] - m * rows[0][0], v: rows[j][1] - m * rows[0][1], w: ds[j] - m * ds[0] }; });
      const two = red.map(e => eq3(e.u, e.v, 0, e.w)).join(' and ');
      const sys = rows.map((r, i) => `${eq3(r[0], r[1], r[2], ds[i])} &nbsp; (${i + 1})`).join('<br>');
      const hints = [`Eliminate ${Z}: ${red.map(e => combo(e.j, e.m)).join(', and ')}. That leaves ${two}.`,
        `Solve those two equations: ${X} = ${N(sol[0])} and ${Y} = ${N(sol[1])}.`, `Substitute into (1): ${N(rows[0][0] * sol[0] + rows[0][1] * sol[1])} ${c1 > 0 ? '+' : '−'} ${Z} = ${N(ds[0])}, so ${Z} = ${N(sol[2])}.`];
      if (rng.chance(0.4)) {
        const answer = pt3(...sol), [x, y, z] = sol;
        let wrong = [pt3(y, x, z), pt3(x, z, y), pt3(-x, y, z), pt3(x, -y, z), pt3(x, y, -z), pt3(z, y, x)].filter(w => key(w) !== key(answer));
        // a solution like (0, 0, 0) or (2, 2, 2) is its own swap: nearby points make up the wrong choices
        if (new Set(wrong.map(key)).size < 3) wrong = wrong.concat([pt3(x + 1, y, z), pt3(x, y - 1, z), pt3(x, y, z + 2)]);
        hints.push(`The solution is <b>${answer}</b>.`);
        return { prompt: `Solve the system.${big(sys)}`, type: 'choice', choices: options(answer, wrong), answer, hints, params: { kind: 'triple', rows, ds } };
      }
      const ask = rng.int(0, 2), ans = sol[ask];
      hints.push(`So (${X}, ${Y}, ${Z}) = ${pt3(...sol)}, and ${'xyz'[ask]} = <b>${N(ans)}</b>.`);
      return { prompt: `Solve the system, and enter the value of ${V('xyz'[ask])}.${big(sys)}`, type: 'number', answer: ans, hints, params: { kind: 'one', rows, ds, ask } };
    },
    verify(q) {
      const P = q.params, D = det3(P.rows);
      if (!D) return 'the system has no single solution';
      // Cramer’s rule: replace one column by the right-hand sides
      const sol = [0, 1, 2].map(i => det3(P.rows.map((r, j) => r.map((t, k) => k === i ? P.ds[j] : t))) / D);
      return P.kind === 'triple' ? q.answer === pt3(...sol) : close(sol[P.ask], q.answer);
    },
  });

  A.skill({
    id: 'int3.curve-fitting', title: 'Fitting a parabola through three points',
    learn: p(`Three points with different ${X}-values fix exactly one parabola ${Y} = ${V('a')}${M.sup(X, 2)} + ${V('b')}${X} + ${V('c')}. <b>Substitute each point to get three equations in ${V('a')}, ${V('b')} and ${V('c')}</b>, then solve that system.`) +
      p(`Subtracting one equation from another removes ${V('c')}. Do it twice, then subtract again to find ${V('a')}. Work back to ${V('b')} and ${V('c')}. If one point has ${X} = 0, it gives ${V('c')} straight away.`) +
      example('Example', `Through (0, 3), (1, 4) and (2, 9):${big(`${V('c')} = 3, &nbsp; ${V('a')} + ${V('b')} + 3 = 4, &nbsp; 4${V('a')} + 2${V('b')} + 3 = 9`)}So ${V('a')} + ${V('b')} = 1 and 2${V('a')} + ${V('b')} = 3, giving ${V('a')} = 2, ${V('b')} = −1: <b>${Y} = 2${M.sup(X, 2)} − ${X} + 3</b>.`),
    make(rng) {
      const a = rng.nz(-3, 3), b = rng.int(-6, 6), c = rng.int(-9, 9), xs = rng.sample([-3, -2, -1, 0, 1, 2, 3, 4], 3).sort((u, v) => u - v);
      const ys = xs.map(x => a * x * x + b * x + c);
      const s12 = (ys[1] - ys[0]) / (xs[1] - xs[0]), s23 = (ys[2] - ys[1]) / (xs[2] - xs[1]);
      const ptsTxt = M.list(xs.map((x, i) => M.pt(x, ys[i])));
      const abc = x => x === 0 ? V('c') : `${M.term(x * x, 'a')} ${x < 0 ? '−' : '+'} ${M.term(Math.abs(x), 'b')} + ${V('c')}`, ab = t => t === 0 ? V('b') : `${M.term(t, 'a')} + ${V('b')}`;
      const hints = [`Substitute each point into ${Y} = ${V('a')}${M.sup(X, 2)} + ${V('b')}${X} + ${V('c')}: ${xs.map((x, i) => `${abc(x)} = ${N(ys[i])}`).join('; ')}.`,
        `Subtract neighboring equations to remove ${V('c')}, and divide by the change in ${X}: ${ab(xs[0] + xs[1])} = ${N(s12)} and ${ab(xs[1] + xs[2])} = ${N(s23)}.`,
        `Subtract these: ${M.term(xs[2] - xs[0], 'a')} = ${N(s23 - s12)}, so ${V('a')} = ${N(a)}. Then ${V('b')} = ${N(s12)} − ${pw(a)}(${N(xs[0] + xs[1])}) = ${N(b)}, and ${V('c')} = ${N(c)}.`];
      if (rng.chance(0.35)) {
        const answer = `${Y} = ${M.poly([a, b, c])}`, wrong = [`${Y} = ${M.poly([a, -b, c])}`, `${Y} = ${M.poly([-a, b, c])}`, `${Y} = ${M.poly([c, b, a])}`, `${Y} = ${M.poly([a, b, -c])}`];
        hints.push(`<b>${answer}</b>`);
        return { prompt: `Which parabola passes through ${ptsTxt}?`, type: 'choice', choices: options(answer, wrong.filter(w => key(w) !== key(answer))), answer, hints, params: { kind: 'eq', xs, ys, a, b, c } };
      }
      const ask = rng.int(0, 2), ans = [a, b, c][ask];
      hints.push(`So ${Y} = ${M.poly([a, b, c])}, and ${V('abc'[ask])} = <b>${N(ans)}</b>.`);
      return { prompt: `The parabola ${Y} = ${V('a')}${M.sup(X, 2)} + ${V('b')}${X} + ${V('c')} passes through ${ptsTxt}. Find ${V('abc'[ask])}.`, type: 'number', answer: ans, hints, params: { kind: 'one', xs, ys, ask } };
    },
    verify(q) {
      const { xs, ys } = q.params;
      // Lagrange’s form: the coefficients of the one quadratic through the three points
      let A2 = 0, B1 = 0, C0 = 0;
      for (let i = 0; i < 3; i++) {
        const [j, k] = [0, 1, 2].filter(t => t !== i), den = (xs[i] - xs[j]) * (xs[i] - xs[k]), w = ys[i] / den;
        A2 += w; B1 += -w * (xs[j] + xs[k]); C0 += w * xs[j] * xs[k];
      }
      const co = [A2, B1, C0].map(t => M.round(t, 9));
      if (q.params.kind === 'eq') return q.answer === `${Y} = ${M.poly(co)}`;
      return close(co[q.params.ask], q.answer);
    },
  });
})();
