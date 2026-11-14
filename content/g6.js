/* 6th grade math. Ratios, rates and percentages, dividing fractions, decimals, negative numbers and the
   coordinate plane, factors and multiples, expressions, equations and inequalities, area and volume,
   and data and statistics. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v, X = M.v('x');
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe',
    'Aiko', 'Amara', 'Anika', 'Diego', 'Fatima', 'Hana', 'Kwame', 'Leila', 'Mateo', 'Mei', 'Nikhil', 'Rosa', 'Tariq', 'Wei', 'Yusuf', 'Zara'];
  const p = (s) => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const wrap = x => x < 0 ? `(${N(x)})` : N(x);
  const close = (a, b) => Math.abs(a - b) < 1e-9;
  /** the right option plus up to three distinct wrong ones (duplicates of anything already in are skipped) */
  function options(right, wrongs) {
    const key = s => A.normText(A.stripTags(s));
    const out = [right], seen = new Set([key(right)]);
    for (const w of wrongs) { const k = key(w); if (!seen.has(k)) { seen.add(k); out.push(w); } if (out.length === 4) break; }
    return out;
  }
  /** a fraction n/d (or a whole number) printed as a mixed number when it is bigger than 1 */
  const MX = (n, d) => M.mixed(n, d);
  /** the same number as plain text for a drawing (no HTML inside an <svg>): 5/2 → "2 1/2", 3/4 → "3/4", 6/2 → "3" */
  const mixTxt = (n, d) => { const [a, b] = M.simp(n, d), w = Math.floor(a / b), r = a % b; return r === 0 ? String(w) : w ? `${w} ${r}/${b}` : `${r}/${b}`; };

  A.course({
    id: 'math-6', title: '6th grade math', subject: 'Middle school', grade: 6, icon: '6', hue: 165,
    blurb: 'Ratios, rates and percents, dividing fractions, decimals, negative numbers, expressions and equations, area and volume, and statistics.',
    units: [
      { id: 'ratios', title: 'Ratios', blurb: 'Comparing two amounts, and keeping the comparison the same as they grow.', skills: ['g6.ratio-language', 'g6.ratio-tables'] },
      { id: 'rates', title: 'Rates and percentages', blurb: 'How much for one, and how much out of a hundred.', skills: ['g6.unit-rates', 'g6.percents'] },
      { id: 'fractions', title: 'Dividing fractions', blurb: 'Dividing by a fraction, and the word problems that need it.', skills: ['g6.divide-fractions', 'g6.fraction-word-problems'] },
      { id: 'arithmetic', title: 'Multi-digit arithmetic', blurb: 'Long division, and all four operations with decimals.', skills: ['g6.long-division', 'g6.decimals'] },
      { id: 'negatives', title: 'Negative numbers', blurb: 'Numbers below zero, absolute value, and all four quadrants.', skills: ['g6.number-line', 'g6.coordinate-plane'] },
      { id: 'properties', title: 'Properties of numbers', blurb: 'Greatest common factor, least common multiple, and the distributive property.', skills: ['g6.gcf-lcm', 'g6.distributive-factor'] },
      { id: 'expressions', title: 'Variables and expressions', blurb: 'Exponents, order of operations, and writing expressions with letters.', skills: ['g6.evaluate-expressions', 'g6.write-expressions'] },
      { id: 'equations', title: 'Equations and inequalities', blurb: 'One-step equations, and inequalities that describe many answers.', skills: ['g6.one-step-equations', 'g6.inequalities'] },
      { id: 'geometry', title: 'Geometry', blurb: 'Area of flat shapes, and volume and surface area of boxes.', skills: ['g6.area', 'g6.volume-surface-area'] },
      { id: 'stats', title: 'Data and statistics', blurb: 'The center of a data set and how spread out it is.', skills: ['g6.mean-median', 'g6.spread'] },
      { id: 'fraction-sense', title: 'Fractions as division and mixed numbers', blurb: 'Sharing things equally to make a fraction, and multiplying mixed numbers.', skills: ['g6.fraction-as-division', 'g6.multiply-mixed-numbers'] },
      { id: 'data-displays', title: 'Statistical questions and data displays', blurb: 'Questions with answers that vary, and reading histograms and stem-and-leaf plots.', skills: ['g6.statistical-questions', 'g6.histograms', 'g6.stem-and-leaf', 'g6.double-bar-graphs'] },
      { id: 'logic', title: 'Logic puzzles and Venn diagrams', blurb: 'Using clues to reason your way to an answer, and sorting things into overlapping circles.', skills: ['g6.logic-puzzles', 'g6.venn-diagrams'] },
      { id: 'everyday', title: 'Math in everyday life', blurb: 'Tips and discounts in your head, scaling a recipe, and planning to save up for something.', skills: ['g6.percent-in-head', 'g6.recipe-scaling', 'g6.money-plans'] },
    ],
  });

  /* ---------- Unit 1: Ratios ---------- */
  A.skill({
    id: 'g6.ratio-language', title: 'Ratio language',
    learn: p('A <b>ratio</b> compares two amounts. If a fruit bowl has 3 apples and 5 bananas, the ratio of apples to bananas is <b>3 : 5</b>. You say it “3 to 5”, and you can also write it as “3 for every 5”.') +
      p('<b>Order matters.</b> The ratio of bananas to apples is 5 : 3, not 3 : 5. Whatever is named first gets its number first.') +
      p('A ratio can also compare a part to the <b>whole</b>, which means everything put together. There are 3 + 5 = 8 pieces of fruit, so the ratio of apples to all the fruit is 3 : 8.') +
      example('Example: part to part', `${M.items([[2, 'circle', 'orange'], [5, 'square', 'blue']], { per: 0, size: 28 })}Count each kind: 2 circles and 5 squares. The question names squares first, so the ratio of squares to circles is <b>5 : 2</b>.`) +
      example('Example: part to whole', `${big('A shelf holds 4 mystery books and 7 science books.')}What is the ratio of science books to all the books? The whole is 4 + 7 = 11 books. The part goes first and the whole second: <b>7 : 11</b>.`),
    make(rng) {
      const kind = rng.pick(['pic', 'pic', 'words', 'whole']);
      let a = rng.int(2, 9), b = rng.int(2, 9);
      if (a === b) b = a === 9 ? 8 : a + 1;
      if (kind === 'pic') {
        a = Math.min(a, 7); b = Math.min(b, 7); if (a === b) b = a - 1;
        const [s1, c1, s2, c2] = rng.pick([['circle', 'red', 'square', 'blue'], ['star', 'orange', 'heart', 'purple'], ['triangle', 'green', 'circle', 'blue'], ['square', 'purple', 'star', 'green'], ['heart', 'red', 'triangle', 'orange']]);
        const [e1, w1, e2, w2] = [`${c1} ${s1}`, `${s1}s`, `${c2} ${s2}`, `${s2}s`];
        const flip = rng.bool();
        const [x, y, xw, yw, xe, ye] = flip ? [b, a, w2, w1, e2, e1] : [a, b, w1, w2, e1, e2];
        const answer = `${x} : ${y}`;
        return { prompt: `What is the ratio of <b>${xw}</b> to <b>${yw}</b>?${M.items([[a, s1, c1], [b, s2, c2]], { per: 0, size: 28 })}`, type: 'choice', answer, choices: options(answer, [`${y} : ${x}`, `${x} : ${a + b}`, `${y} : ${a + b}`]), params: { kind, xe, ye },
          hints: [`Count each kind: there are ${a} ${w1} and ${b} ${w2}.`, `The ${xw} are named first, so their number goes first.`, `The ratio of ${xw} to ${yw} is <b>${answer}</b>.`] };
      }
      const [w1, w2, place, all] = rng.pick([['hamsters', 'rabbits', 'a pet store', 'the animals'], ['red marbles', 'green marbles', 'a bag', 'the marbles'], ['violins', 'cellos', 'an orchestra', 'the instruments'], ['oak trees', 'pine trees', 'a park', 'the trees'], ['pencils', 'pens', 'a pencil case', 'the pens and pencils']]);
      if (kind === 'whole') {
        const answer = `${b} : ${a + b}`;
        return { prompt: `In ${place} there are ${a} ${w1} and ${b} ${w2}. What is the ratio of ${w2} to <b>all</b> ${all}?`, type: 'choice', answer, choices: options(answer, [`${a + b} : ${b}`, `${b} : ${a}`, `${a} : ${a + b}`]), params: { kind, a, b },
          hints: [`First find the whole: ${a} + ${b} = ${a + b}.`, `The part (${w2}) goes first and the whole goes second.`, `The ratio is <b>${answer}</b>.`] };
      }
      const answer = `${b} : ${a}`;
      return { prompt: `In ${place} there are ${a} ${w1} and ${b} ${w2}. What is the ratio of ${w2} to ${w1}?`, type: 'choice', answer, choices: options(answer, [`${a} : ${b}`, `${b} : ${a + b}`, `${a} : ${a + b}`]), params: { kind, a, b },
        hints: [`The question names ${w2} first, so the number of ${w2} goes first.`, `There are ${b} ${w2} and ${a} ${w1}.`, `The ratio of ${w2} to ${w1} is <b>${answer}</b>.`] };
    },
    verify(q) {
      const [x, y] = q.answer.split(':').map(s => Number(s.trim()));
      const pr = q.params;
      if (pr.kind === 'pic') { const count = e => M.countItems(q.prompt, e); return x === count(pr.xe) && y === count(pr.ye); }
      if (pr.kind === 'whole') return x === pr.b && y - x === pr.a;
      return x === pr.b && y === pr.a;
    },
  });

  A.skill({
    id: 'g6.ratio-tables', title: 'Equivalent ratios and ratio tables',
    learn: p('Two ratios are <b>equivalent</b> when they make the same comparison. You get one from the other by <b>multiplying (or dividing) both numbers by the same number</b>. 2 : 3 is equivalent to 4 : 6 and to 10 : 15.') +
      p('A <b>ratio table</b> lists equivalent ratios in rows. To fill in a missing number, find what the known number was multiplied by, then multiply the other number by the same thing.') +
      p('When you know the <b>total</b>, add the two parts of the ratio to get the size of one “group”. Then see how many groups fit in the total.') +
      example('Example: a missing number', `${big('3 : 4 = 15 : ?')}3 × 5 = 15, so multiply 4 by 5 too. The missing number is <b>20</b>.`) +
      example('Example: a ratio table', `${M.table(['Cups of juice', 'Cups of water'], [['2', '7'], ['4', '14'], ['?', '35']])}Look at the water: 7 × 5 = 35. Multiply the juice by 5 too: 2 × 5 = <b>10</b> cups of juice.`) +
      example('Example: using the total', `${big('Cats to dogs at a shelter is 2 : 3. There are 30 animals.')}How many are dogs? One group is 2 + 3 = 5 animals, and 30 ÷ 5 = 6 groups. Dogs: 3 × 6 = <b>18</b>. Check: there are 2 × 6 = 12 cats, and 12 + 18 = 30 ✓`),
    make(rng) {
      const kind = rng.pick(['table', 'equiv', 'recipe', 'total']);
      let a = rng.int(1, 6), b = rng.int(2, 9);
      if (a === b) b += 1;
      const k = rng.int(2, 9);
      if (kind === 'total') {
        const [w1, w2, all, place] = rng.pick([['red marbles', 'blue marbles', 'marbles', 'a bag'], ['boys', 'girls', 'students', 'a chess club'], ['cats', 'dogs', 'pets', 'an animal shelter'], ['fiction books', 'non-fiction books', 'books', 'a shelf']]);
        const total = (a + b) * k, askFirst = rng.bool(), ans = (askFirst ? a : b) * k;
        return { prompt: `In ${place}, the ratio of ${w1} to ${w2} is ${a} : ${b}. There are ${total} ${all} in all. How many are <b>${askFirst ? w1 : w2}</b>?`, type: 'number', answer: ans, params: { kind, a, b, total, askFirst },
          hints: [`Each group has ${a} + ${b} = ${a + b}.`, `${total} ÷ ${a + b} = ${k} groups.`, `${askFirst ? w1 : w2}: ${askFirst ? a : b} × ${k} = <b>${ans}</b>.`] };
      }
      const askSecond = kind === 'equiv' ? true : rng.bool();
      const given = (askSecond ? a : b) * k, ans = (askSecond ? b : a) * k;
      const params = { kind, a, b, given, askSecond };
      const hints = [`${askSecond ? a : b} × ${k} = ${given}, so the multiplier is ${k}.`, `Multiply the other number by ${k} too: ${askSecond ? b : a} × ${k} = <b>${ans}</b>.`];
      if (kind === 'equiv') return { prompt: `Find the missing number so the ratios are equivalent.${big(`${a} : ${b} = ${given} : ?`)}`, type: 'number', answer: ans, params, hints };
      if (kind === 'recipe') {
        const name = rng.pick(NAMES);
        const [u, v] = rng.pick([['cups of rice', 'cups of water'], ['scoops of lemonade mix', 'liters of water'], ['cups of flour', 'eggs'], ['spoons of cocoa', 'cups of milk']]);
        return { prompt: `${name}’s recipe uses ${a} ${u} for every ${b} ${v}. ${name} makes a big batch with ${given} ${askSecond ? u : v}. How many ${askSecond ? v : u} are needed?`, type: 'number', answer: ans, params, hints: [`The ratio is ${a} : ${b}. Find how many times bigger the batch is.`].concat(hints) };
      }
      const [h1, h2] = rng.pick([['Laps', 'Minutes'], ['Tickets', 'Cost ($)'], ['Cups of juice', 'Cups of soda'], ['Packs', 'Stickers']]);
      const ks = [1, rng.int(2, 3), rng.int(4, 6)];
      const rows = ks.map(m => [N(a * m), N(b * m)]).concat([askSecond ? [N(given), '?'] : ['?', N(given)]]);
      return { prompt: `The table shows equivalent ratios. What number goes in place of the <b>?</b>${M.table([h1, h2], rows)}`, type: 'number', answer: ans, params,
        hints: [`Look at the first row: ${a} and ${b}. Every row is that row multiplied by something.`].concat(hints) };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'total') { const part = pr.askFirst ? pr.a : pr.b; return close(q.answer * (pr.a + pr.b), pr.total * part); }
      return pr.askSecond ? q.answer * pr.a === pr.given * pr.b : q.answer * pr.b === pr.given * pr.a;
    },
  });

  /* ---------- Unit 2: Rates and percentages ---------- */
  A.skill({
    id: 'g6.unit-rates', title: 'Unit rates and unit price',
    learn: p('A <b>rate</b> compares two different kinds of amounts, like miles and hours. A <b>unit rate</b> tells you how much for <b>one</b>: miles per hour, words per minute, dollars per pen. “Per” means “for each”.') +
      p('<b>To find a unit rate, divide</b> the first amount by the second. 150 miles in 3 hours is 150 ÷ 3 = 50 miles per hour. Once you know the unit rate, multiply to find any other amount.') +
      p('The <b>unit price</b> is the cost of one item. To find the <b>better buy</b>, compare unit prices: the lower one is the better deal.') +
      example('Example: unit price', `${big('6 pens cost $4.50')}Unit price = $4.50 ÷ 6 = <b>$0.75</b> per pen.`) +
      example('Example: using a unit rate', `${big('Mei types 240 words in 6 minutes. How many words in 10 minutes?')}Unit rate: 240 ÷ 6 = 40 words per minute. In 10 minutes: 40 × 10 = <b>400 words</b>.`) +
      example('Example: the better buy', `${big('A 4-pack of juice boxes costs $3.00. A 10-pack costs $6.50.')}4-pack: $3.00 ÷ 4 = $0.75 each. 10-pack: $6.50 ÷ 10 = $0.65 each. $0.65 is lower, so <b>the 10-pack</b> is the better buy.`),
    make(rng) {
      const kind = rng.pick(['rate', 'price', 'better', 'use']);
      const name = rng.pick(NAMES);
      const ctx = rng.pick([{ v: 'reads', u: 'pages', t: 'hour' }, { v: 'types', u: 'words', t: 'minute' }, { v: 'cycles', u: 'miles', t: 'hour' }, { v: 'folds', u: 'paper cranes', t: 'hour' }, { v: 'skips', u: 'jumps', t: 'minute' }]);
      if (kind === 'rate' || kind === 'use') {
        const r = rng.int(6, 60), t = rng.int(2, 9), total = r * t;
        if (kind === 'rate') return { prompt: `${name} ${ctx.v} ${total} ${ctx.u} in ${t} ${ctx.t}s. How many ${ctx.u} is that per ${ctx.t}?`, type: 'number', answer: r, unit: `${ctx.u} per ${ctx.t}`, params: { kind, total, t },
          hints: [`“Per ${ctx.t}” means for one ${ctx.t}, so divide by the number of ${ctx.t}s.`, `${total} ÷ ${t} = <b>${r} ${ctx.u} per ${ctx.t}</b>.`] };
        let t2 = rng.int(2, 12); if (t2 === t) t2 += 1;
        return { prompt: `${name} ${ctx.v} ${total} ${ctx.u} in ${t} ${ctx.t}s. At the same rate, how many ${ctx.u} in ${t2} ${ctx.t}s?`, type: 'number', answer: r * t2, unit: ctx.u, params: { kind, total, t, t2 },
          hints: [`Find the unit rate first: ${total} ÷ ${t} = ${r} ${ctx.u} per ${ctx.t}.`, `Then multiply by ${t2}: ${r} × ${t2} = <b>${N(r * t2)} ${ctx.u}</b>.`] };
      }
      const item = rng.pick(['pens', 'markers', 'apples', 'notebooks', 'juice boxes', 'stickers']);
      if (kind === 'price') {
        const n = rng.pick([3, 4, 5, 6, 8, 10, 12]), cents = rng.int(5, 60) * 5, total = n * cents / 100;
        return { prompt: `A pack of ${n} ${item} costs ${M.money(total)}. What is the price of one?`, type: 'number', answer: cents / 100, unit: '$', params: { kind, n, total },
          hints: [`Divide the cost by the number of ${item}.`, `${M.money(total)} ÷ ${n} = <b>${M.money(cents / 100)}</b> each.`] };
      }
      let n1 = rng.pick([2, 3, 4, 5]), n2 = rng.pick([6, 8, 10, 12]);
      const c1 = rng.int(5, 40) * 5; let c2 = rng.int(5, 40) * 5; if (c1 === c2) c2 += 5;
      const t1 = n1 * c1 / 100, t2 = n2 * c2 / 100;
      const o1 = `The ${n1}-pack`, o2 = `The ${n2}-pack`;
      const answer = c1 < c2 ? o1 : o2;
      return { prompt: `A ${n1}-pack of ${item} costs ${M.money(t1)}. A ${n2}-pack costs ${M.money(t2)}. Which is the better buy?`, type: 'choice', answer, choices: [o1, o2, 'They cost the same each'], keepOrder: true, params: { kind, n1, n2, t1, t2 },
        hints: [`Find the unit price of each pack.`, `${M.money(t1)} ÷ ${n1} = ${M.money(c1 / 100)} each, and ${M.money(t2)} ÷ ${n2} = ${M.money(c2 / 100)} each.`, `The lower unit price is the better buy: <b>${answer.toLowerCase()}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'rate') return q.answer * pr.t === pr.total;
      if (pr.kind === 'use') return q.answer * pr.t === pr.total * pr.t2;
      if (pr.kind === 'price') return Math.round(q.answer * pr.n * 100) === Math.round(pr.total * 100);
      const firstCheaper = pr.t1 * pr.n2 < pr.t2 * pr.n1;           // cross-multiply instead of dividing
      return q.answer === (firstCheaper ? `The ${pr.n1}-pack` : `The ${pr.n2}-pack`);
    },
  });

  A.skill({
    id: 'g6.percents', title: 'Percent problems',
    learn: p('<b>Percent means “out of 100”.</b> 35% is 35 out of 100, which is the fraction ' + F(35, 100, { raw: true }) + ' or the decimal 0.35.') +
      p('<b>Percent of a number:</b> change the percent to a decimal and multiply. 35% of 80 = 0.35 × 80 = 28.') +
      p('<b>Finding the whole:</b> if 25% of a number is 12, then the whole is 12 × 100 ÷ 25 = 48. <b>Finding the percent:</b> divide the part by the whole, then multiply by 100.') +
      example('Example: percent of a number', `${big('What is 15% of 60?')}15% as a decimal is 0.15, and 0.15 × 60 = <b>9</b>.`) +
      example('Example: finding the whole', `${big('18 is 30% of what number?')}18 × 100 = 1,800 and 1,800 ÷ 30 = <b>60</b>. Check: 0.3 × 60 = 18 ✓`) +
      example('Example: finding the percent', `${big('12 is what percent of 40?')}12 ÷ 40 = 0.3, and 0.3 × 100 = <b>30%</b>.`),
    make(rng) {
      const kind = rng.pick(['of', 'of-word', 'whole', 'whole-word', 'what']);
      const pct = rng.pick([5, 10, 15, 20, 25, 30, 40, 45, 50, 60, 70, 75, 80, 90]);
      const whole = 20 * rng.int(1, 10), part = pct * whole / 100;
      const name = rng.pick(NAMES);
      const params = { kind, pct, whole, part };
      const ofHints = [`Write ${pct}% as a decimal: ${N(pct / 100)}.`, `Multiply: ${N(pct / 100)} × ${whole} = <b>${N(part)}</b>.`];
      const wholeHints = [`${pct}% of the whole is ${N(part)}. To undo “× ${N(pct / 100)}”, multiply by 100 and divide by ${pct}.`, `${N(part)} × 100 = ${N(part * 100)}, and ${N(part * 100)} ÷ ${pct} = <b>${whole}</b>.`, `Check: ${pct}% of ${whole} is ${N(part)} ✓`];
      if (kind === 'of') return { prompt: `What is ${pct}% of ${whole}?${big(`${pct}% of ${whole} = ?`)}`, type: 'number', answer: part, params, hints: ofHints };
      if (kind === 'of-word') return { prompt: rng.pick([
        `A test has ${whole} questions. ${name} got ${pct}% of them right. How many questions did ${name} get right?`,
        `A community garden has ${whole} plots. ${pct}% of them are growing tomatoes. How many plots are growing tomatoes?`,
        `The school library has ${whole} new books. ${pct}% of them are mysteries. How many new books are mysteries?`,
        `${name} planted ${whole} seeds, and ${pct}% of them sprouted. How many seeds sprouted?`,
        `A farmers market has ${whole} stalls. ${pct}% of them sell fruit. How many stalls sell fruit?`]), type: 'number', answer: part, params, hints: ofHints };
      if (kind === 'whole') return { prompt: `${N(part)} is ${pct}% of what number?`, type: 'number', answer: whole, params, hints: wholeHints };
      if (kind === 'whole-word') return { prompt: `${name} has saved ${M.money(part)}. That is ${pct}% of the price of ${rng.pick(['a bike', 'a keyboard', 'a tent', 'a telescope', 'a pair of skates', 'a sewing kit'])}. How much does it cost?`, type: 'number', answer: whole, unit: '$', params, hints: wholeHints };
      return { prompt: `${N(part)} is what percent of ${whole}?`, type: 'number', answer: pct, unit: '%', params,
        hints: [`Divide the part by the whole: ${N(part)} ÷ ${whole} = ${N(part / whole)}.`, `Multiply by 100 to make a percent: ${N(part / whole)} × 100 = <b>${pct}%</b>.`] };
    },
    verify(q) {
      const { kind, pct, whole, part } = q.params;
      if (kind.startsWith('of')) return close(q.answer * 100, pct * whole);
      if (kind.startsWith('whole')) return close(part * 100, pct * q.answer);
      return close(part * 100, q.answer * whole);
    },
  });

  /* ---------- Unit 3: Dividing fractions ---------- */
  A.skill({
    id: 'g6.divide-fractions', title: 'Dividing fractions by fractions',
    learn: p(`Dividing asks “how many of these fit into that?” ${F(3, 4)} ÷ ${F(1, 8)} asks how many eighths fit into three-fourths. The answer is 6.`) +
      p('<b>To divide by a fraction, multiply by its reciprocal.</b> The <b>reciprocal</b> is the fraction flipped upside down: the reciprocal of ' + F(2, 5) + ' is ' + F(5, 2, { raw: true }) + '. A whole number like 3 is ' + F(3, 1, { raw: true }) + ', so its reciprocal is ' + F(1, 3) + '. Change a mixed number to an <b>improper fraction</b> (one with the top bigger than the bottom) first.') +
      p('In short: <b>keep</b> the first fraction, <b>change</b> ÷ to ×, <b>flip</b> the second fraction. Then simplify.') +
      example('Example: a fraction by a fraction', `${big(`${F(2, 3)} ÷ ${F(4, 5)}`)}Keep, change, flip: ${F(2, 3)} × ${F(5, 4, { raw: true })} = ${F(10, 12, { raw: true })} = <b>${F(5, 6)}</b>.`) +
      example('Example: with a whole number', `${big(`6 ÷ ${F(3, 4)}`)}Write 6 as ${F('6', '1')}. Keep, change, flip: ${F('6', '1')} × ${F(4, 3, { raw: true })} = ${F(24, 3, { raw: true })} = <b>8</b>. A fraction divided by a whole number works the same way: ${F(3, 5)} ÷ 2 = ${F(3, 5)} × ${F(1, 2)} = <b>${F(3, 10)}</b>.`) +
      example('Example: with a mixed number', `${big(`${MX(5, 2)} ÷ ${F(3, 4)}`)}First, ${MX(5, 2)} = ${F(5, 2, { raw: true })}. Then ${F(5, 2, { raw: true })} × ${F(4, 3, { raw: true })} = ${F(20, 6, { raw: true })} = ${F(10, 3, { raw: true })} = <b>${MX(10, 3)}</b>.`),
    make(rng) {
      const kind = rng.pick(['ff', 'ff', 'wf', 'fw', 'mixed']);
      let n1, d1, n2, d2, shown;
      const proper = () => { const d = rng.int(2, 10); return [rng.int(1, d - 1), d]; };
      if (kind === 'ff') { [n1, d1] = proper(); [n2, d2] = proper(); shown = `${F(n1, d1, { raw: true })} ÷ ${F(n2, d2, { raw: true })}`; }
      else if (kind === 'wf') { n1 = rng.int(2, 9); d1 = 1; [n2, d2] = proper(); shown = `${n1} ÷ ${F(n2, d2, { raw: true })}`; }
      else if (kind === 'fw') { [n1, d1] = proper(); n2 = rng.int(2, 9); d2 = 1; shown = `${F(n1, d1, { raw: true })} ÷ ${n2}`; }
      else { const w = rng.int(1, 4); let r; [r, d1] = proper(); n1 = w * d1 + r; [n2, d2] = proper(); shown = `${MX(n1, d1)} ÷ ${F(n2, d2, { raw: true })}`; }
      const [sn, sd] = M.simp(n1 * d2, d1 * n2);
      const hints = [];
      if (kind === 'mixed') hints.push(`Change the mixed number to an improper fraction: ${MX(n1, d1)} = ${F(n1, d1, { raw: true })}.`);
      const fr1 = (a, b) => b === 1 ? F(String(a), '1') : F(a, b, { raw: true });
      if (kind === 'wf') hints.push(`Write the whole number as a fraction: ${n1} = ${fr1(n1, 1)}.`);
      hints.push(`Flip the second number and multiply: ${fr1(n1, d1)} × ${fr1(d2, n2)}.`);
      hints.push(`Multiply across: ${F(n1 * d2, d1 * n2, { raw: true })}.`);
      hints.push(`Simplify: <b>${F(sn, sd)}</b>${sd === 1 ? '' : ` (${M.fracText(sn, sd)}${sn > sd ? `, or ${MX(sn, sd)}` : ''})`}.`);
      return { prompt: `Divide. Give your answer in simplest form.${big(shown)}`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { n1, d1, n2, d2 }, hints, help: 'A fraction like 7/4, a mixed number like 1 3/4, or a whole number.' };
    },
    verify(q) { const { n1, d1, n2, d2 } = q.params; return close(q.answer * (n2 / d2), n1 / d1); },     // quotient × divisor = dividend
  });

  A.skill({
    id: 'g6.fraction-word-problems', title: 'Dividing fractions word problems',
    learn: p('A story calls for division when you <b>split an amount into equal groups</b> or ask <b>how many groups fit</b>. “How many ' + F(1, 4) + '-cup servings are in 3 cups?” is 3 ÷ ' + F(1, 4) + '.') +
      p('Rates work the same way: if you walk ' + F(1, 2) + ' mile in ' + F(1, 4) + ' hour, your speed is ' + F(1, 2) + ' ÷ ' + F(1, 4) + ' = 2 miles per hour. And a rectangle’s missing side is <b>area ÷ the side you know</b>.') +
      p('<b>Write the division first</b> (total ÷ size of one group), then keep, change, flip.') +
      example('Example: how many groups fit', `${big(`A ribbon is ${F(3, 4)} m long. Each bow needs ${F(1, 8)} m.`)}${F(3, 4)} ÷ ${F(1, 8)} = ${F(3, 4)} × 8 = ${F(24, 4, { raw: true })} = <b>6 bows</b>.`) +
      example('Example: sharing equally', `${big(`3 friends share ${F(3, 4)} pound of trail mix equally.`)}${F(3, 4)} ÷ 3 = ${F(3, 4)} × ${F(1, 3)} = ${F(3, 12, { raw: true })} = <b>${F(1, 4)} pound</b> for each friend.`) +
      example('Example: a missing side', `${big(`A rectangle has an area of ${F(2, 3)} square meter. Its width is ${F(1, 2)} meter.`)}Length = area ÷ width: ${F(2, 3)} ÷ ${F(1, 2)} = ${F(2, 3)} × ${F(2, 1, { raw: true })} = ${F(4, 3, { raw: true })}, so the length is <b>${MX(4, 3)} m</b>.`),
    make(rng) {
      const kind = rng.pick(['groups', 'groups', 'speed', 'side', 'share']);
      const name = rng.pick(NAMES);
      const fr = (n, d) => F(n, d, { raw: true });
      let tn, td, gn, gd, prompt, unit;
      if (kind === 'groups') {
        gd = rng.pick([2, 3, 4, 6, 8]); gn = rng.int(1, Math.max(1, gd - 1)); [gn, gd] = M.simp(gn, gd);
        const k = rng.int(2, 12); [tn, td] = M.simp(k * gn, gd);
        const [thing, u, each, ask] = rng.pick([['yogurt', 'cup', 'Each serving is', 'servings can NAME make'], ['ribbon', 'meter', 'Each bow needs', 'bows can NAME make'], ['juice', 'liter', 'Each glass holds', 'glasses can NAME fill'], ['rope', 'yard', 'Each piece is', 'pieces can NAME cut']]);
        prompt = `${name} has ${MX(tn, td)} ${u}${tn > td ? 's' : ''} of ${thing}. ${each} ${fr(gn, gd)} ${u}. How many ${ask.replace('NAME', name)}?`;
      } else if (kind === 'speed') {
        [tn, td] = M.simp(rng.int(1, 5), rng.pick([2, 3, 4, 5])); gd = rng.pick([2, 3, 4, 6]); gn = 1;
        const [go, goes] = rng.pick([['walk', 'walks'], ['bike', 'bikes'], ['jog', 'jogs'], ['paddle', 'paddles'], ['skate', 'skates']]);
        prompt = `${name} ${goes} ${MX(tn, td)} mile${tn > td ? 's' : ''} in ${fr(gn, gd)} of an hour. At that speed, how many miles does ${name} ${go} in one hour?`; unit = 'miles';
      } else if (kind === 'side') {
        const d1 = rng.pick([2, 3, 4, 5, 6, 8]), d2 = rng.pick([2, 3, 4, 5]);
        [tn, td] = M.simp(rng.int(1, d1 - 1), d1); [gn, gd] = M.simp(rng.int(1, d2 - 1), d2);
        prompt = `A rectangle has an area of ${fr(tn, td)} square meter. Its width is ${fr(gn, gd)} meter. How long is it?`; unit = 'm';
      } else {
        const d = rng.pick([2, 3, 4, 5, 8]); [tn, td] = M.simp(rng.int(1, d - 1), d); gn = rng.int(2, 6); gd = 1;
        const [stuff, among] = rng.pick([['trail mix', 'friends'], ['clay', 'classmates'], ['birdseed', 'feeders'], ['dried apples', 'campers'], ['modeling sand', 'tables']]);
        prompt = `${name} shares ${fr(tn, td)} pound of ${stuff} equally among ${gn} ${among}. How many pounds does each get?`; unit = 'lb';
      }
      const [sn, sd] = M.simp(tn * gd, td * gn);
      const div = `${MX(tn, td)} ÷ ${gd === 1 ? gn : fr(gn, gd)}`;
      return { prompt: kind === 'groups' ? prompt : prompt + ' Give your answer in simplest form.', type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), unit, params: { tn, td, gn, gd },
        hints: [`Write the division: ${div}.`, `${tn > td && td > 1 ? `As an improper fraction, ${MX(tn, td)} = ${fr(tn, td)}. ` : ''}Keep, change, flip: ${td === 1 ? tn : fr(tn, td)} × ${fr(gd, gn)} = ${fr(tn * gd, td * gn)}.`, `Simplify: <b>${MX(sn, sd)}</b>${sd === 1 ? '' : ` (${M.fracText(sn, sd)})`}.`] };
    },
    verify(q) { const { tn, td, gn, gd } = q.params; return close(q.answer * gn / gd, tn / td); },
  });

  /* ---------- Unit 4: Multi-digit arithmetic ---------- */
  function ldSteps(D, d) {
    const digits = String(D).split('').map(Number), out = [];
    let cur = 0, started = false;
    for (const dg of digits) {
      cur = cur * 10 + dg;
      if (!started && cur < d) continue;
      started = true;
      const qd = Math.floor(cur / d);
      out.push(`${N(cur)} ÷ ${d} = ${qd} remainder ${cur - qd * d}`);
      cur -= qd * d;
    }
    return out;
  }
  A.skill({
    id: 'g6.long-division', title: 'Multi-digit division',
    learn: p('<b>Long division</b> breaks a big division into small steps, working from the left. At each step: <b>divide, multiply, subtract, bring down</b> the next digit, and repeat.') +
      p('Estimate first so you know about how big the answer should be. 1,512 ÷ 36 is close to 1,600 ÷ 40 = 40, so the answer should be around 40.') +
      p('If something is left at the end, that is the <b>remainder</b>. In a story, think about what it means: if 10 children are left without a seat on the bus, you need <b>one more bus</b>. You can also keep dividing past the decimal point: write zeros after it and bring them down.') +
      example('Example: no remainder', `${big('1,512 ÷ 36')}151 ÷ 36 = 4 remainder 7. Bring down the 2 to make 72. 72 ÷ 36 = 2 remainder 0. The answer is <b>42</b>.`) +
      example('Example: a remainder in a story', `${big('250 students ride in vans that hold 12 each.')}How many vans are needed? 25 ÷ 12 = 2 remainder 1. Bring down the 0 to make 10, and 10 ÷ 12 = 0 remainder 10. So 250 ÷ 12 = 20 remainder 10. The 10 students left over need a van too: <b>21 vans</b>.`) +
      example('Example: past the decimal point', `${big('54 ÷ 8')}54 ÷ 8 = 6 remainder 6. Write 54 as 54.00 and keep going: 60 ÷ 8 = 7 remainder 4, then 40 ÷ 8 = 5 remainder 0. So 54 ÷ 8 = <b>6.75</b>.`),
    make(rng) {
      const kind = rng.pick(['exact', 'exact', 'rem', 'bus', 'decimal']);
      if (kind === 'decimal') {
        const d = rng.pick([4, 5, 8, 20, 25]), D = d * rng.int(8, 120) + rng.int(1, d - 1);
        const ans = D / d;
        return { prompt: `Divide. Keep going past the decimal point until there is no remainder.${big(`${N(D)} ÷ ${d}`)}`, type: 'number', answer: ans, params: { kind, D, d },
          hints: [`${N(D)} ÷ ${d} = ${Math.floor(ans)} remainder ${D % d}.`, `Write a decimal point and zeros after ${N(D)} (${N(D)}.00) and keep dividing the remainder.`, `${N(D)} ÷ ${d} = <b>${N(ans)}</b>.`] };
      }
      const d = rng.int(12, 48), qt = kind === 'bus' ? rng.int(4, 30) : rng.int(21, 299);
      const r = kind === 'exact' ? 0 : rng.int(1, d - 1);
      const D = d * qt + r;
      const steps = ldSteps(D, d);
      if (kind === 'exact') return { prompt: `Divide.${big(`${N(D)} ÷ ${d}`)}`, type: 'number', answer: qt, params: { kind, D, d, r },
        hints: [`Estimate: ${N(D)} ÷ ${d} is about ${N(Math.round(D / d / 10) * 10)}.`, `Work from the left: ${steps.join('; ')}.`, `${N(D)} ÷ ${d} = <b>${qt}</b>.`] };
      if (kind === 'rem') return { prompt: `What is the <b>remainder</b> when you divide?${big(`${N(D)} ÷ ${d}`)}`, type: 'number', answer: r, params: { kind, D, d, qt },
        hints: [`Work from the left: ${steps.join('; ')}.`, `${d} × ${qt} = ${N(d * qt)}, and ${N(D)} − ${N(d * qt)} = ${r}.`, `The remainder is <b>${r}</b>.`] };
      const [story, box, boxes, who, whoOne] = rng.pick([
        [`${N(D)} people are going to a fair. Each bus holds ${d} people. How many buses are needed to take everyone?`, 'bus', 'buses', 'people', 'person'],
        [`${N(D)} students are going to the science museum. Each van holds ${d} students. How many vans are needed?`, 'van', 'vans', 'students', 'student'],
        [`${N(D)} guests are coming to a dinner at the community center. Each table seats ${d}. How many tables are needed so everyone has a seat?`, 'table', 'tables', 'guests', 'guest'],
        [`The library is packing ${N(D)} books into boxes that hold ${d} books each. How many boxes are needed for all the books?`, 'box', 'boxes', 'books', 'book'],
        [`A bakery has ${N(D)} muffins to pack into trays of ${d}. How many trays are needed for all the muffins?`, 'tray', 'trays', 'muffins', 'muffin']]);
      return { prompt: story, type: 'number', answer: qt + 1, unit: boxes, params: { kind, D, d },
        hints: [`Divide: ${steps.join('; ')}.`, `So ${N(D)} ÷ ${d} = ${qt} remainder ${r}: ${qt} ${boxes} are full and ${r} ${r === 1 ? whoOne + ' is' : who + ' are'} left over.`, `The leftover ${r === 1 ? whoOne : who} need${r === 1 ? 's' : ''} a ${box} too: <b>${qt + 1} ${boxes}</b>.`] };
    },
    verify(q) {
      const { kind, D, d } = q.params;
      if (kind === 'decimal') return close(q.answer * d, D);
      if (kind === 'exact') return q.answer * d === D;
      if (kind === 'rem') return q.answer < d && (D - q.answer) % d === 0;
      return q.answer * d >= D && (q.answer - 1) * d < D;             // the fewest buses that hold everyone
    },
  });

  A.skill({
    id: 'g6.decimals', title: 'Adding, subtracting, multiplying, and dividing decimals',
    learn: p('<b>Adding and subtracting:</b> line up the decimal points, fill empty places with zeros, and work as with whole numbers. 12.4 − 3.75 is 12.40 − 3.75 = 8.65.') +
      p('<b>Multiplying:</b> multiply as if there were no decimal points. Then <b>count the decimal places</b> (the digits after the point) in both numbers, and give the answer that many. 2.4 × 0.3: 24 × 3 = 72, and there are two places in all, so the answer is 0.72.') +
      p('<b>Dividing:</b> the <b>divisor</b> is the number you divide by. Move its decimal point to make it a whole number, and move the point in the other number the same number of places. 6.3 ÷ 0.7 becomes 63 ÷ 7 = 9.') +
      example('Example: adding', `${big('7.85 + 12.6')}Line up the points and fill in a zero: 7.85 + 12.60 = <b>20.45</b>.`) +
      example('Example: multiplying', `${big('0.6 × 3.5')}6 × 35 = 210. There is one decimal place in 0.6 and one in 3.5, so two in all: 2.10 = <b>2.1</b>.`) +
      example('Example: dividing', `${big('4.5 ÷ 0.15')}Move both points two places to the right: 450 ÷ 15 = <b>30</b>.`),
    make(rng) {
      const op = rng.pick(['+', '−', '×', '÷']);
      const mk = places => { const pl = rng.pick(places); return { pl, v: rng.int(Math.pow(10, pl), 99 * Math.pow(10, pl)) / Math.pow(10, pl) }; };
      let a, b, ans, hints;
      if (op === '+' || op === '−') {
        const x = mk([1, 2, 3]), y = mk([1, 2, 3].filter(k => k !== x.pl));
        a = x.v; b = y.v; if (op === '−' && a < b) [a, b] = [b, a];
        ans = M.round(op === '+' ? a + b : a - b, 4);
        const pl = Math.max(x.pl, y.pl);
        hints = [`Line up the decimal points and fill in zeros: ${a.toFixed(pl)} ${op} ${b.toFixed(pl)}.`, `${op === '+' ? 'Add' : 'Subtract'} place by place, starting from the right.`, `${N(a)} ${op} ${N(b)} = <b>${N(ans)}</b>.`];
      } else if (op === '×') {
        const pa = rng.pick([1, 2]), pb = rng.pick([0, 1]);
        let ia = rng.int(2, 99); if (ia % 10 === 0) ia += 1;
        const ib = rng.int(2, 9);
        a = ia / Math.pow(10, pa); b = ib / Math.pow(10, pb);
        ans = M.round(a * b, 6);
        const places = pa + pb;
        hints = [`Ignore the decimal points: ${ia} × ${ib} = ${ia * ib}.`, `Count decimal places: ${N(a)} has ${pa} and ${N(b)} has ${pb}, so the answer has ${places}.`, `${N(a)} × ${N(b)} = <b>${N(ans)}</b>.`];
      } else {
        const pd = rng.pick([1, 1, 2]), id = rng.pick([2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 25]);
        b = id / Math.pow(10, pd);
        const qv = rng.chance(0.6) ? rng.int(2, 40) : rng.int(11, 99) / 10;
        a = M.round(qv * b, 6); ans = qv;
        const sh = Math.pow(10, pd);
        hints = [`Make the divisor a whole number: move both decimal points ${pd} place${pd > 1 ? 's' : ''} right.`, `${N(a)} ÷ ${N(b)} becomes ${N(M.round(a * sh, 6))} ÷ ${N(id)}.`, `${N(M.round(a * sh, 6))} ÷ ${N(id)} = <b>${N(ans)}</b>.`];
      }
      return { prompt: `${{ '+': 'Add', '−': 'Subtract', '×': 'Multiply', '÷': 'Divide' }[op]}.${big(`${N(a)} ${op} ${N(b)}`)}`, type: 'number', answer: ans, params: { op, a, b }, hints };
    },
    verify(q) {
      const { op, a, b } = q.params, S = 1e6, ia = Math.round(a * S), ib = Math.round(b * S), ians = Math.round(q.answer * S);
      if (op === '+') return ians === ia + ib;
      if (op === '−') return ians === ia - ib;
      if (op === '×') return Math.round(q.answer * S * S) === ia * ib;
      return Math.abs(q.answer * ib - ia) < 1e-3;                     // quotient × divisor = dividend, in millionths
    },
  });


  /* ---------- Unit 5: Negative numbers ---------- */
  function lineSvg(x) {
    const X0 = 210, step = 19;
    let g = `<line class="stroke" x1="12" y1="40" x2="408" y2="40"/>`;
    for (let i = -10; i <= 10; i++) {
      const tx = X0 + step * i, long = i % 5 === 0;
      g += `<line class="stroke" x1="${tx}" y1="${long ? 32 : 35}" x2="${tx}" y2="${long ? 48 : 45}" style="stroke-width:${long ? 2 : 1}"/>`;
      if (long) g += `<text x="${tx}" y="66" text-anchor="middle" font-size="13">${N(i)}</text>`;
    }
    g += `<circle cx="${X0 + step * x}" cy="40" r="6" fill="var(--primary)"/><text x="${X0 + step * x}" y="22" text-anchor="middle" font-size="14" font-weight="700">A</text>`;
    return `<svg class="figure" viewBox="0 0 420 76" width="420" role="img" aria-label="number line from −10 to 10 with point A">${g}</svg>`;
  }
  A.skill({
    id: 'g6.number-line', title: 'Negative numbers and absolute value',
    learn: p('Numbers less than zero are <b>negative</b>. On a number line they sit to the <b>left</b> of zero. Every number has an <b>opposite</b>: the number the same distance from zero on the other side. The opposite of 4 is −4, and the opposite of −4 is 4.') +
      p('<b>Farther left is smaller.</b> −8 is less than −3, because −8 is farther left. Think of temperature: −8° is colder than −3°.') +
      p('The <b>absolute value</b> of a number is its distance from zero, so it is never negative. It is written with two straight bars: |−6| = 6 and |6| = 6.') +
      example('Example: putting numbers in order', `${big('Order from least to greatest: 2, −5, 0, −1')}The farthest left is −5, then −1, then 0, then 2: <b>−5, −1, 0, 2</b>.`) +
      example('Example: comparing', `${big('−7 &nbsp;?&nbsp; −2')}−7 is farther left than −2, so <b>−7 &lt; −2</b>. A temperature of −7° is colder than −2°.`) +
      example('Example: absolute value', `${big('|−9| + |4|')}−9 is 9 steps from zero and 4 is 4 steps from zero, so this is 9 + 4 = <b>13</b>. In the same way, a diver at −30 feet is <b>30 feet</b> from the surface.`),
    make(rng) {
      const kind = rng.pick(['point', 'compare', 'order', 'abs', 'abs-word', 'opposite', 'coldest']);
      if (kind === 'point') {
        const x = rng.pick([-9, -8, -7, -6, -4, -3, -2, -1, 1, 2, 3, 4, 6, 7, 8, 9].concat([-9, -8, -7, -6, -4, -3, -2]));
        return { prompt: `What number is at point A?${lineSvg(x)}`, type: 'number', answer: x, params: { kind },
          hints: [`Start at 0 and count the small ticks to A. Each tick is 1.`, `A is ${Math.abs(x)} ${Math.abs(x) === 1 ? 'tick' : 'ticks'} to the ${x < 0 ? 'left' : 'right'} of 0${x < 0 ? ', so it is negative' : ''}.`, `Point A is at <b>${N(x)}</b>.`] };
      }
      if (kind === 'compare') {
        const a = rng.int(-15, 10); let b = rng.int(-15, 10); if (b === a) b -= 4;
        if (a > 0 && b > 0) b = -b;
        const opts = ['&lt;', '&gt;', '='].map(o => `${N(a)} ${o} ${N(b)}`);
        const answer = opts[a < b ? 0 : 1];
        return { prompt: `Which is true?${big(`${N(a)} &nbsp;?&nbsp; ${N(b)}`)}`, type: 'choice', answer, choices: opts, keepOrder: true, params: { kind, a, b },
          hints: [`Picture both numbers on a number line. The one farther left is smaller.`, `${N(Math.min(a, b))} is farther left than ${N(Math.max(a, b))}.`, `So <b>${answer}</b>.`] };
      }
      if (kind === 'order') {
        const k = rng.int(2, 3);
        const uniq = rng.sample([-12, -9, -8, -7, -5, -4, -3, -2, -1], k).concat(rng.sample([0, 1, 2, 3, 4, 6, 8, 11], 4 - k));
        const asc = uniq.slice().sort((x, y) => x - y);
        const byAbs = uniq.slice().sort((x, y) => Math.abs(x) - Math.abs(y) || x - y);
        const negFlip = asc.filter(v => v < 0).reverse().concat(asc.filter(v => v >= 0));
        const show = l => l.map(N).join(', ');
        const answer = show(asc);
        return { prompt: `Put these numbers in order from <b>least to greatest</b>.${big(show(rng.shuffle(uniq)))}`, type: 'choice', answer, choices: options(answer, [show(negFlip), show(byAbs), show(asc.slice().reverse()), show([asc[1], asc[0], asc[2], asc[3]])]), params: { kind },
          hints: [`The negative numbers come first. Among them, the one with the biggest size is the smallest.`, `The negatives in order: ${show(asc.filter(v => v < 0))}. Then the rest: ${show(asc.filter(v => v >= 0))}.`, `<b>${answer}</b>.`] };
      }
      if (kind === 'coldest') {
        const t = rng.sample([-14, -11, -9, -7, -6, -4, -3, -2, -1, 1, 3, 5], 3);
        if (t.every(v => v > 0)) t[0] = -t[0];
        const answer = `${N(Math.min(...t))}°C`;
        return { prompt: `Which temperature is the <b>coldest</b>?`, type: 'choice', answer, choices: t.map(v => `${N(v)}°C`), params: { kind, t },
          hints: [`Colder means lower: on a thermometer, farther down. On a number line, farther left.`, `The smallest of ${M.list(t.map(N))} is ${N(Math.min(...t))}.`, `The coldest is <b>${answer}</b>.`] };
      }
      if (kind === 'opposite') {
        const a = rng.nz(-30, 30), dbl = rng.bool();
        return { prompt: dbl ? `Simplify.${big(`−(${N(a)})`)}` : `What is the opposite of ${N(a)}?`, type: 'number', answer: -a, params: { kind, a },
          hints: [dbl ? `A minus sign in front means “the opposite of”.` : `The opposite is the same distance from zero, on the other side.`, `The opposite of ${N(a)} is <b>${N(-a)}</b>.`] };
      }
      if (kind === 'abs-word') {
        const d = rng.int(15, 400), name = rng.pick(NAMES);
        const [what, where] = rng.pick([[`A submarine is at an elevation of ${N(-d)} m.`, 'sea level'], [`${name}’s bank balance is ${M.money(-d)}.`, '$0'], [`A diver is ${N(-d)} feet from the surface (written as an elevation).`, 'the surface']]);
        return { prompt: `${what} How far is that from ${where}?`, type: 'number', answer: d, params: { kind, a: -d },
          hints: [`Distance from zero is the absolute value.`, `|${N(-d)}| = <b>${N(d)}</b>.`] };
      }
      const a = rng.nz(-40, 40), b = rng.bool() ? rng.nz(-20, 20) : 0;
      const ans = b ? Math.abs(a) + Math.abs(b) : Math.abs(a);
      return { prompt: `Evaluate.${big(b ? `${M.abs(N(a))} + ${M.abs(N(b))}` : M.abs(N(a)))}`, type: 'number', answer: ans, params: { kind, a, b },
        hints: [`Absolute value is distance from zero, so it is never negative: ${M.abs(N(a))} = ${N(Math.abs(a))}${b ? ` and ${M.abs(N(b))} = ${N(Math.abs(b))}` : ''}.`, b ? `${N(Math.abs(a))} + ${N(Math.abs(b))} = <b>${N(ans)}</b>.` : `The value is <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const pr = q.params, num = s => Number(String(s).replace(/−/g, '-').replace(/[^\d.-]/g, ''));
      if (pr.kind === 'point') { const cx = Number(q.prompt.match(/<circle cx="([\d.]+)"/)[1]); return q.answer === (cx - 210) / 19; }
      if (pr.kind === 'compare') return q.answer.includes(pr.a < pr.b ? '&lt;' : '&gt;');
      if (pr.kind === 'order') { const l = q.answer.split(',').map(num); return l.every((v, i) => i === 0 || l[i - 1] < v); }
      if (pr.kind === 'coldest') return pr.t.every(v => v >= num(q.answer));
      if (pr.kind === 'opposite') return q.answer + pr.a === 0;
      if (pr.kind === 'abs-word') return q.answer === -pr.a && q.answer > 0;
      return q.answer === (pr.a < 0 ? -pr.a : pr.a) + (pr.b < 0 ? -pr.b : pr.b);
    },
  });

  function gridSvg(points, opts) {
    const C = 100, u = 14, sx = x => C + u * x, sy = y => C - u * y;
    let g = '';
    for (let i = -6; i <= 6; i++) {
      if (i !== 0) g += `<line x1="${sx(i)}" y1="${sy(6.5)}" x2="${sx(i)}" y2="${sy(-6.5)}" stroke="var(--line)" stroke-width="0.6"/><line x1="${sx(-6.5)}" y1="${sy(i)}" x2="${sx(6.5)}" y2="${sy(i)}" stroke="var(--line)" stroke-width="0.6"/>`;
      if (i !== 0 && i % 2 === 0) g += `<text x="${sx(i)}" y="${C + 12}" font-size="8" text-anchor="middle" fill="var(--muted)">${N(i)}</text><text x="${C - 4}" y="${sy(i) + 3}" font-size="8" text-anchor="end" fill="var(--muted)">${N(i)}</text>`;
    }
    g += `<line x1="${sx(-6.8)}" y1="${C}" x2="${sx(6.8)}" y2="${C}" stroke="var(--muted)" stroke-width="1.2"/><line x1="${C}" y1="${sy(6.8)}" x2="${C}" y2="${sy(-6.8)}" stroke="var(--muted)" stroke-width="1.2"/>`;
    g += `<text x="192" y="${C - 4}" font-size="9" font-style="italic" fill="var(--muted)">x</text><text x="${C + 4}" y="10" font-size="9" font-style="italic" fill="var(--muted)">y</text>`;
    if (opts && opts.quads) [['I', 3.5, 2.5], ['II', -3.5, 2.5], ['III', -3.5, -2.5], ['IV', 3.5, -2.5]].forEach(([t, x, y]) => { g += `<text x="${sx(x)}" y="${sy(y) + 5}" font-size="14" font-weight="700" text-anchor="middle" fill="var(--muted)">${t}</text>`; });
    if (opts && opts.seg) { const [[x1, y1], [x2, y2]] = opts.seg; g += `<line class="line" x1="${sx(x1)}" y1="${sy(y1)}" x2="${sx(x2)}" y2="${sy(y2)}"/>`; }
    points.forEach(([x, y, label]) => { g += `<circle cx="${sx(x)}" cy="${sy(y)}" r="3.4" fill="currentColor"/><text x="${sx(x) + 5}" y="${sy(y) - 5}" font-size="11" font-weight="700" fill="currentColor">${label}</text>`; });
    return `<svg class="figure" viewBox="0 0 200 200" width="240" height="240" role="img" aria-label="${(opts && opts.label) || 'coordinate grid'}">${g}</svg>`;
  }
  const QUADS = ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'];
  A.skill({
    id: 'g6.coordinate-plane', title: 'Coordinate plane in four quadrants',
    learn: p(`The <b>coordinate plane</b> is made of two number lines that cross at zero. The <b>${V('x')}-axis</b> goes across and the <b>${V('y')}-axis</b> goes up and down. They cross at the <b>origin</b>, the point (0, 0).`) +
      p(`A point is written (${V('x')}, ${V('y')}). Start at the origin, go <b>left or right</b> by ${V('x')}, then <b>up or down</b> by ${V('y')}. Negative ${V('x')} means left; negative ${V('y')} means down.`) +
      p('The axes split the plane into four <b>quadrants</b>, numbered counterclockwise from the top right: <b>I (+, +), II (−, +), III (−, −), IV (+, −)</b>.' +
        gridSvg([[-3, 4, 'A'], [5, 4, 'B']], { quads: true, seg: [[-3, 4], [5, 4]], label: 'a coordinate plane from −6 to 6 with the quadrants labeled I (top right), II (top left), III (bottom left) and IV (bottom right); point A is at (−3, 4) and point B is at (5, 4), joined by a line' })) +
      p(`<b>Reflecting</b> a point makes its mirror image. Across the ${V('x')}-axis, the sign of ${V('y')} changes; across the ${V('y')}-axis, the sign of ${V('x')} changes. Two points with the <b>same ${V('x')}</b> (or the same ${V('y')}) are on one straight line. To find the distance between them, subtract the other coordinates, or add their distances from 0 when one is negative.`) +
      example('Example: a distance', `${big('A (−3, 4) and B (5, 4)')}They have the same ${V('y')}, so they are on a line going across, like A and B in the picture. From −3 to 0 is 3, and from 0 to 5 is 5, so the distance is 3 + 5 = <b>8</b>.`) +
      example('Example: quadrants and reflections', `${big('(4, −2)')}Go 4 right and 2 down: the point is in <b>Quadrant IV</b> (+, −). Reflected across the ${V('x')}-axis it lands at <b>(4, 2)</b>, and across the ${V('y')}-axis at <b>(−4, −2)</b>.`),
    make(rng) {
      const kind = rng.pick(['read', 'quadrant', 'reflect', 'distance', 'distance']);
      let x = rng.nz(-6, 6), y = rng.nz(-6, 6);
      if (Math.abs(x) === Math.abs(y)) y = y > 0 ? (y === 6 ? 5 : y + 1) : (y === -6 ? -5 : y - 1);
      if (kind === 'read') {
        const answer = M.pt(x, y);
        return { prompt: `What are the coordinates of point P?${gridSvg([[x, y, 'P']])}`, type: 'choice', answer, choices: options(answer, [M.pt(y, x), M.pt(-x, y), M.pt(x, -y)]), params: { kind },
          hints: [`Start at the origin (0, 0). First count left or right, then up or down.`, `P is ${Math.abs(x)} to the ${x < 0 ? 'left' : 'right'}, so ${V('x')} = ${N(x)}, and ${Math.abs(y)} ${y < 0 ? 'down' : 'up'}, so ${V('y')} = ${N(y)}.`, `P is at <b>${answer}</b>.`] };
      }
      if (kind === 'quadrant') {
        x = rng.nz(-15, 15); y = rng.nz(-15, 15);
        const answer = QUADS[x > 0 ? (y > 0 ? 0 : 3) : (y > 0 ? 1 : 2)];
        return { prompt: `In which quadrant is the point ${M.pt(x, y)}?`, type: 'choice', answer, choices: QUADS.slice(), keepOrder: true, params: { kind, x, y },
          hints: [`Look at the signs: ${V('x')} is ${x > 0 ? 'positive' : 'negative'} and ${V('y')} is ${y > 0 ? 'positive' : 'negative'}.`, `Quadrants go I (+, +), II (−, +), III (−, −), IV (+, −).`, `(${x > 0 ? '+' : '−'}, ${y > 0 ? '+' : '−'}) is <b>${answer}</b>.`] };
      }
      if (kind === 'reflect') {
        const axis = rng.pick(['x', 'y']);
        const answer = axis === 'x' ? M.pt(x, -y) : M.pt(-x, y);
        return { prompt: `Point ${M.pt(x, y)} is reflected across the ${V(axis)}-axis. Where does it land?`, type: 'choice', answer, choices: options(answer, [axis === 'x' ? M.pt(-x, y) : M.pt(x, -y), M.pt(-x, -y), M.pt(y, x)]), params: { kind, x, y, axis },
          hints: [`A reflection is a mirror image. The ${V(axis)}-axis is the mirror.`, `Reflecting across the ${V(axis)}-axis flips the sign of ${axis === 'x' ? V('y') : V('x')} and keeps ${axis === 'x' ? V('x') : V('y')}.`, `The image is <b>${answer}</b>.`] };
      }
      const same = rng.pick(['x', 'y']), k = rng.nz(-9, 9);
      const a = rng.int(-9, 8); let b = rng.int(-9, 9); if (b === a) b = a + rng.int(1, 9);
      const [P, Q] = same === 'x' ? [[k, a], [k, b]] : [[a, k], [b, k]];
      const d = Math.abs(a - b);
      const across = (a < 0) !== (b < 0) && a !== 0 && b !== 0;
      return { prompt: `What is the distance between ${M.pt(...P)} and ${M.pt(...Q)}?`, type: 'number', answer: d, unit: 'units', params: { kind, P, Q },
        hints: [`Both points have the same ${V(same)}, so they lie on a ${same === 'x' ? 'vertical' : 'horizontal'} line. Only the ${V(same === 'x' ? 'y' : 'x')}-coordinates matter: ${N(a)} and ${N(b)}.`,
          across ? `They are on opposite sides of the axis, so add their distances from 0: ${N(Math.abs(a))} + ${N(Math.abs(b))}.` : `Subtract: ${N(Math.max(a, b))} − ${wrap(Math.min(a, b))}.`, `The distance is <b>${d} units</b>.`] };
    },
    verify(q) {
      const pr = q.params, ans = A.stripTags(q.answer);
      if (pr.kind === 'read') { const m = q.prompt.match(/<circle cx="([\d.]+)" cy="([\d.]+)"/); return ans === M.pt((Number(m[1]) - 100) / 14, (100 - Number(m[2])) / 14); }
      if (pr.kind === 'quadrant') { const ang = Math.atan2(pr.y, pr.x) * 180 / Math.PI, quad = ang > 0 ? (ang < 90 ? 1 : 2) : (ang < -90 ? 3 : 4); return q.answer === QUADS[quad - 1]; }
      if (pr.kind === 'reflect') return ans === (pr.axis === 'x' ? M.pt(pr.x, -pr.y) : M.pt(-pr.x, pr.y)) && ans !== M.pt(pr.x, pr.y);
      let steps = 0, [x, y] = pr.P; const [tx, ty] = pr.Q;                     // walk from P to Q one unit at a time
      while (x !== tx || y !== ty) { x += Math.sign(tx - x); y += Math.sign(ty - y); steps++; }
      return q.answer === steps;
    },
  });

  /* ---------- Unit 6: Properties of numbers ---------- */
  const factorsOf = n => { const f = []; for (let k = 1; k <= n; k++) if (n % k === 0) f.push(k); return f; };
  A.skill({
    id: 'g6.gcf-lcm', title: 'Greatest common factor and least common multiple',
    learn: p('A <b>factor</b> of a number divides into it with nothing left over: 6 is a factor of 18. A <b>multiple</b> of a number is what you get when you multiply it by 1, 2, 3 and so on: 24 is a multiple of 8.') +
      p('The <b>greatest common factor (GCF)</b> of two numbers is the biggest number that is a factor of both. List the factors of each and pick the largest one they share. Factors of 18: 1, 2, 3, 6, 9, 18. Factors of 24: 1, 2, 3, 4, 6, 8, 12, 24. The GCF is 6.') +
      p('The <b>least common multiple (LCM)</b> is the smallest number that is a multiple of both. List multiples of the larger number until you reach one the smaller number also divides. Multiples of 8: 8, 16, 24. Since 6 divides 24, the LCM of 6 and 8 is 24.') +
      p('In stories, <b>splitting things into identical groups</b> uses the GCF; <b>things lining up again</b> or <b>buying equal amounts</b> uses the LCM.') +
      example('Example: GCF', `${big('GCF of 36 and 54')}Factors of 36: 1, 2, 3, 4, 6, 9, 12, 18, 36. Of those, 18 also divides 54, and nothing bigger does. GCF = <b>18</b>.`) +
      example('Example: LCM in a story', `${big('Cups come in packs of 6. Plates come in packs of 10.')}What is the smallest number of cups you can buy to have the same number of each? Multiples of 10: 10, 20, 30. 6 divides 30, so the LCM is <b>30</b>: 5 packs of cups and 3 packs of plates.`),
    make(rng) {
      const kind = rng.pick(['gcf', 'gcf', 'lcm', 'lcm', 'gcf-word', 'lcm-word']);
      const name = rng.pick(NAMES);
      if (kind.startsWith('gcf')) {
        const g = rng.int(2, 12); let m = rng.int(2, 9), n = rng.int(2, 9);
        while (n === m || M.gcd(m, n) !== 1) n = n === 9 ? 2 : n + 1;
        const a = g * Math.min(m, n), b = g * Math.max(m, n);
        const [x1, x2, grp] = rng.pick([['pencils', 'erasers', 'gift bags'], ['apples', 'granola bars', 'snack bags'], ['roses', 'daisies', 'bouquets'], ['red beads', 'blue beads', 'bracelet kits'], ['crayons', 'markers', 'art boxes']]);
        const prompt = kind === 'gcf' ? `Find the greatest common factor of ${a} and ${b}.` : `${name} has ${a} ${x1} and ${b} ${x2} to put into identical ${grp}, with nothing left over. What is the greatest number of ${grp} ${name} can make?`;
        return { prompt, type: 'number', answer: g, unit: kind === 'gcf' ? undefined : grp.split(' ').pop(), params: { kind, a, b },
          hints: [`List the factors of ${a}: ${factorsOf(a).join(', ')}.`, `Find the biggest one that also divides ${b}. ${b} ÷ ${g} = ${b / g}.`, `The GCF is <b>${g}</b>.`] };
      }
      let a = rng.int(2, 15), b = rng.int(3, 15); if (a === b) b = a + 1;
      if (a > b) [a, b] = [b, a];
      const l = a * b / M.gcd(a, b), mults = []; for (let k = b; k <= l; k += b) mults.push(k);
      const prompt = kind === 'lcm' ? `Find the least common multiple of ${a} and ${b}.` : rng.pick([
        `Veggie dogs come in packs of ${b} and buns come in packs of ${a}. ${name} wants exactly the same number of each. What is the smallest number of veggie dogs ${name} can buy?`,
        `Paper cups come in packs of ${b} and plates come in packs of ${a}. ${name} wants exactly the same number of cups and plates for a party. What is the smallest number of cups ${name} can buy?`,
        `At the park, one fountain sprays every ${a} minutes and another every ${b} minutes. They both spray right now. In how many minutes will they next spray at the same time?`,
        `${name} waters the ferns every ${a} days and the cactus every ${b} days. Both were watered today. In how many days will both be watered on the same day again?`]);
      return { prompt, type: 'number', answer: l, params: { kind, a, b },
        hints: [`List multiples of ${b}: ${mults.slice(0, 8).join(', ')}${mults.length > 8 ? ', …' : ''}.`, `The first one that ${a} also divides is ${l} (${l} ÷ ${a} = ${l / a}).`, `The LCM is <b>${l}</b>.`] };
    },
    verify(q) {
      const { kind, a, b } = q.params;
      if (kind.startsWith('gcf')) { let best = 0; for (let k = 1; k <= a; k++) if (a % k === 0 && b % k === 0) best = k; return q.answer === best; }
      let k = 1; while (k % a || k % b) k++; return q.answer === k;
    },
  });

  A.skill({
    id: 'g6.distributive-factor', title: 'The distributive property',
    learn: p(`The <b>distributive property</b> says ${V('a')}(${V('b')} + ${V('c')}) = ${V('a')}${V('b')} + ${V('a')}${V('c')}: multiplying a sum is the same as multiplying each part and adding. It makes mental math easier: 7 × 46 = 7 × 40 + 7 × 6 = 280 + 42 = 322.`) +
      p('It also works backward. To write a sum like 36 + 48 as a product, <b>take out the greatest common factor</b> (GCF, the biggest number that divides both): 36 = 12 × 3 and 48 = 12 × 4, so 36 + 48 = 12(3 + 4).') +
      p('Check your answer by multiplying back out: 12 × 3 + 12 × 4 = 36 + 48 ✓') +
      example('Example: a sum as a product', `${big('24 + 60')}The GCF of 24 and 60 is 12. 24 ÷ 12 = 2 and 60 ÷ 12 = 5, so 24 + 60 = <b>12(2 + 5)</b>.`) +
      example('Example: mental math', `${big('6 × 58')}Split 58 into 50 + 8: 6 × (50 + 8) = 6 × 50 + 6 × 8 = 300 + 48 = <b>348</b>.`),
    make(rng) {
      const kind = rng.pick(['factor', 'factor', 'fill', 'mental']);
      if (kind === 'mental') {
        const k = rng.int(3, 9), tens = rng.int(2, 9) * 10, ones = rng.int(1, 9), n = tens + ones;
        return { prompt: `Use the distributive property to find the product.${big(`${k} × ${n}`)}`, type: 'number', answer: k * n, params: { kind, k, n },
          hints: [`Split ${n} into ${tens} + ${ones}: ${k} × (${tens} + ${ones}).`, `${k} × ${tens} = ${k * tens} and ${k} × ${ones} = ${k * ones}.`, `${k * tens} + ${k * ones} = <b>${k * n}</b>.`] };
      }
      const g = rng.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15]);
      let a = rng.int(1, 9), b = rng.int(2, 9);
      while (b === a || M.gcd(a, b) !== 1) b = b === 9 ? 2 : b + 1;
      const s1 = g * a, s2 = g * b;
      const fac = (f, x, y) => `${f}(${x} + ${y})`;
      if (kind === 'fill') {
        return { prompt: `Fill in the missing number. Use the greatest common factor.${big(`${s1} + ${s2} = ?(${a} + ${b})`)}`, type: 'number', answer: g, params: { kind, s1, s2, a, b },
          hints: [`The missing number goes into both ${s1} and ${s2}: ${s1} = ? × ${a} and ${s2} = ? × ${b}.`, `${s1} ÷ ${a} = ${g} and ${s2} ÷ ${b} = ${g}.`, `The missing number is <b>${g}</b>.`] };
      }
      const d = factorsOf(g).find(f => f > 1 && f < g);
      const answer = fac(g, a, b);
      const wrongs = (d ? [fac(d, s1 / d, s2 / d)] : []).concat([fac(g, s1, s2), fac(g, a, s2), fac(g + 1, a, b)]);
      return { prompt: `Use the greatest common factor and the distributive property to write the sum as a product.${big(`${s1} + ${s2}`)}`, type: 'choice', answer, choices: options(answer, wrongs), params: { kind, s1, s2 },
        hints: [`Find the GCF of ${s1} and ${s2}. It is ${g}.`, `Divide each number by ${g}: ${s1} ÷ ${g} = ${a} and ${s2} ÷ ${g} = ${b}.`, `${s1} + ${s2} = <b>${answer}</b>. Check: ${g} × ${a} + ${g} × ${b} = ${s1} + ${s2} ✓`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'mental') { let t = 0; for (let i = 0; i < pr.k; i++) t += pr.n; return q.answer === t; }   // repeated addition
      if (pr.kind === 'fill') return q.answer * pr.a === pr.s1 && q.answer * pr.b === pr.s2;
      const m = q.answer.match(/^(\d+)\((\d+) \+ (\d+)\)$/); if (!m) return false;
      const [f, x, y] = m.slice(1).map(Number);
      return f * (x + y) === pr.s1 + pr.s2 && f * x === pr.s1 && M.gcd(x, y) === 1;      // right sum, and nothing more left to take out
    },
  });

  /* ---------- Unit 7: Variables and expressions ---------- */
  A.skill({
    id: 'g6.evaluate-expressions', title: 'Exponents, order of operations, and evaluating expressions',
    learn: p(`An <b>exponent</b> says how many times to multiply a number by itself: ${M.sup(2, 4)} = 2 × 2 × 2 × 2 = 16. It is <i>not</i> 2 × 4.`) +
      p('<b>Order of operations:</b> first <b>parentheses</b>, then <b>exponents</b>, then <b>multiply and divide</b> from left to right, then <b>add and subtract</b> from left to right.') +
      p(`To <b>evaluate</b> an expression means to find its value. Put the number in place of the letter, then follow the order of operations. When ${X} = 5, 3${X} + 7 means 3 × 5 + 7 = 22.`) +
      example('Example: order of operations', `${big(`(8 + 4) ÷ 3 + ${M.sup(2, 3)}`)}Parentheses: 12 ÷ 3 + ${M.sup(2, 3)}. Exponent: 12 ÷ 3 + 8. Divide: 4 + 8 = <b>12</b>.`) +
      example('Example: exponents', `${big(`${M.sup(3, 4)} and ${M.sup('0.3', 2)}`)}${M.sup(3, 4)} = 3 × 3 × 3 × 3 = <b>81</b>. With a decimal: ${M.sup('0.3', 2)} = 0.3 × 0.3 = <b>0.09</b>.`) +
      example('Example: putting in values', `${big(`${M.sup(X, 2)} + 5${V('y')} when ${X} = 4 and ${V('y')} = 3`)}Put the numbers in: ${M.sup(4, 2)} + 5 × 3. Exponent first: 16 + 5 × 3. Multiply: 16 + 15 = <b>31</b>.`),
    make(rng) {
      const kind = rng.pick(['power', 'order', 'order', 'sub', 'sub']);
      if (kind === 'power') {
        const dec = rng.chance(0.25);
        const b = dec ? rng.pick([0.1, 0.2, 0.3, 0.5, 1.2, 1.5]) : rng.int(2, 9), e = dec ? 2 : (b <= 3 ? rng.int(2, 5) : b <= 5 ? rng.int(2, 4) : rng.int(2, 3));
        const ans = M.round(Math.pow(b, e), 6);
        return { prompt: `Evaluate.${big(M.sup(N(b), e))}`, type: 'number', answer: ans, params: { kind, js: `${b}**${e}` },
          hints: [`The exponent ${e} means multiply ${N(b)} by itself ${e} times: ${Array(e).fill(N(b)).join(' × ')}.`, `${M.sup(N(b), e)} = <b>${N(ans)}</b>.`] };
      }
      if (kind === 'order') {
        const form = rng.int(0, 5);
        const a = rng.int(2, 12), b = rng.int(2, 9), c = rng.int(2, 6), k = rng.int(1, 4);
        const T = [
          [`${a} + ${b} × ${c}`, `${a}+${b}*${c}`, [`Multiply first: ${b} × ${c} = ${b * c}.`, `Then add: ${a} + ${b * c} = `]],
          [`(${a} + ${b}) × ${c}`, `(${a}+${b})*${c}`, [`Parentheses first: ${a} + ${b} = ${a + b}.`, `Then multiply: ${a + b} × ${c} = `]],
          [`${a} + ${M.sup(b, 2)}`, `${a}+${b}**2`, [`Exponent first: ${M.sup(b, 2)} = ${b * b}.`, `Then add: ${a} + ${b * b} = `]],
          [`${M.sup(`(${b + c * k} − ${b})`, 2)} ÷ ${c}`, `(${b + c * k}-${b})**2/${c}`, [`Parentheses first: ${b + c * k} − ${b} = ${c * k}.`, `Exponent: ${M.sup(c * k, 2)} = ${c * c * k * k}. Then divide: ${c * c * k * k} ÷ ${c} = `]],
          [`${b * c + a} − ${b} × ${c} + ${M.sup(k + 1, 2)}`, `${b * c + a}-${b}*${c}+${k + 1}**2`, [`Exponent first: ${M.sup(k + 1, 2)} = ${(k + 1) ** 2}. Then multiply: ${b} × ${c} = ${b * c}.`, `Now left to right: ${b * c + a} − ${b * c} + ${(k + 1) ** 2} = `]],
          [`${(b + c) * a} ÷ (${b} + ${c}) × ${k + 1}`, `${(b + c) * a}/(${b}+${c})*${k + 1}`, [`Parentheses first: ${b} + ${c} = ${b + c}.`, `Then divide and multiply from left to right: ${(b + c) * a} ÷ ${b + c} = ${a}, and ${a} × ${k + 1} = `]],
        ][form];
        const ans = [a + b * c, (a + b) * c, a + b * b, c * k * k, a + (k + 1) ** 2, a * (k + 1)][form];
        return { prompt: `Evaluate.${big(T[0])}`, type: 'number', answer: ans, params: { kind, js: T[1] }, hints: [T[2][0], T[2][1] + `<b>${ans}</b>.`] };
      }
      const form = rng.int(0, 3);
      const x = rng.int(2, 9), y = rng.int(1, 9), k = rng.int(2, 6), c = rng.int(1, 12);
      const T = [
        [`${k}${X} + ${c}`, `when ${X} = ${x}`, `${k}*x+${c}`, `${k} × ${x} + ${c}`, k * x + c],
        [`${M.sup(X, 2)} + ${V('y')}`, `when ${X} = ${x} and ${V('y')} = ${y}`, `x**2+y`, `${M.sup(x, 2)} + ${y} = ${x * x} + ${y}`, x * x + y],
        [`${k}(${X} + ${c})`, `when ${X} = ${x}`, `${k}*(x+${c})`, `${k} × (${x} + ${c}) = ${k} × ${x + c}`, k * (x + c)],
        [`${k}${X} − ${V('y')}`, `when ${X} = ${x} and ${V('y')} = ${y}`, `${k}*x-y`, `${k} × ${x} − ${y} = ${k * x} − ${y}`, k * x - y],
      ][form];
      return { prompt: `Evaluate the expression ${T[1]}.${big(T[0])}`, type: 'number', answer: T[4], params: { kind, js: T[2], x, y },
        hints: [`Put the numbers in place of the letters: ${T[3]}.`, `Follow the order of operations: <b>${N(T[4])}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      const v = pr.kind === 'sub' ? new Function('x', 'y', 'return ' + pr.js)(pr.x, pr.y) : new Function('return ' + pr.js)();   // JavaScript's own precedence
      return Math.abs(v - q.answer) < 1e-9;
    },
  });

  A.skill({
    id: 'g6.write-expressions', title: 'Writing and equivalent expressions',
    learn: p(`A letter like ${V('n')} can stand for a number we do not know yet. Turn words into symbols piece by piece: “<b>more than</b>” and “sum” mean +, “<b>less than</b>” and “fewer” mean −, “<b>times</b>” and “product” mean ×, “divided by” and “quotient” mean ÷.`) +
      p(`Watch the order with “less than”: “5 less than ${V('n')}” starts with ${V('n')} and takes 5 away, so it is ${V('n')} − 5, not 5 − ${V('n')}. A number next to a letter means multiply: 4${V('n')} is 4 × ${V('n')}.`) +
      p(`<b>Equivalent expressions</b> are equal for every value of the letter. You can make one by distributing, 3(${X} + 4) = 3${X} + 12, or by <b>combining like terms</b>, 4${X} + 2${X} = 6${X}. <b>Like terms</b> have the same letter part, so they can be added.`) +
      example('Example: words to symbols', `${big(`“3 times the sum of ${V('n')} and 4”`)}The sum comes first, so it goes in parentheses: <b>3(${V('n')} + 4)</b>. It is equivalent to 3${V('n')} + 12.`) +
      example('Example: from a story', `${big(`Jai has ${V('n')} marbles. Lena has 4 fewer than Jai.`)}“Fewer” means take away, and you start from Jai’s amount: Lena has <b>${V('n')} − 4</b> marbles.`) +
      example('Example: equivalent expressions', `${big(`6(${X} + 2) and 4${X} + 3${X} + 2`)}Distribute: 6(${X} + 2) = <b>6${X} + 12</b>. Combine like terms: 4${X} + 3${X} + 2 = <b>7${X} + 2</b>.`),
    make(rng) {
      const kind = rng.pick(['words', 'words', 'story', 'equiv']);
      const k = rng.int(2, 9); let m = rng.int(2, 9); if (m === k) m = k === 9 ? 3 : k + 1;
      const n = V('n'), x = X;
      const o = (h, js) => ({ h, js });
      let T;
      if (kind === 'words') {
        T = rng.pick([
          [`${k} more than ${n}`, o(`${n} + ${k}`, `n+${k}`), [o(`${k}${n}`, `${k}*n`), o(`${n} − ${k}`, `n-${k}`), o(`${k} − ${n}`, `${k}-n`)]],
          [`${k} less than ${n}`, o(`${n} − ${k}`, `n-${k}`), [o(`${k} − ${n}`, `${k}-n`), o(`${n} + ${k}`, `n+${k}`), o(`${k}${n}`, `${k}*n`)]],
          [`the product of ${k} and ${n}`, o(`${k}${n}`, `${k}*n`), [o(`${n} + ${k}`, `n+${k}`), o(`${n} ÷ ${k}`, `n/${k}`), o(`${k} − ${n}`, `${k}-n`)]],
          [`${n} divided by ${k}`, o(`${n} ÷ ${k}`, `n/${k}`), [o(`${k} ÷ ${n}`, `${k}/n`), o(`${k}${n}`, `${k}*n`), o(`${n} − ${k}`, `n-${k}`)]],
          [`${k} times the sum of ${n} and ${m}`, o(`${k}(${n} + ${m})`, `${k}*(n+${m})`), [o(`${k}${n} + ${m}`, `${k}*n+${m}`), o(`${k} + ${n} + ${m}`, `${k}+n+${m}`), o(`${k}(${n} − ${m})`, `${k}*(n-${m})`)]],
          [`${m} more than ${k} times ${n}`, o(`${k}${n} + ${m}`, `${k}*n+${m}`), [o(`${k}(${n} + ${m})`, `${k}*(n+${m})`), o(`${k}${n} − ${m}`, `${k}*n-${m}`), o(`${m}${n} + ${k}`, `${m}*n+${k}`)]],
        ]);
        T[0] = `Which expression means “${T[0]}”?`;
      } else if (kind === 'story') {
        const a = rng.pick(NAMES), b = rng.pick(NAMES.filter(z => z !== a));
        T = rng.pick([
          [`${a} has ${n} stickers. ${b} has ${k} fewer stickers than ${a}. Which expression shows how many stickers ${b} has?`, o(`${n} − ${k}`, `n-${k}`), [o(`${k} − ${n}`, `${k}-n`), o(`${n} + ${k}`, `n+${k}`), o(`${n} ÷ ${k}`, `n/${k}`)]],
          [`Notebooks cost $${k} each. Which expression shows the cost, in dollars, of ${n} notebooks?`, o(`${k}${n}`, `${k}*n`), [o(`${n} + ${k}`, `n+${k}`), o(`${n} ÷ ${k}`, `n/${k}`), o(`${k} ÷ ${n}`, `${k}/n`)]],
          [`${a} shares ${n} grapes equally among ${k} friends. Which expression shows how many grapes each friend gets?`, o(`${n} ÷ ${k}`, `n/${k}`), [o(`${k} ÷ ${n}`, `${k}/n`), o(`${k}${n}`, `${k}*n`), o(`${n} − ${k}`, `n-${k}`)]],
          [`${a} is ${n} years old. ${b} is ${k} years older. Which expression shows ${b}’s age?`, o(`${n} + ${k}`, `n+${k}`), [o(`${k}${n}`, `${k}*n`), o(`${n} − ${k}`, `n-${k}`), o(`${k} − ${n}`, `${k}-n`)]],
        ]);
      } else {
        const a = rng.int(2, 7), b = rng.int(2, 7), c = rng.int(1, 9);
        T = rng.pick([
          [`Which expression is equivalent to ${k}(${x} + ${m})?`, o(`${k}${x} + ${k * m}`, `${k}*n+${k * m}`), [o(`${k}${x} + ${m}`, `${k}*n+${m}`), o(`${x} + ${k * m}`, `n+${k * m}`), o(`${k + m}${x}`, `${k + m}*n`)]],
          [`Which expression is equivalent to ${a}${x} + ${b}${x} + ${c}?`, o(`${a + b}${x} + ${c}`, `${a + b}*n+${c}`), [o(`${a + b + c}${x}`, `${a + b + c}*n`), o(`${a * b}${x} + ${c}`, `${a * b}*n+${c}`), o(`${a + b}${M.sup(x, 2)} + ${c}`, `${a + b}*n*n+${c}`)]],
          [`Which expression is equivalent to ${k * a}${x} + ${k * m}?`, o(`${k}(${a}${x} + ${m})`, `${k}*(${a}*n+${m})`), [o(`${k}(${a}${x} + ${k * m})`, `${k}*(${a}*n+${k * m})`), o(`${k * a}(${x} + ${m})`, `${k * a}*(n+${m})`), o(`${k}(${x} + ${m})`, `${k}*(n+${m})`)]],
        ]);
      }
      const answer = T[1].h, all = [T[1]].concat(T[2]);
      const isEquiv = kind === 'equiv';
      return { prompt: T[0], type: 'choice', answer, choices: options(answer, T[2].map(w => w.h)), params: { kind, target: T[1].js, opts: all.map(w => [w.h, w.js]) },
        hints: isEquiv ? [`Equivalent means equal for every value of ${x}. Try distributing or combining like terms.`, `Check by putting ${x} = 2 into the original and into your choice: both should give the same number.`, `The equivalent expression is <b>${answer}</b>.`]
          : [`Find the operation word: “more”, “older” and “sum” add; “less” and “fewer” subtract; “times”, “each” and “product” multiply; “divided” and “shares” divide.`, `Keep the order right: the amount you start with comes first.`, `The expression is <b>${answer}</b>.`] };
    },
    verify(q) {
      const { opts } = q.params, f = js => new Function('n', 'return ' + js);
      const ansJs = opts.find(([h]) => h === q.answer)[1];
      const tests = [2, 3, 7, 11.5];
      const same = (a, b) => tests.every(t => Math.abs(f(a)(t) - f(b)(t)) < 1e-9);
      // the chosen answer matches the target everywhere, and every other option differs somewhere
      return same(ansJs, q.params.target) && q.choices.every(c => c === q.answer || !same(opts.find(([h]) => h === c)[1], q.params.target));
    },
  });


  /* ---------- Unit 8: Equations and inequalities ---------- */
  A.skill({
    id: 'g6.one-step-equations', title: 'One-step equations',
    learn: p(`An <b>equation</b> says two amounts are equal, like a balance. To <b>solve</b> it means to find the value of ${X} that makes it true. <b>Do the opposite operation to both sides</b> so that ${X} is left alone.`) +
      p(`Undo + with −, − with +, × with ÷ and ÷ with ×. If ${X} + 7 = 19, subtract 7 from both sides: ${X} = 12. If 4${X} = 36, divide both sides by 4: ${X} = 9.`) +
      p(`Always <b>check</b> by putting your answer back in: 12 + 7 = 19 ✓`) +
      example('Example: undoing division', `${big(`${F(X, 6)} = 5`)}${X} is divided by 6, so multiply both sides by 6: ${X} = <b>30</b>. Check: 30 ÷ 6 = 5 ✓`) +
      example('Example: a fraction times x', `${big(`${F(2, 3)}${X} = 8`)}Undo × ${F(2, 3)} by multiplying both sides by the reciprocal (the flipped fraction), ${F(3, 2, { raw: true })}: ${X} = 8 × ${F(3, 2, { raw: true })} = ${F(24, 2, { raw: true })} = <b>12</b>. Check: ${F(2, 3)} × 12 = 8 ✓`) +
      example('Example: a story', `${big('After a friend gives Ravi 9 cards, he has 25.')}Let ${X} be the cards he had at first: ${X} + 9 = 25. Subtract 9 from both sides: ${X} = <b>16</b>. Check: 16 + 9 = 25 ✓`),
    make(rng) {
      const kind = rng.pick(['add', 'sub', 'mul', 'div', 'frac', 'dec', 'word']);
      const name = rng.pick(NAMES);
      const x = rng.int(2, 40), a = rng.int(2, 15);
      if (kind === 'add' || kind === 'dec') {
        const aa = kind === 'dec' ? rng.int(11, 99) / 10 : a, xx = kind === 'dec' ? rng.int(11, 199) / 10 : x, b = M.round(xx + aa, 4);
        const left = rng.bool() ? `${X} + ${N(aa)}` : `${N(aa)} + ${X}`;
        return { prompt: `Solve for ${X}.${big(`${left} = ${N(b)}`)}`, type: 'number', answer: xx, params: { kind, a: aa, b },
          hints: [`${N(aa)} is added to ${X}. Undo it by subtracting ${N(aa)} from both sides.`, `${X} = ${N(b)} − ${N(aa)}.`, `<b>${X} = ${N(xx)}</b>. Check: ${N(xx)} + ${N(aa)} = ${N(b)} ✓`] };
      }
      if (kind === 'sub') {
        const b = x, xx = x + a;
        return { prompt: `Solve for ${X}.${big(`${X} − ${a} = ${b}`)}`, type: 'number', answer: xx, params: { kind, a, b },
          hints: [`${a} is subtracted from ${X}. Undo it by adding ${a} to both sides.`, `${X} = ${b} + ${a}.`, `<b>${X} = ${xx}</b>. Check: ${xx} − ${a} = ${b} ✓`] };
      }
      if (kind === 'mul') {
        const b = a * x;
        return { prompt: `Solve for ${X}.${big(`${a}${X} = ${b}`)}`, type: 'number', answer: x, params: { kind, a, b },
          hints: [`${a}${X} means ${a} × ${X}. Undo it by dividing both sides by ${a}.`, `${X} = ${b} ÷ ${a}.`, `<b>${X} = ${x}</b>. Check: ${a} × ${x} = ${b} ✓`] };
      }
      if (kind === 'div') {
        const b = rng.int(2, 12), xx = a * b;
        return { prompt: `Solve for ${X}.${big(`${F(X, a)} = ${b}`)}`, type: 'number', answer: xx, params: { kind, a, b },
          hints: [`${X} is divided by ${a}. Undo it by multiplying both sides by ${a}.`, `${X} = ${b} × ${a}.`, `<b>${X} = ${xx}</b>. Check: ${xx} ÷ ${a} = ${b} ✓`] };
      }
      if (kind === 'frac') {
        const d = rng.int(2, 6), n = rng.int(1, d - 1), t = rng.int(1, 9);
        const [sn, sd] = M.simp(n, d), xx = sd * t, b = sn * t;
        return { prompt: `Solve for ${X}.${big(`${F(sn, sd)}${X} = ${b}`)}`, type: 'number', answer: xx, params: { kind, n: sn, d: sd, b },
          hints: [`${X} is multiplied by ${F(sn, sd)}. Undo it by multiplying both sides by the reciprocal, ${F(sd, sn, { raw: true })}.`, `${X} = ${b} × ${F(sd, sn, { raw: true })} = ${F(b * sd, sn, { raw: true })}.`, `<b>${X} = ${xx}</b>. Check: ${F(sn, sd)} × ${xx} = ${b} ✓`] };
      }
      const total = x + a;
      if (rng.bool()) {
        const [thing, unit, ask] = rng.pick([['tickets to the school play', 'tickets', 'ticket'], ['art kits at the craft fair', 'kits', 'kit'], ['museum passes', 'passes', 'pass'], ['T-shirts for the science club', 'shirts', 'T-shirt']]), cost = a * x;
        return { prompt: `${name} bought ${a} ${thing} for $${cost} in all. Each one cost the same. How much did one ${ask} cost?`, type: 'number', answer: x, unit: '$', params: { kind: 'mul', a, b: cost },
          hints: [`Let ${X} be the cost of one ${ask}. Then ${a}${X} = ${cost}.`, `Divide both sides by ${a}: ${X} = ${cost} ÷ ${a}.`, `<b>${X} = ${x}</b>: one ${ask} cost $${x}.`] };
      }
      const [had, got, unit] = rng.pick([['some trading cards', `a friend gave ${name} ${a} more`, 'cards'], ['some stickers', `${name} won ${a} more at the community center`, 'stickers'],
        ['some library books', `${name} checked out ${a} more`, 'books'], ['some seashells', `${name} found ${a} more at the beach`, 'shells'], ['some coins saved', `${name} added ${a} more`, 'coins']]);
      return { prompt: `${name} had ${had}. After ${got}, ${name} had ${total}. How many ${unit} did ${name} have at first?`, type: 'number', answer: x, unit, params: { kind: 'add', a, b: total },
        hints: [`Let ${X} be the number at first. Then ${X} + ${a} = ${total}.`, `Subtract ${a} from both sides: ${X} = ${total} − ${a}.`, `<b>${X} = ${x}</b>: ${name} had ${x} ${unit}.`] };
    },
    verify(q) {
      const { kind, a, b, n, d } = q.params, x = q.answer;
      if (kind === 'add' || kind === 'dec') return close(x + a, b);
      if (kind === 'sub') return x - a === b;
      if (kind === 'mul') return a * x === b;
      if (kind === 'div') return x / a === b;
      return close(n * x / d, b);
    },
  });

  function rayLine(c, op) {
    const lo = c - 5, X0 = 30, st = 30, px = v => X0 + (v - lo) * st;
    const right = op === '>' || op === '≥', closed = op === '≤' || op === '≥';
    let g = `<line class="stroke" x1="10" y1="40" x2="350" y2="40"/>`;
    for (let v = lo; v <= c + 5; v++) g += `<line class="stroke" x1="${px(v)}" y1="34" x2="${px(v)}" y2="46" style="stroke-width:1"/><text x="${px(v)}" y="64" text-anchor="middle" font-size="12">${N(v)}</text>`;
    const end = right ? 350 : 10;
    g += `<line x1="${px(c)}" y1="40" x2="${end}" y2="40" stroke="var(--primary)" stroke-width="5"/><path d="M${end},40 l${right ? -10 : 10},-7 v14 z" fill="var(--primary)"/>`;
    g += `<circle cx="${px(c)}" cy="40" r="7" stroke="var(--primary)" stroke-width="3" fill="${closed ? 'var(--primary)' : 'var(--surface)'}"/>`;
    return `<svg class="figure" viewBox="0 0 360 74" width="360" role="img" aria-label="number line with a ray starting at ${c}">${g}</svg>`;
  }
  const OPS = ['&lt;', '&gt;', '≤', '≥'];
  const holds = (v, op, c) => op === '&lt;' ? v < c : op === '&gt;' ? v > c : op === '≤' ? v <= c : v >= c;
  A.skill({
    id: 'g6.inequalities', title: 'Writing and testing inequalities',
    learn: p(`An <b>inequality</b> says one side is bigger or smaller. ${X} &lt; 5 means “${X} is less than 5”; ${X} &gt; 5 means “greater than 5”. With a line underneath, ≤ means “less than <b>or equal to</b>” and ≥ means “greater than or equal to”.`) +
      p(`Watch the words: “<b>at least</b> 12” and “a minimum of 12” mean ≥ 12; “<b>at most</b> 12” and “no more than 12” mean ≤ 12. An inequality has many solutions: to test a number, put it in and see if the statement is true.`) +
      p(`On a number line, an <b>open circle</b> means the number itself is not included (&lt; or &gt;); a <b>filled circle</b> means it is (≤ or ≥). The arrow points toward the solutions.`) +
      example('Example: testing a value', `${big(`Is ${X} = 4 a solution of ${X} + 3 &gt; 6?`)}4 + 3 = 7, and 7 &gt; 6 is true, so <b>yes</b>. But ${X} = 3 is not: 3 + 3 = 6, and 6 &gt; 6 is false.`) +
      example('Example: words to an inequality', `${big('You must be at least 10 years old to ride.')}“At least 10” means 10 or more, and 10 itself is allowed, so the age ${V('a')} must be <b>${V('a')} ≥ 10</b>.`) +
      example('Example: reading a number line', `${rayLine(3, '<')}The circle at 3 is open, so 3 is not included, and the arrow points left, toward smaller numbers: <b>${X} &lt; 3</b>.`),
    make(rng) {
      const kind = rng.pick(['write', 'write', 'test', 'graph']);
      if (kind === 'write') {
        const c = rng.int(3, 60);
        const [phrase, op, letter] = rng.pick([
          [`You must be <b>at least</b> ${c} years old to join the club.`, '≥', 'a'], [`An elevator can carry <b>at most</b> ${c} people.`, '≤', 'p'],
          [`The temperature stayed <b>above</b> ${c}°F all day.`, '&gt;', 't'], [`There are <b>fewer than</b> ${c} seats left.`, '&lt;', 's'],
          [`Each team can have <b>no more than</b> ${c} players.`, '≤', 'p'], [`The book has <b>more than</b> ${c} pages.`, '&gt;', 'n'],
          [`You need a <b>minimum</b> of ${c} points to win a prize.`, '≥', 'k'], [`The bag weighs <b>less than</b> ${c} pounds.`, '&lt;', 'w'],
        ]);
        const choices = OPS.map(o => `${V(letter)} ${o} ${c}`), answer = `${V(letter)} ${op} ${c}`;
        return { prompt: `${phrase} Which inequality shows this, using ${V(letter)}?`, type: 'choice', answer, choices, keepOrder: true, params: { kind, op, phrase },
          hints: [`Is ${c} itself allowed? ${op === '≥' || op === '≤' ? 'Yes, so the sign has a line under it.' : 'No, so the sign has no line under it.'}`, `Are the allowed values bigger or smaller than ${c}? ${op === '≥' || op === '&gt;' ? 'Bigger.' : 'Smaller.'}`, `<b>${answer}</b>.`] };
      }
      if (kind === 'graph') {
        const c = rng.int(-5, 9), op = rng.pick(OPS);
        const choices = OPS.map(o => `${X} ${o} ${N(c)}`), answer = `${X} ${op} ${N(c)}`;
        return { prompt: `Which inequality does the number line show?${rayLine(c, op.replace('&lt;', '<').replace('&gt;', '>'))}`, type: 'choice', answer, choices, keepOrder: true, params: { kind, op, c },
          hints: [`The circle is at ${N(c)} and it is ${op === '≤' || op === '≥' ? 'filled, so ' + N(c) + ' is included' : 'open, so ' + N(c) + ' is not included'}.`, `The arrow points to the ${op === '&gt;' || op === '≥' ? 'right, toward bigger numbers' : 'left, toward smaller numbers'}.`, `<b>${answer}</b>.`] };
      }
      const a = rng.int(2, 9), c0 = rng.int(4, 15), op = rng.pick(OPS), add = rng.bool();
      const lhs = add ? `${X} + ${a}` : `${a}${X}`, rhs = add ? c0 + a : a * c0;           // boundary is x = c0
      const f = v => add ? v + a : a * v;
      const good = op === '&lt;' || op === '≤' ? c0 - rng.int(1, 3) : c0 + rng.int(1, 3);
      const bad = op === '&lt;' || op === '≤' ? [c0 + 1, c0 + rng.int(3, 6), op === '≤' ? c0 + 2 : c0] : [c0 - 1, c0 - rng.int(3, 6), op === '≥' ? c0 - 2 : c0];
      const vals = [...new Set([good].concat(bad))];
      const answer = `${X} = ${good}`;
      return { prompt: `Which value of ${X} is a solution of the inequality?${big(`${lhs} ${op} ${rhs}`)}`, type: 'choice', answer, choices: vals.map(v => `${X} = ${v}`), params: { kind, op, a, add, rhs, vals },
        hints: [`Try each value in ${lhs} and see if the result is ${op} ${rhs}.`, vals.map(v => `${X} = ${v}: ${add ? `${v} + ${a}` : `${a} × ${v}`} = ${f(v)}, ${holds(f(v), op, rhs) ? 'true' : 'false'}`).join('; ') + '.', `Only <b>${answer}</b> makes it true.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'write') {
        const t = A.stripTags(pr.phrase).toLowerCase();
        const want = /at least|minimum/.test(t) ? '≥' : /at most|no more than/.test(t) ? '≤' : /above|more than/.test(t) ? '&gt;' : '&lt;';
        return q.answer.includes(want);
      }
      if (pr.kind === 'graph') { const m = q.prompt.match(/<circle cx="([\d.]+)"[^>]*fill="([^"]+)"/); const closed = m[2] === 'var(--primary)', right = /l-10/.test(q.prompt); return q.answer.includes(right ? (closed ? '≥' : '&gt;') : (closed ? '≤' : '&lt;')); }
      const sols = pr.vals.filter(v => holds(pr.add ? v + pr.a : v * pr.a, pr.op, pr.rhs));
      return sols.length === 1 && q.answer === `${X} = ${sols[0]}`;
    },
  });

  /* ---------- Unit 9: Geometry ---------- */
  const shoelace = pts => Math.abs(pts.reduce((s, [x, y], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; return s + x * y2 - x2 * y; }, 0)) / 2;
  const svgShape = (poly, extra, label, w) => `<svg class="figure" viewBox="0 0 300 190" width="${w || 300}" role="img" aria-label="${label}"><polygon class="fill" points="${poly}"/>${extra}<text x="296" y="186" text-anchor="end" font-size="9" fill="var(--muted)">not to scale</text></svg>`;
  const dash = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="5 4"/><path class="stroke" d="M${x2},${y2 - 10} h10 v10" style="stroke-width:1"/>`;
  const lab = (x, y, t, anchor) => `<text x="${x}" y="${y}" text-anchor="${anchor || 'middle'}" font-size="13">${t}</text>`;
  A.skill({
    id: 'g6.area', title: 'Area of triangles, parallelograms, trapezoids, and composite shapes',
    learn: p(`The <b>area</b> of a shape is how many unit squares it covers, so it is measured in square units such as cm². The <b>base</b> is the side the shape sits on, and the <b>height</b> is the straight-up distance from the base to the top: the dashed line in the pictures, not a slanted side.`) +
      p(`<b>Parallelogram</b> (a four-sided shape whose opposite sides are parallel): ${V('A')} = base × height. Cut a triangle off one end, slide it to the other, and you have a rectangle.`) +
      p(`<b>Triangle:</b> ${V('A')} = ${F(1, 2)} × base × height, because a triangle is half of a parallelogram. <b>Trapezoid</b> (a four-sided shape with just one pair of parallel sides, called its bases): ${V('A')} = ${F(1, 2)} × (base 1 + base 2) × height.`) +
      p('A <b>composite shape</b> is made of simpler shapes. Split it into rectangles and triangles, find each area, and add. Or find a big rectangle and subtract the missing piece.') +
      example('Example: parallelogram', `${svgShape('20,150 200,150 270,40 90,40', dash(90, 40, 90, 150) + lab(110, 172, '9 cm') + lab(96, 100, '4 cm', 'start') + lab(240, 96, '5 cm', 'start'), 'parallelogram with a base of 9 cm, a slanted side of 5 cm and a dashed height of 4 cm', 250)}The height is the dashed line, 4 cm, not the slanted 5 cm side. ${V('A')} = 9 × 4 = <b>36 cm²</b>.`) +
      example('Example: triangle', `${svgShape('30,150 250,150 100,30', dash(100, 30, 100, 150) + lab(140, 172, '10 m') + lab(106, 96, '6 m', 'start'), 'triangle with a base of 10 m and a dashed height of 6 m', 250)}${V('A')} = ${F(1, 2)} × 10 × 6 = ${F(1, 2)} × 60 = <b>30 m²</b>. Working backward: if you knew the area was 30 m² and the base was 10 m, then ${F(1, 2)} × 10 = 5, and the height is 30 ÷ 5 = <b>6 m</b>.`) +
      example('Example: trapezoid', `${svgShape('20,150 270,150 200,40 80,40', dash(80, 40, 80, 150) + lab(145, 172, '10 cm') + lab(140, 32, '6 cm') + lab(86, 100, '4 cm', 'start'), 'trapezoid with parallel bases of 10 cm and 6 cm and a dashed height of 4 cm', 250)}Add the bases, then take half of that times the height: ${F(1, 2)} × (6 + 10) × 4 = ${F(1, 2)} × 16 × 4 = <b>32 cm²</b>.`) +
      example('Example: composite shape', `${svgShape('40,160 250,160 250,90 150,90 150,30 40,30', lab(145, 178, '10 ft') + lab(34, 100, '8 ft', 'end') + lab(95, 24, '6 ft') + lab(256, 130, '5 ft', 'start'), 'an L-shaped figure: the bottom is 10 ft long, the left side is 8 ft tall, the top is 6 ft long, and the short right side is 5 ft tall', 250)}The full rectangle would be 10 × 8 = 80 ft². The missing corner is 10 − 6 = 4 ft wide and 8 − 5 = 3 ft tall, so it is 4 × 3 = 12 ft². The area is 80 − 12 = <b>68 ft²</b>.`),
    make(rng) {
      const kind = rng.pick(['tri', 'para', 'trap', 'house', 'L', 'missing']);
      const u = rng.pick(['cm', 'm', 'in', 'ft']), U = s => `${s} ${u}`;
      let ans, pts, fig, hints;
      const ask = `What is the area of this ${{ tri: 'triangle', para: 'parallelogram', trap: 'trapezoid', house: 'shape', L: 'shape' }[kind]}?`;
      if (kind === 'tri' || kind === 'missing') {
        const b = rng.int(4, 16), h = rng.int(3, 12);
        fig = svgShape('30,150 250,150 100,30', dash(100, 30, 100, 150) + lab(140, 172, U(b)) + lab(106, 96, kind === 'missing' ? '?' : U(h), 'start'), `triangle with a base of ${U(b)} and a dashed height of ${kind === 'missing' ? 'unknown length' : U(h)}`);
        if (kind === 'missing') {
          const area = b * h / 2;
          return { prompt: `This triangle has an area of ${N(area)} ${u}² and a base of ${U(b)}. What is its height?${fig}`, type: 'number', answer: h, unit: u, params: { kind, area, b },
            hints: [`${V('A')} = ${F(1, 2)} × base × height, so ${N(area)} = ${F(1, 2)} × ${b} × height.`, `${F(1, 2)} × ${b} = ${N(b / 2)}, so height = ${N(area)} ÷ ${N(b / 2)}.`, `The height is <b>${U(h)}</b>.`] };
        }
        ans = b * h / 2; pts = [[0, 0], [b, 0], [2, h]];
        hints = [`${V('A')} = ${F(1, 2)} × base × height.`, `${F(1, 2)} × ${b} × ${h} = ${F(1, 2)} × ${b * h}.`, `The area is <b>${N(ans)} ${u}²</b>.`];
      } else if (kind === 'para') {
        const b = rng.int(4, 15), h = rng.int(3, 10), side = h + rng.int(1, 4);
        fig = svgShape('20,150 200,150 270,40 90,40', dash(90, 40, 90, 150) + lab(110, 172, U(b)) + lab(96, 100, U(h), 'start') + lab(240, 96, U(side), 'start'), `parallelogram with a base of ${U(b)}, a slanted side of ${U(side)} and a dashed height of ${U(h)}`);
        ans = b * h; pts = [[0, 0], [b, 0], [b + 3, h], [3, h]];
        hints = [`${V('A')} = base × height. The height is the dashed line, ${U(h)}, not the slanted side.`, `${b} × ${h} = <b>${ans} ${u}²</b>.`];
      } else if (kind === 'trap') {
        const b1 = rng.int(6, 16), b2 = rng.int(2, b1 - 2), h = rng.int(2, 10);
        fig = svgShape('20,150 270,150 200,40 80,40', dash(80, 40, 80, 150) + lab(145, 172, U(b1)) + lab(140, 32, U(b2)) + lab(86, 100, U(h), 'start'), `trapezoid with parallel bases of ${U(b1)} and ${U(b2)} and a dashed height of ${U(h)}`);
        ans = (b1 + b2) * h / 2; pts = [[0, 0], [b1, 0], [1 + b2, h], [1, h]];
        hints = [`${V('A')} = ${F(1, 2)} × (base 1 + base 2) × height.`, `Add the bases: ${b1} + ${b2} = ${b1 + b2}. Then ${F(1, 2)} × ${b1 + b2} × ${h} = ${F(1, 2)} × ${(b1 + b2) * h}.`, `The area is <b>${N(ans)} ${u}²</b>.`];
      } else if (kind === 'house') {
        const w = rng.int(4, 12), h1 = rng.int(3, 9), h2 = rng.int(2, 6);
        fig = svgShape('50,160 250,160 250,85 150,20 50,85', dash(150, 20, 150, 85) + lab(150, 178, U(w)) + lab(44, 126, U(h1), 'end') + lab(156, 60, U(h2), 'start'), `a rectangle ${U(w)} wide and ${U(h1)} tall with a triangle on top whose dashed height is ${U(h2)}`);
        ans = w * h1 + w * h2 / 2; pts = [[0, 0], [w, 0], [w, h1], [w / 2, h1 + h2], [0, h1]];
        hints = [`Split the shape into a rectangle (${w} by ${h1}) and a triangle on top (base ${w}, height ${h2}).`, `Rectangle: ${w} × ${h1} = ${w * h1}. Triangle: ${F(1, 2)} × ${w} × ${h2} = ${N(w * h2 / 2)}.`, `Total: ${w * h1} + ${N(w * h2 / 2)} = <b>${N(ans)} ${u}²</b>.`];
      } else {
        const W = rng.int(7, 15), H = rng.int(6, 12), cw = rng.int(2, W - 3), ch = rng.int(2, H - 2);
        fig = svgShape('40,160 250,160 250,90 150,90 150,30 40,30', lab(145, 178, U(W)) + lab(34, 100, U(H), 'end') + lab(95, 24, U(W - cw)) + lab(256, 130, U(H - ch), 'start'), `an L-shaped figure: the bottom is ${U(W)} long, the left side is ${U(H)} tall, the top is ${U(W - cw)} long, and the short right side is ${U(H - ch)} tall`);
        ans = W * H - cw * ch; pts = [[0, 0], [W, 0], [W, H - ch], [W - cw, H - ch], [W - cw, H], [0, H]];
        hints = [`Imagine the full rectangle: ${W} by ${H}, area ${W * H}. A corner piece is missing.`, `The missing piece is ${W} − ${W - cw} = ${cw} wide and ${H} − ${H - ch} = ${ch} tall, so its area is ${cw * ch}.`, `${W * H} − ${cw * ch} = <b>${ans} ${u}²</b>.`];
      }
      return { prompt: `${ask}${fig}`, type: 'number', answer: ans, unit: `${u}²`, params: { kind, pts }, hints };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'missing') return close(q.answer * pr.b, 2 * pr.area);
      return close(shoelace(pr.pts), q.answer);                         // area from the corner coordinates
    },
  });

  /** a box drawn in 3-D: the front, the top and the right side, with dashed hidden edges and its three edges labeled.
      labs = [length, width, height] as plain text; opts.grid = [along the length, the width, the height] draws the small
      cubes on the faces; opts.exact keeps the true proportions (otherwise a thin side is drawn a bit thicker, not to scale) */
  function boxSvg(l, w, h, labs, label, opts) {
    opts = opts || {};
    const m = Math.max(l, w, h), fit = v => opts.exact ? v : 0.4 + 0.6 * v / m;
    const kx = 0.52, ky = 0.3;                                          // the depth goes up and to the right
    let L = fit(l), W = fit(w), H = fit(h);
    const s = Math.min(205 / (L + W * kx), 140 / (H + W * ky));
    L *= s; H *= s; const dx = W * s * kx, dy = W * s * ky, x0 = 64, y0 = 14 + dy;
    const pt = a => a.map(([x, y]) => `${M.round(x, 1)},${M.round(y, 1)}`).join(' ');
    const r = v => M.round(v, 1), line = (x1, y1, x2, y2, extra) => `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" ${extra}/>`;
    let g = `<polygon class="fill" points="${pt([[x0, y0], [x0 + L, y0], [x0 + L, y0 + H], [x0, y0 + H]])}"/>`;
    g += `<polygon class="fill" style="fill:var(--surface)" points="${pt([[x0, y0], [x0 + dx, y0 - dy], [x0 + L + dx, y0 - dy], [x0 + L, y0]])}"/>`;
    g += `<polygon class="fill" style="fill:var(--tint-2)" points="${pt([[x0 + L, y0], [x0 + L + dx, y0 - dy], [x0 + L + dx, y0 - dy + H], [x0 + L, y0 + H]])}"/>`;
    const hidden = 'stroke="var(--muted)" stroke-width="1" stroke-dasharray="4 4"';           // the three edges at the back corner, seen through
    g += line(x0 + dx, y0 - dy + H, x0, y0 + H, hidden) + line(x0 + dx, y0 - dy + H, x0 + dx, y0 - dy, hidden) + line(x0 + dx, y0 - dy + H, x0 + L + dx, y0 - dy + H, hidden);
    if (opts.grid) {
      const [nl, nw, nh] = opts.grid, thin = 'stroke="var(--primary)" stroke-width="0.8"';
      for (let i = 1; i < nl; i++) { const x = x0 + L * i / nl; g += line(x, y0, x, y0 + H, thin) + line(x, y0, x + dx, y0 - dy, thin); }
      for (let j = 1; j < nh; j++) { const y = y0 + H * j / nh; g += line(x0, y, x0 + L, y, thin) + line(x0 + L, y, x0 + L + dx, y - dy, thin); }
      for (let k = 1; k < nw; k++) { const ox = dx * k / nw, oy = dy * k / nw; g += line(x0 + ox, y0 - oy, x0 + L + ox, y0 - oy, thin) + line(x0 + L + ox, y0 - oy, x0 + L + ox, y0 - oy + H, thin); }
    }
    g += `<text x="${r(x0 + L / 2)}" y="${r(y0 + H + 20)}" text-anchor="middle" font-size="13">${labs[0]}</text>`;
    g += `<text x="${r(x0 + L + dx / 2 + 8)}" y="${r(y0 + H - dy / 2 + 14)}" text-anchor="start" font-size="13">${labs[1]}</text>`;
    g += `<text x="${x0 - 8}" y="${r(y0 + H / 2 + 5)}" text-anchor="end" font-size="13">${labs[2]}</text>`;
    const Wd = Math.ceil(x0 + L + dx + 90), Hd = Math.ceil(y0 + H + 34);
    if (!opts.exact) g += `<text x="${Wd - 4}" y="${Hd - 4}" text-anchor="end" font-size="9" fill="var(--muted)">not to scale</text>`;
    return `<svg class="figure" viewBox="0 0 ${Wd} ${Hd}" width="${Wd}" role="img" aria-label="${label}">${g}</svg>`;
  }
  /** the net of a box, unfolded into a cross: the four side faces in a row, the top above the front and the bottom below it.
      Each face shows its two edge lengths; the three matching pairs are shaded alike. */
  function netSvg(l, w, h, label) {
    const k = Math.min((330 - 64) / (2 * (l + w)), (214 - 48) / (h + 2 * w)), D = v => 16 + v * k;
    const Lw = D(l), Ww = D(w), Hh = D(h), x0 = 8, y0 = 8, r = v => M.round(v, 1);
    const shade = { lw: '', lh: ' style="fill:var(--surface)"', wh: ' style="fill:var(--tint-2)"' };
    const face = (x, y, fw, fh, txt, sh) => `<rect class="fill"${shade[sh]} x="${r(x)}" y="${r(y)}" width="${r(fw)}" height="${r(fh)}"/><text x="${r(x + fw / 2)}" y="${r(y + fh / 2 + 4)}" text-anchor="middle" font-size="11">${txt}</text>`;
    const row = y0 + Ww;
    let g = face(x0, row, Ww, Hh, `${w} × ${h}`, 'wh') + face(x0 + Ww, row, Lw, Hh, `${l} × ${h}`, 'lh') + face(x0 + Ww + Lw, row, Ww, Hh, `${w} × ${h}`, 'wh') + face(x0 + 2 * Ww + Lw, row, Lw, Hh, `${l} × ${h}`, 'lh');
    g += face(x0 + Ww, y0, Lw, Ww, `${l} × ${w}`, 'lw') + face(x0 + Ww, row + Hh, Lw, Ww, `${l} × ${w}`, 'lw');
    const Wd = Math.ceil(x0 * 2 + 2 * (Lw + Ww)), Hd = Math.ceil(y0 + Hh + 2 * Ww + 18);
    g += `<text x="${Wd - 4}" y="${Hd - 4}" text-anchor="end" font-size="9" fill="var(--muted)">not to scale</text>`;
    return `<svg class="figure" viewBox="0 0 ${Wd} ${Hd}" width="${Wd}" role="img" aria-label="${label}">${g}</svg>`;
  }
  /** the net of a square pyramid: a square with a triangle on each side; one triangle shows its dashed height */
  function pyramidNetSvg(sd, t, u) {
    const k = Math.min(9, 190 / (sd + 2 * t)), S = 44 + sd * k, T = 26 + t * k, C = T + S / 2 + 8, r = v => M.round(v, 1);
    const a = C - S / 2, b = C + S / 2;
    let g = `<polygon class="fill" style="fill:var(--surface)" points="${r(a)},${r(a)} ${r(b)},${r(a)} ${r(b)},${r(b)} ${r(a)},${r(b)}"/>`;
    g += [[[a, a], [b, a], [C, a - T]], [[b, a], [b, b], [b + T, C]], [[b, b], [a, b], [C, b + T]], [[a, b], [a, a], [a - T, C]]].map(tr => `<polygon class="fill" points="${tr.map(([x, y]) => `${r(x)},${r(y)}`).join(' ')}"/>`).join('');
    g += `<line x1="${r(C)}" y1="${r(a)}" x2="${r(C)}" y2="${r(a - T)}" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="5 4"/>`;
    g += `<text x="${r(C + 9)}" y="${r(a - T / 2 + 4)}" text-anchor="start" font-size="12">${t} ${u}</text><text x="${r(C)}" y="${r(b - 8)}" text-anchor="middle" font-size="12">${sd} ${u}</text>`;
    const Wd = Math.ceil(2 * C);
    g += `<text x="${Wd - 4}" y="${Wd - 4}" text-anchor="end" font-size="9" fill="var(--muted)">not to scale</text>`;
    return `<svg class="figure" viewBox="0 0 ${Wd} ${Wd}" width="${Math.min(Wd, 260)}" role="img" aria-label="the net of a square pyramid: a square with sides of ${sd} ${u} and four triangles, each with a base of ${sd} ${u} and a dashed height of ${t} ${u}">${g}</svg>`;
  }
  A.skill({
    id: 'g6.volume-surface-area', title: 'Volume and surface area',
    learn: p(`<b>Volume</b> is the amount of space inside a solid, measured in <b>cubic units</b> such as cm³. For a box (a <b>rectangular prism</b>), ${V('V')} = length × width × height. This works with fractions too: a box ${F(1, 2)} m by 3 m by 2 m has a volume of ${F(1, 2)} × 3 × 2 = 3 m³. Turn mixed numbers into improper fractions before multiplying.`) +
      p(`You can also fill a box with small cubes. A cube with edges of ${F(1, 2)} unit has a volume of ${F(1, 8)} cubic unit, so <b>8 of them make one unit cube</b>. Count how many small cubes fit along each edge, then multiply.`) +
      p('The <b>surface area</b> is the total area of all the faces, the flat sides of the solid. Unfold the solid into a flat <b>net</b>, find the area of each piece, and add. A box has 6 rectangles in 3 matching pairs.') +
      example('Example: volume', `${boxSvg(4, 2.5, 3, ['4 cm', '2 1/2 cm', '3 cm'], 'a box 4 cm long, 2 1/2 cm wide and 3 cm tall')}${V('V')} = 4 × ${MX(5, 2)} × 3 = 4 × ${F(5, 2, { raw: true })} × 3 = ${F(60, 2, { raw: true })} = <b>30 cm³</b>.`) +
      example('Example: filling with small cubes', `${boxSvg(2, 1.5, 1, ['2', '1 1/2', '1'], 'a box 2 units long, 1 1/2 units wide and 1 unit tall, filled with cubes whose edges are 1/2 unit: 4 along the length, 3 along the width and 2 up the height', { exact: true, grid: [4, 3, 2] })}How many cubes with ${F(1, 2)}-unit edges fill a box 2 by ${MX(3, 2)} by 1 units? 4 halves fit along the 2, 3 along the ${MX(3, 2)}, and 2 along the 1. 4 × 3 × 2 = <b>24 cubes</b>. Check: 24 × ${F(1, 8)} = 3, and 2 × ${MX(3, 2)} × 1 = 3 ✓`) +
      example('Example: surface area from a net', `${netSvg(5, 3, 2, 'the net of a box 5 cm long, 3 cm wide and 2 cm tall: two faces 5 by 3, two faces 5 by 2 and two faces 3 by 2')}The box is 5 cm × 3 cm × 2 cm. Faces: two 5 × 3 = 15, two 5 × 2 = 10, two 3 × 2 = 6. Surface area = 2 × (15 + 10 + 6) = <b>62 cm²</b>.`) +
      example('Example: a square pyramid', `${pyramidNetSvg(4, 5, 'in')}The square is 4 × 4 = 16 in². Each triangle is ${F(1, 2)} × 4 × 5 = 10 in², and there are 4 of them: 40 in². Surface area = 16 + 40 = <b>56 in²</b>.`),
    make(rng) {
      const kind = rng.pick(['vol', 'vol', 'cubes', 'sa-box', 'sa-net', 'sa-pyramid']);
      const u = rng.pick(['cm', 'm', 'in', 'ft']);
      if (kind === 'vol') {
        const edge = () => { const d = rng.pick([1, 2, 2, 4]); return [rng.int(1, 5) * d + (d === 1 ? 0 : rng.pick(d === 2 ? [1] : [1, 3])), d]; };
        const e = [edge(), edge(), edge()]; if (e.every(([, d]) => d === 1)) e[0] = [e[0][0] * 2 + 1, 2];
        const num = e[0][0] * e[1][0] * e[2][0], den = e[0][1] * e[1][1] * e[2][1], [sn, sd] = M.simp(num, den);
        const show = e.map(([n, d]) => `${MX(n, d)} ${u}`), txt = e.map(([n, d]) => `${mixTxt(n, d)} ${u}`);
        const pic = boxSvg(e[0][0] / e[0][1], e[1][0] / e[1][1], e[2][0] / e[2][1], txt, `a box ${txt[0]} long, ${txt[1]} wide and ${txt[2]} tall`);
        return { prompt: `A box is ${show[0]} long, ${show[1]} wide and ${show[2]} tall. What is its volume? Give your answer as a fraction or mixed number.${pic}`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), unit: `${u}³`, params: { kind, e },
          hints: [`${V('V')} = length × width × height.`, `As fractions: ${e.map(([n, d]) => F(n, d, { raw: true })).join(' × ')} = ${F(num, den, { raw: true })}.`, `Simplify: <b>${MX(sn, sd)} ${u}³</b>${sd > 1 ? ` (${M.fracText(sn, sd)})` : ''}.`] };
      }
      if (kind === 'cubes') {
        const h = [rng.int(2, 8), rng.int(2, 8), rng.int(2, 6)];                 // edges in halves
        const show = h.map(k => MX(k, 2)), txt = h.map(k => mixTxt(k, 2));
        const pic = boxSvg(h[0], h[1], h[2], txt, `a box ${txt[0]} units long, ${txt[1]} units wide and ${txt[2]} units tall`);
        return { prompt: `A box is ${show[0]} by ${show[1]} by ${show[2]} units. How many cubes with edges of ${F(1, 2)} unit does it take to fill it?${pic}`, type: 'number', answer: h[0] * h[1] * h[2], unit: 'cubes', params: { kind, h },
          hints: [`Along each edge, count how many halves fit: ${show.map((s, i) => `${s} has ${h[i]}`).join(', ')}.`, `Multiply to count the cubes: ${h.join(' × ')}.`, `It takes <b>${h[0] * h[1] * h[2]} cubes</b>.`] };
      }
      if (kind === 'sa-pyramid') {
        const sd = rng.int(2, 10), t = rng.int(sd, 12);
        const ans = sd * sd + 4 * sd * t / 2;
        return { prompt: `The net of a square pyramid is a square with sides of ${sd} ${u} and four triangles, each with a base of ${sd} ${u} and a height of ${t} ${u}. What is the surface area?${pyramidNetSvg(sd, t, u)}`, type: 'number', answer: ans, unit: `${u}²`, params: { kind, s: sd, t },
          hints: [`Square: ${sd} × ${sd} = ${sd * sd}.`, `Each triangle: ${F(1, 2)} × ${sd} × ${t} = ${N(sd * t / 2)}. Four of them: ${N(2 * sd * t)}.`, `Total: ${sd * sd} + ${N(2 * sd * t)} = <b>${N(ans)} ${u}²</b>.`] };
      }
      const [l, w, h] = rng.sample([2, 3, 4, 5, 6, 7, 8, 9, 10], 3).sort((a, b) => b - a);
      const ans = 2 * (l * w + l * h + w * h);
      const prompt = kind === 'sa-net' ? `A box is unfolded into a net of 6 rectangles: two are ${l} ${u} by ${w} ${u}, two are ${l} ${u} by ${h} ${u}, and two are ${w} ${u} by ${h} ${u}. What is the surface area of the box?${netSvg(l, w, h, `the net of a box: two faces ${l} ${u} by ${w} ${u}, two faces ${l} ${u} by ${h} ${u} and two faces ${w} ${u} by ${h} ${u}`)}`
        : `A box is ${l} ${u} long, ${w} ${u} wide and ${h} ${u} tall. What is its surface area?${boxSvg(l, w, h, [`${l} ${u}`, `${w} ${u}`, `${h} ${u}`], `a box ${l} ${u} long, ${w} ${u} wide and ${h} ${u} tall`)}`;
      return { prompt, type: 'number', answer: ans, unit: `${u}²`, params: { kind, l, w, h },
        hints: [`A box has 3 pairs of matching faces: ${l} × ${w}, ${l} × ${h} and ${w} × ${h}.`, `${l * w} + ${l * h} + ${w * h} = ${l * w + l * h + w * h}. Each face has a twin, so double it.`, `Surface area = 2 × ${l * w + l * h + w * h} = <b>${ans} ${u}²</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'vol') return close(q.answer, pr.e.reduce((v, [n, d]) => v * n / d, 1));
      if (pr.kind === 'cubes') { let c = 0; for (let i = 0; i < pr.h[0]; i++) for (let j = 0; j < pr.h[1]; j++) for (let k = 0; k < pr.h[2]; k++) c++; return q.answer === c; }
      if (pr.kind === 'sa-pyramid') return close(q.answer, pr.s * pr.s + 4 * (pr.s * pr.t / 2));
      const { l, w, h } = pr, faces = [[l, w], [l, w], [l, h], [l, h], [w, h], [w, h]];   // the six faces of the net
      return q.answer === faces.reduce((s, [a, b]) => s + a * b, 0);
    },
  });

  /* ---------- Unit 10: Data and statistics ---------- */
  const median = s => { const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
  /** a box plot over a number line from lo to hi, its five numbers named above it */
  function boxPlotSvg(five, lo, hi, step, label) {
    const X0 = 22, X1 = 318, px = v => M.round(X0 + (v - lo) * (X1 - X0) / (hi - lo), 1), [mn, q1, md, q3, mx] = five, y = 48;
    let g = `<line class="stroke" x1="${X0}" y1="86" x2="${X1}" y2="86" style="stroke-width:1.5"/>`;
    for (let v = lo; v <= hi; v += step) g += `<line class="stroke" x1="${px(v)}" y1="81" x2="${px(v)}" y2="91" style="stroke-width:1"/><text x="${px(v)}" y="106" text-anchor="middle" font-size="12">${v}</text>`;
    g += `<line class="stroke" x1="${px(mn)}" y1="${y}" x2="${px(q1)}" y2="${y}"/><line class="stroke" x1="${px(q3)}" y1="${y}" x2="${px(mx)}" y2="${y}"/>`;
    g += [mn, mx].map(v => `<line class="stroke" x1="${px(v)}" y1="${y - 9}" x2="${px(v)}" y2="${y + 9}"/>`).join('');
    g += `<rect class="fill" x="${px(q1)}" y="${y - 16}" width="${M.round(px(q3) - px(q1), 1)}" height="32"/><line class="stroke" x1="${px(md)}" y1="${y - 16}" x2="${px(md)}" y2="${y + 16}" style="stroke-width:3"/>`;
    g += [[mn, 'Min'], [q1, 'Q1'], [md, 'Median'], [q3, 'Q3'], [mx, 'Max']].map(([v, t]) => `<text x="${px(v)}" y="20" text-anchor="middle" font-size="11" fill="var(--muted)">${t}</text>`).join('');
    return `<svg class="figure" viewBox="0 0 340 114" width="340" role="img" aria-label="${label}">${g}</svg>`;
  }
  A.skill({
    id: 'g6.mean-median', title: 'Mean and median',
    learn: p('The <b>mean</b> (average) shares the total out equally: <b>add all the values and divide by how many there are</b>.') +
      p('The <b>median</b> is the middle value once the data is <b>in order</b>. With an even number of values there are two in the middle; the median is halfway between them (their mean).') +
      p('If you know the mean, you know the total: total = mean × how many. That lets you find a missing value.') +
      example('Example: mean and median', `${big('7, 3, 10, 4, 6, 12')}Mean: 7 + 3 + 10 + 4 + 6 + 12 = 42, and 42 ÷ 6 = <b>7</b>. Median: in order, 3, 4, 6, 7, 10, 12. The middle two are 6 and 7, so the median is halfway between them, <b>6.5</b>.`) +
      example('Example: a missing value', `${big('The mean of 4 numbers is 9. Three of them are 6, 10 and 7.')}The total of all 4 is 9 × 4 = 36. The three you know add to 6 + 10 + 7 = 23. The missing number is 36 − 23 = <b>13</b>.`),
    make(rng) {
      const kind = rng.pick(['mean', 'median', 'median', 'missing', 'mean-word']);
      const n = rng.int(4, 7);
      let data = Array.from({ length: n }, () => rng.int(1, 30));
      if (kind !== 'median') { const sum = data.reduce((a, b) => a + b, 0); data[n - 1] += (n - sum % n) % n; }
      const sum = data.reduce((a, b) => a + b, 0), sorted = data.slice().sort((a, b) => a - b);
      if (kind === 'missing') {
        const mean = sum / n, known = data.slice(0, n - 1), miss = data[n - 1], ks = known.reduce((a, b) => a + b, 0);
        return { prompt: `The mean of ${n} numbers is ${mean}. Here are ${n - 1} of them: ${known.join(', ')}. What is the missing number?`, type: 'number', answer: miss, params: { kind, mean, known },
          hints: [`The total of all ${n} numbers is mean × count: ${mean} × ${n} = ${sum}.`, `The ${n - 1} numbers you know add to ${ks}.`, `The missing number is ${sum} − ${ks} = <b>${miss}</b>.`] };
      }
      if (kind === 'median') {
        const ans = median(sorted);
        return { prompt: `Find the <b>median</b>.${big(data.join(', '))}`, type: 'number', answer: ans, params: { kind, data },
          hints: [`Put the values in order: ${sorted.join(', ')}.`, n % 2 ? `There are ${n} values, so the middle one is the ${M.ordinal((n + 1) / 2)}.` : `There are ${n} values, so there are two middle ones: ${sorted[n / 2 - 1]} and ${sorted[n / 2]}. Find the number halfway between them.`, `The median is <b>${N(ans)}</b>.`] };
      }
      const ans = sum / n;
      const nm = rng.pick(NAMES), [did, per] = rng.pick([[`${nm} scored these points in ${n} basketball games.`, 'points per game'], [`${nm} read for these numbers of minutes on ${n} days.`, 'minutes per day'],
        [`${nm} swam these numbers of laps at ${n} swim practices.`, 'laps per practice'], [`The bakery sold these numbers of loaves on ${n} days.`, 'loaves per day'], [`${nm} picked these numbers of strawberries on ${n} visits to the farm.`, 'strawberries per visit']]);
      const prompt = kind === 'mean' ? `Find the <b>mean</b>.${big(data.join(', '))}` : `${did} What is the mean number of ${per}?${big(data.join(', '))}`;
      return { prompt, type: 'number', answer: ans, params: { kind, data },
        hints: [`Add the values: ${data.join(' + ')} = ${sum}.`, `Divide by how many there are: ${sum} ÷ ${n}.`, `The mean is <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'missing') return close((pr.known.reduce((a, b) => a + b, 0) + q.answer) / (pr.known.length + 1), pr.mean);
      if (pr.kind === 'median') {                        // a median has as many values above it as below it
        const below = pr.data.filter(v => v < q.answer).length, above = pr.data.filter(v => v > q.answer).length, at = pr.data.length - below - above;
        return Math.abs(below - above) <= at;
      }
      let t = 0; pr.data.forEach(v => { t += v; }); return close(q.answer * pr.data.length, t);
    },
  });

  A.skill({
    id: 'g6.spread', title: 'MAD, IQR, and box plots',
    learn: p('The <b>spread</b> of a data set tells you how far apart the values are. The <b>mean absolute deviation (MAD)</b> is the average distance from the mean: find the mean, find how far each value is from it, then take the mean of those distances.') +
      p('The <b>interquartile range (IQR)</b> measures the spread of the middle half. Put the data in order and find the median. <b>Q1</b> is the median of the lower half and <b>Q3</b> is the median of the upper half (leave the middle value out when the count is odd). These are the <b>quartiles</b>: with the median, they cut the data into four parts of about the same size. <b>IQR = Q3 − Q1.</b>') +
      p('A <b>box plot</b> shows five numbers: the minimum, Q1, the median, Q3 and the maximum. The box goes from Q1 to Q3 and holds the middle 50% of the data; each whisker holds about 25%. The range is maximum − minimum.' +
        boxPlotSvg([12, 18, 23, 30, 41], 10, 45, 5, 'a box plot on a number line from 10 to 45: the minimum is 12, Q1 is 18, the median is 23, Q3 is 30 and the maximum is 41')) +
      example('Example: MAD', `${big('2, 4, 6, 8')}The mean is 20 ÷ 4 = 5. The distances from 5 are 3, 1, 1 and 3. MAD = (3 + 1 + 1 + 3) ÷ 4 = 8 ÷ 4 = <b>2</b>.`) +
      example('Example: IQR', `${big('3, 5, 6, 8, 10, 12, 13, 15, 20')}There are 9 values, so the median is the 5th, 10. Leave it out. Lower half: 3, 5, 6, 8, so Q1 = 5.5. Upper half: 12, 13, 15, 20, so Q3 = 14. IQR = 14 − 5.5 = <b>8.5</b>.`) +
      example('Example: reading a box plot', `In the box plot above, the IQR is 30 − 18 = <b>12</b> and the range is 41 − 12 = <b>29</b>. About <b>25%</b> of the values are above Q3, 30, and about <b>50%</b> are in the box, from 18 to 30.`),
    make(rng) {
      const kind = rng.pick(['mad', 'mad', 'iqr', 'iqr', 'box']);
      if (kind === 'mad') {
        const n = rng.pick([4, 5]);
        const data = Array.from({ length: n }, () => rng.int(1, 20));
        const sum0 = data.reduce((a, b) => a + b, 0); data[n - 1] += (n - sum0 % n) % n;
        if (data.every(v => v === data[0])) { data[0] += n; data[1] = Math.max(1, data[1] - n); }
        if (data.reduce((a, b) => a + b, 0) % n) data[n - 1] += n - data.reduce((a, b) => a + b, 0) % n;
        const mean2 = data.reduce((a, b) => a + b, 0) / n, dev2 = data.map(v => Math.abs(v - mean2)), ds2 = dev2.reduce((a, b) => a + b, 0), ans2 = M.round(ds2 / n, 4);
        return { prompt: `Find the <b>mean absolute deviation</b> (MAD) of this data.${big(data.join(', '))}`, type: 'number', answer: ans2, params: { kind, data },
          hints: [`First the mean: ${data.join(' + ')} = ${mean2 * n}, and ${mean2 * n} ÷ ${n} = ${N(mean2)}.`, `Distance of each value from ${N(mean2)}: ${dev2.map(N).join(', ')}.`, `Mean of the distances: ${N(ds2)} ÷ ${n} = <b>${N(ans2)}</b>.`] };
      }
      if (kind === 'iqr') {
        const n = rng.int(7, 10);
        const data = Array.from({ length: n }, () => rng.int(1, 40)), s = data.slice().sort((a, b) => a - b);
        const half = Math.floor(n / 2), lower = s.slice(0, half), upper = s.slice(n - half);
        const q1 = median(lower), q3 = median(upper), ans = q3 - q1;
        return { prompt: `Find the <b>interquartile range</b> (IQR) of this data.${big(data.join(', '))}`, type: 'number', answer: ans, params: { kind, data },
          hints: [`Put the data in order: ${s.join(', ')}.`, `${n % 2 ? `Leave out the middle value, ${s[half]}. ` : ''}Lower half: ${lower.join(', ')}. Upper half: ${upper.join(', ')}.`, `Q1 = ${N(q1)} and Q3 = ${N(q3)}.`, `IQR = ${N(q3)} − ${N(q1)} = <b>${N(ans)}</b>.`] };
      }
      const mn = rng.int(10, 30), q1 = mn + rng.int(2, 8), md = q1 + rng.int(1, 8), q3 = md + rng.int(1, 8), mx = q3 + rng.int(2, 10);
      const what = rng.pick(['iqr', 'range', 'median', 'above-q3', 'between']);
      const thing = rng.pick([['Heights of plants', 'cm'], ['Minutes spent reading', 'min'], ['Scores on a quiz', 'points'], ['Jumps in one minute', 'jumps']]);
      const table = M.table(['Minimum', 'Q1', 'Median', 'Q3', 'Maximum'], [[mn, q1, md, q3, mx]]);
      const Q = { iqr: ['What is the interquartile range?', q3 - q1, [`IQR = Q3 − Q1.`, `${q3} − ${q1} = <b>${q3 - q1}</b>.`]],
        range: ['What is the range?', mx - mn, [`Range = maximum − minimum.`, `${mx} − ${mn} = <b>${mx - mn}</b>.`]],
        median: ['What is the median?', md, [`The median is the line inside the box.`, `It is <b>${md}</b>.`]],
        'above-q3': [`About what percent of the values are greater than ${q3}?`, 25, [`${q3} is Q3. The box plot splits the data into four parts of about 25% each.`, `Only the top whisker, from Q3 to the maximum, is above ${q3}: about <b>25%</b>.`]],
        between: [`About what percent of the values are between ${q1} and ${md}?`, 25, [`${q1} is Q1 and ${md} is the median.`, `Each of the four parts holds about 25% of the data, so about <b>25%</b>.`]] }[what];
      if (what === 'between' && rng.bool()) { Q[0] = `About what percent of the values are between ${q1} and ${q3}?`; Q[1] = 50; Q[2] = [`${q1} is Q1 and ${q3} is Q3: that is the box.`, `The box holds the middle half of the data: about <b>50%</b>.`]; }
      return { prompt: `A box plot of “${thing[0]}” (${thing[1]}) has these five values.${table}${Q[0]}`, type: 'number', answer: Q[1], unit: what.includes('q3') || what === 'between' ? '%' : undefined, params: { kind, what, five: [mn, q1, md, q3, mx], q: Q[0] }, hints: Q[2] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'mad') { const n = pr.data.length; let t = 0; pr.data.forEach(v => { t += v; }); const m = t / n; let d = 0; pr.data.forEach(v => { d += v > m ? v - m : m - v; }); return close(q.answer, d / n) && d > 0; }
      if (pr.kind === 'iqr') {
        const s = pr.data.slice().sort((a, b) => a - b), n = s.length;
        const qAt = (lo, hi) => (s[Math.floor((lo + hi) / 2)] + s[Math.ceil((lo + hi) / 2)]) / 2;   // median of s[lo..hi] by index
        const h = Math.floor(n / 2);
        return close(q.answer, qAt(n - h, n - 1) - qAt(0, h - 1));
      }
      const [mn, q1, md, q3, mx] = pr.five;
      if (pr.what === 'iqr') return q.answer + q1 === q3;
      if (pr.what === 'range') return q.answer + mn === mx;
      if (pr.what === 'median') return q.answer === md;
      const parts = [[mn, q1], [q1, md], [md, q3], [q3, mx]];
      const m = pr.q.match(/between (\d+) and (\d+)|greater than (\d+)/);
      const lo = Number(m[1] || m[3]), hi = m[2] ? Number(m[2]) : mx;
      return q.answer === 25 * parts.filter(([a, b]) => a >= lo && b <= hi).length;    // count the quarters inside
    },
  });

  /* ---------- Unit 11: Fractions as division and mixed numbers ---------- */
  const SHARE_CTX = [
    { what: 'pizzas', whatOne: 'pizza', much: 'pizza', one: 'pizza', ones: 'pizzas', some: 'Some pizzas were' },
    { what: 'pieces of licorice', whatOne: 'piece of licorice', much: 'licorice', one: 'piece', ones: 'pieces', some: 'Some licorice was' },
    { what: 'loaves of bread', whatOne: 'loaf of bread', much: 'bread', one: 'loaf', ones: 'loaves', some: 'Some bread was' },
    { what: 'pounds of clay', whatOne: 'pound of clay', much: 'clay', one: 'pound', ones: 'pounds', unit: 'lb', some: 'Some clay was' },
    { what: 'meters of ribbon', whatOne: 'meter of ribbon', much: 'ribbon', one: 'meter', ones: 'meters', unit: 'm', some: 'Some ribbon was' },
    { what: 'liters of juice', whatOne: 'liter of juice', much: 'juice', one: 'liter', ones: 'liters', unit: 'L', some: 'Some juice was' },
    { what: 'cups of rice', whatOne: 'cup of rice', much: 'rice', one: 'cup', ones: 'cups', unit: 'cups', some: 'Some rice was' },
  ];
  const SHARERS = [['friends', 'friend'], ['people', 'person'], ['campers', 'camper'], ['teammates', 'teammate'], ['children', 'child']];
  const amountOf = (k, c) => `${k} ${k === 1 ? c.whatOne : c.what}`;
  const shareOf = (n, d, c) => `${MX(n, d)} ${n < d ? 'of a ' + c.one : c.ones}`;
  A.skill({
    id: 'g6.fraction-as-division', title: 'Fractions as division',
    learn: p(`A fraction is a division. <b>${F(V('a'), V('b'))} means ${V('a')} ÷ ${V('b')}</b>: the top number divided by the bottom number. So when ${V('a')} things are shared equally among ${V('b')} people, each person gets ${F(V('a'), V('b'))} of a thing.`) +
      p(`Picture 3 pizzas shared by 4 friends. Cut every pizza into 4 equal slices. Each friend takes one slice from each pizza: 3 slices of ${F(1, 4)}, which is ${F(3, 4)} of a pizza. So 3 ÷ 4 = ${F(3, 4)}.`) +
      p(`When there are more things than people, each person gets more than one whole. Divide to see how many wholes each person gets, then share what is left over: 7 ÷ 3 is 2 with 1 left over, so each person gets ${MX(7, 3)}.`) +
      example('Example: sharing', `${big('3 campers share 8 liters of juice equally.')}8 ÷ 3 = ${F(8, 3)}. Each camper gets 2 liters, and the 2 liters left over are split into 3 parts, so each camper gets <b>${MX(8, 3)} liters</b>.`) +
      example('Example: a division as a fraction', `${big('17 ÷ 5')}As a fraction, 17 ÷ 5 = ${F(17, 5, { raw: true })}. 5 goes into 17 three times (15), with 2 left over, so ${F(17, 5, { raw: true })} = <b>${MX(17, 5)}</b>.`) +
      example('Example: working backward', `${big(`6 friends shared some pizzas equally. Each got ${F(2, 3)} of a pizza.`)}How many pizzas were there? Each share is the total ÷ 6, so the total is ${F(2, 3)} × 6 = ${F(12, 3, { raw: true })} = <b>4 pizzas</b>.`),
    make(rng) {
      const kind = rng.pick(['share', 'share', 'share', 'divide', 'which', 'reverse']);
      const c = rng.pick(SHARE_CTX), [who, whoOne] = rng.pick(SHARERS);
      const b = rng.int(2, 9);
      let a = kind === 'divide' ? rng.int(b + 1, 5 * b) : rng.int(1, 12);
      if (a % b === 0) a += 1;
      if (kind === 'which') while (a === b || M.gcd(a, b) !== 1) a = a === 12 ? 1 : a + 1;
      const fr = F(a, b, { raw: true }), q0 = Math.floor(a / b), r = a % b;
      const story = rng.bool() ? `${b} ${who} share ${amountOf(a, c)} equally.` : `${amountOf(a, c)} ${a === 1 ? 'is' : 'are'} shared equally among ${b} ${who}.`;
      if (kind === 'share') {
        const h2 = a < b ? `Split each ${c.one} into ${b} equal parts. Each ${whoOne} gets one part of every ${c.one}: ${a} part${a > 1 ? 's' : ''} of ${F(1, b)}, which is ${fr}.`
          : `Each ${whoOne} first gets ${q0} whole ${q0 === 1 ? c.one : c.ones}, which uses ${b * q0} ${c.ones}. The ${r} left over ${r === 1 ? 'is' : 'are'} split into ${b} equal parts, so each ${whoOne} also gets ${F(r, b, { raw: true })}.`;
        return { prompt: `${story} How much ${c.much} does each ${whoOne} get? Give your answer as a fraction or a mixed number.`, type: 'number', answer: a / b, answerText: M.fracText(a, b), unit: c.unit, params: { kind, a, b },
          hints: [`Sharing ${amountOf(a, c)} among ${b} ${who} is a division: ${a} ÷ ${b}.`, h2, `${a} ÷ ${b} = ${fr}${M.gcd(a, b) > 1 || a > b ? ` = ${MX(a, b)}` : ''}. Each ${whoOne} gets <b>${shareOf(a, b, c)}</b>.`] };
      }
      if (kind === 'divide') {
        return { prompt: `Write the division as a fraction or a mixed number.${big(`${a} ÷ ${b}`)}`, type: 'number', answer: a / b, answerText: M.fracText(a, b), params: { kind, a, b },
          hints: [`A division can be written as a fraction, with the number being divided on top: ${a} ÷ ${b} = ${fr}.`, `${b} goes into ${a} ${q0} time${q0 > 1 ? 's' : ''} (${b} × ${q0} = ${b * q0}), with ${r} left over. The ${r} left over, divided by ${b}, makes ${F(r, b, { raw: true })}.`, `So ${a} ÷ ${b} = <b>${MX(a, b)}</b>${M.gcd(r, b) > 1 ? `, because ${F(r, b, { raw: true })} simplifies to ${F(r, b)}` : ''}.`] };
      }
      if (kind === 'which') {
        const answer = `${a} ÷ ${b}`, plain = rng.bool();
        return { prompt: plain ? `Which division means the same as the fraction ${F(a, b)}?` : `${story} Which expression shows how much ${c.much} each ${whoOne} gets?`, type: 'choice', answer,
          choices: [answer, `${b} ÷ ${a}`, `${a} × ${b}`, `${Math.max(a, b)} − ${Math.min(a, b)}`], params: { kind, a, b },
          hints: [plain ? `The fraction bar means “divided by”.` : `Sharing equally is dividing: the amount being shared is divided by the number of ${who}.`, plain ? `The top number, ${a}, is divided by the bottom number, ${b}.` : `${a} is being shared by ${b} ${who}, so ${a} is divided by ${b}.`, `The answer is <b>${answer}</b>, which equals ${F(a, b)}.`] };
      }
      const [sn, sd] = M.simp(a, b), frs = F(sn, sd, { raw: true });
      return { prompt: `${c.some} shared equally among ${b} ${who}. Each ${whoOne} got ${shareOf(a, b, c)}. How many ${c.what} were shared?`, type: 'number', answer: a, unit: c.unit, params: { kind, b, sn, sd },
        hints: [`Each share is the total ÷ ${b}, so the total is one share × ${b}.`, `${a > b ? `${MX(a, b)} = ${frs}, and ` : ''}${frs} × ${b} = ${F(sn * b, sd, { raw: true })}.`, `${F(sn * b, sd, { raw: true })} = ${a}, so <b>${amountOf(a, c)}</b> ${a === 1 ? 'was' : 'were'} shared.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'which') { const m = q.answer.match(/^(\d+) ÷ (\d+)$/); return !!m && Number(m[1]) === pr.a && close(Number(m[1]) / Number(m[2]), pr.a / pr.b); }
      if (pr.kind === 'reverse') { let t = 0; for (let i = 0; i < pr.b; i++) t += pr.sn / pr.sd; return Number.isInteger(q.answer) && close(t, q.answer); }   // add up every share
      return close(q.answer * pr.b, pr.a);                              // one share × the number of sharers = the amount shared
    },
  });

  /** a proper fraction r/d in lowest terms, d from the list */
  function properFrac(rng, dens) { const d = rng.pick(dens); let r = rng.int(1, d - 1); while (M.gcd(r, d) !== 1) r = r === d - 1 ? 1 : r + 1; return [r, d]; }
  /** the value of a number printed by M.mixed / M.frac: "3 1 2" → 3.5, "7 4" → 1.75, "6" → 6 */
  function printedValue(html) {
    const t = A.stripTags(html).replace(/−/g, '-').trim().split(/\s+/).map(Number);
    return t.length === 3 ? t[0] + t[1] / t[2] : t.length === 2 ? t[0] / t[1] : t[0];
  }
  function areaModelSvg(x, y) {
    const X0 = 70, Y0 = 34, W1 = 160, W2 = 64, H1 = 90, H2 = 44;
    let g = `<rect x="${X0}" y="${Y0}" width="${W1 + W2}" height="${H1 + H2}" class="fill"/>`;
    g += `<line x1="${X0 + W1}" y1="${Y0}" x2="${X0 + W1}" y2="${Y0 + H1 + H2}" class="stroke"/><line x1="${X0}" y1="${Y0 + H1}" x2="${X0 + W1 + W2}" y2="${Y0 + H1}" class="stroke"/>`;
    g += `<text x="${X0 + W1 / 2}" y="${Y0 - 10}" text-anchor="middle" font-size="15">${x.w}</text><text x="${X0 + W1 + W2 / 2}" y="${Y0 - 10}" text-anchor="middle" font-size="15">${x.r}/${x.d}</text>`;
    g += `<text x="${X0 - 10}" y="${Y0 + H1 / 2 + 5}" text-anchor="end" font-size="15">${y.w}</text><text x="${X0 - 10}" y="${Y0 + H1 + H2 / 2 + 5}" text-anchor="end" font-size="15">${y.r}/${y.d}</text>`;
    return `<svg class="figure" viewBox="0 0 310 ${Y0 + H1 + H2 + 12}" width="310" role="img" aria-label="an area model: ${x.w} and ${x.r}/${x.d} across the top, ${y.w} and ${y.r}/${y.d} down the side">${g}</svg>`;
  }
  A.skill({
    id: 'g6.multiply-mixed-numbers', title: 'Multiplying mixed numbers',
    learn: p(`To multiply mixed numbers, <b>first rewrite each one as a fraction greater than one</b>. Multiply the whole number by the denominator and add the numerator: ${MX(7, 3)} = ${F('2 × 3 + 1', 3)} = ${F(7, 3, { raw: true })}. Then multiply the numerators, multiply the denominators, simplify, and change the answer back into a mixed number.`) +
      p(`<b>Do not just multiply the whole numbers and the fractions on their own.</b> ${MX(5, 2)} × ${MX(5, 2)} is not ${MX(17, 4)}. An area model shows why: (2 + ${F(1, 2)}) × (2 + ${F(1, 2)}) has four parts, 4 + 1 + 1 + ${F(1, 4)} = ${MX(25, 4)}. The two middle parts are the ones people forget.`) +
      p(`Estimate to check your answer: ${MX(7, 3)} × ${MX(3, 2)} must be between 2 × 1 = 2 and 3 × 2 = 6.`) +
      example('Example: two mixed numbers', `${big(`${MX(7, 3)} × ${MX(3, 2)}`)}${F(7, 3, { raw: true })} × ${F(3, 2, { raw: true })} = ${F(21, 6, { raw: true })} = ${F(7, 2, { raw: true })} = <b>${MX(7, 2)}</b>.`) +
      example('Example: times a whole number', `${big(`${MX(11, 4)} × 3`)}${MX(11, 4)} = ${F(11, 4, { raw: true })}, and 3 = ${F('3', '1')}. ${F(11, 4, { raw: true })} × ${F('3', '1')} = ${F(33, 4, { raw: true })} = <b>${MX(33, 4)}</b>.`) +
      example('Example: an area model', `${areaModelSvg({ w: 2, r: 1, d: 2 }, { w: 1, r: 1, d: 3 })}${MX(5, 2)} × ${MX(4, 3)} has four parts: 2 × 1 = 2, 2 × ${F(1, 3)} = ${F(2, 3)}, ${F(1, 2)} × 1 = ${F(1, 2)} and ${F(1, 2)} × ${F(1, 3)} = ${F(1, 6)}. With sixths: 2 + ${F(4, 6, { raw: true })} + ${F(3, 6, { raw: true })} + ${F(1, 6)} = 2 + ${F(8, 6, { raw: true })} = <b>${MX(10, 3)}</b>. Check: ${F(5, 2, { raw: true })} × ${F(4, 3, { raw: true })} = ${F(20, 6, { raw: true })} = ${MX(10, 3)} ✓`),
    make(rng) {
      const kind = rng.pick(['mm', 'mm', 'mw', 'mf', 'area', 'recipe', 'model', 'mistake']);
      const dens = [2, 3, 4, 5, 6], name = rng.pick(NAMES);
      const mk = (lo, hi, ds) => { const [r, d] = properFrac(rng, ds || dens); return { w: rng.int(lo, hi), r, d }; };
      const x = mk(1, kind === 'model' ? 4 : 3, kind === 'recipe' ? [2, 3, 4] : dens);
      let y;
      if (kind === 'mw') y = { w: rng.int(2, 6), r: 0, d: 1 };
      else if (kind === 'recipe') y = { w: rng.int(1, 3), r: 1, d: rng.pick([2, 2, 3]) };       // 1 1/2 batches, 2 1/3 batches …
      else if (kind === 'mf') { const [r, d] = properFrac(rng, [2, 3, 4, 5, 6, 8]); y = { w: 0, r, d }; }
      else y = mk(1, 3, [2, 3, 4]);
      const imp = m => m.w * m.d + m.r;
      const show = m => m.r === 0 ? String(m.w) : m.w === 0 ? F(m.r, m.d) : MX(imp(m), m.d);
      const impShow = m => m.d === 1 ? F(String(m.w), '1') : F(imp(m), m.d, { raw: true });
      const Nn = imp(x) * imp(y), Dd = x.d * y.d, [sn, sd] = M.simp(Nn, Dd);
      const params = { kind, x, y };
      const ans = { type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params };
      const rewrite = [x, y].filter(m => m.w > 0 && m.r > 0).map(m => `${show(m)} = ${F(`${m.w} × ${m.d} + ${m.r}`, m.d)} = ${impShow(m)}`);
      const steps = [`Rewrite ${rewrite.length > 1 ? 'each mixed number' : 'the mixed number'} as a fraction greater than one: ${rewrite.join(' and ')}.${y.d === 1 ? ` Write ${y.w} as ${impShow(y)}.` : ''}`,
        `Multiply the numerators and the denominators: ${impShow(x)} × ${impShow(y)} = ${F(Nn, Dd, { raw: true })}.`];
      const result = `<b>${MX(sn, sd)}</b>${sd > 1 && sn > sd ? ` (${M.fracText(sn, sd)})` : ''}`, g = M.gcd(Nn, Dd);
      const finish = u => sd === 1 ? `Divide: ${F(Nn, Dd, { raw: true })} = <b>${sn}${u}</b>.`
        : `${g > 1 ? `Simplify by dividing the top and bottom by ${g}: ${F(Nn, Dd, { raw: true })} = ${F(sn, sd, { raw: true })}. ` : ''}${sn > sd ? `As a mixed number that is <b>${MX(sn, sd)}${u}</b>.` : `The answer is <b>${F(sn, sd)}${u}</b>.`}`;
      if (kind === 'model') {
        const D = x.d * y.d, p2 = x.w * y.r * x.d, p3 = x.r * y.w * y.d, p4 = x.r * y.r;
        return Object.assign(ans, { prompt: `The area model splits ${show(x)} × ${show(y)} into four parts: (${x.w} + ${F(x.r, x.d)}) × (${y.w} + ${F(y.r, y.d)}). What is the total area? Give your answer in simplest form.${areaModelSvg(x, y)}`,
          hints: [`Find each part: ${x.w} × ${y.w} = ${x.w * y.w}, ${x.w} × ${F(y.r, y.d)} = ${F(x.w * y.r, y.d, { raw: true })}, ${F(x.r, x.d)} × ${y.w} = ${F(x.r * y.w, x.d, { raw: true })}, and ${F(x.r, x.d)} × ${F(y.r, y.d)} = ${F(p4, D, { raw: true })}.`,
            `Give the three fraction parts the denominator ${D}: ${F(p2, D, { raw: true })} + ${F(p3, D, { raw: true })} + ${F(p4, D, { raw: true })} = ${F(p2 + p3 + p4, D, { raw: true })}.`,
            `Add the whole-number part: ${x.w * y.w} + ${F(p2 + p3 + p4, D, { raw: true })} = ${result}.`] });
      }
      if (kind === 'mistake') {
        const bad = (x.w + x.r) * (y.w + y.r);                           // 2 1/3 read as (2 + 1)/3
        const wrongs = [MX(x.w * y.w * Dd + x.r * y.r, Dd)].concat(bad > 2 * Dd ? [MX(bad, Dd)] : [], [MX((x.w + y.w) * Dd + x.r * y.d + y.r * x.d, Dd), MX(sn + sd, sd), MX(sn - sd, sd)]);
        const answer = MX(sn, sd);
        return { prompt: `${name} says ${show(x)} × ${show(y)} = ${wrongs[0]}, because ${x.w} × ${y.w} = ${x.w * y.w} and ${F(x.r, x.d)} × ${F(y.r, y.d)} = ${F(x.r * y.r, Dd)}. What is the correct product?`, type: 'choice', answer, choices: options(answer, wrongs), params,
          hints: [steps[0], steps[1], `${finish('')} ${name} left out the two middle parts, ${x.w} × ${F(y.r, y.d)} and ${F(x.r, x.d)} × ${y.w}.`] };
      }
      let prompt = `Multiply. Give your answer in simplest form.${big(kind === 'mw' && rng.bool() ? `${show(y)} × ${show(x)}` : `${show(x)} × ${show(y)}`)}`, unit;
      if (kind === 'area') { unit = rng.pick(['ft', 'm', 'yd']); prompt = `A rectangular garden bed is ${show(x)} ${unit} long and ${show(y)} ${unit} wide. What is its area? Give your answer in simplest form.`; unit += '²'; }
      if (kind === 'recipe') { const [stuff, u] = rng.pick([['cups of flour', 'cups'], ['cups of oats', 'cups'], ['cups of milk', 'cups'], ['teaspoons of cinnamon', 'tsp']]); unit = u; prompt = `A recipe uses ${show(x)} ${stuff}. ${name} makes ${show(y)} batches of the recipe. How many ${stuff} does ${name} need? Give your answer in simplest form.`; }
      return Object.assign(ans, { prompt, unit, hints: steps.concat(finish(unit ? ' ' + unit : '')) });
    },
    verify(q) {
      const { x, y } = q.params;
      const v = x.w * y.w + x.w * y.r / y.d + x.r / x.d * y.w + x.r * y.r / (x.d * y.d);      // the four parts of the area model
      return close(q.type === 'choice' ? printedValue(q.answer) : q.answer, v);
    },
  });

  /* ---------- Unit 12: Statistical questions and data displays ---------- */
  // Clear-cut cases only: a statistical question is about a group and expects answers that vary;
  // the others have one answer (a fact, a count, or one person at one moment).
  const STAT_QS = [
    'How old are the teachers at our school?',
    'How tall are the players on our team?',
    'How many pets do our classmates have?',
    'How much do the dogs at the shelter weigh?',
    'What shoe sizes do our classmates wear?',
    'How many siblings do our classmates have?',
    'How long are the songs on this album?',
    'How many hours do sixth graders sleep on a school night?',
    'How many books did our classmates read this summer?',
    'What were the daily high temperatures in our town last month?',
    'How many minutes do sixth graders spend on homework each night?',
    'How many letters are in our classmates’ first names?',
  ];
  const ONE_QS = [
    'How many students are in the sixth grade at our school this year?',
    'What time does the first bell ring at our school each morning?',
    'How many minutes long is the lunch break at our school?',
    'How many legs does a spider have?',
    'NAME: How many hours of sleep did NAME get last night?',
    'NAME: How tall was NAME on the first day of school this year?',
    'How many teachers work at our school this year?',
    'How many pages are in the math textbook our class uses?',
    'How many days are there in the month of September?',
    'What is the area of the floor of our classroom?',
    'NAME: How many pets does NAME’s family have at home?',
    'NAME: How long did it take NAME to walk to school this morning?',
  ];
  const STAT_REWRITE = [
    [n => `How tall is ${n}?`, n => `How tall are the students in ${n}’s class?`, n => [`How tall is ${n}’s best friend?`, `How tall was ${n} last year?`, `How tall is ${n} in centimeters?`]],
    [n => `How many pets does ${n} have?`, n => `How many pets do the students in ${n}’s class have?`, n => [`How many pets does ${n}’s neighbor have?`, `How many pets did ${n} have last year?`, `How many dogs does ${n} have?`]],
    [n => `How many hours did ${n} sleep last night?`, n => `How many hours do the students in ${n}’s grade sleep at night?`, n => [`How many hours did ${n} sleep on Saturday?`, `How many hours did ${n}’s brother sleep last night?`, `What time did ${n} go to bed last night?`]],
    [n => `How long did it take ${n} to get to school today?`, n => `How long does it take the students at ${n}’s school to get there?`, n => [`How long did it take ${n} to get home today?`, `How far is ${n}’s house from the school?`, `What time did ${n} leave for school today?`]],
    [n => `What size shoe does ${n} wear?`, n => `What shoe sizes do the players on ${n}’s soccer team wear?`, n => [`What size shoe does ${n}’s coach wear?`, `What size shoe did ${n} wear last year?`, `What color are ${n}’s soccer shoes?`]],
    [n => `How many books did ${n} read this summer?`, n => `How many books did the students in ${n}’s class read this summer?`, n => [`How many books did ${n} read last summer?`, `How many books are on ${n}’s shelf?`, `How many pages are in ${n}’s favorite book?`]],
  ];
  const oneQ = (s, name) => s.startsWith('NAME: ') ? s.slice(6).replace(/NAME/g, name) : s;
  A.skill({
    id: 'g6.statistical-questions', title: 'Statistical questions',
    learn: p('A <b>statistical question</b> is one you answer by collecting data, and it <b>expects answers that vary</b>. “How many hours do sixth graders sleep on a school night?” is statistical: different students sleep for different amounts of time, so you would ask many of them and look at all the answers.') +
      p('A question with <b>one fixed answer</b> is not statistical. “How many legs does a spider have?” has one answer. So does “How tall is Ana?”: it is about one person at one moment.') +
      p('To test a question, ask yourself: <b>would I expect to get different answers?</b> Questions about a whole group, such as the students in a class or the dogs at a shelter, usually are statistical.') +
      example('Example: making a question statistical', `${big('“How old is Ben?” → “How old are the students in Ben’s class?”')}The first question has one answer. The second asks about a whole group whose ages vary, so <b>the second is a statistical question</b>.`) +
      example('Example: one answer or many?', `${big('“How many days are in a week?” and “How many hours a week do our classmates practice music?”')}Every week has 7 days, so the first has <b>one fixed answer</b>. Different classmates practice for different amounts of time, so the second <b>is statistical</b>.`),
    make(rng) {
      const kind = rng.pick(['pick', 'pick', 'not', 'rewrite']), name = rng.pick(NAMES);
      const why = 'A statistical question expects answers that <b>vary</b>, so you would collect many pieces of data to answer it.';
      if (kind === 'rewrite') {
        const idx = rng.int(0, STAT_REWRITE.length - 1), [one, good, bad] = STAT_REWRITE[idx], answer = good(name);
        return { prompt: `“${one(name)}” is <b>not</b> a statistical question: it has only one answer. Which question below <b>is</b> a statistical question?`, type: 'choice', answer, choices: [answer].concat(bad(name)), params: { kind, idx, name },
          hints: [why, `Three of these are still about one person or one thing. Look for the one that asks about a whole group.`, `<b>${answer}</b> asks about many people, and their answers will vary.`] };
      }
      const stats = rng.sample(STAT_QS.map((_, i) => i), 3), ones = rng.sample(ONE_QS.map((_, i) => i), 3);
      if (kind === 'pick') {
        const answer = STAT_QS[stats[0]];
        return { prompt: 'Which of these is a <b>statistical question</b>?', type: 'choice', answer, choices: [answer].concat(ones.map(i => oneQ(ONE_QS[i], name))), params: { kind, name },
          hints: [why, 'For each question, ask: would different people, animals or days give different answers? A fact or a single measurement is not statistical.', `<b>${answer}</b> has many different answers, so it is the statistical question.`] };
      }
      const answer = oneQ(ONE_QS[ones[0]], name);
      return { prompt: 'Which of these is <b>not</b> a statistical question?', type: 'choice', answer, choices: [answer].concat(stats.map(i => STAT_QS[i])), params: { kind, name },
        hints: [why, 'Look for the question with just one answer: a fact, a single count, or one person at one moment.', `<b>${answer}</b> has a single answer, so it is not a statistical question.`] };
    },
    verify(q) {
      const pr = q.params, isStat = s => STAT_QS.includes(s) || STAT_REWRITE.some(([, good]) => good(pr.name) === s);
      const isOne = s => ONE_QS.some(t => oneQ(t, pr.name) === s) || STAT_REWRITE.some(([one, , bad]) => one(pr.name) === s || bad(pr.name).includes(s));
      const want = pr.kind === 'not' ? isOne : isStat, other = pr.kind === 'not' ? isStat : isOne;
      return want(q.answer) && q.choices.every(c => c === q.answer || other(c));     // the right one, and every other option clearly the other kind
    },
  });

  const HIST = [
    { title: 'Minutes spent on homework last night', item: 'students', yl: 'Students', xl: 'Minutes', lo: 0, w: 10, say: L => `spent ${L} minutes on homework`, more: v => `spent at least ${v} minutes on homework`, less: v => `spent less than ${v} minutes on homework` },
    { title: 'Heights of sunflowers', item: 'sunflowers', yl: 'Sunflowers', xl: 'Height (cm)', lo: 100, w: 20, say: L => `are ${L} cm tall`, more: v => `are at least ${v} cm tall`, less: v => `are shorter than ${v} cm` },
    { title: 'Points scored by players this season', item: 'players', yl: 'Players', xl: 'Points', lo: 0, w: 5, say: L => `scored ${L} points`, more: v => `scored at least ${v} points`, less: v => `scored fewer than ${v} points` },
    { title: 'Ages of people at a swimming pool', item: 'people', yl: 'People', xl: 'Age (years)', lo: 0, w: 10, say: L => `are ${L} years old`, more: v => `are at least ${v} years old`, less: v => `are younger than ${v}` },
    { title: 'Jumps in one minute of jump rope', item: 'students', yl: 'Students', xl: 'Jumps', lo: 40, w: 10, say: L => `made ${L} jumps`, more: v => `made at least ${v} jumps`, less: v => `made fewer than ${v} jumps` },
    { title: 'Scores on a math test', item: 'students', yl: 'Students', xl: 'Score', lo: 50, w: 10, say: L => `scored ${L} on the test`, more: v => `scored at least ${v} on the test`, less: v => `scored less than ${v} on the test` },
  ];
  const binLabel = (t, i) => `${t.lo + i * t.w}–${t.lo + (i + 1) * t.w - 1}`;
  function histSvg(t, counts) {
    const nb = counts.length, bw = nb === 4 ? 66 : 54, X0 = 50, Y = 190, px = 15, right = X0 + nb * bw;
    let g = '';
    for (let v = 1; v <= 10; v++) g += `<line x1="${X0}" y1="${Y - v * px}" x2="${right}" y2="${Y - v * px}" class="stroke light" style="stroke-width:1"/>`;
    for (let v = 0; v <= 10; v += 2) g += `<text x="${X0 - 6}" y="${Y - v * px + 4}" text-anchor="end" font-size="12">${v}</text>`;
    counts.forEach((c, i) => {
      g += `<rect x="${X0 + i * bw}" y="${Y - c * px}" width="${bw}" height="${c * px}" class="fill" data-px="${px}" data-bin="${i}"/>`;
      g += `<text x="${X0 + i * bw + bw / 2}" y="${Y + 17}" text-anchor="middle" font-size="12">${binLabel(t, i)}</text>`;
    });
    g += `<line x1="${X0}" y1="${Y}" x2="${right}" y2="${Y}" class="stroke"/><line x1="${X0}" y1="${Y}" x2="${X0}" y2="${Y - 158}" class="stroke"/>`;
    g += `<text x="${(X0 + right) / 2}" y="${Y + 40}" text-anchor="middle" font-size="13" font-weight="700">${t.xl}</text>`;
    g += `<text x="16" y="${Y - 75}" transform="rotate(-90 16 ${Y - 75})" text-anchor="middle" font-size="13" font-weight="700">${t.yl}</text>`;
    return `<svg class="figure" viewBox="0 0 ${right + 16} 240" width="${right + 16}" role="img" aria-label="a histogram of ${t.title.toLowerCase()}">${g}</svg>`;
  }
  // which display does each job? Each description fits exactly one of the four.
  const DISPLAYS = ['Stem-and-leaf plot', 'Histogram', 'Box plot', 'Bar graph'];
  const DISPLAY_JOBS = [
    ['Which display keeps every data value, so you can read each one exactly?', 'Stem-and-leaf plot', 'A stem-and-leaf plot writes down every value: each leaf is one value.'],
    ['Which display groups numbers into equal intervals and shows how many values fall in each one?', 'Histogram', 'A histogram has one bar for each interval, such as 10–19, and the height shows how many.'],
    ['Which display is drawn from five numbers: the minimum, Q1, the median, Q3 and the maximum?', 'Box plot', 'A box plot is built from the five-number summary: the box runs from Q1 to Q3.'],
    ['Which display shows how many chose each category, such as each favorite fruit?', 'Bar graph', 'Categories like fruits are not numbers on a scale, so they go in a bar graph with gaps between the bars.'],
  ];
  A.skill({
    id: 'g6.histograms', title: 'Histograms',
    learn: p('A <b>histogram</b> is a bar graph for numbers. The data is grouped into <b>intervals of equal width</b>, such as 0–9, 10–19 and 20–29, and the height of each bar shows <b>how many values</b> fall in that interval. The bars touch, because each interval starts right where the last one ended.') +
      p('To read a bar, look across from its top to the scale. To answer “how many are at least 20?”, <b>add up every bar from 20 upward</b>. Adding all the bars gives the number of values in the data set.') +
      p('A histogram does <b>not</b> show the exact values. You can see that 7 students spent 20–29 minutes on homework, but not whether any of them spent exactly 25.') +
      p('Other displays do other jobs. A <b>stem-and-leaf plot</b> keeps every value, a <b>box plot</b> is drawn from five summary numbers, and a <b>bar graph</b> counts categories, like favorite fruits, that aren’t numbers on a scale.') +
      example('Example: at least', `${histSvg(HIST[0], [2, 5, 7, 3])}How many students spent at least 20 minutes? Add the bars for 20–29 and 30–39: 7 + 3 = <b>10 students</b>.`) +
      example('Example: all, and how many more', `In the same histogram, the bars are 2, 5, 7 and 3, so it shows 2 + 5 + 7 + 3 = <b>17 students</b> in all. The 20–29 bar is 7 and the 0–9 bar is 2, so <b>5 more</b> students spent 20–29 minutes than 0–9 minutes.`),
    make(rng) {
      const kind = rng.pick(['count', 'count', 'most', 'total', 'atleast', 'less', 'more', 'display']);
      if (kind === 'display') {
        const idx = rng.int(0, DISPLAY_JOBS.length - 1), [ask, answer, why] = DISPLAY_JOBS[idx];
        return { prompt: ask, type: 'choice', answer, choices: DISPLAYS.slice(), params: { kind, idx },
          hints: ['Think about what each display shows: every value, counts in intervals, five summary numbers, or counts for categories.', why, `The answer is <b>${answer.toLowerCase()}</b>.`] };
      }
      const t = rng.pick(HIST), nb = rng.int(4, 5), c = Array.from({ length: nb }, () => rng.int(0, 9));
      c[rng.int(1, nb - 2)] = rng.int(4, 9);                              // keep the middle from being empty
      const L = i => binLabel(t, i), pic = () => `<p><b>${t.title}</b></p>${histSvg(t, c)}`;
      const params = { kind, lo: t.lo, w: t.w };
      if (kind === 'count') {
        const i = rng.int(0, nb - 1);
        return { prompt: `How many ${t.item} ${t.say(L(i))}?${pic()}`, type: 'number', answer: c[i], params: Object.assign(params, { i }),
          hints: [`Find the bar above ${L(i)}.`, c[i] ? `Look across from the top of that bar to the scale on the left: it reaches ${c[i]}.` : `There is no bar above ${L(i)}: its height is 0.`, `<b>${c[i]}</b> ${t.item} ${t.say(L(i))}.`] };
      }
      if (kind === 'most') {
        const most = rng.bool(), pickIt = most ? Math.max : Math.min;
        let k = c.indexOf(pickIt(...c));
        c.forEach((v, i) => { if (i !== k && v === c[k]) c[k] += most ? 1 : -1; });
        if (c[k] < 0) { c[k] = 0; c.forEach((v, i) => { if (i !== k && v === 0) c[i] = 1; }); }
        k = c.indexOf(pickIt(...c));
        const answer = L(k);
        return { prompt: `Which interval has the ${most ? 'most' : 'fewest'} ${t.item}?${pic()}`, type: 'choice', answer, choices: c.map((_, i) => L(i)), keepOrder: true, params: Object.assign(params, { most }),
          hints: [`Find the ${most ? 'tallest' : 'shortest'} bar.`, `The ${most ? 'tallest' : 'shortest'} bar reaches ${c[k]}, and it is above ${answer}.`, `The interval <b>${answer}</b> has the ${most ? 'most' : 'fewest'} ${t.item}.`] };
      }
      if (kind === 'total') {
        const sum = c.reduce((a, b) => a + b, 0);
        return { prompt: `How many ${t.item} does the histogram show in all?${pic()}`, type: 'number', answer: sum, params,
          hints: ['Each bar counts the values in one interval, so add up all the bars.', `The bars reach ${M.list(c.map(String))}.`, `${c.join(' + ')} = <b>${sum}</b>.`] };
      }
      if (kind === 'atleast' || kind === 'less') {
        const k = kind === 'atleast' ? rng.int(1, nb - 2) : rng.int(2, nb - 1), edge = t.lo + k * t.w;
        const idx = kind === 'atleast' ? c.map((_, i) => i).slice(k) : c.map((_, i) => i).slice(0, k);
        if (idx.every(i => c[i] === 0)) c[idx[0]] = rng.int(2, 6);
        const bars = idx.map(i => c[i]);
        const sum = bars.reduce((a, b) => a + b, 0);
        return { prompt: `How many ${t.item} ${kind === 'atleast' ? t.more(edge) : t.less(edge)}?${pic()}`, type: 'number', answer: sum, params: Object.assign(params, { edge }),
          hints: [kind === 'atleast' ? `“At least ${edge}” means ${edge} or more: use the bars from ${L(k)} up.` : `Less than ${edge} means every interval below ${edge}: the bars from ${L(0)} to ${L(k - 1)}.`,
            `Those bars are ${M.list(idx.map(i => `${L(i)}: ${c[i]}`))}.`, `${bars.join(' + ')} = <b>${sum}</b>.`] };
      }
      let [i, j] = rng.sample(c.map((_, k) => k), 2);
      if (c[i] === c[j]) c[i] = c[j] === 9 ? 7 : c[j] + 1;
      if (c[i] < c[j]) [i, j] = [j, i];
      return { prompt: `How many more ${t.item} are in the ${L(i)} interval than in the ${L(j)} interval?${pic()}`, type: 'number', answer: c[i] - c[j], params: Object.assign(params, { i, j }),
        hints: [`Read both bars: ${L(i)} reaches ${c[i]} and ${L(j)} ${c[j] ? `reaches ${c[j]}` : 'has no bar, so it is 0'}.`, `“How many more” means subtract: ${c[i]} − ${c[j]}.`, `There are <b>${c[i] - c[j]}</b> more.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'display') return q.answer === DISPLAY_JOBS[pr.idx][1] && DISPLAY_JOBS.filter(([, d]) => d === q.answer).length === 1;
      const bars = [...q.prompt.matchAll(/height="([\d.]+)" class="fill" data-px="([\d.]+)" data-bin="(\d+)"/g)].map(m => Math.round(Number(m[1]) / Number(m[2])));
      const lowOf = k => pr.lo + k * pr.w;                               // each bar holds lowOf(k) up to lowOf(k + 1) − 1
      if (pr.kind === 'count') return q.answer === bars[pr.i];
      if (pr.kind === 'most') {
        const best = bars.filter(b => pr.most ? bars.every(o => b >= o) : bars.every(o => b <= o));
        const k = bars.indexOf(best[0]);
        return best.length === 1 && q.answer === `${lowOf(k)}–${lowOf(k + 1) - 1}`;
      }
      if (pr.kind === 'total') { let t = 0; bars.forEach(b => { t += b; }); return q.answer === t; }
      if (pr.kind === 'atleast') return q.answer === bars.reduce((s, b, k) => s + (lowOf(k) >= pr.edge ? b : 0), 0);
      if (pr.kind === 'less') return q.answer === bars.reduce((s, b, k) => s + (lowOf(k + 1) - 1 < pr.edge ? b : 0), 0);
      return q.answer === bars[pr.i] - bars[pr.j] && q.answer > 0;
    },
  });

  function stemPlot(data) {
    const s = data.slice().sort((a, b) => a - b), lo = Math.floor(s[0] / 10), hi = Math.floor(s[s.length - 1] / 10);
    let rows = '';
    for (let st = lo; st <= hi; st++) {
      const leaves = s.filter(v => Math.floor(v / 10) === st).map(v => v % 10);
      rows += `<tr data-stem="${st}"><td style="text-align:right;border:0;border-right:2px solid currentColor;font-weight:700">${st}</td><td style="text-align:left;border:0;letter-spacing:.3em;min-width:9em">${leaves.join(' ')}</td></tr>`;
    }
    const kv = s[Math.floor(s.length / 2)];
    return `<table class="mtable compact" aria-label="stem-and-leaf plot"><thead><tr><th style="border:0;background:none">Stem</th><th style="border:0;background:none;text-align:left">Leaf</th></tr></thead><tbody>${rows}</tbody></table><p class="muted">Key: ${Math.floor(kv / 10)} | ${kv % 10} means ${kv}</p>`;
  }
  const STEM_DATA = [
    { title: 'Quiz scores', item: 'students', lo: 52, hi: 99, atLeast: v => `scored at least ${v}` },
    { title: 'Ages of people at a family reunion', item: 'people', lo: 2, hi: 78, atLeast: v => `are at least ${v} years old` },
    { title: 'Books read in the first 100 days of school', item: 'students', lo: 4, hi: 38, atLeast: v => `read at least ${v} books` },
    { title: 'Heights of students (inches)', item: 'students', lo: 50, hi: 69, atLeast: v => `are at least ${v} inches tall` },
    { title: 'Push-ups done in one minute', item: 'students', lo: 8, hi: 46, atLeast: v => `did at least ${v} push-ups` },
    { title: 'Minutes to finish a puzzle', item: 'people', lo: 12, hi: 58, atLeast: v => `took at least ${v} minutes` },
  ];
  A.skill({
    id: 'g6.stem-and-leaf', title: 'Stem-and-leaf plots',
    learn: p('A <b>stem-and-leaf plot</b> shows every value in a data set. Each value is split into a <b>stem</b>, the tens digit, and a <b>leaf</b>, the ones digit. The stems run down the left side, and <b>each leaf on the right is one value</b>. The key tells you how to read it: 3 | 7 means 37.') +
      p('The leaves in each row are written <b>in order</b>, so the plot lists the data from smallest to largest. That makes it quick to find the least and greatest values, the range, and the <b>median</b>: count the leaves until you reach the middle one.') +
      p('Count every leaf, including repeats: a row 4 | 2 2 5 holds three values, 42, 42 and 45. A stem with no leaves means there are no values in that ten. The <b>mode</b> is the value that appears most often, so look for a leaf repeated in the same row.') +
      example('Example: median and range', `${stemPlot([12, 15, 21, 24, 24, 28, 33])}There are 7 leaves, so the median is the 4th value: 12, 15, 21, <b>24</b>. The range is 33 − 12 = <b>21</b>.`) +
      example('Example: mode and “at least”', `${stemPlot([31, 34, 34, 34, 40, 42, 45, 47, 52])}The leaf 4 appears three times in the 3 row, so the mode is <b>34</b>. The values that are at least 42 are 42, 45, 47 and 52: <b>4 values</b>.`),
    make(rng) {
      const kind = rng.pick(['count', 'extreme', 'stem', 'median', 'median', 'range', 'atleast', 'mode']);
      const t = rng.pick(STEM_DATA), n = rng.int(9, 15);
      let data;
      if (kind === 'mode') {
        const pool = rng.sample(Array.from({ length: t.hi - t.lo + 1 }, (_, i) => t.lo + i), n - 3);
        data = pool.concat([pool[0], pool[0], pool[1]]);
      } else data = Array.from({ length: n }, () => rng.int(t.lo, t.hi));
      const s = data.slice().sort((a, b) => a - b), mn = s[0], mx = s[n - 1];
      const pic = `<p><b>${t.title}</b></p>${stemPlot(data)}`, params = { kind };
      const parts = v => `stem ${Math.floor(v / 10)} and leaf ${v % 10}`;
      if (kind === 'count') {
        const rows = []; for (let st = Math.floor(mn / 10); st <= Math.floor(mx / 10); st++) rows.push(s.filter(v => Math.floor(v / 10) === st).length);
        return { prompt: `How many ${t.item} are shown in the stem-and-leaf plot?${pic}`, type: 'number', answer: n, params,
          hints: ['Each leaf is one value, so count the leaves, including repeats.', `Leaves in each row, from the top: ${rows.join(', ')}.`, `${rows.join(' + ')} = <b>${n}</b>.`] };
      }
      if (kind === 'extreme') {
        const big1 = rng.bool(), v = big1 ? mx : mn;
        return { prompt: `What is the ${big1 ? 'greatest' : 'least'} value in the stem-and-leaf plot?${pic}`, type: 'number', answer: v, params: Object.assign(params, { big: big1 }),
          hints: [`The leaves are in order, so the ${big1 ? 'greatest value is the last leaf in the bottom row' : 'least value is the first leaf in the top row'}.`, `That is ${parts(v)}.`, `Put the stem and leaf together: <b>${v}</b>.`] };
      }
      if (kind === 'stem') {
        const st = Math.floor(rng.pick(s) / 10), row = s.filter(v => Math.floor(v / 10) === st);
        return { prompt: `How many values in the plot are from ${st * 10} to ${st * 10 + 9}?${pic}`, type: 'number', answer: row.length, params: Object.assign(params, { st }),
          hints: [`Every value from ${st * 10} to ${st * 10 + 9} has the stem ${st}.`, `The ${st} row has the leaves ${row.map(v => v % 10).join(', ')}: that is ${M.list(row.map(String))}.`, `There ${row.length === 1 ? 'is' : 'are'} <b>${row.length}</b>.`] };
      }
      if (kind === 'median') {
        const odd = n % 2 === 1, a = s[Math.floor((n - 1) / 2)], b = s[Math.floor(n / 2)], med = (a + b) / 2;
        return { prompt: `What is the median of the data in the stem-and-leaf plot?${pic}`, type: 'number', answer: med, params,
          hints: [`The leaves are already in order. There are ${n} values, so the median is ${odd ? `the ${M.ordinal((n + 1) / 2)} value` : `halfway between the ${M.ordinal(n / 2)} and ${M.ordinal(n / 2 + 1)} values`}.`,
            `Count from the smallest: ${s.slice(0, Math.floor(n / 2) + 1).join(', ')}.`, odd ? `The ${M.ordinal((n + 1) / 2)} value is <b>${a}</b>.` : `The middle two are ${a} and ${b}, so the median is <b>${N(med)}</b>.`] };
      }
      if (kind === 'range') {
        return { prompt: `What is the range of the data in the stem-and-leaf plot?${pic}`, type: 'number', answer: mx - mn, params,
          hints: [`The range is the greatest value minus the least value.`, `The least is the first leaf in the top row, ${mn}. The greatest is the last leaf in the bottom row, ${mx}.`, `${mx} − ${mn} = <b>${mx - mn}</b>.`] };
      }
      if (kind === 'atleast') {
        const v = rng.int(mn + 1, mx), hit = s.filter(x => x >= v);
        return { prompt: `How many ${t.item} ${t.atLeast(v)}?${pic}`, type: 'number', answer: hit.length, params: Object.assign(params, { v }),
          hints: [`“At least ${v}” means ${v} or more.`, `The values that are ${v} or more: ${hit.join(', ')}.`, `There ${hit.length === 1 ? 'is' : 'are'} <b>${hit.length}</b>.`] };
      }
      const m = data[n - 3];
      return { prompt: `What is the mode of the data in the stem-and-leaf plot?${pic}`, type: 'number', answer: m, params,
        hints: ['The mode is the value that appears most often. Look for a leaf repeated in the same row.', `${m} appears 3 times (${parts(m)}). No other value appears more than twice.`, `The mode is <b>${m}</b>.`] };
    },
    verify(q) {
      const vals = [];                                                    // read the values back off the plot
      for (const m of q.prompt.matchAll(/<tr data-stem="(\d+)"><td[^>]*>\d+<\/td><td[^>]*>([\d ]*)<\/td><\/tr>/g)) m[2].split(' ').filter(Boolean).forEach(l => vals.push(10 * Number(m[1]) + Number(l)));
      const pr = q.params, a = q.answer;
      if (pr.kind === 'count') return a === vals.length;
      if (pr.kind === 'extreme') return a === (pr.big ? Math.max(...vals) : Math.min(...vals));
      if (pr.kind === 'stem') return a === vals.filter(v => v >= 10 * pr.st && v < 10 * pr.st + 10).length;
      if (pr.kind === 'median') { const below = vals.filter(v => v < a).length, above = vals.filter(v => v > a).length; return Math.abs(below - above) <= vals.length - below - above; }
      if (pr.kind === 'range') return a === Math.max(...vals) - Math.min(...vals);
      if (pr.kind === 'atleast') return a === vals.filter(v => v >= pr.v).length;
      const freq = {}; vals.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
      const top = Math.max(...Object.values(freq));
      return freq[a] === top && Object.values(freq).filter(f => f === top).length === 1;
    },
  });

  /* ---------- Unit 13: Logic puzzles and Venn diagrams ---------- */
  const LOGIC = [
    { what: 'instruments', items: ['drums', 'flute', 'guitar', 'violin', 'trumpet'], art: i => 'the ' + i, intro: (ns, it) => `${ns} each play a different instrument: ${it}.`,
      pos: (n, i) => `${n} plays the ${i}.`, neg: (n, i) => `${n} does not play the ${i}.`, nei: (a, b, i) => `Neither ${a} nor ${b} plays the ${i}.`, ask: i => `Who plays the ${i}?` },
    { what: 'pets', items: ['cat', 'dog', 'hamster', 'parrot', 'turtle'], art: i => 'a ' + i, intro: (ns, it) => `${ns} each have a different pet: ${it}.`,
      pos: (n, i) => `${n} has the ${i}.`, neg: (n, i) => `${n} does not have the ${i}.`, nei: (a, b, i) => `Neither ${a} nor ${b} has the ${i}.`, ask: i => `Who has the ${i}?` },
    { what: 'fruits', items: ['apple', 'banana', 'orange', 'pear', 'plum'], art: i => (/^[aeiou]/.test(i) ? 'an ' : 'a ') + i, intro: (ns, it) => `${ns} each brought a different fruit for lunch: ${it}.`,
      pos: (n, i) => `${n} brought the ${i}.`, neg: (n, i) => `${n} did not bring the ${i}.`, nei: (a, b, i) => `Neither ${a} nor ${b} brought the ${i}.`, ask: i => `Who brought the ${i}?` },
    { what: 'clubs', items: ['art', 'chess', 'drama', 'robotics', 'science'], art: i => i, intro: (ns, it) => `${ns} each joined a different club: ${it}.`,
      pos: (n, i) => `${n} is in the ${i} club.`, neg: (n, i) => `${n} is not in the ${i} club.`, nei: (a, b, i) => `Neither ${a} nor ${b} is in the ${i} club.`, ask: i => `Who is in the ${i} club?` },
  ];
  /** every way to give k people k different items: perm[person] = item */
  function permutations(k) {
    const out = [], rec = (pre, rest) => { if (!rest.length) out.push(pre); rest.forEach((v, j) => rec(pre.concat(v), rest.filter((_, m) => m !== j))); };
    rec([], [...Array(k).keys()]);
    return out;
  }
  const clueFits = (perm, c) => c.t === 'pos' ? perm[c.p] === c.i : c.t === 'neg' ? perm[c.p] !== c.i : perm[c.p] !== c.i && perm[c.q] !== c.i;
  /** solve the grid the way a student would: cross out, then fill any row or column with one box left */
  function gridSteps(k, clues) {
    const can = Array.from({ length: k }, () => Array(k).fill(true)), owner = Array(k).fill(-1), steps = [];
    const fix = (p, i, why) => { owner[i] = p; for (let j = 0; j < k; j++) { if (j !== i) can[p][j] = false; if (j !== p) can[j][i] = false; } steps.push({ p, i, why }); };
    clues.forEach(c => { if (c.t === 'neg') can[c.p][c.i] = false; if (c.t === 'nei') { can[c.p][c.i] = false; can[c.q][c.i] = false; } });
    clues.filter(c => c.t === 'pos').forEach(c => fix(c.p, c.i, 'clue'));
    for (let moved = true; moved;) {
      moved = false;
      for (let p = 0; p < k; p++) { const left = can[p].map((v, i) => v ? i : -1).filter(i => i >= 0); if (left.length === 1 && owner[left[0]] < 0) { fix(p, left[0], 'row'); moved = true; } }
      for (let i = 0; i < k; i++) { const left = can.map((row, p) => row[i] ? p : -1).filter(p => p >= 0); if (left.length === 1 && owner[i] < 0) { fix(left[0], i, 'col'); moved = true; } }
    }
    return owner.every(p => p >= 0) ? steps : null;
  }
  A.skill({
    id: 'g6.logic-puzzles', title: 'Logic puzzles',
    learn: p('In a logic puzzle, every person gets a different item, and the clues tell you what is <b>not</b> true as well as what is. A <b>grid</b> keeps track of it all: names down the side, items across the top.') +
      p('Put an <b>✗</b> in a box for each “not” clue. Every row and every column ends up with exactly <b>one ✓</b>, so <b>when a row or a column has only one empty box left, that box must be the ✓</b>. Then cross out the rest of that row and column, and look again.') +
      p('Keep going until every row has its ✓. Check your answer against every clue before you finish.') +
      example('Example: “not” clues', `<p><b>Ana, Ben and Chloe each have a different pet: a cat, a dog and a fish.</b></p>Clues: Ana does not have the dog. Ben has neither the dog nor the cat. Ben’s row now has only the fish box left, so Ben has the fish. The dog column has only Chloe’s box left, so Chloe has the dog, and <b>Ana has the cat</b>.${M.table(['', 'Cat', 'Dog', 'Fish'], [['<b>Ana</b>', '✓', '✗', '✗'], ['<b>Ben</b>', '✗', '✗', '✓'], ['<b>Chloe</b>', '✗', '✓', '✗']])}`) +
      example('Example: a clue that says yes', `<p><b>Dev, Iris and Omar each joined a different club: art, chess or drama.</b></p>Clues: Iris is in the chess club. Dev is not in the art club. Put a ✓ for Iris and chess, then cross out the rest of Iris’s row and the chess column. Dev’s row now has only drama left, so Dev is in drama, and <b>Omar is in the art club</b>.`),
    make(rng) {
      const t = rng.pick(LOGIC);
      for (let tries = 0; ; tries++) {
        const k = tries > 30 || rng.chance(0.65) ? 3 : 4, names = rng.sample(NAMES, k), items = rng.sample(t.items, k), sol = rng.shuffle([...Array(k).keys()]);
        let cands = [];
        for (let pp = 0; pp < k; pp++) for (let i = 0; i < k; i++) if (sol[pp] !== i) cands.push({ t: 'neg', p: pp, i });
        for (let i = 0; i < k; i++) for (let pp = 0; pp < k; pp++) for (let q = pp + 1; q < k; q++) if (sol[pp] !== i && sol[q] !== i && rng.chance(0.5)) cands.push({ t: 'nei', p: pp, q, i });
        cands = rng.shuffle(cands);
        if (k === 4 && rng.chance(0.5)) { const pp = rng.int(0, k - 1); cands.unshift({ t: 'pos', p: pp, i: sol[pp] }); }
        let alive = permutations(k);
        const clues = [], known = new Set();
        for (const c of cands) {
          const facts = c.t === 'nei' ? [`${c.p}:${c.i}`, `${c.q}:${c.i}`] : [`${c.p}:${c.i}`];
          if (facts.some(f => known.has(f))) continue;                     // never repeat what an earlier clue said
          const left = alive.filter(pm => clueFits(pm, c));
          if (left.length < alive.length) { clues.push(c); alive = left; facts.forEach(f => known.add(f)); }
          if (alive.length === 1) break;
        }
        const steps = gridSteps(k, clues), deduced = steps ? steps.filter(s => s.why !== 'clue') : [];
        if (!steps || !deduced.length || clues.length > (k === 3 ? 4 : 6)) continue;
        const target = rng.pick(deduced), upTo = steps.slice(0, steps.indexOf(target));
        const say = s => s.why === 'clue' ? `The clue says ${t.pos(names[s.p], items[s.i]).replace(/\.$/, '')}, so cross out the rest of that row and column.`
          : s.why === 'row' ? `${names[s.p]}’s row has only the ${items[s.i]} box left, so ${t.pos(names[s.p], items[s.i])}` : `The ${items[s.i]} column has only ${names[s.p]}’s box left, so ${t.pos(names[s.p], items[s.i])}`;
        const text = c => c.t === 'pos' ? t.pos(names[c.p], items[c.i]) : c.t === 'neg' ? t.neg(names[c.p], items[c.i]) : t.nei(names[c.p], names[c.q], items[c.i]);
        const answer = names[target.p], last = say(target).replace(t.pos(names[target.p], items[target.i]), t.pos(`<b>${answer}</b>`, items[target.i]));
        return { prompt: `${t.intro(M.list(names), M.list(items.map(t.art)))}<ul>${rng.shuffle(clues).map(c => `<li>${text(c)}</li>`).join('')}</ul><b>${t.ask(items[target.i])}</b>`, type: 'choice', answer, choices: names.slice(),
          params: { k, clues, ask: target.i, names },
          hints: [`Draw a grid with the names down the side and the ${t.what} across the top. Put an ✗ in a box for every “not” or “neither” clue${clues.some(c => c.t === 'pos') ? ', and a ✓ for the clue that says who has what' : ''}.`,
            `Each row and each column gets exactly one ✓, so look for a row or column with only one empty box. ${upTo.map(say).join(' ')}`.trim(), last] };
      }
    },
    verify(q) {
      const { k, clues, ask, names } = q.params;
      const fit = permutations(k).filter(pm => clues.every(c => clueFits(pm, c)));   // every way to hand out the items, checked against every clue
      return fit.length === 1 && q.answer === names[fit[0].indexOf(ask)];
    },
  });

  function vennSvg(la, lb, nums) {
    const cy = 116;
    let g = `<rect x="6" y="6" width="348" height="212" rx="10" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
    g += `<circle cx="135" cy="${cy}" r="80" fill="var(--primary-soft)" fill-opacity="0.7"/><circle cx="225" cy="${cy}" r="80" fill="var(--primary-soft)" fill-opacity="0.7"/>`;
    g += `<circle cx="135" cy="${cy}" r="80" fill="none" stroke="var(--primary)" stroke-width="2"/><circle cx="225" cy="${cy}" r="80" fill="none" stroke="var(--primary)" stroke-width="2"/>`;
    g += `<text x="96" y="27" text-anchor="middle" font-size="13" font-weight="700">${la}</text><text x="264" y="27" text-anchor="middle" font-size="13" font-weight="700">${lb}</text>`;
    if (nums) {
      const at = [[98, 'a'], [180, 'ab'], [262, 'b']];
      at.forEach(([x, r], j) => { g += `<text x="${x}" y="${cy + 7}" text-anchor="middle" font-size="20" font-weight="700" data-r="${r}">${nums[j]}</text>`; });
      g += `<text x="340" y="208" text-anchor="end" font-size="20" font-weight="700" data-r="out">${nums[3]}</text>`;
    }
    return `<svg class="figure" viewBox="0 0 360 224" width="360" role="img" aria-label="a Venn diagram with two overlapping circles, ${la} and ${lb}">${g}</svg>`;
  }
  const VENN_SURVEYS = [
    { who: 'students', A: 'Soccer', B: 'Piano', intro: 'Students were asked whether they play soccer and whether they play piano.', onlyA: 'play soccer but not piano', onlyB: 'play piano but not soccer', both: 'play both soccer and piano', allA: 'play soccer', allB: 'play piano', none: 'play neither soccer nor piano', any: 'play soccer, piano or both' },
    { who: 'students', A: 'Has a dog', B: 'Has a cat', intro: 'Students were asked whether they have a dog and whether they have a cat.', onlyA: 'have a dog but not a cat', onlyB: 'have a cat but not a dog', both: 'have both a dog and a cat', allA: 'have a dog', allB: 'have a cat', none: 'have neither a dog nor a cat', any: 'have a dog, a cat or both' },
    { who: 'people', A: 'Likes apples', B: 'Likes grapes', intro: 'People at a picnic were asked whether they like apples and whether they like grapes.', onlyA: 'like apples but not grapes', onlyB: 'like grapes but not apples', both: 'like both apples and grapes', allA: 'like apples', allB: 'like grapes', none: 'like neither apples nor grapes', any: 'like apples, grapes or both' },
    { who: 'students', A: 'Speaks Spanish', B: 'Speaks French', intro: 'Students were asked whether they speak Spanish and whether they speak French.', onlyA: 'speak Spanish but not French', onlyB: 'speak French but not Spanish', both: 'speak both Spanish and French', allA: 'speak Spanish', allB: 'speak French', none: 'speak neither Spanish nor French', any: 'speak Spanish, French or both' },
    { who: 'campers', A: 'Swimming', B: 'Hiking', intro: 'Campers signed up for swimming, hiking, both or neither.', onlyA: 'signed up for swimming but not hiking', onlyB: 'signed up for hiking but not swimming', both: 'signed up for both swimming and hiking', allA: 'signed up for swimming', allB: 'signed up for hiking', none: 'signed up for neither swimming nor hiking', any: 'signed up for swimming, hiking or both' },
  ];
  // number properties for sorting; each test is plain arithmetic, so where a number goes is never in doubt
  const PROPS = {
    m3: { label: 'Multiples of 3', k: 3, test: v => v % 3 === 0 }, m4: { label: 'Multiples of 4', k: 4, test: v => v % 4 === 0 }, m5: { label: 'Multiples of 5', k: 5, test: v => v % 5 === 0 }, m6: { label: 'Multiples of 6', k: 6, test: v => v % 6 === 0 },
    even: { label: 'Even numbers', test: v => v % 2 === 0 }, odd: { label: 'Odd numbers', test: v => v % 2 === 1 },
    f24: { label: 'Factors of 24', of: 24, test: v => 24 % v === 0 }, f30: { label: 'Factors of 30', of: 30, test: v => 30 % v === 0 }, f36: { label: 'Factors of 36', of: 36, test: v => 36 % v === 0 },
    prime: { label: 'Prime numbers', test: v => v > 1 && factorsOf(v).length === 2 }, gt20: { label: 'Greater than 20', gt: 20, test: v => v > 20 },
  };
  const PROP_PAIRS = [['m3', 'even'], ['m4', 'm6'], ['f24', 'f36'], ['prime', 'odd'], ['gt20', 'm5'], ['m5', 'even'], ['f30', 'even'], ['m3', 'm4']];
  function whyProp(key, v) {
    const pr = PROPS[key], yes = pr.test(v);
    if (pr.k) return yes ? `${v} = ${pr.k} × ${v / pr.k}, so it is a multiple of ${pr.k}` : `${v} ÷ ${pr.k} leaves a remainder, so it is not a multiple of ${pr.k}`;
    if (pr.of) return yes ? `${pr.of} ÷ ${v} = ${pr.of / v}, so ${v} is a factor of ${pr.of}` : `${pr.of} ÷ ${v} leaves a remainder, so ${v} is not a factor of ${pr.of}`;
    if (key === 'prime') { const f = factorsOf(v)[1]; return yes ? `${v} has only two factors, 1 and ${v}, so it is prime` : `${v} = ${f} × ${v / f}, so it is not prime`; }
    if (pr.gt) return yes ? `${v} is greater than ${pr.gt}` : `${v} is not greater than ${pr.gt}`;
    const even = v % 2 === 0;
    return `${v} ${even ? 'can' : 'cannot'} be split into two equal whole numbers, so it is ${even ? 'even' : 'odd'}${key === 'even' ? (even ? '' : ', not even') : (even ? ', not odd' : '')}`;
  }
  const PLACES = ['Only in circle A', 'Only in circle B', 'In both circles (the overlap)', 'Outside both circles'];
  A.skill({
    id: 'g6.venn-diagrams', title: 'Venn diagrams',
    learn: p('A <b>Venn diagram</b> sorts things into overlapping circles. Each circle is one group. The <b>overlap</b>, where the circles cross, holds everything that belongs to <b>both</b> groups, and anything in <b>neither</b> group goes outside the circles, inside the rectangle.') +
      p('“<b>Only</b> A” means the part of circle A outside the overlap. “<b>All</b> of A” means the whole circle, so add its two parts: only A plus the overlap. To find the total, add all four numbers.') +
      p('To place a number, test it against each circle in turn. If it fits both, it goes in the overlap.') +
      example('Example: reading a Venn diagram', `${vennSvg('Soccer', 'Piano', [7, 3, 5, 4])}3 students play both. 7 + 3 = <b>10</b> play soccer. 7 + 3 + 5 + 4 = <b>19</b> students were asked.`) +
      example('Example: placing numbers', `${big('Circle A: multiples of 4. Circle B: multiples of 6.')}12 = 4 × 3 and 12 = 6 × 2, so 12 goes <b>in the overlap</b>. 8 is a multiple of 4 but not of 6, so it goes <b>only in circle A</b>. 9 is neither, so it goes <b>outside both circles</b>.`),
    make(rng) {
      const kind = rng.pick(['read', 'read', 'read', 'place', 'place']);
      if (kind === 'place') {
        const [ka, kb] = rng.pick(PROP_PAIRS), pa = PROPS[ka], pb = PROPS[kb];
        const region = v => pa.test(v) ? (pb.test(v) ? 2 : 0) : (pb.test(v) ? 1 : 3);
        const pool = Array.from({ length: 39 }, (_, i) => i + 2), regs = [0, 1, 2, 3].filter(r => pool.some(v => region(v) === r));
        const r = rng.pick(regs), v = rng.pick(pool.filter(x => region(x) === r)), answer = PLACES[r];
        return { prompt: `Where does the number <b>${v}</b> belong in this Venn diagram?${vennSvg('A: ' + pa.label, 'B: ' + pb.label, null)}`, type: 'choice', answer, choices: PLACES.slice(), keepOrder: true, params: { kind, ka, kb, v },
          hints: [`Circle A is ${pa.label.toLowerCase()}: ${whyProp(ka, v)}.`, `Circle B is ${pb.label.toLowerCase()}: ${whyProp(kb, v)}.`, `So ${v} goes here: <b>${answer}</b>.`] };
      }
      const s = rng.pick(VENN_SURVEYS), nums = [rng.int(2, 15), rng.int(1, 9), rng.int(2, 15), rng.int(0, 9)], [a, ab, b, out] = nums;
      const ask = rng.pick(['both', 'onlyA', 'onlyB', 'allA', 'allB', 'none', 'any', 'total']);
      const Q = {
        both: [ab, [`The overlap, where the circles cross, holds the ${s.who} in both groups.`, `The number in the overlap is ${ab}.`]],
        onlyA: [a, [`“Only” means the part of the ${s.A} circle outside the overlap.`, `That part shows ${a}.`]],
        onlyB: [b, [`“Only” means the part of the ${s.B} circle outside the overlap.`, `That part shows ${b}.`]],
        allA: [a + ab, [`Everyone inside the ${s.A} circle counts, including the overlap.`, `Add the two parts of that circle: ${a} + ${ab}.`]],
        allB: [b + ab, [`Everyone inside the ${s.B} circle counts, including the overlap.`, `Add the two parts of that circle: ${b} + ${ab}.`]],
        none: [out, [`${s.who[0].toUpperCase() + s.who.slice(1)} in neither group are outside both circles, but inside the rectangle.`, `The number outside the circles is ${out}.`]],
        any: [a + ab + b, [`Everyone inside at least one circle counts: the three numbers inside the circles.`, `${a} + ${ab} + ${b}.`]],
        total: [a + ab + b + out, [`Everyone asked is somewhere in the rectangle, so add all four numbers.`, `${a} + ${ab} + ${b} + ${out}.`]],
      }[ask];
      const phrase = ask === 'total' ? 'were asked in all' : s[ask];
      return { prompt: `${s.intro} The Venn diagram shows the results. How many ${s.who} ${phrase}?${vennSvg(s.A, s.B, nums)}`, type: 'number', answer: Q[0], params: { kind, ask },
        hints: Q[1].concat(`<b>${Q[0]}</b> ${s.who} ${phrase}.`) };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'place') {
        const inSet = (key, v) => { const P = PROPS[key]; if (P.k) { for (let m = P.k; m <= v; m += P.k) if (m === v) return true; return false; } if (P.of) return Number.isInteger(P.of / v);
          if (key === 'prime') { for (let d = 2; d * d <= v; d++) if (v % d === 0) return false; return v > 1; } if (P.gt) return v > P.gt; return (v % 2 === 0) === (key === 'even'); };
        const A1 = inSet(pr.ka, pr.v), B1 = inSet(pr.kb, pr.v);
        return q.answer === (A1 && B1 ? PLACES[2] : A1 ? PLACES[0] : B1 ? PLACES[1] : PLACES[3]);
      }
      const r = {}; for (const m of q.prompt.matchAll(/data-r="(\w+)">(\d+)</g)) r[m[1]] = Number(m[2]);     // read the regions off the drawing
      const want = { both: r.ab, onlyA: r.a, onlyB: r.b, allA: r.a + r.ab, allB: r.b + r.ab, none: r.out, any: r.a + r.ab + r.b, total: r.a + r.ab + r.b + r.out }[pr.ask];
      return q.answer === want;
    },
  });


  /* ---------- Math in everyday life ---------- */
  const money = x => '$' + x.toFixed(2);
  A.skill({
    id: 'g6.percent-in-head', title: 'Percents in your head: tips and discounts',
    learn: p('Start from <b>10%</b>: move the decimal point one place left (10% of $48 is $4.80). From there: <b>20%</b> is double 10%, <b>5%</b> is half of 10%, and <b>15%</b> is 10% plus 5%. <b>25%</b> is a quarter, and <b>1%</b> moves the point two places.') +
      p('This is how people work out a tip or a discount at a glance. For a sale price, take the discount away from the price.') +
      example('Example: a tip', `${big('A $48 meal: what is a 15% tip?')}10% is $4.80, and 5% is half of that, $2.40. So 15% is $4.80 + $2.40 = <b>$7.20</b>.`) +
      example('Example: a sale price', `${big('A $35 backpack is 20% off.')}10% of $35 is $3.50, so 20% is $7.00. Take it off the price: $35.00 − $7.00 = <b>$28.00</b>.`) +
      example('Example: 25% and 30%', `${big('25% and 30% of $36')}25% is a quarter: $36 ÷ 4 = <b>$9.00</b>. 30% is three times 10%: 3 × $3.60 = <b>$10.80</b>.`),
    make(rng) {
      const kind = rng.pick(['tip15', 'tip20', 'off25', 'pct5', 'pct30', 'sale']);
      let price, ans, prompt, hints;
      if (kind === 'tip15') { price = rng.int(6, 40) * 4; const t = price / 10, f = t / 2; ans = t + f; prompt = `${rng.pick(['A meal', 'A pizza delivery', 'A family dinner', 'A taxi ride'])} costs ${money(price)}. Work out a 15% tip in your head.`; hints = [`10% of ${money(price)} is ${money(t)}.`, `5% is half of 10%: ${money(f)}.`, `15% = ${money(t)} + ${money(f)} = <b>${money(ans)}</b>.`]; }
      else if (kind === 'tip20') { price = rng.int(12, 90) * 2; const t = price / 10; ans = 2 * t; prompt = `${rng.pick(['A haircut', 'A restaurant bill', 'A food delivery', 'A car wash'])} costs ${money(price)}. What is a 20% tip?`; hints = [`10% of ${money(price)} is ${money(t)}.`, '20% is double 10%.', `2 × ${money(t)} = <b>${money(ans)}</b>.`]; }
      else if (kind === 'off25') { price = rng.int(5, 40) * 4; ans = price / 4; prompt = `${rng.pick(['A jacket', 'A backpack', 'A lamp', 'A soccer ball'])} costs ${money(price)} and is 25% off. How much is taken off the price?`; hints = ['25% is one quarter.', `Divide by 4: ${money(price)} ÷ 4.`, `<b>${money(ans)}</b> is taken off.`]; }
      else if (kind === 'pct5') { price = rng.int(10, 99) * 2; ans = price / 20; prompt = `Sales tax is 5%. How much tax is added to a ${money(price)} ${rng.pick(['bike helmet', 'desk chair', 'rain jacket', 'board game'])}?`; hints = [`10% of ${money(price)} is ${money(price / 10)}.`, '5% is half of 10%.', `Half of ${money(price / 10)} is <b>${money(ans)}</b>.`]; }
      else if (kind === 'pct30') { price = rng.int(5, 60) * 10; ans = price * 3 / 10; prompt = `${rng.pick(['A game', 'A bookshelf', 'A guitar', 'A camping stove'])} costs ${money(price)}. How much is 30% of the price?`; hints = [`10% of ${money(price)} is ${money(price / 10)}.`, '30% is three times 10%.', `3 × ${money(price / 10)} = <b>${money(ans)}</b>.`]; }
      else { price = rng.int(4, 30) * 10; const off = price / 10 * 2; ans = price - off; const [what, are] = rng.pick([['Sneakers cost', 'They are'], ['A coat costs', 'It’s'], ['Headphones cost', 'They are'], ['A scooter costs', 'It’s']]); prompt = `${what} ${money(price)}. ${are} 20% off. What is the sale price?`; hints = [`10% of ${money(price)} is ${money(price / 10)}, so 20% is ${money(off)}.`, `Take the discount off the price: ${money(price)} − ${money(off)}.`, `The sale price is <b>${money(ans)}</b>.`]; }
      return { prompt, type: 'number', unit: '$', answer: Math.round(ans * 100) / 100, params: { kind, price }, hints };
    },
    verify(q) {
      const { kind, price } = q.params, want = { tip15: price * 0.15, tip20: price * 0.2, off25: price * 0.25, pct5: price * 0.05, pct30: price * 0.3, sale: price * 0.8 }[kind];
      return Math.abs(q.answer - want) < 1e-9;
    },
  });

  const RECIPES = [['pancakes', 'cups of flour', 'pancakes'], ['muffins', 'cups of milk', 'muffins'], ['lemonade', 'cups of lemon juice', 'glasses'], ['granola bars', 'cups of oats', 'bars'], ['soup', 'teaspoons of salt', 'bowls'], ['cookies', 'cups of sugar', 'cookies']];
  A.skill({
    id: 'g6.recipe-scaling', title: 'Scaling a recipe',
    learn: p('A recipe is a <b>ratio</b>: the amounts stay in proportion when you make more or less. Find the <b>scale factor</b>, the new number of servings divided by the old, and multiply every amount by it.') +
      p('Another way: find the amount for <b>one serving</b> (divide), then multiply by the servings you want. Both give the same answer. Quarter and half amounts are common, like 1.5 cups.') +
      example('Example: the scale factor', `${big('A recipe for 4 servings uses 3 cups of flour. How much for 6 servings?')}The scale factor is 6 ÷ 4 = 1.5, and 3 × 1.5 = <b>4.5 cups</b>.`) +
      example('Example: one serving first', `${big('A recipe for 8 muffins uses 2 cups of milk. How much for 12 muffins?')}For one muffin: 2 ÷ 8 = 0.25 cup. For 12 muffins: 0.25 × 12 = <b>3 cups</b>.`) +
      example('Example: making less', `${big('A soup for 6 bowls uses 1.5 teaspoons of salt. How much for 4 bowls?')}The scale factor is 4 ÷ 6 = ${F(2, 3)}, so 1.5 × ${F(2, 3)} = 3 ÷ 3 = <b>1 teaspoon</b>.`),
    make(rng) {
      const [dish, what, unit] = rng.pick(RECIPES);
      let from, to, amt;
      do { from = rng.pick([2, 3, 4, 6, 8, 12]); to = rng.pick([2, 3, 4, 6, 8, 9, 12, 16, 18, 24]); amt = rng.pick([1, 1.5, 2, 2.5, 3, 4, 0.5, 0.75]); }
      while (to === from || Math.abs(Math.round(amt * to / from * 4) - amt * to / from * 4) > 1e-9);
      const ans = amt * to / from;
      const name = rng.pick(NAMES);
      return { prompt: `${name}'s recipe for ${dish} makes ${from} ${unit} and uses ${M.n(amt)} ${what}. How many ${what} are needed for ${to} ${unit}?`, type: 'number', answer: Math.round(ans * 100) / 100, params: { from, to, amt },
        hints: [`The scale factor is ${to} ÷ ${from} = ${M.n(Math.round(to / from * 1000) / 1000)}.`, `Multiply the amount by it: ${M.n(amt)} × ${to} ÷ ${from}.`, `${M.n(amt)} × ${to} = ${M.n(amt * to)}, and ${M.n(amt * to)} ÷ ${from} = <b>${M.n(ans)}</b>.`] };
    },
    verify(q) { const { from, to, amt } = q.params; return Math.abs(q.answer - amt * to / from) < 1e-9; },
  });

  A.skill({
    id: 'g6.money-plans', title: 'Planning with money',
    learn: p('Money problems often take <b>two or three steps</b>. Write down what you know, then decide the order: find a total cost first, or how much is still needed, before dividing or subtracting.') +
      p('When saving up, find how much is <b>still needed</b>, then divide by the amount saved each week. If it doesn’t divide evenly, you need <b>one more week</b>, because you can’t buy it until you have enough.') +
      example('Example: saving up', `${big('A $126 bike. You have $30 and save $12 a week. How many weeks?')}Still needed: $126 − $30 = $96. Then 96 ÷ 12 = <b>8 weeks</b>.`) +
      example('Example: when it doesn’t divide evenly', `${big('A $100 tent. You have $25 and save $10 a week.')}Still needed: $100 − $25 = $75. 75 ÷ 10 = 7.5, but after 7 weeks you’d still be $5 short, so it takes <b>8 weeks</b>.`) +
      example('Example: spending', `${big('You have $20. You buy 3 notebooks at $2.25 each and a pen for $1.40.')}Notebooks: 3 × $2.25 = $6.75. With the pen: $6.75 + $1.40 = $8.15. Left over: $20.00 − $8.15 = <b>$11.85</b>.`),
    make(rng) {
      const name = rng.pick(NAMES);
      if (rng.bool()) {
        const per = rng.pick([5, 6, 8, 10, 12, 15, 20]), have = rng.int(0, 8) * 5, weeks = rng.int(3, 12), extra = rng.pick([0, 0, rng.int(1, per - 1)]);
        const goal = have + per * weeks - (extra ? per - extra : 0), need = goal - have, ans = Math.ceil(need / per);
        const item = rng.pick(['bike', 'video game', 'pair of headphones', 'skateboard', 'telescope', 'tablet case']);
        return { prompt: `${name} wants a ${item} that costs ${money(goal)}. ${name} has ${money(have)} saved and saves ${money(per)} each week. How many weeks until ${name} has enough?`, type: 'number', answer: ans, params: { kind: 'save', goal, have, per },
          hints: [`Still needed: ${money(goal)} − ${money(have)} = ${money(need)}.`, `Divide by the weekly saving: ${need} ÷ ${per} = ${M.n(Math.round(need / per * 100) / 100)}.`, `${need % per ? 'It doesn’t divide evenly, so round up: ' : ''}<b>${ans}</b> weeks.`] };
      }
      const start = rng.int(4, 12) * 5, n = rng.int(2, 5), each = rng.pick([1.25, 2.5, 3.75, 4.5, 2.25, 1.75]), other = rng.pick([1.8, 2.4, 3.6, 0.95, 1.5]);
      const ans = Math.round((start - n * each - other) * 100) / 100;
      if (ans <= 0) return this.make(rng);
      const things = rng.pick([['notebooks', 'a pen'], ['packs of cards', 'a drink'], ['comic books', 'a bookmark'], ['bags of seeds', 'a watering can']]);
      return { prompt: `${name} has ${money(start)}. ${name} buys ${n} ${things[0]} at ${money(each)} each and ${things[1]} for ${money(other)}. How much money is left?`, type: 'number', unit: '$', answer: ans, params: { kind: 'spend', start, n, each, other },
        hints: [`The ${things[0]} cost ${n} × ${money(each)} = ${money(n * each)}.`, `Add ${things[1]}: ${money(n * each)} + ${money(other)} = ${money(n * each + other)}.`, `${money(start)} − ${money(n * each + other)} = <b>${money(ans)}</b>.`] };
    },
    verify(q) { const P = q.params; return P.kind === 'save' ? q.answer === Math.ceil((P.goal - P.have) / P.per) : Math.abs(q.answer - (P.start - P.n * P.each - P.other)) < 1e-9; },
  });

  /* ---------- double bar graphs ---------- */
  const PAIRS = [{ title: 'Books read', a: 'Class A', b: 'Class B', cats: ['Sept', 'Oct', 'Nov', 'Dec'], what: 'books' }, { title: 'Goals scored', a: 'Hawks', b: 'Owls', cats: ['Game 1', 'Game 2', 'Game 3', 'Game 4'], what: 'goals' },
    { title: 'Favorite fruit', a: 'Grade 5', b: 'Grade 6', cats: ['Apple', 'Banana', 'Grape', 'Mango'], what: 'votes' }, { title: 'Hours of practice', a: 'Piano', b: 'Soccer', cats: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], what: 'hours' }];
  function doubleBars(g, as, bs) {
    const max = 12, uy = 13, x0 = 34, y0 = 34 + max * uy, bw = 20, gap = 24, W = x0 + g.cats.length * (2 * bw + gap) + 14;
    let s = `<svg class="figure" viewBox="0 0 ${W} ${y0 + 54}" width="${W}" height="${y0 + 54}" role="img" aria-label="double bar graph: ${g.title}"><text x="${W / 2}" y="14" text-anchor="middle" font-size="13" font-weight="700">${g.title}</text>`;
    for (let v = 0; v <= max; v += 2) s += `<line class="light" x1="${x0}" y1="${y0 - v * uy}" x2="${W - 6}" y2="${y0 - v * uy}" style="stroke-width:1"/><text x="${x0 - 6}" y="${y0 - v * uy + 4}" text-anchor="end" font-size="11">${v}</text>`;
    g.cats.forEach((c, i) => {
      const x = x0 + gap / 2 + i * (2 * bw + gap);
      s += `<rect class="fill" x="${x}" y="${y0 - as[i] * uy}" width="${bw}" height="${as[i] * uy}"/><rect class="fill2" x="${x + bw}" y="${y0 - bs[i] * uy}" width="${bw}" height="${bs[i] * uy}"/><text x="${x + bw}" y="${y0 + 16}" text-anchor="middle" font-size="11">${c}</text>`;
    });
    const ly = y0 + 38;
    s += `<rect class="fill" x="${x0}" y="${ly - 10}" width="12" height="12"/><text x="${x0 + 18}" y="${ly}" font-size="11">${g.a}</text><rect class="fill2" x="${x0 + 90}" y="${ly - 10}" width="12" height="12"/><text x="${x0 + 108}" y="${ly}" font-size="11">${g.b}</text>`;
    return s + `<line class="stroke" x1="${x0}" y1="${y0}" x2="${W - 6}" y2="${y0}"/><line class="stroke" x1="${x0}" y1="28" x2="${x0}" y2="${y0}"/></svg>`;
  }
  A.skill({
    id: 'g6.double-bar-graphs', title: 'Reading double bar graphs',
    learn: p('A <b>double bar graph</b> compares two groups side by side. The key shows which shade is which group. For each category on the bottom, there is one bar for each group.') +
      p('Read each bar by following its top across to the scale. To compare the groups in one category, <b>subtract</b> the shorter bar from the taller one; to find a group’s total, <b>add</b> its bars across all the categories.') +
      example('Example: comparing one category', `${doubleBars(PAIRS[0], [5, 8, 6, 9], [7, 5, 6, 10])}In Oct, Class A read 8 books and Class B read 5, so Class A read 8 − 5 = <b>3</b> more books that month.`) +
      example('Example: a total, and the biggest gap', `In the same graph, Class A’s bars are 5, 8, 6 and 9, so Class A read 5 + 8 + 6 + 9 = <b>28 books</b> in all. The gaps between the bars are 2, 3, 0 and 1, so the groups differ most in <b>Oct</b>.`),
    make(rng) {
      const g = rng.pick(PAIRS), as = g.cats.map(() => rng.int(1, 12)), bs = g.cats.map(() => rng.int(1, 12));
      const pic = doubleBars(g, as, bs), kind = rng.pick(['diff', 'total', 'most', 'both']);
      if (kind === 'diff') { let i = rng.int(0, 3); if (as[i] === bs[i]) bs[i] = as[i] > 6 ? as[i] - rng.int(1, 4) : as[i] + rng.int(1, 4); const ans = Math.abs(as[i] - bs[i]); return { prompt: `Look at the double bar graph.${pic}In ${g.cats[i]}, how many more ${g.what} did ${as[i] > bs[i] ? g.a : g.b} have than ${as[i] > bs[i] ? g.b : g.a}?`, type: 'number', answer: ans, params: { kind, as, bs, i }, hints: [`In ${g.cats[i]}, ${g.a} has ${as[i]} and ${g.b} has ${bs[i]}.`, `Subtract the smaller from the larger.`, `${Math.max(as[i], bs[i])} − ${Math.min(as[i], bs[i])} = <b>${ans}</b>.`] }; }
      if (kind === 'total') { const which = rng.bool(), list = which ? as : bs, ans = list.reduce((x, y) => x + y, 0); return { prompt: `Look at the double bar graph.${pic}How many ${g.what} did ${which ? g.a : g.b} have in all four categories altogether?`, type: 'number', answer: ans, params: { kind, as, bs, which }, hints: [`Read the ${which ? g.a : g.b} bars: ${list.join(', ')}.`, `Add them: ${list.join(' + ')}.`, `The total is <b>${ans}</b>.`] }; }
      const both = as.map((x, i) => x + bs[i]), gaps = as.map((x, i) => Math.abs(x - bs[i])), list = kind === 'most' ? gaps : both, top = Math.max.apply(null, list);
      if (list.filter(x => x === top).length > 1) { const i = rng.int(0, 3); const ans = as[i] + bs[i]; return { prompt: `Look at the double bar graph.${pic}How many ${g.what} were there in ${g.cats[i]} for both groups together?`, type: 'number', answer: ans, params: { kind: 'sum', as, bs, i }, hints: [`In ${g.cats[i]}: ${g.a} ${as[i]}, ${g.b} ${bs[i]}.`, 'Add the two bars.', `${as[i]} + ${bs[i]} = <b>${ans}</b>.`] }; }
      const k = list.indexOf(top), answer = g.cats[k];
      return { prompt: `Look at the double bar graph.${pic}${kind === 'most' ? `In which category is the difference between ${g.a} and ${g.b} the greatest?` : 'In which category is the total for both groups together the greatest?'}`, type: 'choice', choices: g.cats.slice(), keepOrder: true, answer, params: { kind, as, bs, k },
        hints: [kind === 'most' ? `Find the gap between the two bars in each category: ${gaps.join(', ')}.` : `Add the two bars in each category: ${both.join(', ')}.`, `The greatest is ${top}.`, `<b>${answer}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'diff') return q.answer === Math.abs(P.as[P.i] - P.bs[P.i]) && q.answer > 0;
      if (P.kind === 'total') return q.answer === (P.which ? P.as : P.bs).reduce((x, y) => x + y, 0);
      if (P.kind === 'sum') return q.answer === P.as[P.i] + P.bs[P.i];
      const list = P.kind === 'most' ? P.as.map((x, i) => Math.abs(x - P.bs[i])) : P.as.map((x, i) => x + P.bs[i]), top = Math.max.apply(null, list);
      return list.indexOf(top) === P.k && list.filter(x => x === top).length === 1;
    },
  });

})();
