/* Music theory for piano learners. Reading notes on the treble and bass staffs (with ledger lines and middle C),
   the piano keyboard, half and whole steps, note values, measures and time signatures, major scales and key
   signatures, relative and harmonic minor keys, intervals (number and quality), triads and chord names, the
   primary chords, and the common Italian terms for tempo and dynamics. US names throughout: quarter note,
   measure, half step. Staffs, notes, rests and the keyboard are drawn as SVG. The sharp, flat and natural signs
   are made with String.fromCharCode: they are music notation, but they share a Unicode block with
   pictographs that tests/formal.js rules out. verify() checks each answer a second way: note names from
   hand-written tables of the lines and spaces, pitches by counting piano keys, scales and keys from
   key-signature tables, and terms from a glossary kept apart from the generators. Lessons link to the note
   flashcards and the metronome (lib/piano.js), and a Play button there sounds a scale, an interval or a chord. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const p = (s, fig) => `<p>${s}${fig || ''}</p>`;          // a figure goes inside its paragraph: the lesson's summary then reads the words, not the drawing's labels
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const key = s => A.normText(A.stripTags(s));
  /** the answer plus up to n − 1 distractors that read differently from it and from each other */
  function options(answer, cands, n) {
    const out = [answer], seen = new Set([key(answer)]);
    for (const c of cands) { if (out.length >= (n || 4)) break; if (c == null) continue; const k = key(c); if (!seen.has(k)) { seen.add(k); out.push(c); } }
    return out;
  }
  /** a Play button (lib/piano.js sounds it): notes as MIDI numbers, together (chord) or one after another */
  const play = (midis, label, together) => `<button type="button" class="btn ghost sm mus-play" data-midi="${midis.join(',')}"${together ? ' data-together="1"' : ''}>${label || 'Play'}</button>`;

  /* ---------- notes: { L: letter 0–6 (C to B), acc: −1 flat, 0, +1 sharp, oct } ---------- */
  const LET = ['C', 'D', 'E', 'F', 'G', 'A', 'B'], NAT = [0, 2, 4, 5, 7, 9, 11];
  const SH = String.fromCharCode(0x266F), FL = String.fromCharCode(0x266D);          // the sharp and flat signs
  const ODD = ['E' + SH, 'B' + SH, 'F' + FL, 'C' + FL];             // right in some keys, but not names a beginner meets: kept out of questions
  const accTxt = a => (a === 1 ? SH : a === -1 ? FL : '');
  const note = (L, acc, oct) => ({ L, acc: acc || 0, oct });
  const nm = n => LET[n.L] + accTxt(n.acc);
  const dn = n => n.oct * 7 + n.L;                                   // counts letters: one step per line or space
  const midi = n => 12 * (n.oct + 1) + NAT[n.L] + n.acc;
  const pcOf = n => ((midi(n) % 12) + 12) % 12;
  /** 'F#4', 'Bb3', 'C4' → a note */
  function parse(s) { const m = /^([A-G])([#b]?)(-?\d)$/.exec(s); return note(LET.indexOf(m[1]), m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0, Number(m[3])); }
  /** a key or note id ('Bb', 'F#') as it's printed, with the sharp or flat sign */
  const disp = s => String(s).replace(/^([A-G])#/, '$1' + SH).replace(/^([A-G])b/, '$1' + FL);
  const idOf = n => LET[n.L] + (n.acc === 1 ? '#' : n.acc === -1 ? 'b' : '');
  /** the note `letters` letter names above n and `semis` half steps above it; null if it would need a double sharp or flat */
  function above(n, letters, semis) {
    const d = dn(n) + letters, L = ((d % 7) + 7) % 7, oct = Math.floor(d / 7);
    const acc = midi(n) + semis - (12 * (oct + 1) + NAT[L]);
    return acc >= -1 && acc <= 1 ? note(L, acc, oct) : null;
  }
  const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11, 12];
  const majorScale = tonic => MAJOR_STEPS.map((s, i) => above(tonic, i, s));
  // the major keys used here, with up to four sharps or flats, and the octave their scale starts in on the treble staff
  const KEYS = ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab'];
  const tonicOf = k => parse(k + (['A', 'Ab', 'B', 'Bb'].includes(k) ? '3' : '4'));
  const ORD = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
  const DEG_NAME = ['', 'tonic', 'supertonic', 'mediant', 'subdominant', 'dominant', 'submediant', 'leading tone', 'tonic'];

  /* ---------- tables written out by hand, for verify(): never computed by the code above ---------- */
  const TREBLE_READ = 'FGABCDEFGABCDEFGABCD';       // the treble staff, from F3 (three lines below… p = −6) up to D6 (p = 13)
  const BASS_READ = 'ABCDEFGABCDEFGABCDEF';         // the bass staff, from A1 (p = −6) up to F4 (p = 13)
  const KEYSIG = { C: [], G: ['F#'], D: ['F#', 'C#'], A: ['F#', 'C#', 'G#'], E: ['F#', 'C#', 'G#', 'D#'], F: ['Bb'], Bb: ['Bb', 'Eb'], Eb: ['Bb', 'Eb', 'Ab'], Ab: ['Bb', 'Eb', 'Ab', 'Db'] };
  const REL_MINOR = { C: 'A', G: 'E', D: 'B', A: 'F#', E: 'C#', F: 'D', Bb: 'G', Eb: 'C', Ab: 'F' };
  const KEY_NAMES = ['C', 'C# or Db', 'D', 'D# or Eb', 'E', 'F', 'F# or Gb', 'G', 'G# or Ab', 'A', 'A# or Bb', 'B'];
  const PC_OF = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  /** a pitch number from a note's name and octave, read the plain way: letter, then sharp or flat */
  const pitch = (id, oct) => 12 * (oct + 1) + PC_OF[id[0]] + (id[1] === '#' ? 1 : id[1] === 'b' ? -1 : 0);
  /** a spelled note in a key: its letter, with the key signature's sharp or flat on that letter */
  const inKey = (k, letter) => { const hit = KEYSIG[k].find(s => s[0] === letter); return hit || letter; };

  /* ---------- drawing: a five-line staff ---------- */
  const yOf = q => 80 - 5 * q;                      // q counts lines and spaces up from the bottom line (y = 80); the top line is q = 8 (y = 40)
  const BASE = { treble: 30, bass: 18 };            // the bottom line: E4 on the treble staff, G2 on the bass staff
  const posOf = (n, clef) => dn(n) - BASE[clef];
  const CLEF = {
    treble: '<g transform="translate(2 10)" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 62c-4-1-5-6 0-8c6-2 11 3 9 9c-2 6-12 7-16 1c-4-7 2-15 10-21c6-5 9-12 6-18c-2-4-6-2-7 3l8 50c1 5-2 8-6 7"/><circle cx="22" cy="83" r="2.8" fill="currentColor" stroke="none"/></g>',
    bass: '<g transform="translate(2 10)"><path d="M12 41C12 30 30 27 31 40C32 55 20 66 8 72" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="13" cy="40" r="3.8" fill="currentColor"/><circle cx="37" cy="35" r="2.1" fill="currentColor"/><circle cx="37" cy="45" r="2.1" fill="currentColor"/></g>',
  };
  const sharpAt = (x, y) => `<path d="M${x - 2.2} ${y - 9}v17M${x + 2.2} ${y - 10}v17" stroke="currentColor" stroke-width="1.3"/><path d="M${x - 4.6} ${y - 1.6}L${x + 4.6} ${y - 4.4}M${x - 4.6} ${y + 4.4}L${x + 4.6} ${y + 1.6}" stroke="currentColor" stroke-width="2.4"/>`;
  const flatAt = (x, y) => `<path d="M${x - 3} ${y - 13}V${y + 4.5}" stroke="currentColor" stroke-width="1.4"/><path d="M${x - 3} ${y + 4.5}C${x + 1} ${y + 2} ${x + 6} ${y - 1.5} ${x + 3.5} ${y - 4}C${x + 1.5} ${y - 6} ${x - 1.5} ${y - 3.5} ${x - 3} ${y - 1.5}" fill="none" stroke="currentColor" stroke-width="1.8"/>`;
  const ACC_AT = { 1: sharpAt, '-1': flatAt };
  // where each sharp and flat of a key signature sits, in order (q from the bottom line)
  const SIG_POS = { treble: { sharp: [8, 5, 9, 6, 3, 7, 4], flat: [4, 7, 3, 6, 2, 5, 1] }, bass: { sharp: [6, 3, 7, 4, 1, 5, 2], flat: [2, 5, 1, 4, 0, 3, -1] } };
  const wholeAt = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="6.6" ry="4.6" fill="none" stroke="currentColor" stroke-width="2.4"/>`;
  function ledgers(x, q) {
    let s = '';
    for (let k = -2; k >= q; k -= 2) s += `<path d="M${x - 11} ${yOf(k)}h22" stroke="currentColor" stroke-width="1.4"/>`;
    for (let k = 10; k <= q; k += 2) s += `<path d="M${x - 11} ${yOf(k)}h22" stroke="currentColor" stroke-width="1.4"/>`;
    return s;
  }
  /** a staff: o = { clef, notes: [note or [chord notes]], key: { n, kind }, time: [top, bottom], labels: [text], gap, w, label } */
  function staff(o) {
    const clef = o.clef || 'treble', groups = (o.notes || []).map(g => (Array.isArray(g) ? g : [g]));
    let x = 46, body = '', lo = 0, hi = 8;
    if (o.key && o.key.n) {
      const pos = SIG_POS[clef][o.key.kind];
      for (let i = 0; i < o.key.n; i++) { body += (o.key.kind === 'sharp' ? sharpAt : flatAt)(x + 4 + i * 10, yOf(pos[i])); lo = Math.min(lo, pos[i] - 2); hi = Math.max(hi, pos[i] + 2); }
      x += o.key.n * 10 + 6;
    }
    if (o.time) { body += `<text x="${x + 10}" y="58" text-anchor="middle" font-size="22" font-weight="800">${o.time[0]}</text><text x="${x + 10}" y="78" text-anchor="middle" font-size="22" font-weight="800">${o.time[1]}</text>`; x += 26; }
    const gap = o.gap || 48;
    if (groups[0]) x += Math.max(0, groups[0].filter(n => n.acc).length - 1) * 10;          // room for a chord's stacked sharps or flats
    groups.forEach((g, i) => {
      const cx = x + 30 + i * gap, qs = g.map(n => posOf(n, clef));
      let shift = 0, lastQ = null;
      g.map((n, j) => [n, qs[j]]).sort((a, b) => b[1] - a[1]).forEach(([n, q]) => {
        const mark = n.acc || null;
        if (mark != null) { shift = lastQ != null && lastQ - q < 6 ? shift + 10 : 0; lastQ = q; body += ACC_AT[mark](cx - 16 - shift, yOf(q)); }
      });
      body += qs.map(q => ledgers(cx, q)).join('') + qs.map(q => wholeAt(cx, yOf(q))).join('');
      qs.forEach(q => { lo = Math.min(lo, q); hi = Math.max(hi, q); });
      if (o.labels && o.labels[i] != null) body += `<text x="${cx}" y="LABEL_Y" text-anchor="middle" font-size="14" font-weight="700">${o.labels[i]}</text>`;
    });
    const W = Math.max(o.w || 0, x + 30 + Math.max(0, groups.length - 1) * gap + 34);
    const top = Math.min(24, yOf(hi) - 12), labelY = Math.max(104, yOf(lo) + 24), bottom = o.labels ? labelY + 8 : Math.max(102, yOf(lo) + 12);
    let lines = '';
    for (let k = 0; k <= 8; k += 2) lines += `<path d="M2 ${yOf(k)}H${W - 2}" stroke="currentColor" stroke-width="1.2" opacity=".75"/>`;
    lines += `<path d="M${W - 2} 40V80" stroke="currentColor" stroke-width="1.6"/>`;
    return `<svg class="figure mus-staff" viewBox="0 ${top} ${W} ${bottom - top}" width="${Math.round(W * 1.5)}" role="img" aria-label="${o.label || 'music staff'}">${lines}${CLEF[clef]}${body.replace(/LABEL_Y/g, labelY)}</svg>`;
  }

  /* ---------- drawing: rhythms on a one-line staff ---------- */
  const DUR = { whole: 4, 'dotted half': 3, half: 2, 'dotted quarter': 1.5, quarter: 1, 'dotted eighth': 0.75, eighth: 0.5, sixteenth: 0.25, 'whole rest': 4, 'half rest': 2, 'quarter rest': 1, 'eighth rest': 0.5 };
  function glyph(kind, x) {
    const y = 60, rest = /rest/.test(kind), base = kind.replace(/^dotted /, '').replace(/ rest$/, '');
    if (rest) {
      if (base === 'whole') return `<rect x="${x - 7}" y="${y}" width="14" height="6" fill="currentColor"/>`;
      if (base === 'half') return `<rect x="${x - 7}" y="${y - 6}" width="14" height="6" fill="currentColor"/>`;
      if (base === 'quarter') return `<path d="M${x - 3} ${y - 16}l6 7l-5 6l6 7c-5-2-8 0-5 5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>`;
      return `<circle cx="${x - 3}" cy="${y - 8}" r="2.8" fill="currentColor"/><path d="M${x - 3} ${y - 6}c3 1 6 0 8-3l-6 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`;
    }
    const open = base === 'whole' || base === 'half';
    let s = `<ellipse cx="${x}" cy="${y}" rx="6.4" ry="4.5" transform="rotate(-20 ${x} ${y})" ${open ? 'fill="none" stroke="currentColor" stroke-width="2.2"' : 'fill="currentColor"'}/>`;
    if (base !== 'whole') s += `<path d="M${x + 5.6} ${y - 1.5}V${y - 32}" stroke="currentColor" stroke-width="1.6"/>`;
    if (base === 'eighth' || base === 'sixteenth') s += `<path d="M${x + 5.6} ${y - 32}c1 6 9 8 7 17" fill="none" stroke="currentColor" stroke-width="2"/>`;
    if (base === 'sixteenth') s += `<path d="M${x + 5.6} ${y - 25}c1 6 9 8 7 17" fill="none" stroke="currentColor" stroke-width="2"/>`;
    if (/^dotted/.test(kind)) s += `<circle cx="${x + 12}" cy="${y - 3}" r="2.2" fill="currentColor"/>`;
    return s;
  }
  /** a measure (or a single note) on a one-line staff: o = { items: [kind], time: [top, bottom], missing, label } */
  function rhythm(o) {
    let x = o.time ? 44 : 22, body = '';
    if (o.time) body += `<text x="20" y="57" text-anchor="middle" font-size="21" font-weight="800">${o.time[0]}</text><text x="20" y="80" text-anchor="middle" font-size="21" font-weight="800">${o.time[1]}</text>`;
    o.items.forEach(k => { x += 8; body += glyph(k, x); x += 26 + 7 * Math.min(DUR[k], 3); });
    if (o.missing) { x += 6; body += `<rect x="${x - 10}" y="40" width="22" height="34" rx="5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="4 3"/><text x="${x + 1}" y="64" text-anchor="middle" font-size="18" font-weight="700">?</text>`; x += 30; }
    const W = x + (o.bar === false ? 6 : 10);
    const bar = o.bar === false ? '' : `<path d="M${W - 3} 46V74" stroke="currentColor" stroke-width="1.8"/>`;
    const said = o.items.map(k => (/rest/.test(k) ? k : k + ' note')).join(', ') + (o.missing ? ', then a missing note' : '');          // for screen readers
    return `<svg class="figure mus-rhythm" viewBox="0 20 ${W} 68" width="${Math.round(W * 1.35)}" role="img" aria-label="${o.label ? o.label + ': ' : ''}${said}"><desc>${said}</desc><path d="M2 60H${W - 3}" stroke="currentColor" stroke-width="1.3" opacity=".75"/>${bar}${body}</svg>`;
  }

  /* ---------- drawing: a piano keyboard (real key colors in every theme; marked keys in blue) ---------- */
  const BLACK = [1, 3, 6, 8, 10];
  function keyboard(o) {
    const from = o.from || 48, to = from + 12 * (o.octaves || 2), marks = o.marks || [], WK = 22, WH = 92, BK = 14, BH = 58;
    const whites = [], blacks = [];
    let wi = 0;
    for (let m = from; m <= to; m++) { if (BLACK.includes(m % 12)) blacks.push({ m, x: wi * WK - BK / 2 }); else { whites.push({ m, x: wi * WK }); wi++; } }
    const W = wi * WK + 2, on = m => marks.includes(m);
    const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="4" fill="#ffffff" stroke="#1d2027" stroke-width="1.2"/>`;
    let s = whites.map(k => `<rect x="${k.x + 1}" y="1" width="${WK}" height="${WH}" rx="3" fill="${on(k.m) ? 'var(--primary)' : '#ffffff'}" stroke="#5b616e" stroke-width="1.2"/>${on(k.m) ? dot(k.x + 1 + WK / 2, WH - 12) : ''}`).join('');
    s += blacks.map(k => `<rect x="${k.x + 1}" y="1" width="${BK}" height="${BH}" rx="2" fill="${on(k.m) ? 'var(--primary)' : '#23262d'}" stroke="#23262d" stroke-width="1"/>${on(k.m) ? dot(k.x + 1 + BK / 2, BH - 10) : ''}`).join('');
    const lab = o.labels ? whites.map(k => `<text x="${k.x + 1 + WK / 2}" y="${WH + 16}" text-anchor="middle" font-size="12" font-weight="${k.m === 60 ? 800 : 600}">${LET[NAT.indexOf(k.m % 12)]}</text>`).join('') : '';
    const mid = o.middleC && whites.some(k => k.m === 60) ? `<text x="${whites.find(k => k.m === 60).x + 1 + WK / 2}" y="${WH + (o.labels ? 30 : 16)}" text-anchor="middle" font-size="11">middle C</text>` : '';
    const H = WH + 4 + (o.labels ? 14 : 0) + (o.middleC ? 14 : 0);
    return `<svg class="figure mus-keys" viewBox="0 0 ${W + 1} ${H}" width="${Math.min(W + 1, 360)}" role="img" aria-label="${o.label || 'piano keyboard'}">${s}${lab}${mid}</svg>`;
  }

  const COURSE = {
    id: 'music-theory', title: 'Music theory for piano', subject: 'Middle school', area: 'music', added: '2026-11-12', grade: 6, icon: 'Mus', hue: 300,
    blurb: 'Reading notes on the treble and bass staffs, the piano keyboard, rhythm and time signatures, scales and key signatures, intervals, chords, and the Italian words on a piano score. For piano learners of any age; listed at grade 6.',
    units: [
      { id: 'reading', title: 'Reading notes', blurb: 'The lines and spaces of the treble and bass staffs, middle C, and ledger lines.', skills: ['mus.treble-notes', 'mus.bass-notes', 'mus.ledger-notes'] },
      { id: 'keyboard', title: 'The keyboard and half steps', blurb: 'Naming the white and black keys, sharps and flats, and half and whole steps.', skills: ['mus.keyboard', 'mus.steps'] },
      { id: 'rhythm', title: 'Rhythm and time signatures', blurb: 'Note and rest values, dotted notes, counting beats in a measure, and what a time signature says.', skills: ['mus.note-values', 'mus.measures', 'mus.time-signatures'] },
      { id: 'scales', title: 'Scales and key signatures', blurb: 'The major scale pattern, key signatures with up to four sharps or flats, and relative and harmonic minor keys.', skills: ['mus.major-scales', 'mus.key-signatures', 'mus.minor-keys'] },
      { id: 'intervals', title: 'Intervals', blurb: 'Counting an interval’s number, then naming it major, minor or perfect by its half steps.', skills: ['mus.interval-numbers', 'mus.interval-quality'] },
      { id: 'chords', title: 'Chords', blurb: 'Building major and minor triads, naming a chord from its notes, and the primary chords I, IV and V.', skills: ['mus.triads', 'mus.chord-names', 'mus.primary-chords'] },
      { id: 'terms', title: 'Words and signs on the score', blurb: 'Italian words for tempo, and the signs for dynamics and articulation.', skills: ['mus.tempo-terms', 'mus.dynamics'] },
    ],
  };
  A.course(COURSE);

  /* ---------- Unit 1: reading notes ---------- */
  const cardsLink = p(`<a href="#/piano/cards">Practice with note flashcards</a>: a note appears on the staff and you tap its name. The ones you miss come back more often.`);
  const WORDS = ['BAG', 'BED', 'CAB', 'DAB', 'DAD', 'EGG', 'FED', 'GAB', 'ACE', 'AGE', 'BEE', 'ADD', 'FAD', 'BEG', 'CAGE', 'FACE', 'BEAD', 'DEAF', 'FADE', 'CAFE', 'FEED', 'BEEF', 'DEED', 'EDGE', 'BABE', 'BADGE', 'FADED', 'ADDED', 'DECADE', 'BAGGED', 'DEFACE', 'BEADED', 'CABBAGE', 'BAGGAGE'];
  /** read a note on a staff from the hand-written tables */
  const readAt = (clef, q) => (clef === 'treble' ? TREBLE_READ : BASS_READ)[q + 6];
  function nameNote(rng, clef, qs) {
    const q = rng.pick(qs), n = (() => { const d = BASE[clef] + q; return note(d % 7, 0, Math.floor(d / 7)); })();
    const other = clef === 'treble' ? 'bass' : 'treble', misread = LET[(BASE[other] + q) % 7];
    const ans = LET[n.L];
    const lineOrSpace = q % 2 === 0 ? `a line (the ${M.ordinal(q / 2 + 1)} line up)` : q > 8 ? 'the space above the staff' : q < 0 ? 'the space below the staff' : `a space (the ${M.ordinal((q + 1) / 2)} space up)`;
    const isLedger = q <= -2 || q >= 10;
    const landmark = clef === 'treble' ? 'The treble clef curls around the G line (the 2nd line). Lines from the bottom: E, G, B, D, F; spaces: F, A, C, E.' : 'The two dots of the bass clef sit around the F line (the 4th line). Lines from the bottom: G, B, D, F, A; spaces: A, C, E, G.';
    return { prompt: `Name this note on the ${clef} staff.${staff({ clef, notes: [n], label: `a note on the ${clef} staff` })}`, type: 'choice', answer: ans, choices: options(ans, [LET[(n.L + 1) % 7], LET[(n.L + 6) % 7], misread, LET[(n.L + 2) % 7], LET[(n.L + 5) % 7]]),
      params: { clef, q, kind: 'one' },
      hints: [isLedger ? `Count the ledger lines: each line and each space is the next letter. ${clef === 'treble' ? 'One ledger line below the treble staff is middle C.' : 'One ledger line above the bass staff is middle C.'}` : `The note is on ${lineOrSpace}.`, landmark, `The note is <b>${ans}</b>.`] };
  }
  function spellWord(rng, clef) {
    const word = rng.pick(WORDS), lo = clef === 'treble' ? 30 : 18;
    // each letter on the staff, at the lowest place it fits between the bottom line and the space above the top line
    const qs = word.split('').map(ch => { const L = LET.indexOf(ch); let d = lo + ((L - lo % 7) + 7) % 7; if (rng.bool() && d + 7 - lo <= 9) d += 7; return d - lo; });
    const notes = qs.map(q => { const d = BASE[clef] + q; return note(d % 7, 0, Math.floor(d / 7)); });
    const same = WORDS.filter(w => w.length === word.length && w !== word);
    return { prompt: `These notes on the ${clef} staff spell a word. What is it?${staff({ clef, notes, gap: 40, label: `${word.length} notes on the ${clef} staff` })}`, type: 'choice', answer: word, choices: options(word, rng.shuffle(same)), params: { clef, qs, kind: 'word' },
      hints: [`Name each note in turn, from left to right.`, clef === 'treble' ? 'Treble lines: E, G, B, D, F. Treble spaces: F, A, C, E.' : 'Bass lines: G, B, D, F, A. Bass spaces: A, C, E, G.', `The notes are ${word.split('').join(', ')}, which spell <b>${word}</b>.`] };
  }
  const verifyRead = q => {
    const { clef, q: pos, qs, kind } = q.params;
    if (kind === 'word') return qs.map(x => readAt(clef, x)).join('') === q.answer;
    return readAt(clef, pos) === q.answer;
  };

  A.skill({
    id: 'mus.treble-notes', title: 'Notes on the treble staff',
    real: 'Reading the treble staff quickly is what lets a pianist play a new piece at sight, without working out each note.',
    mistakes: ['Reading a treble note with the bass staff’s names: the same place on the two staffs has different letters.', 'Counting a space as a line: a line goes through the middle of a note, a space sits between two lines.'],
    learn: p(`Music is written on a <b>staff</b> of five lines and the four spaces between them. Notes higher on the staff sound higher. Each line and each space is the next letter of the music alphabet, which runs <b>A B C D E F G</b> and then starts again.`) +
      p(`The <b>treble clef</b> (or G clef) curls around the second line from the bottom, which is <b>G</b>. The right hand usually reads the treble staff. <b>Lines, from the bottom: E, G, B, D, F</b> (“Every Good Boy Does Fine”). <b>Spaces: F, A, C, E</b>, which spell FACE.`, staff({ clef: 'treble', notes: ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'].map(parse), labels: ['E', 'F', 'G', 'A', 'B', 'C', 'D', 'E', 'F'], gap: 30, label: 'the treble staff, E to F, with each note named' })) +
      example('Example', `A note sitting on the middle line of the treble staff is on the 3rd line: E, G, <b>B</b>. A note in the top space is the 4th space of FACE: <b>E</b>.`) + cardsLink,
    make(rng) { return rng.chance(0.25) ? spellWord(rng, 'treble') : nameNote(rng, 'treble', [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); },
    verify: verifyRead,
  });

  A.skill({
    id: 'mus.bass-notes', title: 'Notes on the bass staff',
    real: 'The left hand’s part in most piano music is on the bass staff: the low notes, chords and accompaniments.',
    mistakes: ['Using the treble names on the bass staff: the bottom line of the bass staff is G, not E.', 'Losing your place: find the F line between the two dots of the clef, and count from there.'],
    learn: p(`The <b>bass clef</b> (or F clef) shows lower notes, usually played by the left hand. Its two dots sit on either side of the fourth line from the bottom, which is <b>F</b>.`) +
      p(`<b>Bass lines, from the bottom: G, B, D, F, A</b> (“Good Boys Do Fine Always”). <b>Bass spaces: A, C, E, G</b> (“All Cows Eat Grass”). The bass staff is two letters off from the treble staff, so a note in the same place has a different name: don’t read one clef as the other.`, staff({ clef: 'bass', notes: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3'].map(parse), labels: ['G', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A'], gap: 30, label: 'the bass staff, G to A, with each note named' })) +
      example('Example', `A note on the bottom line of the bass staff is <b>G</b>, while the bottom line of the treble staff is E. A note in the 2nd space of the bass staff is <b>C</b> (A, C, E, G).`) + cardsLink,
    make(rng) { return rng.chance(0.25) ? spellWord(rng, 'bass') : nameNote(rng, 'bass', [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); },
    verify: verifyRead,
  });

  A.skill({
    id: 'mus.ledger-notes', title: 'Middle C and ledger lines',
    real: 'High melodies, low bass notes, and every piece where the hands pass middle C use ledger lines.',
    mistakes: ['Skipping a space between ledger lines: each line and each space is the next letter.', 'Thinking middle C is two different notes: below the treble staff and above the bass staff, it’s the same key.'],
    learn: p(`Notes above or below the staff get short extra lines called <b>ledger lines</b>. Keep counting letters through them, one letter for each line and each space.`) +
      p(`<b>Middle C</b> is the C near the middle of the piano. It sits on <b>one ledger line below the treble staff</b>, and on <b>one ledger line above the bass staff</b>: it’s the same key either way. The treble and bass staffs joined by a brace make the <b>grand staff</b> that piano music uses.`, `<span class="mus-pair">${staff({ clef: 'treble', notes: ['C4', 'B3', 'A3'].map(parse), labels: ['C', 'B', 'A'], gap: 36, label: 'middle C, B and A below the treble staff' })}${staff({ clef: 'bass', notes: ['C4', 'D4', 'E4'].map(parse), labels: ['C', 'D', 'E'], gap: 36, label: 'middle C, D and E above the bass staff' })}</span>`) +
      example('Example', `Above the treble staff: the space above the top line is G, the first ledger line is <b>A</b>, the space above it is B, and the second ledger line is <b>C</b> (two octaves above middle C).`),
    make(rng) {
      const clef = rng.pick(['treble', 'bass']);
      return nameNote(rng, clef, clef === 'treble' ? [-6, -5, -4, -3, -2, 10, 11, 12, 13] : [-4, -3, -2, 10, 11, 12, 13]);
    },
    verify: verifyRead,
  });

  /* ---------- Unit 2: the keyboard, sharps and flats, half and whole steps ---------- */
  const keyName = m => { const k = KEY_NAMES[m % 12]; return disp(k.split(' or ')[0]) + (k.includes(' or ') ? ` or ${disp(k.split(' or ')[1])}` : ''); };
  A.skill({
    id: 'mus.keyboard', title: 'Naming keys on the piano',
    real: 'Finding any key at once by the groups of black keys is where every scale and chord on the piano starts.',
    mistakes: ['Mixing up the groups: C is just left of the two black keys, F just left of the three.', 'Forgetting that a black key has two names: the sharp of the key below it and the flat of the key above it.'],
    learn: p(`The black keys come in <b>groups of two and three</b>. <b>C is the white key just left of each group of two</b>, and F is just left of each group of three. From C, the white keys go C, D, E, F, G, A, B, then C again an <b>octave</b> higher.`) +
      p(`A black key is named from the white keys beside it. A <b>sharp (${SH})</b> means one key higher, so the black key just right of C is C${SH}. A <b>flat (${FL})</b> means one key lower, so the same key is also D${FL}. Two names for one key are called <b>enharmonic</b>.`, keyboard({ from: 48, octaves: 2, labels: true, middleC: true, label: 'two octaves of a piano keyboard with the white keys named' })) +
      example('Example', `The black key between F and G is <b>F${SH} or G${FL}</b>. E and F have no black key between them, and neither do B and C.`),
    make(rng) {
      const m = 48 + rng.int(0, 23), black = BLACK.includes(m % 12), ans = keyName(m);
      const near = [m - 1, m + 1, m - 2, m + 2, m + 12 - 5].map(x => keyName(((x % 12) + 12) % 12 + 48));
      const group = [1, 3].includes(m % 12) ? 'the group of two' : black ? 'the group of three' : '';
      return { prompt: `What is the name of the marked key?${keyboard({ from: 48, octaves: 2, marks: [m], label: 'a piano keyboard with one key marked' })}`, type: 'choice', answer: ans, choices: options(ans, rng.shuffle(near)), params: { m },
        hints: [black ? `It’s a black key in ${group}. Name the white keys beside it first.` : 'Find the nearest group of two black keys: C is just left of it.', black ? `A black key is the sharp of the white key to its left, and the flat of the white key to its right.` : `Count up the white keys from C: C, D, E, F, G, A, B.`, `The marked key is <b>${ans}</b>.`] };
    },
    verify(q) {
      // count white keys: 7 of every 12 keys are white, in the pattern C . D . E F . G . A . B
      const pattern = 'w b w b w w b w b w b w'.split(' '), pcv = q.params.m % 12;
      const whitesBefore = pattern.slice(0, pcv).filter(x => x === 'w').length;
      if (pattern[pcv] === 'w') return q.answer === 'CDEFGAB'[whitesBefore];
      const left = 'CDEFGAB'[whitesBefore - 1], right = 'CDEFGAB'[whitesBefore % 7];
      return q.answer === `${left}${SH} or ${right}${FL}`;
    },
  });

  A.skill({
    id: 'mus.steps', title: 'Half steps and whole steps',
    real: 'Scales, chords and key signatures are all built from half steps and whole steps.',
    mistakes: ['Forgetting that E–F and B–C are half steps, with no black key between them.', 'Counting the key you start on as the first step.'],
    learn: p(`A <b>half step</b> (also called a semitone) is the distance from one key to the very next key, black or white. A <b>whole step</b> is two half steps, with one key in between.`) +
      p(`Most white keys have a black key between them, so they are a whole step apart. <b>E–F and B–C are half steps</b>, because no black key sits between them. A sharp raises a note a half step; a flat lowers it a half step.`, keyboard({ from: 60, octaves: 1, marks: [64, 65], labels: true, label: 'E and F marked: a half step apart' })) +
      example('Example', `A whole step above E: E to F is only a half step, so go one key further: <b>F${SH}</b>. A half step below C is <b>B</b>.`),
    make(rng) {
      const t = rng.pick(['count', 'which', 'which', 'name']);
      if (t === 'count') {
        const a = 48 + rng.int(0, 14), b = a + rng.int(1, 9);
        return { prompt: `How many half steps is it from the lower marked key up to the higher one?${keyboard({ from: 48, octaves: 2, marks: [a, b], label: 'a piano keyboard with two keys marked' })}`, type: 'number', answer: b - a, params: { t, a, b },
          hints: ['Count every key, black and white, moving up from the lower key. Don’t count the key you start on.', `Each key you move is one half step: <b>${b - a}</b> half steps.`] };
      }
      if (t === 'which') {
        let a, b;
        do { a = parse(rng.pick(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'F#4', 'Bb4', 'Eb4', 'C#4'])); const size = rng.pick([1, 2, 2, 1, 3]); b = above(a, size === 3 ? 2 : 1, size); } while (!b || ODD.includes(nm(b)));
        const semis = midi(b) - midi(a), ans = semis === 1 ? 'A half step' : semis === 2 ? 'A whole step' : 'Neither';
        return { prompt: `Is it a half step or a whole step from ${nm(a)} up to ${nm(b)}?`, type: 'choice', keepOrder: true, answer: ans, choices: ['A half step', 'A whole step', 'Neither'], params: { t, a: idOf(a), ao: a.oct, b: idOf(b), bo: b.oct },
          hints: [`Picture the keyboard and count the keys from ${nm(a)} up to ${nm(b)}, black and white.`, `It’s ${M.plural(semis, 'half step')}${semis > 2 ? ', more than a whole step' : ''}: <b>${ans.toLowerCase()}</b>.`] };
      }
      const up = rng.bool(), size = rng.pick([1, 2]);
      // a half step from a white key is spelled with the next letter (C up to D-flat); asked mostly from E, B, F and C, it lands on a white key
      const a = parse(rng.pick(size === 2 ? ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'] : up ? ['E4', 'B4', 'E4', 'B4', 'D4', 'A4'] : ['F4', 'C4', 'F4', 'C4', 'G4', 'D4']));
      const b = up ? above(a, 1, size) : above(a, -1, -size);
      const ans = nm(b), wrongSize = up ? above(a, 1, 3 - size) : above(a, -1, -(3 - size));
      const cands = [wrongSize && nm(wrongSize), nm(note(b.L, b.acc ? 0 : up ? 1 : -1, b.oct)), nm(above(a, 0, 0)), LET[(a.L + (up ? 2 : 5)) % 7]].filter(c => c && c !== ans);
      return { prompt: `Which note is a ${size === 1 ? 'half step' : 'whole step'} ${up ? 'above' : 'below'} ${nm(a)}?`, type: 'choice', answer: ans, choices: options(ans, cands), params: { t: 'name', a: idOf(a), ao: a.oct, up, size },
        hints: [`Start on ${nm(a)} and move ${up ? 'up' : 'down'} ${size === 1 ? 'one key' : 'two keys'}, counting black keys too.`, ['E', 'B', 'F', 'C'].includes(LET[a.L]) ? 'Remember that E–F and B–C are only a half step apart.' : `Use the letter ${up ? 'after' : 'before'} ${LET[a.L]}, with a sharp or flat if you need one.`, `The note is <b>${ans}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'count') return q.answer === P.b - P.a;
      if (P.t === 'which') { const d = pitch(P.b, P.bo) - pitch(P.a, P.ao); return q.answer === (d === 1 ? 'A half step' : d === 2 ? 'A whole step' : 'Neither'); }
      // the named note must be the next letter (up or down) and the right number of half steps away
      const want = pitch(P.a, P.ao) + (P.up ? P.size : -P.size), id = q.answer.replace(SH, '#').replace(FL, 'b');
      const nextLetter = 'CDEFGAB'[('CDEFGAB'.indexOf(P.a[0]) + (P.up ? 1 : 6)) % 7];
      const oct = P.up ? (P.a[0] === 'B' ? P.ao + 1 : P.ao) : (P.a[0] === 'C' ? P.ao - 1 : P.ao);
      return id[0] === nextLetter && pitch(id, oct) === want;
    },
  });

  /* ---------- Unit 3: rhythm ---------- */
  // how long each note lasts, counted in quarter-note beats: the glossary verify() reads (apart from DUR, which draws)
  const BEATS = { 'whole note': 4, 'dotted half note': 3, 'half note': 2, 'dotted quarter note': 1.5, 'quarter note': 1, 'dotted eighth note': 0.75, 'eighth note': 0.5, 'sixteenth note': 0.25, 'whole rest': 4, 'half rest': 2, 'quarter rest': 1, 'eighth rest': 0.5 };
  const fullName = k => (/rest/.test(k) ? k : k + ' note');
  const beatsText = b => (b === 1 ? '1 beat' : `${M.n(b)} beats`);
  A.skill({
    id: 'mus.note-values', title: 'Note and rest values',
    real: 'Note values say how long to hold each key, so a melody’s rhythm comes out right.',
    mistakes: ['Forgetting the dot: it adds half the note’s own value.', 'Mixing up the half note (hollow, with a stem) and the whole note (hollow, with no stem).'],
    learn: p(`A note’s shape says how long it lasts. With the <b>quarter note</b> as one beat: a <b>whole note</b> lasts 4 beats, a <b>half note</b> 2, a quarter note 1, an <b>eighth note</b> ½ and a <b>sixteenth note</b> ¼. Each is half as long as the one before. Some piano books, especially British ones, call these the semibreve, minim, crotchet, quaver and semiquaver.`) +
      p(`<b>A dot adds half the note’s own value</b>: a dotted half note is 2 + 1 = 3 beats, and a dotted quarter note is 1 + ½ = 1½ beats. <b>Rests</b> are silences with the same values: the whole rest hangs below a line, the half rest sits on top of it.`, rhythm({ items: ['whole', 'half', 'quarter', 'eighth', 'sixteenth', 'dotted half', 'dotted quarter'], bar: false, label: 'a whole, half, quarter, eighth and sixteenth note, then a dotted half and a dotted quarter note' }) + rhythm({ items: ['whole rest', 'half rest', 'quarter rest', 'eighth rest'], bar: false, label: 'a whole, half, quarter and eighth rest' })) +
      example('Example', `How many eighth notes last as long as a dotted half note? A dotted half note is 3 beats and an eighth note is ½ beat, so 3 ÷ ½ = <b>6</b>.`),
    make(rng) {
      const t = rng.pick(['beats', 'beats', 'equal', 'which']);
      if (t === 'beats') {
        const k = rng.pick(['whole', 'dotted half', 'half', 'dotted quarter', 'quarter', 'eighth', 'sixteenth', 'whole rest', 'half rest', 'quarter rest', 'eighth rest']), b = DUR[k];
        return { prompt: `With a quarter note as one beat, how many beats does this ${/rest/.test(k) ? 'rest' : 'note'} last?${rhythm({ items: [k], bar: false, label: 'one ' + fullName(k) })}`, type: 'number', answer: b, params: { t, name: fullName(k) },
          hints: [`This is a ${fullName(k)}.`, /dotted/.test(k) ? `Without the dot it lasts ${beatsText(DUR[k.replace('dotted ', '')])}; the dot adds half of that.` : 'Whole = 4, half = 2, quarter = 1, eighth = ½, sixteenth = ¼.', `It lasts <b>${beatsText(b)}</b>.`] };
      }
      if (t === 'equal') {
        const big = rng.pick(['whole note', 'dotted half note', 'half note', 'dotted quarter note', 'quarter note']);
        const small = rng.pick(['quarter note', 'eighth note', 'sixteenth note'].filter(s => BEATS[s] < BEATS[big] && (BEATS[big] / BEATS[s]) % 1 === 0));
        const ans = BEATS[big] / BEATS[small];
        return { prompt: `How many ${small}s last as long as one ${big}?`, type: 'number', answer: ans, params: { t, big, small },
          hints: [`A ${big} lasts ${beatsText(BEATS[big])}; a ${small} lasts ${beatsText(BEATS[small])}.`, `${M.n(BEATS[big])} ÷ ${M.n(BEATS[small])} = <b>${ans}</b>.`] };
      }
      const pool = ['whole note', 'dotted half note', 'half note', 'dotted quarter note', 'quarter note', 'eighth note'];
      const ans = rng.pick(pool), b = BEATS[ans];
      return { prompt: `With a quarter note as one beat, which note lasts ${beatsText(b)}?`, type: 'choice', answer: ans, choices: options(ans, rng.shuffle(pool.filter(x => x !== ans))), params: { t, b },
        hints: ['Whole = 4 beats, half = 2, quarter = 1, eighth = ½. A dot adds half the note’s value.', `The <b>${ans}</b> lasts ${beatsText(b)}.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'beats') return q.answer === BEATS[P.name];
      if (P.t === 'equal') return Math.abs(q.answer * BEATS[P.small] - BEATS[P.big]) < 1e-9;
      return BEATS[q.answer] === P.b;
    },
  });

  /** notes that fill `total` beats, from the values a beginner reads */
  function fill(rng, total) {
    const out = [];
    let left = total;
    while (left > 1e-9) {
      const fits = ['whole', 'dotted half', 'half', 'dotted quarter', 'quarter', 'eighth', 'quarter rest', 'half rest'].filter(k => DUR[k] <= left + 1e-9 && !(k === 'whole' && total < 4) && !(k === 'dotted quarter' && left < 2));
      const k = rng.pick(fits);
      out.push(k); left -= DUR[k];
      if (k === 'dotted quarter') { out.push('eighth'); left -= 0.5; }          // a dotted quarter is followed by an eighth, as it usually is
      if (k === 'eighth' && left >= 0.5 && out.filter(x => x === 'eighth').length % 2) { out.push('eighth'); left -= 0.5; }
    }
    return out;
  }
  A.skill({
    id: 'mus.measures', title: 'Counting beats in a measure',
    real: 'Counting the beats in a measure keeps a piece steady, and it’s how to check a rhythm you’re unsure of.',
    mistakes: ['Counting a rest as nothing: rests take up beats too.', 'Counting an eighth note as a whole beat: two eighth notes make one beat.'],
    learn: p(`Bar lines divide music into <b>measures</b>. The time signature says how many beats fill each measure: <b>4/4</b> has four quarter-note beats, <b>3/4</b> three, and <b>2/4</b> two.`) +
      p(`To check a measure, <b>add up the beats of every note and rest</b> in it. The total must match the top number of the time signature (with a quarter note as the beat). Counting out loud helps: “1 and 2 and 3 and 4 and”, with eighth notes on the “and”.`, rhythm({ items: ['half', 'quarter', 'eighth', 'eighth'], time: [4, 4], label: 'a measure of 4/4: a half note, a quarter note and two eighth notes' })) +
      example('Example', `The measure above: half note 2 + quarter note 1 + two eighth notes ½ + ½ = <b>4 beats</b>, which fills a measure of 4/4.`) +
      p(`<a href="#/metronome">Open the metronome</a> to count a steady beat while you clap a rhythm.`),
    make(rng) {
      const t = rng.pick(['missing', 'missing', 'which', 'total']), top = rng.pick([2, 3, 4, 4]);
      if (t === 'missing') {
        const gap = rng.pick([1, 2, 0.5, 1.5, 3].filter(g => g < top)), items = fill(rng, top - gap);
        return { prompt: `This measure of ${top}/4 needs one more note at the end. How many beats should it last?${rhythm({ items, time: [top, 4], missing: true, label: `a measure of ${top}/4 with a note missing at the end` })}`, type: 'number', answer: gap, params: { t, top, items },
          hints: [`Add the beats you can see: ${items.map(k => M.n(DUR[k])).join(' + ')} = ${M.n(top - gap)}.`, `A measure of ${top}/4 holds ${top} beats: ${top} − ${M.n(top - gap)} = <b>${M.n(gap)}</b>.`] };
      }
      const total = t === 'which' ? top : rng.pick([2, 3, 4]), items = fill(rng, total);
      if (t === 'which') {
        const ans = `${top}/4`;
        return { prompt: `Which time signature fits this measure?${rhythm({ items, label: 'a measure of notes' })}`, type: 'choice', keepOrder: true, answer: ans, choices: ['2/4', '3/4', '4/4'], params: { t, items },
          hints: [`Add the beats: ${items.map(k => M.n(DUR[k])).join(' + ')} = ${total}.`, `${total} quarter-note beats fill a measure of <b>${ans}</b>.`] };
      }
      return { prompt: `With a quarter note as one beat, how many beats do these notes and rests add up to?${rhythm({ items, bar: false, label: 'a row of notes and rests' })}`, type: 'number', answer: total, params: { t, items },
        hints: [`Name each one: ${items.map(fullName).join(', ')}.`, `${items.map(k => M.n(DUR[k])).join(' + ')} = <b>${total}</b> beats.`] };
    },
    verify(q) {
      const P = q.params, sum = P.items.reduce((s, k) => s + BEATS[fullName(k)], 0);
      if (P.t === 'missing') return Math.abs(sum + q.answer - P.top) < 1e-9;
      if (P.t === 'which') return q.answer === `${sum}/4`;
      return Math.abs(sum - q.answer) < 1e-9;
    },
  });

  const VALUE_OF = { 1: 'whole note', 2: 'half note', 4: 'quarter note', 8: 'eighth note', 16: 'sixteenth note' };
  A.skill({
    id: 'mus.time-signatures', title: 'Time signatures',
    real: 'A waltz is in 3/4, many marches are in 2/4 or cut time, and many jigs are in 6/8: the time signature gives a piece its feel.',
    mistakes: ['Reading the bottom number as a number of beats: it names the note that gets one beat.', 'Counting 6/8 as six slow beats instead of two groups of three.'],
    learn: p(`A <b>time signature</b> is the pair of numbers at the start of a piece. <b>The top number says how many beats are in each measure. The bottom number says which note gets one beat</b>: 4 means a quarter note, 2 a half note, and 8 an eighth note.`) +
      p(`So 3/4 has three quarter-note beats in a measure (a waltz), and 2/2, called <b>cut time</b>, has two half-note beats. In <b>6/8</b> there are six eighth notes in a measure, felt as <b>two beats of a dotted quarter note</b> each; times like 6/8, 9/8 and 12/8 are called <b>compound time</b>.`, staff({ clef: 'treble', time: [3, 4], notes: [], w: 120, label: 'a treble staff with the time signature 3/4' })) +
      example('Example', `How many eighth notes fill a measure of 3/4? A measure holds 3 quarter notes, and each quarter note is 2 eighth notes, so <b>6</b>.`),
    make(rng) {
      const t = rng.pick(['fill', 'fill', 'beat', 'compound']);
      if (t === 'fill') {
        const [top, bot] = rng.pick([[2, 4], [3, 4], [4, 4], [6, 8], [3, 8], [2, 2], [5, 4], [12, 8]]);
        const val = rng.pick([1, 2, 4, 8, 16].filter(v => (top * v / bot) % 1 === 0 && top * v / bot >= 1 && top * v / bot <= 16 && v !== bot));
        const ans = top * val / bot;
        return { prompt: `How many ${VALUE_OF[val]}s fill one measure of ${top}/${bot} time?`, type: 'number', answer: ans, params: { t, top, bot, val },
          hints: [`${top}/${bot} has ${top} ${VALUE_OF[bot]}s in each measure.`, val > bot ? `Each ${VALUE_OF[bot]} is ${val / bot} ${VALUE_OF[val]}s.` : `Each ${VALUE_OF[val]} is ${bot / val} ${VALUE_OF[bot]}s.`, `${top} ${val > bot ? '×' : '÷'} ${val > bot ? val / bot : bot / val} = <b>${ans}</b>.`] };
      }
      if (t === 'beat') {
        const [top, bot] = rng.pick([[2, 4], [3, 4], [4, 4], [2, 2], [3, 2], [3, 8]]), ans = VALUE_OF[bot];
        const ask = rng.bool();
        if (ask) return { prompt: `In ${top}/${bot} time, how many beats are in each measure?`, type: 'number', answer: top, params: { t: 'top', top, bot }, hints: ['The top number is how many beats are in a measure.', `<b>${top}</b> beats.`] };
        return { prompt: `In ${top}/${bot} time, which note gets one beat?`, type: 'choice', answer: ans, choices: options(ans, ['quarter note', 'half note', 'eighth note', 'whole note', 'dotted quarter note']), params: { t, top, bot },
          hints: ['The bottom number names the note that gets one beat: 2 is a half note, 4 a quarter note, 8 an eighth note.', `The bottom number is ${bot}, so the <b>${ans}</b> gets one beat.`] };
      }
      const [top] = rng.pick([[6], [9], [12]]), ans = top / 3;
      return { prompt: `${top}/8 is compound time: its beat is a dotted quarter note. How many of those beats are in one measure?`, type: 'number', answer: ans, params: { t, top },
        hints: [`A measure of ${top}/8 holds ${top} eighth notes.`, 'A dotted quarter note is 3 eighth notes long.', `${top} ÷ 3 = <b>${ans}</b> beats.`] };
    },
    verify(q) {
      const P = q.params, len = { 1: 4, 2: 2, 4: 1, 8: 0.5, 16: 0.25 };          // in quarter notes
      if (P.t === 'fill') return Math.abs(q.answer * len[P.val] - P.top * len[P.bot]) < 1e-9;
      if (P.t === 'top') return q.answer === P.top;
      if (P.t === 'beat') return BEATS[q.answer] === len[P.bot];
      return q.answer * 3 === P.top;
    },
  });

  /* ---------- Unit 4: scales and key signatures ---------- */
  const keyLabel = k => `${disp(k)} major`;
  const sigOf = k => ({ n: KEYSIG[k].length, kind: KEYSIG[k].length && KEYSIG[k][0][1] === 'b' ? 'flat' : 'sharp' });
  A.skill({
    id: 'mus.major-scales', title: 'Major scales',
    real: 'Scales train your fingers for the patterns most pieces use, and every key has its own scale.',
    mistakes: [`Using a letter twice or skipping one: a scale uses each letter once, so G major has F${SH}, not G${FL}.`, 'Forgetting where the half steps fall: between notes 3 and 4, and 7 and 8.'],
    learn: p(`A <b>major scale</b> climbs eight notes from one note to the same letter an octave higher, using every letter once. Its steps always follow the same pattern: <b>whole, whole, half, whole, whole, whole, half</b> (W W H W W W H).`) +
      p(`C major uses only white keys. Any other major scale needs sharps or flats to keep the pattern. For G major, F has to become <b>F${SH}</b> so the step from E to the 7th note is a whole step and the step up to G is a half step. The notes are numbered as <b>scale degrees</b> 1 to 8; degree 1 is the <b>tonic</b>, 4 the <b>subdominant</b>, and 5 the <b>dominant</b>.`, staff({ clef: 'treble', notes: majorScale(parse('G4')), labels: majorScale(parse('G4')).map(nm), gap: 34, label: 'the G major scale, G A B C D E F-sharp G' }) + `<p>${play(majorScale(parse('G4')).map(midi), 'Play the G major scale')}</p>`) +
      example('Example', `D major: D, E, F${SH}, G, A, B, C${SH}, D. Its 4th degree is <b>G</b> and its 7th degree is <b>C${SH}</b>.`),
    make(rng) {
      const k = rng.pick(KEYS), sc = majorScale(tonicOf(k)), t = rng.pick(['degree', 'degree', 'which', 'odd']);
      if (t === 'degree') {
        const d = rng.int(2, 7), n = sc[d - 1], ans = nm(n);
        const alt = (n.acc ? [note(n.L, 0, n.oct)] : rng.shuffle([note(n.L, 1, n.oct), note(n.L, -1, n.oct)])).map(nm).filter(c => !ODD.includes(c));
        const cands = alt.concat([nm(sc[d % 7]), nm(sc[d - 2])]);
        return { prompt: `What is the ${ORD[d]} note (scale degree ${d}) of the ${keyLabel(k)} scale?`, type: 'choice', answer: ans, choices: options(ans, cands), params: { t, k, d },
          hints: [`Start on ${disp(k)} and use each letter once: ${sc.slice(0, d).map(n2 => LET[n2.L]).join(', ')}…`, `Follow whole, whole, half, whole, whole, whole, half. The ${keyLabel(k)} scale is ${sc.map(nm).join(', ')}.`, `The ${ORD[d]} note is <b>${ans}</b>.`] };
      }
      if (t === 'which') {
        const shown = majorScale(tonicOf(k)), ans = keyLabel(k);
        const others = KEYS.filter(x => x !== k && (x[0] === k[0] || Math.abs(KEYSIG[x].length - KEYSIG[k].length) <= 1));
        return { prompt: `Which major scale is this?${staff({ clef: 'treble', notes: shown, gap: 34, label: 'eight notes of a major scale' })}`, type: 'choice', answer: ans, choices: options(ans, rng.shuffle(others).map(keyLabel)), params: { t, k, ids: shown.map(idOf) },
          hints: ['A scale starts and ends on its tonic: read the first note.', `The first and last notes are ${disp(k)}, so it’s the <b>${ans}</b> scale.`] };
      }
      const inside = sc.slice(0, 7).map(nm), pcs = sc.map(pcOf);
      // a scale note moved a half step and spelled plainly, which isn't the same key as any note of the scale
      const offs = [1, 2, 3, 4, 5, 6].map(i => note(sc[i].L, sc[i].acc ? 0 : (KEYSIG[k].length && KEYSIG[k][0][1] === 'b' ? 1 : -1), sc[i].oct)).filter(x => !ODD.includes(nm(x)) && !pcs.includes(pcOf(x)));
      const off = rng.pick(offs), bad = sc.find(x => x.L === off.L), wrong = nm(off);
      const picks = rng.sample(inside.filter(x => x !== nm(bad)), 3);
      return { prompt: `Which of these notes is <b>not</b> in the ${keyLabel(k)} scale?`, type: 'choice', answer: wrong, choices: options(wrong, picks), params: { t, k },
        hints: [`Write out the scale: ${sc.map(nm).join(', ')}.`, `${wrong} isn’t one of them (the scale has ${nm(bad)}), so the answer is <b>${wrong}</b>.`] };
    },
    verify(q) {
      const { t, k, d } = q.params, letters = 'CDEFGABCDEFGAB', start = letters.indexOf(k[0]);
      const scale = [0, 1, 2, 3, 4, 5, 6].map(i => disp(inKey(k, letters[start + i])));
      if (t === 'degree') return q.answer === scale[d - 1];
      if (t === 'which') return q.answer === keyLabel(q.params.ids[0]) && q.params.ids[0] === k && q.params.ids.slice(0, 7).map(disp).join() === scale.join();
      return !scale.includes(q.answer) && q.choices.filter(c => !scale.includes(c)).length === 1;
    },
  });

  A.skill({
    id: 'mus.key-signatures', title: 'Key signatures',
    real: 'The key signature at the start of each line tells you which black keys a piece uses, so you can check before you play.',
    mistakes: ['Naming the key after the last sharp: the key is a half step above it.', 'Using the second-to-last-flat rule with one flat: one flat is F major.'],
    learn: p(`Instead of writing the same sharps or flats again and again, music puts them once at the start of every line: the <b>key signature</b>. A sharp on the F line means every F is played as F${SH}.`) +
      p(`The sharps always come in the order <b>F C G D A E B</b>, and the flats in the reverse order, <b>B E A D G C F</b>. <b>With sharps, the key is a half step above the last sharp</b>. <b>With flats, the key is the second-to-last flat</b> (and one flat is F major). No sharps or flats is C major.`, `<span class="mus-pair">${staff({ clef: 'treble', key: sigOf('D'), notes: [], w: 110, label: 'two sharps: D major' })}${staff({ clef: 'treble', key: sigOf('Eb'), notes: [], w: 110, label: 'three flats: E-flat major' })}</span>`) +
      example('Example', `Two sharps, F${SH} and C${SH}: a half step above C${SH} is <b>D major</b>. Three flats, B${FL}, E${FL} and A${FL}: the second-to-last is E${FL}, so <b>E${FL} major</b>.`),
    make(rng) {
      const k = rng.pick(KEYS), t = rng.pick(['name', 'name', 'count', 'list']), sig = KEYSIG[k];
      if (t === 'name') {
        const clef = rng.pick(['treble', 'treble', 'bass']), ans = keyLabel(k);
        const others = KEYS.filter(x => x !== k).sort((a, b) => Math.abs(KEYSIG[a].length - sig.length) - Math.abs(KEYSIG[b].length - sig.length));
        const lastSharpKey = sig.length && sig[0][1] === '#' ? keyLabel(sig[sig.length - 1]) : null;
        return { prompt: `Which major key has this key signature?${staff({ clef, key: sigOf(k), notes: [], w: 130, label: sig.length ? `a key signature of ${M.plural(sig.length, sig[0][1] === 'b' ? 'flat' : 'sharp')}` : 'a key signature with no sharps or flats' })}`, type: 'choice', answer: ans, choices: options(ans, [lastSharpKey].concat(others.map(keyLabel))), params: { t, k },
          hints: [sig.length ? `Name the ${sig[0][1] === 'b' ? 'flats' : 'sharps'} in order: ${sig.map(disp).join(', ')}.` : 'No sharps or flats.', !sig.length ? 'That’s C major.' : sig[0][1] === '#' ? `The last sharp is ${disp(sig[sig.length - 1])}; a half step above it is ${disp(k)}.` : sig.length === 1 ? 'One flat is F major.' : `The second-to-last flat is ${disp(sig[sig.length - 2])}.`, `It’s <b>${ans}</b>.`] };
      }
      if (t === 'count') {
        const kind = sig.length && sig[0][1] === 'b' ? 'flats' : 'sharps';
        return { prompt: `How many ${kind} are in the key signature of ${keyLabel(k)}?`, type: 'number', answer: sig.length, params: { t, k },
          hints: [`Build the scale with each letter once, following W W H W W W H, or use the order of ${kind}.`, `${keyLabel(k)} has ${sig.length ? sig.map(disp).join(', ') : 'none'}: <b>${sig.length}</b>.`] };
      }
      const kk = rng.pick(KEYS.filter(x => KEYSIG[x].length >= 2)), s2 = KEYSIG[kk], ans = s2.map(disp).join(', ');
      const flat = s2[0][1] === 'b', order = flat ? ['Bb', 'Eb', 'Ab', 'Db', 'Gb'] : ['F#', 'C#', 'G#', 'D#', 'A#'];
      const cands = [order.slice(0, s2.length - 1), order.slice(0, s2.length + 1), order.slice(0, s2.length - 1).concat(order[s2.length]), order.slice(1, s2.length + 1)].map(l => l.map(disp).join(', '));
      return { prompt: `Which ${flat ? 'flats' : 'sharps'} are in the key signature of ${keyLabel(kk)}?`, type: 'choice', answer: ans, choices: options(ans, cands), params: { t, k: kk },
        hints: [`${flat ? 'Flats' : 'Sharps'} always come in the order ${flat ? 'B E A D G C F' : 'F C G D A E B'}.`, `${keyLabel(kk)} has ${M.plural(s2.length, flat ? 'flat' : 'sharp')}: <b>${ans}</b>.`] };
    },
    verify(q) {
      const { t, k } = q.params;
      // a second way: walk the circle of fifths (a 5th up adds a sharp, a 5th down adds a flat)
      const SHARP_KEYS = ['C', 'G', 'D', 'A', 'E', 'B'], FLAT_KEYS = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db'];
      const n = SHARP_KEYS.includes(k) ? SHARP_KEYS.indexOf(k) : FLAT_KEYS.indexOf(k);
      const list = (SHARP_KEYS.includes(k) ? ['F#', 'C#', 'G#', 'D#', 'A#'] : ['Bb', 'Eb', 'Ab', 'Db', 'Gb']).slice(0, n);
      if (t === 'name') return q.answer === keyLabel(k);
      if (t === 'count') return q.answer === n;
      return q.answer === list.map(disp).join(', ');
    },
  });

  A.skill({
    id: 'mus.minor-keys', title: 'Relative and harmonic minor',
    real: 'Minor keys often sound darker or sadder, and many pieces move between a major key and its relative minor.',
    mistakes: ['Counting up from the major tonic instead of down: the relative minor is 3 half steps below it.', 'Putting the raised 7th in the key signature: in the music it’s written as an accidental.'],
    learn: p(`Every major key has a <b>relative minor</b> that shares its key signature. <b>The relative minor starts on the 6th note of the major scale</b>, which is also 3 half steps below the major tonic. C major and A minor both have no sharps or flats; G major and E minor both have one sharp.`) +
      p(`The <b>natural minor</b> scale uses just the key signature: A minor is A, B, C, D, E, F, G, A. The <b>harmonic minor</b> raises the 7th note a half step, which gives a strong pull back up to the tonic: <b>A harmonic minor is A, B, C, D, E, F, G${SH}, A</b>. The raised note is written as an accidental, not in the key signature.`, staff({ clef: 'treble', notes: ['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G#5', 'A5'].map(parse), labels: ['A', 'B', 'C', 'D', 'E', 'F', 'G' + SH, 'A'], gap: 34, label: 'the A harmonic minor scale, with G-sharp' }) + `<p>${play(['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G#5', 'A5'].map(s => midi(parse(s))), 'Play A harmonic minor')}</p>`) +
      example('Example', `The relative minor of F major: F, G, A, B${FL}, C, <b>D</b>, so D minor. D harmonic minor raises C to <b>C${SH}</b>.`),
    make(rng) {
      const t = rng.pick(['rel', 'rel', 'major', 'harmonic']);
      if (t === 'rel') {
        const k = rng.pick(KEYS), sc = majorScale(tonicOf(k)), ans = `${nm(sc[5])} minor`;
        const cands = [`${nm(sc[2])} minor`, `${nm(sc[4])} minor`, `${disp(k)} minor`, `${nm(sc[1])} minor`];
        return { prompt: `What is the relative minor of ${keyLabel(k)}?`, type: 'choice', answer: ans, choices: options(ans, cands), params: { t, k },
          hints: [`Count up to the 6th note of the ${keyLabel(k)} scale: ${sc.slice(0, 6).map(nm).join(', ')}.`, `Or go down 3 half steps from ${disp(k)}.`, `The relative minor is <b>${ans}</b>.`] };
      }
      if (t === 'major') {
        const k = rng.pick(KEYS), minor = disp(REL_MINOR[k]), ans = keyLabel(k);
        const m = parse(REL_MINOR[k] + '4'), wrongUp = above(m, 2, 4), wrongDown = above(m, -2, -3);
        const cands = [wrongUp && `${nm(wrongUp)} major`, wrongDown && `${nm(wrongDown)} major`, `${minor} major`, keyLabel(KEYS[(KEYS.indexOf(k) + 1) % KEYS.length])];
        return { prompt: `${minor} minor has the same key signature as which major key?`, type: 'choice', answer: ans, choices: options(ans, cands), params: { t, k },
          hints: [`The relative major is 3 half steps above the minor tonic, and two letters up.`, `Up 3 half steps from ${minor} is ${disp(k)}: <b>${ans}</b>.`] };
      }
      const k = rng.pick(['C', 'G', 'D', 'F', 'Bb']), tonic = parse(REL_MINOR[k] + '4'), seventh = above(tonic, 6, 11), ans = nm(seventh);
      const cands = [nm(above(tonic, 6, 10)), nm(above(tonic, 5, 8)), nm(above(tonic, 5, 9) || above(tonic, 5, 8)), nm(note(tonic.L, 1, 4))].filter(c => c !== ans);
      return { prompt: `In the ${disp(REL_MINOR[k])} harmonic minor scale, what is the raised 7th note?`, type: 'choice', answer: ans, choices: options(ans, cands), params: { t, k },
        hints: [`${disp(REL_MINOR[k])} natural minor uses the key signature of ${keyLabel(k)}; its 7th note is ${nm(above(tonic, 6, 10))}.`, `Raise it a half step: <b>${ans}</b>.`] };
    },
    verify(q) {
      const { t, k } = q.params;
      if (t === 'rel') return q.answer === `${disp(REL_MINOR[k])} minor`;
      if (t === 'major') return q.answer === keyLabel(k);
      // the 7th note of the natural minor, from the key signature, raised a half step
      const tonic = REL_MINOR[k], letter = 'CDEFGABCDEFGAB'['CDEFGAB'.indexOf(tonic[0]) + 6], plain = inKey(k, letter);
      return q.answer === (plain.length === 2 ? letter : letter + SH);          // a flat raised is a natural; a plain letter raised is a sharp
    },
  });

  /* ---------- Unit 5: intervals ---------- */
  const IVL = [['minor 2nd', 1, 1], ['major 2nd', 1, 2], ['minor 3rd', 2, 3], ['major 3rd', 2, 4], ['perfect 4th', 3, 5], ['perfect 5th', 4, 7], ['minor 6th', 5, 8], ['major 6th', 5, 9], ['minor 7th', 6, 10], ['major 7th', 6, 11], ['perfect octave', 7, 12]];
  const NUM = ['unison', '2nd', '3rd', '4th', '5th', '6th', '7th', 'octave'];
  A.skill({
    id: 'mus.interval-numbers', title: 'Interval numbers',
    real: 'Pianists read quickly by reading intervals, a 3rd up or a 5th down, instead of naming every note.',
    mistakes: ['Not counting the first note: C to E is C, D, E, three letters, so a 3rd.', `Letting a sharp or flat change the number: C to E${FL} is still a 3rd.`],
    learn: p(`An <b>interval</b> is the distance between two notes. Its number comes from <b>counting letter names, including both notes</b>. C up to E is C, D, E: three letters, so a <b>3rd</b>. C up to G is a 5th, and C up to the next C is an <b>octave</b> (an 8th).`) +
      p(`On the staff, intervals have a pattern: <b>odd numbers (3rd, 5th, 7th) go line to line or space to space</b>, and even numbers (2nd, 4th, 6th, octave) go from a line to a space. Sharps and flats don’t change the number: C to E${FL} is still a 3rd.`, staff({ clef: 'treble', notes: ['C4', 'E4', 'C4', 'G4', 'C4', 'C5'].map(parse), labels: ['C', '3rd', 'C', '5th', 'C', '8ve'], gap: 30, label: 'C up to E, a 3rd; C up to G, a 5th; C up to C, an octave' })) +
      example('Example', `D up to A: D, E, F, G, A is five letters, so a <b>5th</b>. F up to E is F, G, A, B, C, D, E: a <b>7th</b>.`),
    make(rng) {
      const t = rng.pick(['staff', 'staff', 'letters']), clef = rng.pick(['treble', 'bass']);
      if (t === 'staff') {
        const lo = rng.int(-1, 5), size = rng.int(1, 7), d = BASE[clef] + lo;
        const a = note(d % 7, 0, Math.floor(d / 7)), b = note((d + size) % 7, 0, Math.floor((d + size) / 7)), ans = NUM[size];
        return { prompt: `What is the number of this interval?${staff({ clef, notes: [a, b], gap: 40, label: `two notes on the ${clef} staff` })}`, type: 'choice', answer: ans, choices: options(ans, rng.shuffle([NUM[size - 1], NUM[Math.min(7, size + 1)], NUM[Math.max(1, size - 2)], NUM[Math.min(7, size + 2)]]).filter(x => x !== 'unison')), params: { t, clef, q1: lo, q2: lo + size },
          hints: [`Name both notes: ${LET[a.L]} and ${LET[b.L]}.`, `Count the letters from ${LET[a.L]} up to ${LET[b.L]}, including both: ${Array.from({ length: size + 1 }, (_, i) => LET[(a.L + i) % 7]).join(', ')}.`, `That’s ${size + 1} letters: a <b>${ans}</b>.`] };
      }
      const a = rng.int(0, 6), size = rng.int(1, 7), up = rng.chance(0.75), ans = LET[(a + (up ? size : 7 - size)) % 7];
      return { prompt: `Which note is a ${NUM[size]} ${up ? 'above' : 'below'} ${LET[a]}? (No sharps or flats.)`, type: 'choice', answer: ans, choices: options(ans, [LET[(LET.indexOf(ans) + 1) % 7], LET[(LET.indexOf(ans) + 6) % 7], LET[(a + (up ? 7 - size : size)) % 7], LET[(LET.indexOf(ans) + 2) % 7]]), params: { t, a, size, up },
        hints: [`Count ${size + 1} letters ${up ? 'up' : 'down'}, starting with ${LET[a]} as 1.`, `${Array.from({ length: size + 1 }, (_, i) => LET[((a + (up ? i : -i)) % 7 + 7) % 7]).join(', ')}: the note is <b>${ans}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'staff') { const s = P.clef === 'treble' ? TREBLE_READ : BASS_READ, a = s[P.q1 + 6], b = s[P.q2 + 6]; return q.answer === NUM[('CDEFGAB'.indexOf(b) - 'CDEFGAB'.indexOf(a) + 7) % 7 || 7]; }
      const ring = 'CDEFGABCDEFGABCDEFGAB';
      return q.answer === (P.up ? ring[P.a + P.size] : ring[P.a + 14 - P.size]);
    },
  });

  A.skill({
    id: 'mus.interval-quality', title: 'Major, minor and perfect intervals',
    real: 'An interval’s quality is what you hear: a major 3rd sounds bright and a minor 3rd sounds darker.',
    mistakes: ['Counting white keys only: count every key, black and white, for the half steps.', 'Calling a 4th or a 5th major or minor: those are perfect.'],
    learn: p(`Two intervals with the same number can be different sizes: C to E is a 3rd, and so is C to E${FL}. Their <b>quality</b> says which, counted in half steps. <b>2nds, 3rds, 6ths and 7ths are major or minor</b>; a minor interval is a half step smaller than a major one. <b>Unisons, 4ths, 5ths and octaves are perfect</b>.`) +
      p(`A shortcut: in a major scale, <b>every note above the tonic is a major or perfect interval</b> from it. ${play([60, 64], 'Play a major 3rd')} ${play([60, 63], 'Play a minor 3rd')} ${play([60, 67], 'Play a perfect 5th')}`) +
      M.table(['Interval', 'Half steps', 'Example from C'], [['minor 2nd', '1', `C–D${FL}`], ['major 2nd', '2', 'C–D'], ['minor 3rd', '3', `C–E${FL}`], ['major 3rd', '4', 'C–E'], ['perfect 4th', '5', 'C–F'], ['perfect 5th', '7', 'C–G'], ['minor 6th', '8', `C–A${FL}`], ['major 6th', '9', 'C–A'], ['minor 7th', '10', `C–B${FL}`], ['major 7th', '11', 'C–B'], ['perfect octave', '12', 'C–C']], { compact: true }) +
      example('Example', `E up to G: E, F, G is a 3rd. E–F is 1 half step and F–G is 2, so 3 half steps: a <b>minor 3rd</b>.`),
    make(rng) {
      const t = rng.pick(['name', 'name', 'staff', 'count']);
      if (t === 'count') {
        const [name, , semis] = rng.pick(IVL);
        return { prompt: `How many half steps are in a ${name}?`, type: 'number', answer: semis, params: { t, name },
          hints: ['Picture the interval from C on the keyboard and count every key, black and white.', `A ${name} is <b>${semis}</b> half steps.`] };
      }
      let a, b, iv;
      do { a = parse(rng.pick(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B3', 'Bb3', 'Eb4', 'F#4', 'A3'])); iv = rng.pick(IVL.slice(0, 10)); b = above(a, iv[1], iv[2]); } while (!b || ODD.includes(nm(b)));
      const ans = iv[0], same = IVL.filter(x => x[1] === iv[1] && x[0] !== ans).map(x => x[0]);
      const cands = same.concat(IVL.filter(x => Math.abs(x[2] - iv[2]) === 1 && x[1] !== iv[1]).map(x => x[0]), IVL.filter(x => Math.abs(x[1] - iv[1]) === 1).map(x => x[0]));
      const shown = t === 'staff' ? staff({ clef: 'treble', notes: [a, b], gap: 46, label: `two notes on the treble staff: ${nm(a)} and ${nm(b)}` }) : big(`${nm(a)} up to ${nm(b)}`);
      return { prompt: `Name this interval.${shown}`, type: 'choice', answer: ans, choices: options(ans, rng.shuffle(cands)), params: { t, a: idOf(a), ao: a.oct, b: idOf(b), bo: b.oct },
        hints: [`Count the letters for the number: ${LET[a.L]} up to ${LET[b.L]} is a ${NUM[iv[1]]}.`, `Count half steps from ${nm(a)} up to ${nm(b)}: ${iv[2]}.`, `A ${NUM[iv[1]]} of ${iv[2]} half steps is a <b>${ans}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'count') { const BY = { 'minor 2nd': 1, 'major 2nd': 2, 'minor 3rd': 3, 'major 3rd': 4, 'perfect 4th': 5, 'perfect 5th': 7, 'minor 6th': 8, 'major 6th': 9, 'minor 7th': 10, 'major 7th': 11, 'perfect octave': 12 }; return q.answer === BY[P.name]; }
      const semis = pitch(P.b, P.bo) - pitch(P.a, P.ao), ring = 'CDEFGABCDEFGAB', number = ring.indexOf(P.b[0], ring.indexOf(P.a[0])) - ring.indexOf(P.a[0]) + 1;
      const perfect = { 4: 5, 5: 7, 8: 12 }[number], major = { 2: 2, 3: 4, 6: 9, 7: 11 }[number];
      const quality = perfect != null ? (semis === perfect ? 'perfect' : '?') : semis === major ? 'major' : semis === major - 1 ? 'minor' : '?';
      return q.answer === `${quality} ${['', '', '2nd', '3rd', '4th', '5th', '6th', '7th', 'octave'][number]}`;
    },
  });

  /* ---------- Unit 6: chords ---------- */
  const triad = (root, minor) => [root, above(root, 2, minor ? 3 : 4), above(root, 4, 7)];
  const dash = ns => ns.map(nm).join('–');
  const ROOTS = ['C4', 'D4', 'E4', 'F4', 'G4', 'A3', 'B3', 'Bb3', 'Eb4', 'Ab3', 'F#4', 'C#4'];
  /** a root and quality whose triad needs no double sharps or flats */
  function pickTriad(rng) { for (;;) { const r = parse(rng.pick(ROOTS)), minor = rng.bool(), t = triad(r, minor); if (t.every(n => n && !ODD.includes(nm(n)))) return { r, minor, t }; } }
  A.skill({
    id: 'mus.triads', title: 'Major and minor triads',
    real: 'Most songs are accompanied with triads, and a song sheet names the chord for you to build.',
    mistakes: ['Building in 2nds or 4ths: a triad skips one letter between its notes.', 'Changing the 5th instead of the 3rd: major and minor differ only in the middle note.'],
    learn: p(`A <b>triad</b> is a chord of three notes stacked in 3rds: a <b>root</b>, a <b>3rd</b> above it and a <b>5th</b> above the root. On the staff they look like a snowman: all lines or all spaces.`) +
      p(`<b>A major triad is a major 3rd (4 half steps) with a minor 3rd on top</b>: C–E–G. <b>A minor triad is a minor 3rd (3 half steps) with a major 3rd on top</b>: C–E${FL}–G. Both have a perfect 5th from bottom to top; only the middle note moves. To build one, start from the root, skip a letter, and skip another, then fix the 3rd with a sharp or flat.`, staff({ clef: 'treble', notes: [triad(parse('C4')), triad(parse('C4'), true), triad(parse('G4')), triad(parse('A4'), true)], labels: ['C', 'Cm', 'G', 'Am'], gap: 46, label: 'C major, C minor, G major and A minor triads' }) + `<span class=\"mus-plays\">${play(triad(parse('C4')).map(midi), 'Play C major', true)} ${play(triad(parse('C4'), true).map(midi), 'Play C minor', true)}</span>`) +
      example('Example', `D major: D, F, A are the letters; D to F is only 3 half steps, so raise F to make a major 3rd: <b>D–F${SH}–A</b>.`),
    make(rng) {
      const { r, minor, t } = pickTriad(rng), t2 = rng.pick(['build', 'build', 'quality']);
      if (t2 === 'build') {
        const ans = dash(t), other = triad(r, !minor), fifthOff = above(r, 4, 6) || above(r, 4, 8);
        const cands = [other.every(Boolean) && dash(other), fifthOff && dash([t[0], t[1], fifthOff]), dash([t[0], above(r, 3, 5) || t[1], t[2]]), dash([t[0], above(r, 1, 2) || t[1], t[2]])];
        return { prompt: `Which notes make the ${nm(r)} ${minor ? 'minor' : 'major'} triad?`, type: 'choice', answer: ans, choices: options(ans, cands), params: { t: t2, r: idOf(r), ro: r.oct, minor },
          hints: [`Root, skip a letter, skip a letter: ${LET[r.L]}, ${LET[t[1].L]}, ${LET[t[2].L]}.`, `A ${minor ? 'minor' : 'major'} 3rd above ${nm(r)} is ${nm(t[1])}, and a perfect 5th is ${nm(t[2])}.`, `The triad is <b>${ans}</b>.`] };
      }
      const ans = minor ? 'Minor' : 'Major';
      return { prompt: `Is this triad major or minor?${big(dash(t))}`, type: 'choice', keepOrder: true, answer: ans, choices: ['Major', 'Minor'], params: { t: t2, r: idOf(r), ro: r.oct, minor, notes: t.map(n => [idOf(n), n.oct]) },
        hints: [`Count half steps from the root ${nm(t[0])} up to the 3rd, ${nm(t[1])}.`, `It’s ${minor ? '3 half steps, a minor 3rd' : '4 half steps, a major 3rd'}, so the triad is <b>${ans.toLowerCase()}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'quality') { const [[a, ao], [b, bo], [c, co]] = P.notes, third = pitch(b, bo) - pitch(a, ao), fifth = pitch(c, co) - pitch(a, ao); return fifth === 7 && q.answer === (third === 3 ? 'Minor' : third === 4 ? 'Major' : '?'); }
      // read the three names back and measure them from the root
      const ids = q.answer.split('–').map(s => s.replace(SH, '#').replace(FL, 'b'));
      let o = P.ro; const ps = ids.map((id, i) => { if (i && 'CDEFGAB'.indexOf(id[0]) < 'CDEFGAB'.indexOf(ids[i - 1][0])) o++; return pitch(id, o); });
      return ids[0] === P.r && ps[1] - ps[0] === (P.minor ? 3 : 4) && ps[2] - ps[0] === 7;
    },
  });

  /** the root of three notes that stack in 3rds in some order, found by trying each as the bottom */
  function rootOf(ids) {
    const L = id => 'CDEFGAB'.indexOf(id[0]);
    return ids.find(r => ids.every(x => [0, 2, 4].includes(((L(x) - L(r)) % 7 + 7) % 7)));
  }
  A.skill({
    id: 'mus.chord-names', title: 'Naming chords',
    real: 'Naming chords helps you learn and remember a piece: a measure of C major is one shape, not three separate notes.',
    mistakes: ['Naming an inverted chord after its bottom note: stack the notes in 3rds first.', 'Forgetting a sharp or flat on the 3rd, which decides major or minor.'],
    learn: p(`To name a triad, find its <b>root</b>: the note the others stack on in 3rds. When the chord is written as a snowman (all lines or all spaces), the root is the <b>bottom note</b>. Then check the 3rd: 4 half steps above the root makes it <b>major</b>, 3 makes it <b>minor</b>.`) +
      p(`Chords are often played with the notes in another order, called an <b>inversion</b>: E–G–C is still a C major chord. <b>Rearrange the letters until they skip one letter each time</b> (C–E–G), and the bottom one is the root.`, staff({ clef: 'treble', notes: [triad(parse('C4')), [parse('E4'), parse('G4'), parse('C5')], [parse('G4'), parse('C5'), parse('E5')]], labels: ['C', 'C', 'C'], gap: 50, label: 'a C major chord in root position, first inversion and second inversion' })) +
      example('Example', `The notes A, F and D: in 3rds they go D–F–A. D to F is 3 half steps, so it’s <b>D minor</b>.`),
    make(rng) {
      const { r, minor, t } = pickTriad(rng), ans = `${nm(r)} ${minor ? 'minor' : 'major'}`, t2 = rng.pick(['staff', 'staff', 'mixed']);
      const cands = [`${nm(r)} ${minor ? 'major' : 'minor'}`, `${nm(t[1])} ${minor ? 'major' : 'minor'}`, `${nm(t[2])} major`, `${nm(t[1])} ${minor ? 'minor' : 'major'}`, `${nm(t[2])} minor`];
      if (t2 === 'staff') {
        const clef = rng.pick(['treble', 'bass']), shift = clef === 'bass' ? -1 : 0, shown = t.map(n => note(n.L, n.acc, n.oct + shift));
        return { prompt: `Name this chord.${staff({ clef, notes: [shown], label: `a three-note chord on the ${clef} staff` })}`, type: 'choice', answer: ans, choices: options(ans, cands), params: { t: t2, ids: t.map(idOf), minor, ro: r.oct },
          hints: ['The notes stack in 3rds, so the bottom note is the root.', `The notes are ${dash(t)}; the root is ${nm(r)}.`, `${nm(r)} up to ${nm(t[1])} is ${minor ? '3 half steps, minor' : '4 half steps, major'}: <b>${ans}</b>.`] };
      }
      const order = rng.pick([[1, 2, 0], [2, 0, 1], [2, 1, 0], [1, 0, 2]]), shown = order.map(i => nm(t[i]));
      return { prompt: `A chord has the notes ${shown.join(', ')}. What is it called?`, type: 'choice', answer: ans, choices: options(ans, cands), params: { t: t2, ids: t.map(idOf), minor, ro: r.oct },
        hints: [`Rearrange the letters so each one skips a letter: ${dash(t)}.`, `The root is ${nm(r)}; up to ${nm(t[1])} is ${minor ? '3 half steps (minor)' : '4 half steps (major)'}.`, `It’s <b>${ans}</b>.`] };
    },
    verify(q) {
      const { ids, ro } = q.params, root = rootOf(ids), third = ids.find(x => ((('CDEFGAB'.indexOf(x[0]) - 'CDEFGAB'.indexOf(root[0])) % 7) + 7) % 7 === 2);
      const up = 'CDEFGAB'.indexOf(third[0]) < 'CDEFGAB'.indexOf(root[0]) ? 1 : 0, semis = pitch(third, ro + up) - pitch(root, ro);
      return q.answer === `${disp(root)} ${semis === 3 ? 'minor' : semis === 4 ? 'major' : '?'}`;
    },
  });

  const ROMAN = ['I', 'ii', 'iii', 'IV', 'V', 'vi'];
  A.skill({
    id: 'mus.primary-chords', title: 'The primary chords I, IV and V',
    real: 'With just I, IV and V you can accompany hundreds of songs, and most pieces end with V going to I.',
    mistakes: ['Building the chord on the wrong scale note: IV is on the 4th note and V on the 5th.', `Leaving out the key’s sharps or flats: in D major the V chord is A–C${SH}–E.`],
    learn: p(`A triad can be built on every note of a scale. They’re numbered with <b>Roman numerals</b>: capitals for major chords and small letters for minor ones. In every major key, <b>I, IV and V are major</b>, and ii, iii and vi are minor.`) +
      p(`<b>I (the tonic), IV (the subdominant) and V (the dominant) are the primary chords</b>. Many songs can be played with just these three, and pieces usually end with V going to I. In C major they are C major (C–E–G), F major (F–A–C) and G major (G–B–D).`, staff({ clef: 'treble', notes: [0, 1, 2, 3, 4, 5].map(i => triad(majorScale(parse('C4'))[i], [1, 2, 5].includes(i))), labels: ROMAN, gap: 40, label: 'the triads on C, D, E, F, G and A in C major, numbered I, ii, iii, IV, V and vi' }) + `<span class=\"mus-plays\">${play([60, 64, 67], 'Play I', true)} ${play([65, 69, 72], 'Play IV', true)} ${play([67, 71, 74], 'Play V', true)} ${play([60, 64, 67], 'Play I', true)}</span>`) +
      example('Example', `In G major (G, A, B, C, D, E, F${SH}), the IV chord is built on C: <b>C major</b>. The V chord is built on D: <b>D major</b>, with an F${SH}.`),
    make(rng) {
      const k = rng.pick(['C', 'G', 'D', 'F', 'Bb', 'A', 'Eb']), sc = majorScale(tonicOf(k)), t = rng.pick(['name', 'name', 'numeral']);
      const chordName = i => `${nm(sc[i])} ${[1, 2, 5].includes(i) ? 'minor' : 'major'}`;
      if (t === 'name') {
        const i = rng.pick([0, 3, 4, 3, 4, 5]), ans = chordName(i);
        return { prompt: `In ${keyLabel(k)}, what is the ${ROMAN[i]} chord?`, type: 'choice', answer: ans, choices: options(ans, rng.shuffle([chordName((i + 1) % 6), chordName((i + 5) % 6), `${nm(sc[i])} ${[1, 2, 5].includes(i) ? 'major' : 'minor'}`, chordName((i + 2) % 6)])), params: { t, k, i },
          hints: [`The ${keyLabel(k)} scale: ${sc.slice(0, 7).map(nm).join(', ')}.`, `${ROMAN[i]} is built on the ${ORD[i + 1]} note, ${nm(sc[i])}; ${[1, 2, 5].includes(i) ? 'a small numeral is minor' : 'a capital numeral is major'}.`, `It’s <b>${ans}</b>.`] };
      }
      const i = rng.pick([0, 3, 4, 5, 1]), ans = ROMAN[i];
      return { prompt: `In ${keyLabel(k)}, which Roman numeral is the ${chordName(i)} chord?`, type: 'choice', keepOrder: true, answer: ans, choices: ROMAN.slice(), params: { t, k, i },
        hints: [`Count up the ${keyLabel(k)} scale to ${nm(sc[i])}: it’s the ${ORD[i + 1]} note.`, `The chord on the ${ORD[i + 1]} note is <b>${ans}</b>.`] };
    },
    verify(q) {
      const { t, k, i } = q.params, letters = 'CDEFGABCDEFGAB', s = letters.indexOf(k[0]), root = inKey(k, letters[s + i]);
      // the 3rd above the root, from the key signature, decides major or minor
      const third = inKey(k, letters[s + i + 2]), oct = 'CDEFGAB'.indexOf(third[0]) < 'CDEFGAB'.indexOf(root[0]) ? 5 : 4, semis = pitch(third, oct) - pitch(root, 4);
      const name = `${disp(root)} ${semis === 3 ? 'minor' : 'major'}`, numeral = semis === 3 ? ['i', 'ii', 'iii', 'iv', 'v', 'vi'][i] : ['I', 'II', 'III', 'IV', 'V', 'VI'][i];
      return t === 'name' ? q.answer === name : q.answer === numeral;
    },
  });

  /* ---------- Unit 7: words and signs ---------- */
  // the glossary: what verify() checks meanings against (the questions are built from TEMPO and SIGNS below)
  const GLOSSARY = { largo: 'very slow and broad', adagio: 'slow', andante: 'at a walking pace', moderato: 'at a moderate speed', allegro: 'fast and lively', presto: 'very fast', ritardando: 'gradually slower', accelerando: 'gradually faster', 'a tempo': 'back to the original speed', fermata: 'hold the note longer than its value', legato: 'smooth and connected', staccato: 'short and detached', crescendo: 'gradually louder', diminuendo: 'gradually softer', pp: 'very soft', p: 'soft', mp: 'moderately soft', mf: 'moderately loud', f: 'loud', ff: 'very loud', accent: 'play the note louder than the others', 'D.C. al Fine': 'go back to the beginning and play to Fine', dolce: 'sweetly', cantabile: 'in a singing style' };
  const TEMPO = [['Largo', 'very slow and broad'], ['Adagio', 'slow'], ['Andante', 'at a walking pace'], ['Moderato', 'at a moderate speed'], ['Allegro', 'fast and lively'], ['Presto', 'very fast'], ['ritardando (rit.)', 'gradually slower'], ['accelerando (accel.)', 'gradually faster'], ['a tempo', 'back to the original speed'], ['dolce', 'sweetly'], ['cantabile', 'in a singing style'], ['D.C. al Fine', 'go back to the beginning and play to Fine']];
  const termKey = s => s.replace(/ \(.*\)$/, '').toLowerCase().replace('d.c. al fine', 'D.C. al Fine');
  A.skill({
    id: 'mus.tempo-terms', title: 'Tempo words',
    real: 'Tempo words are at the start of almost every piece, and music exams often ask what they mean.',
    mistakes: ['Mixing up Adagio (slow) and Allegro (fast).', 'Forgetting a tempo after rit.: it means back to the speed you had before.'],
    learn: p(`Composers write in Italian to say how fast to play. From slowest to fastest: <b>Largo</b> (very slow and broad), <b>Adagio</b> (slow), <b>Andante</b> (at a walking pace), <b>Moderato</b> (moderate), <b>Allegro</b> (fast and lively) and <b>Presto</b> (very fast).`) +
      p(`Some words change the speed: <b>ritardando</b> (rit.) means gradually slower, <b>accelerando</b> (accel.) gradually faster, and <b>a tempo</b> means back to the original speed. Others describe the mood: <b>dolce</b> is sweetly, <b>cantabile</b> in a singing style. <b>D.C. al Fine</b> means go back to the beginning and play until the word Fine.`) +
      p(`A tempo is often given as a number of beats per minute too, such as a quarter note = 96. <a href="#/metronome">The metronome</a> shows the Italian word for each speed as you set it.`) +
      example('Example', `A piece marked <b>Andante</b> is played at a walking pace, slower than Allegro. Near the end, <b>rit.</b> asks you to slow down gradually.`),
    make(rng) {
      const [term, mean] = rng.pick(TEMPO), others = TEMPO.filter(x => x[0] !== term);
      if (rng.bool()) return { prompt: `What does <b>${term}</b> mean?`, type: 'choice', answer: mean, choices: options(mean, rng.shuffle(others).map(x => x[1])), params: { term, ask: 'mean' }, hints: ['Tempo words are Italian. Think of the order Largo, Adagio, Andante, Moderato, Allegro, Presto.', `${term} means <b>${mean}</b>.`] };
      if (rng.bool()) {
        const four = rng.sample(TEMPO.slice(0, 6), 4), fastest = rng.bool(), ans = (fastest ? four.slice().sort((a, b) => TEMPO.indexOf(b) - TEMPO.indexOf(a)) : four.slice().sort((a, b) => TEMPO.indexOf(a) - TEMPO.indexOf(b)))[0][0];
        return { prompt: `Which tempo is the ${fastest ? 'fastest' : 'slowest'}?`, type: 'choice', answer: ans, choices: four.map(x => x[0]), params: { four: four.map(x => x[0]), fastest, ask: 'order' }, hints: ['From slowest to fastest: Largo, Adagio, Andante, Moderato, Allegro, Presto.', `The ${fastest ? 'fastest' : 'slowest'} of these is <b>${ans}</b>.`] };
      }
      return { prompt: `Which word means <b>${mean}</b>?`, type: 'choice', answer: term, choices: options(term, rng.shuffle(others).map(x => x[0])), params: { mean, ask: 'term' }, hints: ['Tempo and mood words are Italian.', `<b>${term}</b> means ${mean}.`] };
    },
    verify(q) {
      const P = q.params, order = ['largo', 'adagio', 'andante', 'moderato', 'allegro', 'presto'];
      if (P.ask === 'mean') return GLOSSARY[termKey(P.term)] === q.answer;
      if (P.ask === 'term') return GLOSSARY[termKey(q.answer)] === P.mean;
      const ranks = P.four.map(x => order.indexOf(x.toLowerCase())), want = P.fastest ? Math.max(...ranks) : Math.min(...ranks);
      return order.indexOf(q.answer.toLowerCase()) === want;
    },
  });

  // dynamics and articulation, with small drawings of the signs
  const sign = (body, w, label) => `<svg class="figure mus-sign" viewBox="0 0 ${w} 40" width="${w}" role="img" aria-label="${label}">${body}</svg>`;
  const DYN_SIGN = {
    crescendo: sign('<path d="M8 20L112 8M8 20L112 32" fill="none" stroke="currentColor" stroke-width="2"/>', 120, 'a sign that opens from a point to the right'),
    diminuendo: sign('<path d="M8 8L112 20M8 32L112 20" fill="none" stroke="currentColor" stroke-width="2"/>', 120, 'a sign that closes to a point on the right'),
    staccato: sign('<ellipse cx="30" cy="26" rx="6.4" ry="4.5" transform="rotate(-20 30 26)" fill="currentColor"/><path d="M35.6 24.5V0" stroke="currentColor" stroke-width="1.6"/><circle cx="30" cy="36" r="2.4" fill="currentColor"/>', 60, 'a note with a dot under it'),
    fermata: sign('<path d="M8 30A22 22 0 0 1 52 30" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="30" cy="27" r="3" fill="currentColor"/>', 60, 'an arch with a dot under it'),
    accent: sign('<path d="M20 3L38 8.5L20 14" fill="none" stroke="currentColor" stroke-width="2.4"/><ellipse cx="28" cy="33" rx="6.4" ry="4.5" transform="rotate(-20 28 33)" fill="currentColor"/><path d="M33.6 31.5V17" stroke="currentColor" stroke-width="1.6"/>', 60, 'a note with a sideways V above it'),
  };
  const DYN = ['pp', 'p', 'mp', 'mf', 'f', 'ff'];
  const dyn = d => `<b class="mus-dyn">${d}</b>`;
  A.skill({
    id: 'mus.dynamics', title: 'Dynamics and articulation',
    real: 'Dynamics make playing expressive: the same notes played softly and then loudly tell a different story.',
    mistakes: ['Thinking mp is louder than mf: mezzo piano is moderately soft, mezzo forte moderately loud.', 'Confusing staccato (short) with an accent (louder).'],
    learn: p(`<b>Dynamics</b> say how loud to play, using the Italian <i>piano</i> (soft) and <i>forte</i> (loud). From softest to loudest: <b>pp</b> (pianissimo, very soft), <b>p</b> (piano, soft), <b>mp</b> (mezzo piano, moderately soft), <b>mf</b> (mezzo forte, moderately loud), <b>f</b> (forte, loud) and <b>ff</b> (fortissimo, very loud).`) +
      p(`A <b>crescendo</b> (cresc., or a sign that opens out) means gradually louder; a <b>diminuendo</b> or decrescendo (dim., or a sign that closes up) means gradually softer. <b>Articulation</b> says how to play each note: a dot over or under it is <b>staccato</b> (short and detached), a curved slur means <b>legato</b> (smooth and connected), and a sideways V is an <b>accent</b>. A <b>fermata</b> means hold the note longer.`, `<span class="mus-pair">${DYN_SIGN.crescendo}${DYN_SIGN.diminuendo}</span>`) +
      example('Example', `Which is louder, ${dyn('mp')} or ${dyn('mf')}? Mezzo forte is moderately loud, so <b>mf</b>.`),
    make(rng) {
      const t = rng.pick(['order', 'order', 'mean', 'sign']);
      if (t === 'order') {
        const four = rng.sample(DYN, rng.pick([2, 4])), loud = rng.bool(), ans = four.slice().sort((a, b) => (loud ? DYN.indexOf(b) - DYN.indexOf(a) : DYN.indexOf(a) - DYN.indexOf(b)))[0];
        return { prompt: `Which dynamic marking is the ${loud ? 'loudest' : 'softest'}?`, type: 'choice', keepOrder: four.length === 2, answer: dyn(ans), choices: four.map(dyn), params: { t, four, loud, ans },
          hints: ['From softest to loudest: pp, p, mp, mf, f, ff.', `The ${loud ? 'loudest' : 'softest'} here is <b>${ans}</b> (${GLOSSARY[ans]}).`] };
      }
      if (t === 'mean') {
        const d = rng.pick(DYN.concat(['legato', 'staccato', 'crescendo', 'diminuendo'])), mean = GLOSSARY[d];
        const pool = DYN.concat(['legato', 'staccato', 'crescendo', 'diminuendo']).filter(x => x !== d).map(x => GLOSSARY[x]);
        return { prompt: `What does ${DYN.includes(d) ? dyn(d) : `<b>${d}</b>`} mean?`, type: 'choice', answer: mean, choices: options(mean, rng.shuffle(pool)), params: { t, d },
          hints: [DYN.includes(d) ? 'p is piano (soft), f is forte (loud), and m is mezzo (moderately).' : 'Crescendo and diminuendo are about volume; legato and staccato are about how the notes join.', `It means <b>${mean}</b>.`] };
      }
      const s = rng.pick(Object.keys(DYN_SIGN)), mean = GLOSSARY[s];
      return { prompt: `What does this sign mean?${DYN_SIGN[s]}`, type: 'choice', answer: mean, choices: options(mean, rng.shuffle(Object.keys(DYN_SIGN).filter(x => x !== s).map(x => GLOSSARY[x]).concat([GLOSSARY.legato]))), params: { t, s },
        hints: [s === 'crescendo' || s === 'diminuendo' ? 'A sign that opens out gets louder; one that closes up gets softer.' : 'A dot means short, an arch with a dot means hold, and a sideways V means stress the note.', `This is ${s === 'staccato' ? 'staccato' : s === 'fermata' ? 'a fermata' : s === 'accent' ? 'an accent' : 'a ' + s}: <b>${mean}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'order') { const ranks = P.four.map(d => DYN.indexOf(d)), want = DYN[P.loud ? Math.max(...ranks) : Math.min(...ranks)]; return q.answer === dyn(want) && want === P.ans; }
      return q.answer === GLOSSARY[P.t === 'mean' ? P.d : P.s];
    },
  });

  window.MUSIC = { staff, rhythm, keyboard, parse, midi, nm, posOf, BASE, TREBLE_READ, BASS_READ, note, LET, SH, FL };
})();
