/* Units and scale (#/measure, #/measure/<tab>): changing units, and scale drawings and maps.
   - Units: length, area, volume, mass, time, speed and temperature, in US customary and metric units. Every
     answer shows the conversion fact (1 mile = 1.609344 kilometers) and the multiplication as a unit fraction,
     the way it is taught: 3 mi × 1.609344 km / 1 mi = 4.828032 km. Facts are the exact legal definitions.
   - Scale: a scale such as 1 cm : 50 m, and a length on the drawing or in real life; the other is found both
     ways, with the scale factor, a drawn scale bar, and how area grows with the square of the scale.
   Everything works on this device. */
'use strict';
(function () {
  const V = window.VIEWS, H = V._h, esc = H.esc;
  const nf = (x, d) => (Number.isFinite(x) ? Number(x.toPrecision(d || 10)).toLocaleString('en-US', { maximumFractionDigits: 8 }).replace('-', '−') : '—');
  /** each kind: [unit key, name (one), name (many), size in the base unit] */
  const KINDS = {
    length: { name: 'Length', base: 'm', units: [['mm', 'millimeter', 'millimeters', 0.001], ['cm', 'centimeter', 'centimeters', 0.01], ['m', 'meter', 'meters', 1], ['km', 'kilometer', 'kilometers', 1000], ['in', 'inch', 'inches', 0.0254], ['ft', 'foot', 'feet', 0.3048], ['yd', 'yard', 'yards', 0.9144], ['mi', 'mile', 'miles', 1609.344]] },
    area: { name: 'Area', base: 'm²', units: [['cm²', 'square centimeter', 'square centimeters', 1e-4], ['m²', 'square meter', 'square meters', 1], ['ha', 'hectare', 'hectares', 1e4], ['km²', 'square kilometer', 'square kilometers', 1e6], ['in²', 'square inch', 'square inches', 0.00064516], ['ft²', 'square foot', 'square feet', 0.09290304], ['yd²', 'square yard', 'square yards', 0.83612736], ['acre', 'acre', 'acres', 4046.8564224], ['mi²', 'square mile', 'square miles', 2589988.110336]] },
    volume: { name: 'Volume', base: 'L', units: [['mL', 'milliliter', 'milliliters', 0.001], ['L', 'liter', 'liters', 1], ['tsp', 'teaspoon', 'teaspoons', 0.00492892159375], ['tbsp', 'tablespoon', 'tablespoons', 0.01478676478125], ['floz', 'fluid ounce', 'fluid ounces', 0.0295735295625], ['cup', 'cup', 'cups', 0.2365882365], ['pt', 'pint', 'pints', 0.473176473], ['qt', 'quart', 'quarts', 0.946352946], ['gal', 'gallon', 'gallons', 3.785411784], ['in³', 'cubic inch', 'cubic inches', 0.016387064], ['ft³', 'cubic foot', 'cubic feet', 28.316846592], ['m³', 'cubic meter', 'cubic meters', 1000]] },
    mass: { name: 'Weight and mass', base: 'kg', units: [['mg', 'milligram', 'milligrams', 1e-6], ['g', 'gram', 'grams', 0.001], ['kg', 'kilogram', 'kilograms', 1], ['t', 'metric ton', 'metric tons', 1000], ['oz', 'ounce', 'ounces', 0.028349523125], ['lb', 'pound', 'pounds', 0.45359237], ['ton', 'ton (US)', 'tons (US)', 907.18474]] },
    time: { name: 'Time', base: 's', units: [['s', 'second', 'seconds', 1], ['min', 'minute', 'minutes', 60], ['h', 'hour', 'hours', 3600], ['day', 'day', 'days', 86400], ['wk', 'week', 'weeks', 604800], ['yr', 'year (365 days)', 'years (365 days)', 31536000]] },
    speed: { name: 'Speed', base: 'm/s', units: [['m/s', 'meter per second', 'meters per second', 1], ['km/h', 'kilometer per hour', 'kilometers per hour', 1000 / 3600], ['ft/s', 'foot per second', 'feet per second', 0.3048], ['mph', 'mile per hour', 'miles per hour', 1609.344 / 3600]] },
    temp: { name: 'Temperature', base: '°C', units: [['C', 'degree Celsius', 'degrees Celsius'], ['F', 'degree Fahrenheit', 'degrees Fahrenheit'], ['K', 'kelvin', 'kelvins']] },
  };
  const DEF = { length: ['ft', 'm'], area: ['ft²', 'm²'], volume: ['cup', 'mL'], mass: ['lb', 'kg'], time: ['h', 'min'], speed: ['mph', 'km/h'], temp: ['F', 'C'] };
  const sym = k => ({ C: '°C', F: '°F', K: 'K', floz: 'fl oz', cup: 'c' }[k] || k);
  const unit = (kind, k) => KINDS[kind].units.find(u => u[0] === k);
  const nameOf = (u, x) => (Math.abs(x) === 1 ? u[1] : u[2]);

  /** a conversion, with the fact and the working: { out, fact, work } */
  function convert(kind, from, to, x) {
    if (kind === 'temp') {
      const toC = { C: v => v, F: v => (v - 32) * 5 / 9, K: v => v - 273.15 }[from](x), out = { C: c => c, F: c => c * 9 / 5 + 32, K: c => c + 273.15 }[to](toC);
      const rule = { 'C>F': 'F = C × 9/5 + 32', 'F>C': 'C = (F − 32) × 5/9', 'C>K': 'K = C + 273.15', 'K>C': 'C = K − 273.15', 'F>K': 'K = (F − 32) × 5/9 + 273.15', 'K>F': 'F = (K − 273.15) × 9/5 + 32' }[from + '>' + to];
      const work = from === to ? `${nf(x)} ${sym(from)} is already in ${sym(to)}.` : from === 'C' && to === 'F' ? `${nf(x)} × 9/5 = ${nf(x * 9 / 5)}, then + 32 = ${nf(out)}` : from === 'F' && to === 'C' ? `${nf(x)} − 32 = ${nf(x - 32)}, then × 5/9 = ${nf(out)}` : `${rule.split('=')[1].trim().replace(/[CFK](?![a-z])/, nf(x))} = ${nf(out)}`;
      return { out, fact: from === to ? '' : rule, work };
    }
    const a = unit(kind, from), b = unit(kind, to), f = a[3] / b[3], out = x * f;
    // state the fact the short (exact) way round: 1 foot = 0.3048 meters, not 1 meter = 3.2808399 feet
    const len = v => String(Number(v.toPrecision(12))).replace(/^0\.0*|\./g, '').length;
    const big = len(f) <= len(1 / f), ratio = big ? f : 1 / f;
    const fact = from === to ? '' : big ? `1 ${a[1]} = ${nf(ratio)} ${nameOf(b, ratio)}` : `1 ${b[1]} = ${nf(ratio)} ${nameOf(a, ratio)}`;
    const work = from === to ? 'Same unit: nothing changes.' : big
      ? `${nf(x)} ${sym(from)} × ${nf(ratio)} ${sym(to)} / 1 ${sym(from)} = ${nf(out)} ${sym(to)}`
      : `${nf(x)} ${sym(from)} × 1 ${sym(to)} / ${nf(ratio)} ${sym(from)} = ${nf(out)} ${sym(to)}`;
    return { out, fact, work, multiply: big };
  }

  /* ---------- scale drawings ---------- */
  const LEN = KINDS.length.units;
  /** the scale as one number: how many times larger real life is than the drawing (or null across unlike units) */
  function scaleFactor(d, du, r, ru) { const a = LEN.find(u => u[0] === du), b = LEN.find(u => u[0] === ru); return a && b ? (r * b[3]) / (d * a[3]) : null; }

  function page(root, tab) {
    tab = tab === 'scale' ? 'scale' : 'units';
    root.innerHTML = `<div class="ms-page">
      <div class="ms-head"><h1>Units and scale</h1><p class="muted">Change between units, with every conversion shown, and work with scale drawings and maps.</p>
        <div class="tabs" role="tablist" aria-label="Units and scale"><a class="tab${tab === 'units' ? ' on' : ''}" role="tab" aria-selected="${tab === 'units'}" href="#/measure/units">Units</a><a class="tab${tab === 'scale' ? ' on' : ''}" role="tab" aria-selected="${tab === 'scale'}" href="#/measure/scale">Scale drawings and maps</a></div></div>
      <div id="ms-body"></div></div>`;
    const body = root.querySelector('#ms-body');
    return tab === 'units' ? units(body, root) : scale(body, root);
  }

  function units(body, root) {
    let kind = 'length', from = 'ft', to = 'm', x = 5;
    body.innerHTML = `<div class="ms-main"><div class="card ms-card">
        <div class="ms-kinds" role="group" aria-label="What to measure">${Object.keys(KINDS).map(k => `<button type="button" class="chip-btn${k === kind ? ' on' : ''}" data-kind="${k}">${KINDS[k].name}</button>`).join('')}</div>
        <div class="ms-row"><div class="field"><label for="ms-x">Amount</label><input id="ms-x" inputmode="decimal" autocomplete="off" value="${x}"></div>
          <div class="field"><label for="ms-from">From</label><select id="ms-from"></select></div>
          <button type="button" class="btn sm ms-swap" id="ms-swap" aria-label="Swap the units">Swap</button>
          <div class="field"><label for="ms-to">To</label><select id="ms-to"></select></div></div>
        <div id="ms-out" aria-live="polite"></div></div>
      <div class="card ms-card"><h2>Handy facts</h2><ul class="small ms-facts" id="ms-facts"></ul></div></div>`;
    const sel = id => body.querySelector(id);
    function options() {
      const opts = KINDS[kind].units.map(u => `<option value="${esc(u[0])}">${esc(u[2].replace(/^./, c => c.toUpperCase()))} (${esc(sym(u[0]))})</option>`).join('');
      sel('#ms-from').innerHTML = opts; sel('#ms-to').innerHTML = opts;
      sel('#ms-from').value = from; sel('#ms-to').value = to;
      const F = { length: ['1 foot = 12 inches', '1 yard = 3 feet', '1 mile = 5,280 feet', '1 inch = 2.54 centimeters, exactly', '1 meter = 100 centimeters', '1 kilometer = 1,000 meters'], area: ['1 square foot = 144 square inches (12 × 12)', '1 square yard = 9 square feet', '1 acre = 43,560 square feet', '1 square meter = 10,000 square centimeters'], volume: ['3 teaspoons = 1 tablespoon', '2 tablespoons = 1 fluid ounce', '1 cup = 8 fluid ounces', '2 cups = 1 pint, 2 pints = 1 quart, 4 quarts = 1 gallon', '1 liter = 1,000 milliliters'], mass: ['1 pound = 16 ounces', '1 ton (US) = 2,000 pounds', '1 kilogram = 1,000 grams', '1 pound = 0.45359237 kilograms, exactly'], time: ['1 minute = 60 seconds', '1 hour = 60 minutes = 3,600 seconds', '1 day = 24 hours', '1 week = 7 days'], speed: ['60 mph = 88 feet per second', '1 meter per second = 3.6 km/h'], temp: ['Water freezes at 0 °C = 32 °F and boils at 100 °C = 212 °F', 'A change of 1 °C is a change of 9/5 °F', '0 K is absolute zero, −273.15 °C'] }[kind];
      sel('#ms-facts').innerHTML = F.map(t => `<li>${esc(t)}</li>`).join('');
    }
    function show() {
      const n = Number(String(sel('#ms-x').value).replace(/,/g, '').replace('−', '-').trim()), out = sel('#ms-out');
      if (sel('#ms-x').value.trim() === '' || !Number.isFinite(n)) { out.innerHTML = '<p class="small muted">Type an amount, such as 5 or 2.5.</p>'; return; }
      x = n;
      const r = convert(kind, from, to, x), U = kind === 'temp' ? null : unit(kind, to);
      out.innerHTML = `<div class="ms-ans"><span class="ms-big">${nf(r.out, 8)}</span> <span>${esc(U ? nameOf(U, r.out) : sym(to))}</span></div>
        ${r.fact ? `<p class="small"><b>The fact:</b> ${esc(r.fact)}.</p>` : ''}
        <p class="small ms-work"><b>The working:</b> ${esc(r.work)}</p>
        ${kind !== 'temp' && from !== to ? `<p class="tiny muted">${r.out > x ? 'Going to a smaller unit takes more of them, so the number gets bigger.' : 'Going to a larger unit takes fewer of them, so the number gets smaller.'} The unit on the bottom of the fraction cancels the unit you started with.</p>` : ''}`;
      root.__measure = { kind, from, to, x, out: r.out, fact: r.fact, work: r.work };
    }
    body.addEventListener('click', ev => {
      const b = ev.target.closest('[data-kind]'), sw = ev.target.closest('#ms-swap');
      if (b) { kind = b.dataset.kind; [from, to] = DEF[kind]; body.querySelectorAll('[data-kind]').forEach(c => c.classList.toggle('on', c === b)); options(); show(); }
      if (sw) { [from, to] = [to, from]; options(); show(); }
    });
    body.addEventListener('change', ev => { if (ev.target.id === 'ms-from') from = ev.target.value; if (ev.target.id === 'ms-to') to = ev.target.value; show(); });
    body.addEventListener('input', ev => { if (ev.target.id === 'ms-x') show(); });
    options(); show();
    H.tutorCtx({ notes: 'The student is on the units tool, converting measurements with unit fractions.' });
  }

  function scale(body, root) {
    const S = { d: 1, du: 'cm', r: 50, ru: 'm', len: 6.5, real: null, lw: [12, 8] };
    const lenOpts = cur => LEN.map(u => `<option value="${u[0]}"${u[0] === cur ? ' selected' : ''}>${u[0]}</option>`).join('');
    body.innerHTML = `<div class="ms-main"><div class="card ms-card">
        <h2>The scale</h2>
        <div class="ms-scale"><input id="sc-d" inputmode="decimal" aria-label="Length on the drawing" value="${S.d}"><select id="sc-du" aria-label="Drawing unit">${lenOpts(S.du)}</select><span class="ms-eq">on the drawing is</span><input id="sc-r" inputmode="decimal" aria-label="Length in real life" value="${S.r}"><select id="sc-ru" aria-label="Real unit">${lenOpts(S.ru)}</select><span class="ms-eq">in real life</span></div>
        <div class="ms-pair"><div class="field"><label for="sc-len">On the drawing (<span class="sc-du"></span>)</label><input id="sc-len" inputmode="decimal" autocomplete="off" value="${S.len}"></div>
          <div class="field"><label for="sc-real">In real life (<span class="sc-ru"></span>)</label><input id="sc-real" inputmode="decimal" autocomplete="off"></div></div>
        <p class="tiny muted">Type in either box: the other is worked out.</p>
        <div id="sc-out" aria-live="polite"></div></div>
      <div class="card ms-card"><h2>On the map</h2><div id="sc-map" class="ms-map"></div>
        <h3 style="margin-top:14px">A rectangle drawn to scale</h3>
        <div class="ms-pair"><div class="field"><label for="sc-l">Real length (<span class="sc-ru"></span>)</label><input id="sc-l" inputmode="decimal" value="${S.lw[0]}"></div><div class="field"><label for="sc-w">Real width (<span class="sc-ru"></span>)</label><input id="sc-w" inputmode="decimal" value="${S.lw[1]}"></div></div>
        <div id="sc-area" class="small"></div></div></div>`;
    const q = id => body.querySelector(id), val = id => Number(String(q(id).value).replace(/,/g, '').trim());
    let last = 'len';
    function show() {
      S.d = val('#sc-d'); S.r = val('#sc-r'); S.du = q('#sc-du').value; S.ru = q('#sc-ru').value;
      body.querySelectorAll('.sc-du').forEach(e => { e.textContent = S.du; }); body.querySelectorAll('.sc-ru').forEach(e => { e.textContent = S.ru; });
      const out = q('#sc-out'), ok = S.d > 0 && S.r > 0;
      if (!ok) { out.innerHTML = '<p class="small muted">Both sides of the scale need a number greater than 0.</p>'; return; }
      const per = S.r / S.d, k = scaleFactor(S.d, S.du, S.r, S.ru);
      if (last === 'len') { S.len = val('#sc-len'); S.real = S.len * per; q('#sc-real').value = Number.isFinite(S.real) ? nf(S.real).replace(/,/g, '') : ''; }
      else { S.real = val('#sc-real'); S.len = S.real / per; q('#sc-len').value = Number.isFinite(S.len) ? nf(S.len).replace(/,/g, '') : ''; }
      const work = last === 'len' ? `${nf(S.len)} ${S.du} × ${nf(per)} ${S.ru} per ${S.du} = ${nf(S.real)} ${S.ru}` : `${nf(S.real)} ${S.ru} ÷ ${nf(per)} ${S.ru} per ${S.du} = ${nf(S.len)} ${S.du}`;
      out.innerHTML = `<p class="small"><b>Each ${S.du} on the drawing is ${nf(per)} ${S.ru}.</b> ${esc(work)}.</p>
        ${k ? `<p class="small">As one ratio with the same unit, the scale is <b>1 : ${nf(k, 6)}</b>: real life is ${nf(k, 6)} times as large as the drawing (the scale factor from drawing to real life).</p>` : ''}`;
      // the map: a scale bar of 5 drawing units and the measured length beside it
      const bar = 5, pxPer = 34, w = Math.min(320, Math.max(40, S.len * pxPer));
      q('#sc-map').innerHTML = `<svg viewBox="0 0 360 120" role="img" aria-label="A scale bar and the measured length"><g class="ms-svg">
        ${Array.from({ length: bar }, (_, i) => `<rect x="${20 + i * pxPer}" y="20" width="${pxPer}" height="10" class="${i % 2 ? 'ms-bar1' : 'ms-bar0'}"/>`).join('')}
        ${Array.from({ length: bar + 1 }, (_, i) => `<text x="${20 + i * pxPer}" y="45" text-anchor="middle" class="ms-t">${nf(i * per, 4)}</text>`).join('')}
        <text x="${20 + bar * pxPer + 8}" y="30" class="ms-t">${esc(S.ru)}</text>
        <line x1="20" y1="80" x2="${20 + w}" y2="80" class="ms-len"/><circle cx="20" cy="80" r="4" class="ms-dot"/><circle cx="${20 + w}" cy="80" r="4" class="ms-dot"/>
        <text x="20" y="104" class="ms-t">${nf(S.len)} ${esc(S.du)} on the map = ${nf(S.real)} ${esc(S.ru)}${S.len * pxPer > 320 ? ' (drawn shorter to fit)' : ''}</text></g></svg>`;
      const L = val('#sc-l'), Wd = val('#sc-w');
      if (L > 0 && Wd > 0) {
        const dl = L / per, dw = Wd / per, A = L * Wd, a = dl * dw;
        q('#sc-area').innerHTML = `<p>On the drawing: <b>${nf(dl)} ${S.du} by ${nf(dw)} ${S.du}</b>, an area of ${nf(a)} square ${S.du}. In real life: ${nf(A)} square ${S.ru}.</p>
          <p class="muted">Lengths scale by ${nf(per)} ${S.ru} per ${S.du}, so areas scale by ${nf(per)}² = ${nf(per * per)} square ${S.ru} per square ${S.du}.${k ? ` With one unit, the area scale factor is ${nf(k, 6)}² = ${nf(k * k, 6)}.` : ''}</p>`;
      } else q('#sc-area').innerHTML = '';
      root.__measure = { per, k, len: S.len, real: S.real };
    }
    body.addEventListener('input', ev => { if (ev.target.id === 'sc-len') last = 'len'; if (ev.target.id === 'sc-real') last = 'real'; show(); });
    body.addEventListener('change', show);
    show();
    H.tutorCtx({ notes: 'The student is on the scale drawings and maps tool.' });
  }

  window.MEASURE = { page, convert, scaleFactor, KINDS };
})();
