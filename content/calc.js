/* Calculus. Limits and continuity, derivatives and their rules, applications of derivatives, integrals,
   and applications of integrals: roughly the scope of AP Calculus AB. Every question is done by hand. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v;
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = s => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const X = V('x'), Y = V('y'), T = V('t'), H = V('h'), C = V('C');
  const sfrac = (num, den) => `<span class="frac"><span class="num">${num}</span><span class="den">${den}</span></span>`;
  const wrap = x => x < 0 ? `(${N(x)})` : N(x);
  const key = s => A.normText(A.stripTags(s));
  /** a ≈ b, relative to the size of b */
  const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1e-9 : tol) * Math.max(1, Math.abs(b));
  const fn = (name, arg) => `${V(name)}(${arg})`;
  const d1 = (name, arg) => `${V(name)}′(${arg})`;
  const d2 = (name, arg) => `${V(name)}″(${arg})`;
  const ex = pw => `e<sup>${pw}</sup>`;
  const SQ = s => `${s}<sup>2</sup>`;
  const DYDX = sfrac(`d${Y}`, `d${X}`);
  const DDX = sfrac('d', `d${X}`);
  const DX = ` d${X}`;
  const STACK = 'display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1.05';
  /** "lim" with "x → a" set underneath */
  const lim = (to, v) => `<span style="${STACK};margin-right:4px"><span>lim</span><span style="font-size:.6em;white-space:nowrap">${V(v || 'x')} → ${to}</span></span>`;
  /** an integral sign with its limits, a below and b above */
  const integ = (a, b) => `<span style="${STACK};margin-right:2px"><span style="font-size:.6em">${b}</span><span style="font-size:1.35em;line-height:1">∫</span><span style="font-size:.6em">${a}</span></span>`;
  /** a function defined in pieces: rows of [expression, condition] */
  const piecewise = (name, rows) => `${fn(name, X)} = <span style="display:inline-flex;align-items:center;vertical-align:middle"><span style="font-size:2.3em;line-height:1;margin-right:6px;font-weight:300">{</span><span style="display:inline-flex;flex-direction:column;align-items:flex-start;gap:2px;font-size:.8em">${rows.map(([e, c]) => `<span>${e},&nbsp;&nbsp; ${c}</span>`).join('')}</span></span>`;
  /** "(x − 3)", "(x + 2)", or just "x" */
  const lin = h => h === 0 ? X : `(${X} ${h > 0 ? '−' : '+'} ${N(Math.abs(h))})`;
  const P = (c, v) => M.poly(c, v || 'x');
  /** evaluate polynomial coefficients (highest power first) at x */
  const evalP = (c, x) => c.reduce((s, ci) => s * x + ci, 0);
  /** derivative of a coefficient list */
  const pder = c => c.slice(0, -1).map((ci, i) => ci * (c.length - 1 - i));
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
  /** a fraction answer: { answer, answerText } (no answerText for a whole number) */
  const fa = (n, d) => { const [a, b] = M.simp(n, d); return b === 1 ? { answer: a } : { answer: a / b, answerText: M.fracText(a, b) }; };
  /** a sum of terms c·xᵏ, each [c, k]; k can be negative */
  function terms(list, v) {
    let out = '';
    list.forEach(([c, k]) => {
      if (c === 0) return;
      const mag = Math.abs(c), xs = k === 0 ? '' : k === 1 ? V(v || 'x') : `${V(v || 'x')}<sup>${N(k)}</sup>`;
      const body = k === 0 ? N(mag) : (mag === 1 ? '' : N(mag)) + xs;
      out += out === '' ? (c < 0 ? '−' : '') + body : (c < 0 ? ' − ' : ' + ') + body;
    });
    return out || '0';
  }
  const tval = (list, x) => list.reduce((s, [c, k]) => s + c * Math.pow(x, k), 0);

  /* numeric calculus, used only by verify() to re-derive answers a different way */
  const deriv = (f, x) => { const h = 1e-5; return (f(x + h) - f(x - h)) / (2 * h); };
  const deriv2 = (f, x) => { const h = 1e-3; return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h); };
  function simpson(f, a, b, n) {
    n = n || 2000;
    const h = (b - a) / n;
    let s = f(a) + f(b);
    for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
    return s * h / 3;
  }
  const XS = [0.7, 1.3, 2.1, 2.9];
  const sameFn = (f, g, xs, tol) => (xs || XS).every(x => near(f(x), g(x), tol || 1e-6));
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
  /** options are [{ html, f }], the first one right: the answer and up to three wrong choices */
  function choose(opts) {
    const ans = opts[0].html;
    return { type: 'choice', answer: ans, choices: [ans, ...distinct(ans, opts.slice(1).map(o => o.html), 3)] };
  }
  /** verify for choose(): exactly one option on show behaves like `target`, and it is the answer */
  function checkOpts(q, opts, target, xs, tol) {
    const good = [...new Set(opts.filter(o => q.choices.includes(o.html) && sameFn(o.f, target, xs, tol)).map(o => o.html))];
    if (good.length !== 1) return `${good.length} options match`;
    if (!q.choices.every(c => opts.some(o => o.html === c))) return 'a choice was not built from the options';
    return good[0] === q.answer ? true : 'the matching option is not the answer';
  }

  A.course({
    id: 'calculus', title: 'Calculus', subject: 'High school', grade: 12, icon: 'Calc', hue: 140,
    blurb: 'Limits and continuity, derivatives and how to use them, integrals, and the Fundamental Theorem of Calculus.',
    units: [
      { id: 'limits', title: 'Limits and continuity', blurb: 'Reading limits from tables, finding them by substitution and by factoring, limits at infinity, and continuity.', skills: ['calc.limits-from-tables', 'calc.limits-direct-substitution', 'calc.limits-factoring', 'calc.limits-at-infinity', 'calc.continuity'] },
      { id: 'derivatives', title: 'Derivatives: definition and basic rules', blurb: 'Average and instantaneous rates of change, the power rule, derivatives of the basic functions, and tangent lines.', skills: ['calc.rates-of-change', 'calc.power-rule', 'calc.polynomial-derivatives', 'calc.basic-function-derivatives', 'calc.tangent-lines'] },
      { id: 'differentiation', title: 'More differentiation', blurb: 'The product, quotient and chain rules, implicit differentiation, and second derivatives.', skills: ['calc.product-rule', 'calc.quotient-rule', 'calc.chain-rule', 'calc.implicit-differentiation', 'calc.second-derivatives'] },
      { id: 'derivative-applications', title: 'Applications of derivatives', blurb: 'Motion, related rates, critical points, extrema, optimization, and concavity.', skills: ['calc.motion', 'calc.related-rates', 'calc.critical-points', 'calc.increasing-decreasing', 'calc.absolute-extrema', 'calc.concavity'] },
      { id: 'integration', title: 'Integration', blurb: 'Riemann sums, antiderivatives, definite integrals, and u-substitution.', skills: ['calc.riemann-sums', 'calc.antiderivatives', 'calc.definite-integrals', 'calc.basic-function-integrals', 'calc.u-substitution'] },
      { id: 'integral-applications', title: 'Applications of integration', blurb: 'Area under and between curves, average value, and net change.', skills: ['calc.area-under-curve', 'calc.area-between-curves', 'calc.average-value', 'calc.net-change'] },
    ],
  });

  /* ---------- Unit 1: Limits and continuity ---------- */
  A.skill({
    id: 'calc.limits-from-tables', title: 'Estimating limits from tables',
    learn: p(`The limit of ${fn('f', X)} as ${X} approaches ${V('a')} is the number ${fn('f', X)} gets closer and closer to as ${X} gets closer to ${V('a')}. You write ${lim(V('a'))} ${fn('f', X)} = ${V('L')}.`) +
      p(`<b>To estimate a limit from a table, watch the outputs as the inputs close in on ${V('a')} from both sides, and see what number they head toward.</b> The value at ${X} = ${V('a')} itself doesn’t matter: it can be different, or missing.`) +
      p(`A <b>one-sided limit</b> looks from one side only: ${X} → ${V('a')}<sup>−</sup> means from the left (inputs less than ${V('a')}), and ${X} → ${V('a')}<sup>+</sup> means from the right. If the two sides head to different numbers, the two-sided limit doesn’t exist.`) +
      example('Example', `${M.table([X, fn('f', X)], [['1.9', '5.81'], ['1.99', '5.9801'], ['1.999', '5.998'], ['2', '—'], ['2.001', '6.002'], ['2.01', '6.0201'], ['2.1', '6.21']], { compact: true })}From both sides the outputs close in on 6, so ${lim('2')} ${fn('f', X)} = <b>6</b>, even though ${fn('f', 2)} has no value.`),
    make(rng) {
      const kind = rng.pick(['two', 'two', 'left', 'right']);
      const a = rng.int(-4, 5), L = rng.int(-6, 9), e = rng.int(-2, 2);
      const cl = rng.pick([1, 2, 3, -1, -2, -3]), cr = rng.pick([1, 2, 3, -1, -2, -3]);
      const R = kind === 'two' ? L : L + rng.pick([-3, -2, 2, 3, 4]);
      const ds = [-0.1, -0.01, -0.001, 0.001, 0.01, 0.1];
      const ys = ds.map(d => M.round((d < 0 ? L + cl * d : R + cr * d) + e * d * d, 4));
      const at = kind === 'two' ? (rng.bool() ? '—' : N(L + rng.pick([-4, -3, 3, 5]))) : N(rng.pick([L, R]));
      const rows = ds.map((d, i) => [N(M.round(a + d, 3)), N(ys[i])]);
      rows.splice(3, 0, [N(a), at]);
      const to = kind === 'two' ? N(a) : `${N(a)}<sup>${kind === 'left' ? '−' : '+'}</sup>`;
      const ans = kind === 'right' ? R : L;
      const fromL = ys.slice(0, 3).map(N).join(', '), fromR = ys.slice(3).reverse().map(N).join(', ');
      const side = { two: 'from both sides', left: `from the left (${X} &lt; ${N(a)})`, right: `from the right (${X} &gt; ${N(a)})` }[kind];
      return {
        prompt: `Use the table to estimate the limit.${big(`${lim(to)} ${fn('f', X)}`)}${M.table([X, fn('f', X)], rows, { compact: true })}`,
        type: 'number', answer: ans, params: { kind, ys },
        hints: [`Watch the ${fn('f', X)} values as ${X} gets close to ${N(a)} ${side}. Ignore the value at ${X} = ${N(a)} itself.`,
          kind === 'two' ? `From the left: ${fromL} … From the right: ${fromR} … Both sides head toward ${N(L)}.`
            : kind === 'left' ? `From the left: ${fromL} … These head toward ${N(L)}. (The right side heads somewhere else, but it doesn’t matter here.)`
              : `From the right: ${fromR} … These head toward ${N(R)}. (The left side heads somewhere else, but it doesn’t matter here.)`,
          `So the limit is <b>${N(ans)}</b>.`],
      };
    },
    verify(q) {
      const { kind, ys } = q.params;
      const closest = kind === 'right' ? [ys[3]] : kind === 'left' ? [ys[2]] : [ys[2], ys[3]];
      return Number.isInteger(q.answer) && closest.every(y => Math.abs(y - q.answer) < 0.01);
    },
  });

  A.skill({
    id: 'calc.limits-direct-substitution', title: 'Limits by direct substitution',
    learn: p(`Polynomials, sine and cosine, square roots (where they’re defined), and fractions of these (where the bottom isn’t zero) are <b>continuous</b>: their graphs have no breaks. For a continuous function, the limit is simply the function’s value.`) +
      p(`<b>So try direct substitution first: plug ${X} = ${V('a')} into the expression. If you get a real number, that number is the limit.</b> If you get ${sfrac('0', '0')}, or a nonzero number over 0, you need another method.`) +
      example('Example', `${big(`${lim('3')} ${sfrac(`${X}² + 1`, `${X} − 1`)}`)}The bottom isn’t zero at ${X} = 3, so substitute: ${sfrac('9 + 1', '3 − 1')} = ${sfrac('10', '2')} = <b>5</b>.`),
    make(rng) {
      const kind = rng.pick(['poly', 'poly', 'rational', 'root', 'trig']);
      if (kind === 'poly') {
        const a = rng.int(-3, 3);
        const c = rng.bool() ? [rng.nz(-3, 3), rng.int(-6, 6), rng.int(-9, 9)] : [rng.nz(-2, 2), rng.int(-3, 3), rng.int(-5, 5), rng.int(-9, 9)];
        const ans = evalP(c, a);
        return { prompt: `Find the limit.${big(`${lim(N(a))} (${P(c)})`)}`, type: 'number', answer: ans, params: { kind, a, c },
          hints: ['A polynomial is continuous everywhere, so the limit is its value at the point. Substitute directly.', `${subst(c, a)} = ${N(ans)}.`, `The limit is <b>${N(ans)}</b>.`] };
      }
      if (kind === 'rational') {
        const a = rng.int(-3, 4), m = rng.nz(-5, 5), b = rng.int(-8, 8);
        let d; do { d = rng.int(-6, 6); } while (a + d === 0);
        const r = fa(m * a + b, a + d);
        return { prompt: `Find the limit.${big(`${lim(N(a))} ${sfrac(P([m, b]), P([1, d]))}`)}`, type: 'number', ...r, params: { kind, a, m, b, d },
          hints: [`Check the bottom first: at ${X} = ${N(a)} it is ${N(a + d)}, not 0, so the function is continuous there. Substitute.`,
            `${sfrac(subst([m, b], a), subst([1, d], a))} = ${sfrac(N(m * a + b), N(a + d))}.`, `The limit is <b>${F(m * a + b, a + d)}</b>.`] };
      }
      if (kind === 'root') {
        const s = rng.int(1, 6), b = rng.int(1, 4), a = rng.int(-3, 5), m = rng.int(-5, 5), c = s * s - b * a;
        const inside = P([b, c]);
        return { prompt: `Find the limit.${big(`${lim(N(a))} (${M.sqrt(inside)} ${M.signed(m)})`)}`.replace(' + 0)', ')'), type: 'number', answer: s + m, params: { kind, a, b, c, m },
          hints: [`At ${X} = ${N(a)} the inside of the root is ${N(s * s)}, which is positive, so the function is continuous there. Substitute.`,
            `${M.sqrt(subst([b, c], a))} ${M.signed(m)} = ${M.sqrt(N(s * s))} ${M.signed(m)} = ${N(s)} ${M.signed(m)}.`, `The limit is <b>${N(s + m)}</b>.`] };
      }
      const j = rng.int(0, 3), k = rng.nz(-6, 6), m = rng.nz(-6, 6);
      const to = ['0', 'π/2', 'π', '3π/2'][j], cos = [1, 0, -1, 0][j], sin = [0, 1, 0, -1][j];
      const ans = k * cos + m * sin;
      return { prompt: `Find the limit.${big(`${lim(to)} (${k === 1 ? '' : k === -1 ? '−' : N(k) + ' '}cos ${X} ${m < 0 ? '−' : '+'} ${Math.abs(m) === 1 ? '' : N(Math.abs(m)) + ' '}sin ${X})`)}`, type: 'number', answer: ans, params: { kind, j, k, m },
        hints: [`Sine and cosine are continuous, so substitute ${X} = ${to}.`, `cos ${to} = ${N(cos)} and sin ${to} = ${N(sin)}, so you get ${N(k)}(${N(cos)}) ${M.signed(m)}(${N(sin)}).`, `The limit is <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      const f = pr.kind === 'poly' ? x => evalP(pr.c, x) : pr.kind === 'rational' ? x => (pr.m * x + pr.b) / (x + pr.d)
        : pr.kind === 'root' ? x => Math.sqrt(pr.b * x + pr.c) + pr.m : x => pr.k * Math.cos(x) + pr.m * Math.sin(x);
      const a = pr.kind === 'trig' ? pr.j * Math.PI / 2 : pr.a;
      return near((f(a - 1e-7) + f(a + 1e-7)) / 2, q.answer, 1e-5);
    },
  });

  A.skill({
    id: 'calc.limits-factoring', title: 'Limits by factoring',
    learn: p(`Sometimes direct substitution gives ${sfrac('0', '0')}. That isn’t an answer; it’s a sign that the top and bottom share a factor, usually (${X} − ${V('a')}).`) +
      p(`<b>Factor the top and the bottom, cancel the common factor, then substitute into what’s left.</b> Cancelling is allowed because a limit only cares about ${X} near ${V('a')}, never at ${V('a')} itself.`) +
      example('Example', `${big(`${lim('3')} ${sfrac(`${X}² − 9`, `${X} − 3`)}`)}Substituting gives ${sfrac('0', '0')}. Factor: ${sfrac(`(${X} − 3)(${X} + 3)`, `${X} − 3`)} = ${X} + 3 for ${X} ≠ 3. Now substitute: 3 + 3 = <b>6</b>.`),
    make(rng) {
      const kind = rng.pick(['linear', 'linear', 'shared', 'reciprocal', 'cube']);
      const r = kind === 'cube' ? rng.nz(-3, 3) : rng.nz(-5, 5);
      let num, den, numF, denF, left, n, d = 1;
      if (kind === 'linear') {
        let s; do { s = rng.int(-6, 6); } while (s === r);
        num = [1, -(r + s), r * s]; den = [1, -r]; numF = lin(r) + lin(s); denF = lin(r); left = P([1, -s]); n = r - s;
      } else if (kind === 'shared') {
        const k = rng.pick([1, 2, 3, -1, -2]);
        let s, t; do { s = rng.int(-5, 5); t = rng.int(-5, 5); } while (s === r || t === r || s === t);
        num = [k, -k * (r + s), k * r * s]; den = [1, -(r + t), r * t];
        numF = (k === 1 ? '' : k === -1 ? '−' : N(k)) + lin(r) + lin(s); denF = lin(r) + lin(t);
        left = sfrac((k === 1 ? '' : k === -1 ? '−' : N(k)) + lin(s), P([1, -t])); n = k * (r - s); d = r - t;
      } else if (kind === 'reciprocal') {
        num = [1, -r]; den = [1, 0, -r * r]; numF = lin(r); denF = lin(r) + lin(-r); left = sfrac('1', P([1, r])); n = 1; d = 2 * r;
      } else {
        num = [1, 0, 0, -r * r * r]; den = [1, -r]; numF = `${lin(r)}(${P([1, r, r * r])})`; denF = lin(r); left = P([1, r, r * r]); n = 3 * r * r;
      }
      return {
        prompt: `Find the limit.${big(`${lim(N(r))} ${sfrac(P(num), P(den))}`)}`, type: 'number', ...fa(n, d), params: { num, den, r },
        hints: [`Substituting ${X} = ${N(r)} gives ${sfrac('0', '0')}, so the top and bottom share the factor ${lin(r)}.`,
          `Factor: ${sfrac(numF, denF)}. Cancel ${lin(r)} to get ${left}.`,
          `Now substitute ${X} = ${N(r)}: the limit is <b>${F(n, d)}</b>.`],
      };
    },
    verify(q) {
      const { num, den, r } = q.params;
      const f = x => evalP(num, x) / evalP(den, x);
      return Math.abs(evalP(den, r)) < 1e-12 && near((f(r - 1e-6) + f(r + 1e-6)) / 2, q.answer, 1e-5);
    },
  });

  A.skill({
    id: 'calc.limits-at-infinity', title: 'Limits at infinity',
    learn: p(`As ${X} → ∞ (or −∞), only the highest-power terms of a rational function matter; everything else is tiny next to them. Compare the degree of the top with the degree of the bottom.`) +
      p(`<b>Top degree smaller: the limit is 0. Same degree: the limit is the ratio of the leading coefficients. Top degree bigger: the function grows without bound, so the limit is ∞ or −∞</b>; decide the sign from the leading terms.`) +
      example('Example', `${big(`${lim('∞')} ${sfrac(`6${X}² − ${X} + 4`, `3${X}² + 5`)}`)}Both degrees are 2, so the limit is the ratio of the leading coefficients: ${sfrac('6', '3')} = <b>2</b>.`),
    make(rng) {
      const m = rng.int(1, 3), n = rng.int(1, 3), neg = rng.chance(0.35);
      const poly = deg => { const c = [rng.nz(-6, 6)]; for (let i = 0; i < deg; i++) c.push(rng.int(-9, 9)); if (c[deg] === 0) c[deg] = rng.nz(-9, 9); return c; };
      const num = poly(m), den = poly(n), pn = num[0], qd = den[0];
      const sgn = Math.sign(pn * qd) * (neg && (m - n) % 2 ? -1 : 1);
      const inf = s => s > 0 ? '∞' : '−∞';
      const ans = m < n ? '0' : m === n ? M.fracText(pn, qd) : inf(sgn);
      const cands = ['0', M.fracText(pn, qd), inf(sgn), inf(-sgn), M.fracText(num[m], den[n]), M.fracText(qd, pn), '1'];
      const lead2 = (a, b, k) => { const [cn, cd] = M.simp(a, b); return (cd === 1 ? (cn === 1 ? '' : cn === -1 ? '−' : N(cn)) : F(cn, cd)) + (k === 1 ? X : `${X}<sup>${k}</sup>`); };
      const lead = `${terms([[pn, m]])} on top and ${terms([[qd, n]])} on the bottom`;
      const why = m < n ? `The bottom has the higher power, so the fraction shrinks toward 0.`
        : m === n ? `The powers match, so the fraction approaches ${sfrac(N(pn), N(qd))} = ${M.fracText(pn, qd)}.`
          : `The top has the higher power, so the fraction acts like ${lead2(pn, qd, m - n)}, which grows without bound. As ${X} → ${neg ? '−∞' : '∞'}, its sign is ${sgn > 0 ? 'positive' : 'negative'}.`;
      return {
        prompt: `Find the limit.${big(`${lim(neg ? '−∞' : '∞')} ${sfrac(P(num), P(den))}`)}`, type: 'choice', answer: ans, choices: [ans, ...distinct(ans, cands, 3)], params: { num, den, neg },
        hints: [`Compare the leading terms: ${lead}.`, why, `The limit is <b>${ans}</b>.`],
      };
    },
    verify(q) {
      const { num, den, neg } = q.params, s = neg ? -1 : 1;
      const f = x => evalP(num, x) / evalP(den, x), v1 = f(s * 1e6), v2 = f(s * 2e6);
      if (Math.abs(v2) > 1e4 && Math.abs(v2) > Math.abs(v1)) return q.answer === (v2 > 0 ? '∞' : '−∞');
      return near(A.parseNumber(q.answer), v2, 1e-4);
    },
  });

  const contOptions = c => [`Yes, ${V('f')} is continuous there`, 'No, the one-sided limits differ', `No, the limit isn’t ${fn('f', N(c))}`, `No, ${fn('f', N(c))} isn’t defined`];
  A.skill({
    id: 'calc.continuity', title: 'Continuity at a point',
    learn: p(`A function is <b>continuous at ${X} = ${V('c')}</b> when you can draw its graph through that point without lifting your pencil. Precisely, three things must all be true:`) +
      p(`<b>1. ${fn('f', V('c'))} is defined. 2. The limit exists: the left and right limits agree. 3. The limit equals ${fn('f', V('c'))}.</b> A jump breaks rule 2; a hole, or a point moved off the curve, breaks rule 3 (and a missing point breaks rule 1).`) +
      p(`For a function defined in pieces, find the left limit from the left piece and the right limit from the right piece, then compare them with the value at ${V('c')}.`) +
      example('Example', `${big(piecewise('f', [[`${X} + 3`, `${X} &lt; 2`], [`${X}² + ${V('k')}`, `${X} ≥ 2`]]))}For which ${V('k')} is ${V('f')} continuous at ${X} = 2? The left piece heads to 2 + 3 = 5 and the right piece gives 4 + ${V('k')}. Set them equal: 4 + ${V('k')} = 5, so <b>${V('k')} = 1</b>.`),
    make(rng) {
      const kind = rng.pick(['findk', 'findk', 'classify', 'classify', 'classify']);
      if (kind === 'findk') {
        const c = rng.pick([-2, -1, 1, 2, 3]), b = rng.int(-6, 6), K = V('k');
        if (rng.bool()) {
          const a = rng.nz(-4, 4), k = a * c + b - c * c;
          return { prompt: `Find the value of ${K} that makes ${V('f')} continuous at ${X} = ${N(c)}.${big(piecewise('f', [[P([a, b]), `${X} &lt; ${N(c)}`], [`${X}² + ${K}`, `${X} ≥ ${N(c)}`]]))}`, type: 'number', answer: k, params: { kind, c, left: [a, b], right: [1, 0, null] },
            hints: ['The two pieces must meet at the boundary: the left limit must equal the value of the right piece.', `Left: ${subst([a, b], c)} = ${N(a * c + b)}. Right: (${N(c)})² + ${K} = ${N(c * c)} + ${K}.`, `${N(c * c)} + ${K} = ${N(a * c + b)}, so ${K} = <b>${N(k)}</b>.`] };
        }
        const k = rng.nz(-4, 4), dd = k * c + b - c * c;
        return { prompt: `Find the value of ${K} that makes ${V('f')} continuous at ${X} = ${N(c)}.${big(piecewise('f', [[`${K}${X} ${M.signed(b)}`.replace(' + 0', ''), `${X} &lt; ${N(c)}`], [P([1, 0, dd]), `${X} ≥ ${N(c)}`]]))}`, type: 'number', answer: k, params: { kind, c, left: [null, b], right: [1, 0, dd] },
          hints: ['The two pieces must meet at the boundary: the left limit must equal the value of the right piece.', `Left: ${K}(${N(c)}) ${M.signed(b)}. Right: ${subst([1, 0, dd], c)} = ${N(c * c + dd)}.`, `${M.term(c, 'k')} ${M.signed(b)} = ${N(c * c + dd)}, so ${M.term(c, 'k')} = ${N(c * c + dd - b)} and ${K} = <b>${N(k)}</b>.`] };
      }
      const how = rng.pick(['yes', 'jump', 'removable', 'undefined']), c = rng.int(-2, 3), a = rng.nz(-3, 3), b = rng.int(-5, 5);
      const Lv = a * c + b, d = Lv - c * c + (how === 'jump' ? rng.pick([-3, -2, 2, 3]) : 0), Rv = c * c + d;
      const val = how === 'removable' ? Lv + rng.pick([-4, -2, 1, 3]) : how === 'jump' ? rng.pick([Lv, Rv]) : Lv;
      const two = how === 'undefined' || ((how === 'yes' || (how === 'jump' && val === Rv)) && rng.bool());
      const rows = [[P([a, b]), `${X} &lt; ${N(c)}`], ...(two ? [] : [[N(val), `${X} = ${N(c)}`]]), [P([1, 0, d]), how === 'undefined' || !two ? `${X} &gt; ${N(c)}` : `${X} ≥ ${N(c)}`]];
      const fc = how === 'undefined' ? null : val, opts = contOptions(c);
      const ans = opts[{ yes: 0, jump: 1, removable: 2, undefined: 3 }[how]];
      return {
        prompt: `Is ${V('f')} continuous at ${X} = ${N(c)}?${big(piecewise('f', rows))}`, type: 'choice', answer: ans, choices: opts, keepOrder: true, params: { kind, c, a, b, d, fc },
        hints: [`Check three things: ${fn('f', N(c))} is defined, the left and right limits agree, and the limit equals ${fn('f', N(c))}.`,
          `From the left, ${P([a, b])} → ${N(Lv)}. From the right, ${P([1, 0, d])} → ${N(Rv)}.`,
          fc === null ? `No piece covers ${X} = ${N(c)} itself, so ${fn('f', N(c))} isn’t defined.` : `${fn('f', N(c))} = ${N(fc)}.`,
          `<b>${ans}</b>.`],
      };
    },
    verify(q) {
      const pr = q.params, c = pr.c, e = 1e-9;
      if (pr.kind === 'findk') {
        const k = q.answer, [la, lb] = pr.left, rc = pr.right[2] === null ? k : pr.right[2];
        const left = (la === null ? k : la) * (c - e) + lb, right = c * c + rc;
        return Math.abs(left - right) < 1e-6;
      }
      const left = pr.a * (c - e) + pr.b, right = (c + e) * (c + e) + pr.d, opts = contOptions(c);
      const idx = pr.fc === null ? 3 : Math.abs(left - right) > 1e-6 ? 1 : Math.abs(left - pr.fc) > 1e-6 ? 2 : 0;
      return q.answer === opts[idx];
    },
  });

  /* ---------- Unit 2: Derivatives: definition and basic rules ---------- */
  A.skill({
    id: 'calc.rates-of-change', title: 'Average and instantaneous rates of change',
    learn: p(`The <b>average rate of change</b> of ${V('f')} from ${X} = ${V('a')} to ${X} = ${V('b')} is the slope of the secant line through those two points: ${sfrac(`${fn('f', V('b'))} − ${fn('f', V('a'))}`, `${V('b')} − ${V('a')}`)}.`) +
      p(`The <b>instantaneous rate of change</b> at ${X} = ${V('a')} is what the average rate approaches as the interval shrinks to nothing. That limit is the <b>derivative</b>, ${d1('f', V('a'))} = ${lim('0', 'h')} ${sfrac(`${fn('f', `${V('a')} + ${H}`)} − ${fn('f', V('a'))}`, H)}, the slope of the tangent line.`) +
      example('Example', `${fn('f', X)} = ${X}². The average rate from 1 to 3 is ${sfrac('9 − 1', '3 − 1')} = 4. The instantaneous rate at ${X} = 1 is the limit of ${sfrac(`(1 + ${H})² − 1`, H)} = ${sfrac(`2${H} + ${H}²`, H)} = 2 + ${H}, which approaches <b>2</b> as ${H} → 0.`),
    make(rng) {
      const kind = rng.pick(['avg', 'avg', 'inst', 'ball']);
      if (kind === 'ball') {
        const v0 = rng.int(4, 12) * 8, s0 = rng.pick([0, 6, 10, 20, 50]), p1 = rng.int(0, 2), p2 = p1 + rng.int(1, 3), c = [-16, v0, s0];
        const h1 = evalP(c, p1), h2 = evalP(c, p2), ans = (h2 - h1) / (p2 - p1);
        return { prompt: `A ball is thrown upward. Its height after ${T} seconds is ${fn('h', T)} = ${P(c, 't')} feet. What is its average velocity from ${T} = ${p1} to ${T} = ${p2}?`, type: 'number', answer: ans, unit: 'ft/s', params: { kind, c, p1, p2 },
          hints: [`Average velocity is the change in height divided by the change in time: ${sfrac(`${fn('h', p2)} − ${fn('h', p1)}`, `${p2} − ${p1}`)}.`, `${fn('h', p2)} = ${N(h2)} and ${fn('h', p1)} = ${N(h1)}.`, `${sfrac(`${N(h2)} − ${wrap(h1)}`, N(p2 - p1))} = <b>${N(ans)} ft/s</b>.`] };
      }
      const c = [rng.nz(-3, 3), rng.int(-6, 6), rng.int(-9, 9)], a = c[0], b = c[1];
      if (kind === 'avg') {
        const p1 = rng.int(-3, 2), p2 = p1 + rng.int(1, 4), y1 = evalP(c, p1), y2 = evalP(c, p2), ans = a * (p1 + p2) + b;
        return { prompt: `${fn('f', X)} = ${P(c)}. What is the average rate of change of ${V('f')} from ${X} = ${N(p1)} to ${X} = ${N(p2)}?`, type: 'number', answer: ans, params: { kind, c, p1, p2 },
          hints: [`Average rate of change = ${sfrac(`${fn('f', N(p2))} − ${fn('f', N(p1))}`, `${N(p2)} − ${wrap(p1)}`)}.`, `${fn('f', N(p2))} = ${subst(c, p2)} = ${N(y2)} and ${fn('f', N(p1))} = ${subst(c, p1)} = ${N(y1)}.`, `${sfrac(`${N(y2)} − ${wrap(y1)}`, N(p2 - p1))} = <b>${N(ans)}</b>.`] };
      }
      const x0 = rng.int(-3, 3), m = 2 * a * x0 + b;
      return { prompt: `${fn('f', X)} = ${P(c)}. Find the instantaneous rate of change of ${V('f')} at ${X} = ${N(x0)} by working out the limit.${big(`${lim('0', 'h')} ${sfrac(`${fn('f', `${N(x0)} + ${H}`)} − ${fn('f', N(x0))}`, H)}`)}`, type: 'number', answer: m, params: { kind, c, x0 },
        hints: [`Expand ${fn('f', `${N(x0)} + ${H}`)} and subtract ${fn('f', N(x0))} = ${N(evalP(c, x0))}. Every term without an ${H} cancels.`, `The top simplifies to ${P([a, m, 0], 'h')}. Divide by ${H}: ${P([a, m], 'h')}.`, `As ${H} → 0 this approaches ${N(m)}, so the instantaneous rate is <b>${N(m)}</b>.`] };
    },
    verify(q) {
      const pr = q.params, f = x => pr.c[0] * x * x + pr.c[1] * x + pr.c[2];
      if (pr.kind === 'inst') return near(deriv(f, pr.x0), q.answer, 1e-6);
      return near((f(pr.p2) - f(pr.p1)) / (pr.p2 - pr.p1), q.answer);
    },
  });

  /** a·x^(−k) written as a fraction: "−6/x⁴" */
  const rf = (c, k) => k === 0 ? N(c) : (c < 0 ? '−' : '') + sfrac(N(Math.abs(c)), k === 1 ? X : `${X}<sup>${k}</sup>`);
  function powerOpts({ kind, a, n }) {
    if (kind === 'recip') return [[-n * a, n + 1], [-n * a, n - 1], [n * a, n + 1], [-n * a, n], [-a, n + 1]].map(([c, k]) => ({ html: rf(c, k), f: x => c / Math.pow(x, k) }));
    return [[a * n, n - 1], [a * n, n], [a, n - 1], [a * n, n + 1]].map(([c, k]) => ({ html: terms([[c, k]]), f: x => c * Math.pow(x, k) }));
  }
  A.skill({
    id: 'calc.power-rule', title: 'The power rule',
    learn: p(`The derivative of a power of ${X} follows one pattern. <b>Power rule: ${DDX} ${X}<sup>${V('n')}</sup> = ${V('n')}${X}<sup>${V('n')} − 1</sup>.</b> Bring the exponent down in front, then lower the exponent by 1.`) +
      p(`A constant multiple just comes along: ${DDX} ${V('a')}${X}<sup>${V('n')}</sup> = ${V('a')}${V('n')}${X}<sup>${V('n')} − 1</sup>. The rule works for negative exponents too, so rewrite ${sfrac('1', `${X}<sup>3</sup>`)} as ${X}<sup>−3</sup> before you differentiate.`) +
      example('Example', `${big(`${DDX} 4${X}<sup>5</sup>`)}Bring down the 5 and lower the exponent: 4 · 5${X}<sup>4</sup> = <b>20${X}<sup>4</sup></b>.`),
    make(rng) {
      const kind = rng.pick(['expr', 'expr', 'recip', 'value']);
      if (kind === 'value') {
        const a = rng.nz(-5, 5), n = rng.int(2, 4), x0 = rng.nz(-3, 3), ans = a * n * Math.pow(x0, n - 1);
        return { prompt: `${fn('f', X)} = ${terms([[a, n]])}. Find ${d1('f', N(x0))}.`, type: 'number', answer: ans, params: { kind, a, n, x0 },
          hints: [`Power rule: bring down the ${n} and lower the exponent, so ${d1('f', X)} = ${terms([[a * n, n - 1]])}.`, `Substitute ${X} = ${N(x0)}: ${N(a * n)}(${N(x0)})${n - 1 > 1 ? `<sup>${n - 1}</sup>` : ''}.`, `${d1('f', N(x0))} = <b>${N(ans)}</b>.`] };
      }
      const a = kind === 'recip' ? rng.nz(-6, 6) : rng.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, -1, -2, -3, -4, -5, -6]);
      const n = kind === 'recip' ? rng.int(1, 4) : rng.int(2, 8), params = { kind, a, n };
      const pick = choose(powerOpts(params));
      const f = kind === 'recip' ? rf(a, n) : terms([[a, n]]);
      return {
        prompt: `Find the derivative.${big(`${fn('f', X)} = ${f}`)}`, ...pick, params,
        hints: kind === 'recip'
          ? [`Rewrite with a negative exponent: ${f} = ${terms([[a, -n]])}.`, `Power rule: bring down the ${N(-n)} and lower the exponent by 1, to ${N(-n - 1)}: ${N(a)} · (${N(-n)})${X}<sup>${N(-n - 1)}</sup> = ${terms([[-n * a, -n - 1]])}.`, `As a fraction, ${d1('f', X)} = <b>${pick.answer}</b>.`]
          : [`Bring the exponent ${n} down in front, then lower it by 1, to ${n - 1}.`, `${N(a)} · ${n}${n - 1 === 1 ? X : `${X}<sup>${n - 1}</sup>`} = ${pick.answer}.`, `${d1('f', X)} = <b>${pick.answer}</b>.`],
      };
    },
    verify(q) {
      const { kind, a, n, x0 } = q.params;
      const f = kind === 'recip' ? x => a / Math.pow(x, n) : x => a * Math.pow(x, n);
      if (kind === 'value') return near(deriv(f, x0), q.answer, 1e-6);
      return checkOpts(q, powerOpts(q.params), x => deriv(f, x));
    },
  });

  function polyDerOpts(c) {
    const deg = c.length - 1, d = pder(c);
    const keepConst = d.slice(0, -1).concat(d[d.length - 1] + c[deg]);
    return [d, c.map((ci, i) => ci * (deg - i)), c.slice(0, -1), keepConst].map(arr => ({ html: P(arr), f: x => evalP(arr, x) }));
  }
  A.skill({
    id: 'calc.polynomial-derivatives', title: 'Derivatives of polynomials',
    learn: p(`<b>Differentiate a polynomial one term at a time.</b> The derivative of a sum is the sum of the derivatives, and a constant multiple stays in front.`) +
      p(`Use the power rule on each term. A term like 7${X} becomes 7, and a constant term becomes 0, because a constant never changes.`) +
      example('Example', `${big(`${fn('f', X)} = 2${X}³ − 5${X}² + 7${X} − 4`)}Term by term: 6${X}² − 10${X} + 7 − 0, so <b>${d1('f', X)} = 6${X}² − 10${X} + 7</b>.`),
    make(rng) {
      const kind = rng.pick(['expr', 'expr', 'value']);
      const c = rng.bool() ? [rng.nz(-5, 5), rng.nz(-6, 6), rng.int(-9, 9), rng.nz(-9, 9)] : [rng.nz(-3, 3), 0, rng.nz(-6, 6), rng.int(-9, 9), rng.nz(-9, 9)];
      const d = pder(c);
      if (kind === 'value') {
        const x0 = rng.int(-2, 3), ans = evalP(d, x0);
        return { prompt: `${fn('f', X)} = ${P(c)}. Find ${d1('f', N(x0))}.`, type: 'number', answer: ans, params: { kind, c, x0 },
          hints: ['Differentiate term by term with the power rule; the constant term becomes 0.', `${d1('f', X)} = ${P(d)}.`, `${d1('f', N(x0))} = ${subst(d, x0)} = <b>${N(ans)}</b>.`] };
      }
      const pick = choose(polyDerOpts(c));
      return { prompt: `Find the derivative.${big(`${fn('f', X)} = ${P(c)}`)}`, ...pick, params: { kind, c },
        hints: ['Differentiate one term at a time: bring each exponent down and lower it by 1.', `The constant ${N(c[c.length - 1])} has derivative 0, so it disappears.`, `${d1('f', X)} = <b>${pick.answer}</b>.`] };
    },
    verify(q) {
      const { kind, c, x0 } = q.params, f = x => c.reduce((s, ci, i) => s + ci * Math.pow(x, c.length - 1 - i), 0);
      if (kind === 'value') return near(deriv(f, x0), q.answer, 1e-6);
      return checkOpts(q, polyDerOpts(c), x => deriv(f, x));
    },
  });

  /* basic functions: how each one is written, its value, its derivative, and a common wrong derivative */
  const BASIC = {
    sin: { html: (cf) => `${cf}sin ${X}`, sp: true, f: Math.sin, d: [1, 'cos'], bad: [-1, 'cos'] },
    cos: { html: (cf) => `${cf}cos ${X}`, sp: true, f: Math.cos, d: [-1, 'sin'], bad: [1, 'sin'] },
    exp: { html: (cf) => `${cf}${ex(X)}`, f: Math.exp, d: [1, 'exp'], bad: [1, 'xexp'] },
    ln: { html: (cf) => `${cf}ln ${X}`, sp: true, f: Math.log, d: [1, 'inv'], bad: [1, 'exp'] },
    inv: { frac: X, f: x => 1 / x },
    xexp: { html: (cf) => `${cf}${X}${ex(`${X} − 1`)}`, f: x => x * Math.exp(x - 1) },
  };
  /** a sum of [coefficient, basic-function name] terms, as HTML */
  function bsum(list) {
    return list.map(([c, u], i) => {
      const b = BASIC[u], mag = Math.abs(c), sign = c < 0 ? (i ? ' − ' : '−') : (i ? ' + ' : '');
      return sign + (b.frac ? sfrac(N(mag), b.frac) : b.html(mag === 1 ? '' : N(mag) + (b.sp ? ' ' : '')));
    }).join('');
  }
  const bval = (list, x) => list.reduce((s, [c, u]) => s + c * BASIC[u].f(x), 0);
  function basicOpts(list) {
    const step = (t, which) => { const [s, u] = BASIC[t[1]][which]; return [s * t[0], u]; };
    return [['d', 'd'], ['bad', 'd'], ['d', 'bad'], ['bad', 'bad']].map(([w1, w2]) => {
      const out = [step(list[0], w1), step(list[1], w2)];
      return { html: bsum(out), f: x => bval(out, x) };
    });
  }
  A.skill({
    id: 'calc.basic-function-derivatives', title: 'Derivatives of sin x, cos x, eˣ and ln x',
    learn: p(`Four derivatives come up constantly, so it’s worth knowing them by heart. <b>${DDX} sin ${X} = cos ${X}, ${DDX} cos ${X} = −sin ${X}, ${DDX} ${ex(X)} = ${ex(X)}, and ${DDX} ln ${X} = ${sfrac('1', X)}.</b>`) +
      p(`Watch the minus sign on the derivative of cosine. And ${ex(X)} is special: it is its own derivative, so the power rule doesn’t apply to it (the variable is in the exponent). Sums and constant multiples work just as they do for polynomials.`) +
      example('Example', `${big(`${fn('f', X)} = 3 sin ${X} − 2 ln ${X}`)}Term by term: 3 cos ${X} − 2 · ${sfrac('1', X)}, so <b>${d1('f', X)} = 3 cos ${X} − ${sfrac('2', X)}</b>.`),
    make(rng) {
      const kind = rng.pick(['expr', 'expr', 'value']);
      if (kind === 'value') {
        const form = rng.pick(['trig', 'trig', 'exp', 'ln']), a = rng.nz(-6, 6), b = rng.nz(-6, 6);
        if (form === 'trig') {
          const j = rng.int(0, 3), to = ['0', 'π/2', 'π', '3π/2'][j], cos = [1, 0, -1, 0][j], sin = [0, 1, 0, -1][j], ans = a * cos - b * sin;
          return { prompt: `${fn('f', X)} = ${bsum([[a, 'sin'], [b, 'cos']])}. Find ${d1('f', to)}.`, type: 'number', answer: ans, params: { kind, list: [[a, 'sin'], [b, 'cos']], x: j * Math.PI / 2 },
            hints: [`${d1('f', X)} = ${bsum([[a, 'cos'], [-b, 'sin']])}.`, `At ${X} = ${to}: cos ${to} = ${N(cos)} and sin ${to} = ${N(sin)}.`, `${N(a)}(${N(cos)}) − ${wrap(b)}(${N(sin)}) = <b>${N(ans)}</b>.`] };
        }
        if (form === 'exp') {
          const list = [[a, 'exp'], [b, 'sin']];
          return { prompt: `${fn('f', X)} = ${bsum(list)}. Find ${d1('f', 0)}.`, type: 'number', answer: a + b, params: { kind, list, x: 0 },
            hints: [`${d1('f', X)} = ${bsum([[a, 'exp'], [b, 'cos']])}.`, `At ${X} = 0: ${ex(0)} = 1 and cos 0 = 1.`, `${N(a)} + ${wrap(b)} = <b>${N(a + b)}</b>.`] };
        }
        const k = rng.int(2, 6), m = rng.nz(-5, 5), list = [[a, 'ln']], r = fa(a + m * k, k);
        const over = den => (a < 0 ? '−' : '') + sfrac(N(Math.abs(a)), den);
        return { prompt: `${fn('f', X)} = ${bsum(list)} ${m < 0 ? '−' : '+'} ${terms([[Math.abs(m), 1]])}. Find ${d1('f', k)}.`, type: 'number', ...r, params: { kind, list, lin: m, x: k },
          hints: [`${d1('f', X)} = ${over(X)} ${M.signed(m)}.`, `At ${X} = ${k}: ${over(k)} ${M.signed(m)}.`, `${d1('f', k)} = <b>${F(a + m * k, k)}</b>.`] };
      }
      const [u1, u2] = rng.sample(['sin', 'cos', 'exp', 'ln'], 2);
      const list = [[rng.nz(-7, 7), u1], [rng.nz(-7, 7), u2]];
      const pick = choose(basicOpts(list));
      const one = t => bsum([[BASIC[t[1]].d[0] * t[0], BASIC[t[1]].d[1]]]);
      return { prompt: `Find the derivative.${big(`${fn('f', X)} = ${bsum(list)}`)}`, ...pick, params: { kind, list },
        hints: [`Use the basic derivatives: (sin ${X})′ = cos ${X}, (cos ${X})′ = −sin ${X}, (${ex(X)})′ = ${ex(X)}, (ln ${X})′ = ${sfrac('1', X)}.`,
          `${bsum([list[0]])} becomes ${one(list[0])}, and ${bsum([[Math.abs(list[1][0]), u2]])} becomes ${one([Math.abs(list[1][0]), u2])}.`, `${d1('f', X)} = <b>${pick.answer}</b>.`] };
    },
    verify(q) {
      const { kind, list, x } = q.params, lin = q.params.lin || 0, f = t => bval(list, t) + lin * t;
      if (kind === 'value') return near(deriv(f, x), q.answer, 1e-6);
      return checkOpts(q, basicOpts(list), t => deriv(f, t));
    },
  });

  function tangentOpts(c, x0) {
    const m = evalP(pder(c), x0), y0 = evalP(c, x0), slip = evalP(c.slice(0, -1), x0);
    return [[m, y0 - m * x0], [m, y0], [m, y0 + m * x0], [slip, y0 - slip * x0], [-m, y0 + m * x0], [y0, y0 - y0 * x0], [m, m * x0 - y0], [m + 1, y0 - (m + 1) * x0], [m - 1, y0 - (m - 1) * x0], [m + 2, y0 - (m + 2) * x0]].map(([s, b]) => ({ html: `${Y} = ${P([s, b])}`, f: x => s * x + b }));
  }
  A.skill({
    id: 'calc.tangent-lines', title: 'Tangent lines',
    learn: p(`The tangent line touches the curve at one point and has the same slope as the curve there. <b>The slope of the tangent line at ${X} = ${V('a')} is ${d1('f', V('a'))}, and the line passes through (${V('a')}, ${fn('f', V('a'))}).</b>`) +
      p(`So: find ${d1('f', X)}, substitute to get the slope ${V('m')}, find the point, then use point-slope form ${Y} − ${M.sub(Y, 1)} = ${V('m')}(${X} − ${M.sub(X, 1)}) and solve for ${Y}.`) +
      example('Example', `${fn('f', X)} = ${X}² + 3${X} at ${X} = 1. ${d1('f', X)} = 2${X} + 3, so ${V('m')} = 5. ${fn('f', 1)} = 4, so the point is (1, 4). ${Y} − 4 = 5(${X} − 1), which gives <b>${Y} = 5${X} − 1</b>.`),
    make(rng) {
      const kind = rng.pick(['slope', 'equation', 'equation', 'yint']);
      const c = rng.bool() ? [rng.nz(-3, 3), rng.int(-5, 5), rng.int(-6, 6)] : [rng.nz(-2, 2), rng.int(-3, 3), rng.int(-4, 4), rng.int(-5, 5)];
      const x0 = rng.int(-2, 3), d = pder(c), m = evalP(d, x0), y0 = evalP(c, x0), b = y0 - m * x0;
      const steps = [`${d1('f', X)} = ${P(d)}, so the slope at ${X} = ${N(x0)} is ${d1('f', N(x0))} = ${N(m)}.`, `${fn('f', N(x0))} = ${N(y0)}, so the line passes through ${M.pt(x0, y0)}.`];
      const line = `${y0 === 0 ? Y : `${Y} ${M.signed(-y0)}`} = ${m === 1 ? '' : m === -1 ? '−' : N(m)}${x0 === 0 ? X : lin(x0)} gives ${Y} = ${P([m, b])}`;
      if (kind === 'slope') return { prompt: `What is the slope of the tangent line to the graph of ${fn('f', X)} = ${P(c)} at ${X} = ${N(x0)}?`, type: 'number', answer: m, params: { kind, c, x0 },
        hints: ['The slope of the tangent line is the derivative at that point.', `${d1('f', X)} = ${P(d)}.`, `${d1('f', N(x0))} = ${subst(d, x0)} = <b>${N(m)}</b>.`] };
      if (kind === 'yint') return { prompt: `The line tangent to ${fn('f', X)} = ${P(c)} at ${X} = ${N(x0)} crosses the ${Y}-axis where? Give its ${Y}-intercept.`, type: 'number', answer: b, params: { kind, c, x0 },
        hints: [...steps, `Point-slope: ${line}.`, `The ${Y}-intercept is <b>${N(b)}</b>.`] };
      const pick = choose(tangentOpts(c, x0));
      return { prompt: `Find the equation of the line tangent to the graph at ${X} = ${N(x0)}.${big(`${fn('f', X)} = ${P(c)}`)}`, ...pick, params: { kind, c, x0 },
        hints: [...steps, `Point-slope: ${line}.`, `<b>${pick.answer}</b>.`] };
    },
    verify(q) {
      const { kind, c, x0 } = q.params, f = x => c.reduce((s, ci, i) => s + ci * Math.pow(x, c.length - 1 - i), 0);
      const s = deriv(f, x0), tangent = x => f(x0) + s * (x - x0);
      if (kind === 'slope') return near(s, q.answer, 1e-6);
      if (kind === 'yint') return near(tangent(0), q.answer, 1e-6);
      return checkOpts(q, tangentOpts(c, x0), tangent);
    },
  });

  /* ---------- Unit 3: More differentiation ---------- */
  /* products of a power of x and one basic function: each term is [coefficient, power of x, function name] */
  const UF = { '': () => 1, exp: Math.exp, sin: Math.sin, cos: Math.cos, ln: Math.log };
  const UH = { '': '', exp: ex(X), sin: `sin ${X}`, cos: `cos ${X}`, ln: `ln ${X}` };
  function psum(list) {
    return list.map(([c, k, u], i) => {
      const mag = Math.abs(c), sign = c < 0 ? (i ? ' − ' : '−') : (i ? ' + ' : '');
      const xs = k === 0 ? '' : k === 1 ? X : `${X}<sup>${k}</sup>`;
      let body = (mag === 1 && (xs || UH[u]) ? '' : N(mag)) + xs;
      if (UH[u]) body += (body && u !== 'exp' ? ' ' : '') + UH[u];
      return sign + body;
    }).join('') || '0';
  }
  const pval = (list, x) => list.reduce((s, [c, k, u]) => s + c * Math.pow(x, k) * UF[u](x), 0);
  /** the derivative of u as [sign, power shift, new function]: (ln x)′ = 1/x lowers the power of x instead */
  const UD = { exp: [1, 0, 'exp'], sin: [1, 0, 'cos'], cos: [-1, 0, 'sin'], ln: [1, -1, ''] };
  function productOpts({ a, n, u }) {
    const [s, sh, du] = UD[u];
    const fg = [a * n, n - 1, u], fgp = [a * s, n + sh, du];
    return [[fg, fgp], [[a * n * s, n - 1 + sh, du]], [fg, [-a * s, n + sh, du]], [fgp]].map(list => ({ html: psum(list), f: x => pval(list, x) }));
  }
  /** a table of f, f′, g, g′ at some inputs */
  const fgTable = (xs, rows) => M.table([X, fn('f', X), d1('f', X), fn('g', X), d1('g', X)], xs.map(x => [N(x), ...['f', 'fp', 'g', 'gp'].map(k => N(rows[x][k]))]), { compact: true });
  function fgRows(rng, xs) {
    const rows = {};
    xs.forEach(x => { rows[x] = { f: rng.int(-6, 6), fp: rng.nz(-5, 5), g: rng.nz(-6, 6), gp: rng.nz(-5, 5) }; });
    return rows;
  }
  /** for verify: a line through (x0, value) with the given slope, which has that value and derivative at x0 */
  const local = (x0, v, s) => x => v + s * (x - x0);

  A.skill({
    id: 'calc.product-rule', title: 'The product rule',
    learn: p(`The derivative of a product is <b>not</b> the product of the derivatives. Each factor takes a turn being differentiated while the other stays the same.`) +
      p(`<b>Product rule: (${V('f')}${V('g')})′ = ${V('f')}′${V('g')} + ${V('f')}${V('g')}′.</b> Name the two factors, find each derivative, then put the four pieces together.`) +
      example('Example', `${big(`${DDX} (${X}² sin ${X})`)}${V('f')} = ${X}², ${V('f')}′ = 2${X}; ${V('g')} = sin ${X}, ${V('g')}′ = cos ${X}. So the derivative is <b>2${X} sin ${X} + ${X}² cos ${X}</b>.`),
    make(rng) {
      const kind = rng.pick(['expr', 'expr', 'table']);
      if (kind === 'table') {
        const xs = rng.sample([-2, -1, 0, 1, 2, 3], 2).sort((a, b) => a - b), k = rng.pick(xs), rows = fgRows(rng, xs), r = rows[k];
        const ans = r.fp * r.g + r.f * r.gp;
        return { prompt: `${fn('h', X)} = ${fn('f', X)}${fn('g', X)}. Use the table to find ${d1('h', N(k))}.${fgTable(xs, rows)}`, type: 'number', answer: ans, params: { kind, k, r },
          hints: [`Product rule: ${d1('h', X)} = ${d1('f', X)}${fn('g', X)} + ${fn('f', X)}${d1('g', X)}.`, `Read the row for ${X} = ${N(k)}: ${d1('h', N(k))} = (${N(r.fp)})(${N(r.g)}) + (${N(r.f)})(${N(r.gp)}).`, `${N(r.fp * r.g)} + ${wrap(r.f * r.gp)} = <b>${N(ans)}</b>.`] };
      }
      const u = rng.pick(['exp', 'sin', 'cos', 'ln']), n = u === 'ln' ? rng.int(2, 4) : rng.int(1, 4), a = rng.pick([1, 1, 2, 3, -1, -2]);
      const params = { kind, a, n, u }, pick = choose(productOpts(params)), [s, sh, du] = UD[u];
      return { prompt: `Find the derivative.${big(`${fn('f', X)} = ${psum([[a, n, u]])}`)}`, ...pick, params,
        hints: [`This is a product. Product rule: (${V('u')}${V('v')})′ = ${V('u')}′${V('v')} + ${V('u')}${V('v')}′, with ${V('u')} = ${psum([[a, n, '']])} and ${V('v')} = ${UH[u]}.`,
          `${V('u')}′ = ${psum([[a * n, n - 1, '']])} and ${V('v')}′ = ${u === 'ln' ? sfrac('1', X) : psum([[s, 0, du]])}.`, `${d1('f', X)} = <b>${pick.answer}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'table') { const { k, r } = pr, f = local(k, r.f, r.fp), g = local(k, r.g, r.gp); return near(deriv(x => f(x) * g(x), k), q.answer, 1e-6); }
      return checkOpts(q, productOpts(pr), x => deriv(t => pr.a * Math.pow(t, pr.n) * UF[pr.u](t), x));
    },
  });

  function quotientOpts({ a, b, c, d }) {
    const den = `(${P([c, d])})<sup>2</sup>`, over = (v, dh) => v === 0 ? '0' : (v < 0 ? '−' : '') + sfrac(N(Math.abs(v)), dh);
    const sq = v => ({ html: over(v, den), f: x => v / Math.pow(c * x + d, 2) });
    return [sq(a * d - b * c), sq(b * c - a * d), sq(a * d + b * c), { html: F(a, c), f: () => a / c }, { html: over(a * d - b * c, P([c, d])), f: x => (a * d - b * c) / (c * x + d) }];
  }
  A.skill({
    id: 'calc.quotient-rule', title: 'The quotient rule',
    learn: p(`To differentiate a fraction ${sfrac(V('f'), V('g'))}, use the quotient rule. A common way to remember the order is “low d-high minus high d-low, over low squared.”`) +
      p(`<b>Quotient rule: (${sfrac(V('f'), V('g'))})′ = ${sfrac(`${V('f')}′${V('g')} − ${V('f')}${V('g')}′`, `${V('g')}²`)}.</b> The order of the top matters, because of the minus sign. The bottom is the original denominator, squared.`) +
      example('Example', `${big(`${DDX} ${sfrac(`2${X} + 1`, `${X} + 3`)}`)}${V('f')} = 2${X} + 1, ${V('f')}′ = 2; ${V('g')} = ${X} + 3, ${V('g')}′ = 1. The top is 2(${X} + 3) − (2${X} + 1)(1) = 5, so the derivative is <b>${sfrac('5', `(${X} + 3)²`)}</b>.`),
    make(rng) {
      const kind = rng.pick(['expr', 'expr', 'value', 'table']);
      if (kind === 'table') {
        const xs = rng.sample([-2, -1, 0, 1, 2, 3], 2).sort((a, b) => a - b), k = rng.pick(xs), rows = fgRows(rng, xs), r = rows[k];
        const top = r.fp * r.g - r.f * r.gp, bot = r.g * r.g;
        return { prompt: `${fn('h', X)} = ${sfrac(fn('f', X), fn('g', X))}. Use the table to find ${d1('h', N(k))}.${fgTable(xs, rows)}`, type: 'number', ...fa(top, bot), params: { kind, k, r },
          hints: [`Quotient rule: ${d1('h', X)} = ${sfrac(`${d1('f', X)}${fn('g', X)} − ${fn('f', X)}${d1('g', X)}`, `${fn('g', X)}²`)}.`, `At ${X} = ${N(k)}: ${sfrac(`(${N(r.fp)})(${N(r.g)}) − (${N(r.f)})(${N(r.gp)})`, `(${N(r.g)})²`)} = ${sfrac(N(top), N(bot))}.`, `${d1('h', N(k))} = <b>${F(top, bot)}</b>.`] };
      }
      const c = rng.int(1, 4), a = rng.nz(-5, 5);
      let b, d; do { b = rng.int(-6, 6); d = rng.nz(-6, 6); } while (a * d - b * c === 0);
      const params = { kind, a, b, c, d }, top = a * d - b * c, steps = [`Quotient rule with ${V('f')} = ${P([a, b])}, ${V('f')}′ = ${N(a)}, ${V('g')} = ${P([c, d])}, ${V('g')}′ = ${N(c)}.`,
        `The top is (${N(a)})(${P([c, d])}) − (${P([a, b])})(${N(c)}) = ${N(a * d)} − ${wrap(b * c)} = ${N(top)}; the ${X} terms cancel.`];
      if (kind === 'value') {
        let k; do { k = rng.int(-2, 3); } while (c * k + d === 0);
        return { prompt: `${fn('h', X)} = ${sfrac(P([a, b]), P([c, d]))}. Find ${d1('h', N(k))}.`, type: 'number', ...fa(top, Math.pow(c * k + d, 2)), params: { ...params, k },
          hints: [...steps, `${d1('h', X)} = ${sfrac(N(top), `(${P([c, d])})²`)}, so ${d1('h', N(k))} = ${sfrac(N(top), `(${N(c * k + d)})²`)} = <b>${F(top, Math.pow(c * k + d, 2))}</b>.`] };
      }
      const pick = choose(quotientOpts(params));
      return { prompt: `Find the derivative.${big(`${fn('h', X)} = ${sfrac(P([a, b]), P([c, d]))}`)}`, ...pick, params, hints: [...steps, `${d1('h', X)} = <b>${pick.answer}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'table') { const { k, r } = pr, f = local(k, r.f, r.fp), g = local(k, r.g, r.gp); return near(deriv(x => f(x) / g(x), k), q.answer, 1e-6); }
      const h = x => (pr.a * x + pr.b) / (pr.c * x + pr.d);
      if (pr.kind === 'value') return near(deriv(h, pr.k), q.answer, 1e-6);
      return checkOpts(q, quotientOpts(pr), x => deriv(h, x));
    },
  });

  /* chain rule options; each kind lists the right derivative first, then common slips */
  function chainOpts({ form, a, b, n, k }) {
    const pw = (coef, inner, pow, xf) => ({ html: `${coef === 1 ? '' : coef === -1 ? '−' : N(coef)}${xf ? X : ''}(${inner})${pow === 1 ? '' : `<sup>${pow}</sup>`}` });
    if (form === 'linpow') return [[n * a, n - 1], [n, n - 1], [n * a, n], [a, n - 1], [n + a, n - 1], [-n * a, n - 1]].map(([c, p2]) => ({ ...pw(c, P([a, b]), p2), f: x => c * Math.pow(a * x + b, p2) }));
    if (form === 'quadpow') return [[2 * n, n - 1, 1], [n, n - 1, 0], [2 * n, n, 1], [2, n - 1, 1]].map(([c, p2, xf]) => ({ ...pw(c, P([1, 0, b]), p2, xf), f: x => c * (xf ? x : 1) * Math.pow(x * x + b, p2) }));
    const kx = `${N(k)}${X}`, cf = c => c === 1 ? '' : c === -1 ? '−' : N(c);
    if (form === 'exp') return [{ html: `${cf(k)}${ex(kx)}`, f: x => k * Math.exp(k * x) }, { html: ex(kx), f: x => Math.exp(k * x) },
      { html: (k < 0 ? '−' : '') + sfrac(ex(kx), N(Math.abs(k))), f: x => Math.exp(k * x) / k }, { html: `${cf(k)}${ex(X)}`, f: x => k * Math.exp(x) }];
    const T = form === 'sin' ? [[k, 'cos', kx], [1, 'cos', kx], [-k, 'cos', kx], [k, 'cos', X]] : [[-k, 'sin', kx], [-1, 'sin', kx], [k, 'sin', kx], [-k, 'sin', X]];
    if (form === 'sin' || form === 'cos') return T.map(([c, g, arg]) => ({ html: `${cf(c)}${c === 1 || c === -1 ? '' : ' '}${g}(${arg})`.replace('(<i>x</i>)', ` ${X}`), f: x => c * Math[g](arg === X ? x : k * x) }));
    const inner = P([a, b]);
    return [{ html: sfrac(N(a), inner), f: x => a / (a * x + b) }, { html: sfrac('1', inner), f: x => 1 / (a * x + b) },
      { html: `${N(a)} ln(${inner})`, f: x => a * Math.log(a * x + b) }, { html: sfrac(N(a), `(${inner})<sup>2</sup>`), f: x => a / Math.pow(a * x + b, 2) }];
  }
  const chainF = ({ form, a, b, n, k }) => ({ linpow: x => Math.pow(a * x + b, n), quadpow: x => Math.pow(x * x + b, n), exp: x => Math.exp(k * x), sin: x => Math.sin(k * x), cos: x => Math.cos(k * x), ln: x => Math.log(a * x + b) })[form];
  A.skill({
    id: 'calc.chain-rule', title: 'The chain rule',
    learn: p(`A composite function has an outside function and an inside function, like (${X}² + 1)<sup>5</sup>: the outside is “something to the 5th power,” and the inside is ${X}² + 1.`) +
      p(`<b>Chain rule: differentiate the outside function, leaving the inside alone, then multiply by the derivative of the inside.</b> In symbols, ${DDX} ${fn('f', fn('g', X))} = ${d1('f', fn('g', X))} · ${d1('g', X)}. Forgetting that last factor is the most common slip.`) +
      example('Example', `${big(`${DDX} (${X}² + 1)<sup>5</sup>`)}Outside: 5(${X}² + 1)<sup>4</sup>. Inside derivative: 2${X}. Multiply: <b>10${X}(${X}² + 1)<sup>4</sup></b>.`),
    make(rng) {
      const form = rng.pick(['linpow', 'quadpow', 'exp', 'sin', 'cos', 'ln', 'table', 'table']);
      if (form === 'table') {
        const [k, m] = rng.sample([1, 2, 3, 4, 5], 2), rows = fgRows(rng, [k, m]), outer = rng.pick(['f', 'g']), inner = outer === 'f' ? 'g' : 'f';
        rows[k][inner] = m;
        const xs = [k, m].sort((s, t) => s - t), ans = rows[m][outer + 'p'] * rows[k][inner + 'p'];
        return { prompt: `${fn('h', X)} = ${fn(outer, fn(inner, X))}. Use the table to find ${d1('h', k)}.${fgTable(xs, rows)}`, type: 'number', answer: ans, params: { form, k, outer, inner, rows },
          hints: [`Chain rule: ${d1('h', X)} = ${d1(outer, fn(inner, X))} · ${d1(inner, X)}.`, `${fn(inner, k)} = ${m}, so ${d1('h', k)} = ${d1(outer, m)} · ${d1(inner, k)}.`, `(${N(rows[m][outer + 'p'])})(${N(rows[k][inner + 'p'])}) = <b>${N(ans)}</b>.`] };
      }
      const params = { form, a: rng.pick([2, 3, 4, 5, -2, -3]), b: rng.nz(-7, 7), n: rng.int(2, 6), k: rng.pick([2, 3, 4, 5, -2, -3]) };
      if (form === 'quadpow') { params.n = rng.int(2, 5); params.b = rng.nz(-5, 9); }
      if (form === 'sin' || form === 'cos') params.k = rng.int(2, 6);
      if (form === 'ln') { params.a = rng.int(2, 5); params.b = rng.int(1, 9); }
      const { a, b, n, k } = params, kx = `${N(k)}${X}`;
      const fx = { linpow: `(${P([a, b])})<sup>${n}</sup>`, quadpow: `(${P([1, 0, b])})<sup>${n}</sup>`, exp: ex(kx), sin: `sin(${kx})`, cos: `cos(${kx})`, ln: `ln(${P([a, b])})` }[form];
      const step = { linpow: [`Outside: ${n}(${P([a, b])})<sup>${n - 1}</sup>.`, `Inside: ${DDX}(${P([a, b])}) = ${N(a)}.`], quadpow: [`Outside: ${n}(${P([1, 0, b])})<sup>${n - 1}</sup>.`, `Inside: ${DDX}(${P([1, 0, b])}) = 2${X}.`],
        exp: [`Outside: ${ex('u')} stays ${ex(kx)}.`, `Inside: ${DDX}(${kx}) = ${N(k)}.`], sin: [`Outside: sin becomes cos, so cos(${kx}).`, `Inside: ${DDX}(${kx}) = ${N(k)}.`],
        cos: [`Outside: cos becomes −sin, so −sin(${kx}).`, `Inside: ${DDX}(${kx}) = ${N(k)}.`], ln: [`Outside: ln ${V('u')} becomes ${sfrac('1', V('u'))}, so ${sfrac('1', P([a, b]))}.`, `Inside: ${DDX}(${P([a, b])}) = ${N(a)}.`] }[form];
      const pick = choose(chainOpts(params));
      return { prompt: `Find the derivative.${big(`${fn('f', X)} = ${fx}`)}`, ...pick, params, hints: [...step, `Multiply them: ${d1('f', X)} = <b>${pick.answer}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.form === 'table') {
        const { k, outer, inner, rows } = pr, m = rows[k][inner];
        const I = local(k, m, rows[k][inner + 'p']), O = local(m, rows[m][outer], rows[m][outer + 'p']);
        return near(deriv(x => O(I(x)), k), q.answer, 1e-6);
      }
      return checkOpts(q, chainOpts(pr), x => deriv(chainF(pr), x));
    },
  });

  /* implicit curves: G(x, y) = c, as HTML, as a function, and dy/dx as [top, bottom] at (p, q) */
  const IMPLICIT = {
    circle: { html: () => `${X}<sup>2</sup> + ${Y}<sup>2</sup>`, G: () => (x, y) => x * x + y * y, slope: (pp, q) => [-pp, q], step: () => `2${X} + 2${Y}${DYDX} = 0`, solved: () => sfrac(`−${X}`, Y) },
    ellipse: { html: ({ a, b }) => `${a === 1 ? '' : a}${X}<sup>2</sup> + ${b === 1 ? '' : b}${Y}<sup>2</sup>`, G: ({ a, b }) => (x, y) => a * x * x + b * y * y, slope: (pp, q, { a, b }) => [-a * pp, b * q],
      step: ({ a, b }) => `${2 * a}${X} + ${2 * b}${Y}${DYDX} = 0`, solved: ({ a, b }) => sfrac(`−${2 * a}${X}`, `${2 * b}${Y}`) },
    mixed: { html: ({ k }) => `${X}<sup>2</sup> ${k < 0 ? '−' : '+'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}${X}${Y} + ${Y}<sup>2</sup>`, G: ({ k }) => (x, y) => x * x + k * x * y + y * y, slope: (pp, q, { k }) => [-(2 * pp + k * q), k * pp + 2 * q],
      step: ({ k }) => `2${X} ${M.signed(k)}(${Y} + ${X}${DYDX}) + 2${Y}${DYDX} = 0`, solved: ({ k }) => sfrac(`−(2${X} ${k < 0 ? '−' : '+'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}${Y})`, `${M.term(k, 'x')} + 2${Y}`) },
    xycube: { html: () => `${X}${Y} + ${Y}<sup>3</sup>`, G: () => (x, y) => x * y + y * y * y, slope: (pp, q) => [-q, pp + 3 * q * q],
      step: () => `${Y} + ${X}${DYDX} + 3${Y}<sup>2</sup>${DYDX} = 0`, solved: () => sfrac(`−${Y}`, `${X} + 3${Y}<sup>2</sup>`) },
  };
  A.skill({
    id: 'calc.implicit-differentiation', title: 'Implicit differentiation',
    learn: p(`When ${Y} isn’t written as a function of ${X}, as in ${X}² + ${Y}² = 25, you can still find the slope. <b>Differentiate both sides with respect to ${X}, treating ${Y} as a function of ${X}: every time you differentiate something with ${Y}, multiply by ${DYDX}</b> (that’s the chain rule).`) +
      p(`Then collect the ${DYDX} terms on one side and solve for ${DYDX}. To get a number, substitute the point’s ${X} and ${Y}.`) +
      example('Example', `${big(`${X}² + ${Y}² = 25 at (3, 4)`)}Differentiate: 2${X} + 2${Y}${DYDX} = 0, so ${DYDX} = −${sfrac(X, Y)}. At (3, 4): <b>${DYDX} = −${F(3, 4)}</b>.`),
    make(rng) {
      const kind = rng.pick(['circle', 'ellipse', 'mixed', 'xycube']), pr = { kind, a: rng.int(1, 5), b: 0, k: rng.pick([1, -1, 3, -3]) };
      do { pr.b = rng.int(1, 5); } while (pr.b === pr.a);
      let pp, q, c;
      if (kind === 'circle') { const [u, w, r] = rng.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]]); [pp, q] = rng.bool() ? [u, w] : [w, u]; pp *= rng.sign(); q *= rng.sign(); c = r * r; }
      else {
        do { pp = rng.nz(-3, 3); q = rng.nz(-3, 3); c = IMPLICIT[kind].G(pr)(pp, q); } while (IMPLICIT[kind].slope(pp, q, pr)[1] === 0 || c <= 0);
      }
      const D = IMPLICIT[kind], [top, bot] = D.slope(pp, q, pr), r = fa(top, bot);
      Object.assign(pr, { p: pp, q, c });
      return {
        prompt: `Find ${DYDX} at the point ${M.pt(pp, q)}.${big(`${D.html(pr)} = ${N(c)}`)}`, type: 'number', ...r, params: pr,
        hints: [`Differentiate both sides with respect to ${X}, multiplying by ${DYDX} whenever you differentiate a ${Y} term: ${D.step(pr)}.`, `Solve for ${DYDX}: ${DYDX} = ${D.solved(pr)}.`,
          `Substitute ${X} = ${N(pp)}, ${Y} = ${N(q)}: ${DYDX} = <b>${F(top, bot)}</b>.`],
      };
    },
    verify(q) {
      const pr = q.params, G = IMPLICIT[pr.kind].G(pr);
      const solveY = x => { let y = pr.q; for (let i = 0; i < 40; i++) { const e = 1e-7, gy = (G(x, y + e) - G(x, y - e)) / (2 * e); y -= (G(x, y) - pr.c) / gy; } return y; };
      if (Math.abs(G(pr.p, pr.q) - pr.c) > 1e-9) return 'the point is not on the curve';
      const h = 1e-5;
      return near((solveY(pr.p + h) - solveY(pr.p - h)) / (2 * h), q.answer, 1e-5);
    },
  });

  function secondOpts(c) {
    const d = pder(c), dd = pder(d);
    return [dd, d, pder(dd), d.slice(0, -1)].map(arr => ({ html: P(arr), f: x => evalP(arr, x) }));
  }
  A.skill({
    id: 'calc.second-derivatives', title: 'Second derivatives',
    learn: p(`The <b>second derivative</b> ${d2('f', X)} is the derivative of the derivative. It measures how fast the slope itself is changing; for motion, if ${V('f')} is position, ${V('f')}′ is velocity and ${V('f')}″ is acceleration.`) +
      p(`<b>To find ${d2('f', X)}, differentiate ${V('f')} once to get ${d1('f', X)}, then differentiate ${d1('f', X)} again.</b> Keep each step tidy, since a mistake in ${V('f')}′ carries into ${V('f')}″.`) +
      example('Example', `${big(`${fn('f', X)} = ${X}<sup>4</sup> − 3${X}<sup>2</sup> + 5${X}`)}${d1('f', X)} = 4${X}<sup>3</sup> − 6${X} + 5, and ${d2('f', X)} = <b>12${X}<sup>2</sup> − 6</b>. At ${X} = 1 that’s 12 − 6 = 6.`),
    make(rng) {
      const kind = rng.pick(['poly', 'poly', 'trig', 'expr']);
      if (kind === 'trig') {
        const a = rng.nz(-6, 6), b = rng.nz(-6, 6), cc = rng.nz(-5, 5), list = [[a, 'sin'], [b, 'cos'], [cc, 'exp']];
        return { prompt: `${fn('f', X)} = ${bsum(list)}. Find ${d2('f', 0)}.`, type: 'number', answer: cc - b, params: { kind, list },
          hints: [`${d1('f', X)} = ${bsum([[a, 'cos'], [-b, 'sin'], [cc, 'exp']])}.`, `${d2('f', X)} = ${bsum([[-a, 'sin'], [-b, 'cos'], [cc, 'exp']])}.`, `At ${X} = 0: sin 0 = 0, cos 0 = 1, ${ex(0)} = 1, so ${d2('f', 0)} = ${N(-b)} + ${wrap(cc)} = <b>${N(cc - b)}</b>.`] };
      }
      const c = rng.bool() ? [rng.nz(-3, 3), rng.int(-5, 5), rng.int(-6, 6), rng.int(-9, 9)] : [rng.nz(-2, 2), rng.int(-3, 3), rng.int(-5, 5), rng.int(-6, 6), rng.int(-9, 9)];
      const d = pder(c), dd = pder(d);
      if (kind === 'expr') {
        const pick = choose(secondOpts(c));
        return { prompt: `Find the second derivative.${big(`${fn('f', X)} = ${P(c)}`)}`, ...pick, params: { kind, c },
          hints: [`First derivative: ${d1('f', X)} = ${P(d)}.`, `Differentiate again, term by term.`, `${d2('f', X)} = <b>${pick.answer}</b>.`] };
      }
      const x0 = rng.int(-2, 3), ans = evalP(dd, x0);
      return { prompt: `${fn('f', X)} = ${P(c)}. Find ${d2('f', N(x0))}.`, type: 'number', answer: ans, params: { kind, c, x0 },
        hints: [`First derivative: ${d1('f', X)} = ${P(d)}.`, `Second derivative: ${d2('f', X)} = ${P(dd)}.`, `${d2('f', N(x0))} = ${subst(dd, x0)} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'trig') return near(deriv2(x => bval(pr.list, x), 0), q.answer, 1e-4);
      const f = x => pr.c.reduce((s, ci, i) => s + ci * Math.pow(x, pr.c.length - 1 - i), 0);
      if (pr.kind === 'expr') return checkOpts(q, secondOpts(pr.c), x => deriv2(f, x), XS, 1e-4);
      return near(deriv2(f, pr.x0), q.answer, 1e-4);
    },
  });

  /* ---------- Unit 4: Applications of derivatives ---------- */
  /** for verify: the places in [lo, hi] where g changes sign, found by stepping along */
  function signChanges(g, lo, hi, step) {
    const out = [];
    let prev = g(lo);
    for (let x = lo + step; x <= hi + 1e-12; x += step) {
      const cur = g(x);
      if (Math.abs(cur) < 1e-9) { const nxt = g(x + step); if (prev * nxt < 0) { out.push(x); prev = nxt; x += step; continue; } }
      if (prev * cur < 0) out.push(x - step / 2);
      if (cur !== 0) prev = cur;
    }
    return out;
  }

  A.skill({
    id: 'calc.motion', title: 'Position, velocity and acceleration',
    learn: p(`If ${fn('s', T)} gives an object’s position at time ${T}, then <b>velocity is the derivative of position, ${fn('v', T)} = ${d1('s', T)}, and acceleration is the derivative of velocity, ${fn('a', T)} = ${d1('v', T)} = ${d2('s', T)}.</b>`) +
      p(`The object is <b>at rest</b> when ${fn('v', T)} = 0. It moves in the positive direction when ${fn('v', T)} &gt; 0 and in the negative direction when ${fn('v', T)} &lt; 0.`) +
      example('Example', `${fn('s', T)} = ${T}³ − 6${T}² + 9${T}. Then ${fn('v', T)} = 3${T}² − 12${T} + 9 = 3(${T} − 1)(${T} − 3), so the object is at rest at ${T} = 1 and ${T} = 3. Also ${fn('a', T)} = 6${T} − 12, so at ${T} = 3 the acceleration is <b>6</b>.`),
    make(rng) {
      const kind = rng.pick(['vel', 'acc', 'rest']), lead = `A particle moves along a line. Its position after ${T} seconds is`;
      if (kind === 'rest') {
        let pp, q; do { pp = rng.int(1, 6); q = rng.int(1, 6); } while (pp >= q || (pp + q) % 2);
        const c = [1, -3 * (pp + q) / 2, 3 * pp * q, rng.int(0, 10)], later = rng.bool(), ans = later ? q : pp;
        return { prompt: `${lead} ${fn('s', T)} = ${P(c, 't')} meters. The particle is at rest at two times. What is the ${later ? 'later' : 'earlier'} one?`, type: 'number', answer: ans, unit: 's', params: { kind, c, later },
          hints: ['The particle is at rest when its velocity is 0.', `${fn('v', T)} = ${d1('s', T)} = ${P(pder(c), 't')} = 3(${P([1, -(pp + q), pp * q], 't')}) = 3${lin(pp).replace(/x/g, 't')}${lin(q).replace(/x/g, 't')}.`, `${fn('v', T)} = 0 at ${T} = ${pp} and ${T} = ${q}, so the ${later ? 'later' : 'earlier'} time is <b>${ans} s</b>.`] };
      }
      const c = [rng.pick([1, 2, -1]), rng.int(-6, 6), rng.int(-9, 9), rng.int(0, 20)], t0 = rng.int(1, 4), v = pder(c), a = pder(v);
      if (kind === 'vel') {
        const ans = evalP(v, t0);
        return { prompt: `${lead} ${fn('s', T)} = ${P(c, 't')} meters. What is its velocity at ${T} = ${t0}?`, type: 'number', answer: ans, unit: 'm/s', params: { kind, c, t0 },
          hints: ['Velocity is the derivative of position.', `${fn('v', T)} = ${P(v, 't')}.`, `${fn('v', t0)} = ${subst(v, t0)} = <b>${N(ans)} m/s</b>.`] };
      }
      const ans = evalP(a, t0);
      return { prompt: `${lead} ${fn('s', T)} = ${P(c, 't')} meters. What is its acceleration at ${T} = ${t0}?`, type: 'number', answer: ans, unit: 'm/s²', params: { kind, c, t0 },
        hints: ['Acceleration is the derivative of velocity, which is the derivative of position.', `${fn('v', T)} = ${P(v, 't')}, so ${fn('a', T)} = ${P(a, 't')}.`, `${fn('a', t0)} = ${subst(a, t0)} = <b>${N(ans)} m/s²</b>.`] };
    },
    verify(q) {
      const { kind, c, t0 } = q.params, s = t => evalP(c, t);
      if (kind === 'vel') return near(deriv(s, t0), q.answer, 1e-6);
      if (kind === 'acc') return near(deriv2(s, t0), q.answer, 1e-4);
      const rest = signChanges(t => deriv(s, t), 0.001, 10, 0.001);
      return rest.length === 2 && near(q.params.later ? rest[1] : rest[0], q.answer, 1e-3);
    },
  });

  const rateOf = v => sfrac(`d${V(v)}`, `d${T}`);
  const RATES = {
    circle: { ask: (R, k) => `A ripple spreads out in a circle. Its radius grows at ${k} cm/s. How fast is the area of the circle growing when the radius is ${R} cm? Give the answer as a multiple of π.`, unit: 'π cm²/s', Q: r => r * r,
      rule: `${V('A')} = π${V('r')}², so ${rateOf('A')} = 2π${V('r')} ${rateOf('r')}.`, sub: (R, k) => `2π(${R})(${k}) = ${2 * R * k}π`, ans: (R, k) => 2 * R * k },
    sphere: { ask: (R, k) => `A spherical balloon is being inflated so its radius grows at ${k} cm/s. How fast is its volume growing when the radius is ${R} cm? Give the answer as a multiple of π.`, unit: 'π cm³/s', Q: r => 4 / 3 * r * r * r,
      rule: `${V('V')} = ${F(4, 3)}π${V('r')}³, so ${rateOf('V')} = 4π${V('r')}² ${rateOf('r')}.`, sub: (R, k) => `4π(${R})²(${k}) = ${4 * R * R * k}π`, ans: (R, k) => 4 * R * R * k },
    square: { ask: (R, k) => `Each side of a square grows at ${k} cm/s. How fast is the area growing when the sides are ${R} cm long?`, unit: 'cm²/s', Q: s => s * s,
      rule: `${V('A')} = ${V('s')}², so ${rateOf('A')} = 2${V('s')} ${rateOf('s')}.`, sub: (R, k) => `2(${R})(${k}) = ${2 * R * k}`, ans: (R, k) => 2 * R * k },
    cube: { ask: (R, k) => `Each edge of a cube grows at ${k} cm/s. How fast is the volume growing when the edges are ${R} cm long?`, unit: 'cm³/s', Q: s => s * s * s,
      rule: `${V('V')} = ${V('s')}³, so ${rateOf('V')} = 3${V('s')}² ${rateOf('s')}.`, sub: (R, k) => `3(${R})²(${k}) = ${3 * R * R * k}`, ans: (R, k) => 3 * R * R * k },
  };
  A.skill({
    id: 'calc.related-rates', title: 'Related rates',
    learn: p(`In a related-rates problem, two quantities change over time and are tied together by an equation. Knowing how fast one changes tells you how fast the other changes.`) +
      p(`<b>Write an equation linking the quantities, differentiate both sides with respect to time ${T} (using the chain rule), then substitute the values at the moment you care about.</b> Substitute only after differentiating; otherwise the changing quantities would look constant.`) +
      example('Example', `A circle’s radius grows at 3 cm/s. How fast is the area growing when ${V('r')} = 5 cm? ${V('A')} = π${V('r')}², so ${rateOf('A')} = 2π${V('r')} ${rateOf('r')} = 2π(5)(3) = <b>30π cm²/s</b>.`),
    make(rng) {
      const kind = rng.pick(['circle', 'sphere', 'square', 'cube', 'ladder', 'ladder']);
      if (kind === 'ladder') {
        const [u, w, L] = rng.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20]]), [a, b] = rng.bool() ? [u, w] : [w, u], k = rng.int(1, 4);
        const name = rng.pick(NAMES);
        return { prompt: `${name} leans a ${L}-foot ladder against a wall. The bottom slides away from the wall at ${k} ft/s. How fast is the top sliding down the wall when the bottom is ${a} feet from the wall?`, type: 'number', ...fa(a * k, b), unit: 'ft/s', params: { kind, a, L, k },
          hints: [`Let ${X} be the distance from the wall to the bottom and ${Y} the height of the top: ${X}² + ${Y}² = ${L * L}. When ${X} = ${a}, ${Y} = ${M.sqrt(`${L * L} − ${a * a}`)} = ${b}.`,
            `Differentiate with respect to ${T}: 2${X} ${rateOf('x')} + 2${Y} ${rateOf('y')} = 0, so ${rateOf('y')} = −${sfrac(X, Y)} ${rateOf('x')}.`,
            `${rateOf('y')} = −${sfrac(a, b)}(${k}) = −${F(a * k, b)}. The minus sign means the top is moving down, at <b>${F(a * k, b)} ft/s</b>.`] };
      }
      const D = RATES[kind], R = rng.int(2, kind === 'sphere' || kind === 'cube' ? 6 : 12), k = rng.int(1, 5), ans = D.ans(R, k);
      return { prompt: D.ask(R, k), type: 'number', answer: ans, unit: D.unit, params: { kind, R, k },
        hints: [`Write the formula and differentiate both sides with respect to ${T}: ${D.rule}`, `Substitute the values at that moment: ${D.sub(R, k)}.`, `It is growing at <b>${N(ans)} ${D.unit}</b>.`] };
    },
    verify(q) {
      const { kind, R, k, a, L } = q.params;
      if (kind === 'ladder') return near(-deriv(t => Math.sqrt(L * L - Math.pow(a + k * t, 2)), 0), q.answer, 1e-6);
      return near(deriv(t => RATES[kind].Q(R + k * t), 0), q.answer, 1e-6);
    },
  });

  /** the cubic s·(2x³ − 3(p + q)x² + 6pqx) + d, whose derivative is 6s(x − p)(x − q) */
  const cubicPQ = (s, pp, q, d) => [2 * s, -3 * s * (pp + q), 6 * s * pp * q, d];
  const xSet = xs => xs.length === 1 ? `${X} = ${N(xs[0])} only` : `${X} = ${N(xs[0])} and ${X} = ${N(xs[1])}`;
  A.skill({
    id: 'calc.critical-points', title: 'Critical points',
    learn: p(`A <b>critical point</b> of ${V('f')} is an ${X}-value in its domain where ${d1('f', X)} = 0 or ${d1('f', X)} doesn’t exist. These are the only places where ${V('f')} can turn around, so they’re where to look for maximums and minimums.`) +
      p(`<b>To find them, differentiate, set ${d1('f', X)} = 0, and solve.</b> For a polynomial, the derivative always exists, so you only need the zeros of ${d1('f', X)}. Factoring is usually the quickest way.`) +
      example('Example', `${big(`${fn('f', X)} = 2${X}³ − 9${X}² + 12${X}`)}${d1('f', X)} = 6${X}² − 18${X} + 12 = 6(${X} − 1)(${X} − 2). Setting it to 0 gives <b>${X} = 1 and ${X} = 2</b>.`),
    make(rng) {
      const kind = rng.pick(['cubic', 'cubic', 'quad', 'recip']);
      if (kind === 'quad') {
        const a = rng.nz(-4, 4), b = rng.int(-9, 9), c = rng.int(-9, 9), r = fa(-b, 2 * a);
        return { prompt: `${fn('f', X)} = ${P([a, b, c])}. At what ${X}-value does ${V('f')} have a critical point?`, type: 'number', ...r, params: { kind, f: [a, b, c] },
          hints: [`Set the derivative equal to 0: ${d1('f', X)} = ${P([2 * a, b])}.`, `${P([2 * a, b])} = 0, so ${X} = ${sfrac(N(-b), N(2 * a))}.`, `The critical point is at ${X} = <b>${F(-b, 2 * a)}</b>.`] };
      }
      if (kind === 'recip') {
        const a = rng.int(1, 4), r = rng.int(1, 5), b = a * r * r;
        return { prompt: `${fn('f', X)} = ${a === 1 ? '' : a}${X} + ${sfrac(b, X)}. What is the positive critical point of ${V('f')}?`, type: 'number', answer: r, params: { kind, a, b },
          hints: [`Write ${sfrac(b, X)} as ${b}${X}<sup>−1</sup>. Then ${d1('f', X)} = ${a} − ${sfrac(b, `${X}²`)}.`, `Set it to 0: ${a === 1 ? '' : a}${X}² = ${b}, so ${X}² = ${r * r} and ${X} = ±${r}. (${X} = 0 is not in the domain.)`, `The positive critical point is ${X} = <b>${r}</b>.`] };
      }
      let pp, q; do { pp = rng.nz(-4, 4); q = rng.nz(-4, 4); } while (pp >= q || Math.abs(pp) === Math.abs(q));
      const s = rng.sign(), c = cubicPQ(s, pp, q, rng.int(-9, 9)), srt = xs => xs.slice().sort((u, w) => u - w);
      const ans = xSet([pp, q]), cands = [xSet(srt([-pp, -q])), xSet(srt([pp, -q])), xSet(srt([-pp, q])), xSet([pp])];
      return { prompt: `Find all critical points of ${V('f')}.${big(`${fn('f', X)} = ${P(c)}`)}`, type: 'choice', answer: ans, choices: [ans, ...distinct(ans, cands, 3)], params: { kind, f: c },
        hints: [`Differentiate: ${d1('f', X)} = ${P(pder(c))}.`, `Factor: ${d1('f', X)} = ${N(6 * s)}(${P([1, -(pp + q), pp * q])}) = ${N(6 * s)}${lin(pp)}${lin(q)}.`, `${d1('f', X)} = 0 at <b>${ans}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'recip') { const f = x => pr.a * x + pr.b / x; return q.answer > 0 && Math.abs(deriv(f, q.answer)) < 1e-6; }
      const f = x => evalP(pr.f, x);
      if (pr.kind === 'quad') return Math.abs(deriv(f, q.answer)) < 1e-6;
      const roots = signChanges(x => deriv(f, x), -10, 10, 0.01).map(Math.round);
      return q.answer === xSet(roots);
    },
  });

  const intervalOpts = (pp, q) => [`(${N(pp)}, ${N(q)})`, `(−∞, ${N(pp)}) and (${N(q)}, ∞)`, `(${N(-q)}, ${N(-pp)})`, `(−∞, ${N(-q)}) and (${N(-pp)}, ∞)`, `(−∞, ${N(q)})`, `(${N(pp)}, ∞)`];
  A.skill({
    id: 'calc.increasing-decreasing', title: 'Increasing, decreasing and local extrema',
    learn: p(`<b>${V('f')} is increasing where ${d1('f', X)} &gt; 0 and decreasing where ${d1('f', X)} &lt; 0.</b> The sign of the derivative can only change at a critical point, so mark the critical points on a number line and test one ${X}-value in each piece.`) +
      p(`<b>First derivative test:</b> if ${d1('f', X)} changes from positive to negative at a critical point, ${V('f')} has a local maximum there; from negative to positive, a local minimum. No sign change means neither.`) +
      example('Example', `${fn('f', X)} = ${X}³ − 3${X}. ${d1('f', X)} = 3(${X} + 1)(${X} − 1). Test ${X} = −2: positive. Test 0: negative. Test 2: positive. So ${V('f')} decreases on (−1, 1), with a <b>local maximum at ${X} = −1</b> and a <b>local minimum at ${X} = 1</b>.`),
    make(rng) {
      const kind = rng.pick(['max', 'min', 'interval', 'interval']);
      let pp, q; do { pp = rng.int(-4, 4); q = rng.int(-3, 5); } while (pp >= q);
      const s = rng.sign(), c = cubicPQ(s, pp, q, rng.int(-9, 9));
      const signs = s > 0 ? ['positive', 'negative', 'positive'] : ['negative', 'positive', 'negative'];
      const steps = [`${d1('f', X)} = ${P(pder(c))} = ${N(6 * s)}${lin(pp)}${lin(q)}, so the critical points are ${X} = ${N(pp)} and ${X} = ${N(q)}.`,
        `Test a point in each piece: ${d1('f', X)} is ${signs[0]} left of ${N(pp)}, ${signs[1]} between ${N(pp)} and ${N(q)}, and ${signs[2]} right of ${N(q)}.`];
      if (kind !== 'interval') {
        const ans = (kind === 'max') === (s > 0) ? pp : q;
        return { prompt: `At what ${X}-value does ${V('f')} have a local ${kind === 'max' ? 'maximum' : 'minimum'}?${big(`${fn('f', X)} = ${P(c)}`)}`, type: 'number', answer: ans, params: { kind, c },
          hints: [...steps, `${d1('f', X)} changes from ${kind === 'max' ? 'positive to negative' : 'negative to positive'} at ${X} = ${N(ans)}, so the local ${kind === 'max' ? 'maximum' : 'minimum'} is at ${X} = <b>${N(ans)}</b>.`] };
      }
      const inc = rng.bool(), opts = intervalOpts(pp, q), ans = (inc === (s > 0)) ? opts[1] : opts[0], others = opts.filter(o => o !== ans);
      return { prompt: `On which interval or intervals is ${V('f')} ${inc ? 'increasing' : 'decreasing'}?${big(`${fn('f', X)} = ${P(c)}`)}`, type: 'choice', answer: ans, choices: [ans, ...distinct(ans, others, 3)], params: { kind, c, inc },
        hints: [...steps, `${V('f')} is ${inc ? 'increasing' : 'decreasing'} where ${d1('f', X)} is ${inc ? 'positive' : 'negative'}: <b>${ans}</b>.`] };
    },
    verify(q) {
      const { kind, c, inc } = q.params, fp = x => deriv(t => evalP(c, t), x);
      const [r1, r2] = signChanges(fp, -10, 10, 0.01).map(Math.round);
      if (kind === 'max') return q.answer === (fp(r1 - 0.5) > 0 ? r1 : r2) && fp(q.answer - 0.5) > 0 && fp(q.answer + 0.5) < 0;
      if (kind === 'min') return fp(q.answer - 0.5) < 0 && fp(q.answer + 0.5) > 0;
      const middleUp = fp((r1 + r2) / 2) > 0, opts = intervalOpts(r1, r2);
      return q.answer === (middleUp === inc ? opts[0] : opts[1]);
    },
  });

  A.skill({
    id: 'calc.absolute-extrema', title: 'Absolute extrema and optimization',
    learn: p(`On a closed interval [${V('a')}, ${V('b')}], a continuous function always has an absolute maximum and an absolute minimum. <b>Closed interval method: find the critical points inside the interval, evaluate ${V('f')} at them and at both endpoints, then pick the largest and smallest values.</b>`) +
      p(`Optimization problems work the same way. Write the quantity to maximize or minimize as a function of one variable (use the given condition to eliminate the other), find where its derivative is 0, and check that it gives the best value.`) +
      example('Example', `Find the largest product of two positive numbers that add to 20. With ${X} + ${Y} = 20, the product is ${fn('P', X)} = ${X}(20 − ${X}) = 20${X} − ${X}². ${d1('P', X)} = 20 − 2${X} = 0 at ${X} = 10, so ${Y} = 10 and the largest product is <b>100</b>.`),
    make(rng) {
      const kind = rng.pick(['interval', 'interval', 'fence', 'product']);
      if (kind === 'fence') {
        const L = rng.pick([40, 80, 100, 120, 160, 200, 240]), name = rng.pick(NAMES);
        return { prompt: `${name} has ${L} feet of fencing to make a rectangular pen along a straight river. The side along the river needs no fence. What is the largest area the pen can have?`, type: 'number', answer: L * L / 8, unit: 'ft²', params: { kind, L },
          hints: [`Let ${X} be each side that runs away from the river. The side along the river is then ${L} − 2${X}, so the area is ${fn('A', X)} = ${X}(${L} − 2${X}) = ${L}${X} − 2${X}².`, `${d1('A', X)} = ${L} − 4${X} = 0 at ${X} = ${L / 4}. Then the long side is ${L / 2} feet.`, `The largest area is ${L / 4} × ${L / 2} = <b>${N(L * L / 8)} ft²</b>.`] };
      }
      if (kind === 'product') {
        const S = 2 * rng.int(5, 25);
        return { prompt: `Two positive numbers add up to ${S}. What is the largest possible value of their product?`, type: 'number', answer: S * S / 4, params: { kind, S },
          hints: [`If one number is ${X}, the other is ${S} − ${X}, so the product is ${fn('P', X)} = ${X}(${S} − ${X}) = ${S}${X} − ${X}².`, `${d1('P', X)} = ${S} − 2${X} = 0 at ${X} = ${S / 2}, and the other number is also ${S / 2}.`, `The largest product is ${S / 2} × ${S / 2} = <b>${N(S * S / 4)}</b>.`] };
      }
      const m = rng.pick([1, 2]), s = rng.sign(), d = rng.int(-9, 9), lo = rng.int(-4, -m), hi = rng.int(m, 4), want = rng.pick(['maximum', 'minimum']);
      const c = [s, 0, -3 * m * m * s, d], cands = [lo, -m, m, hi].filter((x, i, arr) => x >= lo && x <= hi && arr.indexOf(x) === i);
      const vals = cands.map(x => evalP(c, x)), ans = want === 'maximum' ? Math.max(...vals) : Math.min(...vals);
      return { prompt: `Find the absolute ${want} value of ${V('f')} on the interval [${N(lo)}, ${N(hi)}].${big(`${fn('f', X)} = ${P(c)}`)}`, type: 'number', answer: ans, params: { kind, c, lo, hi, want },
        hints: [`${d1('f', X)} = ${P(pder(c))} = ${N(3 * s)}(${X}² − ${m * m}), which is 0 at ${X} = ±${m}. Both are in the interval.`,
          `Check the critical points and the endpoints: ${cands.map((x, i) => `${fn('f', N(x))} = ${N(vals[i])}`).join(', ')}.`, `The ${want === 'maximum' ? 'largest' : 'smallest'} of these is <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      const best = (f, lo, hi, n, max) => { let b = max ? -Infinity : Infinity; for (let i = 0; i <= n; i++) { const v = f(lo + (hi - lo) * i / n); b = max ? Math.max(b, v) : Math.min(b, v); } return b; };
      if (pr.kind === 'fence') return near(best(x => x * (pr.L - 2 * x), 0, pr.L / 2, 100000, true), q.answer, 1e-6);
      if (pr.kind === 'product') return near(best(x => x * (pr.S - x), 0, pr.S, 100000, true), q.answer, 1e-6);
      return near(best(x => evalP(pr.c, x), pr.lo, pr.hi, 24000, pr.want === 'maximum'), q.answer, 1e-6);
    },
  });

  const CONCAVE = ['Concave up', 'Concave down', 'An inflection point'];
  A.skill({
    id: 'calc.concavity', title: 'Concavity and inflection points',
    learn: p(`<b>The graph of ${V('f')} is concave up where ${d2('f', X)} &gt; 0 (shaped like a cup) and concave down where ${d2('f', X)} &lt; 0 (shaped like a cap).</b> Concave up means the slope is increasing; concave down means it’s decreasing.`) +
      p(`An <b>inflection point</b> is where the concavity changes. Find where ${d2('f', X)} = 0, then check that ${d2('f', X)} really changes sign there.`) +
      example('Example', `${fn('f', X)} = ${X}³ − 6${X}² + 4. ${d1('f', X)} = 3${X}² − 12${X} and ${d2('f', X)} = 6${X} − 12, which is 0 at ${X} = 2. It is negative for ${X} &lt; 2 and positive for ${X} &gt; 2, so there is an <b>inflection point at ${X} = 2</b>; the graph is concave up for ${X} &gt; 2.`),
    make(rng) {
      const kind = rng.pick(['inflection', 'updown', 'updown', 'interval']), a = rng.pick([1, -1, 2, -2]), pp = kind === 'interval' ? rng.nz(-3, 3) : rng.int(-3, 3);
      const c = [a, -3 * a * pp, rng.int(-9, 9), rng.int(-9, 9)], dd = pder(pder(c));
      const steps = [`${d1('f', X)} = ${P(pder(c))}, so ${d2('f', X)} = ${P(dd)}.`, `${d2('f', X)} = 0 at ${X} = ${N(pp)}. It is ${a > 0 ? 'negative' : 'positive'} to the left of ${N(pp)} and ${a > 0 ? 'positive' : 'negative'} to the right.`];
      const fx = big(`${fn('f', X)} = ${P(c)}`);
      if (kind === 'inflection') return { prompt: `At what ${X}-value does the graph of ${V('f')} have an inflection point?${fx}`, type: 'number', answer: pp, params: { kind, c },
        hints: [...steps, `The concavity changes there, so the inflection point is at ${X} = <b>${N(pp)}</b>.`] };
      if (kind === 'updown') {
        const x0 = rng.int(-3, 4), v = evalP(dd, x0), ans = v > 0 ? CONCAVE[0] : v < 0 ? CONCAVE[1] : CONCAVE[2];
        return { prompt: `At ${X} = ${N(x0)}, is the graph of ${V('f')} concave up, concave down, or at an inflection point?${fx}`, type: 'choice', answer: ans, choices: CONCAVE.slice(), keepOrder: true, params: { kind, c, x0 },
          hints: [steps[0], `${d2('f', N(x0))} = ${subst(dd, x0)} = ${N(v)}${v === 0 ? `, and ${d2('f', X)} changes sign there` : v > 0 ? ', which is positive' : ', which is negative'}.`, `<b>${ans}</b> at ${X} = ${N(x0)}.`] };
      }
      const up = rng.bool(), opts = [`${X} &gt; ${N(pp)}`, `${X} &lt; ${N(pp)}`, `${X} &gt; ${N(-pp)}`, `${X} &lt; ${N(-pp)}`], ans = (up === (a > 0)) ? opts[0] : opts[1];
      return { prompt: `Where is the graph of ${V('f')} concave ${up ? 'up' : 'down'}?${fx}`, type: 'choice', answer: ans, choices: opts, params: { kind, c, up },
        hints: [...steps, `Concave ${up ? 'up' : 'down'} means ${d2('f', X)} ${up ? '&gt;' : '&lt;'} 0, which happens for <b>${ans}</b>.`] };
    },
    verify(q) {
      const { kind, c, x0, up } = q.params, f2 = x => deriv2(t => evalP(c, t), x);
      const [ip] = signChanges(f2, -10, 10, 0.01).map(Math.round);
      if (kind === 'inflection') return q.answer === ip;
      if (kind === 'updown') { const v = f2(x0); return q.answer === (Math.abs(v) < 1e-3 ? CONCAVE[2] : v > 0 ? CONCAVE[0] : CONCAVE[1]); }
      const rightUp = f2(ip + 1) > 0;
      return q.answer === (rightUp === up ? `${X} &gt; ${N(ip)}` : `${X} &lt; ${N(ip)}`);
    },
  });

  /* ---------- Unit 5: Integration ---------- */
  const cf = c => c === 1 ? '' : c === -1 ? '−' : N(c);
  const plusC = s => `${s} + ${C}`;
  /** ∫ from a to b of a polynomial, as "(f) dx" */
  const defInt = (a, b, body, v) => `${integ(a, b)} (${body}) d${V(v || 'x')}`;
  /** antiderivative coefficients of [3a, 2b, c]-style lists: each cᵢxᵏ becomes cᵢ/(k + 1) xᵏ⁺¹ */
  const pint = c => c.map((ci, i) => ci / (c.length - i)).concat(0);

  const RULES = { left: 'left endpoints', right: 'right endpoints', mid: 'midpoints', trap: 'trapezoids' };
  A.skill({
    id: 'calc.riemann-sums', title: 'Riemann sums',
    learn: p(`A Riemann sum estimates the area under a curve with rectangles. Split [${V('a')}, ${V('b')}] into ${V('n')} equal pieces of width Δ${X} = ${sfrac(`${V('b')} − ${V('a')}`, V('n'))}, and over each piece stand a rectangle whose height is the function’s value at one point of that piece.`) +
      p(`<b>A left sum uses each piece’s left endpoint, a right sum uses the right endpoint, and a midpoint sum uses the middle. Add the heights, then multiply by Δ${X}.</b> The trapezoidal rule averages the left and right sums: ${sfrac(`Δ${X}`, '2')}(${M.sub(Y, 0)} + 2${M.sub(Y, 1)} + … + 2${M.sub(Y, V('n') + ' − 1')} + ${M.sub(Y, V('n'))}).`) +
      example('Example', `Left sum for ${fn('f', X)} = ${X}² on [0, 3] with 3 pieces: Δ${X} = 1, and the left endpoints are 0, 1, 2. The heights are 0, 1, 4, so the sum is 1 × (0 + 1 + 4) = <b>5</b>.`),
    make(rng) {
      const kind = rng.pick(['formula', 'formula', 'table']);
      if (kind === 'table') {
        const n = rng.pick([3, 4]), w = rng.pick([2, 3, 5, 10]), ys = Array.from({ length: n + 1 }, () => rng.int(0, 20)), rule = rng.pick(['left', 'right', 'trap']);
        const ts = ys.map((_, i) => i * w), use = rule === 'left' ? ys.slice(0, -1) : rule === 'right' ? ys.slice(1) : null;
        const ans = use ? w * use.reduce((s, y) => s + y, 0) : w / 2 * ys.reduce((s, y, i) => s + (i === 0 || i === n ? y : 2 * y), 0);
        return { prompt: `Water flows into a tank at a rate of ${fn('r', T)} liters per minute. Use a ${rule === 'trap' ? 'trapezoidal sum' : `${rule} Riemann sum`} with the ${n} intervals in the table to estimate the total amount of water that flows in from ${T} = 0 to ${T} = ${n * w}.${M.table([`${T} (minutes)`, fn('r', T)], ts.map((t, i) => [N(t), N(ys[i])]), { compact: true })}`, type: 'number', answer: ans, unit: 'liters', params: { kind, rule, w, ys },
          hints: [`Each interval is ${w} minutes wide.`, rule === 'trap' ? `Trapezoidal rule: ${sfrac(w, 2)}(${ys.map((y, i) => i === 0 || i === n ? N(y) : `2(${N(y)})`).join(' + ')}).` : `Use the ${RULES[rule]}: ${w}(${use.map(N).join(' + ')}).`, `The estimate is <b>${N(ans)} liters</b>.`] };
      }
      const quad = rng.bool(), f = quad ? [1, 0, rng.int(0, 5)] : [rng.int(1, 4), rng.int(0, 6)], n = rng.pick([3, 4]), w = rng.pick([1, 2]), a = rng.int(0, 2), b = a + n * w;
      const rule = w === 2 ? rng.pick(['left', 'right', 'mid']) : rng.pick(['left', 'right']);
      const xs = Array.from({ length: n }, (_, i) => a + i * w + (rule === 'left' ? 0 : rule === 'right' ? w : w / 2)), hs = xs.map(x => evalP(f, x));
      const ans = w * hs.reduce((s, h) => s + h, 0);
      return { prompt: `Estimate the area under ${fn('f', X)} = ${P(f)} on [${a}, ${b}] using a ${rule === 'mid' ? 'midpoint' : rule} Riemann sum with ${n} equal intervals.`, type: 'number', answer: ans, params: { kind, f, a, b, n, rule },
        hints: [`Δ${X} = ${sfrac(`${b} − ${a}`, n)} = ${w}, and the ${RULES[rule]} are ${X} = ${xs.join(', ')}.`, `The heights are ${hs.map((h, i) => `${fn('f', xs[i])} = ${h}`).join(', ')}.`, `${w} × (${hs.join(' + ')}) = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'table') {
        const L = pr.w * pr.ys.slice(0, -1).reduce((s, y) => s + y, 0), R = pr.w * pr.ys.slice(1).reduce((s, y) => s + y, 0);
        return near({ left: L, right: R, trap: (L + R) / 2 }[pr.rule], q.answer);
      }
      const dx = (pr.b - pr.a) / pr.n, off = { left: 0, right: 1, mid: 0.5 }[pr.rule];
      let s = 0; for (let i = 0; i < pr.n; i++) s += evalP(pr.f, pr.a + (i + off) * dx) * dx;
      return near(s, q.answer);
    },
  });

  function antiOpts(list) {
    const lists = [list.map(([a, k]) => [a / (k + 1), k + 1]), list.map(([a, k]) => [a * k, k - 1]).filter(t => t[0] !== 0), list.map(([a, k]) => [a, k + 1]), list.map(([a, k]) => [a / (k + 1), k])];
    return lists.map(l => ({ html: plusC(terms(l)), f: x => tval(l, x) }));
  }
  A.skill({
    id: 'calc.antiderivatives', title: 'Antiderivatives with the power rule',
    learn: p(`An <b>antiderivative</b> of ${V('f')} is a function whose derivative is ${V('f')}. The indefinite integral ∫ ${fn('f', X)}${DX} means all of them, so it ends in + ${C}: adding any constant doesn’t change the derivative.`) +
      p(`<b>Reverse the power rule: ∫ ${X}<sup>${V('n')}</sup>${DX} = ${sfrac(`${X}<sup>${V('n')} + 1</sup>`, `${V('n')} + 1`)} + ${C} (for ${V('n')} ≠ −1). Raise the exponent by 1, then divide by the new exponent.</b> Work term by term; a constant ${V('k')} integrates to ${V('k')}${X}. Check your answer by differentiating it.`) +
      p(`If you also know one value, such as ${fn('F', 0)} = 5, substitute it to find ${C}.`) +
      example('Example', `${big(`∫ (6${X}<sup>2</sup> + 4${X} − 3)${DX}`)}Term by term: ${sfrac(`6${X}<sup>3</sup>`, '3')} + ${sfrac(`4${X}<sup>2</sup>`, '2')} − 3${X} = <b>2${X}<sup>3</sup> + 2${X}<sup>2</sup> − 3${X} + ${C}</b>.`),
    make(rng) {
      const kind = rng.pick(['expr', 'expr', 'ivp']);
      const ks = rng.sample([3, 2, 1, 0], rng.int(2, 3)).sort((u, w) => w - u), list = ks.map(k => [(k + 1) * rng.nz(-4, 4), k]), G = list.map(([a, k]) => [a / (k + 1), k + 1]);
      if (kind === 'ivp') {
        const x0 = rng.pick([0, 1]), x1 = rng.pick([2, 3, -1]), y0 = rng.int(-9, 9), Cc = y0 - tval(G, x0), ans = tval(G, x1) + Cc;
        return { prompt: `${d1('F', X)} = ${terms(list)} and ${fn('F', x0)} = ${N(y0)}. Find ${fn('F', N(x1))}.`, type: 'number', answer: ans, params: { kind, list, x0, x1, y0 },
          hints: [`Antidifferentiate term by term: ${fn('F', X)} = ${plusC(terms(G))}.`, `Use ${fn('F', x0)} = ${N(y0)}: ${N(tval(G, x0))} + ${C} = ${N(y0)}, so ${C} = ${N(Cc)}.`, `${fn('F', N(x1))} = ${N(tval(G, x1))} ${M.signed(Cc)} = <b>${N(ans)}</b>.`] };
      }
      const pick = choose(antiOpts(list));
      return { prompt: `Find the indefinite integral.${big(`∫ (${terms(list)})${DX}`)}`, ...pick, params: { kind, list },
        hints: [`Integrate term by term: raise each exponent by 1, then divide by the new exponent. A constant ${V('k')} becomes ${V('k')}${X}.`, `${list.map(([a, k]) => `${terms([[a, k]])} → ${terms([[a / (k + 1), k + 1]])}`).join(', ')}.`, `<b>${pick.answer}</b>.`] };
    },
    verify(q) {
      const { kind, list, x0, x1, y0 } = q.params, f = x => tval(list, x);
      if (kind === 'ivp') return near(y0 + simpson(f, x0, x1), q.answer, 1e-8);
      return checkOpts(q, antiOpts(list).map(o => ({ html: o.html, f: x => deriv(o.f, x) })), f);
    },
  });

  A.skill({
    id: 'calc.definite-integrals', title: 'Definite integrals and the Fundamental Theorem',
    learn: p(`<b>Fundamental Theorem of Calculus: if ${V('F')} is any antiderivative of ${V('f')}, then ${integ(V('a'), V('b'))} ${fn('f', X)}${DX} = ${fn('F', V('b'))} − ${fn('F', V('a'))}.</b> The + ${C} cancels, so you can leave it out.`) +
      p(`Definite integrals follow simple rules: you can split a sum and pull out constants, ${integ(V('a'), V('b'))} = ${integ(V('a'), V('c'))} + ${integ(V('c'), V('b'))}, and swapping the limits changes the sign. The other half of the theorem says ${DDX} ${integ(V('a'), X)} ${fn('f', T)} d${T} = ${fn('f', X)}: differentiating an accumulation gives back the function.`) +
      example('Example', `${big(`${integ('1', '3')} (3${X}<sup>2</sup> − 2)${DX}`)}An antiderivative is ${fn('F', X)} = ${X}<sup>3</sup> − 2${X}. ${fn('F', 3)} = 21 and ${fn('F', 1)} = −1, so the integral is 21 − (−1) = <b>22</b>.`),
    make(rng) {
      const kind = rng.pick(['poly', 'poly', 'props', 'ftc']);
      if (kind === 'poly') {
        const f = [3 * rng.nz(-2, 2), 2 * rng.int(-3, 3), rng.int(-5, 5)], lo = rng.int(-2, 1), hi = lo + rng.int(1, 3), Fc = pint(f);
        const Fh = evalP(Fc, hi), Fl = evalP(Fc, lo), ans = Fh - Fl;
        return { prompt: `Evaluate the integral.${big(defInt(lo, hi, P(f)))}`, type: 'number', answer: ans, params: { kind, f, lo, hi },
          hints: [`Find an antiderivative: ${fn('F', X)} = ${P(Fc)}.`, `${fn('F', N(hi))} = ${N(Fh)} and ${fn('F', N(lo))} = ${N(Fl)}.`, `${fn('F', N(hi))} − ${fn('F', N(lo))} = ${N(Fh)} − ${wrap(Fl)} = <b>${N(ans)}</b>.`] };
      }
      if (kind === 'ftc') {
        const f = [rng.nz(-3, 3), rng.int(-5, 5), rng.int(-6, 6)], lo = rng.int(-2, 2), k = rng.int(-2, 3), ans = evalP(f, k);
        return { prompt: `${fn('g', X)} = ${integ(N(lo), X)} (${P(f, 't')}) d${T}. Find ${d1('g', N(k))}.`, type: 'number', answer: ans, params: { kind, f, lo, k },
          hints: [`By the Fundamental Theorem, the derivative of ${integ(N(lo), X)} ${fn('f', T)} d${T} is ${fn('f', X)}: the lower limit doesn’t matter.`, `So ${d1('g', X)} = ${P(f)}.`, `${d1('g', N(k))} = ${subst(f, k)} = <b>${N(ans)}</b>.`] };
      }
      const form = rng.pick(['combo', 'swap', 'split']), a = rng.int(-2, 2), b = a + rng.int(2, 5), Pv = rng.nz(-9, 9), Qv = rng.nz(-9, 9);
      if (form === 'combo') {
        const k = rng.nz(-5, 5), m = rng.nz(-4, 4), ans = k * Pv + m * Qv;
        return { prompt: `${integ(a, b)} ${fn('f', X)}${DX} = ${N(Pv)} and ${integ(a, b)} ${fn('g', X)}${DX} = ${N(Qv)}. Find the integral.${big(defInt(a, b, `${cf(k)}${fn('f', X)} ${m < 0 ? '−' : '+'} ${cf(Math.abs(m))}${fn('g', X)}`))}`, type: 'number', answer: ans, params: { kind, form, a, b, Pv, Qv, k, m },
          hints: ['Split the integral and pull out the constants.', `${N(k)}(${N(Pv)}) + ${wrap(m)}(${N(Qv)}).`, `${N(k * Pv)} + ${wrap(m * Qv)} = <b>${N(ans)}</b>.`] };
      }
      if (form === 'swap') {
        const k = rng.nz(-4, 4), ans = -k * Pv;
        return { prompt: `${integ(a, b)} ${fn('f', X)}${DX} = ${N(Pv)}. Find the integral.${big(`${integ(b, a)} ${cf(k)}${fn('f', X)}${DX}`)}`, type: 'number', answer: ans, params: { kind, form, a, b, Pv, k },
          hints: ['Swapping the limits of integration changes the sign.', `${integ(b, a)} ${fn('f', X)}${DX} = −${wrap(Pv)} = ${N(-Pv)}, and the constant ${N(k)} comes out in front.`, `${N(k)}(${N(-Pv)}) = <b>${N(ans)}</b>.`] };
      }
      const c = b + rng.int(1, 3);
      return { prompt: `${integ(a, c)} ${fn('f', X)}${DX} = ${N(Pv)} and ${integ(a, b)} ${fn('f', X)}${DX} = ${N(Qv)}. Find ${integ(b, c)} ${fn('f', X)}${DX}.`, type: 'number', answer: Pv - Qv, params: { kind, form, a, b, c, Pv, Qv },
        hints: [`The interval [${a}, ${c}] splits into [${a}, ${b}] and [${b}, ${c}], so the integrals add: ${N(Pv)} = ${N(Qv)} + ${integ(b, c)} ${fn('f', X)}${DX}.`, `Subtract: ${N(Pv)} − ${wrap(Qv)}.`, `${integ(b, c)} ${fn('f', X)}${DX} = <b>${N(Pv - Qv)}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'poly') return near(simpson(x => evalP(pr.f, x), pr.lo, pr.hi), q.answer, 1e-8);
      if (pr.kind === 'ftc') return near(deriv(x => simpson(t => evalP(pr.f, t), pr.lo, x, 200), pr.k), q.answer, 1e-5);
      // stand-in functions with the given integrals: constants on each piece
      const w = pr.b - pr.a, f = () => pr.Pv / w, g = () => pr.Qv / w;
      if (pr.form === 'combo') return near(simpson(x => pr.k * f(x) + pr.m * g(x), pr.a, pr.b), q.answer, 1e-8);
      if (pr.form === 'swap') return near(-simpson(x => pr.k * f(x), pr.a, pr.b), q.answer, 1e-8);
      return near(simpson(() => pr.Qv / w, pr.a, pr.b) + simpson(() => q.answer / (pr.c - pr.b), pr.b, pr.c), pr.Pv, 1e-8);
    },
  });

  /* integrals of the basic functions: the right antiderivative and a common wrong one */
  Object.assign(BASIC, {
    lnabs: { html: c => `${c}ln|${X}|`, sp: true, f: x => Math.log(Math.abs(x)) },
    expfrac: { html: c => `${c}${sfrac(ex(`${X} + 1`), `${X} + 1`)}`, sp: true, f: x => Math.exp(x + 1) / (x + 1) },
    invsq: { frac: `${X}<sup>2</sup>`, f: x => 1 / (x * x) },
  });
  const INTEG = { cos: { i: [1, 'sin'], bad: [-1, 'sin'] }, sin: { i: [-1, 'cos'], bad: [1, 'cos'] }, exp: { i: [1, 'exp'], bad: [1, 'expfrac'] }, inv: { i: [1, 'lnabs'], bad: [-1, 'invsq'] } };
  function basicIntOpts(list) {
    const step = (t, which) => { const [s, u] = INTEG[t[1]][which]; return [s * t[0], u]; };
    return [['i', 'i'], ['bad', 'i'], ['i', 'bad'], ['bad', 'bad']].map(([w1, w2]) => {
      const out = [step(list[0], w1), step(list[1], w2)];
      return { html: plusC(bsum(out)), f: x => bval(out, x) };
    });
  }
  const BOUNDS = {   // ∫ from lo to hi of c·u(x): [lo HTML, hi HTML, lo, hi, value of ∫ u]
    cos: () => ['0', 'π/2', 0, Math.PI / 2, 1], sin: () => ['0', 'π', 0, Math.PI, 2],
    inv: k => ['1', k === 1 ? 'e' : ex(k), 1, Math.exp(k), k], exp: k => ['0', `ln ${k + 1}`, 0, Math.log(k + 1), k],
  };
  A.skill({
    id: 'calc.basic-function-integrals', title: 'Integrals of sin x, cos x, eˣ and 1/x',
    learn: p(`Each basic derivative gives a basic integral when you read it backward. <b>∫ cos ${X}${DX} = sin ${X} + ${C}, ∫ sin ${X}${DX} = −cos ${X} + ${C}, ∫ ${ex(X)}${DX} = ${ex(X)} + ${C}, and ∫ ${sfrac('1', X)}${DX} = ln|${X}| + ${C}.</b>`) +
      p(`Watch the sign on ∫ sin ${X}: it’s −cos ${X}, because the derivative of −cos ${X} is sin ${X}. The power rule can’t handle ${sfrac('1', X)} = ${X}<sup>−1</sup> (it would divide by 0), which is why the logarithm appears.`) +
      example('Example', `${big(`${integ('0', 'π')} sin ${X}${DX}`)}An antiderivative is −cos ${X}. So the integral is −cos π − (−cos 0) = 1 + 1 = <b>2</b>.`),
    make(rng) {
      const kind = rng.pick(['expr', 'expr', 'value']);
      if (kind === 'value') {
        const u = rng.pick(['cos', 'sin', 'inv', 'exp']), c = rng.nz(-6, 6), k = rng.int(1, 4), [loH, hiH, lo, hi, base] = BOUNDS[u](k), ans = c * base;
        const anti = bsum([[INTEG[u].i[0] * c, INTEG[u].i[1]]]), body = bsum([[c, u]]);
        const work = { cos: `${N(c)}(sin ${sfrac('π', 2)} − sin 0) = ${N(c)}(1 − 0)`, sin: `${N(-c)}(cos π − cos 0) = ${N(-c)}(−1 − 1)`, inv: `${N(c)}(ln ${hiH} − ln 1) = ${N(c)}(${k} − 0)`, exp: `${N(c)}(${ex(`ln ${k + 1}`)} − ${ex(0)}) = ${N(c)}(${k + 1} − 1)` }[u];
        return { prompt: `Evaluate the integral.${big(`${integ(loH, hiH)} ${body}${DX}`)}`, type: 'number', answer: ans, params: { kind, u, c, lo, hi },
          hints: [`An antiderivative of ${body} is ${anti}.`, `Evaluate at the limits and subtract: ${work}.`, `The integral is <b>${N(ans)}</b>.`] };
      }
      const [u1, u2] = rng.sample(['cos', 'sin', 'exp', 'inv'], 2), list = [[rng.nz(-7, 7), u1], [rng.nz(-7, 7), u2]];
      const pick = choose(basicIntOpts(list));
      return { prompt: `Find the indefinite integral.${big(`∫ (${bsum(list)})${DX}`)}`, ...pick, params: { kind, list },
        hints: [`Use the basic integrals: ∫ cos ${X}${DX} = sin ${X}, ∫ sin ${X}${DX} = −cos ${X}, ∫ ${ex(X)}${DX} = ${ex(X)}, ∫ ${sfrac('1', X)}${DX} = ln|${X}|.`,
          `Work term by term and keep the constants in front. Check by differentiating your answer.`, `<b>${pick.answer}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'value') return near(simpson(x => pr.c * BASIC[pr.u].f(x), pr.lo, pr.hi, 20000), q.answer, 1e-6);
      return checkOpts(q, basicIntOpts(pr.list).map(o => ({ html: o.html, f: x => deriv(o.f, x) })), x => bval(pr.list, x));
    },
  });

  function usubOpts({ form, j, n, c, k }) {
    const inner = `${X}<sup>2</sup> ${M.signed(c)}`, pw = (co, e) => ({ html: plusC(`${cf(co)}(${inner})${e === 1 ? '' : `<sup>${e}</sup>`}`), f: x => co * Math.pow(x * x + c, e) });
    if (form === 'poly') return [pw(j, n + 1), pw(2 * j, n + 1), pw(j * (n + 1), n + 1), pw(j, n), pw(j, n + 2)];
    if (form === 'exp') return [[j, 0], [2 * j, 0], [j, 2], [2 * j, 1]].map(([co, xp]) => ({ html: plusC(`${cf(co)}${xp === 0 ? '' : xp === 1 ? X : `${X}<sup>2</sup>`}${ex(`${X}<sup>2</sup>`)}`), f: x => co * Math.pow(x, xp) * Math.exp(x * x) }));
    if (form === 'log') return [[j, 1], [2 * j, 1], [4 * j, 1], [j, 0]].map(([co, inside]) => ({ html: plusC(inside ? `${cf(co)}${co === 1 || co === -1 ? '' : ' '}ln(${inner})` : `${cf(co)}${co === 1 || co === -1 ? '' : ' '}ln|${X}|`), f: x => co * Math.log(inside ? x * x + c : Math.abs(x)) }));
    const m = j * k, g = form === 'cos' ? 'sin' : 'cos', s = form === 'cos' ? 1 : -1, kx = `${k}${X}`;
    return [[s * j, kx], [s * m, kx], [-s * j, kx], [s * m * k, kx]].map(([co, arg]) => ({ html: plusC(`${cf(co)}${co === 1 || co === -1 ? '' : ' '}${g}(${arg})`), f: x => co * Math[g](k * x) }));
  }
  const usubF = ({ form, j, n, c, k }) => ({ poly: x => 2 * (n + 1) * j * x * Math.pow(x * x + c, n), exp: x => 2 * j * x * Math.exp(x * x), log: x => 2 * j * x / (x * x + c), cos: x => j * k * Math.cos(k * x), sin: x => j * k * Math.sin(k * x) })[form];
  A.skill({
    id: 'calc.u-substitution', title: 'Integration by u-substitution',
    learn: p(`u-substitution undoes the chain rule. Look for an inside function whose derivative also appears in the integrand (up to a constant factor).`) +
      p(`<b>Let ${V('u')} be the inside function, find d${V('u')} = ${d1('u', X)}${DX}, rewrite the whole integral in terms of ${V('u')}, integrate, then put ${X} back.</b> If d${V('u')} is off by a constant, such as 2${X}${DX} when you only have ${X}${DX}, divide by that constant. For a definite integral, change the limits to ${V('u')}-values instead of putting ${X} back.`) +
      example('Example', `${big(`∫ 6${X}(${X}<sup>2</sup> + 1)<sup>2</sup>${DX}`)}Let ${V('u')} = ${X}<sup>2</sup> + 1, so d${V('u')} = 2${X}${DX} and 6${X}${DX} = 3 d${V('u')}. Then ∫ 3${V('u')}<sup>2</sup> d${V('u')} = ${V('u')}<sup>3</sup> + ${C} = <b>(${X}<sup>2</sup> + 1)<sup>3</sup> + ${C}</b>.`),
    make(rng) {
      const form = rng.pick(['poly', 'poly', 'exp', 'log', 'cos', 'sin', 'definite']);
      if (form === 'definite') {
        const b = rng.int(1, 2), c = rng.int(1, 3), n = rng.int(1, 2), top = Math.pow(b * b + c, n + 1) - Math.pow(c, n + 1);
        return { prompt: `Evaluate the integral.${big(`${integ(0, b)} 2${X}(${X}<sup>2</sup> + ${c})${n === 1 ? '' : `<sup>${n}</sup>`}${DX}`)}`, type: 'number', ...fa(top, n + 1), params: { form, b, c, n },
          hints: [`Let ${V('u')} = ${X}<sup>2</sup> + ${c}, so d${V('u')} = 2${X}${DX}. Change the limits: ${X} = 0 gives ${V('u')} = ${c}, and ${X} = ${b} gives ${V('u')} = ${b * b + c}.`,
            `The integral becomes ${integ(c, b * b + c)} ${V('u')}${n === 1 ? '' : `<sup>${n}</sup>`} d${V('u')} = ${sfrac(`${V('u')}<sup>${n + 1}</sup>`, n + 1)} from ${c} to ${b * b + c} = ${sfrac(`${N(Math.pow(b * b + c, n + 1))} − ${N(Math.pow(c, n + 1))}`, n + 1)}.`,
            `The integral is <b>${F(top, n + 1)}</b>.`] };
      }
      const pr = { form, j: rng.pick([1, 2, 3, -1, -2]), n: rng.int(1, 3), c: rng.nz(-5, 6), k: rng.int(2, 5) };
      if (form === 'log') pr.c = rng.int(1, 9);
      const { j, n, c, k } = pr, inner = `${X}<sup>2</sup> ${M.signed(c)}`;
      const body = { poly: `${N(2 * (n + 1) * j)}${X}(${inner})${n === 1 ? '' : `<sup>${n}</sup>`}`, exp: `${N(2 * j)}${X}${ex(`${X}<sup>2</sup>`)}`, log: sfrac(`${N(2 * j)}${X}`, inner), cos: `${N(j * k)} cos(${k}${X})`, sin: `${N(j * k)} sin(${k}${X})` }[form];
      const sub = { poly: [`Let ${V('u')} = ${inner}, so d${V('u')} = 2${X}${DX} and the integral is ∫ ${N((n + 1) * j)}${V('u')}${n === 1 ? '' : `<sup>${n}</sup>`} d${V('u')}.`, `That is ${cf(j)}${V('u')}<sup>${n + 1}</sup> + ${C}.`],
        exp: [`Let ${V('u')} = ${X}<sup>2</sup>, so d${V('u')} = 2${X}${DX} and the integral is ∫ ${cf(j)}${ex(V('u'))} d${V('u')}.`, `That is ${cf(j)}${ex(V('u'))} + ${C}.`],
        log: [`Let ${V('u')} = ${inner}, so d${V('u')} = 2${X}${DX} and the integral is ∫ ${sfrac(N(j), V('u'))} d${V('u')}.`, `That is ${cf(j)}${Math.abs(j) === 1 ? '' : ' '}ln ${V('u')} + ${C} (no absolute value needed: ${V('u')} is always positive here).`],
        cos: [`Let ${V('u')} = ${k}${X}, so d${V('u')} = ${k}${DX} and the integral is ∫ ${cf(j)}${Math.abs(j) === 1 ? '' : ' '}cos ${V('u')} d${V('u')}.`, `That is ${cf(j)}${Math.abs(j) === 1 ? '' : ' '}sin ${V('u')} + ${C}.`],
        sin: [`Let ${V('u')} = ${k}${X}, so d${V('u')} = ${k}${DX} and the integral is ∫ ${cf(j)}${Math.abs(j) === 1 ? '' : ' '}sin ${V('u')} d${V('u')}.`, `That is ${cf(-j)}${Math.abs(j) === 1 ? '' : ' '}cos ${V('u')} + ${C}.`] }[form];
      const pick = choose(usubOpts(pr));
      return { prompt: `Find the indefinite integral.${big(`∫ ${body}${DX}`)}`, ...pick, params: pr, hints: [...sub, `Put ${X} back: <b>${pick.answer}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.form === 'definite') return near(simpson(x => 2 * x * Math.pow(x * x + pr.c, pr.n), 0, pr.b), q.answer, 1e-8);
      return checkOpts(q, usubOpts(pr).map(o => ({ html: o.html, f: x => deriv(o.f, x) })), usubF(pr));
    },
  });

  /* ---------- Unit 6: Applications of integration ---------- */
  /** for verify: a midpoint sum with many pieces */
  function midSum(f, a, b, n) {
    n = n || 200000;
    const h = (b - a) / n;
    let s = 0;
    for (let i = 0; i < n; i++) s += f(a + (i + 0.5) * h);
    return s * h;
  }

  A.skill({
    id: 'calc.area-under-curve', title: 'Area under a curve',
    learn: p(`When ${fn('f', X)} ≥ 0 on [${V('a')}, ${V('b')}], the area of the region between the graph and the ${X}-axis is exactly the definite integral ${integ(V('a'), V('b'))} ${fn('f', X)}${DX}.`) +
      p(`<b>Area is never negative. Where the graph is below the ${X}-axis, the integral comes out negative, so the area of that part is the opposite of the integral.</b> If a graph crosses the axis, split the interval at the crossing and add the areas of the pieces.`) +
      example('Example', `Find the area under ${Y} = ${X}² + 1 from ${X} = 0 to ${X} = 3. The curve is above the axis, so the area is ${integ('0', '3')} (${X}² + 1)${DX} = [${sfrac(`${X}³`, '3')} + ${X}] from 0 to 3 = 9 + 3 = <b>12</b>.`),
    make(rng) {
      const kind = rng.pick(['poly', 'poly', 'below', 'trig']);
      if (kind === 'below') {
        const k = rng.int(1, 3), f = [1, 0, -k * k];
        return { prompt: `Find the area of the region between the graph of ${Y} = ${P(f)} and the ${X}-axis.`, type: 'number', ...fa(4 * k * k * k, 3), params: { kind, f, lo: -k, hi: k },
          hints: [`The graph crosses the ${X}-axis at ${X} = ±${k}, and between those points it is below the axis.`, `${integ(N(-k), k)} (${P(f)})${DX} = [${sfrac(`${X}³`, '3')} − ${k * k}${X}] from ${N(-k)} to ${k} = ${F(-4 * k * k * k, 3)}.`, `The area is the opposite of that: <b>${F(4 * k * k * k, 3)}</b>.`] };
      }
      if (kind === 'trig') {
        const a = rng.int(1, 6), sin = rng.bool(), f = sin ? `${cf(a)}${a === 1 ? '' : ' '}sin ${X}` : `${cf(a)}${a === 1 ? '' : ' '}cos ${X}`, [lo, hi] = sin ? ['0', 'π'] : ['−π/2', 'π/2'];
        return { prompt: `Find the area under one arch of ${Y} = ${f}, from ${X} = ${lo} to ${X} = ${hi}.`, type: 'number', answer: 2 * a, params: { kind, a, sin },
          hints: [`The curve is above the axis on this interval, so the area is ${integ(lo, hi)} ${f}${DX}.`, sin ? `An antiderivative is −${a === 1 ? '' : a + ' '}cos ${X}, so the integral is ${a === 1 ? '' : a}(−cos π + cos 0) = ${a === 1 ? '' : a}(1 + 1).` : `An antiderivative is ${a === 1 ? '' : a + ' '}sin ${X}, so the integral is ${a === 1 ? '' : a}(sin ${sfrac('π', 2)} − sin(−${sfrac('π', 2)})) = ${a === 1 ? '' : a}(1 + 1).`, `The area is <b>${2 * a}</b>.`] };
      }
      let a, b; do { a = rng.int(0, 2); b = rng.int(0, 3); } while (a + b === 0);
      const f = [3 * a, 2 * b, rng.int(1, 6)], lo = rng.int(0, 2), hi = lo + rng.int(1, 3), Fc = pint(f), Fh = evalP(Fc, hi), Fl = evalP(Fc, lo);
      return { prompt: `Find the area of the region between the graph of ${Y} = ${P(f)} and the ${X}-axis, from ${X} = ${lo} to ${X} = ${hi}.`, type: 'number', answer: Fh - Fl, params: { kind, f, lo, hi },
        hints: [`The curve is above the ${X}-axis on [${lo}, ${hi}], so the area is ${integ(lo, hi)} (${P(f)})${DX}.`, `An antiderivative is ${P(Fc)}. At ${hi} it is ${N(Fh)}, and at ${lo} it is ${N(Fl)}.`, `The area is ${N(Fh)} − ${wrap(Fl)} = <b>${N(Fh - Fl)}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'trig') return pr.sin ? near(simpson(x => Math.abs(pr.a * Math.sin(x)), 0, Math.PI), q.answer, 1e-8) : near(simpson(x => Math.abs(pr.a * Math.cos(x)), -Math.PI / 2, Math.PI / 2), q.answer, 1e-8);
      return near(simpson(x => Math.abs(evalP(pr.f, x)), pr.lo, pr.hi), q.answer, 1e-8);
    },
  });

  A.skill({
    id: 'calc.area-between-curves', title: 'Area between curves',
    learn: p(`<b>The area between two curves is ${integ(V('a'), V('b'))} (top − bottom)${DX}</b>, where on [${V('a')}, ${V('b')}] one graph stays above the other. Subtracting the lower curve takes care of everything, even when the region dips below the ${X}-axis.`) +
      p(`If the region is “enclosed by” the curves, the limits are where they meet: set the two equations equal and solve. Then test a point in between to see which curve is on top.`) +
      example('Example', `Find the area enclosed by ${Y} = ${X}² and ${Y} = 2${X}. They meet where ${X}² = 2${X}, at ${X} = 0 and ${X} = 2. At ${X} = 1 the line is higher (2 &gt; 1), so the area is ${integ('0', '2')} (2${X} − ${X}²)${DX} = [${X}² − ${sfrac(`${X}³`, '3')}] from 0 to 2 = 4 − ${F(8, 3)} = <b>${F(4, 3)}</b>.`),
    make(rng) {
      const kind = rng.pick(['line', 'line', 'parabolas', 'interval']);
      if (kind === 'interval') {
        const c = rng.int(1, 4), b = rng.int(1, 3), top = [1, 0, c], bot = [1, 0], n = 2 * b * b * b - 3 * b * b + 6 * c * b;
        return { prompt: `Find the area between ${Y} = ${P(top)} and ${Y} = ${X}, from ${X} = 0 to ${X} = ${b}.`, type: 'number', ...fa(n, 6), params: { kind, top, bot, lo: 0, hi: b },
          hints: [`${P(top)} is always above ${X} (at ${X} = 0 it is ${c}, and ${P([1, -1, c])} &gt; 0 everywhere), so integrate top − bottom: ${integ(0, b)} (${P([1, -1, c])})${DX}.`, `An antiderivative is ${sfrac(`${X}³`, '3')} − ${sfrac(`${X}²`, '2')} + ${c}${X}. At ${b}: ${sfrac(b * b * b, 3)} − ${sfrac(b * b, 2)} + ${c * b}; at 0 it is 0.`, `The area is <b>${F(n, 6)}</b>.`] };
      }
      if (kind === 'parabolas') {
        const k = rng.int(1, 4), c = rng.int(-3, 3), bot = [1, 0, c], top = [-1, 2 * k, c];
        return { prompt: `Find the area of the region enclosed by the two parabolas.${big(`${Y} = ${P(bot)} and ${Y} = ${P(top)}`)}`, type: 'number', ...fa(k * k * k, 3), params: { kind, top, bot, lo: 0, hi: k },
          hints: [`Set them equal: ${P(bot)} = ${P(top)} gives 2${X}² − ${2 * k}${X} = 0, so ${X} = 0 and ${X} = ${k}.`, `Between them ${Y} = ${P(top)} is on top. Area = ${integ(0, k)} (${P([-2, 2 * k, 0])})${DX} = [${k}${X}² − ${sfrac(`2${X}³`, '3')}] from 0 to ${k}.`, `${k * k * k} − ${F(2 * k * k * k, 3)} = <b>${F(k * k * k, 3)}</b>.`] };
      }
      let pp, q; do { pp = rng.int(-3, 3); q = rng.int(-2, 4); } while (q <= pp || q - pp > 5);
      const m = rng.int(-3, 3), k = rng.int(-5, 5), bot = [1, m - pp - q, pp * q + k], top = [m, k], d = q - pp, diff = [-1, pp + q, -pp * q];
      return { prompt: `Find the area of the region enclosed by the parabola and the line.${big(`${Y} = ${P(bot)} and ${Y} = ${P(top)}`)}`, type: 'number', ...fa(d * d * d, 6), params: { kind, top, bot, lo: pp, hi: q },
        hints: [`Set them equal and simplify: ${P([1, -(pp + q), pp * q])} = 0, so ${lin(pp)}${lin(q)} = 0 and they meet at ${X} = ${N(pp)} and ${X} = ${N(q)}.`,
          `Between those points the line is on top, so the area is ${integ(N(pp), N(q))} (${P(diff)})${DX}.`,
          `An antiderivative is −${sfrac(`${X}<sup>3</sup>`, '3')}${pp + q === 0 ? '' : ` ${pp + q < 0 ? '−' : '+'} ${sfrac(`${Math.abs(pp + q) === 1 ? '' : Math.abs(pp + q)}${X}<sup>2</sup>`, '2')}`}${pp * q === 0 ? '' : ` ${pp * q > 0 ? '−' : '+'} ${terms([[Math.abs(pp * q), 1]])}`}. From ${N(pp)} to ${N(q)} it increases by <b>${F(d * d * d, 6)}</b>.`] };
    },
    verify(q) {
      const { kind, top, bot, lo, hi } = q.params, g = x => evalP(top, x) - evalP(bot, x);
      if (kind !== 'interval' && (Math.abs(g(lo)) > 1e-9 || Math.abs(g(hi)) > 1e-9)) return 'the curves do not meet at the limits';
      return near(simpson(x => Math.abs(g(x)), lo, hi), q.answer, 1e-8);
    },
  });

  A.skill({
    id: 'calc.average-value', title: 'Average value of a function',
    learn: p(`The average value of ${V('f')} on [${V('a')}, ${V('b')}] is the height of the rectangle, over the same interval, that has the same area as the region under the curve.`) +
      p(`<b>Average value = ${sfrac('1', `${V('b')} − ${V('a')}`)} ${integ(V('a'), V('b'))} ${fn('f', X)}${DX}.</b> Find the integral, then divide by the length of the interval.`) +
      example('Example', `The average value of ${fn('f', X)} = 3${X}² on [0, 2] is ${sfrac('1', '2')} ${integ('0', '2')} 3${X}²${DX} = ${sfrac('1', '2')} [${X}³] from 0 to 2 = ${sfrac('8', '2')} = <b>4</b>.`),
    make(rng) {
      const kind = rng.pick(['poly', 'poly', 'temp']);
      if (kind === 'temp') {
        const b = rng.int(4, 9), c = rng.int(50, 70), h = rng.int(2, 4), f = [-3, 2 * b, c], Fc = pint(f), tot = evalP(Fc, h);
        return { prompt: `The temperature ${T} hours after noon is ${fn('T', T)} = ${P(f, 't')} degrees Fahrenheit. What is the average temperature from ${T} = 0 to ${T} = ${h}?`, type: 'number', ...fa(tot, h), unit: '°F', params: { kind, f, lo: 0, hi: h },
          hints: [`Average value = ${sfrac('1', `${h} − 0`)} ${integ(0, h)} ${fn('T', T)} d${T}.`, `An antiderivative is ${P(Fc, 't')}, so the integral is ${N(tot)}.`, `Divide by ${h}: the average is <b>${F(tot, h)}°F</b>.`] };
      }
      const f = [3 * rng.nz(-2, 2), 2 * rng.int(-3, 3), rng.int(-6, 6)], lo = rng.int(-2, 1), hi = lo + rng.int(1, 4), Fc = pint(f), tot = evalP(Fc, hi) - evalP(Fc, lo);
      return { prompt: `Find the average value of ${fn('f', X)} = ${P(f)} on the interval [${N(lo)}, ${N(hi)}].`, type: 'number', ...fa(tot, hi - lo), params: { kind, f, lo, hi },
        hints: [`Average value = ${sfrac('1', `${N(hi)} − ${wrap(lo)}`)} ${integ(N(lo), N(hi))} (${P(f)})${DX}.`, `An antiderivative is ${P(Fc)}, so the integral is ${N(evalP(Fc, hi))} − ${wrap(evalP(Fc, lo))} = ${N(tot)}.`, `Divide by ${hi - lo}: the average value is <b>${F(tot, hi - lo)}</b>.`] };
    },
    verify(q) {
      const { f, lo, hi } = q.params;
      return near(simpson(x => evalP(f, x), lo, hi) / (hi - lo), q.answer, 1e-8);
    },
  });

  A.skill({
    id: 'calc.net-change', title: 'Net change from a rate',
    learn: p(`If you know how fast something changes, integrating the rate gives how much it changes. <b>Net change theorem: ${integ(V('a'), V('b'))} ${d1('F', T)} d${T} = ${fn('F', V('b'))} − ${fn('F', V('a'))}.</b> So the amount at the end is the starting amount plus the integral of the rate.`) +
      p(`For motion, integrating velocity gives <b>displacement</b> (the change in position, which can be negative). <b>Total distance</b> counts every meter traveled, forward or backward, so it integrates the speed |${fn('v', T)}|: split the interval wherever the velocity changes sign.`) +
      example('Example', `Water flows into a tank at ${fn('r', T)} = 4${T} + 3 liters per minute, and the tank starts with 10 liters. After 2 minutes it holds 10 + ${integ('0', '2')} (4${T} + 3) d${T} = 10 + [2${T}² + 3${T}] from 0 to 2 = 10 + 14 = <b>24 liters</b>.`),
    make(rng) {
      const kind = rng.pick(['tank', 'position', 'distance', 'displacement']);
      if (kind === 'tank') {
        const a = rng.int(1, 4), b = rng.int(0, 10), W0 = rng.pick([20, 40, 50, 100]), Tm = rng.int(2, 6), f = [2 * a, b], add = a * Tm * Tm + b * Tm;
        return { prompt: `Water flows into a tank at a rate of ${fn('r', T)} = ${P(f, 't')} liters per minute. The tank holds ${W0} liters at ${T} = 0. How much water is in the tank at ${T} = ${Tm}?`, type: 'number', answer: W0 + add, unit: 'liters', params: { kind, f, W0, Tm },
          hints: [`Amount at ${T} = ${Tm} = ${W0} + ${integ(0, Tm)} (${P(f, 't')}) d${T}.`, `An antiderivative is ${P(pint(f), 't')}, so the integral is ${N(add)}.`, `${W0} + ${add} = <b>${N(W0 + add)} liters</b>.`] };
      }
      if (kind === 'position') {
        const f = [3 * rng.int(0, 1), 2 * rng.int(-3, 3), rng.nz(-6, 6)], x0 = rng.int(-5, 5), Tm = rng.int(1, 4), Fc = pint(f), add = evalP(Fc, Tm);
        return { prompt: `A particle moves along a line with velocity ${fn('v', T)} = ${P(f, 't')} meters per second. At ${T} = 0 its position is ${N(x0)}. What is its position at ${T} = ${Tm}?`, type: 'number', answer: x0 + add, unit: 'm', params: { kind, f, x0, Tm },
          hints: [`Position at ${T} = ${Tm} = ${N(x0)} + ${integ(0, Tm)} ${fn('v', T)} d${T}.`, `An antiderivative of ${fn('v', T)} is ${P(Fc, 't')}, so the integral is ${N(add)}.`, `${N(x0)} + ${wrap(add)} = <b>${N(x0 + add)} m</b>.`] };
      }
      const m = rng.int(1, 4), k = rng.int(1, 3), Tm = k + rng.int(1, 3), f = [m, -m * k], vt = P(f, 't');
      const back = m * k * k, fwd = m * (Tm - k) * (Tm - k);
      if (kind === 'displacement') {
        const n = m * Tm * (Tm - 2 * k);
        return { prompt: `A particle moves along a line with velocity ${fn('v', T)} = ${vt} meters per second. What is its displacement from ${T} = 0 to ${T} = ${Tm}?`, type: 'number', ...fa(n, 2), unit: 'm', params: { kind, f, Tm },
          hints: [`Displacement is the integral of velocity: ${integ(0, Tm)} (${vt}) d${T}.`, `An antiderivative is ${m % 2 ? sfrac(`${m === 1 ? '' : m}${T}<sup>2</sup>`, '2') : `${m === 2 ? '' : m / 2}${T}<sup>2</sup>`} − ${m * k}${T}. At ${Tm}: ${F(m * Tm * Tm, 2)} − ${m * k * Tm}; at 0 it is 0.`, `The displacement is <b>${F(n, 2)} m</b>.`] };
      }
      return { prompt: `A particle moves along a line with velocity ${fn('v', T)} = ${vt} meters per second. What total distance does it travel from ${T} = 0 to ${T} = ${Tm}?`, type: 'number', ...fa(back + fwd, 2), unit: 'm', params: { kind, f, Tm },
        hints: [`The velocity is negative before ${T} = ${k} and positive after, so the particle turns around at ${T} = ${k}. Split the integral there and add the absolute values.`,
          `From 0 to ${k} the particle moves backward ${F(back, 2)} m (a triangle with base ${k} and height ${m * k}); from ${k} to ${Tm} it moves forward ${F(fwd, 2)} m.`,
          `Total distance: ${F(back, 2)} + ${F(fwd, 2)} = <b>${F(back + fwd, 2)} m</b>.`] };
    },
    verify(q) {
      const pr = q.params, v = t => evalP(pr.f, t);
      if (pr.kind === 'tank') return near(pr.W0 + simpson(v, 0, pr.Tm), q.answer, 1e-8);
      if (pr.kind === 'position') return near(pr.x0 + simpson(v, 0, pr.Tm), q.answer, 1e-8);
      if (pr.kind === 'displacement') return near(midSum(v, 0, pr.Tm), q.answer, 1e-6);
      return near(midSum(t => Math.abs(v(t)), 0, pr.Tm), q.answer, 1e-6);
    },
  });
})();
