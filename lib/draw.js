/* Procademy's drawings: exact graphs, number lines, charts and fraction models, drawn right here.

   The tutor writes a short drawing block and this file turns it into a picture the learner can explore:
     ```graph              ```numberline          ```chart               ```fraction
     y = 2x + 1            -1 <= x < 4            box                    3/4
     y < -x + 4            jump 2 to -3 "-5"      values: 2, 4, 4, 9     circle 2/3
     point (1, 3) "A"      point 0                                       grid 35%
     ```                   ```                    ```                    ```
   Graphs zoom and drag, a tap on a curve reads off a point, and the key points (intercepts, turning
   points, where curves meet) are found and marked. Requests like "graph y = 2x + 1" are drawn straight
   from the question (see fromRequest), so a graph never depends on the AI getting it right. Nothing is
   sent anywhere, and there is no limit.

   Expressions are parsed here and never eval'd: numbers, x and y, + − × ÷ ^, implied multiplication
   (2x, 3(x + 1), x sin x), |x|, sqrt, sin, cos, tan, ln, log, pi and e. */
'use strict';
(function () {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const r1 = v => Math.round(v * 10) / 10;

  /* ---------- expressions ---------- */
  const FUNCS = {
    sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, sin: Math.sin, cos: Math.cos, tan: Math.tan,
    asin: Math.asin, acos: Math.acos, atan: Math.atan, arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan,
    sec: t => 1 / Math.cos(t), csc: t => 1 / Math.sin(t), cot: t => 1 / Math.tan(t),
    ln: Math.log, log: Math.log10, exp: Math.exp, floor: Math.floor, ceil: Math.ceil, round: Math.round,
  };
  const CONSTS = { pi: Math.PI, tau: 2 * Math.PI, e: Math.E };
  /* trig in degrees (a graph with a "degrees" line): exact at multiples of 30° and 45°, so sin 180° is 0, not 1.2e-16 */
  const R2 = Math.SQRT1_2, R3 = Math.sqrt(3) / 2;
  const SIN_AT = { 0: 0, 30: 0.5, 45: R2, 60: R3, 90: 1, 120: R3, 135: R2, 150: 0.5, 180: 0, 210: -0.5, 225: -R2, 240: -R3, 270: -1, 300: -R3, 315: -R2, 330: -0.5 };
  function sinD(d) { const r = ((d % 360) + 360) % 360; return Object.prototype.hasOwnProperty.call(SIN_AT, r) ? SIN_AT[r] : Math.sin(r * Math.PI / 180); }
  const cosD = d => sinD(d + 90), tanD = d => { const c = cosD(d); return c === 0 ? NaN : sinD(d) / c; };
  const toDeg = r => r * 180 / Math.PI;
  const DEG_FUNCS = { sin: sinD, cos: cosD, tan: tanD, sec: t => 1 / cosD(t), csc: t => 1 / sinD(t), cot: t => { const s = sinD(t); return s === 0 ? NaN : cosD(t) / s; },
    asin: t => toDeg(Math.asin(t)), acos: t => toDeg(Math.acos(t)), atan: t => toDeg(Math.atan(t)), arcsin: t => toDeg(Math.asin(t)), arccos: t => toDeg(Math.acos(t)), arctan: t => toDeg(Math.atan(t)) };
  let DEG = false;                  // set while a graph with a "degrees" line is read, so its trig works in degrees
  const NAMES = Object.keys(FUNCS).concat(Object.keys(CONSTS)).sort((a, b) => b.length - a.length);
  const SUPS = '⁰¹²³⁴⁵⁶⁷⁸⁹';

  /** the many ways people type math, made plain */
  function plain(s) {
    return String(s == null ? '' : s)
      .replace(/[−‒–—]/g, '-').replace(/[×·⋅∙✕]/g, '*').replace(/÷/g, '/').replace(/[   ]/g, ' ')
      .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, m => '^' + [...m].map(c => SUPS.indexOf(c)).join(''))
      .replace(/√/g, 'sqrt').replace(/π/g, 'pi').replace(/[≤⩽]/g, '<=').replace(/[≥⩾]/g, '>=')
      .replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  }
  function lex(src, vars, consts) {
    const s = plain(src).replace(/(\d),(?=\d{3}(?!\d))/g, '$1');
    const out = [];
    for (let i = 0; i < s.length;) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      let m = /^(?:\d+\.?\d*|\.\d+)/.exec(s.slice(i));
      if (m) { out.push({ t: 'n', v: parseFloat(m[0]) }); i += m[0].length; continue; }
      m = /^[a-z]+/i.exec(s.slice(i));
      if (m) { words(m[0].toLowerCase(), vars, consts).forEach(t => out.push(t)); i += m[0].length; continue; }
      if ('+-*/^()[]{}|!'.includes(c)) { out.push({ t: '([{'.includes(c) ? '(' : ')]}'.includes(c) ? ')' : c }); i++; continue; }
      throw new Error(`can’t read "${c}"`);
    }
    return out;
  }
  /** a run of letters: function names and constants first (sinx = sin x), then single-letter variables */
  function words(word, vars, consts) {
    const out = [];
    for (let i = 0; i < word.length;) {
      const name = NAMES.find(n => word.startsWith(n, i));
      if (name) { out.push(FUNCS[name] ? { t: 'f', v: name } : { t: 'n', v: CONSTS[name] }); i += name.length; continue; }
      const k = vars.indexOf(word[i]);
      if (k >= 0) { out.push({ t: 'v', v: k }); i++; continue; }
      if (consts && Object.prototype.hasOwnProperty.call(consts, word[i]) && typeof consts[word[i]] === 'function') { out.push({ t: 'f', v: word[i], fn: consts[word[i]] }); i++; continue; }   // a function the graph defines
      if (consts && Object.prototype.hasOwnProperty.call(consts, word[i])) { out.push({ t: 'n', v: consts[word[i]] }); i++; continue; }   // a slider's letter
      throw new Error(`unknown name "${word}"`);
    }
    return out;
  }
  function pow(b, e) {
    if (b < 0 && !Number.isInteger(e)) {                       // odd roots of negatives: (−8)^(1/3) = −2
      const inv = 1 / e, k = Math.round(inv);
      if (Math.abs(inv - k) < 1e-9 && k % 2) return -Math.pow(-b, e);
    }
    return Math.pow(b, e);
  }
  function fact(n) { if (n < 0 || !Number.isInteger(n) || n > 170) return NaN; let r = 1; for (let k = 2; k <= n; k++) r *= k; return r; }

  /** compile an expression to a function of (x, y). vars names the variables in order; consts gives
      letters a value (sliders: { a: 2 }). Throws on nonsense. */
  function compile(src, vars, consts) {
    vars = vars || ['x', 'y'];
    const tk = lex(src, vars, consts);
    if (!tk.length) throw new Error('nothing to read');
    let p = 0, bars = 0;
    const used = new Set(), deg = DEG;
    let userFn = false;
    const peek = () => tk[p];
    const starts = t => !!t && (t.t === 'n' || t.t === 'v' || t.t === 'f' || t.t === '(' || (t.t === '|' && bars === 0));
    function expr() {
      let a = term();
      while (peek() && (peek().t === '+' || peek().t === '-')) {
        const op = tk[p++].t, b = term(), l = a;
        a = op === '+' ? (x, y) => l(x, y) + b(x, y) : (x, y) => l(x, y) - b(x, y);
      }
      return a;
    }
    function term() {
      let a = unary();
      for (;;) {
        const t = peek();
        if (t && (t.t === '*' || t.t === '/')) { p++; const b = unary(), l = a; a = t.t === '*' ? (x, y) => l(x, y) * b(x, y) : (x, y) => l(x, y) / b(x, y); }
        else if (starts(t)) { const b = power(), l = a; a = (x, y) => l(x, y) * b(x, y); }      // 2x, 3(x + 1), x sin x
        else return a;
      }
    }
    function unary() {
      const t = peek();
      if (t && (t.t === '-' || t.t === '+')) { p++; const a = unary(); return t.t === '-' ? (x, y) => -a(x, y) : a; }
      return power();
    }
    function power() {
      const base = postfix();
      if (peek() && peek().t === '^') { p++; const e = unary(); return (x, y) => pow(base(x, y), e(x, y)); }
      return base;
    }
    function postfix() {
      let a = primary();
      while (peek() && peek().t === '!') { p++; const l = a; a = (x, y) => fact(l(x, y)); }
      return a;
    }
    function primary() {
      const t = tk[p++];
      if (!t) throw new Error('it ends too soon');
      if (t.t === 'n') { const v = t.v; return () => v; }
      if (t.t === 'v') { used.add(t.v); return t.v === 0 ? x => x : (x, y) => y; }
      if (t.t === '(') { const a = expr(); if (!peek() || tk[p++].t !== ')') throw new Error('a parenthesis isn’t closed'); return a; }
      if (t.t === '|') { bars++; const a = expr(); bars--; if (!peek() || tk[p++].t !== '|') throw new Error('an absolute value isn’t closed'); return (x, y) => Math.abs(a(x, y)); }
      if (t.t === 'f') {
        const fn = t.fn || (deg && DEG_FUNCS[t.v]) || FUNCS[t.v];
        if (t.fn) userFn = true;
        let arg;
        if (peek() && peek().t === '(') arg = primary();
        else {                                                  // sin 2x means sin(2x); sin x cos x is sin(x)·cos(x)
          arg = power();
          while (starts(peek()) && peek().t !== 'f' && peek().t !== '(') { const b = power(), l = arg; arg = (x, y) => l(x, y) * b(x, y); }
        }
        return (x, y) => fn(arg(x, y));
      }
      throw new Error('it has a stray ' + t.t);
    }
    const f = expr();
    if (p < tk.length) throw new Error('it has a stray ' + tk[p].t);
    f.uses = used; f.userFn = userFn;
    return f;
  }
  /** a plain number, which may be written as a fraction, a mixed number or an expression like 2pi */
  function num(s, consts) {
    s = plain(s).trim().replace(/%$/, '');
    const mixed = /^([-+]?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/.exec(s);
    if (mixed) return (mixed[1] === '-' ? -1 : 1) * (Number(mixed[2]) + Number(mixed[3]) / Number(mixed[4]));
    const f = compile(s, [], consts), v = f(0, 0);
    if (!isFinite(v)) throw new Error('not a number');
    return v;
  }
  const isNum = s => { try { num(s); return true; } catch (e) { return false; } };

  /* ---------- numbers for people ---------- */
  function fmt(v, step) {
    if (!isFinite(v)) return '';
    if (Math.abs(v) < 1e-10) v = 0;
    let dec = 3;
    if (step) dec = Math.max(0, Math.min(6, -Math.floor(Math.log10(step) + 1e-9) + (/^[25]/.test(String(step / Math.pow(10, Math.floor(Math.log10(step))))) && step < 1 ? 1 : 0)));
    let t = Number(v.toFixed(dec)).toString();
    if (/e/.test(t)) t = v.toPrecision(4);
    if (Math.abs(v) >= 10000 && !/e/.test(t)) t = Number(t).toLocaleString('en-US');
    return t.replace(/^-/, '−');
  }
  /** a value as a fraction when it is a simple one (0.75 → 3/4), else a tidy decimal */
  function fracText(v, maxDen) {
    if (!isFinite(v)) return '';
    if (Math.abs(v - Math.round(v)) < 1e-9) return fmt(Math.round(v));
    for (let d = 2; d <= (maxDen || 12); d++) {
      const n = Math.round(v * d);
      if (Math.abs(n / d - v) < 1e-9) return (n < 0 ? '−' : '') + Math.abs(n) + '/' + d;
    }
    return fmt(v);
  }
  /** a value snapped to a clean number when it is within rounding of one */
  function snap(v) {
    if (!isFinite(v)) return v;
    const k = Math.round(v * 1e6) / 1e6;
    return Math.abs(k - v) < 1e-7 ? k : v;
  }
  const pt = (x, y) => `(${fmt(snap(x))}, ${fmt(snap(y))})`;
  /** math as typed, made readable: − signs, superscripts, √ */
  function pretty(s) {
    return esc(plain(s).trim())
      .replace(/\^\(([^()]{1,8})\)/g, '<sup>$1</sup>').replace(/\^(-?[\w.]+)/g, '<sup>$1</sup>')
      .replace(/sqrt/g, '√').replace(/\bpi\b/g, 'π').replace(/&lt;=/g, '≤').replace(/&gt;=/g, '≥')
      .replace(/(\s|^|\(|=)-/g, '$1−').replace(/ - /g, ' − ').replace(/\*/g, '·');
  }
  function niceStep(span, target) {
    const raw = span / (target || 8), p10 = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p10;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p10;
  }

  /* ---------- reading a graph block ---------- */
  const PT_RE = /(?:\b([A-Z][0-9']{0,2})\s*=?\s*)?\(\s*([^(),]+?)\s*,\s*([^(),]+?)\s*\)/g;
  /** every (x, y) in a line, with labels written before them (A(1, 2) or A = (1, 2)) */
  function pointsIn(s, consts) {
    const out = [];
    for (const m of plain(s).matchAll(PT_RE)) {
      try { out.push({ x: num(m[2], consts), y: num(m[3], consts), label: m[1] || '' }); } catch (e) { /* (x, y) in words */ }
    }
    return out;
  }
  const QUOTE_RE = /\s*["']([^"']{1,40})["']\s*$/;
  /** the domain written after a function: y = 2x + 1 for -2 <= x <= 3 (also ", x >= 0" or {x > 0}) */
  function domainOf(s) {
    const m = /^(.*?)(?:\s*,\s*|\s+(?:for|when|if|where|on)\s+|\s*\{\s*)((?:[^{}]*?)\bx\b(?:[^{}]*?)(?:<|>)(?:[^{}]*?))\}?\s*$/i.exec(s);
    if (!m) return null;
    const d = m[2].replace(/\s+/g, ' ').trim();
    let r = /^(.+?)\s*(<=|<)\s*x\s*(<=|<)\s*(.+)$/.exec(d);
    try {
      if (r) return { rest: m[1], lo: num(r[1]), hi: num(r[4]), loIn: r[2] === '<=', hiIn: r[3] === '<=' };
      r = /^x\s*(<=|>=|<|>)\s*(.+)$/.exec(d);
      if (r) { const v = num(r[2]); return r[1][0] === '>' ? { rest: m[1], lo: v, hi: Infinity, loIn: r[1] === '>=' } : { rest: m[1], lo: -Infinity, hi: v, hiIn: r[1] === '<=' }; }
      r = /^(.+?)\s*(<=|>=|<|>)\s*x$/.exec(d);
      if (r) { const v = num(r[1]); return r[2][0] === '<' ? { rest: m[1], lo: v, hi: Infinity, loIn: r[2] === '<=' } : { rest: m[1], lo: -Infinity, hi: v, hiIn: r[2] === '>=' }; }
    } catch (e) { return null; }
    return null;
  }
  const flip = op => ({ '<': '>', '>': '<', '<=': '>=', '>=': '<=' }[op] || op);
  /** one equation or inequality in x and y, as something drawable */
  function relation(src, consts) {
    const s = plain(src).trim();
    let m = /^([a-z])\s*\(\s*([a-z])\s*\)\s*(<=|>=|<|>|=)\s*(.+)$/i.exec(s);     // f(x) = …, h(t) = …
    if (m) {
      const v = m[2].toLowerCase(), f = compile(m[4], [v], consts);
      return { type: 'fn', f: x => f(x, 0), op: m[3], xname: v === 'x' ? '' : v, yname: m[1] + '(' + v + ')' };
    }
    const ops = [...s.matchAll(/<=|>=|<|>|=/g)];
    if (ops.length !== 1) return null;
    const op = ops[0][0], L = s.slice(0, ops[0].index), R = s.slice(ops[0].index + op.length);
    const fl = compile(L, undefined, consts), fr = compile(R, undefined, consts);
    const F = (x, y) => fl(x, y) - fr(x, y);
    const usesX = fl.uses.has(0) || fr.uses.has(0), usesY = fl.uses.has(1) || fr.uses.has(1);
    const xs = [-7.3, -2.1, -0.6, 0.4, 1.7, 3.9, 6.2];
    if (!usesY) {
      if (!usesX) return null;
      const c0 = F(0, 0), c1 = F(1, 0), c2 = F(2, 0);                         // x = 3, 2x > -4
      if (!isFinite(c0) || Math.abs(c2 - 2 * c1 + c0) > 1e-9 || Math.abs(c1 - c0) < 1e-12) return null;
      return { type: 'vline', x: snap(-c0 / (c1 - c0)), op: c1 - c0 < 0 ? flip(op) : op };
    }
    // linear in y (y = …, 2x + 3y = 6, xy = 4): solve for y, which draws exactly; otherwise trace the curve
    const lin = xs.every(x => { const a = F(x, 0), b = F(x, 1), c = F(x, 2); return !isFinite(a) || !isFinite(b) || Math.abs(c - 2 * b + a) <= 1e-9 * (1 + Math.abs(a) + Math.abs(b)); });
    const bs = xs.map(x => F(x, 1) - F(x, 0)).filter(isFinite);
    if (lin && bs.length && (op === '=' || bs.every(b => b > 0) || bs.every(b => b < 0))) {
      return { type: 'fn', f: x => { const a = F(x, 0); return -a / (F(x, 1) - a); }, op: bs[0] < 0 ? flip(op) : op };
    }
    return { type: 'implicit', F, op };
  }
  const COLORS = ['vz1', 'vz2', 'vz3', 'vz4', 'vz5', 'vz6'];
  const COLOR_WORDS = { blue: 'vz1', red: 'vz2', green: 'vz3', purple: 'vz4', orange: 'vz5', black: 'vz6' };

  /** a slider: a letter set to a number, with an optional range — a = 2, a = 2 {0 to 5}, a = 2 (from -1 to 1) */
  const PARAM_RE = /^([a-df-wz])\s*=\s*([-+]?\d*\.?\d+)(?:\s*[,{[(]?\s*(?:from\s+)?([-+]?\d*\.?\d+)\s*(?:to|\.\.|…|,)\s*([-+]?\d*\.?\d+)\s*[}\])]?)?$/;
  function paramOf(line) {
    const m = PARAM_RE.exec(plain(line).replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').replace(/\s*\(?slider\)?\s*$/i, '').trim());
    if (!m) return null;
    const value = Number(m[2]);
    let min = m[3] != null ? Number(m[3]) : null, max = m[4] != null ? Number(m[4]) : null;
    if (min == null || !(max > min)) { const r = Math.max(10, Math.ceil(Math.abs(value) * 2)); min = -r; max = r; }
    const span = max - min, step = span <= 2 ? 0.01 : span <= 50 ? 0.1 : niceStep(span, 200);
    return { name: m[1], value, min, max, step, custom: m[3] != null };
  }
  /** a graph block's text → { items, x, y, title, params, … }. Lines it cannot read are skipped and counted.
      overrides gives sliders their current values. */
  const DEG_LINE = /^\s*(?:angles?\s*(?:in|:)?\s*)?(deg(?:ree)?s?|rad(?:ian)?s?)(?:\s+mode)?\s*$/i;
  const GRID_LINE = /^\s*(?:grid\s*[:=]?\s*(off|none|light|coarse|normal|on|dense|fine)|(no)\s+grid)\s*$/i;
  const DEF_RE = /^\s*([a-df-wz])\s*\(\s*([a-z])\s*\)\s*=\s*(.+)$/i;
  /** a graph block's text → { items, x, y, title, params, … }. Lines it cannot read are skipped and counted.
      overrides gives sliders their current values. A "degrees" line makes its trig work in degrees. */
  function parseGraph(text, overrides) {
    const was = DEG;
    DEG = String(text || '').split(/\n|;/).some(l => { const m = DEG_LINE.exec(plain(l)); return m && /^d/i.test(m[1]); });
    try { return readGraph(text, overrides, DEG); } finally { DEG = was; }
  }
  /** the parts of a list split at its top-level commas: "a, f(1, 2), b" → [a, f(1, 2), b] */
  function splitTop(s) {
    const out = []; let depth = 0, at = 0;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if ('([{'.includes(c)) depth++; else if (')]}'.includes(c)) depth--;
      else if (c === ',' && depth === 0) { out.push(s.slice(at, i).trim()); at = i + 1; }
    }
    out.push(s.slice(at).trim());
    return out;
  }
  const inDom = (d, x) => !d || ((x > d.lo || (d.loIn !== false && Math.abs(x - d.lo) < 1e-9)) && (x < d.hi || (d.hiIn !== false && Math.abs(x - d.hi) < 1e-9)));
  /** a function in pieces, written {x < 0: −x, x ≥ 0: x²} or {−x if x < 0, x²}; a last piece with no condition is "otherwise" */
  function piecewise(src, consts) {
    const parts = splitTop(src), pieces = [];
    for (let k = 0; k < parts.length; k++) {
      const p = parts[k];
      let m = /^(.+?)\s*:\s*(.+)$/.exec(p), cond, expr;
      if (m && /[<>]/.test(m[1])) { cond = m[1]; expr = m[2]; }
      else if ((m = /^(.+?)\s+(?:if|for|when)\s+(.+)$/i.exec(p))) { expr = m[1]; cond = m[2]; }
      else if (k === parts.length - 1 && k > 0 && !/[<>=:]/.test(p)) expr = p;
      else return null;
      const dom = cond ? domainOf('0 for ' + cond) : null;
      if (cond && !dom) return null;
      const f = compile(expr, undefined, consts);
      if (f.uses.has(1)) return null;
      pieces.push({ f: x => f(x, 0), dom, text: expr.trim(), cond: cond ? cond.trim() : '' });
    }
    if (pieces.length < 2) return null;
    const owner = x => pieces.findIndex(pc => inDom(pc.dom, x));
    return { type: 'fn', op: '=', pieces, owner, f: x => { const k = owner(x); return k < 0 ? NaN : pieces[k].f(x); } };
  }
  /** t (or θ) from lo to hi, written after a curve: "for 0 ≤ t ≤ 2π" */
  function tRange(s, deg) {
    const m = /^(.*?)\s+for\s+(.+?)\s*(<=|<)\s*t\s*(<=|<)\s*(.+)$/i.exec(s);
    const full = deg ? 360 : 2 * Math.PI;
    if (!m) return { rest: s, lo: 0, hi: full };
    const lo = num(m[2]), hi = num(m[5]);
    return hi > lo && hi - lo <= 200 * full ? { rest: m[1], lo, hi } : { rest: m[1], lo: 0, hi: full };
  }
  /** a polar or parametric curve, as points along it: [x, y, t] */
  function curvePts(xy, lo, hi) {
    const n = 720, out = [];
    for (let i = 0; i <= n; i++) { const t = lo + (hi - lo) * i / n, q = xy(t); out.push([q[0], q[1], t]); }
    return out;
  }
  /** a value as a fraction or whole number when it is one (to within rounding), else ≈ a decimal */
  function valText(v) {
    if (!isFinite(v)) return 'is undefined';
    if (Math.abs(v - Math.round(v)) < 1e-9) return '= ' + fmt(Math.round(v));
    let h0 = 0, h1 = 1, k0 = 1, k1 = 0, y = Math.abs(v);
    for (let i = 0; i < 20; i++) {
      const w = Math.floor(y);
      [h0, h1] = [h1, w * h1 + h0]; [k0, k1] = [k1, w * k1 + k0];
      if (k1 > 1000) break;
      if (Math.abs(h1 / k1 - Math.abs(v)) < 1e-9 * Math.max(1, Math.abs(v))) return '= ' + (v < 0 ? '−' : '') + h1 + '/' + k1;
      const f = y - w; if (f < 1e-12) break; y = 1 / f;
    }
    return '≈ ' + String(Number(v.toPrecision(6))).replace('-', '−');
  }
  function readGraph(text, overrides, deg) {
    const g = { kind: 'graph', items: [], x: null, y: null, title: '', xlabel: '', ylabel: '', grid: true, density: null, deg, equal: false, skipped: 0, params: {} };
    const consts = {};
    String(text || '').split(/\n/).forEach(l => { const p = paramOf(l); if (p) { if (overrides && overrides[p.name] != null) p.value = overrides[p.name]; g.params[p.name] = p; consts[p.name] = p.value; } });
    // functions the graph defines, f(x) = …, can be used by name: f(3), g(x) = f(x) + 1
    const defs = {};
    let depth = 0;
    String(text || '').split(/\n|;/).forEach(l => {
      const m = DEF_RE.exec(plain(l).trim());
      if (!m || /[<>]/.test(m[3]) || /=/.test(m[3])) return;
      const name = m[1].toLowerCase();
      if (defs[name]) return;
      defs[name] = { v: m[2].toLowerCase(), body: m[3], f: null };
      consts[name] = u => { const d = defs[name]; if (!d.f || depth > 40) return NaN; depth++; try { return d.f(u); } finally { depth--; } };
    });
    Object.keys(defs).forEach(name => {
      const d = defs[name];
      try {
        const pw = /^\{(.+)\}$/.exec(d.body.trim());
        if (pw && d.v === 'x') { const it = piecewise(pw[1], consts); if (it) d.f = it.f; return; }
        const dom = d.v === 'x' ? domainOf(d.body) : null, c = compile(dom ? dom.rest : d.body, [d.v], consts);
        d.f = u => (inDom(dom, u) ? c(u, 0) : NaN);
      } catch (e) { /* the line itself says what is wrong */ }
    });
    const named = Object.keys(defs).length > 0;
    let ci = 0;
    const nextColor = () => COLORS[ci++ % COLORS.length];
    const R_NUM = '([-+]?[^\\s,\\]]+?)';
    const one = (raw, src) => {
      let line = plain(raw).replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').replace(/`/g, '').trim().replace(/[.,]$/, '');
      if (!line || /^(#|\/\/)/.test(line) || paramOf(line)) return;
      let m, label = '', color = null;
      if (DEG_LINE.test(line)) return;
      if ((m = GRID_LINE.exec(line))) { const w = (m[1] || 'off').toLowerCase(); g.density = { none: 'off', coarse: 'light', on: 'normal', fine: 'dense' }[w] || w; if (g.density === 'off') g.grid = false; return; }
      if ((m = /^title\s*[:=]\s*(.+)$/i.exec(line))) { g.title = m[1].replace(/^["']|["']$/g, ''); return; }
      if ((m = /^(x|y)[- ]?(?:axis\s*)?(?:label|name|title)\s*[:=]\s*(.+)$/i.exec(line))) { g[m[1].toLowerCase() + 'label'] = m[2].replace(/^["']|["']$/g, ''); return; }
      if (/^(equal|same)(\s+(scale|units|axes))?$/i.test(line)) { g.equal = true; return; }
      // windows: "x from -10 to 10", "x: -5 to 5", "x range [-5, 5]", "window x -10 10, y -5 5"
      const win = [...line.matchAll(new RegExp(`\\b(x|y)[- ]?(?:axis|values?)?\\s*(?:range|window|from|between|goes from|:|=)?\\s*\\[?\\s*${R_NUM}\\s*(?:to|\\.\\.|…|,|and)\\s*${R_NUM}\\s*\\]?(?=$|[,;]|\\s+(?:and\\s+)?[xy]\\b)`, 'gi'))];
      if (win.length && /^(?:window|view|range|axes|[xy])\b/i.test(line) && win.every(w => isNum(w[2]) && isNum(w[3])) && !/[<>]/.test(line) && !(/=/.test(line) && !/^\s*(window|view)/i.test(line) && !/^[xy]\s*[:=]\s*\[?[-+\d.]+\s*(to|\.\.|,)/i.test(line))) {
        win.forEach(w => { const a = num(w[2]), b = num(w[3]); if (b > a) g[w[1].toLowerCase()] = [a, b]; });
        return;
      }
      if ((m = QUOTE_RE.exec(line))) { label = m[1]; line = line.slice(0, m.index).trim(); }
      if ((m = /\s*(?:\[\s*(blue|red|green|purple|orange|black)\s*\]|\b(?:in\s+|color\s*[:=]?\s*)?(blue|red|green|purple|orange|black))\s*$/i.exec(line)) && line.slice(0, m.index).trim()) {
        color = COLOR_WORDS[(m[1] || m[2]).toLowerCase()]; line = line.slice(0, m.index).trim();
      }
      const kw = (m = /^([a-z]+(?:\s+(?:segment|through))?)\b/i.exec(line)) ? m[1].toLowerCase() : '';
      const pts = pointsIn(line, consts);
      const col = () => color || nextColor();
      try {
        if (/^(segment|line segment|seg|side|edge)$/.test(kw) && pts.length >= 2) { g.items.push({ type: 'seg', a: pts[0], b: pts[1], label, color: col() }); return; }
        if (/^(arrow|vector)$/.test(kw) && pts.length >= 2) { g.items.push({ type: 'seg', a: pts[0], b: pts[1], arrow: true, label, color: col() }); return; }
        if (/^(line|line through|ray)$/.test(kw) && pts.length >= 2) { g.items.push({ type: 'line', a: pts[0], b: pts[1], ray: kw === 'ray', label, color: col() }); return; }
        if (/^(polygon|triangle|quadrilateral|rectangle|square|shape|trapezoid|parallelogram|rhombus|kite|pentagon|hexagon|octagon)$/.test(kw) && pts.length >= 2) {
          const ps = pts.length === 2 && /rectangle|square/.test(kw) ? [pts[0], { x: pts[1].x, y: pts[0].y, label: '' }, pts[1], { x: pts[0].x, y: pts[1].y, label: '' }] : pts;
          g.items.push({ type: 'poly', pts: ps, label, color: col() }); g.equal = true; return;
        }
        if (/^circle/i.test(line)) {
          const c = pts[0], rm = /(?:radius|r)?\s*[:=]?\s*([-+]?[\d.]+(?:\s*\/\s*\d+)?|sqrt\s*\(?\s*\d+\s*\)?)\s*$/i.exec(line.replace(PT_RE, ' '));
          if (c && rm) { const r = num(rm[1]); if (r > 0) { g.items.push({ type: 'circle', c, r, label, color: col() }); g.equal = true; return; } }
        }
        if (/^(points?|plot|dots?|coordinates)$/.test(kw) || (pts.length && plain(line).replace(PT_RE, '').replace(/\b(and|at|points?|plot|dots?)\b|[,\s]/gi, '') === '')) {
          if (pts.length) { const c = col(); pts.forEach((q, k) => g.items.push({ type: 'point', x: q.x, y: q.y, label: q.label || (pts.length === 1 ? label : ''), color: c })); return; }
        }
        if (pts.length === 1 && /^\(/.test(line) && !/[=<>]/.test(line)) {                     // "(2, 5) vertex"
          g.items.push({ type: 'point', x: pts[0].x, y: pts[0].y, label: label || line.replace(PT_RE, '').trim().slice(0, 30), color: col() }); return;
        }
        // polar curves: r = 2 sin(3θ), r = 1 + cos θ for 0 ≤ θ ≤ 4π
        const th = t => t.replace(/θ|theta/gi, 't');
        if ((m = /^r\s*(?:\(\s*(?:θ|theta|t)\s*\))?\s*=\s*(.+)$/i.exec(line)) && /θ|theta/i.test(m[1]) && !/[<>]/.test(m[1])) {
          const r0 = tRange(th(m[1]), deg), f = compile(r0.rest, ['t'], consts), k = deg ? Math.PI / 180 : 1;
          g.items.push({ type: 'curve', kind: 'polar', text: line, label, color: col(), pts: curvePts(t => { const r = f(t, 0); return [r * Math.cos(t * k), r * Math.sin(t * k)]; }, r0.lo, r0.hi) });
          g.equal = true; return;
        }
        // parametric curves: (3 cos t, 2 sin t), x = cos t, y = sin t, for 0 ≤ t ≤ 2π
        {
          const tl = th(line), r0 = tRange(tl, deg), pm = /^\((.+)\)$/.exec(r0.rest.trim()), xm = /^x\s*(?:\(\s*t\s*\))?\s*=\s*(.+?)\s*,\s*y\s*(?:\(\s*t\s*\))?\s*=\s*(.+)$/i.exec(r0.rest.trim());
          const two = pm ? splitTop(pm[1]) : xm ? [xm[1], xm[2]] : null;
          if (two && two.length === 2 && /t/i.test(two.join(' ').replace(/sqrt|tan|cot|atan|arctan|tau|pi|exp|ln|log/gi, ''))) {
            let fx = null, fy = null;
            try { fx = compile(two[0], ['t'], consts); fy = compile(two[1], ['t'], consts); } catch (e) { fx = null; }
            if (fx && fy && (fx.uses.has(0) || fy.uses.has(0))) {
              g.items.push({ type: 'curve', kind: 'param', text: line, label, color: col(), pts: curvePts(t => [fx(t, 0), fy(t, 0)], r0.lo, r0.hi) });
              g.equal = true; return;
            }
          }
        }
        // equations and inequalities, with an optional domain
        let body = line.replace(/^(?:graph|plot|draw|line|curve|function|parabola|equation|inequality)\s*[:=]?\s+/i, '');
        // a value of a function the graph defines: f(3), f(2) + g(1), f(3) = ?
        if (named && !/[<>]/.test(body)) {
          const lhs = body.replace(/\s*=\s*\??\s*$/, '');
          let f = null;
          if (!/=/.test(lhs)) { try { f = compile(lhs, undefined, consts); } catch (e) { f = null; } }
          if (f && f.userFn && !f.uses.size) {
            const v = f(0, 0), vt = valText(v), at = /^([a-z])\s*\(\s*([^()]+?)\s*\)$/i.exec(lhs);
            g.items.push({ type: 'value', text: lhs, value: v, show: vt, src });
            if (at && isFinite(v)) { try { const x = num(at[2], consts); g.items.push({ type: 'point', x, y: v, label: `${at[1]}(${at[2].trim().replace(/-/g, '−')}) ${vt}`, color, of: at[1].toLowerCase(), noCoords: true, src }); } catch (e) { /* f(a) with a slider's letter: the value is enough */ } }
            return;
          }
        }
        // a function in pieces: y = {x < 0: −x, x ≥ 0: x²}
        const pw = /^(y|[a-z]\s*\(\s*x\s*\))\s*=\s*\{(.+)\}$/i.exec(body);
        if (pw) {
          const it = piecewise(pw[2], consts);
          if (it) { it.text = body; it.label = label; it.color = col(); if (pw[1].length > 1) { it.yname = pw[1].replace(/\s+/g, ''); } it.src = src; g.items.push(it); return; }
        }
        const dom = domainOf(body);
        if (dom) body = dom.rest;
        let rel = /[=<>]/.test(body) ? relation(body, consts) : null;
        if (!rel && !/[=<>]/.test(body)) { const f = compile(body, undefined, consts); if (f.uses.has(0) && !f.uses.has(1)) rel = { type: 'fn', f: x => f(x, 0), op: '=', bare: true }; }
        if (!rel) { g.skipped++; return; }
        rel.text = rel.bare ? 'y = ' + body : body;
        rel.label = label; rel.color = col(); rel.src = src;
        if (dom && rel.type === 'fn') rel.domain = dom;
        g.items.push(rel);
      } catch (e) { g.skipped++; }
    };
    String(text || '').split('\n').forEach((rawLine, src) => rawLine.split(';').forEach(raw => {
      const n0 = g.items.length;
      one(raw, src);
      for (let k = n0; k < g.items.length; k++) if (g.items[k].src == null) g.items[k].src = src;      // which line drew it
    }));
    g.items.forEach(it => { if (it.type === 'fn' && it.xname && !g.xname) { g.xname = it.xname; g.yname = it.yname; } });
    // a value's point takes its function's color
    g.items.forEach(it => { if (it.of && !it.color) { const f = g.items.find(q => q.type === 'fn' && q.yname && q.yname.toLowerCase().startsWith(it.of + '(')); it.color = f ? f.color : nextColor(); } });
    return g;
  }

  /* ---------- the window a graph opens with ---------- */
  const W = 480, H = 360;
  function defaultView(g) {
    const xs = [], ys = [];
    const add = (x, y) => { if (isFinite(x)) xs.push(x); if (isFinite(y)) ys.push(y); };
    g.items.forEach(it => {
      if (it.type === 'point') add(it.x, it.y);
      else if (it.type === 'seg' || it.type === 'line') { add(it.a.x, it.a.y); add(it.b.x, it.b.y); }
      else if (it.type === 'poly') it.pts.forEach(q => add(q.x, q.y));
      else if (it.type === 'circle') { add(it.c.x - it.r, it.c.y - it.r); add(it.c.x + it.r, it.c.y + it.r); }
      else if (it.type === 'vline') add(it.x, NaN);
      else if (it.type === 'fn' && it.domain) { add(isFinite(it.domain.lo) ? it.domain.lo : NaN, NaN); add(isFinite(it.domain.hi) ? it.domain.hi : NaN, NaN); }
      else if (it.type === 'curve') {
        const ok = it.pts.filter(q => isFinite(q[0]) && isFinite(q[1]) && Math.abs(q[0]) < 1e6 && Math.abs(q[1]) < 1e6);
        ok.forEach(q => add(q[0], q[1]));
      }
    });
    const degTrig = g.deg && !g.x && g.items.some(it => it.type === 'fn' && /sin|cos|tan|sec|csc|cot/i.test(it.text || ''));
    const fns = g.items.filter(it => it.type === 'fn');
    let x0, x1, y0, y1;
    if (g.x) [x0, x1] = g.x;
    else if (degTrig) { x0 = -360; x1 = 360; }                  // a trig graph in degrees: two turns either way
    else if (xs.length) {
      let lo = Math.min(...xs), hi = Math.max(...xs);
      if (lo > 0 && lo < (hi - lo) * 1.5) lo = 0;
      if (hi < 0 && -hi < (hi - lo) * 1.5) hi = 0;
      const pad = Math.max((hi - lo) * 0.15, 1);
      x0 = lo - pad; x1 = hi + pad;
      if (fns.length && !g.items.some(it => it.type === 'fn' && it.domain)) { x0 = Math.min(x0, -10); x1 = Math.max(x1, 10); }
    } else { x0 = -10; x1 = 10; }
    if (g.y) [y0, y1] = g.y;
    else {
      // the y window: the points, plus where the functions actually go in this x window
      const fy = [];
      fns.forEach(it => { for (let i = 0; i <= 200; i++) { const x = x0 + (x1 - x0) * i / 200; if (it.domain && (x < it.domain.lo || x > it.domain.hi)) continue; const y = it.f(x); if (isFinite(y)) fy.push(y); } });
      let lo, hi;
      const sq = (x1 - x0) * H / W;                              // the y span that makes units square
      if (fns.length && !degTrig) {
        // square units around the origin (or the points), unless that would hide something
        const mid = ys.length && (Math.max(...ys) > sq / 2 - sq * 0.08 || Math.min(...ys) < -sq / 2 + sq * 0.08) ? (Math.max(...ys) + Math.min(...ys)) / 2 : 0;
        lo = mid - sq / 2; hi = mid + sq / 2;
        const inside = fy.filter(y => y >= lo && y <= hi).length;
        if ((fy.length && inside < fy.length * 0.35) || ys.some(y => y < lo + sq * 0.05 || y > hi - sq * 0.05)) { lo = null; }
      }
      if (lo == null || hi == null) {
        const all = ys.concat(fy.length ? trimmed(fy) : []);
        if (!all.length) { lo = -sq / 2; hi = sq / 2; }
        else {
          lo = Math.min(...all); hi = Math.max(...all);
          if (lo > 0 && lo < (hi - lo) * 1.5) lo = 0;
          if (hi < 0 && -hi < (hi - lo) * 1.5) hi = 0;
          const pad = Math.max((hi - lo) * 0.15, 1);
          lo -= pad; hi += pad;
        }
      }
      y0 = lo; y1 = hi;
    }
    if (!(x1 > x0)) { x0 -= 5; x1 += 5; }
    if (!(y1 > y0)) { y0 -= 5; y1 += 5; }
    // shapes look right only with square units: widen whichever way is short
    if (g.equal && !g.x && !g.y) {
      const ux = (x1 - x0) / W, uy = (y1 - y0) / H;
      if (ux > uy) { const c = (y0 + y1) / 2, h = ux * H / 2; y0 = c - h; y1 = c + h; }
      else { const c = (x0 + x1) / 2, w = uy * W / 2; x0 = c - w; x1 = c + w; }
    }
    return { x0, x1, y0, y1 };
  }
  /** the middle 90% of a list of values, so an asymptote does not stretch the window */
  function trimmed(v) {
    const s = v.slice().sort((a, b) => a - b), k = Math.floor(s.length * 0.05);
    return k ? s.slice(k, s.length - k) : s;
  }

  /* ---------- key points: intercepts, turning points and where curves meet ---------- */
  function roots(h, lo, hi, n) {
    const out = [];
    n = n || 600;
    let px = lo, pv = h(lo);
    for (let i = 1; i <= n; i++) {
      const x = lo + (hi - lo) * i / n, v = h(x);
      if (isFinite(pv) && isFinite(v)) {
        if (pv === 0) out.push(px);
        else if (pv * v < 0) {
          let a = px, b = x, fa = pv;
          for (let k = 0; k < 60; k++) { const m = (a + b) / 2, fm = h(m); if (!isFinite(fm)) break; if (fa * fm <= 0) b = m; else { a = m; fa = fm; } }
          const r = (a + b) / 2;
          if (Math.abs(h(r)) < 1e-6 * (1 + Math.abs(pv) + Math.abs(v))) out.push(r);          // a sign change through a pole is not a root
        }
      }
      px = x; pv = v;
    }
    if (isFinite(pv) && pv === 0) out.push(px);
    // a curve that only touches zero (y = x², y = (x − 2)²)
    turning(h, lo, hi, n).forEach(t => { if (Math.abs(h(t.x)) < 1e-9 && !out.some(r => Math.abs(r - t.x) < (hi - lo) / n)) out.push(t.x); });
    return out.map(snap).filter((r, i, a) => a.findIndex(q => Math.abs(q - r) < (hi - lo) / n) === i);
  }
  function turning(f, lo, hi, n) {
    const out = [];
    n = n || 600;
    const dx = (hi - lo) / n;
    const ys = []; for (let i = 0; i <= n; i++) ys.push(f(lo + dx * i));
    for (let i = 1; i < n; i++) {
      const a = ys[i - 1], b = ys[i], c = ys[i + 1];
      if (![a, b, c].every(isFinite)) continue;
      const max = b > a && b >= c, min = b < a && b <= c;
      if (!max && !min) continue;
      let l = lo + dx * (i - 1), r = lo + dx * (i + 1);
      for (let k = 0; k < 80; k++) {
        const m1 = l + (r - l) / 3, m2 = r - (r - l) / 3;
        if (max ? f(m1) < f(m2) : f(m1) > f(m2)) l = m1; else r = m2;
      }
      let x = snap((l + r) / 2);
      // a flat top or bottom can't be pinned closer than about 1e-7 by its values, so try the tidy numbers nearby
      const fx = f(x);
      for (let d = 0; d <= 4; d++) { const c2 = Number(x.toFixed(d)), fc = f(c2); if (Math.abs(c2 - x) < dx && isFinite(fc) && (max ? fc >= fx - 1e-12 * (1 + Math.abs(fx)) : fc <= fx + 1e-12 * (1 + Math.abs(fx)))) { x = c2; break; } }
      const y = f(x);
      if (isFinite(y) && Math.abs(c - a) < Math.abs(b) * 10 + 10 * dx * 1e3) out.push({ x, y: snap(y), kind: max ? 'maximum' : 'minimum' });
    }
    return out;
  }
  function inDomain(it, x) { return !it.domain || ((x > it.domain.lo || (it.domain.loIn !== false && Math.abs(x - it.domain.lo) < 1e-9)) && (x < it.domain.hi || (it.domain.hiIn !== false && Math.abs(x - it.domain.hi) < 1e-9))); }
  function keyPoints(g, v, hidden) {
    const fns = g.items.filter((it, i) => it.type === 'fn' && !(hidden && hidden.has(i)));
    const out = [];
    const push = (x, y, name) => {
      if (!isFinite(x) || !isFinite(y) || x < v.x0 || x > v.x1 || y < v.y0 || y > v.y1) return;
      const tol = (v.x1 - v.x0) / 300;
      const same = out.find(q => Math.abs(q.x - x) < tol && Math.abs(q.y - y) < (v.y1 - v.y0) / 300);
      if (same) { if (!same.name.includes(name)) same.name += ' · ' + name; return; }
      out.push({ x: snap(x), y: snap(y), name });
    };
    fns.forEach(it => {
      const f = x => (inDomain(it, x) ? it.f(x) : NaN);
      const lo = Math.max(v.x0, it.domain ? it.domain.lo : -Infinity), hi = Math.min(v.x1, it.domain ? it.domain.hi : Infinity);
      if (!(hi > lo)) return;
      if (0 >= lo && 0 <= hi) push(0, f(0), 'y-intercept');
      roots(f, lo, hi).slice(0, 6).forEach(x => push(x, 0, 'x-intercept'));
      const joins = it.pieces ? it.pieces.flatMap(pc => (pc.dom ? [pc.dom.lo, pc.dom.hi] : [])).filter(isFinite) : [];
      const tp = turning(f, lo, hi).filter(t => !joins.some(j => Math.abs(j - t.x) < (hi - lo) / 200));
      if (tp.length <= 4) tp.forEach(t => push(t.x, t.y, t.kind));
    });
    for (let i = 0; i < fns.length; i++) for (let j = i + 1; j < fns.length; j++) {
      const a = fns[i], b = fns[j];
      const h = x => (inDomain(a, x) && inDomain(b, x) ? a.f(x) - b.f(x) : NaN);
      roots(h, v.x0, v.x1).slice(0, 6).forEach(x => push(x, a.f(x), 'intersection'));
    }
    return out.slice(0, 16);
  }

  /* ---------- drawing a graph ---------- */
  let uid = 0;
  const TXT = 'font-size:12.5px;fill:var(--ink);paint-order:stroke;stroke:var(--surface);stroke-width:3.5px;stroke-linejoin:round';
  const col = c => `var(--${c || 'vz1'})`;
  function graphSvg(g, v, hidden, opts) {
    opts = opts || {};
    const { x0, x1, y0, y1 } = v;
    const sx = W / (x1 - x0), sy = H / (y1 - y0);
    const px = x => (x - x0) * sx, py = y => H - (y - y0) * sy;
    const id = 'vzc' + (++uid);
    const out = [];
    const shown = (it, i) => !(hidden && hidden.has(i));
    out.push(`<rect width="${W}" height="${H}" style="fill:var(--surface)"/>`);
    // grid and axes: a page's grid setting (off, light, normal or dense), else the block's own
    const dens = (opts.state && opts.state.grid) || (g.grid === false ? 'off' : g.density) || 'normal';
    const per = { light: [86, 76], dense: [24, 22] }[dens] || [52, 46];
    const xs = niceStep(x1 - x0, W / per[0]), ys = niceStep(y1 - y0, H / per[1]);
    const grid = [], minor = [];
    for (let k = Math.ceil(x0 / xs); k * xs <= x1; k++) { const X = r1(px(k * xs)); (k ? grid : []).push(`M${X} 0V${H}`); }
    for (let k = Math.ceil(y0 / ys); k * ys <= y1; k++) { const Y = r1(py(k * ys)); (k ? grid : []).push(`M0 ${Y}H${W}`); }
    for (let k = Math.ceil(x0 / (xs / 5)); k * xs / 5 <= x1; k++) if (k % 5) minor.push(`M${r1(px(k * xs / 5))} 0V${H}`);
    for (let k = Math.ceil(y0 / (ys / 5)); k * ys / 5 <= y1; k++) if (k % 5) minor.push(`M0 ${r1(py(k * ys / 5))}H${W}`);
    if (dens !== 'off') {
      if (minor.length < 600 && dens !== 'light') out.push(`<path d="${minor.join('')}" style="stroke:var(--line);stroke-width:.6;opacity:.55"/>`);
      out.push(`<path d="${grid.join('')}" style="stroke:var(--line-strong);stroke-width:1;opacity:.8"/>`);
    }
    const ax = Math.max(0, Math.min(W, px(0))), ay = Math.max(0, Math.min(H, py(0)));
    out.push(`<path d="M0 ${r1(ay)}H${W}M${r1(ax)} 0V${H}" style="stroke:var(--ink);stroke-width:1.5;opacity:.75"/>`);
    out.push(`<path d="M${W} ${r1(ay)}l-8 -4v8zM${r1(ax)} 0l-4 8h8z" style="fill:var(--ink);opacity:.75"/>`);
    // what is drawn is clipped to the window
    out.push(`<defs><clipPath id="${id}"><rect width="${W}" height="${H}"/></clipPath></defs><g clip-path="url(#${id})">`);
    const items = g.items.map((it, i) => ({ it, i })).filter(({ it, i }) => shown(it, i));
    const dash = op => (op === '<' || op === '>') ? 'stroke-dasharray:8 6;' : '';
    // shading first, so lines sit on top
    items.forEach(({ it }) => {
      if (it.type === 'fn' && it.op !== '=') {
        runs(it, x0, x1, px, py).forEach(run => {
          const edge = it.op[0] === '>' ? -20 : H + 20;
          out.push(`<path d="M${run[0][0]} ${edge}${run.map(([X, Y]) => `L${X} ${Y}`).join('')}L${run[run.length - 1][0]} ${edge}Z" style="fill:${col(it.color)};opacity:.16"/>`);
        });
      } else if (it.type === 'vline' && it.op !== '=') {
        const X = px(it.x), right = it.op[0] === '>';
        out.push(`<rect x="${r1(right ? X : -20)}" y="-20" width="${r1(right ? W + 20 - X : X + 20)}" height="${H + 40}" style="fill:${col(it.color)};opacity:.16"/>`);
      } else if (it.type === 'implicit' && it.op !== '=' && opts.raster !== false) {
        const img = regionImage(it, v);
        if (img) out.push(`<image href="${img}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" style="opacity:.75"/>`);
      } else if (it.type === 'poly') {
        out.push(`<polygon points="${it.pts.map(q => r1(px(q.x)) + ',' + r1(py(q.y))).join(' ')}" style="fill:${col(it.color)};opacity:.14"/>`);
      }
    });
    // where two or more inequalities are all true: striped, on top of their shading
    const both = overlapPath(items.map(o => o.it), v, px, py);
    if (both) out.push(`<defs><pattern id="${id}h" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="9" style="fill:var(--ink);opacity:.05"/><path d="M0 0V9" style="stroke:var(--ink);stroke-width:1.7;opacity:.34"/></pattern></defs><path d="${both}" style="fill:url(#${id}h)"/>`);
    items.forEach(({ it }) => {
      const c = col(it.color), line = `fill:none;stroke:${c};stroke-width:2.6;stroke-linejoin:round;stroke-linecap:round;`;
      if (it.type === 'fn') {
        const d = runs(it, x0, x1, px, py).map(run => 'M' + run.map(([X, Y]) => X + ' ' + Y).join('L')).join('');
        if (d) out.push(`<path d="${d}" style="${line}${dash(it.op)}"/>`);
      } else if (it.type === 'curve') {
        const d = curveRuns(it, px, py).map(run => 'M' + run.map(([X, Y]) => X + ' ' + Y).join('L')).join('');
        if (d) out.push(`<path d="${d}" style="${line}"/>`);
      } else if (it.type === 'vline') {
        out.push(`<path d="M${r1(px(it.x))} 0V${H}" style="${line}${dash(it.op)}"/>`);
      } else if (it.type === 'implicit') {
        const d = contour(it.F, v, px, py);
        if (d) out.push(`<path d="${d}" style="${line}${dash(it.op)}"/>`);
      } else if (it.type === 'circle') {
        out.push(`<ellipse cx="${r1(px(it.c.x))}" cy="${r1(py(it.c.y))}" rx="${r1(it.r * sx)}" ry="${r1(it.r * sy)}" style="${line}"/>`);
      } else if (it.type === 'poly') {
        out.push(`<polygon points="${it.pts.map(q => r1(px(q.x)) + ',' + r1(py(q.y))).join(' ')}" style="${line}"/>`);
      } else if (it.type === 'seg' || it.type === 'line') {
        let a = it.a, b = it.b;
        if (it.type === 'line') { const ext = extend(a, b, v, it.ray); if (!ext) return; [a, b] = ext; }
        out.push(`<path d="M${r1(px(a.x))} ${r1(py(a.y))}L${r1(px(b.x))} ${r1(py(b.y))}" style="${line}"/>`);
        if (it.arrow) {
          const ang = Math.atan2(py(b.y) - py(a.y), px(b.x) - px(a.x)), X = px(b.x), Y = py(b.y), L = 12;
          out.push(`<path d="M${r1(X)} ${r1(Y)}L${r1(X - L * Math.cos(ang - 0.4))} ${r1(Y - L * Math.sin(ang - 0.4))}L${r1(X - L * Math.cos(ang + 0.4))} ${r1(Y - L * Math.sin(ang + 0.4))}Z" style="fill:${c}"/>`);
        }
      }
    });
    out.push('</g>');
    // labels: tick numbers, axis names, then the items' own labels
    const lab = [];
    const xLabY = py(0) + 16 > H - 4 ? H - 6 : py(0) < 0 ? 14 : py(0) + 16;
    const step2 = xs * sx < 30 ? 2 : 1;
    for (let k = Math.ceil(x0 / xs); k * xs <= x1; k++) {
      if (!k || k % step2) continue;
      const X = px(k * xs); if (X < 10 || X > W - 14) continue;
      lab.push(`<text x="${r1(X)}" y="${r1(xLabY)}" text-anchor="middle" style="${TXT};fill:var(--muted)">${fmt(k * xs, xs)}</text>`);
    }
    const left = px(0) - 6 < 26, yLabX = left ? (px(0) < 0 || px(0) > W ? 4 : px(0) + 6) : px(0) - 6;
    for (let k = Math.ceil(y0 / ys); k * ys <= y1; k++) {
      if (!k) continue;
      const Y = py(k * ys); if (Y < 10 || Y > H - 8) continue;
      lab.push(`<text x="${r1(Math.min(W - 4, yLabX))}" y="${r1(Y + 4)}" text-anchor="${left ? 'start' : 'end'}" style="${TXT};fill:var(--muted)">${fmt(k * ys, ys)}</text>`);
    }
    if (px(0) > 8 && px(0) < W - 8 && py(0) > 8 && py(0) < H - 8) lab.push(`<text x="${r1(px(0) - 5)}" y="${r1(py(0) + 15)}" text-anchor="end" style="${TXT};fill:var(--muted)">0</text>`);
    const xn = g.xlabel || g.xname || 'x', yn = g.ylabel || g.yname || 'y';
    lab.push(`<text x="${W - 6}" y="${r1(Math.max(14, Math.min(H - 22, ay - 9)))}" text-anchor="end" style="${TXT};font-style:${g.xlabel ? 'normal' : 'italic'};font-weight:600">${esc(xn)}</text>`);
    lab.push(`<text x="${r1(Math.min(W - 8, Math.max(8, ax + 9)))}" y="15" text-anchor="${ax > W - 60 ? 'end' : 'start'}" style="${TXT};font-style:${g.ylabel ? 'normal' : 'italic'};font-weight:600">${esc(yn)}</text>`);
    out.push(lab.join(''));
    // domain ends, then points
    const dots = [], labelBoxes = [];
    const marks = [];
    items.forEach(({ it }) => {
      if (it.type === 'fn' && it.domain) {
        [['lo', 'loIn'], ['hi', 'hiIn']].forEach(([e, inc]) => {
          const x = it.domain[e]; if (!isFinite(x)) return;
          const y = it.f(x); if (!isFinite(y) || x < x0 || x > x1 || y < y0 || y > y1) return;
          dots.push(`<circle cx="${r1(px(x))}" cy="${r1(py(y))}" r="4.5" style="stroke:${col(it.color)};stroke-width:2.2;fill:${it.domain[inc] === false ? 'var(--surface)' : col(it.color)}"/>`);
          marks.push({ x, y, name: it.domain[inc] === false ? 'open endpoint (not included)' : 'endpoint (included)' });
        });
      }
      if (it.type === 'fn' && it.pieces) {
        const eps = (x1 - x0) * 1e-7, ends = [...new Set(it.pieces.flatMap(pc => (pc.dom ? [pc.dom.lo, pc.dom.hi] : [])).filter(e => isFinite(e) && e >= x0 && e <= x1))];
        const shut = [], open = [];
        ends.forEach(e => it.pieces.forEach((pc, k) => {
          if (it.owner(e) !== k && it.owner(e - eps) !== k && it.owner(e + eps) !== k) return;
          const y = pc.f(e); if (!isFinite(y) || y < y0 || y > y1) return;
          const inc = it.owner(e) === k;
          (inc ? shut : open).push(`<circle cx="${r1(px(e))}" cy="${r1(py(y))}" r="4.5" style="stroke:${col(it.color)};stroke-width:2.2;fill:${inc ? col(it.color) : 'var(--surface)'}"/>`);
          marks.push({ x: e, y, name: inc ? 'endpoint (included)' : 'open endpoint (not included)' });
        }));
        dots.push(open.join('') + shut.join(''));
      }
      const ptsOf = it.type === 'point' ? [it] : it.type === 'poly' ? it.pts : it.type === 'seg' ? [it.a, it.b] : [];
      const few = g.items.filter(q => q.type === 'point').length <= 6;
      ptsOf.forEach(q => {
        if (q.x < x0 || q.x > x1 || q.y < y0 || q.y > y1) return;
        const X = px(q.x), Y = py(q.y);
        if (it.type === 'point' || q.label) dots.push(`<circle cx="${r1(X)}" cy="${r1(Y)}" r="${it.type === 'point' ? 5 : 3.5}" style="fill:${col(it.color)};stroke:var(--surface);stroke-width:1.8"/>`);
        const name = q.label ? (it.type === 'point' && few && !it.noCoords ? `${q.label} ${pt(q.x, q.y)}` : q.label) : (it.type === 'point' && few ? pt(q.x, q.y) : '');
        if (name) {
          const right = X < W - 90, tx = X + (right ? 8 : -8), ty = Y - 8 < 12 ? Y + 18 : Y - 8, wd = name.length * 7.2;
          const box = right ? [tx, tx + wd] : [tx - wd, tx];
          // a label that would sit on top of one already drawn is left off (the point's dot still shows, and pointing reads it)
          if (!labelBoxes.some(b => box[0] < b[1] && b[0] < box[1] && Math.abs(b[2] - ty) < 14)) {
            labelBoxes.push([box[0], box[1], ty]);
            dots.push(`<text x="${r1(tx)}" y="${r1(ty)}" text-anchor="${right ? 'start' : 'end'}" style="${TXT};font-weight:600">${esc(name)}</text>`);
          }
        }
        marks.push({ x: q.x, y: q.y, name: q.label || (it.type === 'point' ? 'point' : 'vertex') });
      });
      if ((it.type === 'seg' || it.type === 'circle' || it.type === 'poly') && it.label) {
        let X, Y;
        if (it.type === 'seg') { X = (px(it.a.x) + px(it.b.x)) / 2; Y = (py(it.a.y) + py(it.b.y)) / 2 - 8; }
        else if (it.type === 'circle') { X = px(it.c.x); Y = py(it.c.y + it.r) - 8; }
        else { X = it.pts.reduce((s, q) => s + px(q.x), 0) / it.pts.length; Y = it.pts.reduce((s, q) => s + py(q.y), 0) / it.pts.length + 4; }
        dots.push(`<text x="${r1(X)}" y="${r1(Y)}" text-anchor="middle" style="${TXT};font-weight:600">${esc(it.label)}</text>`);
      }
    });
    out.push(dots.join(''));
    // key points: small grey dots that name themselves on hover or tap
    const keys = (opts.keys === false ? [] : keyPoints(g, v, hidden)).filter(k => {
      const on = marks.find(q => Math.abs(px(q.x) - px(k.x)) < 5 && Math.abs(py(q.y) - py(k.y)) < 5);
      if (on) { if (!on.name.includes(k.name)) on.name += ' · ' + k.name; return false; }
      return true;
    });
    out.push(keys.map(k => `<circle cx="${r1(px(k.x))}" cy="${r1(py(k.y))}" r="4.4" style="fill:var(--surface);stroke:var(--muted);stroke-width:1.8"/>`).join(''));
    out.push('<g class="vz-hover"></g>');
    const desc = describeItems(g);
    if (opts.state) { opts.state.marks = keys.map(k => Object.assign({ key: true }, k)).concat(marks); opts.state.sx = sx; opts.state.sy = sy; }
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc('Graph: ' + desc)}" xmlns="http://www.w3.org/2000/svg" style="font-family:var(--font)">${out.join('')}</svg>`;
  }
  /** a function's curve as runs of [X, Y] pixels, broken where it is undefined or jumps (asymptotes) */
  function runs(it, x0, x1, px, py) {
    if (it.pieces) return pieceRuns(it, x0, x1, px, py);
    let lo = x0, hi = x1;
    if (it.domain) { lo = Math.max(lo, it.domain.lo); hi = Math.min(hi, it.domain.hi); }
    if (!(hi > lo)) return [];
    const n = 480, out = [];
    let run = [], prevY = null;
    for (let i = 0; i <= n; i++) {
      const x = lo + (hi - lo) * i / n, y = it.f(x);
      if (!isFinite(y)) { if (run.length > 1) out.push(run); run = []; prevY = null; continue; }
      const Y = py(y);
      if (prevY !== null && Math.abs(Y - prevY) > H * 0.8) {
        const xm = x - (hi - lo) / n / 2, Ym = py(it.f(xm));
        if (!isFinite(Ym) || Ym < Math.min(Y, prevY) - 1 || Ym > Math.max(Y, prevY) + 1) { if (run.length > 1) out.push(run); run = []; }
      }
      run.push([r1(px(x)), r1(Math.max(-H, Math.min(2 * H, Y)))]);
      prevY = Y;
    }
    if (run.length > 1) out.push(run);
    return out;
  }
  /** a function in pieces: each piece drawn on its own, right up to where it starts and stops */
  function pieceRuns(it, x0, x1, px, py) {
    const n = 480, xs = [], eps = (x1 - x0) * 1e-7, out = [];
    for (let i = 0; i <= n; i++) xs.push(x0 + (x1 - x0) * i / n);
    const ends = it.pieces.flatMap(pc => (pc.dom ? [pc.dom.lo, pc.dom.hi] : [])).filter(e => isFinite(e) && e > x0 && e < x1);
    xs.push(...ends); xs.sort((a, b) => a - b);
    it.pieces.forEach((pc, k) => {
      let run = [], prevY = null;
      xs.forEach(x => {
        const mine = it.owner(x) === k || (ends.includes(x) && (it.owner(x - eps) === k || it.owner(x + eps) === k));
        const y = mine ? pc.f(x) : NaN;
        if (!isFinite(y)) { if (run.length > 1) out.push(run); run = []; prevY = null; return; }
        const Y = py(y);
        if (prevY !== null && Math.abs(Y - prevY) > H * 0.8) { if (run.length > 1) out.push(run); run = []; }
        run.push([r1(px(x)), r1(Math.max(-H, Math.min(2 * H, Y)))]);
        prevY = Y;
      });
      if (run.length > 1) out.push(run);
    });
    return out;
  }
  /** a polar or parametric curve as runs of pixels, broken where it is undefined or leaps */
  function curveRuns(it, px, py) {
    const out = [];
    let run = [], prev = null;
    it.pts.forEach(([x, y]) => {
      if (!isFinite(x) || !isFinite(y)) { if (run.length > 1) out.push(run); run = []; prev = null; return; }
      const X = Math.max(-W, Math.min(2 * W, px(x))), Y = Math.max(-H, Math.min(2 * H, py(y)));
      if (prev && Math.hypot(X - prev[0], Y - prev[1]) > H * 0.8) { if (run.length > 1) out.push(run); run = []; }
      run.push([r1(X), r1(Y)]); prev = [X, Y];
    });
    if (run.length > 1) out.push(run);
    return out;
  }
  /** the region where every inequality (of y, or x = c) on the graph is true at once, as a path; '' when there are
      fewer than two, when one is a curve not solved for y, or when they never overlap in view */
  function overlapPath(list, v, px, py) {
    const ineq = list.filter(it => (it.type === 'fn' || it.type === 'vline') && it.op && it.op !== '=');
    if (ineq.length < 2 || list.some(it => it.type === 'implicit' && it.op !== '=')) return '';
    const n = 240, top = v.y1 + (v.y1 - v.y0), bot = v.y0 - (v.y1 - v.y0), cols = [];
    for (let i = 0; i <= n; i++) {
      const x = v.x0 + (v.x1 - v.x0) * i / n;
      let lo = bot, hi = top, ok = true;
      ineq.forEach(it => {
        if (!ok) return;
        if (it.type === 'vline') { if (it.op[0] === '>' ? x < it.x : x > it.x) ok = false; return; }
        if (!inDomain(it, x)) { ok = false; return; }
        const y = it.f(x);
        if (!isFinite(y)) { ok = false; return; }
        if (it.op[0] === '>') lo = Math.max(lo, y); else hi = Math.min(hi, y);
      });
      cols.push(ok && hi > lo ? [x, lo, hi] : null);
    }
    const parts = [];
    let run = [];
    const flush = () => { if (run.length > 1) parts.push('M' + run.map(c => `${r1(px(c[0]))} ${r1(Math.max(-20, py(c[2])))}`).join('L') + 'L' + run.slice().reverse().map(c => `${r1(px(c[0]))} ${r1(Math.min(H + 20, py(c[1])))}`).join('L') + 'Z'); run = []; };
    cols.forEach(c => { if (c) run.push(c); else flush(); });
    flush();
    return parts.join('');
  }
  /** a line through two points, cut to the window (a ray starts at the first point) */
  function extend(a, b, v, ray) {
    const dx = b.x - a.x, dy = b.y - a.y;
    let lo = ray ? 0 : -Infinity, hi = Infinity;
    [[a.x, dx, v.x0, v.x1], [a.y, dy, v.y0, v.y1]].forEach(([s, d, mn, mx]) => {
      if (d === 0) { if (s < mn || s > mx) { lo = 1; hi = 0; } return; }
      const t1 = (mn - s) / d, t2 = (mx - s) / d;
      lo = Math.max(lo, Math.min(t1, t2)); hi = Math.min(hi, Math.max(t1, t2));
    });
    if (!(hi > lo)) return null;
    return [{ x: a.x + lo * dx, y: a.y + lo * dy }, { x: a.x + hi * dx, y: a.y + hi * dy }];
  }
  /** marching squares: the curve F(x, y) = 0 */
  function contour(F, v, px, py) {
    const nx = 150, ny = 112, dx = (v.x1 - v.x0) / nx, dy = (v.y1 - v.y0) / ny;
    const val = [];
    for (let j = 0; j <= ny; j++) { const row = []; for (let i = 0; i <= nx; i++) row.push(F(v.x0 + i * dx, v.y0 + j * dy)); val.push(row); }
    const d = [];
    const lerp = (a, b, fa, fb) => a + (b - a) * (fa / (fa - fb));
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const a = val[j][i], b = val[j][i + 1], c = val[j + 1][i + 1], e = val[j + 1][i];
      if (![a, b, c, e].every(isFinite)) continue;
      const xA = v.x0 + i * dx, yA = v.y0 + j * dy;
      const pts = [];
      if ((a > 0) !== (b > 0)) pts.push([lerp(xA, xA + dx, a, b), yA]);
      if ((b > 0) !== (c > 0)) pts.push([xA + dx, lerp(yA, yA + dy, b, c)]);
      if ((e > 0) !== (c > 0)) pts.push([lerp(xA, xA + dx, e, c), yA + dy]);
      if ((a > 0) !== (e > 0)) pts.push([xA, lerp(yA, yA + dy, a, e)]);
      // a sign change across a pole is not a curve
      const big = Math.max(Math.abs(a), Math.abs(b), Math.abs(c), Math.abs(e));
      for (let k = 0; k + 1 < pts.length; k += 2) {
        const mx = (pts[k][0] + pts[k + 1][0]) / 2, my = (pts[k][1] + pts[k + 1][1]) / 2;
        if (Math.abs(F(mx, my)) > big) continue;
        d.push(`M${r1(px(pts[k][0]))} ${r1(py(pts[k][1]))}L${r1(px(pts[k + 1][0]))} ${r1(py(pts[k + 1][1]))}`);
      }
    }
    return d.join('');
  }
  /** shading for an inequality that is not solved for y (x² + y² < 25), painted as a small image */
  function regionImage(it, v) {
    if (typeof document === 'undefined') return null;
    try {
      const w = 160, h = 120, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const ctx = cv.getContext('2d'), img = ctx.createImageData(w, h);
      const rgb = colorRGB(it.color);
      const test = { '<': f => f < 0, '<=': f => f <= 0, '>': f => f > 0, '>=': f => f >= 0 }[it.op];
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const x = v.x0 + (i + 0.5) * (v.x1 - v.x0) / w, y = v.y1 - (j + 0.5) * (v.y1 - v.y0) / h;
        if (test(it.F(x, y))) { const k = (j * w + i) * 4; img.data[k] = rgb[0]; img.data[k + 1] = rgb[1]; img.data[k + 2] = rgb[2]; img.data[k + 3] = 52; }
      }
      ctx.putImageData(img, 0, 0);
      return cv.toDataURL('image/png');
    } catch (e) { return null; }
  }
  function colorRGB(name) {
    const v = cssVar(name || 'vz1') || '#2d70e0';
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(v.trim());
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [45, 112, 224];
  }
  function cssVar(name) { try { return getComputedStyle(document.documentElement).getPropertyValue('--' + name).trim(); } catch (e) { return ''; } }

  function legendName(it) {
    if (it.type === 'poly') { const n = it.pts.every(q => q.label) ? it.pts.map(q => q.label).join('') : ''; return [({ 3: 'triangle', 4: 'quadrilateral' })[it.pts.length] || 'shape', n, it.label].filter(Boolean).join(' '); }
    if (it.type === 'seg') return (it.arrow ? 'arrow' : 'segment') + (it.label ? ' · ' + it.label : '');
    if (it.type === 'line') return (it.ray ? 'ray' : 'line') + ` through ${pt(it.a.x, it.a.y)} and ${pt(it.b.x, it.b.y)}` + (it.label ? ' · ' + it.label : '');
    if (it.type === 'circle') return `circle, center ${pt(it.c.x, it.c.y)}, radius ${fmt(it.r)}` + (it.label ? ' · ' + it.label : '');
    return it.label || '';
  }
  function describeItems(g) {
    return g.items.map(it => it.type === 'fn' || it.type === 'implicit' || it.type === 'vline' || it.type === 'curve' ? (it.text || '') :
      it.type === 'value' ? `${it.text} ${it.show}` : it.of ? '' :
      it.type === 'point' ? (it.label ? it.label + ' ' : '') + pt(it.x, it.y) :
      it.type === 'seg' ? `${it.arrow ? 'arrow' : 'segment'} from ${pt(it.a.x, it.a.y)} to ${pt(it.b.x, it.b.y)}` :
      it.type === 'line' ? `${it.ray ? 'ray' : 'line'} through ${pt(it.a.x, it.a.y)} and ${pt(it.b.x, it.b.y)}` :
      it.type === 'poly' ? `shape ${it.pts.map(q => pt(q.x, q.y)).join(' ')}` :
      it.type === 'circle' ? `circle center ${pt(it.c.x, it.c.y)} radius ${fmt(it.r)}` : '').filter(Boolean).join('; ');
  }

  /** is there a part where all the graph's inequalities hold (in the view)? */
  function overlapOf(st) {
    if (!st || st.kind !== 'graph' || !st.view) return false;
    const v = st.view, px = x => (x - v.x0) / (v.x1 - v.x0) * W, py = y => H - (y - v.y0) / (v.y1 - v.y0) * H;
    return !!overlapPath(st.spec.items.filter((it, i) => !st.hidden.has(i)), v, px, py);
  }
  /** math as words read it: x² for x^2, ≤ for <=, a real minus sign */
  const speak = t => plain(t).replace(/\^2\b/g, '²').replace(/\^3\b/g, '³').replace(/\^\(?([\w.]+)\)?/g, ' to the power $1').replace(/sqrt/g, '√').replace(/(\d|\b)pi\b/g, '$1π')
    .replace(/<=/g, '≤').replace(/>=/g, '≥').replace(/\*/g, '×').replace(/(^|[\s(=])-/g, '$1−').replace(/ - /g, ' − ').replace(/\s+/g, ' ').trim();
  /** a number, with "about" when it is rounded */
  const say = x => { const k = snap(x); return (Math.abs(k - Number(k.toFixed(3))) > 1e-9 ? 'about ' : '') + fmt(k); };
  const sayPt = (x, y) => `(${say(x)}, ${say(y)})`;
  const domainWords = d => (isFinite(d.lo) ? say(d.lo) + (d.loIn === false ? ' < ' : ' ≤ ') : '') + 'x' + (isFinite(d.hi) ? (d.hiIn === false ? ' < ' : ' ≤ ') + say(d.hi) : '');
  const list = xs => (xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1]);
  /** the whole graph in words, for a screen reader: the window, then each thing drawn and its key points */
  function describeGraph(st) {
    const g = st.spec, v = st.view || defaultView(g), out = [];
    const r3 = x => fmt(Number(x.toPrecision(3)));
    out.push(`${g.title ? g.title + '. ' : ''}A graph showing x from ${r3(v.x0)} to ${r3(v.x1)} and y from ${r3(v.y0)} to ${r3(v.y1)}${g.deg ? ', with angles in degrees' : ''}.`);
    const shown = g.items.map((it, i) => ({ it, i })).filter(o => !st.hidden.has(o.i));
    const pts = shown.filter(o => o.it.type === 'point' && !o.it.of).map(o => (o.it.label ? 'point ' + o.it.label + ' at ' : '') + sayPt(o.it.x, o.it.y));
    shown.forEach(({ it, i }) => {
      const name = speak(it.text || '');
      if (it.type === 'fn') {
        if (it.op !== '=') { const below = it.op[0] === '<'; out.push(`${name} is shaded ${below ? 'below' : 'above'} its boundary, which is ${it.op.length === 1 ? 'dashed because points on it don’t count' : 'solid because points on it count'}.`); return; }
        let kind = 'a curve';
        if (it.pieces) kind = `a function in ${it.pieces.length} pieces: ${list(it.pieces.map(pc => `${speak(pc.text)}${pc.cond ? ' when ' + speak(pc.cond) : ' otherwise'}`))}`;
        else {
          const xs = [-2.3, 0.7, 3.1].map(x => v.x0 + (v.x1 - v.x0) * (x + 5) / 10), ys = xs.map(x => (inDomain(it, x) ? it.f(x) : NaN));
          if (ys.every(isFinite)) {
            const m1 = (ys[1] - ys[0]) / (xs[1] - xs[0]), m2 = (ys[2] - ys[1]) / (xs[2] - xs[1]);
            if (Math.abs(m1 - m2) < 1e-7 * (1 + Math.abs(m1))) kind = Math.abs(m1) < 1e-9 ? 'a horizontal line' : `a line with slope ${say(m1)}`;
          }
        }
        const others = new Set(g.items.map((q, k) => k).filter(k => k !== i));
        const keys = keyPoints(g, v, others);
        const by = n => keys.filter(k => k.name.split(' · ').includes(n)).map(k => sayPt(k.x, k.y));
        const bits = [];
        if (by('y-intercept').length) bits.push(`crosses the y-axis at ${by('y-intercept')[0]}`);
        if (by('x-intercept').length) bits.push(`crosses the x-axis at ${list(by('x-intercept'))}`);
        if (by('minimum').length) bits.push(`has a minimum at ${list(by('minimum'))}`);
        if (by('maximum').length) bits.push(`has a maximum at ${list(by('maximum'))}`);
        out.push(`${name} is ${kind}${it.domain ? ' for ' + domainWords(it.domain) : ''}${bits.length ? '. In view, it ' + list(bits) : ''}.`);
      } else if (it.type === 'vline') out.push(it.op === '=' ? `${name} is a vertical line.` : `${name} is shaded to the ${it.op[0] === '>' ? 'right' : 'left'} of a ${it.op.length === 1 ? 'dashed' : 'solid'} vertical line.`);
      else if (it.type === 'implicit') out.push(it.op === '=' ? `${name} is a curve.` : `${name} is shaded where it is true.`);
      else if (it.type === 'curve') {
        const p0 = it.pts[0], p1 = it.pts[it.pts.length - 1], ang = t => { if (g.deg) return say(t) + ' degrees'; const k = t / Math.PI, n = Math.round(k * 4) / 4, m = /^(−?)(\d+)(?:\/(\d+))?$/.exec(fracText(n, 4)); return Math.abs(k - n) < 1e-9 && n && m ? `${m[1]}${m[2] === '1' ? '' : m[2]}π${m[3] ? '/' + m[3] : ''}` : say(t); };
        out.push(`${name} is a ${it.kind === 'polar' ? 'polar' : 'parametric'} curve, drawn as ${it.kind === 'polar' ? 'θ' : 't'} goes from ${ang(p0[2])} to ${ang(p1[2])}.`);
      }
      else if (it.type === 'value') out.push(`${speak(it.text)} ${it.show}.`);
      else if (it.type === 'circle') out.push(`A circle with center ${sayPt(it.c.x, it.c.y)} and radius ${say(it.r)}${it.label ? ', labeled ' + it.label : ''}.`);
      else if (it.type === 'poly') out.push(`A ${({ 3: 'triangle', 4: 'four-sided shape' })[it.pts.length] || it.pts.length + '-sided shape'} with corners at ${list(it.pts.map(q => (q.label ? q.label + ' ' : '') + sayPt(q.x, q.y)))}.`);
      else if (it.type === 'seg') out.push(`${it.arrow ? 'An arrow' : 'A segment'} from ${sayPt(it.a.x, it.a.y)} to ${sayPt(it.b.x, it.b.y)}${it.label ? ', labeled ' + it.label : ''}.`);
      else if (it.type === 'line') out.push(`A ${it.ray ? 'ray' : 'line'} through ${sayPt(it.a.x, it.a.y)} and ${sayPt(it.b.x, it.b.y)}.`);
    });
    if (pts.length) out.push(pts.length === 1 ? `There is a ${/^point/.test(pts[0]) ? '' : 'point at '}${pts[0]}.` : `There are ${pts.length} points: ${list(pts.slice(0, 12))}${pts.length > 12 ? ', and more' : ''}.`);
    const meet = keyPoints(g, v, st.hidden).filter(k => /intersection/.test(k.name)).map(k => sayPt(k.x, k.y));
    if (meet.length) out.push(`The graphs meet at ${list(meet)}.`);
    if (overlapOf(st)) out.push('The striped part is where all the inequalities are true at once.');
    return out.join(' ');
  }

  /* ---------- number lines ---------- */
  function parseLine(text) {
    const s = { kind: 'numberline', items: [], min: null, max: null, step: null, title: '', skipped: 0 };
    const V = '([-+]?\\s*[\\d.]+(?:\\s*/\\s*\\d+)?(?:\\s+\\d+\\s*/\\s*\\d+)?)';
    String(text || '').split(/\n|;/).forEach(raw => {
      let line = plain(raw).replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').replace(/`/g, '').trim().replace(/[.]$/, '');
      if (!line || /^(#|\/\/)/.test(line)) return;
      let m, label = '';
      if ((m = /^title\s*[:=]\s*(.+)$/i.exec(line))) { s.title = m[1]; return; }
      if ((m = QUOTE_RE.exec(line))) { label = m[1]; line = line.slice(0, m.index).trim(); }
      try {
        if ((m = new RegExp(`^(?:from|range|numbers?|show|line)?\\s*[:=]?\\s*${V}\\s*(?:to|\\.\\.|…)\\s*${V}$`, 'i').exec(line)) && !/jump|arrow|hop|move/i.test(line)) { s.min = num(m[1]); s.max = num(m[2]); return; }
        if ((m = /^(?:step|ticks?|every|by)\s*[:=]?\s*(.+)$/i.exec(line))) { const v = num(m[1]); if (v > 0) s.step = v; return; }
        if ((m = new RegExp(`^(?:jump|arrow|hop|move|add)\\s*(?:from\\s*)?${V}\\s*(?:to|->|→)\\s*${V}$`, 'i').exec(line))) { s.items.push({ type: 'jump', a: num(m[1]), b: num(m[2]), label }); return; }
        // inequalities, joined by "or"
        if (/\bx\b/.test(line)) {
          line.split(/\s+or\s+/i).forEach(part => {
            const and = part.split(/\s+and\s+/i);
            let lo = -Infinity, hi = Infinity, loIn = false, hiIn = false;
            and.forEach(q => {
              let r = /^(.+?)\s*(<=|<|>=|>)\s*x\s*(<=|<|>=|>)\s*(.+)$/.exec(q.trim());
              if (r) {
                const a = num(r[1]), b = num(r[4]);
                if (r[2][0] === '<') { lo = a; loIn = r[2] === '<='; hi = b; hiIn = r[3] === '<='; } else { hi = a; hiIn = r[2] === '>='; lo = b; loIn = r[3] === '>='; }
                return;
              }
              r = /^x\s*(<=|>=|<|>|=|!=|≠)\s*(.+)$/.exec(q.trim()) || ((r = /^(.+?)\s*(<=|>=|<|>|=)\s*x$/.exec(q.trim())) ? [r[0], flip(r[2]), r[1]] : null);
              if (!r) throw new Error('unread');
              const v = num(r[2]);
              if (r[1] === '=') { s.items.push({ type: 'point', v, label }); lo = NaN; return; }
              if (r[1][0] === '>') { if (v > lo || (v === lo && r[1] === '>')) { lo = v; loIn = r[1] === '>='; } }
              else if (v < hi || (v === hi && r[1] === '<')) { hi = v; hiIn = r[1] === '<='; }
            });
            if (isNaN(lo)) return;
            s.items.push({ type: 'range', lo, hi, loIn, hiIn, label, text: part.trim() });
          });
          return;
        }
        const list = line.replace(/^(?:points?|plot|dots?|numbers?|show|mark)\s*[:=]?\s*/i, '');
        const open = /^open\b/i.test(list), closed = /^(closed|filled)\b/i.test(list);
        const vals = list.replace(/^(open|closed|filled)\s*(?:circle|dot|point)?\s*(?:at)?\s*/i, '').split(/\s*(?:,|\band\b)\s*/).filter(Boolean);
        const nums = vals.map(num);
        nums.forEach((v, k) => s.items.push({ type: 'point', v, open, closed, label: nums.length === 1 ? label : '' }));
      } catch (e) { s.skipped++; }
    });
    // the window: what is drawn, a little room either side, and whole numbers or the fractions in use
    const vals = [];
    s.items.forEach(it => { if (it.type === 'point') vals.push(it.v); else if (it.type === 'jump') vals.push(it.a, it.b); else { if (isFinite(it.lo)) vals.push(it.lo); if (isFinite(it.hi)) vals.push(it.hi); } });
    if (s.min == null || s.max == null || !(s.max > s.min)) {
      let lo = vals.length ? Math.min(...vals) : -5, hi = vals.length ? Math.max(...vals) : 5;
      const span = hi - lo;
      if (span < 1 && vals.every(v => v >= 0 && v <= 1)) { lo = 0; hi = 1; }
      else {
        const pad = Math.max(1, Math.ceil(span * 0.2));
        lo = Math.floor(lo) - pad; hi = Math.ceil(hi) + pad;
        if (s.items.some(it => it.type === 'range' && (!isFinite(it.lo) || !isFinite(it.hi)))) { lo -= 1; hi += 1; }
        if (hi - lo < 6) { const c = Math.round((lo + hi) / 2); lo = Math.min(lo, c - 3); hi = Math.max(hi, c + 3); }
      }
      s.min = lo; s.max = hi;
    }
    if (!s.step) {
      const den = vals.reduce((d, v) => { for (let k = 1; k <= 12; k++) if (Math.abs(v * k - Math.round(v * k)) < 1e-9) return Math.max(d, k); return d; }, 1);
      const span = s.max - s.min;
      s.step = den > 1 && span * den <= 24 ? 1 / den : Math.max(1, niceStep(span, 16));
    }
    return s;
  }
  function lineSvg(s) {
    const jumps = s.items.filter(it => it.type === 'jump');
    const lift = jumps.length ? 34 + 16 * Math.min(3, jumps.length) : 0;
    const Hh = 96 + lift, Y = Hh - 44, L = 26, R = W - 26;
    const px = v => L + (v - s.min) / (s.max - s.min) * (R - L);
    const out = [`<rect width="${W}" height="${Hh}" style="fill:var(--surface)"/>`];
    out.push(`<path d="M8 ${Y}H${W - 8}" style="stroke:var(--ink);stroke-width:2"/><path d="M4 ${Y}l10 -5v10zM${W - 4} ${Y}l-10 -5v10z" style="fill:var(--ink)"/>`);
    const n = Math.round((s.max - s.min) / s.step);
    const every = n > 24 ? Math.ceil(n / 12) : n > 14 ? 2 : 1;
    const frac = Math.abs(s.step - Math.round(s.step)) > 1e-9;
    for (let k = 0; k <= n; k++) {
      const v = s.min + k * s.step, X = px(v), major = Math.abs(v - Math.round(v)) < 1e-9;
      out.push(`<path d="M${r1(X)} ${Y - (major ? 8 : 5)}V${Y + (major ? 8 : 5)}" style="stroke:var(--ink);stroke-width:${major ? 1.6 : 1}"/>`);
      if (k % every === 0) out.push(`<text x="${r1(X)}" y="${Y + 26}" text-anchor="middle" style="${TXT};fill:var(--muted);font-size:${frac && !major ? 11.5 : 12.5}px">${frac ? fracText(v) : fmt(v, s.step)}</text>`);
    }
    let ci = 0;
    s.items.forEach(it => {
      const c = col(COLORS[ci++ % COLORS.length]);
      if (it.type === 'range') {
        const a = isFinite(it.lo) ? px(it.lo) : 6, b = isFinite(it.hi) ? px(it.hi) : W - 6;
        out.push(`<path d="M${r1(a)} ${Y}H${r1(b)}" style="stroke:${c};stroke-width:6;stroke-linecap:round;opacity:.9"/>`);
        if (!isFinite(it.lo)) out.push(`<path d="M2 ${Y}l13 -8v16z" style="fill:${c}"/>`);
        if (!isFinite(it.hi)) out.push(`<path d="M${W - 2} ${Y}l-13 -8v16z" style="fill:${c}"/>`);
        [[it.lo, it.loIn], [it.hi, it.hiIn]].forEach(([v, inc]) => { if (isFinite(v)) out.push(`<circle cx="${r1(px(v))}" cy="${Y}" r="7" style="stroke:${c};stroke-width:3;fill:${inc ? c : 'var(--surface)'}"/>`); });
        if (it.label) out.push(`<text x="${r1((Math.max(a, 20) + Math.min(b, W - 20)) / 2)}" y="${Y - 14}" text-anchor="middle" style="${TXT};font-weight:600">${esc(it.label)}</text>`);
      } else if (it.type === 'point') {
        const X = px(it.v);
        out.push(`<circle cx="${r1(X)}" cy="${Y}" r="7" style="stroke:${c};stroke-width:3;fill:${it.open ? 'var(--surface)' : c}"/>`);
        out.push(`<text x="${r1(X)}" y="${Y - 14}" text-anchor="middle" style="${TXT};font-weight:600">${esc(it.label || fracText(it.v))}</text>`);
      }
    });
    jumps.forEach((it, k) => {
      const a = px(it.a), b = px(it.b), h = 22 + 14 * (k % 3), c = col(COLORS[(ci + k) % COLORS.length]);
      const mid = (a + b) / 2, top = Y - 10 - h;
      out.push(`<path d="M${r1(a)} ${Y - 9}Q${r1(mid)} ${r1(top - h * 0.6)} ${r1(b)} ${Y - 9}" style="fill:none;stroke:${c};stroke-width:2.4"/>`);
      const dir = b >= a ? -1 : 1;
      out.push(`<path d="M${r1(b)} ${Y - 8}l${dir * 9} -7l${dir * 1} 9z" style="fill:${c}"/>`);
      out.push(`<text x="${r1(mid)}" y="${r1(top - 2)}" text-anchor="middle" style="${TXT};font-weight:700;fill:${c}">${esc(it.label || ((it.b - it.a >= 0 ? '+' : '−') + fracText(Math.abs(it.b - it.a))))}</text>`);
      out.push(`<circle cx="${r1(a)}" cy="${Y}" r="4" style="fill:${c}"/>`);
    });
    return `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc('Number line from ' + fmt(s.min) + ' to ' + fmt(s.max))}" xmlns="http://www.w3.org/2000/svg" style="font-family:var(--font)">${out.join('')}</svg>`;
  }

  /* ---------- charts ---------- */
  function parseChart(text) {
    const c = { kind: 'chart', type: '', title: '', xlabel: '', ylabel: '', data: [], values: [], bin: null, bins: [], skipped: 0 };
    String(text || '').split(/\n/).forEach(raw => {
      let line = plain(raw).replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').replace(/`/g, '').trim();
      if (!line || /^(#|\/\/)/.test(line)) return;
      let m;
      const t = (m = /^(?:type|kind|chart)\s*[:=]\s*(.+)$/i.exec(line)) ? m[1] : (/^[a-z -]+$/i.test(line) && line.split(' ').length <= 5 ? line : '');
      const type = chartType(t);
      if (type) { c.type = type; return; }
      if ((m = /^title\s*[:=]\s*(.+)$/i.exec(line))) { c.title = m[1].replace(/^["']|["']$/g, ''); return; }
      if ((m = /^(x|y)[- ]?(?:axis\s*)?(?:label|title)?\s*[:=]\s*(.+)$/i.exec(line)) && !isNum(m[2])) { c[m[1].toLowerCase() + 'label'] = m[2]; return; }
      if ((m = /^(?:bin|bins|bin size|bin width|width|interval|class width)\s*[:=]?\s*([\d.]+)$/i.exec(line))) { c.bin = Number(m[1]); return; }
      if ((m = /^(?:values|data|numbers|scores|set)\s*[:=]\s*(.+)$/i.exec(line)) || /^[-+\d.,\s]+$/.test(line)) {
        const list = (m ? m[1] : line).split(/[,;\s]+/).filter(Boolean);
        try { list.forEach(x => c.values.push(num(x))); } catch (e) { c.skipped++; }
        return;
      }
      if ((m = /^([-\d.]+)\s*(?:-|–|to)\s*([-\d.]+)\s*[:=|]\s*([\d.]+)$/.exec(line))) { c.bins.push({ lo: Number(m[1]), hi: Number(m[2]), n: Number(m[3]) }); return; }
      // Apples: 5, Spider: 8 legs, Rent = $450: the number, with any unit kept for the axis
      if ((m = /^(.+?)\s*[:=|]\s*\$?\s*([-+]?[\d.,]+)\s*(%|[a-z][a-z ]{0,15})?\s*$/i.exec(line))) {
        const v = Number(m[2].replace(/,/g, ''));
        if (isFinite(v)) { c.data.push({ label: m[1].replace(/^["'|]+|["'|]+$/g, '').trim(), value: v }); if (m[3] && m[3] !== '%' && !c.ylabel) c.ylabel = m[3].trim(); return; }
      }
      c.skipped++;
    });
    if (!c.type) c.type = c.bins.length ? 'histogram' : c.data.length ? 'bar' : c.values.length > 25 ? 'histogram' : 'dot';
    if (c.type === 'histogram' && !c.bins.length && c.values.length) {
      const lo = Math.min(...c.values), hi = Math.max(...c.values);
      const w = c.bin || niceStep(Math.max(1, hi - lo), 6);
      const start = Math.floor(lo / w) * w;
      for (let a = start; a <= hi; a += w) c.bins.push({ lo: a, hi: a + w, n: c.values.filter(v => v >= a && (v < a + w || (v === hi && a + w > hi && v <= a + w))).length });
    }
    return c;
  }
  function chartType(t) {
    t = String(t || '').toLowerCase();
    if (!t) return '';
    if (/box/.test(t)) return 'box';
    if (/dot|line plot/.test(t)) return 'dot';
    if (/hist/.test(t)) return 'histogram';
    if (/pie|circle/.test(t)) return 'pie';
    if (/line/.test(t)) return 'line';
    if (/bar|column/.test(t)) return 'bar';
    return '';
  }
  function five(values) {
    const s = values.slice().sort((a, b) => a - b), n = s.length;
    const med = a => { const k = a.length; return k % 2 ? a[(k - 1) / 2] : (a[k / 2 - 1] + a[k / 2]) / 2; };
    const half = Math.floor(n / 2);
    const lower = s.slice(0, half), upper = s.slice(n % 2 ? half + 1 : half);
    return { n, min: s[0], q1: med(lower.length ? lower : s), median: med(s), q3: med(upper.length ? upper : s), max: s[n - 1], mean: s.reduce((a, b) => a + b, 0) / n, sorted: s };
  }
  function chartSvg(c) {
    const out = [];
    const Hc = c.type === 'box' ? 170 : c.type === 'dot' ? dotHeight(c) : c.type === 'pie' ? 290 : 300;
    out.push(`<rect width="${W}" height="${Hc}" style="fill:var(--surface)"/>`);
    if (c.type === 'bar' || c.type === 'line' || c.type === 'histogram') {
      const data = c.type === 'histogram' ? c.bins.map(b => ({ label: fmt(b.lo) + '–' + fmt(b.hi), value: b.n })) : c.data;
      if (!data.length) return '';
      const L = 46, Rr = W - 12, T = 16, B = Hc - (c.xlabel ? 50 : 34);
      const max = Math.max(0, ...data.map(d => d.value)), min = Math.min(0, ...data.map(d => d.value));
      const step = niceStep(max - min || 1, 5), top = Math.ceil(max / step) * step || step, bot = Math.floor(min / step) * step;
      const py = v => B - (v - bot) / (top - bot) * (B - T);
      for (let v = bot; v <= top + 1e-9; v += step) {
        out.push(`<path d="M${L} ${r1(py(v))}H${Rr}" style="stroke:var(--line);stroke-width:1"/><text x="${L - 6}" y="${r1(py(v) + 4)}" text-anchor="end" style="${TXT};fill:var(--muted)">${fmt(v, step)}</text>`);
      }
      const slot = (Rr - L) / data.length;
      const bw = c.type === 'histogram' ? slot : Math.min(70, slot * 0.64);
      const pts = [];
      data.forEach((d, i) => {
        const X = L + slot * i + (slot - bw) / 2, Y = py(Math.max(0, d.value)), h = Math.abs(py(d.value) - py(0));
        const color = c.type === 'histogram' ? 'vz1' : COLORS[i % COLORS.length];
        if (c.type === 'line') pts.push([L + slot * i + slot / 2, py(d.value)]);
        else out.push(`<rect x="${r1(X)}" y="${r1(Y)}" width="${r1(bw)}" height="${r1(Math.max(0, h))}" style="fill:${col(color)};opacity:.85;stroke:var(--surface);stroke-width:${c.type === 'histogram' ? 1.5 : 0}"><title>${esc(d.label)}: ${fmt(d.value)}</title></rect>`);
        const lx = L + slot * i + slot / 2;
        out.push(`<text x="${r1(lx)}" y="${r1((c.type === 'line' ? py(d.value) : Y) - 6)}" text-anchor="middle" style="${TXT};font-weight:600">${fmt(d.value)}</text>`);
        if (c.type !== 'histogram') out.push(`<text x="${r1(lx)}" y="${B + 17}" text-anchor="middle" style="${TXT};font-size:${data.length > 8 ? 10.5 : 12}px">${esc(d.label.length > 11 ? d.label.slice(0, 10) + '…' : d.label)}</text>`);
      });
      if (c.type === 'histogram') c.bins.forEach((b, i) => { out.push(`<text x="${r1(L + slot * i)}" y="${B + 17}" text-anchor="middle" style="${TXT};fill:var(--muted)">${fmt(b.lo)}</text>`); if (i === c.bins.length - 1) out.push(`<text x="${r1(L + slot * (i + 1))}" y="${B + 17}" text-anchor="middle" style="${TXT};fill:var(--muted)">${fmt(b.hi)}</text>`); });
      if (c.type === 'line') out.push(`<path d="M${pts.map(p => r1(p[0]) + ' ' + r1(p[1])).join('L')}" style="fill:none;stroke:var(--vz1);stroke-width:2.6"/>` + pts.map(p => `<circle cx="${r1(p[0])}" cy="${r1(p[1])}" r="4.5" style="fill:var(--vz1)"/>`).join(''));
      out.push(`<path d="M${L} ${T - 6}V${r1(py(bot))}H${Rr}" style="fill:none;stroke:var(--ink);stroke-width:1.5"/>`);
      if (c.xlabel) out.push(`<text x="${(L + Rr) / 2}" y="${Hc - 10}" text-anchor="middle" style="${TXT};font-weight:600">${esc(c.xlabel)}</text>`);
      if (c.ylabel) out.push(`<text transform="translate(13 ${(T + B) / 2}) rotate(-90)" text-anchor="middle" style="${TXT};font-weight:600">${esc(c.ylabel)}</text>`);
    } else if (c.type === 'pie') {
      const data = c.data.length ? c.data : [];
      const total = data.reduce((s, d) => s + Math.max(0, d.value), 0);
      if (!total) return '';
      const cx = 140, cy = 145, r = 118;
      let a = -Math.PI / 2;
      data.forEach((d, i) => {
        const frac = Math.max(0, d.value) / total, b = a + frac * 2 * Math.PI;
        const large = b - a > Math.PI ? 1 : 0, color = col(COLORS[i % COLORS.length]);
        const path = frac >= 0.9999 ? `<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:${color};opacity:.85"/>` : `<path d="M${cx} ${cy}L${r1(cx + r * Math.cos(a))} ${r1(cy + r * Math.sin(a))}A${r} ${r} 0 ${large} 1 ${r1(cx + r * Math.cos(b))} ${r1(cy + r * Math.sin(b))}Z" style="fill:${color};opacity:.85;stroke:var(--surface);stroke-width:2"/>`;
        out.push(path);
        const m = (a + b) / 2;
        if (frac >= 0.06) out.push(`<text x="${r1(cx + r * 0.62 * Math.cos(m))}" y="${r1(cy + r * 0.62 * Math.sin(m) + 4)}" text-anchor="middle" style="${TXT};font-weight:700">${fmt(Math.round(frac * 1000) / 10)}%</text>`);
        out.push(`<rect x="290" y="${30 + i * 24}" width="14" height="14" rx="3" style="fill:${color}"/><text x="312" y="${42 + i * 24}" style="${TXT}">${esc((d.label.length > 16 ? d.label.slice(0, 15) + '…' : d.label) + ' · ' + fmt(d.value))}</text>`);
        a = b;
      });
    } else if (c.type === 'dot' || c.type === 'box') {
      if (!c.values.length) return '';
      const f = five(c.values);
      const span = f.max - f.min || 1, whole = f.sorted.every(Number.isInteger), step = whole ? Math.max(1, niceStep(span, 10)) : niceStep(span, 10);
      const lo = Math.floor(f.min / step) * step - (f.min % step === 0 ? step : 0), hi = Math.ceil(f.max / step) * step + (f.max % step === 0 ? step : 0);
      const L = 24, Rr = W - 24, Y = Hc - 40;
      const px = v => L + (v - lo) / (hi - lo) * (Rr - L);
      out.push(`<path d="M${L - 10} ${Y}H${Rr + 10}" style="stroke:var(--ink);stroke-width:1.8"/>`);
      for (let v = lo; v <= hi + 1e-9; v += step) out.push(`<path d="M${r1(px(v))} ${Y - 5}V${Y + 5}" style="stroke:var(--ink)"/><text x="${r1(px(v))}" y="${Y + 21}" text-anchor="middle" style="${TXT};fill:var(--muted)">${fmt(v, step)}</text>`);
      if (c.type === 'dot') {
        const counts = new Map();
        f.sorted.forEach(v => { const k = Math.round(v * 1e6) / 1e6; counts.set(k, (counts.get(k) || 0) + 1); });
        counts.forEach((n, v) => { for (let k = 0; k < n; k++) out.push(`<circle cx="${r1(px(v))}" cy="${Y - 12 - k * 15}" r="6" style="fill:var(--vz1)"><title>${fmt(v)}: ${n}</title></circle>`); });
      } else {
        const top = Y - 78, bh = 40, wlo = f.min, whi = f.max;
        const cy = top + bh / 2;
        out.push(`<path d="M${r1(px(wlo))} ${cy}H${r1(px(f.q1))}M${r1(px(f.q3))} ${cy}H${r1(px(whi))}M${r1(px(wlo))} ${cy - 10}V${cy + 10}M${r1(px(whi))} ${cy - 10}V${cy + 10}" style="stroke:var(--ink);stroke-width:2"/>`);
        out.push(`<rect x="${r1(px(f.q1))}" y="${top}" width="${r1(Math.max(1, px(f.q3) - px(f.q1)))}" height="${bh}" style="fill:var(--vz1);fill-opacity:.18;stroke:var(--vz1);stroke-width:2.4"/>`);
        out.push(`<path d="M${r1(px(f.median))} ${top}V${top + bh}" style="stroke:var(--vz2);stroke-width:3"/>`);
        const tags = [[wlo, 'min'], [f.q1, 'Q1'], [f.median, 'median'], [f.q3, 'Q3'], [whi, 'max']];
        tags.forEach(([v, t], k) => out.push(`<text x="${r1(px(v))}" y="${top - 8 - (k % 2) * 13}" text-anchor="middle" style="${TXT};font-size:11.5px;font-weight:600">${t} ${fmt(v)}</text>`));
      }
      if (c.xlabel) out.push(`<text x="${W / 2}" y="${Hc - 4}" text-anchor="middle" style="${TXT};font-weight:600">${esc(c.xlabel)}</text>`);
    }
    return `<svg viewBox="0 0 ${W} ${Hc}" role="img" aria-label="${esc((c.title || c.type + ' chart'))}" xmlns="http://www.w3.org/2000/svg" style="font-family:var(--font)">${out.join('')}</svg>`;
  }
  function dotHeight(c) {
    const counts = new Map(); c.values.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
    return 70 + 15 * Math.max(1, ...counts.values());
  }
  function chartNote(c) {
    if ((c.type === 'dot' || c.type === 'box' || c.type === 'histogram') && c.values.length) {
      const f = five(c.values);
      const iqr = f.q3 - f.q1, far = f.sorted.filter(v => v < f.q1 - 1.5 * iqr || v > f.q3 + 1.5 * iqr);
      return `n = ${f.n} · minimum ${fmt(f.min)} · Q1 ${fmt(f.q1)} · median ${fmt(f.median)} · Q3 ${fmt(f.q3)} · maximum ${fmt(f.max)} · mean ${fmt(Math.round(f.mean * 100) / 100)} · IQR ${fmt(iqr)} · range ${fmt(f.max - f.min)}` +
        (far.length ? ` · ${far.map(v => fmt(v)).join(', ')} ${far.length > 1 ? 'are outliers' : 'is an outlier'} (more than 1.5 × IQR beyond the box)` : '');
    }
    if (c.data.length) { const t = c.data.reduce((s, d) => s + d.value, 0); return `Total ${fmt(t)} · ${c.data.map(d => `${d.label} ${fmt(d.value)}${c.type === 'pie' && t ? ` (${fmt(Math.round(d.value / t * 1000) / 10)}%)` : ''}`).join(' · ')}`; }
    if (c.bins.length) return `Total ${fmt(c.bins.reduce((s, b) => s + b.n, 0))} values in ${c.bins.length} bins`;
    return '';
  }

  /* ---------- fraction models ---------- */
  function parseFraction(text) {
    const s = { kind: 'fraction', items: [], skipped: 0 };
    String(text || '').split(/\n|;|,(?!\d{3})/).forEach(raw => {
      const line = plain(raw).replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').replace(/`/g, '').trim().toLowerCase();
      if (!line) return;
      let m = /^(bar|strip|tape|rectangle|circle|pie|grid|percent|square)?\s*(?:model|of)?\s*[:=]?\s*(.+)$/.exec(line);
      const shape = /circle|pie/.test(m[1] || '') ? 'circle' : /grid|percent|square/.test(m[1] || '') || /%/.test(m[2]) ? 'grid' : 'bar';
      const v = m[2].trim();
      try {
        let n, d;
        const f = /^(\d+)\s*\/\s*(\d+)$/.exec(v), mix = /^(\d+)\s+(\d+)\s*\/\s*(\d+)$/.exec(v);
        if (f) { n = Number(f[1]); d = Number(f[2]); }
        else if (mix) { d = Number(mix[3]); n = Number(mix[1]) * d + Number(mix[2]); }
        else if (/%$/.test(v)) { n = Math.round(num(v)); d = 100; }
        else { const x = num(v); if (shape === 'grid' || (x > 0 && x < 1 && Math.abs(x * 100 - Math.round(x * 100)) < 1e-9)) { n = Math.round(x * 100); d = 100; } else throw new Error('not a fraction'); }
        if (!(d > 0) || d > 100 || n < 0 || n / d > 4) throw new Error('too big to draw');
        s.items.push({ n, d, shape: d === 100 && shape !== 'circle' ? 'grid' : shape });
      } catch (e) { s.skipped++; }
    });
    return s;
  }
  function fractionSvg(s) {
    const rows = [];
    let y = 8;
    s.items.forEach((it, k) => {
      const c = col(COLORS[k % COLORS.length]);
      const wholes = Math.max(1, Math.ceil(it.n / it.d));
      const name = `${it.n}/${it.d}` + (it.n > it.d ? ` = ${Math.floor(it.n / it.d)}${it.n % it.d ? ' ' + (it.n % it.d) + '/' + it.d : ''}` : '');
      const dec = it.n / it.d;
      const sub = `${fmt(Math.round(dec * 1000) / 1000)} · ${fmt(Math.round(dec * 1000) / 10)}%`;
      if (it.shape === 'grid') {
        const cell = 13;
        for (let w = 0; w < wholes; w++) {
          const ox = 8 + w * (cell * 10 + 14);
          for (let i = 0; i < 100; i++) {
            const on = w * 100 + i < it.n;
            rows.push(`<rect x="${ox + (i % 10) * cell}" y="${y + Math.floor(i / 10) * cell}" width="${cell - 1}" height="${cell - 1}" style="fill:${on ? c : 'var(--surface-2)'};opacity:${on ? .85 : 1}"/>`);
          }
        }
        rows.push(`<text x="${8 + wholes * (cell * 10 + 14)}" y="${y + 56}" style="${TXT};font-size:17px;font-weight:700">${esc(name)}</text><text x="${8 + wholes * (cell * 10 + 14)}" y="${y + 78}" style="${TXT};fill:var(--muted)">${esc(sub)}</text>`);
        y += 140;
      } else if (it.shape === 'circle') {
        const r = 48;
        for (let w = 0; w < wholes; w++) {
          const cx = 8 + r + w * (2 * r + 14), cy = y + r;
          for (let i = 0; i < it.d; i++) {
            const a = -Math.PI / 2 + i * 2 * Math.PI / it.d, b = a + 2 * Math.PI / it.d, on = w * it.d + i < it.n;
            rows.push(it.d === 1 ? `<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:${on ? c : 'var(--surface-2)'};stroke:var(--ink);stroke-width:1.5"/>` :
              `<path d="M${cx} ${cy}L${r1(cx + r * Math.cos(a))} ${r1(cy + r * Math.sin(a))}A${r} ${r} 0 0 1 ${r1(cx + r * Math.cos(b))} ${r1(cy + r * Math.sin(b))}Z" style="fill:${on ? c : 'var(--surface-2)'};opacity:${on ? .85 : 1};stroke:var(--ink);stroke-width:1.5"/>`);
          }
        }
        rows.push(`<text x="${16 + wholes * (2 * r + 14)}" y="${y + r}" style="${TXT};font-size:17px;font-weight:700">${esc(name)}</text><text x="${16 + wholes * (2 * r + 14)}" y="${y + r + 22}" style="${TXT};fill:var(--muted)">${esc(sub)}</text>`);
        y += 2 * r + 16;
      } else {
        const bw = Math.min(300, 420 / wholes - 10), bh = 34;
        for (let w = 0; w < wholes; w++) {
          const ox = 8, oy = y + w * (bh + 8);
          for (let i = 0; i < it.d; i++) {
            const on = w * it.d + i < it.n;
            rows.push(`<rect x="${r1(ox + i * bw / it.d)}" y="${oy}" width="${r1(bw / it.d)}" height="${bh}" style="fill:${on ? c : 'var(--surface-2)'};opacity:${on ? .85 : 1};stroke:var(--ink);stroke-width:1.5"/>`);
          }
        }
        const ty = y + (wholes * (bh + 8)) / 2;
        rows.push(`<text x="${bw + 22}" y="${r1(ty - 2)}" style="${TXT};font-size:17px;font-weight:700">${esc(name)}</text><text x="${bw + 22}" y="${r1(ty + 18)}" style="${TXT};fill:var(--muted)">${esc(sub)}</text>`);
        y += wholes * (bh + 8) + 12;
      }
    });
    return `<svg viewBox="0 0 ${W} ${y}" role="img" aria-label="${esc('Fraction model: ' + s.items.map(i => i.n + '/' + i.d).join(', '))}" xmlns="http://www.w3.org/2000/svg" style="font-family:var(--font)">${rows.join('')}</svg>`;
  }

  /* ---------- figures on the page ---------- */
  const KINDS = { graph: 'graph', plot: 'graph', desmos: 'graph', coordinate: 'graph', numberline: 'numberline', 'number-line': 'numberline', number_line: 'numberline', line: 'numberline', chart: 'chart', bar: 'chart', histogram: 'chart', box: 'chart', boxplot: 'chart', dotplot: 'chart', pie: 'chart', fraction: 'fraction', fractions: 'fraction', model: 'fraction' };
  const PARSE = { graph: parseGraph, numberline: parseLine, chart: parseChart, fraction: parseFraction };
  const REG = new Map();
  function hash(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
  /** the kind of drawing a fenced block asks for, or null. Unlabelled blocks that read as a graph count. */
  function kindOf(lang, body) {
    const k = KINDS[String(lang || '').toLowerCase().trim()];
    if (k) return k;
    if (lang && !/^(text|txt|plain|plaintext|math)$/i.test(lang)) return null;
    try { const g = parseGraph(body); return g.items.length && g.items.length >= g.skipped ? 'graph' : null; } catch (e) { return null; }
  }
  function entry(kind, body) {
    const id = 'v' + hash(kind + '\n' + body);
    let st = REG.get(id);
    if (!st) {
      const spec = PARSE[kind](body);
      if (kind === 'chart' && spec.type === 'box' && !spec.values.length) return null;
      if (!(kind === 'chart' ? (spec.data.length || spec.values.length || spec.bins.length) : spec.items.length)) return null;
      st = { id, kind, body, spec, view: null, hidden: new Set(), overrides: {} };
      if (kind === 'graph') { st.home = defaultView(spec); st.view = Object.assign({}, st.home); }
      REG.set(id, st);
      if (REG.size > 300) REG.delete(REG.keys().next().value);
    }
    return st;
  }
  function svgFor(st, opts) {
    if (st.kind === 'graph') return graphSvg(st.spec, st.view, st.hidden, Object.assign({ state: st }, opts));
    if (st.kind === 'numberline') return lineSvg(st.spec);
    if (st.kind === 'chart') return chartSvg(st.spec);
    return fractionSvg(st.spec);
  }
  /** a drawing block as HTML: the picture, its key, and buttons. Null when nothing in it can be drawn. */
  function figure(kind, body, opts) {
    opts = opts || {};
    let st;
    try { st = entry(kind, body); } catch (e) { st = null; }
    if (!st) return null;
    if (st.kind === 'graph') st.grid = opts.grid || null;          // the graphing page's grid setting
    let svg;
    try { svg = svgFor(st); } catch (e) { return null; }
    if (!svg) return null;
    const s = st.spec;
    const legend = st.kind === 'graph' ? s.items.map((it, i) => ({ it, i })).filter(({ it }) => it.type === 'fn' || it.type === 'vline' || it.type === 'implicit' || it.type === 'circle' || it.type === 'curve' || ((it.type === 'poly' || it.type === 'seg' || it.type === 'line') && (it.label || it.type === 'line' || (it.type === 'poly' && it.pts.every(q => q.label)))))
      .map(({ it, i }) => `<button type="button" class="viz-key" data-vz="toggle" data-i="${i}" aria-pressed="${!st.hidden.has(i)}" title="Show or hide"><span class="sw" style="background:${col(it.color)}"></span><span>${it.text ? pretty(it.text) : esc(legendName(it))}${it.label && it.text ? ` <span class="muted">${esc(it.label)}</span>` : ''}</span></button>`).join('') : '';
    const note = st.kind === 'chart' ? chartNote(s) : st.kind === 'graph' && overlapOf(st) ? 'The striped part is where all the inequalities are true at once.' : '';
    const sliders = st.kind === 'graph' && Object.keys(s.params || {}).length ? `<div class="viz-sliders">${Object.values(s.params).map(p => `<label class="viz-slider"><span><i>${esc(p.name)}</i> = <output>${fmt(p.value, p.step)}</output></span><input type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.value}" data-vz-param="${esc(p.name)}" aria-label="${esc(p.name)}"></label>`).join('')}</div>` : '';
    const tools = st.kind === 'graph'
      ? `<button type="button" class="viz-btn" data-vz="in" aria-label="Zoom in" title="Zoom in">+</button><button type="button" class="viz-btn" data-vz="out" aria-label="Zoom out" title="Zoom out">−</button><button type="button" class="viz-btn" data-vz="home" title="Return to the original view">Reset view</button>`
      : '';
    const title = s.title || '';
    const did = 'vzd' + (++uid);
    const plot = st.kind === 'graph'
      ? `<div class="viz-plot" tabindex="0" role="application" aria-roledescription="graph" aria-label="Graph. The arrow keys trace a curve; plus and minus zoom." aria-describedby="${did}">${svg}</div><p class="visually-hidden viz-desc" id="${did}">${esc(describeGraph(st))}</p><span class="visually-hidden viz-say" aria-live="polite"></span>`
      : `<div class="viz-plot">${svg}</div>`;
    return `<figure class="viz viz-${st.kind}" data-viz="${st.id}">${title ? `<figcaption class="viz-title">${esc(title)}</figcaption>` : ''}${plot}` +
      sliders + (legend ? `<div class="viz-legend">${legend}</div>` : '') +
      (note ? `<p class="viz-note">${esc(note)}</p>` : '') +
      `<div class="viz-bar">${tools}<button type="button" class="viz-btn" data-vz="save" title="Save the drawing as an image">Save as image</button>` +
      (st.kind === 'graph' && !opts.calc ? `<a class="viz-btn" href="#/graph/${encode(body)}" title="Open in the graphing calculator, to change it and add to it">Open in calculator</a>` : '') +
      (st.kind === 'graph' ? `<span class="viz-read" aria-live="off">${typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches ? 'Tap anywhere to read a point · pinch to zoom' : 'Drag to move the view · click anywhere to read a point'}</span>` : '') + `</div></figure>`;
  }
  const VIS_LANGS = /^(graph|plot|desmos|coordinate|numberline|number-line|number_line|chart|bar|histogram|box|boxplot|dotplot|pie|fraction|fractions|model)$/i;
  /** HTML for a fenced block. Unfinished blocks (still streaming) show a placeholder, not raw text. */
  function block(lang, body, closed) {
    const kind = kindOf(lang, body);
    if (!closed) return (kind || VIS_LANGS.test(lang || '')) ? '<div class="viz viz-wait">Drawing…</div>' : `<pre class="code">${esc(body)}</pre>`;
    if (kind) {
      // a block labelled with the wrong kind (a bar chart written as ```graph) is drawn as what it is
      for (const k of [kind].concat(['graph', 'chart', 'numberline', 'fraction'].filter(x => x !== kind))) { const f = figure(k, body); if (f) return f; }
    }
    return `<pre class="code">${esc(body)}</pre>`;
  }

  /* ---------- exploring a graph: zoom, drag, read a point ---------- */
  function stateOf(fig) { return fig && REG.get(fig.dataset.viz); }
  function redraw(fig, light) {
    const st = stateOf(fig); if (!st) return;
    const plot = fig.querySelector('.viz-plot');
    plot.innerHTML = svgFor(st, light ? { keys: false, raster: false } : {});
    fig.querySelectorAll('[data-vz="toggle"]').forEach(b => b.setAttribute('aria-pressed', String(!st.hidden.has(Number(b.dataset.i)))));
    if (st.pinned) showMark(fig, st.pinned);
    if (!light) { const d = fig.querySelector('.viz-desc'); if (d) d.textContent = describeGraph(st); }
  }
  function zoom(st, f, cx, cy) {
    const v = st.view;
    cx = cx == null ? (v.x0 + v.x1) / 2 : cx; cy = cy == null ? (v.y0 + v.y1) / 2 : cy;
    const nx = (v.x1 - v.x0) * f, ny = (v.y1 - v.y0) * f;
    if (nx < 1e-6 || nx > 1e7) return;
    st.view = { x0: cx - (cx - v.x0) * f, x1: cx + (v.x1 - cx) * f, y0: cy - (cy - v.y0) * f, y1: cy + (v.y1 - cy) * f };
    void nx; void ny;
  }
  function toMath(st, svg, clientX, clientY) {
    const r = svg.getBoundingClientRect();
    const X = (clientX - r.left) * W / r.width, Y = (clientY - r.top) * H / r.height, v = st.view;
    return { X, Y, x: v.x0 + X / W * (v.x1 - v.x0), y: v.y1 - Y / H * (v.y1 - v.y0) };
  }
  /** the point nearest a spot on the graph: a marked point, a curve, or (pin) the spot itself */
  function nearest(st, m, pin) {
    const v = st.view, px = x => (x - v.x0) / (v.x1 - v.x0) * W, py = y => H - (y - v.y0) / (v.y1 - v.y0) * H;
    let best = null;
    (st.marks || []).forEach(k => { const d = Math.hypot(px(k.x) - m.X, py(k.y) - m.Y); if (d < 14 && (!best || d < best.d)) best = { d, x: k.x, y: k.y, name: k.name }; });
    if (!best) {
      const res = niceStep(v.x1 - v.x0, W / 52) / 10;
      const x = Math.round(m.x / res) * res;
      st.spec.items.forEach((it, i) => {
        if (it.type !== 'fn' || st.hidden.has(i) || !inDomain(it, x)) return;
        const y = it.f(x); if (!isFinite(y)) return;
        const d = Math.abs(py(y) - m.Y);
        if (d < 18 && (!best || d < best.d)) best = { d, x, y, name: it.text ? plain(it.text) : '', color: it.color };
      });
    }
    if (!best) {
      st.spec.items.forEach((it, i) => {
        if (it.type !== 'curve' || st.hidden.has(i)) return;
        it.pts.forEach(q => { if (!isFinite(q[0]) || !isFinite(q[1])) return; const d = Math.hypot(px(q[0]) - m.X, py(q[1]) - m.Y); if (d < 14 && (!best || d < best.d)) best = { d, x: q[0], y: q[1], name: `${it.kind === 'polar' ? 'θ' : 't'} = ${fmt(q[2], 0.01)}${st.spec.deg ? '°' : ''}`, color: it.color }; });
      });
    }
    if (!best && pin) {                                          // anywhere else: that spot, on a tidy grid
      const rx = niceStep(v.x1 - v.x0, 200), ry = niceStep(v.y1 - v.y0, 150);
      best = { d: 0, x: snap(Math.round(m.x / rx) * rx), y: snap(Math.round(m.y / ry) * ry), name: '', free: true };
    }
    return best;
  }
  /** show a point on the graph with its coordinates; say: also read it out (keyboard tracing) */
  function showMark(fig, best, aloud) {
    const st = stateOf(fig), svg = fig.querySelector('svg'), g = svg && svg.querySelector('.vz-hover');
    if (!st || !g) return;
    const v = st.view, px = x => (x - v.x0) / (v.x1 - v.x0) * W, py = y => H - (y - v.y0) / (v.y1 - v.y0) * H;
    const read = fig.querySelector('.viz-read');
    if (!best) { g.innerHTML = ''; return; }
    const X = px(best.x), Y = py(best.y), label = pt(best.x, best.y);
    if (X < -1 || X > W + 1 || Y < -1 || Y > H + 1) { g.innerHTML = ''; return; }
    const right = X < W - 130, up = Y > 40;
    const tw = Math.max(label.length, (best.name || '').length * 0.85) * 7.2 + 16;
    const bx = right ? X + 10 : X - 10 - tw, by = up ? Y - (best.name ? 46 : 32) : Y + 10;
    g.innerHTML = (best.free ? `<path d="M${r1(X - 9)} ${r1(Y)}h18M${r1(X)} ${r1(Y - 9)}v18" style="stroke:var(--ink);stroke-width:1.6;opacity:.7"/><circle cx="${r1(X)}" cy="${r1(Y)}" r="4.5" style="fill:var(--surface);stroke:var(--ink);stroke-width:2"/>`
      : `<circle cx="${r1(X)}" cy="${r1(Y)}" r="6" style="fill:${best.color ? col(best.color) : 'var(--ink)'};stroke:var(--surface);stroke-width:2"/>`) +
      `<rect x="${r1(bx)}" y="${r1(by)}" width="${r1(tw)}" height="${best.name ? 38 : 24}" rx="6" style="fill:var(--ink);opacity:.92"/>` +
      `<text x="${r1(bx + 8)}" y="${r1(by + 16)}" style="font-size:13px;font-weight:700;fill:var(--surface)">${esc(label)}</text>` +
      (best.name ? `<text x="${r1(bx + 8)}" y="${r1(by + 31)}" style="font-size:11px;fill:var(--surface);opacity:.85">${esc(best.name.length > 26 ? best.name.slice(0, 25) + '…' : best.name)}</text>` : '');
    if (read) read.textContent = `${label}${best.name ? ' · ' + best.name : ''}`;
    const sayEl = aloud && fig.querySelector('.viz-say');
    if (sayEl) sayEl.textContent = `${best.name ? best.name + ': ' : ''}${label}`;
  }
  function hover(fig, clientX, clientY, pin) {
    const st = stateOf(fig), svg = fig.querySelector('svg'), g = svg && svg.querySelector('.vz-hover');
    if (!st || !g || st.kind !== 'graph') return;
    const m = toMath(st, svg, clientX, clientY), v = st.view;
    const best = nearest(st, m, pin);
    if (pin) st.pinned = best;
    if (best) { showMark(fig, best); return; }
    if (st.pinned) { showMark(fig, st.pinned); return; }
    g.innerHTML = '';
    const read = fig.querySelector('.viz-read');
    if (read) read.textContent = `x ≈ ${fmt(m.x, (v.x1 - v.x0) / 50)}, y ≈ ${fmt(m.y, (v.y1 - v.y0) / 50)}`;
  }
  /** keyboard tracing: ← → move along a curve, ↑ ↓ change curves (or move a point when there are none) */
  function traceKey(fig, ev) {
    const st = stateOf(fig); if (!st || st.kind !== 'graph') return false;
    const k = ev.key, v = st.view;
    if (k === '+' || k === '=') { zoom(st, 0.6); redraw(fig); return true; }
    if (k === '-' || k === '_') { zoom(st, 1 / 0.6); redraw(fig); return true; }
    if (k === '0') { st.view = Object.assign({}, st.home); redraw(fig); return true; }
    if (k === 'Escape') { st.trace = null; st.pinned = null; showMark(fig, null); return !!fig; }
    if (!/^Arrow(Left|Right|Up|Down)$/.test(k)) return false;
    const fns = st.spec.items.map((it, i) => ({ it, i })).filter(o => o.it.type === 'fn' && !st.hidden.has(o.i));
    const step = niceStep(v.x1 - v.x0, 100) * (ev.shiftKey ? 5 : 1), stepY = niceStep(v.y1 - v.y0, 75) * (ev.shiftKey ? 5 : 1);
    const t = st.trace || { k: 0, x: snap(Math.round(((v.x0 + v.x1) / 2) / step) * step), y: snap(Math.round(((v.y0 + v.y1) / 2) / stepY) * stepY) };
    if (k === 'ArrowLeft' || k === 'ArrowRight') t.x = snap(Math.round((t.x + (k === 'ArrowRight' ? step : -step)) / step) * step);
    else if (fns.length) t.k = (t.k + (k === 'ArrowDown' ? 1 : fns.length - 1)) % fns.length;
    else t.y = snap(Math.round((t.y + (k === 'ArrowUp' ? stepY : -stepY)) / stepY) * stepY);
    st.trace = t;
    // keep the cursor in view
    const w = v.x1 - v.x0;
    if (t.x < v.x0 || t.x > v.x1) { const dx = t.x < v.x0 ? t.x - v.x0 - w * 0.1 : t.x - v.x1 + w * 0.1; st.view = { x0: v.x0 + dx, x1: v.x1 + dx, y0: v.y0, y1: v.y1 }; redraw(fig); }
    let best;
    if (fns.length) {
      const o = fns[t.k % fns.length], y = inDomain(o.it, t.x) ? o.it.f(t.x) : NaN, name = o.it.text ? plain(o.it.text) : 'the curve';
      const key = isFinite(y) && (st.marks || []).find(q => Math.abs(q.x - t.x) < 1e-9 && Math.abs(q.y - y) < 1e-6);
      best = isFinite(y) ? { x: t.x, y: snap(y), name: key ? `${name}, ${key.name}` : name, color: o.it.color } : null;
      if (best && (best.y < st.view.y0 || best.y > st.view.y1)) { const h = st.view.y1 - st.view.y0; st.view = Object.assign({}, st.view, { y0: best.y - h / 2, y1: best.y + h / 2 }); redraw(fig); }
      if (!best) { const say = fig.querySelector('.viz-say'); showMark(fig, null); if (say) say.textContent = `${name} has no point at x = ${fmt(t.x)}.`; return true; }
    } else best = { x: t.x, y: t.y, name: '', free: true };
    st.pinned = best;
    showMark(fig, best, true);
    return true;
  }
  /** the drawing as a PNG (twice the size, for a sharp picture); a title and its equations go above a graph */
  function pictureBlob(fig, title) {
    return new Promise((ok, no) => {
      const st = stateOf(fig); if (!st) { no(new Error('no drawing')); return; }
      let svg = svgFor(st, { keys: true });
      // a picture file cannot see the page's colours, so write them in
      svg = svg.replace(/font-family:var\(--font\)/g, 'font-family:Arial, Helvetica, sans-serif')
        .replace(/var\(--([a-z0-9-]+)\)/gi, (m, n) => cssVar(n) || (n === 'surface' ? '#ffffff' : '#222222'));
      const vb = /viewBox="0 0 (\d+) (\d+)"/.exec(svg), w = Number(vb[1]), h = Number(vb[2]), k = 2;
      const t = String(title || '').trim().slice(0, 80);
      const sub = t && st.kind === 'graph' ? st.spec.items.filter((it, i) => !st.hidden.has(i) && (it.type === 'fn' || it.type === 'vline' || it.type === 'implicit' || it.type === 'curve')).map(it => plain(it.text || '').replace(/\^2\b/g, '²').replace(/\^3\b/g, '³').replace(/\*/g, '·').replace(/<=/g, '≤').replace(/>=/g, '≥')).join('   ') : '';
      const band = t ? (sub ? 62 : 44) : 0;
      const img = new Image();
      img.onload = () => {
        const cv = document.createElement('canvas'); cv.width = w * k; cv.height = (h + band) * k;
        const ctx = cv.getContext('2d'); ctx.fillStyle = cssVar('surface') || '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
        if (t) {
          ctx.scale(k, k);
          ctx.fillStyle = cssVar('ink') || '#16181d'; ctx.font = '700 19px Arial, Helvetica, sans-serif'; ctx.textBaseline = 'alphabetic';
          ctx.fillText(t, 14, 29, w - 28);
          if (sub) { ctx.fillStyle = cssVar('muted') || '#5b6270'; ctx.font = '13px Arial, Helvetica, sans-serif'; ctx.fillText(sub.length > 90 ? sub.slice(0, 89) + '…' : sub, 14, 50, w - 28); }
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        ctx.drawImage(img, 0, band * k, w * k, h * k);
        cv.toBlob(b => (b ? ok(b) : no(new Error('no picture'))), 'image/png');
      };
      img.onerror = () => no(new Error('no picture'));
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  }
  const fileName = (title, kind) => (String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'procademy-' + kind) + '.png';
  function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); }
  function savePicture(fig) { const st = stateOf(fig); if (st) pictureBlob(fig).then(b => download(b, fileName('', st.kind)), () => {}); }
  /** a graph as a picture with a title: the device's share sheet where there is one, else a download.
      Resolves 'shared', 'saved' or 'cancelled'. */
  async function shareImage(fig, title) {
    const st = stateOf(fig); if (!st) return 'cancelled';
    const blob = await pictureBlob(fig, title), name = fileName(title, st.kind);
    let file = null;
    try { file = new File([blob], name, { type: 'image/png' }); } catch (e) { file = null; }
    if (file && navigator.canShare && navigator.share && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: String(title || 'A graph') }); return 'shared'; } catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
    }
    download(blob, name);
    return 'saved';
  }
  let wired = false;
  function wire() {
    if (wired || typeof document === 'undefined') return;
    wired = true;
    document.addEventListener('click', ev => {
      const b = ev.target.closest && ev.target.closest('[data-vz]');
      if (!b) return;
      const fig = b.closest('.viz'), st = stateOf(fig);
      if (!st) return;
      const act = b.dataset.vz;
      if (act === 'save') { savePicture(fig); return; }
      if (st.kind !== 'graph') return;
      if (act === 'in') zoom(st, 0.6);
      else if (act === 'out') zoom(st, 1 / 0.6);
      else if (act === 'home') { st.view = Object.assign({}, st.home); st.pinned = null; st.trace = null; }
      else if (act === 'toggle') { const i = Number(b.dataset.i); if (st.hidden.has(i)) st.hidden.delete(i); else st.hidden.add(i); }
      redraw(fig);
    });
    document.addEventListener('input', ev => {
      const r = ev.target.closest && ev.target.closest('[data-vz-param]');
      if (!r) return;
      const fig = r.closest('.viz');
      slide(fig, r.dataset.vzParam, Number(r.value));
      const out = r.closest('.viz-slider').querySelector('output'), st = stateOf(fig), p = st && st.spec.params[r.dataset.vzParam];
      if (out && p) out.textContent = fmt(p.value, p.step);
    });
    document.addEventListener('change', ev => { const r = ev.target.closest && ev.target.closest('[data-vz-param]'); if (r) redraw(r.closest('.viz')); });
    let drag = null, frame = 0, pinch = null;
    document.addEventListener('pointerdown', ev => {
      const svg = ev.target.closest && ev.target.closest('.viz-graph .viz-plot svg');
      if (!svg) return;
      const fig = svg.closest('.viz');
      if (ev.pointerType !== 'mouse') { if (ev.isPrimary !== false && !pinch) hover(fig, ev.clientX, ev.clientY, true); return; }     // a tap reads a point; the page still scrolls
      if (ev.button !== 0) return;
      const st = stateOf(fig);
      drag = { fig, st, x: ev.clientX, y: ev.clientY, view: Object.assign({}, st.view), moved: false };
      ev.preventDefault();
    });
    document.addEventListener('pointermove', ev => {
      if (drag) {
        const { fig, st } = drag, svg = fig.querySelector('svg'), r = svg.getBoundingClientRect();
        const dx = (ev.clientX - drag.x) / r.width * (drag.view.x1 - drag.view.x0), dy = (ev.clientY - drag.y) / r.height * (drag.view.y1 - drag.view.y0);
        if (Math.abs(ev.clientX - drag.x) + Math.abs(ev.clientY - drag.y) > 3) drag.moved = true;
        if (!drag.moved) return;
        st.view = { x0: drag.view.x0 - dx, x1: drag.view.x1 - dx, y0: drag.view.y0 + dy, y1: drag.view.y1 + dy };
        if (!frame) frame = requestAnimationFrame(() => { frame = 0; if (drag) redraw(drag.fig, true); });
        fig.classList.add('dragging');
        return;
      }
      if (ev.pointerType !== 'mouse') return;
      const svg = ev.target.closest && ev.target.closest('.viz-graph .viz-plot svg');
      if (svg) hover(svg.closest('.viz'), ev.clientX, ev.clientY);
    });
    const end = ev => { if (!drag) return; const d = drag; drag = null; d.fig.classList.remove('dragging'); if (d.moved) redraw(d.fig); else if (ev && ev.type === 'pointerup') hover(d.fig, ev.clientX, ev.clientY, true); };     // a click without a drag reads that point
    document.addEventListener('pointerup', end);
    document.addEventListener('pointercancel', end);
    document.addEventListener('pointerout', ev => {
      const svg = ev.target.closest && ev.target.closest('.viz-graph .viz-plot svg');
      if (svg && !svg.contains(ev.relatedTarget)) { const fig = svg.closest('.viz'), st = stateOf(fig); if (st && st.pinned) showMark(fig, st.pinned); else { const g = svg.querySelector('.vz-hover'); if (g) g.innerHTML = ''; } }
    });
    // two fingers: pinch to zoom, and move to pan
    document.addEventListener('touchstart', ev => {
      if (ev.touches.length !== 2) return;
      const svg = ev.target.closest && ev.target.closest('.viz-graph .viz-plot svg'); if (!svg) return;
      const fig = svg.closest('.viz'), st = stateOf(fig); if (!st || !st.view) return;
      const [a, b] = ev.touches, mx = (a.clientX + b.clientX) / 2, my = (a.clientY + b.clientY) / 2;
      pinch = { fig, st, d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1, view: Object.assign({}, st.view), c: toMath(st, svg, mx, my) };
      if (drag) drag = null;
      ev.preventDefault();
      // redrawing replaces the picture under the fingers, and a touch's later events go to the element it started on
      // even once it has left the page, so listen there as well as on the document
      const t = ev.target;
      t.addEventListener('touchmove', pinchMove, { passive: false });
      const off = () => { t.removeEventListener('touchmove', pinchMove); t.removeEventListener('touchend', onEnd); t.removeEventListener('touchcancel', onEnd); };
      const onEnd = e2 => { pinchEnd(e2); if (!pinch) off(); };
      t.addEventListener('touchend', onEnd); t.addEventListener('touchcancel', onEnd);
    }, { passive: false });
    document.addEventListener('touchmove', ev => pinchMove(ev), { passive: false });
    function pinchMove(ev) {
      if (!pinch || ev.touches.length !== 2) return;
      ev.preventDefault();
      const [a, b] = ev.touches, svg = pinch.fig.querySelector('.viz-plot svg'); if (!svg) return;
      const r = svg.getBoundingClientRect(), d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1, f = pinch.d / d, v0 = pinch.view;
      const w = (v0.x1 - v0.x0) * f, h = (v0.y1 - v0.y0) * f;
      if (w < 1e-6 || w > 1e7) return;
      const fx = ((a.clientX + b.clientX) / 2 - r.left) / r.width, fy = ((a.clientY + b.clientY) / 2 - r.top) / r.height;
      const x0 = pinch.c.x - fx * w, y1 = pinch.c.y + fy * h;
      pinch.st.view = { x0, x1: x0 + w, y0: y1 - h, y1 };
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; if (pinch) redraw(pinch.fig, true); });
    }
    function pinchEnd(ev) { if (!pinch || ev.touches.length >= 2) return; const fig = pinch.fig; pinch = null; redraw(fig); }
    document.addEventListener('touchend', pinchEnd);
    document.addEventListener('touchcancel', pinchEnd);
    // the keyboard, on a graph that has the focus
    document.addEventListener('keydown', ev => {
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
      const plot = ev.target.closest && ev.target.closest('.viz-graph .viz-plot');
      if (!plot || ev.target !== plot) return;
      if (traceKey(plot.closest('.viz'), ev)) ev.preventDefault();
    });
    document.addEventListener('wheel', ev => {
      const svg = ev.target.closest && ev.target.closest('.viz-graph .viz-plot svg');
      if (!svg || !(ev.ctrlKey || ev.metaKey)) return;                // a plain scroll keeps scrolling the page; pinch or ⌘/Ctrl zooms
      ev.preventDefault();
      const fig = svg.closest('.viz'), st = stateOf(fig), m = toMath(st, svg, ev.clientX, ev.clientY);
      zoom(st, ev.deltaY > 0 ? 1.15 : 1 / 1.15, m.x, m.y);
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; redraw(fig); });
    }, { passive: false });
  }

  /* ---------- drawing what the learner asks for ---------- */
  const WANTS = /\b(graph(s|ed|ing)?|plot(s|ted|ting)?|sketch|draw(ing)?|chart|diagram|number\s*line|histogram|box(-|\s)?(and(-|\s)?whisker\s*)?plot|dot\s*plot|line\s*plot|bar\s*graph|pie\s*chart|circle\s*graph|visuali[sz]e|picture\s+of\s+(the|this|that)\s+(graph|line|equation|function)|fraction\s*(bar|model|strip|circle)|tape\s*diagram|coordinate\s*plane)\b/i;
  const STOP = /\s+(?:and|then|also|on|from|for|with|in|where|please|pls|so|but|when|if|to show|showing|that|which|as|like|using|between)\b/i;
  /** does this message ask for a drawing? */
  const wants = text => WANTS.test(plain(text));
  /** the longest start of s that reads as an expression */
  function trimExpr(s, vars, fromLeft) {
    let w = s.trim().split(/\s+/);
    while (w.length) {
      const t = w.join(' ').replace(/[.,:;!?]+$/, '');
      try { const f = compile(t, vars); return { text: t, f }; } catch (e) { /* drop a word */ }
      if (fromLeft) w.shift(); else w.pop();
    }
    return null;
  }
  /** equations and inequalities written in a sentence: "graph y = 2x + 1 and y = -x + 4" */
  function relationsIn(text) {
    const s = plain(text).replace(/\s*(<=|>=|<|>|=)\s*/g, ' $1 ');
    const out = [];
    const ops = [...s.matchAll(/(<=|>=|<|>|=)/g)];
    ops.forEach((o, k) => {
      const before = s.slice(k ? ops[k - 1].index + ops[k - 1][0].length : 0, o.index);
      const after = s.slice(o.index + o[0].length, k + 1 < ops.length ? ops[k + 1].index : s.length);
      const fn = /([a-z])\s*\(\s*([a-z])\s*\)\s*$/i.exec(before);
      if (fn) {
        const r = trimExpr(after.split(/[;?!\n]|,(?![^()]*\))/)[0].split(STOP)[0], [fn[2].toLowerCase()]);
        if (r) out.push(`${fn[1]}(${fn[2]}) ${o[0]} ${r.text}`);
        return;
      }
      const lhs = trimExpr(before.split(/[;?!\n:]|,(?![^()]*\))|\.\s/).pop().replace(/^.*\b(?:graph|plot|sketch|draw|show)\b/i, ''), ['x', 'y'], true);
      if (!lhs) return;
      // the right side ends where the next equation's left side begins
      let rest = after.split(/[;?!\n]|,(?![^()]*\))|\.\s/)[0].split(STOP)[0];
      if (k + 1 < ops.length) { const nl = trimExpr(rest, ['x', 'y'], true); if (nl && nl.text.length < rest.trim().length) rest = rest.trim().slice(0, rest.trim().length - nl.text.length); }
      const rhs = trimExpr(rest, ['x', 'y']);
      if (!rhs) return;
      const rel = `${lhs.text} ${o[0]} ${rhs.text}`;
      try { if (relation(rel)) out.push(rel); } catch (e) { /* not drawable */ }
    });
    return out.filter((r, i) => out.indexOf(r) === i);
  }
  function pointLines(text) {
    return [...plain(text).matchAll(PT_RE)].map(m => { try { num(m[2]); num(m[3]); return `${m[1] ? m[1] : ''}(${m[2].trim()}, ${m[3].trim()})`; } catch (e) { return null; } }).filter(Boolean);
  }
  const fence = (kind, lines) => '```' + kind + '\n' + lines.join('\n') + '\n```';
  /** the drawing a message asks for, as a block, or null. prev is the last drawing in the chat. */
  function fromRequest(text, prev) {
    const s = plain(text);
    if (!wants(s)) return null;
    const low = s.toLowerCase();
    // number lines
    if (/number\s*line/.test(low)) {
      const lines = [];
      const ineq = [...s.matchAll(/(?:[-+]?\d[\d./ ]*\s*(?:<=|<|>=|>)\s*)?\bx\s*(?:<=|>=|<|>|=)\s*[-+]?\s*\d[\d./]*(?:\s+or\s+x\s*(?:<=|>=|<|>)\s*[-+]?\d[\d./]*)?/g)].map(m => m[0].trim());
      ineq.forEach(q => lines.push(q));
      const sum = /(-?\d+)\s*([+-])\s*\(?\s*(-?\d+)\s*\)?/.exec(s.replace(/\bx\b.*$/, ''));
      if (!lines.length && sum && /add|sum|plus|minus|subtract|\+|-\s*\(|jump|show/.test(low) && !/,/.test(s.slice(sum.index, sum.index + sum[0].length))) {
        const a = Number(sum[1]), b = Number(sum[3]) * (sum[2] === '-' ? -1 : 1);
        lines.push(`point ${a}`, `jump ${a} to ${a + b} "${b >= 0 ? '+' : '−'}${Math.abs(b)}"`, `point ${a + b} "${a + b}"`);
      }
      if (!lines.length) {
        const nums = (s.replace(/number\s*line/ig, '').match(/[-+]?\d+(?:\.\d+)?(?:\s*\/\s*\d+)?/g) || []).filter(isNum).slice(0, 12);
        if (nums.length) lines.push('points: ' + nums.join(', '));
      }
      return lines.length ? fence('numberline', lines) : null;
    }
    // charts from a list of numbers
    const type = chartType((/(box(-|\s)?(and(-|\s)?whisker)?\s*plot|dot\s*plot|line\s*plot|histogram|bar\s*(graph|chart)|pie\s*chart|circle\s*graph|line\s*graph)/i.exec(s) || [])[0]);
    if (type) {
      const lead = /\b(?:of|for|with)\b|:/.exec(s), after = lead ? s.slice(lead.index + lead[0].length) : s;
      const pairs = [...after.matchAll(/([A-Za-z][A-Za-z '-]{0,24}?)\s*[:=-]?\s+(\d+(?:\.\d+)?)\b/g)].filter(m => !/^(of|for|with|and|the|data|values|numbers|a|an)$/i.test(m[1].trim()));
      if ((type === 'bar' || type === 'pie' || type === 'line') && pairs.length >= 2) return fence('chart', [type].concat(pairs.map(m => `${m[1].trim().replace(/^(and|of|for)\s+/i, '')}: ${m[2]}`)));
      const nums = (after.match(/[-+]?\d+(?:\.\d+)?/g) || []).map(Number);
      if (nums.length >= 3) return fence('chart', [type, 'values: ' + nums.join(', ')]);
      return null;
    }
    // fraction models
    if (/fraction|model|shade|tape|pizza|pie/.test(low) && !/[xy]\s*[=<>]/.test(low)) {
      const fr = (s.match(/\b\d+\s+\d+\s*\/\s*\d+\b|\b\d+\s*\/\s*\d+\b|\b\d+(?:\.\d+)?\s*%/g) || []).slice(0, 4);
      if (fr.length) return fence('fraction', fr.map(f => (/circle|pie|pizza/.test(low) ? 'circle ' : /grid|percent|%/.test(low + f) ? 'grid ' : '') + f.trim()));
    }
    // graphs: equations, then points and shapes
    const rels = relationsIn(s);
    let lines = rels.slice();
    if (!lines.length) {
      const m = /\b(?:graph|plot|sketch|draw)\s+(?:me\s+)?(?:the\s+|a\s+)?(?:(?:graph|function|line|equation|parabola|curve|expression)\s+)?(?:of\s+)?(?:the\s+)?(?:(?:function|line|equation|parabola|curve)\s+)?([^,;?!\n]+)/i.exec(s);
      if (m) { const r = trimExpr(m[1].split(STOP)[0], ['x']); if (r && r.f.uses.has(0)) lines.push('y = ' + r.text); }
    }
    const pts = pointLines(s);
    if (pts.length) {
      if (/\b(triangle|rectangle|square|quadrilateral|polygon|shape|trapezoid|parallelogram|pentagon|hexagon|rhombus|kite)\b/i.test(s) && pts.length >= 3) lines.push((/triangle/i.test(s) ? 'triangle ' : 'polygon ') + pts.join(' '));
      else if (/\bsegment\b/i.test(s) && pts.length === 2) lines.push('segment ' + pts.join(' '), 'points ' + pts.join(' '));
      else if (/\bline\b/i.test(s) && pts.length === 2 && !rels.length) lines.push('line ' + pts.join(' '), 'points ' + pts.join(' '));
      else lines.push('points ' + pts.join(' '));
    }
    if (!lines.length) return null;
    // "add y = x to the graph" keeps what was drawn before
    if (prev && /^```graph/.test(prev) && /\b(add|also|too|as well|same graph|same axes|on top|keep|another)\b/i.test(s)) {
      const old = prev.replace(/^```graph\n|\n```$/g, '').split('\n');
      lines = old.concat(lines.filter(l => !old.includes(l)));
    }
    return fence('graph', lines);
  }
  /** a graph pulled from the tutor's answer when it described one in words (equations, points or a table) */
  function fromReply(reply) {
    const s = String(reply || '');
    if (/```/.test(s)) return null;
    const rels = relationsIn(s.replace(/\|/g, ' ')).filter(r => /\by\b|[a-z]\(x\)/.test(r) && !/^\s*-?\d+(\.\d+)?\s*=/.test(r)).slice(0, 4);
    let pts = pointLines(s);
    // a table with an x column and a y column
    const rows = s.split('\n').filter(l => /^\s*\|/.test(l));
    if (rows.length >= 3) {
      const head = rows[0].split('|').map(c => c.trim().toLowerCase());
      const xi = head.findIndex(c => /^x$|^x\b/.test(c)), yi = head.findIndex(c => /^y$|^y\b|^f\(x\)|^y =/.test(c));
      if (xi > 0 && yi > 0) rows.slice(1).forEach(r => { const c = r.split('|').map(t => t.trim()); if (isNum(c[xi]) && isNum(c[yi])) pts.push(`(${c[xi]}, ${c[yi]})`); });
    }
    pts = pts.filter((p, i) => pts.indexOf(p) === i).slice(0, 20);
    if (!rels.length && pts.length < 2) return null;
    const lines = rels.slice();
    if (pts.length) lines.push('points ' + pts.join(' '));
    return fence('graph', lines);
  }
  /** the tutor drew a graph too: fold its lines into the one Procademy drew, so there is one graph */
  function absorb(viz, content) {
    if (!viz || !/^```graph/.test(viz)) return { viz, content };
    const m = /```(?:graph|plot)?\s*\n([\s\S]*?)```/.exec(content || '');
    if (!m || kindOf(/```(\w*)/.exec(m[0])[1], m[1]) !== 'graph') return { viz, content };
    const old = viz.replace(/^```graph\n|\n```$/g, '').split('\n');
    const norm = l => plain(l).replace(/\s+/g, '').toLowerCase();
    const add = m[1].split('\n').map(l => l.trim()).filter(l => l && !old.some(o => norm(o) === norm(l)));
    return { viz: fence('graph', old.concat(add)), content: (content.slice(0, m.index) + content.slice(m.index + m[0].length)).replace(/\n{3,}/g, '\n\n').trim() };
  }
  /** a drawing in words, for the tutor: what is on it and the key points Procademy found */
  function describe(viz) {
    const m = /^```(\w+)\n([\s\S]*?)\n?```$/.exec(String(viz || '').trim());
    if (!m) return '';
    const kind = kindOf(m[1], m[2]); if (!kind) return '';
    const st = entry(kind, m[2]); if (!st) return '';
    if (kind === 'graph') {
      const keys = keyPoints(st.spec, st.home);
      return `a graph of ${describeItems(st.spec)}` + (keys.length ? `. Key points: ${keys.map(k => `${k.name} ${pt(k.x, k.y)}`).join('; ')}` : '');
    }
    if (kind === 'numberline') return 'a number line showing ' + st.spec.items.map(it => it.type === 'point' ? fracText(it.v) : it.type === 'jump' ? `a jump from ${fmt(it.a)} to ${fmt(it.b)}` : it.text).join('; ');
    if (kind === 'chart') return `a ${st.spec.type} chart. ${chartNote(st.spec)}`;
    return 'a fraction model of ' + st.spec.items.map(i => i.n + '/' + i.d).join(', ');
  }

  /** move a slider: the letter takes the value and the graph redraws within the frame (key points when let go) */
  let slideFrame = 0;
  function slide(fig, name, value) {
    const st = stateOf(fig); if (!st || st.kind !== 'graph') return;
    st.overrides[name] = value;
    st.spec = parseGraph(st.body, st.overrides);
    if (!slideFrame) slideFrame = requestAnimationFrame(() => { slideFrame = 0; if (fig.isConnected) redraw(fig, true); });
  }
  /** for each line of a graph: 'ok' (draws), 'param' (a slider), 'option' (a window, title…), 'empty' or 'error' */
  function lineStatus(lines) {
    // each line is read with the sliders, the functions defined (f(x) = …) and the angle unit, wherever they are
    const ctx = lines.filter(l => paramOf(l) || DEF_RE.test(plain(l).trim()) || DEG_LINE.test(plain(l)));
    let g0; try { g0 = parseGraph(ctx.join('\n')); } catch (e) { g0 = { skipped: 0 }; }
    return lines.map(l => {
      if (!plain(l).trim()) return 'empty';
      if (paramOf(l)) return 'param';
      let g; try { g = parseGraph(ctx.concat([l]).join('\n')); } catch (e) { return 'error'; }
      const mine = g.items.filter(it => it.src === ctx.length);
      if (mine.length) return mine.every(it => it.type === 'value' || it.of) ? 'value' : 'ok';
      return g.skipped > g0.skipped ? 'error' : 'option';
    });
  }
  /** for each line, the value it works out (f(3) = 8), or null */
  function values(lines) {
    let g; try { g = parseGraph(lines.join('\n')); } catch (e) { return lines.map(() => null); }
    return lines.map((l, i) => { const v = g.items.find(it => it.type === 'value' && it.src === i); return v ? v.show : null; });
  }
  /** text ↔ a link-safe code (base64url of UTF-8), for #/graph/<code> */
  function encode(t) { try { const b = new TextEncoder().encode(String(t)); let s = ''; b.forEach(x => { s += String.fromCharCode(x); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); } catch (e) { return ''; } }
  function decode(c) { try { const s = atob(String(c).replace(/-/g, '+').replace(/_/g, '/')); return new TextDecoder().decode(Uint8Array.from(s, ch => ch.charCodeAt(0))); } catch (e) { return null; } }
  /** for the graphing page: a graph's key points, its functions, and showing one point as a tap would */
  function keysOf(fig) { const st = stateOf(fig); return st && st.marks ? st.marks.filter(k => k.key).map(k => ({ x: k.x, y: k.y, name: k.name, label: pt(k.x, k.y) })) : []; }
  function fnsOf(fig) {
    const st = stateOf(fig);
    if (!st || !st.spec) return [];
    return st.spec.items.map((it, i) => ({ it, i })).filter(o => o.it.type === 'fn' && !st.hidden.has(o.i)).map(o => ({ f: o.it.f, text: o.it.text ? plain(o.it.text) : '', color: o.it.color, has: x => inDomain(o.it, x) }));
  }
  function showPoint(fig, x, y) {
    const st = stateOf(fig), svg = fig && fig.querySelector('svg');
    if (!st || !svg || !st.view) return;
    const r = svg.getBoundingClientRect(), v = st.view;
    hover(fig, r.left + (x - v.x0) / (v.x1 - v.x0) * r.width, r.top + (v.y1 - y) / (v.y1 - v.y0) * r.height);
  }
  const getView = fig => { const st = stateOf(fig); return st && st.view ? { view: Object.assign({}, st.view), moved: !!st.home && ['x0', 'x1', 'y0', 'y1'].some(k => Math.abs(st.view[k] - st.home[k]) > 1e-9) } : null; };
  function setView(fig, view) { const st = stateOf(fig); if (st && view) { st.view = Object.assign({}, view); redraw(fig); } }

  const DRAW = { compile, num, relation, parseGraph, paramOf, parseLine, parseChart, parseFraction, defaultView, keyPoints, five,
    figure, block, kindOf, wants, fromRequest, fromReply, absorb, describe, relationsIn, lineStatus, encode, decode, getView, setView, slide, wire, COLORS, keysOf, fnsOf, showPoint, _reg: REG, _hover: hover,
    values, valText, shareImage, pictureBlob, traceKey,
    /** a graph block in words, as a screen reader hears it */
    words: body => { let st = null; try { st = entry('graph', body); } catch (e) { st = null; } return st ? describeGraph(st) : ''; },
    /** does a graph block have a part where all its inequalities are true? */
    overlaps: body => { let st = null; try { st = entry('graph', body); } catch (e) { st = null; } return overlapOf(st); } };
  if (typeof window !== 'undefined') { window.DRAW = DRAW; wire(); }
  if (typeof module !== 'undefined') module.exports = DRAW;
})();
