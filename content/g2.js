/* 2nd grade math. Adding and subtracting within 20, 100 and 1,000, place value, money and time,
   measuring length, picture and bar graphs, even and odd numbers, arrays, and fractions of shapes. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const N = M.n;
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = (s) => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  /** keep candidate distractors that differ from the answer and from each other */
  const distinct = (answer, cands, k) => {
    const out = [];
    cands.forEach(c => { if (c !== answer && !out.includes(c) && out.length < k) out.push(c); });
    return out;
  };

  A.course({
    id: 'math-2', title: '2nd grade math', subject: 'Elementary', grade: 2, icon: '2', hue: 25,
    blurb: 'Adding and subtracting up to 1,000, place value, money and time, measuring length, graphs, even and odd numbers, arrays, and halves, thirds and fourths.',
    units: [
      { id: 'within-20', title: 'Add and subtract within 20', blurb: 'Fast facts to 20, and even and odd numbers.', skills: ['g2.add-sub-20', 'g2.even-odd'] },
      { id: 'place-value', title: 'Place value', blurb: 'Hundreds, tens and ones, expanded form, and comparing numbers.', skills: ['g2.place-value', 'g2.expanded-form', 'g2.compare-numbers'] },
      { id: 'within-100', title: 'Add and subtract within 100', blurb: 'Two-digit numbers, with and without regrouping, and word problems.', skills: ['g2.add-sub-100', 'g2.word-problems-100'] },
      { id: 'within-1000', title: 'Add and subtract within 1,000', blurb: 'Three-digit numbers, adding 10 or 100, and skip counting.', skills: ['g2.add-sub-1000', 'g2.skip-count'] },
      { id: 'money-time', title: 'Money and time', blurb: 'Counting coins and bills, and telling time to 5 minutes.', skills: ['g2.count-money', 'g2.tell-time'] },
      { id: 'measurement', title: 'Measurement', blurb: 'Measuring with a ruler, and length word problems.', skills: ['g2.measure-length', 'g2.length-word-problems'] },
      { id: 'data', title: 'Data', blurb: 'Reading picture graphs and bar graphs.', skills: ['g2.picture-graphs', 'g2.bar-graphs'] },
      { id: 'geometry', title: 'Geometry', blurb: 'Halves, thirds and fourths of shapes, and rows and columns.', skills: ['g2.fraction-shapes', 'g2.arrays'] },
    ],
  });

  /* ---------- Unit 1: Add and subtract within 20 ---------- */
  A.skill({
    id: 'g2.add-sub-20', title: 'Add and subtract within 20',
    learn: p('You can add and subtract small numbers quickly with a few strategies. One useful strategy is to <b>make a ten</b>, because adding to 10 is simple.') +
      p('To add 8 + 5, take 2 from the 5 to fill up the 8. Now you have 10 + 3, which is 13.') +
      p('To subtract, <b>think of the addition fact</b>. For 14 − 6, ask: 6 plus what makes 14? 6 + 8 = 14, so 14 − 6 = 8.') +
      example('Example', `${big('9 + 6 = ?')}Take 1 from the 6 to make 9 into 10. Now it is 10 + 5 = <b>15</b>.`),
    make(rng) {
      const kind = rng.pick(['add', 'add', 'sub', 'sub', 'missing']);
      if (kind === 'add') {
        const a = rng.int(2, 10), b = rng.int(2, Math.min(10, 20 - a)), ans = a + b;
        const big1 = Math.max(a, b), small = Math.min(a, b), need = 10 - big1;
        const hints = ans > 10 && big1 < 10
          ? [`Make a ten. ${big1} needs ${need} more to make 10.`, `Take ${need} from the ${small}. That leaves ${small - need}.`, `10 + ${small - need} = ${ans}. So ${a} + ${b} = <b>${ans}</b>.`]
          : [`Start at ${big1} and count up ${small}.`, `${a} + ${b} = <b>${ans}</b>.`];
        return { prompt: `Add.${big(`${a} + ${b} = ?`)}`, type: 'number', answer: ans, hints, params: { kind, a, b } };
      }
      if (kind === 'sub') {
        const c = rng.int(6, 20), b = rng.int(2, Math.min(10, c - 1)), ans = c - b;
        return { prompt: `Subtract.${big(`${c} − ${b} = ?`)}`, type: 'number', answer: ans, params: { kind, c, b },
          hints: [`Think of adding: ${b} + ? = ${c}.`, c > 10 && b < c - 10 ? `Count up from ${b} to ${c}.` : `Count back ${b} from ${c}.`, `${b} + ${ans} = ${c}, so ${c} − ${b} = <b>${ans}</b>.`] };
      }
      const a = rng.int(2, 10), ans = rng.int(2, Math.min(10, 20 - a)), c = a + ans;
      return { prompt: `What number goes in the box?${big(`${a} + ☐ = ${c}`)}`, type: 'number', answer: ans, params: { kind, a, c },
        hints: [`You need to find how many more ${a} needs to get to ${c}.`, `That is the same as ${c} − ${a}.`, `${a} + ${ans} = ${c}, so the box is <b>${ans}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'add') { let x = p.a; for (let i = 0; i < p.b; i++) x++; return q.answer === x; }
      if (p.kind === 'sub') return q.answer + p.b === p.c;
      for (let x = 0; x <= 20; x++) if (p.a + x === p.c) return q.answer === x;
      return false;
    },
  });

  A.skill({
    id: 'g2.even-odd', title: 'Even and odd numbers',
    learn: p('A number is <b>even</b> if you can put the things into pairs with none left over. A number is <b>odd</b> if one is left over.') +
      p('Here is a quick way to tell: <b>look at the ones digit</b>. If it is 0, 2, 4, 6 or 8, the number is even. If it is 1, 3, 5, 7 or 9, the number is odd.') +
      p('An even number is also two equal numbers added together, like 6 = 3 + 3.') +
      example('Example', `Is 7 even or odd? ${M.items(7, 'circle', 'red', { per: 2, label: '7 red circles in pairs: 3 pairs and 1 left over' })}Make pairs: 3 pairs and 1 left over. So 7 is <b>odd</b>.`),
    make(rng) {
      const kind = rng.pick(['even', 'odd', 'double']);
      if (kind === 'double') {
        const h = rng.int(2, 10), n = 2 * h;
        const answer = `${h} + ${h}`;
        const choices = [answer, `${h - 1} + ${h + 1}`, `${h + 1} + ${h + 1}`, `${h - 1} + ${h - 1}`];
        return { prompt: `${n} is even. Which shows ${n} as two <b>equal</b> numbers added together?`, type: 'choice', answer, choices, params: { kind, n },
          hints: ['Equal numbers are the same. Both numbers must match.', `Which pair of the same number adds to ${n}? Try half of ${n}.`, `${h} + ${h} = ${n}, so the answer is <b>${answer}</b>.`] };
      }
      const want = kind === 'even' ? 0 : 1;
      const right = [], wrong = [];
      for (let x = 1; x <= 20; x++) (x % 2 === want ? right : wrong).push(x);
      const ans = rng.pick(right), others = rng.sample(wrong, 3);
      const choices = [ans].concat(others).sort((x, y) => x - y).map(String);
      return { prompt: `Which number is <b>${kind}</b>?`, type: 'choice', answer: String(ans), choices, keepOrder: true, params: { kind, ans, others },
        hints: [`Look at the ones digit of each number.`, kind === 'even' ? 'Even numbers end in 0, 2, 4, 6 or 8.' : 'Odd numbers end in 1, 3, 5, 7 or 9.', `${ans} is ${kind}, so the answer is <b>${ans}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'double') { const [x, y] = q.answer.split('+').map(Number); return x === y && x + y === p.n; }
      const pairsLeft = n => { let left = n; while (left >= 2) left -= 2; return left; };
      const want = p.kind === 'even' ? 0 : 1;
      return pairsLeft(Number(q.answer)) === want && p.others.every(o => pairsLeft(o) !== want);
    },
  });

  /* ---------- Unit 2: Place value ---------- */
  const PLACES = ['hundreds', 'tens', 'ones'];
  A.skill({
    id: 'g2.place-value', title: 'Hundreds, tens, and ones',
    learn: p('A three-digit number has three places. From left to right they are the <b>hundreds</b>, the <b>tens</b> and the <b>ones</b>.') +
      p('Each digit tells how many of that place. In 352 there are 3 hundreds, 5 tens and 2 ones. So the 3 is worth 300, the 5 is worth 50, and the 2 is worth 2.') +
      example('Example', `${big('4 hundreds, 0 tens, 6 ones')}Write a 4 in the hundreds place, a 0 in the tens place and a 6 in the ones place: <b>406</b>.`),
    make(rng) {
      const kind = rng.pick(['value', 'digit', 'build', 'build']);
      const h = rng.int(1, 9), t = rng.int(0, 9), o = rng.int(0, 9), n = 100 * h + 10 * t + o;
      const d = [h, t, o];
      if (kind === 'build') {
        let parts = [[h, 'hundreds'], [t, 'tens'], [o, 'ones']];
        if (rng.chance(0.3)) parts = rng.shuffle(parts);
        const txt = M.list(parts.map(([k, w]) => `${k} ${k === 1 ? w.slice(0, -1) : w}`));
        return { prompt: `What number is this?${big(txt)}`, type: 'number', answer: n, params: { kind, h, t, o },
          hints: [`Put each digit in its place: hundreds, then tens, then ones.`, `Hundreds: ${h}. Tens: ${t}. Ones: ${o}.`, `The number is <b>${n}</b>.`] };
      }
      const ok = [0, 1, 2].filter(i => d[i] !== 0 && d.indexOf(d[i]) === d.lastIndexOf(d[i]));
      const i = ok.length ? rng.pick(ok) : 0;
      if (kind === 'digit' || !ok.length) {
        return { prompt: `What digit is in the <b>${PLACES[i]}</b> place?${big(N(n))}`, type: 'number', answer: d[i], params: { kind: 'digit', n, i },
          hints: [`The places are hundreds, tens, ones, from left to right.`, `The ${PLACES[i]} place is digit number ${i + 1} from the left.`, `In ${n}, the ${PLACES[i]} digit is <b>${d[i]}</b>.`] };
      }
      const val = d[i] * [100, 10, 1][i];
      return { prompt: `What is the value of the <b>${d[i]}</b> in ${n}?`, type: 'number', answer: val, params: { kind, n, i },
        hints: [`Find which place the ${d[i]} is in. It is in the ${PLACES[i]} place.`, i === 2 ? `${d[i]} ones is just ${d[i]}.` : `${d[i]} ${PLACES[i]} is ${d[i]} × ${[100, 10][i]}.`, `The ${d[i]} is worth <b>${val}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'build') return q.answer === Number(`${p.h}${p.t}${p.o}`);
      const s = String(p.n), digit = Number(s[p.i]);
      if (p.kind === 'digit') return q.answer === digit;
      return q.answer === Number(s[p.i] + '00'.slice(0, 2 - p.i));
    },
  });

  const expanded = (h, t, o) => [100 * h, 10 * t, o].filter(x => x).join(' + ');
  A.skill({
    id: 'g2.expanded-form', title: 'Expanded form',
    learn: p('<b>Expanded form</b> writes a number as the sum of what each digit is worth. It shows the hundreds, tens and ones as separate numbers.') +
      p('For 352, the 3 is worth 300, the 5 is worth 50, and the 2 is worth 2. So 352 = 300 + 50 + 2.') +
      p('If a digit is 0, you can leave it out: 607 = 600 + 7.') +
      example('Example', `${big('400 + 30 + 8')}4 hundreds, 3 tens and 8 ones make <b>438</b>.`),
    make(rng) {
      const kind = rng.pick(['to', 'to', 'from']);
      const h = rng.int(1, 9), t = rng.chance(0.2) ? 0 : rng.int(1, 9), o = (t === 0 || rng.chance(0.85)) ? rng.int(1, 9) : 0;
      const n = 100 * h + 10 * t + o;
      if (kind === 'from') {
        let parts = [100 * h, 10 * t, o].filter(x => x);
        if (rng.chance(0.3)) parts = rng.shuffle(parts);
        return { prompt: `What number is this?${big(`${parts.join(' + ')} = ?`)}`, type: 'number', answer: n, params: { kind, parts },
          hints: [`Find the hundreds, the tens and the ones.`, `${h} hundreds, ${t} tens and ${o} ones.`, `${parts.join(' + ')} = <b>${n}</b>.`] };
      }
      const answer = expanded(h, t, o);
      const cands = [
        [100 * h, 10 * o, t].filter(x => x).join(' + '),          // tens and ones swapped
        [h, t, o].join(' + '),                                    // digits only
        [100 * h, t, o].filter(x => x).join(' + '),               // tens left as ones
        [10 * h, t, o].filter(x => x).join(' + '),                // every place one too small
        [100 * h, 10 * t, 10 * o].filter(x => x).join(' + '),
        [100 * h, 100 * t, o].filter(x => x).join(' + '),
      ];
      const choices = [answer].concat(distinct(answer, cands.filter(c => c.split(' + ').map(Number).reduce((s, x) => s + x, 0) !== n), 3));
      return { prompt: `Which is ${n} in expanded form?`, type: 'choice', answer, choices, params: { kind, n },
        hints: [`Find what each digit is worth.`, `The ${h} is worth ${100 * h}${t ? `, the ${t} is worth ${10 * t}` : ', there are no tens'}${o ? `, and the ${o} is worth ${o}` : ', and there are no ones'}.`, `${n} = <b>${answer}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'from') { let s = 0; p.parts.forEach(x => { s += x; }); return q.answer === s; }
      const parts = q.answer.split(' + ').map(Number);
      const digits = String(p.n).split('').map(Number);
      return parts.reduce((s, x) => s + x, 0) === p.n && parts.every(x => /^[1-9]0*$/.test(String(x))) && parts.length === digits.filter(x => x).length;
    },
  });

  A.skill({
    id: 'g2.compare-numbers', title: 'Comparing three-digit numbers',
    learn: p('To compare two numbers, <b>start with the biggest place</b>. Look at the hundreds first. The number with more hundreds is bigger.') +
      p('If the hundreds are the same, look at the tens. If the tens are the same too, look at the ones.') +
      p('The sign &gt; means "is greater than" and &lt; means "is less than." The open side faces the bigger number.') +
      example('Example', `${big('352 ☐ 325')}Both have 3 hundreds. 352 has 5 tens and 325 has 2 tens. 5 tens is more, so <b>352 &gt; 325</b>.`),
    make(rng) {
      const kind = rng.pick(['swap', 'tens', 'hundreds', 'expanded']);
      let a = rng.int(100, 999), b;
      const [h, t, o] = String(a).split('').map(Number);
      if (kind === 'swap') { b = t === o ? 100 * h + 10 * o + ((o + 3) % 10) : 100 * h + 10 * o + t; }
      else if (kind === 'tens') { b = 100 * h + 10 * ((t + rng.int(1, 9)) % 10) + rng.int(0, 9); }
      else if (kind === 'hundreds') { b = 100 * ((h % 9) + 1) + 10 * rng.int(0, 9) + rng.int(0, 9); if (rng.bool()) [a, b] = [b, a]; }
      else b = rng.chance(0.4) ? a : a + rng.pick([-10, 10, -1, 1, 100, -100].filter(x => a + x >= 100 && a + x <= 999));
      if (b === a && kind !== 'expanded') b = a === 999 ? 998 : a + 1;
      const showA = kind === 'expanded' ? expanded(...String(a).split('').map(Number)) : N(a);
      const sign = a > b ? '&gt;' : a < b ? '&lt;' : '=';
      const choices = ['&gt;', '&lt;', '='].map(s => `${showA} ${s} ${N(b)}`);
      const answer = `${showA} ${sign} ${N(b)}`;
      const [bh, bt] = String(b).split('').map(Number);
      const place = h !== bh ? 'hundreds' : t !== bt ? 'tens' : 'ones';
      const hints = [kind === 'expanded' && showA !== N(a) ? `First write ${showA} as one number: ${a}.` : 'Compare the hundreds first.',
        a === b ? `${a} and ${b} have the same hundreds, tens and ones.` : `The first place that is different is the ${place} place.`,
        a === b ? `They are equal: <b>${answer}</b>.` : `${Math.max(a, b)} is bigger, so <b>${answer}</b>.`];
      return { prompt: `Which sign makes this true?${big(`${showA} ☐ ${N(b)}`)}`, type: 'choice', answer, choices, keepOrder: true, hints, params: { a, b } };
    },
    verify(q) {
      const { a, b } = q.params, sa = String(a), sb = String(b);
      const s = sa === sb ? '=' : sa > sb ? '&gt;' : '&lt;';      // same length, so string order is number order
      return q.answer.split(' ').includes(s);
    },
  });

  /* ---------- Unit 3: Add and subtract within 100 ---------- */
  /** hints for a column add or subtract of two numbers, place by place */
  function columnHints(a, b, op) {
    const ao = a % 10, bo = b % 10, at = Math.floor(a / 10) % 10, bt = Math.floor(b / 10) % 10;
    const ah = Math.floor(a / 100), bh = Math.floor(b / 100), three = a >= 100 || b >= 100;
    const ans = op === '+' ? a + b : a - b;
    const hints = [];
    if (op === '+') {
      const ones = ao + bo, c1 = ones >= 10 ? 1 : 0, tens = at + bt + c1, c2 = tens >= 10 ? 1 : 0;
      hints.push(`Add the ones first: ${ao} + ${bo} = ${ones}.${c1 ? ` That is 1 ten and ${ones - 10} ones. Write ${ones - 10} and carry the 1 ten.` : ''}`);
      hints.push(`Tens: ${at} + ${bt}${c1 ? ' + 1' : ''} = ${tens}.${three && c2 ? ` That is 1 hundred and ${tens - 10} tens. Write ${tens - 10} and carry the 1 hundred.` : ''}`);
      if (three) hints.push(`Hundreds: ${ah} + ${bh}${c2 ? ' + 1' : ''} = ${ah + bh + c2}.`);
    } else {
      const b1 = ao < bo ? 1 : 0, tensLeft = at - b1, b2 = tensLeft < bt ? 1 : 0;
      hints.push(`${b1 ? `You cannot take ${bo} ones from ${ao} ones. Trade 1 ten for 10 ones. ` : ''}Ones: ${ao + 10 * b1} − ${bo} = ${ao + 10 * b1 - bo}.`);
      hints.push(`${b2 ? `Now there are ${tensLeft} tens, not enough to take ${bt}. Trade 1 hundred for 10 tens. ` : ''}Tens: ${tensLeft + 10 * b2} − ${bt} = ${tensLeft + 10 * b2 - bt}.`);
      if (three) hints.push(`Hundreds: ${ah - b2} − ${bh} = ${ah - b2 - bh}.`);
    }
    hints.push(`${a} ${op === '+' ? '+' : '−'} ${b} = <b>${ans}</b>.`);
    return hints;
  }
  /** two numbers in [lo, hi] whose ones digits do (or do not) need regrouping */
  function pairFor(rng, op, regroup, lo, hi, maxSum) {
    for (let tries = 0; tries < 200; tries++) {
      let a = rng.int(lo, hi), b = rng.int(lo, hi);
      if (op === '−' && a < b) [a, b] = [b, a];
      if (op === '+' && a + b > maxSum) continue;
      if (op === '−' && a === b) continue;
      const needs = op === '+' ? a % 10 + b % 10 >= 10 : a % 10 < b % 10;
      if (needs === regroup) return [a, b];
    }
    return op === '+' ? [lo + 1, lo + 2] : [lo + 9, lo + 1];
  }

  A.skill({
    id: 'g2.add-sub-100', title: 'Add and subtract within 100',
    learn: p('Line up the numbers so the tens are over the tens and the ones are over the ones. <b>Work on the ones first</b>, then the tens.') +
      p('When adding, if the ones make 10 or more, trade 10 ones for 1 ten. This is called <b>regrouping</b>. When subtracting, if there are not enough ones, trade 1 ten for 10 ones.') +
      example('Example', `${big('47 + 36')}Ones: 7 + 6 = 13. That is 1 ten and 3 ones. Tens: 4 + 3 + 1 = 8. So 47 + 36 = <b>83</b>.`),
    make(rng) {
      const op = rng.pick(['+', '−']), regroup = rng.chance(0.6);
      const [a, b] = pairFor(rng, op, regroup, 10, 99, 100);
      const ans = op === '+' ? a + b : a - b;
      return { prompt: `${op === '+' ? 'Add' : 'Subtract'}.${big(`${a} ${op} ${b} = ?`)}`, type: 'number', answer: ans, hints: columnHints(a, b, op), params: { a, b, op } };
    },
    verify(q) { const { a, b, op } = q.params; return op === '+' ? q.answer - b === a : q.answer + b === a; },
  });

  const THINGS = ['stickers', 'marbles', 'shells', 'beads', 'cards', 'stamps', 'blocks', 'buttons'];
  A.skill({
    id: 'g2.word-problems-100', title: 'Addition and subtraction word problems within 100',
    learn: p('Read the story and ask: <b>are things being put together, or taken away?</b>') +
      p('Putting together or getting more means add. Taking away, giving away, or finding how many more one has than another means subtract.') +
      p('Write a number sentence, solve it, and check that the answer makes sense.') +
      example('Example', `Ana has 52 shells. She gives 18 to her brother. How many shells does she have left? She gives some away, so subtract: 52 − 18 = <b>34</b> shells.`),
    make(rng) {
      const kind = rng.pick(['join', 'take', 'compare', 'need']);
      const [x, y] = rng.sample(NAMES, 2), thing = rng.pick(THINGS);
      if (kind === 'join') {
        const [a, b] = pairFor(rng, '+', rng.bool(), 11, 79, 99);
        return { prompt: `${x} has ${a} ${thing}. ${x} gets ${b} more. How many ${thing} does ${x} have now?`, type: 'number', answer: a + b, params: { kind, a, b },
          hints: [`${x} gets more, so add.`, `${a} + ${b} = ?`].concat(columnHints(a, b, '+').slice(-1)) };
      }
      const [big1, small] = pairFor(rng, '−', rng.bool(), 11, 99, 100);
      if (kind === 'take') {
        return { prompt: `${x} has ${big1} ${thing}. ${x} gives ${small} to ${y}. How many ${thing} does ${x} have left?`, type: 'number', answer: big1 - small, params: { kind, a: big1, b: small },
          hints: [`${x} gives some away, so subtract.`, `${big1} − ${small} = ?`, `${big1} − ${small} = <b>${big1 - small}</b>.`] };
      }
      if (kind === 'compare') {
        return { prompt: `${x} has ${small} ${thing}. ${y} has ${big1} ${thing}. How many more ${thing} does ${y} have than ${x}?`, type: 'number', answer: big1 - small, params: { kind, a: big1, b: small },
          hints: [`"How many more" means find the difference. Subtract the smaller number from the bigger one.`, `${big1} − ${small} = ?`, `${y} has <b>${big1 - small}</b> more.`] };
      }
      return { prompt: `${x} wants ${big1} ${thing}. ${x} has ${small} now. How many more ${thing} does ${x} need?`, type: 'number', answer: big1 - small, params: { kind, a: big1, b: small },
        hints: [`Think: ${small} + ? = ${big1}.`, `You can find the missing number by subtracting: ${big1} − ${small}.`, `${x} needs <b>${big1 - small}</b> more.`] };
    },
    verify(q) { const { kind, a, b } = q.params; return kind === 'join' ? q.answer - b === a : q.answer + b === a; },
  });

  /* ---------- Unit 4: Add and subtract within 1,000 ---------- */
  A.skill({
    id: 'g2.add-sub-1000', title: 'Add and subtract within 1,000',
    learn: p('Big numbers work just like two-digit numbers. Line up the places, then <b>add or subtract the ones, then the tens, then the hundreds</b>. Regroup when you need to.') +
      p('Adding or taking away 10 or 100 is simpler: only one digit changes. 10 more than 352 is 362. 100 less than 352 is 252.') +
      example('Example', `${big('365 + 248')}Ones: 5 + 8 = 13, write 3 and carry 1. Tens: 6 + 4 + 1 = 11, write 1 and carry 1. Hundreds: 3 + 2 + 1 = 6. The answer is <b>613</b>.`),
    make(rng) {
      const kind = rng.pick(['add', 'sub', 'tens']);
      if (kind === 'tens') {
        const step = rng.pick([10, 100]), more = rng.bool();
        let n = rng.int(110, 889);
        if (step === 10 && Math.floor(n / 10) % 10 === (more ? 9 : 0)) n += more ? -20 : 20;   // keep it to one digit changing
        const ans = more ? n + step : n - step;
        return { prompt: `What is ${step} ${more ? 'more' : 'less'} than ${n}?`, type: 'number', answer: ans, params: { kind, n, step, more },
          hints: [`${more ? 'Adding' : 'Taking away'} ${step} changes only the ${step === 10 ? 'tens' : 'hundreds'} digit.`, `The ${step === 10 ? 'tens' : 'hundreds'} digit goes ${more ? 'up' : 'down'} by 1.`, `${n} ${more ? '+' : '−'} ${step} = <b>${ans}</b>.`] };
      }
      const op = kind === 'add' ? '+' : '−';
      const [a, b] = pairFor(rng, op, rng.chance(0.6), 100, 899, 1000);
      const ans = op === '+' ? a + b : a - b;
      return { prompt: `${op === '+' ? 'Add' : 'Subtract'}.${big(`${a} ${op} ${b} = ?`)}`, type: 'number', answer: ans, hints: columnHints(a, b, op), params: { kind, a, b } };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'tens') return Math.abs(q.answer - p.n) === p.step && (q.answer > p.n) === p.more;
      return p.kind === 'add' ? q.answer - p.b === p.a : q.answer + p.b === p.a;
    },
  });

  A.skill({
    id: 'g2.skip-count', title: 'Skip counting by 5s, 10s, and 100s',
    learn: p('<b>Skip counting</b> means you jump by the same amount each time instead of counting by ones.') +
      p('Counting by 5s ends in 5 or 0: 5, 10, 15, 20. Counting by 10s makes the tens digit go up by one: 30, 40, 50. Counting by 100s makes the hundreds digit go up: 200, 300, 400.') +
      p('To fill a blank, find the jump between two numbers next to each other, then use it.') +
      example('Example', `${big('45, 50, 55, __, 65')}Each jump is 5. After 55 comes 55 + 5 = <b>60</b>.`),
    make(rng) {
      const step = rng.pick([5, 10, 10, 100]);
      let start;
      if (step === 5) start = 5 * rng.int(1, 30);
      else if (step === 10) start = rng.chance(0.5) ? 10 * rng.int(1, 60) : rng.int(11, 600);
      else start = rng.chance(0.6) ? 100 * rng.int(1, 5) : 10 * rng.int(11, 49);
      const pos = rng.int(1, 4);
      const seq = [0, 1, 2, 3, 4].map(i => start + step * i);
      const shown = seq.map((x, i) => i === pos ? '__' : N(x));
      const ans = seq[pos];
      return { prompt: `Skip count by ${step}s. What number goes in the blank?${big(shown.join(', '))}`, type: 'number', answer: ans, params: { seq: seq.map((x, i) => i === pos ? null : x), pos, step },
        hints: [`Find the jump: ${seq[pos === 1 ? 2 : 0]} to ${seq[pos === 1 ? 3 : 1]} is a jump of ${step}.`, `Add ${step} to the number before the blank: ${seq[pos - 1]} + ${step}.`, `The missing number is <b>${ans}</b>.`] };
    },
    verify(q) {
      const { seq, pos } = q.params;
      const last = seq.length - 1 - seq.slice().reverse().findIndex(x => x !== null);
      const jump = (seq[last] - seq[0]) / last;
      return q.answer === seq[0] + jump * pos;
    },
  });

  /* ---------- Unit 5: Money and time ---------- */
  const COINS = [['quarter', 'quarters', 25], ['dime', 'dimes', 10], ['nickel', 'nickels', 5], ['penny', 'pennies', 1]];
  const BILLS = [['twenty-dollar bill', 'twenty-dollar bills', 20], ['ten-dollar bill', 'ten-dollar bills', 10], ['five-dollar bill', 'five-dollar bills', 5], ['one-dollar bill', 'one-dollar bills', 1]];
  A.skill({
    id: 'g2.count-money', title: 'Counting money',
    learn: p('Each coin has a value. A <b>penny is 1 cent</b>, a <b>nickel is 5 cents</b>, a <b>dime is 10 cents</b>, and a <b>quarter is 25 cents</b>. Bills are worth dollars: 1, 5, 10 or 20 dollars.') +
      p('To count money, <b>start with the biggest coins or bills</b> and count on. Count quarters by 25s, dimes by 10s, nickels by 5s and pennies by 1s.') +
      example('Example', `2 quarters, 1 dime and 3 pennies. Count on: 25, 50, then 60, then 61, 62, 63. That is <b>63 cents</b>.`),
    make(rng) {
      const who = rng.pick(NAMES);
      const bills = rng.chance(0.3);
      const set = bills ? BILLS : COINS;
      let counts;
      do { counts = set.map(() => rng.chance(0.75) ? rng.int(1, set === COINS ? 4 : 3) : 0); }
      while (counts.filter(c => c).length < 2 || (!bills && counts.reduce((s, c, i) => s + c * set[i][2], 0) > 99));
      const total = counts.reduce((s, c, i) => s + c * set[i][2], 0);
      const parts = set.map((c, i) => counts[i] ? `${counts[i]} ${counts[i] === 1 ? c[0] : c[1]}` : null).filter(Boolean);
      const unit = bills ? 'dollars' : 'cents';
      const steps = [];
      let run = 0;
      set.forEach((c, i) => { for (let k = 0; k < counts[i]; k++) { run += c[2]; steps.push(run); } });
      const firstKind = set.findIndex((c, i) => counts[i]);
      return { prompt: `${who} has ${M.list(parts)}. How many ${unit} does ${who} have?`, type: 'number', answer: total, unit, params: { bills, counts },
        hints: [`Start with the ${set[firstKind][1]}. ${bills ? `Each one is ${set[firstKind][2]} dollars` : `Each ${set[firstKind][0]} is ${set[firstKind][2]} cents`}.`,
          `Count on as you add each ${bills ? 'bill' : 'coin'}: ${steps.join(', ')}.`, `${who} has <b>${total} ${unit}</b>.`] };
    },
    verify(q) {
      const { bills, counts } = q.params;
      const worth = bills ? { 0: 20, 1: 10, 2: 5, 3: 1 } : { 0: 25, 1: 10, 2: 5, 3: 1 };
      let pennies = 0;
      counts.forEach((c, i) => { for (let k = 0; k < c * worth[i]; k++) pennies++; });
      return q.answer === pennies;
    },
  });

  /** an analog clock face showing h:m */
  function clock(h, m) {
    const cx = 100, cy = 100, rad = d => (d - 90) * Math.PI / 180;
    const at = (deg, r) => [M.round(cx + r * Math.cos(rad(deg)), 2), M.round(cy + r * Math.sin(rad(deg)), 2)];
    let s = `<svg class="figure" viewBox="0 0 200 200" width="200" height="200" role="img" aria-label="clock"><circle class="stroke" cx="100" cy="100" r="92"/>`;
    for (let i = 0; i < 60; i++) { const [x1, y1] = at(i * 6, 92), [x2, y2] = at(i * 6, i % 5 ? 87 : 82); s += `<line class="stroke" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke-width:${i % 5 ? 1 : 2}"/>`; }
    for (let i = 1; i <= 12; i++) { const [x, y] = at(i * 30, 71); s += `<text x="${x}" y="${M.round(y + 6, 2)}" text-anchor="middle" font-size="17">${i}</text>`; }
    const [hx, hy] = at((h % 12) * 30 + m / 2, 40), [mx, my] = at(m * 6, 60);
    s += `<line class="stroke" x1="100" y1="100" x2="${hx}" y2="${hy}" style="stroke-width:6;stroke-linecap:round"/>`;
    s += `<line class="stroke" x1="100" y1="100" x2="${mx}" y2="${my}" style="stroke-width:3;stroke-linecap:round"/>`;
    return s + '<circle cx="100" cy="100" r="5" style="fill:var(--ink)"/></svg>';
  }
  const hm = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
  A.skill({
    id: 'g2.tell-time', title: 'Telling time to the nearest 5 minutes',
    learn: p('A clock has two hands. The <b>short hand shows the hour</b>. The <b>long hand shows the minutes</b>.') +
      p('For the minutes, <b>count by 5s</b> from the 12 to the long hand. The 1 means 5 minutes, the 2 means 10 minutes, the 3 means 15 minutes, and so on.') +
      p('For the hour, use the last number the short hand has passed. If it is between 4 and 5, the hour is still 4.') +
      example('Example', `The short hand is between 3 and 4. The long hand points at the 5. Count by 5s: 5, 10, 15, 20, 25. The time is <b>3:25</b>.`),
    make(rng) {
      const h = rng.int(1, 12), m = 5 * rng.int(0, 11);
      const answer = hm(h, m);
      const num = m / 5 || 12;
      const cands = [hm(h, num === 12 ? 12 : num), hm(h % 12 + 1, m), hm(num, (h * 5) % 60), hm(h === 1 ? 12 : h - 1, m), hm(h, (m + 30) % 60)];
      const choices = [answer].concat(distinct(answer, cands, 3));
      const hourTxt = m === 0 ? `The short hand points right at the ${h}.` : `The short hand is between ${h} and ${h % 12 + 1}, so the hour is ${h}.`;
      return { prompt: `What time does the clock show?${clock(h, m)}`, type: 'choice', answer, choices, params: { minuteAngle: m * 6, hourAngle: (h % 12) * 30 + m / 2 },
        hints: [hourTxt, m === 0 ? 'The long hand points at the 12. That means 0 minutes, or "o\'clock".' : `The long hand points at the ${num}. Count by 5s: ${Array.from({ length: num }, (_, i) => 5 * (i + 1)).join(', ')}. That is ${m} minutes.`, `The time is <b>${answer}</b>.`] };
    },
    verify(q) {
      const { minuteAngle, hourAngle } = q.params;
      const m = minuteAngle / 6, h = Math.floor(hourAngle / 30) || 12;
      return q.answer === `${h}:${m < 10 ? '0' + m : m}`;
    },
  });

  /* ---------- Unit 6: Measurement ---------- */
  const OBJECTS = ['crayon', 'ribbon', 'pencil', 'worm', 'straw', 'leaf', 'key', 'stick'];
  function ruler(len, unitPx, start, end, label) {
    const x0 = 20, w = x0 * 2 + len * unitPx;
    let s = `<svg class="figure" viewBox="0 0 ${w} 122" width="${w}" height="122" role="img" aria-label="ruler">`;
    s += `<rect class="fill" x="${x0 + start * unitPx}" y="14" width="${(end - start) * unitPx}" height="26" rx="6"/>`;
    s += `<rect class="stroke" x="${x0 - 10}" y="50" width="${len * unitPx + 20}" height="50" rx="4"/>`;
    for (let i = 0; i <= len; i++) {
      const x = x0 + i * unitPx;
      s += `<line class="stroke" x1="${x}" y1="50" x2="${x}" y2="66"/><text x="${x}" y="86" text-anchor="middle" font-size="14">${i}</text>`;
    }
    return s + `<text x="${w / 2}" y="117" text-anchor="middle" font-size="12">${label}</text></svg>`;
  }
  A.skill({
    id: 'g2.measure-length', title: 'Measuring length with a ruler',
    learn: p('To measure with a ruler, <b>line up one end of the object with the 0</b>. Then read the number at the other end. That number is the length.') +
      p('If the object does not start at 0, <b>count the spaces</b> between its two ends, or subtract the start number from the end number.') +
      p('Always say the unit: centimeters (cm) or inches.') +
      example('Example', 'A crayon starts at 2 and ends at 9 on a centimeter ruler. Count the spaces from 2 to 9: 9 − 2 = <b>7 cm</b>.'),
    make(rng) {
      const cm = rng.bool();
      const len = cm ? 12 : 9, px = cm ? 28 : 36, unit = cm ? 'cm' : 'inches';
      const start = rng.chance(0.65) ? 0 : rng.int(1, 3);
      const end = rng.int(start + 2, len);
      const obj = rng.pick(OBJECTS);
      const ans = end - start;
      const hints = start === 0
        ? [`The left end of the ${obj} is at 0.`, `The right end is at ${end}.`, `The ${obj} is <b>${ans} ${unit}</b> long.`]
        : [`The ${obj} does not start at 0. It starts at ${start}.`, `It ends at ${end}. Count the spaces from ${start} to ${end}, or subtract: ${end} − ${start}.`, `The ${obj} is <b>${ans} ${unit}</b> long.`];
      return { prompt: `How long is the ${obj}?${ruler(len, px, start, end, unit)}`, type: 'number', answer: ans, unit, hints, params: { start, end } };
    },
    verify(q) { let spaces = 0; for (let x = q.params.start; x < q.params.end; x++) spaces++; return q.answer === spaces; },
  });

  A.skill({
    id: 'g2.length-word-problems', title: 'Length word problems',
    learn: p('Length word problems are add and subtract problems with units. Read carefully and <b>decide if you put lengths together or find a difference</b>.') +
      p('Joining two pieces end to end means add. Cutting a piece off, or finding how much longer or shorter one thing is, means subtract. Keep the same unit in your answer.') +
      example('Example', 'A ribbon is 64 cm long. Ana cuts off 25 cm. How long is it now? Cutting off means subtract: 64 − 25 = <b>39 cm</b>.'),
    make(rng) {
      const kind = rng.pick(['join', 'cut', 'longer', 'shorter']);
      const unit = rng.pick(['cm', 'inches', 'feet', 'meters']);
      const x = rng.pick(NAMES), y = rng.pick(NAMES.filter(n => n !== x));
      if (kind === 'join') {
        const [a, b] = pairFor(rng, '+', rng.bool(), 12, 60, 99);
        return { prompt: `${x} tapes a ${a} ${unit} paper strip to a ${b} ${unit} paper strip, end to end. How long is the new strip?`, type: 'number', answer: a + b, unit, params: { kind, a, b },
          hints: [`Putting two strips end to end means add.`, `${a} + ${b} = ?`, `The new strip is <b>${a + b} ${unit}</b> long.`] };
      }
      const [a, b] = pairFor(rng, '−', rng.bool(), 12, 99, 100);
      const ans = a - b;
      const prompt = kind === 'cut' ? `A rope is ${a} ${unit} long. ${x} cuts off ${b} ${unit}. How long is the rope now?`
        : kind === 'longer' ? `${x}'s snake toy is ${a} ${unit} long. ${y}'s snake toy is ${b} ${unit} long. How much longer is ${x}'s toy?`
        : `A tree is ${a} ${unit} tall. A bush is ${b} ${unit} tall. How much shorter is the bush than the tree?`;
      return { prompt, type: 'number', answer: ans, unit, params: { kind, a, b },
        hints: [kind === 'cut' ? 'Cutting some off means subtract.' : 'To find how much longer or shorter, subtract the smaller length from the bigger one.', `${a} − ${b} = ?`, `The answer is <b>${ans} ${unit}</b>.`] };
    },
    verify(q) { const { kind, a, b } = q.params; return kind === 'join' ? q.answer - a === b : b + q.answer === a; },
  });

  /* ---------- Unit 7: Data ---------- */
  const TOPICS = [
    { title: 'Favorite fruit', cats: [['circle', 'Apples'], ['square', 'Bananas'], ['triangle', 'Grapes'], ['star', 'Berries'], ['heart', 'Oranges']] },
    { title: 'Class pets', cats: [['circle', 'Dogs'], ['square', 'Cats'], ['triangle', 'Fish'], ['star', 'Rabbits'], ['heart', 'Turtles']] },
    { title: 'Weather this month', cats: [['circle', 'Sunny'], ['square', 'Cloudy'], ['triangle', 'Rainy'], ['star', 'Snowy'], ['heart', 'Windy']] },
    { title: 'Favorite ball game', cats: [['circle', 'Soccer'], ['square', 'Basketball'], ['triangle', 'Tennis'], ['star', 'Football'], ['heart', 'Baseball']] },
  ];
  // each row of a picture graph gets its own drawn shape and color; one shape stands for 1
  const ROW_COLOR = { circle: 'red', square: 'blue', triangle: 'green', star: 'orange', heart: 'purple' };
  const graphRow = (k, sh) => M.items(k, sh, ROW_COLOR[sh], { per: 0, size: 24, inline: true });
  /** one question about a small data set; shared by picture graphs and bar graphs */
  function dataQuestion(rng, names, counts, read) {
    const kind = rng.pick(['how-many', 'more', 'total', 'most']);
    const [i, j] = rng.sample([0, 1, 2, 3].slice(0, names.length), 2);
    const lo = counts[i] < counts[j] ? i : j, hi = lo === i ? j : i;
    if (kind === 'how-many') return { q: `How many are <b>${names[i]}</b>?`, type: 'number', answer: counts[i], params: { kind, counts, i },
      hints: [read(i), `So there are <b>${counts[i]}</b>.`] };
    if (kind === 'more') return { q: `How many more are <b>${names[hi]}</b> than <b>${names[lo]}</b>?`, type: 'number', answer: counts[hi] - counts[lo], params: { kind, counts, i: hi, j: lo },
      hints: [read(hi), read(lo), `Subtract: ${counts[hi]} − ${counts[lo]} = <b>${counts[hi] - counts[lo]}</b>.`] };
    if (kind === 'total') return { q: `How many are <b>${names[i]}</b> and <b>${names[j]}</b> together?`, type: 'number', answer: counts[i] + counts[j], params: { kind, counts, i, j },
      hints: [read(i), read(j), `Add: ${counts[i]} + ${counts[j]} = <b>${counts[i] + counts[j]}</b>.`] };
    const fewest = rng.bool(), want = fewest ? Math.min(...counts) : Math.max(...counts), k = counts.indexOf(want);
    return { q: `Which has the <b>${fewest ? 'fewest' : 'most'}</b>?`, type: 'choice', answer: names[k], choices: names.slice(), params: { kind, counts, fewest, names },
      hints: [fewest ? 'Look for the smallest number, the one with the least.' : 'Look for the biggest number, the one with the most.', read(k), `<b>${names[k]}</b> has the ${fewest ? 'fewest' : 'most'}.`] };
  }
  function verifyData(q) {
    const p = q.params, c = p.counts;
    if (p.kind === 'how-many') return q.answer === c[p.i];
    if (p.kind === 'more') return q.answer + c[p.j] === c[p.i] && c[p.i] > c[p.j];
    if (p.kind === 'total') return q.answer - c[p.j] === c[p.i];
    const sorted = c.map((v, idx) => [v, idx]).sort((x, y) => x[0] - y[0]);
    return q.answer === p.names[(p.fewest ? sorted[0] : sorted[sorted.length - 1])[1]];
  }

  A.skill({
    id: 'g2.picture-graphs', title: 'Picture graphs',
    learn: p('A <b>picture graph</b> uses pictures to show how many. In our graphs, <b>each picture stands for 1</b>.') +
      p('To read it, find the row you want and count the pictures. To compare two rows, count both and subtract. To find a total, add.') +
      example('Example', `${M.table(['Pet', 'Votes'], [['Dogs', graphRow(5, 'circle')], ['Cats', graphRow(3, 'square')]])}How many more votes for dogs than cats? Dogs 5, cats 3. 5 − 3 = <b>2</b>.`),
    make(rng) {
      const topic = rng.pick(TOPICS), cats = rng.sample(topic.cats, rng.int(3, 4));
      const counts = rng.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], cats.length);
      const names = cats.map(c => c[1]);
      const graph = M.table([topic.title, 'Count'], cats.map((c, i) => [c[1], graphRow(counts[i], c[0])]));
      const d = dataQuestion(rng, names, counts, k => `Count the pictures in the ${names[k]} row: ${counts[k]}.`);
      return Object.assign({ prompt: `Look at the picture graph. Each picture stands for 1.${graph}${d.q}` }, d);
    },
    verify: verifyData,
  });

  function barGraph(title, names, counts) {
    const max = 10, uy = 16, x0 = 34, y0 = 20 + max * uy, bw = 44, gap = 22;
    const w = x0 + names.length * (bw + gap) + 10;
    let s = `<svg class="figure" viewBox="0 0 ${w} ${y0 + 44}" width="${w}" height="${y0 + 44}" role="img" aria-label="bar graph">`;
    s += `<text x="${w / 2}" y="12" text-anchor="middle" font-size="13" font-weight="700">${title}</text>`;
    for (let v = 0; v <= max; v++) {
      const y = y0 - v * uy;
      s += `<line class="light" x1="${x0}" y1="${y}" x2="${w - 6}" y2="${y}" style="stroke-width:1"/><text x="${x0 - 6}" y="${y + 4}" text-anchor="end" font-size="11">${v}</text>`;
    }
    names.forEach((nm, i) => {
      const x = x0 + gap / 2 + i * (bw + gap);
      s += `<rect class="fill" x="${x}" y="${y0 - counts[i] * uy}" width="${bw}" height="${counts[i] * uy}"/>`;
      s += `<text x="${x + bw / 2}" y="${y0 + 18}" text-anchor="middle" font-size="11">${nm}</text>`;
    });
    return s + `<line class="stroke" x1="${x0}" y1="${y0}" x2="${w - 6}" y2="${y0}"/><line class="stroke" x1="${x0}" y1="20" x2="${x0}" y2="${y0}"/></svg>`;
  }
  A.skill({
    id: 'g2.bar-graphs', title: 'Bar graphs',
    learn: p('A <b>bar graph</b> uses bars to show how many. To read a bar, <b>look at the top of the bar and follow the line across</b> to the numbers on the side.') +
      p('A taller bar means more. To compare two bars, read both numbers and subtract. To find how many together, add.') +
      example('Example', 'The Soccer bar ends at the line for 7. The Tennis bar ends at 3. Soccer has 7 − 3 = <b>4</b> more votes than Tennis.'),
    make(rng) {
      const topic = rng.pick(TOPICS), cats = rng.sample(topic.cats, 4);
      const counts = rng.sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4);
      const names = cats.map(c => c[1]);
      const d = dataQuestion(rng, names, counts, k => `The ${names[k]} bar reaches the line for ${counts[k]}.`);
      return Object.assign({ prompt: `Look at the bar graph.${barGraph(topic.title, names, counts)}${d.q}` }, d);
    },
    verify: verifyData,
  });

  /* ---------- Unit 8: Geometry ---------- */
  const PART = { 2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['fourth', 'fourths'], 5: ['fifth', 'fifths'] };
  const WORD = ['zero', 'one', 'two', 'three', 'four', 'five'];
  const fracWords = (k, n) => `${WORD[k]} ${PART[n][k === 1 ? 0 : 1]}`;
  /** a rectangle, circle or square cut into n equal parts, the first k shaded */
  function cutShape(shape, n, k) {
    let s = '<svg class="figure" viewBox="0 0 200 140" width="200" height="140" role="img" aria-label="shape">';
    const cls = i => i < k ? 'fill' : 'stroke';
    if (shape === 'circle') {
      const cx = 100, cy = 70, r = 62;
      for (let i = 0; i < n; i++) {
        const a1 = 2 * Math.PI * i / n - Math.PI / 2, a2 = 2 * Math.PI * (i + 1) / n - Math.PI / 2;
        const [x1, y1, x2, y2] = [cx + r * Math.cos(a1), cy + r * Math.sin(a1), cx + r * Math.cos(a2), cy + r * Math.sin(a2)].map(v => M.round(v, 2));
        s += `<path class="${cls(i)}" d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2} Z"/>`;
      }
    } else if (shape === 'square') {
      [[0, 0], [1, 0], [1, 1], [0, 1]].forEach(([c, r], i) => { s += `<rect class="${cls(i)}" x="${40 + c * 60}" y="${10 + r * 60}" width="60" height="60"/>`; });
    } else {
      const w = 180 / n;
      for (let i = 0; i < n; i++) s += `<rect class="${cls(i)}" x="${M.round(10 + i * w, 2)}" y="20" width="${M.round(w, 2)}" height="100"/>`;
    }
    return s + '</svg>';
  }
  A.skill({
    id: 'g2.fraction-shapes', title: 'Halves, thirds, and fourths',
    learn: p('We can cut a shape into <b>equal parts</b>. Equal parts are all the same size.') +
      p('<b>2 equal parts are halves. 3 equal parts are thirds. 4 equal parts are fourths.</b> One part is one half, one third, or one fourth.') +
      p('To name the shaded part, count the shaded parts, then count all the parts. Two of three equal parts is two thirds. A whole is 2 halves, 3 thirds, or 4 fourths.') +
      example('Example', `${cutShape('rect', 4, 3)}The shape has 4 equal parts, so they are fourths. 3 are shaded: <b>three fourths</b>.`),
    make(rng) {
      const kind = rng.pick(['shaded', 'shaded', 'name', 'whole']);
      if (kind === 'whole') {
        const n = rng.int(2, 4);
        return { prompt: `How many <b>${PART[n][1]}</b> make one whole?`, type: 'number', answer: n, params: { kind, n },
          hints: [`${PART[n][1][0].toUpperCase() + PART[n][1].slice(1)} means the whole is cut into equal parts of that kind.`, `${n === 2 ? 'Halves come from 2 parts' : n === 3 ? 'Thirds come from 3 parts' : 'Fourths come from 4 parts'}.`, `<b>${n}</b> ${PART[n][1]} make one whole.`] };
      }
      if (kind === 'name') {
        const n = rng.int(2, 4), food = rng.pick(['pizza', 'pie', 'sandwich', 'cake', 'pancake']), who = rng.pick(NAMES);
        const answer = PART[n][0], choices = ['half', 'third', 'fourth', 'fifth'];
        return { prompt: `${who} cuts a ${food} into ${n} equal pieces. Each piece is one ___ of the ${food}.`, type: 'choice', answer, choices, keepOrder: true, params: { kind, n },
          hints: ['The name of the part comes from how many equal pieces there are.', '2 pieces: halves. 3 pieces: thirds. 4 pieces: fourths.', `Each piece is one <b>${answer}</b>.`] };
      }
      const n = rng.int(2, 4), k = rng.int(1, n - 1);
      const shape = n === 4 && rng.bool() ? 'square' : rng.pick(['rect', 'circle']);
      const answer = fracWords(k, n);
      const cands = [fracWords(n - k, n), k < n - 1 ? fracWords(k, n - 1) : null, fracWords(k, n + 1), k === 1 ? fracWords(1, n === 2 ? 3 : 2) : fracWords(1, n),
        fracWords(1, 4), fracWords(1, 3), fracWords(1, 2)].filter(Boolean);
      const choices = [answer].concat(distinct(answer, cands, 3));
      return { prompt: `What part of the shape is shaded?${cutShape(shape, n, k)}`, type: 'choice', answer, choices, params: { kind, n, k },
        hints: [`Count all the equal parts: ${n}. So the parts are ${PART[n][1]}.`, `Count the shaded parts: ${k}.`, `${k} of ${n} equal parts is <b>${answer}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'whole') return q.answer === p.n;
      if (p.kind === 'name') return q.answer === ['', '', 'half', 'third', 'fourth'][p.n];
      return q.answer === `${['', 'one', 'two', 'three'][p.k]} ${{ 2: 'half', 3: 'third', 4: 'fourth' }[p.n]}${p.k > 1 ? 's' : ''}`;
    },
  });

  const ARRAY_LOOKS = [['circle', 'red'], ['star', 'orange'], ['heart', 'purple'], ['square', 'blue'], ['triangle', 'green'], ['circle', 'purple'], ['square', 'orange'], ['star', 'blue']];
  A.skill({
    id: 'g2.arrays', title: 'Arrays: rows and columns',
    learn: p('An <b>array</b> is a set of things in equal rows. <b>Rows</b> go across, and <b>columns</b> go up and down.') +
      p('To find how many in all, <b>add the same number once for each row</b>. 3 rows of 4 is 4 + 4 + 4 = 12.') +
      p('A rectangle cut into rows and columns of same-size squares is an array too.') +
      example('Example', `${M.items(10, 'star', 'orange', { per: 5 })}2 rows with 5 in each row: 5 + 5 = <b>10</b> stars.`),
    make(rng) {
      const kind = rng.pick(['count', 'count', 'sentence', 'squares']);
      const r = rng.int(kind === 'sentence' ? 3 : 2, 5), c = rng.int(2, 5), [sh, col] = rng.pick(ARRAY_LOOKS);
      const rowsTxt = M.items(r * c, sh, col, { per: c, label: `an array of ${col} ${sh}s: ${r} rows of ${c}` });
      const sum = Array(r).fill(c).join(' + ');
      if (kind === 'sentence') {
        const answer = sum;
        const cands = [Array(r - 1).fill(c).join(' + '), Array(r + 1).fill(c).join(' + '), `${r} + ${c}`, Array(r).fill(c + 1).join(' + ')];
        return { prompt: `Which addition adds the <b>rows</b> of this array?${rowsTxt}`, type: 'choice', answer, choices: [answer].concat(distinct(answer, cands, 3)), params: { kind, r, c },
          hints: [`Count the rows: ${r}.`, `Count how many are in each row: ${c}.`, `Add ${c} once for each of the ${r} rows: <b>${answer}</b>.`] };
      }
      if (kind === 'squares') {
        let svg = `<svg class="figure" viewBox="0 0 ${c * 34 + 4} ${r * 34 + 4}" width="${c * 34 + 4}" height="${r * 34 + 4}" role="img" aria-label="rectangle">`;
        for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) svg += `<rect class="fill" x="${2 + j * 34}" y="${2 + i * 34}" width="34" height="34"/>`;
        svg += '</svg>';
        return { prompt: `This rectangle is cut into same-size squares. How many squares are there?${svg}`, type: 'number', answer: r * c, params: { kind, r, c },
          hints: [`Count the rows: ${r}. Count the squares in one row: ${c}.`, `Add one row at a time: ${sum}.`, `There are <b>${r * c}</b> squares.`] };
      }
      return { prompt: `How many ${sh}s are there in all?${rowsTxt}`, type: 'number', answer: r * c, params: { kind, r, c },
        hints: [`There are ${r} rows with ${c} in each row.`, `Add the rows: ${sum}.`, `${sum} = <b>${r * c}</b>.`] };
    },
    verify(q) {
      const { kind, r, c } = q.params;
      let count = 0;
      for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) count++;
      if (kind === 'sentence') return q.answer.split(' + ').length === r && q.answer.split(' + ').every(x => Number(x) === c);
      return q.answer === count;
    },
  });
})();
