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

  const pref = patch => (V.tools && V.tools.pref ? V.tools.pref('measure', patch) : {});
  function page(root, tab) {
    const mem = pref();
    if (!tab && ['units', 'scale', 'clock'].includes(mem.tab)) tab = mem.tab;               // opens on the tab last used
    tab = tab === 'scale' || tab === 'clock' ? tab : 'units';
    pref({ tab });
    root.innerHTML = `<div class="ms-page">
      <div class="ms-head"><h1>Units and scale</h1><p class="muted">Change between units, with every conversion shown, work with scale drawings and maps, and tell the time.</p>
        ${V.tools && V.tools.how ? V.tools.how(tab === 'clock' ? 'clock' : 'measure') : ''}
        <div class="tabs" role="tablist" aria-label="Units and scale">${[['units', 'Units'], ['scale', 'Scale drawings and maps'], ['clock', 'Clocks and time']].map(([k, l]) => `<a class="tab${tab === k ? ' on' : ''}" role="tab" aria-selected="${tab === k}" href="#/measure/${k}">${l}</a>`).join('')}</div></div>
      <div id="ms-body"></div></div>`;
    const body = root.querySelector('#ms-body');
    return tab === 'units' ? units(body, root) : tab === 'clock' ? clock(body, root) : scale(body, root);
  }

  function units(body, root) {
    const mem = pref(), lastOk = Array.isArray(mem.last) && KINDS[mem.last[0]] && unit(mem.last[0], mem.last[1]) && unit(mem.last[0], mem.last[2]);
    let kind = lastOk ? mem.last[0] : 'length', from = lastOk ? mem.last[1] : 'ft', to = lastOk ? mem.last[2] : 'm', x = lastOk && Number.isFinite(mem.last[3]) ? mem.last[3] : 5;
    const favs = () => (Array.isArray(pref().favs) ? pref().favs.filter(f => Array.isArray(f) && KINDS[f[0]] && unit(f[0], f[1]) && unit(f[0], f[2])) : []);
    const isFav = () => favs().some(f => f[0] === kind && f[1] === from && f[2] === to);
    body.innerHTML = `<div class="ms-main"><div class="card ms-card">
        <div class="ms-favs" id="ms-favs"></div>
        <div class="ms-kinds" role="group" aria-label="What to measure">${Object.keys(KINDS).map(k => `<button type="button" class="chip-btn${k === kind ? ' on' : ''}" data-kind="${k}">${KINDS[k].name}</button>`).join('')}</div>
        <div class="ms-row"><div class="field"><label for="ms-x">Amount</label><input id="ms-x" inputmode="decimal" autocomplete="off" value="${x}"></div>
          <div class="field"><label for="ms-from">From</label><select id="ms-from"></select></div>
          <button type="button" class="btn sm ms-swap" id="ms-swap" aria-label="Swap the units">Swap</button>
          <div class="field"><label for="ms-to">To</label><select id="ms-to"></select></div>
          <button type="button" class="btn sm ms-star" id="ms-star" aria-pressed="false">${window.ICONS ? ICONS.svg('star', 16) : ''}<span>Keep at the top</span></button></div>
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
      root.__measure = { kind, from, to, x, out: r.out, fact: r.fact, work: r.work, favs: favs().length };
      pref({ last: [kind, from, to, x] });
      favRow();
    }
    /** favorite conversions: a row of one-tap chips above the kinds */
    function favRow() {
      const fs = favs(), on = isFav(), star = sel('#ms-star');
      star.setAttribute('aria-pressed', String(on));
      star.querySelector('span').textContent = on ? 'Kept at the top' : 'Keep at the top';
      sel('#ms-favs').innerHTML = fs.length ? `<span class="tiny muted">Your conversions:</span>${fs.map(([k, a, b], i) => `<span class="ms-fav"><button type="button" class="chip-btn${k === kind && a === from && b === to ? ' on' : ''}" data-fav="${i}">${esc(sym(a))} to ${esc(sym(b))}</button><button type="button" class="iconbtn sm" data-unfav="${i}" aria-label="Remove ${esc(sym(a))} to ${esc(sym(b))}">✕</button></span>`).join('')}` : '';
    }
    body.addEventListener('click', ev => {
      const fv = ev.target.closest('[data-fav]'), uf = ev.target.closest('[data-unfav]'), st = ev.target.closest('#ms-star');
      if (fv) { const f = favs()[Number(fv.dataset.fav)]; if (f) { [kind, from, to] = f; body.querySelectorAll('[data-kind]').forEach(c => c.classList.toggle('on', c.dataset.kind === kind)); options(); show(); } return; }
      if (uf) { const fs = favs(); fs.splice(Number(uf.dataset.unfav), 1); pref({ favs: fs }); favRow(); return; }
      if (st) { const fs = favs(), i = fs.findIndex(f => f[0] === kind && f[1] === from && f[2] === to); if (i >= 0) fs.splice(i, 1); else fs.unshift([kind, from, to]); pref({ favs: fs.slice(0, 8) }); favRow(); return; }
      const b = ev.target.closest('[data-kind]'), sw = ev.target.closest('#ms-swap');
      if (b) { kind = b.dataset.kind; [from, to] = DEF[kind]; body.querySelectorAll('[data-kind]').forEach(c => c.classList.toggle('on', c === b)); options(); show(); }
      if (sw) { [from, to] = [to, from]; options(); show(); }
    });
    body.addEventListener('change', ev => { if (ev.target.id === 'ms-from') from = ev.target.value; if (ev.target.id === 'ms-to') to = ev.target.value; show(); });
    body.addEventListener('input', ev => { if (ev.target.id === 'ms-x') show(); });
    sel('#ms-x').value = String(x);
    options(); show();
    H.tutorCtx({ notes: 'The student is on the units tool, converting measurements with unit fractions.' });
  }

  /* ---------- clocks and time (#/measure/clock): a clock to set by dragging, the time in words, and time between ---------- */
  const W1 = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const W10 = ['', '', 'twenty', 'thirty', 'forty', 'fifty'];
  const say = k => (k < 20 ? W1[k] : W10[Math.floor(k / 10)] + (k % 10 ? '-' + W1[k % 10] : ''));
  const h12 = h => (h % 12 || 12);
  /** a time (h 0 to 23, m 0 to 59) the ways people say it */
  function timeWords(h, m) {
    const H0 = h12(h), H1 = h12(h + 1), part = h < 12 ? 'in the morning' : h < 17 ? 'in the afternoon' : 'in the evening';
    const digital = m === 0 ? `${say(H0)} o’clock` : `${say(H0)} ${m < 10 ? 'oh ' + W1[m] : say(m)}`;
    const past = m === 0 ? `${say(H0)} o’clock` : m === 15 ? `quarter past ${say(H0)}` : m === 30 ? `half past ${say(H0)}` : m === 45 ? `quarter to ${say(H1)}` : m < 30 ? `${say(m)} minute${m === 1 ? '' : 's'} past ${say(H0)}` : `${say(60 - m)} minute${60 - m === 1 ? '' : 's'} to ${say(H1)}`;
    return { digital, past, part, text: `${H0}:${String(m).padStart(2, '0')} ${h < 12 ? 'a.m.' : 'p.m.'}`, h24: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` };
  }
  /** from one time to another, going forward (past midnight if need be): { h, m, words } */
  function between(a, b) {
    let d = ((b - a) % 1440 + 1440) % 1440;
    const h = Math.floor(d / 60), m = d % 60;
    return { h, m, mins: d, words: d === 0 ? 'no time at all' : [h ? `${h} hour${h === 1 ? '' : 's'}` : '', m ? `${m} minute${m === 1 ? '' : 's'}` : ''].filter(Boolean).join(' and ') };
  }
  function clockSvg(h, m) {
    const C = 120, R = 108, mins = h % 12 * 60 + m, ah = mins / 720 * 2 * Math.PI, am = m / 60 * 2 * Math.PI;
    const P = (a, r) => [C + r * Math.sin(a), C - r * Math.cos(a)].map(v => Math.round(v * 10) / 10).join(' ');
    let s = `<circle cx="${C}" cy="${C}" r="${R}" class="ck-face"/>`;
    for (let k = 0; k < 60; k++) { const a = k / 60 * 2 * Math.PI, big = k % 5 === 0; s += `<path d="M${P(a, R - (big ? 13 : 7))}L${P(a, R - 3)}" class="ck-tick${big ? ' big' : ''}"/>`; }
    for (let n = 1; n <= 12; n++) { const a = n / 12 * 2 * Math.PI, q = P(a, R - 30).split(' '); s += `<text x="${q[0]}" y="${Number(q[1]) + 7}" text-anchor="middle" class="ck-num">${n}</text>`; }
    s += `<path d="M${P(ah + Math.PI, 12)}L${P(ah, 58)}" class="ck-hour"/><path d="M${P(am + Math.PI, 16)}L${P(am, 88)}" class="ck-min"/><circle cx="${C}" cy="${C}" r="6" class="ck-hub"/>`;
    return `<svg class="ck-svg" viewBox="0 0 240 240" role="img" aria-label="A clock showing ${timeWords(h, m).text}">${s}</svg>`;
  }
  function clock(body, root) {
    const mem = pref(), now = new Date();
    let h = Number.isInteger(mem.h) && mem.h >= 0 && mem.h < 24 ? mem.h : now.getHours(), m = Number.isInteger(mem.m) && mem.m >= 0 && mem.m < 60 ? mem.m : Math.floor(now.getMinutes() / 5) * 5;
    let step = mem.step === 1 ? 1 : 5, game = null, dragging = false, lastA = null;
    body.innerHTML = `<div class="ms-main"><div class="card ms-card ck-card">
        <div class="ck-dial" id="ck-dial"></div>
        <div class="ck-btns" role="group" aria-label="Set the time">
          <button type="button" class="btn sm" data-t="-60">− 1 hour</button><button type="button" class="btn sm" data-t="60">+ 1 hour</button>
          <button type="button" class="btn sm" data-t="-5">− 5 min</button><button type="button" class="btn sm" data-t="5">+ 5 min</button>
          <button type="button" class="btn sm" data-t="-1">− 1 min</button><button type="button" class="btn sm" data-t="1">+ 1 min</button>
          <button type="button" class="btn sm" id="ck-ampm">a.m. or p.m.</button></div>
        <div class="seg ck-snap" role="radiogroup" aria-label="When you drag the minute hand"><button type="button" role="radio" aria-checked="${step === 5}" data-step="5">Drag by 5 minutes</button><button type="button" role="radio" aria-checked="${step === 1}" data-step="1">By 1 minute</button></div>
      </div>
      <div class="card ms-card"><div id="ck-read" aria-live="polite"></div>
        <h3 style="margin:16px 0 6px">How long until…</h3>
        <div class="ck-until"><label class="small" for="ck-to">Another time</label><input id="ck-to" type="time" value="${String((h + 2) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}"></div>
        <p class="small" id="ck-gap"></p>
        <h3 style="margin:16px 0 6px">Play</h3>
        <div class="btn-row"><button type="button" class="btn sm" id="ck-set">Set the clock</button><button type="button" class="btn sm" id="ck-readgame">Read the clock</button></div>
        <div id="ck-game" class="ck-game" aria-live="polite"></div></div></div>`;
    const q = id => body.querySelector(id), dial = q('#ck-dial');
    const mins = () => h * 60 + m;
    function setMins(t) { t = ((t % 1440) + 1440) % 1440; h = Math.floor(t / 60); m = t % 60; draw(); }
    function draw() {
      const w = timeWords(h, m);
      dial.innerHTML = clockSvg(h, m);
      q('#ck-read').innerHTML = `<div class="sh-res"><div class="sh-tile"><span class="tiny muted">The time</span><b>${w.text}</b><span class="tiny muted">${w.part}, or ${w.h24} on a 24-hour clock</span></div></div>
        <p class="small" style="margin:10px 0 0">Say it: <b>${esc(w.digital)}</b>, or <b>${esc(w.past)}</b>.</p>
        <p class="small muted" style="margin:6px 0 0">The minute hand is ${m === 0 ? 'on the 12' : `${m} minute${m === 1 ? '' : 's'} around, ${m % 5 === 0 ? `pointing at the ${m / 5 || 12}` : `between the ${Math.floor(m / 5) || 12} and the ${Math.floor(m / 5) + 1}`}`}${m ? `: ${m % 15 === 0 ? ['', 'a quarter', 'half', 'three quarters'][m / 15] + ' of the way around' : (() => { let a = m, b = 60; while (b) [a, b] = [b, a % b]; return `${m / a}/${60 / a} of the way around`; })()}` : ''}. The hour hand moves between the numbers as the hour goes by.</p>`;
      const to = q('#ck-to').value, tm = /^(\d{2}):(\d{2})$/.exec(to || '');
      q('#ck-gap').innerHTML = tm ? (() => { const g = between(mins(), Number(tm[1]) * 60 + Number(tm[2])); return `From ${w.text} to ${timeWords(Number(tm[1]), Number(tm[2])).text} is <b>${g.words}</b>${g.mins >= 60 ? ` (${g.mins} minutes)` : ''}${Number(tm[1]) * 60 + Number(tm[2]) < mins() ? ', going past midnight' : ''}.`; })() : '';
      if (game && game.kind === 'set') { const ok = mins() % 720 === game.t % 720; q('#ck-game .ck-check').innerHTML = ok ? `<p class="feedback good">That’s ${timeWords(h, m).text}. Well done.</p>` : ''; if (ok && !game.done) { game.done = true; if (window.BADGES) BADGES.flag('measure'); } }
      pref({ h, m, step });
      root.__clock = { h, m, text: w.text, words: w.past, digital: w.digital, game: game ? Object.assign({}, game) : null };
    }
    function newGame(kind) {
      const R = RNG.make(`clock:${kind}:${Date.now() % 100000}`), t = R.int(1, 12) * 60 + (step === 5 ? 5 * R.int(0, 11) : R.int(0, 59)) + (R.int(0, 1) ? 720 : 0);
      if (kind === 'set') { game = { kind, t, done: false }; q('#ck-game').innerHTML = `<p class="ck-ask">Set the clock to <b>${timeWords(Math.floor(t / 60) % 24, t % 60).text.replace(/ [ap]\.m\.$/, '')}</b>.</p><div class="ck-check"></div>`; }
      else {
        game = { kind, t }; setMins(t);
        q('#ck-game').innerHTML = `<p class="ck-ask">What time does the clock show?</p><form class="mn-form" id="ck-form"><label class="visually-hidden" for="ck-ans">The time, like 4:35</label><input id="ck-ans" inputmode="numeric" autocomplete="off" placeholder="like 4:35"><button class="btn sm primary" type="submit">Check</button></form><div class="ck-check"></div>`;
      }
      draw();
    }
    /** a drag around the face sets the minutes; going past 12 carries the hour */
    function dragTo(ev) {
      const r = dial.querySelector('svg').getBoundingClientRect(), x = ev.clientX - (r.left + r.width / 2), y = ev.clientY - (r.top + r.height / 2);
      let mm = Math.round(((Math.atan2(x, -y) / (2 * Math.PI) * 60) + 60) % 60 / step) * step % 60;
      if (lastA !== null) { if (lastA >= 45 && mm < 15) h = (h + 1) % 24; else if (lastA < 15 && mm >= 45) h = (h + 23) % 24; }
      lastA = mm; m = mm; draw();
    }
    dial.addEventListener('pointerdown', ev => { dragging = true; lastA = m; dial.setPointerCapture(ev.pointerId); dragTo(ev); ev.preventDefault(); });
    dial.addEventListener('pointermove', ev => { if (dragging) dragTo(ev); });
    const stop = () => { dragging = false; lastA = null; };
    dial.addEventListener('pointerup', stop); dial.addEventListener('pointercancel', stop);
    body.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b || !body.contains(b)) return;
      if (b.dataset.t) setMins(mins() + Number(b.dataset.t));
      else if (b.id === 'ck-ampm') setMins(mins() + 720);
      else if (b.dataset.step) { step = Number(b.dataset.step); body.querySelectorAll('[data-step]').forEach(x => x.setAttribute('aria-checked', String(x === b))); draw(); }
      else if (b.id === 'ck-set') newGame('set');
      else if (b.id === 'ck-readgame') newGame('read');
    });
    body.addEventListener('submit', ev => {
      ev.preventDefault();
      if (!game || game.kind !== 'read') return;
      const a = /^\s*(\d{1,2})\s*[:.]\s*(\d{2})\s*$/.exec(q('#ck-ans').value), want = game.t % 720;
      const got = a ? (Number(a[1]) % 12) * 60 + Number(a[2]) : null, box = q('#ck-game .ck-check');
      box.innerHTML = got === null ? '<p class="small">Type the time like 4:35.</p>' : got === want ? `<p class="feedback good">Yes: ${timeWords(Math.floor(game.t / 60), game.t % 60).text.replace(/ [ap]\.m\.$/, '')}.</p>` : (Number(a[2]) === (game.t % 60) && Number(a[1]) % 12 === (Math.floor(game.t / 60) + 1) % 12) ? '<p class="small">Look at the hour hand again: it hasn’t reached that number yet, so it is still the hour before.</p>' : '<p class="small">Not quite. Read the short hand for the hour, then count the long hand by fives for the minutes.</p>';
    });
    body.addEventListener('input', ev => { if (ev.target.id === 'ck-to') draw(); });
    draw();
    H.tutorCtx({ notes: 'The student is on the clock and time tool: setting an analog clock, reading time in words, and finding elapsed time.' });
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

  window.MEASURE = { page, convert, scaleFactor, KINDS, timeWords, between };
})();
