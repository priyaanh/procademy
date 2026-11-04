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
  const EXAMPLES = [['A two-step equation', '2x + 3 = 11'], ['Parentheses on one side', '3(x - 4) = 2x + 5'], ['An inequality (note the sign)', '-2x + 5 > 11'], ['Simplify an expression', '4(x + 2) - 3x'], ['Fractions', 'x/3 + 2 = 6'], ['Variables on both sides', '5x - 7 = 2x + 8']];
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
      </div>`;
    const b = box(root.querySelector('#steps-box'), { lines: start || ['', ''] });
    root.__steps = b;
    root.querySelector('#steps-ex').addEventListener('change', ev => { const ex = EXAMPLES[Number(ev.target.value)]; if (ex) { b.set([ex[1], '']); ev.target.value = ''; const ins = root.querySelectorAll('.step-in'); if (ins[1]) ins[1].focus(); } });
    root.querySelector('#steps-clear').addEventListener('click', () => b.set(['', '']));
    root.querySelector('#steps-ask').addEventListener('click', () => {
      const ls = b.lines().filter(l => l.trim()), res = check(ls);
      if (!ls.length) return;
      const lines = ls.map((l, i) => `${i + 1}. ${l}   [${res[i].status === 'bad' ? 'Procademy: ' + res[i].msg : res[i].status === 'ok' || res[i].status === 'solved' ? 'checked: right' : res[i].status}]`).join('\n');
      if (window.TUTORUI) TUTORUI.open({ ask: `Here is my working, with Procademy's exact check of each line:\n${lines}\nHelp me understand any mistake.` });
    });
    if (code) history.replaceState(null, '', '#/steps');
    H.tutorCtx({ notes: 'The student is on the step checker page, checking their own working line by line.' });
  }

  window.STEPS = { check, parse, zeros, box, fromQuestion, page, EXAMPLES };
})();
