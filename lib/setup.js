/* Word problems → equations (#/setup): read a story, write the equation (or inequality) it describes,
   solve it, and answer the question — the way CPM teaches word problems: define the variable, write it,
   solve, answer in a sentence.

   Each story comes from a template with a known model equation. A learner's equation is accepted when it
   has exactly the same solutions as the model (checked by calculation with lib/steps.js, so any correct
   form counts: 50 + 30m = 290, 30m + 50 = 290, 290 = 50 + 30m…), uses the story's numbers, and is not
   already the answer. A wrong one gets its own solution checked against the story: "your equation says
   m = 7; $50 + $30 × 7 = $260, but Maya paid $290." Then the step checker helps solve it. */
'use strict';
(function () {
  const S = window.STORE, V = window.VIEWS, H = V._h, esc = H.esc, St = window.STEPS;
  const N = 5;                                     // problems in a set
  const times = k => ({ 2: 'twice', 3: 'three times', 4: 'four times', 5: 'five times', 6: 'six times' }[k] || k + ' times');
  const money = x => '$' + (Number.isInteger(x) ? String(x) : x.toFixed(2));
  const num = x => (Number.isInteger(x) ? String(x) : String(Math.round(x * 100) / 100));

  /* each template: a story, the variable, a model with {v} for the letter, the answer and how to check a guess */
  const T = [
    r => { const fee = r.pick([25, 30, 40, 50]), rate = r.pick([20, 25, 30, 35, 40]), m = r.int(3, 12), tot = fee + rate * m;
      return { story: `A gym charges a ${money(fee)} sign-up fee and then ${money(rate)} a month. Maya has paid ${money(tot)} in all. How many months has she been a member?`, v: 'm', what: 'the number of months', model: `${fee} + ${rate}{v} = ${tot}`, ans: m, unit: 'months', nums: [fee, rate, tot], need: 3,
        hint: `The ${money(fee)} is paid once. Each month adds ${money(rate)}, so m months add ${rate}m. Together they make the total.`, check: x => `${money(fee)} + ${money(rate)} × ${num(x)} = ${money(fee + rate * x)}, but Maya paid ${money(tot)}.` }; },
    r => { const have = r.int(4, 30) * 5, per = r.pick([10, 15, 20, 25]), w = r.int(3, 15), goal = have + per * w;
      return { story: `Diego has ${money(have)} saved and saves ${money(per)} more each week. After how many weeks will he have ${money(goal)}?`, v: 'w', what: 'the number of weeks', model: `${have} + ${per}{v} = ${goal}`, ans: w, unit: 'weeks', nums: [have, per, goal], need: 3,
        hint: `Start with what he has, ${money(have)}. Each week adds ${money(per)}: after w weeks that is ${per}w more.`, check: x => `${money(have)} + ${money(per)} × ${num(x)} = ${money(have + per * x)}, not ${money(goal)}.` }; },
    r => { const start = r.pick([3, 4, 5]), per = r.pick([2, 2.5, 3]), d = r.int(4, 15), tot = start + per * d;
      return { story: `A taxi charges ${money(start)} to start plus ${money(per)} for each mile. A ride costs ${money(tot)}. How many miles long was it?`, v: 'd', what: 'the number of miles', model: `${start} + ${per}{v} = ${tot}`, ans: d, unit: 'miles', nums: [start, per, tot], need: 3,
        hint: `${money(start)} once, plus ${money(per)} for every mile: ${per}d for d miles.`, check: x => `${money(start)} + ${money(per)} × ${num(x)} = ${money(start + per * x)}, not ${money(tot)}.` }; },
    r => { const k = r.int(2, 6), c = r.int(1, 12), n = r.int(2, 15), more = r.bool() || k * n <= c, val = more ? k * n + c : k * n - c;
      return { story: `${c} ${more ? 'more' : 'less'} than ${times(k)} a number is ${val}. What is the number?`, v: 'n', what: 'the number', model: `${k}{v} ${more ? '+' : '-'} ${c} = ${val}`, ans: n, unit: '', nums: [k, c, val], need: 2,
        hint: `"${times(k)[0].toUpperCase() + times(k).slice(1)} a number" is ${k}n; "${c} ${more ? 'more than' : 'less than'}" that ${more ? 'adds' : 'takes away'} ${c}.`, check: x => `${times(k)} ${num(x)} is ${num(k * x)}, and ${c} ${more ? 'more' : 'less'} is ${num(more ? k * x + c : k * x - c)}, not ${val}.` }; },
    r => { const L = r.int(8, 20), w = r.int(2, L - 2), P = 2 * L + 2 * w;
      return { story: `A rectangle is ${L} cm long and its perimeter is ${P} cm. How wide is it?`, v: 'w', what: 'the width in cm', model: `2(${L}) + 2{v} = ${P}`, ans: w, unit: 'cm', nums: [L, P], need: 1,
        hint: `The perimeter goes around all four sides: two lengths and two widths.`, check: x => `two lengths and two widths: ${L} + ${L} + ${num(x)} + ${num(x)} = ${num(2 * L + 2 * x)} cm, not ${P} cm.` }; },
    r => { const n = r.int(-4, 30), sum = 3 * n + 3;
      return { story: `The sum of three consecutive integers is ${sum}. What is the smallest of them?`, v: 'n', what: 'the smallest integer', model: `{v} + ({v} + 1) + ({v} + 2) = ${sum}`, ans: n, unit: '', nums: [sum], need: 1,
        hint: `Consecutive integers go up by 1: if the smallest is n, the next two are n + 1 and n + 2.`, check: x => `${num(x)} + ${num(x + 1)} + ${num(x + 2)} = ${num(3 * x + 3)}, not ${sum}.` }; },
    r => { let k, c, x; do { k = r.pick([2, 3, 4]); x = r.int(20, 50); c = 180 - (k + 1) * x; } while (c < 5 || c > 60);
      return { story: `Two angles are supplementary. The larger one is ${c}° more than ${times(k)} the smaller one. How big is the smaller angle?`, v: 'x', what: 'the smaller angle, in degrees', model: `{v} + (${k}{v} + ${c}) = 180`, ans: x, unit: '°', nums: [c, 180], need: 2,
        hint: `Supplementary angles add up to 180°. The larger angle is ${k}x + ${c}.`, check: v => `${num(v)}° + (${k} × ${num(v)} + ${c})° = ${num(v + k * v + c)}°, not 180°.` }; },
    r => { const k = r.pick([2, 3]), c = r.int(3, 12), extra = r.int(1, 6), ana = k * c + extra;
      return { story: `Ana is ${extra} years older than ${times(k)} her cousin’s age. Ana is ${ana}. How old is her cousin?`, v: 'c', what: 'her cousin’s age', model: `${k}{v} + ${extra} = ${ana}`, ans: c, unit: 'years old', nums: [extra, ana], need: 2,
        hint: `${times(k)[0].toUpperCase() + times(k).slice(1)} the cousin’s age is ${k}c; Ana is ${extra} more than that.`, check: x => `${times(k)} ${num(x)} is ${num(k * x)}, plus ${extra} is ${num(k * x + extra)}, but Ana is ${ana}.` }; },
    r => { const A = r.pick([12, 15, 18, 20]), B = r.pick([6, 8, 9, 10]), k = r.int(2, 5), s = r.int(2, 9), tot = A * k + B * s;
      return { story: `Adult tickets cost ${money(A)} and student tickets cost ${money(B)}. A group buys ${k} adult tickets and some student tickets for ${money(tot)}. How many student tickets did they buy?`, v: 's', what: 'the number of student tickets', model: `${A}(${k}) + ${B}{v} = ${tot}`, ans: s, unit: 'tickets', nums: [A, B, k, tot], need: 2,
        hint: `${k} adult tickets cost ${A} × ${k}; s student tickets cost ${B}s. Together they cost the total.`, check: x => `${money(A)} × ${k} + ${money(B)} × ${num(x)} = ${money(A * k + B * x)}, not ${money(tot)}.` }; },
    r => { const n = r.pick([3, 4, 5, 6]), tip = r.int(1, 4), share = r.int(6, 15), bill = n * share;
      return { story: `${n} friends split a restaurant bill equally, and each also adds ${money(tip)} for the tip. Each friend pays ${money(share + tip)} in all. What was the bill, before the tip?`, v: 'b', what: 'the bill in dollars', model: `{v}/${n} + ${tip} = ${share + tip}`, ans: bill, unit: 'dollars', nums: [n, tip, share + tip], need: 3,
        hint: `Each friend’s share of the bill is b ÷ ${n}; then each adds ${money(tip)}.`, check: x => `${money(x)} ÷ ${n} = ${money(x / n)}, plus ${money(tip)} is ${money(x / n + tip)}, not ${money(share + tip)}.` }; },
    r => { const have = r.int(2, 12) * 5, rate = r.pick([8, 10, 12, 15]), h = r.int(3, 12), goal = have + rate * h - r.int(0, rate - 1);
      return { ineq: true, story: `Kai has ${money(have)} and earns ${money(rate)} an hour. He wants at least ${money(goal)}. At least how many whole hours must he work?`, v: 'h', what: 'the number of hours', model: `${have} + ${rate}{v} >= ${goal}`, ans: h, unit: 'hours', nums: [have, rate, goal], need: 3,
        hint: `"At least" means ≥. What he has plus ${money(rate)} for each of h hours must be at least ${money(goal)}.`, check: x => `with ${num(x)} hours he would have ${money(have + rate * x)}.`, ask: 'the smallest whole number of hours' }; },
    r => { const base = r.pick([15, 20, 25]), per = r.pick([5, 8, 10]), g = r.int(2, 9), max = base + per * g + r.int(0, per - 1);
      return { ineq: true, story: `A phone plan costs ${money(base)} a month plus ${money(per)} for each GB of data. Lena can spend at most ${money(max)} a month. At most how many whole GB can she use?`, v: 'g', what: 'the number of GB', model: `${base} + ${per}{v} <= ${max}`, ans: g, unit: 'GB', nums: [base, per, max], need: 3,
        hint: `"At most" means ≤. The plan plus ${money(per)} for each of g GB must be no more than ${money(max)}.`, check: x => `with ${num(x)} GB the bill is ${money(base + per * x)}.`, ask: 'the largest whole number of GB' }; },
  ];

  /** a learner's equation against the story: { ok, msg } */
  function judge(p, raw) {
    const text = String(raw || '').replace(/[$°%]/g, '').replace(/(\d),(\d{3})/g, '$1$2').trim();
    if (!text) return { ok: false, msg: 'Enter the equation first.' };
    const parsed = St.parse(text);
    if (parsed.error) return { ok: false, msg: parsed.error };
    if (p.ineq ? parsed.kind !== 'ineq' : parsed.kind !== 'eq') return { ok: false, msg: p.ineq ? 'This story needs an inequality (with ≤ or ≥, typed as <= or >=), because of “at least” or “at most”.' : parsed.kind === 'ineq' ? 'This story needs an equation, with an = sign.' : 'An equation needs an = sign, with the story on both sides.' };
    if (parsed.vars.length !== 1) return { ok: false, msg: parsed.vars.length ? `Use only one letter, ${p.v}, for ${p.what}.` : `Use a letter (${p.v}) for ${p.what}.` };
    const v = parsed.vars[0];
    const used = window.COACH ? COACH.numbersIn(text) : [];
    const given = p.nums.filter(x => used.some(u => Math.abs(Math.abs(u) - Math.abs(x)) < 1e-9)).length;   // 3n-5 reads as −5
    const res = St.check([p.model.replace(/\{v\}/g, v), text])[1];
    // the step checker treats < and ≤ alike (it samples away from the boundary), but “at least” includes the amount itself
    if (p.ineq && (parsed.op === '<' || parsed.op === '>') && (res.status === 'ok' || res.status === 'solved')) return { ok: false, msg: `Nearly correct. “At least” and “at most” include the amount itself, so use ${parsed.op === '>' ? '≥ (type >=)' : '≤ (type <=)'}, not ${parsed.op}.` };
    if (res.status === 'solved' || /^\s*[a-z]\s*(=|<=|>=|<|>)\s*[-\d.]+\s*$/i.test(text)) return { ok: false, msg: `That is the answer, not the ${p.ineq ? 'inequality' : 'equation'}. Write what the story says, using its numbers, then solve it.` };
    if (res.status === 'ok' && given >= Math.min(p.need, p.nums.length)) return { ok: true, v };
    if (res.status === 'ok') return { ok: false, msg: `True, but write it directly from the story, using its numbers (${p.nums.map(x => num(x)).join(', ')}).` };
    // wrong: what does their equation say, checked in the story?
    const z = parsed.kind === 'eq' ? St.zeros(parsed.F) : null;
    if (Array.isArray(z) && z.length === 1) return { ok: false, msg: `Your equation says ${v} = ${num(z[0])}. Check that in the story: ${p.check(z[0])} Look again at what each number means.` };
    return { ok: false, msg: res.msg && res.status === 'bad' && /flip|wrong way/.test(res.msg) ? 'Check the direction: “at least” means ≥ and “at most” means ≤.' : 'That does not match the story. Consider what each number means and how the parts combine.' };
  }

  function page(root) {
    let set, i, phase, first, hinted, results, lines;
    const start = () => {
      const r = RNG.make('setup:' + Date.now() + Math.random());
      const order = r.shuffle(T.map((_, k) => k)).slice(0, N);
      set = order.map(k => T[k](r)); i = 0; results = [];
      next();
    };
    const next = () => { phase = 'write'; first = true; hinted = false; lines = null; draw(); };
    function draw(msg, good) {
      if (i >= set.length) return summary();
      const p = set[i];
      root.innerHTML = `<div class="setup">
        <div class="ex-head"><a class="btn sm ghost back" href="#/">← Home</a><h1>Word problems → equations</h1><div class="dots">${set.map((_, k) => `<span class="${k < i ? (results[k].eq ? 'right' : 'hinted') : k === i ? 'current' : ''}"></span>`).join('')}</div></div>
        <div class="card">
          <div class="q-tools">${window.COACH ? COACH.speakBtn(esc(p.story), 'Read the story aloud') : ''}</div>
          <p class="setup-story">${esc(p.story)}</p>
          <ol class="setup-steps">
            <li class="${phase === 'write' ? 'now' : 'done'}"><b>Define the variable.</b> Let <i>${p.v}</i> = ${esc(p.what)}.</li>
            <li class="${phase === 'write' ? 'now' : 'done'}"><b>Write ${p.ineq ? 'an inequality' : 'an equation'}</b> that says what the story says.
              ${phase === 'write' ? `<div class="row setup-row"><input id="su-eq" class="step-in" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="${p.ineq ? 'For example, 20 + 5x >= 60' : 'For example, 20 + 5x = 60'}" aria-label="Your ${p.ineq ? 'inequality' : 'equation'}"><button class="btn primary" id="su-check" type="button">Check</button></div>
                <div class="btn-row" style="margin-top:6px"><button class="btn sm ghost" id="su-hint" type="button" ${hinted ? 'disabled' : ''}>Show a hint</button><button class="btn sm ghost" id="su-show" type="button">Show the ${p.ineq ? 'inequality' : 'equation'}</button></div>
                ${hinted ? `<div class="hint"><div class="hn">Hint</div>${esc(p.hint)}</div>` : ''}`
                : `<div class="setup-eq">${esc(p.written)}</div>`}
              ${msg ? `<div class="${good ? 'feedback good' : 'coach-note'}"><span>${esc(msg)}</span></div>` : ''}</li>
            <li class="${phase === 'solve' ? 'now' : phase === 'done' ? 'done' : ''}"><b>Solve it</b>, step by step${phase === 'solve' ? ' (each line is checked as you type):' : '.'}
              ${phase !== 'write' ? '<div class="steps-box" id="su-steps"></div>' : ''}</li>
            <li class="${phase === 'solve' ? 'now' : phase === 'done' ? 'done' : ''}"><b>Answer the question.</b>${p.ask ? ` <span class="muted small">(${esc(p.ask)})</span>` : ''}
              ${phase === 'solve' ? `<div class="row setup-row"><input id="su-ans" inputmode="decimal" autocomplete="off" aria-label="Your answer" placeholder="Your answer"><span class="unit">${esc(p.unit)}</span><button class="btn primary" id="su-ans-check" type="button">Check</button></div>`
                : phase === 'done' ? `<div class="feedback ${results[i].ans ? 'good' : 'note'}"><span>${results[i].ans ? 'Correct:' : 'The answer is'} <b>${num(p.ans)} ${esc(p.unit)}</b>.</span></div>` : ''}</li>
          </ol>
          ${phase === 'done' ? `<div class="btn-row"><button class="btn primary" id="su-next" type="button">${i + 1 === set.length ? 'Finish' : 'Next story'} →</button></div>` : ''}
        </div></div>`;
      bind(p);
      H.tutorCtx({ skill: 'Writing equations from word problems', question: p.story, notes: phase === 'write' ? `The student must write ${p.ineq ? 'an inequality' : 'an equation'} using ${p.v} = ${p.what}. Do not give the equation; help them see what each number means.` : `The student wrote ${p.written}. The answer is ${num(p.ans)} ${p.unit}.`, answerShown: phase === 'done', answer: phase === 'done' ? num(p.ans) : '' });
    }
    function bind(p) {
      const eq = root.querySelector('#su-eq');
      if (eq) {
        eq.focus();
        const check = () => {
          const j = judge(p, eq.value);
          if (j.ok) { p.written = eq.value.trim(); results[i] = { eq: first && !hinted, ans: false }; phase = 'solve'; draw('That matches the story. Now solve it.', true); }
          else { first = false; draw(j.msg); const e2 = root.querySelector('#su-eq'); if (e2) e2.value = eq.value; }
        };
        root.querySelector('#su-check').addEventListener('click', check);
        eq.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); check(); } });
        root.querySelector('#su-hint').addEventListener('click', () => { hinted = true; const v = eq.value; draw(); root.querySelector('#su-eq').value = v; });
        root.querySelector('#su-show').addEventListener('click', () => { p.written = p.model.replace(/\{v\}/g, p.v).replace(/>=/g, '≥').replace(/<=/g, '≤'); results[i] = { eq: false, ans: false }; phase = 'solve'; draw('Here is one way to write it. Compare it with the story, then solve it.', true); });
      }
      const sb = root.querySelector('#su-steps');
      if (sb) { const b = St.box(sb, { first: p.written.replace(/≥/g, '>=').replace(/≤/g, '<=').replace(/[$°%]/g, ''), lines: lines || undefined }); root.__stepsBox = b; }
      const ans = root.querySelector('#su-ans');
      if (ans) {
        const check = () => {
          const v = ACADEMY.parseNumber(ans.value);
          if (isNaN(v)) { ans.focus(); return; }
          if (root.__stepsBox) lines = root.__stepsBox.lines();          // keep their working on screen
          results[i].ans = Math.abs(v - p.ans) < 1e-9;
          S.countAnswer(results[i].eq && results[i].ans);
          phase = 'done'; draw();
          const nx = root.querySelector('#su-next'); if (nx) nx.focus();
        };
        root.querySelector('#su-ans-check').addEventListener('click', check);
        ans.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); check(); } });
      }
      const nx = root.querySelector('#su-next');
      if (nx) nx.addEventListener('click', () => { i++; next(); });
    }
    function summary() {
      const eqs = results.filter(x => x.eq).length, ans = results.filter(x => x.ans).length, pts = eqs * 15 + ans * 10;
      if (pts) S.addPoints(pts);
      S.logEvent({ kind: 'setup', title: 'Word problems → equations', right: eqs, total: set.length, pts, changes: [] });
      if (window.APP) APP.refreshStats();
      root.innerHTML = `<div class="setup"><div class="card summary"><div class="muted small" style="text-transform:uppercase;letter-spacing:.05em;font-weight:700">Word problems → equations</div>
        <h1 style="margin-top:6px">${eqs === set.length ? 'All equations correct' : 'Session complete'}</h1>
        <div class="score">${eqs} / ${set.length}</div><div class="what">${H.plural(eqs, 'equation')} written correctly on the first try, without a hint · ${ans} of ${set.length} answers correct.</div>
        <div class="chip" style="font-size:1rem">+${pts} energy points</div>
        <div class="btn-row"><button class="btn primary" id="su-again" type="button">Start a new set</button><a class="btn" href="#/steps">Open the step checker</a><a class="btn" href="#/">Home</a></div></div></div>`;
      root.querySelector('#su-again').addEventListener('click', start);
      root.__setup = { results, set };
    }
    root.__setupApi = { judge, get: () => ({ set, i, phase }) };
    start();
  }

  window.SETUP = { page, judge, T };
})();
