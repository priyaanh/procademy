/* Coding and logic. Thinking like a programmer: logic puzzles, truth tables, sequences and patterns, reading code
   and tracing loops, binary and other number bases, and the steps of simple algorithms. Code is shown as text
   (escaped, in a code block) and is never run by the page. verify() checks each answer independently: puzzles by
   trying every possible arrangement, truth tables by parsing the expression and trying every row, and code by
   a small interpreter for the Python-style lines used here (written for these checks; it reads the code text). */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const N = M.n, V = M.v;
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = s => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const key = s => A.normText(A.stripTags(s));
  const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1e-9 : tol);
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  /** the answer plus up to n − 1 distractors that read differently from it and from each other */
  function options(answer, cands, n) {
    const out = [answer], seen = new Set([key(answer)]);
    for (const c of cands) { if (out.length >= (n || 4)) break; if (c == null) continue; const k = key(c); if (!seen.has(k)) { seen.add(k); out.push(c); } }
    return out;
  }
  /** every ordering of a list */
  function perms(a) { if (a.length <= 1) return [a.slice()]; const out = []; a.forEach((x, i) => perms(a.slice(0, i).concat(a.slice(i + 1))).forEach(r => out.push([x].concat(r)))); return out; }
  const COURSE = {
    id: 'coding-logic', title: 'Coding and logic', subject: 'Middle school', grade: 7, icon: 'Code', hue: 200,
    blurb: 'Thinking like a programmer: logic puzzles, truth tables, sequences and patterns, reading code and tracing loops, binary and other number bases, and the steps of simple algorithms.',
    units: [
      { id: 'puzzles', title: 'Logic puzzles', blurb: 'Truth-tellers and liars, ordering puzzles, matching puzzles, and if-then reasoning.', skills: ['logic.truth-tellers', 'logic.ordering', 'logic.matching', 'logic.if-then'] },
      { id: 'truth-tables', title: 'Truth tables', blurb: 'AND, OR and NOT, truth tables, equivalent expressions, and if-then statements.', skills: ['logic.and-or-not', 'logic.truth-table-rows', 'logic.equivalent', 'logic.conditionals'] },
      { id: 'patterns', title: 'Sequences and patterns', blurb: 'What comes next, finding the nth term, repeating patterns, and growing patterns.', skills: ['logic.next-term', 'logic.nth-term', 'logic.repeating', 'logic.growing'] },
      { id: 'reading-code', title: 'Reading code', blurb: 'Tracing variables, if and else, for loops, while loops, nested loops, lists, and functions, all by reading code without running it.', skills: ['logic.trace-variables', 'logic.trace-if', 'logic.for-loops', 'logic.while-loops', 'logic.nested-loops', 'logic.lists', 'logic.functions'] },
    ],
  };
  A.course(COURSE);

  /* ---------- Unit 1: logic puzzles ---------- */
  // a statement is [type, speaker, target]; its truth depends on who is a knight (true) or a knave (false)
  const SAY = {
    knight: (n, t) => `${n[t]} is a knight.`,
    knave: (n, t) => `${n[t]} is a knave.`,
    same: (n, t) => `${n[t]} and I are the same kind.`,
    diff: (n, t) => `${n[t]} and I are different kinds.`,
    'some-knave': () => 'At least one of us is a knave.',
    'all-knaves': (n) => n.length === 2 ? 'We are both knaves.' : 'All three of us are knaves.',
    'one-knight': () => 'Exactly one of us is a knight.',
  };
  const truthOf = ([type, s, t], k) => ({ knight: () => k[t], knave: () => !k[t], same: () => k[s] === k[t], diff: () => k[s] !== k[t], 'some-knave': () => k.some(x => !x), 'all-knaves': () => k.every(x => !x), 'one-knight': () => k.filter(Boolean).length === 1 }[type])();
  const worlds = n => Array.from({ length: 2 ** n }, (_, m) => Array.from({ length: n }, (_, i) => !!(m >> i & 1)));
  const solveKK = (n, st) => worlds(n).filter(k => st.every(s => truthOf(s, k) === k[s[1]]));
  const knightsText = (names, k) => { const ks = names.filter((_, i) => k[i]); return ks.length === 0 ? 'None of them is a knight' : ks.length === names.length ? (names.length === 2 ? 'Both are knights' : 'All three are knights') : `Only ${M.list(ks)}`; };
  A.skill({
    id: 'logic.truth-tellers', title: 'Truth-tellers and liars',
    learn: p(`On an imaginary island, every person is a <b>knight</b>, who always tells the truth, or a <b>knave</b>, who always lies. To solve a puzzle, <b>assume one possibility and check whether every statement fits</b>. If you reach a contradiction, the assumption was wrong.`) +
      p(`A knight's statement must be true and a knave's statement must be false. Try every case if you need to: with two people there are only four (knight-knight, knight-knave, knave-knight, knave-knave).`) +
      example('Example', `Ana says, "Ben and I are different kinds." Ben says, "Ana is a knight." If Ana were a knight, Ben would be a knave, but then Ben's statement would be true, a contradiction. So Ana is a knave, which makes Ben's statement false: Ben is a knave too. <b>Both are knaves.</b>`),
    make(rng) {
      const n = rng.pick([2, 2, 3]), names = rng.sample(NAMES, n);
      let st, sol;
      do {
        const speakers = n === 2 ? [0, 1] : rng.sample([0, 1, 2], rng.pick([2, 3])).sort();
        st = speakers.map(s => { const type = rng.pick(Object.keys(SAY)); let t = rng.int(0, n - 1); while (t === s) t = rng.int(0, n - 1); return [type, s, t]; });
        sol = solveKK(n, st);
      } while (sol.length !== 1);
      const answer = knightsText(names, sol[0]), lines = st.map(([type, s, t]) => `${names[s]} says, “${SAY[type](names, t)}”`).join('<br>');
      const choices = n === 2 ? ['Both are knights', `Only ${names[0]}`, `Only ${names[1]}`, 'None of them is a knight'] : options(answer, rng.shuffle(worlds(3).map(k => knightsText(names, k))));
      return { prompt: `Each person below is a knight, who always tells the truth, or a knave, who always lies.${big(lines)}Who is a knight?`, type: 'choice', keepOrder: n === 2, answer, choices, params: { n, names, st },
        hints: [`Try assuming ${names[st[0][1]]} is a knight, and check every statement. Then try assuming ${names[st[0][1]]} is a knave.`, `Only one case has every knight telling the truth and every knave lying: ${names.map((nm, i) => `${nm} is a ${sol[0][i] ? 'knight' : 'knave'}`).join(', ')}.`, `<b>${answer}</b>.`] };
    },
    verify(q) {
      const { n, names, st } = q.params, fits = [];
      for (let m = 0; m < (1 << n); m++) {
        const isK = i => !!(m & (1 << i));
        const ok = st.every(([type, s, t]) => {
          const all = Array.from({ length: n }, (_, i) => isK(i)), v = type === 'knight' ? isK(t) : type === 'knave' ? !isK(t) : type === 'same' ? isK(s) === isK(t) : type === 'diff' ? isK(s) !== isK(t) : type === 'some-knave' ? all.includes(false) : type === 'all-knaves' ? !all.includes(true) : all.filter(Boolean).length === 1;
          return v === isK(s);
        });
        if (ok) fits.push(names.filter((_, i) => isK(i)));
      }
      if (fits.length !== 1) return 'not a unique solution';
      const ks = fits[0], want = ks.length === 0 ? 'None of them is a knight' : ks.length === n ? (n === 2 ? 'Both are knights' : 'All three are knights') : `Only ${M.list(ks)}`;
      return q.answer === want;
    },
  });

  const CLUE = {
    before: (n, a, b) => `${n[a]} finished ahead of ${n[b]}.`,
    'right-after': (n, a, b) => `${n[a]} finished right after ${n[b]}.`,
    'not-place': (n, a, k, size) => k === size - 1 ? `${n[a]} did not finish last.` : `${n[a]} did not finish ${M.ordinal(k + 1)}.`,
    place: (n, a, k) => `${n[a]} finished ${M.ordinal(k + 1)}.`,
    'next-to': (n, a, b) => `${n[a]} and ${n[b]} finished one right after the other (in some order).`,
  };
  const clueTrue = ([type, a, b], order) => { const pa = order.indexOf(a), pb = type === 'not-place' || type === 'place' ? b : order.indexOf(b); return type === 'before' ? pa < pb : type === 'right-after' ? pa === pb + 1 : type === 'not-place' ? pa !== b : type === 'place' ? pa === b : Math.abs(pa - pb) === 1; };
  A.skill({
    id: 'logic.ordering', title: 'Ordering puzzles',
    learn: p(`In an ordering puzzle, clues say who comes before whom. <b>Start with the most definite clue</b> (an exact place, or "right after", which glues two people together), then use the "ahead of" clues to rule out places.`) +
      p(`Write the places as blanks, 1st to last, and fill them in as you go. When you think you're done, <b>check every clue against your answer</b>.`) +
      example('Example', `Three runners: Ben finished right after Ana, and Chloe finished ahead of Ana. Ana and Ben are a pair in that order, and Chloe is ahead of both, so the order is <b>Chloe, Ana, Ben</b>.`),
    make(rng) {
      const n = rng.pick([4, 4, 5]), names = rng.sample(NAMES, n), all = perms([...Array(n).keys()]), order = rng.shuffle([...Array(n).keys()]);
      let clues = [], left = all;
      while (left.length > 1) {
        const type = rng.pick(['before', 'before', 'right-after', 'not-place', 'next-to', 'place']), a = rng.int(0, n - 1);
        let c;
        if (type === 'not-place') { let k; do { k = rng.int(0, n - 1); } while (order[k] === a); c = [type, a, k]; }
        else if (type === 'place') c = [type, a, order.indexOf(a)];
        else { let b = rng.int(0, n - 1); while (b === a) b = rng.int(0, n - 1); c = [type, a, b]; if (!clueTrue(c, order)) c = type === 'before' ? [type, b, a] : null; }
        if (!c || !clueTrue(c, order)) continue;
        const next = left.filter(o => clueTrue(c, o));
        if (next.length < left.length) { clues.push(c); left = next; }
      }
      const k = rng.int(0, n - 1), answer = names[order[k]];
      return { prompt: `${n === 4 ? 'Four' : 'Five'} friends, ${M.list(names)}, ran a race. There were no ties.${big(clues.map(([t, a, b]) => CLUE[t](names, a, b, n)).join('<br>'))}Who finished ${k === n - 1 ? 'last' : M.ordinal(k + 1)}?`, type: 'choice', keepOrder: true, answer, choices: names.slice(), params: { names, clues, k },
        hints: [`Start with the clue that pins things down most, then test the rest.`, `The only order that fits every clue is ${order.map(i => names[i]).join(', ')}.`, `So <b>${answer}</b> finished ${k === n - 1 ? 'last' : M.ordinal(k + 1)}.`] };
    },
    verify(q) {
      const { names, clues, k } = q.params, n = names.length;
      const fits = perms(names).filter(o => clues.every(([t, a, b]) => {
        const pa = o.indexOf(names[a]);
        if (t === 'place') return pa === b;
        if (t === 'not-place') return pa !== b;
        const pb = o.indexOf(names[b]);
        return t === 'before' ? pa < pb : t === 'right-after' ? pa - pb === 1 : pa - pb === 1 || pb - pa === 1;
      }));
      return fits.length === 1 && fits[0][k] === q.answer && n === q.choices.length;
    },
  });

  // what each person is matched with, and how to say it
  const THINGS = [
    { cat: 'pet', pool: ['cat', 'dog', 'rabbit', 'parrot'], the: true, yes: 'has', no: 'does not have', who: 'Who has' },
    { cat: 'instrument', pool: ['piano', 'violin', 'drums', 'flute'], the: true, yes: 'plays', no: 'does not play', who: 'Who plays' },
    { cat: 'sport', pool: ['soccer', 'tennis', 'basketball', 'volleyball'], the: false, yes: 'plays', no: 'does not play', who: 'Who plays' },
    { cat: 'favorite color', pool: ['red', 'green', 'blue', 'yellow'], the: false, yes: 'likes', no: 'does not like', who: 'Who likes', tail: ' best' },
  ];
  const thing = (T, x) => (T.the ? 'the ' : '') + x;
  const MCLUE = {
    has: (T, n, it, a, x) => `${n[a]} ${T.yes} ${thing(T, it[x])}${T.tail || ''}.`,
    not: (T, n, it, a, x) => `${n[a]} ${T.no} ${thing(T, it[x])}${T.tail || ''}.`,
    either: (T, n, it, a, x, y) => `${n[a]} ${T.yes} either ${thing(T, it[x])} or ${thing(T, it[y])}${T.tail || ''}.`,
  };
  A.skill({
    id: 'logic.matching', title: 'Matching puzzles',
    learn: p(`In a matching puzzle, each person gets exactly one item and no two people share. Draw a <b>grid</b> with people down the side and items across the top. Mark ✓ for a match and ✗ for "not this one".`) +
      p(`<b>When a row or column has only one empty square left, it must be the match.</b> And once you place a ✓, put ✗ in the rest of that row and column.`) +
      example('Example', `Ana, Ben and Chloe have a cat, a dog and a fish. Ana doesn't have the cat or the dog, so Ana has the fish. Ben doesn't have the cat, so Ben has the dog, and <b>Chloe has the cat</b>.`),
    make(rng) {
      const n = rng.pick([3, 3, 4]), names = rng.sample(NAMES, n), T = rng.pick(THINGS), cat = T.cat, items = rng.sample(T.pool, n), match = rng.shuffle([...Array(n).keys()]);   // person i has item match[i]
      const all = perms([...Array(n).keys()]), holds = (c, m) => c[0] === 'has' ? m[c[1]] === c[2] : c[0] === 'not' ? m[c[1]] !== c[2] : m[c[1]] === c[2] || m[c[1]] === c[3];
      let clues = [], left = all;
      while (left.length > 1) {
        const type = rng.pick(['not', 'not', 'not', 'either', 'has']), a = rng.int(0, n - 1);
        let c;
        if (type === 'has') { if (clues.some(x => x[0] === 'has') || rng.chance(0.5)) continue; c = ['has', a, match[a]]; }
        else if (type === 'not') { let x; do { x = rng.int(0, n - 1); } while (x === match[a]); c = ['not', a, x]; }
        else { let y; do { y = rng.int(0, n - 1); } while (y === match[a]); c = rng.bool() ? ['either', a, match[a], y] : ['either', a, y, match[a]]; }
        const next = left.filter(m => holds(c, m));
        if (next.length < left.length) { clues.push(c); left = next; }
      }
      const x = rng.int(0, n - 1), answer = names[match.indexOf(x)];
      return { prompt: `${M.list(names)} each have a different ${cat}: ${M.list(items.map(it => thing(T, it)))}.${big(clues.map(c => MCLUE[c[0]](T, names, items, c[1], c[2], c[3])).join('<br>'))}${T.who} ${thing(T, items[x])}${T.tail || ''}?`, type: 'choice', keepOrder: true, answer, choices: names.slice(), params: { names, items, clues, x },
        hints: [`Make a grid of people and ${cat}s, and cross out each "not" first.`, `The only way to match everyone is: ${names.map((nm, i) => `${nm} ${T.yes} ${thing(T, items[match[i]])}`).join(', ')}.`, `<b>${answer}</b> ${T.yes} ${thing(T, items[x])}${T.tail || ''}.`] };
    },
    verify(q) {
      const { names, items, clues, x } = q.params, n = names.length;
      const fits = perms(items).filter(assign => clues.every(c => c[0] === 'has' ? assign[c[1]] === items[c[2]] : c[0] === 'not' ? assign[c[1]] !== items[c[2]] : assign[c[1]] === items[c[2]] || assign[c[1]] === items[c[3]]));
      return fits.length === 1 && names[fits[0].indexOf(items[x])] === q.answer && n === q.choices.length;
    },
  });

  const IFS = [
    { P: 'it rains on Saturday', nP: 'it does not rain on Saturday', Q: 'the soccer game is canceled', nQ: 'the soccer game is not canceled' },
    { P: 'a shape is a square', nP: 'the shape is not a square', Q: 'it has four sides', nQ: 'the shape does not have four sides', p2: 'the shape is a square', q2: 'the shape has four sides' },
    { P: 'the fire alarm rings', nP: 'the fire alarm does not ring', Q: 'everyone leaves the building', nQ: 'not everyone leaves the building' },
    { P: 'the robot’s sensor sees a wall', nP: 'the robot’s sensor does not see a wall', Q: 'the robot turns left', nQ: 'the robot does not turn left' },
    { P: 'a number ends in 0', nP: 'the number does not end in 0', Q: 'it is divisible by 5', nQ: 'the number is not divisible by 5', p2: 'the number ends in 0', q2: 'the number is divisible by 5' },
    { P: 'the store is open', nP: 'the store is not open', Q: 'the lights are on', nQ: 'the lights are not on' },
  ];
  const NOTHING = 'Nothing more can be concluded';
  A.skill({
    id: 'logic.if-then', title: 'If-then reasoning',
    learn: p(`"If ${V('P')}, then ${V('Q')}" promises only one thing: whenever ${V('P')} happens, ${V('Q')} happens. So <b>if ${V('P')} is true, ${V('Q')} must be true</b>, and <b>if ${V('Q')} is false, ${V('P')} must be false</b> (otherwise ${V('Q')} would have happened).`) +
      p(`Two tempting mistakes: knowing ${V('Q')} is true tells you nothing about ${V('P')}, and knowing ${V('P')} is false tells you nothing about ${V('Q')}. Programs use the same logic: an <b>if</b> block runs when its condition is true, and says nothing about what happens otherwise.`) +
      example('Example', `"If a shape is a square, then it has four sides." A shape has four sides: it might be a rectangle, so <b>nothing more can be concluded</b>. A shape doesn't have four sides: then it <b>is not a square</b>.`),
    make(rng) {
      const c = rng.int(0, IFS.length - 1), S = IFS[c], fact = rng.pick(['P', 'nP', 'Q', 'nQ']), pS = S.p2 || S.P, qS = S.q2 || S.Q;
      const answer = fact === 'P' ? cap(qS) : fact === 'nQ' ? cap(S.nP) : NOTHING;
      const factText = { P: pS, nP: S.nP, Q: qS, nQ: S.nQ }[fact];
      return { prompt: `A rule says: “If ${S.P}, then ${S.Q}.” Suppose the rule is true and ${factText}. What can you conclude?`, type: 'choice', answer, choices: fact === 'P' || fact === 'nP' ? [cap(qS), cap(S.nQ), NOTHING].concat(fact === 'P' ? [cap(S.nP)] : []) : [cap(pS), cap(S.nP), NOTHING, cap(fact === 'nQ' ? qS : S.nQ)], params: { c, fact },
        hints: [fact === 'P' ? `The "if" part happened, so the "then" part must happen.` : fact === 'nQ' ? `The "then" part did not happen. If the "if" part had happened, it would have, so the "if" part didn't happen.` : fact === 'Q' ? `The "then" part happening doesn't tell you why: the rule only covers what happens when the "if" part is true.` : `The rule says nothing about what happens when the "if" part is false.`, `<b>${answer}</b>.`] };
    },
    verify(q) {
      // check every world (P true/false, Q true/false) that obeys the rule and the fact
      const S = IFS[q.params.c], f = q.params.fact, okW = [];
      for (const P of [true, false]) for (const Q of [true, false]) { if (P && !Q) continue; if ((f === 'P' && !P) || (f === 'nP' && P) || (f === 'Q' && !Q) || (f === 'nQ' && Q)) continue; okW.push({ P, Q }); }
      // a conclusion must be about the part the fact doesn't mention, and hold in every remaining world
      const forced = f === 'P' || f === 'nP' ? (okW.every(w => w.Q) ? cap(S.q2 || S.Q) : okW.every(w => !w.Q) ? cap(S.nQ) : NOTHING) : (okW.every(w => w.P) ? cap(S.p2 || S.P) : okW.every(w => !w.P) ? cap(S.nP) : NOTHING);
      return forced === q.answer;
    },
  });

  /* ---------- Unit 2: truth tables ---------- */
  // an expression is ['v', name] | ['not', e] | ['and', a, b] | ['or', a, b] | ['if', a, b]
  const OPW = { and: 'AND', or: 'OR' };
  /** HTML for an expression; compound parts inside other parts get parentheses */
  function show(e, inner) {
    if (e[0] === 'v') return V(e[1]);
    if (e[0] === 'not') return `NOT ${show(e[1], true)}`;
    const s = e[0] === 'if' ? `IF ${show(e[1], true)} THEN ${show(e[2], true)}` : `${show(e[1], true)} ${OPW[e[0]]} ${show(e[2], true)}`;
    return inner ? `(${s})` : s;
  }
  const evalE = (e, env) => e[0] === 'v' ? env[e[1]] : e[0] === 'not' ? !evalE(e[1], env) : e[0] === 'and' ? evalE(e[1], env) && evalE(e[2], env) : e[0] === 'or' ? evalE(e[1], env) || evalE(e[2], env) : !evalE(e[1], env) || evalE(e[2], env);
  /** the steps of evaluating an expression, innermost first, for hints */
  function steps(e, env, out) {
    if (e[0] === 'v') return out;
    e.slice(1).forEach(x => steps(x, env, out));
    out.push(`${show(e)} is ${evalE(e, env) ? 'true' : 'false'}`);
    return out;
  }
  /** a tidy random expression: literals (p or NOT p) on distinct variables, joined by AND / OR, at most two levels deep */
  function randExpr(rng, vars, depth) {
    const lit = v => rng.chance(0.3) ? ['not', ['v', v]] : ['v', v], op = () => rng.pick(['and', 'or']);
    const pair = () => { const [a, b] = rng.sample(vars, 2); const e = [op(), lit(a), lit(b)]; return rng.chance(0.25) ? ['not', e] : e; };
    if (depth < 2) return pair();
    const shape = rng.int(0, vars.length > 2 ? 2 : 1);
    if (shape === 0) return [op(), pair(), lit(rng.pick(vars))];
    if (shape === 1) return [op(), lit(rng.pick(vars)), pair()];
    return [op(), pair(), pair()];
  }
  /** a tiny reader for the expression text (used only to check answers): NOT, AND, OR, IF … THEN, parentheses */
  function parseBool(text) {
    const t = A.stripTags(text).replace(/[()]/g, ' $& ').trim().split(/\s+/);
    let i = 0;
    const expr = () => { let a = term(); while (t[i] === 'OR') { i++; const b = term(), x = a; a = env => x(env) || b(env); } return a; };
    const term = () => { let a = fac(); while (t[i] === 'AND') { i++; const b = fac(), x = a; a = env => x(env) && b(env); } return a; };
    const fac = () => {
      const w = t[i++];
      if (w === 'NOT') { const a = fac(); return env => !a(env); }
      if (w === 'IF') { const a = expr(); if (t[i++] !== 'THEN') throw new Error('THEN expected'); const b = expr(); return env => !a(env) || b(env); }
      if (w === '(') { const a = expr(); if (t[i++] !== ')') throw new Error(') expected'); return a; }
      if (/^[a-z]$/.test(w)) return env => env[w];
      throw new Error('unexpected ' + w);
    };
    const f = expr(); if (i !== t.length) throw new Error('extra text'); return f;
  }
  const rows = vars => Array.from({ length: 2 ** vars.length }, (_, m) => Object.fromEntries(vars.map((v, k) => [v, !(m >> (vars.length - 1 - k) & 1)])));
  const TF = ['True', 'False'];
  A.skill({
    id: 'logic.and-or-not', title: 'AND, OR and NOT',
    learn: p(`Logic and programming use three basic operations on true/false values. <b>NOT</b> flips a value. <b>${V('p')} AND ${V('q')}</b> is true only when both are true. <b>${V('p')} OR ${V('q')}</b> is true when at least one is true (or both).`) +
      p(`<b>Work from the inside out</b>, like order of operations: find the value of each part in parentheses first, then combine. Without parentheses, NOT goes first, then AND, then OR.`) +
      example('Example', `${V('p')} is true, ${V('q')} is false, ${V('r')} is true. (${V('p')} AND NOT ${V('q')}) OR ${V('r')}: NOT ${V('q')} is true, so ${V('p')} AND NOT ${V('q')} is true, and the whole thing is <b>true</b>.`),
    make(rng) {
      const vars = rng.pick([['p', 'q'], ['p', 'q', 'r']]); let e;
      do { e = randExpr(rng, vars, rng.int(1, 2)); } while (vars.some(v => !JSON.stringify(e).includes(`"${v}"`)));
      const env = Object.fromEntries(vars.map(v => [v, rng.bool()])), val = evalE(e, env), answer = val ? 'True' : 'False';
      const given = vars.map(v => `${V(v)} is ${env[v] ? 'true' : 'false'}`);
      return { prompt: `If ${M.list(given)}, is this expression true or false?${big(show(e))}`, type: 'choice', keepOrder: true, answer, choices: TF.slice(), params: { env, text: A.stripTags(show(e)) },
        hints: [`Work from the inside out.`, `${cap(steps(e, env, []).join('; '))}.`, `The expression is <b>${answer.toLowerCase()}</b>.`] };
    },
    verify(q) { return q.answer === (parseBool(q.params.text)(q.params.env) ? 'True' : 'False'); },
  });

  A.skill({
    id: 'logic.truth-table-rows', title: 'Truth tables',
    learn: p(`A <b>truth table</b> lists every combination of true (T) and false (F) for the variables, one per row, with the value of the expression in each row. With ${V('n')} variables there are <b>2<sup>${V('n')}</sup> rows</b>: 4 for two variables, 8 for three.`) +
      p(`Fill the table column by column: first the variables, then each smaller part, then the whole expression. Counting the T's in the last column tells you how often the expression is true.`) +
      example('Example', `${V('p')} OR NOT ${V('q')}: the rows (T, T), (T, F), (F, T), (F, F) give T, T, F, T. It is true in <b>3</b> of the 4 rows.`),
    make(rng) {
      const vars = rng.pick([['p', 'q'], ['p', 'q'], ['p', 'q', 'r']]); let e, cnt;
      do { e = randExpr(rng, vars, rng.int(1, 2)); cnt = rows(vars).filter(r => evalE(e, r)).length; } while (vars.some(v => !JSON.stringify(e).includes(`"${v}"`)) || cnt === 0 || cnt === 2 ** vars.length);
      const ask = rng.pick(['true', 'true', 'false']), ans = ask === 'true' ? cnt : 2 ** vars.length - cnt;
      const table = M.table(vars.map(v => V(v)).concat([show(e)]), rows(vars).map(r => vars.map(v => r[v] ? 'T' : 'F').concat(['?'])), { compact: true });
      return { prompt: `In how many rows of this truth table is the expression ${ask}?${table}`, type: 'number', answer: ans, params: { vars, text: A.stripTags(show(e)), ask },
        hints: [`There are ${2 ** vars.length} rows. Work out the expression for each one.`, `The last column reads ${rows(vars).map(r => evalE(e, r) ? 'T' : 'F').join(', ')}.`, `It is ${ask} in <b>${ans}</b> row${ans === 1 ? '' : 's'}.`] };
    },
    verify(q) { const f = parseBool(q.params.text), c = rows(q.params.vars).filter(r => f(r) === (q.params.ask === 'true')).length; return c === q.answer; },
  });

  const vv = x => ['v', x], nt = x => ['not', x], an = (a, b) => ['and', a, b], or = (a, b) => ['or', a, b], im = (a, b) => ['if', a, b];
  const EQUIV = [
    (p, q) => [nt(an(p, q)), [or(nt(p), nt(q))], [an(nt(p), nt(q)), or(nt(p), q), an(nt(p), q), nt(or(p, q))]],
    (p, q) => [nt(or(p, q)), [an(nt(p), nt(q))], [or(nt(p), nt(q)), an(nt(p), q), or(p, nt(q)), nt(an(p, q))]],
    (p, q, r) => [an(p, or(q, r)), [or(an(p, q), an(p, r))], [or(an(p, q), r), an(or(p, q), r), or(p, an(q, r))]],
    (p, q, r) => [or(p, an(q, r)), [an(or(p, q), or(p, r))], [an(or(p, q), r), or(an(p, q), r), an(p, or(q, r))]],
    (p, q) => [im(p, q), [or(nt(p), q), im(nt(q), nt(p))], [im(q, p), im(nt(p), nt(q)), an(p, q), or(p, nt(q))]],
    (p, q) => [nt(im(p, q)), [an(p, nt(q))], [an(nt(p), q), im(nt(p), nt(q)), or(nt(p), q)]],
  ];
  A.skill({
    id: 'logic.equivalent', title: 'Equivalent expressions',
    learn: p(`Two expressions are <b>equivalent</b> when they have the same value in every row of the truth table. Programmers use this to rewrite conditions in simpler ways.`) +
      p(`<b>De Morgan's laws:</b> NOT (${V('p')} AND ${V('q')}) is the same as (NOT ${V('p')}) OR (NOT ${V('q')}), and NOT (${V('p')} OR ${V('q')}) is the same as (NOT ${V('p')}) AND (NOT ${V('q')}). The NOT flips each part <b>and</b> switches AND with OR. Also, IF ${V('p')} THEN ${V('q')} is the same as (NOT ${V('p')}) OR ${V('q')}.`) +
      example('Example', `"Not (raining and cold)" means "not raining, or not cold, or both". So NOT (${V('r')} AND ${V('c')}) is equivalent to <b>(NOT ${V('r')}) OR (NOT ${V('c')})</b>, not (NOT ${V('r')}) AND (NOT ${V('c')}).`),
    make(rng) {
      const names = rng.pick([['p', 'q', 'r'], ['a', 'b', 'c'], ['x', 'y', 'z']]), [a, b, c] = rng.shuffle(names).map(vv), t = rng.int(0, EQUIV.length - 1), [orig, goods, bads] = EQUIV[t](a, b, c);
      const vars = names.filter(v => JSON.stringify([orig]).includes(`"${v}"`)), same = e => rows(vars).every(r => evalE(e, r) === evalE(orig, r));
      const right = rng.pick(goods.filter(same)), wrong = rng.shuffle(bads.filter(e => !same(e)));
      const answer = show(right), choices = options(answer, wrong.map(e => show(e)));
      return { prompt: `Which expression is equivalent to the one below (true in exactly the same cases)?${big(show(orig))}`, type: 'choice', answer, choices, params: { vars, text: A.stripTags(show(orig)), choiceText: choices.map(ch => A.stripTags(ch)) },
        hints: [t < 2 ? `Use De Morgan's law: NOT flips each part and switches AND with OR.` : t < 4 ? `Distribute, as with numbers: share the outside part with each piece in the parentheses.` : `Check the truth table: an IF … THEN is false only when the IF part is true and the THEN part is false.`, `<b>${answer}</b> matches it in every row of the truth table.`] };
    },
    verify(q) {
      const P = q.params, f = parseBool(P.text), hits = P.choiceText.filter(ch => { const g = parseBool(ch); return rows(P.vars).every(r => f(r) === g(r)); });
      return hits.length === 1 && hits[0] === A.stripTags(q.answer);
    },
  });

  const CONDS = [
    ['it snows', 'it does not snow', 'school is closed', 'school is not closed'],
    ['the number is even', 'the number is not even', 'the number ends in 0, 2, 4, 6 or 8', 'the number does not end in 0, 2, 4, 6 or 8'],
    ['you press the button', 'you do not press the button', 'the light turns on', 'the light does not turn on'],
    ['the score is over 100', 'the score is not over 100', 'the player wins', 'the player does not win'],
    ['the battery is low', 'the battery is not low', 'the phone beeps', 'the phone does not beep'],
  ];
  const FORMS = { converse: 'converse', inverse: 'inverse', contrapositive: 'contrapositive' };
  A.skill({
    id: 'logic.conditionals', title: 'If-then statements',
    learn: p(`A conditional "IF ${V('p')} THEN ${V('q')}" is <b>false only when ${V('p')} is true and ${V('q')} is false</b>. In every other case it's true, even when ${V('p')} is false (the promise wasn't broken).`) +
      p(`Three related statements: the <b>converse</b> swaps the parts (if ${V('q')} then ${V('p')}), the <b>inverse</b> negates both (if not ${V('p')} then not ${V('q')}), and the <b>contrapositive</b> swaps and negates (if not ${V('q')} then not ${V('p')}). <b>Only the contrapositive always has the same truth value as the original.</b>`) +
      example('Example', `"If it snows, then school is closed." Converse: if school is closed, then it snows. Contrapositive: <b>if school is not closed, then it does not snow</b>.`),
    make(rng) {
      if (rng.bool()) {
        const pv = rng.bool(), qv = rng.bool(), answer = !pv || qv ? 'True' : 'False';
        return { prompt: `${V('p')} is ${pv ? 'true' : 'false'} and ${V('q')} is ${qv ? 'true' : 'false'}. Is the statement below true or false?${big(`IF ${V('p')} THEN ${V('q')}`)}`, type: 'choice', keepOrder: true, answer, choices: TF.slice(), params: { kind: 'value', pv, qv },
          hints: [`IF … THEN is false only when the IF part is true and the THEN part is false.`, pv && !qv ? `Here the IF part is true and the THEN part is false: <b>false</b>.` : `That isn't the case here, so it is <b>true</b>.`] };
      }
      const c = rng.int(0, CONDS.length - 1), [P, nP, Q, nQ] = CONDS[c], form = rng.pick(['converse', 'inverse', 'contrapositive', 'same']);
      const S = (a, b) => `If ${a}, then ${b}.`, list = { original: S(P, Q), converse: S(Q, P), inverse: S(nP, nQ), contrapositive: S(nQ, nP) };
      const answer = form === 'same' ? list.contrapositive : list[form];
      const ask = form === 'same' ? 'Which statement is always true whenever the original statement is true?' : `Which statement is the ${FORMS[form]} of the original?`;
      return { prompt: `Original statement: “${S(P, Q)}” ${ask}`, type: 'choice', answer, choices: [list.converse, list.inverse, list.contrapositive, form === 'same' ? `If ${Q}, then ${nP}.` : list.original], params: { kind: 'form', c, form },
        hints: [`Converse: swap the parts. Inverse: negate both parts. Contrapositive: swap and negate.`, form === 'same' ? `Only the contrapositive always matches the original: “<b>${answer}</b>”` : `The ${form} is “<b>${answer}</b>”`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'value') return q.answer === ((P.pv && !P.qv) ? 'False' : 'True');
      const [p1, np, q1, nq] = CONDS[P.c], lit = { [p1]: ['p', true], [np]: ['p', false], [q1]: ['q', true], [nq]: ['q', false] };
      // read each choice back as IF a THEN b over the two facts, and compare its truth table with the original's
      const read = s => { const m = s.match(/^If (.+), then (.+)\.$/); return [lit[m[1]], lit[m[2]]]; };
      const val = ([a, b], w) => !(w[a[0]] === a[1]) || (w[b[0]] === b[1]), W = [{ p: true, q: true }, { p: true, q: false }, { p: false, q: true }, { p: false, q: false }];
      const [ia, ib] = read(q.answer);
      if (P.form === 'same') return W.every(w => val([['p', true], ['q', true]], w) === val([ia, ib], w)) && q.choices.filter(ch => W.every(w => val(read(ch), w) === val([['p', true], ['q', true]], w))).length === 1;
      const want = { converse: [['q', true], ['p', true]], inverse: [['p', false], ['q', false]], contrapositive: [['q', false], ['p', false]] }[P.form];
      return JSON.stringify([ia, ib]) === JSON.stringify(want);
    },
  });

  /* ---------- Unit 3: sequences and patterns ---------- */
  const SEQ = {
    arith: { make: rng => ({ a: rng.int(-10, 30), d: rng.nz(-9, 12) }), step: (P, t) => t.concat(t[t.length - 1] + P.d), first: P => [P.a], rule: P => `Each term ${P.d > 0 ? 'adds' : 'subtracts'} ${Math.abs(P.d)}.`, at: (P, i) => P.a + i * P.d },
    geo: { make: rng => ({ a: rng.pick([1, 2, 3, 5]), r: rng.pick([2, 3, -2, 4]) }), step: (P, t) => t.concat(t[t.length - 1] * P.r), first: P => [P.a], rule: P => `Each term is multiplied by ${N(P.r)}.`, at: (P, i) => P.a * P.r ** i },
    squares: { make: rng => ({ k: rng.int(1, 9) }), step: (P, t) => t.concat((P.k + t.length) ** 2), first: P => [P.k ** 2], rule: P => `These are square numbers: ${P.k}², ${P.k + 1}², ${P.k + 2}², …`, at: (P, i) => (P.k + i) ** 2 },
    triangular: { make: rng => ({ k: rng.int(1, 6) }), step: (P, t) => t.concat(t[t.length - 1] + P.k + t.length), first: P => [P.k * (P.k + 1) / 2], rule: P => `The amount added goes up by 1 each time: +${P.k + 1}, +${P.k + 2}, +${P.k + 3}, …`, at: (P, i) => (P.k + i) * (P.k + i + 1) / 2 },
    fib: { make: rng => ({ a: rng.int(1, 5), b: rng.int(1, 8) }), step: (P, t) => t.concat(t[t.length - 1] + t[t.length - 2]), first: P => [P.a, P.b], rule: () => 'Each term is the sum of the two before it.', at: (P, i) => { let x = P.a, y = P.b; for (let k = 0; k < i; k++) [x, y] = [y, x + y]; return x; } },
    second: { make: rng => ({ a: rng.int(1, 20), d: rng.int(1, 6), c: rng.pick([2, 3]) }), step: (P, t) => t.concat(t[t.length - 1] + P.d + (t.length - 1) * P.c), first: P => [P.a], rule: P => `The amount added grows by ${P.c} each time: +${P.d}, +${P.d + P.c}, +${P.d + 2 * P.c}, …`, at: (P, i) => P.a + i * P.d + P.c * i * (i - 1) / 2 },
    affine: { make: rng => { const m = rng.pick([2, 3]), b = rng.pick([1, -1, 2]); let a = rng.int(1, 5); if (a * (m - 1) + b === 0) a++; return { a, m, b }; }, step: (P, t) => t.concat(P.m * t[t.length - 1] + P.b), first: P => [P.a], rule: P => `Each term is ${P.m} times the one before, ${P.b > 0 ? 'plus' : 'minus'} ${Math.abs(P.b)}.`, at: (P, i) => { const f = P.b / (P.m - 1); return (P.a + f) * P.m ** i - f; } },
    alternate: { make: rng => ({ a1: rng.int(1, 9), d1: rng.int(1, 5), a2: rng.int(10, 40), d2: rng.pick([5, 10, -3, -4]) }), step: (P, t) => { const i = t.length; return t.concat(i % 2 ? P.a2 + (i - 1) / 2 * P.d2 : P.a1 + i / 2 * P.d1); }, first: P => [P.a1], rule: P => `Two patterns take turns: ${P.a1}, ${P.a1 + P.d1}, ${P.a1 + 2 * P.d1}, … and ${P.a2}, ${P.a2 + P.d2}, ${P.a2 + 2 * P.d2}, …`, at: (P, i) => i % 2 ? P.a2 + (i - 1) / 2 * P.d2 : P.a1 + i / 2 * P.d1 },
  };
  const termsOf = (kind, P, n) => { let t = SEQ[kind].first(P); while (t.length < n) t = SEQ[kind].step(P, t); return t.slice(0, n); };
  A.skill({
    id: 'logic.next-term', title: 'What comes next?',
    learn: p(`To continue a number pattern, <b>look at how each term changes into the next</b>. Check the differences first (adding the same amount? an amount that grows?), then ratios (multiplying?), then other ideas: squares, adding the two previous terms, or two patterns taking turns.`) +
      p(`Programs often build lists exactly this way, with a rule that makes each new value from the ones before it. Test your rule on every term you're given, not just the first two.`) +
      example('Example', `3, 5, 9, 15, 23, …: the differences are 2, 4, 6, 8, growing by 2, so the next difference is 10 and the next term is <b>33</b>.`),
    make(rng) {
      const kind = rng.pick(Object.keys(SEQ)), P = SEQ[kind].make(rng), shown = kind === 'alternate' ? 6 : kind === 'geo' ? 4 : 5, t = termsOf(kind, P, shown + 1);
      return { prompt: `What number comes next?${big(t.slice(0, shown).map(N).join(', ') + ', ?')}`, type: 'number', answer: t[shown], params: { kind, P, shown },
        hints: [`Look at how each term turns into the next.`, SEQ[kind].rule(P), `The next term is <b>${N(t[shown])}</b>.`] };
    },
    verify(q) { const { kind, P, shown } = q.params; return near(SEQ[kind].at(P, shown), q.answer, 1e-9) && termsOf(kind, P, shown).every((v, i) => near(v, SEQ[kind].at(P, i), 1e-9)); },
  });

  A.skill({
    id: 'logic.nth-term', title: 'Finding the nth term',
    learn: p(`In a pattern that adds the same amount ${V('d')} each time, the ${V('n')}th term is <b>first term + (${V('n')} − 1) × ${V('d')}</b>. Written as a rule, that's ${V('d')}${V('n')} + (first term − ${V('d')}).`) +
      p(`A rule lets you jump straight to the 100th term without listing 99 terms first, the way a program uses a formula instead of a slow loop. To find <b>which</b> term has a certain value, work backward: subtract the first term, divide by ${V('d')}, and add 1.`) +
      example('Example', `7, 11, 15, 19, …: ${V('d')} = 4, so the ${V('n')}th term is 4${V('n')} + 3. The 50th term is 4 × 50 + 3 = <b>203</b>, and 103 is the (103 − 7) ÷ 4 + 1 = 25th term.`),
    make(rng) {
      const kind = rng.pick(['term', 'rule', 'position']), a = rng.int(-5, 20), d = rng.nz(-6, 9), t = [0, 1, 2, 3].map(i => a + i * d), b = a - d, list = big(t.map(N).join(', ') + ', …');
      if (kind === 'term') { const n = rng.pick([20, 25, 30, 50, 75, 100]), v = a + (n - 1) * d; return { prompt: `What is the ${M.ordinal(n)} term of this pattern?${list}`, type: 'number', answer: v, params: { kind, t, n }, hints: [`Each term ${d > 0 ? 'adds' : 'subtracts'} ${Math.abs(d)}. From the 1st term to the ${M.ordinal(n)} is ${n - 1} steps.`, `${N(a)} + ${n - 1} × ${d < 0 ? `(${N(d)})` : N(d)} = <b>${N(v)}</b>.`] }; }
      if (kind === 'rule') {
        const rule = (m, c) => `${M.poly([m, c], 'n')}`, answer = rule(d, b);
        const choices = options(answer, [rule(b === 0 ? d + 1 : b, d), rule(d, a), rule(d, b + 2 * Math.sign(d || 1)), rule(-d, b), rule(d + 1, b - 1)]);
        return { prompt: `Which rule gives the ${V('n')}th term of this pattern?${list}`, type: 'choice', answer, choices, params: { kind, t, rules: choices.map(c => A.stripTags(c)) },
          hints: [`The pattern ${d > 0 ? 'adds' : 'subtracts'} ${Math.abs(d)} each time, so the rule starts with ${M.term(d, 'n')}.`, `For ${V('n')} = 1 it must give ${N(a)}: ${N(d)} ${b < 0 ? '−' : '+'} ${N(Math.abs(b))} = ${N(a)}. So <b>${answer}</b>.`] };
      }
      const n = rng.int(12, 80), v = a + (n - 1) * d;
      return { prompt: `In this pattern, which term is ${N(v)}? (For example, ${N(t[1])} is the 2nd term.)${list}`, type: 'number', answer: n, params: { kind, t, v }, hints: [`Steps from the first term: (${N(v)} − ${N(a)}) ÷ ${N(d)} = ${n - 1}.`, `Add 1 for the first term itself: it is term number <b>${n}</b>.`] };
    },
    verify(q) {
      const P = q.params, d = P.t[1] - P.t[0];
      if (P.kind === 'term') { let v = P.t[0]; for (let i = 1; i < P.n; i++) v += d; return v === q.answer; }
      if (P.kind === 'position') { let v = P.t[0], i = 1; while (v !== P.v && i < 1000) { v += d; i++; } return i === q.answer; }
      // evaluate each rule (text like "4n + 3", "−2n − 1") at n = 1…4 and compare with the pattern
      const evalRule = (r, n) => { const m = r.replace(/−/g, '-').replace(/\s+/g, '').match(/^(-?\d*)n([+-]\d+)?$/); if (!m) return NaN; const k = m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]); return k * n + (m[2] ? Number(m[2]) : 0); };
      const ok = P.rules.filter(r => P.t.every((v, i) => evalRule(r, i + 1) === v));
      return ok.length === 1 && ok[0] === A.stripTags(q.answer);
    },
  });

  const PATTERNS = ['ABC', 'ABCD', 'AABB', 'ABBC', 'ABCCD', 'ABACD', 'XYZZY', 'RGBGR', 'ABCDE', 'AABAC'];
  A.skill({
    id: 'logic.repeating', title: 'Repeating patterns',
    learn: p(`A repeating pattern cycles through the same block again and again. <b>To find the ${V('n')}th item, divide ${V('n')} by the block length and look at the remainder</b>: remainder 1 is the block's first item, remainder 2 the second, and remainder 0 the last.`) +
      p(`To count how often something appears, count it in one block, multiply by the number of full blocks, then add any in the leftover piece. Programmers use the remainder (the % operator) the same way to wrap around a list.`) +
      example('Example', `ABCCD repeats. The block has 5 letters, and 23 = 4 × 5 + 3, so the 23rd letter is the block's 3rd: <b>C</b>. In the first 23 letters there are 4 × 2 + 1 = 9 C's.`),
    make(rng) {
      const pat = rng.pick(PATTERNS), L = pat.length, n = rng.int(20, 300), kind = rng.pick(['which', 'which', 'count']), seq = (pat + pat + pat).split('').join(' ') + ' …';
      if (kind === 'which') {
        const answer = pat[(n - 1) % L], letters = [...new Set(pat.split(''))];
        return { prompt: `The letters ${pat} repeat over and over. What is the ${M.ordinal(n)} letter?${big(seq)}`, type: 'choice', keepOrder: true, answer, choices: letters, params: { kind, pat, n },
          hints: [`The block ${pat} has ${L} letters. ${n} = ${L} × ${Math.floor(n / L)} + ${n % L}.`, n % L ? `Remainder ${n % L} means the ${M.ordinal(n % L)} letter of the block: <b>${answer}</b>.` : `Remainder 0 means the last letter of the block: <b>${answer}</b>.`] };
      }
      const ch = rng.pick([...new Set(pat.split(''))]), per = pat.split(ch).length - 1, full = Math.floor(n / L), rest = pat.slice(0, n % L).split(ch).length - 1, ans = full * per + rest;
      return { prompt: `The letters ${pat} repeat over and over. How many times does ${ch} appear in the first ${n} letters?${big(seq)}`, type: 'number', answer: ans, params: { kind, pat, n, ch },
        hints: [`Each block of ${L} has ${per} ${ch}${per === 1 ? '' : "'s"}, and ${n} letters make ${full} full block${full === 1 ? '' : 's'} plus ${n % L} more.`, `${full} × ${per}${n % L ? ` + ${rest}` : ''} = <b>${ans}</b>.`] };
    },
    verify(q) {
      const P = q.params; let s = ''; while (s.length < P.n) s += P.pat; s = s.slice(0, P.n);
      return P.kind === 'which' ? q.answer === s[P.n - 1] : s.split('').filter(c => c === P.ch).length === q.answer;
    },
  });

  // growing tile patterns: the grid cells of figure n, and the matching rule
  const GROW = {
    stairs: { cells: n => { const c = []; for (let x = 0; x < n; x++) for (let y = 0; y <= x; y++) c.push([x, n - 1 - y]); return c; }, rule: n => n * (n + 1) / 2, say: 'a staircase', how: 'Figure n adds a column of n tiles: 1 + 2 + … + n = n(n + 1) ÷ 2.' },
    ell: { cells: n => { const c = []; for (let y = 0; y <= n; y++) c.push([0, y]); for (let x = 1; x <= n; x++) c.push([x, n]); return c; }, rule: n => 2 * n + 1, say: 'an L shape', how: 'Each new figure adds 2 tiles (one up, one across): 2n + 1.' },
    square1: { cells: n => { const c = []; for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) c.push([x, y]); c.push([n, n - 1]); return c; }, rule: n => n * n + 1, say: 'a square with one extra tile', how: 'An n-by-n square plus 1 tile: n² + 1.' },
    rect: { cells: n => { const c = []; for (let x = 0; x <= n; x++) for (let y = 0; y < n; y++) c.push([x, y]); return c; }, rule: n => n * (n + 1), say: 'a rectangle', how: 'An n-by-(n + 1) rectangle: n(n + 1).' },
    cross: { cells: n => { const c = [[n, n]]; for (let k = 1; k <= n; k++) c.push([n + k, n], [n - k, n], [n, n + k], [n, n - k]); return c; }, rule: n => 4 * n + 1, say: 'a plus sign', how: 'A center tile and four arms of n tiles: 4n + 1.' },
    border: { cells: n => { const c = [], s = n + 2; for (let x = 0; x < s; x++) for (let y = 0; y < s; y++) if (x === 0 || y === 0 || x === s - 1 || y === s - 1) c.push([x, y]); return c; }, rule: n => 4 * n + 4, say: 'a square frame', how: 'The frame around an n-by-n hole: 4n + 4.' },
  };
  function growPic(kind, upto) {
    const s = 11, gap = 22; let x0 = 6, g = ''; const H = Math.max(...[1, 2, 3].map(n => { const c = GROW[kind].cells(n); return Math.max(...c.map(([, y]) => y)) + 1; })) * s;
    for (let n = 1; n <= upto; n++) {
      const c = GROW[kind].cells(n), w = (Math.max(...c.map(([x]) => x)) + 1) * s, h = (Math.max(...c.map(([, y]) => y)) + 1) * s;
      c.forEach(([x, y]) => { g += `<rect class="fill" x="${x0 + x * s}" y="${8 + H - h + y * s}" width="${s}" height="${s}" stroke-width="1"/>`; });
      g += `<text x="${x0 + w / 2}" y="${H + 26}" font-size="11" text-anchor="middle">Figure ${n}</text>`;
      x0 += w + gap;
    }
    return `<svg class="figure" viewBox="0 0 ${x0 - gap + 12} ${H + 34}" width="${x0 - gap + 12}" role="img" aria-label="figures 1 to ${upto} of a growing tile pattern">${g}</svg>`;
  }
  A.skill({
    id: 'logic.growing', title: 'Growing patterns',
    learn: p(`A growing pattern changes by a rule from one figure to the next. <b>Count the tiles in the first few figures, look at how the count changes, and connect the change to the picture</b>: what gets added each time, and where?`) +
      p(`If the same number of tiles is added each time, the rule is linear (like 2${V('n')} + 1). If the amount added keeps growing, look for squares or rectangles, as in ${V('n')}² + 1 or ${V('n')}(${V('n')} + 1).`) +
      example('Example', `An L shape uses 3, 5, 7 tiles in figures 1, 2, 3. Each figure adds one tile up and one across, so figure ${V('n')} uses 2${V('n')} + 1, and figure 20 uses <b>41</b> tiles.`),
    make(rng) {
      const kind = rng.pick(Object.keys(GROW)), G = GROW[kind], counts = [1, 2, 3].map(G.rule), linear = ['ell', 'cross', 'border'].includes(kind), ask = linear && rng.chance(0.35) ? 'which' : 'count';
      if (ask === 'which') { const n = rng.int(8, 40), T = G.rule(n); return { prompt: `The pattern below keeps growing the same way. Which figure uses exactly ${T} tiles?${growPic(kind, 3)}`, type: 'number', answer: n, params: { kind, T, ask }, hints: [`Count: figures 1, 2, 3 use ${counts.join(', ')} tiles. ${G.how}`, `Solve the rule for ${T}: figure <b>${n}</b>.`] }; }
      const n = rng.pick([6, 8, 10, 12, 15, 20, 25]);
      return { prompt: `The pattern below keeps growing the same way. How many tiles does figure ${n} use?${growPic(kind, 3)}`, type: 'number', answer: G.rule(n), params: { kind, n, ask },
        hints: [`Count: figures 1, 2, 3 use ${counts.join(', ')} tiles.`, G.how, `Figure ${n} uses <b>${G.rule(n)}</b> tiles.`] };
    },
    verify(q) {
      // count the drawn cells of the figure (no repeats), rather than using the formula
      const P = q.params, count = n => new Set(GROW[P.kind].cells(n).map(c => c.join(','))).size;
      if (P.ask === 'which') return count(q.answer) === P.T && count(q.answer - 1) < P.T;
      return count(P.n) === q.answer;
    },
  });

  /* ---------- Unit 4: reading code ---------- */
  /** Reads the Python-style lines used in this unit and returns what they print. It understands numbers, True and
      False, lists, + − * // %, comparisons, and/or/not, assignment (=, +=, −=, *=, //=), list items and append,
      len(), print(), if/elif/else, for … in range(…), for … in a list, while, and def/return. Only verify() uses it. */
  function runCode(src) {
    const out = [], lines = src.split('\n').filter(l => l.trim()).map(l => ({ ind: l.length - l.trimStart().length, text: l.trim() }));
    let pos = 0, steps = 0;
    const tick = () => { if (++steps > 200000) throw new Error('too many steps'); };
    function parseBlock(ind) {
      const body = [];
      while (pos < lines.length && lines[pos].ind === ind) {
        const node = { text: lines[pos++].text };
        if (node.text.endsWith(':')) { if (pos >= lines.length || lines[pos].ind <= ind) throw new Error('empty block'); node.body = parseBlock(lines[pos].ind); }
        body.push(node);
      }
      if (pos < lines.length && lines[pos].ind > ind) throw new Error('unexpected indent');
      return body;
    }
    const prog = parseBlock(0);
    if (pos !== lines.length) throw new Error('bad indentation');
    const globals = Object.create(null), funcs = Object.create(null);
    const get = (env, k) => { if (k in env) return env[k]; if (k in globals) return globals[k]; throw new Error('unknown name ' + k); };
    function evalExpr(text, env) {
      const toks = text.match(/\d+|[A-Za-z_]\w*|\/\/|==|!=|<=|>=|[-+*%<>()[\],]/g) || [];
      if (toks.join('') !== text.replace(/\s+/g, '')) throw new Error('cannot read ' + text);
      let i = 0;
      const peek = () => toks[i], next = () => toks[i++], expect = t => { if (toks[i++] !== t) throw new Error(t + ' expected'); };
      const list = close => { const a = []; if (peek() !== close) { a.push(orE()); while (peek() === ',') { next(); a.push(orE()); } } expect(close); return a; };
      function orE() { let a = andE(); while (peek() === 'or') { next(); const b = andE(); a = a || b; } return a; }
      function andE() { let a = notE(); while (peek() === 'and') { next(); const b = notE(); a = a && b; } return a; }
      function notE() { if (peek() === 'not') { next(); return !notE(); } return cmpE(); }
      function cmpE() {
        const a = addE(), op = peek();
        if (!['==', '!=', '<', '<=', '>', '>='].includes(op)) return a;
        next(); const b = addE();
        return { '==': a === b, '!=': a !== b, '<': a < b, '<=': a <= b, '>': a > b, '>=': a >= b }[op];
      }
      function addE() { let a = mulE(); while (peek() === '+' || peek() === '-') { const op = next(), b = mulE(); a = op === '+' ? a + b : a - b; } return a; }
      function mulE() { let a = unE(); while (['*', '//', '%'].includes(peek())) { const op = next(), b = unE(); a = op === '*' ? a * b : op === '//' ? Math.floor(a / b) : ((a % b) + b) % b; } return a; }
      function unE() { if (peek() === '-') { next(); return -unE(); } let v = atom(); while (peek() === '[') { next(); const k = orE(); expect(']'); v = v[k < 0 ? v.length + k : k]; if (v === undefined) throw new Error('no such item'); } return v; }
      function atom() {
        const t = next();
        if (t === undefined) throw new Error('unexpected end');
        if (/^\d+$/.test(t)) return Number(t);
        if (t === '(') { const v = orE(); expect(')'); return v; }
        if (t === '[') return list(']');
        if (t === 'True' || t === 'False') return t === 'True';
        if (/^[A-Za-z_]\w*$/.test(t)) { if (peek() === '(') { next(); return call(t, list(')')); } return get(env, t); }
        throw new Error('unexpected ' + t);
      }
      const v = orE(); if (i !== toks.length) throw new Error('extra text in ' + text); return v;
    }
    function call(name, args) {
      if (name === 'len') return args[0].length;
      const f = funcs[name]; if (!f) throw new Error('unknown function ' + name);
      const env = Object.create(null); f.params.forEach((p, k) => { env[p] = args[k]; });
      const r = runBlock(f.body, env); return r ? r.value : null;
    }
    function loop(env, name, values, body) { for (const v of values) { tick(); env[name] = v; const r = runBlock(body, env); if (r) return r; } return null; }
    function runBlock(body, env) {
      for (let k = 0; k < body.length; k++) {
        tick();
        const st = body[k], t = st.text; let m, r;
        if ((m = t.match(/^def (\w+)\((.*)\):$/))) { funcs[m[1]] = { params: m[2].split(',').map(s => s.trim()).filter(Boolean), body: st.body }; continue; }
        if ((m = t.match(/^return (.+)$/))) return { value: evalExpr(m[1], env) };
        if ((m = t.match(/^print\((.+)\)$/))) { out.push(evalExpr(m[1], env)); continue; }
        if ((m = t.match(/^for (\w+) in range\((.+)\):$/))) {
          const a = evalExpr(`[${m[2]}]`, env), [from, to, by] = a.length === 1 ? [0, a[0], 1] : [a[0], a[1], a[2] || 1], vals = [];
          for (let v = from; by > 0 ? v < to : v > to; v += by) vals.push(v);
          if ((r = loop(env, m[1], vals, st.body))) return r; continue;
        }
        if ((m = t.match(/^for (\w+) in (.+):$/))) { if ((r = loop(env, m[1], evalExpr(m[2], env).slice(), st.body))) return r; continue; }
        if ((m = t.match(/^while (.+):$/))) { while (evalExpr(m[1], env)) { tick(); if ((r = runBlock(st.body, env))) return r; } continue; }
        if ((m = t.match(/^if (.+):$/))) {
          let done = !!evalExpr(m[1], env);
          if (done && (r = runBlock(st.body, env))) return r;
          while (k + 1 < body.length && /^(elif .+|else):$/.test(body[k + 1].text)) {
            const nx = body[++k], em = nx.text.match(/^elif (.+):$/);
            if (!done && (!em || evalExpr(em[1], env))) { done = true; if ((r = runBlock(nx.body, env))) return r; }
          }
          continue;
        }
        if ((m = t.match(/^(\w+)\.append\((.+)\)$/))) { get(env, m[1]).push(evalExpr(m[2], env)); continue; }
        if ((m = t.match(/^(\w+)\[(.+)\] = (.+)$/))) { const arr = get(env, m[1]), idx = evalExpr(m[2], env); arr[idx < 0 ? arr.length + idx : idx] = evalExpr(m[3], env); continue; }
        if ((m = t.match(/^(\w+) (\+|-|\*|\/\/)= (.+)$/))) { const a = get(env, m[1]), b = evalExpr(m[3], env); env[m[1]] = m[2] === '+' ? a + b : m[2] === '-' ? a - b : m[2] === '*' ? a * b : Math.floor(a / b); continue; }
        if ((m = t.match(/^(\w+) = (.+)$/))) { env[m[1]] = evalExpr(m[2], env); continue; }
        throw new Error('cannot read the line: ' + t);
      }
      return null;
    }
    runBlock(prog, globals);
    return out;
  }
  const CODE_Q = 'What does this code print?';
  const codeQ = (code, extra) => `${extra || CODE_Q}${M.pre(code)}`;
  const lastPrint = code => { const o = runCode(code); return o[o.length - 1]; };
  const codeVerify = q => lastPrint(q.params.code) === q.answer;
  const PY = p(`The code in this course is written in <b>Python</b>, a popular first programming language. The computer runs it one line at a time, from the top down, and indented lines belong to the line above them that ends with a colon.`);

  A.skill({
    id: 'logic.trace-variables', title: 'Tracing variables',
    learn: PY + p(`<b>= means "store"</b>, not "equals": ${M.code('x = x + 3')} takes the value in x, adds 3, and stores the result back in x. A variable keeps only its newest value. ${M.code('x += 3')} is a shortcut for the same thing. To trace code, <b>keep a little table of every variable and update it line by line</b>.`) +
      example('Example', `${M.pre('a = 5\nb = a + 3\na = b * 2\nprint(a - b)')}After line 2, b is 8. Line 3 makes a = 16. The code prints 16 − 8 = <b>8</b>.`),
    make(rng) {
      if (rng.chance(0.3)) {
        const x = rng.int(2, 9), y = rng.int(1, 9), k = rng.pick([10, 2, 3]);
        const code = [`x = ${x}`, `y = ${y}`, 'temp = x', 'x = y', 'y = temp', `print(x * ${k} + y)`].join('\n'), ans = y * k + x;
        return { prompt: codeQ(code), type: 'number', answer: ans, params: { code }, hints: [`The three middle lines swap x and y: now x is ${y} and y is ${x}.`, `${y} × ${k} + ${x} = <b>${ans}</b>.`] };
      }
      const env = { a: rng.int(2, 9) }, lines = [`a = ${env.a}`], track = [];
      const b0 = rng.pick([['b = a + ', v => env.a + v], ['b = a * ', v => env.a * v], ['b = a - ', v => env.a - v]]), bv = rng.int(2, 6);
      lines.push(b0[0] + bv); env.b = b0[1](bv); track.push(`b = ${N(env.b)}`);
      const steps = rng.int(2, 3);
      for (let s = 0; s < steps; s++) {
        const pick = rng.int(0, 5), k = rng.int(2, 5);
        if (pick === 0) { lines.push('a = a + b'); env.a = env.a + env.b; track.push(`a = ${N(env.a)}`); }
        else if (pick === 1) { lines.push(`b = b * ${k}`); env.b = env.b * k; track.push(`b = ${N(env.b)}`); }
        else if (pick === 2) { lines.push('a = b - a'); env.a = env.b - env.a; track.push(`a = ${N(env.a)}`); }
        else if (pick === 3) { lines.push(`a += ${k}`); env.a = env.a + k; track.push(`a = ${N(env.a)}`); }
        else if (pick === 4) { lines.push(`b = b // ${k}`); env.b = Math.floor(env.b / k); track.push(`b = ${N(env.b)}`); }
        else { lines.push(`b = a % ${k + 1}`); env.b = ((env.a % (k + 1)) + (k + 1)) % (k + 1); track.push(`b = ${N(env.b)}`); }
      }
      const which = rng.pick(['a', 'b', 'a + b', 'a * b']), ans = which === 'a' ? env.a : which === 'b' ? env.b : which === 'a + b' ? env.a + env.b : env.a * env.b;
      lines.push(`print(${which})`);
      const code = lines.join('\n');
      return { prompt: codeQ(code), type: 'number', answer: ans, params: { code },
        hints: [`Track the values line by line: a starts at ${lines[0].slice(4)}; then ${track.join(', then ')}.`, `At the end a is ${N(env.a)} and b is ${N(env.b)}, so ${which} is <b>${N(ans)}</b>.`] };
    },
    verify: codeVerify,
  });

  A.skill({
    id: 'logic.trace-if', title: 'If, elif and else',
    learn: PY + p(`An <b>if</b> statement runs its indented lines only when its condition is true. With <b>elif</b> ("else if") and <b>else</b>, Python checks the conditions <b>from the top down and runs only the first one that's true</b>; else runs when none are. ${M.code('==')} asks "is equal?", ${M.code('!=')} asks "is not equal?", and ${M.code('%')} gives the remainder.`) +
      example('Example', `${M.pre('score = 84\nif score >= 90:\n    grade = 4\nelif score >= 80:\n    grade = 3\nelse:\n    grade = 2\nprint(grade)')}84 ≥ 90 is false; 84 ≥ 80 is true, so grade = 3 and the rest is skipped. It prints <b>3</b>.`),
    make(rng) {
      const kind = rng.pick(['grade', 'even-odd', 'range']);
      if (kind === 'grade') {
        const cuts = [90, 80, 70], s = rng.int(55, 100), g = s >= 90 ? 4 : s >= 80 ? 3 : s >= 70 ? 2 : 1;
        const code = [`score = ${s}`, 'if score >= 90:', '    points = 4', 'elif score >= 80:', '    points = 3', 'elif score >= 70:', '    points = 2', 'else:', '    points = 1', 'print(points * 10 + score % 10)'].join('\n'), ans = g * 10 + s % 10;
        return { prompt: codeQ(code), type: 'number', answer: ans, params: { code, kind },
          hints: [`Check from the top: ${cuts.map(c => `${M.code(`${s} >= ${c}`)} is ${s >= c ? 'true' : 'false'}`).slice(0, cuts.findIndex(c => s >= c) + 1 || 3).join('; ')}. So points is ${g}.`, `${M.code(`${s} % 10`)} is ${s % 10}, so it prints ${g} × 10 + ${s % 10} = <b>${ans}</b>.`] };
      }
      if (kind === 'even-odd') {
        const n = rng.int(3, 60), lim = rng.pick([10, 20, 25]), even = n % 2 === 0, ans = even && n > lim ? n / 2 : n * 3 + 1;
        const code = [`n = ${n}`, `if n % 2 == 0 and n > ${lim}:`, '    n = n // 2', 'else:', '    n = n * 3 + 1', 'print(n)'].join('\n');
        return { prompt: codeQ(code), type: 'number', answer: ans, params: { code, kind },
          hints: [`${M.code('n % 2 == 0')} is ${even ? 'true' : 'false'} and ${M.code(`n > ${lim}`)} is ${n > lim ? 'true' : 'false'}; with ${M.code('and')}, both must be true.`, even && n > lim ? `So n = ${n} // 2 = <b>${ans}</b>.` : `So the else part runs: ${n} × 3 + 1 = <b>${ans}</b>.`] };
      }
      const t = rng.int(-5, 40), lo = rng.pick([0, 5, 10]), hi = rng.pick([25, 30]), ans = t < lo || t > hi ? (t < lo ? 1 : 3) : 2;
      const code = [`temp = ${t}`, `if temp < ${lo} or temp > ${hi}:`, `    if temp < ${lo}:`, '        level = 1', '    else:', '        level = 3', 'else:', '    level = 2', 'print(level)'].join('\n');
      return { prompt: codeQ(code), type: 'number', answer: ans, params: { code, kind },
        hints: [`${M.code(`temp < ${lo} or temp > ${hi}`)}: ${N(t)} &lt; ${lo} is ${t < lo ? 'true' : 'false'}, ${N(t)} &gt; ${hi} is ${t > hi ? 'true' : 'false'}; ${M.code('or')} needs just one to be true.`, ans === 2 ? `Neither is true, so the outer else runs: level is <b>2</b>.` : `So the inner if runs: level is <b>${ans}</b>.`] };
    },
    verify: codeVerify,
  });

  A.skill({
    id: 'logic.for-loops', title: 'For loops',
    learn: PY + p(`A <b>for loop</b> repeats its indented lines once for each value. <b>${M.code('range(1, 6)')} gives 1, 2, 3, 4, 5: it stops before the second number.</b> ${M.code('range(5)')} gives 0 to 4, and ${M.code('range(2, 11, 3)')} counts by 3: 2, 5, 8.`) +
      p(`To trace a loop, write the loop variable and every changing variable in a table, one row per pass.`) +
      example('Example', `${M.pre('total = 0\nfor i in range(1, 5):\n    total = total + i\nprint(total)')}i takes the values 1, 2, 3, 4, so total becomes 1, 3, 6, 10. It prints <b>10</b>.`),
    make(rng) {
      const kind = rng.pick(['sum', 'step', 'double', 'count']);
      if (kind === 'sum') { const a = rng.int(0, 5), b = a + rng.int(3, 9), vals = Array.from({ length: b - a }, (_, i) => a + i), ans = vals.reduce((s, x) => s + x, 0);
        const code = ['total = 0', `for i in range(${a}, ${b}):`, '    total = total + i', 'print(total)'].join('\n');
        return { prompt: codeQ(code), type: 'number', answer: ans, params: { code }, hints: [`range(${a}, ${b}) gives ${vals.join(', ')} (it stops before ${b}).`, `Their sum is <b>${ans}</b>.`] }; }
      if (kind === 'step') { const a = rng.int(1, 5), s = rng.int(2, 5), b = a + s * rng.int(3, 6) + rng.int(0, s - 1), vals = []; for (let v = a; v < b; v += s) vals.push(v); const m = rng.pick([1, 2, 10]), ans = vals.reduce((t, x) => t + x * m, 0);
        const code = ['total = 0', `for i in range(${a}, ${b}, ${s}):`, `    total += ${m === 1 ? 'i' : `i * ${m}`}`, 'print(total)'].join('\n');
        return { prompt: codeQ(code), type: 'number', answer: ans, params: { code }, hints: [`range(${a}, ${b}, ${s}) starts at ${a} and counts by ${s}, stopping before ${b}: ${vals.join(', ')}.`, `${m === 1 ? 'Add them' : `Add ${m} times each`}: <b>${ans}</b>.`] }; }
      if (kind === 'double') { const n = rng.int(3, 8), x0 = rng.int(1, 5), f = rng.pick([2, 3]), ans = x0 * f ** n;
        const code = [`x = ${x0}`, `for i in range(${n}):`, `    x = x * ${f}`, 'print(x)'].join('\n');
        return { prompt: codeQ(code), type: 'number', answer: ans, params: { code }, hints: [`range(${n}) gives ${n} values (0 to ${n - 1}), so the loop runs ${n} times.`, `${x0} multiplied by ${f}, ${n} times: ${x0} × ${f}<sup>${n}</sup> = <b>${N(ans)}</b>.`] }; }
      const n = rng.int(10, 40), k = rng.int(2, 7), ans = Math.floor(n / k);
      const code = ['count = 0', `for i in range(1, ${n + 1}):`, `    if i % ${k} == 0:`, '        count = count + 1', 'print(count)'].join('\n');
      return { prompt: codeQ(code), type: 'number', answer: ans, params: { code }, hints: [`i runs from 1 to ${n}, and count goes up when i is a multiple of ${k}.`, `The multiples of ${k} up to ${n} are ${Array.from({ length: ans }, (_, j) => (j + 1) * k).join(', ')}: <b>${ans}</b> of them.`] };
    },
    verify: codeVerify,
  });

  A.skill({
    id: 'logic.while-loops', title: 'While loops',
    learn: PY + p(`A <b>while loop</b> repeats as long as its condition is true. It checks the condition <b>before each pass</b>, so it might run many times or not at all, and something inside must change, or it never stops.`) +
      p(`Trace it like a for loop, but check the condition each time: when it becomes false, skip to the first line after the loop. ${M.code('//')} divides and drops the remainder, and ${M.code('n % 10')} is the last digit of n.`) +
      example('Example', `${M.pre('n = 40\ncount = 0\nwhile n > 1:\n    n = n // 2\n    count += 1\nprint(count)')}n goes 40, 20, 10, 5, 2, 1: five passes, then 1 > 1 is false. It prints <b>5</b>.`),
    make(rng) {
      const kind = rng.pick(['halve', 'grow', 'digits', 'countdown']);
      if (kind === 'halve') { const n0 = rng.int(20, 1000), seq = [n0]; while (seq[seq.length - 1] > 1) seq.push(Math.floor(seq[seq.length - 1] / 2));
        const code = [`n = ${n0}`, 'count = 0', 'while n > 1:', '    n = n // 2', '    count += 1', 'print(count)'].join('\n');
        return { prompt: codeQ(code), type: 'number', answer: seq.length - 1, params: { code }, hints: [`n goes ${seq.join(', ')}.`, `That's <b>${seq.length - 1}</b> passes before ${M.code('n > 1')} is false.`] }; }
      if (kind === 'grow') { const x0 = rng.int(1, 9), f = rng.pick([2, 3]), lim = rng.int(50, 1000), seq = [x0]; while (seq[seq.length - 1] < lim) seq.push(seq[seq.length - 1] * f);
        const code = [`x = ${x0}`, `while x < ${lim}:`, `    x = x * ${f}`, 'print(x)'].join('\n');
        return { prompt: codeQ(code), type: 'number', answer: seq[seq.length - 1], params: { code }, hints: [`x goes ${seq.join(', ')}.`, `${M.code(`${seq[seq.length - 1]} < ${lim}`)} is false, so the loop stops. It prints <b>${N(seq[seq.length - 1])}</b>.`] }; }
      if (kind === 'digits') { const n0 = rng.int(100, 99999), ds = String(n0).split('').map(Number), ans = ds.reduce((s, d) => s + d, 0);
        const code = [`n = ${n0}`, 'total = 0', 'while n > 0:', '    total = total + n % 10', '    n = n // 10', 'print(total)'].join('\n');
        return { prompt: codeQ(code), type: 'number', answer: ans, params: { code }, hints: [`Each pass adds the last digit (n % 10) to total, then chops it off (n // 10).`, `So total is the digit sum: ${ds.join(' + ')} = <b>${ans}</b>.`] }; }
      const n0 = rng.int(20, 80), s = rng.int(3, 9), seq = [n0]; while (seq[seq.length - 1] > 0) seq.push(seq[seq.length - 1] - s);
      const ask = rng.bool() ? 'n' : 'steps', code = [`n = ${n0}`, 'steps = 0', 'while n > 0:', `    n = n - ${s}`, '    steps += 1', `print(${ask})`].join('\n'), ans = ask === 'n' ? seq[seq.length - 1] : seq.length - 1;
      return { prompt: codeQ(code), type: 'number', answer: ans, params: { code }, hints: [`n goes ${seq.map(N).join(', ')}: the loop stops once n is no longer greater than 0.`, `That took ${seq.length - 1} passes, and n ended at ${N(seq[seq.length - 1])}. It prints <b>${N(ans)}</b>.`] };
    },
    verify: codeVerify,
  });

  A.skill({
    id: 'logic.nested-loops', title: 'Nested loops',
    learn: PY + p(`A loop inside a loop is a <b>nested loop</b>. <b>The inner loop runs all the way through for every single pass of the outer loop</b>, so 4 outer passes of a 3-pass inner loop make 4 × 3 = 12 inner passes.`) +
      p(`When the inner loop depends on the outer variable, as in ${M.code('for j in range(i)')}, count the passes for each value of i and add them up.`) +
      example('Example', `${M.pre('count = 0\nfor i in range(4):\n    for j in range(i):\n        count += 1\nprint(count)')}For i = 0, 1, 2, 3 the inner loop runs 0, 1, 2, 3 times: 0 + 1 + 2 + 3 = <b>6</b>.`),
    make(rng) {
      const kind = rng.pick(['grid', 'triangle', 'pairs', 'sum']);
      if (kind === 'grid') { const a = rng.int(2, 9), b = rng.int(2, 9), code = ['count = 0', `for i in range(${a}):`, `    for j in range(${b}):`, '        count += 1', 'print(count)'].join('\n');
        return { prompt: codeQ(code), type: 'number', answer: a * b, params: { code }, hints: [`The outer loop runs ${a} times, and each time the inner loop runs ${b} times.`, `${a} × ${b} = <b>${a * b}</b>.`] }; }
      if (kind === 'triangle') { const n = rng.int(3, 9), plus = rng.bool(), parts = Array.from({ length: n }, (_, i) => plus ? i + 1 : i), ans = parts.reduce((s, x) => s + x, 0);
        const code = ['count = 0', `for i in range(${n}):`, `    for j in range(${plus ? 'i + 1' : 'i'}):`, '        count += 1', 'print(count)'].join('\n');
        return { prompt: codeQ(code), type: 'number', answer: ans, params: { code }, hints: [`For i = 0 to ${n - 1}, the inner loop runs ${plus ? 'i + 1' : 'i'} times: ${parts.join(', ')}.`, `${parts.join(' + ')} = <b>${ans}</b>.`] }; }
      if (kind === 'pairs') { const a = rng.int(3, 7), b = rng.int(3, 7); let ans = 0; for (let i = 1; i <= a; i++) for (let j = 1; j <= b; j++) if (i < j) ans++;
        const code = ['count = 0', `for i in range(1, ${a + 1}):`, `    for j in range(1, ${b + 1}):`, '        if i < j:', '            count += 1', 'print(count)'].join('\n');
        return { prompt: codeQ(code), type: 'number', answer: ans, params: { code }, hints: [`For each i from 1 to ${a}, count the j from 1 to ${b} that are bigger than i: ${Array.from({ length: a }, (_, k) => Math.max(0, b - (k + 1))).join(', ')}.`, `Add them: <b>${ans}</b>.`] }; }
      const a = rng.int(2, 5), b = rng.int(2, 5); let ans = 0; for (let i = 1; i <= a; i++) for (let j = 1; j <= b; j++) ans += i * j;
      const code = ['total = 0', `for i in range(1, ${a + 1}):`, `    for j in range(1, ${b + 1}):`, '        total += i * j', 'print(total)'].join('\n');
      return { prompt: codeQ(code), type: 'number', answer: ans, params: { code }, hints: [`For each i, the inner loop adds i × (1 + 2 + … + ${b}) = i × ${b * (b + 1) / 2}.`, `(1 + … + ${a}) × ${b * (b + 1) / 2} = ${a * (a + 1) / 2} × ${b * (b + 1) / 2} = <b>${ans}</b>.`] };
    },
    verify: codeVerify,
  });

  A.skill({
    id: 'logic.lists', title: 'Lists and indexes',
    learn: PY + p(`A <b>list</b> holds several values in order: ${M.code('nums = [4, 9, 2]')}. <b>Positions (indexes) start at 0</b>, so ${M.code('nums[0]')} is 4 and ${M.code('nums[2]')} is 2. ${M.code('len(nums)')} is how many items there are, so the last index is len(nums) − 1.`) +
      p(`${M.code('nums.append(7)')} adds 7 to the end, and ${M.code('nums[1] = 5')} replaces the item at index 1. ${M.code('for x in nums:')} visits each item in order.`) +
      example('Example', `${M.pre('nums = [4, 9, 2, 7]\nnums[1] = nums[0] + nums[3]\nprint(nums[1])')}nums[0] is 4 and nums[3] is 7, so nums[1] becomes 11. It prints <b>11</b>.`),
    make(rng) {
      const kind = rng.pick(['index', 'change', 'filter-sum', 'append', 'max']), n = rng.int(4, 7), nums = Array.from({ length: n }, () => rng.int(1, 20)), L = `nums = [${nums.join(', ')}]`;
      if (kind === 'index') { const i = rng.int(0, n - 1), j = rng.int(0, n - 1), last = rng.bool(), code = [L, last ? `print(nums[len(nums) - 1] + nums[${i}])` : `print(nums[${i}] * nums[${j}])`].join('\n'), ans = last ? nums[n - 1] + nums[i] : nums[i] * nums[j];
        return { prompt: codeQ(code), type: 'number', answer: ans, params: { code }, hints: [`Indexes start at 0: ${nums.map((v, k) => `nums[${k}] = ${v}`).join(', ')}.`, last ? `len(nums) − 1 = ${n - 1}, so it's ${nums[n - 1]} + ${nums[i]} = <b>${ans}</b>.` : `${nums[i]} × ${nums[j]} = <b>${ans}</b>.`] }; }
      if (kind === 'change') { const a = rng.int(0, n - 1), b = rng.int(0, n - 1), c = rng.int(0, n - 1), arr = nums.slice(); arr[a] = arr[b] + arr[c]; const d = rng.int(0, n - 1), ans = arr[a] + arr[d];
        const code = [L, `nums[${a}] = nums[${b}] + nums[${c}]`, `print(nums[${a}] + nums[${d}])`].join('\n');
        return { prompt: codeQ(code), type: 'number', answer: ans, params: { code }, hints: [`nums[${b}] + nums[${c}] = ${nums[b]} + ${nums[c]} = ${arr[a]}, which replaces nums[${a}].`, `Now nums is [${arr.join(', ')}], so it prints ${arr[a]} + ${arr[d]} = <b>${ans}</b>.`] }; }
      if (kind === 'filter-sum') { const lim = rng.int(5, 14), keep = nums.filter(x => x > lim), ans = keep.reduce((s, x) => s + x, 0);
        const code = [L, 'total = 0', 'for x in nums:', `    if x > ${lim}:`, '        total = total + x', 'print(total)'].join('\n');
        return { prompt: codeQ(code), type: 'number', answer: ans, params: { code }, hints: [`The loop adds only the items greater than ${lim}: ${keep.length ? keep.join(', ') : 'none'}.`, `The total is <b>${ans}</b>.`] }; }
      if (kind === 'append') { const extra = rng.int(1, 3), adds = Array.from({ length: extra }, () => rng.int(1, 9)), arr = nums.concat(adds), ask = rng.bool() ? 'len' : 'last';
        const code = [L].concat(adds.map(v => `nums.append(${v})`), [ask === 'len' ? 'print(len(nums) + nums[0])' : 'print(nums[len(nums) - 1] * 2)']).join('\n'), ans = ask === 'len' ? arr.length + arr[0] : arr[arr.length - 1] * 2;
        return { prompt: codeQ(code), type: 'number', answer: ans, params: { code }, hints: [`After the append${extra === 1 ? '' : 's'}, nums is [${arr.join(', ')}], with ${arr.length} items.`, ask === 'len' ? `${arr.length} + ${arr[0]} = <b>${ans}</b>.` : `The last item is ${arr[arr.length - 1]}, so it prints <b>${ans}</b>.`] }; }
      const best = Math.max(...nums), code = [L, 'best = nums[0]', 'for x in nums:', '    if x > best:', '        best = x', 'print(best)'].join('\n');
      return { prompt: codeQ(code), type: 'number', answer: best, params: { code }, hints: [`best starts as the first item and is replaced whenever a bigger item comes along.`, `So it ends as the largest item: <b>${best}</b>.`] };
    },
    verify: codeVerify,
  });

  A.skill({
    id: 'logic.functions', title: 'Functions',
    learn: PY + p(`A <b>function</b> is a named recipe: ${M.code('def double(x):')} defines it, and its indented lines say what to do with the input x. <b>Calling</b> it, as in ${M.code('double(5)')}, runs those lines with x = 5, and ${M.code('return')} sends a value back to where it was called.`) +
      p(`For calls inside calls, such as ${M.code('f(f(3))')}, <b>work from the inside out</b>: find f(3) first, then use that as the new input.`) +
      example('Example', `${M.pre('def f(x):\n    return 2 * x + 1\n\nprint(f(f(3)))')}f(3) = 7, then f(7) = 15. It prints <b>15</b>.`),
    make(rng) {
      const kind = rng.pick(['nested', 'two-args', 'branch', 'loop']);
      if (kind === 'nested') { const m = rng.int(2, 4), b = rng.int(-3, 5), x = rng.int(1, 6), f = v => m * v + b, ans = f(f(x));
        const code = ['def f(x):', `    return ${m} * x${b ? ` ${b < 0 ? '-' : '+'} ${Math.abs(b)}` : ''}`, '', `print(f(f(${x})))`].join('\n');
        return { prompt: codeQ(code), type: 'number', answer: ans, params: { code }, hints: [`Inside first: f(${x}) = ${f(x)}.`, `Then f(${f(x)}) = <b>${ans}</b>.`] }; }
      if (kind === 'two-args') { const [w1, h1, w2, h2] = [rng.int(2, 9), rng.int(2, 9), rng.int(2, 9), rng.int(2, 9)], ans = w1 * h1 + w2 * h2;
        const code = ['def area(w, h):', '    return w * h', '', `print(area(${w1}, ${h1}) + area(${w2}, ${h2}))`].join('\n');
        return { prompt: codeQ(code), type: 'number', answer: ans, params: { code }, hints: [`area(${w1}, ${h1}) = ${w1 * h1} and area(${w2}, ${h2}) = ${w2 * h2}.`, `${w1 * h1} + ${w2 * h2} = <b>${ans}</b>.`] }; }
      if (kind === 'branch') { const [a, b, c, d] = [rng.int(1, 20), rng.int(1, 20), rng.int(1, 20), rng.int(1, 20)], big2 = (x, y) => x > y ? x : y, ans = big2(a, b) - big2(c, d);
        const code = ['def bigger(a, b):', '    if a > b:', '        return a', '    return b', '', `print(bigger(${a}, ${b}) - bigger(${c}, ${d}))`].join('\n');
        return { prompt: codeQ(code), type: 'number', answer: ans, params: { code }, hints: [`bigger returns the larger input (once it returns, the function stops): bigger(${a}, ${b}) = ${big2(a, b)} and bigger(${c}, ${d}) = ${big2(c, d)}.`, `${big2(a, b)} − ${big2(c, d)} = <b>${N(ans)}</b>.`] }; }
      const n = rng.int(3, 10), k = rng.int(1, 3), ans = Array.from({ length: n }, (_, i) => (i + 1) * k).reduce((s, x) => s + x, 0);
      const code = ['def total(n):', '    s = 0', '    for i in range(1, n + 1):', `        s = s + i${k > 1 ? ` * ${k}` : ''}`, '    return s', '', `print(total(${n}))`].join('\n');
      return { prompt: codeQ(code), type: 'number', answer: ans, params: { code }, hints: [`total(${n}) adds ${k > 1 ? `${k} × i` : 'i'} for i = 1 to ${n}.`, `${Array.from({ length: n }, (_, i) => (i + 1) * k).join(' + ')} = <b>${ans}</b>.`] };
    },
    verify: codeVerify,
  });
})();
