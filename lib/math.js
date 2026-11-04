/* Small helpers that turn numbers into readable HTML: fractions, exponents, roots, polynomials.
   No formula library is loaded, so everything here is plain HTML styled by app.css. */
'use strict';
(function () {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
  const round = (x, places) => { const p = Math.pow(10, places == null ? 6 : places); return Math.round(x * p) / p; };

  /** "−3", "2.5", "1,250": numbers the way a textbook prints them */
  function n(x, opts) {
    opts = opts || {};
    if (typeof x !== 'number' || !isFinite(x)) return String(x);      // already-rendered HTML passes through
    let s = String(round(Math.abs(x), opts.places == null ? 6 : opts.places));
    if (opts.places != null && opts.fixed) s = round(Math.abs(x), opts.places).toFixed(opts.places);
    if (opts.sep !== false && Math.abs(x) >= 1000) {
      const [whole, frac] = s.split('.');
      s = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (frac ? '.' + frac : '');
    }
    return (x < 0 ? '−' : '') + s;
  }
  /** reduce n/d; the sign goes on the numerator */
  function simp(num, den) {
    if (den < 0) { num = -num; den = -den; }
    const g = gcd(num, den);
    return [num / g, den / g];
  }
  /** a stacked fraction; whole numbers stay whole */
  function frac(num, den, opts) {
    opts = opts || {};
    if (typeof num !== 'number' || typeof den !== 'number') return `<span class="frac"><span class="num">${num}</span><span class="den">${den}</span></span>`;   // symbolic, e.g. x over 4
    if (!opts.raw) [num, den] = simp(num, den);
    if (den === 1) return n(num);
    const neg = num < 0; num = Math.abs(num);
    return (neg ? '−' : '') + `<span class="frac"><span class="num">${n(num)}</span><span class="den">${n(den)}</span></span>`;
  }
  /** plain-text fraction "−3/4", for answerText and hints that quote an answer */
  function fracText(num, den) {
    [num, den] = simp(num, den);
    return den === 1 ? n(num) : `${n(num)}/${den}`;
  }
  /** improper fraction shown as a mixed number: 7/2 → 3 1/2 */
  function mixed(num, den) {
    [num, den] = simp(num, den);
    if (den === 1) return n(num);
    const neg = num < 0; num = Math.abs(num);
    const w = Math.floor(num / den), r = num % den;
    if (w === 0) return (neg ? '−' : '') + frac(num, den);
    return (neg ? '−' : '') + `${w}<span class="mixed">${frac(r, den)}</span>`;
  }
  const sup = (base, e) => `${base}<sup>${e}</sup>`;
  const sub = (base, e) => `${base}<sub>${e}</sub>`;
  const sqrt = x => `<span class="sqrt">√<span class="rad">${x}</span></span>`;
  const v = name => `<i>${name}</i>`;
  const abs = x => `|${x}|`;
  const times = ' × ', div = ' ÷ ', dot = ' · ';
  /** "3x", "−x", "x²", "5": a coefficient and a variable with an optional power */
  function term(coef, varName, pow) {
    if (coef === 0) return '0';
    const vv = varName ? (pow && pow !== 1 ? sup(v(varName), pow) : v(varName)) : '';
    if (!varName) return n(coef);
    if (coef === 1) return vv;
    if (coef === -1) return '−' + vv;
    return n(coef) + vv;
  }
  /** polynomial from coefficients, highest power first: [2, -3, 1] → 2x² − 3x + 1 */
  function poly(coefs, varName) {
    varName = varName || 'x';
    const deg = coefs.length - 1;
    let out = '';
    coefs.forEach((c, i) => {
      if (c === 0) return;
      const p = deg - i;
      const t = term(Math.abs(c), p > 0 ? varName : '', p);
      if (out === '') out = (c < 0 ? '−' : '') + t;
      else out += (c < 0 ? ' − ' : ' + ') + t;
    });
    return out || '0';
  }
  /** "+ 3" / "− 3" for building expressions piece by piece */
  const signed = x => (x < 0 ? '− ' : '+ ') + n(Math.abs(x));
  const eq = (l, r) => `${l} = ${r}`;
  const money = x => (x < 0 ? '−' : '') + '$' + n(Math.abs(x), { places: 2, fixed: Math.abs(x) % 1 !== 0 });
  const pct = x => n(x) + '%';
  const pt = (x, y) => `(${n(x)}, ${n(y)})`;
  const deg = x => n(x) + '°';
  const units = (x, u) => n(x) + ' ' + u;
  function table(headers, rows, opts) {
    opts = opts || {};
    const th = headers.map(h => `<th>${h}</th>`).join('');
    const tr = rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
    return `<table class="mtable${opts.compact ? ' compact' : ''}"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
  }
  const ordinal = k => k + (['th', 'st', 'nd', 'rd'][(k % 100 > 10 && k % 100 < 14) ? 0 : Math.min(k % 10, 4) % 4] || 'th');
  function list(items, word) {
    word = word || 'and';
    if (items.length <= 1) return items.join('');
    if (items.length === 2) return `${items[0]} ${word} ${items[1]}`;
    return items.slice(0, -1).join(', ') + `, ${word} ` + items[items.length - 1];
  }
  const plural = (k, one, many) => `${n(k)} ${k === 1 ? one : (many || one + 's')}`;
  /** a short piece of code */
  const code = s => `<code>${esc(s)}</code>`;
  /** a code block */
  const pre = s => `<pre class="code">${esc(s)}</pre>`;

  /* ---------- Counting pictures: simple shapes drawn in SVG (never emoji) ---------- */
  // the site's chart colors, which switch with light and dark mode; the hex value is a fallback
  const ITEM_PAINT = { red: 'var(--vz2, #d2403a)', blue: 'var(--vz1, #2d6fe0)', green: 'var(--vz3, #23894a)', orange: 'var(--vz5, #dd7410)', purple: 'var(--vz4, #7448d0)' };
  const r1 = x => Math.round(x * 10) / 10;
  const HEART = [[0, .95], [-.6, .5, -1, .15, -1, -.3], [-1, -.75, -.45, -.95, 0, -.5], [.45, -.95, 1, -.75, 1, -.3], [1, .15, .6, .5, 0, .95]];
  /** one shape centered on (cx, cy), about 2h across, carrying data-item="<name>" so a verify() can count it */
  function itemShape(shape, cx, cy, h, style, name) {
    const a = `data-item="${name}" style="${style}"`;
    const pts = list => list.map(([x, y]) => `${r1(cx + x * h)},${r1(cy + y * h)}`).join(' ');
    if (shape === 'circle') return `<circle ${a} cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(h)}"/>`;
    if (shape === 'square') return `<rect ${a} x="${r1(cx - .88 * h)}" y="${r1(cy - .88 * h)}" width="${r1(1.76 * h)}" height="${r1(1.76 * h)}" rx="${r1(.18 * h)}"/>`;
    if (shape === 'triangle') return `<polygon ${a} points="${pts([[0, -1], [1.06, .82], [-1.06, .82]])}"/>`;
    if (shape === 'diamond') return `<polygon ${a} points="${pts([[0, -1.05], [.78, 0], [0, 1.05], [-.78, 0]])}"/>`;
    if (shape === 'star') {
      const out = [];
      for (let k = 0; k < 10; k++) { const t = (-90 + k * 36) * Math.PI / 180, rr = k % 2 ? .46 : 1.08; out.push([rr * Math.cos(t), rr * Math.sin(t) + .08]); }
      return `<polygon ${a} points="${pts(out)}"/>`;
    }
    if (shape === 'heart') {
      const P = (x, y) => `${r1(cx + x * h)} ${r1(cy + y * h)}`;
      return `<path ${a} d="M ${P(...HEART[0])} ${HEART.slice(1).map(c => `C ${P(c[0], c[1])} ${P(c[2], c[3])} ${P(c[4], c[5])}`).join(' ')} Z"/>`;
    }
    throw new Error('M.items: unknown shape ' + shape);
  }
  const shapeWord = (k, shape) => k === 1 ? shape : shape + 's';
  /**
   * Pictures to count, compare or group: simple filled shapes in a neat grid, as accessible inline SVG.
   *   M.items(7, 'star', 'red')                         7 red stars, in rows of 5
   *   M.items(8, 'circle', 'blue', { out: 3 })          the last 3 crossed out (taking away)
   *   M.items([[3, 'circle', 'red'], [4, 'square', 'blue']], opts)   several groups
   * A group is [count, shape, color, { hollow: true }] (hollow = an empty outline, as in a ten frame).
   * shape: circle, square, triangle, star, heart, diamond · color: red, blue, green, orange, purple
   * opts: per (shapes per row; default 5, 0 = one line) · size (cell px, default 32) · out (single group: how
   *   many to cross out) · rows (each group on its own row, left-aligned, for comparing) · flow (all groups in
   *   one grid, as in a ten frame) · sep ('+' between groups side by side) · frame (draw a box round each
   *   cell) · inline (sits in a line of text or a table cell) · label (aria-label; default "3 red circles and …")
   * Each shape carries data-item="red circle" ("empty circle", "red circle crossed"); M.countItems counts them.
   */
  function items(n, shape, color, opts) {
    let groups, o;
    if (Array.isArray(n)) { groups = n; o = shape || {}; } else { o = opts || {}; groups = [[n, shape, color, o.out ? { out: o.out } : null]]; }
    const s = o.size || 32, h = s * .38, pad = 3;
    const per = k => (o.per === 0 ? Math.max(1, k) : (o.per || 5));
    const fiveGap = p => (p > 5 ? s * .4 : 0);
    const colX = (c, p) => c * s + Math.floor(c / 5) * fiveGap(p);
    let body = '', W = 0, H = 0;
    const draw = (x0, y0, k, p, sh, col, ex, start) => {        // k shapes of one group, from grid slot `start`
      ex = ex || {};
      for (let i = 0; i < k; i++) {
        const slot = start + i, c = slot % p, row = Math.floor(slot / p);
        const cx = x0 + colX(c, p) + s / 2, cy = y0 + row * s + s / 2;
        const crossed = ex.out && i >= k - ex.out;
        if (ex.hollow) body += itemShape(sh, cx, cy, h * .9, 'fill:none;stroke:currentColor;stroke-width:1.5;opacity:.55', `empty ${sh}`);
        else body += itemShape(sh, cx, cy, h, `fill:${ITEM_PAINT[col] || col}`, `${col} ${sh}${crossed ? ' crossed' : ''}`);
        if (crossed) body += `<path d="M ${r1(cx - h * 1.1)} ${r1(cy + h * 1.1)} L ${r1(cx + h * 1.1)} ${r1(cy - h * 1.1)}" style="fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round"/>`;
      }
    };
    const blockW = (k, p) => (k ? colX(Math.min(k, p) - 1, p) + s : 0);
    const blockH = (k, p) => Math.max(1, Math.ceil(k / p)) * s;
    if (o.flow) {
      const total = groups.reduce((t, g) => t + g[0], 0), p = per(total);
      if (o.frame) for (let i = 0; i < total; i++) body += `<rect x="${r1(pad + colX(i % p, p))}" y="${r1(pad + Math.floor(i / p) * s)}" width="${s}" height="${s}" style="fill:none;stroke:currentColor;stroke-width:1.5;opacity:.6"/>`;
      let at = 0;
      groups.forEach(([k, sh, col, ex]) => { draw(pad, pad, k, p, sh, col, ex, at); at += k; });
      W = blockW(total, p); H = blockH(total, p);
    } else if (o.rows) {
      groups.forEach(([k, sh, col, ex], gi) => {
        const p = per(k), y = pad + H + (gi ? s * .25 : 0);
        draw(pad, y, k, p, sh, col, ex, 0);
        W = Math.max(W, blockW(k, p)); H = y - pad + blockH(k, p);
      });
    } else {
      groups.forEach(([k, sh, col, ex], gi) => {
        const p = per(k);
        if (gi) {
          if (o.sep) body += `<text x="${r1(pad + W + s / 2)}" y="${r1(pad + s / 2 + s * .28)}" text-anchor="middle" font-size="${r1(s * .8)}" font-weight="700">${esc(o.sep)}</text>`;
          W += o.sep ? s : s * .6;
        }
        draw(pad + W, pad, k, p, sh, col, ex, 0);
        W += blockW(k, p); H = Math.max(H, blockH(k, p));
      });
    }
    const label = o.label || list(groups.map(([k, sh, col, ex]) => ex && ex.hollow ? `${k} empty ${shapeWord(k, sh)}` :
      `${k} ${col} ${shapeWord(k, sh)}${ex && ex.out ? `, ${ex.out} of them crossed out` : ''}`));
    W = Math.ceil(W + 2 * pad); H = Math.ceil(H + 2 * pad);
    const style = o.inline ? ' style="display:inline-block;margin:0;vertical-align:middle"' : '';
    return `<svg class="figure items" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"${style} role="img" aria-label="${esc(label)}"><desc>${esc(label)}</desc>${body}</svg>`;
  }
  items.shapes = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'];
  items.colors = Object.keys(ITEM_PAINT);
  /** how many shapes named `name` ("red circle", "empty circle", "red circle crossed") a picture holds */
  const countItems = (html, name) => (String(html).match(new RegExp(`data-item="${name}"`, 'g')) || []).length;

  const M = { esc, gcd, round, n, simp, frac, fracText, mixed, sup, sub, sqrt, v, abs, times, div, dot, term, poly, signed, eq, money, pct, pt, deg, units, table, ordinal, list, plural, code, pre, items, countItems };
  if (typeof module !== 'undefined') module.exports = M;
  if (typeof window !== 'undefined') window.M = M;
})();
