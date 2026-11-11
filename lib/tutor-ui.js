/* The tutor's panel: a floating "Ask" button on every page, the chat, and a small settings view.
   Views tell it what the learner is looking at with TUTORUI.setContext({...}); buttons such as
   "Explain this" call TUTORUI.open({ ask: 'question text' }).
   The free cloud tutor is the default, so the panel is ready the moment it opens; the on-device tutor
   is a choice in the settings view, for anyone who wants it private and offline. */
'use strict';
(function () {
  const T = window.TUTOR, S = window.STORE, M = window.M, FILES = window.FILES;
  const esc = M.esc;
  let context = null, history = [], pending = null, panel = null, builtin = false, view = 'chat', waiting = null, openAdvanced = false;
  let handoff = null;          // a conversation carried from the panel to the full page
  let tray = null;             // files waiting to go with the next question

  const PAGE_Q = 'Explain this page';
  const QUICK = {
    question: ['Give me a hint', 'Explain the idea behind this', 'Show me a similar example'],
    wrong: ['Why was my answer wrong?', 'Give me a hint', 'Explain it differently'],
    done: ['Explain how to get this answer', 'Why does this work?', 'Show me a similar example'],
    skill: ['Explain this like I am new to it', 'Show me another example', 'Give me a question to try', PAGE_Q],
    lesson: ['Explain this lesson simply', 'Show me an example', 'What should I remember from it?', PAGE_Q],
  };
  /** conversation starters for each subject, simpler for younger learners (the tutor's own page shows them all) */
  const SUBJECTS = [
    ['math', 'Math', [['Slope', 'What is slope, and how do I find it?'], ['Adding fractions', 'How do I add fractions with different denominators?'], ['Inequalities', 'Why do I flip the sign when I divide an inequality by a negative?'], ['Area and perimeter', 'What is the difference between area and perimeter?']],
      [['Adding fractions', 'How do I add fractions with different denominators?'], ['Multiplying', 'What does multiplication mean?'], ['Area', 'How do I find the area of a rectangle?'], ['Rounding', 'How do I round to the nearest ten?']]],
    ['science', 'Science', [['Photosynthesis', 'How does photosynthesis work?'], ['Weather and climate', 'What is the difference between weather and climate?'], ['Floating and sinking', 'Why do some things float and others sink?'], ['Vaccines', 'How do vaccines help the body?']],
      [['Blue sky', 'Why is the sky blue?'], ['Seeds', 'How do plants grow from seeds?'], ['States of matter', 'What are the states of matter?'], ['The moon', 'Why does the moon change shape?']]],
    ['reading', 'Reading and writing', [['Main idea', 'How do I find the main idea of a passage?'], ['Thesis statements', 'How do I write a strong thesis statement?'], ['Simile or metaphor', 'What is the difference between a simile and a metaphor?'], ['Persuasive essays', 'Help me plan a persuasive essay.']],
      [['Good stories', 'What makes a good story?'], ['Main idea', 'How do I find the main idea?'], ['Commas', 'When do I use a comma?'], ['Story plan', 'Help me plan a short story.']]],
    ['history', 'History and geography', [['American Revolution', 'What caused the American Revolution?'], ['The Constitution', 'Why was the Constitution written?'], ['World War I', 'What were the causes of World War I?'], ['Latitude and longitude', 'How do I read latitude and longitude on a map?']],
      [['The Pilgrims', 'Who were the Pilgrims?'], ['Government', 'What do the three branches of government do?'], ['Continents', 'What are the seven continents?'], ['Independence Day', 'Why do we celebrate Independence Day?']]],
    ['languages', 'Languages', [['Spanish verbs', 'How do I conjugate regular Spanish verbs in the present tense?'], ['Hindi greetings', 'How do I introduce myself in Hindi?'], ['Ser and estar', 'When do I use ser and estar in Spanish?'], ['New words', 'What are good ways to learn new vocabulary?']],
      [['Counting in Spanish', 'How do I count to ten in Spanish?'], ['Hello in Hindi', 'How do I say hello in Hindi?'], ['Colors in Spanish', 'What are the colors in Spanish?'], ['Thank you in Hindi', 'How do I say thank you in Hindi?']]],
    ['coding', 'Coding', [['Variables', 'What is a variable in programming?'], ['Loops', 'How does a loop work?'], ['Algorithms', 'What is an algorithm? Give me an everyday example.'], ['Finding bugs', 'How do I find a bug in my code?']],
      [['What is coding?', 'What is coding?'], ['Algorithms', 'What is an algorithm?'], ['Following steps', 'How does a computer follow steps?'], ['Loops', 'What is a loop?']]],
  ];
  const young = () => { const g = learnerGrade(); return g != null && g <= 5 && !S.get().profile.adult; };
  /** the starters for a subject, by the learner's grade: [[label, question], …] */
  function starters(id) { const sub = SUBJECTS.find(x => x[0] === id) || SUBJECTS[0]; return young() ? sub[3] : sub[2]; }
  /** the panel with nothing on screen to help with: Explain this page, then a math question and one from another
      subject (a different pair each day) */
  function quickNone() {
    const day = Math.floor(Date.now() / 864e5), other = SUBJECTS[1 + (day % (SUBJECTS.length - 1))];
    const short = list => (list.find((x, k) => k >= day % 4 && x[1].length <= 48) || list.find(x => x[1].length <= 48) || list[0])[1];
    return [PAGE_Q, short(starters('math')), short(starters(other[0]))];
  }
  /** what is on the page, for "Explain this page": its title, sections, buttons and words, without the learner's name */
  function pageText() {
    const main = document.getElementById('main');
    if (!main) return '';
    const name = (S.get().profile.name || '').trim();
    const clean = t => { t = String(t || '').replace(/\s+/g, ' ').trim(); if (name.length > 1) t = t.split(name).join('the student'); return t.replace(/@[\w.-]+/g, '@user'); };
    const h = main.querySelector('h1'), title = clean(h ? h.textContent : document.title);
    const heads = [...new Set([...main.querySelectorAll('h2, h3')].map(x => clean(x.textContent)).filter(t => t && t.length < 80))].slice(0, 10);
    const btns = [...new Set([...main.querySelectorAll('button, a.btn, a.chip-btn, [role="tab"]')].map(b => clean(b.getAttribute('aria-label') || b.textContent)).filter(t => t && t.length < 40))].slice(0, 14);
    const words = clean(main.innerText).slice(0, 1000);
    return `On Procademy, the student is looking at the page "${title}".` + (heads.length ? ` Its sections: ${heads.join('; ')}.` : '') + (btns.length ? ` Its buttons and links: ${btns.join('; ')}.` : '') + ` What it shows: ${words}`;
  }
  const PAGE_ASK = 'The student wants to know what this page is for and how to use it. Explain it in a few short steps: what the page is for, what its main parts and buttons do, and a good first thing to try.';
  /* ---------- answers a little at a time ----------
     A long answer arrives in steps: numbered steps (or "Step 1", "Step 2" paragraphs) show one at a time with
     Next step, and any other long answer shows its first part with Show more. The state is kept on the message,
     so a redraw keeps what was opened. */
  const isStep = el => el.tagName === 'LI' || /^\s*(step\s*\d+|\d+[.)])/i.test(el.textContent || '');
  function pace(el, m) {
    if (!el || !m || m.pending || !m.content || m.pic) return;
    el.querySelectorAll(':scope > .pace').forEach(x => x.remove());
    const units = [];
    [...el.children].forEach(c => { if (c.tagName === 'OL') [...c.children].forEach(li => units.push(li)); else if (!c.matches('.ai-actions, .tmsg-via, .ai-verify, .ai-foot, .ai-why, .ai-thanks, .pace')) units.push(c); });
    units.forEach(u => { u.hidden = false; });
    const steps = units.filter(u => (u.tagName === 'LI' && u.parentElement.tagName === 'OL') || (u.tagName === 'P' && isStep(u)));
    let cut = -1, label = '';
    if (steps.length >= 3 && !m.paceAll) {
      const shown = Math.max(1, Math.min(m.paceStep || 1, steps.length));
      if (shown < steps.length) { cut = units.indexOf(steps[shown - 1]); label = `<button type="button" class="chip-btn" data-pace="next">Next step (${shown + 1} of ${steps.length})</button><button type="button" class="chip-btn" data-pace="all">Show all steps</button>`; }
    } else if (!m.paceAll && units.length > 3 && (m.content || '').length > 900) {
      let len = 0;
      for (let k = 0; k < units.length; k++) { len += (units[k].textContent || '').length; if (k >= 1 && len > 420) { cut = k; break; } }
      if (cut >= 0 && cut < units.length - 1) label = '<button type="button" class="chip-btn" data-pace="all">Show more</button>'; else cut = -1;
    }
    if (cut < 0) return;
    units.forEach((u, k) => { if (k > cut) u.hidden = true; });
    el.__pace = m;
    const before = el.querySelector(':scope > .ai-verify, :scope > .ai-actions, :scope > .ai-foot');      // Next step sits right under the steps
    if (before) before.insertAdjacentHTML('beforebegin', `<div class="pace">${label}</div>`); else el.insertAdjacentHTML('beforeend', `<div class="pace">${label}</div>`);
  }
  document.addEventListener('click', ev => {
    const b = ev.target.closest('[data-pace]'); if (!b) return;
    const el = b.closest('.pace') && b.closest('.pace').parentElement, m = el && el.__pace;
    if (!m) return;
    if (b.dataset.pace === 'next') m.paceStep = (m.paceStep || 1) + 1; else m.paceAll = true;
    pace(el, m);
  });
  /** follow-ups under an answer: more detail, a picture, a question to try */
  const MORE = [['Explain more', 'Explain that in more detail, step by step.'], ['Show me a picture', null], ['A practice question', 'Give me one practice question like this. Please don’t tell me the answer until I reply.']];
  /** "Show me a picture" asks for one of what the conversation is about: a drawing for math, a picture otherwise */
  function pictureAsk(msgs) {
    const u = [...(msgs || [])].reverse().find(x => x.role === 'user' && x.content && !/^(explain that|show me a picture|give me one practice)/i.test(x.content));
    const about = u ? u.content.replace(/\s+/g, ' ').trim().replace(/[?.!]+$/, '').replace(/^(what|who|how|why|when|where)\s+(is|are|was|were|do|does|did|can)\s+(i\s+|we\s+|you\s+)?/i, '').replace(/^(please\s+)?(explain|tell me about|describe|show me)\s+/i, '') || 'this' : 'this';
    return `Show me a picture of ${about.length > 90 ? about.slice(0, 87) + '…' : about}`;
  }
  /* ---------- under each answer: follow-ups that fit it, tools set up for it, what Procademy checked ----------
     Shared by the panel and the tutor's own page. */
  const tsvg = (d, size) => `<svg viewBox="0 0 24 24" width="${size || 16}" height="${size || 16}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICON_UP = tsvg('<path d="M7 11v9H4.5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1zM7 11l4-7.5a2 2 0 0 1 2.6 1.7L13 10h5.6a2 2 0 0 1 2 2.3l-1.2 6.4a2 2 0 0 1-2 1.3H7"/>');
  const ICON_DOWN = tsvg('<path d="M17 13V4h2.5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1zM17 13l-4 7.5a2 2 0 0 1-2.6-1.7L11 14H5.4a2 2 0 0 1-2-2.3l1.2-6.4a2 2 0 0 1 2-1.3H17"/>');
  const ICON_COPY = tsvg('<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.2"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>');
  const ICON_CHECK = tsvg('<path d="m5 12.5 4.2 4.2L19 7"/>', 15), ICON_CROSS = tsvg('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>', 15);
  const ICON_TOOL = { graph: tsvg('<path d="M4 4v16h16"/><path d="M7 16c2.5-.5 3.5-8 6.5-8S16 13 20 12"/>', 15), steps: tsvg('<path d="M5 6h14M5 12h10M5 18h6"/>', 15),
    calc: tsvg('<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8.5 7h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>', 15), fraction: tsvg('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5V12l6.4 5.6"/>', 15) };

  /** glossary words (lib/words.js) in a text: the longest names first; harder words first when asked */
  let gloss = null;
  function glossaryIn(text, max, hardFirst) {
    const W = window.WORDS; if (!W || !text) return [];
    if (!gloss) {
      const names = [];
      W.LIST.filter(w => w.link).forEach(w => [w.term].concat(w.also).forEach(n => names.push([n, w])));
      names.sort((a, b) => b[0].length - a[0].length);
      gloss = { re: new RegExp(`(^|[^A-Za-z0-9-])(${names.map(([n]) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![A-Za-z0-9-])`, 'gi'), by: new Map(names.map(([n, w]) => [n.toLowerCase(), w])) };
    }
    const found = [], seen = new Set();
    String(text).replace(/```[\s\S]*?(```|$)/g, ' ').replace(gloss.re, (m, pre, name) => { const w = gloss.by.get(name.toLowerCase()); if (w && !seen.has(w.id)) { seen.add(w.id); found.push(w); } return m; });
    const g = learnerGrade();
    if (hardFirst) found.sort((a, b) => (b.grade >= g - 2) - (a.grade >= g - 2) || b.grade - a.grade);
    return found.slice(0, max || 3);
  }
  /** underline a few glossary words in an answer (tap one for its meaning): the ones near the learner's grade first */
  function glossaryLinks(el, max) {
    if (!el || !window.VOCAB || !VOCAB.linkify) return;
    try { VOCAB.linkify(el); } catch (e) { return; }
    const terms = [...el.querySelectorAll('.term[data-word]')];
    if (!terms.length) return;
    const g = learnerGrade(), W = window.WORDS;
    const rank = b => { const w = W && W.byId[b.dataset.word]; return w ? (w.grade >= g - 2 ? 100 : 0) + w.grade : 0; };
    const keep = new Set(terms.slice().sort((a, b) => rank(b) - rank(a)).slice(0, max || 4));
    terms.forEach(b => { if (!keep.has(b)) b.replaceWith(document.createTextNode(b.textContent)); else b.title = 'What this word means'; });
  }
  /** the learner's grade, for pitching words and examples (null when it isn't known) */
  function learnerGrade() {
    const p = S.get().profile, A = window.ACADEMY;
    if (p.grade != null && p.grade !== '') return Number(p.grade);
    const c = p.cpm, book = c && A && A.cpmById && A.cpmById(c.book);
    if (book && book.grade != null) return book.grade;
    const co = A && (p.enrolled || []).map(id => A.courseById(id)).filter(Boolean)[0];
    return co && co.grade != null ? co.grade : 7;
  }

  /** follow-ups that fit this answer: a hint for its "Try this", why its hardest step works, a word it used,
      the same idea with new numbers (or, away from math, an example and a quick quiz) */
  function followUps(m, question) {
    const c = String((m && m.content) || ''), q = String(question || ''), out = [];
    const add = (label, ask) => { if (out.length < 3 && !out.some(x => x.ask === ask)) out.push({ label, ask }); };
    if (/^\s*(\*\*)?try this/im.test(c)) add('Hint for “Try this”', 'Give me a hint for the question you asked me to try, without telling me the answer.');
    const steps = c.split('\n').map(l => /^\s*(\d+)[.)]\s+(.*)$/.exec(l)).filter(Boolean);
    if (steps.length >= 3) { const hard = steps.slice(1).sort((a, b) => b[2].length - a[2].length)[0]; add(`Why step ${hard[1]}?`, `Why does step ${hard[1]} work? Explain just that step.`); }
    const w = glossaryIn(c + '\n' + q, 1, true)[0];
    if (w) add(`What does “${w.term}” mean?`, `What does “${w.term}” mean? Explain it simply, with an example.`);
    const mathy = /\d\s*[-+×x*÷/^=]\s*\d|\b[a-z]\s*=\s*-?\d|\b(solve|equation|graph|fraction|percent|slope|area|angle)\b/i.test(q + '\n' + c);
    if (mathy) add('Same idea, new numbers', 'Show me the same kind of problem with different numbers, worked out step by step.');
    else { add('A real-life example', 'Give me a real-life example of this.'); add('Quiz me on this', 'Ask me three quick questions about this, one at a time, and wait for my answer each time.'); }
    return out;
  }

  /** a tool set up for the question: the graphing calculator, the step checker, the fraction lab or the calculator */
  function toolsFor(question, m) {
    const D = window.DRAW, out = [], q = String(question || '').replace(/[−–]/g, '-');
    const body = String((m && m.content) || '').replace(/```[\s\S]*?(```|$)/g, ' ');
    if (D && D.relationsIn && D.encode && !(m && m.viz && /^```graph/.test(m.viz))) {
      let rels = [];
      try { rels = D.relationsIn((q + '\n' + body).replace(/\|/g, ' ')).filter(r => /\by\b|[a-z]\(x\)/.test(r) && !/^\s*-?\d+(\.\d+)?\s*=/.test(r)); } catch (e) { rels = []; }
      rels = rels.filter((r, i) => rels.indexOf(r) === i).slice(0, 3);
      if (rels.length) out.push({ label: 'Graph this', href: '#/graph/' + D.encode(rels.join('\n')), icon: 'graph', title: 'Open the graphing calculator with this already in it' });
    }
    const eq = window.STEPS && STEPS.fromQuestion && (() => { try { return STEPS.fromQuestion({ prompt: /solve|value of/i.test(q) ? q : 'Solve: ' + q }); } catch (e) { return null; } })();
    if (eq && D && D.encode && /[a-z]/i.test(eq) && !/\by\b/.test(eq)) out.push({ label: 'Check my steps', href: '#/steps/' + D.encode(eq), icon: 'steps', title: 'Solve it in the step checker, which checks every line' });
    const fr = /(\d+(?:\s+\d+)?\s*\/\s*\d+)\s*([-+×x*÷:])\s*(\d+(?:\s+\d+)?\s*\/\s*\d+)/.exec(q);
    if (fr) {
      const op = { '+': 'add', '-': 'sub', '×': 'mul', x: 'mul', '*': 'mul', '÷': 'div', ':': 'div' }[fr[2]];
      const code = f => f.replace(/\s*\/\s*/, '/').trim().replace(/\s+/g, '-').replace('/', '-');
      out.push({ label: 'Fraction lab', href: `#/fractions/${op}/${code(fr[1])}_${code(fr[3])}`, icon: 'fraction', title: 'See it drawn, step by step, in the fraction lab' });
    } else {
      const ar = /(?:^|[^\w.])((?:\d+(?:\.\d+)?|\()[\d.\s()]*(?:\s*[-+×*÷^]\s*[\d.()\s]+)+)(?![\w])/.exec(q.replace(/(\d)\s*[xX]\s*(\d)/g, '$1×$2'));
      if (ar && /\d\s*[-+×*÷^]\s*[\d(]/.test(ar[1]) && !/=/.test(q.slice(ar.index, ar.index + ar[0].length + 2))) out.push({ label: 'Calculator', href: '#/calc/' + encodeURIComponent(ar[1].trim()), icon: 'calc', title: 'Work it out on the calculator, which shows the order of operations' });
    }
    return out.slice(0, 2);
  }
  const toolsHtml = (question, m) => toolsFor(question, m).map(t => `<a class="chip-btn ai-tool" href="${M.esc(t.href)}" title="${esc(t.title)}">${ICON_TOOL[t.icon] || ''}${esc(t.label)}</a>`).join('');

  /* ---------- what Procademy checked in an answer ----------
     Every "this = that" with numbers only (3/4 + 1/6 = 11/12, 2(3) + 1 = 7) is worked out again with Procademy's
     own calculator (DRAW.compile, which never evals). An answer built on a practice question's checked steps
     says so too. A slip is flagged, with Procademy's result. */
  function numValue(expr) {
    const D = window.DRAW; if (!D || !D.compile) return null;
    let e = String(expr).replace(/[−–]/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/√\s*(\d+(?:\.\d+)?)/g, 'sqrt($1)').replace(/√\s*\(/g, 'sqrt(')
      .replace(/(\d+)\s+(\d+)\s*\/\s*(\d+)/g, '($1+$2/$3)');
    if (!/\d/.test(e) || /[a-z]/i.test(e.replace(/sqrt/g, ''))) return null;
    try { const v = D.compile(e)(0); return typeof v === 'number' && isFinite(v) ? v : null; } catch (x) { return null; }
  }
  const OPS_RE = /[-+*/×÷^√]|\d\s*\(|\)\s*\d|\)\s*\(/;
  /** the numeric equalities in an answer: [{ text, ok, right }] (right: Procademy's result for the left side) */
  function checkCalcs(content) {
    const s = String(content || '').replace(/```[\s\S]*?(```|$)/g, ' ').replace(/\*\*|__|`/g, ' ').replace(/[−–]/g, '-').replace(/\\times|·/g, '×').replace(/\\div/g, '÷')
      .replace(/(\d),(\d{3})(?!\d)/g, '$1$2').replace(/(\d)\s*[xX]\s*(?=\d)/g, '$1×').replace(/\^\{([^}]*)\}/g, '^($1)');
    const out = [];
    (s.match(/[\d.()+\-×*÷/^√= ]+/g) || []).forEach(run => {
      if (out.length >= 12 || !/=/.test(run)) return;
      const segs = run.split('=').map(x => x.trim());
      for (let k = 0; k + 1 < segs.length && out.length < 12; k++) {
        let a = segs[k], b = segs[k + 1];
        a = trimBal(a.replace(/^(\.\s+|\s+)/, '').replace(/^[-+*/×÷^ ]+(?=\d|\()/, m => (/^-/.test(m.trim()) ? '-' : '')).replace(/[.\s]+$/, ''));
        b = trimBal(b.replace(/[.\s]+$/, '').replace(/[-+*/×÷^]+$/, ''));
        if (!a || !b || !/\d/.test(a) || !/\d/.test(b) || !(OPS_RE.test(a.replace(/^-/, '')) || OPS_RE.test(b.replace(/^-/, '')))) continue;
        const va = numValue(a), vb = numValue(b);
        if (va == null || vb == null) continue;
        const dec = Math.max(...[a, b].map(x => (/^-?\d+\.(\d+)$/.exec(x) || [0, ''])[1].length));
        const tol = dec ? 0.5 * Math.pow(10, -dec) + 1e-9 : 1e-9 * Math.max(1, Math.abs(va));
        out.push({ text: `${a} = ${b}`, ok: Math.abs(va - vb) <= tol, right: niceNum(va, /\//.test(a + b) && !dec) });
      }
    });
    return out;
  }
  /** drop unbalanced brackets at either end of a piece of a line */
  function trimBal(x) {
    x = x.trim();
    const bal = t => (t.match(/\(/g) || []).length - (t.match(/\)/g) || []).length;
    while (x && bal(x) > 0 && x[0] === '(') x = x.slice(1).trim();
    while (x && bal(x) < 0 && x[x.length - 1] === ')') x = x.slice(0, -1).trim();
    return bal(x) === 0 ? x : '';
  }
  /** a number as a fraction when it is a simple one and fractions were in play, else a tidy decimal */
  function niceNum(v, asFrac) {
    if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
    if (asFrac) for (let d = 2; d <= 1000; d++) { const n = Math.round(v * d); if (Math.abs(n / d - v) < 1e-9) return `${n}/${d}`; }
    return String(Math.round(v * 1e6) / 1e6);
  }
  /** after an answer: what Procademy checked (kept on the message, so a saved chat shows it again) */
  function verify(m, ctx) {
    if (!m || !m.content || m.failed) return m;
    const lines = checkCalcs(m.content), grounded = ctx && ctx.question && ctx.steps && ctx.steps.length ? (ctx.answerShown ? 'answer' : 'step') : null;
    if (lines.length || grounded) m.checks = { lines, grounded }; else delete m.checks;
    return m;
  }
  function checksHtml(m) {
    const k = m && m.checks; if (!k) return '';
    const bad = k.lines.filter(x => !x.ok).length, n = k.lines.length;
    const say = n ? (bad ? `Procademy checked ${n === 1 ? 'the calculation' : `${n} calculations`} in this answer: ${bad === 1 ? (n === 1 ? 'it doesn’t match' : 'one doesn’t match') : `${bad} don’t match`}`
      : `Procademy checked ${n === 1 ? 'the calculation' : `${n} calculations`} in this answer: ${n === 1 ? 'it’s right' : 'all right'}`) : '';
    const ground = k.grounded === 'answer' ? 'Built on Procademy’s checked answer and steps' : k.grounded === 'step' ? 'Built on Procademy’s checked first step' : '';
    const mh = T.mathHtml || esc;
    return `<details class="ai-verify${bad ? ' bad' : ''}"${bad ? ' open' : ''}><summary>${bad ? ICON_CROSS : ICON_CHECK}<span>${esc([say, ground].filter(Boolean).join('. '))}</span></summary>
      ${n ? `<ul>${k.lines.map(x => `<li class="${x.ok ? 'ok' : 'no'}">${x.ok ? ICON_CHECK : ICON_CROSS}<span>${mh(x.text)}${x.ok ? '' : ` <span class="muted">(Procademy gets ${mh(x.right)})</span>`}</span></li>`).join('')}</ul>` : ''}
      <p class="tiny muted">Procademy redoes each calculation with its own calculator. It doesn’t check words or ideas, so think those through too.</p></details>`;
  }

  /* ---------- rating an answer: tunes how the tutor explains, on this device ---------- */
  const WHY = {
    long: ['Too long', 'keep answers short, under about 100 words, with only the key steps'],
    hard: ['Too hard', 'use simpler words and smaller steps'],
    easy: ['Too easy', 'go a little deeper, with a harder example'],
    off: ['Not what I asked', 'answer exactly what was asked first'],
    wrong: ['Something’s wrong', 'check every calculation carefully before answering'],
  };
  function rate(m, v, why) {
    if (!m) return;
    const list = (pref().ratings || []).slice();
    if (why && m.rating === 'down' && list.length && list[list.length - 1].v === 'down' && !list[list.length - 1].why) list[list.length - 1] = Object.assign({}, list[list.length - 1], { why });
    else if (m.rating !== v || why) list.push({ t: Date.now(), v, why: why || '' });
    m.rating = v; if (why) m.why = why; else delete m.why;
    setPref({ ratings: list.slice(-12) });
  }
  /** what the last few ratings ask for (the newer of "too hard" and "too easy" wins; a chosen length beats "too long") */
  function tuningKeys() {
    const p = pref(); if (p.memory === false) return [];
    const r = (p.ratings || []).filter(x => (x.t || 0) > (p.memoryFrom || 0)).slice(-6), keys = [];
    r.forEach(x => { if (WHY[x.why]) { if (x.why === 'hard' || x.why === 'easy') { const o = keys.indexOf(x.why === 'hard' ? 'easy' : 'hard'); if (o >= 0) keys.splice(o, 1); } if (!keys.includes(x.why)) keys.push(x.why); } });
    return keys.filter(k => !(k === 'long' && p.length && p.length !== 'medium'));
  }
  const tuningText = () => { const k = tuningKeys(); return k.length ? k.map(x => WHY[x][1]).join('; ') + '.' : ''; };
  function rateHtml(m, i) {
    const up = m.rating === 'up', down = m.rating === 'down';
    return `<span class="ai-rate" role="group" aria-label="Was this answer helpful?"><button type="button" class="iconbtn sm rate-btn${up ? ' on' : ''}" data-rate="up" data-i="${i}" aria-pressed="${up}" aria-label="Helpful" title="Helpful">${ICON_UP}</button><button type="button" class="iconbtn sm rate-btn${down ? ' on' : ''}" data-rate="down" data-i="${i}" aria-pressed="${down}" aria-label="Not helpful" title="Not helpful">${ICON_DOWN}</button></span>`;
  }
  const whyHtml = (m, i) => (m.rating === 'down' && !m.why ? `<div class="ai-why" role="group" aria-label="What wasn’t helpful?"><span class="tiny muted">What wasn’t helpful?</span>${Object.keys(WHY).map(k => `<button type="button" class="chip-btn" data-why="${k}" data-i="${i}">${WHY[k][0]}</button>`).join('')}</div>`
    : m.rating && m.rated ? `<p class="tiny muted ai-thanks" role="status">${m.rating === 'up' ? 'Thanks. The tutor will keep explaining this way.' : 'Thanks. The tutor will adjust its answers on this device.'}</p>` : '');
  /** wire rating buttons inside el; msgs is the list the index refers to; after() saves and redraws */
  function wireRating(el, msgs, after) {
    el.querySelectorAll('[data-rate]').forEach(b => b.addEventListener('click', () => {
      const m = msgs[Number(b.dataset.i)]; if (!m) return;
      const v = b.dataset.rate;
      if (m.rating === v && !(v === 'down' && !m.why)) { m.rating = null; delete m.why; delete m.rated; after(m); return; }
      rate(m, v); m.rated = v === 'up'; after(m);
    }));
    el.querySelectorAll('[data-why]').forEach(b => b.addEventListener('click', () => {
      const m = msgs[Number(b.dataset.i)]; if (!m) return;
      rate(m, 'down', b.dataset.why); m.rated = true; after(m);
    }));
  }

  /* ---------- copying an answer: as text, or as a picture to paste anywhere ---------- */
  /** an answer as plain text: no markdown marks, and each drawing named in words */
  function plainAnswer(m) {
    const P = window.PICTURES, D = window.DRAW;
    const draw = b => { const d = (P && P.describe && P.describe(b)) || (D && D.describe ? D.describe(b) : ''); return d ? `[A drawing: ${d.split('. ')[0]}]` : '[A drawing]'; };
    let s = (m.viz ? draw(m.viz) + '\n\n' : '') + String(m.content || '');
    s = s.replace(/```[\w-]*\n[\s\S]*?(```|$)/g, b => draw(b.replace(/```$/, '') + (/```$/.test(b) ? '```' : '\n```')));
    return s.replace(/^\s*#{1,6}\s+/gm, '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1$2').replace(/`([^`]+)`/g, '$1').replace(/\n{3,}/g, '\n\n').trim();
  }
  function copyText(m) {
    const t = plainAnswer(m);
    try { return navigator.clipboard.writeText(t).then(() => true, () => false); } catch (e) { return Promise.resolve(false); }
  }
  /** a picture of an answer (PNG), drawn on a canvas: the question, the answer with its drawings, in light colors */
  const LIGHT = '--surface:#ffffff;--surface-2:#f1f3f6;--ink:#21242c;--muted:#5f6672;--line:#dfe3e8;--line-strong:#c7cdd5;--primary:#1865f2;--primary-ink:#1458d6;--primary-soft:#e8f0fe;--tint:#e8f0fe;--tint-2:#d6e4fd;--vz1:#2d6fe0;--vz2:#d2403a;--vz3:#23894a;--vz4:#7448d0;--vz5:#dd7410;--vz6:#2a2e38;--ok-ink:#0b7a43;--bad:#d93025;--on-primary:#ffffff';
  async function answerPicture(m, question) {
    const box = document.createElement('div');
    box.className = 'tmsg assistant tutor-shot';
    box.setAttribute('aria-hidden', 'true');
    box.style.cssText = LIGHT + ';position:fixed;left:-12000px;top:0;width:640px;max-width:none;background:#fff;color:#21242c;';
    box.innerHTML = T.render(m.content, Object.assign({}, m, { pic: null }));
    document.body.appendChild(box);
    try { return await paintAnswer(box, question); } finally { box.remove(); }
  }
  function svgToImage(svg) {
    return new Promise(res => {
      try {
        const clone = svg.cloneNode(true), src = [svg].concat([...svg.querySelectorAll('*')]), dst = [clone].concat([...clone.querySelectorAll('*')]);
        src.forEach((el, k) => {
          const cs = getComputedStyle(el), d = dst[k];
          if (cs.display === 'none') { d.remove(); return; }
          ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'fill-opacity', 'stroke-opacity', 'font-size', 'font-weight', 'paint-order'].forEach(p => d.style.setProperty(p, cs.getPropertyValue(p)));
          d.style.setProperty('font-family', 'Arial, Helvetica, sans-serif');
        });
        const vb = (svg.getAttribute('viewBox') || '0 0 400 300').split(/\s+/).map(Number);
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); clone.setAttribute('width', vb[2]); clone.setAttribute('height', vb[3]);
        const img = new Image();
        img.onload = () => res({ img, w: vb[2], h: vb[3] });
        img.onerror = () => res(null);
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
      } catch (e) { res(null); }
    });
  }
  /** the text of an element as runs of plain and bold text, with math written out (3/4, x², √2) */
  const SUPD = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻' };
  function runsOf(el, bold, out) {
    out = out || [];
    el.childNodes.forEach(n => {
      if (n.nodeType === 3) { if (n.nodeValue) out.push({ t: n.nodeValue, b: bold }); return; }
      if (n.nodeType !== 1 || n.matches('button:not(.term), .visually-hidden, .pace, .ai-actions')) return;
      if (n.matches('.frac')) { const a = n.querySelector('.num'), b = n.querySelector('.den'); out.push({ t: `${a ? a.textContent : ''}/${b ? b.textContent : ''}`, b: bold }); return; }
      if (n.tagName === 'SUP') { const t = n.textContent; out.push({ t: /^-?\d+$/.test(t) ? [...t].map(c => SUPD[c]).join('') : `^(${t})`, b: bold }); return; }
      if (n.tagName === 'BR') { out.push({ t: '\n', b: bold }); return; }
      runsOf(n, bold || n.tagName === 'B' || n.tagName === 'STRONG', out);
    });
    return out;
  }
  async function paintAnswer(box, question) {
    const PAD = 36, WID = 720, TW = WID - PAD * 2, K = 2;
    const C = { ink: '#21242c', muted: '#5f6672', primary: '#1458d6', tint: '#e8f0fe', line: '#dfe3e8' };
    const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
    const items = [];       // { kind: 'text', runs, size, indent, prefix, bg } | { kind: 'img', img, w, h } | { kind: 'gap', h }
    const walk = parent => [...parent.children].forEach(el => {
      if (el.matches('.pace, .ai-actions, .tmsg-via, .ai-verify, button')) return;
      const svg = el.matches('figure, .viz') ? el.querySelector('svg') : null;
      if (el.matches('figure, .viz')) { if (svg) items.push({ kind: 'svg', svg }); else if (el.querySelector('img')) items.push({ kind: 'text', runs: [{ t: '[A picture: ' + (el.querySelector('img').alt || '') + ']', b: false }], size: 15 }); return; }
      if (el.tagName === 'H4') items.push({ kind: 'text', runs: runsOf(el, true), size: 18, gapAbove: 8 });
      else if (el.tagName === 'P') items.push({ kind: 'text', runs: runsOf(el, false), size: 16, bg: el.classList.contains('md-try') ? C.tint : null });
      else if (el.tagName === 'OL' || el.tagName === 'UL') [...el.children].forEach((li, k) => items.push({ kind: 'text', runs: runsOf(li, false), size: 16, indent: 26, prefix: el.tagName === 'OL' ? `${(Number(el.getAttribute('start')) || 1) + k}.` : '•' }));
      else if (el.matches('.md-table')) el.querySelectorAll('tr').forEach(tr => items.push({ kind: 'text', runs: [{ t: [...tr.children].map(td => td.textContent.trim()).join('   |   '), b: tr.parentElement.tagName === 'THEAD' }], size: 15 }));
      else if (el.tagName === 'PRE') items.push({ kind: 'text', runs: [{ t: el.textContent, b: false }], size: 14 });
      else if (el.children.length) walk(el);
      else if (el.textContent.trim()) items.push({ kind: 'text', runs: runsOf(el, false), size: 16 });
    });
    walk(box);
    for (const it of items) if (it.kind === 'svg') { const r = await svgToImage(it.svg); if (r) Object.assign(it, { kind: 'img' }, r); else Object.assign(it, { kind: 'text', runs: [{ t: '[A drawing]', b: false }], size: 15 }); }
    const meas = document.createElement('canvas').getContext('2d');
    const font = (size, b) => `${b ? 700 : 400} ${size}px ${FONT}`;
    /** wrap runs into lines of words: [{ words: [{ t, b, x }] }] */
    const layout = (runs, size, width) => {
      const lines = [[]]; let x = 0;
      runs.forEach(r => String(r.t).split(/(\s+)/).forEach(tok => {
        if (!tok) return;
        if (/\n/.test(tok)) { lines.push([]); x = 0; return; }
        if (/^\s+$/.test(tok)) { if (x > 0) x += (meas.font = font(size, r.b), meas.measureText(' ').width); return; }
        meas.font = font(size, r.b); const w = meas.measureText(tok).width;
        if (x > 0 && x + w > width) { lines.push([]); x = 0; }
        lines[lines.length - 1].push({ t: tok, b: r.b, x }); x += w;
      }));
      return lines.filter((l, k) => l.length || k === 0);
    };
    const q = String(question || '').replace(/\s+/g, ' ').trim();
    const qLines = q ? layout([{ t: q.length > 240 ? q.slice(0, 237) + '…' : q, b: true }], 17, TW) : [];
    let H = PAD + 22 + (qLines.length ? qLines.length * 24 + 14 : 0) + 16;
    items.forEach(it => {
      if (it.kind === 'img') { it.dw = Math.min(TW, it.w); it.dh = it.h * it.dw / it.w; if (it.dh > 460) { it.dw *= 460 / it.dh; it.dh = 460; } H += it.dh + 14; return; }
      it.lines = layout(it.runs, it.size, TW - (it.indent || 0) - (it.bg ? 24 : 0)); it.lh = Math.round(it.size * 1.5);
      H += (it.gapAbove || 0) + it.lines.length * it.lh + (it.bg ? 16 : 0) + 10;
    });
    H += 34 + PAD;
    const cv = document.createElement('canvas'); cv.width = WID * K; cv.height = Math.round(H * K);
    const g = cv.getContext('2d'); g.scale(K, K);
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, WID, H);
    g.textBaseline = 'alphabetic';
    let y = PAD;
    g.fillStyle = C.primary; g.font = font(13, true); g.fillText('PROCADEMY TUTOR', PAD, y + 12); y += 22;
    if (qLines.length) { g.fillStyle = C.ink; qLines.forEach(l => { y += 24; l.forEach(wd => { g.font = font(17, true); g.fillText(wd.t, PAD + wd.x, y - 6); }); }); y += 14; }
    g.fillStyle = C.line; g.fillRect(PAD, y, TW, 1.5); y += 16;
    items.forEach(it => {
      if (it.kind === 'img') { g.drawImage(it.img, PAD + (TW - it.dw) / 2, y, it.dw, it.dh); y += it.dh + 14; return; }
      y += it.gapAbove || 0;
      const h = it.lines.length * it.lh + (it.bg ? 16 : 0);
      if (it.bg) { g.fillStyle = it.bg; g.beginPath(); if (g.roundRect) g.roundRect(PAD, y, TW, h, 10); else g.rect(PAD, y, TW, h); g.fill(); }
      const x0 = PAD + (it.indent || 0) + (it.bg ? 12 : 0);
      let ly = y + (it.bg ? 8 : 0);
      it.lines.forEach((l, k) => {
        ly += it.lh;
        if (k === 0 && it.prefix) { g.fillStyle = C.primary; g.font = font(it.size, true); g.fillText(it.prefix, PAD + 2, ly - it.lh * 0.28); }
        g.fillStyle = C.ink;
        l.forEach(wd => { g.font = font(it.size, wd.b); g.fillText(wd.t, x0 + wd.x, ly - it.lh * 0.28); });
      });
      y += h + 10;
    });
    g.fillStyle = C.line; g.fillRect(PAD, y + 4, TW, 1); g.fillStyle = C.muted; g.font = font(12, false);
    g.fillText('From the Procademy tutor · ' + new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }), PAD, y + 24);
    return new Promise((res, rej) => { try { cv.toBlob(b => (b ? res(b) : rej(new Error('no picture'))), 'image/png'); } catch (e) { rej(e); } });
  }
  function download(blob, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  /** copy an answer as a picture (or, where the browser can't, save it as one) */
  async function copyPicture(m, question) {
    const made = answerPicture(m, question);
    try {
      if (typeof ClipboardItem === 'undefined' || !navigator.clipboard || !navigator.clipboard.write) throw new Error('no clipboard');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': made })]);
      toast('Copied as a picture. Paste it anywhere.');
      return 'copied';
    } catch (e) {
      try { download(await made, 'procademy-answer.png'); toast('Saved as a picture'); return 'saved'; } catch (x) { toast('The picture couldn’t be made'); return 'failed'; }
    }
  }
  const toast = t => { if (window.VIEWS) VIEWS.toast(t); };

  /* ---------- when the tutor can't answer: offline, or a service failed. Help at once, never a wait ---------- */
  function skillIdOf(title) {
    const A = window.ACADEMY; if (!A || !title) return null;
    return Object.keys(A.skills).find(id => A.whereIs(id) && A.stripTags(A.skills[id].title).replace(/\s+/g, ' ').trim() === title) || null;
  }
  function offlineHelp(ctx, question, offline) {
    const parts = [];
    if (ctx && ctx.question && ctx.steps && ctx.steps.length) parts.push(`<div class="tutor-wait-step"><div class="tiny muted">${ctx.answerShown ? 'Procademy’s checked steps' : 'Procademy’s checked first step'}</div>${ctx.steps.length > 1 ? `<ol>${ctx.steps.map(s => `<li>${T.mathHtml ? T.mathHtml(s) : esc(s)}</li>`).join('')}</ol>` : (T.mathHtml ? T.mathHtml(ctx.steps[0]) : esc(ctx.steps[0]))}</div>`);
    const words = glossaryIn([question, ctx && ctx.question, ctx && ctx.skill].filter(Boolean).join('\n'), 3, true);
    if (words.length) parts.push(`<dl class="help-words">${words.map(w => `<div><dt><a href="#/words/${w.id}">${esc(w.term)}</a></dt><dd>${esc(w.def)}</dd></div>`).join('')}</dl>`);
    const sid = ctx && skillIdOf(ctx.skill);
    const links = [sid && `<a class="chip-btn" href="#/skill/${encodeURIComponent(sid)}">Read the lesson again</a>`, '<a class="chip-btn" href="#/words">Math words and formulas</a>', sid ? `<a class="chip-btn" href="#/practice/${encodeURIComponent(sid)}">Practice it</a>` : '<a class="chip-btn" href="#/review">Review</a>'].filter(Boolean);
    return `<div class="tutor-help"><p class="tiny muted">${offline ? 'Practice, lessons and math words all work offline.' : 'Meanwhile, Procademy can help:'}</p>${parts.join('')}<div class="tutor-help-links">${links.join('')}</div></div>`;
  }
  /** a reply that couldn't be given: what happened, Procademy's own help, and Try again */
  function failedHtml(m, ctx, i) {
    const f = m.failed || {};
    const msg = f.offline ? 'You’re offline. The free tutor needs the internet' + (T.local && T.local.state !== 'unsupported' ? ', unless Unlimited mode is ready on this device (tutor settings).' : '.') : (m.content || 'The tutor couldn’t answer just now.');
    return `<div class="tutor-failed"><p><b>${f.offline ? 'The tutor needs the internet' : 'The tutor couldn’t answer this time'}</b></p><p class="small">${esc(msg)}${!f.offline && f.wait ? ` The other free service is ready in about ${f.wait} seconds.` : ''}</p>
      ${offlineHelp(ctx, f.q, f.offline)}<div class="btn-row" style="margin:8px 0 0"><button type="button" class="btn sm primary" data-retry="${i}">Try again</button></div></div>`;
  }

  /* ---------- Undo: a short note with an Undo button (Ctrl+Z or ⌘Z works too, while it shows) ---------- */
  function undoToast(msg, onUndo) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const el = document.createElement('div');
    el.className = 'toast undo-toast'; el.setAttribute('role', 'status');
    el.innerHTML = `<span>${esc(msg)}</span><button type="button" class="undo-btn">Undo</button>`;
    document.body.appendChild(el);
    let done = false;
    const end = () => { clearTimeout(timer); document.removeEventListener('keydown', onKey, true); el.remove(); };
    const undo = () => { if (done) return; done = true; end(); onUndo(); };
    const onKey = ev => { if ((ev.ctrlKey || ev.metaKey) && !ev.shiftKey && (ev.key === 'z' || ev.key === 'Z') && !(ev.target && ev.target.closest && ev.target.closest('input, textarea'))) { ev.preventDefault(); undo(); } };
    const timer = setTimeout(end, 8000);
    document.addEventListener('keydown', onKey, true);
    el.querySelector('.undo-btn').addEventListener('click', undo);
    return el;
  }

  /* ---------- the thinking line and the writing caret ----------
     The dots breathe, a thin bar fills toward the usual answer time, and the words change gently as time goes on;
     once words arrive a soft caret shows the answer is still being written. Redraws carry on where they were. */
  let thinkTimer = 0;
  function thinkTick() {
    const els = document.querySelectorAll('.thinking[data-t0]');
    if (!els.length) { clearInterval(thinkTimer); thinkTimer = 0; return; }
    els.forEach(el => {
      const e = (Date.now() - Number(el.dataset.t0)) / 1000, typ = Number(el.dataset.typ) || 0, lab = el.querySelector('.thinking-label');
      const t = e < 4 ? (typ >= 2 ? `Thinking… Answers usually take about ${typ} seconds.` : 'Thinking…') : e < Math.max(9, typ + 2) ? 'Working it out…' : e < 25 ? 'Almost there…' : 'Still writing. A long answer takes a little longer.';
      if (lab && lab.textContent !== t) lab.textContent = t;
    });
  }
  function caret(el) {
    if (!el) return;
    const blocks = [...el.querySelectorAll('p, li, h4')].filter(b => !b.closest('.viz, figure, .md-table'));
    const at = blocks[blocks.length - 1] || el;
    at.insertAdjacentHTML('beforeend', '<span class="ai-caret" aria-hidden="true"></span>');
  }

  /* ---------- how long answers take, for the thinking line; reading answers aloud ---------- */
  const MS_KEY = 'procademy.tutor.ms';
  function typical() { try { const v = Number(localStorage.getItem(MS_KEY)); return v > 0 ? v : 0; } catch (e) { return 0; } }
  function noteTime(ms) { if (!(ms > 0)) return; try { const v = typical(); localStorage.setItem(MS_KEY, String(Math.round(v ? v * 0.7 + ms * 0.3 : ms))); } catch (e) { /* fine */ } }
  /** the thinking line; t0 is when the question was sent, so a redraw carries on where it was */
  function thinkingHtml(t0) {
    const s = Math.round(typical() / 1000), start = t0 || Date.now(), e = Math.max(0, (Date.now() - start) / 1000);
    if (!thinkTimer) thinkTimer = setInterval(thinkTick, 1000);
    return `<span class="thinking" role="status" data-t0="${start}" data-typ="${s}"><span class="thinking-row"><span class="thinking-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="muted thinking-label">Thinking…${s >= 2 ? ` Answers usually take about ${s} seconds.` : ''}</span></span>` +
      `<span class="thinking-bar" aria-hidden="true"><i style="animation-duration:${Math.max(4, s || 8)}s;animation-delay:-${e.toFixed(1)}s"></i></span></span>`;
  }
  const voiceOn = () => !!pref().voice && !!(window.COACH && COACH.canSpeak());
  function speak(reply) { if (voiceOn() && reply && reply.content) COACH.say(T.render(reply.content)); }

  /* ---------- asking by voice: the browser's own speech recognition, where it has one ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const MIC = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>';
  const SPEECH = { en: 'en-US', es: 'es-US', hi: 'hi-IN' };
  /** a microphone button for a box to type in (empty where the browser can't listen) */
  function micHtml(id, cls) {
    return SR ? `<button type="button" class="iconbtn ${cls || ''} mic-btn" id="${id}" aria-pressed="false" aria-label="Speak your question" title="Speak your question. Your browser may send the recording to its maker to turn it into text.">${MIC}</button>` : '';
  }
  /** listen once and type what was said into box; a second press stops. lang: en, es or hi */
  function wireMic(btn, box, lang) {
    if (!btn || !SR || !box) return;
    let rec = null;
    btn.addEventListener('click', () => {
      if (rec) { rec.stop(); return; }
      const before = box.value.replace(/\s+$/, '');
      try { rec = new SR(); } catch (e) { rec = null; return; }
      rec.lang = SPEECH[typeof lang === 'function' ? lang() : lang] || 'en-US';
      rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
      rec.onresult = ev => {
        const said = [...ev.results].map(r => r[0].transcript).join(' ').trim();
        box.value = (before ? before + ' ' : '') + said;
        box.dispatchEvent(new Event('input', { bubbles: true }));
      };
      const stop = () => { rec = null; btn.classList.remove('on'); btn.setAttribute('aria-pressed', 'false'); btn.setAttribute('aria-label', 'Speak your question'); };
      rec.onend = stop;
      rec.onerror = ev => { stop(); if (ev && /not-allowed|service-not-allowed/.test(ev.error || '') && window.VIEWS) VIEWS.toast('Speaking needs the microphone. Allow it in the browser, or type instead.'); };
      btn.classList.add('on'); btn.setAttribute('aria-pressed', 'true'); btn.setAttribute('aria-label', 'Stop listening');
      try { rec.start(); } catch (e) { stop(); }
    });
  }

  /* ---------- warming up: so the first answer comes sooner ----------
     Opening a connection to the free services ahead of time (a preconnect sends no question, so it uses none of
     their limits), starting the tutor, and starting unlimited mode's helper in the background. */
  let warmedAt = 0;
  function warm(force) {
    if ((!force && Date.now() - warmedAt < 50000) || navigator.onLine === false) return;
    warmedAt = Date.now();
    if (chosenEngine() === 'cloud') {
      T.PROVIDERS.forEach(p => {
        const origin = new URL(p.url).origin;
        let l = document.querySelector(`link[rel="preconnect"][href="${origin}"]`);
        if (l) l.remove();                        // a fresh link opens a fresh connection (an idle one closes)
        l = document.createElement('link'); l.rel = 'preconnect'; l.href = origin; l.crossOrigin = 'anonymous';
        document.head.appendChild(l);
      });
    }
    ensureStarted();
    maybePrepare();
  }

  /* ---------- what the tutor remembers: worked out on this device, per learner ----------
     Nothing new is stored: the skills with the most questions missed lately and the tutor chats of the last two
     weeks (both kept on this device, per learner) are summed up and sent with a question, so explanations can
     build on them. "Forget" means only what comes after it counts. */
  function memoryItems() {
    const p = pref(); if (p.memory === false) return [];
    const A = window.ACADEMY, from = p.memoryFrom || 0, st = S.get(), by = {};
    if (!A) return [];
    (st.missed || []).filter(m => (m.t || 0) > from && A.skills[m.skill]).forEach(m => { by[m.skill] = (by[m.skill] || 0) + 1; });
    const plainT = id => A.stripTags(A.skills[id].title).replace(/\s+/g, ' ').trim();
    const hard = Object.keys(by).sort((a, b) => by[b] - by[a]).slice(0, 3).map(id => ({ kind: 'skill', id, text: `${plainT(id)} (${by[id]} missed question${by[id] > 1 ? 's' : ''})` }));
    let chats = [];
    try { chats = (JSON.parse(localStorage.getItem('procademy.chats.v1') || 'null') || {}).chats || []; } catch (e) { chats = []; }
    const topics = chats.filter(c => c && c.title && c.title !== 'New chat' && (c.updated || 0) > from && Date.now() - (c.updated || 0) < 14 * 864e5).slice(0, 3).map(c => ({ kind: 'chat', text: c.title }));
    return hard.concat(topics);
  }
  function memoryText() {
    const items = memoryItems(); if (!items.length) return '';
    const hard = items.filter(x => x.kind === 'skill').map(x => x.text), asked = items.filter(x => x.kind === 'chat').map(x => x.text);
    return [hard.length && 'missed in practice: ' + hard.join('; '), asked.length && 'asked the tutor about: ' + asked.join('; ')].filter(Boolean).join('. ').slice(0, 480);
  }
  /** the learner's class lesson (the CPM lesson saved on the CPM page), as words for the tutor; '' when there is none */
  function classLesson() {
    const A = window.ACADEMY, c = S.get().profile.cpm, f = c && A && A.cpmLesson && A.cpmLesson(c.book, c.lesson);
    if (!f) return '';
    const name = window.CPMVIEWS && CPMVIEWS.lessonName ? CPMVIEWS.lessonName(f.lesson) : 'lesson ' + f.lesson.id;
    return `${f.book.title}, ${name}${f.lesson.topic ? ': ' + String(f.lesson.topic).replace(/\s+/g, ' ').slice(0, 160) : ''}`;
  }
  function classLessonShort() {
    const A = window.ACADEMY, c = S.get().profile.cpm, f = c && A && A.cpmLesson && A.cpmLesson(c.book, c.lesson);
    return f ? `${f.book.short} ${window.CPMVIEWS && CPMVIEWS.lessonName ? CPMVIEWS.lessonName(f.lesson) : f.lesson.id}` : '';
  }
  /** the card that says, plainly, what the tutor knows and where it comes from, with a switch and Forget
      (the page's details and the panel's settings) */
  function memoryCard() {
    const items = memoryItems(), on = pref().memory !== false, lesson = classLessonShort(), tune = tuningKeys();
    const hard = items.filter(x => x.kind === 'skill'), asked = items.filter(x => x.kind === 'chat');
    const row = (k, v) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`;
    const rows = [lesson && row('Your class lesson', esc(lesson)), hard.length && row('Missed lately in practice', hard.map(x => esc(x.text)).join('<br>')),
      asked.length && row('Asked about lately', asked.map(x => esc(x.text)).join('<br>')), tune.length && row('From your ratings', esc(tune.map(k => WHY[k][0]).join(', ')))].filter(Boolean);
    return `<div class="tutor-card tutor-memory"><p style="margin:0 0 4px"><b>What the tutor knows about you</b></p>
      <p class="tiny muted" style="margin:0 0 6px">Worked out on this device each time you ask, from your practice, chats and ratings here. A short summary goes with your question. Your name never does.</p>
      <label class="tutor-check"><input type="checkbox" class="mem-on" ${on ? 'checked' : ''}><span>Use this to explain things in a way that suits you</span></label>
      ${on ? (rows.length ? `<dl class="mem-dl small">${rows.join('')}</dl>${items.length || tune.length ? '<button type="button" class="btn sm ghost mem-forget">Forget all of this</button><p class="tiny muted" style="margin:6px 0 0">Forgetting starts fresh: only what you do from now on counts. Your progress isn’t changed.</p>' : ''}`
        : '<p class="tiny muted" style="margin:6px 0 0">Nothing yet. Your class lesson, missed practice questions, recent chats and your ratings of answers show up here.</p>') : '<p class="tiny muted" style="margin:6px 0 0">Off: the tutor explains the same way for everyone.</p>'}</div>`;
  }
  function wireMemory(root, redraw) {
    const on = root.querySelector('.mem-on'), forget = root.querySelector('.mem-forget');
    if (on) on.addEventListener('change', () => { setPref({ memory: on.checked }); redraw(); });
    if (forget) forget.addEventListener('click', () => { setPref({ memoryFrom: Date.now() }); redraw(); if (window.VIEWS) VIEWS.toast('Forgotten. Only what comes next counts.'); });
  }

  /* ---------- the learner's level, in words a learner that age reads easily ---------- */
  const ORD = g => (g === 1 ? '1st' : g === 2 ? '2nd' : g === 3 ? '3rd' : g + 'th');
  /** a level from what the learner is doing: their grade, else their class book, else their first saved course */
  function myLevel() {
    const p = S.get().profile; if (p.adult) return 'An adult learner';
    if (p.grade != null && p.grade !== '') { const g = Number(p.grade); return g <= 0 ? 'Kindergarten' : g >= 9 ? 'High school' : `${ORD(g)} grade`; }
    const A = window.ACADEMY, c = p.cpm, book = c && A && A.cpmById(c.book);
    const g = book ? book.grade : ((p.enrolled || []).map(id => A && A.courseById(id)).filter(Boolean)[0] || {}).grade;
    if (g == null) return '';
    return g <= 0 ? 'Kindergarten' : g >= 9 ? 'High school' : `${ORD(g)} grade`;
  }
  /** how to word things for a level: very short and concrete for the youngest, plain for middle school */
  function wordsFor(level) {
    const l = String(level || '');
    if (/adult/i.test(l)) return 'Use plain, respectful language with everyday adult examples.';
    if (/kindergarten|\b(1st|2nd) grade|K–2/i.test(l)) return 'Use very short sentences and everyday words a young child knows, one idea at a time, with things to count or picture. Keep it under about 80 words.';
    if (/\b(3rd|4th|5th) grade|3–5|elementary/i.test(l)) return 'Use short sentences and simple, everyday words. Explain any math word the first time you use it.';
    if (/\b(6th|7th|8th) grade/i.test(l)) return 'Use clear, plain words, and say what each math word means when you use it.';
    return '';
  }
  /** "7th grade. Use clear, plain words…": the level line the tutor gets */
  const levelLine = level => (level ? level + (wordsFor(level) ? '. ' + wordsFor(level) : '') : '');

  /* ---------- how long answers are, and how big their text is ---------- */
  const LENGTHS = [['short', 'Short'], ['medium', 'Medium'], ['detailed', 'Detailed']];
  const LENGTH_LINE = { short: 'short: about 60 to 100 words, with only the key steps.', detailed: 'detailed: up to about 350 words, with every step and a worked example.' };
  const SIZES = [[0, 'Normal'], [1, 'Large'], [2, 'Larger']];
  const textSize = () => Math.max(0, Math.min(2, Number(pref().textSize) || 0));
  /** the answer length and text size controls (the panel's settings and the page's details) */
  function answerCard() {
    const len = pref().length || 'medium', fs = textSize();
    const seg = (name, list, cur, attr) => `<div class="seg" role="radiogroup" aria-label="${esc(name)}">${list.map(([v, l]) => `<button type="button" role="radio" class="seg-btn${v === cur ? ' on' : ''}" aria-checked="${v === cur}" ${attr}="${v}">${esc(l)}</button>`).join('')}</div>`;
    return `<div class="tutor-card tutor-answers"><p style="margin:0 0 8px"><b>Answers</b></p>
      <div class="seg-row"><span class="small">Length</span>${seg('Answer length', LENGTHS, len, 'data-len')}</div>
      <div class="seg-row"><span class="small">Text size</span>${seg('Text size in the tutor', SIZES, fs, 'data-fs')}</div></div>`;
  }
  function wireAnswerCard(root, redraw) {
    root.querySelectorAll('[data-len]').forEach(b => b.addEventListener('click', () => { setPref({ length: b.dataset.len === 'medium' ? null : b.dataset.len }); redraw(); }));
    root.querySelectorAll('[data-fs]').forEach(b => b.addEventListener('click', () => { setPref({ textSize: Number(b.dataset.fs) || 0 }); applyTextSize(); redraw(); }));
  }
  /** bigger text in the panel and on the tutor's page */
  function applyTextSize() {
    const k = textSize();
    document.querySelectorAll('.tutor, .ai-page').forEach(el => { el.classList.toggle('tutor-fs-1', k === 1); el.classList.toggle('tutor-fs-2', k === 2); });
  }

  /* ---------- the language of explanations ---------- */
  const LANGS = [['en', 'In English'], ['es', 'En español'], ['hi', 'हिंदी में']];
  const LANG_LINE = {
    es: 'Reply in Spanish, in simple, clear sentences for a student. Keep numbers, math symbols and Procademy’s skill names as written.',
    hi: 'Reply in Hindi (Devanagari script), in simple, clear sentences for a student. Keep numbers, math symbols and Procademy’s skill names as written.',
  };
  /** what every question carries from the learner's choices: the language, the level and its words, the answer
      length, what is remembered, the class lesson and what ratings asked for */
  function withPrefs(ctx, lang) {
    const out = Object.assign({}, ctx || {}), l = lang || pref().lang || 'en', mem = memoryText(), on = pref().memory !== false;
    if (LANG_LINE[l] && !out.lang) out.lang = LANG_LINE[l];
    if (mem && !out.memory) out.memory = mem;
    if (!out.level) { const lv = levelLine(myLevel()); if (lv) out.level = lv; }
    if (!out.length && LENGTH_LINE[pref().length]) out.length = LENGTH_LINE[pref().length];
    const tune = tuningText(); if (tune && !out.tuning) out.tuning = tune;
    if (on && !out.lesson && !out.classLesson) { const cl = classLesson(); if (cl) out.classLesson = cl; }
    return Object.keys(out).length ? out : ctx;
  }

  /* ---------- the whiteboard: worked steps written out one at a time ---------- */
  const reduceMotion = () => document.documentElement.getAttribute('data-motion') === 'reduce' || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  /** steps (HTML already made safe: Procademy's own steps, or a rendered answer) on a whiteboard, one at a time */
  function whiteboard(steps, title) {
    steps = (steps || []).filter(x => String(x).replace(/<[^>]*>/g, '').trim());
    if (!steps.length) return null;
    const back = document.activeElement, wrap = document.createElement('div');
    wrap.className = 'wb-wrap' + (reduceMotion() ? ' still' : '');
    wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-labelledby', 'wb-h');
    wrap.innerHTML = `<div class="wb-board"><div class="wb-top"><h2 id="wb-h">${esc(title || 'Step by step')}</h2><button type="button" class="iconbtn" data-wb="close" aria-label="Close the whiteboard">✕</button></div>
      <ol class="wb-steps" aria-live="polite">${steps.map(h => `<li hidden>${h}</li>`).join('')}</ol>
      <div class="wb-foot"><span class="small wb-count" id="wb-count"></span><span class="spacer"></span>
        ${window.COACH && COACH.canSpeak() ? '<button type="button" class="btn sm ghost" data-wb="say">Read it</button>' : ''}
        <button type="button" class="btn sm" data-wb="back">Back</button><button type="button" class="btn sm primary" data-wb="next">Next step</button><button type="button" class="btn sm ghost" data-wb="all">Show all</button></div></div>`;
    document.body.appendChild(wrap);
    const lis = [...wrap.querySelectorAll('.wb-steps > li')];
    let shown = 0;
    const draw = () => {
      lis.forEach((li, k) => { const was = !li.hidden; li.hidden = k >= shown; if (!was && !li.hidden) { li.classList.remove('write'); void li.offsetWidth; li.classList.add('write'); } });
      wrap.querySelector('#wb-count').textContent = `Step ${shown} of ${lis.length}`;
      wrap.querySelector('[data-wb="next"]').disabled = shown >= lis.length;
      wrap.querySelector('[data-wb="all"]').hidden = shown >= lis.length;
      wrap.querySelector('[data-wb="back"]').disabled = shown <= 1;
      if (lis[shown - 1]) lis[shown - 1].scrollIntoView({ block: 'nearest' });
    };
    const close = () => { wrap.remove(); document.removeEventListener('keydown', onKey, true); if (window.speechSynthesis) speechSynthesis.cancel(); if (back && back.focus) back.focus(); };
    const act = a => {
      if (a === 'close') return close();
      if (a === 'next' && shown < lis.length) shown++;
      if (a === 'back' && shown > 1) shown--;
      if (a === 'all') shown = lis.length;
      if (a === 'say' && lis[shown - 1] && window.COACH) COACH.say(lis[shown - 1].innerHTML);
      draw();
    };
    const onKey = ev => {
      if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); close(); }
      else if ((ev.key === 'ArrowRight' || ev.key === ' ') && !ev.target.closest('button')) { ev.preventDefault(); act('next'); }
      else if (ev.key === 'ArrowLeft') { ev.preventDefault(); act('back'); }
    };
    document.addEventListener('keydown', onKey, true);
    wrap.addEventListener('click', ev => { const b = ev.target.closest('[data-wb]'); if (b) act(b.dataset.wb); else if (ev.target === wrap) close(); });
    shown = 1; draw();
    wrap.querySelector('[data-wb="next"]').focus();
    return wrap;
  }
  /** the steps of an answer the tutor wrote: its numbered steps, else its paragraphs (as rendered, so safe) */
  function stepsOf(bubble) {
    if (!bubble) return [];
    const ol = bubble.querySelector(':scope > ol');
    const units = ol && ol.children.length >= 2 ? [...ol.children] : [...bubble.querySelectorAll(':scope > p, :scope > ol > li, :scope > ul > li')];
    // glossary words go back to plain words on the whiteboard
    return units.filter(u => !u.closest('.pace, .ai-actions, .ai-verify')).map(u => { const c = u.cloneNode(true); c.querySelectorAll('.term').forEach(b => b.replaceWith(document.createTextNode(b.textContent))); return c.innerHTML; });
  }

  function pref() { return S.get().profile.tutor || {}; }
  function setPref(p) { S.setProfile({ tutor: Object.assign({}, pref(), p) }); applyCloud(); }
  /** keys live in their own storage entry, so they never enter a backup file */
  const SECRET_KEY = 'procademy.secret.v1';
  function secrets() { try { return JSON.parse(localStorage.getItem(SECRET_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function setSecret(k, v) { try { const o = secrets(); if (v) o[k] = v; else delete o[k]; localStorage.setItem(SECRET_KEY, JSON.stringify(o)); } catch (e) { /* storage blocked */ } if (T.clearWait) T.clearWait(k); applyCloud(); }     // a new key: the old wait no longer applies
  /** tell the engine which free services to use, and any key */
  function applyCloud() {
    const off = pref().cloudOff || [];
    T.cloud = { use: T.PROVIDERS.map(p => p.id).filter(id => !off.includes(id)), tokens: { llm7: secrets().llm7 || '' } };
  }
  /** which engine to use: the saved choice, or the free cloud tutor */
  function chosenEngine() { return pref().engine || 'cloud'; }
  /** unlimited mode is on unless switched off; on a metered connection it waits to be switched on */
  function unlimitedOn() { const u = pref().unlimited; return u === undefined ? !T.meteredConnection() : !!u; }
  /** start unlimited mode's on-device helper in the background (never blocks the chat) */
  function maybePrepare() {
    if (chosenEngine() !== 'cloud' || !unlimitedOn()) return;
    if (T.local.state === 'off') T.prepareLocal().then(() => render());
  }

  function build() {
    if (panel) return panel;
    const btn = document.createElement('button');
    btn.className = 'tutor-fab'; btn.id = 'tutor-fab'; btn.type = 'button';
    btn.setAttribute('aria-label', 'Ask the Procademy tutor'); btn.innerHTML = (window.ICONS ? ICONS.svg('sparkle', 18) : '') + '<span>Ask the tutor</span>';
    btn.setAttribute('aria-keyshortcuts', 't'); btn.title = 'Ask the tutor (press T)';
    btn.addEventListener('click', () => (panel.hidden ? UI.open() : UI.close()));
    ['pointerenter', 'focus', 'touchstart'].forEach(e => btn.addEventListener(e, () => warm(), { passive: true }));
    document.body.appendChild(btn);
    keepClear(btn);
    panel = document.createElement('aside');
    panel.className = 'tutor'; panel.id = 'tutor'; panel.hidden = true;
    panel.setAttribute('aria-label', 'Procademy tutor');
    panel.innerHTML = `<div class="tutor-resize" id="tutor-resize" role="separator" aria-orientation="vertical" aria-label="Resize the tutor (arrow keys; double-click to reset)" tabindex="0"></div>
      <div class="tutor-grip" id="tutor-grip" role="separator" aria-orientation="horizontal" aria-label="Resize the tutor" tabindex="0"></div>
      <div class="tutor-head"><div><b>Procademy tutor</b><div class="tutor-status small muted" id="tutor-status"></div></div>
        <div class="row" style="gap:2px"><button class="iconbtn" id="tutor-clear" type="button" aria-label="Clear this chat" title="Clear this chat (you can undo it)" hidden>${tsvg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V7"/>', 18)}</button><button class="iconbtn" id="tutor-size" aria-label="Change the tutor’s size" title="Size: narrow, medium or wide (or drag the left edge)">⇔</button><button class="iconbtn" id="tutor-expand" aria-label="Open the tutor as a full page" title="Open as a full page">⤢</button>
        <button class="iconbtn" id="tutor-settings" aria-label="Tutor settings" title="Tutor settings"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3.3h-4l-.4 2.6a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" transform="translate(-1 0)"/></svg></button>
        <button class="iconbtn" id="tutor-close" aria-label="Close the tutor">✕</button></div></div>
      <div class="tutor-about" id="tutor-about"></div>
      <div class="tutor-body" id="tutor-body" aria-live="polite"></div>
      <div class="tutor-quick" id="tutor-quick"></div>
      <div class="file-tray" id="tutor-tray" hidden></div>
      <form class="tutor-input" id="tutor-form"><button class="iconbtn attach-btn" id="tutor-attach" type="button" aria-label="Attach a photo, PDF or text file" title="Attach a photo, PDF or text file"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M16.5 6.5 8.8 14.2a2 2 0 0 0 2.8 2.8l7.8-7.8a4 4 0 0 0-5.7-5.7L5.9 11.3a6 6 0 0 0 8.5 8.5l6.4-6.4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <input type="file" id="tutor-file" accept="${FILES ? FILES.ACCEPT : ''}" multiple hidden>
        ${micHtml('tutor-mic', 'tutor-mic')}<textarea id="tutor-text" rows="2" placeholder="Ask, or ask for a graph…" aria-label="Your question"></textarea>
        <button class="btn primary" id="tutor-send" type="submit">Send</button></form>
      <div class="tutor-note tiny muted" id="tutor-note"></div>`;
    document.body.appendChild(panel);
    panel.querySelector('#tutor-close').addEventListener('click', () => UI.close());
    panel.querySelector('#tutor-clear').addEventListener('click', () => UI.clear());
    applyTextSize();
    wireMic(panel.querySelector('#tutor-mic'), panel.querySelector('#tutor-text'), () => pref().lang || 'en');
    panel.querySelector('#tutor-expand').addEventListener('click', () => { handoff = { history: history.slice(), context }; UI.close(); location.hash = '#/tutor/new'; });
    wireResize();
    panel.querySelector('#tutor-settings').addEventListener('click', () => { view = view === 'settings' ? 'chat' : 'settings'; render(); });
    panel.querySelector('#tutor-form').addEventListener('submit', ev => { ev.preventDefault(); send(panel.querySelector('#tutor-text').value); });
    // files: the attach button, pasting a picture, or dropping a file on the panel
    if (FILES) {
      tray = FILES.tray(panel.querySelector('#tutor-tray'), () => render());
      const input = panel.querySelector('#tutor-file');
      panel.querySelector('#tutor-attach').addEventListener('click', () => input.click());
      input.addEventListener('change', () => { tray.add(input.files); input.value = ''; });
      panel.querySelector('#tutor-text').addEventListener('paste', ev => { const f = ev.clipboardData && [...ev.clipboardData.files]; if (f && f.length) { ev.preventDefault(); tray.add(f); } });
      panel.addEventListener('dragover', ev => { if (ev.dataTransfer && [...ev.dataTransfer.types].includes('Files')) { ev.preventDefault(); panel.classList.add('dropping'); } });
      panel.addEventListener('dragleave', ev => { if (!panel.contains(ev.relatedTarget)) panel.classList.remove('dropping'); });
      panel.addEventListener('drop', ev => { panel.classList.remove('dropping'); if (ev.dataTransfer && ev.dataTransfer.files.length) { ev.preventDefault(); tray.add(ev.dataTransfer.files); } });
    } else panel.querySelector('#tutor-attach').hidden = true;
    // buttons inside answers that ask a follow-up (a picture's "Another version")
    panel.querySelector('#tutor-body').addEventListener('click', ev => { const b = ev.target.closest('[data-ask]'); if (b) { ev.preventDefault(); send(b.dataset.ask); } });
    panel.querySelector('#tutor-text').addEventListener('keydown', ev => { if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); send(ev.target.value); } });
    panel.addEventListener('keydown', ev => { if (ev.key === 'Escape') UI.close(); });
    T.on(() => render());
    T.builtinAvailable().then(b => { builtin = b; if (!panel.hidden) render(); });
    // going offline or back online changes what the tutor can do
    window.addEventListener('online', () => render());
    window.addEventListener('offline', () => render());
    return panel;
  }

  /* ---------- the keyboard: T opens or closes the tutor from anywhere (not while typing) ----------
     The list of shortcuts (the ? key) gets a line for it. */
  const typingIn = el => !!(el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable || (el.closest && el.closest('[contenteditable], .cx-calc, [role="application"]'))));
  document.addEventListener('keydown', ev => {
    if (ev.key === '?' && !ev.ctrlKey && !ev.metaKey) { setTimeout(addShortcutRow, 0); return; }
    if ((ev.key !== 't' && ev.key !== 'T') || ev.ctrlKey || ev.metaKey || ev.altKey || ev.defaultPrevented || ev.repeat) return;
    if (typingIn(ev.target) || typingIn(document.activeElement) || document.querySelector('dialog[open], .wb-wrap, .crop-wrap')) return;
    ev.preventDefault();
    if (document.body.classList.contains('on-ai-page')) { const t = document.getElementById('ai-text'); if (t) t.focus(); return; }
    if (panel && !panel.hidden) UI.close(); else UI.open();
  });
  function addShortcutRow() {
    const d = document.getElementById('keys-dialog'); if (!d || d.querySelector('[data-key-tutor]')) return;
    const sec = [...d.querySelectorAll('section')].find(x => /tutor/i.test((x.querySelector('h3') || {}).textContent || '')) || d.querySelector('section');
    const dl = sec && sec.querySelector('dl'); if (!dl) return;
    dl.insertAdjacentHTML('afterbegin', '<dt data-key-tutor><kbd>T</kbd></dt><dd>Open or close the tutor</dd>');
  }

  /* ---------- the floating button keeps out of the way ----------
     Once the page has scrolled (and on a phone) it is just its icon; it slides away while the page scrolls down,
     and stays away while it would cover a button, a link or a box to type in. */
  function keepClear(btn) {
    let lastY = window.scrollY, settle = 0;
    const covers = () => {
      const r = btn.getBoundingClientRect();
      if (!r.width || getComputedStyle(btn).display === 'none') return false;
      btn.style.visibility = 'hidden';
      const pts = [[r.left + 6, r.top + 6], [r.right - 6, r.top + 6], [r.left + 6, r.bottom - 6], [r.right - 6, r.bottom - 6], [r.left + r.width / 2, r.top + r.height / 2]];
      const hit = pts.some(([x, y]) => { const el = document.elementFromPoint(x, y); return el && el.closest('button, a, input, select, textarea, label, [role="button"], [tabindex]') && !el.closest('.tutor, .tabbar, .top'); });
      btn.style.visibility = '';
      return hit;
    };
    /** measure where the button rests (with its slide paused, so a half-finished slide isn't measured), then
        let it slide in or out */
    const place = () => {
      const was = btn.classList.contains('away');
      btn.style.transition = 'none';
      btn.classList.remove('away');
      btn.classList.toggle('compact', window.scrollY > 60 || phone());
      const hit = covers();
      btn.classList.toggle('away', was);
      void btn.offsetWidth;
      btn.style.transition = '';
      btn.classList.toggle('away', hit);
    };
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > lastY + 4) btn.classList.add('away');
      lastY = y;
      clearTimeout(settle); settle = setTimeout(place, 240);
    }, { passive: true });
    const later = () => { clearTimeout(settle); settle = setTimeout(place, 320); };
    window.addEventListener('hashchange', later);
    window.addEventListener('resize', later);
    const main = document.getElementById('main');
    if (main && window.MutationObserver) new MutationObserver(later).observe(main, { childList: true, subtree: true });
    later();
    UI.placeFab = place;                               // for the test suite
  }

  /* ---------- size: drag the edge (or the ⇔ button), remembered on this device ---------- */
  const SIZE_KEY = 'procademy.ui.v1';
  const W_MIN = 320, W_DEFAULT = 420;
  const PRESETS = [[360, 'narrow'], [460, 'medium'], [640, 'wide']];
  function sizes() { try { return JSON.parse(localStorage.getItem(SIZE_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function saveSizes(o) { try { localStorage.setItem(SIZE_KEY, JSON.stringify(Object.assign(sizes(), o))); } catch (e) { /* fine */ } }
  const wMax = () => Math.max(W_MIN, Math.min(960, window.innerWidth - 120));
  const curW = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tutor-w')) || W_DEFAULT;
  const phone = () => window.innerWidth <= 700;
  /** apply a width (computer) or top offset (phone), and decide whether the page can share the screen.
      While dragging (live), only the panel moves; the page settles once, when the drag ends. */
  function applySize(w, top, live) {
    const root = document.documentElement;
    if (w != null) root.style.setProperty('--tutor-w', Math.round(Math.max(W_MIN, Math.min(wMax(), w))) + 'px');
    if (top != null) root.style.setProperty('--tutor-top', Math.round(Math.max(56, Math.min(window.innerHeight - 200, top))) + 'px');
    if (live) return;
    // a page narrower than this would be cramped beside the tutor, so the tutor floats over it instead
    document.body.classList.toggle('tutor-overlay', window.innerWidth - curW() - 30 < 520);
    root.style.setProperty('--tutor-page-w', curW() + 'px');
    const b = panel && panel.querySelector('#tutor-size');
    if (b) { const k = nearestPreset(curW()); b.title = `Size: ${PRESETS[k][1]}. Press for ${PRESETS[(k + 1) % PRESETS.length][1]}, or drag the left edge`; }
  }
  const nearestPreset = w => PRESETS.reduce((best, p, k) => (Math.abs(p[0] - w) < Math.abs(PRESETS[best][0] - w) ? k : best), 0);
  /** a phone's panel rests at one of three heights; pulled low enough, it closes */
  function snapTop(top) {
    const h = window.innerHeight, stops = [56, Math.round(h * 0.38), Math.round(h * 0.6)];
    if (top > h * 0.8) return null;
    return stops.reduce((a, b) => (Math.abs(b - top) < Math.abs(a - top) ? b : a));
  }
  function wireResize() {
    const s0 = sizes();
    applySize(s0.w || W_DEFAULT, s0.top);
    const edge = panel.querySelector('#tutor-resize'), grip = panel.querySelector('#tutor-grip');
    const drag = (el, axis, when) => {
      el.addEventListener('pointerdown', ev => {
        if (ev.button > 0 || (when && !when(ev))) return;
        ev.preventDefault(); try { el.setPointerCapture(ev.pointerId); } catch (e) { /* not a live pointer */ }
        document.body.classList.add('tutor-resizing');
        let frame = 0, last = ev, moved = false;
        const move = e => {
          last = e; moved = moved || Math.abs(e.clientX - ev.clientX) + Math.abs(e.clientY - ev.clientY) > 2;
          if (frame) return;
          frame = requestAnimationFrame(() => { frame = 0; if (axis === 'x') applySize(window.innerWidth - last.clientX - 18, null, true); else applySize(null, last.clientY - 8, true); });
        };
        const up = () => {
          cancelAnimationFrame(frame);
          el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
          document.body.classList.remove('tutor-resizing');
          if (axis === 'x') { if (moved) applySize(window.innerWidth - last.clientX - 18, null); else applySize(null, null); saveSizes({ w: curW() }); }
          else {
            const t = snapTop(moved ? last.clientY - 8 : parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tutor-top')) || 0);
            if (t === null) { UI.close(); return; }
            panel.classList.add('tutor-snapping'); applySize(null, t); setTimeout(() => panel.classList.remove('tutor-snapping'), 220);
            saveSizes({ top: t });
          }
        };
        el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      });
    };
    drag(edge, 'x'); drag(grip, 'y');
    drag(panel.querySelector('.tutor-head'), 'y', ev => phone() && !ev.target.closest('button, a, input'));     // on a phone the header pulls too
    edge.addEventListener('keydown', ev => {
      const w = curW(), step = ev.shiftKey ? 80 : 24;
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); applySize(w + step, null); saveSizes({ w: curW() }); }
      if (ev.key === 'ArrowRight') { ev.preventDefault(); applySize(w - step, null); saveSizes({ w: curW() }); }
    });
    grip.addEventListener('keydown', ev => {
      const t = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tutor-top')) || window.innerHeight * 0.38;
      if (ev.key === 'ArrowUp') { ev.preventDefault(); applySize(null, t - 60); saveSizes({ top: t - 60 }); }
      if (ev.key === 'ArrowDown') { ev.preventDefault(); applySize(null, t + 60); saveSizes({ top: t + 60 }); }
    });
    edge.addEventListener('dblclick', () => { applySize(W_DEFAULT, null); saveSizes({ w: W_DEFAULT }); });
    // ⇔ steps through narrow, medium and wide (on a phone: short, half and tall)
    panel.querySelector('#tutor-size').addEventListener('click', () => {
      panel.classList.add('tutor-snapping'); setTimeout(() => panel.classList.remove('tutor-snapping'), 220);
      if (phone()) {
        const h = window.innerHeight, stops = [Math.round(h * 0.6), Math.round(h * 0.38), 56];
        const t = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tutor-top')) || stops[1];
        const k = stops.reduce((best, v, i) => (Math.abs(v - t) < Math.abs(stops[best] - t) ? i : best), 0);
        const next = stops[(k + 1) % stops.length]; applySize(null, next); saveSizes({ top: next });
      } else {
        const fits = PRESETS.filter(p => p[0] <= wMax());
        const k = nearestPreset(curW()), next = (fits[(fits.findIndex(p => p === PRESETS[k]) + 1) % fits.length] || PRESETS[0])[0];
        applySize(next, null); saveSizes({ w: curW() });
      }
    });
    window.addEventListener('resize', () => applySize(null, null));
  }

  function aboutText() {
    if (!context) return '';
    const what = context.question ? 'this question' : context.lesson ? 'lesson ' + context.lesson : context.skill ? context.skill : '';
    return what ? `<span class="chip">About: ${esc(what.length > 60 ? what.slice(0, 57) + '…' : what)}</span>` : '';
  }

  /** the settings view: cloud (default) or a model on this device */
  function unlimitedCard() {
    const L = T.local, on = unlimitedOn(), model = L.modelId ? T.model(L.modelId) : null;
    let state = '';
    if (L.state === 'ready') state = `<span class="chip up">On · no waiting</span>`;
    else if (L.state === 'loading') state = `<span class="chip">Getting ready · ${Math.round((L.progress.fraction || 0) * 100)}%</span>`;
    else if (L.state === 'unsupported') state = `<span class="chip">Not available on this device</span>`;
    else if (L.state === 'error') state = `<span class="chip down">Couldn’t start</span>`;
    return `<div class="tutor-card"><p style="margin-bottom:6px"><b>Unlimited mode</b> ${state}</p>
      <label class="tutor-check"><input type="checkbox" id="tutor-unlimited" ${on ? 'checked' : ''} ${L.state === 'unsupported' ? 'disabled' : ''}>
        <span>Also run the free AI on this device, so there is never a wait. It sets itself up in the background the first time${model ? ` (${esc(model.id === 'builtin' ? 'uses the browser’s own AI, nothing to download' : model.size + ', once')})` : ' (about 350 MB on a phone, 1 GB on a computer, once)'}.</span></label>
      <p class="tiny muted" style="margin:6px 0 0">The cloud AI answers while the cloud is free; this device answers whenever it is busy, offline too. Answers from this device never leave it.${L.state === 'error' ? ' ' + esc(L.error) : ''}${L.state === 'unsupported' ? ' This browser can’t run it (it needs WebGPU: Chrome or Edge on a computer, or Safari on a recent Mac, iPhone or iPad).' : ''}</p></div>`;
  }
  function settingsCard() {
    const current = chosenEngine(), device = T.supported();
    const options = [T.CLOUD].concat(builtin ? [T.BUILTIN] : [], T.MODELS);
    return unlimitedCard() + `<details class="tutor-card tutor-advanced"><summary><b>Advanced</b></summary>
      <p style="margin:10px 0 8px"><b>How the tutor runs</b></p>
      <fieldset class="tutor-models"><legend class="visually-hidden">Choose how the tutor runs</legend>
        ${options.map(m => {
          const isDevice = m.id !== 'cloud' && m.id !== 'builtin', off = isDevice && !device;
          return `<label class="tutor-model${off ? ' off' : ''}"><input type="radio" name="tutor-engine" value="${m.id}" ${m.id === current ? 'checked' : ''} ${off ? 'disabled' : ''}>
            <span><b>${esc(isDevice ? 'On this device: ' + m.name : m.name)}</b> · ${esc(m.size)}${m.id === 'cloud' ? ' <span class="chip up">Recommended</span>' : ''}<br>
            <span class="small muted">${esc(m.note)}${isDevice ? ' Private, and works offline after a one-time download.' : ''}${off ? ' This browser can’t run it (it needs WebGPU).' : ''}</span></span></label>`;
        }).join('')}
      </fieldset>
      <button class="btn primary block" id="tutor-use">Use this</button>
      <p style="margin:14px 0 6px"><b>Free cloud services</b></p>
      <p class="small muted" style="margin-bottom:8px">The cloud tutor uses these in turn, so one is usually free to answer at once.</p>
      ${T.PROVIDERS.map(p => `<label class="tutor-check"><input type="checkbox" class="tutor-provider" value="${p.id}" ${(pref().cloudOff || []).includes(p.id) ? '' : 'checked'}>
        <span><b>${esc(p.name)}</b> · ${p.id === 'llm7' ? 'about one reply a second' : 'one reply every 30 seconds'} · <a href="${p.privacy}" target="_blank" rel="noopener">privacy</a></span></label>`).join('')}
      <p class="tiny muted" style="margin:4px 0 10px">LLM7’s privacy policy says it isn’t meant for children under 13. Uncheck it to use only Pollinations.</p>
      <label class="small" for="tutor-llm7-key"><b>Free LLM7 key</b> (optional)</label>
      <div class="row" style="gap:6px;margin-top:4px"><input id="tutor-llm7-key" type="password" autocomplete="off" placeholder="${secrets().llm7 ? 'Saved on this device' : 'Paste a free key from dash.llm7.io'}" style="flex:1;min-width:0;padding:.45rem .6rem;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink)">
        <button class="btn sm" id="tutor-key-save">${secrets().llm7 ? 'Replace' : 'Save'}</button>${secrets().llm7 ? '<button class="btn sm ghost" id="tutor-key-clear">Remove</button>' : ''}</div>
      <p class="tiny muted" style="margin:6px 0 0">Without a key it works too. A free key secures LLM7’s published free limits (1 a second, 60 a minute, 250 an hour). It stays on this device and is never put in a backup.</p>
      <p class="tiny muted" style="margin:10px 0 0">The cloud tutor sends your question and the problem on screen to these services. It never sends your name or your progress. Don’t type personal details. The on-device models send nothing anywhere.</p></details>`;
  }

  /** while the free AI is busy, say so honestly, and give Procademy's own checked first step if there is one */
  function waitingText(m) {
    if (!waiting) return thinkingHtml(m && m.t0);
    const step = context && context.question && context.steps && context.steps[0];
    return `<span class="muted">The free AI services are busy for a moment. Your reply is coming in ${waiting.seconds} s…</span>` +
      (step ? `<div class="tutor-wait-step"><div class="tiny muted">While you wait, Procademy’s first step:</div>${esc(step)}</div>` : '');
  }

  const SHORTER = 'That was too long. Give me a shorter answer: just the key idea and the main steps.';
  /** the learner's question an answer replies to */
  const questionBefore = (msgs, i) => ((msgs || []).slice(0, i).reverse().find(x => x.role === 'user') || {}).content || '';
  /** one message in the panel; the newest answer gets follow-ups that fit it, tools, ratings and copying */
  function panelMsg(m, i, lastBot, cloud) {
    if (m.role === 'user') return `<div class="tmsg user" data-i="${i}">${esc(m.content).replace(/\n/g, '<br>')}${filesOf(m)}</div>`;
    if (m.failed) return `<div class="tmsg assistant failed" data-i="${i}">${failedHtml(m, m.helpCtx || context, i)}</div>`;
    const done = !!m.content && !m.pic && !(T.busy() && i === history.length - 1);
    const body = m.content || m.viz || m.pic ? T.render(m.content, m) + (m.via === 'device' && cloud ? '<div class="tmsg-via">answered on this device</div>' : '') : '';
    let foot = '';
    if (done && i === lastBot) {
      const q = questionBefore(history, i), fu = followUps(m, q).slice(0, 2), long = String(m.content).length > 650;
      foot = `<div class="ai-actions tutor-more">${fu.map(f => `<button type="button" class="chip-btn" data-ask="${esc(f.ask)}">${esc(f.label)}</button>`).join('')}${long ? `<button type="button" class="chip-btn" data-short="${i}" title="Ask for a shorter answer">Too long</button>` : ''}<button type="button" class="chip-btn tutor-more-btn" aria-expanded="false">More</button>
        <span class="tutor-more-chips" hidden>${MORE.map(([l], k) => `<button type="button" class="chip-btn" data-more="${k}">${l}</button>`).join('')}<button type="button" class="chip-btn" data-copy="${i}">Copy</button><button type="button" class="chip-btn" data-copypic="${i}" title="Copy the answer as a picture, to paste into a message or a document">Copy as a picture</button></span></div>
        <div class="ai-foot">${toolsHtml(q, m)}<span class="spacer"></span>${rateHtml(m, i)}</div>${whyHtml(m, i)}`;
    } else if (done && m.rating) foot = `<div class="ai-foot"><span class="spacer"></span>${rateHtml(m, i)}</div>`;
    return `<div class="tmsg assistant" data-i="${i}">${body}${!m.content && !m.pic ? waitingText(m) : ''}${done ? checksHtml(m) : ''}${foot}</div>`;
  }

  function render() {
    if (!panel || panel.hidden) return;
    const body = panel.querySelector('#tutor-body'), status = panel.querySelector('#tutor-status'), note = panel.querySelector('#tutor-note');
    panel.querySelector('#tutor-about').innerHTML = view === 'chat' ? aboutText() : '';
    const ready = T.state === 'ready', cloud = ready && T.isCloud();
    const L = T.local;
    status.textContent = waiting ? `Free tutor · next reply in ${waiting.seconds} s`
      : ready ? (cloud ? (L.state === 'ready' ? 'Unlimited · never a wait' : L.state === 'loading' ? `Free tutor · unlimited mode ${Math.round((L.progress.fraction || 0) * 100)}%` : 'Free cloud tutor · no download') : `${T.model(T.modelId).name} · on this device`)
      : T.state === 'loading' ? 'Starting…' : 'Off';
    if (ready && cloud && !T.online() && L.state !== 'ready') status.textContent = 'Offline · practice still works';
    note.textContent = view !== 'chat' ? '' : cloud ? (L.state === 'ready' ? 'Free AI: from the cloud when it is free, from this device when it is busy. It can make mistakes; Procademy checks every practice answer itself.' : 'Free AI (GPT-OSS through LLM7 and Pollinations). It can make mistakes; Procademy checks every practice answer itself.')
      : ready ? 'Runs on this device. It can make mistakes; Procademy checks every practice answer itself.' : '';
    let html = '';
    if (view === 'settings') html = (window.COACH && COACH.canSpeak() ? `<div class="tutor-card"><label class="tutor-check"><input type="checkbox" id="tutor-voice" ${pref().voice ? 'checked' : ''}><span><b>Read answers aloud</b><br><span class="small muted">Each answer is read in this device’s voice as soon as it’s ready.</span></span></label></div>` : '')
      + `<div class="tutor-card"><label class="small" for="tutor-lang"><b>Explanations</b></label><select id="tutor-lang" class="tutor-lang">${LANGS.map(([v, l]) => `<option value="${v}" lang="${v}" ${(pref().lang || 'en') === v ? 'selected' : ''}>${l}</option>`).join('')}</select><p class="tiny muted" style="margin:6px 0 0">Practice questions and lessons stay in English.</p></div>`
      + answerCard() + memoryCard() + settingsCard();
    else {
      if (T.state === 'loading') {
        const pct = Math.round((T.progress.fraction || 0) * 100);
        html = `<div class="tutor-card"><p><b>${T.progress.fraction > 0 && T.progress.fraction < 1 ? 'Downloading the on-device tutor…' : 'Starting the tutor…'}</b></p>
          <div class="pbar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>
          <p class="tiny muted" style="margin-top:6px">${esc(T.progress.text || '')}</p>
          <p class="small muted">The first time takes a few minutes; after that it starts in seconds, even offline. <a href="#" class="tutor-use-cloud">Use the free cloud tutor instead</a>.</p></div>`;
      } else if (T.state === 'error') {
        html = `<div class="feedback bad"><span>${esc(T.error)}</span></div><div class="btn-row"><button class="btn sm tutor-use-cloud">Use the free cloud tutor</button></div>`;
      } else if (ready && !history.length && !T.online() && !(T.isCloud() ? T.localReady() : true)) {
        html = `<div class="tutor-card tutor-offline"><p style="margin:0 0 4px"><b>You’re offline</b></p><p class="small" style="margin:0">The free tutor needs the internet${T.local.state !== 'unsupported' ? ', unless Unlimited mode is ready on this device (see the tutor’s settings)' : ''}. It will answer again once you’re back online.</p>${offlineHelp(context, '', true)}</div>`;
      } else if (ready && !history.length && context && context.question) {
        const q = context.question.length > 240 ? context.question.slice(0, 237) + '…' : context.question;
        html = `<div class="tutor-card tutor-q"><div class="tiny muted">Help with this question</div><div class="tutor-q-text">${esc(q)}</div></div>
          <div class="tmsg assistant"><p>Ask anything about it, or pick a button below. The tutor won’t give the answer before you’ve tried it.</p></div>`;
      } else if (ready && !history.length) {
        html = `<div class="tmsg assistant"><p>This is the Procademy tutor. Ask for an explanation, another example or a hint, in any subject. The tutor doesn’t reveal the answer to a practice question before you have tried it.</p></div>`;
      }
      const lastBot = history.length && history[history.length - 1].role === 'assistant' ? history.length - 1 : -1;
      html += history.map((m, i) => panelMsg(m, i, lastBot, cloud)).join('');
    }
    body.innerHTML = html;
    panel.querySelector('#tutor-clear').hidden = !history.length || view !== 'chat';
    if (view === 'chat') {
      const busy = T.busy();
      body.querySelectorAll('.tmsg.assistant[data-i]').forEach(el => {
        const k = Number(el.dataset.i), m = history[k];
        if (!m || m.failed || (busy && k === history.length - 1)) return;
        glossaryLinks(el, 4);
        if (!busy) pace(el, m);
      });
    }
    body.querySelectorAll('[data-more]').forEach(b => b.addEventListener('click', () => { const k = Number(b.dataset.more); send(MORE[k][1] || pictureAsk(history)); }));
    body.querySelectorAll('.tutor-more-btn').forEach(b => b.addEventListener('click', () => { const g = b.nextElementSibling, on = g.hidden; g.hidden = !on; b.setAttribute('aria-expanded', String(on)); b.textContent = on ? 'Less' : 'More'; }));
    body.querySelectorAll('[data-short]').forEach(b => b.addEventListener('click', () => { const m = history[Number(b.dataset.short)]; rate(m, 'down', 'long'); send(SHORTER); }));
    body.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => { const m = history[Number(b.dataset.copy)]; copyText(m).then(ok => { b.textContent = ok ? 'Copied' : 'Couldn’t copy'; setTimeout(() => { b.textContent = 'Copy'; }, 1500); }); }));
    body.querySelectorAll('[data-copypic]').forEach(b => b.addEventListener('click', () => { const k = Number(b.dataset.copypic); copyPicture(history[k], questionBefore(history, k)); }));
    body.querySelectorAll('[data-retry]').forEach(b => b.addEventListener('click', () => UI.retry(Number(b.dataset.retry))));
    wireRating(body, history, () => render());
    const lSel = body.querySelector('#tutor-lang');
    if (lSel) lSel.addEventListener('change', () => setPref({ lang: lSel.value }));
    if (view === 'settings') { wireMemory(body, render); wireAnswerCard(body, render); }
    const vBox = body.querySelector('#tutor-voice');
    if (vBox) vBox.addEventListener('change', () => { setPref({ voice: vBox.checked }); if (!vBox.checked && window.speechSynthesis) speechSynthesis.cancel(); });
    const uBox = body.querySelector('#tutor-unlimited');
    if (uBox) uBox.addEventListener('change', () => { setPref({ unlimited: uBox.checked }); if (uBox.checked) { if (T.local.state === 'error') T.local.state = 'off'; maybePrepare(); } render(); });
    const adv = body.querySelector('.tutor-advanced');
    if (adv) { adv.open = !!openAdvanced; adv.addEventListener('toggle', () => { openAdvanced = adv.open; }); }
    body.querySelectorAll('.tutor-provider').forEach(cb => cb.addEventListener('change', () => {
      const off = [...body.querySelectorAll('.tutor-provider')].filter(x => !x.checked).map(x => x.value);
      setPref({ cloudOff: off });
    }));
    const keySave = body.querySelector('#tutor-key-save'), keyClear = body.querySelector('#tutor-key-clear');
    if (keySave) keySave.addEventListener('click', () => { const v = body.querySelector('#tutor-llm7-key').value.trim(); if (v) { setSecret('llm7', v); render(); } });
    if (keyClear) keyClear.addEventListener('click', () => { setSecret('llm7', ''); render(); });
    const use = body.querySelector('#tutor-use');
    if (use) use.addEventListener('click', () => {
      const id = (body.querySelector('input[name="tutor-engine"]:checked') || {}).value || 'cloud';
      setPref({ engine: id, enabled: true });
      view = 'chat';
      T.start(id).then(() => { if (pending) { const q = pending; pending = null; send(q); } }).catch(() => {});
      render();
    });
    body.querySelectorAll('.tutor-use-cloud').forEach(a => a.addEventListener('click', ev => {
      ev.preventDefault(); setPref({ engine: 'cloud', enabled: true });
      T.start('cloud').then(() => { if (pending) { const q = pending; pending = null; send(q); } });
    }));
    const quick = panel.querySelector('#tutor-quick');
    let kind = 'none';
    if (context) kind = context.question ? (context.answerShown ? 'done' : context.studentAnswer ? 'wrong' : 'question') : context.lesson ? 'lesson' : context.skill ? 'skill' : 'none';
    // starting points while the chat is empty; after that, the follow-ups under each answer take over
    quick.innerHTML = view === 'chat' && ready && !T.busy() && !history.length ? (kind === 'none' ? quickNone() : QUICK[kind]).map(q => `<button type="button" class="btn sm">${esc(q)}</button>`).join('') : '';
    quick.querySelectorAll('button').forEach(b => b.addEventListener('click', () => send(b.textContent, { page: b.textContent === PAGE_Q })));
    panel.querySelector('#tutor-text').placeholder = context && context.question ? 'Ask about this question…' : 'Ask, or ask for a graph…';
    const sendBtn = panel.querySelector('#tutor-send');
    sendBtn.textContent = T.busy() ? 'Stop' : 'Send';
    sendBtn.type = T.busy() ? 'button' : 'submit';
    sendBtn.onclick = T.busy() ? (ev => { ev.preventDefault(); T.stop(); }) : null;
    panel.querySelector('#tutor-form').hidden = view !== 'chat';
    panel.querySelector('#tutor-text').disabled = !ready;
    const att = panel.querySelector('#tutor-attach'); if (att) att.disabled = !ready || view !== 'chat';
    body.scrollTop = history.length && view === 'chat' ? body.scrollHeight : 0;      // a chat follows the newest reply; settings read from the top
  }

  async function send(text, opts) {
    text = String(text || '').trim();
    if (T.busy() || (tray && tray.busy())) { if (tray && tray.busy()) note('Still reading your file…'); return; }
    if (!text && !(tray && tray.count())) return;
    if (!text) text = 'Help me with this.';
    const files = tray ? tray.peek() : [];
    const plan = UI.plan(text, history, context, files);
    if (opts && opts.page) plan.ctx = Object.assign({}, plan.ctx || {}, { notes: [plan.ctx && plan.ctx.notes, pageText(), PAGE_ASK].filter(Boolean).join(' ') });
    if (plan.pic || plan.refuse) {                       // a picture needs no AI reply, and works before the tutor starts
      panel.querySelector('#tutor-text').value = '';
      history.push({ role: 'user', content: text });
      history.push(plan.refuse ? { role: 'assistant', content: plan.refuse } : { role: 'assistant', content: `Here is a picture of ${plan.pic.prompt}.`, pic: plan.pic });
      view = 'chat'; render(); return;
    }
    if (T.state !== 'ready') { pending = text; ensureStarted(); render(); return; }
    maybePrepare();
    view = 'chat';
    panel.querySelector('#tutor-text').value = '';
    if (tray) tray.take();
    history.push({ role: 'user', content: text, files: files.length ? files.map(FILES.keep) : undefined });
    const reply = { role: 'assistant', content: '', viz: plan.viz || undefined, t0: Date.now() };
    history.push(reply);
    render();
    const t0 = performance.now();
    try {
      const full = await T.ask(UI.forModel(history.slice(0, -1)), plan.ctx, partial => {
        reply.content = partial;
        const last = panel.querySelector('#tutor-body .tmsg.assistant:last-child');
        if (last) { last.innerHTML = T.render(partial, reply); caret(last); panel.querySelector('#tutor-body').scrollTop = 1e9; }
      }, w => { waiting = w; render(); }, { prefer: opts && opts.prefer });
      reply.content = full || reply.content || (reply.viz ? '' : 'Sorry, I couldn’t think of an answer. Try asking another way.');
      reply.via = T.lastProvider;
      UI.finish(text, reply);
      verify(reply, plan.ctx);
      noteTime(performance.now() - t0);
      speak(reply);
      if (window.BADGES) BADGES.flag('tutor');
    } catch (e) {
      reply.content = (e && e.message) ? e.message : 'Sorry, something went wrong.';
      // the tutor couldn't answer: say so at once, with Procademy's own help and Try again (never a wait)
      reply.failed = { offline: !!(e && e.offline), wait: (e && e.wait) || 0, q: text, retry: (e && e.retry) || null };
      reply.helpCtx = plan.ctx || null;
    }
    delete reply.t0;
    waiting = null;
    render();
  }
  function note(t) { const n = panel.querySelector('#tutor-note'); if (n) n.textContent = t; }
  function filesOf(m) { return m.files && m.files.length && FILES ? `<div class="file-chips">${m.files.map(FILES.chip).join('')}</div>` : ''; }

  function ensureStarted() {
    if (T.state === 'ready' || T.state === 'loading') return;
    let id = chosenEngine();
    if (id !== 'cloud' && id !== 'builtin' && !T.supported()) { id = 'cloud'; setPref({ engine: 'cloud' }); }
    // send the waiting question only if the tutor really started (never loop back into ensureStarted)
    T.start(id).then(() => { if (T.state === 'ready' && pending) { const q = pending; pending = null; send(q); } }).catch(() => {});
  }

  const UI = {
    /** what the learner is looking at; views call this on every render */
    setContext(c) {
      const changed = JSON.stringify(c || null) !== JSON.stringify(context);
      if (changed && context && c && (context.question || '') !== (c.question || '') && history.length) history = [];   // a new question starts a new chat
      context = c || null;
      if (panel && !panel.hidden && changed) render();
      if (changed && c && c.question) setTimeout(() => warm(), 1500);           // a question on screen: the tutor may be asked soon
    },
    getContext() { return context; },
    /** open the panel; { ask } sends that question as soon as the tutor is ready */
    open(opts) {
      opts = opts || {};
      build();
      panel.hidden = false;
      view = 'chat';
      document.body.classList.add('tutor-open');
      if (opts.ask) pending = opts.ask;
      if (T.state === 'ready' && pending) { const q = pending; pending = null; send(q); }
      else ensureStarted();
      maybePrepare();
      render();
      setTimeout(() => { const t = panel.querySelector('#tutor-text'); if (t && !t.disabled) t.focus(); }, 0);
    },
    close() { if (!panel) return; panel.hidden = true; document.body.classList.remove('tutor-open'); const f = document.getElementById('tutor-fab'); if (f) f.focus(); },
    reset() { history = []; pending = null; render(); },
    /** clear the panel's chat, with Undo */
    clear() {
      if (!history.length || T.busy()) return;
      const kept = history; history = []; pending = null; render();
      undoToast('Chat cleared', () => { if (!history.length) { history = kept; render(); } });
      const t = panel && panel.querySelector('#tutor-text'); if (t && !t.disabled) t.focus();
    },
    /** ask a failed question again, the other free service first */
    retry(i) {
      const m = history[i], u = history[i - 1];
      if (!m || !m.failed || !u || u.role !== 'user' || T.busy()) return;
      const q = u.content, prefer = m.failed.retry ? [m.failed.retry] : T.PROVIDERS.map(p => p.id).filter(id => id !== T.lastProvider);
      history.splice(i - 1, 2);
      send(q, { prefer });
    },
    history() { return history; },
    showSettings() { build(); panel.hidden = false; document.body.classList.add('tutor-open'); view = 'settings'; render(); },
    /** for the full page: start the tutor and unlimited mode as the panel would */
    ensureReady() { ensureStarted(); maybePrepare(); return T.state === 'ready' ? Promise.resolve(T) : new Promise(res => { const off = T.on(() => { if (T.state === 'ready' || T.state === 'error') { off(); res(T); } }); }); },
    unlimitedOn, setPref, pref,
    /** start unlimited mode's on-device helper in the background, as opening the tutor does (practice on any topic) */
    prepareBackup: maybePrepare,
    /** the conversation the ⤢ button carried over, once */
    takeHandoff() { const h = handoff; handoff = null; return h; },
    applySize,
    pace, pictureAsk, pageText, thinkingHtml, noteTime, speak, voiceOn, MORE, PAGE_Q, PAGE_ASK, SHORTER, SUBJECTS, starters,
    followUps, toolsFor, toolsHtml, checkCalcs, verify, checksHtml, rate, rateHtml, whyHtml, wireRating, tuningKeys, tuningText, WHY,
    plainAnswer, copyText, copyPicture, answerPicture, offlineHelp, failedHtml, undoToast, caret, glossaryLinks, glossaryIn, learnerGrade,
    myLevel, levelLine, wordsFor, classLesson, answerCard, wireAnswerCard, applyTextSize, LENGTH_LINE, questionBefore, download,
    micHtml, wireMic, warm, memoryItems, memoryText, memoryCard, wireMemory, withPrefs, LANGS, LANG_LINE, whiteboard, stepsOf,
    /** what a question needs before it is sent: a drawing Procademy makes itself (viz), a picture to make
        instead of an AI reply (pic), and the context with any drawing and attached files described */
    plan(text, msgs, ctx, files) {
      const D = window.DRAW, Pi = window.PICTURES;
      files = files || [];
      const prev = [...(msgs || [])].reverse().find(m => m.viz);
      // a bar model or a labeled shape is drawn by Procademy (PICTURES); graphs, number lines and charts by DRAW
      let viz = (Pi && Pi.diagramFromRequest && Pi.diagramFromRequest(text)) || (D ? D.fromRequest(text, prev && prev.viz) : null);
      const csv = files.find(f => f.kind === 'csv');
      if (!viz && csv && FILES && (!D || D.wants(text) || /^help me with this/i.test(text))) viz = FILES.drawingOf(csv);
      const want = !viz && !files.length && Pi ? Pi.wants(text) : null;
      if (want && Pi.blocked(want.prompt)) return { refuse: 'Procademy can’t create that picture. Request something suitable for school, such as a diagram for a word problem.' };
      // files stay part of the conversation for a few questions, so "now do number 3" still works
      const recent = files.length ? files : ((msgs || []).slice(-6).reverse().find(m => m.role === 'user' && m.files && m.files.length) || {}).files || [];
      const out = Object.assign({}, ctx || {});
      if (viz) out.drawn = (Pi && Pi.describe && Pi.describe(viz)) || (D ? D.describe(viz) : '');
      if (recent.length && FILES) out.files = FILES.contextText(recent);
      return { viz, pic: want ? Pi.make(want.prompt) : null, ctx: withPrefs(viz || recent.length ? out : ctx, (ctx && ctx.langCode) || null) };
    },
    /** after the answer: fold the tutor's own graph into Procademy's, or draw what it described in words */
    finish(text, reply) {
      const D = window.DRAW;
      if (!D) return;
      if (reply.viz) { const r = D.absorb(reply.viz, reply.content); reply.viz = r.viz; reply.content = r.content; }
      else if (D.wants(text) && !/```/.test(reply.content || '')) { const v = D.fromReply(reply.content); if (v) reply.viz = v; }
      if (!reply.content && reply.viz) reply.content = 'Here it is. Point at a curve (or tap it) to read off a point.';
    },
    /** the conversation as the model sees it: drawings as their blocks, files by name */
    forModel(msgs) {
      return msgs.filter(m => !m.failed).map(m => ({ role: m.role, content: (m.viz ? m.viz + '\n' : '') + (m.files && m.files.length ? `[attached: ${m.files.map(f => f.name).join(', ')}] ` : '') + (m.content || '') }));
    },
    init() { applyCloud(); build(); },
  };
  window.TUTORUI = UI;
})();
