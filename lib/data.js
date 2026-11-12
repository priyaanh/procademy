/* Data and statistics (#/data, #/data/<link>): type or paste a list of numbers, or two lists to compare,
   and see the centre and the spread worked out (mean, median, mode, range, quartiles, IQR, MAD, and
   outliers by the 1.5 × IQR rule), with the data drawn four ways on one scale: a dot plot, a box plot, a
   histogram and a stem-and-leaf plot (back to back for two sets). Quartiles are the medians of the lower
   and upper halves, leaving out the middle value when the count is odd, as Procademy's lessons and CPM do.
   Two sets are compared the CPM Course 2 way: by their centres, their spreads, and how many MADs apart
   their means are. The link (#/data/…) carries the lists, so a set can be shared. */
'use strict';
(function () {
  const V = window.VIEWS, H = V._h, esc = H.esc;
  const MAXN = 1000;
  const COL = ['var(--vz1)', 'var(--vz5)'];
  const EXAMPLES = [
    ['Minutes of reading in a day', { a: '20 35 15 40 25 30 45 10 30 60 25 30', an: 'Minutes' }],
    ['Two classes’ quiz scores', { a: '72 85 90 66 88 79 95 81 70 84 77 91 83', an: 'Class A', b: '65 70 58 74 81 69 77 62 73 68 90 71 66', bn: 'Class B' }],
    ['Plant heights (cm)', { a: '12.5 14.1 13.2 15.0 11.8 13.7 14.4 12.9 13.3 16.2 13.8 12.4', an: 'Heights' }],
    ['Long jumps, with an outlier', { a: '310 325 298 340 315 330 305 322 318 450', an: 'Jumps (cm)' }],
  ];

  /** numbers from text: spaces, commas, semicolons or new lines between them */
  function read(text) {
    const vals = [], bad = [];
    String(text || '').replace(/[−–]/g, '-').split(/[\s,;]+/).filter(Boolean).forEach(t => {
      if (/^-?(\d+\.?\d*|\.\d+)$/.test(t)) vals.push(Number(t)); else bad.push(t);
    });
    return { vals: vals.slice(0, MAXN), bad, cut: vals.length > MAXN };
  }
  const median = a => { const m = a.length; return m % 2 ? a[(m - 1) / 2] : (a[m / 2 - 1] + a[m / 2]) / 2; };
  function stats(xs) {
    const s = [...xs].sort((a, b) => a - b), n = s.length;
    const sum = s.reduce((a, b) => a + b, 0), mean = sum / n;
    const half = Math.floor(n / 2), lower = s.slice(0, half), upper = s.slice(n - half);
    const q1 = n > 1 ? median(lower) : s[0], q3 = n > 1 ? median(upper) : s[0], iqr = q3 - q1;
    const counts = new Map();
    s.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
    const top = Math.max(...counts.values());
    const modes = top > 1 ? [...counts].filter(([, c]) => c === top).map(([v]) => v) : [];
    const mad = s.reduce((a, v) => a + Math.abs(v - mean), 0) / n;
    const lo = q1 - 1.5 * iqr, hi = q3 + 1.5 * iqr, inside = s.filter(v => v >= lo - 1e-9 && v <= hi + 1e-9);
    return { s, n, sum, mean, median: median(s), q1, q3, iqr, min: s[0], max: s[n - 1], range: s[n - 1] - s[0], modes, top, mad, lower, upper, lo, hi, outliers: s.filter(v => !inside.includes(v)), wlo: inside[0], whi: inside[inside.length - 1] };
  }
  const placesOf = v => { const t = String(v).split('.')[1]; return t ? t.length : 0; };
  /** a number for display: exact to the data's own decimal places (at least 2), else rounded with ≈ */
  function fmt(x, dp) {
    const r = Math.round(x * 1e9) / 1e9, keep = Math.max(2, dp || 0);
    const t = (Math.abs(r) >= 1000 ? r.toLocaleString('en-US', { maximumFractionDigits: 10 }) : String(r)).replace('-', '−');
    return placesOf(r) <= keep ? t : '≈ ' + (Math.round(x * 10 ** keep) / 10 ** keep).toLocaleString('en-US', { maximumFractionDigits: keep }).replace('-', '−');
  }
  function niceStep(span, want) {
    const raw = span / (want || 8), p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
  }
  const fix = v => Math.round(v * 1e9) / 1e9;

  // ---- pictures (one shared scale for every set)
  function scale(sets) {
    let lo = Math.min(...sets.map(x => x.min)), hi = Math.max(...sets.map(x => x.max));
    if (lo === hi) { lo -= 1; hi += 1; }
    const step = niceStep(hi - lo), a = Math.floor(lo / step) * step, b = Math.ceil(hi / step) * step;
    const W = 360, L = 16, R = 16, X = v => L + (W - L - R) * (v - a) / (b - a);
    const ticks = [];
    for (let t = a; t <= b + step / 2; t += step) ticks.push(fix(t));
    return { a, b, W, X, ticks, step };
  }
  const axis = (sc, y) => `<line x1="${sc.X(sc.a)}" x2="${sc.X(sc.b)}" y1="${y}" y2="${y}" class="dt-axis"/>${sc.ticks.map((t, i) => `<line x1="${sc.X(t)}" x2="${sc.X(t)}" y1="${y}" y2="${y + 4}" class="dt-axis"/>${sc.ticks.length > 9 && i % 2 ? '' : `<text x="${sc.X(t)}" y="${y + 16}" text-anchor="middle" class="ch-tick">${fix(t).toLocaleString('en-US')}</text>`}`).join('')}`;
  function dotPlot(sets, names, sc) {
    let y = 0, body = '';
    sets.forEach((st, k) => {
      const stack = new Map();
      st.s.forEach(v => stack.set(v, (stack.get(v) || 0) + 1));
      const tall = Math.max(...stack.values()), r = Math.max(1.6, Math.min(5, 70 / tall / 2.2)), band = Math.max(40, tall * r * 2.2 + 22);
      body += `<text x="4" y="${y + 12}" class="dt-name">${esc(names[k])}</text>`;
      stack.forEach((c, v) => { for (let i = 0; i < c; i++) body += `<circle cx="${sc.X(v).toFixed(1)}" cy="${(y + band - 4 - r - i * r * 2.2).toFixed(1)}" r="${r.toFixed(1)}" style="fill:${COL[k]}"><title>${v}</title></circle>`; });
      y += band + 4;
    });
    return `<svg class="dt-plot" viewBox="0 0 ${sc.W} ${y + 22}" role="img" aria-label="Dot plot${sets.length > 1 ? 's' : ''}: one dot for each value">${body}${axis(sc, y)}</svg>`;
  }
  function boxPlot(sets, names, sc) {
    let y = 0, body = '';
    sets.forEach((st, k) => {
      const m = y + 34, X = v => sc.X(v).toFixed(1);
      body += `<text x="4" y="${y + 12}" class="dt-name">${esc(names[k])}</text>
        <line x1="${X(st.wlo)}" x2="${X(st.q1)}" y1="${m}" y2="${m}" class="dt-whisk"/><line x1="${X(st.q3)}" x2="${X(st.whi)}" y1="${m}" y2="${m}" class="dt-whisk"/>
        <line x1="${X(st.wlo)}" x2="${X(st.wlo)}" y1="${m - 8}" y2="${m + 8}" class="dt-whisk"/><line x1="${X(st.whi)}" x2="${X(st.whi)}" y1="${m - 8}" y2="${m + 8}" class="dt-whisk"/>
        <rect x="${X(st.q1)}" y="${m - 13}" width="${Math.max(1, sc.X(st.q3) - sc.X(st.q1)).toFixed(1)}" height="26" class="dt-box" style="fill:${COL[k]}"/>
        <line x1="${X(st.median)}" x2="${X(st.median)}" y1="${m - 13}" y2="${m + 13}" class="dt-med"/>
        ${st.outliers.map(v => `<circle cx="${X(v)}" cy="${m}" r="4" class="dt-outlier"><title>Outlier: ${v}</title></circle>`).join('')}`;
      y += 58;
    });
    return `<svg class="dt-plot" viewBox="0 0 ${sc.W} ${y + 22}" role="img" aria-label="Box plot${sets.length > 1 ? 's' : ''}: minimum, Q1, median, Q3 and maximum${sets.some(s => s.outliers.length) ? ', with outliers as open circles' : ''}">${body}${axis(sc, y)}</svg>`;
  }
  function bins(sets, w, start) {
    const hi = Math.max(...sets.map(s => s.max)), edges = [];
    for (let e = start; edges.length < 61 && (edges.length < 2 || edges[edges.length - 1] <= hi); e = fix(e + w)) edges.push(e);
    const counts = sets.map(st => edges.slice(0, -1).map((e, i) => st.s.filter(v => v >= e - 1e-9 && (i === edges.length - 2 ? v <= edges[i + 1] + 1e-9 : v < edges[i + 1] - 1e-9)).length));
    return { edges, counts };
  }
  function histogram(sets, names, hb) {
    const { edges, counts } = hb, W = 360, L = 30, R = 10, n = edges.length - 1;
    const X = i => L + (W - L - R) * i / n;
    return counts.map((cs, k) => {
      const top = Math.max(1, ...cs), step = niceStep(top, 4) >= 1 ? niceStep(top, 4) : 1, ymax = Math.ceil(top / step) * step, Hh = 150, Y = c => 18 + (Hh - 18) * (1 - c / ymax);
      const grid = []; for (let c = 0; c <= ymax; c += step) grid.push(c);
      return `<svg class="dt-plot" viewBox="0 0 ${W} ${Hh + 22}" role="img" aria-label="Histogram of ${esc(names[k])}: ${cs.map((c, i) => `${edges[i]} to ${edges[i + 1]}: ${c}`).join('; ')}">
        ${sets.length > 1 ? `<text x="${L}" y="11" class="dt-name">${esc(names[k])}</text>` : ''}
        ${grid.map(c => `<line x1="${L}" x2="${W - R}" y1="${Y(c).toFixed(1)}" y2="${Y(c).toFixed(1)}" class="ch-grid"/><text x="${L - 4}" y="${(Y(c) + 4).toFixed(1)}" text-anchor="end" class="ch-tick">${c}</text>`).join('')}
        ${cs.map((c, i) => c ? `<rect x="${X(i).toFixed(1)}" y="${Y(c).toFixed(1)}" width="${(X(i + 1) - X(i)).toFixed(1)}" height="${(Y(0) - Y(c)).toFixed(1)}" class="dt-bar" style="fill:${COL[k]}"><title>${edges[i]} to ${edges[i + 1]}: ${c}</title></rect>` : '').join('')}
        ${edges.map((e, i) => (n > 10 && i % 2) ? '' : `<text x="${X(i).toFixed(1)}" y="${Hh + 16}" text-anchor="middle" class="ch-tick">${e.toLocaleString('en-US')}</text>`).join('')}</svg>`;
    }).join('');
  }
  /** stem-and-leaf: whole numbers (stem = tens) or numbers with one decimal place (stem = ones), none negative */
  function stemLeaf(sets, names) {
    const all = sets.flatMap(s => s.s), dp = Math.max(...all.map(placesOf));
    if (dp > 1 || all.some(v => v < 0)) return { why: 'A stem-and-leaf plot needs numbers that aren’t negative, with at most one decimal place.' };
    const k = dp ? 10 : 1, iv = v => Math.round(v * k);
    const lo = Math.floor(Math.min(...all.map(iv)) / 10), hi = Math.floor(Math.max(...all.map(iv)) / 10);
    if (hi - lo > 40) return { why: 'These numbers are too spread out for a stem-and-leaf plot (more than 40 stems).' };
    const rows = [];
    for (let st = lo; st <= hi; st++) rows.push([st, ...sets.map(s => s.s.filter(v => Math.floor(iv(v) / 10) === st).map(v => iv(v) % 10))]);
    const ex = sets[0].s[Math.floor(sets[0].n / 2)], exs = Math.floor(iv(ex) / 10), exl = iv(ex) % 10;
    const key = `${exs} | ${exl} means ${dp ? `${exs}.${exl}` : `${exs}${exl}`}`;
    if (sets.length === 1) return { key, html: `<table class="dt-stem"><thead><tr><th>Stem</th><th>Leaves</th></tr></thead><tbody>${rows.map(([s, a]) => `<tr><td class="dt-st">${s}</td><td>${a.join(' ')}</td></tr>`).join('')}</tbody></table>` };
    return { key, html: `<table class="dt-stem two"><thead><tr><th class="r">${esc(names[0])}</th><th>Stem</th><th>${esc(names[1])}</th></tr></thead><tbody>${rows.map(([s, a, b]) => `<tr><td class="r">${[...a].reverse().join(' ')}</td><td class="dt-st">${s}</td><td>${b.join(' ')}</td></tr>`).join('')}</tbody></table>` };
  }

  // ---- words
  function shape(st) {
    if (st.n < 5 || !st.range) return '';
    const d = st.mean - st.median;
    if (Math.abs(d) < 0.08 * st.range) return 'The mean and the median are close: the data are roughly <b>symmetric</b>.';
    return d > 0 ? 'The mean is above the median: a few high values raise it, so the data are <b>skewed right</b> (a tail to the right).' : 'The mean is below the median: a few low values lower it, so the data are <b>skewed left</b> (a tail to the left).';
  }
  function worked(st, dp, name) {
    const f = x => fmt(x, dp), list = (a, cls) => a.map((v, i) => `<span class="nm-chip${cls ? cls(i) : ''}">${v.toLocaleString('en-US', { maximumFractionDigits: 10 })}</span>`).join('');
    const n = st.n, mid = n % 2 ? [(n - 1) / 2] : [n / 2 - 1, n / 2];
    const sumTxt = n <= 12 ? st.s.map(v => String(v).replace('-', '−')).join(' + ') + ' = ' + f(st.sum) : f(st.sum);
    return `<details class="dt-how"${name ? '' : ' open'}><summary><b>How each one is found${name ? ': ' + esc(name) : ''}</b></summary>
      ${n <= 80 ? `<p class="small" style="margin:8px 0 4px">In order (the middle ${mid.length === 1 ? 'value is' : 'two values are'} highlighted):</p><div class="nm-list">${list(st.s, i => (mid.includes(i) ? ' best' : ''))}</div>` : ''}
      <ul class="nm-facts">
        <li><b>Mean</b> = the sum ÷ the number of values: ${sumTxt}, and ${f(st.sum)} ÷ ${n} = <b>${f(st.mean)}</b>.</li>
        <li><b>Median</b> = the middle value${mid.length === 2 ? `s’ mean: (${f(st.s[mid[0]])} + ${f(st.s[mid[1]])}) ÷ 2 = <b>${f(st.median)}</b>` : `: value number ${mid[0] + 1} of ${n} is <b>${f(st.median)}</b>`}.</li>
        <li><b>Mode</b>: ${st.modes.length ? `${st.modes.map(f).join(' and ')} (${st.top} times each)` : 'none, because no value occurs more than once'}.</li>
        <li><b>Range</b> = largest − smallest = ${f(st.max)} − ${f(st.min)} = <b>${f(st.range)}</b>.</li>
        ${n > 1 ? `<li><b>Q1</b> = median of the lower half${n % 2 ? ' (the middle value left out)' : ''}${st.lower.length <= 20 ? `: ${st.lower.map(f).join(', ')}` : ''} → <b>${f(st.q1)}</b>. <b>Q3</b> = median of the upper half${st.upper.length <= 20 ? `: ${st.upper.map(f).join(', ')}` : ''} → <b>${f(st.q3)}</b>.</li>
        <li><b>IQR</b> = Q3 − Q1 = ${f(st.q3)} − ${f(st.q1)} = <b>${f(st.iqr)}</b>: the middle half of the data spans this much.</li>` : ''}
        <li><b>MAD</b> (mean absolute deviation) = the mean distance from the mean${n <= 15 ? `: the distances are ${st.s.map(v => f(Math.abs(v - st.mean)).replace('≈ ', '')).join(', ')}, and their mean is` : ' ='} <b>${f(st.mad)}</b>.</li>
        ${n > 3 ? `<li><b>Outliers</b> are below Q1 − 1.5 × IQR = ${f(st.lo)} or above Q3 + 1.5 × IQR = ${f(st.hi)}: ${st.outliers.length ? `<b>${st.outliers.map(f).join(', ')}</b>` : 'none'}.</li>` : ''}
      </ul>${shape(st) ? `<p class="small" style="margin:6px 0 0">${shape(st)}</p>` : ''}</details>`;
  }
  function compare(A, B, na, nb, dp) {
    const f = x => fmt(x, dp), big = Math.max(A.mad, B.mad), gap = Math.abs(A.mean - B.mean), k = big ? gap / big : 0;
    const hiC = A.median === B.median ? null : A.median > B.median ? na : nb;
    const spread = Math.abs(A.iqr - B.iqr) < 1e-9 ? 'Their IQRs are the same.' : `${esc(A.iqr > B.iqr ? na : nb)} is more spread out in the middle (IQR ${f(Math.max(A.iqr, B.iqr))} against ${f(Math.min(A.iqr, B.iqr))}).`;
    return `<div class="card"><h2>Comparing the two sets</h2><ul class="nm-facts">
      <li><b>Center:</b> ${hiC ? `${esc(hiC)} has the higher median (${f(Math.max(A.median, B.median))} against ${f(Math.min(A.median, B.median))}).` : `the medians are the same (${f(A.median)}).`}</li>
      <li><b>Spread:</b> ${spread}</li>
      ${big ? `<li><b>How far apart:</b> the means are ${f(gap).replace('≈ ', '')} apart, and the larger MAD is ${f(big).replace('≈ ', '')}, so the means are about <b>${(Math.round(k * 10) / 10).toLocaleString('en-US')} MADs</b> apart. ${k >= 2 ? 'That is a large gap: the two groups are clearly different.' : k >= 1 ? 'The groups overlap considerably, but the difference is probably real.' : 'Less than one MAD: the groups overlap substantially, so the difference may be due to chance.'}</li>` : ''}
    </ul></div>`;
  }

  // ---- the page
  /** columns of numbers pasted from a spreadsheet (tabs, or commas between the cells): [{ name, text }] for each column
      that is mostly numbers, with a header row as its name; null when it is just a list */
  function columns(text) {
    const rows = String(text || '').split(/\r?\n/).map(r => r.replace(/\s+$/, '')).filter(r => r.trim());
    if (rows.length < 2) return null;
    const tabbed = rows.some(r => /\t/.test(r));
    if (!tabbed && !rows.every(r => /,/.test(r))) return null;
    const cells = rows.map(r => (tabbed ? r.split('\t') : r.split(',')).map(c => c.trim()));
    const num = c => /^[-−]?\$?(\d{1,3}(,\d{3})+|\d+)?(\.\d+)?%?$/.test(c) && /\d/.test(c);
    const width = Math.max(...cells.map(r => r.length));
    if (width < 2) return null;
    const head = cells[0].some(c => c && !num(c)) && cells.slice(1).some(r => r.some(num)) ? cells.shift() : null;
    const out = [];
    for (let k = 0; k < width && out.length < 2; k++) {
      const col = cells.map(r => r[k] || '').filter(Boolean);
      if (col.length && col.filter(num).length >= col.length * 0.8) out.push({ name: head && head[k] ? head[k].slice(0, 30) : '', text: col.filter(num).map(c => c.replace(/[$,%]/g, '').replace('−', '-')).join(' ') });
    }
    return out.length ? out : null;
  }
  /** histogram bar widths to choose from: 1, 2, 5, 10, 20… from about 30 bars down to 2 */
  function widths(span) {
    const out = [], lo = Math.max(span / 30, 1e-6);
    for (let p = Math.floor(Math.log10(lo)) - 1; out.length < 40; p++) for (const m of [1, 2, 5]) { const w = fix(m * Math.pow(10, p)); if (w >= lo && span / w >= 1.5) out.push(w); else if (span / w < 1.5) return out; }
    return out;
  }
  function page(root, code) {
    const mem = V.tools && V.tools.pref ? V.tools.pref('data') : {};
    let init = typeof mem.a === 'string' && mem.a.trim() ? { a: mem.a.slice(0, 8000), an: String(mem.an || 'Set A').slice(0, 30), b: typeof mem.b === 'string' ? mem.b.slice(0, 8000) : undefined, bn: String(mem.bn || 'Set B').slice(0, 30) } : { a: EXAMPLES[0][1].a, an: EXAMPLES[0][1].an };
    if (code && window.DRAW) {
      try {
        const o = JSON.parse(DRAW.decode(code) || 'null');
        if (o && typeof o.a === 'string') init = { a: o.a.slice(0, 8000), an: String(o.an || 'Set A').slice(0, 30), b: typeof o.b === 'string' ? o.b.slice(0, 8000) : undefined, bn: String(o.bn || 'Set B').slice(0, 30) };
      } catch (e) { /* a broken link: start with the example */ }
    }
    let binW = null, binStart = null, tab = 'dot';
    root.innerHTML = `<div class="dt-page">
      <div class="card">
        <h1>Data and statistics</h1>
        <p class="muted small" style="margin:4px 0 12px">Enter or paste numbers, separated by spaces or commas, to see the mean, median, mode and spread, and four kinds of plots. Columns copied from a spreadsheet work too.</p>
        ${V.tools && V.tools.how ? V.tools.how('data') : ''}
        <div class="dt-sets">
          <div class="dt-set"><input class="dt-name-in" id="dt-an" maxlength="30" aria-label="Name of the first set" value="${esc(init.an || 'Set A')}"><textarea id="dt-a" rows="3" aria-label="The first set of numbers" spellcheck="false">${esc(init.a)}</textarea></div>
          <div class="dt-set" id="dt-bbox"${init.b === undefined ? ' hidden' : ''}><div class="row between"><input class="dt-name-in" id="dt-bn" maxlength="30" aria-label="Name of the second set" value="${esc(init.bn || 'Set B')}"><button type="button" class="btn sm ghost" id="dt-drop" aria-label="Remove the second set">✕</button></div><textarea id="dt-b" rows="3" aria-label="The second set of numbers" spellcheck="false">${esc(init.b || '')}</textarea></div>
        </div>
        <div class="btn-row" style="margin-top:10px"><button type="button" class="btn sm" id="dt-add"${init.b !== undefined ? ' hidden' : ''}>Compare with a second set</button>
          <label class="small">Example <select id="dt-ex"><option value="">Choose…</option>${EXAMPLES.map(([t], i) => `<option value="${i}">${esc(t)}</option>`).join('')}</select></label></div>
      </div>
      <div id="dt-out" class="dt-out"></div>
    </div>`;
    const wrap = root.querySelector('.dt-page'), out = root.querySelector('#dt-out');
    const q = s => root.querySelector(s);

    function draw() {
      const useB = !q('#dt-bbox').hidden;
      const names = [q('#dt-an').value.trim() || 'Set A', q('#dt-bn').value.trim() || 'Set B'];
      const raw = [read(q('#dt-a').value), useB ? read(q('#dt-b').value) : null].filter(Boolean);
      const problems = raw.map((r, k) => (r.bad.length ? `${esc(names[k])}: “${esc(r.bad.slice(0, 3).join('”, “'))}” ${r.bad.length === 1 ? 'isn’t a number' : 'aren’t numbers'}, so ${r.bad.length === 1 ? 'it was' : 'they were'} left out.` : '') + (r.cut ? ` Only the first ${MAXN} numbers are used.` : '')).filter(Boolean);
      const live = raw.map((r, k) => ({ r, k })).filter(x => x.r.vals.length);
      root.__data = { sets: [] };
      if (!live.length) { out.innerHTML = `<div class="card"><p class="muted" style="margin:0">Enter some numbers above, such as your test scores, to begin.</p>${problems.length ? `<p class="cx-err">${problems.join(' ')}</p>` : ''}</div>`; return; }
      const sets = live.map(x => stats(x.r.vals)), nm = live.map(x => names[x.k]);
      const dp = Math.max(...sets.flatMap(s => s.s.map(placesOf)));
      const sc = scale(sets);
      const span = Math.max(...sets.map(s => s.max)) - Math.min(...sets.map(s => s.min));
      const w = binW > 0 ? binW : niceStep(span || 1, 6), lo = Math.min(...sets.map(s => s.min));
      const start = binStart !== null && binStart <= lo ? binStart : fix(Math.floor(lo / w) * w);
      const hb = bins(sets, w, start), sl = stemLeaf(sets, nm);
      const ws = widths(span || 1).reverse(), wi = Math.max(0, ws.findIndex(x => x <= w + 1e-12) < 0 ? ws.length - 1 : ws.findIndex(x => x <= w + 1e-12));      // wide to narrow: the slider adds bars
      const rowsT = [['Count', s => s.n.toLocaleString('en-US')], ['Mean', s => fmt(s.mean, dp)], ['Median', s => fmt(s.median, dp)], ['Mode', s => (s.modes.length ? s.modes.map(v => fmt(v, dp)).join(', ') : 'none')], ['Range', s => fmt(s.range, dp)],
        ['Minimum', s => fmt(s.min, dp)], ['Q1', s => fmt(s.q1, dp)], ['Q3', s => fmt(s.q3, dp)], ['Maximum', s => fmt(s.max, dp)], ['IQR', s => fmt(s.iqr, dp)], ['MAD', s => fmt(s.mad, dp)], ['Outliers', s => (s.outliers.length ? s.outliers.map(v => fmt(v, dp)).join(', ') : 'none')]];
      const TABS = [['dot', 'Dot plot'], ['box', 'Box plot'], ['hist', 'Histogram'], ['stem', 'Stem-and-leaf']];
      out.innerHTML = `${problems.length ? `<div class="card"><p class="cx-err" style="margin:0">${problems.join(' ')}</p></div>` : ''}
        <div class="card"><h2>Summary</h2><div class="table-wrap"><table class="ch-table dt-sum"><thead><tr><th></th>${nm.map((t, k) => `<th><span class="ch-swatch" style="background:${COL[k]}" aria-hidden="true"></span> ${esc(t)}</th>`).join('')}</tr></thead>
          <tbody>${rowsT.map(([l, g]) => `<tr><td>${l}</td>${sets.map(s => `<td>${g(s)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>
        <div class="card"><div class="dt-tabs" role="tablist">${TABS.map(([k, l]) => `<button type="button" role="tab" class="chip-btn${tab === k ? ' on' : ''}" aria-selected="${tab === k}" data-tab="${k}">${l}</button>`).join('')}</div>
          <div class="dt-pane"${tab === 'dot' ? '' : ' hidden'} data-pane="dot">${dotPlot(sets, nm, sc)}<p class="tiny muted" style="margin:4px 0 0">Each dot is one value. Stacks show values that occur more than once.</p></div>
          <div class="dt-pane"${tab === 'box' ? '' : ' hidden'} data-pane="box">${boxPlot(sets, nm, sc)}<p class="tiny muted" style="margin:4px 0 0">The box runs from Q1 to Q3 with a line at the median; the whiskers reach the smallest and largest values that aren’t outliers. Each part holds about a quarter of the data.</p></div>
          <div class="dt-pane"${tab === 'hist' ? '' : ' hidden'} data-pane="hist"><div class="dt-binrow">${ws.length > 1 ? `<label class="small dt-wslide">Bars <input id="dt-wr" type="range" min="0" max="${ws.length - 1}" step="1" value="${wi}" aria-valuetext="${hb.counts[0].length} bars, each ${fix(w)} wide"><span class="tiny muted">${hb.counts[0].length} bar${hb.counts[0].length === 1 ? '' : 's'}</span></label>` : ''}<label class="small">Bar width <input id="dt-w" type="number" min="0" step="any" value="${fix(w)}"></label><label class="small">Start at <input id="dt-s" type="number" step="any" value="${fix(start)}"></label></div>${histogram(sets, nm, hb)}<p class="tiny muted" style="margin:4px 0 0">Each bar counts the values from its left edge up to, but not including, its right edge.</p></div>
          <div class="dt-pane"${tab === 'stem' ? '' : ' hidden'} data-pane="stem">${sl.html ? `<div class="table-wrap">${sl.html}</div><p class="tiny muted" style="margin:6px 0 0">Key: ${sl.key}.${sets.length > 1 ? ' The first set’s leaves read leftwards from the stem.' : ''}</p>` : `<p class="muted small" style="margin:0">${sl.why}</p>`}</div>
        </div>
        ${sets.length === 2 ? compare(sets[0], sets[1], nm[0], nm[1], dp) : ''}
        <div class="card">${sets.map((s, k) => worked(s, dp, sets.length > 1 ? nm[k] : '')).join('')}</div>`;
      root.__data = { sets: sets.map((s, k) => ({ name: nm[k], n: s.n, mean: s.mean, median: s.median, modes: s.modes, q1: s.q1, q3: s.q3, iqr: s.iqr, mad: s.mad, range: s.range, outliers: s.outliers })), bins: hb.counts[0].length, binWidth: w, stem: !!sl.html };
      if (sets.some(s => s.n >= 10) && window.BADGES) BADGES.flag('data');
      H.tutorCtx({ notes: `The student is on the data and statistics tool. ${sets.map((s, k) => `${nm[k]}: ${s.n} values, mean ${fmt(s.mean, dp)}, median ${fmt(s.median, dp)}, Q1 ${fmt(s.q1, dp)}, Q3 ${fmt(s.q3, dp)}, IQR ${fmt(s.iqr, dp)}, MAD ${fmt(s.mad, dp)}`).join('; ')}.` });
    }
    function link() {
      const o = { a: q('#dt-a').value, an: q('#dt-an').value };
      if (!q('#dt-bbox').hidden) { o.b = q('#dt-b').value; o.bn = q('#dt-bn').value; }
      if (V.tools && V.tools.pref) V.tools.pref('data', { a: o.a.slice(0, 8000), an: o.an, b: o.b === undefined ? null : o.b.slice(0, 8000), bn: o.bn || null });
      if (!window.DRAW) return;
      try { history.replaceState(null, '', '#/data/' + DRAW.encode(JSON.stringify(o))); } catch (e) { /* a very long list: keep the old link */ }
    }
    let t = null;
    wrap.addEventListener('input', ev => {
      if (ev.target.id === 'dt-w' || ev.target.id === 'dt-s' || ev.target.id === 'dt-wr') return;
      clearTimeout(t); t = setTimeout(() => { draw(); link(); }, 200);
    });
    // a table pasted from a spreadsheet: each column of numbers goes in its own set, its header as the name
    wrap.addEventListener('paste', ev => {
      const box = ev.target; if (box.id !== 'dt-a' && box.id !== 'dt-b') return;
      const cols = columns(ev.clipboardData && ev.clipboardData.getData('text'));
      if (!cols) return;
      ev.preventDefault();
      const into = box.id === 'dt-b' ? ['b'] : cols.length > 1 ? ['a', 'b'] : ['a'];
      into.forEach((k, i) => { q('#dt-' + k).value = cols[i].text; if (cols[i].name) q('#dt-' + k + 'n').value = cols[i].name; });
      if (into.includes('b')) { q('#dt-bbox').hidden = false; q('#dt-add').hidden = true; }
      binW = null; binStart = null;
      draw(); link();
      V.toast(cols.length > 1 && into.length > 1 ? `Two columns pasted: ${cols[0].name || 'Set A'} and ${cols[1].name || 'Set B'}.` : `A column of ${cols[0].text.split(' ').length} numbers pasted.`);
    });
    wrap.addEventListener('input', ev => {
      if (ev.target.id !== 'dt-wr') return;
      const sets = [read(q('#dt-a').value), q('#dt-bbox').hidden ? null : read(q('#dt-b').value)].filter(r => r && r.vals.length).map(r => r.vals);
      const all = [].concat(...sets), span = all.length ? Math.max(...all) - Math.min(...all) : 1, ws = widths(span || 1).reverse();
      binW = ws[Number(ev.target.value)] || null; binStart = null; draw();
      const r = q('#dt-wr'); if (r) r.focus();
    });
    wrap.addEventListener('change', ev => {
      const el = ev.target;
      if (el.id === 'dt-w') { const v = Number(el.value); binW = v > 0 ? v : null; binStart = null; return draw(); }
      if (el.id === 'dt-s') { const v = Number(el.value); binStart = el.value !== '' && Number.isFinite(v) ? v : null; return draw(); }
      if (el.id === 'dt-ex' && el.value !== '') {
        const ex = EXAMPLES[Number(el.value)][1];
        q('#dt-a').value = ex.a; q('#dt-an').value = ex.an;
        q('#dt-bbox').hidden = !ex.b; q('#dt-add').hidden = !!ex.b;
        q('#dt-b').value = ex.b || ''; q('#dt-bn').value = ex.bn || 'Set B';
        el.value = ''; binW = null; binStart = null;
        draw(); link();
      }
    });
    wrap.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b || !wrap.contains(b)) return;
      if (b.id === 'dt-add') { q('#dt-bbox').hidden = false; b.hidden = true; q('#dt-b').focus(); draw(); return; }
      if (b.id === 'dt-drop') { q('#dt-bbox').hidden = true; q('#dt-add').hidden = false; draw(); link(); return; }
      if (b.dataset.tab) { tab = b.dataset.tab; wrap.querySelectorAll('[data-tab]').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', String(x === b)); }); wrap.querySelectorAll('[data-pane]').forEach(p => { p.hidden = p.dataset.pane !== tab; }); }
    });
    draw();
  }

  const DATA = { page, stats, read, bins, EXAMPLES, columns, widths };
  window.DATA = DATA;
})();
