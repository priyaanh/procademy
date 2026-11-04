/* 1st grade math. Place value, adding and subtracting within 20, adding and subtracting with tens,
   measurement, time and data, and shapes. Short sentences and small numbers for 6-year-olds. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const N = M.n;
  const T = k => M.plural(k, 'ten'), O = k => M.plural(k, 'one');
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = (s) => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  /** a row of k drawn shapes (in groups of five, so they are easy to count) for a picture graph */
  const pics = (k, sh, col) => M.items(k, sh, col, { per: 0, size: 24, inline: true });
  const LOOKS = [['circle', 'red'], ['square', 'blue'], ['triangle', 'green'], ['star', 'orange'], ['heart', 'purple']];
  const svg = (w, h, body, label) => `<svg class="figure" viewBox="0 0 ${w} ${h}" width="${w}" role="img" aria-label="${label}">${body}</svg>`;

  /** base-ten blocks: t rods of ten and o single cubes */
  function blocks(t, o) {
    let body = '';
    for (let i = 0; i < t; i++) {
      const x = 8 + i * 22;
      for (let c = 0; c < 10; c++) body += `<rect class="fill ten" x="${x}" y="${8 + c * 12}" width="12" height="12"/>`;
    }
    const ox = 8 + t * 22 + (t ? 12 : 0);
    for (let i = 0; i < o; i++) {
      const col = Math.floor(i / 5), row = i % 5;
      body += `<rect class="fill one" x="${ox + col * 18}" y="${116 - row * 18}" width="12" height="12"/>`;
    }
    const w = ox + Math.ceil(o / 5) * 18 + 8;
    return svg(Math.max(w, 60), 136, body, `${T(t)} and ${O(o)}`);
  }

  A.course({
    id: 'math-1', title: '1st grade math', subject: 'Elementary', grade: 1, icon: '1', hue: 0,
    blurb: 'Tens and ones, adding and taking away within 20, adding tens, measuring, telling time, picture graphs, and shapes.',
    units: [
      { id: 'place-value', title: 'Place value', blurb: 'Counting to 120, tens and ones, and comparing numbers.', skills: ['g1.count-120', 'g1.tens-ones', 'g1.compare-two-digit'] },
      { id: 'add-sub-20', title: 'Addition and subtraction within 20', blurb: 'Adding, taking away, missing numbers, and story problems.', skills: ['g1.add-within-20', 'g1.sub-within-20', 'g1.missing-number', 'g1.word-problems-20'] },
      { id: 'add-sub-tens', title: 'Adding and subtracting with tens', blurb: '10 more and 10 less, adding tens, and two-digit plus one-digit.', skills: ['g1.ten-more-less', 'g1.add-sub-tens', 'g1.add-two-digit'] },
      { id: 'measure-data', title: 'Measurement, time, and data', blurb: 'Longer and shorter, measuring with cubes, clocks, and picture graphs.', skills: ['g1.order-lengths', 'g1.measure-lengths', 'g1.tell-time', 'g1.read-graphs'] },
      { id: 'geometry', title: 'Geometry', blurb: 'Sides and corners, and cutting shapes into halves and fourths.', skills: ['g1.shape-attributes', 'g1.halves-fourths'] },
    ],
  });

  /* ---------- Unit 1: Place value ---------- */
  A.skill({
    id: 'g1.count-120', title: 'Counting to 120',
    learn: p('When we count, each number is <b>1 more</b> than the number before it. After 29 comes 30. After 99 comes 100. After 109 comes 110.') +
      p('We can also <b>count by tens</b>: 10, 20, 30, 40 … Each jump adds one more ten. After 100 we keep going: 110, 120.') +
      example('Example', `${big('57, 58, 59, ?')}Each number is 1 more. 1 more than 59 is <b>60</b>.`),
    make(rng) {
      const kind = rng.pick(['ones', 'ones', 'tens', 'middle']);
      const step = kind === 'tens' ? 10 : 1;
      const start = kind === 'tens' ? rng.int(0, 8) * 10 + rng.pick([0, 0, rng.int(1, 9)]) : rng.int(1, 116);
      const seq = [0, 1, 2, 3].map(i => start + i * step);
      const gap = kind === 'middle' ? rng.int(1, 2) : 3;
      const shown = seq.map((x, i) => i === gap ? '?' : N(x)).join(', ');
      const ans = seq[gap];
      const prev = seq[gap - 1];
      const hints = [step === 10 ? 'Each number is 10 more than the one before. The tens go up by 1, and the ones stay the same.' : 'Each number is 1 more than the one before.',
        `Look at the number before the ?: ${N(prev)}.`,
        `${step === 10 ? '10' : '1'} more than ${N(prev)} is <b>${N(ans)}</b>.`];
      return { prompt: `What number goes where the ? is?${big(shown)}`, type: 'number', answer: ans, hints, params: { seq: seq.map((x, i) => i === gap ? null : x), step } };
    },
    verify(q) {
      const { seq, step } = q.params;
      const full = seq.map(x => x === null ? q.answer : x);
      return full.every((x, i) => i === 0 || x - full[i - 1] === step);
    },
  });

  A.skill({
    id: 'g1.tens-ones', title: 'Tens and ones',
    learn: p('A two-digit number is made of <b>tens</b> and <b>ones</b>. In 47, the 4 means 4 tens (40) and the 7 means 7 ones.') +
      p('A ten is a stick of 10 cubes. A one is a single cube. To find the number, count the sticks for the tens digit and the cubes for the ones digit.') +
      example('Example', `${blocks(3, 5)}3 sticks of ten and 5 single cubes. 3 tens and 5 ones make <b>35</b>.`),
    make(rng) {
      const kind = rng.pick(['picture', 'picture', 'words', 'how-many-tens', 'how-many-ones']);
      const t = rng.int(1, 9), o = rng.int(0, 9), num = 10 * t + o;
      if (kind === 'picture') {
        return { prompt: `What number do the blocks show?${blocks(t, o)}`, type: 'number', answer: num, params: { kind, t, o },
          hints: [`Count the sticks of ten. There ${t === 1 ? 'is' : 'are'} ${t}. That is ${N(10 * t)}.`, `Count the single cubes. There ${o === 1 ? 'is' : 'are'} ${o}.`, `${T(t)} and ${O(o)} make <b>${N(num)}</b>.`] };
      }
      if (kind === 'words') {
        return { prompt: `What number is this?${big(`${M.plural(t, 'ten')} and ${M.plural(o, 'one')}`)}`, type: 'number', answer: num, params: { kind, t, o },
          hints: [`The tens digit is ${t}, and the ones digit is ${o}.`, `Write the tens digit first, then the ones digit: <b>${N(num)}</b>.`] };
      }
      const tens = kind === 'how-many-tens';
      return { prompt: `How many <b>${tens ? 'tens' : 'ones'}</b> are in this number?${big(N(num))}`, type: 'number', answer: tens ? t : o, params: { kind, num },
        hints: [`In ${N(num)}, the first digit is the tens and the last digit is the ones.`, `${N(num)} is ${M.plural(t, 'ten')} and ${M.plural(o, 'one')}.`, `So there ${(tens ? t : o) === 1 ? 'is' : 'are'} <b>${tens ? t : o}</b> ${tens ? 'tens' : 'ones'}.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'how-many-tens') return q.answer === Number(String(p.num)[0]);
      if (p.kind === 'how-many-ones') return q.answer === Number(String(p.num).slice(-1));
      return Number(String(p.t) + String(p.o)) === q.answer;
    },
  });

  A.skill({
    id: 'g1.compare-two-digit', title: 'Comparing two-digit numbers',
    learn: p('To compare two numbers, <b>look at the tens first</b>. The number with more tens is bigger. If the tens are the same, look at the ones.') +
      p('The sign <b>&lt;</b> means "is less than" and <b>&gt;</b> means "is greater than". The open mouth always faces the bigger number. <b>=</b> means "is the same as".') +
      example('Example', `${big('46 ? 64')}46 has 4 tens. 64 has 6 tens. 4 tens is less, so <b>46 &lt; 64</b>.`),
    make(rng) {
      const kind = rng.pick(['diff-tens', 'diff-tens', 'same-tens', 'same-tens', 'swap', 'swap', 'equal']);
      let a = rng.int(10, 99), b;
      if (kind === 'equal') b = a;
      else if (kind === 'same-tens') { b = Math.floor(a / 10) * 10 + rng.int(0, 9); if (b === a) b = a % 10 === 9 ? a - 1 : a + 1; }
      else if (kind === 'swap') { const [t, o] = rng.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 2); a = 10 * t + o; b = 10 * o + t; }
      else { b = rng.int(10, 99); if (Math.floor(b / 10) === Math.floor(a / 10)) b = (b + 30) % 90 + 10; }
      const sign = a < b ? '&lt;' : a > b ? '&gt;' : '=';
      const choices = ['&lt;', '&gt;', '='].map(s => `${N(a)} ${s} ${N(b)}`);
      const ta = Math.floor(a / 10), tb = Math.floor(b / 10);
      const hints = [`Look at the tens first. ${N(a)} has ${M.plural(ta, 'ten')}. ${N(b)} has ${M.plural(tb, 'ten')}.`];
      if (ta === tb) hints.push(`The tens are the same, so look at the ones: ${a % 10} and ${b % 10}.`);
      hints.push(a === b ? 'Both numbers are the same, so use =.' : `${N(Math.min(a, b))} is less than ${N(Math.max(a, b))}. The open side of the sign faces ${N(Math.max(a, b))}.`);
      hints.push(`<b>${N(a)} ${sign} ${N(b)}</b>`);
      return { prompt: `Which sign makes this true?${big(`${N(a)} ☐ ${N(b)}`)}`, type: 'choice', answer: `${N(a)} ${sign} ${N(b)}`, choices, keepOrder: true, hints, params: { a, b } };
    },
    verify(q) {
      const { a, b } = q.params;
      const sign = q.answer.includes('&lt;') ? -1 : q.answer.includes('&gt;') ? 1 : 0;
      return Math.sign(a - b) === sign;
    },
  });

  /* ---------- Unit 2: Addition and subtraction within 20 ---------- */
  A.skill({
    id: 'g1.add-within-20', title: 'Add within 20',
    learn: p('To add, we put two groups together and find how many in all. You can count on from the bigger number: for 9 + 3, say "9 … 10, 11, 12".') +
      p('A useful strategy is to <b>make a ten</b>. For 8 + 5, take 2 from the 5 to make 8 into 10. Then 10 + 3 = 13. Adding to 10 is simple.') +
      example('Example', `${big('7 + 6 = ?')}7 needs 3 more to make 10. 6 is 3 and 3. So 7 + 3 = 10, and 10 + 3 = <b>13</b>.`),
    make(rng) {
      const kind = rng.pick(['make-ten', 'make-ten', 'pictures', 'doubles']);
      let a, b;
      if (kind === 'pictures') { a = rng.int(1, 6); b = rng.int(1, 6); }
      else if (kind === 'doubles') { a = rng.int(2, 10); b = a + rng.pick([0, 0, 1]); }
      else { a = rng.int(5, 9); b = rng.int(11 - a, 9); if (rng.bool()) [a, b] = [b, a]; }
      const ans = a + b, hi = Math.max(a, b), lo = Math.min(a, b);
      const [sh, col] = rng.pick([['circle', 'red'], ['heart', 'purple'], ['circle', 'orange'], ['star', 'orange']]);
      const hints = [];
      if (kind === 'pictures') hints.push(`Count all the ${sh}s. Start at ${hi} and count on ${lo} more.`);
      else if (kind === 'doubles') hints.push(a === b ? `This is a double: ${a} and ${a}.` : `This is a double plus 1: ${lo} + ${lo} = ${N(2 * lo)}, then 1 more.`);
      else if (hi + lo > 10) hints.push(`Make a ten. ${hi} needs ${10 - hi} more to make 10. Break ${lo} into ${10 - hi} and ${lo - (10 - hi)}.`, `${hi} + ${10 - hi} = 10. Then 10 + ${lo - (10 - hi)} = ${N(ans)}.`);
      else hints.push(`${hi} and ${lo} make 10.`);
      hints.push(`${a} + ${b} = <b>${N(ans)}</b>.`);
      const pic = kind === 'pictures' ? M.items([[a, sh, col], [b, sh, col]], { sep: '+', per: 0 }) : '';
      return { prompt: `Add.${pic}${big(`${a} + ${b} = ?`)}`, type: 'number', answer: ans, hints, params: { a, b } };
    },
    verify(q) { let n = q.params.a; for (let i = 0; i < q.params.b; i++) n++; return q.answer === n; },
  });

  A.skill({
    id: 'g1.sub-within-20', title: 'Subtract within 20',
    learn: p('To subtract, we take some away and find how many are left. You can count back: for 12 − 3, say "12 … 11, 10, 9".') +
      p('Another strategy is to <b>go back to ten</b>. For 15 − 7, take 5 away to get to 10, then take 2 more: 10 − 2 = 8. You can also <b>think of adding</b>: 7 + 8 = 15, so 15 − 7 = 8.') +
      example('Example', `${big('13 − 5 = ?')}Take 3 to get to 10. Then take 2 more. 10 − 2 = <b>8</b>.`),
    make(rng) {
      const kind = rng.pick(['through-ten', 'through-ten', 'pictures', 'small']);
      let a, b;
      if (kind === 'through-ten') { a = rng.int(11, 18); b = rng.int(a - 9, 9); }
      else if (kind === 'pictures') { a = rng.int(4, 10); b = rng.int(1, a - 1); }
      else { a = rng.int(11, 19); b = rng.int(1, a - 10); }
      const ans = a - b;
      const hints = [];
      if (kind === 'through-ten') hints.push(`Go back to 10 first. ${a} − ${a - 10} = 10.`, `You still need to take away ${b - (a - 10)} more. 10 − ${b - (a - 10)} = ${ans}.`);
      else if (kind === 'pictures') hints.push(`There are ${a} in all. Cross out ${b} of them and count the rest.`);
      else hints.push(`Only the ones change. ${O(a % 10)} take away ${O(b)} is ${O(a % 10 - b)}, and the ten stays.`);
      hints.push(`Check by adding: ${b} + ${ans} = ${a}.`, `${a} − ${b} = <b>${N(ans)}</b>.`);
      const pic = kind === 'pictures' ? M.items(a, 'circle', 'blue', { out: b, per: 0 }) : '';
      return { prompt: `Subtract.${pic}${big(`${a} − ${b} = ?`)}`, type: 'number', answer: ans, hints, params: { a, b } };
    },
    verify(q) { return q.answer + q.params.b === q.params.a && q.answer >= 0; },
  });

  A.skill({
    id: 'g1.missing-number', title: 'Find the missing number',
    learn: p('Sometimes a number is missing from an addition or subtraction. The box ☐ stands for the missing number.') +
      p('For 6 + ☐ = 10, ask: <b>"6 and how many more make 10?"</b> Count up from 6 to 10: 7, 8, 9, 10. That is 4 more. For 12 − ☐ = 8, ask: "12 take away how many leaves 8?" Count back from 12 to 8.') +
      example('Example', `${big('8 + ☐ = 13')}Count up from 8: 9, 10, 11, 12, 13. That is 5 counts, so ☐ = <b>5</b>. Check: 8 + 5 = 13.`),
    make(rng) {
      const form = rng.pick(['a+?=c', '?+b=c', 'a-?=c', '?-b=c', 'a+?=c']);
      const x = rng.int(1, 9), y = rng.int(1, 10);
      const total = x + y;               // every form is built from x + y = total
      let shown, ans, hints;
      if (form === 'a+?=c') { shown = `${x} + ☐ = ${total}`; ans = y; hints = [`Ask: ${x} and how many more make ${total}?`, `Count up from ${x} to ${total}. Count how many numbers you say.`]; }
      else if (form === '?+b=c') { shown = `☐ + ${y} = ${total}`; ans = x; hints = [`Ask: what number and ${y} make ${total}?`, `Think of it as ${total} − ${y}.`]; }
      else if (form === 'a-?=c') { shown = `${total} − ☐ = ${x}`; ans = y; hints = [`Ask: ${total} take away how many leaves ${x}?`, `Count back from ${total} to ${x}. Count how many steps you take.`]; }
      else { shown = `☐ − ${y} = ${x}`; ans = total; hints = [`Ask: what number, take away ${y}, leaves ${x}?`, `Put them back together: ${x} + ${y}.`]; }
      hints.push(`☐ = <b>${ans}</b>. Check: ${shown.replace('☐', ans)}.`);
      return { prompt: `What number goes in the box?${big(shown)}`, type: 'number', answer: ans, hints, params: { shown } };
    },
    verify(q) {
      const m = q.params.shown.replace('☐', String(q.answer)).replace('−', '-').match(/^(\d+) ([+-]) (\d+) = (\d+)$/);
      if (!m) return 'unparsed';
      const [a, op, b, c] = [Number(m[1]), m[2], Number(m[3]), Number(m[4])];
      return (op === '+' ? a + b : a - b) === c;
    },
  });

  A.skill({
    id: 'g1.word-problems-20', title: 'Addition and subtraction word problems within 20',
    learn: p('A story problem tells a little story with numbers. Read it and ask: <b>are things being put together, or taken away?</b>') +
      p('Words like "in all" and "altogether" mean <b>add</b>. Words like "left", "gave away" or "how many more" usually mean <b>subtract</b>. Drawing dots for each thing can help.') +
      example('Example', `Ana has 9 shells. She finds 4 more. How many shells does she have now?<br>She gets more, so add: 9 + 4 = <b>13</b> shells.`),
    make(rng) {
      const kind = rng.pick(['join', 'take', 'compare', 'change', 'total']);
      const [n1, n2] = rng.sample(NAMES, 2);
      const thing = rng.pick(['stickers', 'shells', 'marbles', 'crayons', 'blocks', 'apples']);
      const a = rng.int(3, 12), b = rng.int(2, Math.min(8, 20 - a));
      let prompt, ans, hints;
      if (kind === 'join') { prompt = `${n1} has ${a} ${thing}. ${n1} gets ${b} more. How many ${thing} does ${n1} have now?`; ans = a + b; hints = [`${n1} gets more, so add.`, `${a} + ${b} = ${ans}.`]; }
      else if (kind === 'total') { prompt = `${n1} has ${a} ${thing}. ${n2} has ${b} ${thing}. How many ${thing} do they have in all?`; ans = a + b; hints = ['"In all" means put them together, so add.', `${a} + ${b} = ${ans}.`]; }
      else if (kind === 'take') { prompt = `${n1} has ${a + b} ${thing}. ${n1} gives ${b} to ${n2}. How many ${thing} does ${n1} have left?`; ans = a; hints = [`${n1} gives some away, so subtract.`, `${a + b} − ${b} = ${ans}.`]; }
      else if (kind === 'compare') { prompt = `${n1} has ${a + b} ${thing}. ${n2} has ${a} ${thing}. How many more ${thing} does ${n1} have than ${n2}?`; ans = b; hints = ['"How many more" means find the difference, so subtract.', `${a + b} − ${a} = ${ans}.`]; }
      else { prompt = `${n1} has ${a} ${thing}. ${n2} gives ${n1} some more. Now ${n1} has ${a + b}. How many ${thing} did ${n2} give?`; ans = b; hints = [`Ask: ${a} and how many more make ${a + b}?`, `Count up from ${a} to ${a + b}. That is ${ans}.`]; }
      hints.push(`The answer is <b>${ans}</b> ${thing}.`);
      return { prompt, type: 'number', answer: ans, unit: thing, hints, params: { kind, a, b } };
    },
    verify(q) {
      const { kind, a, b } = q.params;
      for (let x = 0; x <= 20; x++) {      // brute force: the story's number sentence holds only for the answer
        const ok = kind === 'join' || kind === 'total' ? x - a === b : kind === 'take' ? x + b === a + b : kind === 'compare' ? a + x === a + b : a + x === a + b;
        if (ok) return x === q.answer;
      }
      return false;
    },
  });

  /* ---------- Unit 3: Adding and subtracting with tens ---------- */
  A.skill({
    id: 'g1.ten-more-less', title: '10 more and 10 less',
    learn: p('<b>10 more</b> than a number has one more ten. The tens digit goes up by 1 and the ones digit stays the same. 10 more than 34 is 44.') +
      p('<b>10 less</b> has one less ten. The tens digit goes down by 1. 10 less than 34 is 24. <b>1 more</b> or <b>1 less</b> changes only the ones digit.') +
      example('Example', `What is 10 more than 58?<br>58 has 5 tens. One more ten makes 6 tens. The ones stay 8. The answer is <b>68</b>.`),
    make(rng) {
      const kind = rng.pick(['10 more', '10 more', '10 less', '10 less', '1 more', '1 less']);
      const num = kind === '10 more' ? rng.int(10, 89) : kind === '10 less' ? rng.int(20, 99) : rng.int(11, 98);
      const step = kind.startsWith('10') ? 10 : 1, sign = kind.endsWith('more') ? 1 : -1;
      const ans = num + sign * step;
      const hints = step === 10
        ? [`${N(num)} has ${T(Math.floor(num / 10))} and ${O(num % 10)}.`, `${sign > 0 ? 'One more ten' : 'One less ten'} makes ${T(Math.floor(ans / 10))}. The ones stay ${num % 10}.`]
        : [`Only the ones change. Count ${sign > 0 ? 'up' : 'back'} by 1 from ${N(num)}.`];
      hints.push(`${kind} than ${N(num)} is <b>${N(ans)}</b>.`);
      return { prompt: `What is <b>${kind}</b> than ${N(num)}?${blocks(Math.floor(num / 10), num % 10)}`, type: 'number', answer: ans, hints, params: { num, kind } };
    },
    verify(q) {
      const { num, kind } = q.params;
      const d = Number(kind.split(' ')[0]);
      return kind.endsWith('more') ? q.answer - d === num : q.answer + d === num;
    },
  });

  A.skill({
    id: 'g1.add-sub-tens', title: 'Add and subtract tens',
    learn: p('Numbers like 20, 50 and 80 are made of only tens. 50 is 5 tens. To add or subtract them, <b>add or subtract the tens</b>, just like small numbers.') +
      p('3 + 4 = 7, so 3 tens + 4 tens = 7 tens. That means 30 + 40 = 70. And 8 − 5 = 3, so 80 − 50 = 30.') +
      example('Example', `${big('60 − 20 = ?')}6 tens take away 2 tens is 4 tens. 4 tens is <b>40</b>.`),
    make(rng) {
      const kind = rng.pick(['add', 'sub', 'add', 'sub', 'missing']);
      let a = rng.int(1, 8), b = rng.int(1, 9 - a);
      if (kind === 'sub') { a = rng.int(2, 9); b = rng.int(1, a - 1); }
      const op = kind === 'sub' ? '−' : '+';
      const ansTens = kind === 'sub' ? a - b : kind === 'add' ? a + b : b;
      const shown = kind === 'missing' ? `${a * 10} + ☐ = ${(a + b) * 10}` : `${a * 10} ${op} ${b * 10} = ?`;
      const hints = kind === 'missing'
        ? [`${a * 10} is ${T(a)}, and ${(a + b) * 10} is ${T(a + b)}.`, `${T(a)} and how many tens make ${T(a + b)}? ${T(b)}.`]
        : [`${a * 10} is ${T(a)}, and ${b * 10} is ${T(b)}.`, `${a} ${op} ${b} = ${ansTens}, so the answer is ${T(ansTens)}.`];
      hints.push(`${M.plural(ansTens, 'ten')} is <b>${ansTens * 10}</b>.`);
      return { prompt: `${kind === 'missing' ? 'What number goes in the box?' : kind === 'sub' ? 'Subtract.' : 'Add.'}${big(shown)}`, type: 'number', answer: ansTens * 10, hints, params: { kind, a: a * 10, b: b * 10 } };
    },
    verify(q) {
      const { kind, a, b } = q.params;
      if (kind === 'missing') return a + q.answer === a + b && q.answer % 10 === 0;
      return kind === 'sub' ? q.answer + b === a : q.answer - b === a;
    },
  });

  A.skill({
    id: 'g1.add-two-digit', title: 'Add a two-digit number and a one-digit number',
    learn: p('To add a one-digit number to a two-digit number, <b>add the ones to the ones</b>. The tens stay the same: 42 + 5 = 47.') +
      p('If the ones add up to 10 or more, you <b>make a new ten</b>. For 38 + 6: 8 + 6 = 14, which is 1 ten and 4 ones. So 3 tens become 4 tens, and the answer is 44. You can also add a ten-number to a two-digit number: 25 + 30 adds 3 tens, so it is 55.') +
      example('Example', `${big('27 + 5 = ?')}7 + 5 = 12. That is 1 more ten and 2 ones. 2 tens + 1 ten = 3 tens. The answer is <b>32</b>.`),
    make(rng) {
      const kind = rng.pick(['easy', 'regroup', 'regroup', 'tens']);
      let a, b;
      if (kind === 'tens') { a = rng.int(11, 59); if (a % 10 === 0) a += 3; b = rng.int(1, Math.floor((99 - a) / 10)) * 10; }
      else { const o = rng.int(1, 8); b = kind === 'easy' ? rng.int(1, 9 - o) : rng.int(10 - o, 9); a = rng.int(1, 8) * 10 + o; }
      const ans = a + b, t = Math.floor(a / 10), o = a % 10;
      let hints;
      if (kind === 'tens') hints = [`${b} is ${T(b / 10)}. Add it to the tens of ${a}.`, `${T(t)} + ${T(b / 10)} = ${T(t + b / 10)}. The ones stay the same.`];
      else if (o + b < 10) hints = [`Add the ones: ${o} + ${b} = ${o + b}.`, `The tens stay the same: ${T(t)}.`];
      else hints = [`Add the ones: ${o} + ${b} = ${o + b}. That is 1 ten and ${O(o + b - 10)}.`, `The new ten joins the others: ${T(t)} + 1 ten = ${T(t + 1)}.`];
      hints.push(`${a} + ${b} = <b>${ans}</b>.`);
      return { prompt: `Add.${big(`${a} + ${b} = ?`)}`, type: 'number', answer: ans, hints, params: { a, b } };
    },
    verify(q) { let n = q.params.a; for (let i = 0; i < q.params.b; i++) n += 1; return n === q.answer; },
  });

  /* ---------- Unit 4: Measurement, time, and data ---------- */
  const RIBBONS = [['red', '#e5484d'], ['blue', '#3e7bfa'], ['green', '#30a46c'], ['orange', '#f08c00'], ['purple', '#8e4ec6']];
  function ribbons(list) {      // list of [colour name, hex, length in units]
    const body = list.map(([name, hex, len], i) =>
      `<text x="4" y="${24 + i * 34}" font-size="14">${name}</text><rect x="64" y="${10 + i * 34}" width="${len * 22}" height="18" rx="4" fill="${hex}"/>`).join('');
    return svg(320, list.length * 34 + 6, body, 'ribbons of different lengths');
  }

  A.skill({
    id: 'g1.order-lengths', title: 'Order by length',
    learn: p('To compare lengths, line things up at the <b>same starting point</b>. The one that sticks out farthest is the <b>longest</b>. The one that ends first is the <b>shortest</b>.') +
      p('Sometimes we cannot put things side by side. If the red string is longer than the blue string, and the blue string is longer than the green string, then <b>the red string is longer than the green string too</b>.') +
      example('Example', `Theo's pencil is longer than Uma's. Uma's pencil is longer than Kai's. Whose pencil is the shortest?<br>Kai's is shorter than Uma's, and Uma's is shorter than Theo's. So <b>Kai's</b> is the shortest.`),
    make(rng) {
      const kind = rng.pick(['picture', 'picture', 'order', 'chain']);
      const want = rng.pick(['longest', 'shortest']);
      if (kind === 'chain') {
        const [x, y, z] = rng.sample(NAMES, 3), thing = rng.pick(['rope', 'pencil', 'snake', 'scarf']);
        const ans = want === 'longest' ? x : z;      // x > y > z
        return { prompt: `${x}'s ${thing} is longer than ${y}'s. ${y}'s ${thing} is longer than ${z}'s.<br>Whose ${thing} is the <b>${want}</b>?`, type: 'choice', answer: `${ans}'s ${thing}`, choices: [x, y, z].map(n => `${n}'s ${thing}`), params: { kind, want, order: [x, y, z] },
          hints: [`Put them in order. ${x}'s is longer than ${y}'s, and ${y}'s is longer than ${z}'s.`, `From longest to shortest: ${x}, ${y}, ${z}.`, `The ${want} is <b>${ans}'s ${thing}</b>.`] };
      }
      const picked = rng.sample(RIBBONS, 3);
      const lens = rng.sample([3, 5, 7, 9, 11], 3);
      const list = picked.map((r, i) => [r[0], r[1], lens[i]]);
      const sorted = list.slice().sort((a, b) => a[2] - b[2]);
      if (kind === 'order') {
        const up = sorted.map(r => r[0]);
        const ans = up.join(', ');
        const choices = [ans, up.slice().reverse().join(', '), [up[1], up[0], up[2]].join(', '), [up[0], up[2], up[1]].join(', ')];
        return { prompt: `Put the ribbons in order from <b>shortest to longest</b>.${ribbons(list)}`, type: 'choice', answer: ans, choices, params: { kind, list },
          hints: ['All the ribbons start at the same place. Look at where each one ends.', `The ${up[0]} ribbon ends first, so it is the shortest. The ${up[2]} ribbon is the longest.`, `Shortest to longest: <b>${ans}</b>.`] };
      }
      const ans = (want === 'longest' ? sorted[2] : sorted[0])[0];
      return { prompt: `Which ribbon is the <b>${want}</b>?${ribbons(list)}`, type: 'choice', answer: `the ${ans} ribbon`, choices: list.map(r => `the ${r[0]} ribbon`), params: { kind, want, list },
        hints: ['All the ribbons start at the same place. Look at where each one ends.', want === 'longest' ? 'The longest ribbon goes the farthest to the right.' : 'The shortest ribbon stops first.', `The ${want} is <b>the ${ans} ribbon</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'chain') return q.answer.startsWith(p.want === 'longest' ? p.order[0] : p.order[2]);
      const lens = {};
      p.list.forEach(r => { lens[r[0]] = r[2]; });
      if (p.kind === 'order') { const names = q.answer.split(', '); return names.length === 3 && lens[names[0]] < lens[names[1]] && lens[names[1]] < lens[names[2]]; }
      const name = q.answer.split(' ')[1], all = Object.values(lens);
      return lens[name] === (p.want === 'longest' ? Math.max(...all) : Math.min(...all));
    },
  });

  const OBJECTS = ['pencil', 'crayon', 'paintbrush', 'caterpillar', 'spoon'];
  function measured(rows) {     // rows of [label, length]; each drawn as a bar with cubes underneath
    let body = '';
    rows.forEach(([label, len], i) => {
      const y = 8 + i * 74;
      body += `<text x="4" y="${y + 16}" font-size="14">${label}</text><rect x="4" y="${y + 24}" width="${len * 24}" height="14" rx="7" fill="#f0b429"/>`;
      for (let c = 0; c < len; c++) body += `<rect class="fill cube" x="${4 + c * 24}" y="${y + 42}" width="24" height="24"/>`;
    });
    return svg(Math.max(...rows.map(r => r[1])) * 24 + 12, rows.length * 74 + 6, body, 'things measured with cubes');
  }

  A.skill({
    id: 'g1.measure-lengths', title: 'Measure lengths with cubes',
    learn: p('We can measure how long something is by lining up cubes under it. The cubes must touch, with <b>no gaps and no overlaps</b>, from one end to the other.') +
      p('Then <b>count the cubes</b>. If 6 cubes fit under a pencil, the pencil is 6 cubes long. To see how much longer one thing is than another, subtract the two counts.') +
      example('Example', `A crayon is 4 cubes long. A pencil is 7 cubes long. How much longer is the pencil?<br>7 − 4 = <b>3</b>. The pencil is 3 cubes longer.`),
    make(rng) {
      const kind = rng.pick(['count', 'count', 'longer']);
      if (kind === 'count') {
        const name = rng.pick(OBJECTS), len = rng.int(2, 10);
        return { prompt: `How many cubes long is the ${name}?${measured([[name, len]])}`, type: 'number', answer: len, unit: 'cubes', params: { kind },
          hints: ['Count the cubes under it, one at a time, from left to right.', `There are ${len} cubes.`, `The ${name} is <b>${len}</b> cubes long.`] };
      }
      const [o1, o2] = rng.sample(OBJECTS, 2);
      const a = rng.int(5, 10), b = rng.int(2, a - 1);
      return { prompt: `How many cubes <b>longer</b> is the ${o1} than the ${o2}?${measured([[o1, a], [o2, b]])}`, type: 'number', answer: a - b, unit: 'cubes', params: { kind, a, b },
        hints: [`Count the cubes under each one. The ${o1} is ${a} cubes long. The ${o2} is ${b} cubes long.`, `Find the difference: ${a} − ${b}.`, `The ${o1} is <b>${a - b}</b> cubes longer.`] };
    },
    verify(q) {
      if (q.params.kind === 'count') return (q.prompt.match(/class="fill cube"/g) || []).length === q.answer;
      return q.answer + q.params.b === q.params.a;
    },
  });

  function clock(h, m) {
    const pt = (deg, r) => { const t = deg * Math.PI / 180; return [(100 + r * Math.sin(t)).toFixed(1), (100 - r * Math.cos(t)).toFixed(1)]; };
    let body = '<circle class="stroke" cx="100" cy="100" r="90" style="stroke-width:4"/>';
    for (let k = 1; k <= 12; k++) { const [x, y] = pt(k * 30, 72); body += `<text x="${x}" y="${(+y + 6).toFixed(1)}" font-size="17" text-anchor="middle" font-weight="700">${k}</text>`; }
    const [hx, hy] = pt((h % 12 + m / 60) * 30, 44), [mx, my] = pt(m * 6, 66);
    body += `<line class="stroke hour" x1="100" y1="100" x2="${hx}" y2="${hy}" style="stroke-width:7" stroke-linecap="round"/>`;
    body += `<line class="stroke minute" x1="100" y1="100" x2="${mx}" y2="${my}" style="stroke-width:4" stroke-linecap="round"/>`;
    body += '<circle cx="100" cy="100" r="5" fill="currentColor"/>';
    return svg(200, 200, body, 'a clock face');
  }
  const wrap12 = h => ((h - 1 + 12) % 12) + 1;
  const digital = (h, m) => `${h}:${m === 0 ? '00' : '30'}`;
  const spoken = (h, m) => m === 0 ? `${h} o'clock` : `half past ${h}`;

  A.skill({
    id: 'g1.tell-time', title: 'Tell time to the hour and half hour',
    learn: p('A clock has two hands. The <b>short hand</b> shows the hour. The <b>long hand</b> shows the minutes.') +
      p('When the long hand points straight up at the 12, it is <b>o\'clock</b>: the short hand tells you which hour. When the long hand points straight down at the 6, it is <b>half past</b>. Then the short hand is halfway between two numbers, and the hour is the <b>smaller number it has passed</b>.') +
      example('Example', `${clock(4, 30)}The long hand is on the 6, so it is half past. The short hand is between 4 and 5, so it is <b>4:30</b>, half past 4.`),
    make(rng) {
      const kind = rng.pick(['read', 'read', 'words', 'hour-hand']);
      const h = rng.int(1, 12), m = rng.pick([0, 30]);
      const next = wrap12(h + 1), prev = wrap12(h - 1);
      if (kind === 'hour-hand') {
        const ans = m === 0 ? `on the ${h}` : `between ${h} and ${next}`;
        const choices = m === 0 ? [ans, `on the ${next}`, `between ${h} and ${next}`, `between ${prev} and ${h}`] : [ans, `on the ${h}`, `on the ${next}`, `between ${prev} and ${h}`];
        return { prompt: `It is <b>${digital(h, m)}</b>. Where does the <b>short</b> hand point?`, type: 'choice', answer: ans, choices, params: { kind, h, m },
          hints: [m === 0 ? 'At o\'clock, the short hand points right at the hour.' : 'At half past, the short hand has moved halfway to the next number.', `<b>${ans[0].toUpperCase() + ans.slice(1)}</b>.`] };
      }
      const fmt = kind === 'words' ? spoken : digital;
      const ans = fmt(h, m);
      const choices = m === 0 ? [ans, fmt(h, 30), fmt(prev, 30), fmt(next, 0)] : [ans, fmt(next, 30), fmt(h, 0), fmt(next, 0)];
      return { prompt: `What time does the clock show?${clock(h, m)}`, type: 'choice', answer: ans, choices, params: { kind, h, m },
        hints: [m === 0 ? 'The long hand points to the 12, so it is o\'clock.' : 'The long hand points to the 6, so it is half past.',
          m === 0 ? `The short hand points to the ${h}.` : `The short hand is between ${h} and ${next}. It has passed the ${h}.`, `The time is <b>${ans}</b>.`] };
    },
    verify(q) {
      const { kind, h, m } = q.params;
      // read the time back from the hand angles, the way a child reads the clock
      const hourAngle = (h % 12) * 30 + m / 2, minuteAngle = m * 6;
      const hour = Math.floor(hourAngle / 30) || 12, mins = minuteAngle / 6;
      if (kind === 'hour-hand') return q.answer === (mins === 0 ? `on the ${hour}` : `between ${hour} and ${hour % 12 + 1}`);
      if (kind === 'words') return q.answer === (mins === 0 ? `${hour} o'clock` : `half past ${hour}`);
      return q.answer === `${hour}:${String(mins).padStart(2, '0')}`;
    },
  });

  const b_ = x => `<b>${x}</b>`;
  const GRAPHS = [
    { title: 'Favorite fruit', head: 'Fruit', items: [['apple'], ['banana'], ['grapes'], ['orange'], ['strawberry']],
      count: a => `How many children picked ${b_(a)}?`, more: (a, c) => `How many more children picked ${b_(a)} than ${b_(c)}?`, all: (a, c) => `How many children picked ${b_(a)} or ${b_(c)}?` },
    { title: 'Pets in our class', head: 'Pet', items: [['dogs'], ['cats'], ['fish'], ['birds'], ['bunnies']],
      count: a => `How many ${b_(a)} are there?`, more: (a, c) => `How many more ${b_(a)} are there than ${b_(c)}?`, all: (a, c) => `How many ${b_(a)} and ${b_(c)} are there in all?` },
    { title: 'Weather this month', head: 'Weather', items: [['sunny'], ['rainy'], ['cloudy'], ['snowy']],
      count: a => `How many days were ${b_(a)}?`, more: (a, c) => `How many more days were ${b_(a)} than ${b_(c)}?`, all: (a, c) => `How many days were ${b_(a)} or ${b_(c)}?` },
  ];
  function tally(n) {
    let body = '';
    for (let i = 0; i < n; i++) {
      const g = Math.floor(i / 5), k = i % 5, x0 = 6 + g * 46;
      body += k < 4 ? `<line class="stroke" x1="${x0 + k * 8}" y1="4" x2="${x0 + k * 8}" y2="30"/>` : `<line class="stroke" x1="${x0 - 4}" y1="26" x2="${x0 + 28}" y2="8"/>`;
    }
    return `<svg class="figure" viewBox="0 0 ${Math.ceil(n / 5) * 46 + 8} 34" width="${Math.ceil(n / 5) * 46 + 8}" style="margin:0" role="img" aria-label="${n} tally marks">${body}</svg>`;
  }

  A.skill({
    id: 'g1.read-graphs', title: 'Picture graphs and tally charts',
    learn: p('A <b>picture graph</b> uses one picture for each thing. Count the pictures in a row to see how many. A <b>tally chart</b> uses one line for each thing. Four lines with one line across them make a group of <b>5</b>.') +
      p('We can use a graph to answer questions. Which has the most? Count each row. How many more? Subtract the smaller row from the bigger one. How many in all? Add the rows.') +
      example('Example', `${M.table(['Pet', 'Number'], [['dog', pics(6, 'circle', 'red')], ['cat', pics(4, 'square', 'blue')]])}There are 6 dogs and 4 cats. How many more dogs than cats? 6 − 4 = <b>2</b>.`),
    make(rng) {
      const g = rng.pick(GRAPHS), style = rng.pick(['picture', 'tally']);
      const items = rng.sample(g.items, 3), counts = rng.sample([1, 2, 3, 4, 5, 6, 7, 8], 3);
      const rows = items.map(([name], i) => [name, style === 'picture' ? pics(counts[i], ...LOOKS[i]) : tally(counts[i])]);
      const graph = `<div><b>${g.title}</b></div>${M.table([g.head, style === 'picture' ? 'Number' : 'Tally'], rows)}`;
      const kind = rng.pick(['count', 'more', 'all', 'most']);
      let [i, j] = rng.sample([0, 1, 2], 2);
      const nm = k => items[k][0], counting = `Count each row: ${items.map((it, k) => `${it[0]} ${counts[k]}`).join(', ')}.`;
      if (kind === 'most') {
        const want = rng.pick(['most', 'fewest']);
        const best = counts.indexOf(want === 'most' ? Math.max(...counts) : Math.min(...counts));
        return { prompt: `${graph}Which row has the <b>${want}</b>?`, type: 'choice', answer: nm(best), choices: items.map(it => it[0]), params: { kind, want, counts, names: items.map(it => it[0]) },
          hints: [counting, `${want === 'most' ? 'The biggest' : 'The smallest'} number is ${counts[best]}.`, `<b>${nm(best)}</b> has the ${want}.`] };
      }
      let prompt, ans, hints;
      if (kind === 'count') { prompt = g.count(nm(i)); ans = counts[i]; hints = [`Find the ${nm(i)} row.`, `Count the ${style === 'picture' ? 'pictures' : 'tally marks'} in that row.`]; }
      else if (kind === 'more') { const [hi, lo] = counts[i] > counts[j] ? [i, j] : [j, i]; [i, j] = [hi, lo]; prompt = g.more(nm(hi), nm(lo)); ans = counts[hi] - counts[lo]; hints = [`${nm(hi)} has ${counts[hi]}. ${nm(lo)} has ${counts[lo]}.`, `Subtract: ${counts[hi]} − ${counts[lo]}.`]; }
      else { prompt = g.all(nm(i), nm(j)); ans = counts[i] + counts[j]; hints = [`${nm(i)} has ${counts[i]}. ${nm(j)} has ${counts[j]}.`, `Add: ${counts[i]} + ${counts[j]}.`]; }
      hints.push(`The answer is <b>${ans}</b>.`);
      return { prompt: graph + prompt, type: 'number', answer: ans, hints, params: { kind, i, j, counts } };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'most') { const order = p.names.map((n, k) => [p.counts[k], n]).sort((a, b) => a[0] - b[0]); return q.answer === (p.want === 'most' ? order[2][1] : order[0][1]); }
      if (p.kind === 'count') return q.answer === p.counts[p.i];
      if (p.kind === 'more') return q.answer + p.counts[p.j] === p.counts[p.i] && q.answer > 0;
      return [p.i, p.j].reduce((s, k) => s + p.counts[k], 0) === q.answer;
    },
  });

  /* ---------- Unit 5: Geometry ---------- */
  const SHAPES = { triangle: 3, square: 4, rectangle: 4, pentagon: 5, hexagon: 6, circle: 0 };
  function shapeSvg(name, turn) {
    let el;
    if (name === 'circle') el = '<circle class="fill" cx="80" cy="70" r="55"/>';
    else if (name === 'rectangle') el = `<rect class="fill" x="15" y="35" width="130" height="70" transform="rotate(${turn} 80 70)"/>`;
    else {
      const k = { triangle: 3, square: 4, pentagon: 5, hexagon: 6 }[name], start = (name === 'square' ? 45 : 0) + turn;
      const pts = [];
      for (let i = 0; i < k; i++) { const t = (start + i * 360 / k) * Math.PI / 180; pts.push(`${(80 + 60 * Math.sin(t)).toFixed(1)},${(74 - 60 * Math.cos(t)).toFixed(1)}`); }
      el = `<polygon class="fill" points="${pts.join(' ')}"/>`;
    }
    return svg(160, 140, el, 'a shape');
  }
  const DESCRIBE = {
    triangle: '3 sides and 3 corners', square: '4 sides that are all the same length', rectangle: '2 long sides and 2 short sides',
    pentagon: '5 sides and 5 corners', hexagon: '6 sides and 6 corners', circle: 'no sides and no corners',
  };

  A.skill({
    id: 'g1.shape-attributes', title: 'Shapes: sides and corners',
    learn: p('A shape gets its name from its <b>sides</b> (the straight edges) and its <b>corners</b> (where two sides meet). A triangle has 3 sides and 3 corners. A square and a rectangle have 4. A pentagon has 5, and a hexagon has 6. A circle has none.') +
      p('<b>Color and size do not change a shape\'s name.</b> A tiny red triangle and a huge blue triangle that is turned upside down are both triangles, because they both have 3 sides and 3 corners.') +
      example('Example', `${shapeSvg('hexagon', 0)}Count the straight sides: 1, 2, 3, 4, 5, 6. It has 6 sides and 6 corners, so it is a <b>hexagon</b>.`),
    make(rng) {
      const kind = rng.pick(['sides', 'corners', 'name', 'name', 'describe']);
      const name = rng.pick(Object.keys(SHAPES)), turn = rng.pick([0, 0, 15, 30, 180]);
      const n = SHAPES[name];
      if (kind === 'sides' || kind === 'corners') {
        return { prompt: `How many <b>${kind}</b> does this shape have?${shapeSvg(name, turn)}`, type: 'number', answer: n, params: { kind, name },
          hints: [kind === 'sides' ? 'A side is a straight edge. Put your finger on one and go around.' : 'A corner is where two sides meet. Touch each pointy spot.', name === 'circle' ? 'A circle is round. It has no straight sides and no corners.' : `This is a ${name}.`, `It has <b>${n}</b> ${kind}.`] };
      }
      const others = Object.keys(SHAPES).filter(s => s !== name && !(name === 'square' && s === 'rectangle'));
      const near = others.sort((a, b) => Math.abs(SHAPES[a] - n) - Math.abs(SHAPES[b] - n) || (a < b ? -1 : 1));
      const choices = [name].concat(near.slice(0, 3));
      if (kind === 'describe') {
        const color = rng.pick(['red', 'blue', 'green', 'yellow']), size = rng.pick(['big', 'small', 'tiny']);
        return { prompt: `${rng.pick(NAMES)} draws a ${size} ${color} shape. It has <b>${DESCRIBE[name]}</b>. What shape is it?`, type: 'choice', answer: name, choices, params: { kind, name },
          hints: ['The color and the size do not matter. Look at the sides and corners.', `A shape with ${DESCRIBE[name]} is a <b>${name}</b>.`] };
      }
      return { prompt: `What is the name of this shape?${shapeSvg(name, turn)}`, type: 'choice', answer: name, choices, params: { kind, name },
        hints: [name === 'circle' ? 'This shape is round, with no straight sides.' : 'Count the straight sides.', name === 'circle' ? 'A round shape is a circle.' : `It has ${n} sides${name === 'square' ? ', all the same length' : name === 'rectangle' ? ': 2 long and 2 short' : ''}.`, `It is a <b>${name}</b>.`] };
    },
    verify(q) {
      const { kind, name } = q.params;
      const pts = (q.prompt.match(/points="([^"]+)"/) || [])[1];
      const drawnSides = pts ? pts.trim().split(/\s+/).length : /<rect /.test(q.prompt) ? 4 : 0;
      if (kind === 'sides' || kind === 'corners') return q.answer === drawnSides;
      return q.answer === name && SHAPES[q.answer] === (kind === 'name' ? drawnSides : SHAPES[name]);
    },
  });

  function cutShape(shape, n, shaded, unequal) {   // a circle or rectangle cut into n equal parts, the first `shaded` filled
    const parts = [];
    const cls = i => (i < shaded ? 'fill' : 'stroke');
    if (shape === 'circle') {
      const cx = 80, cy = 70, r = 60;
      if (n === 2) { parts.push(`M${cx},${cy - r} A${r},${r} 0 0 1 ${cx},${cy + r} Z`, `M${cx},${cy + r} A${r},${r} 0 0 1 ${cx},${cy - r} Z`); }
      else { const P = [[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]]; for (let i = 0; i < 4; i++) { const a = P[i], b = P[(i + 1) % 4]; parts.push(`M${cx},${cy} L${a[0]},${a[1]} A${r},${r} 0 0 1 ${b[0]},${b[1]} Z`); } }
    } else {
      const x = 10, y = 25, w = 140, h = 90;
      if (n === 2) { const s = unequal ? 45 : 70; parts.push(`M${x},${y} h${s} v${h} h${-s} Z`, `M${x + s},${y} h${w - s} v${h} h${s - w} Z`); }
      else if (shape === 'strips') { for (let i = 0; i < 4; i++) parts.push(`M${x + i * 35},${y} h35 v${h} h-35 Z`); }
      else { for (let i = 0; i < 4; i++) parts.push(`M${x + (i % 2) * 70},${y + Math.floor(i / 2) * 45} h70 v45 h-70 Z`); }
    }
    return svg(160, 140, parts.map((d, i) => `<path class="${cls(i)}"${i < shaded ? ' style="fill:var(--primary);fill-opacity:.6"' : ''} d="${d}"/>`).join(''), `a shape cut into ${n} parts`);
  }
  const PART_WORDS = { '1/2': 'one half', '1/4': 'one fourth', '2/4': 'two fourths', '3/4': 'three fourths' };

  A.skill({
    id: 'g1.halves-fourths', title: 'Halves and fourths',
    learn: p('We can cut a shape into <b>equal parts</b>, parts that are all the same size. <b>2 equal parts are called halves.</b> Each part is one half. <b>4 equal parts are called fourths</b> (or quarters). Each part is one fourth.') +
      p('If the parts are not the same size, they are not halves or fourths. And the more parts you cut, the <b>smaller</b> each part gets: one fourth of a pizza is smaller than one half of the same pizza.') +
      example('Example', `${cutShape('circle', 4, 1)}The circle is cut into 4 equal parts. 1 part is shaded. That is <b>one fourth</b> of the circle.`),
    make(rng) {
      const kind = rng.pick(['shaded', 'shaded', 'shaded', 'equal', 'bigger', 'how-many']);
      if (kind === 'equal') {
        const unequal = rng.bool();
        const ans = unequal ? 'No. The 2 parts are not the same size.' : 'Yes. The 2 parts are the same size.';
        return { prompt: `Is this rectangle cut into <b>halves</b>?${cutShape('rect', 2, rng.int(0, 1), unequal)}`, type: 'choice', answer: ans, choices: ['Yes. The 2 parts are the same size.', 'No. The 2 parts are not the same size.', 'No. Halves need 4 parts.'], keepOrder: true, params: { kind },
          hints: ['Halves are 2 parts that are exactly the same size.', 'Look at the line. Is it right in the middle?', `<b>${ans}</b>`] };
      }
      if (kind === 'bigger' || kind === 'how-many') {
        const food = rng.pick(['pizza', 'sandwich', 'pie', 'cracker']);
        if (kind === 'how-many') {
          const n = rng.pick([2, 4]), word = n === 2 ? 'halves' : 'fourths';
          return { prompt: `A ${food} is cut into ${word}. How many ${word} make the whole ${food}?`, type: 'number', answer: n, params: { kind, word },
            hints: [`${word === 'halves' ? 'Halves' : 'Fourths'} are ${n === 2 ? 'two' : 'four'} equal parts.`, `So <b>${n}</b> ${word} make the whole ${food}.`] };
        }
        const [n1, n2] = rng.sample(NAMES, 2);
        return { prompt: `${n1} eats one half of a ${food}. ${n2} eats one fourth of the same size ${food}. Who eats <b>more</b>?`, type: 'choice', answer: n1, choices: [n1, n2, 'They eat the same'], keepOrder: true, params: { kind, n1, n2 },
          hints: ['A half is 1 of 2 equal parts. A fourth is 1 of 4 equal parts.', 'Cutting into more parts makes each part smaller, so a half is bigger than a fourth.', `<b>${n1}</b> eats more.`] };
      }
      const pick = rng.pick([['circle', 2, 1], ['rect', 2, 1], ['circle', 4, 1], ['grid', 4, 1], ['strips', 4, 1], ['circle', 4, 3], ['grid', 4, 3], ['strips', 4, 2], ['circle', 4, 2]]);
      const [shape, n, k] = pick;
      const ans = PART_WORDS[`${k}/${n}`];
      const choices = n === 2 ? [ans, 'one fourth', 'two halves'] : k === 1 ? [ans, 'one half', 'four fourths'] : k === 2 ? [ans, 'one fourth', 'four fourths'] : [ans, 'one fourth', 'three halves'];
      return { prompt: `What part of the shape is shaded?${cutShape(shape, n, k)}`, type: 'choice', answer: ans, choices, params: { kind },
        hints: [`Count the equal parts: ${n}. So the parts are ${n === 2 ? 'halves' : 'fourths'}.`, `Count the shaded parts: ${k}.`, `${k} of ${n} equal parts is <b>${ans}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'how-many') return q.answer === (p.word === 'halves' ? 2 : 4);
      if (p.kind === 'bigger') return q.answer === (1 / 2 > 1 / 4 ? p.n1 : p.n2);
      if (p.kind === 'equal') {   // measure the two widths from the drawing
        const w = (q.prompt.match(/h(\d+) v/g) || []).slice(0, 2).map(s => Number(s.slice(1, -2)));
        return q.answer.startsWith(w[0] === w[1] ? 'Yes' : 'No');
      }
      const shaded = (q.prompt.match(/class="fill"/g) || []).length, total = shaded + (q.prompt.match(/class="stroke"/g) || []).length;
      const words = ['zero', 'one', 'two', 'three', 'four'], denom = total === 2 ? 'half' : 'fourth';
      return q.answer === `${words[shaded]} ${denom}${shaded > 1 ? 's' : ''}`;
    },
  });
})();
