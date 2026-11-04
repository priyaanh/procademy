# Writing content

One file per course in `content/`, loaded by a `<script>` tag in `index.html`. Plain script, no modules:
wrap the file in `(function () { 'use strict'; … })();`. Three globals are available: `ACADEMY` (the
registry), `M` (HTML helpers for math) and `RNG`. The offline file (`procademy-offline.html`) picks up every
script `index.html` loads by itself; `./tests/run.sh` rebuilds it.

Check a file while writing it with `node tests/content.js content/<file>.js`; it must print `PASS`.

## A course

```js
ACADEMY.course({
  id: 'math-7', title: '7th grade math',
  subject: 'Middle school', grade: 7,      // subject: Elementary (K–5) | Middle school (6–8) | High school; grade 0 = K … 12
  icon: '7', hue: 215,                      // a short label (K, 7, A1, Geo…) shown in a badge; a hue 0–360 for the course color
  blurb: 'One sentence saying what the course covers.',
  units: [
    { id: 'negatives', title: 'Negative numbers', blurb: 'One line.', skills: ['math7.add-negatives', 'math7.sub-negatives'] },
  ],
});
```

Skill ids are `<prefix>.<kebab-name>`; one prefix per course: `k.`, `g1.` … `g6.`, `math7.`, `math8.`,
`alg1.`, `geo.`, `alg2.`, `pre.`, `int1.`, `int2.`, `int3.`. Every skill belongs to exactly one unit, and a unit has at least two skills.

## A skill

```js
ACADEMY.skill({
  id: 'math7.two-step-equations',
  title: 'Two-step equations',                 // plain text, named the way Khan Academy names an exercise
  learn: `<p>…</p><div class="example"><div class="ex-title">Example</div>…</div>`,
  make(rng) { … return question; },
  verify(q) { … return true; },                // optional, strongly encouraged
});
```

**learn** is a short HTML article, at least 120 characters of text: two to four short paragraphs that
explain the idea the way a tutor would, with the rule in bold, then one worked example in the
`example` box. Use the `M` helpers for any math. Inline SVG is allowed (`class="figure"`); no images or
external links.

**make(rng)** builds one question. It must be deterministic: use only `rng` for randomness, never
`Math.random` or `Date`. The RNG offers `int(a, b)` (inclusive), `nz(a, b)` (non-zero), `pick(list)`,
`shuffle(list)`, `sample(list, k)`, `chance(p)`, `bool()`, `sign()`, `dec(a, b, places)`.

**verify(q)** re-derives the answer from `q.params` in a *different* way (brute force, another formula,
JavaScript's own arithmetic) and returns `true` when `q.answer` is right. It is how the tests catch real
mistakes, so do not copy the generator's own arithmetic into it.

## The question object

```js
{
  prompt: 'HTML',                 // put the expression to work on inside <div class="big">…</div>
  type: 'number' | 'choice' | 'text',
  answer: 12,                     // number: a finite number
  answer: 'x < 4',                // choice: the correct option, exactly as it appears in choices
  answer: 'tengo',                // text: a short string
  choices: ['…', '…', '…', '…'],  // choice: 3–5 options, distinct once tags are stripped; the engine shuffles them
  keepOrder: true,                // choice: keep the options in the order given (for a natural ordering)
  accept: ['yo tengo'],           // text: other spellings that are also right
  unit: '%',                      // number: shown beside the input ('%', 'cm', '$', 'km/h' …)
  answerText: '3/4',              // number: how to display a fractional answer; use M.fracText; must parse to answer
  tolerance: 0.01,                // number: for rounded answers (π problems); default is exact
  hints: ['step 1', 'step 2', 'answer'],   // 2–5 HTML strings, one step each; the LAST hint states the answer in <b>
  params: { a: 3, b: -5 },        // the raw numbers, for verify()
  help: 'One line under the input', // text: optional
}
```

The checker (`tests/content.js`) rejects: a `choice` whose answer is not among the options or appears
twice, options that read the same, an answer that does not check as correct through the real checker,
`undefined`/`NaN` leaking into the text, fewer than 8 distinct prompts in 300 seeds, every seed giving
the same answer, and a right choice that is by far the longest option in most questions.

## Tone and symbols

Procademy is a formal website. Everything a learner reads, in lessons, questions, hints, buttons, headings,
messages and badges, follows these rules.

- **No emojis or pictographs**, anywhere: not as decoration, icons, bullets or pictures. Pictures to count
  or compare are drawn (SVG shapes from the M helpers), never emoji.
- **Symbols that are allowed**, because they are notation rather than decoration: math symbols
  (+ − × ÷ = < > ≤ ≥ √ π ° ∞), arrows in math and in navigation ("→" in "fraction → decimal", "← Back"),
  ✓ and ✗ only where a step is marked correct or incorrect, ✕ only as a close button, ☐ only as the blank in
  an equation such as 3 + ☐ = 5, and ⌫ on a calculator key.
- **A formal, respectful tone.** Complete sentences, sentence-case headings, American spelling. Address the
  learner as "you". Encourage without exclamation marks, slang or jokes: "Correct." rather than "Nice
  work!"; "Incorrect. Try again, or view a hint." rather than "Not quite!"; "Session complete" rather than
  "Perfect!".
- **Buttons say what they do**, verb first and short: "Start practice", "Check", "Next question", "End
  session", "Download the offline file".
- **Names are plain descriptions**: a badge is "Seven-day streak", not "Week warrior".

## Rules of thumb

- **Write for the grade.** Kindergarten to 2nd grade: very short sentences, small numbers, pictures drawn with
  `M.items` (never emoji), mostly `choice` or small `number` answers. Older grades can read more.

- **Distractors are real mistakes**: a sign error, a forgotten flip of the inequality, the wrong operation.
  Keep all options the same shape and length, so the right one does not stand out.
- **Vary the questions**: two or three templates chosen with `rng.pick`, each with random numbers.
- **Numbers**: integers or clean decimals. For a fraction answer give the numeric value as `answer` and
  `M.fracText(n, d)` as `answerText`; show fractions with `M.frac(n, d)`. Print numbers with `M.n(x)` so
  negatives get a real minus sign, and put a negative in parentheses after an operator: `3 − (−4)`.
- **Drawings**: inside `<svg>`, never use HTML tags like `<i>`, `<b>` or `<sub>`: a browser ends the
  drawing at them. Use `font-style="italic"` / `font-weight="700"` on `<text>` or `<tspan>`. The registry
  converts stray `<i>`/`<b>`, and the checker rejects the rest. Use `currentColor` and `var(--…)` colors
  so the drawing works in dark mode.
- **Inequality signs**: write `&lt;` and `&gt;` in HTML strings (a bare `<` starts a tag). The registry
  repairs a `<` or `>` that has a space on the inside, but entities are safer.
- **Text answers** are short (one or two words) and are checked ignoring case, accents and punctuation.
- **Hints are steps**, not restatements. Hint 1 says what to do first; the last hint gives the answer in bold.
- **Names** in word problems are invented first names (Ana, Ben, Chloe, Dev, …). No real people,
  addresses or brands.
- Keep `make()` readable: under about 40 lines, split into templates.

## M helpers

`M.n(x)` number · `M.frac(n, d)` stacked fraction (simplified; `{raw: true}` to keep as given) ·
`M.fracText(n, d)` "3/4" · `M.mixed(n, d)` · `M.simp(n, d)` → `[n, d]` · `M.gcd` · `M.round(x, places)` ·
`M.sup(base, e)` · `M.sub(base, i)` · `M.sqrt(x)` · `M.v('x')` italic variable · `M.abs(x)` ·
`M.term(coef, 'x', pow)` → `3x²` · `M.poly([2, -3, 1], 'x')` → `2x² − 3x + 1` · `M.signed(x)` → `+ 3` / `− 3` ·
`M.eq(l, r)` · `M.money(x)` · `M.pct(x)` · `M.pt(x, y)` · `M.deg(x)` · `M.units(x, 'cm')` ·
`M.table(headers, rows)` · `M.ordinal(n)` · `M.list(items)` · `M.plural(k, 'cat')` · `M.code(s)` inline code ·
`M.pre(s)` code block · `M.esc(s)` escape text.

**Pictures to count, compare or group** (never emoji): `M.items(n, shape, color, opts)` draws `n` simple shapes
as inline SVG in rows of 5, with `role="img"`, an `aria-label` such as "7 red stars" and a matching `<desc>`.
Shapes: `circle`, `square`, `triangle`, `star`, `heart`, `diamond` (`M.items.shapes`); colors: `red`, `blue`,
`green`, `orange`, `purple` (`M.items.colors`, the site's chart colors, so they read in light and dark mode).
Several groups: `M.items([[3, 'circle', 'red'], [4, 'square', 'blue']], opts)`; a group can add
`{ hollow: true }` for empty outlines. Options: `per` (shapes per row; `0` = one line), `size` (cell px, default
32), `out` (cross out the last k, for taking away), `rows` (each group on its own left-aligned row, for
comparing), `flow` (all groups in one grid, as in a ten frame), `frame` (a box round each cell), `sep: '+'`
(between groups side by side), `inline` (inside text or a table cell), `label` (the aria-label). Name the
shapes in words in the question ("How many red circles?"). In `verify()`, `M.countItems(html, 'red circle')`
counts the drawn shapes (`'empty circle'` for hollow ones, `'red circle crossed'` for crossed-out ones).
