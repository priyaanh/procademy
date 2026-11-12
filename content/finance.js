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
      { id: 'interest', title: 'Interest', blurb: 'Simple and compound interest, comparing them and APY, and how long money takes to double.', skills: ['fin.simple-interest', 'fin.compound-interest', 'fin.simple-vs-compound', 'fin.doubling'] },
      { id: 'credit', title: 'Loans and credit', blurb: 'Monthly loan payments, the total cost of a loan, credit card interest, and where each payment goes.', skills: ['fin.loan-payment', 'fin.loan-cost', 'fin.credit-cards', 'fin.amortization'] },
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
  /** "a" or "an" before a dollar amount said aloud: an $8.99 item, an $11,000.00 loan */
  const anD = x => { const d = String(Math.floor(Math.abs(x))); return /^8/.test(d) || (d.length % 3 === 2 && /^1[18]/.test(d)) ? 'an' : 'a'; };
  const AnD = x => anD(x) === 'an' ? 'An' : 'A';
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
          hints: [`Unit prices: ${$(dl(c1))} ÷ ${q1} ≈ ${'$' + N(M.round(u1 / 100, 4))} and ${$(dl(c2))} ÷ ${q2} ≈ ${'$' + N(M.round(u2 / 100, 4))} per ${unit}.`, answer === opts[2] ? `They're equal: <b>both cost the same per ${unit}</b>.` : `The lower unit price wins: <b>${answer.toLowerCase()}</b>.`] };
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
      return { prompt: `For ${anD(price)} ${$(price)} ${item}, you can use either ${anD(dOff)} ${$(dOff)}-off coupon or a ${pc}% discount, but not both. Which saves more?`, type: 'choice', keepOrder: true, answer, choices: opts, params: { kind, P, pc, dOff },
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
      if (kind === 'rate') { const ans = M.round(tax / sub * 100, 2); return { prompt: `The tax on ${anD(dl(sub))} ${$(dl(sub))} purchase is ${$(dl(tax))}. What is the tax rate, as a percent, to the nearest hundredth?`, type: 'number', answer: ans, unit: '%', tolerance: 0.01, params: { kind, sub, tax }, hints: [`Rate = tax ÷ price × 100 = ${N(dl(tax))} ÷ ${N(dl(sub))} × 100.`, `≈ <b>${N(ans)}%</b>.`] }; }
      if (kind === 'before-tax') return { prompt: `${rng.pick(NAMES)} paid ${$(dl(sub + tax))} for a purchase, including ${N(r)}% sales tax. What was the price before tax, in dollars?`, type: 'number', answer: dl(sub), unit: '$', params: { kind, total: sub + tax, r },
        hints: [`Price × ${N(1 + r / 100)} = ${$(dl(sub + tax))}.`, `Price = ${$(dl(sub + tax))} ÷ ${N(1 + r / 100)} ≈ <b>${$(dl(sub))}</b>.`] };
      const pc = rng.pick([10, 20, 25, 30, 40]), sale = sub - pctOf(sub, pc), t2 = pctOf(sale, r);
      return { prompt: `${AnD(dl(sub))} ${$(dl(sub))} item is ${pc}% off, and then ${N(r)}% sales tax is added to the sale price. What is the total, in dollars?`, type: 'number', answer: dl(sale + t2), unit: '$', params: { kind, sub, pc, r },
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
      if (kind === 'split') { const n = rng.int(2, 6), each = Math.round((B + tip) / n); return { prompt: `${Word(n)} friends share ${anD(bill)} ${$(bill)} bill and add ${an(tp)} ${tp}% tip. If they split the total evenly, about how much does each person pay, to the nearest cent?`, type: 'number', answer: dl(each), unit: '$', params: { kind, B, tp, n }, hints: [`Total with tip: ${$(bill)} + ${$(dl(tip))} = ${$(dl(B + tip))}.`, `${$(dl(B + tip))} ÷ ${n} = ${N(M.round((B + tip) / n / 100, 4))}, about <b>${$(dl(each))}</b> each.`] }; }
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

/* ---------- Unit 3: interest ---------- */
  const COMP = { 1: 'annually', 4: 'quarterly', 12: 'monthly' };
  const yrs = t => `${N(t)} year${t === 1 ? '' : 's'}`;
  A.skill({
    id: 'fin.simple-interest', title: 'Simple interest',
    learn: p(`<b>Simple interest: ${V('I')} = ${V('P')}${V('r')}${V('t')}</b>, where ${V('P')} is the principal (the starting amount), ${V('r')} is the yearly rate as a decimal, and ${V('t')} is the time in years. The total at the end is ${V('P')} + ${V('I')}.`) +
      p(`<b>Time must be in years</b>: 9 months is ${F(9, 12)} = 0.75 year. Simple interest is earned only on the principal, so it's the same every year. To find a missing rate or time, solve ${V('I')} = ${V('P')}${V('r')}${V('t')} for it.`) +
      example('Example', `$2,400 at 3.5% simple interest for 18 months: ${V('I')} = 2,400 × 0.035 × 1.5 = <b>$126.00</b>, so the account ends with $2,526.00.`),
    make(rng) {
      const kind = rng.pick(['interest', 'interest', 'total', 'rate', 'time']), P = rng.int(4, 120) * 50, r = rng.pick([1.5, 2, 2.25, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7.5]), months = rng.pick([6, 9, 12, 18, 24, 30, 36, 48, 60]), t = months / 12;
      const I = Math.round(P * 100 * r * months / 1200);   // cents
      const tText = months % 12 ? `${months} months` : yrs(t);
      if (kind === 'interest' || kind === 'total') return { prompt: `${rng.pick(NAMES)} puts ${$(P)} in an account that pays ${N(r)}% simple interest per year. How much ${kind === 'interest' ? 'interest is earned' : 'is in the account'} after ${tText}, in dollars?`, type: 'number', answer: dl(kind === 'interest' ? I : P * 100 + I), unit: '$', params: { kind, P, r, months },
        hints: [`${V('t')} is in years: ${months % 12 ? `${months} ÷ 12 = ${N(t)}` : N(t)}. ${V('I')} = ${N(P)} × ${N(r / 100)} × ${N(t)}.`, kind === 'interest' ? `${V('I')} = <b>${$(dl(I))}</b>.` : `${V('I')} = ${$(dl(I))}, so the total is ${$(P)} + ${$(dl(I))} = <b>${$(dl(P * 100 + I))}</b>.`] };
      const y = rng.int(1, 6), I2 = P * r * y / 100;
      if (kind === 'rate') return { prompt: `A loan of ${$(P)} charges ${$(I2)} in simple interest over ${yrs(y)}. What is the yearly interest rate, as a percent?`, type: 'number', answer: r, unit: '%', params: { kind, P, I: I2, y },
        hints: [`${V('r')} = ${V('I')} ÷ (${V('P')}${V('t')}) = ${N(I2)} ÷ (${N(P)} × ${y}).`, `= ${N(r / 100)}, which is <b>${N(r)}%</b>.`] };
      return { prompt: `How many years does it take ${$(P)} to earn ${$(I2)} in simple interest at ${N(r)}% per year?`, type: 'number', answer: y, unit: 'years', params: { kind, P, I: I2, r },
        hints: [`${V('t')} = ${V('I')} ÷ (${V('P')}${V('r')}) = ${N(I2)} ÷ (${N(P)} × ${N(r / 100)}).`, `= <b>${y}</b> years.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'interest' || P.kind === 'total') { let I = 0; for (let m = 0; m < P.months; m++) I += P.P * P.r / 100 / 12; return centsOk(q.answer, P.kind === 'interest' ? I : P.P + I); }
      if (P.kind === 'rate') return near(P.P * q.answer / 100 * P.y, P.I, 1e-9);
      return near(P.P * P.r / 100 * q.answer, P.I, 1e-9);
    },
  });

  A.skill({
    id: 'fin.compound-interest', title: 'Compound interest',
    learn: p(`With <b>compound interest</b>, the interest is added to the balance, and later interest is earned on it too. <b>${V('A')} = ${V('P')}(1 + ${F(V('r'), V('n'))})<sup>${V('n')}${V('t')}</sup></b>, where ${V('n')} is the number of times per year the interest is compounded: 1 for annually, 4 for quarterly, 12 for monthly.`) +
      p(`Use a calculator for the power, keep all the digits until the end, and round to the nearest cent at the very end. The <b>interest earned</b> is ${V('A')} − ${V('P')}.`) +
      example('Example', `$5,000 at 4% compounded quarterly for 3 years: ${V('A')} = 5,000(1 + 0.04 ÷ 4)<sup>12</sup> = 5,000(1.01)<sup>12</sup> ≈ <b>$5,634.13</b>, so $634.13 is interest.`),
    make(rng) {
      const P = rng.pick([500, 800, 1000, 1500, 2000, 2500, 4000, 5000, 7500, 10000, 12000]), r = rng.pick([1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6]), n = rng.pick([1, 4, 12]), t = rng.int(2, 15), ask = rng.pick(['balance', 'interest']);
      const Av = P * Math.pow(1 + r / 100 / n, n * t), ans = M.round(ask === 'balance' ? Av : Av - P, 2);
      return { prompt: `${$(P)} is deposited in an account paying ${N(r)}% interest compounded ${COMP[n]}. With no other deposits or withdrawals, ${ask === 'balance' ? 'what is the balance' : 'how much interest has been earned'} after ${yrs(t)}? Round to the nearest cent.`, type: 'number', answer: ans, unit: '$', tolerance: 0.01, params: { P, r, n, t, ask },
        hints: [`${V('A')} = ${n === 1 ? `${N(P)}(1 + ${N(r / 100)})<sup>${t}</sup>` : `${N(P)}(1 + ${N(r / 100)} ÷ ${n})<sup>${n} × ${t}</sup>`} = ${N(P)}(${N(M.round(1 + r / 100 / n, 6))})<sup>${n * t}</sup>.`, `${V('A')} ≈ ${$(M.round(Av, 2))}.`, ask === 'balance' ? `The balance is <b>${$(ans)}</b>.` : `Interest = ${$(M.round(Av, 2))} − ${$(P)} = <b>${$(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params; let b = P.P;
      for (let k = 0; k < P.n * P.t; k++) b += b * (P.r / 100 / P.n);      // one compounding period at a time
      return centsOk(q.answer, P.ask === 'balance' ? b : b - P.P);
    },
  });

  A.skill({
    id: 'fin.simple-vs-compound', title: 'Simple versus compound interest, and APY',
    learn: p(`At the same rate, <b>compound interest beats simple interest</b>, and the gap grows with time, because compound interest earns interest on interest.`) +
      p(`Because compounding more often adds a little, banks report the <b>annual percentage yield (APY)</b>, the true yearly growth: <b>APY = (1 + ${F(V('r'), V('n'))})<sup>${V('n')}</sup> − 1</b>. A 6% rate compounded monthly has an APY of about 6.17%.`) +
      example('Example', `$3,000 for 10 years at 5%: simple interest gives $4,500.00; compounded annually it gives 3,000(1.05)<sup>10</sup> ≈ $4,886.68. The difference is <b>$386.68</b>.`),
    make(rng) {
      const kind = rng.pick(['difference', 'apy', 'which']);
      if (kind === 'difference') {
        const P = rng.pick([1000, 2000, 2500, 3000, 5000, 8000]), r = rng.pick([3, 4, 5, 6, 7]), t = rng.int(5, 20), simple = P * (1 + r * t / 100), comp = P * Math.pow(1 + r / 100, t), ans = M.round(comp - simple, 2);
        return { prompt: `${$(P)} is invested for ${t} years at ${r}% per year. How much more does it earn with interest compounded annually than with simple interest? Round to the nearest cent.`, type: 'number', answer: ans, unit: '$', tolerance: 0.01, params: { kind, P, r, t },
          hints: [`Simple: ${N(P)}(1 + ${N(r / 100)} × ${t}) = ${$(simple)}. Compound: ${N(P)}(${N(1 + r / 100)})<sup>${t}</sup> ≈ ${$(M.round(comp, 2))}.`, `Difference: <b>${$(ans)}</b>.`] };
      }
      if (kind === 'apy') {
        const r = rng.pick([2, 3, 3.5, 4, 4.5, 5, 6, 8, 12, 18]), n = rng.pick([4, 12, 365]), apy = M.round((Math.pow(1 + r / 100 / n, n) - 1) * 100, 2);
        return { prompt: `An account pays ${N(r)}% interest compounded ${n === 365 ? 'daily (365 times a year)' : COMP[n]}. What is its annual percentage yield (APY), as a percent rounded to the nearest hundredth?`, type: 'number', answer: apy, unit: '%', tolerance: 0.01, params: { kind, r, n },
          hints: [`APY = (1 + ${N(r / 100)} ÷ ${n})<sup>${n}</sup> − 1.`, `= ${N(M.round(Math.pow(1 + r / 100 / n, n) - 1, 6))}, which is <b>${N(apy)}%</b>.`] };
      }
      let P, r1, r2, t, a, b;
      do { P = rng.pick([1000, 2000, 5000, 10000]); r1 = rng.pick([4, 4.5, 5, 5.5, 6]); r2 = r1 - rng.pick([0.25, 0.5, 0.75, 1]); t = rng.int(3, 25); a = P * (1 + r1 * t / 100); b = P * Math.pow(1 + r2 / 100, t); } while (Math.abs(a - b) < 5);
      const opts = [`Account A, with ${N(r1)}% simple interest`, `Account B, with ${N(r2)}% compounded annually`], answer = a > b ? opts[0] : opts[1];
      return { prompt: `${$(P)} can go into Account A, paying ${N(r1)}% simple interest per year, or Account B, paying ${N(r2)}% compounded annually. Which will hold more after ${t} years?`, type: 'choice', keepOrder: true, answer, choices: opts, params: { kind, P, r1, r2, t },
        hints: [`A: ${N(P)}(1 + ${N(r1 / 100)} × ${t}) = ${$(a)}. B: ${N(P)}(${N(1 + r2 / 100)})<sup>${t}</sup> ≈ ${$(M.round(b, 2))}.`, `<b>${answer.split(',')[0]}</b> holds more${a > b ? ': here the higher simple rate wins' : ': here compounding makes up for the lower rate'}.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'difference') { let s = P.P, c = P.P; for (let y = 0; y < P.t; y++) { s += P.P * P.r / 100; c += c * P.r / 100; } return centsOk(q.answer, c - s); }
      if (P.kind === 'apy') { let b = 1; for (let k = 0; k < P.n; k++) b *= 1 + P.r / 100 / P.n; return near(q.answer, (b - 1) * 100, 0.005 + 1e-9); }
      let s = P.P, c = P.P; for (let y = 0; y < P.t; y++) { s += P.P * P.r1 / 100; c *= 1 + P.r2 / 100; }
      return q.answer.startsWith(s > c ? 'Account A' : 'Account B');
    },
  });

  A.skill({
    id: 'fin.doubling', title: 'Doubling time and the rule of 72',
    learn: p(`<b>The rule of 72:</b> money growing at ${V('r')}% a year, compounded, doubles in about <b>72 ÷ ${V('r')}</b> years. At 6%, that's about 12 years; at 9%, about 8.`) +
      p(`Doubling repeats: in two doubling times the money is about 4 times as much, in three about 8 times. To find the exact number of whole years, multiply by (1 + ${V('r')}) one year at a time until the amount reaches double.`) +
      example('Example', `At 8%, money doubles in about 72 ÷ 8 = 9 years. So $1,500 grows to about $3,000 in 9 years and about <b>$6,000</b> in 18 years.`),
    make(rng) {
      const kind = rng.pick(['rule', 'grow', 'exact']), r = rng.pick([2, 3, 4, 6, 8, 9, 12]);
      if (kind === 'rule') return { prompt: `Using the rule of 72, about how many years does it take money to double at ${r}% interest compounded annually?`, type: 'number', answer: 72 / r, unit: 'years', params: { kind, r }, hints: [`Divide 72 by the rate.`, `72 ÷ ${r} = <b>${72 / r}</b> years.`] };
      if (kind === 'grow') {
        const k = rng.int(1, 4), T = k * 72 / r, P = rng.pick([500, 1000, 1500, 2500, 4000]), ans = P * 2 ** k;
        return { prompt: `Using the rule of 72, about how much will ${$(P)} grow to in ${T} years at ${r}% interest compounded annually?`, type: 'number', answer: ans, unit: '$', params: { kind, r, T, P },
          hints: [`It doubles about every 72 ÷ ${r} = ${72 / r} years, so ${T} years is ${k} doubling${k === 1 ? '' : 's'}.`, `${$(P)} × ${2 ** k} = <b>${$(ans)}</b>.`] };
      }
      const rr = rng.pick([2, 2.5, 3, 4, 5, 6, 7, 8, 10]); let y = 0, b = 1; while (b < 2) { b *= 1 + rr / 100; y++; }
      return { prompt: `Money is invested at ${N(rr)}% interest compounded annually. After how many whole years will it first be at least double the starting amount?`, type: 'number', answer: y, unit: 'years', params: { kind, r: rr },
        hints: [`The rule of 72 estimates 72 ÷ ${N(rr)} ≈ ${N(M.round(72 / rr, 1))} years. Check whole years near that.`, `(${N(1 + rr / 100)})<sup>${y - 1}</sup> ≈ ${N(M.round((1 + rr / 100) ** (y - 1), 3))} is short of 2, and (${N(1 + rr / 100)})<sup>${y}</sup> ≈ ${N(M.round((1 + rr / 100) ** y, 3))} reaches it: <b>${y}</b> years.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'rule') return near(q.answer * P.r, 72, 1e-9) && Math.abs(q.answer - Math.log(2) / Math.log(1 + P.r / 100)) < 0.1 * q.answer;
      if (P.kind === 'grow') return near(q.answer / P.P, 2 ** (P.T * P.r / 72), 1e-9);
      const L = Math.log(2) / Math.log(1 + P.r / 100); return q.answer === Math.ceil(L - 1e-12);
    },
  });

  

/* ---------- Unit 4: loans and credit ---------- */
  /** the monthly payment that pays off principal P (dollars) at APR r (percent) in n months */
  const payment = (P, r, n) => { const i = r / 1200; return P * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1); };
  const PMT = `${V('M')} = ${V('P')} · ${F(`${V('i')}(1 + ${V('i')})<sup>${V('n')}</sup>`, `(1 + ${V('i')})<sup>${V('n')}</sup> − 1`)}`;
  const LOANS = [['car loan', 8000, 32000], ['student loan', 5000, 25000], ['loan for a used car', 4000, 15000], ['home improvement loan', 6000, 20000]];
  A.skill({
    id: 'fin.loan-payment', title: 'Monthly loan payments',
    learn: p(`Most loans are paid back in equal monthly payments that cover both interest and principal. The payment is <b>${PMT}</b>, where ${V('P')} is the amount borrowed, ${V('i')} is the monthly rate (the APR ÷ 12, as a decimal), and ${V('n')} is the number of monthly payments.`) +
      p(`Work it step by step on a calculator: find ${V('i')}, then (1 + ${V('i')})<sup>${V('n')}</sup>, then the fraction, and round the payment to the nearest cent at the end.`) +
      example('Example', `$12,000 at 6% APR for 4 years: ${V('i')} = 0.005, ${V('n')} = 48, and (1.005)<sup>48</sup> ≈ 1.27049. ${V('M')} = 12,000 × 0.005 × 1.27049 ÷ 0.27049 ≈ <b>$281.82</b> a month.`),
    make(rng) {
      const [what, lo, hi] = rng.pick(LOANS), P = rng.int(lo / 500, hi / 500) * 500, r = rng.pick([3.9, 4.5, 5, 5.5, 6, 6.5, 7.2, 8, 9.5]), y = rng.int(2, 6), n = 12 * y, Mv = payment(P, r, n), ans = M.round(Mv, 2), g = Math.pow(1 + r / 1200, n);
      return { prompt: `${AnD(P)} ${$(P)} ${what} has an APR of ${N(r)}% and is repaid in equal monthly payments over ${y} years. What is the monthly payment, to the nearest cent?${`<div class="big">${PMT}</div>`}`, type: 'number', answer: ans, unit: '$', tolerance: 0.01, params: { P, r, n },
        hints: [`${V('i')} = ${N(r)} ÷ 1200 ≈ ${N(M.round(r / 1200, 7))} (keep every digit on your calculator) and ${V('n')} = ${n}.`, `(1 + ${V('i')})<sup>${n}</sup> ≈ ${N(M.round(g, 5))}.`, `${V('M')} = ${N(P)} × ${N(M.round(r / 1200, 7))} × ${N(M.round(g, 5))} ÷ ${N(M.round(g - 1, 5))} ≈ <b>${$(ans)}</b>.`] };
    },
    verify(q) {
      // find the payment that leaves exactly $0 owed, by bisection on a month-by-month simulation
      const P = q.params, owed = m => { let b = P.P; for (let k = 0; k < P.n; k++) b = b * (1 + P.r / 1200) - m; return b; };
      let lo = 0, hi = P.P; for (let it = 0; it < 80; it++) { const mid = (lo + hi) / 2; if (owed(mid) > 0) lo = mid; else hi = mid; }
      return centsOk(q.answer, lo);
    },
  });

  A.skill({
    id: 'fin.loan-cost', title: 'The total cost of a loan',
    learn: p(`<b>Total paid = monthly payment × number of payments</b> (plus any down payment). The <b>finance charge</b>, the total interest, is the total paid minus the amount borrowed.`) +
      p(`A longer loan has a smaller monthly payment but usually costs much more in interest. A <b>down payment</b> lowers the amount you borrow: borrow the price minus the down payment.`) +
      example('Example', `A $9,000 loan paid with 36 payments of $273.81 costs 36 × 273.81 = $9,857.16 in all, so the finance charge is <b>$857.16</b>.`),
    make(rng) {
      const kind = rng.pick(['finance-charge', 'total-with-down', 'longer-term', 'down-payment']), [what, lo, hi] = rng.pick(LOANS), P = rng.int(lo / 500, hi / 500) * 500, r = rng.pick([4.5, 5, 6, 6.5, 7.2, 8, 9.5]), y = rng.int(2, 6), n = 12 * y, Mc = ct(payment(P, r, n));
      if (kind === 'finance-charge') return { prompt: `${AnD(P)} ${$(P)} ${what} is repaid with ${n} monthly payments of ${$(dl(Mc))}. What is the finance charge (the total interest paid), in dollars?`, type: 'number', answer: dl(Mc * n - P * 100), unit: '$', params: { kind, P, n, Mc },
        hints: [`Total paid: ${n} × ${$(dl(Mc))} = ${$(dl(Mc * n))}.`, `Finance charge: ${$(dl(Mc * n))} − ${$(P)} = <b>${$(dl(Mc * n - P * 100))}</b>.`] };
      if (kind === 'total-with-down') {
        const down = rng.pick([500, 1000, 1500, 2000, 2500]), price = P + down;
        return { prompt: `${rng.pick(NAMES)} buys ${anD(price)} ${$(price)} car with ${$(down)} down and ${n} monthly payments of ${$(dl(Mc))}. What is the total cost of the car, in dollars?`, type: 'number', answer: dl(down * 100 + Mc * n), unit: '$', params: { kind, down, n, Mc },
          hints: [`Payments: ${n} × ${$(dl(Mc))} = ${$(dl(Mc * n))}.`, `Add the down payment: ${$(dl(Mc * n))} + ${$(down)} = <b>${$(dl(down * 100 + Mc * n))}</b>.`] };
      }
      if (kind === 'longer-term') {
        const n2 = n + 24, M2 = ct(payment(P, r, n2)), i1 = Mc * n - P * 100, i2 = M2 * n2 - P * 100;
        return { prompt: `${AnD(P)} ${$(P)} ${what} at ${N(r)}% APR can be repaid with ${n} payments of ${$(dl(Mc))} or ${n2} payments of ${$(dl(M2))}. How much more interest does the longer loan cost, in dollars?`, type: 'number', answer: dl(i2 - i1), unit: '$', params: { kind, P, n, Mc, n2, M2 },
          hints: [`Interest on the shorter loan: ${n} × ${$(dl(Mc))} − ${$(P)} = ${$(dl(i1))}. On the longer loan: ${n2} × ${$(dl(M2))} − ${$(P)} = ${$(dl(i2))}.`, `Difference: <b>${$(dl(i2 - i1))}</b> more, even though each payment is smaller.`] };
      }
      const price = rng.int(16, 60) * 500, pc = rng.pick([10, 15, 20, 25]), down = pctOf(price * 100, pc);
      return { prompt: `A car costs ${$(price)}. The buyer makes a ${pc}% down payment and borrows the rest. How much is borrowed, in dollars?`, type: 'number', answer: dl(price * 100 - down), unit: '$', params: { kind, price, pc },
        hints: [`Down payment: ${N(pc / 100)} × ${$(price)} = ${$(dl(down))}.`, `Borrowed: ${$(price)} − ${$(dl(down))} = <b>${$(dl(price * 100 - down))}</b>.`] };
    },
    verify(q) {
      const P = q.params, B = x => BigInt(x);
      if (P.kind === 'finance-charge') return B(P.Mc) * B(P.n) - B(P.P) * 100n === B(ct(q.answer));
      if (P.kind === 'total-with-down') return B(P.down) * 100n + B(P.Mc) * B(P.n) === B(ct(q.answer));
      if (P.kind === 'longer-term') return (B(P.M2) * B(P.n2)) - (B(P.Mc) * B(P.n)) === B(ct(q.answer));
      return B(P.price) * 100n - B(bigPct(P.price * 100, P.pc * 1000)) === B(ct(q.answer));
    },
  });

  const APRS = [17.99, 19.99, 21.99, 22.49, 24.99, 26.99, 29.99];
  /** a month's interest in cents on a balance in cents at an APR (percent, two decimals): balance × APR ÷ 12, nearest cent */
  const monthInt = (cents, apr) => Math.round(cents * Math.round(apr * 100) / 120000);
  A.skill({
    id: 'fin.credit-cards', title: 'Credit card interest',
    learn: p(`A credit card's interest rate is given as an <b>APR</b> (annual percentage rate). Each month, interest is roughly the balance times the <b>monthly rate, APR ÷ 12</b>: at 24% APR that's 2% a month. Card rates are high, so a balance that isn't paid off grows fast.`) +
      p(`Cards ask for a <b>minimum payment</b>, often a small percent of the balance or a fixed amount, whichever is greater. Paying only the minimum keeps most of the balance on the card, still collecting interest.`) +
      example('Example', `A $1,850.00 balance at 21.99% APR: one month's interest is 1,850 × 0.2199 ÷ 12 ≈ <b>$33.90</b>.`),
    make(rng) {
      const kind = rng.pick(['interest', 'minimum', 'new-balance']), apr = rng.pick(APRS), bal = rng.int(30000, 600000), who = rng.pick(NAMES);
      if (kind === 'interest') { const I = monthInt(bal, apr); return { prompt: `${who}'s credit card has a balance of ${$(dl(bal))} and an APR of ${N(apr)}%. How much interest is charged for one month, to the nearest cent?`, type: 'number', answer: dl(I), unit: '$', params: { kind, bal, apr }, hints: [`Monthly rate: ${N(apr)}% ÷ 12 ≈ ${N(M.round(apr / 12, 4))}%.`, `${N(dl(bal))} × ${N(apr / 100)} ÷ 12 = ${N(M.round(bal * apr / 120000, 4))} ≈ <b>${$(dl(I))}</b>.`] }; }
      if (kind === 'minimum') {
        const pc = rng.pick([2, 3]), floor = rng.pick([25, 35]), b2 = rng.chance(0.3) ? rng.int(30000, floor * 100 * 100 / pc) : bal, m = Math.max(floor * 100, pctOf(b2, pc));
        return { prompt: `A credit card's minimum payment is ${pc}% of the balance or ${$(floor)}, whichever is greater. What is the minimum payment on a balance of ${$(dl(b2))}?`, type: 'number', answer: dl(m), unit: '$', params: { kind, bal: b2, pc, floor },
          hints: [`${pc}% of ${$(dl(b2))} is ${$(dl(pctOf(b2, pc)))}.`, `The greater of ${$(dl(pctOf(b2, pc)))} and ${$(floor)} is <b>${$(dl(m))}</b>.`] };
      }
      const pay = rng.int(50, Math.max(60, Math.floor(bal / 200))) * 100, I = monthInt(bal, apr), buys = rng.pick([0, 0, rng.int(1500, 20000)]), nb = bal + I - pay + buys;
      return { prompt: `${who}'s card has a balance of ${$(dl(bal))} at ${N(apr)}% APR. This month the card adds one month's interest on that balance, ${who} pays ${$(dl(pay))}${buys ? `, and makes new purchases of ${$(dl(buys))}` : ''}. What is the new balance, in dollars?`, type: 'number', answer: dl(nb), unit: '$', params: { kind, bal, apr, pay, buys },
        hints: [`Interest: ${N(dl(bal))} × ${N(apr / 100)} ÷ 12 ≈ ${$(dl(I))}.`, `${$(dl(bal))} + ${$(dl(I))} − ${$(dl(pay))}${buys ? ` + ${$(dl(buys))}` : ''} = <b>${$(dl(nb))}</b>.`] };
    },
    verify(q) {
      const P = q.params, half = (num, den) => Number((2n * num + den) / (2n * den));
      const I = () => half(BigInt(P.bal) * BigInt(Math.round(P.apr * 100)), 120000n);
      if (P.kind === 'interest') return dl(I()) === q.answer;
      if (P.kind === 'minimum') return dl(Math.max(P.floor * 100, bigPct(P.bal, P.pc * 1000))) === q.answer;
      return dl(P.bal + I() - P.pay + P.buys) === q.answer;
    },
  });

  A.skill({
    id: 'fin.amortization', title: 'Inside a loan payment',
    learn: p(`Each loan payment is split in two. First, <b>interest for the month = balance × APR ÷ 12</b>. The <b>rest of the payment goes to principal</b> and lowers the balance. So the new balance = old balance − (payment − interest).`) +
      p(`Early on, much of each payment is interest; as the balance shrinks, more goes to principal. A table of these splits month by month is an <b>amortization schedule</b>.`) +
      example('Example', `A $15,000 balance at 6% APR with a $290.00 payment: interest is 15,000 × 0.06 ÷ 12 = $75.00, principal is $215.00, and the new balance is <b>$14,785.00</b>.`),
    make(rng) {
      const [what, lo, hi] = rng.pick(LOANS), bal = rng.int(lo / 10, hi / 10) * 1000 + rng.pick([0, 0, 2550, 7525]), r = rng.pick([3.6, 4.2, 4.8, 5.4, 6, 6.6, 7.2, 8.4]), Mc = Math.ceil(ct(payment(bal / 100, r, 12 * rng.int(3, 6))) / 100) * 100;
      const I = monthInt(bal, r), prin = Mc - I, nb = bal - prin, ask = rng.pick(['interest', 'principal', 'balance']), ans = { interest: I, principal: prin, balance: nb }[ask];
      const what2 = { interest: 'how much of the next payment goes to interest', principal: 'how much of the next payment goes to principal', balance: 'what is the balance after the next payment' }[ask];
      return { prompt: `A ${what} has a balance of ${$(dl(bal))} at ${N(r)}% APR, with monthly payments of ${$(dl(Mc))}. To the nearest cent, ${what2}?`, type: 'number', answer: dl(ans), unit: '$', params: { bal, r, Mc, ask },
        hints: [`Interest: ${N(dl(bal))} × ${N(r / 100)} ÷ 12 ≈ ${$(dl(I))}.`, `Principal: ${$(dl(Mc))} − ${$(dl(I))} = ${$(dl(prin))}.${ask === 'balance' ? ` New balance: ${$(dl(bal))} − ${$(dl(prin))} = ${$(dl(nb))}.` : ''}`, `<b>${$(dl(ans))}</b>.`] };
    },
    verify(q) {
      const P = q.params, I = Number((2n * BigInt(P.bal) * BigInt(Math.round(P.r * 100)) + 120000n) / 240000n);
      return dl({ interest: I, principal: P.Mc - I, balance: P.bal - (P.Mc - I) }[P.ask]) === q.answer;
    },
  });
})();
