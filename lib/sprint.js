/* Speed sprints (#/sprint): one-minute rounds of math facts — times tables, negatives, squares,
   fractions as decimals and percents, percent of a number. The answer is checked as it is typed, so a
   round moves as fast as the learner can think. Facts that were missed or slow come back more often in
   later rounds, the best score per deck is kept, and the summary lists the facts to work on. On phones
   an on-screen keypad (with a minus key) replaces the keyboard. Everything stays on this device. */
'use strict';
(function () {
  const A = window.ACADEMY, S = window.STORE, V = window.VIEWS, H = V._h, esc = H.esc;
  const KEY = 'procademy.sprints.v1';
  // a challenge round runs from a seed, so both players get the same facts in the same order
  let rand = Math.random;
  const r = (a, b) => a + Math.floor(rand() * (b - a + 1));
  const n = x => (x < 0 ? '−' + Math.abs(x) : String(x));
  const par = x => (x < 0 ? `(${n(x)})` : String(x));
  const FDP = [['1/2', 0.5], ['1/4', 0.25], ['3/4', 0.75], ['1/5', 0.2], ['2/5', 0.4], ['3/5', 0.6], ['4/5', 0.8], ['1/10', 0.1], ['3/10', 0.3], ['7/10', 0.7], ['1/8', 0.125], ['3/8', 0.375], ['1/20', 0.05], ['1/25', 0.04], ['1/100', 0.01]];
  const DECKS = [
    { id: 'add', title: 'Addition facts', icon: '+', blurb: 'Sums up to 20', make() { const a = r(0, 10), b = r(0, 10); return { q: `${a} + ${b}`, a: a + b, key: `${Math.min(a, b)}+${Math.max(a, b)}` }; } },
    { id: 'sub', title: 'Subtraction facts', icon: '−', blurb: 'Taking away within 20', make() { const b = r(0, 10), c = r(0, 10); return { q: `${b + c} − ${b}`, a: c, key: `${b + c}−${b}` }; } },
    { id: 'times', title: 'Times tables', icon: '×', blurb: 'Up to 12 × 12', make() { const a = r(2, 12), b = r(2, 12); return { q: `${a} × ${b}`, a: a * b, key: `${Math.min(a, b)}×${Math.max(a, b)}` }; } },
    { id: 'divide', title: 'Division facts', icon: '÷', blurb: 'The times tables in reverse', make() { const a = r(2, 12), b = r(2, 12); return { q: `${a * b} ÷ ${b}`, a, key: `${a * b}÷${b}` }; } },
    { id: 'add-neg', title: 'Adding and subtracting negatives', icon: '±', blurb: '−15 to 15', make() { const a = r(-15, 15), b = r(-15, 15) || 3, sub = rand() < 0.5; return { q: `${n(a)} ${sub ? '−' : '+'} ${par(b)}`, a: sub ? a - b : a + b, key: `${a}${sub ? '-' : '+'}${b}` }; } },
    { id: 'mul-neg', title: 'Multiplying and dividing negatives', icon: '−×−', blurb: 'Signs and facts together', make() { const a = r(-12, 12) || -4, b = r(-12, 12) || 7; if (rand() < 0.5) return { q: `${n(a)} × ${par(b)}`, a: a * b, key: `${a}×${b}` }; return { q: `${n(a * b)} ÷ ${par(b)}`, a, key: `${a * b}÷${b}` }; } },
    { id: 'squares', title: 'Squares and square roots', icon: 'x²', blurb: '1² to 15², and their square roots', make() { const a = r(1, 15); return rand() < 0.55 ? { q: `${a}²`, a: a * a, key: `${a}²` } : { q: `√${a * a}`, a, key: `√${a * a}` }; } },
    { id: 'fdp', title: 'Fractions, decimals, percents', icon: '½ → %', blurb: 'Common values, converted in every direction', make() {
      const [f, d] = FDP[r(0, FDP.length - 1)], k = r(0, 3);
      if (k === 0) return { q: `${f} as a decimal`, a: d, key: `${f}→d` };
      if (k === 1) return { q: `${f} as a percent`, a: Math.round(d * 1000) / 10, key: `${f}→%`, unit: '%' };
      if (k === 2) return { q: `${d} as a percent`, a: Math.round(d * 1000) / 10, key: `${d}→%`, unit: '%' };
      return { q: `${Math.round(d * 1000) / 10}% as a decimal`, a: d, key: `${d * 100}%→d` };
    } },
    { id: 'percent-of', title: 'Percent of a number', icon: '% of', blurb: '10%, 25%, 50% and other common percents', make() {
      const p = [10, 20, 25, 50, 75, 5, 1][r(0, 6)], b = { 10: 10, 20: 5, 25: 4, 50: 2, 75: 4, 5: 20, 1: 100 }[p] * r(1, 12);
      return { q: `${p}% of ${b}`, a: p * b / 100, key: `${p}%of${b}` };
    } },
  ];
  DECKS.push({ id: 'mixed', title: 'Mixed review', icon: '+ − × ÷', blurb: 'Questions from every deck', make() { return DECKS[r(0, DECKS.length - 2)].make(); } });
  const deckById = id => DECKS.find(d => d.id === id);

  /* ---------- what is kept: best scores, and facts to work on ---------- */
  function load() { try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* fine */ } }
  const deckState = id => { const o = load(); return o[id] || { best: 0, plays: 0, weak: [] }; };
  function record(id, round) {
    const o = load(), st = o[id] || { best: 0, plays: 0, weak: [] };
    const newBest = round.score > st.best;
    st.best = Math.max(st.best, round.score); st.plays += 1; st.last = Date.now();
    // facts missed or slow (over 6 s) come back; ones answered fast twice are dropped
    const weak = new Map((st.weak || []).map(w => [w.key, w]));
    round.log.forEach(e => {
      const w = weak.get(e.key);
      if (!e.right || e.ms > 6000) weak.set(e.key, { key: e.key, q: e.q, a: e.a, unit: e.unit, fast: 0 });
      else if (w && e.ms < 3000) { w.fast = (w.fast || 0) + 1; if (w.fast >= 2) weak.delete(e.key); }
    });
    st.weak = [...weak.values()].slice(-30);
    o[id] = st; save(o);
    return newBest;
  }

  /* ---------- the deck list ---------- */
  function home(root) {
    root.innerHTML = `<h1>Speed sprints</h1>
      <p class="muted">Timed rounds of the basic facts that make later work faster. Type the answer; the next question appears as soon as your answer is correct. Facts you miss appear more often until you answer them quickly.</p>
      <div class="grid sprint-decks">${DECKS.map(d => { const st = deckState(d.id); return `<a class="card sprint-deck" href="#/sprint/${d.id}">
        <span class="sprint-icon" aria-hidden="true" style="background:none;color:var(--primary-ink);font-weight:700">${esc(d.icon)}</span><h3>${esc(d.title)}</h3><p class="muted small">${esc(d.blurb)}</p>
        <div class="row between small"><span>${st.plays ? `Best: <b>${st.best}</b>` : 'Not played yet'}</span>${(st.weak || []).length ? `<span class="muted">${H.plural(st.weak.length, 'fact')} to work on</span>` : ''}</div></a>`; }).join('')}</div>`;
  }

  /* ---------- a round ---------- */
  /** opts (a challenge): { seed, secs, rival: { name, score } } — the same facts as the rival had */
  function play(root, id, opts) {
    opts = opts || {};
    const deck = deckById(id);
    if (!deck) return V.notFound(root);
    const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
    let secs = opts.secs || 60;
    function ready() {
      const st = deckState(id);
      root.innerHTML = `<div class="sprint">
        <div class="ex-head"><a class="btn sm ghost back" href="#/sprint">← Sprints</a><h1>${esc(deck.title)}</h1></div>
        <div class="card sprint-ready">${opts.rival ? `<p class="vs-banner"><b>${esc(opts.rival.name)}</b> scored <b>${opts.rival.score}</b>. You will receive the same facts in the same order.</p>` : ''}<p>Answer as many questions as you can in <select id="sp-secs" aria-label="Round length" ${opts.seed ? 'disabled' : ''}><option value="30">30 seconds</option><option value="60" selected>1 minute</option><option value="120">2 minutes</option></select>.</p>
          <p class="muted small">Your best score: <b>${st.best}</b>${(st.weak || []).length ? ` · ${H.plural(st.weak.length, 'fact')} you missed before will appear more often` : ''}. Press Enter to skip a question you don’t know.</p>
          <button class="btn primary" id="sp-go">Start round</button></div></div>`;
      root.querySelector('#sp-secs').value = String(secs);
      root.querySelector('#sp-secs').addEventListener('change', ev => { secs = Number(ev.target.value); });
      root.querySelector('#sp-go').addEventListener('click', go);
      setTimeout(() => { const b = root.querySelector('#sp-go'); if (b) b.focus(); }, 0);
    }
    function go() {
      // every round runs from a seed; a challenge reuses the sender's, without their personal extras
      const seed = opts.seed || Math.random().toString(36).slice(2, 8);
      rand = RNG.make('sprint:' + id + ':' + seed).next;
      const weak = opts.seed ? [] : (deckState(id).weak || []).slice();
      const round = { seed, score: 0, streak: 0, bestStreak: 0, log: [], started: performance.now() };
      let cur = null, shownAt = 0, last = '', ended = false, frame = 0, locked = false;
      const next = () => {
        let it;
        for (let k = 0; k < 6; k++) {
          it = weak.length && Math.random() < 0.35 ? Object.assign({}, weak[Math.floor(Math.random() * weak.length)]) : deck.make();
          if (it.key !== last) break;
        }
        last = it.key; cur = it; round.cur = it; shownAt = performance.now();
        const q = root.querySelector('#sp-q'), inp = root.querySelector('#sp-in');
        q.textContent = it.q + ' = ?'; q.classList.remove('right', 'wrong');
        root.querySelector('#sp-unit').textContent = it.unit || '';
        inp.value = ''; if (!coarse) inp.focus();
      };
      root.innerHTML = `<div class="sprint">
        <div class="ex-head"><a class="btn sm ghost back" href="#/sprint">← Sprints</a><h1>${esc(deck.title)}</h1></div>
        <div class="card sprint-play">
          <div class="sprint-top"><span class="sprint-score" aria-label="Score">Score: <b id="sp-score">0</b></span><span class="sprint-streak" id="sp-streak"></span><span class="sprint-time" id="sp-time">${secs}s</span></div>
          <div class="sprint-bar"><span id="sp-bar"></span></div>
          <div class="sprint-q" id="sp-q" aria-live="polite"></div>
          <div class="sprint-a"><input id="sp-in" autocomplete="off" autocapitalize="off" spellcheck="false" ${coarse ? 'inputmode="none" readonly' : 'inputmode="decimal"'} aria-label="Your answer"><span id="sp-unit" class="unit"></span></div>
          <p class="tiny muted sprint-help">${coarse ? 'Tap the keys to enter your answer. Tap Skip to skip a question.' : 'Type the answer; the next question appears when it is correct. Press Enter to skip.'}</p>
          ${coarse ? `<div class="sprint-pad">${['7', '8', '9', '4', '5', '6', '1', '2', '3', '−', '0', '.'].map(k => `<button type="button" data-k="${k}">${k}</button>`).join('')}<button type="button" data-k="⌫" aria-label="Delete">⌫</button><button type="button" data-k="↵" class="skip" aria-label="Skip">Skip</button></div>` : ''}
        </div></div>`;
      const inp = root.querySelector('#sp-in');
      const tick = () => {
        if (ended || !root.isConnected) return;
        const left = Math.max(0, secs - (performance.now() - round.started) / 1000);
        root.querySelector('#sp-time').textContent = Math.ceil(left) + 's';
        root.querySelector('#sp-bar').style.width = (left / secs * 100) + '%';
        if (left <= 0) return finish();
        frame = requestAnimationFrame(tick);
      };
      const mark = (right) => {
        const ms = performance.now() - shownAt;
        round.log.push({ key: cur.key, q: cur.q, a: cur.a, unit: cur.unit, right, ms });
        S.countAnswer(right);
        if (right) { round.score += 1; round.streak += 1; round.bestStreak = Math.max(round.bestStreak, round.streak); }
        else round.streak = 0;
        root.querySelector('#sp-score').textContent = round.score;
        root.querySelector('#sp-streak').textContent = round.streak >= 3 ? `${round.streak} in a row` : '';
      };
      const typed = () => {
        if (ended || locked || !cur) return;
        const v = A.parseNumber(inp.value);
        if (!isNaN(v) && Math.abs(v - cur.a) < 1e-9) { mark(true); const q = root.querySelector('#sp-q'); q.classList.add('right'); locked = true; setTimeout(() => { locked = false; if (!ended) next(); }, 140); }
      };
      const skip = () => {
        if (ended || locked || !cur) return;
        mark(false);
        const q = root.querySelector('#sp-q');
        q.textContent = `${cur.q} = ${n(cur.a)}${cur.unit || ''}`; q.classList.add('wrong');
        locked = true; setTimeout(() => { locked = false; if (!ended) next(); }, 900);
      };
      inp.addEventListener('input', typed);
      inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); skip(); } });
      root.querySelectorAll('.sprint-pad button').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.k;
        if (k === '⌫') inp.value = inp.value.slice(0, -1);
        else if (k === '↵') return skip();
        else inp.value += k === '−' ? '-' : k;
        typed();
      }));
      function finish() {
        if (ended) return;
        ended = true; cancelAnimationFrame(frame);
        const newBest = record(id, round), st = deckState(id);
        const pts = round.score * 2;
        if (pts) S.addPoints(pts);
        S.logEvent({ kind: 'sprint', title: deck.title, right: round.score, total: round.log.length, pts, changes: [] });
        if (window.APP) APP.refreshStats();
        const missed = round.log.filter(e => !e.right), slow = round.log.filter(e => e.right && e.ms > 6000);
        const avg = round.log.filter(e => e.right).reduce((a, e) => a + e.ms, 0) / Math.max(1, round.score);
        root.querySelector('.sprint-play').innerHTML = `<div class="summary sprint-summary">
          <div class="muted small" style="text-transform:uppercase;letter-spacing:.05em;font-weight:700">${esc(deck.title)} · ${secs < 60 ? secs + ' seconds' : secs / 60 + ' minute' + (secs > 60 ? 's' : '')}</div>
          <h1 style="margin-top:6px">${newBest && st.plays > 1 ? 'New best score' : round.score ? 'Round complete' : 'Time is up'}</h1>
          <div class="score">${round.score}</div>
          <div class="what">${round.log.length ? `${Math.round(round.score / round.log.length * 100)}% correct · ${(avg / 1000).toFixed(1)} s per answer${round.bestStreak >= 3 ? ` · longest run ${round.bestStreak}` : ''}` : 'No answers were given.'} · best score ${st.best}</div>
          ${missed.length || slow.length ? `<div class="sprint-weak"><b>Facts to work on</b><ul>${missed.concat(slow).slice(0, 10).map(e => `<li>${esc(e.q)} = <b>${n(e.a)}${e.unit || ''}</b>${e.right ? ' <span class="muted small">(slow)</span>' : ''}</li>`).join('')}</ul><p class="tiny muted">These facts will appear more often in later rounds.</p></div>` : ''}
          <div class="chip" style="font-size:1rem">+${pts} points</div>
          ${opts.rival ? `<div class="vs-result ${round.score > opts.rival.score ? 'win' : round.score === opts.rival.score ? 'tie' : 'lose'}">You <b>${round.score}</b> · ${esc(opts.rival.name)} <b>${opts.rival.score}</b> — ${round.score > opts.rival.score ? 'you have the higher score.' : round.score === opts.rival.score ? 'the scores are tied.' : `${esc(opts.rival.name)} has the higher score.`}</div>` : ''}
          <div class="btn-row"><button class="btn primary" id="sp-again">Play again</button><a class="btn" href="#/sprint">Choose another sprint</a></div>
          ${window.CHALLENGE ? CHALLENGE.button({ k: 's', id, secs, seed: round.seed, score: round.score, total: round.log.length }) : ''}</div>`;
        root.querySelector('#sp-again').addEventListener('click', go);
        if (window.CHALLENGE) CHALLENGE.wire(root);
        root.__sprint = round;
      }
      round.finish = finish;                                  // for the test suite
      root.__sprint = round;
      next();
      frame = requestAnimationFrame(tick);
    }
    ready();
  }

  window.SPRINT = { DECKS, home, play, deckState };
})();
