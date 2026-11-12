/* Percents and money (#/percent, #/percent/<mode>, #/percent/<mode>/<a>_<b>_…). The three percent questions
   (find the part, the percent or the whole), then the everyday ones: a sale, a restaurant bill with a tip and a
   split, a markup, a percent change, and simple against compound interest. Each answer is shown on a percent
   ruler (a bar with percents above and amounts below, as CPM Course 2 chapter 7 draws them) and worked out the
   ways CPM does: a proportion, a decimal multiplier (scale factor) and, where it is easy, in your head from
   10% and 1%. Money is rounded to the nearest cent, and the page says so when it does. */
'use strict';
(function () {
  const V = window.VIEWS, H = V._h, esc = H.esc;

  // ---- numbers
  const clean = x => Math.round(x * 1e9) / 1e9;
  const whole = x => Math.abs(x - Math.round(x)) < 1e-9;
  const nf = (x, dp) => clean(x).toLocaleString('en-US', { maximumFractionDigits: dp === undefined ? 3 : dp });
  const exact = (x, dp) => { const c = clean(x); return Math.abs(Number(c.toFixed(dp === undefined ? 3 : dp)) - c) < 1e-9; };
  const num = x => (exact(x) ? nf(x) : '≈ ' + nf(x, 2));
  const is = x => (exact(x) ? '= ' + nf(x) : '≈ ' + nf(x, 2));
  const pc = x => (exact(x, 2) ? nf(x, 2) : '≈ ' + nf(x, 2)) + '%';
  const about = x => (exact(x, 2) ? '' : 'about ') + nf(x, 2) + '%';
  const dec = p => nf(p / 100, 6);
  const raw = x => String(clean(x));
  /** $1,234.50, always to the cent */
  const cash = x => (x < 0 ? '−' : '') + '$' + (Math.round(Math.abs(x) * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  /** money mid-way through working: $4.85, $0.485, $8 */
  const dol = x => '$' + (whole(x) ? nf(x) : exact(x, 2) ? x.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : nf(x, 4));
  const cents = x => !exact(x, 2);
  /** '= $8.73', or '= $8.7375 → $8.74 to the nearest cent' */
  const pay = x => (cents(x) ? `= ${dol(x)} → <b>${cash(x)}</b> to the nearest cent` : `= <b>${cash(x)}</b>`);
  const frac = (n, d) => `<span class="frac"><span class="num">${n}</span><span class="den">${d}</span></span>`;

  /** working out p% of n in your head, from 10% and 1% */
  function inHead(p, n, f) {
    if (!(p > 0 && p <= 1000 && whole(p))) return null;
    const ten = n / 10, one = n / 100, t = Math.floor(p / 10), r = p % 10, v = p * n / 100;
    if (p === 50) return [`50% is half: ${f(n)} ÷ 2 = ${f(v)}`];
    if (p === 25) return [`25% is a quarter: ${f(n)} ÷ 4 = ${f(v)}`];
    if (p === 100) return [`100% is all of it: ${f(n)}`];
    const lines = [`10% of ${f(n)} is ${f(ten)}: move the decimal point one place to the left.`];
    if (r === 5) {
      lines.push(`5% is half of 10%: ${f(ten / 2)}`);
      lines.push(t ? `${p}% = ${t > 1 ? `${t} × ` : ''}10% + 5% = ${t > 1 ? `${t} × ` : ''}${f(ten)} + ${f(ten / 2)} = ${f(v)}` : `So 5% = ${f(v)}`);
    } else if (r === 0) lines.push(t === 1 ? `So 10% = ${f(v)}` : `${p}% = ${t} × 10% = ${t} × ${f(ten)} = ${f(v)}`);
    else {
      lines.push(`1% is ${f(one)}: move it two places to the left.`);
      lines.push(t ? `${p}% = ${t > 1 ? `${t} × ` : ''}10% + ${r > 1 ? `${r} × ` : ''}1% = ${t > 1 ? `${t} × ` : ''}${f(ten)} + ${r > 1 ? `${r} × ` : ''}${f(one)} = ${f(v)}` : `${p}% = ${r} × 1% = ${r} × ${f(one)} = ${f(v)}`);
    }
    return lines;
  }

  // ---- the percent ruler: one bar on a percent scale; segs [{to (percent), cls, name}], ticks [[percent, amount]]
  function ruler(segs, ticks, label) {
    const top = Math.max(100, ...segs.map(s => s.to)), x0 = 36, x1 = 324, X = p => x0 + (x1 - x0) * p / top;
    let from = 0, body = '';
    segs.forEach(s => {
      const a = X(from), b = X(s.to), w = Math.max(0, b - a - 2);
      if (w > 0) body += `<rect x="${(a + (from ? 1 : 0)).toFixed(1)}" y="30" width="${w.toFixed(1)}" height="28" rx="4" class="pc-seg ${s.cls}"><title>${esc(s.name)}: ${esc(s.tip)}</title></rect>`;
      if (s.name && b - a > s.name.length * 6.4 + 6) body += `<text x="${((a + b) / 2).toFixed(1)}" y="22" text-anchor="middle" class="pc-name">${esc(s.name)}</text>`;
      from = s.to;
    });
    if (top > 100 + 1e-9) body += `<line x1="${X(100).toFixed(1)}" y1="26" x2="${X(100).toFixed(1)}" y2="62" class="pc-hundred"/>`;
    let last = -1e9, rows = 0;
    ticks = ticks.filter((t, i) => !ticks.slice(0, i).some(u => Math.abs(u[0] - t[0]) < 1e-9));
    const marks = ticks.map(([p, amt]) => {
      const x = X(p), row = x - last < 52 ? 1 : 0;
      if (!row) last = x; else rows = 1;
      const y = 78 + row * 36;
      return `<line x1="${x.toFixed(1)}" y1="58" x2="${x.toFixed(1)}" y2="${y - 12}" class="pc-tick"/><text x="${x.toFixed(1)}" y="${y}" text-anchor="middle" class="pc-pct">${esc(nf(p, 2))}%</text><text x="${x.toFixed(1)}" y="${y + 15}" text-anchor="middle" class="pc-amt">${esc(amt)}</text>`;
    }).join('');
    const h = rows ? 134 : 100;
    return `<svg class="pc-ruler" viewBox="0 0 360 ${h}" role="img" aria-label="${esc(label)}">${body}${marks}</svg>`;
  }

  // ---- simple against compound interest, year by year, with a crosshair
  function growth(P, r, t) {
    const ys = [];
    for (let y = 0; y <= Math.floor(t + 1e-9); y++) ys.push(y);
    if (!whole(t)) ys.push(t);
    const simple = ys.map(y => P * (1 + r / 100 * y)), comp = ys.map(y => P * Math.pow(1 + r / 100, y));
    const VW = 400, VH = 230, ml = 58, mr = 86, mt = 14, mb = 30, top = Math.max(...comp, ...simple);
    const step = niceStep(top / 4), ymax = Math.ceil(top / step) * step;
    const X = y => ml + (VW - ml - mr) * (t ? y / t : 0), Y = v => VH - mb - (VH - mt - mb) * v / ymax;
    let grid = '';
    for (let v = 0; v <= ymax + 1e-9; v += step) grid += `<line x1="${ml}" x2="${VW - mr}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="pc-grid"/><text x="${ml - 6}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end" class="pc-axis">${esc(short(v))}</text>`;
    const xs = niceStep(t / 6) >= 1 ? niceStep(t / 6) : 1;
    for (let y = 0; y <= t + 1e-9; y += xs) grid += `<text x="${X(y).toFixed(1)}" y="${VH - mb + 16}" text-anchor="middle" class="pc-axis">${y}</text>`;
    grid += `<text x="${((ml + VW - mr) / 2).toFixed(1)}" y="${VH - 2}" text-anchor="middle" class="pc-axis">years</text>`;
    const line = (vals, cls) => `<polyline points="${vals.map((v, i) => `${X(ys[i]).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')}" class="pc-line ${cls}"/>`;
    const dots = (vals, cls) => (ys.length <= 16 ? vals.map((v, i) => `<circle cx="${X(ys[i]).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="4" class="pc-pt ${cls}"/>`).join('') : '');
    const ly = [Y(simple[simple.length - 1]), Y(comp[comp.length - 1])];
    if (Math.abs(ly[0] - ly[1]) < 14) { const m = (ly[0] + ly[1]) / 2; ly[0] = m + 7; ly[1] = m - 7; }
    const ends = `<text x="${VW - mr + 8}" y="${(ly[0] + 4).toFixed(1)}" class="pc-end">Simple</text><text x="${VW - mr + 8}" y="${(ly[1] + 4).toFixed(1)}" class="pc-end">Compound</text>`;
    const svg = `<svg class="pc-growth" viewBox="0 0 ${VW} ${VH}" tabindex="0" role="img" aria-label="Simple interest grows in a straight line to ${cash(simple[simple.length - 1])}; compound interest curves up to ${cash(comp[comp.length - 1])} after ${nf(t)} years. Use the arrow keys to read each year.">
      ${grid}<line x1="${ml}" x2="${ml}" y1="${mt}" y2="${VH - mb}" class="pc-axisline"/><line x1="${ml}" x2="${VW - mr}" y1="${VH - mb}" y2="${VH - mb}" class="pc-axisline"/>
      ${line(simple, 'a')}${line(comp, 'b')}${dots(simple, 'a')}${dots(comp, 'b')}${ends}
      <g class="pc-hover" style="display:none"><line class="pc-cross" y1="${mt}" y2="${VH - mb}"/><circle r="5" class="pc-pt a big"/><circle r="5" class="pc-pt b big"/></g>
      <rect x="${ml}" y="${mt}" width="${VW - ml - mr}" height="${VH - mt - mb}" class="pc-hit"/></svg>`;
    return { svg, ys, simple, comp, X, Y, VW };
  }
  function niceStep(raw) {
    if (!(raw > 0)) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
  }
  const short = v => (v >= 1e6 ? '$' + nf(v / 1e6, 2) + 'M' : v >= 1e4 ? '$' + nf(v / 1e3, 1) + 'k' : '$' + nf(v, 0));
  /** the crosshair and tooltip for a growth chart */
  function wireGrowth(box, g) {
    const svg = box.querySelector('.pc-growth'), hov = svg.querySelector('.pc-hover'), tip = box.querySelector('.pc-tip');
    let at = g.ys.length - 1;
    function show(i) {
      at = Math.max(0, Math.min(g.ys.length - 1, i));
      const x = g.X(g.ys[at]);
      hov.style.display = '';
      const [ln, ca, cb] = hov.children;
      ln.setAttribute('x1', x); ln.setAttribute('x2', x);
      ca.setAttribute('cx', x); ca.setAttribute('cy', g.Y(g.simple[at]));
      cb.setAttribute('cx', x); cb.setAttribute('cy', g.Y(g.comp[at]));
      tip.textContent = '';
      const head = document.createElement('div'); head.className = 'pc-tip-h'; head.textContent = `After ${nf(g.ys[at])} year${g.ys[at] === 1 ? '' : 's'}`; tip.appendChild(head);
      [['b', g.comp[at], 'compound'], ['a', g.simple[at], 'simple']].forEach(([c, v, n]) => {
        const row = document.createElement('div'); row.className = 'pc-tip-r';
        const k = document.createElement('span'); k.className = 'pc-key ' + c;
        const b = document.createElement('b'); b.textContent = cash(v);
        const s = document.createElement('span'); s.className = 'muted'; s.textContent = n;
        row.append(k, b, s); tip.appendChild(row);
      });
      tip.hidden = false;
      const rect = svg.getBoundingClientRect(), px = x / g.VW * rect.width;
      tip.style.left = Math.min(Math.max(px - tip.offsetWidth / 2, 0), rect.width - tip.offsetWidth) + 'px';
    }
    function hide() { hov.style.display = 'none'; tip.hidden = true; }
    svg.addEventListener('pointermove', ev => {
      const rect = svg.getBoundingClientRect(), vx = (ev.clientX - rect.left) / rect.width * g.VW;
      let best = 0;
      g.ys.forEach((y, i) => { if (Math.abs(g.X(y) - vx) < Math.abs(g.X(g.ys[best]) - vx)) best = i; });
      show(best);
    });
    svg.addEventListener('pointerleave', () => { if (document.activeElement !== svg) hide(); });
    svg.addEventListener('focus', () => show(at));
    svg.addEventListener('blur', hide);
    svg.addEventListener('keydown', ev => {
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') { ev.preventDefault(); show(at + 1); }
      else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') { ev.preventDefault(); show(at - 1); }
      else if (ev.key === 'Home') { ev.preventDefault(); show(0); }
      else if (ev.key === 'End') { ev.preventDefault(); show(g.ys.length - 1); }
    });
  }

  // ---- the modes. Each returns {res: [[label, value, note]], fig, work: [[title, [lines]]], notes, hook}
  function partOf([p, n]) {
    const v = p * n / 100;
    const head = inHead(p, n, x => nf(x, 4));
    return {
      res: [['Answer', num(v), `${pc(p)} of ${nf(n)}`]],
      fig: ruler(p <= 100 ? [{ to: p, cls: 'a', name: 'part', tip: num(v) }, { to: 100, cls: 'rest', name: '', tip: num(n - v) }] : [{ to: 100, cls: 'a', name: 'whole', tip: nf(n) }, { to: p, cls: 'b', name: 'more', tip: num(v - n) }],
        [[0, '0'], [p, num(v)], [100, nf(n)]].sort((a, b) => a[0] - b[0]), `A percent ruler: ${nf(p)}% of ${nf(n)} is ${num(v)}`),
      work: [['With a proportion', [`${frac('part', 'whole')} = ${frac('percent', 100)}`, `${frac('?', nf(n))} = ${frac(nf(p), 100)}`, `? = ${nf(p)} × ${nf(n)} ÷ 100`, `${is(v)}`]],
        ['With a decimal (a scale factor)', [`${nf(p)}% = ${dec(p)}`, `${dec(p)} × ${nf(n)} ${is(v)}`]],
        ...(head ? [['Mental math', head]] : [])],
      notes: ['“Of” means multiply: 15% of 80 is 0.15 × 80.', p > 100 ? 'More than 100% of a number is more than the number itself.' : ''],
      hook: { answer: v },
    };
  }
  function whatPct([part, n]) {
    const p = part / n * 100;
    return {
      res: [['Answer', pc(p), `${nf(part)} out of ${nf(n)}`]],
      fig: ruler(p <= 100 ? [{ to: p, cls: 'a', name: 'part', tip: nf(part) }, { to: 100, cls: 'rest', name: '', tip: num(n - part) }] : [{ to: 100, cls: 'a', name: 'whole', tip: nf(n) }, { to: p, cls: 'b', name: 'more', tip: num(part - n) }],
        [[0, '0'], [p, nf(part)], [100, nf(n)]].sort((a, b) => a[0] - b[0]), `A percent ruler: ${nf(part)} is ${pc(p)} of ${nf(n)}`),
      work: [['With a proportion', [`${frac('part', 'whole')} = ${frac('percent', 100)}`, `${frac(nf(part), nf(n))} = ${frac('?', 100)}`, `? = ${nf(part)} × 100 ÷ ${nf(n)}`, `${is(p)}%`]],
        ['As a fraction, then a decimal', [`${frac(nf(part), nf(n))} = ${nf(part)} ÷ ${nf(n)} ${is(part / n)}`, `${num(part / n)} × 100 ${is(p)}%`]]],
      notes: ['The whole always goes on the bottom: it is the 100%.'],
      hook: { answer: p },
    };
  }
  function wholeOf([part, p]) {
    const n = part / p * 100;
    return {
      res: [['Answer', num(n), `${nf(part)} is ${pc(p)} of it`]],
      fig: ruler(p <= 100 ? [{ to: p, cls: 'a', name: 'part', tip: nf(part) }, { to: 100, cls: 'rest', name: '', tip: num(n - part) }] : [{ to: 100, cls: 'a', name: 'whole', tip: num(n) }, { to: p, cls: 'b', name: 'more', tip: num(part - n) }],
        [[0, '0'], [p, nf(part)], [100, num(n)]].sort((a, b) => a[0] - b[0]), `A percent ruler: ${nf(part)} is ${nf(p)}% of ${num(n)}`),
      work: [['With a proportion', [`${frac('part', 'whole')} = ${frac('percent', 100)}`, `${frac(nf(part), '?')} = ${frac(nf(p), 100)}`, `? = ${nf(part)} × 100 ÷ ${nf(p)}`, `${is(n)}`]],
        ['From 1%', [`${nf(p)}% is ${nf(part)}, so 1% is ${nf(part)} ÷ ${nf(p)} ${is(part / p)}`, `100% is 100 × ${num(part / p).replace('≈ ', '')} ${is(n)}`]],
        ['With a decimal', [`${dec(p)} × ? = ${nf(part)}`, `? = ${nf(part)} ÷ ${dec(p)} ${is(n)}`]]],
      notes: ['Check it: ' + `${nf(p)}% of ${num(n).replace('≈ ', '')} ${is(p * n / 100)}.`],
      hook: { answer: n },
    };
  }
  function sale([price, off, tax]) {
    const save = price * off / 100, now = price - save, t = now * tax / 100, total = now + t, keep = 100 - off;
    return {
      res: [['Sale price', cash(now), `you save ${cash(save)}`], ...(tax ? [['With tax', cash(total), `${pc(tax)} tax is ${cash(t)}`]] : [])],
      fig: ruler([{ to: keep, cls: 'a', name: 'you pay', tip: cash(now) }, { to: 100, cls: 'rest', name: 'you save', tip: cash(save) }], [[0, '$0'], [keep, cash(now)], [100, cash(price)]], `${nf(off)}% off ${cash(price)}: you pay ${cash(now)}`),
      work: [['The discount', [`${nf(off)}% of ${dol(price)} = ${dec(off)} × ${dol(price)}`, pay(save)]],
        ['The sale price', [`${dol(price)} − ${dol(save)}`, pay(now)]],
        ['In one step', [`${nf(off)}% off means you pay ${nf(keep)}%`, `${dec(keep)} × ${dol(price)}`, pay(now)]],
        ...(tax ? [['Adding tax', [`${nf(tax)}% tax means you pay ${nf(100 + tax)}%`, `${dec(100 + tax)} × ${dol(now)}`, pay(total)]]] : [])],
      notes: ['Two discounts don’t simply add: 20% off and then another 10% off is 0.8 × 0.9 = 0.72 of the price, which is 28% off, not 30%.',
        tax ? 'Tax is worked out on the sale price, after the discount.' : ''],
      hook: { sale: now, save, total },
    };
  }
  function bill([b, tip, tax, people]) {
    const T = b * tip / 100, X = b * tax / 100, total = b + T + X, each = total / people;
    const segs = [{ to: 100, cls: 'a', name: 'bill', tip: cash(b) }];
    if (tax) segs.push({ to: 100 + tax, cls: 'rest', name: 'tax', tip: cash(X) });
    if (tip) segs.push({ to: 100 + tax + tip, cls: 'b', name: 'tip', tip: cash(T) });
    const head = inHead(tip, b, dol);
    return {
      res: [['Tip', cash(T), `${pc(tip)} of the bill`], ['Total', cash(total), tax ? `with ${cash(X)} tax` : ''], ...(people > 1 ? [['Each person', cash(Math.ceil(each * 100 - 1e-6) / 100), `${people} people${cents(each) ? ', rounded up to the cent' : ''}`]] : [])],
      fig: ruler(segs, [[0, '$0'], [100, cash(b)], [100 + tax + tip, cash(total)]], `A bill of ${cash(b)} plus tax and tip comes to ${cash(total)}`),
      work: [['The tip', [`${nf(tip)}% of ${dol(b)} = ${dec(tip)} × ${dol(b)}`, pay(T)]], ...(head ? [['The tip by mental math', head]] : []),
        ...(tax ? [['The tax', [`${nf(tax)}% of ${dol(b)} = ${dec(tax)} × ${dol(b)}`, pay(X)]]] : []),
        ['The total', [`${dol(b)}${tax ? ` + ${dol(X)}` : ''} + ${dol(T)}`, pay(total)]],
        ...(people > 1 ? [['Split it', [`${dol(total)} ÷ ${people}`, cents(each) ? `= ${dol(each)} → <b>${cash(Math.ceil(each * 100 - 1e-6) / 100)}</b> each, rounded up so nobody is short` : `= <b>${cash(each)}</b> each`]]] : [])],
      notes: ['The tip here is worked out on the bill before tax, which is the usual way.', '10% is quick to find: move the decimal point one place to the left. Double it for 20%; add half of it for 15%.'],
      hook: { tip: T, tax: X, total, each },
    };
  }
  function markup([cost, m]) {
    const up = cost * m / 100, price = cost + up;
    return {
      res: [['Selling price', cash(price), `${cash(up)} more than it cost`]],
      fig: ruler([{ to: 100, cls: 'a', name: 'cost', tip: cash(cost) }, { to: 100 + m, cls: 'b', name: 'markup', tip: cash(up) }], [[0, '$0'], [100, cash(cost)], [100 + m, cash(price)]], `A ${nf(m)}% markup on ${cash(cost)} gives ${cash(price)}`),
      work: [['The markup', [`${nf(m)}% of ${dol(cost)} = ${dec(m)} × ${dol(cost)}`, pay(up)]], ['The price', [`${dol(cost)} + ${dol(up)}`, pay(price)]],
        ['In one step', [`A ${nf(m)}% markup means the price is ${nf(100 + m)}% of the cost`, `${dec(100 + m)} × ${dol(cost)}`, pay(price)]]],
      notes: ['A store buys at the cost and marks it up to make money. A sale then takes a percent off the marked-up price.'],
      hook: { price, markup: up },
    };
  }
  function change([a, b]) {
    const d = b - a, p = d / a * 100, up = d >= 0, back = a === b ? 0 : -d / b * 100;
    return {
      res: [[up ? (d ? 'Percent increase' : 'No change') : 'Percent decrease', pc(Math.abs(p)), `${up ? 'up' : 'down'} ${num(Math.abs(d))} from ${nf(a)}`]],
      fig: ruler(up ? [{ to: 100, cls: 'a', name: 'original', tip: nf(a) }, { to: 100 + p, cls: 'b', name: d ? 'increase' : '', tip: num(d) }] : [{ to: 100 + p, cls: 'a', name: 'new', tip: nf(b) }, { to: 100, cls: 'rest', name: 'decrease', tip: num(-d) }],
        [[0, '0'], [100, nf(a)], ...(d ? [[100 + p, nf(b)]] : [])].sort((x, y) => x[0] - y[0]), `From ${nf(a)} to ${nf(b)} is ${up ? 'an increase' : 'a decrease'} of ${about(Math.abs(p))}`),
      work: [['The change', [`new − original = ${nf(b)} − ${nf(a)}`, is(d)]],
        ['As a percent of the original', [`${frac('change', 'original')} = ${frac(num(Math.abs(d)).replace('≈ ', ''), nf(a))} ${is(Math.abs(d) / a)}`, `${num(Math.abs(d) / a).replace('≈ ', '')} × 100 = ${pc(Math.abs(p))} ${up ? 'increase' : 'decrease'}`]],
        ['As a scale factor', [`${frac(nf(b), nf(a))} ${is(b / a)}, so the new amount is ${pc(b / a * 100)} of the original`]]],
      notes: ['Always divide by the <b>original</b> amount, the one you started from.',
        d ? `Going back the other way is a different percent: from ${nf(b)} to ${nf(a)} is ${up ? 'a decrease' : 'an increase'} of ${about(Math.abs(back))}, because it starts from ${nf(b)}.` : ''],
      hook: { percent: p, change: d },
    };
  }
  function interest([P, r, t]) {
    const I = P * r / 100 * t, simple = P + I, comp = P * Math.pow(1 + r / 100, t), g = growth(P, r, t);
    const rows = g.ys.map((y, i) => `<tr><td>${nf(y)}</td><td>${cash(g.simple[i])}</td><td>${cash(g.comp[i])}</td><td>${cash(g.comp[i] - g.simple[i])}</td></tr>`).join('');
    return {
      res: [['Simple interest', cash(I), `total ${cash(simple)}`], ['Compound, once a year', cash(comp - P), `total ${cash(comp)}`]],
      fig: ruler([{ to: 100, cls: 'a', name: 'principal', tip: cash(P) }, { to: 100 + r * t, cls: 'b', name: 'interest', tip: cash(I) }], [[0, '$0'], [100, cash(P)], [100 + r * t, cash(simple)]], `Simple interest: ${cash(P)} grows to ${cash(simple)}`),
      chart: `<div class="pc-legend"><span><span class="pc-key a"></span>Simple interest</span><span><span class="pc-key b"></span>Compound interest (once a year)</span></div><div class="pc-chart">${g.svg}<div class="pc-tip" hidden></div></div>
        <details class="pc-table"><summary class="small">Year by year</summary><div class="table-wrap"><table class="ch-table"><thead><tr><th>Year</th><th>Simple</th><th>Compound</th><th>Difference</th></tr></thead><tbody>${rows}</tbody></table></div></details>`,
      growth: g,
      work: [['Simple interest', ['I = principal × rate × time = P × r × t', `= ${dol(P)} × ${dec(r)} × ${nf(t)}`, pay(I)]], ['The total, simple', [`${dol(P)} + ${dol(I)}`, pay(simple)]],
        ['Compound interest, once a year', [`Each year the balance is multiplied by 1 + ${dec(r)} = ${nf(1 + r / 100, 6)}`, `${dol(P)} × ${nf(1 + r / 100, 6)}<sup>${nf(t)}</sup>`, pay(comp)]]],
      notes: ['Simple interest earns the same amount every year, so it grows in a straight line.',
        `Compound interest also earns interest on the interest already earned, so it curves upward. After ${nf(t)} year${t === 1 ? '' : 's'} that is ${cash(comp - simple)} more.`,
        'The rate is per year. For months, divide by 12: 6 months is 0.5 years.'],
      hook: { interest: I, simple, compound: comp },
    };
  }

  const MODES = {
    of: { name: 'Percent of a number', ask: 'What is ? % of ?', f: [['Percent', 15, '%'], ['Of the number', 80]], calc: partOf, check: v => (v[0] < 0 || v[1] < 0 ? 'Use numbers that are 0 or more.' : '') },
    what: { name: 'What percent?', f: [['The part', 12], ['The whole', 80]], calc: whatPct, check: v => (v[1] <= 0 ? 'The whole must be more than 0.' : v[0] < 0 ? 'The part can’t be negative.' : '') },
    whole: { name: 'Find the whole', f: [['The part', 12], ['is this percent', 15, '%']], calc: wholeOf, check: v => (v[1] <= 0 ? 'The percent must be more than 0.' : v[0] < 0 ? 'The part can’t be negative.' : '') },
    sale: { name: 'Sale and discount', f: [['Price', 60, '$'], ['Percent off', 25, '%'], ['Sales tax', 0, '%']], calc: sale, check: v => (v[1] > 100 ? 'A discount can’t be more than 100%.' : v[2] > 100 ? 'Tax must be less than 100%.' : '') },
    bill: { name: 'Tip, tax and split', f: [['Bill', 48.5, '$'], ['Tip', 18, '%'], ['Tax', 0, '%'], ['People', 1]], calc: bill, check: v => (!whole(v[3]) || v[3] < 1 || v[3] > 100 ? 'The number of people must be a whole number from 1 to 100.' : v[1] > 100 || v[2] > 100 ? 'Use percents up to 100.' : '') },
    markup: { name: 'Markup', f: [['Cost', 40, '$'], ['Markup', 35, '%']], calc: markup },
    change: { name: 'Percent change', f: [['Original', 50], ['New', 65]], calc: change, check: v => (v[0] <= 0 ? 'The original amount must be more than 0.' : '') },
    interest: { name: 'Interest', f: [['Principal', 1000, '$'], ['Rate per year', 5, '%'], ['Years', 10]], calc: interest, check: v => (v[0] <= 0 ? 'The principal must be more than 0.' : v[1] > 100 ? 'Use a rate up to 100% a year.' : v[2] <= 0 || v[2] > 100 ? 'Use from 0 to 100 years.' : '') },
  };
  const GROUPS = [['Percent problems', ['of', 'what', 'whole', 'change']], ['Money', ['sale', 'bill', 'markup', 'interest']]];

  /** work out a mode from its numbers (for the page and the tests) */
  function solve(mode, vals) {
    const M = MODES[mode];
    if (!M) return { error: 'This question type doesn’t exist.' };
    for (let i = 0; i < M.f.length; i++) {
      const v = vals[i];
      if (!Number.isFinite(v)) return { error: `Enter a number for ${M.f[i][0].toLowerCase()}.` };
      if (Math.abs(v) > 1e9) return { error: 'Use numbers up to 1,000,000,000.' };
      if (v < 0) return { error: `${M.f[i][0]} can’t be negative.` };
    }
    const bad = M.check && M.check(vals);
    return bad ? { error: bad } : M.calc(vals);
  }
  const read = s => Number(String(s).replace(/[$,%\s]/g, ''));

  /** the prices on a receipt, one per line ("Burger 12.50", "$4.25", "2 tacos 7.00"): the last number on each line,
      added in whole cents so the subtotal is exact. { items: [[name, cents]], cents, bad: [lines] } */
  function receipt(text) {
    const items = [], bad = [];
    String(text || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean).forEach(l => {
      const m = /^(.*?)[\s:$]*\$?\s*(\d{1,6}(?:,\d{3})*(?:\.\d{1,2})?|\.\d{1,2})\s*$/.exec(l);
      if (!m) { bad.push(l); return; }
      const [w, f = ''] = m[2].replace(/,/g, '').split('.');
      items.push([m[1].replace(/[\s.:$-]+$/, '').trim(), Number(w || 0) * 100 + Number((f + '00').slice(0, 2))]);
    });
    return { items, cents: items.reduce((t, it) => t + it[1], 0), bad };
  }
  const centsText = c => '$' + (c / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function page(root, mode, code) {
    const mem = V.tools && V.tools.pref ? V.tools.pref('percent') : {};
    if (!MODES[mode] && !code && MODES[mem.mode]) { mode = mem.mode; if (Array.isArray(mem.vals) && mem.vals.every(Number.isFinite)) code = mem.vals.join('_'); }
    let m = MODES[mode] ? mode : 'of', items = typeof mem.items === 'string' ? mem.items.slice(0, 2000) : '';
    const defaults = k => MODES[k].f.map(x => x[1]);
    let vals = defaults(m);
    if (code) String(code).split('_').forEach((p, i) => { const v = Number(p); if (i < vals.length && p !== '' && Number.isFinite(v)) vals[i] = v; });
    root.innerHTML = `<div class="sh-page pc-page">
      <div class="card">
        <h1>Percents and money</h1>
        <p class="muted small" style="margin:4px 0 10px">Percent problems, sales, tips, markups and interest. Every answer is drawn on a percent ruler and worked out step by step.</p>
        ${V.tools && V.tools.how ? V.tools.how('percent') : ''}
        <div class="sh-kinds">${GROUPS.map(([g, keys]) => `<div class="sh-group"><span class="tiny muted">${g}</span><div class="sh-chips">${keys.map(x => `<button type="button" class="chip-btn${x === m ? ' on' : ''}" data-mode="${x}" aria-pressed="${x === m}">${MODES[x].name}</button>`).join('')}</div></div>`).join('')}</div>
      </div>
      <div class="card"><div id="pc-in"></div><div id="pc-fig" class="pc-fig"></div></div>
      <div id="pc-out" class="sh-out"></div>
    </div>`;
    const wrap = root.querySelector('.pc-page'), inBox = root.querySelector('#pc-in'), fig = root.querySelector('#pc-fig'), out = root.querySelector('#pc-out');
    let touched = false;
    function drawInputs() {
      const M = MODES[m];
      inBox.innerHTML = `<h2 style="margin:0 0 8px">${M.name}</h2><div class="sh-fields">${M.f.map(([label, , sym], i) => `<div class="sh-field"><label class="small" for="pc-f${i}">${label}</label><span class="pc-box${sym === '$' ? ' pre' : sym ? ' post' : ''}"${sym ? ` data-sym="${sym}"` : ''}><input id="pc-f${i}" type="text" inputmode="decimal" autocomplete="off" data-i="${i}" value="${raw(vals[i])}"></span></div>`).join('')}</div>
        ${m === 'bill' ? `<details class="pc-receipt"${items.trim() ? ' open' : ''}><summary class="small"><b>Add up a receipt</b></summary><label class="small" for="pc-items">Type each price from the receipt, one per line. The bill becomes their total.</label><textarea id="pc-items" rows="4" spellcheck="false" placeholder="Burger 12.50&#10;Fries 4.25&#10;Lemonade 2.99">${esc(items)}</textarea><p class="tiny muted" id="pc-items-sum" aria-live="polite"></p></details>` : ''}`;
      itemsNote();
    }
    /** the receipt's lines add up to the bill */
    function itemsNote() {
      const note = inBox.querySelector('#pc-items-sum'); if (!note) return null;
      const r = receipt(items);
      note.innerHTML = r.items.length ? `${r.items.length} item${r.items.length === 1 ? '' : 's'}: ${r.items.map(it => centsText(it[1])).join(' + ')} = <b>${centsText(r.cents)}</b>${r.bad.length ? `. Left out (no price found): ${esc(r.bad.slice(0, 2).join('; '))}` : ''}` : '';
      return r;
    }
    function render() {
      const r = solve(m, vals), M = MODES[m];
      root.__percent = Object.assign({ mode: m, vals: vals.slice() }, r.error ? { error: r.error } : r.hook);
      if (r.error) { fig.innerHTML = ''; out.innerHTML = `<div class="card"><p class="cx-err loud" style="margin:0">${esc(r.error)}</p></div>`; return; }
      if (V.tools && V.tools.pref) V.tools.pref('percent', { mode: m, vals: vals.slice(), items });
      if (m === 'bill') {                                           // the bill came from a receipt: show the adding up first
        const rc = receipt(items);
        if (rc.items.length > 1 && rc.cents === Math.round(vals[0] * 100)) r.work.unshift(['The bill, from the receipt', [`${rc.items.map(it => `${it[0] ? esc(it[0]) + ' ' : ''}${centsText(it[1])}`).join(' + ')}`, `= <b>${centsText(rc.cents)}</b>`]]);
      }
      fig.innerHTML = r.fig;
      out.innerHTML = `<div class="card"><div class="sh-res">${r.res.map(([l, v, s]) => `<div class="sh-tile"><span class="tiny muted">${l}</span><b>${v}</b>${s ? `<span class="tiny muted">${s}</span>` : ''}</div>`).join('')}</div></div>
        ${r.chart ? `<div class="card"><h2>Simple or compound?</h2>${r.chart}</div>` : ''}
        <div class="card"><h2>How it is found</h2>${r.work.map(([t, lines]) => `<div class="sh-work"><h3>${t}</h3><div class="sh-lines">${lines.map(x => `<div>${x}</div>`).join('')}</div></div>`).join('')}</div>
        ${r.notes.filter(Boolean).length ? `<div class="card"><h2>Key facts</h2><ul class="nm-facts">${r.notes.filter(Boolean).map(t => `<li>${t}</li>`).join('')}</ul></div>` : ''}`;
      if (r.growth) wireGrowth(out.querySelector('.pc-chart'), r.growth);
      history.replaceState(null, '', `#/percent/${m}/${vals.map(raw).join('_')}`);
      H.tutorCtx({ notes: `The student is on the percents and money tool (${M.name}): ${M.f.map(([l, , sym], i) => `${l.toLowerCase()} ${sym === '$' ? '$' : ''}${raw(vals[i])}${sym === '%' ? '%' : ''}`).join(', ')}. ${r.res.map(([l, v, s]) => `${l}: ${H.plain(v)}${s ? ` (${H.plain(s)})` : ''}`).join('; ')}.` });
      if (touched && window.BADGES) BADGES.flag('money');
    }
    let t = null;
    wrap.addEventListener('input', ev => {
      const el = ev.target;
      if (el.id === 'pc-items') {
        items = el.value; touched = true;
        const r = itemsNote();
        if (r && r.items.length) { vals[0] = r.cents / 100; const b = inBox.querySelector('#pc-f0'); if (b) b.value = raw(vals[0]); }
        clearTimeout(t); t = setTimeout(render, 150); return;
      }
      if (!inBox.contains(el) || el.dataset.i === undefined) return;
      touched = true;
      const v = read(el.value);
      vals[Number(el.dataset.i)] = el.value.trim() === '' ? NaN : v;
      clearTimeout(t); t = setTimeout(render, 150);
    });
    wrap.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b || !wrap.contains(b)) return;
      if (b.dataset.mode && b.dataset.mode !== m) {
        m = b.dataset.mode; vals = defaults(m);
        wrap.querySelectorAll('[data-mode]').forEach(x => { x.classList.toggle('on', x.dataset.mode === m); x.setAttribute('aria-pressed', String(x.dataset.mode === m)); });
        drawInputs(); render();
      }
    });
    drawInputs(); render();
  }

  /** the way back to Tools, for the pages that live at their own address */
  const crumbs = t => `<nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a> › <a href="#/tools">Tools</a> › <span>${esc(t)}</span></nav>`;
  /* ---------- the ratio table (#/ratios): equal ratios in columns, made by multiplying, dividing or adding columns,
     and a missing value found exactly. Numbers are kept as fractions [n, d], so 2 : 3 scaled to 5 is 7 1/2, not 7.4999… */
  const gcdN = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const F = (n, d) => { d = d || 1; if (d < 0) { n = -n; d = -d; } const g = gcdN(n, d); return [n / g, d / g]; };
  const fMul = (a, b) => F(a[0] * b[0], a[1] * b[1]), fDiv = (a, b) => F(a[0] * b[1], a[1] * b[0]), fAdd = (a, b) => F(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  /** a typed number as a fraction: 12, 2.5, 3/4, 1 1/2; null if it can't be read */
  function fRead(t) {
    t = String(t || '').trim().replace(/,/g, '');
    let m = /^(\d+)\s+(\d+)\/(\d+)$/.exec(t);
    if (m && Number(m[3])) return F(Number(m[1]) * Number(m[3]) + Number(m[2]), Number(m[3]));
    if ((m = /^(\d+)\/(\d+)$/.exec(t)) && Number(m[2])) return F(Number(m[1]), Number(m[2]));
    if ((m = /^(\d*)\.(\d{1,6})$/.exec(t))) return F(Number((m[1] || '0') + m[2]), Math.pow(10, m[2].length));
    if (/^\d{1,9}$/.test(t)) return F(Number(t), 1);
    return null;
  }
  /** a fraction for people: 12, 7.5, 1 2/3 (a decimal only when it ends within 4 places) */
  function fShow(q) {
    const [n, d] = q;
    if (d === 1) return n.toLocaleString('en-US');
    let k = d; [2, 5].forEach(p => { while (k % p === 0) k /= p; });
    if (k === 1 && String(n / d).length <= 10 && Number((n / d).toFixed(4)) === n / d) return (n / d).toLocaleString('en-US', { maximumFractionDigits: 4 });
    const w = Math.floor(n / d), r = n - w * d;
    return (w ? w.toLocaleString('en-US') + ' ' : '') + `${r}/${d}`;
  }
  const RT_EX = [['Cups of flour', 'Cookies', '2', '3'], ['Minutes', 'Miles', '15', '1'], ['Dollars', 'Pounds of apples', '6', '4'], ['Red paint', 'Blue paint', '3', '5']];
  function ratios(root, code) {
    const mem = V.tools && V.tools.pref ? V.tools.pref('ratios') : {};
    let names = [mem.n0 || RT_EX[0][0], mem.n1 || RT_EX[0][1]], start = [fRead(mem.a) || F(2), fRead(mem.b) || F(3)];
    if (code && window.DRAW) { try { const o = JSON.parse(DRAW.decode(code) || 'null'); if (o && fRead(o.a) && fRead(o.b)) { start = [fRead(o.a), fRead(o.b)]; names = [String(o.n0 || names[0]).slice(0, 30), String(o.n1 || names[1]).slice(0, 30)]; } } catch (e) { /* a broken link */ } }
    let cols = [], sel = [0], err = '', found = null;
    const reset = () => { cols = [{ q: start.slice(), how: 'start' }, { q: start.map(x => fMul(x, F(2))), how: '× 2' }, { q: start.map(x => fMul(x, F(3))), how: '× 3' }]; sel = [0]; found = null; };
    reset();
    root.innerHTML = `${crumbs('Ratio table')}<div class="sh-page rt-page">
      <div class="card">
        <h1>Ratio table</h1>
        <p class="muted small" style="margin:4px 0 10px">Equal ratios side by side. Multiply, divide or add columns to make more, and type a number in the last column to find its partner.</p>
        ${V.tools && V.tools.how ? V.tools.how('ratios') : ''}
        <div class="sh-fields rt-start">
          <div class="sh-field wide"><label class="small" for="rt-n0">First quantity</label><input id="rt-n0" type="text" maxlength="30" value="${esc(names[0])}"></div>
          <div class="sh-field"><label class="small" for="rt-a">Amount</label><input id="rt-a" type="text" inputmode="decimal" value="${esc(fShow(start[0]))}"></div>
          <span class="rt-colon" aria-hidden="true">:</span>
          <div class="sh-field"><label class="small" for="rt-b">Amount</label><input id="rt-b" type="text" inputmode="decimal" value="${esc(fShow(start[1]))}"></div>
          <div class="sh-field wide"><label class="small" for="rt-n1">Second quantity</label><input id="rt-n1" type="text" maxlength="30" value="${esc(names[1])}"></div>
        </div>
        <div class="rt-ex"><span class="tiny muted">Examples:</span>${RT_EX.map((e, i) => `<button type="button" class="chip-btn" data-rex="${i}">${esc(e[0])} and ${esc(e[1].toLowerCase())}</button>`).join('')}</div>
      </div>
      <div class="card" id="rt-card"></div>
      <div id="rt-out" class="sh-out"></div>
    </div>`;
    const wrap = root.querySelector('.rt-page'), card = root.querySelector('#rt-card'), out = root.querySelector('#rt-out');
    const unit = (i, j) => fDiv(start[j], start[i]);                   // how many of j for 1 of i
    function draw() {
      const n = names.map(x => esc(x || 'Amount'));
      card.innerHTML = `<div class="table-wrap"><table class="rt-table"><caption class="visually-hidden">Equal ratios of ${n[0]} to ${n[1]}</caption>
          <thead><tr><td></td>${cols.map((c, k) => `<th scope="col"><button type="button" class="rt-pick${sel.includes(k) ? ' on' : ''}" data-col="${k}" aria-pressed="${sel.includes(k)}">${k ? esc(c.how) : 'Start'}</button></th>`).join('')}<th scope="col" class="rt-newh">Find</th></tr></thead>
          <tbody>${[0, 1].map(r => `<tr><th scope="row">${n[r]}</th>${cols.map((c, k) => `<td class="${sel.includes(k) ? 'on' : ''}">${fShow(c.q[r])}</td>`).join('')}<td class="rt-new"><input type="text" inputmode="decimal" data-row="${r}" aria-label="A number of ${n[r]}, to find its partner" placeholder="?"></td></tr>`).join('')}</tbody></table></div>
        <div class="rt-ops" role="group" aria-label="Make a new column from the ${sel.length > 1 ? 'chosen columns' : 'chosen column'}">
          <span class="tiny muted">${sel.length > 1 ? 'Two columns chosen:' : 'From the chosen column:'}</span>
          ${sel.length > 1 ? '<button type="button" class="btn sm" data-op="add">Add them</button>' : ['× 2', '× 3', '× 10', '÷ 2', '÷ 3'].map(o => `<button type="button" class="btn sm" data-op="${o}">${o}</button>`).join('') + '<span class="rt-by"><label class="visually-hidden" for="rt-k">Multiply or divide by</label><input id="rt-k" type="text" inputmode="decimal" placeholder="4"><button type="button" class="btn sm" data-op="×k">×</button><button type="button" class="btn sm" data-op="÷k">÷</button></span>'}
          ${cols.length > 1 ? '<button type="button" class="btn sm ghost" data-op="del">Remove the last column</button>' : ''}
        </div>
        <p class="tiny muted" style="margin:6px 0 0">Choose a column by its heading; choose two to add them together.</p>
        ${err ? `<p class="cx-err" style="margin:8px 0 0">${esc(err)}</p>` : ''}`;
      const u01 = unit(0, 1), u10 = unit(1, 0);
      const pts = cols.map(c => `(${fShow(c.q[0]).replace(/ (\d+)\/(\d+)$/, (x, a, b) => `+${a}/${b}`)}, ${fShow(c.q[1]).replace(/ (\d+)\/(\d+)$/, (x, a, b) => `+${a}/${b}`)})`).join(' ');
      const graph = window.DRAW ? '#/graph/' + DRAW.encode(`points ${pts}\ny = ${u01[1] === 1 ? u01[0] : `${u01[0]}/${u01[1]}`}x for x >= 0\nx label: ${names[0] || 'x'}\ny label: ${names[1] || 'y'}`) : '#/graph';
      out.innerHTML = `<div class="card"><div class="sh-res"><div class="sh-tile"><span class="tiny muted">Unit rate</span><b>${fShow(u01)}</b><span class="tiny muted">${n[1].toLowerCase()} for each 1 of the ${n[0].toLowerCase()}</span></div><div class="sh-tile"><span class="tiny muted">The other way</span><b>${fShow(u10)}</b><span class="tiny muted">${n[0].toLowerCase()} for each 1 of the ${n[1].toLowerCase()}</span></div></div>
          <p class="small" style="margin:10px 0 0">These are the unit rates. Every column has the same ratio: ${n[1].toLowerCase()} ÷ ${n[0].toLowerCase()} is always ${fShow(u01)}. <a href="${graph}">See it as a graph</a>: the points lie on a line through (0, 0).</p></div>
        ${found ? `<div class="card"><h2>Finding the missing number</h2><div class="sh-work"><h3>With a scale factor</h3><div class="sh-lines">${found.scale.map(x => `<div>${x}</div>`).join('')}</div></div><div class="sh-work"><h3>With the unit rate</h3><div class="sh-lines">${found.rate.map(x => `<div>${x}</div>`).join('')}</div></div></div>` : ''}`;
      root.__ratios = { names: names.slice(), cols: cols.map(c => c.q.map(fShow)), sel: sel.slice(), unit: fShow(u01), found: found ? found.answer : null };
      if (V.tools && V.tools.pref) V.tools.pref('ratios', { n0: names[0], n1: names[1], a: fShow(start[0]).replace(/^(\d+) (\d+\/\d+)$/, '$1 $2'), b: fShow(start[1]) });
      H.tutorCtx({ notes: `The student is on the ratio table: ${names[0]} to ${names[1]} is ${fShow(start[0])} : ${fShow(start[1])}. Columns: ${cols.map(c => c.q.map(fShow).join(' : ')).join('; ')}.` });
    }
    const addCol = (q, how) => { if (cols.length >= 12) { err = 'The table holds 12 columns. Remove one to add another.'; return; } if (q.some(x => x[0] <= 0 || x[0] / x[1] > 1e9)) { err = 'Use amounts more than 0 and up to 1,000,000,000.'; return; } cols.push({ q, how }); sel = [cols.length - 1]; err = ''; };
    function op(o) {
      const c = cols[sel[sel.length - 1]] || cols[0];
      if (o === 'del') { cols.pop(); sel = [Math.min(sel[0] || 0, cols.length - 1)]; found = null; err = ''; return; }
      if (o === 'add') { const [a, b] = sel.map(k => cols[k]); addCol([fAdd(a.q[0], b.q[0]), fAdd(a.q[1], b.q[1])], 'Sum'); return; }
      let k, mul = /^×/.test(o);
      if (/k$/.test(o)) { k = fRead(root.querySelector('#rt-k').value); if (!k || !k[0]) { err = 'Type a number to multiply or divide by, such as 4 or 1.5.'; return; } }
      else k = F(Number(o.replace(/[^\d]/g, '')));
      addCol(c.q.map(x => (mul ? fMul(x, k) : fDiv(x, k))), `${mul ? '×' : '÷'} ${fShow(k)}`);
    }
    function find(row, text) {
      const x = fRead(text);
      if (!x || !x[0]) { err = text.trim() ? `“${text.trim()}” isn’t a number the table can use. Try 12, 7.5 or 3/4.` : ''; return; }
      const other = 1 - row, k = fDiv(x, start[row]), y = fMul(start[other], k), u = unit(row, other);
      found = {
        answer: fShow(y),
        scale: [`From ${fShow(start[row])} to ${fShow(x)} is × ${fShow(k)}, because ${fShow(x)} ÷ ${fShow(start[row])} = ${fShow(k)}.`, `Do the same to the other row: ${fShow(start[other])} × ${fShow(k)} = <b>${fShow(y)}</b>.`],
        rate: [`1 of the ${esc(names[row].toLowerCase())} goes with ${fShow(u)} of the ${esc(names[other].toLowerCase())}: ${fShow(start[other])} ÷ ${fShow(start[row])} = ${fShow(u)}.`, `So ${fShow(x)} goes with ${fShow(x)} × ${fShow(u)} = <b>${fShow(y)}</b>.`],
      };
      const q = row ? [y, x] : [x, y];
      addCol(q, 'Found');
    }
    function restart() {
      const a = fRead(root.querySelector('#rt-a').value), b = fRead(root.querySelector('#rt-b').value);
      names = [root.querySelector('#rt-n0').value.trim(), root.querySelector('#rt-n1').value.trim()];
      if (!a || !b || !a[0] || !b[0]) { err = 'Enter two amounts more than 0, such as 2 and 3, or 1.5 and 4.'; cols = []; card.innerHTML = `<p class="cx-err" style="margin:0">${esc(err)}</p>`; out.innerHTML = ''; root.__ratios = { error: err }; return; }
      start = [a, b]; err = ''; reset(); draw();
    }
    let tm = null;
    wrap.addEventListener('input', ev => { if (/^rt-(n0|n1|a|b)$/.test(ev.target.id)) { clearTimeout(tm); tm = setTimeout(restart, 250); } });
    wrap.addEventListener('change', ev => { const r = ev.target.dataset.row; if (r !== undefined && ev.target.value.trim()) { find(Number(r), ev.target.value); draw(); } });
    wrap.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.dataset.row !== undefined) { ev.preventDefault(); ev.target.blur(); } });
    wrap.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b || !wrap.contains(b)) return;
      if (b.dataset.rex !== undefined) { const e = RT_EX[Number(b.dataset.rex)]; root.querySelector('#rt-n0').value = e[0]; root.querySelector('#rt-n1').value = e[1]; root.querySelector('#rt-a').value = e[2]; root.querySelector('#rt-b').value = e[3]; restart(); return; }
      if (b.dataset.col !== undefined) { const k = Number(b.dataset.col); sel = sel.includes(k) ? (sel.length > 1 ? sel.filter(x => x !== k) : sel) : sel.concat(k).slice(-2); err = ''; draw(); return; }
      if (b.dataset.op) { op(b.dataset.op); draw(); }
    });
    if (code) history.replaceState(null, '', '#/ratios');
    draw();
  }

  /* ---------- counting money (#/money): US coins and bills on a counter, a running total, and two games ---------- */
  const COINS = [['penny', 1, '1¢'], ['nickel', 5, '5¢'], ['dime', 10, '10¢'], ['quarter', 25, '25¢'], ['dollar', 100, '$1'], ['five', 500, '$5'], ['ten', 1000, '$10'], ['twenty', 2000, '$20']];
  const COIN = Object.fromEntries(COINS.map(c => [c[0], c]));
  const money$ = c => (c >= 100 ? '$' + (c / 100).toFixed(2) : c + '¢');
  /** the fewest coins and bills that make an amount (the greedy way is always fewest for US money) */
  function fewest(c) { const out = []; COINS.slice().reverse().forEach(([k, v]) => { while (c >= v) { out.push(k); c -= v; } }); return out; }
  function coinSvg(k, size) {
    const [, v, lab] = COIN[k], bill = v >= 100, s = size || 1;
    if (bill) return `<svg viewBox="0 0 92 44" width="${Math.round(92 * s)}" height="${Math.round(44 * s)}" aria-hidden="true"><rect x="1.5" y="1.5" width="89" height="41" rx="4" class="mn-bill"/><rect x="7" y="7" width="78" height="30" rx="3" class="mn-bill-in"/><text x="46" y="28" text-anchor="middle" class="mn-lab">${lab}</text></svg>`;
    const r = { penny: 19, nickel: 21, dime: 18, quarter: 24 }[k];
    return `<svg viewBox="0 0 52 52" width="${Math.round(2 * r * s + 4)}" height="${Math.round(2 * r * s + 4)}" aria-hidden="true"><circle cx="26" cy="26" r="${r}" class="mn-coin ${k === 'penny' ? 'cu' : 'ag'}"/><circle cx="26" cy="26" r="${r - 4}" class="mn-rim"/><text x="26" y="${26 + 5}" text-anchor="middle" class="mn-lab">${lab}</text></svg>`;
  }
  function money(root) {
    let tray = [], game = null, rolls = 0;
    root.innerHTML = `${crumbs('Counting money')}<div class="sh-page mn-page">
      <div class="card">
        <h1>Counting money</h1>
        <p class="muted small" style="margin:4px 0 10px">Tap coins and bills to put them on the counter. The total adds up as you go.</p>
        ${V.tools && V.tools.how ? V.tools.how('money') : ''}
        <div class="mn-bank" role="group" aria-label="Coins and bills">${COINS.map(([k, v]) => `<button type="button" class="mn-add" data-add="${k}" aria-label="Add a ${k === 'dollar' ? 'one-dollar bill' : v >= 100 ? money$(v).replace('.00', '') + ' bill' : k}, ${money$(v)}">${coinSvg(k)}<span class="tiny">${k === 'dollar' ? '$1 bill' : v >= 100 ? money$(v).replace('.00', '') + ' bill' : k}</span></button>`).join('')}</div>
      </div>
      <div class="card"><div class="row between" style="flex-wrap:wrap;gap:8px"><h2 style="margin:0">On the counter</h2><button type="button" class="btn sm ghost" id="mn-clear">Clear the counter</button></div>
        <div class="mn-tray" id="mn-tray" aria-live="polite"></div>
        <p class="mn-total" id="mn-total"></p></div>
      <div class="card"><h2>Play</h2><div class="btn-row"><button type="button" class="btn sm" id="mn-make">Make the amount</button><button type="button" class="btn sm" id="mn-count">Count the coins</button></div><div id="mn-game" class="mn-game"></div></div>
    </div>`;
    const wrap = root.querySelector('.mn-page'), q = s2 => root.querySelector(s2);
    const total = () => tray.reduce((t, k) => t + COIN[k][1], 0);
    function draw() {
      const c = total(), sorted = tray.map((k, i) => ({ k, i })).sort((a, b) => COIN[b.k][1] - COIN[a.k][1]);
      q('#mn-tray').innerHTML = tray.length ? sorted.map(({ k, i }) => `<button type="button" class="mn-on" data-off="${i}" aria-label="Take off a ${COIN[k][1] >= 100 ? money$(COIN[k][1]) + ' bill' : k}">${coinSvg(k, 0.9)}</button>`).join('') : '<p class="small muted" style="margin:0">Nothing yet. Tap a coin or a bill above.</p>';
      const counts = COINS.map(([k, v]) => [k, v, tray.filter(x => x === k).length]).filter(x => x[2]).reverse();
      q('#mn-total').innerHTML = tray.length ? `<b>${money$(c)}</b><span class="small muted">${counts.map(([k, v, n]) => `${n} × ${money$(v)}`).join(' + ')}${c >= 100 ? ` = ${(c / 100).toFixed(2)} dollars` : ''}</span>` : '';
      if (game && game.kind === 'make') {
        const box = q('#mn-game .mn-check');
        if (box) box.innerHTML = c === game.c ? `<p class="feedback good">You made ${money$(game.c)} with ${tray.length} ${tray.some(k => COIN[k][1] >= 100) ? `piece${tray.length === 1 ? '' : 's'} of money` : `coin${tray.length === 1 ? '' : 's'}`}. ${tray.length === fewest(game.c).length ? 'That is the fewest possible.' : `The fewest is ${fewest(game.c).length}: ${fewest(game.c).map(k => money$(COIN[k][1])).join(' + ')}.`}</p>` : c > game.c ? `<p class="small">That is ${money$(c - game.c)} too much. Take something off.</p>` : `<p class="small muted">${money$(game.c - c)} to go.</p>`;
      }
      root.__money = { tray: tray.slice(), total: c, game: game ? Object.assign({}, game) : null };
    }
    function newGame(kind) {
      const R = RNG.make(`money:${kind}:${++rolls}:${Date.now() % 100000}`);
      if (kind === 'make') {
        const c = R.int(1, 4) === 1 ? R.int(101, 499) : R.int(6, 99);
        game = { kind, c }; tray = [];
        q('#mn-game').innerHTML = `<p class="mn-ask">Make <b>${money$(c)}</b> on the counter.</p><div class="mn-check" aria-live="polite"></div>`;
      } else {
        const n = R.int(3, 7), set = Array.from({ length: n }, () => COINS[R.int(0, 3)][0]), c = set.reduce((t, k) => t + COIN[k][1], 0);
        game = { kind, c }; tray = set.slice();
        q('#mn-game').innerHTML = `<p class="mn-ask">How much money is on the counter?</p><form class="mn-form" id="mn-form"><label class="visually-hidden" for="mn-ans">Your answer in cents or dollars</label><input id="mn-ans" type="text" inputmode="decimal" placeholder="for example 47¢ or $1.25" autocomplete="off"><button class="btn sm primary" type="submit">Check</button></form><div class="mn-check" aria-live="polite"></div>`;
        q('#mn-total').hidden = true;
      }
      draw();
    }
    /** "47", "47¢", "47 cents", "$0.47", ".47", "1.25" → cents */
    const readCents = t => { t = String(t).trim().toLowerCase().replace(/\s+/g, ''); let m = /^(\d+)(¢|c|cents?)$/.exec(t); if (m) return Number(m[1]); m = /^\$?(\d*)\.(\d{2})$/.exec(t); if (m) return Number(m[1] || 0) * 100 + Number(m[2]); m = /^\$(\d+)$/.exec(t); if (m) return Number(m[1]) * 100; m = /^(\d+)$/.exec(t); return m ? Number(m[1]) : NaN; };
    wrap.addEventListener('submit', ev => {
      ev.preventDefault();
      if (!game || game.kind !== 'count') return;
      const v = readCents(q('#mn-ans').value), box = q('#mn-game .mn-check');
      box.innerHTML = !Number.isFinite(v) ? '<p class="small">Type an amount, like 47¢ or $1.25.</p>' : v === game.c ? `<p class="feedback good">Yes: ${money$(game.c)}. Counting the biggest coins first makes it quicker.</p>` : `<p class="small">Not quite. Start with the quarters, then the dimes, nickels and pennies.</p>`;
      if (v === game.c) { q('#mn-total').hidden = false; draw(); if (window.BADGES) BADGES.flag('money'); }
    });
    wrap.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b || !wrap.contains(b)) return;
      if (b.dataset.add) { if (tray.length < 60) tray.push(b.dataset.add); if (game && game.kind === 'count') { game = null; q('#mn-game').innerHTML = ''; q('#mn-total').hidden = false; } draw(); }
      else if (b.dataset.off !== undefined) { tray.splice(Number(b.dataset.off), 1); draw(); }
      else if (b.id === 'mn-clear') { tray = []; if (game && game.kind === 'count') { game = null; q('#mn-game').innerHTML = ''; } q('#mn-total').hidden = false; draw(); }
      else if (b.id === 'mn-make') newGame('make');
      else if (b.id === 'mn-count') newGame('count');
    });
    draw();
    H.tutorCtx({ notes: 'The student is on the money counting tool: US coins and bills on a counter, with a running total.' });
  }

  const PERCENT = { page, solve, MODES, cash, receipt, ratios, money, fRead, fShow, fewest };
  window.PERCENT = PERCENT;
})();
