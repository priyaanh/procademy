/* Competition math. New problems in the style of middle school math contests such as MATHCOUNTS: clever
   counting, number theory, algebra shortcuts, geometry and probability. Every problem is written here from
   scratch; none is taken from a contest. verify() checks each answer the long way: by listing every case,
   counting lattice points, multiplying out with BigInt, or simulating. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v;
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = s => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1e-9 : tol);
  const X = V('x'), Y = V('y');
  const gcd = M.gcd, lcm = (a, b) => a / gcd(a, b) * b;
  const fa = (n, d) => { const [a, b] = M.simp(n, d); return b === 1 ? { answer: a } : { answer: a / b, answerText: M.fracText(a, b) }; };
  const ans$ = q => q.answerText || N(q.answer);
  /** a number to follow an operator: negatives in parentheses */
  const par = x => x < 0 ? `(${N(x)})` : N(x);
  /** a small count to start a sentence: "Six students …" */
  const Word = n => ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'][n] || N(n);
  const fact = n => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
  const choose = (n, k) => { if (k < 0 || k > n) return 0; let r = 1; for (let t = 1; t <= k; t++) r = r * (n - k + t) / t; return Math.round(r); };
  /** every ordering of a list (for brute-force checks) */
  function perms(a) { if (a.length <= 1) return [a.slice()]; const out = []; a.forEach((x, i) => perms(a.slice(0, i).concat(a.slice(i + 1))).forEach(r => out.push([x].concat(r)))); return out; }
  /** the subsets of {0, …, n−1}, as bit masks */
  const popcount = m => { let c = 0; while (m) { c += m & 1; m >>= 1; } return c; };
  const COURSE = {
    id: 'competition-math', title: 'Competition math', subject: 'Middle school', grade: 7, icon: 'Comp', hue: 280,
    blurb: 'New problems in the style of middle school contests such as MATHCOUNTS: clever counting, number theory, equation shortcuts, geometry and probability. For strong students in grades 6 to 8, listed at grade 7.',
    units: [
      { id: 'counting', title: 'Counting', blurb: 'The multiplication principle, arrangements, choosing groups, overlaps, grid paths and page numbers.', skills: ['comp.multiplication-principle', 'comp.arrangements', 'comp.choosing', 'comp.overlaps', 'comp.paths-pages'] },
      { id: 'number-theory', title: 'Number theory', blurb: 'Divisors, GCF and LCM puzzles, remainders and cycles, units digits, divisibility rules, and zeros at the end.', skills: ['comp.divisors', 'comp.gcd-lcm', 'comp.remainders', 'comp.units-digit', 'comp.digit-rules', 'comp.trailing-zeros'] },
      { id: 'algebra', title: 'Clever algebra', blurb: 'Algebra shortcuts, sums of sequences, work and rate problems, distance and speed, and repeating patterns.', skills: ['comp.algebra-identities', 'comp.series', 'comp.work-rate', 'comp.motion', 'comp.cycles'] },
      { id: 'geometry', title: 'Geometry', blurb: 'Polygon angles, areas on a grid, Pythagorean triples, circles with squares, scale factors, and counting shapes.', skills: ['comp.polygon-angles', 'comp.lattice-area', 'comp.pythagorean', 'comp.circles-squares', 'comp.scale-factors', 'comp.counting-shapes'] },
      { id: 'probability', title: 'Probability', blurb: 'Dice and coins, probability by counting, expected value, and probability with lengths and areas.', skills: ['comp.dice-coins', 'comp.probability-counting', 'comp.expected-value', 'comp.geometric-probability'] },
    ],
  };
  A.course(COURSE);

  /* ---------- Unit 1: counting ---------- */
  const DIGIT_RULES = {
    odd: { say: 'all of whose digits are odd', test: d => d.every(x => x % 2 === 1), count: n => 5 ** n, why: n => `Each of the ${n} places has 5 choices (1, 3, 5, 7, 9): 5<sup>${n}</sup>.` },
    even: { say: 'all of whose digits are even', test: d => d.every(x => x % 2 === 0), count: n => 4 * 5 ** (n - 1), why: n => `The first digit can't be 0, so it has 4 choices (2, 4, 6, 8); each other place has 5: 4 × 5<sup>${n - 1}</sup>.` },
    distinct: { say: 'with no digit repeated', test: d => new Set(d).size === d.length, count: n => { let r = 9; for (let k = 1; k < n; k++) r *= 10 - k; return r; }, why: n => `First digit: 9 choices (not 0). Then 9, 8, … for the rest: ${[9].concat(Array.from({ length: n - 1 }, (_, k) => 9 - k)).join(' × ')}.` },
    'no-seven': { say: 'that have no digit 7', test: d => !d.includes(7), count: n => 8 * 9 ** (n - 1), why: n => `First digit: 8 choices (not 0 or 7); each other place: 9 choices: 8 × 9<sup>${n - 1}</sup>.` },
    increasing: { say: 'whose digits strictly increase from left to right', test: d => d.every((x, i) => !i || x > d[i - 1]), count: n => choose(9, n), why: n => `Choose any ${n} different digits from 1 to 9 (0 can't lead an increasing number); there is exactly one increasing order: ${n === 3 ? '9 × 8 × 7 ÷ 6' : '9 × 8 × 7 × 6 ÷ 24'}.` },
    palindrome: { say: 'that read the same forward and backward', test: d => d.join('') === d.slice().reverse().join(''), count: n => 9 * 10 ** (Math.ceil(n / 2) - 1), why: n => `Only the first ${Math.ceil(n / 2)} digits are free (the rest mirror them): 9${Math.ceil(n / 2) > 1 ? ` × 10<sup>${Math.ceil(n / 2) - 1}</sup>` : ''}.` },
  };
  A.skill({
    id: 'comp.multiplication-principle', title: 'The multiplication principle',
    learn: p(`<b>If one choice can be made in ${V('a')} ways and the next in ${V('b')} ways, together they can be made in ${V('a')} × ${V('b')} ways.</b> Count place by place, and handle the most restricted place first: a leading digit can't be 0, a used digit can't be used again.`) +
      p(`Some counts are really choosing problems in disguise: a number with strictly increasing digits is decided completely by which digits it uses. And a palindrome is decided by its first half.`) +
      example('Example', `Three-digit numbers with no repeated digit: 9 choices for the first digit (1–9), 9 for the second (any but the first), 8 for the third: 9 × 9 × 8 = <b>648</b>.`),
    make(rng) {
      if (rng.chance(0.65)) {
        const rule = rng.pick(Object.keys(DIGIT_RULES)), n = rule === 'palindrome' ? rng.int(3, 5) : rng.int(3, 4), R = DIGIT_RULES[rule], ans = R.count(n);
        return { prompt: `How many ${n}-digit positive integers are there ${R.say}?`, type: 'number', answer: ans, params: { kind: 'digits', rule, n },
          hints: [`Count the choices for each place, starting with the hardest one.`, R.why(n), `That's <b>${N(ans)}</b>.`] };
      }
      const k = rng.int(3, 6), len = rng.int(3, 4), adj = rng.bool(), ans = adj ? k * (k - 1) ** (len - 1) : (() => { let r = 1; for (let t = 0; t < len; t++) r *= k - t; return r; })();
      return { prompt: `A lock code is ${len} digits long, using only the digits 1 to ${k}. ${adj ? 'Digits may repeat, but no two neighboring digits can be the same.' : 'No digit may be used more than once.'} How many codes are possible?`, type: 'number', answer: ans, params: { kind: 'code', k, len, adj },
        hints: [adj ? `The first digit has ${k} choices; every later digit just has to differ from the one before it: ${k - 1} choices.` : `The first digit has ${k} choices, the next ${k - 1}, and so on.`, `${adj ? `${k} × ${Array(len - 1).fill(k - 1).join(' × ')}` : Array.from({ length: len }, (_, t) => k - t).join(' × ')} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      let count = 0;
      if (P.kind === 'digits') {
        for (let v = 10 ** (P.n - 1); v < 10 ** P.n; v++) if (DIGIT_RULES[P.rule].test(String(v).split('').map(Number))) count++;
        return count === q.answer;
      }
      const total = P.k ** P.len;
      for (let c = 0; c < total; c++) {
        const d = []; let x = c; for (let t = 0; t < P.len; t++) { d.push(x % P.k); x = Math.floor(x / P.k); }
        if (P.adj ? d.every((v, i) => !i || v !== d[i - 1]) : new Set(d).size === d.length) count++;
      }
      return count === q.answer;
    },
  });

  const WORDS = ['LEVEL', 'APPLE', 'TEETH', 'BOOKS', 'GAMMA', 'PEPPER', 'TOMATO', 'COOKIE', 'LETTER', 'BANANA', 'CANOE', 'RADAR', 'PUZZLE', 'SEESAW', 'ADDED', 'MAMMAL'];
  A.skill({
    id: 'comp.arrangements', title: 'Arrangements',
    learn: p(`${V('n')} different objects can be lined up in <b>${V('n')}! = ${V('n')} × (${V('n')} − 1) × … × 1</b> ways. If some objects are identical, divide by the factorial of each repeat count: the letters of BOOK can be arranged in 4! ÷ 2! = 12 ways.`) +
      p(`<b>"Must be together"</b>: glue them into one block, arrange the blocks, then multiply by the ways to order inside the block. <b>"Must not be together"</b>: all arrangements minus the together ones. Around a round table, rotations count as the same, so ${V('n')} people can sit in (${V('n')} − 1)! ways.`) +
      example('Example', `5 friends in a row, with Ana and Ben side by side: glue them into one block, so 4 blocks give 4! = 24 orders, times 2 for Ana-Ben or Ben-Ana: <b>48</b>.`),
    make(rng) {
      const kind = rng.pick(['word', 'word', 'together', 'apart', 'circle']);
      if (kind === 'word') {
        const w = rng.pick(WORDS), cnt = {}; for (const ch of w) cnt[ch] = (cnt[ch] || 0) + 1;
        const reps = Object.entries(cnt).filter(([, c]) => c > 1), ans = fact(w.length) / reps.reduce((s, [, c]) => s * fact(c), 1);
        return { prompt: `How many different arrangements of the letters of the word ${w} are there?`, type: 'number', answer: ans, params: { kind, w },
          hints: [`${w.length} letters, with ${M.list(reps.map(([ch, c]) => `${ch} appearing ${c} times`))}.`, `${w.length}! ÷ (${reps.map(([, c]) => c + '!').join(' × ')}) = ${N(fact(w.length))} ÷ ${reps.reduce((s, [, c]) => s * fact(c), 1)} = <b>${N(ans)}</b>.`] };
      }
      const n = rng.int(4, 6), [a, b] = rng.sample(NAMES, 2);
      if (kind === 'circle') {
        return { prompt: `In how many different ways can ${n} people sit around a round table, if two seatings count as the same when everyone has the same neighbors on the left and on the right (one is a rotation of the other)?`, type: 'number', answer: fact(n - 1), params: { kind, n },
          hints: [`Seat one person anywhere: by rotating, every seating can be turned so that person is in that seat.`, `The other ${n - 1} fill the rest in (${n - 1})! = <b>${fact(n - 1)}</b> ways.`] };
      }
      const together = 2 * fact(n - 1), ans = kind === 'together' ? together : fact(n) - together;
      return { prompt: `${Word(n)} students, including ${a} and ${b}, line up in a row. In how many orders can they line up if ${a} and ${b} ${kind === 'together' ? 'must stand next to each other' : 'must not stand next to each other'}?`, type: 'number', answer: ans, params: { kind, n },
        hints: [`Together: treat ${a} and ${b} as one block. ${n - 1} blocks in ${n - 1}! = ${fact(n - 1)} orders, times 2 for their order inside the block: ${together}.`, kind === 'together' ? `So <b>${together}</b>.` : `All orders: ${n}! = ${fact(n)}. Not together: ${fact(n)} − ${together} = <b>${ans}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'word') return new Set(perms(P.w.split('')).map(x => x.join(''))).size === q.answer;
      const all = perms(Array.from({ length: P.n }, (_, i) => i));
      if (P.kind === 'circle') return new Set(all.map(r => { const k = r.indexOf(0); return r.slice(k).concat(r.slice(0, k)).join(','); })).size === q.answer;
      const adj = r => Math.abs(r.indexOf(0) - r.indexOf(1)) === 1;
      return all.filter(r => P.kind === 'together' ? adj(r) : !adj(r)).length === q.answer;
    },
  });

  A.skill({
    id: 'comp.choosing', title: 'Choosing groups (combinations)',
    learn: p(`When order doesn't matter, count the ordered choices and divide by the orders of each group: <b>${M.sub('C', '')}(${V('n')}, ${V('k')}) = ${V('n')}! ÷ (${V('k')}! (${V('n')} − ${V('k')})!)</b>. So choosing 3 of 8 is 8 × 7 × 6 ÷ 6 = 56.`) +
      p(`Handshakes, games in a round robin, and segments between points are all "choose 2". For "at least one", it's often fastest to <b>count everything and subtract the groups with none</b>.`) +
      example('Example', `A committee of 3 from 5 boys and 4 girls, with at least one girl: all committees C(9, 3) = 84, minus all-boy committees C(5, 3) = 10, gives <b>74</b>.`),
    make(rng) {
      const kind = rng.pick(['at-least-one', 'handshakes', 'triangles', 'mixed']);
      if (kind === 'at-least-one') {
        const b = rng.int(3, 7), g = rng.int(3, 7), k = rng.pick([2, 3, 4]), ans = choose(b + g, k) - choose(b, k);
        return { prompt: `A committee of ${k} is chosen from ${b} boys and ${g} girls. How many different committees include at least one girl?`, type: 'number', answer: ans, params: { kind, b, g, k },
          hints: [`All committees: C(${b + g}, ${k}) = ${choose(b + g, k)}.`, `Committees with no girl: C(${b}, ${k}) = ${choose(b, k)}.`, `${choose(b + g, k)} − ${choose(b, k)} = <b>${ans}</b>.`] };
      }
      if (kind === 'handshakes') {
        const n = rng.int(6, 30), games = rng.bool();
        return { prompt: games ? `In a chess club tournament, each of the ${n} players plays every other player exactly once. How many games are played?` : `At a party, each of ${n} people shakes hands with every other person exactly once. How many handshakes are there?`, type: 'number', answer: choose(n, 2), params: { kind, n },
          hints: [`Each ${games ? 'game' : 'handshake'} is a pair of people: C(${n}, 2).`, `${n} × ${n - 1} ÷ 2 = <b>${choose(n, 2)}</b>.`] };
      }
      if (kind === 'triangles') {
        const n = rng.int(5, 12), k = rng.pick([2, 3, 4]), shape = { 2: 'segments', 3: 'triangles', 4: 'quadrilaterals' }[k];
        return { prompt: `${Word(n)} points are marked on a circle. How many ${shape} can be drawn using ${k === 2 ? 'two' : k === 3 ? 'three' : 'four'} of these points as ${k === 2 ? 'endpoints' : 'vertices'}?`, type: 'number', answer: choose(n, k), params: { kind, n, k },
          hints: [`No three points on a circle are in a line, so every choice of ${k} points gives one ${shape.slice(0, -1)}.`, `C(${n}, ${k}) = <b>${choose(n, k)}</b>.`] };
      }
      const b = rng.int(3, 7), g = rng.int(3, 7), kb = rng.int(1, 2), kg = rng.int(1, 3), ans = choose(b, kb) * choose(g, kg);
      return { prompt: `A team is formed by choosing ${kb} of ${b} sixth graders and ${kg} of ${g} seventh graders. How many different teams are possible?`, type: 'number', answer: ans, params: { kind, b, g, kb, kg },
        hints: [`Choose each grade separately: C(${b}, ${kb}) = ${choose(b, kb)} and C(${g}, ${kg}) = ${choose(g, kg)}.`, `Multiply: <b>${ans}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      const groups = (n, k) => { const out = []; for (let m = 0; m < (1 << n); m++) if (popcount(m) === k) out.push(m); return out; };
      if (P.kind === 'at-least-one') { const girls = ((1 << P.g) - 1) << P.b; return groups(P.b + P.g, P.k).filter(m => m & girls).length === q.answer; }
      if (P.kind === 'handshakes') { let c = 0; for (let i = 0; i < P.n; i++) for (let j = i + 1; j < P.n; j++) c++; return c === q.answer; }
      if (P.kind === 'triangles') return groups(P.n, P.k).length === q.answer;
      return groups(P.b, P.kb).length * groups(P.g, P.kg).length === q.answer;
    },
  });

  A.skill({
    id: 'comp.overlaps', title: 'Counting with overlaps',
    learn: p(`When two groups overlap, adding them counts the overlap twice: <b>|${V('A')} or ${V('B')}| = |${V('A')}| + |${V('B')}| − |both|</b>. This is the inclusion-exclusion principle.`) +
      p(`For "divisible by 4 or 6" up to ${V('N')}: count multiples of 4, plus multiples of 6, minus multiples of both, which are the multiples of the LCM, 12. "Neither" is the total minus "either".`) +
      example('Example', `From 1 to 100: 25 multiples of 4, 16 multiples of 6, and 8 multiples of 12. Divisible by 4 or 6: 25 + 16 − 8 = <b>33</b>.`),
    make(rng) {
      if (rng.chance(0.6)) {
        let a, b; do { [a, b] = rng.sample([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15], 2); } while (a % b === 0 || b % a === 0);
        const Nn = rng.pick([50, 100, 120, 150, 200, 250, 300, 500, 1000]), L = lcm(a, b), na = Math.floor(Nn / a), nb = Math.floor(Nn / b), nl = Math.floor(Nn / L), either = na + nb - nl, ask = rng.pick(['either', 'neither']);
        return { prompt: `How many of the integers from 1 to ${N(Nn)} are ${ask === 'either' ? `divisible by ${a} or by ${b} (or both)` : `divisible by neither ${a} nor ${b}`}?`, type: 'number', answer: ask === 'either' ? either : Nn - either, params: { kind: 'multiples', a, b, Nn, ask },
          hints: [`Multiples of ${a}: ${na}. Multiples of ${b}: ${nb}. Multiples of both are multiples of ${L}: ${nl}.`, `Divisible by ${a} or ${b}: ${na} + ${nb} − ${nl} = ${either}.`, ask === 'either' ? `<b>${either}</b>.` : `Neither: ${N(Nn)} − ${either} = <b>${Nn - either}</b>.`] };
      }
      const T = rng.int(25, 40), both = rng.int(3, 9), a = both + rng.int(4, 10), b = both + rng.int(3, 9), neither = T - (a + b - both);
      if (neither < 0) return this.make(rng);
      const [s1, s2] = rng.pick([['play a sport', 'play an instrument'], ['have a dog', 'have a cat'], ['take Spanish', 'take art'], ['ride a bike to school', 'eat school lunch']]);
      return { prompt: `In a class of ${T} students, ${a} ${s1}, ${b} ${s2}, and ${both} do both. How many students do neither?`, type: 'number', answer: neither, params: { kind: 'venn', T, a, b, both },
        hints: [`Students who do at least one: ${a} + ${b} − ${both} = ${a + b - both} (the ${both} were counted twice).`, `Neither: ${T} − ${a + b - both} = <b>${neither}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'multiples') { let c = 0; for (let k = 1; k <= P.Nn; k++) { const hit = k % P.a === 0 || k % P.b === 0; if (P.ask === 'either' ? hit : !hit) c++; } return c === q.answer; }
      // seat the students: the first `both` do both, then the rest of each group, then everyone else
      const kids = Array.from({ length: P.T }, (_, i) => ({ s: i < P.a, t: i < P.both || (i >= P.a && i < P.a + P.b - P.both) }));
      return kids.filter(k => k.s).length === P.a && kids.filter(k => k.t).length === P.b && kids.filter(k => !k.s && !k.t).length === q.answer;
    },
  });

  A.skill({
    id: 'comp.paths-pages', title: 'Grid paths and page numbers',
    learn: p(`<b>Grid paths:</b> to go ${V('m')} blocks right and ${V('n')} blocks up, every shortest path is a string of ${V('m')} R's and ${V('n')} U's, so there are C(${V('m')} + ${V('n')}, ${V('m')}) of them. You can also count by writing at each corner the sum of the numbers from the left and from below.`) +
      p(`<b>Page numbers:</b> pages 1–9 use 1 digit each (9 digits), pages 10–99 use 2 each (180 digits), and pages 100–999 use 3 each. Count each group separately.`) +
      example('Example', `Numbering pages 1 to 120 uses 9 + 180 + 21 × 3 = <b>252</b> digits. Paths 3 right and 2 up: C(5, 2) = <b>10</b>.`),
    make(rng) {
      const kind = rng.pick(['paths', 'pages', 'pages-back']);
      if (kind === 'paths') {
        const m = rng.int(2, 7), n = rng.int(2, 6), ans = choose(m + n, m);
        return { prompt: `A city has a rectangular grid of streets. How many shortest routes are there from one corner to a spot ${m} blocks east and ${n} blocks north, moving only east or north along the streets?`, type: 'number', answer: ans, params: { kind, m, n },
          hints: [`Every shortest route is ${m + n} moves: ${m} east and ${n} north, in some order.`, `Choose which ${Math.min(m, n)} of the ${m + n} moves go ${m <= n ? 'east' : 'north'}: C(${m + n}, ${Math.min(m, n)}) = <b>${ans}</b>.`] };
      }
      const pages = rng.int(30, 400), digits = (n => { let d = 0; for (let k = 1; k <= n; k++) d += String(k).length; return d; })(pages);
      const parts = [Math.min(pages, 9), Math.max(0, Math.min(pages, 99) - 9), Math.max(0, pages - 99)];
      const work = `${parts[0]} × 1${parts[1] ? ` + ${parts[1]} × 2` : ''}${parts[2] ? ` + ${parts[2]} × 3` : ''} = ${N(digits)}`;
      if (kind === 'pages') return { prompt: `How many digits are printed in numbering the pages of a book from 1 to ${pages}?`, type: 'number', answer: digits, params: { kind, pages },
        hints: [`Group the pages: 1–9 (1 digit each), 10–99 (2 digits each)${pages > 99 ? `, 100–${pages} (3 digits each)` : ''}.`, `${work}, so <b>${N(digits)}</b> digits.`] };
      return { prompt: `The pages of a book are numbered 1, 2, 3, … and the printer uses ${N(digits)} digits in all. How many pages does the book have?`, type: 'number', answer: pages, params: { kind, digits },
        hints: [`Pages 1–9 use 9 digits and pages 10–99 use 180 more, ${digits > 189 ? `189 so far. The other ${digits - 189} digits are on 3-digit pages: ${digits - 189} ÷ 3 = ${(digits - 189) / 3} pages` : `so the 2-digit pages use ${digits - 9} digits: ${(digits - 9) / 2} pages`}.`, `The last page is <b>${pages}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'paths') { const g = Array.from({ length: P.n + 1 }, () => Array(P.m + 1).fill(1)); for (let y = 1; y <= P.n; y++) for (let x = 1; x <= P.m; x++) g[y][x] = g[y - 1][x] + g[y][x - 1]; return g[P.n][P.m] === q.answer; }
      let d = 0, k = 0;
      if (P.kind === 'pages') { for (k = 1; k <= P.pages; k++) d += String(k).length; return d === q.answer; }
      while (d < P.digits) { k++; d += String(k).length; } return d === P.digits && k === q.answer;
    },
  });

  /* ---------- Unit 2: number theory ---------- */
  const PR = [2, 3, 5, 7];
  /** "2³ × 3 × 5²" from exponents on 2, 3, 5, 7 */
  const factStr = ex => ex.map((e, i) => e ? (e === 1 ? `${PR[i]}` : M.sup(PR[i], e)) : null).filter(Boolean).join(' × ');
  const divisors = n => { const out = []; for (let d = 1; d <= n; d++) if (n % d === 0) out.push(d); return out; };
  A.skill({
    id: 'comp.divisors', title: 'Counting divisors',
    learn: p(`Write the number as a product of primes. <b>If ${V('n')} = ${M.sup(V('p'), V('a'))} × ${M.sup(V('q'), V('b'))} × …, then ${V('n')} has (${V('a')} + 1)(${V('b')} + 1)… positive divisors</b>, because a divisor uses each prime 0 to ${V('a')} times, 0 to ${V('b')} times, and so on.`) +
      p(`The same idea counts special divisors: an <b>odd</b> divisor uses no 2s, and a <b>perfect-square</b> divisor uses each prime an even number of times. The sum of the divisors is (1 + ${V('p')} + … + ${M.sup(V('p'), V('a'))})(1 + ${V('q')} + … + ${M.sup(V('q'), V('b'))})….`) +
      example('Example', `360 = ${M.sup(2, 3)} × ${M.sup(3, 2)} × 5 has (3 + 1)(2 + 1)(1 + 1) = <b>24</b> divisors. Its odd divisors: (2 + 1)(1 + 1) = 6.`),
    make(rng) {
      const kind = rng.pick(['count', 'count', 'odd', 'squares', 'sum']);
      let ex, n; do { ex = [rng.int(0, 5), rng.int(0, 3), rng.int(0, 2), rng.int(0, 1)]; n = ex.reduce((s, e, i) => s * PR[i] ** e, 1); } while (n < 24 || n > (kind === 'sum' ? 400 : 5000) || ex.filter(Boolean).length < 2);
      const f = factStr(ex);
      if (kind === 'sum') {
        const terms = ex.map((e, i) => e ? Array.from({ length: e + 1 }, (_, k) => PR[i] ** k) : null).filter(Boolean), ans = terms.reduce((s, t) => s * t.reduce((a, b) => a + b, 0), 1);
        return { prompt: `What is the sum of all the positive divisors of ${N(n)}?`, type: 'number', answer: ans, params: { kind, n },
          hints: [`${N(n)} = ${f}.`, `Sum = ${terms.map(t => `(${t.join(' + ')})`).join('')} = ${terms.map(t => t.reduce((a, b) => a + b, 0)).join(' × ')}.`, `= <b>${N(ans)}</b>.`] };
      }
      const use = ex.map((e, i) => kind === 'odd' ? (i === 0 ? 1 : e + 1) : kind === 'squares' ? Math.floor(e / 2) + 1 : e + 1), ans = use.reduce((s, x) => s * x, 1);
      const ask = { count: `How many positive divisors does ${N(n)} have?`, odd: `How many odd positive divisors does ${N(n)} have?`, squares: `How many of the positive divisors of ${N(n)} are perfect squares?` }[kind];
      const how = kind === 'count' ? `Each exponent plus one: ${ex.filter(Boolean).map(e => `(${e} + 1)`).join('')}` : kind === 'odd' ? `Use no 2s; for the other primes, exponent plus one: ${ex.slice(1).filter(Boolean).map(e => `(${e} + 1)`).join('') || '1'}` : `Each prime appears an even number of times: ${ex.map((e, i) => e ? `${Math.floor(e / 2) + 1} choice${Math.floor(e / 2) ? 's' : ''} for ${PR[i]}` : null).filter(Boolean).join(', ')}`;
      return { prompt: ask, type: 'number', answer: ans, params: { kind, n },
        hints: [`${N(n)} = ${f}.`, `${how}.`, `That's <b>${ans}</b>.`] };
    },
    verify(q) {
      const P = q.params, ds = divisors(P.n);
      const got = P.kind === 'sum' ? ds.reduce((s, d) => s + d, 0) : ds.filter(d => P.kind === 'count' || (P.kind === 'odd' ? d % 2 : Number.isInteger(Math.sqrt(d)))).length;
      return got === q.answer;
    },
  });

  A.skill({
    id: 'comp.gcd-lcm', title: 'GCF and LCM puzzles',
    learn: p(`Look for the question behind the story. Words like “together again”, “at the same time” or “the smallest number both divide” point to the <b>least common multiple (LCM)</b>. Words like “largest equal groups”, “biggest square tiles” or “split with nothing left over” point to the <b>greatest common factor (GCF)</b>.`) +
      p(`A useful fact: for any two positive whole numbers, <b>GCF × LCM = the product of the two numbers</b>.`) +
      example('Example', `Two lights blink every 12 and 18 seconds and blink together now. They next blink together after LCM(12, 18) = <b>36</b> seconds. A 48 × 60 floor takes square tiles up to GCF(48, 60) = 12 on a side.`),
    make(rng) {
      const kind = rng.pick(['flash', 'tiles', 'product', 'kits']);
      if (kind === 'flash') {
        const three = rng.bool(), ts = rng.sample([4, 6, 8, 9, 10, 12, 15, 18, 20, 24], three ? 3 : 2).sort((a, b) => a - b), L = ts.reduce(lcm), ask = rng.bool() ? 'next' : 'count', span = 600 * rng.int(1, 3);
        const ans = ask === 'next' ? L : Math.floor(span / L);
        return { prompt: `${three ? 'Three' : 'Two'} lights blink every ${M.list(ts.map(String))} seconds. They all blink together right now. ${ask === 'next' ? 'After how many seconds will they next all blink together?' : `How many more times will they all blink together in the next ${span / 60} minutes?`}`, type: 'number', answer: ans, params: { kind, ts, ask, span },
          hints: [`They blink together at every common multiple, so find LCM(${ts.join(', ')}) = ${L}.`, ask === 'next' ? `<b>${L}</b> seconds.` : `${span / 60} minutes is ${span} seconds; ${span} ÷ ${L} rounded down is <b>${ans}</b>.`] };
      }
      if (kind === 'tiles') {
        const g = rng.pick([2, 3, 4, 5, 6, 8, 12]); let u, v; do { u = rng.int(2, 9); v = rng.int(2, 9); } while (gcd(u, v) !== 1 || u === v);
        const W = g * u, H = g * v, ask = rng.pick(['side', 'count']), ans = ask === 'side' ? g : u * v;
        return { prompt: `A rectangular floor is ${W} feet by ${H} feet. It will be covered exactly with identical square tiles, as large as possible, with no cutting. ${ask === 'side' ? 'What is the side length of each tile, in feet?' : 'How many tiles are needed?'}`, type: 'number', answer: ans, params: { kind, W, H, ask },
          hints: [`The largest square that fits both lengths evenly is GCF(${W}, ${H}) = ${g} feet.`, ask === 'side' ? `Each tile is <b>${g}</b> feet on a side.` : `${W / g} tiles across and ${H / g} down: ${W / g} × ${H / g} = <b>${u * v}</b> tiles.`] };
      }
      if (kind === 'product') {
        const g = rng.int(2, 12); let u, v; do { u = rng.int(2, 9); v = rng.int(2, 9); } while (gcd(u, v) !== 1 || u === v);
        const a = g * u, b = g * v, L = g * u * v;
        return { prompt: `The greatest common factor of ${a} and a positive integer ${V('n')} is ${g}, and their least common multiple is ${L}. What is ${V('n')}?`, type: 'number', answer: b, params: { kind, a, g, L },
          hints: [`GCF × LCM = the product of the two numbers: ${g} × ${L} = ${a} × ${V('n')}.`, `${V('n')} = ${g * L} ÷ ${a} = <b>${b}</b>.`] };
      }
      const g = rng.pick([4, 6, 8, 9, 12, 15]); let u, v; do { u = rng.int(2, 9); v = rng.int(2, 9); } while (gcd(u, v) !== 1 || u === v);
      const who = rng.pick(NAMES), [x, y] = rng.pick([['pencils', 'erasers'], ['red beads', 'blue beads'], ['granola bars', 'water bottles'], ['stickers', 'bookmarks']]);
      return { prompt: `${who} has ${g * u} ${x} and ${g * v} ${y} to pack into identical kits, with every item used and nothing left over. What is the greatest number of kits ${who} can make?`, type: 'number', answer: g, params: { kind, a: g * u, b: g * v },
        hints: [`The number of kits must divide both ${g * u} and ${g * v}.`, `The greatest such number is GCF(${g * u}, ${g * v}) = <b>${g}</b> (each kit gets ${u} ${x} and ${v} ${y}).`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'flash') { let t = 0, hits = 0, first = 0; while (t < 100000) { t++; if (P.ts.every(s => t % s === 0)) { if (!first) first = t; if (t <= P.span) hits++; if (t > P.span && first) break; } } return (P.ask === 'next' ? first : hits) === q.answer; }
      if (P.kind === 'tiles') { let best = 1; for (let s = 1; s <= Math.min(P.W, P.H); s++) if (P.W % s === 0 && P.H % s === 0) best = s; return (P.ask === 'side' ? best : (P.W / best) * (P.H / best)) === q.answer; }
      if (P.kind === 'product') { const b = q.answer; let g = 1; for (let d = 1; d <= Math.min(P.a, b); d++) if (P.a % d === 0 && b % d === 0) g = d; let l = Math.max(P.a, b); while (l % P.a || l % b) l++; return g === P.g && l === P.L; }
      let best = 0; for (let k = 1; k <= P.a; k++) if (P.a % k === 0 && P.b % k === 0) best = k; return best === q.answer;
    },
  });

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  A.skill({
    id: 'comp.remainders', title: 'Remainders and cycles',
    learn: p(`<b>Remainders follow the arithmetic</b>: if ${X} leaves remainder 3 when divided by 7, then 5${X} + 2 leaves the same remainder as 5 × 3 + 2 = 17, which is 3. You never need ${X} itself.`) +
      p(`Days of the week repeat every 7, so <b>only the remainder after dividing by 7 matters</b>. Powers also repeat: list the remainders of 2, 4, 8, 16, … until they cycle, then use where the exponent falls in the cycle.`) +
      example('Example', `100 days after a Tuesday: 100 = 14 × 7 + 2, so it's 2 days after Tuesday, a <b>Thursday</b>. The remainders of powers of 2 when divided by 7 cycle 2, 4, 1, so 2<sup>50</sup> (50 = 3 × 16 + 2) leaves <b>4</b>.`),
    make(rng) {
      const kind = rng.pick(['linear', 'weekday', 'power', 'two-rules']);
      if (kind === 'linear') {
        const m = rng.pick([5, 6, 7, 8, 9, 11, 12, 13]), r = rng.int(1, m - 1), k = rng.pick([2, 3, 4, 5, 6, 7, 8, 9].filter(v => v % m)), c = rng.int(0, 15), ans = (k * r + c) % m;
        return { prompt: `When a whole number ${V('n')} is divided by ${m}, the remainder is ${r}. What is the remainder when ${M.poly([k, c], 'n')} is divided by ${m}?`, type: 'number', answer: ans, params: { kind, m, r, k, c },
          hints: [`Replace ${V('n')} by its remainder: ${k} × ${r}${c ? ` + ${c}` : ''} = ${k * r + c}.`, `${k * r + c} divided by ${m} leaves <b>${ans}</b>.`] };
      }
      if (kind === 'weekday') {
        const d0 = rng.int(0, 6), n = rng.int(40, 1000), dir = rng.bool() ? 'after' : 'before', answer = DAYS[((d0 + (dir === 'after' ? n : -n)) % 7 + 7) % 7];
        return { prompt: `Today is ${DAYS[d0]}. What day of the week was it, or will it be, ${n} days ${dir === 'after' ? 'from today' : 'ago'}?`, type: 'choice', answer, choices: [...new Set([answer, DAYS[(DAYS.indexOf(answer) + 1) % 7], DAYS[(DAYS.indexOf(answer) + 6) % 7], DAYS[d0], DAYS[(DAYS.indexOf(answer) + 2) % 7]])].slice(0, 4), params: { kind, d0, n, dir },
          hints: [`${n} = ${Math.floor(n / 7)} × 7 + ${n % 7}: whole weeks don't change the day.`, `${n % 7} day${n % 7 === 1 ? '' : 's'} ${dir === 'after' ? 'after' : 'before'} ${DAYS[d0]} is <b>${answer}</b>.`] };
      }
      if (kind === 'power') {
        const b = rng.pick([2, 3, 4, 5, 6, 7]), m = rng.pick([5, 7, 9, 11, 13].filter(x => gcd(x, b) === 1)), e = rng.int(20, 99), cyc = [];
        let v = b % m; while (!cyc.includes(v)) { cyc.push(v); v = v * b % m; }
        const L = cyc.length, ans = cyc[(e - 1) % L];
        return { prompt: `What is the remainder when ${M.sup(b, e)} is divided by ${m}?`, type: 'number', answer: ans, params: { kind, b, m, e },
          hints: [`Remainders of ${b}, ${M.sup(b, 2)}, ${M.sup(b, 3)}, … divided by ${m}: ${cyc.join(', ')}, then they repeat (a cycle of ${L}).`, `${e} = ${Math.floor((e - 1) / L)} × ${L} + ${(e - 1) % L + 1}, so ${M.sup(b, e)} is in position ${(e - 1) % L + 1} of the cycle.`, `The remainder is <b>${ans}</b>.`] };
      }
      let m1, m2; do { [m1, m2] = rng.sample([3, 4, 5, 7, 8, 9], 2); } while (gcd(m1, m2) !== 1);
      const r1 = rng.int(1, m1 - 1), r2 = rng.int(1, m2 - 1); let x = 1; while (x % m1 !== r1 || x % m2 !== r2) x++;
      return { prompt: `What is the smallest positive integer that leaves a remainder of ${r1} when divided by ${m1} and a remainder of ${r2} when divided by ${m2}?`, type: 'number', answer: x, params: { kind, m1, r1, m2, r2 },
        hints: [`List numbers with remainder ${r2} when divided by ${m2}: ${Array.from({ length: 5 }, (_, k) => r2 + k * m2).join(', ')}, …`, `Check each one divided by ${m1} until the remainder is ${r1}.`, `The smallest is <b>${x}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'linear') { const n = P.r + 5 * P.m; return (P.k * n + P.c) % P.m === q.answer; }
      if (P.kind === 'weekday') { let d = P.d0; for (let i = 0; i < P.n; i++) d = (d + (P.dir === 'after' ? 1 : 6)) % 7; return q.answer === DAYS[d]; }
      if (P.kind === 'power') { let r = 1; for (let i = 0; i < P.e; i++) r = r * P.b % P.m; return r === q.answer; }
      for (let x = 1; x < q.answer; x++) if (x % P.m1 === P.r1 && x % P.m2 === P.r2) return false;
      return q.answer % P.m1 === P.r1 && q.answer % P.m2 === P.r2;
    },
  });

  A.skill({
    id: 'comp.units-digit', title: 'Units digits',
    learn: p(`<b>The units digit of a product depends only on the units digits of the factors.</b> So to find the units digit of a big power, follow only the last digit: powers of 7 end in 7, 9, 3, 1, 7, 9, 3, 1, … a cycle of 4.`) +
      p(`Every last digit cycles with length 1, 2 or 4. Divide the exponent by the cycle length and use the remainder (a remainder of 0 means the last spot in the cycle).`) +
      example('Example', `The units digit of ${M.sup(17, 2026)}: 7's cycle is 7, 9, 3, 1, and 2026 = 4 × 506 + 2, so it's the 2nd entry: <b>9</b>.`),
    make(rng) {
      const kind = rng.pick(['power', 'power', 'sum', 'product']);
      const base = () => { let b; do { b = rng.int(2, 39); } while (b % 10 === 0 || b % 10 === 1 || b % 10 === 5 || b % 10 === 6); return b; };
      const cycle = d => { const c = []; let v = d % 10; while (!c.includes(v)) { c.push(v); v = v * d % 10; } return c; };
      const ud = (b, e) => { const c = cycle(b % 10); return c[(e - 1) % c.length]; };
      if (kind === 'power' || kind === 'sum') {
        const b1 = base(), e1 = rng.int(20, 2030), b2 = base(), e2 = rng.int(20, 999);
        if (kind === 'power') {
          const c = cycle(b1 % 10), ans = ud(b1, e1);
          return { prompt: `What is the units digit of ${M.sup(b1, e1)}?`, type: 'number', answer: ans, params: { kind, terms: [[b1, e1]] },
            hints: [`Follow the last digit of the powers of ${b1 % 10}: ${c.join(', ')}, then it repeats (cycle of ${c.length}).`, `${e1} divided by ${c.length} leaves ${e1 % c.length}${e1 % c.length ? '' : ', the last spot in the cycle'}.`, `The units digit is <b>${ans}</b>.`] };
        }
        const ans = (ud(b1, e1) + ud(b2, e2)) % 10;
        return { prompt: `What is the units digit of ${M.sup(b1, e1)} + ${M.sup(b2, e2)}?`, type: 'number', answer: ans, params: { kind, terms: [[b1, e1], [b2, e2]] },
          hints: [`Find each units digit separately: ${M.sup(b1, e1)} ends in ${ud(b1, e1)} and ${M.sup(b2, e2)} ends in ${ud(b2, e2)}.`, `${ud(b1, e1)} + ${ud(b2, e2)} = ${ud(b1, e1) + ud(b2, e2)}, so the units digit is <b>${ans}</b>.`] };
      }
      const fs = Array.from({ length: rng.int(4, 6) }, () => { let f; do { f = rng.int(11, 99); } while (f % 10 === 0); return f; }), ans = fs.reduce((s, f) => s * (f % 10) % 10, 1);
      return { prompt: `What is the units digit of the product ${fs.join(' × ')}?`, type: 'number', answer: ans, params: { kind, fs },
        hints: [`Only the units digits matter: ${fs.map(f => f % 10).join(' × ')}.`, `Multiply step by step, keeping only the last digit each time: <b>${ans}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      const pw = (b, e) => { let r = 1n; const B = BigInt(b) % 10n; for (let i = 0; i < e; i++) r = r * B % 10n; return Number(r); };
      if (P.kind === 'product') return Number(P.fs.reduce((s, f) => s * BigInt(f), 1n) % 10n) === q.answer;
      return P.terms.reduce((s, [b, e]) => s + pw(b, e), 0) % 10 === q.answer;
    },
  });

  A.skill({
    id: 'comp.digit-rules', title: 'Divisibility rules and digits',
    learn: p(`<b>Divisible by 3 or 9:</b> the digit sum is divisible by 3 or 9. <b>By 11:</b> the alternating sum of the digits (add, subtract, add, …) is divisible by 11. <b>By 4:</b> the last two digits form a multiple of 4. <b>By 6:</b> even and divisible by 3.`) +
      p(`Numbers like 10<sup>${V('n')}</sup> − 7 are all 9s followed by a few other digits: 1,000 − 7 = 993. Work out a small case and look for the pattern.`) +
      example('Example', `For 4☐72 to be divisible by 9, 4 + ☐ + 7 + 2 = 13 + ☐ must be a multiple of 9, so ☐ = <b>5</b>. And 10<sup>6</sup> − 7 = 999,993, with digit sum 5 × 9 + 3 = 48.`),
    make(rng) {
      const kind = rng.pick(['nine', 'eleven', 'six-count', 'digit-sum']);
      if (kind === 'nine' || kind === 'eleven') {
        let digits, pos, ok;
        do {
          digits = Array.from({ length: rng.int(4, 6) }, (_, i) => rng.int(i ? 0 : 1, 9)); pos = rng.int(1, digits.length - 1);
          ok = [...Array(10).keys()].filter(d => { const t = digits.slice(); t[pos] = d; return kind === 'nine' ? t.reduce((s, x) => s + x, 0) % 9 === 0 : t.reduce((s, x, i) => s + (i % 2 ? -x : x), 0) % 11 === 0; });
        } while (ok.length !== 1);
        const shown = digits.map((d, i) => i === pos ? '☐' : d).join(''), ans = ok[0];
        return { prompt: `What digit goes in the box so that the number ${shown} is divisible by ${kind === 'nine' ? 9 : 11}?`, type: 'number', answer: ans, params: { kind, digits, pos },
          hints: [kind === 'nine' ? `The digit sum must be a multiple of 9. Without the box: ${digits.filter((_, i) => i !== pos).join(' + ')} = ${digits.reduce((s, x, i) => s + (i === pos ? 0 : x), 0)}.` : `The alternating sum (add, subtract, add, …) must be a multiple of 11 (0 counts).`, `The only digit that works is <b>${ans}</b>.`] };
      }
      if (kind === 'six-count') {
        const d = [rng.int(1, 9), rng.int(0, 9), null, rng.pick([0, 2, 4, 6, 8])], pos = 2, ok = [...Array(10).keys()].filter(x => (d[0] + d[1] + x + d[3]) % 3 === 0);
        return { prompt: `How many digits could go in the box to make the number ${d[0]}${d[1]}☐${d[3]} divisible by 6?`, type: 'number', answer: ok.length, params: { kind, d, pos },
          hints: [`It ends in ${d[3]}, so it's already even. It also needs a digit sum divisible by 3: ${d[0] + d[1] + d[3]} + ☐.`, `The box can be ${M.list(ok.map(String), 'or')}: <b>${ok.length}</b> digits.`] };
      }
      const n = rng.int(5, 30), k = rng.int(2, 99), str = String(10 ** 2 - k).padStart(2, '0'), ds = 9 * (n - 2) + str.split('').reduce((s, c) => s + Number(c), 0);
      return { prompt: `What is the sum of the digits of 10<sup>${n}</sup> − ${k}?`, type: 'number', answer: ds, params: { kind, n, k },
        hints: [`Try a small case: 10<sup>4</sup> − ${k} = ${N(10000 - k)}. The answer is ${n - 2} nines followed by ${str}.`, `Digit sum: 9 × ${n - 2} + ${str.split('').join(' + ')} = <b>${ds}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'digit-sum') return (10n ** BigInt(P.n) - BigInt(P.k)).toString().split('').reduce((s, c) => s + Number(c), 0) === q.answer;
      if (P.kind === 'six-count') { let c = 0; for (let x = 0; x <= 9; x++) if (Number(`${P.d[0]}${P.d[1]}${x}${P.d[3]}`) % 6 === 0) c++; return c === q.answer; }
      const hits = []; for (let x = 0; x <= 9; x++) { const t = P.digits.slice(); t[P.pos] = x; if (BigInt(t.join('')) % (P.kind === 'nine' ? 9n : 11n) === 0n) hits.push(x); }
      return hits.length === 1 && hits[0] === q.answer;
    },
  });

  const zerosOf = n => { let z = 0; for (let p = 5; p <= n; p *= 5) z += Math.floor(n / p); return z; };
  A.skill({
    id: 'comp.trailing-zeros', title: 'Zeros at the end',
    learn: p(`Each zero at the end of a number comes from a factor of 10 = 2 × 5. So <b>count the 2s and the 5s in the prime factorization; the number of zeros is the smaller count</b>.`) +
      p(`In ${V('n')}! there are always more 2s than 5s, so count the 5s: <b>⌊${V('n')} ÷ 5⌋ + ⌊${V('n')} ÷ 25⌋ + ⌊${V('n')} ÷ 125⌋ + …</b> (25 = 5 × 5 gives an extra 5, and so on).`) +
      example('Example', `100! ends in 100 ÷ 5 + 100 ÷ 25 = 20 + 4 = <b>24</b> zeros. And ${M.sup(20, 3)} × ${M.sup(15, 2)} has 2s: 6, 5s: 3 + 2 = 5, so it ends in 5 zeros.`),
    make(rng) {
      const kind = rng.pick(['factorial', 'factorial', 'product', 'reverse']);
      if (kind === 'factorial') {
        const n = rng.int(12, 200), z = zerosOf(n), parts = []; for (let p5 = 5; p5 <= n; p5 *= 5) parts.push(Math.floor(n / p5));
        return { prompt: `How many zeros are at the end of ${n}! (the product of the whole numbers from 1 to ${n})?`, type: 'number', answer: z, params: { kind, n },
          hints: [`Count the factors of 5: multiples of 5, plus an extra one for each multiple of 25${n >= 125 ? ', and another for 125' : ''}.`, `${parts.join(' + ')} = <b>${z}</b>.`] };
      }
      if (kind === 'product') {
        const F2 = { 2: [1, 0], 4: [2, 0], 5: [0, 1], 6: [1, 0], 8: [3, 0], 12: [2, 0], 15: [0, 1], 20: [2, 1], 25: [0, 2], 40: [3, 1], 50: [1, 2], 75: [0, 2], 125: [0, 3] };
        let a, b; do { [a, b] = rng.sample(Object.keys(F2).map(Number), 2); } while ((F2[a][0] + F2[b][0]) === 0 || (F2[a][1] + F2[b][1]) === 0);
        const ea = rng.int(2, 8), eb = rng.int(2, 8), twos = F2[a][0] * ea + F2[b][0] * eb, fives = F2[a][1] * ea + F2[b][1] * eb, z = Math.min(twos, fives);
        return { prompt: `How many zeros are at the end of ${M.sup(a, ea)} × ${M.sup(b, eb)} when it is multiplied out?`, type: 'number', answer: z, params: { kind, a, ea, b, eb },
          hints: [`Count the prime factors: 2s: ${twos}; 5s: ${fives}.`, `Each 10 needs one 2 and one 5, so there are <b>${z}</b> zeros.`] };
      }
      const n = 5 * rng.int(3, 40), z = zerosOf(n);
      return { prompt: `What is the smallest whole number ${V('n')} such that ${V('n')}! ends in exactly ${z} zeros?`, type: 'number', answer: n, params: { kind, z },
        hints: [`${V('n')}! gains zeros only at multiples of 5. Estimate: ${V('n')} is a bit less than 5 × ${z} = ${5 * z}.`, `Check: ${n}! has ${z} zeros and ${n - 1}! has ${zerosOf(n - 1)}. So <b>${V('n')} = ${n}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      const tz = v => { let s = v.toString(), c = 0; while (s.endsWith('0')) { s = s.slice(0, -1); c++; } return c; };
      const bigFact = n => { let r = 1n; for (let k = 2n; k <= BigInt(n); k++) r *= k; return r; };
      if (P.kind === 'factorial') return tz(bigFact(P.n)) === q.answer;
      if (P.kind === 'product') return tz(BigInt(P.a) ** BigInt(P.ea) * BigInt(P.b) ** BigInt(P.eb)) === q.answer;
      for (let n = 1; n < q.answer; n++) if (zerosOf(n) === P.z) return false;
      return tz(bigFact(q.answer)) === P.z;
    },
  });

  /* ---------- Unit 3: clever algebra ---------- */
  A.skill({
    id: 'comp.algebra-identities', title: 'Algebra shortcuts',
    learn: p(`Contest problems reward using identities instead of brute force. The big three: <b>(${X} + ${Y})² = ${M.sup(X, 2)} + 2${X}${Y} + ${M.sup(Y, 2)}</b>, <b>(${X} − ${Y})² = ${M.sup(X, 2)} − 2${X}${Y} + ${M.sup(Y, 2)}</b>, and <b>${M.sup(X, 2)} − ${M.sup(Y, 2)} = (${X} + ${Y})(${X} − ${Y})</b>.`) +
      p(`If you know ${X} + ${Y} and ${X}${Y}, you can find ${M.sup(X, 2)} + ${M.sup(Y, 2)} = (${X} + ${Y})² − 2${X}${Y} without finding ${X} and ${Y}. And products like 98 × 102 are (100 − 2)(100 + 2) = 10,000 − 4.`) +
      example('Example', `${X} + ${Y} = 9 and ${X}${Y} = 14, so ${M.sup(X, 2)} + ${M.sup(Y, 2)} = 81 − 28 = <b>53</b>. And 1,003² − 997² = (2,000)(6) = <b>12,000</b>.`),
    make(rng) {
      const kind = rng.pick(['sum-product', 'sum-product', 'squares', 'near']);
      if (kind === 'sum-product') {
        let x, y; do { x = rng.int(-6, 12); y = rng.int(-6, 12); } while (x === y || !x || !y);
        const s = x + y, pr = x * y, ask = rng.pick(['sq', 'diff', 'recip', 'cube']);
        const out = { sq: [s * s - 2 * pr, 1], diff: [s * s - 4 * pr, 1], recip: [s, pr], cube: [s ** 3 - 3 * pr * s, 1] }[ask], ans = fa(out[0], out[1]);
        const what = { sq: `${M.sup(X, 2)} + ${M.sup(Y, 2)}`, diff: `(${X} − ${Y})²`, recip: `${F(1, X)} + ${F(1, Y)}`, cube: `${M.sup(X, 3)} + ${M.sup(Y, 3)}` }[ask];
        const how = { sq: `(${X} + ${Y})² − 2${X}${Y} = ${N(s * s)} − ${par(2 * pr)}`, diff: `(${X} + ${Y})² − 4${X}${Y} = ${N(s * s)} − ${par(4 * pr)}`, recip: `${F(`${X} + ${Y}`, `${X}${Y}`)} = ${F(s, pr, { raw: true })}`, cube: `(${X} + ${Y})³ − 3${X}${Y}(${X} + ${Y}) = ${N(s ** 3)} − ${par(3 * pr * s)}` }[ask];
        return { prompt: `If ${X} + ${Y} = ${N(s)} and ${X}${Y} = ${N(pr)}, what is the value of ${what}?`, type: 'number', ...ans, params: { kind, s, pr, ask },
          hints: [`Write ${what} using only ${X} + ${Y} and ${X}${Y}.`, `${what} = ${how}.`, `= <b>${ans$(ans)}</b>.`] };
      }
      if (kind === 'squares') {
        const a = rng.int(40, 3000), d = rng.int(2, 12), b = a - d, ans = a * a - b * b;
        return { prompt: `What is the value of ${N(a)}² − ${N(b)}²?`, type: 'number', answer: ans, params: { kind, a, b },
          hints: [`Use ${M.sup(V('a'), 2)} − ${M.sup(V('b'), 2)} = (${V('a')} + ${V('b')})(${V('a')} − ${V('b')}).`, `(${N(a)} + ${N(b)})(${N(a)} − ${N(b)}) = ${N(a + b)} × ${d} = <b>${N(ans)}</b>.`] };
      }
      const c = rng.pick([20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 1000]), d = rng.int(1, 9), ans = c * c - d * d;
      return { prompt: `What is the value of ${N(c - d)} × ${N(c + d)}?`, type: 'number', answer: ans, params: { kind, a: c - d, b: c + d },
        hints: [`The two numbers are ${N(c)} − ${d} and ${N(c)} + ${d}, so the product is ${N(c)}² − ${d}².`, `${N(c * c)} − ${d * d} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'sum-product') {
        const r = Math.sqrt(P.s * P.s - 4 * P.pr), x = (P.s + r) / 2, y = (P.s - r) / 2;
        return near({ sq: x * x + y * y, diff: (x - y) ** 2, recip: 1 / x + 1 / y, cube: x ** 3 + y ** 3 }[P.ask], q.answer, 1e-9);
      }
      if (P.kind === 'squares') return BigInt(P.a) ** 2n - BigInt(P.b) ** 2n === BigInt(q.answer);
      return P.a * P.b === q.answer;
    },
  });

  A.skill({
    id: 'comp.series', title: 'Sums of sequences',
    learn: p(`<b>To add an arithmetic sequence, pair the first and last terms</b>: the sum is (number of terms) × (first + last) ÷ 2. So 1 + 2 + … + 100 = 100 × 101 ÷ 2 = 5,050.`) +
      p(`The number of terms in ${V('a')}, ${V('a')} + ${V('d')}, …, ${V('L')} is <b>(${V('L')} − ${V('a')}) ÷ ${V('d')} + 1</b> (the +1 is easy to forget). The first ${V('n')} odd numbers add to ${M.sup(V('n'), 2)}.`) +
      example('Example', `7 + 11 + 15 + … + 99: there are (99 − 7) ÷ 4 + 1 = 24 terms, so the sum is 24 × (7 + 99) ÷ 2 = <b>1,272</b>.`),
    make(rng) {
      const kind = rng.pick(['count', 'sum', 'sum', 'odd', 'even-odd']);
      if (kind === 'count' || kind === 'sum') {
        const a = rng.int(1, 20), d = rng.int(2, 9), n = rng.int(12, 60), L = a + (n - 1) * d, S = n * (a + L) / 2;
        return { prompt: kind === 'count' ? `How many numbers are in the list ${a}, ${a + d}, ${a + 2 * d}, …, ${N(L)}?` : `What is the sum ${a} + ${a + d} + ${a + 2 * d} + … + ${N(L)}?`, type: 'number', answer: kind === 'count' ? n : S, params: { kind, a, d, L },
          hints: [`The numbers go up by ${d}: (${N(L)} − ${a}) ÷ ${d} + 1 = ${n} terms.`, kind === 'count' ? `<b>${n}</b> numbers.` : `Sum = ${n} × (${a} + ${N(L)}) ÷ 2 = <b>${N(S)}</b>.`] };
      }
      if (kind === 'odd') {
        const n = rng.int(10, 80), L = 2 * n - 1;
        return { prompt: `What is the sum of all the odd numbers from 1 to ${L}?`, type: 'number', answer: n * n, params: { kind, L },
          hints: [`There are (${L} + 1) ÷ 2 = ${n} odd numbers from 1 to ${L}.`, `The first ${n} odd numbers add to ${n}² = <b>${N(n * n)}</b>.`] };
      }
      const n = rng.int(20, 300);
      return { prompt: `What is the value of (2 + 4 + 6 + … + ${2 * n}) − (1 + 3 + 5 + … + ${2 * n - 1})?`, type: 'number', answer: n, params: { kind, n },
        hints: [`Pair the terms: (2 − 1) + (4 − 3) + … + (${2 * n} − ${2 * n - 1}).`, `There are ${n} pairs, each equal to 1: <b>${n}</b>.`] };
    },
    verify(q) {
      const P = q.params; let s = 0, c = 0;
      if (P.kind === 'count' || P.kind === 'sum') { for (let v = P.a; v <= P.L; v += P.d) { s += v; c++; } return (P.kind === 'count' ? c : s) === q.answer; }
      if (P.kind === 'odd') { for (let v = 1; v <= P.L; v += 2) s += v; return s === q.answer; }
      for (let v = 1; v <= 2 * P.n; v++) s += v % 2 ? -v : v; return s === q.answer;
    },
  });

  const PAIRS = []; for (let a = 2; a <= 40; a++) for (let b = a + 1; b <= 60; b++) if ((a * b) % (a + b) === 0) PAIRS.push([a, b]);
  A.skill({
    id: 'comp.work-rate', title: 'Working together',
    learn: p(`<b>Add rates, not times.</b> If a job takes ${V('a')} hours, the rate is ${F(1, V('a'))} of the job per hour. Two workers together do ${F(1, V('a'))} + ${F(1, V('b'))} per hour, so the job takes 1 ÷ (${F(1, V('a'))} + ${F(1, V('b'))}) hours.`) +
      p(`A drain works against you: its rate is subtracted. To find one worker's time from the time together, subtract rates: ${F(1, V('b'))} = ${F(1, V('t'))} − ${F(1, V('a'))}.`) +
      example('Example', `One pipe fills a tank in 3 hours and another in 6 hours. Together: ${F(1, 3)} + ${F(1, 6)} = ${F(1, 2)} of the tank per hour, so <b>2 hours</b>.`),
    make(rng) {
      const kind = rng.pick(['together', 'other', 'drain']), [a, b] = rng.pick(PAIRS), t = a * b / (a + b), [w1, w2] = rng.sample(NAMES, 2);
      const job = rng.pick(['paint a fence', 'mow a large lawn', 'wash all the windows of a building', 'stack a load of firewood']);
      if (kind === 'together') {
        return { prompt: `${w1} can ${job} alone in ${a} hours, and ${w2} can do it alone in ${b} hours. Working together at these rates, how many hours will it take them?`, type: 'number', answer: t, unit: 'hours', params: { kind, a, b },
          hints: [`Rates: ${F(1, a)} and ${F(1, b)} of the job per hour. Together: ${F(1, a)} + ${F(1, b)} = ${F(a + b, a * b)}.`, `Time = 1 ÷ ${F(a + b, a * b)} = <b>${t}</b> hours.`] };
      }
      if (kind === 'other') {
        return { prompt: `Working together, ${w1} and ${w2} can ${job} in ${t} hours. ${w1} alone takes ${b} hours. How many hours would ${w2} take alone?`, type: 'number', answer: a, unit: 'hours', params: { kind, t, b },
          hints: [`${w2}'s rate = together's rate − ${w1}'s rate = ${F(1, t)} − ${F(1, b)}.`, `= ${F(b - t, t * b)}, so ${w2} takes <b>${a}</b> hours.`] };
      }
      const fill = rng.int(2, 8), drain = fill + rng.int(1, 8), ans = fa(fill * drain, drain - fill);
      return { prompt: `A pipe can fill an empty tank in ${fill} hours, and a drain can empty a full tank in ${drain} hours. If the tank starts empty and both are open, how many hours does it take to fill?`, type: 'number', ...ans, unit: 'hours', params: { kind, fill, drain },
        hints: [`Net rate: ${F(1, fill)} − ${F(1, drain)} = ${F(drain - fill, fill * drain)} of the tank per hour.`, `Time = 1 ÷ ${F(drain - fill, fill * drain)} = <b>${ans$(ans)}</b> hours.`] };
    },
    verify(q) {
      const P = q.params;
      // run the job in small time steps and see when it's done
      const run = rate => { let done = 0, steps = 0; const h = 1 / 3600; while (done < 1 - 1e-12 && steps < 1e6) { done += rate * h; steps++; } return steps * h; };
      if (P.kind === 'together') return near(run(1 / P.a + 1 / P.b), q.answer, 0.001);
      if (P.kind === 'other') return near(1 / P.t - 1 / P.b, 1 / q.answer, 1e-9);
      return near(run(1 / P.fill - 1 / P.drain), q.answer, 0.001);
    },
  });

  /** pairs of driving speeds whose round-trip average is a whole number */
  const SPEEDS = [[20, 30], [20, 60], [30, 45], [30, 60], [30, 70], [40, 60], [22, 66], [24, 40], [24, 48], [28, 70], [30, 42], [36, 60], [42, 56]];
  A.skill({
    id: 'comp.motion', title: 'Distance, rate and time',
    learn: p(`<b>Distance = rate × time.</b> Average speed is <b>total distance ÷ total time</b>, not the average of the speeds: going slower takes longer, so the slower speed counts more.`) +
      p(`When two travelers move <b>toward each other</b>, the gap closes at the sum of their speeds. When one <b>chases</b> another, the gap closes at the difference of their speeds.`) +
      example('Example', `Drive 60 miles at 30 mph (2 hours) and back at 60 mph (1 hour): 120 miles in 3 hours is an average of <b>40 mph</b>, not 45.`),
    make(rng) {
      const kind = rng.pick(['average', 'meet', 'chase']), who = rng.pick(NAMES);
      if (kind === 'average') {
        const [u, v] = rng.pick(SPEEDS), d = u * v / gcd(u, v) * rng.pick([1, 1, 2]), avg = 2 * u * v / (u + v), swap = rng.bool();
        const [s1, s2] = swap ? [v, u] : [u, v];
        return { prompt: `${who} drives ${d} miles to a lake at ${s1} miles per hour and returns along the same road at ${s2} miles per hour. What is the average speed for the whole trip, in miles per hour?`, type: 'number', answer: avg, unit: 'mph', params: { kind, d, s1, s2 },
          hints: [`Times: ${d} ÷ ${s1} = ${d / s1} hour${d / s1 === 1 ? '' : 's'} there and ${d} ÷ ${s2} = ${d / s2} hour${d / s2 === 1 ? '' : 's'} back.`, `Average = total distance ÷ total time = ${2 * d} ÷ ${d / s1 + d / s2} = <b>${N(avg)}</b> mph (not the average of the two speeds).`] };
      }
      if (kind === 'meet') {
        const u = rng.pick([30, 40, 45, 50, 55, 60]), v = rng.pick([35, 40, 50, 60, 65, 70]), mins = rng.pick([30, 45, 60, 75, 90, 120, 150, 180]), D = (u + v) * mins / 60;
        return { prompt: `Two trains are ${N(D)} miles apart on parallel tracks and head toward each other, one at ${u} miles per hour and the other at ${v} miles per hour. In how many minutes will they meet?`, type: 'number', answer: mins, unit: 'min', params: { kind, D, u, v },
          hints: [`The gap closes at ${u} + ${v} = ${u + v} miles per hour.`, `${N(D)} ÷ ${u + v} = ${N(mins / 60)} hours = <b>${mins}</b> minutes.`] };
      }
      const u = rng.pick([4, 5, 6]), v = rng.pick([10, 12, 15]), h = rng.pick([0.5, 1, 1.5, 2]), t = u * h / (v - u);
      if (!Number.isInteger(t * 4)) return this.make(rng);
      return { prompt: `${who} starts jogging along a trail at ${u} miles per hour. A friend starts from the same place ${N(h)} hour${h === 1 ? '' : 's'} later, riding a bike at ${v} miles per hour. How many hours after the friend starts does the friend catch up?`, type: 'number', answer: t, unit: 'hours', params: { kind, u, v, h },
        hints: [`Head start: ${u} × ${N(h)} = ${N(u * h)} miles. The friend gains ${v} − ${u} = ${v - u} miles per hour.`, `${N(u * h)} ÷ ${v - u} = <b>${N(t)}</b> hours.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'average') return near((2 * P.d) / (P.d / P.s1 + P.d / P.s2), q.answer, 1e-9);
      // step forward a minute at a time
      if (P.kind === 'meet') { let gap = P.D, m = 0; while (gap > 1e-9) { gap -= (P.u + P.v) / 60; m++; } return m === q.answer && near(gap, 0, 1e-6); }
      let walker = P.u * P.h, bike = 0, m = 0; while (bike < walker - 1e-9) { walker += P.u / 60; bike += P.v / 60; m++; } return near(m / 60, q.answer, 1e-9);
    },
  });

  A.skill({
    id: 'comp.cycles', title: 'Repeating patterns',
    learn: p(`When something repeats every ${V('k')} steps, <b>only the remainder after dividing by ${V('k')} matters</b>. The digits of 1 ÷ 7 = 0.142857142857… repeat every 6, so the 100th digit is the same as the 4th (100 = 6 × 16 + 4).`) +
      p(`For a repeating sum, add one full cycle, multiply by the number of full cycles, then add the leftover terms. A clock repeats every 12 hours.`) +
      example('Example', `The sequence 1, 2, 3, 4, 1, 2, 3, 4, … : the first 50 terms are 12 full cycles (sum 10 each) plus 1, 2, so the sum is 120 + 3 = <b>123</b>.`),
    make(rng) {
      const kind = rng.pick(['decimal', 'decimal', 'clock', 'pattern-sum', 'alternating']);
      if (kind === 'decimal') {
        const b = rng.pick([7, 11, 13, 27, 37, 41]); let a; do { a = rng.int(1, b - 1); } while (gcd(a, b) !== 1);
        const n = rng.int(20, 500), period = []; let r = a; do { r *= 10; period.push(Math.floor(r / b)); r %= b; } while (r !== a);
        const ans = period[(n - 1) % period.length];
        return { prompt: `What is the ${M.ordinal(n)} digit after the decimal point in the decimal for ${F(a, b)}?`, type: 'number', answer: ans, params: { kind, a, b, n },
          hints: [`${F(a, b)} = 0.${period.join('')}${period.join('')}…, which repeats every ${period.length} digit${period.length === 1 ? '' : 's'}.`, `${n} = ${period.length} × ${Math.floor((n - 1) / period.length)} + ${(n - 1) % period.length + 1}, so it's digit ${(n - 1) % period.length + 1} of the block: <b>${ans}</b>.`] };
      }
      if (kind === 'clock') {
        const h0 = rng.int(1, 12), n = rng.int(30, 2000), ans = (h0 - 1 + n) % 12 + 1;
        return { prompt: `A 12-hour clock shows ${h0} o'clock. What hour will it show ${N(n)} hours from now? (Enter a number from 1 to 12.)`, type: 'number', answer: ans, params: { kind, h0, n },
          hints: [`Every 12 hours the clock returns to the same hour. ${N(n)} = 12 × ${Math.floor(n / 12)} + ${n % 12}.`, `${n % 12} hours after ${h0} o'clock is <b>${ans}</b> o'clock.`] };
      }
      if (kind === 'pattern-sum') {
        const k = rng.int(3, 6), cyc = Array.from({ length: k }, () => rng.int(1, 9)), n = rng.int(30, 200), full = Math.floor(n / k), left = n % k, cs = cyc.reduce((s, x) => s + x, 0), ans = full * cs + cyc.slice(0, left).reduce((s, x) => s + x, 0);
        return { prompt: `The pattern ${cyc.join(', ')} repeats forever: ${cyc.concat(cyc).join(', ')}, … What is the sum of the first ${n} numbers?`, type: 'number', answer: ans, params: { kind, cyc, n },
          hints: [`One full cycle adds to ${cs}. ${n} = ${k} × ${full} + ${left}.`, `${full} cycles give ${full * cs}${left ? `, and the ${left} leftover number${left === 1 ? '' : 's'} (${cyc.slice(0, left).join(', ')}) add ${cyc.slice(0, left).reduce((s, x) => s + x, 0)}` : ''}.`, `The sum is <b>${N(ans)}</b>.`] };
      }
      const n = rng.int(20, 400), ans = n % 2 ? (n + 1) / 2 : -n / 2;
      return { prompt: `What is the value of 1 − 2 + 3 − 4 + 5 − 6 + … ${n % 2 ? '−' : '+'} ${n - 1} ${n % 2 ? '+' : '−'} ${n}?`, type: 'number', answer: ans, params: { kind, n },
        hints: [`Group in pairs: (1 − 2) + (3 − 4) + … Each pair is −1.`, n % 2 ? `There are ${(n - 1) / 2} pairs, giving −${(n - 1) / 2}, plus the last term ${n}: −${(n - 1) / 2} + ${n} = <b>${ans}</b>.` : `There are ${n / 2} pairs: <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'decimal') return Number((BigInt(P.a) * 10n ** BigInt(P.n) / BigInt(P.b)) % 10n) === q.answer;
      if (P.kind === 'clock') { let h = P.h0; for (let i = 0; i < P.n; i++) h = h === 12 ? 1 : h + 1; return h === q.answer; }
      let s = 0;
      if (P.kind === 'pattern-sum') { for (let i = 0; i < P.n; i++) s += P.cyc[i % P.cyc.length]; return s === q.answer; }
      for (let i = 1; i <= P.n; i++) s += i % 2 ? i : -i; return s === q.answer;
    },
  });

  /* ---------- Unit 4: geometry ---------- */
  const REG = [3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36];
  /** the interior angle at one corner of a regular n-gon, measured from coordinates */
  const cornerAngle = n => { const pt = k => [Math.cos(2 * Math.PI * k / n), Math.sin(2 * Math.PI * k / n)], [a, b, c] = [pt(-1), pt(0), pt(1)]; const u = [a[0] - b[0], a[1] - b[1]], v = [c[0] - b[0], c[1] - b[1]]; return Math.acos((u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))) * 180 / Math.PI; };
  A.skill({
    id: 'comp.polygon-angles', title: 'Angles in polygons',
    learn: p(`<b>The interior angles of an ${V('n')}-sided polygon add to (${V('n')} − 2) × 180°</b>, because diagonals from one corner cut it into ${V('n')} − 2 triangles. <b>The exterior angles of any convex polygon add to 360°.</b>`) +
      p(`In a regular polygon all angles are equal, so each exterior angle is 360° ÷ ${V('n')} and each interior angle is 180° minus that. Working backward: if each interior angle is 150°, each exterior angle is 30°, so there are 360 ÷ 30 = 12 sides.`) +
      example('Example', `A regular octagon: each exterior angle is 360 ÷ 8 = 45°, so each interior angle is <b>135°</b>. The interior angles add to 6 × 180 = 1,080°.`),
    make(rng) {
      const kind = rng.pick(['sum', 'each', 'sides-interior', 'sides-sum']);
      if (kind === 'sum') { const n = rng.int(5, 24); return { prompt: `What is the sum of the interior angles of a polygon with ${n} sides, in degrees?`, type: 'number', answer: (n - 2) * 180, unit: '°', params: { kind, n }, hints: [`Diagonals from one corner make ${n} − 2 = ${n - 2} triangles.`, `${n - 2} × 180 = <b>${N((n - 2) * 180)}°</b>.`] }; }
      const n = rng.pick(REG.slice(2)), ext = 360 / n, int = 180 - ext;
      if (kind === 'each') return { prompt: `What is the measure of each interior angle of a regular polygon with ${n} sides, in degrees?`, type: 'number', answer: int, unit: '°', params: { kind, n }, hints: [`Each exterior angle is 360 ÷ ${n} = ${N(ext)}°.`, `Each interior angle is 180 − ${N(ext)} = <b>${N(int)}°</b>.`] };
      if (kind === 'sides-interior') return { prompt: `Each interior angle of a regular polygon measures ${N(int)}°. How many sides does it have?`, type: 'number', answer: n, params: { kind, int }, hints: [`Each exterior angle is 180 − ${N(int)} = ${N(ext)}°.`, `The exterior angles add to 360°, so there are 360 ÷ ${N(ext)} = <b>${n}</b> sides.`] };
      const m = rng.int(5, 30), S = (m - 2) * 180;
      return { prompt: `The interior angles of a polygon add to ${N(S)}°. How many sides does it have?`, type: 'number', answer: m, params: { kind, S }, hints: [`(${V('n')} − 2) × 180 = ${N(S)}, so ${V('n')} − 2 = ${m - 2}.`, `<b>${m}</b> sides.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'sum') return near(P.n * cornerAngle(P.n), q.answer, 1e-6);
      if (P.kind === 'each') return near(cornerAngle(P.n), q.answer, 1e-6);
      if (P.kind === 'sides-interior') return near(cornerAngle(q.answer), P.int, 1e-6);
      return near(q.answer * cornerAngle(q.answer), P.S, 1e-6);
    },
  });

  const shoelace = pts => Math.abs(pts.reduce((s, [x1, y1], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; return s + x1 * y2 - x2 * y1; }, 0)) / 2;
  A.skill({
    id: 'comp.lattice-area', title: 'Areas on a coordinate grid',
    learn: p(`For a polygon with corners on grid points, <b>draw the smallest rectangle around it and subtract the right triangles in the corners</b>. Each corner triangle is half of a small rectangle, so its area is easy.`) +
      p(`The <b>shoelace formula</b> works for any polygon: list the corners in order, add ${M.sub(V('x'), 1)}${M.sub(V('y'), 2)} − ${M.sub(V('x'), 2)}${M.sub(V('y'), 1)} for each pair of neighbors (wrapping around), and take half the absolute value.`) +
      example('Example', `The quadrilateral with corners (2, 0), (6, 3), (4, 6), (0, 2) sits in a 6 × 6 box (area 36). The corner triangles have areas 6, 3, 6 and 2, so the area is 36 − 17 = <b>19</b>.`),
    make(rng) {
      if (rng.bool()) {
        const W = rng.int(4, 9), H = rng.int(4, 9), a = rng.int(1, W - 1), b = rng.int(1, H - 1), c = rng.int(1, W - 1), d = rng.int(1, H - 1);
        const pts = [[a, 0], [W, b], [c, H], [0, d]], tri = [a * d / 2, (W - a) * b / 2, (W - c) * (H - b) / 2, c * (H - d) / 2], area = shoelace(pts);
        return { prompt: `What is the area of the quadrilateral with vertices ${pts.map(([x, y]) => M.pt(x, y)).join(', ')}?`, type: 'number', answer: area, unit: 'sq units', params: { pts },
          hints: [`It fits in the ${W} × ${H} rectangle from (0, 0) to ${M.pt(W, H)}, area ${W * H}, touching each side once.`, `The four corner triangles have areas ${tri.map(N).join(', ')}, adding to ${N(tri.reduce((s, t) => s + t, 0))}.`, `${W * H} − ${N(tri.reduce((s, t) => s + t, 0))} = <b>${N(area)}</b>.`] };
      }
      let pts, area; do { pts = [[rng.int(0, 3), rng.int(0, 3)], [rng.int(4, 10), rng.int(0, 5)], [rng.int(0, 8), rng.int(5, 10)]]; area = shoelace(pts); } while (area < 6);
      const [[x1, y1], [x2, y2], [x3, y3]] = pts;
      return { prompt: `What is the area of the triangle with vertices ${pts.map(([x, y]) => M.pt(x, y)).join(', ')}?`, type: 'number', answer: area, unit: 'sq units', params: { pts },
        hints: [`Shoelace formula: ½ |${x1}(${y2} − ${y3}) + ${x2}(${y3} − ${y1}) + ${x3}(${y1} − ${y2})|.`, `= ½ |${N(x1 * (y2 - y3))} ${M.signed(x2 * (y3 - y1))} ${M.signed(x3 * (y1 - y2))}| = ½ × ${N(2 * area)}.`, `The area is <b>${N(area)}</b>.`] };
    },
    verify(q) {
      // Pick's theorem: area = interior points + boundary points ÷ 2 − 1
      const pts = q.params.pts, n = pts.length;
      let B = 0; for (let i = 0; i < n; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % n]; B += gcd(Math.abs(x2 - x1), Math.abs(y2 - y1)); }
      const inside = (x, y) => { let c = false; for (let i = 0, j = n - 1; i < n; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
      const onEdge = (x, y) => pts.some((a, i) => { const b = pts[(i + 1) % n], cr = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]); return cr === 0 && x >= Math.min(a[0], b[0]) && x <= Math.max(a[0], b[0]) && y >= Math.min(a[1], b[1]) && y <= Math.max(a[1], b[1]); });
      let I = 0; for (let x = -1; x <= 12; x++) for (let y = -1; y <= 12; y++) if (!onEdge(x, y) && inside(x, y)) I++;
      return near(I + B / 2 - 1, q.answer, 1e-9);
    },
  });

  const TRIP = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29]];
  const BOX = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9], [6, 6, 7, 11], [3, 4, 12, 13], [2, 10, 11, 15], [8, 9, 12, 17], [2, 5, 14, 15]];
  A.skill({
    id: 'comp.pythagorean', title: 'Pythagorean triples and distances',
    learn: p(`Know the common <b>Pythagorean triples</b>: 3-4-5, 5-12-13, 8-15-17, 7-24-25, and their multiples such as 6-8-10. Spotting one saves a square root.`) +
      p(`The distance between two points is the hypotenuse of a right triangle with legs equal to the changes in ${X} and ${Y}. The <b>space diagonal of a box</b> is √(${M.sup(V('l'), 2)} + ${M.sup(V('w'), 2)} + ${M.sup(V('h'), 2)}). The diagonals of a rhombus cut each other in half at right angles.`) +
      example('Example', `A box 2 × 3 × 6 has a space diagonal of √(4 + 9 + 36) = √49 = <b>7</b>. A rhombus with diagonals 10 and 24 has sides of √(5² + 12²) = 13.`),
    make(rng) {
      const kind = rng.pick(['distance', 'box', 'rhombus', 'rect-area']), [a, b, c] = rng.pick(TRIP), s = rng.int(1, 3);
      if (kind === 'distance') {
        const x1 = rng.int(-8, 8), y1 = rng.int(-8, 8), sx = rng.sign(), sy = rng.sign(), flip = rng.bool(), dx = (flip ? b : a) * sx, dy = (flip ? a : b) * sy;
        return { prompt: `What is the distance between the points ${M.pt(x1, y1)} and ${M.pt(x1 + dx, y1 + dy)}?`, type: 'number', answer: c, params: { kind, p1: [x1, y1], p2: [x1 + dx, y1 + dy] },
          hints: [`The changes are ${Math.abs(dx)} across and ${Math.abs(dy)} up or down.`, `${Math.abs(dx)}-${Math.abs(dy)}-? is a Pythagorean triple: √(${dx * dx} + ${dy * dy}) = <b>${c}</b>.`] };
      }
      if (kind === 'box') {
        const [l, w, h, d] = rng.pick(BOX), k = rng.int(1, 3);
        return { prompt: `A rectangular box measures ${l * k} by ${w * k} by ${h * k} inches. How long is the straight segment from one corner to the opposite corner, through the inside of the box?`, type: 'number', answer: d * k, unit: 'in.', params: { kind, dims: [l * k, w * k, h * k] },
          hints: [`Space diagonal = √(${(l * k) ** 2} + ${(w * k) ** 2} + ${(h * k) ** 2}) = √${(d * k) ** 2}.`, `<b>${d * k}</b> inches.`] };
      }
      if (kind === 'rhombus') {
        const d1 = 2 * a * s, d2 = 2 * b * s, ask = rng.bool() ? 'side' : 'perimeter', ans = ask === 'side' ? c * s : 4 * c * s;
        return { prompt: `The diagonals of a rhombus have lengths ${d1} and ${d2}. What is the ${ask === 'side' ? 'length of each side' : 'perimeter of the rhombus'}?`, type: 'number', answer: ans, params: { kind, d1, d2, ask },
          hints: [`The diagonals bisect each other at right angles, making right triangles with legs ${a * s} and ${b * s}.`, ask === 'side' ? `Each side is √(${(a * s) ** 2} + ${(b * s) ** 2}) = <b>${c * s}</b>.` : `Each side is √(${(a * s) ** 2} + ${(b * s) ** 2}) = ${c * s}, so the perimeter is 4 × ${c * s} = <b>${ans}</b>.`] };
      }
      const L = b * s, Wd = a * s, D = c * s, P = 2 * (L + Wd), area = L * Wd;
      return { prompt: `A rectangle has a perimeter of ${P} and a diagonal of length ${D}. What is its area?`, type: 'number', answer: area, params: { kind, P, D },
        hints: [`Let the sides be ${V('l')} and ${V('w')}: ${V('l')} + ${V('w')} = ${P / 2} and ${M.sup(V('l'), 2)} + ${M.sup(V('w'), 2)} = ${D * D}.`, `(${V('l')} + ${V('w')})² = ${M.sup(V('l'), 2)} + ${M.sup(V('w'), 2)} + 2${V('l')}${V('w')}, so ${(P / 2) ** 2} = ${D * D} + 2 × area.`, `Area = (${(P / 2) ** 2} − ${D * D}) ÷ 2 = <b>${area}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'distance') return near(Math.hypot(P.p2[0] - P.p1[0], P.p2[1] - P.p1[1]), q.answer, 1e-9);
      if (P.kind === 'box') return near(Math.hypot(...P.dims), q.answer, 1e-9);
      if (P.kind === 'rhombus') { const sd = Math.hypot(P.d1 / 2, P.d2 / 2); return near(P.ask === 'side' ? sd : 4 * sd, q.answer, 1e-9); }
      const sum = P.P / 2, r = Math.sqrt(2 * P.D * P.D - sum * sum), l = (sum + r) / 2, w = (sum - r) / 2;
      return near(l * w, q.answer, 1e-9) && near(Math.hypot(l, w), P.D, 1e-9);
    },
  });

  A.skill({
    id: 'comp.circles-squares', title: 'Circles and squares together',
    learn: p(`Two facts link circles and squares. <b>A circle inside a square</b> (touching all four sides) has diameter equal to the side. <b>A square inside a circle</b> (corners on the circle) has diagonal equal to the diameter, and a square with diagonal ${V('d')} has area ${M.sup(V('d'), 2)} ÷ 2.`) +
      p(`For shaded regions, subtract: (area of the outer shape) − (area of the inner shape). Keep π as a symbol, so an answer looks like 64 − 16π.`) +
      example('Example', `A square is drawn inside a circle of radius 5. Its diagonal is the diameter, 10, so its area is 100 ÷ 2 = <b>50</b>.`),
    make(rng) {
      const kind = rng.pick(['square-in-circle', 'circle-around', 'nested', 'shaded']);
      if (kind === 'square-in-circle') { const r = rng.int(2, 15); return { prompt: `A square is drawn inside a circle of radius ${r} so that all four corners of the square lie on the circle. What is the area of the square?`, type: 'number', answer: 2 * r * r, params: { kind, r }, hints: [`The diagonal of the square is a diameter: ${2 * r}.`, `Area = diagonal² ÷ 2 = ${4 * r * r} ÷ 2 = <b>${2 * r * r}</b>.`] }; }
      if (kind === 'circle-around') { const sd = 2 * rng.int(1, 9); return { prompt: `A circle passes through all four corners of a square with side length ${sd}. The area of the circle is ${V('k')}π. What is ${V('k')}?`, type: 'number', answer: sd * sd / 2, params: { kind, sd }, hints: [`The diameter is the square's diagonal, ${sd}${M.sqrt('2')}, so the radius is ${sd / 2}${M.sqrt('2')}.`, `${V('r')}² = ${sd * sd / 4} × 2 = ${sd * sd / 2}, so <b>${V('k')} = ${sd * sd / 2}</b>.`] }; }
      if (kind === 'nested') { const sd = rng.int(2, 20); return { prompt: `A circle is drawn inside a square with side ${sd}, touching all four sides. A smaller square is then drawn inside the circle with its corners on the circle. What is the area of the smaller square?`, type: 'number', answer: sd * sd / 2, params: { kind, sd }, hints: [`The circle's diameter is ${sd}, and that is the small square's diagonal.`, `Area = ${sd}² ÷ 2 = <b>${N(sd * sd / 2)}</b>.`] }; }
      const r = rng.int(1, 9);
      return { prompt: `A circle of radius ${r} is drawn inside a square, touching all four sides. The area inside the square but outside the circle is ${V('a')} − ${V('b')}π, where ${V('a')} and ${V('b')} are whole numbers. What is ${V('a')} + ${V('b')}?`, type: 'number', answer: 5 * r * r, params: { kind, r },
        hints: [`The square's side is the diameter, ${2 * r}, so its area is ${4 * r * r}. The circle's area is ${r * r}π.`, `The region is ${4 * r * r} − ${r * r}π, so ${V('a')} + ${V('b')} = ${4 * r * r} + ${r * r} = <b>${5 * r * r}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'square-in-circle') { const c = [P.r * Math.cos(0.3), P.r * Math.sin(0.3)], d = [P.r * Math.cos(0.3 + Math.PI / 2), P.r * Math.sin(0.3 + Math.PI / 2)]; return near(Math.hypot(c[0] - d[0], c[1] - d[1]) ** 2, q.answer, 1e-9); }
      if (P.kind === 'circle-around') return near(Math.PI * (Math.hypot(P.sd, P.sd) / 2) ** 2 / Math.PI, q.answer, 1e-9);
      if (P.kind === 'nested') return near((P.sd / Math.SQRT2) ** 2, q.answer, 1e-9);
      // count grid cells in the square that fall outside the circle, then split into a − bπ
      const n = 400, h = 2 * P.r / n; let out = 0; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = -P.r + (i + 0.5) * h, y = -P.r + (j + 0.5) * h; if (x * x + y * y > P.r * P.r) out++; }
      const area = out * h * h, a = 4 * P.r * P.r, b = (a - area) / Math.PI;
      return near(b, Math.round(b), 0.05 * P.r * P.r) && a + Math.round(b) === q.answer;
    },
  });

  A.skill({
    id: 'comp.scale-factors', title: 'Scale factors for area and volume',
    learn: p(`When a shape is scaled by a factor ${V('k')} (every length multiplied by ${V('k')}), <b>its area is multiplied by ${M.sup(V('k'), 2)} and its volume by ${M.sup(V('k'), 3)}</b>. This holds for any similar figures: triangles, maps, models, cubes.`) +
      p(`Perimeters and other lengths scale by ${V('k')} itself, so a perimeter ratio gives you ${V('k')}. For percent changes, turn them into factors: making each edge 20% longer multiplies the volume by 1.2³ = 1.728, an increase of 72.8%.`) +
      example('Example', `Two similar triangles have perimeters 12 and 18, so ${V('k')} = 1.5. If the smaller has area 20, the larger has area 20 × 1.5² = <b>45</b>.`),
    make(rng) {
      const kind = rng.pick(['similar', 'percent', 'model']);
      if (kind === 'similar') {
        const [n, d] = rng.pick([[3, 2], [2, 1], [5, 2], [3, 1], [4, 3], [5, 3], [5, 4]]), base = rng.int(2, 9) * d, P1 = base * 3, P2 = base * 3 * n / d, A1 = d * d * rng.int(1, 9), A2 = A1 * n * n / (d * d);
        return { prompt: `Two similar triangles have perimeters ${P1} and ${P2}. The smaller triangle has an area of ${A1}. What is the area of the larger triangle?`, type: 'number', answer: A2, params: { kind, P1, P2, A1 },
          hints: [`The scale factor is ${P2} ÷ ${P1} = ${M.fracText(n, d)}.`, `Area scales by the square: ${A1} × (${M.fracText(n, d)})² = ${A1} × ${M.fracText(n * n, d * d)} = <b>${N(A2)}</b>.`] };
      }
      if (kind === 'percent') {
        const pc = rng.pick([10, 20, 50, 100]), solid = rng.pick(['cube', 'sphere', 'cylinder']), ans = M.round(((1 + pc / 100) ** 3 - 1) * 100, 4);
        return { prompt: `Every length of a ${solid} is increased by ${pc}%. By what percent does its volume increase?`, type: 'number', answer: ans, unit: '%', params: { kind, pc, solid },
          hints: [`The scale factor is ${N(1 + pc / 100)}, so the volume is multiplied by ${N(1 + pc / 100)}³ = ${N(M.round((1 + pc / 100) ** 3, 4))}.`, `That is an increase of <b>${N(ans)}%</b>.`] };
      }
      const k = rng.pick([10, 12, 20, 24, 25, 50]), dim = rng.pick([2, 3]), m = rng.int(2, 9), real = m * k ** dim;
      return { prompt: dim === 2 ? `A model of a house is built at a scale of 1 : ${k}. The model's outside walls have a total area of ${m} square feet. What is the total area of the real house's outside walls, in square feet?` : `A model boat is built at a scale of 1 : ${k}. The model's hull holds ${m} cubic inches of air. How many cubic inches would the real hull hold?`, type: 'number', answer: real, params: { kind, k, dim, m },
        hints: [`Lengths scale by ${k}, so ${dim === 2 ? `areas scale by ${k}² = ${N(k * k)}` : `volumes scale by ${k}³ = ${N(k ** 3)}`}.`, `${m} × ${N(k ** dim)} = <b>${N(real)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'similar') { const heron = per => { const t = per / 12, a = 3 * t, b = 4 * t, c = 5 * t, s = per / 2; return Math.sqrt(s * (s - a) * (s - b) * (s - c)); }; return near(P.A1 * heron(P.P2) / heron(P.P1), q.answer, 1e-9); }
      if (P.kind === 'percent') { const vol = r => P.solid === 'cube' ? r ** 3 : P.solid === 'sphere' ? 4 / 3 * Math.PI * r ** 3 : Math.PI * r * r * 2 * r; const f = 1 + P.pc / 100; return near((vol(2.3 * f) / vol(2.3) - 1) * 100, q.answer, 1e-6); }
      let v = P.m; for (let i = 0; i < P.dim; i++) v *= P.k; return v === q.answer;
    },
  });

  A.skill({
    id: 'comp.counting-shapes', title: 'Counting diagonals, rectangles and squares',
    learn: p(`<b>Diagonals:</b> each of the ${V('n')} corners of a polygon connects to ${V('n')} − 3 others by a diagonal, and each diagonal has two ends, so there are ${V('n')}(${V('n')} − 3) ÷ 2.`) +
      p(`<b>Rectangles in a grid:</b> a rectangle is fixed by choosing 2 of the vertical lines and 2 of the horizontal lines. <b>Squares in an ${V('n')} × ${V('n')} grid:</b> count each size: ${M.sup(V('n'), 2)} of size 1, (${V('n')} − 1)² of size 2, and so on down to 1.`) +
      example('Example', `A 3 × 3 grid of squares has 9 + 4 + 1 = <b>14</b> squares and C(4, 2) × C(4, 2) = 36 rectangles. A hexagon has 6 × 3 ÷ 2 = 9 diagonals.`),
    make(rng) {
      const kind = rng.pick(['diagonals', 'sides-from-diagonals', 'rectangles', 'squares']);
      if (kind === 'diagonals' || kind === 'sides-from-diagonals') {
        const n = rng.int(5, 25), D = n * (n - 3) / 2;
        return kind === 'diagonals' ? { prompt: `How many diagonals does a polygon with ${n} sides have?`, type: 'number', answer: D, params: { kind, n }, hints: [`Each corner has ${n - 3} diagonals, and each diagonal is counted from both ends.`, `${n} × ${n - 3} ÷ 2 = <b>${D}</b>.`] }
          : { prompt: `A convex polygon has ${D} diagonals. How many sides does it have?`, type: 'number', answer: n, params: { kind, D }, hints: [`Solve ${V('n')}(${V('n')} − 3) ÷ 2 = ${D}, so ${V('n')}(${V('n')} − 3) = ${2 * D}.`, `Try values: ${n} × ${n - 3} = ${2 * D}, so <b>${n}</b> sides.`] };
      }
      if (kind === 'rectangles') {
        const m = rng.int(2, 8), n = rng.int(2, 6), ans = choose(m + 1, 2) * choose(n + 1, 2);
        return { prompt: `A rectangle is divided into a grid of unit squares, ${m} squares wide and ${n} squares tall. How many rectangles of any size (including squares) can be found in the grid?`, type: 'number', answer: ans, params: { kind, m, n },
          hints: [`There are ${m + 1} vertical lines and ${n + 1} horizontal lines. Choose 2 of each.`, `C(${m + 1}, 2) × C(${n + 1}, 2) = ${choose(m + 1, 2)} × ${choose(n + 1, 2)} = <b>${ans}</b>.`] };
      }
      const n = rng.int(3, 10), terms = Array.from({ length: n }, (_, k) => (n - k) ** 2), ans = terms.reduce((s, t) => s + t, 0);
      return { prompt: `How many squares of any size are there in a ${n} × ${n} grid of unit squares?`, type: 'number', answer: ans, params: { kind, n },
        hints: [`Count by size: ${n}² of size 1, ${n - 1}² of size 2, … , 1 of size ${n}.`, `${terms.join(' + ')} = <b>${ans}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'diagonals' || P.kind === 'sides-from-diagonals') {
        const count = n => { let c = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (j - i !== 1 && !(i === 0 && j === n - 1)) c++; return c; };
        return P.kind === 'diagonals' ? count(P.n) === q.answer : count(q.answer) === P.D;
      }
      let c = 0;
      if (P.kind === 'rectangles') { for (let x1 = 0; x1 <= P.m; x1++) for (let x2 = x1 + 1; x2 <= P.m; x2++) for (let y1 = 0; y1 <= P.n; y1++) for (let y2 = y1 + 1; y2 <= P.n; y2++) c++; return c === q.answer; }
      for (let s = 1; s <= P.n; s++) for (let x = 0; x + s <= P.n; x++) for (let y = 0; y + s <= P.n; y++) c++; return c === q.answer;
    },
  });

  /* ---------- Unit 5: probability ---------- */
  const isPrime = n => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
  const DICE = {
    sum: { say: s => `the sum is ${s}`, test: s => (a, b) => a + b === s },
    'at-least': { say: s => `the sum is at least ${s}`, test: s => (a, b) => a + b >= s },
    prime: { say: () => 'the sum is a prime number', test: () => (a, b) => isPrime(a + b) },
    'product-even': { say: () => 'the product of the two numbers is even', test: () => (a, b) => (a * b) % 2 === 0 },
    'differ': { say: s => `the two numbers differ by ${s}`, test: s => (a, b) => Math.abs(a - b) === s },
  };
  A.skill({
    id: 'comp.dice-coins', title: 'Dice and coins',
    learn: p(`Two dice have 6 × 6 = 36 equally likely outcomes; ${V('n')} coins have 2<sup>${V('n')}</sup>. <b>Count the outcomes you want and divide by the total.</b> A quick table (first die down the side, second across the top) makes dice questions easy to count.`) +
      p(`For coins, the number of ways to get exactly ${V('k')} heads from ${V('n')} flips is C(${V('n')}, ${V('k')}). <b>"At least one" is 1 minus "none"</b>: the chance of at least one head in 5 flips is 1 − ${F(1, 32)} = ${F(31, 32)}.`) +
      example('Example', `Rolling two dice, a sum of 8 happens 5 ways (2-6, 3-5, 4-4, 5-3, 6-2), so the probability is <b>${F(5, 36)}</b>.`),
    make(rng) {
      if (rng.chance(0.55)) {
        const kind = rng.pick(Object.keys(DICE)), s = kind === 'sum' ? rng.int(3, 11) : kind === 'at-least' ? rng.int(7, 11) : kind === 'differ' ? rng.int(1, 4) : 0;
        const f = DICE[kind].test(s); let c = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (f(a, b)) c++;
        const ans = fa(c, 36);
        return { prompt: `Two fair six-sided dice are rolled. What is the probability that ${DICE[kind].say(s)}? Give your answer as a fraction.`, type: 'number', ...ans, params: { die: kind, s },
          hints: [`There are 36 equally likely outcomes. Count the ones where ${DICE[kind].say(s)}: ${c}.`, `${c} ÷ 36 = <b>${ans$(ans)}</b>.`] };
      }
      const n = rng.int(3, 6), kind = rng.pick(['exactly', 'at-least-one', 'more-heads']), k = rng.int(1, n - 1);
      let c = 0; for (let m = 0; m < (1 << n); m++) { const h = popcount(m); if (kind === 'exactly' ? h === k : kind === 'at-least-one' ? h > 0 : h > n - h) c++; }
      const ans = fa(c, 2 ** n), what = kind === 'exactly' ? `exactly ${k} of them land${k === 1 ? 's' : ''} heads` : kind === 'at-least-one' ? 'at least one lands heads' : 'more of them land heads than tails';
      return { prompt: `${Word(n)} fair coins are flipped. What is the probability that ${what}? Give your answer as a fraction.`, type: 'number', ...ans, params: { coins: kind, n, k },
        hints: [`There are 2<sup>${n}</sup> = ${2 ** n} equally likely outcomes.`, kind === 'exactly' ? `Ways to choose which ${k} are heads: C(${n}, ${k}) = ${c}.` : kind === 'at-least-one' ? `Only 1 outcome has no heads, so ${2 ** n} − 1 = ${c} have at least one.` : `Add the ways to get ${Array.from({ length: n + 1 }, (_, h) => h).filter(h => h > n - h).join(', ')} heads: ${c}.`, `${c} ÷ ${2 ** n} = <b>${ans$(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.die) {
        // roll the dice as a list of pairs and filter it
        const pairs = []; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) pairs.push([a, b]);
        const s = P.s, ok = { sum: ([a, b]) => a + b === s, 'at-least': ([a, b]) => a + b >= s, prime: ([a, b]) => [2, 3, 5, 7, 11].includes(a + b), 'product-even': ([a, b]) => a % 2 === 0 || b % 2 === 0, differ: ([a, b]) => a - b === s || b - a === s }[P.die];
        return near(pairs.filter(ok).length / 36, q.answer, 1e-12);
      }
      const seqs = [[]]; for (let i = 0; i < P.n; i++) { const next = []; seqs.forEach(sq => { next.push(sq.concat('H'), sq.concat('T')); }); seqs.splice(0, seqs.length, ...next); }
      const heads = sq => sq.filter(x => x === 'H').length, ok = P.coins === 'exactly' ? sq => heads(sq) === P.k : P.coins === 'at-least-one' ? sq => heads(sq) > 0 : sq => heads(sq) * 2 > P.n;
      return near(seqs.filter(ok).length / seqs.length, q.answer, 1e-12);
    },
  });

  A.skill({
    id: 'comp.probability-counting', title: 'Probability by counting',
    learn: p(`Many probability questions are counting questions: <b>probability = (number of favorable choices) ÷ (number of possible choices)</b>, using the counting tools from earlier, C(${V('n')}, ${V('k')}) and ${V('n')}!.`) +
      p(`Make sure the top and bottom count the same kind of thing (both unordered groups, or both ordered lineups). Sometimes a clever view is quicker: in a random lineup of ${V('n')} people, any particular person is equally likely to be in each spot.`) +
      example('Example', `Two of 4 boys and 5 girls are chosen at random. P(both girls) = C(5, 2) ÷ C(9, 2) = 10 ÷ 36 = <b>${F(5, 18)}</b>.`),
    make(rng) {
      const kind = rng.pick(['group', 'adjacent', 'pair']);
      if (kind === 'group') {
        const b = rng.int(3, 7), g = rng.int(3, 7), k = rng.pick([2, 3]), ask = k === 2 ? rng.pick(['all-girls', 'one-each']) : 'all-girls';
        const fav = ask === 'all-girls' ? choose(g, k) : b * g, tot = choose(b + g, k), ans = fa(fav, tot);
        return { prompt: `${k === 2 ? 'Two' : 'Three'} students are chosen at random from a group of ${b} boys and ${g} girls. What is the probability that ${ask === 'all-girls' ? `all ${k === 2 ? 'both' : 'three'} are girls`.replace('all both', 'both') : 'one boy and one girl are chosen'}?`, type: 'number', ...ans, params: { kind, b, g, k, ask },
          hints: [`Possible groups: C(${b + g}, ${k}) = ${tot}.`, ask === 'all-girls' ? `All-girl groups: C(${g}, ${k}) = ${fav}.` : `One of each: ${b} × ${g} = ${fav}.`, `${fav} ÷ ${tot} = <b>${ans$(ans)}</b>.`] };
      }
      if (kind === 'adjacent') {
        const n = rng.int(4, 7), [a, b] = rng.sample(NAMES, 2), ans = fa(2, n);
        return { prompt: `${Word(n)} friends, including ${a} and ${b}, line up in a random order. What is the probability that ${a} and ${b} stand next to each other?`, type: 'number', ...ans, params: { kind, n },
          hints: [`Lineups with them together: treat them as one block, (${n} − 1)! × 2 = ${2 * fact(n - 1)}. All lineups: ${n}! = ${fact(n)}.`, `${2 * fact(n - 1)} ÷ ${fact(n)} = <b>${ans$(ans)}</b>.`] };
      }
      const n = rng.int(6, 15), ask = rng.pick(['sum-even', 'product-even', 'sum-odd']);
      const ev = Math.floor(n / 2), od = n - ev, tot = choose(n, 2), fav = ask === 'sum-even' ? choose(ev, 2) + choose(od, 2) : ask === 'sum-odd' ? ev * od : tot - choose(od, 2), ans = fa(fav, tot);
      return { prompt: `Two different numbers are chosen at random from the whole numbers 1 through ${n}. What is the probability that their ${ask === 'product-even' ? 'product is even' : `sum is ${ask === 'sum-even' ? 'even' : 'odd'}`}?`, type: 'number', ...ans, params: { kind, n, ask },
        hints: [`There are ${ev} even and ${od} odd numbers, and C(${n}, 2) = ${tot} pairs.`, ask === 'sum-even' ? `An even sum needs two evens or two odds: C(${ev}, 2) + C(${od}, 2) = ${fav}.` : ask === 'sum-odd' ? `An odd sum needs one even and one odd: ${ev} × ${od} = ${fav}.` : `The product is odd only for two odds, C(${od}, 2) = ${choose(od, 2)}, so ${tot} − ${choose(od, 2)} = ${fav} pairs have an even product.`, `${fav} ÷ ${tot} = <b>${ans$(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'group') {
        let hit = 0, all = 0; const n = P.b + P.g;
        for (let m = 0; m < (1 << n); m++) { if (popcount(m) !== P.k) continue; all++; const girls = popcount(m >> P.b); if (P.ask === 'all-girls' ? girls === P.k : girls === 1) hit++; }
        return near(hit / all, q.answer, 1e-12);
      }
      if (P.kind === 'adjacent') { const ps = perms(Array.from({ length: P.n }, (_, i) => i)); return near(ps.filter(r => Math.abs(r.indexOf(0) - r.indexOf(1)) === 1).length / ps.length, q.answer, 1e-12); }
      let hit = 0, all = 0; for (let a = 1; a <= P.n; a++) for (let b = a + 1; b <= P.n; b++) { all++; if (P.ask === 'sum-even' ? (a + b) % 2 === 0 : P.ask === 'sum-odd' ? (a + b) % 2 === 1 : (a * b) % 2 === 0) hit++; }
      return near(hit / all, q.answer, 1e-12);
    },
  });

  A.skill({
    id: 'comp.expected-value', title: 'Expected value',
    learn: p(`The <b>expected value</b> is the long-run average result: <b>multiply each outcome by its probability and add</b>. It doesn't have to be a result that can actually happen.`) +
      p(`A game is <b>fair</b> when the expected winnings are 0. Expected values add: the expected number of sixes in 12 rolls is 12 × ${F(1, 6)} = 2.`) +
      example('Example', `A spinner has 4 equal parts labeled 1, 1, 3 and 7. The expected value is (1 + 1 + 3 + 7) ÷ 4 = <b>3</b>. A game paying 10 points on a 6 and costing 1 point otherwise has expected value 10 × ${F(1, 6)} − 1 × ${F(5, 6)} = ${F(5, 6)} point.`),
    make(rng) {
      const kind = rng.pick(['spinner', 'game', 'count']);
      if (kind === 'spinner') {
        const k = rng.pick([4, 5, 6, 8]), labels = Array.from({ length: k }, () => rng.int(0, 12)), sum = labels.reduce((s, x) => s + x, 0), ans = fa(sum, k);
        return { prompt: `A spinner is divided into ${k} equal sections labeled ${M.list(labels.map(String))}. What is the expected value of one spin?`, type: 'number', ...ans, params: { kind, labels },
          hints: [`Each section has probability ${F(1, k)}, so the expected value is the average of the labels.`, `(${labels.join(' + ')}) ÷ ${k} = ${sum} ÷ ${k} = <b>${ans$(ans)}</b>.`] };
      }
      if (kind === 'game') {
        const win6 = rng.int(4, 15), win45 = rng.int(1, 5), lose = rng.int(1, 6), num = win6 + 2 * win45 - 3 * lose, ans = fa(num, 6);
        return { prompt: `In a game you roll a fair die. You win ${win6} points for a 6 and ${win45} point${win45 === 1 ? '' : 's'} for a 4 or a 5, and you lose ${lose} point${lose === 1 ? '' : 's'} for a 1, 2 or 3. What is your expected score for one roll?`, type: 'number', ...ans, params: { kind, pay: [-lose, -lose, -lose, win45, win45, win6] },
          hints: [`Expected value = ${win6} × ${F(1, 6)} + ${win45} × ${F(2, 6, { raw: true })} − ${lose} × ${F(3, 6, { raw: true })}.`, `= (${win6} + ${2 * win45} − ${3 * lose}) ÷ 6 = ${F(num, 6, { raw: true })} = <b>${ans$(ans)}</b>.`] };
      }
      const n = rng.pick([6, 9, 12, 15, 18, 20, 24, 30, 36]), what = rng.pick([['a fair die is rolled', 'sixes', 6], ['a fair coin is flipped', 'heads', 2], ['a spinner with 4 equal colors is spun', 'reds', 4]]), ans = fa(n, what[2]);
      return { prompt: `${what[0][0].toUpperCase() + what[0].slice(1)} ${n} times. What is the expected number of ${what[1]}?`, type: 'number', ...ans, params: { kind, n, sides: what[2] },
        hints: [`Each try has probability ${F(1, what[2])}, and expected values add.`, `${n} × ${F(1, what[2])} = <b>${ans$(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'spinner') return near(P.labels.reduce((s, x) => s + x, 0) / P.labels.length, q.answer, 1e-12);
      if (P.kind === 'game') return near(P.pay.reduce((s, x) => s + x / 6, 0), q.answer, 1e-12);
      // the long way: the sum of k × P(exactly k successes) over every k
      const pr = 1 / P.sides; let e = 0; for (let k = 0; k <= P.n; k++) e += k * choose(P.n, k) * pr ** k * (1 - pr) ** (P.n - k);
      return near(e, q.answer, 1e-9);
    },
  });

  A.skill({
    id: 'comp.geometric-probability', title: 'Geometric probability',
    learn: p(`When a point is chosen "at random" from a region, <b>probability = (size of the part you want) ÷ (size of the whole)</b>: lengths on a segment, areas in a shape.`) +
      p(`On a dartboard of circles, compare areas, which go with the square of the radius: the inner circle of radius 2 inside a board of radius 6 is ${F(4, 36)} = ${F(1, 9)} of the board. In a square, sketch the line or curve and find the area of the part you want.`) +
      example('Example', `A point is chosen at random inside a square with corners (0, 0) and (4, 4). The region where ${X} + ${Y} &lt; 2 is a triangle of area 2, so the probability is 2 ÷ 16 = <b>${F(1, 8)}</b>.`),
    make(rng) {
      const kind = rng.pick(['dartboard', 'segment', 'square']);
      if (kind === 'dartboard') {
        const r1 = rng.int(1, 4), r2 = r1 + rng.int(1, 4), r3 = r2 + rng.int(1, 4), ring = rng.bool(), ans = ring ? fa(r2 * r2 - r1 * r1, r3 * r3) : fa(r1 * r1, r3 * r3);
        return { prompt: `A target is made of three circles with the same center and radii ${r1}, ${r2} and ${r3} inches. A dart hits the target at a random point. What is the probability that it lands ${ring ? `between the smallest and middle circles` : 'inside the smallest circle'}?`, type: 'number', ...ans, params: { kind, r1, r2, r3, ring },
          hints: [`The target's area is ${r3 * r3}π. ${ring ? `The ring's area is ${r2 * r2}π − ${r1 * r1}π = ${r2 * r2 - r1 * r1}π.` : `The small circle's area is ${r1 * r1}π.`}`, `${ring ? r2 * r2 - r1 * r1 : r1 * r1}π ÷ ${r3 * r3}π = <b>${ans$(ans)}</b>.`] };
      }
      if (kind === 'segment') {
        const L = rng.pick([10, 12, 15, 20, 24, 30]), c = rng.int(4, L - 4), d = rng.int(1, Math.min(c, L - c, 6)), ans = fa(2 * d, L);
        return { prompt: `A number ${X} is chosen at random between 0 and ${L}. What is the probability that ${X} is within ${d} of ${c}?`, type: 'number', ...ans, params: { kind, L, c, d },
          hints: [`"Within ${d} of ${c}" is the interval from ${c - d} to ${c + d}, of length ${2 * d}.`, `${2 * d} ÷ ${L} = <b>${ans$(ans)}</b>.`] };
      }
      const s = rng.int(2, 8), k = rng.int(1, 2 * s - 1), area = k <= s ? k * k / 2 : s * s - (2 * s - k) ** 2 / 2, ans = fa(2 * area, 2 * s * s);
      return { prompt: `A point (${X}, ${Y}) is chosen at random inside the square with corners (0, 0), (${s}, 0), (${s}, ${s}) and (0, ${s}). What is the probability that ${X} + ${Y} &lt; ${k}?`, type: 'number', ...ans, params: { kind, s, k },
        hints: [k <= s ? `The region ${X} + ${Y} &lt; ${k} is a right triangle with legs ${k}: area ${N(area)}.` : `The part where ${X} + ${Y} ≥ ${k} is a corner triangle with legs ${2 * s - k}, area ${N((2 * s - k) ** 2 / 2)}; the rest has area ${N(area)}.`, `${N(area)} ÷ ${s * s} = <b>${ans$(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params, n = 600;
      if (P.kind === 'dartboard') { let hit = 0, all = 0; const h = 2 * P.r3 / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = -P.r3 + (i + 0.5) * h, y = -P.r3 + (j + 0.5) * h, d = x * x + y * y; if (d > P.r3 * P.r3) continue; all++; if (P.ring ? d > P.r1 * P.r1 && d < P.r2 * P.r2 : d < P.r1 * P.r1) hit++; } return near(hit / all, q.answer, 0.006); }
      if (P.kind === 'segment') { let hit = 0; for (let i = 0; i < 10000; i++) { const x = (i + 0.5) * P.L / 10000; if (Math.abs(x - P.c) < P.d) hit++; } return near(hit / 10000, q.answer, 1e-3); }
      let hit = 0; const h = P.s / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if ((i + 0.5) * h + (j + 0.5) * h < P.k) hit++; return near(hit / (n * n), q.answer, 0.004);
    },
  });
})();
