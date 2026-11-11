/* Personal finance math. Money math for everyday life, in US dollars: budgets and a running balance, unit prices,
   discounts, sales tax and tips, simple and compound interest, loans and credit cards, paychecks and taxes, and
   saving and investing. Money is worked in whole cents so every answer is cents-correct; rounding is to the nearest
   cent, half a cent up. verify() redoes each calculation another way: in BigInt cents, by simulating a loan or an
   account month by month, or dollar by dollar through a tax table. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v;
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = s => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1e-9 : tol);
  /** dollars always with cents: $1,234.50, $12.00 */
  const $ = x => (x < 0 ? '−' : '') + '$' + N(Math.abs(x), { places: 2, fixed: true });
  /** whole cents from dollars, and back */
  const ct = x => Math.round(x * 100), dl = c => c / 100;
  /** a percent of an amount in cents, rounded to the nearest cent (half a cent rounds up) */
  const pctOf = (cents, pct) => Math.round(cents * Math.round(pct * 1000) / 100000);
  /** the same rounding in BigInt, for verify(): rate given in thousandths of a percent */
  const bigPct = (cents, milli) => { const num = BigInt(cents) * BigInt(Math.round(milli)), den = 100000n; return Number((2n * num + den) / (2n * den)); };
  /** is x a whole number of cents within half a cent of the exact value? */
  const centsOk = (x, exact) => near(x * 100, Math.round(x * 100), 1e-6) && Math.abs(x - exact) <= 0.005 + 1e-9;
  const COURSE = {
    id: 'personal-finance', title: 'Personal finance math', subject: 'High school', grade: 9, icon: 'Fin', hue: 152,
    blurb: 'Money math for everyday life, in US dollars: budgets, unit prices, discounts and sales tax, simple and compound interest, loans and credit cards, paychecks and taxes, and saving and investing.',
    units: [
      { id: 'budgets', title: 'Budgets and banking', blurb: 'What’s left after expenses, budget percentages, and keeping a running balance.', skills: ['fin.budget', 'fin.budget-percents', 'fin.running-balance'] },
      { id: 'shopping', title: 'Smart shopping', blurb: 'Unit prices and better buys, discounts and sales, sales tax, and tips.', skills: ['fin.unit-price', 'fin.discounts', 'fin.sales-tax', 'fin.tips'] },
    ],
  };
  A.course(COURSE);

  /* ---------- Unit 1: budgets and banking ---------- */
  const EXPENSES = [['Rent', 650, 1400], ['Groceries', 180, 420], ['Phone', 35, 85], ['Bus pass', 40, 110], ['Car insurance', 70, 160], ['Utilities', 60, 180], ['Internet', 40, 75], ['Gym', 15, 45], ['Streaming', 8, 25], ['Student loan', 90, 260]];
  A.skill({
    id: 'fin.budget', title: 'Making a budget',
    learn: p(`A budget compares the money coming in (income) with the money going out (expenses). <b>What's left = income − the total of the expenses.</b> Add the expenses carefully, keeping the cents lined up.`) +
      p(`To reach a savings goal, divide the goal by what you can save each period, and <b>round up</b>: if you need 17.2 weeks, it takes 18 weeks. Small daily costs add up, so multiply by how many days they happen.`) +
      example('Example', `Take-home pay of $2,400.00 with expenses of $950.00, $312.45 and $64.99: the expenses total $1,327.44, so <b>$1,072.56</b> is left.`),
    make(rng) {
      const kind = rng.pick(['left', 'left', 'weeks', 'yearly']), who = rng.pick(NAMES);
      if (kind === 'left') {
        const items = rng.sample(EXPENSES, rng.int(4, 6)).map(([nm, lo, hi]) => [nm, rng.int(lo * 100, hi * 100) / 100]), inc = rng.int(2400, 4200) * 1 + rng.pick([0, 0.5, 0.25, 0.75]);
        const tot = items.reduce((s, [, c]) => s + ct(c), 0), left = ct(inc) - tot;
        return { prompt: `${who}'s monthly take-home pay is ${$(inc)}. These are the monthly expenses. How much is left, in dollars?${M.table(['Expense', 'Amount'], items.map(([nm, c]) => [nm, $(c)]))}`, type: 'number', answer: dl(left), unit: '$', params: { kind, inc, items },
          hints: [`Add the expenses: ${items.map(([, c]) => $(c)).join(' + ')} = ${$(dl(tot))}.`, `${$(inc)} − ${$(dl(tot))} = <b>${$(dl(left))}</b>.`] };
      }
      if (kind === 'weeks') {
        const goal = rng.int(12, 90) * 10, per = rng.pick([15, 20, 25, 30, 35, 40, 45, 55, 60]), have = rng.pick([0, 0, 50, 75, 120]), wk = Math.ceil((goal - have) / per);
        if (have >= goal) return this.make(rng);
        const thing = rng.pick(['a used bike', 'a laptop', 'a guitar', 'a class trip', 'concert tickets']);
        return { prompt: `${who} wants ${$(goal)} for ${thing}, already has ${$(have)}, and saves ${$(per)} every week. How many weeks will it take to have at least ${$(goal)}?`, type: 'number', answer: wk, unit: 'weeks', params: { kind, goal, per, have },
          hints: [`${who} still needs ${$(goal)} − ${$(have)} = ${$(goal - have)}.`, `${$(goal - have)} ÷ ${$(per)} = ${N(M.round((goal - have) / per, 2))}${(goal - have) % per ? ', so round up' : ''}.`, `<b>${wk}</b> weeks.`] };
      }
      const each = rng.pick([2.25, 3.5, 4.75, 5.25, 6.4, 1.85, 2.99, 7.15]), days = rng.pick([180, 250, 52, 365]), thing = days === 52 ? 'a movie ticket every week' : days === 365 ? 'a snack every day' : days === 180 ? 'lunch each school day (180 days)' : 'coffee each workday (250 days)', tot = ct(each) * days;
      return { prompt: `${who} spends ${$(each)} on ${thing}. How much is that for a whole year, in dollars?`, type: 'number', answer: dl(tot), unit: '$', params: { kind, each, days },
        hints: [`Multiply the cost by the number of times: ${$(each)} × ${days}.`, `= <b>${$(dl(tot))}</b> in a year.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'left') { const tot = P.items.reduce((s, [, c]) => s + BigInt(Math.round(c * 100)), 0n); return BigInt(Math.round(P.inc * 100)) - tot === BigInt(Math.round(q.answer * 100)) && centsOk(q.answer, q.answer); }
      if (P.kind === 'weeks') { let w = 0, s = P.have; while (s < P.goal) { s += P.per; w++; } return w === q.answer; }
      let s = 0; for (let i = 0; i < P.days; i++) s += P.each; return centsOk(q.answer, s);
    },
  });

  A.skill({
    id: 'fin.budget-percents', title: 'Budget percentages',
    learn: p(`Budgets are often planned as percents of take-home pay. One common guideline, the <b>50/30/20 rule</b>, puts 50% toward needs (housing, food, bills), 30% toward wants, and 20% toward savings and paying down debt.`) +
      p(`<b>Amount = percent × income</b>, and <b>percent = amount ÷ income × 100</b>. Round money to the nearest cent and percents to the nearest tenth.`) +
      example('Example', `On $3,150 a month, the 50/30/20 rule gives needs $1,575, wants $945 and savings <b>$630</b>. Rent of $1,100 is 1,100 ÷ 3,150 × 100 ≈ <b>34.9%</b> of pay.`),
    make(rng) {
      const kind = rng.pick(['rule', 'share', 'amount']), who = rng.pick(NAMES), inc = rng.int(180, 520) * 10 + rng.pick([0, 0, 5]);
      if (kind === 'rule') {
        const cat = rng.pick([['needs', 50], ['wants', 30], ['savings and debt payments', 20]]), amt = pctOf(ct(inc), cat[1]);
        return { prompt: `${who} takes home ${$(inc)} a month and follows the 50/30/20 rule. How much should go toward ${cat[0]} each month, in dollars?`, type: 'number', answer: dl(amt), unit: '$', params: { kind, inc, pct: cat[1] },
          hints: [`Under the 50/30/20 rule, ${cat[0]} get ${cat[1]}% of take-home pay.`, `${N(cat[1] / 100)} × ${$(inc)} = <b>${$(dl(amt))}</b>.`] };
      }
      if (kind === 'share') {
        const [nm, lo, hi] = rng.pick(EXPENSES.slice(0, 6)), c = rng.int(lo, hi), pc = M.round(c / inc * 100, 1);
        return { prompt: `${who} takes home ${$(inc)} a month. What percent of that goes to ${nm.toLowerCase()} costing ${$(c)} a month? Round to the nearest tenth of a percent.`, type: 'number', answer: pc, unit: '%', tolerance: 0.05, params: { kind, inc, c },
          hints: [`Percent = amount ÷ income × 100 = ${N(c)} ÷ ${N(inc)} × 100.`, `≈ <b>${N(pc)}%</b>.`] };
      }
      const pc = rng.pick([5, 8, 10, 12, 15, 18, 25, 35]), amt = pctOf(ct(inc), pc), cat = rng.pick(['groceries', 'transportation', 'savings', 'entertainment', 'housing']);
      return { prompt: `A budget sets aside ${pc}% of ${who}'s ${$(inc)} monthly take-home pay for ${cat}. How much is that, in dollars?`, type: 'number', answer: dl(amt), unit: '$', params: { kind, inc, pct: pc },
        hints: [`${pc}% = ${N(pc / 100)}.`, `${N(pc / 100)} × ${$(inc)} = <b>${$(dl(amt))}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'share') return near(q.answer, Math.round(P.c * 1000 / P.inc) / 10, 1e-9) || near(q.answer, P.c / P.inc * 100, 0.05);
      return dl(bigPct(ct(P.inc), P.pct * 1000)) === q.answer;
    },
  });

  A.skill({
    id: 'fin.running-balance', title: 'Keeping a running balance',
    learn: p(`A <b>running balance</b> tracks a bank account after every transaction: <b>add deposits, subtract withdrawals, card purchases and fees</b>, one line at a time. Your balance after each line is the starting point for the next.`) +
      p(`If the balance drops below $0, the account is <b>overdrawn</b>, and banks often charge a fee. Keeping the running balance is how you spot it before it happens.`) +
      example('Example', `Start with $412.50. Deposit $150.00 → $562.50. Card purchase $89.99 → $472.51. Withdraw $60.00 → <b>$412.51</b>.`),
    make(rng) {
      const start = rng.int(5000, 90000) / 100, kinds = ['Deposit', 'Card purchase', 'ATM withdrawal', 'Online payment', 'Deposit', 'Card purchase'], n = rng.int(4, 6);
      let rows;
      do { rows = Array.from({ length: n }, () => { const k = rng.pick(kinds); return [k, k === 'Deposit' ? rng.int(5000, 60000) / 100 : k === 'ATM withdrawal' ? rng.pick([20, 40, 60, 80, 100]) : rng.int(500, 25000) / 100]; }); }
      while (rows.reduce((acc, [k, a]) => { const b = acc.b + (k === 'Deposit' ? 1 : -1) * ct(a); return { b, low: Math.min(acc.low, b) }; }, { b: ct(start), low: ct(start) }).low < 0);   // never overdrawn
      const ask = rng.pick(['end', 'end', 'after']), stop = ask === 'end' ? n : rng.int(2, n - 1);
      let bal = ct(start); rows.slice(0, stop).forEach(([k, a]) => { bal += (k === 'Deposit' ? 1 : -1) * ct(a); });
      return { prompt: `An account starts with ${$(start)}. What is the balance ${ask === 'end' ? 'after all of these transactions' : `right after transaction ${stop}`}, in dollars?${M.table(['#', 'Transaction', 'Amount'], rows.map(([k, a], i) => [i + 1, k, $(a)]))}`, type: 'number', answer: dl(bal), unit: '$', params: { start, rows, stop },
        hints: [`Add deposits and subtract everything else, line by line, from ${$(start)}.`, `Running balance: ${(() => { let b = ct(start); return rows.slice(0, stop).map(([k, a]) => { b += (k === 'Deposit' ? 1 : -1) * ct(a); return $(dl(b)); }).join(' → '); })()}.`, `The balance is <b>${$(dl(bal))}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      const dep = P.rows.slice(0, P.stop).filter(r => r[0] === 'Deposit').reduce((s, r) => s + BigInt(Math.round(r[1] * 100)), 0n), out = P.rows.slice(0, P.stop).filter(r => r[0] !== 'Deposit').reduce((s, r) => s + BigInt(Math.round(r[1] * 100)), 0n);
      return BigInt(Math.round(P.start * 100)) + dep - out === BigInt(Math.round(q.answer * 100));
    },
  });

  /* ---------- Unit 2: smart shopping ---------- */
  // item, unit, smallest and largest package, and a typical range of cents per unit
  const GOODS = [['cereal', 'ounce', 10, 24, 12, 40], ['laundry soap', 'ounce', 40, 150, 8, 25], ['rice', 'pound', 2, 20, 80, 250], ['juice', 'fluid ounce', 32, 128, 4, 12], ['coffee', 'ounce', 10, 40, 35, 110], ['dog food', 'pound', 5, 40, 90, 300], ['shampoo', 'fluid ounce', 12, 33, 20, 80], ['granola bars', 'bar', 6, 24, 30, 90]];
  /** "the 24-ounce size", "the 6-bar box" */
  const sizeName = (q, unit) => unit === 'bar' ? `The ${q}-bar box` : `The ${q}-${unit.replace(' ', '-')} size`;
  /** "a" or "an" before a number said aloud */
  const an = n => [8, 11, 18].includes(n) || (n >= 80 && n < 90) ? 'an' : 'a';
  const Word = n => ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'][n] || N(n);
  /** a price in cents for q units whose price per unit isn't close to a half cent (so "nearest cent" is clear) */
  function clearPrice(rng, q, lo, hi) { let c; do { c = rng.int(lo, hi); } while (Math.abs((c / q) % 1 - 0.5) < 0.06); return c; }
  const plural = (n, w) => `${N(n)} ${n === 1 ? w : w.replace(/(ounce|pound|bar)$/, '$1s')}`;
  A.skill({
    id: 'fin.unit-price', title: 'Unit prices and better buys',
    learn: p(`The <b>unit price</b> is the cost for one unit: <b>price ÷ number of units</b>. It lets you compare packages of different sizes: the lower unit price is the better buy (if you'll use it all).`) +
      p(`To find the cost of a different amount at the same rate, multiply the unit price by the new amount, or set up a proportion. Round money to the nearest cent at the end, not in the middle.`) +
      example('Example', `A 24-ounce box for $4.79 costs 4.79 ÷ 24 ≈ $0.20 per ounce; a 15-ounce box for $3.29 costs about $0.22 per ounce. The <b>24-ounce box</b> is the better buy.`),
    make(rng) {
      const kind = rng.pick(['unit', 'better', 'better', 'scale']), [item, unit, lo, hi, plo, phi] = rng.pick(GOODS);
      if (kind === 'unit') {
        const q = rng.int(lo, hi), c = clearPrice(rng, q, q * plo, q * phi), ans = Math.round(c / q);
        return { prompt: `A package of ${item} holds ${plural(q, unit)} and costs ${$(dl(c))}. What is the price per ${unit}, to the nearest cent?`, type: 'number', answer: dl(ans), unit: '$', params: { kind, c, q },
          hints: [`Unit price = price ÷ units = ${$(dl(c))} ÷ ${q}.`, `≈ ${N(M.round(c / q / 100, 4))}, which rounds to <b>${$(dl(ans))}</b> per ${unit}.`] };
      }
      if (kind === 'better') {
        let q1, q2; do { q1 = rng.int(lo, hi); q2 = rng.int(lo, hi); } while (Math.abs(q1 - q2) < Math.max(3, (hi - lo) / 4));
        const c1 = rng.int(q1 * plo, q1 * phi); let c2;
        if (rng.chance(0.2) && (c1 * q2) % q1 === 0) c2 = c1 * q2 / q1;
        else do { c2 = Math.round(c1 * q2 / q1 * (1 + rng.pick([-1, 1]) * rng.int(4, 20) / 100)); } while (c2 * q1 === c1 * q2);
        const u1 = c1 / q1, u2 = c2 / q2, opts = [sizeName(q1, unit), sizeName(q2, unit), `Both cost the same per ${unit}`], answer = c1 * q2 === c2 * q1 ? opts[2] : u1 < u2 ? opts[0] : opts[1];
        return { prompt: `A store sells ${item} in two sizes: ${plural(q1, unit)} for ${$(dl(c1))} and ${plural(q2, unit)} for ${$(dl(c2))}. Which is the better buy?`, type: 'choice', keepOrder: true, answer, choices: opts, params: { kind, c1, q1, c2, q2, opts },
          hints: [`Unit prices: ${$(dl(c1))} ÷ ${q1} ≈ ${$(M.round(u1 / 100, 4))} and ${$(dl(c2))} ÷ ${q2} ≈ ${$(M.round(u2 / 100, 4))} per ${unit}.`, answer === opts[2] ? `They're equal: <b>both cost the same per ${unit}</b>.` : `The lower unit price wins: <b>${answer.toLowerCase()}</b>.`] };
      }
      const q1 = rng.int(2, 6), q2 = q1 + rng.int(1, 6), c = clearPrice(rng, q1 / q2, q1 * 90, q1 * 450), ans = Math.round(c * q2 / q1);
      return { prompt: `${plural(q1, unit === 'bar' ? 'pound' : unit)} of ${item === 'granola bars' ? 'trail mix' : item} cost ${$(dl(c))}. At the same price per ${unit === 'bar' ? 'pound' : unit}, how much would ${plural(q2, unit === 'bar' ? 'pound' : unit)} cost, to the nearest cent?`, type: 'number', answer: dl(ans), unit: '$', params: { kind, c, q1, q2 },
        hints: [`Unit price: ${$(dl(c))} ÷ ${q1} ≈ ${$(M.round(c / q1 / 100, 4))}.`, `Times ${q2}: ${$(dl(c))} × ${q2} ÷ ${q1} = ${N(M.round(c * q2 / q1 / 100, 4))}, so <b>${$(dl(ans))}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'unit') return centsOk(q.answer, P.c / P.q / 100);
      if (P.kind === 'better') { const l = BigInt(P.c1) * BigInt(P.q2), r = BigInt(P.c2) * BigInt(P.q1); return q.answer === P.opts[l === r ? 2 : l < r ? 0 : 1]; }   // cross-multiplied, in whole cents
      return centsOk(q.answer, P.c * P.q2 / P.q1 / 100);
    },
  });

  A.skill({
    id: 'fin.discounts', title: 'Discounts and sales',
    learn: p(`<b>Discount = percent off × original price; sale price = original − discount</b>. Or in one step: ${V('p')}% off means you pay (100 − ${V('p')})% of the price.`) +
      p(`Two discounts in a row don't add: "20% off, then an extra 10% off" means paying 0.8 × 0.9 = 0.72 of the price, a total of 28% off, not 30%. To compare a dollars-off coupon with a percent-off deal, work out the savings from each.`) +
      example('Example', `A $64.00 jacket at 25% off: the discount is $16.00, so the sale price is <b>$48.00</b>. With an extra 10% off that, you pay $43.20.`),
    make(rng) {
      const kind = rng.pick(['sale', 'stacked', 'percent-off', 'compare']), item = rng.pick(['jacket', 'pair of sneakers', 'backpack', 'lamp', 'video game', 'desk chair', 'bike helmet']);
      const price = rng.int(1200, 18000) / 100 + 0, pc = rng.pick([10, 15, 20, 25, 30, 35, 40, 50]), P = ct(price);
      if (kind === 'sale') { const d = pctOf(P, pc); return { prompt: `A ${item} costs ${$(price)}. It's on sale for ${pc}% off. What is the sale price, in dollars?`, type: 'number', answer: dl(P - d), unit: '$', params: { kind, P, pc }, hints: [`Discount: ${N(pc / 100)} × ${$(price)} = ${$(dl(d))}${Math.abs(P * pc / 100 - d) > 1e-9 ? ' (rounded to the nearest cent)' : ''}.`, `Sale price: ${$(price)} − ${$(dl(d))} = <b>${$(dl(P - d))}</b>.`] }; }
      if (kind === 'stacked') {
        const q2 = rng.pick([10, 15, 20, 25]), ask = rng.pick(['price', 'percent']), s1 = P - pctOf(P, pc), s2 = s1 - pctOf(s1, q2), eq = 100 - (100 - pc) * (100 - q2) / 100;
        if (ask === 'percent') return { prompt: `A store takes ${pc}% off a ${item}, then takes an extra ${q2}% off the sale price at the register. What single percent discount is that the same as?`, type: 'number', answer: eq, unit: '%', params: { kind, pc, q2, ask }, hints: [`You pay ${N((100 - pc) / 100)} × ${N((100 - q2) / 100)} = ${N((100 - pc) * (100 - q2) / 10000)} of the original price.`, `That's a discount of 100% − ${N((100 - pc) * (100 - q2) / 100)}% = <b>${N(eq)}%</b>, not ${pc + q2}%.`] };
        return { prompt: `A ${item} costs ${$(price)}. It's marked ${pc}% off, and you get an extra ${q2}% off the sale price at the register. What do you pay, in dollars?`, type: 'number', answer: dl(s2), unit: '$', params: { kind, P, pc, q2, ask }, hints: [`First discount: ${$(price)} − ${$(dl(pctOf(P, pc)))} = ${$(dl(s1))}.`, `Extra ${q2}% off ${$(dl(s1))}: ${$(dl(s1))} − ${$(dl(pctOf(s1, q2)))} = <b>${$(dl(s2))}</b>.`] };
      }
      if (kind === 'percent-off') { const O = rng.int(4, 40) * 5, S = O * (100 - pc) / 100; return { prompt: `A ${item} that usually costs ${$(O)} is on sale for ${$(S)}. What percent off is that?`, type: 'number', answer: pc, unit: '%', params: { kind, O, S }, hints: [`The discount is ${$(O)} − ${$(S)} = ${$(O - S)}.`, `${$(O - S)} ÷ ${$(O)} × 100 = <b>${pc}%</b> off.`] }; }
      const dOff = rng.int(5, 40), save = pctOf(P, pc), tie = save === dOff * 100, opts = [`The ${$(dOff)}-off coupon`, `The ${pc}% discount`, 'Both save the same amount'], answer = tie ? opts[2] : save > dOff * 100 ? opts[1] : opts[0];
      return { prompt: `For a ${$(price)} ${item}, you can use either a ${$(dOff)}-off coupon or a ${pc}% discount, but not both. Which saves more?`, type: 'choice', keepOrder: true, answer, choices: opts, params: { kind, P, pc, dOff },
        hints: [`The ${pc}% discount saves ${N(pc / 100)} × ${$(price)} = ${$(dl(save))}. The coupon saves ${$(dOff)}.`, tie ? `They're equal: <b>both save the same amount</b>.` : `<b>${answer}</b> saves more.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'sale') return dl(P.P - bigPct(P.P, P.pc * 1000)) === q.answer;
      if (P.kind === 'stacked') {
        if (P.ask === 'percent') { const left = 1 * (1 - P.pc / 100) * (1 - P.q2 / 100); return near((1 - left) * 100, q.answer, 1e-9); }
        const s1 = P.P - bigPct(P.P, P.pc * 1000); return dl(s1 - bigPct(s1, P.q2 * 1000)) === q.answer;
      }
      if (P.kind === 'percent-off') return near(q.answer, (1 - P.S / P.O) * 100, 1e-9);
      const save = bigPct(P.P, P.pc * 1000), coupon = P.dOff * 100;
      return q.answer === (save === coupon ? q.choices.find(c => /same/.test(c)) : save > coupon ? q.choices.find(c => c.includes('%')) : q.choices.find(c => c.includes('coupon')));
    },
  });

  const RATES = [4, 5, 6, 6.25, 6.5, 7, 7.25, 7.5, 8, 8.25, 8.875, 9.5];
  A.skill({
    id: 'fin.sales-tax', title: 'Sales tax',
    learn: p(`Most US states add <b>sales tax</b> at the register: <b>tax = tax rate × price</b>, rounded to the nearest cent, and <b>total = price + tax</b>. Rates differ from place to place, from 0% to about 10%, and often have decimals such as 8.25%.`) +
      p(`When there's a discount, the tax is figured on the sale price. To undo tax, divide: a total of $53.50 at 7% tax came from a price of 53.50 ÷ 1.07 = $50.00.`) +
      example('Example', `Items of $18.99 and $6.50 at 8.25% tax: the subtotal is $25.49, the tax is 0.0825 × 25.49 ≈ $2.10, and the total is <b>$27.59</b>.`),
    make(rng) {
      const kind = rng.pick(['total', 'tax', 'rate', 'before-tax', 'after-discount']), r = rng.pick(RATES), items = Array.from({ length: rng.int(1, 3) }, () => rng.int(199, 6999) / 100), sub = items.reduce((s, x) => s + ct(x), 0), tax = pctOf(sub, r);
      const list = items.length === 1 ? `an item priced at ${$(items[0])}` : `items priced at ${M.list(items.map($))}`;
      if (kind === 'total' || kind === 'tax') return { prompt: `${rng.pick(NAMES)} buys ${list}. The sales tax rate is ${N(r)}%. What is the ${kind === 'tax' ? 'sales tax' : 'total cost including tax'}, in dollars?`, type: 'number', answer: dl(kind === 'tax' ? tax : sub + tax), unit: '$', params: { kind, sub, r },
        hints: [`${items.length > 1 ? `Subtotal: ${$(dl(sub))}. ` : ''}Tax: ${N(r / 100)} × ${$(dl(sub))} = ${N(M.round(sub * r / 10000, 5))}, which rounds to ${$(dl(tax))}.`, kind === 'tax' ? `The tax is <b>${$(dl(tax))}</b>.` : `Total: ${$(dl(sub))} + ${$(dl(tax))} = <b>${$(dl(sub + tax))}</b>.`] };
      if (kind === 'rate') { const ans = M.round(tax / sub * 100, 2); return { prompt: `The tax on a ${$(dl(sub))} purchase is ${$(dl(tax))}. What is the tax rate, as a percent, to the nearest hundredth?`, type: 'number', answer: ans, unit: '%', tolerance: 0.01, params: { kind, sub, tax }, hints: [`Rate = tax ÷ price × 100 = ${N(dl(tax))} ÷ ${N(dl(sub))} × 100.`, `≈ <b>${N(ans)}%</b>.`] }; }
      if (kind === 'before-tax') return { prompt: `${rng.pick(NAMES)} paid ${$(dl(sub + tax))} for a purchase, including ${N(r)}% sales tax. What was the price before tax, in dollars?`, type: 'number', answer: dl(sub), unit: '$', params: { kind, total: sub + tax, r },
        hints: [`Price × ${N(1 + r / 100)} = ${$(dl(sub + tax))}.`, `Price = ${$(dl(sub + tax))} ÷ ${N(1 + r / 100)} ≈ <b>${$(dl(sub))}</b>.`] };
      const pc = rng.pick([10, 20, 25, 30, 40]), sale = sub - pctOf(sub, pc), t2 = pctOf(sale, r);
      return { prompt: `A ${$(dl(sub))} item is ${pc}% off, and then ${N(r)}% sales tax is added to the sale price. What is the total, in dollars?`, type: 'number', answer: dl(sale + t2), unit: '$', params: { kind, sub, pc, r },
        hints: [`Sale price: ${$(dl(sub))} − ${$(dl(pctOf(sub, pc)))} = ${$(dl(sale))}.`, `Tax on the sale price: ${N(r / 100)} × ${$(dl(sale))} ≈ ${$(dl(t2))}.`, `Total: <b>${$(dl(sale + t2))}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'total' || P.kind === 'tax') { const t = bigPct(P.sub, P.r * 1000); return dl(P.kind === 'tax' ? t : P.sub + t) === q.answer; }
      if (P.kind === 'rate') return near(q.answer, P.tax / P.sub * 100, 0.005 + 1e-9);
      if (P.kind === 'before-tax') return centsOk(q.answer, P.total / 100 / (1 + P.r / 100)) && P.total === ct(q.answer) + bigPct(ct(q.answer), P.r * 1000);
      const sale = P.sub - bigPct(P.sub, P.pc * 1000); return dl(sale + bigPct(sale, P.r * 1000)) === q.answer;
    },
  });

  A.skill({
    id: 'fin.tips', title: 'Tips and splitting a bill',
    learn: p(`At a restaurant in the US it's customary to leave a <b>tip</b> of about 15% to 20% for good service. <b>Tip = tip percent × bill</b>, and many people figure the tip on the amount before tax.`) +
      p(`A quick way to find 20%: move the decimal point one place left (10%) and double it. To split a bill evenly, divide the total by the number of people and round to the cent.`) +
      example('Example', `A $46.80 meal with an 18% tip: 0.18 × 46.80 = $8.42 (rounded), for a total of $55.22. Split four ways, that's $13.805, about <b>$13.81</b> each.`),
    make(rng) {
      const kind = rng.pick(['tip', 'total', 'split', 'pre-tax']), bill = rng.int(1800, 16000) / 100, B = ct(bill), tp = rng.pick([15, 18, 20, 22, 25]), tip = pctOf(B, tp);
      if (kind === 'tip' || kind === 'total') return { prompt: `A restaurant bill is ${$(bill)}. How much is ${kind === 'tip' ? `${an(tp)} ${tp}% tip` : `the total with ${an(tp)} ${tp}% tip`}, in dollars?`, type: 'number', answer: dl(kind === 'tip' ? tip : B + tip), unit: '$', params: { kind, B, tp },
        hints: [`Tip: ${N(tp / 100)} × ${$(bill)} = ${N(M.round(B * tp / 10000, 4))} ≈ ${$(dl(tip))}.`, kind === 'tip' ? `The tip is <b>${$(dl(tip))}</b>.` : `Total: ${$(bill)} + ${$(dl(tip))} = <b>${$(dl(B + tip))}</b>.`] };
      if (kind === 'split') { const n = rng.int(2, 6), each = Math.round((B + tip) / n); return { prompt: `${Word(n)} friends share a ${$(bill)} bill and add ${an(tp)} ${tp}% tip. If they split the total evenly, about how much does each person pay, to the nearest cent?`, type: 'number', answer: dl(each), unit: '$', params: { kind, B, tp, n }, hints: [`Total with tip: ${$(bill)} + ${$(dl(tip))} = ${$(dl(B + tip))}.`, `${$(dl(B + tip))} ÷ ${n} = ${N(M.round((B + tip) / n / 100, 4))}, about <b>${$(dl(each))}</b> each.`] }; }
      const r = rng.pick(RATES), tax = pctOf(B, r);
      return { prompt: `A meal costs ${$(bill)} before tax. The sales tax is ${N(r)}%, and ${rng.pick(NAMES)} leaves ${an(tp)} ${tp}% tip on the pre-tax amount. What is the total, in dollars?`, type: 'number', answer: dl(B + tax + tip), unit: '$', params: { kind, B, tp, r },
        hints: [`Tax: ${N(r / 100)} × ${$(bill)} ≈ ${$(dl(tax))}. Tip: ${N(tp / 100)} × ${$(bill)} ≈ ${$(dl(tip))}.`, `Total: ${$(bill)} + ${$(dl(tax))} + ${$(dl(tip))} = <b>${$(dl(B + tax + tip))}</b>.`] };
    },
    verify(q) {
      const P = q.params, tip = bigPct(P.B, P.tp * 1000);
      if (P.kind === 'tip') return dl(tip) === q.answer;
      if (P.kind === 'total') return dl(P.B + tip) === q.answer;
      if (P.kind === 'split') return centsOk(q.answer, (P.B + tip) / P.n / 100) && Math.abs(q.answer * P.n * 100 - (P.B + tip)) <= P.n / 2 + 1e-6;
      return dl(P.B + bigPct(P.B, P.r * 1000) + tip) === q.answer;
    },
  });
})();
