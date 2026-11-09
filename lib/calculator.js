/* The calculator (#/calc): laid out like the graphing calculator students use in class (y= window zoom trace graph
   along the top, 2nd and alpha, the arrow pad, and every key's second function and letter printed above it), and
   it keeps fractions exact, so 1/3 + 1/4 is 7/12 and not 0.58333…
   - The home screen works as in class: the entry line, Enter puts the answer on the right, the arrows go back up
     the history to reuse a line, 2nd enter brings back the last entry, Ans, sto→ into the letters A to Z and θ,
     mode (degrees or radians, float or fixed decimals, fractions or decimals), and the math menu (►Frac, ►Dec…).
   - y= takes up to six functions of X; graph draws them, with window, zoom (ZBox, ZStandard, ZDecimal, ZTrig…),
     format, trace, the table (2nd graph) and 2nd trace's value, zero, minimum, maximum, intersect, dy/dx and the
     integral, found numerically on this device.
   - Beside it, the last answer is shown four ways (a fraction, a mixed number, a decimal with its repeating digits
     under a bar, and a percent), and "Step by step" works it in the order of operations, a level at a time,
     saying how each fraction sum, product or quotient was found.
   Exact numbers are BigInt fractions {q:true, n, d}; square roots of non-squares, trig, logs and π make
   decimals {q:false, v}. A decimal within a hair of a simple fraction (sin 30° → 0.49999999999999994) is
   taken as that fraction. The expression is parsed here, never run as code; graphs use a compiled copy of it in
   ordinary decimals. The history, functions, window and modes are kept on this device (procademy.calc.v1, one per
   learner). */
'use strict';
(function () {
  const V = window.VIEWS, H = V._h, esc = H.esc;
  const KEY = 'procademy.calc.v1';
  const LIMIT = 600;                       // digits: an exact number longer than this becomes a decimal

  class CalcError extends Error {}
  const fail = m => { throw new CalcError(m); };

  // ---- numbers
  const babs = x => (x < 0n ? -x : x);
  const bgcd = (a, b) => { a = babs(a); b = babs(b); while (b) [a, b] = [b, a % b]; return a; };
  const digits = x => babs(x).toString().length;
  function toNum(n, d) {
    const ln = digits(n), ld = digits(d);
    if (ln < 300 && ld < 300) return Number(n) / Number(d);
    const sn = Math.max(0, ln - 20), sd = Math.max(0, ld - 20);
    return Number(n / 10n ** BigInt(sn)) / Number(d / 10n ** BigInt(sd)) * 10 ** (sn - sd);
  }
  function F(v) {
    if (Number.isNaN(v)) fail('That isn’t a real number.');
    if (!Number.isFinite(v)) fail('That number is too large for this calculator.');
    return { q: false, v: v === 0 ? 0 : v };
  }
  function Q(n, d) {
    if (d === undefined) d = 1n;
    if (d === 0n) fail('You can’t divide by zero.');
    if (d < 0n) { n = -n; d = -d; }
    const g = bgcd(n, d) || 1n;
    n /= g; d /= g;
    if (digits(n) > LIMIT || digits(d) > LIMIT) return F(toNum(n, d));
    return { q: true, n, d };
  }
  const num = x => (x.q ? toNum(x.n, x.d) : x.v);
  const isInt = x => x.q && x.d === 1n;
  /** a decimal that is a simple fraction to 11 places becomes that fraction (sin 30° → 1/2, √2 × √2 → 2) */
  function snap(x) {
    if (x.q) return x;
    const v = x.v, a = Math.abs(v);
    if (a < 1e-12) return Q(0n);
    if (a > 1e9) return x;
    let h0 = 0, h1 = 1, k0 = 1, k1 = 0, y = a;
    for (let i = 0; i < 24; i++) {
      const w = Math.floor(y);
      [h0, h1] = [h1, w * h1 + h0]; [k0, k1] = [k1, w * k1 + k0];
      if (k1 > 1000) break;
      if (Math.abs(h1 / k1 - a) <= 1e-11 * Math.max(1, a)) return Q(BigInt(v < 0 ? -h1 : h1), BigInt(k1));
      const f = y - w; if (f < 1e-12) break; y = 1 / f;
    }
    return x;
  }

  const add = (a, b) => (a.q && b.q ? Q(a.n * b.d + b.n * a.d, a.d * b.d) : F(num(a) + num(b)));
  const sub = (a, b) => (a.q && b.q ? Q(a.n * b.d - b.n * a.d, a.d * b.d) : F(num(a) - num(b)));
  const mul = (a, b) => (a.q && b.q ? Q(a.n * b.n, a.d * b.d) : F(num(a) * num(b)));
  function div(a, b) { if (num(b) === 0) fail('You can’t divide by zero.'); return a.q && b.q ? Q(a.n * b.d, a.d * b.n) : F(num(a) / num(b)); }
  /** the whole-number k-th root of x ≥ 0, or null when x is not a perfect k-th power */
  function iroot(x, k) {
    if (x < 2n) return x;
    const K = BigInt(k);
    let r = 1n << BigInt(Math.ceil(x.toString(2).length / k));
    for (;;) { const nr = ((K - 1n) * r + x / r ** (K - 1n)) / K; if (nr >= r) break; r = nr; }
    return r ** K === x ? r : null;
  }
  function pow(a, b) {
    if (isInt(b)) {
      const k = b.n, kk = babs(k);
      if (a.q) {
        if (a.n === 0n && k < 0n) fail('You can’t divide by zero.');
        if (k === 0n) return Q(1n);
        if (kk <= 5000n && (digits(a.n) + digits(a.d)) * Number(kk) <= 2 * LIMIT) {
          const p = Q(a.n ** kk, a.d ** kk);
          return k < 0n ? div(Q(1n), p) : p;
        }
      }
      return F(Math.pow(num(a), num(b)));
    }
    if (b.q && a.q && a.n >= 0n && b.d <= 12n) {          // a root that comes out exactly: 9^(1/2), 8^(2/3)
      const rn = iroot(a.n, Number(b.d)), rd = iroot(a.d, Number(b.d));
      if (rn !== null && rd !== null) return pow(Q(rn, rd), Q(b.n));
    }
    const x = num(a), y = num(b);
    if (x < 0 && b.q && b.d % 2n === 1n) return F((b.n % 2n === 0n ? 1 : -1) * Math.pow(-x, y));   // odd roots of negatives are real
    if (x < 0) fail('An even root of a negative number isn’t a real number.');
    return F(Math.pow(x, y));
  }
  function fact(a) {
    if (!isInt(a) || a.n < 0n) fail('Factorial (!) is for whole numbers: 0, 1, 2, 3, …');
    if (a.n > 250n) fail('That factorial is too large for this calculator.');
    let r = 1n; for (let i = 2n; i <= a.n; i++) r *= i;
    return Q(r);
  }
  const NAMES = { sqrt: '√', cbrt: '∛', abs: '|x|', sin: 'sin', cos: 'cos', tan: 'tan', asin: 'sin⁻¹', acos: 'cos⁻¹', atan: 'tan⁻¹', log: 'log', ln: 'ln', ipart: 'iPart', fpart: 'fPart', int: 'int' };
  function fn(name, a, deg) {
    if (name === 'sqrt') { if (num(a) < 0) fail('The square root of a negative number isn’t a real number.'); return pow(a, Q(1n, 2n)); }
    if (name === 'cbrt') return pow(a, Q(1n, 3n));
    if (name === 'abs') return a.q ? Q(babs(a.n), a.d) : F(Math.abs(a.v));
    if (name === 'ipart' || name === 'fpart' || name === 'int') {          // the whole-number part (toward 0), what is left, and the floor
      let w;
      if (a.q) { w = a.n / a.d; if (name === 'int' && a.n < 0n && a.n % a.d !== 0n) w -= 1n; w = Q(w); }
      else w = F(name === 'int' ? Math.floor(a.v) : Math.trunc(a.v));
      return name === 'fpart' ? sub(a, w) : w;
    }
    const x = num(a);
    if (name === 'log' || name === 'ln') {
      if (x <= 0) fail(`${name} only takes numbers greater than 0.`);
      if (name === 'log' && a.q) {                       // log of 1000 or 1/100 is exactly 3 or −2
        const p = a.n === 1n ? a.d : a.d === 1n ? a.n : 0n, s = p.toString();
        if (p > 0n && /^10*$/.test(s)) return Q(BigInt((a.n === 1n ? -1 : 1) * (s.length - 1)));
      }
      return F(name === 'log' ? Math.log10(x) : Math.log(x));
    }
    if (name[0] === 'a') {
      if (name !== 'atan' && Math.abs(x) > 1) fail(`${NAMES[name]} only takes numbers from −1 to 1.`);
      const r = Math[name](x);
      return F(deg ? r * 180 / Math.PI : r);
    }
    if (name === 'tan' && deg && Math.abs((((x % 180) + 180) % 180) - 90) < 1e-9) fail('tan 90° isn’t defined: the line would be vertical.');
    return F(Math[name](deg ? x * Math.PI / 180 : x));
  }

  // ---- reading an expression
  const FNS = { sin: 'sin', cos: 'cos', tan: 'tan', asin: 'asin', acos: 'acos', atan: 'atan', arcsin: 'asin', arccos: 'acos', arctan: 'atan', sqrt: 'sqrt', root: 'sqrt', cbrt: 'cbrt', abs: 'abs', log: 'log', ln: 'ln', ipart: 'ipart', fpart: 'fpart', int: 'int' };
  /** the words of a calculator line with letters in it (opts.vars), longest first; any other capital, θ, and x are letters
      that hold numbers, so 2Asin(X) is 2 × A × sin(X) */
  const WORDS = ['arcsin', 'arccos', 'arctan', 'iPart', 'fPart', 'asin', 'acos', 'atan', 'sqrt', 'root', 'cbrt', 'Ans', 'ans', 'abs', 'log', 'sin', 'cos', 'tan', 'int', 'ln', 'pi', 'of', 'e'];
  /** tokens; a slash between two whole numbers is a fraction that stays together (2/3 ÷ 4/9 is ⅔ ÷ 4/9), while ÷ divides */
  function tokenize(src, opts) {
    const vars = !!(opts && opts.vars);
    const s = String(src).replace(/[−–—]/g, '-').replace(/[×·∙]/g, '*').replace(/\*\*/g, '^').replace(/[[{]/g, '(').replace(/[\]}]/g, ')');
    const out = [];
    let i = 0, m;
    while (i < s.length) {
      const c = s[i], rest = s.slice(i);
      if (/\s/.test(c)) { i++; continue; }
      if ((m = /^(\d{1,3}(?:,\d{3})+|\d+)\s*\/\s*(\d{1,3}(?:,\d{3})+|\d+)(?![\d.])/.exec(rest))) { out.push({ t: 'num', s: m[1] + '/' + m[2] }); i += m[0].length; continue; }
      if ((m = /^(?:(?:(\d{1,3}(?:,\d{3})+|\d+)(\.\d*)?|\.\d+)(?:ᴇ[-−]?\d+)?|ᴇ[-−]?\d+)/.exec(rest))) { out.push({ t: 'num', s: m[0] }); i += m[0].length; continue; }
      if (vars && (m = /^[a-zA-Z]+/.exec(rest))) {
        const word = m[0];
        i += word.length;
        for (let j = 0; j < word.length;) {
          const hit = WORDS.find(k => word.startsWith(k, j));
          if (!hit) {
            if (!/[A-Zx]/.test(word[j])) fail(`This calculator doesn’t recognize “${word}”. Use +, −, ×, ÷, ^, √, sin, cos, tan, log, ln or π, and capital letters for stored numbers.`);
            out.push({ t: 'const', s: word[j].toUpperCase() }); j++; continue;
          }
          j += hit.length;
          const w = hit.toLowerCase();
          if (w === 'pi') out.push({ t: 'const', s: 'π' });
          else if (w === 'e' || w === 'ans') out.push({ t: 'const', s: w === 'e' ? 'e' : 'Ans' });
          else if (w === 'of') out.push({ t: 'op', s: 'of' });
          else if (j === word.length && /^(sin|cos|tan)$/.test(w) && s.startsWith('⁻¹', i)) { out.push({ t: 'fn', s: 'a' + w }); i += 2; }
          else out.push({ t: 'fn', s: FNS[w] });
        }
        continue;
      }
      if ((m = /^[a-zA-Z]+/.exec(rest))) {
        let w = m[0].toLowerCase();
        i += m[0].length;
        if (s.startsWith('⁻¹', i) && /^(sin|cos|tan)$/.test(w)) { w = 'a' + w; i += 2; }
        if (FNS[w]) out.push({ t: 'fn', s: FNS[w] });
        else if (w === 'pi') out.push({ t: 'const', s: 'π' });
        else if (w === 'e' || w === 'ans') out.push({ t: 'const', s: w === 'e' ? 'e' : 'Ans' });
        else if (w === 'of') out.push({ t: 'op', s: 'of' });
        else if (w === 'x') out.push({ t: 'op', s: '*' });
        else fail(`This calculator doesn’t recognize “${m[0]}”. Use +, −, ×, ÷, ^, √, %, sin, cos, tan, log, ln or π.`);
        continue;
      }
      if (s.startsWith('⁻¹', i)) { out.push({ t: 'sq', s: '-1' }); i += 2; continue; }          // x⁻¹, one over x
      i++;
      if (vars && c === 'θ') out.push({ t: 'const', s: 'θ' });
      else if ('+-*/^()%!'.includes(c)) out.push({ t: 'op', s: c });
      else if (c === '÷') out.push({ t: 'op', s: '/' });
      else if (c === '√' || c === '∛') out.push({ t: 'fn', s: c === '√' ? 'sqrt' : 'cbrt' });
      else if (c === 'π') out.push({ t: 'const', s: 'π' });
      else if (c === '²' || c === '³') out.push({ t: 'sq', s: c === '²' ? '2' : '3' });
      else if (c === ',') fail('Use a decimal point for decimals (2.5), and commas only in large numbers (1,000).');
      else fail(`This calculator doesn’t recognize “${c}”.`);
    }
    return out;
  }
  function literal(s) {
    if (s.includes('/')) { const [a, b] = s.replace(/,/g, '').split('/'); return Q(BigInt(a), BigInt(b)); }
    const [mant, ex = '0'] = s.replace(/,/g, '').replace(/−/g, '-').split('ᴇ');          // 2.5ᴇ3 is 2.5 × 10³
    if (Math.abs(Number(ex)) > 99) fail('The power of 10 after ᴇ can be at most 99.');
    const [w, f = ''] = (mant || '1').split('.'), k = BigInt(ex);
    const n = BigInt((w || '0') + f) * (k > 0n ? 10n ** k : 1n), d = 10n ** BigInt(f.length) * (k < 0n ? 10n ** -k : 1n);
    return Q(n, d);
  }
  /** the expression as a tree; every node knows how many brackets are around it (dp), for the steps */
  function parse(src, opts) {
    const T = tokenize(src, opts);
    if (!T.length) return null;
    let p = 0, dp = 0;
    const peek = () => T[p], next = () => T[p++];
    const isOp = (tk, s) => tk && tk.t === 'op' && tk.s === s;
    const starts = tk => tk && (tk.t === 'num' || tk.t === 'const' || tk.t === 'fn' || isOp(tk, '('));
    const shown = s => ({ '*': '×', '/': '÷', '-': '−' }[s] || s);
    function expr() {
      let a = term();
      while (isOp(peek(), '+') || isOp(peek(), '-')) { const o = next().s; a = { k: 'bin', op: o === '-' ? '−' : '+', a, b: term(), dp }; }
      return a;
    }
    function term() {
      let a = unary();
      for (;;) {
        const tk = peek();
        if (isOp(tk, '*') || isOp(tk, '/') || isOp(tk, 'of')) { next(); a = { k: 'bin', op: tk.s === '*' ? '×' : tk.s === '/' ? '÷' : 'of', a, b: unary(), dp }; }
        else if (starts(tk)) a = { k: 'bin', op: '×', a, b: power(), dp };          // 2π, 3(4 + 1)
        else return a;
      }
    }
    function unary() {
      if (isOp(peek(), '-')) { next(); return { k: 'neg', a: unary(), dp }; }
      if (isOp(peek(), '+')) { next(); return unary(); }
      return power();
    }
    function power() {
      const a = postfix();
      if (isOp(peek(), '^')) { next(); return { k: 'bin', op: '^', a, b: unary(), dp }; }
      return a;
    }
    function postfix() {
      let a = primary();
      for (;;) {
        const tk = peek();
        if (isOp(tk, '%')) { next(); a = { k: 'pct', a, dp }; }
        else if (isOp(tk, '!')) { next(); a = { k: 'fact', a, dp }; }
        else if (tk && tk.t === 'sq') { next(); a = { k: 'bin', op: '^', a, b: { k: 'num', val: Q(BigInt(tk.s)), src: tk.s }, dp }; }
        else return a;
      }
    }
    function close() { if (isOp(peek(), ')')) next(); else if (peek()) fail('A “(” needs a “)”.'); }
    function primary() {
      const tk = next();
      if (!tk) fail('Something is missing at the end.');
      if (tk.t === 'num') return { k: 'num', val: literal(tk.s), src: tk.s };
      if (tk.t === 'const') return { k: 'const', name: tk.s };
      if (tk.t === 'fn') {
        let a;
        if (isOp(peek(), '(')) { next(); dp++; a = expr(); dp--; close(); }
        else if (isOp(peek(), '-')) { next(); dp++; a = { k: 'neg', a: postfix(), dp }; dp--; }
        else if (starts(peek())) a = postfix();
        else fail(`${NAMES[tk.s]} needs a number after it.`);
        return { k: 'fn', name: tk.s, a, dp };
      }
      if (isOp(tk, '(')) { dp++; const a = expr(); dp--; close(); return { k: 'paren', a, dp }; }
      if (tk.t === 'sq') fail('² needs a number before it.');
      fail(isOp(tk, ')') ? 'There is a “)” without a matching “(” before it.' : `Something is missing before “${shown(tk.s)}”.`);
    }
    const tree = expr();
    if (p < T.length) fail(isOp(T[p], ')') ? 'There is a “)” without a matching “(” before it.' : `The calculation can’t be read at “${shown(T[p].s)}”.`);
    return tree;
  }

  // ---- working it out
  const isLeaf = nd => nd.k === 'num' || nd.k === 'const' || nd.k === 'val';
  function leaf(nd, ctx) {
    if (nd.k !== 'const') return nd.val;
    if (nd.name === 'π') return F(Math.PI);
    if (nd.name === 'e') return F(Math.E);
    if (nd.name !== 'Ans') return (ctx.vars && ctx.vars[nd.name]) || Q(0n);          // a letter: the number stored in it, or 0
    return ctx.ans || fail('There is no previous answer to use as Ans. Complete a calculation first.');
  }
  function apply(nd, a, b, ctx) {
    let r;
    if (nd.k === 'paren') r = a;
    else if (nd.k === 'neg') r = mul(Q(-1n), a);
    else if (nd.k === 'pct') r = div(a, Q(100n));
    else if (nd.k === 'fact') r = fact(a);
    else if (nd.k === 'fn') r = fn(nd.name, a, ctx.deg);
    else r = nd.op === '+' ? add(a, b) : nd.op === '−' ? sub(a, b) : nd.op === '÷' ? div(a, b) : nd.op === '^' ? pow(a, b) : mul(a, b);
    return snap(r);
  }
  function evaluate(nd, ctx) {
    if (isLeaf(nd)) return leaf(nd, ctx);
    return apply(nd, evaluate(nd.a, ctx), nd.b ? evaluate(nd.b, ctx) : null, ctx);
  }

  // ---- showing numbers and expressions (html: stacked fractions and superscripts; text: 7/12 and ^)
  const group = x => babs(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const fracHtml = (a, b) => `<span class="frac"><span class="num">${a}</span><span class="den">${b}</span></span>`;
  function dec(v, sig, html) {
    if (v === 0) return '0';
    const a = Math.abs(v), sign = v < 0 ? '−' : '';
    if (a >= 1e12 || a < 1e-6) {
      const [m, e] = a.toExponential(sig - 1).split('e');
      const mm = m.replace(/\.?0+$/, '');
      return `${sign}${mm} × 10${html ? `<sup>${Number(e)}</sup>` : '^' + Number(e)}`;
    }
    const [w, f] = String(Number(a.toPrecision(sig))).split('.');
    return sign + w.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (f ? '.' + f : '');
  }
  /** how many decimal places n/d has if its decimal ends (1/8 → 3), or −1 if it repeats */
  function places(d) {
    let k2 = 0, k5 = 0;
    while (d % 2n === 0n) { d /= 2n; k2++; }
    while (d % 5n === 0n) { d /= 5n; k5++; }
    return d === 1n ? Math.max(k2, k5) : -1;
  }
  /** a value as {s, p}: p is how tightly it binds (6 a plain number, 4 a stacked fraction, 3 a negative).
      With asDec (the learner typed decimals), a fraction whose decimal ends is shown as that decimal. */
  function valOut(v, html, asDec) {
    if (!v.q) return { s: dec(v.v, 8, html), p: v.v < 0 ? 3 : 6, neg: v.v < 0 };
    const neg = v.n < 0n ? '−' : '';
    if (v.d === 1n) return { s: neg + group(v.n), p: neg ? 3 : 6, neg: !!neg };
    const k = asDec ? places(v.d) : -1;
    if (k >= 0 && k <= 12) return { s: decText(v.n, v.d), p: neg ? 3 : 6, neg: !!neg };
    return { s: neg + (html ? fracHtml(group(v.n), group(v.d)) : `${group(v.n)}/${group(v.d)}`), p: neg ? 3 : html ? 4 : 2, neg: !!neg };
  }
  const BIN = { '+': 1, '−': 1, '×': 2, '÷': 2, of: 2, '^': 4 };
  function out(nd, html, ctx) {
    const wrap = (o, yes) => (yes ? `(${o.s})` : o.s);
    if (nd.k === 'num' && nd.src.includes('/')) { const [a, b] = nd.src.split('/'); return html ? { s: fracHtml(esc(a), esc(b)), p: 4 } : { s: esc(nd.src), p: 2 }; }
    if (nd.k === 'num') return { s: esc(nd.src), p: 6 };
    if (nd.k === 'const') return { s: nd.name, p: 6 };
    if (nd.k === 'val') return valOut(nd.val, html, ctx && ctx.dec);
    const a = out(nd.a, html, ctx);
    if (nd.k === 'paren') return { s: `(${a.s})`, p: 6 };
    if (nd.k === 'neg') return { s: '−' + wrap(a, a.p <= 3), p: 3, neg: true };
    if (nd.k === 'pct' || nd.k === 'fact') return { s: wrap(a, a.p < 6) + (nd.k === 'pct' ? '%' : '!'), p: 5 };
    if (nd.k === 'fn') {
      if (nd.name === 'abs') return { s: `|${a.s}|`, p: 6 };
      if (nd.name === 'sqrt' || nd.name === 'cbrt') return { s: NAMES[nd.name] + wrap(a, !(isLeaf(nd.a) && a.p === 6)), p: 6 };
      const deg = ctx && ctx.deg && /^(sin|cos|tan)$/.test(nd.name) && isLeaf(nd.a) ? '°' : '';
      return { s: `${NAMES[nd.name]}(${a.s}${deg})`, p: 6 };
    }
    const b = out(html && nd.op === '^' && nd.b.k === 'paren' ? nd.b.a : nd.b, html, ctx), P = BIN[nd.op];          // a raised power needs no parentheses: e^(2x) is e²ˣ
    if (nd.op === '^') return { s: wrap(a, a.p <= 4) + (html ? `<sup>${b.s}</sup>` : '^' + wrap(b, b.p < 6)), p: 4 };
    return { s: `${wrap(a, a.p < P)} ${nd.op} ${wrap(b, b.p < P || (b.p === P && P === 2) || b.neg)}`, p: P };
  }

  // ---- step by step
  const CLS = { paren: 6, fn: 5, fact: 5, pct: 5, '^': 4, neg: 3, '×': 2, '÷': 2, of: 2, '+': 1, '−': 1 };
  const prio = nd => (nd.dp || 0) * 10 + CLS[nd.k === 'bin' ? nd.op : nd.k];
  function ready(nd, list) {
    if (isLeaf(nd)) return list;
    const kids = nd.b ? [nd.a, nd.b] : [nd.a];
    if (kids.every(isLeaf)) list.push(nd); else kids.forEach(k => ready(k, list));
    return list;
  }
  function rebuild(nd, f) {
    if (isLeaf(nd)) return nd;
    const r = f(nd);
    if (r) return r;
    const o = Object.assign({}, nd, { a: rebuild(nd.a, f) });
    if (nd.b) o.b = rebuild(nd.b, f);
    return o;
  }
  const ft = v => valOut(v, false).s;
  const fp = v => (v.q && v.n < 0n ? `(${ft(v)})` : ft(v));            // a negative on the right of a sign: 3 × (−2)
  const fr = (n, d) => (n < 0n ? '−' : '') + group(n) + '/' + group(d);
  const lcm = (a, b) => a / bgcd(a, b) * b;
  /** how a step with fractions was done, in words; sa and sb are the numbers as they were shown */
  function note(nd, a, b, r, sa, sb) {
    if (!a || !a.q || (b && !b.q) || !r.q) return '';
    if (nd.k === 'pct') return a.d === 1n ? `${sa}% means ${sa} out of 100: ${sa}/100${r.d !== 100n ? ` = ${ft(r)}` : ''}.` : `${sa}% = ${sa} ÷ 100 = ${ft(r)}.`;
    if (nd.k !== 'bin' || nd.op === '^' || (a.d === 1n && b.d === 1n && nd.op !== '÷' && nd.op !== 'of')) return '';
    if (nd.op === 'of') return `“of” means times: ${sa} × ${sb} = ${ft(r)}.`;
    if (nd.op === '+' || nd.op === '−') {
      if (a.d === b.d) return `Same denominator, so ${nd.op === '+' ? 'add' : 'subtract'} the numerators: ${ft(a)} ${nd.op} ${fp(b)} = ${ft(r)}.`;
      const L = lcm(a.d, b.d), x = a.n * (L / a.d), y = b.n * (L / b.d), t = nd.op === '+' ? x + y : x - y;
      return `Common denominator ${group(L)}: ${fr(x, L)} ${nd.op} ${y < 0n ? `(${fr(y, L)})` : fr(y, L)} = ${fr(t, L)}${Q(t, L).d !== L ? ` = ${ft(r)}` : ''}.`;
    }
    if (nd.op === '×') return `Multiply the numerators and the denominators: ${fr(a.n * b.n, a.d * b.d)}${a.d * b.d !== r.d ? ` = ${ft(r)}` : ''}.`;
    if (nd.op === '÷') {
      if (b.n === 0n) return '';
      if (a.d === 1n && b.d === 1n) return r.d === 1n ? '' : `${sa} ÷ ${sb} as a fraction is ${fr(a.n, b.n)}${r.d !== babs(b.n) ? ` = ${ft(r)}` : ''}.`;
      const rec = Q(b.d, b.n);
      return `Dividing by ${sb.includes('.') ? sb : fp(b)} is multiplying by its reciprocal, ${ft(rec)}: ${sa.includes('.') ? sa : ft(a)} × ${fp(rec)} = ${ft(r)}.`;
    }
    return '';
  }
  function steps(tree, ctx) {
    let cur = tree, approx = false;
    const lines = [{ html: out(cur, true, ctx).s, notes: [], approx }];
    for (let guard = 0; !isLeaf(cur) && guard < 40; guard++) {
      const list = ready(cur, []), top = Math.max(...list.map(prio)), notes = [];
      cur = rebuild(cur, nd => {
        if (!list.includes(nd) || prio(nd) !== top) return null;
        const a = leaf(nd.a, ctx), b = nd.b ? leaf(nd.b, ctx) : null, r = apply(nd, a, b, ctx);
        if (!r.q) approx = true;
        const t = note(nd, a, b, r, out(nd.a, false, ctx).s, nd.b ? out(nd.b, false, ctx).s : '');
        if (t) notes.push(t);
        return { k: 'val', val: r };
      });
      cur = rebuild(cur, nd => (nd.k === 'paren' && isLeaf(nd.a) ? nd.a : null));
      const html = out(cur, true, ctx).s, last = lines[lines.length - 1];
      if (html !== last.html) lines.push({ html, notes, approx });
      else last.notes.push(...notes);
    }
    return lines;
  }

  // ---- an answer in every form
  /** n/d as a decimal with the repeating part found: 7/12 → 0.58 and 3 repeating */
  function decimalParts(n, d, max) {
    const neg = n < 0n;
    n = babs(n);
    const whole = n / d, seen = new Map();
    let r = n % d, ds = '';
    while (r !== 0n && ds.length < (max || 60)) {
      if (seen.has(r)) { const i = seen.get(r); return { neg, whole, fix: ds.slice(0, i), rep: ds.slice(i) }; }
      seen.set(r, ds.length);
      r *= 10n; ds += (r / d).toString(); r %= d;
    }
    return { neg, whole, fix: ds, rep: '', cut: r !== 0n };
  }
  function decHtml(n, d) {
    const x = decimalParts(n, d);
    const w = (x.neg && (x.whole || x.fix || x.rep) ? '−' : '') + group(x.whole);
    if (!x.fix && !x.rep) return w;
    return `${w}.${x.fix}${x.rep ? `<span class="cx-rep" title="These digits repeat forever">${x.rep}</span>` : ''}${x.cut ? '…' : ''}`;
  }
  const decText = (n, d) => { const x = decimalParts(n, d, 12); return (x.neg ? '−' : '') + group(x.whole) + (x.fix || x.rep ? '.' + x.fix + (x.rep ? x.rep + x.rep + '…' : '') : '') + (x.cut ? '…' : ''); };
  /** the answer: { text, html (the big line), forms: [[label, html]], exact, int }; asDec when decimals were typed */
  function answer(v, asDec) {
    if (!v.q) {
      return { text: '≈ ' + dec(v.v, 10, false), html: `<span class="cx-eq">≈</span> ${dec(v.v, 10, true)}`, forms: [], exact: false, value: v };
    }
    const forms = [];
    if (v.d === 1n) {
      const big = digits(v.n) > 15;
      if (big) forms.push(['About', dec(toNum(v.n, 1n), 6, true)]);
      return { text: '= ' + (v.n < 0n ? '−' : '') + group(v.n), html: `<span class="cx-eq">=</span> <span class="${big ? 'cx-long' : ''}">${valOut(v, true).s}</span>`, forms, exact: true, int: true, value: v };
    }
    const neg = v.n < 0n ? '−' : '', an = babs(v.n);
    forms.push(['Fraction', valOut(v, true).s]);
    if (an > v.d) forms.push(['Mixed number', `${neg}${group(an / v.d)} ${fracHtml(group(an % v.d), group(v.d))}`]);
    forms.push(['Decimal', decHtml(v.n, v.d)]);
    forms.push(['Percent', decHtml(v.n * 100n, v.d) + '%']);
    const k = asDec ? places(v.d) : -1;
    if (k >= 0 && k <= 12) return { text: '= ' + decText(v.n, v.d), html: `<span class="cx-eq">=</span> ${decText(v.n, v.d)}`, forms, exact: true, value: v };
    return { text: '= ' + ft(v), html: `<span class="cx-eq">=</span> ${valOut(v, true).s}`, forms, exact: true, value: v };
  }
  /** work out an expression: { tree, value, answer, steps } or { error } (empty input gives {}) */
  function calc(src, ctx) {
    ctx = Object.assign({ deg: true, ans: null }, ctx, { dec: /\d\.\d|(^|[^\d])\.\d|ᴇ/.test(String(src)) });
    try {
      const tree = parse(src, { vars: !!ctx.vars });
      if (!tree) return {};
      const value = evaluate(tree, ctx);
      let st = [];
      try { st = steps(tree, ctx); } catch (e) { if (!(e instanceof CalcError)) throw e; }
      return { tree, value, answer: answer(value, ctx.dec), steps: st, echo: out(tree, true, ctx).s, plain: out(tree, false, ctx).s };
    } catch (e) {
      if (e instanceof CalcError) return { error: e.message };
      if (e instanceof RangeError) return { error: 'That number is too large for this calculator.' };
      throw e;
    }
  }

  // ---- graphing: a Y= line as a function of x, worked in ordinary decimals so a graph draws quickly
  const hasX = nd => (nd.k === 'const' ? nd.name === 'X' : !!((nd.a && hasX(nd.a)) || (nd.b && hasX(nd.b))));
  const FLOAT = {
    sqrt: v => (v < 0 ? NaN : Math.sqrt(v)), cbrt: Math.cbrt, abs: Math.abs, log: v => (v > 0 ? Math.log10(v) : NaN), ln: v => (v > 0 ? Math.log(v) : NaN),
    sin: (v, D) => Math.sin(v * D), cos: (v, D) => Math.cos(v * D), tan: (v, D) => Math.tan(v * D),
    asin: (v, D) => Math.asin(v) / D, acos: (v, D) => Math.acos(v) / D, atan: (v, D) => Math.atan(v) / D,
    ipart: Math.trunc, fpart: v => v - Math.trunc(v), int: Math.floor,
  };
  function compile(nd, ctx) {
    const c = n => compile(n, ctx), D = ctx.deg ? Math.PI / 180 : 1;
    if (nd.k === 'num' || nd.k === 'val') { const v = num(nd.val); return () => v; }
    if (nd.k === 'const') {
      if (nd.name === 'X') return x => x;
      let v; try { v = num(leaf(nd, ctx)); } catch (e) { v = NaN; }
      return () => v;
    }
    if (nd.k === 'paren') return c(nd.a);
    const f = c(nd.a);
    if (nd.k === 'neg') return x => -f(x);
    if (nd.k === 'pct') return x => f(x) / 100;
    if (nd.k === 'fact') return x => { const v = f(x); if (!(v >= 0) || v !== Math.floor(v) || v > 170) return NaN; let r = 1; for (let i = 2; i <= v; i++) r *= i; return r; };
    if (nd.k === 'fn') { const g = FLOAT[nd.name]; return x => g(f(x), D); }
    const g = c(nd.b);
    if (nd.op === '+') return x => f(x) + g(x);
    if (nd.op === '−') return x => f(x) - g(x);
    if (nd.op === '×' || nd.op === 'of') return x => f(x) * g(x);
    if (nd.op === '÷') return x => { const d = g(x); return d === 0 ? NaN : f(x) / d; };
    // a power: an odd root of a negative is real, so x^(1/3) and x^(2/3) draw on both sides
    let q = null;
    if (!hasX(nd.b)) { try { const e = evaluate(nd.b, ctx); if (e.q && e.d !== 1n && e.d % 2n === 1n) q = e; } catch (e) { q = null; } }
    return x => { const a = f(x), b = g(x); if (a < 0 && q) { const r = Math.pow(-a, b); return q.n % 2n === 0n ? r : -r; } return Math.pow(a, b); };
  }
  // ---- finding things on a graph, numerically
  function bisect(f, a, b) {
    let fa = f(a);
    for (let i = 0; i < 100; i++) { const m = (a + b) / 2, fm = f(m); if (fm === 0) return m; if ((fm < 0) === (fa < 0)) { a = m; fa = fm; } else b = m; }
    return (a + b) / 2;
  }
  /** where g is smallest between a and b (golden section) */
  function golden(g, a, b) {
    const r = (Math.sqrt(5) - 1) / 2;
    for (let i = 0; i < 100; i++) { const c = b - r * (b - a), d = a + r * (b - a); if (g(c) < g(d)) b = d; else a = c; }
    return (a + b) / 2;
  }
  /** the lowest point of f (sign 1) or the highest (sign −1) between a and b, or null */
  function extreme(f, a, b, sign) {
    const g = x => { const y = f(x) * sign; return Number.isFinite(y) ? y : Infinity; }, N = 400;
    let best = -1, bv = Infinity;
    for (let i = 0; i <= N; i++) { const v = g(a + (b - a) * i / N); if (v < bv) { bv = v; best = i; } }
    if (best < 0) return null;
    return golden(g, a + (b - a) * Math.max(0, best - 1) / N, a + (b - a) * Math.min(N, best + 1) / N);
  }
  /** the zero of f between a and b nearest the guess, or null; a sign change at an asymptote isn't a zero */
  function zeroNear(f, a, b, guess) {
    const N = 400, found = [];
    let x0 = a, y0 = f(a);
    for (let i = 1; i <= N; i++) {
      const x1 = a + (b - a) * i / N, y1 = f(x1);
      if (Number.isFinite(y0) && Number.isFinite(y1)) {
        if (y0 === 0) found.push(x0);
        else if (y1 !== 0 && (y0 < 0) !== (y1 < 0)) { const r = bisect(f, x0, x1), fr = f(r); if (Number.isFinite(fr) && Math.abs(fr) <= 1e-6 * Math.max(1, Math.abs(y0), Math.abs(y1))) found.push(r); }
      }
      x0 = x1; y0 = y1;
    }
    if (y0 === 0) found.push(b);
    if (!found.length) { const m = extreme(x => Math.abs(f(x)), a, b, 1); if (m !== null && Math.abs(f(m)) < 1e-7) found.push(m); }      // a graph that only touches 0
    return found.length ? found.reduce((p, x) => (Math.abs(x - guess) < Math.abs(p - guess) ? x : p)) : null;
  }
  /** a number found by searching, without the last-digit noise: 1.9999999998 → 2 */
  const clean = x => (Math.abs(x - Math.round(x)) < 1e-7 ? Math.round(x) : Number(x.toPrecision(10))) || 0;

  // ---- the page: laid out like the graphing calculator used in class
  function load() { try { const o = JSON.parse(localStorage.getItem(KEY) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* a private window: nothing is kept */ } }
  const ansFrom = a => (a && typeof a === 'object' ? (typeof a.v === 'number' ? F(a.v) : /^-?\d+$/.test(a.n) && /^\d+$/.test(a.d) && a.d !== '0' ? Q(BigInt(a.n), BigInt(a.d)) : null) : null);
  const ansTo = v => (v.q ? { n: v.n.toString(), d: v.d.toString() } : { v: v.v });

  const NY = 6, ROWS = 8, STEPS = 264;                     // Y= lines, table rows, and trace steps across the screen
  const COLORS = ['#1f5fd6', '#d4342c', '#1d1d1f', '#b8279f', '#1e8f3a', '#d06f00'];
  const STD = { xmin: -10, xmax: 10, xscl: 1, ymin: -10, ymax: 10, yscl: 1 };
  const WIN = [['xmin', 'Xmin'], ['xmax', 'Xmax'], ['xscl', 'Xscl'], ['ymin', 'Ymin'], ['ymax', 'Ymax'], ['yscl', 'Yscl']];
  const TBL = [['start', 'TblStart'], ['step', 'ΔTbl']];
  /** the keys, row by row: [id, label, 2nd label, alpha label, look]; 'pad' is the arrow pad */
  const KEYS = [
    ['yeq', 'y=', 'statplot', 'f1', 'top'], ['window', 'window', 'tblset', 'f2', 'top'], ['zoom', 'zoom', 'format', 'f3', 'top'], ['trace', 'trace', 'calc', 'f4', 'top'], ['graph', 'graph', 'table', 'f5', 'top'],
    ['2nd', '2nd', '', '', 'second'], ['mode', 'mode', 'quit', ''], ['del', 'del', 'ins', ''], 'pad',
    ['alpha', 'alpha', 'A-lock', '', 'alpha'], ['xt', 'X,T,θ,<i>n</i>', 'link', ''], ['stat', 'stat', 'list', ''],
    ['math', 'math', 'test', 'A'], ['apps', 'apps', 'angle', 'B'], ['prgm', 'prgm', 'draw', 'C'], ['vars', 'vars', 'distr', ''], ['clear', 'clear', '', ''],
    ['inv', 'x<sup>−1</sup>', 'matrix', 'D'], ['sin', 'sin', 'sin<sup>−1</sup>', 'E'], ['cos', 'cos', 'cos<sup>−1</sup>', 'F'], ['tan', 'tan', 'tan<sup>−1</sup>', 'G'], ['pow', '^', 'π', 'H'],
    ['sq', 'x<sup>2</sup>', '√', 'I'], ['comma', ',', 'EE', 'J'], ['lp', '(', '{', 'K'], ['rp', ')', '}', 'L'], ['div', '÷', 'e', 'M', 'op'],
    ['log', 'log', '10<sup>x</sup>', 'N'], ['7', '7', 'u', 'O', 'num'], ['8', '8', 'v', 'P', 'num'], ['9', '9', 'w', 'Q', 'num'], ['mul', '×', '[', 'R', 'op'],
    ['ln', 'ln', 'e<sup>x</sup>', 'S'], ['4', '4', 'L4', 'T', 'num'], ['5', '5', 'L5', 'U', 'num'], ['6', '6', 'L6', 'V', 'num'], ['sub', '−', ']', 'W', 'op'],
    ['sto', 'sto→', 'rcl', 'X'], ['1', '1', 'L1', 'Y', 'num'], ['2', '2', 'L2', 'Z', 'num'], ['3', '3', 'L3', 'θ', 'num'], ['add', '+', 'mem', '“', 'op'],
    ['on', 'on', 'off', ''], ['0', '0', 'catalog', '␣', 'num'], ['dot', '.', '<i>i</i>', ':', 'num'], ['neg', '(−)', 'ans', '?', 'num'], ['enter', 'enter', 'entry', 'solve', 'op'],
  ];
  const ARIA = { yeq: 'Y equals', window: 'Window', zoom: 'Zoom', trace: 'Trace', graph: 'Graph', '2nd': 'Second', mode: 'Mode', del: 'Delete', alpha: 'Alpha', xt: 'X, T, theta, n', stat: 'Stat', math: 'Math', apps: 'Apps', prgm: 'Program', vars: 'Variables', clear: 'Clear', inv: 'Reciprocal', sin: 'Sine', cos: 'Cosine', tan: 'Tangent', pow: 'Power', sq: 'Squared', comma: 'Comma', lp: 'Open parenthesis', rp: 'Close parenthesis', div: 'Divide', log: 'Log', mul: 'Times', ln: 'Natural log', sub: 'Minus', sto: 'Store', add: 'Plus', on: 'On', dot: 'Decimal point', neg: 'Negative', enter: 'Enter', up: 'Up', down: 'Down', left: 'Left', right: 'Right' };
  /** what a key types, and what it types after 2nd */
  const INS = { 0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', dot: '.', add: '+', sub: '−', mul: '×', div: '÷', pow: '^', sq: '²', inv: '⁻¹', lp: '(', rp: ')', comma: ',', neg: '-', sin: 'sin(', cos: 'cos(', tan: 'tan(', log: 'log(', ln: 'ln(', sto: '→', xt: 'X',
    asin: 'sin⁻¹(', acos: 'cos⁻¹(', atan: 'tan⁻¹(', pi: 'π', sqrt: '√(', ee: 'ᴇ', e: 'e', tenx: '10^(', ex: 'e^(', ans: 'Ans' };
  const SECOND = { yeq: 'statplot', window: 'tblset', zoom: 'format', trace: 'calc', graph: 'table', mode: 'quit', del: 'ins', xt: 'link', stat: 'list', math: 'test', apps: 'angle', prgm: 'draw', vars: 'distr', inv: 'matrix', sin: 'asin', cos: 'acos', tan: 'atan', pow: 'pi', sq: 'sqrt', comma: 'ee', lp: 'list', rp: 'list', div: 'e', log: 'tenx', mul: 'matrix', ln: 'ex', sub: 'matrix', sto: 'rcl', add: 'mem', on: 'off', 0: 'catalog', dot: 'i', neg: 'ans', enter: 'entry', 7: 'seq', 8: 'seq', 9: 'seq', 1: 'list', 2: 'list', 3: 'list', 4: 'list', 5: 'list', 6: 'list', left: 'bol', right: 'eol' };
  const ALPHA = { math: 'A', apps: 'B', prgm: 'C', inv: 'D', sin: 'E', cos: 'F', tan: 'G', pow: 'H', sq: 'I', comma: 'J', lp: 'K', rp: 'L', div: 'M', log: 'N', 7: 'O', 8: 'P', 9: 'Q', mul: 'R', ln: 'S', 4: 'T', 5: 'U', 6: 'V', sub: 'W', sto: 'X', 1: 'Y', 2: 'Z', 3: 'θ', 0: ' ', add: 'sym', dot: 'sym', neg: 'sym', enter: 'solve', yeq: 'fkey', window: 'fkey', zoom: 'fkey', trace: 'fkey', graph: 'fkey' };
  const NOT_HERE = n => `${n} isn’t on this calculator.`;
  /** keys with nothing behind them here: what the screen says instead */
  const GONE = {
    stat: 'Statistics aren’t on this calculator. The Data tool has them.', statplot: 'Statistics aren’t on this calculator. The Data tool has them.',
    apps: NOT_HERE('APPS'), prgm: NOT_HERE('PRGM'), link: NOT_HERE('LINK'), angle: NOT_HERE('ANGLE'), draw: NOT_HERE('DRAW'), distr: NOT_HERE('DISTR'), test: NOT_HERE('TEST'), mem: NOT_HERE('MEM'), rcl: NOT_HERE('RCL'), catalog: 'Every function is on a key or in the math menu.',
    vars: 'For a variable, press alpha and a letter. Store a number in it with sto→, as in 5→A.',
    list: 'Lists and matrices aren’t on this calculator.', matrix: 'Lists and matrices aren’t on this calculator.', seq: 'Sequences aren’t on this calculator.', i: 'Complex numbers aren’t on this calculator.',
    on: 'This calculator is always on.', off: 'This calculator is always on.', ins: 'Typing always inserts at the cursor.',
    fkey: 'Shortcut menus aren’t on this calculator. Use math, zoom and 2nd trace.', solve: 'The equation solver isn’t on this calculator.', sym: 'That symbol isn’t used on this calculator.',
  };
  /** words that are one key press, so del, ← and → treat them as one (longest first) */
  const TOKS = ['sin⁻¹(', 'cos⁻¹(', 'tan⁻¹(', 'iPart(', 'fPart(', 'sin(', 'cos(', 'tan(', 'log(', 'abs(', 'int(', '10^(', '►Frac', 'ln(', '√(', '∛(', 'e^(', 'Ans', '►Dec', '⁻¹'];
  const tokAt = (s, p) => { for (const t of TOKS) if (s.startsWith(t, p)) return t.length; return p < s.length ? 1 : 0; };
  const tokBefore = (s, p) => { for (const t of TOKS) if (p >= t.length && s.slice(p - t.length, p) === t) return t.length; return p > 0 ? 1 : 0; };
  const ARROW = { up: 'M6 15l6-6 6 6', down: 'M6 9l6 6 6-6', left: 'M15 6l-6 6 6 6', right: 'M9 6l6 6-6 6' };
  const BATTERY = '<svg viewBox="0 0 12 22" width="9" height="16" aria-hidden="true"><rect x="1" y="3" width="10" height="18" rx="1.5" fill="none" stroke="#9be07a" stroke-width="1.5"/><rect x="4" y="1" width="4" height="2" fill="#9be07a"/><rect x="3" y="6" width="6" height="13" fill="#7ccf55"/></svg>';

  function page(root, start) {
    const st = load();
    const okNum = v => typeof v === 'number' && Number.isFinite(v);
    st.deg = st.deg !== false;
    st.hist = Array.isArray(st.hist) ? st.hist.filter(h => h && typeof h.e === 'string' && typeof h.r === 'string').slice(0, 30) : [];
    st.shown = Number.isInteger(st.shown) ? Math.min(Math.max(0, st.shown), st.hist.length) : st.hist.length;
    st.ys = Array.isArray(st.ys) ? st.ys.slice(0, NY).map(y => String(y).slice(0, 120)) : [];
    while (st.ys.length < NY) st.ys.push('');
    st.on = Array.isArray(st.on) && st.on.length === NY ? st.on.map(Boolean) : st.ys.map(() => true);
    st.win = st.win && WIN.every(([k]) => okNum(st.win[k])) && st.win.xmin < st.win.xmax && st.win.ymin < st.win.ymax ? st.win : Object.assign({}, STD);
    st.tbl = st.tbl && okNum(st.tbl.start) && okNum(st.tbl.step) && st.tbl.step ? st.tbl : { start: 0, step: 1 };
    st.sci = st.sci === true;
    st.fix = Number.isInteger(st.fix) && st.fix >= 0 && st.fix <= 9 ? st.fix : null;
    st.am = ['auto', 'dec', 'frac'].includes(st.am) ? st.am : 'auto';
    st.grid = ['off', 'dot', 'line'].includes(st.grid) ? st.grid : 'off';
    st.axes = st.axes !== false; st.labels = st.labels === true;
    const vars = {};
    if (st.vars && typeof st.vars === 'object') Object.keys(st.vars).forEach(k => { const v = /^[A-Zθ]$/.test(k) && ansFrom(st.vars[k]); if (v) vars[k] = v; });
    let ans = ansFrom(st.ans), mod = '', scr = 'home', note = '', justDone = false, wasDone = false, sel = -1, recall = -1, last = null;
    const ent = { s: '', p: 0 };
    let yi = 0, yon = false, ye = { s: st.ys[0], p: st.ys[0].length };           // the Y= line being edited; yon: the cursor is on its = sign
    let fl = 0, fe = null;                                                     // the window or table setup field being edited
    let menu = null, opt = null, err = null;
    const G = { tr: false, fi: -1, x: 0, free: null, flow: null, res: null, xe: null };
    const T = { top: 0, r: 0, c: 0 };
    const fine = window.matchMedia && matchMedia('(pointer: fine)').matches;
    const ctx = () => ({ deg: st.deg, ans, vars });
    const persist = () => { st.vars = {}; Object.keys(vars).forEach(k => { st.vars[k] = ansTo(vars[k]); }); save(st); };

    root.innerHTML = `<div class="cx-page">
      <div class="cx-head"><h1>Calculator</h1><p class="muted">Laid out like the graphing calculator used in class, and fractions stay exact: 1/3 + 1/4 is 7/12. Press the keys or type on your keyboard.</p></div>
      <div class="cx-calc" tabindex="0" role="group" aria-label="Calculator" aria-describedby="cx-tips-list">
        <div class="cx-screen"><div class="cx-status"><span class="cx-st"></span><span class="cx-mod"></span>${BATTERY}</div><div class="cx-lcd" role="region" aria-label="Screen"></div><canvas class="cx-plot" hidden aria-label="The graph"></canvas><div class="cx-note" role="status" hidden></div></div>
        ${st.seenHow ? '' : `<div class="cx-how" id="cx-how" role="note" aria-label="How to use the calculator"><b>New here?</b><ul><li>Press the keys, or type on a keyboard. <b>enter</b> works it out.</li><li><b>y=</b> then <b>graph</b> draws a graph. <b>2nd</b> uses the blue labels.</li><li>The exact answer and every step show next to the calculator (below it on a phone).</li></ul><div class="cx-how-btns"><button type="button" class="cx-how-b" id="cx-how-try">Try an example</button><button type="button" class="cx-how-b" id="cx-how-ok">Got it</button></div></div>`}
        <div class="cx-big" id="cx-big" aria-live="polite"></div>
        <div class="cx-keys">${KEYS.map(k => (k === 'pad'
          ? `<div class="cx-pad"><div class="cx-ring">${['up', 'left', 'right', 'down'].map(d => `<button type="button" class="cx-arrow ${d}" data-k="${d}" aria-label="${ARIA[d]}"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="${ARROW[d]}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`).join('')}</div></div>`
          : `<button type="button" class="cx-k ${k[4] || 'dark'}" data-k="${k[0]}" aria-label="${ARIA[k[0]] || k[0]}"${k[0] === '2nd' || k[0] === 'alpha' ? ' aria-pressed="false"' : ''}>${k[2] || k[3] ? `<span class="cx-kt"><span class="s">${k[2]}</span><span class="a">${k[3]}</span></span>` : ''}<span class="m">${k[1]}</span></button>`)).join('')}</div>
      </div>
      <div class="cx-side">
        <section class="card cx-tograph" id="cx-tograph" hidden><div class="row between" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">Your Y= graphs</h2><a class="btn sm" id="cx-tograph-btn" href="#/graph">Open in the graphing calculator</a></div><p class="small muted" id="cx-tograph-list" style="margin:8px 0 0"></p></section>
        <section class="card"><h2>Every form</h2><div id="cx-forms"></div></section>
        <section class="card"><h2>Step by step</h2><div id="cx-steps"></div></section>
        <section class="card cx-tips"><h2>How to</h2><ul class="small" id="cx-tips-list">
          <li><b>Graph:</b> press <b>y=</b>, enter an equation such as <b>2X+1</b> (the <b>X,T,θ,<i>n</i></b> key types X), then press <b>graph</b>.</li>
          <li><b>trace</b> moves along a graph. <b>2nd</b> then <b>trace</b> finds zeros, minimums, maximums and where graphs meet.</li>
          <li><b>2nd</b> then <b>graph</b> shows a table of values. <b>zoom</b> then <b>6</b> resets the window.</li>
          <li><b>math</b> then <b>1</b> shows an answer as a fraction. <b>mode</b> switches between degrees and radians.</li>
          <li>On a keyboard: type as usual, <b>Enter</b> works it out, the arrows move, and <b>Esc</b> clears.</li>
        </ul></section>
      </div>
      <p class="visually-hidden" aria-live="polite" id="cx-live"></p>
    </div>`;
    const calcEl = root.querySelector('.cx-calc'), lcd = root.querySelector('.cx-lcd'), cv = root.querySelector('.cx-plot');
    const live = t => { root.querySelector('#cx-live').textContent = t; };

    // ---- text being typed: the entry line, a Y= line, a window value or an X= to trace to
    const ins = (E, t) => { if (E.fresh) { E.s = ''; E.p = 0; E.fresh = false; } E.s = E.s.slice(0, E.p) + t + E.s.slice(E.p); E.p += t.length; };
    const back = E => { E.fresh = false; const n = tokBefore(E.s, E.p); E.s = E.s.slice(0, E.p - n) + E.s.slice(E.p); E.p -= n; };
    const delAt = E => { E.fresh = false; if (E.p >= E.s.length) return back(E); const n = tokAt(E.s, E.p); E.s = E.s.slice(0, E.p) + E.s.slice(E.p + n); };
    const move = (E, d) => { E.fresh = false; E.p = d < 0 ? E.p - tokBefore(E.s, E.p) : E.p + tokAt(E.s, E.p); };
    function edHtml(E) {
      const n = tokAt(E.s, E.p), under = E.s.slice(E.p, E.p + n), kind = mod === '2nd' ? ' second' : mod ? ' alpha' : '';
      return `${esc(E.s.slice(0, E.p))}<span class="cx-cur${kind}${E.fresh ? ' fresh' : ''}">${under ? esc(under) : '&nbsp;'}</span>${esc(E.s.slice(E.p + n))}`;
    }

    // ---- numbers as the screen shows them
    function fmtNum(x, sig) {
      sig = sig || 10;
      if (!Number.isFinite(x)) return 'ERROR';
      if (Math.abs(x) < 1e-13) x = 0;
      let s;
      const a = Math.abs(x);
      if (st.sci) s = x.toExponential(st.fix === null ? sig - 1 : st.fix);
      else if (st.fix !== null && a < 1e10) s = x.toFixed(st.fix);
      else s = a !== 0 && (a >= 1e10 || a < 1e-3) ? x.toExponential(sig - 1) : String(Number(x.toPrecision(sig)));
      if (s.includes('e')) { let [m, e] = s.split('e'); if (st.fix === null) m = m.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''); s = m + 'ᴇ' + Number(e); }
      return s.replace(/-/g, '−');
    }
    /** an answer for the right side of the screen: a fraction while fractions are exact, else a decimal */
    function screenVal(v, typedDec, how) {
      how = how || st.am;
      if (!v.q) return fmtNum(v.v);
      const floatMode = !st.sci && st.fix === null;
      if (v.d === 1n) return floatMode && digits(v.n) <= 10 ? (v.n < 0n ? '−' : '') + babs(v.n).toString() : fmtNum(toNum(v.n, 1n));
      const k = places(v.d), asFrac = how === 'frac' || (how === 'auto' && !(typedDec && k >= 0 && k <= 12));
      if (floatMode && asFrac && digits(v.n) + digits(v.d) <= 16) return `${v.n < 0n ? '−' : ''}${babs(v.n)}/${v.d}`;
      return fmtNum(toNum(v.n, v.d));
    }
    const valHtml = r => { const m = /^(−?)(\d+)\/(\d+)$/.exec(r); return m ? m[1] + fracHtml(m[2], m[3]) : esc(r); };
    const echoCache = new Map();
    function echoOf(e) {
      if (echoCache.has(e)) return echoCache.get(e);
      let html = esc(e);
      try {
        const m = /^(.*?)(→\s*[A-Zθ])?(►Frac|►Dec)?$/.exec(e.trim()), tree = parse(m[1], { vars: true });
        if (tree) html = out(tree, true, { deg: false }).s + esc((m[2] || '').replace(/\s/g, '') + (m[3] || ''));
      } catch (x) { html = esc(e); }
      echoCache.set(e, html);
      return html;
    }

    // ---- the home screen: work out the entry line
    function run(text) {
      let src = text.trim(), how = null, to = null, m;
      if ((m = /(►Frac|►Dec)$/.exec(src))) { how = m[1] === '►Frac' ? 'frac' : 'dec'; src = src.slice(0, m.index).trim(); }
      if ((m = /→\s*([A-Zθ])$/.exec(src))) { to = m[1]; src = src.slice(0, m.index).trim(); }
      if (/→/.test(src) || (!to && /→/.test(text))) return { error: 'Store a number in one letter, as in 5→A (alpha gives the letters).' };
      if (/►/.test(src)) return { error: '►Frac and ►Dec go at the end of a calculation.' };
      const r = calc(src, ctx());
      if (r.error) return r;
      if (!r.answer) return { error: 'Something is missing before “→”.' };
      return Object.assign(r, { how, to, src, typedDec: /\d\.\d|(^|[^\d])\.\d|ᴇ/.test(src) });
    }
    function enterHome() {
      let text = ent.s;
      if (!text.trim()) { if (!st.hist.length) return; text = st.hist[0].e; }        // enter on an empty line does the last one again
      const r = run(text);
      if (r.error) return fail2(r.error, 'home');
      const v = r.value;
      if (r.to) vars[r.to] = v;
      ans = v; st.ans = ansTo(v);
      const shown = screenVal(v, r.typedDec, r.how);
      st.hist.unshift({ e: text.trim(), r: shown }); st.hist = st.hist.slice(0, 30);
      st.shown = Math.min(st.hist.length, st.shown + 1);
      ent.s = ''; ent.p = 0; justDone = true; recall = -1; sel = -1;
      last = r; panels(); persist();
      live(`${r.plain} = ${shown}`);
      H.tutorCtx({ notes: `The student is using the calculator. They worked out ${r.plain} ${r.answer.text}.` });
    }
    function fail2(msg, from) { err = { msg, from, at: 0 }; scr = 'error'; live('Error. ' + msg); }

    // ---- the panels beside the calculator: the last answer in every form, and its steps
    /** the answer and each of its forms as plain text, for Copy */
    function copyTexts(a) {
      const out = { answer: a.text.replace(/^[=≈]\s*/, '') }, v = a.value;
      if (v && v.q && v.d !== 1n) {
        const neg = v.n < 0n ? '−' : '', an = babs(v.n);
        out.Fraction = ft(v);
        if (an > v.d) out['Mixed number'] = `${neg}${an / v.d} ${an % v.d}/${v.d}`;
        out.Decimal = decText(v.n, v.d);
        out.Percent = decText(v.n * 100n, v.d) + '%';
      }
      return out;
    }
    /** a phone shows the last answer large, between the screen and the keys */
    function big() {
      const b = root.querySelector('#cx-big');
      if (!last || !last.answer) { b.innerHTML = ''; b.hidden = true; return; }
      b.hidden = false;
      b.innerHTML = `<span class="cx-big-e">${last.echo}</span><span class="cx-big-v">${last.answer.html}</span><button type="button" class="cx-copy" data-copy="${esc(copyTexts(last.answer).answer)}" aria-label="Copy the answer">Copy</button>`;
    }
    function panels() {
      big();
      const fb = root.querySelector('#cx-forms'), sb = root.querySelector('#cx-steps');
      if (!last || !last.answer) {
        fb.innerHTML = '<p class="muted small" style="margin:0">Work something out, such as <b>2/3 ÷ 4/9</b>, and its answer appears here as a fraction, a mixed number, a decimal and a percent.</p>';
        sb.innerHTML = '<p class="muted small" style="margin:0">Enter a calculation with more than one step, such as <b>2 + 3 × (4 − 1)²</b>, to see it worked in the order of operations: parentheses, then exponents, then × and ÷, then + and −.</p>';
        return;
      }
      const a = last.answer, n = a.int && a.value.n, copies = copyTexts(a);
      fb.innerHTML = `<div class="cx-echo">${last.echo}${last.to ? esc('→' + last.to) : ''}</div><div class="cx-ans">${a.html}<button type="button" class="cx-copy" data-copy="${esc(copies.answer)}" aria-label="Copy the answer">Copy</button></div>
        ${a.forms.length ? `<div class="cx-forms">${a.forms.map(([l, h]) => `<div class="cx-form"><span class="tiny muted">${l}</span><span class="cx-fv">${h}</span>${copies[l] ? `<button type="button" class="cx-copy" data-copy="${esc(copies[l])}" aria-label="Copy the ${l.toLowerCase()}">Copy</button>` : ''}</div>`).join('')}</div>` : ''}
        ${n && n > 1n && n <= 1000000000000n ? `<a class="btn sm ghost cx-more" href="#/numbers/${n}">Factor ${group(n)}</a>` : ''}`;
      const ls = last.steps || [];
      sb.innerHTML = ls.length > 1 ? `<ol class="cx-steps">${ls.map((l, i) => `<li>${i ? `<span class="cx-eq">${l.approx ? '≈' : '='}</span> ` : ''}<span class="cx-line">${l.html}</span>${l.notes && l.notes.length ? `<div class="small muted">${l.notes.map(esc).join(' ')}</div>` : ''}</li>`).join('')}</ol>`
        : '<p class="muted small" style="margin:0">This one is a single step. Enter a calculation with more than one step, such as <b>2 + 3 × (4 − 1)²</b>, to see it worked in the order of operations.</p>';
    }

    // ---- the functions in Y=
    /** the Y= lines that are on: [{ i, f }], or { bad: i, msg } for the first that can't be read */
    function funcs() {
      const list = [];
      for (let i = 0; i < NY; i++) {
        if (!st.on[i] || !st.ys[i].trim()) continue;
        try { const tree = parse(st.ys[i], { vars: true }); if (tree) list.push({ i, f: compile(tree, ctx()) }); } catch (e) { if (e instanceof CalcError) return { bad: i, msg: e.message }; throw e; }
      }
      return list;
    }
    const lineOk = s => { if (!s.trim()) return true; try { parse(s, { vars: true }); return true; } catch (e) { return false; } };
    const fnOf = i => { const l = funcs(); return Array.isArray(l) ? (l.find(o => o.i === i) || {}).f : null; };
    const dx = () => (st.win.xmax - st.win.xmin) / STEPS, dy = () => (st.win.ymax - st.win.ymin) / 164;

    // ---- moving between screens
    function leaveFields() {
      if (!fe || (scr !== 'window' && scr !== 'tblset')) return true;
      const key = (scr === 'window' ? WIN : TBL)[fl][0], obj = scr === 'window' ? st.win : st.tbl;
      if (!fe.s.trim()) { fe = null; return true; }
      const r = calc(fe.s, ctx());
      if (r.error) { fail2(r.error, scr); return false; }
      const v = num(r.value);
      if (scr === 'tblset' && key === 'step' && v === 0) { fail2('ΔTbl can’t be 0.', 'tblset'); return false; }
      obj[key] = v; fe = null; persist();
      return true;
    }
    function field(i) { fl = i; const [key] = (scr === 'window' ? WIN : TBL)[i], v = (scr === 'window' ? st.win : st.tbl)[key]; fe = { s: fmtNum(v).replace(/−/g, '-'), p: 0, fresh: true }; fe.p = fe.s.length; }
    function leave() {
      if (scr === 'yeq') { st.ys[yi] = ye.s; persist(); }
      if (!leaveFields()) return false;
      G.xe = null;
      return true;
    }
    function goHome() { if (!leave()) return; scr = 'home'; sel = -1; G.tr = false; G.flow = null; G.res = null; G.free = null; }
    function openYeq() { if (!leave()) return; scr = 'yeq'; ye = { s: st.ys[yi], p: st.ys[yi].length }; yon = false; }
    function openFields(which) { if (!leave()) return; scr = which; field(0); }
    function openOpt(which) {
      if (!leave()) return;
      const rows = which === 'mode'
        ? [{ key: 'sci', opts: [['NORMAL', false], ['SCI', true]] }, { key: 'fix', opts: [['FLOAT', null]].concat([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => [String(k), k])) }, { key: 'deg', opts: [['RADIAN', false], ['DEGREE', true]] }, { key: 'am', label: 'ANSWERS:', opts: [['AUTO', 'auto'], ['DEC', 'dec'], ['FRAC', 'frac']] }]
        : [{ key: 'grid', opts: [['GridOff', 'off'], ['GridDot', 'dot'], ['GridLine', 'line']] }, { key: 'axes', opts: [['AxesOn', true], ['AxesOff', false]] }, { key: 'labels', opts: [['LabelOff', false], ['LabelOn', true]] }];
      opt = { which, rows, r: 0, c: Math.max(0, rows[0].opts.findIndex(o => o[1] === st[rows[0].key])) };
      scr = 'opt';
    }
    function pick(r, c) {
      const row = opt.rows[r], o = row && row.opts[c]; if (!o) return;
      opt.r = r; opt.c = c; st[row.key] = o[1]; persist();
      echoCache.clear();
      if (row.key === 'deg') live(o[1] ? 'Degrees' : 'Radians');
    }
    const insertBack = t => () => { scr = menu.back; text(t); };
    function zoomTo(w) { st.win = w; persist(); G.tr = false; G.flow = null; G.res = null; G.free = null; return openGraph(false); }
    function zoomBy(f) { const w = st.win, cx = G.tr ? G.x : (w.xmin + w.xmax) / 2, cy = (w.ymin + w.ymax) / 2, hx = (w.xmax - w.xmin) / 2 * f, hy = (w.ymax - w.ymin) / 2 * f; zoomTo(Object.assign({}, w, { xmin: cx - hx, xmax: cx + hx, ymin: cy - hy, ymax: cy + hy })); }
    function zoomFit() {
      const fs = funcs(); if (!Array.isArray(fs) || !fs.length) { note = 'Enter a function in y= first.'; return; }
      let lo = Infinity, hi = -Infinity;
      fs.forEach(o => { for (let k = 0; k <= STEPS; k++) { const y = o.f(st.win.xmin + k * dx()); if (Number.isFinite(y) && Math.abs(y) < 1e12) { lo = Math.min(lo, y); hi = Math.max(hi, y); } } });
      if (lo === Infinity) { note = 'Nothing to fit in this window.'; return; }
      if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
      zoomTo(Object.assign({}, st.win, { ymin: lo, ymax: hi }));
    }
    const MENUS = {
      math: () => [['MATH', [[1, '►Frac', insertBack('►Frac')], [2, '►Dec', insertBack('►Dec')], [3, '³', insertBack('³')], [4, '³√(', insertBack('∛(')]]],
        ['NUM', [[1, 'abs(', insertBack('abs(')], [2, 'iPart(', insertBack('iPart(')], [3, 'fPart(', insertBack('fPart(')], [4, 'int(', insertBack('int(')]]],
        ['PROB', [[1, '!', insertBack('!')]]]],
      zoom: () => [['ZOOM', [[1, 'ZBox', () => startFlow('box')], [2, 'Zoom In', () => zoomBy(1 / 4)], [3, 'Zoom Out', () => zoomBy(4)], [4, 'ZDecimal', () => zoomTo({ xmin: -6.6, xmax: 6.6, xscl: 1, ymin: -4.1, ymax: 4.1, yscl: 1 })],
        [5, 'ZSquare', () => { const w = st.win, ratio = (cv.clientWidth || 265) / (cv.clientHeight || 165), cx = (w.xmin + w.xmax) / 2, h = (w.ymax - w.ymin) / 2 * ratio; zoomTo(Object.assign({}, w, { xmin: cx - h, xmax: cx + h })); }],
        [6, 'ZStandard', () => zoomTo(Object.assign({}, STD))],
        [7, 'ZTrig', () => zoomTo(st.deg ? { xmin: -352.5, xmax: 352.5, xscl: 90, ymin: -4, ymax: 4, yscl: 1 } : { xmin: -47 / 24 * Math.PI, xmax: 47 / 24 * Math.PI, xscl: Math.PI / 2, ymin: -4, ymax: 4, yscl: 1 })],
        [8, 'ZInteger', () => { const w = st.win, cx = Math.round((w.xmin + w.xmax) / 2), cy = Math.round((w.ymin + w.ymax) / 2); zoomTo({ xmin: cx - 132, xmax: cx + 132, xscl: 10, ymin: cy - 82, ymax: cy + 82, yscl: 10 }); }],
        [0, 'ZoomFit', zoomFit]]]],
      calc: () => [['CALCULATE', [[1, 'value', () => startFlow('value')], [2, 'zero', () => startFlow('zero')], [3, 'minimum', () => startFlow('min')], [4, 'maximum', () => startFlow('max')], [5, 'intersect', () => startFlow('inter')], [6, 'dy/dx', () => startFlow('dydx')], [7, '∫f(x)dx', () => startFlow('integral')]]]],
    };
    function openMenu(name) {
      const back = scr === 'menu' ? menu.back : scr;
      if (name === 'math' && !['home', 'yeq', 'window', 'tblset'].includes(back)) { note = 'The math menu works on the home screen and in y=.'; return; }
      if (!leaveFieldsKeep()) return;
      menu = { name, tabs: MENUS[name](), tab: 0, at: 0, back };
      scr = 'menu';
    }
    const leaveFieldsKeep = () => { if (scr === 'yeq') { st.ys[yi] = ye.s; persist(); } return true; };
    function choose(n) {
      const items = menu.tabs[menu.tab][1], it = n === undefined ? items[menu.at] : items.find(x => x[0] === n);
      if (!it) return;
      scr = menu.back === 'menu' ? 'home' : menu.back;
      it[2]();
    }

    // ---- the graph, trace and the calculate menu
    function checkGraph() {
      const w = st.win;
      if (!(w.xmin < w.xmax && w.ymin < w.ymax)) { fail2('Xmin must be less than Xmax, and Ymin less than Ymax.', 'window'); return null; }
      const fs = funcs();
      if (!Array.isArray(fs)) { yi = fs.bad; fail2(`Y${fs.bad + 1} can’t be read. ${fs.msg}`, 'yeq'); return null; }
      return fs;
    }
    function openGraph(trace) {
      if (!leave()) return;
      const fs = checkGraph(); if (!fs) return;
      scr = 'graph'; G.res = null; G.xe = null;
      if (trace) {
        G.flow = null; G.free = null;
        if (!fs.length) { note = 'Enter a function in y= to trace it.'; G.tr = false; return; }
        if (!G.tr) G.x = clean((st.win.xmin + st.win.xmax) / 2);
        if (!fs.some(o => o.i === G.fi)) G.fi = fs[0].i;
        G.tr = true;
      }
    }
    const PROMPTS = { value: 'X=', zero: ['Left Bound?', 'Right Bound?', 'Guess?'], min: ['Left Bound?', 'Right Bound?', 'Guess?'], max: ['Left Bound?', 'Right Bound?', 'Guess?'], inter: ['First curve?', 'Second curve?', 'Guess?'], dydx: ['dy/dx: move to a point, then press enter'], integral: ['Lower Limit?', 'Upper Limit?'] };
    function startFlow(kind) {
      openGraph(kind !== 'box');
      if (scr !== 'graph') return;
      if (kind === 'box') { const w = st.win; G.tr = false; G.free = { x: clean((w.xmin + w.xmax) / 2), y: clean((w.ymin + w.ymax) / 2) }; G.flow = { kind, step: 0, prompt: 'Move to a corner, then press enter.' }; return; }
      if (!G.tr) return;
      if (kind === 'inter' && funcs().length < 2) { G.tr = true; note = 'Turn on two functions in y= to find where they meet.'; return; }
      G.flow = { kind, step: 0, prompt: kind === 'value' ? '' : PROMPTS[kind][0] };
      if (kind === 'value') G.xe = { s: '', p: 0 };
    }
    function graphEnter() {
      const f = G.flow, w = st.win;
      if (G.xe) {                                     // a typed X: go there, and take it as the answer to the prompt
        const r = calc(G.xe.s, ctx());
        if (r.error) return fail2(r.error, 'graph');
        const x = num(r.value);
        if (x < w.xmin || x > w.xmax) { G.xe = null; note = `X has to be in the window, from ${fmtNum(w.xmin)} to ${fmtNum(w.xmax)}.`; return; }
        G.x = x; G.xe = null;
        if (!f || f.kind === 'value') { if (f) G.flow = null; return; }
      }
      if (!f) { if (G.tr) { const fn = fnOf(G.fi), y = fn ? fn(G.x) : NaN, hx = (w.xmax - w.xmin) / 2, hy = (w.ymax - w.ymin) / 2; st.win = Object.assign({}, w, { xmin: G.x - hx, xmax: G.x + hx }, Number.isFinite(y) ? { ymin: y - hy, ymax: y + hy } : {}); persist(); } return; }
      if (f.kind === 'box') {
        if (f.step === 0) { f.c1 = Object.assign({}, G.free); f.step = 1; f.prompt = 'Move to the opposite corner, then press enter.'; return; }
        const a = f.c1, b = G.free;
        if (a.x === b.x || a.y === b.y) { note = 'Make the box wider and taller first.'; return; }
        G.flow = null; G.free = null;
        return zoomTo(Object.assign({}, w, { xmin: Math.min(a.x, b.x), xmax: Math.max(a.x, b.x), ymin: Math.min(a.y, b.y), ymax: Math.max(a.y, b.y) }));
      }
      const fn = fnOf(G.fi);
      if (!fn) return;
      if (f.kind === 'dydx') {
        const h = 1e-5 * Math.max(1, Math.abs(G.x)), d = (fn(G.x + h) - fn(G.x - h)) / (2 * h);
        G.flow = null; G.res = { label: Number.isFinite(d) ? `dy/dx=${fmtNum(clean(d), 8)}` : 'dy/dx isn’t defined here.' }; return;
      }
      if (f.kind === 'inter' && f.step === 0) { f.f1 = G.fi; const l = funcs(), k = l.findIndex(o => o.i === G.fi); G.fi = l[(k + 1) % l.length].i; f.step = 1; f.prompt = PROMPTS.inter[1]; return; }
      if (f.kind === 'inter' && f.step === 1) { if (G.fi === f.f1) { note = 'Choose a different curve with ▲ or ▼.'; return; } f.f2 = G.fi; f.step = 2; f.prompt = PROMPTS.inter[2]; return; }
      if (f.kind === 'integral' && f.step === 0) { f.L = G.x; f.step = 1; f.prompt = PROMPTS.integral[1]; return; }
      if (f.kind === 'integral') {
        const a = f.L, b = G.x, n = 2000, hh = (b - a) / n;
        let s = fn(a) + fn(b);
        for (let i = 1; i < n; i++) s += fn(a + i * hh) * (i % 2 ? 4 : 2);
        const v = s * hh / 3;
        G.flow = null;
        if (!Number.isFinite(v)) { G.res = { label: 'The function isn’t defined all the way between the limits.' }; return; }
        G.res = { label: `∫f(x)dx=${fmtNum(clean(v), 8)}`, shade: [Math.min(a, b), Math.max(a, b), G.fi] }; return;
      }
      if (f.step === 0) { f.L = G.x; f.step = 1; f.prompt = PROMPTS[f.kind][1]; return; }
      if (f.step === 1) { f.R = G.x; f.step = 2; f.prompt = PROMPTS[f.kind][2]; return; }
      // the guess: work it out
      let x = null, label = '';
      if (f.kind === 'inter') {
        const f1 = fnOf(f.f1), f2 = fnOf(f.f2);
        x = zeroNear(t => f1(t) - f2(t), w.xmin, w.xmax, G.x); label = 'Intersection';
        if (x !== null) G.fi = f.f1;
      } else {
        const a = Math.min(f.L, f.R), b = Math.max(f.L, f.R);
        if (G.x < a || G.x > b) { note = 'The guess has to be between the bounds.'; return; }
        x = f.kind === 'zero' ? zeroNear(fn, a, b, G.x) : extreme(fn, a, b, f.kind === 'min' ? 1 : -1);
        label = { zero: 'Zero', min: 'Minimum', max: 'Maximum' }[f.kind];
      }
      G.flow = null;
      if (x === null) { G.res = { label: f.kind === 'inter' ? 'These graphs don’t meet in this window.' : f.kind === 'zero' ? 'No zero between the bounds.' : 'Nothing found between the bounds.' }; return; }
      G.x = clean(x); G.res = { label };
      live(`${label}: X = ${fmtNum(G.x, 8)}, Y = ${fmtNum(clean(fnOf(G.fi)(G.x)), 8)}`);
    }
    function graphArrow(d) {
      G.res = null; note = '';
      const w = st.win;
      if (G.free) {
        const p = G.free;
        if (d === 'left' || d === 'right') p.x = clean(p.x + (d === 'left' ? -1 : 1) * dx()); else p.y = clean(p.y + (d === 'down' ? -1 : 1) * dy());
        p.x = Math.min(w.xmax, Math.max(w.xmin, p.x)); p.y = Math.min(w.ymax, Math.max(w.ymin, p.y));
        return;
      }
      if (!G.tr) {                                    // arrows on a plain graph: a free cursor, as on the real one
        const fs = funcs();
        if (Array.isArray(fs) && fs.length) return openGraph(true);
        G.free = { x: clean((w.xmin + w.xmax) / 2), y: clean((w.ymin + w.ymax) / 2) }; return graphArrow(d);
      }
      if (d === 'up' || d === 'down') {
        const l = funcs(); if (!Array.isArray(l) || !l.length) return;
        const k = l.findIndex(o => o.i === G.fi); G.fi = l[(k + (d === 'down' ? 1 : l.length - 1)) % l.length].i; return;
      }
      G.x = clean(G.x + (d === 'left' ? -1 : 1) * dx());
      if (G.x > w.xmax || G.x < w.xmin) { const shift = G.x - (w.xmin + w.xmax) / 2; st.win = Object.assign({}, w, { xmin: w.xmin + shift, xmax: w.xmax + shift }); persist(); }
    }
    function plot() {
      const box = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      const W = Math.max(2, Math.round(box.width * dpr)), Hh = Math.max(2, Math.round(box.height * dpr));
      if (cv.width !== W) cv.width = W;
      if (cv.height !== Hh) cv.height = Hh;
      const g = cv.getContext('2d'), w = st.win, fs = funcs();
      const X = x => (x - w.xmin) / (w.xmax - w.xmin) * W, Y = y => Hh - (y - w.ymin) / (w.ymax - w.ymin) * Hh;
      g.fillStyle = '#fff'; g.fillRect(0, 0, W, Hh);
      const marks = (lo, hi, step) => { const o = []; if (!(step > 0) || (hi - lo) / step > 150) return o; for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) o.push(t); return o; };
      const tx = marks(w.xmin, w.xmax, w.xscl), ty = marks(w.ymin, w.ymax, w.yscl), px = v => Math.round(v) + 0.5;
      if (st.grid === 'line') {
        g.strokeStyle = '#d5dae2'; g.lineWidth = dpr; g.beginPath();
        tx.forEach(t => { g.moveTo(px(X(t)), 0); g.lineTo(px(X(t)), Hh); }); ty.forEach(t => { g.moveTo(0, px(Y(t))); g.lineTo(W, px(Y(t))); });
        g.stroke();
      } else if (st.grid === 'dot') { g.fillStyle = '#8b93a1'; tx.forEach(a => ty.forEach(b => g.fillRect(Math.round(X(a)) - dpr, Math.round(Y(b)) - dpr, 2 * dpr, 2 * dpr))); }
      const shade = G.res && G.res.shade, fnI = i => Array.isArray(fs) && (fs.find(o => o.i === i) || {}).f;
      if (shade && fnI(shade[2])) {
        const f = fnI(shade[2]); g.fillStyle = COLORS[shade[2]] + '55'; g.beginPath(); g.moveTo(X(shade[0]), Y(0));
        for (let k = 0; k <= 300; k++) { const x = shade[0] + (shade[1] - shade[0]) * k / 300, y = f(x); g.lineTo(X(x), Y(Number.isFinite(y) ? Math.max(w.ymin - (w.ymax - w.ymin), Math.min(w.ymax + (w.ymax - w.ymin), y)) : 0)); }
        g.lineTo(X(shade[1]), Y(0)); g.closePath(); g.fill();
      }
      if (st.axes) {
        g.strokeStyle = '#1d1d1f'; g.lineWidth = dpr; g.beginPath();
        const ax = px(Y(0)), ay = px(X(0)), t3 = 3 * dpr;
        if (w.ymin <= 0 && w.ymax >= 0) { g.moveTo(0, ax); g.lineTo(W, ax); tx.forEach(t => { g.moveTo(px(X(t)), ax - t3); g.lineTo(px(X(t)), ax + t3); }); }
        if (w.xmin <= 0 && w.xmax >= 0) { g.moveTo(ay, 0); g.lineTo(ay, Hh); ty.forEach(t => { g.moveTo(ay - t3, px(Y(t))); g.lineTo(ay + t3, px(Y(t))); }); }
        g.stroke();
        if (st.labels) { g.fillStyle = '#1d1d1f'; g.font = `italic ${13 * dpr}px Georgia, serif`; g.fillText('x', W - 11 * dpr, Math.min(Hh - 4 * dpr, Math.max(14 * dpr, ax - 5 * dpr))); g.fillText('y', Math.min(W - 10 * dpr, Math.max(3 * dpr, ay + 6 * dpr)), 14 * dpr); }
      }
      (Array.isArray(fs) ? fs : []).forEach(o => {
        g.strokeStyle = COLORS[o.i]; g.lineWidth = 2 * dpr; g.lineJoin = 'round'; g.beginPath();
        let pen = false, last2 = 0;
        for (let k = 0; k <= W; k++) {
          const y = o.f(w.xmin + (w.xmax - w.xmin) * k / W);
          if (!Number.isFinite(y)) { pen = false; continue; }
          const yy = Math.max(-4 * Hh, Math.min(5 * Hh, Y(y)));
          if (pen && Math.abs(yy - last2) > 2 * Hh) pen = false;              // a jump across an asymptote isn't part of the graph
          if (pen) g.lineTo(k, yy); else g.moveTo(k, yy);
          pen = true; last2 = yy;
        }
        g.stroke();
      });
      const f = G.flow;
      g.fillStyle = '#1d1d1f';
      [f && f.L, f && f.R].forEach((b, k) => {                                  // the bounds chosen so far, as small triangles
        if (typeof b !== 'number') return;
        const x = X(b), s = 6 * dpr; g.beginPath();
        if (k === 0) { g.moveTo(x, 2 * dpr); g.lineTo(x + s, 2 * dpr + s / 2); g.lineTo(x, 2 * dpr + s); } else { g.moveTo(x, 2 * dpr); g.lineTo(x - s, 2 * dpr + s / 2); g.lineTo(x, 2 * dpr + s); }
        g.fill();
      });
      if (f && f.kind === 'box' && f.c1 && G.free) { g.strokeStyle = '#1d1d1f'; g.setLineDash([4 * dpr, 3 * dpr]); g.strokeRect(X(f.c1.x), Y(f.c1.y), X(G.free.x) - X(f.c1.x), Y(G.free.y) - Y(f.c1.y)); g.setLineDash([]); }
      const cross = (x, y, color) => {
        const cx = X(x), cy = Y(y), s = 7 * dpr;
        g.strokeStyle = color; g.lineWidth = 1.5 * dpr; g.beginPath(); g.moveTo(cx - s, cy); g.lineTo(cx + s, cy); g.moveTo(cx, cy - s); g.lineTo(cx, cy + s); g.stroke();
        g.strokeRect(cx - 3 * dpr, cy - 3 * dpr, 6 * dpr, 6 * dpr);
      };
      if (G.tr) { const fn = fnI(G.fi), y = fn ? fn(G.x) : NaN; if (Number.isFinite(y)) cross(G.x, y, '#1d1d1f'); }
      if (G.free) cross(G.free.x, G.free.y, '#1d1d1f');
    }

    // ---- the table
    function tableData() {
      const fs = funcs(), cols = Array.isArray(fs) ? fs : [];
      const off = Math.max(0, Math.min(T.c - 3, cols.length - 3)), shown = cols.slice(off, off + 3);
      const rows = [];
      for (let r = 0; r < ROWS; r++) { const x = clean(st.tbl.start + (T.top + r) * st.tbl.step); rows.push([x].concat(shown.map(o => o.f(x)))); }
      return { cols, shown, off, rows };
    }

    /** the Y= lines, written for the graphing page: X², × and − become x^2-style text it reads */
    const toGraph = y => 'y = ' + y.replace(/X/g, 'x').replace(/×/g, '*').replace(/·/g, '*').replace(/−/g, '-').replace(/÷/g, '/').replace(/⁻¹/g, '^(-1)').replace(/√\(/g, 'sqrt(').replace(/ᴇ/g, '*10^');
    function graphsCard() {
      const card = root.querySelector('#cx-tograph'), ys = st.ys.map((y, i) => ({ y: y.trim(), i })).filter(o => o.y && st.on[o.i]);
      card.hidden = !ys.length || !window.DRAW;
      if (card.hidden) return;
      card.querySelector('#cx-tograph-list').textContent = ys.map(o => `Y${o.i + 1} = ${o.y}`).join('   ');
      card.querySelector('#cx-tograph-btn').href = '#/graph/' + DRAW.encode(ys.map(o => toGraph(o.y)).join('\n'));
    }

    // ---- drawing the screen
    function draw() {
      root.querySelector('.cx-st').textContent = `${st.sci ? 'SCI' : 'NORMAL'} ${st.fix === null ? 'FLOAT' : 'FIX' + st.fix} ${st.am.toUpperCase()} REAL ${st.deg ? 'DEGREE' : 'RADIAN'} MP`;
      const m = root.querySelector('.cx-mod');
      m.textContent = mod === '2nd' ? '2ND' : mod === 'lock' ? 'A-LOCK' : mod === 'alpha' ? 'ALPHA' : '';
      m.className = 'cx-mod' + (mod === '2nd' ? ' second' : mod ? ' alpha' : '');
      root.querySelector('[data-k="2nd"]').setAttribute('aria-pressed', String(mod === '2nd'));
      root.querySelector('[data-k="alpha"]').setAttribute('aria-pressed', String(mod === 'alpha' || mod === 'lock'));
      const graphing = scr === 'graph';
      cv.hidden = !graphing;
      lcd.classList.toggle('over', graphing);
      let h = '';
      if (scr === 'home') {
        const items = st.hist.slice(0, st.shown).reverse();
        h = items.map((it, k) => `<div class="cx-q${sel === 2 * k ? ' sel' : ''}" data-h="${2 * k}">${echoOf(it.e)}</div><div class="cx-a${sel === 2 * k + 1 ? ' sel' : ''}" data-h="${2 * k + 1}">${valHtml(it.r.replace(/^[=≈]\s*/, ''))}</div>`).join('')
          + `<div class="cx-entry">${edHtml(ent)}</div>`;
      } else if (scr === 'error') {
        h = `<div class="cx-err-t">ERROR</div><div class="cx-err-m">${esc(err.msg)}</div>${['Quit', 'Goto'].map((l, k) => `<div class="cx-item" data-item="${k + 1}"><b class="${err.at === k ? 'on' : ''}">${k + 1}:</b>${l}</div>`).join('')}`;
      } else if (scr === 'menu') {
        h = `<div class="cx-tabs">${menu.tabs.map((t, k) => `<span class="${k === menu.tab ? 'on' : ''}" data-tab="${k}">${esc(t[0])}</span>`).join('')}</div>`
          + menu.tabs[menu.tab][1].map((it, k) => `<div class="cx-item" data-item="${it[0]}"><b class="${k === menu.at ? 'on' : ''}">${it[0]}:</b>${esc(it[1])}</div>`).join('');
      } else if (scr === 'opt') {
        h = opt.rows.map((row, r) => `<div class="cx-opt">${row.label ? `<span class="cx-ol">${row.label}</span>` : ''}${row.opts.map((o, c) => `<span class="${st[row.key] === o[1] ? 'on' : ''}${opt.r === r && opt.c === c ? ' at' : ''}" data-opt="${r}:${c}">${o[0]}</span>`).join('')}</div>`).join('');
      } else if (scr === 'yeq') {
        h = st.ys.map((s, i) => `<div class="cx-y${i === yi ? ' at' : ''}" data-y="${i}"><span class="cx-sw" style="background:${COLORS[i]}"></span><span class="cx-yn${st.on[i] ? ' on' : ''}${i === yi && yon ? ' at' : ''}" data-yon="${i}">Y<sub>${i + 1}</sub>=</span><span class="cx-yx${lineOk(i === yi ? ye.s : s) ? '' : ' bad'}">${i === yi && !yon ? edHtml(ye) : esc(s)}</span></div>`).join('');
      } else if (scr === 'window' || scr === 'tblset') {
        const list = scr === 'window' ? WIN : TBL, obj = scr === 'window' ? st.win : st.tbl;
        h = `<div class="cx-title">${scr === 'window' ? 'WINDOW' : 'TABLE SETUP'}</div>` + list.map(([k, l], i) => `<div class="cx-field${i === fl ? ' at' : ''}" data-f="${i}">${l}=${i === fl && fe ? edHtml(fe) : esc(fmtNum(obj[k]))}</div>`).join('');
      } else if (scr === 'table') {
        const d = tableData();
        if (!d.cols.length) h = '<div class="cx-err-m">Enter a function in y= to see its table.</div>';
        else {
          const cell = v => (Number.isFinite(v) ? fmtNum(v, 6) : 'ERROR');
          h = `<div class="cx-tbl" style="--cols:${d.shown.length + 1}"><span class="hd">X</span>${d.shown.map(o => `<span class="hd" style="box-shadow:inset 0 -.8cqw 0 ${COLORS[o.i]}">Y<sub>${o.i + 1}</sub></span>`).join('')}`
            + d.rows.map((row, r) => row.map((v, c) => `<span class="${r === T.r && c === Math.min(T.c, 0) + (T.c ? T.c - d.off : 0) ? 'on' : ''}">${esc(cell(v))}</span>`).join('')).join('') + '</div>';
          const rv = d.rows[T.r], c = T.c ? T.c - d.off : 0, label = c ? `Y${d.shown[c - 1].i + 1}` : 'X';
          h += `<div class="cx-tfoot">${label}=${esc(Number.isFinite(rv[c]) ? fmtNum(rv[c]) : 'ERROR')}</div>`;
        }
      } else if (graphing) {
        const fn = G.tr ? fnOf(G.fi) : null, y = fn ? fn(G.x) : NaN, show = G.tr || G.free, at = G.free || { x: G.x, y };
        const lines = [];
        if (G.flow && G.flow.prompt) lines.push(esc(G.flow.prompt));
        if (G.res) lines.push(esc(G.res.label));
        if (G.xe) lines.push('X=' + edHtml(G.xe));
        else if (show) lines.push(`<span>X=${esc(fmtNum(at.x, 8))}</span><span>Y=${Number.isFinite(at.y) ? esc(fmtNum(clean(at.y), 8)) : ''}</span>`);
        h = (G.tr && G.fi >= 0 ? `<div class="cx-gtop"><span class="cx-sw" style="background:${COLORS[G.fi]}"></span><span>Y<sub>${G.fi + 1}</sub>=${esc(st.ys[G.fi])}</span></div>` : '')
          + (lines.length ? `<div class="cx-gbot">${lines.map(l => `<div>${l}</div>`).join('')}</div>` : '');
      }
      lcd.innerHTML = h;
      graphsCard();
      const nb = root.querySelector('.cx-note');
      nb.textContent = note; nb.hidden = !note;
      if (graphing) plot();
      if (scr === 'home') {
        const s = lcd.querySelector('.sel');
        if (s) { if (s.offsetTop < lcd.scrollTop) lcd.scrollTop = s.offsetTop; else if (s.offsetTop + s.offsetHeight > lcd.scrollTop + lcd.clientHeight) lcd.scrollTop = s.offsetTop + s.offsetHeight - lcd.clientHeight; }
        else lcd.scrollTop = lcd.scrollHeight;
      } else lcd.scrollTop = 0;
      const fn = G.tr ? fnOf(G.fi) : null;
      root.__calc = { screen: scr, entry: ent.s, input: last ? last.src : '', error: err && scr === 'error' ? err.msg : null, text: last && last.answer ? last.answer.text : null,
        shown: st.shown && st.hist[0] ? st.hist[0].r : null, forms: last && last.answer ? last.answer.forms.map(f => f[0]) : [], steps: last && last.steps ? last.steps.length : 0, deg: st.deg, mod, note,
        trace: G.tr ? { x: G.x, y: fn ? fn(G.x) : NaN, fi: G.fi } : null, res: G.res ? G.res.label : null, prompt: G.flow ? G.flow.prompt : null,
        table: scr === 'table' ? tableData().rows : null, ys: st.ys.slice(), win: Object.assign({}, st.win) };
    }

    // ---- what each key does
    function text(t) {
      if (scr === 'menu' || scr === 'error') { if (/^\d$/.test(t)) { if (scr === 'menu') choose(Number(t)); else errChoose(Number(t) - 1); } return; }
      if (scr === 'graph') { if (!G.tr && !G.flow) return; if (!G.xe) G.xe = { s: '', p: 0 }; G.res = null; ins(G.xe, t); return; }
      const E = scr === 'home' ? ent : scr === 'yeq' ? ye : scr === 'window' || scr === 'tblset' ? fe : null;
      if (!E) return;
      if (scr === 'home') { sel = -1; if (wasDone && !ent.s && /^([+−×÷^²!→►]|⁻¹)/.test(t)) t = 'Ans' + t; }       // straight after an answer, an operator carries on from it
      if (scr === 'yeq') yon = false;
      ins(E, t);
      if (scr === 'yeq') { st.ys[yi] = ye.s; persist(); }
    }
    function errChoose(k) {
      const from = err.from;
      err = null;
      if (k === 0) { scr = 'home'; if (from === 'home') { ent.s = ''; ent.p = 0; } return; }
      scr = from;
      if (from === 'yeq') ye = { s: st.ys[yi], p: st.ys[yi].length };
      if (from === 'window' || from === 'tblset') field(fl);
      if (from === 'graph') G.xe = null;
    }
    const KEYS_BY_SCREEN = {
      home(n) {
        if (n === 'enter') return sel >= 0 ? useLine(sel) : enterHome();
        if (n === 'clear') { if (sel >= 0) sel = -1; else if (ent.s) { ent.s = ''; ent.p = 0; } else { st.shown = 0; persist(); } return; }
        if (n === 'del') return delAt(ent);
        if (n === 'back') return back(ent);
        if (n === 'left' || n === 'right') { sel = -1; return move(ent, n === 'left' ? -1 : 1); }
        if (n === 'bol' || n === 'eol') { ent.p = n === 'bol' ? 0 : ent.s.length; return; }
        const total = 2 * st.shown;
        if (n === 'up') { if (total) sel = sel < 0 ? total - 1 : Math.max(0, sel - 1); return; }
        if (n === 'down') { if (sel >= 0) sel = sel + 1 >= total ? -1 : sel + 1; return; }
        if (n === 'entry') { if (!st.hist.length) return; recall = Math.min(recall + 1, st.hist.length - 1); ent.s = st.hist[recall].e; ent.p = ent.s.length; }
      },
      yeq(n) {
        if (n === 'up' || n === 'down' || n === 'enter') {
          if (n === 'enter' && yon) { st.on[yi] = !st.on[yi]; persist(); return; }
          st.ys[yi] = ye.s; persist();
          const to = n === 'up' ? yi - 1 : yi + 1;
          if (to < 0 || to >= NY) return;
          const p = n === 'enter' ? 0 : Math.min(ye.p, st.ys[to].length);
          yi = to; ye = { s: st.ys[yi], p: n === 'enter' ? st.ys[yi].length : p }; yon = false; return;
        }
        if (n === 'left') { if (yon) return; if (ye.p === 0) { yon = true; return; } return move(ye, -1); }
        if (n === 'right') { if (yon) { yon = false; return; } return move(ye, 1); }
        if (n === 'bol' || n === 'eol') { yon = false; ye.p = n === 'bol' ? 0 : ye.s.length; return; }
        if (n === 'clear') { ye.s = ''; ye.p = 0; yon = false; }
        else if (n === 'del') delAt(ye);
        else if (n === 'back') back(ye);
        st.ys[yi] = ye.s; persist();
      },
      fields(n) {
        const count = (scr === 'window' ? WIN : TBL).length;
        if (n === 'up' || n === 'down' || n === 'enter') { if (!leaveFields()) return; const to = n === 'up' ? fl - 1 : fl + 1; field(Math.max(0, Math.min(count - 1, to))); return; }
        if (!fe) field(fl);
        if (n === 'clear') { fe.s = ''; fe.p = 0; fe.fresh = false; } else if (n === 'del') delAt(fe); else if (n === 'back') back(fe); else if (n === 'left' || n === 'right') move(fe, n === 'left' ? -1 : 1);
        else if (n === 'bol' || n === 'eol') { fe.fresh = false; fe.p = n === 'bol' ? 0 : fe.s.length; }
      },
      menu(n) {
        const items = menu.tabs[menu.tab][1];
        if (n === 'up') menu.at = (menu.at + items.length - 1) % items.length;
        else if (n === 'down') menu.at = (menu.at + 1) % items.length;
        else if (n === 'left' || n === 'right') { menu.tab = (menu.tab + (n === 'left' ? menu.tabs.length - 1 : 1)) % menu.tabs.length; menu.at = 0; }
        else if (n === 'enter') choose();
        else if (n === 'clear') scr = menu.back;
      },
      opt(n) {
        const row = opt.rows[opt.r];
        if (n === 'left') opt.c = Math.max(0, opt.c - 1);
        else if (n === 'right') opt.c = Math.min(row.opts.length - 1, opt.c + 1);
        else if (n === 'up' || n === 'down') { opt.r = Math.max(0, Math.min(opt.rows.length - 1, opt.r + (n === 'up' ? -1 : 1))); const nr = opt.rows[opt.r]; opt.c = Math.max(0, nr.opts.findIndex(o => o[1] === st[nr.key])); }
        else if (n === 'enter') pick(opt.r, opt.c);
        else if (n === 'clear') scr = 'home';
      },
      error(n) {
        if (n === 'up' || n === 'down') err.at = 1 - err.at;
        else if (n === 'enter') errChoose(err.at);
        else if (n === 'clear') errChoose(0);
      },
      graph(n) {
        if (G.xe) {
          if (n === 'clear') { G.xe = null; if (G.flow && G.flow.kind === 'value') G.flow = null; return; }
          if (n === 'enter') return graphEnter();
          if (n === 'del') return delAt(G.xe);
          if (n === 'back') return back(G.xe);
          if (n === 'left' || n === 'right') return move(G.xe, n === 'left' ? -1 : 1);
          return;
        }
        if (['up', 'down', 'left', 'right'].includes(n)) return graphArrow(n);
        if (n === 'enter') return graphEnter();
        if (n === 'clear') { if (G.tr || G.free || G.flow || G.res) { G.tr = false; G.free = null; G.flow = null; G.res = null; } else goHome(); }
      },
      table(n) {
        const d = tableData();
        if (n === 'up') { if (T.r > 0) T.r--; else T.top--; }
        else if (n === 'down') { if (T.r < ROWS - 1) T.r++; else T.top++; }
        else if (n === 'left') T.c = Math.max(0, T.c - 1);
        else if (n === 'right') T.c = Math.min(d.cols.length, T.c + 1);
        else if (n === 'clear') scr = 'home';
      },
    };
    function act(n) {
      if (n === 'quit') return goHome();
      if (n === 'mode') return openOpt('mode');
      if (n === 'format') return openOpt('format');
      if (n === 'yeq') return openYeq();
      if (n === 'window' || n === 'tblset') return openFields(n);
      if (n === 'zoom' || n === 'calc' || n === 'math') return openMenu(n);
      if (n === 'graph' || n === 'trace') return openGraph(n === 'trace');
      if (n === 'table') { if (!leave()) return; const fs = checkGraph(); if (!fs) return; scr = 'table'; T.top = 0; T.r = 0; T.c = 0; return; }
      if (GONE[n]) { note = GONE[n]; live(note); return; }
      if (INS[n] !== undefined) return text(INS[n]);
      const h = KEYS_BY_SCREEN[scr === 'window' || scr === 'tblset' ? 'fields' : scr];
      if (h) h(n);
    }
    function press(k) {
      note = '';
      if (k === '2nd') { mod = mod === '2nd' ? '' : '2nd'; return draw(); }
      if (k === 'alpha') { mod = mod === '2nd' ? 'lock' : mod === 'alpha' || mod === 'lock' ? '' : 'alpha'; return draw(); }
      const two = mod === '2nd', al = mod === 'alpha' || mod === 'lock';
      if (mod !== 'lock') mod = '';
      wasDone = justDone; justDone = false;
      if (al && ALPHA[k] !== undefined) { const a = ALPHA[k]; if (GONE[a]) { note = GONE[a]; live(note); } else text(a); }
      else act(two ? (SECOND[k] || k) : k);
      draw();
    }
    /** a line of history chosen with the arrows (or a tap) goes into the entry line at the cursor */
    function useLine(k) {
      const it = st.hist.slice(0, st.shown).reverse()[k >> 1];
      sel = -1;
      if (!it) return;
      ins(ent, k % 2 ? it.r.replace(/^[=≈]\s*/, '') : it.e);
    }

    // ---- the keys, taps on the screen, and the keyboard
    calcEl.addEventListener('mousedown', ev => { if (ev.target.closest('button')) ev.preventDefault(); });      // keys don't take the focus from the calculator
    calcEl.addEventListener('click', ev => {
      const b = ev.target.closest('[data-k]');
      if (b) { if (fine) calcEl.focus({ preventScroll: true }); return press(b.dataset.k); }
      if (fine) calcEl.focus({ preventScroll: true });
      const t = ev.target.closest('[data-h],[data-item],[data-opt],[data-tab],[data-y],[data-f]');
      if (!t) return;
      note = '';
      if (t.dataset.h !== undefined && scr === 'home') useLine(Number(t.dataset.h));
      else if (t.dataset.item !== undefined && scr === 'menu') choose(Number(t.dataset.item));
      else if (t.dataset.item !== undefined && scr === 'error') errChoose(Number(t.dataset.item) - 1);
      else if (t.dataset.tab !== undefined && scr === 'menu') { menu.tab = Number(t.dataset.tab); menu.at = 0; }
      else if (t.dataset.opt !== undefined && scr === 'opt') { const [r, c] = t.dataset.opt.split(':').map(Number); pick(r, c); }
      else if (t.dataset.y !== undefined && scr === 'yeq') {
        const i = Number(t.dataset.y);
        st.ys[yi] = ye.s;
        if (ev.target.closest('[data-yon]')) { st.on[i] = !st.on[i]; persist(); }
        yi = i; ye = { s: st.ys[i], p: st.ys[i].length }; yon = false;
      } else if (t.dataset.f !== undefined && (scr === 'window' || scr === 'tblset')) { if (leaveFields()) field(Number(t.dataset.f)); }
      draw();
    });
    cv.addEventListener('click', ev => {                     // a tap on the graph moves the cursor there
      const r = cv.getBoundingClientRect(), w = st.win, x = w.xmin + (ev.clientX - r.left) / r.width * (w.xmax - w.xmin), y = w.ymax - (ev.clientY - r.top) / r.height * (w.ymax - w.ymin);
      G.res = null; note = '';
      if (G.free) G.free = { x: clean(x), y: clean(y) };
      else {
        const fs = funcs();
        if (!Array.isArray(fs) || !fs.length) { G.free = { x: clean(x), y: clean(y) }; return draw(); }
        if (!G.tr) { G.tr = true; if (!fs.some(o => o.i === G.fi)) G.fi = fs[0].i; }
        let best = G.fi, bd = Infinity;                       // the curve nearest the tap
        if (!G.flow || G.flow.kind !== 'inter' || G.flow.step === 2) fs.forEach(o => { const d = Math.abs(o.f(x) - y); if (d < bd) { bd = d; best = o.i; } });
        G.fi = best; G.x = clean(w.xmin + Math.round((x - w.xmin) / dx()) * dx());
      }
      draw();
    });
    calcEl.addEventListener('keydown', ev => {
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
      if (ev.target.closest('button') && (ev.key === 'Enter' || ev.key === ' ')) return;     // a key reached with Tab: the browser presses it
      const map = { Enter: 'enter', Delete: 'del', Escape: 'clear', ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Home: 'bol', End: 'eol' };
      let n = map[ev.key];
      if (ev.key === 'Backspace') n = 'back';
      if (n) { ev.preventDefault(); mod = mod === 'lock' ? 'lock' : ''; note = ''; wasDone = justDone; justDone = false; act(n); return draw(); }
      if (ev.key.length !== 1) return;
      ev.preventDefault();
      let c = ev.key;
      if (c === ' ') return;
      if (c === '*') c = '×'; else if (c === '-') c = '−'; else if (c === 'x') c = scr === 'yeq' ? 'X' : '×';
      note = ''; wasDone = justDone; justDone = false;
      text(c);
      draw();
    });
    calcEl.addEventListener('paste', ev => {
      const t = ev.clipboardData && ev.clipboardData.getData('text');
      if (!t) return;
      ev.preventDefault();
      text(t.replace(/[\r\n\t]+/g, ' ').trim().slice(0, 200));
      draw();
    });
    if (window.ResizeObserver) new ResizeObserver(() => { if (scr === 'graph' && root.isConnected) plot(); }).observe(cv);
    root.querySelector('.cx-page').addEventListener('click', ev => {
      const c = ev.target.closest('[data-copy]');
      if (!c) return;
      const t = c.dataset.copy, done = () => { c.textContent = 'Copied'; setTimeout(() => { c.textContent = 'Copy'; }, 1400); };
      try { navigator.clipboard.writeText(t).then(done, () => window.VIEWS.toast('Couldn’t copy')); } catch (e) { window.VIEWS.toast('Couldn’t copy'); }
    });
    const how = root.querySelector('#cx-how');
    if (how) {
      const close = () => { st.seenHow = true; save(st); how.remove(); if (fine) calcEl.focus({ preventScroll: true }); };
      how.querySelector('#cx-how-ok').addEventListener('click', close);
      how.querySelector('#cx-how-try').addEventListener('click', () => { close(); ent.s = '1/3+1/4'; ent.p = ent.s.length; enterHome(); draw(); });
    }

    if (st.hist.length) { const r = run(st.hist[0].e); if (!r.error) last = r; }        // the panels show the last answer again
    panels();
    if (start) { ent.s = String(start); ent.p = ent.s.length; enterHome(); }
    draw();
    if (fine) calcEl.focus({ preventScroll: true });
    if (!start) H.tutorCtx({ notes: 'The student is on the calculator, laid out like a graphing calculator, which keeps fractions exact and shows the order of operations step by step.' });
  }

  const CALCULATOR = { page, calc, parse, answer, compile };
  window.CALCULATOR = CALCULATOR;
})();
