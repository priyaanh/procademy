/* What's new (#/new): everything added to Procademy, newest first, each with a link to try it. Home's
   "New in Procademy" card shows only the latest tools and goes away with Got it; this page keeps the
   whole list. Add an entry here whenever something a learner can see is added. */
'use strict';
(function () {
  const V = window.VIEWS, H = V._h, esc = H.esc;
  /** [date, [link, name, what it is]...], newest first */
  const UPDATES = [
    ['2026-11-08', [
      ['#/unlimited/picture', 'Questions like a picture', 'Add a screenshot or photo of a homework question, or type one in, and practice new questions like it straight away.'],
      ['#/calc', 'A calculator like the one in class', 'The calculator has the keys of a classroom graphing calculator: Y=, graph, trace and table, with exact fractions and every step still shown beside it.'],
      ['#/graph', 'Easier graphing', 'Start a graph with one tap, type with a math keypad, and get a hint for any line that can’t be drawn.'],
      ['#/tutor', 'A cleaner tutor', 'The tutor page has one row of choices, a few starters and a simpler box to type in.'],
      ['#/settings', 'Simpler settings', 'Settings are grouped in cards, with one-tap choices and switches.'],
      ['#/profile', 'Your grade, from the start', 'Making an account asks your grade, so the puzzle of the day, practice and the tutor start at your level.'],
    ]],
    ['2026-11-06', [
      ['#/course/math-7', 'Simpler pages', 'Course pages open with your skill map: select a unit for its lessons and unit test. Skill pages have one Practice button, with the other ways to practice a tap away. My notes and your challenges are on Progress.'],
    ]],
    ['2026-11-05', [
      ['#/course/calculus', 'Calculus', 'A new course: limits, derivatives and how to use them, integrals and the Fundamental Theorem, in 30 skills with lessons, worked examples and hints.'],
      ['#/course/math-7', 'Your skill map', 'Every course page shows a square for each skill in the color of your level, with the next one to learn ringed.'],
      ['#/review', 'Review by kind of mistake', 'Review groups the questions you missed by the kind of slip (a sign, a flipped fraction, a decimal point) and by skill, so you can fix one thing at a time.'],
      ['#/notes', 'My notes', 'Write your own notes at the bottom of any lesson. They’re saved as you type, and all of them are together under My notes.'],
      ['#/course/math-7', 'Kinder unit tests', 'Unit tests ask about the skills you’re still learning, and a miss gets a second chance at the end.'],
      ['#/', 'A weekly goal', 'Choose how many days a week to practice. Today’s plan shows your progress, and each new week starts with a look back at the last one.'],
      ['#/progress', 'Challenge results', 'See who’s ahead in your latest challenges with friends, on Progress.'],
      ['#/family', 'Family and class', 'One page for everyone you help: learners on this device, and anyone who sends you their progress link from their report.'],
      ['#/balance', 'Balance', 'A new daily puzzle: put every weight on the seesaw so it balances. It takes turns with Leap as the puzzle of the day.'],
      ['#/unlimited', 'Twelve more topics', 'Atoms, chemical reactions, plate tectonics, energy, animal classification, ancient China, the Renaissance, economics, parts of a sentence, Spanish and Hindi vocabulary, and internet safety.'],
      ['#/settings', 'Menus in Spanish or Hindi', 'Choose Español or हिन्दी in Settings for the menus, buttons and headings. Lessons and questions stay in English.'],
      ['#/', 'Much faster first visit', 'The site now downloads everything at once instead of one file at a time, so the first visit on a phone takes about a second instead of over ten.'],
      ['#/placement/math-7', 'Find your starting point', 'A few minutes, one question from each unit, and practice starts where you need it instead of at the very beginning. Choose it when you join, or on any course page. Nothing you’ve earned can go down.'],
      ['#/unlimited', 'Twenty more topics, ready right away', 'Cells, volcanoes, the periodic table, World War II, the Constitution, punctuation, figurative language and more now start at once with reviewed questions. Find them under More topics on the Practice page.'],
      ['#/settings', 'Get the app', 'Install Procademy on a phone, tablet or computer: it opens from its own icon, full screen, and works without the internet. Look for Get the app on Home or in Settings.'],
    ]],
    ['2026-11-04', [
      ['#/', 'A tab bar on phones', 'On a phone, Home, Practice, Courses and the Tutor are always one tap away along the bottom of the screen, and More holds CPM books, Tools, Progress, your profile, Settings and Updates.'],
      ['#/', 'A bigger, faster search', 'Select the search box and it opens wide (the whole screen on a phone), with results as you type: practice, tools, courses, skills, units and CPM lessons. Use the arrow keys and Enter, or tap a result.'],
      ['#/unlimited', 'Faster practice on any topic', 'Questions written for a topic are kept on your device, so going back starts at once. New ones are written ten at a time, by whichever free service starts sooner, so you rarely wait.'],
      ['#/unlimited/find/fractions', 'Math topics start at once', 'Type a math topic such as “fractions” or “slope” in Practice any topic, and Procademy’s own checked questions start immediately, at your level.'],
      ['#/', 'A plan for every day', 'Home shows today’s plan: your practice, a puzzle or facts round, and your daily goal, with a check for each day of the week you practiced.'],
      ['#/', 'Streak savers', 'Every 7 days in a row earns a streak saver (you can hold two). If you miss a day, one is used automatically so your streak keeps going.'],
      ['#/', 'A welcome for every age', 'New learners choose who is learning, from kindergarten through 12th grade or an adult, and a daily goal, then start their first practice right away.'],
      ['#/sprint/add', 'Addition and subtraction facts', 'One-minute rounds of sums and differences within 20, for younger learners or anyone warming up.'],
    ]],
    ['2026-11-03', [
      ['#/unlimited', 'Topic practice without waiting', 'The suggested topics now begin immediately with reviewed questions, and questions on other topics appear as soon as each one is written.'],
      ['#/', 'A cleaner, friendlier design', 'Clean line icons and color in place of emojis, colorful course badges, and warm, well-written wording throughout. Avatars show your initial, and “What’s new” is now Updates.'],
      ['#/tutor', 'A clearer tutor', 'The tutor writes in a warm, clear tone, begins with a direct answer, and never uses emojis.'],
      ['#/settings', 'Accessibility', 'Stronger text contrast, underlined links within sentences, and labeled progress indicators throughout, checked against the WCAG 2.1 AA standard in light and dark mode.'],
    ]],
    ['2026-11-02', [
      ['#/profile', 'Email confirmation', 'An account created with an email address receives a link to confirm it, and saves online once the link is selected. Accounts with only a username work as before.'],
      ['#/unlimited', 'Practice any topic', 'Enter any subject you are studying, such as photosynthesis or Spanish greetings, and questions are written for your grade.'],
      ['#/unlimited', 'Unlimited practice', 'Questions without end for every skill in every course and CPM book: one skill, a unit, a course, or everything together. Select Practice in the top bar.'],
      ['#/tutor', 'The tutor covers every subject', 'Science, reading and writing, history, languages, coding and general questions, in addition to math.'],
      ['#/fractions', 'Fraction lab', 'Add, subtract, multiply, divide, compare and simplify fractions and mixed numbers, each shown as a diagram.'],
      ['#/integers', 'Integer tiles', 'Positive and negative numbers as + and − tiles, one step at a time, with the same problem on a number line.'],
      ['#/search/fraction', 'Search includes tools', 'A search for “fraction” or “negative” lists the matching tools alongside the skills.'],
      ['#/courses', 'American spelling', 'Every lesson and question now uses American spelling and the terms used in US classrooms, such as parentheses.'],
    ]],
    ['2026-11-01', [
      ['#/profile', 'Sign in with Google', 'Save your progress online with one selection, and continue on any computer, with no password to remember.'],
      ['#/profile', 'Online accounts', 'Create an account with a username and a password (no email address is required) and log in on any computer.'],
      ['privacy.html', 'Privacy', 'A page explaining what leaves your device, where it goes, and how to delete it.'],
      ['#/leap', 'Leap', 'A number-line puzzle: reach the target using every card once. 80 levels and a daily puzzle.'],
      ['#/shapes', 'Shapes and space', 'Area, perimeter, volume and surface area, drawn to scale with nets, along with angle pairs and a triangle builder.'],
      ['#/percent', 'Percents and money', 'Sales, tips, tax, markups, and simple and compound interest, shown on a percent ruler.'],
    ]],
    ['2026-10-31', [
      ['#/calc', 'Calculator', 'Fractions remain exact; each answer is given as a fraction, mixed number, decimal and percent, with the order of operations shown step by step.'],
      ['#/numbers', 'Number explorer', 'Prime factors and factor trees, divisibility rules, and the GCF and LCM with a Venn diagram.'],
      ['#/data', 'Data and statistics', 'Mean, median, mode, quartiles, IQR and MAD, each calculated step by step, with dot plots, box plots and histograms.'],
      ['#/tools', 'Tools', 'All tools on one page, listed under Tools in the top bar.'],
    ]],
    ['2026-10-29', [
      ['#/tiles', 'Algebra tiles', 'Solve equations on an equation mat; each move is written as algebra and checked.'],
      ['#/chance', 'Probability simulator', 'Coins, number cubes, spinners and marbles, run up to 1,000 times and compared with theoretical probability.'],
      ['#/setup', 'Word problems', 'Translate a word problem into an equation, solve it, and answer the question.'],
      ['#/words', 'Math vocabulary', 'Clear definitions of 174 math terms. Select an underlined term in a lesson to see its meaning, or study with flashcards.'],
      ['#/profile', 'Several learners on one computer', 'Each learner has separate progress and badges, with an optional PIN.'],
      ['#/profile', 'QR codes', 'Scan a transfer link or a challenge link to open it on a phone.'],
      ['#/profile', 'Daily reminder', 'Add a daily practice reminder to your calendar.'],
      ['#/settings', 'Easier reading and read-aloud', 'Settings can make text easier to read and read each question aloud. Every skill also has a worked example, revealed one step at a time.'],
    ]],
    ['2026-10-28', [
      ['#/profile', 'Your profile', 'A name, a grade (the tutor explains at your level) and an avatar.'],
      ['#/profile', 'Transfer to another computer', 'Create a link that carries your progress, with no account or file required.'],
      ['#/progress', 'Goals and badges', 'A daily goal on Home, and badges to earn on the Progress page.'],
      ['#/sprint', 'Challenge a friend', 'After a practice set or a speed sprint, send a friend a link to the same questions and compare results.'],
      ['#/report', 'Progress report', 'The last 7 or 30 days on one page, to print or send to a parent or teacher.'],
    ]],
    ['2026-10-27', [
      ['#/daily', 'Today’s practice', 'A few minutes each day: skills due for review, mistakes to correct, and something new.'],
      ['#/progress', 'Mistake patterns', 'Identifies the likely cause of an incorrect answer without revealing the answer, and summarizes your common mistakes on the Progress page.'],
      ['#/steps', 'Step checker', 'Enter your work line by line to find where an error occurred.'],
      ['#/sprint', 'Speed sprints', 'One-minute rounds of math facts; facts you miss appear more often.'],
      ['#/cpm', 'CPM test preparation', 'Set a test date to receive a day-by-day plan and a practice test for the chapter.'],
      ['#/graph', 'Graphing calculator', 'Graph equations and inequalities, with sliders.'],
      ['#/courses', 'Worksheets', 'Printable worksheets with answer keys for every skill, unit and CPM lesson.'],
      ['#/tutor', 'Diagrams and files in the tutor', 'The tutor draws graphs and charts, creates pictures, and reads photos and PDFs you attach.'],
      ['#/settings', 'The offline file', 'Download Procademy as a single file that works without an internet connection.'],
    ]],
    ['2026-10-26', [
      ['#/tutor', 'Unlimited tutor', 'The tutor also prepares a model on your device, so it never makes you wait.'],
      ['#/tutor', 'The tutor’s own page', 'Saved conversations, a grade level for explanations, and a choice of style: step by step, brief, or with an example.'],
      ['#/', 'Home and Courses', 'Home shows your saved courses; Courses lists every grade and CPM book.'],
    ]],
    ['2026-10-25', [
      ['#/tutor', 'An immediate tutor', 'A free AI service provides explanations, with no download, account or key.'],
    ]],
    ['2026-10-24', [
      ['#/cpm', 'Practice for nearly every CPM lesson', '83 new skills, from 6th grade to Integrated III.'],
    ]],
    ['2026-10-23', [
      ['#/courses', 'Procademy opens', 'Math for every grade, from Kindergarten to Precalculus and Integrated Math, with a lesson and unlimited practice for every skill.'],
      ['#/cpm', 'CPM books', 'All six Core Connections books, chapter by chapter, with practice for each lesson.'],
      ['#/tutor', 'A tutor that explains', 'Ask about any question and receive a step-by-step explanation.'],
    ]],
  ];
  // links outside the app (the privacy page) go to the website, from the offline file too
  const site = () => (window.MOVE ? MOVE.siteBase() : '').replace(/[^/]*$/, '');
  const when = iso => new Date(iso + 'T12:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

  function page(root) {
    root.innerHTML = `<div class="whatsnew"><h1>Updates</h1><p class="muted" style="margin-top:-4px">Everything added to Procademy, newest first.</p>
      ${UPDATES.map(([iso, items]) => `<section class="card"><h2><time datetime="${iso}">${when(iso)}</time></h2><ul class="wn-list">
        ${items.map(([href, name, what]) => `<li><div><a href="${href.startsWith('#') ? href : site() + href}">${esc(name)}</a><div class="small muted">${esc(what)}</div></div></li>`).join('')}</ul></section>`).join('')}</div>`;
    H.tutorCtx(null);
  }

  window.WHATSNEW = { page, UPDATES };
})();
