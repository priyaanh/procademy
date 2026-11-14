/* What's new (#/new): everything added to Procademy, newest first, each with a link to try it. Home's
   "New in Procademy" card shows only the latest tools and goes away with Got it; this page keeps the
   whole list. Add an entry here whenever something a learner can see is added. */
'use strict';
(function () {
  const V = window.VIEWS, H = V._h, esc = H.esc;
  /** [date, [link, name, what it is]...], newest first */
  const UPDATES = [
    ['2026-11-12', [
      ['#/puzzles', 'A page of daily puzzles', 'Three new daily puzzles (Target, Cages and Cross-number) beside Leap and Balance, each at Easier, Just right or Harder, with a nudge first and an explanation after you solve it. Past puzzles are a tap away.'],
      ['#/trophies', 'A trophy room', 'Your badges and how close you are to the next ones, stickers, a streak calendar, this week at a glance, certificates for finished units and a picture to share with a parent.'],
      ['#/league', 'Family leagues and games', 'A weekly family league shared by link, Factor grab for two players on one device, and racing the computer in speed sprints.'],
      ['#/map/math-7', 'A treasure map for every course', 'Each unit is an island that fills in as you master it.'],
      ['#/settings', 'Reading and access', 'Line and word spacing, a reading ruler, lessons in simpler words, fewer extras on screen, a bigger focus outline, and more time (or none) on timed quizzes.'],
      ['#/help/access', 'Easier for everyone', 'Screen readers hear each answer’s result and read fractions and powers as words, captions show what’s read aloud, charts work for color blindness, and the keyboard reaches everything.'],
      ['#/', 'Quicker and sturdier', 'Tools load before you open them, the tutor remembers answers for when you’re offline, progress recovers from a damaged save, and Settings shows speed and storage with a Free up space button.'],
      ['#/unlimited', 'A Practice page with tabs', 'For you, Courses, Topics and Pictures. Make your own sets, mix two courses, take a practice test like the real one, pick up where you stopped, and challenge a friend to the same questions.'],
      ['#/unlimited/pictures', 'Better photos of homework', 'Turn or crop a photo before it’s read, tips for photos of handwriting, and other readings to choose from when the reader isn’t sure.'],
      ['#/settings', 'Settings you can search', 'Search settings, see a theme before choosing it, six text sizes, sound volume, reminder days, the page Procademy opens on, and saving your settings to a file.'],
      ['#/profile', 'A profile that’s yours', 'Build an avatar, choose a favorite subject, change your username, and see each device that syncs your progress.'],
      ['#/practice/math7.add-negatives', 'Easier on phones and tablets', 'A one-handed mode, two columns when the phone is sideways, the lesson beside the questions on bigger screens, and a scratch pad that works with a stylus.'],
      ['#/course/hindi', 'Hindi for beginners', 'A new course from the Devanagari letters to simple sentences, with Listen buttons and its own flashcards.'],
      ['#/typing', 'Typing practice', 'Type math words at your own pace and see your words per minute and accuracy. There’s no countdown.'],
      ['#/practice/math7.add-negatives', 'Hints that explain more', 'The rule in a box, your own answer worked into the hint, pictures, a worked example beside the question, why a wrong choice is wrong, and feedback in Spanish or Hindi if you like.'],
      ['#/review', 'A better Review', 'Sort and search your mistakes, mark one as careless or not known yet, keep a mistake journal, see what you fixed this week, and do a quick round of five from Home.'],
      ['#/progress', 'Progress you can filter', 'Filter by course and dates, fold sections away, compare this month with last month, see your best time of day and when each course should be finished.'],
      ['#/report', 'A fuller report', 'More periods to choose from, each compared with the one before, mastery by area and a fuller Monday recap of last week.'],
      ['#/family', 'More for parents', 'Plain words and next steps for each learner, how to help at home, a learner’s replies to your notes, and tests on their calendar.'],
      ['#/courses', 'Courses by subject', 'Filter courses by subject, see the time left on each one, start where you’re ready, and practice a whole course mixed together.'],
      ['#/skill/math7.add-negatives', 'Skill pages that teach more', 'In short, In real life, Watch out for, Check your understanding, examples with other numbers, and a lesson read aloud step by step.'],
      ['#/help', 'Help and an easier way around', 'A Help page, a More menu with favorites and recent pages, search inside lessons and formulas, and going back keeps your place.'],
    ]],
    ['2026-11-11', [
      ['#/courses', 'Four more courses', 'SAT and ACT style math, competition math, personal finance and coding and logic: over 100 new skills.'],
      ['#/', 'A friendlier start and a smarter Home', 'A welcome that asks what you want to do, choosing a grade by age, a parent setup, Coming up dates, a busy-day goal, a weekly rest day, and “What should I do now?”'],
      ['#/practice/math7.add-negatives', 'A practice screen that does more', 'A clear right-or-wrong banner, a fraction key, Undo, dragging answers into order, a number line, clicking points on a grid, writing digits by hand on tablets, focus mode and a perfect-set celebration.'],
      ['#/tutor', 'A tutor that explains better', 'Stacked fractions, bar models and shapes, follow-ups that fit the answer, a homework planner, answer length and text size, ratings, and help even when offline.'],
      ['#/graph', 'More from the calculators', 'Tap any point on a graph, pinch to zoom, named functions, polar and piecewise graphs, paste a table of points, calculator history, and large keys.'],
      ['#/tools', 'Five new tools', 'A ratio table, clocks and time, counting money, place value blocks and a multiplication table explorer, plus algebra-tile factoring and 3-D nets that fold.'],
      ['#/settings', 'Your colors, your way', 'Choose one of four blues for the whole site, a high-contrast theme, or a dyslexia-friendly reading font.'],
      ['#/skill/math7.add-negatives', 'Learn this first', 'Skill pages link to the skills they build on, so it’s easy to step back when something feels too hard.'],
      ['#/cpm', 'More for your class book', 'Every lesson shows whether you’ve practiced it, each chapter has its math words, and lessons have hints and a one-page summary to print.'],
      ['#/courses', 'Friendlier course cards', 'Each course card has a small drawing of what it’s about, and the badges are blue.'],
      ['#/', 'Quicker and smoother', 'The first visit downloads less, pages change gently, press ? for keyboard shortcuts, and a banner says when a new version is ready.'],
    ]],
    ['2026-11-09', [
      ['#/course/trigonometry', 'Three new courses', 'Trigonometry, Statistics and probability, and Calculus BC: 75 new skills with lessons, worked examples and step-by-step hints.'],
      ['#/weekly', 'Challenges and boss levels', 'A weekly challenge problem, a timed quiz and a boss level for every unit, and Beat your best on every skill.'],
      ['#/warmup', 'Warm-ups, drills and plans', 'A mental math warm-up, drills for each kind of mistake, a summer review plan and a Ready for high school checklist.'],
      ['#/unlimited', 'Practice that adjusts to you', 'Unlimited practice picks easier or harder questions as you go, and hints start with a gentle nudge.'],
      ['#/tutor', 'More ways to learn with the tutor', 'Ask by voice, get explanations in Spanish or Hindi, let the tutor quiz you, teach it back, see steps on a whiteboard, and share a chat by link.'],
      ['#/calc', 'A more complete calculator', 'Statistics with lists and regression, more menus (nPr, nCr, round, roots, tests, angles), exact square roots, and lessons where it presses its own keys.'],
      ['#/geometry', 'A geometry lab', 'Constructions, a sketch pad, a protractor and ruler, and transformations on a grid.'],
      ['#/measure', 'Units and scale', 'Convert units exactly, and work with scale drawings and maps.'],
      ['#/steps', 'Solve, simplify and factor', 'The step checker solves equations, simplifies and factors, showing every step.'],
      ['#/progress', 'Progress in more detail', 'Time spent practicing, a mastery map, test scores, what is due this week and how ready you are for the next test.'],
      ['#/family', 'For parents and teachers', 'Leave a note, assign practice, compare learners side by side, and share any mix of skills with a class.'],
      ['#/settings', 'Quiet hours and backups', 'Quiet hours, practice reminders, a spreadsheet download, and a copy of progress kept on this device each week.'],
    ]],
    ['2026-11-08', [
      ['#/practice/math7.add-negatives', 'A friendlier practice screen', 'A number keypad, Show me how after a wrong answer, Skip for now, Pause, a scratch pad, optional sounds, bigger pictures you can zoom, and a summary that lists what to look at again.'],
      ['#/review', 'Fix my mistakes', 'Review shows each mistake with what you answered and how to get it. A mistake clears after two right answers, or when you mark that you understand it.'],
      ['#/', 'A smarter Home', 'Continue where you left off, a problem of the day, a 5-minute practice, something new to try, and a tap on any day of the week to see what you did.'],
      ['#/sitemap', 'Find anything', 'Search forgives typos and understands questions, an All pages list shows everything, and you can choose the tabs at the bottom on a phone.'],
      ['#/course/math-7', 'Clearer courses and lessons', 'A course picked for your grade, the big idea of each skill, lessons one step at a time, three sample questions, and a one-page summary to print.'],
      ['#/progress', 'Progress that tells you what to do next', 'This week first, a chart of the last eight weeks, what you got better at, and a short list of what to practice next and why.'],
      ['#/cpm', 'Your class, day by day', 'Pick your class lesson once and it can move ahead by itself. Home shows today’s homework and how many lessons are left before the chapter test.'],
      ['#/tutor', 'A tutor that shows one step at a time', 'Answers come step by step, can be read aloud, and chats can be pinned, renamed and searched.'],
      ['#/graph', 'More from the graphing calculator', 'Undo and redo, a table of values, key points to tap, and graphs you can save by name.'],
      ['#/words/formulas', 'A formula sheet', 'Formulas from elementary school to high school, with what each letter means, next to the math words, which now have pictures.'],
      ['#/timer', 'A study timer', 'Focus for 15, 25 or 45 minutes, then take a short break.'],
      ['#/family', 'For parents and teachers', 'Each learner’s week at a glance, a daily goal a parent can set, and a link to share practice with a class.'],
      ['#/settings', 'Erase all progress', 'One button in Settings erases all progress. Signed in with a password, it asks for your password first.'],
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
      ['#/course/math-7', 'Your skill map', 'Every course page shows a square for each skill, filled to your level, with the next one to learn ringed.'],
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
