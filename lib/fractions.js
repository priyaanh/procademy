/* Fraction lab (#/fractions, #/fractions/<op>, #/fractions/<op>/<a>_<b>). Add, subtract, multiply, divide, compare
   and simplify fractions and mixed numbers, each with a picture: fraction bars on one scale, re-cut into same-size
   pieces, for adding, subtracting and comparing; an area model (or a generic rectangle for mixed numbers) for
   multiplying; groups marked along a bar for dividing. Every step is shown, and the answer is given in simplest form,
   as a mixed number, as a decimal (repeating digits marked) and as a percent. In links 3-4 is 3/4 and 1-1-2 is 1 1/2. */
'use strict';
(function () {
  const V = window.VIEWS, H = V._h, esc = H.esc;

  // ---- exact fractions [n, d], d > 0
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const lcm = (a, b) => a / gcd(a, b) * b;
  const Q = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
  const add = (a, b) => Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  const mul = (a, b) => Q(a[0] * b[0], a[1] * b[1]);
  const val = q => q[0] / q[1];
  const cmp = (a, b) => Math.sign(a[0] * b[1] - b[0] * a[1]);
  const run = (...segs) => segs.flatMap(([k, c]) => Array(Math.max(0, k)).fill(c));

  // ---- reading what was typed: 3/4, 1 1/2, 2, 0.75, ½
  const UNI = { '½': '1/2', '⅓': '1/3', '⅔': '2/3', '¼': '1/4', '¾': '3/4', '⅕': '1/5', '⅖': '2/5', '⅗': '3/5', '⅘': '4/5', '⅙': '1/6', '⅚': '5/6', '⅛': '1/8', '⅜': '3/8', '⅝': '5/8', '⅞': '7/8' };
  /** {q, kind: whole|frac|mixed|dec, w, n, d, text, code} or {error: empty|bad|zero|negative|big|places} */
  function parse(s) {
    const t = String(s == null ? '' : s).replace(/(\d)\s*([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])/g, (_, a, c) => a + ' ' + UNI[c]).replace(/[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/g, c => UNI[c])
      .replace(/[⁄∕]/g, '/').replace(/,/g, '').replace(/\s+and\s+/i, ' ').replace(/\s*\/\s*/g, '/').replace(/\s+/g, ' ').trim();
    if (!t) return { error: 'empty' };
    if (/^[-−–]/.test(t)) return { error: 'negative' };
    let m;
    const big = (...xs) => xs.some(x => x > 1000);
    if ((m = /^(\d+)$/.exec(t))) { const w = +m[1]; return big(w) ? { error: 'big' } : { q: [w, 1], kind: 'whole', w, text: String(w), code: String(w) }; }
    if ((m = /^(\d*)\.(\d+)$/.exec(t))) {
      if (m[2].length > 6) return { error: 'places' };
      const pow = Math.pow(10, m[2].length), n = Number(m[1] || 0) * pow + Number(m[2]);
      if (n / pow > 1000) return { error: 'big' };
      const text = (m[1] || '0') + '.' + m[2];
      return { q: Q(n, pow), kind: 'dec', n, d: pow, text, code: text };
    }
    if ((m = /^(\d+)\/(\d+)$/.exec(t))) {
      const n = +m[1], d = +m[2];
      if (!d) return { error: 'zero' };
      return big(n, d) ? { error: 'big' } : { q: Q(n, d), kind: 'frac', n, d, text: `${n}/${d}`, code: `${n}-${d}` };
    }
    if ((m = /^(\d+)[ -](\d+)\/(\d+)$/.exec(t))) {
      const w = +m[1], n = +m[2], d = +m[3];
      if (!d) return { error: 'zero' };
      return big(w, n, d) ? { error: 'big' } : { q: Q(w * d + n, d), kind: 'mixed', w, n, d, text: `${w} ${n}/${d}`, code: `${w}-${n}-${d}` };
    }
    return { error: 'bad' };
  }
  /** a link's 1-1-2 back into 1 1/2 */
  const decode = c => { const p = String(c || '').split('-'); return p.length === 3 ? `${p[0]} ${p[1]}/${p[2]}` : p.length === 2 ? `${p[0]}/${p[1]}` : p[0]; };

  // ---- showing fractions
  const F = (n, d) => `<span class="frac"><span class="num">${n}</span><span class="den">${d}</span></span>`;
  const Fs = (n, d) => (n < 0 ? '−' + F(-n, d) : F(n, d));
  /** a fraction in HTML, as a mixed number when asked */
  function show(q, mixed) {
    const [n, d] = q, neg = n < 0 ? '−' : '', a = Math.abs(n);
    if (d === 1) return neg + a;
    if (mixed && a > d) return `${neg}${Math.floor(a / d)}&#8202;${F(a % d, d)}`;
    return neg + F(a, d);
  }
  /** the same in plain text, for pictures and the tutor */
  function txt(q, mixed) {
    const [n, d] = q, neg = n < 0 ? '−' : '', a = Math.abs(n);
    if (d === 1) return neg + a;
    if (mixed && a > d) return `${neg}${Math.floor(a / d)} ${a % d}/${d}`;
    return `${neg}${a}/${d}`;
  }
  /** a number as it was typed */
  const typed = p => (p.kind === 'mixed' ? `${p.w}&#8202;${F(p.n, p.d)}` : p.kind === 'frac' ? F(p.n, p.d) : p.text);
  const NAMES = { 1: 'wholes', 2: 'halves', 3: 'thirds', 4: 'fourths', 5: 'fifths', 6: 'sixths', 7: 'sevenths', 8: 'eighths', 9: 'ninths', 10: 'tenths', 11: 'elevenths', 12: 'twelfths', 13: 'thirteenths', 14: 'fourteenths', 15: 'fifteenths', 16: 'sixteenths', 17: 'seventeenths', 18: 'eighteenths', 19: 'nineteenths', 20: 'twentieths', 24: 'twenty-fourths', 30: 'thirtieths', 36: 'thirty-sixths', 40: 'fortieths', 48: 'forty-eighths', 50: 'fiftieths', 60: 'sixtieths', 100: 'hundredths' };
  const pieces = d => NAMES[d] || `pieces of size 1/${d}`;

  /** n/d as a decimal by long division, with the repeating digits marked */
  function decimal(q) {
    const neg = q[0] < 0 ? '−' : '', d = q[1];
    let n = Math.abs(q[0]);
    const w = Math.floor(n / d), digits = [], seen = new Map();
    let r = n % d;
    while (r && !seen.has(r) && digits.length < 30) { seen.set(r, digits.length); r *= 10; digits.push(Math.floor(r / d)); r %= d; }
    const head = neg + w.toLocaleString('en-US');
    if (!r) return { html: head + (digits.length ? '.' + digits.join('') : ''), exact: true, value: val(q) };
    if (seen.has(r)) {
      const at = seen.get(r), fix = digits.slice(0, at).join(''), rep = digits.slice(at).join('');
      if (rep.length <= 8) return { html: `${head}.${fix}<span class="cx-rep" title="These digits repeat forever">${rep}</span>`, exact: false, repeats: true, value: val(q) };
    }
    return { html: '≈ ' + (Math.round(val(q) * 1e6) / 1e6).toLocaleString('en-US', { maximumFractionDigits: 6 }), exact: false, value: val(q) };
  }
  function percent(q) {
    const p = Q(q[0] * 100, q[1]), dc = decimal(p);
    if (p[1] === 1 || (dc.exact && dc.html.length <= 9)) return dc.html + '%';
    return `${show(p, true)}% ≈ ${(Math.round(val(p) * 100) / 100).toLocaleString('en-US')}%`;
  }
  const factors = n => { const out = []; for (let i = 1; i <= n; i++) if (n % i === 0) out.push(i); return out; };
  const mults = (d, L) => { const out = []; for (let k = d; k <= L; k += d) out.push(k === L ? `<b>${k}</b>` : k); return out.join(', '); };

  // ---- lines of working that several questions share
  /** the number as a fraction (not yet simplified), with the working to get there */
  function asFraction(p, wholeToo) {
    if (p.kind === 'mixed') return { r: [p.w * p.d + p.n, p.d], lines: [`${typed(p)} = ${F(`${p.w} × ${p.d} + ${p.n}`, p.d)} = ${F(p.w * p.d + p.n, p.d)}`] };
    if (p.kind === 'dec') return { r: p.q, lines: [`${p.text} = ${F(p.n, p.d)}${p.q[1] !== p.d ? ` = ${show(p.q)}` : ''}`] };
    if (p.kind === 'whole') return { r: [p.w, 1], lines: wholeToo ? [`${p.w} = ${F(p.w, 1)}`] : [] };
    return { r: [p.n, p.d], lines: [] };
  }
  /** rewriting n/d with the denominator L */
  const rewrite = (q, L) => (q[1] === 1 ? `${q[0]} = ${F(q[0] * L, L)}` : `${F(q[0], q[1])} = ${F(`${q[0]} × ${L / q[1]}`, `${q[1]} × ${L / q[1]}`)} = ${F(q[0] * L / q[1], L)}`);
  function simplifyLines(n, d) {
    const g = gcd(n, d);
    if (g === 1 || d === 1) return null;
    return [`${Fs(n, d)} = ${n < 0 ? '−' : ''}${F(`${Math.abs(n)} ÷ ${g}`, `${d} ÷ ${g}`)} = <b>${show(Q(n, d))}</b>`, `Divide the top and the bottom by ${g}, their greatest common factor.`];
  }
  function mixedLines(q) {
    const a = Math.abs(q[0]), d = q[1];
    if (d === 1 || a < d) return null;
    return [`${a} ÷ ${d} = ${Math.floor(a / d)} remainder ${a % d}`, `so ${show(q)} = <b>${show(q, true)}</b>`];
  }
  /** the usual finish: simplify, then a mixed number */
  function finish(work, n, d) {
    const s = simplifyLines(n, d), mx = mixedLines(Q(n, d));
    if (s) work.push(['Simplify', s]);
    if (mx) work.push(['As a mixed number', mx]);
  }
  /** answer tiles: the fraction, a mixed number and a decimal */
  function tiles(ans, sub) {
    const dc = decimal(ans);
    return [['Answer', show(ans), sub], ...(Math.abs(ans[0]) > ans[1] && ans[1] > 1 ? [['As a mixed number', show(ans, true), '']] : []),
      ...(ans[1] > 1 ? [['As a decimal', dc.html, dc.repeats ? 'the digits under the line repeat' : dc.exact ? '' : 'rounded']] : [])];
  }

  // ---- pictures
  const BX = 8, BW = 404, GAP = 8;
  const unitW = W => (BW - (W - 1) * GAP) / W;
  /** whether bars of up to W wholes, cut into per pieces, are big enough to see */
  const fits = (W, per) => W >= 1 && W <= 4 && unitW(W) / per >= 4;
  /** fraction bars on one scale. rows: [{label, per, cls: [a class for each piece], marks: [[from, to, label]]}] */
  function bars(rows, W, aria, guide) {
    const unit = unitW(W), RH = 26;
    let y = 2, body = '';
    rows.forEach(r => {
      const pw = unit / r.per, wholes = Math.max(1, Math.ceil(r.cls.length / r.per));
      const start = i => BX + Math.floor(i / r.per) * (unit + GAP) + (i % r.per) * pw;
      const end = i => (i <= 0 ? BX : BX + Math.floor((i - 1) / r.per) * (unit + GAP) + ((i - 1) % r.per + 1) * pw);
      body += `<text x="${BX}" y="${y + 13}" class="fr-lab">${esc(r.label)}</text>`;
      const top = y + 20;
      for (let w = 0; w < wholes; w++) {
        const x = BX + w * (unit + GAP);
        for (let p = 0; p < r.per; p++) {
          const c = r.cls[w * r.per + p] || 'empty';
          body += `<rect x="${(x + p * pw + 0.75).toFixed(2)}" y="${top + 0.75}" width="${Math.max(0.6, pw - 1.5).toFixed(2)}" height="${RH - 1.5}" rx="${pw > 12 ? 3 : 1}" class="fr-pc ${c}"/>`;
        }
        body += `<rect x="${x.toFixed(2)}" y="${top}" width="${unit.toFixed(2)}" height="${RH}" rx="4" class="fr-whole"/>`;
      }
      y = top + RH;
      if (r.marks && r.marks.length) {
        let below = false;
        r.marks.forEach(([s, e, lab], i) => {
          const a = start(s) + 1.5, b = end(e) - 1.5, w = String(lab).length * 7.6;
          body += `<path d="M${a.toFixed(1)} ${y + 3}v6H${b.toFixed(1)}v-6" class="fr-brace"/>`;
          if (b - a >= w + 2) body += `<text x="${((a + b) / 2).toFixed(1)}" y="${y + 22}" text-anchor="middle" class="fr-small">${esc(lab)}</text>`;
          else if (i === r.marks.length - 1) { below = true; body += `<text x="${Math.min(Math.max((a + b) / 2, BX + w / 2), 412 - w / 2).toFixed(1)}" y="${y + 38}" text-anchor="middle" class="fr-small">${esc(lab)}</text>`; }
        });
        y += below ? 42 : 26;
      }
      y += 12;
    });
    if (guide != null) {
      let w = Math.floor(guide + 1e-9), f = guide - w;
      if (w >= 1 && f < 1e-9) { w -= 1; f = 1; }
      const gx = (BX + w * (unit + GAP) + f * unit).toFixed(1);
      body += `<line x1="${gx}" x2="${gx}" y1="18" y2="${y - 8}" class="fr-guide"/>`;
    }
    return `<svg class="fr-svg" viewBox="0 0 420 ${y}" role="img" aria-label="${esc(aria)}">${body}</svg>`;
  }
  /** a number line from 0, for numbers too big or too finely cut for bars. marks: [{q, label, cls}] */
  function numberLine(marks, aria) {
    const top = Math.max(1, ...marks.map(m => Math.ceil(val(m.q) - 1e-9))), x0 = 22, x1 = 398, X = v => x0 + (x1 - x0) * v / top, y = 70;
    const every = top <= 12 ? 1 : top <= 60 ? 5 : top <= 240 ? 20 : top <= 1200 ? 100 : 1000;
    let body = `<line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" class="fr-line"/>`;
    for (let k = 0; k <= top; k += every) body += `<line x1="${X(k).toFixed(1)}" x2="${X(k).toFixed(1)}" y1="${y - 6}" y2="${y + 6}" class="fr-line"/><text x="${X(k).toFixed(1)}" y="${y + 22}" text-anchor="middle" class="fr-small">${k.toLocaleString('en-US')}</text>`;
    let last = -1e9, row = 0;
    marks.slice().sort((a, b) => val(a.q) - val(b.q)).forEach(m => {
      const x = X(val(m.q));
      row = x - last < 64 ? (row + 1) % 2 : 0;
      last = x;
      const ly = y - 16 - row * 20;
      body += `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${ly + 4}" y2="${y}" class="fr-tick"/><circle cx="${x.toFixed(1)}" cy="${y}" r="6" class="fr-dot ${m.cls}"/><text x="${x.toFixed(1)}" y="${ly}" text-anchor="middle" class="fr-lab">${esc(m.label)}</text>`;
    });
    return `<svg class="fr-svg" viewBox="0 0 420 100" role="img" aria-label="${esc(aria)}">${body}</svg>`;
  }
  /** a whole square cut one way into columns and the other way into rows; the overlap is the product */
  function areaModel(a, b) {
    const [n1, d1] = a, [n2, d2] = b, S = 220, x0 = 150, y0 = 36, cw = S / d1, ch = S / d2;
    let body = '';
    if (d1 * d2 <= 144) {
      for (let i = 0; i < d1; i++) for (let j = 0; j < d2; j++) {
        const A = i < n1, B = j < n2;
        body += `<rect x="${(x0 + i * cw + 0.75).toFixed(2)}" y="${(y0 + j * ch + 0.75).toFixed(2)}" width="${(cw - 1.5).toFixed(2)}" height="${(ch - 1.5).toFixed(2)}" class="fr-cell ${A && B ? 'ab' : A ? 'fa' : B ? 'fb' : 'e'}"/>`;
      }
    } else {
      body += `<rect x="${x0}" y="${y0}" width="${S}" height="${S}" class="fr-cell e"/><rect x="${x0}" y="${y0}" width="${(cw * n1).toFixed(2)}" height="${S}" class="fr-cell fa"/><rect x="${x0}" y="${y0}" width="${S}" height="${(ch * n2).toFixed(2)}" class="fr-cell fb"/><rect x="${x0}" y="${y0}" width="${(cw * n1).toFixed(2)}" height="${(ch * n2).toFixed(2)}" class="fr-cell ab"/>`;
    }
    body += `<rect x="${x0}" y="${y0}" width="${S}" height="${S}" class="fr-whole"/>`;
    const ax = x0 + cw * n1, by = y0 + ch * n2;
    if (n1) body += `<path d="M${x0 + 1} ${y0 - 4}v-6H${(ax - 1).toFixed(1)}v6" class="fr-brace"/><text x="${((x0 + ax) / 2).toFixed(1)}" y="${y0 - 16}" text-anchor="middle" class="fr-lab">${esc(txt(a))}</text>`;
    if (n2) body += `<path d="M${x0 - 4} ${y0 + 1}h-6V${(by - 1).toFixed(1)}h6" class="fr-brace"/><text x="${x0 - 16}" y="${((y0 + by) / 2 + 5).toFixed(1)}" text-anchor="end" class="fr-lab">${esc(txt(b))}</text>`;
    body += `<text x="${x0 + S / 2}" y="${y0 + S + 20}" text-anchor="middle" class="fr-small">1 whole</text>`;
    return `<svg class="fr-svg sq" viewBox="0 0 420 ${y0 + S + 28}" role="img" aria-label="${esc(`An area model: a whole square with ${txt(a)} shaded one way and ${txt(b)} the other. They overlap in ${n1 * n2} of the ${d1 * d2} parts.`)}">${body}</svg>`;
  }
  /** a whole number and a fraction part, for a generic rectangle */
  const parts = q => { const w = Math.floor(q[0] / q[1]), f = Q(q[0] - w * q[1], q[1]); return [w ? [w, 1] : null, f[0] ? f : null].filter(Boolean); };
  /** mixed numbers multiplied as a rectangle drawn to scale, split into its whole and fraction parts */
  function generic(a, b) {
    const cols = parts(a), rows = parts(b), va = val(a), vb = val(b), s = Math.min(300 / va, 200 / vb, 120);
    const x0 = 86, y0 = 40, Wd = va * s, Ht = vb * s;
    let body = '', x = x0, k = 0;
    cols.forEach(c => {
      let y = y0;
      const w = val(c) * s;
      rows.forEach(r => {
        const h = val(r) * s, lab = txt(mul(c, r), true);
        body += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" class="fr-reg ${k++ % 3 === 0 ? 'ga' : 'gb'}"/>`;
        if (w >= lab.length * 9 + 8 && h >= 20) body += `<text x="${(x + w / 2).toFixed(1)}" y="${(y + h / 2 + 5).toFixed(1)}" text-anchor="middle" class="fr-lab in">${esc(lab)}</text>`;
        y += h;
      });
      x += w;
    });
    if (va <= 12 && vb <= 12) {
      for (let i = 1; i < va; i++) body += `<line x1="${(x0 + i * s).toFixed(1)}" x2="${(x0 + i * s).toFixed(1)}" y1="${y0}" y2="${(y0 + Ht).toFixed(1)}" class="fr-unit"/>`;
      for (let j = 1; j < vb; j++) body += `<line x1="${x0}" x2="${(x0 + Wd).toFixed(1)}" y1="${(y0 + j * s).toFixed(1)}" y2="${(y0 + j * s).toFixed(1)}" class="fr-unit"/>`;
    }
    let cx = x0;
    cols.forEach((c, i) => {
      const w = val(c) * s, l = txt(c), narrow = w < l.length * 7.5 + 6;
      body += `<text x="${(narrow && i ? cx + w + 2 : cx + w / 2).toFixed(1)}" y="${narrow && i ? y0 - 18 : y0 - 8}" text-anchor="${narrow && i ? 'start' : 'middle'}" class="fr-lab">${esc(l)}</text>`;
      if (i) body += `<line x1="${cx.toFixed(1)}" x2="${cx.toFixed(1)}" y1="${y0}" y2="${(y0 + Ht).toFixed(1)}" class="fr-split"/>`;
      cx += w;
    });
    let cy = y0;
    rows.forEach((r, j) => {
      const h = val(r) * s;
      body += `<text x="${x0 - 8}" y="${(h < 16 && j ? cy + h + 12 : cy + h / 2 + 5).toFixed(1)}" text-anchor="end" class="fr-lab">${esc(txt(r))}</text>`;
      if (j) body += `<line x1="${x0}" x2="${(x0 + Wd).toFixed(1)}" y1="${cy.toFixed(1)}" y2="${cy.toFixed(1)}" class="fr-split"/>`;
      cy += h;
    });
    body += `<rect x="${x0}" y="${y0}" width="${Wd.toFixed(2)}" height="${Ht.toFixed(2)}" class="fr-whole"/>`;
    return `<svg class="fr-svg" viewBox="0 0 420 ${(y0 + Ht + 14).toFixed(0)}" role="img" aria-label="${esc(`A generic rectangle ${txt(a, true)} wide and ${txt(b, true)} tall, split into its whole and fraction parts. The parts add up to ${txt(mul(a, b), true)}.`)}">${body}</svg>`;
  }
  const key = items => `<div class="fr-key">${items.map(([c, t]) => `<span><span class="fr-sw ${c}"></span>${t}</span>`).join('')}</div>`;
  const label = (p, r) => p.text + (p.kind === 'dec' ? ' = ' + txt(r) : '');

  // ---- the questions. Each returns {res, fig, key, work, notes, hook}
  function addSub(ps, minus) {
    const [A, B] = ps.map(p => asFraction(p)), a = A.r, b = B.r;
    const L = lcm(a[1], b[1]), x = a[0] * L / a[1], y = b[0] * L / b[1], s = minus ? x - y : x + y, ans = Q(s, L), sym = minus ? '−' : '+';
    const work = [];
    const conv = [...A.lines, ...B.lines];
    if (conv.length) work.push(['Write them as fractions', conv]);
    if (a[1] !== b[1]) {
      work.push(['Find a common denominator', [...(L / a[1] <= 8 && L / b[1] <= 8 && a[1] > 1 && b[1] > 1 ? [`Multiples of ${a[1]}: ${mults(a[1], L)}`, `Multiples of ${b[1]}: ${mults(b[1], L)}`] : []), `The least common denominator is <b>${L}</b>, so cut everything into ${pieces(L)}.`]]);
      work.push(['Make the pieces the same size', [a, b].filter(q => q[1] !== L).map(q => rewrite(q, L))]);
    }
    work.push([minus ? 'Subtract the numerators' : 'Add the numerators', [`${F(x, L)} ${sym} ${F(y, L)} = ${F(`${x} ${sym} ${y}`, L)} = ${Fs(s, L)}`, `The pieces are still ${pieces(L)}, so the denominator stays ${L}.`]]);
    finish(work, s, L);
    if (!minus && ps.some(p => p.kind === 'mixed') && ps.every(p => p.kind !== 'dec')) {
      const [wa, fa] = [ps[0], ps[1]].map(p => (p.kind === 'mixed' ? [p.w, Q(p.n, p.d)] : p.kind === 'whole' ? [p.w, [0, 1]] : [0, Q(p.q[0], p.q[1])]));
      const W = wa[0] + fa[0], fs = add(wa[1], fa[1]);
      const lines = [`Wholes: ${wa[0]} + ${fa[0]} = ${W}`, `Fractions: ${show(wa[1])} + ${show(fa[1])} = ${show(fs)}${fs[0] > fs[1] ? ` = ${show(fs, true)}` : ''}`];
      lines.push(`Together: ${W} + ${show(fs, fs[0] > fs[1])} = <b>${show(ans, true)}</b>`);
      work.push(['Another method: wholes and fractions separately', lines]);
    }
    const W = Math.max(1, ...[val(a), val(b), Math.abs(val(ans))].map(v => Math.ceil(v - 1e-9)));
    let fig, k = '';
    const lab = `${label(ps[0], a)} ${sym} ${label(ps[1], b)} = ${txt(ans, true)}`;
    if (fits(W, Math.max(a[1], b[1], L))) {
      const rows = [{ label: label(ps[0], a), per: a[1], cls: run([a[0], 'a']) }, { label: label(ps[1], b), per: b[1], cls: run([b[0], 'b']) }];
      const inL = L === 1 ? 'In wholes' : `In ${pieces(L)}`;
      if (!minus) { rows.push({ label: `${inL}: ${x}/${L} + ${y}/${L} = ${txt(Q(s, L), true)}`, per: L, cls: run([x, 'a'], [y, 'b']) }); k = key([['a', esc(txt(a, true))], ['b', esc(txt(b, true))]]); }
      else if (s >= 0) { rows.push({ label: `${inL}: take ${y}/${L} away from ${x}/${L}`, per: L, cls: run([s, 'a'], [y, 'gone']) }); k = key([['a', `what remains: ${esc(txt(ans, true))}`], ['gone', 'taken away']]); }
      else { rows.push({ label: `${inL}: ${y}/${L} is ${-s}/${L} more than ${x}/${L}`, per: L, cls: run([x, 'match'], [-s, 'b']) }); k = key([['match', 'the part they share'], ['b', `how much more the second is: ${esc(txt(Q(-s, L)))}`]]); }
      fig = bars(rows, W, lab);
    } else fig = numberLine([{ q: a, label: txt(a, true), cls: 'a' }, { q: b, label: txt(b, true), cls: 'b' }, ...(s >= 0 ? [{ q: ans, label: txt(ans, true), cls: 'c' }] : [])], lab);
    return {
      res: tiles(ans, `${ps[0].text} ${sym} ${ps[1].text}`), fig, key: k, work,
      notes: [a[1] !== b[1] ? `Multiplying by a fraction like ${F(L / a[1], L / a[1])} is multiplying by 1 (CPM calls it a Giant One), so the amount stays the same. Only the size of the pieces changes.` : '',
        'Only add or subtract the numerators. The denominator gives the size of the pieces, and that doesn’t change.',
        s < 0 ? 'The second number is greater, so the answer is negative.' : ''],
      hook: { answer: txt(ans), mixed: txt(ans, true), value: val(ans), lcd: L },
    };
  }
  function times(ps) {
    const [A, B] = ps.map(p => asFraction(p, true)), a = A.r, b = B.r, P = a[0] * b[0], R = a[1] * b[1], ans = Q(P, R);
    const work = [];
    const conv = [...A.lines, ...B.lines];
    if (conv.length) work.push(['Write them as fractions', conv]);
    work.push(['Multiply the numerators and the denominators', [`${F(a[0], a[1])} × ${F(b[0], b[1])} = ${F(`${a[0]} × ${b[0]}`, `${a[1]} × ${b[1]}`)} = ${F(P, R)}`]]);
    finish(work, P, R);
    const qa = Q(a[0], a[1]), qb = Q(b[0], b[1]), big = val(qa) > 1 || val(qb) > 1;
    if (big && P) {
      const ca = parts(qa), cb = parts(qb), prods = [];
      ca.forEach(c => cb.forEach(r => prods.push([c, r, mul(c, r)])));
      if (prods.length > 1) {
        work.push(['With a generic rectangle', [`${ca.length > 1 ? `(${ca.map(q => show(q)).join(' + ')})` : show(qa)} × ${cb.length > 1 ? `(${cb.map(q => show(q)).join(' + ')})` : show(qb)}`,
          ...prods.map(([c, r, p]) => `${show(c)} × ${show(r)} = ${show(p, true)}`), `${prods.map(x => show(x[2], true)).join(' + ')} = <b>${show(ans, true)}</b>`]]);
      }
    }
    const g1 = gcd(a[0], b[1]), g2 = gcd(b[0], a[1]);
    let fig, k = '';
    if (!P) fig = '';
    else if (!big) {
      const use = a[1] * b[1] <= 144 ? [a, b] : [qa, qb];
      fig = areaModel(use[0], use[1]);
      k = key([['fa', esc(txt(use[0]))], ['fb', esc(txt(use[1]))], ['ab', `both: ${use[0][0] * use[1][0]} of ${use[0][1] * use[1][1]} parts = ${esc(txt(ans))}`]]);
    } else fig = generic(qa, qb);
    return {
      res: tiles(ans, `${ps[0].text} × ${ps[1].text}`), fig, key: k, work,
      notes: [(g1 > 1 && a[0] && b[1] > 1) || (g2 > 1 && b[0] && a[1] > 1) ? `A shortcut: simplify before you multiply. ${g1 > 1 && b[1] > 1 ? `${a[0]} and ${b[1]}` : `${b[0]} and ${a[1]}`} share a factor of ${g1 > 1 && b[1] > 1 ? g1 : g2}, so divide both by it first and the numbers stay small.` : '',
        'A common denominator isn’t needed to multiply. It is needed only for adding and subtracting.',
        val(qa) > 0 && val(qb) > 0 && (val(qa) < 1 || val(qb) < 1) ? `Multiplying by a number less than 1 gives a smaller result: ${val(qb) < 1 ? `${txt(qb)} of ${txt(qa, true)} is less than ${txt(qa, true)}` : `${txt(qa)} of ${txt(qb, true)} is less than ${txt(qb, true)}`}.` : ''],
      hook: { answer: txt(ans), mixed: txt(ans, true), value: val(ans) },
    };
  }
  function divide(ps) {
    const [A, B] = ps.map(p => asFraction(p, true)), a = A.r, b = B.r, L = lcm(a[1], b[1]), x = a[0] * L / a[1], y = b[0] * L / b[1], ans = Q(x, y);
    const qa = Q(a[0], a[1]), qb = Q(b[0], b[1]);
    const work = [];
    const conv = [...A.lines, ...B.lines];
    if (conv.length) work.push(['Write them as fractions', conv]);
    work.push(['Method 1: same-size pieces', [...[a, b].filter(q => q[1] !== L).map(q => rewrite(q, L)), `${F(x, L)} ÷ ${F(y, L)}: how many groups of ${y} ${y === 1 ? 'piece' : 'pieces'} fit in ${x}?`, `${x} ÷ ${y} = <b>${show(ans, true)}</b>`]]);
    const R = [a[0] * b[1], a[1] * b[0]];
    work.push(['Method 2: multiply by the reciprocal', [`The reciprocal of ${F(b[0], b[1])} is ${F(b[1], b[0])}: swap the numerator and the denominator.`, `${F(a[0], a[1])} ÷ ${F(b[0], b[1])} = ${F(a[0], a[1])} × ${F(b[1], b[0])} = ${F(R[0], R[1])}${gcd(R[0], R[1]) > 1 ? ` = ${show(ans)}` : ''}${Math.abs(ans[0]) > ans[1] && ans[1] > 1 ? ` = <b>${show(ans, true)}</b>` : ''}`]]);
    work.push(['Check it', [`${show(ans, true)} × ${show(qb, true)} = ${show(mul(ans, qb), true)} ✓`]]);
    const k0 = Math.floor(x / y), rem = x - k0 * y, n = rem ? k0 + 1 : k0, W = Math.max(1, Math.ceil(Math.max(x, n * y) / L - 1e-9));
    let fig = '', k = '';
    const lab = `${label(ps[0], a)} ÷ ${label(ps[1], b)} = ${txt(ans, true)}`;
    if (x && n <= 24 && fits(W, L)) {
      const cls = [];
      for (let i = 0; i < n * y; i++) cls.push(i < x ? (Math.floor(i / y) % 2 ? 'g2' : 'g1') : 'gone');
      const marks = [];
      for (let j = 0; j < k0; j++) marks.push([j * y, (j + 1) * y, String(j + 1)]);
      if (rem) marks.push([k0 * y, (k0 + 1) * y, `${txt(Q(rem, y))} of a group`]);
      fig = bars([{ label: `${label(ps[0], a)}${a[1] !== L || ps[0].kind === 'mixed' ? ` = ${x}/${L}` : ''}`, per: L, cls: run([x, 'a']) }, { label: `Groups of ${txt(qb, true)}${b[1] !== L || ps[1].kind === 'mixed' ? ` (${y}/${L})` : ''}`, per: L, cls, marks }], W, lab);
      k = key([['a', esc(txt(qa, true))], ['g1', `groups of ${esc(txt(qb, true))}`], ...(rem ? [['gone', 'the rest of the last group']] : [])]);
    } else if (x) fig = numberLine([{ q: qa, label: txt(qa, true), cls: 'a' }, { q: qb, label: txt(qb, true), cls: 'b' }], lab);
    return {
      res: tiles(ans, `${ps[0].text} ÷ ${ps[1].text}: ${k0 === 0 && rem ? 'less than one group fits' : `${txt(ans, true)} groups of ${ps[1].text}`}`), fig, key: k, work,
      notes: ['Dividing asks “how many of these fit in that?”. There are 4 quarters in 1, so 1 ÷ ¼ = 4.',
        val(qb) < 1 ? 'Dividing by a number less than 1 gives a larger answer, because many small pieces fit.' : '',
        `Dividing by ${txt(qb)} is the same as multiplying by ${txt([qb[1], qb[0]])}, because ${txt(qb)} × ${txt([qb[1], qb[0]])} = 1.`],
      hook: { answer: txt(ans), mixed: txt(ans, true), value: val(ans), groups: k0, rest: rem ? txt(Q(rem, y)) : '0' },
    };
  }
  function compare(ps) {
    const [A, B] = ps.map(p => asFraction(p)), a = A.r, b = B.r, c = cmp(a, b), sym = c > 0 ? '>' : c < 0 ? '<' : '=';
    const L = lcm(a[1], b[1]), x = a[0] * L / a[1], y = b[0] * L / b[1], diff = Q(Math.abs(x - y), L);
    const work = [];
    const conv = [...A.lines, ...B.lines];
    if (conv.length) work.push(['Write them as fractions', conv]);
    work.push(['With a common denominator', [...(a[1] !== b[1] ? [a, b].filter(q => q[1] !== L).map(q => rewrite(q, L)) : [`Both are in ${pieces(L)} already.`]), `${x} ${sym} ${y}, so ${typed(ps[0])} <b>${sym}</b> ${typed(ps[1])}`]]);
    if (a[1] !== b[1]) work.push(['By cross-multiplying', [`${a[0]} × ${b[1]} = ${a[0] * b[1]} and ${b[0]} × ${a[1]} = ${b[0] * a[1]}`, `${a[0] * b[1]} ${sym} ${b[0] * a[1]}, so ${F(a[0], a[1])} ${sym} ${F(b[0], b[1])}`]]);
    work.push(['As decimals', [`${typed(ps[0])} = ${decimal(Q(a[0], a[1])).html}`, `${typed(ps[1])} = ${decimal(Q(b[0], b[1])).html}`]]);
    const W = Math.max(1, Math.ceil(Math.max(val(a), val(b)) - 1e-9));
    const lab = c ? `${label(ps[0], a)} ${sym} ${label(ps[1], b)}` : `${label(ps[0], a)} and ${label(ps[1], b)} are equal`;
    const useBars = fits(W, Math.max(a[1], b[1]));
    const fig = useBars ? bars([{ label: label(ps[0], a), per: a[1], cls: run([a[0], 'a']) }, { label: label(ps[1], b), per: b[1], cls: run([b[0], 'b']) }], W, lab, val(a))
      : numberLine([{ q: a, label: txt(a, true), cls: 'a' }, { q: b, label: txt(b, true), cls: 'b' }], lab);
    const half = (val(a) - 0.5) * (val(b) - 0.5) < 0, one = (val(a) - 1) * (val(b) - 1) < 0;
    return {
      res: [['Which is greater?', `${typed(ps[0])} ${sym} ${typed(ps[1])}`, c ? `${c > 0 ? 'the first' : 'the second'} is greater` : 'they are equivalent: the same amount'], ...(c ? [['By how much', show(diff, true), 'the difference']] : [])],
      fig, key: '', work,
      notes: [half ? 'A quick check: one of them is more than ½ and the other is less, so no calculation is needed.' : one ? 'A quick check: one of them is more than 1 and the other is less.' : '',
        !c ? 'Equivalent fractions name the same amount with different-size pieces.' : useBars ? 'The dashed line marks where the first bar ends, so you can see which reaches farther.' : '',
        a[1] !== b[1] && a[0] === b[0] && a[0] ? 'With the same numerator, the smaller denominator gives the greater fraction: fewer pieces means each piece is larger.' : ''],
      hook: { cmp: sym, diff: txt(diff) },
    };
  }
  /** three fractions in order, least to greatest, on one common denominator */
  function compare3(ps) {
    const F3 = ps.map(p => asFraction(p)), rs = F3.map(x => x.r);
    const L = rs.reduce((l, q) => lcm(l, q[1]), 1), nums = rs.map(q => q[0] * L / q[1]);
    const order = [0, 1, 2].sort((i, j) => nums[i] - nums[j] || i - j);
    const rel = k => (nums[order[k]] === nums[order[k + 1]] ? '=' : '<');
    const chain = order.map((k, i) => typed(ps[k]) + (i < 2 ? ` ${rel(i)} ` : '')).join('');
    const work = [];
    const conv = F3.flatMap(x => x.lines);
    if (conv.length) work.push(['Write them as fractions', conv]);
    const need = rs.filter(q => q[1] !== L);
    work.push(['With a common denominator', [
      `The least common denominator of ${[...new Set(rs.map(q => q[1]))].join(', ')} is <b>${L}</b>.`,
      ...(need.length ? need.map(q => rewrite(q, L)) : [`All three are in ${pieces(L)} already.`]),
      `${order.map((k, i) => nums[k] + (i < 2 ? ` ${rel(i)} ` : '')).join('')}, so <b>${chain}</b>`]]);
    work.push(['As decimals', ps.map((p, i) => `${typed(p)} = ${decimal(Q(rs[i][0], rs[i][1])).html}`)]);
    const W = Math.max(1, Math.ceil(Math.max(...rs.map(val)) - 1e-9)), cls = ['a', 'b', 'c3'];
    const lab = `From least to greatest: ${order.map(k => label(ps[k], rs[k])).join(', ')}`;
    const fig = fits(W, Math.max(...rs.map(q => q[1])))
      ? bars(ps.map((p, i) => ({ label: label(p, rs[i]), per: rs[i][1], cls: run([rs[i][0], cls[i]]) })), W, lab)
      : numberLine(ps.map((p, i) => ({ q: rs[i], label: txt(rs[i], true), cls: cls[i] })), lab);
    const sameAll = nums[order[0]] === nums[order[2]];
    return {
      res: [['From least to greatest', chain, sameAll ? 'all three are the same amount' : `on a common denominator of ${L}`],
        ...(sameAll ? [] : [['Greatest', typed(ps[order[2]]), ''], ['Least', typed(ps[order[0]]), '']])],
      fig, key: '', work,
      notes: ['To put fractions in order, write them with the same denominator: then the numerators are in the same order.',
        'Benchmarks help too: compare each one to ½ and to 1 before working anything out.'],
      hook: { least: txt(rs[order[0]]), greatest: txt(rs[order[2]]), chain: order.map((k, i) => txt(rs[k]) + (i < 2 ? ` ${rel(i)} ` : '')).join(''), lcd: L },
    };
  }
  function simplify([p]) {
    const A = asFraction(p), r = A.r, q = Q(r[0], r[1]), g = gcd(r[0], r[1]);
    const work = [];
    if (A.lines.length) work.push(['Write it as a fraction', A.lines]);
    if (r[0] && r[1] > 1) {
      work.push(['Find the greatest common factor', [...(r[0] <= 120 && r[1] <= 120 ? [`Factors of ${r[0]}: ${factors(r[0]).join(', ')}`, `Factors of ${r[1]}: ${factors(r[1]).join(', ')}`] : []), `The greatest common factor of ${r[0]} and ${r[1]} is <b>${g}</b>.`]]);
      work.push(g > 1 ? ['Divide the top and the bottom by it', [`${F(r[0], r[1])} = ${F(`${r[0]} ÷ ${g}`, `${r[1]} ÷ ${g}`)} = <b>${show(q)}</b>`]] : ['Already simplest', [`${r[0]} and ${r[1]} share no factor except 1, so ${F(r[0], r[1])} is already in simplest form.`]]);
    }
    const mx = mixedLines(q);
    if (mx) work.push(['As a mixed number', mx]);
    const dc = decimal(q);
    if (q[1] > 1) work.push(['As a decimal and a percent', [`${show(q)} = ${q[0]} ÷ ${q[1]} = ${dc.html}`, `× 100 → ${percent(q)}`]]);
    if (q[0]) work.push(['Equivalent fractions', [[1, 2, 3, 4, 5, 6].map(k => F(q[0] * k, q[1] * k)).join(' = ')]]);
    const W = Math.max(1, Math.ceil(val(q) - 1e-9)), other = g > 1 ? q : [q[0] * 2, q[1] * 2];
    const lab = `${label(p, r)} = ${txt(q, true)}`;
    let fig = '';
    if (r[0] && fits(W, Math.max(r[1], other[1])) && r[1] > 1) fig = bars([{ label: `${label(p, r)}${p.kind === 'mixed' ? ` = ${r[0]}/${r[1]}` : ''}`, per: r[1], cls: run([r[0], 'a']) },
      { label: `${txt(other)}: ${g > 1 ? 'the same amount in larger pieces' : 'the same amount in pieces half the size'}`, per: other[1], cls: run([other[0], 'b']) }], W, lab, val(q));
    return {
      res: [['Simplest form', show(q), g > 1 ? `divided top and bottom by ${g}` : r[1] > 1 && r[0] ? 'already in simplest form' : ''], ...(Math.abs(q[0]) > q[1] && q[1] > 1 ? [['As a mixed number', show(q, true), '']] : []),
        ...(q[1] > 1 ? [['As a decimal', dc.html, dc.repeats ? 'the digits under the line repeat' : ''], ['As a percent', percent(q), '']] : [])],
      fig, key: '', work,
      notes: ['A fraction is in simplest form when the top and the bottom share no factor except 1.', 'Simplifying doesn’t change the amount, only the size of the pieces: the two bars end in the same place.'],
      hook: { answer: txt(q), mixed: txt(q, true), gcf: g, decimal: val(q) },
    };
  }

  const OPS = {
    add: { name: 'Add', title: 'Add fractions', sym: '+', n: 2, def: ['3/4', '5/6'], calc: ps => addSub(ps, false) },
    sub: { name: 'Subtract', title: 'Subtract fractions', sym: '−', n: 2, def: ['2 1/3', '3/4'], calc: ps => addSub(ps, true) },
    mul: { name: 'Multiply', title: 'Multiply fractions', sym: '×', n: 2, def: ['2/3', '3/4'], calc: times },
    div: { name: 'Divide', title: 'Divide fractions', sym: '÷', n: 2, def: ['2 1/2', '3/4'], calc: divide },
    compare: { name: 'Compare', title: 'Which is greater?', sym: 'or', n: 2, extra: true, def: ['5/8', '3/5'], calc: ps => (ps.length === 3 ? compare3(ps) : compare(ps)) },
    simplify: { name: 'Simplify', title: 'Simplify a fraction', sym: '', n: 1, def: ['18/24', '5/6'], calc: simplify },
  };
  const GROUPS = [['Operations', ['add', 'sub', 'mul', 'div']], ['Understand a fraction', ['compare', 'simplify']]];
  const ERR = {
    empty: (i, n) => `Enter ${n === 1 ? 'a fraction' : i ? 'the second number' : 'the first number'}, such as 3/4 or 1 1/2.`,
    bad: (i, n, s) => `“${s}” isn’t a number Procademy can read. Use a form such as 3/4, 1 1/2, 2 or 0.75.`,
    zero: () => 'A fraction can’t have 0 on the bottom: a whole can’t be cut into 0 pieces.',
    negative: () => 'Use numbers that are 0 or greater here. For negative numbers, find the size first, then apply the sign rules.',
    big: () => 'Use numbers up to 1,000.',
    places: () => 'Use up to 6 decimal places.',
  };

  /** work out a question from what was typed (for the page and the tests) */
  function solve(op, ins) {
    const O = OPS[op];
    if (!O) return { error: 'This question type doesn’t exist.' };
    const ps = [];
    for (let i = 0; i < O.n; i++) {
      const p = parse(ins[i]);
      if (p.error) return { error: ERR[p.error](i, O.n, String(ins[i]).trim()), field: i };
      ps.push(p);
    }
    if (op === 'div' && !ps[1].q[0]) return { error: `You can’t divide by 0: no number of empty groups makes ${ps[0].text}.`, field: 1 };
    if (O.extra && ins[2] != null && String(ins[2]).trim()) {                // compare takes a third number, if one is typed
      const p = parse(ins[2]);
      if (p.error) return { error: ERR[p.error](2, 3, String(ins[2]).trim()).replace('the second number', 'the third number'), field: 2 };
      ps.push(p);
    }
    return O.calc(ps);
  }

  /** a friendly question to try */
  function another(op) {
    const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), pick = xs => xs[R(0, xs.length - 1)];
    const proper = (ds) => { const d = pick(ds || [2, 3, 4, 5, 6, 8, 10, 12]); let n; do n = R(1, d - 1); while (gcd(n, d) > 1); return `${n}/${d}`; };
    const mixed = () => { const d = pick([2, 3, 4, 5, 6, 8]); let n; do n = R(1, d - 1); while (gcd(n, d) > 1); return `${R(1, 3)} ${n}/${d}`; };
    const v = s => val(parse(s).q), dn = s => parse(s).q[1];
    for (let tries = 0; tries < 200; tries++) {
      let a, b;
      if (op === 'add' || op === 'sub') { a = Math.random() < 0.35 ? mixed() : proper(); b = proper(); if (lcm(dn(a), dn(b)) > 24 || dn(a) === dn(b) && Math.random() < 0.7) continue; if (op === 'sub' && v(a) < v(b)) [a, b] = [b, a]; }
      else if (op === 'mul') { if (Math.random() < 0.6) { a = proper([2, 3, 4, 5, 6, 8]); b = proper([2, 3, 4, 5, 6]); if (dn(a) * dn(b) > 48) continue; } else { a = mixed(); b = Math.random() < 0.5 ? mixed() : proper([2, 3, 4]); } }
      else if (op === 'div') { b = pick(['1/2', '1/3', '1/4', '2/3', '3/4', '1/6', '3/8', '2/5', '1/8']); a = Math.random() < 0.5 ? mixed() : String(R(1, 4)); const q = v(a) / v(b); if (q > 12 || lcm(dn(a), dn(b)) > 24) continue; }
      else if (op === 'compare') { a = proper([3, 4, 5, 6, 7, 8, 9, 10, 12]); b = proper([3, 4, 5, 6, 7, 8, 9, 10, 12]); if (dn(a) === dn(b) || Math.abs(v(a) - v(b)) > 0.25) continue; }
      else { const d = pick([2, 3, 4, 5, 6, 8, 10]); let n; do n = R(1, d + 3); while (gcd(n, d) > 1); const k = R(2, 6); a = `${n * k}/${d * k}`; b = ''; }
      return [a, b];
    }
    return OPS[op].def.slice();
  }

  function page(root, op, code) {
    let o = OPS[op] ? op : 'add';
    const mem = V.tools && V.tools.pref ? V.tools.pref('fractions') : {};
    if (!OPS[op] && !code && OPS[mem.op]) o = mem.op;                // opens as it was left
    const ins = OPS[o].def.slice().concat(['']);
    if (code) String(code).split('_').slice(0, 3).forEach((c, i) => { if (c) ins[i] = decode(c); });
    else if (!OPS[op] && Array.isArray(mem.ins) && mem.op === o) mem.ins.slice(0, 3).forEach((c, i) => { if (typeof c === 'string' && (c.trim() || i === 2)) ins[i] = c.slice(0, 20); });
    if (!ins[1]) ins[1] = OPS.add.def[1];
    root.innerHTML = `<div class="sh-page fr-page">
      <div class="card">
        <h1>Fraction lab</h1>
        <p class="muted small" style="margin:4px 0 10px">Add, subtract, multiply, divide, compare and simplify fractions and mixed numbers. Each one is drawn, so you can see why the steps work.</p>
        ${V.tools && V.tools.how ? V.tools.how('fractions') : ''}
        <div class="sh-kinds">${GROUPS.map(([g, keys]) => `<div class="sh-group"><span class="tiny muted">${g}</span><div class="sh-chips">${keys.map(x => `<button type="button" class="chip-btn${x === o ? ' on' : ''}" data-op="${x}" aria-pressed="${x === o}">${OPS[x].name}</button>`).join('')}</div></div>`).join('')}</div>
      </div>
      <div class="card">
        <h2 id="fr-title" style="margin:0 0 8px"></h2>
        <div class="fr-eq">
          <div class="sh-field"><label class="small" for="fr-a" id="fr-la">First number</label><input id="fr-a" type="text" autocomplete="off" spellcheck="false" data-i="0"><span class="fr-read tiny muted" id="fr-ra" aria-live="polite"></span></div>
          <span class="fr-op" id="fr-op" aria-hidden="true"></span>
          <div class="sh-field" id="fr-fb"><label class="small" for="fr-b">Second number</label><input id="fr-b" type="text" autocomplete="off" spellcheck="false" data-i="1"><span class="fr-read tiny muted" id="fr-rb" aria-live="polite"></span></div>
          <span class="fr-op" id="fr-op3" aria-hidden="true" hidden>or</span>
          <div class="sh-field" id="fr-fc" hidden><label class="small" for="fr-c">Third (if you like)</label><input id="fr-c" type="text" autocomplete="off" spellcheck="false" data-i="2" placeholder="2/3"><span class="fr-read tiny muted" id="fr-rc" aria-live="polite"></span></div>
          <div class="fr-tools"><button type="button" class="btn sm ghost" id="fr-swap">Swap the numbers</button><button type="button" class="btn sm ghost" id="fr-new">Another problem</button></div>
        </div>
        <p class="tiny muted" style="margin:2px 0 0">Enter fractions such as 3/4, mixed numbers such as 1 1/2, whole numbers, or decimals such as 0.75.</p>
        <div id="fr-fig" class="fr-fig"></div>
      </div>
      <div id="fr-out" class="sh-out"></div>
    </div>`;
    const wrap = root.querySelector('.fr-page'), fig = root.querySelector('#fr-fig'), out = root.querySelector('#fr-out');
    const inA = root.querySelector('#fr-a'), inB = root.querySelector('#fr-b'), inC = root.querySelector('#fr-c'), reads = [root.querySelector('#fr-ra'), root.querySelector('#fr-rb'), root.querySelector('#fr-rc')];
    let touched = false;
    function setOp() {
      const O = OPS[o];
      root.querySelector('#fr-title').textContent = O.title;
      root.querySelector('#fr-op').textContent = O.sym;
      root.querySelector('#fr-la').textContent = O.n === 1 ? 'Fraction' : 'First number';
      root.querySelector('#fr-fb').hidden = O.n === 1;
      root.querySelector('#fr-op').hidden = O.n === 1;
      root.querySelector('#fr-swap').hidden = O.n === 1;
      root.querySelector('#fr-fc').hidden = root.querySelector('#fr-op3').hidden = !O.extra;
      wrap.querySelectorAll('[data-op]').forEach(x => { x.classList.toggle('on', x.dataset.op === o); x.setAttribute('aria-pressed', String(x.dataset.op === o)); });
    }
    function render() {
      const O = OPS[o], use = O.extra ? ins : ins.slice(0, 2), r = solve(o, use), third = O.extra && String(ins[2] || '').trim();
      [inA, inB, inC].forEach((el, i) => el.setAttribute('aria-invalid', String(!!r.error && r.field === i)));
      reads.forEach((el, i) => { const p = parse(ins[i]); el.innerHTML = p.error || p.kind === 'whole' || p.kind === 'dec' ? '' : `reads as ${typed(p)}`; });
      root.__fractions = Object.assign({ op: o, a: ins[0], b: O.n === 1 ? null : ins[1], c: third || null }, r.error ? { error: r.error } : r.hook);
      if (V.tools && V.tools.pref) V.tools.pref('fractions', { op: o, ins: ins.slice(0, 3) });
      if (r.error) { fig.innerHTML = ''; out.innerHTML = `<div class="card"><p class="cx-err loud" style="margin:0">${esc(r.error)}</p></div>`; return; }
      fig.innerHTML = r.fig + (r.fig ? r.key : '');
      const notes = r.notes.filter(Boolean);
      out.innerHTML = `<div class="card"><div class="sh-res">${r.res.map(([l, v, s]) => `<div class="sh-tile"><span class="tiny muted">${l}</span><b>${v}</b>${s ? `<span class="tiny muted">${s}</span>` : ''}</div>`).join('')}</div></div>
        <div class="card"><h2>How it is found</h2>${r.work.map(([t, lines]) => `<div class="sh-work"><h3>${t}</h3><div class="sh-lines">${lines.map(x => `<div>${x}</div>`).join('')}</div></div>`).join('')}</div>
        ${notes.length ? `<div class="card"><h2>Key facts</h2><ul class="nm-facts">${notes.map(t => `<li>${t}</li>`).join('')}</ul></div>` : ''}`;
      const codes = ins.slice(0, O.n).concat(third ? [ins[2]] : []).map(s => parse(s).code);
      history.replaceState(null, '', `#/fractions/${o}/${codes.join('_')}`);
      H.tutorCtx({ notes: `The student is on the fraction lab (${O.title}): ${O.n === 1 ? ins[0] : `${ins[0]} ${O.sym} ${ins[1]}${third ? ` ${O.sym} ${ins[2]}` : ''}`}. ${r.res.map(([l, v, s]) => `${l}: ${H.plain(v)}${s ? ` (${H.plain(s)})` : ''}`).join('; ')}.` });
      if (touched && window.BADGES) BADGES.flag('fractions');
    }
    function fill() { inA.value = ins[0]; inB.value = ins[1]; inC.value = ins[2] || ''; }
    let t = null;
    wrap.addEventListener('input', ev => {
      const el = ev.target;
      if (el !== inA && el !== inB && el !== inC) return;
      touched = true;
      ins[Number(el.dataset.i)] = el.value;
      clearTimeout(t); t = setTimeout(render, 150);
    });
    wrap.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b || !wrap.contains(b)) return;
      if (b.dataset.op && b.dataset.op !== o) {
        o = b.dataset.op;
        if (o === 'div' && !(parse(ins[1]).q || [0])[0]) ins[1] = OPS.div.def[1];
        setOp(); render();
      } else if (b.id === 'fr-swap') { [ins[0], ins[1]] = [ins[1], ins[0]]; fill(); touched = true; render(); }
      else if (b.id === 'fr-new') { const [x, y] = another(o); ins[0] = x; if (y) ins[1] = y; fill(); touched = true; render(); }
    });
    fill(); setOp(); render();
  }

  const FRACTIONS = { page, solve, parse, OPS, another };
  window.FRACTIONS = FRACTIONS;
})();
