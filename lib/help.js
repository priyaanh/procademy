/* Help: short how-to articles (#/help, #/help/<id>), each a few steps with links to try it. The main search finds
   them too (HELP.find). Written for a learner first, with one article for parents and teachers. */
'use strict';
(function () {
  const V = window.VIEWS, H = V._h, esc = H.esc;
  /** [id, title, one line, icon, [steps], [[href, label]]] (steps may hold <b> and links) */
  const ARTICLES = [
    ['start', 'Getting started', 'Your grade, today’s plan and where to begin', 'home', [
      'Choose your grade when you first visit, or later on the <a href="#/settings">Settings</a> page. It sets the course and the level of your practice.',
      'Home has a plan for each day: <b>Today’s practice</b> mixes reviews, your mistakes and a few new skills. One set a day is plenty.',
      'The big button at the top of Home picks up where you left off, even in the middle of a set.',
      'To pick something yourself, open <a href="#/courses">Courses</a>, choose a course, then a unit and a skill.',
    ], [['#/', 'Go to Home'], ['#/courses', 'See the courses']]],
    ['practice', 'How practice works', 'Sets, hints, levels and mastery', 'target', [
      'A practice set is 7 questions on one skill (you can choose 5 or 10 instead). Press <b>Check</b>, or Enter, after each answer.',
      'Stuck? <b>Nudge</b> gives a small hint, and <b>Help with this one</b> walks through it. <b>I don’t know</b> shows how it’s done, and a question like it comes back later.',
      'Each skill has a level: <b>Attempted</b>, <b>Familiar</b> (70% right the first time), <b>Proficient</b> (every answer right the first time) and <b>Mastered</b> (right again later, in a unit test or a challenge).',
      'Questions you miss are saved in <a href="#/review">Your mistakes</a>, so you can try them again.',
      'Need a break? <b>Pause</b> keeps the set, and Home’s Continue button brings you back to the same question.',
    ], [['#/unlimited', 'Practice now'], ['#/review', 'Your mistakes']]],
    ['tutor', 'Asking the tutor', 'Help with any question, step by step', 'sparkle', [
      'Open the <a href="#/tutor">Tutor</a>, or select <b>Ask the tutor</b> on any page, and type your question the way you’d ask a teacher.',
      'You can add a picture of your homework. The tutor explains step by step and checks your work.',
      'During practice, the tutor helps you think it through but never gives away the answer.',
      'Your chats are kept on this device, and the main search can find them again.',
    ], [['#/tutor', 'Open the tutor']]],
    ['tools', 'Using the tools', 'Calculators, labs and puzzles for working things out', 'calc', [
      'The <a href="#/tools">Tools</a> page groups every tool by subject: calculators, numbers and fractions, shapes and data, equations, time and money.',
      'Each tool has a short <b>How to use this tool</b> under its title, and a tip the first time you open it.',
      'Most tools keep what you typed in their link. <b>Copy link</b>, at the top of a tool, shares it just as it is now.',
      'You can search for a tool by what it does, such as “convert inches” or “simplify a fraction”.',
    ], [['#/tools', 'See all tools']]],
    ['cpm', 'Your CPM class book', 'Find tonight’s lesson and practice it', 'bookmark', [
      'Open <a href="#/cpm">CPM books</a> and choose your book, or type a lesson number like <b>3.1.2</b> in the search box.',
      'Each lesson has practice on its skills, homework hints with Procademy’s own examples, and its math words.',
      'Before a chapter test, <b>Test prep</b> makes a day-by-day plan.',
    ], [['#/cpm', 'Open CPM books']]],
    ['progress', 'Points, streaks and badges', 'How Procademy keeps track', 'trophy', [
      'Every right answer earns points, and a finished set or a level up earns extra.',
      'Practice on days in a row to grow your streak. You earn a streak saver for every 7 days in a row, and it covers a missed day.',
      'Badges mark real milestones, like your first mastered skill. See them all on <a href="#/progress">Progress</a>.',
      'A printable <a href="#/report">progress report</a> shows what was practiced and what’s next.',
    ], [['#/progress', 'See your progress']]],
    ['picture', 'Questions from a picture', 'Practice just like tonight’s homework', 'image', [
      'On the <a href="#/unlimited">Practice</a> page, choose <b>Questions like a picture</b> and add a photo or screenshot of a question, or type it in.',
      'Procademy finds the closest skill and starts new questions like it at once, with the next closest skills a tap away.',
      'A whole worksheet is split into its questions, and you can practice all of them mixed.',
    ], [['#/unlimited/picture', 'Try it']]],
    ['play', 'Puzzles, sprints and challenges', 'Quick rounds for a change of pace', 'flag', [
      '<b>Leap</b> and <b>Balance</b> have a new puzzle every day, and levels to climb.',
      '<b>Speed sprints</b> are one-minute rounds of math facts. The facts you miss come back more often.',
      '<b>This week’s challenge</b> is one harder problem from your course, new every Monday.',
      'After a set, <b>Challenge a friend</b> makes a link with the same questions, to see who does better.',
    ], [['#/leap', 'Play Leap'], ['#/sprint', 'Speed sprints']]],
    ['finding', 'Finding your way around', 'Search, More, favorites and shortcuts', 'search', [
      'Search finds skills, courses, tools, lessons, math words, formulas, help and your tutor chats. It understands questions and small typos.',
      'On a phone, <b>More</b> in the tab bar holds every other page, your favorites and the pages you visited lately. On a computer, More is the button beside your profile.',
      'Select the star at the top of any page to add it to your favorites.',
      'On a computer, press <b>?</b> for the keyboard shortcuts: <b>/</b> searches, and <b>G</b> then <b>H</b>, <b>P</b>, <b>C</b> or <b>T</b> goes to Home, Practice, Courses or the tutor.',
      'On a phone, swipe in from the left edge to go back.',
    ], [['#/sitemap', 'See all pages']]],
    ['saving', 'Where your progress is saved', 'This device, an account, and working offline', 'globe', [
      'Your progress is saved on this device as you go. Nothing else is needed.',
      'Create an account on the <a href="#/profile">Profile</a> page to keep progress safe and use it on other devices too.',
      'Several learners can share one device: each gets their own profile, and a PIN keeps it from being opened by mistake.',
      'Practice and the tools keep working without the internet. To open Procademy like an app, choose <b>Get the app</b> on Home or in Settings.',
    ], [['#/profile', 'Open your profile']]],
    ['comfort', 'Making it comfortable', 'Colors, text size, reading and language', 'settings', [
      'In <a href="#/settings">Settings</a>, choose light or dark colors, a shade of blue, or high contrast.',
      'Make the text bigger, turn on easier-to-read text, or choose a reading font such as OpenDyslexic.',
      '<b>Less motion</b> turns off slides and animations.',
      'The menus and buttons can be in Spanish or Hindi. Lessons and questions stay in English.',
    ], [['#/settings', 'Open Settings']]],
    ['family', 'For parents and teachers', 'Following progress and sharing practice', 'school', [
      'On <a href="#/family">Family and class</a>, see progress for everyone you help in one place.',
      'A learner can share their progress with a parent or teacher using <b>Copy my progress link</b>.',
      'Teachers can share a practice link with a class: a course, a unit or a few chosen skills, with questions that never run out.',
      'The progress report is made to print or share at a conference.',
    ], [['#/family', 'Open Family and class'], ['#/report', 'Progress report']]],
  ];
  const strip = s => s.replace(/<[^>]+>/g, '');
  /** articles that match a search: [{ href, title, line }] */
  function find(q, n) {
    const words = window.ACADEMY ? ACADEMY.normText(String(q || '')).split(' ').filter(w => w.length > 1) : [];
    if (!words.length) return [];
    const score = a => { const head = ACADEMY.normText(a[1] + ' ' + a[2]), body = ACADEMY.normText(strip(a[4].join(' '))); return words.every(w => head.includes(w) || body.includes(w)) ? words.filter(w => head.includes(w)).length + 1 : 0; };
    return ARTICLES.map(a => [a, score(a)]).filter(x => x[1]).sort((x, y) => y[1] - x[1]).slice(0, n || 6).map(([a]) => ({ href: '#/help/' + a[0], title: a[1], line: a[2] }));
  }
  function page(root, id) {
    const a = id && ARTICLES.find(x => x[0] === id);
    if (id && !a) return V.notFound(root);
    if (!a) {
      root.innerHTML = `<h1>Help</h1><p class="muted">Short how-tos for every part of Procademy. For a math question, <a href="#/tutor">ask the tutor</a>.</p>
        <div class="help-grid">${ARTICLES.map(x => `<a class="card help-card" href="#/help/${x[0]}"><span class="help-ic">${ICONS.svg(x[3], 22)}</span><span><b>${esc(x[1])}</b><span class="small muted">${esc(x[2])}</span></span></a>`).join('')}</div>`;
    } else {
      const k = ARTICLES.indexOf(a), next = ARTICLES[(k + 1) % ARTICLES.length];
      root.innerHTML = `<article class="help-article"><h1>${esc(a[1])}</h1><p class="muted help-line">${esc(a[2])}.</p>
        <ol class="help-steps">${a[4].map(t => `<li>${t}</li>`).join('')}</ol>
        <div class="btn-row">${a[5].map(([h, l], i) => `<a class="btn${i ? '' : ' primary'}" href="${h}">${esc(l)}</a>`).join('')}</div>
        <p class="small muted help-next">Next: <a href="#/help/${next[0]}">${esc(next[1])}</a> · <a href="#/help">All help</a></p></article>`;
    }
    H.tutorCtx(null);
  }
  window.HELP = { page, find, ARTICLES };
})();
