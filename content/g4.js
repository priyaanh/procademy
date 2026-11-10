/* 4th grade math. Place value and rounding to a million, adding, multiplying and dividing multi-digit
   numbers, factors and patterns, fractions and decimals, angles and shapes, area, perimeter and units. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac;
  /** M.n, plus a comma in 4-digit whole numbers so 4,000 and 40,000 look alike */
  const N = x => { const t = M.n(x); return Number.isInteger(x) && Math.abs(x) >= 1000 && Math.abs(x) < 10000 ? t.replace(/(\d)(\d{3})$/, '$1,$2') : t; };
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = (s) => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const PLACES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands'];
  const SIGNS = ['&lt;', '&gt;', '='];
  const sign = (a, b) => a < b ? '&lt;' : a > b ? '&gt;' : '=';
  /** a mixed number exactly as given (no simplifying): 2 4/8 */
  const mixRaw = (w, n, d) => w === 0 ? F(n, d, { raw: true }) : n === 0 ? N(w) : `${N(w)}<span class="mixed">${F(n, d, { raw: true })}</span>`;
  const mixText = (w, n, d) => w === 0 ? `${n}/${d}` : n === 0 ? `${w}` : `${w} ${n}/${d}`;
  /** repeated addition: a second opinion on a × b that never uses * */
  const addUp = (a, b) => { let s = 0; for (let i = 0; i < b; i++) s += a; return s; };

  A.course({
    id: 'math-4', title: '4th grade math', subject: 'Elementary', grade: 4, icon: '4', hue: 85,
    blurb: 'Place value to a million, multiplying and dividing bigger numbers, factors, fractions and decimals, angles and shapes, area, perimeter and units.',
    units: [
      { id: 'place-value', title: 'Place value, rounding, and adding', blurb: 'Big numbers up to a million: what each digit is worth, rounding, adding and subtracting.', skills: ['g4.place-value', 'g4.round-whole', 'g4.add-sub-multi-digit'] },
      { id: 'mul-div', title: 'Multiplication and division', blurb: 'Multiplying by 1-digit and 2-digit numbers, and dividing with remainders.', skills: ['g4.multiply-1-digit', 'g4.multiply-2-digit', 'g4.divide-remainders'] },
      { id: 'factors', title: 'Factors, multiples, and patterns', blurb: 'Factor pairs, primes and composites, and number patterns that follow a rule.', skills: ['g4.factors-primes', 'g4.number-patterns'] },
      { id: 'equiv-fractions', title: 'Equivalent fractions and comparing fractions', blurb: 'Different fractions for the same amount, and which fraction is bigger.', skills: ['g4.equivalent-fractions', 'g4.compare-fractions'] },
      { id: 'fraction-ops', title: 'Add, subtract, and multiply fractions', blurb: 'Fractions with the same denominator, mixed numbers, and a whole number times a fraction.', skills: ['g4.add-sub-fractions', 'g4.mixed-numbers', 'g4.fraction-times-whole'] },
      { id: 'decimals', title: 'Understand decimals', blurb: 'Tenths and hundredths, as fractions and as decimals.', skills: ['g4.decimal-fractions', 'g4.compare-decimals'] },
      { id: 'geometry', title: 'Plane figures and angles', blurb: 'Parallel and perpendicular lines, symmetry, kinds of triangles, and measuring angles.', skills: ['g4.lines-shapes', 'g4.angles'] },
      { id: 'measurement', title: 'Area, perimeter, and units', blurb: 'Area and perimeter of rectangles, and changing big units into small ones.', skills: ['g4.area-perimeter', 'g4.unit-conversion'] },
      { id: 'estimation', title: 'Estimation and mental math', blurb: 'Rounding to check an answer, and shortcuts for adding, subtracting and multiplying in your head.', skills: ['g4.estimate-sum-diff', 'g4.mental-math'] },
    ],
  });

  /* ---------- Unit 1: Place value, rounding, and adding ---------- */
  A.skill({
    id: 'g4.place-value', title: 'Place value',
    learn: p('Every digit in a number has a <b>place</b>, and the place tells you what the digit is worth. From the right, the places are ones, tens, hundreds, thousands, ten thousands and hundred thousands.') +
      p('<b>Each place is worth 10 times the place to its right.</b> In 352,000 the 5 is in the ten thousands place, so it is worth 5 × 10,000 = 50,000.') +
      p('To compare two numbers, start at the left and look at the digits place by place. The first place where they are different tells you which number is bigger.') +
      example('Example', `${big('What is the value of the 4 in 641,208?')}The 4 is in the ten thousands place. It is worth 4 × 10,000 = <b>40,000</b>.`),
    make(rng) {
      const kind = rng.pick(['digit', 'digit', 'expanded', 'compare']);
      if (kind === 'digit') {
        let num, pos, digit;
        for (;;) {
          num = rng.int(10000, 999999);
          const s = String(num);
          pos = rng.int(0, s.length - 1);
          digit = Number(s[s.length - 1 - pos]);
          if (digit !== 0 && s.split('').filter(c => c === String(digit)).length === 1) break;
        }
        const ans = digit * Math.pow(10, pos);
        return { prompt: `What is the value of the digit <b>${digit}</b> in this number?${big(N(num))}`, type: 'number', answer: ans, params: { kind, num, digit },
          hints: [`Count places from the right: ones, tens, hundreds, thousands, ten thousands, hundred thousands.`, `The ${digit} is in the <b>${PLACES[pos]}</b> place.`, `So it is worth ${digit} × ${N(Math.pow(10, pos))} = <b>${N(ans)}</b>.`] };
      }
      if (kind === 'expanded') {
        const digits = [rng.int(1, 9)];
        for (let i = 1; i < 6; i++) digits.push(rng.chance(0.35) ? 0 : rng.int(1, 9));
        const parts = digits.map((d, i) => d * Math.pow(10, 5 - i)).filter(x => x > 0);
        const num = Number(digits.join(''));
        return { prompt: `Write this number in standard form.${big(parts.map(N).join(' + '))}`, type: 'number', answer: num, params: { kind, parts },
          hints: [`Each part tells you one digit and its place. ${N(parts[0])} means a ${digits[0]} in the hundred thousands place.`, `Places that are missing get a 0: ${digits.map((d, i) => `${d} ${PLACES[5 - i]}`).join(', ')}.`, `Put the digits together: <b>${N(num)}</b>.`] };
      }
      const a = rng.int(10000, 999999);
      let b = a;
      if (!rng.chance(0.12)) {
        const s = String(a).split('');
        const i = rng.int(0, s.length - 1);
        let d = Number(s[i]);
        do { d = rng.int(i === 0 ? 1 : 0, 9); } while (d === Number(s[i]));
        s[i] = String(d);
        b = Number(s.join(''));
      }
      const sa = String(a), sb = String(b);
      let k = 0; while (k < sa.length && sa[k] === sb[k]) k++;
      const ans = sign(a, b);
      return { prompt: `Which symbol makes this true?${big(`${N(a)} &nbsp;?&nbsp; ${N(b)}`)}`, type: 'choice', answer: ans, choices: SIGNS.slice(), keepOrder: true, params: { kind, a, b },
        hints: [`Both numbers have ${sa.length} digits, so compare them place by place from the left.`,
          k === sa.length ? `Every digit is the same, so the numbers are equal.` : `The first place that is different is the ${PLACES[sa.length - 1 - k]} place: ${sa[k]} and ${sb[k]}. ${sa[k] > sb[k] ? `${sa[k]} is bigger, so the first number is bigger.` : `${sa[k]} is smaller, so the first number is smaller.`}`,
          `${N(a)} <b>${ans}</b> ${N(b)}.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'digit') { let s = String(p.num), v = 1; for (let i = s.length - 1; i >= 0; i--, v *= 10) if (s[i] === String(p.digit)) return q.answer === p.digit * v; return false; }
      if (p.kind === 'expanded') return q.answer === p.parts.reduce((s, x) => s + x, 0);
      return q.answer === (p.a - p.b > 0 ? '&gt;' : p.a - p.b < 0 ? '&lt;' : '=');
    },
  });

  A.skill({
    id: 'g4.round-whole', title: 'Rounding whole numbers',
    learn: p('Rounding gives a number that is close and easier to use. To round, find the digit in the place you are rounding to, then <b>look at the digit just to its right</b>.') +
      p('<b>If that digit is 5 or more, round up</b>: the rounding digit goes up by one. <b>If it is 4 or less, keep the rounding digit</b>. Either way, every digit after the rounding place becomes 0.') +
      example('Example', `${big('Round 47,382 to the nearest thousand.')}The thousands digit is 7. The digit to its right is 3, which is less than 5, so keep the 7. The answer is <b>47,000</b>.`),
    make(rng) {
      const e = rng.int(1, 5), place = Math.pow(10, e);
      let num = rng.int(Math.max(1000, place), Math.min(999999, place * 1000));
      if (rng.chance(0.25)) num = Math.floor(num / place) * place + 5 * place / 10 + rng.int(0, place / 10 - 1);   // the next digit is a 5
      if (num > 999999) num -= place;
      const ans = Math.round(num / place) * place;
      const s = String(num), at = s.length - 1 - e;
      const rd = at >= 0 ? s[at] : '0', next = s[at + 1];
      const name = rng.pick(NAMES);
      const what = rng.pick([`Round ${N(num)} to the nearest ${PLACES[e].replace(/s$/, '')}.`, `Round ${N(num)} to the nearest ${PLACES[e].replace(/s$/, '')}.`,
        `A stadium had ${N(num)} visitors this year. Round that number to the nearest ${PLACES[e].replace(/s$/, '')}.`,
        `${name}'s class collected ${N(num)} bottle caps. Round to the nearest ${PLACES[e].replace(/s$/, '')}.`]);
      return { prompt: what, type: 'number', answer: ans, params: { num, place },
        hints: [`The digit in the ${PLACES[e]} place is ${rd}.`, `Look at the digit to its right: it is ${next}. ${Number(next) >= 5 ? `That is 5 or more, so round up.` : `That is less than 5, so keep the ${rd}.`}`, `Change every digit after the ${PLACES[e]} place to 0: <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const { num, place } = q.params;
      const lo = num - num % place, hi = lo + place;
      return q.answer === (num - lo < hi - num ? lo : hi);
    },
  });

  A.skill({
    id: 'g4.add-sub-multi-digit', title: 'Add and subtract multi-digit numbers',
    learn: p('Write the numbers in columns so that <b>ones are under ones, tens under tens</b>, and so on. Then work from the right.') +
      p('<b>Adding:</b> if a column adds up to 10 or more, write the ones digit and carry 1 to the next column. <b>Subtracting:</b> if the top digit is too small, regroup: borrow 1 from the next column, which gives you 10 more in this one.') +
      p('Check your work with an estimate. Round each number and add or subtract the rounded numbers. Your answer should be close.') +
      example('Example', `${big('45,208 − 17,563')}Ones: 8 − 3 = 5. Tens: 0 − 6 needs regrouping, so 10 − 6 = 4. Keep going, and the answer is <b>27,645</b>. Check: 27,645 + 17,563 = 45,208.`),
    make(rng) {
      const sub = rng.bool(), word = rng.chance(0.4), name = rng.pick(NAMES);
      const size = rng.pick([[1000, 9999], [10000, 99999], [100000, 999999]]);
      let a = rng.int(size[0], size[1]), b = rng.int(Math.max(100, Math.floor(size[0] / 10)), size[1]);
      if (sub && b >= a) [a, b] = [b, a];
      if (sub && a === b) a += rng.int(11, 99);
      if (sub && rng.chance(0.2)) a = Math.ceil(a / 1000) * 1000 + rng.int(0, 9);   // zeros to regroup across
      if (!sub && a + b > 999999) b = rng.int(100, 999999 - a);
      const ans = sub ? a - b : a + b;
      const prompt = !word ? `${sub ? 'Subtract' : 'Add'}.${big(`${N(a)} ${sub ? '−' : '+'} ${N(b)}`)}` : sub
        ? rng.pick([`A town had ${N(a)} trees. A storm knocked down ${N(b)} of them. How many trees are still standing?`, `${name} needs ${N(a)} points to win a game and has ${N(b)} so far. How many more points does ${name} need?`])
        : rng.pick([`A library has ${N(a)} books for adults and ${N(b)} books for children. How many books is that in all?`, `A farm grew ${N(a)} apples last year and ${N(b)} apples this year. How many apples is that altogether?`]);
      const r = x => Math.round(x / 1000) * 1000;
      return { prompt, type: 'number', answer: ans, params: { a, b, sub },
        hints: [`${word ? `This is ${sub ? 'a subtraction' : 'an addition'}: ${N(a)} ${sub ? '−' : '+'} ${N(b)}. ` : ''}Line up the numbers so the ones are under the ones, and start from the right.`,
          `Estimate first: ${N(r(a))} ${sub ? '−' : '+'} ${N(r(b))} = ${N(sub ? r(a) - r(b) : r(a) + r(b))}, so the answer should be close to that.`,
          `${N(a)} ${sub ? '−' : '+'} ${N(b)} = <b>${N(ans)}</b>. Check: ${sub ? `${N(ans)} + ${N(b)} = ${N(a)}` : `${N(ans)} − ${N(b)} = ${N(a)}`} ✓`] };
    },
    verify(q) { const { a, b, sub } = q.params; return sub ? q.answer + b === a : q.answer - b === a && q.answer > a; },
  });

  /* ---------- Unit 2: Multiplication and division ---------- */
  A.skill({
    id: 'g4.multiply-1-digit', title: 'Multiply by 1-digit numbers',
    learn: p('A large multiplication is made of many small ones. <b>Break the bigger number into its places</b>, multiply each part, then add the parts together.') +
      p('For 3 × 254, think 254 = 200 + 50 + 4. Then 3 × 200 = 600, 3 × 50 = 150 and 3 × 4 = 12. Add: 600 + 150 + 12 = 762.') +
      p('Knowing your times tables makes every step quick: 3 × 50 is just 3 × 5 with a 0 on the end.') +
      example('Example', `${big('6 × 1,427')}6 × 1,000 = 6,000. 6 × 400 = 2,400. 6 × 20 = 120. 6 × 7 = 42. Add them: <b>8,562</b>.`),
    make(rng) {
      const a = rng.pick([rng.int(12, 99), rng.int(101, 999), rng.int(101, 999), rng.int(1001, 9999)]), b = rng.int(2, 9);
      const ans = a * b, name = rng.pick(NAMES);
      const digits = String(a).split('').map(Number), L = digits.length;
      const parts = digits.map((d, i) => d * Math.pow(10, L - 1 - i)).filter(x => x > 0);
      const kind = rng.pick(['plain', 'plain', 'word']);
      const prompt = kind === 'plain' ? `Multiply.${big(`${N(b)} × ${N(a)}`)}` : rng.pick([
        `A box holds ${N(a)} paper clips. How many paper clips are in ${b} boxes?`,
        `${name} walks ${N(a)} steps to school. How many steps is that in ${b} trips?`,
        `A theater has ${b} rows with ${N(a)} seats in each row. How many seats are there?`]);
      return { prompt, type: 'number', answer: ans, params: { a, b },
        hints: [`${kind === 'word' ? `Multiply: ${b} × ${N(a)}. ` : ''}Break ${N(a)} into its places: ${parts.map(N).join(' + ')}.`,
          `Multiply each part by ${b}: ${parts.map(x => `${b} × ${N(x)} = ${N(b * x)}`).join(', ')}.`,
          `Add the parts: ${parts.map(x => N(b * x)).join(' + ')} = <b>${N(ans)}</b>.`] };
    },
    verify(q) { return q.answer === addUp(q.params.a, q.params.b); },
  });

  A.skill({
    id: 'g4.multiply-2-digit', title: 'Multiply 2-digit numbers',
    learn: p('To multiply two 2-digit numbers, <b>split one of them into tens and ones</b>. Multiply the other number by each part, then add.') +
      p('An area model helps: draw a rectangle, cut one side into tens and ones, and find the area of each piece. For 34 × 27, split 27 into 20 + 7. Then 34 × 20 = 680 and 34 × 7 = 238, and 680 + 238 = 918.') +
      p('To multiply by tens, <b>multiply the digits, then put the zeros back</b>. 40 × 60: 4 × 6 = 24, and there are two zeros, so 2,400.') +
      example('Example', `${big('52 × 18')}Split 18 into 10 + 8. 52 × 10 = 520 and 52 × 8 = 416. Add: 520 + 416 = <b>936</b>.`),
    make(rng) {
      const kind = rng.pick(['plain', 'plain', 'tens', 'word']), name = rng.pick(NAMES);
      if (kind === 'tens') {
        const x = rng.int(2, 9), y = rng.int(2, 9), zx = rng.pick([1, 1, 2]), zy = 1;
        const a = x * Math.pow(10, zx), b = y * Math.pow(10, zy), ans = a * b, zeros = zx + zy;
        return { prompt: `Multiply.${big(`${N(a)} × ${N(b)}`)}`, type: 'number', answer: ans, params: { a, b },
          hints: [`Multiply the digits that are not zero: ${x} × ${y} = ${x * y}.`, `Count the zeros at the end of both numbers: ${zeros}.`, `Put ${zeros === 1 ? 'that zero' : `those ${zeros} zeros`} on the end: <b>${N(ans)}</b>.`] };
      }
      const a = rng.int(12, 99), b = rng.int(1, 9) * 10 + rng.int(1, 9), t = b - b % 10, o = b % 10, ans = a * b;
      const prompt = kind === 'plain' ? `Multiply.${big(`${a} × ${b}`)}` : rng.pick([
        `A bus can carry ${a} students. How many students can ${b} buses carry?`,
        `${name} reads ${a} pages every day. How many pages does ${name} read in ${b} days?`,
        `A garden has ${b} rows of tulips with ${a} tulips in each row. How many tulips are there?`]);
      return { prompt, type: 'number', answer: ans, params: { a, b },
        hints: [`${kind === 'word' ? `Multiply: ${a} × ${b}. ` : ''}Split ${b} into tens and ones: ${b} = ${t}${o ? ` + ${o}` : ''}.`,
          `${a} × ${t} = ${N(a * t)}${o ? ` and ${a} × ${o} = ${N(a * o)}` : ''}.`,
          o ? `Add the two parts: ${N(a * t)} + ${N(a * o)} = <b>${N(ans)}</b>.` : `There are no ones, so the answer is <b>${N(ans)}</b>.`] };
    },
    verify(q) { return q.answer === addUp(q.params.a, q.params.b); },
  });

  A.skill({
    id: 'g4.divide-remainders', title: 'Divide with remainders',
    learn: p('Dividing means sharing into equal groups. Sometimes things do not share out evenly, and some are <b>left over</b>. The amount left over is the <b>remainder</b>.') +
      p('To find 47 ÷ 6, ask: what is the biggest number of 6s that fit in 47? 6 × 7 = 42 fits, but 6 × 8 = 48 is too big. So 47 ÷ 6 = 7 with 47 − 42 = 5 left over. We write <b>7 R 5</b>. <b>The remainder must always be smaller than the number you divide by.</b>') +
      p('In a word problem, think about what the question wants. "How many full boxes?" is the quotient. "How many are left?" is the remainder. "How many boxes do we need for all of them?" is the quotient plus one more box for the leftovers.') +
      example('Example', `${big('325 ÷ 4')}4 × 81 = 324 fits, but 4 × 82 = 328 is too big. 325 − 324 = 1 is left over. The answer is <b>81 R 1</b>.`),
    make(rng) {
      const kind = rng.pick(['exact', 'choice', 'choice', 'full', 'left', 'need']), name = rng.pick(NAMES);
      const d = rng.int(2, 9), q = kind === 'exact' ? rng.int(12, 999) : rng.int(6, 250);
      const r = kind === 'exact' ? 0 : rng.int(1, d - 1), n = q * d + r;
      const steps = [`How many ${d}s fit into ${N(n)}? Try ${d} × ${N(q)} = ${N(q * d)}.`, `${N(n)} − ${N(q * d)} = ${r}. ${r ? `${r} is less than ${d}, so no more ${d}s fit.` : 'Nothing is left over.'}`];
      if (kind === 'exact') return { prompt: `Divide.${big(`${N(n)} ÷ ${d}`)}`, type: 'number', answer: q, params: { kind, n, d }, hints: steps.concat(`${N(n)} ÷ ${d} = <b>${N(q)}</b>.`) };
      if (kind === 'choice') {
        const opts = [`${q} R ${r}`, `${q + 1} R ${r}`, `${q - 1} R ${r + d}`, d - r !== r ? `${q} R ${d - r}` : `${q + 10} R ${r}`];
        return { prompt: `Divide.${big(`${N(n)} ÷ ${d}`)}`, type: 'choice', answer: opts[0], choices: opts, params: { kind, n, d }, hints: steps.concat(`${N(n)} ÷ ${d} = <b>${q} R ${r}</b>.`) };
      }
      const thing = rng.pick([['muffins', 'box', 'boxes', 'muffin'], ['marbles', 'bag', 'bags', 'marble'], ['pencils', 'pack', 'packs', 'pencil'], ['stickers', 'page', 'pages', 'sticker']]);
      const setup = `${name} has ${N(n)} ${thing[0]}. Each ${thing[1]} holds ${d} ${thing[0]}.`;
      if (kind === 'full') return { prompt: `${setup} How many ${thing[2]} can ${name} fill all the way?`, type: 'number', answer: q, params: { kind, n, d }, hints: [`Divide: ${N(n)} ÷ ${d}.`].concat(steps, `${N(n)} ÷ ${d} = ${q} R ${r}, so <b>${N(q)}</b> full ${thing[2]}. The ${r} left over do not fill another one.`) };
      if (kind === 'left') return { prompt: `${setup} ${name} fills as many ${thing[2]} as possible. How many ${thing[0]} are left over?`, type: 'number', answer: r, params: { kind, n, d }, hints: [`Divide: ${N(n)} ÷ ${d}. The left-over amount is the remainder.`].concat(steps, `${N(n)} ÷ ${d} = ${q} R ${r}, so <b>${r}</b> ${r === 1 ? `${thing[3]} is` : `${thing[0]} are`} left over.`) };
      return { prompt: `${setup} How many ${thing[2]} does ${name} need to fit all of them?`, type: 'number', answer: q + 1, params: { kind, n, d }, hints: [`Divide: ${N(n)} ÷ ${d}.`].concat(steps, `${q} ${thing[2]} are full, and the ${r} left over need one more. That is ${q} + 1 = <b>${N(q + 1)}</b> ${thing[2]}.`) };
    },
    verify(q) {
      const { kind, n, d } = q.params;
      let k = 0; while ((k + 1) * d <= n) k++;      // count how many groups of d fit, one at a time
      const rem = n - k * d;
      if (kind === 'exact') return rem === 0 && q.answer === k;
      if (kind === 'choice') { const [qq, rr] = q.answer.split(' R ').map(Number); return qq * d + rr === n && rr >= 0 && rr < d; }
      if (kind === 'full') return q.answer === k;
      if (kind === 'left') return q.answer === rem;
      return q.answer * d >= n && (q.answer - 1) * d < n;
    },
  });

  /* ---------- Unit 3: Factors, multiples, and patterns ---------- */
  const factorsOf = n => { const f = []; for (let i = 1; i <= n; i++) if (n % i === 0) f.push(i); return f; };
  A.skill({
    id: 'g4.factors-primes', title: 'Factors, multiples, primes, and composites',
    learn: p('A <b>factor</b> of a number divides it with nothing left over. The factors of 12 are 1, 2, 3, 4, 6 and 12, because 1 × 12, 2 × 6 and 3 × 4 all make 12. These are its <b>factor pairs</b>.') +
      p('A <b>multiple</b> of a number is what you get when you multiply it by a whole number. The multiples of 4 are 4, 8, 12, 16, 20 and so on: you skip-count by 4.') +
      p('A <b>prime number</b> has exactly two factors: 1 and itself. 7 is prime. A <b>composite number</b> has more than two factors. 9 is composite, because 3 × 3 = 9. The number 1 is neither prime nor composite.') +
      example('Example', `${big('Is 51 prime or composite?')}Try small numbers. 51 is not even, so 2 does not work. But 3 × 17 = 51, so 51 has more than two factors. It is <b>composite</b>.`),
    make(rng) {
      const kind = rng.pick(['prime', 'prime', 'count', 'factor', 'multiple']);
      if (kind === 'prime') {
        const n = rng.chance(0.06) ? 1 : rng.chance(0.4) ? rng.pick([21, 27, 33, 39, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93]) : rng.int(2, 100);
        const f = factorsOf(n), ans = n === 1 ? 'Neither' : f.length === 2 ? 'Prime' : 'Composite';
        const small = f.find(x => x > 1 && x < n);
        return { prompt: `Is this number prime or composite?${big(N(n))}`, type: 'choice', answer: ans, choices: ['Prime', 'Composite', 'Neither'], keepOrder: true, params: { kind, n },
          hints: [`A prime number has exactly two factors, 1 and itself. Try dividing ${N(n)} by 2, 3, 5 and 7.`,
            n === 1 ? `1 has only one factor: 1. That is not two factors, so 1 is not prime, and it is not composite either.` : small ? `${small} × ${n / small} = ${N(n)}, so ${small} is a factor. ${N(n)} has more than two factors.` : `Nothing works except 1 and ${N(n)}, so ${N(n)} has exactly two factors.`,
            `${N(n)} is <b>${ans === 'Neither' ? 'neither prime nor composite' : ans.toLowerCase()}</b>.`] };
      }
      if (kind === 'count') {
        const n = rng.pick([12, 15, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48, 50, 54, 56, 60, 64, 72, 80, 84, 90, 96, 100]);
        const f = factorsOf(n), pairs = f.filter(x => x * x <= n).map(x => `${x} × ${n / x}`);
        return { prompt: `How many factors does ${N(n)} have?`, type: 'number', answer: f.length, params: { kind, n },
          hints: [`Find the factor pairs. Start with 1 × ${n}, then try 2, 3, 4 and so on.`, `The factor pairs are ${pairs.join(', ')}.`, `The factors are ${f.join(', ')}. That is <b>${f.length}</b> factors.`] };
      }
      if (kind === 'factor') {
        const n = rng.pick([24, 30, 36, 42, 45, 48, 54, 56, 60, 63, 64, 72, 75, 80, 84, 88, 90, 96]);
        const f = factorsOf(n).filter(x => x > 2 && x < n), right = rng.pick(f);
        const wrong = rng.sample([right - 1, right + 1, right + 2, right + 3, right - 2, n / right + 1, n - 1].filter(x => x > 1 && n % x !== 0 && x !== right).filter((x, i, a) => a.indexOf(x) === i), 3);
        return { prompt: `Which number is a factor of ${N(n)}?`, type: 'choice', answer: String(right), choices: [String(right)].concat(wrong.map(String)), params: { kind, n },
          hints: [`A factor of ${N(n)} divides it with nothing left over. Test each choice.`, `${n} ÷ ${right} = ${n / right}, with nothing left over.`, `So <b>${right}</b> is a factor of ${N(n)}, because ${right} × ${n / right} = ${N(n)}.`] };
      }
      const k = rng.int(3, 9), m = rng.int(3, 12), right = k * m;
      const wrong = rng.sample([right - 1, right + 1, right + 2, right - 2, right + k + 1, right - k + 1].filter(x => x > 1 && x % k !== 0).filter((x, i, a) => a.indexOf(x) === i), 3);
      return { prompt: `Which number is a multiple of ${k}?`, type: 'choice', answer: String(right), choices: [String(right)].concat(wrong.map(String)), params: { kind, k },
        hints: [`A multiple of ${k} is in the ${k} times table. Skip-count by ${k}: ${k}, ${2 * k}, ${3 * k}, ${4 * k}, …`, `${k} × ${m} = ${right}.`, `So <b>${right}</b> is a multiple of ${k}.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'prime') { let c = 0; for (let i = 1; i <= p.n; i++) if (p.n % i === 0) c++; return q.answer === (c === 1 ? 'Neither' : c === 2 ? 'Prime' : 'Composite'); }
      if (p.kind === 'count') { let c = 0; for (let i = 1; i * i <= p.n; i++) if (p.n % i === 0) c += i * i === p.n ? 1 : 2; return q.answer === c; }
      const goods = q.choices.filter(c => p.kind === 'factor' ? p.n % Number(c) === 0 : Number(c) % p.k === 0);
      return goods.length === 1 && goods[0] === q.answer;
    },
  });

  A.skill({
    id: 'g4.number-patterns', title: 'Number patterns',
    learn: p('A number pattern follows a <b>rule</b>. The rule tells you how to get from one number to the next, like "add 4" or "multiply by 2".') +
      p('To find the rule, <b>look at how each number changes to the next one</b>. If it goes up by the same amount every time, the rule is "add" that amount. If it goes down by the same amount, the rule is "subtract".') +
      p('Once you know the rule, keep using it to find the next number, or a missing one in the middle.') +
      example('Example', `${big('7, 12, 17, 22, ___')}Each number is 5 more than the one before, so the rule is "add 5". The next number is 22 + 5 = <b>27</b>.`),
    make(rng) {
      const kind = rng.pick(['next', 'next', 'missing', 'nth', 'down', 'times']);
      const show = (terms, blank) => big(terms.map((t, i) => i === blank ? '___' : N(t)).join(', ') + (blank == null ? ', ___' : ''));
      if (kind === 'times') {
        const m = rng.pick([2, 2, 3]), start = rng.int(1, m === 2 ? 9 : 5), terms = [start];
        for (let i = 1; i < 4; i++) terms.push(terms[i - 1] * m);
        const ans = terms[3] * m;
        return { prompt: `What number comes next in this pattern?${show(terms)}`, type: 'number', answer: ans, params: { kind, start, step: m, count: 4 },
          hints: [`The jumps get bigger, so this is not "add". Try dividing: ${terms[1]} ÷ ${terms[0]} = ${m}.`, `The rule is "multiply by ${m}": ${terms[2]} × ${m} = ${terms[3]}.`, `Next: ${terms[3]} × ${m} = <b>${N(ans)}</b>.`] };
      }
      const step = rng.int(2, 25), down = kind === 'down';
      const start = down ? rng.int(5 * step + 1, 5 * step + 200) : rng.int(1, 120);
      const d = down ? -step : step;
      if (kind === 'nth') {
        const n = rng.int(5, 10), ans = start + (n - 1) * d;
        return { prompt: `A pattern starts at ${N(start)}. The rule is "add ${step}". What is the ${M.ordinal(n)} number in the pattern?`, type: 'number', answer: ans, params: { kind, start, step: d, count: n },
          hints: [`The 1st number is ${start}. Each new number is ${step} more.`, `Write them out: ${Array.from({ length: n }, (_, i) => N(start + i * d)).join(', ')}.`, `The ${M.ordinal(n)} number is <b>${N(ans)}</b>.`] };
      }
      const terms = [0, 1, 2, 3, 4].map(i => start + i * d);
      if (kind === 'missing') {
        const blank = rng.int(1, 3);
        return { prompt: `What number is missing from this pattern?${show(terms, blank)}`, type: 'number', answer: terms[blank], params: { kind, start, step: d, count: blank + 1 },
          hints: [`Look at two numbers next to each other that you can see. ${blank === 1 ? `${terms[3]} − ${terms[2]}` : `${terms[1]} − ${terms[0]}`} = ${step}.`, `The rule is "add ${step}". So the missing number is ${N(terms[blank - 1])} + ${step}.`, `The missing number is <b>${N(terms[blank])}</b>.`] };
      }
      const shown = terms.slice(0, 4), ans = terms[4];
      return { prompt: `What number comes next in this pattern?${show(shown)}`, type: 'number', answer: ans, params: { kind, start, step: d, count: 5 },
        hints: [down ? `Find how much it changes each time: ${N(shown[0])} − ${N(shown[1])} = ${step}, so it goes down by ${step}.` : `Find how much it changes each time: ${N(shown[1])} − ${N(shown[0])} = ${step}, so it goes up by ${step}.`, `The rule is "${down ? 'subtract' : 'add'} ${step}".`, `Next: ${N(shown[3])} ${down ? '−' : '+'} ${step} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const { kind, start, step, count } = q.params;
      let t = start;
      for (let i = 1; i < count; i++) t = kind === 'times' ? t * step : t + step;
      if (kind === 'times') t *= step;
      return q.answer === t;
    },
  });

  /* ---------- Unit 4: Equivalent fractions and comparing fractions ---------- */
  const DENS = [2, 3, 4, 5, 6, 8, 10, 12];
  const coprimeNum = (rng, d) => { const o = []; for (let k = 1; k < d; k++) if (M.gcd(k, d) === 1) o.push(k); return rng.pick(o); };
  const R = (n, d) => F(n, d, { raw: true });
  const PARTS = { 2: 'halves', 3: 'thirds', 4: 'fourths', 5: 'fifths', 6: 'sixths', 8: 'eighths', 10: 'tenths', 12: 'twelfths' };
  A.skill({
    id: 'g4.equivalent-fractions', title: 'Equivalent fractions',
    learn: p(`<b>Equivalent fractions</b> name the same amount. ${F(1, 2)}, ${R(2, 4)} and ${R(4, 8)} are all half of a pizza, just cut into a different number of slices.`) +
      p('<b>To make an equivalent fraction, multiply (or divide) the top and the bottom by the same number.</b> If you cut every slice into 3 pieces, you have 3 times as many slices, and 3 times as many of them are yours.') +
      p('Be careful: adding the same number to the top and bottom does <i>not</i> make an equivalent fraction.') +
      example('Example', `${big(`${F(3, 4)} = ${R('?', 12)}`)}The bottom went from 4 to 12, which is × 3. Do the same to the top: 3 × 3 = 9. So ${F(3, 4)} = <b>${R(9, 12)}</b>.`),
    make(rng) {
      const kind = rng.pick(['top', 'top', 'bottom', 'simplify', 'choice']);
      const d = rng.pick(DENS), n = coprimeNum(rng, d);
      let k = rng.int(2, 6); while (d * k > 60) k--;
      if (kind === 'choice') {
        const opts = [R(n * k, d * k), R(n + k, d + k), R(n * k + 1, d * k), R(n * k, d * k + k)];
        if (n + k === n * k + 1 && d + k === d * k) opts[2] = R(n * k, d * k - 1);
        return { prompt: `Which fraction is equivalent to ${F(n, d)}?`, type: 'choice', answer: opts[0], choices: opts, params: { kind, n, d, ok: [n * k, d * k] },
          hints: [`Multiply the top and bottom of ${F(n, d)} by the same number.`, `Try × ${k}: ${n} × ${k} = ${n * k} and ${d} × ${k} = ${d * k}.`, `So <b>${R(n * k, d * k)}</b> is equivalent to ${F(n, d)}.`] };
      }
      if (kind === 'simplify') {
        return { prompt: `Fill in the missing number.${big(`${R(n * k, d * k)} = ${R('?', d)}`)}`, type: 'number', answer: n, params: { kind, a: n * k, b: d * k, c: null, e: d },
          hints: [`The bottom went from ${d * k} to ${d}. That is ÷ ${k}.`, `Divide the top by ${k} too: ${n * k} ÷ ${k} = ${n}.`, `${R(n * k, d * k)} = ${R(n, d)}, so the missing number is <b>${n}</b>.`] };
      }
      if (kind === 'bottom') {
        return { prompt: `Fill in the missing number.${big(`${F(n, d)} = ${R(n * k, '?')}`)}`, type: 'number', answer: d * k, params: { kind, a: n, b: d, c: n * k, e: null },
          hints: [`The top went from ${n} to ${n * k}. That is × ${k}.`, `Multiply the bottom by ${k} too: ${d} × ${k} = ${d * k}.`, `${F(n, d)} = ${R(n * k, d * k)}, so the missing number is <b>${d * k}</b>.`] };
      }
      return { prompt: `Fill in the missing number.${big(`${F(n, d)} = ${R('?', d * k)}`)}`, type: 'number', answer: n * k, params: { kind, a: n, b: d, c: null, e: d * k },
        hints: [`The bottom went from ${d} to ${d * k}. That is × ${k}.`, `Multiply the top by ${k} too: ${n} × ${k} = ${n * k}.`, `${F(n, d)} = ${R(n * k, d * k)}, so the missing number is <b>${n * k}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'choice') return p.ok[0] * p.d === p.ok[1] * p.n && q.choices.filter(c => { const m = A.stripTags(c).trim().split(/\s+/).map(Number); return m[0] * p.d === m[1] * p.n; }).length === 1;
      const c = p.c == null ? q.answer : p.c, e = p.e == null ? q.answer : p.e;
      return p.a * e === p.b * c;                                  // cross-multiplying: a/b = c/e
    },
  });

  A.skill({
    id: 'g4.compare-fractions', title: 'Compare fractions',
    learn: p('When two fractions have the <b>same denominator</b>, the one with the bigger top is bigger: the slices are the same size, so more slices is more.') +
      p('When the denominators are different, <b>rewrite both fractions with the same denominator first</b>. Find a number that both denominators go into, and make equivalent fractions.') +
      p('Another strategy is to compare with a benchmark like ' + F(1, 2) + '. If one fraction is less than a half and the other is more, you know which is bigger right away.') +
      example('Example', `${big(`${F(2, 3)} &nbsp;?&nbsp; ${F(3, 4)}`)}Use twelfths: ${F(2, 3)} = ${R(8, 12)} and ${F(3, 4)} = ${R(9, 12)}. 8 is less than 9, so ${F(2, 3)} <b>&lt;</b> ${F(3, 4)}.`),
    make(rng) {
      const d1 = rng.pick(DENS); let d2 = rng.pick(DENS);
      while (d2 === d1) d2 = rng.pick(DENS);
      const n1 = coprimeNum(rng, d1); let n2 = coprimeNum(rng, d2);
      if (rng.chance(0.15)) { const L = d1 * d2 / M.gcd(d1, d2); if ((n1 * L / d1) % (L / d2) === 0) n2 = (n1 * L / d1) / (L / d2); }
      const L = d1 * d2 / M.gcd(d1, d2), a = n1 * L / d1, b = n2 * L / d2;
      const ans = sign(a, b);
      const steps = [`The denominators are ${d1} and ${d2}. Both go into ${L}, so rewrite both fractions with ${L} on the bottom.`,
        `${R(n1, d1)} = ${R(a, L)} and ${R(n2, d2)} = ${R(b, L)}.`];
      if (rng.chance(0.35)) {
        const [x, y] = rng.sample(NAMES, 2), food = rng.pick(['pizza', 'sandwich', 'pie', 'cake']);
        const opts = [x, y, 'Both the same'], right = a > b ? x : a < b ? y : 'Both the same';
        return { prompt: `${x} ate ${R(n1, d1)} of a ${food}. ${y} ate ${R(n2, d2)} of a ${food} the same size. Who ate more?`, type: 'choice', answer: right, choices: opts, keepOrder: true, params: { n1, d1, n2, d2, x, y },
          hints: steps.concat(a === b ? `${a} = ${b}, so they ate <b>the same amount</b>.` : `${Math.max(a, b)} is more than ${Math.min(a, b)}, so <b>${right}</b> ate more.`) };
      }
      return { prompt: `Which symbol makes this true?${big(`${R(n1, d1)} &nbsp;?&nbsp; ${R(n2, d2)}`)}`, type: 'choice', answer: ans, choices: SIGNS.slice(), keepOrder: true, params: { n1, d1, n2, d2 },
        hints: steps.concat(`${a} ${a < b ? 'is less than' : a > b ? 'is more than' : 'is the same as'} ${b}, so ${R(n1, d1)} <b>${ans}</b> ${R(n2, d2)}.`) };
    },
    verify(q) {
      const { n1, d1, n2, d2, x, y } = q.params, diff = n1 * d2 - n2 * d1;      // cross-multiply
      if (x) return q.answer === (diff > 0 ? x : diff < 0 ? y : 'Both the same');
      return q.answer === (diff > 0 ? '&gt;' : diff < 0 ? '&lt;' : '=');
    },
  });

  /* ---------- Unit 5: Add, subtract, and multiply fractions ---------- */
  const fracAns = (num, d) => num % d === 0 ? String(num / d) : `${num}/${d}`;
  A.skill({
    id: 'g4.add-sub-fractions', title: 'Add and subtract fractions with like denominators',
    learn: p('When fractions have the <b>same denominator</b>, the slices are all the same size. So you can just count slices.') +
      p('<b>Add or subtract the numerators (tops). Keep the denominator (bottom) the same.</b> ' + `${R(2, 8)} + ${R(3, 8)} = ${R(5, 8)}: two eighths plus three eighths is five eighths.`) +
      p('A common mistake is to add the bottoms too. ' + `${R(2, 8)} + ${R(3, 8)} is not ${R(5, 16)}, because the slices did not get smaller.`) +
      example('Example', `${big(`${R(7, 10)} − ${R(4, 10)}`)}Subtract the tops: 7 − 4 = 3. Keep the tenths. The answer is <b>${R(3, 10)}</b>.`),
    make(rng) {
      const kind = rng.pick(['add', 'sub', 'add', 'word', 'split']), name = rng.pick(NAMES);
      const d = rng.pick([3, 4, 5, 6, 8, 10, 12]);
      if (kind === 'split') {
        const total = rng.int(3, d), a = rng.int(1, total - 1), b = total - a;
        return { prompt: `Fill in the missing number.${big(`${R(total, d)} = ${R(a, d)} + ${R('?', d)}`)}`, type: 'number', answer: b, params: { kind, a, b: total, d, sign: -1 },
          hints: [`All the fractions are ${PARTS[d]}, so just think about the tops: ${a} + ? = ${total}.`, `${total} − ${a} = ${b}.`, `${R(total, d)} = ${R(a, d)} + ${R(b, d)}, so the missing number is <b>${b}</b>.`] };
      }
      const sub = kind === 'sub' || (kind === 'word' && rng.bool());
      let a = rng.int(1, d - 1), b = rng.int(1, d - 1);
      if (sub && a === b) a = Math.min(d, a + 1);
      if (sub && a < b) [a, b] = [b, a];
      const num = sub ? a - b : a + b;
      const prompt = kind !== 'word' ? `${sub ? 'Subtract' : 'Add'}.${big(`${R(a, d)} ${sub ? '−' : '+'} ${R(b, d)}`)}` : sub
        ? `${name} had ${R(a, d)} of a ribbon. ${name} used ${R(b, d)} of the ribbon for a craft. What fraction of the ribbon is left?`
        : `${name} painted ${R(a, d)} of a fence on Saturday and ${R(b, d)} of the fence on Sunday. What fraction of the fence did ${name} paint in all?`;
      return { prompt, type: 'number', answer: num / d, answerText: fracAns(num, d), params: { kind, a, b, d, sign: sub ? -1 : 1 },
        hints: [`${kind === 'word' ? `This is ${R(a, d)} ${sub ? '−' : '+'} ${R(b, d)}. ` : ''}The denominators are the same, so keep the ${d} on the bottom.`, `${sub ? 'Subtract' : 'Add'} the tops: ${a} ${sub ? '−' : '+'} ${b} = ${num}.`, `The answer is <b>${R(num, d)}</b>${num % d === 0 ? `, which is ${num / d}` : ''}.`] };
    },
    verify(q) {
      const { kind, a, b, d, sign: sg } = q.params;
      if (kind === 'split') return Math.abs(a / d + q.answer / d - b / d) < 1e-9;
      return Math.abs(a / d + sg * b / d - q.answer) < 1e-9;
    },
  });

  A.skill({
    id: 'g4.mixed-numbers', title: 'Add and subtract mixed numbers',
    learn: p(`A <b>mixed number</b> has a whole part and a fraction part, like ${mixRaw(2, 3, 4)}. That means 2 wholes and ${F(3, 4)} more.`) +
      p('<b>To add mixed numbers, add the wholes and add the fractions.</b> If the fractions add up to a whole or more, trade that whole for 1 and add it to the whole numbers.') +
      p(`To subtract, subtract the wholes and the fractions. If the top fraction is too small, <b>borrow 1 whole</b> and turn it into a fraction: 1 = ${R(4, 4)}.`) +
      example('Example', `${big(`${mixRaw(3, 1, 4)} − ${mixRaw(1, 3, 4)}`)}${F(1, 4)} is smaller than ${F(3, 4)}, so borrow: ${mixRaw(3, 1, 4)} = ${mixRaw(2, 5, 4)}. Now 2 − 1 = 1 and ${R(5, 4)} − ${R(3, 4)} = ${R(2, 4)}. The answer is <b>${mixRaw(1, 2, 4)}</b>.`),
    make(rng) {
      const kind = rng.pick(['add', 'sub', 'word', 'improper']), name = rng.pick(NAMES);
      const d = rng.pick([3, 4, 5, 6, 8, 10]);
      if (kind === 'improper') {
        const w = rng.int(1, 5), n = coprimeNum(rng, d);
        const tops = [w * d + n, w + n, w * n + d, w * d - n, w * d + n + 1].filter((t, i, a) => t > 0 && a.indexOf(t) === i);
        const opts = tops.slice(0, 3).map(t => R(t, d)).concat(R(w * d + n, w * d + (w === 1 ? 1 : 0)));
        return { prompt: `Which fraction is the same as ${mixRaw(w, n, d)}?`, type: 'choice', answer: opts[0], choices: opts, params: { kind, w, n, d },
          hints: [`Each whole is ${R(d, d)}. So ${w} whole${w > 1 ? 's are' : ' is'} ${w} × ${d} = ${w * d} ${PARTS[d]}.`, `Add the ${n} more: ${w * d} + ${n} = ${w * d + n}.`, `${mixRaw(w, n, d)} = <b>${R(w * d + n, d)}</b>.`] };
      }
      const sub = kind === 'sub' || (kind === 'word' && rng.bool());
      let w1 = rng.int(1, 6), w2 = rng.int(1, 6);
      const n1 = coprimeNum(rng, d), n2 = coprimeNum(rng, d);
      if (sub && w1 <= w2) { w1 = w2 + rng.int(1, 3); }
      const total = sub ? (w1 * d + n1) - (w2 * d + n2) : (w1 * d + n1) + (w2 * d + n2);
      const W = Math.floor(total / d), r = total % d;
      const regroup = sub ? n1 < n2 : n1 + n2 >= d;
      const prompt = kind !== 'word' ? `${sub ? 'Subtract' : 'Add'}. Give your answer as a mixed number.${big(`${mixRaw(w1, n1, d)} ${sub ? '−' : '+'} ${mixRaw(w2, n2, d)}`)}` : sub
        ? `${name} had ${mixRaw(w1, n1, d)} cups of flour and used ${mixRaw(w2, n2, d)} cups to bake bread. How many cups of flour are left?`
        : `${name} walked ${mixRaw(w1, n1, d)} miles on Monday and ${mixRaw(w2, n2, d)} miles on Tuesday. How many miles is that in all?`;
      const h2 = sub ? (regroup ? `${R(n1, d)} is smaller than ${R(n2, d)}, so borrow 1 whole: ${mixRaw(w1, n1, d)} = ${mixRaw(w1 - 1, n1 + d, d)}. Now ${w1 - 1} − ${w2} = ${w1 - 1 - w2} and ${R(n1 + d, d)} − ${R(n2, d)} = ${R(n1 + d - n2, d)}.` : `Wholes: ${w1} − ${w2} = ${w1 - w2}. Fractions: ${R(n1, d)} − ${R(n2, d)} = ${R(n1 - n2, d)}.`)
        : `Wholes: ${w1} + ${w2} = ${w1 + w2}. Fractions: ${R(n1, d)} + ${R(n2, d)} = ${R(n1 + n2, d)}.${regroup ? ` That is ${R(d, d)} = 1 whole${n1 + n2 > d ? ` and ${R(n1 + n2 - d, d)}` : ''}, so add 1 to the wholes.` : ''}`;
      return { prompt, type: 'number', answer: total / d, answerText: mixText(W, r, d), params: { kind, w1, n1, w2, n2, d, sub },
        hints: [`${kind === 'word' ? `This is ${mixRaw(w1, n1, d)} ${sub ? '−' : '+'} ${mixRaw(w2, n2, d)}. ` : ''}Work with the whole numbers and the fractions separately.`, h2, `The answer is <b>${mixRaw(W, r, d)}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'improper') return A.stripTags(q.answer).trim().split(/\s+/).map(Number)[0] === p.w * p.d + p.n;
      const v1 = p.w1 + p.n1 / p.d, v2 = p.w2 + p.n2 / p.d;
      return Math.abs((p.sub ? v1 - v2 : v1 + v2) - q.answer) < 1e-9 && q.answer > 0;
    },
  });

  A.skill({
    id: 'g4.fraction-times-whole', title: 'Multiply a fraction by a whole number',
    learn: p(`${N(3)} × ${F(2, 5)} means 3 groups of ${F(2, 5)}: ${R(2, 5)} + ${R(2, 5)} + ${R(2, 5)} = ${R(6, 5)}.`) +
      p('<b>To multiply a whole number by a fraction, multiply the whole number by the top. Keep the bottom the same.</b> The slices stay the same size; you just have more of them.') +
      p(`If the answer has a bigger top than bottom, you can also write it as a mixed number: ${R(6, 5)} = ${mixRaw(1, 1, 5)}.`) +
      example('Example', `${big(`4 × ${F(3, 8)}`)}4 × 3 = 12 on top, and keep the 8: <b>${R(12, 8)}</b>. That is the same as ${mixRaw(1, 4, 8)}.`),
    make(rng) {
      const kind = rng.pick(['plain', 'plain', 'choice', 'word']), name = rng.pick(NAMES);
      const b = rng.pick([3, 4, 5, 6, 8, 10, 12]), a = coprimeNum(rng, b), k = rng.int(2, 9), num = k * a;
      if (kind === 'choice') {
        let opts = [R(num, b), R(num, k * b), R(k + a, b), R(a, k * b), R(num + a, b)];
        opts = opts.filter((o, i) => opts.findIndex(x => A.stripTags(x).trim() === A.stripTags(o).trim()) === i).slice(0, 4);
        return { prompt: `Which is equal to this?${big(`${k} × ${R(a, b)}`)}`, type: 'choice', answer: opts[0], choices: opts, params: { kind, a, b, k },
          hints: [`${k} × ${R(a, b)} means ${k} groups of ${R(a, b)}.`, `Multiply ${k} by the top: ${k} × ${a} = ${num}. The bottom stays ${b}.`, `The answer is <b>${R(num, b)}</b>.`] };
      }
      const W = Math.floor(num / b), r = num % b;
      const prompt = kind === 'plain' ? `Multiply.${big(`${k} × ${R(a, b)}`)}` : rng.pick([
        `${name} drinks ${R(a, b)} of a liter of water every hour. How many liters does ${name} drink in ${k} hours?`,
        `A recipe needs ${R(a, b)} cup of sugar. ${name} makes the recipe ${k} times. How many cups of sugar is that?`,
        `Each lap around the park is ${R(a, b)} of a mile. ${name} runs ${k} laps. How many miles is that?`]);
      return { prompt, type: 'number', answer: num / b, answerText: fracAns(num, b), params: { kind, a, b, k },
        hints: [`${kind === 'word' ? `This is ${k} × ${R(a, b)}. ` : ''}Multiply the whole number by the top and keep the bottom.`, `${k} × ${a} = ${num}, so the answer is ${R(num, b)}.`,
          `${k} × ${R(a, b)} = <b>${R(num, b)}</b>${W ? `, which is the same as ${mixRaw(W, r, b)}` : ''}.`] };
    },
    verify(q) {
      const { kind, a, b, k } = q.params;
      let s = 0; for (let i = 0; i < k; i++) s += a / b;      // k groups of a/b
      if (kind === 'choice') { const m = A.stripTags(q.answer).trim().split(/\s+/).map(Number); return Math.abs(m[0] / m[1] - s) < 1e-9; }
      return Math.abs(q.answer - s) < 1e-9;
    },
  });

  /* ---------- Unit 6: Understand decimals ---------- */
  const dec = h => (h / 100).toFixed(h % 10 === 0 ? 1 : 2);        // hundredths → "0.4" or "0.45"
  A.skill({
    id: 'g4.decimal-fractions', title: 'Decimals and fractions',
    learn: p(`Decimals are another way to write tenths and hundredths. <b>One place after the decimal point is tenths. Two places is hundredths.</b> So 0.7 = ${R(7, 10)} and 0.07 = ${R(7, 100)}.`) +
      p(`Tenths and hundredths are friends: one tenth is the same as ten hundredths. ${R(3, 10)} = ${R(30, 100)}, and 0.3 = 0.30.`) +
      p('A whole number in front stays in front of the point. 2 and 45 hundredths is 2.45.') +
      example('Example', `${big(`${R(4, 10)} + ${R(25, 100)}`)}Change the tenths to hundredths: ${R(4, 10)} = ${R(40, 100)}. Then ${R(40, 100)} + ${R(25, 100)} = <b>${R(65, 100)}</b>, which is 0.65.`),
    make(rng) {
      const kind = rng.pick(['f2d', 'f2d', 'd2f', 'tenths', 'add', 'place']);
      if (kind === 'f2d') {
        const w = rng.chance(0.3) ? rng.int(1, 9) : 0, den = rng.pick([10, 100, 100]), n = rng.int(1, den - 1);
        const ans = M.round(w + n / den, 2);
        const shown = w ? mixRaw(w, n, den) : R(n, den);
        return { prompt: `Write this as a decimal.${big(shown)}`, type: 'number', answer: ans, params: { kind, w, n, den },
          hints: [`The bottom is ${den}, so this is ${den === 10 ? 'tenths: one place after the point' : 'hundredths: two places after the point'}.`, `${n} ${den === 10 ? 'tenths' : 'hundredths'} is ${den === 10 ? `0.${n}` : `0.${String(n).padStart(2, '0')}`}.${w ? ` Put the ${w} wholes in front of the point.` : ''}`, `The answer is <b>${N(ans)}</b>.`] };
      }
      if (kind === 'd2f') {
        const h = rng.int(1, 99);
        return { prompt: `Fill in the missing number.${big(`${dec(h)} = ${R('?', 100)}`)}`, type: 'number', answer: h, params: { kind, s: dec(h) },
          hints: [`We want hundredths, so think of ${dec(h)} with two places after the point: ${(h / 100).toFixed(2)}.`, `${(h / 100).toFixed(2)} is ${h} hundredths.`, `${dec(h)} = ${R(h, 100)}, so the missing number is <b>${h}</b>.`] };
      }
      if (kind === 'tenths') {
        const t = rng.int(1, 9);
        return { prompt: `Fill in the missing number.${big(`${R(t, 10)} = ${R('?', 100)}`)}`, type: 'number', answer: 10 * t, params: { kind, t },
          hints: [`The bottom went from 10 to 100. That is × 10.`, `Multiply the top by 10 too: ${t} × 10 = ${10 * t}.`, `${R(t, 10)} = ${R(10 * t, 100)}, so the missing number is <b>${10 * t}</b>.`] };
      }
      if (kind === 'add') {
        const t = rng.int(1, 8), h = rng.int(1, 99 - 10 * t);
        return { prompt: `Add. Give the number that goes on top.${big(`${R(t, 10)} + ${R(h, 100)} = ${R('?', 100)}`)}`, type: 'number', answer: 10 * t + h, params: { kind, t, h },
          hints: [`Make the denominators the same. Change tenths to hundredths: ${R(t, 10)} = ${R(10 * t, 100)}.`, `Now add the tops: ${10 * t} + ${h} = ${10 * t + h}.`, `The answer is ${R(10 * t + h, 100)}, so the missing number is <b>${10 * t + h}</b>.`] };
      }
      const w = rng.int(1, 99), t = rng.int(0, 9), h = rng.int(1, 9), s = `${w}.${t}${h}`, which = rng.pick(['tenths', 'hundredths']);
      if (t === h) return { prompt: `What digit is in the <b>hundredths</b> place?${big(`${w}.${(t + 1) % 10}${h}`)}`, type: 'number', answer: h, params: { kind, s: `${w}.${(t + 1) % 10}${h}`, which: 'hundredths' },
        hints: [`The first place after the point is tenths. The second place is hundredths.`, `The hundredths digit is the second one after the point: <b>${h}</b>.`] };
      const ans = which === 'tenths' ? t : h;
      return { prompt: `What digit is in the <b>${which}</b> place?${big(s)}`, type: 'number', answer: ans, params: { kind, s, which },
        hints: [`The first place after the point is tenths. The second place is hundredths.`, `The ${which} digit is the ${which === 'tenths' ? 'first' : 'second'} one after the point: <b>${ans}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'f2d') return Math.abs(q.answer * p.den - (p.w * p.den + p.n)) < 1e-6;
      if (p.kind === 'd2f') return Math.abs(Number(p.s) * 100 - q.answer) < 1e-6;
      if (p.kind === 'tenths') return q.answer / 100 === p.t / 10 || Math.abs(q.answer / 100 - p.t / 10) < 1e-12;
      if (p.kind === 'add') return Math.abs(p.t / 10 + p.h / 100 - q.answer / 100) < 1e-12;
      const frac = p.s.split('.')[1];
      return q.answer === Number(frac[p.which === 'tenths' ? 0 : 1]);
    },
  });

  A.skill({
    id: 'g4.compare-decimals', title: 'Compare decimals',
    learn: p('To compare decimals, <b>line up the decimal points and compare place by place from the left</b>: wholes first, then tenths, then hundredths.') +
      p('It helps to give both numbers the same number of places. Adding a 0 at the end of a decimal does not change it: 0.5 = 0.50. Now it is easy to see that 0.50 is more than 0.45.') +
      p('Be careful: more digits does not mean bigger. 0.45 has more digits than 0.5, but 0.5 is bigger, because 5 tenths is more than 4 tenths.') +
      example('Example', `${big('0.6 &nbsp;?&nbsp; 0.58')}Write 0.6 as 0.60. Compare tenths: 6 is more than 5. So 0.6 <b>&gt;</b> 0.58.`),
    make(rng) {
      const kind = rng.pick(['sign', 'sign', 'sign', 'most', 'least']);
      if (kind === 'sign') {
        const w = rng.chance(0.7) ? 0 : rng.int(1, 9);
        let a = rng.int(1, 99), b;
        const style = rng.pick(['tenth-vs-hundredth', 'same', 'equal', 'random']);
        if (style === 'tenth-vs-hundredth') { a = rng.int(1, 9) * 10; b = rng.int(1, 99); if (b % 10 === 0) b += rng.int(1, 9); if (b > 99) b -= 10; }
        else if (style === 'same') { b = a - a % 10 + rng.int(0, 9); }
        else if (style === 'equal') { a = rng.int(1, 9) * 10; b = a; }
        else b = rng.int(1, 99);
        const sa = (w + a / 100).toFixed(a % 10 === 0 && style !== 'equal' ? 1 : (style === 'equal' ? 1 : 2));
        const sb = (w + b / 100).toFixed(b % 10 === 0 && style !== 'equal' ? 1 : 2);
        const ans = sign(a, b), A2 = (w + a / 100).toFixed(2), B2 = (w + b / 100).toFixed(2);
        const flip = rng.bool();
        const [L, Rt, l2, r2] = flip ? [sb, sa, B2, A2] : [sa, sb, A2, B2];
        const res = flip ? sign(b, a) : ans;
        return { prompt: `Which symbol makes this true?${big(`${L} &nbsp;?&nbsp; ${Rt}`)}`, type: 'choice', answer: res, choices: SIGNS.slice(), keepOrder: true, params: { kind, L, R: Rt },
          hints: [`Give both numbers two places after the point: ${l2} and ${r2}.`, res === '=' ? `They are exactly the same.` : `Compare place by place from the left: ${l2.replace('.', '')} hundredths and ${r2.replace('.', '')} hundredths.`, `${L} <b>${res}</b> ${Rt}.`] };
      }
      const vals = new Set();
      const base = rng.int(1, 8);
      vals.add(base * 10 + rng.int(1, 9));
      vals.add((base + 1) * 10);
      while (vals.size < 4) vals.add(rng.pick([rng.int(1, 9), (base) * 10 + rng.int(0, 9), rng.int(1, 99)]));
      const arr = [...vals], strs = arr.map(dec), pickV = kind === 'most' ? Math.max(...arr) : Math.min(...arr);
      const ans = dec(pickV);
      return { prompt: `Which decimal is the <b>${kind === 'most' ? 'greatest' : 'least'}</b>?`, type: 'choice', answer: ans, choices: strs, params: { kind },
        hints: [`Give every number two places after the point: ${arr.map(h => (h / 100).toFixed(2)).join(', ')}.`, `Now compare them like whole numbers of hundredths: ${arr.join(', ')}.`, `The ${kind === 'most' ? 'greatest' : 'least'} is <b>${ans}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'sign') { const a = Number(p.L), b = Number(p.R); return q.answer === (a > b ? '&gt;' : a < b ? '&lt;' : '='); }
      const nums = q.choices.map(Number), target = p.kind === 'most' ? Math.max(...nums) : Math.min(...nums);
      return Number(q.answer) === target && nums.filter(x => x === target).length === 1;
    },
  });

  /* ---------- Unit 7: Plane figures and angles ---------- */
  const lineSvg = (rng, type) => {
    const t1 = rng.int(0, 17) * 10, gap = type === 'parallel' ? 0 : type === 'perpendicular' ? 90 : rng.pick([30, 40, 50, 60, 120, 130, 140, 150]);
    const t2 = t1 + gap, rad = t => t * Math.PI / 180, cx = 110, cy = 70;
    const seg = (t, ox, oy) => { const ux = Math.cos(rad(t)) * 60, uy = -Math.sin(rad(t)) * 60; return `<line x1="${(cx + ox - ux).toFixed(1)}" y1="${(cy + oy - uy).toFixed(1)}" x2="${(cx + ox + ux).toFixed(1)}" y2="${(cy + oy + uy).toFixed(1)}" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`; };
    let body;
    if (type === 'parallel') { const nx = -Math.sin(rad(t1)) * 22, ny = -Math.cos(rad(t1)) * 22; body = seg(t1, nx, ny) + seg(t1, -nx, -ny); }
    else {
      body = seg(t1, 0, 0) + seg(t2, 0, 0);
      if (type === 'perpendicular') { const u = [Math.cos(rad(t1)) * 10, -Math.sin(rad(t1)) * 10], v = [Math.cos(rad(t2)) * 10, -Math.sin(rad(t2)) * 10]; body += `<polyline points="${(cx + u[0]).toFixed(1)},${(cy + u[1]).toFixed(1)} ${(cx + u[0] + v[0]).toFixed(1)},${(cy + u[1] + v[1]).toFixed(1)} ${(cx + v[0]).toFixed(1)},${(cy + v[1]).toFixed(1)}" fill="none" stroke="currentColor" stroke-width="1.5"/>`; }
    }
    return { svg: `<svg class="figure" viewBox="0 0 220 140" width="220" height="140" role="img" aria-label="two lines">${body}</svg>`, gap };
  };
  const SYM = [['a square', 4], ['a rectangle that is not a square', 2], ['an equilateral triangle', 3], ['an isosceles triangle that is not equilateral', 1], ['a scalene triangle', 0],
    ['a regular pentagon (5 equal sides and angles)', 5], ['a regular hexagon (6 equal sides and angles)', 6], ['a regular octagon (8 equal sides and angles)', 8], ['a rhombus that is not a square', 2], ['a parallelogram that is not a rectangle or a rhombus', 0]];
  A.skill({
    id: 'g4.lines-shapes', title: 'Lines, symmetry, and triangles',
    learn: p('<b>Parallel</b> lines go the same direction and never meet, like the two rails of a train track. <b>Perpendicular</b> lines cross and make a square corner, a right angle, like the corner of a page.') +
      p('A <b>line of symmetry</b> folds a shape into two halves that match exactly. A square has 4 lines of symmetry; a rectangle that is not a square has only 2.') +
      p('Triangles get names from their sides: <b>equilateral</b> (all 3 sides equal), <b>isosceles</b> (2 sides equal), <b>scalene</b> (no sides equal). They also get names from their angles: <b>right</b> (one right angle), <b>obtuse</b> (one angle bigger than a right angle), <b>acute</b> (all angles smaller than a right angle).') +
      example('Example', `A triangle has sides of 6 cm, 6 cm and 9 cm. Two sides are equal, so it is <b>isosceles</b>.`),
    make(rng) {
      const kind = rng.pick(['sides', 'angles', 'lines', 'lines', 'symmetry']);
      if (kind === 'sides') {
        const type = rng.pick(['Equilateral', 'Isosceles', 'Scalene']);
        let s;
        if (type === 'Equilateral') { const a = rng.int(3, 15); s = [a, a, a]; }
        else if (type === 'Isosceles') { const a = rng.int(4, 15); let b = rng.int(2, 2 * a - 1); if (b === a) b = a + 1; s = rng.shuffle([a, a, b]); }
        else { for (;;) { s = [rng.int(3, 15), rng.int(3, 15), rng.int(3, 15)].sort((x, y) => x - y); if (s[0] !== s[1] && s[1] !== s[2] && s[0] + s[1] > s[2]) break; } s = rng.shuffle(s); }
        const eq = new Set(s).size;
        return { prompt: `A triangle has sides that are ${s[0]} cm, ${s[1]} cm and ${s[2]} cm long. What kind of triangle is it?`, type: 'choice', answer: type, choices: ['Equilateral', 'Isosceles', 'Scalene'], keepOrder: true, params: { kind, s },
          hints: [`Look for sides that are the same length.`, eq === 1 ? `All three sides are ${s[0]} cm.` : eq === 2 ? `Exactly two sides are equal.` : `All three sides are different.`, `So it is an <b>${type.toLowerCase()}</b> triangle.`.replace('an scalene', 'a scalene')] };
      }
      if (kind === 'angles') {
        const type = rng.pick(['Acute', 'Right', 'Obtuse']);
        let a, b;
        if (type === 'Right') { a = 90; b = rng.int(10, 80); }
        else if (type === 'Obtuse') { a = rng.int(95, 150); b = rng.int(10, 170 - a); }
        else { a = rng.int(50, 85); b = rng.int(Math.max(91 - a, 20), 85); }
        const ang = rng.shuffle([a, b, 180 - a - b]), mx = Math.max(...ang);
        return { prompt: `A triangle has angles of ${M.deg(ang[0])}, ${M.deg(ang[1])} and ${M.deg(ang[2])}. What kind of triangle is it?`, type: 'choice', answer: type, choices: ['Acute', 'Right', 'Obtuse'], keepOrder: true, params: { kind, ang },
          hints: [`Look at the biggest angle. A right angle is exactly 90°.`, `The biggest angle is ${M.deg(mx)}, which is ${mx === 90 ? 'exactly a right angle' : mx > 90 ? 'more than 90°' : 'less than 90°, and so are the others'}.`, `So it is ${type === 'Acute' ? 'an' : 'a'} <b>${type.toLowerCase()}</b> triangle.`] };
      }
      if (kind === 'lines') {
        const type = rng.pick(['parallel', 'perpendicular', 'neither']);
        const { svg, gap } = lineSvg(rng, type);
        const ans = type === 'neither' ? 'Neither' : type[0].toUpperCase() + type.slice(1);
        return { prompt: `Are these two lines parallel, perpendicular, or neither?${svg}`, type: 'choice', answer: ans, choices: ['Parallel', 'Perpendicular', 'Neither'], keepOrder: true, params: { kind, gap },
          hints: [`Parallel lines never cross. Perpendicular lines cross and make a square corner.`, type === 'parallel' ? `These lines go the same way and never meet.` : type === 'perpendicular' ? `These lines cross, and the little square shows a right angle.` : `These lines cross, but the corner is not square.`, `They are <b>${ans.toLowerCase()}</b>.`] };
      }
      const [shape, lines] = rng.pick(SYM);
      return { prompt: `How many lines of symmetry does ${shape} have?`, type: 'number', answer: lines, params: { kind, shape },
        hints: [`A line of symmetry folds the shape so the two halves match exactly. Imagine folding it in different ways.`, lines === 0 ? `No fold makes the two halves match.` : `Try folds through corners and through the middles of sides.`, `${shape[0].toUpperCase() + shape.slice(1)} has <b>${lines}</b> line${lines === 1 ? '' : 's'} of symmetry.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'sides') { const [a, b, c] = p.s; const same = (a === b) + (b === c) + (a === c); return a + b > c && b + c > a && a + c > b && q.answer === (same === 3 ? 'Equilateral' : same === 1 ? 'Isosceles' : 'Scalene'); }
      if (p.kind === 'angles') return p.ang.reduce((s, x) => s + x, 0) === 180 && p.ang.every(x => x > 0) && q.answer === (p.ang.some(x => x > 90) ? 'Obtuse' : p.ang.includes(90) ? 'Right' : 'Acute');
      if (p.kind === 'lines') return q.answer === (p.gap % 180 === 0 ? 'Parallel' : p.gap % 180 === 90 ? 'Perpendicular' : 'Neither');
      const regular = p.shape.match(/regular \w+ \((\d) equal/), tri = { 'an equilateral triangle': 3, 'a scalene triangle': 0 };
      if (regular) return q.answer === Number(regular[1]);                     // a regular polygon has as many lines as sides
      if (p.shape in tri) return q.answer === tri[p.shape];
      if (/square/.test(p.shape) && !/not a square/.test(p.shape)) return q.answer === 4;
      if (/rectangle that|rhombus that/.test(p.shape)) return q.answer === 2;
      if (/isosceles/.test(p.shape)) return q.answer === 1;
      return q.answer === 0;
    },
  });

  const protractor = (theta) => {
    const cx = 120, cy = 118, r = 100, P = (deg, rr) => [cx + rr * Math.cos(deg * Math.PI / 180), cy - rr * Math.sin(deg * Math.PI / 180)];
    let s = `<path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".6"/>`;
    for (let d = 0; d <= 180; d += 10) { const [x1, y1] = P(d, r), [x2, y2] = P(d, d % 30 === 0 ? r - 10 : r - 6); s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="currentColor" stroke-width="1" opacity=".6"/>`; }
    for (let d = 0; d <= 180; d += 30) { const [x, y] = P(d, r + 13); s += `<text x="${x.toFixed(1)}" y="${(y + 3).toFixed(1)}" font-size="10" text-anchor="middle" fill="currentColor" opacity=".75">${d}</text>`; }
    const [ex, ey] = P(theta, r);
    s += `<line x1="${cx}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`;
    s += `<line x1="${cx}" y1="${cy}" x2="${ex.toFixed(2)}" y2="${ey.toFixed(2)}" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="3" fill="currentColor"/>`;
    return { svg: `<svg class="figure" viewBox="-6 -10 252 140" width="252" height="140" role="img" aria-label="an angle on a protractor">${s}</svg>`, dx: +(ex - cx).toFixed(2), dy: +(cy - ey).toFixed(2) };
  };
  A.skill({
    id: 'g4.angles', title: 'Angles',
    learn: p('An angle is made by two rays that start at the same point. We measure angles in <b>degrees</b> (°). A full turn all the way around is <b>360°</b>, so a quarter turn is 90°.') +
      p('Angles have names by size: <b>acute</b> is less than 90°, <b>right</b> is exactly 90° (a square corner), <b>obtuse</b> is between 90° and 180°, and <b>straight</b> is exactly 180° (a straight line).') +
      p('<b>When an angle is split into parts, the parts add up to the whole angle.</b> If a 90° angle is split and one part is 35°, the other part is 90° − 35° = 55°.') +
      example('Example', `Ray BD splits ∠ABC into ∠ABD = 40° and ∠DBC = 75°. The whole angle is 40° + 75° = <b>115°</b>, which is obtuse.`),
    make(rng) {
      const kind = rng.pick(['type', 'protractor', 'protractor', 'add', 'missing', 'turn']);
      if (kind === 'type') {
        const t = rng.pick(['Acute', 'Right', 'Obtuse', 'Straight', 'Acute', 'Obtuse']);
        const deg = t === 'Acute' ? rng.int(5, 89) : t === 'Right' ? 90 : t === 'Obtuse' ? rng.int(91, 179) : 180;
        return { prompt: `An angle measures ${M.deg(deg)}. What kind of angle is it?`, type: 'choice', answer: t, choices: ['Acute', 'Right', 'Obtuse', 'Straight'], keepOrder: true, params: { kind, deg },
          hints: [`Compare with 90° (a square corner) and 180° (a straight line).`, deg < 90 ? `${M.deg(deg)} is less than 90°.` : deg === 90 ? `It is exactly 90°.` : deg < 180 ? `${M.deg(deg)} is more than 90° but less than 180°.` : `It is exactly 180°.`, `So it is ${t === 'Acute' || t === 'Obtuse' ? 'an' : 'a'} <b>${t.toLowerCase()}</b> angle.`] };
      }
      if (kind === 'protractor') {
        const theta = rng.int(2, 17) * 10, { svg, dx, dy } = protractor(theta);
        const lo = Math.floor(theta / 30) * 30;
        return { prompt: `The angle is placed on a protractor. One ray points at 0. What does the angle measure?${svg}`, type: 'number', answer: theta, unit: '°', params: { kind, dx, dy },
          hints: [`Start at 0 on the right and follow the scale around. Each small tick is 10°.`, theta % 30 === 0 ? `The second ray points right at the label ${theta}.` : `The second ray is past the label ${lo}, by ${(theta - lo) / 10} tick${theta - lo === 10 ? '' : 's'}.`, `The angle measures <b>${M.deg(theta)}</b>.`] };
      }
      if (kind === 'turn') {
        const [n, d] = rng.pick([[1, 4], [1, 2], [3, 4], [1, 3], [2, 3], [1, 6], [1, 12], [1, 8], [5, 12], [1, 10], [1, 5]]);
        const ans = 360 / d * n;
        return { prompt: `A wheel turns through ${F(n, d)} of a full circle. How many degrees is that?`, type: 'number', answer: ans, unit: '°', params: { kind, n, d },
          hints: [`A full circle is 360°.`, `Find ${F(1, d)} of 360° first: 360 ÷ ${d} = ${360 / d}°.${n > 1 ? ` Then take ${n} of those.` : ''}`, `${n > 1 ? `${n} × ${360 / d}° = ` : ''}<b>${M.deg(ans)}</b>.`] };
      }
      const a = rng.int(2, 9) * 5 + rng.pick([0, 0, 2, 3]);
      if (kind === 'add') {
        const b = rng.int(10, 120);
        return { prompt: `Ray BD splits ∠ABC into two angles. ∠ABD = ${M.deg(a)} and ∠DBC = ${M.deg(b)}. What is the measure of ∠ABC?`, type: 'number', answer: a + b, unit: '°', params: { kind, parts: [a, b] },
          hints: [`The two smaller angles fit together to make the big angle.`, `So add them: ${M.deg(a)} + ${M.deg(b)}.`, `∠ABC = <b>${M.deg(a + b)}</b>.`] };
      }
      const whole = rng.pick([90, 90, 180, rng.int(10, 17) * 10]);
      const desc = whole === 90 ? '∠ABC is a right angle.' : whole === 180 ? 'Points A, B and C are on a straight line, so ∠ABC is a straight angle.' : `∠ABC measures ${M.deg(whole)}.`;
      return { prompt: `${desc} Ray BD is inside it, and ∠ABD = ${M.deg(a)}. What is the measure of ∠DBC?`, type: 'number', answer: whole - a, unit: '°', params: { kind, whole, a },
        hints: [`The two parts add up to the whole angle${whole === 90 ? ', which is 90°' : whole === 180 ? ', which is 180°' : ''}.`, `So ∠DBC = ${M.deg(whole)} − ${M.deg(a)}.`, `∠DBC = <b>${M.deg(whole - a)}</b>. Check: ${M.deg(a)} + ${M.deg(whole - a)} = ${M.deg(whole)} ✓`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'type') return q.answer === ['Acute', 'Right', 'Obtuse', 'Straight'][p.deg < 90 ? 0 : p.deg === 90 ? 1 : p.deg < 180 ? 2 : 3];
      if (p.kind === 'protractor') return Math.round(Math.atan2(p.dy, p.dx) * 180 / Math.PI) === q.answer;     // the angle of the drawn ray
      if (p.kind === 'turn') { let s = 0; for (let i = 0; i < p.n; i++) s += 360 / p.d; return Math.abs(s - q.answer) < 1e-9; }
      if (p.kind === 'add') return q.answer - p.parts[0] === p.parts[1];
      return q.answer + p.a === p.whole && q.answer > 0;
    },
  });

  /* ---------- Unit 8: Area, perimeter, and units ---------- */
  A.skill({
    id: 'g4.area-perimeter', title: 'Area and perimeter',
    learn: p('<b>Perimeter</b> is the distance all the way around a shape. For a rectangle, add up all four sides: length + width + length + width.') +
      p('<b>Area</b> is how much space is inside, counted in unit squares. <b>For a rectangle, area = length × width.</b> Area is measured in square units, like square centimeters.') +
      p('Working backwards: if you know the area and one side, divide to find the other side. If you know the perimeter and one side, take away two of that side, then halve what is left.') +
      example('Example', `A rectangle is 9 m long and 4 m wide. Perimeter: 9 + 4 + 9 + 4 = <b>26 m</b>. Area: 9 × 4 = <b>36 square meters</b>.`),
    make(rng) {
      const kind = rng.pick(['area', 'perim', 'side-area', 'side-perim', 'word-area', 'word-perim']), name = rng.pick(NAMES);
      const [u, uw] = rng.pick(/word/.test(kind) ? [['m', 'meters'], ['ft', 'feet']] : [['cm', 'centimeters'], ['m', 'meters'], ['ft', 'feet'], ['in', 'inches']]);
      let L = rng.int(4, 25), W = rng.int(2, 15); if (W === L) W--; if (W > L) [L, W] = [W, L];
      const area = L * W, per = 2 * (L + W), sq = `square ${uw}`;
      if (kind === 'area' || kind === 'word-area') {
        const prompt = kind === 'area' ? `A rectangle is ${L} ${u} long and ${W} ${u} wide. What is its area?` : `${name} is putting carpet in a room that is ${L} ${uw} long and ${W} ${uw} wide. How many square ${uw} of carpet are needed?`;
        return { prompt, type: 'number', answer: area, unit: `sq ${u}`, params: { kind, L, W },
          hints: [`Area means the space inside${kind === 'word-area' ? ': carpet covers the floor' : ''}. For a rectangle, multiply length × width.`, `${L} × ${W} = ${area}.`, `The area is <b>${area} ${sq}</b>.`] };
      }
      if (kind === 'perim' || kind === 'word-perim') {
        const prompt = kind === 'perim' ? `A rectangle is ${L} ${u} long and ${W} ${u} wide. What is its perimeter?` : `${name} wants to put a fence all the way around a garden that is ${L} ${uw} long and ${W} ${uw} wide. How many ${uw} of fence are needed?`;
        return { prompt, type: 'number', answer: per, unit: u, params: { kind, L, W },
          hints: [`Perimeter means the distance all the way around${kind === 'word-perim' ? ': a fence goes around the edge' : ''}. Add all four sides.`, `${L} + ${W} + ${L} + ${W} = ${per}.`, `The perimeter is <b>${per} ${uw}</b>.`] };
      }
      if (kind === 'side-area') {
        return { prompt: `A rectangle has an area of ${area} square ${uw}. It is ${W} ${uw} wide. How long is it?`, type: 'number', answer: L, unit: u, params: { kind, area, W },
          hints: [`Area = length × width, so ? × ${W} = ${area}.`, `Divide to undo the multiplying: ${area} ÷ ${W} = ${L}.`, `The rectangle is <b>${L} ${uw}</b> long. Check: ${L} × ${W} = ${area} ✓`] };
      }
      return { prompt: `A rectangle has a perimeter of ${per} ${uw}. It is ${W} ${uw} wide. How long is it?`, type: 'number', answer: L, unit: u, params: { kind, per, W },
        hints: [`The two widths together are ${W} + ${W} = ${2 * W} ${uw}.`, `That leaves ${per} − ${2 * W} = ${per - 2 * W} ${uw} for the two lengths. Half of that is ${(per - 2 * W) / 2}.`, `The rectangle is <b>${L} ${uw}</b> long. Check: ${L} + ${W} + ${L} + ${W} = ${per} ✓`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'area' || p.kind === 'word-area') { let c = 0; for (let r = 0; r < p.W; r++) for (let k = 0; k < p.L; k++) c++; return q.answer === c; }   // count the unit squares
      if (p.kind === 'perim' || p.kind === 'word-perim') return q.answer === p.L + p.W + p.L + p.W;
      if (p.kind === 'side-area') return q.answer * p.W === p.area;
      return q.answer + p.W + q.answer + p.W === p.per;
    },
  });

  const CONV = [['kilometers', 'meters', 1000], ['meters', 'centimeters', 100], ['kilograms', 'grams', 1000], ['liters', 'milliliters', 1000], ['hours', 'minutes', 60],
    ['minutes', 'seconds', 60], ['feet', 'inches', 12], ['yards', 'feet', 3], ['pounds', 'ounces', 16], ['weeks', 'days', 7], ['days', 'hours', 24]];
  const IN_SMALLEST = { kilometers: 100000, meters: 100, centimeters: 1, kilograms: 1000, grams: 1, liters: 1000, milliliters: 1, weeks: 10080, days: 1440, hours: 60, minutes: 1, yards: 36, feet: 12, inches: 1, pounds: 16, ounces: 1 };
  const one = u => ({ kilometers: 'kilometer', meters: 'meter', centimeters: 'centimeter', kilograms: 'kilogram', grams: 'gram', liters: 'liter', milliliters: 'milliliter', hours: 'hour', minutes: 'minute', seconds: 'second', feet: 'foot', inches: 'inch', yards: 'yard', pounds: 'pound', ounces: 'ounce', weeks: 'week', days: 'day' }[u]);
  A.skill({
    id: 'g4.unit-conversion', title: 'Convert units of measurement',
    learn: p('Big units are made of many small units. 1 meter is 100 centimeters, 1 kilometer is 1,000 meters, 1 kilogram is 1,000 grams, 1 liter is 1,000 milliliters, 1 hour is 60 minutes, 1 foot is 12 inches, 1 yard is 3 feet and 1 pound is 16 ounces.') +
      p('<b>To change a big unit into a small unit, multiply.</b> You need many small units to make the same amount, so the number gets bigger.') +
      p('For an amount like 3 feet 5 inches, change the feet into inches first, then add the extra inches.') +
      example('Example', `${big('4 hours 15 minutes = ? minutes')}1 hour is 60 minutes, so 4 hours is 4 × 60 = 240 minutes. Add the 15: 240 + 15 = <b>255 minutes</b>.`),
    make(rng) {
      const kind = rng.pick(['simple', 'simple', 'mixed', 'word', 'compare']), name = rng.pick(NAMES);
      const [bigU, small, f] = rng.pick(CONV);
      const k = rng.int(2, f >= 100 ? 9 : 12), ans = k * f;
      if (kind === 'compare') {
        let other = ans + rng.pick([-1, 1]) * rng.int(1, Math.max(2, Math.floor(f / 2))) * (f >= 100 ? 10 : 1);
        if (rng.chance(0.2)) other = ans;
        if (other <= 0) other = ans + f;
        const opts = [`${k} ${bigU}`, `${N(other)} ${small}`, 'They are the same'];
        const right = ans > other ? opts[0] : ans < other ? opts[1] : opts[2];
        const word = /meters|feet|yards|inches/.test(bigU) ? 'longer' : /grams|pounds/.test(bigU) ? 'heavier' : /liters/.test(bigU) ? 'more' : 'longer';
        return { prompt: `Which is ${word}: ${k} ${bigU} or ${N(other)} ${small}?`, type: 'choice', answer: right, choices: opts, keepOrder: true, params: { kind, bigU, small, k, other },
          hints: [`Change both into ${small}. 1 ${one(bigU)} = ${N(f)} ${small}.`, `${k} ${bigU} = ${k} × ${N(f)} = ${N(ans)} ${small}. Compare ${N(ans)} with ${N(other)}.`, ans === other ? `<b>They are the same</b>.` : `<b>${right}</b> is ${word}.`] };
      }
      if (kind === 'mixed') {
        const extra = rng.int(1, Math.min(f - 1, f >= 100 ? 99 : f - 1));
        return { prompt: `Fill in the missing number.${big(`${k} ${bigU} ${N(extra)} ${extra === 1 ? one(small) : small} = ? ${small}`)}`, type: 'number', answer: ans + extra, unit: small, params: { kind, bigU, small, k, extra },
          hints: [`1 ${one(bigU)} = ${N(f)} ${small}. So ${k} ${bigU} = ${k} × ${N(f)} = ${N(ans)} ${small}.`, `Add the extra ${N(extra)}: ${N(ans)} + ${N(extra)}.`, `The answer is <b>${N(ans + extra)}</b> ${small}.`] };
      }
      const story = {
        kilometers: `${name} rode a bike ${k} kilometers. How many meters is that?`, meters: `${name} has a rope that is ${k} meters long. How long is the rope in centimeters?`,
        kilograms: `A bag of rice weighs ${k} kilograms. How many grams is that?`, liters: `A jug holds ${k} liters of juice. How many milliliters is that?`,
        hours: `A car trip takes ${k} hours. How many minutes is that?`, minutes: `${name} practiced piano for ${k} minutes. How many seconds is that?`,
        feet: `A table is ${k} feet long. How many inches long is it?`, yards: `${name} swam ${k} yards. How many feet is that?`,
        pounds: `A puppy weighs ${k} pounds. How many ounces is that?`, weeks: `A summer camp lasts ${k} weeks. How many days is that?`, days: `A trip lasts ${k} days. How many hours is that?` }[bigU];
      const prompt = kind === 'simple' ? `Fill in the missing number.${big(`${k} ${bigU} = ? ${small}`)}` : story;
      return { prompt, type: 'number', answer: ans, unit: small, params: { kind, bigU, small, k },
        hints: [`1 ${one(bigU)} = ${N(f)} ${small}. Going from a big unit to a small unit, multiply.`, `${k} × ${N(f)} = ${N(ans)}.`, `${k} ${bigU} = <b>${N(ans)} ${small}</b>.`] };
    },
    verify(q) {
      const p = q.params, s = IN_SMALLEST[p.small] || 1 / 60, b = IN_SMALLEST[p.bigU];
      const smallVal = p.small === 'seconds' ? 1 / 60 : s;
      const total = Math.round(p.k * b / smallVal) + (p.extra || 0);
      if (p.kind === 'compare') { const r = Math.abs(total - p.other) < 1e-9 ? 'They are the same' : total > p.other ? `${p.k} ${p.bigU}` : `${N(p.other)} ${p.small}`; return q.answer === r; }
      return Math.abs(q.answer - total) < 1e-6;
    },
  });


  /* ---------- Unit 9: estimation and mental math ---------- */
  const roundTo = (x, place) => Math.round(x / place) * place;
  A.skill({
    id: 'g4.estimate-sum-diff', title: 'Estimating sums and differences',
    learn: p('An <b>estimate</b> is a quick answer that is close to the exact one. To estimate a sum or a difference, <b>round each number first</b>, then add or subtract the rounded numbers, which is easy to do in your head.') +
      p('Round to the place the question asks for. An estimate is a great way to <b>check</b> an exact answer: if they are far apart, look for a slip.') +
      example('Example', `${big('Estimate 4,382 + 2,617 by rounding to the nearest hundred.')}4,382 rounds to 4,400 and 2,617 rounds to 2,600. Add: 4,400 + 2,600 = <b>7,000</b>. The exact sum, 6,999, is very close.`),
    make(rng) {
      const sub = rng.bool(), best = rng.chance(0.4);
      if (best) {
        let a = rng.int(1200, 8800), b = rng.int(1200, 8800);
        if (sub && b > a) [a, b] = [b, a];
        if (sub && a - b < 1000) a += 2000;
        const est = sub ? roundTo(a, 1000) - roundTo(b, 1000) : roundTo(a, 1000) + roundTo(b, 1000), exact = sub ? a - b : a + b;
        const wrong = [est + 2000, est * 10, est - 2000 > 0 ? est - 2000 : est + 4000];
        const answer = N(est);
        return { prompt: `Which is the best estimate of the ${sub ? 'difference' : 'sum'}?${big(`${N(a)} ${sub ? '−' : '+'} ${N(b)}`)}`, type: 'choice', choices: [answer].concat(wrong.map(N)), answer, params: { kind: 'best', a, b, sub, exact },
          hints: [`Round each number to the nearest thousand: ${N(a)} is about ${N(roundTo(a, 1000))}, and ${N(b)} is about ${N(roundTo(b, 1000))}.`, `${sub ? 'Subtract' : 'Add'} the rounded numbers: ${N(roundTo(a, 1000))} ${sub ? '−' : '+'} ${N(roundTo(b, 1000))} = ${N(est)}.`, `The best estimate is <b>${N(est)}</b>. (The exact answer is ${N(exact)}.)`] };
      }
      const place = rng.pick([10, 100, 1000]);
      let a = place === 10 ? rng.int(120, 980) : place === 100 ? rng.int(1200, 9800) : rng.int(12000, 98000), b = place === 10 ? rng.int(110, 890) : place === 100 ? rng.int(1100, 8900) : rng.int(11000, 89000);
      if (sub && b > a) [a, b] = [b, a];
      const ra = roundTo(a, place), rb = roundTo(b, place), ans = sub ? ra - rb : ra + rb;
      const name = rng.pick(NAMES), word = rng.chance(0.4);
      const nm = { 10: 'ten', 100: 'hundred', 1000: 'thousand' }[place];
      const prompt = word ? (sub ? `${name}'s school collected ${N(a)} cans in March and ${N(b)} cans in April. Estimate how many more cans were collected in March, rounding each number to the nearest ${nm}.` : `A theater sold ${N(a)} tickets on Friday and ${N(b)} on Saturday. Estimate the total, rounding each number to the nearest ${nm}.`)
        : `Estimate by rounding each number to the nearest ${nm}.${big(`${N(a)} ${sub ? '−' : '+'} ${N(b)}`)}`;
      return { prompt, type: 'number', answer: ans, params: { kind: 'round', a, b, sub, place },
        hints: [`${N(a)} rounds to ${N(ra)}.`, `${N(b)} rounds to ${N(rb)}.`, `${N(ra)} ${sub ? '−' : '+'} ${N(rb)} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'round') return q.answer === (P.sub ? roundTo(P.a, P.place) - roundTo(P.b, P.place) : roundTo(P.a, P.place) + roundTo(P.b, P.place));
      const val = c => Number(A.stripTags(c).replace(/,/g, ''));
      const d = q.choices.map(c => Math.abs(val(c) - P.exact));
      return d.indexOf(Math.min.apply(null, d)) === q.choices.indexOf(q.answer) && d.filter(x => x === Math.min.apply(null, d)).length === 1;
    },
  });

  A.skill({
    id: 'g4.mental-math', title: 'Mental math shortcuts',
    learn: p('Some sums and products are quick to do in your head with a shortcut. <b>Adding 99 or 299?</b> Add 100 or 300, then take away 1. <b>Subtracting 99?</b> Subtract 100, then add 1 back.') +
      p('<b>Times 5?</b> Multiply by 10, then halve it, because 5 is half of 10. <b>Times 25?</b> Multiply by 100, then take a quarter. <b>Times 50?</b> Multiply by 100, then halve it.') +
      example('Example', `${big('48 × 5')}48 × 10 = 480, and half of 480 is <b>240</b>.`),
    make(rng) {
      const kind = rng.pick(['add', 'sub', 'five', 'quarter', 'fifty']);
      let a, b, ans, prompt, hints;
      if (kind === 'add') { b = rng.pick([99, 199, 299, 98, 198]); a = rng.int(112, 689); const up = Math.ceil(b / 100) * 100, off = up - b; ans = a + b; prompt = `Add in your head.${big(`${N(a)} + ${b}`)}`; hints = [`${b} is ${off} less than ${up}.`, `Add ${up}: ${a} + ${up} = ${a + up}. Then take away ${off}.`, `${a + up} − ${off} = <b>${N(ans)}</b>.`]; }
      else if (kind === 'sub') { b = rng.pick([99, 199, 98, 299]); a = rng.int(b + 120, 999); const up = Math.ceil(b / 100) * 100, off = up - b; ans = a - b; prompt = `Subtract in your head.${big(`${N(a)} − ${b}`)}`; hints = [`${b} is ${off} less than ${up}.`, `Subtract ${up}: ${a} − ${up} = ${a - up}. You took away ${off} too many, so add ${off} back.`, `${a - up} + ${off} = <b>${N(ans)}</b>.`]; }
      else if (kind === 'five') { a = rng.int(6, 49) * 2; b = 5; ans = a * 5; prompt = `Multiply in your head.${big(`${a} × 5`)}`; hints = ['5 is half of 10, so multiply by 10 and halve it.', `${a} × 10 = ${a * 10}.`, `Half of ${a * 10} is <b>${N(ans)}</b>.`]; }
      else if (kind === 'quarter') { a = rng.int(2, 24) * 4; b = 25; ans = a * 25; prompt = `Multiply in your head.${big(`${a} × 25`)}`; hints = ['25 is a quarter of 100, so multiply by 100 and take a quarter.', `${a} × 100 = ${N(a * 100)}.`, `A quarter of ${N(a * 100)} is <b>${N(ans)}</b>.`]; }
      else { a = rng.int(3, 49) * 2; b = 50; ans = a * 50; prompt = `Multiply in your head.${big(`${a} × 50`)}`; hints = ['50 is half of 100, so multiply by 100 and halve it.', `${a} × 100 = ${N(a * 100)}.`, `Half of ${N(a * 100)} is <b>${N(ans)}</b>.`]; }
      return { prompt, type: 'number', answer: ans, params: { kind, a, b }, hints };
    },
    verify(q) { const { kind, a, b } = q.params; return q.answer === (kind === 'add' ? a + b : kind === 'sub' ? a - b : a * b); },
  });

})();
