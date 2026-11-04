/* 3rd grade math. Multiplication and division, adding and subtracting within 1,000, fractions,
   area and perimeter, time, mass and volume, and graphs. Written for an 8-year-old. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n;
  const R = { raw: true };
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = (s) => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const FR = (n, d) => F(n, d, R);                       // a fraction exactly as written (2/4 stays 2/4)
  const pad = m => (m < 10 ? '0' : '') + m;
  const countOf = (html, s) => html.split(s).length - 1;
  const fracParts = html => A.stripTags(html).trim().split(/\s+/).map(Number);   // "3/4" as a stacked fraction → [3, 4]
  /** pick distractors: drop anything that reads the same as the answer or as each other, keep the first k */
  const distinct = (answer, list, k) => {
    const out = [], seen = new Set([A.normText(A.stripTags(answer))]);
    for (const c of list) { const key = A.normText(A.stripTags(c)); if (!seen.has(key)) { seen.add(key); out.push(c); } if (out.length === k) break; }
    return out;
  };

  /* ---------- pictures ---------- */
  const BOX = 'display:inline-block;border:2px solid var(--line-strong);border-radius:12px;padding:2px 8px;margin:4px;line-height:1.3';
  /** g boxes with k drawn shapes in each; verify() counts the shapes with M.countItems */
  const groupsPic = (g, k, t) => `<div class="big">${Array.from({ length: g }, () => `<span style="${BOX}">${M.items(k, t.sh, t.col, { per: k <= 3 ? k : Math.ceil(k / 2), size: 26, inline: true })}</span>`).join(' ')}</div>`;
  const arrayPic = (r, c, t) => M.items(r * c, t.sh, t.col, { per: c, label: `an array of ${t.item}: ${r} rows with ${c} in each row` });
  const drawn = t => `${t.col} ${t.sh}`;

  A.course({
    id: 'math-3', title: '3rd grade math', subject: 'Elementary', grade: 3, icon: '3', hue: 55,
    blurb: 'Multiplication and division facts, adding and subtracting within 1,000, fractions, area and perimeter, time, measurement, and graphs.',
    units: [
      { id: 'intro-mult', title: 'Intro to multiplication', blurb: 'Equal groups and arrays.', skills: ['g3.equal-groups', 'g3.arrays'] },
      { id: 'mult-1digit', title: '1-digit multiplication', blurb: 'The times tables, and strategies that make them easier.', skills: ['g3.mult-facts', 'g3.mult-properties'] },
      { id: 'add-sub', title: 'Addition, subtraction, and estimation', blurb: 'Rounding, and adding and subtracting 3-digit numbers.', skills: ['g3.rounding', 'g3.add-sub-1000'] },
      { id: 'intro-div', title: 'Intro to division', blurb: 'Sharing equally, division facts, and word problems.', skills: ['g3.div-facts', 'g3.mult-div-word-problems'] },
      { id: 'fractions', title: 'Understand fractions', blurb: 'Equal parts of a whole, and fractions on a number line.', skills: ['g3.unit-fractions', 'g3.fractions-number-line'] },
      { id: 'equiv-compare', title: 'Equivalent fractions and comparing fractions', blurb: 'Fractions that are the same size, and which fraction is bigger.', skills: ['g3.equivalent-fractions', 'g3.compare-fractions'] },
      { id: 'more-mult', title: 'More with multiplication and division', blurb: 'Multiplying by 10s, and patterns in numbers.', skills: ['g3.mult-multiples-10', 'g3.arithmetic-patterns'] },
      { id: 'area-perimeter', title: 'Area and perimeter', blurb: 'The space inside a shape, and the distance around it.', skills: ['g3.area', 'g3.perimeter'] },
      { id: 'measure-data', title: 'Time, measurement, and data', blurb: 'Clocks, grams and liters, bar graphs and line plots.', skills: ['g3.time', 'g3.mass-volume', 'g3.graphs'] },
    ],
  });

  /* ---------- Unit 1: Intro to multiplication ---------- */
  const THINGS = [
    { sh: 'circle', col: 'red', box: 'bag', boxes: 'bags', item: 'apples' }, { sh: 'square', col: 'orange', box: 'plate', boxes: 'plates', item: 'cookies' },
    { sh: 'heart', col: 'purple', box: 'vase', boxes: 'vases', item: 'flowers' }, { sh: 'triangle', col: 'blue', box: 'tank', boxes: 'tanks', item: 'fish' },
    { sh: 'star', col: 'green', box: 'card', boxes: 'cards', item: 'stars' }, { sh: 'circle', col: 'blue', box: 'net', boxes: 'nets', item: 'balls' },
  ];
  A.skill({
    id: 'g3.equal-groups', title: 'Equal groups',
    learn: p('When every group has the <b>same number</b> of things, we call them <b>equal groups</b>.') +
      p('You can find the total by adding the same number again and again. Multiplication is a fast way to do that. <b>3 × 4</b> means <b>3 groups of 4</b>. The first number tells how many groups. The second number tells how many are in each group.') +
      example('Example', `${groupsPic(3, 4, THINGS[0])}There are 3 groups with 4 circles in each. 4 + 4 + 4 = 12, so <b>3 × 4 = 12</b>.`),
    make(rng) {
      const kind = rng.pick(['count', 'expr', 'story']);
      const t = rng.pick(THINGS);
      const g = rng.int(2, 5); let k = rng.int(2, 5);
      if (g === 2 && k === 2) k = 3;                    // 2 + 2 = 2 × 2 would make a distractor right
      const adds = Array(g).fill(k).join(' + ');
      if (kind === 'expr') {
        const answer = `${g} × ${k}`;
        return { prompt: `Which multiplication matches the picture?${groupsPic(g, k, t)}`, type: 'choice', answer, choices: [answer, `${g} + ${k}`, `${g} × ${k + 1}`, `${g + 1} × ${k}`], params: { kind, g, k, e: drawn(t) },
          hints: [`Count the groups. There are ${g} groups.`, `Count how many are in one group. There are ${k}.`, `${g} groups of ${k} is <b>${answer}</b>.`] };
      }
      const hints = [`There are ${g} groups, and each group has ${k}.`, `Add ${k} again and again: ${adds}.`, `${g} × ${k} = <b>${g * k}</b>.`];
      if (kind === 'count') return { prompt: `How many ${t.sh}s are there in all?${groupsPic(g, k, t)}`, type: 'number', answer: g * k, params: { kind, g, k, e: drawn(t) }, hints };
      const name = rng.pick(NAMES);
      return { prompt: `${name} has ${g} ${t.boxes}. Each ${t.box} has ${k} ${t.item}. How many ${t.item} does ${name} have in all?`, type: 'number', answer: g * k, params: { kind, g, k }, hints };
    },
    verify(q) {
      const { kind, g, k, e } = q.params;
      if (kind === 'count') return q.answer === M.countItems(q.prompt, e);
      if (kind === 'expr') { const [a, b] = A.stripTags(q.answer).split('×').map(Number); return a === g && b === k && M.countItems(q.prompt, e) === a * b; }
      let s = 0; for (let i = 0; i < g; i++) s += k; return q.answer === s;
    },
  });

  const ROWS = [{ sh: 'circle', col: 'blue', item: 'dots' }, { sh: 'star', col: 'orange', item: 'stars' }, { sh: 'square', col: 'green', item: 'squares' }, { sh: 'heart', col: 'purple', item: 'hearts' }];
  A.skill({
    id: 'g3.arrays', title: 'Multiplication with arrays',
    learn: p('An <b>array</b> is things lined up in <b>rows</b> and <b>columns</b>. Rows go across. Columns go up and down.') +
      p('Every row has the same number of things, so an array is equal groups. <b>Number of rows × number in each row = total.</b> You can also count columns × number in each column. You get the same total.') +
      example('Example', `${arrayPic(2, 5, ROWS[0])}There are 2 rows with 5 dots in each row. 5 + 5 = 10, so <b>2 × 5 = 10</b>.`),
    make(rng) {
      const kind = rng.pick(['count', 'count', 'expr', 'story']);
      const t = rng.pick(ROWS);
      const r = rng.int(2, 6); let c = rng.int(2, 8);
      if (r === 2 && c === 2) c = 4;
      if (kind === 'expr') {
        const answer = `${r} × ${c}`;
        return { prompt: `Which multiplication matches this array? (rows × number in each row)${arrayPic(r, c, t)}`, type: 'choice', answer, choices: [answer, `${r} + ${c}`, `${r} × ${c + 1}`, `${r - 1} × ${c}`], params: { kind, r, c, e: drawn(t) },
          hints: [`Count the rows going across. There are ${r} rows.`, `Count how many are in one row. There are ${c}.`, `${r} rows of ${c} is <b>${answer}</b>.`] };
      }
      const hints = [`There are ${r} rows, and each row has ${c}.`, `Skip-count by ${c}s, once for each row: ${Array.from({ length: r }, (_, i) => c * (i + 1)).join(', ')}.`, `${r} × ${c} = <b>${r * c}</b>.`];
      if (kind === 'count') return { prompt: `How many ${t.item} are in this array?${arrayPic(r, c, t)}`, type: 'number', answer: r * c, params: { kind, r, c, e: drawn(t) }, hints };
      const name = rng.pick(NAMES), what = rng.pick([['chairs', 'set out chairs'], ['cupcakes', 'lined up cupcakes'], ['carrots', 'planted carrots'], ['stickers', 'put stickers']]);
      return { prompt: `${name} ${what[1]} in ${r} rows. There are ${c} ${what[0]} in each row. How many ${what[0]} are there in all?`, type: 'number', answer: r * c, params: { kind, r, c }, hints };
    },
    verify(q) {
      const { kind, r, c, e } = q.params;
      if (kind === 'count') return q.answer === M.countItems(q.prompt, e);
      if (kind === 'expr') { const [a, b] = A.stripTags(q.answer).split('×').map(Number); return a === r && b === c && M.countItems(q.prompt, e) === a * b; }
      let s = 0; for (let i = 0; i < c; i++) s += r; return q.answer === s;
    },
  });

  /* ---------- Unit 2: 1-digit multiplication ---------- */
  A.skill({
    id: 'g3.mult-facts', title: 'Multiplication facts',
    learn: p('A <b>multiplication fact</b> is a times-table answer you can remember, like 6 × 7 = 42.') +
      p('If you forget one, <b>skip-count</b>. For 4 × 6, count by 6s four times: 6, 12, 18, 24. Two facts are always easy: <b>any number × 1 is itself</b>, and <b>any number × 0 is 0</b>.') +
      example('Example', `${big('7 × 3 = ?')}Count by 7s three times: 7, 14, 21. So 7 × 3 = <b>21</b>.`),
    make(rng) {
      const a = rng.int(2, 10), b = rng.chance(0.1) ? rng.int(0, 1) : rng.int(2, 10);
      const ans = a * b;
      const wordy = rng.chance(0.25);
      const hints = b === 0 ? [`You have ${a} groups of nothing.`, `Any number times 0 is 0. ${a} × 0 = <b>0</b>.`]
        : b === 1 ? [`${a} × 1 means one group of ${a}.`, `Any number times 1 is itself. ${a} × 1 = <b>${a}</b>.`]
          : [`Skip-count by ${a}s, ${b} times.`, `${Array.from({ length: b }, (_, i) => a * (i + 1)).join(', ')}.`, `${wordy ? `${b} × ${a}` : `${a} × ${b}`} = <b>${ans}</b>.`];
      const prompt = wordy ? `What is ${b} groups of ${a}?${big(`${b} × ${a} = ?`)}` : `Multiply.${big(`${a} × ${b} = ?`)}`;
      return { prompt, type: 'number', answer: ans, params: { a, b }, hints };
    },
    verify(q) { let s = 0; for (let i = 0; i < q.params.b; i++) s += q.params.a; return q.answer === s; },
  });

  A.skill({
    id: 'g3.mult-properties', title: 'Commutative and distributive properties',
    learn: p('<b>You can switch the order of the numbers and the answer stays the same.</b> 3 × 8 = 24 and 8 × 3 = 24. This is called the <b>commutative property</b>. Turn an array on its side and you can see why.') +
      p('<b>You can break a number into two parts, multiply each part, and add.</b> This is the <b>distributive property</b>. For 6 × 7, break 7 into 5 + 2: 6 × 5 = 30 and 6 × 2 = 12, so 6 × 7 = 30 + 12 = 42.') +
      example('Example', `${big('4 × 8 = 4 × 5 + 4 × 3')}4 × 5 = 20 and 4 × 3 = 12. 20 + 12 = 32, so <b>4 × 8 = 32</b>.`),
    make(rng) {
      const kind = rng.pick(['comm-num', 'comm-choice', 'dist-missing', 'dist-part', 'dist-total']);
      if (kind.startsWith('comm')) {
        const a = rng.int(2, 9); let b = rng.int(3, 10); if (b === a) b = a + 1;
        if (kind === 'comm-num') return { prompt: `${a} × ${b} = ${a * b}. Use this to find the answer.${big(`${b} × ${a} = ?`)}`, type: 'number', answer: a * b, params: { kind, a, b },
          hints: [`${b} × ${a} has the same numbers as ${a} × ${b}, just switched.`, `Switching the order does not change the answer. ${b} × ${a} = <b>${a * b}</b>.`] };
        const answer = `${b} × ${a}`;
        return { prompt: `Which one has the same answer as ${a} × ${b}?`, type: 'choice', answer, choices: [answer, `${b} + ${a}`, `${b} × ${a + 1}`, `${b - 1} × ${a}`], params: { kind, a, b },
          hints: [`You can switch the order of the numbers in multiplication.`, `Look for the same two numbers, joined by ×.`, `<b>${answer}</b> = ${a * b}, just like ${a} × ${b}.`] };
      }
      const a = rng.int(2, 9), b = rng.int(6, 9), r = b - 5;
      const split = `${a} × 5 + ${a} × ${r}`;
      if (kind === 'dist-missing') return { prompt: `Fill in the missing number.${big(`${a} × ${b} = ${a} × 5 + ${a} × ?`)}`, type: 'number', answer: r, params: { kind, a, b },
        hints: [`The ${b} is being broken into two parts. One part is 5.`, `5 + ? = ${b}.`, `The missing number is <b>${r}</b>, because 5 + ${r} = ${b}.`] };
      if (kind === 'dist-part') return { prompt: `Fill in the missing number.${big(`${a} × ${b} = ${a * 5} + ?`)}<p>Hint: ${a * 5} is ${a} × 5.</p>`, type: 'number', answer: a * r, params: { kind, a, b },
        hints: [`${a * 5} is ${a} × 5. Break ${b} into 5 + ${r}.`, `The missing part is ${a} × ${r}.`, `${a} × ${r} = <b>${a * r}</b>.`] };
      return { prompt: `Break ${b} into 5 + ${r} to find the answer.${big(`${a} × ${b} = ${split} = ?`)}`, type: 'number', answer: a * b, params: { kind, a, b },
        hints: [`First: ${a} × 5 = ${a * 5}.`, `Next: ${a} × ${r} = ${a * r}.`, `Add: ${a * 5} + ${a * r} = <b>${a * b}</b>.`] };
    },
    verify(q) {
      const { kind, a, b } = q.params;
      if (kind === 'comm-choice') { const [x, y] = A.stripTags(q.answer).split('×').map(Number); return x * y === a * b && x === b; }
      if (kind === 'dist-missing') return a * 5 + a * q.answer === a * b;
      if (kind === 'dist-part') return a * 5 + q.answer === a * b;
      let s = 0; for (let i = 0; i < a; i++) s += b; return q.answer === s;
    },
  });

  /* ---------- Unit 3: Addition, subtraction, and estimation ---------- */
  A.skill({
    id: 'g3.rounding', title: 'Rounding to the nearest 10 or 100',
    learn: p('Rounding gives a number that is close and easy to use. To round to the nearest <b>10</b>, find the two tens the number is between and pick the closer one. Look at the <b>ones</b> digit.') +
      p('<b>If the digit is 5 or more, round up. If it is 4 or less, round down.</b> To round to the nearest <b>100</b>, do the same thing but look at the <b>tens</b> digit.') +
      example('Example', `${big('Round 463 to the nearest 10.')}463 is between 460 and 470. The ones digit is 3, which is less than 5, so round down to <b>460</b>.`),
    make(rng) {
      const place = rng.pick([10, 10, 100]);
      let n;
      do { n = place === 10 ? rng.int(11, 989) : rng.int(101, 949); } while (n % place === 0);
      if (rng.chance(0.2)) n = place === 10 ? n - (n % 10) + 5 : n - (n % 100) + 50 + (n % 10);   // a "5" to test the rule
      const lo = n - (n % place), hi = lo + place;
      const digit = place === 10 ? n % 10 : Math.floor((n % 100) / 10);
      const up = digit >= 5, ans = up ? hi : lo;
      return { prompt: `Round to the nearest ${place}.${big(N(n))}`, type: 'number', answer: ans, params: { n, place },
        hints: [`${N(n)} is between ${N(lo)} and ${N(hi)}.`, `Look at the ${place === 10 ? 'ones' : 'tens'} digit: it is ${digit}. ${up ? '5 or more, so round up.' : '4 or less, so round down.'}`, `${N(n)} rounds to <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const { n, place } = q.params;
      let best = null;
      for (let m = 0; m <= 1000; m += place) { if (best === null || Math.abs(n - m) < Math.abs(n - best) || (Math.abs(n - m) === Math.abs(n - best) && m > best)) best = m; }
      return q.answer === best;
    },
  });

  /** column-by-column steps for a + b or a − b, in words */
  function columnSteps(a, b, op) {
    const names = ['ones', 'tens', 'hundreds'], steps = [];
    const da = [a % 10, Math.floor(a / 10) % 10, Math.floor(a / 100)], db = [b % 10, Math.floor(b / 10) % 10, Math.floor(b / 100)];
    let carry = 0;
    for (let i = 0; i < 3; i++) {
      if (op === '+') {
        const s = da[i] + db[i] + carry;
        if (i === 2 && s === 0) break;
        steps.push(`Add the ${names[i]}: ${da[i]} + ${db[i]}${carry ? ' + 1' : ''} = ${s}.${s >= 10 && i < 2 ? ` Write ${s % 10} and carry 1 to the ${names[i + 1]}.` : ''}`);
        carry = s >= 10 ? 1 : 0;
      } else {
        let top = da[i] - carry;
        if (i === 2 && top - db[i] === 0) break;
        if (top < db[i]) { steps.push(`${names[i][0].toUpperCase() + names[i].slice(1)}: ${top} is less than ${db[i]}, so regroup 1 from the ${names[i + 1]}. Then ${top + 10} − ${db[i]} = ${top + 10 - db[i]}.`); carry = 1; }
        else { steps.push(`${names[i][0].toUpperCase() + names[i].slice(1)}: ${top} − ${db[i]} = ${top - db[i]}.`); carry = 0; }
      }
    }
    return steps.join(' ');
  }
  A.skill({
    id: 'g3.add-sub-1000', title: 'Add and subtract within 1,000',
    learn: p('Line the numbers up by place: <b>ones under ones, tens under tens, hundreds under hundreds</b>. Then work from the ones on the right to the hundreds on the left.') +
      p('When adding, if a place adds up to 10 or more, <b>carry</b> 1 to the next place. When subtracting, if the top digit is too small, <b>regroup</b>: take 1 from the next place and make it 10.') +
      example('Example', `${big('358 + 274')}Ones: 8 + 4 = 12, write 2, carry 1. Tens: 5 + 7 + 1 = 13, write 3, carry 1. Hundreds: 3 + 2 + 1 = 6. The answer is <b>632</b>.`),
    make(rng) {
      const kind = rng.pick(['add', 'sub', 'add-story', 'sub-story']);
      const name = rng.pick(NAMES);
      let a, b;
      if (kind.startsWith('add')) { a = rng.int(105, 850); b = rng.int(100, Math.max(100, 999 - a)); if (a + b > 999) b = 999 - a; }
      else { a = rng.int(250, 999); b = rng.int(100, a - 50); }
      const op = kind.startsWith('add') ? '+' : '−', ans = op === '+' ? a + b : a - b;
      const steps = columnSteps(a, b, op === '+' ? '+' : '-');
      const hints = [`Line up the numbers: ones under ones, tens under tens, hundreds under hundreds.`, steps, `${a} ${op} ${b} = <b>${ans}</b>.`];
      let prompt;
      if (kind === 'add') prompt = `Add.${big(`${a} + ${b} = ?`)}`;
      else if (kind === 'sub') prompt = `Subtract.${big(`${a} − ${b} = ?`)}`;
      else if (kind === 'add-story') prompt = rng.pick([`${name} read ${a} pages last month and ${b} pages this month. How many pages did ${name} read in all?`, `A farm has ${a} chickens and ${b} ducks. How many birds are there in all?`]);
      else prompt = rng.pick([`A library had ${a} books. It gave away ${b} books. How many books are left?`, `${name} needs ${a} points to win a game. ${name} has ${b} points so far. How many more points does ${name} need?`]);
      return { prompt, type: 'number', answer: ans, params: { a, b, op }, hints };
    },
    verify(q) { const { a, b, op } = q.params; return op === '+' ? q.answer - b === a && q.answer <= 1000 : q.answer + b === a && q.answer >= 0; },
  });

  /* ---------- Unit 4: Intro to division ---------- */
  A.skill({
    id: 'g3.div-facts', title: 'Division facts',
    learn: p('<b>Division</b> means splitting into equal groups. 12 ÷ 3 can mean "share 12 into 3 equal groups" or "how many groups of 3 are in 12?" Either way the answer is 4.') +
      p('Every division fact has a multiplication fact hiding inside it. <b>To find 24 ÷ 6, ask: 6 times what is 24?</b> Since 6 × 4 = 24, 24 ÷ 6 = 4.') +
      example('Example', `${big('35 ÷ 5 = ?')}Think: 5 × ? = 35. Count by 5s: 5, 10, 15, 20, 25, 30, 35. That is 7 fives, so 35 ÷ 5 = <b>7</b>.`),
    make(rng) {
      const kind = rng.pick(['fact', 'fact', 'related', 'share']);
      const b = rng.int(2, 10), qt = rng.int(1, 10), a = b * qt;
      const hints = [`Think: ${b} × ? = ${a}.`, `Count by ${b}s until you reach ${a}: ${Array.from({ length: qt }, (_, i) => b * (i + 1)).join(', ')}. That is ${qt} ${b}s.`, `${a} ÷ ${b} = <b>${qt}</b>.`];
      if (kind === 'fact') return { prompt: `Divide.${big(`${a} ÷ ${b} = ?`)}`, type: 'number', answer: qt, params: { a, b }, hints };
      if (kind === 'related') return { prompt: `${b} × ${qt} = ${a}. Use this to divide.${big(`${a} ÷ ${b} = ?`)}`, type: 'number', answer: qt, params: { a, b },
        hints: [`${a} ÷ ${b} asks: ${b} times what is ${a}?`, `You already know ${b} × ${qt} = ${a}.`, `So ${a} ÷ ${b} = <b>${qt}</b>.`] };
      const t = rng.pick(THINGS.slice(0, 2));
      const on = t.box === 'plate' ? 'on' : 'in';
      return { prompt: `There are ${a} ${t.item}. Put them in ${b} ${t.boxes} with the same number ${on} each. How many ${t.item} go ${on} each ${t.box}?${qt <= 6 && b <= 6 ? M.items(a, t.sh, t.col, { per: 10, size: 26 }) : ''}`, type: 'number', answer: qt, params: { a, b }, hints };
    },
    verify(q) { let { a, b } = q.params, k = 0; while (a > 0) { a -= b; k++; } return a === 0 && q.answer === k; },
  });

  A.skill({
    id: 'g3.mult-div-word-problems', title: 'Multiplication and division word problems',
    learn: p('Read the story and ask: <b>do I know the groups and need the total, or do I know the total and need the groups?</b>') +
      p('Groups × number in each group = total, so <b>multiply</b> when you need the total. <b>Divide</b> when you know the total and need the number in each group, or the number of groups. A missing number, like ? × 6 = 42, is the same as 42 ÷ 6.') +
      example('Example', `${big('? × 6 = 42')}Ask: what times 6 is 42? 42 ÷ 6 = 7, and 7 × 6 = 42 ✓. The missing number is <b>7</b>.`),
    make(rng) {
      const kind = rng.pick(['mult', 'share', 'groups', 'missing', 'missing']);
      const name = rng.pick(NAMES);
      const x = rng.int(2, 9), y = rng.int(2, 9), total = x * y;
      if (kind === 'mult') return { prompt: rng.pick([`${name} buys ${x} packs of pencils. Each pack has ${y} pencils. How many pencils does ${name} buy?`, `A garden has ${x} rows of beans. Each row has ${y} plants. How many bean plants are there?`]), type: 'number', answer: total, params: { kind, x, y, total },
        hints: [`You know the number of groups (${x}) and how many are in each (${y}). Multiply.`, `${x} × ${y} = <b>${total}</b>.`] };
      if (kind === 'share') return { prompt: rng.pick([`${name} has ${total} stickers to share equally with ${x} friends. How many stickers does each friend get?`, `${total} crayons are put into ${x} boxes, the same number in each box. How many crayons are in each box?`]), type: 'number', answer: y, params: { kind, x, y, total },
        hints: [`You know the total (${total}) and the number of groups (${x}). Divide.`, `Think: ${x} × ? = ${total}.`, `${total} ÷ ${x} = <b>${y}</b>.`] };
      if (kind === 'groups') return { prompt: rng.pick([`${total} children are going on a trip. Each van holds ${y} children. How many vans do they need?`, `${name} has ${total} cookies. ${name} puts ${y} cookies in each bag. How many bags does ${name} fill?`]), type: 'number', answer: x, params: { kind, x, y, total },
        hints: [`You know the total (${total}) and how many go in each group (${y}). Divide to find the number of groups.`, `Think: ? × ${y} = ${total}.`, `${total} ÷ ${y} = <b>${x}</b>.`] };
      const form = rng.pick(['?xb', 'ax?', 'p/?', '?/b']);
      const eq = { '?xb': `? × ${y} = ${total}`, 'ax?': `${x} × ? = ${total}`, 'p/?': `${total} ÷ ? = ${y}`, '?/b': `? ÷ ${y} = ${x}` }[form];
      const ans = { '?xb': x, 'ax?': y, 'p/?': x, '?/b': total }[form];
      const how = form === '?/b' ? `Think: the missing number divided by ${y} is ${x}, so it is ${x} × ${y}.` : form === 'ax?' ? `Think: ${x} times what is ${total}? That is ${total} ÷ ${x}.` : form === '?xb' ? `Think: what times ${y} is ${total}? That is ${total} ÷ ${y}.` : `Think: ${total} split into how many groups gives ${y} in each? That is ${total} ÷ ${y}.`;
      return { prompt: `Find the missing number.${big(eq)}`, type: 'number', answer: ans, params: { kind, form, x, y, total },
        hints: [how, `Check by putting your answer in place of the ?.`, `The missing number is <b>${ans}</b>.`] };
    },
    verify(q) {
      const { kind, form, x, y, total } = q.params, v = q.answer;
      if (kind === 'mult') return v / y === x;
      if (kind === 'share') return v * x === total;
      if (kind === 'groups') return v * y === total;
      return { '?xb': v * y === total, 'ax?': x * v === total, 'p/?': total / v === y, '?/b': v / y === x }[form];
    },
  });

  /* ---------- fraction pictures ---------- */
  const r2 = x => Math.round(x * 100) / 100;
  const SHADE = ' style="fill:var(--primary);fill-opacity:.45"';     // a shaded part: clearly darker than an empty one
  function fracBar(d, shaded) {
    const w = 300 / d;
    const cells = Array.from({ length: d }, (_, i) => `<rect x="${r2(10 + i * w)}" y="8" width="${r2(w)}" height="44" class="${shaded.includes(i) ? 'fill"' + SHADE : 'stroke"'}/>`).join('');
    return `<svg class="figure" viewBox="0 0 320 60" width="320" height="60" role="img" aria-label="a bar split into ${d} equal parts">${cells}</svg>`;
  }
  function fracCircle(d, shaded) {
    const pt = t => { const a = t * 2 * Math.PI - Math.PI / 2; return `${r2(80 + 70 * Math.cos(a))} ${r2(80 + 70 * Math.sin(a))}`; };
    const cells = Array.from({ length: d }, (_, i) => `<path d="M80 80 L${pt(i / d)} A70 70 0 0 1 ${pt((i + 1) / d)} Z" class="${shaded.includes(i) ? 'fill"' + SHADE : 'stroke"'}/>`).join('');
    return `<svg class="figure" viewBox="0 0 160 160" width="160" height="160" role="img" aria-label="a circle split into ${d} equal parts">${cells}</svg>`;
  }
  const NL = { x0: 20, x1: 300 };
  /** a number line from 0 to `wholes`, with a tick every 1/d; points: [{ k, label }] at k/d */
  function numberLine(d, wholes, points) {
    const step = (NL.x1 - NL.x0) / (d * wholes);
    let s = `<line x1="${NL.x0 - 8}" y1="50" x2="${NL.x1 + 8}" y2="50" class="stroke"/>`;
    for (let i = 0; i <= d * wholes; i++) {
      const x = r2(NL.x0 + i * step), whole = i % d === 0;
      s += `<line x1="${x}" y1="${whole ? 40 : 44}" x2="${x}" y2="${whole ? 60 : 56}" class="stroke"/>`;
      if (whole) s += `<text x="${x}" y="80" text-anchor="middle" font-size="16">${i / d}</text>`;
    }
    points.forEach(pt => {
      const x = r2(NL.x0 + pt.k * step);
      s += `<circle cx="${x}" cy="50" r="7" style="fill:var(--primary)" data-label="${pt.label || ''}"/>`;
      if (pt.label) s += `<text x="${x}" y="30" text-anchor="middle" font-size="16" font-weight="700">${pt.label}</text>`;
    });
    return `<svg class="figure" viewBox="0 0 320 90" width="320" height="90" role="img" aria-label="a number line">${s}</svg>`;
  }

  /* ---------- Unit 5: Understand fractions ---------- */
  A.skill({
    id: 'g3.unit-fractions', title: 'Identify fractions',
    learn: p('A <b>fraction</b> names part of a whole. The whole must be split into <b>equal parts</b>.') +
      p(`The <b>bottom number</b> (the denominator) tells how many equal parts the whole has. The <b>top number</b> (the numerator) tells how many parts we are talking about. One part on its own, like ${F(1, 4)}, is called a <b>unit fraction</b>.`) +
      example('Example', `${fracBar(4, [0, 1, 2])}The bar has 4 equal parts, and 3 are shaded. So <b>${FR(3, 4)}</b> of the bar is shaded.`),
    make(rng) {
      const kind = rng.pick(['bar', 'circle', 'unit', 'story']);
      const d = rng.pick([2, 3, 4, 6, 8]);
      const n = kind === 'unit' ? 1 : rng.int(1, d - 1);
      const shaded = rng.sample(Array.from({ length: d }, (_, i) => i), n);
      const answer = FR(n, d);
      const wrong = [[d - n, d], [n, d - n], [n, d + 1], [n + 1, d], [d, n]].filter(([, y]) => y > 1).map(([x, y]) => FR(x, y));
      const choices = [answer].concat(distinct(answer, wrong, 3));
      const hints = [`Count all the equal parts. There are ${d}. That is the bottom number.`, `Count the ${kind === 'story' ? 'parts that were eaten' : 'shaded parts'}. There ${n === 1 ? 'is' : 'are'} ${n}. That is the top number.`, `The fraction is <b>${n}/${d}</b>.`];
      if (kind === 'story') {
        const name = rng.pick(NAMES), food = rng.pick([['pizza', 'slice', 'slices'], ['pie', 'slice', 'slices'], ['chocolate bar', 'piece', 'pieces']]);
        return { prompt: `A ${food[0]} is cut into ${d} equal ${food[2]}. ${name} eats ${n} ${n === 1 ? food[1] : food[2]}. What fraction of the ${food[0]} does ${name} eat?`, type: 'choice', answer, choices, params: { kind, n, d }, hints };
      }
      const shape = kind === 'circle' || (kind === 'unit' && rng.bool()) ? 'circle' : 'bar';
      const pic = shape === 'circle' ? fracCircle(d, shaded) : fracBar(d, shaded);
      const ask = kind === 'unit' ? `The ${shape} is split into equal parts. What fraction is the one shaded part?` : `What fraction of the ${shape} is shaded?`;
      return { prompt: ask + pic, type: 'choice', answer, choices, params: { kind, n, d }, hints };
    },
    verify(q) {
      const [a, b] = fracParts(q.answer), { kind, n, d } = q.params;
      if (kind === 'story') return a === n && b === d;
      const fill = countOf(q.prompt, 'class="fill"'), empty = countOf(q.prompt, 'class="stroke"');
      return a === fill && b === fill + empty;
    },
  });

  A.skill({
    id: 'g3.fractions-number-line', title: 'Fractions on the number line',
    learn: p(`A fraction is a number, so it has a place on the number line. Split the space from 0 to 1 into <b>equal parts</b>. If there are 4 parts, each jump is ${F(1, 4)}.`) +
      p(`<b>Count the jumps from 0, not the tick marks.</b> The point 3 jumps from 0 is at ${F(3, 4)}. After 1, keep counting: 5 jumps of ${F(1, 4)} is ${FR(5, 4)}.`) +
      example('Example', `${numberLine(3, 1, [{ k: 2 }])}From 0 to 1 there are 3 equal parts. The dot is 2 jumps from 0, so it is at <b>${FR(2, 3)}</b>.`),
    make(rng) {
      const kind = rng.pick(['read', 'read', 'find']);
      const d = kind === 'find' ? rng.pick([3, 4, 6, 8]) : rng.pick([2, 3, 4, 6, 8]);
      const wholes = d === 3 && kind === 'find' ? 2 : d <= 4 && rng.chance(0.3) ? 2 : 1, D = d * wholes;
      let k; do { k = rng.int(1, D - 1); } while (k % d === 0);
      const hint1 = `From 0 to 1 the line is split into ${d} equal parts, so each jump is ${F(1, d)}.`;
      if (kind === 'read') {
        const answer = FR(k, d);
        const choices = [answer].concat(distinct(answer, (wholes === 2 ? [FR(k, D)] : []).concat([FR(k, d + 1), FR(k + 1, d), FR(D - k, d), FR(k - 1 || k + 2, d)]), 3));
        return { prompt: `What fraction does the dot show?${numberLine(d, wholes, [{ k }])}`, type: 'choice', answer, choices, params: { kind, k, d, wholes },
          hints: [hint1, `Count the jumps from 0 to the dot. There ${k === 1 ? 'is 1 jump' : `are ${k} jumps`}.`, `${k} ${k === 1 ? 'jump' : 'jumps'} of ${F(1, d)} is <b>${k}/${d}</b>.`] };
      }
      const others = rng.sample(Array.from({ length: D - 1 }, (_, i) => i + 1).filter(x => x !== k && x % d !== 0), 3);
      const ks = [k].concat(others).sort((x, y) => x - y), letters = ['A', 'B', 'C', 'D'];
      const answer = letters[ks.indexOf(k)];
      return { prompt: `Which point is at ${FR(k, d)}?${numberLine(d, wholes, ks.map((x, i) => ({ k: x, label: letters[i] })))}`, type: 'choice', answer, choices: letters.slice(0, ks.length), keepOrder: true, params: { kind, k, d, wholes },
        hints: [hint1, `${FR(k, d)} means ${k} jumps of ${F(1, d)}. Start at 0 and count ${k} jumps.`, `Point <b>${answer}</b> is at ${k}/${d}.`] };
    },
    verify(q) {
      const { kind, k, d, wholes } = q.params, step = (NL.x1 - NL.x0) / wholes;      // pixels from 0 to 1
      const cxOf = label => Number((q.prompt.match(new RegExp(`cx="([\\d.]+)"[^>]*data-label="${label}"`)) || [])[1]);
      if (kind === 'read') { const [a, b] = fracParts(q.answer); return b === d && Math.abs(a / b - (cxOf('') - NL.x0) / step) < 0.01; }
      return Math.abs((cxOf(q.answer) - NL.x0) / step - k / d) < 0.01;
    },
  });

  /* ---------- Unit 6: Equivalent fractions and comparing fractions ---------- */
  A.skill({
    id: 'g3.equivalent-fractions', title: 'Equivalent fractions',
    learn: p(`<b>Equivalent fractions</b> are the same size, even though they use different numbers. ${F(1, 2)} of a bar is the same amount as ${FR(2, 4)} of the same bar.`) +
      p(`If you cut every part into 2 smaller parts, you get <b>twice as many parts on top and twice as many on the bottom</b>. So you can multiply the top and the bottom by the same number. A whole number can be a fraction too: 1 = ${FR(4, 4)} and 2 = ${FR(6, 3)}.`) +
      example('Example', `${fracBar(3, [0, 1])}${fracBar(6, [0, 1, 2, 3])}${FR(2, 3)} and ${FR(4, 6)} cover the same amount of the bar. <b>${FR(2, 3)} = ${FR(4, 6)}</b>.`),
    make(rng) {
      const kind = rng.pick(['up', 'up', 'down', 'choice', 'whole']);
      const b = rng.pick([2, 2, 3, 4]), m = b === 2 ? rng.int(2, 4) : 2, a = rng.int(1, b - 1), B = b * m, Aa = a * m;
      if (kind === 'whole') {
        const w = rng.int(1, 3), d = rng.pick([2, 3, 4, 6, 8]), flip = rng.bool();
        if (flip) return { prompt: `Fill in the missing number.${big(`${w} = ${F('?', d)}`)}`, type: 'number', answer: w * d, params: { kind, w, d, flip },
          hints: [`One whole cut into ${d} equal parts is ${d} parts: 1 = ${FR(d, d)}.`, w > 1 ? `${w} wholes is ${w} groups of ${d} parts: ${w} × ${d}.` : `So 1 whole is ${d} parts.`, `${w} = <b>${w * d}/${d}</b>.`] };
        return { prompt: `What whole number is this fraction equal to?${big(`${FR(w * d, d)} = ?`)}`, type: 'number', answer: w, params: { kind, w, d, flip },
          hints: [`Every ${d} parts make 1 whole.`, `How many groups of ${d} are in ${w * d}? ${w * d} ÷ ${d}.`, `${w * d}/${d} = <b>${w}</b>.`] };
      }
      if (kind === 'choice') {
        const answer = FR(Aa, B);
        const choices = [answer].concat(distinct(answer, [FR(a + 1, b + 1), FR(a, B), FR(Aa, b), FR(Aa + 1, B)], 3));
        return { prompt: `Which fraction is equal to ${FR(a, b)}?`, type: 'choice', answer, choices, params: { kind, a, b },
          hints: [`Multiply the top and the bottom by the same number.`, `Try ${m}: ${a} × ${m} = ${Aa} and ${b} × ${m} = ${B}.`, `<b>${a}/${b} = ${Aa}/${B}</b>.`] };
      }
      if (kind === 'down') return { prompt: `Fill in the missing number.${big(`${FR(Aa, B)} = ${F('?', b)}`)}`, type: 'number', answer: a, params: { kind, a, b, m },
        hints: [`The bottom went from ${B} to ${b}. That is dividing by ${m}.`, `Do the same to the top: ${Aa} ÷ ${m}.`, `${Aa}/${B} = <b>${a}/${b}</b>. The missing number is <b>${a}</b>.`] };
      const pic = rng.bool() ? fracBar(b, Array.from({ length: a }, (_, i) => i)) + fracBar(B, []) : '';
      return { prompt: `Fill in the missing number.${big(`${FR(a, b)} = ${F('?', B)}`)}${pic}`, type: 'number', answer: Aa, params: { kind, a, b, m },
        hints: [`The bottom went from ${b} to ${B}. That is multiplying by ${m}.`, `Do the same to the top: ${a} × ${m}.`, `${a}/${b} = <b>${Aa}/${B}</b>. The missing number is <b>${Aa}</b>.`] };
    },
    verify(q) {
      const pr = q.params, v = q.answer;
      if (pr.kind === 'whole') return pr.flip ? v / pr.d === pr.w : v * pr.d === pr.w * pr.d;
      if (pr.kind === 'choice') { const [x, y] = fracParts(q.answer); return x * pr.b === y * pr.a && y !== pr.b; }
      if (pr.kind === 'down') return pr.a * pr.m * pr.b === v * pr.b * pr.m;
      return v * pr.b === pr.a * pr.b * pr.m;
    },
  });

  A.skill({
    id: 'g3.compare-fractions', title: 'Compare fractions',
    learn: p('<b>Same bottom number:</b> the parts are the same size, so <b>the bigger top number is the bigger fraction</b>. 5/8 is more than 3/8, because 5 pieces is more than 3 of the same pieces.') +
      p('<b>Same top number:</b> you have the same number of pieces, so look at the size of the pieces. <b>The bigger the bottom number, the smaller each piece.</b> 1/3 is more than 1/6, because thirds are bigger than sixths.') +
      example('Example', `${big(`${FR(2, 4)} ? ${FR(2, 8)}`)}The tops are the same. Fourths are bigger than eighths, so <b>${FR(2, 4)} &gt; ${FR(2, 8)}</b>.`),
    make(rng) {
      const kind = rng.pick(['same-den', 'same-num', 'story']);
      const same = rng.chance(kind === 'story' ? 0.1 : 0.15);
      let a, b, c, d;
      const mode = kind === 'story' ? rng.pick(['same-den', 'same-num']) : kind;
      if (mode === 'same-den') { b = d = rng.pick([3, 4, 6, 8]); a = rng.int(1, b); c = same ? a : rng.int(1, b); if (c === a && !same) c = a === 1 ? 2 : a - 1; }
      else { [b, d] = rng.sample([2, 3, 4, 6, 8], 2); if (same) d = b; a = c = rng.int(1, Math.min(b, d) - 1); }
      const sign = a * d === c * b ? '=' : a * d > c * b ? '&gt;' : '&lt;';
      const why = mode === 'same-den' ? `The bottom numbers are both ${b}, so the pieces are the same size. Compare the tops: ${a} and ${c}.`
        : b === d ? `The fractions are exactly the same.` : `The top numbers are both ${a}. Now compare the pieces: ${b === 2 ? 'halves' : b === 3 ? 'thirds' : b + 'ths'} and ${d === 2 ? 'halves' : d === 3 ? 'thirds' : d + 'ths'}. The bigger the bottom number, the smaller the piece.`;
      if (kind === 'story') {
        const [n1, n2] = rng.sample(NAMES, 2), food = rng.pick(['sandwich', 'pizza', 'cake', 'pie']);
        const answer = sign === '=' ? 'They ate the same' : sign === '&gt;' ? n1 : n2;
        return { prompt: `${n1} ate ${FR(a, b)} of a ${food}. ${n2} ate ${FR(c, d)} of a ${food} that is the same size. Who ate more?`, type: 'choice', answer, choices: [n1, n2, 'They ate the same'], keepOrder: true, params: { kind, a, b, c, d, n1, n2 },
          hints: [why, `${a}/${b} ${sign} ${c}/${d}.`, `<b>${answer}</b>${sign === '=' ? '' : ' ate more'}.`] };
      }
      return { prompt: `Choose the sign that makes this true.${big(`${FR(a, b)} &nbsp;?&nbsp; ${FR(c, d)}`)}`, type: 'choice', answer: sign, choices: ['&lt;', '=', '&gt;'], keepOrder: true, params: { kind, a, b, c, d },
        hints: [why, sign === '=' ? 'They are the same amount.' : `${a}/${b} is ${sign === '&gt;' ? 'more' : 'less'} than ${c}/${d}.`, `<b>${a}/${b} ${sign} ${c}/${d}</b>.`] };
    },
    verify(q) {
      const { kind, a, b, c, d, n1, n2 } = q.params, diff = a / b - c / d;
      const want = Math.abs(diff) < 1e-12 ? 0 : Math.sign(diff);
      if (kind === 'story') return q.answer === (want === 0 ? 'They ate the same' : want > 0 ? n1 : n2);
      return q.answer === (want === 0 ? '=' : want > 0 ? '&gt;' : '&lt;');
    },
  });

  /* ---------- Unit 7: More with multiplication and division ---------- */
  A.skill({
    id: 'g3.mult-multiples-10', title: 'Multiply by multiples of 10',
    learn: p('Numbers like 20, 30 and 70 are <b>multiples of 10</b>. 40 is the same as 4 tens.') +
      p('<b>To multiply by a multiple of 10, multiply the tens, then write a 0 at the end.</b> For 3 × 40, think 3 × 4 tens = 12 tens, and 12 tens is 120.') +
      example('Example', `${big('6 × 50 = ?')}6 × 5 = 30, so 6 × 5 tens = 30 tens. 30 tens is <b>300</b>.`),
    make(rng) {
      const kind = rng.pick(['a-t', 't-a', 'missing', 'story']);
      const a = rng.int(2, 9), tens = rng.int(2, 9), t = tens * 10, ans = a * t;
      const hints = [`${t} is ${tens} tens.`, `${a} × ${tens} = ${a * tens}, so ${a} × ${tens} tens = ${a * tens} tens.`, `${a * tens} tens is <b>${ans}</b>.`];
      if (kind === 'a-t') return { prompt: `Multiply.${big(`${a} × ${t} = ?`)}`, type: 'number', answer: ans, params: { kind, a, t }, hints };
      if (kind === 't-a') return { prompt: `Multiply.${big(`${t} × ${a} = ?`)}`, type: 'number', answer: ans, params: { kind, a, t }, hints };
      if (kind === 'missing') return { prompt: `Fill in the missing number.${big(`${a} × ? = ${ans}`)}`, type: 'number', answer: t, params: { kind, a, t },
        hints: [`${ans} is ${ans / 10} tens.`, `${a} × ? tens = ${ans / 10} tens. Since ${a} × ${tens} = ${ans / 10}, that is ${tens} tens.`, `The missing number is <b>${t}</b>.`] };
      const name = rng.pick(NAMES);
      const prompt = rng.pick([`Each box holds ${t} crayons. How many crayons are in ${a} boxes?`, `${name} rides a bike for ${t} minutes a day for ${a} days. How many minutes is that in all?`, `${name} saves ${t} cents each week for ${a} weeks. How many cents does ${name} save?`]);
      return { prompt, type: 'number', answer: ans, params: { kind, a, t }, hints };
    },
    verify(q) { const { kind, a, t } = q.params; if (kind === 'missing') { let s = 0; for (let i = 0; i < a; i++) s += q.answer; return s === a * t && q.answer % 10 === 0; } let s = 0; for (let i = 0; i < a; i++) s += t; return q.answer === s; },
  });

  A.skill({
    id: 'g3.arithmetic-patterns', title: 'Patterns in arithmetic',
    learn: p('In a number pattern, the numbers change by following a <b>rule</b>. To find the rule, look at how much you go up or down from one number to the next.') +
      p('<b>Find the rule, then use it to find the next number.</b> In 3, 7, 11, 15 each number is 4 more than the one before, so the rule is "add 4" and the next number is 19. A table can have a rule too, like "Out is In × 3".') +
      example('Example', `${big('40, 35, 30, 25, ?')}Each number is 5 less than the one before. The rule is "subtract 5". 25 − 5 = <b>20</b>.`),
    make(rng) {
      const kind = rng.pick(['next', 'missing', 'rule', 'table']);
      if (kind === 'table') {
        const k = rng.int(2, 9), x = rng.int(5, 10);
        const rows = [1, 2, 3, 4].map(i => [i, i * k]).concat([[x, '?']]);
        return { prompt: `The table follows a rule. What number goes where the ? is?${M.table(['In', 'Out'], rows)}`, type: 'number', answer: x * k, params: { kind, k, x },
          hints: [`Look at each row. 1 → ${k}, 2 → ${2 * k}, 3 → ${3 * k}.`, `The rule is "Out is In × ${k}".`, `${x} × ${k} = <b>${x * k}</b>.`] };
      }
      const k = rng.int(2, 10), down = rng.chance(0.3);
      const start = down ? k * 5 + rng.int(0, 20) : rng.int(1, 30);
      const terms = Array.from({ length: 5 }, (_, i) => start + (down ? -k : k) * i);
      const ruleTxt = (down ? 'Subtract ' : 'Add ') + k;
      if (kind === 'rule') {
        const answer = ruleTxt, other = down ? 'Add ' : 'Subtract ';
        return { prompt: `What is the rule for this pattern?${big(terms.slice(0, 4).join(', '))}`, type: 'choice', answer, choices: [answer, other + k, (down ? 'Subtract ' : 'Add ') + (k + 1), (down ? 'Subtract ' : 'Add ') + (k - 1)], params: { kind, terms: terms.slice(0, 4) },
          hints: [`Look from one number to the next: ${terms[0]} to ${terms[1]}.`, `The numbers go ${down ? 'down' : 'up'} by ${k} each time.`, `The rule is <b>${answer}</b>.`] };
      }
      const gap = kind === 'next' ? 4 : rng.int(1, 3);
      const shown = terms.map((t, i) => (i === gap ? '?' : t));
      const prev = gap > 0 ? terms[gap - 1] : null;
      return { prompt: `${kind === 'next' ? 'What number comes next?' : 'What number is missing?'}${big(shown.join(', '))}`, type: 'number', answer: terms[gap], params: { kind, shown },
        hints: [`Find the rule. From ${terms[0]} to ${terms[1]} is ${down ? 'down' : 'up'} ${k}.`, `The rule is "${ruleTxt.toLowerCase()}". ${prev} ${down ? '−' : '+'} ${k} = ${terms[gap]}.`, `The ${kind === 'next' ? 'next' : 'missing'} number is <b>${terms[gap]}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'table') return q.answer / pr.x === pr.k;
      if (pr.kind === 'rule') { const [w, n] = q.answer.split(' '); const step = (w === 'Add' ? 1 : -1) * Number(n); return pr.terms.every((t, i) => i === 0 || t - pr.terms[i - 1] === step); }
      const seq = pr.shown.map(t => (t === '?' ? q.answer : t));
      return seq.every((t, i) => i < 2 || t - seq[i - 1] === seq[1] - seq[0]) && seq[1] !== seq[0];
    },
  });

  /* ---------- Unit 8: Area and perimeter ---------- */
  const CELL = 26;
  /** a grid of squares; `on(x, y)` says which ones are shaded */
  function gridPic(cols, rows, on) {
    let s = '', t = '';
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const r = `<rect x="${6 + x * CELL}" y="${6 + y * CELL}" width="${CELL}" height="${CELL}" `;
      if (on(x, y)) t += r + `class="fill"${SHADE}/>`; else s += r + 'class="stroke light"/>';
    }
    s += t;
    return `<svg class="figure" viewBox="0 0 ${12 + cols * CELL} ${12 + rows * CELL}" width="${12 + cols * CELL}" height="${12 + rows * CELL}" role="img" aria-label="shaded squares on a grid">${s}</svg>`;
  }
  /** a rectangle with its width and height written beside it */
  function rectPic(w, h, u) {
    const k = Math.min(220 / w, 130 / h, 26), W = r2(w * k), H = r2(h * k);
    return `<svg class="figure" viewBox="0 0 ${W + 110} ${H + 50}" width="${W + 110}" height="${H + 50}" role="img" aria-label="a rectangle ${w} by ${h}">` +
      `<rect x="20" y="30" width="${W}" height="${H}" class="fill"/>` +
      `<text x="${r2(20 + W / 2)}" y="22" text-anchor="middle" font-size="15">${w} ${u}</text>` +
      `<text x="${r2(28 + W)}" y="${r2(35 + H / 2)}" font-size="15">${h} ${u}</text></svg>`;
  }
  const UNITS = ['cm', 'm', 'in', 'ft'];
  const UNAME = { cm: 'centimeters', m: 'meters', in: 'inches', ft: 'feet' };
  A.skill({
    id: 'g3.area', title: 'Area',
    learn: p('<b>Area</b> is how much space a flat shape covers. We measure it in <b>square units</b>: little squares that are 1 unit on each side.') +
      p('You can count the squares one by one. For a rectangle there is a faster way: <b>area = length × width</b>, because the squares make an array. If a shape is not a rectangle, split it into rectangles and add their areas.') +
      example('Example', `${gridPic(5, 3, () => true)}There are 3 rows of 5 squares. 3 × 5 = 15, so the area is <b>15 square units</b>.`),
    make(rng) {
      const kind = rng.pick(['count', 'lshape', 'sides', 'sides', 'missing']);
      const w = rng.int(2, 8), h = rng.int(2, 6);
      if (kind === 'count') return { prompt: `Each small square is 1 square unit. What is the area of the shaded rectangle?${gridPic(w + 2, h + 1, (x, y) => x >= 1 && x <= w && y < h)}`, type: 'number', answer: w * h, unit: 'square units', params: { kind },
        hints: [`Count the squares in one row: ${w}. Count the rows: ${h}.`, `${h} rows of ${w} is ${h} × ${w}.`, `${h} × ${w} = <b>${w * h} square units</b>.`] };
      if (kind === 'lshape') {
        const W = Math.max(w, 3), H = Math.max(h, 3), cw = rng.int(1, W - 1), ch = rng.int(1, H - 1);
        const ans = W * H - cw * ch;
        return { prompt: `Each small square is 1 square unit. What is the area of the shaded shape?${gridPic(W + 1, H, (x, y) => x < W && !(x >= W - cw && y >= H - ch))}`, type: 'number', answer: ans, unit: 'square units', params: { kind },
          hints: [`Split the shape into two rectangles: a top part and a bottom part.`, `Top: ${H - ch} ${H - ch === 1 ? 'row' : 'rows'} of ${W} is ${(H - ch) * W}. Bottom: ${ch} ${ch === 1 ? 'row' : 'rows'} of ${W - cw} is ${ch * (W - cw)}.`, `${(H - ch) * W} + ${ch * (W - cw)} = <b>${ans} square units</b>.`] };
      }
      const u = rng.pick(UNITS), L = rng.int(2, 10), Wd = rng.int(2, 9);
      if (kind === 'sides') return { prompt: `What is the area of this rectangle?${rectPic(L, Wd, u)}`, type: 'number', answer: L * Wd, unit: 'sq ' + u, params: { kind, L, Wd },
        hints: [`Area of a rectangle = length × width.`, `${L} × ${Wd} = ${L * Wd}.`, `The area is <b>${L * Wd} square ${UNAME[u]}</b>.`] };
      const name = rng.pick(NAMES);
      return { prompt: `${name} has a rectangle rug with an area of ${L * Wd} square ${UNAME[u]}. One side is ${L} ${UNAME[u]} long. How long is the other side?`, type: 'number', answer: Wd, unit: u, params: { kind, L, Wd },
        hints: [`Length × width = area, so ${L} × ? = ${L * Wd}.`, `${L * Wd} ÷ ${L} = ${Wd}.`, `The other side is <b>${Wd} ${UNAME[u]}</b>.`] };
    },
    verify(q) {
      const { kind, L, Wd } = q.params;
      if (kind === 'count' || kind === 'lshape') return q.answer === countOf(q.prompt, 'class="fill"');
      if (kind === 'missing') return q.answer * L === L * Wd;
      let s = 0; for (let i = 0; i < Wd; i++) s += L; return q.answer === s;
    },
  });

  A.skill({
    id: 'g3.perimeter', title: 'Perimeter',
    learn: p('<b>Perimeter</b> is the distance all the way around a shape. Imagine an ant walking along every edge and back to the start.') +
      p('<b>To find the perimeter, add up the lengths of all the sides.</b> A rectangle has two pairs of equal sides, so you add length + width + length + width. A square has 4 equal sides. If one side is missing, take the other sides away from the perimeter.') +
      example('Example', `${rectPic(6, 3, 'cm')}6 + 3 + 6 + 3 = 18, so the perimeter is <b>18 cm</b>.`),
    make(rng) {
      const kind = rng.pick(['rect', 'square', 'poly', 'missing']);
      const u = rng.pick(UNITS);
      if (kind === 'rect') {
        const L = rng.int(3, 12); let W = rng.int(2, 9); if (W === L) W = L - 1;
        return { prompt: `What is the perimeter of this rectangle?${rectPic(L, W, u)}`, type: 'number', answer: 2 * (L + W), unit: u, params: { kind, sides: [L, W, L, W] },
          hints: [`Opposite sides of a rectangle are the same length. The sides are ${L}, ${W}, ${L}, and ${W}.`, `Add them all: ${L} + ${W} + ${L} + ${W}.`, `The perimeter is <b>${2 * (L + W)} ${u}</b>.`] };
      }
      if (kind === 'square') {
        const a = rng.int(2, 12), name = rng.pick(NAMES);
        return { prompt: `${name} makes a square garden. Each side is ${a} ${u} long. What is the perimeter of the garden?`, type: 'number', answer: 4 * a, unit: u, params: { kind, sides: [a, a, a, a] },
          hints: [`A square has 4 sides, all ${a} ${u} long.`, `${a} + ${a} + ${a} + ${a}, or 4 × ${a}.`, `The perimeter is <b>${4 * a} ${u}</b>.`] };
      }
      const n = rng.int(3, 6), sides = Array.from({ length: n }, () => rng.int(2, 12));
      const shape = { 3: 'triangle', 4: 'shape with 4 sides', 5: 'shape with 5 sides', 6: 'shape with 6 sides' }[n];
      const total = sides.reduce((x, y) => x + y, 0);
      if (kind === 'poly') return { prompt: `A ${shape} has sides that are ${M.list(sides.map(x => `${x} ${u}`))} long. What is its perimeter?`, type: 'number', answer: total, unit: u, params: { kind, sides },
        hints: [`Perimeter means adding every side.`, `${sides.join(' + ')} = ${total}.`, `The perimeter is <b>${total} ${u}</b>.`] };
      const known = sides.slice(0, -1), miss = sides[n - 1], part = total - miss;
      return { prompt: `A ${shape} has a perimeter of ${total} ${u}. ${n - 1 === 2 ? 'Two' : n - 1 === 3 ? 'Three' : n - 1 === 4 ? 'Four' : 'Five'} of its sides are ${M.list(known.map(x => `${x} ${u}`))}. How long is the last side?`, type: 'number', answer: miss, unit: u, params: { kind, sides: known, total },
        hints: [`Add the sides you know: ${known.join(' + ')} = ${part}.`, `The last side is what is left of the perimeter: ${total} − ${part}.`, `The last side is <b>${miss} ${u}</b>.`] };
    },
    verify(q) {
      const { kind, sides, total } = q.params;
      let s = 0; sides.forEach(x => { s += x; });
      return kind === 'missing' ? s + q.answer === total : q.answer === s;
    },
  });

  /* ---------- Unit 9: Time, measurement, and data ---------- */
  function clockPic(h, m) {
    const at = (deg, r) => { const a = deg * Math.PI / 180; return [r2(100 + r * Math.sin(a)), r2(100 - r * Math.cos(a))]; };
    let s = `<circle cx="100" cy="100" r="92" class="stroke"/>`;
    for (let i = 0; i < 60; i++) { const [x1, y1] = at(i * 6, i % 5 ? 86 : 80), [x2, y2] = at(i * 6, 91); s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="stroke"${i % 5 ? ' style="stroke-width:1"' : ''}/>`; }
    for (let k = 1; k <= 12; k++) { const [x, y] = at(k * 30, 64); s += `<text x="${x}" y="${r2(y + 6)}" text-anchor="middle" font-size="17">${k}</text>`; }
    const [hx, hy] = at(((h % 12) + m / 60) * 30, 44), [mx, my] = at(m * 6, 76);
    s += `<line x1="100" y1="100" x2="${hx}" y2="${hy}" style="stroke:var(--ink);stroke-width:6;stroke-linecap:round" data-hand="h"/>`;
    s += `<line x1="100" y1="100" x2="${mx}" y2="${my}" style="stroke:var(--primary);stroke-width:3.5;stroke-linecap:round" data-hand="m"/>`;
    s += `<circle cx="100" cy="100" r="5" style="fill:var(--ink)"/>`;
    return `<svg class="figure" viewBox="0 0 200 200" width="200" height="200" role="img" aria-label="a clock">${s}</svg>`;
  }
  const fmt = t => { const h = Math.floor(t / 60) % 12 || 12; return `${h}:${pad(t % 60)}`; };   // minutes after midnight → "3:05"
  const toMin = str => { const [h, m] = str.split(':').map(Number); return (h % 12) * 60 + m; };
  A.skill({
    id: 'g3.time', title: 'Time to the minute and elapsed time',
    learn: p('The <b>short hand</b> points to the hour. The <b>long hand</b> points to the minutes. Each number on the clock is 5 minutes for the long hand, and each little mark is 1 minute.') +
      p('To read the minutes, <b>count by 5s to the last number the long hand passed, then count on by 1s.</b> <b>Elapsed time</b> is how much time goes by. Jump to the next hour first, then add the rest of the minutes.') +
      example('Example', `${clockPic(2, 37)}The short hand is past the 2. The long hand is 2 marks past the 7: 7 fives is 35, plus 2 is 37. The time is <b>2:37</b>.`),
    make(rng) {
      const kind = rng.pick(['read', 'read', 'end', 'between']);
      const name = rng.pick(NAMES);
      if (kind === 'read') {
        const h = rng.int(1, 12); let m = rng.int(1, 59); if (m % 5 === 0) m += rng.int(1, 4);
        const answer = `${h}:${pad(m)}`, near = Math.floor(m / 5);
        const wrongHour = m >= 30 ? h % 12 + 1 : (h + 10) % 12 + 1;
        const choices = [answer].concat(distinct(answer, [`${wrongHour}:${pad(m)}`, `${h}:${pad(near)}`, `${near || 12}:${pad((h % 12) * 5)}`, `${h}:${pad((m + 5) % 60)}`], 3));
        return { prompt: `What time does the clock show?${clockPic(h, m)}`, type: 'choice', answer, choices, params: { kind, h, m },
          hints: [`The short hand is between ${h} and ${h % 12 + 1}, so the hour is ${h}.`, near === 0 ? `The long hand is just past the 12. Count the little marks after the 12: ${m}.` : `The long hand has passed the ${near}. Count by 5s: ${near * 5} minutes. Then count the little marks: ${m - near * 5} more.`, `${near ? `${near * 5} + ${m - near * 5} = ${m}. ` : ''}The time is <b>${answer}</b>.`] };
      }
      const h = rng.int(1, 9), sm = rng.int(0, 11) * 5, start = h * 60 + sm;
      if (kind === 'end') {
        const dur = rng.pick([10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 65, 75, 80]), end = start + dur;
        const durTxt = dur < 60 ? `${dur} minutes` : `1 hour and ${dur - 60} minutes`;
        const answer = fmt(end), act = rng.pick(['reading', 'soccer practice', 'baking cookies', 'a piano lesson']);
        const choices = [answer].concat(distinct(answer, [fmt(h * 60 + (sm + dur) % 60), fmt(end + 10), fmt(end - 10), fmt(end + 60)], 3));
        const toNext = 60 - sm;
        return { prompt: `${name} starts ${act} at ${fmt(start)}. It lasts ${durTxt}. What time does it end?`, type: 'choice', answer, choices, params: { kind, start, dur },
          hints: [dur >= toNext ? `From ${fmt(start)} to ${fmt(start + toNext)} is ${toNext} minutes.` : `${sm} + ${dur} = ${sm + dur}, which is still less than 60, so the hour stays ${h}.`, dur >= toNext ? `That leaves ${dur - toNext} more minutes after ${fmt(start + toNext)}.` : `Count on ${dur} minutes from ${fmt(start)}.`, `It ends at <b>${answer}</b>.`] };
      }
      const dur = rng.int(3, 18) * 5 + rng.pick([0, 0, 1, 2, 3, 4]), end = start + dur;
      const toNext = 60 - sm, cross = dur > toNext || (sm === 0 && dur >= 60);
      const act = rng.pick(['A movie', 'A swim class', 'A school play', 'A car trip']);
      return { prompt: `${act} starts at ${fmt(start)} and ends at ${fmt(end)}. How many minutes long is it?`, type: 'number', answer: dur, unit: 'minutes', params: { kind, from: fmt(start), to: fmt(end) },
        hints: cross && sm ? [`Jump to the next hour: from ${fmt(start)} to ${fmt(start + toNext)} is ${toNext} minutes.`, `From ${fmt(start + toNext)} to ${fmt(end)} is ${dur - toNext} minutes.`, `${toNext} + ${dur - toNext} = <b>${dur} minutes</b>.`]
          : [`Count the minutes from ${fmt(start)} to ${fmt(end)}.`, Math.floor(end / 60) === h ? `${end % 60} − ${sm} = ${dur}.` : `From ${fmt(start)} to ${fmt(start + 60)} is 60 minutes, then ${dur - 60} more minutes to ${fmt(end)}.`, `It lasts <b>${dur} minutes</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'read') {
        const hand = k => { const mt = q.prompt.match(new RegExp(`x2="([\\d.]+)" y2="([\\d.]+)"[^>]*data-hand="${k}"`)); return (Math.atan2(Number(mt[1]) - 100, 100 - Number(mt[2])) * 180 / Math.PI + 360) % 360; };
        const min = Math.round(hand('m') / 6) % 60, hr = Math.round((hand('h') - min * 0.5) / 30) % 12 || 12;
        return q.answer === `${hr}:${pad(min)}`;
      }
      if (pr.kind === 'end') return toMin(q.answer) - pr.start % 720 === pr.dur;
      return toMin(pr.to) - toMin(pr.from) === q.answer;
    },
  });

  const UNIT_ITEMS = [
    ['a paper clip', 'grams'], ['a strawberry', 'grams'], ['a pencil', 'grams'], ['a leaf', 'grams'],
    ['a dog', 'kilograms'], ['a bicycle', 'kilograms'], ['a bag of potatoes', 'kilograms'], ['a grown-up', 'kilograms'],
    ['the water in a bathtub', 'liters'], ['the juice in a big jug', 'liters'], ['the water in a fish tank', 'liters'], ['the milk in a carton', 'liters'],
  ];
  A.skill({
    id: 'g3.mass-volume', title: 'Mass and volume word problems',
    learn: p('<b>Mass</b> is how heavy something is. Light things are measured in <b>grams (g)</b>; a paper clip is about 1 gram. Heavy things are measured in <b>kilograms (kg)</b>; a big book is about 1 kilogram.') +
      p('<b>Liquid volume</b> is how much liquid a container holds. We measure it in <b>liters (L)</b>; a big water bottle holds about 1 liter. In word problems, <b>add</b> to put amounts together, <b>subtract</b> to take away or compare, <b>multiply</b> for equal groups, and <b>divide</b> to share equally.') +
      example('Example', `${big('3 buckets each hold 8 liters.')}These are equal groups, so multiply: 3 × 8 = 24. Together they hold <b>24 liters</b>.`),
    make(rng) {
      const kind = rng.pick(['add', 'sub', 'mult', 'div', 'unit']);
      const name = rng.pick(NAMES);
      if (kind === 'unit') {
        const [item, answer] = rng.pick(UNIT_ITEMS);
        return { prompt: `Which unit is best for measuring the ${answer === 'liters' ? 'amount of' : 'mass of'} ${item}?`, type: 'choice', answer, choices: ['grams', 'kilograms', 'liters'], keepOrder: true, params: { kind, item },
          hints: [answer === 'liters' ? `This is a liquid, so we measure how much it holds.` : `This is about how heavy something is, so use grams or kilograms.`, answer === 'liters' ? `Liquids are measured in liters.` : answer === 'grams' ? `It is light, so a small unit fits.` : `It is heavy, so a big unit fits.`, `Use <b>${answer}</b>.`] };
      }
      if (kind === 'add') {
        const g = rng.bool(), x = g ? rng.int(12, 60) * 10 : rng.int(3, 9), y = g ? rng.int(10, 39) * 10 : rng.int(10, 25), u = g ? 'g' : 'kg', w = g ? 'grams' : 'kilograms';
        const prompt = g ? `A box of crackers has a mass of ${x} grams. A jar of jam has a mass of ${y} grams. What is their total mass?` : `${name}'s backpack has a mass of ${x} kilograms. ${name}'s suitcase has a mass of ${y} kilograms. What is the total mass?`;
        return { prompt, type: 'number', answer: x + y, unit: u, params: { kind, x, y }, hints: [`Put the two masses together, so add.`, `${x} + ${y} = ${x + y}.`, `The total is <b>${x + y} ${w}</b>.`] };
      }
      if (kind === 'sub') {
        const tank = rng.bool(), x = tank ? rng.int(20, 90) : rng.int(10, 40), y = tank ? rng.int(5, x - 5) : rng.int(2, 8);
        const prompt = tank ? `A tank holds ${x} liters of water. ${name} uses ${y} liters to water the plants. How many liters are left?` : `A dog has a mass of ${x} kilograms. A cat has a mass of ${y} kilograms. How many more kilograms is the dog than the cat?`;
        return { prompt, type: 'number', answer: x - y, unit: tank ? 'L' : 'kg', params: { kind, x, y },
          hints: [tank ? `Some water is taken away, so subtract.` : `"How many more" means compare, so subtract.`, `${x} − ${y} = ${x - y}.`, `The answer is <b>${x - y} ${tank ? 'liters' : 'kilograms'}</b>.`] };
      }
      const x = rng.int(2, 9), y = rng.int(2, 9);
      const liq = rng.bool(), u = liq ? 'L' : 'kg', w = liq ? 'liters' : 'kilograms';
      if (kind === 'mult') return { prompt: liq ? `Each bottle holds ${y} liters of juice. How many liters do ${x} bottles hold?` : `Each bag of sand has a mass of ${y} kilograms. What is the mass of ${x} bags?`, type: 'number', answer: x * y, unit: u, params: { kind, x, y },
        hints: [`These are equal groups, so multiply.`, `${x} × ${y} = ${x * y}.`, `The answer is <b>${x * y} ${w}</b>.`] };
      return { prompt: liq ? `${name} has ${x * y} liters of water to pour equally into ${x} buckets. How many liters go in each bucket?` : `${x * y} kilograms of rice are shared equally into ${x} bags. How many kilograms are in each bag?`, type: 'number', answer: y, unit: u, params: { kind, x, y },
        hints: [`Sharing equally means divide.`, `${x * y} ÷ ${x} = ${y}, because ${x} × ${y} = ${x * y}.`, `The answer is <b>${y} ${w}</b>.`] };
    },
    verify(q) {
      const { kind, x, y, item } = q.params, v = q.answer;
      if (kind === 'unit') { const liquid = /water|juice|milk/.test(item), heavy = /dog|bicycle|potatoes|grown/.test(item); return v === (liquid ? 'liters' : heavy ? 'kilograms' : 'grams'); }
      if (kind === 'add') return v - y === x;
      if (kind === 'sub') return v + y === x && v > 0;
      if (kind === 'mult') return v / x === y;
      return v * x === x * y;
    },
  });

  const BAR_THEMES = [
    { title: 'Favorite fruit', cats: ['Apples', 'Bananas', 'Grapes', 'Pears'] },
    { title: 'Favorite color', cats: ['Red', 'Blue', 'Green', 'Yellow'] },
    { title: 'Favorite sport', cats: ['Soccer', 'Swim', 'Tennis', 'Biking'] },
    { title: 'Favorite pet', cats: ['Dogs', 'Cats', 'Fish', 'Birds'] },
  ];
  function barPic(cats, vals, scale, top) {
    const px = 220 / top, Y = 235;
    let s = `<line x1="44" y1="${Y}" x2="312" y2="${Y}" class="stroke"/><line x1="44" y1="10" x2="44" y2="${Y}" class="stroke"/>`;
    for (let v = scale; v <= top; v += scale) s += `<line x1="44" y1="${r2(Y - v * px)}" x2="312" y2="${r2(Y - v * px)}" class="stroke light" style="stroke-width:1"/>`;
    for (let v = 0; v <= top; v += scale) s += `<text x="38" y="${r2(Y + 5 - v * px)}" text-anchor="end" font-size="13">${v}</text>`;
    cats.forEach((c, i) => {
      const x = 58 + i * 64;
      s += `<rect x="${x}" y="${r2(Y - vals[i] * px)}" width="40" height="${r2(vals[i] * px)}" class="fill" data-px="${px}"/>`;
      s += `<text x="${x + 20}" y="${Y + 20}" text-anchor="middle" font-size="13">${c}</text>`;
    });
    return `<svg class="figure" viewBox="0 0 320 265" width="320" height="265" role="img" aria-label="a bar graph">${s}</svg>`;
  }
  const PLOT_THEMES = [
    { title: 'Lengths of our pencils (inches)', lo: 3, unit: 'inches long', item: 'pencils' },
    { title: 'Books read this week', lo: 0, unit: 'books', item: 'students who read' },
    { title: 'Pets at home', lo: 0, unit: 'pets', item: 'students with' },
  ];
  function plotPic(lo, counts) {
    const n = counts.length, gap = 280 / (n - 1);
    let s = `<line x1="12" y1="160" x2="308" y2="160" class="stroke"/>`;
    counts.forEach((c, i) => {
      const x = r2(20 + i * gap);
      s += `<line x1="${x}" y1="154" x2="${x}" y2="166" class="stroke"/><text x="${x}" y="184" text-anchor="middle" font-size="14">${lo + i}</text>`;
      for (let j = 0; j < c; j++) { const y = 138 - j * 22; s += `<path d="M ${x - 6} ${y - 6} L ${x + 6} ${y + 6} M ${x + 6} ${y - 6} L ${x - 6} ${y + 6}" class="stroke" style="stroke-width:2.5;stroke-linecap:round" data-x="${lo + i}"/>`; }
    });
    return `<svg class="figure" viewBox="0 0 320 192" width="320" height="192" role="img" aria-label="a line plot">${s}</svg>`;
  }
  A.skill({
    id: 'g3.graphs', title: 'Bar graphs and line plots',
    learn: p('A <b>bar graph</b> uses bars to show how many are in each group. <b>Read the number at the top of the bar by looking across to the scale.</b> The scale may count by 2s or 5s, so check it first.') +
      p('A <b>line plot</b> puts an X above a number line for every piece of data. <b>Count the X marks above a number</b> to see how many times it happened. To compare, find each amount and subtract. To find a total, add.') +
      example('Example', `${plotPic(0, [1, 3, 2, 1])}Three X marks are above 1, so 3 students have 1 pet. Altogether 1 + 3 + 2 + 1 = <b>7 students</b> answered.`),
    make(rng) {
      const kind = rng.pick(['bar-read', 'bar-more', 'bar-total', 'plot-at', 'plot-total', 'plot-more']);
      if (kind.startsWith('bar')) {
        const t = rng.pick(BAR_THEMES), scale = rng.pick([1, 2, 5]);
        const vals = rng.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 4).map(v => v * scale), top = scale * 10;
        const [i, j] = rng.sample([0, 1, 2, 3], 2), A1 = t.cats[i], B1 = t.cats[j];
        const pic = `<p><b>${t.title}</b></p>${barPic(t.cats, vals, scale, top)}`;
        const read = `The scale counts by ${scale}s. The ${A1} bar reaches ${vals[i]}${kind === 'bar-read' ? '' : ` and the ${B1} bar reaches ${vals[j]}`}.`;
        if (kind === 'bar-read') return { prompt: `How many students chose ${A1}?${pic}`, type: 'number', answer: vals[i], params: { kind, i },
          hints: [`Find the ${A1} bar and look across from its top to the scale.`, read, `The answer is <b>${vals[i]}</b>.`] };
        const big1 = vals[i] >= vals[j] ? i : j, small = big1 === i ? j : i;
        if (kind === 'bar-more') return { prompt: `How many more students chose ${t.cats[big1]} than ${t.cats[small]}?${pic}`, type: 'number', answer: vals[big1] - vals[small], params: { kind, i: big1, j: small },
          hints: [`Read both bars: ${t.cats[big1]} is ${vals[big1]} and ${t.cats[small]} is ${vals[small]}.`, `"How many more" means subtract: ${vals[big1]} − ${vals[small]}.`, `The answer is <b>${vals[big1] - vals[small]}</b>.`] };
        return { prompt: `How many students chose ${A1} or ${B1}? Add them together.${pic}`, type: 'number', answer: vals[i] + vals[j], params: { kind, i, j },
          hints: [read, `"Together" means add: ${vals[i]} + ${vals[j]}.`, `The answer is <b>${vals[i] + vals[j]}</b>.`] };
      }
      const t = rng.pick(PLOT_THEMES), n = 6;
      const counts = Array.from({ length: n }, () => rng.int(0, 5)); if (counts.every(c => c === 0)) counts[2] = 3;
      const [i, j] = rng.sample([0, 1, 2, 3, 4, 5], 2), vi = t.lo + i;
      if (kind === 'plot-more' && counts[i] === counts[j]) counts[i] = counts[j] === 5 ? 3 : counts[j] + 1;
      const pic = `<p><b>${t.title}</b></p>${plotPic(t.lo, counts)}`;
      const total = counts.reduce((x, y) => x + y, 0);
      const what = v => t.lo === 3 ? `pencils are ${v} inches long` : t.unit === 'books' ? `students read ${v} ${v === 1 ? 'book' : 'books'}` : `students have ${v} ${v === 1 ? 'pet' : 'pets'}`;
      const each = t.lo === 3 ? 'pencil' : 'student';
      if (kind === 'plot-at') return { prompt: `How many ${what(vi)}?${pic}`, type: 'number', answer: counts[i], params: { kind, v: vi },
        hints: [`Find ${vi} on the number line.`, `Count the X marks above ${vi}.`, `There ${counts[i] === 1 ? 'is' : 'are'} <b>${counts[i]}</b>.`] };
      if (kind === 'plot-total') return { prompt: `Each X is one ${each}. How many ${each}s are shown in all?${pic}`, type: 'number', answer: total, params: { kind },
        hints: [`Count the X marks above each number: ${counts.join(', ')}.`, `Add them: ${counts.join(' + ')}.`, `There are <b>${total}</b> in all.`] };
      const hi = counts[i] >= counts[j] ? i : j, lo2 = hi === i ? j : i;
      return { prompt: `How many more ${what(t.lo + hi)} than ${t.lo === 3 ? `are ${t.lo + lo2} inches long` : `${t.unit === 'books' ? 'read' : 'have'} ${t.lo + lo2}`}?${pic}`, type: 'number', answer: counts[hi] - counts[lo2], params: { kind, a: t.lo + hi, b: t.lo + lo2 },
        hints: [`Count the X marks above ${t.lo + hi}: ${counts[hi]}. Count the X marks above ${t.lo + lo2}: ${counts[lo2]}.`, `Subtract: ${counts[hi]} − ${counts[lo2]}.`, `The answer is <b>${counts[hi] - counts[lo2]}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind.startsWith('bar')) {
        const bars = [...q.prompt.matchAll(/height="([\d.]+)" class="fill" data-px="([\d.]+)"/g)].map(mt => Math.round(Number(mt[1]) / Number(mt[2])));
        if (pr.kind === 'bar-read') return q.answer === bars[pr.i];
        if (pr.kind === 'bar-more') return q.answer === bars[pr.i] - bars[pr.j] && q.answer >= 0;
        return q.answer === bars[pr.i] + bars[pr.j];
      }
      if (pr.kind === 'plot-at') return q.answer === countOf(q.prompt, `data-x="${pr.v}"`);
      if (pr.kind === 'plot-total') return q.answer === countOf(q.prompt, 'data-x="');
      return q.answer === countOf(q.prompt, `data-x="${pr.a}"`) - countOf(q.prompt, `data-x="${pr.b}"`) && q.answer >= 0;
    },
  });

})();
