/* Balance: a seesaw puzzle (#/balance, #/balance/<level>, #/balance/daily). A beam rests on a pivot, with pegs 1 to
   3 (later 4 and 5) steps from it on each side, and some weights already in place. Put every weight card on an empty
   peg so the beam balances: on each side, add up weight × distance from the pivot; the two sums must be equal (the
   law of the lever). It practices multiplication facts and finding a missing factor. A level is built from a seed
   (level 7 is the same for everyone) by choosing a solution first, so it always has one; any balanced placement
   wins. Progress: localStorage procademy.balance.v1. */
'use strict';
(function () {
  const V = window.VIEWS, H = V._h, esc = H.esc, KEY = 'procademy.balance.v1';
  const today = () => STORE.today();
  function load() { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s === 'object') return { level: Math.max(1, Number(s.level) || 1), stars: s.stars || {}, daily: s.daily || {} }; } catch (e) { /* private window */ } return { level: 1, stars: {}, daily: {} }; }
  function save(st) { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* private window */ } }

  /** a puzzle from its seed: { reach, fixed: [{ p, w }], cards: [w, …], solution: [{ p, w }] }; p < 0 is the left side */
  function make(level, seedText) {
    const R = RNG.make(seedText || 'balance:' + level);
    const reach = level < 8 ? 3 : level < 20 ? 4 : 5, maxW = level < 5 ? 6 : level < 15 ? 9 : 12;
    const nFixed = level < 4 ? 1 : level < 14 ? 2 : 3, nCards = level < 3 ? 1 : level < 10 ? 2 : level < 22 ? 3 : 4;
    const pegs = [];
    for (let p = -reach; p <= reach; p++) if (p) pegs.push(p);
    for (let tries = 0; tries < 500; tries++) {
      const order = R.shuffle(pegs);
      const fixed = order.slice(0, nFixed).map(p => ({ p, w: R.int(1, maxW) }));
      if (!fixed.reduce((a, x) => a + x.p * x.w, 0)) continue;                 // already level: nothing to do
      const some = order.slice(nFixed, nFixed + nCards - 1).map(p => ({ p, w: R.int(1, maxW) }));
      const t = fixed.concat(some).reduce((a, x) => a + x.p * x.w, 0);
      const last = R.shuffle(order.slice(nFixed + nCards - 1)).map(p => ({ p, w: -t / p })).find(x => Number.isInteger(x.w) && x.w >= 1 && x.w <= maxW);
      if (!last) continue;
      const solution = some.concat([last]);
      return { reach, fixed, cards: solution.map(x => x.w).sort((a, b) => a - b), solution };
    }
    return { reach: 3, fixed: [{ p: -2, w: 3 }], cards: [6], solution: [{ p: 1, w: 6 }] };
  }
  /** the turning effect on each side, and the whole beam's (positive tips it to the right) */
  function sums(pz, placed) {
    const all = pz.fixed.concat([...placed].map(([p, i]) => ({ p, w: pz.cards[i] })));
    const side = s => all.filter(x => Math.sign(x.p) === s).sort((a, b) => Math.abs(a.p) - Math.abs(b.p));
    const total = list => list.reduce((a, x) => a + x.w * Math.abs(x.p), 0);
    return { left: side(-1), right: side(1), l: total(side(-1)), r: total(side(1)), net: total(side(1)) - total(side(-1)) };
  }
  const sideText = list => (list.length ? list.map(x => `${x.w} × ${Math.abs(x.p)}`).join(' + ') + ' = ' + list.reduce((a, x) => a + x.w * Math.abs(x.p), 0) : '0');

  function page(root, which) {
    const st = load(), daily = which === 'daily';
    let level = daily ? 12 : Math.min(st.level, Math.max(1, Math.floor(Number(which)) || st.level));
    root.innerHTML = `<div class="bl-page">
      <div class="card"><h1 style="margin:0">Balance</h1><p class="muted small" style="margin:4px 0 0">Place <b>every weight card</b> on an empty peg so the seesaw is level. On each side, multiply each weight by its distance from the middle and add: the two sides must match.</p>
        <div class="lp-nav" id="bl-nav" style="margin-top:10px"></div></div>
      <div class="card bl-board">
        <div class="row between"><h2 style="margin:0" id="bl-title"></h2><span class="small muted" id="bl-best"></span></div>
        <div class="bl-scene" id="bl-scene" aria-hidden="true"></div>
        <div class="bl-pegs" id="bl-pegs"></div>
        <p class="bl-sums" id="bl-sums" aria-live="polite"></p>
        <div class="bl-cards" id="bl-cards" role="group" aria-label="Weight cards"></div>
        <div class="lp-status" id="bl-status" aria-live="polite"></div>
        <div class="btn-row"><button type="button" class="btn sm ghost" id="bl-restart">Start again</button><button type="button" class="btn sm ghost" id="bl-hint">Show a hint</button></div>
      </div>
      <div class="card"><h2>How it works</h2><ul class="nm-facts">
        <li>Select a weight card, then a peg. Select a placed card to take it back off.</li>
        <li>A weight pushes harder the farther it is from the middle: 3 on peg 4 turns the beam as much as 4 on peg 3, because 3 × 4 = 4 × 3 = 12.</li>
        <li>Work out how much the heavier side is ahead, then find a weight and a distance that multiply to make up the difference.</li>
        <li>Scoring: three stars with no hints and no wrong finishes, two stars with one or two, otherwise one star.</li>
      </ul></div></div>`;
    const wrap = root.querySelector('.bl-page'), q = s => root.querySelector(s);
    let pz, placed, sel, won, slips;

    function nav() {
      const total = Object.values(st.stars).reduce((a, b) => a + b, 0);
      q('#bl-nav').innerHTML = daily ? `<a class="chip-btn" href="#/balance/${st.level}">Levels</a>`
        : `${level > 1 ? `<button type="button" class="chip-btn" id="bl-prev">← Level ${level - 1}</button>` : ''}<button type="button" class="chip-btn" id="bl-next" ${level < st.level ? '' : 'disabled'}>Level ${level + 1} →</button>
           <a class="chip-btn" href="#/balance/daily">Today’s puzzle${st.daily[today()] ? ' (solved)' : ''}</a><span class="small muted">Stars: ${total}</span>`;
    }
    function start() {
      pz = make(level, daily ? 'balance:daily:' + today() : null);
      placed = new Map(); sel = null; won = false; slips = 0;
      q('#bl-title').textContent = daily ? 'Today’s puzzle' : `Level ${level}`;
      const best = daily ? st.daily[today()] : st.stars[level];
      q('#bl-best').textContent = best ? `Best: ${best} of 3 stars` : '';
      status(pz.cards.length === 1 ? 'Place the weight card so the seesaw is level.' : `Place all ${pz.cards.length} weight cards so the seesaw is level.`);
      H.tutorCtx({ notes: `The student is playing Balance, a seesaw puzzle. Weights already on the beam: ${pz.fixed.map(x => `${x.w} at ${Math.abs(x.p)} on the ${x.p < 0 ? 'left' : 'right'}`).join(', ')}. Cards to place: ${pz.cards.join(', ')}, each on an empty peg 1 to ${pz.reach} from the middle on either side. Each side's total is the sum of weight × distance; they must be equal. Give hints about the difference between the sides and factor pairs; don't give the whole answer unless asked.` });
      nav(); draw();
    }
    const status = html => { q('#bl-status').innerHTML = html; };
    function draw() {
      const s = sums(pz, placed), angle = Math.max(-12, Math.min(12, s.net * 0.8)), step = 170 / pz.reach;
      const weight = (x, cls) => { const h = 16 + x.w * 2.2, cx = 200 + x.p * step; return `<g class="${cls}"><rect x="${cx - 15}" y="${132 - h}" width="30" height="${h}" rx="5"/><text x="${cx}" y="${132 - h / 2 + 5}" text-anchor="middle">${x.w}</text></g>`; };
      const pegs = []; for (let p = -pz.reach; p <= pz.reach; p++) if (p) pegs.push(p);
      q('#bl-scene').innerHTML = `<svg viewBox="0 0 400 190" class="bl-svg"><polygon class="bl-pivot" points="200,142 178,184 222,184"/>
        <g class="bl-beam" style="transform: rotate(${angle}deg)">${pegs.map(p => `<line class="bl-tick" x1="${200 + p * step}" y1="134" x2="${200 + p * step}" y2="146"/><text class="bl-num" x="${200 + p * step}" y="160" text-anchor="middle">${Math.abs(p)}</text>`).join('')}
          <rect class="bl-bar" x="18" y="132" width="364" height="10" rx="5"/>${pz.fixed.map(x => weight(x, 'bl-fixed')).join('')}${[...placed].map(([p, i]) => weight({ p, w: pz.cards[i] }, 'bl-card')).join('')}</g></svg>`;
      q('#bl-pegs').style.gridTemplateColumns = `repeat(${pz.reach * 2 + 1}, minmax(0, 1fr))`;
      q('#bl-pegs').innerHTML = pegs.slice(0, pz.reach).map(peg).join('') + '<span class="bl-mid" aria-hidden="true">▲</span>' + pegs.slice(pz.reach).map(peg).join('');
      function peg(p) {
        const f = pz.fixed.find(x => x.p === p), side = p < 0 ? 'left' : 'right', d = Math.abs(p);
        if (f) return `<button type="button" class="bl-peg fixed" disabled aria-label="Peg ${d} on the ${side}: ${f.w}, already placed">${f.w}</button>`;
        if (placed.has(p)) return `<button type="button" class="bl-peg on" data-peg="${p}" ${won ? 'disabled' : ''} aria-label="Peg ${d} on the ${side}: ${pz.cards[placed.get(p)]}. Select to take it off.">${pz.cards[placed.get(p)]}</button>`;
        return `<button type="button" class="bl-peg" data-peg="${p}" ${won || sel == null ? 'disabled' : ''} aria-label="Peg ${d} on the ${side}: empty">${d}</button>`;
      }
      const used = new Set(placed.values());
      q('#bl-cards').innerHTML = pz.cards.map((w, i) => used.has(i) ? '' : `<button type="button" class="bl-chip${sel === i ? ' sel' : ''}" data-card="${i}" aria-pressed="${sel === i}" ${won ? 'disabled' : ''}>${w}</button>`).join('') || (won ? '' : '<span class="small muted">All cards are placed.</span>');
      q('#bl-sums').innerHTML = `Left: <b>${esc(sideText(s.left))}</b> · Right: <b>${esc(sideText(s.right))}</b>${s.net ? ` · the ${s.net > 0 ? 'right' : 'left'} side is heavier by <b>${Math.abs(s.net)}</b>` : ' · <b>level</b>'}`;
      root.__balance = { level: daily ? 'daily' : level, fixed: pz.fixed.slice(), cards: pz.cards.slice(), solution: pz.solution.slice(), placed: [...placed].map(([p, i]) => ({ p, w: pz.cards[i] })), net: s.net, won, slips };
    }
    function check() {
      if (placed.size < pz.cards.length) return;
      const s = sums(pz, placed);
      if (s.net) { slips++; status(`All the cards are placed, but the ${s.net > 0 ? 'right' : 'left'} side is heavier by <b>${Math.abs(s.net)}</b>. Move a card to make up the difference.`); return; }
      won = true;
      const stars = slips === 0 ? 3 : slips <= 2 ? 2 : 1;
      if (daily) st.daily[today()] = Math.max(st.daily[today()] || 0, stars);
      else { st.stars[level] = Math.max(st.stars[level] || 0, stars); st.level = Math.max(st.level, level + 1); }
      save(st); nav();
      status(`<div class="lp-win"><b>Balanced: ${s.l} = ${s.r}. ${stars} of 3 stars.</b><div class="btn-row">${daily ? `<a class="btn primary sm" href="#/balance/${st.level}">Return to the levels</a>` : `<button type="button" class="btn primary sm" id="bl-go">Level ${level + 1} →</button>`}<button type="button" class="btn ghost sm" id="bl-again">Play again</button></div></div>`);
    }
    wrap.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b || !wrap.contains(b) || b.disabled) return;
      if (b.dataset.card !== undefined) { const i = Number(b.dataset.card); sel = sel === i ? null : i; draw(); const peg = q('.bl-peg[data-peg]:not([disabled]):not(.on)'); if (sel != null && peg) peg.focus(); return; }
      if (b.dataset.peg !== undefined) {
        const p = Number(b.dataset.peg);
        if (placed.has(p)) { placed.delete(p); status('Card taken off. Select a card, then a peg.'); }
        else if (sel != null) { placed.set(p, sel); sel = null; status(''); }
        draw(); check(); if (won) draw();
        const next = q('.bl-chip') || q('#bl-go') || q('#bl-again'); if (next) next.focus();
        return;
      }
      if (b.id === 'bl-restart') start();
      else if (b.id === 'bl-hint') {
        const todo = pz.solution.find(x => !(placed.has(x.p) && pz.cards[placed.get(x.p)] === x.w));
        if (!todo) return;
        slips++;
        status(`Try the <b>${todo.w}</b> on peg <b>${Math.abs(todo.p)}</b> on the ${todo.p < 0 ? 'left' : 'right'}.`);
      }
      else if (b.id === 'bl-again') start();
      else if (b.id === 'bl-go') { level++; history.replaceState(null, '', '#/balance/' + level); start(); }
      else if (b.id === 'bl-prev' && level > 1) { level--; history.replaceState(null, '', '#/balance/' + level); start(); }
      else if (b.id === 'bl-next' && level < st.level) { level++; history.replaceState(null, '', '#/balance/' + level); start(); }
    });
    start();
  }
  /** is today's puzzle solved? (for today's plan) */
  const dailyDone = () => !!load().daily[today()];

  window.BALANCE = { page, make, sums, dailyDone, KEY };
})();
