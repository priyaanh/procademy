/* 8th grade math. Exponents and scientific notation, equations with one unknown, linear equations
   and functions, systems of equations, geometry, and data. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v, S = M.sup, PT = M.pt;
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = (s) => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const X = V('x'), Y = V('y');
  const wrap = x => x < 0 ? `(${N(x)})` : N(x);
  const minus = s => String(s).replace(/−/g, '-');                 // typographic minus → JavaScript minus
  /** "3.6 × 10⁵" and its reader */
  const sci = (m, e) => `${N(m)} × ${S(10, N(e))}`;
  const parseSci = html => { const mm = String(html).match(/^(−?[\d.]+) × 10<sup>(−?\d+)<\/sup>$/); return mm ? { m: Number(minus(mm[1])), e: Number(minus(mm[2])) } : null; };
  /** "(3, −4)" back to [3, -4] */
  const parsePt = html => { const mm = String(html).match(/^\((−?\d+), (−?\d+)\)$/); return mm ? [Number(minus(mm[1])), Number(minus(mm[2]))] : null; };
  /** y = mx + b, and its reader (returns [m, b]) */
  const eqn = (m, b) => `${Y} = ${M.poly([m, b])}`;
  const parseEqn = html => {
    const s = minus(A.stripTags(html)).replace(/\s+/g, '');            // "y=2x-3", "y=-x", "y=x+4", "y=5"
    const mm = s.match(/^y=(-?\d*)x([+-]\d+)?$/);
    if (mm) return [mm[1] === '' ? 1 : mm[1] === '-' ? -1 : Number(mm[1]), mm[2] ? Number(mm[2]) : 0];
    const cc = s.match(/^y=(-?\d+)$/);
    return cc ? [0, Number(cc[1])] : null;
  };
  /** "3x + 2y = 7" */
  const lin2 = (a, b, c) => `${M.term(a, 'x')} ${b < 0 ? '−' : '+'} ${M.term(Math.abs(b), 'y')} = ${N(c)}`;
  /** a stacked fraction whose parts are already HTML */
  const fracH = (num, den) => `<span class="frac"><span class="num">${num}</span><span class="den">${den}</span></span>`;
  const cbrt = x => `<span class="sqrt">∛<span class="rad">${x}</span></span>`;
  /** k distinct options from a list of candidates, skipping ones that read like the answer or each other */
  const distinct = (answer, candidates, k) => {
    const seen = new Set([A.normText(A.stripTags(answer))]), out = [];
    for (const c of candidates) { const key = A.normText(A.stripTags(c)); if (!seen.has(key)) { seen.add(key); out.push(c); } if (out.length === k) break; }
    return out;
  };

  A.course({
    id: 'math-8', title: '8th grade math', subject: 'Middle school', grade: 8, icon: '8', hue: 265,
    blurb: 'Exponents and scientific notation, equations with the unknown on both sides, slope and linear functions, systems of equations, the Pythagorean theorem, volume, transformations, and two-way tables.',
    units: [
      { id: 'numbers', title: 'Numbers and operations', blurb: 'Exponent rules, negative exponents, scientific notation, square and cube roots.', skills: ['math8.exponent-properties', 'math8.negative-exponents', 'math8.scientific-notation', 'math8.roots'] },
      { id: 'equations', title: 'Solving equations with one unknown', blurb: 'The unknown on both sides, the distributive property, and how many solutions an equation has.', skills: ['math8.variables-both-sides', 'math8.distributive-equations', 'math8.number-of-solutions'] },
      { id: 'linear', title: 'Linear equations and functions', blurb: 'Slope and rate of change, slope-intercept form, recognizing functions, linear and nonlinear tables.', skills: ['math8.slope', 'math8.slope-intercept-form', 'math8.recognize-functions', 'math8.linear-nonlinear'] },
      { id: 'systems', title: 'Systems of equations', blurb: 'Two equations, two unknowns: solving them, and how many solutions there are.', skills: ['math8.solve-systems', 'math8.systems-solutions'] },
      { id: 'geometry', title: 'Geometry', blurb: 'The Pythagorean theorem and distance, volume of cylinders, cones and spheres, triangle angles, transformations.', skills: ['math8.pythagorean-theorem', 'math8.volume', 'math8.triangle-angles', 'math8.transformations'] },
      { id: 'data', title: 'Data and modeling', blurb: 'Two-way tables and the story a scatter plot tells.', skills: ['math8.two-way-tables', 'math8.scatter-plots'] },
      { id: 'graphs-lines', title: 'Reading and graphing lines', blurb: 'What a graph’s axes say, which points lie on a line, and drawing a line straight from y = mx + b.', skills: ['math8.interpret-graphs', 'math8.point-on-line', 'math8.graph-lines'] },
      { id: 'circle-trend', title: 'Circle graphs and trend lines', blurb: 'Percents and central angles in circle graphs, and trend lines that sum up a scatter plot and make predictions.', skills: ['math8.circle-graphs', 'math8.trend-lines'] },
      { id: 'pythagoras-more', title: 'More with the Pythagorean theorem', blurb: 'Diagonals of boxes and cans in three dimensions, and the converse: testing whether a triangle is right, acute or obtuse.', skills: ['math8.pythagorean-3d', 'math8.pythagorean-converse'] },
    ],
  });

  /* ---------- Unit 1: Numbers and operations ---------- */
  A.skill({
    id: 'math8.exponent-properties', title: 'Exponent properties',
    learn: p(`In ${S(X, 4)}, the <b>base</b> is ${X}, the number being multiplied, and the <b>exponent</b> is 4, the small raised number that counts how many times: ${S(X, 4)} means ${X} · ${X} · ${X} · ${X}. Three shortcuts follow from that counting, and they only work when the <b>bases are the same</b>.`) +
      p(`<b>Product rule:</b> ${S(X, 'm')} × ${S(X, 'n')} = ${S(X, 'm + n')}. When you multiply, add the exponents.<br><b>Quotient rule:</b> ${S(X, 'm')} ÷ ${S(X, 'n')} = ${S(X, 'm − n')}. When you divide, subtract them.<br><b>Power of a power:</b> (${S(X, 'm')})${S('', 'n')} = ${S(X, 'mn')}. When a power is raised to another power, multiply them.`) +
      p(`The base never changes: ${S(3, 4)} × ${S(3, 2)} is ${S(3, 6)}, not ${S(9, 6)}. If you forget a rule, try a small case: ${S(2, 3)} × ${S(2, 2)} = 8 × 4 = 32, and 32 is ${S(2, 5)}.`) +
      example('Example: multiplying', `${big(`${S(X, 3)} × ${S(X, 5)}`)}Same base, and you’re multiplying, so add the exponents: 3 + 5 = 8. Three ${X}’s times five more ${X}’s is eight ${X}’s in a row, so the answer is <b>${S(X, 8)}</b>.`) +
      example('Example: dividing', `${big(`${S(5, 7)} ÷ ${S(5, 3)}`)}Same base, and you’re dividing, so subtract the exponents: 7 − 3 = 4. The answer is <b>${S(5, 4)}</b>.`) +
      example('Example: a power of a power', `${big(`(${S(2, 4)})${S('', 3)}`)}This is ${S(2, 4)} used three times, so multiply the exponents: 4 × 3 = 12. The answer is <b>${S(2, 12)}</b>. (Adding them, 4 + 3 = 7, is the usual slip.)`),
    make(rng) {
      const rule = rng.pick(['product', 'quotient', 'power']);
      const base = rng.pick(['2', '3', '5', '7', '10', 'x', 'x', 'y', 'a']);
      const numeric = /^\d/.test(base), B = numeric ? base : V(base);
      let m = rng.int(2, 9), n = rng.int(2, 9);
      if (rule === 'quotient') { if (m === n) m = n === 9 ? 8 : n + 1; if (m < n) [m, n] = [n, m]; }
      if (rule === 'power') { m = rng.int(2, 6); n = rng.int(2, 5); if (m === 2 && n === 2) n = 3; }
      const right = rule === 'product' ? m + n : rule === 'quotient' ? m - n : m * n;
      const expr = rule === 'product' ? `${S(B, m)} × ${S(B, n)}` : rule === 'quotient' ? `${S(B, m)} ÷ ${S(B, n)}` : `(${S(B, m)})${S('', n)}`;
      const answer = S(B, right);
      let cands;
      if (rule === 'product') cands = [S(B, m * n), S(B, Math.abs(m - n)), numeric ? S(N(Number(base) * Number(base)), m + n) : S(B, m + n + 1)];
      else if (rule === 'quotient') cands = [S(B, m + n), S(B, N(n - m)), numeric ? S('1', m - n) : S(B, m * n)];
      else cands = [S(B, m + n), `${N(n)}${numeric ? ' × ' : ''}${S(B, m)}`];
      const choices = [answer].concat(distinct(answer, cands, 3));
      const ruleName = { product: 'product rule', quotient: 'quotient rule', power: 'power of a power rule' }[rule];
      const hints = [
        `The bases are the same (${B}), so the ${ruleName} applies: ${rule === 'product' ? 'add' : rule === 'quotient' ? 'subtract' : 'multiply'} the exponents.`,
        rule === 'product' ? `${N(m)} + ${N(n)} = ${N(right)}.` : rule === 'quotient' ? `${N(m)} − ${N(n)} = ${N(right)}.` : `${N(m)} × ${N(n)} = ${N(right)}.`,
        `Keep the base as it is: ${expr} = <b>${answer}</b>.`,
      ];
      return { prompt: `Write as a single power of ${B}.${big(expr)}`, type: 'choice', choices, answer, hints, params: { rule, base, m, n } };
    },
    verify(q) {
      const { rule, base, m, n } = q.params;
      const mm = q.answer.match(/^(.*)<sup>(−?\d+)<\/sup>$/); if (!mm) return false;
      const numeric = /^\d/.test(base), bv = numeric ? Number(base) : 2;        // a variable base is tested at x = 2
      if (mm[1] !== (numeric ? base : `<i>${base}</i>`)) return false;
      const got = Math.pow(bv, Number(minus(mm[2])));
      const want = rule === 'product' ? Math.pow(bv, m) * Math.pow(bv, n) : rule === 'quotient' ? Math.pow(bv, m) / Math.pow(bv, n) : Math.pow(Math.pow(bv, m), n);
      return Math.abs(got - want) <= 1e-9 * want;
    },
  });

  A.skill({
    id: 'math8.negative-exponents', title: 'Negative exponents',
    learn: p(`A negative exponent means “one over”: <b>${S(X, '−n')} = ${fracH('1', S(X, 'n'))}</b>. So ${S(2, '−3')} = ${F(1, 8)} and ${S(10, '−2')} = ${F(1, 100, { raw: true })} = 0.01. The result is small, but it’s still positive. The negative sign tells you to divide, not to make the answer negative.`) +
      p(`Here’s why. The quotient rule says ${S(2, 2)} ÷ ${S(2, 5)} = ${S(2, '−3')}, and working it out directly gives 4 ÷ 32 = ${F(1, 8)}. For a fraction, flip it over (use its <b>reciprocal</b>, the fraction turned upside down) and the exponent becomes positive: (${F(2, 3)})${S('', '−2')} = (${F(3, 2)})${S('', 2)} = ${F(9, 4)}.`) +
      example('Example: a whole number', `${big(S(5, '−2'))}${S(5, '−2')} = 1 ÷ ${S(5, 2)} = 1 ÷ 25 = <b>${F(1, 25)}</b>, which is 0.04.`) +
      example('Example: a power of ten', `${big(S(10, '−3'))}${S(10, '−3')} = 1 ÷ ${S(10, 3)} = 1 ÷ 1,000. Dividing by 1,000 moves the decimal point 3 places left, so the value is <b>0.001</b>.`) +
      example('Example: a fraction', `${big(`(${F(3, 4)})${S('', '−2')}`)}Flip the fraction to make the exponent positive: (${F(4, 3)})${S('', 2)}. Square the top and the bottom: ${S(4, 2)} = 16 and ${S(3, 2)} = 9, so the value is <b>${F(16, 9)}</b>.`) +
      example('Example: a product', `${big(`${S(3, 2)} × ${S(3, '−5')}`)}Same base, so add the exponents: 2 + (−5) = −3. Then ${S(3, '−3')} = 1 ÷ ${S(3, 3)} = <b>${F(1, 27)}</b>.`),
    make(rng) {
      const kind = rng.pick(['plain', 'plain', 'ten', 'frac', 'product']);
      if (kind === 'ten') {
        const e = rng.int(1, 5), ans = Number('1e-' + e);
        return { prompt: `Write as a decimal.${big(S(10, N(-e)))}`, type: 'number', answer: ans, params: { kind, e },
          hints: [`${S(10, N(-e))} = 1 ÷ ${S(10, e)} = 1 ÷ ${N(Math.pow(10, e))}.`, `Dividing 1 by ${N(Math.pow(10, e))} moves the decimal point ${e} place${e > 1 ? 's' : ''} to the left: <b>${N(ans)}</b>.`] };
      }
      if (kind === 'frac') {
        const pairs = [[2, 3], [3, 2], [2, 5], [5, 2], [3, 4], [4, 3], [3, 5], [5, 3], [1, 2], [1, 3], [1, 4], [2, 7], [4, 5]];
        const [a, b] = rng.pick(pairs), e = rng.int(1, 2);
        const num = Math.pow(b, e), den = Math.pow(a, e);
        return { prompt: `Evaluate. Give your answer as a fraction or whole number in simplest form.${big(`(${F(a, b)})${S('', N(-e))}`)}`, type: 'number', answer: num / den, answerText: M.fracText(num, den), params: { kind, a, b, e },
          hints: [`A negative exponent flips the fraction: (${F(a, b)})${S('', N(-e))} = (${F(b, a)})${S('', e)}.`, e === 1 ? `A power of 1 is the number itself.` : `Square the top and the bottom: ${S(b, e)} = ${N(num)} and ${S(a, e)} = ${N(den)}.`, `The value is <b>${F(num, den)}</b>${den === 1 ? '' : ` (${M.fracText(num, den)})`}.`] };
      }
      if (kind === 'product') {
        const b = rng.int(2, 5), m = rng.int(1, 4), n = m + rng.int(1, 3);
        const den = Math.pow(b, n - m);
        return { prompt: `Evaluate. Give your answer as a fraction in simplest form.${big(`${S(b, m)} × ${S(b, N(-n))}`)}`, type: 'number', answer: 1 / den, answerText: M.fracText(1, den), params: { kind, b, m, n },
          hints: [`Same base, so add the exponents: ${N(m)} + (${N(-n)}) = ${N(m - n)}. The expression equals ${S(b, N(m - n))}.`, `A negative exponent means one over the positive power: ${S(b, N(m - n))} = 1 ÷ ${S(b, n - m)}.`, `${S(b, n - m)} = ${N(den)}, so the value is <b>${F(1, den)}</b> (${M.fracText(1, den)}).`] };
      }
      const b = rng.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
      let e = rng.int(1, 3); while (Math.pow(b, e) > 1000) e--;
      const den = Math.pow(b, e);
      return { prompt: `Evaluate. Give your answer as a fraction in simplest form.${big(S(b, N(-e)))}`, type: 'number', answer: 1 / den, answerText: M.fracText(1, den), params: { kind, b, e },
        hints: [`A negative exponent means “one over the positive power”: ${S(b, N(-e))} = 1 ÷ ${S(b, e)}.`, `${S(b, e)} = ${N(den)}.`, `So ${S(b, N(-e))} = <b>${F(1, den)}</b> (${M.fracText(1, den)}).`] };
    },
    verify(q) {
      const p = q.params;
      const v = p.kind === 'ten' ? Math.pow(10, -p.e) : p.kind === 'frac' ? Math.pow(p.a / p.b, -p.e) : p.kind === 'product' ? Math.pow(p.b, p.m) * Math.pow(p.b, -p.n) : Math.pow(p.b, -p.e);
      return Math.abs(v - q.answer) < 1e-12;
    },
  });

  A.skill({
    id: 'math8.scientific-notation', title: 'Scientific notation',
    learn: p(`<b>Scientific notation</b> writes a number as a value from 1 up to (but not including) 10, times a power of ten: 3,600,000 = ${sci(3.6, 6)} and 0.00042 = ${sci(4.2, -4)}. The exponent tells how many places the decimal point moved: positive for big numbers, negative for small ones.`) +
      p(`<b>To write a number in scientific notation</b>, move the decimal point until exactly one non-zero digit is in front of it, and count the places. <b>To write it out</b>, move the point back: a positive exponent moves it right, a negative exponent moves it left, filling with zeros.`) +
      p(`<b>To multiply</b>, multiply the front numbers and add the exponents: (${sci(2, 3)})(${sci(4, 5)}) = ${sci(8, 8)}. If the front number comes out 10 or more, slide the point one more place and add 1 to the exponent: ${sci(24, 8)} becomes ${sci(2.4, 9)}.`) +
      example('Example: a small number', `${big('Write 0.00075 in scientific notation.')}Move the point 4 places right to get 7.5. The number is small, so the exponent is negative: <b>${sci(7.5, -4)}</b>.`) +
      example('Example: writing it out', `${big(sci(6.02, 4))}The exponent is positive, so move the point 4 places right, filling with zeros: 6.02 → 60.2 → 602 → 6,020 → <b>60,200</b>.`) +
      example('Example: multiplying', `${big(`(${sci(4, 3)}) × (${sci(5, 6)})`)}Multiply the front numbers: 4 × 5 = 20. Add the exponents: 3 + 6 = 9. That gives ${sci(20, 9)}, but 20 isn’t between 1 and 10, so write 20 as ${sci(2, 1)} and add 1 to the exponent: <b>${sci(2, 10)}</b>.`),
    make(rng) {
      const kind = rng.pick(['in', 'in', 'out', 'multiply', 'multiply']);
      const mants = [1.2, 1.5, 2, 2.4, 3, 3.6, 4.2, 4.5, 5, 5.8, 6.3, 7, 7.5, 8.1, 9, 9.6];
      if (kind === 'multiply') {
        const a = rng.pick([1.5, 2, 2.5, 3, 4, 5, 6, 1.2, 8, 2.4]), b = rng.pick([1.5, 2, 2.5, 3, 4, 5, 6, 7, 3.5]);
        const m = rng.int(1, 6), n = rng.chance(0.3) ? -rng.int(1, 4) : rng.int(1, 6), s = m + n;
        const P = M.round(a * b, 3), norm = P >= 10;
        const answer = norm ? sci(M.round(P / 10, 3), s + 1) : sci(P, s);
        const cands = norm ? [sci(M.round(P / 10, 3), s), sci(M.round(P / 10, 3), s + 2), sci(M.round(P / 10, 3), m * n), sci(M.round(P / 10, 3), s - 1)] : [sci(P, m * n), sci(P, s + 1), a + b < 10 ? sci(a + b, s) : sci(P, s - 1), sci(P, s - 1)];
        const choices = [answer].concat(distinct(answer, cands, 3));
        const hints = [`Multiply the front numbers: ${N(a)} × ${N(b)} = ${N(P)}. Add the exponents: ${N(m)} + ${wrap(n)} = ${N(s)}. That gives ${sci(P, s)}.`];
        if (norm) hints.push(`${N(P)} is not between 1 and 10, so move its decimal point one place left to ${N(P / 10)} and add 1 to the exponent.`);
        hints.push(`The product is <b>${answer}</b>.`);
        return { prompt: `Multiply. Give the answer in scientific notation.${big(`(${sci(a, m)}) × (${sci(b, n)})`)}`, type: 'choice', choices, answer, hints, params: { kind, a, b, m, n } };
      }
      const mant = rng.pick(mants);
      const e = rng.bool() ? rng.int(3, 8) : -rng.int(1, 5);
      const value = Number(`${mant}e${e}`);
      if (kind === 'out') {
        return { prompt: `Write in standard form (as an ordinary number).${big(sci(mant, e))}`, type: 'number', answer: value, params: { kind, mant, e },
          hints: [`${S(10, N(e))} ${e > 0 ? `= ${N(Math.pow(10, e))}, so multiply ${N(mant)} by ${N(Math.pow(10, e))}` : `= ${N(Math.pow(10, e))}, so divide ${N(mant)} by ${N(Math.pow(10, -e))}`}.`,
            `Move the decimal point of ${N(mant)} ${Math.abs(e)} place${Math.abs(e) > 1 ? 's' : ''} to the ${e > 0 ? 'right' : 'left'}, adding zeros as needed.`,
            `${sci(mant, e)} = <b>${N(value)}</b>.`] };
      }
      const answer = sci(mant, e);
      const cands = [sci(mant, e + 1), sci(mant, e - 1), sci(mant, -e), sci(mant, e + 2)];
      const choices = [answer].concat(distinct(answer, cands, 3));
      return { prompt: `Write in scientific notation.${big(N(value))}`, type: 'choice', choices, answer, params: { kind, mant, e },
        hints: [`Move the decimal point so that one non-zero digit is in front of it: ${N(value)} becomes ${N(mant)}.`,
          `Count the places the point moved: ${Math.abs(e)}, to the ${e > 0 ? 'left, so the exponent is positive' : 'right, so the exponent is negative'}.`,
          `${N(value)} = <b>${answer}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'out') return Math.abs(q.answer - p.mant * Math.pow(10, p.e)) <= 1e-12 * Math.max(1, Math.abs(q.answer));
      const got = parseSci(q.answer); if (!got || got.m < 1 || got.m >= 10) return false;
      const want = p.kind === 'multiply' ? (p.a * Math.pow(10, p.m)) * (p.b * Math.pow(10, p.n)) : Number(`${p.mant}e${p.e}`);
      return Math.abs(got.m * Math.pow(10, got.e) - want) <= 1e-9 * want;
    },
  });

  A.skill({
    id: 'math8.roots', title: 'Square roots and cube roots',
    learn: p(`The <b>square root</b> of a number is the number that, multiplied by itself, gives it back: ${M.sqrt(49)} = 7 because ${S(7, 2)} = 7 × 7 = 49. The <b>cube root</b> undoes cubing (using a number three times in a product): ${cbrt(64)} = 4 because ${S(4, 3)} = 4 × 4 × 4 = 64. A cube root can be negative (${cbrt('−8')} = −2, since (−2) × (−2) × (−2) = −8), but ${M.sqrt(X)} always means the positive root.`) +
      p(`A <b>perfect square</b> is a whole number times itself (1, 4, 9, 16, 25, …), and a <b>perfect cube</b> is a whole number used three times (1, 8, 27, 64, …). Learn the squares up to ${S(15, 2)} = 225 and the cubes up to ${S(10, 3)} = 1,000; most problems use them. A square with area 81 cm² has sides of ${M.sqrt(81)} = 9 cm, and a cube with volume 125 cm³ has edges of ${cbrt(125)} = 5 cm.`) +
      p(`When a number is <b>not</b> a perfect square, its square root lies between two whole numbers. Find the perfect squares on either side: 36 &lt; 40 &lt; 49, so 6 &lt; ${M.sqrt(40)} &lt; 7. Because 40 is closer to 36, the root is a bit above 6 (it’s about 6.3).`) +
      example('Example: a square root', `${big(M.sqrt(144))}Which number times itself is 144? 12 × 12 = 144, so ${M.sqrt(144)} = <b>12</b>.`) +
      example('Example: a negative cube root', `${big(cbrt('−27'))}Which number, used three times, gives −27? 3 × 3 × 3 = 27, and an odd number of negatives makes a negative, so (−3) × (−3) × (−3) = −27. The answer is <b>−3</b>.`) +
      example('Example: between two whole numbers', `${big(M.sqrt(75))}75 isn’t a perfect square. The squares on either side are ${S(8, 2)} = 64 and ${S(9, 2)} = 81, and 64 &lt; 75 &lt; 81. So ${M.sqrt(75)} is between <b>8 and 9</b>, a little closer to 9.`),
    make(rng) {
      const kind = rng.pick(['square', 'square', 'cube', 'area', 'volume', 'estimate', 'estimate']);
      if (kind === 'square') {
        const k = rng.int(2, 20), n = k * k;
        return { prompt: `Evaluate.${big(M.sqrt(n))}`, type: 'number', answer: k, params: { kind, n },
          hints: [`Ask: which number times itself gives ${n}?`, `${N(k)} × ${N(k)} = ${N(n)}, so ${M.sqrt(n)} = <b>${N(k)}</b>.`] };
      }
      if (kind === 'cube') {
        const k = rng.int(2, 10) * (rng.chance(0.25) ? -1 : 1), n = k * k * k;
        return { prompt: `Evaluate.${big(cbrt(N(n)))}`, type: 'number', answer: k, params: { kind, n },
          hints: [`Ask: which number cubed (used three times in a product) gives ${N(n)}?${n < 0 ? ' A negative number cubed is negative, so the root is negative.' : ''}`, `${wrap(k)} × ${wrap(k)} × ${wrap(k)} = ${N(n)}, so ${cbrt(N(n))} = <b>${N(k)}</b>.`] };
      }
      if (kind === 'area') {
        const k = rng.int(3, 20), n = k * k;
        return { prompt: `A square has an area of ${N(n)} cm². How long is each side?`, type: 'number', answer: k, unit: 'cm', params: { kind, n },
          hints: [`Area of a square = side × side, so the side is the square root of the area: ${M.sqrt(n)}.`, `${N(k)} × ${N(k)} = ${N(n)}, so each side is <b>${N(k)} cm</b>.`] };
      }
      if (kind === 'volume') {
        const k = rng.int(2, 10), n = k * k * k;
        return { prompt: `A cube has a volume of ${N(n)} cm³. How long is each edge?`, type: 'number', answer: k, unit: 'cm', params: { kind, n },
          hints: [`Volume of a cube = edge × edge × edge, so the edge is the cube root of the volume: ${cbrt(n)}.`, `${N(k)} × ${N(k)} × ${N(k)} = ${N(n)}, so each edge is <b>${N(k)} cm</b>.`] };
      }
      let n = rng.int(2, 150); while (Number.isInteger(Math.sqrt(n))) n++;
      const f = Math.floor(Math.sqrt(n)), lo = Math.max(1, f - rng.int(0, 2));
      const choices = [0, 1, 2, 3].map(i => `${N(lo + i)} and ${N(lo + i + 1)}`);
      const answer = `${N(f)} and ${N(f + 1)}`;
      return { prompt: `${M.sqrt(n)} is between which two whole numbers?`, type: 'choice', choices, answer, keepOrder: true, params: { kind, n },
        hints: [`Find the perfect squares on either side of ${n}: ${S(f, 2)} = ${f * f} and ${S(f + 1, 2)} = ${(f + 1) * (f + 1)}.`,
          `${f * f} < ${n} < ${(f + 1) * (f + 1)}, so taking square roots: ${f} < ${M.sqrt(n)} < ${f + 1}.`,
          `${M.sqrt(n)} is between <b>${N(f)} and ${N(f + 1)}</b>${n - f * f < (f + 1) * (f + 1) - n ? `, closer to ${f}` : `, closer to ${f + 1}`}.`] };
    },
    verify(q) {
      const { kind, n } = q.params;
      if (kind === 'estimate') { const mm = q.answer.match(/^(\d+) and (\d+)$/); return !!mm && Number(mm[1]) * Number(mm[1]) < n && n < Number(mm[2]) * Number(mm[2]) && Number(mm[2]) === Number(mm[1]) + 1; }
      if (kind === 'cube' || kind === 'volume') return q.answer * q.answer * q.answer === n;
      return q.answer * q.answer === n && q.answer > 0;
    },
  });

  /* ---------- Unit 2: Solving equations with one unknown ---------- */
  /** a·x + b, printed: "3x − 5", "−x + 4", "7" */
  const lin = (a, b) => M.poly([a, b]);
  /** "Subtract 3x from" / "Add 3x to": taking an x-term off both sides, said the natural way */
  const takeAway = c => c < 0 ? `Add ${M.term(-c, 'x')} to` : `Subtract ${M.term(c, 'x')} from`;

  A.skill({
    id: 'math8.variables-both-sides', title: 'Equations with variables on both sides',
    learn: p(`When ${X} appears on both sides, first gather the <b>${X}-terms</b> (the parts with ${X} in them, such as 5${X}) on one side and the plain numbers on the other. <b>Whatever you do to one side, do to the other</b>, so the equation stays balanced.`) +
      p(`The number in front of ${X} is its <b>coefficient</b>: in 5${X} it’s 5. A good habit is to take away the ${X}-term with the smaller coefficient from both sides, so the one left over is positive. Then it’s an ordinary two-step equation. Finish by checking: put your answer back into <b>both</b> sides and make sure they match.`) +
      example('Example: gather on the left', `${big(`5${X} − 4 = 2${X} + 11`)}Subtract 2${X} from both sides: 3${X} − 4 = 11. Add 4: 3${X} = 15. Divide by 3: <b>${X} = 5</b>. Check: 5(5) − 4 = 21 and 2(5) + 11 = 21. ✓`) +
      example('Example: gather on the right', `${big(`2${X} + 9 = 6${X} + 17`)}The smaller ${X}-term is on the left, so subtract 2${X} from both sides: 9 = 4${X} + 17. Subtract 17: −8 = 4${X}. Divide by 4: <b>${X} = −2</b>. Check: 2(−2) + 9 = 5 and 6(−2) + 17 = 5. ✓`),
    make(rng) {
      const x = rng.int(-10, 10);
      let a = rng.nz(-9, 9), c = rng.nz(-9, 9);
      if (a === c) c = a + rng.pick([-3, -2, 2, 3]);
      if (c === 0) c = a + 4;
      const b = rng.int(-15, 15), d = (a - c) * x + b;
      const [hi, lo, hiK, loK] = a > c ? [a, c, b, d] : [c, a, d, b];      // keep the bigger x-coefficient on the left in the working
      const left = a > c ? 'left' : 'right';
      const hints = [
        `${takeAway(lo)} both sides to gather the ${X}-terms on the ${left}: ${lin(hi - lo, hiK)} = ${N(loK)}.`,
        `${hiK === 0 ? 'There is no number to move.' : `${hiK > 0 ? `Subtract ${N(hiK)} from` : `Add ${N(-hiK)} to`} both sides: ${M.term(hi - lo, 'x')} = ${N(loK - hiK)}.`}`,
        hi - lo === 1 ? `The coefficient of ${X} is already 1, so ${X} = ${N(loK - hiK)}.` : `Divide both sides by ${N(hi - lo)}: ${X} = ${N(loK - hiK)} ÷ ${N(hi - lo)}.`,
        `<b>${X} = ${N(x)}</b>. Check: both sides equal ${N(a * x + b)}.`,
      ];
      return { prompt: `Solve for ${X}.${big(`${lin(a, b)} = ${lin(c, d)}`)}`, type: 'number', answer: x, hints, params: { a, b, c, d } };
    },
    verify(q) { const { a, b, c, d } = q.params; return a * q.answer + b === c * q.answer + d && a !== c; },
  });

  A.skill({
    id: 'math8.distributive-equations', title: 'Equations with parentheses',
    learn: p(`When an equation has parentheses, use the <b>distributive property</b> first: multiply the number outside by <b>every</b> term inside. 3(${X} − 4) = 3${X} − 12, and −2(${X} + 5) = −2${X} − 10 (the negative multiplies both terms).`) +
      p(`Then combine <b>like terms</b> on each side (terms of the same kind, such as 3${X} and 5${X}, or 10 and −7), gather the ${X}-terms on one side, and solve as usual. The most common slip is multiplying only the first term inside the parentheses.`) +
      example('Example: a number on the other side', `${big(`−3(${X} + 4) = 6`)}Distribute −3 to both terms: −3${X} − 12 = 6. Add 12: −3${X} = 18. Divide by −3: <b>${X} = −6</b>. Check: −3(−6 + 4) = −3(−2) = 6. ✓`) +
      example(`Example: ${X} on both sides`, `${big(`4(${X} − 3) = 2${X} + 6`)}Distribute: 4${X} − 12 = 2${X} + 6. Subtract 2${X}: 2${X} − 12 = 6. Add 12: 2${X} = 18. So <b>${X} = 9</b>.`) +
      example('Example: combine first', `${big(`2(${X} + 5) − 7 = 5${X} + 9`)}Distribute: 2${X} + 10 − 7 = 5${X} + 9. Combine 10 − 7: 2${X} + 3 = 5${X} + 9. Subtract 2${X}: 3 = 3${X} + 9. Subtract 9: −6 = 3${X}, so <b>${X} = −2</b>.`),
    make(rng) {
      const x = rng.int(-9, 9), form = rng.pick(['a(x+b)=c', 'a(x+b)=cx+d', 'a(x+b)+e=cx+d']);
      const a = rng.pick([-5, -4, -3, -2, 2, 3, 4, 5, 6]), b = rng.nz(-8, 8);
      let c = 0, e = 0;
      if (form !== 'a(x+b)=c') { c = rng.nz(-6, 6); if (c === a) c = a + 2; if (c === 0) c = 1; }
      if (form === 'a(x+b)+e=cx+d') e = rng.nz(-9, 9);
      const d = a * (x + b) + e - c * x;
      const L = `${N(a)}(${lin(1, b)})${e ? ` ${M.signed(e)}` : ''}`, R = c ? lin(c, d) : N(d);
      const k = a * b + e;                                         // constant on the left after distributing
      const hints = [
        `Distribute ${N(a)} to both terms inside: ${N(a)} × ${X} = ${M.term(a, 'x')} and ${N(a)} × ${wrap(b)} = ${N(a * b)}.${e ? ` Then combine ${N(a * b)} ${M.signed(e)} = ${N(k)}.` : ''} The left side is ${lin(a, k)}.`,
      ];
      if (c) hints.push(`${takeAway(c)} both sides: ${lin(a - c, k)} = ${N(d)}.`);
      hints.push(`${k === 0 ? 'Nothing to move' : `${k > 0 ? `Subtract ${N(k)} from` : `Add ${N(-k)} to`} both sides`}: ${M.term(a - c, 'x')} = ${N(d - k)}.`);
      hints.push(a - c === 1 ? `The coefficient of ${X} is 1, so <b>${X} = ${N(x)}</b>.` : `Divide by ${N(a - c)}: <b>${X} = ${N(x)}</b>.`);
      return { prompt: `Solve for ${X}.${big(`${L} = ${R}`)}`, type: 'number', answer: x, hints, params: { a, b, c, d, e } };
    },
    verify(q) { const { a, b, c, d, e } = q.params, x = q.answer; return a * (x + b) + e === c * x + d; },
  });

  A.skill({
    id: 'math8.number-of-solutions', title: 'Number of solutions to equations',
    learn: p(`Simplify both sides completely, then compare. If the ${X}-terms are <b>different</b>, the equation has <b>exactly one solution</b>.`) +
      p(`If the ${X}-terms are the same, they cancel when you subtract. What is left decides it: a true statement such as 6 = 6 means <b>infinitely many solutions</b> (every ${X} works, because the two sides are the same expression); a false statement such as 6 = 2 means <b>no solution</b> (no ${X} can make it true).`) +
      example('Example: no solution', `${big(`3(${X} + 2) = 3${X} + 2`)}Distribute: 3${X} + 6 = 3${X} + 2. Subtract 3${X}: 6 = 2, which is false. <b>No solution.</b>`) +
      example('Example: infinitely many', `${big(`2(${X} − 3) + ${X} = 3${X} − 6`)}Distribute and combine: 2${X} − 6 + ${X} = 3${X} − 6, so 3${X} − 6 = 3${X} − 6. Subtract 3${X}: −6 = −6, which is always true. <b>Infinitely many solutions.</b>`) +
      example('Example: exactly one', `${big(`4(${X} + 1) = 2${X} + 10`)}Distribute: 4${X} + 4 = 2${X} + 10. The ${X}-terms are different (4${X} and 2${X}), so they don’t cancel: 2${X} = 6 and ${X} = 3. <b>Exactly one solution.</b>`),
    make(rng) {
      const kind = rng.pick(['one', 'none', 'many']);
      const pp = rng.pick([2, 3, 4, 5, -2, -3]), qq = rng.nz(-6, 6), r = rng.int(-3, 3);   // left: p(x + q) + r·x
      const a = pp + r, k = pp * qq;
      let c, d;
      if (kind === 'one') { c = a + rng.pick([-2, -1, 1, 2, 3]); d = rng.int(-12, 12); }
      else if (kind === 'many') { c = a; d = k; }
      else { c = a; d = k + rng.pick([-5, -3, -2, -1, 1, 2, 4, 6]); }
      const L = `${N(pp)}(${lin(1, qq)})${r ? ` ${r < 0 ? '−' : '+'} ${M.term(Math.abs(r), 'x')}` : ''}`;
      const choices = ['Exactly one solution', 'No solution', 'Infinitely many solutions'];
      const answer = { one: choices[0], none: choices[1], many: choices[2] }[kind];
      const hints = [`Simplify the left side: ${N(pp)}(${lin(1, qq)}) = ${lin(pp, k)}${r ? `, and combining with ${M.term(r, 'x')} gives ${lin(a, k)}` : ''}. The equation is ${lin(a, k)} = ${lin(c, d)}.`];
      if (kind === 'one') hints.push(`The ${X}-coefficients are different (${N(a)} and ${N(c)}), so subtracting leaves a single ${X}-term and one value of ${X} works.`, `<b>Exactly one solution</b> (${X} = ${M.fracText(d - k, a - c)}).`);
      else hints.push(`The ${X}-terms are the same, so ${takeAway(a).toLowerCase()} both sides: ${N(k)} = ${N(d)}.`, kind === 'many' ? `${N(k)} = ${N(d)} is always true, so every ${X} works: <b>infinitely many solutions</b>.` : `${N(k)} = ${N(d)} is false, so no ${X} works: <b>no solution</b>.`);
      return { prompt: `How many solutions does this equation have?${big(`${L} = ${lin(c, d)}`)}`, type: 'choice', choices, answer, keepOrder: true, hints, params: { pp, qq, r, c, d } };
    },
    verify(q) {
      const { pp, qq, r, c, d } = q.params;
      const f = x => pp * (x + qq) + r * x - (c * x + d);           // left minus right, evaluated, not simplified
      const want = f(0) !== f(1) ? 'Exactly one solution' : f(0) === 0 ? 'Infinitely many solutions' : 'No solution';
      return q.answer === want;
    },
  });

  /* ---------- Unit 3: Linear equations and functions ---------- */
  A.skill({
    id: 'math8.slope', title: 'Slope and rate of change',
    learn: p(`The <b>slope</b> of a line says how steep it is: how much ${Y} changes for each step of 1 in ${X}. From two points, <b>slope = (change in ${Y}) ÷ (change in ${X}) = (${M.sub(Y, 2)} − ${M.sub(Y, 1)}) ÷ (${M.sub(X, 2)} − ${M.sub(X, 1)})</b>. Subtract in the same order on top and bottom.`) +
      p(`A positive slope rises from left to right, a negative slope falls, and a horizontal line has slope 0. In a word problem the slope is the <b>rate of change</b>, with units such as dollars per hour or centimeters per day.`) +
      example('Example: two points', `${big(`${PT(1, 2)} and ${PT(5, 10)}`)}Change in ${Y}: 10 − 2 = 8. Change in ${X}: 5 − 1 = 4. Slope = 8 ÷ 4 = <b>2</b>.`) +
      example('Example: a table', `${M.table([X, Y], [[N(-2), N(5)], [N(4), N(1)]], { compact: true })}Change in ${Y}: 1 − 5 = −4. Change in ${X}: 4 − (−2) = 6. Slope = −4 ÷ 6 = <b>−${F(2, 3)}</b>. It’s negative, so the line falls from left to right.`) +
      example('Example: a rate of change', `After 2 hours a candle is 18 cm tall, and after 6 hours it’s 12 cm tall. The rate of change is (12 − 18) ÷ (6 − 2) = −6 ÷ 4 = <b>−1.5 cm per hour</b>. It’s negative because the candle is getting shorter.`),
    make(rng) {
      const kind = rng.pick(['points', 'points', 'table', 'word']);
      if (kind === 'word') return slopeWord(rng);
      const x1 = rng.int(-8, 6), dx = rng.nz(-6, 7) || 1, x2 = x1 + dx;
      const dy = rng.int(-12, 12), y1 = rng.int(-9, 9), y2 = y1 + dy;
      const [sn, sd] = M.simp(dy, dx), ans = sn / sd;
      const shown = kind === 'table' ? `${M.table([X, Y], [[N(x1), N(y1)], [N(x2), N(y2)]].sort((r, t) => Number(minus(r[0])) - Number(minus(t[0]))))}` : big(`${PT(x1, y1)} and ${PT(x2, y2)}`);
      const lead = kind === 'table' ? `The points in this table lie on a line. What is its slope?` : `What is the slope of the line through these two points?`;
      return { prompt: `${lead} Give a fraction in simplest form if it is not a whole number.${shown}`, type: 'number', answer: ans, answerText: M.fracText(sn, sd), params: { kind, x1, y1, x2, y2 },
        hints: [`Slope = (change in ${Y}) ÷ (change in ${X}), subtracting in the same order: (${N(y2)} − ${wrap(y1)}) ÷ (${N(x2)} − ${wrap(x1)}).`,
          `Change in ${Y} = ${N(dy)}; change in ${X} = ${N(dx)}.`,
          `Slope = ${N(dy)} ÷ ${wrap(dx)}${sd !== 1 ? ` = ${F(sn, sd)}` : ''}, so the slope is <b>${M.fracText(sn, sd)}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'word') return Math.abs((p.v2 - p.v1) / (p.t2 - p.t1) - q.answer) < 1e-9;
      // a line through both points with this slope: y1 + m(x2 − x1) must land on y2
      return Math.abs(p.y1 + q.answer * (p.x2 - p.x1) - p.y2) < 1e-9;
    },
  });
  function slopeWord(rng) {
    const name = rng.pick(NAMES);
    const t1 = rng.int(1, 4), t2 = t1 + rng.int(2, 5);
    const story = rng.pick([
      () => { const r = rng.pick([12, 15, 18, 20, 25]), v1 = r * t1 + rng.int(0, 4) * 10; return { r, v1, text: v => `${name}'s savings grow at a steady rate. After ${t1} weeks there is ${M.money(v1)} in the account; after ${t2} weeks there is ${M.money(v)}. What is the rate of change, in dollars per week?`, unitOut: '$/week', per: 'week' }; },
      () => { const r = -rng.pick([1.5, 2, 2.5, 3, 4]), v1 = rng.int(20, 30); return { r, v1, unitOut: 'cm/hour', per: 'hour', text: v => `A candle burns down at a steady rate. After ${t1} hours it is ${N(v1)} cm tall; after ${t2} hours it is ${N(v)} cm tall. What is the rate of change of its height, in centimeters per hour?` }; },
      () => { const r = rng.pick([45, 50, 55, 60, 65]), v1 = r * t1 + rng.int(0, 3) * 20; return { r, v1, unitOut: 'km/hour', per: 'hour', text: v => `A bus travels at a steady speed. After ${t1} hours it has gone ${N(v1)} km; after ${t2} hours it has gone ${N(v)} km. What is the rate of change, in kilometers per hour?` }; },
      () => { const r = -rng.pick([3, 4, 5, 6, 8]), v1 = rng.int(60, 90); return { r, v1, unitOut: 'L/min', per: 'minute', text: v => `A tank is drained at a steady rate. After ${t1} minutes it holds ${N(v1)} liters; after ${t2} minutes it holds ${N(v)} liters. What is the rate of change, in liters per minute?` }; },
    ])();
    const v2 = M.round(story.v1 + story.r * (t2 - t1), 2);
    return { prompt: story.text(v2), type: 'number', answer: story.r, unit: story.unitOut, params: { kind: 'word', t1, t2, v1: story.v1, v2 },
      hints: [`The rate of change is (change in amount) ÷ (change in time).`, `Change in amount: ${N(v2)} − ${N(story.v1)} = ${N(M.round(v2 - story.v1, 2))}. Change in time: ${t2} − ${t1} = ${t2 - t1}.`,
        `${N(M.round(v2 - story.v1, 2))} ÷ ${t2 - t1} = <b>${N(story.r)}</b> per ${story.per}${story.r < 0 ? ' (negative, because the amount is going down)' : ''}.`] };
  }

  A.skill({
    id: 'math8.slope-intercept-form', title: 'Writing slope-intercept equations',
    learn: p(`<b>Slope-intercept form</b> is ${Y} = ${V('m')}${X} + ${V('b')}, where ${V('m')} is the slope and ${V('b')} is the <b>${Y}-intercept</b>: the ${Y}-value where the line crosses the ${Y}-axis, at ${X} = 0.`) +
      p(`If you know the slope and one point, put them into ${Y} = ${V('m')}${X} + ${V('b')} and solve for ${V('b')}. If you know two points, find the slope first, then use either point.`) +
      example('Example: a slope and a point', `${big(`Slope 3, through ${PT(2, 1)}`)}Put ${X} = 2 and ${Y} = 1 into ${Y} = 3${X} + ${V('b')}: 1 = 3(2) + ${V('b')}, so 1 = 6 + ${V('b')} and ${V('b')} = −5. The equation is <b>${eqn(3, -5)}</b>.`) +
      example('Example: two points', `${big(`Through ${PT(-1, 7)} and ${PT(2, -2)}`)}Slope first: (−2 − 7) ÷ (2 − (−1)) = −9 ÷ 3 = −3. Then use ${PT(-1, 7)}: 7 = −3(−1) + ${V('b')}, so 7 = 3 + ${V('b')} and ${V('b')} = 4. The equation is <b>${eqn(-3, 4)}</b>.`),
    make(rng) {
      const kind = rng.pick(['slope-point', 'two-points']);
      const m = rng.nz(-5, 5), b = rng.int(-9, 9);
      const x1 = rng.nz(-5, 5), y1 = m * x1 + b;
      let x2 = rng.nz(-5, 5); if (x2 === x1) x2 = x1 + 2;
      const y2 = m * x2 + b;
      const answer = eqn(m, b);
      const cands = [eqn(m, y1 + m * x1), eqn(m, y1), eqn(-m, b), eqn(m, -b), eqn(m, b + 2 * m), eqn(b || 1, m)];
      const choices = [answer].concat(distinct(answer, cands.filter(c => parseEqn(c)), 3));
      const given = kind === 'slope-point' ? `has slope ${N(m)} and passes through ${PT(x1, y1)}` : `passes through ${PT(x1, y1)} and ${PT(x2, y2)}`;
      const hints = [];
      if (kind === 'two-points') hints.push(`Find the slope first: (${N(y2)} − ${wrap(y1)}) ÷ (${N(x2)} − ${wrap(x1)}) = ${N(y2 - y1)} ÷ ${N(x2 - x1)} = ${N(m)}.`);
      hints.push(`Put the slope and the point ${PT(x1, y1)} into ${Y} = ${V('m')}${X} + ${V('b')}: ${N(y1)} = ${N(m)} × ${wrap(x1)} + ${V('b')}, so ${N(y1)} = ${N(m * x1)} + ${V('b')}.`,
        `Solve for ${V('b')}: ${V('b')} = ${N(y1)} − ${wrap(m * x1)} = ${N(b)}.`, `The equation is <b>${answer}</b>.`);
      return { prompt: `Which equation describes the line that ${given}?`, type: 'choice', choices, answer, hints, params: { kind, m, x1, y1, x2, y2 } };
    },
    verify(q) {
      const p = q.params, got = parseEqn(q.answer); if (!got) return false;
      const on = (x, y) => got[0] * x + got[1] === y;
      return on(p.x1, p.y1) && (p.kind === 'slope-point' ? got[0] === p.m : on(p.x2, p.y2));
    },
  });

  A.skill({
    id: 'math8.recognize-functions', title: 'Recognizing functions',
    learn: p(`A <b>relation</b> is any set of input-output pairs, like a table or a list of ordered pairs. A <b>function</b> is a relation that gives <b>exactly one output for each input</b>. So look at the inputs (the ${X}-values): if the same ${X} ever appears with two <b>different</b> ${Y}-values, it’s not a function.`) +
      p(`Repeated <b>outputs</b> are fine. ${PT(1, 5)} and ${PT(2, 5)} can both belong to a function: two inputs share an output, but each input still has only one. A repeated pair like ${PT(3, 4)} written twice is also fine, because it’s the same input with the same output.`) +
      example('Example: not a function', `${big(`${PT(1, 4)}, ${PT(2, 6)}, ${PT(1, 8)}`)}The input 1 is paired with both 4 and 8. <b>Not a function.</b>`) +
      example('Example: a function', `${M.table([`Input ${X}`, `Output ${Y}`], [[N(-1), 4], [0, 6], [2, 4], [3, 9]], { compact: true })}The inputs −1, 0, 2 and 3 are all different, so each one has just one output. The output 4 shows up twice, and that’s allowed. <b>It’s a function.</b>`),
    make(rng) {
      const isFn = rng.bool(), form = rng.pick(['table', 'pairs']);
      const xs = rng.sample([-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7], 5);
      const ys = xs.map(() => rng.int(-9, 9));
      if (isFn && rng.bool()) ys[3] = ys[1];                                   // a repeated output, still a function
      if (!isFn) { xs[4] = xs[rng.int(0, 2)]; let y = rng.int(-9, 9); const i = xs.indexOf(xs[4]); if (y === ys[i]) y = ys[i] + 3; ys[4] = y; }
      const order = rng.shuffle([0, 1, 2, 3, 4]);
      const rows = order.map(i => [xs[i], ys[i]]);
      const shown = form === 'table' ? M.table([`Input ${X}`, `Output ${Y}`], rows.map(r => [N(r[0]), N(r[1])])) : big(rows.map(r => PT(r[0], r[1])).join(', '));
      const choices = ['Yes: each input has exactly one output', 'No: an input has two different outputs', 'No: two inputs share the same output', 'Yes: every output is a different number'];
      const answer = isFn ? choices[0] : choices[1];
      const dupX = isFn ? null : xs[4];
      const hints = [`Look only at the inputs (the ${X}-values) and check whether any of them repeats.`,
        isFn ? `All the inputs are different: ${xs.map(N).join(', ')}. ${new Set(ys).size < 5 ? 'An output repeats, but that is allowed.' : ''}` : `The input ${N(dupX)} appears twice, with outputs ${N(ys[xs.indexOf(dupX)])} and ${N(ys[4])}.`,
        isFn ? `<b>Yes: each input has exactly one output</b>, so this is a function.` : `<b>No: an input has two different outputs</b>, so this is not a function.`];
      return { prompt: `Is this relation a function?${shown}`, type: 'choice', choices, answer, hints, params: { rows } };
    },
    verify(q) {
      const seen = new Map(); let fn = true;
      q.params.rows.forEach(([x, y]) => { if (seen.has(x) && seen.get(x) !== y) fn = false; seen.set(x, y); });
      return q.answer.startsWith(fn ? 'Yes: each input' : 'No: an input');
    },
  });

  A.skill({
    id: 'math8.linear-nonlinear', title: 'Linear and nonlinear functions',
    learn: p(`A function is <b>linear</b> when its rate of change is <b>constant</b> (always the same): every time ${X} goes up by the same step, ${Y} changes by the same amount. Its graph is a straight line, and its equation can be written ${Y} = ${V('m')}${X} + ${V('b')}.`) +
      p(`To test a table, find the change in ${Y} between rows and divide by the change in ${X}. If that rate is the same everywhere, the function is linear and the rate is its slope. If it changes (as with ${Y} = ${S(X, 2)} or a quantity that doubles), the function is <b>nonlinear</b>.`) +
      example('Example: linear', `${M.table([X, Y], [[0, 1], [2, 7], [4, 13], [6, 19]], { compact: true })}${X} goes up by 2 each row and ${Y} goes up by 6 each row. The rate of change is 6 ÷ 2 = 3 every time, so it’s <b>linear</b> with rate of change 3.`) +
      example('Example: nonlinear', `${M.table([X, Y], [[0, 1], [1, 2], [2, 5], [3, 10]], { compact: true })}${X} goes up by 1 each row, but ${Y} goes up by 1, then 3, then 5. The changes aren’t the same, so it’s <b>nonlinear</b>. (These are ${S(X, 2)} + 1, a curve.)`),
    make(rng) {
      const linear = rng.bool(), step = rng.pick([1, 1, 2]), x0 = rng.int(-2, 2);
      const xs = [0, 1, 2, 3].map(i => x0 + i * step);
      const m = rng.nz(-5, 5), b = rng.int(-6, 6);
      const kindNL = rng.pick(['square', 'double', 'cube-ish']);
      const fNL = { square: x => x * x + b, double: x => Math.pow(2, x - x0) * (Math.abs(m) + 1), 'cube-ish': x => x * x - x + b }[kindNL];
      const ys = xs.map(x => linear ? m * x + b : fNL(x));
      const rate = (ys[1] - ys[0]) / step;
      const opt = r => `Linear, with rate of change ${N(r)}`;
      const nl = 'Nonlinear: the rate of change varies';
      const answer = linear ? opt(m) : nl;
      const cands = linear ? [opt(m * step === m ? m + 1 : m * step), opt(-m), nl, opt(m + 1)] : [opt(rate), opt((ys[3] - ys[2]) / step), opt(rate + 1), opt(-rate)];
      const choices = [answer].concat(distinct(answer, cands, 3));
      const diffs = [1, 2, 3].map(i => ys[i] - ys[i - 1]);
      const hints = [`${X} goes up by ${step} each row. Find how much ${Y} changes each row: ${diffs.map(N).join(', ')}.`,
        linear ? `The change is always ${N(diffs[0])}, so the rate of change is ${N(diffs[0])} ÷ ${step} = ${N(m)} everywhere.` : `The changes are not all the same, so the rate of change is not constant.`,
        linear ? `<b>${answer}</b>.` : `<b>Nonlinear</b>: the rate of change varies.`];
      return { prompt: `Is the function in this table linear or nonlinear?${M.table([X, Y], xs.map((x, i) => [N(x), N(ys[i])]))}`, type: 'choice', choices, answer, hints, params: { xs, ys } };
    },
    verify(q) {
      const { xs, ys } = q.params;
      const r = [1, 2, 3].map(i => (ys[i] - ys[i - 1]) / (xs[i] - xs[i - 1]));
      return r.every(v => v === r[0]) ? q.answer === `Linear, with rate of change ${N(r[0])}` : q.answer.startsWith('Nonlinear');
    },
  });

  /* ---------- Unit 4: Systems of equations ---------- */
  A.skill({
    id: 'math8.solve-systems', title: 'Solving systems of equations',
    learn: p(`A <b>system of equations</b> is two equations that must both be true at once. Its solution is the ordered pair ${PT('x', 'y').replace('x', X).replace('y', Y)} that works in <b>both</b>: the point where the two lines cross.`) +
      p(`<b>Substitution:</b> if one equation already says ${Y} = …, replace ${Y} in the other equation with that expression and solve for ${X}. <b>Elimination:</b> add or subtract the equations (multiplying one first if needed) so that one variable cancels. Either way, find the second variable by putting the first back into an equation, and check the pair in both.`) +
      example('Example: substitution', `${big(`${Y} = 2${X} + 1 and 3${X} + ${Y} = 16`)}Substitute: 3${X} + (2${X} + 1) = 16, so 5${X} + 1 = 16, 5${X} = 15 and ${X} = 3. Then ${Y} = 2(3) + 1 = 7. The solution is <b>${PT(3, 7)}</b>.`) +
      example('Example: elimination', `${big(`2${X} + ${Y} = 11 and 3${X} − ${Y} = 4`)}The ${Y}-terms are +${Y} and −${Y}, so adding the equations cancels ${Y}: 5${X} = 15 and ${X} = 3. Put it into the first: 2(3) + ${Y} = 11, so ${Y} = 5. Check the second: 3(3) − 5 = 4. ✓ The solution is <b>${PT(3, 5)}</b>. (If the ${Y}-terms were the same, such as +${Y} and +${Y}, you would subtract instead.)`),
    make(rng) {
      const x = rng.int(-6, 6), y = rng.int(-6, 6), form = rng.pick(['sub', 'elim']), ask = rng.pick(['x', 'pair', 'pair']);
      let e1, e2, coef, hints;
      if (form === 'sub') {
        const m = rng.nz(-4, 4), b = y - m * x;
        let a = rng.nz(-4, 5), c = rng.nz(-3, 3); if (a + c * m === 0) a += 1; if (a === 0) a = 2;
        const d = a * x + c * y;
        e1 = eqn(m, b); e2 = lin2(a, c, d); coef = { a1: -m, b1: 1, c1: b, a2: a, b2: c, c2: d };
        hints = [`The first equation gives ${Y} directly. Substitute it into the second: ${M.term(a, 'x')} ${c < 0 ? '−' : '+'} ${Math.abs(c) === 1 ? '' : N(Math.abs(c))}(${lin(m, b)}) = ${N(d)}.`,
          `Expand and collect: ${lin(a + c * m, c * b)} = ${N(d)}, so ${M.term(a + c * m, 'x')} = ${N(d - c * b)} and ${X} = ${N(x)}.`,
          `Then ${Y} = ${N(m)} × ${wrap(x)} ${M.signed(b)} = ${N(y)}.`];
      } else {
        const a1 = rng.nz(-4, 4), b1 = rng.pick([1, 2, 3, -1, -2]), b2 = rng.pick([-1, 1]) * b1;
        let a2 = rng.nz(-4, 4); if (a2 * b1 === a1 * b2) a2 = a1 + (b2 === b1 ? 2 : 1) * rng.pick([1, -1]) || 3;
        if (a2 * b1 === a1 * b2) a2 = -a2 + 5;
        const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y;
        e1 = lin2(a1, b1, c1); e2 = lin2(a2, b2, c2); coef = { a1, b1, c1, a2, b2, c2 };
        const add = b2 === -b1;
        hints = [`The ${Y}-terms are ${M.term(b1, 'y')} and ${M.term(b2, 'y')}, so ${add ? 'adding' : 'subtracting'} the equations makes ${Y} cancel.`,
          `${add ? 'Add' : 'Subtract'}: ${M.term(add ? a1 + a2 : a1 - a2, 'x')} = ${N(add ? c1 + c2 : c1 - c2)}, so ${X} = ${N(x)}.`,
          `Put ${X} = ${N(x)} into the first equation: ${N(a1)} × ${wrap(x)} ${b1 < 0 ? '−' : '+'} ${M.term(Math.abs(b1), 'y')} = ${N(c1)}, which gives ${Y} = ${N(y)}.`];
      }
      const system = big(`${e1}<br>${e2}`);
      if (ask === 'x') {
        hints.push(`Check ${PT(x, y)} in both equations. The answer is <b>${X} = ${N(x)}</b>.`);
        return { prompt: `Solve the system. What is the value of ${X}?${system}`, type: 'number', answer: x, hints, params: coef };
      }
      const answer = PT(x, y);
      const choices = [answer].concat(distinct(answer, [PT(y, x), PT(x, -y), PT(-x, y), PT(x, y + 1), PT(-x, -y), PT(x + 1, y)], 3));
      hints.push(`Both equations check, so the solution is <b>${answer}</b>.`);
      return { prompt: `Solve the system of equations.${system}`, type: 'choice', choices, answer, hints, params: coef };
    },
    verify(q) {
      const { a1, b1, c1, a2, b2, c2 } = q.params;
      let found = null;                                            // brute force over a grid of integer points
      for (let x = -20; x <= 20; x++) for (let y = -60; y <= 60; y++) if (a1 * x + b1 * y === c1 && a2 * x + b2 * y === c2) found = [x, y];
      if (!found || a1 * b2 === a2 * b1) return false;
      if (q.type === 'number') return q.answer === found[0];
      const got = parsePt(q.answer); return !!got && got[0] === found[0] && got[1] === found[1];
    },
  });

  A.skill({
    id: 'math8.systems-solutions', title: 'Number of solutions to systems of equations',
    learn: p(`Two lines can meet in three ways. Different slopes: they cross once, so <b>exactly one solution</b>. Same slope, different ${Y}-intercepts: they’re <b>parallel</b> (always the same distance apart) and never meet, so <b>no solution</b>. Same slope and same intercept: they’re the same line, so <b>infinitely many solutions</b>.`) +
      p(`So rewrite both equations in slope-intercept form ${Y} = ${V('m')}${X} + ${V('b')} and compare ${V('m')} first, then ${V('b')}. To rewrite 4${X} + 2${Y} = 6, subtract 4${X} and divide by 2: ${Y} = −2${X} + 3.`) +
      example('Example: the same line', `${big(`${Y} = 3${X} − 2 and 6${X} − 2${Y} = 4`)}Subtract 6${X} from both sides of the second: −2${Y} = −6${X} + 4. Divide by −2: ${Y} = 3${X} − 2. It’s the same line: <b>infinitely many solutions</b>.`) +
      example('Example: parallel lines', `${big(`${Y} = 2${X} + 1 and 4${X} − 2${Y} = 6`)}The second becomes −2${Y} = −4${X} + 6, so ${Y} = 2${X} − 3. Both slopes are 2, but the intercepts are 1 and −3: parallel lines, so <b>no solution</b>.`) +
      example('Example: lines that cross', `${big(`${Y} = −${X} + 4 and 3${X} + ${Y} = 2`)}The second becomes ${Y} = −3${X} + 2. The slopes are −1 and −3, which are different, so the lines cross once: <b>exactly one solution</b>.`),
    make(rng) {
      const kind = rng.pick(['one', 'none', 'many']);
      const m1 = rng.nz(-4, 4), b1 = rng.int(-7, 7), k = rng.pick([1, 2, 3, -1, -2]);
      let m2 = m1, b2 = b1;
      if (kind === 'one') m2 = m1 + rng.pick([-2, -1, 1, 2]);
      if (kind === 'none') b2 = b1 + rng.pick([-4, -3, -2, 2, 3, 5]);
      // second equation in standard form: k(−m2·x + y) = k·b2, with a positive x-coefficient where possible
      let a = -m2 * k, bb = k, c = b2 * k; if (a < 0) { a = -a; bb = -bb; c = -c; }
      const e2 = a === 0 ? `${M.term(bb, 'y')} = ${N(c)}` : lin2(a, bb, c);
      const choices = ['Exactly one solution', 'No solution', 'Infinitely many solutions'];
      const answer = { one: choices[0], none: choices[1], many: choices[2] }[kind];
      const hints = [`Rewrite the second equation as ${Y} = … : ${a ? `move the ${X}-term across and ` : ''}divide by ${N(bb)} to get ${eqn(m2, b2)}.`,
        `Compare with ${eqn(m1, b1)}: the slopes are ${N(m1)} and ${N(m2)}${m1 === m2 ? `, the intercepts are ${N(b1)} and ${N(b2)}` : ''}.`,
        kind === 'one' ? `Different slopes, so the lines cross once: <b>exactly one solution</b>.` : kind === 'none' ? `Same slope but different intercepts: parallel lines, <b>no solution</b>.` : `Same slope and same intercept: the same line, <b>infinitely many solutions</b>.`];
      return { prompt: `How many solutions does this system have?${big(`${eqn(m1, b1)}<br>${e2}`)}`, type: 'choice', choices, answer, keepOrder: true, hints, params: { m1, b1, a, bb, c } };
    },
    verify(q) {
      const { m1, b1, a, bb, c } = q.params;
      const on2 = (x, y) => a * x + bb * y === c;
      const want = (on2(0, b1) && on2(1, m1 + b1)) ? 'Infinitely many solutions'       // two points of line 1 lie on line 2
        : (a * 1 + bb * m1 === 0) ? 'No solution' : 'Exactly one solution';           // line 1's direction is parallel to line 2
      return q.answer === want;
    },
  });

  /* ---------- Unit 5: Geometry ---------- */
  const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];

  A.skill({
    id: 'math8.pythagorean-theorem', title: 'Pythagorean theorem and distance',
    learn: p(`In a right triangle the two shorter sides are the <b>legs</b> (${V('a')} and ${V('b')}) and the side opposite the right angle is the <b>hypotenuse</b> (${V('c')}), always the longest side. The <b>Pythagorean theorem</b>: <b>${S(V('a'), 2)} + ${S(V('b'), 2)} = ${S(V('c'), 2)}</b>.`) +
      p(`To find the hypotenuse, add the squares of the legs and take the square root. To find a missing leg, <b>subtract</b>: ${S(V('b'), 2)} = ${S(V('c'), 2)} − ${S(V('a'), 2)}. The distance between two points is a hypotenuse too: the horizontal and vertical gaps are the legs.`) +
      example('Example', `${big(`Distance from ${PT(1, 2)} to ${PT(7, 10)}`)}The legs are 7 − 1 = 6 and 10 − 2 = 8. ${S(6, 2)} + ${S(8, 2)} = 36 + 64 = 100, and ${M.sqrt(100)} = <b>10</b>.`),
    make(rng) {
      const kind = rng.pick(['hyp', 'leg', 'distance', 'ladder']);
      const t = rng.pick(TRIPLES), k = t[2] > 25 ? 1 : rng.int(1, t[2] > 13 ? 2 : 4);
      let [a, b, c] = t.map(v => v * k); if (rng.bool()) [a, b] = [b, a];
      if (kind === 'distance') {
        const x1 = rng.int(-9, 9), y1 = rng.int(-9, 9), sx = rng.sign(), sy = rng.sign();
        const [dx, dy] = t[2] > 13 ? [t[0] * sx, t[1] * sy] : [a * sx, b * sy], d = Math.sqrt(dx * dx + dy * dy);
        const x2 = x1 + dx, y2 = y1 + dy;
        return { prompt: `What is the distance between ${PT(x1, y1)} and ${PT(x2, y2)}?`, type: 'number', answer: d, unit: 'units', params: { kind, x1, y1, x2, y2 },
          hints: [`Make a right triangle: the horizontal leg is |${N(x2)} − ${wrap(x1)}| = ${Math.abs(dx)} and the vertical leg is |${N(y2)} − ${wrap(y1)}| = ${Math.abs(dy)}.`,
            `${S(Math.abs(dx), 2)} + ${S(Math.abs(dy), 2)} = ${dx * dx} + ${dy * dy} = ${dx * dx + dy * dy}.`, `${M.sqrt(dx * dx + dy * dy)} = <b>${N(d)}</b> units.`] };
      }
      if (kind === 'ladder') {
        const name = rng.pick(NAMES);
        if (a > b) [a, b] = [b, a];                                // the foot is the short leg, so the ladder stands up steeply
        return { prompt: `${name} leans a ${N(c)} ft ladder against a wall. The foot of the ladder is ${N(a)} ft from the wall. How high up the wall does the ladder reach?`, type: 'number', answer: b, unit: 'ft', params: { kind, a, b, c },
          hints: [`The ladder is the hypotenuse (${N(c)} ft); the ground and the wall are the legs.`, `${S(V('b'), 2)} = ${S(c, 2)} − ${S(a, 2)} = ${c * c} − ${a * a} = ${c * c - a * a}.`, `${M.sqrt(c * c - a * a)} = <b>${N(b)} ft</b>.`] };
      }
      if (kind === 'hyp') {
        return { prompt: `A right triangle has legs of ${N(a)} cm and ${N(b)} cm. How long is the hypotenuse?`, type: 'number', answer: c, unit: 'cm', params: { kind, a, b, c },
          hints: [`Use ${S(V('a'), 2)} + ${S(V('b'), 2)} = ${S(V('c'), 2)}: ${S(a, 2)} + ${S(b, 2)} = ${a * a} + ${b * b} = ${c * c}.`, `${S(V('c'), 2)} = ${c * c}, so ${V('c')} = ${M.sqrt(c * c)}.`, `The hypotenuse is <b>${N(c)} cm</b>.`] };
      }
      return { prompt: `A right triangle has a hypotenuse of ${N(c)} cm and one leg of ${N(a)} cm. How long is the other leg?`, type: 'number', answer: b, unit: 'cm', params: { kind, a, b, c },
        hints: [`The hypotenuse is the longest side, so subtract: ${S(V('b'), 2)} = ${S(c, 2)} − ${S(a, 2)}.`, `${c * c} − ${a * a} = ${c * c - a * a}.`, `${M.sqrt(c * c - a * a)} = <b>${N(b)} cm</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'distance') return Math.abs(Math.hypot(p.x2 - p.x1, p.y2 - p.y1) - q.answer) < 1e-9 && Number.isInteger(q.answer);
      const legs = p.kind === 'hyp' ? [p.a, p.b, q.answer] : [p.a, q.answer, p.c];
      return legs[0] * legs[0] + legs[1] * legs[1] === legs[2] * legs[2];
    },
  });

  A.skill({
    id: 'math8.volume', title: 'Volume of cylinders, cones, and spheres',
    learn: p(`Each of these solids has a formula built on the area of a circle, π${S(V('r'), 2)}. <b>Cylinder:</b> ${V('V')} = π${S(V('r'), 2)}${V('h')} (the circle's area times the height). <b>Cone:</b> ${V('V')} = ${F(1, 3)}π${S(V('r'), 2)}${V('h')}, exactly one third of the cylinder with the same base and height. <b>Sphere:</b> ${V('V')} = ${F(4, 3)}π${S(V('r'), 3)}.`) +
      p(`Watch for a <b>diameter</b>: the radius is half of it. Volume is measured in cubic units such as cm³. In these exercises use <b>3.14 for π</b> and round to two decimal places.`) +
      example('Example', `${big('A cone with radius 3 cm and height 5 cm')}${V('V')} = ${F(1, 3)} × 3.14 × ${S(3, 2)} × 5 = ${F(1, 3)} × 3.14 × 45 = <b>47.1 cm³</b>.`),
    make(rng) {
      const shape = rng.pick(['cylinder', 'cone', 'sphere']), useD = rng.chance(0.3);
      const r = rng.int(1, 9), h = rng.int(2, 15), d = 2 * r;
      const size = useD ? `diameter ${d} cm` : `radius ${r} cm`;
      const ans = M.round(shape === 'cylinder' ? 3.14 * r * r * h : shape === 'cone' ? 3.14 * r * r * h / 3 : 4 * 3.14 * r * r * r / 3, 2);
      const prompt = shape === 'sphere' ? `What is the volume of a sphere with ${size}?` : `What is the volume of a ${shape} with ${size} and height ${h} cm?`;
      const formula = shape === 'cylinder' ? `${V('V')} = π${S(V('r'), 2)}${V('h')}` : shape === 'cone' ? `${V('V')} = ${F(1, 3)}π${S(V('r'), 2)}${V('h')}` : `${V('V')} = ${F(4, 3)}π${S(V('r'), 3)}`;
      const sub = shape === 'cylinder' ? `3.14 × ${S(r, 2)} × ${h} = 3.14 × ${r * r * h}` : shape === 'cone' ? `${F(1, 3)} × 3.14 × ${S(r, 2)} × ${h} = 3.14 × ${r * r * h} ÷ 3` : `${F(4, 3)} × 3.14 × ${S(r, 3)} = 4 × 3.14 × ${r * r * r} ÷ 3`;
      const hints = [];
      if (useD) hints.push(`The radius is half the diameter: ${d} ÷ 2 = ${r} cm.`);
      hints.push(`Use ${formula} with π ≈ 3.14.`, `${sub}.`, `That is ${N(ans)}, so the volume is <b>${N(ans)} cm³</b> (rounded to two decimal places).`);
      return { prompt: `${prompt} Use 3.14 for π and round to two decimal places.`, type: 'number', answer: ans, unit: 'cm³', tolerance: 0.05, hints, params: { shape, r, h } };
    },
    verify(q) {
      const { shape, r, h } = q.params;
      const cyl = 3.14 * r * r * h;
      const v = shape === 'cylinder' ? cyl : shape === 'cone' ? cyl / 3 : (2 / 3) * (3.14 * r * r * (2 * r));   // a sphere is 2/3 of the cylinder around it
      return Math.abs(v - q.answer) < 0.006;
    },
  });

  A.skill({
    id: 'math8.triangle-angles', title: 'Angles in triangles',
    learn: p(`The three <b>interior angles</b> of any triangle add up to <b>180°</b>. So if you know two of them, subtract their sum from 180° to get the third.`) +
      p(`An <b>exterior angle</b> is formed by extending one side. It sits on a straight line with its neighboring interior angle, so the two add to 180°. That makes the exterior angle equal to the <b>sum of the two remote interior angles</b> (the two that are not next to it).`) +
      example('Example', `A triangle has angles 48° and 67°. The third is 180° − (48° + 67°) = 180° − 115° = <b>65°</b>. The exterior angle next to it is 48° + 67° = 115°.`),
    make(rng) {
      const kind = rng.pick(['third', 'third', 'exterior', 'remote', 'algebra']);
      let A1 = rng.int(25, 95), B1 = rng.int(20, 155 - A1); const C1 = 180 - A1 - B1;
      if (kind === 'third') return { prompt: `Two angles of a triangle measure ${M.deg(A1)} and ${M.deg(B1)}. What is the third angle?`, type: 'number', answer: C1, unit: '°', params: { kind, A1, B1 },
        hints: [`The angles of a triangle add to 180°.`, `${A1}° + ${B1}° = ${A1 + B1}°.`, `180° − ${A1 + B1}° = <b>${C1}°</b>.`] };
      if (kind === 'exterior') return { prompt: `In a triangle, two interior angles measure ${M.deg(A1)} and ${M.deg(B1)}. What is the exterior angle at the third vertex?`, type: 'number', answer: A1 + B1, unit: '°', params: { kind, A1, B1 },
        hints: [`The exterior angle equals the sum of the two remote interior angles — here, the two you are given.`, `(Check: the third interior angle is ${C1}°, and the exterior angle is 180° − ${C1}°.)`, `${A1}° + ${B1}° = <b>${A1 + B1}°</b>.`] };
      if (kind === 'remote') return { prompt: `An exterior angle of a triangle measures ${M.deg(A1 + B1)}. One of the two remote interior angles measures ${M.deg(A1)}. What is the other remote interior angle?`, type: 'number', answer: B1, unit: '°', params: { kind, A1, B1 },
        hints: [`The exterior angle equals the sum of the two remote interior angles: ${A1}° + ? = ${A1 + B1}°.`, `${A1 + B1}° − ${A1}° = <b>${B1}°</b>.`] };
      const k = rng.int(2, 4), xv = rng.int(10, Math.floor((180 - A1 - 5) / (k + 1))), extra = 180 - A1 - (k + 1) * xv;
      return { prompt: `The angles of a triangle are ${M.deg(A1)}, ${X}°, and (${k}${X} ${M.signed(extra)})°. What is the value of ${X}?`, type: 'number', answer: xv, params: { kind, A1, k, extra },
        hints: [`The angles add to 180°: ${A1} + ${X} + ${k}${X} ${M.signed(extra)} = 180.`, `Combine: ${k + 1}${X} + ${A1 + extra} = 180, so ${k + 1}${X} = ${180 - A1 - extra}.`, `${X} = ${180 - A1 - extra} ÷ ${k + 1} = <b>${xv}</b>.`] };
    },
    verify(q) {
      const p = q.params, a = q.answer;
      if (p.kind === 'third') return p.A1 + p.B1 + a === 180 && a > 0;
      if (p.kind === 'exterior') { const third = 180 - p.A1 - p.B1; return a + third === 180; }          // exterior + its neighbour make a straight line
      if (p.kind === 'remote') { const ext = p.A1 + p.B1, third = 180 - p.A1 - a; return third > 0 && third + ext === 180; }
      return p.A1 + a + (p.k * a + p.extra) === 180 && p.k * a + p.extra > 0;
    },
  });

  A.skill({
    id: 'math8.transformations', title: 'Translations, reflections, and rotations',
    learn: p(`A <b>translation</b> slides a point: “3 left and 2 up” sends ${PT('x', 'y').replace('x', X).replace('y', Y)} to (${X} − 3, ${Y} + 2). A <b>reflection over the ${X}-axis</b> flips the sign of ${Y}: (${X}, −${Y}). A <b>reflection over the ${Y}-axis</b> flips the sign of ${X}: (−${X}, ${Y}).`) +
      p(`Rotations about the origin: <b>90° counterclockwise</b> sends (${X}, ${Y}) to (−${Y}, ${X}); <b>90° clockwise</b> sends it to (${Y}, −${X}); <b>180°</b> sends it to (−${X}, −${Y}). Sketching the point on a grid is a quick way to check you turned the right way.`) +
      example('Example', `Rotate ${PT(4, 1)} by 90° counterclockwise about the origin. (${X}, ${Y}) → (−${Y}, ${X}) gives <b>${PT(-1, 4)}</b>.`),
    make(rng) {
      const x = rng.nz(-8, 8), y = rng.nz(-8, 8);
      const kind = rng.pick(['translate', 'reflect-x', 'reflect-y', 'rot90ccw', 'rot90cw', 'rot180']);
      const dx = rng.nz(-6, 6), dy = rng.nz(-6, 6);
      const img = { translate: [x + dx, y + dy], 'reflect-x': [x, -y], 'reflect-y': [-x, y], rot90ccw: [-y, x], rot90cw: [y, -x], rot180: [-x, -y] };
      const say = { translate: `translated ${Math.abs(dx)} unit${Math.abs(dx) > 1 ? 's' : ''} ${dx > 0 ? 'right' : 'left'} and ${Math.abs(dy)} unit${Math.abs(dy) > 1 ? 's' : ''} ${dy > 0 ? 'up' : 'down'}`, 'reflect-x': `reflected over the ${X}-axis`, 'reflect-y': `reflected over the ${Y}-axis`, rot90ccw: 'rotated 90° counterclockwise about the origin', rot90cw: 'rotated 90° clockwise about the origin', rot180: 'rotated 180° about the origin' }[kind];
      const rule = { translate: `(${X} ${M.signed(dx)}, ${Y} ${M.signed(dy)})`, 'reflect-x': `(${X}, −${Y})`, 'reflect-y': `(−${X}, ${Y})`, rot90ccw: `(−${Y}, ${X})`, rot90cw: `(${Y}, −${X})`, rot180: `(−${X}, −${Y})` }[kind];
      const answer = PT(...img[kind]);
      const wrong = kind === 'translate' ? [[x + dy, y + dx], [x - dx, y - dy], [x + dx, y - dy], [x - dx, y + dy]] : Object.keys(img).filter(k => k !== kind && k !== 'translate').map(k => img[k]).concat([[y, x]]);
      const choices = [answer].concat(distinct(answer, rng.shuffle(wrong).map(w => PT(...w)), 3));
      return { prompt: `The point ${PT(x, y)} is ${say}. What are the coordinates of its image?`, type: 'choice', choices, answer, params: { kind, x, y, dx, dy },
        hints: [`The rule for this transformation is (${X}, ${Y}) → ${rule}.`, `Here ${X} = ${N(x)} and ${Y} = ${N(y)}.`, `The image is <b>${answer}</b>.`] };
    },
    verify(q) {
      const { kind, x, y, dx, dy } = q.params, got = parsePt(q.answer); if (!got) return false;
      if (kind === 'translate') return got[0] - x === dx && got[1] - y === dy;
      if (kind === 'reflect-x' || kind === 'reflect-y') {                       // a reflection leaves the midpoint on the mirror line and the segment perpendicular to it
        const mx = (x + got[0]) / 2, my = (y + got[1]) / 2;
        return kind === 'reflect-x' ? my === 0 && got[0] === x : mx === 0 && got[1] === y;
      }
      const t = { rot90ccw: Math.PI / 2, rot90cw: -Math.PI / 2, rot180: Math.PI }[kind];   // rotate with cos and sin
      const rx = Math.round(x * Math.cos(t) - y * Math.sin(t)), ry = Math.round(x * Math.sin(t) + y * Math.cos(t));
      return got[0] === rx && got[1] === ry;
    },
  });

  /* ---------- Unit 6: Data and modelling ---------- */
  A.skill({
    id: 'math8.two-way-tables', title: 'Two-way tables',
    learn: p(`A <b>two-way table</b> sorts the same group of people by two questions at once: one along the rows, one along the columns. Each cell counts the people who fit both. The totals at the end of each row and column add up the cells, so a missing cell can be found by subtracting.`) +
      p(`A <b>row relative frequency</b> compares a cell with its row total: cell ÷ row total, written as a percent. It answers questions like “what percent of the 8th graders chose soccer?” Use the row total, not the grand total, as the bottom of the fraction.`) +
      example('Example', `40 students in 7th grade were asked; 30 of them have a pet. The row relative frequency is 30 ÷ 40 = 0.75 = <b>75%</b>.`),
    make(rng) {
      const set = rng.pick([
        { rows: ['7th grade', '8th grade'], cols: ['Has a pet', 'No pet'], who: 'students', q: (r, c) => `${c === 0 ? 'have a pet' : 'have no pet'}`, of: r => `${r} students` },
        { rows: ['Plays a sport', 'No sport'], cols: ['Plays music', 'No music'], who: 'students', q: (r, c) => `${c === 0 ? 'play music' : 'do not play music'}`, of: r => `students who ${r === 'Plays a sport' ? 'play a sport' : 'do not play a sport'}` },
        { rows: ['Walks to school', 'Rides to school'], cols: ['Eats breakfast', 'Skips breakfast'], who: 'students', q: (r, c) => `${c === 0 ? 'eat breakfast' : 'skip breakfast'}`, of: r => `students who ${r === 'Walks to school' ? 'walk' : 'ride'} to school` },
      ]);
      const totals = [rng.pick([20, 25, 40, 50]), rng.pick([20, 25, 40, 50])];
      const cell = totals.map(t => { const step = 100 / t; return t * rng.pick([20, 30, 40, 60, 70, 80, 25, 75].filter(pc => (pc / step) % 1 === 0)) / 100; });
      const grid = [[cell[0], totals[0] - cell[0]], [cell[1], totals[1] - cell[1]]];
      const colT = [grid[0][0] + grid[1][0], grid[0][1] + grid[1][1]], all = totals[0] + totals[1];
      const kind = rng.pick(['missing', 'pct', 'pct']);
      const r = rng.int(0, 1), c = rng.int(0, 1);
      const shownGrid = grid.map((row, i) => row.map((v, j) => (kind === 'missing' && i === r && j === c) ? '?' : N(v)));
      const table = M.table(['', set.cols[0], set.cols[1], 'Total'], [[`<b>${set.rows[0]}</b>`, ...shownGrid[0], N(totals[0])], [`<b>${set.rows[1]}</b>`, ...shownGrid[1], N(totals[1])], ['<b>Total</b>', N(colT[0]), N(colT[1]), N(all)]]);
      if (kind === 'missing') {
        const other = grid[r][1 - c];
        return { prompt: `A survey of ${all} students. What number belongs in the cell marked “?”${table}`, type: 'number', answer: grid[r][c], params: { kind, grid, r, c, totals },
          hints: [`Use the row total for “${set.rows[r]}”: the two cells in that row add to ${N(totals[r])}.`, `The other cell in the row is ${N(other)}, so ? = ${N(totals[r])} − ${N(other)}.`, `? = <b>${N(grid[r][c])}</b>. (Check with the column total: ${N(colT[c])} − ${N(grid[1 - r][c])} = ${N(grid[r][c])}.)`] };
      }
      const pc = M.round(grid[r][c] / totals[r] * 100, 4);
      return { prompt: `A survey of ${all} students. What percent of the ${set.of(set.rows[r])} ${set.q(r, c)}?${table}`, type: 'number', answer: pc, unit: '%', params: { kind, grid, r, c, totals },
        hints: [`This is a row relative frequency: use the “${set.rows[r]}” row only.`, `The cell is ${N(grid[r][c])} and the row total is ${N(totals[r])}: ${N(grid[r][c])} ÷ ${N(totals[r])} = ${N(pc / 100)}.`, `${N(pc / 100)} × 100 = <b>${N(pc)}%</b>.`] };
    },
    verify(q) {
      const { kind, grid, r, c, totals } = q.params;
      if (grid[r][0] + grid[r][1] !== totals[r]) return false;
      if (kind === 'missing') return q.answer === grid[r][c] && q.answer >= 0;
      return Math.abs(q.answer * totals[r] - 100 * grid[r][c]) < 1e-6;          // cross-multiply instead of dividing
    },
  });

  /** an inline SVG scatter plot of points in 0–10 × 0–10 */
  function scatterSvg(pts, xl, yl) {
    const X0 = 40, Y0 = 170, s = 15;
    const grid = [0, 2, 4, 6, 8, 10].map(v => `<line class="light" x1="${X0 + v * s}" y1="${Y0}" x2="${X0 + v * s}" y2="${Y0 - 150}"/><line class="light" x1="${X0}" y1="${Y0 - v * s}" x2="${X0 + 150}" y2="${Y0 - v * s}"/>`).join('');
    const dots = pts.map(([x, y]) => `<circle cx="${X0 + x * s}" cy="${Y0 - y * s}" r="4" class="fill"/>`).join('');
    return `<svg class="figure" viewBox="0 0 210 210" width="260" role="img" aria-label="Scatter plot of ${M.esc(yl)} against ${M.esc(xl)}">${grid}<line class="stroke" x1="${X0}" y1="${Y0}" x2="${X0 + 155}" y2="${Y0}"/><line class="stroke" x1="${X0}" y1="${Y0}" x2="${X0}" y2="${Y0 - 155}"/>${dots}<text x="${X0 + 75}" y="198" text-anchor="middle" font-size="12">${M.esc(xl)}</text><text x="14" y="${Y0 - 75}" text-anchor="middle" font-size="12" transform="rotate(-90 14 ${Y0 - 75})">${M.esc(yl)}</text></svg>`;
  }
  const corr = pts => {
    const n = pts.length, mx = pts.reduce((a, p) => a + p[0], 0) / n, my = pts.reduce((a, p) => a + p[1], 0) / n;
    let sxy = 0, sxx = 0, syy = 0; pts.forEach(([x, y]) => { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; });
    return sxy / Math.sqrt(sxx * syy);
  };

  /** share of pairs of dots that rise minus share that fall (Kendall's tau) */
  const kendall = pts => {
    let up = 0, down = 0;
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) { const s = (pts[j][0] - pts[i][0]) * (pts[j][1] - pts[i][1]); if (s > 0) up++; else if (s < 0) down++; }
    return (up - down) / (pts.length * (pts.length - 1) / 2);
  };

  A.skill({
    id: 'math8.scatter-plots', title: 'Describing scatter plots',
    learn: p(`A <b>scatter plot</b> shows pairs of measurements as dots, one dot per person or thing. Read it from left to right. If the dots tend to <b>rise</b>, the two quantities have a <b>positive association</b>: as one goes up, the other tends to go up. If they tend to <b>fall</b>, it is a <b>negative association</b>.`) +
      p(`If the dots form a shapeless cloud with no upward or downward drift, there is <b>no association</b>. When the dots hug a straight line the association is <b>linear</b>; the closer they hug it, the stronger it is. An association is a tendency, not a rule for every single dot.`) +
      example('Example', `Hours spent practicing piano each week against mistakes made in a recital: more practice, fewer mistakes. The dots fall from left to right, a <b>negative association</b>.`),
    make(rng) {
      const kind = rng.pick(['positive', 'negative', 'none']);
      const ctx = rng.pick([
        { xl: 'Hours of study', yl: 'Test score', pos: true },
        { xl: 'Hours of practice', yl: 'Mistakes', pos: false },
        { xl: 'Height', yl: 'Shoe size', pos: true },
        { xl: 'Phone age (years)', yl: 'Battery life', pos: false },
        { xl: 'Temperature', yl: 'Ice creams sold', pos: true },
        { xl: 'Age of tree', yl: 'Trunk width', pos: true },
        { xl: 'Ticket price', yl: 'Tickets sold', pos: false },
        { xl: 'Screen time', yl: 'Hours of sleep', pos: false },
        { xl: 'Day of the month', yl: 'Rainfall', pos: null },
        { xl: 'Shoe size', yl: 'Test score', pos: null },
        { xl: 'House number', yl: 'Number of pets', pos: null },
        { xl: 'Birth month', yl: 'Height', pos: null },
      ].filter(c => kind === 'none' ? c.pos === null : c.pos === (kind === 'positive')));
      let pts, r, tries = 0;
      do {
        const xs = rng.sample([0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5], 10);
        const b = kind === 'negative' ? rng.int(8, 9) : rng.int(1, 2), m = kind === 'positive' ? rng.dec(0.6, 0.8, 2) : kind === 'negative' ? -rng.dec(0.6, 0.8, 2) : 0;
        pts = xs.map(x => [x, Math.min(9.8, Math.max(0.2, kind === 'none' ? rng.dec(1, 9, 1) : M.round(b + m * x + rng.dec(-1.2, 1.2, 1), 1)))]);
        r = corr(pts); tries++;
      } while ((kind === 'none' ? Math.abs(r) > 0.2 || Math.abs(kendall(pts)) > 0.2 : Math.abs(r) < 0.75 || Math.abs(kendall(pts)) < 0.5) && tries < 200);
      const choices = ['Positive association', 'Negative association', 'No association'];
      const answer = { positive: choices[0], negative: choices[1], none: choices[2] }[kind];
      const hints = [`Read the dots from left to right, as ${ctx.xl.toLowerCase()} increases.`,
        kind === 'none' ? `The dots are scattered all over, with no upward or downward drift.` : `The dots tend to ${kind === 'positive' ? 'rise' : 'fall'}: larger values of ${ctx.xl.toLowerCase()} go with ${kind === 'positive' ? 'larger' : 'smaller'} values of ${ctx.yl.toLowerCase()}.`,
        `<b>${answer}</b>.`];
      return { prompt: `The scatter plot shows ${ctx.yl.toLowerCase()} against ${ctx.xl.toLowerCase()}. What kind of association does it show?${scatterSvg(pts, ctx.xl, ctx.yl)}`, type: 'choice', choices, answer, keepOrder: true, hints, params: { pts } };
    },
    verify(q) {
      const tau = kendall(q.params.pts);                         // rising vs falling pairs of dots, read straight from the points
      const want = tau > 0.4 ? 'Positive association' : tau < -0.4 ? 'Negative association' : Math.abs(tau) < 0.3 ? 'No association' : 'unclear';
      return q.answer === want || ('unclear: tau ' + tau.toFixed(2));
    },
  });

  /* ---------- Unit 7: Reading and graphing lines ---------- */
  const r2 = v => Math.round(v * 100) / 100;
  const LETTERS = ['A', 'B', 'C', 'D', 'E'];
  /** the x-term of y = mx + b for a slope mn/md: "2x", "−x", or a stacked fraction times x */
  const slopeX = (mn, md) => { [mn, md] = M.simp(mn, md); return md === 1 ? M.term(mn, 'x') : `${mn < 0 ? '−' : ''}${F(Math.abs(mn), md)}${X}`; };
  const lineF = (mn, md, b) => `${Y} = ${slopeX(mn, md)}${b ? ' ' + M.signed(b) : ''}`;
  /** the slope mn/md on its own: "3", "−2", or a stacked fraction */
  const slopeH = (mn, md) => { [mn, md] = M.simp(mn, md); return md === 1 ? N(mn) : `${mn < 0 ? '−' : ''}${F(Math.abs(mn), md)}`; };

  /** a coordinate grid from −R to R, one square per unit. Lines are [mn, md, b, id] (slope mn/md); each carries
      data-g="id" so verify() can read the drawing back. */
  function coordSvg(o) {
    const R = o.R || 5, S = o.S || 14, pad = 8, W = 2 * R * S + 2 * pad;
    const px = x => r2(pad + (x + R) * S), py = y => r2(pad + (R - y) * S);
    let g = '';
    for (let k = -R; k <= R; k++) if (k) g += `<line class="light" x1="${px(k)}" y1="${py(-R)}" x2="${px(k)}" y2="${py(R)}"/><line class="light" x1="${px(-R)}" y1="${py(k)}" x2="${px(R)}" y2="${py(k)}"/>`;
    g += `<line class="stroke" x1="${px(-R)}" y1="${py(0)}" x2="${px(R)}" y2="${py(0)}" stroke-width="1.5"/><line class="stroke" x1="${px(0)}" y1="${py(-R)}" x2="${px(0)}" y2="${py(R)}" stroke-width="1.5"/>`;
    g += `<text x="${px(R) - 9}" y="${py(0) - 5}" font-size="12" font-style="italic">x</text><text x="${px(0) + 5}" y="${py(R) + 11}" font-size="12" font-style="italic">y</text>`;
    (o.lines || []).forEach(([mn, md, b, id]) => {
      const m = mn / md, a1 = (-R - b) / m, a2 = (R - b) / m;             // where the line leaves the top and bottom of the grid
      const lo = Math.max(-R, Math.min(a1, a2)), hi = Math.min(R, Math.max(a1, a2));
      g += `<line data-g="${id}" x1="${px(lo)}" y1="${py(m * lo + b)}" x2="${px(hi)}" y2="${py(m * hi + b)}" stroke="var(--primary)" stroke-width="2.5"/>`;
    });
    (o.dots || []).forEach(([x, y]) => { g += `<circle cx="${px(x)}" cy="${py(y)}" r="4" fill="var(--ink)"/>`; });
    return `<svg class="figure" viewBox="0 0 ${W} ${W}" width="${W}" height="${W}" role="img" aria-label="${o.label || 'a line on a coordinate grid'}">${g}</svg>`;
  }
  /** read line `id` back out of the drawing, as its two end points in grid units */
  function readLine(html, id, R, S) {
    const pad = 8, mm = String(html).match(new RegExp(`<line data-g="${id}" x1="([-\\d.]+)" y1="([-\\d.]+)" x2="([-\\d.]+)" y2="([-\\d.]+)"`));
    if (!mm) return null;
    const ux = v => (Number(v) - pad) / S - R, uy = v => R - (Number(v) - pad) / S;
    return [[ux(mm[1]), uy(mm[2])], [ux(mm[3]), uy(mm[4])]];
  }
  /** does the drawn line `id` lie on y = (mn/md)x + b? (both of its end points must fit) */
  const drawnFits = (html, id, R, S, mn, md, b) => { const e = readLine(html, id, R, S); return !!e && e.every(([x, y]) => Math.abs(mn / md * x + b - y) < 0.03); };

  /** a first-quadrant graph with numbered axes. o: { xmax, xstep, ymax, ystep, xl, yl, path, dots, line: [m, b], marks: [[x, y, text]] } */
  function plotSvg(o) {
    const L = 58, T = 12, W = 236, H = 176;
    const px = x => r2(L + x / o.xmax * W), py = y => r2(T + H - y / o.ymax * H);
    let g = '';
    for (let i = 0; i * o.xstep <= o.xmax + 1e-9; i++) { const x = M.round(i * o.xstep, 6); g += `<line class="light" x1="${px(x)}" y1="${T}" x2="${px(x)}" y2="${T + H}"/><text x="${px(x)}" y="${T + H + 15}" text-anchor="middle" font-size="11">${N(x)}</text>`; }
    for (let i = 0; i * o.ystep <= o.ymax + 1e-9; i++) { const y = M.round(i * o.ystep, 6); g += `<line class="light" x1="${L}" y1="${py(y)}" x2="${L + W}" y2="${py(y)}"/><text x="${L - 6}" y="${py(y) + 4}" text-anchor="end" font-size="11">${N(y)}</text>`; }
    g += `<line class="stroke" x1="${L}" y1="${T + H}" x2="${L + W}" y2="${T + H}" stroke-width="1.5"/><line class="stroke" x1="${L}" y1="${T}" x2="${L}" y2="${T + H}" stroke-width="1.5"/>`;
    g += `<text x="${L + W / 2}" y="${T + H + 34}" text-anchor="middle" font-size="12">${M.esc(o.xl)}</text><text x="14" y="${T + H / 2}" text-anchor="middle" font-size="12" transform="rotate(-90 14 ${T + H / 2})">${M.esc(o.yl)}</text>`;
    if (o.path) g += `<polyline points="${o.path.map(([x, y]) => `${px(x)},${py(y)}`).join(' ')}" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linejoin="round"/>`;
    if (o.line) {
      const [m, b] = o.line;                                           // clip y = mx + b to the plotting area
      let lo = 0, hi = o.xmax;
      if (m !== 0) { const a1 = (0 - b) / m, a2 = (o.ymax - b) / m; lo = Math.max(lo, Math.min(a1, a2)); hi = Math.min(hi, Math.max(a1, a2)); }
      g += `<line x1="${px(lo)}" y1="${py(m * lo + b)}" x2="${px(hi)}" y2="${py(m * hi + b)}" stroke="var(--warn)" stroke-width="2.5"/>`;
    }
    (o.dots || []).forEach(([x, y]) => { g += `<circle cx="${px(x)}" cy="${py(y)}" r="3.5" class="fill"/>`; });
    (o.marks || []).forEach(([x, y, t]) => {                          // label each mark on the side away from the line, with a halo over the dots
      const right = x > o.xmax / 2, room = py(y) + 18 < T + H - 4 && py(y) - 9 > T + 12;
      const above = room ? !!o.line && (o.line[0] > 0) === right : py(y) + 18 >= T + H - 4;
      g += `<circle cx="${px(x)}" cy="${py(y)}" r="4.5" fill="var(--ink)"/><text x="${px(x) + (right ? -8 : 8)}" y="${py(y) + (above ? -9 : 18)}" text-anchor="${right ? 'end' : 'start'}" font-size="12" font-weight="700" paint-order="stroke" stroke="var(--surface)" stroke-width="4" stroke-linejoin="round">${t}</text>`;
    });
    return `<svg class="figure" viewBox="0 0 ${L + W + 16} ${T + H + 42}" width="${L + W + 16}" role="img" aria-label="${M.esc(o.label || `graph of ${o.yl} against ${o.xl}`)}">${g}</svg>`;
  }

  /** a graph with titled axes but no numbers: labelled points; each dot carries data-p="A" so verify() can read it */
  function pointsSvg(pts, xl, yl) {
    const X0 = 44, Y0 = 186, s = 17;
    let g = '';
    for (let k = 1; k <= 10; k++) g += `<line class="light" x1="${X0 + k * s}" y1="${Y0}" x2="${X0 + k * s}" y2="${Y0 - 10 * s}"/><line class="light" x1="${X0}" y1="${Y0 - k * s}" x2="${X0 + 10 * s}" y2="${Y0 - k * s}"/>`;
    g += `<line class="stroke" x1="${X0}" y1="${Y0}" x2="${X0 + 10 * s + 8}" y2="${Y0}"/><line class="stroke" x1="${X0}" y1="${Y0}" x2="${X0}" y2="${Y0 - 10 * s - 8}"/>`;
    g += `<path d="M${X0 + 10 * s + 14} ${Y0} l-9 -5 v10 z" fill="currentColor"/><path d="M${X0} ${Y0 - 10 * s - 14} l-5 9 h10 z" fill="currentColor"/>`;
    pts.forEach(([x, y, lab]) => { g += `<circle data-p="${lab}" cx="${X0 + x * s}" cy="${Y0 - y * s}" r="4.5" fill="var(--primary)"/><text x="${X0 + x * s + 7}" y="${Y0 - y * s - 6}" font-size="13" font-weight="700">${lab}</text>`; });
    g += `<text x="${X0 + 5 * s}" y="${Y0 + 22}" text-anchor="middle" font-size="13">${M.esc(xl)}</text><text x="18" y="${Y0 - 5 * s}" text-anchor="middle" font-size="13" transform="rotate(-90 18 ${Y0 - 5 * s})">${M.esc(yl)}</text>`;
    return `<svg class="figure" viewBox="0 0 240 216" width="250" role="img" aria-label="${M.esc(`graph of ${yl} against ${xl} with labeled points`)}">${g}</svg>`;
  }
  /** the dots of a pointsSvg drawing, read back as { A: [x, y], … } in grid units */
  const readPoints = html => { const out = {}; String(html).replace(/<circle data-p="(\w)" cx="([\d.]+)" cy="([\d.]+)"/g, (_, l, cx, cy) => { out[l] = [(Number(cx) - 44) / 17, (186 - Number(cy)) / 17]; }); return out; };

  const GRAPH_CTX = [
    { who: 'person', rel: 'who', xl: 'Age', yl: 'Height', most: ['oldest', 'tallest'], least: ['youngest', 'shortest'], more: ['older', 'taller'], less: ['younger', 'shorter'] },
    { who: 'tree', rel: 'that', xl: 'Age', yl: 'Height', most: ['oldest', 'tallest'], least: ['youngest', 'shortest'], more: ['older', 'taller'], less: ['younger', 'shorter'] },
    { who: 'bag of rice', rel: 'that', xl: 'Weight', yl: 'Price', most: ['heaviest', 'most expensive'], least: ['lightest', 'cheapest'], more: ['heavier', 'more expensive'], less: ['lighter', 'cheaper'] },
    { who: 'car', rel: 'that', xl: 'Age of car', yl: 'Top speed', most: ['oldest', 'fastest'], least: ['newest', 'slowest'], more: ['older', 'faster'], less: ['newer', 'slower'] },
    { who: 'house', rel: 'that', xl: 'Size', yl: 'Price', most: ['largest', 'most expensive'], least: ['smallest', 'cheapest'], more: ['larger', 'more expensive'], less: ['smaller', 'cheaper'] },
    { who: 'dog', rel: 'that', xl: 'Weight', yl: 'Age', most: ['heaviest', 'oldest'], least: ['lightest', 'youngest'], more: ['heavier', 'older'], less: ['lighter', 'younger'] },
  ];

  /** distance from home at time t, read off the corners of a walk by straight-line interpolation */
  const distAt = (verts, t) => { for (let i = 1; i < verts.length; i++) { const [t0, d0] = verts[i - 1], [t1, d1] = verts[i]; if (t >= t0 && t <= t1) return d0 + (d1 - d0) * (t - t0) / (t1 - t0); } return NaN; };
  const WALK = ['Moving away from home', 'Standing still', 'Moving back toward home'];

  A.skill({
    id: 'math8.interpret-graphs', title: 'Interpreting graphs',
    learn: p(`Before reading any point on a graph, read the <b>axes</b>: what each one measures and which way is “more”. <b>Further right means more of the horizontal quantity; higher up means more of the vertical quantity.</b> A point is one thing (a person, a bag, a moment in time) described by both quantities at once.`) +
      p(`To compare two points, compare their positions: a point to the right of and below another has more of the horizontal quantity but less of the vertical one. On a graph of <b>distance from home against time</b>, the steepness tells the story: going up means moving away, a flat part means standing still, going down means coming back, and a steeper part means moving faster.`) +
      example('Example', `On a graph of height against age, point C is furthest to the right and point A is highest. So C is the <b>oldest</b> person and A is the <b>tallest</b>. If B is to the right of A and lower, then B is older and shorter than A.`),
    make(rng) {
      const kind = rng.pick(['points', 'points', 'points', 'walk', 'walk']);
      return kind === 'points' ? graphPoints(rng) : graphWalk(rng);
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'points') {
        const pts = readPoints(q.prompt), labs = Object.keys(pts);
        if (labs.length !== 5) return 'expected five dots';
        let want;
        if (p.ask === 'extreme') want = labs.slice().sort((u, v) => p.sign * (pts[v][p.axis] - pts[u][p.axis]))[0];   // sort, take the end
        else { const R = pts[p.ref]; const hits = labs.filter(l => l !== p.ref && Math.sign(pts[l][0] - R[0]) === p.sx && Math.sign(pts[l][1] - R[1]) === p.sy); if (hits.length !== 1) return 'not exactly one match'; want = hits[0]; }
        return q.answer === `Point ${want}`;
      }
      const { verts } = p;
      if (p.ask === 'read') return Math.abs(distAt(verts, p.t) - q.answer) < 1e-9;
      if (p.ask === 'segment') {
        if (verts.some(([t]) => t > p.t0 && t < p.t1)) return 'interval spans a corner';
        const d = distAt(verts, p.t1) - distAt(verts, p.t0);
        return q.answer === (d > 0 ? WALK[0] : d < 0 ? WALK[2] : WALK[1]);
      }
      const speed = c => { const mm = c.match(/^From (\d+) to (\d+) minutes$/); const t0 = Number(mm[1]), t1 = Number(mm[2]); return Math.abs(distAt(verts, t1) - distAt(verts, t0)) / (t1 - t0); };
      const sp = q.choices.map(speed), best = Math.max(...sp);
      return sp.filter(v => v === best).length === 1 && speed(q.answer) === best;
    },
  });
  function graphPoints(rng) {
    const c = rng.pick(GRAPH_CTX);
    let pts, tries = 0;
    do {                                                   // five points, no two in the same column or row, none touching
      const xs = rng.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 5), ys = rng.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 5);
      pts = xs.map((x, i) => [x, ys[i], LETTERS[i]]);
      tries++;
    } while (tries < 100 && pts.some((a, i) => pts.some((b, j) => j > i && Math.abs(a[0] - b[0]) <= 1 && Math.abs(a[1] - b[1]) <= 1)));
    const choices = LETTERS.map(l => `Point ${l}`);
    const intro = `The graph compares the ${c.xl.toLowerCase()} and the ${c.yl.toLowerCase()} of five ${c.who === 'person' ? 'people' : c.who === 'bag of rice' ? 'bags of rice' : c.who + 's'}.`;
    const axesHint = `Read the axes first. The horizontal axis shows ${c.xl.toLowerCase()}: further right means ${c.more[0]}. The vertical axis shows ${c.yl.toLowerCase()}: higher up means ${c.more[1]}.`;
    // a two-condition question when some point has exactly one other point in one of its corners
    const opts = [];
    pts.forEach((P) => [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sy]) => {
      const hits = pts.filter(Q => Q !== P && Math.sign(Q[0] - P[0]) === sx && Math.sign(Q[1] - P[1]) === sy);
      if (hits.length === 1) opts.push({ P, sx, sy, Q: hits[0] });
    }));
    if (opts.length && rng.chance(0.45)) {
      const { P, sx, sy, Q } = rng.pick(opts);
      const wx = sx > 0 ? c.more[0] : c.less[0], wy = sy > 0 ? c.more[1] : c.less[1];
      const answer = `Point ${Q[2]}`;
      return { prompt: `${intro} Which point shows a ${c.who} ${c.rel} is ${wx} and ${wy} than the ${c.who} at point ${P[2]}?${pointsSvg(pts, c.xl, c.yl)}`, type: 'choice', choices, answer, keepOrder: true,
        params: { kind: 'points', ask: 'corner', ref: P[2], sx, sy },
        hints: [axesHint, `${M.esc(wx[0].toUpperCase() + wx.slice(1))} than ${P[2]} means to the ${sx > 0 ? 'right' : 'left'} of ${P[2]}; ${wy} means ${sy > 0 ? 'above' : 'below'} ${P[2]}. Look in that corner of the graph, measured from point ${P[2]}.`,
          `Only one point is both to the ${sx > 0 ? 'right' : 'left'} of and ${sy > 0 ? 'above' : 'below'} ${P[2]}: <b>${answer}</b>.`] };
    }
    const axis = rng.int(0, 1), sign = rng.pick([1, -1]);
    const pick = pts.slice().sort((a, b) => sign * (b[axis] - a[axis]))[0];
    const word = (sign > 0 ? c.most : c.least)[axis];
    const answer = `Point ${pick[2]}`;
    const where = axis === 0 ? (sign > 0 ? 'the point furthest to the right' : 'the point furthest to the left') : (sign > 0 ? 'the highest point' : 'the lowest point');
    return { prompt: `${intro} Which point shows the ${word} ${c.who}?${pointsSvg(pts, c.xl, c.yl)}`, type: 'choice', choices, answer, keepOrder: true,
      params: { kind: 'points', ask: 'extreme', axis, sign },
      hints: [axesHint, `“${word[0].toUpperCase() + word.slice(1)}” is about ${(axis === 0 ? c.xl : c.yl).toLowerCase()}, the ${axis === 0 ? 'horizontal' : 'vertical'} axis, so look for ${where}. The other axis does not matter here.`,
        `${where[0].toUpperCase() + where.slice(1)} is <b>${answer}</b>.`] };
  }
  function graphWalk(rng) {
    const name = rng.pick(NAMES), n = rng.int(3, 4);
    const verts = [[0, 0]], types = [];
    let t = 0, d = 0;
    for (let i = 0; i < n; i++) {
      const allowed = ['away', 'stop', 'back'].filter(k => k !== types[i - 1] && !(k === 'back' && d === 0) && !(k === 'away' && d >= 1200) && !(i === 0 && k !== 'away'));
      const type = rng.pick(allowed);
      if (type === 'away') d = Math.min(1200, d + 200 * rng.int(1, 3));
      if (type === 'back') d = Math.max(0, d - 200 * rng.int(1, 3));
      t += rng.pick([5, 10, 10]); verts.push([t, d]); types.push(type);
    }
    const xmax = Math.max(20, Math.ceil(t / 10) * 10);
    const graph = plotSvg({ xmax, xstep: 5, ymax: 1200, ystep: 200, xl: 'Time (minutes)', yl: 'Distance from home (m)', path: verts, label: `${name}'s distance from home over time` });
    const intro = `The graph shows ${name}'s distance from home during a walk.`;
    const segs = types.map((ty, i) => ({ ty, t0: verts[i][0], t1: verts[i + 1][0], d0: verts[i][1], d1: verts[i + 1][1] }));
    const moving = segs.filter(s => s.ty !== 'stop').map(s => ({ s, v: Math.abs(s.d1 - s.d0) / (s.t1 - s.t0) })).sort((a, b) => b.v - a.v);
    const ask = rng.pick(['segment', 'segment', 'read', 'fastest']);
    if (ask === 'fastest' && moving.length >= 2 && moving[0].v >= 1.5 * moving[1].v) {
      const choices = segs.map(s => `From ${s.t0} to ${s.t1} minutes`), f = moving[0].s;
      const answer = `From ${f.t0} to ${f.t1} minutes`;
      return { prompt: `${intro} During which part of the walk was ${name} moving fastest?${graph}`, type: 'choice', choices, answer, keepOrder: true, params: { kind: 'walk', ask, verts },
        hints: [`Moving fast means covering a lot of distance in a short time, so look for the <b>steepest</b> part of the graph, whether it goes up or down. A flat part means not moving at all.`,
          `From ${f.t0} to ${f.t1} minutes ${name} covers ${N(Math.abs(f.d1 - f.d0))} m in ${f.t1 - f.t0} minutes, ${N(moving[0].v)} m per minute. No other part is that steep.`,
          `<b>${answer}</b>.`] };
    }
    if (ask === 'read') {
      const k = rng.int(1, n), [tk, dk] = verts[k];
      return { prompt: `${intro} How far from home was ${name} after ${tk} minutes?${graph}`, type: 'number', answer: dk, unit: 'm', params: { kind: 'walk', ask, verts, t: tk },
        hints: [`Find ${tk} minutes on the horizontal (time) axis and go straight up to the graph.`, `From that point, go across to the vertical axis, which shows the distance from home in meters.`, `The graph is at <b>${N(dk)} m</b> after ${tk} minutes.`] };
    }
    const s = rng.pick(segs);
    const answer = s.ty === 'away' ? WALK[0] : s.ty === 'stop' ? WALK[1] : WALK[2];
    return { prompt: `${intro} What was ${name} doing between ${s.t0} and ${s.t1} minutes?${graph}`, type: 'choice', choices: WALK.slice(), answer, keepOrder: true, params: { kind: 'walk', ask: 'segment', verts, t0: s.t0, t1: s.t1 },
      hints: [`The vertical axis is distance <b>from home</b>. Look at whether the graph goes up, stays flat, or goes down between ${s.t0} and ${s.t1} minutes.`,
        `The distance goes from ${N(s.d0)} m to ${N(s.d1)} m: it ${s.ty === 'away' ? 'grows, so the distance from home is increasing' : s.ty === 'stop' ? 'does not change, so time passes but the distance stays the same' : 'shrinks, so the distance from home is decreasing'}.`,
        `<b>${answer}</b>.`] };
  }

  A.skill({
    id: 'math8.point-on-line', title: 'Points on a line',
    learn: p(`Every point on the graph of a rule is a <b>solution</b> of the rule: its coordinates make the equation true. So to test whether a point lies on the line ${eqn(2, 1)}, <b>substitute its ${X}-value into the rule and check that you get its ${Y}-value</b>.`) +
      p(`For ${PT(3, 7)}: 2(3) + 1 = 7, which matches, so ${PT(3, 7)} is on the line. For ${PT(7, 3)}: 2(7) + 1 = 15, not 3, so it is not. Keep the order straight: the first number is always ${X}.`) +
      p(`The same idea finds a missing coordinate. If ${PT(4, V('k'))} is on the line, then ${V('k')} = 2(4) + 1 = 9. If it is the ${Y}-value you know, put it in for ${Y} and solve for ${X}.`) +
      example('Example', `${big(`Is ${PT(-2, 5)} on the line ${eqn(-3, -1)}?`)}Substitute ${X} = −2: −3(−2) − 1 = 6 − 1 = 5. That is the point's ${Y}-value, so <b>yes</b>, it is on the line.`),
    make(rng) {
      const kind = rng.pick(['which', 'which', 'find-y', 'find-x']);
      const m = rng.nz(-5, 5), b = rng.int(-9, 9), rule = eqn(m, b);
      const x = rng.int(-6, 7), y = m * x + b;
      if (kind === 'find-y') {
        return { prompt: `The point ${PT(x, V('k'))} lies on the line ${rule}. What is the value of ${V('k')}?`, type: 'number', answer: y, params: { kind, m, b, x },
          hints: [`A point on the line makes the rule true, so put its ${X}-value, ${N(x)}, into the rule.`, `${Y} = ${N(m)} × ${wrap(x)} ${M.signed(b)} = ${N(m * x)} ${M.signed(b)}.`, `${V('k')} = <b>${N(y)}</b>.`] };
      }
      if (kind === 'find-x') {
        return { prompt: `The point ${PT(V('k'), y)} lies on the line ${rule}. What is the value of ${V('k')}?`, type: 'number', answer: x, params: { kind, m, b, y },
          hints: [`This time the ${Y}-value is known. Put ${Y} = ${N(y)} into the rule: ${N(y)} = ${M.poly([m, b])}.`,
            b ? `${b > 0 ? `Subtract ${N(b)} from` : `Add ${N(-b)} to`} both sides: ${N(y - b)} = ${M.term(m, 'x')}.` : `There is no number to move: ${N(y)} = ${M.term(m, 'x')}.`,
            `Divide by ${N(m)}: ${X} = ${N(y - b)} ÷ ${wrap(m)}, so ${V('k')} = <b>${N(x)}</b>.`] };
      }
      const on = ([u, v]) => m * u + b === v;
      const cands = rng.shuffle([[y, x], [-x, y], [x, -y], [x + 1, y], [x, y + 1], [x, y - m], [x - 1, y + m]]).filter(c => !on(c));
      const answer = PT(x, y), wrongs = distinct(answer, cands.map(c => PT(...c)), 3);
      const w = parsePt(wrongs[0]);
      return { prompt: `Which point lies on the line ${rule}?`, type: 'choice', choices: [answer].concat(wrongs), answer, params: { kind, m, b },
        hints: [`For each point, substitute its ${X}-value into the rule and see whether you get its ${Y}-value.`,
          `For ${wrongs[0]}: ${N(m)} × ${wrap(w[0])} ${M.signed(b)} = ${N(m * w[0] + b)}, not ${N(w[1])}, so that point is not on the line.`,
          `For ${answer}: ${N(m)} × ${wrap(x)} ${M.signed(b)} = ${N(y)}, which matches. <b>${answer}</b> is on the line.`] };
    },
    verify(q) {
      const { kind, m, b } = q.params;
      if (kind === 'find-y') { const { x } = q.params; return (q.answer - b) / m === x; }        // walk back from y to x
      if (kind === 'find-x') { const { y } = q.params; return m * q.answer + b === y; }
      const hits = q.choices.filter(c => { const pt = parsePt(c); return pt && pt[1] - b === m * pt[0]; });
      return hits.length === 1 && hits[0] === q.answer;
    },
  });

  const SLOPES = [[1, 1], [2, 1], [3, 1], [-1, 1], [-2, 1], [-3, 1], [1, 2], [-1, 2], [1, 3], [-1, 3], [2, 3], [-2, 3], [3, 2], [-3, 2]];
  /** wrong lines for y = (mn/md)x + b that come from real slips: sign of the slope, sign of b, rise and run swapped, b off by one or two */
  function lineSlips(rng, mn, md, b) {
    const key = ([n, d, c]) => `${n / d}|${c}`, seen = new Set([key([mn, md, b])]), out = [];
    const cands = [[-mn, md, b], [mn, md, -b], [md * Math.sign(mn), Math.abs(mn), b], [mn, md, b + rng.pick([1, -1])], [-md * Math.sign(mn), Math.abs(mn), b], [mn, md, b + rng.pick([2, -2])], [-mn, md, -b]];
    for (const c of cands) if (Math.abs(c[2]) <= 4 && !seen.has(key(c))) { seen.add(key(c)); out.push(c); }
    return out;
  }

  A.skill({
    id: 'math8.graph-lines', title: 'Graphing lines from slope-intercept form',
    learn: p(`An equation in the form ${Y} = ${V('m')}${X} + ${V('b')} tells you how to draw its line without making a table. <b>Start at the ${Y}-intercept ${PT(0, V('b'))}, then use the slope as rise over run</b> to step to a second point, and draw the line through both.`) +
      p(`Write the slope as a fraction: 3 is ${fracH('3', '1')}, so from the intercept go up 3 and right 1. A negative slope such as −${F(2, 3)} means go <b>down</b> 2 and right 3. Check the result: a positive slope rises from left to right, a negative slope falls.`) +
      p(`Reading a graph works the same way backwards: the line crosses the ${Y}-axis at ${V('b')}, and counting the rise and the run between two grid points gives ${V('m')}.`) +
      example('Example', `${big(lineF(2, 3, -1))}Plot the ${Y}-intercept ${PT(0, -1)}. The slope ${F(2, 3)} means up 2 and right 3, which lands on ${PT(3, 1)}. The line through <b>${PT(0, -1)} and ${PT(3, 1)}</b> is the graph.`),
    make(rng) {
      const [mn, md] = rng.pick(SLOPES), b = rng.int(-4, 4), kind = rng.pick(['pick-graph', 'pick-equation', 'next-point']);
      const rule = lineF(mn, md, b), [flip, ...rest] = lineSlips(rng, mn, md, b), slips = [flip].concat(rng.shuffle(rest));
      const stepHint = `The slope is ${slopeH(mn, md)}: ${mn > 0 ? 'up' : 'down'} ${Math.abs(mn)} and right ${md} from any point on the line.`;
      if (kind === 'pick-graph') {
        const lines = rng.shuffle([[mn, md, b]].concat(slips.slice(0, 3)));
        const at = lines.findIndex(l => l[0] === mn && l[1] === md && l[2] === b), answer = `Graph ${LETTERS[at]}`;
        const gallery = `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,172px));justify-content:center;gap:0 14px">${lines.map((l, i) => `<div style="text-align:center">${coordSvg({ lines: [[...l, LETTERS[i]]], label: `Graph ${LETTERS[i]}` })}<div>Graph ${LETTERS[i]}</div></div>`).join('')}</div>`;
        return { prompt: `Which graph shows the line ${rule}? Each grid square is 1 unit.${gallery}`, type: 'choice', choices: LETTERS.slice(0, 4).map(l => `Graph ${l}`), answer, keepOrder: true, params: { kind, mn, md, b },
          hints: [`Start with the ${Y}-intercept: the line must cross the ${Y}-axis at ${PT(0, b)}.`, `${stepHint} So ${PT(md, b + mn)} is on the line too, and it ${mn > 0 ? 'rises' : 'falls'} from left to right.`,
            `Only one graph passes through ${PT(0, b)} and ${PT(md, b + mn)}: <b>${answer}</b>.`] };
      }
      if (kind === 'pick-equation') {
        const q2 = Math.abs(b + mn) <= 5 && md <= 5 ? [md, b + mn] : [-md, b - mn];
        const opts = [[mn, md, b]].concat(slips.slice(0, 3)).map(l => ({ l, html: lineF(...l) }));
        const answer = opts[0].html;
        return { prompt: `Which equation describes this line? Each grid square is 1 unit.${coordSvg({ S: 20, lines: [[mn, md, b, 'L']], dots: [[0, b], q2] })}`, type: 'choice', choices: opts.map(o => o.html), answer, params: { kind, mn, md, b, opts: opts.map(o => o.l) },
          hints: [`The line crosses the ${Y}-axis at ${PT(0, b)}, so ${V('b')} = ${N(b)}.`,
            `Count from the left dot to the right dot, ${q2[0] > 0 ? `${PT(0, b)} to ${PT(...q2)}` : `${PT(...q2)} to ${PT(0, b)}`}: right ${md}, ${mn > 0 ? 'up' : 'down'} ${Math.abs(mn)}. The slope is rise ÷ run = ${mn > 0 ? '' : '−'}${Math.abs(mn)} ÷ ${md} = ${M.fracText(mn, md)}, ${mn > 0 ? 'positive because the line rises' : 'negative because the line falls'}.`,
            `The equation is <b>${answer}</b>.`] };
      }
      const on = ([u, v]) => md * (v - b) === mn * u;
      const cands = [[Math.abs(mn), b + md * Math.sign(mn)], [md, b - mn], [md, mn], [-md, b + mn], [md + 1, b + mn], [md, b + mn + 1], [mn, b + md]].filter(c => !on(c) && !(c[0] === 0 && c[1] === b));
      const answer = PT(md, b + mn), wrongs = distinct(answer, cands.map(c => PT(...c)), 3);
      return { prompt: `To graph ${rule} without a table, start at the ${Y}-intercept ${PT(0, b)} and use the slope. Which point is also on the line?`, type: 'choice', choices: [answer].concat(wrongs), answer, params: { kind, mn, md, b },
        hints: [`Write the slope as rise over run: ${md === 1 ? `${N(mn)} = ${fracH(N(mn), '1')}` : slopeH(mn, md)}. ${stepHint}`,
          `From ${PT(0, b)}, go right ${md} to ${X} = ${md}, and ${mn > 0 ? 'up' : 'down'} ${Math.abs(mn)} to ${Y} = ${N(b)} ${M.signed(mn)} = ${N(b + mn)}.`,
          `The next point is <b>${answer}</b>. (Check: ${slopeH(mn, md)} × ${md} ${M.signed(b)} = ${N(b + mn)}.)`] };
    },
    verify(q) {
      const { kind, mn, md, b } = q.params;
      if (kind === 'pick-graph') {
        const fits = LETTERS.slice(0, 4).filter(l => drawnFits(q.prompt, l, 5, 14, mn, md, b));
        return fits.length === 1 && q.answer === `Graph ${fits[0]}`;
      }
      if (kind === 'pick-equation') {
        const fits = q.params.opts.filter(l => drawnFits(q.prompt, 'L', 5, 20, l[0], l[1], l[2]));
        return fits.length === 1 && lineF(...fits[0]) === q.answer;
      }
      const hits = q.choices.filter(c => { const pt = parsePt(c); return pt && Math.abs(mn / md * pt[0] + b - pt[1]) < 1e-9; });
      return hits.length === 1 && hits[0] === q.answer;
    },
  });

  /* ---------- Unit 8: Circle graphs and trend lines ---------- */
  const PIE_SETS = [
    { q: 'how they get to school', cats: ['Walk', 'Bike', 'Bus', 'Car', 'Scooter'] },
    { q: 'to name their favorite fruit', cats: ['Apple', 'Banana', 'Mango', 'Grapes', 'Orange'] },
    { q: 'to name their favorite sport', cats: ['Soccer', 'Basketball', 'Swimming', 'Tennis', 'Track'] },
    { q: 'to name their favorite season', cats: ['Spring', 'Summer', 'Autumn', 'Winter'] },
    { q: 'what kind of pet they have', cats: ['Dog', 'Cat', 'Fish', 'Bird', 'No pet'] },
    { q: 'which club they would join', cats: ['Art', 'Music', 'Chess', 'Drama', 'Robotics'] },
  ];
  const PIE_FILLS = ['var(--primary)', 'var(--ok)', 'var(--warn)', 'var(--bad)', 'var(--lvl2)'];
  /** a circle graph; shares are percents, labels are what each sector shows beside its name */
  function pieSvg(cats, shares, labels) {
    const cx = 160, cy = 110, R = 76;
    let a = -Math.PI / 2, g = '';
    shares.forEach((s, i) => {
      const a1 = a + s / 100 * 2 * Math.PI, mid = (a + a1) / 2;
      g += `<path d="M${cx} ${cy} L${r2(cx + R * Math.cos(a))} ${r2(cy + R * Math.sin(a))} A${R} ${R} 0 ${s > 50 ? 1 : 0} 1 ${r2(cx + R * Math.cos(a1))} ${r2(cy + R * Math.sin(a1))} Z" fill="${PIE_FILLS[i]}" fill-opacity="0.35" stroke="currentColor" stroke-width="1.5"/>`;
      const lx = r2(cx + (R + 12) * Math.cos(mid)), sy = Math.sin(mid), ly = r2(cy + (R + 12) * sy + (sy < -0.5 ? -10 : sy > 0.5 ? 4 : -4));
      const anchor = Math.cos(mid) > 0.25 ? 'start' : Math.cos(mid) < -0.25 ? 'end' : 'middle';
      g += `<text x="${lx}" y="${ly}" text-anchor="${anchor}" font-size="12"><tspan font-weight="700">${M.esc(cats[i])}</tspan><tspan x="${lx}" dy="14">${labels[i]}</tspan></text>`;
      a = a1;
    });
    return `<svg class="figure" viewBox="0 0 320 224" width="320" role="img" aria-label="circle graph">${g}</svg>`;
  }

  A.skill({
    id: 'math8.circle-graphs', title: 'Circle graphs',
    learn: p(`A <b>circle graph</b> (pie chart) shows how a whole splits into parts. The whole circle stands for everyone, 100% of the data, and each sector's share of the circle equals its category's share of the total.`) +
      p(`A full turn is 360°, so <b>central angle = (part ÷ whole) × 360°</b>, and <b>percent = (part ÷ whole) × 100</b>. Going the other way, a sector's angle ÷ 360° gives its fraction of the whole: 90° is a quarter, 25%. To turn a percent back into a count, multiply it (as a decimal) by the total.`) +
      example('Example', `${big('12 of 48 students walk to school.')}12 ÷ 48 = 0.25, so walkers are 25% of the students, and their sector has a central angle of 0.25 × 360° = <b>90°</b>.`),
    make(rng) {
      const set = rng.pick(PIE_SETS), k = rng.int(3, Math.min(5, set.cats.length));
      const cats = rng.sample(set.cats, k), units = cats.map(() => 2);           // shares in steps of 5%, each at least 10%
      for (let r = 20 - 2 * k; r > 0; r--) units[rng.int(0, k - 1)]++;
      const T = 20 * rng.pick([2, 3, 4, 5, 6, 8, 10, 12]);
      const pcts = units.map(u => u * 5), counts = units.map(u => u * T / 20), degs = units.map(u => u * 18);
      const i = rng.int(0, k - 1), cat = cats[i], pct = pcts[i], count = counts[i], deg = degs[i], frac = N(pct / 100);
      const kind = rng.pick(['angle', 'angle', 'percent', 'read-count', 'angle-percent', 'angle-count']);
      const intro = `${N(T)} students were asked ${set.q}.`;
      const params = { kind, T, count, pct, deg, counts, pcts };
      if (kind === 'angle' || kind === 'percent') {
        const table = M.table(['Answer', 'Students'], cats.map((c, j) => [c, N(counts[j])]).concat([['<b>Total</b>', `<b>${N(T)}</b>`]]));
        const share = `${cat}: ${N(count)} of the ${N(T)} students, and ${N(count)} ÷ ${N(T)} = ${frac}.`;
        if (kind === 'angle') return { prompt: `${intro} The results will be shown in a circle graph. What is the central angle of the “${cat}” sector?${table}`, type: 'number', answer: deg, unit: '°', params,
          hints: [`A full circle is 360°. Each sector gets the same share of 360° as its answer has of all ${N(T)} students.`, share, `${frac} × 360° = <b>${deg}°</b>.`] };
        return { prompt: `${intro} In a circle graph of the results, what percent of the circle is the “${cat}” sector?${table}`, type: 'number', answer: pct, unit: '%', params,
          hints: [`The whole circle is all ${N(T)} students, so the sector's percent is the percent of students: part ÷ whole × 100.`, share, `${frac} × 100 = <b>${pct}%</b>.`] };
      }
      const byAngle = kind !== 'read-count';
      const graph = pieSvg(cats, pcts, byAngle ? degs.map(d => `${d}°`) : pcts.map(v => `${v}%`));
      if (kind === 'read-count') return { prompt: `${intro} The circle graph shows the results. How many students answered “${cat}”?${graph}`, type: 'number', answer: count, unit: 'students', params,
        hints: [`The ${cat} sector is ${pct}% of the circle, so ${pct}% of the ${N(T)} students gave that answer.`, `${pct}% = ${frac}, and ${frac} × ${N(T)} = ${N(count)}.`, `<b>${N(count)}</b> students answered “${cat}”.`] };
      const share = `${deg}° ÷ 360° = ${frac}${kind === 'angle-count' ? `, which is ${pct}% of the circle` : ''}.`;
      if (kind === 'angle-percent') return { prompt: `${intro} The circle graph shows the central angle of each sector. What percent of the students answered “${cat}”?${graph}`, type: 'number', answer: pct, unit: '%', params,
        hints: [`The whole circle, 360°, stands for all the students. Divide the ${cat} sector's angle by 360° to get its share.`, share, `${frac} = <b>${pct}%</b>.`] };
      return { prompt: `${intro} The circle graph shows the central angle of each sector. How many students answered “${cat}”?${graph}`, type: 'number', answer: count, unit: 'students', params,
        hints: [`The whole circle, 360°, stands for all ${N(T)} students. Find the ${cat} sector's share of 360° first.`, share, `${frac} × ${N(T)} = <b>${N(count)}</b> students.`] };
    },
    verify(q) {
      const { kind, T, count, pct, deg, counts, pcts } = q.params, a = q.answer;
      if (counts.reduce((s, c) => s + c, 0) !== T || pcts.reduce((s, c) => s + c, 0) !== 100) return 'parts do not add up to the whole';
      if (kind === 'angle') return a * T === 360 * count;                  // cross-multiplied: a/360 = count/T
      if (kind === 'percent') return a * T === 100 * count;
      if (kind === 'read-count') return a * 100 === pct * T;
      if (kind === 'angle-percent') return a * 360 === deg * 100;
      return a * 360 === deg * T;
    },
  });

  const TREND_CTX = [
    { xl: 'Hours of practice', yl: 'Test score', xw: 'number of hours of practice', yw: 'test score', xmax: 10, xstep: 2, ymax: 100, ystep: 20, ms: [3, 3.5, 4, 4.5], bs: [35, 40, 45], xs: [2, 4, 6, 8, 12],
      ask: x => `the test score of a student who practices for ${N(x)} hours`, slopeQ: 'By how many points does the predicted test score go up for each extra hour of practice?', per: 'hour of practice', unit: 'points' },
    { xl: 'Age (weeks)', yl: 'Height (cm)', xw: 'age in weeks', yw: 'height in centimeters', xmax: 10, xstep: 2, ymax: 50, ystep: 10, ms: [2, 2.5, 3, 3.5], bs: [4, 5, 6, 8], xs: [3, 5, 7, 9, 11, 12],
      ask: x => `the height of a plant that is ${N(x)} weeks old`, slopeQ: 'By how many centimeters does the predicted height go up for each extra week?', per: 'week', unit: 'cm' },
    { xl: 'Temperature (°C)', yl: 'Drinks sold', xw: 'temperature in °C', yw: 'number of drinks sold', xmax: 40, xstep: 10, ymax: 200, ystep: 40, ms: [2.5, 3, 3.5], bs: [20, 30, 40], xs: [12, 18, 24, 32, 36, 42],
      ask: x => `the number of drinks sold on a day when it is ${N(x)} °C`, slopeQ: 'By how many drinks do the predicted sales go up for each extra degree?', per: 'degree', unit: 'drinks' },
    { xl: 'Age of car (years)', yl: 'Value ($1000s)', xw: 'age of the car in years', yw: 'value in thousands of dollars', xmax: 10, xstep: 2, ymax: 30, ystep: 5, ms: [-1.5, -2], bs: [24, 26, 28], xs: [3, 5, 6, 7, 9],
      ask: x => `the value, in thousands of dollars, of a car that is ${N(x)} years old`, slopeQ: 'By how many thousand dollars does the predicted value go down for each extra year?', per: 'year', unit: '', say: 'thousand dollars' },
    { xl: 'Screen time (hours)', yl: 'Sleep (hours)', xw: 'hours of screen time', yw: 'hours of sleep', xmax: 8, xstep: 2, ymax: 12, ystep: 2, ms: [-0.5, -0.75], bs: [10, 11], xs: [2, 3, 4, 5, 6],
      ask: x => `the hours of sleep of a student with ${N(x)} hours of screen time`, slopeQ: 'By how many hours does the predicted sleep go down for each extra hour of screen time?', per: 'hour of screen time', unit: 'hours' },
  ];
  /** "y = 3.5x + 40" back to [3.5, 40] */
  const parseDecEqn = html => {
    const s = minus(A.stripTags(html)).replace(/\s+/g, ''), mm = s.match(/^y=(-?\d*\.?\d*)x([+-]\d+(?:\.\d+)?)?$/);
    return mm ? [mm[1] === '' ? 1 : mm[1] === '-' ? -1 : Number(mm[1]), mm[2] ? Number(mm[2]) : 0] : null;
  };
  const sse = (pts, m, b) => pts.reduce((s, [x, y]) => s + (y - m * x - b) ** 2, 0);

  A.skill({
    id: 'math8.trend-lines', title: 'Trend lines and predictions',
    learn: p(`When a scatter plot shows a linear association, a <b>trend line</b> (line of best fit) sums it up. A good trend line <b>follows the direction of the dots and passes through the middle of the cloud</b>, with about as many dots above it as below. It does not have to touch any dot.`) +
      p(`Write its equation like any line: read the ${Y}-intercept where it crosses the ${Y}-axis, and find the slope from two points on the line (not two dots of data). The slope is the predicted change in ${Y} for each extra unit of ${X}.`) +
      p(`To <b>predict</b>, substitute the ${X}-value into the equation. A prediction is an estimate: real data points sit near the line, not exactly on it.`) +
      example('Example', `${big(`Trend line: ${eqn(3.5, 40)}`)}For a student who practices 6 hours, ${Y} = 3.5(6) + 40 = 21 + 40 = <b>61 points</b>. The slope says each extra hour goes with about 3.5 more points.`),
    make(rng) {
      const c = rng.pick(TREND_CTX), m = rng.pick(c.ms), b = rng.pick(c.bs), kind = rng.pick(['predict', 'predict', 'meaning', 'choose', 'read']);
      const step = c.xmax / 20, noise = c.ymax * 0.06, ydp = c.ymax >= 100 ? 0 : 1;
      const xs = rng.sample([...Array(19)].map((_, i) => M.round((i + 1) * step, 2)), 10).sort((u, v) => u - v);
      const gap = c.ystep * Math.round(0.4 * c.ymax / c.ystep), shift = b + gap <= c.ymax ? gap : -gap;   // a parallel line about 40% of the axis away
      const say = c.say || c.unit, sayU = say ? ' ' + say : '';
      const wrongs = [[-m, M.round(b + m * c.xmax, 2)], [m, M.round(b + shift, 2)], [b, m]];
      let pts, tries = 0;
      do {
        pts = xs.map(x => [x, Math.min(c.ymax * 0.98, Math.max(c.ymax * 0.02, M.round(m * x + b + rng.dec(-noise, noise, 2), ydp)))]);
        tries++;
      } while (tries < 50 && wrongs.some(([wm, wb]) => sse(pts, wm, wb) < 3 * sse(pts, m, b)));
      const line = eqn(m, b), what = `where ${X} is the ${c.xw} and ${Y} is the ${c.yw}`;
      if (kind === 'predict' || kind === 'meaning') {
        const graph = plotSvg({ xmax: c.xmax, xstep: c.xstep, ymax: c.ymax, ystep: c.ystep, xl: c.xl, yl: c.yl, dots: pts, line: [m, b] });
        const lead = `The trend line for this scatter plot is <span data-eq>${line}</span>, ${what}.`;
        if (kind === 'meaning') return { prompt: `${lead} ${c.slopeQ}${graph}`, type: 'number', answer: Math.abs(m), unit: c.unit || undefined, params: { kind, m, b },
          hints: [`In ${Y} = ${V('m')}${X} + ${V('b')}, the slope ${V('m')} is how much ${Y} changes when ${X} goes up by 1.`, `Here the slope is ${N(m)}: for each extra ${c.per}, the prediction goes ${m > 0 ? 'up' : 'down'} by ${N(Math.abs(m))}${m < 0 ? ' (the minus sign means a decrease)' : ''}.`, `<b>${N(Math.abs(m))}</b>${sayU}.`] };
        const x = rng.pick(c.xs), y = M.round(m * x + b, 4);
        return { prompt: `${lead} Use it to predict ${c.ask(x)}.${graph}`, type: 'number', answer: y, unit: c.unit || undefined, params: { kind, m, b, x },
          hints: [`Substitute ${X} = ${N(x)} into the trend line equation.`, `${Y} = ${N(m)} × ${N(x)} ${M.signed(b)} = ${N(M.round(m * x, 4))} ${M.signed(b)}.`, `The trend line predicts about <b>${N(y)}</b>${sayU}.`] };
      }
      if (kind === 'choose') {
        const answer = line, choices = [answer].concat(distinct(answer, wrongs.map(([wm, wb]) => eqn(wm, wb)), 3));
        return { prompt: `Which equation is the best trend line for this scatter plot, ${what}?${plotSvg({ xmax: c.xmax, xstep: c.xstep, ymax: c.ymax, ystep: c.ystep, xl: c.xl, yl: c.yl, dots: pts })}`, type: 'choice', choices, answer, params: { kind, pts },
          hints: [`A good trend line goes the same way as the dots and runs through the middle of the cloud.`,
            `The dots ${m > 0 ? 'rise' : 'fall'} from left to right, so the slope must be ${m > 0 ? 'positive' : 'negative'}. Extending the cloud back to ${X} = 0, it starts near ${Y} = ${N(b)}, so the ${Y}-intercept should be about ${N(b)}.`,
            `Check the others at ${X} = ${N(c.xmax / 2)}: the trend line should give a ${Y}-value in the middle of the dots there. ${eqn(...wrongs[1])} gives ${N(M.round(m * c.xmax / 2 + wrongs[1][1], 2))}, ${shift > 0 ? 'above' : 'below'} every dot.`,
            `<b>${answer}</b> follows the dots.`] };
      }
      const xr = c.xmax, yr = M.round(m * xr + b, 4), marks = [[0, b, PT(0, b)], [xr, yr, PT(xr, yr)]];
      const answer = line, choices = [answer].concat(distinct(answer, [eqn(M.round(yr - b, 4), b), eqn(-m, b), eqn(b, m), eqn(m, yr)], 3));
      return { prompt: `The trend line on this scatter plot passes through the two marked points. Which equation describes the trend line, ${what}?${plotSvg({ xmax: c.xmax, xstep: c.xstep, ymax: c.ymax, ystep: c.ystep, xl: c.xl, yl: c.yl, dots: pts, line: [m, b], marks })}`, type: 'choice', choices, answer, params: { kind, marks: marks.map(k => k.slice(0, 2)) },
        hints: [`The line crosses the ${Y}-axis at ${PT(0, b)}, so the ${Y}-intercept is ${N(b)}.`,
          `Slope = rise ÷ run between the marked points: (${N(yr)} − ${N(b)}) ÷ (${N(xr)} − 0) = ${N(M.round(yr - b, 4))} ÷ ${N(xr)} = ${N(m)}.`,
          `The equation is <b>${answer}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'predict' || p.kind === 'meaning') {
        const shown = (q.prompt.match(/<span data-eq>(.*?)<\/span>/) || [])[1], e = shown && parseDecEqn(shown);   // the equation the learner sees
        if (!e) return 'no equation in the prompt';
        return p.kind === 'meaning' ? Math.abs(q.answer - Math.abs((e[0] * 7 + e[1]) - (e[0] * 6 + e[1]))) < 1e-9 : Math.abs(e[0] * p.x + e[1] - q.answer) < 1e-9;
      }
      if (p.kind === 'read') { const e = parseDecEqn(q.answer); return !!e && p.marks.every(([x, y]) => Math.abs(e[0] * x + e[1] - y) < 1e-9); }
      const fits = q.choices.map(c => { const e = parseDecEqn(c); return e ? sse(p.pts, e[0], e[1]) : Infinity; });
      const best = Math.min(...fits), mine = fits[q.choices.indexOf(q.answer)];
      return mine === best && fits.filter(f => f < 2 * best).length === 1;
    },
  });

  /* ---------- Unit 9: More with the Pythagorean theorem ---------- */
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const QUADS = [];                                                   // whole-number boxes whose long diagonal is whole too
  for (let a = 1; a <= 12; a++) for (let b = a; b <= 12; b++) for (let c = b; c <= 12; c++) { const d = Math.sqrt(a * a + b * b + c * c); if (Number.isInteger(d)) QUADS.push([a, b, c, d]); }

  /** a box in an oblique view, not to scale. A is the front bottom-left corner, C the back bottom-right, G the back top-right. */
  function boxSvg(labs, show) {
    const [l, w, h] = labs.map(t => t.v || 6), k = 150 / Math.max(l, w, h);
    const sl = clamp(l * k, 80, 150), sh = clamp(h * k, 55, 120), sw = clamp(w * k * 0.55, 32, 70), dx = r2(sw * 0.87), dy = r2(sw * 0.5);
    const x0 = 50, y0 = r2(26 + dy + sh);
    const A = [x0, y0], B = [x0 + sl, y0], C = [x0 + sl + dx, y0 - dy], D = [x0 + dx, y0 - dy];
    const up = P => [P[0], r2(P[1] - sh)], E = up(A), Fq = up(B), G = up(C), H = up(D);
    const L = (P, Q, attrs) => `<line x1="${r2(P[0])}" y1="${r2(P[1])}" x2="${r2(Q[0])}" y2="${r2(Q[1])}" ${attrs}/>`;
    let g = [[A, D], [D, C], [D, H]].map(([P, Q]) => L(P, Q, 'class="light" stroke-width="1.5" stroke-dasharray="4 3"')).join('');
    g += [[A, B], [B, Fq], [Fq, E], [E, A], [E, H], [H, G], [G, Fq], [B, C], [C, G]].map(([P, Q]) => L(P, Q, 'class="stroke"')).join('');
    if (show.base) g += L(A, C, 'stroke="var(--primary)" stroke-width="2" stroke-dasharray="6 4"');
    if (show.space) g += L(A, G, 'stroke="var(--warn)" stroke-width="2.5"');
    const t = (x, y, s, anchor) => `<text x="${r2(x)}" y="${r2(y)}" text-anchor="${anchor || 'middle'}" font-size="13">${s}</text>`;
    g += t((A[0] + B[0]) / 2, y0 + 18, labs[0].t) + t(x0 - 8, y0 - sh / 2 + 4, labs[2].t, 'end') + t((B[0] + C[0]) / 2 + 8, (B[1] + C[1]) / 2 + 12, labs[1].t, 'start');
    g += `<text x="${x0 - 6}" y="${y0 + 14}" text-anchor="end" font-size="13" font-weight="700">A</text><text x="${r2(C[0] + 7)}" y="${r2(C[1] + 5)}" font-size="13" font-weight="700">C</text><text x="${r2(G[0] + 6)}" y="${r2(G[1] - 4)}" font-size="13" font-weight="700">G</text>`;
    return `<svg class="figure" viewBox="0 0 ${Math.ceil(x0 + sl + dx + 64)} ${Math.ceil(y0 + 28)}" width="${Math.ceil(x0 + sl + dx + 64)}" role="img" aria-label="a box with corners A, C and G marked">${g}</svg>`;
  }
  /** a cylinder with its longest rod drawn from the bottom rim to the opposite top rim */
  function canSvg(rText, hText, ratio) {
    const rx = 52, ry = 13, H = clamp(ratio * 104, 60, 150), cx = 80, top = 34, bot = top + H;
    let g = `<ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" class="stroke"/>`;
    g += `<path d="M${cx - rx} ${bot} A${rx} ${ry} 0 0 0 ${cx + rx} ${bot}" class="stroke"/><path d="M${cx - rx} ${bot} A${rx} ${ry} 0 0 1 ${cx + rx} ${bot}" class="light" fill="none" stroke-width="1.5" stroke-dasharray="4 3"/>`;
    g += `<line x1="${cx - rx}" y1="${top}" x2="${cx - rx}" y2="${bot}" class="stroke"/><line x1="${cx + rx}" y1="${top}" x2="${cx + rx}" y2="${bot}" class="stroke"/>`;
    g += `<line x1="${cx}" y1="${top}" x2="${cx + rx}" y2="${top}" class="stroke" stroke-width="1.5"/><circle cx="${cx}" cy="${top}" r="2.5" fill="currentColor"/>`;
    g += `<line x1="${cx - rx}" y1="${bot}" x2="${cx + rx}" y2="${top}" stroke="var(--warn)" stroke-width="2.5"/>`;
    g += `<text x="${cx + rx / 2}" y="${top - ry - 5}" text-anchor="middle" font-size="13">${rText}</text><text x="${cx + rx + 8}" y="${r2((top + bot) / 2 + 4)}" font-size="13">${hText}</text>`;
    return `<svg class="figure" viewBox="0 0 210 ${Math.ceil(bot + ry + 10)}" width="210" role="img" aria-label="a cylinder with a rod from the bottom edge to the opposite top edge">${g}</svg>`;
  }

  A.skill({
    id: 'math8.pythagorean-3d', title: 'Pythagorean theorem in three dimensions',
    learn: p(`The longest straight line inside a box runs from one corner to the opposite corner, through the middle: the <b>space diagonal</b>. Find it by using the Pythagorean theorem <b>twice</b>.`) +
      p(`First, the diagonal across the bottom of the box (AC) is the hypotenuse of a right triangle whose legs are the length and the width: AC² = ${S(V('l'), 2)} + ${S(V('w'), 2)}. Second, AC and the height stand at right angles, so the space diagonal AG is the hypotenuse of another right triangle: AG² = AC² + ${S(V('h'), 2)}. Put together, <b>AG² = ${S(V('l'), 2)} + ${S(V('w'), 2)} + ${S(V('h'), 2)}</b>.`) +
      p(`The same idea finds the longest stick that fits in a can: it is the hypotenuse of a triangle with the can's height and its diameter (twice the radius) as legs.`) +
      example('Example', `${big('A box 3 cm by 4 cm by 12 cm')}Base diagonal: 3² + 4² = 9 + 16 = 25, so AC = 5 cm. Space diagonal: 5² + 12² = 25 + 144 = 169, so AG = ${M.sqrt(169)} = <b>13 cm</b>.`),
    make(rng) {
      const kind = rng.pick(['space', 'space', 'base', 'rounded', 'missing', 'can']), u = rng.pick(['cm', 'cm', 'in', 'ft']);
      const dim = v => `${N(v)} ${u}`;
      if (kind === 'can') {
        const t = rng.pick(TRIPLES.slice(0, 4)), k = t[2] > 13 ? 1 : rng.int(1, 2), legs = [t[0] * k, t[1] * k];
        const d = rng.pick(legs.filter(v => v % 2 === 0)), h = legs[0] + legs[1] - d, c = t[2] * k, r = d / 2;   // the diameter is an even leg
        return { prompt: `A can is ${dim(h)} tall and has a radius of ${dim(r)}. What is the length of the longest straight stick that fits inside it?${canSvg(`r = ${dim(r)}`, dim(h), h / d)}`, type: 'number', answer: c, unit: u, params: { kind, r, h },
          hints: [`The longest stick runs from the bottom edge to the opposite top edge. It is the hypotenuse of a right triangle whose legs are the height and the <b>diameter</b>.`,
            `The diameter is 2 × ${N(r)} = ${N(d)} ${u}. ${S(d, 2)} + ${S(h, 2)} = ${d * d} + ${h * h} = ${d * d + h * h}.`, `${M.sqrt(d * d + h * h)} = <b>${N(c)} ${u}</b>.`] };
      }
      let l, w, h;
      if (kind === 'base') { const t = rng.pick(TRIPLES.slice(0, 3)), k = rng.int(1, t[2] > 5 ? 1 : 3); [l, w] = rng.shuffle([t[0] * k, t[1] * k]); h = rng.int(3, 14); }
      else if (kind === 'rounded') { do { l = rng.int(4, 12); w = rng.int(2, 9); h = rng.int(2, 10); } while (Number.isInteger(Math.sqrt(l * l + w * w + h * h))); }
      else { const qd = rng.pick(QUADS), k = qd[3] <= 9 ? rng.int(1, 3) : 1; [l, w, h] = rng.shuffle(qd.slice(0, 3)).map(v => v * k); }
      const base2 = l * l + w * w, d2 = base2 + h * h, d = Math.sqrt(d2);
      const labs = [{ v: l, t: dim(l) }, { v: w, t: dim(w) }, { v: h, t: kind === 'missing' ? '?' : dim(h) }];
      const pic = boxSvg(labs, { base: true, space: kind !== 'base' });
      const sides = `${dim(l)} long, ${dim(w)} wide${kind === 'missing' ? '' : ` and ${dim(h)} tall`}`;
      const step1 = `First the diagonal of the base: AC² = ${S(l, 2)} + ${S(w, 2)} = ${l * l} + ${w * w} = ${base2}.`;
      if (kind === 'base') return { prompt: `A box is ${sides}. How long is AC, the diagonal across the bottom of the box?${pic}`, type: 'number', answer: Math.sqrt(base2), unit: u, params: { kind, l, w, h },
        hints: [`AC lies flat on the bottom face. It is the hypotenuse of a right triangle whose legs are the length and the width; the height does not matter.`, `AC² = ${S(l, 2)} + ${S(w, 2)} = ${l * l} + ${w * w} = ${base2}.`, `AC = ${M.sqrt(base2)} = <b>${N(Math.sqrt(base2))} ${u}</b>.`] };
      if (kind === 'missing') {
        return { prompt: `A box is ${sides}. The diagonal AG from corner A to the opposite corner G is ${dim(d)}. How tall is the box?${pic}`, type: 'number', answer: h, unit: u, params: { kind, l, w, d },
          hints: [`Using the theorem twice gives AG² = ${S(V('l'), 2)} + ${S(V('w'), 2)} + ${S(V('h'), 2)}, so ${S(V('h'), 2)} = AG² − ${S(V('l'), 2)} − ${S(V('w'), 2)}.`,
            `${S(V('h'), 2)} = ${S(d, 2)} − ${S(l, 2)} − ${S(w, 2)} = ${d2} − ${l * l} − ${w * w} = ${h * h}.`, `${V('h')} = ${M.sqrt(h * h)} = <b>${N(h)} ${u}</b>.`] };
      }
      const rounded = kind === 'rounded', ans = rounded ? M.round(d, 1) : d;
      return { prompt: `A box is ${sides}. How long is the diagonal AG, from corner A to the opposite corner G?${rounded ? ' Round to the nearest tenth.' : ''}${pic}`, type: 'number', answer: ans, unit: u, tolerance: rounded ? 0.05 : undefined, params: { kind, l, w, h },
        hints: [`Use the Pythagorean theorem twice. ${step1}`, `AC and the height meet at a right angle, and AG is the hypotenuse: AG² = AC² + ${S(h, 2)} = ${base2} + ${h * h} = ${d2}.`,
          rounded ? `AG = ${M.sqrt(d2)} ≈ <b>${N(ans)} ${u}</b>.` : `AG = ${M.sqrt(d2)} = <b>${N(d)} ${u}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'can') return Math.abs(Math.hypot(2 * p.r, p.h) - q.answer) < 1e-9;
      if (p.kind === 'base') return Math.abs(Math.hypot(p.l, p.w) - q.answer) < 1e-9;
      if (p.kind === 'missing') return Math.abs(Math.hypot(p.l, p.w, q.answer) - p.d) < 1e-9 && q.answer > 0;
      const d = Math.hypot(p.l, p.w, p.h);                              // the distance from (0, 0, 0) to (l, w, h)
      return p.kind === 'rounded' ? Math.abs(d - q.answer) <= 0.05 : Math.abs(d - q.answer) < 1e-9;
    },
  });

  /** the largest angle of a triangle in degrees, by the law of cosines */
  const bigAngle = sides => { const [a, b, c] = sides.slice().sort((u, v) => u - v); return Math.acos((a * a + b * b - c * c) / (2 * a * b)) * 180 / Math.PI; };
  const triKind = sides => { const [a, b, c] = sides.slice().sort((u, v) => u - v), d = a * a + b * b - c * c; return d === 0 ? 'right' : d > 0 ? 'acute' : 'obtuse'; };
  const validTri = sides => { const [a, b, c] = sides.slice().sort((u, v) => u - v); return a > 0 && a + b > c; };
  /** a near miss: one side of a right triangle nudged by 1 or 2, still a real triangle but no longer a right one */
  function nudge(rng, t) {
    for (let i = 0; i < 40; i++) { const s = t.slice(), j = rng.int(0, 2); s[j] += rng.pick([-2, -1, 1, 2]); if (validTri(s) && triKind(s) !== 'right') return s; }
    return [t[0], t[1], t[2] + 1];
  }
  const CONV_CHOICES = ['Right triangle', 'Acute triangle', 'Obtuse triangle'];
  const CORNER = ['Yes: it is exactly 90°', 'No: it is less than 90°', 'No: it is more than 90°'];

  A.skill({
    id: 'math8.pythagorean-converse', title: 'Converse of the Pythagorean theorem',
    learn: p(`The Pythagorean theorem also works backwards. Its <b>converse</b> says: <b>if the side lengths of a triangle fit ${S(V('a'), 2)} + ${S(V('b'), 2)} = ${S(V('c'), 2)}, where ${V('c')} is the longest side, then the triangle is a right triangle</b>, with the right angle opposite the longest side.`) +
      p(`So to test three lengths, square the two shorter sides and add, then compare with the square of the longest side. If ${S(V('a'), 2)} + ${S(V('b'), 2)} is <b>larger</b> than ${S(V('c'), 2)}, the longest side is too short to reach across a right angle, so the angle opposite it is less than 90°: an <b>acute</b> triangle. If ${S(V('a'), 2)} + ${S(V('b'), 2)} is <b>smaller</b>, that angle is more than 90°: an <b>obtuse</b> triangle.`) +
      p(`Builders use this to check a square corner: 3 units along one edge, 4 along the other, and the diagonal between the marks must be exactly 5.`) +
      example('Example', `${big('Sides 8, 15, 17')}The longest side is 17. 8² + 15² = 64 + 225 = 289, and 17² = 289. They are equal, so this is a <b>right triangle</b>.`),
    make(rng) {
      const kind = rng.pick(['classify', 'classify', 'which', 'corner']);
      const t0 = rng.pick(TRIPLES.slice(0, 4)), k = rng.int(1, t0[2] > 13 ? 1 : 3), t = t0.map(v => v * k);
      if (kind === 'which') {
        const wrongs = [], seen = new Set([t.join()]);
        for (let i = 0; i < 60 && wrongs.length < 3; i++) {
          const kk = rng.int(1, 2), base = rng.chance(0.7) ? t : rng.pick(TRIPLES.slice(0, 3)).map(v => v * kk);   // a near miss of this triple or of another one
          const s = nudge(rng, base).sort((a, b) => a - b);
          if (!seen.has(s.join())) { seen.add(s.join()); wrongs.push(s); }
        }
        const fmt = s => s.map(N).join(', '), answer = fmt(t), w = wrongs[0], [wa, wb, wc] = w;
        return { prompt: `Which set of side lengths makes a right triangle?`, type: 'choice', choices: [answer].concat(wrongs.map(fmt)), answer, params: { kind },
          hints: [`For each set, add the squares of the two shorter sides and compare with the square of the longest side.`,
            `${fmt(w)}: ${S(wa, 2)} + ${S(wb, 2)} = ${wa * wa + wb * wb}, but ${S(wc, 2)} = ${wc * wc}. Not equal, so not a right triangle.`,
            `${answer}: ${S(t[0], 2)} + ${S(t[1], 2)} = ${t[0] * t[0] + t[1] * t[1]} = ${S(t[2], 2)}. <b>${answer}</b> makes a right triangle.`] };
      }
      const want = rng.pick(['right', 'acute', 'obtuse']);
      let s = t;
      if (want !== 'right') {
        for (let i = 0; i < 80; i++) {
          const cand = kind === 'corner' ? [t[0], t[1], t[2] + (want === 'acute' ? -1 : 1) * rng.int(1, 2)] : rng.chance(0.5) ? nudge(rng, t) : [rng.int(4, 15), rng.int(4, 15), rng.int(5, 20)];
          if (validTri(cand) && triKind(cand) === want && (kind === 'corner' || new Set(cand).size === 3)) { s = cand; break; }
        }
      }
      if (kind === 'corner') {
        const [a, b, c] = s, name = rng.pick(NAMES), thing = rng.pick(['garden bed', 'picture frame', 'deck', 'tabletop', 'sandbox']), u = rng.pick(['ft', 'in', 'cm']);
        const sum = a * a + b * b, cc = c * c, res = sum === cc ? 0 : sum > cc ? 1 : 2;
        return { prompt: `${name} wants to check that a corner of a ${thing} is a right angle. ${name} marks a point ${N(a)} ${u} along one edge from the corner and a point ${N(b)} ${u} along the other edge, then measures the diagonal between the two marks: ${N(c)} ${u}. Is the corner a right angle?`, type: 'choice', choices: CORNER.slice(), answer: CORNER[res], keepOrder: true, params: { kind, s },
          hints: [`The two edges and the diagonal make a triangle, and the corner is the angle opposite the diagonal. Compare ${S(N(a), 2)} + ${S(N(b), 2)} with ${S(N(c), 2)}.`,
            `${S(N(a), 2)} + ${S(N(b), 2)} = ${a * a} + ${b * b} = ${sum}, and ${S(N(c), 2)} = ${cc}.`,
            res === 0 ? `They are equal, so by the converse of the Pythagorean theorem the corner is square. <b>${CORNER[0]}</b>.` : res === 1 ? `${sum} &gt; ${cc}: the diagonal is shorter than it would be for a right angle, so the corner is pinched in. <b>${CORNER[1]}</b>.` : `${sum} &lt; ${cc}: the diagonal is longer than it would be for a right angle, so the corner is opened out. <b>${CORNER[2]}</b>.`] };
      }
      const shown = rng.shuffle(s), [a, b, c] = s.slice().sort((u, v) => u - v), sum = a * a + b * b, cc = c * c;
      const answer = CONV_CHOICES[{ right: 0, acute: 1, obtuse: 2 }[triKind(s)]];
      return { prompt: `A triangle has sides of length ${M.list(shown.map(N))}. What kind of triangle is it?`, type: 'choice', choices: CONV_CHOICES.slice(), answer, keepOrder: true, params: { kind, s },
        hints: [`The longest side is ${N(c)}. Compare ${S(a, 2)} + ${S(b, 2)} with ${S(c, 2)}.`, `${S(a, 2)} + ${S(b, 2)} = ${a * a} + ${b * b} = ${sum}, and ${S(c, 2)} = ${cc}.`,
          sum === cc ? `They are equal, so by the converse of the Pythagorean theorem it is a <b>right triangle</b>.` : sum > cc ? `${sum} &gt; ${cc}, so the angle opposite the longest side is less than 90°: an <b>acute triangle</b>.` : `${sum} &lt; ${cc}, so the angle opposite the longest side is more than 90°: an <b>obtuse triangle</b>.`] };
    },
    verify(q) {
      const p = q.params, kindOf = deg => Math.abs(deg - 90) < 1e-7 ? 0 : deg < 90 ? 1 : 2;
      if (p.kind === 'which') {
        const rights = q.choices.filter(c => { const s = c.split(', ').map(Number); return validTri(s) && Math.abs(bigAngle(s) - 90) < 1e-7; });
        return rights.length === 1 && rights[0] === q.answer && q.choices.every(c => validTri(c.split(', ').map(Number)));
      }
      if (!validTri(p.s)) return 'not a triangle';
      if (p.kind === 'corner') {                                         // the corner is the angle opposite the diagonal, the third length
        const [a, b, c] = p.s, deg = Math.acos((a * a + b * b - c * c) / (2 * a * b)) * 180 / Math.PI;
        return q.answer === CORNER[kindOf(deg)];
      }
      return q.answer === CONV_CHOICES[kindOf(bigAngle(p.s))];
    },
  });

})();
