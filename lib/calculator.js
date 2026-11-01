/* The calculator (#/calc): a calculator that keeps fractions exact, so 1/3 + 1/4 is 7/12 and not 0.58333…
   Every exact answer is shown four ways (a fraction, a mixed number, a decimal with its repeating digits
   under a bar, and a percent), and "Step by step" works the expression in the order of operations, a level
   at a time, saying how each fraction sum, product or quotient was found. Degrees or radians, Ans, and a
   history that is kept on this device (procademy.calc.v1, one per learner).
   Exact numbers are BigInt fractions {q:true, n, d}; square roots of non-squares, trig, logs and π make
   decimals {q:false, v}. A decimal within a hair of a simple fraction (sin 30° → 0.49999999999999994) is
   taken as that fraction. The expression is parsed here, never run as code. */
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
    if (!Number.isFinite(v)) fail('That number is too big for this calculator.');
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
    if (a.n > 250n) fail('That factorial is too big for this calculator.');
    let r = 1n; for (let i = 2n; i <= a.n; i++) r *= i;
    return Q(r);
  }
  const NAMES = { sqrt: '√', cbrt: '∛', abs: '|x|', sin: 'sin', cos: 'cos', tan: 'tan', asin: 'sin⁻¹', acos: 'cos⁻¹', atan: 'tan⁻¹', log: 'log', ln: 'ln' };
  function fn(name, a, deg) {
    if (name === 'sqrt') { if (num(a) < 0) fail('The square root of a negative number isn’t a real number.'); return pow(a, Q(1n, 2n)); }
    if (name === 'cbrt') return pow(a, Q(1n, 3n));
    if (name === 'abs') return a.q ? Q(babs(a.n), a.d) : F(Math.abs(a.v));
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
    if (name === 'tan' && deg && Math.abs((((x % 180) + 180) % 180) - 90) < 1e-9) fail('tan 90° isn’t defined: the line would go straight up.');
    return F(Math[name](deg ? x * Math.PI / 180 : x));
  }

  // ---- reading an expression
  const FNS = { sin: 'sin', cos: 'cos', tan: 'tan', asin: 'asin', acos: 'acos', atan: 'atan', arcsin: 'asin', arccos: 'acos', arctan: 'atan', sqrt: 'sqrt', root: 'sqrt', cbrt: 'cbrt', abs: 'abs', log: 'log', ln: 'ln' };
  /** tokens; a slash between two whole numbers is a fraction that stays together (2/3 ÷ 4/9 is ⅔ ÷ 4/9), while ÷ divides */
  function tokenize(src) {
    const s = String(src).replace(/[−–—]/g, '-').replace(/[×·∙]/g, '*').replace(/\*\*/g, '^').replace(/[[{]/g, '(').replace(/[\]}]/g, ')');
    const out = [];
    let i = 0, m;
    while (i < s.length) {
      const c = s[i], rest = s.slice(i);
      if (/\s/.test(c)) { i++; continue; }
      if ((m = /^(\d{1,3}(?:,\d{3})+|\d+)\s*\/\s*(\d{1,3}(?:,\d{3})+|\d+)(?![\d.])/.exec(rest))) { out.push({ t: 'num', s: m[1] + '/' + m[2] }); i += m[0].length; continue; }
      if ((m = /^(?:(\d{1,3}(?:,\d{3})+|\d+)(\.\d*)?|\.\d+)/.exec(rest))) { out.push({ t: 'num', s: m[0] }); i += m[0].length; continue; }
      if ((m = /^[a-zA-Z]+/.exec(rest))) {
        let w = m[0].toLowerCase();
        i += m[0].length;
        if (s.startsWith('⁻¹', i) && /^(sin|cos|tan)$/.test(w)) { w = 'a' + w; i += 2; }
        if (FNS[w]) out.push({ t: 'fn', s: FNS[w] });
        else if (w === 'pi') out.push({ t: 'const', s: 'π' });
        else if (w === 'e' || w === 'ans') out.push({ t: 'const', s: w === 'e' ? 'e' : 'Ans' });
        else if (w === 'of') out.push({ t: 'op', s: 'of' });
        else if (w === 'x') out.push({ t: 'op', s: '*' });
        else fail(`I don’t know “${m[0]}”. Try +, −, ×, ÷, ^, √, %, sin, cos, tan, log, ln or π.`);
        continue;
      }
      i++;
      if ('+-*/^()%!'.includes(c)) out.push({ t: 'op', s: c });
      else if (c === '÷') out.push({ t: 'op', s: '/' });
      else if (c === '√' || c === '∛') out.push({ t: 'fn', s: c === '√' ? 'sqrt' : 'cbrt' });
      else if (c === 'π') out.push({ t: 'const', s: 'π' });
      else if (c === '²' || c === '³') out.push({ t: 'sq', s: c === '²' ? '2' : '3' });
      else if (c === ',') fail('Use a dot for decimals (2.5), and commas only in big numbers (1,000).');
      else fail(`“${c}” isn’t something this calculator knows.`);
    }
    return out;
  }
  function literal(s) {
    if (s.includes('/')) { const [a, b] = s.replace(/,/g, '').split('/'); return Q(BigInt(a), BigInt(b)); }
    const [w, f = ''] = s.replace(/,/g, '').split('.');
    return Q(BigInt((w || '0') + f), 10n ** BigInt(f.length));
  }
  /** the expression as a tree; every node knows how many brackets are around it (dp), for the steps */
  function parse(src) {
    const T = tokenize(src);
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
      fail(isOp(tk, ')') ? 'There’s a “)” without a “(” before it.' : `Something is missing before “${shown(tk.s)}”.`);
    }
    const tree = expr();
    if (p < T.length) fail(isOp(T[p], ')') ? 'There’s a “)” without a “(” before it.' : `Something doesn’t fit at “${shown(T[p].s)}”.`);
    return tree;
  }

  // ---- working it out
  const isLeaf = nd => nd.k === 'num' || nd.k === 'const' || nd.k === 'val';
  function leaf(nd, ctx) {
    if (nd.k !== 'const') return nd.val;
    if (nd.name === 'π') return F(Math.PI);
    if (nd.name === 'e') return F(Math.E);
    return ctx.ans || fail('There’s no answer to use as Ans yet: work something out first.');
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
    const b = out(nd.b, html, ctx), P = BIN[nd.op];
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
      if (a.d === b.d) return `Same denominator, so ${nd.op === '+' ? 'add' : 'subtract'} the tops: ${ft(a)} ${nd.op} ${fp(b)} = ${ft(r)}.`;
      const L = lcm(a.d, b.d), x = a.n * (L / a.d), y = b.n * (L / b.d), t = nd.op === '+' ? x + y : x - y;
      return `Common denominator ${group(L)}: ${fr(x, L)} ${nd.op} ${y < 0n ? `(${fr(y, L)})` : fr(y, L)} = ${fr(t, L)}${Q(t, L).d !== L ? ` = ${ft(r)}` : ''}.`;
    }
    if (nd.op === '×') return `Multiply the tops and the bottoms: ${fr(a.n * b.n, a.d * b.d)}${a.d * b.d !== r.d ? ` = ${ft(r)}` : ''}.`;
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
    ctx = Object.assign({ deg: true, ans: null }, ctx, { dec: /\d\.\d|(^|[^\d])\.\d/.test(String(src)) });
    try {
      const tree = parse(src);
      if (!tree) return {};
      const value = evaluate(tree, ctx);
      let st = [];
      try { st = steps(tree, ctx); } catch (e) { if (!(e instanceof CalcError)) throw e; }
      return { tree, value, answer: answer(value, ctx.dec), steps: st, echo: out(tree, true, ctx).s, plain: out(tree, false, ctx).s };
    } catch (e) {
      if (e instanceof CalcError) return { error: e.message };
      if (e instanceof RangeError) return { error: 'That number is too big for this calculator.' };
      throw e;
    }
  }

  // ---- the page
  function load() { try { const o = JSON.parse(localStorage.getItem(KEY) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* a private window: nothing is kept */ } }
  const ansFrom = a => (a && typeof a === 'object' ? (typeof a.v === 'number' ? F(a.v) : /^-?\d+$/.test(a.n) && /^\d+$/.test(a.d) && a.d !== '0' ? Q(BigInt(a.n), BigInt(a.d)) : null) : null);
  const ansTo = v => (v.q ? { n: v.n.toString(), d: v.d.toString() } : { v: v.v });

  const FUNCS = [['sin(', 'sin'], ['cos(', 'cos'], ['tan(', 'tan'], ['sin⁻¹(', 'sin⁻¹'], ['cos⁻¹(', 'cos⁻¹'], ['tan⁻¹(', 'tan⁻¹'], ['log(', 'log'], ['ln(', 'ln'], ['abs(', '|x|'], ['!', 'n!'], ['∛(', '∛'], ['π', 'π'], ['e', 'e'], [' of ', 'of'], ['Ans', 'Ans']];
  const PAD = [
    ['√(', '√'], ['²', 'x²'], ['^', 'xʸ'], ['(', '('], [')', ')'],
    ['7'], ['8'], ['9'], ['÷', '÷', 'op'], ['', '⌫', 'del'],
    ['4'], ['5'], ['6'], ['×', '×', 'op'], ['', 'AC', 'ac'],
    ['1'], ['2'], ['3'], ['−', '−', 'op'], ['%', '%'],
    ['0'], ['.'], ['/', 'a/b'], ['+', '+', 'op'], ['', '=', 'eq'],
  ];
  const KEYLABEL = { '÷': 'divide', '×': 'times', '−': 'minus', '+': 'plus', '⌫': 'delete', AC: 'clear', '=': 'equals', '√': 'square root', 'x²': 'squared', 'xʸ': 'to the power', '%': 'percent', 'π': 'pi', 'a/b': 'fraction bar' };

  function page(root, start) {
    const st = load();
    st.deg = st.deg !== false;
    st.hist = Array.isArray(st.hist) ? st.hist.filter(h => h && typeof h.e === 'string' && typeof h.r === 'string').slice(0, 30) : [];
    let ans = ansFrom(st.ans), done = false, last = {};
    const fine = window.matchMedia && matchMedia('(pointer: fine)').matches;
    root.innerHTML = `<div class="cx-page">
      <div class="card">
        <div class="row between" style="gap:8px;flex-wrap:wrap"><h1 style="margin:0">Calculator</h1><button type="button" class="btn sm" id="cx-mode" aria-label="Angles in degrees or radians"></button></div>
        <p class="muted small" style="margin:6px 0 12px">Fractions stay exact: 1/3 + 1/4 is 7/12. Every answer is shown as a fraction, a mixed number, a decimal and a percent, and worked step by step. Try <b>15% of 80</b> or <b>2/3 ÷ 4/9</b>.</p>
        <label class="visually-hidden" for="cx-in">Calculation</label>
        <input id="cx-in" class="cx-in" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Type a calculation" enterkeyhint="go">
        <div id="cx-out" class="cx-out" aria-live="polite"></div>
        <div class="cx-funcs">${FUNCS.map(([ins, lab]) => `<button type="button" class="cx-key fn" data-ins="${esc(ins)}">${esc(lab)}</button>`).join('')}</div>
        <div class="cx-pad">${PAD.map(([ins, lab, kind]) => `<button type="button" class="cx-key${kind ? ' ' + kind : ''}${/^\d$|^\.$/.test(ins) ? ' digit' : ''}" ${kind === 'del' || kind === 'ac' || kind === 'eq' ? `data-act="${kind}"` : `data-ins="${esc(ins)}"`}${KEYLABEL[lab || ins] ? ` aria-label="${KEYLABEL[lab || ins]}"` : ''}>${esc(lab || ins)}</button>`).join('')}</div>
      </div>
      <div class="card"><h2>Step by step</h2><div id="cx-steps"></div></div>
      <div class="card"><div class="row between"><h2 style="margin:0">History</h2><button type="button" class="btn sm ghost" id="cx-clear">Clear</button></div><div id="cx-hist"></div></div>
    </div>`;
    const wrap = root.querySelector('.cx-page'), input = root.querySelector('#cx-in');

    function mode() { const b = root.querySelector('#cx-mode'); b.textContent = st.deg ? 'Degrees' : 'Radians'; b.setAttribute('aria-pressed', String(!st.deg)); }
    function show(committed) {
      last = calc(input.value, { deg: st.deg, ans });
      const o = root.querySelector('#cx-out');
      if (last.error) o.innerHTML = `<div class="cx-err${committed ? ' loud' : ''}">${esc(last.error)}</div>`;
      else if (!last.answer) o.innerHTML = '<div class="cx-hint muted small">The answer appears here as you type.</div>';
      else {
        const a = last.answer, n = a.int && a.value.n;
        o.innerHTML = `<div class="cx-echo">${last.echo}</div><div class="cx-ans">${a.html}</div>
          ${a.forms.length ? `<div class="cx-forms">${a.forms.map(([l, h]) => `<div class="cx-form"><span class="tiny muted">${l}</span><span class="cx-fv">${h}</span></div>`).join('')}</div>` : ''}
          ${n && n > 1n && n <= 1000000000000n ? `<a class="btn sm ghost cx-more" href="#/numbers/${n}">🌳 Factor ${group(n)}</a>` : ''}`;
      }
      const sb = root.querySelector('#cx-steps');
      const ls = last.steps || [];
      sb.innerHTML = ls.length > 1 ? `<ol class="cx-steps">${ls.map((l, i) => `<li>${i ? `<span class="cx-eq">${l.approx ? '≈' : '='}</span> ` : ''}<span class="cx-line">${l.html}</span>${l.notes && l.notes.length ? `<div class="small muted">${l.notes.map(esc).join(' ')}</div>` : ''}</li>`).join('')}</ol>`
        : '<p class="muted small" style="margin:0">Type a calculation with more than one step, like <b>2 + 3 × (4 − 1)²</b> or <b>1/2 + 2/3 × 3/4</b>, to see it worked in the order of operations: brackets, then powers, then × and ÷, then + and −.</p>';
      root.__calc = { input: input.value, error: last.error || null, text: last.answer ? last.answer.text : null, forms: last.answer ? last.answer.forms.map(f => f[0]) : [], steps: ls.length, deg: st.deg };
    }
    function hist() {
      const box = root.querySelector('#cx-hist');
      box.innerHTML = st.hist.length ? `<div class="cx-hist">${st.hist.map((h, i) => `<button type="button" class="cx-h" data-h="${i}" title="Use this again"><span class="cx-he">${esc(h.e)}</span><span class="cx-hr">${esc(h.r)}</span></button>`).join('')}</div>`
        : '<p class="muted small" style="margin:6px 0 0">Your answers are kept here, on this device. Tap one to use it again.</p>';
      root.querySelector('#cx-clear').hidden = !st.hist.length;
    }
    function commit() {
      show(true);
      if (!last.answer) return;
      ans = last.value;
      st.ans = ansTo(ans);
      const e = input.value.trim();
      if (!st.hist.length || st.hist[0].e !== e) st.hist.unshift({ e, r: last.answer.text });
      st.hist = st.hist.slice(0, 30);
      save(st); hist();
      done = true;
      H.tutorCtx({ notes: `The student is using the calculator. They worked out ${last.plain} ${last.answer.text}.` });
    }
    /** put text in at the cursor; straight after an answer, an operator carries on from it (Ans) and anything else starts afresh */
    function insert(t) {
      if (done) {
        input.value = /^[+\-−×÷^²%!]|^ of /.test(t) ? 'Ans' : '';
        input.setSelectionRange(input.value.length, input.value.length);
        done = false;
      }
      const v = input.value, a = input.selectionStart == null ? v.length : input.selectionStart, b = input.selectionEnd == null ? v.length : input.selectionEnd;
      input.value = v.slice(0, a) + t + v.slice(b);
      input.setSelectionRange(a + t.length, a + t.length);
      if (fine) input.focus();
      show();
    }

    wrap.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b || !wrap.contains(b)) return;
      if (b.dataset.ins !== undefined) return insert(b.dataset.ins);
      if (b.dataset.act === 'eq') return commit();
      if (b.dataset.act === 'ac') { input.value = ''; done = false; show(); if (fine) input.focus(); return; }
      if (b.dataset.act === 'del') {
        if (done) { done = false; }
        const v = input.value, a = input.selectionStart == null ? v.length : input.selectionStart, e = input.selectionEnd == null ? v.length : input.selectionEnd;
        const cut = a !== e ? [a, e] : a > 0 ? [a - (/[⁻¹]/.test(v[a - 1]) ? 2 : 1), a] : null;
        if (cut) { input.value = v.slice(0, cut[0]) + v.slice(cut[1]); input.setSelectionRange(cut[0], cut[0]); }
        if (fine) input.focus();
        return show();
      }
      if (b.id === 'cx-mode') { st.deg = !st.deg; save(st); mode(); return show(); }
      if (b.id === 'cx-clear') { st.hist = []; save(st); return hist(); }
      if (b.dataset.h) { const h = st.hist[Number(b.dataset.h)]; if (h) { input.value = h.e; done = false; show(); if (fine) input.focus(); } }
    });
    input.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') { ev.preventDefault(); return commit(); }
      if (ev.key === 'Escape') { input.value = ''; done = false; return show(); }
      if (done && ev.key.length === 1 && ev.key !== ' ' && !ev.ctrlKey && !ev.metaKey) { ev.preventDefault(); insert({ '*': '×', '/': '÷', '-': '−' }[ev.key] || ev.key); }
    });
    input.addEventListener('input', () => { done = false; show(); });

    if (start) input.value = start;
    mode(); show(); hist();
    if (fine) input.focus();
    H.tutorCtx({ notes: 'The student is on the calculator, which keeps fractions exact and shows the order of operations step by step.' });
  }

  const CALCULATOR = { page, calc, parse, answer };
  window.CALCULATOR = CALCULATOR;
})();
