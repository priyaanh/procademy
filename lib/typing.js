/* Typing practice (#/typing, a Tools card): type math words, or the words with their meanings, from the math
   glossary (lib/words.js), at the learner's grade. Speed is words per minute (the letters of the words typed
   right, and a space after each, divided by 5, per minute); accuracy is the share of letters typed right the
   first time. Gentle by design: no countdown, a mistake never stops you, capital letters don't matter, and on a
   phone the set starts short. Space or Enter moves on; Backspace fixes the word you're on; Esc starts again.
   The best speed for each kind is kept per learner (profile.typing). */
'use strict';
(function () {
  const S = window.STORE, V = window.VIEWS, H = V && V._h, esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const KINDS = [['words', 'Math words'], ['defs', 'Words and meanings']];
  const LENGTHS = [[12, 'Short'], [25, 'Medium'], [50, 'Long']];
  const fold = s => String(s).replace(/[’‘]/g, '\'').toLowerCase();
  const TYPEABLE = /^[A-Za-z0-9 ,.;:'()/-]+$/;

  /** the learner's grade, for which words to use */
  const grade = () => (window.VOCAB && VOCAB.myGrade ? VOCAB.myGrade() : null);
  /** the words to type: n or a few more, from the glossary, at or below the learner's grade (seeded, so a set can be typed again) */
  function passage(kind, n, seed) {
    const rng = RNG.make('typing:' + seed), g = grade(), all = (window.WORDS ? WORDS.LIST : []);
    let pool = all.filter(w => g == null || w.grade <= Math.max(2, g + 1));
    if (pool.length < 20) pool = all.slice();
    const out = [];
    for (const w of rng.shuffle(pool)) {
      if (out.length >= n) break;
      if (kind === 'defs') {
        const d = w.def.replace(/[’‘]/g, '\'');
        if (!TYPEABLE.test(d) || d.length > 90) continue;
        out.push(...`${w.term}: ${d}`.split(' '));
      } else out.push(...w.term.split(' '));
    }
    return out;
  }
  /** speed and accuracy: typed is the list of words as finally typed, ms the time taken, keys/right the letters pressed and pressed right */
  function score(target, typed, ms, keys, right) {
    let chars = 0, good = 0;
    const missed = [];
    typed.forEach((t, i) => { if (fold(t) === fold(target[i])) { good++; chars += target[i].length + 1; } else if (!missed.includes(target[i])) missed.push(target[i]); });
    const min = Math.max(ms, 1000) / 60000;
    return { wpm: Math.round(chars / 5 / min), accuracy: keys ? Math.round(100 * right / keys) : 100, good, of: typed.length, missed };
  }
  const best = () => (S.get().profile.typing && S.get().profile.typing.best) || {};
  const clock = ms => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const coarse = () => typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const seg = (id, label, list, on) => `<div class="ty-opt"><span class="ty-label" id="${id}-l">${label}</span><div class="seg" role="radiogroup" aria-labelledby="${id}-l" id="${id}">${list.map(([v, l]) => `<button type="button" role="radio" data-v="${v}" aria-checked="${String(v) === String(on)}">${l}</button>`).join('')}</div></div>`;

  let kind = 'words', len = null;
  function page(root) {
    if (len == null) len = coarse() ? 12 : 25;
    const b = best();
    root.innerHTML = `<div class="typing"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a> › <a href="#/tools">Tools</a> › <span>Typing practice</span></nav>
      <h1>Typing practice</h1><p class="muted">Type math words, or the words with their meanings, at your own pace. You’ll see your speed in words per minute and how many letters you typed right.</p>
      <div class="card ty-setup">
        ${seg('ty-kind', 'What to type', KINDS, kind)}
        ${seg('ty-len', 'How long', LENGTHS.map(([n, l]) => [n, `${l} <span class="ty-n">· ${n} words</span>`]), len)}
        <p class="small muted ty-best">${b.words || b.defs ? `Your best: ${[b.words ? `${b.words} words per minute on math words` : '', b.defs ? `${b.defs} on words and meanings` : ''].filter(Boolean).join(', ')}.` : 'There’s no clock to beat: the timer starts with your first letter, and you can take as long as you need.'}</p>
        <div class="btn-row" style="margin:0"><button type="button" class="btn primary" id="ty-go">Start typing</button></div>
      </div></div>`;
    const pick = (id, fn) => root.querySelector('#' + id).addEventListener('click', ev => { const btn = ev.target.closest('[data-v]'); if (!btn) return; root.querySelectorAll(`#${id} [data-v]`).forEach(x => x.setAttribute('aria-checked', String(x === btn))); fn(btn.dataset.v); });
    pick('ty-kind', v => { kind = v; });
    pick('ty-len', v => { len = Number(v); });
    root.querySelector('#ty-go').addEventListener('click', () => run(root, passage(kind, len, Date.now().toString(36)), kind));
    if (H && H.tutorCtx) H.tutorCtx({ notes: 'The student is on the typing practice page, which uses math vocabulary.' });
  }

  /** one set: the words, one at a time, with live speed and accuracy */
  function run(root, words, k) {
    let i = 0, t0 = 0, keys = 0, right = 0, last = '', tick = 0;
    const typed = [];
    root.innerHTML = `<div class="typing"><div class="ex-head"><a class="btn sm ghost back" href="#/typing" id="ty-back">← Typing practice</a><h1>${k === 'defs' ? 'Words and meanings' : 'Math words'}</h1><span class="stat-pill ty-live" id="ty-live" aria-label="Speed and accuracy so far">0 wpm · 100%</span></div>
      <div class="card ty-run">
        <div class="ty-text" id="ty-text" aria-hidden="true">${words.map((w, n) => `<span class="ty-w" data-n="${n}">${esc(w)}</span>`).join(' ')}</div>
        <p class="visually-hidden" id="ty-now" aria-live="polite"></p>
        <label class="visually-hidden" for="ty-in">Type the highlighted word, then press Space</label>
        <input id="ty-in" class="ty-in" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="next" aria-describedby="ty-now">
        <p class="tiny muted ty-help">Press Space or Enter after each word. Backspace fixes the word you’re on, and capital letters don’t matter.${coarse() ? '' : ' Esc starts again.'}</p>
      </div></div>`;
    const box = root.querySelector('#ty-text'), input = root.querySelector('#ty-in'), live = root.querySelector('#ty-live'), now = root.querySelector('#ty-now');
    const span = n => box.querySelector(`[data-n="${n}"]`);
    root.querySelector('#ty-back').addEventListener('click', ev => { ev.preventDefault(); clearInterval(tick); page(root); });
    const mark = () => {
      box.querySelectorAll('.ty-w.now').forEach(x => x.classList.remove('now', 'off'));
      const sp = span(i);
      if (sp) { sp.classList.add('now'); const top = sp.offsetTop - box.offsetTop; if (top < box.scrollTop || top > box.scrollTop + box.clientHeight - sp.offsetHeight) box.scrollTop = Math.max(0, top - 8); }
      now.textContent = i < words.length ? `Next word: ${words[i]}` : '';
    };
    const stats = () => score(words, typed, t0 ? Date.now() - t0 : 0, keys, right);
    const show = () => { const st = stats(); live.textContent = `${st.wpm} wpm · ${st.accuracy}%`; };
    const commit = word => {
      if (i >= words.length || !word) return;
      typed.push(word);
      const sp = span(i), ok = fold(word) === fold(words[i]);
      sp.classList.remove('now', 'off'); sp.classList.add(ok ? 'ok' : 'miss');
      if (!ok) sp.title = `You typed ${word}`;
      i++;
      input.value = ''; last = '';
      show();
      if (i >= words.length) return finish();
      mark();
    };
    input.addEventListener('input', () => {
      const v = input.value;
      if (!t0 && v) { t0 = Date.now(); tick = setInterval(() => { if (!root.isConnected || !input.isConnected) return clearInterval(tick); show(); }, 1000); }
      // each letter added at the end counts once, right or not, against the letter it should be
      // (a phone's swipe keyboard or a paste adds several at once: each is counted the same way)
      if (v.length > last.length && v.startsWith(last)) {
        for (let p = last.length; p < v.length && !/\s/.test(v[p]); p++) { keys++; const want = (words[i] || '')[p]; if (want != null && fold(want) === fold(v[p])) right++; }
      }
      last = v;
      if (/\s/.test(v)) { const parts = v.split(/\s+/); const w = parts.shift(); if (w) commit(w); else { input.value = parts.join(''); last = input.value; } return; }
      const sp = span(i);
      if (sp) sp.classList.toggle('off', !fold(words[i]).startsWith(fold(v)));
      if (i === words.length - 1 && fold(v) === fold(words[i])) commit(v);      // the last word ends the set by itself
    });
    input.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') { ev.preventDefault(); commit(input.value.trim()); }
      else if (ev.key === 'Escape') { ev.preventDefault(); clearInterval(tick); run(root, words, k); }
    });
    function finish() {
      clearInterval(tick);
      const st = stats(), ms = Date.now() - t0, was = best()[k] || 0, newBest = st.wpm > was && st.good > 0;
      if (newBest) S.setProfile({ typing: Object.assign({}, S.get().profile.typing, { best: Object.assign({}, best(), { [k]: st.wpm }) }) });
      root.__typing = st;
      root.innerHTML = `<div class="typing"><div class="card summary ty-done"><div class="muted small" style="text-transform:uppercase;letter-spacing:.05em;font-weight:700">Typing practice</div>
        <h1 style="margin-top:6px">${st.accuracy >= 90 ? 'Nice typing' : 'Set complete'}</h1>
        <div class="ty-stats"><div><b>${st.wpm}</b><span>words per minute</span></div><div><b>${st.accuracy}%</b><span>letters typed right</span></div><div><b>${clock(ms)}</b><span>time</span></div></div>
        <p class="what">${newBest ? (was ? `A new best, up from ${was} words per minute.` : 'That’s your first score to beat.') : `Your best is ${was} words per minute.`} ${st.good} of ${st.of} words typed right.</p>
        ${st.missed.length ? `<p class="small">Words to practice: ${st.missed.slice(0, 8).map(w => `<b>${esc(w)}</b>`).join(', ')}</p>` : ''}
        <div class="btn-row"><button type="button" class="btn" id="ty-again">Type the same words again</button><button type="button" class="btn primary" id="ty-new">New words</button></div></div></div>`;
      root.querySelector('#ty-again').addEventListener('click', () => run(root, words, k));
      root.querySelector('#ty-new').addEventListener('click', () => run(root, passage(k, len || 25, Date.now().toString(36)), k));
      root.querySelector('#ty-new').focus();
    }
    mark();
    input.focus();
    root.__run = { words, commit, input };
  }

  window.TYPING = { page, run, passage, score };
})();
