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
})();
