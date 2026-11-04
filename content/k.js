/* Kindergarten math. Counting and place value, addition and subtraction within 10, measurement, and
   shapes. Written for five-year-olds: very short sentences, drawn pictures, and small answers. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const N = M.n;
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = (s) => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const countUp = (from, to) => { const out = []; for (let i = from; i <= to; i++) out.push(i); return out.join(', '); };

  // pictures are drawn shapes (M.items), named in words: "red circles"; verify() counts them with M.countItems
  const SHAPES = ['circle', 'square', 'triangle', 'star', 'heart'];
  const COLORS = ['red', 'blue', 'green', 'orange', 'purple'];
  const look = rng => [rng.pick(SHAPES), rng.pick(COLORS)];
  const many = (k, sh) => k === 1 ? sh : sh + 's';
  const cap = s => s[0].toUpperCase() + s.slice(1);
  // things in story problems, singular and plural
  const THINGS = [['apple', 'apples'], ['banana', 'bananas'], ['fish', 'fish'], ['ladybug', 'ladybugs'], ['car', 'cars'], ['star', 'stars'], ['frog', 'frogs'], ['cookie', 'cookies'], ['chick', 'chicks'], ['flower', 'flowers'], ['berry', 'berries'], ['turtle', 'turtles']];
  const howMany = (k, t) => `${k} ${k === 1 ? t[0] : t[1]}`;

  A.course({
    id: 'math-k', title: 'Kindergarten math', subject: 'Elementary', grade: 0, icon: 'K', hue: 40,
    blurb: 'Counting to 100, comparing groups, adding and taking away within 10, teen numbers, longer and heavier, and shapes.',
    units: [
      { id: 'counting', title: 'Counting and place value', blurb: 'Count things, count to 100, compare, and meet the teen numbers.', skills: ['k.count-objects', 'k.count-to-100', 'k.compare-groups', 'k.compare-numbers', 'k.teen-numbers'] },
      { id: 'add-sub', title: 'Addition and subtraction', blurb: 'Put together and take away, within 10.', skills: ['k.add-within-10', 'k.sub-within-10', 'k.make-10', 'k.decompose'] },
      { id: 'measurement', title: 'Measurement and data', blurb: 'Longer, taller, heavier, lighter.', skills: ['k.compare-length', 'k.compare-weight'] },
      { id: 'geometry', title: 'Geometry', blurb: 'Flat shapes, solid shapes, and where things are.', skills: ['k.shape-names', 'k.sides-corners', 'k.solid-shapes', 'k.position-words'] },
    ],
  });

  /* ---------- Unit 1: Counting and place value ---------- */
  A.skill({
    id: 'k.count-objects', title: 'Count objects',
    learn: p('To count, <b>touch each thing one time</b> and say one number for it.') +
      p('The <b>last number you say</b> tells how many there are.') +
      p('Count row by row. Each full row has 5.') +
      example('Example', `${M.items(7, 'circle', 'red')}Count: 1, 2, 3, 4, 5, 6, 7. There are <b>7</b> circles.`),
    make(rng) {
      const [sh, col] = look(rng);
      const k = rng.pick([rng.int(1, 10), rng.int(1, 10), rng.int(11, 20)]);
      const name = `${col} ${sh}s`;
      const full = Math.floor(k / 5), rest = k % 5;
      const hints = ['Touch each one. Say one number for each.'];
      if (k > 5) hints.push(`Each full row has 5. There ${full === 1 ? 'is 1 full row' : `are ${full} full rows`}${rest ? `, and ${rest} more` : ''}.`);
      hints.push(`Count them all: ${k <= 10 ? countUp(1, k) : `5, 10${k >= 15 ? ', 15' : ''}${k === 20 ? ', 20' : ''}${rest ? ', then ' + countUp(full * 5 + 1, k) : ''}`}.`);
      hints.push(k === 1 ? `There is <b>1</b> ${col} ${sh}.` : `There are <b>${k}</b> ${name}.`);
      return { prompt: `How many ${name}?${M.items(k, sh, col)}`, type: 'number', answer: k, hints, params: { sh, col, k } };
    },
    verify(q) { return M.countItems(q.prompt, `${q.params.col} ${q.params.sh}`) === q.answer; },
  });

  A.skill({
    id: 'k.count-to-100', title: 'Numbers to 100: before and after',
    learn: p('When we count, each number is <b>one more</b> than the number before it.') +
      p('The number <b>after</b> is one more. The number <b>before</b> is one less.') +
      p('Counting by tens goes 10, 20, 30, 40, 50, 60, 70, 80, 90, 100.') +
      example('Example', `${big('What comes after 39?')}39, then <b>40</b>. After 9 ones, we go to the next ten.`),
    make(rng) {
      const kind = rng.pick(['after', 'after', 'before', 'gap', 'tens']);
      if (kind === 'after' || kind === 'before') {
        const n = kind === 'after' ? rng.pick([rng.int(1, 20), rng.int(1, 99), 10 * rng.int(1, 9) - 1]) : rng.pick([rng.int(2, 20), rng.int(2, 100), 10 * rng.int(1, 9) + 1]);
        const ans = kind === 'after' ? n + 1 : n - 1;
        const hints = [kind === 'after' ? `The number after is one more than ${n}.` : `The number before is one less than ${n}.`,
          kind === 'after' ? `Count: ${n}, …` : `Count: …, ${n}.`,
          kind === 'after' ? `${n}, <b>${ans}</b>.` : `<b>${ans}</b>, ${n}.`];
        return { prompt: `What number comes ${kind} ${n}?${big(kind === 'after' ? `${n}, __` : `__, ${n}`)}`, type: 'number', answer: ans, hints, params: { kind, n } };
      }
      if (kind === 'tens') {
        const start = rng.int(1, 6), seq = [start, start + 1, start + 2].map(t => t * 10);
        const ans = (start + 3) * 10;
        return { prompt: `Count by tens. What comes next?${big(seq.join(', ') + ', __')}`, type: 'number', answer: ans, params: { kind, seq, step: 10 },
          hints: ['Each number is 10 more.', `${start * 10 + 20} and 10 more is the next ten.`, `${seq.join(', ')}, <b>${ans}</b>.`] };
      }
      const start = rng.int(1, 96), gap = rng.int(1, 2);
      const seq = [start, start + 1, start + 2, start + 3];
      const ans = seq[gap];
      const show = seq.map((x, i) => i === gap ? '__' : x).join(', ');
      return { prompt: `What number is missing?${big(show)}`, type: 'number', answer: ans, params: { kind, seq: seq.map((x, i) => i === gap ? null : x), step: 1 },
        hints: ['Each number is one more than the one before.', `What comes after ${seq[gap - 1]}?`, `${seq.map(x => x === ans ? `<b>${x}</b>` : x).join(', ')}.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'after') return q.answer - 1 === pr.n;
      if (pr.kind === 'before') return q.answer + 1 === pr.n;
      if (pr.kind === 'tens') return q.answer - pr.seq[pr.seq.length - 1] === 10 && q.answer % 10 === 0;
      const i = pr.seq.indexOf(null);
      return q.answer === pr.seq[i - 1] + 1 && q.answer === pr.seq[i + 1] - 1;
    },
  });

  A.skill({
    id: 'k.compare-groups', title: 'Compare groups: more, fewer, same',
    learn: p('Line up two groups. Match one from the top with one from the bottom.') +
      p('The group with some left over has <b>more</b>. The other group has <b>fewer</b>. If none are left over, they are the <b>same</b>.') +
      p('You can also count each group. The bigger number is more.') +
      example('Example', `${M.items([[4, 'circle', 'red'], [2, 'square', 'blue']], { rows: true, per: 0 })}4 red circles. 2 blue squares. There are <b>more red circles</b>. There are <b>fewer blue squares</b>.`),
    make(rng) {
      const [s1, s2] = rng.sample(SHAPES, 2), [k1, k2] = rng.sample(COLORS, 2);
      const n1 = `${k1} ${s1}s`, n2 = `${k2} ${s2}s`;
      const a = rng.int(1, 10);
      let b = rng.chance(0.2) ? a : rng.int(1, 10);
      const ask = rng.pick(['more', 'fewer']);
      const c1 = cap(n1), c2 = cap(n2), same = 'Same number';
      const answer = a === b ? same : (ask === 'more') === (a > b) ? c1 : c2;
      const last = a === b ? `${a} and ${b} are the same. So it is the <b>${same.toLowerCase()}</b>.` :
        `${Math.max(a, b)} is more than ${Math.min(a, b)}. So the answer is <b>${answer}</b>.`;
      return { prompt: `Which group has ${ask}?${M.items([[a, s1, k1], [b, s2, k2]], { rows: true, per: 0 })}`, type: 'choice', choices: [c1, c2, same], answer, keepOrder: true,
        params: { it1: `${k1} ${s1}`, it2: `${k2} ${s2}`, ask, c1, c2 },
        hints: [`Count the ${n1}: ${a}.`, `Count the ${n2}: ${b}.`, last] };
    },
    verify(q) {
      const a = M.countItems(q.prompt, q.params.it1), b = M.countItems(q.prompt, q.params.it2);
      if (a === b) return q.answer === 'Same number';
      const wantFirst = q.params.ask === 'more' ? a > b : a < b;
      return q.answer === (wantFirst ? q.params.c1 : q.params.c2);
    },
  });

  A.skill({
    id: 'k.compare-numbers', title: 'Compare numbers to 10',
    learn: p('When we count, <b>numbers get bigger</b>. A number that comes later is <b>more</b>.') +
      p('8 comes after 5, so 8 is more than 5. And 5 is less than 8.') +
      p('If you are not sure, count up from 0 and see which number you say first.') +
      example('Example', `${big('3 &nbsp; 7 &nbsp; 5')}Which is the greatest? Count: 1, 2, 3, 4, 5, 6, 7. We say 7 last. <b>7</b> is the greatest.`),
    make(rng) {
      const kind = rng.pick(['greatest', 'least', 'more-less']);
      if (kind === 'more-less') {
        const a = rng.int(0, 10), b = rng.chance(0.15) ? a : rng.int(0, 10);
        const answer = a === b ? 'the same' : a > b ? 'more' : 'less';
        return { prompt: `Is ${a} more or less than ${b}?${big(`${a} &nbsp; and &nbsp; ${b}`)}`, type: 'choice', choices: ['more', 'less', 'the same'], answer, keepOrder: true, params: { kind, a, b },
          hints: [`Count up: which comes first, ${a} or ${b}?`, a === b ? 'They are the same number.' : `${Math.min(a, b)} comes first. ${Math.max(a, b)} comes later, so it is more.`, `${a} is <b>${answer}</b>${answer === 'the same' ? ' as' : ' than'} ${b}.`] };
      }
      const nums = rng.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3);
      const ans = kind === 'greatest' ? Math.max(...nums) : Math.min(...nums);
      const sorted = nums.slice().sort((x, y) => x - y);
      return { prompt: `Which number is the ${kind}?${big(nums.join(' &nbsp; '))}`, type: 'choice', choices: nums.map(String), answer: String(ans), keepOrder: true, params: { kind, nums },
        hints: [`Put them in counting order: ${sorted.join(', ')}.`, kind === 'greatest' ? 'The last one is the greatest.' : 'The first one is the least.', `<b>${ans}</b> is the ${kind}.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'more-less') return q.answer === (pr.a - pr.b > 0 ? 'more' : pr.a - pr.b < 0 ? 'less' : 'the same');
      const best = pr.nums.reduce((m, x) => (pr.kind === 'greatest' ? x > m : x < m) ? x : m);
      return Number(q.answer) === best;
    },
  });

  A.skill({
    id: 'k.teen-numbers', title: 'Teen numbers: 10 and some more',
    learn: p('The numbers 11 to 19 are <b>10 and some more</b>.') +
      p('14 is 10 and 4 more. The 1 in 14 stands for the ten. The 4 tells the ones.') +
      p('So 10 and 7 more is 17. And 19 is 10 and 9 more.') +
      example('Example', `${M.items([[10, 'circle', 'blue'], [3, 'circle', 'blue']], { rows: true, per: 0 })}That is 10 and 3 more. 10 and 3 make <b>13</b>.`),
    make(rng) {
      const kind = rng.pick(['picture', 'make', 'ones', 'which']);
      const ones = rng.int(1, 9), n = 10 + ones;
      if (kind === 'picture') {
        return { prompt: `The top row has 10. How many in all?${M.items([[10, 'circle', 'blue'], [ones, 'circle', 'blue']], { rows: true, per: 0 })}`, type: 'number', answer: n, params: { kind, ones },
          hints: ['The top row is 10.', `The bottom row has ${ones}. Count on from 10: ${countUp(11, n)}.`, `10 and ${ones} more is <b>${n}</b>.`] };
      }
      if (kind === 'make') {
        return { prompt: `What number is this?${big(`10 and ${ones} more`)}`, type: 'number', answer: n, params: { kind, ones },
          hints: ['Start at 10.', `Count on ${ones}: ${countUp(11, n)}.`, `10 and ${ones} more is <b>${n}</b>.`] };
      }
      if (kind === 'ones') {
        return { prompt: `${n} is 10 and how many more?${big(`${n} = 10 and __`)}`, type: 'number', answer: ones, params: { kind, n },
          hints: [`Look at the last digit of ${n}.`, `Count on from 10 to ${n}: ${countUp(11, n)}. That is ${ones} more.`, `${n} is 10 and <b>${ones}</b> more.`] };
      }
      const others = [ones - 1, ones + 1, ones + 2, ones - 2].filter(x => x >= 0 && x <= 9).slice(0, 3);
      const answer = `10 and ${ones}`;
      return { prompt: `Which one is ${n}?`, type: 'choice', choices: [answer, ...others.map(x => `10 and ${x}`)], answer, params: { kind, n },
        hints: [`${n} is a teen number. It is 10 and some more.`, `The last digit of ${n} is ${ones}.`, `${n} is <b>${answer}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'picture') return M.countItems(q.prompt, 'blue circle') === q.answer;
      if (pr.kind === 'make') return q.answer === Number('1' + pr.ones);
      if (pr.kind === 'ones') return 10 + q.answer === pr.n;
      return 10 + Number(q.answer.split(' ').pop()) === pr.n;
    },
  });

  /* ---------- Unit 2: Addition and subtraction ---------- */
  A.skill({
    id: 'k.add-within-10', title: 'Add within 10',
    learn: p('<b>Adding means putting groups together.</b> The plus sign + means "and more."') +
      p('To add, count the first group. Then <b>keep counting</b> the second group.') +
      p('You can use your fingers, or draw dots.') +
      example('Example', `${M.items([[3, 'star', 'orange'], [2, 'star', 'orange']], { sep: '+' })}Count 3. Keep counting: 4, 5. So 3 + 2 = <b>5</b>.`),
    make(rng) {
      const kind = rng.pick(['picture', 'number', 'number', 'story']);
      const a = rng.int(kind === 'picture' ? 1 : 0, 5 + rng.int(0, 4)), b = rng.int(kind === 'picture' ? 1 : 0, 10 - a);
      const s = a + b;
      const hints = [`Start with ${a}.`, b === 0 ? 'Adding 0 adds nothing.' : `Keep counting ${b} more: ${countUp(a + 1, s)}.`, `${a} + ${b} = <b>${s}</b>.`];
      if (kind === 'picture') {
        const [sh, col] = look(rng);
        return { prompt: `How many ${sh}s in all?${M.items([[a, sh, col], [b, sh, col]], { sep: '+', per: 0 })}`, type: 'number', answer: s, hints, params: { kind, sh, col, a, b } };
      }
      if (kind === 'story') {
        const t = rng.pick(THINGS), who = rng.pick(NAMES);
        return { prompt: `${who} has ${howMany(a, t)}. ${who} gets ${b} more. How many ${t[1]} does ${who} have now?`, type: 'number', answer: s, hints, params: { kind, a, b } };
      }
      return { prompt: `Add.${big(`${a} + ${b} = ?`)}`, type: 'number', answer: s, hints, params: { kind, a, b } };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'picture') return M.countItems(q.prompt, `${pr.col} ${pr.sh}`) === q.answer;
      let k = 0; for (let i = 0; i < pr.a; i++) k++; for (let i = 0; i < pr.b; i++) k++;
      return k === q.answer && q.answer <= 10;
    },
  });

  A.skill({
    id: 'k.sub-within-10', title: 'Subtract within 10',
    learn: p('<b>Subtracting means taking away.</b> The minus sign − means "take away."') +
      p('Start with the whole group. Take some away. <b>Count what is left.</b>') +
      p('You can also count back. 6 − 2: say 5, 4. The answer is 4.') +
      example('Example', `${M.items(5, 'circle', 'purple', { out: 2 })}5 circles. Take away 2. Count back: 4, 3. There are <b>3</b> left. 5 − 2 = 3.`),
    make(rng) {
      const kind = rng.pick(['picture', 'number', 'number', 'story']);
      const a = rng.int(kind === 'number' ? 1 : 2, 10), b = rng.int(kind === 'number' ? 0 : 1, kind === 'number' ? a : a - 1);
      const d = a - b;
      const hints = [`Start with ${a}.`, b === 0 ? 'Taking away 0 takes nothing.' : `Take away ${b}. Count back: ${countUp(d, a - 1).split(', ').reverse().join(', ')}.`, `${a} − ${b} = <b>${d}</b>.`];
      if (kind === 'picture') {
        const [sh, col] = look(rng);
        return { prompt: `Take away ${b} ${many(b, sh)}. How many are left?${M.items(a, sh, col)}`, type: 'number', answer: d, hints, params: { kind, sh, col, b } };
      }
      if (kind === 'story') {
        const t = rng.pick(THINGS.filter(t => ['apple', 'cookie', 'berry', 'banana'].includes(t[0]))), who = rng.pick(NAMES);
        return { prompt: `${who} has ${howMany(a, t)}. ${who} eats ${b}. How many ${t[1]} are left?`, type: 'number', answer: d, hints, params: { kind, a, b } };
      }
      return { prompt: `Subtract.${big(`${a} − ${b} = ?`)}`, type: 'number', answer: d, hints, params: { kind, a, b } };
    },
    verify(q) {
      const pr = q.params;
      const a = pr.kind === 'picture' ? M.countItems(q.prompt, `${pr.col} ${pr.sh}`) : pr.a;
      return q.answer + pr.b === a && q.answer >= 0;
    },
  });

  /** a ten frame: two rows of 5 spots, the first `a` of them holding a dot */
  const tenFrame = a => M.items([[a, 'circle', 'blue'], [10 - a, 'circle', 'blue', { hollow: true }]], { flow: true, frame: true, size: 36, label: `a ten frame with ${a} dots and ${10 - a} empty spots` });
  A.skill({
    id: 'k.make-10', title: 'Make 10',
    learn: p('A <b>ten frame</b> has 10 spots: two rows of 5.') +
      p('To find how many more make 10, <b>count the empty spots</b>.') +
      p('Pairs that make 10: 1 and 9, 2 and 8, 3 and 7, 4 and 6, 5 and 5.') +
      example('Example', `${tenFrame(7)}7 spots are full. 3 are empty. 7 and <b>3</b> make 10.`),
    make(rng) {
      const kind = rng.pick(['frame', 'frame', 'number']);
      const a = rng.int(1, 9), need = 10 - a;
      if (kind === 'frame') {
        return { prompt: `How many more dots make 10?${tenFrame(a)}`, type: 'number', answer: need, params: { kind, a },
          hints: [`There are ${a} dots.`, `Count the empty spots: ${countUp(1, need)}.`, `${a} and <b>${need}</b> make 10.`] };
      }
      return { prompt: `What number makes 10?${big(`${a} + __ = 10`)}`, type: 'number', answer: need, params: { kind, a },
        hints: [`Start at ${a}.`, `Count up to 10: ${countUp(a + 1, 10)}. That is ${need} numbers.`, `${a} + <b>${need}</b> = 10.`] };
    },
    verify(q) {
      if (q.params.kind === 'frame') return M.countItems(q.prompt, 'empty circle') === q.answer && M.countItems(q.prompt, 'blue circle') + q.answer === 10;
      return q.params.a + q.answer === 10;
    },
  });

  A.skill({
    id: 'k.decompose', title: 'Break apart numbers',
    learn: p('A number can be <b>broken into two parts</b>.') +
      p('5 can be 4 and 1. It can be 3 and 2. It can be 5 and 0. <b>The parts always add back to the whole.</b>') +
      p('To find a missing part, start with the part you know and count up to the whole.') +
      example('Example', `${M.items([[3, 'circle', 'red'], [4, 'circle', 'blue']])}7 circles. 3 are red. Count the blue circles: 4. So 7 is 3 and <b>4</b>.`),
    make(rng) {
      const kind = rng.pick(['picture', 'missing', 'pair']);
      const n = rng.int(kind === 'pair' ? 3 : 2, 10), a = rng.int(kind === 'missing' ? 0 : 1, kind === 'missing' ? n : n - 1), b = n - a;
      if (kind === 'picture') {
        return { prompt: `There are ${n} circles. ${a} ${a === 1 ? 'is' : 'are'} red. How many are blue?${M.items([[a, 'circle', 'red'], [b, 'circle', 'blue']])}`, type: 'number', answer: b, params: { kind, n, a },
          hints: ['Count only the blue circles.', `Or start at ${a} and count up to ${n}: ${countUp(a + 1, n)}.`, `${n} is ${a} and <b>${b}</b>.`] };
      }
      if (kind === 'missing') {
        return { prompt: `Find the missing part.${big(`${n} = ${a} + __`)}`, type: 'number', answer: b, params: { kind, n, a },
          hints: [`Start at ${a}.`, b ? `Count up to ${n}: ${countUp(a + 1, n)}.` : `${a} is already ${n}. Nothing more is needed.`, `${n} = ${a} + <b>${b}</b>.`] };
      }
      const answer = `${a} and ${b}`;
      const wrong = [[a, b + 1], [a, b - 1], [a + 1, b + 1], [a - 1, b - 1], [a + 1, b - 2]].filter(([x, y]) => x >= 0 && y >= 0 && x + y !== n).slice(0, 3).map(([x, y]) => `${x} and ${y}`);
      return { prompt: `Which two parts make ${n}?`, type: 'choice', choices: [answer, ...wrong], answer, params: { kind, n },
        hints: ['Add the two parts. Do you get ' + n + '?', `${a} and ${b}: start at ${a}, count ${b} more${b ? ': ' + countUp(a + 1, n) : ''}.`, `<b>${answer}</b> make ${n}.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'pair') { const [x, y] = q.answer.split(' and ').map(Number); return x + y === pr.n; }
      if (pr.kind === 'picture') return M.countItems(q.prompt, 'blue circle') === q.answer && M.countItems(q.prompt, 'red circle') === pr.a;
      return pr.a + q.answer === pr.n;
    },
  });

  /* ---------- Unit 3: Measurement and data ---------- */
  // [name, size]: the sizes only keep the three choices clearly apart
  const TALL = [['ant', 0], ['mouse', 1], ['cat', 2], ['child', 4], ['horse', 6], ['giraffe', 8]];
  const LONG = [['ant', 0], ['spoon', 2], ['loaf of bread', 3], ['crocodile', 5], ['bus', 7], ['train', 9]];
  const HEAVY = [['leaf', 0], ['berry', 1], ['apple', 2], ['watermelon', 4], ['dog', 5], ['cow', 7], ['elephant', 9]];
  /** three things with clear gaps between their sizes, and the one that is biggest or smallest */
  function pickThree(rng, list, most) {
    let three;
    do { three = rng.sample(list, 3); } while (three.some((t, i) => three.some((u, j) => i !== j && Math.abs(t[1] - u[1]) < 2)));
    const best = three.reduce((m, t) => (most ? t[1] > m[1] : t[1] < m[1]) ? t : m);
    return { three, best };
  }
  const label = t => t[0];
  const an = w => (/^[aeiou]/.test(w) ? 'an ' : 'a ') + w;

  const TRAINS = [['green', 'Green'], ['blue', 'Blue'], ['red', 'Red'], ['purple', 'Purple']];
  const trains = (c1, a, c2, b) => M.items([[a, 'square', c1], [b, 'square', c2]], { rows: true, per: 0 });
  A.skill({
    id: 'k.compare-length', title: 'Compare length and height',
    learn: p('<b>Longer</b> means it goes farther from end to end. <b>Shorter</b> means it does not go as far.') +
      p('<b>Taller</b> means it goes up higher. To compare, line up the ends. Then look at the other end.') +
      p('A bus is longer than a spoon. A giraffe is taller than a cat.') +
      example('Example', `${trains('green', 5, 'blue', 3)}The trains start at the same place. The green train goes farther. The <b>green train is longer</b>.`),
    make(rng) {
      const kind = rng.pick(['trains', 'trains', 'tall', 'long']);
      if (kind === 'trains') {
        const [[e1, c1], [e2, c2]] = rng.sample(TRAINS, 2);
        const a = rng.int(2, 9), b = rng.chance(0.15) ? a : rng.int(2, 9);
        const ask = rng.pick(['longer', 'shorter']);
        const o1 = `${c1} train`, o2 = `${c2} train`, same = 'Same length';
        const answer = a === b ? same : (ask === 'longer') === (a > b) ? o1 : o2;
        return { prompt: `Which train is ${ask}?${trains(e1, a, e2, b)}`, type: 'choice', choices: [o1, o2, same], answer, keepOrder: true, params: { kind, e1, e2, ask, o1, o2 },
          hints: ['Both trains start at the same place. Look at where they end.', `The ${c1.toLowerCase()} train has ${a} cars. The ${c2.toLowerCase()} train has ${b} cars.`, a === b ? `They end at the same place. They are the <b>same length</b>.` : `So the answer is the <b>${answer.toLowerCase()}</b>.`] };
      }
      const most = rng.bool();
      const list = kind === 'tall' ? TALL : LONG;
      const { three, best } = pickThree(rng, list, most);
      const word = kind === 'tall' ? (most ? 'tallest' : 'shortest') : (most ? 'longest' : 'shortest');
      return { prompt: `Which one is the ${word}?`, type: 'choice', choices: three.map(label), answer: label(best), params: { kind, most, names: three.map(t => t[0]) },
        hints: [`Think about each one: ${M.list(three.map(t => an(t[0])))}.`, kind === 'tall' ? `Picture them standing side by side. Which goes ${most ? 'up the highest' : 'up the least'}?` : `Picture them lying side by side. Which goes ${most ? 'the farthest' : 'the least far'}?`, `The <b>${label(best)}</b> is the ${word}.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'trains') {
        const a = M.countItems(q.prompt, `${pr.e1} square`), b = M.countItems(q.prompt, `${pr.e2} square`);
        return q.answer === (a === b ? 'Same length' : (pr.ask === 'longer' ? a > b : a < b) ? pr.o1 : pr.o2);
      }
      const order = (pr.kind === 'tall' ? ['ant', 'mouse', 'cat', 'child', 'horse', 'giraffe'] : ['ant', 'spoon', 'loaf of bread', 'crocodile', 'bus', 'train']).filter(x => pr.names.includes(x));
      return q.answer === (pr.most ? order[order.length - 1] : order[0]);
    },
  });

  A.skill({
    id: 'k.compare-weight', title: 'Compare weight',
    learn: p('<b>Heavier</b> means it weighs more. It is hard to lift. <b>Lighter</b> means it weighs less. It is easy to lift.') +
      p('On a seesaw, <b>the heavier side goes down</b>. The lighter side goes up. If they weigh the same, it stays level.') +
      p('A cow is heavier than an apple. A leaf is lighter than a dog.') +
      example('Example', `${big('an elephant or an apple')}Which is heavier? An elephant is very hard to lift. The <b>elephant</b> is heavier.`),
    make(rng) {
      const kind = rng.pick(['things', 'things', 'seesaw']);
      if (kind === 'seesaw') {
        const [x, y] = rng.sample(NAMES, 2);
        const down = rng.pick(['x', 'y', 'x', 'y', 'level']);
        const ask = rng.pick(['heavier', 'lighter']);
        const same = 'Same weight';
        const answer = down === 'level' ? same : (ask === 'heavier') === (down === 'x') ? x : y;
        const story = down === 'level' ? `The seesaw stays level.` : `${down === 'x' ? x : y}'s side goes down.`;
        return { prompt: `${x} and ${y} sit on a seesaw. ${story} Who is ${ask}?`, type: 'choice', choices: [x, y, same], answer, keepOrder: true, params: { kind, x, y, down, ask },
          hints: ['The heavier side goes down. The lighter side goes up.', down === 'level' ? 'Level means neither side went down.' : `${down === 'x' ? x : y} went down. ${down === 'x' ? y : x} went up.`, answer === same ? 'They are the <b>same weight</b>.' : `<b>${answer}</b> is ${ask}.`] };
      }
      const most = rng.bool();
      const { three, best } = pickThree(rng, HEAVY, most);
      const word = most ? 'heaviest' : 'lightest';
      return { prompt: `Which one is the ${word}?`, type: 'choice', choices: three.map(label), answer: label(best), params: { kind, most, names: three.map(t => t[0]) },
        hints: [`Think about lifting each one: ${M.list(three.map(t => an(t[0])))}.`, most ? 'Which one is the hardest to lift?' : 'Which one is the easiest to lift?', `The <b>${label(best)}</b> is the ${word}.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'seesaw') {
        if (pr.down === 'level') return q.answer === 'Same weight';
        const heavy = pr.down === 'x' ? pr.x : pr.y, light = pr.down === 'x' ? pr.y : pr.x;
        return q.answer === (pr.ask === 'heavier' ? heavy : light);
      }
      const order = ['leaf', 'berry', 'apple', 'watermelon', 'dog', 'cow', 'elephant'].filter(x => pr.names.includes(x));
      return q.answer === (pr.most ? order[order.length - 1] : order[0]);
    },
  });

  /* ---------- Unit 4: Geometry ---------- */
  const svg = body => `<svg class="figure" viewBox="0 0 160 120" width="160" height="120" role="img" aria-label="a shape">${body}</svg>`;
  const ptsAttr = pts => pts.map(([x, y]) => `${x},${y}`).join(' ');
  function regular(n, r, rot) {
    const out = [];
    for (let i = 0; i < n; i++) { const t = (rot + i * 360 / n - 90) * Math.PI / 180; out.push([Math.round(80 + r * Math.cos(t)), Math.round(60 + r * Math.sin(t))]); }
    return out;
  }
  /** points for a flat shape, drawn a little differently each time; null for a circle */
  function flatShape(rng, name) {
    const j = () => rng.int(-6, 6);
    if (name === 'circle') return { r: rng.int(30, 52) };
    if (name === 'triangle') return { pts: rng.pick([[[80, 12], [142, 106], [18, 106]], [[28, 14], [28, 106], [136, 106]], [[62, 10], [130, 108], [24, 96]], [[18, 30], [142, 30], [80, 108]]]).map(([x, y]) => [x + j(), y + j()]) };
    if (name === 'square') { const s = rng.int(50, 92), x = Math.round(80 - s / 2), y = Math.round(60 - s / 2); return { pts: [[x, y], [x + s, y], [x + s, y + s], [x, y + s]] }; }
    if (name === 'rectangle') {
      const wide = rng.bool(), w = wide ? rng.int(104, 144) : rng.int(42, 62), h = wide ? rng.int(40, 66) : rng.int(92, 110);
      const x = Math.round(80 - w / 2), y = Math.round(60 - h / 2);
      return { pts: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]] };
    }
    return { pts: name === 'hexagon' ? regular(6, rng.int(40, 54), rng.pick([0, 30])) : regular(5, rng.int(40, 54), rng.pick([0, 36])) };
  }
  const drawFlat = s => svg(s.pts ? `<polygon class="fill" points="${ptsAttr(s.pts)}"/>` : `<circle class="fill" cx="80" cy="60" r="${s.r}"/>`);
  /** what a drawn shape is, worked out from its corners and side lengths */
  function nameOf(s) {
    if (!s.pts) return 'circle';
    const k = s.pts.length;
    if (k === 3) return 'triangle';
    if (k === 5) return 'pentagon';
    if (k === 6) return 'hexagon';
    const len = s.pts.map((pt, i) => Math.hypot(pt[0] - s.pts[(i + 1) % k][0], pt[1] - s.pts[(i + 1) % k][1]));
    return Math.max(...len) - Math.min(...len) < 0.5 ? 'square' : 'rectangle';
  }
  const FLAT = ['circle', 'triangle', 'square', 'rectangle', 'hexagon'];
  const CORNERS = { triangle: 3, square: 4, rectangle: 4, pentagon: 5, hexagon: 6, circle: 0 };

  A.skill({
    id: 'k.shape-names', title: 'Name flat shapes',
    learn: p('<b>Flat shapes</b> have names. Look at the <b>sides</b> (the straight lines) and the <b>corners</b> (where two sides meet).') +
      p('A <b>circle</b> is round, with no sides. A <b>triangle</b> has 3 sides. A <b>square</b> has 4 sides that are all the same length. A <b>rectangle</b> has 4 sides too: 2 long and 2 short. A <b>hexagon</b> has 6 sides.') +
      p('A shape keeps its name when it is big, small, or turned.') +
      example('Example', `${svg(`<polygon class="fill" points="${ptsAttr([[80, 14], [140, 104], [20, 104]])}"/>`)}This shape has 3 sides and 3 corners. It is a <b>triangle</b>.`),
    make(rng) {
      const name = rng.pick(FLAT);
      const kind = rng.pick(['picture', 'picture', 'clue']);
      const others = rng.shuffle(FLAT.filter(x => x !== name));
      if (name === 'square' || name === 'rectangle') { const twin = name === 'square' ? 'rectangle' : 'square'; others.splice(others.indexOf(twin), 1); others.unshift(twin); }
      const choices = [name, ...others.slice(0, 3)];
      const s = flatShape(rng, name);
      const k = CORNERS[name];
      const fact = name === 'circle' ? 'It is round. It has no sides and no corners.' : name === 'square' ? 'It has 4 sides, all the same length.' : name === 'rectangle' ? 'It has 4 sides: 2 long and 2 short.' : `It has ${k} sides and ${k} corners.`;
      const hints = [name === 'circle' ? 'Is it round, or does it have straight sides?' : 'Count the straight sides.', fact, `It is a <b>${name}</b>.`];
      const clue = name === 'circle' ? 'I am round. I have no sides and no corners.' : fact.replace(/^It has/, 'I have');
      if (kind === 'clue') return { prompt: `What shape am I?${big(clue)}`, type: 'choice', choices, answer: name, hints: hints.slice(1), params: { kind, name } };
      return { prompt: `What shape is this?${drawFlat(s)}`, type: 'choice', choices, answer: name, hints, params: { kind, s } };
    },
    verify(q) { return q.params.kind === 'clue' ? CORNERS[q.answer] === CORNERS[q.params.name] && q.answer === q.params.name : nameOf(q.params.s) === q.answer; },
  });

  A.skill({
    id: 'k.sides-corners', title: 'Count sides and corners',
    learn: p('A <b>side</b> is a straight line on the edge of a shape. A <b>corner</b> is a point where two sides meet.') +
      p('To count, put your finger on one corner. <b>Go around the shape</b> and count each one until you are back where you started.') +
      p('A shape has <b>the same number of sides and corners</b>. A circle has none.') +
      example('Example', `${svg(`<polygon class="fill" points="${ptsAttr(regular(6, 48, 0))}"/>`)}Go around: 1, 2, 3, 4, 5, 6. This hexagon has <b>6</b> sides and 6 corners.`),
    make(rng) {
      const name = rng.pick(['triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'triangle', 'rectangle', 'hexagon', 'circle']);
      const part = rng.pick(['sides', 'corners']);
      const s = flatShape(rng, name), k = s.pts ? s.pts.length : 0;
      const kind = name !== 'circle' && name !== 'pentagon' && rng.chance(0.25) ? 'word' : 'picture';
      const hints = name === 'circle' ? ['A circle is round all the way.', 'It has no straight sides and no corners.', `A circle has <b>0</b> ${part}.`]
        : ['Start at one corner. Go around the shape.', `Count: ${countUp(1, k)}.`, `${kind === 'word' ? `A ${name}` : 'This shape'} has <b>${k}</b> ${part}.`];
      if (kind === 'word') return { prompt: `How many ${part} does a ${name} have?`, type: 'number', answer: k, hints, params: { kind, name } };
      return { prompt: `How many ${part} does this shape have?${drawFlat(s)}`, type: 'number', answer: k, hints, params: { kind, s } };
    },
    verify(q) {
      if (q.params.kind === 'word') return { triangle: 3, square: 4, rectangle: 4, hexagon: 6 }[q.params.name] === q.answer;
      const m = /points="([^"]*)"/.exec(q.prompt);
      return (m ? m[1].trim().split(/\s+/).length : 0) === q.answer;
    },
  });

  const SOLIDS = ['cube', 'sphere', 'cone', 'cylinder'];
  function drawSolid(rng, name) {
    const z = rng.int(80, 110) / 100, cx = 80, cy = 62;
    const R = v => Math.round(v * z);
    if (name === 'cube') {
      const s = R(56), d = R(22), x = Math.round(cx - (s + d) / 2), y = Math.round(cy - (s - d) / 2);
      return svg(`<polygon class="fill" points="${ptsAttr([[x, y], [x + s, y], [x + s, y + s], [x, y + s]])}"/>` +
        `<polygon class="fill" points="${ptsAttr([[x, y], [x + d, y - d], [x + s + d, y - d], [x + s, y]])}"/>` +
        `<polygon class="fill" points="${ptsAttr([[x + s, y], [x + s + d, y - d], [x + s + d, y + s - d], [x + s, y + s]])}"/>`);
    }
    if (name === 'sphere') { const r = R(46); return svg(`<circle class="fill" cx="${cx}" cy="${cy}" r="${r}"/><path class="stroke light" stroke-dasharray="4 4" d="M ${cx - r} ${cy} A ${r} ${R(12)} 0 0 0 ${cx + r} ${cy}"/>`); }
    const rx = R(36), ry = R(11), top = cy - R(42), bot = cy + R(42);
    if (name === 'cylinder') {
      return svg(`<path class="fill" d="M ${cx - rx} ${top} L ${cx - rx} ${bot} A ${rx} ${ry} 0 0 0 ${cx + rx} ${bot} L ${cx + rx} ${top} Z"/><ellipse class="fill" cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}"/>`);
    }
    return svg(`<path class="fill" d="M ${cx - rx} ${bot} L ${cx} ${top} L ${cx + rx} ${bot} A ${rx} ${ry} 0 0 1 ${cx - rx} ${bot} Z"/><path class="stroke light" stroke-dasharray="4 4" d="M ${cx - rx} ${bot} A ${rx} ${ry} 0 0 1 ${cx + rx} ${bot}"/>`);
  }
  /** what a drawn solid is, read back from the drawing itself */
  function solidOf(html) {
    if ((html.match(/<polygon/g) || []).length === 3) return 'cube';
    if (/<circle/.test(html)) return 'sphere';
    if (/<ellipse/.test(html)) return 'cylinder';
    return /L 80 /.test(html) ? 'cone' : '?';
  }
  const OBJECTS = [['A ball', 'sphere'], ['A marble', 'sphere'], ['A globe', 'sphere'], ['A number cube', 'cube'], ['An ice cube', 'cube'], ['A can', 'cylinder'], ['A drum', 'cylinder'], ['A battery', 'cylinder'], ['An ice cream cone', 'cone']];
  const SOLID_OF_OBJECT = { 'A ball': 'sphere', 'A marble': 'sphere', 'A globe': 'sphere', 'A number cube': 'cube', 'An ice cube': 'cube', 'A can': 'cylinder', 'A drum': 'cylinder', 'A battery': 'cylinder', 'An ice cream cone': 'cone' };
  const TWIN = { circle: 'sphere', square: 'cube', triangle: 'cone', rectangle: 'cylinder' };

  A.skill({
    id: 'k.solid-shapes', title: 'Name solid shapes',
    learn: p('Flat shapes lie flat on paper. <b>Solid shapes</b> are not flat. You can hold them in your hand.') +
      p('A <b>sphere</b> is round like a ball. A <b>cube</b> is like a box with square sides, like a number cube. A <b>cylinder</b> is like a can. A <b>cone</b> is like an ice cream cone: round at the bottom, with a point on top.') +
      p('A circle is flat. A sphere is solid. A square is flat. A cube is solid.') +
      example('Example', `${drawSolid({ int: () => 100 }, 'cylinder')}A can has this shape. It is round on the top and bottom, with straight sides. It is a <b>cylinder</b>.`),
    make(rng) {
      const kind = rng.pick(['picture', 'picture', 'object', 'flat']);
      if (kind === 'flat') {
        const flat = rng.pick(Object.keys(TWIN)), askFlat = rng.bool();
        const pool = askFlat ? rng.sample(SOLIDS.filter(x => x !== TWIN[flat]), 2).concat([TWIN[flat]]) : rng.sample(Object.keys(TWIN).filter(x => x !== flat), 2).concat([flat]);
        const answer = askFlat ? flat : TWIN[flat];
        return { prompt: `Which shape is ${askFlat ? 'flat' : 'solid'}?`, type: 'choice', choices: [answer, ...pool], answer, params: { kind, askFlat },
          hints: ['Flat shapes: circle, square, triangle, rectangle.', 'Solid shapes: sphere, cube, cone, cylinder.', `The <b>${answer}</b> is ${askFlat ? 'flat' : 'solid'}.`] };
      }
      if (kind === 'object') {
        const [what, name] = rng.pick(OBJECTS);
        return { prompt: `${what} is shaped like which solid?`, type: 'choice', choices: SOLIDS.slice(), answer: name, keepOrder: true, params: { kind, what },
          hints: ['Is it round all over? Does it have a point? Flat square sides? Round ends?', { sphere: 'It is round all over, like a ball.', cube: 'It has flat square sides, like a box.', cylinder: 'It has round flat ends and goes straight up.', cone: 'It is round at one end and has a point at the other.' }[name], `It is a <b>${name}</b>.`] };
      }
      const name = rng.pick(SOLIDS);
      return { prompt: `What solid shape is this?${drawSolid(rng, name)}`, type: 'choice', choices: SOLIDS.slice(), answer: name, keepOrder: true, params: { kind },
        hints: ['Does it have a point? Is it round all over? Does it have square sides?', { sphere: 'It is round all over, like a ball.', cube: 'It has flat square faces, like a number cube.', cylinder: 'It has two round flat ends, like a can.', cone: 'It has a round bottom and a point on top.' }[name], `It is a <b>${name}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'flat') return ['circle', 'square', 'triangle', 'rectangle'].includes(q.answer) === pr.askFlat;
      if (pr.kind === 'object') return SOLID_OF_OBJECT[pr.what] === q.answer;
      return solidOf(q.prompt) === q.answer;
    },
  });

  /** k different shapes, each with its own color: [shape, color, name] */
  const things = (rng, k) => { const sh = rng.sample(SHAPES, k), col = rng.sample(COLORS, k); return sh.map((s, i) => [s, col[i], `${col[i]} ${s}`]); };
  const one = t => [1, t[0], t[1]];
  const SPOT = { size: 44 };
  A.skill({
    id: 'k.position-words', title: 'Position words',
    learn: p('Position words tell <b>where</b> something is.') +
      p('<b>Above</b> means higher up. <b>Below</b> means lower down. <b>Next to</b> means right beside it. <b>Between</b> means in the middle of two things.') +
      p('Look at the picture. Find the first thing. Then see where the other thing is.') +
      example('Example', `${M.items([[1, 'circle', 'red'], [1, 'square', 'green']], { rows: true, size: 44, label: 'Top: red circle. Bottom: green square.' })}The red circle is higher up than the green square. The circle is <b>above</b> the square.`),
    make(rng) {
      const kind = rng.pick(['pair', 'pair', 'between', 'column']);
      if (kind === 'pair') {
        const [c, pl] = things(rng, 2);
        const where = rng.pick(['above', 'below', 'next to']);
        const grid = where === 'next to' ? [[c, 0, 0], [pl, 0, 1]] : where === 'above' ? [[c, 0, 0], [pl, 1, 0]] : [[pl, 0, 0], [c, 1, 0]];
        if (where === 'next to' && rng.bool()) { grid[0][2] = 1; grid[1][2] = 0; }
        const order = where === 'next to' ? grid.slice().sort((x, y) => x[2] - y[2]).map(g => g[0]) : grid.map(g => g[0]);
        const picture = M.items(order.map(one), Object.assign({ rows: where !== 'next to', label: where === 'next to' ? `Left: ${order[0][2]}. Right: ${order[1][2]}.` : `Top: ${order[0][2]}. Bottom: ${order[1][2]}.` }, SPOT));
        return { prompt: `The ${c[2]} is ___ the ${pl[2]}.${picture}`, type: 'choice', choices: ['above', 'below', 'next to'], answer: where, keepOrder: true, params: { kind, grid: grid.map(g => [g[0][2], g[1], g[2]]), who: c[2], ref: pl[2] },
          hints: [`Find the ${pl[2]}.`, where === 'next to' ? `The ${c[2]} is on the same line, right beside it.` : `Is the ${c[2]} higher up or lower down?`, `The ${c[2]} is <b>${where}</b> the ${pl[2]}.`] };
      }
      const three = things(rng, 3), names = three.map(t => t[2]);
      if (kind === 'between') {
        const picture = M.items(three.map(one), Object.assign({ label: `From left to right: ${names.join(', ')}.` }, SPOT));
        return { prompt: `Which one is between the ${names[0]} and the ${names[2]}?${picture}`, type: 'choice', choices: names.slice(), answer: names[1], params: { kind, row: names },
          hints: [`Find the ${names[0]} and the ${names[2]}.`, 'Between means in the middle.', `The <b>${names[1]}</b> is between them.`] };
      }
      const up = rng.bool();               // ask what is above the middle one, or below it
      const ans = up ? names[0] : names[2];
      const picture = M.items(three.map(one), Object.assign({ rows: true, label: `From top to bottom: ${names.join(', ')}.` }, SPOT));
      return { prompt: `What is ${up ? 'above' : 'below'} the ${names[1]}?${picture}`, type: 'choice', choices: names.slice(), answer: ans, params: { kind, col: names, up },
        hints: [`Find the ${names[1]}. It is in the middle.`, up ? 'Above means higher up. Look up.' : 'Below means lower down. Look down.', `The <b>${ans}</b> is ${up ? 'above' : 'below'} the ${names[1]}.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'pair') {
        const a = pr.grid.find(g => g[0] === pr.who), b = pr.grid.find(g => g[0] === pr.ref);
        const want = a[1] === b[1] ? (Math.abs(a[2] - b[2]) === 1 ? 'next to' : '?') : a[1] < b[1] ? 'above' : 'below';
        return q.answer === want;
      }
      if (pr.kind === 'between') return q.answer === pr.row[1] && pr.row.length === 3;
      const mid = pr.col.indexOf(pr.col[1]);
      return q.answer === pr.col[pr.up ? mid - 1 : mid + 1];
    },
  });

})();
