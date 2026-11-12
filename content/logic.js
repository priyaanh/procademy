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
})();
