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
      notes: ['Two discounts do not simply add: 20% off and then another 10% off is 0.8 × 0.9 = 0.72 of the price, which is 28% off, not 30%.',
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
    what: { name: 'What percent?', f: [['The part', 12], ['The whole', 80]], calc: whatPct, check: v => (v[1] <= 0 ? 'The whole must be more than 0.' : v[0] < 0 ? 'The part cannot be negative.' : '') },
    whole: { name: 'Find the whole', f: [['The part', 12], ['is this percent', 15, '%']], calc: wholeOf, check: v => (v[1] <= 0 ? 'The percent must be more than 0.' : v[0] < 0 ? 'The part cannot be negative.' : '') },
    sale: { name: 'Sale and discount', f: [['Price', 60, '$'], ['Percent off', 25, '%'], ['Sales tax', 0, '%']], calc: sale, check: v => (v[1] > 100 ? 'A discount cannot be more than 100%.' : v[2] > 100 ? 'Tax must be less than 100%.' : '') },
    bill: { name: 'Tip, tax and split', f: [['Bill', 48.5, '$'], ['Tip', 18, '%'], ['Tax', 0, '%'], ['People', 1]], calc: bill, check: v => (!whole(v[3]) || v[3] < 1 || v[3] > 100 ? 'The number of people must be a whole number from 1 to 100.' : v[1] > 100 || v[2] > 100 ? 'Use percents up to 100.' : '') },
    markup: { name: 'Markup', f: [['Cost', 40, '$'], ['Markup', 35, '%']], calc: markup },
    change: { name: 'Percent change', f: [['Original', 50], ['New', 65]], calc: change, check: v => (v[0] <= 0 ? 'The original amount must be more than 0.' : '') },
    interest: { name: 'Interest', f: [['Principal', 1000, '$'], ['Rate per year', 5, '%'], ['Years', 10]], calc: interest, check: v => (v[0] <= 0 ? 'The principal must be more than 0.' : v[1] > 100 ? 'Use a rate up to 100% a year.' : v[2] <= 0 || v[2] > 100 ? 'Use from 0 to 100 years.' : '') },
  };
  const GROUPS = [['Percent problems', ['of', 'what', 'whole', 'change']], ['Money', ['sale', 'bill', 'markup', 'interest']]];

  /** work out a mode from its numbers (for the page and the tests) */
  function solve(mode, vals) {
    const M = MODES[mode];
    if (!M) return { error: 'This question type does not exist.' };
    for (let i = 0; i < M.f.length; i++) {
      const v = vals[i];
      if (!Number.isFinite(v)) return { error: `Enter a number for ${M.f[i][0].toLowerCase()}.` };
      if (Math.abs(v) > 1e9) return { error: 'Use numbers up to 1,000,000,000.' };
      if (v < 0) return { error: `${M.f[i][0]} cannot be negative.` };
    }
    const bad = M.check && M.check(vals);
    return bad ? { error: bad } : M.calc(vals);
  }
  const read = s => Number(String(s).replace(/[$,%\s]/g, ''));

  function page(root, mode, code) {
    let m = MODES[mode] ? mode : 'of';
    const defaults = k => MODES[k].f.map(x => x[1]);
    let vals = defaults(m);
    if (code) String(code).split('_').forEach((p, i) => { const v = Number(p); if (i < vals.length && p !== '' && Number.isFinite(v)) vals[i] = v; });
    root.innerHTML = `<div class="sh-page pc-page">
      <div class="card">
        <h1>Percents and money</h1>
        <p class="muted small" style="margin:4px 0 10px">Percent problems, sales, tips, markups and interest. Every answer is drawn on a percent ruler and worked out step by step.</p>
        <div class="sh-kinds">${GROUPS.map(([g, keys]) => `<div class="sh-group"><span class="tiny muted">${g}</span><div class="sh-chips">${keys.map(x => `<button type="button" class="chip-btn${x === m ? ' on' : ''}" data-mode="${x}" aria-pressed="${x === m}">${MODES[x].name}</button>`).join('')}</div></div>`).join('')}</div>
      </div>
      <div class="card"><div id="pc-in"></div><div id="pc-fig" class="pc-fig"></div></div>
      <div id="pc-out" class="sh-out"></div>
    </div>`;
    const wrap = root.querySelector('.pc-page'), inBox = root.querySelector('#pc-in'), fig = root.querySelector('#pc-fig'), out = root.querySelector('#pc-out');
    let touched = false;
    function drawInputs() {
      const M = MODES[m];
      inBox.innerHTML = `<h2 style="margin:0 0 8px">${M.name}</h2><div class="sh-fields">${M.f.map(([label, , sym], i) => `<div class="sh-field"><label class="small" for="pc-f${i}">${label}</label><span class="pc-box${sym === '$' ? ' pre' : sym ? ' post' : ''}"${sym ? ` data-sym="${sym}"` : ''}><input id="pc-f${i}" type="text" inputmode="decimal" autocomplete="off" data-i="${i}" value="${raw(vals[i])}"></span></div>`).join('')}</div>`;
    }
    function render() {
      const r = solve(m, vals), M = MODES[m];
      root.__percent = Object.assign({ mode: m, vals: vals.slice() }, r.error ? { error: r.error } : r.hook);
      if (r.error) { fig.innerHTML = ''; out.innerHTML = `<div class="card"><p class="cx-err loud" style="margin:0">${esc(r.error)}</p></div>`; return; }
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

  const PERCENT = { page, solve, MODES, cash };
  window.PERCENT = PERCENT;
})();
