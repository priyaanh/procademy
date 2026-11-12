/* The probability simulator (#/chance): run an experiment once, 10, 100 or 1,000 times and compare what
   happens (experimental probability) with what should happen (theoretical probability), the way CPM
   Core Connections Course 2 does in chapters 1 and 5. A coin, two coins, a number cube, two number cubes
   (the sum), a spinner and a bag of marbles, the last two with your own sections or marbles. A chart
   shows the experimental probability of one outcome settling towards the theoretical one as the trials
   add up, and "Predict first" asks for a guess before 100 trials. Everything runs on this device. */
'use strict';
(function () {
  const V = window.VIEWS, H = V._h, esc = H.esc;
  const COLORS = ['var(--vz1)', 'var(--vz2)', 'var(--vz3)', 'var(--vz5)', 'var(--vz4)', 'var(--vz6)'];
  const NAMED = { red: 'var(--vz2)', blue: 'var(--vz1)', green: 'var(--vz3)', orange: 'var(--vz5)', purple: 'var(--vz4)', black: 'var(--vz6)', yellow: '#e8b50c', pink: '#e86fb0', gray: '#8b93a1', grey: '#8b93a1', brown: '#8a5a2b' };
  /** a section's colour: its name, if it is a colour ("Red" is red), or the next in the palette */
  const tint = (label, i) => NAMED[String(label || '').trim().toLowerCase()] || COLORS[i % COLORS.length];
  const DIE = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const frac = (n, d) => { if (!d) return '—'; const g = gcd(n, d) || 1; return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`; };
  const pct = x => (Math.round(x * 1000) / 10).toLocaleString() + '%';
  const nf = n => n.toLocaleString();

  const EXPS = {
    coin: { name: 'Flip a coin', fixed: [['Heads', 1], ['Tails', 1]] },
    coins2: { name: 'Flip two coins', fixed: [['2 heads', 1], ['One of each', 2], ['2 tails', 1]] },
    die: { name: 'Roll a number cube', fixed: [1, 2, 3, 4, 5, 6].map(n => [String(n), 1]) },
    dice: { name: 'Roll two number cubes (find the sum)', fixed: Array.from({ length: 11 }, (_, k) => [String(k + 2), 6 - Math.abs(k + 2 - 7)]) },
    spinner: { name: 'Spin a spinner', edit: 'parts', start: [['Red', 2], ['Blue', 1], ['Green', 1]] },
    bag: { name: 'Draw a marble from a bag (then put it back)', edit: 'marbles', start: [['Red', 3], ['Blue', 2], ['Green', 5]] },
    coindie: { name: 'Flip a coin and roll a number cube', fixed: ['Heads', 'Tails'].flatMap(c => [1, 2, 3, 4, 5, 6].map(n => [`${c[0]}, ${n}`, 1])) },
    draw2: { name: 'Draw two marbles (without putting the first back)', edit: 'marbles' },
  };
  /** every ordered pair of colors for two draws without replacement, weighted by how many ways it can happen */
  const pairsOf = bag => bag.flatMap(([a, na]) => bag.map(([b, nb]) => [`${a} then ${b}`, a === b ? na * (na - 1) : na * nb])).filter(r => r[1] > 0);
  /** one trial: { i (which outcome), show (what it looked like) } */
  function trial(key, rows, rand) {
    if (key === 'dice') { const a = 1 + Math.floor(rand() * 6), b = 1 + Math.floor(rand() * 6); return { i: a + b - 2, show: [a, b] }; }
    if (key === 'coins2') { const a = rand() < 0.5, b = rand() < 0.5; return { i: 2 - (a + b), show: [a ? 'H' : 'T', b ? 'H' : 'T'] }; }
    if (key === 'coindie') { const c = rand() < 0.5 ? 0 : 1, d = 1 + Math.floor(rand() * 6); return { i: c * 6 + d - 1, show: [c ? 'T' : 'H', d] }; }
    const tot = rows.reduce((s, r) => s + r[1], 0);
    let x = rand() * tot, i = 0;
    while (i < rows.length - 1 && x >= rows[i][1]) { x -= rows[i][1]; i++; }
    return { i, show: x / rows[i][1] };          // where in its section (for the spinner's needle)
  }

  function page(root, startKey) {
    const mem = V.tools && V.tools.pref ? V.tools.pref('chance') : {};
    let key = EXPS[startKey] ? startKey : EXPS[mem.key] ? mem.key : 'spinner';           // opens on the experiment last used
    const own = { spinner: EXPS.spinner.start.map(r => r.slice()), bag: EXPS.bag.start.map(r => r.slice()) };
    let counts, n, seq, last, watch = 0, predicted = null;
    const bagOf = () => (key === 'draw2' ? own.bag : own[key]);           // the second draw uses the same bag
    const rows = () => EXPS[key].fixed || (key === 'draw2' ? (pairsOf(own.bag).length ? pairsOf(own.bag) : [['Add another marble', 1]]) : own[key]);
    const total = () => rows().reduce((s, r) => s + r[1], 0);
    root.innerHTML = `<div class="chance-page">
      <div class="card">
        <h1>Probability simulator</h1>
        <p class="muted small" style="margin:4px 0 12px">Run an experiment many times. Compare what happens (the <b>experimental</b> probability) with what should happen (the <b>theoretical</b> probability).</p>
        ${V.tools && V.tools.how ? V.tools.how('chance') : ''}
        <div class="ch-pick"><label for="ch-exp" class="small"><b>Experiment</b></label> <select id="ch-exp">${Object.entries(EXPS).map(([k, e]) => `<option value="${k}"${k === key ? ' selected' : ''}>${e.name}</option>`).join('')}</select></div>
        <div id="ch-edit"></div>
        <div class="ch-stage" id="ch-stage" aria-live="polite"></div>
        <div class="btn-row ch-run"><span class="small muted">Run the experiment:</span>${[1, 10, 100, 1000, 10000].map(k => `<button type="button" class="btn sm${k === 1 ? ' primary' : ''}" data-run="${k}">${k === 1 ? 'Once' : nf(k) + ' times'}</button>`).join('')}<button type="button" class="btn sm ghost" id="ch-reset">Reset</button></div>
      </div>
      <div class="card"><h2>Results</h2><div id="ch-results"></div></div>
      <div class="card" id="ch-space-card"><h2>Every possible outcome</h2><div id="ch-space"></div></div>
      <div class="card"><div class="row between" style="flex-wrap:wrap;gap:8px"><h2 style="margin:0">Experimental probability over time</h2><label class="small">Outcome <select id="ch-watch"></select></label></div><div id="ch-settle"></div></div>
      <div class="card"><h2>Make a prediction</h2><div id="ch-predict"></div></div>
    </div>`;
    const wrap = root.querySelector('.chance-page');            // listeners go here: root is shared by every page

    function reset() { counts = rows().map(() => 0); n = 0; seq = []; last = null; predicted = null; if (watch >= rows().length) watch = 0; drawAll(); }
    function run(k, quiet) {
      const R = rows(), hit = [];
      for (let t = 0; t < k; t++) { const r = trial(key, R, CHANCE.rand); counts[r.i]++; n++; if (seq.length < 20000) seq.push(r.i); last = r; hit.push(r.i); }
      if (n >= 1000 && window.BADGES) BADGES.flag('chance');
      if (!quiet) drawAll();
      return hit;
    }
    function drawEdit() {
      const e = EXPS[key], box = root.querySelector('#ch-edit');
      if (!e.edit) { box.innerHTML = ''; return; }
      box.innerHTML = `<div class="ch-rows"><div class="small muted">${key === 'spinner' ? 'The spinner’s sections, in equal parts (a section of 2 parts is twice as large as a section of 1):' : 'The marbles in the bag:'}</div>
        ${bagOf().map((r, i) => `<div class="ch-row"><span class="ch-swatch" style="background:${tint(r[0], i)}" aria-hidden="true"></span><input class="ch-label" data-row="${i}" value="${esc(r[0])}" maxlength="16" aria-label="Name ${i + 1}"><input class="ch-count" data-row="${i}" type="number" min="1" max="20" value="${r[1]}" aria-label="${e.edit} for ${esc(r[0])}"><span class="small muted">${e.edit}</span>${bagOf().length > 2 ? `<button type="button" class="btn sm ghost" data-del="${i}" aria-label="Remove ${esc(r[0])}">✕</button>` : ''}</div>`).join('')}
        ${bagOf().length < 6 ? `<button type="button" class="btn sm ghost" id="ch-add">Add ${key === 'spinner' ? 'a section' : 'a color'}</button>` : ''}</div>`;
    }
    function stage() {
      const R = rows(), tot = total();
      let pic = '';
      if (key === 'spinner') {
        let a0 = -90, paths = '';
        const pt = (deg, r) => [100 + r * Math.cos(deg * Math.PI / 180), 100 + r * Math.sin(deg * Math.PI / 180)].map(v => v.toFixed(2)).join(' ');
        R.forEach((r, i) => { const a1 = a0 + 360 * r[1] / tot; paths += R.length === 1 ? `<circle cx="100" cy="100" r="90" style="fill:${tint(r[0], i)}"/>` : `<path d="M100 100 L${pt(a0, 90)} A90 90 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${pt(a1, 90)} Z" style="fill:${tint(r[0], i)}" />`; a0 = a1; });
        let needle = -90;
        if (last) { const before = R.slice(0, last.i).reduce((s, r) => s + r[1], 0); needle = -90 + 360 * (before + last.show * R[last.i][1]) / tot; }
        pic = `<svg class="ch-spinner" viewBox="0 0 200 200" role="img" aria-label="A spinner${last ? ', landed on ' + esc(R[last.i][0]) : ''}">${paths}<circle cx="100" cy="100" r="90" class="ch-rim"/><line x1="100" y1="100" x2="${pt(needle, 78).split(' ')[0]}" y2="${pt(needle, 78).split(' ')[1]}" class="ch-needle"/><circle cx="100" cy="100" r="7" class="ch-hub"/></svg>`;
      } else if (key === 'bag') {
        const lit = last ? last.i : -1;
        pic = `<div class="ch-bag" role="img" aria-label="A bag of ${tot} marbles${last ? ', picked ' + esc(R[last.i][0]) : ''}">${R.map((r, i) => Array.from({ length: r[1] }, (_, k) => `<span class="ch-marble${i === lit && k === 0 ? ' lit' : ''}" style="background:${tint(r[0], i)}"></span>`).join('')).join('')}</div>`;
      } else if (key === 'coindie') {
        const f = last ? last.show : ['?', null];
        pic = `<div class="ch-dice"><span class="ch-coin${f[0] === 'T' ? ' tails' : ''}">${f[0]}</span><span class="ch-die" aria-label="${f[1] || 'not rolled yet'}">${f[1] ? DIE[f[1] - 1] : '?'}</span></div>`;
      } else if (key === 'draw2') {
        const lit = last ? R[last.i][0].split(' then ') : null;
        pic = `<div class="ch-bag" role="img" aria-label="A bag of ${own.bag.reduce((t, r) => t + r[1], 0)} marbles">${own.bag.map((r, i) => Array.from({ length: r[1] }, (_, k) => `<span class="ch-marble${lit && ((lit[0] === r[0] && k === 0) || (lit[1] === r[0] && k === (lit[0] === r[0] ? 1 : 0))) ? ' lit' : ''}" style="background:${tint(r[0], i)}"></span>`).join('')).join('')}</div>`;
      } else if (key === 'coin' || key === 'coins2') {
        const faces = !last ? (key === 'coin' ? ['?'] : ['?', '?']) : key === 'coin' ? [last.i === 0 ? 'H' : 'T'] : last.show;
        pic = `<div class="ch-coins">${faces.map(f => `<span class="ch-coin${f === 'T' ? ' tails' : ''}">${f}</span>`).join('')}</div>`;
      } else {
        const faces = !last ? (key === 'die' ? [null] : [null, null]) : key === 'die' ? [last.i + 1] : last.show;
        pic = `<div class="ch-dice">${faces.map(f => `<span class="ch-die" aria-label="${f || 'not rolled yet'}">${f ? DIE[f - 1] : '?'}</span>`).join(key === 'dice' ? '<span class="ch-plus">+</span>' : '')}</div>`;
      }
      const said = !last ? 'The experiment hasn’t been run yet.' : `Trial ${nf(n)}: <b>${esc(key === 'dice' ? `${last.show[0]} + ${last.show[1]} = ${R[last.i][0]}` : key === 'coins2' ? `${last.show.join(' ')} (${R[last.i][0]})` : R[last.i][0])}</b>`;
      root.querySelector('#ch-stage').innerHTML = `<div class="ch-pic">${pic}</div><div class="ch-said">${said}</div>`;
    }
    function results() {
      const R = rows(), tot = total();
      const top = Math.min(1, Math.ceil(Math.max(...R.map((r, i) => Math.max(r[1] / tot, n ? counts[i] / n : 0))) * 10 + 0.5) / 10);
      const W = Math.max(320, R.length * 56), Hh = 170, slot = (W - 40) / R.length, bw = Math.min(34, slot * 0.6);
      const y = p => 10 + (Hh - 40) * (1 - p / top);
      const bars = R.map((r, i) => { const x = 40 + slot * i + (slot - bw) / 2, e = n ? counts[i] / n : 0, th = r[1] / tot;
        return `<rect x="${x.toFixed(1)}" y="${y(e).toFixed(1)}" width="${bw.toFixed(1)}" height="${(y(0) - y(e)).toFixed(1)}" rx="3" style="fill:${key === 'spinner' || key === 'bag' ? tint(r[0], i) : 'var(--vz1)'}" opacity=".85"><title>${esc(r[0])}: ${pct(e)}</title></rect>
          <line x1="${(x - 6).toFixed(1)}" x2="${(x + bw + 6).toFixed(1)}" y1="${y(th).toFixed(1)}" y2="${y(th).toFixed(1)}" class="ch-theory"/>
          <text x="${(x + bw / 2).toFixed(1)}" y="${Hh - 14}" class="ch-tick" text-anchor="middle">${esc(r[0].length > 9 ? r[0].slice(0, 8) + '…' : r[0])}</text>`; }).join('');
      const grid = [0, top / 2, top].map(p => `<line x1="34" x2="${W}" y1="${y(p).toFixed(1)}" y2="${y(p).toFixed(1)}" class="ch-grid"/><text x="30" y="${(y(p) + 4).toFixed(1)}" class="ch-tick" text-anchor="end">${pct(p)}</text>`).join('');
      root.querySelector('#ch-results').innerHTML = `
        <div class="table-wrap"><table class="ch-table"><thead><tr><th>Outcome</th><th>Times</th><th>Experimental</th><th>Theoretical</th></tr></thead><tbody>
          ${R.map((r, i) => `<tr><td>${key === 'spinner' || key === 'bag' ? `<span class="ch-swatch" style="background:${tint(r[0], i)}" aria-hidden="true"></span> ` : ''}${esc(r[0])}</td><td>${nf(counts[i])}</td><td>${n ? `${nf(counts[i])}/${nf(n)} ≈ ${pct(counts[i] / n)}` : '—'}</td><td>${frac(r[1], tot)} ≈ ${pct(r[1] / tot)}</td></tr>`).join('')}
        </tbody><tfoot><tr><td>Total</td><td>${nf(n)}</td><td>${n ? '1' : '—'}</td><td>1</td></tr></tfoot></table></div>
        <svg class="ch-bars" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Bars: experimental probability of each outcome; lines: theoretical">${grid}${bars}</svg>
        <p class="tiny muted" style="margin:4px 0 0">Bars show the experimental probability; black lines show the theoretical probability. ${n < 100 ? 'With only a few trials, the two can differ widely.' : 'As the number of trials grows, the two usually move closer, although they rarely match exactly.'}</p>`;
    }
    function settle() {
      const R = rows(), tot = total(), sel = root.querySelector('#ch-watch');
      sel.innerHTML = R.map((r, i) => `<option value="${i}"${i === watch ? ' selected' : ''}>${esc(r[0])}</option>`).join('');
      const th = R[watch][1] / tot, box = root.querySelector('#ch-settle');
      if (seq.length < 2) { box.innerHTML = '<p class="muted small" style="margin:6px 0 0">Run the experiment a few hundred times to see the experimental probability of one outcome settle toward the theoretical probability.</p>'; return; }
      const W = 340, Hh = 170, step = Math.max(1, Math.floor(seq.length / 200)), pts = [];
      let hits = 0;
      seq.forEach((v, t) => { if (v === watch) hits++; if ((t + 1) % step === 0 || t === seq.length - 1) pts.push([t + 1, hits / (t + 1)]); });
      const X = t => 36 + (W - 44) * (t - 1) / Math.max(1, seq.length - 1), Y = p => 10 + (Hh - 34) * (1 - p);
      box.innerHTML = `<svg class="ch-line" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="The experimental probability of ${esc(R[watch][0])} after each trial">
          ${[0, 0.5, 1].map(p => `<line x1="34" x2="${W - 6}" y1="${Y(p)}" y2="${Y(p)}" class="ch-grid"/><text x="30" y="${Y(p) + 4}" class="ch-tick" text-anchor="end">${pct(p)}</text>`).join('')}
          <line x1="34" x2="${W - 6}" y1="${Y(th).toFixed(1)}" y2="${Y(th).toFixed(1)}" class="ch-theory dashed"/>
          <polyline points="${pts.map(([t, p]) => `${X(t).toFixed(1)},${Y(p).toFixed(1)}`).join(' ')}" class="ch-path"/>
          <text x="36" y="${Hh - 4}" class="ch-tick">1</text><text x="${W - 6}" y="${Hh - 4}" class="ch-tick" text-anchor="end">${nf(seq.length)} trials</text></svg>
        <p class="small" style="margin:4px 0 0">After ${nf(seq.length)} trials, <b>${esc(R[watch][0])}</b> occurred ${nf(counts[watch])} times: ${pct(counts[watch] / n)}. The theoretical probability is ${frac(R[watch][1], tot)} ≈ ${pct(th)} (the dashed line).</p>`;
    }
    function predict() {
      const R = rows(), tot = total(), box = root.querySelector('#ch-predict');
      const o = R[watch];
      box.innerHTML = `<p class="small" style="margin:0 0 8px">In 100 more trials, how many times will <b>${esc(o[0])}</b> occur? Enter a prediction, then run the trials. <span class="muted">(Change the outcome under “Experimental probability over time”.)</span></p>
        <div class="row" style="gap:8px;flex-wrap:wrap"><input id="ch-guess" inputmode="numeric" autocomplete="off" style="width:6em" aria-label="Your prediction"><button type="button" class="btn sm primary" id="ch-go">Run 100 trials</button></div>
        ${predicted ? `<div class="feedback note" style="margin-top:10px"><span>You predicted <b>${predicted.guess}</b>. The theoretical expectation is about <b>${+(100 * o[1] / tot).toFixed(1)}</b> (100 × ${frac(o[1], tot)}). The outcome occurred <b>${predicted.got}</b> times. ${Math.abs(predicted.got - 100 * o[1] / tot) <= 5 ? 'This is close to the theoretical value.' : 'This differs from the theoretical value, which is common with only 100 trials.'}</span></div>` : ''}`;
    }
    /** the sample space: a table of sums for two cubes, a tree for a coin and a cube, the multiplication for two draws */
    function space() {
      const box = root.querySelector('#ch-space'), card = root.querySelector('#ch-space-card'), R = rows(), w = R[watch] ? R[watch][0] : '';
      if (key === 'dice') {
        box.innerHTML = `<p class="small muted">36 equally likely rolls. The sums equal to <b>${esc(w)}</b> are shaded: ${R[watch][1]} of 36 = ${frac(R[watch][1], 36)}.</p>
          <div class="table-wrap"><table class="ch-table ch-space"><thead><tr><th>+</th>${[1, 2, 3, 4, 5, 6].map(b => `<th>${b}</th>`).join('')}</tr></thead><tbody>${[1, 2, 3, 4, 5, 6].map(a => `<tr><th>${a}</th>${[1, 2, 3, 4, 5, 6].map(b => `<td class="${String(a + b) === w ? 'on' : ''}">${a + b}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      } else if (key === 'coindie') {
        box.innerHTML = `<p class="small muted">A tree: 2 ways for the coin × 6 for the cube = 12 equally likely outcomes, each 1/12.</p>
          <div class="ch-tree">${['Heads', 'Tails'].map(c => `<div class="ch-branch"><b>${c}</b><span class="tiny muted">1/2</span><div class="ch-leaves">${[1, 2, 3, 4, 5, 6].map(n => `<span class="${`${c[0]}, ${n}` === w ? 'on' : ''}">${c[0]}, ${n}</span>`).join('')}</div></div>`).join('')}</div>`;
      } else if (key === 'draw2') {
        const T = own.bag.reduce((t, r) => t + r[1], 0), [a, b] = w.split(' then '), na = (own.bag.find(r => r[0] === a) || [0, 0])[1], nb = (own.bag.find(r => r[0] === b) || [0, 0])[1], nb2 = a === b ? nb - 1 : nb;
        box.innerHTML = `<p class="small">For <b>${esc(w)}</b>: the first draw is ${esc(a)} with probability ${na}/${T}. That marble stays out, so ${T - 1} are left and ${nb2} of them are ${esc(b)}: ${nb2}/${T - 1}.</p>
          <p class="small">Multiply: ${na}/${T} × ${nb2}/${T - 1} = ${na * nb2}/${T * (T - 1)} = ${frac(na * nb2, T * (T - 1))}. The second draw depends on the first: these are <b>dependent events</b>.</p>`;
      } else { card.hidden = true; return; }
      card.hidden = false;
    }
    function drawAll() { drawEdit(); stage(); results(); settle(); predict(); space(); root.__chance = { key, counts: counts.slice(), n, rows: rows().map(r => r.slice()), watch, predicted }; }

    wrap.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b || !wrap.contains(b)) return;
      if (b.dataset.run) return run(Number(b.dataset.run));
      if (b.dataset.del) { bagOf().splice(Number(b.dataset.del), 1); return reset(); }
      if (b.id === 'ch-add') { bagOf().push([['Yellow', 'Purple', 'Orange', 'Pink'].find(c => !bagOf().some(r => r[0] === c)) || 'New', 1]); return reset(); }
      if (b.id === 'ch-reset') return reset();
      if (b.id === 'ch-go') {
        const g = parseInt(root.querySelector('#ch-guess').value, 10);
        if (!(g >= 0 && g <= 100)) { root.querySelector('#ch-guess').focus(); return; }
        const hit = run(100, true);
        predicted = { guess: g, got: hit.filter(i => i === watch).length };
        return drawAll();
      }
    });
    wrap.addEventListener('change', ev => {
      const t = ev.target;
      if (t.id === 'ch-exp') { key = t.value; watch = 0; reset(); history.replaceState(null, '', '#/chance/' + key); if (V.tools && V.tools.pref) V.tools.pref('chance', { key }); return; }
      if (t.id === 'ch-watch') { watch = Number(t.value); settle(); predict(); space(); return; }
      if (t.classList.contains('ch-label')) { bagOf()[Number(t.dataset.row)][0] = t.value.trim().slice(0, 16) || 'Section'; return reset(); }
      if (t.classList.contains('ch-count')) { const v = Math.max(1, Math.min(20, Math.round(Number(t.value)) || 1)); bagOf()[Number(t.dataset.row)][1] = v; return reset(); }
    });
    reset();
    H.tutorCtx({ notes: 'The student is on the probability simulator, comparing experimental and theoretical probability (CPM Core Connections Course 2, chapters 1 and 5).' });
  }

  const CHANCE = { page, trial, EXPS, pairsOf, rand: Math.random };
  window.CHANCE = CHANCE;
})();
