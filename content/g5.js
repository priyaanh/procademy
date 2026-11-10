/* 5th grade math. Decimal place value, adding and subtracting decimals and fractions, multi-digit
   multiplication and division, multiplying and dividing fractions and decimals, powers of ten, volume,
   the coordinate plane, algebraic thinking, measurement and data, and shapes. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n;
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = s => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const svg = (w, h, body, label) => `<svg class="figure" viewBox="0 0 ${w} ${h}" width="${w}" role="img" aria-label="${label}">${body}</svg>`;
  const fx = (n, d) => F(n, d, { raw: true });
  /** "4 1/12", "3/4", "5": a simplified fraction as a mixed number in plain text */
  const mixText = (n, d) => { [n, d] = M.simp(n, d); const w = Math.floor(n / d), r = n % d; return r === 0 ? String(w) : w === 0 ? `${r}/${d}` : `${w} ${r}/${d}`; };
  /** a mixed number exactly as given, e.g. 2 and 3/6 without simplifying */
  const mixRaw = (w, n, d) => n === 0 ? N(w) : w === 0 ? fx(n, d) : `${w}<span class="mixed">${fx(n, d)}</span>`;
  /** a simplified fraction, followed by its mixed-number form when it is more than 1 */
  const showFrac = (n, d) => { const [a, b] = M.simp(n, d); return (b === 1 || a < b) ? F(a, b) : `${F(a, b)} = ${M.mixed(a, b)}`; };
  /** integer I read as a decimal with `places` digits after the point: decStr(305, 2) → "3.05" */
  const decStr = (I, places) => { if (!places) return String(I); const s = String(I).padStart(places + 1, '0'); return s.slice(0, -places) + '.' + s.slice(-places); };
  const coprimeTo = (rng, d) => { const opts = []; for (let k = 1; k < d; k++) if (M.gcd(k, d) === 1) opts.push(k); return rng.pick(opts); };
  const lcm = (a, b) => a * b / M.gcd(a, b);

  A.course({
    id: 'math-5', title: '5th grade math', subject: 'Elementary', grade: 5, icon: '5', hue: 120,
    blurb: 'Decimals and fractions with all four operations, long multiplication and division, powers of ten, volume, the coordinate plane, patterns, measurement, and shapes.',
    units: [
      { id: 'decimals', title: 'Decimal place value, adding and subtracting', blurb: 'What each digit is worth, comparing and rounding, and adding and subtracting decimals.', skills: ['g5.decimal-place-value', 'g5.compare-round-decimals', 'g5.add-sub-decimals'] },
      { id: 'add-fractions', title: 'Add and subtract fractions', blurb: 'Unlike denominators, mixed numbers, and word problems.', skills: ['g5.add-sub-fractions', 'g5.add-sub-mixed-numbers'] },
      { id: 'multi-digit', title: 'Multi-digit multiplication and division', blurb: 'Multiplying by two-digit numbers and dividing by two-digit divisors.', skills: ['g5.multiply-multi-digit', 'g5.divide-two-digit'] },
      { id: 'mult-div-fractions', title: 'Multiply and divide fractions', blurb: 'Fractions of numbers, areas with fraction sides, multiplying as scaling, and dividing with unit fractions.', skills: ['g5.multiply-fractions', 'g5.fraction-area', 'g5.divide-unit-fractions'] },
      { id: 'mult-div-decimals', title: 'Powers of ten, multiplying and dividing decimals', blurb: 'Exponents, shifting digits by powers of ten, and decimal products and quotients.', skills: ['g5.powers-of-ten', 'g5.multiply-divide-decimals'] },
      { id: 'volume', title: 'Volume', blurb: 'Counting unit cubes, V = l × w × h, and figures made of two boxes.', skills: ['g5.volume-prisms', 'g5.composite-volume'] },
      { id: 'coordinate-algebra', title: 'Coordinate plane and algebraic thinking', blurb: 'Reading and plotting points, order of operations, writing expressions, and patterns.', skills: ['g5.coordinate-plane', 'g5.order-of-operations', 'g5.numerical-patterns'] },
      { id: 'measure-shapes', title: 'Measurement, data, and shapes', blurb: 'Converting units, line plots with fractions, and sorting triangles and quadrilaterals.', skills: ['g5.unit-conversion', 'g5.line-plots', 'g5.classify-shapes', 'g5.line-graphs'] },
      { id: 'mental-math', title: 'Mental math and estimation', blurb: 'Multiplying by 9, 11 and 99 in your head, and estimating products and quotients.', skills: ['g5.times-11', 'g5.estimate-products'] },
    ],
  });

  /* ---------- Unit 1: decimal place value, adding and subtracting ---------- */
  const PLACES = ['tens', 'ones', 'tenths', 'hundredths', 'thousandths'];
  const PLACE_ONE = ['ten', 'one', 'tenth', 'hundredth', 'thousandth'];
  const PLACE_VAL = ['10', '1', '0.1', '0.01', '0.001'];
  /** what the digit at string position `pos` is worth, worked out from where the decimal point is */
  const digitValue = (str, pos) => { const dot = str.indexOf('.'); const e = pos < dot ? dot - pos - 1 : dot - pos; return Number(str[pos]) * Math.pow(10, e); };

  A.skill({
    id: 'g5.decimal-place-value', title: 'Decimal place value',
    learn: p('Every digit in a number sits in a <b>place</b>, and the place tells you what the digit is worth. Right after the decimal point come the <b>tenths</b>, then the <b>hundredths</b>, then the <b>thousandths</b>.') +
      p(`<b>Each place is worth 10 times the place to its right</b>, and ${F(1, 10)} of the place to its left. So 1 tenth is the same as 10 hundredths, and 1 hundredth is the same as 10 thousandths.`) +
      p('When a number is written in pieces, like 3 ones + 5 hundredths, put each digit in its place and write a 0 in any place that is empty.') +
      example('Example', `${big('4.385')}The 4 is in the ones place, so it is worth 4. The 3 is 3 tenths = 0.3. The 8 is 8 hundredths = 0.08. The 5 is 5 thousandths = <b>0.005</b>. So 4.385 = 4 + 0.3 + 0.08 + 0.005.`),
    make(rng) {
      const kind = rng.pick(['digit', 'digit', 'expanded', 'times']);
      if (kind === 'digit') {
        const ds = rng.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 5);
        const str = `${ds[0]}${ds[1]}.${ds[2]}${ds[3]}${ds[4]}`;
        const i = rng.int(0, 4), digit = ds[i];
        const ans = M.round(digit * Number(PLACE_VAL[i]), 3);
        return { prompt: `What is the value of the digit <b>${digit}</b> in this number?${big(str)}`, type: 'number', answer: ans, params: { kind, str, digit },
          hints: [`Find the ${digit} in ${str}. It is ${i < 2 ? 'to the left' : 'to the right'} of the decimal point, in the ${PLACES[i]} place.`,
            `One ${PLACE_ONE[i]} is ${PLACE_VAL[i]}, so ${digit} ${PLACES[i]} is ${digit} × ${PLACE_VAL[i]}.`,
            `The ${digit} is worth <b>${N(ans)}</b>.`] };
      }
      if (kind === 'expanded') {
        const dg = [rng.int(1, 9), rng.int(0, 9), rng.int(0, 9), rng.int(1, 9)];       // ones, tenths, hundredths, thousandths
        if (rng.bool()) dg[rng.int(1, 2)] = 0;
        const terms = dg.map((d, j) => ({ d, j: j + 1 })).filter(t => t.d);
        const words = rng.bool();
        const shown = rng.shuffle(terms).map(t => words ? `${t.d} ${t.d === 1 ? PLACE_ONE[t.j] : PLACES[t.j]}` : `${t.d} × ${t.j === 1 ? '1' : fx(1, Math.pow(10, t.j - 1))}`);
        const str = `${dg[0]}.${dg[1]}${dg[2]}${dg[3]}`;
        const hints = [`Put each digit in its place: ${dg[0]} ones, ${dg[1]} tenths, ${dg[2]} hundredths, ${dg[3]} thousandths.`];
        if (dg.includes(0)) hints.push('A place that is not mentioned gets a 0, so the other digits stay in the right places.');
        hints.push(`Written as a decimal, that is <b>${str}</b>.`);
        return { prompt: `Write this as a decimal number.${big(shown.join(' + '))}`, type: 'number', answer: Number(str), params: { kind, terms }, hints };
      }
      const d = rng.int(1, 9), i = rng.int(0, 3), j = Math.min(4, i + rng.pick([1, 1, 2]));
      const ds = rng.sample([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => x !== d), 5);
      ds[i] = d; ds[j] = d;
      const str = `${ds[0]}${ds[1]}.${ds[2]}${ds[3]}${ds[4]}`;
      const ans = j - i === 1 ? 10 : 100;
      const vi = M.round(d * Number(PLACE_VAL[i]), 3), vj = M.round(d * Number(PLACE_VAL[j]), 3);
      return { prompt: `In ${str}, the ${d} in the ${PLACES[i]} place is worth how many times as much as the ${d} in the ${PLACES[j]} place?${big(str)}`, type: 'number', answer: ans, params: { kind, str, i, j },
        hints: [`The ${d} in the ${PLACES[i]} place is worth ${N(vi)}. The ${d} in the ${PLACES[j]} place is worth ${N(vj)}.`,
          `Each place is worth 10 times the place to its right. These places are ${j - i} apart, so multiply by ${j - i === 1 ? '10' : '10 × 10'}.`,
          `${N(vi)} is <b>${ans}</b> times as much as ${N(vj)}.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'digit') return Math.abs(digitValue(p.str, p.str.indexOf(String(p.digit))) - q.answer) < 1e-12;
      if (p.kind === 'expanded') return Math.abs(p.terms.reduce((s, t) => s + t.d * Math.pow(10, 1 - t.j), 0) - q.answer) < 1e-9;
      const pos = k => (k < 2 ? k : k + 1);
      return Math.abs(digitValue(p.str, pos(p.i)) / digitValue(p.str, pos(p.j)) - q.answer) < 1e-9;
    },
  });

  /** the name of the first place where two equally padded decimals differ */
  const firstDiff = (x, y) => { const k = x.split('').findIndex((c, i) => c !== y[i]), dot = x.indexOf('.'); return PLACES[k < dot ? 2 - (dot - k) : 1 + (k - dot)]; };

  A.skill({
    id: 'g5.compare-round-decimals', title: 'Comparing and rounding decimals',
    learn: p('<b>To compare decimals, line up the decimal points and compare digit by digit from the left.</b> The first place where the digits differ decides which number is bigger. Adding zeros to the end helps: 0.6 is the same as 0.60, and 0.60 is more than 0.57.') +
      p('A longer decimal is not always bigger. 0.6 has fewer digits than 0.57, but 6 tenths is more than 5 tenths.') +
      p('<b>To round, find the place you are rounding to and look at the digit just to its right.</b> If that digit is 5 or more, round up. If it is less than 5, keep the digit and drop everything after it.') +
      example('Example', `${big('Round 7.468 to the nearest tenth.')}The tenths digit is 4. The digit to its right is 6, which is 5 or more, so the 4 goes up to 5. The answer is <b>7.5</b>.`),
    make(rng) {
      if (rng.chance(0.5)) {
        const kind = rng.pick(['trap', 'trap', 'equal', 'swap']);
        const whole = rng.int(0, 12) * 1000;            // values are in thousandths
        let a, b, pa, pb;
        if (kind === 'trap') { a = whole + rng.int(2, 8) * 100; pa = 1; b = a + rng.sign() * (rng.bool() ? rng.int(1, 9) * 10 : rng.int(1, 99)); pb = b % 100 === 0 ? 1 : b % 10 === 0 ? 2 : 3; }
        else if (kind === 'equal') { a = whole + rng.int(1, 99) * 10; pa = a % 100 === 0 ? 1 : 2; b = a; pb = pa + 1; }
        else { const t = rng.int(1, 9); let h = rng.int(0, 9); if (h === t) h = (h + 3) % 10; a = whole + t * 100 + h * 10; b = whole + h * 100 + t * 10; pa = h === 0 ? 1 : 2; pb = 2; }
        const sa = decStr(a / Math.pow(10, 3 - pa), pa), sb = decStr(b / Math.pow(10, 3 - pb), pb);
        const [l, r, lv, rv] = rng.bool() ? [sa, sb, a, b] : [sb, sa, b, a];
        const ans = lv < rv ? '&lt;' : lv > rv ? '&gt;' : '=';
        const m = Math.max(pa, pb);
        const pad = v => decStr(v / Math.pow(10, 3 - m), m);
        return { prompt: `Which symbol makes this true?${big(`${l} &nbsp;?&nbsp; ${r}`)}`, type: 'choice', choices: ['&lt;', '&gt;', '='], keepOrder: true, answer: ans, params: { kind: 'compare', l, r },
          hints: [`Line up the decimal points and give both numbers the same number of decimal places: ${pad(lv)} and ${pad(rv)}.`,
            lv === rv ? 'Every digit matches, so the numbers are equal.' : `Compare digit by digit from the left. The first digits that differ are in the ${firstDiff(pad(lv), pad(rv))} place: ${pad(lv)[pad(lv).split('').findIndex((c, k) => c !== pad(rv)[k])]} and ${pad(rv)[pad(lv).split('').findIndex((c, k) => c !== pad(rv)[k])]}.`,
            `So <b>${l} ${ans} ${r}</b>.`] };
      }
      let x = rng.int(1001, 99999); if (x % 10 === 0) x += rng.int(1, 9);
      const pl = rng.pick([0, 1, 2]), unit = Math.pow(10, 3 - pl);
      const r = Math.round(x / unit) * unit;
      const str = decStr(x, 3), name = ['whole number', 'tenth', 'hundredth'][pl], place = ['ones', 'tenths', 'hundredths'][pl];
      const kept = Math.floor(x / unit) % 10, next = Math.floor(x / (unit / 10)) % 10;
      const shown = decStr(r / unit, pl);
      return { prompt: `Round to the nearest <b>${name}</b>.${big(str)}`, type: 'number', answer: r / 1000, answerText: shown, params: { kind: 'round', x, pl },
        hints: [`The ${place} digit is ${kept}. Look at the digit just to its right: ${next}.`,
          next >= 5 ? `${next} is 5 or more, so round up: the ${place} digit goes up by 1.` : `${next} is less than 5, so the ${place} digit stays ${kept}.`,
          `${str} rounded to the nearest ${name} is <b>${shown}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'compare') { const l = parseFloat(p.l), r = parseFloat(p.r); return q.answer === (l < r ? '&lt;' : l > r ? '&gt;' : '='); }
      const x = p.x / 1000, step = Math.pow(10, -p.pl), gap = q.answer - x;
      const onGrid = Math.abs(q.answer / step - Math.round(q.answer / step)) < 1e-6;
      return onGrid && (Math.abs(gap) < step / 2 - 1e-9 || Math.abs(gap - step / 2) < 1e-9);
    },
  });
  A.skill({
    id: 'g5.add-sub-decimals', title: 'Adding and subtracting decimals',
    learn: p('<b>Line up the decimal points</b>, so that tenths sit under tenths and hundredths sit under hundredths. If one number has fewer decimal places, write zeros on the end so both have the same number: 4.5 becomes 4.50.') +
      p('Then add or subtract exactly as you would with whole numbers, carrying or borrowing as usual, and bring the decimal point straight down into the answer.') +
      example('Example', `${big('12.5 − 3.76')}Write 12.5 as 12.50. Then 12.50 − 3.76: borrow across the places to get <b>8.74</b>. Check: 8.74 + 3.76 = 12.50.`),
    make(rng) {
      const kind = rng.pick(['add', 'sub', 'word-add', 'word-sub']);
      const mk = () => (rng.bool() ? rng.int(5, 199) * 10 : rng.int(50, 1999));      // hundredths
      let a = mk(), b = mk();
      if (a === b) b += 10;
      const sub = kind.endsWith('sub');
      if (sub && a < b) [a, b] = [b, a];
      const res = sub ? a - b : a + b, ans = res / 100, op = sub ? '−' : '+';
      const show = x => (x % 100 === 0 ? String(x / 100) : x % 10 === 0 ? decStr(x / 10, 1) : decStr(x, 2));
      const name = rng.pick(NAMES);
      let prompt, unit, money = false;
      if (kind === 'word-add') {
        const t = rng.int(0, 1);
        if (t === 0) { money = true; unit = '$'; prompt = `${name} buys a book for ${M.money(a / 100)} and a snack for ${M.money(b / 100)}. How much does ${name} spend in all?`; }
        else { unit = 'km'; prompt = `${name} rides a bike ${show(a)} km to the park and then ${show(b)} km to the library. How far does ${name} ride in all?`; }
      } else if (kind === 'word-sub') {
        const t = rng.int(0, 1);
        if (t === 0) { money = true; unit = '$'; prompt = `${name} has ${M.money(a / 100)}. A kite costs ${M.money(b / 100)}. How much money will ${name} have left after buying the kite?`; }
        else { unit = 'L'; prompt = `A tank holds ${show(a)} liters of water. ${name} uses ${show(b)} liters to water the garden. How many liters are left in the tank?`; }
      } else prompt = `${sub ? 'Subtract' : 'Add'}.${big(`${show(a)} ${op} ${show(b)}`)}`;
      return { prompt, type: 'number', answer: ans, unit, params: { kind, x: a / 100, y: b / 100 },
        hints: [`Line up the decimal points. Give both numbers two decimal places: ${decStr(a, 2)} and ${decStr(b, 2)}.`,
          `${sub ? 'Subtract' : 'Add'} as if they were whole numbers: ${a} ${op} ${b} = ${res}.`,
          `Bring the decimal point down, two places from the right: <b>${money ? M.money(ans) : N(ans)}</b>.`] };
    },
    verify(q) { const { kind, x, y } = q.params; return Math.abs((kind.endsWith('sub') ? x - y : x + y) - q.answer) < 1e-9; },
  });

  /* ---------- Unit 2: add and subtract fractions ---------- */
  const DENS = [2, 3, 4, 5, 6, 8, 10, 12];
  const twoDens = rng => { let d1, d2; do { d1 = rng.pick(DENS); d2 = rng.pick(DENS); } while (d1 === d2 || lcm(d1, d2) > 24); return [d1, d2]; };

  A.skill({
    id: 'g5.add-sub-fractions', title: 'Add and subtract fractions with unlike denominators',
    learn: p('You can only add or subtract fractions when the pieces are the same size, which means the <b>denominators must match</b>. When they do not, find a <b>common denominator</b>: a number that both denominators divide into. The smallest one keeps the numbers small.') +
      p('Rewrite each fraction with the common denominator (multiply top and bottom by the same number), then <b>add or subtract the numerators and keep the denominator</b>. Simplify at the end.') +
      example('Example', `${big(`${F(2, 3)} + ${F(1, 4)}`)}12 is a common denominator. ${F(2, 3)} = ${fx(8, 12)} and ${F(1, 4)} = ${fx(3, 12)}. Add the numerators: 8 + 3 = 11, so the answer is <b>${F(11, 12)}</b>.`),
    make(rng) {
      let [d1, d2] = twoDens(rng);
      let n1 = coprimeTo(rng, d1), n2 = coprimeTo(rng, d2);
      const kind = rng.pick(['add', 'sub', 'word-add', 'word-sub']), sub = kind.endsWith('sub');
      if (sub && n1 * d2 < n2 * d1) [n1, d1, n2, d2] = [n2, d2, n1, d1];
      const lcd = lcm(d1, d2), a = n1 * lcd / d1, b = n2 * lcd / d2, num = sub ? a - b : a + b;
      const [sn, sd] = M.simp(num, lcd), g = M.gcd(num, lcd), op = sub ? '−' : '+';
      const name = rng.pick(NAMES);
      let prompt, unit;
      if (kind === 'word-add') {
        if (rng.bool()) { unit = 'miles'; prompt = `${name} walks ${fx(n1, d1)} of a mile to school and then ${fx(n2, d2)} of a mile to the park. How far does ${name} walk in all?`; }
        else { unit = 'cups'; prompt = `${name} pours ${fx(n1, d1)} of a cup of milk and ${fx(n2, d2)} of a cup of water into a bowl. How many cups of liquid are in the bowl?`; }
      } else if (kind === 'word-sub') {
        if (rng.bool()) { unit = 'yard'; prompt = `${name} has ${fx(n1, d1)} of a yard of ribbon and uses ${fx(n2, d2)} of a yard for a bow. How much ribbon is left?`; }
        else { unit = 'mile'; prompt = `A trail is ${fx(n1, d1)} of a mile long. ${name} has walked ${fx(n2, d2)} of a mile. How much farther does ${name} have to go?`; }
      } else prompt = `${sub ? 'Subtract' : 'Add'}.${big(`${fx(n1, d1)} ${op} ${fx(n2, d2)}`)}`;
      return { prompt: prompt + ' Give your answer in simplest form.', type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), unit, params: { n1, d1, n2, d2, sub },
        hints: [`The denominators ${d1} and ${d2} are different. ${lcd} is the smallest number that both ${d1} and ${d2} divide into, so use ${lcd}.`,
          `Rewrite: ${fx(n1, d1)} = ${fx(a, lcd)} and ${fx(n2, d2)} = ${fx(b, lcd)}.`,
          `${sub ? 'Subtract' : 'Add'} the numerators and keep the denominator: ${a} ${op} ${b} = ${num}, so you get ${fx(num, lcd)}.`,
          `${g > 1 ? `Simplify by dividing the top and bottom by ${g}: ` : ''}<b>${showFrac(num, lcd)}</b>.`] };
    },
    verify(q) { const { n1, d1, n2, d2, sub } = q.params; const top = n1 * d2 + (sub ? -1 : 1) * n2 * d1; return Math.abs(top / (d1 * d2) - q.answer) < 1e-9; },
  });

  A.skill({
    id: 'g5.add-sub-mixed-numbers', title: 'Add and subtract mixed numbers',
    learn: p('A mixed number like 2' + `<span class="mixed">${F(1, 3)}</span>` + ' has a whole part and a fraction part. First give the fractions a <b>common denominator</b>. Then <b>add or subtract the whole numbers and the fractions separately</b>.') +
      p(`When adding, if the fractions add up to more than 1, trade a whole: ${fx(5, 4)} is 1 and ${F(1, 4)}, so carry the 1 to the whole numbers. When subtracting, if the top fraction is too small, <b>regroup</b>: take 1 from the whole number and turn it into a fraction, like 3${`<span class="mixed">${fx(1, 4)}</span>`} = 2${`<span class="mixed">${fx(5, 4)}</span>`}.`) +
      example('Example', `${big(`3${`<span class="mixed">${F(1, 4)}</span>`} − 1${`<span class="mixed">${F(2, 3)}</span>`}`)}Common denominator 12: 3${`<span class="mixed">${fx(3, 12)}</span>`} − 1${`<span class="mixed">${fx(8, 12)}</span>`}. 3 is less than 8, so regroup: 2${`<span class="mixed">${fx(15, 12)}</span>`} − 1${`<span class="mixed">${fx(8, 12)}</span>`} = <b>1${`<span class="mixed">${F(7, 12)}</span>`}</b>.`),
    make(rng) {
      let [d1, d2] = twoDens(rng);
      let n1 = coprimeTo(rng, d1), n2 = coprimeTo(rng, d2);
      const kind = rng.pick(['add', 'sub', 'sub', 'word-add', 'word-sub']), sub = kind.endsWith('sub');
      let w2 = rng.int(1, 4), w1 = sub ? w2 + rng.int(1, 4) : rng.int(1, 6);
      const lcd = lcm(d1, d2), a = n1 * lcd / d1, b = n2 * lcd / d2;
      const hints = [`Use the common denominator ${lcd}: ${mixRaw(w1, a, lcd)} ${sub ? '−' : '+'} ${mixRaw(w2, b, lcd)}.`];
      let W, fr;
      if (!sub) {
        W = w1 + w2; fr = a + b;
        hints.push(`Add the whole numbers: ${w1} + ${w2} = ${W}. Add the fractions: ${fx(a, lcd)} + ${fx(b, lcd)} = ${fx(fr, lcd)}.`);
        if (fr >= lcd) hints.push(`${fx(fr, lcd)} is more than 1: it is 1 and ${fx(fr - lcd, lcd)}. Carry the 1 to get ${mixRaw(W + 1, fr - lcd, lcd)}.`);
      } else if (a >= b) {
        W = w1 - w2; fr = a - b;
        hints.push(`Subtract the whole numbers: ${w1} − ${w2} = ${W}. Subtract the fractions: ${fx(a, lcd)} − ${fx(b, lcd)} = ${fx(fr, lcd)}.`);
      } else {
        W = w1 - 1 - w2; fr = a + lcd - b;
        hints.push(`${fx(a, lcd)} is smaller than ${fx(b, lcd)}, so regroup: take 1 from ${w1} and make it ${fx(lcd, lcd)}. Now you have ${mixRaw(w1 - 1, a + lcd, lcd)}.`);
        hints.push(`Subtract the whole numbers: ${w1 - 1} − ${w2} = ${W}. Subtract the fractions: ${fx(a + lcd, lcd)} − ${fx(b, lcd)} = ${fx(fr, lcd)}.`);
      }
      const total = W * lcd + fr, [sn, sd] = M.simp(total, lcd);
      hints.push(`In simplest form the answer is <b>${M.mixed(sn, sd)}</b>.`);
      const name = rng.pick(NAMES), m1 = mixRaw(w1, n1, d1), m2 = mixRaw(w2, n2, d2);
      let prompt, unit;
      if (kind === 'word-add') {
        if (rng.bool()) { unit = 'miles'; prompt = `${name} hikes ${m1} miles on Saturday and ${m2} miles on Sunday. How many miles does ${name} hike in all?`; }
        else { unit = 'cups'; prompt = `A recipe uses ${m1} cups of flour for bread and ${m2} cups for muffins. How many cups of flour is that altogether?`; }
      } else if (kind === 'word-sub') {
        if (rng.bool()) { unit = 'feet'; prompt = `${name} has a rope ${m1} feet long and cuts off ${m2} feet. How long is the rope that is left?`; }
        else { unit = 'pounds'; prompt = `A pumpkin weighs ${m1} pounds and a melon weighs ${m2} pounds. How many pounds heavier is the pumpkin?`; }
      } else prompt = `${sub ? 'Subtract' : 'Add'}.${big(`${m1} ${sub ? '−' : '+'} ${m2}`)}`;
      return { prompt: prompt + ' Give your answer as a mixed number in simplest form.', type: 'number', answer: sn / sd, answerText: mixText(sn, sd), unit, params: { w1, n1, d1, w2, n2, d2, sub }, hints };
    },
    verify(q) { const { w1, n1, d1, w2, n2, d2, sub } = q.params; const x = w1 + n1 / d1, y = w2 + n2 / d2; return Math.abs((sub ? x - y : x + y) - q.answer) < 1e-9; },
  });

  /* ---------- Unit 3: multi-digit multiplication and division ---------- */
  A.skill({
    id: 'g5.multiply-multi-digit', title: 'Multi-digit multiplication',
    learn: p('To multiply by a two-digit number, <b>split it into tens and ones</b> and multiply by each part. These are called <b>partial products</b>. Then add them.') +
      p('For 347 × 26, think of 26 as 20 + 6. Multiply 347 × 20 and 347 × 6, then add the two answers. In the standard method you write the same two rows, with a 0 at the end of the tens row.') +
      example('Example', `${big('347 × 26')}347 × 20 = 6,940 and 347 × 6 = 2,082. Add: 6,940 + 2,082 = <b>9,022</b>.`),
    make(rng) {
      const kind = rng.pick(['3x2', '3x2', '4x2', 'word']);
      const a = kind === '4x2' ? rng.int(1001, 9999) : rng.int(101, 999);
      let b = rng.int(12, 99); if (b % 10 === 0) b += 1;
      const t = b - b % 10, o = b % 10, ans = a * b, name = rng.pick(NAMES);
      let prompt;
      if (kind === 'word') prompt = rng.pick([
        `A farm packs ${b} crates of apples. Each crate holds ${a} apples. How many apples is that in all?`,
        `A train travels ${a} miles every day. How many miles does it travel in ${b} days?`,
        `${name}'s school orders ${b} boxes of pencils. Each box holds ${a} pencils. How many pencils does the school get?`,
      ]);
      else prompt = `Multiply.${big(`${N(a)} × ${b}`)}`;
      return { prompt, type: 'number', answer: ans, params: { a, b },
        hints: [`Split ${b} into ${t} + ${o}.`, `${N(a)} × ${t} = ${N(a * t)} and ${N(a)} × ${o} = ${N(a * o)}.`, `Add the partial products: ${N(a * t)} + ${N(a * o)} = <b>${N(ans)}</b>.`] };
    },
    verify(q) { let s = 0; for (let k = 0; k < q.params.b; k++) s += q.params.a; return s === q.answer; },
  });

  A.skill({
    id: 'g5.divide-two-digit', title: 'Dividing by two-digit numbers',
    learn: p('To divide by a two-digit number, <b>estimate</b> first. Round the divisor to the nearest ten to guess how many times it fits, then multiply to check and adjust your guess.') +
      p('Long division repeats four steps: <b>divide, multiply, subtract, bring down</b>. Whatever is left at the end, smaller than the divisor, is the <b>remainder</b>. In a word problem, think about what the remainder means: sometimes you need one more box or bus for the leftovers.') +
      example('Example', `${big('1,092 ÷ 21')}21 is about 20, and 1,000 ÷ 20 = 50, so try 52: 21 × 52 = 1,092. The answer is <b>52</b>.`),
    make(rng) {
      const kind = rng.pick(['exact', 'exact', 'remainder', 'word-share', 'word-buses']);
      const d = rng.int(12, 49), q = rng.int(12, Math.min(250, Math.floor(9000 / d)));
      const r = (kind === 'remainder' || kind === 'word-buses') ? rng.int(1, d - 1) : 0;
      const n = q * d + r, name = rng.pick(NAMES);
      const ans = kind === 'remainder' ? r : kind === 'word-buses' ? q + 1 : q;
      const est = Math.round(d / 10) * 10;
      let prompt, unit;
      if (kind === 'word-share') { prompt = `${name} has ${N(n)} stickers to share equally among ${d} classmates. How many stickers does each classmate get?`; unit = 'stickers'; }
      else if (kind === 'word-buses') { prompt = `${N(n)} people are going to a game. Each bus holds ${d} people. How many buses are needed so that everyone gets a seat?`; unit = 'buses'; }
      else if (kind === 'remainder') prompt = `Divide. What is the <b>remainder</b>?${big(`${N(n)} ÷ ${d}`)}`;
      else prompt = `Divide.${big(`${N(n)} ÷ ${d}`)}`;
      const last = kind === 'remainder' ? `The remainder is <b>${r}</b>.` : kind === 'word-buses' ? `${q} buses carry ${N(q * d)} people, and ${r} more still need a seat, so you need <b>${q + 1}</b> buses.` : `The answer is <b>${N(q)}</b>.`;
      return { prompt, type: 'number', answer: ans, unit, params: { kind, n, d },
        hints: [`Estimate: ${d} is about ${est}, and ${N(n)} ÷ ${est} is about ${Math.round(n / est)}.`,
          `Work it out with long division and check: ${d} × ${q} = ${N(q * d)}${r ? `, and ${N(n)} − ${N(q * d)} = ${r} left over` : ', exactly'}.`, last] };
    },
    verify(q) {
      const { kind, n, d } = q.params; let rest = n, count = 0;
      while (rest >= d) { rest -= d; count++; }
      return q.answer === (kind === 'remainder' ? rest : kind === 'word-buses' ? count + (rest ? 1 : 0) : count) && (kind === 'remainder' || kind === 'word-buses' || rest === 0);
    },
  });
  /* ---------- Unit 4: multiply and divide fractions ---------- */
  A.skill({
    id: 'g5.multiply-fractions', title: 'Multiply fractions',
    learn: p(`<b>To multiply fractions, multiply the numerators and multiply the denominators.</b> ${F(2, 3)} × ${F(3, 4)} = ${fx(6, 12)} = ${F(1, 2)}. A whole number is a fraction over 1, so 5 × ${F(2, 3)} = ${fx(10, 3)}.`) +
      p(`“Of” means multiply: ${F(1, 2)} of ${F(3, 4)} is ${F(1, 2)} × ${F(3, 4)}.`) +
      p('Multiplying is also <b>scaling</b>. Multiply a number by a fraction less than 1 and it gets <b>smaller</b>; by a fraction greater than 1 and it gets <b>bigger</b>; by a fraction equal to 1 and it stays the same.') +
      example('Example', `${big(`6 × ${F(3, 4)}`)}6 × 3 = 18 on top, 4 underneath: ${fx(18, 4)}. Simplify: <b>${F(9, 2)} = 4${`<span class="mixed">${F(1, 2)}</span>`}</b>.`),
    make(rng) {
      const kind = rng.pick(['whole', 'frac', 'word', 'scale']), name = rng.pick(NAMES);
      if (kind === 'scale') {
        const W = rng.int(6, 40), type = rng.pick(['less', 'greater', 'less', 'greater', 'equal']), d = rng.int(2, 9);
        const n = type === 'less' ? rng.int(1, d - 1) : type === 'greater' ? d + rng.int(1, d - 1) : d;
        const factor = type === 'greater' && rng.bool() ? M.mixed(n, d) : fx(n, d);
        const answer = type === 'less' ? `less than ${W}` : type === 'greater' ? `greater than ${W}` : `equal to ${W}`;
        const rel = type === 'less' ? 'less than' : type === 'greater' ? 'greater than' : 'equal to';
        return { prompt: `Without multiplying, decide how the product compares with ${W}.${big(`${factor} × ${W}`)}`, type: 'choice', choices: [`greater than ${W}`, `less than ${W}`, `equal to ${W}`], keepOrder: true, answer, params: { kind, n, d, W },
          hints: [`Compare the fraction with 1. In ${fx(n, d)} the numerator is ${type === 'less' ? 'smaller than' : type === 'greater' ? 'bigger than' : 'the same as'} the denominator, so it is ${rel} 1.`,
            `Multiplying by a number ${rel} 1 makes the answer ${type === 'less' ? 'smaller than' : type === 'greater' ? 'bigger than' : 'the same as'} the number you started with.`,
            `So ${factor} × ${W} is <b>${answer}</b>.`] };
      }
      if (kind === 'whole' || (kind === 'word' && rng.bool())) {
        const w = rng.int(2, 10), d = rng.int(2, 12), n = coprimeTo(rng, d);
        const prompt = kind === 'word' ? `Each lap around the track is ${fx(n, d)} of a mile. ${name} runs ${w} laps. How many miles does ${name} run?` : `Multiply.${big(`${w} × ${fx(n, d)}`)}`;
        return { prompt: prompt + ' Give your answer in simplest form.', type: 'number', answer: w * n / d, answerText: M.fracText(w * n, d), unit: kind === 'word' ? 'miles' : undefined, params: { kind: 'whole', w, n, d },
          hints: [`${w} × ${fx(n, d)} means ${w} groups of ${fx(n, d)}. Write ${w} as ${fx(w, 1)}.`, `Multiply the numerators: ${w} × ${n} = ${w * n}. Keep the denominator: ${fx(w * n, d)}.`, `In simplest form: <b>${showFrac(w * n, d)}</b>.`] };
      }
      const d1 = rng.int(2, 9), d2 = rng.int(2, 9), n1 = coprimeTo(rng, d1), n2 = coprimeTo(rng, d2);
      const prompt = kind === 'word' ? `${name} has ${fx(n2, d2)} of a pan of lasagna left. ${name} eats ${fx(n1, d1)} of what is left. What fraction of the whole pan does ${name} eat?` : `Multiply.${big(`${fx(n1, d1)} × ${fx(n2, d2)}`)}`;
      return { prompt: prompt + ' Give your answer in simplest form.', type: 'number', answer: n1 * n2 / (d1 * d2), answerText: M.fracText(n1 * n2, d1 * d2), params: { kind: 'frac', n1, d1, n2, d2 },
        hints: [kind === 'word' ? `“${fx(n1, d1)} of ${fx(n2, d2)}” means ${fx(n1, d1)} × ${fx(n2, d2)}.` : 'Multiply the numerators together and the denominators together.',
          `${n1} × ${n2} = ${n1 * n2} on top and ${d1} × ${d2} = ${d1 * d2} on the bottom: ${fx(n1 * n2, d1 * d2)}.`,
          `In simplest form: <b>${showFrac(n1 * n2, d1 * d2)}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'scale') { const prod = p.n * p.W / p.d; return q.answer === (prod < p.W ? 'less than ' : prod > p.W ? 'greater than ' : 'equal to ') + p.W; }
      const v = p.kind === 'whole' ? (p.n / p.d) * p.w : (p.n1 / p.d1) * (p.n2 / p.d2);
      return Math.abs(v - q.answer) < 1e-9;
    },
  });

  function rectSvg(s1, s2, l1, l2, u) {
    const px = 90, w = Math.round(s1 * px), h = Math.round(s2 * px), W = w + 90, H = h + 40;
    return svg(W, H, `<rect x="20" y="10" width="${w}" height="${h}" class="fill"/>` +
      `<text x="${20 + w / 2}" y="${h + 30}" text-anchor="middle" font-size="14">${l1} ${u}</text>` +
      `<text x="${w + 28}" y="${10 + h / 2 + 5}" font-size="14">${l2} ${u}</text>`, 'rectangle');
  }

  A.skill({
    id: 'g5.fraction-area', title: 'Area of rectangles with fraction side lengths',
    learn: p('<b>The area of a rectangle is length × width</b>, even when the sides are fractions. Multiply the numerators, multiply the denominators, and the answer is in square units.') +
      p(`Why it works: picture a 1 × 1 square cut into a grid of tiny tiles. A rectangle ${F(2, 3)} by ${F(3, 4)} covers 2 × 3 = 6 of the 3 × 4 = 12 tiles, so its area is ${fx(6, 12)} = ${F(1, 2)} of a square unit. If a side is a mixed number, write it as a fraction first: 1${`<span class="mixed">${F(1, 2)}</span>`} = ${F(3, 2)}.`) +
      example('Example', `${big(`${F(3, 4)} ft by ${F(2, 5)} ft`)}${F(3, 4)} × ${F(2, 5)} = ${fx(6, 20)} = <b>${F(3, 10)} ft²</b>.`),
    make(rng) {
      const side = mixedOk => { const d = rng.pick([2, 3, 4, 5, 6, 8]); const n = coprimeTo(rng, d) + (mixedOk && rng.chance(0.4) ? d : 0); return [n, d]; };
      const kind = rng.pick(['area', 'area', 'tiles']);
      let n1, d1, n2, d2;
      do { [n1, d1] = side(true); [n2, d2] = side(false); } while (kind === 'tiles' && n1 * n2 < 4);
      const u = rng.pick(['ft', 'm', 'in', 'yd']);
      const l1 = mixText(n1, d1), l2 = mixText(n2, d2);
      const pic = rectSvg(n1 / d1, n2 / d2, l1, l2, u);
      const hints = [];
      if (n1 > d1) hints.push(`Write the mixed number as a fraction: ${M.mixed(n1, d1)} = ${fx(n1, d1)}.`);
      if (kind === 'tiles') {
        hints.push(`Along the ${M.mixed(n1, d1)} ${u} side, tiles ${fx(1, d1)} ${u} wide fit ${n1} times. Along the ${fx(n2, d2)} ${u} side, tiles ${fx(1, d2)} ${u} long fit ${n2} times.`);
        hints.push(`That makes ${n1} rows of ${n2}: ${n1} × ${n2} = <b>${n1 * n2}</b> tiles.`);
        return { prompt: `This rectangle is covered with tiles that are ${fx(1, d1)} ${u} by ${fx(1, d2)} ${u}, with no gaps. How many tiles cover it?${pic}`, type: 'number', answer: n1 * n2, unit: 'tiles', params: { kind, n1, d1, n2, d2 }, hints };
      }
      hints.push(`Area = length × width = ${fx(n1, d1)} × ${fx(n2, d2)}.`);
      hints.push(`Multiply the numerators: ${n1} × ${n2} = ${n1 * n2}. Multiply the denominators: ${d1} × ${d2} = ${d1 * d2}. That gives ${fx(n1 * n2, d1 * d2)}.`);
      hints.push(`In simplest form the area is <b>${showFrac(n1 * n2, d1 * d2)} ${u}²</b>.`);
      return { prompt: `What is the area of this rectangle? Give your answer in simplest form.${pic}`, type: 'number', answer: n1 * n2 / (d1 * d2), answerText: M.fracText(n1 * n2, d1 * d2), unit: u + '²', params: { kind, n1, d1, n2, d2 }, hints };
    },
    verify(q) {
      const { kind, n1, d1, n2, d2 } = q.params, area = (n1 / d1) * (n2 / d2);
      if (kind === 'tiles') return Math.abs(area / ((1 / d1) * (1 / d2)) - q.answer) < 1e-9;
      return Math.abs(area - q.answer) < 1e-9;
    },
  });

  A.skill({
    id: 'g5.divide-unit-fractions', title: 'Divide unit fractions and whole numbers',
    learn: p(`A <b>unit fraction</b> has 1 on top, like ${F(1, 3)} or ${F(1, 5)}.`) +
      p(`<b>Unit fraction ÷ whole number:</b> you are cutting a piece into more pieces, so the answer is smaller. ${F(1, 3)} ÷ 2 means split a third into 2 equal parts: each part is ${F(1, 6)}. The denominator gets multiplied: 3 × 2 = 6.`) +
      p(`<b>Whole number ÷ unit fraction:</b> you are asking how many small pieces fit, so the answer is bigger. 4 ÷ ${F(1, 3)} asks how many thirds are in 4. Each whole has 3 thirds, so 4 wholes have 4 × 3 = 12.`) +
      example('Example', `${big(`5 ÷ ${F(1, 4)}`)}There are 4 fourths in each whole, so 5 wholes hold 5 × 4 = <b>20</b> fourths.`),
    make(rng) {
      const kind = rng.pick(['fw', 'wf', 'word-fw', 'word-wf']), name = rng.pick(NAMES);
      if (kind.endsWith('fw')) {
        const d = rng.int(2, 8), w = rng.int(2, 8);
        const prompt = kind === 'word-fw' ? `${name} has ${fx(1, d)} of a pizza and shares it equally among ${w} friends. What fraction of the whole pizza does each friend get?` : `Divide.${big(`${fx(1, d)} ÷ ${w}`)}`;
        return { prompt, type: 'number', answer: 1 / (d * w), answerText: `1/${d * w}`, params: { kind, dividend: 1 / d, divisor: w },
          hints: [`You are splitting ${fx(1, d)} into ${w} equal parts, so each part is smaller than ${fx(1, d)}.`, `Cutting every ${fx(1, d)} into ${w} parts makes ${d} × ${w} = ${d * w} parts in the whole.`, `Each part is <b>${F(1, d * w)}</b>.`] };
      }
      const w = rng.int(2, 12), d = rng.int(2, 10);
      const prompt = kind === 'word-wf' ? `${name} has ${w} cups of trail mix and fills bags that each hold ${fx(1, d)} of a cup. How many bags can ${name} fill?` : `Divide.${big(`${w} ÷ ${fx(1, d)}`)}`;
      return { prompt, type: 'number', answer: w * d, unit: kind === 'word-wf' ? 'bags' : undefined, params: { kind, dividend: w, divisor: 1 / d },
        hints: [`Ask: how many ${fx(1, d)}s fit into ${w}?`, `There are ${d} pieces of size ${fx(1, d)} in each whole.`, `${w} wholes hold ${w} × ${d} = <b>${w * d}</b>.`] };
    },
    verify(q) { return Math.abs(q.answer * q.params.divisor - q.params.dividend) < 1e-12; },
  });

  /* ---------- Unit 5: powers of ten, multiplying and dividing decimals ---------- */
  A.skill({
    id: 'g5.powers-of-ten', title: 'Powers of ten',
    learn: p(`An <b>exponent</b> tells how many times to multiply by the base. ${M.sup(10, 3)} = 10 × 10 × 10 = 1,000. <b>The exponent on 10 is the number of zeros</b> after the 1.`) +
      p(`<b>Multiplying by 10, 100 or 1,000 moves every digit 1, 2 or 3 places to the left</b>, so the decimal point seems to move right. <b>Dividing moves the digits to the right</b>, so the point seems to move left. Fill any empty places with zeros.`) +
      example('Example', `${big(`3.42 × ${M.sup(10, 2)}`)}${M.sup(10, 2)} = 100 has 2 zeros, so move the decimal point 2 places right: 3.42 → <b>342</b>. And 56 ÷ 1,000 moves it 3 places left: <b>0.056</b>.`),
    make(rng) {
      const kind = rng.pick(['value', 'exponent', 'mult', 'mult', 'div', 'div']);
      if (kind === 'value') {
        const k = rng.int(2, 6), c = rng.bool() ? rng.int(2, 9) : 1, pw = Math.pow(10, k);
        return { prompt: `Evaluate.${big(c > 1 ? `${c} × ${M.sup(10, k)}` : M.sup(10, k))}`, type: 'number', answer: c * pw, params: { kind, k, c },
          hints: [`${M.sup(10, k)} means ${Array(k).fill(10).join(' × ')}.`, `That is 1 followed by ${k} zeros: ${N(pw)}.`, c > 1 ? `${c} × ${N(pw)} = <b>${N(c * pw)}</b>.` : `So ${M.sup(10, k)} = <b>${N(pw)}</b>.`] };
      }
      if (kind === 'exponent') {
        const k = rng.int(2, 7);
        return { prompt: `Write ${N(Math.pow(10, k))} as a power of ten. What is the exponent?${big(`${N(Math.pow(10, k))} = ${M.sup(10, '?')}`)}`, type: 'number', answer: k, params: { kind, k },
          hints: ['The exponent on 10 is the number of zeros after the 1.', `${N(Math.pow(10, k))} has ${k} zeros, so it is ${M.sup(10, k)}. The exponent is <b>${k}</b>.`] };
      }
      const k = rng.int(1, 3), pw = Math.pow(10, k), asPow = rng.bool();
      const by = asPow ? M.sup(10, k) : N(pw);
      if (kind === 'mult') {
        let I = rng.int(11, 9999); if (I % 10 === 0) I += 1;
        const pl = rng.int(1, 3), aStr = decStr(I, pl), ans = M.round(Number(aStr) * pw, 6);
        return { prompt: `Multiply.${big(`${aStr} × ${by}`)}`, type: 'number', answer: ans, params: { kind, aStr, k },
          hints: [asPow ? `${M.sup(10, k)} = ${N(pw)}, which has ${k} zero${k > 1 ? 's' : ''}.` : `${N(pw)} has ${k} zero${k > 1 ? 's' : ''}.`, `Multiplying by ${N(pw)} moves the decimal point ${k} place${k > 1 ? 's' : ''} to the right${k > pl ? ', filling the empty places with zeros' : ''}.`, `${aStr} × ${N(pw)} = <b>${N(ans)}</b>.`] };
      }
      let I = rng.int(2, 9999); const pl = rng.pick([0, 0, 1]); if (pl && I % 10 === 0) I += 1;
      const aStr = decStr(I, pl), ans = M.round(Number(aStr) / pw, 6);
      return { prompt: `Divide.${big(`${N(Number(aStr))} ÷ ${by}`)}`, type: 'number', answer: ans, params: { kind, aStr, k },
        hints: [asPow ? `${M.sup(10, k)} = ${N(pw)}, which has ${k} zero${k > 1 ? 's' : ''}.` : `${N(pw)} has ${k} zero${k > 1 ? 's' : ''}.`, `Dividing by ${N(pw)} moves the decimal point ${k} place${k > 1 ? 's' : ''} to the left. Put zeros in front if you run out of digits.`, `${N(Number(aStr))} ÷ ${N(pw)} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'value') { let v = p.c; for (let i = 0; i < p.k; i++) v *= 10; return v === q.answer; }
      if (p.kind === 'exponent') return String(Math.pow(10, q.answer)).length - 1 === p.k;
      return Math.abs(Number(p.aStr + 'e' + (p.kind === 'mult' ? '' : '-') + p.k) - q.answer) < 1e-12;
    },
  });

  A.skill({
    id: 'g5.multiply-divide-decimals', title: 'Multiply and divide decimals',
    learn: p('<b>To multiply decimals, multiply as if there were no decimal points.</b> Then count the decimal places in both numbers together, and give the answer that many decimal places. 0.3 × 0.4: 3 × 4 = 12, and there are 2 decimal places in all, so the answer is 0.12.') +
      p('<b>To divide a decimal by a whole number</b>, divide as usual and put the decimal point in the answer right above the one in the number you are dividing. <b>To divide by a decimal</b>, multiply both numbers by 10 (or 100) until the divisor is a whole number: 4.8 ÷ 0.6 is the same as 48 ÷ 6.') +
      example('Example', `${big('2.4 × 0.3')}24 × 3 = 72. There is 1 decimal place in 2.4 and 1 in 0.3, so 2 in all: <b>0.72</b>.`),
    make(rng) {
      const kind = rng.pick(['dw', 'dd', 'qw', 'qd', 'word-buy', 'word-cut']), name = rng.pick(NAMES);
      const places = (pl) => `${pl} decimal place${pl > 1 ? 's' : ''}`;
      if (kind === 'dw' || kind === 'word-buy') {
        const pl = kind === 'word-buy' ? 2 : rng.pick([1, 2]);
        let A0 = kind === 'word-buy' ? rng.int(21, 99) * 5 : pl === 1 ? rng.int(11, 99) : rng.int(101, 999);
        if (kind !== 'word-buy' && A0 % 10 === 0) A0 += 1;
        const w = rng.int(2, 9), a = A0 / Math.pow(10, pl), ans = M.round(A0 * w / Math.pow(10, pl), 6);
        const prompt = kind === 'word-buy' ? `One notebook costs ${M.money(a)}. ${name} buys ${w} notebooks. How much does ${name} pay?` : `Multiply.${big(`${N(a)} × ${w}`)}`;
        return { prompt, type: 'number', answer: ans, unit: kind === 'word-buy' ? '$' : undefined, params: { kind: 'mul', a, b: w },
          hints: [`Multiply without the decimal point: ${A0} × ${w} = ${A0 * w}.`, `${N(a)} has ${places(pl)}, so the answer needs ${places(pl)}: ${decStr(A0 * w, pl)}.`, `The answer is <b>${kind === 'word-buy' ? M.money(ans) : N(ans)}</b>.`] };
      }
      if (kind === 'dd') {
        let A0 = rng.int(2, 99); if (A0 % 10 === 0) A0 += 1;
        const pb = rng.chance(0.3) ? 2 : 1, B0 = pb === 1 ? rng.int(2, 9) : rng.int(11, 39);
        const a = A0 / 10, b = B0 / Math.pow(10, pb), ans = M.round(A0 * B0 / Math.pow(10, 1 + pb), 6);
        return { prompt: `Multiply.${big(`${N(a)} × ${N(b)}`)}`, type: 'number', answer: ans, params: { kind: 'mul', a, b },
          hints: [`Multiply without the decimal points: ${A0} × ${B0} = ${A0 * B0}.`, `${N(a)} has 1 decimal place and ${N(b)} has ${pb}, so the answer needs ${places(1 + pb)}: ${decStr(A0 * B0, 1 + pb)}.`, `The answer is <b>${N(ans)}</b>.`] };
      }
      if (kind === 'qw') {
        const ql = rng.pick([1, 1, 2]), Q = ql === 1 ? rng.int(11, 99) : rng.int(101, 499), w = rng.int(2, 9);
        const D = Q * w, dividend = D / Math.pow(10, ql), ans = Q / Math.pow(10, ql), word = ql === 1 ? 'tenths' : 'hundredths';
        return { prompt: `Divide.${big(`${N(dividend)} ÷ ${w}`)}`, type: 'number', answer: ans, params: { kind: 'div', dividend, divisor: w },
          hints: [`Think of ${N(dividend)} as ${D} ${word}.`, `${D} ÷ ${w} = ${Q}, so the answer is ${Q} ${word}.`, `${Q} ${word} is <b>${N(ans)}</b>.`] };
      }
      const B0 = rng.int(2, 9), q = rng.int(2, 40), dividend = q * B0 / 10, b = B0 / 10;
      const prompt = kind === 'word-cut' ? `A ribbon is ${N(dividend)} meters long. ${name} cuts it into pieces that are each ${N(b)} meters long. How many pieces does ${name} get?` : `Divide.${big(`${N(dividend)} ÷ ${N(b)}`)}`;
      return { prompt, type: 'number', answer: q, unit: kind === 'word-cut' ? 'pieces' : undefined, params: { kind: 'div', dividend, divisor: b },
        hints: [kind === 'word-cut' ? `Divide the whole length by the length of one piece: ${N(dividend)} ÷ ${N(b)}. Make the divisor a whole number by multiplying both numbers by 10.` : 'Make the divisor a whole number: multiply both numbers by 10.', `${N(dividend)} × 10 = ${q * B0} and ${N(b)} × 10 = ${B0}, so work out ${q * B0} ÷ ${B0}.`, `${q * B0} ÷ ${B0} = <b>${q}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'mul') return Math.abs(q.answer / p.b - p.a) < 1e-9;
      return Math.abs(q.answer * p.divisor - p.dividend) < 1e-9;
    },
  });
  /* ---------- Unit 6: volume ---------- */
  /** unit cubes drawn in an oblique view, back to front so nearer faces cover farther ones; cells are [x, up, back] */
  function cubesSvg(cells) {
    const s = 22, k = 11, pad = 4;
    const mx = Math.max(...cells.map(c => c[0])) + 1, my = Math.max(...cells.map(c => c[1])) + 1, md = Math.max(...cells.map(c => c[2])) + 1;
    const W = mx * s + md * k + 2 * pad, H = my * s + md * k + 2 * pad, base = H - pad;
    const pts = a => a.map(([u, v]) => `${u},${v}`).join(' ');
    const line = 'stroke: var(--primary); stroke-width: 1.5';
    const body = cells.slice().sort((a, b) => b[2] - a[2] || a[1] - b[1] || a[0] - b[0]).map(([x, y, d]) => {
      const X = pad + x * s + d * k, Y = base - y * s - d * k;
      return `<polygon points="${pts([[X, Y - s], [X + s, Y - s], [X + s + k, Y - s - k], [X + k, Y - s - k]])}" style="fill: var(--surface-2); ${line}"/>` +
        `<polygon points="${pts([[X + s, Y], [X + s + k, Y - k], [X + s + k, Y - s - k], [X + s, Y - s]])}" style="fill: var(--line-strong); ${line}"/>` +
        `<rect x="${X}" y="${Y - s}" width="${s}" height="${s}" style="fill: var(--primary-soft); ${line}"/>`;
    }).join('');
    return svg(W, H, body, 'a solid made of unit cubes');
  }
  const box = (x0, l, w, h) => { const out = []; for (let x = 0; x < l; x++) for (let y = 0; y < h; y++) for (let d = 0; d < w; d++) out.push([x0 + x, y, d]); return out; };
  const countCubes = (l, w, h) => { let c = 0; for (let x = 0; x < l; x++) for (let y = 0; y < w; y++) for (let z = 0; z < h; z++) c++; return c; };

  A.skill({
    id: 'g5.volume-prisms', title: 'Volume of rectangular prisms',
    learn: p('<b>Volume</b> is how much space a solid takes up. We measure it in <b>cubic units</b>: how many unit cubes (1 by 1 by 1) it would take to fill it with no gaps.') +
      p('To count the cubes in a box, count one layer first: the bottom layer has <b>length × width</b> cubes. Then multiply by the number of layers, which is the height. So <b>V = l × w × h</b>.') +
      p('If you know the volume and two of the sides, divide to find the third: height = volume ÷ (length × width).') +
      example('Example', `${big('A box 5 cm long, 3 cm wide and 4 cm tall')}The bottom layer holds 5 × 3 = 15 cubes, and there are 4 layers: 15 × 4 = <b>60 cm³</b>.`),
    make(rng) {
      const kind = rng.pick(['count', 'count', 'formula', 'missing', 'word']), name = rng.pick(NAMES);
      if (kind === 'count') {
        let l = rng.int(2, 5), w = rng.int(1, 3), h = rng.int(1, 4); if (l * w * h < 6) h += 1;
        return { prompt: `This box is built from unit cubes, with no gaps inside. What is its volume?${cubesSvg(box(0, l, w, h))}`, type: 'number', answer: l * w * h, unit: 'cubic units', params: { kind, l, w, h },
          hints: [`Count the bottom layer. It is ${l} cubes long and ${w} cube${w > 1 ? 's' : ''} deep: ${l} × ${w} = ${l * w} cubes.`, `There ${h > 1 ? 'are' : 'is'} ${h} layer${h > 1 ? 's' : ''}: ${l * w} × ${h}.`, `The volume is <b>${l * w * h} cubic units</b>.`] };
      }
      const l = rng.int(2, 12), w = rng.int(2, 9), h = rng.int(2, 10), u = rng.pick(['cm', 'in', 'm', 'ft']);
      if (kind === 'missing') {
        return { prompt: `A rectangular prism has a volume of ${N(l * w * h)} ${u}³. It is ${l} ${u} long and ${w} ${u} wide. How tall is it?`, type: 'number', answer: h, unit: u, params: { kind, l, w, V: l * w * h },
          hints: [`V = l × w × h, so ${N(l * w * h)} = ${l} × ${w} × height.`, `The bottom layer is ${l} × ${w} = ${l * w} cubes. How many layers make ${N(l * w * h)}?`, `${N(l * w * h)} ÷ ${l * w} = <b>${h} ${u}</b>.`] };
      }
      const prompt = kind === 'word' ? `${name}'s toy chest is ${l} ${u} long, ${w} ${u} wide and ${h} ${u} tall. What is its volume?` : `Find the volume of a rectangular prism with length ${l} ${u}, width ${w} ${u} and height ${h} ${u}.`;
      return { prompt, type: 'number', answer: l * w * h, unit: u + '³', params: { kind, l, w, h },
        hints: ['Use V = l × w × h.', `${l} × ${w} = ${l * w} (one layer), then ${l * w} × ${h}.`, `The volume is <b>${N(l * w * h)} ${u}³</b>.`] };
    },
    verify(q) { const p = q.params; if (p.kind === 'missing') return q.answer * p.l * p.w === p.V; return countCubes(p.l, p.w, p.h) === q.answer; },
  });

  A.skill({
    id: 'g5.composite-volume', title: 'Volume of figures made of two boxes',
    learn: p('Some solids are made of two rectangular prisms stuck together, like an L shape or a set of steps. <b>Split the figure into two boxes, find the volume of each with l × w × h, and add them.</b>') +
      p('Volumes add because the boxes do not overlap: every unit cube belongs to exactly one of them. If you know the total and one part, subtract to find the other part.') +
      example('Example', `${big('Box A: 4 × 3 × 2 &nbsp; Box B: 2 × 3 × 5')}A = 4 × 3 × 2 = 24 and B = 2 × 3 × 5 = 30. Together: 24 + 30 = <b>54 cubic units</b>.`),
    make(rng) {
      const kind = rng.pick(['picture', 'picture', 'table', 'missing']), name = rng.pick(NAMES);
      if (kind === 'picture') {
        const w = rng.int(1, 3), l1 = rng.int(2, 4), h1 = rng.int(1, 2), l2 = rng.int(1, 3), h2 = h1 + rng.int(1, 2);
        const pic = cubesSvg(box(0, l1, w, h1).concat(box(l1, l2, w, h2)));
        const v1 = l1 * w * h1, v2 = l2 * w * h2;
        return { prompt: `This figure is built from unit cubes, with no gaps. What is its volume?${pic}`, type: 'number', answer: v1 + v2, unit: 'cubic units', params: { kind, boxes: [[l1, w, h1], [l2, w, h2]] },
          hints: [`Split it into two boxes: the low part on the left and the tall part on the right.`, `Left box: ${l1} × ${w} × ${h1} = ${v1}. Right box: ${l2} × ${w} × ${h2} = ${v2}.`, `Add them: ${v1} + ${v2} = <b>${v1 + v2} cubic units</b>.`] };
      }
      const u = rng.pick(['cm', 'in', 'ft', 'm']);
      const d1 = [rng.int(3, 10), rng.int(2, 6), rng.int(2, 6)], d2 = [rng.int(2, 8), rng.int(2, 6), rng.int(2, 9)];
      const v1 = d1[0] * d1[1] * d1[2], v2 = d2[0] * d2[1] * d2[2];
      const table = M.table(['Box', 'Length', 'Width', 'Height'], [['A'].concat(d1.map(x => `${x} ${u}`)), ['B'].concat(d2.map(x => `${x} ${u}`))]);
      if (kind === 'missing') {
        return { prompt: `${name} builds a figure from two boxes. The whole figure has a volume of ${N(v1 + v2)} ${u}³. Box A is ${d1[0]} ${u} long, ${d1[1]} ${u} wide and ${d1[2]} ${u} tall. What is the volume of box B?`, type: 'number', answer: v2, unit: u + '³', params: { kind, boxes: [d1], total: v1 + v2 },
          hints: [`Find box A's volume: ${d1.join(' × ')} = ${v1} ${u}³.`, `The two volumes add up to the total, so box B = ${N(v1 + v2)} − ${v1}.`, `Box B has a volume of <b>${v2} ${u}³</b>.`] };
      }
      return { prompt: `A figure is made of two rectangular prisms that do not overlap. What is its total volume?${table}`, type: 'number', answer: v1 + v2, unit: u + '³', params: { kind, boxes: [d1, d2] },
        hints: [`Box A: ${d1.join(' × ')} = ${v1} ${u}³.`, `Box B: ${d2.join(' × ')} = ${v2} ${u}³.`, `Add: ${v1} + ${v2} = <b>${N(v1 + v2)} ${u}³</b>.`] };
    },
    verify(q) {
      const p = q.params, vols = p.boxes.map(b => countCubes(b[0], b[1], b[2]));
      if (p.kind === 'missing') return q.answer + vols[0] === p.total;
      return q.answer === vols[0] + vols[1];
    },
  });

  /* ---------- Unit 7: coordinate plane and algebraic thinking ---------- */
  function gridSvg(points) {
    const u = 22, pad = 28, n = 10, X = x => pad + x * u, Y = y => 14 + (n - y) * u;
    let body = '';
    for (let i = 0; i <= n; i++) {
      body += `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(n)}" class="light"/><line x1="${X(0)}" y1="${Y(i)}" x2="${X(n)}" y2="${Y(i)}" class="light"/>`;
      body += `<text x="${X(i)}" y="${Y(0) + 15}" text-anchor="middle" font-size="11">${i}</text>`;
      if (i) body += `<text x="${X(0) - 7}" y="${Y(i) + 4}" text-anchor="end" font-size="11">${i}</text>`;
    }
    body += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(n) + 8}" y2="${Y(0)}" class="stroke"/><line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(n) - 8}" class="stroke"/>`;
    body += `<text x="${X(n) + 10}" y="${Y(0) + 4}" font-size="12" font-style="italic">x</text><text x="${X(0) + 5}" y="${Y(n) - 4}" font-size="12" font-style="italic">y</text>`;
    points.forEach(pt => { body += `<circle cx="${X(pt.x)}" cy="${Y(pt.y)}" r="4.5" style="fill: var(--primary)"/><text x="${X(pt.x) + 6}" y="${Y(pt.y) - 6}" font-size="13" font-weight="700">${pt.label}</text>`; });
    return svg(pad + n * u + 22, n * u + 36, body, 'coordinate grid');
  }
  const ptText = (x, y) => `(${x}, ${y})`;

  A.skill({
    id: 'g5.coordinate-plane', title: 'Points on the coordinate plane',
    learn: p('The <b>coordinate plane</b> has a flat number line called the <b>x-axis</b> and an upright one called the <b>y-axis</b>. They meet at the <b>origin</b>, (0, 0).') +
      p('A point is named by an <b>ordered pair</b> (x, y). <b>The first number says how far to go right; the second says how far to go up.</b> Order matters: (2, 5) and (5, 2) are different points. One way to remember the order: walk along the hall before you climb the stairs.') +
      example('Example', `${big('Plot (4, 7)')}Start at the origin. Go 4 units right along the x-axis, then 7 units up. That is the point <b>(4, 7)</b>.`),
    make(rng) {
      const kind = rng.pick(['read', 'read', 'which', 'move', 'distance']);
      const used = new Set(), points = [];
      const add = (x, y) => { used.add(x + ',' + y); points.push({ x, y }); };
      const free = () => { let x, y; do { x = rng.int(0, 10); y = rng.int(0, 10); } while (used.has(x + ',' + y)); return [x, y]; };
      let tx = rng.int(1, 9), ty = rng.int(1, 9); if (tx === ty) ty = ty < 9 ? ty + 1 : ty - 1;
      if (kind === 'read' || kind === 'which') {
        add(tx, ty);
        if (kind === 'which') add(ty, tx);
        while (points.length < 4) add(...free());
        const letters = rng.shuffle(['A', 'B', 'C', 'D']);
        points.forEach((pt, i) => { pt.label = letters[i]; });
        const pic = gridSvg(points), target = points[0];
        if (kind === 'read') {
          const opts = [ptText(tx, ty), ptText(ty, tx)];
          [[tx + 1, ty], [tx, ty - 1], [tx - 1, ty], [tx, ty + 1], [ty + 1, tx]].forEach(([x, y]) => { const t = ptText(x, y); if (opts.length < 4 && !opts.includes(t)) opts.push(t); });
          return { prompt: `What are the coordinates of point <b>${target.label}</b>?${pic}`, type: 'choice', choices: opts, answer: ptText(tx, ty), params: { kind, points, label: target.label },
            hints: [`Start at the origin and look straight down from point ${target.label} to the x-axis: it is above ${tx}.`, `Now look across from point ${target.label} to the y-axis: it is level with ${ty}.`, `The x-coordinate comes first: <b>${ptText(tx, ty)}</b>.`] };
        }
        const choices = ['A', 'B', 'C', 'D'].map(l => `Point ${l}`);
        return { prompt: `Which point is at <b>${ptText(tx, ty)}</b>?${pic}`, type: 'choice', choices, keepOrder: true, answer: `Point ${target.label}`, params: { kind, points, x: tx, y: ty },
          hints: [`Go ${tx} units right from the origin along the x-axis.`, `Then go ${ty} units up. (Going ${ty} right and ${tx} up lands on a different point.)`, `You land on <b>point ${target.label}</b>.`] };
      }
      if (kind === 'move') {
        let dx = rng.nz(-5, 5), dy = rng.nz(-5, 5);
        const sx = rng.int(Math.max(0, -dx), Math.min(10, 10 - dx)), sy = rng.int(Math.max(0, -dy), Math.min(10, 10 - dy));
        const ex = sx + dx, ey = sy + dy;
        const opts = [ptText(ex, ey)];
        [[sx + dy, sy + dx], [sx - dx, sy + dy], [sx + dx, sy - dy], [sx - dx, sy - dy], [ex + 1, ey]].forEach(([x, y]) => { const t = ptText(x, y); if (x >= 0 && y >= 0 && opts.length < 4 && !opts.includes(t)) opts.push(t); });
        return { prompt: `Start at point S, ${ptText(sx, sy)}. Move ${Math.abs(dx)} unit${Math.abs(dx) > 1 ? 's' : ''} ${dx > 0 ? 'right' : 'left'} and then ${Math.abs(dy)} unit${Math.abs(dy) > 1 ? 's' : ''} ${dy > 0 ? 'up' : 'down'}. Where do you end up?${gridSvg([{ x: sx, y: sy, label: 'S' }])}`, type: 'choice', choices: opts, answer: ptText(ex, ey), params: { kind, sx, sy, dx, dy },
          hints: [`Moving ${dx > 0 ? 'right' : 'left'} changes only the x-coordinate: ${sx} ${dx > 0 ? '+' : '−'} ${Math.abs(dx)} = ${ex}.`, `Moving ${dy > 0 ? 'up' : 'down'} changes only the y-coordinate: ${sy} ${dy > 0 ? '+' : '−'} ${Math.abs(dy)} = ${ey}.`, `You end up at <b>${ptText(ex, ey)}</b>.`] };
      }
      const horiz = rng.bool(), c = rng.int(1, 9), a = rng.int(0, 5), b = a + rng.int(2, 5);
      const P = horiz ? { x: a, y: c, label: 'A' } : { x: c, y: a, label: 'A' }, Q = horiz ? { x: b, y: c, label: 'B' } : { x: c, y: b, label: 'B' };
      return { prompt: `Point A is at ${ptText(P.x, P.y)} and point B is at ${ptText(Q.x, Q.y)}. How many units apart are they?${gridSvg([P, Q])}`, type: 'number', answer: b - a, unit: 'units', params: { kind, P, Q },
        hints: [`The ${horiz ? 'y' : 'x'}-coordinates are the same, so the points are on the same ${horiz ? 'horizontal' : 'vertical'} line.`, `Subtract the ${horiz ? 'x' : 'y'}-coordinates: ${b} − ${a}.`, `They are <b>${b - a} units</b> apart.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'read') { const t = p.points.find(pt => pt.label === p.label); return q.answer === `(${t.x}, ${t.y})`; }
      if (p.kind === 'which') { const hits = p.points.filter(pt => pt.x === p.x && pt.y === p.y); return hits.length === 1 && q.answer === 'Point ' + hits[0].label; }
      if (p.kind === 'move') { const [x, y] = q.answer.match(/\d+/g).map(Number); return x === p.sx + p.dx && y === p.sy + p.dy; }
      return q.answer === Math.hypot(p.P.x - p.Q.x, p.P.y - p.Q.y);
    },
  });

  /** evaluate a printed expression with JavaScript's own rules, as a second opinion */
  const evalExpr = s => new Function('return ' + s.replace(/&#40;/g, '(').replace(/&#41;/g, ')').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\[/g, '(').replace(/\]/g, ')'))();

  A.skill({
    id: 'g5.order-of-operations', title: 'Order of operations and writing expressions',
    learn: p('<b>Do what is inside parentheses ( ) or brackets [ ] first</b>, starting with the innermost. <b>Then multiply and divide</b> from left to right, <b>then add and subtract</b> from left to right.') +
      p('To <b>write</b> an expression from words, use parentheses for anything that must happen first. “Add 4 and 5, then multiply by 3” is (4 + 5) × 3. Without the parentheses, 4 + 5 × 3 would multiply first and mean something else.') +
      p('Parentheses also help you compare without calculating: 3 × (18 + 7) is 3 times as large as 18 + 7.') +
      example('Example', `${big('2 × [10 − (3 + 4)]')}Innermost first: 3 + 4 = 7. Then the brackets: 10 − 7 = 3. Then 2 × 3 = <b>6</b>.`),
    make(rng) {
      const kind = rng.pick(['eval', 'eval', 'eval', 'write', 'write', 'compare']);
      if (kind === 'eval') {
        const form = rng.int(0, 5);
        let expr, hints;
        if (form === 0) { const a = rng.int(2, 15), b = rng.int(2, 15), c = rng.int(2, 9); expr = `(${a} + ${b}) × ${c}`; hints = [`Parentheses first: ${a} + ${b} = ${a + b}.`, `Then multiply: ${a + b} × ${c} = <b>${(a + b) * c}</b>.`]; }
        else if (form === 1) { const c = rng.int(2, 9), b = c + rng.int(1, 9), a = rng.int(2, 9); expr = `${a} × (${b} − ${c})`; hints = [`Parentheses first: ${b} − ${c} = ${b - c}.`, `Then multiply: ${a} × ${b - c} = <b>${a * (b - c)}</b>.`]; }
        else if (form === 2) { const a = rng.int(2, 20), b = rng.int(2, 9), c = rng.int(2, 9); expr = `${a} + ${b} × ${c}`; hints = [`There are no parentheses, so multiply before adding: ${b} × ${c} = ${b * c}.`, `Then add: ${a} + ${b * c} = <b>${a + b * c}</b>.`]; }
        else if (form === 3) { const c = rng.int(2, 9), k = rng.int(2, 9), b = rng.int(1, 20), a = b + c * k; expr = `(${a} − ${b}) ÷ ${c}`; hints = [`Parentheses first: ${a} − ${b} = ${a - b}.`, `Then divide: ${a - b} ÷ ${c} = <b>${k}</b>.`]; }
        else if (form === 4) { const d = rng.int(1, 5), c = d + rng.int(1, 6), b = rng.int(2, 9), a = rng.int(2, 6); expr = `${a} × [${b} + (${c} − ${d})]`; hints = [`Innermost parentheses first: ${c} − ${d} = ${c - d}.`, `Then the brackets: ${b} + ${c - d} = ${b + c - d}.`, `Then multiply: ${a} × ${b + c - d} = <b>${a * (b + c - d)}</b>.`]; }
        else { const b = rng.int(2, 9), c = rng.int(2, 9), a = b + c + rng.int(1, 20); expr = `${a} − (${b} + ${c})`; hints = [`Parentheses first: ${b} + ${c} = ${b + c}.`, `Then subtract: ${a} − ${b + c} = <b>${a - b - c}</b>.`]; }
        const ans = Number(hints[hints.length - 1].match(/<b>(\d+)<\/b>/)[1]);
        return { prompt: `Evaluate.${big(expr)}`, type: 'number', answer: ans, params: { kind, expr }, hints: [`Look for parentheses or brackets: they come first.`].concat(hints) };
      }
      const [a, b] = rng.sample([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 2), c = rng.pick([2, 3, 4, 5, 6, 7, 8, 9].filter(x => x !== a && x !== b && x < a * b));
      if (kind === 'compare') {
        const m = rng.int(2, 9), x = rng.int(11, 60), y = rng.int(11, 60);
        return { prompt: `Without calculating, how many times as large is the first expression as the second?${big(`${m} × (${x} + ${y}) &nbsp;&nbsp; and &nbsp;&nbsp; ${x} + ${y}`)}`, type: 'number', answer: m, params: { kind, first: `${m} × (${x} + ${y})`, second: `${x} + ${y}` },
          hints: [`Both expressions contain the sum ${x} + ${y}.`, `The first one is ${m} groups of that same sum.`, `So it is <b>${m}</b> times as large.`] };
      }
      const t = rng.int(0, 3);
      let words, right, wrong;
      if (t === 0) { words = `Add ${a} and ${b}, then multiply by ${c}.`; right = `(${a} + ${b}) × ${c}`; wrong = [`${a} + ${b} × ${c}`, `${a} × ${c} + ${b}`, `${c} + ${a} × ${b}`]; }
      else if (t === 1) { words = `Multiply ${a} by ${b}, then subtract ${c}.`; right = `${a} × ${b} − ${c}`; wrong = [`${a} × (${b} − ${c})`, `${c} − ${a} × ${b}`, `(${a} − ${c}) × ${b}`]; }
      else if (t === 2) { words = `${c} times the sum of ${a} and ${b}.`; right = `${c} × (${a} + ${b})`; wrong = [`${c} × ${a} + ${b}`, `${c} + ${a} × ${b}`, `(${c} + ${a}) × ${b}`]; }
      else { const big2 = b + c * a; words = `Subtract ${b} from ${big2}, then divide by ${c}.`; right = `(${big2} − ${b}) ÷ ${c}`; wrong = [`${big2} − ${b} ÷ ${c}`, `(${b} − ${big2}) ÷ ${c}`, `${c} ÷ (${big2} − ${b})`]; }
      const target = [(a + b) * c, a * b - c, c * (a + b), a][t];
      // parentheses as entities: the checker ignores ( and ) when comparing options, but here they are the whole difference
      const ent = e => e.replace(/\(/g, '&#40;').replace(/\)/g, '&#41;');
      right = ent(right); wrong = wrong.map(ent);
      return { prompt: `Which expression matches these words?${big(words)}`, type: 'choice', choices: [right].concat(wrong), answer: right, params: { kind, t, target },
        hints: ['Find what has to happen first. Anything done first, before a multiply or divide, needs parentheses.', t === 1 ? 'Here the multiplication comes first anyway, so no parentheses are needed.' : t === 3 ? 'The subtraction happens before the division, so it goes in parentheses.' : 'The adding happens before the multiplying, so the sum goes in parentheses.', `The expression is <b>${right}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'eval') return evalExpr(p.expr) === q.answer;
      if (p.kind === 'compare') return evalExpr(p.first) / evalExpr(p.second) === q.answer;
      return Math.abs(evalExpr(q.answer) - p.target) < 1e-9;
    },
  });

  A.skill({
    id: 'g5.numerical-patterns', title: 'Numerical patterns',
    learn: p('A <b>pattern</b> follows a rule, like “start at 4 and add 3”: 4, 7, 10, 13, … To find the next number, apply the rule again.') +
      p('Two patterns can be compared term by term. If pattern A is “start at 0, add 2” and pattern B is “start at 0, add 6”, then every term of B is <b>3 times</b> the matching term of A, because 6 is 3 times 2. Matching terms make <b>ordered pairs</b> you could plot: (2, 6), (4, 12), …') +
      example('Example', `${big('A: 0, 3, 6, 9, … &nbsp; B: 0, 12, 24, 36, …')}B adds 12 each time and A adds 3. 12 ÷ 3 = 4, so each term of B is <b>4 times</b> the matching term of A.`),
    make(rng) {
      const kind = rng.pick(['next', 'missing', 'compare', 'pair']);
      const seq = (s, k, n) => { const out = [s]; while (out.length < n) out.push(out[out.length - 1] + k); return out; };
      if (kind === 'next' || kind === 'missing') {
        const s = rng.int(0, 20), k = rng.int(2, 12);
        if (kind === 'next') {
          const t = seq(s, k, 7), ask = rng.int(5, 7);
          return { prompt: `The rule is “start at ${s} and add ${k}.” The pattern begins ${t.slice(0, 4).join(', ')}, … What is the ${M.ordinal(ask)} number in the pattern?`, type: 'number', answer: t[ask - 1], params: { kind, s, k, ask },
            hints: [`Keep adding ${k}: after ${t[3]} comes ${t[4]}.`, `Count until you reach the ${M.ordinal(ask)} number: ${t.slice(0, ask).join(', ')}.`, `The ${M.ordinal(ask)} number is <b>${t[ask - 1]}</b>.`] };
        }
        const t = seq(s, k, 6), gap = rng.int(1, 4), shown = t.map((x, i) => (i === gap ? '__' : x));
        return { prompt: `What number is missing from this pattern?${big(shown.join(', '))}`, type: 'number', answer: t[gap], params: { kind, shown },
          hints: [`Find the rule: compare two neighbors. ${t[gap === 1 ? 3 : 1]} − ${t[gap === 1 ? 2 : 0]} = ${k}, so the rule is add ${k}.`, `The number before the blank is ${t[gap - 1]}. Add ${k}.`, `${t[gap - 1]} + ${k} = <b>${t[gap]}</b>.`] };
      }
      const a = rng.int(2, 6), m = rng.int(2, 5), b = a * m;
      const A5 = seq(0, a, 5), B5 = seq(0, b, 5);
      const table = M.table(['Term', '1st', '2nd', '3rd', '4th', '5th'], [['Pattern A'].concat(A5), ['Pattern B'].concat(B5)], { compact: true });
      if (kind === 'compare') {
        return { prompt: `Pattern A starts at 0 and adds ${a}. Pattern B starts at 0 and adds ${b}. Each term in pattern B is how many times the matching term in pattern A?${table}`, type: 'number', answer: m, params: { kind, a, b },
          hints: [`Compare matching terms: ${A5[2]} in A and ${B5[2]} in B.`, `${B5[2]} ÷ ${A5[2]} = ${m}. Check another pair: ${B5[4]} ÷ ${A5[4]} = ${m}.`, `Each term of B is <b>${m}</b> times the matching term of A.`] };
      }
      const i = rng.int(2, 6), x = a * (i - 1), y = b * (i - 1);
      const opts = [ptText(x, y), ptText(y, x), ptText(x + a, y), ptText(x, y + b)];
      return { prompt: `Pattern A starts at 0 and adds ${a}. Pattern B starts at 0 and adds ${b}. Which ordered pair is made from the ${M.ordinal(i)} term of A and the ${M.ordinal(i)} term of B?`, type: 'choice', choices: opts, answer: ptText(x, y), params: { kind, a, b, i },
        hints: [`List pattern A up to the ${M.ordinal(i)} term: ${seq(0, a, i).join(', ')}.`, `List pattern B the same way: ${seq(0, b, i).join(', ')}.`, `The pattern A term goes first: <b>${ptText(x, y)}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'next') { let v = p.s; for (let i = 1; i < p.ask; i++) v += p.k; return v === q.answer; }
      if (p.kind === 'missing') { const g = p.shown.indexOf('__'), i = [0, 1, 2, 3, 4].find(j => p.shown[j] !== '__' && p.shown[j + 1] !== '__'); return q.answer === p.shown[g - 1] + (p.shown[i + 1] - p.shown[i]); }
      if (p.kind === 'compare') return q.answer * p.a === p.b;
      let x = 0, y = 0; for (let k = 1; k < p.i; k++) { x += p.a; y += p.b; }
      return q.answer === `(${x}, ${y})`;
    },
  });
  /* ---------- Unit 8: measurement, data, and shapes ---------- */
  const CONV = [
    { big: 'kilometers', small: 'meters', bs: 'km', ss: 'm', f: 1000, metric: true },
    { big: 'meters', small: 'centimeters', bs: 'm', ss: 'cm', f: 100, metric: true },
    { big: 'centimeters', small: 'millimeters', bs: 'cm', ss: 'mm', f: 10, metric: true },
    { big: 'kilograms', small: 'grams', bs: 'kg', ss: 'g', f: 1000, metric: true },
    { big: 'liters', small: 'milliliters', bs: 'L', ss: 'mL', f: 1000, metric: true },
    { big: 'feet', small: 'inches', bs: 'ft', ss: 'in', f: 12 },
    { big: 'yards', small: 'feet', bs: 'yd', ss: 'ft', f: 3 },
    { big: 'pounds', small: 'ounces', bs: 'lb', ss: 'oz', f: 16 },
    { big: 'gallons', small: 'quarts', bs: 'gal', ss: 'qt', f: 4 },
    { big: 'hours', small: 'minutes', bs: 'hr', ss: 'min', f: 60 },
  ];
  const ONE = { kilometers: 'kilometer', meters: 'meter', centimeters: 'centimeter', kilograms: 'kilogram', liters: 'liter', feet: 'foot', yards: 'yard', pounds: 'pound', gallons: 'gallon', hours: 'hour' };
  const cap = s => s[0].toUpperCase() + s.slice(1);

  A.skill({
    id: 'g5.unit-conversion', title: 'Converting units of measure',
    learn: p('<b>Going from a bigger unit to a smaller unit, multiply</b>: you need more of the small units. <b>Going from a smaller unit to a bigger one, divide.</b>') +
      p('Metric units go up by 10s: 1 km = 1,000 m, 1 m = 100 cm, 1 cm = 10 mm, 1 kg = 1,000 g, 1 L = 1,000 mL. So converting is the same as multiplying or dividing by a power of ten. Customary units have their own numbers: 1 ft = 12 in, 1 yd = 3 ft, 1 lb = 16 oz, 1 gal = 4 qt, and 1 hour = 60 minutes.') +
      example('Example', `${big('350 cm = ? m')}Centimeters are smaller, so divide by 100: 350 ÷ 100 = <b>3.5 m</b>. And 5 ft 4 in is 5 × 12 + 4 = <b>64 in</b>.`),
    make(rng) {
      const kind = rng.pick(['down', 'down', 'up', 'up', 'mix', 'word']), name = rng.pick(NAMES);
      if (kind === 'word') {
        const t = rng.int(0, 2);
        const [c, v, k, pc] = t === 0 ? [CONV[1], rng.int(2, 5), rng.int(2, 4), rng.int(3, 9) * 5] : t === 1 ? [CONV[4], rng.int(2, 4), rng.int(2, 5), rng.pick([150, 200, 250, 300])] : [CONV[5], rng.int(4, 8), rng.int(2, 4), rng.int(4, 10)];
        const total = v * c.f, used = k * pc, ans = total - used;
        const prompt = t === 0 ? `${name} has a ribbon ${v} m long and cuts off ${k} pieces that are each ${pc} cm long. How many centimeters of ribbon are left?`
          : t === 1 ? `A jug holds ${v} L of juice. ${name} pours ${k} glasses of ${pc} mL each. How many milliliters of juice are left in the jug?`
            : `${name} has a rope ${v} ft long and cuts off ${k} pieces that are each ${pc} inches long. How many inches of rope are left?`;
        return { prompt, type: 'number', answer: ans, unit: c.ss, params: { kind, f: c.f, v, k, pc },
          hints: [`Change the whole amount to ${c.small}: ${v} × ${N(c.f)} = ${N(total)} ${c.ss}.`, `Find how much was used: ${k} × ${pc} = ${N(used)} ${c.ss}.`, `${N(total)} − ${N(used)} = <b>${N(ans)} ${c.ss}</b>.`] };
      }
      if (kind === 'mix') {
        const c = rng.pick(CONV.filter(x => !x.metric)), w = rng.int(2, 9), r = rng.int(1, c.f - 1);
        return { prompt: `Fill in the blank.${big(`${w} ${c.bs} ${r} ${c.ss} = ? ${c.ss}`)}`, type: 'number', answer: w * c.f + r, unit: c.ss, params: { kind, f: c.f, w, r },
          hints: [`1 ${ONE[c.big]} = ${c.f} ${c.small}, so ${w} ${c.big} = ${w} × ${c.f} = ${w * c.f} ${c.small}.`, `Add the extra ${r}: ${w * c.f} + ${r} = <b>${w * c.f + r} ${c.ss}</b>.`] };
      }
      const c = rng.pick(CONV);
      const decs = [1.5, 2.5, 3.5, 0.5, 4.2, 0.75, 1.25, 6.4].filter(x => Math.abs(M.round(x * c.f, 6) % 1) < 1e-9);
      const v = c.metric && rng.chance(0.4) ? rng.pick(decs) : rng.int(2, 12);
      const small = M.round(v * c.f, 6);
      if (kind === 'down') {
        return { prompt: `Fill in the blank.${big(`${N(v)} ${c.bs} = ? ${c.ss}`)}`, type: 'number', answer: small, unit: c.ss, params: { kind, f: c.f, given: v },
          hints: [`${cap(c.big)} are bigger than ${c.small}, so multiply. 1 ${ONE[c.big]} = ${N(c.f)} ${c.small}.`, `${N(v)} × ${N(c.f)} = <b>${N(small)} ${c.ss}</b>.`] };
      }
      return { prompt: `Fill in the blank.${big(`${N(small)} ${c.ss} = ? ${c.bs}`)}`, type: 'number', answer: v, unit: c.bs, params: { kind, f: c.f, given: small },
        hints: [`${cap(c.small)} are smaller than ${c.big}, so divide. 1 ${ONE[c.big]} = ${N(c.f)} ${c.small}.`, `${N(small)} ÷ ${N(c.f)} = <b>${N(v)} ${c.bs}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'word') return q.answer + p.k * p.pc === p.v * p.f;
      if (p.kind === 'mix') return (q.answer - p.r) / p.f === p.w;
      if (p.kind === 'down') return Math.abs(q.answer / p.f - p.given) < 1e-9;
      return Math.abs(q.answer * p.f - p.given) < 1e-9;
    },
  });

  function linePlotSvg(start, den, counts) {
    const gap = 58, pad = 34, n = counts.length, W = pad * 2 + (n - 1) * gap, H = 44 + Math.max(...counts) * 17;
    const axis = H - 30;
    let body = `<line x1="${pad - 20}" y1="${axis}" x2="${W - pad + 20}" y2="${axis}" class="stroke"/>`;
    counts.forEach((c, i) => {
      const x = pad + i * gap;
      body += `<line x1="${x}" y1="${axis - 5}" x2="${x}" y2="${axis + 5}" class="stroke"/><text x="${x}" y="${axis + 20}" text-anchor="middle" font-size="13">${mixText(start + i, den)}</text>`;
      for (let j = 0; j < c; j++) { const y = axis - 14 - j * 17; body += `<path d="M ${x - 5} ${y - 5} L ${x + 5} ${y + 5} M ${x + 5} ${y - 5} L ${x - 5} ${y + 5}" class="stroke" style="stroke-width:2.2;stroke-linecap:round"/>`; }
    });
    return svg(W, H, body, 'line plot');
  }
  const LP = [
    { things: 'pencils', units: 'inches', u: 'in', title: 'Pencil lengths (inches)', more: 'longer than', diff: 'How much longer is the longest pencil than the shortest pencil?', at: 'pencils that are' },
    { things: 'ribbons', units: 'yards', u: 'yd', title: 'Ribbon lengths (yards)', more: 'longer than', diff: 'How much longer is the longest ribbon than the shortest ribbon?', at: 'ribbons that are' },
    { things: 'bags of trail mix', units: 'pounds', u: 'lb', title: 'Bags of trail mix (pounds)', more: 'heavier than', diff: 'How much heavier is the heaviest bag than the lightest bag?', at: 'bags that weigh' },
    { things: 'bottles of water', units: 'liters', u: 'L', title: 'Water in each bottle (liters)', more: 'holding more than', diff: 'How much more water is in the fullest bottle than in the emptiest bottle?', at: 'bottles that hold' },
  ];

  A.skill({
    id: 'g5.line-plots', title: 'Line plots with fractions',
    learn: p(`A <b>line plot</b> shows data on a number line. <b>Each X stands for one item</b>, placed above its measurement. Three X marks above ${F(3, 4)} mean that three items measured ${F(3, 4)}.`) +
      p('To find a total, multiply each value by how many X marks it has and add the results. To compare the biggest and smallest, subtract the value furthest left from the value furthest right.') +
      example('Example', `${big(`3 pencils at ${F(1, 2)} inch`)}Their total length is 3 × ${F(1, 2)} = <b>${F(3, 2)} = 1${`<span class="mixed">${F(1, 2)}</span>`} inches</b>.`),
    make(rng) {
      const den = rng.pick([2, 4, 4, 8, 8]), n = rng.int(4, 6), start = rng.int(1, den + 1);
      const counts = Array.from({ length: n }, () => rng.int(0, 4)); counts[0] = Math.max(1, counts[0]); counts[n - 1] = Math.max(1, counts[n - 1]);
      const ctx = rng.pick(LP), kind = rng.pick(['more', 'diff', 'at', 'total']);
      const pic = `<div style="text-align:center;font-weight:600">${ctx.title}</div>${linePlotSvg(start, den, counts)}`;
      const val = i => mixText(start + i, den);
      const pieces = den === 2 ? 'halves' : den === 4 ? 'fourths' : 'eighths';
      if (kind === 'more') {
        const i = rng.int(0, n - 2), ans = counts.slice(i + 1).reduce((s, c) => s + c, 0);
        return { prompt: `How many ${ctx.things} are ${ctx.more} ${val(i)} ${ctx.units}?${pic}`, type: 'number', answer: ans, params: { kind, start, den, counts, i },
          hints: [`Look only at the X marks to the right of ${val(i)}. Do not count the ones above ${val(i)} itself.`, `Add them up: ${counts.slice(i + 1).join(' + ')} = <b>${ans}</b>.`] };
      }
      if (kind === 'diff') {
        return { prompt: `${ctx.diff}${pic}`, type: 'number', answer: (n - 1) / den, answerText: mixText(n - 1, den), unit: ctx.u, params: { kind, start, den, counts },
          hints: [`The smallest value with an X is ${val(0)} and the largest is ${val(n - 1)}.`, `Subtract: ${fx(start + n - 1, den)} − ${fx(start, den)} = ${fx(n - 1, den)}.`, `The difference is <b>${M.mixed(n - 1, den)} ${ctx.units}</b>.`] };
      }
      if (kind === 'at') {
        const opts = counts.map((c, i) => i).filter(i => counts[i] >= 2), i = opts.length ? rng.pick(opts) : 0, c = counts[i];
        return { prompt: `What is the total of all the ${ctx.at} ${val(i)} ${ctx.units}?${pic}`, type: 'number', answer: c * (start + i) / den, answerText: mixText(c * (start + i), den), unit: ctx.u, params: { kind, start, den, counts, i },
          hints: [`There ${c === 1 ? 'is 1 X' : `are ${c} X marks`} above ${val(i)}.`, `Multiply: ${c} × ${fx(start + i, den)} = ${fx(c * (start + i), den)}.`, `The total is <b>${showFrac(c * (start + i), den)} ${ctx.units}</b>.`] };
      }
      const num = counts.reduce((s, c, i) => s + c * (start + i), 0);
      return { prompt: `What is the total of all the ${ctx.things} together, in ${ctx.units}?${pic}`, type: 'number', answer: num / den, answerText: mixText(num, den), unit: ctx.u, params: { kind, start, den, counts },
        hints: [`For each value, multiply it by the number of X marks above it. Count everything in ${pieces}.`, `In ${pieces}: ${counts.map((c, i) => `${c} × ${start + i}`).join(' + ')} = ${num}, so the total is ${fx(num, den)}.`, `The total is <b>${showFrac(num, den)} ${ctx.units}</b>.`] };
    },
    verify(q) {
      const { kind, start, den, counts, i } = q.params, data = [];
      counts.forEach((c, k) => { for (let j = 0; j < c; j++) data.push((start + k) / den); });
      const close = v => Math.abs(v - q.answer) < 1e-9;
      if (kind === 'more') return q.answer === data.filter(v => v > (start + i) / den + 1e-12).length;
      if (kind === 'diff') return close(Math.max(...data) - Math.min(...data));
      if (kind === 'at') return close(data.filter(v => Math.abs(v - (start + i) / den) < 1e-12).reduce((s, v) => s + v, 0));
      return close(data.reduce((s, v) => s + v, 0));
    },
  });

  const QUAD_PARENTS = { square: ['rectangle', 'rhombus', 'parallelogram'], rectangle: ['parallelogram'], rhombus: ['parallelogram'], parallelogram: [] };
  const QUAD_DESC = {
    square: { text: '4 sides of equal length and 4 right angles', equal: true, right: true, pairs: 2 },
    rectangle: { text: '2 pairs of parallel sides and 4 right angles, but its sides are not all the same length', equal: false, right: true, pairs: 2 },
    rhombus: { text: '4 sides of equal length, but no right angles', equal: true, right: false, pairs: 2 },
    parallelogram: { text: '2 pairs of parallel sides, no right angles, and sides that are not all the same length', equal: false, right: false, pairs: 2 },
    trapezoid: { text: 'exactly 1 pair of parallel sides', equal: false, right: false, pairs: 1 },
  };

  A.skill({
    id: 'g5.classify-shapes', title: 'Classifying triangles and quadrilaterals',
    learn: p('<b>Triangles by sides:</b> equilateral has all 3 sides equal, isosceles has at least 2 equal, scalene has no equal sides. <b>Triangles by angles:</b> acute has all angles less than 90°, right has one 90° angle, obtuse has one angle more than 90°. The three angles always add to 180°.') +
      p('<b>Quadrilaterals form a family.</b> A parallelogram has 2 pairs of parallel sides. A rectangle is a parallelogram with 4 right angles. A rhombus is a parallelogram with 4 equal sides. A square is both: 4 equal sides <i>and</i> 4 right angles. A trapezoid has exactly 1 pair of parallel sides.') +
      p('So every square is a rectangle, but not every rectangle is a square. When asked for the most specific name, pick the one that tells the most about the shape.') +
      example('Example', `${big('A triangle has angles of 35° and 40°.')}The third angle is 180 − 35 − 40 = 105°, which is more than 90°, so the triangle is <b>obtuse</b>.`),
    make(rng) {
      const kind = rng.pick(['sides', 'angles', 'statement', 'describe']);
      if (kind === 'sides') {
        const type = rng.pick(['equilateral', 'isosceles', 'isosceles', 'scalene']);
        let s;
        if (type === 'equilateral') { const a = rng.int(3, 12); s = [a, a, a]; }
        else if (type === 'isosceles') { const a = rng.int(3, 12); let b = rng.int(2, 2 * a - 1); if (b === a) b = a + 1; s = [a, a, b]; }
        else { const a = rng.int(3, 8), b = a + rng.int(1, 4), c = b + rng.int(1, a - 1); s = [a, b, c]; }
        s = rng.shuffle(s);
        const distinct = new Set(s).size;
        return { prompt: `A triangle has sides of ${s[0]} cm, ${s[1]} cm and ${s[2]} cm. What kind of triangle is it? Choose the most specific name.`, type: 'choice', choices: ['equilateral', 'isosceles', 'scalene'], keepOrder: true, answer: type, params: { kind, s },
          hints: ['Look for sides that have the same length.', distinct === 1 ? 'All three sides are equal.' : distinct === 2 ? 'Exactly two sides are equal.' : 'No two sides are equal.', `So it is <b>${type}</b>.`] };
      }
      if (kind === 'angles') {
        const type = rng.pick(['acute', 'right', 'obtuse']);
        let ang;
        if (type === 'right') { const x = rng.int(20, 70); ang = [90, x, 90 - x]; }
        else if (type === 'obtuse') { const o = rng.int(95, 150), x = rng.int(10, 180 - o - 10); ang = [o, x, 180 - o - x]; }
        else { let a, b; do { a = rng.int(35, 85); b = rng.int(35, 85); } while (180 - a - b >= 90 || 180 - a - b < 10); ang = [a, b, 180 - a - b]; }
        ang = rng.shuffle(ang);
        const two = rng.bool(), shown = two ? ang.slice(0, 2) : ang;
        const hints = [];
        if (two) hints.push(`First find the third angle: 180 − ${shown[0]} − ${shown[1]} = ${ang[2]}°.`);
        const mx = Math.max(...ang);
        hints.push(`The largest angle is ${mx}°, which is ${mx === 90 ? 'a right angle' : mx > 90 ? 'more than 90°' : 'less than 90°, so every angle is less than 90°'}.`);
        hints.push(`So the triangle is <b>${type}</b>.`);
        return { prompt: two ? `Two angles of a triangle measure ${shown[0]}° and ${shown[1]}°. Classify the triangle by its angles.` : `A triangle has angles of ${ang[0]}°, ${ang[1]}° and ${ang[2]}°. Classify the triangle by its angles.`, type: 'choice', choices: ['acute', 'right', 'obtuse'], keepOrder: true, answer: type, params: { kind, shown }, hints };
      }
      if (kind === 'statement') {
        const pairs = []; Object.keys(QUAD_PARENTS).forEach(x => QUAD_PARENTS[x].forEach(y => pairs.push([x, y])));
        const [x, y] = rng.pick(pairs);
        const falses = rng.sample(pairs.map(([a, b]) => [b, a]), 3);
        const say = ([a, b]) => `Every ${a} is a ${b}.`;
        return { prompt: 'Which statement is true?', type: 'choice', choices: [say([x, y])].concat(falses.map(say)), answer: say([x, y]), params: { kind, x, y },
          hints: ['A shape belongs to a group when it has everything that group needs.', `A ${x} has everything a ${y} needs, so every ${x} is a ${y}. The other statements are backwards: not every shape in the bigger group has the extra properties.`, `The true statement is <b>${say([x, y])}</b>`] };
      }
      const name = rng.pick(Object.keys(QUAD_DESC));
      const opts = [name].concat(rng.sample(Object.keys(QUAD_DESC).filter(k => k !== name), 3));
      const d = QUAD_DESC[name];
      return { prompt: `A quadrilateral has ${d.text}. What is the most specific name for it?`, type: 'choice', choices: opts, answer: name, params: { kind, props: { equal: d.equal, right: d.right, pairs: d.pairs } },
        hints: [d.pairs === 1 ? 'Only one pair of sides is parallel, so it is not a parallelogram.' : 'Opposite sides are parallel, so it is at least a parallelogram.', `Now check: ${d.right ? 'it has right angles' : 'it has no right angles'}, and ${d.equal ? 'all its sides are equal' : 'its sides are not all equal'}.`, `The most specific name is <b>${name}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'sides') { const k = new Set(p.s).size; const [a, b, c] = p.s.slice().sort((u, v) => u - v); return a + b > c && q.answer === ['', 'equilateral', 'isosceles', 'scalene'][k]; }
      if (p.kind === 'angles') { const all = p.shown.length === 3 ? p.shown : p.shown.concat(180 - p.shown[0] - p.shown[1]); const m = Math.max(...all); return Math.min(...all) > 0 && q.answer === (m === 90 ? 'right' : m > 90 ? 'obtuse' : 'acute'); }
      if (p.kind === 'statement') return QUAD_PARENTS[p.x].includes(p.y) && q.answer === `Every ${p.x} is a ${p.y}.`;
      const { equal, right, pairs } = p.props;
      return q.answer === (pairs === 1 ? 'trapezoid' : equal && right ? 'square' : right ? 'rectangle' : equal ? 'rhombus' : 'parallelogram');
    },
  });

  /* ---------- Mental math and estimation ---------- */
  A.skill({
    id: 'g5.times-11', title: 'Multiplying by 9, 11 and 99 in your head',
    learn: p('<b>Times 11:</b> for a two-digit number, write its two digits apart and put their sum in the middle: 43 × 11 → 4, 4 + 3, 3 → <b>473</b>. If the middle sum is 10 or more, carry the 1 to the first digit: 78 × 11 → 7 + 1, 5, 8 → <b>858</b>.') +
      p('<b>Times 9:</b> multiply by 10, then subtract the number once, because 9 = 10 − 1. <b>Times 99:</b> multiply by 100, then subtract the number once.') +
      example('Example', `${big('37 × 9')}37 × 10 = 370, and 370 − 37 = <b>333</b>.`),
    make(rng) {
      const kind = rng.pick(['eleven', 'eleven', 'nine', 'ninety-nine']), a = rng.int(12, 98);
      let ans, hints;
      if (kind === 'eleven') {
        const t = Math.floor(a / 10), o = a % 10, mid = t + o;
        ans = a * 11;
        hints = [`Split ${a} into its digits, ${t} and ${o}.`, `Their sum, ${t} + ${o} = ${mid}, goes in the middle${mid >= 10 ? `; it is 10 or more, so write ${mid - 10} and carry 1 to the ${t}` : ''}.`, `So ${a} × 11 = <b>${N(ans)}</b>.`];
      } else if (kind === 'nine') { ans = a * 9; hints = ['9 is 10 − 1, so multiply by 10 and take away one lot.', `${a} × 10 = ${a * 10}.`, `${a * 10} − ${a} = <b>${N(ans)}</b>.`]; }
      else { ans = a * 99; hints = ['99 is 100 − 1, so multiply by 100 and take away one lot.', `${a} × 100 = ${N(a * 100)}.`, `${N(a * 100)} − ${a} = <b>${N(ans)}</b>.`]; }
      const by = { eleven: 11, nine: 9, 'ninety-nine': 99 }[kind];
      return { prompt: `Multiply in your head.${big(`${a} × ${by}`)}`, type: 'number', answer: ans, params: { a, by }, hints };
    },
    verify(q) { return q.answer === q.params.a * q.params.by; },
  });

  /** a number rounded to its leading digit: 4,382 → 4,000; 68 → 70 */
  const lead = x => { const k = Math.pow(10, Math.floor(Math.log10(x))); return Math.round(x / k) * k; };
  A.skill({
    id: 'g5.estimate-products', title: 'Estimating products and quotients',
    learn: p('To estimate a product, <b>round each factor to its leading digit</b> (the first digit, with zeros after it), then multiply: 48 × 31 is about 50 × 30 = 1,500.') +
      p('To estimate a quotient, use <b>compatible numbers</b>: change the number being divided to one close by that divides evenly. 3,145 ÷ 8 is about 3,200 ÷ 8 = 400. An estimate tells you the size of the answer, so you can spot a misplaced digit.') +
      example('Example', `${big('Estimate 612 × 48.')}612 is about 600 and 48 is about 50, so the product is about 600 × 50 = <b>30,000</b>.`),
    make(rng) {
      if (rng.chance(0.55)) {
        let a = rng.pick([rng.int(12, 98), rng.int(112, 980)]), b = rng.int(12, 98);
        const ea = lead(a), eb = lead(b), ans = ea * eb;
        return { prompt: `Estimate the product by rounding each factor to its leading digit.${big(`${N(a)} × ${b}`)}`, type: 'number', answer: ans, params: { kind: 'product', a, b },
          hints: [`${N(a)} rounds to ${N(ea)}, and ${b} rounds to ${eb}.`, `Multiply the rounded numbers: ${N(ea)} × ${eb}.`, `${N(ea)} × ${eb} = <b>${N(ans)}</b>.`] };
      }
      const d = rng.int(3, 9), est = rng.int(2, 9) * Math.pow(10, rng.int(1, 2));
      let n = est * d + rng.int(-Math.floor(d * est / 20), Math.floor(d * est / 20));
      if (n % d === 0) n += 1;
      const answer = N(est), wrong = [N(est * 10), N(est / 10), N(est + 3 * Math.pow(10, Math.floor(Math.log10(est))))];
      return { prompt: `Which is the best estimate?${big(`${N(n)} ÷ ${d}`)}`, type: 'choice', choices: [answer].concat(wrong), answer, params: { kind: 'quotient', n, d },
        hints: [`Find a number close to ${N(n)} that ${d} divides evenly: ${N(est * d)}.`, `${N(est * d)} ÷ ${d} = ${N(est)}.`, `The best estimate is <b>${N(est)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'product') return q.answer === lead(P.a) * lead(P.b);
      const exact = P.n / P.d, val = c => Number(A.stripTags(c).replace(/,/g, '')), dist = q.choices.map(c => Math.abs(val(c) - exact)), best = Math.min.apply(null, dist);
      return dist.indexOf(best) === q.choices.indexOf(q.answer) && dist.filter(x => x === best).length === 1;
    },
  });

  /* ---------- reading line graphs ---------- */
  const LINES = [
    { title: 'Temperature on a spring day', unit: '°F', what: 'temperature', xs: ['8 am', '10 am', '12 pm', '2 pm', '4 pm', '6 pm'], lo: 40, step: 5 },
    { title: 'Height of a bean plant', unit: 'cm', what: 'height', xs: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'], lo: 0, step: 2 },
    { title: 'Visitors to a library', unit: 'visitors', what: 'number of visitors', xs: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], lo: 20, step: 10 },
    { title: 'Money in a savings jar', unit: 'dollars', what: 'amount saved', xs: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], lo: 0, step: 5 },
  ];
  function lineGraph(g, vals) {
    const W = 330, H = 220, x0 = 46, y0 = 180, top = 28, gw = W - x0 - 14, n = vals.length, rows = 8;
    const yv = k => g.lo + k * g.step, py = v => y0 - (v - g.lo) / (rows * g.step) * (y0 - top), px = i => x0 + 12 + i * (gw - 24) / (n - 1);
    let s = `<svg class="figure" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="line graph: ${g.title}"><text x="${W / 2}" y="16" text-anchor="middle" font-size="13" font-weight="700">${g.title}</text>`;
    for (let k = 0; k <= rows; k++) s += `<line class="light" x1="${x0}" y1="${py(yv(k))}" x2="${W - 10}" y2="${py(yv(k))}" style="stroke-width:1"/><text x="${x0 - 6}" y="${py(yv(k)) + 4}" text-anchor="end" font-size="11">${yv(k)}</text>`;
    vals.forEach((v, i) => { s += `<text x="${px(i)}" y="${y0 + 18}" text-anchor="middle" font-size="10.5">${g.xs[i]}</text>`; });
    s += `<polyline class="line" points="${vals.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ')}"/>`;
    vals.forEach((v, i) => { s += `<circle class="dot" cx="${px(i).toFixed(1)}" cy="${py(v).toFixed(1)}" r="4"/>`; });
    return s + `<line class="stroke" x1="${x0}" y1="${y0}" x2="${W - 10}" y2="${y0}"/><line class="stroke" x1="${x0}" y1="${top - 6}" x2="${x0}" y2="${y0}"/></svg>`;
  }
  A.skill({
    id: 'g5.line-graphs', title: 'Reading line graphs',
    learn: p('A <b>line graph</b> shows how something changes over time. Each dot is one reading: find it above a time on the bottom, then <b>read across to the scale</b> on the side. The line between dots shows the change.') +
      p('A line that climbs means the amount went up; a line that falls means it went down. <b>To find a change, subtract</b> the earlier reading from the later one. The steepest piece of line is where it changed fastest.') +
      example('Example', 'If the temperature is 55°F at 10 am and 70°F at 2 pm, it rose 70 − 55 = <b>15</b> degrees between those times.'),
    make(rng) {
      const g = rng.pick(LINES), vals = [];
      let v = rng.int(1, 3);
      for (let i = 0; i < 6; i++) { vals.push(g.lo + v * g.step); v = Math.max(0, Math.min(8, v + rng.pick(g.what === 'height' || g.what === 'amount saved' ? [0, 1, 1, 2] : [-1, 1, 1, 2, -2]))); }
      const pic = lineGraph(g, vals), kind = rng.pick(['read', 'change', 'most', 'drop']);
      if (kind === 'read') { const i = rng.int(0, 5); return { prompt: `Look at the line graph.${pic}What was the ${g.what} at ${g.xs[i]}?`, type: 'number', answer: vals[i], params: { kind, vals, i }, hints: [`Find ${g.xs[i]} along the bottom.`, `Go up to the dot, then read across to the scale on the left.`, `It is <b>${vals[i]}</b>.`] }; }
      if (kind === 'change') { let i = rng.int(0, 3), j = rng.int(i + 1, 5); if (vals[j] === vals[i]) j = vals.findIndex((x, k) => k > i && x !== vals[i]); if (j < 0) { i = 0; j = 5; } const ans = vals[j] - vals[i]; return { prompt: `Look at the line graph.${pic}By how much did the ${g.what} change from ${g.xs[i]} to ${g.xs[j]}? Write a fall as a negative number.`, type: 'number', answer: ans, params: { kind, vals, i, j }, hints: [`At ${g.xs[i]} it was ${vals[i]}; at ${g.xs[j]} it was ${vals[j]}.`, `Subtract the earlier reading from the later one: ${vals[j]} − ${vals[i]}.`, `The change is <b>${M.n(ans)}</b>.`] }; }
      const ups = vals.slice(1).map((x, k) => x - vals[k]);
      const target = kind === 'most' ? Math.max.apply(null, ups) : Math.min.apply(null, ups);
      if (ups.filter(u => u === target).length > 1 || (kind === 'drop' && target >= 0)) { const i = rng.int(0, 5); return { prompt: `Look at the line graph.${pic}What was the ${g.what} at ${g.xs[i]}?`, type: 'number', answer: vals[i], params: { kind: 'read', vals, i }, hints: [`Find ${g.xs[i]} along the bottom.`, `Go up to the dot, then read across to the scale on the left.`, `It is <b>${vals[i]}</b>.`] }; }
      const k = ups.indexOf(target), pair = i => `${g.xs[i]} to ${g.xs[i + 1]}`;
      const answer = pair(k), choices = [answer].concat([0, 1, 2, 3, 4].filter(i => i !== k).slice(0, 3).map(pair));
      return { prompt: `Look at the line graph.${pic}Between which two neighboring readings did the ${g.what} ${kind === 'most' ? 'go up the most' : 'fall the most'}?`, type: 'choice', choices, answer, params: { kind, vals, k },
        hints: [`Find the piece of line that is ${kind === 'most' ? 'steepest going up' : 'steepest going down'}.`, `From ${g.xs[k]} to ${g.xs[k + 1]} it went from ${vals[k]} to ${vals[k + 1]}, a change of ${M.n(target)}.`, `<b>${answer}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'read') return q.answer === P.vals[P.i];
      if (P.kind === 'change') return q.answer === P.vals[P.j] - P.vals[P.i];
      const ups = P.vals.slice(1).map((x, k) => x - P.vals[k]), t = P.kind === 'most' ? Math.max.apply(null, ups) : Math.min.apply(null, ups);
      return ups.indexOf(t) === P.k && ups.filter(u => u === t).length === 1;
    },
  });

})();
