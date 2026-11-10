/* The step checker: write your working one line at a time and Procademy checks every line exactly.

   An equation line is right when it has the same solutions as the line before; an inequality, when the
   same numbers make it true; an expression, when it is equal to the line before for every value of its
   letters. Each is decided by calculation (lib/draw.js reads the math), never by an AI, so a check mark
   can be trusted. A wrong line says what kind of slip it looks like — the inequality sign not flipped,
   a sign lost moving a term, the two sides treated differently — and a solved line (x = 4) is checked in
   the first line. On its own page (#/steps) for homework, and under "Solve…" practice questions. */
'use strict';
(function () {
  const D = window.DRAW, H = window.VIEWS._h, esc = H.esc;
  const FN = /\b(sqrt|cbrt|abs|asin|acos|atan|arcsin|arccos|arctan|sin|cos|tan|sec|csc|cot|ln|log|exp|floor|ceil|round|pi|tau)\b/gi;
  const norm = s => String(s || '').replace(/[−‒–—]/g, '-').replace(/[≤⩽]/g, '<=').replace(/[≥⩾]/g, '>=').replace(/≠/g, '!=')
    .replace(/[×·⋅∙]/g, '*').replace(/÷/g, '/').replace(/^\s*(?:solve|simplify|evaluate|expand|factor)\b[^:=<>]*?:\s*/i, '').replace(/^\s*(?:\d+[.)]|[-*•])\s+/, '').trim();
  /** the letters a line uses as variables (not the letters of sqrt, sin, pi…) */
  function letters(t) {
    const out = [];
    t.replace(FN, ' ').replace(/[a-z]/gi, ch => { const c = ch.toLowerCase(); if (c !== 'e' && !out.includes(c)) out.push(c); return ch; });
    return out;
  }
  /** one line → { kind: 'eq' | 'ineq' | 'expr', op, F (or f), vars } or { error } */
  function parse(raw, vars) {
    const t = norm(raw);
    if (!t) return { empty: true };
    const ops = [...t.matchAll(/<=|>=|!=|<|>|=/g)];
    if (ops.length > 1) return { error: 'This line has more than one = or < sign. Write one statement per line.' };
    const v = vars || letters(t);
    try {
      if (!ops.length) { const f = D.compile(t, v.length ? v : ['x']); return { kind: 'expr', f, vars: v, text: t }; }
      const op = ops[0][0], L = t.slice(0, ops[0].index), R = t.slice(ops[0].index + op.length);
      if (!L.trim() || !R.trim()) return { error: 'Something is missing on one side.' };
      const fl = D.compile(L, v.length ? v : ['x']), fr = D.compile(R, v.length ? v : ['x']);
      const F = (...a) => fl(...a) - fr(...a);
      return { kind: op === '=' ? 'eq' : op === '!=' ? 'neq' : 'ineq', op, F, L: L.trim(), R: R.trim(), fl, fr, vars: v, text: t };
    } catch (e) { return { error: 'Procademy can’t read this line. Check the parentheses and signs.' }; }
  }

  /* ---------- solving by calculation ---------- */
  const close = (a, b) => Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(a), Math.abs(b));
  /** where F(x) = 0, as a sorted list; 'all' for an identity; [] for none */
  function zeros(F) {
    const probe = [-7.31, -2.17, 0.53, 3.9, 11.2, 47.3];
    const vals = probe.map(x => F(x));
    if (vals.every(v => isFinite(v) && Math.abs(v) < 1e-9)) return 'all';
    // linear: exact
    const a = F(1) - F(0), c = F(0);
    if (isFinite(a) && isFinite(c) && probe.every((x, i) => isFinite(vals[i]) && Math.abs(vals[i] - (a * x + c)) <= 1e-9 * (1 + Math.abs(vals[i])))) return Math.abs(a) < 1e-12 ? [] : [snap(-c / a)];
    const out = [];
    const scan = (lo, hi, n) => {
      let px = lo, pv = F(lo);
      for (let i = 1; i <= n; i++) {
        const x = lo + (hi - lo) * i / n, v = F(x);
        if (isFinite(pv) && isFinite(v)) {
          if (pv === 0) push(px);
          else if (pv * v < 0) {
            let l = px, r = x, fl = pv;
            for (let k = 0; k < 80; k++) { const m = (l + r) / 2, fm = F(m); if (!isFinite(fm)) break; if (fl * fm <= 0) r = m; else { l = m; fl = fm; } }
            const z = (l + r) / 2; if (Math.abs(F(z)) < 1e-6 * (1 + Math.abs(pv) + Math.abs(v))) push(z);
          } else if (Math.abs(v) < 1e-10) push(x);
        }
        px = x; pv = v;
      }
    };
    const push = z => { z = snap(z); if (!out.some(q => close(q, z))) out.push(z); };
    scan(-60, 60, 12000); scan(-2000, -60, 3000); scan(60, 2000, 3000);
    // a double root (x² = 0) touches without crossing
    for (let x = -60; x <= 60; x += 0.01) { const v = F(x); if (isFinite(v) && Math.abs(v) < 1e-12) push(x); }
    return out.sort((p, q) => p - q);
  }
  function snap(v) { const k = Math.round(v * 1e6) / 1e6; return Math.abs(k - v) < 1e-7 ? (Object.is(k, -0) ? 0 : k) : v; }
  const sameSet = (a, b) => (a === 'all' || b === 'all' ? a === b : a.length === b.length && a.every((v, i) => close(v, b[i])));
  /** the numbers that make an inequality true, sampled: [x, true/false] away from its boundary */
  const TEST_XS = (() => { const xs = []; for (let x = -80; x <= 80; x += 0.37) xs.push(Math.round(x * 1000) / 1000); return xs.concat([-500, -150, 150, 500]); })();
  const holds = (p, x) => { const v = p.F(x); if (!isFinite(v)) return null; return p.op === '<' ? v < 0 : p.op === '<=' ? v <= 1e-12 : p.op === '>' ? v > 0 : v >= -1e-12; };
  function truth(p) { return TEST_XS.map(x => holds(p, x)); }
  /** compare two inequalities' truth: 'same' | 'flipped' (the opposite) | 'different' */
  function compareTruth(a, b) {
    const ta = truth(a), tb = truth(b);
    const nearEdge = x => [a, b].some(p => Math.abs(p.F(x)) < 1e-6 * (1 + Math.abs(x)));
    let same = true, flipped = true;
    TEST_XS.forEach((x, i) => { if (ta[i] == null || tb[i] == null || nearEdge(x)) return; if (ta[i] !== tb[i]) same = false; if (ta[i] === tb[i]) flipped = false; });
    return same ? 'same' : flipped ? 'flipped' : 'different';
  }
  const num = v => (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : String(Math.round(v * 1000) / 1000)).replace(/^-/, '−');
  const setText = z => (z === 'all' ? 'every number' : !z.length ? 'no number' : z.map(num).join(' and '));
  /** is this line already solved: x = 4 (or 4 = x) */
  const solvedValue = p => {
    if (p.kind !== 'eq' || p.vars.length !== 1) return null;
    const v = p.vars[0], L = p.L.replace(/\s+/g, ''), R = p.R.replace(/\s+/g, '');
    const isNum = s => /^[-+]?(\d+\.?\d*|\.\d+)(\/\d+)?$/.test(s);
    if (L === v && isNum(R)) return Number(eval_(R));
    if (R === v && isNum(L)) return Number(eval_(L));
    return null;
  };
  const eval_ = s => { const [a, b] = s.split('/'); return b ? Number(a) / Number(b) : Number(a); };
  /** the first line with the value put in: "2(4) + 3 = 11 → 11 = 11 ✓" */
  function substitute(first, v, val) {
    const shown = s => s.replace(new RegExp(`(\\d)\\s*${v}\\b`, 'g'), `$1(${num(val)})`).replace(new RegExp(`\\b${v}\\b`, 'g'), `(${num(val)})`).replace(/-/g, '−');
    return `${shown(first.L)} = ${shown(first.R)} → ${num(first.fl(val))} = ${num(first.fr(val))}`;
  }

  /** check every line: [{ status: start | ok | solved | bad | error | empty, msg }] */
  function check(lines) {
    const out = [];
    let first = null, prev = null, vars = null, above = null;        // prev: the last right line; above: the line just above
    lines.forEach((raw, i) => {
      let p = parse(raw, null);
      if (p.empty) { out.push({ status: 'empty', msg: '' }); return; }
      if (p.error) { out.push({ status: 'error', msg: p.error }); return; }
      if (!first) {
        vars = p.vars;
        if (p.kind === 'neq') { out.push({ status: 'error', msg: 'Start from an equation, an inequality or an expression.' }); return; }
        if ((p.kind === 'eq' || p.kind === 'ineq') && p.vars.length !== 1) { out.push({ status: 'error', msg: p.vars.length ? 'Procademy checks equations with one letter (like x). This one has ' + p.vars.join(', ') + '.' : 'There is no letter to solve for here.' }); return; }
        first = prev = p;
        const z = p.kind === 'eq' ? zeros(p.F) : null;
        out.push({ status: 'start', msg: p.kind === 'expr' ? 'Starting expression.' : p.kind === 'eq' ? (z === 'all' ? 'This is true for every number.' : !z.length ? 'This equation has no solution.' : 'Starting equation.') : 'Starting inequality.' });
        return;
      }
      // read later lines with the first line's letters, so x and X and new letters are caught
      const extra = p.vars.filter(v => !vars.includes(v));
      if (extra.length && first.kind !== 'expr') { out.push({ status: 'error', msg: `“${extra.join(', ')}” is new here. Keep using ${vars.join(', ')}.` }); return; }
      p = parse(raw, first.kind === 'expr' ? Array.from(new Set(vars.concat(p.vars))) : vars);
      if (p.error) { out.push({ status: 'error', msg: p.error }); return; }
      const wasAbove = above; above = p;
      const fromSlip = q => wasAbove && wasAbove !== prev && q(wasAbove);     // right from a line that had a slip
      if (first.kind === 'expr') {
        if (p.kind !== 'expr') { out.push({ status: 'error', msg: 'The first line is an expression: keep simplifying it, without an = sign.' }); return; }
        const vs = p.vars.length ? p.vars : ['x'];
        const pts = [[1.3, -0.7, 2.1], [-2.4, 3.3, 0.6], [4.1, 1.7, -1.9], [0.37, -2.9, 5.3], [-3.6, 0.9, 1.1], [6.2, -4.4, -0.5]];
        const args = pt => vs.map((_, k) => pt[k % 3]);
        const fa = (...a) => prev.f(...prev.vars.map(v => a[vs.indexOf(v)] ?? 1)), fb = (...a) => p.f(...a);
        const bad = pts.find(pt => { const x = fa(...args(pt)), y = fb(...args(pt)); return isFinite(x) && isFinite(y) && !close(x, y); });
        if (!bad) { out.push({ status: 'ok', msg: 'Equal to the line before. ✓' }); prev = p; return; }
        if (fromSlip(w => w.kind === 'expr' && pts.every(pt => { const vv = vs.map((_, k) => pt[k % 3]); const x = w.f(...w.vars.map(v => vv[vs.indexOf(v)] ?? 1)), y = p.f(...vv); return !isFinite(x) || !isFinite(y) || close(x, y); }))) { out.push({ status: 'bad', msg: 'This step follows correctly from the line above, but the line above has a slip. Correct that line first.' }); return; }
        // show the difference with a friendly number
        const tryVals = [2, 3, 1, -1, 5, 10];
        const tv = tryVals.find(t => { const a = vs.map(() => t); const x = fa(...a), y = fb(...a); return isFinite(x) && isFinite(y) && !close(x, y); }) ?? 2;
        const a = vs.map(() => tv);
        out.push({ status: 'bad', msg: `Not equal to the line before. Try ${vs.map(v => `${v} = ${num(tv)}`).join(', ')}: the line before gives ${num(fa(...a))}, this line gives ${num(fb(...a))}.` });
        return;
      }
      if (first.kind === 'eq') {
        if (p.kind !== 'eq') { out.push({ status: 'error', msg: p.kind === 'expr' ? 'Keep both sides: write the whole equation on each line (with its = sign).' : 'The first line is an equation: each line should have an = sign.' }); return; }
        const zp = zeros(prev.F), zn = zeros(p.F), solved = solvedValue(p);
        if (sameSet(zp, zn)) {
          if (solved != null) out.push({ status: 'solved', msg: `Solved: ${p.vars[0]} = ${num(solved)}. Check it in the first line: ${substitute(first, first.vars[0], solved)} ✓` });
          else out.push({ status: 'ok', msg: 'Same solution as the line before. ✓' });
          prev = p; return;
        }
        let why = 'This line doesn’t have the same solution as the line before. Do the same thing to both sides.';
        const lin = q => { const a = q.F(1) - q.F(0), c = q.F(0); return [-3, 2, 7].every(x => Math.abs(q.F(x) - (a * x + c)) < 1e-9 * (1 + Math.abs(c))) ? { a, c } : null; };
        if (fromSlip(w => w.kind === 'eq' && sameSet(zeros(w.F), zn))) why = 'This step follows correctly from the line above, but the line above has a slip. Correct that line first.';
        else if (Array.isArray(zp) && Array.isArray(zn) && zn.length < zp.length && zn.every(z => zp.some(q => close(q, z)))) why = `A solution went missing: the line before is true for ${setText(zp)}, this line only for ${setText(zn)}.${zp.length === 2 && close(zp[0], -zp[1]) ? ' A square root has a + and a − answer.' : ''}`;
        else if (Array.isArray(zp) && Array.isArray(zn) && zn.length > zp.length && zp.every(z => zn.some(q => close(q, z)))) why = `This line has an extra solution (${setText(zn)}) that the line before doesn’t. Squaring both sides, or multiplying by an expression containing x, can cause this.`;
        else if (lin(prev) && lin(p) && close(Math.abs(lin(prev).a), Math.abs(lin(p).a)) && !close(Math.abs(lin(prev).c), Math.abs(lin(p).c))) why = 'The x term is correct, but a number changed. When a number moves to the other side, + becomes − (and − becomes +). Check the arithmetic too.';
        else if (lin(prev) && lin(p) && close(Math.abs(lin(prev).c), Math.abs(lin(p).c)) && !close(Math.abs(lin(prev).a), Math.abs(lin(p).a))) why = 'The numbers are correct, but the coefficient of x changed. Check how you combined the x terms.';
        else if (Array.isArray(zp) && Array.isArray(zn) && zp.length === 1 && zn.length === 1) {
          const a = zp[0], b = zn[0];
          if (close(a, -b)) why = 'The solution’s sign changed. Check the signs: moving a term across the = sign changes + to − (and − to +).';
          else if (a !== 0 && close(b, 1 / a)) why = 'The solution is inverted. To undo “times a number”, divide by it (don’t multiply).';
          else if (a !== 0 && b !== 0 && Math.abs(Math.round(Math.max(a / b, b / a))) > 1 && close(Math.max(a / b, b / a), Math.round(Math.max(a / b, b / a)))) why = 'The solution is off by a factor. Check whether only part of one side was divided (or multiplied): every term on both sides must be divided.';
        }
        out.push({ status: 'bad', msg: why });
        return;
      }
      if (first.kind === 'ineq') {
        if (p.kind !== 'ineq') { out.push({ status: 'error', msg: 'The first line is an inequality: keep the inequality sign on each line.' }); return; }
        const c = compareTruth(prev, p);
        if (c !== 'same' && fromSlip(w => w.kind === 'ineq' && compareTruth(w, p) === 'same')) { out.push({ status: 'bad', msg: 'This step follows correctly from the line above, but the line above has a slip. Correct that line first.' }); return; }
        if (c === 'same') {
          const v = vars[0], solvedIneq = new RegExp(`^${v}$`).test(p.L.replace(/\s+/g, '')) && /^[-+]?[\d./]+$/.test(p.R.replace(/\s+/g, ''));
          out.push({ status: solvedIneq ? 'solved' : 'ok', msg: solvedIneq ? `Solved: ${p.text.replace(/-/g, '−').replace('<=', '≤').replace('>=', '≥')}: every number that makes it true works in the first line too. ✓` : 'Same numbers make it true as the line before. ✓' });
          prev = p; return;
        }
        out.push({ status: 'bad', msg: c === 'flipped' ? 'The inequality sign now points the wrong way. When you multiply or divide both sides by a negative number, flip the sign (< becomes >).' : 'Different numbers make this true than the line before. Do the same thing to both sides.' });
      }
    });
    return out;
  }

  /* ---------- the step list, used on its own page and under practice questions ---------- */
  const MARK = { start: '<svg width="8" height="8" viewBox="0 0 8 8" style="vertical-align:middle"><circle cx="4" cy="4" r="3" fill="currentColor"/></svg>', ok: '✓', solved: '✓', bad: '✗', error: '?', empty: '' };
  /** a list of lines in el, checked as they are typed. opts: { first (a fixed first line), onCheck(results, lines) } */
  function box(el, opts) {
    opts = opts || {};
    let lines = opts.lines ? opts.lines.slice() : (opts.first ? [opts.first, ''] : ['', '']);
    function draw(focus) {
      const res = check(lines);
      el.innerHTML = `<ol class="steps-list">${lines.map((l, i) => `<li class="step is-${res[i].status}" data-i="${i}">
          <span class="step-mark" aria-hidden="true">${MARK[res[i].status]}</span>
          <input class="step-in" value="${esc(l)}" ${opts.first && i === 0 ? 'readonly' : ''} spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Step ${i + 1}" placeholder="${i === 0 ? 'Start: an equation, an inequality or an expression' : i === lines.length - 1 ? 'Next step…' : ''}">
          ${res[i].msg && res[i].status !== 'empty' ? `<div class="step-msg">${esc(res[i].msg)}</div>` : ''}</li>`).join('')}</ol>`;
      if (focus) { const inp = el.querySelector(`.step[data-i="${focus.i}"] .step-in`); if (inp) { inp.focus(); const at = focus.at == null ? inp.value.length : focus.at; try { inp.setSelectionRange(at, at); } catch (e) { /* fine */ } } }
      if (opts.onCheck) opts.onCheck(res, lines);
      if (res.some(x => x.status === 'solved') && window.BADGES) BADGES.flag('steps');
    }
    let timer = 0;
    el.addEventListener('input', ev => {
      const inp = ev.target.closest('.step-in'); if (!inp) return;
      const i = Number(inp.closest('.step').dataset.i);
      lines[i] = inp.value;
      if (i === lines.length - 1 && inp.value.trim()) lines.push('');
      clearTimeout(timer); timer = setTimeout(() => draw({ i, at: inp.selectionStart }), 350);
    });
    el.addEventListener('keydown', ev => {
      const inp = ev.target.closest('.step-in'); if (!inp) return;
      const i = Number(inp.closest('.step').dataset.i);
      if (ev.key === 'Enter') { ev.preventDefault(); ev.stopPropagation(); clearTimeout(timer); if (i === lines.length - 1) lines.push(''); draw({ i: i + 1 }); }
      else if (ev.key === 'Backspace' && !inp.value && i > 0 && !(opts.first && i === 1 && lines.length <= 2)) { ev.preventDefault(); lines.splice(i, 1); draw({ i: i - 1 }); }
      else if (ev.key === 'ArrowUp' && i > 0) { ev.preventDefault(); draw({ i: i - 1 }); }
      else if (ev.key === 'ArrowDown' && i < lines.length - 1) { ev.preventDefault(); draw({ i: i + 1 }); }
    });
    draw();
    return { lines: () => lines.slice(), set(ls) { lines = ls.slice(); if (lines[lines.length - 1]) lines.push(''); draw(); }, check: () => check(lines) };
  }

  /** the equation or inequality a practice question asks to solve, if it has one letter: "3x + 5 = 20" */
  function fromQuestion(q) {
    if (!q || !window.COACH) return null;
    const t = COACH.text(q.prompt);
    if (!/solve|find the value|what is the value|value of/i.test(t)) return null;
    const parts = t.split(/(?<=[.?!:;])\s+|\n/).map(x => x.replace(/^(solve|solve for [a-z]|find [a-z])\b[^:]*:?\s*/i, '').replace(/[.?!]+$/, '').trim());
    for (const c of parts) {
      if (!/[=<>≤≥]/.test(c) || /\?/.test(c)) continue;
      const p = parse(c);
      if (p.error || p.empty || (p.kind !== 'eq' && p.kind !== 'ineq') || p.vars.length !== 1) continue;
      if (p.kind === 'eq') { const z = zeros(p.F); if (z === 'all' || !z.length) continue; }
      if (solvedValue(p) != null) continue;
      return norm(c);
    }
    return null;
  }

  /* ---------- its own page ---------- */
  /** "Check my answer": is this the answer to that problem? { ok: true | false | null, msg }, never the solution.
      An equation or inequality is checked by the step checker itself; an answer that is only a number is read as
      "x = that number". A wrong number is put back into the problem, so the learner sees why it doesn't fit. */
  function checkAnswer(problem, answer) {
    problem = String(problem || '').trim(); answer = String(answer || '').trim().replace(/−/g, '-');
    if (!problem || !answer) return { ok: null, msg: 'Type the problem and your answer.' };
    const p = parse(problem);
    if (p.empty || p.error || p.kind === 'neq' || !/[\d+\-*/^()=<>×÷−]/.test(problem)) return { ok: null, msg: 'Procademy can’t read that problem. Try an equation such as 2x + 5 = 17, or an expression such as 3/4 + 1/6.' };
    const v = p.vars && p.vars.length === 1 ? p.vars[0] : null, bare = /^-?\d+(\.\d+)?(\/\d+)?$/.test(answer.replace(/\s+/g, ''));
    const line = (p.kind === 'eq' || p.kind === 'ineq') && v && bare ? `${v} = ${answer}` : answer;
    const r = check([problem, line]), a = r[1] || { status: 'error', msg: '' };
    if (r[0].status === 'error') return { ok: null, msg: r[0].msg };
    if (a.status === 'error' || a.status === 'empty') return { ok: null, msg: p.kind === 'expr' ? 'Write your answer as a number or an expression, such as 11/12.' : `Write your answer like ${v || 'x'} = 6, or just the number.` };
    if (a.status === 'solved') return { ok: true, msg: 'Right. Well done.' };
    if (a.status === 'ok') {
      if (p.kind === 'expr') {
        const f = /^(-?\d+)\s*\/\s*(\d+)$/.exec(answer.replace(/\s+/g, ''));
        const g = (x, y) => { x = Math.abs(x); y = Math.abs(y); while (y) [x, y] = [y, x % y]; return x; };
        return f && g(Number(f[1]), Number(f[2])) > 1 ? { ok: true, msg: 'Right, and it can be simplified further.' } : { ok: true, msg: 'Right. Well done.' };
      }
      return { ok: null, msg: `That’s true, but it isn’t finished: get ${v || 'the letter'} by itself.` };
    }
    if (p.kind === 'eq' && v && bare) {
      const val = answer.includes('/') ? Number(answer.split('/')[0]) / Number(answer.split('/')[1]) : Number(answer);
      if (Number.isFinite(val)) return { ok: false, msg: `Not quite. Put your answer back into the problem: ${substitute(p, v, val)}, and the two sides should match.` };
    }
    return { ok: false, msg: 'Not quite. Try it again, or write your working in the step checker above to find the slip.' };
  }

  const EXAMPLES = [['A two-step equation', '2x + 3 = 11'], ['Parentheses on one side', '3(x - 4) = 2x + 5'], ['An inequality (note the sign)', '-2x + 5 > 11'], ['Simplify an expression', '4(x + 2) - 3x'], ['Fractions', 'x/3 + 2 = 6'], ['Variables on both sides', '5x - 7 = 2x + 8']];

  /* ---------- solving, simplifying and factoring, every step shown (exact fractions, one letter) ---------- */
  const bab = x => (x < 0n ? -x : x), bg = (a, b) => { a = bab(a); b = bab(b); while (b) [a, b] = [b, a % b]; return a; };
  /** a fraction [n, d] in lowest terms with d > 0 */
  function R(n, d) { n = BigInt(n); d = d === undefined ? 1n : BigInt(d); if (d === 0n) throw new Error('You can’t divide by zero.'); if (d < 0n) { n = -n; d = -d; } const g = bg(n, d) || 1n; return [n / g, d / g]; }
  const radd = (a, b) => R(a[0] * b[1] + b[0] * a[1], a[1] * b[1]), rsub = (a, b) => R(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
  const rmul = (a, b) => R(a[0] * b[0], a[1] * b[1]), rdiv = (a, b) => R(a[0] * b[1], a[1] * b[0]), rz = a => a[0] === 0n, rneg = a => [-a[0], a[1]];
  const rnum = a => Number(a[0]) / Number(a[1]);
  /** polynomials in one letter: an array of fractions, index = power */
  const ptrim = p => { const q = p.slice(); while (q.length > 1 && rz(q[q.length - 1])) q.pop(); return q.length ? q : [R(0)]; };
  const padd = (p, q) => ptrim(Array.from({ length: Math.max(p.length, q.length) }, (_, i) => radd(p[i] || R(0), q[i] || R(0))));
  const pneg = p => p.map(rneg), psub = (p, q) => padd(p, pneg(q));
  const pmul = (p, q) => { const o = Array.from({ length: p.length + q.length - 1 }, () => R(0)); p.forEach((a, i) => q.forEach((b, j) => { o[i + j] = radd(o[i + j], rmul(a, b)); })); return ptrim(o); };
  const pscale = (p, k) => ptrim(p.map(a => rmul(a, k))), pdeg = p => ptrim(p).length - 1, pzero = p => pdeg(p) === 0 && rz(p[0]);
  const pval = (p, x) => p.reduce((t, a, i) => radd(t, rmul(a, i ? [x[0] ** BigInt(i), x[1] ** BigInt(i)] : R(1))), R(0));
  /** read one side: { poly, terms (each top-level term's polynomial, before combining), parens, fracs, letter } */
  function readPoly(src, letter) {
    const t = String(src).replace(/[−‒–—]/g, '-').replace(/[×·⋅∙]/g, '*').replace(/÷/g, '/').replace(/²/g, '^2').replace(/³/g, '^3').replace(/\s+/g, '');
    if (!t) throw new Error('Something is missing on one side.');
    let i = 0, parens = false, fracs = false;
    const peek = () => t[i];
    const useLetter = c => { if (!letter) letter = c; else if (c !== letter) throw new Error(`Use one letter only (this has ${letter} and ${c}).`); };
    function num() {
      const m = /^\d+(\.\d+)?/.exec(t.slice(i)); if (!m) return null;
      i += m[0].length;
      const [w, f = ''] = m[0].split('.'); if (f) fracs = true;
      return R(BigInt(w + f), 10n ** BigInt(f.length));
    }
    // each piece is { p: the polynomial, m: its terms before like terms are combined (for showing the distributing) }
    const mono = p => ptrim(p).map((a, k) => { const z = p.map(() => R(0)); z[k] = a; return ptrim(z); }).filter(q => !pzero(q)).reverse();
    const times = (A, B) => { const m = A.m.length * B.m.length <= 16 ? A.m.flatMap(a => B.m.map(b => pmul(a, b))) : mono(pmul(A.p, B.p)); return { p: pmul(A.p, B.p), m }; };
    function atom() {
      const c = peek();
      if (c === '(') { i++; parens = true; const r = sum(); if (peek() !== ')') throw new Error('A “(” needs a “)”.'); i++; return { p: r.poly, m: r.terms.flatMap(mono) }; }
      if (/[a-z]/i.test(c || '')) { useLetter(c.toLowerCase()); i++; return { p: [R(0), R(1)], m: [[R(0), R(1)]] }; }
      const n = num(); if (n) return { p: [n], m: [[n]] };
      throw new Error(c ? `Procademy can’t read “${c}” here.` : 'Something is missing at the end.');
    }
    function power() {
      let b = atom();
      if (peek() === '^') {
        i++; const n = num();
        if (!n || n[1] !== 1n || n[0] > 12n) throw new Error('Powers here are whole numbers up to 12, as in x^2.');
        let r = { p: [R(1)], m: [[R(1)]] }; for (let k = 0n; k < n[0]; k++) r = times(r, b); b = r;
      }
      return b;
    }
    function unary() { if (peek() === '-') { i++; const u = unary(); return { p: pneg(u.p), m: u.m.map(pneg) }; } if (peek() === '+') { i++; return unary(); } return power(); }
    function product() {
      let A = unary();
      for (;;) {
        const c = peek();
        if (c === '*') { i++; A = times(A, unary()); }
        else if (c === '/') { i++; const q = unary().p; if (pdeg(q) > 0) throw new Error(`Dividing by an expression with ${letter || 'a letter'} isn’t something this tool does. Multiply it out first.`); if (rz(q[0])) throw new Error('You can’t divide by zero.'); fracs = true; const k = rdiv(R(1), q[0]); A = { p: pscale(A.p, k), m: A.m.map(t => pscale(t, k)) }; }
        else if (c && (c === '(' || /[a-z\d.]/i.test(c))) A = times(A, power());
        else return A;
      }
    }
    function sum() {
      const terms = [];
      let sign = 1;
      if (peek() === '-') { i++; sign = -1; } else if (peek() === '+') i++;
      for (;;) {
        const q = product(); q.m.forEach(t => terms.push(sign < 0 ? pneg(t) : t));
        if (peek() === '+') { i++; sign = 1; } else if (peek() === '-') { i++; sign = -1; } else break;
      }
      return { poly: terms.reduce(padd, [R(0)]), terms };
    }
    const r = sum();
    if (i < t.length) throw new Error(t[i] === ')' ? 'There is a “)” without a “(”.' : `Procademy can’t read “${t[i]}” here.`);
    if (/\d\/\d/.test(t)) fracs = true;
    return { poly: ptrim(r.poly), terms: r.terms, parens, fracs, letter };
  }
  /** a fraction or a polynomial, written for the page */
  const fracTxt = (a, html) => { const n = (a[0] < 0n ? '−' : '') + bab(a[0]); return a[1] === 1n ? n : html ? `${n}/${a[1]}` : `${n}/${a[1]}`; };
  function polyHtml(p, x, opts) {
    p = ptrim(p);
    const parts = [];
    for (let k = p.length - 1; k >= 0; k--) {
      const a = p[k]; if (rz(a)) continue;
      const neg = a[0] < 0n, m = [bab(a[0]), a[1]], one = m[0] === 1n && m[1] === 1n;
      const coef = k === 0 ? fracTxt(m) : one ? '' : m[1] === 1n ? String(m[0]) : `(${fracTxt(m)})`;
      const v = k === 0 ? '' : `<i>${x}</i>${k > 1 ? `<sup>${k}</sup>` : ''}`;
      parts.push({ neg, s: coef + v });
    }
    if (!parts.length) return '0';
    return parts.map((t, k) => (k === 0 ? (t.neg ? '−' : '') + t.s : (t.neg ? ' − ' : ' + ') + t.s)).join('');
  }
  /** markup as plain text for the explanations: x<sup>2</sup> is x² */
  const SUPS = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  const txt = h => String(h).replace(/<sup>(\d+)<\/sup>/g, (m, d) => d.split('').map(c => SUPS[c]).join('')).replace(/<[^>]+>/g, '');
  const termsHtml = (terms, x) => terms.map((q, k) => { const h = polyHtml(q, x); return k === 0 ? h : h.startsWith('−') ? ' − ' + h.slice(1) : ' + ' + h; }).join('');
  const lcmOf = ps => ps.flat().reduce((l, a) => l / bg(l, a[1]) * a[1], 1n);
  const sq = n => { if (n < 0n) return null; let r = BigInt(Math.floor(Math.sqrt(Number(n)))); while (r * r > n) r--; while ((r + 1n) * (r + 1n) <= n) r++; return r * r === n ? r : null; };
  /** √n written k√m, as [k, m] */
  function surd(n) { let k = 1n, m = n; for (let f = 2n; f * f <= m; f++) while (m % (f * f) === 0n) { m /= f * f; k *= f; } return [k, m]; }
  const dec = a => String(Number(rnum(a).toPrecision(6)));
  /** what was typed, tidied for showing: − for minus, × for *, superscript powers, spaces round the signs */
  const typed = t => esc(String(t).trim()).replace(/\^(\d+)/g, '<sup>$1</sup>').replace(/\*/g, '×').replace(/\s*(<=|&gt;=|>=|&lt;=|=|&lt;|&gt;|≤|≥)\s*/g, ' $1 ').replace(/&lt;=/g, '≤').replace(/&gt;=/g, '≥')
    .replace(/(\S)\s*([+−-])\s*/g, (m, a, o) => (/[(×/^]/.test(a) ? m : `${a} ${o === '-' ? '−' : o} `)).replace(/^-/, '−').replace(/\(-/g, '(−');
  const bs = n => (n < 0n ? '−' : '') + bab(n), ns = v => String(v).replace('-', '−');
  const relTxt = { '<': '<', '>': '>', '<=': '≤', '>=': '≥', '=': '=' }, flip = { '<': '>', '>': '<', '<=': '>=', '>=': '<=', '=': '=' };

  /** solve an equation or inequality in one letter: { steps: [{ math, why }], answer } or { error } */
  function solve(raw) {
    const t = String(raw).replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/^\s*solve\b[^:]*:?\s*/i, '');
    const ops = [...t.matchAll(/<=|>=|<|>|=/g)];
    if (ops.length !== 1) return { error: ops.length ? 'Write one equation or inequality, with one = or < sign.' : 'Write an equation to solve, with an = sign, like 2x + 5 = 17.' };
    let op = ops[0][0];
    try {
      const L = readPoly(t.slice(0, ops[0].index)), Rr = readPoly(t.slice(ops[0].index + op.length), L.letter), x = Rr.letter || L.letter || 'x';
      if (!L.letter && !Rr.letter) return { error: 'There’s no letter to solve for. To work out a number, use the calculator.' };
      const steps = [], eq = (l, r, o) => `${l} ${relTxt[o || op]} ${r}`, push = (l, r, why, o) => steps.push({ math: eq(polyHtml(l, x), polyHtml(r, x), o), why });
      steps.push({ math: typed(t), why: 'The problem.' });
      let l = L.poly, r = Rr.poly;
      const nz = q => q.filter(a => !rz(a)).length, nt = ts => ts.filter(q => !pzero(q)).length, combine = nt(L.terms) > nz(l) || nt(Rr.terms) > nz(r);
      if (L.parens || Rr.parens) {
        steps.push({ math: eq(termsHtml(L.terms, x), termsHtml(Rr.terms, x)), why: 'Multiply out the parentheses (distribute).' });
        if (combine) push(l, r, 'Combine like terms on each side.');
      } else if (combine) push(l, r, 'Combine like terms on each side.');
      const deg = Math.max(pdeg(l), pdeg(r));
      if (deg > 2) return { error: `This works on equations up to ${x}² (quadratics). This one has ${x}${deg === 3 ? '³' : '^' + deg}.` };
      const den = lcmOf([l, r]);
      if (den > 1n) { l = pscale(l, R(den)); r = pscale(r, R(den)); push(l, r, `Multiply both sides by ${den} to clear the fractions.`); }
      if (deg <= 1) {
        const a1 = l[1] || R(0), b1 = l[0], a2 = r[1] || R(0), b2 = r[0];
        if (!rz(a2)) { l = psub(l, [R(0), a2]); r = psub(r, [R(0), a2]); push(l, r, `${a2[0] > 0n ? 'Subtract' : 'Add'} ${txt(polyHtml([R(0), [bab(a2[0]), a2[1]]], x))} ${a2[0] > 0n ? 'from' : 'to'} both sides, to get every ${x} on the left.`); }
        const a = rsub(a1, a2);
        if (!rz(b1) && !rz(a)) { l = psub(l, [b1]); r = psub(r, [b1]); push(l, r, `${b1[0] > 0n ? 'Subtract' : 'Add'} ${fracTxt([bab(b1[0]), b1[1]])} ${b1[0] > 0n ? 'from' : 'to'} both sides, to leave the ${x} term alone.`); }
        if (rz(a)) {
          const lhs = rsub(b1, b2), ok = op === '=' ? rz(lhs) : op === '<' ? lhs[0] < 0n : op === '>' ? lhs[0] > 0n : op === '<=' ? lhs[0] <= 0n : lhs[0] >= 0n;
          const last = steps[steps.length - 1], said = `The ${x} terms cancel, leaving ${fracTxt(b1)} ${relTxt[op]} ${fracTxt(b2)}. ${ok ? 'That is always true.' : 'That is never true.'}`;
          if (/subtract|add/i.test(last.why)) last.why += ' ' + said; else steps.push({ math: `${fracTxt(b1)} ${relTxt[op]} ${fracTxt(b2)}`, why: said });
          return { steps, answer: ok ? `Every number works: any value of ${x}.` : 'No solution.' };
        }
        const rhs = r[0];
        let ans = rdiv(rhs, a);
        if (!(a[0] === 1n && a[1] === 1n)) {
          const why = a[0] === -1n && a[1] === 1n ? 'Multiply both sides by −1.' : `Divide both sides by ${fracTxt(a)}.`;
          if (op !== '=' && a[0] < 0n) { op = flip[op]; steps.push({ math: `<i>${x}</i> ${relTxt[op]} ${fracTxt(ans)}`, why: `${why} Dividing or multiplying by a negative number flips the inequality sign.` }); }
          else steps.push({ math: `<i>${x}</i> ${relTxt[op]} ${fracTxt(ans)}`, why });
        }
        const pretty = `${x} ${relTxt[op]} ${fracTxt(ans)}${ans[1] !== 1n ? ` (about ${dec(ans)})` : ''}`;
        if (a[0] === 1n && a[1] === 1n && steps[steps.length - 1].math.indexOf(`<i>${x}</i> `) !== 0) steps.push({ math: `<i>${x}</i> ${relTxt[op]} ${fracTxt(ans)}`, why: 'Done.' });
        if (op === '=') {
          const lv = pval(L.poly, ans), rv = pval(Rr.poly, ans), v = fracTxt(ans), bare = ans[1] === 1n && ans[0] >= 0n, sub = typed(t).replace(new RegExp(`(\\d|\\))?${x}`, 'g'), (m, d) => (d ? `${d}(${v})` : bare ? v : `(${v})`));
          steps.push({ math: sub, why: `Check: put ${fracTxt(ans)} back in for ${x}. Both sides are ${fracTxt(lv)}${rz(rsub(lv, rv)) ? '' : ' and ' + fracTxt(rv)}, so it’s right.` });
        } else steps[steps.length - 1].why += ` Every number ${({ '<': 'less than', '>': 'greater than', '<=': 'less than or equal to', '>=': 'greater than or equal to' })[op]} ${fracTxt(ans)} makes it true.`;
        return { steps, answer: pretty };
      }
      if (op !== '=') return { error: `This solves inequalities up to ${x} to the first power. Try the graphing calculator for this one.` };
      // a quadratic: everything on the left, a x² + b x + c = 0
      if (!pzero(r)) { l = psub(l, r); r = [R(0)]; push(l, r, 'Move every term to the left side, so the right side is 0.'); }
      let g = l.reduce((t, c) => bg(t, c[0]), 0n); if (l[2][0] < 0n) g = -g;
      if (g !== 1n && g !== 0n) { l = pscale(l, R(1n, g)); push(l, r, `Divide both sides by ${g}.`); }
      const [c, b, a] = [l[0][0], l[1][0], l[2][0]];
      if (c === 0n) {
        steps.push({ math: `<i>${x}</i>(${polyHtml([R(b), R(a)], x)}) = 0`, why: `Take out the common factor ${x}.` });
        const r2 = R(-b, a);
        steps.push({ math: `<i>${x}</i> = 0 or ${polyHtml([R(b), R(a)], x)} = 0`, why: 'A product is 0 only when one of its factors is 0.' });
        return { steps, answer: `${x} = 0 or ${x} = ${fracTxt(r2)}` };
      }
      const D = b * b - 4n * a * c;
      if (D < 0n) { steps.push({ math: `b² − 4ac = ${bs(D)}`, why: 'The discriminant is negative, so no real number solves it (the parabola never reaches 0).' }); return { steps, answer: 'No real solution.' }; }
      const root = sq(D);
      if (root !== null) {
        const r1 = R(-b + root, 2n * a), r2 = R(-b - root, 2n * a);
        const fac = rr => `(${rr[1] === 1n ? '' : rr[1]}<i>${x}</i> ${rr[0] > 0n ? '−' : '+'} ${bab(rr[0])})`;
        const lead = R(a, r1[1] * r2[1]), pre = lead[0] === 1n && lead[1] === 1n ? '' : fracTxt(lead);
        steps.push({ math: rz(rsub(r1, r2)) ? `${pre}${fac(r1)}<sup>2</sup> = 0` : `${pre}${fac(r1)}${fac(r2)} = 0`, why: a === 1n ? `Factor: find two numbers that multiply to ${c} and add to ${b}: ${fracTxt(rneg(r1))} and ${fracTxt(rneg(r2))}.` : `Factor: find two numbers that multiply to a·c = ${a * c} and add to b = ${b}, then group.` });
        if (rz(rsub(r1, r2))) return { steps, answer: `${x} = ${fracTxt(r1)}` };
        steps.push({ math: `${fac(r1).slice(1, -1)} = 0 or ${fac(r2).slice(1, -1)} = 0`, why: 'A product is 0 only when one of its factors is 0.' });
        return { steps, answer: `${x} = ${fracTxt(r1)} or ${x} = ${fracTxt(r2)}` };
      }
      steps.push({ math: `<i>${x}</i> = (−b ± √(b² − 4ac)) / 2a`, why: `It doesn’t factor with whole numbers, so use the quadratic formula with a = ${bs(a)}, b = ${bs(b)}, c = ${bs(c)}.` });
      steps.push({ math: `<i>${x}</i> = (${bs(-b)} ± √${D}) / ${2n * a}`, why: `b² − 4ac = ${b * b} − ${bs(4n * a * c)} = ${D}.` });
      const [k, m] = surd(D), gg = bg(bg(b, k), 2n * a) || 1n;
      const B = -b / gg, K = k / gg, A2 = 2n * a / gg, top = `${B === 0n ? '' : bs(B) + ' '}± ${K === 1n ? '' : K}√${m}`;
      if (k !== 1n) steps.push({ math: `<i>${x}</i> = ${A2 === 1n ? top : `(${top}) / ${A2}`}`, why: `√${D} = ${k}√${m}${gg !== 1n ? `, and every part divides by ${gg}` : ''}.` });
      const v1 = (-Number(b) + Math.sqrt(Number(D))) / (2 * Number(a)), v2 = (-Number(b) - Math.sqrt(Number(D))) / (2 * Number(a));
      return { steps, answer: `${x} = ${A2 === 1n ? top.replace('± ', '±') : `(${top}) / ${A2}`}, about ${ns(Number(v1.toPrecision(5)))} or ${ns(Number(v2.toPrecision(5)))}` };
    } catch (e) { return { error: e.message || 'Procademy can’t read this. Check the signs and parentheses.' }; }
  }
  /** simplify an expression: distribute, then combine like terms */
  function simplify(raw) {
    const t = String(raw).replace(/^\s*(?:simplify|expand)\b[^:]*:?\s*/i, '');
    if (/[=<>≤≥]/.test(t)) return { error: 'Simplify takes an expression with no = sign. To solve, choose Solve.' };
    try {
      const P = readPoly(t), x = P.letter || 'x', steps = [{ math: typed(t), why: 'The expression.' }];
      const flat = termsHtml(P.terms, x), done = polyHtml(P.poly, x);
      if (P.parens && flat !== done) steps.push({ math: flat, why: 'Multiply out the parentheses (distribute): multiply each term in one by each term in the other.' });
      steps.push({ math: done, why: flat === done ? 'Nothing to combine: this is as simple as it gets.' : 'Combine like terms, highest power first.' });
      return { steps, answer: polyHtml(P.poly, x) };
    } catch (e) { return { error: e.message }; }
  }
  /** factor a polynomial in one letter over the whole numbers, saying how */
  function factor(raw) {
    const t = String(raw).replace(/^\s*factor\b[^:]*:?\s*/i, '');
    if (/[=<>≤≥]/.test(t)) return { error: 'Factor takes an expression with no = sign.' };
    try {
      const P = readPoly(t), x = P.letter || 'x', steps = [];
      let p = P.poly;
      if (pdeg(p) < 1) return { error: `That’s a number, ${fracTxt(p[0])}. Factor works on expressions with a letter, like x² − 9.` };
      steps.push({ math: polyHtml(p, x), why: P.parens || P.terms.length !== p.filter(a => !rz(a)).length ? 'Multiply out and write it in standard form.' : 'The expression, in standard form.' });
      // the common factor: whole numbers and the lowest power of the letter
      const L = lcmOf([p]); let ints = p.map(a => a[0] * (L / a[1])), g = ints.reduce((u, v) => bg(u, v), 0n), low = ints.findIndex(v => v !== 0n);
      if (ints[ints.length - 1] < 0n) g = -g;
      const k = R(g, L), out = [];
      let q = ints.slice(low).map(v => v / g);                     // whole-number coefficients, leading one positive
      const gcf = (k[0] === 1n && k[1] === 1n ? '' : k[1] === 1n ? (k[0] === -1n ? '−' : fracTxt(k)) : `(${fracTxt(k)})`) + (low ? `<i>${x}</i>${low > 1 ? `<sup>${low}</sup>` : ''}` : '');
      const qh = () => polyHtml(q.map(v => R(v)), x);
      if (gcf) steps.push({ math: `${gcf}(${qh()})`, why: `Take out the greatest common factor, ${txt(gcf)}.` });
      // whole-number roots and fraction roots pull out a factor at a time
      const divisors = n => { n = bab(n); const d = []; for (let i = 1n; i <= n && i <= 10000n; i++) if (n % i === 0n) d.push(i); return d; };
      while (q.length > 3) {
        const c0 = q[0], an = q[q.length - 1];
        if (c0 === 0n) { out.push(`<i>${x}</i>`); q = q.slice(1); continue; }
        let hit = null;
        for (const pp of divisors(c0)) { for (const qq of divisors(an)) { for (const sg of [1n, -1n]) { const rt = R(sg * pp, qq); if (rz(pval(q.map(v => R(v)), rt))) { hit = rt; break; } } if (hit) break; } if (hit) break; }
        if (!hit) break;
        // synthetic division by (qq·x − pp)
        const [pn, pd] = hit, nq = [];
        let carry = 0n; const rev = q.slice().reverse();
        for (let i = 0; i < rev.length - 1; i++) { const v = rev[i] + carry; nq.push(v / pd); carry = (v / pd) * pn; }
        q = nq.reverse();
        const f = `(${pd === 1n ? '' : pd}<i>${x}</i> ${pn > 0n ? '−' : '+'} ${bab(pn)})`;
        out.push(f);
        steps.push({ math: `${gcf}${out.join('')}(${qh()})`, why: `${x} = ${fracTxt(hit)} makes it 0, so ${txt(f)} is a factor. Divide it out.` });
      }
      let done = false;
      if (q.length === 3) {
        const [c, b, a] = q, D = b * b - 4n * a * c, rd = sq(D), ra = sq(a), rc = sq(bab(c));
        if (b === 0n && c < 0n && ra !== null && rc !== null) {
          out.push(`(${ra === 1n ? '' : ra}<i>${x}</i> − ${rc})(${ra === 1n ? '' : ra}<i>${x}</i> + ${rc})`);
          steps.push({ math: `${gcf}${out.join('')}`, why: `A difference of two squares: A² − B² = (A − B)(A + B), with A = ${ra === 1n ? '' : ra}${x} and B = ${rc}.` }); done = true;
        } else if (rd !== null) {
          const r1 = R(-b + rd, 2n * a), r2 = R(-b - rd, 2n * a), fac = rr => `(${rr[1] === 1n ? '' : rr[1]}<i>${x}</i> ${rr[0] > 0n ? '−' : '+'} ${bab(rr[0])})`;
          const same = rz(rsub(r1, r2));
          out.push(same ? `${fac(r1)}<sup>2</sup>` : fac(r1) + fac(r2));
          steps.push({ math: `${gcf}${out.join('')}`, why: same ? 'A perfect square: (A ± B)² = A² ± 2AB + B².' : a === 1n ? `Find two numbers that multiply to ${c} and add to ${b}: ${fracTxt(rneg(r1))} and ${fracTxt(rneg(r2))}.` : `Find two numbers that multiply to a·c = ${a * c} and add to b = ${b}, then factor by grouping.` });
          done = true;
        } else steps.push({ math: `${gcf}${out.join('')}(${qh()})`, why: `${txt(qh())} doesn’t factor with whole numbers: b² − 4ac = ${bs(D)} isn’t a perfect square.` });
      } else if (q.length === 2) { out.push(`(${qh()})`); done = true; }
      const final = done ? `${gcf}${out.join('')}` : gcf || out.length ? `${gcf}${out.join('')}(${qh()})` : qh();
      if (!gcf && !out.length && !done) return { steps, answer: `${final}: it can’t be factored with whole numbers.` };
      if (steps[steps.length - 1].math !== final) steps.push({ math: final, why: 'Fully factored.' });
      return { steps, answer: final };
    } catch (e) { return { error: e.message }; }
  }

  function page(root, code) {
    const start = code && D.decode(code) ? D.decode(code).split('\n') : null;
    root.innerHTML = `
      <div class="steps-page">
        <div class="card">
          <h1>Step checker</h1>
          <p class="muted">Write your working one line at a time: an equation, an inequality or an expression first, then each step. Procademy checks every line exactly, by calculation, and says what kind of slip a wrong line looks like.</p>
          <div id="steps-box" class="steps-box"></div>
          <div class="btn-row">
            <select id="steps-ex" aria-label="Examples"><option value="">Choose an example…</option>${EXAMPLES.map(([t], k) => `<option value="${k}">${esc(t)}</option>`).join('')}</select>
            <button class="btn sm ghost" id="steps-clear" type="button">Clear</button>
            <button class="btn sm ghost" id="steps-ask" type="button">Ask the tutor about my steps</button>
          </div>
          <p class="tiny muted">Press Enter to start a new line. The checker accepts equations and inequalities in one letter (x, y, n…) and expressions in any letters. Use * or a space for times, / for divide, ^ for powers.</p>
        </div>
        <div class="card steps-solve" id="steps-solve">
          <h2>Solve, simplify or factor</h2>
          <p class="muted small">Every step is shown, with why it works. Fractions stay exact.</p>
          <div class="tabs" role="tablist" aria-label="What to do">${[['solve', 'Solve'], ['simplify', 'Simplify'], ['factor', 'Factor']].map(([k, l], i) => `<button type="button" role="tab" class="tab${i ? '' : ' on'}" aria-selected="${!i}" data-mode="${k}">${l}</button>`).join('')}</div>
          <form class="ca-form" id="sv-form" autocomplete="off"><div class="field"><label for="sv-q" id="sv-label">An equation or inequality</label><input id="sv-q" placeholder="3(x − 2) = x + 4" spellcheck="false" autocapitalize="off"></div><button class="btn primary" type="submit" id="sv-go">Show the steps</button></form>
          <div class="sv-ex small"><span class="muted">Try:</span> <span id="sv-try"></span></div>
          <div id="sv-out" aria-live="polite"></div>
        </div>
        <div class="card steps-answer" id="steps-answer">
          <h2>Check my answer</h2>
          <p class="muted small">Type a homework problem and your answer. Procademy says whether it’s right, without showing the solution.</p>
          <form class="ca-form" id="ca-form" autocomplete="off">
            <div class="field"><label for="ca-q">Problem</label><input id="ca-q" placeholder="2x + 5 = 17, or 3/4 + 1/6" spellcheck="false" autocapitalize="off"></div>
            <div class="field"><label for="ca-a">Your answer</label><input id="ca-a" placeholder="x = 6, or 11/12" spellcheck="false" autocapitalize="off"></div>
            <button class="btn primary" type="submit">Check</button>
          </form>
          <div id="ca-out" aria-live="polite"></div>
        </div>
      </div>`;
    const b = box(root.querySelector('#steps-box'), { lines: start || [EXAMPLES[0][1], ''] });
    root.__steps = b;
    root.querySelector('#steps-ex').addEventListener('change', ev => { const ex = EXAMPLES[Number(ev.target.value)]; if (ex) { b.set([ex[1], '']); ev.target.value = ''; const ins = root.querySelectorAll('.step-in'); if (ins[1]) ins[1].focus(); } });
    root.querySelector('#steps-clear').addEventListener('click', () => b.set(['', '']));
    root.querySelector('#steps-ask').addEventListener('click', () => {
      const ls = b.lines().filter(l => l.trim()), res = check(ls);
      if (!ls.length) return;
      const lines = ls.map((l, i) => `${i + 1}. ${l}   [${res[i].status === 'bad' ? 'Procademy: ' + res[i].msg : res[i].status === 'ok' || res[i].status === 'solved' ? 'checked: right' : res[i].status}]`).join('\n');
      if (window.TUTORUI) TUTORUI.open({ ask: `Here is my working, with Procademy's exact check of each line:\n${lines}\nHelp me understand any mistake.` });
    });
    root.querySelector('#ca-form').addEventListener('submit', ev => {
      ev.preventDefault();
      const r = checkAnswer(root.querySelector('#ca-q').value, root.querySelector('#ca-a').value);
      root.querySelector('#ca-out').innerHTML = `<div class="feedback ${r.ok === true ? 'good' : r.ok === false ? 'bad' : 'note'}">${window.ICONS ? ICONS.svg(r.ok === true ? 'check' : r.ok === false ? 'cross' : 'info') : ''}<span>${esc(r.msg)}</span></div>`;
    });
    // solve, simplify or factor, step by step
    const SV = { solve: ['An equation or inequality', '3(x − 2) = x + 4', ['2x + 5 = 17', '3(x − 2) = x + 4', 'x/2 + 1/3 = 5/6', '−2x + 3 < 9', 'x² − 5x + 6 = 0', '2x² + 3x − 4 = 0']],
      simplify: ['An expression', '3(x + 2) − 2(x − 5)', ['3(x + 2) − 2(x − 5)', '(x + 3)(x − 2)', '(2x − 1)²', 'x/2 + x/3']],
      factor: ['An expression', 'x² + 5x + 6', ['x² + 5x + 6', '6x² + 11x − 10', '4x² − 9', 'x³ − 6x² + 11x − 6', '3x² + 12x', 'x² + 6x + 9']] };
    let mode = 'solve';
    const svRun = () => {
      const q = root.querySelector('#sv-q').value.trim(), out = root.querySelector('#sv-out');
      if (!q) { out.innerHTML = ''; return; }
      const r = mode === 'solve' ? solve(q) : mode === 'simplify' ? simplify(q) : factor(q);
      out.innerHTML = r.error ? `<div class="feedback note">${window.ICONS ? ICONS.svg('info') : ''}<span>${esc(r.error)}</span></div>`
        : `<ol class="sv-steps">${r.steps.map(st => `<li><div class="sv-math">${st.math}</div><div class="small muted">${esc(st.why)}</div></li>`).join('')}</ol><p class="sv-answer"><b>Answer:</b> ${r.answer.includes('<') ? r.answer : esc(r.answer)}</p>`;
    };
    const svMode = m => {
      mode = m;
      root.querySelectorAll('[data-mode]').forEach(b => { const on = b.dataset.mode === m; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); });
      root.querySelector('#sv-label').textContent = SV[m][0]; root.querySelector('#sv-q').placeholder = SV[m][1];
      root.querySelector('#sv-try').innerHTML = SV[m][2].map(e => `<button type="button" class="chip-btn" data-try="${esc(e)}">${esc(e)}</button>`).join(' ');
      root.querySelector('#sv-out').innerHTML = '';
    };
    root.querySelector('#steps-solve').addEventListener('click', ev => {
      const m = ev.target.closest('[data-mode]'), tr = ev.target.closest('[data-try]');
      if (m) svMode(m.dataset.mode);
      if (tr) { root.querySelector('#sv-q').value = tr.dataset.try; svRun(); }
    });
    root.querySelector('#sv-form').addEventListener('submit', ev => { ev.preventDefault(); svRun(); });
    svMode('solve');
    if (code) history.replaceState(null, '', '#/steps');
    H.tutorCtx({ notes: 'The student is on the step checker page, checking their own working line by line.' });
  }

  window.STEPS = { check, parse, zeros, box, fromQuestion, page, checkAnswer, EXAMPLES, solve, simplify, factor };
})();
