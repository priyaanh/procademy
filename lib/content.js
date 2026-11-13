/* The content registry. Courses hold units; units hold skills; a skill is a generator that makes a
   question from a seeded RNG. This file also builds and validates questions and checks answers. */
'use strict';
(function () {
  const RNG = (typeof window !== 'undefined' && window.RNG) || require('./rng.js');

  const LEVELS = ['Not started', 'Attempted', 'Familiar', 'Proficient', 'Mastered'];
  const LEVEL_POINTS = [0, 0, 50, 80, 100];     // mastery points a skill is worth at each level
  const TYPES = ['number', 'choice', 'text'];

  const A = {
    LEVELS, LEVEL_POINTS, TYPES,
    courses: [],
    skills: Object.create(null),          // id → skill definition (no prototype: an id from a link can't name a built-in)
    _byId: Object.create(null),           // course id → course
    _where: Object.create(null),          // skill id → { course, unit }

    course(def) {
      if (!def || !def.id || !def.title || !Array.isArray(def.units)) throw new Error('course needs id, title, units');
      if (A._byId[def.id]) throw new Error('duplicate course id ' + def.id);
      def.subject = def.subject || 'Other';
      def.units.forEach(u => {
        if (!u.id || !u.title || !Array.isArray(u.skills) || !u.skills.length) throw new Error(`unit in ${def.id} needs id, title and skills`);
        u.skills.forEach(sid => {
          if (A._where[sid]) throw new Error(`skill ${sid} is in two units`);
          A._where[sid] = { course: def, unit: u };
        });
      });
      A.courses.push(def);
      A._byId[def.id] = def;
      return def;
    },
    skill(def) {
      if (!def || !def.id || !def.title || typeof def.make !== 'function') throw new Error('skill needs id, title, make()');
      if (def.challenge != null && typeof def.challenge !== 'function') throw new Error(def.id + ': challenge must be a function (rng) => question');
      if (A.skills[def.id]) throw new Error('duplicate skill id ' + def.id);
      A.skills[def.id] = def;
      return def;
    },
    /** CPM books: chapters → lessons, each lesson pointing at existing skills. See CPM.md. */
    cpm: [],
    _cpmById: {},
    cpmBook(def) {
      if (!def || !def.id || !def.title || !Array.isArray(def.chapters)) throw new Error('cpmBook needs id, title, chapters');
      if (A._cpmById[def.id]) throw new Error('duplicate CPM book ' + def.id);
      def.chapters.forEach(ch => {
        if (typeof ch.n !== 'number' || !Array.isArray(ch.lessons)) throw new Error(`${def.id}: chapter needs n and lessons`);
        ch.lessons.forEach(l => { l.skills = Array.isArray(l.skills) ? l.skills : []; l.chapter = ch.n; });
      });
      A.cpm.push(def);
      A._cpmById[def.id] = def;
      return def;
    },
    cpmById(id) { return A._cpmById[id] || null; },
    cpmLesson(bookId, lessonId) {
      const b = A.cpmById(bookId);
      if (!b) return null;
      for (const ch of b.chapters) { const l = ch.lessons.find(x => x.id === lessonId); if (l) return { book: b, chapter: ch, lesson: l }; }
      return null;
    },
    /** the skills a chapter or lesson practises, existing ones only, no repeats */
    cpmSkills(lessons) {
      const out = [];
      lessons.forEach(l => l.skills.forEach(id => { if (A.skills[id] && !out.includes(id)) out.push(id); }));
      return out;
    },
    courseById(id) { return A._byId[id] || null; },
    unitById(courseId, unitId) { const c = A.courseById(courseId); return c ? c.units.find(u => u.id === unitId) || null : null; },
    whereIs(skillId) { return A._where[skillId] || null; },
    courseSkills(course) { return course.units.flatMap(u => u.skills); },
    subjects() {
      const seen = [];
      A.courses.forEach(c => { if (!seen.includes(c.subject)) seen.push(c.subject); });
      return seen;
    },
    /** every skill that is registered but not placed, and every placed skill that is not registered */
    orphans() {
      const unplaced = Object.keys(A.skills).filter(id => !A._where[id]);
      const missing = Object.keys(A._where).filter(id => !A.skills[id]);
      return { unplaced, missing };
    },

    /** a "<" followed by a space, or a ">" after one, is an inequality sign, not a tag: make it an entity */
    fixAngles(html) {
      if (typeof html !== 'string') return html;
      html = html.replace(/<(?=\s)/g, '&lt;').replace(/(?<=\s)>(?=\s|$)/g, '&gt;');
      // inside a drawing, <i>/<b> would end the <svg> early: use the SVG way of saying italic and bold
      return html.replace(/<svg[\s\S]*?<\/svg>/g, svg => svg
        .replace(/<i>([\s\S]*?)<\/i>/g, '<tspan font-style="italic">$1</tspan>')
        .replace(/<b>([\s\S]*?)<\/b>/g, '<tspan font-weight="700">$1</tspan>'));
    },

    /** Challenge questions: a skill can have a challenge(rng) maker beside make(rng), with the same return shape,
        for a harder version that still passes its verify(). A seed marked with challengeSeed() builds the question
        with it (and with make() where a skill has none), so a challenge question rebuilds the same from its seed
        anywhere: in Review, in a printed set, in a mistake shown to a parent. */
    CHALLENGE: 'challenge:',
    challengeSeed(seed) { return A.CHALLENGE + seed; },
    isChallengeSeed(seed) { return typeof seed === 'string' && seed.startsWith(A.CHALLENGE); },
    hasChallenge(skillId) { const def = A.skills[skillId]; return !!def && typeof def.challenge === 'function'; },

    /** Build the question for (skill, seed). Throws if the generator returned something malformed. */
    question(skillId, seed) {
      const def = A.skills[skillId];
      if (!def) throw new Error('no skill ' + skillId);
      const rng = RNG.make(skillId + ':' + seed);
      const hard = A.isChallengeSeed(seed) && typeof def.challenge === 'function';
      const q = hard ? def.challenge(rng) : def.make(rng);
      if (!q || typeof q !== 'object') throw new Error(skillId + (hard ? ': challenge()' : ': make()') + ' returned nothing');
      q.prompt = A.fixAngles(q.prompt);
      if (Array.isArray(q.hints)) q.hints = q.hints.map(A.fixAngles);
      if (Array.isArray(q.choices)) q.choices = q.choices.map(A.fixAngles);
      if (q.type === 'choice') q.answer = A.fixAngles(q.answer);
      if (typeof q.prompt !== 'string' || !q.prompt.trim()) throw new Error(skillId + ': prompt missing');
      if (!TYPES.includes(q.type)) throw new Error(skillId + ': bad type ' + q.type);
      if (!Array.isArray(q.hints) || !q.hints.length || q.hints.some(h => typeof h !== 'string' || !h.trim())) throw new Error(skillId + ': hints must be a non-empty list of strings');
      if (q.type === 'number') {
        if (typeof q.answer !== 'number' || !isFinite(q.answer)) throw new Error(skillId + ': number answer must be a finite number');
      } else if (q.type === 'text') {
        if (typeof q.answer !== 'string' || !q.answer.trim()) throw new Error(skillId + ': text answer missing');
        if (q.accept && !Array.isArray(q.accept)) throw new Error(skillId + ': accept must be a list');
      } else {
        if (!Array.isArray(q.choices) || q.choices.length < 2) throw new Error(skillId + ': choices need at least two options');
        if (q.choices.some(c => typeof c !== 'string' || !c.trim())) throw new Error(skillId + ': every choice must be a non-empty string');
        const hits = q.choices.filter(c => c === q.answer).length;
        if (hits !== 1) throw new Error(skillId + `: the answer must appear exactly once among the choices (found ${hits})`);
        const keys = q.choices.map(c => A.normText(A.stripTags(c)));
        if (new Set(keys).size !== keys.length) throw new Error(skillId + ': two choices read the same: ' + keys.join(' | '));
        if (!q.keepOrder) q.choices = rng.shuffle(q.choices);
        q.answerIndex = q.choices.indexOf(q.answer);
      }
      q.skillId = skillId;
      q.seed = seed;
      return q;
    },

    stripTags(html) { return String(html).replace(/<[^>]*>/g, ' '); },

    /** "1 1/2", "-3/4", "0.75", "75%", "$3.50", "1,250", "−2" → a number, or NaN */
    parseNumber(str) {
      if (typeof str === 'number') return str;
      let s = String(str || '').trim().replace(/−/g, '-').replace(/,/g, '').replace(/[$%°]/g, '').replace(/\s+/g, ' ');
      if (!s) return NaN;
      let m = s.match(/^(-?)(\d+) (\d+)\/(\d+)$/);            // mixed number
      if (m) { const w = Number(m[2]), nu = Number(m[3]), d = Number(m[4]); if (!d) return NaN; return (m[1] ? -1 : 1) * (w + nu / d); }
      m = s.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);  // fraction
      if (m) { const d = Number(m[2]); if (!d) return NaN; return Number(m[1]) / d; }
      if (/^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(s)) return Number(s);
      return NaN;
    },
    /** lower-case, trimmed, accents and punctuation dropped: "¿Cómo estás?" → "como estas" */
    normText(str) {
      return String(str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[¿¡?!.,;:"“”‘’'()]/g, ' ').replace(/\s+/g, ' ').trim();
    },
    /** does `input` answer question `q`? */
    check(q, input) {
      if (q.type === 'number') {
        const val = A.parseNumber(input);
        if (isNaN(val)) return { correct: false, value: NaN, unreadable: true };
        const tol = q.tolerance != null ? q.tolerance : 1e-9 * Math.max(1, Math.abs(q.answer));
        return { correct: Math.abs(val - q.answer) <= tol, value: val };
      }
      if (q.type === 'text') {
        const got = A.normText(input);
        const ok = [q.answer].concat(q.accept || []).some(a => A.normText(a) === got);
        return { correct: ok && got.length > 0, value: got };
      }
      const idx = typeof input === 'number' ? input : q.choices.indexOf(input);
      return { correct: idx === q.answerIndex, value: idx };
    },
    /** the answer, as text a learner could type */
    answerText(q) {
      if (q.type === 'number') {
        if (q.answerText != null) return String(q.answerText);
        if (q.unit === '$' && typeof M !== 'undefined') return M.money(q.answer);
        return (typeof M !== 'undefined' ? M.n(q.answer) : String(q.answer)) + (q.unit ? ' ' + q.unit : '');
      }
      return q.answer;
    },
  };

  if (typeof module !== 'undefined') module.exports = A;
  if (typeof window !== 'undefined') window.ACADEMY = A;
})();
