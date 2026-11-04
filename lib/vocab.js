/* Math words in use: the glossary (#/words), tap-to-define in lessons, and flashcards (#/words/cards).

   - The glossary lists every word in lib/words.js with its definition, an example, the Procademy
     practice that uses it, a Read aloud button, and a star to keep it in your own deck. Search and grade filters.
   - VOCAB.linkify(el) underlines the first use of each word in a lesson; tapping it shows the definition.
     Only text is touched, never pictures or math layout, and everyday words (mean, range…) are left alone.
   - Flashcards come from your grade, your starred words, or every word, with spaced review: a word you
     know comes back after 3, then 7, 16, 37 days; one you don't, tomorrow and again later in the set.
     Kept per learner in STORE (words). */
'use strict';
(function () {
  const S = window.STORE, V = window.VIEWS, H = V._h, esc = H.esc, WD = window.WORDS;
  const BANDS = [['all', 'All'], ['k2', 'K–2'], ['35', '3–5'], ['6', '6th'], ['7', '7th'], ['8', '8th'], ['hs', 'High school']];
  const inBand = (w, b) => b === 'all' || (b === 'k2' && w.grade <= 2) || (b === '35' && w.grade >= 3 && w.grade <= 5) || (b === 'hs' && w.grade >= 9) || String(w.grade) === b;
  /** the learner's grade: from Profile, else the class book, else the first saved course */
  function myGrade() {
    const p = S.get().profile;
    if (p.grade != null && p.grade !== '') return Number(p.grade);
    const c = p.cpm && ACADEMY.cpmById(p.cpm.book);
    if (c && c.grade != null) return c.grade;
    const co = p.enrolled.map(id => ACADEMY.courseById(id)).filter(Boolean)[0];
    return co && co.grade != null ? co.grade : null;
  }
  const state = id => (S.get().words || {})[id] || null;
  const known = () => Object.values(S.get().words || {}).filter(w => w.ivl >= 3).length;
  /** the star on a word's card: drawn, filled when the word is starred (its color comes from .star / .star.on) */
  const starIcon = on => `<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" style="vertical-align:middle"><polygon points="10,1.5 12.6,7.2 18.8,7.8 14.1,12 15.5,18.2 10,15 4.5,18.2 5.9,12 1.2,7.8 7.4,7.2" fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
  const practiceFor = w => (window.TUTORPAGE ? TUTORPAGE.related(w.term + ' ' + w.also.join(' '), myGrade()) : []).slice(0, 2);

  /* ---------- tap to define ---------- */
  let matcher = null;
  function getMatcher() {
    if (matcher) return matcher;
    const names = [];
    WD.LIST.filter(w => w.link).forEach(w => [w.term].concat(w.also).forEach(n => names.push([n, w.id])));
    names.sort((a, b) => b[0].length - a[0].length);
    const re = new RegExp(`(^|[^A-Za-z0-9-])(${names.map(([n]) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![A-Za-z0-9-])`, 'i');
    const lookup = new Map(names.map(([n, id]) => [n.toLowerCase(), id]));
    matcher = { re, lookup };
    return matcher;
  }
  const SKIP = /^(A|BUTTON|SVG|CODE|PRE|SUP|SUB|INPUT|TEXTAREA|SELECT|LABEL|H1|H2|H3)$/i;
  /** underline the first use of each word in el (text only) */
  function linkify(el) {
    if (!el) return 0;
    const { re, lookup } = getMatcher(), used = new Set();
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        for (let p = n.parentElement; p && p !== el; p = p.parentElement) {
          if (SKIP.test(p.tagName) || p.classList.contains('frac') || p.classList.contains('sqrt') || p.namespaceURI === 'http://www.w3.org/2000/svg') return NodeFilter.FILTER_REJECT;
        }
        return n.nodeValue.trim().length > 2 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    let count = 0;
    nodes.forEach(node => {
      let cur = node;
      while (cur) {
        const m = re.exec(cur.nodeValue);
        if (!m) break;
        const id = lookup.get(m[2].toLowerCase()), start = m.index + m[1].length, end = start + m[2].length;
        if (!id || used.has(id)) {                       // already underlined once: look further along
          if (end >= cur.nodeValue.length) break;
          cur = cur.splitText(end);
          continue;
        }
        used.add(id); count++;
        const word = cur.splitText(start), after = word.splitText(m[2].length);
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'term'; b.dataset.word = id; b.textContent = word.nodeValue;
        b.setAttribute('aria-expanded', 'false');
        word.replaceWith(b);
        cur = after.nodeValue ? after : null;
      }
    });
    return count;
  }

  let pop = null;
  function closePop() { if (pop) { pop.remove(); pop = null; } document.querySelectorAll('.term[aria-expanded="true"]').forEach(b => b.setAttribute('aria-expanded', 'false')); }
  function openPop(b) {
    closePop();
    const w = WD.byId[b.dataset.word]; if (!w) return;
    pop = document.createElement('div');
    pop.className = 'term-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', w.term);
    pop.innerHTML = `<div class="row between"><b>${esc(w.term)}</b><button type="button" class="iconbtn sm" data-pop-x aria-label="Close">✕</button></div>
      <p>${esc(w.def)}</p>${w.ex ? `<p class="small muted">${esc(w.ex)}</p>` : ''}
      <div class="btn-row" style="margin:6px 0 0">${window.COACH ? COACH.speakBtn(esc(w.term) + '. ' + esc(w.def), 'Read it aloud') : ''}<a class="btn sm ghost" href="#/words/${w.id}">View the full entry</a></div>`;
    document.body.appendChild(pop);
    const r = b.getBoundingClientRect(), pw = Math.min(320, window.innerWidth - 24);
    pop.style.width = pw + 'px';
    pop.style.left = Math.max(12, Math.min(window.innerWidth - pw - 12, r.left + window.scrollX)) + 'px';
    pop.style.top = (r.bottom + window.scrollY + 6) + 'px';
    b.setAttribute('aria-expanded', 'true');
    pop.querySelector('[data-pop-x]').addEventListener('click', closePop);
  }
  let wired = false;
  function wire() {
    if (wired || typeof document === 'undefined') return;
    wired = true;
    document.addEventListener('click', ev => {
      const b = ev.target.closest && ev.target.closest('.term[data-word]');
      if (b) { ev.preventDefault(); if (b.getAttribute('aria-expanded') === 'true') closePop(); else openPop(b); return; }
      if (pop && !pop.contains(ev.target)) closePop();
    });
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape') closePop(); });
    window.addEventListener('hashchange', closePop);
  }

  /* ---------- the glossary ---------- */
  function page(root, focusId) {
    const g = myGrade(), starred = () => (S.get().profile.starredWords || []);
    let band = 'all', q = '';
    const draw = () => {
      const words = WD.LIST.filter(w => inBand(w, band) && (!q || A_norm(w.term + ' ' + w.also.join(' ') + ' ' + w.def).includes(A_norm(q)))).sort((a, b) => a.term.localeCompare(b.term));
      root.querySelector('#wd-list').innerHTML = words.length ? words.map(w => {
        const st = state(w.id), on = starred().includes(w.id), prac = practiceFor(w);
        return `<article class="card word${w.id === focusId ? ' focus' : ''}" id="w-${w.id}">
          <div class="row between" style="align-items:flex-start"><h3>${esc(w.term)}</h3><span class="row" style="gap:4px">${st && st.ivl >= 3 ? '<span class="chip up" title="You know this word">Known</span>' : ''}<span class="chip">${w.grade === 0 ? 'K' : w.grade >= 9 ? 'HS' : 'Grade ' + w.grade}</span>
            <button type="button" class="iconbtn sm star${on ? ' on' : ''}" data-star="${w.id}" aria-pressed="${on}" aria-label="${on ? 'Remove from' : 'Add to'} my flashcards" title="${on ? 'Starred' : 'Add to your flashcards'}">${starIcon(on)}</button></span></div>
          <p>${esc(w.def)}</p>${w.ex ? `<p class="small muted word-ex">${esc(w.ex)}</p>` : ''}
          ${w.also.length ? `<p class="tiny muted">Also: ${w.also.map(esc).join(', ')}</p>` : ''}
          <div class="btn-row" style="margin:6px 0 0">${window.COACH ? COACH.speakBtn(esc(w.term) + '. ' + esc(w.def) + ' ' + esc(w.ex || ''), 'Read it aloud') : ''}
            ${prac.map(id => `<a class="btn sm ghost" href="#/practice/${encodeURIComponent(id)}">Practice: ${ACADEMY.skills[id].title}</a>`).join('')}</div></article>`;
      }).join('') : '<div class="card empty">No words match. Try a shorter search.</div>';
      root.querySelector('#wd-count').textContent = `${words.length} of ${WD.LIST.length} words`;
      root.querySelectorAll('[data-band]').forEach(b => { b.classList.toggle('on', b.dataset.band === band); b.setAttribute('aria-pressed', String(b.dataset.band === band)); });
      root.querySelectorAll('[data-star]').forEach(b => b.addEventListener('click', () => {
        const id = b.dataset.star, list = starred(), on = list.includes(id);
        S.setProfile({ starredWords: on ? list.filter(x => x !== id) : list.concat(id) });
        draw();
      }));
    };
    const A_norm = t => ACADEMY.normText(t);
    root.innerHTML = `<div class="words-page">
      <div class="row between" style="flex-wrap:wrap;gap:10px"><div><h1 style="margin:0">Math words</h1><p class="muted" style="margin:4px 0 0">The words used in math class, each defined in plain language with an example. Select the star beside a word to add it to your flashcards.</p></div>
        <a class="btn primary" href="#/words/cards">Study flashcards${known() ? ` · ${known()} known` : ''}</a></div>
      <div class="card tight words-tools"><input id="wd-q" type="search" placeholder="Find a word: “slope”, “ratio”, “median”…" aria-label="Find a word" autocomplete="off">
        <div class="tabs" role="group" aria-label="Grade">${BANDS.map(([v, l]) => `<button type="button" class="tab" data-band="${v}" aria-pressed="false">${l}</button>`).join('')}</div><span class="small muted" id="wd-count"></span></div>
      <div id="wd-list" class="words-list"></div></div>`;
    root.querySelector('#wd-q').addEventListener('input', ev => { q = ev.target.value.trim(); draw(); });
    root.querySelectorAll('[data-band]').forEach(b => b.addEventListener('click', () => { band = b.dataset.band; draw(); }));
    if (focusId && WD.byId[focusId]) band = 'all';
    else if (g != null) band = g <= 2 ? 'k2' : g <= 5 ? '35' : g >= 9 ? 'hs' : String(g);
    draw();
    if (focusId) { const el = root.querySelector('#w-' + focusId); if (el) setTimeout(() => el.scrollIntoView({ block: 'center' }), 0); }
    H.tutorCtx({ notes: 'The student is looking at the glossary of math words.' });
  }

  /* ---------- flashcards ---------- */
  const GAPS = [3, 7, 16, 37, 85];
  function deckOf(kind) {
    const g = myGrade(), st = S.get().profile.starredWords || [];
    if (kind === 'starred') return WD.LIST.filter(w => st.includes(w.id));
    if (kind === 'all') return WD.LIST.slice();
    const lo = g == null ? 0 : Math.max(0, g - 1), hi = g == null ? 8 : g + 1;
    return WD.LIST.filter(w => w.grade >= lo && w.grade <= hi);
  }
  /** a set of up to n cards: words due first, then new ones (earlier grades first) */
  function pickSet(kind, n) {
    const today = S.today(), deck = deckOf(kind);
    const due = deck.filter(w => { const s = state(w.id); return s && s.due <= today; }).sort((a, b) => state(a.id).due.localeCompare(state(b.id).due));
    const fresh = deck.filter(w => !state(w.id)).sort((a, b) => a.grade - b.grade || a.term.localeCompare(b.term));
    return due.concat(fresh).slice(0, n);
  }
  function cards(root) {
    let kind = S.get().profile.starredWords && S.get().profile.starredWords.length ? 'starred' : 'grade';
    function chooser() {
      const counts = { grade: pickSet('grade', 999).length, starred: pickSet('starred', 999).length, all: pickSet('all', 999).length };
      root.innerHTML = `<div class="cards-page"><div class="ex-head"><a class="btn sm ghost back" href="#/words">← Math words</a><h1>Flashcards</h1></div>
        <div class="card"><p>Read the word and state its meaning, aloud or silently. Then flip the card and record honestly whether you knew it. Words you know return less and less often; the others return soon.</p>
          <div class="deck-pick" role="radiogroup" aria-label="Which words">${[['grade', `Words for your grade${myGrade() != null ? ` (${myGrade() === 0 ? 'K' : myGrade() >= 9 ? 'high school' : myGrade() + 'th'})` : ''}`], ['starred', 'Your starred words'], ['all', 'All words']].map(([v, l]) => `<label class="deck-opt"><input type="radio" name="deck" value="${v}" ${kind === v ? 'checked' : ''} ${counts[v] ? '' : 'disabled'}> <span><b>${l}</b><span class="small muted"> · ${counts[v] ? `${counts[v]} to review` : v === 'starred' ? 'star words in the glossary first' : 'none due today'}</span></span></label>`).join('')}</div>
          <p class="small muted">${known()} of ${WD.LIST.length} words known so far.</p>
          <button class="btn primary" id="cd-go">Start a set of 12 cards</button></div></div>`;
      root.querySelectorAll('input[name="deck"]').forEach(r => r.addEventListener('change', () => { kind = r.value; }));
      root.querySelector('#cd-go').addEventListener('click', () => play(pickSet(kind, 12)));
    }
    function play(set) {
      if (!set.length) { chooser(); V.toast('There is nothing to review in that deck today.'); return; }
      const queue = set.slice(), results = { knew: 0, notyet: 0, again: new Set() };
      let flipped = false;
      const show = () => {
        if (!queue.length) return done();
        const w = queue[0];
        root.innerHTML = `<div class="cards-page"><div class="ex-head"><a class="btn sm ghost back" href="#/words/cards">← Decks</a><h1>Flashcards</h1><span class="muted small">${queue.length} remaining</span></div>
          <button type="button" class="flashcard${flipped ? ' flipped' : ''}" id="fc" aria-label="${flipped ? 'Definition' : 'Flip the card to see what it means'}">
            ${flipped ? `<span class="fc-term small muted">${esc(w.term)}</span><span class="fc-def">${esc(w.def)}</span>${w.ex ? `<span class="fc-ex">${esc(w.ex)}</span>` : ''}` : `<span class="fc-term">${esc(w.term)}</span><span class="fc-hint small muted">What does it mean? Select the card to flip it.</span>`}</button>
          <div class="btn-row fc-actions">${flipped ? `<button class="btn" id="fc-no">Not yet <span class="muted small">(1)</span></button><button class="btn primary" id="fc-yes">I knew it <span class="small">(2)</span></button>` : `<button class="btn primary" id="fc-flip">Flip the card <span class="small">(Space)</span></button>`}${window.COACH ? COACH.speakBtn(esc(w.term) + (flipped ? '. ' + esc(w.def) : ''), 'Read it aloud') : ''}</div></div>`;
        root.querySelector('#fc').addEventListener('click', () => { flipped = !flipped; show(); });
        const f = root.querySelector('#fc-flip'); if (f) { f.addEventListener('click', () => { flipped = true; show(); }); f.focus(); }
        const yes = root.querySelector('#fc-yes'), no = root.querySelector('#fc-no');
        if (yes) { yes.addEventListener('click', () => answer(true)); yes.focus(); }
        if (no) no.addEventListener('click', () => answer(false));
      };
      const answer = good => {
        const w = queue.shift(), st = state(w.id) || { ivl: 0, seen: 0, right: 0 };
        if (results.again.has(w.id)) { if (good) results.knew += 0; }                     // a second look in the same set changes nothing more
        else {
          const ivl = good ? (GAPS.find(x => x > (st.ivl || 0)) || 90) : 1;
          S.setWord(w.id, { ivl: good ? ivl : 1, due: S.dayShift(S.today(), good ? ivl : 1), seen: (st.seen || 0) + 1, right: (st.right || 0) + (good ? 1 : 0) });
          if (good) results.knew++; else { results.notyet++; results.again.add(w.id); queue.splice(Math.min(3, queue.length), 0, w); }
        }
        flipped = false; show();
      };
      const done = () => {
        if (results.knew) S.addPoints(results.knew * 2);
        S.logEvent({ kind: 'cards', title: 'Math words', right: results.knew, total: results.knew + results.notyet, pts: results.knew * 2, changes: [] });
        if (window.APP) APP.refreshStats();
        root.innerHTML = `<div class="cards-page"><div class="card summary"><div class="muted small" style="text-transform:uppercase;letter-spacing:.05em;font-weight:700">Flashcards</div>
          <h1 style="margin-top:6px">${results.notyet ? 'Session complete' : 'All words known'}</h1><div class="score">${results.knew} / ${results.knew + results.notyet}</div>
          <div class="what">${results.notyet ? `${H.plural(results.notyet, 'word')} will return tomorrow.` : 'These words will return in a few days for review.'} ${known()} of ${WD.LIST.length} words known.</div>
          <div class="chip" style="font-size:1rem">+${results.knew * 2} energy points</div>
          <div class="btn-row"><a class="btn primary" href="#/words/cards" id="cd-more">Study more cards</a><a class="btn" href="#/words">View all words</a></div></div></div>`;
        root.__cards = results;
        const more = root.querySelector('#cd-more'); more.addEventListener('click', ev => { ev.preventDefault(); chooser(); });
      };
      if (root.__cardKeys) document.removeEventListener('keydown', root.__cardKeys);
      root.__cardKeys = ev => {
        if (!root.isConnected || !root.querySelector('#fc')) return;
        if (ev.key === ' ' && !root.querySelector('#fc-yes')) { ev.preventDefault(); flipped = true; show(); }
        else if (ev.key === '1' && root.querySelector('#fc-no')) answer(false);
        else if (ev.key === '2' && root.querySelector('#fc-yes')) answer(true);
      };
      document.addEventListener('keydown', root.__cardKeys);
      root.__cards = results;
      show();
    }
    chooser();
    root.__play = play;                                    // for the test suite
  }

  window.VOCAB = { linkify, page, cards, pickSet, deckOf, known, myGrade, wire };
  wire();
})();
