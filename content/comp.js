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
})();
