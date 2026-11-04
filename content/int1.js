/* Integrated Math 1 (CPM Core Connections Integrated I). Functions, linear functions and arithmetic
   sequences, equations and inequalities, systems, exponential functions and geometric sequences,
   statistics, transformations and congruence. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v;
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = s => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const X = V('x'), Y = V('y');
  const wrap = x => x < 0 ? `(${N(x)})` : N(x);                   // a negative after an operator or a coefficient
  const tail = c => c ? ' ' + M.signed(c) : '';                    // " + 3", " − 3", or nothing for 0
  const coef = a => a === 1 ? '' : a === -1 ? '−' : N(a);           // the coefficient written in front of a variable
  const mult = (a, v) => a === 1 ? N(v) : a === -1 ? '−' + N(v) : `${N(a)}(${N(v)})`;   // "2(9)", "9", "−9"
  const sfrac = (num, den) => `<span class="frac"><span class="num">${num}</span><span class="den">${den}</span></span>`;   // a fraction of expressions
  const fn = (name, arg) => `${V(name)}(${arg})`;
  const lin2 = (a, b, c) => `${M.term(a, 'x')} ${b < 0 ? '−' : '+'} ${M.term(Math.abs(b), 'y')} = ${N(c)}`;   // "3x − 2y = 7"
  const lineEq = (m, b) => `${Y} = ${M.poly([m, b])}`;
  const expRule = (a, base) => `${Y} = ${N(a)} · ${M.sup(base, X)}`;
  const set = xs => `{${xs.map(N).join(', ')}}`;
  const sorted = xs => xs.slice().sort((a, b) => a - b);
  const uniq = xs => xs.filter((x, i) => xs.indexOf(x) === i);
  const sum = xs => xs.reduce((a, b) => a + b, 0);
  const plain = s => A.stripTags(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/−/g, '-').replace(/\s+/g, ' ').trim();   // answer HTML → parseable text, for verify()
  const nums = s => (plain(s).replace(/(\d),(?=\d{3})/g, '$1').replace(/- /g, '-').match(/-?\d+(\.\d+)?/g) || []).map(Number);
  const moveWord = v => v < 0 ? `Add ${N(-v)} to` : `Subtract ${N(v)} from`;
  const moveTerm = c => c < 0 ? `add ${M.term(-c, 'x')} to` : `subtract ${M.term(c, 'x')} from`;
  /** the first k candidates that read differently from `answer` and from each other */
  function distinct(answer, cands, k) {
    const seen = new Set([A.normText(A.stripTags(answer))]), out = [];
    for (const c of cands) {
      const key = A.normText(A.stripTags(c));
      if (!seen.has(key)) { seen.add(key); out.push(c); }
      if (out.length === k) break;
    }
    return out;
  }

  A.course({
    id: 'int-1', title: 'Integrated Math 1', subject: 'High school', grade: 9, icon: 'IM1', hue: 190,
    blurb: 'Functions, linear and exponential models, equations, inequalities and systems, one-variable statistics, and transformations and congruence.',
    units: [
      { id: 'functions', title: 'Functions', blurb: 'What a function is, evaluating one, and its domain and range.', skills: ['int1.evaluate-functions', 'int1.domain-range', 'int1.function-or-not'] },
      { id: 'linear', title: 'Linear functions and arithmetic sequences', blurb: 'Slope, writing y = mx + b, reading it in context, and sequences that grow by adding.', skills: ['int1.slope', 'int1.linear-equations', 'int1.interpret-linear', 'int1.arithmetic-sequences'] },
      { id: 'equations', title: 'Equations and inequalities', blurb: 'Multi-step equations, rearranging formulas, and inequalities with a flip.', skills: ['int1.multistep-equations', 'int1.literal-equations', 'int1.inequalities'] },
      { id: 'systems', title: 'Systems of equations', blurb: 'Two equations, two unknowns: substitution, elimination, and word problems.', skills: ['int1.solve-systems', 'int1.systems-word-problems'] },
      { id: 'exponential', title: 'Exponential functions and geometric sequences', blurb: 'Sequences that grow by multiplying, percent growth and decay, and rules from tables.', skills: ['int1.geometric-sequences', 'int1.exponential-growth-decay', 'int1.exponential-from-table'] },
      { id: 'statistics', title: 'Statistics', blurb: 'Center and spread of a data set, and association in scatter plots.', skills: ['int1.center-and-spread', 'int1.scatter-association'] },
      { id: 'congruence', title: 'Transformations and congruence', blurb: 'Translations, reflections and rotations, and the triangle congruence criteria.', skills: ['int1.transformations', 'int1.congruence-criteria'] },
      { id: 'regression', title: 'Residuals, regression, and correlation', blurb: 'How far points sit from a model, whether a line fits, using a regression line, and what r does and does not tell you.', skills: ['int1.residuals', 'int1.residual-plots', 'int1.least-squares', 'int1.correlation'] },
      { id: 'distributions', title: 'Shape and spread of distributions', blurb: 'Symmetric, skewed and bimodal shapes, and measuring spread with the standard deviation.', skills: ['int1.distribution-shape', 'int1.standard-deviation'] },
      { id: 'more-equations', title: 'More equations and inequalities', blurb: 'Exponential equations with a common base, absolute value inequalities, and work-rate problems.', skills: ['int1.exponential-equations', 'int1.absolute-value-inequalities', 'int1.work-rate'] },
      { id: 'combining-functions', title: 'Combining and comparing functions', blurb: 'Adding, subtracting and multiplying functions, and finding where an exponential model meets another with a table.', skills: ['int1.combine-functions', 'int1.exponential-systems'] },
      { id: 'geometry-tools', title: 'Symmetry, constructions, and coordinate geometry', blurb: 'Lines and turns of symmetry, compass-and-straightedge constructions, and naming quadrilaterals from their vertices.', skills: ['int1.symmetry', 'int1.constructions', 'int1.classify-quadrilaterals'] },
    ],
  });

  /* ---------- Unit 1: Functions ---------- */
  A.skill({
    id: 'int1.evaluate-functions', title: 'Evaluating functions',
    learn: p(`A function is a rule that turns each input into exactly one output. ${fn('f', X)} is read “f of ${X}” and means the output of the rule f for the input ${X}. So ${fn('f', 3)} says “put 3 in for every ${X}”.`) +
      p(`<b>To evaluate a function, substitute the input for every copy of the variable, then follow the order of operations.</b> Put a negative input in parentheses so the signs survive: if ${fn('f', X)} = ${X}² − 3${X}, then ${fn('f', '−2')} = (−2)² − 3(−2) = 4 + 6 = 10, not −10 or −2.`) +
      p(`Absolute value works the same way: for ${fn('g', X)} = 2|${X} − 5| + 1, ${fn('g', 1)} = 2|1 − 5| + 1 = 2(4) + 1 = 9.`) +
      example('Example', `${big(`${fn('h', X)} = 2${X}² − 5${X} + 1. Find ${fn('h', '−3')}.`)}Substitute −3 for ${X}: 2(−3)² − 5(−3) + 1 = 2(9) + 15 + 1 = <b>34</b>.`),
    make(rng) {
      const name = rng.pick(['f', 'g', 'h']), kind = rng.pick(['linear', 'quad', 'quad', 'abs']);
      const x = rng.chance(0.6) ? rng.int(-6, -1) : rng.int(0, 6);
      let rule, ans, middle, params;
      if (kind === 'linear') {
        const m = rng.nz(-6, 6), b = rng.nz(-9, 9);
        rule = arg => `${coef(m)}${arg}${tail(b)}`; ans = m * x + b; middle = `${N(m * x)}${tail(b)}`; params = { kind, x, m, b };
      } else if (kind === 'quad') {
        const a = rng.pick([1, 1, 2, 3, -1, -2]), b = rng.nz(-5, 5), c = rng.int(-9, 9);
        rule = arg => `${coef(a)}${arg}² ${b < 0 ? '−' : '+'} ${coef(Math.abs(b))}${arg}${tail(c)}`; ans = a * x * x + b * x + c;
        middle = `${mult(a, x * x)} ${M.signed(b * x)}${tail(c)} = ${N(a * x * x)} ${M.signed(b * x)}${tail(c)}`; params = { kind, x, a, b, c };
      } else {
        const a = rng.pick([1, 2, 3, -1, -2]), h = rng.nz(-5, 5), k = rng.int(-6, 6);
        rule = arg => `${coef(a)}|${arg}${tail(-h)}|${tail(k)}`; ans = a * Math.abs(x - h) + k;
        middle = `${coef(a)}|${N(x - h)}|${tail(k)} = ${mult(a, Math.abs(x - h))}${tail(k)}`; params = { kind, x, a, h, k };
      }
      return { prompt: `${big(`${fn(name, X)} = ${rule(X)}`)}Find ${fn(name, N(x))}.`, type: 'number', answer: ans, params, hints: [
        `Replace every ${X} with ${wrap(x)}: ${fn(name, N(x))} = ${rule(`(${N(x)})`)}.`,
        `${kind === 'quad' ? 'Square first, then multiply' : kind === 'abs' ? 'Work out the inside of the absolute value first' : 'Multiply first'}: ${middle}.`,
        `${fn(name, N(x))} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const p = q.params, x = `(${p.x})`;
      const expr = p.kind === 'linear' ? `(${p.m})*${x}+(${p.b})` : p.kind === 'quad' ? `(${p.a})*${x}**2+(${p.b})*${x}+(${p.c})` : `(${p.a})*Math.abs(${x}-(${p.h}))+(${p.k})`;
      return new Function('return ' + expr)() === q.answer;      // JavaScript's own arithmetic as the second opinion
    },
  });

  /* situations with a sensible domain and range, for int1.domain-range */
  function discreteSit(text, cap, per, things, thing) {
    return { text, discrete: true, per, dBounds: [0, cap], rBounds: [0, per * cap],
      dom: `whole numbers from 0 to ${cap}`, ran: `multiples of ${per} from 0 to ${N(per * cap)}`,
      wrongDom: [`all real numbers from 0 to ${cap}`, `whole numbers from 0 to ${N(per * cap)}`, `all real numbers from 0 to ${N(per * cap)}`],
      wrongRan: [`all real numbers from 0 to ${N(per * cap)}`, `whole numbers from 0 to ${N(per * cap)}`, `multiples of ${per} from 0 to ${cap}`],
      inputNote: `you can only have a whole number of ${things}, and at most ${cap}.`,
      outputNote: `each extra ${thing} adds ${per}, so the outputs go up in steps of ${per}, from 0 to ${per} × ${cap} = ${N(per * cap)}.` };
  }
  function continuousSit(text, T, r, units, what) {
    const H = r * T;
    return { text, discrete: false, per: 0, dBounds: [0, T], rBounds: [0, H],
      dom: `all real numbers from 0 to ${T}`, ran: `all real numbers from 0 to ${H}`,
      wrongDom: [`whole numbers from 0 to ${T}`, `all real numbers from 0 to ${H}`, `whole numbers from 0 to ${H}`],
      wrongRan: [`whole numbers from 0 to ${H}`, `all real numbers from 0 to ${T}`, `whole numbers from 0 to ${T}`],
      inputNote: `time flows continuously, so any number of ${units} from 0 up to the moment it runs out (${H} ÷ ${r} = ${T}) makes sense.`,
      outputNote: `the ${what} starts at ${H} and falls smoothly to 0, taking every value in between.` };
  }
  const SITUATIONS = [
    rng => { const pr = rng.pick([5, 6, 8, 10, 12]), cap = rng.pick([40, 50, 60, 80, 100, 120]); return discreteSit(`Tickets to a school play cost ${M.money(pr)} each, and the hall holds ${cap} people. The function ${fn('C', V('n'))} gives the cost in dollars of buying ${V('n')} tickets.`, cap, pr, 'tickets', 'ticket'); },
    rng => { const per = rng.pick([4, 6, 8, 12]), cap = rng.pick([10, 15, 20, 25, 30]); return discreteSit(`A bakery packs muffins ${per} to a box and bakes at most ${cap} boxes a day. The function ${fn('M', V('b'))} gives the number of muffins in ${V('b')} boxes.`, cap, per, 'boxes', 'box'); },
    rng => { const r = rng.pick([2, 3, 4]), T = rng.int(4, 10); return continuousSit(`A candle ${N(r * T)} cm tall burns down at a steady ${r} cm per hour until it is gone. The function ${fn('h', V('t'))} gives its height in cm after ${V('t')} hours.`, T, r, 'hours', 'height'); },
    rng => { const r = rng.pick([20, 25, 40, 50]), T = rng.int(6, 15); return continuousSit(`A tank holding ${N(r * T)} liters drains at a steady ${r} liters per minute until it is empty. The function ${fn('V', V('t'))} gives the volume in liters after ${V('t')} minutes.`, T, r, 'minutes', 'volume'); },
  ];

  A.skill({
    id: 'int1.domain-range', title: 'Domain and range',
    learn: p(`The <b>domain</b> of a function is the set of all its inputs (the ${X}-values); the <b>range</b> is the set of all its outputs (the ${Y}-values). For a list of points, the domain is the set of first coordinates and the range the set of second coordinates. A value that repeats is written only once.`) +
      p(`For a real situation, ask which inputs make sense. Tickets come in whole numbers; time flows continuously, so it takes every value in an interval. The range is then every output those inputs can produce: whole-number tickets at $8 give costs that go up in steps of 8.`) +
      example('Example', `${big('{(−2, 4), (0, 1), (3, 4), (5, 7)}')}Domain: {−2, 0, 3, 5}. Range: {1, 4, 7} — the output 4 is listed once.`),
    make(rng) {
      const ask = rng.pick(['dom', 'ran']), word = ask === 'dom' ? 'domain' : 'range';
      if (rng.bool()) {
        const xs = sorted(rng.sample([-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6], 4));
        const ys = [0, 1, 2, 3].map(() => rng.int(-9, 9));
        if (rng.bool()) ys[rng.int(2, 3)] = ys[rng.int(0, 1)];                      // a repeated output
        const dom = uniq(sorted(xs)), ran = uniq(sorted(ys));
        const right = ask === 'dom' ? dom : ran, other = ask === 'dom' ? ran : dom;
        const swapIn = (a, b) => { const v = b.find(z => !a.includes(z)); const out = a.slice(); out[rng.int(0, a.length - 1)] = v == null ? Math.max(...a) + 1 : v; return uniq(sorted(out)); };
        const answer = set(right);
        const choices = [answer].concat(distinct(answer, [set(other), set(swapIn(right, other)), set(swapIn(other, right)), set(sorted(ys)), set(right.map(v => -v))], 3));
        const shown = rng.shuffle([0, 1, 2, 3]).map(i => M.pt(xs[i], ys[i])).join(', ');
        return { prompt: `What is the ${word} of this relation?${big(`{${shown}}`)}`, type: 'choice', choices, answer, params: { kind: 'points', ask, xs, ys },
          hints: [`The ${ask === 'dom' ? 'domain is the set of inputs: the first coordinate' : 'range is the set of outputs: the second coordinate'} of every point.`,
            `Collect them: ${(ask === 'dom' ? xs : ys).map(N).join(', ')}. ${right.length < 4 ? 'A value that repeats is listed only once.' : 'List each value once, in order.'}`,
            `The ${word} is <b>${answer}</b>.`] };
      }
      const idx = rng.int(0, SITUATIONS.length - 1), s = SITUATIONS[idx](rng);
      const answer = ask === 'dom' ? s.dom : s.ran;
      return { prompt: `${s.text} What is a reasonable ${word} for this function?`, type: 'choice', choices: [answer].concat(ask === 'dom' ? s.wrongDom : s.wrongRan), answer,
        params: { kind: 'situation', ask, discrete: s.discrete, bounds: ask === 'dom' ? s.dBounds : s.rBounds, per: s.per },
        hints: [ask === 'dom' ? `The domain is the set of inputs that make sense here: ${s.inputNote}` : `The range is the set of outputs the function can actually produce: ${s.outputNote}`, `So the ${word} is <b>${answer}</b>.`] };
    },
    verify(q) {
      const p = q.params, got = nums(q.answer);
      if (p.kind === 'points') { const want = uniq(sorted(p.ask === 'dom' ? p.xs : p.ys)); return got.length === want.length && got.every((v, i) => v === want[i]); }
      const kindOk = p.discrete ? (p.ask === 'dom' ? q.answer.startsWith('whole numbers') : q.answer.startsWith(`multiples of ${p.per} `)) : q.answer.startsWith('all real numbers');
      const b = p.discrete && p.ask === 'ran' ? got.slice(1) : got;        // skip the "multiples of 8"
      return kindOk && b.length === 2 && b[0] === p.bounds[0] && b[1] === p.bounds[1];
    },
  });

  A.skill({
    id: 'int1.function-or-not', title: 'Recognizing functions',
    learn: p(`A relation is a <b>function</b> when every input has exactly one output. The test: <b>if any input appears twice with different outputs, it is not a function.</b> Two different inputs are allowed to share an output; that does not break the rule.`) +
      p(`In a table, scan the input column for repeats. In a list of ordered pairs, look for the same first coordinate twice. On a graph, the vertical line test does the same job: a vertical line may cross the graph at most once.`) +
      example('Example', `${big('{(1, 4), (2, 7), (3, 4), (2, 9)}')}The input 2 is paired with both 7 and 9, so this is <b>not a function</b>. The repeated output 4 is fine.`),
    make(rng) {
      const isFn = rng.bool(), n = 5;
      const xs = rng.sample([-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8], n), ys = rng.sample([-5, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12], n);
      let dupX = null, dupY = null, i = rng.int(0, n - 2);
      if (!isFn) { xs[i + 1] = xs[i]; dupX = xs[i]; }                                  // same input, two outputs
      if (rng.chance(isFn ? 0.7 : 0.4)) { const j = isFn ? i : (i + 2) % (n - 1); ys[j + 1] = ys[j]; dupY = ys[j]; }   // a shared output is allowed
      const order = rng.shuffle([0, 1, 2, 3, 4]), asTable = rng.bool();
      const shown = asTable ? M.table([X, Y], order.map(k => [N(xs[k]), N(ys[k])])) : big(`{${order.map(k => M.pt(xs[k], ys[k])).join(', ')}}`);
      const a = dupX != null ? dupX : rng.pick(xs), b = dupY != null ? dupY : rng.pick(ys);
      const yes = 'Yes: every input has exactly one output', noIn = `No: the input ${N(a)} has two different outputs`, noOut = `No: the output ${N(b)} appears twice`;
      const answer = isFn ? yes : noIn;
      const outs = isFn ? [] : [ys[i], ys[i + 1]];
      return { prompt: `Is ${Y} a function of ${X}?${shown}`, type: 'choice', choices: [yes, noIn, noOut], answer, params: { xs, ys },
        hints: [`Look through the inputs (the ${X}-values) for a value that appears more than once.`,
          isFn ? `No input repeats${dupY != null ? `. The output ${N(dupY)} appears twice, but a shared output is allowed` : ''}.` : `The input ${N(dupX)} appears twice, paired with ${N(outs[0])} and ${N(outs[1])}: one input, two outputs.`,
          `<b>${answer}</b>.`] };
    },
    verify(q) {
      const { xs, ys } = q.params;
      let bad = null;
      for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) if (xs[i] === xs[j] && ys[i] !== ys[j]) bad = xs[i];
      return bad == null ? q.answer.startsWith('Yes') : q.answer.startsWith('No: the input') && nums(q.answer)[0] === bad;
    },
  });

  /* ---------- Unit 2: Linear functions and arithmetic sequences ---------- */
  A.skill({
    id: 'int1.slope', title: 'Slope and rate of change',
    learn: p(`The <b>slope</b> of a line measures how steep it is: how much ${Y} changes for each step of 1 in ${X}. From two points (${X}₁, ${Y}₁) and (${X}₂, ${Y}₂): <b>slope = ${sfrac(`change in ${Y}`, `change in ${X}`)} = ${sfrac(`${Y}₂ − ${Y}₁`, `${X}₂ − ${X}₁`)}</b>. Subtract in the same order on top and bottom.`) +
      p(`A positive slope rises from left to right, a negative slope falls, and a slope of 0 is a flat line. In a table or a story the slope is the <b>rate of change</b>: dollars per hour, centimeters per week, degrees per hour.`) +
      example('Example', `${big('Find the slope of the line through (−2, 7) and (4, −5).')}${sfrac('−5 − 7', '4 − (−2)')} = ${sfrac('−12', '6')} = <b>−2</b>.`),
    make(rng) {
      const kind = rng.pick(['points', 'points', 'table', 'rate']);
      const den = kind === 'rate' ? 1 : rng.pick([1, 1, 2, 3, 4]), num = kind === 'rate' ? rng.nz(-4, 5) : rng.nz(-6, 8), k = rng.int(1, 3);
      const x1 = kind === 'rate' ? rng.int(1, 5) : rng.int(-6, 6), y1 = kind === 'rate' ? rng.int(12, 24) : rng.int(-8, 8);
      const x2 = x1 + den * k, y2 = y1 + num * k;
      const [sn, sd] = M.simp(y2 - y1, x2 - x1), ans = sn / sd;
      const base = { type: 'number', answer: ans, answerText: M.fracText(sn, sd), params: { x1, y1, x2, y2 } };
      if (kind === 'rate') {
        const ctx = rng.pick([
          { text: `At ${x1} pm the temperature was ${y1}°C, and at ${x2} pm it was ${y2}°C.`, what: 'temperature', per: 'hour', unit: '°C per hour' },
          { text: `A plant was ${y1} cm tall after ${x1} weeks and ${y2} cm tall after ${x2} weeks.`, what: 'height', per: 'week', unit: 'cm per week' },
          { text: `A tank held ${y1} liters after ${x1} minutes and ${y2} liters after ${x2} minutes.`, what: 'volume', per: 'minute', unit: 'liters per minute' }].filter(c => num > 0 || c.what !== 'height'));
        return Object.assign(base, { prompt: `${ctx.text} What was the rate of change of the ${ctx.what}, in ${ctx.unit}?`, unit: ctx.unit,
          hints: [`Rate of change = change in ${ctx.what} ÷ change in time.`, `${sfrac(`${N(y2)} − ${N(y1)}`, `${N(x2)} − ${N(x1)}`)} = ${N(y2 - y1)} ÷ ${N(x2 - x1)}.`, `The rate of change is <b>${N(ans)}</b> ${ctx.unit}.`] });
      }
      const hints = [`Slope = ${sfrac(`${Y}₂ − ${Y}₁`, `${X}₂ − ${X}₁`)}. Subtract the ${Y}-values and the ${X}-values in the same order.`,
        `${sfrac(`${N(y2)} − ${wrap(y1)}`, `${N(x2)} − ${wrap(x1)}`)} = ${sfrac(N(y2 - y1), N(x2 - x1))}.`,
        `${M.gcd(y2 - y1, x2 - x1) !== 1 ? 'Simplify: ' : ''}the slope is <b>${F(sn, sd)}</b>${sd === 1 ? '' : ` (${M.fracText(sn, sd)})`}.`];
      if (kind === 'table') {
        const xs = [x1, x2, x1 + 2 * den * k], ys = [y1, y2, y1 + 2 * num * k];
        return Object.assign(base, { hints, prompt: `The table shows points on a line. What is the slope of the line?${M.table([X, Y], xs.map((x, i) => [N(x), N(ys[i])]))}` });
      }
      return Object.assign(base, { hints, prompt: `What is the slope of the line through ${M.pt(x1, y1)} and ${M.pt(x2, y2)}?` });
    },
    verify(q) { const { x1, y1, x2, y2 } = q.params; return Math.abs(q.answer * (x2 - x1) - (y2 - y1)) < 1e-9; },   // rise = slope × run
  });

  A.skill({
    id: 'int1.linear-equations', title: 'Writing linear equations',
    learn: p(`A line is described by <b>${Y} = ${V('m')}${X} + ${V('b')}</b>, where ${V('m')} is the slope and ${V('b')} is the ${Y}-intercept: the value of ${Y} when ${X} = 0.`) +
      p(`<b>From a slope and a point:</b> put the slope in for ${V('m')}, substitute the point's coordinates for ${X} and ${Y}, and solve for ${V('b')}. <b>From two points:</b> find the slope first, then use either point to find ${V('b')}. A point's ${Y}-value is the intercept only when its ${X}-value is 0.`) +
      example('Example', `${big('Slope 3, through (2, 1).')}${Y} = 3${X} + ${V('b')}. Substitute (2, 1): 1 = 3(2) + ${V('b')}, so ${V('b')} = −5. The line is <b>${Y} = 3${X} − 5</b>.`),
    make(rng) {
      const m = rng.nz(-4, 4), x1 = rng.nz(-5, 5);
      let y1 = rng.int(-8, 8), b = y1 - m * x1;
      if (b === 0) { y1 += 2; b = 2; }
      const two = rng.bool(), dx = rng.int(1, 4) * rng.sign(), x2 = x1 + dx, y2 = y1 + m * dx;
      const answer = lineEq(m, b);
      const choices = [answer].concat(distinct(answer, [lineEq(m, y1), lineEq(m, -b), lineEq(-m, b), lineEq(b, m)], 3));
      const hints = two ? [`Find the slope first: ${sfrac(`${N(y2)} − ${wrap(y1)}`, `${N(x2)} − ${wrap(x1)}`)} = ${N(m)}.`] : [];
      hints.push(`Start from ${Y} = ${M.term(m, 'x')} + ${V('b')} and substitute ${M.pt(x1, y1)}: ${N(y1)} = ${N(m)}(${N(x1)}) + ${V('b')}.`,
        `${N(y1)} = ${N(m * x1)} + ${V('b')}, so ${V('b')} = ${N(y1)} − ${wrap(m * x1)} = ${N(b)}.`, `<b>${answer}</b>.`);
      return { prompt: two ? `Write the equation of the line through ${M.pt(x1, y1)} and ${M.pt(x2, y2)}.` : `Write the equation of the line with slope ${N(m)} that passes through ${M.pt(x1, y1)}.`,
        type: 'choice', choices, answer, params: { m, b, pts: [[x1, y1], [x2, y2]] }, hints };
    },
    verify(q) { const { m, b, pts } = q.params; return pts.every(([x, y]) => m * x + b === y) && q.answer === lineEq(m, b); },   // both points lie on the line
  });

  /* stories for int1.interpret-linear: the slope meanings say "each"/"per", the intercept meanings say "before"/"start" */
  const CONTEXTS = [
    (rng, name) => { const r = rng.pick([1.5, 2, 2.5, 3]), f = rng.int(4, 6); return { story: `A taxi company charges according to ${V('C')} = ${N(r)}${V('m')} + ${f}, where ${V('C')} is the cost in dollars of a ride of ${V('m')} miles.`, slope: r, icpt: f, v: 'm', dep: 'cost', slopeMeaning: 'The charge for each mile driven', icptMeaning: 'The fee charged before the ride starts', others: ['The total cost of the ride', 'The number of miles driven'] }; },
    (rng, name) => { const g = rng.pick([0.5, 1, 1.5, 2]), s = rng.int(6, 15); return { story: `The height in cm of ${name}'s sunflower after ${V('w')} weeks is ${V('h')} = ${N(g)}${V('w')} + ${s}.`, slope: g, icpt: s, v: 'w', dep: 'height', slopeMeaning: 'The number of cm the plant grows each week', icptMeaning: 'The height of the plant when measuring started', others: ['The height of the plant after w weeks', 'The number of weeks of growing'] }; },
    (rng, name) => { const r = rng.pick([1.5, 2, 3]), H = rng.int(15, 30); return { story: `A candle's height in cm after burning for ${V('t')} hours is ${V('h')} = −${N(r)}${V('t')} + ${H}.`, slope: -r, icpt: H, v: 't', dep: 'height', slopeMeaning: 'The number of cm the candle burns down each hour', icptMeaning: 'The height of the candle before it was lit', others: ['The height of the candle after t hours', 'The number of hours the candle has burned'] }; },
    (rng, name) => { const a = rng.pick([10, 15, 20, 25]), d = rng.int(3, 12) * 10; return { story: `${name} saves money according to ${V('S')} = ${a}${V('w')} + ${d}, where ${V('S')} is the amount in dollars saved after ${V('w')} weeks.`, slope: a, icpt: d, v: 'w', dep: 'savings', slopeMeaning: 'The amount saved each week', icptMeaning: 'The amount already saved at the start', others: ['The total amount saved after w weeks', 'The number of weeks of saving'] }; },
    (rng, name) => { const g = rng.pick([5, 8, 10]), c = rng.pick([20, 25, 30, 35]); return { story: `A phone plan costs ${V('P')} = ${g}${V('d')} + ${c} dollars a month, where ${V('d')} is the number of gigabytes of data used.`, slope: g, icpt: c, v: 'd', dep: 'bill', slopeMeaning: 'The charge per gigabyte of data', icptMeaning: 'The monthly charge before any data is used', others: ['The total monthly bill', 'The number of gigabytes used'] }; },
    (rng, name) => { const r = rng.pick([80, 100, 120, 150]), v0 = rng.int(20, 60) * 100; return { story: `A pool is being drained. Its volume in liters after ${V('t')} minutes is ${V('V')} = −${r}${V('t')} + ${N(v0)}.`, slope: -r, icpt: v0, v: 't', dep: 'volume', slopeMeaning: 'The number of liters drained each minute', icptMeaning: 'The volume of water before draining started', others: ['The volume left after t minutes', 'The number of minutes of draining'] }; },
  ];

  A.skill({
    id: 'int1.interpret-linear', title: 'Interpreting slope and intercept in context',
    learn: p(`When a line models a situation, its two numbers each mean something. In ${Y} = ${V('m')}${X} + ${V('b')}, the <b>slope ${V('m')} is the rate of change</b>: how much the output changes for each extra unit of input (dollars per mile, cm per week). The <b>${Y}-intercept ${V('b')} is the starting value</b>: the output when the input is 0, before anything has happened.`) +
      p(`A negative slope means the output goes down as the input goes up: a candle burning, a pool draining. The intercept is still the value at the start.`) +
      example('Example', `${big(`${V('C')} = 2.5${V('m')} + 4`)}for a taxi ride of ${V('m')} miles. The 2.5 is the charge for each mile; the 4 is the fee you pay before the car moves.`),
    make(rng) {
      const name = rng.pick(NAMES), ctx = rng.pick(CONTEXTS)(rng, name), which = rng.pick(['slope', 'icpt']);
      const val = which === 'slope' ? ctx.slope : ctx.icpt, answer = which === 'slope' ? ctx.slopeMeaning : ctx.icptMeaning;
      const choices = [ctx.slopeMeaning, ctx.icptMeaning].concat(ctx.others);
      return { prompt: `${ctx.story} What does the ${N(val)} represent?`, type: 'choice', choices, answer, params: { which },
        hints: [`In ${Y} = ${V('m')}${X} + ${V('b')} form, the number multiplying the variable is the slope (the rate of change), and the constant is the value when the variable is 0.`,
          which === 'slope' ? `${N(val)} multiplies ${V(ctx.v)}, so it is the change in the ${ctx.dep} for each extra unit of ${V(ctx.v)}.` : `${N(val)} is the ${ctx.dep} when ${V(ctx.v)} = 0, before anything has happened.`,
          `<b>${answer}</b>.`] };
    },
    verify(q) { return q.params.which === 'slope' ? /\b(each|per)\b/.test(q.answer) : /\b(before|start|started)\b/.test(q.answer); },
  });

  A.skill({
    id: 'int1.arithmetic-sequences', title: 'Arithmetic sequences',
    learn: p(`An <b>arithmetic sequence</b> adds the same number each time: 5, 8, 11, 14, … adds 3. That number is the <b>common difference ${V('d')}</b>. To get from the first term to the ${V('n')}th you make ${V('n')} − 1 jumps, so <b>${V('t')}(${V('n')}) = ${V('t')}(1) + (${V('n')} − 1)${V('d')}</b>.`) +
      p(`Multiplying out gives the explicit rule in slope form: ${V('t')}(${V('n')}) = ${V('d')}${V('n')} + (${V('t')}(1) − ${V('d')}). For 5, 8, 11, … that is ${V('t')}(${V('n')}) = 3${V('n')} + 2. Check it: ${V('t')}(1) = 5, ${V('t')}(2) = 8. An arithmetic sequence is a linear function whose inputs are the counting numbers.`) +
      example('Example', `${big('−4, 1, 6, 11, … What is the 20th term?')}${V('d')} = 5. ${V('t')}(20) = −4 + 19 × 5 = <b>91</b>.`),
    make(rng) {
      const d = rng.nz(-6, 8), kind = rng.pick(['nth', 'nth', 'rule', 'word']);
      let a = rng.nz(-9, 15); if (a === d) a = d > 0 ? d + 1 : d - 1;
      const terms = [0, 1, 2, 3].map(i => a + d * i), seq = `${terms.map(N).join(', ')}, …`;
      if (kind === 'rule') {
        const rule = (c0, c1) => `${V('t')}(${V('n')}) = ${M.poly([c0, c1], 'n')}`, answer = rule(d, a - d);
        const choices = [answer].concat(distinct(answer, [rule(d, a), rule(a, d), rule(d, a + d), rule(a, a - d)], 3));
        return { prompt: `An arithmetic sequence begins ${seq} Which explicit rule gives the ${V('n')}th term?`, type: 'choice', choices, answer, params: { kind, a, d, coefs: [d, a - d] },
          hints: [`The common difference is ${N(d)}, so the rule has the form ${V('t')}(${V('n')}) = ${M.term(d, 'n')} + ${V('c')}: the difference is the “slope”.`,
            `Use the first term to find ${V('c')}: ${V('t')}(1) = ${N(d)}(1) + ${V('c')} = ${N(a)}, so ${V('c')} = ${N(a)} − ${wrap(d)} = ${N(a - d)}.`,
            `<b>${answer}</b>. Check: ${V('t')}(2) = ${N(d)}(2) ${M.signed(a - d)} = ${N(terms[1])}.`] };
      }
      if (kind === 'word') {
        const s = rng.int(10, 24), dd = rng.int(2, 4), n = rng.int(8, 20), ans = s + dd * (n - 1);
        return { prompt: `A theater has ${s} seats in the first row, and each row has ${dd} more seats than the row in front of it. How many seats are in row ${n}?`, type: 'number', answer: ans, params: { kind, a: s, d: dd, n },
          hints: [`The rows form an arithmetic sequence: first term ${s}, common difference ${dd}.`, `Row ${n} is ${n - 1} jumps after row 1: ${s} + ${n - 1} × ${dd}.`, `${s} + ${N(dd * (n - 1))} = <b>${N(ans)}</b> seats.`] };
      }
      const n = rng.int(8, 30), ans = a + d * (n - 1);
      return { prompt: `An arithmetic sequence begins ${seq} What is the ${M.ordinal(n)} term?`, type: 'number', answer: ans, params: { kind, a, d, n },
        hints: [`Each term is ${N(Math.abs(d))} ${d > 0 ? 'more' : 'less'} than the one before: the common difference is ${N(d)}.`,
          `The ${M.ordinal(n)} term is the first term plus ${n - 1} jumps: ${N(a)} + ${n - 1} × ${wrap(d)}.`,
          `${N(a)} ${M.signed((n - 1) * d)} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'rule') return [1, 2, 3, 4].every(n => p.coefs[0] * n + p.coefs[1] === p.a + (n - 1) * p.d) && q.answer === `${V('t')}(${V('n')}) = ${M.poly(p.coefs, 'n')}`;
      let t = p.a; for (let i = 1; i < p.n; i++) t += p.d;        // walk the sequence one jump at a time
      return t === q.answer;
    },
  });

  /* ---------- Unit 3: Equations and inequalities ---------- */
  A.skill({
    id: 'int1.multistep-equations', title: 'Multi-step equations',
    learn: p(`To solve an equation, undo what has been done to ${X}, doing the same thing to both sides each step. <b>Distribute first</b> to clear any parentheses, then <b>collect the ${X} terms on one side</b> and the plain numbers on the other, then divide by the coefficient of ${X}.`) +
      p(`With ${X} on both sides, subtract the smaller ${X} term from both sides so it disappears. Check at the end by substituting your answer into the original equation: both sides must come out equal.`) +
      example('Example', `${big(`3(${X} − 2) = 5${X} + 4`)}Distribute: 3${X} − 6 = 5${X} + 4. Subtract 3${X}: −6 = 2${X} + 4. Subtract 4: −10 = 2${X}. So ${X} = <b>−5</b>. Check: 3(−7) = −21 and 5(−5) + 4 = −21.`),
    make(rng) {
      const x0 = rng.int(-8, 8), kind = rng.pick(['both', 'both', 'dist', 'dist-both']);
      let left, right, params, hints;
      if (kind === 'both') {
        const a = rng.nz(-7, 7); let c = rng.nz(-7, 7); if (c === a) c = -a;
        const b = rng.nz(-9, 9), d = a * x0 + b - c * x0;
        left = M.poly([a, b]); right = M.poly([c, d]); params = { kind, a, b, c, d };
        hints = [`Get the ${X} terms together: ${moveTerm(c)} both sides to get ${M.poly([a - c, b])} = ${N(d)}.`, `${moveWord(b)} both sides: ${M.term(a - c, 'x')} = ${N(d - b)}.`, `Divide both sides by ${N(a - c)}: ${X} = <b>${N(x0)}</b>.`];
      } else if (kind === 'dist') {
        const a = rng.pick([2, 3, 4, 5, -2, -3, -4]), b = rng.nz(-6, 6), c = rng.chance(0.5) ? rng.nz(-9, 9) : 0, d = a * (x0 + b) + c;
        left = `${N(a)}(${M.poly([1, b])})${tail(c)}`; right = N(d); params = { kind, a, b, c, d };
        hints = [`Distribute: ${N(a)}(${M.poly([1, b])}) = ${M.poly([a, a * b])}, so the equation is ${M.poly([a, a * b + c])} = ${N(d)}.`, `${moveWord(a * b + c)} both sides: ${M.term(a, 'x')} = ${N(d - a * b - c)}.`, `Divide both sides by ${N(a)}: ${X} = <b>${N(x0)}</b>.`];
      } else {
        const a = rng.pick([2, 3, 4, 5, -2, -3]), b = rng.nz(-6, 6); let c = rng.nz(-6, 6); if (c === a) c = -a;
        const d = a * (x0 + b) - c * x0;
        left = `${N(a)}(${M.poly([1, b])})`; right = M.poly([c, d]); params = { kind, a, b, c, d };
        hints = [`Distribute: ${M.poly([a, a * b])} = ${M.poly([c, d])}.`, `${moveTerm(c)[0].toUpperCase() + moveTerm(c).slice(1)} both sides: ${M.poly([a - c, a * b])} = ${N(d)}. Then ${moveWord(a * b).toLowerCase()} both sides: ${M.term(a - c, 'x')} = ${N(d - a * b)}.`, `Divide both sides by ${N(a - c)}: ${X} = <b>${N(x0)}</b>.`];
      }
      return { prompt: `Solve for ${X}.${big(`${left} = ${right}`)}`, type: 'number', answer: x0, params, hints };
    },
    verify(q) {
      const { kind, a, b, c, d } = q.params;
      const [l, r] = kind === 'both' ? [`(${a})*x+(${b})`, `(${c})*x+(${d})`] : kind === 'dist' ? [`(${a})*(x+(${b}))+(${c})`, `${d}`] : [`(${a})*(x+(${b}))`, `(${c})*x+(${d})`];
      const f = new Function('x', `return [${l}, ${r}];`), [lv, rv] = f(q.answer), [l1, r1] = f(q.answer + 1);
      return lv === rv && l1 !== r1;        // the answer balances the equation, and it is not an identity
    },
  });

  /* formulas for int1.literal-equations; `solved` and `holds` let verify() test the rearrangement with numbers */
  const FORMULAS = [
    { eq: `${V('P')} = 2${V('l')} + 2${V('w')}`, t: 'w', right: `${V('w')} = ${sfrac(`${V('P')} − 2${V('l')}`, '2')}`, wrong: [`${V('w')} = ${sfrac(V('P'), '2')} − 2${V('l')}`, `${V('w')} = ${sfrac(`${V('P')} + 2${V('l')}`, '2')}`, `${V('w')} = ${V('P')} − 2${V('l')}`],
      steps: [`Subtract 2${V('l')} from both sides: ${V('P')} − 2${V('l')} = 2${V('w')}.`, `Divide both sides by 2.`], vals: { P: 20, l: 6 }, solved: v => (v.P - 2 * v.l) / 2, holds: (v, w) => v.P === 2 * v.l + 2 * w },
    { eq: `${V('A')} = ${F(1, 2)}${V('b')}${V('h')}`, t: 'h', right: `${V('h')} = ${sfrac(`2${V('A')}`, V('b'))}`, wrong: [`${V('h')} = ${sfrac(V('A'), `2${V('b')}`)}`, `${V('h')} = ${sfrac(V('b'), `2${V('A')}`)}`, `${V('h')} = 2${V('A')} − ${V('b')}`],
      steps: [`Multiply both sides by 2 to clear the fraction: 2${V('A')} = ${V('b')}${V('h')}.`, `Divide both sides by ${V('b')}.`], vals: { A: 12, b: 4 }, solved: v => 2 * v.A / v.b, holds: (v, h) => v.A === v.b * h / 2 },
    { eq: `${V('d')} = ${V('r')}${V('t')}`, t: 't', right: `${V('t')} = ${sfrac(V('d'), V('r'))}`, wrong: [`${V('t')} = ${sfrac(V('r'), V('d'))}`, `${V('t')} = ${V('d')} − ${V('r')}`, `${V('t')} = ${sfrac('1', `${V('d')}${V('r')}`)}`],
      steps: [`${V('t')} is multiplied by ${V('r')}, so undo that by dividing both sides by ${V('r')}.`], vals: { d: 60, r: 12 }, solved: v => v.d / v.r, holds: (v, t) => v.d === v.r * t },
    { eq: `${Y} = ${V('m')}${X} + ${V('b')}`, t: 'x', right: `${X} = ${sfrac(`${Y} − ${V('b')}`, V('m'))}`, wrong: [`${X} = ${sfrac(Y, V('m'))} − ${V('b')}`, `${X} = ${sfrac(`${Y} + ${V('b')}`, V('m'))}`, `${X} = ${sfrac(`${V('b')} − ${Y}`, V('m'))}`],
      steps: [`Subtract ${V('b')} from both sides: ${Y} − ${V('b')} = ${V('m')}${X}.`, `Divide both sides by ${V('m')}.`], vals: { y: 11, m: 3, b: 2 }, solved: v => (v.y - v.b) / v.m, holds: (v, x) => v.y === v.m * x + v.b },
    { eq: `${V('C')} = 2π${V('r')}`, t: 'r', right: `${V('r')} = ${sfrac(V('C'), '2π')}`, wrong: [`${V('r')} = ${sfrac('2π', V('C'))}`, `${V('r')} = ${sfrac(V('C'), 'π')}`, `${V('r')} = ${V('C')} − 2π`],
      steps: [`${V('r')} is multiplied by 2π, so divide both sides by 2π.`], vals: { C: 6 * Math.PI }, solved: v => v.C / (2 * Math.PI), holds: (v, r) => Math.abs(v.C - 2 * Math.PI * r) < 1e-9 },
    { eq: `${V('V')} = ${V('l')}${V('w')}${V('h')}`, t: 'h', right: `${V('h')} = ${sfrac(V('V'), `${V('l')}${V('w')}`)}`, wrong: [`${V('h')} = ${sfrac(`${V('l')}${V('w')}`, V('V'))}`, `${V('h')} = ${V('V')} − ${V('l')}${V('w')}`, `${V('h')} = ${sfrac(V('V'), V('l'))} − ${V('w')}`],
      steps: [`${V('h')} is multiplied by both ${V('l')} and ${V('w')}, so divide both sides by ${V('l')}${V('w')}.`], vals: { V: 24, l: 2, w: 3 }, solved: v => v.V / (v.l * v.w), holds: (v, h) => v.V === v.l * v.w * h },
    { eq: `${V('F')} = ${F(9, 5)}${V('C')} + 32`, t: 'C', right: `${V('C')} = ${F(5, 9)}(${V('F')} − 32)`, wrong: [`${V('C')} = ${F(9, 5)}(${V('F')} − 32)`, `${V('C')} = ${F(5, 9)}${V('F')} + 32`, `${V('C')} = ${F(5, 9)}(32 − ${V('F')})`],
      steps: [`Subtract 32 from both sides: ${V('F')} − 32 = ${F(9, 5)}${V('C')}.`, `Multiply both sides by ${F(5, 9)}, the reciprocal of ${F(9, 5)}.`], vals: { F: 212 }, solved: v => 5 / 9 * (v.F - 32), holds: (v, C) => Math.abs(v.F - (9 / 5 * C + 32)) < 1e-9 },
    { eq: `${V('a')}${X} + ${V('b')}${Y} = ${V('c')}`, t: 'y', right: `${Y} = ${sfrac(`${V('c')} − ${V('a')}${X}`, V('b'))}`, wrong: [`${Y} = ${sfrac(V('c'), V('b'))} − ${V('a')}${X}`, `${Y} = ${sfrac(`${V('c')} + ${V('a')}${X}`, V('b'))}`, `${Y} = ${sfrac(`${V('a')}${X} − ${V('c')}`, V('b'))}`],
      steps: [`Subtract ${V('a')}${X} from both sides: ${V('b')}${Y} = ${V('c')} − ${V('a')}${X}.`, `Divide both sides by ${V('b')}.`], vals: { a: 2, x: 3, b: 4, c: 18 }, solved: v => (v.c - v.a * v.x) / v.b, holds: (v, y) => v.a * v.x + v.b * y === v.c },
    { eq: `${V('v')} = ${V('u')} + ${V('a')}${V('t')}`, t: 'a', right: `${V('a')} = ${sfrac(`${V('v')} − ${V('u')}`, V('t'))}`, wrong: [`${V('a')} = ${sfrac(V('v'), V('t'))} − ${V('u')}`, `${V('a')} = ${sfrac(`${V('u')} − ${V('v')}`, V('t'))}`, `${V('a')} = ${sfrac(`${V('v')} + ${V('u')}`, V('t'))}`],
      steps: [`Subtract ${V('u')} from both sides: ${V('v')} − ${V('u')} = ${V('a')}${V('t')}.`, `Divide both sides by ${V('t')}.`], vals: { v: 20, u: 5, t: 3 }, solved: v => (v.v - v.u) / v.t, holds: (v, a) => v.v === v.u + a * v.t },
    { eq: `${V('A')} = ${F(1, 2)}(${M.sub(V('b'), 1)} + ${M.sub(V('b'), 2)})${V('h')}`, t: 'h', right: `${V('h')} = ${sfrac(`2${V('A')}`, `${M.sub(V('b'), 1)} + ${M.sub(V('b'), 2)}`)}`, wrong: [`${V('h')} = ${sfrac(V('A'), `2(${M.sub(V('b'), 1)} + ${M.sub(V('b'), 2)})`)}`, `${V('h')} = ${sfrac(`${M.sub(V('b'), 1)} + ${M.sub(V('b'), 2)}`, `2${V('A')}`)}`, `${V('h')} = 2${V('A')} − (${M.sub(V('b'), 1)} + ${M.sub(V('b'), 2)})`],
      steps: [`Multiply both sides by 2: 2${V('A')} = (${M.sub(V('b'), 1)} + ${M.sub(V('b'), 2)})${V('h')}.`, `Divide both sides by everything in the parentheses, (${M.sub(V('b'), 1)} + ${M.sub(V('b'), 2)}).`], vals: { A: 20, b1: 3, b2: 5 }, solved: v => 2 * v.A / (v.b1 + v.b2), holds: (v, h) => v.A === (v.b1 + v.b2) * h / 2 },
    { eq: `${V('I')} = ${V('P')}${V('r')}${V('t')}`, t: 'r', right: `${V('r')} = ${sfrac(V('I'), `${V('P')}${V('t')}`)}`, wrong: [`${V('r')} = ${sfrac(`${V('P')}${V('t')}`, V('I'))}`, `${V('r')} = ${V('I')} − ${V('P')}${V('t')}`, `${V('r')} = ${sfrac(V('I'), V('P'))} − ${V('t')}`],
      steps: [`${V('r')} is multiplied by ${V('P')} and by ${V('t')}, so divide both sides by ${V('P')}${V('t')}.`], vals: { I: 30, P: 100, t: 3 }, solved: v => v.I / (v.P * v.t), holds: (v, r) => Math.abs(v.I - v.P * r * v.t) < 1e-9 },
    { eq: `${V('S')} = 180(${V('n')} − 2)`, t: 'n', right: `${V('n')} = ${sfrac(V('S'), '180')} + 2`, wrong: [`${V('n')} = ${sfrac(`${V('S')} + 2`, '180')}`, `${V('n')} = ${sfrac(V('S'), '180')} − 2`, `${V('n')} = ${sfrac(`${V('S')} − 2`, '180')}`],
      steps: [`Divide both sides by 180 first: ${sfrac(V('S'), '180')} = ${V('n')} − 2.`, `Add 2 to both sides.`], vals: { S: 540 }, solved: v => v.S / 180 + 2, holds: (v, n) => v.S === 180 * (n - 2) },
  ];

  A.skill({
    id: 'int1.literal-equations', title: 'Solving literal equations',
    learn: p(`A <b>literal equation</b> is a formula with several letters, like ${V('P')} = 2${V('l')} + 2${V('w')}. Solving it for one letter means rearranging until that letter is alone on one side. <b>Use exactly the same moves as with numbers:</b> undo addition with subtraction, undo multiplication with division, and do each move to both sides.`) +
      p(`Treat every other letter as if it were a known number. If the letter you want is inside parentheses or multiplied by something in parentheses, divide by everything in the parentheses. A fraction like ${F(1, 2)} is cleared by multiplying both sides by 2.`) +
      example('Example', `${big(`Solve ${V('A')} = ${F(1, 2)}${V('b')}${V('h')} for ${V('b')}.`)}Multiply both sides by 2: 2${V('A')} = ${V('b')}${V('h')}. Divide by ${V('h')}: <b>${V('b')} = ${sfrac(`2${V('A')}`, V('h'))}</b>.`),
    make(rng) {
      const idx = rng.int(0, FORMULAS.length - 1), e = FORMULAS[idx];
      return { prompt: `Solve for ${V(e.t)}.${big(e.eq)}`, type: 'choice', choices: [e.right].concat(e.wrong), answer: e.right, params: { idx }, hints: e.steps.concat([`<b>${e.right}</b>.`]) };
    },
    verify(q) { const e = FORMULAS[q.params.idx], t = e.solved(e.vals); return isFinite(t) && e.holds(e.vals, t) && q.answer === e.right; },   // the rearranged formula satisfies the original with numbers
  });

  A.skill({
    id: 'int1.inequalities', title: 'Linear and compound inequalities',
    learn: p(`Solve an inequality with the same moves as an equation, with one extra rule: <b>when you multiply or divide both sides by a negative number, flip the inequality sign.</b> −2${X} &lt; 6 becomes ${X} &gt; −3. Adding or subtracting never flips it.`) +
      p(`A <b>compound inequality</b> is two conditions at once. “And” form, like −3 &lt; 2${X} + 1 ≤ 7, is solved on all three parts together: subtract 1 everywhere, divide by 2 everywhere, to get −2 &lt; ${X} ≤ 3. “Or” form, like 3${X} &lt; −6 or 3${X} ≥ 9, is two separate inequalities whose answers are joined with “or”.`) +
      example('Example', `${big(`5 − 3${X} ≥ 17`)}Subtract 5: −3${X} ≥ 12. Divide by −3 and flip: <b>${X} ≤ −4</b>. Check ${X} = −5: 5 + 15 = 20 ≥ 17. ✓`),
    make(rng) {
      const kind = rng.pick(['flip', 'flip', 'and', 'or']);
      const flip = r => ({ '<': '>', '>': '<', '≤': '≥', '≥': '≤' })[r], tog = r => ({ '<': '≤', '≤': '<', '>': '≥', '≥': '>' })[r];
      if (kind === 'flip') {
        const a = -rng.int(2, 6), x0 = rng.nz(-7, 7), b = rng.int(-9, 9), rel = rng.pick(['<', '>', '≤', '≥']);
        let c = rng.chance(0.4) ? rng.int(1, 5) : 0; if (a + c === 0) c++;
        const d = a * x0 + b, ineq = r => `${X} ${r} `;
        const answer = `${ineq(flip(rel))}${N(x0)}`, choices = [answer, `${ineq(rel)}${N(x0)}`, `${ineq(flip(rel))}${N(-x0)}`, `${ineq(rel)}${N(-x0)}`];
        const hints = c ? [`Get the ${X} terms together: ${moveTerm(c)} both sides to get ${M.poly([a, b])} ${rel} ${N(d)}.`] : [];
        hints.push(`${moveWord(b)} both sides: ${M.term(a, 'x')} ${rel} ${N(d - b)}.`, `Divide both sides by ${N(a)}. Dividing by a negative number flips the inequality sign: ${X} ${flip(rel)} ${N(x0)}.`, `<b>${answer}</b>.`);
        return { prompt: `Solve the inequality.${big(`${M.poly([a + c, b])} ${rel} ${c ? M.poly([c, d]) : N(d)}`)}`, type: 'choice', choices, answer, params: { kind, a, b, c, d, rel }, hints };
      }
      const m = rng.int(2, 4), k = rng.nz(-3, 3), b = m * k, lo = rng.int(-5, 3), hi = lo + rng.int(2, 6), L = m * lo + b, R = m * hi + b;
      const relL = rng.pick(['<', '≤']), relR = kind === 'and' ? rng.pick(['<', '≤']) : rng.pick(['>', '≥']);
      const both = (l, h, r1, r2) => kind === 'and' ? `${N(l)} ${r1} ${X} ${r2} ${N(h)}` : `${X} ${r1} ${N(l)} or ${X} ${r2} ${N(h)}`;
      const answer = both(lo, hi, relL, relR), choices = [answer, both(m * lo, m * hi, relL, relR), both(lo + 2 * k, hi + 2 * k, relL, relR), both(lo, hi, tog(relL), tog(relR))];
      const prompt = kind === 'and' ? `${N(L)} ${relL} ${M.poly([m, b])} ${relR} ${N(R)}` : `${M.poly([m, b])} ${relL} ${N(L)} or ${M.poly([m, b])} ${relR} ${N(R)}`;
      const hints = kind === 'and' ? [`Work on all three parts at once. ${moveWord(b)} each part: ${N(L - b)} ${relL} ${M.term(m, 'x')} ${relR} ${N(R - b)}.`, `Divide each part by ${m}. It is positive, so the signs stay as they are: ${N(lo)} ${relL} ${X} ${relR} ${N(hi)}.`]
        : [`Solve the two inequalities separately. ${moveWord(b)} both sides of each: ${M.term(m, 'x')} ${relL} ${N(L - b)} or ${M.term(m, 'x')} ${relR} ${N(R - b)}.`, `Divide by ${m} (positive, so no flip): ${X} ${relL} ${N(lo)} or ${X} ${relR} ${N(hi)}.`];
      return { prompt: `Solve the compound inequality.${big(prompt)}`, type: 'choice', choices, answer, params: { kind, m, b, L, R, relL, relR }, hints: hints.concat([`<b>${answer}</b>.`]) };
    },
    verify(q) {
      const p = q.params, s = plain(q.answer), cmp = (u, rel, v) => rel === '<' ? u < v : rel === '>' ? u > v : rel === '≤' ? u <= v : u >= v;
      let m, inSet;
      if ((m = s.match(/^x ([<>≤≥]) (-?\d+)$/))) inSet = t => cmp(t, m[1], Number(m[2]));
      else if ((m = s.match(/^(-?\d+) ([<≤]) x ([<≤]) (-?\d+)$/))) inSet = t => cmp(Number(m[1]), m[2], t) && cmp(t, m[3], Number(m[4]));
      else if ((m = s.match(/^x ([<≤]) (-?\d+) or x ([>≥]) (-?\d+)$/))) inSet = t => cmp(t, m[1], Number(m[2])) || cmp(t, m[3], Number(m[4]));
      else return 'could not parse ' + s;
      const truth = p.kind === 'flip' ? t => cmp((p.a + p.c) * t + p.b, p.rel, p.c * t + p.d)
        : p.kind === 'and' ? t => cmp(p.L, p.relL, p.m * t + p.b) && cmp(p.m * t + p.b, p.relR, p.R)
        : t => cmp(p.m * t + p.b, p.relL, p.L) || cmp(p.m * t + p.b, p.relR, p.R);
      for (let t = -25; t <= 25; t += 0.5) if (inSet(t) !== truth(t)) return false;   // the solution set matches the original inequality, point by point
      return true;
    },
  });

  /* ---------- Unit 4: Systems of equations ---------- */
  A.skill({
    id: 'int1.solve-systems', title: 'Solving systems of equations',
    learn: p(`A <b>system</b> is two equations that must both be true. Its solution is the one point (${X}, ${Y}) that satisfies both: where the two lines cross.`) +
      p(`<b>Substitution:</b> when one equation already says ${Y} = …, put that expression in for ${Y} in the other equation. Now there is only ${X} to solve for. <b>Elimination:</b> multiply the equations so one variable has matching coefficients, then add or subtract the equations to make it disappear. Either way, once you know one coordinate, substitute it back to find the other.`) +
      example('Example', `${big(`${Y} = 2${X} − 1 &nbsp;and&nbsp; 3${X} + ${Y} = 9`)}Substitute: 3${X} + (2${X} − 1) = 9, so 5${X} = 10 and ${X} = 2. Then ${Y} = 2(2) − 1 = 3. The solution is <b>(2, 3)</b>.`),
    make(rng) {
      const x0 = rng.nz(-6, 6); let y0 = rng.nz(-6, 6); while (y0 === x0) y0 = rng.nz(-6, 6);
      const kind = rng.pick(['sub', 'elim']), ask = rng.pick(['x', 'y', 'pt']);
      let lines, hints, params;
      if (kind === 'sub') {
        const m = rng.nz(-4, 4), b = y0 - m * x0, d = rng.nz(-5, 5); let c = rng.nz(-5, 5); if (c + d * m === 0) c = c === -1 ? 1 : c + 1;
        const e = c * x0 + d * y0;
        lines = [`${Y} = ${M.poly([m, b])}`, lin2(c, d, e)]; params = { kind, m, b, c, d, e };
        hints = [`Substitute ${M.poly([m, b])} for ${Y} in the second equation: ${M.term(c, 'x')} ${d < 0 ? '−' : '+'} ${N(Math.abs(d))}(${M.poly([m, b])}) = ${N(e)}.`,
          `Distribute and combine: ${M.poly([c + d * m, d * b])} = ${N(e)}, so ${M.term(c + d * m, 'x')} = ${N(e - d * b)} and ${X} = ${N(x0)}.`,
          `Then ${Y} = ${N(m)}(${N(x0)}) ${M.signed(b)} = ${N(y0)}.`];
      } else {
        const a = rng.nz(-5, 5), b = rng.nz(-5, 5), c = rng.nz(-5, 5); let d = rng.nz(-5, 5); if (a * d === b * c) d = d === -1 ? 1 : d + 1;
        const e = a * x0 + b * y0, f = c * x0 + d * y0;
        lines = [lin2(a, b, e), lin2(c, d, f)]; params = { kind, a, b, c, d, e, f };
        hints = [`Match the ${Y} coefficients: multiply the first equation by ${N(d)} and the second by ${N(b)}: ${lin2(a * d, b * d, e * d)} and ${lin2(c * b, d * b, f * b)}.`,
          `Subtract the second from the first to eliminate ${Y}: ${M.term(a * d - c * b, 'x')} = ${N(e * d - f * b)}, so ${X} = ${N(x0)}.`,
          `Substitute into the first equation: ${N(a * x0)} ${b < 0 ? '−' : '+'} ${M.term(Math.abs(b), 'y')} = ${N(e)}, so ${M.term(b, 'y')} = ${N(e - a * x0)} and ${Y} = ${N(y0)}.`];
      }
      const shown = big(lines.map(l => `<div>${l}</div>`).join(''));
      const base = { params: Object.assign(params, { ask }), hints };
      if (ask === 'pt') {
        const answer = M.pt(x0, y0), choices = [answer].concat(distinct(answer, [M.pt(y0, x0), M.pt(-x0, y0), M.pt(x0, -y0), M.pt(-x0, -y0)], 3));
        return Object.assign(base, { prompt: `Solve the system.${shown}Which point is the solution?`, type: 'choice', choices, answer, hints: hints.concat([`The solution is <b>${answer}</b>.`]) });
      }
      return Object.assign(base, { prompt: `Solve the system.${shown}What is the ${ask === 'x' ? X : Y}-coordinate of the solution?`, type: 'number', answer: ask === 'x' ? x0 : y0,
        hints: hints.concat([`The solution is ${M.pt(x0, y0)}, so ${ask === 'x' ? X : Y} = <b>${N(ask === 'x' ? x0 : y0)}</b>.`]) });
    },
    verify(q) {
      const p = q.params, found = [];
      for (let x = -15; x <= 15; x++) for (let y = -15; y <= 15; y++) {          // brute force over the integer grid
        const ok = p.kind === 'sub' ? y === p.m * x + p.b && p.c * x + p.d * y === p.e : p.a * x + p.b * y === p.e && p.c * x + p.d * y === p.f;
        if (ok) found.push([x, y]);
      }
      if (found.length !== 1) return 'solutions found: ' + found.length;
      const [x, y] = found[0];
      return p.ask === 'pt' ? q.answer === M.pt(x, y) : q.answer === (p.ask === 'x' ? x : y);
    },
  });

  A.skill({
    id: 'int1.systems-word-problems', title: 'Systems of equations word problems',
    learn: p(`Many stories hide a system: two kinds of thing, a total <b>count</b>, and a total <b>value</b>. Give each kind a letter. One equation says the counts add to the total; the other says the values add to the total value.`) +
      p(`For 30 tickets, adults at $9 and students at $4, taking in $200: ${V('a')} + ${V('s')} = 30 and 9${V('a')} + 4${V('s')} = 200. Substitute ${V('s')} = 30 − ${V('a')} into the second: 9${V('a')} + 120 − 4${V('a')} = 200, so 5${V('a')} = 80 and ${V('a')} = 16. Always check that the counts and the money both work out.`) +
      example('Example', `${big('22 coins, dimes and quarters, worth $3.70.')}${V('d')} + ${V('q')} = 22 and 10${V('d')} + 25${V('q')} = 370 (in cents). ${V('d')} = 22 − ${V('q')}: 220 − 10${V('q')} + 25${V('q')} = 370, so 15${V('q')} = 150 and ${V('q')} = <b>10</b> quarters.`),
    make(rng) {
      const name = rng.pick(NAMES), kind = rng.pick(['tickets', 'coins', 'items']);
      let n1, n2, p1, p2, text, what1, what2, verb = 'were sold', moneyTxt, unitNote = '';
      if (kind === 'tickets') {
        p1 = rng.int(8, 15); p2 = rng.int(3, 6); n1 = rng.int(8, 60); n2 = rng.int(8, 60); what1 = 'adult tickets'; what2 = 'student tickets';
        moneyTxt = M.money(p1 * n1 + p2 * n2); text = `A school play sold ${n1 + n2} tickets and took in ${moneyTxt}. Adult tickets cost ${M.money(p1)} and student tickets cost ${M.money(p2)}.`;
      } else if (kind === 'coins') {
        [p1, p2, what1, what2] = rng.pick([[25, 10, 'quarters', 'dimes'], [10, 5, 'dimes', 'nickels'], [25, 5, 'quarters', 'nickels']]); n1 = rng.int(3, 30); n2 = rng.int(3, 30); verb = `does ${name} have`;
        moneyTxt = M.money((p1 * n1 + p2 * n2) / 100); text = `${name} has ${n1 + n2} coins, all ${what1} and ${what2}, worth ${moneyTxt} in total.`; unitNote = ' (in cents)';
      } else {
        p1 = rng.int(6, 12); p2 = rng.int(2, 5); n1 = rng.int(5, 40); n2 = rng.int(5, 40); what1 = 'necklaces'; what2 = 'bracelets';
        moneyTxt = M.money(p1 * n1 + p2 * n2); text = `At a craft fair ${name} sold ${n1 + n2} items: necklaces for ${M.money(p1)} and bracelets for ${M.money(p2)}. The sales came to ${moneyTxt}.`;
      }
      const total = n1 + n2, money = p1 * n1 + p2 * n2, askFirst = rng.bool(), ans = askFirst ? n1 : n2, what = askFirst ? what1 : what2;
      return { prompt: `${text} How many ${what} ${verb}?`, type: 'number', answer: ans, params: { p1, p2, total, money, askFirst },
        hints: [`Let ${V('a')} be the number of ${what1} and ${V('b')} the number of ${what2}. Count: ${V('a')} + ${V('b')} = ${total}. Value${unitNote}: ${p1}${V('a')} + ${p2}${V('b')} = ${N(money)}.`,
          `From the count equation, ${V('b')} = ${total} − ${V('a')}. Substitute: ${p1}${V('a')} + ${p2}(${total} − ${V('a')}) = ${N(money)}.`,
          `Simplify: ${p1 - p2}${V('a')} + ${N(p2 * total)} = ${N(money)}, so ${p1 - p2}${V('a')} = ${N(money - p2 * total)} and ${V('a')} = ${n1}${askFirst ? '' : `. Then ${V('b')} = ${total} − ${n1} = ${n2}`}.`,
          `<b>${ans}</b> ${what}.`] };
    },
    verify(q) {
      const { p1, p2, total, money, askFirst } = q.params, hits = [];
      for (let a = 0; a <= total; a++) if (p1 * a + p2 * (total - a) === money) hits.push(a);     // try every possible count
      return hits.length === 1 && q.answer === (askFirst ? hits[0] : total - hits[0]);
    },
  });

  /* ---------- Unit 5: Exponential functions and geometric sequences ---------- */
  A.skill({
    id: 'int1.geometric-sequences', title: 'Geometric sequences',
    learn: p(`A <b>geometric sequence</b> multiplies by the same number each time: 3, 6, 12, 24, … doubles. That number is the <b>common ratio ${V('r')}</b>, and you find it by dividing any term by the one before it. The ratio can be negative (the signs alternate) or a fraction (the terms shrink).`) +
      p(`To reach the ${V('n')}th term you multiply by ${V('r')} a total of ${V('n')} − 1 times: <b>${V('t')}(${V('n')}) = ${V('t')}(1) · ${M.sup(V('r'), `${V('n')} − 1`)}</b>. Compare with an arithmetic sequence, which adds ${V('n')} − 1 times.`) +
      example('Example', `${big('2, 6, 18, 54, … What is the 7th term?')}${V('r')} = 6 ÷ 2 = 3. ${V('t')}(7) = 2 · 3⁶ = 2 · 729 = <b>1458</b>.`),
    make(rng) {
      const kind = rng.pick(['next', 'nth', 'nth', 'ratio']), r = rng.pick([2, 3, 4, 5, -2, -3, 0.5, 0.5]);
      const a = r === 0.5 ? 128 * rng.int(1, 8) : rng.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
      const terms = [a]; for (let i = 1; i < 8; i++) terms.push(terms[i - 1] * r);
      const rTxt = r === 0.5 ? F(1, 2) : wrap(r), shown = k => `${terms.slice(0, k).map(N).join(', ')}, …`;
      const ratioHint = `Divide any term by the one before it: ${N(terms[1])} ÷ ${wrap(terms[0])} = ${rTxt}. That is the common ratio.`;
      if (kind === 'ratio') return { prompt: `What is the common ratio of the geometric sequence ${shown(4)}`, type: 'number', answer: r, answerText: r === 0.5 ? '1/2' : N(r), params: { kind, t0: terms[0], t1: terms[1], n: 2 },
        hints: [`The common ratio is what each term is multiplied by to get the next one. Divide a term by the one before it.`, `${N(terms[1])} ÷ ${wrap(terms[0])} = <b>${rTxt}</b>${r === 0.5 ? ' (0.5)' : ''}. Check: ${N(terms[2])} ÷ ${wrap(terms[1])} gives the same.`] };
      if (kind === 'next') return { prompt: `A geometric sequence begins ${shown(4)} What is the next term?`, type: 'number', answer: terms[4], params: { kind, t0: terms[0], t1: terms[1], n: 5 },
        hints: [ratioHint, `Multiply the last term by the ratio: ${N(terms[3])} × ${rTxt} = <b>${N(terms[4])}</b>.`] };
      const n = rng.int(5, 8);
      return { prompt: `A geometric sequence begins ${shown(3)} What is the ${M.ordinal(n)} term?`, type: 'number', answer: terms[n - 1], params: { kind, t0: terms[0], t1: terms[1], n },
        hints: [ratioHint, `The ${M.ordinal(n)} term is the first term times the ratio ${n - 1} times: ${N(a)} × ${M.sup(r === 0.5 ? `(${rTxt})` : rTxt, n - 1)}.`, `${M.sup(r === 0.5 ? `(${rTxt})` : rTxt, n - 1)} = ${N(Math.pow(r, n - 1))}, so the term is ${N(a)} × ${N(Math.pow(r, n - 1))} = <b>${N(terms[n - 1])}</b>.`] };
    },
    verify(q) { const { kind, t0, t1, n } = q.params, r = t1 / t0; return kind === 'ratio' ? Math.abs(q.answer - r) < 1e-9 : Math.abs(q.answer - t0 * Math.pow(r, n - 1)) < 1e-6; },   // a power instead of the generator's repeated multiplication
  });

  A.skill({
    id: 'int1.exponential-growth-decay', title: 'Exponential growth and decay',
    learn: p(`An <b>exponential function</b> has the form <b>${Y} = ${V('a')} · ${M.sup(V('b'), X)}</b>: a starting amount ${V('a')} multiplied by the same factor ${V('b')} for every step of ${X}. If ${V('b')} &gt; 1 the amount grows; if 0 &lt; ${V('b')} &lt; 1 it decays. To evaluate it, work out the power first, then multiply by ${V('a')}.`) +
      p(`A percent change each period gives the multiplier: <b>growing by ${V('p')}% means ${V('b')} = 1 + ${V('p')}/100</b>, and <b>shrinking by ${V('p')}% means ${V('b')} = 1 − ${V('p')}/100</b>. 4% growth is ×1.04 each year; 15% decay is ×0.85. After ${V('n')} periods the amount is ${V('a')} · ${M.sup(V('b'), V('n'))}.`) +
      example('Example', `${big('A $500 deposit earns 3% interest a year. How much after 4 years?')}Multiplier 1.03. 500 · 1.03⁴ = 500 · 1.1255… = <b>$562.75</b>.`),
    make(rng) {
      const kind = rng.pick(['evaluate', 'multiplier', 'value', 'value']), name = rng.pick(NAMES);
      if (kind === 'evaluate') {
        const b = rng.pick([2, 3, 4, 0.5, 1.5]), x = rng.int(1, b === 1.5 ? 3 : 4);
        const a = b === 0.5 ? rng.pick([16, 32, 48, 64, 80]) : b === 1.5 ? rng.pick([8, 16, 24, 40]) : rng.int(2, 9);
        const ans = M.round(a * Math.pow(b, x), 6), bTxt = b === 0.5 ? `(${F(1, 2)})` : N(b), pw = M.round(Math.pow(b, x), 6);
        return { prompt: `${big(expRule(a, bTxt))}Find ${Y} when ${X} = ${x}.`, type: 'number', answer: ans, params: { kind, a, b, x }, tolerance: 0.001,
          hints: [`Substitute ${x} for ${X}: ${N(a)} · ${M.sup(bTxt, x)}. Work out the power first.`, `${M.sup(bTxt, x)} = ${N(pw)}, so ${Y} = ${N(a)} × ${N(pw)}.`, `${Y} = <b>${N(ans)}</b>.`] };
      }
      const C = [
        { grow: true, money: false, noun: 'population', period: 'year', P: rng.int(20, 90) * 100, text: (P, pc) => `A town has ${N(P)} people, and its population grows by ${pc}% each year.` },
        { grow: false, money: true, noun: 'value of the car', period: 'year', P: rng.int(12, 40) * 500, text: (P, pc) => `${name} buys a car for ${M.money(P)}. It loses ${pc}% of its value each year.` },
        { grow: true, money: true, noun: 'balance', period: 'year', P: rng.int(2, 20) * 100, text: (P, pc) => `${name} puts ${M.money(P)} in an account that earns ${pc}% interest each year.` },
        { grow: true, money: false, noun: 'number of cells', period: 'hour', P: rng.int(2, 9) * 100, text: (P, pc) => `A bacteria culture starts with ${N(P)} cells, and the number grows by ${pc}% each hour.` },
        { grow: false, money: false, noun: 'number of fish', period: 'year', P: rng.int(10, 60) * 100, text: (P, pc) => `A lake holds ${N(P)} fish, and the number falls by ${pc}% each year.` },
      ];
      const ctx = rng.pick(C), pc = rng.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25]), mult = M.round((100 + (ctx.grow ? pc : -pc)) / 100, 4), P = ctx.P;
      const pctLine = `${ctx.grow ? 'Growing' : 'Shrinking'} by ${pc}% means the new amount is ${100 + (ctx.grow ? pc : -pc)}% of the old one, so each ${ctx.period} the ${ctx.noun} is multiplied by ${N(mult)}.`;
      if (kind === 'multiplier') return { prompt: `${ctx.text(P, pc)} By what number is the ${ctx.noun} multiplied each ${ctx.period}?`, type: 'number', answer: mult, params: { kind, pc, grow: ctx.grow }, tolerance: 0.001,
        hints: [pctLine, `${100 + (ctx.grow ? pc : -pc)}% = ${N(mult)}, so the multiplier is <b>${N(mult)}</b>.`] };
      const n = rng.int(2, 6), raw = P * Math.pow(mult, n), ans = ctx.money ? M.round(raw, 2) : Math.round(raw);
      return { prompt: `${ctx.text(P, pc)} What will the ${ctx.noun} be after ${n} ${ctx.period}s? Round to the nearest ${ctx.money ? 'cent' : 'whole number'}.`, type: 'number', answer: ans, unit: ctx.money ? '$' : undefined, params: { kind, P, mult, n, money: ctx.money }, tolerance: ctx.money ? 0.01 : 0.5,
        hints: [pctLine, `After ${n} ${ctx.period}s the ${ctx.noun} is ${N(P)} × ${M.sup(N(mult), n)}.`, `${M.sup(N(mult), n)} ≈ ${N(M.round(Math.pow(mult, n), 4))}, so the ${ctx.noun} is about <b>${ctx.money ? M.money(ans) : N(ans)}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'evaluate') { let v = p.a; for (let i = 0; i < p.x; i++) v *= p.b; return Math.abs(v - q.answer) < 1e-6; }      // repeated multiplication instead of a power
      if (p.kind === 'multiplier') return Math.abs(q.answer - (p.grow ? 1 + p.pc / 100 : 1 - p.pc / 100)) < 1e-9;
      let v = p.P; for (let i = 0; i < p.n; i++) v *= p.mult;
      return Math.abs(v - q.answer) <= (p.money ? 0.005 : 0.5) + 1e-9;
    },
  });

  A.skill({
    id: 'int1.exponential-from-table', title: 'Writing exponential functions from tables',
    learn: p(`A table shows an exponential function when the ${Y}-values are multiplied by the same factor for each step of 1 in ${X}: 2, 6, 18, 54 is ×3 each time. (A linear table <i>adds</i> the same amount each step instead.)`) +
      p(`To write the rule <b>${Y} = ${V('a')} · ${M.sup(V('b'), X)}</b>: the starting value ${V('a')} is the ${Y}-value when ${X} = 0, and the factor ${V('b')} is any ${Y}-value divided by the one before it. A factor less than 1, like ${F(1, 2)}, means the values are shrinking.`) +
      example('Example', `${M.table([X, Y], [[0, 5], [1, 10], [2, 20], [3, 40]], { compact: true })}At ${X} = 0, ${Y} = 5, so ${V('a')} = 5. Each step doubles: ${V('b')} = 2. The rule is <b>${Y} = 5 · ${M.sup(2, X)}</b>.`),
    make(rng) {
      const decay = rng.chance(0.3), b = decay ? 0.5 : rng.pick([2, 3, 4, 5]);
      let a = decay ? rng.pick([8, 16, 24, 32, 40, 48, 64, 80]) : rng.int(2, 9); if (a === b) a = b + 1;
      const xs = [0, 1, 2, 3], ys = xs.map(x => a * Math.pow(b, x)), bTxt = b === 0.5 ? `(${F(1, 2)})` : N(b);
      const answer = expRule(a, bTxt);
      const choices = [answer].concat(distinct(answer, [expRule(b === 0.5 ? F(1, 2) : N(b), N(a)), `${Y} = ${M.poly([ys[1] - ys[0], a])}`, expRule(ys[1], bTxt), expRule(a, N(b === 0.5 ? 2 : b + 1))], 3));
      return { prompt: `The table shows an exponential function. Which equation gives ${Y} in terms of ${X}?${M.table([X, Y], xs.map((x, i) => [N(x), N(ys[i])]))}`, type: 'choice', choices, answer, params: { a, b, ys },
        hints: [`The value at ${X} = 0 is the starting amount ${V('a')}: here ${V('a')} = ${N(a)}.`,
          `Each step in ${X} multiplies ${Y} by the same factor: ${N(ys[1])} ÷ ${N(ys[0])} = ${N(b)}${b === 0.5 ? ' (one half)' : ''}, so ${V('b')} = ${bTxt}.`,
          `<b>${answer}</b>. Check: at ${X} = 2, ${N(a)} · ${M.sup(bTxt, 2)} = ${N(ys[2])}.`] };
    },
    verify(q) {
      const { a, b, ys } = q.params; let v = a;
      for (let i = 0; i < ys.length; i++) { if (ys[i] !== v) return false; v *= b; }     // the rule reproduces every row
      return q.answer === expRule(a, b === 0.5 ? `(${F(1, 2)})` : N(b));
    },
  });

  /* ---------- Unit 6: Statistics ---------- */
  A.skill({
    id: 'int1.center-and-spread', title: 'Mean, median, quartiles, and IQR',
    learn: p(`Two numbers describe the <b>center</b> of a data set. The <b>mean</b> is the total divided by how many values there are. The <b>median</b> is the middle value once the data are in order; with an even number of values it is the average of the two middle ones. The median is the better summary when there is an outlier.`) +
      p(`<b>Spread</b>: the <b>range</b> is largest − smallest. For the quartiles, split the ordered list into a lower half and an upper half (leave out the middle value when there is an odd number). <b>Q1 is the median of the lower half, Q3 is the median of the upper half</b>, and the <b>interquartile range IQR = Q3 − Q1</b> is the spread of the middle 50% of the data. Minimum, Q1, median, Q3 and maximum make the five-number summary of a box plot.`) +
      example('Example', `${big('4, 9, 7, 12, 5, 8, 15')}In order: 4, 5, 7, 8, 9, 12, 15. Median = 8. Lower half 4, 5, 7 gives Q1 = 5; upper half 9, 12, 15 gives Q3 = 12. IQR = 12 − 5 = <b>7</b>. Mean = 60 ÷ 7 ≈ 8.6.`),
    make(rng) {
      const n = rng.pick([6, 7, 8, 9]), ask = rng.pick(['mean', 'median', 'range', 'q1', 'q3', 'iqr', 'iqr']);
      const data = Array.from({ length: n }, () => rng.int(2, 30));
      if (ask === 'mean') data[n - 1] += (n - sum(data) % n) % n;                     // a whole-number mean
      const s = sorted(data), med = h => h.length % 2 ? h[(h.length - 1) / 2] : (h[h.length / 2 - 1] + h[h.length / 2]) / 2;
      const lower = s.slice(0, Math.floor(n / 2)), upper = s.slice(Math.ceil(n / 2)), q1 = med(lower), q3 = med(upper);
      const vals = { mean: sum(data) / n, median: med(s), range: s[n - 1] - s[0], q1, q3, iqr: q3 - q1 };
      const label = { mean: 'mean', median: 'median', range: 'range', q1: 'first quartile (Q1)', q3: 'third quartile (Q3)', iqr: 'interquartile range (IQR)' }[ask];
      const ctx = rng.pick([`the numbers of pages ${n} students read last night`, `the quiz scores (out of 30) of ${n} students`, `the daily high temperatures in °C over ${n} days`, `the numbers of minutes ${n} friends spent on homework`]);
      const hints = [`Put the data in order: ${s.map(N).join(', ')}.`];
      if (ask === 'mean') hints.push(`Add the values: ${sum(data)}. Divide by the number of values: ${sum(data)} ÷ ${n}.`);
      else if (ask === 'median') hints.push(n % 2 ? `There are ${n} values, so the median is the middle one: the ${M.ordinal((n + 1) / 2)} value in the ordered list.` : `There are ${n} values, so the median is the average of the two middle ones: (${N(s[n / 2 - 1])} + ${N(s[n / 2])}) ÷ 2.`);
      else if (ask === 'range') hints.push(`Range = largest − smallest = ${N(s[n - 1])} − ${N(s[0])}.`);
      else hints.push(`Split the ordered list into halves${n % 2 ? ' (leave out the middle value)' : ''}: lower ${lower.map(N).join(', ')} and upper ${upper.map(N).join(', ')}. Q1 is the median of the lower half (${N(q1)}) and Q3 the median of the upper half (${N(q3)}).`);
      if (ask === 'iqr') hints.push(`IQR = Q3 − Q1 = ${N(q3)} − ${N(q1)}.`);
      hints.push(`The ${label} is <b>${N(vals[ask])}</b>.`);
      return { prompt: `Here are ${ctx}:${big(data.map(N).join(', '))}Find the ${label}.`, type: 'number', answer: vals[ask], params: { ask, data }, hints };
    },
    verify(q) {
      const { ask, data } = q.params, n = data.length, s = sorted(data), ans = q.answer;
      const isMedian = (arr, v) => arr.filter(x => x <= v).length * 2 >= arr.length && arr.filter(x => x >= v).length * 2 >= arr.length && (arr.length % 2 ? arr.includes(v) : 2 * v === arr[arr.length / 2 - 1] + arr[arr.length / 2]);   // counting, not slicing
      if (ask === 'mean') return sum(data) === ans * n;
      if (ask === 'median') return isMedian(s, ans);
      if (ask === 'range') return ans === Math.max(...data) - Math.min(...data);
      const lo = s.slice(0, n >> 1), hi = s.slice((n + 1) >> 1);
      if (ask === 'q1') return isMedian(lo, ans);
      if (ask === 'q3') return isMedian(hi, ans);
      let q1 = null, q3 = null;
      for (let v = 0; v <= 60; v += 0.5) { if (isMedian(lo, v)) q1 = v; if (isMedian(hi, v)) q3 = v; }
      return q1 != null && q3 != null && ans === q3 - q1;
    },
  });

  /* pairs of variables for int1.scatter-association */
  const PAIRS = [
    { k: 'positive', text: 'A child\'s age and the child\'s height', why: 'older children tend to be taller' },
    { k: 'positive', text: 'Hours spent studying and score on a test', why: 'more study tends to go with higher scores' },
    { k: 'positive', text: 'Size of a house and its heating bill', why: 'bigger houses cost more to heat' },
    { k: 'positive', text: 'Number of people at a picnic and sandwiches eaten', why: 'more people eat more sandwiches' },
    { k: 'negative', text: 'Outside temperature and sales of hot soup', why: 'the warmer it is, the less soup sells' },
    { k: 'negative', text: 'Age of a used car and its selling price', why: 'older cars sell for less' },
    { k: 'negative', text: 'Driving speed and the time a 100 km trip takes', why: 'faster driving means a shorter trip' },
    { k: 'negative', text: 'Altitude on a mountain hike and the air temperature', why: 'the air gets colder the higher you climb' },
    { k: 'none', text: 'Shoe size and score on a history test', why: 'foot size says nothing about history grades' },
    { k: 'none', text: 'Length of a person\'s first name and their height', why: 'a name has nothing to do with height' },
    { k: 'none', text: 'Day of the month someone was born and the number of pets they own', why: 'a birthday tells you nothing about pets' },
    { k: 'none', text: 'Last digit of a phone number and monthly rent', why: 'a phone digit is unrelated to rent' },
  ];

  A.skill({
    id: 'int1.scatter-association', title: 'Describing associations in scatter plots',
    learn: p(`A <b>scatter plot</b> puts one variable on each axis and a dot for each data pair. Describe what you see in two parts. <b>Direction:</b> a <b>positive</b> association means the dots rise from left to right (as one variable grows, so does the other); a <b>negative</b> association means they fall. If the dots are a shapeless cloud there is <b>no association</b>.`) +
      p(`<b>Strength:</b> the association is <b>strong</b> when the dots hug a line closely, and <b>weak</b> when they follow a trend only loosely. An association is not the same as a cause: ice-cream sales and sunburns rise together because of the sunshine, not because of each other.`) +
      example('Example', `${big('Hours of sleep vs. mistakes on a test')}The dots fall from upper left to lower right and sit close to a line: a <b>strong negative association</b>. More sleep goes with fewer mistakes.`),
    make(rng) {
      if (rng.chance(0.6)) {
        const dir = rng.pick(['positive', 'negative', 'none']), strong = rng.bool();
        const ctx = rng.pick([['hours spent practicing', 'scores on a music exam'], ['outside temperature', 'cups of hot chocolate sold'], ['age of a used car', 'its selling price'], ['hours of sleep', 'number of mistakes on a test'], ['shoe size', 'score on a spelling test'], ['daily hours of sunshine', 'ice creams sold'], ['distance from the city center', 'monthly rent of an apartment']]);
        const shape = dir === 'none' ? 'The dots are scattered all over the plot with no pattern.' : `The dots ${dir === 'positive' ? 'rise from the lower left to the upper right' : 'fall from the upper left to the lower right'}, ${strong ? 'tightly clustered around a line' : 'loosely scattered but with a clear trend'}.`;
        const choices = ['Strong positive association', 'Weak positive association', 'Strong negative association', 'Weak negative association', 'No association'];
        const answer = dir === 'none' ? choices[4] : `${strong ? 'Strong' : 'Weak'} ${dir} association`;
        return { prompt: `A scatter plot shows ${ctx[0]} on the horizontal axis and ${ctx[1]} on the vertical axis. ${shape} Which best describes the association?`, type: 'choice', choices, answer, keepOrder: true, params: { kind: 'describe', dir, strong },
          hints: [`Direction first: do the dots go up from left to right (positive), go down (negative), or show no trend at all?`, `Then strength: dots close to a line mean a strong association; a loose cloud with a trend is weak.`, `<b>${answer}</b>.`] };
      }
      const want = rng.pick(['positive', 'negative', 'none']);
      const right = rng.pick(PAIRS.filter(x => x.k === want)), others = rng.sample(PAIRS.filter(x => x.k !== want), 3);
      const choices = [right.text].concat(others.map(x => x.text));
      return { prompt: want === 'none' ? 'Which pair of variables would most likely show no association?' : `Which pair of variables would most likely show a ${want} association?`, type: 'choice', choices, answer: right.text, params: { kind: 'pairs', want, idx: PAIRS.indexOf(right) },
        hints: [`Positive: as one variable goes up, the other tends to go up. Negative: as one goes up, the other tends to go down. No association: knowing one tells you nothing about the other.`, `<b>${right.text}</b>: ${right.why}.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'pairs') return PAIRS[p.idx].k === p.want && q.answer === PAIRS[p.idx].text;
      return p.dir === 'none' ? q.answer === 'No association' : q.answer.startsWith(p.strong ? 'Strong' : 'Weak') && q.answer.includes(p.dir);
    },
  });

  /* ---------- Unit 7: Transformations and congruence ---------- */
  const MOVES = {
    'rot90': { name: 'a rotation of 90° counterclockwise about the origin', rule: `(${X}, ${Y}) → (−${Y}, ${X})`, f: (x, y) => [-y, x] },
    'rot180': { name: 'a rotation of 180° about the origin', rule: `(${X}, ${Y}) → (−${X}, −${Y})`, f: (x, y) => [-x, -y] },
    'rot270': { name: 'a rotation of 90° clockwise about the origin', rule: `(${X}, ${Y}) → (${Y}, −${X})`, f: (x, y) => [y, -x] },
    'refx': { name: `a reflection across the ${X}-axis`, rule: `(${X}, ${Y}) → (${X}, −${Y})`, f: (x, y) => [x, -y] },
    'refy': { name: `a reflection across the ${Y}-axis`, rule: `(${X}, ${Y}) → (−${X}, ${Y})`, f: (x, y) => [-x, y] },
    'refyx': { name: `a reflection across the line ${Y} = ${X}`, rule: `(${X}, ${Y}) → (${Y}, ${X})`, f: (x, y) => [y, x] },
  };

  A.skill({
    id: 'int1.transformations', title: 'Translations, reflections, and rotations',
    learn: p(`A <b>rigid transformation</b> moves a figure without changing its size or shape. Each one has a coordinate rule. A <b>translation</b> slides every point the same amount: “3 right and 2 down” is (${X}, ${Y}) → (${X} + 3, ${Y} − 2).`) +
      p(`<b>Reflections:</b> across the ${X}-axis, (${X}, ${Y}) → (${X}, −${Y}); across the ${Y}-axis, (${X}, ${Y}) → (−${X}, ${Y}); across ${Y} = ${X}, swap the coordinates. <b>Rotations about the origin:</b> 90° counterclockwise, (${X}, ${Y}) → (−${Y}, ${X}); 180°, (${X}, ${Y}) → (−${X}, −${Y}); 90° clockwise, (${X}, ${Y}) → (${Y}, −${X}).`) +
      example('Example', `${big('Rotate (4, −1) by 90° counterclockwise about the origin.')}Use (${X}, ${Y}) → (−${Y}, ${X}): (−(−1), 4) = <b>(1, 4)</b>.`),
    make(rng) {
      const x = rng.nz(-7, 7); let y = rng.nz(-7, 7); if (Math.abs(y) === Math.abs(x)) y = y > 0 ? y + 1 : y - 1;
      if (rng.chance(0.3)) {
        const dx = rng.nz(-6, 6), dy = rng.nz(-6, 6), ans = [x + dx, y + dy];
        const desc = `${Math.abs(dx)} unit${Math.abs(dx) === 1 ? '' : 's'} ${dx > 0 ? 'right' : 'left'} and ${Math.abs(dy)} unit${Math.abs(dy) === 1 ? '' : 's'} ${dy > 0 ? 'up' : 'down'}`;
        const answer = M.pt(...ans), choices = [answer].concat(distinct(answer, [M.pt(x - dx, y - dy), M.pt(x + dy, y + dx), M.pt(x + dx, y - dy), M.pt(x - dx, y + dy)], 3));
        return { prompt: `Point ${V('P')}${M.pt(x, y)} is translated ${desc}. What are the coordinates of its image ${V('P')}′?`, type: 'choice', choices, answer, params: { kind: 'trans', x, y, dx, dy },
          hints: [`A translation adds to each coordinate: right/left changes ${X}, up/down changes ${Y}. The rule is (${X}, ${Y}) → (${X} ${M.signed(dx)}, ${Y} ${M.signed(dy)}).`, `${N(x)} ${M.signed(dx)} = ${N(ans[0])} and ${N(y)} ${M.signed(dy)} = ${N(ans[1])}.`, `${V('P')}′ = <b>${answer}</b>.`] };
      }
      const key = rng.pick(Object.keys(MOVES)), mv = MOVES[key], ans = mv.f(x, y), answer = M.pt(...ans);
      const cands = Object.keys(MOVES).filter(k => k !== key).map(k => M.pt(...MOVES[k].f(x, y)));
      const choices = [answer].concat(distinct(answer, rng.shuffle(cands).concat([M.pt(x, y)]), 3));
      return { prompt: `Point ${V('P')}${M.pt(x, y)} is transformed by ${mv.name}. What are the coordinates of its image ${V('P')}′?`, type: 'choice', choices, answer, params: { kind: key, x, y },
        hints: [`The rule for ${mv.name} is ${mv.rule}.`, `Apply it to ${M.pt(x, y)}: ${X} = ${N(x)}, ${Y} = ${N(y)}.`, `${V('P')}′ = <b>${answer}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'trans') return q.answer === M.pt(p.x + p.dx, p.y + p.dy);
      // a second route: rotations by the angle with cos/sin, reflections by the mirror line's formula
      const ang = { rot90: Math.PI / 2, rot180: Math.PI, rot270: -Math.PI / 2 }[p.kind];
      let ix, iy;
      if (ang != null) { ix = Math.round(p.x * Math.cos(ang) - p.y * Math.sin(ang)); iy = Math.round(p.x * Math.sin(ang) + p.y * Math.cos(ang)); }
      else { const t = { refx: 0, refy: Math.PI / 2, refyx: Math.PI / 4 }[p.kind]; ix = Math.round(p.x * Math.cos(2 * t) + p.y * Math.sin(2 * t)); iy = Math.round(p.x * Math.sin(2 * t) - p.y * Math.cos(2 * t)); }
      return q.answer === M.pt(ix || 0, iy || 0);
    },
  });

  A.skill({
    id: 'int1.congruence-criteria', title: 'Triangle congruence criteria',
    learn: p(`Two triangles are <b>congruent</b> when one can be moved onto the other by rigid transformations, so all matching sides and angles are equal. You do not need all six facts; any of these is enough: <b>SSS</b> (three pairs of sides), <b>SAS</b> (two sides and the angle <i>between</i> them), <b>ASA</b> (two angles and the side <i>between</i> them), <b>AAS</b> (two angles and a side that is <i>not</i> between them).`) +
      p(`Order matters: in SAS the angle must be the one formed by the two sides, and in ASA the side must join the two angles. SSA and AAA do <b>not</b> prove congruence: AAA triangles can be different sizes.`) +
      example('Example', `In △ABC and △DEF, AB = DE, ∠A = ∠D and ∠B = ∠E. Side AB joins angles A and B, so this is <b>ASA</b>.`),
    make(rng) {
      const crit = rng.pick(['SSS', 'SAS', 'ASA', 'AAS']), [P, Q, R] = rng.pick([['A', 'B', 'C'], ['J', 'K', 'L'], ['P', 'Q', 'R']]), [S, T, U] = rng.pick([['D', 'E', 'F'], ['X', 'Y', 'Z'], ['S', 'T', 'U']]);
      const rot = rng.int(0, 2), a = [P, Q, R].map((_, i) => [P, Q, R][(i + rot) % 3]), b = [S, T, U].map((_, i) => [S, T, U][(i + rot) % 3]);
      const side = (i, j) => `${a[i]}${a[j]} = ${b[i]}${b[j]}`, ang = i => `∠${a[i]} = ∠${b[i]}`;
      const facts = { SSS: [side(0, 1), side(1, 2), side(2, 0)], SAS: [side(0, 1), ang(1), side(1, 2)], ASA: [ang(0), side(0, 1), ang(1)], AAS: [ang(0), ang(1), side(1, 2)] }[crit];
      const why = { SSS: 'all three pairs of sides are equal', SAS: `the angle ∠${a[1]} is between sides ${a[0]}${a[1]} and ${a[1]}${a[2]}`, ASA: `side ${a[0]}${a[1]} joins the two angles ∠${a[0]} and ∠${a[1]}`, AAS: `side ${a[1]}${a[2]} is next to ∠${a[1]} but not between the two angles` }[crit];
      return { prompt: `In △${P}${Q}${R} and △${S}${T}${U}, ${M.list(rng.shuffle(facts))}. Which criterion shows the triangles are congruent?`, type: 'choice', choices: ['SSS', 'SAS', 'ASA', 'AAS'], keepOrder: true, answer: crit, params: { facts },
        hints: [`Count the given facts: how many are sides and how many are angles?`, `Then check where they sit: ${why}.`, `<b>${crit}</b>.`] };
    },
    verify(q) {
      const f = q.params.facts, sides = f.filter(s => !s.startsWith('∠')).map(s => s.slice(0, 2)), angs = f.filter(s => s.startsWith('∠')).map(s => s[1]);
      let c;
      if (sides.length === 3) c = 'SSS';
      else if (sides.length === 2) c = sides[0].split('').some(v => sides[1].includes(v) && v === angs[0]) ? 'SAS' : 'SSA';
      else c = sides[0].includes(angs[0]) && sides[0].includes(angs[1]) ? 'ASA' : 'AAS';
      return q.answer === c;
    },
  });

  /* ====================================================================================================
     The units below fill lessons of the CPM Integrated I book that the units above did not practise.
     ==================================================================================================== */
  const LT = '&lt;', GT = '&gt;';
  const r2 = x => Math.round(x * 100) / 100;
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const svg = (w, h, body, label) => `<svg class="figure" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}">${body}</svg>`;
  const mean = xs => sum(xs) / xs.length;
  const YH = V('ŷ');
  const model = (m, b) => `${YH} = ${coef(m)}${X}${tail(b)}`;          // "ŷ = 4.5x + 52"

  /* ---------- Unit 8: Residuals, regression, and correlation ---------- */
  /* contexts for a line ŷ = mx + b fitted to data; the sentence builders give the meanings of a number in the model */
  const FITS = [
    { xd: 'hours studied', yd: 'test score', hx: 'Hours studied', hy: 'Score', xr: [1, 8], ms: [3.5, 4, 4.5, 5, 5.5, 6], b: rng => rng.int(48, 62), dp: 0, icpt: true,
      say: (nm, x, y) => `${nm} studied for ${M.plural(x, 'hour')} and scored ${N(y)} points`,
      rate: v => `For each extra hour of study, the predicted score rises by ${N(v)} points`, start: v => `A student who does not study at all is predicted to score ${N(v)} points`,
      swap: v => `For each extra point scored, the predicted study time rises by ${N(v)} hours`, total: v => `The predicted score of a student who studies for ${N(v)} hours` },
    { xd: 'the age of a tree in years', yd: 'height in feet', hx: 'Age (years)', hy: 'Height (ft)', xr: [2, 12], ms: [1.2, 1.5, 1.8, 2.1, 2.4], b: rng => rng.int(2, 6), dp: 1, icpt: true,
      say: (nm, x, y) => `a ${N(x)}-year-old tree in ${nm}'s park is ${N(y)} feet tall`,
      rate: v => `For each extra year of age, a tree's predicted height rises by ${N(v)} feet`, start: v => `A tree that has just been planted is predicted to be ${N(v)} feet tall`,
      swap: v => `For each extra foot of height, a tree's predicted age rises by ${N(v)} years`, total: v => `The predicted height of a tree that is ${N(v)} years old` },
    { xd: 'the high temperature in °F', yd: 'cups of lemonade sold', hx: 'Temperature (°F)', hy: 'Cups sold', xr: [65, 95], ms: [1.5, 2, 2.5], b: rng => -rng.int(40, 60), dp: 0, icpt: false,
      say: (nm, x, y) => `on a ${N(x)}°F day ${nm}'s stand sold ${N(y)} cups`,
      rate: v => `For each degree warmer, the stand is predicted to sell ${N(v)} more cups`, start: v => `On a day when it is 0°F, the stand is predicted to sell ${N(v)} cups`,
      swap: v => `For each extra cup sold, the predicted temperature rises by ${N(v)} degrees`, total: v => `The predicted number of cups sold on a day when it is ${N(v)}°F` },
    { xd: 'weeks since planting', yd: 'height in cm', hx: 'Weeks', hy: 'Height (cm)', xr: [1, 10], ms: [1.5, 2, 2.5, 3], b: rng => rng.int(3, 8), dp: 1, icpt: true,
      say: (nm, x, y) => `after ${M.plural(x, 'week')} ${nm}'s plant was ${N(y)} cm tall`,
      rate: v => `For each extra week, the plant's predicted height rises by ${N(v)} cm`, start: v => `The plant's predicted height on the day it was planted is ${N(v)} cm`,
      swap: v => `For each extra cm of height, the predicted number of weeks rises by ${N(v)}`, total: v => `The predicted height of the plant after ${N(v)} weeks of growing` },
    { xd: 'the age of a used car in years', yd: 'price in thousands of dollars', hx: 'Age (years)', hy: 'Price ($1000s)', xr: [1, 10], ms: [-1.5, -1.8, -2, -2.2], b: rng => rng.int(24, 30), dp: 1, icpt: true,
      say: (nm, x, y) => `a ${N(x)}-year-old car that ${nm} looked at sold for ${N(y)} thousand dollars`,
      rate: v => `For each extra year of age, a car's predicted price drops by ${N(Math.abs(v))} thousand dollars`, start: v => `A brand-new car is predicted to sell for ${N(Math.abs(v))} thousand dollars`,
      swap: v => `For each extra thousand dollars of price, a car's predicted age drops by ${N(Math.abs(v))} years`, total: v => `The predicted price of a car that is ${N(Math.abs(v))} years old` },
    { xd: 'arm span in cm', yd: 'height in cm', hx: 'Arm span (cm)', hy: 'Height (cm)', xr: [140, 180], ms: [0.9, 1, 1.1], b: (rng, m) => Math.round(160 - 160 * m) + rng.int(-3, 3), dp: 0, icpt: false,
      say: (nm, x, y) => `${nm} has an arm span of ${N(x)} cm and is ${N(y)} cm tall`,
      rate: v => `For each extra cm of arm span, the predicted height rises by ${N(v)} cm`, start: v => `A person with no arm span at all is predicted to be ${N(v)} cm tall`,
      swap: v => `For each extra cm of height, the predicted arm span rises by ${N(v)} cm`, total: v => `The predicted height of a person whose arm span is ${N(v)} cm` },
  ];
  function pickFit(rng, allowed) {
    const ci = rng.pick(allowed || range(0, FITS.length - 1)), c = FITS[ci], m = rng.pick(c.ms), b = c.b(rng, m);
    return { ci, c, m, b, pred: x => M.round(m * x + b, 4), intro: `A line of best fit for data on ${c.xd} (${X}) and ${c.yd} (${Y}) is ${model(m, b)}.` };
  }
  const predLine = (m, b, x) => `${YH} = ${N(m)}(${N(x)})${tail(b)} = ${N(M.round(m * x + b, 4))}`;

  A.skill({
    id: 'int1.residuals', title: 'Residuals and prediction bounds',
    learn: p(`A line of best fit gives a <b>predicted</b> value ${YH} for each ${X}. Real data points are rarely exactly on the line. The <b>residual</b> of a point measures the miss: <b>residual = actual − predicted</b> = ${Y} − ${YH}.`) +
      p(`A <b>positive residual</b> means the point is <b>above</b> the line: the model predicted too low. A <b>negative residual</b> means the point is <b>below</b> the line: the model predicted too high. The size of the residual is the vertical distance from the point to the line.`) +
      p(`Residuals also say how much to trust a prediction. If no data point was more than 3.5 above the line or 2 below it, then a new value is likely to land between a <b>lower bound</b> of ${YH} − 2 and an <b>upper bound</b> of ${YH} + 3.5: add the largest positive residual for the upper bound, and the most negative residual for the lower bound.`) +
      example('Example', `${big(`${model(4.5, 52)}`)}A student studied 6 hours and scored 83. Predicted: 4.5(6) + 52 = 79. Residual = 83 − 79 = <b>4</b>: the point is 4 above the line.`),
    make(rng) {
      const kind = rng.pick(['value', 'value', 'meaning', 'bound', 'bound']), name = rng.pick(NAMES), f = pickFit(rng), { c, m, b, pred } = f;
      if (kind !== 'bound') {
        const x = rng.int(c.xr[0], c.xr[1]); let y, res;
        do { y = M.round(pred(x) + rng.int(-60, 60) / 10, c.dp); res = M.round(y - pred(x), 4); } while (Math.abs(res) < 0.5);
        const story = `${f.intro} ${cap(c.say(name, x, y))}.`, sideTxt = res > 0 ? 'Positive, so the point is above the line: the model predicted too low.' : 'Negative, so the point is below the line: the model predicted too high.';
        const steps = [`A residual is actual − predicted: how far the real point is above (+) or below (−) the line.`, `Predicted: ${predLine(m, b, x)}.`];
        if (kind === 'value') return { prompt: `${story} What is the residual for this data point?`, type: 'number', answer: res, params: { kind, m, b, x, y },
          hints: steps.concat([`Residual = ${N(y)} − ${wrap(pred(x))} = <b>${N(res)}</b>. ${sideTxt}`]) };
        const v = Math.abs(res), opt = (r, side) => `The residual is ${N(r)}, and the point is ${side} the line`;
        const answer = res > 0 ? opt(v, 'above') : opt(-v, 'below');
        return { prompt: `${story} Which statement about this data point is true?`, type: 'choice', choices: [opt(v, 'above'), opt(-v, 'below'), opt(v, 'below'), opt(-v, 'above')], answer, params: { kind, m, b, x, y },
          hints: steps.concat([`Residual = ${N(y)} − ${wrap(pred(x))} = ${N(res)}. ${sideTxt}`, `<b>${answer}</b>.`]) };
      }
      let xs, ys, res;
      do {
        xs = sorted(rng.sample(range(c.xr[0], c.xr[1]), 5));
        ys = xs.map(x => M.round(pred(x) + rng.int(-50, 50) / 10, c.dp)); res = xs.map((x, i) => M.round(ys[i] - pred(x), 4));
      } while (Math.max(...res) < 0.5 || Math.min(...res) > -0.5 || res.filter(r => r === Math.max(...res)).length > 1 || res.filter(r => r === Math.min(...res)).length > 1);
      const x0 = rng.pick(range(c.xr[0], c.xr[1]).filter(x => !xs.includes(x))), up = rng.bool(), ext = up ? Math.max(...res) : Math.min(...res), ans = M.round(pred(x0) + ext, 4);
      return { prompt: `${f.intro} Here is some of the data.${M.table([c.hx, c.hy], xs.map((x, i) => [N(x), N(ys[i])]))}Use the ${up ? 'largest positive' : 'most negative'} residual in this data to find ${up ? 'an upper' : 'a lower'} bound for the ${c.yd} when ${X} = ${N(x0)}.`,
        type: 'number', answer: ans, params: { kind, m, b, xs, ys, x0, up },
        hints: [`Find each residual, actual − predicted: ${xs.map((x, i) => `${N(ys[i])} − ${N(pred(x))} = ${N(res[i])}`).join('; ')}.`,
          `The ${up ? 'largest positive' : 'most negative'} residual is ${N(ext)}: no data point was more than ${N(Math.abs(ext))} ${up ? 'above' : 'below'} the line.`,
          `The prediction at ${X} = ${N(x0)} is ${predLine(m, b, x0)}.`,
          `${up ? 'Upper' : 'Lower'} bound = ${N(pred(x0))} ${M.signed(ext)} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const p = q.params, line = x => p.b + p.m * x;
      if (p.kind === 'value') return Math.abs(p.y - (line(p.x) + q.answer)) < 1e-6;          // the point sits the answer away from the line
      if (p.kind === 'meaning') { const r = p.y - line(p.x), n = nums(q.answer)[0]; return Math.abs(n - r) < 1e-6 && q.answer.endsWith(r > 0 ? 'above the line' : 'below the line'); }
      const rs = p.xs.map((x, i) => p.ys[i] - line(x)).sort((a, b) => a - b), ext = p.up ? rs[rs.length - 1] : rs[0];
      return Math.abs(q.answer - (line(p.x0) + ext)) < 1e-6;
    },
  });

  /** the least squares line's residuals for ys against xs: what is left after the best line is taken away */
  function detrend(xs, ys) {
    const mx = mean(xs), my = mean(ys), sxx = sum(xs.map(x => (x - mx) ** 2)), sxy = sum(xs.map((x, i) => (x - mx) * (ys[i] - my)));
    return ys.map((y, i) => y - my - sxy / sxx * (xs[i] - mx));
  }
  /** how much of the variation a parabola explains: near 1 for a curved pattern, near 0 for random scatter */
  function quadR2(xs, ys) {
    const S = k => sum(xs.map(x => x ** k)), T = k => sum(xs.map((x, i) => x ** k * ys[i]));
    const A2 = [[S(0), S(1), S(2), T(0)], [S(1), S(2), S(3), T(1)], [S(2), S(3), S(4), T(2)]];
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) { const f = A2[j][i] / A2[i][i]; for (let k = i; k < 4; k++) A2[j][k] -= f * A2[i][k]; }
    const c = [0, 0, 0];
    for (let i = 2; i >= 0; i--) { let s = A2[i][3]; for (let k = i + 1; k < 3; k++) s -= A2[i][k] * c[k]; c[i] = s / A2[i][i]; }
    const my = mean(ys), sst = sum(ys.map(y => (y - my) ** 2)), sse = sum(ys.map((y, i) => (y - c[0] - c[1] * xs[i] - c[2] * xs[i] ** 2) ** 2));
    return 1 - sse / sst;
  }
  const signRuns = rs => rs.reduce((k, r, i) => k + (i && Math.sign(r) !== Math.sign(rs[i - 1]) ? 1 : 0), 1);
  /** a residual plot: points [x, residual], a zero line, the residual axis from −R to R */
  function residualPlot(pts, R, xlab, ticks) {
    const n = pts.length, L = 44, Rt = 300, T = 18, B = 176, cy = (T + B) / 2, x0 = pts[0][0], x1 = pts[n - 1][0];
    const sx = x => L + 16 + (x - x0) * (Rt - L - 32) / Math.max(1, x1 - x0), sy = r => cy - r * (B - T) / (2 * R);
    let g = '';
    for (let v = -R; v <= R; v++) {
      g += `<line x1="${L}" y1="${r2(sy(v))}" x2="${Rt}" y2="${r2(sy(v))}" stroke="${v ? 'var(--line)' : 'currentColor'}" stroke-width="${v ? 0.6 : 1.6}"/>`;
      g += `<text x="${L - 6}" y="${r2(sy(v) + 4)}" text-anchor="end" font-size="11">${N(v)}</text>`;
    }
    g += `<line x1="${L}" y1="${T}" x2="${L}" y2="${B}" stroke="var(--muted)" stroke-width="1"/>`;
    pts.forEach(([x, r]) => {
      if (ticks) g += `<text x="${r2(sx(x))}" y="${B + 16}" text-anchor="middle" font-size="11">${N(x)}</text>`;
      g += `<circle cx="${r2(sx(x))}" cy="${r2(sy(r))}" r="4" fill="var(--primary)"/>`;
    });
    g += `<text x="6" y="11" font-size="11">residual</text><text x="${Rt}" y="${B + 32}" text-anchor="end" font-size="11">${xlab}</text>`;
    return svg(310, 214, g, 'residual plot');
  }

  A.skill({
    id: 'int1.residual-plots', title: 'Residual plots',
    learn: p(`A <b>residual plot</b> graphs each data point's residual (actual − predicted) against its ${X}-value. The horizontal line at 0 stands for the model itself: a point above it was underpredicted, a point below it was overpredicted.`) +
      p(`<b>If a line is a good model, the residuals are scattered randomly above and below 0, with no pattern.</b> If the residuals form a curve (positive, then negative, then positive again, or the reverse), the data bend and a line is not the right model, even if it looks close. Negative residuals are normal: about half the points sit below any good line.`) +
      p(`You can also read a residual plot: a point at height 3 above ${X} = 5 means the actual value was 3 more than the line predicted, so actual = predicted + 3.`) +
      example('Example', `Residuals in order of ${X}: 3.1, 1.2, −0.8, −2.0, −2.4, −1.6, 0.2, 2.3. They go from positive to negative and back to positive: a <b>curved pattern</b>, so a line is <b>not</b> a good model.`),
    make(rng) {
      const kind = rng.pick(['judge', 'judge', 'judge', 'read', 'worst']);
      if (kind === 'judge') {
        const n = rng.int(9, 12), xs = range(1, n), shape = rng.pick(['random', 'random', 'up', 'down']), c = (n + 1) / 2;
        let rs;
        for (;;) {
          const raw = shape === 'random' ? xs.map(() => rng.dec(-3, 3, 2)) : xs.map(x => (shape === 'up' ? 1 : -1) * ((x - c) ** 2 + rng.dec(-1, 1, 2) * 0.06 * c * c));
          const d = detrend(xs, raw), top = Math.max(...d.map(Math.abs)), size = rng.dec(2.4, 3.4, 1);
          rs = d.map(v => M.round(v / top * size, 1));
          if (rs.some(v => Math.abs(v) < 0.2)) continue;
          if (shape === 'random' ? signRuns(rs) >= 5 && quadR2(xs, rs) < 0.2 : signRuns(rs) === 3) break;
        }
        const good = 'A line is a good model: the residuals are scattered randomly', bad = 'A line is not a good model: the residuals form a curved pattern';
        const choices = [good, bad, 'A line is not a good model: several of the residuals are negative', 'A line is a good model: the residuals follow a clear pattern'];
        const answer = shape === 'random' ? good : bad, ctx = rng.pick(FITS);
        return { prompt: `A line was fitted to data on ${ctx.xd} and ${ctx.yd}. Here is its residual plot. Is a line a good model for the data?${residualPlot(xs.map((x, i) => [x, rs[i]]), 4, ctx.hx, false)}`,
          type: 'choice', choices, answer, params: { kind, rs },
          hints: [`If a line fits well, the residuals look like random scatter around 0. Negative residuals are normal: some points are always below a good line.`,
            shape === 'random' ? `Here the points bounce above and below 0 with no shape to them.` : `Here the residuals ${shape === 'up' ? 'start positive, dip below 0 in the middle, and rise again' : 'start negative, rise above 0 in the middle, and fall again'}: a curve. The data bend, so a curve would fit better than a line.`,
            `<b>${answer}</b>.`] };
      }
      const f = pickFit(rng, [0, 3, 4]), { c, m, b, pred } = f, xs = range(1, 8);
      let rs;
      do { rs = xs.slice(0, 7).map(() => rng.int(-4, 4)); rs.push(-sum(rs)); }
      while (Math.abs(rs[7]) > 4 || rs.filter(r => Math.abs(r) === Math.max(...rs.map(Math.abs))).length > 1);
      const plot = residualPlot(xs.map((x, i) => [x, rs[i]]), 5, c.hx, true), intro = `The line ${model(m, b)} was fitted to data on ${c.xd} (${X}) and ${c.yd} (${Y}). Here is its residual plot.${plot}`;
      if (kind === 'worst') {
        const k = rs.map(Math.abs).indexOf(Math.max(...rs.map(Math.abs))) + 1;
        return { prompt: `${intro}At which value of ${X} did the line's prediction miss the actual value by the most?`, type: 'number', answer: k, params: { kind, rs },
          hints: [`The size of a residual is the distance from the point to the line. Look for the point furthest from the zero line, above or below.`,
            `At ${X} = ${k} the residual is ${N(rs[k - 1])}, a miss of ${Math.abs(rs[k - 1])}; every other point is closer to 0.`, `${X} = <b>${k}</b>.`] };
      }
      const k = rng.int(1, 8), r = rs[k - 1], ans = M.round(pred(k) + r, 4);
      return { prompt: `${intro}What was the actual ${c.yd} of the data point at ${X} = ${k}?`, type: 'number', answer: ans, params: { kind, m, b, k, rs },
        hints: [`Read the plot at ${X} = ${k}: ${r === 0 ? 'the point is on the zero line, so its residual is 0' : `the point is ${Math.abs(r)} ${r > 0 ? 'above' : 'below'} the zero line, so its residual is ${N(r)}`}.`,
          `The predicted value there is ${predLine(m, b, k)}.`,
          `Residual = actual − predicted, so actual = predicted + residual = ${N(pred(k))} ${M.signed(r)} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'judge') return signRuns(p.rs) >= 5 ? q.answer.includes('scattered randomly') : signRuns(p.rs) === 3 && q.answer.includes('not a good model: the residuals form a curved');   // count sign changes instead of fitting a curve
      if (p.kind === 'worst') { let best = 0; p.rs.forEach((r, i) => { if (Math.abs(r) > Math.abs(p.rs[best])) best = i; }); return q.answer === best + 1; }
      return Math.abs(q.answer - (p.m * p.k + p.b) - p.rs[p.k - 1]) < 1e-6;
    },
  });

  A.skill({
    id: 'int1.least-squares', title: 'Using a least squares regression line',
    learn: p(`Of all the lines you could draw through a scatter plot, the <b>least squares regression line</b> (LSRL) is the one that makes the <b>sum of the squared residuals as small as possible</b>. Squaring stops positive and negative misses from canceling out. A calculator finds it for you; your job is to use it.`) +
      p(`To <b>predict</b>, substitute the ${X}-value into ${YH} = ${V('m')}${X} + ${V('b')}. To find the ${X} that gives a certain prediction, set ${YH} equal to that value and solve. <b>The slope is the predicted change in ${Y} for each extra unit of ${X}</b>, and the ${Y}-intercept is the predicted ${Y} when ${X} = 0 (which only makes sense when ${X} = 0 is realistic).`) +
      example('Example', `${big(model(4.5, 52))}for hours studied ${X} and test score ${Y}. Predict the score for 6 hours: 4.5(6) + 52 = <b>79</b> points. The slope 4.5 means each extra hour of study adds 4.5 points to the predicted score.`),
    make(rng) {
      const kind = rng.pick(['predict', 'predict', 'solve', 'slope', 'icpt', 'ssr', 'compare']);
      if (kind === 'ssr' || kind === 'compare') {
        const m = rng.pick([1, 2, 3, -1, -2]), b = rng.int(m < 0 ? 12 : 0, m < 0 ? 16 : 6), xs = range(1, 5), rs = xs.map(() => rng.int(-2, 2)), ys = xs.map((x, i) => m * x + b + rs[i]);
        const ssr = (mm, bb) => sum(xs.map((x, i) => (ys[i] - mm * x - bb) ** 2)), tbl = M.table([X, Y], xs.map((x, i) => [N(x), N(ys[i])]));
        const resLine = (mm, bb) => xs.map((x, i) => N(ys[i] - mm * x - bb)).join(', ');
        if (kind === 'ssr') return { prompt: `The least squares line is the line with the smallest sum of squared residuals. For the data below and the line ${model(m, b)}, find the sum of the squared residuals.${tbl}`,
          type: 'number', answer: ssr(m, b), params: { kind, xs, ys, lines: [[m, b]] },
          hints: [`For each point, find the residual: actual ${Y} − predicted ${YH}. The predictions are ${xs.map(x => N(m * x + b)).join(', ')}.`, `The residuals are ${resLine(m, b)}.`,
            `Square them and add: ${xs.map((x, i) => `${wrap(ys[i] - m * x - b)}²`).join(' + ')} = <b>${ssr(m, b)}</b>.`] };
        let m2, b2;
        do { m2 = m + rng.pick([-1, 0, 1]); b2 = b + rng.int(-2, 2); } while ((m2 === m && b2 === b) || m2 === 0 || Math.abs(ssr(m2, b2) - ssr(m, b)) < 2);
        const swap = rng.bool(), LA = swap ? [m2, b2] : [m, b], LB = swap ? [m, b] : [m2, b2], sa = ssr(...LA), sb = ssr(...LB), answer = sa < sb ? 'Line A' : 'Line B';
        return { prompt: `Which line fits this data better by the least squares rule?${tbl}<div>Line A: ${model(...LA)}</div><div>Line B: ${model(...LB)}</div>`, type: 'choice', choices: ['Line A', 'Line B', 'They fit equally well'], keepOrder: true, answer, params: { kind, xs, ys, lines: [LA, LB] },
          hints: [`For each line, find the residuals (actual − predicted), square them and add. The smaller total is the better fit.`, `Line A: residuals ${resLine(...LA)}, sum of squares ${sa}.`, `Line B: residuals ${resLine(...LB)}, sum of squares ${sb}.`, `<b>${answer}</b> has the smaller sum of squared residuals.`] };
      }
      const f = pickFit(rng, kind === 'icpt' ? FITS.map((c, i) => c.icpt ? i : -1).filter(i => i >= 0) : null), { c, m, b, pred } = f;
      const intro = `The least squares regression line for data on ${c.xd} (${X}) and ${c.yd} (${Y}) is ${model(m, b)}.`;
      if (kind === 'slope' || kind === 'icpt') {
        const v = kind === 'slope' ? m : b, answer = kind === 'slope' ? c.rate(v) : c.start(v);
        const choices = [c.rate(v), c.start(v), c.swap(v), c.total(v)];
        return { prompt: `${intro} What does the ${N(v)} tell you?`, type: 'choice', choices, answer, params: { kind, ci: f.ci, v },
          hints: [kind === 'slope' ? `${N(v)} multiplies ${X}: it is the slope, the predicted change in ${Y} for each extra unit of ${X}.` : `${N(v)} is the ${Y}-intercept: the predicted ${Y} when ${X} = 0.`, `<b>${answer}</b>.`] };
      }
      const x0 = rng.int(c.xr[0], c.xr[1]);
      if (kind === 'predict') return { prompt: `${intro} Use it to predict the ${c.yd} when ${X} = ${N(x0)}.`, type: 'number', answer: pred(x0), params: { kind, m, b, x0 },
        hints: [`Substitute ${X} = ${N(x0)} into the equation; ${YH} is the predicted value.`, `${YH} = ${N(m)}(${N(x0)})${tail(b)} = ${N(M.round(m * x0, 4))}${tail(b)}.`, `The predicted ${c.yd} is <b>${N(pred(x0))}</b>.`] };
      const t = pred(x0);
      return { prompt: `${intro} For which value of ${X} does the line predict a ${c.yd} of ${N(t)}?`, type: 'number', answer: x0, params: { kind, m, b, t },
        hints: [`Set the prediction equal to ${N(t)}: ${N(t)} = ${coef(m)}${X}${tail(b)}.`, `${moveWord(b)} both sides: ${N(M.round(t - b, 4))} = ${coef(m)}${X}.`, `Divide by ${N(m)}: ${X} = <b>${N(x0)}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'ssr') { let s = 0; p.xs.forEach((x, i) => { const r = p.ys[i] - (p.lines[0][0] * x + p.lines[0][1]); s += r * r; }); return s === q.answer; }
      if (p.kind === 'compare') { const s = p.lines.map(([m, b]) => p.xs.reduce((t, x, i) => t + Math.pow(p.ys[i] - m * x - b, 2), 0)); return q.answer === (s[0] < s[1] ? 'Line A' : 'Line B'); }
      if (p.kind === 'slope' || p.kind === 'icpt') { const c = FITS[p.ci]; return q.answer === (p.kind === 'slope' ? c.rate(p.v) : c.start(p.v)); }
      if (p.kind === 'predict') { const y1 = p.m + p.b; return Math.abs(q.answer - (y1 + p.m * (p.x0 - 1))) < 1e-6; }   // from the point at x = 1, step along the slope
      return Math.abs(p.m * q.answer + p.b - p.t) < 1e-6;
    },
  });

  /** points with correlation exactly rho before rounding: x at random, y built from x and noise made independent of x */
  function corrPoints(rng, rho, n) {
    const xs = Array.from({ length: n }, () => rng.dec(0.3, 9.7, 2)), es = Array.from({ length: n }, () => rng.dec(-1, 1, 3));
    const z = v => { const mu = mean(v), sd = Math.sqrt(mean(v.map(t => (t - mu) ** 2))); return v.map(t => (t - mu) / sd); };
    const zx = z(xs), k = mean(es.map((e, i) => e * zx[i])), ze = z(es.map((e, i) => e - k * zx[i]));
    const ys = zx.map((t, i) => rho * t + Math.sqrt(1 - rho * rho) * ze[i]), lo = Math.min(...ys), hi = Math.max(...ys);
    return xs.map((x, i) => [M.round(x, 1), M.round(0.3 + 9.4 * (ys[i] - lo) / (hi - lo), 1)]);
  }
  function pearson(pts) {
    const n = pts.length, sx = sum(pts.map(p => p[0])), sy = sum(pts.map(p => p[1])), sxy = sum(pts.map(p => p[0] * p[1])), sxx = sum(pts.map(p => p[0] * p[0])), syy = sum(pts.map(p => p[1] * p[1]));
    return (n * sxy - sx * sy) / Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy));
  }
  function scatterPlot(pts, xlab, ylab) {
    const L = 34, B = 184, W = 256, H = 164, sx = x => L + 6 + x * (W - 12) / 10, sy = y => B - 6 - y * (H - 12) / 10;
    let g = `<line x1="${L}" y1="${B}" x2="${L + W}" y2="${B}" class="stroke" style="stroke-width:1.4"/><line x1="${L}" y1="${B}" x2="${L}" y2="${B - H}" class="stroke" style="stroke-width:1.4"/>`;
    pts.forEach(([x, y]) => { g += `<circle cx="${r2(sx(x))}" cy="${r2(sy(y))}" r="4" fill="var(--primary)"/>`; });
    g += `<text x="${L + W}" y="${B + 16}" text-anchor="end" font-size="12" font-style="italic">${xlab}</text><text x="${L}" y="${B - H - 6}" font-size="12" font-style="italic">${ylab}</text>`;
    return svg(300, 206, g, 'scatter plot');
  }
  const R_OPTS = [-0.95, -0.55, 0.02, 0.55, 0.95];
  const CORR_CTX = [
    { pair: 'the heights and arm spans of 25 students', sign: 1 }, { pair: 'the ages and prices of 20 used cars', sign: -1 },
    { pair: 'hours of practice and free throws made by 18 players', sign: 1 }, { pair: 'the outside temperature and the heating bill over 12 months', sign: -1 },
    { pair: 'shoe size and quiz score for 30 students', sign: 0 }, { pair: 'daily minutes on a phone and hours of sleep for 40 teens', sign: -1 },
    { pair: 'hours worked and money earned by 15 part-time workers', sign: 1 }, { pair: 'birth month and height for 28 adults', sign: 0 },
  ];
  /* a strong correlation explained by a lurking variable, not by cause */
  const CAUSES = [
    { a: 'ice cream sales', b: 'sunburn cases', when: 'day by day in a beach town', lurk: 'hot, sunny weather' },
    { a: 'shoe size', b: 'reading level', when: 'for the students of an elementary school', lurk: 'the students’ age' },
    { a: 'the number of firefighters sent', b: 'the damage done', when: 'for fires in one city', lurk: 'the size of the fire' },
    { a: 'hot chocolate sales', b: 'flu cases', when: 'month by month in a town', lurk: 'cold winter weather' },
    { a: 'the number of libraries', b: 'the number of car crashes', when: 'across 50 cities', lurk: 'the size of each city' },
    { a: 'a child’s height', b: 'the number of words the child knows', when: 'for children aged 2 to 10', lurk: 'the children’s age' },
    { a: 'umbrella sales', b: 'traffic delays', when: 'day by day in one city', lurk: 'rainy weather' },
  ];

  A.skill({
    id: 'int1.correlation', title: 'Correlation coefficient and causation',
    learn: p(`The <b>correlation coefficient ${V('r')}</b> is a number from −1 to 1 that measures how closely a scatter plot follows a straight line. <b>Its sign gives the direction</b> (positive: the points rise from left to right; negative: they fall) and <b>its size gives the strength</b>: close to 1 or −1 means the points hug a line, close to 0 means there is no linear pattern. So ${V('r')} = −0.9 is a stronger association than ${V('r')} = 0.6.`) +
      p(`<b>Association is not causation.</b> A strong correlation says two variables move together; it does not say that one causes the other. Often a <b>lurking variable</b> drives both: ice cream sales and sunburns rise together because of hot, sunny weather, not because ice cream burns anyone.`) +
      example('Example', `Which is the strongest: ${V('r')} = 0.62, −0.88, 0.35 or −0.41? Compare sizes, ignoring signs: 0.88 is the largest, so <b>${V('r')} = −0.88</b> is the strongest (a strong negative association).`),
    make(rng) {
      const kind = rng.pick(['plot', 'plot', 'interpret', 'strongest', 'cause']);
      if (kind === 'plot') {
        const rho = rng.pick(R_OPTS), pts = corrPoints(rng, rho, rng.int(13, 16)), others = rng.sample(R_OPTS.filter(v => v !== rho), 3);
        const opts = sorted(others.concat([rho])), choices = opts.map(v => `${V('r')} = ${N(v)}`), answer = `${V('r')} = ${N(rho)}`;
        const desc = rho === 0.02 ? 'show no straight-line pattern at all' : `${rho > 0 ? 'rise' : 'fall'} from left to right ${Math.abs(rho) > 0.9 ? 'and lie close to a line' : 'but are loosely spread around a line'}`;
        return { prompt: `Which value of the correlation coefficient best matches this scatter plot?${scatterPlot(pts, 'x', 'y')}`, type: 'choice', choices, answer, keepOrder: true, params: { kind, pts, opts },
          hints: [`The sign of ${V('r')} gives the direction: positive if the points rise from left to right, negative if they fall.`, `The size of ${V('r')} gives the strength: close to ±1 when the points hug a line, near 0 when there is no linear pattern.`, `These points ${desc}, so <b>${answer}</b>.`] };
      }
      if (kind === 'interpret') {
        const ctx = rng.pick(CORR_CTX), strong = ctx.sign !== 0 && rng.chance(0.6), sign = ctx.sign || rng.sign();
        const r = sign * (strong ? rng.dec(0.8, 0.97, 2) : rng.dec(0.15, 0.35, 2)), choices = ['Strong positive association', 'Weak positive association', 'Strong negative association', 'Weak negative association'];
        const answer = `${strong ? 'Strong' : 'Weak'} ${r > 0 ? 'positive' : 'negative'} association`;
        return { prompt: `The correlation coefficient for ${ctx.pair} is ${V('r')} = ${N(r)}. Which best describes the association?`, type: 'choice', choices, answer, keepOrder: true, params: { kind, r },
          hints: [`Direction: ${V('r')} is ${r > 0 ? 'positive, so as one variable increases the other tends to increase' : 'negative, so as one variable increases the other tends to decrease'}.`,
            `Strength: ${N(Math.abs(r))} is ${strong ? 'close to 1, so the points lie close to a line' : 'much nearer 0 than 1, so the points are only loosely spread around a line'}.`, `<b>${answer}</b>.`] };
      }
      if (kind === 'strongest') {
        const top = rng.dec(0.8, 0.97, 2) * (rng.chance(0.6) ? -1 : 1), vals = [top];
        while (vals.length < 4) { const v = rng.dec(0.1, Math.abs(top) - 0.08, 2) * rng.sign(); if (!vals.some(w => Math.abs(Math.abs(w) - Math.abs(v)) < 0.03)) vals.push(v); }
        if (top < 0 && vals.every(v => v < 0)) vals[1] = -vals[1];                    // a positive value that is bigger as a number: the tempting wrong pick
        const choices = vals.map(v => `${V('r')} = ${N(v)}`), answer = choices[0];
        return { prompt: `Which correlation coefficient shows the strongest linear association?`, type: 'choice', choices, answer, params: { kind, vals },
          hints: [`Strength depends on how close ${V('r')} is to 1 or −1, not on its sign: −0.9 is stronger than 0.6.`, `Compare the sizes, ignoring signs: ${vals.map(v => N(Math.abs(v))).join(', ')}.`, `The largest size is ${N(Math.abs(top))}, so <b>${answer}</b>.`] };
      }
      const ci = rng.int(0, CAUSES.length - 1), cz = CAUSES[ci], r = rng.dec(0.8, 0.95, 2);
      const answer = `They are associated, but ${cz.lurk} could explain both; this does not show cause`;
      const choices = [answer, `${cap(cz.a)} causes ${cz.b} to rise, because the correlation is so strong`, `Making ${cz.a} smaller would make ${cz.b} smaller by the same amount`, `There is no real association between ${cz.a} and ${cz.b} at all`];
      return { prompt: `Data collected ${cz.when} show a strong positive correlation (${V('r')} = ${N(r)}) between ${cz.a} and ${cz.b}. Which conclusion is justified?`, type: 'choice', choices, answer, params: { kind, ci },
        hints: [`A strong correlation says the two variables move together. It does not say why they do.`, `Think of something that could push both up at once: here ${cz.lurk} does. That is a lurking variable.`, `<b>${answer}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'plot') { const r = pearson(p.pts), best = p.opts.slice().sort((a, b) => Math.abs(a - r) - Math.abs(b - r))[0]; return Math.abs(best - r) < 0.1 && q.answer.endsWith(N(best)); }   // r measured from the drawn points
      if (p.kind === 'interpret') return q.answer.startsWith(Math.abs(p.r) >= 0.7 ? 'Strong' : 'Weak') && q.answer.includes(p.r > 0 ? 'positive' : 'negative');
      if (p.kind === 'strongest') { const best = p.vals.slice().sort((a, b) => Math.abs(b) - Math.abs(a))[0]; return q.answer.endsWith(N(best)); }
      return q.answer.includes(CAUSES[p.ci].lurk) && q.answer.endsWith('does not show cause');
    },
  });

  /* ---------- Unit 9: Shape and spread of distributions ---------- */
  /** a histogram: bar heights over equal bins starting at lo, each w wide */
  function histogram(hs, lo, w, xlab) {
    const k = hs.length, top = Math.max(...hs) + 1, L = 36, B = 170, H = 150, bw = 248 / k, sy = v => B - v * H / top;
    let g = '';
    for (let v = 0; v <= top; v += top > 8 ? 2 : 1) g += `<line x1="${L}" y1="${r2(sy(v))}" x2="${L + 252}" y2="${r2(sy(v))}" stroke="var(--line)" stroke-width="0.6"/><text x="${L - 6}" y="${r2(sy(v) + 4)}" text-anchor="end" font-size="11">${v}</text>`;
    hs.forEach((h, i) => { g += `<rect x="${r2(L + 2 + i * bw)}" y="${r2(sy(h))}" width="${r2(bw)}" height="${r2(h * H / top)}" class="fill" style="stroke-width:1"/>`; });
    for (let i = 0; i <= k; i++) if (k < 9 || i % 2 === 0) g += `<text x="${r2(L + 2 + i * bw)}" y="${B + 15}" text-anchor="middle" font-size="11">${N(lo + i * w)}</text>`;
    g += `<line x1="${L}" y1="${B}" x2="${L + 254}" y2="${B}" class="stroke" style="stroke-width:1.4"/><text x="${L + 252}" y="${B + 32}" text-anchor="end" font-size="11">${xlab}</text><text x="4" y="12" font-size="11">count</text>`;
    return svg(300, 208, g, 'histogram');
  }
  const SHAPE_BASE = {
    right: [[3, 8, 9, 6, 4, 3, 2, 1], [6, 9, 7, 5, 3, 2, 1, 1], [2, 7, 9, 7, 5, 3, 2, 1, 1], [5, 9, 8, 5, 3, 2, 1], [4, 10, 8, 6, 4, 3, 2, 1, 1]],
    sym: [[1, 3, 6, 9, 6, 3, 1], [1, 2, 5, 8, 8, 5, 2, 1], [1, 2, 4, 7, 9, 7, 4, 2, 1], [2, 4, 7, 9, 7, 4, 2], [1, 3, 5, 8, 10, 8, 5, 3, 1]],
    bi: [[2, 6, 8, 5, 2, 4, 8, 6, 2], [1, 5, 8, 4, 2, 5, 8, 4, 1], [3, 8, 6, 2, 3, 7, 8, 3], [2, 7, 9, 4, 1, 5, 9, 6, 2], [1, 4, 8, 6, 2, 3, 7, 7, 2]],
  };
  const HIST_CTX = [
    { xl: 'Score on a test (out of 100)', lo: 10, w: 10 }, { xl: 'Minutes to finish a puzzle', lo: 0, w: 5 }, { xl: 'Length of a fish (cm)', lo: 10, w: 4 },
    { xl: 'Hours of screen time a week', lo: 0, w: 4 }, { xl: 'Height of a plant (cm)', lo: 20, w: 5 }, { xl: 'Price of a meal ($)', lo: 5, w: 3 },
  ];
  /** bar heights with the given shape and a little random wobble that keeps the shape */
  function shapedBars(rng, shape) {
    const base = rng.pick(SHAPE_BASE[shape === 'left' ? 'right' : shape]).slice();
    let hs;
    if (shape === 'sym') {
      const half = base.slice(0, Math.ceil(base.length / 2)).map((h, i, a) => i === a.length - 1 ? h + rng.int(0, 1) : h + rng.int(0, 1));
      for (let i = 1; i < half.length; i++) if (half[i] <= half[i - 1]) half[i] = half[i - 1] + 1;      // still rising to the middle
      hs = half.concat(half.slice(0, Math.floor(base.length / 2)).reverse());
    } else if (shape === 'bi') hs = base.map(h => h + rng.int(0, 1));
    else {
      const pk = base.indexOf(Math.max(...base)), up = base.slice(0, pk + 1).map(h => h + rng.int(0, 1));
      for (let i = 1; i < up.length; i++) if (up[i] <= up[i - 1]) up[i] = up[i - 1] + 1;
      const tail = base.slice(pk + 1).map(h => h + rng.int(0, 1)).sort((a, b) => b - a).map(h => Math.min(h, up[up.length - 1] - 1));
      hs = up.concat(tail);
      if (shape === 'left') hs.reverse();
    }
    return hs;
  }
  /** mean and median of binned data, each value counted at the middle of its bin */
  function binStats(hs, lo, w) {
    const vals = []; hs.forEach((h, i) => { for (let j = 0; j < h; j++) vals.push(lo + (i + 0.5) * w); });
    const n = vals.length, med = n % 2 ? vals[(n - 1) / 2] : (vals[n / 2 - 1] + vals[n / 2]) / 2;
    return { mean: mean(vals), med };
  }

  A.skill({
    id: 'int1.distribution-shape', title: 'Shape of a distribution',
    learn: p(`The <b>shape</b> of a histogram or dot plot is the first thing to describe. A <b>symmetric</b> distribution has two sides that roughly mirror each other around a single peak. A <b>skewed</b> distribution has a long tail on one side, and <b>it is named for the side of the tail</b>: a tail stretching to the right is <b>skewed right</b>, a tail stretching to the left is <b>skewed left</b>. A <b>bimodal</b> distribution has two separate peaks, often because two different groups are mixed together.`) +
      p(`The shape tells you how the mean and median compare. The few values far out in a tail pull the mean toward them, but they barely move the median. So <b>skewed right: mean &gt; median; skewed left: mean &lt; median; symmetric: mean ≈ median</b>. That is also why the median and IQR are the better summary for skewed data, and the mean and standard deviation for symmetric data.`) +
      example('Example', `Waiting times pile up at 0 to 10 minutes, and a few people waited 30, 40 or even 45 minutes. The tail goes to the right, so the distribution is <b>skewed right</b>, and the long waits pull the mean above the median.`),
    make(rng) {
      const ask = rng.pick(['shape', 'shape', 'center']), shape = ask === 'center' ? rng.pick(['right', 'left', 'sym']) : rng.pick(['right', 'left', 'sym', 'bi']), ctx = rng.pick(HIST_CTX);
      let hs, st;
      do { hs = shapedBars(rng, shape); st = binStats(hs, ctx.lo, ctx.w); } while (shape !== 'sym' && shape !== 'bi' && Math.abs(st.mean - st.med) < 0.3 * ctx.w);
      const pic = histogram(hs, ctx.lo, ctx.w, ctx.xl), names = { right: 'Skewed right', left: 'Skewed left', sym: 'Symmetric', bi: 'Bimodal' };
      const look = { right: 'Most of the data piles up on the left, with a long tail stretching out to the right.', left: 'Most of the data piles up on the right, with a long tail stretching out to the left.', sym: 'There is one peak in the middle, and the two sides mirror each other.', bi: 'There are two separate peaks with a dip between them.' }[shape];
      if (ask === 'shape') {
        const answer = names[shape];
        return { prompt: `What is the shape of this distribution?${pic}`, type: 'choice', choices: ['Symmetric', 'Skewed left', 'Skewed right', 'Bimodal'], keepOrder: true, answer, params: { ask, hs, lo: ctx.lo, w: ctx.w },
          hints: [`Look for the peaks and the tails. One peak or two? Is there a long tail, and on which side?`, look, shape === 'right' || shape === 'left' ? `A skewed distribution is named for the side its tail points to: <b>${answer}</b>.` : `<b>${answer}</b>.`] };
      }
      const opts = ['The mean is greater than the median', 'The mean is less than the median', 'The mean and the median are about equal'];
      const answer = { right: opts[0], left: opts[1], sym: opts[2] }[shape];
      return { prompt: `Here is a histogram of some data. How do the mean and the median of the data compare?${pic}`, type: 'choice', choices: opts, keepOrder: true, answer, params: { ask, hs, lo: ctx.lo, w: ctx.w },
        hints: [look, shape === 'sym' ? `In a symmetric distribution the values balance out on both sides of the middle, so the mean lands in the same place as the median.` : `The few values far out in the ${shape === 'right' ? 'right' : 'left'} tail pull the mean toward them; the median, the middle value, hardly moves.`, `<b>${answer}</b>.`] };
    },
    verify(q) {
      const { ask, hs, lo, w } = q.params, n = hs.length;
      let dip = false;                                                     // two peaks: some bar at least 3 lower than a bar on each side of it
      for (let j = 1; j < n - 1; j++) if (Math.max(...hs.slice(0, j)) - hs[j] >= 3 && Math.max(...hs.slice(j + 1)) - hs[j] >= 3) dip = true;
      const tot = sum(hs), mu = sum(hs.map((h, i) => h * i)) / tot, m2 = sum(hs.map((h, i) => h * (i - mu) ** 2)) / tot, m3 = sum(hs.map((h, i) => h * (i - mu) ** 3)) / tot, skew = m3 / Math.pow(m2, 1.5);
      if (ask === 'shape') {
        if (dip) return q.answer === 'Bimodal';
        return q.answer === (Math.abs(skew) < 0.05 ? 'Symmetric' : skew > 0.3 ? 'Skewed right' : skew < -0.3 ? 'Skewed left' : 'unclear');
      }
      if (dip) return 'bimodal data in a center question';
      const at = k => { let c = 0; for (let i = 0; i < n; i++) { c += hs[i]; if (c >= k) return lo + (i + 0.5) * w; } };   // the k-th value, walking the running totals
      const med = tot % 2 ? at((tot + 1) / 2) : (at(tot / 2) + at(tot / 2 + 1)) / 2, avg = lo + (mu + 0.5) * w;
      return q.answer === (Math.abs(avg - med) < 1e-9 ? 'The mean and the median are about equal' : avg > med ? 'The mean is greater than the median' : 'The mean is less than the median');
    },
  });

  const popSD = xs => { const mu = mean(xs); return Math.sqrt(mean(xs.map(x => (x - mu) ** 2))); };
  A.skill({
    id: 'int1.standard-deviation', title: 'Standard deviation',
    learn: p(`The <b>standard deviation</b> measures spread: roughly, the typical distance of the data values from the mean. A small standard deviation means the values huddle close to the mean; a large one means they are spread far from it.`) +
      p(`<b>To find it: find the mean, subtract the mean from each value, square those deviations, find the mean of the squares, then take the square root.</b> Squaring stops the negative and positive deviations from canceling. This course divides by ${V('n')}, the number of values (a calculator shows this as σ${X}; some books divide by ${V('n')} − 1 for a sample, which gives a slightly larger number).`) +
      p(`Adding the same number to every value moves the data but does not spread it out, so the standard deviation stays the same. Multiplying every value by ${V('k')} multiplies the standard deviation by ${V('k')}.`) +
      example('Example', `${big('4, 8, 6, 2, 10')}Mean = 30 ÷ 5 = 6. Deviations: −2, 2, 0, −4, 4. Squares: 4, 4, 0, 16, 16, total 40. 40 ÷ 5 = 8, and √8 ≈ <b>2.8</b>.`),
    make(rng) {
      const kind = rng.pick(['compute', 'compute', 'compare', 'transform']);
      if (kind === 'compute') {
        const n = rng.pick([5, 6]), mu = rng.int(8, 40);
        let ds, sd;
        do { ds = Array.from({ length: n - 1 }, () => rng.int(-7, 7)); ds.push(-sum(ds)); sd = Math.sqrt(mean(ds.map(d => d * d))); }
        while (Math.abs(ds[n - 1]) > 9 || sd < 1 || Math.abs(sd * 10 - Math.round(sd * 10)) > 0.45 || mu + Math.min(...ds) < 0);
        const data = ds.map(d => mu + d), sq = ds.map(d => d * d), ans = M.round(sd, 1);
        const ctx = rng.pick(['the points a basketball player scored in recent games', 'the numbers of texts some friends sent in an hour', 'the quiz scores (out of 50) of a small group', 'the daily high temperatures in °C over several days']);
        return { prompt: `Here are ${ctx}:${big(data.map(N).join(', '))}Find the standard deviation, dividing by the number of values. Round to the nearest tenth.`, type: 'number', answer: ans, tolerance: 0.05, params: { kind, data },
          hints: [`Mean = ${sum(data)} ÷ ${n} = ${mu}.`, `Subtract the mean from each value: ${ds.map(N).join(', ')}.`, `Square each one: ${sq.join(', ')}. Their total is ${sum(sq)}, and ${sum(sq)} ÷ ${n} = ${N(M.round(sum(sq) / n, 4))}.`, `Standard deviation = √${N(M.round(sum(sq) / n, 4))} ≈ <b>${N(ans)}</b>.`] };
      }
      if (kind === 'compare') {
        const how = rng.pick(['spread', 'spread', 'spread', 'shift', 'mirror']), n = 5, mu = rng.int(20, 60);
        let a, b;
        do {
          const da = Array.from({ length: n - 1 }, () => rng.int(-4, 4)); da.push(-sum(da)); a = da.map(d => mu + d);
          if (how === 'spread') { const k = rng.pick([2, 3]); b = rng.shuffle(da.map(d => mu + k * d + rng.int(-1, 1))); }
          else if (how === 'shift') { const k = rng.pick([5, 10, 20, 50]); b = a.map(x => x + k); }
          else b = rng.shuffle(a.map(x => 2 * mu - x));
        } while (Math.abs(a[n - 1] - mu) > 6 || popSD(a) < 1 || new Set(a).size < 4 || (how === 'spread' && popSD(b) < popSD(a) * 1.5) || (how === 'mirror' && sorted(a).join() === sorted(b).join()));
        const flip = rng.bool(), A1 = flip ? b : a, B1 = flip ? a : b;
        const answer = how !== 'spread' ? 'They have the same standard deviation' : (popSD(A1) > popSD(B1) ? 'Set A' : 'Set B');
        const why = how === 'spread' ? `The values of ${answer.slice(-5)} sit much farther from their mean, so its typical distance from the mean is bigger.`
          : how === 'shift' ? `Set ${flip ? 'A' : 'B'} is set ${flip ? 'B' : 'A'} with the same number added to every value: the data moved, but the gaps between values did not change.`
            : `Each set is the other one flipped around the mean ${mu}: the distances from the mean are the same, only on the opposite sides.`;
        return { prompt: `Which data set has the larger standard deviation?<div class="big">Set A: ${A1.map(N).join(', ')}</div><div class="big">Set B: ${B1.map(N).join(', ')}</div>`, type: 'choice', choices: ['Set A', 'Set B', 'They have the same standard deviation'], keepOrder: true, answer, params: { kind, a: A1, b: B1 },
          hints: [`Standard deviation measures how far the values are from their own mean, not how big the values are.`, `Mean of set A: ${N(mean(A1))}; mean of set B: ${N(mean(B1))}. Distances from the mean: A ${A1.map(x => N(Math.abs(x - mean(A1)))).join(', ')}; B ${B1.map(x => N(Math.abs(x - mean(B1)))).join(', ')}.`, why, `<b>${answer}</b>.`] };
      }
      const s = rng.dec(1.5, 9.5, 1), add = rng.bool(), k = add ? rng.pick([3, 5, 8, 10, 12, 20]) : rng.int(2, 5), ans = add ? s : M.round(k * s, 4);
      const ctx = rng.pick([['The test scores in a class', 'points'], ['The weights of the apples in a crate', 'grams'], ['The times runners took for a race', 'seconds'], ['The heights of the plants in a garden', 'cm']]);
      return { prompt: `${ctx[0]} have a standard deviation of ${N(s)} ${ctx[1]}. ${add ? `Every value is increased by ${k} ${ctx[1]}.` : `Every value is multiplied by ${k}.`} What is the new standard deviation?`, type: 'number', answer: ans, unit: ctx[1], params: { kind, s, k, add },
        hints: [add ? `Adding ${k} to every value slides the whole data set along; every value is still the same distance from the (new) mean.` : `Multiplying every value by ${k} stretches every distance from the mean by ${k}.`,
          add ? `So the spread does not change: the standard deviation is still <b>${N(ans)}</b> ${ctx[1]}.` : `So the standard deviation is multiplied by ${k}: ${k} × ${N(s)} = <b>${N(ans)}</b> ${ctx[1]}.`] };
    },
    verify(q) {
      const p = q.params, sd2 = xs => { const n = xs.length, s1 = sum(xs), s2 = sum(xs.map(x => x * x)); return Math.sqrt(Math.max(0, s2 / n - (s1 / n) ** 2)); };   // mean of squares − square of mean
      if (p.kind === 'compute') return Math.abs(sd2(p.data) - q.answer) <= 0.05 + 1e-9;
      if (p.kind === 'compare') { const a = sd2(p.a), b = sd2(p.b); return q.answer === (Math.abs(a - b) < 1e-6 ? 'They have the same standard deviation' : a > b ? 'Set A' : 'Set B'); }
      const base = [50 - p.s, 50 + p.s], moved = base.map(x => p.add ? x + p.k : x * p.k);   // a two-value data set with this standard deviation
      return Math.abs(sd2(moved) - q.answer) < 1e-6;
    },
  });

  /* ---------- Unit 10: More equations and inequalities ---------- */
  const POW_MAX = { 2: 5, 3: 4, 5: 3 }, NUM_MAX = { 2: 10, 3: 6, 5: 4 };
  const expo = (a, b) => a ? M.poly([a, b]) : N(b);                                   // an exponent such as 2x + 1, or a plain number
  const expoP = (a, b) => a && (b || Math.abs(a) !== 1) ? `(${expo(a, b)})` : expo(a, b);
  const mulE = (p, a, b) => p === 1 ? expo(a, b) : a ? `${p}${expoP(a, b)}` : N(p * b);       // p times an exponent, written out
  A.skill({
    id: 'int1.exponential-equations', title: 'Solving exponential equations with a common base',
    learn: p(`Some exponential equations can be solved without logarithms, by writing both sides as powers of the <b>same base</b>. 8, 4, 32 and 1/2 are all powers of 2; 9, 27 and 81 are all powers of 3.`) +
      p(`Rewrite each base, then use the power-of-a-power rule, <b>(${M.sup(V('b'), V('m'))})${M.sup('', V('n'))} = ${M.sup(V('b'), `${V('m')}${V('n')}`)}</b>: multiply the exponents. <b>Once both sides are powers of the same base, the exponents must be equal</b>, so set them equal and solve the linear equation. A fraction like 1/8 is a negative power: 1/8 = 2${M.sup('', '−3')}.`) +
      example('Example', `${big(`${M.sup(9, 2)} = ${M.sup(3, `2${X} + 1`)}`)}9 = 3², so 9² = (3²)² = 3⁴. Then 3⁴ = ${M.sup(3, `2${X} + 1`)}, so 4 = 2${X} + 1 and ${X} = <b>${F(3, 2)}</b>.`),
    make(rng) {
      const kind = rng.pick(['num', 'num', 'two', 'two', 'power']), g = rng.pick([2, 2, 3, 3, 5]);
      let p, a, b, q, c, d, x;
      for (;;) {
        p = rng.int(kind === 'num' ? 1 : 2, POW_MAX[g]);
        if (kind === 'num') { a = rng.int(1, 3); b = rng.int(-3, 3); q = 1; c = 0; d = rng.chance(0.25) ? -rng.int(1, NUM_MAX[g]) : rng.int(1, NUM_MAX[g]); }
        else if (kind === 'two') { a = rng.int(1, 2); b = rng.int(-3, 3); q = rng.int(1, POW_MAX[g]); c = rng.int(1, 2); d = rng.int(-3, 3); }
        else { a = 0; b = rng.int(2, 3); q = rng.int(1, POW_MAX[g]); c = rng.int(1, 3); d = rng.int(-3, 3); }
        if ((kind !== 'num' && p === q) || p * a === q * c || (kind === 'two' && b === 0 && d === 0)) continue;
        const [nn, dd] = M.simp(q * d - p * b, p * a - q * c);
        if (dd > 2 || Math.abs(nn / dd) > 12 || (dd === 2 && !rng.chance(0.4))) continue;
        if (kind === 'power' && p * b > NUM_MAX[g] + 2) continue;
        x = nn / dd; break;
      }
      const BL = g ** p, BR = g ** q, lhs = M.sup(N(BL), expo(a, b));
      const rhs = kind === 'num' ? (d < 0 ? F(1, g ** -d) : N(g ** d)) : M.sup(N(BR), expo(c, d));
      const conv = (p === 1 ? [] : [`${N(BL)} = ${M.sup(g, p)}`]).concat(kind === 'num' ? [d < 0 ? `${F(1, g ** -d)} = ${M.sup(g, N(d))}` : `${N(g ** d)} = ${M.sup(g, d)}`] : q === 1 ? [] : [`${N(BR)} = ${M.sup(g, q)}`]);
      const eqL = mulE(p, a, b), eqR = kind === 'num' ? N(d) : mulE(q, c, d), L = M.sup(g, eqL), R = M.sup(g, eqR);
      const [sn, sd] = M.simp(q * d - p * b, p * a - q * c), flipS = p * a - q * c < 0 ? -1 : 1;     // show the x term with a positive coefficient
      return { prompt: `Solve for ${X}.${big(`${lhs} = ${rhs}`)}`, type: 'number', answer: x, answerText: M.fracText(sn, sd), params: { BL, BR, a, b, c, d, num: kind === 'num' ? (d < 0 ? 1 / g ** -d : g ** d) : null },
        hints: [`Write every base as a power of ${g}: ${M.list(conv)}.`,
          p === 1 && (kind === 'num' || q === 1) ? `Now both sides are powers of ${g}: ${L} = ${R}.` : `Multiply the exponents (a power of a power): ${L} = ${R}.`,
          `The bases match, so the exponents are equal: ${eqL} = ${eqR}, which simplifies to ${M.term(flipS * (p * a - q * c), 'x')} = ${N(flipS * (q * d - p * b))}.`,
          `${X} = <b>${F(sn, sd)}</b>${sd === 1 ? '' : ` (${M.fracText(sn, sd)})`}.`] };
    },
    verify(q) {
      const { BL, BR, a, b, c, d, num } = q.params, x = q.answer;
      const left = (a * x + b) * Math.log(BL), right = num == null ? (c * x + d) * Math.log(BR) : Math.log(num);     // compare the logarithms of the two sides
      return Math.abs(left - right) < 1e-9 && Math.abs(a * Math.log(BL) - (num == null ? c * Math.log(BR) : 0)) > 1e-9;
    },
  });

  A.skill({
    id: 'int1.absolute-value-inequalities', title: 'Absolute value inequalities',
    learn: p(`|${V('u')}| is the distance of ${V('u')} from 0. So <b>|${V('u')}| &lt; ${V('b')} means ${V('u')} is within ${V('b')} of 0: −${V('b')} &lt; ${V('u')} &lt; ${V('b')}</b>, one connected interval (an “and” inequality). And <b>|${V('u')}| &gt; ${V('b')} means ${V('u')} is more than ${V('b')} away from 0 on either side: ${V('u')} &lt; −${V('b')} or ${V('u')} &gt; ${V('b')}</b>, two separate pieces (an “or” inequality).`) +
      p(`Get the absolute value alone on one side first. Then write the “and” or “or” form and solve each part. ≤ and ≥ keep their endpoints; &lt; and &gt; leave them out.`) +
      example('Example', `${big(`|2${X} − 6| + 1 &gt; 9`)}Subtract 1: |2${X} − 6| &gt; 8. So 2${X} − 6 &lt; −8 or 2${X} − 6 &gt; 8. Add 6 and divide by 2: <b>${X} &lt; −1 or ${X} &gt; 7</b>.`),
    make(rng) {
      const m = rng.pick([1, 1, 1, 2, 3]), cen = rng.nz(-8, 8), w = rng.int(1, 6), k = -m * cen, b = m * w, e = rng.chance(0.35) ? rng.nz(-6, 6) : 0;
      const lo = cen - w, hi = cen + w, less = rng.bool(), strict = rng.bool(), rel = less ? (strict ? LT : '≤') : (strict ? GT : '≥');
      const low = r => ({ [GT]: LT, '≥': '≤' })[r], tog = r => ({ [LT]: '≤', '≤': LT, [GT]: '≥', '≥': GT })[r];
      const inner = M.poly([m, k]), shown = `|${inner}|${e ? ' ' + M.signed(e) : ''} ${rel} ${N(b + e)}`;
      const andF = (l, h, r) => `${N(l)} ${r} ${X} ${r} ${N(h)}`, orF = (l, h, r) => `${X} ${low(r)} ${N(l)} or ${X} ${r} ${N(h)}`;
      const steps = e ? [`Get the absolute value alone first. ${moveWord(e)} both sides: |${inner}| ${rel} ${N(b)}.`] : [];
      steps.push(less ? `|${inner}| ${rel} ${N(b)} means ${inner} is within ${N(b)} of 0: ${N(-b)} ${rel} ${inner} ${rel} ${N(b)}.` : `|${inner}| ${rel} ${N(b)} means ${inner} is ${strict ? 'more than' : 'at least'} ${N(b)} away from 0, on either side: ${inner} ${low(rel)} ${N(-b)} or ${inner} ${rel} ${N(b)}.`);
      const solve = `${moveWord(k)} ${less ? 'every part' : 'both sides of each'}${m > 1 ? `, then divide by ${m}` : ''}`;
      if (less && rng.chance(0.3)) {
        const count = hi - lo + (strict ? -1 : 1);
        return { prompt: `How many integers ${X} make this inequality true?${big(shown)}`, type: 'number', answer: count, params: { kind: 'count', m, k, e, b, rel },
          hints: steps.concat([`${solve}: ${andF(lo, hi, rel)}.`, `Count the integers from ${N(strict ? lo + 1 : lo)} to ${N(strict ? hi - 1 : hi)}${strict ? ` (the endpoints ${N(lo)} and ${N(hi)} are left out)` : ''}: there are <b>${count}</b>.`]) };
      }
      const answer = less ? andF(lo, hi, rel) : orF(lo, hi, rel);
      const cands = less ? [andF(lo, hi, tog(rel)), orF(lo, hi, rel === LT ? GT : '≥'), andF(-hi, -lo, rel), andF(m * lo, m * hi, rel)]
        : [andF(lo, hi, rel === GT ? LT : '≤'), orF(lo, hi, tog(rel)), orF(-hi, -lo, rel), orF(m * lo, m * hi, rel)];
      const choices = [answer].concat(distinct(answer, cands, 3));
      return { prompt: `Solve the inequality.${big(shown)}`, type: 'choice', choices, answer, params: { kind: 'solve', m, k, e, b, rel },
        hints: steps.concat([`${solve}: ${answer}.`, `<b>${answer}</b>.`]) };
    },
    verify(q) {
      const p = q.params, cmp = (u, r, v) => r === '<' ? u < v : r === '>' ? u > v : r === '≤' ? u <= v : u >= v, rel = plain(p.rel);
      const truth = t => cmp(Math.abs(p.m * t + p.k) + p.e, rel, p.b + p.e);
      if (p.kind === 'count') { let n = 0; for (let t = -100; t <= 100; t++) if (truth(t)) n++; return n === q.answer; }    // brute force over the integers
      const s = plain(q.answer); let mm, inSet;
      if ((mm = s.match(/^(-?\d+) ([<≤]) x ([<≤]) (-?\d+)$/))) inSet = t => cmp(Number(mm[1]), mm[2], t) && cmp(t, mm[3], Number(mm[4]));
      else if ((mm = s.match(/^x ([<≤]) (-?\d+) or x ([>≥]) (-?\d+)$/))) inSet = t => cmp(t, mm[1], Number(mm[2])) || cmp(t, mm[3], Number(mm[4]));
      else return 'could not parse ' + s;
      for (let t = -40; t <= 40; t += 0.25) if (inSet(t) !== truth(t)) return false;
      return true;
    },
  });

  /* pairs of times (a, b) whose combined time is a whole number or a tenth: ab/(a + b) for working together, ab/(b − a) for a fill pipe against a drain */
  const TOGETHER = [], AGAINST = [];
  for (let a = 2; a <= 20; a++) for (let b = a; b <= 24; b++) {
    const t = a * b / (a + b); if (Math.abs(t * 10 - Math.round(t * 10)) < 1e-9 && t >= 1.5 && b > a) TOGETHER.push([a, b]);
    if (b > a) { const s = a * b / (b - a); if (Number.isInteger(s) && s <= 30) AGAINST.push([a, b]); }
  }
  const JOBS = [
    { who: true, text: (n1, n2, a, b) => `${n1} can paint a fence in ${a} hours. ${n2} can paint the same fence in ${b} hours.`, ask: 'How many hours will it take them to paint the fence working together?' },
    { who: true, text: (n1, n2, a, b) => `${n1} can mow the school field in ${a} hours, and ${n2} can mow it in ${b} hours.`, ask: 'If they mow it together, how many hours will it take?' },
    { who: true, text: (n1, n2, a, b) => `Stuffing the envelopes for a fundraiser takes ${n1} ${a} hours alone and ${n2} ${b} hours alone.`, ask: 'How many hours will the job take if they work together?' },
    { who: false, wa: 'the old printer', wb: 'the new printer', text: (n1, n2, a, b) => `An old printer prints the school's yearbook order in ${a} hours. A new printer prints the same order in ${b} hours.`, ask: 'How many hours will the order take with both printers running?' },
    { who: false, wa: 'the first hose', wb: 'the second hose', text: (n1, n2, a, b) => `One hose fills ${n1}'s pool in ${a} hours. A second hose fills it in ${b} hours.`, ask: 'How many hours will it take to fill the pool with both hoses on?' },
  ];
  A.skill({
    id: 'int1.work-rate', title: 'Work-rate problems',
    learn: p(`In a work problem, think about how much of the job gets done <b>each hour</b>. If a job takes ${V('a')} hours, the worker does ${F(1, 'a')} of it per hour. <b>When people work together, their rates add</b>: if they finish together in ${V('t')} hours, then <b>${sfrac('1', V('a'))} + ${sfrac('1', V('b'))} = ${sfrac('1', V('t'))}</b>.`) +
      p(`To solve it, add the fractions on the left and flip the result. If one rate works against the other, like a drain emptying a tank while a pipe fills it, subtract that rate instead. A quick check: working together must take less time than the faster worker alone.`) +
      example('Example', `Ana paints a fence in 6 hours and Ben in 3 hours. ${sfrac('1', '6')} + ${sfrac('1', '3')} = ${sfrac('1', '6')} + ${sfrac('2', '6')} = ${sfrac('3', '6')} = ${F(1, 2)} of the fence per hour, so together they take <b>2 hours</b>.`),
    make(rng) {
      const kind = rng.pick(['together', 'together', 'alone', 'pipes']), [n1, n2] = rng.sample(NAMES, 2);
      if (kind === 'pipes') {
        const [a, b] = rng.pick(AGAINST), t = a * b / (b - a);
        return { prompt: `An inlet pipe fills a tank in ${a} hours. A drain empties the full tank in ${b} hours. The tank starts empty and someone leaves the drain open while the pipe runs. How many hours does it take to fill the tank?`, type: 'number', answer: t, unit: 'hours', params: { kind, a, b },
          hints: [`Rates: the pipe fills ${F(1, a)} of the tank per hour; the drain empties ${F(1, b)} per hour. The drain works against the pipe, so subtract.`,
            `${F(1, a)} − ${F(1, b)} = ${F(b, a * b, { raw: true })} − ${F(a, a * b, { raw: true })} = ${F(b - a, a * b)} of the tank per hour.`,
            `Flip the rate to get the time: ${F(a * b, b - a, { raw: true })} = <b>${N(t)}</b> hours.`] };
      }
      let pair = rng.pick(TOGETHER); if (rng.bool()) pair = [pair[1], pair[0]];
      const [a, b] = pair, t = M.round(a * b / (a + b), 6), job = rng.pick(JOBS);
      const A1 = job.who ? n1 : job.wa, B1 = job.who ? n2 : job.wb;
      if (kind === 'alone' && Number.isInteger(t) && job.who) {
        return { prompt: `${n1} can do a job alone in ${a} hours. Working together, ${n1} and ${n2} do it in ${N(t)} hours. How many hours would ${n2} take to do the job alone?`, type: 'number', answer: b, unit: 'hours', params: { kind, a, t },
          hints: [`Rates add: ${F(1, a)} + ${sfrac('1', V('b'))} = ${F(1, t)}, where ${V('b')} is ${n2}'s time alone.`,
            `${sfrac('1', V('b'))} = ${F(1, t)} − ${F(1, a)} = ${F(a, a * t, { raw: true })} − ${F(t, a * t, { raw: true })} = ${F(a - t, a * t)}.`,
            `Flip it: ${V('b')} = <b>${N(b)}</b> hours. Check: ${n2} alone is slower than the two together.`] };
      }
      return { prompt: `${job.text(n1, n2, a, b)} ${job.ask}`, type: 'number', answer: t, unit: 'hours', params: { kind: 'together', a, b },
        hints: [`Think in rates: ${A1} does ${F(1, a)} of the job each hour and ${B1} does ${F(1, b)}.`,
          `Together: ${F(1, a)} + ${F(1, b)} = ${F(b, a * b, { raw: true })} + ${F(a, a * b, { raw: true })} = ${F(a + b, a * b)} of the job per hour.`,
          `Flip the combined rate to get the time: ${F(a * b, a + b, { raw: true })} = <b>${N(t)}</b> hours.`] };
    },
    verify(q) {
      const p = q.params, T = q.answer;
      if (p.kind === 'pipes') return Math.abs(T / p.a - T / p.b - 1) < 1e-9;                 // after T hours, exactly one full tank
      if (p.kind === 'alone') return Math.abs(p.t / p.a + p.t / T - 1) < 1e-9;
      return Math.abs(T / p.a + T / p.b - 1) < 1e-9;
    },
  });

  /* ---------- Unit 11: Combining and comparing functions ---------- */
  const pad = (c, n) => Array(Math.max(0, n - c.length)).fill(0).concat(c);
  const pAdd = (f, g, s) => { const n = Math.max(f.length, g.length), F1 = pad(f, n), G1 = pad(g, n); const out = F1.map((v, i) => v + (s == null ? 1 : s) * G1[i]); while (out.length > 1 && out[0] === 0) out.shift(); return out; };
  const pMul = (f, g) => { const out = Array(f.length + g.length - 1).fill(0); f.forEach((a, i) => g.forEach((b, j) => { out[i + j] += a * b; })); return out; };
  const pEval = (c, x) => c.reduce((acc, v) => acc * x + v, 0);                  // Horner's rule
  const pTerms = c => c.map((v, i) => [v, c.length - 1 - i]);                       // [coefficient, power] pairs
  /** terms written one after another without collecting them: 2x² + 8x − 3x − 12 */
  const spell = ts => ts.filter(([c]) => c !== 0).map(([c, pw], i) => `${i ? (c < 0 ? ' − ' : ' + ') : c < 0 ? '−' : ''}${M.term(Math.abs(c), pw ? 'x' : '', pw)}`).join('');
  const OPS = { '+': { word: 'sum', f: (u, v) => u + v }, '−': { word: 'difference', f: (u, v) => u - v }, '·': { word: 'product', f: (u, v) => u * v } };
  const combo = (op, arg, n1, n2) => `(${V(n1 || 'f')} ${op} ${V(n2 || 'g')})(${arg})`;
  /* stories for combining two functions; each answer names exactly what the combination counts */
  const FN_STORIES = [
    { op: '−', f: 'R', g: 'C', v: 'n', set: nm => [`${V('R')}(${V('n')}) is the money ${nm} takes in from selling ${V('n')} cupcakes at a bake sale`, `${V('C')}(${V('n')}) is the cost of making ${V('n')} cupcakes`],
      right: () => `The profit from making and selling ${V('n')} cupcakes`, wrong: () => [`The total of the sales and the costs for ${V('n')} cupcakes`, `The cost of making just one of the cupcakes`, `The number of cupcakes needed to break even`] },
    { op: '+', f: 'B', g: 'G', v: 't', set: () => [`${V('B')}(${V('t')}) is the number of boys at a school ${V('t')} years after it opened`, `${V('G')}(${V('t')}) is the number of girls`],
      right: () => `The total number of students ${V('t')} years after the school opened`, wrong: () => [`How many more boys than girls there were after ${V('t')} years`, `The number of boys for each girl after ${V('t')} years`, `How much the number of students grew in year ${V('t')}`] },
    { op: '·', f: 'N', g: 'P', v: 'd', set: () => [`${V('N')}(${V('d')}) is the number of tickets a theater sells on day ${V('d')} of a show's run`, `${V('P')}(${V('d')}) is the price in dollars of one ticket on day ${V('d')}`],
      right: () => `The money the theater takes in from tickets on day ${V('d')}`, wrong: () => [`The number of tickets sold plus the price on day ${V('d')}`, `The price of a ticket for every day up to day ${V('d')}`, `The number of tickets sold for each dollar on day ${V('d')}`] },
    { op: '−', f: 'H', g: 'K', v: 't', set: () => [`${V('H')}(${V('t')}) is the height in meters of a balloon ${V('t')} seconds after it is let go`, `${V('K')}(${V('t')}) is the height in meters of a kite at the same time`],
      right: () => `How far above the kite the balloon is after ${V('t')} seconds`, wrong: () => [`The combined height of the balloon and the kite after ${V('t')} seconds`, `How fast the balloon is rising after ${V('t')} seconds`, `The time when the balloon and the kite are level`] },
    { op: '+', f: 'W', g: 'T', v: 'h', set: nm => [`${V('W')}(${V('h')}) is ${nm}'s pay in dollars for working ${V('h')} hours at a café`, `${V('T')}(${V('h')}) is the tips ${nm} gets in those ${V('h')} hours`],
      right: nm => `${nm}'s total earnings, pay plus tips, for ${V('h')} hours`, wrong: nm => [`How much more ${nm} is paid than tipped for ${V('h')} hours`, `${nm}'s pay for each dollar of tips in ${V('h')} hours`, `The number of hours ${nm} works to earn the tips`] },
  ];

  A.skill({
    id: 'int1.combine-functions', title: 'Adding, subtracting, and multiplying functions',
    learn: p(`Two functions can be combined into a new one. <b>(${V('f')} + ${V('g')})(${X}) = ${fn('f', X)} + ${fn('g', X)}</b>, (${V('f')} − ${V('g')})(${X}) = ${fn('f', X)} − ${fn('g', X)}, and (${V('f')} · ${V('g')})(${X}) = ${fn('f', X)} · ${fn('g', X)}. To evaluate one at a number, evaluate each function there and then combine the two outputs.`) +
      p(`To find the rule, combine the expressions. <b>When subtracting, put ${fn('g', X)} in parentheses so the minus sign reaches every term</b>, then collect like terms (an ${X}² term cannot join an ${X} term). When multiplying, distribute every term of one by every term of the other.`) +
      p(`In a story, the combination means something: if ${V('R')}(${V('n')}) is the money taken in and ${V('C')}(${V('n')}) the cost, then (${V('R')} − ${V('C')})(${V('n')}) is the profit.`) +
      example('Example', `${big(`${fn('f', X)} = 2${X} − 3, ${fn('g', X)} = ${X}² + ${X} − 4`)}(${V('f')} − ${V('g')})(${X}) = 2${X} − 3 − (${X}² + ${X} − 4) = 2${X} − 3 − ${X}² − ${X} + 4 = <b>−${X}² + ${X} + 1</b>.`),
    make(rng) {
      const kind = rng.pick(['eval', 'eval', 'expr', 'expr', 'table', 'story']);
      if (kind === 'story') {
        const si = rng.int(0, FN_STORIES.length - 1), st = FN_STORIES[si], name = rng.pick(NAMES), [s1, s2] = st.set(name), answer = st.right(name);
        return { prompt: `${s1}, and ${s2}. What does ${combo(st.op, V(st.v), st.f, st.g)} represent?`, type: 'choice', choices: [answer].concat(st.wrong(name)), answer, params: { kind, si, name },
          hints: [`${combo(st.op, V(st.v), st.f, st.g)} means ${fn(st.f, V(st.v))} ${st.op} ${fn(st.g, V(st.v))}: the ${OPS[st.op].word} of the two quantities.`, `<b>${answer}</b>.`] };
      }
      const op = rng.pick(['+', '−', '·']), f = [rng.nz(-4, 5), rng.nz(-7, 7)];
      const g = op === '·' || rng.bool() ? [rng.nz(-4, 4), rng.nz(-7, 7)] : [rng.pick([1, 1, -1, 2]), rng.int(-5, 5), rng.nz(-7, 7)];
      const rules = big(`${fn('f', X)} = ${M.poly(f)}, &nbsp; ${fn('g', X)} = ${M.poly(g)}`);
      if (kind === 'expr') {
        const ans = op === '+' ? pAdd(f, g) : op === '−' ? pAdd(f, g, -1) : pMul(f, g);
        let cands, how;
        if (op === '·') {
          cands = [[f[0] * g[0], 0, f[1] * g[1]], [f[0] * g[0], f[0] * g[1] + f[1] * g[0], f[1] + g[1]], [f[0] * g[0], f[0] * g[1] - f[1] * g[0], f[1] * g[1]], pAdd(f, g)];
          how = `Distribute each term of ${fn('f', X)} over ${fn('g', X)}: (${M.poly(f)})(${M.poly(g)}) = ${spell(pTerms(pMul([f[0], 0], g)).concat(pTerms(pMul([f[1]], g))))}.`;
        } else if (op === '+') {
          cands = [g.length === 3 ? [f[0] + g[0], g[1], f[1] + g[2]] : [f[0] + g[0], f[1] - g[1]], pAdd(f, g, -1), pAdd(pad(f, g.length), g.map((v, i) => i === g.length - 1 ? -v : v)), pAdd(g, f, -1)];
          how = `Write the two rules side by side: ${spell(pTerms(f).concat(pTerms(g)))}.`;
        } else {
          cands = [pAdd(f, g.map((v, i) => i === 0 ? v : -v), -1), pAdd(g, f, -1), pAdd(f, g), g.length === 3 ? [g[0], f[0] - g[1], f[1] - g[2]] : [f[0] + g[0], f[1] - g[1]]];
          how = `Put ${fn('g', X)} in parentheses and give the minus sign to every term: ${M.poly(f)} − (${M.poly(g)}) = ${spell(pTerms(f).concat(pTerms(g).map(([c, pw]) => [-c, pw])))}.`;
        }
        const answer = M.poly(ans), choices = [answer].concat(distinct(answer, cands.map(c => M.poly(c)).concat([M.poly(ans.map((v, i) => i === ans.length - 1 ? v + 2 : v))]), 3));
        return { prompt: `${rules}Which expression is equal to ${combo(op, X)}?`, type: 'choice', choices, answer, params: { kind, op, f, g, ans },
          hints: [`${combo(op, X)} = ${fn('f', X)} ${op} ${fn('g', X)}.`, how, `Collect like terms (only matching powers of ${X} combine): <b>${answer}</b>.`] };
      }
      const swap = op === '−' && rng.chance(0.3), [n1, n2] = swap ? ['g', 'f'] : ['f', 'g'], c = rng.int(-4, 4);
      const first = swap ? g : f, second = swap ? f : g;
      if (kind === 'table') {
        const xs = range(-2, 3), tbl = M.table([X, fn('f', X), fn('g', X)], xs.map(x => [N(x), N(pEval(f, x)), N(pEval(g, x))])), k = rng.pick(xs);
        const t1 = pEval(first, k), t2 = pEval(second, k), tans = OPS[op].f(t1, t2);
        return { prompt: `The table shows some values of two functions ${V('f')} and ${V('g')}.${tbl}What is ${combo(op, N(k), n1, n2)}?`, type: 'number', answer: tans, params: { kind, op, k, swap, tab: xs.map(x => [x, pEval(f, x), pEval(g, x)]) },
          hints: [`${combo(op, N(k), n1, n2)} = ${fn(n1, N(k))} ${op} ${fn(n2, N(k))}. Read both values from the row where ${X} = ${N(k)}.`, `${fn(n1, N(k))} = ${N(t1)} and ${fn(n2, N(k))} = ${N(t2)}.`, `${N(t1)} ${op} ${wrap(t2)} = <b>${N(tans)}</b>.`] };
      }
      const v1 = pEval(first, c), v2 = pEval(second, c), ans = OPS[op].f(v1, v2), atC = P => spell(pTerms(P).map(([cf, pw]) => [cf * c ** pw, 0])) || '0';   // each term's value at x = c
      return { prompt: `${rules}Find ${combo(op, N(c), n1, n2)}.`, type: 'number', answer: ans, params: { kind, op, f, g, c, swap },
        hints: [`${combo(op, N(c), n1, n2)} means ${fn(n1, N(c))} ${op} ${fn(n2, N(c))}: evaluate each function at ${N(c)}, then combine.`,
          `${fn(n1, N(c))} = ${atC(first)} = ${N(v1)} and ${fn(n2, N(c))} = ${atC(second)} = ${N(v2)}.`, `${N(v1)} ${op} ${wrap(v2)} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'story') { const st = FN_STORIES[p.si]; return q.answer === st.right(p.name) && !st.wrong(p.name).includes(q.answer); }
      if (p.kind === 'table') { const row = p.tab.find(r => r[0] === p.k), a = p.swap ? row[2] : row[1], b = p.swap ? row[1] : row[2]; return q.answer === OPS[p.op].f(a, b); }
      if (p.kind === 'expr') return q.answer === M.poly(p.ans) && [-2, -1, 0, 1, 2, 3].every(x => pEval(p.ans, x) === OPS[p.op].f(pEval(p.f, x), pEval(p.g, x)));   // the expression agrees with f op g point by point
      const [u, v] = p.swap ? [p.g, p.f] : [p.f, p.g], whole = p.op === '+' ? pAdd(u, v) : p.op === '−' ? pAdd(u, v, -1) : pMul(u, v);
      return pEval(whole, p.c) === q.answer;                           // build the combined rule first, then evaluate it
    },
  });

  const bisect = (h, lo, hi) => { for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (Math.sign(h(mid)) === Math.sign(h(lo))) lo = mid; else hi = mid; } return (lo + hi) / 2; };
  /** rebuild the two models from their numbers: f = a·b^x; g = c·d^x, or g = m·x + c when d is null */
  const sysFns = pr => [x => pr.a * pr.b ** x, pr.d == null ? x => pr.m * x + pr.c : x => pr.c * pr.d ** x];
  /** two models with f below g at x = 0 and exactly one crossing, between 1 and 9, well away from a rounding boundary */
  function expSystem(rng) {
    const kind = rng.pick(['money', 'pop', 'lin', 'lin']), [n1, n2] = rng.sample(NAMES, 2);
    for (;;) {
      let s;
      if (kind === 'money') {
        const a = rng.int(4, 18) * 50, c = a + rng.int(2, 12) * 50, p1 = rng.int(5, 10), p2 = rng.int(1, 4);
        s = { pr: { a, b: 1 + p1 / 100, c, d: 1 + p2 / 100 }, unit: 'years', money: true, fl: `${n1}'s balance`, gl: `${n2}'s balance`,
          text: `${n1} puts ${M.money(a)} in an account that earns ${p1}% interest a year. ${n2} puts ${M.money(c)} in an account that earns ${p2}% a year.`, ask: `After how many years will the two balances be equal?` };
      } else if (kind === 'pop') {
        const a = rng.int(16, 40) * 500, c = a + rng.int(4, 20) * 500, p1 = rng.int(2, 6), p2 = rng.int(1, 4);
        s = { pr: { a, b: 1 + p1 / 100, c, d: 1 - p2 / 100 }, unit: 'years', dp: 0, fl: 'Town A', gl: 'Town B',
          text: `Town A has ${N(a)} people, and its population grows by ${p1}% a year. Town B has ${N(c)} people, and its population shrinks by ${p2}% a year.`, ask: `After how many years will the two towns have the same population?` };
      } else {
        const a = rng.pick([10, 20, 25, 40, 50, 60, 80]), b = rng.pick([1.1, 1.15, 1.2, 1.25, 1.3, 1.5]), m = rng.int(1, 6) * 5, c = a + rng.int(1, 10) * 10;
        s = { pr: { a, b, c, d: null, m }, unit: '', dp: 1, fl: fn('f', X), gl: fn('g', X), fn: `${N(a)}(${N(b)})${M.sup('', X)}`, gn: M.poly([m, c]) };
      }
      const [f, g] = sysFns(s.pr), h = x => f(x) - g(x);
      let k = 0; while (k < 12 && h(k + 1) < 0) k++;
      if (k >= 8 || h(k + 1) < 0 || h(0) >= 0) continue;
      const root = bisect(h, k, k + 1), frac = root * 10 - Math.floor(root * 10);
      if (root - k < 0.15 || k + 1 - root < 0.15 || Math.abs(frac - 0.5) < 0.15 || root < 1) continue;
      return Object.assign(s, { kind, k, f, g, h, show: v => s.money ? M.money(M.round(v, 2)) : N(M.round(v, s.dp)) });
    }
  }

  A.skill({
    id: 'int1.exponential-systems', title: 'Solving exponential systems with tables',
    learn: p(`To solve ${fn('f', X)} = ${fn('g', X)} when one side is exponential, you usually cannot just rearrange. Instead, <b>look for where the two outputs swap order</b>: the graphs cross where ${fn('f', X)} − ${fn('g', X)} changes sign.`) +
      p(`Make a table of both functions at ${X} = 0, 1, 2, … and find the two whole numbers where the smaller one overtakes the bigger. Then <b>zoom in</b>: make a new table in steps of 0.1 between those two numbers. The answer to the nearest tenth is the tenth where the two outputs are closest, that is, where ${fn('f', X)} − ${fn('g', X)} is nearest to 0.`) +
      example('Example', `${big(`${fn('f', X)} = 20(1.5)${M.sup('', X)}, ${fn('g', X)} = 10${X} + 40`)}At ${X} = 3: 67.5 vs 70. At ${X} = 4: 101.25 vs 80, so the crossing is between 3 and 4. Zoom in: at 3.1, about 70.3 vs 71, a difference of −0.7; at 3.2, about 73.2 vs 72, a difference of 1.2. The difference is nearest 0 at <b>${X} ≈ 3.1</b>.`),
    make(rng) {
      const s = expSystem(rng), k = s.k, story = s.kind !== 'lin';
      const setup = story ? s.text : big(`${fn('f', X)} = ${s.fn}, &nbsp; ${fn('g', X)} = ${s.gn}`);
      const row = x => story ? `at ${X} = ${N(x)}, ${s.fl} ≈ ${s.show(s.f(x))} and ${s.gl} ≈ ${s.show(s.g(x))}` : `${fn('f', N(x))} ≈ ${s.show(s.f(x))} and ${fn('g', N(x))} ≈ ${s.show(s.g(x))}`;
      if (rng.chance(0.35)) {
        const xs = range(0, 8), tbl = M.table([X, s.fl, s.gl], xs.map(x => [N(x), s.show(s.f(x)), s.show(s.g(x))]));
        const start = Math.max(0, Math.min(4, k - rng.int(0, 3))), opts = range(start, start + 3).map(j => `Between ${j} and ${j + 1}`), answer = `Between ${k} and ${k + 1}`;
        return { prompt: `${setup}${story ? ` Here ${X} is the number of years from now.` : ''}${tbl}Between which two consecutive whole numbers is the solution of ${story ? `${s.fl} = ${s.gl}` : `${fn('f', X)} = ${fn('g', X)}`}?`,
          type: 'choice', choices: opts, keepOrder: true, answer, params: { kind: 'bracket', pr: s.pr },
          hints: [`At ${X} = 0, ${s.fl} is the smaller one. Look down the table for the row where it becomes the larger one.`, `${cap(row(k))}, so ${s.fl} is still smaller. ${cap(row(k + 1))}, so ${s.fl} is now larger.`, `The outputs swap order between ${k} and ${k + 1}, so the solution is <b>${answer.toLowerCase()}</b>.`] };
      }
      let t = k, best = k;
      for (let i = 1; i <= 10; i++) { const x = M.round(k + i / 10, 1); if (s.h(x) >= 0) { t = M.round(x - 0.1, 1); best = Math.abs(s.h(t)) <= Math.abs(s.h(x)) ? t : x; break; } }    // walk the tenths, as a table would
      const gap = x => s.show(s.f(x) - s.g(x)), t2 = M.round(t + 0.1, 1);
      return { prompt: story ? `${setup} ${s.ask} Use a table, and round to the nearest tenth of a year.` : `${setup}Use a table to solve ${fn('f', X)} = ${fn('g', X)} for ${X} &gt; 0. Round to the nearest tenth.`,
        type: 'number', answer: best, unit: s.unit || undefined, params: { kind: 'tenth', pr: s.pr },
        hints: [`Step through whole numbers: ${row(k)}; ${row(k + 1)}. ${cap(s.fl)} passes ${s.gl} between ${k} and ${k + 1}.`,
          `Zoom in by tenths. At ${X} = ${N(t)} the difference ${s.fl} − ${s.gl} is about ${gap(t)}; at ${X} = ${N(t2)} it is about ${gap(t2)}. The sign changes between them.`,
          `The difference is closer to 0 at ${X} = ${N(best)}, so the solution is about <b>${N(best)}</b>${s.unit ? ' ' + s.unit : ''}.`] };
    },
    verify(q) {
      const [f, g] = sysFns(q.params.pr), h = x => f(x) - g(x);
      let hi = 1; while (h(hi) < 0 && hi < 64) hi *= 2;
      const root = bisect(h, 0, hi);                                                // bisection on the rebuilt models, not a table walk
      if (q.params.kind === 'bracket') return q.answer === `Between ${Math.floor(root)} and ${Math.floor(root) + 1}`;
      return Math.abs(q.answer - Math.round(root * 10) / 10) < 1e-9;
    },
  });

  /* ---------- Unit 12: Symmetry, constructions, and coordinate geometry ---------- */
  const polar = (r, deg) => [r * Math.cos(deg * Math.PI / 180), r * Math.sin(deg * Math.PI / 180)];
  const regular = n => range(0, n - 1).map(k => polar(1, 90 + 360 * k / n));
  const star = (n, inner) => range(0, 2 * n - 1).map(k => polar(k % 2 ? inner : 1, 90 + 180 * k / n));
  const pinwheel = n => range(0, n - 1).flatMap(k => [polar(0.2, 90 + 360 * k / n), polar(1, 90 + 360 * k / n), polar(0.62, 90 + 360 * (k + 0.4) / n)]);   // blades with one straight edge: turns fit, mirrors do not
  /* shapes with their symmetry: lines of reflection, and the smallest turn that fits (0 = none) */
  const SHAPES = [
    { name: 'equilateral triangle', pts: regular(3), lines: 3, turn: 120 }, { name: 'square', pts: regular(4), lines: 4, turn: 90 },
    { name: 'regular pentagon', pts: regular(5), lines: 5, turn: 72 }, { name: 'regular hexagon', pts: regular(6), lines: 6, turn: 60 },
    { name: 'regular octagon', pts: regular(8), lines: 8, turn: 45 }, { name: 'rectangle', pts: [[-1.4, -0.85], [1.4, -0.85], [1.4, 0.85], [-1.4, 0.85]], lines: 2, turn: 180 },
    { name: 'rhombus', pts: [[0, 1.3], [0.85, 0], [0, -1.3], [-0.85, 0]], lines: 2, turn: 180 }, { name: 'parallelogram', pts: [[-1.5, -0.8], [0.7, -0.8], [1.5, 0.8], [-0.7, 0.8]], lines: 0, turn: 180 },
    { name: 'isosceles trapezoid', pts: [[-1.5, -0.8], [1.5, -0.8], [0.8, 0.8], [-0.8, 0.8]], lines: 1, turn: 0 }, { name: 'kite', pts: [[0, 1.1], [0.85, 0.35], [0, -1.4], [-0.85, 0.35]], lines: 1, turn: 0 },
    { name: 'isosceles triangle', pts: [[0, 1.3], [0.9, -1], [-0.9, -1]], lines: 1, turn: 0 }, { name: 'scalene triangle', pts: [[-1.3, -0.9], [1.3, -0.9], [0.45, 1.1]], lines: 0, turn: 0 },
    { name: 'five-pointed star', pts: star(5, 0.42), lines: 5, turn: 72 }, { name: 'six-pointed star', pts: star(6, 0.55), lines: 6, turn: 60 },
    { name: 'four-pointed star', pts: star(4, 0.38), lines: 4, turn: 90 }, { name: 'three-bladed pinwheel', pts: pinwheel(3), lines: 0, turn: 120 },
    { name: 'four-bladed pinwheel', pts: pinwheel(4), lines: 0, turn: 90 },
  ];
  const shapePic = pts => svg(200, 200, `<polygon class="fill" points="${pts.map(([x, y]) => `${r2(100 + 62 * x)},${r2(100 - 62 * y)}`).join(' ')}"/>`, 'shape');
  /** the symmetry of a polygon, found by trying every reflection axis through the centre and every turn */
  function measureSymmetry(pts) {
    const n = pts.length, cx = mean(pts.map(p => p[0])), cy = mean(pts.map(p => p[1])), P = pts.map(([x, y]) => [x - cx, y - cy]);
    const same = Q => Q.every(([x, y]) => P.some(([u, v]) => Math.abs(u - x) < 1e-6 && Math.abs(v - y) < 1e-6));
    const axes = [];
    P.forEach(([x, y], i) => { const [u, v] = P[(i + 1) % n]; [[x, y], [(x + u) / 2, (y + v) / 2]].forEach(([a, b]) => { const t = Math.atan2(b, a); if (Math.hypot(a, b) > 1e-9) axes.push(((t % Math.PI) + Math.PI) % Math.PI); }); });
    const keys = axes.map(t => M.round(t, 5) % M.round(Math.PI, 5)), uniqAxes = axes.filter((t, i) => keys.indexOf(keys[i]) === i);   // 0 and π are the same line
    const good = uniqAxes.filter(t => same(P.map(([x, y]) => [x * Math.cos(2 * t) + y * Math.sin(2 * t), x * Math.sin(2 * t) - y * Math.cos(2 * t)])));
    let turn = 0;
    for (let m = n; m >= 2; m--) { const a = 2 * Math.PI / m; if (same(P.map(([x, y]) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]))) { turn = 360 / m; break; } }
    return { lines: good.length, turn };
  }

  A.skill({
    id: 'int1.symmetry', title: 'Reflection and rotation symmetry',
    learn: p(`A shape has <b>reflection symmetry</b> when a line can split it into two mirror-image halves: fold along that <b>line of symmetry</b> and the halves match exactly. A rectangle has 2 lines of symmetry (through the middles of opposite sides), not 4: folding along a diagonal does not match the halves.`) +
      p(`A shape has <b>rotation symmetry</b> when a turn of less than 360° about its center carries it onto itself. <b>The smallest such turn is 360° divided by the number of matching positions.</b> A regular polygon with ${V('n')} sides has ${V('n')} lines of symmetry and a smallest turn of 360° ÷ ${V('n')}. A parallelogram has no lines of symmetry but fits onto itself after 180°.`) +
      example('Example', `A regular hexagon: 6 lines of symmetry (3 through opposite corners, 3 through the middles of opposite sides). It matches itself 6 times in a full turn, so the smallest turn is 360° ÷ 6 = <b>60°</b>.`),
    make(rng) {
      const kind = rng.pick(['lines', 'lines', 'turn', 'turn', 'which']);
      if (kind === 'which') {
        const pool = SHAPES.filter(s => !s.name.includes('pinwheel') && !s.name.includes('star')), want = rng.pick(pool);
        const key = s => `${s.lines}/${s.turn}`, others = rng.shuffle(pool.filter(s => key(s) !== key(want))).filter((s, i, a) => a.findIndex(t => key(t) === key(s)) === i).slice(0, 3);
        const desc = `${want.lines === 0 ? 'no lines of symmetry' : `exactly ${M.plural(want.lines, 'line')} of symmetry`} and ${want.turn ? `a smallest rotation of ${want.turn}°` : 'no rotation symmetry'}`;
        const choices = [want.name].concat(others.map(s => s.name)).map(cap), answer = cap(want.name);
        return { prompt: `Which shape has ${desc}?`, type: 'choice', choices, answer, params: { kind, names: choices.map(c => c.toLowerCase()), want: { lines: want.lines, turn: want.turn } },
          hints: [`For each shape, count the fold lines that give matching halves, and ask whether a turn of less than 360° fits it back onto itself.`,
            cap(others.map(s => `${/^[aeiou]/.test(s.name) ? 'an' : 'a'} ${s.name} has ${M.plural(s.lines, 'line')}${s.turn ? ` and a ${s.turn}° turn` : ' and no turn'}`).join('; ')) + '.', `<b>${answer}</b>.`] };
      }
      const s = rng.pick(kind === 'turn' ? SHAPES.filter(t => t.turn) : SHAPES), pic = shapePic(s.pts);
      if (kind === 'lines') return { prompt: `How many lines of symmetry does this ${s.name} have?${pic}`, type: 'number', answer: s.lines, params: { kind, pts: s.pts },
        hints: [`A line of symmetry folds the shape onto itself. Try lines through the corners and through the middles of the sides.`,
          s.lines ? `The ${s.name} has ${M.plural(s.lines, 'fold line')} that ${s.lines === 1 ? 'makes' : 'make'} the halves match${s.name === 'rectangle' || s.name === 'rhombus' ? '; a ' + (s.name === 'rectangle' ? 'diagonal' : 'line through the middles of the sides') + ' does not' : ''}.` : `No fold line works: the halves never match${s.turn ? ', even though a turn does fit it back onto itself' : ''}.`,
          `<b>${s.lines}</b>.`] };
      const fits = 360 / s.turn;
      return { prompt: `What is the smallest angle of rotation, greater than 0°, that carries this ${s.name} onto itself?${pic}`, type: 'number', answer: s.turn, unit: '°', params: { kind, pts: s.pts },
        hints: [`Count how many positions in one full turn look exactly the same as the start.`, `The ${s.name} matches itself ${fits} times in a full turn of 360°.`, `360° ÷ ${fits} = <b>${s.turn}°</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'which') { const hits = p.names.filter(nm => { const s = SHAPES.find(t => t.name === nm), m = measureSymmetry(s.pts); return m.lines === p.want.lines && m.turn === p.want.turn; }); return hits.length === 1 && q.answer.toLowerCase() === hits[0]; }
      const m = measureSymmetry(p.pts);
      return q.answer === (p.kind === 'lines' ? m.lines : m.turn);
    },
  });

  /* compass-and-straightedge constructions: each step needs the one before it, each wrong step breaks a rule or the construction */
  const CONS = [
    { goal: 'A copy of segment AB', steps: ['Draw a ray with endpoint C.', 'Put the compass point on A and open it until the pencil touches B.', 'Keeping the same opening, put the compass point on C and draw an arc across the ray.', 'Label the point D where the arc crosses the ray.'],
      why: 'The compass opening never changed, so CD is exactly as long as AB', notWhy: ['A ruler was used to check that CD and AB match', 'Ray CD points in the same direction as segment AB', 'Point D is the midpoint of the ray that starts at C'],
      bad: ['Measure AB with a ruler and mark that length on the ray.', 'Open the compass a little wider than AB before drawing the arc.', 'Put the compass point on B and draw a circle through C.'] },
    { goal: 'An equilateral triangle with side AB', steps: ['Put the compass point on A and open it until the pencil touches B.', 'With the compass point on A, draw an arc above AB.', 'Keeping the same opening, put the compass point on B and draw an arc that crosses the first arc.', 'Label the crossing point C and draw segments AC and BC.'],
      why: 'AC and BC both equal the compass opening AB, so all three sides are equal', notWhy: ['Angle C was measured as 60° with a protractor', 'C is the midpoint of AB, so the two halves are equal', 'Any triangle drawn on AB with a compass is equilateral'],
      bad: ['Change the opening to half of AB before drawing the second arc.', 'Use a protractor to draw a 60° angle at A.', 'Draw a line through B perpendicular to AB.'] },
    { goal: 'The perpendicular bisector of segment AB', steps: ['Open the compass to more than half the length of AB.', 'With the compass point on A, draw an arc above AB and an arc below AB.', 'Keeping the same opening, put the compass point on B and draw arcs that cross the first two.', 'Draw a line through the two points where the arcs cross.'],
      why: 'Both crossing points are equally far from A and B, so the line through them is the perpendicular bisector', notWhy: ['The compass was opened to exactly half of AB', 'The arcs from A were drawn bigger than the arcs from B', 'The angle at the middle was measured as 90° with a protractor'],
      bad: ['Open the compass to less than half the length of AB.', 'Measure AB with a ruler and mark its middle.', 'Change the compass opening before drawing the arcs from B.'] },
    { goal: 'The bisector of angle ABC', steps: ['With the compass point on the vertex B, draw an arc that crosses both sides of the angle.', 'Label the crossing points D on ray BA and E on ray BC.', 'Using one opening, draw an arc from D and an arc from E that cross inside the angle.', 'Draw a ray from B through the point where those two arcs cross.'],
      why: 'The two triangles it forms are congruent by SSS, so the two smaller angles are equal', notWhy: ['The ray passes through the midpoint of segment AC', 'The first arc is a semicircle, so each angle in it is 90°', 'A protractor shows that the ray splits the angle in half'],
      bad: ['Measure the angle with a protractor and mark half of it.', 'Draw an arc from E with a different opening from the arc from D.', 'Draw a ray from D through E.'] },
    { goal: 'A copy of angle A at point P', steps: ['Draw a ray from point P.', 'With the compass point on A, draw an arc that crosses both sides of angle A at B and C.', 'Keeping the same opening, put the compass point on P and draw an arc that crosses the ray at Q.', 'Open the compass to the distance BC, put its point on Q, and draw an arc that crosses the last arc at R.', 'Draw a ray from P through R.'],
      why: 'Triangles ABC and PQR are congruent by SSS, so angle P equals angle A', notWhy: ['Both rays are drawn the same length, so the angles match', 'Angle P was checked with a protractor', 'Ray PR bisects the angle at P'],
      bad: ['Measure angle A with a protractor and copy its number of degrees.', 'Change the compass opening before drawing the arc from P.', 'Draw a ray from P through B.'] },
    { goal: 'A line through P parallel to line ℓ', steps: ['Draw a line through P that crosses line ℓ at a point Q.', 'Copy the angle that line PQ makes with ℓ at Q, placing the copy at P in the corresponding position.', 'Extend the new side of the copied angle into a full line through P.'],
      why: 'The corresponding angles at Q and P are congruent, so the two lines are parallel', notWhy: ['The new line is exactly as long as line ℓ', 'Line PQ is perpendicular to both of the lines', 'P is the same distance from Q as from line ℓ'],
      bad: ['Measure the distance from P to ℓ with a ruler and draw a line that looks level.', 'Construct the perpendicular bisector of segment PQ.', 'Bisect the angle at Q and draw that ray through P.'] },
    { goal: 'A line perpendicular to line ℓ at a point P on it', steps: ['With the compass point on P, draw arcs that cross line ℓ on both sides of P, at A and B.', 'Open the compass wider than PA and, with its point on A, draw an arc above the line.', 'Keeping the same opening, put the compass point on B and draw an arc that crosses the last arc at C.', 'Draw the line through P and C.'],
      why: 'P and C are each equally far from A and B, so line PC is the perpendicular bisector of AB', notWhy: ['Segments PA and PC are the same length', 'The arcs from A and B were drawn with different openings', 'Angle APC was measured as 90° with a protractor'],
      bad: ['Use a protractor to draw a 90° angle at P.', 'Change the compass opening before drawing the arc from B.', 'Draw the line through A and C.'] },
  ];
  const stepList = st => `<ol>${st.map(s => `<li>${s}</li>`).join('')}</ol>`;

  A.skill({
    id: 'int1.constructions', title: 'Compass and straightedge constructions',
    learn: p(`A <b>construction</b> uses only two tools: a <b>straightedge</b> for drawing lines (no measuring marks) and a <b>compass</b> for drawing circles and arcs. <b>You never measure with a ruler or protractor.</b> Instead, the compass copies a distance: whatever opening you set, every arc drawn with it has that same radius.`) +
      p(`That is why constructions work. Copying a segment keeps the opening, so the lengths match. The perpendicular bisector and angle bisector come from points that are equally far from two others, and copying an angle builds a triangle congruent by SSS. Copying an angle to make matching corresponding angles is how you construct a parallel line. Each step uses a point or arc made by the step before, so the order matters.`) +
      example('Example', `To bisect segment AB: open the compass to more than half of AB; draw arcs above and below AB from A; with the same opening draw arcs from B that cross them; draw the line through the two crossings. It works because <b>both crossing points are equally far from A and B</b>.`),
    make(rng) {
      const kind = rng.pick(['next', 'next', 'why', 'name']), ci = rng.int(0, CONS.length - 1), c = CONS[ci];
      if (kind === 'next') {
        const k = rng.int(1, c.steps.length - 1), answer = c.steps[k], later = c.steps.slice(k + 1, k + 2);
        const choices = [answer].concat(later, rng.shuffle(c.bad)).slice(0, 4);
        return { prompt: `These are the first steps of a construction of ${c.goal.replace(/^./, ch => ch.toLowerCase())}.${stepList(c.steps.slice(0, k))}What is the next step?`, type: 'choice', choices, answer, params: { kind, ci, k },
          hints: [`Each step uses something the step before it made. The last step so far was: “${c.steps[k - 1]}” What needs to happen to that next?`,
            `Measuring with a ruler or protractor, or changing the compass opening when it must stay the same, breaks the construction.${later.length ? ' A later step needs points that do not exist yet.' : ''}`, `<b>${answer}</b>`] };
      }
      if (kind === 'why') {
        const choices = [c.why].concat(c.notWhy);
        return { prompt: `Here is a construction of ${c.goal.replace(/^./, ch => ch.toLowerCase())}.${stepList(c.steps)}Why does it work?`, type: 'choice', choices, answer: c.why, params: { kind, ci },
          hints: [`Constructions never rely on measuring. Look for what the compass guarantees: equal radii, so equal lengths.`, `<b>${c.why}</b>.`] };
      }
      const others = rng.sample(CONS.filter((_, i) => i !== ci), 3).map(o => o.goal), choices = [c.goal].concat(others);
      return { prompt: `What do these steps construct?${stepList(c.steps)}`, type: 'choice', choices, answer: c.goal, params: { kind, ci },
        hints: [`Look at the last step: it shows what the construction is for. Then check that the earlier steps lead to it.`, `<b>${c.goal}</b>.`] };
    },
    verify(q) {
      const p = q.params, c = CONS[p.ci];
      if (p.kind === 'next') return q.answer === c.steps[p.k] && q.choices.filter(ch => c.steps.indexOf(ch) > p.k || c.bad.includes(ch)).length === q.choices.length - 1;   // every other option is a later step or a broken one
      if (p.kind === 'why') return q.answer === c.why && !/ruler|protractor/.test(q.answer);
      return q.answer === c.goal;
    },
  });

  /* vectors with the same squared length, for rhombuses */
  const SAME_LEN = [[[1, 2], [2, 1], [-1, 2], [-2, 1]], [[1, 3], [3, 1], [-1, 3], [-3, 1]], [[2, 3], [3, 2], [-2, 3], [-3, 2]], [[3, 4], [4, 3], [5, 0], [0, 5], [-3, 4], [-4, 3]]];
  const QUADS = ['Square', 'Rectangle', 'Rhombus', 'Parallelogram', 'Trapezoid', 'Kite'];
  const sub2 = (p, q) => [p[0] - q[0], p[1] - q[1]], add2 = (p, q) => [p[0] + q[0], p[1] + q[1]];
  /** four vertices, in order around the shape, of the named kind of quadrilateral */
  function makeQuad(rng, kind) {
    const v = () => [rng.int(-4, 4), rng.int(-4, 4)], cross = (a, b) => a[0] * b[1] - a[1] * b[0], dot = (a, b) => a[0] * b[0] + a[1] * b[1];
    let u, w, pts;
    if (kind === 'Square') { u = [rng.int(1, 4), rng.int(0, 3)]; w = [-u[1], u[0]]; }
    else if (kind === 'Rectangle') { u = [rng.int(1, 3), rng.int(0, 2)]; const g = M.gcd(u[0], u[1]), t = rng.pick([2, 3]); w = [-u[1] / g * t, u[0] / g * t]; if (dot(u, u) === dot(w, w)) w = [w[0] * 2, w[1] * 2]; }
    else if (kind === 'Rhombus') { const grp = rng.pick(SAME_LEN); do { [u, w] = rng.sample(grp, 2); } while (dot(u, w) === 0 || cross(u, w) === 0); }
    else if (kind === 'Parallelogram') { do { u = v(); w = v(); } while (cross(u, w) === 0 || dot(u, w) === 0 || dot(u, u) === dot(w, w)); }
    if (u) { if (cross(u, w) < 0) w = [-w[0], -w[1]]; pts = [[0, 0], u, add2(u, w), w]; }
    else if (kind === 'Trapezoid') {
      do { u = [rng.int(1, 3), rng.int(-1, 1)]; w = [rng.int(-2, 2), rng.int(2, 4)]; } while (cross(u, w) <= 0);
      pts = [[0, 0], [2 * u[0], 2 * u[1]], add2(w, u), w];                    // AB is twice as long as DC and parallel to it
    } else { const pp = rng.int(1, 4); let r; do { r = rng.int(1, 5); } while (r === pp); const q = rng.int(1, 3); pts = [[0, pp], [q, 0], [0, -r], [-q, 0]]; }
    for (let t = rng.int(0, 3); t > 0; t--) pts = pts.map(([x, y]) => [-y, x]);   // turn it by a multiple of 90°
    const s = rng.int(0, 3); pts = pts.slice(s).concat(pts.slice(0, s));             // start at any vertex
    if (rng.bool()) pts = [pts[0]].concat(pts.slice(1).reverse());                    // either direction around
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), dx = rng.int(-6, 6) - Math.round((Math.max(...xs) + Math.min(...xs)) / 2), dy = rng.int(-6, 6) - Math.round((Math.max(...ys) + Math.min(...ys)) / 2);
    return pts.map(([x, y]) => [x + dx, y + dy]);
  }
  const slopeTxt = (a, b) => { const [dx, dy] = sub2(b, a); return dx === 0 ? 'vertical (no slope)' : F(dy, dx); };
  const lenTxt = (a, b) => { const [dx, dy] = sub2(b, a), s2 = dx * dx + dy * dy, r = Math.round(Math.sqrt(s2)); return r * r === s2 ? N(r) : M.sqrt(s2); };

  A.skill({
    id: 'int1.classify-quadrilaterals', title: 'Classifying quadrilaterals on the coordinate plane',
    learn: p(`To name a quadrilateral from its vertices, test its sides with two tools. <b>Slopes</b> tell you about direction: equal slopes mean parallel sides, and slopes whose product is −1 (or one horizontal and one vertical) mean perpendicular sides. The <b>distance formula</b> √((${X}₂ − ${X}₁)² + (${Y}₂ − ${Y}₁)²) tells you about length.`) +
      p(`Then sort it. <b>Two pairs of parallel opposite sides: a parallelogram.</b> A parallelogram with a right angle is a <b>rectangle</b>; one with four equal sides is a <b>rhombus</b>; one with both is a <b>square</b>. Exactly one pair of parallel sides: a <b>trapezoid</b>. No parallel sides but two pairs of equal adjacent sides: a <b>kite</b>. Always give the most specific name.`) +
      example('Example', `${big('A(0, 0), B(3, 1), C(2, 4), D(−1, 3)')}Slopes: AB ${F(1, 3)}, BC −3, CD ${F(1, 3)}, DA −3. Opposite sides are parallel, and ${F(1, 3)} × (−3) = −1, so the angles are right. Lengths: AB = BC = √10. Right angles and equal sides: a <b>square</b>.`),
    make(rng) {
      const kind = rng.pick(QUADS), pts = makeQuad(rng, kind), L = ['A', 'B', 'C', 'D'], sides = [0, 1, 2, 3].map(i => [i, (i + 1) % 4]);
      const nm = ([i, j]) => L[i] + L[j], cross = (a, b) => a[0] * b[1] - a[1] * b[0], vec = ([i, j]) => sub2(pts[j], pts[i]);
      const choices = [kind].concat(rng.sample(QUADS.filter(k => k !== kind), 4)).sort((a, b) => QUADS.indexOf(a) - QUADS.indexOf(b));
      const par = [cross(vec(sides[0]), vec(sides[2])) === 0, cross(vec(sides[1]), vec(sides[3])) === 0], nPar = par.filter(Boolean).length;
      const slopes = sides.map(s => `${nm(s)}: ${slopeTxt(pts[s[0]], pts[s[1]])}`).join(', '), lens = sides.map(s => `${nm(s)} = ${lenTxt(pts[s[0]], pts[s[1]])}`).join(', ');
      const step2 = nPar === 2 ? 'Both pairs of opposite sides have equal slopes, so ABCD is a parallelogram.' : nPar === 1 ? `Only ${par[0] ? 'AB and CD' : 'BC and DA'} are parallel, so ABCD has exactly one pair of parallel sides.` : 'No two sides are parallel.';
      const step3 = { Square: 'Adjacent sides are perpendicular and all four sides are equal.', Rectangle: 'Adjacent sides are perpendicular, but the sides are not all equal.', Rhombus: 'All four sides are equal, but adjacent sides are not perpendicular.', Parallelogram: 'Adjacent sides are not perpendicular and the sides are not all equal.', Trapezoid: 'That is the definition of a trapezoid.', Kite: 'Two pairs of adjacent sides are equal.' }[kind];
      return { prompt: `What is the most specific name for quadrilateral ABCD?${big(pts.map((p, i) => `${L[i]}${M.pt(...p)}`).join(', '))}`, type: 'choice', choices, keepOrder: true, answer: kind, params: { pts },
        hints: [`Find the slope of each side. ${slopes}.`, step2, `Find the lengths: ${lens}. ${step3}`, `<b>${kind}</b>.`] };
    },
    verify(q) {
      const P = q.params.pts, side = i => sub2(P[(i + 1) % 4], P[i]), d2 = v => v[0] * v[0] + v[1] * v[1], dot = (a, b) => a[0] * b[0] + a[1] * b[1], cr = (a, b) => a[0] * b[1] - a[1] * b[0];
      const S = [0, 1, 2, 3].map(side), turns = S.map((s, i) => Math.sign(cr(s, S[(i + 1) % 4])));
      if (new Set(turns).size !== 1 || turns[0] === 0) return 'not a convex quadrilateral';         // every corner turns the same way
      const p1 = cr(S[0], S[2]) === 0, p2 = cr(S[1], S[3]) === 0, right = dot(S[0], S[1]) === 0, eq = S.every(s => d2(s) === d2(S[0]));
      const c = p1 && p2 ? (right && eq ? 'Square' : right ? 'Rectangle' : eq ? 'Rhombus' : 'Parallelogram') : p1 || p2 ? 'Trapezoid'
        : (d2(S[0]) === d2(S[1]) && d2(S[2]) === d2(S[3])) || (d2(S[1]) === d2(S[2]) && d2(S[3]) === d2(S[0])) ? 'Kite' : 'none';
      return q.answer === c;
    },
  });
})();
