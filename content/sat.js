/* SAT and ACT style math. Original practice questions written in the style of the math sections of the SAT and
   the ACT, grouped by the tests' topic areas (algebra; advanced math; problem solving and data analysis; geometry
   and trigonometry; and the extra topics the ACT includes), plus mixed sets that draw from all of them the way a
   test section does. Nothing here is copied from a real test. verify() re-derives each answer another way: by
   substituting it back, by brute force over a small range, or straight from the table or data in the question. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v;
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = s => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const key = s => A.normText(A.stripTags(s));
  const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1e-9 : tol);
  const r2 = x => M.round(x, 2);
  const X = V('x'), Y = V('y'), K = V('k');
  const gcd = M.gcd, lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
  /** a fraction answer: the value, plus "3/4" to show when it isn't whole */
  const fa = (n, d) => { const [a, b] = M.simp(n, d); return b === 1 ? { answer: a } : { answer: a / b, answerText: M.fracText(a, b) }; };
  const ft = (n, d) => M.fracText(n, d);
  /** "ax + by" with tidy signs */
  const two = (a, b, u, v) => `${M.term(a, u || 'x')} ${b < 0 ? '−' : '+'} ${M.term(Math.abs(b), v || 'y')}`;
  /** the answer plus up to three distractors that read differently from it and from each other */
  function options(answer, cands, n) {
    const out = [answer], seen = new Set([key(answer)]);
    for (const c of cands) { if (out.length >= (n || 4)) break; if (c == null) continue; const k = key(c); if (!seen.has(k)) { seen.add(k); out.push(c); } }
    return out;
  }
  const money = M.money;
  /** "a" or "an" before a number said aloud: an 8-mile ride, an 11-mile ride */
  const an = n => [8, 11, 18].includes(n) || (n >= 80 && n < 90) ? 'an' : 'a';
  const COURSE = {
    id: 'sat-act', title: 'SAT and ACT style math', subject: 'High school', grade: 11, icon: 'SAT', hue: 230,
    blurb: 'Original practice in the style of the SAT and ACT math sections, by topic area and in mixed test-style sets. Listed at grade 11, the year most students take these tests.',
    units: [
      { id: 'algebra', title: 'Algebra', blurb: 'Linear equations, linear models, systems, inequalities, and the slopes and intercepts of lines.', skills: ['sat.linear-equations', 'sat.linear-models', 'sat.systems', 'sat.linear-inequalities', 'sat.lines'] },
      { id: 'advanced', title: 'Advanced math', blurb: 'Quadratics, exponents and radicals, functions, exponential models, polynomials, and line-and-parabola systems.', skills: ['sat.quadratics', 'sat.exponents-radicals', 'sat.functions', 'sat.exponential-models', 'sat.polynomials-rational', 'sat.nonlinear-systems'] },
      { id: 'data', title: 'Problem solving and data analysis', blurb: 'Ratios, rates and unit conversions, percents, mean, median and spread, two-way tables, and what a sample can tell you.', skills: ['sat.ratios-rates', 'sat.percents', 'sat.statistics', 'sat.probability-tables', 'sat.sampling-inference'] },
      { id: 'geometry', title: 'Geometry and trigonometry', blurb: 'Area and volume, angles and similar triangles, right-triangle trigonometry, and circles, arcs and radians.', skills: ['sat.area-volume', 'sat.angles-triangles', 'sat.right-triangles', 'sat.circles'] },
    ],
  };
  A.course(COURSE);

  /* ---------- Unit 1: algebra ---------- */
  A.skill({
    id: 'sat.linear-equations', title: 'Linear equations in one variable',
    learn: p(`To solve a linear equation, <b>undo the operations in reverse order and keep both sides balanced</b>: distribute, collect the ${X}-terms on one side and the numbers on the other, then divide.`) +
      p(`Test questions often ask for an <b>expression</b> rather than ${X} itself. Before solving, look for a shortcut: if 3${X} + 2 = 11, then 6${X} + 4 is just twice that, 22. An equation like 4${X} + 1 = 4${X} + 7 has <b>no solution</b>, because the ${X}-terms cancel and leave 1 = 7.`) +
      example('Example', `Solve 3(${X} − 4) = ${X} + 6. Distribute: 3${X} − 12 = ${X} + 6. Subtract ${X} and add 12: 2${X} = 18, so <b>${X} = 9</b>.`),
    make(rng) {
      const kind = rng.pick(['solve', 'solve', 'expr', 'frac', 'none']);
      if (kind === 'solve') {
        const x = rng.int(-9, 12), a = rng.int(2, 6), b = rng.nz(-8, 8), c = rng.pick([1, 2, 3, -1, -2].filter(v => v < a)), d = a * (x + b) - c * x;
        const rhs = M.poly([c, d]), co = a - c;
        return { prompt: `If ${a}(${M.poly([1, b])}) = ${rhs}, what is the value of ${X}?`, type: 'number', answer: x, params: { kind, a, b, c, d },
          hints: [`Distribute: ${M.poly([a, a * b])} = ${rhs}.`, `Collect the ${X}-terms on the left and the numbers on the right: ${M.term(co, 'x')} = ${N(d - a * b)}.`, co === 1 ? `So <b>${X} = ${N(x)}</b>.` : `Divide by ${co}: <b>${X} = ${N(x)}</b>.`] };
      }
      if (kind === 'expr') {
        const a = rng.int(2, 7), b = rng.nz(-9, 9), k = rng.int(2, 5), r = rng.int(-10, 30);
        return { prompt: `If ${M.poly([a, b])} = ${N(r)}, what is the value of ${M.poly([k * a, k * b])}?`, type: 'number', answer: k * r, params: { kind, a, b, k, r },
          hints: [`You don't need ${X}. Compare the two expressions: ${M.poly([k * a, k * b])} = ${k}(${M.poly([a, b])}).`, `So it is ${k} × ${N(r)} = <b>${N(k * r)}</b>.`] };
      }
      if (kind === 'frac') {
        const [a, b] = rng.sample([2, 3, 4, 5, 6], 2), L = lcm(a, b), t = rng.nz(-4, 6), x = L * t, r = x / a + x / b;
        return { prompt: `What value of ${X} satisfies the equation?${big(`${F(X, a)} + ${F(X, b)} = ${N(r)}`)}`, type: 'number', answer: x, params: { kind, a, b, r },
          hints: [`Multiply every term by ${L}, the least common denominator: ${N(L / a)}${X} + ${N(L / b)}${X} = ${N(L * r)}.`, `Combine: ${N(L / a + L / b)}${X} = ${N(L * r)}.`, `Divide: <b>${X} = ${N(x)}</b>.`] };
      }
      const a = rng.int(2, 9), b = rng.nz(-9, 9); let c = rng.nz(-9, 9); if (c === b) c = -b;
      return { prompt: `In the equation below, ${K} is a constant. For what value of ${K} does the equation have no solution?${big(`${M.poly([a, b])} = ${K}${X} ${M.signed(c)}`)}`, type: 'number', answer: a, params: { kind, a, b, c },
        hints: [`Subtract ${K}${X} and ${N(b)} from both sides: (${a} − ${K})${X} = ${N(c - b)}.`, `If ${a} − ${K} = 0, the left side is 0 but the right side is ${N(c - b)}, so nothing works.`, `No solution when <b>${K} = ${a}</b>.`] };
    },
    verify(q) {
      const P = q.params, x = q.answer;
      if (P.kind === 'solve') return P.a * (x + P.b) === P.c * x + P.d;
      if (P.kind === 'expr') { const xv = (P.r - P.b) / P.a; return near(P.k * P.a * xv + P.k * P.b, x, 1e-9); }
      if (P.kind === 'frac') return near(x / P.a + x / P.b, P.r, 1e-9);
      // no solution: the x-terms vanish and the constants disagree; any other k gives exactly one solution
      return P.a - x === 0 && P.b !== P.c;
    },
  });

  const MODELS = [
    { say: (m, b) => `A plumber charges ${V('C')} = ${m}${V('h')} + ${b} dollars for a job that takes ${V('h')} hours.`, ms: [45, 60, 75, 90], bs: [50, 65, 80, 95],
      slope: 'The extra charge for each hour of work', icpt: 'A fixed charge that every job includes', one: 'The total charge for a job of one hour', count: 'The number of hours a typical job takes' },
    { say: (m, b, n) => `${n}'s savings, in dollars, ${V('w')} weeks after starting a summer job are ${V('S')} = ${m}${V('w')} + ${b}.`, ms: [25, 30, 35, 40], bs: [120, 140, 160, 180],
      slope: 'The amount added to the savings each week', icpt: 'The amount saved before the job started', one: 'The total amount saved after one week', count: 'The number of weeks the job lasts' },
    { say: (m, b) => `A monthly phone bill is ${V('C')} = ${m}${V('g')} + ${b} dollars when ${V('g')} gigabytes of data are used.`, ms: [4, 5, 6, 8], bs: [20, 25, 30, 35],
      slope: 'The extra charge for each gigabyte used', icpt: 'The charge for a month with no data used', one: 'The bill for a month using one gigabyte', count: 'The number of gigabytes used each month' },
    { say: (m, b) => `The number of pages left to read in a book after ${V('d')} days of reading is ${V('P')} = ${b} − ${m}${V('d')}.`, ms: [12, 15, 18, 25], bs: [240, 300, 360, 420],
      slope: 'The number of pages read each day', icpt: 'The number of pages in the whole book', one: 'The pages left after one day of reading', count: 'The number of days it takes to finish' },
  ];
  A.skill({
    id: 'sat.linear-models', title: 'Linear models in context',
    learn: p(`In a linear model such as ${V('C')} = 45${V('h')} + 80, <b>the slope (here 45) is the rate</b>: how much the output changes for each 1-unit increase in the input. <b>The constant (80) is the starting value</b>: the output when the input is 0.`) +
      p(`To find the rate from two data points, divide the change in output by the change in input. Then the starting value is any output minus rate × input.`) +
      example('Example', `A taxi ride of 3 miles costs $8.25 and a ride of 7 miles costs $15.25. The rate is (15.25 − 8.25) ÷ (7 − 3) = <b>$1.75 per mile</b>, and the starting fee is 8.25 − 1.75 × 3 = <b>$3</b>.`),
    make(rng) {
      const kind = rng.pick(['meaning', 'meaning', 'drain', 'points']);
      if (kind === 'meaning') {
        const c = rng.int(0, MODELS.length - 1), ctx = MODELS[c], m = rng.pick(ctx.ms), b = rng.pick(ctx.bs), ask = rng.pick(['slope', 'icpt']);
        const answer = ctx[ask];
        return { prompt: `${ctx.say(m, b, rng.pick(NAMES))} What does the number ${ask === 'slope' ? m : b} represent?`, type: 'choice', answer, choices: [ctx.slope, ctx.icpt, ctx.one, ctx.count], params: { kind, c, ask },
          hints: [ask === 'slope' ? `${m} multiplies the input, so it is the rate: the change for each one-unit step.` : `${b} is the value when the input is 0: the starting amount.`, `So it is <b>${answer.toLowerCase()}</b>.`] };
      }
      if (kind === 'drain') {
        const r = rng.pick([4, 5, 6, 8, 12, 15]), t = rng.int(5, 40), v0 = r * t + rng.int(2, 20) * 10, vt = v0 - r * t;
        return { prompt: `A tank holds ${N(v0)} gallons of water and drains at a constant rate of ${r} gallons per minute. After how many minutes will it hold ${N(vt)} gallons?`, type: 'number', answer: t, unit: 'min', params: { kind, r, v0, vt },
          hints: [`The amount is ${V('W')} = ${N(v0)} − ${r}${V('t')}. Set it equal to ${N(vt)}.`, `${r}${V('t')} = ${N(v0)} − ${N(vt)} = ${N(v0 - vt)}.`, `${V('t')} = ${N(v0 - vt)} ÷ ${r} = <b>${t}</b> minutes.`] };
      }
      const f = rng.pick([2.5, 3, 3.25, 3.5, 4]), rate = rng.pick([1.25, 1.5, 1.75, 2, 2.25, 2.4]), m1 = rng.int(2, 6), m2 = m1 + rng.int(3, 9);
      const c1 = r2(f + rate * m1), c2 = r2(f + rate * m2), ask = rng.pick(['rate', 'fee']), ans = ask === 'rate' ? rate : f;
      return { prompt: `A taxi charges a starting fee plus a fixed amount per mile. ${an(m1) === 'an' ? 'An' : 'A'} ${m1}-mile ride costs ${money(c1)} and ${an(m2)} ${m2}-mile ride costs ${money(c2)}. What is the ${ask === 'rate' ? 'charge per mile' : 'starting fee'}, in dollars?`, type: 'number', answer: ans, unit: '$', params: { kind, m1, m2, c1, c2, ask },
        hints: [`Rate = change in cost ÷ change in miles = (${N(c2)} − ${N(c1)}) ÷ (${m2} − ${m1}) = ${N(rate)}.`, ask === 'rate' ? `The charge per mile is <b>${money(rate)}</b>.` : `Fee = ${N(c1)} − ${N(rate)} × ${m1} = <b>${money(f)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'meaning') return q.answer === MODELS[P.c][P.ask];
      if (P.kind === 'drain') { let w = P.v0, t = 0; while (w > P.vt) { w -= P.r; t++; } return w === P.vt && t === q.answer; }
      // Cramer's rule on fee + rate·m = cost
      const det = P.m2 - P.m1, rate = (P.c2 - P.c1) / det, fee = (P.m2 * P.c1 - P.m1 * P.c2) / det;
      return near(P.ask === 'rate' ? rate : fee, q.answer, 1e-6);
    },
  });

  A.skill({
    id: 'sat.systems', title: 'Systems of linear equations',
    learn: p(`To solve two linear equations together, <b>eliminate one variable</b>: multiply the equations so one variable has opposite (or equal) coefficients, then add (or subtract). Solve for the other variable and substitute back.`) +
      p(`A system has <b>no solution</b> when the lines are parallel: the ${X}- and ${Y}-coefficients are in the same ratio but the constants aren't. It has <b>infinitely many</b> when everything is in the same ratio (the same line).`) +
      example('Example', `${two(2, 3)} = 12 and ${two(1, -1)} = 1. Multiply the second by 3 and add: 5${X} = 15, so ${X} = 3, and then ${Y} = 2.`),
    make(rng) {
      const kind = rng.pick(['solve', 'solve', 'combo', 'none', 'tickets']);
      if (kind === 'solve' || kind === 'combo') {
        const x = rng.int(-6, 9), y = rng.int(-6, 9);
        let a, b, c, d; do { a = rng.nz(-5, 6); b = rng.nz(-5, 6); c = rng.nz(-5, 6); d = rng.nz(-5, 6); } while (a * d - b * c === 0);
        const e = a * x + b * y, f = c * x + d * y, ask = kind === 'solve' ? rng.pick(['x', 'y']) : rng.pick(['sum', 'diff']);
        const ans = { x, y, sum: x + y, diff: x - y }[ask], what = { x: X, y: Y, sum: `${X} + ${Y}`, diff: `${X} − ${Y}` }[ask];
        return { prompt: `If (${X}, ${Y}) is the solution to the system below, what is the value of ${what}?${big(`${two(a, b)} = ${N(e)}<br>${two(c, d)} = ${N(f)}`)}`, type: 'number', answer: ans, params: { kind, a, b, c, d, e, f, ask },
          hints: [`Eliminate ${X}: multiply the first equation by ${N(c)} and the second by ${N(a)}, then subtract. That leaves ${N(b * c - a * d)}${Y} = ${N(e * c - f * a)}.`, `So ${Y} = ${N(y)}. Substitute into the first equation to get ${X} = ${N(x)}.`, `${what} = <b>${N(ans)}</b>.`] };
      }
      if (kind === 'none') {
        const a = rng.int(1, 6), b = rng.nz(-5, 6), e = rng.int(-9, 12), m = rng.pick([2, 3, -2, 4]), f = m * e + rng.nz(-6, 6);
        return { prompt: `In the system below, ${K} is a constant. For what value of ${K} does the system have no solution?${big(`${two(a, b)} = ${N(e)}<br>${K}${X} ${m * b < 0 ? '−' : '+'} ${M.term(Math.abs(m * b), 'y')} = ${N(f)}`)}`, type: 'number', answer: m * a, params: { kind, a, b, e, m, f },
          hints: [`No solution means parallel lines: the coefficients must be in the same ratio, but not the constants.`, `The ${Y}-coefficients are ${N(b)} and ${N(m * b)}, a ratio of ${N(m)}. So ${K} must be ${N(m)} × ${a}.`, `<b>${K} = ${N(m * a)}</b> (and ${N(m)} × ${N(e)} = ${N(m * e)} ≠ ${N(f)}, so the lines aren't the same).`] };
      }
      const pa = rng.pick([8, 9, 10, 12, 15]), ps = pa - rng.pick([3, 4, 5]), n = rng.int(80, 240), ad = rng.int(20, n - 20), R = pa * ad + ps * (n - ad);
      return { prompt: `A school play sold ${n} tickets for a total of ${money(R)}. Adult tickets cost ${money(pa)} and student tickets cost ${money(ps)}. How many adult tickets were sold?`, type: 'number', answer: ad, params: { kind, pa, ps, n, R },
        hints: [`Let ${V('a')} be adult tickets and ${V('s')} student tickets: ${V('a')} + ${V('s')} = ${n} and ${pa}${V('a')} + ${ps}${V('s')} = ${N(R)}.`, `Substitute ${V('s')} = ${n} − ${V('a')}: ${pa}${V('a')} + ${ps}(${n} − ${V('a')}) = ${N(R)}, so ${pa - ps}${V('a')} = ${N(R - ps * n)}.`, `<b>${ad}</b> adult tickets.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'tickets') { for (let a = 0; a <= P.n; a++) if (P.pa * a + P.ps * (P.n - a) === P.R) return a === q.answer; return false; }
      if (P.kind === 'none') { const k = q.answer, b2 = P.m * P.b; return P.a * b2 - P.b * k === 0 && P.e * P.m !== P.f; }
      const det = P.a * P.d - P.b * P.c, x = (P.e * P.d - P.b * P.f) / det, y = (P.a * P.f - P.e * P.c) / det;
      return near({ x, y, sum: x + y, diff: x - y }[P.ask], q.answer, 1e-9);
    },
  });

  const INEQ = { gt: '&gt;', ge: '≥', lt: '&lt;', le: '≤' };
  const holds = (op, l, r) => op === 'gt' ? l > r : op === 'ge' ? l >= r : op === 'lt' ? l < r : l <= r;
  A.skill({
    id: 'sat.linear-inequalities', title: 'Linear inequalities',
    learn: p(`Solve an inequality like an equation, with one extra rule: <b>when you multiply or divide both sides by a negative number, flip the inequality sign</b>.`) +
      p(`In a word problem, "at most" means ≤ and "at least" means ≥. When the answer must be a whole number of items, round <b>down</b> to stay within a limit. To check a point against a system of inequalities, substitute it into <b>every</b> inequality.`) +
      example('Example', `−3${X} + 7 ≥ 22 gives −3${X} ≥ 15. Dividing by −3 flips the sign: <b>${X} ≤ −5</b>.`),
    make(rng) {
      const kind = rng.pick(['budget', 'point', 'solve']);
      if (kind === 'budget') {
        const who = rng.pick(NAMES), have = rng.pick([40, 50, 60, 75, 80, 100]), fixed = rng.pick([12, 14, 15, 18, 22]), each = rng.pick([2.25, 3.5, 3.75, 4.25, 4.5, 6.5]);
        const n = Math.floor((have * 100 - fixed * 100) / (each * 100));
        return { prompt: `${who} has ${money(have)} to spend on a ${money(fixed)} backpack and some notebooks that cost ${money(each)} each. Ignoring tax, what is the greatest number of notebooks ${who} can buy?`, type: 'number', answer: n, params: { kind, have, fixed, each },
          hints: [`${N(fixed)} + ${N(each)}${V('n')} ≤ ${N(have)}, so ${N(each)}${V('n')} ≤ ${N(have - fixed)}.`, `${N(have - fixed)} ÷ ${N(each)} ≈ ${N(M.round((have - fixed) / each, 2))}. Round down, since a part of a notebook can't be bought.`, `The greatest number is <b>${n}</b>.`] };
      }
      if (kind === 'point') {
        const o1 = rng.pick(['gt', 'ge']), o2 = rng.pick(['lt', 'le']), pts = [];
        for (let x = -4; x <= 4; x++) for (let y = -8; y <= 8; y++) pts.push([x, y]);
        let m1, b1, m2, b2, good, bad;
        do {
          m1 = rng.nz(-3, 3); b1 = rng.int(-4, 4); m2 = rng.nz(-3, 3); b2 = rng.int(-2, 6);
          const ok = (x, y) => holds(o1, y, m1 * x + b1) && holds(o2, y, m2 * x + b2);
          // the wrong points each pass one inequality and fail the other: the tempting kind
          good = rng.shuffle(pts.filter(([x, y]) => ok(x, y)));
          bad = rng.shuffle(pts.filter(([x, y]) => !ok(x, y) && (holds(o1, y, m1 * x + b1) || holds(o2, y, m2 * x + b2))));
        } while (!good.length || bad.length < 3);
        const chosen = [good[0]].concat(bad.slice(0, 3)), answer = M.pt(...good[0]);
        return { prompt: `Which point (${X}, ${Y}) is a solution to the system of inequalities?${big(`${Y} ${INEQ[o1]} ${M.poly([m1, b1])}<br>${Y} ${INEQ[o2]} ${M.poly([m2, b2])}`)}`, type: 'choice', answer, choices: chosen.map(c => M.pt(...c)), params: { kind, m1, b1, m2, b2, o1, o2, pts: chosen },
          hints: [`Substitute each point into both inequalities; it has to make both true.`, `For ${answer}: ${N(good[0][1])} ${INEQ[o1]} ${N(m1 * good[0][0] + b1)} and ${N(good[0][1])} ${INEQ[o2]} ${N(m2 * good[0][0] + b2)}, both true. So <b>${answer}</b>.`] };
      }
      const k = rng.nz(-8, 8), a = rng.nz(-6, 6), b = rng.int(-12, 12), c = a * k + b, op = rng.pick(['ge', 'le', 'gt', 'lt']);
      const flip = { ge: 'le', le: 'ge', gt: 'lt', lt: 'gt' }, res = a < 0 ? flip[op] : op;
      const ch = o => `${X} ${INEQ[o]} ${N(k)}`, chn = o => `${X} ${INEQ[o]} ${N(-k)}`, answer = ch(res);
      return { prompt: `Which describes all the solutions of the inequality?${big(`${M.poly([a, b])} ${INEQ[op]} ${N(c)}`)}`, type: 'choice', answer, choices: [answer, ch(flip[res]), chn(res), chn(flip[res])], params: { kind, a, b, c, op },
        hints: [`Subtract ${N(b)}: ${M.term(a, 'x')} ${INEQ[op]} ${N(c - b)}.`, a < 0 ? `Divide by ${N(a)}, a negative number, so flip the sign: <b>${answer}</b>.` : `Divide by ${a}: <b>${answer}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'budget') { let n = 0; while (P.fixed + (n + 1) * P.each <= P.have + 1e-9) n++; return n === q.answer; }
      if (P.kind === 'point') {
        const ok = ([x, y]) => holds(P.o1, y, P.m1 * x + P.b1) && holds(P.o2, y, P.m2 * x + P.b2);
        const goods = P.pts.filter(ok);
        return goods.length === 1 && q.answer === M.pt(...goods[0]);
      }
      // test the boundary and the numbers on either side of it in the original inequality
      const m = A.stripTags(q.answer).match(/(&gt;|&lt;|≥|≤|>|<)\s*(−?\d+)/), k = Number(m[2].replace('−', '-')), op = m[1];
      const orig = x => holds(P.op, P.a * x + P.b, P.c);
      const claim = x => op === '≥' ? x >= k : op === '≤' ? x <= k : /gt|>/.test(op) ? x > k : x < k;
      return [k - 1.5, k - 1, k - 0.5, k, k + 0.5, k + 1, k + 1.5].every(x => orig(x) === claim(x));
    },
  });

  A.skill({
    id: 'sat.lines', title: 'Slopes and intercepts of lines',
    learn: p(`The slope through (${V('x')}<sub>1</sub>, ${V('y')}<sub>1</sub>) and (${V('x')}<sub>2</sub>, ${V('y')}<sub>2</sub>) is <b>(${V('y')}<sub>2</sub> − ${V('y')}<sub>1</sub>) ÷ (${V('x')}<sub>2</sub> − ${V('x')}<sub>1</sub>)</b>. In ${Y} = ${V('m')}${X} + ${V('b')}, ${V('m')} is the slope and ${V('b')} is the ${Y}-intercept.`) +
      p(`For a line written as ${V('a')}${X} + ${V('b')}${Y} = ${V('c')}, the slope is −${V('a')} ÷ ${V('b')}. <b>Parallel lines have equal slopes; perpendicular slopes are negative reciprocals</b> (2 and −${F(1, 2)}). The ${X}-intercept is where ${Y} = 0.`) +
      example('Example', `For 3${X} − 2${Y} = 7, the slope is −3 ÷ (−2) = ${F(3, 2)}. A perpendicular line has slope −${F(2, 3)}.`),
    make(rng) {
      const kind = rng.pick(['two-points', 'parallel', 'x-intercept', 'through']);
      if (kind === 'two-points') {
        const x1 = rng.int(-6, 6), y1 = rng.int(-6, 6); let x2 = rng.int(-6, 8); if (x2 === x1) x2 = x1 + rng.pick([2, 3, -4]); const y2 = rng.int(-8, 8);
        const ans = fa(y2 - y1, x2 - x1);
        return { prompt: `A line passes through the points ${M.pt(x1, y1)} and ${M.pt(x2, y2)}. What is the slope of the line?`, type: 'number', ...ans, params: { kind, x1, y1, x2, y2 },
          hints: [`Slope = (${N(y2)} − ${y1 < 0 ? `(${N(y1)})` : N(y1)}) ÷ (${N(x2)} − ${x1 < 0 ? `(${N(x1)})` : N(x1)}) = ${N(y2 - y1)} ÷ ${N(x2 - x1)}.`, `The slope is <b>${ans.answerText || N(ans.answer)}</b>.`] };
      }
      if (kind === 'parallel') {
        const a = rng.nz(-6, 6), b = rng.nz(-6, 6), c = rng.int(-12, 12), perp = rng.bool();
        const ans = perp ? fa(b, a) : fa(-a, b);
        return { prompt: `Line ${V('ℓ')} is ${perp ? 'perpendicular' : 'parallel'} to the line ${two(a, b)} = ${N(c)}. What is the slope of line ${V('ℓ')}?`, type: 'number', ...ans, params: { kind, a, b, c, perp },
          hints: [`Solve for ${Y} (or use −${V('a')} ÷ ${V('b')}): the given line has slope ${ft(-a, b)}.`, perp ? `A perpendicular slope is the negative reciprocal: <b>${ans.answerText || N(ans.answer)}</b>.` : `A parallel line has the same slope: <b>${ans.answerText || N(ans.answer)}</b>.`] };
      }
      if (kind === 'x-intercept') {
        const m = rng.nz(-6, 6), b = rng.nz(-12, 12), ans = fa(-b, m);
        return { prompt: `At what value of ${X} does the graph of ${Y} = ${M.poly([m, b])} cross the ${X}-axis?`, type: 'number', ...ans, params: { kind, m, b },
          hints: [`On the ${X}-axis, ${Y} = 0: ${M.poly([m, b])} = 0.`, `${M.term(m, 'x')} = ${N(-b)}, so <b>${X} = ${ans.answerText || N(ans.answer)}</b>.`] };
      }
      const m = rng.nz(-5, 5), d = rng.pick([1, 1, 2, 3]), x1 = d * rng.nz(-4, 4), y1 = rng.int(-9, 9), b = y1 - m * x1 / d, ans = fa(y1 * d - m * x1, d);
      return { prompt: `A line has slope ${d === 1 ? N(m) : F(m, d)} and passes through ${M.pt(x1, y1)}. What is its ${Y}-intercept?`, type: 'number', ...ans, params: { kind, m: m / d, x1, y1 },
        hints: [`Use ${Y} = ${V('m')}${X} + ${V('b')} with the point: ${N(y1)} = ${d === 1 ? N(m) : ft(m, d)} × ${x1 < 0 ? `(${N(x1)})` : N(x1)} + ${V('b')}.`, `${N(y1)} = ${N(m * x1 / d)} + ${V('b')}, so <b>${V('b')} = ${ans.answerText || N(b)}</b>.`] };
    },
    verify(q) {
      const P = q.params, v = q.answer;
      if (P.kind === 'two-points') return near(P.y1 + v * (P.x2 - P.x1), P.y2, 1e-9);
      if (P.kind === 'parallel') { const s = ((P.c - P.a) / P.b) - (P.c / P.b); return P.perp ? near(s * v, -1, 1e-9) : near(s, v, 1e-9); }
      if (P.kind === 'x-intercept') return near(P.m * v + P.b, 0, 1e-9);
      return near(P.m * P.x1 + v, P.y1, 1e-9);
    },
  });

  /* ---------- Unit 2: advanced math ---------- */
  const fac = r => r === 0 ? X : `(${M.poly([1, -r])})`;
  const fx = s => `${V('f')}(${s})`, gx = s => `${V('g')}(${s})`;
  A.skill({
    id: 'sat.quadratics', title: 'Quadratic equations',
    learn: p(`To solve ${V('a')}${M.sup(X, 2)} + ${V('b')}${X} + ${V('c')} = 0, <b>factor</b> when you can, or use the quadratic formula. Two shortcuts save time: <b>the solutions add to −${V('b')} ÷ ${V('a')} and multiply to ${V('c')} ÷ ${V('a')}</b>.`) +
      p(`<b>The discriminant ${M.sup(V('b'), 2)} − 4${V('a')}${V('c')}</b> counts the real solutions: positive means two, zero means one, negative means none. The vertex of a parabola is at ${X} = −${V('b')} ÷ 2${V('a')}; its ${Y}-value there is the minimum (if ${V('a')} &gt; 0) or the maximum (if ${V('a')} &lt; 0).`) +
      example('Example', `${M.poly([1, -2, -15])} = 0 factors as (${X} − 5)(${X} + 3) = 0, so ${X} = 5 or ${X} = −3. Their sum is 2, which is −(−2) ÷ 1.`),
    make(rng) {
      const kind = rng.pick(['roots', 'roots', 'count', 'vertex']);
      if (kind === 'roots') {
        let r1, r2; do { r1 = rng.int(-9, 9); r2 = rng.int(-9, 9); } while (r1 === r2);
        const a = rng.pick([1, 1, 1, 2, 3]), co = [a, -a * (r1 + r2), a * r1 * r2];
        const mixedSigns = r1 * r2 < 0, ask = rng.pick(['sum', 'product', mixedSigns ? 'positive' : 'greater']);
        const ans = { sum: r1 + r2, product: r1 * r2, positive: Math.max(r1, r2), greater: Math.max(r1, r2) }[ask];
        const what = { sum: 'sum of the solutions', product: 'product of the solutions', positive: 'positive solution', greater: 'greater solution' }[ask];
        return { prompt: `What is the ${what} of the equation below?${big(`${M.poly(co)} = 0`)}`, type: 'number', answer: ans, params: { kind, co, ask },
          hints: [`Factor: ${a === 1 ? '' : a}${fac(r1)}${fac(r2)} = 0.`, `So ${X} = ${N(r1)} or ${X} = ${N(r2)}.`, `The ${what} is <b>${N(ans)}</b>.`] };
      }
      if (kind === 'count') {
        const a = rng.pick([1, 2, -1, 3, -2]), h = rng.int(-5, 5), k = rng.pick([-8, -3, -1, 0, 1, 2, 5, 9]), co = [a, -2 * a * h, a * h * h + k];
        const n = a * k < 0 ? 2 : k === 0 ? 1 : 0, disc = co[1] * co[1] - 4 * co[0] * co[2];
        return { prompt: `How many distinct real solutions does the equation below have?${big(`${M.poly(co)} = 0`)}`, type: 'choice', keepOrder: true, answer: String(n), choices: ['0', '1', '2', 'Infinitely many'], params: { kind, co },
          hints: [`Find the discriminant: ${M.sup(V('b'), 2)} − 4${V('a')}${V('c')} = ${co[1] < 0 ? `(${N(co[1])})` : N(co[1])}² − 4(${N(co[0])})(${N(co[2])}) = ${N(disc)}.`, `It is ${disc > 0 ? 'positive, so there are' : disc === 0 ? 'zero, so there is' : 'negative, so there are'} <b>${n}</b> real solution${n === 1 ? '' : 's'}.`] };
      }
      const a = rng.pick([1, 2, 3, -1, -2]), h = rng.int(-6, 6), k = rng.int(-12, 12), co = [a, -2 * a * h, a * h * h + k], ask = rng.pick(['extreme', 'x']);
      const word = a > 0 ? 'minimum' : 'maximum', ans = ask === 'x' ? h : k;
      return { prompt: `For the function ${V('f')}(${X}) = ${M.poly(co)}, what is ${ask === 'x' ? `the value of ${X} where ${V('f')} reaches its ${word}` : `the ${word} value of ${V('f')}(${X})`}?`, type: 'number', answer: ans, params: { kind, co, ask },
        hints: [`The vertex is at ${X} = −${V('b')} ÷ 2${V('a')} = ${N(-co[1])} ÷ ${N(2 * a)} = ${N(h)}.`, ask === 'x' ? `So the ${word} is at <b>${X} = ${N(h)}</b>.` : `${fx(N(h))} = ${N(k)}, so the ${word} value is <b>${N(k)}</b>.`] };
    },
    verify(q) {
      const P = q.params, [a, b, c] = P.co, f = x => a * x * x + b * x + c;
      if (P.kind === 'roots') {
        const d = Math.sqrt(b * b - 4 * a * c), x1 = (-b - d) / (2 * a), x2 = (-b + d) / (2 * a);
        const got = { sum: x1 + x2, product: x1 * x2, positive: Math.max(x1, x2), greater: Math.max(x1, x2) }[P.ask];
        return (P.ask !== 'positive' || Math.min(x1, x2) < 0) && near(got, q.answer, 1e-9);
      }
      if (P.kind === 'count') { const top = f(-b / (2 * a)); return q.answer === String(Math.abs(top) < 1e-12 ? 1 : top * a < 0 ? 2 : 0); }
      // scan a grid of x-values for the extreme
      let best = -20; for (let x = -20; x <= 20; x += 0.25) if (a > 0 ? f(x) < f(best) : f(x) > f(best)) best = x;
      return near(P.ask === 'x' ? best : f(best), q.answer, 1e-6);
    },
  });

  const root = (n, inner) => (n === 2 ? '' : `<sup>${n}</sup>`) + M.sqrt(inner);
  const xp = e => e === 1 ? X : M.sup(X, e);
  A.skill({
    id: 'sat.exponents-radicals', title: 'Exponents and radicals',
    learn: p(`The exponent rules: ${M.sup(X, 'a')} · ${M.sup(X, 'b')} = ${M.sup(X, `${V('a')} + ${V('b')}`)}, ${M.sup(X, 'a')} ÷ ${M.sup(X, 'b')} = ${M.sup(X, `${V('a')} − ${V('b')}`)}, and (${M.sup(X, 'a')})<sup>${V('b')}</sup> = ${M.sup(X, V('a') + V('b'))}. <b>A fractional exponent is a root</b>: ${M.sup(X, `${V('m')}/${V('n')}`)} is the ${V('n')}th root of ${M.sup(X, V('m'))}.`) +
      p(`To solve an equation like 4<sup>${X}</sup> = 8<sup>${X} − 1</sup>, <b>write both sides as powers of the same base</b>, then set the exponents equal: 2<sup>2${X}</sup> = 2<sup>3${X} − 3</sup>, so 2${X} = 3${X} − 3 and ${X} = 3.`) +
      example('Example', `${M.sup(X, '3/4')} = ${root(4, M.sup(X, 3))}, and (${M.sup(X, 2)})<sup>3</sup> · ${M.sup(X, 4)} = ${M.sup(X, 10)}.`),
    make(rng) {
      const kind = rng.pick(['rational', 'solve', 'rules']);
      if (kind === 'rational') {
        let pp, qq; do { qq = rng.pick([2, 3, 4, 5]); pp = rng.int(2, 7); } while (gcd(pp, qq) !== 1);
        const specs = [['root', qq, pp], ['root', pp, qq], ['mul', pp, qq], ['div', pp, qq]];
        const show = ([t, a, b]) => t === 'root' ? root(a, xp(b)) : t === 'mul' ? `${a}${root(b, X)}` : `${F(xp(a), b)}`;
        const choices = specs.map(show), answer = choices[0];
        return { prompt: `Which expression is equivalent to ${M.sup(X, `${pp}/${qq}`)}, where ${X} &gt; 0?`, type: 'choice', answer, choices, params: { kind, pp, qq, specs, shown: choices.slice() },
          hints: [`In ${M.sup(X, `${V('m')}/${V('n')}`)}, the denominator ${V('n')} is the root and the numerator ${V('m')} is the power.`, `So ${M.sup(X, `${pp}/${qq}`)} = <b>${answer}</b>, the ${{ 2: 'square', 3: 'cube', 4: 'fourth', 5: 'fifth' }[qq]} root of ${xp(pp)}.`] };
      }
      if (kind === 'solve') {
        const b = rng.pick([2, 3, 5]), [m, n] = rng.pick([[1, 2], [2, 3], [1, 3], [2, 1], [3, 2], [3, 1]]), c = rng.nz(-4, 4) * Math.abs(n - m), x = n * c / (n - m);
        const L = b ** m, R = b ** n;
        return { prompt: `What value of ${X} satisfies the equation?${big(`${L}<sup>${X}</sup> = ${R}<sup>${M.poly([1, -c])}</sup>`)}`, type: 'number', answer: x, params: { kind, L, R, c },
          hints: [`Write both sides as powers of ${b}: ${b}<sup>${m === 1 ? '' : m}${X}</sup> = ${b}<sup>${n === 1 ? M.poly([1, -c]) : `${n}(${M.poly([1, -c])})`}</sup>.`, `Set the exponents equal: ${M.term(m, 'x')} = ${M.poly([n, -n * c])}.`, `So <b>${X} = ${N(x)}</b>.`] };
      }
      const a = rng.int(2, 5), b = rng.int(2, 4), c = rng.int(1, 9), d = rng.int(1, 9), n = a * b + c - d;
      return { prompt: `If the expression below equals ${M.sup(X, V('n'))} for all ${X} &gt; 0, what is the value of ${V('n')}?${big(`${F(`(${xp(a)})<sup>${b}</sup> · ${xp(c)}`, xp(d))}`)}`, type: 'number', answer: n, params: { kind, a, b, c, d },
        hints: [`A power of a power multiplies: (${xp(a)})<sup>${b}</sup> = ${xp(a * b)}.`, `Multiplying adds exponents and dividing subtracts them: ${a * b} + ${c} − ${d}.`, `<b>${V('n')} = ${N(n)}</b>.`] };
    },
    verify(q) {
      const P = q.params, x = 1.37, L = Math.log;
      if (P.kind === 'rational') {
        const val = ([t, a, b]) => t === 'root' ? Math.pow(Math.pow(x, b), 1 / a) : t === 'mul' ? a * Math.pow(x, 1 / b) : Math.pow(x, a) / b;
        const target = Math.pow(x, P.pp / P.qq), hit = P.specs.map(sp => near(val(sp), target, 1e-9));
        return hit.filter(Boolean).length === 1 && A.fixAngles(P.shown[hit.indexOf(true)]) === q.answer;
      }
      if (P.kind === 'solve') return near(q.answer * L(P.L), (q.answer - P.c) * L(P.R), 1e-9);
      return near(L(Math.pow(Math.pow(x, P.a), P.b) * Math.pow(x, P.c) / Math.pow(x, P.d)) / L(x), q.answer, 1e-9);
    },
  });

  A.skill({
    id: 'sat.functions', title: 'Function notation and composition',
    learn: p(`${fx(X)} names the output of ${V('f')} for the input ${X}. To find ${fx(V('a'))}, <b>replace every ${X} with ${V('a')}</b>, using parentheses, especially for negative numbers.`) +
      p(`<b>A composition ${fx(gx(X))} works from the inside out</b>: find ${gx(X)} first, then put that result into ${V('f')}. For a linear function, two input–output pairs give the slope and then the whole rule.`) +
      example('Example', `${fx(X)} = 2${X} + 1 and ${gx(X)} = ${M.sup(X, 2)} − 3. Then ${gx('−2')} = 4 − 3 = 1, and ${fx(gx('−2'))} = ${fx('1')} = <b>3</b>.`),
    make(rng) {
      const kind = rng.pick(['evaluate', 'compose', 'two-values', 'shift']);
      if (kind === 'evaluate') {
        const co = [rng.nz(-4, 4), rng.int(-9, 9), rng.int(-12, 12)], k = rng.nz(-5, 5), val = co[0] * k * k + co[1] * k + co[2];
        return { prompt: `The function ${V('f')} is defined by ${fx(X)} = ${M.poly(co)}. What is the value of ${fx(N(k))}?`, type: 'number', answer: val, params: { kind, co, k },
          hints: [`Replace ${X} with ${k < 0 ? `(${N(k)})` : N(k)}: ${N(co[0])}(${N(k)})² ${M.signed(co[1])}(${N(k)}) ${M.signed(co[2])}.`, `= ${N(co[0] * k * k)} ${M.signed(co[1] * k)} ${M.signed(co[2])} = <b>${N(val)}</b>.`] };
      }
      if (kind === 'compose') {
        const m = rng.nz(-4, 5), b = rng.int(-8, 8), c = rng.int(-6, 6), k = rng.int(-4, 4), order = rng.pick(['fg', 'gf']);
        const f = x => m * x + b, g = x => x * x + c, inner = order === 'fg' ? g(k) : f(k), val = order === 'fg' ? f(inner) : g(inner);
        const outerName = order === 'fg' ? 'f' : 'g', innerName = order === 'fg' ? 'g' : 'f';
        return { prompt: `If ${fx(X)} = ${M.poly([m, b])} and ${gx(X)} = ${M.poly([1, 0, c])}, what is the value of ${V(outerName)}(${V(innerName)}(${N(k)}))?`, type: 'number', answer: val, params: { kind, m, b, c, k, order },
          hints: [`Inside first: ${V(innerName)}(${N(k)}) = ${N(inner)}.`, `Then ${V(outerName)}(${N(inner)}) = <b>${N(val)}</b>.`] };
      }
      if (kind === 'two-values') {
        const m = rng.nz(-5, 6), b = rng.int(-10, 10), x1 = rng.int(-3, 4), x2 = x1 + rng.int(2, 6), t = rng.int(-6, 12);
        return { prompt: `For a linear function ${V('f')}, ${fx(N(x1))} = ${N(m * x1 + b)} and ${fx(N(x2))} = ${N(m * x2 + b)}. What is the value of ${fx(N(t))}?`, type: 'number', answer: m * t + b, params: { kind, x1, y1: m * x1 + b, x2, y2: m * x2 + b, t },
          hints: [`Slope = (${N(m * x2 + b)} − ${N(m * x1 + b)}) ÷ (${N(x2)} − ${N(x1)}) = ${N(m)}.`, `${fx(X)} = ${M.poly([m, b])}, since ${fx(N(x1))} = ${N(m)}(${N(x1)}) + ${V('b')} gives ${V('b')} = ${N(b)}.`, `${fx(N(t))} = <b>${N(m * t + b)}</b>.`] };
      }
      const m = rng.nz(-6, 7), b = rng.int(-9, 9), h = rng.nz(-4, 5);
      return { prompt: `The function ${V('f')} is defined by ${fx(X)} = ${M.poly([m, b])}. What is the value of ${fx(M.poly([1, h]))} − ${fx(X)}?`, type: 'number', answer: m * h, params: { kind, m, b, h },
        hints: [`${fx(M.poly([1, h]))} = ${N(m)}(${M.poly([1, h])}) ${M.signed(b)} = ${M.poly([m, m * h + b])}.`, `Subtract ${fx(X)} = ${M.poly([m, b])}: everything cancels except <b>${N(m * h)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'evaluate') return P.co.reduce((s, c) => s * P.k + c, 0) === q.answer;
      if (P.kind === 'compose') { const f = x => P.m * x + P.b, g = x => x * x + P.c; return (P.order === 'fg' ? f(g(P.k)) : g(f(P.k))) === q.answer; }
      if (P.kind === 'two-values') { const s = (P.y2 - P.y1) / (P.x2 - P.x1); return near(P.y1 + s * (P.t - P.x1), q.answer, 1e-9); }
      const f = x => P.m * x + P.b; return [0.3, 2.7, -5.1].every(x => near(f(x + P.h) - f(x), q.answer, 1e-9));
    },
  });

  const GROW = [
    { thing: 'population of a town', short: 'population', unit: 'people', per: 'year', t: 't', start: [1200, 4500, 8000, 15000] },
    { thing: 'value of a used car, in dollars,', short: 'car’s value', unit: 'dollars', per: 'year', t: 't', start: [18000, 24000, 32000] },
    { thing: 'number of bacteria in a sample', short: 'number of bacteria', unit: 'bacteria', per: 'hour', t: 'h', start: [500, 800, 2000] },
    { thing: 'number of members of an online club', short: 'number of members', unit: 'members', per: 'month', t: 'm', start: [300, 640, 900] },
  ];
  A.skill({
    id: 'sat.exponential-models', title: 'Exponential growth and decay',
    learn: p(`In ${V('y')} = ${V('a')}(${V('b')})<sup>${V('t')}</sup>, ${V('a')} is the starting amount and ${V('b')} is the growth factor. <b>If ${V('b')} = 1 + ${V('r')}, the amount grows by ${V('r')} (as a percent) each period; if ${V('b')} = 1 − ${V('r')}, it shrinks by ${V('r')}.</b> So 1.06 means up 6% each period, and 0.85 means down 15%.`) +
      p(`Exponential change multiplies by the same factor each period, while linear change adds the same amount. A <b>half-life</b> is the time for an amount to fall to half: after ${V('k')} half-lives, ${F(1, M.sup(2, V('k')))} of it is left.`) +
      example('Example', `${V('P')} = 4,500(0.92)<sup>${V('t')}</sup> decreases by 8% per year. A 64 mg sample with a 5-hour half-life has 64 → 32 → 16 → <b>8 mg</b> left after 15 hours.`),
    make(rng) {
      const kind = rng.pick(['interpret', 'interpret', 'build', 'compute', 'half-life']);
      if (kind === 'interpret' || kind === 'build') {
        const c = rng.int(0, GROW.length - 1), ctx = GROW[c], up = c === 1 ? false : rng.bool(), r = rng.pick([2, 3, 4, 5, 6, 8, 12, 15, 20, 25]), b = up ? 1 + r / 100 : 1 - r / 100, a = rng.pick(ctx.start), T = V(ctx.t);
        if (kind === 'interpret') {
          const dir = up ? 'increases' : 'decreases', oth = up ? 'decreases' : 'increases', answer = `It ${dir} by ${r}% each ${ctx.per}`;
          const choices = [answer, `It ${oth} by ${r}% each ${ctx.per}`, up ? `It ${dir} by ${N(b)}% each ${ctx.per}` : `It ${dir} by ${100 - r}% each ${ctx.per}`, `It ${dir} by ${r} ${ctx.unit} each ${ctx.per}`];
          return { prompt: `The ${ctx.thing} is modeled by ${V('f')}(${T}) = ${N(a)}(${N(b)})<sup>${T}</sup>, where ${T} is the number of ${ctx.per}s from now. Which statement best describes how the ${ctx.short} changes?`, type: 'choice', answer, choices, params: { kind, b, per: ctx.per },
            hints: [`The factor ${N(b)} is ${up ? `1 + ${N(r / 100)}` : `1 − ${N(r / 100)}`}.`, `Each ${ctx.per} the amount is multiplied by ${N(b)}: <b>${answer.toLowerCase()}</b>.`] };
        }
        const T2 = V('t'), fn = e => `${V('f')}(${T2}) = ${e}`, answer = fn(`${N(a)}(${N(b)})<sup>${T2}</sup>`);
        const choices = [answer, fn(`${N(a)}(${N(r / 100)})<sup>${T2}</sup>`), fn(`${N(a)}(${N(up ? 1 - r / 100 : 1 + r / 100)})<sup>${T2}</sup>`), fn(`${N(a)} ${up ? '+' : '−'} ${N(r / 100)}${T2}`)];
        return { prompt: `The ${ctx.thing.replace(/, in dollars,$/, '')} is ${N(a)} now and ${up ? 'increases' : 'decreases'} by ${r}% each ${ctx.per}. Which function gives the amount ${T2} ${ctx.per}s from now?`, type: 'choice', answer, choices, params: { kind, a, b },
          hints: [`A change of ${r}% each ${ctx.per} multiplies by ${up ? `1 + ${N(r / 100)}` : `1 − ${N(r / 100)}`} = ${N(b)} each time.`, `So <b>${answer}</b>.`] };
      }
      if (kind === 'compute') {
        const P0 = rng.pick([2000, 2500, 4000, 5000, 8000]), r = rng.pick([2, 3, 4, 5, 6]), t = rng.int(2, 5), val = Math.round(P0 * Math.pow(1 + r / 100, t));
        return { prompt: `An investment of ${money(P0)} grows by ${r}% each year. To the nearest dollar, what is it worth after ${t} years?`, type: 'number', answer: val, unit: '$', params: { kind, P0, r, t },
          hints: [`Multiply by 1 + ${N(r / 100)} = ${N(1 + r / 100)} once for each year: ${N(P0)}(${N(1 + r / 100)})<sup>${t}</sup>.`, `= ${N(M.round(P0 * Math.pow(1 + r / 100, t), 4))}, which rounds to <b>${money(val)}</b>.`] };
      }
      const k = rng.int(1, 5), h = rng.pick([3, 4, 5, 6, 8, 10, 12]), A0 = (2 ** k) * rng.int(2, 12), left = A0 / (2 ** k);
      return { prompt: `A substance has a half-life of ${h} hours. A sample starts at ${N(A0)} milligrams. How many milligrams are left after ${h * k} hours?`, type: 'number', answer: left, unit: 'mg', params: { kind, h, A0, t: h * k },
        hints: [`${h * k} hours is ${h * k} ÷ ${h} = ${k} half-li${k === 1 ? 'fe' : 'ves'}.`, `Halve ${N(A0)} ${k === 1 ? 'once' : `${k} times`}: ${N(A0)} ÷ ${2 ** k} = <b>${N(left)}</b> mg.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'interpret') { const pc = M.round(Math.abs(P.b - 1) * 100, 6); return q.answer === `It ${P.b > 1 ? 'increases' : 'decreases'} by ${N(pc)}% each ${P.per}`; }
      if (P.kind === 'build') { const m = A.stripTags(q.answer).match(/\((\d*\.?\d+)\)/); return !!m && near(Number(m[1]), P.b, 1e-9) && A.stripTags(q.answer).includes(N(P.a)); }
      if (P.kind === 'compute') { let v = P.P0; for (let i = 0; i < P.t; i++) v *= 1 + P.r / 100; return Math.abs(v - q.answer) <= 0.5; }
      let m = P.A0, t = 0; while (t < P.t) { m /= 2; t += P.h; } return m === q.answer;
    },
  });

  A.skill({
    id: 'sat.polynomials-rational', title: 'Polynomials and rational equations',
    learn: p(`<b>The remainder theorem:</b> when a polynomial ${V('p')}(${X}) is divided by ${X} − ${V('a')}, the remainder is ${V('p')}(${V('a')}). So ${X} − ${V('a')} is a factor exactly when ${V('p')}(${V('a')}) = 0. The zeros of a factored polynomial come from setting each factor equal to 0.`) +
      p(`To solve an equation with ${X} in a denominator, <b>multiply both sides by the denominators (cross-multiply)</b>, solve, and then check that your answer doesn't make any denominator 0.`) +
      example('Example', `${F(3, `${X} − 2`)} = ${F(5, `${X} + 2`)} gives 3(${X} + 2) = 5(${X} − 2), so 3${X} + 6 = 5${X} − 10 and <b>${X} = 8</b>.`),
    make(rng) {
      const kind = rng.pick(['remainder', 'zeros', 'rational']);
      if (kind === 'remainder') {
        const co = [1, rng.int(-6, 6), rng.int(-9, 9), rng.int(-12, 12)], a = rng.nz(-4, 4), val = co[0] * a ** 3 + co[1] * a * a + co[2] * a + co[3];
        return { prompt: `What is the remainder when ${V('p')}(${X}) = ${M.poly(co)} is divided by ${M.poly([1, -a])}?`, type: 'number', answer: val, params: { kind, co, a },
          hints: [`By the remainder theorem, the remainder is ${V('p')}(${N(a)}).`, `${V('p')}(${N(a)}) = ${N(a ** 3)} ${M.signed(co[1] * a * a)} ${M.signed(co[2] * a)} ${M.signed(co[3])} = <b>${N(val)}</b>.`] };
      }
      if (kind === 'zeros') {
        let r1, r2; do { r1 = rng.int(-7, 7); r2 = rng.int(-7, 7); } while (r1 === r2);
        let c, d; do { c = rng.pick([2, 3, 4, 5]); d = rng.nz(-9, 9); } while (d % c === 0);
        const ask = rng.pick(['sum', 'greatest']), z3 = d / c, sum = fa(r1 * c + r2 * c + d, c);
        const ans = ask === 'sum' ? sum : (Math.max(r1, r2) > z3 ? { answer: Math.max(r1, r2) } : fa(d, c));
        return { prompt: `The polynomial ${V('p')} is defined by ${V('p')}(${X}) = ${fac(r1)}${fac(r2)}(${M.poly([c, -d])}). What is the ${ask === 'sum' ? 'sum of the zeros' : 'greatest zero'} of ${V('p')}?`, type: 'number', ...ans, params: { kind, r1, r2, c, d, ask },
          hints: [`Set each factor equal to 0: ${X} = ${N(r1)}, ${X} = ${N(r2)}, and ${M.poly([c, -d])} = 0 gives ${X} = ${ft(d, c)}.`, ask === 'sum' ? `Add them: ${N(r1)} + ${r2 < 0 ? `(${N(r2)})` : N(r2)} + ${ft(d, c)} = <b>${ans.answerText || N(ans.answer)}</b>.` : `The greatest is <b>${ans.answerText || N(ans.answer)}</b>.`] };
      }
      let x, b, d, u, w; do { x = rng.int(-8, 10); b = rng.int(-6, 6); d = rng.int(-6, 6); u = x - b; w = x + d; } while (!u || !w || u === w || gcd(u, w) > 1 && Math.abs(u / gcd(u, w)) > 9);
      const g = gcd(u, w), t = rng.pick([1, -1, 2]); let a = (u / g) * t, c = (w / g) * t; if (Math.abs(a) > 12 || Math.abs(c) > 12) { a = u / g; c = w / g; }
      return { prompt: `What is the solution to the equation below?${big(`${F(N(a), M.poly([1, -b]))} = ${F(N(c), M.poly([1, d]))}`)}`, type: 'number', answer: x, params: { kind, a, b, c, d },
        hints: [`Cross-multiply: ${N(a)}(${M.poly([1, d])}) = ${N(c)}(${M.poly([1, -b])}).`, `${M.poly([a, a * d])} = ${M.poly([c, -c * b])}, so ${M.term(a - c, 'x')} = ${N(-c * b - a * d)}.`, `<b>${X} = ${N(x)}</b>, which doesn't make either denominator 0.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'remainder') {
        // synthetic division by x − a: the last number is the remainder
        let r = 0; for (const c of P.co) r = r * P.a + c; return r === q.answer;
      }
      if (P.kind === 'zeros') {
        const p = x => (x - P.r1) * (x - P.r2) * (P.c * x - P.d), zs = [P.r1, P.r2, P.d / P.c];
        if (!zs.every(z => near(p(z), 0, 1e-9))) return false;
        return near(P.ask === 'sum' ? zs.reduce((s, z) => s + z, 0) : Math.max(...zs), q.answer, 1e-9);
      }
      const x = q.answer; return x !== P.b && x !== -P.d && near(P.a / (x - P.b), P.c / (x + P.d), 1e-12);
    },
  });

  A.skill({
    id: 'sat.nonlinear-systems', title: 'Systems with a line and a parabola',
    learn: p(`Where a line meets a parabola, their ${Y}-values are equal. <b>Set the two expressions equal</b>, move everything to one side, and solve the quadratic. Each solution ${X} gives an intersection point; find its ${Y} from the line.`) +
      p(`How many intersections? Look at the discriminant of that quadratic: positive means 2 points, zero means 1 (the line just touches), negative means none.`) +
      example('Example', `${Y} = ${M.poly([1, -1, -4])} and ${Y} = ${M.poly([2, 0])}. Then ${M.poly([1, -1, -4])} = 2${X}, so ${M.poly([1, -3, -4])} = 0 = (${X} − 4)(${X} + 1). The points are (4, 8) and (−1, −2).`),
    make(rng) {
      const kind = rng.pick(['count', 'solve', 'solve']);
      if (kind === 'count') {
        const m = rng.int(-4, 4), k = rng.int(-6, 6), h = rng.int(-4, 4), e = rng.pick([-9, -4, -1, 0, 0, 1, 3, 8]), b = m - 2 * h, c = k + h * h + e, n = e < 0 ? 2 : e === 0 ? 1 : 0;
        const disc = (b - m) ** 2 - 4 * (c - k);
        return { prompt: `How many points do the graphs of these two equations have in common?${big(`${Y} = ${M.poly([1, b, c])}<br>${Y} = ${M.poly([m, k])}`)}`, type: 'choice', keepOrder: true, answer: String(n), choices: ['0', '1', '2', 'Infinitely many'], params: { kind, b, c, m, k },
          hints: [`Set them equal and collect terms: ${M.poly([1, b - m, c - k])} = 0.`, `The discriminant is ${N(disc)}, which is ${disc > 0 ? 'positive' : disc === 0 ? 'zero' : 'negative'}: <b>${n}</b> point${n === 1 ? '' : 's'} in common.`] };
      }
      let r1, r2; do { r1 = rng.int(-6, 6); r2 = rng.int(-6, 6); } while (r1 === r2);
      const m = rng.int(-4, 4), k = rng.int(-8, 8), pb = m - (r1 + r2), pc = k + r1 * r2, ask = rng.pick(['xsum', 'ysum', 'xbig']);
      const ans = { xsum: r1 + r2, ysum: m * (r1 + r2) + 2 * k, xbig: Math.max(r1, r2) }[ask];
      const what = { xsum: `${V('x')}<sub>1</sub> + ${V('x')}<sub>2</sub>`, ysum: `${V('y')}<sub>1</sub> + ${V('y')}<sub>2</sub>`, xbig: `the greater of ${V('x')}<sub>1</sub> and ${V('x')}<sub>2</sub>` }[ask];
      return { prompt: `The graphs of the equations below meet at (${V('x')}<sub>1</sub>, ${V('y')}<sub>1</sub>) and (${V('x')}<sub>2</sub>, ${V('y')}<sub>2</sub>). What is ${what}?${big(`${Y} = ${M.poly([1, pb, pc])}<br>${Y} = ${M.poly([m, k])}`)}`, type: 'number', answer: ans, params: { kind, pb, pc, m, k, ask },
        hints: [`Set them equal: ${M.poly([1, pb - m, pc - k])} = 0, which factors as ${fac(r1)}${fac(r2)} = 0.`, `So ${X} = ${N(r1)} or ${X} = ${N(r2)}${ask === 'ysum' ? `, and the line gives ${Y} = ${N(m * r1 + k)} and ${Y} = ${N(m * r2 + k)}` : ''}.`, `${what.charAt(0) === 't' ? 'The answer' : what} is <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'count') { const B = P.b - P.m, C = P.c - P.k, d = B * B - 4 * C; return q.answer === String(d > 0 ? 2 : d === 0 ? 1 : 0); }
      const B = P.pb - P.m, C = P.pc - P.k, s = Math.sqrt(B * B - 4 * C), x1 = (-B - s) / 2, x2 = (-B + s) / 2, y = x => x * x + P.pb * x + P.pc;
      if (!near(y(x1), P.m * x1 + P.k, 1e-9) || !near(y(x2), P.m * x2 + P.k, 1e-9)) return false;
      return near({ xsum: x1 + x2, ysum: y(x1) + y(x2), xbig: Math.max(x1, x2) }[P.ask], q.answer, 1e-9);
    },
  });

  /* ---------- Unit 3: problem solving and data analysis ---------- */
  A.skill({
    id: 'sat.ratios-rates', title: 'Ratios, rates and unit conversions',
    learn: p(`<b>Keep the units in the calculation and cancel them like factors.</b> To change feet per second into miles per hour, multiply by 3,600 seconds per hour and divide by 5,280 feet per mile.`) +
      p(`For a ratio such as 3 : 5, think of the whole as 3 + 5 = 8 equal parts. For a rate, find the amount for one unit first (a unit rate), then scale up.`) +
      example('Example', `30 miles per hour = 30 × 5,280 ÷ 3,600 = <b>44 feet per second</b>. Red and blue marbles in the ratio 3 : 5 with 64 marbles: each part is 64 ÷ 8 = 8, so there are 40 blue.`),
    make(rng) {
      const kind = rng.pick(['convert', 'share', 'rate', 'scale']);
      if (kind === 'convert') {
        const k = rng.int(1, 5), mph = 15 * k, fps = 22 * k, toFps = rng.bool();
        return { prompt: `${toFps ? `A cyclist rides at ${mph} miles per hour. What is this speed in feet per second?` : `A ball rolls at ${fps} feet per second. What is this speed in miles per hour?`} (1 mile = 5,280 feet)`, type: 'number', answer: toFps ? fps : mph, unit: toFps ? 'ft/s' : 'mph', params: { kind, mph, fps, toFps },
          hints: [toFps ? `Feet per hour: ${mph} × 5,280 = ${N(mph * 5280)}.` : `Feet per hour: ${fps} × 3,600 = ${N(fps * 3600)}.`, toFps ? `Divide by 3,600 seconds: ${N(mph * 5280)} ÷ 3,600 = <b>${fps}</b> feet per second.` : `Divide by 5,280 feet: ${N(fps * 3600)} ÷ 5,280 = <b>${mph}</b> miles per hour.`] };
      }
      if (kind === 'share') {
        let a, b; do { a = rng.int(2, 7); b = rng.int(2, 9); } while (a === b || gcd(a, b) !== 1);
        const k = rng.int(3, 15), T = (a + b) * k, ask = rng.pick(['first', 'second']), [n1, n2] = rng.pick([['red', 'blue'], ['fiction', 'nonfiction'], ['adult', 'student'], ['oak', 'maple']]);
        const what = rng.pick([['marbles in a bag', 'marbles'], ['books on a shelf', 'books'], ['tickets sold', 'tickets'], ['trees in a park', 'trees']]);
        const ans = ask === 'first' ? a * k : b * k;
        return { prompt: `The ratio of ${n1} to ${n2} ${what[1]} among ${T} ${what[0]} is ${a} : ${b}. How many are ${ask === 'first' ? n1 : n2}?`, type: 'number', answer: ans, params: { kind, a, b, T, ask },
          hints: [`There are ${a} + ${b} = ${a + b} equal parts, so each part is ${T} ÷ ${a + b} = ${k}.`, `${ask === 'first' ? n1 : n2}: ${ask === 'first' ? a : b} × ${k} = <b>${ans}</b>.`] };
      }
      if (kind === 'rate') {
        const ppm = rng.pick([12, 15, 18, 20, 24, 30, 36, 40]), s = rng.pick([15, 20, 30, 40, 45].filter(x => ppm * x % 60 === 0)), P = ppm * s / 60, mins = rng.int(2, 9);
        return { prompt: `A printer prints ${P} pages in ${s} seconds. At this rate, how many pages does it print in ${mins} minutes?`, type: 'number', answer: ppm * mins, unit: 'pages', params: { kind, P, s, mins },
          hints: [`Pages per minute: ${P} pages in ${s} seconds is ${P} × ${60 / s === Math.round(60 / s) ? `${60 / s}` : `(60 ÷ ${s})`} = ${ppm} pages per minute.`, `${ppm} × ${mins} = <b>${ppm * mins}</b> pages.`] };
      }
      const per = rng.pick([20, 25, 40, 50, 60, 75]), d = rng.int(3, 18) / 2, miles = per * d, toMiles = rng.bool();
      return { prompt: toMiles ? `On a map, 1 inch represents ${per} miles. Two towns are ${N(d)} inches apart on the map. How far apart are they, in miles?` : `On a map, 1 inch represents ${per} miles. Two towns are ${N(miles)} miles apart. How far apart are they on the map, in inches?`, type: 'number', answer: toMiles ? miles : d, unit: toMiles ? 'miles' : 'in.', params: { kind, per, d, miles, toMiles },
        hints: [toMiles ? `Each inch is ${per} miles, so multiply.` : `Each inch is ${per} miles, so divide.`, toMiles ? `${N(d)} × ${per} = <b>${N(miles)}</b> miles.` : `${N(miles)} ÷ ${per} = <b>${N(d)}</b> inches.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'convert') return P.toFps ? near(P.mph * 5280 / 3600, q.answer, 1e-9) : near(P.fps / 5280 * 3600, q.answer, 1e-9);
      if (P.kind === 'share') { const other = P.T - q.answer; return P.ask === 'first' ? q.answer * P.b === other * P.a : other * P.b === q.answer * P.a; }
      if (P.kind === 'rate') return near(P.P / P.s * 60 * P.mins, q.answer, 1e-9);
      return P.toMiles ? near(q.answer / P.per, P.d, 1e-9) : near(q.answer * P.per, P.miles, 1e-9);
    },
  });

  A.skill({
    id: 'sat.percents', title: 'Percents and percent change',
    learn: p(`<b>Turn a percent change into a multiplier.</b> An increase of 20% multiplies by 1.20; a decrease of 15% multiplies by 0.85. Two changes in a row multiply: up 20% then down 20% is 1.2 × 0.8 = 0.96, a 4% loss overall, not 0%.`) +
      p(`To undo a change, divide by its multiplier: if a price after 25% off is $36, the original was 36 ÷ 0.75 = $48. And "${V('p')}% of ${X}" is ${F(V('p'), 100)} × ${X}.`) +
      example('Example', `A jacket's price goes up 30%, then down 10%. Final ÷ original = 1.3 × 0.9 = 1.17, so the final price is <b>117%</b> of the original.`),
    make(rng) {
      const kind = rng.pick(['successive', 'reverse', 'percent-of']);
      if (kind === 'successive') {
        const up = rng.pick([10, 20, 25, 30, 40, 50]), dn = rng.pick([10, 20, 25, 30, 40, 50]), order = rng.bool(), ans = M.round((100 + up) * (100 - dn) / 100, 4);
        const first = order ? `increased by ${up}%` : `decreased by ${dn}%`, second = order ? `decreased by ${dn}%` : `increased by ${up}%`;
        return { prompt: `The price of a bike was ${first}, and then the new price was ${second}. The final price is what percent of the original price?`, type: 'number', answer: ans, unit: '%', params: { kind, up, dn },
          hints: [`Multipliers: up ${up}% is ${N(1 + up / 100)} and down ${dn}% is ${N(1 - dn / 100)}.`, `${N(1 + up / 100)} × ${N(1 - dn / 100)} = ${N(ans / 100)}, so the final price is <b>${N(ans)}%</b> of the original.`] };
      }
      if (kind === 'reverse') {
        const d = rng.pick([10, 15, 20, 25, 30, 40]), O = rng.int(4, 40) * 5, S = M.round(O * (100 - d) / 100, 2), item = rng.pick(['jacket', 'lamp', 'pair of headphones', 'backpack', 'chair']);
        return { prompt: `After a ${d}% discount, the price of a ${item} is ${money(S)}. What was the price before the discount, in dollars?`, type: 'number', answer: O, unit: '$', params: { kind, d, S },
          hints: [`After ${d}% off, you pay ${100 - d}% of the price: ${N((100 - d) / 100)} × original = ${N(S)}.`, `Original = ${N(S)} ÷ ${N((100 - d) / 100)} = <b>${money(O)}</b>.`] };
      }
      const x = rng.int(2, 30) * 20, pc = rng.pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 60, 75]), q2 = rng.pick([10, 20, 30, 40, 50, 80, 120, 150].filter(v => v !== pc)), y = x * pc / 100, ans = x * q2 / 100;
      return { prompt: `If ${pc}% of a number is ${N(y)}, what is ${q2}% of the number?`, type: 'number', answer: ans, params: { kind, pc, y, q2 },
        hints: [`The number is ${N(y)} ÷ ${N(pc / 100)} = ${N(x)}.`, `${q2}% of ${N(x)} is ${N(q2 / 100)} × ${N(x)} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'successive') { let price = 1000; price += price * P.up / 100; price -= price * P.dn / 100; return near(price / 10, q.answer, 1e-9); }
      if (P.kind === 'reverse') return near(q.answer - q.answer * P.d / 100, P.S, 1e-9);
      return near(P.y * P.q2 / P.pc, q.answer, 1e-9);
    },
  });

  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  const median = a => { const s = a.slice().sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
  const sd = a => { const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / a.length); };
  const CHANGE = ['The mean decreases, and the median stays the same', 'Both decrease, and the mean decreases more', 'Both decrease, and the median decreases more', 'The median decreases, and the mean stays the same'];
  A.skill({
    id: 'sat.statistics', title: 'Mean, median and spread',
    learn: p(`The mean is the total divided by the count, so <b>work with totals</b>: if 5 tests average 84, they add up to 420. An outlier pulls the mean toward it but barely moves the median, so <b>removing a very large value lowers the mean much more than the median</b>.`) +
      p(`Standard deviation measures spread around the mean. <b>Adding the same number to every value doesn't change it</b>; spreading the values farther apart makes it bigger. For a frequency table, the median is the middle of the whole list of values, counted out in order.`) +
      example('Example', `Five scores average 84. To raise the average of six scores to 86, the sixth must be 6 × 86 − 5 × 84 = 516 − 420 = <b>96</b>.`),
    make(rng) {
      const kind = rng.pick(['next-score', 'outlier', 'sd', 'frequency']), who = rng.pick(NAMES);
      if (kind === 'next-score') {
        let n, m, m2, ans; do { n = rng.int(3, 7); m = rng.int(70, 90); m2 = m + rng.int(1, 4); ans = (n + 1) * m2 - n * m; } while (ans > 100);
        return { prompt: `${who}'s mean score on ${n} tests is ${m}. What score on the next test would make the mean of all ${n + 1} tests exactly ${m2}?`, type: 'number', answer: ans, params: { kind, n, m, m2 },
          hints: [`The ${n} scores total ${n} × ${m} = ${n * m}.`, `For a mean of ${m2}, all ${n + 1} must total ${n + 1} × ${m2} = ${(n + 1) * m2}.`, `The next score is ${(n + 1) * m2} − ${n * m} = <b>${ans}</b>.`] };
      }
      if (kind === 'outlier') {
        const base = Array.from({ length: 6 }, () => rng.int(10, 30));
        if (rng.bool()) { const s = base.slice().sort((a, b) => a - b); base[base.indexOf(s[3])] = s[2]; }
        const out = rng.int(70, 120), data = rng.shuffle(base.concat([out]));
        const dm = mean(data) - mean(base), dmed = median(data) - median(base), answer = CHANGE[dmed === 0 ? 0 : dm > dmed ? 1 : 2];
        return { prompt: `The value ${out} is removed from the data set below. How do the mean and the median change?${big(data.join(', '))}`, type: 'choice', answer, choices: CHANGE.slice(), params: { kind, data, out },
          hints: [`Median before: ${N(median(data))}; after: ${N(median(base))}.`, `Mean before: ${N(M.round(mean(data), 2))}; after: ${N(M.round(mean(base), 2))}. The outlier was pulling the mean up.`, `<b>${answer}</b>.`] };
      }
      if (kind === 'sd') {
        const n = 6, a = Array.from({ length: n }, () => rng.int(4, 20)), how = rng.pick(['shift', 'wider', 'narrower']);
        const m = mean(a), c = rng.int(3, 12);
        let b = how === 'shift' ? a.map(x => x + c) : how === 'wider' ? a.map(x => Math.round(m + 2 * (x - m)) + c) : a.map(() => Math.round(m) + rng.int(-1, 1));
        if (how === 'narrower' && sd(b) >= sd(a)) b = a.map(() => Math.round(m));
        const sa = sd(a), sb = sd(b), answer = Math.abs(sa - sb) < 1e-9 ? 'They have the same standard deviation' : sb > sa ? 'Data set B' : 'Data set A';
        return { prompt: `Which data set has the greater standard deviation?${big(`A: ${a.join(', ')}<br>B: ${b.join(', ')}`)}`, type: 'choice', keepOrder: true, answer, choices: ['Data set A', 'Data set B', 'They have the same standard deviation'], params: { kind, a, b },
          hints: [how === 'shift' ? `Each value in B is ${c} more than the matching value in A.` : `Compare how far the values sit from their mean: A runs from ${Math.min(...a)} to ${Math.max(...a)}, B from ${Math.min(...b)} to ${Math.max(...b)}.`, how === 'shift' ? `Adding the same number to every value moves the data without spreading it: <b>${answer.toLowerCase()}</b>.` : `The more spread-out set has the greater standard deviation: <b>${answer}</b>.`] };
      }
      const start = rng.int(1, 10), vals = [0, 1, 2, 3, 4].map(i => start + i * rng.pick([1, 2])).sort((x, y) => x - y), freq = vals.map(() => rng.int(1, 6));
      const vv = [...new Set(vals)], ff = vv.map(v => vals.reduce((s, x, i) => s + (x === v ? freq[i] : 0), 0)), list = vv.flatMap((v, i) => Array(ff[i]).fill(v)), med = median(list), n = list.length;
      return { prompt: `The frequency table shows the number of books each student in a club read last month. What is the median number of books?${M.table(['Books', 'Students'], vv.map((v, i) => [v, ff[i]]))}`, type: 'number', answer: med, params: { kind, vv, ff },
        hints: [`There are ${n} students, so the median is ${n % 2 ? `the ${M.ordinal((n + 1) / 2)} value` : `the mean of the ${M.ordinal(n / 2)} and ${M.ordinal(n / 2 + 1)} values`} in order.`, `Count down the table: the median is <b>${N(med)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'next-score') return (P.n * P.m + q.answer) / (P.n + 1) === P.m2;
      if (P.kind === 'outlier') {
        const rest = P.data.slice(); rest.splice(rest.indexOf(P.out), 1);
        const dm = mean(P.data) - mean(rest), dmed = median(P.data) - median(rest);
        const got = dm > 1e-9 && Math.abs(dmed) < 1e-9 ? 0 : dm > dmed && dmed > 0 ? 1 : dmed > dm && dm > 0 ? 2 : 3;
        return q.answer === CHANGE[got];
      }
      if (P.kind === 'sd') { const va = sd(P.a), vb = sd(P.b); return q.answer === (Math.abs(va - vb) < 1e-9 ? 'They have the same standard deviation' : vb > va ? 'Data set B' : 'Data set A'); }
      // walk to the middle position(s) without building the list
      const n = P.ff.reduce((s, f) => s + f, 0), at = k => { let c = 0; for (let i = 0; i < P.vv.length; i++) { c += P.ff[i]; if (k <= c) return P.vv[i]; } };
      return near(n % 2 ? at((n + 1) / 2) : (at(n / 2) + at(n / 2 + 1)) / 2, q.answer, 1e-9);
    },
  });

  const TABLES = [
    { who: 'students', one: 'student', rows: [['9th grade', 'a 9th grader', 'is in 9th grade'], ['10th grade', 'a 10th grader', 'is in 10th grade']], cols: [['Owns a pet', 'owns a pet'], ['No pet', 'doesn’t own a pet']] },
    { who: 'moviegoers', one: 'person', rows: [['Adults', 'an adult', 'is an adult'], ['Teens', 'a teen', 'is a teen']], cols: [['Chose the comedy', 'chose the comedy'], ['Chose the drama', 'chose the drama']] },
    { who: 'employees', one: 'employee', rows: [['Day shift', 'a day-shift worker', 'works the day shift'], ['Night shift', 'a night-shift worker', 'works the night shift']], cols: [['Walks or bikes', 'walks or bikes to work'], ['Drives', 'drives to work']] },
    { who: 'club members', one: 'member', rows: [['Joined this year', 'a new member', 'joined this year'], ['Joined earlier', 'a longtime member', 'joined before this year']], cols: [['Plays chess', 'plays chess'], ['Doesn’t play chess', 'doesn’t play chess']] },
  ];
  A.skill({
    id: 'sat.probability-tables', title: 'Two-way tables and probability',
    learn: p(`A two-way table counts people by two features at once. <b>The words "given" or "if one of the … is chosen" shrink the group you're choosing from</b>: the denominator becomes that row's or column's total, not the grand total.`) +
      p(`Probability = (number in the cell you want) ÷ (number in the group you're choosing from). "And" means a single cell out of everyone.`) +
      example('Example', `40 9th graders, 15 of whom own a pet. If a 9th grader is chosen at random, the probability of a pet owner is 15 ÷ 40 = <b>${F(3, 8)}</b>. Out of all 100 students, the chance of a 9th-grade pet owner is 15 ÷ 100.`),
    make(rng) {
      const t = rng.int(0, TABLES.length - 1), T = TABLES[t], cells = [[rng.int(8, 60), rng.int(8, 60)], [rng.int(8, 60), rng.int(8, 60)]];
      const rs = cells.map(r => r[0] + r[1]), cs = [0, 1].map(j => cells[0][j] + cells[1][j]), g = rs[0] + rs[1], i = rng.int(0, 1), j = rng.int(0, 1), ask = rng.pick(['given-row', 'given-col', 'and']);
      const table = M.table(['', T.cols[0][0], T.cols[1][0], 'Total'], [[T.rows[0][0], cells[0][0], cells[0][1], rs[0]], [T.rows[1][0], cells[1][0], cells[1][1], rs[1]], ['Total', cs[0], cs[1], g]]);
      const [num, den] = ask === 'given-row' ? [cells[i][j], rs[i]] : ask === 'given-col' ? [cells[i][j], cs[j]] : [cells[i][j], g], ans = fa(num, den);
      const q = ask === 'given-row' ? `If ${T.rows[i][1]} from the survey is chosen at random, what is the probability that the ${T.one} ${T.cols[j][1]}?`
        : ask === 'given-col' ? `If a ${T.one} who ${T.cols[j][1]} is chosen at random, what is the probability that the ${T.one} ${T.rows[i][2]}?`
          : `If one of the ${g} ${T.who} is chosen at random, what is the probability that the ${T.one} ${T.rows[i][2]} and ${T.cols[j][1]}?`;
      return { prompt: `The table shows the results of a survey of ${g} ${T.who}.${table}${q}`, type: 'number', ...ans, params: { t, cells, i, j, ask },
        hints: [ask === 'and' ? `Choosing from everyone: the denominator is the grand total, ${g}.` : `Choosing only from ${ask === 'given-row' ? `the "${T.rows[i][0]}" row: its total is ${rs[i]}` : `the "${T.cols[j][0]}" column: its total is ${cs[j]}`}.`, `The cell you want holds ${num}. Probability = ${num} ÷ ${den} = <b>${ans.answerText || N(ans.answer)}</b>${ans.answerText ? ` (about ${N(M.round(num / den, 3))})` : ''}.`] };
    },
    verify(q) {
      const { cells, i, j, ask } = q.params;
      // count people one by one, the long way
      let inGroup = 0, hit = 0;
      for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) for (let k = 0; k < cells[r][c]; k++) {
        const ok = ask === 'given-row' ? r === i : ask === 'given-col' ? c === j : true;
        if (ok) { inGroup++; if (r === i && c === j) hit++; }
      }
      return near(hit / inGroup, q.answer, 1e-9);
    },
  });

  const SURVEYS = [
    { pop: 'the city’s voters', wider: 'the state’s voters', act: 'support the new park', place: 'registered voters in a city', who: 'voters' },
    { pop: 'the school’s students', wider: 'the state’s students', act: 'want a later start time', place: 'students at a large high school', who: 'students' },
    { pop: 'the town’s library card holders', wider: 'the county’s adults', act: 'would use a weekend book club', place: 'library card holders in a town', who: 'card holders' },
    { pop: 'the company’s employees', wider: 'the country’s workers', act: 'prefer a four-day workweek', place: 'employees of a large company', who: 'employees' },
  ];
  A.skill({
    id: 'sat.sampling-inference', title: 'Samples, margins of error and conclusions',
    learn: p(`<b>A random sample lets you generalize only to the population it was drawn from</b>, not to a bigger or different group. A sample proportion estimates the population proportion.`) +
      p(`A <b>margin of error</b> gives a range of plausible values: 58% with a margin of 4% means the true percent is plausibly between 54% and 62%. It never makes the result exact. Larger random samples give smaller margins of error.`) +
      example('Example', `In a random sample of 150 of a school's 2,400 students, 36 walk to school. That's 36 ÷ 150 = 24%, so about 0.24 × 2,400 = <b>576</b> students walk.`),
    make(rng) {
      const kind = rng.pick(['margin', 'generalize', 'estimate']), S = rng.pick(SURVEYS), n = rng.pick([200, 300, 400, 500, 600, 800]);
      if (kind === 'margin') {
        const pc = rng.int(35, 70), m = rng.pick([2, 3, 4, 5, 6]);
        const answer = `Between ${pc - m}% and ${pc + m}% of ${S.pop} likely ${S.act}`;
        const choices = [answer, `Exactly ${pc}% of ${S.pop} ${S.act}`, `Between ${pc - m}% and ${pc + m}% of ${S.wider} likely ${S.act}`, `Between ${pc - 2 * m}% and ${pc + 2 * m}% of ${S.pop} likely ${S.act}`];
        return { prompt: `A random sample of ${n} ${S.place} found that ${pc}% ${S.act}, with a margin of error of ${m} percentage points. Which conclusion is best supported?`, type: 'choice', answer, choices, params: { kind, pc, m, s: SURVEYS.indexOf(S) },
          hints: [`The margin of error gives a range: ${pc}% ± ${m}%, from ${pc - m}% to ${pc + m}%.`, `The sample came from ${S.place}, so the conclusion is about ${S.pop}: <b>${answer.toLowerCase()}</b>.`] };
      }
      if (kind === 'generalize') {
        const answer = `All of ${S.pop}`, choices = [answer, `Only the ${n} ${S.who} who were asked`, `All of ${S.wider}`, `Only the ${S.who} who agreed with the result`];
        return { prompt: `A researcher chose ${n} ${S.place} at random and asked whether they ${S.act}. To which group can the results most reasonably be generalized?`, type: 'choice', answer, choices, params: { kind, s: SURVEYS.indexOf(S) },
          hints: [`A random sample represents the population it was drawn from.`, `It was drawn from ${S.place}: <b>${answer.toLowerCase()}</b>.`] };
      }
      const s = rng.pick([50, 80, 100, 120, 150, 200]), mult = rng.int(4, 20), total = s * mult, k = rng.int(5, Math.floor(s * 0.6));
      return { prompt: `Of the ${N(total)} ${S.place}, a random sample of ${s} was asked, and ${k} said they ${S.act}. Based on this, about how many of the ${N(total)} ${S.act}?`, type: 'number', answer: k * mult, params: { kind, s, total, k },
        hints: [`The sample proportion is ${k} ÷ ${s}.`, `Scale up: ${k} ÷ ${s} × ${N(total)} = <b>${N(k * mult)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'margin') { const S = SURVEYS[P.s]; return q.answer.includes(`${P.pc - P.m}% and ${P.pc + P.m}%`) && q.answer.includes(`of ${S.pop} `); }
      if (P.kind === 'generalize') return q.answer === `All of ${SURVEYS[P.s].pop}`;
      return near(q.answer / P.total, P.k / P.s, 1e-12);
    },
  });

  /* ---------- Unit 4: geometry and trigonometry ---------- */
  const PI = 'π';
  /** "kπ" for a fraction k = n/d */
  const kpi = (n, d) => { const [a, b] = M.simp(n, d); return `${a === 1 ? '' : a === -1 ? '−' : N(a)}${PI}${b === 1 ? '' : '/' + b}`; };
  A.skill({
    id: 'sat.area-volume', title: 'Area and volume',
    learn: p(`The formulas you'll use most: <b>cylinder ${V('V')} = π${M.sup(V('r'), 2)}${V('h')}</b>, <b>cone ${V('V')} = ${F(1, 3)}π${M.sup(V('r'), 2)}${V('h')}</b>, <b>sphere ${V('V')} = ${F(4, 3)}π${M.sup(V('r'), 3)}</b>, and rectangle area = length × width. Answers are often written as a multiple of π, so keep π as a symbol.`) +
      p(`<b>Scaling:</b> if every length is multiplied by ${V('k')}, areas are multiplied by ${M.sup(V('k'), 2)} and volumes by ${M.sup(V('k'), 3)}. If only some lengths change, multiply the factors for the ones that do: tripling a cylinder's radius multiplies its volume by 9.`) +
      example('Example', `A cone with radius 6 and height 5 has volume ${F(1, 3)}π(36)(5) = <b>60π</b>. Doubling its radius and keeping its height multiplies the volume by 4, to 240π.`),
    make(rng) {
      const kind = rng.pick(['solid', 'solid', 'scale', 'rectangle']);
      if (kind === 'solid') {
        const shape = rng.pick(['cylinder', 'cone', 'sphere']);
        let r, h = 0, k;
        if (shape === 'cylinder') { r = rng.int(2, 9); h = rng.int(2, 12); k = r * r * h; }
        else if (shape === 'cone') { do { r = rng.int(2, 9); h = rng.int(2, 12); } while ((r * r * h) % 3); k = r * r * h / 3; }
        else { r = rng.pick([3, 6, 9]); k = 4 * r ** 3 / 3; }
        const dims = shape === 'sphere' ? `a radius of ${r} centimeters` : `a radius of ${r} centimeters and a height of ${h} centimeters`, form = { cylinder: `π${M.sup(V('r'), 2)}${V('h')}`, cone: `${F(1, 3)}π${M.sup(V('r'), 2)}${V('h')}`, sphere: `${F(4, 3)}π${M.sup(V('r'), 3)}` }[shape];
        return { prompt: `A ${shape} has ${dims}. Its volume is ${K}π cubic centimeters. What is the value of ${K}?`, type: 'number', answer: k, params: { kind, shape, r, h },
          hints: [`${V('V')} = ${form}.`, shape === 'sphere' ? `${F(4, 3)}π(${r})<sup>3</sup> = ${F(4, 3)}π(${r ** 3}) = ${N(k)}π.` : `${shape === 'cone' ? `${F(1, 3)}` : ''}π(${r})<sup>2</sup>(${h}) = ${shape === 'cone' ? `${F(1, 3)}π(${r * r * h})` : `π(${r * r})(${h})`} = ${N(k)}π.`, `<b>${K} = ${N(k)}</b>.`] };
      }
      if (kind === 'scale') {
        const a = rng.pick([2, 3, 4]), [bn, bd] = rng.pick([[1, 2], [2, 1], [3, 1], [1, 3], [1, 1]]), ans = fa(a * a * bn, bd);
        const hText = bn === bd ? 'its height stays the same' : bn > bd ? `its height is ${bn === 2 ? 'doubled' : 'tripled'}` : `its height is ${bd === 2 ? 'cut in half' : 'divided by 3'}`;
        return { prompt: `The radius of a cylinder is ${a === 2 ? 'doubled' : a === 3 ? 'tripled' : 'multiplied by 4'}, and ${hText}. The new volume is how many times the original volume?`, type: 'number', ...ans, params: { kind, a, bn, bd },
          hints: [`Volume is π${M.sup(V('r'), 2)}${V('h')}: the radius counts twice and the height once.`, `${a}² × ${bn === bd ? '1' : ft(bn, bd)} = <b>${ans.answerText || N(ans.answer)}</b>.`] };
      }
      const m = rng.pick([2, 3]), w = rng.int(3, 15), c = rng.int(-3, 6), L = m * w + c, P = 2 * (L + w);
      return { prompt: `The length of a rectangle is ${c === 0 ? `${m === 2 ? 'twice' : 'three times'} its width` : `${Math.abs(c)} ${c > 0 ? 'more' : 'less'} than ${m === 2 ? 'twice' : 'three times'} its width`}. Its perimeter is ${P} inches. What is its area, in square inches?`, type: 'number', answer: L * w, unit: 'sq in.', params: { kind, m, c, P },
        hints: [`Let the width be ${V('w')}. Then 2(${M.poly([m, c], 'w')}) + 2${V('w')} = ${P}, so ${M.poly([2 * m + 2, 2 * c], 'w')} = ${P}.`, `${V('w')} = ${w} and the length is ${L}.`, `Area = ${L} × ${w} = <b>${L * w}</b> square inches.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'solid') { const v = { cylinder: Math.PI * P.r * P.r * P.h, cone: Math.PI * P.r * P.r * P.h / 3, sphere: 4 / 3 * Math.PI * P.r ** 3 }[P.shape]; return near(v / Math.PI, q.answer, 1e-9); }
      if (P.kind === 'scale') { const r = 1.7, h = 2.3, v0 = Math.PI * r * r * h, v1 = Math.PI * (P.a * r) ** 2 * (h * P.bn / P.bd); return near(v1 / v0, q.answer, 1e-9); }
      for (let w = 1; w < 100; w++) { const L = P.m * w + P.c; if (2 * L + 2 * w === P.P) return L * w === q.answer; }
      return false;
    },
  });

  A.skill({
    id: 'sat.angles-triangles', title: 'Lines, angles and triangles',
    learn: p(`<b>The angles of a triangle add to 180°.</b> When two parallel lines are cut by a transversal, <b>alternate interior angles are equal</b> and <b>same-side interior angles add to 180°</b>.`) +
      p(`If a segment inside a triangle is parallel to one side, it cuts off a smaller <b>similar</b> triangle: matching sides are in the same ratio. Write the ratio with whole sides, such as ${V('AD')} ÷ ${V('AB')} = ${V('DE')} ÷ ${V('BC')}.`) +
      example('Example', `In triangle ${V('ABC')}, ${V('DE')} ∥ ${V('BC')} with ${V('AD')} = 4, ${V('DB')} = 6 and ${V('DE')} = 5. Then ${V('AB')} = 10, so ${V('BC')} = 5 × 10 ÷ 4 = <b>12.5</b>.`),
    make(rng) {
      const kind = rng.pick(['sum', 'similar', 'parallel']);
      if (kind === 'sum') {
        let x, a, b, c3; do { x = rng.int(8, 30); a = [rng.int(1, 4), rng.int(1, 4), rng.int(1, 4)]; b = [rng.int(-15, 25), rng.int(-15, 25)]; c3 = 180 - (a[0] + a[1] + a[2]) * x - b[0] - b[1]; } while ([a[0] * x + b[0], a[1] * x + b[1], a[2] * x + c3].some(t => t <= 10) || Math.abs(c3) > 60);
        const bs = [b[0], b[1], c3], angs = a.map((ai, i) => ai * x + bs[i]), ask = rng.pick(['x', 'largest']), ans = ask === 'x' ? x : Math.max(...angs);
        const show = i => `(${M.poly([a[i], bs[i]])})°`;
        return { prompt: `In triangle ${V('ABC')}, the measures of angles ${V('A')}, ${V('B')} and ${V('C')} are ${show(0)}, ${show(1)} and ${show(2)}. What is ${ask === 'x' ? `the value of ${X}` : 'the measure, in degrees, of the largest angle'}?`, type: 'number', answer: ans, params: { kind, a, bs, ask },
          hints: [`The angles add to 180: ${M.poly([a[0] + a[1] + a[2], bs[0] + bs[1] + bs[2]])} = 180.`, `So ${X} = ${x}, and the angles are ${angs.join('°, ')}°.`, ask === 'x' ? `<b>${X} = ${x}</b>.` : `The largest is <b>${Math.max(...angs)}°</b>.`] };
      }
      if (kind === 'similar') {
        const ad = rng.int(2, 9), db = rng.int(2, 12), de = ad * rng.int(1, 5) / rng.pick([1, 2]), ans = fa(2 * de * (ad + db), 2 * ad);
        return { prompt: `In triangle ${V('ABC')}, point ${V('D')} is on ${V('AB')} and point ${V('E')} is on ${V('AC')}, with ${V('DE')} parallel to ${V('BC')}. If ${V('AD')} = ${ad}, ${V('DB')} = ${db} and ${V('DE')} = ${de}, what is the length of ${V('BC')}?`, type: 'number', ...ans, params: { kind, ad, db, de },
          hints: [`Triangles ${V('ADE')} and ${V('ABC')} are similar, and ${V('AB')} = ${ad} + ${db} = ${ad + db}.`, `${V('BC')} ÷ ${de} = ${ad + db} ÷ ${ad}, so ${V('BC')} = ${de} × ${ad + db} ÷ ${ad} = <b>${ans.answerText || N(ans.answer)}</b>.`] };
      }
      const same = rng.bool(); let x, p1, q1, p2, q2;
      do { x = rng.int(5, 30); p1 = rng.int(2, 6); p2 = rng.int(1, 5); q1 = rng.int(-20, 40); q2 = same ? 180 - (p1 + p2) * x - q1 : (p1 - p2) * x + q1; } while (p1 === p2 || p1 * x + q1 <= 0 || p2 * x + q2 <= 0 || p1 * x + q1 >= 180 || p2 * x + q2 >= 180 || Math.abs(q2) > 120);
      const a1 = p1 * x + q1, ask = rng.pick(['x', 'angle']), ans = ask === 'x' ? x : a1;
      return { prompt: `Two parallel lines are cut by a transversal. Two ${same ? 'same-side interior' : 'alternate interior'} angles measure (${M.poly([p1, q1])})° and (${M.poly([p2, q2])})°. What is ${ask === 'x' ? `the value of ${X}` : `the measure, in degrees, of the angle (${M.poly([p1, q1])})°`}?`, type: 'number', answer: ans, params: { kind, same, p1, q1, p2, q2, ask },
        hints: [same ? `Same-side interior angles add to 180°: (${M.poly([p1, q1])}) + (${M.poly([p2, q2])}) = 180.` : `Alternate interior angles are equal: ${M.poly([p1, q1])} = ${M.poly([p2, q2])}.`, `Solve: ${X} = ${x}.`, ask === 'x' ? `<b>${X} = ${x}</b>.` : `${p1}(${x}) ${M.signed(q1)} = <b>${a1}°</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'sum') { const x = (180 - P.bs.reduce((s, b) => s + b, 0)) / P.a.reduce((s, a) => s + a, 0); return near(P.ask === 'x' ? x : Math.max(...P.a.map((a, i) => a * x + P.bs[i])), q.answer, 1e-9); }
      if (P.kind === 'similar') return near(P.ad / (P.ad + P.db), P.de / q.answer, 1e-12);
      for (let x = 0; x <= 90; x++) { const a1 = P.p1 * x + P.q1, a2 = P.p2 * x + P.q2; if (P.same ? a1 + a2 === 180 : a1 === a2) return (P.ask === 'x' ? x : a1) === q.answer; }
      return false;
    },
  });

  const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];
  const R2 = M.sqrt('2'), R3 = M.sqrt('3');
  A.skill({
    id: 'sat.right-triangles', title: 'Right triangles and trigonometry',
    learn: p(`In a right triangle, <b>sin = opposite ÷ hypotenuse, cos = adjacent ÷ hypotenuse, tan = opposite ÷ adjacent</b>. The two acute angles add to 90°, so <b>sin ${V('x')}° = cos(90 − ${V('x')})°</b>: the sine of one acute angle is the cosine of the other.`) +
      p(`Know the special triangles: in a <b>45°-45°-90°</b> triangle the hypotenuse is leg × ${R2}; in a <b>30°-60°-90°</b> triangle the sides are ${V('a')}, ${V('a')}${R3} and 2${V('a')}. And the Pythagorean theorem: ${M.sup(V('a'), 2)} + ${M.sup(V('b'), 2)} = ${M.sup(V('c'), 2)}.`) +
      example('Example', `If sin ${V('A')} = ${F(5, 13)}, the sides are 5, 12 and 13, so cos ${V('A')} = ${F(12, 13)} and tan ${V('A')} = ${F(5, 12)}. And sin 25° = cos 65°.`),
    make(rng) {
      const kind = rng.pick(['ratio', 'ratio', 'cofunction', 'special', 'pythag']);
      if (kind === 'ratio') {
        const [a, b, c] = rng.pick(TRIPLES), give = rng.pick(['sinA', 'cosA', 'tanA']), ask = rng.pick(['sinA', 'cosA', 'tanA', 'sinB', 'cosB'].filter(t => t !== give));
        // A is opposite a, B is opposite b; C is the right angle
        const val = { sinA: [a, c], cosA: [b, c], tanA: [a, b], sinB: [b, c], cosB: [a, c] }, nm = t => `${t.slice(0, 3)} ${V(t[3])}`;
        const ans = fa(...val[ask]);
        return { prompt: `In right triangle ${V('ABC')}, angle ${V('C')} is the right angle and ${nm(give)} = ${F(...val[give])}. What is ${nm(ask)}?`, type: 'number', ...ans, params: { kind, a, b, c, give, ask },
          hints: [`${nm(give)} = ${F(...val[give])} fits a ${a}-${b}-${c} right triangle, with ${a} opposite ${V('A')}, ${b} opposite ${V('B')} and hypotenuse ${c}.`, `${nm(ask)} = ${{ sinA: 'opposite ÷ hypotenuse', cosA: 'adjacent ÷ hypotenuse', tanA: 'opposite ÷ adjacent', sinB: 'opposite ÷ hypotenuse', cosB: 'adjacent ÷ hypotenuse' }[ask]} = <b>${ans.answerText || N(ans.answer)}</b>.`] };
      }
      if (kind === 'cofunction') {
        const k = rng.int(5, 85), sinFirst = rng.bool();
        return { prompt: `If ${sinFirst ? 'sin' : 'cos'}(${X}°) = ${sinFirst ? 'cos' : 'sin'}(${k}°) and 0 &lt; ${X} &lt; 90, what is the value of ${X}?`, type: 'number', answer: 90 - k, params: { kind, k, sinFirst },
          hints: [`The sine of an angle equals the cosine of its complement.`, `So ${X} + ${k} = 90 and <b>${X} = ${90 - k}</b>.`] };
      }
      if (kind === 'special') {
        const t = rng.pick(['30-short', '30-long', '45-hyp', '45-leg']), a = rng.int(2, 12);
        if (t === '30-short' || t === '30-long') {
          return { prompt: `In a 30°-60°-90° triangle, the hypotenuse has length ${2 * a}. ${t === '30-short' ? 'What is the length of the shorter leg?' : `The longer leg has length ${K}${R3}. What is the value of ${K}?`}`, type: 'number', answer: a, params: { kind, t, a },
            hints: [`The sides are in the ratio 1 : ${R3} : 2, so the shorter leg is half the hypotenuse: ${a}.`, t === '30-short' ? `The shorter leg is <b>${a}</b>.` : `The longer leg is ${a}${R3}, so <b>${K} = ${a}</b>.`] };
        }
        return { prompt: t === '45-hyp' ? `Each leg of an isosceles right triangle has length ${a}. The hypotenuse has length ${K}${R2}. What is the value of ${K}?` : `The hypotenuse of an isosceles right triangle has length ${a}${R2}. What is the length of each leg?`, type: 'number', answer: a, params: { kind, t, a },
          hints: [`In a 45°-45°-90° triangle the hypotenuse is a leg times ${R2}.`, t === '45-hyp' ? `The hypotenuse is ${a}${R2}, so <b>${K} = ${a}</b>.` : `Each leg is <b>${a}</b>.`] };
      }
      const [a, b, c] = rng.pick(TRIPLES), s = rng.int(1, 4), ask = rng.pick(['hyp', 'leg']), ans = ask === 'hyp' ? c * s : b * s;
      return { prompt: ask === 'hyp' ? `A right triangle has legs of length ${a * s} and ${b * s}. What is the length of its hypotenuse?` : `A right triangle has a hypotenuse of length ${c * s} and one leg of length ${a * s}. What is the length of the other leg?`, type: 'number', answer: ans, params: { kind, a: a * s, b: b * s, c: c * s, ask },
        hints: [ask === 'hyp' ? `${M.sup(V('c'), 2)} = ${a * s}² + ${b * s}² = ${(a * s) ** 2 + (b * s) ** 2}.` : `${M.sup(V('b'), 2)} = ${c * s}² − ${a * s}² = ${(c * s) ** 2 - (a * s) ** 2}.`, `Take the square root: <b>${ans}</b>.`] };
    },
    verify(q) {
      const P = q.params, d = Math.PI / 180;
      if (P.kind === 'ratio') { const A_ = Math.atan2(P.a, P.b), B_ = Math.PI / 2 - A_; return near({ sinA: Math.sin(A_), cosA: Math.cos(A_), tanA: Math.tan(A_), sinB: Math.sin(B_), cosB: Math.cos(B_) }[P.ask], q.answer, 1e-9); }
      if (P.kind === 'cofunction') return q.answer > 0 && q.answer < 90 && near(P.sinFirst ? Math.sin(q.answer * d) : Math.cos(q.answer * d), P.sinFirst ? Math.cos(P.k * d) : Math.sin(P.k * d), 1e-12);
      if (P.kind === 'special') {
        if (P.t === '30-short') return near(2 * P.a * Math.sin(30 * d), q.answer, 1e-9);
        if (P.t === '30-long') return near(2 * P.a * Math.cos(30 * d), q.answer * Math.sqrt(3), 1e-9);
        if (P.t === '45-hyp') return near(Math.hypot(P.a, P.a), q.answer * Math.SQRT2, 1e-9);
        return near(P.a * Math.SQRT2 * Math.cos(45 * d), q.answer, 1e-9);
      }
      return P.ask === 'hyp' ? P.a ** 2 + P.b ** 2 === q.answer ** 2 : P.a ** 2 + q.answer ** 2 === P.c ** 2;
    },
  });

  A.skill({
    id: 'sat.circles', title: 'Circles, arcs and radians',
    learn: p(`A circle with center (${V('h')}, ${V('k')}) and radius ${V('r')} has equation (${X} − ${V('h')})² + (${Y} − ${V('k')})² = ${M.sup(V('r'), 2)}. If the equation is expanded, <b>complete the square</b> in ${X} and in ${Y} to find the center and radius.`) +
      p(`An arc or sector is a fraction of the circle: <b>arc length = ${F(V('θ'), 360)} × 2π${V('r')}</b> and <b>sector area = ${F(V('θ'), 360)} × π${M.sup(V('r'), 2)}</b>. To change degrees to radians, multiply by ${F('π', 180)}: 180° is π radians.`) +
      example('Example', `${M.sup(X, 2)} + ${M.sup(Y, 2)} − 6${X} + 4${Y} − 12 = 0 becomes (${X} − 3)² + (${Y} + 2)² = 25: center (3, −2), radius 5. A 120° arc of a circle with radius 9 has length ${F(1, 3)} × 18π = <b>6π</b>.`),
    make(rng) {
      const kind = rng.pick(['equation', 'arc', 'radians']);
      if (kind === 'equation') {
        const h = rng.int(-6, 6), k = rng.int(-6, 6), r = rng.int(2, 9), D = -2 * h, E = -2 * k, Fc = h * h + k * k - r * r, ask = rng.pick(['r', 'r', 'h', 'k']);
        const eq = `${M.sup(X, 2)} + ${M.sup(Y, 2)}${D ? ` ${M.signed(D)}${X}` : ''}${E ? ` ${M.signed(E)}${Y}` : ''}${Fc ? ` ${M.signed(Fc)}` : ''} = 0`;
        const ans = { r, h, k }[ask];
        return { prompt: `What is the ${ask === 'r' ? 'radius' : ask === 'h' ? `${X}-coordinate of the center` : `${Y}-coordinate of the center`} of the circle with this equation?${big(eq)}`, type: 'number', answer: ans, params: { kind, D, E, Fc, ask },
          hints: [`Complete the square: (${X}${h ? ` ${M.signed(-h)}` : ''})² − ${h * h} + (${Y}${k ? ` ${M.signed(-k)}` : ''})² − ${k * k} ${M.signed(Fc)} = 0.`, `So (${X}${h ? ` ${M.signed(-h)}` : ''})² + (${Y}${k ? ` ${M.signed(-k)}` : ''})² = ${r * r}: center ${M.pt(h, k)}, radius ${r}.`, `The answer is <b>${N(ans)}</b>.`] };
      }
      if (kind === 'arc') {
        const th = rng.pick([30, 40, 45, 60, 72, 90, 120, 135, 150, 216, 240, 270]), r = rng.int(2, 12), what = rng.pick(['arc', 'sector']);
        const [n, d] = what === 'arc' ? [th * 2 * r, 360] : [th * r * r, 360], ans = fa(n, d);
        return { prompt: `A circle has radius ${r}. A central angle of ${th}° cuts off ${what === 'arc' ? `an arc of length ${K}π` : `a sector with area ${K}π`}. What is the value of ${K}?`, type: 'number', ...ans, params: { kind, th, r, what },
          hints: [`The ${what} is ${F(th, 360)} of the whole circle.`, what === 'arc' ? `${F(th, 360)} × 2π(${r}) = ${kpi(n, d)}.` : `${F(th, 360)} × π(${r})² = ${kpi(n, d)}.`, `<b>${K} = ${ans.answerText || N(ans.answer)}</b>.`] };
      }
      const th = rng.pick([20, 30, 36, 40, 45, 60, 72, 90, 120, 135, 150, 210, 225, 240, 270, 300, 315, 330]), toRad = rng.bool();
      if (toRad) {
        const ans = fa(th, 180);
        return { prompt: `An angle measures ${th}°. Its measure in radians is ${K}π. What is the value of ${K}?`, type: 'number', ...ans, params: { kind, th, toRad },
          hints: [`Multiply by ${F('π', 180)}: ${th} × ${F('π', 180)} = ${kpi(th, 180)}.`, `<b>${K} = ${ans.answerText || N(ans.answer)}</b>.`] };
      }
      return { prompt: `An angle measures ${kpi(th, 180)} radians. What is its measure in degrees?`, type: 'number', answer: th, unit: '°', params: { kind, th, toRad },
        hints: [`Multiply by ${F(180, 'π')}: π radians is 180°.`, `${kpi(th, 180)} × ${F(180, 'π')} = <b>${th}°</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'equation') {
        const L = (x, y) => x * x + y * y + P.D * x + P.E * y + P.Fc;
        if (P.ask === 'r') { const h = -P.D / 2, k = -P.E / 2; return q.answer > 0 && near(L(h + q.answer, k), 0, 1e-9) && near(L(h, k - q.answer), 0, 1e-9); }
        const t = 1.3, y0 = 0.7, x0 = 0.4;
        return P.ask === 'h' ? near(L(q.answer + t, y0), L(q.answer - t, y0), 1e-9) : near(L(x0, q.answer + t), L(x0, q.answer - t), 1e-9);
      }
      if (P.kind === 'arc') { const rad = P.th * Math.PI / 180, v = P.what === 'arc' ? P.r * rad : P.r * P.r * rad / 2; return near(v / Math.PI, q.answer, 1e-9); }
      return P.toRad ? near(q.answer * Math.PI, P.th * Math.PI / 180, 1e-12) : near(q.answer, P.th, 1e-12) && near(Math.cos(P.th * Math.PI / 180), Math.cos(q.answer / 180 * Math.PI), 1e-12);
    },
  });
})();
