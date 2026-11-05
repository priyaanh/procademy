/* Find your starting point (#/placement/<course>): one question from the end of each unit, in order, with no hints and
   an “I don’t know” for anything unfamiliar. A unit answered right is one the learner already knows; the first unit
   missed is where practice starts. The start is kept in profile.placed and steers today's practice, Continue and
   Up next (ENGINE.courseOrder). Skills answered right rise to Familiar; nothing is ever lowered, and a missed
   question doesn't go on the review list (ENGINE.finish). */
'use strict';
(function () {
  const A = window.ACADEMY, E = window.ENGINE, S = window.STORE, V = window.VIEWS, H = V._h, esc = H.esc;
  const minutes = n => Math.max(2, Math.round(n * 0.4));
  const unitNo = (c, id) => c.units.findIndex(u => u.id === id) + 1;

  /** the course page's line about it: an offer to find the starting point, or where it is */
  function courseCard(c) {
    const p = (S.get().profile.placed || {})[c.id], n = E.placementPlan(c).length;
    if (!n) return '';
    if (!p) return `<div class="place-call">${ICONS.svg('target', 22)}<div><b>New to this course?</b><div class="small muted">Find your starting point: one question from each unit, about ${minutes(n)} minutes. Practice then starts where you need it.</div></div><a class="btn sm primary" href="#/placement/${c.id}">Find my starting point</a></div>`;
    const u = p.start && A.unitById(c.id, p.start);
    return `<div class="place-call">${ICONS.svg('flag', 22)}<div><b>${u ? `Your starting point: Unit ${unitNo(c, u.id)}, ${esc(u.title)}` : 'You knew every unit we checked'}</b><div class="small muted">${u ? 'Today’s practice and Continue start here.' : 'Try the course challenge to raise your skill levels further.'}</div></div>${u ? `<a class="btn sm primary" href="${H.unitHref(c, u)}">Start here</a>` : ''}<a class="btn sm ghost" href="#/placement/${c.id}">Check again</a></div>`;
  }

  function page(root, cid) {
    const c = A.courseById(cid);
    if (!c) return V.notFound(root);
    H.tutorCtx(null);
    const n = E.placementPlan(c).length;
    root.innerHTML = `<div class="ex"><div class="ex-head"><a class="btn sm ghost back" href="${H.courseHref(c)}">← <span class="back-long">${esc(c.title)}</span><span class="back-short">Back</span></a></div>
      <div class="card place-intro" ${H.courseVar(c)}>
        <div class="row">${H.mono(c.icon, 'icon-big mono')}<div><div class="muted small">Find your starting point</div><h1 style="margin:0">${esc(c.title)}</h1></div></div>
        <p>${H.plural(n, 'question')}, one from each unit, so your practice starts in the right place. It takes about ${minutes(n)} minutes.</p>
        <ul class="place-points">
          <li>${ICONS.svg('check', 20)}<span>There are no hints, so it shows what you already know.</span></li>
          <li>${ICONS.svg('info', 20)}<span>Not sure? Choose <b>I don’t know</b>. That’s completely fine, and it helps.</span></li>
          <li>${ICONS.svg('star', 20)}<span>Nothing you’ve already earned can go down.</span></li>
        </ul>
        <div class="btn-row"><button class="btn primary" id="pl-go" type="button">Start</button><a class="btn" href="${H.courseHref(c)}">Not now</a></div>
      </div></div>`;
    root.querySelector('#pl-go').addEventListener('click', () => {
      H.exercise(root, E.start('placement', { courseId: c.id }), { back: H.courseHref(c), backLabel: c.title, result: (s, f) => result(root, c, f) });
    });
  }

  function result(root, c, f) {
    const p = f.placed || { start: null, known: [] }, u = p.start && A.unitById(c.id, p.start);
    const checked = E.placementPlan(c).map(x => x.unitId);
    const rows = c.units.filter(x => checked.includes(x.id)).map(x => {
      const known = p.known.includes(x.id), here = x.id === p.start;
      return `<li class="${known ? 'known' : here ? 'here' : ''}">${ICONS.svg(known ? 'check' : here ? 'flag' : 'target', 20)}<span><b>Unit ${unitNo(c, x.id)}</b> ${esc(x.title)}</span>${here ? '<span class="chip up">Start here</span>' : ''}</li>`;
    }).join('');
    const head = !u ? 'You know this course well' : p.known.length ? 'Here’s your starting point' : 'Let’s start at the beginning';
    const what = !u ? `You answered a question from every unit correctly. The course challenge can raise your skill levels further.`
      : p.known.length ? `You already know ${H.plural(p.known.length, 'unit')} we checked. Practice starts with Unit ${unitNo(c, u.id)}, ${esc(u.title)}.`
      : `Unit 1 is the right place to begin. Each skill has a lesson, a worked example and hints, so you can learn as you go.`;
    root.innerHTML = `<div class="ex"><div class="card summary place-result" ${H.courseVar(c)}>
      <div class="muted small" style="text-transform:uppercase;letter-spacing:.05em;font-weight:700">${esc(c.title)}</div>
      <h1 style="margin-top:6px">${head}</h1>
      <p class="what">${what}</p>
      <ul class="place-units">${rows}</ul>
      <div class="chip" style="font-size:1rem">+${H.fmt(f.pts)} points</div>
      <div class="btn-row">
        ${u ? `<a class="btn primary" href="#/daily">Start today’s practice</a><a class="btn" href="${H.unitHref(c, u)}">See Unit ${unitNo(c, u.id)}</a>` : `<a class="btn primary" href="#/challenge/${c.id}">Take the course challenge</a>`}
        <a class="btn" href="${H.courseHref(c)}">Back to the course</a>
      </div></div></div>`;
  }

  window.PLACEMENT = { page, courseCard };
})();
