/* The number explorer (#/numbers, #/numbers/84, #/numbers/12-18). One whole number shows whether it is
   prime, its prime factorization, a factor tree ("Another tree" starts from a different factor pair and
   still ends in the same primes), every factor pair, and the divisibility rules it passes. Two or three
   numbers show their greatest common factor and least common multiple three ways, as CPM does: listing
   factors and multiples, a Venn diagram of the prime factors, and the prime factorizations; then what
   they are for (simplifying a fraction, factoring out the GCF, a common denominator).
   Whole numbers from 1 to 10¹²; trial division up to a million is quick enough. */
'use strict';
(function () {
  const V = window.VIEWS, H = V._h, esc = H.esc;
  const MAX = 1e12;
  const nf = n => n.toLocaleString('en-US');

  /** [[prime, power], …], smallest prime first; 1 gives [] */
  function factorize(n) {
    const out = [];
    let m = n;
    const take = p => { let e = 0; while (m % p === 0) { m /= p; e++; } if (e) out.push([p, e]); };
    take(2); take(3);
    for (let p = 5; p * p <= m; p += 6) { take(p); take(p + 2); }
    if (m > 1) out.push([m, 1]);
    return out;
  }
  const isPrime = n => { if (n < 2) return false; const f = factorize(n); return f.length === 1 && f[0][1] === 1; };
  function pairs(n) { const out = []; for (let i = 1; i * i <= n; i++) if (n % i === 0) out.push([i, n / i]); return out; }
  const countFactors = f => f.reduce((a, [, e]) => a * (e + 1), 1);
  const sigma = f => f.reduce((a, [p, e]) => a * (Math.pow(p, e + 1) - 1) / (p - 1), 1);
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const lcm = (a, b) => a / gcd(a, b) * b;
  /** 2<sup>2</sup> × 3 × 7 */
  const powers = (f, html) => (f.length ? f.map(([p, e]) => (e > 1 ? (html ? `${nf(p)}<sup>${e}</sup>` : `${nf(p)}^${e}`) : nf(p))).join(' × ') : '1');
  const longhand = f => f.flatMap(([p, e]) => Array(e).fill(nf(p))).join(' × ') || '1';

  /** read "12, 18" or "84" or "12-18": whole numbers; a group like 1,000 is one number */
  function read(text) {
    const toks = String(text || '').replace(/\band\b/gi, ' ').split(/[^\d,]+/).filter(Boolean);
    const out = [];
    for (const t of toks) {
      if (/^\d{1,3}(,\d{3})+$/.test(t)) out.push(Number(t.replace(/,/g, '')));
      else t.split(',').filter(Boolean).forEach(x => out.push(Number(x)));
    }
    return out;
  }

  // ---- a factor tree
  function closest(n) { for (let i = Math.floor(Math.sqrt(n)); i >= 2; i--) if (n % i === 0) return [i, n / i]; return null; }
  function grow(n, split) {
    const sp = split || (isPrime(n) ? null : closest(n));
    return sp ? { n, kids: [grow(sp[0]), grow(sp[1])] } : { n };
  }
  function treeSvg(root) {
    const leaves = [], nodes = [];
    let depth = 0;
    (function walk(t, d) { t.d = d; depth = Math.max(depth, d); if (t.kids) t.kids.forEach(k => walk(k, d + 1)); else leaves.push(t); nodes.push(t); })(root, 0);
    const w = Math.max(...nodes.map(t => nf(t.n).length)) * 9 + 22, gap = Math.max(46, w);
    leaves.forEach((t, i) => { t.x = gap / 2 + 6 + i * gap; });
    (function place(t) { if (t.kids) { t.kids.forEach(place); t.x = (t.kids[0].x + t.kids[1].x) / 2; } })(root);
    const W = leaves.length * gap + 12, Hh = (depth + 1) * 64 + 8, Y = d => 28 + d * 64;
    const lines = nodes.filter(t => t.kids).flatMap(t => t.kids.map(k => `<line x1="${t.x}" y1="${Y(t.d) + 12}" x2="${k.x}" y2="${Y(k.d) - 18}" class="nm-branch"/>`)).join('');
    const marks = nodes.map(t => `${t.kids ? '' : `<rect x="${t.x - (nf(t.n).length * 9 + 18) / 2}" y="${Y(t.d) - 17}" width="${nf(t.n).length * 9 + 18}" height="34" rx="17" class="nm-prime"/>`}<text x="${t.x}" y="${Y(t.d) + 5}" text-anchor="middle" class="nm-num${t.kids ? '' : ' p'}">${nf(t.n)}</text>`).join('');
    return { svg: `<svg class="nm-tree" width="${W}" height="${Hh}" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="A factor tree for ${nf(root.n)}, ending in the primes ${leaves.map(t => nf(t.n)).join(', ')}">${lines}${marks}</svg>`, leaves: leaves.map(t => t.n) };
  }

  // ---- divisibility rules
  function rules(n) {
    const s = String(n), last = Number(s.slice(-1)), sum = [...s].reduce((a, c) => a + Number(c), 0);
    const two = Number(s.slice(-2)), three = Number(s.slice(-3));
    const sumTxt = s.length > 1 ? `${[...s].join(' + ')} = ${sum}` : String(sum);
    return [
      [2, n % 2 === 0, `the last digit, ${last}, is ${last % 2 ? 'odd' : 'even'}`],
      [3, n % 3 === 0, `the digits add to ${sumTxt}, which ${sum % 3 ? 'isn’t' : 'is'} a multiple of 3`],
      [4, n % 4 === 0, s.length > 1 ? `the last two digits make ${two}, which ${two % 4 ? 'isn’t' : 'is'} a multiple of 4` : `${n} ${n % 4 ? 'isn’t' : 'is'} a multiple of 4`],
      [5, n % 5 === 0, `the last digit is ${last}${n % 5 ? ', not 0 or 5' : ''}`],
      [6, n % 6 === 0, `${n % 6 === 0 ? 'it passes' : 'it needs to pass'} the rules for both 2 and 3`],
      [8, n % 8 === 0, s.length > 2 ? `the last three digits make ${three}, which ${three % 8 ? 'isn’t' : 'is'} a multiple of 8` : `${n} ${n % 8 ? 'isn’t' : 'is'} a multiple of 8`],
      [9, n % 9 === 0, `the digits add to ${sum}, which ${sum % 9 ? 'isn’t' : 'is'} a multiple of 9`],
      [10, n % 10 === 0, `the last digit is ${last}${n % 10 ? ', not 0' : ''}`],
    ];
  }

  // ---- the cards
  function one(n, alt) {
    const f = factorize(n), k = countFactors(f), prs = pairs(n), prime = n > 1 && k === 2;
    const r = Math.round(Math.sqrt(n)), c = Math.round(Math.cbrt(n)), s = sigma(f) - n;
    const facts = [
      n === 1 ? '<b>1</b> is neither prime nor composite: it has only one factor.' : prime ? `<b>${nf(n)} is prime</b>: its only factors are 1 and ${nf(n)}.` : `<b>${nf(n)} is composite</b>: it has ${nf(k)} factors.`,
      `It is <b>${n % 2 ? 'odd' : 'even'}</b>.`,
      r * r === n ? `It is a <b>perfect square</b>: ${nf(r)} × ${nf(r)} = ${nf(n)}, so √${nf(n)} = ${nf(r)}.` : `It isn’t a perfect square: √${nf(n)} is between ${nf(Math.floor(Math.sqrt(n)))} and ${nf(Math.floor(Math.sqrt(n)) + 1)} (about ${Math.sqrt(n).toFixed(2)}).`,
      c * c * c === n && n > 1 ? `It is a <b>perfect cube</b>: ${nf(c)} × ${nf(c)} × ${nf(c)} = ${nf(n)}.` : '',
      n > 1 && s === n ? `It is a <b>perfect number</b>: its other factors add up to it.` : '',
    ].filter(Boolean);
    let tree = null;
    const splits = prs.filter(([a]) => a > 1);
    if (!prime && n > 1 && f.reduce((a, [, e]) => a + e, 0) <= 24) tree = treeSvg(grow(n, splits.length ? splits[splits.length - 1 - ((alt || 0) % splits.length)] : null));
    const shown = prs.slice(0, 60);
    return { prime, f, tree, html: `
      <div class="card"><h2>${nf(n)}</h2><ul class="nm-facts">${facts.map(t => `<li>${t}</li>`).join('')}</ul>
        ${n > 1 ? `<div class="nm-pf"><span class="tiny muted">Prime factorization</span><div class="nm-big">${nf(n)} = ${prime ? nf(n) : powers(f, true)}</div>${f.some(([, e]) => e > 1) ? `<div class="small muted">${longhand(f)}</div>` : ''}</div>` : ''}
      </div>
      ${tree ? `<div class="card"><div class="row between" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">Factor tree</h2>${splits.length > 1 ? `<button type="button" class="btn sm" id="nm-alt">Show another tree</button>` : ''}</div>
        <p class="small muted" style="margin:6px 0 0">Split ${nf(n)} into two factors, then keep splitting until every branch ends in a prime (circled).${splits.length > 1 ? ' Starting with a different pair changes the tree, but the primes at the ends are always the same.' : ''}</p>
        <div class="nm-scroll">${tree.svg}</div>
        <p class="small" style="margin:6px 0 0">The circled primes: ${[...tree.leaves].sort((a, b) => a - b).map(nf).join(' × ')} = ${nf(n)}</p></div>` : ''}
      <div class="card"><h2>Factor pairs</h2><p class="small muted" style="margin:0 0 8px">Every way to make ${nf(n)} by multiplying two whole numbers${n <= 100000 ? ', such as the sides of a rectangle with that area' : ''}.</p>
        <div class="nm-pairs">${shown.map(([a, b]) => `<span class="nm-pair">${nf(a)} × ${nf(b)}</span>`).join('')}${prs.length > shown.length ? `<span class="small muted">and ${nf(prs.length - shown.length)} more</span>` : ''}</div>
        <p class="small" style="margin:10px 0 0"><b>All ${nf(k)} factors:</b> ${k <= 120 ? [...prs.map(p => p[0]), ...prs.map(p => p[1]).reverse()].filter((x, i, a) => a.indexOf(x) === i).map(nf).join(', ') : 'too many to list here'}</p></div>
      <div class="card"><h2>Divisibility rules</h2><ul class="nm-rules">${rules(n).map(([d, ok, why]) => `<li class="${ok ? 'yes' : 'no'}"><span class="nm-mark" aria-hidden="true">${ok ? '✓' : '✗'}</span> <b>${ok ? 'Divisible' : 'Not divisible'} by ${d}</b>: ${why}.</li>`).join('')}</ul></div>` };
  }

  function venn(a, b, fa, fb) {
    const ex = (f, p) => (f.find(x => x[0] === p) || [0, 0])[1];
    const primes = [...new Set([...fa, ...fb].map(x => x[0]))].sort((x, y) => x - y);
    const L = [], M = [], R = [];
    primes.forEach(p => { const ea = ex(fa, p), eb = ex(fb, p), m = Math.min(ea, eb); for (let i = 0; i < m; i++) M.push(p); for (let i = m; i < ea; i++) L.push(p); for (let i = m; i < eb; i++) R.push(p); });
    const region = (list, cx) => {
      const rows = [];
      for (let i = 0; i < list.length; i += 3) rows.push(list.slice(i, i + 3).map(nf).join('  '));
      if (rows.length > 5) { rows.length = 5; rows[4] = '…'; }
      return rows.map((t, i) => `<text x="${cx}" y="${112 - (rows.length - 1) * 9 + i * 18}" text-anchor="middle" class="nm-num">${t}</text>`).join('');
    };
    return { L, M, R, svg: `<svg class="nm-venn" viewBox="0 0 340 210" role="img" aria-label="A Venn diagram: only in ${nf(a)}: ${L.join(', ') || 'none'}; in both: ${M.join(', ') || 'none'}; only in ${nf(b)}: ${R.join(', ') || 'none'}">
      <circle cx="128" cy="110" r="88" class="nm-c a"/><circle cx="212" cy="110" r="88" class="nm-c b"/>
      <text x="92" y="16" text-anchor="middle" class="nm-label">${nf(a)}</text><text x="248" y="16" text-anchor="middle" class="nm-label">${nf(b)}</text>
      ${region(L, 82)}${region(M, 170)}${region(R, 258)}</svg>` };
  }

  function many(ns) {
    const fs = ns.map(factorize), G = ns.reduce(gcd), Lm = ns.reduce(lcm);
    const primes = [...new Set(fs.flatMap(f => f.map(x => x[0])))].sort((x, y) => x - y);
    const ex = (f, p) => (f.find(x => x[0] === p) || [0, 0])[1];
    const gf = primes.map(p => [p, Math.min(...fs.map(f => ex(f, p)))]).filter(x => x[1]);
    const lf = primes.map(p => [p, Math.max(...fs.map(f => ex(f, p)))]);
    const list = ns.join(', ').replace(/, (?=[^,]*$)/, ' and ');
    const small = ns.every(n => n <= 10000 && countFactors(factorize(n)) <= 40);
    let listing = '';
    if (small) {
      const facs = ns.map(n => { const p = pairs(n); return [...p.map(x => x[0]), ...p.map(x => x[1]).reverse()].filter((x, i, a) => a.indexOf(x) === i); });
      const common = facs[0].filter(x => facs.every(f => f.includes(x)));
      listing += `<h3>Listing factors</h3>${ns.map((n, i) => `<div class="nm-list"><span class="small muted">Factors of ${nf(n)}:</span> ${facs[i].map(x => `<span class="nm-chip${common.includes(x) ? ' both' : ''}${x === G ? ' best' : ''}">${nf(x)}</span>`).join('')}</div>`).join('')}
        <p class="small" style="margin:6px 0 0">Common factors: ${common.map(nf).join(', ')}. The greatest is <b>${nf(G)}</b>.</p>`;
      if (Lm / Math.min(...ns) <= 15) {
        listing += `${ns.map(n => `<div class="nm-list"><span class="small muted">Multiples of ${nf(n)}:</span> ${Array.from({ length: Lm / n }, (_, i) => (i + 1) * n).map(x => `<span class="nm-chip${x === Lm ? ' best' : ''}">${nf(x)}</span>`).join('')}</div>`).join('')}
          <p class="small" style="margin:6px 0 0">The first multiple they share is <b>${nf(Lm)}</b>.</p>`;
      }
    }
    const v = ns.length === 2 ? venn(ns[0], ns[1], fs[0], fs[1]) : null;
    const [a, b] = ns;
    const uses = ns.length === 2 ? [
      G > 1 ? `<b>Simplify a fraction:</b> ${nf(a)}/${nf(b)} = ${nf(a / G)}/${nf(b / G)} (divide the top and the bottom by ${nf(G)}).` : `<b>Fractions:</b> ${nf(a)}/${nf(b)} is already in simplest form, because the GCF is 1.`,
      G > 1 ? `<b>Factor out the GCF:</b> ${nf(a)} + ${nf(b)} = ${nf(G)}(${nf(a / G)} + ${nf(b / G)}).` : '',
      `<b>A common denominator:</b> to add 1/${nf(a)} + 1/${nf(b)}, use ${nf(Lm)}: ${nf(Lm / a)}/${nf(Lm)} + ${nf(Lm / b)}/${nf(Lm)}.`,
    ].filter(Boolean) : [];
    return { G, Lm, html: `
      <div class="card"><h2>${list}</h2>
        <div class="nm-two"><div class="nm-res"><span class="tiny muted">Greatest common factor (GCF)</span><b>${nf(G)}</b></div><div class="nm-res"><span class="tiny muted">Least common multiple (LCM)</span><b>${nf(Lm)}</b></div></div>
        ${G === 1 ? `<p class="small muted" style="margin:8px 0 0">The only factor they share is 1, so they are <b>relatively prime</b>.</p>` : ''}</div>
      ${v ? `<div class="card"><h2>Venn diagram of the prime factors</h2><div class="nm-scroll center">${v.svg}</div>
        <p class="small" style="margin:6px 0 0"><b>GCF</b> = the primes in the middle: ${v.M.length ? v.M.map(nf).join(' × ') + ' = ' + nf(G) : 'none, so the GCF is 1'}.<br><b>LCM</b> = every prime in the picture: ${[...v.L, ...v.M, ...v.R].sort((x, y) => x - y).map(nf).join(' × ') || '1'} = ${nf(Lm)}.</p></div>` : ''}
      <div class="card"><h2>With prime factorizations</h2><ul class="nm-facts">${ns.map((n, i) => `<li>${nf(n)} = ${n === 1 ? '1' : powers(fs[i], true)}</li>`).join('')}</ul>
        <p class="small" style="margin:6px 0 0"><b>GCF:</b> the primes every number has, each to its smallest power: ${gf.length ? powers(gf, true) + ' = ' : ''}${nf(G)}.<br><b>LCM:</b> every prime any number has, each to its greatest power: ${powers(lf.filter(x => x[1]), true)} = ${nf(Lm)}.</p></div>
      ${listing ? `<div class="card">${listing}</div>` : ''}
      ${uses.length ? `<div class="card"><h2>How they are used</h2><ul class="nm-facts">${uses.map(u => `<li>${u}</li>`).join('')}</ul></div>` : ''}` };
  }

  /* ---------- scientific notation, exactly: a number is digits × 10^e (whole-number digits, no rounding) ---------- */
  const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  const sup = n => String(n).split('').map(c => SUP[c]).join('');
  /** "4.52 × 10^-4", "4.52e-4", "0.000452" or "93,000,000" → { neg, d (BigInt), e } or null */
  function sciRead(t) {
    t = String(t || '').replace(/[−–]/g, '-').replace(/[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, m => '^' + m.split('').map(c => Object.keys(SUP).find(k => SUP[k] === c)).join('')).replace(/\s+/g, '').replace(/,/g, '');
    const m = /^(-?)(\d*\.?\d*)(?:(?:[x×*]10\^?\(?([-+]?\d+)\)?)|(?:e([-+]?\d+)))?$/i.exec(t);
    if (!m || !/\d/.test(m[2])) return null;
    const [w, f = ''] = m[2].split('.'), ex = Number(m[3] || m[4] || 0);
    if (Math.abs(ex) > 300) return null;
    let d = BigInt((w || '0') + f), e = ex - f.length;
    if (d === 0n) return { neg: false, d: 0n, e: 0 };
    while (d % 10n === 0n) { d /= 10n; e++; }
    return { neg: m[1] === '-', d, e };
  }
  /** the parts of scientific notation: coefficient text (one digit before the point) and the power */
  function sciParts(x) {
    if (x.d === 0n) return { c: '0', p: 0 };
    const s = x.d.toString(), p = x.e + s.length - 1;
    return { c: (x.neg ? '−' : '') + s[0] + (s.length > 1 ? '.' + s.slice(1) : ''), p };
  }
  /** the ordinary decimal, with commas: 0.000452 or 93,000,000 */
  function sciPlain(x) {
    if (x.d === 0n) return '0';
    let s = x.d.toString(), out;
    if (x.e >= 0) out = (s + '0'.repeat(x.e)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    else { const k = -x.e; s = s.padStart(k + 1, '0'); const w = s.slice(0, s.length - k), f = s.slice(s.length - k); out = w.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + f; }
    return (x.neg ? '−' : '') + out;
  }
  const sciHtml = x => { const q = sciParts(x); return `${q.c} × 10<sup>${String(q.p).replace('-', '−')}</sup>`; };
  /** how to go from one form to the other, in words */
  function sciSteps(x, fromSci) {
    const q = sciParts(x), n = Math.abs(q.p), pl = n === 1 ? 'place' : 'places';
    if (x.d === 0n) return ['Zero is written 0 in either form.'];
    if (fromSci) return q.p === 0 ? ['10⁰ is 1, so the number is just the coefficient.'] : [`10${sup(q.p)} means move the decimal point ${n} ${pl} to the ${q.p > 0 ? 'right' : 'left'}${q.p > 0 ? ' (multiply by 10 that many times)' : ' (divide by 10 that many times)'}, filling empty places with zeros.`, `${q.c} becomes ${sciPlain(x)}.`];
    return [`Move the decimal point until there is one digit, not 0, in front of it: ${q.c.replace('−', '')}${q.c.includes('.') ? '' : ''}.`, q.p === 0 ? 'It didn’t move, so the power is 10⁰.' : `It moved ${n} ${pl} to the ${q.p > 0 ? 'left, so the power is positive' : 'right, so the power is negative'}: 10${sup(q.p)}.`, `${sciPlain(x)} = ${q.c} × 10${sup(q.p)}.`];
  }
  /** a × b or a ÷ b, exactly for ×, to 12 digits for ÷ */
  function sciOp(a, b, op) {
    const neg = a.neg !== b.neg;
    if (op === '×') return { r: { neg, d: a.d * b.d, e: a.e + b.e }, exact: true };
    if (b.d === 0n) return null;
    const k = 14n, q = a.d * 10n ** k / b.d, exact = (a.d * 10n ** k) % b.d === 0n;
    let r = { neg, d: q, e: a.e - b.e - Number(k) };
    while (r.d % 10n === 0n && r.d) { r.d /= 10n; r.e++; }
    if (!exact) { const s = r.d.toString(); if (s.length > 10) { const cut = s.length - 10; r = { neg, d: (r.d + 5n * 10n ** BigInt(cut - 1)) / 10n ** BigInt(cut), e: r.e + cut }; while (r.d % 10n === 0n && r.d) { r.d /= 10n; r.e++; } } }
    return { r, exact };
  }
  function sciCard() {
    return `<div class="card nm-sci" id="nm-sci"><h2>Scientific notation</h2>
      <p class="muted small">Type a number either way, such as <b>0.000452</b>, <b>93,000,000</b> or <b>4.52 × 10^-4</b> (4.52e-4 works too).</p>
      <form class="nm-form" id="sci-form" autocomplete="off"><label class="visually-hidden" for="sci-in">A number</label><input id="sci-in" placeholder="For example, 0.000452"><button class="btn primary" type="submit">Convert</button></form>
      <div class="nm-try"><span class="small muted">Examples:</span>${['93,000,000', '0.000452', '6.02 × 10^23', '1.5e-8'].map(t => `<button type="button" class="chip-btn" data-sci="${t}">${t}</button>`).join('')}</div>
      <div id="sci-out" aria-live="polite"></div>
      <h3 style="margin-top:16px">Multiply or divide</h3>
      <form class="sci-op" id="sci-op" autocomplete="off"><input id="sci-a" aria-label="First number" value="3 × 10^5"><select id="sci-o" aria-label="Operation"><option>×</option><option>÷</option></select><input id="sci-b" aria-label="Second number" value="2 × 10^-2"><button class="btn sm" type="submit">Work it out</button></form>
      <div id="sci-op-out" aria-live="polite"></div></div>`;
  }
  function wireSci(root) {
    const out = root.querySelector('#sci-out'), oo = root.querySelector('#sci-op-out');
    const conv = () => {
      const t = root.querySelector('#sci-in').value, x = sciRead(t);
      if (!t.trim()) { out.innerHTML = ''; return; }
      if (!x) { out.innerHTML = '<p class="small cx-err">Write a number like 0.000452, or 4.52 × 10^-4.</p>'; return; }
      const fromSci = /[x×*]\s*10|e[-+]?\d|[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]/i.test(t);
      out.innerHTML = `<div class="nm-sci-ans"><div><span class="tiny muted">Scientific notation</span><b>${sciHtml(x)}</b></div><div><span class="tiny muted">Standard form</span><b>${sciPlain(x)}</b></div></div>
        <ol class="small nm-sci-steps">${sciSteps(x, fromSci).map(t2 => `<li>${esc(t2)}</li>`).join('')}</ol>`;
      root.__sci = { sci: sciParts(x), plain: sciPlain(x) };
    };
    const op = () => {
      const a = sciRead(root.querySelector('#sci-a').value), b = sciRead(root.querySelector('#sci-b').value), o = root.querySelector('#sci-o').value;
      if (!a || !b) { oo.innerHTML = '<p class="small cx-err">Write both numbers in scientific notation or standard form.</p>'; return; }
      const res = sciOp(a, b, o);
      if (!res) { oo.innerHTML = '<p class="small cx-err">You can’t divide by zero.</p>'; return; }
      const A = sciParts(a), B = sciParts(b), raw = o === '×' ? { c: Number(A.c.replace('−', '-')) * Number(B.c.replace('−', '-')) } : { c: Number(A.c.replace('−', '-')) / Number(B.c.replace('−', '-')) }, R = sciParts(res.r), P = o === '×' ? A.p + B.p : A.p - B.p;
      const c1 = String(Number(raw.c.toPrecision(10))).replace('-', '−');
      oo.innerHTML = `<ol class="small nm-sci-steps"><li>${o === '×' ? 'Multiply' : 'Divide'} the coefficients: ${A.c} ${o} ${B.c} = ${c1}.</li><li>${o === '×' ? 'Add' : 'Subtract'} the powers of 10: 10<sup>${String(A.p).replace('-', '−')}</sup> ${o} 10<sup>${String(B.p).replace('-', '−')}</sup> = 10<sup>${String(P).replace('-', '−')}</sup>.</li>
        ${R.p !== P ? `<li>${c1} isn’t between 1 and 10, so move its decimal point ${Math.abs(R.p - P)} ${Math.abs(R.p - P) === 1 ? 'place' : 'places'} and change the power to match.</li>` : ''}</ol>
        <p><b>${sciHtml(res.r)}</b> = ${sciPlain(res.r)}${res.exact ? '' : ' (rounded to 10 digits)'}</p>`;
      root.__sciOp = { sci: sciParts(res.r), plain: sciPlain(res.r) };
    };
    root.querySelector('#sci-form').addEventListener('submit', ev => { ev.preventDefault(); conv(); });
    root.querySelector('#sci-in').addEventListener('input', conv);
    root.querySelector('#sci-op').addEventListener('submit', ev => { ev.preventDefault(); op(); });
    root.querySelector('#nm-sci').addEventListener('click', ev => { const b = ev.target.closest('[data-sci]'); if (b) { root.querySelector('#sci-in').value = b.dataset.sci; conv(); } });
    op();
  }

  function page(root, start) {
    root.innerHTML = `<div class="nm-page">
      <div class="card">
        <h1>Number explorer</h1>
        <p class="muted small" style="margin:4px 0 12px">Enter a whole number to see its factors, a factor tree and the divisibility rules, or two or three numbers (such as <b>12, 18</b>) to find their GCF and LCM.</p>
        <form class="nm-form" id="nm-form"><label class="visually-hidden" for="nm-in">Numbers</label><input id="nm-in" inputmode="numeric" autocomplete="off" placeholder="For example, 84 or 12, 18"><button class="btn primary" type="submit">Explore</button></form>
        <div class="nm-try"><span class="small muted">Examples:</span>${['84', '97', '360', '1001', '12, 18', '24, 36, 60', '9, 16'].map(t => `<button type="button" class="chip-btn" data-try="${t}">${t}</button>`).join('')}</div>
      </div>
      <div id="nm-out" class="nm-out"></div>
      ${sciCard()}
    </div>`;
    const wrap = root.querySelector('.nm-page'), input = root.querySelector('#nm-in'), box = root.querySelector('#nm-out');
    let alt = 0;
    function show(push) {
      const ns = read(input.value);
      root.__numbers = { nums: ns };
      if (!ns.length) { box.innerHTML = ''; return; }
      const bad = ns.find(n => !(n >= 1 && n <= MAX && Number.isInteger(n)));
      if (bad !== undefined) { box.innerHTML = `<div class="card"><p class="cx-err loud" style="margin:0">Use whole numbers from 1 to ${nf(MAX)}.</p></div>`; root.__numbers.error = true; return; }
      if (ns.length > 3) ns.length = 3;
      if (ns.length === 1) {
        const r = one(ns[0], alt);
        box.innerHTML = r.html;
        Object.assign(root.__numbers, { prime: r.prime, factorization: powers(r.f, false), leaves: r.tree ? r.tree.leaves : null });
        if (r.tree && window.BADGES) BADGES.flag('numbers');
      } else {
        const r = many(ns);
        box.innerHTML = (read(input.value).length > 3 ? '<p class="small muted">Showing the first three numbers.</p>' : '') + r.html;
        Object.assign(root.__numbers, { gcf: r.G, lcm: r.Lm });
        if (window.BADGES) BADGES.flag('numbers');
      }
      if (push) history.replaceState(null, '', '#/numbers/' + ns.join('-'));
      H.tutorCtx({ notes: `The student is on the number explorer, looking at ${ns.join(', ')}: ${ns.length === 1 ? `prime factorization ${root.__numbers.factorization || '1'}` : `GCF ${root.__numbers.gcf}, LCM ${root.__numbers.lcm}`}.` });
    }
    wrap.addEventListener('submit', ev => { if (ev.target.id !== 'nm-form') return; ev.preventDefault(); alt = 0; show(true); });
    let t = null;
    input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { alt = 0; show(true); }, 250); });
    wrap.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b || !wrap.contains(b)) return;
      if (b.dataset.try) { input.value = b.dataset.try; alt = 0; show(true); }
      else if (b.id === 'nm-alt') { alt++; show(false); }
    });
    if (start) input.value = String(start).split('-').join(', ');
    show(false);
    wireSci(root);
    if (!start) H.tutorCtx({ notes: 'The student is on the number explorer: primes, factor trees, divisibility rules, GCF and LCM.' });
  }

  const NUMBERS = { page, factorize, pairs, read, rules, isPrime, sciRead, sciParts, sciPlain, sciOp };
  window.NUMBERS = NUMBERS;
})();
