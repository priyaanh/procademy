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
    blurb: 'New problems in the style of middle school contests such as MATHCOUNTS: clever counting, number theory, algebra shortcuts, geometry and probability. For strong students in grades 6 to 8, listed at grade 7.',
    units: [
      { id: 'counting', title: 'Counting', blurb: 'The multiplication principle, arrangements, choosing groups, overlaps, grid paths and page numbers.', skills: ['comp.multiplication-principle', 'comp.arrangements', 'comp.choosing', 'comp.overlaps', 'comp.paths-pages'] },
      { id: 'number-theory', title: 'Number theory', blurb: 'Divisors, GCF and LCM puzzles, remainders and cycles, units digits, divisibility rules, and zeros at the end.', skills: ['comp.divisors', 'comp.gcd-lcm', 'comp.remainders', 'comp.units-digit', 'comp.digit-rules', 'comp.trailing-zeros'] },
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
    learn: p(`Look for the question behind the story. <b>"Together again", "at the same time", "smallest number that both divide" → least common multiple (LCM).</b> <b>"Largest equal groups", "biggest square tiles", "split with nothing left over" → greatest common factor (GCF).</b>`) +
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
})();
