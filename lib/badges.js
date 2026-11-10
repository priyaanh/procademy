/* Goals and badges: a daily goal (questions a day) shown as a ring on Home, and badges for real
   milestones — streaks, goals met, perfect sets, Proficient and Mastered skills, a put-right mistake, a
   fast sprint, a solved equation in the step checker, a practice test passed. Badges are worked out from
   what is already saved, so nothing is gamed by the badge itself; the day each was earned is kept
   (STORE badges), and a new one is announced once. A few come from moments rather than totals: those
   moments are recorded with BADGES.flag('name'). */
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
    ['words25', '', 'Twenty-five math terms', 'Learn 25 math terms in the flashcards.', st => Object.keys(st.words || {}).filter(k => !k.startsWith('f-') && st.words[k].ivl >= 3).length >= 25],
    ['formulas10', '', 'Ten formulas', 'Learn 10 formulas in the formula flashcards.', st => Object.keys(st.words || {}).filter(k => k.startsWith('f-') && st.words[k].ivl >= 3).length >= 10],
    ['weekly', '', 'Weekly challenger', 'Solve a weekly challenge problem.', st => flagged(st, 'weekly')],
    ['boss', '', 'Boss beaten', 'Beat the boss level at the end of a unit.', st => flagged(st, 'boss')],
    ['best', '', 'Personal best', 'Set a new best time in Beat your best.', st => flagged(st, 'best')],
  ].map(([id, icon, name, how, test]) => ({ id, icon, name, how, test }));

  /** a badge's mark: a plain drawn medal, filled in once earned (by CSS) */
  const MEDAL = '<svg viewBox="0 0 24 24" width="28" height="28"><path d="M8 2h3l1 5-3 1zM16 2h-3l-1 5 3 1z" fill="currentColor" opacity=".55"/><circle cx="12" cy="15" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="15" r="3.2" fill="currentColor"/></svg>';
  /** every badge, with when it was earned (or null) */
  function all() { const got = S.get().badges || {}; return LIST.map(b => Object.assign({ at: got[b.id] || null }, b)); }
  /** look for newly earned badges; save them, and say so once */
  function check(quiet) {
    const st = S.get(), got = st.badges || {}, fresh = [];
    LIST.forEach(b => { if (!got[b.id]) { let ok = false; try { ok = b.test(st); } catch (e) { ok = false; } if (ok) fresh.push(b); } });
    if (!fresh.length) return [];
    S.earnBadges(fresh.map(b => b.id));
    if (!quiet && window.VIEWS) VIEWS.toast(fresh.length === 1 ? `Badge earned: ${fresh[0].name}` : `${fresh.length} badges earned: ${fresh.map(b => b.name).join(', ')}`);
    return fresh;
  }
  /** a moment worth a badge (solved in the step checker, moved a slider, asked the tutor…) */
  function flag(k) { if (flagged(S.get(), k)) return; S.setFlag(k); check(); }

  /** today's goal as a ring: questions answered today out of the goal */
  function ring() {
    const q = (S.get().days[S.today()] || {}).q || 0, g = goal(), pct = Math.min(100, Math.round(q / g * 100));
    return `<button type="button" class="tile goal-tile${pct >= 100 ? ' met' : ''}" id="goal-tile" aria-label="Daily goal: ${q} of ${g} questions. Change it">
      <span class="goal-ring" style="--p:${pct}"><span>${pct >= 100 ? '✓' : q}</span></span>
      <span><span class="big">${pct >= 100 ? 'Goal met' : `${q} / ${g}`}</span><span class="label">${pct >= 100 ? `${q} questions today` : 'today’s goal'}</span></span></button>`;
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
  /** the badge shelf for Progress */
  function shelf() {
    const list = all(), got = list.filter(b => b.at);
    const li = b => `<li class="badge${b.at ? ' got' : ''}" title="${b.how}${b.at ? ' Earned ' + new Date(b.at).toLocaleDateString() + '.' : ''}"><span class="badge-icon" aria-hidden="true">${MEDAL}</span><b>${b.name}</b><span class="tiny muted">${b.at ? 'Earned ' + new Date(b.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : b.how}</span></li>`;
    const left = list.filter(b => !b.at);
    // the ones earned, oldest first; the ones still to earn are a tap away
    return `<div class="section-title" id="badges"><h2>Badges</h2><span class="muted small">${got.length} of ${list.length}</span></div>
      <div class="card">${got.length ? `<ul class="badges">${got.sort((a, b) => a.at - b.at).map(li).join('')}</ul>` : '<p class="muted" style="margin:0">No badges yet. Your first one comes with your first answer.</p>'}
        ${left.length ? `<details class="all-courses"><summary>Badges to earn (${left.length})</summary><ul class="badges" style="margin-top:10px">${left.map(li).join('')}</ul></details>` : ''}</div>`;
  }

  window.BADGES = { LIST, all, check, flag, ring, wireRing, shelf, goal };
})();
