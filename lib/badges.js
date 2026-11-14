/* Goals and badges: a daily goal (questions a day) shown as a ring on Home, and badges for real
   milestones — streaks, goals met, perfect sets, Proficient and Mastered skills, a put-right mistake, a
   fast sprint, a solved equation in the step checker, a practice test passed. Badges are worked out from
   what is already saved, so nothing is gamed by the badge itself; the day each was earned is kept
   (STORE badges), and a new one is announced once. A few come from moments rather than totals: those
   moments are recorded with BADGES.flag('name'). Each badge that can be counted shows how far along it is (a bar
   toward it); meeting the weekly goal brings a summary of the week (once a week); and coming back after three or
   more days away earns a welcome-back boost of bonus points with the first answer (once). */
'use strict';
(function () {
  const A = window.ACADEMY, S = window.STORE;
  const totalQ = st => Object.values(st.days).reduce((a, d) => a + (d.q || 0), 0);
  const goal = () => Number(S.get().profile.goal) || 20;
  const goalDays = st => Object.values(st.days).filter(d => (d.q || 0) >= goal()).length;
  const levelCount = (st, l) => Object.values(st.skills).filter(x => x.level >= l).length;
  const logHas = (st, f) => st.log.some(f);
  const sprintBest = () => { try { const o = JSON.parse(localStorage.getItem('procademy.sprints.v1') || '{}'); return Math.max(0, ...Object.values(o).map(d => d.best || 0)); } catch (e) { return 0; } };
  const flagged = (st, k) => !!(st.flags && st.flags[k]);
  const puzzleDays = () => (window.PUZZLES ? PUZZLES.solvedDays().length : 0);
  const leapLevel = () => { try { const v = JSON.parse(localStorage.getItem('procademy.leap.v1') || 'null'); return v ? Number(v.level) || 1 : 1; } catch (e) { return 1; } };
  const learned = (st, f) => Object.keys(st.words || {}).filter(k => f(k) && st.words[k].ivl >= 3).length;
  const LIST = [
    ['first', '', 'First question', 'Answer your first question.', st => totalQ(st) >= 1],
    ['q100', '', '100 questions', 'Answer 100 questions.', st => totalQ(st) >= 100],
    ['q1000', '', '1,000 questions', 'Answer 1,000 questions.', st => totalQ(st) >= 1000],
    ['streak3', '', 'Three-day streak', 'Practice on 3 days in a row.', () => S.streak().days >= 3],
    ['streak7', '', 'Seven-day streak', 'Practice on 7 days in a row.', () => S.streak().days >= 7],
    ['streak30', '', 'Thirty-day streak', 'Practice on 30 days in a row.', () => S.streak().days >= 30],
    ['goal', '', 'Daily goal met', 'Meet your daily goal.', st => goalDays(st) >= 1],
    ['goal5', '', 'Daily goal met on five days', 'Meet your daily goal on 5 days.', st => goalDays(st) >= 5],
    ['perfect', '', 'Perfect practice set', 'Answer every question in a practice set correctly on the first try, without hints.', st => logHas(st, e => e.kind === 'practice' && e.total >= 7 && e.right === e.total)],
    ['proficient', '', 'First proficient skill', 'Reach Proficient in a skill.', st => levelCount(st, 3) >= 1],
    ['proficient10', '', 'Ten proficient skills', 'Reach Proficient in 10 skills.', st => levelCount(st, 3) >= 10],
    ['mastered', '', 'First mastered skill', 'Master a skill in a unit test or a challenge.', st => levelCount(st, 4) >= 1],
    ['mastered10', '', 'Ten mastered skills', 'Master 10 skills.', st => levelCount(st, 4) >= 10],
    ['unit-ace', '', 'Perfect unit test', 'Answer every question on a unit test correctly.', st => logHas(st, e => e.kind === 'unit-test' && e.total >= 2 && e.right === e.total)],
    ['comeback', '', 'Mistake corrected', 'Correct a question you had missed, in Review.', st => logHas(st, e => e.kind === 'review' && e.right >= 1)],
    ['daily5', '', 'Daily practice habit', 'Complete today’s practice on 5 days.', st => Object.values(st.days).filter(d => d.daily).length >= 5],
    ['sprint20', '', 'Sprint score of 20', 'Score 20 in a speed sprint.', () => sprintBest() >= 20],
    ['sprint40', '', 'Sprint score of 40', 'Score 40 in a speed sprint.', () => sprintBest() >= 40],
    ['steps', '', 'Step-by-step solution', 'Solve an equation line by line in the step checker.', st => flagged(st, 'steps')],
    ['test-ready', '', 'Ready for the test', 'Score 80% or more on a CPM practice test.', st => logHas(st, e => e.kind === 'chapter-test' && e.total && e.right / e.total >= 0.8)],
    ['grapher', '', 'Graph explorer', 'Move a slider in the graphing calculator.', st => flagged(st, 'grapher')],
    ['curious', '', 'Question for the tutor', 'Ask the tutor a question.', st => flagged(st, 'tutor')],
    ['challenger', '', 'Challenge sent', 'Send a challenge to a friend, or accept one.', st => flagged(st, 'challenge')],
    ['storyteller', '', 'Word problem solver', 'Write 5 equations from word problems correctly on the first try.', st => st.log.filter(e => e.kind === 'setup').reduce((a, e) => a + (e.right || 0), 0) >= 5],
    ['tiles', '', 'Algebra tiles', 'Solve an equation or complete a comparison with algebra tiles.', st => flagged(st, 'tiles')],
    ['chance', '', 'One thousand trials', 'Run an experiment 1,000 times in the probability simulator.', st => flagged(st, 'chance')],
    ['numbers', '', 'Number explorer', 'Create a factor tree, or find a GCF and LCM, in the number explorer.', st => flagged(st, 'numbers')],
    ['data', '', 'Data summary', 'Summarize a data set of 10 or more numbers in the data tool.', st => flagged(st, 'data')],
    ['shapes', '', 'Shapes and space', 'Calculate an area, a volume or an angle in the shapes tool.', st => flagged(st, 'shapes')],
    ['money', '', 'Percents and money', 'Calculate a sale price, a tip or interest in the percents and money tool.', st => flagged(st, 'money')],
    ['leap', '', 'Leap level 10', 'Complete level 10 of Leap, or solve a daily puzzle.', st => flagged(st, 'leap')],
    ['fractions', '', 'Fraction lab', 'Add, multiply, divide or compare fractions in the fraction lab.', st => flagged(st, 'fractions')],
    ['integers', '', 'Integer tiles', 'Work through an integer problem, or build a number with + and − tiles.', st => flagged(st, 'integers')],
    ['words25', '', 'Twenty-five math terms', 'Learn 25 math terms in the flashcards.', st => Object.keys(st.words || {}).filter(k => !k.startsWith('f-') && !k.startsWith('h-') && st.words[k].ivl >= 3).length >= 25],
    ['formulas10', '', 'Ten formulas', 'Learn 10 formulas in the formula flashcards.', st => Object.keys(st.words || {}).filter(k => k.startsWith('f-') && st.words[k].ivl >= 3).length >= 10],
    ['weekly', '', 'Weekly challenger', 'Solve a weekly challenge problem.', st => flagged(st, 'weekly')],
    ['boss', '', 'Boss beaten', 'Beat the boss level at the end of a unit.', st => flagged(st, 'boss')],
    ['best', '', 'Personal best', 'Set a new best time in Beat your best.', st => flagged(st, 'best')],
    ['puzzler', '', 'Puzzle week', 'Solve a puzzle of the day on 7 different days.', () => puzzleDays() >= 7],
    ['racer', '', 'Faster than the computer', 'Win a fact race against the computer.', st => flagged(st, 'racer')],
    ['league', '', 'Family league', 'Start or join a family league.', st => flagged(st, 'league')],
  ].map(([id, icon, name, how, test]) => ({ id, icon, name, how, test }));
  /** how far along a badge is, for the ones that count something: [now, needed] */
  const PROGRESS = {
    first: st => [totalQ(st), 1], q100: st => [totalQ(st), 100], q1000: st => [totalQ(st), 1000],
    streak3: () => [S.streak().days, 3], streak7: () => [S.streak().days, 7], streak30: () => [S.streak().days, 30],
    goal: st => [goalDays(st), 1], goal5: st => [goalDays(st), 5],
    proficient: st => [levelCount(st, 3), 1], proficient10: st => [levelCount(st, 3), 10], mastered: st => [levelCount(st, 4), 1], mastered10: st => [levelCount(st, 4), 10],
    daily5: st => [Object.values(st.days).filter(d => d.daily).length, 5], sprint20: () => [sprintBest(), 20], sprint40: () => [sprintBest(), 40],
    storyteller: st => [st.log.filter(e => e.kind === 'setup').reduce((a, e) => a + (e.right || 0), 0), 5],
    leap: () => [Math.min(10, leapLevel() - 1), 10], puzzler: () => [puzzleDays(), 7],
    words25: st => [learned(st, k => !k.startsWith('f-') && !k.startsWith('h-')), 25], formulas10: st => [learned(st, k => k.startsWith('f-')), 10],
  };
  /** a badge's progress: { now, need, pct } (null for badges that come from a single moment) */
  function progress(id, st) {
    const f = PROGRESS[id];
    if (!f) return null;
    let v; try { v = f(st || S.get()); } catch (e) { return null; }
    const now = Math.max(0, Math.min(v[0], v[1]));
    return { now, need: v[1], pct: Math.round(now / v[1] * 100) };
  }
  /** the badges still to earn that are closest, most nearly done first */
  function nearest(n) {
    const st = S.get();
    return all().filter(b => !b.at).map(b => Object.assign({ prog: progress(b.id, st) }, b)).filter(b => b.prog).sort((a, b) => b.prog.pct - a.prog.pct).slice(0, n || 3);
  }

  /** a badge's mark: a plain drawn medal, filled in once earned (by CSS) */
  const MEDAL = '<svg viewBox="0 0 24 24" width="28" height="28"><path d="M8 2h3l1 5-3 1zM16 2h-3l-1 5 3 1z" fill="currentColor" opacity=".55"/><circle cx="12" cy="15" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="15" r="3.2" fill="currentColor"/></svg>';
  /** every badge, with when it was earned (or null) */
  function all() { const got = S.get().badges || {}; return LIST.map(b => Object.assign({ at: got[b.id] || null }, b)); }
  /** look for newly earned badges; save them, and say so once */
  function check(quiet) {
    const st = S.get(), got = st.badges || {}, fresh = [];
    LIST.forEach(b => { if (!got[b.id]) { let ok = false; try { ok = b.test(st); } catch (e) { ok = false; } if (ok) fresh.push(b); } });
    if (!quiet) moments(!fresh.length);
    if (!fresh.length) return [];
    S.earnBadges(fresh.map(b => b.id));
    if (!quiet && window.VIEWS) VIEWS.toast(fresh.length === 1 ? `Badge earned: ${fresh[0].name}` : `${fresh.length} badges earned: ${fresh.map(b => b.name).join(', ')}`);
    return fresh;
  }

  /* ---------- the week, and coming back after a break ---------- */
  const mondayOf = iso => S.dayShift(iso, -((new Date(iso + 'T12:00').getDay() + 6) % 7));
  const BOOST = 25;
  /** the last day practiced before today, and how many days ago it was (null if none) */
  function lastBefore(st) {
    const t = S.today(), prev = Object.keys(st.days).filter(d => d < t && st.days[d].q).sort().pop();
    return prev ? { day: prev, gap: Math.round((new Date(t + 'T12:00') - new Date(prev + 'T12:00')) / 864e5) } : null;
  }
  /** back after three or more days away (and the boost not yet given today) */
  function backToday(st) { st = st || S.get(); const l = lastBefore(st); return !!l && l.gap >= 4 && st.profile.backBoost !== S.today(); }
  /** this week (Monday to Sunday) so far: days practiced, questions, minutes, skills leveled up, puzzles, badges */
  function week(st) {
    st = st || S.get();
    const mon = mondayOf(S.today()), goal = Number(st.profile.weekGoal) || 5, out = { mon, goal, days: 0, q: 0, right: 0, min: 0, ups: [], puzzles: 0, badges: [] };
    for (let k = 0; k < 7; k++) { const iso = S.dayShift(mon, k), d = st.days[iso]; if (d && d.q) { out.days++; out.q += d.q; out.right += d.right || 0; out.min += S.minutes(d); } if (window.PUZZLES) out.puzzles += Object.keys(PUZZLES.doneOn(iso)).length; }
    const from = new Date(mon + 'T00:00').getTime();
    st.log.filter(e => e.t >= from).forEach(e => (e.changes || []).forEach(ch => { if (ch.to > ch.from && !out.ups.includes(ch.skillId)) out.ups.push(ch.skillId); }));
    out.badges = all().filter(b => b.at && b.at >= from);
    out.met = out.days >= goal;
    return out;
  }
  /** once a week, when the weekly goal is first met: a note pointing to the week's summary; and the welcome-back
      boost with the first answer after a break (a badge's own note goes first: these wait for the next check) */
  function moments(free) {
    const st = S.get(), t = S.today(), d = st.days[t];
    if (!d || !d.q) return;
    if (backToday(st)) {
      S.setProfile({ backBoost: t }); S.addPoints(BOOST);
      if (free && window.VIEWS) { VIEWS.toast(`Welcome back. You earned ${BOOST} bonus points for coming back.`); free = false; }
      const el = typeof document !== 'undefined' && document.getElementById('stats'); if (el && window.VIEWS && VIEWS.stats) el.innerHTML = VIEWS.stats();
    }
    const w = week(st);
    if (w.met && st.profile.weekMet !== w.mon) {
      S.setProfile({ weekMet: w.mon });
      if (free && window.VIEWS) VIEWS.toast(`Weekly goal met: ${w.days} days this week. Your week’s summary is in the trophy room.`);
    }
  }
  /** the week's summary, for the trophy room: what was done, and a line for the weekly goal */
  function weekSummary() {
    const w = week(), A2 = window.ACADEMY;
    return `<div class="wk-sum"><p class="wk-sum-line">${w.met ? `<b>Weekly goal met.</b> You practiced on ${w.days} days this week, and your goal was ${w.goal}.` : `<b>${w.days} of ${w.goal} days</b> so far this week. ${w.goal - w.days === 1 ? 'One more day' : `${w.goal - w.days} more days`} to meet your weekly goal.`}</p>
      <span class="pbar" role="img" aria-label="${Math.min(w.days, w.goal)} of ${w.goal} days"><span style="width:${Math.min(100, w.days / w.goal * 100)}%"></span></span>
      <div class="wk-stats"><div><b>${w.q}</b><span>questions</span></div><div><b>${w.min}</b><span>minutes</span></div><div><b>${w.ups.length}</b><span>skills leveled up</span></div><div><b>${w.puzzles}</b><span>puzzles solved</span></div><div><b>${w.badges.length}</b><span>new badges</span></div></div>
      ${w.ups.length && A2 ? `<p class="small" style="margin:8px 0 0">Leveled up: ${w.ups.filter(id => A2.skills[id]).slice(0, 3).map(id => `<a href="#/skill/${encodeURIComponent(id)}">${A2.skills[id].title}</a>`).join(', ')}${w.ups.length > 3 ? `, and ${w.ups.length - 3} more` : ''}.</p>` : ''}</div>`;
  }
  /** a moment worth a badge (solved in the step checker, moved a slider, asked the tutor…) */
  function flag(k) { if (flagged(S.get(), k)) return; S.setFlag(k); check(); }

  /** today's goal as a ring: questions answered today out of the goal */
  function ring() {
    const q = (S.get().days[S.today()] || {}).q || 0, g = goal(), pct = Math.min(100, Math.round(q / g * 100)), back = !q && backToday();
    return `<button type="button" class="tile goal-tile${pct >= 100 ? ' met' : ''}" id="goal-tile" aria-label="Daily goal: ${q} of ${g} questions.${back ? ` Welcome back: your first answer today earns ${BOOST} bonus points.` : ''} Change it">
      <span class="goal-ring" style="--p:${pct}"><span>${pct >= 100 ? '✓' : q}</span></span>
      <span><span class="big">${pct >= 100 ? 'Goal met' : `${q} / ${g}`}</span><span class="label">${pct >= 100 ? `${q} questions today` : 'today’s goal'}</span>${back ? `<span class="goal-back">Welcome back: +${BOOST} points with your first answer</span>` : ''}</span></button>`;
  }
  /** a goal picker, opened from the ring */
  function wireRing(root, rerender) {
    const t = root.querySelector('#goal-tile');
    if (!t) return;
    t.addEventListener('click', () => {
      const pick = root.querySelector('#goal-pick');
      if (pick) { pick.remove(); return; }
      const box = document.createElement('div');
      box.className = 'card goal-pick'; box.id = 'goal-pick';
      box.innerHTML = `<b>Daily goal</b><p class="small muted" style="margin:4px 0 8px">How many questions a day? Speed sprints and every kind of practice count.</p><div class="btn-row" style="margin:0">${[10, 20, 30, 50].map(n => `<button class="btn sm${n === goal() ? ' primary' : ''}" data-goal="${n}">${n}</button>`).join('')}</div>`;
      t.closest('.tiles').after(box);
      box.querySelectorAll('[data-goal]').forEach(b => b.addEventListener('click', () => { S.setProfile({ goal: Number(b.dataset.goal) }); if (window.VIEWS) VIEWS.toast(`Daily goal: ${b.dataset.goal} questions`); rerender(); }));
    });
  }
  /** the badge shelf for Progress: the earned ones (oldest first) with the ones still to earn a tap away, or the
      same badges as a timeline, newest first, by month */
  function shelfBody() {
    const list = all(), got = list.filter(b => b.at);
    const st = S.get();
    const bar = b => { const p = !b.at && progress(b.id, st); return p ? `<span class="pbar bdg-bar" role="img" aria-label="${p.now} of ${p.need}"><span style="width:${p.pct}%"></span></span><span class="tiny muted bdg-n">${p.now.toLocaleString()} of ${p.need.toLocaleString()}</span>` : ''; };
    const li = b => `<li class="badge${b.at ? ' got' : ''}" title="${b.how}${b.at ? ' Earned ' + new Date(b.at).toLocaleDateString() + '.' : ''}"><span class="badge-icon" aria-hidden="true">${MEDAL}</span><b>${b.name}</b><span class="tiny muted">${b.at ? 'Earned ' + new Date(b.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : b.how}</span>${bar(b)}</li>`;
    const pctOf = b => { const p = progress(b.id, st); return p ? p.pct : -1; };
    const left = list.filter(b => !b.at).sort((a, b) => pctOf(b) - pctOf(a));
    return `<div class="card">${got.length > 1 ? `<div class="tabs bdg-tabs" role="tablist" aria-label="Show the badges"><button type="button" role="tab" class="tab on" aria-selected="true" data-bview="shelf">Shelf</button><button type="button" role="tab" class="tab" aria-selected="false" data-bview="time">Timeline</button></div>` : ''}
      <div data-bview-panel="shelf">${got.length ? `<ul class="badges">${got.slice().sort((a, b) => a.at - b.at).map(li).join('')}</ul>` : '<p class="muted" style="margin:0">No badges yet. Your first one comes with your first answer.</p>'}
        ${left.length ? `<details class="all-courses"><summary>Badges to earn (${left.length})</summary><ul class="badges" style="margin-top:10px">${left.map(li).join('')}</ul></details>` : ''}</div>
      ${got.length > 1 ? `<div data-bview-panel="time" hidden>${timeline(got)}</div>` : ''}</div>`;
  }
  /** earned badges as a timeline: newest first, grouped by month, each with the day it was earned and what it was for */
  function timeline(got) {
    const months = [];
    got.slice().sort((a, b) => b.at - a.at).forEach(b => { const m = new Date(b.at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }), last = months[months.length - 1]; if (last && last.m === m) last.list.push(b); else months.push({ m, list: [b] }); });
    return `<ol class="bdg-time">${months.map(x => `<li class="bdg-month"><h3>${x.m}</h3><ol>${x.list.map(b => `<li><time datetime="${new Date(b.at).toISOString().slice(0, 10)}">${new Date(b.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time><span class="bdg-mark" aria-hidden="true">${MEDAL}</span><span><b>${b.name}</b><span class="small muted">${b.how}</span></span></li>`).join('')}</ol></li>`).join('')}</ol>`;
  }
  function wireShelf(root) {
    root.querySelectorAll('[data-bview]').forEach(b => b.addEventListener('click', () => {
      const box = b.closest('.card');
      box.querySelectorAll('[data-bview]').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', String(x === b)); });
      box.querySelectorAll('[data-bview-panel]').forEach(p => { p.hidden = p.dataset.bviewPanel !== b.dataset.bview; });
    }));
  }
  /** the badge shelf with its own heading (anywhere besides Progress) */
  function shelf() {
    const list = all(), got = list.filter(b => b.at);
    return `<div class="section-title" id="badges"><h2>Badges</h2><span class="muted small">${got.length} of ${list.length}</span></div>${shelfBody()}`;
  }

  /* the goals, as they change (profile.goalLog: { t, goal, week }, up to 30), for the goal history on Progress */
  S.onChange(st => {
    const p = st.profile;
    if (p.goal == null && p.weekGoal == null) return;
    const g = Number(p.goal) || 20, w = Number(p.weekGoal) || 5, log = Array.isArray(p.goalLog) ? p.goalLog : [], last = log[log.length - 1];
    if (last && last.goal === g && last.week === w) return;
    S.setProfile({ goalLog: log.concat({ t: Date.now(), goal: g, week: w }).slice(-30) });
  });

  window.BADGES = { LIST, all, check, flag, ring, wireRing, shelf, shelfBody, timeline, wireShelf, goal, progress, nearest, week, weekSummary, backToday, BOOST, MEDAL };
})();
