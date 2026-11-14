/* Algebra 1. Expressions, equations and inequalities, units, linear equations and their graphs,
   systems, functions, sequences, absolute value and piecewise functions, exponents and radicals,
   exponential growth, and quadratics. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v;
  const X = V('x'), Y = V('y');
  const NAMES = ['Amara', 'Bilal', 'Cora', 'Dario', 'Esme', 'Felix', 'Gita', 'Hana', 'Ivo', 'Jonah', 'Keira', 'Luca', 'Maya', 'Nico', 'Orla', 'Pablo', 'Rhea', 'Soren', 'Tess', 'Wren',
    'Aiko', 'Chidi', 'Daniela', 'Farid', 'Ines', 'Kofi', 'Leilani', 'Mei', 'Nadia', 'Rosa', 'Sanjay', 'Tariq', 'Yusuf', 'Zainab', 'Mateo', 'Anya', 'Kwame', 'Lucia', 'Arjun', 'Saoirse'];
  const p = s => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const wrap = x => (x < 0 ? `(${N(x)})` : N(x));

  /* inequality signs: kept as plain symbols internally, written as entities in HTML */
  const OPH = { '<': '&lt;', '>': '&gt;', '≤': '≤', '≥': '≥' };
  const FLIP = { '<': '>', '>': '<', '≤': '≥', '≥': '≤' };
  const SOFT = { '<': '≤', '>': '≥', '≤': '<', '≥': '>' };
  const holds = (l, o, r) => (o === '<' ? l < r : o === '>' ? l > r : o === '≤' ? l <= r + 1e-12 : l >= r - 1e-12);
  /** HTML back to plain text with real signs and ASCII minus, for verify() parsers */
  /** HTML as plain words for a drawing's text alternative: tags dropped, nothing else changed */
  const flat = h => String(h).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  const plain = h => A.stripTags(String(h)).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/−/g, '-').replace(/(\d),(?=\d{3})/g, '$1').replace(/\s+/g, ' ').trim();

  /** candidate distractors that differ from the answer and from each other once tags are stripped */
  function others(answer, cands, need) {
    const key = c => A.normText(A.stripTags(c));
    const seen = new Set([key(answer)]), out = [];
    cands.forEach(c => { if (c && !seen.has(key(c))) { seen.add(key(c)); out.push(c); } });
    return out.slice(0, need);
  }
  /** a term with a variable and power; power 0 is a constant */
  const T = (c, v, pw) => (pw === 0 || !v ? N(c) : M.term(c, v, pw));
  /** a sum of [coef, var, pow] terms written the textbook way: 3x² − x + 4 */
  function sumHtml(terms) {
    const ts = terms.filter(t => t[0] !== 0);
    if (!ts.length) return '0';
    return ts.map(([c, v, pw], i) => { const t = T(Math.abs(c), v, pw); return i === 0 ? (c < 0 ? '−' : '') + t : (c < 0 ? ' − ' : ' + ') + t; }).join('');
  }
  /** a coefficient that may be a fraction, in front of a variable: −(2/3)x */
  function coefVar(n, d, v) {
    [n, d] = M.simp(n, d);
    if (n === 0) return '';
    if (d === 1) return M.term(n, v);
    return (n < 0 ? '−' : '') + F(Math.abs(n), d) + V(v);
  }
  /** y = mx + b with m = mn/md and an integer b */
  function lineEq(mn, md, b) {
    const t = coefVar(mn, md, 'x');
    if (!t) return `${Y} = ${N(b)}`;
    return `${Y} = ${t}${b ? ' ' + M.signed(b) : ''}`;
  }
  const slopeText = (n, d) => M.fracText(n, d);
  const frHtml = (n, d) => F(n, d);

  /* a coordinate grid from −6 to 6, with optional lines (through two points) and dots.
     opts.lines: [x1, y1, x2, y2] or { pts: [x1, y1, x2, y2], dash, label, at: [x, y] } · opts.dots: [x, y]
     opts.riseRun: [x1, y1, x2, y2] marks the run and the rise between two points · opts.shade: a polygon to tint
     opts.square: [x, y, ux, uy, vx, vy] a right-angle mark at (x, y) along two directions · opts.label: the text alternative */
  function grid(opts) {
    const R = 6, S = 20, pad = 8, W = 2 * R * S + 2 * pad;
    const px = x => pad + (x + R) * S, py = y => pad + (R - y) * S, f = v => M.round(v, 2);
    const txt = (x, y, s, anchor) => `<text x="${f(x)}" y="${f(y)}" font-size="13" font-weight="700" text-anchor="${anchor || 'middle'}" stroke="var(--surface)" stroke-width="4" paint-order="stroke">${s}</text>`;
    let g = '';
    for (let k = -R; k <= R; k++) g += `<line class="light" x1="${px(k)}" y1="${py(-R)}" x2="${px(k)}" y2="${py(R)}" stroke-width="${k === 0 ? 0 : 1}"/><line class="light" x1="${px(-R)}" y1="${py(k)}" x2="${px(R)}" y2="${py(k)}" stroke-width="${k === 0 ? 0 : 1}"/>`;
    if (opts.shade) g += `<polygon points="${opts.shade.map(([x, y]) => `${f(px(x))},${f(py(y))}`).join(' ')}" fill="var(--primary)" fill-opacity="0.16" stroke="none"/>`;
    g += `<line class="stroke" x1="${px(-R)}" y1="${py(0)}" x2="${px(R)}" y2="${py(0)}" stroke-width="1.5"/><line class="stroke" x1="${px(0)}" y1="${py(-R)}" x2="${px(0)}" y2="${py(R)}" stroke-width="1.5"/>`;
    g += `<text x="${px(R) - 10}" y="${py(0) - 6}" font-size="13" font-style="italic">x</text><text x="${px(0) + 6}" y="${py(R) + 12}" font-size="13" font-style="italic">y</text>`;
    const labels = [];
    (opts.lines || []).forEach(L => {
      const [x1, y1, x2, y2] = Array.isArray(L) ? L : L.pts, dx = x2 - x1, dy = y2 - y1;
      let lo = -Infinity, hi = Infinity;
      [[x1, dx], [y1, dy]].forEach(([s, d]) => { if (d !== 0) { const a = (-R - s) / d, b = (R - s) / d; lo = Math.max(lo, Math.min(a, b)); hi = Math.min(hi, Math.max(a, b)); } });
      g += `<line x1="${f(px(x1 + lo * dx))}" y1="${f(py(y1 + lo * dy))}" x2="${f(px(x1 + hi * dx))}" y2="${f(py(y1 + hi * dy))}" stroke="var(--primary)" stroke-width="2.5"${L.dash ? ' stroke-dasharray="8 5"' : ''}/>`;
      if (L.label) labels.push(txt(px(L.at[0]), py(L.at[1]), L.label));
    });
    if (opts.riseRun) {
      const [x1, y1, x2, y2] = opts.riseRun;
      g += `<path class="stroke" d="M${px(x1)},${py(y1)} H${px(x2)} V${py(y2)}" stroke-dasharray="5 4" stroke-width="1.8"/>`;
      labels.push(txt((px(x1) + px(x2)) / 2, py(y1) + (y2 > y1 ? 17 : -8), `run ${N(x2 - x1)}`), txt(px(x2) + 6, (py(y1) + py(y2)) / 2 + 4, `rise ${N(y2 - y1)}`, 'start'));
    }
    if (opts.square) {
      const [x, y, ux, uy, vx, vy] = opts.square, k = 9, nu = Math.hypot(ux, uy), nv = Math.hypot(vx, vy);
      const a = [px(x) + k * ux / nu, py(y) - k * uy / nu], c = [px(x) + k * vx / nv, py(y) - k * vy / nv], b = [a[0] + c[0] - px(x), a[1] + c[1] - py(y)];
      g += `<path class="stroke" d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])} L${f(c[0])},${f(c[1])}" stroke-width="1.5"/>`;
    }
    (opts.dots || []).forEach(([x, y]) => { g += `<circle cx="${px(x)}" cy="${py(y)}" r="4.5" fill="var(--primary)"/>`; });
    const label = M.esc(opts.label || 'coordinate grid');
    return `<svg class="figure" viewBox="0 0 ${W} ${W}" width="${W}" height="${W}" role="img" aria-label="${label}"><desc>${label}</desc>${g}${labels.join('')}</svg>`;
  }

  A.course({
    id: 'algebra-1', title: 'Algebra 1', subject: 'High school', grade: 9, icon: 'A1', hue: 245,
    blurb: 'Equations and inequalities, linear functions and systems, functions and sequences, exponents and exponential growth, and quadratics.',
    units: [
      { id: 'foundations', title: 'Algebra foundations', blurb: 'Tidying expressions: combining like terms and distributing.', skills: ['alg1.combine-like-terms', 'alg1.distribute'] },
      { id: 'equations', title: 'Solving equations, inequalities, and units', blurb: 'Multi-step and literal equations, compound inequalities, and converting units.', skills: ['alg1.multi-step-equations', 'alg1.literal-equations', 'alg1.compound-inequalities', 'alg1.unit-conversion'] },
      { id: 'linear', title: 'Linear equations and graphs', blurb: 'Slope, the forms of a line, and parallel and perpendicular lines.', skills: ['alg1.slope', 'alg1.linear-forms', 'alg1.parallel-perpendicular'] },
      { id: 'systems', title: 'Systems of equations and inequalities', blurb: 'Substitution, elimination, word problems, and regions in the plane.', skills: ['alg1.solve-systems', 'alg1.linear-inequalities'] },
      { id: 'functions', title: 'Functions', blurb: 'Function notation, domain and range, and average rate of change.', skills: ['alg1.function-notation', 'alg1.domain-range', 'alg1.rate-of-change'] },
      { id: 'sequences-abs', title: 'Sequences, absolute value, and piecewise functions', blurb: 'Arithmetic and geometric sequences, absolute value equations, and functions defined in pieces.', skills: ['alg1.sequences', 'alg1.absolute-value-equations', 'alg1.piecewise-functions'] },
      { id: 'exponents', title: 'Exponents, radicals, and exponential growth', blurb: 'Exponent rules, square roots, rational and irrational numbers, and growth and decay.', skills: ['alg1.exponent-properties', 'alg1.simplify-roots', 'alg1.rational-irrational', 'alg1.exponential-growth-decay'] },
      { id: 'quadratics', title: 'Quadratics', blurb: 'Multiplying and factoring, solving quadratic equations, and vertex form.', skills: ['alg1.multiply-binomials', 'alg1.factor-quadratics', 'alg1.solve-quadratics', 'alg1.vertex-form'] },
    ],
  });

  /* ---------- Unit 1: Algebra foundations ---------- */
  /** collect [coef, var, pow] terms into one coefficient per (var, pow), highest power first */
  function collect(terms) {
    const map = new Map();
    terms.forEach(([c, v, pw]) => { const k = v + '^' + pw; map.set(k, (map.get(k) || 0) + c); });
    return [...map.entries()].map(([k, c]) => { const [v, pw] = k.split('^'); return [c, v, Number(pw)]; })
      .sort((a, b) => b[2] - a[2] || a[1].localeCompare(b[1]));
  }

  A.skill({
    id: 'alg1.combine-like-terms', title: 'Combining like terms',
    learn: p(`A <b>term</b> is a number, a variable, or a number times variables, such as 5${M.sup(X, 2)} or −3. The number in front is the term’s <b>coefficient</b>, and a term with no variable is called a <b>constant</b>.`) +
      p(`Two terms are <b>like terms</b> when their variable parts match exactly, powers included. 4${M.sup(X, 2)} and −${M.sup(X, 2)} are like terms. 4${M.sup(X, 2)} and 4${X} aren’t, because one has ${X} squared and the other doesn’t.`) +
      p('To simplify, <b>add the coefficients of each group of like terms</b> and keep the variable part as it is. A minus sign belongs to the term right after it, so carry it along when you move terms around. Write the result with the highest power first.') +
      example('Example 1: one variable with powers', `${big(`2${M.sup(X, 2)} − 5${X} + 3 + ${M.sup(X, 2)} + 7${X}`)}${M.sup(X, 2)} terms: 2 + 1 = 3. ${X} terms: −5 + 7 = 2. Constant: 3. Result: <b>3${M.sup(X, 2)} + 2${X} + 3</b>.`) +
      example('Example 2: two variables', `${big(`4${X} − 6${Y} − ${X} + 2${Y}`)}${X} terms: 4 − 1 = 3. ${Y} terms: −6 + 2 = −4. The ${X} and ${Y} terms can’t be combined with each other, so the result is <b>3${X} − 4${Y}</b>.`),
    make(rng) {
      const kind = rng.pick(['quad', 'quad', 'two-var']);
      let terms, answer, wrong;
      if (kind === 'quad') {
        const a = rng.nz(-6, 6), b = rng.nz(-9, 9), c = rng.nz(-9, 9); let d = rng.nz(-6, 6), e = rng.nz(-9, 9);
        if (a + d === 0) d += d > 0 ? 1 : -1;
        if (b + e === 0) e += e > 0 ? 1 : -1;
        terms = rng.shuffle([[a, 'x', 2], [b, 'x', 1], [c, '', 0], [d, 'x', 2], [e, 'x', 1]]);
        answer = sumHtml([[a + d, 'x', 2], [b + e, 'x', 1], [c, '', 0]]);
        wrong = [sumHtml([[a + d, 'x', 2], [b - e, 'x', 1], [c, '', 0]]), sumHtml([[a - d, 'x', 2], [b + e, 'x', 1], [c, '', 0]]), sumHtml([[a + d + b + e, 'x', 2], [c, '', 0]]), sumHtml([[a + d, 'x', 2], [b + e + c, 'x', 1]]), sumHtml([[a + d, 'x', 2], [b + e, 'x', 1], [-c, '', 0]])];
      } else {
        const a = rng.nz(-8, 8), b = rng.nz(-8, 8); let c = rng.nz(-8, 8), d = rng.nz(-8, 8);
        if (a + c === 0) c += c > 0 ? 1 : -1;
        if (b + d === 0) d += d > 0 ? 1 : -1;
        terms = rng.shuffle([[a, 'x', 1], [b, 'y', 1], [c, 'x', 1], [d, 'y', 1]]);
        answer = sumHtml([[a + c, 'x', 1], [b + d, 'y', 1]]);
        wrong = [sumHtml([[a - c, 'x', 1], [b + d, 'y', 1]]), sumHtml([[a + c, 'x', 1], [b - d, 'y', 1]]), M.term(a + b + c + d || 1, 'xy'), sumHtml([[a + c, 'x', 1], [-(b + d), 'y', 1]])];
      }
      const groups = collect(terms);
      const choices = [answer].concat(others(answer, wrong, 3));
      const hints = groups.map(([c, v, pw]) => {
        const same = terms.filter(t => t[1] === v && t[2] === pw);
        const label = pw === 0 ? 'the constants' : `the ${T(1, v, pw)} terms`;
        return same.length === 1 ? `Only one term is in ${label}: ${T(c, v, pw)}. It stays as it is.` : `Group ${label}: ${same.map(t => N(t[0])).join(', ')} add to ${N(c)}.`;
      });
      hints.push(`Write the groups together, highest power first: <b>${answer}</b>.`);
      return { prompt: `Simplify by combining like terms.${big(sumHtml(terms))}`, type: 'choice', choices, answer, hints, params: { terms } };
    },
    verify(q) {
      const { terms } = q.params;
      // evaluate the original and the claimed answer's coefficients at two points
      const val = (ts, x, y) => ts.reduce((s, [c, v, pw]) => s + c * (pw === 0 ? 1 : Math.pow(v === 'y' ? y : x, pw)), 0);
      const groups = collect(terms);
      return q.answer === sumHtml(groups) && [[2, 7], [-3, 5]].every(([x, y]) => val(terms, x, y) === val(groups, x, y));
    },
  });

  A.skill({
    id: 'alg1.distribute', title: 'Distributing and simplifying',
    learn: p(`A <b>factor</b> is something being multiplied. The <b>distributive property</b> says a factor outside parentheses multiplies <b>every</b> term inside: ${V('k')}(${V('a')} + ${V('b')}) = ${V('k')}${V('a')} + ${V('k')}${V('b')}. When the factor is negative, its minus sign goes into every product too.`) +
      p(`After distributing, combine like terms. In 2(3${X} + 1) − 4(${X} − 5), the −4 multiplies both ${X} and −5, giving −4${X} + 20. Forgetting the sign on that second product is the most common slip.`) +
      p(`A variable outside works the same way: ${X}(2${X} − 3) = 2${M.sup(X, 2)} − 3${X}, because ${X} · ${X} = ${M.sup(X, 2)}.`) +
      example('Example 1: two groups, then combine', `${big(`3(2${X} − 4) − 5(${X} + 1)`)}3 · 2${X} = 6${X}, 3 · (−4) = −12, −5 · ${X} = −5${X}, −5 · 1 = −5. Combine: (6 − 5)${X} + (−12 − 5) = <b>${X} − 17</b>.`) +
      example('Example 2: a variable outside', `${big(`−2${X}(3${X} − 5)`)}−2${X} · 3${X} = −6${M.sup(X, 2)}, and −2${X} · (−5) = 10${X}. The result is <b>−6${M.sup(X, 2)} + 10${X}</b>.`),
    make(rng) {
      if (rng.chance(0.3)) {
        const k = rng.nz(-6, 6), a = rng.nz(-7, 7), b = rng.nz(-9, 9);
        const answer = sumHtml([[k * a, 'x', 2], [k * b, 'x', 1]]);
        const wrong = [sumHtml([[k * a, 'x', 2], [b, '', 0]]), sumHtml([[k * a + k * b, 'x', 1]]), sumHtml([[k * a, 'x', 2], [-k * b, 'x', 1]]), sumHtml([[k * a, 'x', 1], [k * b, '', 0]])];
        const outside = k === 1 ? X : k === -1 ? '−' + X : N(k) + X;
        return { prompt: `Expand.${big(`${outside}(${sumHtml([[a, 'x', 1], [b, '', 0]])})`)}`, type: 'choice', choices: [answer].concat(others(answer, wrong, 3)), answer, params: { kind: 'mono', k, a, b },
          hints: [`Multiply ${outside} by the first term: ${outside} · ${M.term(a, 'x')} = ${M.term(k * a, 'x', 2)}, because ${X} · ${X} = ${M.sup(X, 2)}.`, `Multiply ${outside} by ${N(b)}: that gives ${M.term(k * b, 'x')}.`, `So the expansion is <b>${answer}</b>.`] };
      }
      const a = rng.sign() * rng.int(2, 6), b = rng.nz(-5, 5), c = rng.nz(-9, 9), d = rng.nz(-6, 6), e = rng.nz(-5, 5), f = rng.nz(-9, 9);
      let ex = a * b + d * e; const dd = ex === 0 ? d + (d > 0 ? 1 : -1) || 2 : d; ex = a * b + dd * e;
      const konst = a * c + dd * f;
      const answer = sumHtml([[ex, 'x', 1], [konst, '', 0]]);
      const wrong = [sumHtml([[ex, 'x', 1], [a * c - dd * f, '', 0]]), sumHtml([[ex, 'x', 1], [c + f, '', 0]]), sumHtml([[a * b - dd * e, 'x', 1], [konst, '', 0]]), sumHtml([[ex, 'x', 1], [a * c + f, '', 0]]), sumHtml([[ex, 'x', 1], [-konst, '', 0]])];
      const inner1 = sumHtml([[b, 'x', 1], [c, '', 0]]), inner2 = sumHtml([[e, 'x', 1], [f, '', 0]]);
      const expr = `${N(a)}(${inner1}) ${dd < 0 ? '−' : '+'} ${Math.abs(dd) === 1 ? '' : N(Math.abs(dd))}(${inner2})`;
      return { prompt: `Expand and simplify.${big(expr)}`, type: 'choice', choices: [answer].concat(others(answer, wrong, 3)), answer, params: { kind: 'two', a, b, c, d: dd, e, f },
        hints: [`Distribute ${N(a)}: ${N(a)}(${inner1}) = ${sumHtml([[a * b, 'x', 1], [a * c, '', 0]])}.`, `Distribute ${N(dd)}, sign included: ${N(dd)}(${inner2}) = ${sumHtml([[dd * e, 'x', 1], [dd * f, '', 0]])}.`, `Combine: ${X} terms ${N(a * b)} ${M.signed(dd * e)} = ${N(ex)}; constants ${N(a * c)} ${M.signed(dd * f)} = ${N(konst)}.`, `The simplified expression is <b>${answer}</b>.`] };
    },
    challenge(rng) {
      // a variable times a binomial, plus or minus a number times a trinomial
      const k = rng.nz(-4, 4), a = rng.nz(-5, 5), b = rng.nz(-7, 7), d = rng.sign() * rng.int(2, 5), f = rng.nz(-6, 6), g = rng.nz(-6, 6);
      let e = rng.nz(-3, 3); if (k * a + d * e === 0) e = e === 3 ? -3 : e + 1 || 1;
      const A2 = k * a + d * e, B1 = k * b + d * f, C0 = d * g;
      const outside = k === 1 ? X : k === -1 ? '−' + X : N(k) + X;
      const in1 = sumHtml([[a, 'x', 1], [b, '', 0]]), in2 = sumHtml([[e, 'x', 2], [f, 'x', 1], [g, '', 0]]);
      const answer = sumHtml([[A2, 'x', 2], [B1, 'x', 1], [C0, '', 0]]);
      const wrong = [sumHtml([[A2, 'x', 2], [k * b - d * f, 'x', 1], [C0, '', 0]]), sumHtml([[A2, 'x', 2], [B1, 'x', 1], [g, '', 0]]), sumHtml([[d * e, 'x', 2], [k * a + k * b + d * f, 'x', 1], [C0, '', 0]]), sumHtml([[A2, 'x', 2], [B1, 'x', 1], [-C0, '', 0]]), sumHtml([[k * a - d * e, 'x', 2], [B1, 'x', 1], [C0, '', 0]])];
      return { prompt: `Expand and simplify.${big(`${outside}(${in1}) ${d < 0 ? '−' : '+'} ${N(Math.abs(d))}(${in2})`)}`, type: 'choice', choices: [answer].concat(others(answer, wrong, 3)), answer, params: { kind: 'hard', k, a, b, d, e, f, g },
        hints: [`Distribute ${outside}: ${outside}(${in1}) = ${sumHtml([[k * a, 'x', 2], [k * b, 'x', 1]])}, because ${X} · ${X} = ${M.sup(X, 2)}.`, `Distribute ${N(d)} to all three terms, sign included: ${sumHtml([[d * e, 'x', 2], [d * f, 'x', 1], [d * g, '', 0]])}.`, `Combine like terms: ${M.sup(X, 2)} terms ${N(k * a)} ${M.signed(d * e)} = ${N(A2)}, and ${X} terms ${N(k * b)} ${M.signed(d * f)} = ${N(B1)}.`, `The simplified expression is <b>${answer}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'hard') {
        const at = x => P.k * x * (P.a * x + P.b) + P.d * (P.e * x * x + P.f * x + P.g), c = at(0);
        return q.answer === sumHtml([[(at(1) + at(-1)) / 2 - c, 'x', 2], [(at(1) - at(-1)) / 2, 'x', 1], [c, '', 0]]);
      }
      if (P.kind === 'mono') {
        const at = x => P.k * x * (P.a * x + P.b);
        // read the coefficients back from two evaluations: f(1) = A + B, f(−1) = A − B
        const A2 = (at(1) + at(-1)) / 2, B1 = (at(1) - at(-1)) / 2;
        return q.answer === sumHtml([[A2, 'x', 2], [B1, 'x', 1]]);
      }
      const at = x => P.a * (P.b * x + P.c) + P.d * (P.e * x + P.f);
      return q.answer === sumHtml([[at(1) - at(0), 'x', 1], [at(0), '', 0]]);
    },
  });

  /* ---------- Unit 2: Solving equations, inequalities, and units ---------- */
  const COUNT_CHOICES = ['Exactly one solution', 'No solution', 'Infinitely many solutions'];

  A.skill({
    id: 'alg1.multi-step-equations', title: 'Equations with variables on both sides',
    learn: p(`When ${X} appears on both sides, first <b>simplify each side</b>: distribute and combine like terms. Then <b>move all the ${X} terms to one side</b> and the plain numbers to the other. Finally, divide by the coefficient of ${X}, the number multiplying it.`) +
      p(`Moving a term means doing the same thing to both sides: to move 2${X} off the right side, subtract 2${X} from both sides. It’s easiest to collect ${X} on the side where its coefficient stays positive.`) +
      p(`Sometimes the ${X} terms cancel. If what’s left is false (like 4 = 9), there’s <b>no solution</b>. If it’s always true (like 4 = 4), there are <b>infinitely many solutions</b>: every number works.`) +
      example('Example 1: variables on both sides', `${big(`7${X} − 4 = 3${X} + 12`)}Subtract 3${X}: 4${X} − 4 = 12. Add 4: 4${X} = 16. Divide by 4: <b>${X} = 4</b>. Check: 7(4) − 4 = 24 and 3(4) + 12 = 24 ✓`) +
      example('Example 2: parentheses first', `${big(`3(${X} − 2) + 5 = 5${X} − 9`)}Distribute and tidy the left side: 3${X} − 1 = 5${X} − 9. Subtract 3${X}: −1 = 2${X} − 9. Add 9: 8 = 2${X}, so <b>${X} = 4</b>.`) +
      example('Example 3: when the x terms cancel', `${big(`2(${X} + 3) = 2${X} + 1`)}Distribute: 2${X} + 6 = 2${X} + 1. Subtract 2${X}: 6 = 1, which is never true, so there’s <b>no solution</b>. If the right side were 2${X} + 6, you’d get 6 = 6, and there would be <b>infinitely many solutions</b>.`),
    make(rng) {
      const kind = rng.pick(['both', 'both', 'paren', 'count']);
      if (kind === 'count') {
        const k = rng.sign() * rng.int(2, 5), m = rng.nz(-4, 4), n = rng.nz(-6, 6), type = rng.pick(['one', 'none', 'many']);
        const R1 = type === 'one' ? k * m + rng.nz(-3, 3) : k * m;
        const R0 = type === 'none' ? k * n + rng.nz(-5, 5) : type === 'many' ? k * n : rng.int(-9, 9);
        const left = `${N(k)}(${sumHtml([[m, 'x', 1], [n, '', 0]])})`, right = sumHtml([[R1, 'x', 1], [R0, '', 0]]);
        const answer = COUNT_CHOICES[['one', 'none', 'many'].indexOf(type)];
        const flip = rng.bool();
        return { prompt: `How many solutions does this equation have?${big(flip ? `${right} = ${left}` : `${left} = ${right}`)}`, type: 'choice', choices: COUNT_CHOICES.slice(), keepOrder: true, answer, params: { kind, k, m, n, R1, R0 },
          hints: [`Distribute first: ${left} = ${sumHtml([[k * m, 'x', 1], [k * n, '', 0]])}.`,
            k * m === R1 ? `Both sides have ${M.term(R1, 'x')}, so subtracting it leaves ${N(k * n)} = ${N(R0)}${k * n === R0 ? ', which is always true' : ', which is never true'}.` : `The ${X} coefficients are different (${N(k * m)} and ${N(R1)}), so the ${X} terms do not cancel and ${X} can be solved for.`,
            `So the equation has <b>${answer.toLowerCase()}</b>.`] };
      }
      const x = rng.nz(-10, 10);
      if (kind === 'paren') {
        const a = rng.sign() * rng.int(2, 6), b = rng.nz(-8, 8), c = rng.int(-10, 10); let dc = rng.nz(-9, 9); if (dc === a) dc = a + 1;
        const e = a * (x + b) + c - dc * x;
        const left = `${N(a)}(${X} ${M.signed(b)})${c ? ' ' + M.signed(c) : ''}`, right = sumHtml([[dc, 'x', 1], [e, '', 0]]);
        const l1 = a, l0 = a * b + c;
        return { prompt: `Solve for ${X}.${big(`${left} = ${right}`)}`, type: 'number', answer: x, params: { kind, a, b, c, dc, e },
          hints: [`Distribute and tidy the left side: ${sumHtml([[l1, 'x', 1], [l0, '', 0]])} = ${right}.`, `${dc < 0 ? 'Add' : 'Subtract'} ${M.term(Math.abs(dc), 'x')} on both sides: ${sumHtml([[l1 - dc, 'x', 1], [l0, '', 0]])} = ${N(e)}.`, `${l0 < 0 ? 'Add' : 'Subtract'} ${N(Math.abs(l0))}: ${M.term(l1 - dc, 'x')} = ${N(e - l0)}.`, `Divide by ${N(l1 - dc)}: <b>${X} = ${N(x)}</b>.`] };
      }
      const a = rng.nz(-9, 9); let c = rng.nz(-9, 9); if (c === a) c = a === 9 ? -9 : a + 1;
      const b = rng.nz(-12, 12), d = a * x + b - c * x;
      const left = sumHtml([[a, 'x', 1], [b, '', 0]]), right = sumHtml([[c, 'x', 1], [d, '', 0]]);
      return { prompt: `Solve for ${X}.${big(`${left} = ${right}`)}`, type: 'number', answer: x, params: { kind, a, b, c, d },
        hints: [`${c < 0 ? 'Add' : 'Subtract'} ${M.term(Math.abs(c), 'x')} on both sides to gather the ${X} terms on the left: ${sumHtml([[a - c, 'x', 1], [b, '', 0]])} = ${N(d)}.`, `${b < 0 ? 'Add' : 'Subtract'} ${N(Math.abs(b))} on both sides: ${M.term(a - c, 'x')} = ${N(d - b)}.`, `Divide both sides by ${N(a - c)}: <b>${X} = ${N(x)}</b>. Check: both sides equal ${N(a * x + b)}.`] };
    },
    challenge(rng) {
      const x = rng.nz(-12, 12), times = (k, e) => (k === 1 ? `(${e})` : k === -1 ? `−(${e})` : `${N(k)}(${e})`);
      if (rng.bool()) {
        // fractions on both sides: (ax + b)/m = (cx + d)/n
        const [m, n] = rng.pick([[2, 3], [3, 4], [2, 5], [4, 3], [3, 5], [5, 2], [6, 4], [4, 6]]), a = rng.nz(-4, 4);
        let c = rng.nz(-4, 4); while (a * n === c * m) c = rng.nz(-4, 4);
        const j = rng.nz(-6, 6), b = m * j - a * x, d = n * j - c * x, L = m * n / M.gcd(m, n), u = L / m, w = L / n;
        const in1 = sumHtml([[a, 'x', 1], [b, '', 0]]), in2 = sumHtml([[c, 'x', 1], [d, '', 0]]);
        return { prompt: `Solve for ${X}.${big(`${F(in1, m)} = ${F(in2, n)}`)}`, type: 'number', answer: x, params: { kind: 'frac', a, b, c, d, m, n },
          hints: [`Clear the fractions: multiply both sides by ${L}, the least common denominator. ${times(u, in1)} = ${times(w, in2)}.`, `Distribute: ${sumHtml([[a * u, 'x', 1], [b * u, '', 0]])} = ${sumHtml([[c * w, 'x', 1], [d * w, '', 0]])}.`, `Gather the ${X} terms: ${M.term(a * u - c * w, 'x')} = ${N(d * w - b * u)}, so <b>${X} = ${N(x)}</b>.`] };
      }
      // parentheses on both sides: a(x + b) − c(x − d) = e(x + f) + g
      const a = rng.int(2, 7), c = rng.int(2, 6), b = rng.nz(-8, 8), d = rng.nz(-8, 8), f = rng.nz(-8, 8);
      let e = rng.nz(-5, 5); while (a - c - e === 0) e = rng.nz(-5, 5);
      const g = a * (x + b) - c * (x - d) - e * (x + f);
      const lhs = `${N(a)}(${X} ${M.signed(b)}) − ${N(c)}(${X} ${M.signed(-d)})`, rhs = `${times(e, `${X} ${M.signed(f)}`)}${g ? ' ' + M.signed(g) : ''}`;
      return { prompt: `Solve for ${X}.${big(`${lhs} = ${rhs}`)}`, type: 'number', answer: x, params: { kind: 'paren2', a, b, c, d, e, f, g },
        hints: [`Distribute on both sides, watching the minus sign in front of ${N(c)}: ${sumHtml([[a - c, 'x', 1], [a * b + c * d, '', 0]])} = ${sumHtml([[e, 'x', 1], [e * f + g, '', 0]])}.`, `Move the ${X} terms to one side and the numbers to the other: ${M.term(a - c - e, 'x')} = ${N(e * f + g - a * b - c * d)}.`, `Divide by ${N(a - c - e)}: <b>${X} = ${N(x)}</b>.`] };
    },
    verify(q) {
      const P = q.params, x = q.answer;
      if (P.kind === 'count') {
        const g = t => P.k * (P.m * t + P.n) - (P.R1 * t + P.R0);
        const expect = g(1) !== g(0) ? COUNT_CHOICES[0] : g(0) === 0 ? COUNT_CHOICES[2] : COUNT_CHOICES[1];
        return q.answer === expect;
      }
      if (P.kind === 'paren') return P.a * (x + P.b) + P.c === P.dc * x + P.e;
      if (P.kind === 'frac') return P.a * P.n !== P.c * P.m && P.n * (P.a * x + P.b) === P.m * (P.c * x + P.d);      // cross-multiplied, and only one solution
      if (P.kind === 'paren2') return P.a - P.c !== P.e && P.a * (x + P.b) - P.c * (x - P.d) === P.e * (x + P.f) + P.g;
      return P.a * x + P.b === P.c * x + P.d;
    },
  });

  /* formulas to rearrange: every option says how to compute the target from the other letters */
  const sb = (l, i) => `${V(l)}<sub>${i}</sub>`;
  const LIT = [
    { f: `${V('P')} = 2${V('l')} + 2${V('w')}`, t: 'w', vars: ['P', 'l'], ok: s => s.P - (2 * s.l + 2 * s.w), opts: [
      [`${V('w')} = ${F(`${V('P')} − 2${V('l')}`, '2')}`, s => (s.P - 2 * s.l) / 2], [`${V('w')} = ${F(`${V('P')} − ${V('l')}`, '2')}`, s => (s.P - s.l) / 2],
      [`${V('w')} = ${F(V('P'), '2')} − 2${V('l')}`, s => s.P / 2 - 2 * s.l], [`${V('w')} = ${F(`${V('P')} + 2${V('l')}`, '2')}`, s => (s.P + 2 * s.l) / 2]] },
    { f: `${V('A')} = ${F('1', '2')}${V('b')}${V('h')}`, t: 'h', vars: ['A', 'b'], ok: s => s.A - (s.b * s.h / 2), opts: [
      [`${V('h')} = ${F(`2${V('A')}`, V('b'))}`, s => 2 * s.A / s.b], [`${V('h')} = ${F(V('A'), `2${V('b')}`)}`, s => s.A / (2 * s.b)],
      [`${V('h')} = ${F(`2${V('b')}`, V('A'))}`, s => 2 * s.b / s.A], [`${V('h')} = ${F(`${V('A')}${V('b')}`, '2')}`, s => s.A * s.b / 2]] },
    { f: `${V('d')} = ${V('r')}${V('t')}`, t: 't', vars: ['d', 'r'], ok: s => s.d - (s.r * s.t), opts: [
      [`${V('t')} = ${F(V('d'), V('r'))}`, s => s.d / s.r], [`${V('t')} = ${F(V('r'), V('d'))}`, s => s.r / s.d],
      [`${V('t')} = ${V('d')} + ${V('r')}`, s => s.d + s.r], [`${V('t')} = ${V('d')} − ${V('r')}`, s => s.d - s.r]] },
    { f: `${V('y')} = ${V('m')}${V('x')} + ${V('b')}`, t: 'x', vars: ['y', 'm', 'b'], ok: s => s.y - (s.m * s.x + s.b), opts: [
      [`${V('x')} = ${F(`${V('y')} − ${V('b')}`, V('m'))}`, s => (s.y - s.b) / s.m], [`${V('x')} = ${F(`${V('y')} + ${V('b')}`, V('m'))}`, s => (s.y + s.b) / s.m],
      [`${V('x')} = ${F(V('y'), V('m'))} − ${V('b')}`, s => s.y / s.m - s.b], [`${V('x')} = ${F(`${V('b')} − ${V('y')}`, V('m'))}`, s => (s.b - s.y) / s.m]] },
    { f: `${V('V')} = ${V('l')}${V('w')}${V('h')}`, t: 'h', vars: ['V', 'l', 'w'], ok: s => s.V - (s.l * s.w * s.h), opts: [
      [`${V('h')} = ${F(V('V'), `${V('l')}${V('w')}`)}`, s => s.V / (s.l * s.w)], [`${V('h')} = ${F(`${V('l')}${V('w')}`, V('V'))}`, s => s.l * s.w / s.V],
      [`${V('h')} = ${V('V')} − ${V('l')}${V('w')}`, s => s.V - s.l * s.w], [`${V('h')} = ${F(V('V'), V('l'))} − ${V('w')}`, s => s.V / s.l - s.w]] },
    { f: `${V('I')} = ${V('P')}${V('r')}${V('t')}`, t: 'r', vars: ['I', 'P', 't'], ok: s => s.I - (s.P * s.r * s.t), opts: [
      [`${V('r')} = ${F(V('I'), `${V('P')}${V('t')}`)}`, s => s.I / (s.P * s.t)], [`${V('r')} = ${F(`${V('P')}${V('t')}`, V('I'))}`, s => s.P * s.t / s.I],
      [`${V('r')} = ${V('I')} − ${V('P')}${V('t')}`, s => s.I - s.P * s.t], [`${V('r')} = ${F(V('I'), V('P'))} − ${V('t')}`, s => s.I / s.P - s.t]] },
    { f: `${V('F')} = ${F('9', '5')}${V('C')} + 32`, t: 'C', vars: ['F'], ok: s => s.F - (9 / 5 * s.C + 32), opts: [
      [`${V('C')} = ${F('5', '9')}(${V('F')} − 32)`, s => 5 / 9 * (s.F - 32)], [`${V('C')} = ${F(`5${V('F')}`, '9')} − 32`, s => 5 * s.F / 9 - 32],
      [`${V('C')} = ${F('9', '5')}(${V('F')} − 32)`, s => 9 / 5 * (s.F - 32)], [`${V('C')} = ${F('5', '9')}(${V('F')} + 32)`, s => 5 / 9 * (s.F + 32)]] },
    { f: `${V('A')} = ${V('P')} + ${V('P')}${V('r')}${V('t')}`, t: 't', vars: ['A', 'P', 'r'], ok: s => s.A - (s.P + s.P * s.r * s.t), opts: [
      [`${V('t')} = ${F(`${V('A')} − ${V('P')}`, `${V('P')}${V('r')}`)}`, s => (s.A - s.P) / (s.P * s.r)], [`${V('t')} = ${F(`${V('A')} − ${V('P')}`, V('r'))}`, s => (s.A - s.P) / s.r],
      [`${V('t')} = ${F(`${V('A')} + ${V('P')}`, `${V('P')}${V('r')}`)}`, s => (s.A + s.P) / (s.P * s.r)], [`${V('t')} = ${F(V('A'), `${V('P')}${V('r')}`)} − ${V('P')}`, s => s.A / (s.P * s.r) - s.P]] },
    { f: `${V('C')} = 2π${V('r')}`, t: 'r', vars: ['C'], ok: s => s.C - (2 * Math.PI * s.r), opts: [
      [`${V('r')} = ${F(V('C'), '2π')}`, s => s.C / (2 * Math.PI)], [`${V('r')} = 2π${V('C')}`, s => 2 * Math.PI * s.C],
      [`${V('r')} = ${F(V('C'), 'π')}`, s => s.C / Math.PI], [`${V('r')} = ${V('C')} − 2π`, s => s.C - 2 * Math.PI]] },
    { f: `${V('a')}${V('x')} + ${V('b')}${V('y')} = ${V('c')}`, t: 'y', vars: ['a', 'x', 'b', 'c'], ok: s => s.a * s.x + s.b * s.y - (s.c), opts: [
      [`${V('y')} = ${F(`${V('c')} − ${V('a')}${V('x')}`, V('b'))}`, s => (s.c - s.a * s.x) / s.b], [`${V('y')} = ${F(`${V('c')} + ${V('a')}${V('x')}`, V('b'))}`, s => (s.c + s.a * s.x) / s.b],
      [`${V('y')} = ${V('c')} − ${V('a')}${V('x')} − ${V('b')}`, s => s.c - s.a * s.x - s.b], [`${V('y')} = ${F(`${V('a')}${V('x')} − ${V('c')}`, V('b'))}`, s => (s.a * s.x - s.c) / s.b]] },
    { f: `${V('A')} = ${F(V('h'), '2')}(${sb('b', 1)} + ${sb('b', 2)})`, t: 'h', vars: ['A', 'b1', 'b2'], ok: s => s.A - (s.h / 2 * (s.b1 + s.b2)), opts: [
      [`${V('h')} = ${F(`2${V('A')}`, `${sb('b', 1)} + ${sb('b', 2)}`)}`, s => 2 * s.A / (s.b1 + s.b2)], [`${V('h')} = ${F(V('A'), `2(${sb('b', 1)} + ${sb('b', 2)})`)}`, s => s.A / (2 * (s.b1 + s.b2))],
      [`${V('h')} = 2${V('A')} − (${sb('b', 1)} + ${sb('b', 2)})`, s => 2 * s.A - (s.b1 + s.b2)], [`${V('h')} = ${F(`${sb('b', 1)} + ${sb('b', 2)}`, `2${V('A')}`)}`, s => (s.b1 + s.b2) / (2 * s.A)]] },
    { f: `${V('A')} = ${V('l')}${V('w')}`, t: 'w', vars: ['A', 'l'], ok: s => s.A - s.l * s.w, opts: [
      [`${V('w')} = ${F(V('A'), V('l'))}`, s => s.A / s.l], [`${V('w')} = ${F(V('l'), V('A'))}`, s => s.l / s.A],
      [`${V('w')} = ${V('A')} − ${V('l')}`, s => s.A - s.l], [`${V('w')} = ${V('A')} + ${V('l')}`, s => s.A + s.l]] },
    { f: `${V('V')} = π${M.sup(V('r'), 2)}${V('h')}`, t: 'h', vars: ['V', 'r'], ok: s => s.V - Math.PI * s.r * s.r * s.h, opts: [
      [`${V('h')} = ${F(V('V'), `π${M.sup(V('r'), 2)}`)}`, s => s.V / (Math.PI * s.r * s.r)], [`${V('h')} = ${F(`π${M.sup(V('r'), 2)}`, V('V'))}`, s => Math.PI * s.r * s.r / s.V],
      [`${V('h')} = ${V('V')} − π${M.sup(V('r'), 2)}`, s => s.V - Math.PI * s.r * s.r], [`${V('h')} = ${F(V('V'), `2π${V('r')}`)}`, s => s.V / (2 * Math.PI * s.r)]] },
    { f: `${V('S')} = 180(${V('n')} − 2)`, t: 'n', vars: ['S'], ok: s => s.S - 180 * (s.n - 2), opts: [
      [`${V('n')} = ${F(V('S'), '180')} + 2`, s => s.S / 180 + 2], [`${V('n')} = ${F(V('S'), '180')} − 2`, s => s.S / 180 - 2],
      [`${V('n')} = ${F(`${V('S')} − 2`, '180')}`, s => (s.S - 2) / 180], [`${V('n')} = 180${V('S')} + 2`, s => 180 * s.S + 2]] },
    { f: `${V('y')} = ${V('m')}${V('x')} + ${V('b')}`, t: 'm', vars: ['y', 'x', 'b'], ok: s => s.y - (s.m * s.x + s.b), opts: [
      [`${V('m')} = ${F(`${V('y')} − ${V('b')}`, V('x'))}`, s => (s.y - s.b) / s.x], [`${V('m')} = ${F(`${V('y')} + ${V('b')}`, V('x'))}`, s => (s.y + s.b) / s.x],
      [`${V('m')} = ${F(V('y'), V('x'))} − ${V('b')}`, s => s.y / s.x - s.b], [`${V('m')} = ${F(`${V('x')} − ${V('b')}`, V('y'))}`, s => (s.x - s.b) / s.y]] },
    { f: `${V('P')} = 2(${V('l')} + ${V('w')})`, t: 'l', vars: ['P', 'w'], ok: s => s.P - 2 * (s.l + s.w), opts: [
      [`${V('l')} = ${F(V('P'), '2')} − ${V('w')}`, s => s.P / 2 - s.w], [`${V('l')} = ${F(`${V('P')} − ${V('w')}`, '2')}`, s => (s.P - s.w) / 2],
      [`${V('l')} = ${F(V('P'), '2')} + ${V('w')}`, s => s.P / 2 + s.w], [`${V('l')} = 2${V('P')} − ${V('w')}`, s => 2 * s.P - s.w]] },
  ];
  const LIT_STEPS = [
    ['Subtract 2<i>l</i> from both sides: <i>P</i> − 2<i>l</i> = 2<i>w</i>.', 'Divide both sides by 2.'],
    ['Multiply both sides by 2: 2<i>A</i> = <i>bh</i>.', 'Divide both sides by <i>b</i>.'],
    ['<i>t</i> is multiplied by <i>r</i>, so undo that.', 'Divide both sides by <i>r</i>.'],
    ['Subtract <i>b</i> from both sides: <i>y</i> − <i>b</i> = <i>mx</i>.', 'Divide both sides by <i>m</i>.'],
    ['<i>h</i> is multiplied by <i>l</i> and by <i>w</i>.', 'Divide both sides by the product <i>lw</i>.'],
    ['<i>r</i> is multiplied by <i>P</i> and by <i>t</i>.', 'Divide both sides by <i>Pt</i>.'],
    ['Subtract 32 from both sides: <i>F</i> − 32 = 9/5 · <i>C</i>.', 'Multiply both sides by 5/9, the reciprocal of 9/5.'],
    ['Subtract <i>P</i> from both sides: <i>A</i> − <i>P</i> = <i>Prt</i>.', 'Divide both sides by <i>Pr</i>.'],
    ['<i>r</i> is multiplied by 2π.', 'Divide both sides by 2π.'],
    ['Subtract <i>ax</i> from both sides: <i>by</i> = <i>c</i> − <i>ax</i>.', 'Divide both sides by <i>b</i>.'],
    ['Multiply both sides by 2: 2<i>A</i> = <i>h</i>(<i>b</i><sub>1</sub> + <i>b</i><sub>2</sub>).', 'Divide both sides by (<i>b</i><sub>1</sub> + <i>b</i><sub>2</sub>).'],
    ['<i>w</i> is multiplied by <i>l</i>.', 'Divide both sides by <i>l</i>.'],
    ['<i>h</i> is multiplied by π<i>r</i><sup>2</sup>.', 'Divide both sides by π<i>r</i><sup>2</sup>.'],
    ['Divide both sides by 180: <i>S</i>/180 = <i>n</i> − 2.', 'Add 2 to both sides.'],
    ['Subtract <i>b</i> from both sides: <i>y</i> − <i>b</i> = <i>mx</i>.', 'Divide both sides by <i>x</i>.'],
    ['Divide both sides by 2: <i>P</i>/2 = <i>l</i> + <i>w</i>.', 'Subtract <i>w</i> from both sides.'],
  ];
  /** y = (mn/md)x + kn/kd, all parts possibly fractions; lhs/rhs swap the letters (x in terms of y) */
  function lineFr(mn, md, kn, kd, lhs, rhs) {
    const t = coefVar(mn, md, rhs || 'x'), [sn, sd] = M.simp(kn, kd);
    const k = sn === 0 ? '' : (t ? (sn < 0 ? ' − ' : ' + ') : (sn < 0 ? '−' : '')) + F(Math.abs(sn), sd);
    return `${V(lhs || 'y')} = ${t || (k ? '' : '0')}${k}`;
  }

  A.skill({
    id: 'alg1.literal-equations', title: 'Rearranging formulas',
    learn: p(`A <b>literal equation</b> is an equation with several letters, like ${V('d')} = ${V('r')}${V('t')} (distance equals rate times time). Every formula is one. To solve it for one letter, treat all the other letters as if they were numbers and <b>undo the operations around the target letter</b> in reverse order, doing the same thing to both sides.`) +
      p(`Undo addition and subtraction first, then multiplication and division. If the target is multiplied by a group, divide by the whole group: in ${V('V')} = ${V('l')}${V('w')}${V('h')}, divide both sides by ${V('l')}${V('w')} to get ${V('h')} by itself.`) +
      p('To check, pick simple numbers for the other letters, work out the target, and make sure the original formula still balances.') +
      example('Example 1: a formula', `Solve ${V('P')} = 2${V('l')} + 2${V('w')} for ${V('l')}. Subtract 2${V('w')}: ${V('P')} − 2${V('w')} = 2${V('l')}. Divide by 2: <b>${V('l')} = ${F(`${V('P')} − 2${V('w')}`, '2')}</b>.`) +
      example('Example 2: solving a line for y', `Solve 3${X} − 4${Y} = 12 for ${Y}. Subtract 3${X}: −4${Y} = 12 − 3${X}. Divide every term by −4: ${Y} = −3 + ${F(3, 4)}${X}, which is <b>${Y} = ${F(3, 4)}${X} − 3</b>.`),
    make(rng) {
      if (rng.chance(0.35)) {
        const forX = rng.chance(0.4);
        const a = forX ? rng.sign() * rng.pick([2, 3, 4, 5]) : rng.nz(-6, 6), b = forX ? rng.nz(-6, 6) : rng.sign() * rng.pick([2, 3, 4, 5]), c = rng.nz(-12, 12);
        // solving for the letter with coefficient d (the other letter's coefficient is o): t = (−o/d)·other + c/d
        const [d, o, t, w] = forX ? [a, b, 'x', 'y'] : [b, a, 'y', 'x'];
        const opts = [[-o, d, c, d], [o, d, c, d], [-o, d, c * d, d], [-o, d, -c, d], [-d, o, c, d]];
        const html = opts.map(op => lineFr(...op, t, w));
        const answer = html[0], choices = [answer].concat(others(answer, html.slice(1), 3));
        return { prompt: `Solve for ${V(t)}.${big(`${sumHtml([[a, 'x', 1], [b, 'y', 1]])} = ${N(c)}`)}`, type: 'choice', choices, answer, params: { kind: 'num', t, a, b, c, opts, html },
          hints: [`${o < 0 ? 'Add' : 'Subtract'} ${M.term(Math.abs(o), w)} on both sides: ${M.term(d, t)} = ${sumHtml([[c, '', 0], [-o, w, 1]])}.`, `Divide every term by ${N(d)}.`, `<b>${answer}</b>.`] };
      }
      const idx = rng.int(0, LIT.length - 1), L = LIT[idx];
      const order = rng.shuffle([0, 1, 2, 3]);
      const choices = order.map(i => L.opts[i][0]);
      const answer = L.opts[0][0];
      return { prompt: `Solve the formula for ${V(L.t)}.${big(L.f)}`, type: 'choice', choices, answer, params: { kind: 'formula', idx },
        hints: [`Treat every letter except ${V(L.t)} as a number, and undo what is being done to ${V(L.t)}. ${LIT_STEPS[idx][0]}`, LIT_STEPS[idx][1], `<b>${answer}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'num') {
        const i = P.html.indexOf(q.answer); if (i < 0) return 'answer not among options';
        const [mn, md, kn, kd] = P.opts[i], other = u => mn / md * u + kn / kd;
        // put each trial value in for the free letter and the claimed expression for the solved one
        return [0, 1, 3].every(u => Math.abs(P.t === 'x' ? P.a * other(u) + P.b * u - P.c : P.a * u + P.b * other(u) - P.c) < 1e-9);
      }
      const L = LIT[P.idx], vals = [2.5, 4, 1.25, 3, 7];
      const s = {}; L.vars.forEach((v, i) => { s[v] = vals[i]; });
      const works = fn => { const t = Object.assign({}, s); t[L.t] = fn(t); return Math.abs(L.ok(t)) < 1e-9; };
      const right = L.opts.filter(o => works(o[1]));
      // exactly one option balances the formula, and it is the answer
      return right.length === 1 && right[0][0] === q.answer;
    },
  });

  const andH = (l, o1, o2, r) => `${N(l)} ${OPH[o1]} ${X} ${OPH[o2]} ${N(r)}`;
  const orH = (o1, l, o2, r) => `${X} ${OPH[o1]} ${N(l)} or ${X} ${OPH[o2]} ${N(r)}`;
  /** read "a < x ≤ b" or "x < a or x ≥ b" back into a test function */
  function parseCompound(html) {
    const s = plain(html);
    let m = s.match(/^(-?[\d.]+) ([<>≤≥]) x ([<>≤≥]) (-?[\d.]+)$/);
    if (m) return t => holds(+m[1], m[2], t) && holds(t, m[3], +m[4]);
    m = s.match(/^x ([<>≤≥]) (-?[\d.]+) or x ([<>≤≥]) (-?[\d.]+)$/);
    if (m) return t => holds(t, m[1], +m[2]) || holds(t, m[3], +m[4]);
    return null;
  }

  A.skill({
    id: 'alg1.compound-inequalities', title: 'Compound inequalities',
    learn: p(`A <b>compound inequality</b> joins two conditions on the same variable. With <b>and</b>, a number must satisfy both, so the solutions are the overlap. It’s often written as one three-part statement, such as −2 &lt; ${X} ≤ 5, which says ${X} is between −2 and 5 and may equal 5. With <b>or</b>, a number only needs to satisfy one of the two, as in ${X} &lt; −1 or ${X} &gt; 4.`) +
      p(`Solve a three-part inequality by doing the same step to <b>all three parts</b>. Multiplying or dividing by a negative number <b>flips every inequality sign</b>; afterward, rewrite the statement with the smaller number on the left.`) +
      p('For an “or” inequality, solve each half on its own, then keep the word “or” between the two answers.') +
      example('Example 1: a three-part inequality', `${big(`−7 &lt; −2${X} + 1 ≤ 9`)}Subtract 1 from all three parts: −8 &lt; −2${X} ≤ 8. Divide by −2 and flip both signs: 4 &gt; ${X} ≥ −4. Smaller number first: <b>−4 ≤ ${X} &lt; 4</b>.`) +
      example('Example 2: an “or” inequality', `${big(`2${X} + 1 &lt; −5 &nbsp;or&nbsp; 3${X} − 4 ≥ 8`)}First half: subtract 1, then divide by 2: ${X} &lt; −3. Second half: add 4, then divide by 3: ${X} ≥ 4. Together: <b>${X} &lt; −3 or ${X} ≥ 4</b>.`),
    make(rng) {
      if (rng.chance(0.6)) {
        const L = rng.int(-8, 3), R = L + rng.int(2, 9), b = rng.nz(-5, 5), c = rng.nz(-9, 9);
        const sL = rng.pick(['<', '≤']), sR = rng.pick(['<', '≤']);
        const [lo, opLo, opHi, hi] = b > 0 ? [b * L + c, sL, sR, b * R + c] : [b * R + c, sR, sL, b * L + c];
        const mid = sumHtml([[b, 'x', 1], [c, '', 0]]);
        const answer = andH(L, sL, sR, R);
        const wrong = [andH(L, SOFT[sL], SOFT[sR], R), orH('<', L, '>', R), andH(-R, sR, sL, -L), andH(Math.min(lo - c, hi - c), sL, sR, Math.max(lo - c, hi - c)), andH(lo, opLo, opHi, hi)];
        return { prompt: `Solve the compound inequality.${big(`${N(lo)} ${OPH[opLo]} ${mid} ${OPH[opHi]} ${N(hi)}`)}`, type: 'choice', choices: [answer].concat(others(answer, wrong, 3)), answer, params: { kind: 'and', lo, opLo, b, c, opHi, hi },
          hints: [`${c < 0 ? 'Add' : 'Subtract'} ${N(Math.abs(c))} in all three parts: ${N(lo - c)} ${OPH[opLo]} ${M.term(b, 'x')} ${OPH[opHi]} ${N(hi - c)}.`,
            b > 0 ? `Divide all three parts by ${N(b)}. It is positive, so the signs stay: ${andH(L, sL, sR, R)}.` : `Divide all three parts by ${N(b)}. It is negative, so both signs flip: ${N(R)} ${OPH[FLIP[sR]]} ${X} ${OPH[FLIP[sL]]} ${N(L)}. Then rewrite with the smaller number first.`,
            `<b>${answer}</b>.`] };
      }
      const P = rng.int(-9, 2), Q = P + rng.int(2, 8), opA = rng.pick(['<', '≤']), opB = rng.pick(['>', '≥']);
      const make1 = (op, val) => { const a = rng.nz(-5, 5), k = rng.nz(-9, 9); return [a, k, a > 0 ? op : FLIP[op], a * val + k]; };
      const ineqs = [make1(opA, P), make1(opB, Q)];
      const show = ([a, k, o, r]) => `${sumHtml([[a, 'x', 1], [k, '', 0]])} ${OPH[o]} ${N(r)}`;
      const answer = orH(opA, P, opB, Q);
      const wrong = [orH(FLIP[opA], P, opB, Q), orH(opA, P, FLIP[opB], Q), andH(P, SOFT[opA] === '<' ? '<' : '≤', '<', Q), orH(FLIP[opA], P, FLIP[opB], Q)];
      const step = ([a, k, o, r], op, val) => `${k < 0 ? 'Add' : 'Subtract'} ${N(Math.abs(k))}, then divide by ${N(a)}${a < 0 ? ' and flip the sign' : ''}: ${X} ${OPH[op]} ${N(val)}.`;
      return { prompt: `Solve the compound inequality.${big(`${show(ineqs[0])} &nbsp;or&nbsp; ${show(ineqs[1])}`)}`, type: 'choice', choices: [answer].concat(others(answer, wrong, 3)), answer, params: { kind: 'or', ineqs },
        hints: [`Solve each half separately. First: ${step(ineqs[0], opA, P)}`, `Second: ${step(ineqs[1], opB, Q)}`, `Join them with "or": <b>${answer}</b>.`] };
    },
    verify(q) {
      const P = q.params, test = parseCompound(q.answer);
      if (!test) return 'could not read ' + plain(q.answer);
      const orig = P.kind === 'and' ? t => holds(P.lo, P.opLo, P.b * t + P.c) && holds(P.b * t + P.c, P.opHi, P.hi)
        : t => P.ineqs.some(([a, k, o, r]) => holds(a * t + k, o, r));
      for (let t = -40; t <= 40; t += 0.25) if (orig(t) !== test(t)) return 'differs at ' + t;
      return true;
    },
  });

  /* unit conversion: SI values let verify() convert by a different route from the friendly factors */
  const BASE = { in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344, cm: 0.01, m: 1, km: 1000, s: 1, min: 60, h: 3600, day: 86400, wk: 604800, cup: 0.2365882365, qt: 0.946352946, gal: 3.785411784, oz: 0.028349523125, lb: 0.45359237 };
  const UNAME = { in: ['inch', 'inches'], ft: ['foot', 'feet'], yd: ['yard', 'yards'], mi: ['mile', 'miles'], cm: ['centimeter', 'centimeters'], m: ['meter', 'meters'], km: ['kilometer', 'kilometers'], s: ['second', 'seconds'], min: ['minute', 'minutes'], h: ['hour', 'hours'], day: ['day', 'days'], wk: ['week', 'weeks'], cup: ['cup', 'cups'], qt: ['quart', 'quarts'], gal: ['gallon', 'gallons'], oz: ['ounce', 'ounces'], lb: ['pound', 'pounds'] };
  const SINGLE = [
    ['ft', 'in', 12, 1, [2, 3, 4, 5, 6, 7, 8, 9, 11, 15]], ['yd', 'ft', 3, 1, [4, 6, 7, 9, 12, 15, 20, 25]], ['mi', 'ft', 5280, 1, [2, 3, 4, 0.5, 1.5]],
    ['h', 's', 3600, 1, [2, 3, 4, 5, 0.5]], ['km', 'cm', 100000, 1, [2, 3, 4, 0.5, 1.2]], ['gal', 'cup', 16, 1, [2, 3, 5, 0.5, 1.5, 4]],
    ['lb', 'oz', 16, 1, [3, 4, 5, 2.5, 0.25, 7]], ['in', 'ft', 1, 12, [18, 30, 42, 48, 60, 84, 96]], ['min', 'h', 1, 60, [45, 90, 150, 210, 270, 15]],
    ['cm', 'm', 1, 100, [250, 345, 80, 1200, 5]], ['day', 'min', 1440, 1, [2, 3, 0.5]],
  ];
  // [top from, bottom from, top to, bottom to, factor num, factor den, values, hint for the top, hint for the bottom]
  const RATES = [
    ['mi', 'h', 'ft', 's', 22, 15, [15, 30, 45, 60, 75], '1 mile = 5,280 feet, so multiply by 5,280.', '1 hour = 3,600 seconds. Per second is a smaller slice than per hour, so divide by 3,600.'],
    ['m', 's', 'km', 'h', 18, 5, [5, 10, 15, 20, 25, 12, 30], '1 kilometer = 1,000 meters, so divide by 1,000.', '1 hour = 3,600 seconds, so a rate per hour is 3,600 times the rate per second: multiply by 3,600.'],
    ['km', 'h', 'm', 'min', 50, 3, [6, 12, 18, 24, 30, 48, 60, 90], '1 kilometer = 1,000 meters, so multiply by 1,000.', '1 hour = 60 minutes, so per minute is 60 times smaller: divide by 60.'],
    ['ft', 'min', 'in', 's', 1, 5, [30, 45, 60, 90, 120, 150], '1 foot = 12 inches, so multiply by 12.', '1 minute = 60 seconds, so per second is 60 times smaller: divide by 60.'],
    ['gal', 'h', 'qt', 'min', 1, 15, [30, 45, 60, 90, 120], '1 gallon = 4 quarts, so multiply by 4.', '1 hour = 60 minutes, so per minute is 60 times smaller: divide by 60.'],
    ['oz', 'day', 'lb', 'wk', 7, 16, [16, 32, 48, 64, 8], '16 ounces = 1 pound, so divide by 16.', '1 week = 7 days, so per week is 7 times bigger: multiply by 7.'],
    ['cup', 'min', 'gal', 'h', 15, 4, [2, 4, 8, 1, 6], '16 cups = 1 gallon, so divide by 16.', '1 hour = 60 minutes, so per hour is 60 times bigger: multiply by 60.'],
  ];
  const un = (u, k) => UNAME[u][k === 1 ? 0 : 1];
  /* everyday settings: for one unit, (amount, name) → a sentence that names the amount; for a rate, (rate, name) → the same */
  const SINGLE_CTX = {
    'ft>in': [(U, n) => `${n} cuts a plank ${U} long for a garden fence.`, U => `A hallway rug is ${U} long.`],
    'yd>ft': [U => `A community garden bed is ${U} long.`, (U, n) => `${n} buys ${U} of fabric for a costume.`],
    'mi>ft': [(U, n) => `${n} walks ${U} to school.`, U => `A charity fun run is ${U} long.`],
    'h>s': [U => `A bus trip across town takes ${U}.`, (U, n) => `${n}’s shift at the library lasts ${U}.`],
    'km>cm': [U => `A bike trail through a park is ${U} long.`, U => `A relay race covers ${U}.`],
    'gal>cup': [U => `A pot of soup for a shelter dinner holds ${U}.`, (U, n) => `${n} fills a cooler with ${U} of water.`],
    'lb>oz': [U => `A baker measures out ${U} of flour.`, (U, n) => `${n} mails a package that weighs ${U}.`],
    'in>ft': [U => `A sunflower grew ${U} tall.`, U => `A carpenter cuts a piece of trim ${U} long.`],
    'min>h': [(U, n) => `${n} spends ${U} on a science project.`, U => `A field trip bus ride takes ${U}.`],
    'cm>m': [U => `A ribbon for a school banner is ${U} long.`, U => `A measuring tape is pulled out to ${U}.`],
    'day>min': [U => `A camping trip lasts ${U}.`, (U, n) => `${n}’s family visits relatives for ${U}.`],
  };
  const RATE_CTX = [
    [R => `A car travels at ${R}.`, R => `A delivery van drives at ${R}.`],
    [R => `A gust of wind is measured at ${R}.`, R => `A drone flies at ${R}.`],
    [R => `A drone flies at ${R}.`, R => `A car on a test track drives at ${R}.`],
    [R => `A conveyor belt in a bakery moves at ${R}.`, R => `An escalator at a train station moves at ${R}.`],
    [R => `A garden sprinkler uses water at ${R}.`, R => `A pump drains a flooded basement at ${R}.`],
    [R => `A bakery uses yeast at ${R}.`, R => `A community garden uses fertilizer at ${R}.`],
    [R => `A faucet left running pours out ${R}.`, R => `A park’s drinking fountain pours out ${R}.`],
  ];

  A.skill({
    id: 'alg1.unit-conversion', title: 'Converting units and rates',
    learn: p(`To change units, multiply by a <b>conversion factor</b>: a fraction whose top and bottom are the same amount written in different units, such as ${F('12 in', '1 ft', { raw: true })}. It equals 1, so it changes the units but not the amount. Arrange it so the unit you want to get rid of appears once on top and once on the bottom; then it cancels.`) +
      p(`A <b>rate</b> compares two units, like miles per hour, with one unit on top and one on the bottom. Convert each unit with its own factor. Ask yourself whether the number should get bigger or smaller: a mile is many feet, so the top number grows; a second is much shorter than an hour, so you cover less distance per second.`) +
      example('Example 1: one unit', `Convert 2.5 pounds to ounces. There are 16 ounces in a pound: 2.5 lb × ${F('16 oz', '1 lb', { raw: true })} = <b>40 ounces</b>. Pounds cancel, and the number gets bigger because an ounce is smaller than a pound.`) +
      example('Example 2: a rate', `Convert 45 miles per hour to feet per second. ${F('45 mi', '1 h', { raw: true })} × ${F('5,280 ft', '1 mi', { raw: true })} × ${F('1 h', '3,600 s', { raw: true })} = ${F('237,600 ft', '3,600 s', { raw: true })} = <b>66 feet per second</b>.`),
    make(rng) {
      if (rng.chance(0.45)) {
        const i = rng.int(0, SINGLE.length - 1), [from, to, num, den, vals] = SINGLE[i], v = rng.pick(vals);
        const ans = M.round(v * num / den, 6);
        const U = `${N(v)} ${un(from, v)}`, how = rng.int(0, 2);
        const prompt = how === 2 ? `Convert ${U} to ${un(to, 2)}.` : `${SINGLE_CTX[from + '>' + to][how](U, rng.pick(NAMES))} How many ${un(to, 2)} is that?`;
        return { prompt, type: 'number', answer: ans, unit: to, params: { kind: 'single', from, to, v },
          hints: [num > 1 ? `There are ${N(num)} ${un(to, 2)} in 1 ${un(from, 1)}, so you will get a bigger number: multiply by ${N(num)}.` : `There are ${N(den)} ${un(from, 2)} in 1 ${un(to, 1)}, so you will get a smaller number: divide by ${N(den)}.`,
            `${N(v)} ${num > 1 ? '×' : '÷'} ${N(num > 1 ? num : den)} = <b>${N(ans)} ${un(to, ans)}</b>.`] };
      }
      const i = rng.int(0, RATES.length - 1), [f1, f2, t1, t2, num, den, vals, h1, h2] = RATES[i], v = rng.pick(vals);
      const ans = M.round(v * num / den, 6), name = rng.pick(NAMES);
      const R = `${N(v)} ${un(f1, 2)} per ${un(f2, 1)}`, how = rng.int(0, 3);
      const ctx = how === 3 ? `Convert ${R} to ${un(t1, 2)} per ${un(t2, 1)}.` : how === 2 ? `${name} measures a rate of ${R}. What is that rate in ${un(t1, 2)} per ${un(t2, 1)}?` : `${RATE_CTX[i][how](R)} What is that rate in ${un(t1, 2)} per ${un(t2, 1)}?`;
      return { prompt: ctx, type: 'number', answer: ans, unit: `${t1}/${t2}`, params: { kind: 'rate', f1, f2, t1, t2, v },
        hints: [`Convert the top unit: ${h1}`, `Convert the bottom unit: ${h2}`, `Altogether: ${N(v)} × ${F(num, den)} = <b>${N(ans)} ${un(t1, 2)} per ${un(t2, 1)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      const expect = P.kind === 'single' ? P.v * BASE[P.from] / BASE[P.to] : P.v * (BASE[P.f1] / BASE[P.t1]) * (BASE[P.t2] / BASE[P.f2]);
      return Math.abs(expect - q.answer) <= 1e-7 * Math.max(1, Math.abs(expect));
    },
  });

  /* ---------- Unit 3: Linear equations and graphs ---------- */
  /** a reduced slope [n, d], d > 0 */
  function pickSlope(rng, dens, maxN) {
    const d = rng.pick(dens); let n = rng.nz(-(maxN || 5), maxN || 5);
    while (M.gcd(n, d) !== 1) n += n > 0 ? 1 : -1;
    return [n, d];
  }
  const slopeHint = (x1, y1, x2, y2) => `Slope = ${F('change in <i>y</i>', 'change in <i>x</i>', { raw: true })} = ${F(`${N(y2)} − ${wrap(y1)}`, `${N(x2)} − ${wrap(x1)}`)} = ${F(`${N(y2 - y1)}`, `${N(x2 - x1)}`)}.`;

  A.skill({
    id: 'alg1.slope', title: 'Slope',
    learn: p(`The <b>slope</b> of a line measures how steep it is: how much ${Y} changes for each step of 1 in ${X}. The <b>rise</b> is the vertical change between two points on the line, and the <b>run</b> is the horizontal change. For points (${M.sub(X, 1)}, ${M.sub(Y, 1)}) and (${M.sub(X, 2)}, ${M.sub(Y, 2)}), <b>slope = rise ÷ run = (${M.sub(Y, 2)} − ${M.sub(Y, 1)}) ÷ (${M.sub(X, 2)} − ${M.sub(X, 1)})</b>.`) +
      p('A line that goes up from left to right has a positive slope; one that goes down has a negative slope; a flat line has slope 0. Subtract the coordinates in the same order on the top and the bottom, or the sign comes out wrong.') +
      p('In a table, the slope is the change in the output divided by the change in the input between any two rows. It’s the same for every pair of rows, and that’s what makes the relationship linear.') +
      example('Example 1: two points', `Through ${M.pt(-2, 5)} and ${M.pt(4, 2)}: slope = ${F('2 − 5', '4 − (−2)', { raw: true })} = ${F('−3', '6', { raw: true })} = <b>−${F(1, 2)}</b>. The line goes down as you move right.`) +
      example('Example 2: a table', `${M.table([X, Y], [['1', '4'], ['3', '10'], ['5', '16']])}From the first row to the second, ${Y} goes up 6 while ${X} goes up 2, so the slope is ${F('6', '2', { raw: true })} = <b>3</b>. Any other pair of rows gives 3 too.`) +
      example('Example 3: a graph', `${grid({ lines: [[-4, -1, 2, 3]], dots: [[-4, -1], [2, 3]], riseRun: [-4, -1, 2, 3], label: 'A line through the points (−4, −1) and (2, 3), with a run of 6 to the right and a rise of 4 marked between them' })}Pick two points where the line crosses grid corners, (−4, −1) and (2, 3). Going from one to the other, the run is 6 and the rise is 4, so the slope is ${F('4', '6', { raw: true })} = <b>${F(2, 3)}</b>.`),
    make(rng) {
      const kind = rng.pick(['points', 'points', 'table', 'graph']);
      let x1, y1, x2, y2, prompt;
      if (kind === 'graph') {
        x1 = rng.int(-5, 2); x2 = x1 + rng.int(1, 4); y1 = rng.int(-5, 5); y2 = rng.int(-5, 5);
        prompt = `What is the slope of this line? Both dots sit exactly on grid points.${grid({ lines: [[x1, y1, x2, y2]], dots: [[x1, y1], [x2, y2]], label: `A line on a coordinate grid through two marked points, (${N(x1)}, ${N(y1)}) and (${N(x2)}, ${N(y2)})` })}`;
      } else if (kind === 'table') {
        const x0 = rng.int(-3, 3), dx = rng.pick([1, 2, 3]), dy = rng.nz(-6, 6), y0 = rng.int(-10, 10);
        const rows = [0, 1, 2, 3].map(i => [x0 + i * dx, y0 + i * dy]);
        [x1, y1] = rows[0]; [x2, y2] = rows[3];
        prompt = `The table shows points on a line. What is its slope?${M.table([X, Y], rows.map(r => r.map(N)))}`;
      } else {
        x1 = rng.int(-9, 9); x2 = rng.int(-9, 9); if (x2 === x1) x2 = x1 + rng.pick([-3, 2, 5]);
        y1 = rng.int(-9, 9); y2 = rng.int(-9, 9);
        prompt = `What is the slope of the line through ${M.pt(x1, y1)} and ${M.pt(x2, y2)}?`;
      }
      const [sn, sd] = M.simp(y2 - y1, x2 - x1);
      const hints = [kind === 'graph' ? `Read the two dots: ${M.pt(x1, y1)} and ${M.pt(x2, y2)}.` : kind === 'table' ? `Use any two rows, for example the first and the last: ${M.pt(x1, y1)} and ${M.pt(x2, y2)}.` : `Call ${M.pt(x1, y1)} the first point and ${M.pt(x2, y2)} the second.`,
        slopeHint(x1, y1, x2, y2), `Simplify: the slope is <b>${slopeText(sn, sd)}</b>.`];
      return { prompt, type: 'number', answer: sn / sd, answerText: slopeText(sn, sd), params: { kind, x1, y1, x2, y2 }, hints };
    },
    verify(q) { const P = q.params; return P.x1 !== P.x2 && Math.abs(q.answer * (P.x2 - P.x1) - (P.y2 - P.y1)) < 1e-9; },
  });

  /** y − y₁ = m(x − x₁) */
  const psH = (m, x1, y1) => `${Y} ${M.signed(-y1)} = ${m === 1 ? '' : m === -1 ? '−' : N(m)}(${X} ${M.signed(-x1)})`;

  A.skill({
    id: 'alg1.linear-forms', title: 'Forms of linear equations',
    learn: p(`A line can be written in three common ways. <b>Slope-intercept form</b>, ${Y} = ${V('m')}${X} + ${V('b')}, shows the slope ${V('m')} and the <b>${Y}-intercept</b> ${V('b')}, the ${Y}-value where the line crosses the ${Y}-axis. <b>Point-slope form</b>, ${Y} − ${M.sub(Y, 1)} = ${V('m')}(${X} − ${M.sub(X, 1)}), shows the slope and one point ${M.pt(V('x') + '<sub>1</sub>', V('y') + '<sub>1</sub>')} on the line. <b>Standard form</b>, ${V('A')}${X} + ${V('B')}${Y} = ${V('C')}, makes the intercepts easy to find.`) +
      p(`To write ${Y} = ${V('m')}${X} + ${V('b')} from a slope and a point, put the point’s coordinates into the equation and solve for ${V('b')}. From two points, find the slope first. For a line in standard form, set ${Y} = 0 to find the <b>${X}-intercept</b> (where it crosses the ${X}-axis) and ${X} = 0 to find the ${Y}-intercept.`) +
      example('Example 1: a slope and a point', `Slope 3 through ${M.pt(2, 1)}: 1 = 3(2) + ${V('b')}, so ${V('b')} = −5 and the line is <b>${Y} = 3${X} − 5</b>. In point-slope form the same line is ${psH(3, 2, 1)}; distributing gives ${Y} − 1 = 3${X} − 6, and adding 1 brings back ${Y} = 3${X} − 5.`) +
      example('Example 2: two points', `Through ${M.pt(1, 2)} and ${M.pt(3, 8)}: the slope is ${F('8 − 2', '3 − 1', { raw: true })} = 3. Then 2 = 3(1) + ${V('b')}, so ${V('b')} = −1: <b>${Y} = 3${X} − 1</b>.`) +
      example('Example 3: standard form', `${big(`2${X} + 5${Y} = 10`)}${Y} = 0 gives 2${X} = 10, so the ${X}-intercept is <b>5</b>. ${X} = 0 gives 5${Y} = 10, so the ${Y}-intercept is <b>2</b>. Solving for ${Y}, ${Y} = −${F(2, 5)}${X} + 2, so the slope is <b>−${F(2, 5)}</b>.`),
    make(rng) {
      const kind = rng.pick(['slope-point', 'two-points', 'standard', 'point-slope', 'write-ps']);
      if (kind === 'standard') {
        const a = rng.nz(-6, 6), b = rng.nz(-6, 6), k = rng.nz(-3, 3), c = a * b * k, ask = rng.pick(['slope', 'yint', 'xint']);
        const eq = `${sumHtml([[a, 'x', 1], [b, 'y', 1]])} = ${N(c)}`;
        const [sn, sd] = M.simp(-a, b);
        if (ask === 'slope') return { prompt: `What is the slope of this line?${big(eq)}`, type: 'number', answer: sn / sd, answerText: slopeText(sn, sd), params: { kind, ask, a, b, c },
          hints: [`Solve for ${Y}: ${a < 0 ? 'add' : 'subtract'} ${M.term(Math.abs(a), 'x')} on both sides, giving ${M.term(b, 'y')} = ${sumHtml([[-a, 'x', 1], [c, '', 0]])}.`, `Divide by ${N(b)}: ${lineFr(-a, b, c, b)}.`, `The slope is the coefficient of ${X}: <b>${slopeText(sn, sd)}</b>.`] };
        const yi = ask === 'yint';
        return { prompt: `At what value of ${yi ? Y : X} does this line cross the ${yi ? Y : X}-axis?${big(eq)}`, type: 'number', answer: yi ? a * k : b * k, params: { kind, ask, a, b, c },
          hints: [`On the ${yi ? Y : X}-axis, ${yi ? X : Y} = 0. Put 0 in for ${yi ? X : Y}.`, yi ? `${M.term(b, 'y')} = ${N(c)}, so ${Y} = ${N(c)} ÷ ${wrap(b)}.` : `${M.term(a, 'x')} = ${N(c)}, so ${X} = ${N(c)} ÷ ${wrap(a)}.`, `The line crosses at <b>${N(yi ? a * k : b * k)}</b>, the point ${yi ? M.pt(0, a * k) : M.pt(b * k, 0)}.`] };
      }
      if (kind === 'point-slope' || kind === 'write-ps') {
        const m = rng.nz(-5, 5), x1 = rng.nz(-6, 6), y1 = rng.nz(-6, 6), b = y1 - m * x1;
        if (kind === 'write-ps') {
          const answer = psH(m, x1, y1), wrong = [psH(m, -x1, -y1), psH(m, y1, x1), psH(m, -x1, y1), psH(-m, x1, y1)];
          return { prompt: `Which equation is in point-slope form for the line with slope ${N(m)} through ${M.pt(x1, y1)}?`, type: 'choice', choices: [answer].concat(others(answer, wrong, 3)), answer, params: { kind, m, x1, y1 },
            hints: [`Point-slope form is ${Y} − ${M.sub(Y, 1)} = ${V('m')}(${X} − ${M.sub(X, 1)}): the point's coordinates are <b>subtracted</b>.`, `Here ${M.sub(X, 1)} = ${N(x1)} and ${M.sub(Y, 1)} = ${N(y1)}, so ${Y} − ${wrap(y1)} = ${N(m)}(${X} − ${wrap(x1)}).`, `Tidy the signs: <b>${answer}</b>.`] };
        }
        const answer = lineEq(m, 1, b), wrong = [lineEq(m, 1, y1 + m * x1), lineEq(m, 1, -b), lineEq(m, 1, y1 - x1), lineEq(-m, 1, b)];
        return { prompt: `Rewrite in slope-intercept form.${big(psH(m, x1, y1))}`, type: 'choice', choices: [answer].concat(others(answer, wrong, 3)), answer, params: { kind, m, x1, y1, mn: m, md: 1, b },
          hints: [`Distribute ${N(m)} on the right: ${Y} ${M.signed(-y1)} = ${sumHtml([[m, 'x', 1], [-m * x1, '', 0]])}.`, `${y1 > 0 ? 'Add' : 'Subtract'} ${N(Math.abs(y1))} on both sides: ${Y} = ${sumHtml([[m, 'x', 1], [-m * x1, '', 0]])} ${M.signed(y1)}.`, `<b>${answer}</b>.`] };
      }
      const [mn, md] = pickSlope(rng, [1, 1, 1, 2, 3], 5), b = rng.int(-8, 8), x1 = md * rng.int(-3, 3), y1 = mn * x1 / md + b;
      const answer = lineEq(mn, md, b);
      const wrong = [lineEq(mn, md, y1 + mn * x1 / md), lineEq(mn, md, -b), lineEq(-mn, md, b), lineEq(mn, md, y1), lineEq(md, 1, b)];
      if (kind === 'two-points') {
        const x2 = x1 + md * rng.int(1, 3), y2 = mn * x2 / md + b;
        return { prompt: `Which equation, in slope-intercept form, describes the line through ${M.pt(x1, y1)} and ${M.pt(x2, y2)}?`, type: 'choice', choices: [answer].concat(others(answer, wrong, 3)), answer, params: { kind, mn, md, b, pts: [[x1, y1], [x2, y2]] },
          hints: [slopeHint(x1, y1, x2, y2), `Put one point into ${Y} = ${V('m')}${X} + ${V('b')}: ${N(y1)} = ${frHtml(mn, md)} · ${wrap(x1)} + ${V('b')}, so ${V('b')} = ${N(b)}.`, `<b>${answer}</b>.`] };
      }
      return { prompt: `A line has slope ${frHtml(mn, md)} and passes through ${M.pt(x1, y1)}. Which equation, in slope-intercept form, describes it?`, type: 'choice', choices: [answer].concat(others(answer, wrong, 3)), answer, params: { kind, mn, md, b, pts: [[x1, y1]] },
        hints: [`Start from ${Y} = ${V('m')}${X} + ${V('b')} with ${V('m')} = ${frHtml(mn, md)}, and put in the point: ${N(y1)} = ${frHtml(mn, md)} · ${wrap(x1)} + ${V('b')}.`, `${frHtml(mn, md)} · ${wrap(x1)} = ${N(mn * x1 / md)}, so ${V('b')} = ${N(y1)} − ${wrap(mn * x1 / md)} = ${N(b)}.`, `<b>${answer}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'standard') return P.ask === 'slope' ? Math.abs(q.answer * P.b + P.a) < 1e-9 : P.ask === 'yint' ? q.answer * P.b === P.c : q.answer * P.a === P.c;
      if (P.kind === 'write-ps') return q.answer === psH(P.m, P.x1, P.y1) && P.m * (P.x1 + 2 - P.x1) === P.m * 2;
      if (P.kind === 'point-slope') return q.answer === lineEq(P.m, 1, P.b) && [P.x1, P.x1 + 3].every(x => P.m * x + P.b - P.y1 === P.m * (x - P.x1));
      return q.answer === lineEq(P.mn, P.md, P.b) && P.pts.every(([x, y]) => y * P.md === P.mn * x + P.b * P.md);
    },
  });

  const REL = ['Parallel', 'Perpendicular', 'Neither'];
  A.skill({
    id: 'alg1.parallel-perpendicular', title: 'Parallel and perpendicular lines',
    learn: p(`<b>Parallel lines</b> never meet, so they have the <b>same slope</b> (and different ${Y}-intercepts). <b>Perpendicular lines</b> cross at a right angle, and their slopes are <b>negative reciprocals</b>: flip the fraction and change its sign. The product of two perpendicular slopes is −1.`) +
      p(`A line with slope ${F(2, 3)} is perpendicular to any line with slope −${F(3, 2)}, and a slope of −4 pairs with ${F(1, 4)}. To compare lines written in standard form, solve each one for ${Y} first so you can read its slope.`) +
      grid({ lines: [{ pts: [0, 3, 1, 5], label: 'slope 2', at: [-4.6, -1] }, { pts: [2, 2, 3, 4], label: 'slope 2', at: [4.6, 2.6] }, { pts: [0, 3, 2, 2], dash: true, label: 'slope −½', at: [-3.4, 5.4] }], square: [2, 2, 1, 2, 2, -1], label: 'Two parallel lines, y = 2x + 3 and y = 2x − 2, both with slope 2, and a dashed line y = −½x + 3 with slope −½ that crosses both of them at right angles' }) +
      example('Example 1: slopes from standard form', `${big(`3${X} + 4${Y} = 8`)}Solve for ${Y}: ${Y} = −${F(3, 4)}${X} + 2, so the slope is −${F(3, 4)}. A parallel line has slope <b>−${F(3, 4)}</b>; a perpendicular line has slope <b>${F(4, 3)}</b>.`) +
      example('Example 2: parallel, perpendicular, or neither', `${big(`${Y} = 2${X} + 1 <br> ${X} + 2${Y} = 6`)}The second line is ${Y} = −${F(1, 2)}${X} + 3. The slopes are 2 and −${F(1, 2)}, and 2 · (−${F(1, 2)}) = −1, so the lines are <b>perpendicular</b>.`) +
      example('Example 3: a line through a point', `Find the line through ${M.pt(4, 1)} perpendicular to ${Y} = 2${X} + 7. The new slope is −${F(1, 2)}. Then 1 = −${F(1, 2)}(4) + ${V('b')}, so ${V('b')} = 3: <b>${Y} = −${F(1, 2)}${X} + 3</b>.`),
    make(rng) {
      const kind = rng.pick(['slope', 'slope', 'classify', 'through']);
      const [mn, md] = pickSlope(rng, [1, 1, 2, 3, 4], 6);
      const want = rng.pick(['parallel', 'perpendicular']);
      const [tn, td] = want === 'parallel' ? [mn, md] : M.simp(-md, mn);
      if (kind === 'slope') {
        const std = rng.bool(), b = rng.int(-9, 9);
        let shown;
        if (std) { const k = rng.pick([1, 2, 3]) * rng.sign(); shown = `${sumHtml([[-mn * k, 'x', 1], [md * k, 'y', 1]])} = ${N(b * md * k)}`; } else shown = lineEq(mn, md, b);
        return { prompt: `What is the slope of a line ${want} to this one?${big(shown)}`, type: 'number', answer: tn / td, answerText: slopeText(tn, td), params: { kind, want, mn, md },
          hints: [std ? `Solve for ${Y} to read the slope: it is ${slopeText(mn, md)}.` : `The given line has slope ${slopeText(mn, md)}.`,
            want === 'parallel' ? 'Parallel lines have equal slopes.' : `Perpendicular slopes are negative reciprocals: flip ${slopeText(mn, md)} and change the sign.`, `The slope is <b>${slopeText(tn, td)}</b>.`] };
      }
      if (kind === 'classify') {
        const rel = rng.pick(['par', 'perp', 'neither']);
        let [n2, d2] = rel === 'par' ? [mn, md] : rel === 'perp' ? M.simp(-md, mn) : rng.pick([M.simp(-mn, md), M.simp(md, mn), M.simp(mn + md, md)]);
        const b1 = rng.int(-8, 8); let b2 = rng.int(-8, 8); if (b2 === b1) b2 = b1 + 3;
        const second = rng.bool() ? lineEq(n2, d2, b2) : `${sumHtml([[-n2, 'x', 1], [d2, 'y', 1]])} = ${N(b2 * d2)}`;
        const prod = (mn * n2) / (md * d2), answer = mn * d2 === n2 * md ? REL[0] : Math.abs(prod + 1) < 1e-12 ? REL[1] : REL[2];
        return { prompt: `Are these two lines parallel, perpendicular, or neither?${big(`${lineEq(mn, md, b1)} <br> ${second}`)}`, type: 'choice', choices: REL.slice(), keepOrder: true, answer, params: { kind, mn, md, n2, d2 },
          hints: [`Find each slope. The first line has slope ${slopeText(mn, md)}, the second ${slopeText(n2, d2)}.`, `Equal slopes mean parallel; slopes whose product is −1 mean perpendicular. Here the product is ${slopeText(mn * n2, md * d2)}.`, `<b>${answer}</b>.`] };
      }
      const px = td * rng.int(-3, 3), b2 = rng.int(-7, 7), py = tn * px / td + b2, b1 = rng.int(-6, 6);
      const answer = lineEq(tn, td, b2);
      const [on, od] = want === 'parallel' ? M.simp(-md, mn) : [mn, md];
      const wrong = [lineEq(tn, td, b1 === b2 ? b2 + 2 : b1), lineEq(tn, td, py + tn * px / td), lineEq(on, od, b2), lineEq(-tn, td, b2)];
      return { prompt: `Which line passes through ${M.pt(px, py)} and is ${want} to ${lineEq(mn, md, b1)}?`, type: 'choice', choices: [answer].concat(others(answer, wrong, 3)), answer, params: { kind, want, mn, md, tn, td, px, py, b2 },
        hints: [want === 'parallel' ? `A parallel line has the same slope, ${slopeText(mn, md)}.` : `A perpendicular line has the negative reciprocal slope: ${slopeText(tn, td)}.`, `Put the point in ${Y} = ${V('m')}${X} + ${V('b')}: ${N(py)} = ${frHtml(tn, td)} · ${wrap(px)} + ${V('b')}, so ${V('b')} = ${N(b2)}.`, `<b>${answer}</b>.`] };
    },
    challenge(rng) {
      // the given line in standard form, with a fraction slope
      const [mn, md] = pickSlope(rng, [2, 3, 4, 5], 6), want = rng.pick(['parallel', 'perpendicular']);
      const [tn, td] = want === 'parallel' ? [mn, md] : M.simp(-md, mn), [on, od] = want === 'parallel' ? M.simp(-md, mn) : [mn, md];
      const k = rng.sign() * rng.pick([1, 2]), b1 = rng.int(-6, 6), shown = `${sumHtml([[-mn * k, 'x', 1], [md * k, 'y', 1]])} = ${N(b1 * md * k)}`;
      const px = td * rng.nz(-3, 3), b2 = rng.int(-7, 7), py = tn * px / td + b2;
      const answer = lineEq(tn, td, b2), wrong = [lineEq(tn, td, b1 === b2 ? b2 + 2 : b1), lineEq(tn, td, py + tn * px / td), lineEq(on, od, b2), lineEq(-tn, td, b2), lineEq(tn, td, -b2 || 3)];
      return { prompt: `Which line passes through ${M.pt(px, py)} and is ${want} to this line?${big(shown)}`, type: 'choice', choices: [answer].concat(others(answer, wrong, 3)), answer, params: { kind: 'through', want, mn, md, tn, td, px, py, b2 },
        hints: [`Solve the given line for ${Y}: ${lineFr(mn, md, b1, 1)}, so its slope is ${slopeText(mn, md)}.`, want === 'parallel' ? `A parallel line keeps that slope: ${slopeText(tn, td)}.` : `A perpendicular line has the negative reciprocal slope: ${slopeText(tn, td)}.`, `Put in the point: ${N(py)} = ${frHtml(tn, td)} · ${wrap(px)} + ${V('b')}, so ${V('b')} = ${N(b2)}.`, `<b>${answer}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      const rel = (n1, d1, n2, d2) => (n1 * d2 === n2 * d1 ? 'parallel' : n1 * n2 === -d1 * d2 ? 'perpendicular' : 'neither');
      if (P.kind === 'slope') { const m = P.mn / P.md; return P.want === 'parallel' ? Math.abs(q.answer - m) < 1e-9 : Math.abs(q.answer * m + 1) < 1e-9; }
      if (P.kind === 'classify') return q.answer.toLowerCase() === rel(P.mn, P.md, P.n2, P.d2);
      return q.answer === lineEq(P.tn, P.td, P.b2) && rel(P.mn, P.md, P.tn, P.td) === P.want && P.py * P.td === P.tn * P.px + P.b2 * P.td;
    },
  });

  /* ---------- Unit 4: Systems of equations and inequalities ---------- */
  const stdH = ([a, b, c]) => `${sumHtml([[a, 'x', 1], [b, 'y', 1]])} = ${N(c)}`;
  const SYS_WORDS = [
    { make(rng) { const pa = rng.pick([8, 9, 10, 12]), pc = rng.pick([4, 5, 6]), x = rng.int(5, 30), y = rng.int(5, 30), name = rng.pick(NAMES);
      return { x, y, eqs: [[1, 1, x + y], [pa, pc, pa * x + pc * y]], vx: 'adult tickets', vy: 'child tickets',
        text: `${name}'s school play sold ${x + y} tickets and took in ${M.money(pa * x + pc * y)}. Adult tickets cost ${M.money(pa)} and child tickets cost ${M.money(pc)}.` }; } },
    { make(rng) { const x = rng.int(12, 60), y = rng.int(2, x - 3);
      return { x, y, eqs: [[1, 1, x + y], [1, -1, x - y]], vx: 'the larger number', vy: 'the smaller number', text: `Two numbers add to ${x + y}, and the larger minus the smaller is ${x - y}.` }; } },
    { make(rng) { const [pa, pb] = rng.pick([[3, 2], [4, 3], [5, 2], [6, 4], [5, 3]]), x = rng.int(2, 12), y = rng.int(2, 12), name = rng.pick(NAMES);
      return { x, y, eqs: [[1, 1, x + y], [pa, pb, pa * x + pb * y]], vx: 'muffins', vy: 'juices',
        text: `${name} buys ${x + y} snacks for a club meeting: muffins at ${M.money(pa)} each and juices at ${M.money(pb)} each. The bill is ${M.money(pa * x + pb * y)}.` }; } },
    { make(rng) { const x = rng.int(3, 20), y = rng.int(3, 20);
      return { x, y, eqs: [[1, 1, x + y], [2, 4, 2 * x + 4 * y]], vx: 'chickens', vy: 'goats', text: `A farm has chickens and goats: ${x + y} heads and ${2 * x + 4 * y} legs in all. A chicken has 2 legs and a goat has 4.` }; } },
    { make(rng) { const [pa, pb] = rng.pick([[15, 9], [20, 12], [18, 10], [25, 15]]), x = rng.int(20, 90), y = rng.int(20, 90);
      return { x, y, eqs: [[1, 1, x + y], [pa, pb, pa * x + pb * y]], vx: 'floor seats', vy: 'balcony seats', ask: v => `How many ${v} were sold?`,
        text: `A community concert sold ${x + y} seats and took in ${M.money(pa * x + pb * y)}. Floor seats cost ${M.money(pa)} and balcony seats cost ${M.money(pb)}.` }; } },
    { make(rng) { const [ha, hb] = rng.pick([[2, 5], [3, 4], [2, 7], [3, 5]]), x = rng.int(2, 14), y = rng.int(2, 14);
      return { x, y, eqs: [[1, 1, x + y], [ha, hb, ha * x + hb * y]], vx: 'stools', vy: 'tables', ask: v => `How many ${v} did the carpenter build?`,
        text: `A carpenter built ${x + y} pieces of furniture, stools and tables, in ${ha * x + hb * y} hours of work. Each stool takes ${ha} hours and each table takes ${hb} hours.` }; } },
    { make(rng) { const x = rng.int(4, 30), y = rng.int(4, 30), name = rng.pick(NAMES);
      return { x, y, eqs: [[1, 1, x + y], [25, 10, 25 * x + 10 * y]], vx: 'quarters', vy: 'dimes',
        text: `${name}’s coin jar holds ${x + y} coins, all quarters and dimes, worth ${M.money((25 * x + 10 * y) / 100)} in total.` }; } },
  ];

  A.skill({
    id: 'alg1.solve-systems', title: 'Solving systems of equations',
    learn: p(`A <b>system of equations</b> is a pair of equations that must both be true at the same time. Its solution is the point ${M.pt(X, Y)} that works in both, which is where the two lines cross on a graph.`) +
      p(`<b>Substitution:</b> when one equation already says ${Y} = … (or ${X} = …), put that expression in place of ${Y} in the other equation, solve, then substitute back to find ${Y}. <b>Elimination:</b> multiply one or both equations so that one variable has opposite coefficients, then add the equations so that variable cancels.`) +
      p('Lines with equal slopes and different intercepts are parallel, so they never cross: <b>no solution</b>. If the two equations describe the same line, every point on it works: <b>infinitely many solutions</b>.') +
      example('Example 1: elimination', `${big(`${stdH([2, 1, 7])} <br> ${stdH([3, -1, 8])}`)}The ${Y} coefficients are opposites, so add the equations: 5${X} = 15, so ${X} = 3. Then 2(3) + ${Y} = 7, so <b>${Y} = 1</b>. The solution is ${M.pt(3, 1)}.`) +
      example('Example 2: substitution', `${big(`${Y} = 2${X} − 1 <br> ${stdH([3, 1, 9])}`)}Replace ${Y} in the second equation: 3${X} + (2${X} − 1) = 9, so 5${X} = 10 and ${X} = 2. Then ${Y} = 2(2) − 1 = 3. The solution is <b>${M.pt(2, 3)}</b>.`) +
      example('Example 3: a word problem', `A school play sells 40 tickets for $251. Adult tickets cost $8 and child tickets cost $5. Let ${X} = adult tickets and ${Y} = child tickets: ${X} + ${Y} = 40 and 8${X} + 5${Y} = 251. Substitute ${Y} = 40 − ${X}: 8${X} + 200 − 5${X} = 251, so 3${X} = 51 and ${X} = 17. That’s <b>17 adult and 23 child tickets</b>.`) +
      example('Example 4: how many solutions', `${big(`${Y} = 3${X} + 2 <br> ${stdH([6, -2, 5])}`)}Solve the second for ${Y}: ${Y} = 3${X} − 2.5. Same slope, different intercepts, so the lines are parallel: <b>no solution</b>.`),
    make(rng) {
      const kind = rng.pick(['sub', 'elim', 'elim', 'word', 'word', 'count']);
      if (kind === 'count') {
        const m = rng.nz(-4, 4), b1 = rng.int(-6, 6), type = rng.pick(['one', 'none', 'many']), k = rng.pick([1, 2, 3]) * rng.sign();
        const m2 = type === 'one' ? m + rng.nz(-2, 2) : m, b2 = type === 'none' ? b1 + rng.nz(-4, 4) : b1;
        const e1 = [-m, 1, b1], e2 = [-m2 * k, k, b2 * k];
        const answer = COUNT_CHOICES[['one', 'none', 'many'].indexOf(type)];
        return { prompt: `How many solutions does this system have?${big(`${lineEq(m, 1, b1)} <br> ${stdH(e2)}`)}`, type: 'choice', choices: COUNT_CHOICES.slice(), keepOrder: true, answer, params: { kind, eqs: [e1, e2] },
          hints: [`Solve the second equation for ${Y}: ${lineEq(m2, 1, b2)}.`, m2 !== m ? 'The slopes are different, so the lines cross exactly once.' : b2 !== b1 ? 'Same slope, different intercepts: the lines are parallel and never meet.' : 'Same slope and same intercept: it is the same line twice.', `<b>${answer}</b>.`] };
      }
      let eqs, x, y, ask = rng.pick(['x', 'y']), prompt, hints;
      if (kind === 'word') {
        const w = rng.pick(SYS_WORDS).make(rng); ({ x, y, eqs } = w);
        const what = ask === 'x' ? w.vx : w.vy;
        prompt = w.ask ? `${w.text} ${w.ask(what)}` : `${w.text} How many ${what.replace(/^the /, '')} ${what.startsWith('the') ? 'is it' : 'are there'}?`.replace('How many larger number is it', 'What is the larger number').replace('How many smaller number is it', 'What is the smaller number');
        hints = [`Let ${X} = ${w.vx} and ${Y} = ${w.vy}. Then ${stdH(eqs[0])} and ${stdH(eqs[1])}.`, `Solve the first for ${Y}: ${Y} = ${N(eqs[0][2])} − ${X}${eqs[0][1] === -1 ? ' (or add the two equations to cancel ' + Y + ')' : ''}, and substitute into the second.`, `That gives ${X} = ${N(x)} and ${Y} = ${N(y)}, so the answer is <b>${N(ask === 'x' ? x : y)}</b>.`];
      } else {
        x = rng.nz(-6, 6); y = rng.int(-6, 6);
        if (kind === 'sub') {
          const m = rng.nz(-4, 4), k = y - m * x; let a = rng.nz(-5, 5); const b = rng.nz(-5, 5); if (a + b * m === 0) a += 1; if (a === 0) a = 2;
          eqs = [[-m, 1, k], [a, b, a * x + b * y]];
          prompt = `Solve the system by substitution. What is the value of ${V(ask)}?${big(`${lineEq(m, 1, k)} <br> ${stdH(eqs[1])}`)}`;
          hints = [`Replace ${Y} in the second equation with ${sumHtml([[m, 'x', 1], [k, '', 0]])}: ${M.term(a, 'x')} ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : N(Math.abs(b))}(${sumHtml([[m, 'x', 1], [k, '', 0]])}) = ${N(eqs[1][2])}.`, `Simplify: ${sumHtml([[a + b * m, 'x', 1], [b * k, '', 0]])} = ${N(eqs[1][2])}, so ${X} = ${N(x)}.`, `Then ${Y} = ${N(m)}(${N(x)}) ${M.signed(k)} = ${N(y)}. So <b>${V(ask)} = ${N(ask === 'x' ? x : y)}</b>.`];
        } else {
          const a1 = rng.nz(-6, 6), b1 = rng.nz(-6, 6); let a2 = rng.nz(-6, 6); const b2 = rng.bool() ? -b1 : rng.nz(-6, 6);
          if (a1 * b2 === a2 * b1) a2 = a2 === 6 ? -5 : a2 + 1;
          if (a1 * b2 === a2 * b1) a2 = -a2;
          eqs = [[a1, b1, a1 * x + b1 * y], [a2, b2, a2 * x + b2 * y]];
          prompt = `Solve the system by elimination. What is the value of ${V(ask)}?${big(`${stdH(eqs[0])} <br> ${stdH(eqs[1])}`)}`;
          hints = [b2 === -b1 ? `The ${Y} coefficients are opposites, so add the equations: ${M.term(a1 + a2, 'x')} = ${N(eqs[0][2] + eqs[1][2])}.` : `Multiply the first equation by ${N(b2)} and the second by ${N(b1)} so the ${Y} terms match, then subtract: ${M.term(a1 * b2 - a2 * b1, 'x')} = ${N(eqs[0][2] * b2 - eqs[1][2] * b1)}.`, `So ${X} = ${N(x)}. Put it back into the first equation to get ${Y} = ${N(y)}.`, `<b>${V(ask)} = ${N(ask === 'x' ? x : y)}</b>. Check the pair ${M.pt(x, y)} in both equations.`];
        }
      }
      return { prompt, type: 'number', answer: ask === 'x' ? x : y, params: { kind, eqs, ask }, hints };
    },
    challenge(rng) {
      // elimination where both equations need multiplying, and the second may need tidying first
      const x = rng.nz(-9, 9), y = rng.nz(-9, 9), ask = rng.pick(['x', 'y']), c27 = () => rng.sign() * rng.int(2, 7);
      const divides = (u, w) => M.gcd(u, w) === Math.min(Math.abs(u), Math.abs(w));
      let a1, b1, a2, b2;
      do { a1 = c27(); b1 = c27(); a2 = c27(); b2 = c27(); } while (a1 * b2 === a2 * b1 || divides(a1, a2) || divides(b1, b2));
      const eqs = [[a1, b1, a1 * x + b1 * y], [a2, b2, a2 * x + b2 * y]], messy = rng.bool();
      const second = messy ? `${M.term(a2, 'x')} = ${sumHtml([[eqs[1][2], '', 0], [-b2, 'y', 1]])}` : stdH(eqs[1]);
      return { prompt: `Solve the system. What is the value of ${V(ask)}?${big(`${stdH(eqs[0])} <br> ${second}`)}`, type: 'number', answer: ask === 'x' ? x : y, params: { kind: 'elim', eqs, ask },
        hints: [`${messy ? `First rewrite the second equation as ${stdH(eqs[1])}. ` : ''}Neither variable cancels by multiplying just one equation, so multiply the first by ${N(b2)} and the second by ${N(b1)} to match the ${Y} terms.`, `Subtract the new equations: ${M.term(a1 * b2 - a2 * b1, 'x')} = ${N(eqs[0][2] * b2 - eqs[1][2] * b1)}, so ${X} = ${N(x)}.`, `Put ${X} = ${N(x)} back into the first equation to get ${Y} = ${N(y)}. So <b>${V(ask)} = ${N(ask === 'x' ? x : y)}</b>.`] };
    },
    verify(q) {
      const [[a1, b1, c1], [a2, b2, c2]] = q.params.eqs, det = a1 * b2 - a2 * b1;
      if (q.params.kind === 'count') {
        const expect = det !== 0 ? COUNT_CHOICES[0] : (a1 * c2 === a2 * c1 && b1 * c2 === b2 * c1) ? COUNT_CHOICES[2] : COUNT_CHOICES[1];
        return q.answer === expect;
      }
      if (det === 0) return 'singular system';
      const x = (c1 * b2 - c2 * b1) / det, y = (a1 * c2 - a2 * c1) / det;   // Cramer's rule
      return Math.abs((q.params.ask === 'x' ? x : y) - q.answer) < 1e-9 && Number.isInteger(x) && Number.isInteger(y);
    },
  });

  const ineqH = (m, b, op) => `${Y} ${OPH[op]} ${sumHtml([[m, 'x', 1], [b, '', 0]])}`;
  const sat = (ins, [x, y]) => ins.every(([m, b, op]) => holds(y, op, m * x + b));
  /** the part of the −6…6 window above (or below) y = mx + b, as a polygon, walking the window's edges in order */
  function halfPlane(m, b, above) {
    const g = ([x, y]) => (y - (m * x + b)) * (above ? 1 : -1), box = [[-6, -6], [6, -6], [6, 6], [-6, 6]], out = [];
    box.forEach((P, i) => {
      const Q = box[(i + 1) % 4], gp = g(P), gq = g(Q);
      if (gp >= 0) out.push(P);
      if (gp * gq < 0) { const t = gp / (gp - gq); out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]); }
    });
    return out;
  }
  const SPEND = [
    { text: (n, a, b, T) => `${n} has at most ${M.money(T)} to spend on ${X} pens at ${M.money(a)} each and ${Y} notebooks at ${M.money(b)} each.`, u: 'pens', w: 'notebooks' },
    { text: (n, a, b, T) => `At a garden center, ${n} can spend at most ${M.money(T)} on ${X} bags of soil at ${M.money(a)} each and ${Y} trays of seedlings at ${M.money(b)} each.`, u: 'bags of soil', w: 'trays of seedlings' },
    { text: (n, a, b, T) => `${n} is planning a class trip with a budget of at most ${M.money(T)}: ${X} bus tickets at ${M.money(a)} each and ${Y} museum passes at ${M.money(b)} each.`, u: 'bus tickets', w: 'museum passes' },
    { text: (n, a, b, T) => `A food bank volunteer, ${n}, can spend at most ${M.money(T)} on ${X} boxes of cereal at ${M.money(a)} each and ${Y} bags of rice at ${M.money(b)} each.`, u: 'boxes of cereal', w: 'bags of rice' },
  ];
  const EARN = [
    { text: (n, a, b, T) => `${n} wants to earn at least ${M.money(T)} by washing ${X} cars at ${M.money(a)} each and walking ${Y} dogs at ${M.money(b)} each.`, u: 'cars', w: 'dogs' },
    { text: (n, a, b, T) => `At a craft fair, ${n} hopes to take in at least ${M.money(T)} by selling ${X} bracelets at ${M.money(a)} each and ${Y} painted mugs at ${M.money(b)} each.`, u: 'bracelets', w: 'mugs' },
    { text: (n, a, b, T) => `${n} needs at least ${M.money(T)} for a music camp and earns it by mowing ${X} lawns at ${M.money(a)} each and tutoring ${Y} hours at ${M.money(b)} an hour.`, u: 'lawns', w: 'hours of tutoring' },
    { text: (n, a, b, T) => `A bakery stand run by ${n} needs to bring in at least ${M.money(T)} a day from ${X} muffins at ${M.money(a)} each and ${Y} loaves of bread at ${M.money(b)} each.`, u: 'muffins', w: 'loaves' },
  ];

  A.skill({
    id: 'alg1.linear-inequalities', title: 'Two-variable inequalities and systems',
    learn: p(`A <b>solution</b> of an inequality like ${Y} &gt; 2${X} − 1 is any point ${M.pt(X, Y)} that makes it true. All the solutions lie on one side of the <b>boundary line</b> ${Y} = 2${X} − 1. To test a point, substitute its coordinates: if the statement is true, the point is a solution.`) +
      p(`On a graph, with the inequality solved for ${Y}, <b>&gt;</b> or <b>≥</b> shades <b>above</b> the line, and <b>&lt;</b> or <b>≤</b> shades <b>below</b> it. A <b>dashed</b> line means points on the line aren’t included (&lt; or &gt;); a <b>solid</b> line means they are (≤ or ≥).`) +
      p('A <b>system of inequalities</b> is solved by the points that make every inequality true at once: the region where the shadings overlap.') +
      example('Example 1: testing a point', `Is ${M.pt(3, 2)} a solution of ${Y} &lt; −${X} + 6? Substitute: 2 &lt; −3 + 6 = 3. True, so <b>yes</b>.`) +
      example('Example 2: a system', `${big(`${Y} &gt; ${X} + 2 <br> ${Y} ≤ −2${X} + 7`)}Test ${M.pt(1, 4)}: 4 &gt; 1 + 2 = 3 is true, and 4 ≤ −2 + 7 = 5 is true. Both hold, so <b>${M.pt(1, 4)} is a solution</b>. ${M.pt(3, 6)} isn’t: 6 ≤ 1 is false.`) +
      example('Example 3: reading a graph', `${grid({ lines: [{ pts: [0, -1, 2, 0], dash: true }], shade: halfPlane(0.5, -1, true), label: 'The dashed line y = ½x − 1 on a coordinate grid, with the region above the line shaded' })}The line is ${Y} = ${F(1, 2)}${X} − 1. It’s dashed, so the sign is strict, and the shading is above, so it’s greater than: <b>${Y} &gt; ${F(1, 2)}${X} − 1</b>.`) +
      example('Example 4: from words', `${X} pens at $3 each and ${Y} notebooks at $5 each, spending at most $60. The cost is 3${X} + 5${Y}, and “at most” means ≤: <b>3${X} + 5${Y} ≤ 60</b>.`),
    make(rng) {
      const kind = rng.pick(['point', 'system', 'graph', 'words']);
      if (kind === 'graph') {
        const m = rng.nz(-4, 4), b = rng.int(-6, 6), solid = rng.bool(), above = rng.bool();
        const op = above ? (solid ? '≥' : '>') : (solid ? '≤' : '<');
        const choices = ['<', '≤', '>', '≥'].map(o => ineqH(m, b, o)), answer = ineqH(m, b, op);
        const fig = grid({ lines: [{ pts: [0, b, 1, b + m], dash: !solid }], shade: halfPlane(m, b, above), label: `The ${solid ? 'solid' : 'dashed'} line ${flat(lineEq(m, 1, b))} on a coordinate grid, with the region ${above ? 'above' : 'below'} the line shaded` });
        return { prompt: `The graph shows the line ${lineEq(m, 1, b)} drawn <b>${solid ? 'solid' : 'dashed'}</b>, with the region <b>${above ? 'above' : 'below'}</b> the line shaded. Which inequality does it show?${fig}`, type: 'choice', choices, keepOrder: true, answer, params: { kind, m, b, solid, above },
          hints: [`${above ? 'Shading above the line means ' + Y + ' is greater than the line: &gt; or ≥.' : 'Shading below the line means ' + Y + ' is less than the line: &lt; or ≤.'}`, `${solid ? 'A solid line is included, so the sign has the "or equal to" bar.' : 'A dashed line is not included, so the sign is strict.'}`, `<b>${answer}</b>.`] };
      }
      if (kind === 'words') {
        const spend = rng.bool(), a = rng.pick([2, 3, 4, 5, 6]); let b = rng.pick([3, 5, 7, 8, 9]); if (b === a) b = a + 4;
        const T = rng.pick([40, 50, 60, 75, 80, 100, 120]), name = rng.pick(NAMES), op = spend ? '≤' : '≥';
        const ex = o => `${a}${X} + ${b}${Y} ${OPH[o]} ${T}`;
        const S = rng.pick(spend ? SPEND : EARN), text = S.text(name, a, b, T);
        const answer = ex(op), wrong = [ex(FLIP[op]), `${b}${X} + ${a}${Y} ${OPH[op]} ${T}`, ex(SOFT[op])];
        return { prompt: `${text} Which inequality describes the situation?`, type: 'choice', choices: [answer].concat(wrong), answer, params: { kind, spend, a, b, T },
          hints: [`The total is ${a}${X} + ${b}${Y}: ${M.money(a)} times the number of ${S.u} plus ${M.money(b)} times the number of ${S.w}.`, spend ? `"At most" means the total can equal ${M.money(T)} or be less: ≤.` : `"At least" means the total can equal ${M.money(T)} or be more: ≥.`, `<b>${answer}</b>.`] };
      }
      const two = kind === 'system';
      for (let tries = 0; ; tries++) {
        const ins = [[rng.nz(-3, 3), rng.int(-4, 4), rng.pick(['<', '>', '≤', '≥'])]];
        if (two) { let m2 = rng.nz(-3, 3); if (m2 === ins[0][0]) m2 = -m2; ins.push([m2, rng.int(-4, 4), rng.pick(['<', '>', '≤', '≥'])]); }
        const pts = [], good = [], bad = [];
        for (let k = 0; k < 60; k++) {
          const pt = [rng.int(-5, 5), rng.int(-6, 6)];
          if (pts.some(q => q[0] === pt[0] && q[1] === pt[1])) continue;
          pts.push(pt);
          const onLine = ins.some(([m, b]) => pt[1] === m * pt[0] + b);
          if (sat(ins, pt) && !onLine) good.push(pt); else if (!sat(ins, pt)) bad.push(pt);
        }
        if (!good.length || bad.length < 3) { if (tries < 30) continue; }
        // prefer distractors that pass one inequality but not the other, and a point on a strict boundary
        bad.sort((p1, p2) => ins.filter(i => sat([i], p2)).length - ins.filter(i => sat([i], p1)).length);
        const points = [good[0]].concat(bad.slice(0, 3));
        const answer = M.pt(...good[0]), choices = points.map(pt => M.pt(...pt));
        const shown = ins.map(([m, b, op]) => ineqH(m, b, op)).join(' <br> ');
        const g = good[0];
        return { prompt: `Which point is a solution of ${two ? 'the system' : 'the inequality'}?${big(shown)}`, type: 'choice', choices, answer, params: { kind, ins, points },
          hints: [`Test each point by substituting its ${X} and ${Y}${two ? ' into both inequalities; it must make both true' : ''}.`, `For ${M.pt(...g)}: ${ins.map(([m, b, op]) => `${N(g[1])} ${OPH[op]} ${N(m * g[0] + b)} is true`).join(', and ')}.`, `The solution is <b>${answer}</b>; each other point makes ${two ? 'at least one inequality' : 'the inequality'} false.`] };
      }
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'graph') return q.answer === ineqH(P.m, P.b, P.above ? (P.solid ? '≥' : '>') : (P.solid ? '≤' : '<'));
      if (P.kind === 'words') return plain(q.answer) === `${P.a} x + ${P.b} y ${P.spend ? '≤' : '≥'} ${P.T}`;
      const good = P.points.filter(pt => sat(P.ins, pt));
      return good.length === 1 && q.answer === M.pt(...good[0]);
    },
  });

  /* ---------- Unit 5: Functions ---------- */
  const FN_CTX = [
    { what: `${V('h')}(${V('t')}) is the height, in centimeters, of a sunflower ${V('t')} weeks after it was planted.`, fn: 'h', say: (a, b) => `After ${a} weeks, the sunflower is ${b} cm tall.`, each: (a, b) => `The sunflower grows ${b} cm each week for ${a} weeks.` },
    { what: `${V('d')}(${V('t')}) is the distance, in kilometers, a train has traveled ${V('t')} hours after leaving the station.`, fn: 'd', say: (a, b) => `After ${a} hours, the train has gone ${b} km.`, each: (a, b) => `The train goes ${b} km each hour for ${a} hours.` },
    { what: `${V('P')}(${V('y')}) is the number of members a chess club has ${V('y')} years after it started.`, fn: 'P', say: (a, b) => `${a} years after it started, the club has ${b} members.`, each: (a, b) => `The club gains ${b} members a year for ${a} years.` },
    { what: `${V('C')}(${V('n')}) is the cost, in dollars, of printing ${V('n')} posters.`, fn: 'C', say: (a, b) => `Printing ${a} posters costs ${b} dollars in total.`, each: (a, b) => `Each poster costs ${b} dollars when printing ${a}.` },
    { what: `${V('W')}(${V('m')}) is the number of liters of water in a tank ${V('m')} minutes after it starts filling.`, fn: 'W', say: (a, b) => `After ${a} minutes, the tank holds ${b} liters.`, each: (a, b) => `The tank gains ${b} liters a minute for ${a} minutes.` },
    { what: `${V('T')}(${V('h')}) is the temperature, in degrees Fahrenheit, ${V('h')} hours after sunrise.`, fn: 'T', say: (a, b) => `${a} hours after sunrise, the temperature is ${b}°F.`, each: (a, b) => `The temperature rises ${b} degrees each hour for ${a} hours.` },
    { what: `${V('S')}(${V('d')}) is the total number of loaves a bakery has sold ${V('d')} days after opening.`, fn: 'S', say: (a, b) => `After ${a} days, the bakery has sold ${b} loaves in total.`, each: (a, b) => `The bakery sells ${b} loaves each day for ${a} days.` },
    { what: `${V('E')}(${V('h')}) is the amount, in dollars, a lifeguard earns for ${V('h')} hours of work.`, fn: 'E', say: (a, b) => `Working ${a} hours earns the lifeguard ${b} dollars.`, each: (a, b) => `The lifeguard earns ${b} dollars an hour for ${a} hours.` },
    { what: `${V('L')}(${V('w')}) is the total number of laps a swimmer has completed after ${V('w')} weeks of training.`, fn: 'L', say: (a, b) => `After ${a} weeks of training, the swimmer has swum ${b} laps in all.`, each: (a, b) => `The swimmer swims ${b} laps each week for ${a} weeks.` },
  ];
  const fnName = () => ['f', 'g', 'h'];

  A.skill({
    id: 'alg1.function-notation', title: 'Evaluating and interpreting functions',
    learn: p(`A <b>function</b> is a rule that gives exactly one output for each input. In <b>function notation</b>, ${V('f')}(${X}) names the output when the input is ${X}. So ${V('f')}(3) means “replace every ${X} with 3 and work it out”; it doesn’t mean ${V('f')} times 3.`) +
      p(`Read ${V('f')}(${V('a')}) = ${V('b')} as “the input ${V('a')} gives the output ${V('b')}.” Going the other way, to solve ${V('f')}(${X}) = 10, set the rule equal to 10 and solve for ${X}. In a table, ${V('f')}(3) is the output in the row where ${X} = 3.`) +
      p(`In a real situation, the input and output have units. If ${V('h')}(${V('t')}) is a height in meters after ${V('t')} seconds, ${V('h')}(2) = 15 says that after 2 seconds the height is 15 meters.`) +
      example('Example 1: evaluating', `${V('f')}(${X}) = ${M.poly([2, -3, 1])}. ${V('f')}(−2) = 2(−2)² − 3(−2) + 1 = 8 + 6 + 1 = <b>15</b>.`) +
      example('Example 2: finding the input', `${V('f')}(${X}) = 4${X} − 7. For what ${X} is ${V('f')}(${X}) = 13? Set 4${X} − 7 = 13, add 7 to get 4${X} = 20, and divide: <b>${X} = 5</b>.`) +
      example('Example 3: what it means', `${V('C')}(${V('n')}) is the cost, in dollars, of ${V('n')} concert tickets. ${V('C')}(4) = 38 means <b>4 tickets cost $38 in total</b>, not $38 each.`),
    make(rng) {
      const kind = rng.pick(['eval', 'eval', 'solve', 'table', 'interpret']), f = rng.pick(fnName());
      if (kind === 'interpret') {
        const idx = rng.int(0, FN_CTX.length - 1), C = FN_CTX[idx], a = rng.int(2, 9), b = rng.int(12, 95);
        const answer = C.say(a, b), choices = [answer, C.say(b, a), C.each(a, b), C.each(b, a)];
        return { prompt: `${C.what} What does ${V(C.fn)}(${a}) = ${b} mean?`, type: 'choice', choices, answer, params: { kind, idx, a, b },
          hints: [`The number inside the parentheses is the input; the number after the equals sign is the output.`, `Here the input is ${a} and the output is ${b}. The statement gives one value, not a rate.`, `<b>${answer}</b>`] };
      }
      if (kind === 'table') {
        const xs = rng.sample([-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6], 5).sort((u, w) => u - w), ys = rng.sample([-9, -7, -5, -4, -2, -1, 0, 3, 5, 6, 8, 10, 12, 15], 5);
        const i = rng.int(0, 4), back = rng.bool();
        const tbl = M.table([X, `${V(f)}(${X})`], xs.map((x, j) => [N(x), N(ys[j])]));
        if (back) return { prompt: `Use the table. For what value of ${X} is ${V(f)}(${X}) = ${N(ys[i])}?${tbl}`, type: 'number', answer: xs[i], params: { kind, back, xs, ys, v: ys[i] },
          hints: [`${V(f)}(${X}) = ${N(ys[i])} asks for the input whose output is ${N(ys[i])}. Look in the ${V(f)}(${X}) column.`, `${N(ys[i])} sits in the row where ${X} = <b>${N(xs[i])}</b>.`] };
        return { prompt: `Use the table to find ${V(f)}(${N(xs[i])}).${tbl}`, type: 'number', answer: ys[i], params: { kind, back, xs, ys, v: xs[i] },
          hints: [`${V(f)}(${N(xs[i])}) is the output when the input ${X} is ${N(xs[i])}. Find that row.`, `In that row, ${V(f)}(${X}) = <b>${N(ys[i])}</b>.`] };
      }
      if (kind === 'solve') {
        const m = rng.nz(-6, 6), b = rng.int(-10, 10), x0 = rng.nz(-8, 8), v = m * x0 + b;
        return { prompt: `${V(f)}(${X}) = ${sumHtml([[m, 'x', 1], [b, '', 0]])}. For what value of ${X} is ${V(f)}(${X}) = ${N(v)}?`, type: 'number', answer: x0, params: { kind, m, b, v },
          hints: [`Set the rule equal to ${N(v)}: ${sumHtml([[m, 'x', 1], [b, '', 0]])} = ${N(v)}.`, `${b < 0 ? 'Add' : 'Subtract'} ${N(Math.abs(b))}: ${M.term(m, 'x')} = ${N(v - b)}. Divide by ${N(m)}.`, `<b>${X} = ${N(x0)}</b>.`] };
      }
      const a = rng.nz(-3, 3), b = rng.int(-6, 6), c = rng.int(-9, 9), k = rng.nz(-4, 4), ans = a * k * k + b * k + c;
      return { prompt: `${V(f)}(${X}) = ${M.poly([a, b, c])}. Find ${V(f)}(${N(k)}).`, type: 'number', answer: ans, params: { kind, a, b, c, k },
        hints: [`Replace every ${X} with ${wrap(k)}: ${N(a)}${wrap(k)}² ${M.signed(b)} · ${wrap(k)} ${M.signed(c)}.`, `${wrap(k)}² = ${N(k * k)}, so this is ${N(a * k * k)} ${M.signed(b * k)} ${M.signed(c)}.`, `${V(f)}(${N(k)}) = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'interpret') { const C = FN_CTX[P.idx]; return q.answer === C.say(P.a, P.b) && C.say(P.b, P.a) !== q.answer; }
      if (P.kind === 'table') { const pairs = P.xs.map((x, j) => [x, P.ys[j]]); return P.back ? pairs.filter(r => r[1] === P.v).length === 1 && pairs.find(r => r[1] === P.v)[0] === q.answer : pairs.find(r => r[0] === P.v)[1] === q.answer; }
      if (P.kind === 'solve') return P.m * q.answer + P.b === P.v;
      return q.answer === (P.a * P.k + P.b) * P.k + P.c;     // Horner's form
    },
  });

  const setH = arr => `{${[...new Set(arr)].sort((u, w) => u - w).map(N).join(', ')}}`;
  /** y = a(x − h)² + k */
  const vfH = (a, h, k) => `${Y} = ${a === 1 ? '' : a === -1 ? '−' : N(a)}${h === 0 ? M.sup(X, 2) : `(${X} ${M.signed(-h)})<sup>2</sup>`}${k ? ' ' + M.signed(k) : ''}`;

  A.skill({
    id: 'alg1.domain-range', title: 'Domain and range',
    learn: p(`The <b>domain</b> of a function is the set of inputs it accepts (the ${X}-values). The <b>range</b> is the set of outputs it actually produces (the ${Y}-values).`) +
      p(`For a list of ordered pairs, the domain is the set of first coordinates and the range is the set of second coordinates, each listed once. A linear function on a limited domain has a range running between its outputs at the two ends. A square root needs a number inside that isn’t negative, so √(${X} − 3) has domain ${X} ≥ 3.`) +
      p(`A parabola ${Y} = ${V('a')}(${X} − ${V('h')})² + ${V('k')} accepts every ${X}, but its outputs stop at the <b>vertex</b>, the turning point ${M.pt(V('h'), V('k'))}: the range is ${Y} ≥ ${V('k')} when it opens up and ${Y} ≤ ${V('k')} when it opens down.`) +
      example('Example 1: ordered pairs', `${big(`{${M.pt(2, 5)}, ${M.pt(-1, 3)}, ${M.pt(4, 5)}}`)}Domain: the first coordinates, <b>{−1, 2, 4}</b>. Range: the second coordinates, listed once each, <b>{3, 5}</b>.`) +
      example('Example 2: a line on a limited domain', `${V('f')}(${X}) = −2${X} + 5 for −1 ≤ ${X} ≤ 3. ${V('f')}(−1) = 7 and ${V('f')}(3) = −1, so with the smaller number first the range is <b>−1 ≤ ${Y} ≤ 7</b>.`) +
      example('Example 3: a parabola and a square root', `${Y} = −2(${X} − 1)² + 6 opens down (−2 is negative) with vertex ${M.pt(1, 6)}, so its range is <b>${Y} ≤ 6</b>. For ${V('g')}(${X}) = ${M.sqrt(`${X} + 4`)} − 1, the inside can’t be negative: ${X} + 4 ≥ 0, so the domain is <b>${X} ≥ −4</b>.`),
    make(rng) {
      const kind = rng.pick(['pairs', 'linear', 'quad', 'sqrt']);
      if (kind === 'pairs') {
        const n = rng.int(4, 5), xs = rng.sample([-5, -3, -2, -1, 0, 1, 2, 4, 6, 7, 9], n), ys = xs.map(() => rng.pick([-4, -2, 0, 1, 3, 5, 8]));
        const ask = rng.pick(['domain', 'range']), dom = setH(xs), ran = setH(ys);
        const answer = ask === 'domain' ? dom : ran;
        const wrong = [ask === 'domain' ? ran : dom, setH(xs.concat(ys)), setH(xs.slice(0, 2).concat(ys.slice(2))), setH((ask === 'domain' ? xs : ys).slice(1))];
        return { prompt: `What is the ${ask} of this relation?${big(`{${xs.map((x, i) => M.pt(x, ys[i])).join(', ')}}`)}`, type: 'choice', choices: [answer].concat(others(answer, wrong, 3)), answer, params: { kind, ask, xs, ys },
          hints: [`The ${ask} is the set of ${ask === 'domain' ? 'first' : 'second'} coordinates.`, `List each value once, smallest first.`, `<b>${answer}</b>.`] };
      }
      if (kind === 'linear') {
        const m = rng.nz(-4, 4), b = rng.int(-6, 6), lo = rng.int(-4, 1), hi = lo + rng.int(3, 7), f1 = m * lo + b, f2 = m * hi + b;
        const rg = (u, w) => `${N(u)} ≤ ${Y} ≤ ${N(w)}`, answer = rg(Math.min(f1, f2), Math.max(f1, f2));
        const wrong = [rg(lo, hi), rg(f1, f2), rg(-Math.max(f1, f2), -Math.min(f1, f2)), `${Y} ≥ ${N(Math.min(f1, f2))}`];
        return { prompt: `${V('f')}(${X}) = ${sumHtml([[m, 'x', 1], [b, '', 0]])} has domain ${N(lo)} ≤ ${X} ≤ ${N(hi)}. What is its range?`, type: 'choice', choices: [answer].concat(others(answer, wrong, 3)), answer, params: { kind, m, b, lo, hi },
          hints: [`A line's outputs run between its values at the ends of the domain.`, `${V('f')}(${N(lo)}) = ${N(f1)} and ${V('f')}(${N(hi)}) = ${N(f2)}.`, `Smaller first: <b>${answer}</b>.`] };
      }
      if (kind === 'quad') {
        const a = rng.nz(-3, 3), h = rng.nz(-5, 5); let k = rng.int(-8, 8); if (k === h) k += 2;
        const answer = a > 0 ? `${Y} ≥ ${N(k)}` : `${Y} ≤ ${N(k)}`;
        const choices = [`${Y} ≥ ${N(k)}`, `${Y} ≤ ${N(k)}`, `${Y} ≥ ${N(h)}`, 'All real numbers'];
        return { prompt: `What is the range of this function?${big(vfH(a, h, k))}`, type: 'choice', choices, answer, params: { kind, a, h, k },
          hints: [`In vertex form the vertex is ${M.pt(h, k)}, so the lowest or highest output is ${N(k)}.`, a > 0 ? `${V('a')} = ${N(a)} is positive, so the parabola opens up and ${N(k)} is the minimum.` : `${V('a')} = ${N(a)} is negative, so the parabola opens down and ${N(k)} is the maximum.`, `<b>${answer}</b>.`] };
      }
      const c = rng.nz(-7, 7); let d = rng.int(-6, 6); if (d === c || d === -c) d = c + 3;
      const answer = `${X} ≥ ${N(c)}`;
      const wrong = [`${X} ≥ ${N(-c)}`, `${X} ≤ ${N(c)}`, `${X} ≥ ${N(d)}`, `${X} &gt; ${N(c)}`];
      return { prompt: `What is the domain of this function?${big(`${V('g')}(${X}) = ${M.sqrt(`${X} ${M.signed(-c)}`)}${d ? ' ' + M.signed(d) : ''}`)}`, type: 'choice', choices: [answer].concat(others(answer, wrong, 3)), answer, params: { kind, c, d },
        hints: ['The number under a square root cannot be negative.', `So ${X} ${M.signed(-c)} ≥ 0. The ${d ? N(d) + ' outside the root does not matter here.' : 'root can be 0, so ≥ (not &gt;).'}`, `<b>${answer}</b>.`] };
    },
    verify(q) {
      const P = q.params, s = plain(q.answer);
      if (P.kind === 'pairs') return q.answer === setH(P.ask === 'domain' ? P.xs : P.ys);
      if (P.kind === 'linear') {
        let lo = Infinity, hi = -Infinity;
        for (let x = P.lo; x <= P.hi + 1e-9; x += 0.125) { const v = P.m * x + P.b; lo = Math.min(lo, v); hi = Math.max(hi, v); }
        return s === `${lo} ≤ y ≤ ${hi}`;
      }
      if (P.kind === 'quad') {
        const vals = []; for (let x = P.h - 10; x <= P.h + 10; x += 0.5) vals.push(P.a * (x - P.h) * (x - P.h) + P.k);
        return s === (P.a > 0 ? `y ≥ ${Math.min(...vals)}` : `y ≤ ${Math.max(...vals)}`);
      }
      const ok = x => x - P.c >= 0;
      return ok(P.c) && !ok(P.c - 0.01) && s === `x ≥ ${P.c}`;
    },
  });

  const ROC_CTX = [
    { what: (n, t1, v1, t2, v2) => `On a hike, ${n} was at an altitude of ${N(v1)} m after ${t1} hours and ${N(v2)} m after ${t2} hours.`, unit: 'm/h', per: 'meters per hour', rates: [-150, -120, -80, 60, 90, 150, 200, 250], start: () => 100 },
    { what: (n, t1, v1, t2, v2) => `A tank held ${N(v1)} liters of water ${t1} minutes after ${n} opened the valve, and ${N(v2)} liters ${t2} minutes after.`, unit: 'L/min', per: 'liters per minute', rates: [-40, -25, -15, 12, 20, 35], start: () => 10 },
    { what: (n, t1, v1, t2, v2) => `${n}'s savings were ${M.money(v1)} at week ${t1} and ${M.money(v2)} at week ${t2}.`, unit: '$/week', per: 'dollars per week', rates: [-15, -8, 6, 12, 18, 25], start: () => 10 },
    { what: (n, t1, v1, t2, v2) => `In a greenhouse that ${n} looks after, the temperature was ${N(v1)}°F ${t1 ? t1 + ' hours after sunrise' : 'at sunrise'} and ${N(v2)}°F ${t2} hours after sunrise.`, unit: '°F/h', per: 'degrees Fahrenheit per hour', rates: [-6, -4, -3, 2, 3, 4, 5], start: () => 2 },
    { what: (n, t1, v1, t2, v2) => `A food bank had ${N(v1)} cans on its shelves at week ${t1} and ${N(v2)} cans at week ${t2}.`, unit: 'cans/week', per: 'cans per week', rates: [-40, -25, 30, 45, 60], start: () => 20 },
    { what: (n, t1, v1, t2, v2) => `A bakery had ${N(v1)} loaves on the shelf ${t1 ? t1 + ' hours after opening' : 'when it opened'} and ${N(v2)} loaves ${t2} hours after opening.`, unit: 'loaves/h', per: 'loaves per hour', rates: [-12, -9, -6, -4], start: () => 4 },
  ];

  A.skill({
    id: 'alg1.rate-of-change', title: 'Average rate of change',
    learn: p(`The <b>average rate of change</b> of a function from ${X} = ${V('a')} to ${X} = ${V('b')} is <b>(${V('f')}(${V('b')}) − ${V('f')}(${V('a')})) ÷ (${V('b')} − ${V('a')})</b>: the change in output divided by the change in input. It’s the slope of the straight line joining those two points on the graph.`) +
      p('For a line, it’s the same over every <b>interval</b> (stretch of inputs). For a curve such as a parabola, it depends on which interval you pick. In a real situation the answer has units, like meters per second, and a negative rate means the amount is going down.') +
      example('Example 1: from a rule', `${V('f')}(${X}) = ${M.sup(X, 2)} from ${X} = 1 to ${X} = 4: ${V('f')}(4) = 16 and ${V('f')}(1) = 1, so the rate is ${F('16 − 1', '4 − 1', { raw: true })} = <b>5</b>.`) +
      example('Example 2: from a table', `A table shows ${V('f')}(1) = 7 and ${V('f')}(4) = −2. The average rate of change from ${X} = 1 to ${X} = 4 is ${F('−2 − 7', '4 − 1', { raw: true })} = ${F('−9', '3', { raw: true })} = <b>−3</b>.`) +
      example('Example 3: in a situation', `A rain barrel held 80 liters 2 minutes after a tap was opened and 20 liters at 6 minutes. The rate is ${F('20 − 80', '6 − 2', { raw: true })} = <b>−15 liters per minute</b>: it lost 15 liters each minute on average.`),
    make(rng) {
      const kind = rng.pick(['formula', 'formula', 'table', 'context']);
      if (kind === 'context') {
        const ci = rng.int(0, ROC_CTX.length - 1), C = ROC_CTX[ci], t1 = rng.int(0, 3), t2 = t1 + rng.int(2, 5), r = rng.pick(C.rates);
        const v1 = C.start() * rng.int(Math.max(3, Math.ceil(-r * (t2 - t1) / C.start()) + 1), 30), v2 = v1 + r * (t2 - t1), name = rng.pick(NAMES);
        return { prompt: `${C.what(name, t1, v1, t2, v2)} What was the average rate of change, in ${C.per}?`, type: 'number', answer: r, unit: C.unit, params: { kind, x1: t1, y1: v1, x2: t2, y2: v2 },
          hints: [`Change in amount: ${N(v2)} − ${N(v1)} = ${N(v2 - v1)}.`, `Change in time: ${t2} − ${t1} = ${t2 - t1}.`, `${N(v2 - v1)} ÷ ${t2 - t1} = <b>${N(r)}</b> ${C.per}${r < 0 ? ' (negative because the amount went down)' : ''}.`] };
      }
      if (kind === 'table') {
        const xs = [0, 1, 2, 3, 4, 5], ys = xs.map(() => rng.int(-12, 20));
        const i = rng.int(0, 3), j = rng.int(i + 1, 5), [sn, sd] = M.simp(ys[j] - ys[i], xs[j] - xs[i]);
        return { prompt: `Use the table to find the average rate of change of ${V('f')} from ${X} = ${xs[i]} to ${X} = ${xs[j]}.${M.table([X, `${V('f')}(${X})`], xs.map((x, k) => [N(x), N(ys[k])]))}`, type: 'number', answer: sn / sd, answerText: slopeText(sn, sd), params: { kind, x1: xs[i], y1: ys[i], x2: xs[j], y2: ys[j] },
          hints: [`Read the outputs: ${V('f')}(${xs[i]}) = ${N(ys[i])} and ${V('f')}(${xs[j]}) = ${N(ys[j])}.`, `${F(`${N(ys[j])} − ${wrap(ys[i])}`, `${xs[j]} − ${xs[i]}`)} = ${F(`${N(ys[j] - ys[i])}`, `${xs[j] - xs[i]}`)}.`, `The average rate of change is <b>${slopeText(sn, sd)}</b>.`] };
      }
      const a = rng.nz(-3, 3), b = rng.int(-6, 6), c = rng.int(-5, 5), p1 = rng.int(-4, 2), p2 = p1 + rng.int(1, 4);
      const f = x => a * x * x + b * x + c, ans = a * (p1 + p2) + b;
      return { prompt: `What is the average rate of change of ${V('f')}(${X}) = ${M.poly([a, b, c])} from ${X} = ${N(p1)} to ${X} = ${N(p2)}?`, type: 'number', answer: ans, params: { kind, a, b, c, x1: p1, y1: f(p1), x2: p2, y2: f(p2) },
        hints: [`Evaluate at both ends: ${V('f')}(${N(p1)}) = ${N(f(p1))} and ${V('f')}(${N(p2)}) = ${N(f(p2))}.`, `Divide the change in output by the change in input: ${F(`${N(f(p2))} − ${wrap(f(p1))}`, `${N(p2)} − ${wrap(p1)}`)} = ${F(`${N(f(p2) - f(p1))}`, `${p2 - p1}`)}.`, `<b>${N(ans)}</b>.`] };
    },
    challenge(rng) {
      // a cubic: the rate still comes out whole, but the arithmetic needs care
      const a = rng.nz(-2, 2), b = rng.int(-4, 4), c = rng.int(-9, 9), p1 = rng.int(-4, 1), p2 = p1 + rng.int(2, 4);
      const f = x => a * x * x * x + b * x * x + c, ans = (f(p2) - f(p1)) / (p2 - p1);
      return { prompt: `What is the average rate of change of ${V('f')}(${X}) = ${M.poly([a, b, 0, c])} from ${X} = ${N(p1)} to ${X} = ${N(p2)}?`, type: 'number', answer: ans, params: { kind: 'cubic', a, b, c, x1: p1, y1: f(p1), x2: p2, y2: f(p2) },
        hints: [`Evaluate at both ends, cubing negative inputs carefully: (−2)³ = −8. ${V('f')}(${N(p1)}) = ${N(f(p1))} and ${V('f')}(${N(p2)}) = ${N(f(p2))}.`, `Divide the change in output by the change in input: ${F(`${N(f(p2))} − ${wrap(f(p1))}`, `${N(p2)} − ${wrap(p1)}`)} = ${F(`${N(f(p2) - f(p1))}`, `${p2 - p1}`)}.`, `<b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'formula') { const f = x => P.a * x * x + P.b * x + P.c; if (f(P.x1) !== P.y1 || f(P.x2) !== P.y2) return 'table mismatch'; }
      if (P.kind === 'cubic') { const f = x => P.a * Math.pow(x, 3) + P.b * x * x + P.c; if (f(P.x1) !== P.y1 || f(P.x2) !== P.y2) return 'table mismatch'; }
      return Math.abs(q.answer * (P.x2 - P.x1) - (P.y2 - P.y1)) < 1e-9;
    },
  });

  /* ---------- Unit 6: Sequences, absolute value, and piecewise functions ---------- */
  const an = V('a') + '(' + V('n') + ')';
  /** a(n) = A + D(n − s), with s = 1 or 0 */
  function seqH([A0, D, s]) {
    const nPart = s ? `(${V('n')} − 1)` : V('n');
    return `${an} = ${N(A0)} ${D < 0 ? '−' : '+'} ${Math.abs(D) === 1 ? '' : N(Math.abs(D))}${nPart}`;
  }
  const SEQ_KINDS = ['Arithmetic', 'Geometric', 'Neither'];
  /* sequences in everyday settings: each gives its first term, step, the term asked for, and the words */
  const SEQ_STORY = [
    rng => { const a = rng.int(12, 24), d = rng.int(2, 4), n = rng.int(10, 30);
      return { a, d, n, text: `A theater has ${a} seats in row 1, ${a + d} in row 2, ${a + 2 * d} in row 3, and so on, with the same increase each row. How many seats are in row ${n}?`, unit: 'seats' }; },
    rng => { const a = rng.pick([10, 15, 20]), d = rng.pick([5, 10]), n = rng.int(6, 16), name = rng.pick(NAMES);
      return { a, d, n, text: `${name} trains for a swim meet: ${a} minutes in week 1, ${a + d} in week 2 and ${a + 2 * d} in week 3, adding the same amount each week. How many minutes will ${name} train in week ${n}?`, unit: 'minutes' }; },
    rng => { const a = rng.int(30, 36), d = rng.int(3, 5), n = rng.int(5, 15);
      return { a, d, n, text: `One stacking chair is ${a} inches tall, two stacked are ${a + d} inches, and three stacked are ${a + 2 * d} inches. How tall, in inches, is a stack of ${n} chairs?`, unit: 'inches' }; },
    rng => { const n = rng.int(4, 6), a = Math.pow(2, n - 1) * rng.pick([3, 5, 6]);
      return { a, r: 0.5, n, text: `A ball is dropped, and each bounce reaches half the height of the bounce before. The 1st bounce reaches ${N(a)} cm, the 2nd ${N(a / 2)} cm and the 3rd ${N(a / 4)} cm. How high, in centimeters, is bounce number ${n}?`, unit: 'cm' }; },
    rng => { const a = rng.pick([2, 3, 4]), r = rng.pick([2, 3]), n = rng.int(4, 7);
      return { a, r, n, text: `In a school’s phone tree, ${a} people make calls in round 1, ${a * r} in round 2 and ${a * r * r} in round 3; each round has ${r} times as many callers as the one before. How many people make calls in round ${n}?`, unit: 'people' }; },
  ];

  A.skill({
    id: 'alg1.sequences', title: 'Arithmetic and geometric sequences',
    learn: p(`A <b>sequence</b> is a list of numbers in order; each number is a <b>term</b>, and ${an} names the ${V('n')}th term. In an <b>arithmetic sequence</b> you add the same number, the <b>common difference</b> ${V('d')}, to get from one term to the next: 4, 7, 10, 13, … has ${V('d')} = 3. Its <b>explicit formula</b>, which gives any term directly, is <b>${an} = ${M.sub(V('a'), 1)} + ${V('d')}(${V('n')} − 1)</b>.`) +
      p(`In a <b>geometric sequence</b> you multiply by the same number, the <b>common ratio</b> ${V('r')}: 3, 6, 12, 24, … has ${V('r')} = 2, and <b>${an} = ${M.sub(V('a'), 1)} · ${V('r')}<sup>${V('n')} − 1</sup></b>. The (${V('n')} − 1) is there because the first term hasn’t had any steps yet.`) +
      p(`A <b>recursive</b> rule says how to get each term from the one before, like ${V('a')}(${V('n')}) = ${V('a')}(${V('n')} − 1) + 3. To tell which kind a list is, check the differences between neighbors: all equal means arithmetic. If not, divide each term by the one before: equal ratios mean geometric. Otherwise it’s neither.`) +
      example('Example 1: a term far down the list', `Find the 20th term of 5, 9, 13, 17, … The difference is 4, so ${V('a')}(20) = 5 + 4(19) = <b>81</b>.`) +
      example('Example 2: writing the formula', `For 7, 4, 1, −2, … the first term is 7 and the difference is 4 − 7 = −3, so <b>${an} = 7 − 3(${V('n')} − 1)</b>. Check: ${V('n')} = 1 gives 7.`) +
      example('Example 3: a geometric term', `Find the 6th term of 2, 6, 18, 54, … The ratio is 6 ÷ 2 = 3, so ${V('a')}(6) = 2 · 3<sup>5</sup> = 2 · 243 = <b>486</b>.`) +
      example('Example 4: a recursive rule', `${V('a')}(1) = 5 and ${V('a')}(${V('n')}) = 2 · ${V('a')}(${V('n')} − 1). Each term doubles the one before: 5, 10, 20, 40, so <b>${V('a')}(4) = 40</b>.`),
    make(rng) {
      const kind = rng.pick(['arith-nth', 'arith-formula', 'geo-nth', 'classify', 'recursive', 'story']);
      if (kind === 'story') {
        const st = rng.pick(SEQ_STORY)(rng), geo = st.r != null, step = geo ? st.r : st.d;
        const t = [0, 1, 2, 3].map(i => geo ? st.a * Math.pow(st.r, i) : st.a + i * st.d), ans = geo ? st.a * Math.pow(st.r, st.n - 1) : st.a + (st.n - 1) * st.d;
        return { prompt: st.text, type: 'number', answer: ans, params: { kind, t, n: st.n, geo },
          hints: [geo ? `Each term is the one before times ${N(step)}, so the sequence is geometric with ratio ${N(step)}.` : `Each term is the one before plus ${N(step)}, so the sequence is arithmetic with difference ${N(step)}.`,
            geo ? `${V('a')}(${st.n}) = ${N(st.a)} · ${N(step)}<sup>${st.n - 1}</sup>.` : `${V('a')}(${st.n}) = ${N(st.a)} + ${N(step)}(${st.n} − 1) = ${N(st.a)} + ${N(step * (st.n - 1))}.`, `<b>${N(ans)}</b> ${st.unit}.`] };
      }
      if (kind === 'classify') {
        const type = rng.pick(SEQ_KINDS); let t;
        if (type === 'Arithmetic') { const a = rng.int(-10, 10), d = rng.nz(-7, 7); t = [0, 1, 2, 3, 4].map(i => a + i * d); }
        else if (type === 'Geometric') { const a = rng.pick([1, 2, 3, -2, 5]), r = rng.pick([2, 3, -2, -3]); t = [0, 1, 2, 3, 4].map(i => a * Math.pow(r, i)); }
        else { const c = rng.int(-5, 5); t = rng.bool() ? [1, 2, 3, 4, 5].map(i => i * i + c) : [0, 1, 2, 3, 4].map(i => c + i * (i + 3) / 2); }
        return { prompt: `Is this sequence arithmetic, geometric, or neither?${big(t.map(N).join(', ') + ', …')}`, type: 'choice', choices: SEQ_KINDS.slice(), keepOrder: true, answer: type, params: { kind, t },
          hints: [`Differences between neighbors: ${t.slice(1).map((v, i) => N(v - t[i])).join(', ')}.`, type === 'Geometric' ? `The differences change, but every term is ${N(t[1] / t[0])} times the one before.` : type === 'Arithmetic' ? 'The differences are all the same.' : 'The differences change, and the ratios are not constant either.', `<b>${type}</b>.`] };
      }
      if (kind === 'geo-nth') {
        const half = rng.chance(0.25), n = rng.int(5, half ? 7 : 6), r = half ? 0.5 : rng.pick([2, 3, -2, -3]);
        const a1 = half ? Math.pow(2, n - 1) * rng.pick([1, 3]) : rng.pick([1, 2, 3, 4, 5, -2, -3]);
        const t = [0, 1, 2, 3].map(i => a1 * Math.pow(r, i)), ans = a1 * Math.pow(r, n - 1);
        return { prompt: `What is the ${M.ordinal(n)} term of this geometric sequence?${big(t.map(N).join(', ') + ', …')}`, type: 'number', answer: ans, params: { kind, t, n },
          hints: [`Divide a term by the one before it: the common ratio is ${N(r)}.`, `${V('a')}(${n}) = ${N(a1)} · ${wrap(r)}<sup>${n - 1}</sup> = ${N(a1)} · ${N(Math.pow(r, n - 1))}.`, `The ${M.ordinal(n)} term is <b>${N(ans)}</b>.`] };
      }
      if (kind === 'recursive') {
        const geo = rng.bool(), k = geo ? rng.pick([1, 2, 3, -1, 4]) : rng.int(-10, 10), step = geo ? rng.pick([2, 3, -2]) : rng.nz(-8, 8);
        const t = [k]; for (let i = 1; i < 5; i++) t.push(geo ? t[i - 1] * step : t[i - 1] + step);
        const rule = geo ? `${an} = ${N(step)} · ${V('a')}(${V('n')} − 1)` : `${an} = ${V('a')}(${V('n')} − 1) ${M.signed(step)}`;
        return { prompt: `A sequence is defined by ${V('a')}(1) = ${N(k)} and ${rule}. What is ${V('a')}(5)?`, type: 'number', answer: t[4], params: { kind, geo, k, step },
          hints: [`The rule says each term is the previous one ${geo ? `times ${N(step)}` : (step < 0 ? `minus ${N(-step)}` : `plus ${N(step)}`)}.`, `${V('a')}(2) = ${N(t[1])}, ${V('a')}(3) = ${N(t[2])}, ${V('a')}(4) = ${N(t[3])}.`, `${V('a')}(5) = <b>${N(t[4])}</b>.`] };
      }
      const a1 = rng.nz(-20, 20), d = rng.nz(-9, 9), t = [0, 1, 2, 3].map(i => a1 + i * d);
      if (kind === 'arith-formula') {
        const opts = [[a1, d, 1], [d, a1, 1], [a1, d, 0], [a1, -d, 1], [a1 - d, d, 1]], html = opts.map(seqH);
        const answer = html[0];
        return { prompt: `Which explicit formula gives this arithmetic sequence?${big(t.map(N).join(', ') + ', …')}`, type: 'choice', choices: [answer].concat(others(answer, html.slice(1), 3)), answer, params: { kind, t, opts, html },
          hints: [`The first term is ${N(a1)} and the common difference is ${N(t[1])} − ${wrap(t[0])} = ${N(d)}.`, `Use ${an} = ${M.sub(V('a'), 1)} + ${V('d')}(${V('n')} − 1). Check ${V('n')} = 1: it must give ${N(a1)}.`, `<b>${answer}</b>.`] };
      }
      const n = rng.int(10, 40), ans = a1 + (n - 1) * d;
      return { prompt: `What is the ${M.ordinal(n)} term of this arithmetic sequence?${big(t.map(N).join(', ') + ', …')}`, type: 'number', answer: ans, params: { kind, t, n },
        hints: [`The common difference is ${N(t[1])} − ${wrap(t[0])} = ${N(d)}.`, `${V('a')}(${n}) = ${N(a1)} + ${wrap(d)}(${n} − 1) = ${N(a1)} + ${wrap(d)}(${n - 1}).`, `= ${N(a1)} ${M.signed((n - 1) * d)} = <b>${N(ans)}</b>.`] };
    },
    challenge(rng) {
      // which term is it? Work the formula backwards
      if (rng.chance(0.4)) {
        const a1 = rng.pick([1, 2, 3, 5, 7]) * rng.sign(), r = rng.pick([2, 3, -2]), n = rng.int(6, r === 3 ? 8 : 10);
        const t = [0, 1, 2, 3].map(i => a1 * Math.pow(r, i)), target = a1 * Math.pow(r, n - 1);
        return { prompt: `Which term of this geometric sequence is ${N(target)}? Give its position ${V('n')}.${big(t.map(N).join(', ') + ', …')}`, type: 'number', answer: n, params: { kind: 'which-term', t, target },
          hints: [`The common ratio is ${N(r)}, so ${an} = ${N(a1)} · ${wrap(r)}<sup>${V('n')} − 1</sup>.`, `${N(target)} ÷ ${wrap(a1)} = ${N(target / a1)}, which is ${wrap(r)}<sup>${n - 1}</sup>.`, `So ${V('n')} − 1 = ${n - 1} and ${V('n')} = <b>${n}</b>.`] };
      }
      const a1 = rng.int(-30, 30), d = rng.nz(-9, 9), n = rng.int(25, 90), t = [0, 1, 2, 3].map(i => a1 + i * d), target = a1 + (n - 1) * d;
      return { prompt: `Which term of this arithmetic sequence is ${N(target)}? Give its position ${V('n')}.${big(t.map(N).join(', ') + ', …')}`, type: 'number', answer: n, params: { kind: 'which-term', t, target },
        hints: [`The first term is ${N(a1)} and the common difference is ${N(d)}, so ${an} = ${N(a1)} + ${wrap(d)}(${V('n')} − 1).`, `Set it equal to ${N(target)}: ${wrap(d)}(${V('n')} − 1) = ${N(target - a1)}, so ${V('n')} − 1 = ${N(n - 1)}.`, `${V('n')} = <b>${n}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'classify') {
        const diffs = P.t.slice(1).map((v, i) => v - P.t[i]), ratios = P.t.slice(1).map((v, i) => v / P.t[i]);
        const expect = diffs.every(x => x === diffs[0]) ? 'Arithmetic' : ratios.every(x => Math.abs(x - ratios[0]) < 1e-12) ? 'Geometric' : 'Neither';
        return q.answer === expect;
      }
      if (P.kind === 'which-term') {
        // step along the sequence until the target turns up, counting the terms
        const geo = P.t[1] - P.t[0] !== P.t[2] - P.t[1];
        let v = P.t[0], i = 1;
        while (i < 500 && v !== P.target) { v = geo ? v * (P.t[1] / P.t[0]) : v + (P.t[1] - P.t[0]); i++; }
        return v === P.target && i === q.answer;
      }
      if (P.kind === 'recursive') { let v = P.k; for (let i = 2; i <= 5; i++) v = P.geo ? v * P.step : v + P.step; return v === q.answer; }
      if (P.kind === 'arith-formula') {
        const i = P.html.indexOf(q.answer); if (i < 0) return 'not an option';
        const [A0, D, s] = P.opts[i]; return P.t.every((v, k) => A0 + D * (k + 1 - s) === v);
      }
      let v = P.t[0];
      for (let i = 2; i <= P.n; i++) v = P.kind === 'geo-nth' || P.geo ? v * (P.t[1] / P.t[0]) : v + (P.t[1] - P.t[0]);
      return Math.abs(v - q.answer) < 1e-9;
    },
  });

  const solH = (u, w) => `${X} = ${N(Math.min(u, w))} or ${X} = ${N(Math.max(u, w))}`;
  A.skill({
    id: 'alg1.absolute-value-equations', title: 'Absolute value equations',
    learn: p(`The <b>absolute value</b> |${V('A')}| is the distance of ${V('A')} from zero, so it’s never negative. |${V('A')}| = ${V('c')} means ${V('A')} is ${V('c')} units from zero, so <b>${V('A')} = ${V('c')} or ${V('A')} = −${V('c')}</b>. That’s why an absolute value equation usually has two solutions.`) +
      p(`First <b>isolate the absolute value</b>: get it by itself on one side by undoing anything added to it or multiplying it. Then split into the two cases and solve each one. If the isolated absolute value equals a <b>negative</b> number, there’s <b>no solution</b>, because a distance can’t be negative. If it equals 0, there’s just one solution.`) +
      example('Example 1: two solutions', `${big(`2|${X} − 3| + 1 = 9`)}Subtract 1 and divide by 2: |${X} − 3| = 4. So ${X} − 3 = 4 or ${X} − 3 = −4, giving <b>${X} = −1 or ${X} = 7</b>.`) +
      example('Example 2: no solution', `${big(`3|${X} + 2| + 10 = 4`)}Subtract 10: 3|${X} + 2| = −6. Divide by 3: |${X} + 2| = −2. An absolute value can’t be negative, so there’s <b>no solution</b>.`),
    make(rng) {
      const a = rng.pick([1, 1, 2, 3]); let d = rng.int(1, 8); if ((a * d) % 2) d += 1;
      const c = a * d / 2, s1 = rng.int(-6, 8), s2 = s1 - d, b = c - a * s1, m = rng.pick([1, 1, 2, 3]), k = rng.int(-9, 9), none = rng.chance(0.25);
      const r = none ? k - m * c : m * c + k;
      const lhs = `${m === 1 ? '' : N(m)}|${sumHtml([[a, 'x', 1], [b, '', 0]])}|${k ? ' ' + M.signed(k) : ''}`;
      const iso = none ? -c : c;
      const answer = none ? 'No solution' : solH(s1, s2);
      const wrong = none ? [solH(s1, s2), solH(-s1, -s2), `${X} = ${N(s1)}`, `${X} = ${N(s2)}`] : [solH(-s1, -s2), `${X} = ${N(s1)}`, 'No solution', `${X} = ${N(s2)}`];
      const hints = [`Isolate the absolute value: ${k ? `${k < 0 ? 'add' : 'subtract'} ${N(Math.abs(k))}` : ''}${k && m !== 1 ? ', then ' : ''}${m !== 1 ? `divide by ${m}` : ''}${!k && m === 1 ? 'it is already alone' : ''}. You get |${sumHtml([[a, 'x', 1], [b, '', 0]])}| = ${N(iso)}.`];
      if (none) hints.push(`An absolute value is never negative, so it cannot equal ${N(iso)}.`, `<b>No solution</b>.`);
      else hints.push(`Split: ${sumHtml([[a, 'x', 1], [b, '', 0]])} = ${N(c)} or ${sumHtml([[a, 'x', 1], [b, '', 0]])} = ${N(-c)}.`, `Solve each: <b>${answer}</b>.`);
      return { prompt: `Solve.${big(`${lhs} = ${N(r)}`)}`, type: 'choice', choices: [answer].concat(others(answer, wrong, 3)), answer, params: { a, b, m, k, r }, hints };
    },
    challenge(rng) {
      // a negative number outside the bars, an absolute value that is zero, or one that is negative
      const a = rng.pick([2, 3, 4]), m = rng.pick([-3, -2, 2, 3, 4]), k = rng.nz(-12, 12), type = rng.pick(['two', 'two', 'none', 'one']);
      let d = rng.int(1, 6); if ((a * d) % 2) d += 1;
      const s1 = rng.int(-6, 8), c = type === 'one' ? 0 : a * d / 2, b = c - a * s1, s2 = s1 - d, iso = type === 'none' ? -c : c, r = m * iso + k;
      const inner = sumHtml([[a, 'x', 1], [b, '', 0]]);
      const answer = type === 'none' ? 'No solution' : type === 'one' ? `${X} = ${N(s1)}` : solH(s1, s2);
      const wrong = type === 'none' ? [solH(s1, s2), `${X} = ${N(s1)}`, solH(-s1, -s2), `${X} = ${N(s2)}`]
        : type === 'one' ? ['No solution', solH(s1, s1 ? -s1 : 2), `${X} = ${N(s1 ? -s1 : 3)}`, `${X} = ${N(s1 + 1)}`]
        : [solH(-s1, -s2), 'No solution', `${X} = ${N(s1)}`, `${X} = ${N(s2)}`];
      const hints = [`Isolate the absolute value: ${k < 0 ? 'add' : 'subtract'} ${N(Math.abs(k))}, then divide by ${N(m)}${m < 0 ? ', a negative number, so the sign of the other side changes' : ''}. You get |${inner}| = ${N(iso)}.`];
      if (type === 'none') hints.push(`An absolute value is never negative, so it can’t equal ${N(iso)}.`, '<b>No solution</b>.');
      else if (type === 'one') hints.push(`Only 0 has an absolute value of 0, so ${inner} = 0: just one solution.`, `<b>${answer}</b>.`);
      else hints.push(`Split: ${inner} = ${N(c)} or ${inner} = ${N(-c)}.`, `Solve each: <b>${answer}</b>.`);
      return { prompt: `Solve.${big(`${N(m)}|${inner}| ${M.signed(k)} = ${N(r)}`)}`, type: 'choice', choices: [answer].concat(others(answer, wrong, 3)), answer, params: { a, b, m, k, r }, hints };
    },
    verify(q) {
      const { a, b, m, k, r } = q.params, f = x => m * Math.abs(a * x + b) + k;
      const sols = []; for (let x = -100; x <= 100; x += 0.5) if (f(x) === r) sols.push(x);
      const s = plain(q.answer);
      if (s === 'No solution') return sols.length === 0 && (m > 0 ? f(-b / a) > r : f(-b / a) < r);     // the vertex of the V is on the wrong side of r
      const got = (s.match(/-?\d+(\.\d+)?/g) || []).map(Number);
      return got.length === sols.length && got.every((v, i) => v === sols[i]);
    },
  });

  A.skill({
    id: 'alg1.piecewise-functions', title: 'Piecewise and absolute value functions',
    learn: p(`A <b>piecewise function</b> uses different rules on different parts of its domain. To evaluate it, first <b>find which condition the input satisfies</b>, then use only that piece’s rule. Watch the endpoints: “${X} &lt; 2” leaves 2 out, while “${X} ≥ 2” includes it.`) +
      p(`The absolute value function ${V('g')}(${X}) = ${V('a')}|${X} − ${V('h')}| + ${V('k')} is a V-shaped piecewise function. Its <b>vertex</b>, the point of the V, is ${M.pt(V('h'), V('k'))}. It opens up when ${V('a')} &gt; 0 and down when ${V('a')} &lt; 0. As with parabolas, the number inside the bars has the opposite sign of ${V('h')}: |${X} + 3| has ${V('h')} = −3.`) +
      example('Example 1: evaluating a piecewise function', `${V('f')}(${X}) = ${X} + 4 if ${X} &lt; 1, and 3${X} if ${X} ≥ 1. For ${V('f')}(1), the input 1 fits ${X} ≥ 1 (not ${X} &lt; 1), so ${V('f')}(1) = 3(1) = <b>3</b>.`) +
      example('Example 2: an absolute value function', `${V('g')}(${X}) = −2|${X} + 3| + 5. The bars are zero at ${X} = −3, so the vertex is <b>${M.pt(-3, 5)}</b>, and the V opens down because −2 &lt; 0. To evaluate: ${V('g')}(1) = −2|4| + 5 = <b>−3</b>.`),
    make(rng) {
      const kind = rng.pick(['eval', 'eval', 'abs-vertex', 'abs-eval']);
      if (kind === 'eval') {
        const pb = rng.int(-4, 1), qb = pb + rng.int(2, 5);
        const p1 = [0, rng.nz(-4, 4), rng.int(-6, 6)], p2 = rng.bool() ? [1, 0, rng.int(-6, 6)] : [0, rng.nz(-4, 4), rng.int(-6, 6)], p3 = [0, 0, rng.int(-9, 9)];
        const x = rng.pick([pb - 2, pb - 1, pb, pb + 1, qb - 1, qb, qb + 2]);
        const pieces = [[p1, `${X} &lt; ${N(pb)}`], [p2, `${N(pb)} ≤ ${X} &lt; ${N(qb)}`], [p3, `${X} ≥ ${N(qb)}`]];
        const idx = x < pb ? 0 : x < qb ? 1 : 2, [A2, B1, C0] = pieces[idx][0], ans = A2 * x * x + B1 * x + C0;
        return { prompt: `Find ${V('f')}(${N(x)}).${M.table([`${V('f')}(${X}) =`, 'when'], pieces.map(([c, cond]) => [M.poly(c.slice(c[0] ? 0 : c[1] ? 1 : 2)), cond]))}`, type: 'number', answer: ans, params: { kind, pb, qb, p1, p2, p3, x },
          hints: [`Check the conditions with ${X} = ${N(x)}: it satisfies ${pieces[idx][1]}.`, `Use that rule: ${M.poly(pieces[idx][0].slice(A2 ? 0 : B1 ? 1 : 2))} with ${X} = ${wrap(x)}.`, `${V('f')}(${N(x)}) = <b>${N(ans)}</b>.`] };
      }
      const a = rng.pick([1, -1, 2, -2, 3, 0.5]), h = rng.nz(-6, 6); let k = rng.nz(-7, 7); if (Math.abs(k) === Math.abs(h)) k = k > 0 ? k + 1 : k - 1;
      const gH = `${V('g')}(${X}) = ${a === 1 ? '' : a === -1 ? '−' : N(a)}|${X} ${M.signed(-h)}| ${M.signed(k)}`;
      if (kind === 'abs-eval') {
        const x = h + rng.nz(-6, 6), ans = a * Math.abs(x - h) + k;
        return { prompt: `${gH}. Find ${V('g')}(${N(x)}).`, type: 'number', answer: ans, params: { kind, a, h, k, x },
          hints: [`Inside the bars: ${N(x)} ${M.signed(-h)} = ${N(x - h)}, and |${N(x - h)}| = ${N(Math.abs(x - h))}.`, `Then ${N(a)} · ${N(Math.abs(x - h))} ${M.signed(k)}.`, `${V('g')}(${N(x)}) = <b>${N(ans)}</b>.`] };
      }
      const answer = M.pt(h, k), choices = [answer, M.pt(-h, k), M.pt(h, -k), M.pt(k, h)];
      return { prompt: `What is the vertex of the graph of this function?${big(gH)}`, type: 'choice', choices, answer, params: { kind, a, h, k },
        hints: [`The vertex is where the inside of the bars is 0: ${X} ${M.signed(-h)} = 0, so ${X} = ${N(h)}.`, `At ${X} = ${N(h)} the output is ${N(a)} · 0 ${M.signed(k)} = ${N(k)}.`, `The vertex is <b>${answer}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'eval') {
        const use = P.x >= P.qb ? P.p3 : P.x >= P.pb ? P.p2 : P.p1;
        return q.answer === use[0] * P.x * P.x + use[1] * P.x + use[2];
      }
      const g = x => P.a * Math.abs(x - P.h) + P.k;
      if (P.kind === 'abs-eval') return Math.abs(g(P.x) - q.answer) < 1e-9;
      for (let x = -10; x <= 10; x++) if (x !== P.h && (g(x) - g(P.h)) * P.a <= 0) return 'vertex is not the extreme';
      return q.answer === M.pt(P.h, g(P.h));
    },
  });

  /* ---------- Unit 7: Exponents, radicals, and exponential growth ---------- */
  const xp = e => M.sup(X, N(e));
  const RAT_EXP = [[8, 1, 3], [8, 2, 3], [27, 1, 3], [27, 2, 3], [16, 1, 2], [16, 3, 4], [16, 1, 4], [32, 2, 5], [25, 3, 2], [9, 3, 2], [64, 2, 3], [64, 5, 6], [81, 3, 4], [4, -1, 2], [8, -2, 3], [125, 2, 3], [36, 1, 2], [49, 3, 2]];

  A.skill({
    id: 'alg1.exponent-properties', title: 'Exponent properties and rational exponents',
    learn: p(`In a power such as ${M.sup(V('a'), V('n'))}, ${V('a')} is the <b>base</b> and ${V('n')} is the <b>exponent</b>, which counts how many times the base is multiplied. When the bases match: <b>multiply powers by adding exponents</b>, ${M.sup(V('a'), V('m'))} · ${M.sup(V('a'), V('n'))} = ${V('a')}<sup>${V('m')}+${V('n')}</sup>; <b>divide by subtracting</b>, ${M.sup(V('a'), V('m'))} ÷ ${M.sup(V('a'), V('n'))} = ${V('a')}<sup>${V('m')}−${V('n')}</sup>; and for a <b>power of a power, multiply</b>, (${M.sup(V('a'), V('m'))})<sup>${V('n')}</sup> = ${V('a')}<sup>${V('m')}${V('n')}</sup>.`) +
      p(`A power of a product raises every factor, the number included. <b>Zero and negative exponents:</b> ${M.sup(V('a'), 0)} = 1, and a negative exponent means a reciprocal (1 divided by the number): ${M.sup(V('a'), '−' + V('n'))} = 1 ÷ ${M.sup(V('a'), V('n'))}, so 2<sup>−3</sup> = ${F(1, 8)}.`) +
      p(`<b>Rational exponents</b>, exponents that are fractions, mean roots: ${V('a')}<sup>1/${V('n')}</sup> is the ${V('n')}th root of ${V('a')}, and ${V('a')}<sup>${V('m')}/${V('n')}</sup> is that root raised to the ${V('m')}th power. Taking the root first keeps the numbers small.`) +
      example('Example 1: same base', `${M.sup(X, 5)} · ${M.sup(X, '−2')} = ${M.sup(X, 3)} (add: 5 + (−2) = 3). ${M.sup(X, 4)} ÷ ${M.sup(X, 7)} = ${M.sup(X, '−3')} (subtract: 4 − 7). (${M.sup(X, 3)})<sup>4</sup> = <b>${M.sup(X, 12)}</b> (multiply: 3 × 4).`) +
      example('Example 2: a power of a product', `${big(`(−2${M.sup(X, 3)})<sup>4</sup>`)}The 4th power applies to −2 and to ${M.sup(X, 3)}: (−2)<sup>4</sup> = 16 and (${M.sup(X, 3)})<sup>4</sup> = ${M.sup(X, 12)}, so the result is <b>16${M.sup(X, 12)}</b>.`) +
      example('Example 3: negative exponents', `5<sup>−2</sup> = ${F(1, 25)}. For a fraction, a negative exponent flips it: (${F(2, 3)})<sup>−2</sup> = (${F(3, 2)})² = <b>${F(9, 4)}</b>.`) +
      example('Example 4: a rational exponent', `${big('27<sup>2/3</sup>')}The denominator 3 means a cube root: the cube root of 27 is 3. Then square it: 3² = <b>9</b>.`),
    make(rng) {
      const kind = rng.pick(['product', 'quotient', 'power', 'neg', 'rational', 'rational', 'mono']);
      if (kind === 'rational') {
        const [b, n, d] = rng.pick(RAT_EXP), root = Math.round(Math.pow(b, 1 / d)), val = Math.pow(root, n), [sn, sd] = n < 0 ? [1, Math.pow(root, -n)] : [val, 1];
        return { prompt: `Evaluate.${big(`${b}<sup>${N(n)}/${d}</sup>`)}`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, b, n, d },
          hints: [`The denominator ${d} means a ${d === 2 ? 'square' : d === 3 ? 'cube' : M.ordinal(d)} root: the ${d === 2 ? 'square' : d === 3 ? 'cube' : M.ordinal(d)} root of ${b} is ${root}.`, n < 0 ? `The negative sign means a reciprocal: ${root}<sup>${N(n)}</sup> = 1 ÷ ${root}<sup>${-n}</sup>.` : `Now raise it to the power ${n}: ${root}<sup>${n}</sup>.`, `<b>${M.fracText(sn, sd)}</b>.`] };
      }
      if (kind === 'neg') {
        const fr = rng.chance(0.35);
        if (fr) { const [u, w] = rng.pick([[2, 3], [3, 4], [1, 2], [2, 5], [3, 2]]), e = rng.pick([1, 2]), [sn, sd] = M.simp(Math.pow(w, e), Math.pow(u, e));
          return { prompt: `Evaluate.${big(`(${F(u, w)})<sup>${N(-e)}</sup>`)}`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, u, w, e },
            hints: ['A negative exponent flips the fraction.', `(${F(u, w)})<sup>${N(-e)}</sup> = (${F(w, u)})<sup>${e}</sup>.`, `<b>${M.fracText(sn, sd)}</b>.`] }; }
        const b = rng.pick([2, 3, 4, 5, 10]), e = rng.int(1, b === 2 ? 5 : 3), den = Math.pow(b, e);
        return { prompt: `Evaluate. Give your answer as a fraction.${big(`${b}<sup>${N(-e)}</sup>`)}`, type: 'number', answer: 1 / den, answerText: M.fracText(1, den), params: { kind, u: b, w: 1, e },
          hints: [`A negative exponent means a reciprocal: ${b}<sup>${N(-e)}</sup> = 1 ÷ ${b}<sup>${e}</sup>.`, `${b}<sup>${e}</sup> = ${N(den)}.`, `<b>${M.fracText(1, den)}</b>.`] };
      }
      if (kind === 'mono') {
        const c = rng.pick([2, 3, -2, 5, -3]), a = rng.int(2, 5), b = rng.pick([2, 3]), cb = Math.pow(c, b);
        const answer = M.term(cb, 'x', a * b), wrong = [M.term(c * b, 'x', a * b), M.term(cb, 'x', a + b), M.term(c, 'x', a * b), M.term(cb, 'x', a)];
        return { prompt: `Simplify.${big(`(${M.term(c, 'x', a)})<sup>${b}</sup>`)}`, type: 'choice', choices: [answer].concat(others(answer, wrong, 3)), answer, params: { kind, c, a, b, coef: cb, pw: a * b },
          hints: [`The power ${b} applies to the number and to ${xp(a)}.`, `${wrap(c)}<sup>${b}</sup> = ${N(cb)}, and (${xp(a)})<sup>${b}</sup> = ${xp(a * b)} (multiply the exponents).`, `<b>${answer}</b>.`] };
      }
      const a = rng.nz(-6, 9), b = kind === 'power' ? rng.nz(-4, 4) : rng.nz(-6, 9);
      const n = kind === 'product' ? a + b : kind === 'quotient' ? a - b : a * b;
      const expr = kind === 'product' ? `${xp(a)} · ${xp(b)}` : kind === 'quotient' ? F(xp(a), xp(b)) : `(${xp(a)})<sup>${N(b)}</sup>`;
      const rule = kind === 'product' ? `Multiplying powers of the same base: add the exponents, ${N(a)} + ${wrap(b)}.` : kind === 'quotient' ? `Dividing powers of the same base: subtract the exponents, ${N(a)} − ${wrap(b)}.` : `A power of a power: multiply the exponents, ${N(a)} × ${wrap(b)}.`;
      return { prompt: `Simplify, writing the result as ${M.sup(X, V('n'))}. What is ${V('n')}?${big(expr)}`, type: 'number', answer: n, params: { kind, a, b },
        hints: [rule, `So the result is ${xp(n)}${n < 0 ? `, which can also be written ${F(1, xp(-n))}` : ''}.`, `<b>${V('n')} = ${N(n)}</b>.`] };
    },
    challenge(rng) {
      if (rng.bool()) {
        // a fraction to a fractional, possibly negative, power
        const [pp, qq] = rng.pick([[2, 3], [3, 2], [1, 2], [2, 5], [3, 4], [4, 3], [1, 3], [5, 2]]), d = rng.pick([2, 3]), n = rng.pick([-3, -2, -1, 2, 3]);
        const u = Math.pow(pp, d), w = Math.pow(qq, d), [sn, sd] = n > 0 ? M.simp(Math.pow(pp, n), Math.pow(qq, n)) : M.simp(Math.pow(qq, -n), Math.pow(pp, -n)), root = d === 2 ? 'square' : 'cube';
        return { prompt: `Evaluate. Give your answer as a fraction.${big(`(${F(u, w)})<sup>${N(n)}/${d}</sup>`)}`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind: 'ratfrac', u, w, n, d },
          hints: [`The denominator ${d} means a ${root} root of the top and of the bottom: the ${root} root of ${F(u, w)} is ${F(pp, qq)}.`, n < 0 ? `The negative exponent flips the fraction: (${F(qq, pp)})<sup>${-n}</sup>.` : `Now raise it to the power ${n}: (${F(pp, qq)})<sup>${n}</sup>.`, `<b>${M.fracText(sn, sd)}</b>.`] };
      }
      // three rules in one expression
      const a = rng.nz(-5, 6), b = rng.nz(-4, 4), c = rng.nz(-7, 7), d = rng.nz(-7, 7), n = a * b + c - d;
      return { prompt: `Simplify, writing the result as ${M.sup(X, V('n'))}. What is ${V('n')}?${big(F(`(${xp(a)})<sup>${N(b)}</sup> · ${xp(c)}`, xp(d)))}`, type: 'number', answer: n, params: { kind: 'combo', a, b, c, d },
        hints: [`Power of a power first: (${xp(a)})<sup>${N(b)}</sup> = ${xp(a * b)}.`, `Multiplying by ${xp(c)} adds exponents: ${N(a * b)} + ${wrap(c)} = ${N(a * b + c)}. Dividing by ${xp(d)} subtracts: ${N(a * b + c)} − ${wrap(d)} = ${N(n)}.`, `<b>${V('n')} = ${N(n)}</b>.`] };
    },
    verify(q) {
      const P = q.params, t = 1.7, close = (u, w) => Math.abs(u - w) <= 1e-9 * Math.max(1, Math.abs(w));
      if (P.kind === 'rational') return close(Math.pow(P.b, P.n / P.d), q.answer);
      if (P.kind === 'ratfrac') return close(Math.pow(P.u / P.w, P.n / P.d), q.answer);
      if (P.kind === 'combo') return close(Math.pow(t, q.answer), Math.pow(Math.pow(t, P.a), P.b) * Math.pow(t, P.c) / Math.pow(t, P.d));
      if (P.kind === 'neg') return close(Math.pow(P.u / P.w, -P.e), q.answer);
      if (P.kind === 'mono') return q.answer === M.term(P.coef, 'x', P.pw) && close(P.coef * Math.pow(t, P.pw), Math.pow(P.c * Math.pow(t, P.a), P.b));
      const lhs = P.kind === 'product' ? Math.pow(t, P.a) * Math.pow(t, P.b) : P.kind === 'quotient' ? Math.pow(t, P.a) / Math.pow(t, P.b) : Math.pow(Math.pow(t, P.a), P.b);
      return close(Math.pow(t, q.answer), lhs);
    },
  });

  const rad = (k, m) => (k === 1 ? M.sqrt(m) : N(k) + M.sqrt(m));
  /** n = k²·m with m square-free, found by trying every square */
  function splitRoot(n) { let k = 1; for (let j = 2; j * j <= n; j++) if (n % (j * j) === 0) k = j; return [k, n / (k * k)]; }
  const SQFREE = [2, 3, 5, 6, 7, 10, 11];

  A.skill({
    id: 'alg1.simplify-roots', title: 'Simplifying square roots',
    learn: p(`A <b>perfect square</b> is a whole number times itself: 4, 9, 16, 25, 36, … A square root is <b>simplified</b> when no perfect square bigger than 1 divides the number under the root sign. To simplify, use <b>√(${V('a')}${V('b')}) = √${V('a')} · √${V('b')}</b>: split the number into its <b>largest perfect square factor</b> times what’s left, then take the root of the square.`) +
      p(`Using a smaller square works too, but then you have to keep going: √72 = √(4 · 18) = 2√18 = 2 · 3√2 = 6√2.`) +
      p(`To multiply roots, multiply the numbers under one root and simplify. To add or subtract roots, simplify each one first. Only <b>like radicals</b>, roots with the same number under the sign, can be combined, just as with like terms.`) +
      example('Example 1: simplifying', `${big(M.sqrt(72))}The largest perfect square that divides 72 is 36: ${M.sqrt(72)} = ${M.sqrt('36 · 2')} = <b>6${M.sqrt(2)}</b>.`) +
      example('Example 2: multiplying', `${big(`${M.sqrt(6)} · ${M.sqrt(10)}`)}Multiply under one root: ${M.sqrt(60)}. The largest perfect square factor of 60 is 4: ${M.sqrt('4 · 15')} = <b>2${M.sqrt(15)}</b>.`) +
      example('Example 3: adding', `${big(`${M.sqrt(12)} + 5${M.sqrt(3)}`)}${M.sqrt(12)} = ${M.sqrt('4 · 3')} = 2${M.sqrt(3)}. Then 2${M.sqrt(3)} + 5${M.sqrt(3)} = <b>7${M.sqrt(3)}</b>.`),
    make(rng) {
      const kind = rng.pick(['simplify', 'simplify', 'multiply', 'add']);
      if (kind === 'multiply') {
        const s = rng.pick([2, 3, 5]), m = rng.pick(SQFREE.filter(v => v !== s)), t = rng.pick([1, 1, 2]), a = m * s, b = s * t * t, k = s * t;
        const answer = rad(k, m), wrong = [rad(1, a * b), rad(m, k), rad(k * k, m), rad(s, m * t)];
        return { prompt: `Multiply and simplify.${big(`${M.sqrt(a)} · ${M.sqrt(b)}`)}`, type: 'choice', choices: [answer].concat(others(answer, wrong, 3)), answer, params: { kind, a, b },
          hints: [`Multiply under one root: ${M.sqrt(a)} · ${M.sqrt(b)} = ${M.sqrt(a * b)}.`, `The largest perfect square factor of ${a * b} is ${k * k}: ${M.sqrt(`${k * k} · ${m}`)}.`, `<b>${answer}</b>.`] };
      }
      if (kind === 'add') {
        const m = rng.pick([2, 3, 5, 6, 7]), u = rng.int(1, 4); let w = rng.int(2, 4); if (w === u) w = u === 4 ? 2 : u + 1;
        const pc = rng.int(1, 4), qc = rng.int(1, 3), total = pc * u + qc * w;
        const t1 = pc === 1 ? M.sqrt(u * u * m) : N(pc) + M.sqrt(u * u * m), t2 = qc === 1 ? M.sqrt(w * w * m) : N(qc) + M.sqrt(w * w * m);
        const answer = rad(total, m), wrong = [rad(pc + qc, m), rad(pc + qc, u * u * m + w * w * m), rad(total, 2 * m), rad(pc * qc * u * w, m)];
        return { prompt: `Simplify.${big(`${t1} + ${t2}`)}`, type: 'choice', choices: [answer].concat(others(answer, wrong, 3)), answer, params: { kind, terms: [[pc, u * u * m], [qc, w * w * m]] },
          hints: [`Simplify each root first: ${M.sqrt(u * u * m)} = ${rad(u, m)} and ${M.sqrt(w * w * m)} = ${rad(w, m)}.`, `Now both are multiples of ${M.sqrt(m)}: ${N(pc * u)}${M.sqrt(m)} + ${N(qc * w)}${M.sqrt(m)}.`, `Add the coefficients: <b>${answer}</b>.`] };
      }
      const m = rng.pick(SQFREE), k = rng.int(2, m <= 3 ? 10 : 6), n = k * k * m;
      let part = null; for (let j = 2; j < k; j++) if (k % j === 0) part = rad(k / j, m * j * j);
      const answer = rad(k, m), wrong = [part, rad(k * k, m), rad(m, k), rad(2 * k, m), rad(k, m * 2)];
      return { prompt: `Simplify.${big(M.sqrt(n))}`, type: 'choice', choices: [answer].concat(others(answer, wrong, 3)), answer, params: { kind, n },
        hints: [`Look for the largest perfect square that divides ${n}: it is ${k * k} = ${k}².`, `${M.sqrt(n)} = ${M.sqrt(`${k * k} · ${m}`)} = ${M.sqrt(k * k)} · ${M.sqrt(m)}.`, `<b>${answer}</b>.`] };
    },
    challenge(rng) {
      // three roots that all simplify to multiples of the same root, some subtracted
      const m = rng.pick([2, 3, 5, 6, 7]), us = rng.sample([1, 2, 3, 4, 5], 3);
      const cs = us.map((u, i) => (i === 0 ? rng.int(1, 3) : rng.sign() * rng.int(1, 4)));
      let total = cs.reduce((acc, c, i) => acc + c * us[i], 0);
      if (total === 0 || total === -1) { cs[0] += 1; total += us[0]; }
      const terms = cs.map((c, i) => [c, us[i] * us[i] * m]), answer = rad(total, m);
      const show = terms.map(([c, r], i) => `${i ? (c < 0 ? ' − ' : ' + ') : ''}${Math.abs(c) === 1 ? '' : N(Math.abs(c))}${M.sqrt(r)}`).join('');
      const wrong = [rad(cs.reduce((acc, c) => acc + c, 0) || 2, m), rad(cs.reduce((acc, c, i) => acc + Math.abs(c) * us[i], 0), m), rad(total, 2 * m), rad(-total, m), rad(cs.reduce((acc, c, i) => acc + c * us[i] * us[i], 0) || 3, m)];
      return { prompt: `Simplify.${big(show)}`, type: 'choice', choices: [answer].concat(others(answer, wrong, 3)), answer, params: { kind: 'add', terms },
        hints: [`Simplify each root first: ${terms.map(([, r], i) => `${M.sqrt(r)} = ${rad(us[i], m)}`).join(', ')}.`, `Now every term is a multiple of ${M.sqrt(m)}. Combine the coefficients, signs included: ${cs.map((c, i) => (i ? ` ${c < 0 ? '−' : '+'} ` : '') + N(i ? Math.abs(c * us[i]) : c * us[i])).join('')} = ${N(total)}.`, `<b>${answer}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'simplify') return q.answer === rad(...splitRoot(P.n));
      if (P.kind === 'multiply') return q.answer === rad(...splitRoot(P.a * P.b));
      const parts = P.terms.map(([c, r]) => { const [k, m] = splitRoot(r); return [c * k, m]; });
      return parts.every(pt => pt[1] === parts[0][1]) && q.answer === rad(parts.reduce((acc, pt) => acc + pt[0], 0), parts[0][1]);
    },
  });

  const isSq = n => Number.isInteger(n) && n >= 0 && Math.round(Math.sqrt(n)) ** 2 === n;
  const NONSQ = [2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15, 17, 18, 19, 20, 24, 30];
  const RAT_GENS = [
    rng => { const k = rng.int(2, 12); return { kind: 'sqrt', n: k * k, h: M.sqrt(k * k), why: `${M.sqrt(k * k)} = ${k}, a whole number` }; },
    rng => { const a = rng.int(1, 9), b = rng.pick([7, 9, 11, 13]); return { kind: 'frac', h: F(a, b, { raw: true }), why: 'a fraction of two integers is rational by definition' }; },
    rng => { const d = rng.pick(['3', '6', '27', '45', '18']); return { kind: 'rep', h: `0.<span style="text-decoration: overline">${d}</span>`, why: 'a repeating decimal can be written as a fraction' }; },
    rng => { const v = rng.dec(1, 9, 2); return { kind: 'dec', h: N(v), why: 'a terminating decimal is a fraction over a power of 10' }; },
    rng => { const [u, w] = rng.pick([[4, 9], [1, 16], [9, 25], [16, 49], [1, 4]]); return { kind: 'sqrtfrac', a: u, b: w, h: M.sqrt(F(u, w)), why: `${M.sqrt(F(u, w))} = ${F(Math.sqrt(u), Math.sqrt(w))}` }; },
    rng => { const m = rng.pick([2, 3, 5]), t = rng.int(1, 3); return { kind: 'prod', a: m, b: m * t * t, h: `${M.sqrt(m)} · ${M.sqrt(m * t * t)}`, why: `${M.sqrt(m)} · ${M.sqrt(m * t * t)} = ${M.sqrt(m * m * t * t)} = ${m * t}` }; },
    rng => { const m = rng.pick([2, 3, 5]), t = rng.int(2, 5); return { kind: 'quot', a: m * t * t, b: m, h: `${F(M.sqrt(m * t * t), M.sqrt(m))}`, why: `the quotient is ${M.sqrt(t * t)} = ${t}` }; },
  ];
  const IRR_GENS = [
    rng => { const n = rng.pick(NONSQ); return { kind: 'sqrt', n, h: M.sqrt(n), why: `${n} is not a perfect square, so ${M.sqrt(n)} is irrational` }; },
    () => ({ kind: 'pi', h: 'π', why: 'π is irrational: its decimals never end or repeat' }),
    rng => { const k = rng.int(1, 9), n = rng.pick(NONSQ); return { kind: 'int+sqrt', k, n, h: `${k} + ${M.sqrt(n)}`, why: `a rational number plus an irrational number is irrational` }; },
    rng => { const [u, w] = rng.pick([[2, 3], [3, 5], [2, 7], [5, 6], [3, 7]]); return { kind: 'prod', a: u, b: w, h: `${M.sqrt(u)} · ${M.sqrt(w)}`, why: `${M.sqrt(u)} · ${M.sqrt(w)} = ${M.sqrt(u * w)}, and ${u * w} is not a perfect square` }; },
    () => ({ kind: 'nonrep', h: '0.1010010001…', why: 'the pattern of zeros keeps growing, so the decimal never repeats' }),
    rng => { const k = rng.int(2, 6), n = rng.pick([2, 3, 5, 7]); return { kind: 'ksqrt', k, n, h: `${k}${M.sqrt(n)}`, why: `a non-zero rational times an irrational is irrational` }; },
  ];
  const isRational = it => ({ sqrt: () => isSq(it.n), frac: () => true, rep: () => true, dec: () => true, sqrtfrac: () => isSq(it.a) && isSq(it.b), prod: () => isSq(it.a * it.b), quot: () => it.a % it.b === 0 && isSq(it.a / it.b), pi: () => false, 'int+sqrt': () => isSq(it.n), nonrep: () => false, ksqrt: () => isSq(it.n) }[it.kind])();

  A.skill({
    id: 'alg1.rational-irrational', title: 'Rational and irrational numbers',
    learn: p(`A <b>rational number</b> can be written as a fraction ${F(V('p'), V('q'))} of two <b>integers</b> (whole numbers and their negatives), with ${V('q')} ≠ 0. Integers, fractions, decimals that end, and decimals that repeat are all rational. An <b>irrational number</b> can’t be written that way; its decimal goes on forever without repeating. Examples: π, and the square root of any whole number that isn’t a perfect square.`) +
      p(`Sums and products follow rules. Rational + rational and rational × rational are rational. <b>Rational + irrational is irrational</b>, and so is a rational number other than 0 times an irrational one. Two irrationals can give either kind, so simplify before you decide.`) +
      example('Example 1: one number at a time', `Is ${M.sqrt(45)} ÷ ${M.sqrt(5)} rational? It equals ${M.sqrt(9)} = 3, so <b>yes</b>. Is 4 + ${M.sqrt(7)} rational? 7 isn’t a perfect square, so ${M.sqrt(7)} is irrational, and adding 4 keeps it irrational: <b>no</b>. Is 0.<span style="text-decoration: overline">27</span> rational? It repeats, so <b>yes</b> (it equals ${F(3, 11)}).`) +
      example('Example 2: two irrationals', `${M.sqrt(2)} · ${M.sqrt(8)} = ${M.sqrt(16)} = 4, which is <b>rational</b>. But ${M.sqrt(2)} · ${M.sqrt(3)} = ${M.sqrt(6)}, and 6 isn’t a perfect square, so that product is <b>irrational</b>.`),
    make(rng) {
      const form = rng.pick(['which', 'which', 'classify', 'count']), wantIrr = rng.bool();
      const pickItems = (gens, k) => rng.sample(gens.map((g, i) => i), k).map(i => gens[i](rng));
      // two different makers can land on the same number (1/9 twice): draw again until all of them read differently
      const key = it => A.normText(A.stripTags(it.h));
      if (form === 'classify') {
        const it = rng.pick(rng.bool() ? RAT_GENS : IRR_GENS)(rng), answer = isRational(it) ? 'Rational' : 'Irrational';
        return { prompt: `Is this number rational or irrational?${big(it.h)}`, type: 'choice', choices: ['Rational', 'Irrational'], keepOrder: true, answer, params: { form, items: [it] },
          hints: ['Rational means it can be written as a fraction of two integers; irrational means it can’t. Simplify first if you can.', `${it.h}: ${it.why}.`, `So it’s <b>${answer.toLowerCase()}</b>.`] };
      }
      if (form === 'count') {
        const k = rng.int(4, 5); let items, tries = 0;
        do { items = Array.from({ length: k }, () => rng.pick(rng.bool() ? RAT_GENS : IRR_GENS)(rng)); tries++; } while (new Set(items.map(key)).size < k && tries < 30);
        const hits = items.filter(it => isRational(it) !== wantIrr), n = hits.length;
        return { prompt: `How many of these numbers are <b>${wantIrr ? 'irrational' : 'rational'}</b>?${big(items.map(it => it.h).join(', &nbsp;'))}`, type: 'number', answer: n, params: { form, wantIrr, items },
          hints: ['Check each number: can it be written as a fraction of two integers? Simplify roots, products and quotients first.', items.map(it => `${it.h}: ${it.why}`).join('; ') + '.', `${n === 1 ? 'One number is' : `${N(n)} numbers are`} ${wantIrr ? 'irrational' : 'rational'}: <b>${N(n)}</b>.`] };
      }
      let odd, rest, tries = 0;
      do { odd = pickItems(wantIrr ? IRR_GENS : RAT_GENS, 1)[0]; rest = pickItems(wantIrr ? RAT_GENS : IRR_GENS, 3); tries++; }
      while (new Set([odd].concat(rest).map(key)).size < 4 && tries < 30);
      const items = [odd].concat(rest), answer = odd.h;
      const ask = wantIrr ? rng.pick(['Which number is <b>irrational</b>?', 'Which of these numbers <b>can’t</b> be written as a fraction of two integers?', 'Which number has a decimal that never ends and never repeats?'])
        : rng.pick(['Which number is <b>rational</b>?', 'Which of these numbers <b>can</b> be written as a fraction of two integers?']);
      return { prompt: ask, type: 'choice', choices: items.map(it => it.h), answer, params: { form, wantIrr, items },
        hints: [`Rational means it can be written as a fraction of integers; irrational means it cannot.`, `Check the others: ${rest.map(it => `${it.h}: ${it.why}`).join('; ')}.`, `<b>${answer}</b> is the ${wantIrr ? 'irrational' : 'rational'} one: ${odd.why}.`] };
    },
    challenge(rng) {
      // six numbers, mostly ones that need simplifying before you can tell
      const RT = [0, 2, 4, 5, 6].map(i => RAT_GENS[i]), IT = [0, 2, 3, 4, 5].map(i => IRR_GENS[i]), key = it => A.normText(A.stripTags(it.h)), wantIrr = rng.bool();
      let items, tries = 0;
      do { items = Array.from({ length: 6 }, () => rng.pick(rng.bool() ? RT : IT)(rng)); tries++; } while (new Set(items.map(key)).size < 6 && tries < 40);
      const n = items.filter(it => isRational(it) !== wantIrr).length;
      return { prompt: `How many of these numbers are <b>${wantIrr ? 'irrational' : 'rational'}</b>? Simplify each one before you decide.${big(items.map(it => it.h).join(', &nbsp;'))}`, type: 'number', answer: n, params: { form: 'count', wantIrr, items },
        hints: ['Simplify roots, products and quotients first; a root of a perfect square, or of a fraction of perfect squares, is rational.', items.map(it => `${it.h}: ${it.why}`).join('; ') + '.', `${n === 1 ? 'One number is' : `${N(n)} numbers are`} ${wantIrr ? 'irrational' : 'rational'}: <b>${N(n)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.form === 'classify') return q.answer === (isRational(P.items[0]) ? 'Rational' : 'Irrational');
      if (P.form === 'count') { let n = 0; for (const it of P.items) if (isRational(it) !== P.wantIrr) n++; return q.answer === n; }
      const hits = P.items.filter(it => isRational(it) !== P.wantIrr);
      return hits.length === 1 && hits[0].h === q.answer;
    },
  });

  const EXP_DOUBLE = [
    { text: (s, per, t) => `A culture starts with ${s} bacteria and doubles every ${per} hours. How many bacteria are there after ${t} hours?`, unit: '', noun: 'bacteria' },
    { text: (s, per, t) => `A patch of algae on a pond covers ${s} square centimeters and doubles in area every ${per} days. How many square centimeters does it cover after ${t} days?`, unit: 'cm²', noun: 'square centimeters' },
    { text: (s, per, t, n) => `${n}’s video for a school fundraiser has ${s} views, and the number of views doubles every ${per} days. How many views does it have after ${t} days?`, unit: '', noun: 'views' },
  ];
  const EXP_HALF = [
    { text: (s, per, t, n) => `${n} has a ${s} gram sample of a substance with a half-life of ${per} days: every ${per} days, half of it decays. How many grams remain after ${t} days?`, unit: 'g', noun: 'grams' },
    { text: (s, per, t) => `A patient is given ${s} milligrams of a medicine, and the amount left in the body halves every ${per} hours. How many milligrams are left after ${t} hours?`, unit: 'mg', noun: 'milligrams' },
  ];
  const EXP_GROW = [
    (P, r, n) => `${n} puts ${P} in an account that grows by ${r}% each year.`,
    (P, r) => `A town’s scholarship fund holds ${P} and grows by ${r}% each year.`,
    (P, r, n) => `${n} buys an old coin for ${P}, and its value rises by ${r}% each year.`,
  ];
  const EXP_LOSE = [
    (P, r) => `A car bought for ${P} loses ${r}% of its value each year.`,
    (P, r) => `A farm buys a tractor for ${P}, and it loses ${r}% of its value each year.`,
    (P, r, n) => `${n}’s school buys a cart of laptops for ${P}, and the cart loses ${r}% of its value each year.`,
  ];

  A.skill({
    id: 'alg1.exponential-growth-decay', title: 'Exponential growth and decay',
    learn: p(`A quantity changes <b>exponentially</b> when it’s multiplied by the same factor in each time period. The model is <b>${V('y')} = ${V('a')} · ${M.sup(V('b'), V('t'))}</b>, where ${V('a')} is the starting amount, ${V('b')} is the <b>growth factor</b> (what you multiply by each period), and ${V('t')} counts the periods. If ${V('b')} &gt; 1 it’s growth; if 0 &lt; ${V('b')} &lt; 1 it’s decay.`) +
      p(`For a change of ${V('r')}% per period, the factor is <b>1 + ${V('r')}/100</b> for growth and <b>1 − ${V('r')}/100</b> for decay: 5% growth uses 1.05, and losing 20% uses 0.80. “Doubles” means ${V('b')} = 2 and “halves” means ${V('b')} = ${F(1, 2)}, applied once per doubling time or <b>half-life</b> (the time it takes to halve).`) +
      p('Compare this with linear change: a linear quantity adds the same amount each period, while an exponential one multiplies by the same amount, so exponential growth eventually outgrows any line.') +
      example('Example 1: percent growth', `$600 earns 4% interest each year. After 3 years: 600 · 1.04³ = 600 · 1.124864 ≈ <b>$674.92</b>.`) +
      example('Example 2: percent decay', `A $15,000 tractor loses 12% of its value each year, so the factor is 1 − 0.12 = 0.88. After 2 years: 15,000 · 0.88² = 15,000 · 0.7744 = <b>$11,616</b>.`) +
      example('Example 3: halving', `An 80 gram sample has a half-life of 6 days. In 18 days it halves 18 ÷ 6 = 3 times: 80 · (${F(1, 2)})³ = 80 ÷ 8 = <b>10 grams</b>.`) +
      example('Example 4: reading the factor', `In ${V('f')}(${V('t')}) = 250(0.93)<sup>${V('t')}</sup>, the factor 0.93 = 1 − 0.07, so the amount <b>decays by 7% per period</b>. In a table with outputs 4, 12, 36, …, each output is 3 times the one before, so ${V('b')} = <b>3</b>.`),
    make(rng) {
      const kind = rng.pick(['double', 'half', 'percent', 'percent', 'identify', 'table']), name = rng.pick(NAMES);
      if (kind === 'identify') {
        const grow = rng.bool(), r = rng.pick([2, 3, 4, 5, 6, 8, 12, 15, 20, 25]), b = M.round(grow ? 1 + r / 100 : 1 - r / 100, 4), a = rng.pick([150, 400, 900, 1200, 5000]);
        const dir = grow ? 'Growth' : 'Decay', opp = grow ? 'Decay' : 'Growth';
        const answer = `${dir} of ${r}% per year`, choices = [answer, `${opp} of ${r}% per year`, `${dir} of ${N(M.round(b * 100, 2))}% per year`, `${dir} of ${N(b)}% per year`];
        return { prompt: `The function ${V('f')}(${V('t')}) = ${N(a)}(${N(b)})<sup>${V('t')}</sup> models an amount after ${V('t')} years. Which describes how it changes?`, type: 'choice', choices, answer, params: { kind, b },
          hints: [`The factor is ${N(b)}, which is ${grow ? 'more' : 'less'} than 1, so the amount ${grow ? 'grows' : 'decays'}.`, `${N(b)} = 1 ${grow ? '+' : '−'} ${N(r / 100)}, and ${N(r / 100)} is ${r}%.`, `<b>${answer}</b>.`] };
      }
      if (kind === 'table') {
        const [bn, bd] = rng.pick([[2, 1], [3, 1], [4, 1], [1, 2], [1, 3], [3, 2]]), a = rng.pick([1, 2, 3, 5]) * Math.pow(bd, 3);
        const ys = [0, 1, 2, 3].map(x => a * Math.pow(bn, x) / Math.pow(bd, x));
        return { prompt: `The table shows an exponential function ${V('f')}(${X}) = ${V('a')} · ${M.sup(V('b'), X)}. What is ${V('b')}?${M.table([X, `${V('f')}(${X})`], ys.map((y, x) => [x, N(y)]))}`, type: 'number', answer: bn / bd, answerText: M.fracText(bn, bd), params: { kind, ys },
          hints: [`Each step of 1 in ${X} multiplies the output by ${V('b')}.`, `Divide one output by the one before it: ${N(ys[1])} ÷ ${N(ys[0])}.`, `${V('b')} = <b>${M.fracText(bn, bd)}</b>.`] };
      }
      if (kind === 'double' || kind === 'half') {
        const dbl = kind === 'double', per = rng.pick(dbl ? [2, 3, 4, 5, 6] : [3, 5, 8, 10, 12]), k = rng.int(dbl ? 2 : 1, dbl ? 5 : 4);
        const start = dbl ? rng.pick([50, 100, 200, 250, 300, 500]) : Math.pow(2, k) * rng.pick([5, 10, 15, 25]), t = per * k, ans = dbl ? start * Math.pow(2, k) : start / Math.pow(2, k);
        const C = rng.pick(dbl ? EXP_DOUBLE : EXP_HALF), prompt = C.text(N(start), per, t, name);
        return { prompt, type: 'number', answer: ans, unit: C.unit, params: { kind, start, per, t },
          hints: [`${t} ÷ ${per} = ${k}, so the amount ${dbl ? 'doubles' : 'halves'} ${k} times.`, `${N(start)} · ${dbl ? '2' : F(1, 2)}<sup>${k}</sup> = ${N(start)} ${dbl ? '×' : '÷'} ${Math.pow(2, k)}.`, `<b>${N(ans)}</b> ${C.noun}.`] };
      }
      const grow = rng.bool(), r = rng.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20]), t = rng.int(2, 6);
      const P = grow ? rng.pick([500, 800, 1000, 1200, 2500, 3000]) : rng.pick([12000, 15000, 18000, 24000, 30000]);
      const b = grow ? 1 + r / 100 : 1 - r / 100, ans = M.round(P * Math.pow(b, t), 2);
      const prompt = `${rng.pick(grow ? EXP_GROW : EXP_LOSE)(M.money(P), r, name)} What is it worth after ${t} years? Round to the nearest cent.`;
      return { prompt, type: 'number', answer: ans, unit: '$', tolerance: 0.01, params: { kind, grow, r, t, P },
        hints: [`${grow ? 'Growing' : 'Losing'} ${r}% a year means multiplying by ${N(b)} each year.`, `Value = ${N(P)} · ${N(b)}<sup>${t}</sup>, and ${N(b)}<sup>${t}</sup> ≈ ${N(M.round(Math.pow(b, t), 6))}.`, `About <b>${M.money(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'identify') { const s = plain(q.answer), m = s.match(/^(Growth|Decay) of ([\d.]+)%/); return !!m && (m[1] === 'Growth') === (P.b > 1) && Math.abs(+m[2] - Math.abs(P.b - 1) * 100) < 1e-9; }
      if (P.kind === 'table') return P.ys.slice(1).every((y, i) => Math.abs(y / P.ys[i] - q.answer) < 1e-9);
      if (P.kind === 'double') return q.answer === P.start * Math.pow(2, P.t / P.per);
      if (P.kind === 'half') return q.answer === P.start * Math.pow(0.5, P.t / P.per);
      let v = P.P; for (let i = 0; i < P.t; i++) v *= P.grow ? (100 + P.r) / 100 : (100 - P.r) / 100;
      return Math.abs(v - q.answer) <= 0.006;
    },
  });

  /* ---------- Unit 8: Quadratics ---------- */
  const binH = ([a, b]) => `(${M.poly([a, b])})`;
  /** a product of linear factors in a fixed order, with a repeated factor shown squared */
  function facH(fs) {
    const s = fs.slice().sort((u, w) => u[0] - w[0] || u[1] - w[1]);
    if (s.length === 2 && s[0][0] === s[1][0] && s[0][1] === s[1][1]) return `${binH(s[0])}<sup>2</sup>`;
    return s.map(binH).join('');
  }
  /** coefficients of a quadratic read back from three values: f(0), f(1), f(−1) */
  function coefsOf(f) { const c = f(0), a = (f(1) + f(-1)) / 2 - c, b = (f(1) - f(-1)) / 2; return [a, b, c]; }
  const prodOf = fs => x => fs.reduce((acc, [a, b]) => acc * (a * x + b), 1);

  A.skill({
    id: 'alg1.multiply-binomials', title: 'Multiplying binomials',
    learn: p(`A <b>binomial</b> is an expression with two terms, like ${X} + 3. To multiply two binomials, <b>multiply each term of the first by each term of the second</b> and add the four products. One way to keep track is FOIL: First, Outer, Inner, Last. Then combine the two middle terms, which are like terms.`) +
      p(`Two patterns are worth knowing. A square: (${V('a')} + ${V('b')})² = ${M.sup(V('a'), 2)} + 2${V('a')}${V('b')} + ${M.sup(V('b'), 2)}; the middle term is easy to forget. A sum times a difference: (${V('a')} + ${V('b')})(${V('a')} − ${V('b')}) = ${M.sup(V('a'), 2)} − ${M.sup(V('b'), 2)}; here the middle terms cancel.`) +
      example('Example 1: any two binomials', `${big(`(2${X} + 3)(${X} − 5)`)}First 2${M.sup(X, 2)}, Outer −10${X}, Inner 3${X}, Last −15. Combine: <b>${M.poly([2, -7, -15])}</b>.`) +
      example('Example 2: a square', `${big(`(${X} − 4)<sup>2</sup>`)}This is (${X} − 4)(${X} − 4): ${M.sup(X, 2)} − 4${X} − 4${X} + 16 = <b>${M.poly([1, -8, 16])}</b>, not ${M.sup(X, 2)} + 16.`) +
      example('Example 3: a sum times a difference', `${big(`(3${X} + 2)(3${X} − 2)`)}The middle terms, −6${X} and +6${X}, cancel: 9${M.sup(X, 2)} − 4. So the product is <b>${M.poly([9, 0, -4])}</b>.`),
    make(rng) {
      const kind = rng.pick(['general', 'general', 'square', 'conj']);
      let fs, expr, wrong;
      if (kind === 'square') {
        const a = rng.pick([1, 1, 2, 3]), k = rng.nz(-9, 9); fs = [[a, k], [a, k]]; expr = `${binH([a, k])}<sup>2</sup>`;
        wrong = [[a * a, 0, k * k], [a * a, a * k, k * k], [a * a, 2 * a * k, 2 * k], [a, 2 * a * k, k * k]];
      } else if (kind === 'conj') {
        const a = rng.pick([1, 1, 2, 3, 4]), k = rng.int(1, 9); fs = [[a, -k], [a, k]]; expr = fs.map(binH).join('');
        wrong = [[a * a, 0, k * k], [a * a, -2 * a * k, -k * k], [a * a, 2 * a * k, -k * k], [2 * a, 0, -k * k]];
      } else {
        const a = rng.pick([1, 1, 1, 2, 3]), c = rng.pick([1, 1, 2, -1]), b = rng.nz(-9, 9), d = rng.nz(-9, 9); fs = [[a, b], [c, d]]; expr = fs.map(binH).join('');
        wrong = [[a * c, 0, b * d], [a * c, a * d - b * c, b * d], [a * c, a * d + b * c, -b * d], [a * c, b + d, b * d], [a + c, a * d + b * c, b * d]];
      }
      const [[a, b], [c, d]] = fs, coefs = [a * c, a * d + b * c, b * d], answer = M.poly(coefs);
      return { prompt: `Multiply.${big(expr)}`, type: 'choice', choices: [answer].concat(others(answer, wrong.map(w => M.poly(w)), 3)), answer, params: { fs },
        hints: [`Multiply every pair: ${M.term(a, 'x')} · ${M.term(c, 'x')} = ${M.term(a * c, 'x', 2)}, ${M.term(a, 'x')} · ${wrap(d)} = ${M.term(a * d, 'x')}, ${wrap(b)} · ${M.term(c, 'x')} = ${M.term(b * c, 'x')}, ${wrap(b)} · ${wrap(d)} = ${N(b * d)}.`,
          `Combine the middle terms: ${N(a * d)} ${M.signed(b * c)} = ${N(a * d + b * c)}${a * d + b * c === 0 ? ', so they cancel' : ''}.`, `<b>${answer}</b>.`] };
    },
    verify(q) { return q.answer === M.poly(coefsOf(prodOf(q.params.fs))); },
  });

  A.skill({
    id: 'alg1.factor-quadratics', title: 'Factoring quadratics',
    learn: p(`<b>Factoring</b> undoes multiplying: it writes an expression as a product. For ${M.sup(X, 2)} + ${V('b')}${X} + ${V('c')}, look for <b>two numbers that multiply to ${V('c')} and add to ${V('b')}</b>. If they are ${V('m')} and ${V('n')}, then ${M.sup(X, 2)} + ${V('b')}${X} + ${V('c')} = (${X} + ${V('m')})(${X} + ${V('n')}). If ${V('c')} is negative, the two numbers have opposite signs; if ${V('c')} is positive, they share the sign of ${V('b')}.`) +
      p(`When the <b>leading coefficient</b> (the number in front of ${M.sup(X, 2)}) isn’t 1, try its factor pairs in the first places and factor pairs of ${V('c')} in the last places, and check the middle term by multiplying back. A <b>difference of squares</b> ${M.sup(V('a'), 2)} − ${M.sup(V('b'), 2)} factors as (${V('a')} − ${V('b')})(${V('a')} + ${V('b')}).`) +
      example('Example 1: leading coefficient 1', `${big(M.poly([1, -2, -15]))}Numbers that multiply to −15 and add to −2: −5 and 3. So it factors as <b>(${X} − 5)(${X} + 3)</b>.`) +
      example('Example 2: leading coefficient 2', `${big(M.poly([2, 7, 3]))}Try (2${X} + ?)(${X} + ?) with last numbers multiplying to 3. (2${X} + 1)(${X} + 3) gives a middle term of 2${X} · 3 + 1 · ${X} = 7${X}, which matches: <b>(2${X} + 1)(${X} + 3)</b>.`) +
      example('Example 3: a difference of squares', `${big(M.poly([9, 0, -25]))}9${M.sup(X, 2)} = (3${X})² and 25 = 5², so it factors as <b>(3${X} − 5)(3${X} + 5)</b>.`),
    make(rng) {
      const kind = rng.pick(['monic', 'monic', 'leading', 'dos']);
      let fs, opts;
      if (kind === 'dos') {
        const k = rng.int(1, 5); let m = rng.int(1, 9); while (M.gcd(k, m) !== 1) m += 1; fs = [[k, -m], [k, m]];
        opts = [fs, [[k, -m], [k, -m]], [[k, m], [k, m]], [[1, -m], [k * k, m]], [[k, -m * m], [k, 1]]];
      } else if (kind === 'leading') {
        const a = rng.pick([2, 3, 5]); let pp = rng.nz(-7, 7); if (pp % a === 0) pp += pp > 0 ? 1 : -1; const qq = rng.nz(-7, 7); fs = [[a, pp], [1, qq]];
        opts = [fs, [[a, qq], [1, pp]], [[a, -pp], [1, -qq]], [[a, pp], [1, -qq]], [[a, -qq], [1, -pp]]];
      } else {
        const pp = rng.nz(-9, 9), qq = rng.nz(-9, 9); fs = [[1, pp], [1, qq]];
        const prod = pp * qq, alt = []; for (let u = 1; u <= Math.abs(prod); u++) if (prod % u === 0) { alt.push([[1, u], [1, prod / u]], [[1, -u], [1, -prod / u]]); }
        opts = [fs, [[1, -pp], [1, -qq]], [[1, pp], [1, -qq]], [[1, -pp], [1, qq]]].concat(rng.shuffle(alt));
      }
      const coefs = coefsOf(prodOf(fs)), answer = facH(fs), html = opts.map(facH);
      const choices = [answer].concat(others(answer, html.slice(1), 3));
      const [[a0, b0], [c0, d0]] = fs;
      return { prompt: `Factor completely.${big(M.poly(coefs))}`, type: 'choice', choices, answer, params: { coefs, opts, html },
        hints: [kind === 'dos' ? `This is a difference of squares: ${M.term(k2(a0), 'x', 2)} = (${M.term(a0, 'x')})² and ${N(b0 * b0)} = ${Math.abs(b0)}².` : kind === 'leading' ? `Try factors of the form (${M.term(a0, 'x')} + ?)(${X} + ?), with the last numbers multiplying to ${N(coefs[2])}.` : `Find two numbers that multiply to ${N(coefs[2])} and add to ${N(coefs[1])}.`,
          kind === 'monic' ? `${N(b0)} and ${N(d0)} work: ${N(b0)} × ${wrap(d0)} = ${N(b0 * d0)} and ${N(b0)} + ${wrap(d0)} = ${N(b0 + d0)}.` : `Check the middle term by multiplying back: ${M.term(a0, 'x')} · ${wrap(d0)} + ${wrap(b0)} · ${M.term(c0, 'x')} = ${M.term(a0 * d0 + b0 * c0, 'x')}.`,
          `<b>${answer}</b>.`] };
    },
    challenge(rng) {
      // a common factor to take out first, then a trinomial
      const g = rng.pick([2, 3, 4, 5, -2, -3]), lead = rng.pick([1, 1, 2, 3]);
      let pp = rng.nz(-7, 7); if (lead > 1 && pp % lead === 0) pp += pp > 0 ? 1 : -1;
      const qq = rng.nz(-7, 7), fs = [[lead, pp], [1, qq]], full = [[0, g]].concat(fs), coefs = coefsOf(prodOf(full));
      const opts = [full, [[0, g], [lead, -pp], [1, -qq]], [[g * lead, g * pp], [1, qq]], [[0, -g], [lead, -pp], [1, qq]], [[0, g], [lead, qq], [1, pp]]];
      const html = opts.map(o => (o[0][0] === 0 ? (o[0][1] === -1 ? '−' : N(o[0][1])) + facH(o.slice(1)) : facH(o))), answer = html[0];
      return { prompt: `Factor completely.${big(M.poly(coefs))}`, type: 'choice', choices: [answer].concat(others(answer, html.slice(1), 3)), answer, params: { coefs, opts, html },
        hints: [`Every coefficient shares the factor ${N(g)}. Take it out first: ${N(g)}(${M.poly(coefs.map(c => c / g))}).`, `Now factor the trinomial inside: ${M.poly(coefs.map(c => c / g))} = ${facH(fs)}. Multiply back to check the middle term.`, `Keep the ${N(g)} in front: <b>${answer}</b>. A form like ${facH([[g * lead, g * pp], [1, qq]])} isn’t factored completely.`] };
    },
    verify(q) {
      const P = q.params, i = P.html.indexOf(q.answer); if (i < 0) return 'answer not among options';
      const got = coefsOf(prodOf(P.opts[i]));
      // the same polynomial, and factored completely: no binomial still has a common factor
      return got.every((v, j) => v === P.coefs[j]) && P.opts[i].every(([a, b]) => a === 0 || M.gcd(a, b) === 1);
    },
  });
  const k2 = a => a * a;

  const NSOL = ['No real solutions', 'One real solution', 'Two real solutions'];
  /** real roots of ax² + bx + c by scanning for sign changes and bisecting */
  function rootsBySearch(a, b, c) {
    const f = x => (a * x + b) * x + c, out = [];
    for (let x = -60; x < 60; x += 0.25) {
      let lo = x, hi = x + 0.25;
      if (f(lo) === 0) { out.push(lo); continue; }
      if (f(lo) * f(hi) < 0) { for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (f(lo) * f(mid) <= 0) hi = mid; else lo = mid; } out.push((lo + hi) / 2); }
    }
    return out;
  }

  A.skill({
    id: 'alg1.solve-quadratics', title: 'Solving quadratic equations',
    learn: p(`A <b>quadratic equation</b> has an ${M.sup(X, 2)} term and can be written ${V('a')}${M.sup(X, 2)} + ${V('b')}${X} + ${V('c')} = 0. <b>Factoring:</b> write it as (…)(…) = 0. A product is 0 only when one of its factors is 0, so set each factor equal to 0. <b>Square roots:</b> if the equation is (${X} − ${V('h')})² = ${V('k')}, take the square root of both sides, remembering <b>±</b>: ${X} = ${V('h')} ± √${V('k')}.`) +
      p(`<b>Completing the square</b> turns ${M.sup(X, 2)} + ${V('b')}${X} into a perfect square by adding (${V('b')}/2)² to both sides. Doing that to ${V('a')}${M.sup(X, 2)} + ${V('b')}${X} + ${V('c')} = 0 in general gives the <b>quadratic formula</b>: ${X} = (−${V('b')} ± √(${M.sup(V('b'), 2)} − 4${V('a')}${V('c')})) ÷ 2${V('a')}, which works for every quadratic.`) +
      p(`The <b>discriminant</b>, ${M.sup(V('b'), 2)} − 4${V('a')}${V('c')}, tells you how many real solutions there are: positive gives two, zero gives one, negative gives none.`) +
      example('Example 1: factoring', `${big(`${M.poly([1, -1, -12])} = 0`)}−4 and 3 multiply to −12 and add to −1: (${X} − 4)(${X} + 3) = 0. So <b>${X} = 4 or ${X} = −3</b>.`) +
      example('Example 2: square roots', `${big(`2(${X} − 1)² − 3 = 47`)}Add 3 and divide by 2: (${X} − 1)² = 25. Take square roots: ${X} − 1 = ±5, so <b>${X} = 6 or ${X} = −4</b>.`) +
      example('Example 3: completing the square', `${big(`${M.poly([1, 6, 0])} = 7`)}Add (6/2)² = 9 to both sides: (${X} + 3)² = 16. So ${X} + 3 = ±4, giving <b>${X} = 1 or ${X} = −7</b>.`) +
      example('Example 4: the quadratic formula', `${big(`${M.poly([1, -4, 1])} = 0`)}${V('a')} = 1, ${V('b')} = −4, ${V('c')} = 1. The discriminant is 16 − 4 = 12, which is positive, so there are two solutions: ${X} = ${F(`4 ± ${M.sqrt(12)}`, '2')} ≈ <b>3.73 or 0.27</b>.`),
    make(rng) {
      const kind = rng.pick(['factored', 'factor', 'factor', 'sqrt', 'formula', 'count', 'complete']), ask = rng.pick(['greater', 'smaller']);
      const askTxt = `If there are two solutions, give the <b>${ask}</b> one.`;
      if (kind === 'complete') {
        const half = rng.nz(-7, 7), b = 2 * half, c = rng.int(-10, 20), n = c + half * half;
        return { prompt: `To solve by completing the square, ${M.poly([1, b, 0])} = ${N(c)} is rewritten as (${X} ${M.signed(half)})² = ${V('n')}. What is ${V('n')}?`, type: 'number', answer: n, params: { kind, b, c },
          hints: [`Half of ${N(b)} is ${N(half)}, and ${wrap(half)}² = ${half * half}.`, `Add ${half * half} to both sides: ${M.poly([1, b, half * half])} = ${N(c)} + ${half * half}.`, `The left side is (${X} ${M.signed(half)})², so ${V('n')} = <b>${N(n)}</b>.`] };
      }
      if (kind === 'count') {
        const type = rng.int(0, 2), h = rng.int(-5, 5), a = rng.pick([1, 1, 2, -1]);
        const k = type === 0 ? a * rng.int(1, 9) : type === 1 ? 0 : -a * rng.pick([1, 4, 9, 16]);
        const coefs = [a, -2 * a * h, a * h * h + k], D = coefs[1] * coefs[1] - 4 * coefs[0] * coefs[2];
        return { prompt: `How many real solutions does this equation have?${big(`${M.poly(coefs)} = 0`)}`, type: 'choice', choices: NSOL.slice(), keepOrder: true, answer: NSOL[type], params: { kind, coefs },
          hints: [`Use the discriminant ${M.sup(V('b'), 2)} − 4${V('a')}${V('c')} with ${V('a')} = ${N(coefs[0])}, ${V('b')} = ${N(coefs[1])}, ${V('c')} = ${N(coefs[2])}.`, `${wrap(coefs[1])}² − 4 · ${wrap(coefs[0])} · ${wrap(coefs[2])} = ${N(D)}, which is ${D > 0 ? 'positive' : D === 0 ? 'zero' : 'negative'}.`, `<b>${NSOL[type]}</b>.`] };
      }
      let coefs, shown, ansN, ansD = 1, hints;
      if (kind === 'formula') {
        let a, b, c, D;
        do { a = rng.pick([1, 1, 2, 3]); b = rng.int(-9, 9); c = rng.int(-9, 6); D = b * b - 4 * a * c; } while (D <= 0 || isSq(D));
        coefs = [a, b, c]; shown = `${M.poly(coefs)} = 0`;
        const r = (-b + (ask === 'greater' ? 1 : -1) * Math.sqrt(D)) / (2 * a), ans = M.round(r, 2);
        return { prompt: `Use the quadratic formula. ${askTxt} Round to the nearest hundredth.${big(shown)}`, type: 'number', answer: ans, tolerance: 0.01, params: { kind, coefs, ask },
          hints: [`${V('a')} = ${N(a)}, ${V('b')} = ${N(b)}, ${V('c')} = ${N(c)}. The discriminant is ${wrap(b)}² − 4(${N(a)})(${N(c)}) = ${N(D)}.`, `${X} = ${F(`${N(-b)} ± ${M.sqrt(D)}`, `${2 * a}`)}, and ${M.sqrt(D)} ≈ ${N(M.round(Math.sqrt(D), 4))}.`, `The ${ask} solution uses ${ask === 'greater' ? '+' : '−'}: ${X} ≈ <b>${N(ans)}</b>.`] };
      }
      if (kind === 'sqrt') {
        const a = rng.pick([1, 1, 2, 3]), h = rng.nz(-6, 6), s = rng.int(1, 9), extra = rng.int(-9, 9);
        coefs = [a, -2 * a * h, a * h * h - a * s * s];
        shown = `${a === 1 ? '' : N(a)}(${X} ${M.signed(-h)})²${extra ? ' ' + M.signed(extra) : ''} = ${N(a * s * s + extra)}`;
        ansN = ask === 'greater' ? h + s : h - s;
        hints = [`Isolate the square: ${extra ? `${extra < 0 ? 'add' : 'subtract'} ${Math.abs(extra)}` : ''}${extra && a !== 1 ? ', then ' : ''}${a !== 1 ? `divide by ${a}` : ''}${!extra && a === 1 ? 'it is already alone' : ''}, giving (${X} ${M.signed(-h)})² = ${s * s}.`, `Take square roots, with ±: ${X} ${M.signed(-h)} = ±${s}, so ${X} = ${N(h)} ± ${s}: ${N(h + s)} or ${N(h - s)}.`, `The ${ask} solution is <b>${N(ansN)}</b>.`];
      } else {
        const a = kind === 'factored' ? rng.pick([1, 2, 3]) : 1; let b = rng.nz(-9, 9); if (a > 1 && b % a === 0) b += 1;
        let r = rng.nz(-9, 9); if (a === 1 && r === -b) r += 2;
        const fs = [[a, b], [1, -r]], [s1n, s1d] = M.simp(-b, a);
        coefs = coefsOf(prodOf(fs));
        const big1 = s1n / s1d > r; const pickFirst = (ask === 'greater') === big1;
        [ansN, ansD] = pickFirst ? [s1n, s1d] : [r, 1];
        if (kind === 'factored') { shown = `${fs.map(binH).join('')} = 0`; hints = [`A product is zero only when one factor is zero.`, `${M.poly([a, b])} = 0 gives ${X} = ${M.fracText(s1n, s1d)}; ${M.poly([1, -r])} = 0 gives ${X} = ${N(r)}.`, `The ${ask} solution is <b>${M.fracText(ansN, ansD)}</b>.`]; }
        else { shown = `${M.poly(coefs)} = 0`; hints = [`Factor: find two numbers that multiply to ${N(coefs[2])} and add to ${N(coefs[1])}: ${N(b)} and ${N(-r)}.`, `${fs.map(binH).join('')} = 0, so ${X} = ${N(-b)} or ${X} = ${N(r)}.`, `The ${ask} solution is <b>${M.fracText(ansN, ansD)}</b>.`]; }
      }
      return { prompt: `Solve. ${askTxt}${big(shown)}`, type: 'number', answer: ansN / ansD, answerText: M.fracText(ansN, ansD), params: { kind, coefs, ask }, hints };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'complete') { const h = P.b / 2; return h * h - q.answer === -P.c; }       // (x + h)² − n must equal x² + bx − c, compared at x = 0
      const [a, b, c] = P.coefs, roots = rootsBySearch(a, b, c);
      if (P.kind === 'count') {
        const fv = (a * (-b / (2 * a)) + b) * (-b / (2 * a)) + c;      // value at the vertex
        const n = Math.abs(fv) < 1e-12 ? 1 : fv * a > 0 ? 0 : 2;
        return q.answer === NSOL[n] && (n !== 2 || roots.length === 2);
      }
      if (roots.length !== 2) return 'expected two roots, found ' + roots.length;
      const want = P.ask === 'greater' ? Math.max(...roots) : Math.min(...roots);
      return Math.abs(want - q.answer) <= (P.kind === 'formula' ? 0.0051 : 1e-6);
    },
  });

  A.skill({
    id: 'alg1.vertex-form', title: 'Vertex form and features of parabolas',
    learn: p(`The graph of a quadratic is a U-shaped curve called a <b>parabola</b>, and its turning point is the <b>vertex</b>. In <b>vertex form</b>, ${Y} = ${V('a')}(${X} − ${V('h')})² + ${V('k')}, the vertex is <b>${M.pt(V('h'), V('k'))}</b>. Watch the sign: ${Y} = (${X} + 4)² − 1 has its vertex at ${M.pt(-4, -1)}. If ${V('a')} &gt; 0 the parabola opens up and ${V('k')} is the <b>minimum</b> (smallest) value; if ${V('a')} &lt; 0 it opens down and ${V('k')} is the <b>maximum</b>.`) +
      p(`From standard form, ${Y} = ${V('a')}${M.sup(X, 2)} + ${V('b')}${X} + ${V('c')}, the vertex has ${X} = −${V('b')} ÷ 2${V('a')}; substitute that ${X} to find ${V('k')}. Or <b>complete the square</b> to rewrite the equation in vertex form.`) +
      example('Example 1: reading vertex form', `${big(vfH(-3, -2, 7))}Inside is ${X} + 2, so ${V('h')} = −2, and ${V('k')} = 7. The vertex is <b>${M.pt(-2, 7)}</b>, and because −3 &lt; 0 it opens down, so 7 is the maximum.`) +
      example('Example 2: the vertex from standard form', `${big(`${Y} = ${M.poly([2, -12, 5])}`)}${X} = −(−12) ÷ (2 · 2) = 3, and ${Y} = 2(9) − 36 + 5 = −13. Vertex <b>${M.pt(3, -13)}</b>, a minimum because 2 &gt; 0.`) +
      example('Example 3: completing the square', `${big(`${Y} = ${M.poly([1, 8, 3])}`)}Half of 8 is 4, and 4² = 16. Add and subtract 16: ${Y} = (${M.poly([1, 8, 16])}) − 16 + 3 = <b>(${X} + 4)² − 13</b>.`),
    make(rng) {
      const kind = rng.pick(['read', 'convert', 'feature', 'feature']);
      if (kind === 'convert') {
        const half = rng.nz(-7, 7), b = 2 * half, c = rng.int(-10, 12), h = -half, k = c - half * half;
        const opts = [[h, k], [-h, k], [h, c + half * half], [-b, c - b * b]], html = opts.map(([hh, kk]) => vfH(1, hh, kk));
        const answer = html[0];
        return { prompt: `Rewrite in vertex form by completing the square.${big(`${Y} = ${M.poly([1, b, c])}`)}`, type: 'choice', choices: [answer].concat(others(answer, html.slice(1), 3)), answer, params: { kind, b, c, opts, html },
          hints: [`Half of ${N(b)} is ${N(half)}; its square is ${half * half}. Add and subtract it: ${Y} = (${M.poly([1, b, half * half])}) − ${half * half} ${M.signed(c)}.`, `The first part is (${X} ${M.signed(half)})², and −${half * half} ${M.signed(c)} = ${N(k)}.`, `<b>${answer}</b>.`] };
      }
      const a = rng.pick([1, -1, 2, -2, 3, -3]), h = rng.nz(-6, 6); let k = rng.nz(-9, 9); if (Math.abs(k) === Math.abs(h)) k = k > 0 ? k + 1 : k - 1;
      if (kind === 'read') {
        const answer = M.pt(h, k), choices = [answer, M.pt(-h, k), M.pt(h, -k), M.pt(k, h)];
        return { prompt: `What is the vertex of this parabola?${big(vfH(a, h, k))}`, type: 'choice', choices, answer, params: { kind, coefs: [a, -2 * a * h, a * h * h + k] },
          hints: [`Compare with ${Y} = ${V('a')}(${X} − ${V('h')})² + ${V('k')}. The number inside is ${M.signed(-h).replace(' ', '')}, so ${V('h')} = ${N(h)} (the opposite sign).`, `${V('k')} is the number added at the end: ${N(k)}.`, `The vertex is <b>${answer}</b>.`] };
      }
      const coefs = [a, -2 * a * h, a * h * h + k], askX = rng.bool();
      return { prompt: `For the parabola ${Y} = ${M.poly(coefs)}, what is ${askX ? `the ${X}-coordinate of the vertex` : `the ${a > 0 ? 'minimum' : 'maximum'} value of ${Y}`}?`, type: 'number', answer: askX ? h : k, params: { kind, coefs, askX },
        hints: [`The vertex is at ${X} = −${V('b')} ÷ 2${V('a')} = −${wrap(coefs[1])} ÷ ${wrap(2 * a)} = ${N(h)}.`, askX ? `So the ${X}-coordinate is <b>${N(h)}</b>.` : `Substitute: ${Y} = ${N(a)}${wrap(h)}² ${M.signed(coefs[1])} · ${wrap(h)} ${M.signed(coefs[2])} = ${N(k)}.`].concat(askX ? [] : [`${a > 0 ? 'It opens up, so this is the minimum' : 'It opens down, so this is the maximum'}: <b>${N(k)}</b>.`]) };
    },
    challenge(rng) {
      // completing the square when the leading coefficient isn't 1
      const a = rng.pick([2, 3, -1, -2, -3]), h = rng.nz(-5, 5), k = rng.int(-12, 12), b = -2 * a * h, c = a * h * h + k;
      const opts = [[h, k], [-h, k], [h, c - h * h], [h, c + a * h * h]], html = opts.map(([hh, kk]) => vfH(a, hh, kk)), answer = html[0];
      return { prompt: `Rewrite in vertex form.${big(`${Y} = ${M.poly([a, b, c])}`)}`, type: 'choice', choices: [answer].concat(others(answer, html.slice(1), 3)), answer, params: { kind: 'convert', a, b, c, opts, html },
        hints: [`Factor ${N(a)} out of the first two terms: ${Y} = ${a === -1 ? '−' : N(a)}(${M.poly([1, b / a, 0])}) ${M.signed(c)}.`, `Half of ${N(b / a)} is ${N(-h)}, and its square is ${h * h}. Adding ${h * h} inside the parentheses really adds ${N(a * h * h)}, so take that back off: ${Y} = ${a === -1 ? '−' : N(a)}(${X} ${M.signed(-h)})² ${M.signed(-a * h * h)} ${M.signed(c)}.`, `${N(c)} ${M.signed(-a * h * h)} = ${N(k)}, so <b>${answer}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'convert') {
        const i = P.html.indexOf(q.answer); if (i < 0) return 'not an option';
        const [h, k] = P.opts[i], a = P.a || 1; return [-2, 0, 3].every(x => a * (x - h) * (x - h) + k === a * x * x + P.b * x + P.c);
      }
      const [a, b, c] = P.coefs, f = x => (a * x + b) * x + c;
      // the vertex is the grid point where f is most extreme
      let best = -50; for (let x = -50; x <= 50; x += 0.5) if (a * f(x) < a * f(best)) best = x;
      if (P.kind === 'read') return q.answer === M.pt(best, f(best));
      return q.answer === (P.askX ? best : f(best));
    },
  });
})();
