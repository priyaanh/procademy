/* Calculus BC. What follows the Calculus course (roughly AP Calculus BC's extra topics): L'Hôpital's rule,
   integration by parts and partial fractions, improper integrals, differential equations (separable, Euler's
   method, logistic growth), parametric, vector and polar curves, sequences and series, convergence tests, and
   Taylor and Maclaurin series. verify() re-checks each answer numerically: integrals by Simpson's rule,
   differential equations by Runge-Kutta steps, and series coefficients by a contour integral. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v;
  const p = s => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const key = s => A.normText(A.stripTags(s));
  const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1e-9 : tol) * Math.max(1, Math.abs(b));
  const r2 = x => M.round(x, 2), r3 = x => M.round(x, 3), r4 = x => M.round(x, 4);
  const X = V('x'), Y = V('y'), T = V('t'), TH = V('θ'), C = V('C'), Nn = V('n');
  const sfrac = (num, den) => `<span class="frac"><span class="num">${num}</span><span class="den">${den}</span></span>`;
  const ex = pw => `e<sup>${pw}</sup>`;
  const SQ = s => `${s}<sup>2</sup>`;
  const DX = ` d${X}`;
  const DYDX = sfrac(`d${Y}`, `d${X}`);
  const STACK = 'display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1.05';
  const lim = to => `<span style="${STACK};margin-right:4px"><span>lim</span><span style="font-size:.6em;white-space:nowrap">${to}</span></span>`;
  const integ = (a, b) => `<span style="${STACK};margin-right:2px"><span style="font-size:.6em">${b}</span><span style="font-size:1.35em;line-height:1">∫</span><span style="font-size:.6em">${a}</span></span>`;
  const sigma = (from, to) => `<span style="${STACK};margin-right:2px"><span style="font-size:.6em">${to}</span><span style="font-size:1.35em;line-height:1">Σ</span><span style="font-size:.6em">${from}</span></span>`;
  /** k·x for a coefficient k (1 shows as just x) */
  const kx = (k, v) => (k === 1 ? '' : k === -1 ? '−' : N(k)) + (v || X);
  const fa = (n, d) => { const [a, b] = M.simp(n, d); return b === 1 ? { answer: a } : { answer: a / b, answerText: M.fracText(a, b) }; };
  /** the answer plus up to three distractors that read differently from it and from each other */
  function options(answer, cands, n) {
    const out = [answer], seen = new Set([key(answer)]);
    for (const c of cands) { if (out.length >= (n || 4)) break; if (c == null) continue; const k = key(c); if (!seen.has(k)) { seen.add(k); out.push(c); } }
    return out;
  }

  /* numeric checks, used only by verify() */
  const deriv = (f, x) => { const h = 1e-5; return (f(x + h) - f(x - h)) / (2 * h); };
  function simpson(f, a, b, n) {
    n = n || 4000;
    const h = (b - a) / n;
    let s = f(a) + f(b);
    for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
    return s * h / 3;
  }
  /** y at x1 for y' = f(x, y), y(x0) = y0, by classical Runge-Kutta steps */
  function rk4(f, x0, y0, x1, steps) {
    const n = steps || 2000, h = (x1 - x0) / n;
    let x = x0, y = y0;
    for (let i = 0; i < n; i++) { const k1 = f(x, y), k2 = f(x + h / 2, y + h * k1 / 2), k3 = f(x + h / 2, y + h * k2 / 2), k4 = f(x + h, y + h * k3); y += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6; x += h; }
    return y;
  }
  /* complex numbers as [re, im], for the Taylor coefficients by contour integral */
  const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const cdiv = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
  const cexp = z => [Math.exp(z[0]) * Math.cos(z[1]), Math.exp(z[0]) * Math.sin(z[1])];
  const csin = z => [Math.sin(z[0]) * Math.cosh(z[1]), Math.cos(z[0]) * Math.sinh(z[1])];
  const ccos = z => [Math.cos(z[0]) * Math.cosh(z[1]), -Math.sin(z[0]) * Math.sinh(z[1])];
  const clog = z => [Math.log(Math.hypot(z[0], z[1])), Math.atan2(z[1], z[0])];
  /** the coefficient of zᵏ in the Maclaurin series of a complex function, by the Cauchy integral on |z| = r */
  function coef(fz, k, r) {
    r = r || 0.2; const n = 128; let re = 0;
    for (let j = 0; j < n; j++) { const t = 2 * Math.PI * j / n, w = fz([r * Math.cos(t), r * Math.sin(t)]); re += w[0] * Math.cos(k * t) + w[1] * Math.sin(k * t); }
    return re / n / Math.pow(r, k);
  }
  const fact = n => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
  const LNF = [0];
  /** ln n!, for terms with huge factorials */
  const lnFact = n => { while (LNF.length <= n) LNF.push(LNF[LNF.length - 1] + Math.log(LNF.length)); return LNF[n]; };

  A.course({
    id: 'calculus-bc', title: 'Calculus BC', subject: 'High school', grade: 12, icon: 'BC', hue: 100,
    blurb: 'After Calculus: L’Hôpital’s rule, integration by parts and partial fractions, improper integrals, differential equations, parametric and polar curves, and infinite series with Taylor polynomials.',
    units: [
      { id: 'techniques', title: 'Limits and integration techniques', blurb: 'L’Hôpital’s rule, integration by parts, partial fractions, and improper integrals.', skills: ['bc.lhopital', 'bc.integration-by-parts', 'bc.partial-fractions', 'bc.improper-integrals'] },
      { id: 'differential-equations', title: 'Differential equations', blurb: 'Separable equations, slope fields, Euler’s method, and logistic growth.', skills: ['bc.separable', 'bc.slope-fields', 'bc.euler', 'bc.logistic'] },
      { id: 'parametric-polar', title: 'Parametric, vector and polar curves', blurb: 'Slopes of parametric curves, motion along a curve, arc length, and slopes and areas in polar coordinates.', skills: ['bc.parametric-derivative', 'bc.vector-motion', 'bc.arc-length', 'bc.polar-slope', 'bc.polar-area'] },
      { id: 'series', title: 'Sequences and series', blurb: 'Limits of sequences, geometric series, the convergence tests, alternating series error, and radius of convergence.', skills: ['bc.sequence-limits', 'bc.geometric-series', 'bc.convergence-tests', 'bc.alternating-error', 'bc.radius-convergence'] },
      { id: 'taylor', title: 'Taylor and Maclaurin series', blurb: 'Taylor polynomials, the Maclaurin series to know, sums of known series, and the Lagrange error bound.', skills: ['bc.taylor-polynomial', 'bc.maclaurin-series', 'bc.known-series', 'bc.lagrange-error'] },
    ],
  });

  /* ---------- Unit 1: limits and integration techniques ---------- */
  A.skill({
    id: 'bc.lhopital', title: 'L’Hôpital’s rule',
    learn: p(`If a limit of ${V('f')}(${X})/${V('g')}(${X}) gives 0/0 or ∞/∞ when you substitute, <b>L’Hôpital’s rule</b> says it equals the limit of ${V('f')}′(${X})/${V('g')}′(${X}), the derivatives taken separately (not the quotient rule).`) +
      p(`Check the form first: the rule only applies to 0/0 or ∞/∞. If the new limit is still 0/0, you may apply it again.`) +
      example('Example', `${lim(`${X} → 0`)} ${sfrac(`${ex(`3${X}`)} − 1`, `2${X}`)} is 0/0. Differentiate top and bottom: ${sfrac(`3${ex(`3${X}`)}`, '2')} → ${F(3, 2)} as ${X} → 0.`),
    make(rng) {
      const kind = rng.pick(['exp', 'sin', 'cos', 'log', 'power']), a = rng.pick([1, 2, 3, 4, 5]), b = rng.pick([1, 2, 3, 4, 6]);
      let prompt, num, den, hints, params;
      if (kind === 'exp') { prompt = `${lim(`${X} → 0`)} ${sfrac(`${ex(kx(a))} − 1`, kx(b))}`; [num, den] = [a, b]; hints = [`Substituting ${X} = 0 gives 0/0, so use L’Hôpital’s rule.`, `The derivatives are ${a === 1 ? '' : a}${ex(kx(a))} and ${b}; at ${X} = 0 that's ${a}/${b}.`]; }
      else if (kind === 'sin') { prompt = `${lim(`${X} → 0`)} ${sfrac(`sin(${kx(a)})`, kx(b))}`; [num, den] = [a, b]; hints = [`0/0 at ${X} = 0, so differentiate the top and the bottom.`, `${a === 1 ? '' : a}cos(${kx(a)}) over ${b}; at ${X} = 0 that's ${a}/${b}.`]; }
      else if (kind === 'cos') { prompt = `${lim(`${X} → 0`)} ${sfrac(`1 − cos(${kx(a)})`, SQ(X))}`; [num, den] = [a * a, 2]; hints = [`0/0: differentiate to get ${a === 1 ? '' : a}sin(${kx(a)}) ÷ 2${X}, still 0/0.`, `Differentiate again: ${a * a === 1 ? '' : a * a}cos(${kx(a)}) ÷ 2 → ${a * a}/2.`]; }
      else if (kind === 'log') { prompt = `${lim(`${X} → 0`)} ${sfrac(`ln(1 + ${kx(a)})`, kx(b))}`; [num, den] = [a, b]; hints = [`0/0 at ${X} = 0, so use L’Hôpital’s rule.`, `The top's derivative is ${a}/(1 + ${kx(a)}), the bottom's is ${b}; at ${X} = 0 that's ${a}/${b}.`]; }
      else { const n = rng.int(2, 7); prompt = `${lim(`${X} → 1`)} ${sfrac(`${X}<sup>${n}</sup> − 1`, `${X} − 1`)}`; [num, den] = [n, 1]; hints = [`At ${X} = 1 this is 0/0.`, `Differentiate: ${n}${X}${n - 1 > 1 ? `<sup>${n - 1}</sup>` : ''} ÷ 1, which is ${n} at ${X} = 1.`]; params = { kind, n }; }
      params = params || { kind, a, b };
      const ans = fa(num, den);
      hints.push(`The limit is <b>${ans.answerText || N(ans.answer)}</b>.`);
      return { prompt: `Find the limit.${big(prompt)}`, type: 'number', ...ans, params, hints };
    },
    verify(q) {
      const P = q.params, f = { exp: x => (Math.exp(P.a * x) - 1) / (P.b * x), sin: x => Math.sin(P.a * x) / (P.b * x), cos: x => (1 - Math.cos(P.a * x)) / (x * x), log: x => Math.log(1 + P.a * x) / (P.b * x), power: x => (x ** P.n - 1) / (x - 1) }[P.kind];
      const at = P.kind === 'power' ? 1 : 0;
      return near((f(at + 1e-4) + f(at - 1e-4)) / 2, q.answer, 1e-5);
    },
  });

  /** an antiderivative choice: { html, F } */
  const kfrac = (top, k) => (k === 1 ? top : sfrac(top, N(k)));
  function partsFamily(fam, k) {
    const E = ex(kx(k)), sk = `sin(${kx(k)})`, ck = `cos(${kx(k)})`;
    if (fam === 'xe') return { integrand: `${X}${E}`, f: x => x * Math.exp(k * x), opts: [
      [`${kfrac(`${X}${E}`, k)} − ${kfrac(E, k * k)} + ${C}`, x => x * Math.exp(k * x) / k - Math.exp(k * x) / (k * k)],
      [`${kfrac(`${X}${E}`, k)} + ${kfrac(E, k * k)} + ${C}`, x => x * Math.exp(k * x) / k + Math.exp(k * x) / (k * k)],
      [`${kfrac(`${SQ(X)}${E}`, 2)} + ${C}`, x => x * x * Math.exp(k * x) / 2],
      [`${X}${E} − ${E} + ${C}`, x => x * Math.exp(k * x) - Math.exp(k * x)],
      [`${kfrac(`${X}${E}`, k)} − ${kfrac(E, k)} + ${C}`, x => x * Math.exp(k * x) / k - Math.exp(k * x) / k]] };
    if (fam === 'xcos') return { integrand: `${X} ${ck}`, f: x => x * Math.cos(k * x), opts: [
      [`${kfrac(`${X} ${sk}`, k)} + ${kfrac(ck, k * k)} + ${C}`, x => x * Math.sin(k * x) / k + Math.cos(k * x) / (k * k)],
      [`${kfrac(`${X} ${sk}`, k)} − ${kfrac(ck, k * k)} + ${C}`, x => x * Math.sin(k * x) / k - Math.cos(k * x) / (k * k)],
      [`−${kfrac(`${X} ${sk}`, k)} + ${kfrac(ck, k * k)} + ${C}`, x => -x * Math.sin(k * x) / k + Math.cos(k * x) / (k * k)],
      [`${kfrac(`${SQ(X)} ${sk}`, 2)} + ${C}`, x => x * x * Math.sin(k * x) / 2]] };
    if (fam === 'xsin') return { integrand: `${X} ${sk}`, f: x => x * Math.sin(k * x), opts: [
      [`−${kfrac(`${X} ${ck}`, k)} + ${kfrac(sk, k * k)} + ${C}`, x => -x * Math.cos(k * x) / k + Math.sin(k * x) / (k * k)],
      [`${kfrac(`${X} ${ck}`, k)} + ${kfrac(sk, k * k)} + ${C}`, x => x * Math.cos(k * x) / k + Math.sin(k * x) / (k * k)],
      [`−${kfrac(`${X} ${ck}`, k)} − ${kfrac(sk, k * k)} + ${C}`, x => -x * Math.cos(k * x) / k - Math.sin(k * x) / (k * k)],
      [`−${kfrac(`${SQ(X)} ${ck}`, 2)} + ${C}`, x => -x * x * Math.cos(k * x) / 2]] };
    if (fam === 'ln') return { integrand: `ln ${X}`, f: x => Math.log(x), opts: [
      [`${X} ln ${X} − ${X} + ${C}`, x => x * Math.log(x) - x], [`${X} ln ${X} + ${X} + ${C}`, x => x * Math.log(x) + x], [`${X} ln ${X} + ${C}`, x => x * Math.log(x)], [`${sfrac('1', X)} + ${C}`, x => 1 / x]] };
    return { integrand: `${X} ln ${X}`, f: x => x * Math.log(x), opts: [
      [`${kfrac(`${SQ(X)} ln ${X}`, 2)} − ${kfrac(SQ(X), 4)} + ${C}`, x => x * x * Math.log(x) / 2 - x * x / 4], [`${kfrac(`${SQ(X)} ln ${X}`, 2)} + ${kfrac(SQ(X), 4)} + ${C}`, x => x * x * Math.log(x) / 2 + x * x / 4],
      [`${SQ(X)} ln ${X} − ${kfrac(SQ(X), 2)} + ${C}`, x => x * x * Math.log(x) - x * x / 2], [`${kfrac(`${SQ(X)} ln ${X}`, 2)} + ${C}`, x => x * x * Math.log(x) / 2]] };
  }
  const PARTS_UV = { xe: [`${V('u')} = ${X}`, `d${V('v')} = ${ex(`${V('k')}${X}`)}${DX}`], xcos: [`${V('u')} = ${X}`, `d${V('v')} = cos(${V('k')}${X})${DX}`], xsin: [`${V('u')} = ${X}`, `d${V('v')} = sin(${V('k')}${X})${DX}`], ln: [`${V('u')} = ln ${X}`, `d${V('v')} = d${X}`], xln: [`${V('u')} = ln ${X}`, `d${V('v')} = ${X}${DX}`] };
  A.skill({
    id: 'bc.integration-by-parts', title: 'Integration by parts',
    learn: p(`<b>∫ ${V('u')} d${V('v')} = ${V('u')}${V('v')} − ∫ ${V('v')} d${V('u')}.</b> It undoes the product rule. Choose ${V('u')} to be the part that gets simpler when you differentiate it (a power of ${X}, or ln ${X}), and d${V('v')} the part you can integrate.`) +
      p(`A common order for choosing ${V('u')} is LIATE: Logarithms, Inverse trig, Algebraic (powers of ${X}), Trig, Exponentials. For a definite integral, evaluate ${V('u')}${V('v')} at both limits and subtract the remaining integral.`) +
      example('Example', `∫ ${X}${ex(X)}${DX}: ${V('u')} = ${X}, d${V('v')} = ${ex(X)}${DX}, so d${V('u')} = d${X} and ${V('v')} = ${ex(X)}. Then ∫ ${X}${ex(X)}${DX} = ${X}${ex(X)} − ∫ ${ex(X)}${DX} = ${X}${ex(X)} − ${ex(X)} + ${C}.`),
    make(rng) {
      if (rng.chance(0.35)) {
        const which = rng.pick(['xe1', 'xe2', 'xcos', 'ln', 'xln']);
        const D = { xe1: [`${X}${ex(X)}`, '0', '1', 1, 'At 1: (1 − 1)e = 0; at 0: (0 − 1) = −1. So 0 − (−1) = 1.'], xe2: [`${X}${ex(X)}`, '0', '2', Math.exp(2) + 1, `At 2: (2 − 1)e² = e²; at 0: −1. So e² + 1 ≈ ${N(r3(Math.exp(2) + 1))}.`],
          xcos: [`${X} cos ${X}`, '0', 'π/2', Math.PI / 2 - 1, 'At π/2: (π/2)(1) + 0 = π/2; at 0: 0 + 1 = 1. So π/2 − 1 ≈ 0.571.'], ln: [`ln ${X}`, '1', 'e', 1, 'At e: e − e = 0; at 1: 0 − 1 = −1. So 0 − (−1) = 1.'],
          xln: [`${X} ln ${X}`, '1', 'e', (Math.exp(2) + 1) / 4, `At e: e²/2 − e²/4 = e²/4; at 1: −1/4. So (e² + 1)/4 ≈ ${N(r3((Math.exp(2) + 1) / 4))}.`] }[which];
        const anti = { xe1: `${X}${ex(X)} − ${ex(X)}`, xe2: `${X}${ex(X)} − ${ex(X)}`, xcos: `${X} sin ${X} + cos ${X}`, ln: `${X} ln ${X} − ${X}`, xln: `${kfrac(`${SQ(X)} ln ${X}`, 2)} − ${kfrac(SQ(X), 4)}` }[which];
        const ans = r3(D[3]);
        return { prompt: `Evaluate, to 3 decimal places.${big(`${integ(D[1], D[2])} ${D[0]}${DX}`)}`, type: 'number', answer: ans, tolerance: 0.002, params: { kind: 'definite', which },
          hints: [`Integrate by parts first: an antiderivative is ${anti}.`, D[4], `So the integral is about <b>${N(ans)}</b>.`] };
      }
      const fam = rng.pick(['xe', 'xe', 'xcos', 'xsin', 'ln', 'xln']), k = fam === 'ln' || fam === 'xln' ? 1 : rng.pick([1, 2, 3]);
      const fm = partsFamily(fam, k), answer = fm.opts[0][0];
      return { prompt: `Find the integral.${big(`∫ ${fm.integrand}${DX}`)}`, type: 'choice', answer, choices: options(answer, rng.shuffle(fm.opts.slice(1).map(o => o[0]))), params: { kind: 'anti', fam, k },
        hints: [`Use parts with ${PARTS_UV[fam][0]} and ${PARTS_UV[fam][1]}${k === 1 || fam === 'ln' || fam === 'xln' ? '' : `, where ${V('k')} = ${k}`}.`, `Then ${V('u')}${V('v')} − ∫ ${V('v')} d${V('u')} gives <b>${answer}</b>.`, `Check: differentiate your answer and you should get back ${fm.integrand}.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'definite') {
        const f = { xe1: x => x * Math.exp(x), xe2: x => x * Math.exp(x), xcos: x => x * Math.cos(x), ln: x => Math.log(x), xln: x => x * Math.log(x) }[P.which];
        const [a, b] = { xe1: [0, 1], xe2: [0, 2], xcos: [0, Math.PI / 2], ln: [1, Math.E], xln: [1, Math.E] }[P.which];
        return near(simpson(f, a, b), q.answer, 0.0006);
      }
      const fm = partsFamily(P.fam, P.k), xs = [1.1, 1.7, 2.3, 2.9];
      const good = [...new Set(fm.opts.filter(o => q.choices.includes(o[0]) && xs.every(x => near(deriv(o[1], x), fm.f(x), 1e-6))).map(o => o[0]))];
      return good.length === 1 && good[0] === q.answer;
    },
  });

  const lnTerm = (c, r) => `${c === 1 ? '' : c === -1 ? '−' : N(c)}ln|${X} ${r > 0 ? '−' : '+'} ${Math.abs(r)}|`;
  const lnSum = (c1, r1, c2, r2v) => `${lnTerm(c1, r1)} ${c2 < 0 ? '−' : '+'} ${lnTerm(Math.abs(c2), r2v)} + ${C}`;
  A.skill({
    id: 'bc.partial-fractions', title: 'Partial fractions',
    learn: p(`A fraction like ${sfrac(`${V('p')}${X} + ${V('q')}`, `(${X} − ${V('a')})(${X} − ${V('b')})`)} can be split into ${sfrac(V('A'), `${X} − ${V('a')}`)} + ${sfrac(V('B'), `${X} − ${V('b')}`)}, and each piece integrates to a logarithm: ∫ ${sfrac(V('A'), `${X} − ${V('a')}`)}${DX} = ${V('A')} ln|${X} − ${V('a')}| + ${C}.`) +
      p(`<b>To find ${V('A')} and ${V('B')}, multiply through by the denominator and put in ${X} = ${V('a')} and ${X} = ${V('b')}</b> (each makes one term vanish).`) +
      example('Example', `${sfrac(`5${X} − 1`, `(${X} − 1)(${X} + 1)`)} = ${sfrac('A', `${X} − 1`)} + ${sfrac('B', `${X} + 1`)}. So 5${X} − 1 = A(${X} + 1) + B(${X} − 1); ${X} = 1 gives A = 2, ${X} = −1 gives B = 3. The integral is 2 ln|${X} − 1| + 3 ln|${X} + 1| + ${C}.`),
    make(rng) {
      let a = rng.int(-5, 5), b = rng.int(-5, 5); if (a === b) b = a + rng.pick([1, 2, 3]);
      const Ac = rng.pick([1, 2, 3, 4, -1, -2]), Bc = rng.pick([1, 2, 3, -1, -2, -3]);
      const pc = Ac + Bc, qc = -(Ac * b + Bc * a);
      const numHtml = pc === 0 ? N(qc) : `${M.term(pc, 'x')}${qc ? ` ${M.signed(qc)}` : ''}`;
      const fac = r => (r === 0 ? X : `(${X} ${r > 0 ? '−' : '+'} ${Math.abs(r)})`);
      const den = `${fac(a)}${fac(b)}`;
      if (rng.bool()) {
        const answer = lnSum(Ac, a, Bc, b), wrong = [lnSum(Bc, a, Ac, b), lnSum(Ac, -a, Bc, -b), lnSum(-Ac, a, -Bc, b), lnSum(Ac, a, -Bc, b)];
        return { prompt: `Find the integral.${big(`∫ ${sfrac(numHtml, den)}${DX}`)}`, type: 'choice', answer, choices: options(answer, wrong), params: { kind: 'anti', a, b, Ac, Bc },
          hints: [`Write it as ${sfrac('A', fac(a).replace(/^\(|\)$/g, ''))} + ${sfrac('B', fac(b).replace(/^\(|\)$/g, ''))}, so ${numHtml} = A${fac(b)} + B${fac(a)}.`, `${X} = ${N(a)} gives A = ${N(Ac)}; ${X} = ${N(b)} gives B = ${N(Bc)}.`, `Each piece integrates to a logarithm: <b>${answer}</b>.`] };
      }
      const want = rng.pick(['A', 'B']);
      return { prompt: `Write ${sfrac(numHtml, den)} = ${sfrac('A', fac(a).replace(/^\(|\)$/g, ''))} + ${sfrac('B', fac(b).replace(/^\(|\)$/g, ''))}. Find ${want}.`, type: 'number', answer: want === 'A' ? Ac : Bc, params: { kind: want, a, b, Ac, Bc },
        hints: [`Multiply by the denominator: ${numHtml} = A${fac(b)} + B${fac(a)}.`, want === 'A' ? `Put in ${X} = ${N(a)}: the B term vanishes, so A = ${N(pc * a + qc)} ÷ ${N(a - b)} = <b>${N(Ac)}</b>.` : `Put in ${X} = ${N(b)}: the A term vanishes, so B = ${N(pc * b + qc)} ÷ ${N(b - a)} = <b>${N(Bc)}</b>.`] };
    },
    verify(q) {
      const { kind, a, b, Ac, Bc } = q.params, pc = Ac + Bc, qc = -(Ac * b + Bc * a), f = x => (pc * x + qc) / ((x - a) * (x - b));
      if (kind === 'A' || kind === 'B') return [0.37, 7.3, -6.6].every(x => near(f(x), Ac / (x - a) + Bc / (x - b), 1e-9)) && q.answer === (kind === 'A' ? Ac : Bc);
      const F1 = x => Ac * Math.log(Math.abs(x - a)) + Bc * Math.log(Math.abs(x - b));
      return [6.3, 7.9, -6.4].every(x => near(deriv(F1, x), f(x), 1e-5)) && q.answer === lnSum(Ac, a, Bc, b);
    },
  });

  const CONV = v => `Converges to ${v}`;
  A.skill({
    id: 'bc.improper-integrals', title: 'Improper integrals',
    learn: p(`An integral with an infinite limit, or with a function that blows up at an endpoint, is <b>improper</b>. Replace the bad limit with a variable, integrate, and take the limit: ∫<sub>1</sub><sup>∞</sup> = ${lim(`${V('b')} → ∞`)} ∫<sub>1</sub><sup>${V('b')}</sup>. If that limit is a number, the integral <b>converges</b>; otherwise it <b>diverges</b>.`) +
      p(`<b>The ones to know:</b> ∫<sub>1</sub><sup>∞</sup> 1/${X}<sup>${V('p')}</sup> d${X} converges (to 1/(${V('p')} − 1)) only when ${V('p')} &gt; 1, while ∫<sub>0</sub><sup>1</sup> 1/${X}<sup>${V('p')}</sup> d${X} converges (to 1/(1 − ${V('p')})) only when ${V('p')} &lt; 1. ∫<sub>0</sub><sup>∞</sup> ${ex(`−${V('k')}${X}`)} d${X} = 1/${V('k')}.`) +
      example('Example', `∫<sub>1</sub><sup>∞</sup> 1/${X}<sup>3</sup> d${X} = ${lim(`${V('b')} → ∞`)} [−1/(2${X}²)] from 1 to ${V('b')} = 0 + ${F(1, 2)} = ${F(1, 2)}, so it converges to ${F(1, 2)}.`),
    make(rng) {
      const kind = rng.pick(['tail', 'tail', 'near0', 'exp', 'atan']);
      let prompt, val, hints, params;
      if (kind === 'tail') {
        const [pn, pd] = rng.pick([[2, 1], [3, 1], [4, 1], [3, 2], [5, 2], [1, 1], [1, 2], [2, 3]]), pw = pn / pd;
        prompt = `${integ('1', '∞')} ${sfrac('1', `${X}<sup>${M.fracText(pn, pd)}</sup>`)}${DX}`;
        val = pw > 1 ? M.fracText(pd, pn - pd) : null; params = { kind, pn, pd };
        hints = [`This is ∫<sub>1</sub><sup>∞</sup> 1/${X}<sup>${V('p')}</sup> with ${V('p')} = ${M.fracText(pn, pd)}.`, pw > 1 ? `${V('p')} &gt; 1, so it converges to 1/(${V('p')} − 1) = ${val}.` : `${V('p')} ≤ 1, so the area keeps growing: it diverges.`];
      } else if (kind === 'near0') {
        const [pn, pd] = rng.pick([[1, 2], [1, 3], [2, 3], [3, 4], [1, 1], [2, 1], [3, 2]]), pw = pn / pd;
        prompt = `${integ('0', '1')} ${sfrac('1', `${X}<sup>${M.fracText(pn, pd)}</sup>`)}${DX}`;
        val = pw < 1 ? M.fracText(pd, pd - pn) : null; params = { kind, pn, pd };
        hints = [`The function blows up at ${X} = 0. This is ∫<sub>0</sub><sup>1</sup> 1/${X}<sup>${V('p')}</sup> with ${V('p')} = ${M.fracText(pn, pd)}.`, pw < 1 ? `${V('p')} &lt; 1, so it converges to 1/(1 − ${V('p')}) = ${val}.` : `${V('p')} ≥ 1, so it diverges.`];
      } else if (kind === 'exp') {
        const k = rng.pick([1, 2, 3, 4, 5]), c = rng.pick([1, 2, 3, 6]);
        prompt = `${integ('0', '∞')} ${c === 1 ? '' : c}${ex(`−${kx(k)}`)}${DX}`;
        val = M.fracText(c, k); params = { kind, k, c };
        hints = [`An antiderivative is −${c === 1 ? '' : M.fracText(c, k) === String(c / k) ? '' : ''}${M.fracText(c, k)}${ex(`−${kx(k)}`)}.`, `As ${X} → ∞ it goes to 0; at 0 it is −${M.fracText(c, k)}. So the integral converges to ${val}.`];
      } else {
        prompt = `${integ('0', '∞')} ${sfrac('1', `1 + ${SQ(X)}`)}${DX}`; val = 'π/2'; params = { kind };
        hints = [`An antiderivative is tan<sup>−1</sup> ${X}.`, `tan<sup>−1</sup> ${X} → π/2 as ${X} → ∞, and tan<sup>−1</sup> 0 = 0, so it converges to π/2.`];
      }
      const answer = val == null ? 'Diverges' : CONV(val);
      const pool = val == null ? [CONV('0'), CONV('1'), CONV(F(1, 2).replace(/<[^>]+>/g, '') === '' ? '1/2' : '1/2'), CONV('2')] : ['Diverges', CONV('0'), CONV(val === '1' ? '2' : '1'), CONV(val === 'π/2' ? 'π' : '∞'.replace('∞', '3'))];
      hints.push(`<b>${answer}</b>.`);
      return { prompt: `Does the integral converge or diverge?${big(prompt)}`, type: 'choice', answer, choices: options(answer, pool), params, hints };
    },
    verify(q) {
      const P = q.params, pw = P.pn / P.pd;
      // the integral up to three cutoffs, each a thousand times further out (x = eᵘ spreads the work evenly)
      const logInt = (g, lo, hi) => simpson(u => g(Math.exp(u)) * Math.exp(u), Math.log(lo), Math.log(hi), 20000);
      const part = { tail: c => logInt(x => x ** -pw, 1, c), near0: c => logInt(x => x ** -pw, c, 1), exp: c => simpson(x => P.c * Math.exp(-P.k * x), 0, c, 20000), atan: c => simpson(x => 1 / (1 + x * x), 0, 1) + logInt(x => 1 / (1 + x * x), 1, c) }[P.kind];
      const cuts = { tail: [1e3, 1e6, 1e9], near0: [1e-3, 1e-6, 1e-9], exp: [10, 20, 40], atan: [1e3, 1e6, 1e9] }[P.kind];
      const [v1, v2, v3] = cuts.map(part), d1 = v2 - v1, d2 = v3 - v2;
      if (q.answer === 'Diverges') return d2 > 0.5 * d1 && d2 > 1e-3;
      const ratio = d1 > 0 ? d2 / d1 : 0, limit = v3 + (ratio < 1 ? d2 * ratio / (1 - ratio) : Infinity);
      const t = A.stripTags(q.answer).replace('Converges to', '').trim().replace('π', String(Math.PI)), target = t.includes('/') ? t.split('/').map(Number).reduce((x, y) => x / y) : Number(t);
      if (Math.abs(d1) < 1e-9) return near(v3, target, 2e-3);          // already settled (a fast-decaying exponential)
      return ratio < 0.5 && near(limit, target, 2e-3);
    },
  });

  /* ---------- Unit 2: differential equations ---------- */
  A.skill({
    id: 'bc.separable', title: 'Separable differential equations',
    learn: p(`A differential equation is <b>separable</b> if you can move every ${Y} to one side and every ${X} to the other: ${DYDX} = ${V('g')}(${X})${V('h')}(${Y}) becomes ${sfrac('1', `${V('h')}(${Y})`)} d${Y} = ${V('g')}(${X}) d${X}. <b>Integrate both sides, add one constant, then use the initial condition to find it.</b>`) +
      p(`The most important one is ${DYDX} = ${V('k')}${Y}, whose solution is ${Y} = ${Y}<sub>0</sub>${ex(`${V('k')}${X}`)}: exponential growth (${V('k')} &gt; 0) or decay (${V('k')} &lt; 0).`) +
      example('Example', `${DYDX} = ${X}${Y}, ${Y}(0) = 3. Separate: d${Y}/${Y} = ${X} d${X}, so ln|${Y}| = ${X}²/2 + ${C}, and ${Y} = 3${ex(`${X}²/2`)}. At ${X} = 1, ${Y} = 3${ex('1/2')} ≈ 4.95.`),
    make(rng) {
      const kind = rng.pick(['ky', 'xy', 'xovery']), y0 = rng.int(1, 9);
      let eq, ans, sol, x1, params;
      if (kind === 'ky') { const k = rng.pick([0.1, 0.2, 0.3, 0.5, -0.1, -0.2, -0.4]); x1 = rng.pick([1, 2, 3, 4, 5]); ans = r2(y0 * Math.exp(k * x1)); eq = `${DYDX} = ${N(k)}${Y}`; sol = `${Y} = ${y0}${ex(`${N(k)}${X}`)}`; params = { kind, k, y0, x1 }; }
      else if (kind === 'xy') { const k = rng.pick([1, 2, -1]); x1 = rng.pick([0.5, 1, 1.5]); ans = r2(y0 * Math.exp(k * x1 * x1 / 2)); eq = `${DYDX} = ${k === 1 ? '' : k === -1 ? '−' : k}${X}${Y}`; sol = `${Y} = ${y0}${ex(`${k === 2 ? '' : k === -1 ? '−' : ''}${X}²${k === 2 ? '' : '/2'}`)}`; params = { kind, k, y0, x1 }; }
      else { x1 = rng.pick([1, 2, 3, 4]); ans = r2(Math.sqrt(x1 * x1 + y0 * y0)); eq = `${DYDX} = ${sfrac(X, Y)}`; sol = `${Y} = √(${X}² + ${y0 * y0})`; params = { kind, y0, x1 }; }
      return { prompt: `Solve ${eq} with ${Y}(0) = ${y0}, and find ${Y}(${N(x1)}) to the nearest hundredth.`, type: 'number', answer: ans, tolerance: Math.max(0.01, Math.abs(ans) * 0.002), params,
        hints: [kind === 'xovery' ? `Separate: ${Y} d${Y} = ${X} d${X}, so ${Y}²/2 = ${X}²/2 + ${C}.` : `Separate: d${Y}/${Y} = ${kind === 'ky' ? `${N(params.k)} d${X}` : `${params.k === 1 ? '' : params.k === -1 ? '−' : params.k}${X} d${X}`}, then integrate: ln|${Y}| = ${kind === 'ky' ? `${N(params.k)}${X}` : `${params.k === 2 ? '' : params.k === -1 ? '−' : ''}${X}²${params.k === 2 ? '' : '/2'}`} + ${C}.`,
          `The initial condition gives ${sol}.`, `At ${X} = ${N(x1)}: ${Y} ≈ <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params, f = P.kind === 'ky' ? (x, y) => P.k * y : P.kind === 'xy' ? (x, y) => P.k * x * y : (x, y) => x / y;
      return near(rk4(f, 0, P.y0, P.x1), q.answer, 0.006);
    },
  });

  const SLOPES = [[`${X} + ${Y}`, (x, y) => x + y], [`${X} − 2${Y}`, (x, y) => x - 2 * y], [`${X}${Y}`, (x, y) => x * y], [`${SQ(X)} − ${Y}`, (x, y) => x * x - y], [`${Y}(1 − ${Y})`, (x, y) => y * (1 - y)], [`2${X} − ${Y} + 1`, (x, y) => 2 * x - y + 1], [`(${Y} − 1)${X}`, (x, y) => (y - 1) * x]];
  A.skill({
    id: 'bc.slope-fields', title: 'Slope fields',
    learn: p(`A <b>slope field</b> draws a short segment at many points (${X}, ${Y}), each with the slope that the differential equation gives there. A solution curve follows the segments like a river follows its current.`) +
      p(`<b>To find the slope at a point, put its ${X} and ${Y} into the right side of ${DYDX} = …</b> Where the slope is 0 the segments are flat; where it's positive they tilt up to the right.`) +
      example('Example', `For ${DYDX} = ${X} − 2${Y}, the segment at (3, 1) has slope 3 − 2 = 1, and at (2, 1) it is flat (slope 0).`),
    make(rng) {
      const i = rng.int(0, SLOPES.length - 1), x = rng.int(-3, 4), y = rng.int(-3, 4), slope = SLOPES[i][1](x, y);
      return { prompt: `In the slope field for ${DYDX} = ${SLOPES[i][0]}, what is the slope of the segment at the point ${M.pt(x, y)}?`, type: 'number', answer: slope, params: { i, x, y },
        hints: [`Put ${X} = ${N(x)} and ${Y} = ${N(y)} into ${SLOPES[i][0]}.`, `The slope is <b>${N(slope)}</b>${slope === 0 ? ': a flat segment' : slope > 0 ? ': tilted up to the right' : ': tilted down to the right'}.`] };
    },
    verify(q) { const { i, x, y } = q.params, h = 1e-6; return near((rk4(SLOPES[i][1], x, y, x + h, 1) - y) / h, q.answer, 1e-4); },
  });

  const EULER = [[`${X} + ${Y}`, (x, y) => x + y], [`${X} − ${Y}`, (x, y) => x - y], [`2${X} − ${Y}`, (x, y) => 2 * x - y], [`${X}${Y}`, (x, y) => x * y], [`${Y} − ${X}`, (x, y) => y - x], [`${SQ(X)} + ${Y}`, (x, y) => x * x + y]];
  A.skill({
    id: 'bc.euler', title: 'Euler’s method',
    learn: p(`Euler’s method approximates a solution by walking along short tangent lines. From a point (${X}<sub>${Nn}</sub>, ${Y}<sub>${Nn}</sub>), take a step of size ${V('h')}: <b>${Y}<sub>${Nn}+1</sub> = ${Y}<sub>${Nn}</sub> + ${V('h')} · (slope at (${X}<sub>${Nn}</sub>, ${Y}<sub>${Nn}</sub>))</b> and ${X}<sub>${Nn}+1</sub> = ${X}<sub>${Nn}</sub> + ${V('h')}.`) +
      p(`Repeat until you reach the ${X} you want. Smaller steps give better approximations. Keep a small table of ${X}, ${Y} and the slope.`) +
      example('Example', `${DYDX} = ${X} + ${Y}, ${Y}(0) = 1, ${V('h')} = 0.1: slope 1, so ${Y}(0.1) ≈ 1.1; slope 1.2, so ${Y}(0.2) ≈ 1.1 + 0.12 = 1.22.`),
    make(rng) {
      const i = rng.int(0, EULER.length - 1), x0 = rng.int(0, 2), y0 = rng.int(-2, 4), h = rng.pick([0.1, 0.2, 0.5]), n = rng.pick([2, 3]);
      let x = x0, y = y0; const rows = [];
      for (let s = 0; s < n; s++) { const m = EULER[i][1](x, y); rows.push([x, y, m]); y = y + h * m; x = M.round(x + h, 6); }
      const ans = r4(y);
      return { prompt: `Use Euler’s method with step size ${N(h)} to approximate ${Y}(${N(M.round(x0 + n * h, 6))}) for ${DYDX} = ${EULER[i][0]} with ${Y}(${x0}) = ${N(y0)}. Give 4 decimal places.`, type: 'number', answer: ans, tolerance: 0.0006, params: { i, x0, y0, h, n },
        hints: rows.map(([xx, yy, m], s) => `Step ${s + 1}: at (${N(M.round(xx, 4))}, ${N(M.round(yy, 4))}) the slope is ${N(M.round(m, 4))}, so the next ${Y} is ${N(M.round(yy, 4))} + ${N(h)}(${N(M.round(m, 4))}) = ${N(M.round(yy + h * m, 4))}.`).concat([`So ${Y}(${N(M.round(x0 + n * h, 6))}) ≈ <b>${N(ans)}</b>.`]) };
    },
    verify(q) {
      const { i, x0, y0, h, n } = q.params, f = EULER[i][1];
      // the same recurrence written as y + h·f, accumulated from the other end of a list
      const ys = [y0]; for (let s = 0; s < n; s++) ys.push(ys[s] + h * f(x0 + s * h, ys[s]));
      return near(ys[n], q.answer, 0.00006);
    },
  });

  A.skill({
    id: 'bc.logistic', title: 'Logistic growth',
    learn: p(`The <b>logistic</b> equation ${sfrac(`d${V('P')}`, `d${T}`)} = ${V('k')}${V('P')}(1 − ${V('P')}/${V('M')}) models growth that slows as it nears a limit. <b>${V('M')} is the carrying capacity</b>: if ${V('P')}(0) &gt; 0, then ${V('P')} → ${V('M')} as ${T} → ∞.`) +
      p(`<b>The population grows fastest when ${V('P')} = ${V('M')}/2.</b> If the equation is written as ${sfrac(`d${V('P')}`, `d${T}`)} = ${V('a')}${V('P')} − ${V('b')}${V('P')}², factor it to ${V('a')}${V('P')}(1 − ${V('P')}/(${V('a')}/${V('b')})): the carrying capacity is ${V('a')}/${V('b')}.`) +
      example('Example', `${sfrac(`d${V('P')}`, `d${T}`)} = 0.3${V('P')} − 0.002${V('P')}²: ${V('M')} = 0.3/0.002 = 150, so the growth is fastest at ${V('P')} = 75, and ${V('P')} → 150.`),
    make(rng) {
      const Mc = rng.pick([100, 150, 200, 400, 500, 800, 1000, 1200]), k = rng.pick([0.1, 0.2, 0.3, 0.4, 0.5]), expanded = rng.bool(), kind = rng.pick(['M', 'half', 'limit']);
      const b = k / Mc, P0 = rng.pick([5, 10, 20, 40]);
      const eq = expanded ? `${sfrac(`d${V('P')}`, `d${T}`)} = ${N(k)}${V('P')} − ${N(M.round(b, 8))}${SQ(V('P'))}` : `${sfrac(`d${V('P')}`, `d${T}`)} = ${N(k)}${V('P')}(1 − ${sfrac(V('P'), Mc)})`;
      const ans = kind === 'half' ? Mc / 2 : Mc;
      const ask = kind === 'M' ? 'What is the carrying capacity?' : kind === 'half' ? `For what value of ${V('P')} is the population growing fastest?` : `If ${V('P')}(0) = ${P0}, what is the limit of ${V('P')}(${T}) as ${T} → ∞?`;
      return { prompt: `A population follows ${eq}. ${ask}`, type: 'number', answer: ans, params: { k, Mc, kind, P0 },
        hints: [expanded ? `Factor: ${N(k)}${V('P')}(1 − ${N(M.round(b, 8))}${V('P')}/${N(k)}) = ${N(k)}${V('P')}(1 − ${V('P')}/${Mc}), so ${V('M')} = ${N(k)} ÷ ${N(M.round(b, 8))} = ${Mc}.` : `In the form ${V('k')}${V('P')}(1 − ${V('P')}/${V('M')}), ${V('M')} = ${Mc}.`,
          kind === 'M' ? `The carrying capacity is <b>${Mc}</b>.` : kind === 'half' ? `Fastest growth is at ${V('M')}/2 = <b>${Mc / 2}</b>.` : `Starting above 0, the population heads to the carrying capacity: <b>${Mc}</b>.`] };
    },
    verify(q) {
      const { k, Mc, kind, P0 } = q.params, f = (t, P) => k * P - (k / Mc) * P * P;
      if (kind === 'limit') return near(rk4(f, 0, P0, 300, 30000), q.answer, 1e-3);
      if (kind === 'M') return near(f(0, q.answer), 0, 1e-9) && q.answer > 0;
      // the growth rate kP − bP² is largest where its derivative k − 2bP is 0
      return near(k - 2 * (k / Mc) * q.answer, 0, 1e-9);
    },
  });

  /* ---------- Unit 3: parametric, vector and polar ---------- */
  const polyD = c => c.slice(0, -1).map((ci, i) => ci * (c.length - 1 - i));
  const pev = (c, t) => c.reduce((s, ci) => s * t + ci, 0);
  A.skill({
    id: 'bc.parametric-derivative', title: 'Slopes of parametric curves',
    learn: p(`When a curve is given by ${X} = ${X}(${T}) and ${Y} = ${Y}(${T}), its slope is <b>${DYDX} = ${sfrac(`d${Y}/d${T}`, `d${X}/d${T}`)}</b>: how fast ${Y} changes divided by how fast ${X} changes.`) +
      p(`Find both derivatives, put in the value of ${T}, and divide. The tangent is horizontal where d${Y}/d${T} = 0 (and d${X}/d${T} ≠ 0), and vertical where d${X}/d${T} = 0.`) +
      example('Example', `${X} = ${T}² + 1, ${Y} = ${T}³ − 2${T}. At ${T} = 2: d${X}/d${T} = 4 and d${Y}/d${T} = 3(4) − 2 = 10, so ${DYDX} = 10/4 = ${F(5, 2)}.`),
    make(rng) {
      let cx, cy, t0, dx;
      do { cx = [rng.int(-2, 3), rng.int(-4, 4), rng.int(-5, 5)]; cy = [rng.int(-2, 2), rng.int(-3, 3), rng.int(-4, 4), rng.int(-5, 5)]; t0 = rng.int(-3, 3); dx = pev(polyD(cx), t0); } while (dx === 0 || cx[0] === 0 || cy.slice(0, 3).every(c => c === 0));
      const dy = pev(polyD(cy), t0), ans = fa(dy, dx);
      return { prompt: `A curve is given by ${X} = ${M.poly(cx, 't')} and ${Y} = ${M.poly(cy, 't')}. Find ${DYDX} at ${T} = ${N(t0)}.`, type: 'number', ...ans, params: { cx, cy, t0 },
        hints: [`d${X}/d${T} = ${M.poly(polyD(cx), 't')} and d${Y}/d${T} = ${M.poly(polyD(cy), 't')}.`, `At ${T} = ${N(t0)}: d${X}/d${T} = ${N(dx)} and d${Y}/d${T} = ${N(dy)}.`, `${DYDX} = ${N(dy)} ÷ ${N(dx)} = <b>${ans.answerText || N(ans.answer)}</b>.`] };
    },
    verify(q) {
      const { cx, cy, t0 } = q.params, h = 1e-6;
      return near((pev(cy, t0 + h) - pev(cy, t0 - h)) / (pev(cx, t0 + h) - pev(cx, t0 - h)), q.answer, 1e-6);
    },
  });

  A.skill({
    id: 'bc.vector-motion', title: 'Motion along a curve',
    learn: p(`A particle at position ⟨${X}(${T}), ${Y}(${T})⟩ has <b>velocity ⟨${X}′(${T}), ${Y}′(${T})⟩</b> and <b>acceleration ⟨${X}″(${T}), ${Y}″(${T})⟩</b>. Its <b>speed</b> is the length of the velocity vector: √(${X}′(${T})² + ${Y}′(${T})²).`) +
      p(`Speed is never negative. The particle is momentarily at rest only when both velocity components are 0.`) +
      example('Example', `Position ⟨${T}² − 3${T}, ${T}³⟩ at ${T} = 1: velocity ⟨2 − 3, 3⟩ = ⟨−1, 3⟩, speed √10 ≈ 3.16, acceleration ⟨2, 6⟩.`),
    make(rng) {
      const cx = [rng.int(1, 3), rng.int(-5, 5), rng.int(-4, 4)], cy = [rng.pick([1, -1, 2]), rng.int(-3, 3), rng.int(-5, 5), rng.int(-3, 3)], t0 = rng.int(0, 3);
      const vx = pev(polyD(cx), t0), vy = pev(polyD(cy), t0), ax = pev(polyD(polyD(cx)), t0), ay = pev(polyD(polyD(cy)), t0), kind = rng.pick(['speed', 'speed', 'vx', 'vy', 'ay']);
      const ans = kind === 'speed' ? r2(Math.hypot(vx, vy)) : { vx, vy, ay }[kind];
      const what = { speed: 'its speed, to the nearest hundredth', vx: `the ${X}-component of its velocity`, vy: `the ${Y}-component of its velocity`, ay: `the ${Y}-component of its acceleration` }[kind];
      return { prompt: `A particle moves with position ⟨${M.poly(cx, 't')}, ${M.poly(cy, 't')}⟩. At ${T} = ${t0}, find ${what}.`, type: 'number', answer: ans, tolerance: kind === 'speed' ? 0.01 : undefined, params: { cx, cy, t0, kind },
        hints: [`Velocity: ⟨${M.poly(polyD(cx), 't')}, ${M.poly(polyD(cy), 't')}⟩${kind === 'ay' ? `; acceleration: ⟨${M.poly(polyD(polyD(cx)), 't')}, ${M.poly(polyD(polyD(cy)), 't')}⟩` : ''}.`,
          kind === 'speed' ? `At ${T} = ${t0} the velocity is ⟨${N(vx)}, ${N(vy)}⟩, so the speed is √(${vx * vx} + ${vy * vy}) ≈ <b>${N(ans)}</b>.` : `At ${T} = ${t0}: <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const { cx, cy, t0, kind } = q.params, h = 1e-4, d = (c, t) => (pev(c, t + h) - pev(c, t - h)) / (2 * h), d2 = (c, t) => (pev(c, t + h) - 2 * pev(c, t) + pev(c, t - h)) / (h * h);
      const got = { speed: Math.hypot(d(cx, t0), d(cy, t0)), vx: d(cx, t0), vy: d(cy, t0), ay: d2(cy, t0) }[kind];
      return near(got, q.answer, kind === 'speed' ? 0.0051 : 1e-5);
    },
  });

  A.skill({
    id: 'bc.arc-length', title: 'Arc length',
    learn: p(`The length of the graph of ${Y} = ${V('f')}(${X}) from ${X} = ${V('a')} to ${V('b')} is <b>${integ(V('a'), V('b'))} √(1 + ${V('f')}′(${X})²) d${X}</b>. For a parametric curve, it is <b>${integ(V('a'), V('b'))} √(${X}′(${T})² + ${Y}′(${T})²) d${T}</b>, which is distance traveled.`) +
      p(`Most arc-length integrals need a calculator. A few come out exactly, because 1 + ${V('f')}′(${X})² turns out to be a perfect square or something simple.`) +
      example('Example', `${Y} = ${F(2, 3)}${X}<sup>3/2</sup> from 0 to 3: ${V('f')}′(${X}) = √${X}, so the length is ∫<sub>0</sub><sup>3</sup> √(1 + ${X}) d${X} = ${F(2, 3)}(4<sup>3/2</sup> − 1) = ${F(14, 3)}.`),
    make(rng) {
      const kind = rng.pick(['pow', 'circle', 'line']);
      if (kind === 'pow') {
        const b = rng.pick([3, 8, 15, 24]), s = Math.sqrt(1 + b), ans = fa(2 * (s * s * s - 1), 3);
        return { prompt: `Find the length of the curve ${Y} = ${F(2, 3)}${X}<sup>3/2</sup> from ${X} = 0 to ${X} = ${b}.`, type: 'number', ...ans, params: { kind, b },
          hints: [`${Y}′ = √${X}, so 1 + (${Y}′)² = 1 + ${X}.`, `The length is ∫<sub>0</sub><sup>${b}</sup> √(1 + ${X}) d${X} = ${F(2, 3)}(1 + ${X})<sup>3/2</sup> from 0 to ${b}.`, `= ${F(2, 3)}(${s ** 3} − 1) = <b>${ans.answerText || N(ans.answer)}</b>.`] };
      }
      if (kind === 'circle') {
        const r = rng.int(2, 9), d = rng.pick([60, 90, 120, 180, 270, 360]), th = d * Math.PI / 180, ans = r2(r * th);
        return { prompt: `Find the distance traveled along ${X} = ${r} cos ${T}, ${Y} = ${r} sin ${T} from ${T} = 0 to ${T} = ${M.fracText(d, 180).replace(/^1\//, '/').replace(/^(\d*)\/?(\d*)$/, (m0, a, bb) => `${a === '1' || a === '' ? '' : a}π${bb ? '/' + bb : ''}`)}, to the nearest hundredth.`, type: 'number', answer: ans, tolerance: 0.01, params: { kind, r, d },
          hints: [`${X}′ = −${r} sin ${T} and ${Y}′ = ${r} cos ${T}, so √(${X}′² + ${Y}′²) = √(${r * r}(sin² + cos²)) = ${r}.`, `The length is ${r} times the change in ${T}: ${r} × ${N(r4(th))} ≈ <b>${N(ans)}</b>.`] };
      }
      const a = rng.int(-4, 5) || 2, c = rng.int(-4, 5) || 3, Tt = rng.int(1, 4), ans = r2(Tt * Math.hypot(a, c));
      return { prompt: `Find the length of the path ${X} = ${M.poly([a, rng.int(-3, 3)], 't')}, ${Y} = ${M.poly([c, 1], 't')} from ${T} = 0 to ${T} = ${Tt}, to the nearest hundredth.`, type: 'number', answer: ans, tolerance: 0.01, params: { kind, a, c, Tt },
        hints: [`${X}′ = ${N(a)} and ${Y}′ = ${N(c)}, so the integrand is √(${a * a} + ${c * c}), a constant.`, `Length = ${Tt} × √${a * a + c * c} ≈ <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'pow') return near(simpson(x => Math.sqrt(1 + (Math.sqrt(x)) ** 2), 0, P.b), q.answer, 1e-6);
      if (P.kind === 'circle') return near(simpson(t => Math.hypot(-P.r * Math.sin(t), P.r * Math.cos(t)), 0, P.d * Math.PI / 180), q.answer, 0.0051);
      return near(simpson(() => Math.hypot(P.a, P.c), 0, P.Tt), q.answer, 0.0051);
    },
  });

  const POLAR = [[`2 + cos ${TH}`, t => 2 + Math.cos(t), t => -Math.sin(t)], [`1 + 2 sin ${TH}`, t => 1 + 2 * Math.sin(t), t => 2 * Math.cos(t)], [`3 sin ${TH}`, t => 3 * Math.sin(t), t => 3 * Math.cos(t)], [`2${TH}`, t => 2 * t, () => 2], [`4 cos(2${TH})`, t => 4 * Math.cos(2 * t), t => -8 * Math.sin(2 * t)], [`1 − cos ${TH}`, t => 1 - Math.cos(t), t => Math.sin(t)]];
  const ANG = [[30, 'π/6'], [45, 'π/4'], [60, 'π/3'], [120, '2π/3'], [135, '3π/4'], [150, '5π/6']];
  A.skill({
    id: 'bc.polar-slope', title: 'Slopes of polar curves',
    learn: p(`A polar curve ${V('r')} = ${V('f')}(${TH}) is the parametric curve ${X} = ${V('r')} cos ${TH}, ${Y} = ${V('r')} sin ${TH}. So its slope is <b>${DYDX} = ${sfrac(`${V('r')}′ sin ${TH} + ${V('r')} cos ${TH}`, `${V('r')}′ cos ${TH} − ${V('r')} sin ${TH}`)}</b>, where ${V('r')}′ = d${V('r')}/d${TH}.`) +
      p(`Work out ${V('r')} and ${V('r')}′ at the angle first, then put them in. Don't confuse ${DYDX} (the slope) with d${V('r')}/d${TH} (how fast the distance from the origin changes).`) +
      example('Example', `${V('r')} = 2${TH} at ${TH} = π/2: ${V('r')} = π, ${V('r')}′ = 2, so ${DYDX} = (2 · 1 + π · 0)/(2 · 0 − π · 1) = −2/π ≈ −0.64.`),
    make(rng) {
      let i, ang, slope;
      do { i = rng.int(0, POLAR.length - 1); ang = rng.pick(ANG); const t = ang[0] * Math.PI / 180, r = POLAR[i][1](t), dr = POLAR[i][2](t), den = dr * Math.cos(t) - r * Math.sin(t); slope = Math.abs(den) < 1e-6 ? Infinity : (dr * Math.sin(t) + r * Math.cos(t)) / den; } while (!isFinite(slope) || Math.abs(slope) > 50);
      const t = ang[0] * Math.PI / 180, r = POLAR[i][1](t), dr = POLAR[i][2](t), ans = r2(slope);
      return { prompt: `Find the slope ${DYDX} of the polar curve ${V('r')} = ${POLAR[i][0]} at ${TH} = ${ang[1]}, to the nearest hundredth.`, type: 'number', answer: ans, tolerance: 0.01, params: { i, d: ang[0] },
        hints: [`At ${TH} = ${ang[1]}: ${V('r')} ≈ ${N(r4(r))} and ${V('r')}′ ≈ ${N(r4(dr))}.`, `${DYDX} = (${V('r')}′ sin ${TH} + ${V('r')} cos ${TH}) ÷ (${V('r')}′ cos ${TH} − ${V('r')} sin ${TH}).`, `≈ ${N(r4(dr * Math.sin(t) + r * Math.cos(t)))} ÷ ${N(r4(dr * Math.cos(t) - r * Math.sin(t)))} ≈ <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const { i, d } = q.params, t = d * Math.PI / 180, x = s => POLAR[i][1](s) * Math.cos(s), y = s => POLAR[i][1](s) * Math.sin(s);
      return near(deriv(y, t) / deriv(x, t), q.answer, 0.0051);
    },
  });

  A.skill({
    id: 'bc.polar-area', title: 'Area in polar coordinates',
    learn: p(`The area swept out by a polar curve ${V('r')} = ${V('f')}(${TH}) from ${TH} = ${V('α')} to ${TH} = ${V('β')} is <b>${integ(V('α'), V('β'))} ½${V('r')}² d${TH}</b>, adding up thin pizza-slice sectors.`) +
      p(`Choose the limits so the curve is traced exactly once: a circle ${V('r')} = ${V('a')} cos ${TH} is traced once from −π/2 to π/2, a cardioid ${V('r')} = ${V('a')}(1 + cos ${TH}) from 0 to 2π, and one petal of ${V('r')} = ${V('a')} sin(2${TH}) from 0 to π/2.`) +
      example('Example', `One petal of ${V('r')} = 2 sin(2${TH}): ∫<sub>0</sub><sup>π/2</sup> ½ · 4 sin²(2${TH}) d${TH} = 2 · π/4 = π/2 ≈ 1.57.`),
    make(rng) {
      const a = rng.int(1, 6), kind = rng.pick(['circle', 'cardioid', 'petal', 'sector', 'sinecircle']);
      const ac = a === 1 ? '' : a;
      const D = { circle: [`${ac} cos ${TH}`, 'the whole curve', Math.PI * a * a / 4, `It is a circle of diameter ${a}, traced once from −π/2 to π/2: ½∫ ${a * a} cos² ${TH} d${TH} = π(${a})²/4.`],
        cardioid: [`${a}(1 + cos ${TH})`, 'the whole curve', 1.5 * Math.PI * a * a, `½∫<sub>0</sub><sup>2π</sup> ${a * a}(1 + cos ${TH})² d${TH} = ${a * a}/2 · 3π = 3π(${a})²/2.`],
        petal: [`${ac} sin(2${TH})`, 'one petal', Math.PI * a * a / 8, `One petal runs from 0 to π/2: ½∫ ${a * a} sin²(2${TH}) d${TH} = π(${a})²/8.`],
        sector: [`${a}`, `the region from ${TH} = 0 to ${TH} = 2π/3`, (a * a / 2) * (2 * Math.PI / 3), `½ · ${a * a} · (2π/3) = ${a * a}π/3.`],
        sinecircle: [`${2 * a} sin ${TH}`, 'the whole curve', Math.PI * a * a, `It is a circle of radius ${a}, traced once from 0 to π: area π(${a})².`] }[kind];
      const ans = r2(D[2]);
      return { prompt: `Find the area enclosed by ${D[1]} of the polar curve ${V('r')} = ${D[0]}, to the nearest hundredth.`, type: 'number', answer: ans, tolerance: Math.max(0.01, ans * 0.002), params: { kind, a },
        hints: [`Area = ∫ ½${V('r')}² d${TH} over limits that trace it once.`, D[3], `≈ <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const { kind, a } = q.params;
      const [f, lo, hi] = { circle: [t => a * Math.cos(t), -Math.PI / 2, Math.PI / 2], cardioid: [t => a * (1 + Math.cos(t)), 0, 2 * Math.PI], petal: [t => a * Math.sin(2 * t), 0, Math.PI / 2], sector: [() => a, 0, 2 * Math.PI / 3], sinecircle: [t => 2 * a * Math.sin(t), 0, Math.PI] }[kind];
      return near(simpson(t => f(t) ** 2 / 2, lo, hi), q.answer, 0.0051);
    },
  });

  /* ---------- Unit 4: sequences and series ---------- */
  const DIV = 'Diverges';
  A.skill({
    id: 'bc.sequence-limits', title: 'Limits of sequences',
    learn: p(`A sequence ${V('a')}<sub>${Nn}</sub> <b>converges</b> to ${V('L')} if its terms get as close to ${V('L')} as you like for large ${Nn}; otherwise it diverges. Use the same tools as for limits of functions as ${X} → ∞.`) +
      p(`<b>Ratios of polynomials:</b> compare the highest powers. <b>Powers:</b> ${V('r')}<sup>${Nn}</sup> → 0 if |${V('r')}| &lt; 1, and diverges if ${V('r')} &gt; 1 or ${V('r')} ≤ −1. <b>Growth order:</b> ln ${Nn} ≪ ${Nn}<sup>${V('k')}</sup> ≪ ${V('b')}<sup>${Nn}</sup> ≪ ${Nn}!. And (1 + ${V('k')}/${Nn})<sup>${Nn}</sup> → ${ex(V('k'))}.`) +
      example('Example', `${sfrac(`3${Nn}² + 1`, `2${Nn}² − ${Nn}`)} → ${F(3, 2)}, ${sfrac(`${Nn}<sup>3</sup>`, `2<sup>${Nn}</sup>`)} → 0, and (−1.2)<sup>${Nn}</sup> diverges.`),
    make(rng) {
      const kind = rng.pick(['ratio-same', 'ratio-lower', 'ratio-higher', 'power', 'e', 'growth']);
      let expr, ans, why, params;
      if (kind === 'ratio-same') { const a = rng.int(1, 6), b = rng.int(1, 6), c = rng.int(-5, 5); expr = sfrac(`${a === 1 ? '' : a}${Nn}² ${M.signed(c)}`, `${b === 1 ? '' : b}${Nn}² + ${Nn}`); ans = M.fracText(a, b); why = `Same highest power: divide the leading coefficients, ${a}/${b}.`; params = { kind, a, b, c }; }
      else if (kind === 'ratio-lower') { const a = rng.int(1, 6), b = rng.int(1, 6); expr = sfrac(`${a === 1 ? '' : a}${Nn} + 4`, `${b === 1 ? '' : b}${Nn}² − 1`); ans = '0'; why = 'The bottom has the higher power, so the terms go to 0.'; params = { kind, a, b }; }
      else if (kind === 'ratio-higher') { const a = rng.int(1, 6), b = rng.int(1, 6); expr = sfrac(`${a === 1 ? '' : a}${Nn}³`, `${b === 1 ? '' : b}${Nn}² + 5`); ans = DIV; why = 'The top has the higher power, so the terms grow without bound.'; params = { kind, a, b }; }
      else if (kind === 'power') { const [rr, txt] = rng.pick([[0.5, '0.5'], [-0.8, '−0.8'], [1.1, '1.1'], [-1, '−1'], [-1.5, '−1.5'], [0.9, '0.9']]); expr = `(${txt})<sup>${Nn}</sup>`; ans = Math.abs(rr) < 1 ? '0' : DIV; why = Math.abs(rr) < 1 ? `|${txt}| &lt; 1, so the powers shrink to 0.` : rr === -1 ? 'The terms flip between −1 and 1 forever.' : `|${txt}| &gt; 1, so the terms grow without bound.`; params = { kind, rr }; }
      else if (kind === 'e') { const k = rng.pick([1, 2, 3, -1, -2]); expr = `(1 ${k < 0 ? '−' : '+'} ${sfrac(Math.abs(k), Nn)})<sup>${Nn}</sup>`; ans = k === 1 ? 'e' : `e<sup>${N(k)}</sup>`; why = `(1 + ${V('k')}/${Nn})<sup>${Nn}</sup> → ${ex(V('k'))}, with ${V('k')} = ${N(k)}.`; params = { kind, k }; }
      else { const k = rng.int(2, 5), b = rng.pick([2, 3, 1.5]); expr = sfrac(`${Nn}<sup>${k}</sup>`, `${N(b)}<sup>${Nn}</sup>`); ans = '0'; why = `An exponential grows much faster than any power, so the terms go to 0.`; params = { kind, k, b }; }
      const answer = ans === DIV ? DIV : `Converges to ${ans}`;
      const pool = [DIV, 'Converges to 0', 'Converges to 1', `Converges to ${kind === 'e' ? 'e' : '∞'.replace('∞', '2')}`, kind === 'ratio-same' ? `Converges to ${M.fracText(params.b, params.a)}` : null];
      return { prompt: `Does the sequence converge or diverge? If it converges, to what?${big(`${V('a')}<sub>${Nn}</sub> = ${expr}`)}`, type: 'choice', answer, choices: options(answer, pool), params, hints: [why, `<b>${answer}</b>.`] };
    },
    verify(q) {
      const P = q.params, a = { 'ratio-same': n => (P.a * n * n + P.c) / (P.b * n * n + n), 'ratio-lower': n => (P.a * n + 4) / (P.b * n * n - 1), 'ratio-higher': n => P.a * n ** 3 / (P.b * n * n + 5), power: n => P.rr ** n, e: n => (1 + P.k / n) ** n, growth: n => n ** P.k / P.b ** n }[P.kind];
      const n1 = P.kind === 'power' || P.kind === 'growth' ? 400 : 1e7, v1 = a(n1), v2 = a(n1 + 1);
      if (q.answer === DIV) return !(Math.abs(v1 - v2) < 1e-4 && isFinite(v1));
      const s = A.stripTags(q.answer).replace('Converges to', '').trim(), target = s === 'e' ? Math.E : s.startsWith('e') ? Math.exp(Number(s.slice(1).trim().replace('−', '-'))) : s.includes('/') ? s.split('/').map(Number).reduce((x, y) => x / y) : Number(s);
      return near(v1, target, 1e-4);
    },
  });

  A.skill({
    id: 'bc.geometric-series', title: 'Geometric series',
    learn: p(`A geometric series multiplies by the same ratio ${V('r')} each time: ${V('a')} + ${V('a')}${V('r')} + ${V('a')}${V('r')}² + …. <b>If |${V('r')}| &lt; 1, it converges to ${sfrac(V('a'), `1 − ${V('r')}`)}, where ${V('a')} is the first term. If |${V('r')}| ≥ 1, it diverges.</b>`) +
      p(`Watch the starting index: Σ<sub>${Nn}=1</sub><sup>∞</sup> 3(${F(1, 2)})<sup>${Nn}</sup> starts at 3 · ${F(1, 2)}, so its first term is ${F(3, 2)}, not 3.`) +
      example('Example', `Σ<sub>${Nn}=0</sub><sup>∞</sup> 6(${F(1, 3)})<sup>${Nn}</sup> = 6 ÷ (1 − ${F(1, 3)}) = 9, while Σ 2(${F(3, 2)})<sup>${Nn}</sup> diverges.`),
    make(rng) {
      const a = rng.pick([1, 2, 3, 4, 5, 6, 8, 10]), [rn, rd] = rng.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [-1, 2], [-1, 3], [-2, 3], [3, 2], [5, 4], [-3, 2]]), start = rng.pick([0, 1]);
      const r = rn / rd, first = start === 0 ? [a, 1] : M.simp(a * rn, rd);
      const conv = Math.abs(r) < 1, sum = conv ? M.simp(first[0] * rd, first[1] * (rd - rn)) : null;
      const val = s => `Converges to ${M.fracText(s[0], s[1])}`;
      const answer = conv ? val(sum) : DIV;
      const pool = [DIV, conv ? val(M.simp(a * rd, rd - rn)) : val([a, 1]), conv ? val(M.simp(a * rd, rd + rn)) : val(M.simp(a * rd, Math.abs(rd - rn))), val([a * 2, 1])];
      const rT = `${rn < 0 ? '(−' : '('}${F(Math.abs(rn), rd)})`;
      return { prompt: `Find the sum, or say that the series diverges.${big(`${sigma(`${Nn}=${start}`, '∞')} ${a === 1 ? '' : a}${rT}<sup>${Nn}</sup>`)}`, type: 'choice', answer, choices: options(answer, pool), params: { a, rn, rd, start },
        hints: [`The ratio is ${V('r')} = ${M.fracText(rn, rd)}${conv ? ', and |r| &lt; 1, so it converges' : ', and |r| ≥ 1, so it diverges'}.`, conv ? `The first term (${Nn} = ${start}) is ${M.fracText(first[0], first[1])}. Sum = ${M.fracText(first[0], first[1])} ÷ (1 − ${rn < 0 ? `(${M.fracText(rn, rd)})` : M.fracText(rn, rd)}) = <b>${M.fracText(sum[0], sum[1])}</b>.` : `<b>${DIV}</b>.`] };
    },
    verify(q) {
      const { a, rn, rd, start } = q.params, r = rn / rd; let s = 0, last = 0;
      for (let n = start; n < start + 3000; n++) { last = a * r ** n; s += last; if (!isFinite(s)) break; }
      if (q.answer === DIV) return !(Math.abs(last) < 1e-9);
      const t = A.stripTags(q.answer).replace('Converges to', '').trim(), target = t.includes('/') ? t.split('/').map(x => Number(x.replace('−', '-'))).reduce((x, y) => x / y) : Number(t.replace('−', '-'));
      return near(s, target, 1e-9);
    },
  });

  const CLASS = ['Converges absolutely', 'Converges conditionally', 'Diverges'];
  /** series families: [how it prints, its terms, its classification index, the test to use] */
  function seriesFamily(fam, k) {
    const nk = `${Nn}<sup>${k}</sup>`;
    return {
      p: [sfrac('1', k === 1 ? Nn : nk), n => 1 / n ** k, k > 1 ? 0 : 2, k > 1 ? `a ${V('p')}-series with ${V('p')} = ${k} &gt; 1` : `the harmonic series (${V('p')} = 1)`],
      halfp: [sfrac('1', `√${Nn}`), n => 1 / Math.sqrt(n), 2, `a ${V('p')}-series with ${V('p')} = ½ ≤ 1`],
      altp: [sfrac(`(−1)<sup>${Nn}</sup>`, k === 1 ? Nn : nk), n => (-1) ** n / n ** k, k > 1 ? 0 : 1, k > 1 ? `the absolute values form a ${V('p')}-series with ${V('p')} = ${k} &gt; 1` : 'the alternating series test gives convergence, but the absolute values form the harmonic series, which diverges'],
      nth: [sfrac(Nn, `${Nn} + ${k}`), n => n / (n + k), 2, `the ${Nn}th-term test: the terms go to 1, not 0`],
      altnth: [sfrac(`(−1)<sup>${Nn}</sup>${Nn}`, `${Nn} + ${k}`), n => (-1) ** n * n / (n + k), 2, 'the terms don’t go to 0 (their size goes to 1)'],
      fact: [sfrac(`${k + 1}<sup>${Nn}</sup>`, `${Nn}!`), n => Math.exp(n * Math.log(k + 1) - lnFact(n)), 0, `the ratio test: the ratio of terms is ${k + 1}/(${Nn} + 1) → 0`],
      geomGrow: [sfrac(`${k + 1}<sup>${Nn}</sup>`, nk), n => (k + 1) ** n / n ** k, 2, `the terms grow, since an exponential beats any power`],
      powExp: [sfrac(nk, `${k + 1}<sup>${Nn}</sup>`), n => n ** k / (k + 1) ** n, 0, `the ratio test: the ratio of terms → 1/${k + 1} &lt; 1`],
      comp: [sfrac('1', `${Nn}² + ${k}`), n => 1 / (n * n + k), 0, `comparison with Σ 1/${Nn}², a convergent ${V('p')}-series`],
      shift: [sfrac('1', `${Nn} + ${k}`), n => 1 / (n + k), 2, `limit comparison with the harmonic series Σ 1/${Nn}`],
      altshift: [sfrac(`(−1)<sup>${Nn}</sup>`, `${Nn} + ${k}`), n => (-1) ** n / (n + k), 1, 'the alternating series test gives convergence, but the absolute values behave like the harmonic series'],
    }[fam];
  }
  A.skill({
    id: 'bc.convergence-tests', title: 'Convergence tests',
    learn: p(`<b>Check in this order.</b> If the terms don't go to 0, the series diverges (the ${Nn}th-term test). Recognize a geometric series or a ${V('p')}-series Σ 1/${Nn}<sup>${V('p')}</sup> (converges only if ${V('p')} &gt; 1). Compare with one of those. Use the ratio test for factorials and exponentials. Use the alternating series test when the signs alternate.`) +
      p(`A series <b>converges absolutely</b> if Σ|${V('a')}<sub>${Nn}</sub>| converges. It <b>converges conditionally</b> if it converges but Σ|${V('a')}<sub>${Nn}</sub>| diverges, like the alternating harmonic series Σ (−1)<sup>${Nn}</sup>/${Nn}.`) +
      example('Example', `Σ 1/${Nn}² converges absolutely (${V('p')} = 2). Σ (−1)<sup>${Nn}</sup>/${Nn} converges conditionally. Σ ${Nn}/(${Nn} + 1) diverges, since its terms go to 1.`),
    make(rng) {
      const fam = rng.pick(['p', 'halfp', 'altp', 'nth', 'altnth', 'fact', 'geomGrow', 'powExp', 'comp', 'shift', 'altshift']);
      const k = fam === 'p' || fam === 'altp' ? rng.pick([1, 2, 3]) : rng.int(1, 4), f = seriesFamily(fam, k), answer = CLASS[f[2]];
      return { prompt: `Does the series converge absolutely, converge conditionally, or diverge?${big(`${sigma(`${Nn}=1`, '∞')} ${f[0]}`)}`, type: 'choice', keepOrder: true, answer, choices: CLASS.slice(), params: { fam, k },
        hints: [`Here: ${f[3]}.`, `So it <b>${answer.toLowerCase()}</b>.`] };
    },
    verify(q) {
      const { fam, k } = q.params, f = seriesFamily(fam, k)[1];
      // numeric evidence: partial sums of |a_n| and of a_n at two lengths
      const S = (g, n) => { let s = 0; for (let i = 1; i <= n; i++) s += g(i); return s; }, ab = n => Math.abs(f(n));
      const big1 = 2000, big2 = 64000, termsTo0 = Math.abs(f(big2)) < 1e-2;
      const absGrows = S(ab, big2) - S(ab, big1) > 0.5, sumSettles = Math.abs(S(f, big2) - S(f, big1)) < 0.05;
      const cls = !termsTo0 ? 2 : !absGrows ? 0 : sumSettles && fam.startsWith('alt') ? 1 : 2;
      return q.answer === CLASS[cls];
    },
  });

  A.skill({
    id: 'bc.alternating-error', title: 'Alternating series error',
    learn: p(`If an alternating series has terms that shrink steadily to 0, then after adding the first ${Nn} terms, <b>the error is at most the size of the first term you left out</b>: |${V('S')} − ${V('S')}<sub>${Nn}</sub>| ≤ |${V('a')}<sub>${Nn}+1</sub>|.`) +
      p(`So to estimate an alternating sum within a given error, keep adding terms until the next one is smaller than that error.`) +
      example('Example', `Σ (−1)<sup>${Nn}+1</sup>/${Nn}²: after 4 terms the error is at most the 5th term's size, 1/25 = 0.04.`),
    make(rng) {
      const fam = rng.pick(['sq', 'cube', 'fact', 'pow2', 'lin']), n = rng.int(3, 7);
      const [html, term] = { sq: [sfrac('1', `${Nn}²`), m => 1 / (m * m)], cube: [sfrac('1', `${Nn}<sup>3</sup>`), m => 1 / m ** 3], fact: [sfrac('1', `${Nn}!`), m => 1 / fact(m)], pow2: [sfrac('1', `2<sup>${Nn}</sup>`), m => 1 / 2 ** m], lin: [sfrac('1', Nn), m => 1 / m] }[fam];
      const den = { sq: (n + 1) ** 2, cube: (n + 1) ** 3, fact: fact(n + 1), pow2: 2 ** (n + 1), lin: n + 1 }[fam];
      return { prompt: `The first ${n} terms of ${sigma(`${Nn}=1`, '∞')} (−1)<sup>${Nn}+1</sup>${html} are added. What is the alternating series error bound for this estimate? Write it as a fraction.`, type: 'number', answer: 1 / den, answerText: `1/${den}`, params: { fam, n },
        hints: [`The error is at most the first term left out, the ${M.ordinal(n + 1)}.`, `Its size is <b>1/${den}</b>.`] };
    },
    verify(q) {
      const { fam, n } = q.params, term = { sq: m => 1 / (m * m), cube: m => 1 / m ** 3, fact: m => 1 / fact(m), pow2: m => 1 / 2 ** m, lin: m => 1 / m }[fam];
      let S = 0, Sn = 0; for (let m = 1; m <= 200000; m++) { const t = (-1) ** (m + 1) * term(m); S += t; if (m === n) Sn = S; if (fam === 'fact' && m > 30) break; }
      return near(term(n + 1), q.answer, 1e-12) && Math.abs(S - Sn) <= q.answer + 1e-9;
    },
  });

  const INTERVALS = (a, c) => [`(${N(a - c)}, ${N(a + c)})`, `[${N(a - c)}, ${N(a + c)})`, `(${N(a - c)}, ${N(a + c)}]`, `[${N(a - c)}, ${N(a + c)}]`];
  A.skill({
    id: 'bc.radius-convergence', title: 'Radius and interval of convergence',
    learn: p(`A power series Σ ${V('c')}<sub>${Nn}</sub>(${X} − ${V('a')})<sup>${Nn}</sup> converges in an interval centered at ${V('a')}. <b>Use the ratio test:</b> find the limit of |${V('c')}<sub>${Nn}+1</sub>(${X} − ${V('a')})<sup>${Nn}+1</sup> ÷ ${V('c')}<sub>${Nn}</sub>(${X} − ${V('a')})<sup>${Nn}</sup>| and set it less than 1. That gives |${X} − ${V('a')}| &lt; ${V('R')}, the <b>radius of convergence</b>.`) +
      p(`<b>The endpoints must be checked separately</b> by putting them into the series: each one might converge or diverge.`) +
      example('Example', `Σ (${X} − 2)<sup>${Nn}</sup>/(${Nn} · 3<sup>${Nn}</sup>): the ratio test gives |${X} − 2|/3 &lt; 1, so ${V('R')} = 3. At ${X} = 5 it's the harmonic series (diverges); at ${X} = −1 it's the alternating harmonic series (converges). The interval is [−1, 5).`),
    make(rng) {
      const a = rng.int(-4, 4), c = rng.pick([1, 2, 3, 4, 5]), fam = rng.pick(['plain', 'over-n', 'over-n2', 'times-n']), kind = rng.bool() ? 'R' : 'interval';
      const xa = a === 0 ? X : `(${X} ${a > 0 ? '−' : '+'} ${Math.abs(a)})`, cn = c === 1 ? '' : `${c}<sup>${Nn}</sup>`;
      const body = { plain: sfrac(`${xa}<sup>${Nn}</sup>`, cn || '1'), 'over-n': sfrac(`${xa}<sup>${Nn}</sup>`, `${Nn}${cn ? ' · ' + cn : ''}`), 'over-n2': sfrac(`${xa}<sup>${Nn}</sup>`, `${Nn}²${cn ? ' · ' + cn : ''}`), 'times-n': sfrac(`${Nn}${xa}<sup>${Nn}</sup>`, cn || '1') }[fam].replace(/<span class="den">1<\/span>/, '<span class="den">1</span>');
      const series = `${sigma(`${Nn}=1`, '∞')} ${c === 1 && (fam === 'plain' || fam === 'times-n') ? (fam === 'plain' ? `${xa}<sup>${Nn}</sup>` : `${Nn}${xa}<sup>${Nn}</sup>`) : body}`;
      if (kind === 'R') return { prompt: `Find the radius of convergence.${big(series)}`, type: 'number', answer: c, params: { kind, a, c, fam },
        hints: [`Ratio test: the ratio of consecutive terms approaches |${xa.replace(/^\(|\)$/g, '')}| ÷ ${c}${fam === 'plain' ? '' : ' (the factors of ' + Nn + ' approach 1)'}.`, `|${xa.replace(/^\(|\)$/g, '')}| ÷ ${c} &lt; 1 means |${xa.replace(/^\(|\)$/g, '')}| &lt; ${c}, so <b>${V('R')} = ${c}</b>.`] };
      const idx = { plain: 0, 'times-n': 0, 'over-n': 1, 'over-n2': 3 }[fam], ivs = INTERVALS(a, c), answer = ivs[idx];
      return { prompt: `Find the interval of convergence.${big(series)}`, type: 'choice', keepOrder: true, answer, choices: ivs, params: { kind, a, c, fam },
        hints: [`The radius is ${c}, so check the endpoints ${N(a - c)} and ${N(a + c)}.`, { plain: 'At both endpoints the terms are ±1 and don’t go to 0: both diverge.', 'times-n': `At both endpoints the terms are ±${Nn}: both diverge.`, 'over-n': `At ${N(a + c)} you get Σ 1/${Nn} (diverges); at ${N(a - c)}, Σ (−1)<sup>${Nn}</sup>/${Nn} (converges).`, 'over-n2': `At both endpoints you get Σ (±1)<sup>${Nn}</sup>/${Nn}², which converges absolutely.` }[fam], `The interval is <b>${answer}</b>.`] };
    },
    verify(q) {
      const { kind, a, c, fam } = q.params, base = n => ({ plain: 1, 'times-n': n, 'over-n': 1 / n, 'over-n2': 1 / (n * n) }[fam]);
      const conv = x => { const t = n => base(n) * ((x - a) / c) ** n; let s1 = 0, s2 = 0; for (let n = 1; n <= 64000; n++) { s2 += t(n); if (n === 2000) s1 = s2; } return Math.abs(t(64000)) < 1e-2 && Math.abs(s2 - s1) < 0.05; };
      if (!conv(a + c * 0.9) || !conv(a - c * 0.9) || conv(a + c * 1.1)) return 'radius mismatch';
      if (kind === 'R') return q.answer === c;
      const L = conv(a - c), Rr = conv(a + c);
      return q.answer === `${L ? '[' : '('}${N(a - c)}, ${N(a + c)}${Rr ? ']' : ')'}`;
    },
  });

  /* ---------- Unit 5: Taylor and Maclaurin series ---------- */
  /** functions with known Maclaurin series: how they print, the complex function, and the real one */
  function fnOf(name, a) {
    const ax = kx(a);
    return {
      exp: [`${ex(ax)}`, z => cexp([a * z[0], a * z[1]]), x => Math.exp(a * x)],
      sin: [`sin(${ax})`, z => csin([a * z[0], a * z[1]]), x => Math.sin(a * x)],
      cos: [`cos(${ax})`, z => ccos([a * z[0], a * z[1]]), x => Math.cos(a * x)],
      log: [`ln(1 ${a < 0 ? '−' : '+'} ${kx(Math.abs(a))})`, z => clog([1 + a * z[0], a * z[1]]), x => Math.log(1 + a * x)],
      geo: [sfrac('1', `1 ${a < 0 ? '+' : '−'} ${kx(Math.abs(a))}`), z => cdiv([1, 0], [1 - a * z[0], -a * z[1]]), x => 1 / (1 - a * x)],
      xexp: [`${X}${ex(ax)}`, z => cmul(z, cexp([a * z[0], a * z[1]])), x => x * Math.exp(a * x)],
    }[name];
  }
  /** the exact Maclaurin coefficient cₖ as [numerator, denominator] */
  function exactCoef(name, a, k) {
    if (name === 'exp') return M.simp(a ** k, fact(k));
    if (name === 'sin') return k % 2 ? M.simp((-1) ** ((k - 1) / 2) * a ** k, fact(k)) : [0, 1];
    if (name === 'cos') return k % 2 ? [0, 1] : M.simp((-1) ** (k / 2) * a ** k, fact(k));
    if (name === 'log') return k === 0 ? [0, 1] : M.simp((-1) ** (k + 1) * a ** k, k);
    if (name === 'geo') return [a ** k, 1];
    return k === 0 ? [0, 1] : M.simp(a ** (k - 1), fact(k - 1));
  }
  A.skill({
    id: 'bc.taylor-polynomial', title: 'Taylor polynomials',
    learn: p(`The Taylor polynomial of degree ${Nn} for ${V('f')} at ${X} = ${V('a')} is <b>${V('f')}(${V('a')}) + ${V('f')}′(${V('a')})(${X} − ${V('a')}) + ${sfrac(`${V('f')}″(${V('a')})`, '2!')}(${X} − ${V('a')})² + … + ${sfrac(`${V('f')}<sup>(${Nn})</sup>(${V('a')})`, `${Nn}!`)}(${X} − ${V('a')})<sup>${Nn}</sup></b>. At ${V('a')} = 0 it's called a Maclaurin polynomial.`) +
      p(`<b>The coefficient of (${X} − ${V('a')})<sup>${V('k')}</sup> is ${V('f')}<sup>(${V('k')})</sup>(${V('a')}) ÷ ${V('k')}!</b>. Near ${V('a')}, the polynomial is a good approximation of ${V('f')}.`) +
      example('Example', `For ${ex(X)} at 0, every derivative is 1, so ${V('P')}<sub>3</sub>(${X}) = 1 + ${X} + ${X}²/2 + ${X}³/6, and ${V('P')}<sub>3</sub>(0.2) = 1.221333…, close to ${ex('0.2')} ≈ 1.221403.`),
    make(rng) {
      const name = rng.pick(['exp', 'sin', 'cos', 'log', 'geo', 'xexp']), a = name === 'log' || name === 'geo' ? rng.pick([1, 2, -1]) : rng.pick([1, 2, 3, -1, -2]), fz = fnOf(name, a);
      if (rng.bool()) {
        let k = rng.int(2, 5); if (exactCoef(name, a, k)[0] === 0) k++;
        const [cn, cd] = exactCoef(name, a, k);
        return { prompt: `What is the coefficient of ${X}<sup>${k}</sup> in the Maclaurin series for ${V('f')}(${X}) = ${fz[0]}?`, type: 'number', answer: cn / cd, answerText: M.fracText(cn, cd), params: { kind: 'coef', name, a, k },
          hints: [`The coefficient of ${X}<sup>${k}</sup> is ${V('f')}<sup>(${k})</sup>(0) ÷ ${k}!. You can also start from a series you know and substitute ${kx(a)} for ${X}.`, `It works out to <b>${M.fracText(cn, cd)}</b>.`] };
      }
      const deg = rng.pick([2, 3]), x0 = rng.pick([0.1, 0.2, 0.3]), terms = [];
      let val = 0; for (let k = 0; k <= deg; k++) { const [cn, cd] = exactCoef(name, a, k); val += cn / cd * x0 ** k; if (cn) terms.push(`${M.fracText(cn, cd)}${k ? `(${N(x0)})${k > 1 ? `<sup>${k}</sup>` : ''}` : ''}`); }
      const ans = r4(val);
      return { prompt: `Use the Maclaurin polynomial of degree ${deg} for ${V('f')}(${X}) = ${fz[0]} to approximate ${V('f')}(${N(x0)}). Give 4 decimal places.`, type: 'number', answer: ans, tolerance: 0.0002, params: { kind: 'value', name, a, deg, x0 },
        hints: [`Write the terms up to ${X}<sup>${deg}</sup>, with coefficients ${V('f')}<sup>(${V('k')})</sup>(0)/${V('k')}!.`, `Substitute ${X} = ${N(x0)}: ${terms.join(' + ').replace(/\+ −/g, '− ')}.`, `≈ <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params, fz = fnOf(P.name, P.a)[1];
      if (P.kind === 'coef') return near(coef(fz, P.k), q.answer, 1e-6);
      let v = 0; for (let k = 0; k <= P.deg; k++) v += coef(fz, k) * P.x0 ** k;
      return near(v, q.answer, 0.00006);
    },
  });

  /** the first few nonzero terms of a series from its coefficients */
  function seriesHtml(cs) {
    let out = '', n = 0;
    cs.forEach(([cn, cd], k) => {
      if (!cn || n >= 4) return;
      const mag = F(Math.abs(cn), cd), xk = k === 0 ? '' : k === 1 ? X : `${X}<sup>${k}</sup>`;
      const body = k === 0 ? mag : (mag === '1' ? xk : `${mag}${xk}`);
      out += out === '' ? (cn < 0 ? '−' : '') + body : (cn < 0 ? ' − ' : ' + ') + body; n++;
    });
    return out + ' + …';
  }
  A.skill({
    id: 'bc.maclaurin-series', title: 'Maclaurin series to know',
    learn: p(`Five series to know by heart: <b>${ex(X)} = 1 + ${X} + ${X}²/2! + ${X}³/3! + …</b>, <b>sin ${X} = ${X} − ${X}³/3! + ${X}<sup>5</sup>/5! − …</b>, <b>cos ${X} = 1 − ${X}²/2! + ${X}<sup>4</sup>/4! − …</b>, <b>1/(1 − ${X}) = 1 + ${X} + ${X}² + …</b>, and <b>ln(1 + ${X}) = ${X} − ${X}²/2 + ${X}³/3 − …</b>.`) +
      p(`Build others by substituting: replace ${X} with 2${X} in ${ex(X)} to get the series for ${ex(`2${X}`)}, or multiply a whole series by ${X}.`) +
      example('Example', `sin(3${X}) = 3${X} − (3${X})³/3! + … = 3${X} − ${F(9, 2)}${X}³ + ….`),
    make(rng) {
      const name = rng.pick(['exp', 'sin', 'cos', 'log', 'geo', 'xexp']), a = name === 'log' || name === 'geo' ? rng.pick([1, 2, -1]) : rng.pick([1, 2, 3, -1]);
      const cs = Array.from({ length: 9 }, (_, k) => exactCoef(name, a, k));
      const answer = seriesHtml(cs);
      const flip = cs.map(([n, d]) => [Math.abs(n), d]), noFact = cs.map(([n, d], k) => [n === 0 ? 0 : Math.sign(n) * Math.abs(a) ** k, 1]), shifted = cs.map((c, k) => (k ? cs[k - 1] : [0, 1]));
      const other = name === 'sin' ? Array.from({ length: 9 }, (_, k) => exactCoef('cos', a, k)) : name === 'cos' ? Array.from({ length: 9 }, (_, k) => exactCoef('sin', a, k)) : cs.map(([n, d], k) => [k % 2 ? -n : n, d]);
      return { prompt: `Which is the Maclaurin series for ${fnOf(name, a)[0]}?`, type: 'choice', answer, choices: options(answer, [flip, noFact, other, shifted].map(seriesHtml)), params: { name, a, opts: [cs, flip, noFact, other, shifted] },
        hints: [`Start from the series you know for ${({ exp: ex(X), sin: `sin ${X}`, cos: `cos ${X}`, log: `ln(1 + ${X})`, geo: `1/(1 − ${X})`, xexp: ex(X) })[name]}${a === 1 ? '' : ` and replace ${X} with ${kx(a)}`}${name === 'xexp' ? `, then multiply every term by ${X}` : ''}.`, `<b>${answer}</b>`] };
    },
    verify(q) {
      const { name, a, opts } = q.params, fz = fnOf(name, a)[1], ok = opts.filter(cs => cs.every(([n, d], k) => near(coef(fz, k), n / d, 1e-6)));
      return ok.length >= 1 && seriesHtml(ok[0]) === q.answer && q.choices.filter(c => c === q.answer).length === 1 && opts.slice(1).every(cs => seriesHtml(cs) === q.answer || cs.some(([n, d], k) => !near(coef(fz, k), n / d, 1e-6)));
    },
  });

  const KNOWN = [
    ['exp', v => `${sigma(`${Nn}=0`, '∞')} ${sfrac(`${v}<sup>${Nn}</sup>`, `${Nn}!`)}`, v => `e<sup>${v}</sup>`, v => Math.exp(v)],
    ['sin', v => `${sigma(`${Nn}=0`, '∞')} ${sfrac(`(−1)<sup>${Nn}</sup>${v}<sup>2${Nn}+1</sup>`, `(2${Nn} + 1)!`)}`, v => `sin ${v}`, v => Math.sin(v)],
    ['cos', v => `${sigma(`${Nn}=0`, '∞')} ${sfrac(`(−1)<sup>${Nn}</sup>${v}<sup>2${Nn}</sup>`, `(2${Nn})!`)}`, v => `cos ${v}`, v => Math.cos(v)],
    ['log', v => `${sigma(`${Nn}=1`, '∞')} ${sfrac(`(−1)<sup>${Nn}+1</sup>(${v})<sup>${Nn}</sup>`, Nn)}`, v => `ln ${v === 1 ? 2 : `(1 + ${v})`}`.replace('(1 + 1/2)', '(3/2)'), v => Math.log(1 + v)],
  ];
  A.skill({
    id: 'bc.known-series', title: 'Sums of known series',
    learn: p(`Many series are a known Maclaurin series with a number put in for ${X}. <b>Match the pattern, then name the function and the number</b>: Σ ${sfrac(`3<sup>${Nn}</sup>`, `${Nn}!`)} is the series for ${ex(X)} at ${X} = 3, so it equals ${ex('3')}.`) +
      p(`Look at the factorials and the signs: ${Nn}! with no alternating sign is ${ex(X)}; (2${Nn} + 1)! with alternating signs is sin ${X}; (2${Nn})! with alternating signs is cos ${X}; a plain ${Nn} below with alternating signs is ln(1 + ${X}).`) +
      example('Example', `Σ<sub>${Nn}=1</sub><sup>∞</sup> (−1)<sup>${Nn}+1</sup>/${Nn} is ln(1 + ${X}) at ${X} = 1, so it equals ln 2.`),
    make(rng) {
      const i = rng.int(0, KNOWN.length - 1), v = i === 3 ? rng.pick([1]) : rng.pick([1, 2, 3]);
      const [name, sHtml, ans] = KNOWN[i], answer = ans(v);
      const wrong = KNOWN.filter((_, j) => j !== i).map(k => k[2](v)).concat([`e<sup>${N(-v)}</sup>`, `${ex(v === 1 ? '2' : v * 2)}`, `sin ${v * 2}`]);
      return { prompt: `What is the sum of the series?${big(sHtml(v))}`, type: 'choice', answer, choices: options(answer, rng.shuffle(wrong)), params: { i, v },
        hints: [`The pattern matches the Maclaurin series for ${({ exp: ex(X), sin: `sin ${X}`, cos: `cos ${X}`, log: `ln(1 + ${X})` })[name]}.`, `Here ${X} = ${v}, so the sum is <b>${answer}</b>.`] };
    },
    verify(q) {
      const { i, v } = q.params, term = [n => v ** n / fact(n), n => (-1) ** n * v ** (2 * n + 1) / fact(2 * n + 1), n => (-1) ** n * v ** (2 * n) / fact(2 * n), n => (-1) ** (n + 1) * v ** n / n][i], start = i === 3 ? 1 : 0, nmax = i === 3 ? 200000 : 40;
      let s = 0; for (let n = start; n < start + nmax; n++) s += term(n);
      return near(s, KNOWN[i][3](v), 1e-4) && q.answer === KNOWN[i][2](v);
    },
  });

  A.skill({
    id: 'bc.lagrange-error', title: 'The Lagrange error bound',
    learn: p(`When a Taylor polynomial of degree ${Nn} centered at ${V('a')} approximates ${V('f')}(${X}), the error is at most <b>${sfrac(`${V('M')}|${X} − ${V('a')}|<sup>${Nn}+1</sup>`, `(${Nn} + 1)!`)}</b>, where ${V('M')} is the largest value of |${V('f')}<sup>(${Nn}+1)</sup>| between ${V('a')} and ${X}.`) +
      p(`For sin and cos every derivative is at most 1 in size, so ${V('M')} = 1. For ${ex(X)} on [0, ${X}], the biggest derivative is at the right end, ${ex(X)}.`) +
      example('Example', `The degree-3 Maclaurin polynomial for sin ${X} at ${X} = ${F(1, 2)}: the error is at most 1 · (${F(1, 2)})<sup>4</sup> ÷ 4! = 1/384.`),
    make(rng) {
      const n = rng.int(2, 4), [xn, xd] = rng.pick([[1, 2], [1, 3], [1, 10], [1, 1], [1, 4]]), Mb = rng.pick([1, 1, 2, 3]);
      const ctx = Mb === 1 ? rng.pick([`sin ${X}`, `cos ${X}`]) : `a function whose (${n + 1})th derivative is at most ${Mb} in size on the interval`;
      const den = xd ** (n + 1) * fact(n + 1), num = Mb * xn ** (n + 1), [a1, b1] = M.simp(num, den);
      return { prompt: `The Maclaurin polynomial of degree ${n} for ${Mb === 1 ? ctx : ctx.replace('a function', 'a function f')} is used to approximate its value at ${X} = ${M.fracText(xn, xd)}. Use the Lagrange error bound to find the largest possible error, as a fraction.`, type: 'number', answer: a1 / b1, answerText: M.fracText(a1, b1), params: { n, xn, xd, Mb },
        hints: [`${V('M')} = ${Mb}${Mb === 1 ? ' (every derivative of sin and cos is at most 1 in size)' : ''}, ${Nn} + 1 = ${n + 1}, and |${X} − 0| = ${M.fracText(xn, xd)}.`, `Error ≤ ${Mb} · (${M.fracText(xn, xd)})<sup>${n + 1}</sup> ÷ ${n + 1}! = ${num}/${den}${b1 !== den ? ` = ${M.fracText(a1, b1)}` : ''}, so the error is at most <b>${M.fracText(a1, b1)}</b>.`] };
    },
    verify(q) {
      const { n, xn, xd, Mb } = q.params, x = xn / xd;
      if (!near(Mb * x ** (n + 1) / fact(n + 1), q.answer, 1e-12)) return 'bound mismatch';
      if (Mb !== 1) return true;
      // the true error of sin's polynomial really is within the bound
      let P = 0; for (let k = 0; k <= n; k++) if (k % 2) P += (-1) ** ((k - 1) / 2) * x ** k / fact(k);
      return Math.abs(Math.sin(x) - P) <= q.answer + 1e-12;
    },
  });
})();
