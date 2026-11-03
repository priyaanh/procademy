/* What's new (#/new): everything added to Procademy, newest first, each with a link to try it. Home's
   "New in Procademy" card shows only the latest tools and goes away with Got it; this page keeps the
   whole list. Add an entry here whenever something a learner can see is added. */
'use strict';
(function () {
  const V = window.VIEWS, H = V._h, esc = H.esc;
  /** [date, [link, icon, name, what it is]...], newest first */
  const UPDATES = [
    ['2026-11-02', [
      ['#/unlimited', '♾️', 'Unlimited practice', 'Questions that never run out, for every skill in every course and CPM book: one skill, a unit, a course, or everything mixed. It’s Practice in the top bar.'],
      ['#/tutor', '✦', 'The tutor helps with every subject', 'Science, reading and writing, history, languages, coding and anything you’re curious about, not only math.'],
      ['#/fractions', '🍕', 'Fraction lab', 'Add, subtract, multiply, divide, compare and simplify fractions and mixed numbers, each drawn as bars or an area model, so you can see why the steps work.'],
      ['#/integers', '➕', 'Integer tiles', 'Positive and negative numbers as + and − tiles, one step at a time, with the same problem on a number line. Or build any number with zero pairs.'],
      ['#/search/fraction', '🔎', 'Search finds tools too', 'Search for “fraction” or “negative” and the matching tools come up beside the skills.'],
      ['#/courses', '✏️', 'American spelling', 'Every lesson and question now uses US spelling and the words your class uses, like parentheses and elevator.'],
    ]],
    ['2026-11-01', [
      ['#/profile', '🔑', 'Continue with Google', 'Save your progress online with one click, then pick it up on any computer. No password to remember.'],
      ['#/profile', '☁️', 'Online accounts', 'Or make an account with a username and a password (no email needed) and log in anywhere.'],
      ['privacy.html', '🔒', 'Privacy', 'A page that says what leaves your device, where it goes, and how to delete it.'],
      ['#/leap', '🐸', 'Leap', 'A number-line puzzle: get the frog to the flag using every card once. 80 levels, and a new puzzle every day.'],
      ['#/shapes', '📐', 'Shapes and space', 'Area, perimeter, volume and surface area, drawn to scale with nets, plus angle pairs and a triangle builder.'],
      ['#/percent', '💲', 'Percents and money', 'Sales, tips, tax, markup, and simple and compound interest, on a percent ruler.'],
    ]],
    ['2026-10-31', [
      ['#/calc', '🧮', 'Calculator', 'Fractions stay exact, every answer shows as a fraction, mixed number, decimal and percent, and the order of operations is worked step by step.'],
      ['#/numbers', '🌳', 'Number explorer', 'Prime factors and factor trees, divisibility rules, and GCF and LCM with a Venn diagram.'],
      ['#/data', '📊', 'Data and statistics', 'Mean, median, mode, quartiles, IQR and MAD, each worked out, with dot plots, box plots and histograms.'],
      ['#/tools', '🧰', 'Tools', 'Every tool on one page (Tools, in the top bar).'],
    ]],
    ['2026-10-29', [
      ['#/tiles', '🟩', 'Algebra tiles', 'Solve equations on an equation mat. Every move is written as algebra and checked.'],
      ['#/chance', '🎲', 'Probability simulator', 'Coins, number cubes, spinners and marble bags, run up to 1,000 times and compared with the theory.'],
      ['#/setup', '🧩', 'Word problems', 'Turn a story into an equation, solve it, and answer the question.'],
      ['#/words', '📖', 'Math words', '174 words explained simply. Tap an underlined word in a lesson to see what it means, or practice with flashcards.'],
      ['#/profile', '👥', 'Several learners on one computer', 'Each with their own progress and badges, and a PIN if you want one.'],
      ['#/profile', '📱', 'QR codes', 'Scan a move link or a challenge link to open it on a phone.'],
      ['#/profile', '📅', 'A daily reminder', 'Add a reminder to practice to your calendar.'],
      ['#/settings', '🔊', 'Easier reading and read-aloud', 'Settings can make text easier to read and read each question aloud. Every skill also has a worked example, one step at a time.'],
    ]],
    ['2026-10-28', [
      ['#/profile', '🙂', 'Your profile', 'A name, a grade (the tutor explains at your level) and an avatar.'],
      ['#/profile', '🔗', 'Move to another computer', 'Make a link that carries your progress: no account and no file.'],
      ['#/progress', '🏅', 'Goals and badges', 'A daily goal on Home, and badges to earn on Progress.'],
      ['#/sprint', '🤝', 'Challenge a friend', 'After a practice set or a speed sprint, send a friend a link to the same questions and see who wins.'],
      ['#/report', '🗒️', 'Progress report', 'The last 7 or 30 days on one page, to print or send to a parent or teacher.'],
    ]],
    ['2026-10-27', [
      ['#/daily', '🔁', 'Today’s practice', 'A few minutes a day: skills due for review, mistakes to fix, and something new.'],
      ['#/progress', '🩹', 'Mistake coach', 'Says what probably went wrong, without giving the answer, and shows your usual slips on Progress.'],
      ['#/steps', '✍️', 'Check my steps', 'Type your work line by line and see where a slip crept in.'],
      ['#/sprint', '⚡', 'Speed sprints', 'One-minute fact rounds. The facts you miss come back more often.'],
      ['#/cpm', '🎯', 'CPM test prep', 'Set a test date to get a day-by-day plan and a practice test for the chapter.'],
      ['#/graph', '📈', 'Graphing calculator', 'Graph anything, with sliders.'],
      ['#/courses', '🖨️', 'Worksheets', 'Printable worksheets with answer keys for every skill, unit and CPM lesson.'],
      ['#/tutor', '✦', 'The tutor draws and reads', 'It draws graphs and charts, makes pictures, and reads photos and PDFs you attach.'],
      ['#/settings', '💾', 'The offline file', 'Download Procademy as one file that works with no internet.'],
    ]],
    ['2026-10-26', [
      ['#/tutor', '♾️', 'Unlimited tutor', 'The tutor also sets itself up on your device, so it never makes you wait.'],
      ['#/tutor', '💬', 'The tutor’s own page', 'Saved chats, a grade level to explain for, and a style: step by step, short, or with an example.'],
      ['#/', '🏠', 'Home and Courses', 'Home is your own page, with your saved courses. Courses lists every grade and CPM book.'],
    ]],
    ['2026-10-25', [
      ['#/tutor', '⚡', 'A tutor that answers straight away', 'A free AI explains, with no download, account or key.'],
    ]],
    ['2026-10-24', [
      ['#/cpm', '📘', 'Practice for nearly every CPM lesson', '83 new skills, from 6th grade to Integrated III.'],
    ]],
    ['2026-10-23', [
      ['#/courses', '🎉', 'Procademy opens', 'Math for every grade, from Kindergarten to Precalculus and Integrated Math: a lesson and endless practice for every skill.'],
      ['#/cpm', '📚', 'CPM books', 'All six Core Connections books, chapter by chapter, with practice for each lesson.'],
      ['#/tutor', '✦', 'A tutor that explains', 'Ask about any question and get it explained step by step.'],
    ]],
  ];
  // links outside the app (the privacy page) go to the website, from the offline file too
  const site = () => (window.MOVE ? MOVE.siteBase() : '').replace(/[^/]*$/, '');
  const when = iso => new Date(iso + 'T12:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

  function page(root) {
    root.innerHTML = `<div class="whatsnew"><h1>What’s new</h1><p class="muted" style="margin-top:-4px">Everything added to Procademy, newest first.</p>
      ${UPDATES.map(([iso, items]) => `<section class="card"><h2><time datetime="${iso}">${when(iso)}</time></h2><ul class="wn-list">
        ${items.map(([href, icon, name, what]) => `<li><span class="wn-icon" aria-hidden="true">${icon}</span><div><a href="${href.startsWith('#') ? href : site() + href}">${esc(name)}</a><div class="small muted">${esc(what)}</div></div></li>`).join('')}</ul></section>`).join('')}</div>`;
    H.tutorCtx(null);
  }

  window.WHATSNEW = { page, UPDATES };
})();
