/* Printable worksheets: any skill, unit or CPM lesson as a sheet of fresh questions, with an answer key
   (and the worked steps, if wanted) on its own page. Routes: #/worksheet/skill/<id>,
   #/worksheet/unit/<course>/<unit>, #/worksheet/lesson/<book>/<lesson>. Questions come from the same
   generators as practice, so every sheet is new, every answer has been checked, and it all works offline.
   The set's code is printed at the bottom: the same code always rebuilds the same sheet. */
'use strict';
(function () {
  const A = window.ACADEMY, V = window.VIEWS, H = V._h, esc = H.esc;
  const SIZES = [6, 10, 12, 16, 20, 30];

  /** what the sheet is about: its title, its skills and where Back goes */
  function sourceOf(kind, a, b) {
    if (kind === 'skill' && A.skills[a] && A.whereIs(a)) {
      const w = A.whereIs(a);
      return { title: H.plain(A.skills[a].title), sub: `${w.course.title} · ${w.unit.title}`, skills: [a], back: `#/skill/${encodeURIComponent(a)}`, n: 12 };
    }
    if (kind === 'unit') {
      const c = A.courseById(a), u = A.unitById(a, b);
      if (c && u) return { title: u.title, sub: `${c.title} · Unit ${c.units.indexOf(u) + 1}`, skills: u.skills.filter(id => A.skills[id]), back: `#/unit/${c.id}/${u.id}`, n: 16 };
    }
    if (kind === 'lesson' && A.cpmLesson) {
      const f = A.cpmLesson(a, b);
      if (f) {
        const ids = f.lesson.skills.filter(id => A.skills[id]);
        if (ids.length) return { title: `${f.book.short} ${window.CPMVIEWS ? CPMVIEWS.lessonName(f.lesson) : f.lesson.id}`, sub: f.lesson.topic, skills: ids, back: `#/cpm/${f.book.id}/${encodeURIComponent(f.lesson.id)}`, n: 12 };
      }
    }
    return null;
  }
  /** n questions, taking the skills in turn; no two alike */
  function build(src, n, seed) {
    const out = [], seen = new Set();
    for (let k = 0; out.length < n && k < n * 8; k++) {
      const sid = src.skills[out.length % src.skills.length];
      const q = A.question(sid, `ws-${seed}-${k}`);
      const key = A.normText(A.stripTags(q.prompt));
      if (seen.has(key) && k < n * 6) continue;
      seen.add(key);
      out.push({ sid, q });
    }
    return out;
  }
  const newSeed = () => Math.random().toString(36).slice(2, 7);
  const answerArea = q => (q.type === 'choice'
    ? `<ol class="ws-choices">${q.choices.map(c => `<li>${c}</li>`).join('')}</ol>`
    : `<div class="ws-line">Answer: ${q.unit === '$' ? '$' : ''}<span class="ws-blank"></span>${q.unit && q.unit !== '$' ? ' ' + q.unit : ''}</div>`);
  const answerOf = q => (q.type === 'choice' ? `${'ABCDEFGH'[q.answerIndex]}. ${q.choices[q.answerIndex]}` : A.answerText(q));
  /** the sheet itself and, if wanted, its answer key on a page of its own */
  const sheets = (title, sub, items, foot, st) => `
        <article class="ws-sheet">
          <header class="ws-head"><div><div class="ws-brand">Procademy worksheet</div><h1>${esc(title)}</h1><p>${esc(sub)}</p></div>
            <div class="ws-name"><div>Name <span class="ws-blank long"></span></div><div>Date <span class="ws-blank"></span></div><div>Score <span class="ws-blank short"></span> / ${items.length}</div></div></header>
          <ol class="ws-qs">${items.map(({ q }) => `<li class="ws-q"><div class="ws-prompt">${q.prompt}</div>${answerArea(q)}</li>`).join('')}</ol>
          <footer class="ws-foot">${esc(foot)}</footer>
        </article>
        ${st.key ? `<article class="ws-sheet ws-key"><header class="ws-head"><div><div class="ws-brand">Procademy answer key</div><h1>${esc(title)}</h1><p>${esc(foot)}</p></div></header>
          <ol class="ws-answers">${items.map(({ q }) => `<li><b>${answerOf(q)}</b>${st.steps ? `<div class="ws-steps">${q.hints.map(h => `<div>${h}</div>`).join('')}</div>` : ''}</li>`).join('')}</ol></article>` : ''}`;

  /** a set already practiced, ready to print with its answer key: { title, sub, items: [{ q }], back, backLabel } */
  function sheet(root, src) {
    const st = { key: true, steps: false };
    function render() {
      root.innerHTML = `
        <div class="ws-controls card tight">
          <div class="row between" style="flex-wrap:wrap;gap:10px">
            <div><a class="btn sm ghost" href="${src.back}">← ${esc(src.backLabel || 'Back')}</a> <b style="margin-left:6px">Print this set</b> <span class="muted small">· ${esc(src.title)}</span></div>
            <div class="btn-row" style="margin:0">
              <label class="small"><input type="checkbox" id="ws-key" ${st.key ? 'checked' : ''}> Answer key</label>
              <label class="small"><input type="checkbox" id="ws-steps" ${st.steps ? 'checked' : ''} ${st.key ? '' : 'disabled'}> Include the steps</label>
              <button class="btn sm primary" id="ws-print">Print or save as PDF</button>
            </div>
          </div>
          <p class="tiny muted" style="margin:8px 0 0">The same questions you just practiced. The answer key prints on its own page.</p>
        </div>${sheets(src.title, src.sub, src.items, `${src.items.length} questions`, st)}`;
      root.querySelector('#ws-key').addEventListener('change', ev => { st.key = ev.target.checked; render(); });
      root.querySelector('#ws-steps').addEventListener('change', ev => { st.steps = ev.target.checked; render(); });
      root.querySelector('#ws-print').addEventListener('click', () => window.print());
      root.__worksheet = { items: src.items, seed: null };          // for the test suite
    }
    render();
    window.scrollTo(0, 0);
  }

  function page(root, kind, a, b) {
    const src = sourceOf(kind, a, b);
    if (!src) return V.notFound(root);
    const st = { n: src.n, seed: newSeed(), key: true, steps: false };
    function render() {
      const items = build(src, st.n, st.seed);
      root.innerHTML = `
        <div class="ws-controls card tight">
          <div class="row between" style="flex-wrap:wrap;gap:10px">
            <div><a class="btn sm ghost" href="${src.back}">← Back</a> <b style="margin-left:6px">Worksheet</b> <span class="muted small">· ${esc(src.title)}</span></div>
            <div class="btn-row" style="margin:0">
              <label class="small">Questions <select id="ws-n">${SIZES.map(k => `<option ${k === st.n ? 'selected' : ''}>${k}</option>`).join('')}</select></label>
              <label class="small"><input type="checkbox" id="ws-key" ${st.key ? 'checked' : ''}> Answer key</label>
              <label class="small"><input type="checkbox" id="ws-steps" ${st.steps ? 'checked' : ''} ${st.key ? '' : 'disabled'}> Include the steps</label>
              <button class="btn sm" id="ws-new">New questions</button>
              <button class="btn sm primary" id="ws-print">Print or save as PDF</button>
            </div>
          </div>
          <p class="tiny muted" style="margin:8px 0 0">Every sheet is new. The answer key prints on its own page, so it can be kept separately. This page also works offline.</p>
        </div>${sheets(src.title, src.sub, items, `Set ${st.seed} · ${items.length} questions`, st)}`;
      root.querySelector('#ws-n').addEventListener('change', ev => { st.n = Number(ev.target.value); render(); });
      root.querySelector('#ws-key').addEventListener('change', ev => { st.key = ev.target.checked; render(); });
      root.querySelector('#ws-steps').addEventListener('change', ev => { st.steps = ev.target.checked; render(); });
      root.querySelector('#ws-new').addEventListener('click', () => { st.seed = newSeed(); render(); });
      root.querySelector('#ws-print').addEventListener('click', () => window.print());
      root.__worksheet = { items, seed: st.seed };          // for the test suite
    }
    render();
  }

  window.WORKSHEET = { page, build, sourceOf, sheet };
})();
