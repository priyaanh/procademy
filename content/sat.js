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
})();
