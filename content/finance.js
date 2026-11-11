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
})();
