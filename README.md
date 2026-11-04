# Procademy

Math for every grade, Kindergarten to Precalculus: a Khan Academy-style practice site in one folder,
with no build step. Open `index.html` in a browser,
or visit the GitHub Pages site. Everything is saved in the browser; nothing is sent anywhere.

**Courses → units → skills.** Every skill has a short *Learn* article and endless *Practice*: a set of
seven questions with step-by-step hints, checked on the page. Answers can be typed (numbers, fractions,
words) or picked from choices whose wrong options are real mistakes.

**Mastery levels.** Each skill is *Not started*, *Attempted*, *Familiar*, *Proficient* or *Mastered*,
worth 0 / 0 / 50 / 80 / 100 mastery points:

| What you do | What happens |
| --- | --- |
| Practice set, all 7 right first try without hints | up to **Proficient** |
| Practice set, at least 5 of 7 | up to **Familiar** |
| Practice set, fewer | **Attempted** (practice never lowers a level) |
| Unit test, course challenge, mastery challenge | each skill goes **up one** level when right (**Mastered** needs one of these) or **down one** when wrong, never below Attempted |

A *unit test* asks one question per skill in the unit. A *course challenge* asks up to 30 across every
unit. A *mastery challenge* asks six questions on the skills you are Familiar or Proficient in, to push
them higher. *Energy points* reward every right answer, finished set and level-up; a *streak* counts the
days in a row with practice.

**Review.** Every question missed anywhere is rebuilt from its seed and collected under Progress → Review.
Get it right and it comes off the list. Nothing is stored but (skill, seed).

**Learning that sticks** (what a video-and-practice site usually doesn't do):

- **Today's practice** (`#/daily`, on Home). Spaced review: every skill gets a next date after each try
  (all right → 3, 7, 16, 37 … days later; mostly right → a little later; a miss → tomorrow), and skills
  practiced before dates existed are due three days after they were last practiced. Today's practice
  mixes the skills due, up to three missed questions and new skills from the class lesson and saved
  courses, interleaved; each question says why it is there. It never lowers a level. Progress lists what
  is due under *Keep fresh*.
- **The mistake coach** (`lib/coach.js`). A wrong answer gets a note on the likely slip, without giving
  the answer away: a sign, a flipped fraction, the decimal point, a percent read as a decimal, adding
  where it needed multiplying (from the numbers in the question), stopping a step early (a number from
  the working), giving back a number from the question, swapped digits, rounding, off by one. Slips are
  counted, and Progress shows *Your mistake patterns* with a tip for each and where it happens most.
- **Printable worksheets** (`lib/worksheet.js`): 🖨 on every skill, unit and CPM lesson makes a fresh
  sheet (6–30 questions, name and score lines, two columns) with an answer key on its own page,
  optionally with the worked steps. A set's code rebuilds the same sheet.
- **A graphing calculator** (`lib/calc.js`, **Graph** in the top bar): one equation, inequality, point or
  shape per line, drawn as you type; a letter set to a number (`m = 2`) becomes a slider, so
  `y = m x + b` can be explored by dragging. Sliders work in the tutor's graphs too, and any graph the
  tutor draws opens in the calculator. Copy link shares a graph.
- **Check my steps** (`lib/steps.js`, `#/steps`, and under every "Solve…" practice question): write the
  working one line at a time and each line is checked exactly, by calculation: an equation line must keep
  the same solutions, an inequality the same true numbers, an expression the same value for every
  value of its letters. A wrong line names the slip (the inequality not flipped after dividing by a
  negative, a sign lost moving a term, a solution lost by square-rooting, the x terms combined wrongly,
  or "right from the line above, but that line had a slip"), and a solved line is checked in the first
  line ("2(4) + 3 = 11 → 11 = 11 ✓"). In practice, checking a finished line counts as a hint.
- **Word problems → equations** (`lib/setup.js`, `#/setup`, a Home tool): a set of five stories (a gym
  membership, savings, a taxi ride, ages, tickets, consecutive integers, supplementary angles, a
  perimeter, "at least" and "at most" budgets…) worked the CPM way: the variable is defined, you write the
  equation or inequality, solve it in the step checker, and answer the question. An equation is accepted
  when it has exactly the same solutions as the story's (any correct form, any letter) and uses the
  story's numbers; the answer on its own is turned away. A wrong one has its own solution checked in the
  story ("your equation says m = 7; $50 + $30 × 7 = $260, but Maya paid $290"), and > for "at least"
  gets its own note. Hint and Show me are there; only equations right on the first try count as right.
- **Algebra tiles** (`lib/tiles.js`, `#/tiles`, `#/tiles/compare`): CPM's equation mat and expression
  comparison mat with legal moves — tap a tile and then its match on the other side to take both away, or
  its opposite on the same side to remove a zero pair; add the same tile to both sides; flip every tile;
  split into equal groups. Every move is written as algebra beside the mat and checked by the step
  checker. Made-up equations (one step, two steps, x on both sides, with negatives) or your own typed one;
  "What next?" suggests a legal move. On the comparison mat: which side is greater, or does it depend on
  x — and where are they equal? Offered from CPM lessons on the mats and from equation skills.
- **Probability simulator** (`lib/chance.js`, `#/chance`): a coin, two coins, a number cube, two number
  cubes (the sum), a spinner and a bag of marbles (the last two with your own sections), run once, 10, 100
  or 1,000 times; a table and bars of experimental against theoretical probability, a line showing one
  outcome settle towards its theory as trials add up, and "Predict first" before 100 trials. Offered from
  CPM probability lessons and probability skills.
- **Speed sprints** (`lib/sprint.js`, `#/sprint`): one-minute rounds of facts (times tables, division,
  negatives, squares and roots, fractions ↔ decimals ↔ percents, percent of a number, or all mixed),
  checked as they are typed. Missed and slow facts come back more often; the best score per deck is
  kept; phones get an on-screen keypad with a minus key.
- **CPM chapter test prep** (`lib/prep.js`, `#/prep/<book>/<chapter>`, from every chapter and the class
  lesson): give the test date and get a plan — a prep set each day weighted to the weakest lessons, a
  practice test the day before (a question from every lesson, no hints, scored lesson by lesson with
  practice for the misses), a warm-up on the day — with a readiness meter, a countdown on Home, and
  the plan as calendar reminders (.ics).
- **Goals and badges** (`lib/badges.js`): a daily goal (10–50 questions, every kind of practice and
  sprints count) shown as a ring on Home, and 27 badges for real milestones — streaks, goals met, a
  perfect set, Proficient and Mastered skills, a unit test ace, a mistake put right, sprint scores, an
  equation solved in the step checker, a CPM practice test passed, equations written from word problems. They are worked out from what is
  already saved, kept with the day earned, and shown on Progress.
- **Challenge a friend** (`lib/challenge.js`, `#/vs/<code>`): after a practice set, a CPM lesson set or a
  sprint, a link gives a friend exactly the same questions (the same seed) with your score — and your
  name only if ticked — and says who won, with a challenge back. Nothing but the link; every field of a
  link is checked before it is used.
- **A progress report** (`lib/report.js`, `#/report`, from Progress): the last 7 or 30 days on one
  printable page for a parent or teacher — days practiced, questions and first-try accuracy, a bar a day,
  skills leveled up, what kinds of practice, usual slips with tips, what is due, a coming CPM test,
  new badges and three suggestions — to print, save as PDF or copy as text.
- **Math words** (`lib/words.js`, `lib/vocab.js`, `#/words`): 174 words of school math, Kindergarten to
  Algebra, each with a plain definition and an example, searchable and filtered by grade, with the
  Procademy practice that uses it. Lessons underline the first use of each word (never everyday words
  like *mean* or *range*, and never inside pictures or math layout); tapping one shows the definition.
  **Flashcards** (`#/words/cards`) from your grade, your starred words or every word, with spaced review
  (3, 7, 16, 37 days for a word you know; tomorrow, and again later in the set, for one you don't).
- **Read aloud.** 🔊 reads a question (and its choices) or a tutor answer with the browser's own voice,
  math as words ("3 over 4", "x squared"). Questions also reach the tutor as readable math now (3/4,
  not "34"). In Settings, **Read each practice question aloud** does it automatically, once per question.
- **Worked examples** (every skill page): a fresh question of that skill solved one step at a time
  ("Show the first step", "Show the next step", or "Show it all"), the answer at the end, then "Now try
  some yourself". Another example gives a new one.
- **Easier to read.** A Settings switch for a clearer typeface with more space between letters, words and
  lines (with the text sizes and dark mode). Right/wrong feedback is announced to screen readers.

**Courses** (`content/`, one file each, in grade order):

| Elementary | Middle school | High school |
| --- | --- | --- |
| Kindergarten (`k.js`) | 6th grade (`g6.js`) | Algebra 1 (`alg1.js`) |
| 1st grade (`g1.js`) | 7th grade (`math7.js`) | Geometry (`geo.js`) |
| 2nd grade (`g2.js`) | 8th grade (`math8.js`) | Algebra 2 (`alg2.js`) |
| 3rd grade (`g3.js`) | | Precalculus (`precalc.js`) |
| 4th grade (`g4.js`) | | Integrated Math 1, 2, 3 (`int1.js`, `int2.js`, `int3.js`) |
| 5th grade (`g5.js`) | | |

A new learner picks a grade on the home page; a course they add or start then stays on it. Adding a
course means adding a file and a `<script>` tag (and a line in `sw.js`); see [CONTENT.md](CONTENT.md).

**CPM books** (`cpm/`, one file per book): Core Connections Courses 1, 2 and 3, and Integrated I, II
and III, chapter by chapter and lesson by lesson. The lesson numbers are checked against CPM's own
homework-help site. Each lesson has our own one-line summary and links to the Procademy skills that
practice it, to a mixed practice set for the lesson or the whole chapter, to the tutor, and to CPM's
homework help for that lesson. Press *I'm on this lesson in class* and the lesson stays on the home page.
Nothing from the books is copied; see [CPM.md](CPM.md).

**Home and Courses.** *Home* is the learner's own page: their saved courses and CPM books, each with a
Continue button, then the lesson they are on in class, what they practiced last, what is up next and
this week's activity. *Courses* is where everything is browsed: every grade and every CPM book, with tabs
(All, Elementary, Middle school, High school, CPM books, Saved) and a search box. **☆ Save** on any card,
course page or book page puts it on Home; pressing it again takes it off. My courses can be put in any
order: drag a card (on a phone, press and hold it, or drag its ⠿), or focus ⠿ and use the arrow keys.

**The tutor** (`lib/tutor.js`, `lib/tutor-ui.js`, `lib/tutor-worker.js`). Procademy has no videos, so a free
AI explains instead: the ✦ Ask button on every page, "Explain it" on every skill and lesson, and "Why is
that wrong?" after a wrong answer. It needs no account, no key and no sign-up anywhere. It helps with
every subject, not only math: science, reading and writing, history, languages, coding and anything a
curious student asks, at the learner's grade, kept right for school-age children; with an essay it helps
the learner write it rather than writing it for them.

**Practice any topic** (`lib/topics.js`, on the Practice page `#/unlimited` and offered by search): the
learner types a topic and multiple-choice questions follow without end, at the learner's grade, and without
waiting. The twelve suggested topics start with questions written and checked by hand (`lib/topicbank.js`),
so they begin at once with no AI request. Any other topic is written by the free AI through
`TUTOR.complete()`, and each question is shown as soon as it has streamed in; when the free cloud services
would make the learner wait, unlimited mode's model on this device writes them instead. The next questions
are written while the learner works. A second check runs in the background only when a service is free: the
AI answers the questions again without the key, and a question whose answers disagree is dropped before it
is shown. "Report a problem" takes a question out of the score. Answers count toward the day's questions,
points and streak, never toward skill levels; the topic goes into the progress log. A learner whose tutor
runs on this device is asked before a topic is sent to the cloud.

- **Cloud first.** Two free cloud services that run the same model (GPT-OSS 20B), LLM7 and Pollinations,
  answer at once while either is free. The cloud tutor sends the question typed and the problem on
  screen, never a name or progress.
- **Unlimited mode, so there is never a wait.** The first time the tutor is opened, the same kind of free
  AI also sets itself up on the device in the background (Qwen3 through WebLLM, in a worker: about 350 MB
  on a phone, 1 GB on a computer, once; or the browser's own model in Chrome, with nothing to download).
  From then on, whenever the cloud is busy, the device answers straight away, with no limit and offline
  too; its answers never leave the device. It is on by default, except on mobile data or Data Saver,
  and it can be switched off in the tutor's ⚙ settings. It needs WebGPU (Chrome or Edge on a computer,
  Safari on a recent Mac, iPhone or iPad); elsewhere the cloud services carry on alone, counting down
  when both are busy and showing Procademy's own first step meanwhile.
- **Grounded and honest.** Every request carries what is on screen, such as the skill's lesson or the
  practice question with its checked steps, so the tutor explains a known-correct answer. Before the
  learner answers, only the first step is shared, and a filter removes any sentence that gives the answer
  away. Cloud requests give up after 25 s with no reply, so a stuck service never stalls the tutor.
- **It draws** (`lib/draw.js`). Ask for a graph ("graph y = 2x + 1 and y = -x + 4") and Procademy draws
  it itself, exactly and at once, before the AI answers, so a graph never depends on the AI getting it
  right; the AI is told what was drawn and the key points, and explains it. The AI can also draw: it
  writes a short block (```` ```graph ````, ```` ```numberline ````, ```` ```chart ````, ```` ```fraction ````) that
  Procademy turns into a picture, and an answer that only describes a graph in words is drawn too.
  Graphs: functions, inequalities (shaded), lines in any form, circles and other curves, points,
  segments, shapes; they zoom and drag, a tap on a curve reads off a point, and intercepts, turning points
  and where curves meet are marked. Also number lines (inequalities, jumps for adding integers), bar,
  line, dot, box (with the same quartiles as the lessons), histogram and pie charts, and fraction bars,
  circles and 10×10 grids. Expressions are parsed, never run. Save turns any drawing into a PNG.
- **Pictures** (`lib/pictures.js`). "Draw me a picture of a castle" goes to a free picture AI
  (Pollinations; no key; one picture at a time, about one every 45 seconds, and sometimes full, so
  Procademy waits and retries by itself). Safe mode is always on, and requests not right for school are
  refused before anything is sent. Math drawings always stay with the exact drawings above.
- **Attach a file** (`lib/files.js`): 📎, paste or drop a photo of homework, a PDF or a text or CSV file.
  The words in a photo are read on the device (Tesseract.js, fetched the first time), a PDF's text with
  PDF.js; the learner can check and correct what was read, and only that text goes with the question.
  A CSV table can be drawn as a chart. Files are judged by their bytes (PNG, JPEG, GIF, WebP, PDF, plain
  text only; web pages, SVGs and programs are refused whatever they are called), size-limited, and a
  photo is redrawn as a clean copy, which drops anything hidden in it and the camera's location. Nothing
  read from a file is ever run or shown as a page, and the AI is told it is the student's material, not
  instructions.
- **Panel or page.** The ✦ Ask panel resizes by dragging its left edge (the handle lights up), by ⇔
  (narrow, medium, wide), by the arrow keys, or on a phone by pulling its top (it rests short, half or
  tall, and pulled right down it closes). Only the panel moves while dragging, so it stays smooth; the
  page lays itself out beside it when let go, or the panel floats over a page too narrow to share. ⤢ opens the same
  conversation on the tutor's own page (**✦ Tutor** in the top bar): saved chats (kept on the device,
  never in a backup), *Ask about* (any question, the class lesson, or a skill being practiced),
  *Explain for* (a grade level), a style (step by step, short, with an example, new to this, check my
  work), and under every answer Copy, follow-ups (simpler, another example, a practice question, why?),
  where it came from and how long it took, and links to the Procademy skills that match.
- **Security.** The site sends a Content-Security-Policy: scripts only from the site itself and the pinned
  libraries on jsDelivr (WebLLM, Tesseract.js, PDF.js), never inline scripts, inline event handlers or
  `eval`; no plug-ins, and frames only from the account project's own sign-in address. Everything the AI or a file supplies is escaped before it is shown.
- LLM7's privacy policy says it is not meant for children under 13; the settings' Advanced section can
  switch it off (and holds an optional free LLM7 key, kept on the device only).

## Profiles and accounts

**Profile** (the avatar at the top right, `#/profile`, `lib/account.js`): a name, a grade (the tutor
explains at that level) and an avatar. With an account — Continue with Google (or GitHub or Facebook), or a
username and a password with no email needed — progress is saved online and comes back on any computer: log in and it is there, no files to move.

- It runs on Firebase (Google's free plan): Firebase Authentication holds the passwords, hashed, with
  lockouts after repeated wrong guesses; Cloud Firestore holds one document per learner, which only that
  learner can read or write ([`firestore.rules`](firestore.rules)). The site's owner turns it on once:
  see [SETUP-ACCOUNTS.md](SETUP-ACCOUNTS.md). Until then the Profile page works on each device only.
- A username becomes a sign-in address inside the owner's own Firebase project, which never receives
  mail. An optional email (a parent's is fine) is used instead and allows "forgot my password". An account
  made with an email gets one email (Firebase's own) with a link to confirm the address, and saves online
  only once it is clicked; until then progress stays on the device. Logging in never sends an email; the
  waiting screen offers "Send the link again", and coming back to the tab after clicking carries on by
  itself. Accounts with only a username are never asked.
- Changes are saved online a few seconds after they happen and whenever the page is hidden; on opening,
  or coming back to the page, the account's copy is merged in (the higher level of every skill, both
  histories, the earliest badges; settings from whichever copy changed last; an empty copy never wins).
  Logging in on a computer that already has someone's progress asks first: add it, or use only the
  account's. Logging out clears the computer unless a copy is kept.
- What goes online: levels, practice history, settings, badges and sprint bests. Tutor chats and attached
  files never do. A learner can delete the account, and everything saved online, from the Profile page.
  [`privacy.html`](privacy.html) explains what leaves the device, for learners and parents (and is the
  privacy policy the sign-in services ask for).
- **Several learners on one computer** (`lib/learners.js`, "Who's practicing?" on Profile): a brother, a
  sister or a parent each get their own progress, badges, sprint bests, tutor chats and graphs, with an
  optional 4-digit PIN (a lock against mistakes, not a strong one). The learner on screen uses the usual
  storage; the others are kept aside under their own keys and swapped in when chosen.
- **A daily reminder**: Profile makes a calendar file with a daily reminder at a chosen time that opens
  today's practice.
- **Without an account: a move link** (`lib/move.js`, on Profile and in Settings). It carries the progress
  itself — compressed, after the `#` of the address, so no website ever receives it (a few hundred
  characters to about 10 KB) — and opening it on another computer copies the progress there, added to
  what is there or instead of it. A link is untrusted on arrival: size-limited (a link that would unpack
  past 3 MB is stopped), and rebuilt field by field with the right types. Links made in the offline file
  open on the website. A short link (and every challenge link) can be shown as a QR code for a phone
  (qrcode-generator 2.0.4, loaded only when asked).

## Without the internet

- **One file** (`procademy-offline.html`, Settings → *Download the offline file*): the whole site in a single
  2.3 MB page that opens with a double-click, from a laptop or a USB stick, with no internet and no
  server. Courses, practice, tests, CPM books, progress and drawings all work; the AI tutor, pictures and
  reading attached photos and PDFs work whenever there is a connection. Its progress is kept apart from
  the website's; *Save a copy* and *Load a copy* move it across. `tools/build-offline.js` makes it from the
  files `index.html` loads (each script inline, allowed by the security policy by its SHA-256 hash, so
  nothing else inline can run), and `tests/run.sh` rebuilds and checks it before every push.
- **Phones and tablets:** open the website once while online and add it to the home screen; `sw.js`
  keeps a copy, so it then opens and works offline.

## How it is built

| File | What it does |
| --- | --- |
| `index.html`, `app.css` | the shell and the only stylesheet; light and dark from tokens at the top |
| `lib/rng.js` | seeded random numbers: a question is a pure function of (skill id, seed) |
| `lib/math.js` | `M.*` helpers that turn numbers into HTML: fractions, powers, roots, polynomials |
| `lib/content.js` | the registry (`ACADEMY.course`, `ACADEMY.skill`), question building and validation, answer checking |
| `lib/store.js` | one localStorage key, `procademy.v1`; export and import |
| `lib/engine.js` | practice sessions and every mastery and points rule |
| `lib/views.js` | every screen, including the exercise player |
| `lib/app.js` | hash routing (`#/course/math-7`, `#/cpm/int2/3.1.1`), theme, search |
| `lib/cpm-views.js` | the CPM book, chapter and lesson pages |
| `lib/tutor.js`, `lib/tutor-ui.js`, `lib/tutor-page.js` | the AI tutor's engine, its resizable panel, and its own page |
| `lib/draw.js`, `lib/pictures.js`, `lib/files.js` | the tutor's exact drawings, pictures from the picture AI, and attached files |
| `lib/coach.js`, `lib/worksheet.js`, `lib/calc.js` | the mistake coach and reading aloud, printable worksheets, the graphing calculator |
| `lib/steps.js`, `lib/sprint.js`, `lib/prep.js` | the step checker, speed sprints, CPM chapter test prep |
| `lib/badges.js`, `lib/challenge.js`, `lib/report.js` | goals and badges, challenge a friend, the progress report |
| `lib/account.js`, `lib/firebase-config.js`, `firestore.rules` | profiles, online accounts and sync (see SETUP-ACCOUNTS.md) |
| `lib/move.js` | moving progress to another computer with a link (no account, no file) |
| `lib/learners.js` | several learners on one computer |
| `lib/words.js`, `lib/vocab.js` | math words: the glossary, tap-to-define in lessons, flashcards |
| `lib/setup.js` | word problems → equations |
| `lib/tiles.js`, `lib/chance.js` | algebra tiles (equation and comparison mats), the probability simulator |
| `lib/boot.js` | sets the theme before the first paint (a file, so no inline script is needed) |
| `sw.js` | offline support when served over http(s) |
| `tools/build-offline.js` → `procademy-offline.html` | the one-file offline build (made by the tests; edit the sources, not the file) |

The name you give in Settings is used in the greeting and stays on the device. No name is written into
any page.

## Tests

```
./tests/run.sh
```

runs these in headless Chrome and node: the page loads without console errors on several routes;
`index.html`'s security policy is checked (no inline scripts, no `unsafe-inline` or `unsafe-eval`);
`tests/sweep.html` visits every page (1,170 of them) at phone width for script errors, leaked text and
anything wider than the screen;
`tests/suite.html` drives the real app (mastery rules, the exercise player as a learner would use it,
every route, every skill's article and a question, settings, search, the tutor with a stand-in network,
drawings, pictures, attached files including ones built to attack the page, resizing and reordering); and `tests/content.js` builds
hundreds of questions per skill and checks structure, determinism, variety, that each answer passes the
real checker, that choice questions have no giveaways, and each skill's own `verify()` re-derivation.
`tests/cpm.js` checks every CPM book against CPM's lesson list. `tests/offline.js` opens the one-file build
from disk with every network lookup blocked (pages, practice, drawings, saved progress, no network
requests, no policy violations), and checks the website still opens after its server is stopped. `SEEDS=1500 ./tests/run.sh` checks more
seeds, and `./tests/run.sh --live-tutor` also asks the real free cloud tutor, starts unlimited mode, and runs
`tests/live-extras.html`: the real site with its security policy on reads a photo and a PDF, gets a
picture from the picture AI, and has the cloud tutor draw.

## History

Before this, the repository was a hub of sixteen separate practice apps. That version is kept at the
git tag `hub-v1`.
