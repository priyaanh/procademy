/* Challenge a friend: after a practice set, a CPM lesson set or a speed sprint, make a link that gives a
   friend exactly the same questions (the same seed) with your score, and shows who won when they finish.
   Everything is in the link itself: no account, no server, nothing stored anywhere else. A name goes in
   it only if the box is ticked. A link is untrusted input, so every field is checked before it is used. */
'use strict';
(function () {
  const A = window.ACADEMY, E = window.ENGINE, S = window.STORE, V = window.VIEWS, D = window.DRAW, H = V._h, esc = H.esc;
  const SEED = /^[a-z0-9-]{1,40}$/i;
  const int = (v, max) => (Number.isInteger(v) && v >= 0 && v <= max ? v : null);

  /** a link's contents, checked: { k, id | book+lesson, seed, score, total, secs, name } or null */
  function read(code) {
    let o;
    try { o = JSON.parse(D.decode(code) || 'null'); } catch (e) { return null; }
    if (!o || typeof o !== 'object' || !SEED.test(String(o.seed || ''))) return null;
    const out = { k: o.k, seed: String(o.seed), score: int(o.score, 999), total: int(o.total, 999) };
    if (out.score == null) return null;
    out.name = typeof o.name === 'string' ? o.name.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 24) : '';
    if (o.k === 'p') { if (!A.skills[o.id] || !A.whereIs(o.id)) return null; out.id = o.id; if (out.total == null) return null; }
    else if (o.k === 'l') { const f = A.cpmLesson(String(o.book), String(o.lesson)); if (!f || !f.lesson.skills.some(id => A.skills[id])) return null; out.book = f.book.id; out.lesson = f.lesson.id; if (out.total == null) return null; }
    else if (o.k === 's') { if (!window.SPRINT || !SPRINT.DECKS.some(d => d.id === o.id) || ![30, 60, 120].includes(o.secs)) return null; out.id = o.id; out.secs = o.secs; }
    else return null;
    return out;
  }
  const what = c => (c.k === 'p' ? `${H.plain(A.skills[c.id].title)} · ${H.plural(c.total, 'question')}`
    : c.k === 'l' ? (() => { const f = A.cpmLesson(c.book, c.lesson); return `${f.book.short} ${CPMVIEWS.lessonName(f.lesson)} · ${H.plural(c.total, 'question')}`; })()
    : `Speed sprint: ${SPRINT.DECKS.find(d => d.id === c.id).title} · ${c.secs < 60 ? c.secs + ' seconds' : c.secs / 60 + ' minute' + (c.secs > 60 ? 's' : '')}`);
  const scoreText = c => (c.k === 's' ? String(c.score) : `${c.score} / ${c.total}`);

  /** the "Challenge a friend" box for a summary; info = { k, id | book+lesson, seed, score, total, secs } */
  function button(info, label) {
    return `<div class="vs-box"><button type="button" class="btn" data-vs="${esc(JSON.stringify(info))}">${esc(label || 'Challenge a friend')}</button>
      <span class="small muted">Your friend receives ${info.k === 's' ? 'the same facts' : 'exactly these questions'} and sees your score.</span><div class="vs-make" hidden></div></div>`;
  }
  function wire(root) {
    root.querySelectorAll('[data-vs]').forEach(b => b.addEventListener('click', () => {
      const info = JSON.parse(b.dataset.vs), box = b.parentElement.querySelector('.vs-make');
      box.hidden = !box.hidden;
      if (box.hidden) return;
      const name = S.get().profile.name || '';
      box.innerHTML = `<label class="small"><input type="checkbox" id="vs-name-on" ${name ? 'checked' : ''}> Include my name in the link: <input id="vs-name" maxlength="24" value="${esc(name)}" placeholder="Your first name" aria-label="Name to show"></label>
        <div class="btn-row"><button class="btn sm primary" id="vs-copy" type="button">Copy the link</button>${navigator.share ? '<button class="btn sm" id="vs-share" type="button">Share…</button>' : ''}</div>
        <p class="tiny muted">Send it to a friend. The link contains only the questions’ code and your score${name ? ' (and your name, if selected)' : ''}.</p>`;
      const link = () => {
        const nm = box.querySelector('#vs-name-on').checked ? box.querySelector('#vs-name').value.trim().slice(0, 24) : '';
        return (window.MOVE ? MOVE.siteBase() : location.href.split('#')[0]) + '#/vs/' + D.encode(JSON.stringify(Object.assign({}, info, nm ? { name: nm } : {})));
      };
      if (window.MOVE) box.querySelector('.btn-row').appendChild(MOVE.qrButton(box, link));
      box.querySelector('#vs-copy').addEventListener('click', () => {
        const url = link(); CHALLENGE._last = url;
        try { navigator.clipboard.writeText(url).then(() => V.toast('Challenge link copied.'), () => V.toast('The link could not be copied: ' + url)); } catch (e) { V.toast('The link could not be copied.'); }
        if (window.BADGES) BADGES.flag('challenge');
      });
      const sh = box.querySelector('#vs-share');
      if (sh) sh.addEventListener('click', () => { navigator.share({ title: 'A Procademy challenge', text: `Can you beat my score of ${scoreText(info)}?`, url: link() }).then(() => { if (window.BADGES) BADGES.flag('challenge'); }, () => {}); });
    }));
  }

  /** #/vs/<code>: the challenge, then the same questions, then who won */
  function page(root, code) {
    const c = read(code);
    if (!c) { root.innerHTML = `<div class="card empty"><h1>This challenge link does not work</h1><p class="muted">It may have been shortened when it was copied, or created by a newer version of Procademy.</p><a class="btn primary" href="#/">Home</a></div>`; return; }
    const who = c.name || 'A friend';
    root.innerHTML = `<div class="card vs-card"><h1>${esc(who)} has sent you a challenge</h1>
      <p class="vs-what">${esc(what(c))}</p><p>${esc(who)} scored <b>${scoreText(c)}</b>. You will receive ${c.k === 's' ? 'the same facts, in the same order' : 'exactly the same questions'}.</p>
      <div class="btn-row" style="justify-content:center"><button class="btn primary" id="vs-go">Accept the challenge</button><a class="btn ghost" href="#/">Decline</a></div></div>`;
    root.querySelector('#vs-go').addEventListener('click', () => {
      if (window.BADGES) BADGES.flag('challenge');
      if (c.k === 's') { SPRINT.play(root, c.id, { seed: c.seed, secs: c.secs, rival: { name: who, score: c.score } }); const go = root.querySelector('#sp-go'); if (go) go.click(); return; }
      const start = () => {
        let s;
        if (c.k === 'p') s = E.start('practice', { skillId: c.id, seed: c.seed });
        else { const f = A.cpmLesson(c.book, c.lesson); s = E.start('mix', { skills: f.lesson.skills.filter(id => A.skills[id]), title: `${f.book.short} · ${CPMVIEWS.lessonName(f.lesson)}`, cpm: { book: f.book.id, lesson: f.lesson.id }, seed: c.seed }); }
        H.exercise(root, s, {
          back: '#/', backLabel: 'Home', again: start, againLabel: 'Try the same questions again', challengeLabel: `Challenge ${who === 'A friend' ? 'them' : who} back`,
          summaryExtra(sess, f) {
            const win = f.right > c.score, tie = f.right === c.score;
            return `<div class="vs-result ${win ? 'win' : tie ? 'tie' : 'lose'}">You <b>${f.right} / ${f.total}</b> · ${esc(who)} <b>${scoreText(c)}</b> — ${win ? 'you have the higher score.' : tie ? 'the scores are tied.' : `${esc(who)} has the higher score. You may try the same questions again.`}</div>`;
          },
        });
      };
      start();
    });
  }

  const CHALLENGE = { read, button, wire, page, _last: null };
  window.CHALLENGE = CHALLENGE;
})();
