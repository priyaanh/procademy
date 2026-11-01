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
    ['first', '🌱', 'First steps', 'Answer your first question.', st => totalQ(st) >= 1],
    ['q100', '💯', 'A hundred', 'Answer 100 questions.', st => totalQ(st) >= 100],
    ['q1000', '🧮', 'A thousand', 'Answer 1,000 questions.', st => totalQ(st) >= 1000],
    ['streak3', '🔥', 'On a roll', 'Practise 3 days in a row.', () => S.streak().days >= 3],
    ['streak7', '🗓️', 'Week warrior', 'Practise 7 days in a row.', () => S.streak().days >= 7],
    ['streak30', '🏆', 'Month of math', 'Practise 30 days in a row.', () => S.streak().days >= 30],
    ['goal', '🎯', 'Goal!', 'Meet your daily goal.', st => goalDays(st) >= 1],
    ['goal5', '🏹', 'Goal getter', 'Meet your daily goal on 5 days.', st => goalDays(st) >= 5],
    ['perfect', '⭐', 'Perfect set', 'Get a whole practice set right, first try, no hints.', st => logHas(st, e => e.kind === 'practice' && e.total >= 7 && e.right === e.total)],
    ['proficient', '💪', 'Proficient', 'Reach Proficient in a skill.', st => levelCount(st, 3) >= 1],
    ['proficient10', '🧗', 'Ten strong', 'Reach Proficient in 10 skills.', st => levelCount(st, 3) >= 10],
    ['mastered', '👑', 'Mastered', 'Master a skill (in a unit test or a challenge).', st => levelCount(st, 4) >= 1],
    ['mastered10', '🏰', 'Ten mastered', 'Master 10 skills.', st => levelCount(st, 4) >= 10],
    ['unit-ace', '📝', 'Unit test ace', 'Get every question right on a unit test.', st => logHas(st, e => e.kind === 'unit-test' && e.total >= 2 && e.right === e.total)],
    ['comeback', '🩹', 'Comeback', 'Put right a question you had missed, in Review.', st => logHas(st, e => e.kind === 'review' && e.right >= 1)],
    ['daily5', '🔁', 'Daily habit', 'Do today’s practice on 5 days.', st => Object.values(st.days).filter(d => d.daily).length >= 5],
    ['sprint20', '⚡', 'Fast fingers', 'Score 20 in a speed sprint.', () => sprintBest() >= 20],
    ['sprint40', '🌩️', 'Lightning', 'Score 40 in a speed sprint.', () => sprintBest() >= 40],
    ['steps', '✍️', 'Step by step', 'Solve an equation line by line in the step checker.', st => flagged(st, 'steps')],
    ['test-ready', '📅', 'Ready for the test', 'Score 80% or more on a CPM practice test.', st => logHas(st, e => e.kind === 'chapter-test' && e.total && e.right / e.total >= 0.8)],
    ['grapher', '📈', 'Explorer', 'Move a slider in the graphing calculator.', st => flagged(st, 'grapher')],
    ['curious', '✦', 'Curious', 'Ask the tutor a question.', st => flagged(st, 'tutor')],
    ['challenger', '🤝', 'Challenger', 'Send a friend a challenge, or take one.', st => flagged(st, 'challenge')],
    ['storyteller', '🧩', 'Story solver', 'Write 5 equations from word problems, right the first time.', st => st.log.filter(e => e.kind === 'setup').reduce((a, e) => a + (e.right || 0), 0) >= 5],
    ['tiles', '🟩', 'Tile mover', 'Solve an equation or win a comparison with algebra tiles.', st => flagged(st, 'tiles')],
    ['chance', '🎲', 'Thousand trials', 'Run an experiment 1,000 times in the probability simulator.', st => flagged(st, 'chance')],
    ['numbers', '🌳', 'Factor finder', 'Grow a factor tree, or find a GCF and LCM, in the number explorer.', st => flagged(st, 'numbers')],
    ['data', '📊', 'Data detective', 'Sum up a data set of 10 or more numbers in the data tool.', st => flagged(st, 'data')],
    ['words25', '📖', 'Word wise', 'Know 25 math words in the flashcards.', st => Object.values(st.words || {}).filter(w => w.ivl >= 3).length >= 25],
  ].map(([id, icon, name, how, test]) => ({ id, icon, name, how, test }));

  /** every badge, with when it was earned (or null) */
  function all() { const got = S.get().badges || {}; return LIST.map(b => Object.assign({ at: got[b.id] || null }, b)); }
  /** look for newly earned badges; save them, and say so once */
  function check(quiet) {
    const st = S.get(), got = st.badges || {}, fresh = [];
    LIST.forEach(b => { if (!got[b.id]) { let ok = false; try { ok = b.test(st); } catch (e) { ok = false; } if (ok) fresh.push(b); } });
    if (!fresh.length) return [];
    S.earnBadges(fresh.map(b => b.id));
    if (!quiet && window.VIEWS) VIEWS.toast(fresh.length === 1 ? `🏅 New badge: ${fresh[0].icon} ${fresh[0].name}` : `🏅 ${fresh.length} new badges: ${fresh.map(b => b.icon).join(' ')}`);
    return fresh;
  }
  /** a moment worth a badge (solved in the step checker, moved a slider, asked the tutor…) */
  function flag(k) { if (flagged(S.get(), k)) return; S.setFlag(k); check(); }

  /** today's goal as a ring: questions answered today out of the goal */
  function ring() {
    const q = (S.get().days[S.today()] || {}).q || 0, g = goal(), pct = Math.min(100, Math.round(q / g * 100));
    return `<button type="button" class="tile goal-tile${pct >= 100 ? ' met' : ''}" id="goal-tile" aria-label="Daily goal: ${q} of ${g} questions. Change it">
      <span class="goal-ring" style="--p:${pct}"><span>${pct >= 100 ? '✓' : q}</span></span>
      <span><span class="big">${pct >= 100 ? 'Goal met!' : `${q} / ${g}`}</span><span class="label">${pct >= 100 ? `${q} questions today` : 'today’s goal'}</span></span></button>`;
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
    return `<div class="section-title" id="badges"><h2>Badges</h2><span class="muted small">${got.length} of ${list.length}</span></div>
      <div class="card"><ul class="badges">${list.sort((a, b) => (b.at ? 1 : 0) - (a.at ? 1 : 0) || (a.at || 0) - (b.at || 0)).map(b => `<li class="badge${b.at ? ' got' : ''}" title="${b.how}${b.at ? ' Earned ' + new Date(b.at).toLocaleDateString() + '.' : ''}"><span class="badge-icon" aria-hidden="true">${b.icon}</span><b>${b.name}</b><span class="tiny muted">${b.at ? 'Earned ' + new Date(b.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : b.how}</span></li>`).join('')}</ul></div>`;
  }

  window.BADGES = { LIST, all, check, flag, ring, wireRing, shelf, goal };
})();
