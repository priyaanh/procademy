/* Hindi for beginners. A first course in reading and speaking Hindi for learners who read English: the
   Devanagari alphabet (vowels, consonants, and the vowel signs called matras), reading words, numbers, everyday
   words (greetings, family, food, school, colors, days and months, question words) and simple sentences.
   Every Hindi word is shown in Devanagari; romanized spellings help with the sounds (aa, ee and oo are the long
   vowels). Where the device has a Hindi voice, a Listen button says the word aloud (window.HINDI.say); without
   one the button stays hidden, and nothing ever depends on hearing. verify() checks each answer independently:
   romanized spellings against a transliteration of the Devanagari, meanings and sentence parts by lookup in
   tables kept apart from the generators, and numbers by arithmetic. The word lists also feed the Hindi
   flashcards (VOCAB, deck "hindi"). */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const p = s => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const key = s => A.normText(A.stripTags(s));
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  /** the answer plus up to n − 1 distractors that read differently from it and from each other */
  function options(answer, cands, n) {
    const out = [answer], seen = new Set([key(answer)]);
    for (const c of cands) { if (out.length >= (n || 4)) break; if (c == null) continue; const k = key(c); if (!seen.has(k)) { seen.add(k); out.push(c); } }
    return out;
  }

  /* ---------- hearing it: the device's own Hindi voice, where there is one ---------- */
  const hasSpeech = () => typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined';
  function hiVoice() {
    if (!hasSpeech()) return null;
    const vs = window.speechSynthesis.getVoices() || [], isHi = v => /^hi([-_]|$)/i.test(v.lang || '');
    return vs.find(v => isHi(v) && v.localService) || vs.find(isHi) || null;
  }
  /** say some Hindi aloud; false when this device has no Hindi voice */
  function say(text) {
    const v = hiVoice();
    if (!v || !text) return false;
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new window.SpeechSynthesisUtterance(text);
    u.lang = v.lang; u.voice = v; u.rate = 0.8;
    synth.speak(u);
    return true;
  }
  /** a Listen button (shown only when the device has a Hindi voice: html.hi-voice) */
  const listen = (text, label) => `<button type="button" class="btn ghost sm hi-say" data-hi="${text}" aria-label="${label || 'Listen to ' + text}">Listen</button>`;
  if (typeof document !== 'undefined' && hasSpeech()) {
    const mark = () => document.documentElement.classList.toggle('hi-voice', !!hiVoice());
    mark();
    if (window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', mark);
    document.addEventListener('click', ev => {
      const b = ev.target.closest && ev.target.closest('.hi-say');
      if (b) { ev.preventDefault(); say(b.dataset.hi); }
    });
    // Enter on a Listen button says the word; it doesn't also check the answer in the practice player
    document.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.closest && ev.target.closest('.hi-say')) ev.stopPropagation(); }, true);
  }

  /* ---------- how Hindi is shown ---------- */
  const hi = s => `<span class="hi" lang="hi">${s}</span>`;
  const big = (s, noListen) => `<div class="big hi-big"><span class="hi" lang="hi">${s}</span>${noListen || /_/.test(s) ? '' : listen(s)}</div>`;
  const rom = s => `<span class="hi-rom">${s}</span>`;
  const q = s => `“${s}”`;
  const cell = (dev, r) => `<span class="hi-cell"><span class="hi" lang="hi">${dev}</span><span class="hi-rom">${r}</span></span>`;
  const grid = (cells, sayAll) => `<div class="hi-grid-wrap"><div class="hi-grid">${cells.join('')}</div>${sayAll ? listen(sayAll, 'Listen to these') : ''}</div>`;
  const wordTable = list => `<div class="hi-grid-wrap">${M.table(['Hindi', 'Say it', 'Meaning'], list.map(w => [hi(w[0]), w[1], w[2]]), { compact: true })}${listen(list.map(w => w[0]).join('। '), 'Listen to these words')}</div>`;
  const cardsLink = p(`<a href="#/words/cards/hindi">Study these words as flashcards</a>, with spaced review: a word you know comes back less and less often.`);

  /* ---------- reading Devanagari in Latin letters (used by verify(): an independent check of every spelling) ---------- */
  const CONS_R = { 'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng', 'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny', 'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n', 'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n', 'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm', 'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h' };
  const NUKTA_R = { 'क': 'q', 'ख': 'kh', 'ग': 'gh', 'ज': 'z', 'फ': 'f', 'ड': 'r', 'ढ': 'rh' };
  const VOW_R = { 'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'ऑ': 'o' };
  const SIGN_R = { 'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ॉ': 'o' };
  function translit(dev) {
    const s = String(dev).normalize('NFD').replace(/ज्ञ/g, '\u0001');          // ज्ञ is said "gy"
    let out = '';
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      let base = c === '\u0001' ? 'gy' : CONS_R[c] || null;
      if (base != null) {
        if (s[i + 1] === '़') { base = NUKTA_R[c] || base; i++; }          // a dot below: ज़ z, फ़ f, ड़ r
        const nx = s[i + 1];
        if (nx === '्') { out += base; i++; }                               // halant: a half letter, no vowel
        else if (SIGN_R[nx]) { out += base + SIGN_R[nx]; i++; }
        else out += base + 'a';
        continue;
      }
      if (VOW_R[c]) out += VOW_R[c];
      else if (c === 'ं' || c === 'ँ') out += c === 'ं' && 'पफबभम'.includes(s[i + 1]) ? 'm' : 'n';        // the dot says m before p, ph, b, bh, m
      else if (c === 'ः') out += 'h';
      else if (c !== '़') out += c;
    }
    return out;
  }
  /** a spelling's bones: consonants and vowel qualities, ignoring vowel length, the silent "a", n and y (which romanized spellings vary on) */
  const skel = r => A.normText(r).replace(/w/g, 'v').replace(/aa/g, 'a').replace(/ee/g, 'i').replace(/oo/g, 'u').replace(/[^a-z]/g, '').replace(/[any]/g, '');
  const spells = (dev, r) => skel(translit(dev)) === skel(r);
  /** a word in the pieces it's read in: each letter with its signs, a half letter joined to the next (पा + नी, स्कू + ल) */
  function aksharas(dev) {
    const out = [];
    let joinNext = false;
    for (const ch of String(dev)) {
      const mark = /[ऀ-ःऺ-ॏ]/.test(ch);
      if (ch === ' ') { joinNext = false; continue; }
      if (!out.length || (!mark && !joinNext)) out.push(ch); else out[out.length - 1] += ch;
      joinNext = ch === '्';
    }
    return out;
  }

  /* ---------- the letters ---------- */
  // [letter, sound, like, matra]
  const VOWELS = [['अ', 'a', 'about', ''], ['आ', 'aa', 'father', 'ा'], ['इ', 'i', 'sit', 'ि'], ['ई', 'ee', 'see', 'ी'], ['उ', 'u', 'put', 'ु'], ['ऊ', 'oo', 'moon', 'ू'], ['ऋ', 'ri', 'rich', 'ृ'], ['ए', 'e', 'they', 'े'], ['ऐ', 'ai', 'hair', 'ै'], ['ओ', 'o', 'go', 'ो'], ['औ', 'au', 'saw', 'ौ']];
  const soundOf = v => `${v[1]}, as in ${v[2]}`;
  // [letter, sound, row, a word that starts with it: [word, romanized, meaning]]
  const CONS = [
    ['क', 'ka', 0, ['कबूतर', 'kabootar', 'pigeon']], ['ख', 'kha', 0, ['खरगोश', 'khargosh', 'rabbit']], ['ग', 'ga', 0, ['गाय', 'gaay', 'cow']], ['घ', 'gha', 0, ['घर', 'ghar', 'house']], ['ङ', 'nga', 0, null],
    ['च', 'cha', 1, ['चम्मच', 'chammach', 'spoon']], ['छ', 'chha', 1, ['छाता', 'chhaataa', 'umbrella']], ['ज', 'ja', 1, ['जहाज़', 'jahaaz', 'ship']], ['झ', 'jha', 1, ['झंडा', 'jhandaa', 'flag']], ['ञ', 'nya', 1, null],
    ['ट', 'ṭa', 2, ['टमाटर', 'tamaatar', 'tomato']], ['ठ', 'ṭha', 2, ['ठंडा', 'thandaa', 'cold']], ['ड', 'ḍa', 2, ['डमरू', 'damroo', 'hand drum']], ['ढ', 'ḍha', 2, ['ढोल', 'dhol', 'drum']], ['ण', 'ṇa', 2, null],
    ['त', 'ta', 3, ['तरबूज़', 'tarbooz', 'watermelon']], ['थ', 'tha', 3, ['थाली', 'thaalee', 'plate']], ['द', 'da', 3, ['दरवाज़ा', 'darvaazaa', 'door']], ['ध', 'dha', 3, ['धनुष', 'dhanush', 'bow, for arrows']], ['न', 'na', 3, ['नल', 'nal', 'tap']],
    ['प', 'pa', 4, ['पतंग', 'patang', 'kite']], ['फ', 'pha', 4, ['फल', 'phal', 'fruit']], ['ब', 'ba', 4, ['बतख', 'batakh', 'duck']], ['भ', 'bha', 4, ['भालू', 'bhaaloo', 'bear']], ['म', 'ma', 4, ['मछली', 'machhlee', 'fish']],
    ['य', 'ya', 5, ['यात्रा', 'yaatraa', 'trip']], ['र', 'ra', 5, ['रथ', 'rath', 'chariot']], ['ल', 'la', 5, ['लड़का', 'larkaa', 'boy']], ['व', 'va', 5, ['वन', 'van', 'forest']],
    ['श', 'sha', 6, ['शेर', 'sher', 'lion']], ['ष', 'ṣha', 6, ['षट्कोण', 'shatkon', 'hexagon']], ['स', 'sa', 6, ['सेब', 'seb', 'apple']], ['ह', 'ha', 6, ['हाथी', 'haathee', 'elephant']],
  ];
  const ROW_NAMES = ['the क row (said in the throat)', 'the च row (the tongue on the roof of the mouth)', 'the ट row (the tongue curled back)', 'the त row (the tongue on the teeth)', 'the प row (said with the lips)', 'य, र, ल, व', 'श, ष, स, ह'];
  const consOf = ch => CONS.find(c => c[0] === ch);
  const rowOf = r => CONS.filter(c => c[2] === r);
  const consCells = rows => rows.map(r => grid(rowOf(r).map(c => cell(c[0], c[1])), rowOf(r).map(c => c[0]).join(' '))).join('');

  /* ---------- word lists: [Devanagari, romanized, meaning] ---------- */
  const GREETINGS = [
    ['नमस्ते', 'namaste', 'hello'], ['धन्यवाद', 'dhanyavaad', 'thank you'], ['कृपया', 'kripayaa', 'please'], ['माफ़ कीजिए', 'maaf keejiye', 'excuse me'],
    ['हाँ', 'haan', 'yes'], ['नहीं', 'naheen', 'no'], ['ठीक है', 'theek hai', 'okay'], ['फिर मिलेंगे', 'phir milenge', 'see you again'],
    ['शुभ रात्रि', 'shubh raatri', 'good night'], ['सुप्रभात', 'suprabhaat', 'good morning'], ['स्वागत है', 'svaagat hai', 'welcome'],
    ['आप कैसे हैं?', 'aap kaise hain?', 'how are you?'], ['मैं ठीक हूँ', 'main theek hoon', 'I’m fine'], ['आपका नाम क्या है?', 'aapkaa naam kyaa hai?', 'what’s your name?'],
  ];
  const FAMILY = [
    ['माँ', 'maa', 'mother'], ['पिता', 'pitaa', 'father'], ['भाई', 'bhaai', 'brother'], ['बहन', 'bahan', 'sister'],
    ['दादा', 'daadaa', 'grandfather (father’s father)'], ['दादी', 'daadee', 'grandmother (father’s mother)'], ['नाना', 'naanaa', 'grandfather (mother’s father)'], ['नानी', 'naanee', 'grandmother (mother’s mother)'],
    ['बेटा', 'betaa', 'son'], ['बेटी', 'betee', 'daughter'], ['चाचा', 'chaachaa', 'uncle (father’s younger brother)'], ['मामा', 'maamaa', 'uncle (mother’s brother)'],
    ['बुआ', 'buaa', 'aunt (father’s sister)'], ['मौसी', 'mausee', 'aunt (mother’s sister)'], ['परिवार', 'parivaar', 'family'], ['दोस्त', 'dost', 'friend'],
  ];
  const FOOD = [
    ['पानी', 'paanee', 'water'], ['दूध', 'doodh', 'milk'], ['रोटी', 'rotee', 'roti (flatbread)'], ['चावल', 'chaaval', 'rice'], ['दाल', 'daal', 'dal (lentils)'],
    ['सब्ज़ी', 'sabzee', 'vegetables'], ['फल', 'phal', 'fruit'], ['सेब', 'seb', 'apple'], ['केला', 'kelaa', 'banana'], ['आम', 'aam', 'mango'],
    ['चाय', 'chaay', 'tea'], ['चीनी', 'cheenee', 'sugar'], ['नमक', 'namak', 'salt'], ['अंडा', 'andaa', 'egg'], ['दही', 'dahee', 'yogurt'],
    ['मिठाई', 'mithaai', 'sweets'], ['खाना', 'khaanaa', 'food'],
  ];
  const ANIMALS = [
    ['कुत्ता', 'kuttaa', 'dog'], ['बिल्ली', 'billee', 'cat'], ['गाय', 'gaay', 'cow'], ['घोड़ा', 'ghoraa', 'horse'], ['हाथी', 'haathee', 'elephant'],
    ['शेर', 'sher', 'lion'], ['बंदर', 'bandar', 'monkey'], ['चिड़िया', 'chiriyaa', 'bird'], ['मछली', 'machhlee', 'fish'], ['तोता', 'totaa', 'parrot'],
    ['मोर', 'mor', 'peacock'], ['ऊँट', 'oont', 'camel'], ['भालू', 'bhaaloo', 'bear'], ['चूहा', 'choohaa', 'mouse'],
  ];
  const BODY = [
    ['सिर', 'sir', 'head'], ['आँख', 'aankh', 'eye'], ['कान', 'kaan', 'ear'], ['नाक', 'naak', 'nose'], ['मुँह', 'munh', 'mouth'], ['हाथ', 'haath', 'hand'],
    ['पैर', 'pair', 'foot'], ['बाल', 'baal', 'hair'], ['दाँत', 'daant', 'tooth'], ['पेट', 'pet', 'stomach'], ['उँगली', 'ungalee', 'finger'],
  ];
  const SCHOOL = [
    ['स्कूल', 'skool', 'school'], ['किताब', 'kitaab', 'book'], ['कलम', 'kalam', 'pen'], ['पेंसिल', 'pensil', 'pencil'], ['कॉपी', 'kopee', 'notebook'],
    ['अध्यापक', 'adhyaapak', 'teacher'], ['छात्र', 'chhaatra', 'student'], ['कक्षा', 'kakshaa', 'class'], ['बस्ता', 'bastaa', 'school bag'], ['मेज़', 'mez', 'table'],
    ['कुर्सी', 'kursee', 'chair'], ['पाठ', 'paath', 'lesson'], ['गृहकार्य', 'grihkaarya', 'homework'], ['प्रश्न', 'prashn', 'question'], ['उत्तर', 'uttar', 'answer'],
  ];
  // [Devanagari, romanized, meaning, changes with the noun (an -आ word), swatch]
  const COLORS = [
    ['लाल', 'laal', 'red', false, '#d2403a'], ['नीला', 'neelaa', 'blue', true, '#2d6fe0'], ['हरा', 'haraa', 'green', true, '#23894a'], ['पीला', 'peelaa', 'yellow', true, '#f2c418'],
    ['काला', 'kaalaa', 'black', true, '#1d1f24'], ['सफ़ेद', 'safed', 'white', false, '#ffffff'], ['नारंगी', 'naarangee', 'orange', false, '#ef7d18'], ['गुलाबी', 'gulaabee', 'pink', false, '#ec7ab0'],
    ['बैंगनी', 'baingnee', 'purple', false, '#7a45c8'], ['भूरा', 'bhooraa', 'brown', true, '#8a5a2b'],
  ];
  const DAYS = [['सोमवार', 'somvaar', 'Monday', 'सोम, the moon'], ['मंगलवार', 'mangalvaar', 'Tuesday', 'मंगल, Mars'], ['बुधवार', 'budhvaar', 'Wednesday', 'बुध, Mercury'], ['गुरुवार', 'guruvaar', 'Thursday', 'गुरु, Jupiter'], ['शुक्रवार', 'shukravaar', 'Friday', 'शुक्र, Venus'], ['शनिवार', 'shanivaar', 'Saturday', 'शनि, Saturn'], ['रविवार', 'ravivaar', 'Sunday', 'रवि, the sun']];
  const TIME_WORDS = [['आज', 'aaj', 'today'], ['कल', 'kal', 'yesterday or tomorrow'], ['दिन', 'din', 'day'], ['सप्ताह', 'saptaah', 'week'], ['महीना', 'maheenaa', 'month'], ['साल', 'saal', 'year'], ['सुबह', 'subah', 'morning'], ['शाम', 'shaam', 'evening'], ['रात', 'raat', 'night']];
  const MONTHS = [['जनवरी', 'janvaree', 'January'], ['फ़रवरी', 'farvaree', 'February'], ['मार्च', 'maarch', 'March'], ['अप्रैल', 'aprail', 'April'], ['मई', 'maee', 'May'], ['जून', 'joon', 'June'], ['जुलाई', 'julaai', 'July'], ['अगस्त', 'agast', 'August'], ['सितंबर', 'sitambar', 'September'], ['अक्टूबर', 'aktoobar', 'October'], ['नवंबर', 'navambar', 'November'], ['दिसंबर', 'disambar', 'December']];
  const QWORDS = [['क्या', 'kyaa', 'what'], ['कौन', 'kaun', 'who'], ['कहाँ', 'kahaan', 'where'], ['कब', 'kab', 'when'], ['क्यों', 'kyon', 'why'], ['कैसे', 'kaise', 'how'], ['कितना', 'kitnaa', 'how much'], ['कितने', 'kitne', 'how many'], ['कौन-सा', 'kaun-saa', 'which']];
  // [number, word, romanized]
  const NUMS = [[1, 'एक', 'ek'], [2, 'दो', 'do'], [3, 'तीन', 'teen'], [4, 'चार', 'chaar'], [5, 'पाँच', 'paanch'], [6, 'छह', 'chhah'], [7, 'सात', 'saat'], [8, 'आठ', 'aath'], [9, 'नौ', 'nau'], [10, 'दस', 'das'],
    [11, 'ग्यारह', 'gyaarah'], [12, 'बारह', 'baarah'], [13, 'तेरह', 'terah'], [14, 'चौदह', 'chaudah'], [15, 'पंद्रह', 'pandrah'], [16, 'सोलह', 'solah'], [17, 'सत्रह', 'satrah'], [18, 'अठारह', 'athaarah'], [19, 'उन्नीस', 'unnees'], [20, 'बीस', 'bees'],
    [30, 'तीस', 'tees'], [40, 'चालीस', 'chaalees'], [50, 'पचास', 'pachaas'], [60, 'साठ', 'saath'], [70, 'सत्तर', 'sattar'], [80, 'अस्सी', 'assee'], [90, 'नब्बे', 'nabbe'], [100, 'सौ', 'sau']];
  const numWord = n => NUMS.find(x => x[0] === n);
  // reading practice: words with no vowel signs, words with them, nasal words, words with joined letters
  const PLAIN = [['घर', 'ghar', 'house'], ['कमल', 'kamal', 'lotus'], ['कलम', 'kalam', 'pen'], ['नमक', 'namak', 'salt'], ['जल', 'jal', 'water'], ['फल', 'phal', 'fruit'], ['बस', 'bas', 'bus'], ['मटर', 'matar', 'peas'],
    ['महल', 'mahal', 'palace'], ['नल', 'nal', 'tap'], ['शहर', 'shahar', 'city'], ['अदरक', 'adrak', 'ginger'], ['बतख', 'batakh', 'duck'], ['सरल', 'saral', 'easy'], ['रथ', 'rath', 'chariot'], ['वन', 'van', 'forest'],
    ['मगर', 'magar', 'crocodile'], ['सच', 'sach', 'truth'], ['अब', 'ab', 'now'], ['सब', 'sab', 'all']];
  const SIGNED = [['पानी', 'paanee', 'water'], ['किताब', 'kitaab', 'book'], ['दूध', 'doodh', 'milk'], ['सेब', 'seb', 'apple'], ['मोर', 'mor', 'peacock'], ['नाक', 'naak', 'nose'], ['कान', 'kaan', 'ear'], ['आम', 'aam', 'mango'],
    ['केला', 'kelaa', 'banana'], ['गाय', 'gaay', 'cow'], ['रोटी', 'rotee', 'roti (flatbread)'], ['तोता', 'totaa', 'parrot'], ['पैसा', 'paisaa', 'money'], ['मौसम', 'mausam', 'weather'], ['खिलौना', 'khilaunaa', 'toy'], ['दीवार', 'deevaar', 'wall'],
    ['ऊन', 'oon', 'wool'], ['गुलाब', 'gulaab', 'rose'], ['चाबी', 'chaabee', 'key'], ['मेला', 'melaa', 'fair'], ['लड़का', 'larkaa', 'boy'], ['लड़की', 'larkee', 'girl'], ['घोड़ा', 'ghoraa', 'horse']];
  const NASAL = [['हाँ', 'haan', 'yes'], ['नहीं', 'naheen', 'no'], ['माँ', 'maa', 'mother'], ['मैं', 'main', 'I'], ['हूँ', 'hoon', 'am'], ['आँख', 'aankh', 'eye'], ['चाँद', 'chaand', 'moon'], ['अंडा', 'andaa', 'egg'],
    ['पंखा', 'pankhaa', 'fan'], ['हिंदी', 'hindee', 'Hindi'], ['रंग', 'rang', 'color'], ['ऊँट', 'oont', 'camel'], ['दाँत', 'daant', 'tooth'], ['गेंद', 'gend', 'ball'], ['संतरा', 'santaraa', 'orange (the fruit)']];
  const NOT_NASAL = [['घर', 'ghar', 'house'], ['कमल', 'kamal', 'lotus'], ['पानी', 'paanee', 'water'], ['किताब', 'kitaab', 'book'], ['दूध', 'doodh', 'milk'], ['सेब', 'seb', 'apple'], ['फल', 'phal', 'fruit'], ['मोर', 'mor', 'peacock'], ['केला', 'kelaa', 'banana'], ['नाक', 'naak', 'nose']];
  const JOINED = [['क्या', 'kyaa', 'what'], ['प्यार', 'pyaar', 'love'], ['स्कूल', 'skool', 'school'], ['बच्चा', 'bachchaa', 'child'], ['अच्छा', 'achchhaa', 'good'], ['कुत्ता', 'kuttaa', 'dog'], ['बिल्ली', 'billee', 'cat'], ['मित्र', 'mitra', 'friend'],
    ['पत्र', 'patra', 'letter'], ['प्रश्न', 'prashn', 'question'], ['ग्यारह', 'gyaarah', 'eleven'], ['धन्यवाद', 'dhanyavaad', 'thank you'], ['नमस्ते', 'namaste', 'hello'], ['क्षमा', 'kshamaa', 'forgiveness'], ['ज्ञान', 'gyaan', 'knowledge'], ['गर्म', 'garm', 'hot'], ['सूर्य', 'soorya', 'sun']];

  /* every list a learner sees, in one index, for verify() */
  const INDEX = new Map();
  [GREETINGS, FAMILY, FOOD, ANIMALS, BODY, SCHOOL, COLORS, DAYS, TIME_WORDS, MONTHS, QWORDS, PLAIN, SIGNED, NASAL, NOT_NASAL, JOINED].forEach(list => list.forEach(w => { if (!INDEX.has(w[0])) INDEX.set(w[0], { rom: w[1], en: w[2] }); }));
  const meaningOf = dev => (INDEX.get(dev) || {}).en;

  const COURSE = {
    id: 'hindi', title: 'Hindi for beginners', subject: 'Middle school', grade: 6, icon: 'अ', hue: 28,
    blurb: 'Hindi from the very beginning: the Devanagari alphabet and its vowel signs, reading words, numbers, greetings, family, food, school, colors, days and months, question words, and simple sentences. For beginners of any age who read English; listed at grade 6.',
    units: [
      { id: 'vowels', title: 'Vowels', blurb: 'The vowel letters, from अ to औ, and which ones are short and long.', skills: ['hi.vowels', 'hi.vowel-pairs'] },
      { id: 'consonants', title: 'Consonants', blurb: 'The consonants row by row, sounds with a puff of air, and the two kinds of t and d.', skills: ['hi.consonants-1', 'hi.consonants-2', 'hi.consonants-3', 'hi.breathy', 'hi.curled'] },
      { id: 'matras', title: 'Vowel signs', blurb: 'The matras that add a vowel to a letter, the nasal signs, and joined letters.', skills: ['hi.matras', 'hi.syllables', 'hi.nasal', 'hi.joined'] },
      { id: 'reading', title: 'Reading words', blurb: 'Short words with no vowel signs, then words with them.', skills: ['hi.read-plain', 'hi.read-signs'] },
      { id: 'numbers', title: 'Numbers', blurb: 'Counting to 20, the tens up to 100, and the Devanagari digits.', skills: ['hi.numbers-10', 'hi.numbers-20', 'hi.tens', 'hi.digits'] },
      { id: 'greetings', title: 'Greetings and family', blurb: 'Saying hello, please and thank you, and the words for the people in a family.', skills: ['hi.greetings', 'hi.family'] },
      { id: 'everyday', title: 'Everyday words', blurb: 'Food and drink, animals, and the parts of the body.', skills: ['hi.food', 'hi.animals', 'hi.body'] },
      { id: 'school', title: 'School and colors', blurb: 'Things at school, and the colors, including the ones that change with the noun.', skills: ['hi.school', 'hi.colors'] },
      { id: 'time', title: 'Days and months', blurb: 'The days of the week, words for time, and the months of the year.', skills: ['hi.days', 'hi.months'] },
      { id: 'sentences', title: 'Simple sentences', blurb: 'Am, is and are; my, your and our; where things are; asking questions; and reading whole sentences.', skills: ['hi.to-be', 'hi.my', 'hi.place-words', 'hi.question-words', 'hi.meaning'] },
    ],
  };
  A.course(COURSE);

  /* ---------- Unit 1: vowels ---------- */
  A.skill({
    id: 'hi.vowels', title: 'Vowel letters',
    learn: p(`Hindi is written in <b>Devanagari</b>, the script also used for Sanskrit, Marathi and Nepali. It's read from left to right, and most letters hang from a line across the top called the <b>shirorekha</b>. There are no capital letters.`) +
      p(`The vowels (<span lang="hi">स्वर</span>, svar) come first in the alphabet. In this course, <b>aa, ee and oo are the long sounds</b>: say them for about twice as long as a, i and u.`) +
      grid(VOWELS.map(v => cell(v[0], v[1])), VOWELS.map(v => v[0]).join(' ')) +
      p(`Two more signs often finish the list: <span lang="hi">अं</span> (an, with a nasal n) and <span lang="hi">अः</span> (ah, with a breath of h).`) +
      example('Example', `${hi('ई')} says “ee”, as in see. It's the long partner of ${hi('इ')}, which says “i”, as in sit.`),
    make(rng) {
      const v = rng.pick(VOWELS), others = rng.shuffle(VOWELS.filter(x => x !== v));
      if (rng.bool()) {
        return { prompt: `Which letter says ${q(v[1])}, as in ${v[2]}?`, type: 'choice', answer: hi(v[0]), choices: options(hi(v[0]), others.map(x => hi(x[0]))), params: { kind: 'letter', letter: v[0], sound: v[1] },
          hints: [`Say the sound slowly. Long sounds (aa, ee, oo) have a longer letter than their short partners.`, `${q(v[1])}, as in ${v[2]}, is written <b>${hi(v[0])}</b>.`] };
      }
      const answer = soundOf(v);
      return { prompt: `What sound does this letter make?${big(v[0])}`, type: 'choice', answer, choices: options(answer, others.map(soundOf)), params: { kind: 'sound', letter: v[0] },
        hints: [`Compare it with the vowels you know: ${hi('अ')} is a, ${hi('आ')} is aa, ${hi('इ')} is i and ${hi('ई')} is ee.`, `${hi(v[0])} says <b>${answer}</b>.`] };
    },
    verify(qq) {
      const { kind, letter } = qq.params;
      return kind === 'letter' ? qq.answer === hi(letter) && translit(letter) === qq.params.sound : A.normText(qq.answer).split(' ')[0] === translit(letter);
    },
  });

  const PAIRS = [['अ', 'आ', 'a', 'aa'], ['इ', 'ई', 'i', 'ee'], ['उ', 'ऊ', 'u', 'oo']];
  const SIGN_PAIRS = [['ि', 'ी', 'i', 'ee'], ['ु', 'ू', 'u', 'oo']];
  const ring = m => `◌${m}`;
  A.skill({
    id: 'hi.vowel-pairs', title: 'Short and long vowels',
    learn: p(`Three vowels come in pairs: a short one and a long one. <b>The long vowel is the same sound held for longer</b>, and its letter is the short letter with something added.`) +
      grid([cell('अ', 'a'), cell('आ', 'aa'), cell('इ', 'i'), cell('ई', 'ee'), cell('उ', 'u'), cell('ऊ', 'oo')], 'अ आ इ ई उ ऊ') +
      p(`The vowel signs (matras) that go on other letters come in the same pairs: ${hi('ि')} is short i and ${hi('ी')} is long ee; ${hi('ु')} is short u and ${hi('ू')} is long oo. The length changes the meaning: ${hi('दिन')} (din) is a day, but ${hi('दीन')} (deen) means poor.`) +
      example('Example', `${hi('आ')} is ${hi('अ')} with an extra stroke. It says “aa”, as in father, while ${hi('अ')} says a short “a”, as in about.`),
    make(rng) {
      const form = rng.pick(['letter', 'letter', 'sign', 'longer']);
      if (form === 'longer') {
        const [s, l, sr, lr] = rng.pick(PAIRS);
        return { prompt: `${hi(s)} and ${hi(l)} make the same vowel sound. Which one is held longer?`, type: 'choice', keepOrder: true, answer: hi(l), choices: [hi(s), hi(l)], params: { kind: 'longer', s, l },
          hints: [`The long vowels are aa, ee and oo.`, `${hi(s)} says ${q(sr)} and ${hi(l)} says ${q(lr)}, so <b>${hi(l)}</b> is the long one.`] };
      }
      const set = form === 'letter' ? PAIRS : SIGN_PAIRS, [s, l, sr, lr] = rng.pick(set), wantLong = rng.bool();
      const show = form === 'letter' ? x => hi(x) : x => hi(ring(x)), from = wantLong ? s : l, to = wantLong ? l : s;
      const pool = form === 'letter' ? VOWELS.map(v => v[0]) : VOWELS.filter(v => v[3]).map(v => v[3]);
      const answer = show(to);
      return { prompt: `Which ${form === 'letter' ? 'letter' : 'vowel sign'} is the ${wantLong ? 'long' : 'short'} partner of ${show(from)}?`, type: 'choice', answer, choices: options(answer, [show(from)].concat(rng.shuffle(pool.filter(x => x !== s && x !== l)).map(show))), params: { kind: form, from, to, wantLong },
        hints: [`${show(from)} says ${q(wantLong ? sr : lr)}. Its partner says ${q(wantLong ? lr : sr)}.`, `The ${wantLong ? 'long' : 'short'} partner is <b>${answer}</b>.`] };
    },
    verify(qq) {
      const P = qq.params, said = ch => (P.kind === 'sign' ? translit('क' + ch).slice(1) : translit(ch));
      const len = ch => (['aa', 'ee', 'oo'].includes(said(ch)) ? 'long' : 'short'), sound = ch => ({ aa: 'a', ee: 'i', oo: 'u' }[said(ch)] || said(ch));
      if (P.kind === 'longer') return qq.answer === hi(P.l) && len(P.l) === 'long' && len(P.s) === 'short' && sound(P.l) === sound(P.s);
      const shown = P.kind === 'sign' ? hi(ring(P.to)) : hi(P.to);
      return qq.answer === shown && sound(P.from) === sound(P.to) && len(P.to) === (P.wantLong ? 'long' : 'short') && len(P.from) !== len(P.to);
    },
  });

  /* ---------- Unit 2: consonants ---------- */
  function consonantSkill(id, title, rows, learn) {
    A.skill({
      id, title, learn,
      make(rng) {
        const pool = CONS.filter(c => rows.includes(c[2])), c = rng.pick(pool), row = rowOf(c[2]);
        const near = rng.shuffle(pool.filter(x => x !== c));
        const form = rng.pick(c[3] ? ['letter', 'sound', 'next', 'word'] : ['letter', 'sound', 'next']);
        if (form === 'letter') {
          const answer = hi(c[0]);
          return { prompt: `Which letter says ${q(c[1])}?${c[2] === 2 ? ' (The tongue curls back.)' : ''}`, type: 'choice', answer, choices: options(answer, near.map(x => hi(x[0]))), params: { form, ch: c[0], said: c[1] },
            hints: [`It's in ${ROW_NAMES[c[2]]}: ${row.map(x => hi(x[0])).join(' ')}.`, `${q(c[1])} is written <b>${answer}</b>.`] };
        }
        if (form === 'sound') {
          return { prompt: `What sound does this letter make?${big(c[0])}`, type: 'choice', answer: c[1], choices: options(c[1], near.map(x => x[1])), params: { form, ch: c[0] },
            hints: [`It's in ${ROW_NAMES[c[2]]}: ${row.map(x => `${hi(x[0])} ${x[1]}`).join(', ')}.`, `${hi(c[0])} says <b>${c[1]}</b>.`] };
        }
        if (form === 'next') {
          const k = row.indexOf(c), at = k === 0 ? 1 : k, before = row.slice(0, at), answer = hi(row[at][0]);
          return { prompt: `Which letter comes next in the alphabet?${big(before.map(x => x[0]).join(' ') + ' ___', true)}`, type: 'choice', answer, choices: options(answer, rng.shuffle(row.slice(at + 1).concat(near)).map(x => hi(x[0]))), params: { form, before: before.map(x => x[0]), next: row[at][0] },
            hints: [`Say the row aloud: ${row.map(x => x[1]).join(', ')}.`, `After ${hi(before[before.length - 1][0])} comes <b>${answer}</b>.`] };
        }
        const [w, wr, we] = c[3], answer = hi(c[0]);
        return { prompt: `${q(we.split(',')[0])} in Hindi is ${q(wr)}. Which letter does it start with?${big(w)}`, type: 'choice', answer, choices: options(answer, near.map(x => hi(x[0]))), params: { form, ch: c[0], word: w, wr },
          hints: [`Look at the first letter of ${hi(w)}, and say ${q(wr)}: it starts with ${q(c[1].replace(/a$/, ''))}.`, `${hi(w)} starts with <b>${answer}</b> (${c[1]}).`] };
      },
      verify(qq) {
        const P = qq.params;
        if (P.form === 'letter') return qq.answer === hi(P.ch) && A.normText(translit(P.ch)) === A.normText(P.said);
        if (P.form === 'sound') return A.normText(qq.answer) === A.normText(translit(P.ch));
        if (P.form === 'next') { const all = CONS.map(c => c[0]), i = all.indexOf(P.before[P.before.length - 1]); return all[i + 1] === P.next && qq.answer === hi(P.next); }
        return P.word.normalize('NFD')[0] === P.ch && spells(P.word, P.wr) && qq.answer === hi(P.ch);
      },
    });
  }
  consonantSkill('hi.consonants-1', 'Consonants: the first two rows', [0, 1],
    p(`Hindi consonants (<span lang="hi">व्यंजन</span>, vyanjan) are grouped by <b>where in the mouth they're said</b>, five to a row, from the throat to the lips. Every consonant carries a short “a” until another vowel sign replaces it: ${hi('क')} is “ka”, not just “k”.`) +
    p(`The first row is said at the back of the mouth, in the throat. The second row is said with the middle of the tongue against the roof of the mouth.`) +
    consCells([0, 1]) +
    p(`In each row the second and fourth letters have a puff of air (an h): ${hi('क')} ka, ${hi('ख')} kha. The fifth letter is a nasal sound: ${hi('ङ')} is the “ng” in sing, and ${hi('ञ')} is the “ny” in canyon. They're rare at the start of a word.`) +
    example('Example', `${hi('कबूतर')} (kabootar, pigeon) starts with ${hi('क')}, and ${hi('घर')} (ghar, house) starts with ${hi('घ')}, said “gha” with a puff of air.`));
  consonantSkill('hi.consonants-2', 'Consonants: the middle rows', [2, 3],
    p(`The next two rows both sound like t, d and n to an English speaker, so listen for <b>where the tongue goes</b>. In the ${hi('ट')} row the tongue curls back and touches the roof of the mouth. In the ${hi('त')} row the tongue touches the back of the top teeth.`) +
    consCells([2, 3]) +
    p(`In this course a dot under a letter, as in ṭa, means the tongue curls back. ${hi('ण')} (ṇa) is a curled-back n, found inside words such as ${hi('बाण')} (baan, arrow).`) +
    example('Example', `${hi('टमाटर')} (tamaatar, tomato) starts with the curled-back ${hi('ट')}, and ${hi('तरबूज़')} (tarbooz, watermelon) starts with the soft ${hi('त')}.`));
  consonantSkill('hi.consonants-3', 'Consonants: the last rows', [4, 5, 6],
    p(`The ${hi('प')} row is said with the lips. After the five rows come <b>four in-between sounds</b>, ${hi('य र ल व')} (ya, ra, la, va), and <b>four hissing and breathing sounds</b>, ${hi('श ष स ह')} (sha, ṣha, sa, ha).`) +
    consCells([4, 5, 6]) +
    p(`${hi('श')} and ${hi('ष')} both sound like “sh” in modern Hindi. ${hi('व')} is between an English v and w, and ${hi('फ')} is a p with a puff of air, though many people say it like f.`) +
    example('Example', `${hi('शेर')} (sher, lion) starts with ${hi('श')}, and ${hi('हाथी')} (haathee, elephant) starts with ${hi('ह')}.`));

  const BREATH = [['क', 'ख'], ['ग', 'घ'], ['च', 'छ'], ['ज', 'झ'], ['ट', 'ठ'], ['ड', 'ढ'], ['त', 'थ'], ['द', 'ध'], ['प', 'फ'], ['ब', 'भ']];
  A.skill({
    id: 'hi.breathy', title: 'Sounds with a puff of air',
    learn: p(`Many Hindi consonants come in pairs: <b>the same sound without and with a puff of air</b>. Hold a hand in front of your mouth: ${hi('क')} (ka) barely moves the air, while ${hi('ख')} (kha) pushes out a puff. Romanized spellings show the puff with an h.`) +
      grid(BREATH.map(([a, b]) => cell(a + ' ' + b, consOf(a)[1] + ', ' + consOf(b)[1])), BREATH.map(x => x.join(' ')).join(' ')) +
      p(`The puff changes the word: ${hi('काना')} (kaanaa) means one-eyed, but ${hi('खाना')} (khaanaa) means food. The h in kha is not the h in English "hat": it's a breath straight after the first sound.`) +
      example('Example', `The partner of ${hi('ब')} (ba) with a puff of air is ${hi('भ')} (bha), as in ${hi('भालू')} (bhaaloo, bear).`),
    make(rng) {
      const [a, b] = rng.pick(BREATH), withPuff = rng.bool(), from = withPuff ? a : b, to = withPuff ? b : a;
      const row = rowOf(consOf(a)[2]).filter(x => x[0] !== from).map(x => x[0]), answer = hi(to);
      if (rng.chance(0.3)) {
        return { prompt: `Which letter is said with a puff of air?`, type: 'choice', keepOrder: true, answer: hi(b), choices: [hi(a), hi(b)], params: { kind: 'which', a, b },
          hints: [`The breathy sounds are written with an h in romanized spelling: ${consOf(a)[1]} and ${consOf(b)[1]}.`, `<b>${hi(b)}</b> (${consOf(b)[1]}) has the puff of air.`] };
      }
      return { prompt: `Which letter is ${hi(from)} (${consOf(from)[1]}) ${withPuff ? 'with' : 'without'} a puff of air?`, type: 'choice', answer, choices: options(answer, rng.shuffle(row).map(hi)), params: { kind: 'partner', from, to, withPuff },
        hints: [`${withPuff ? 'Add' : 'Take away'} the h: ${consOf(from)[1]} becomes ${consOf(to)[1]}.`, `It's <b>${answer}</b> (${consOf(to)[1]}).`] };
    },
    verify(qq) {
      const P = qq.params, r = ch => translit(ch).replace(/a$/, '');
      if (P.kind === 'which') return qq.answer === hi(P.b) && r(P.b) === r(P.a) + 'h';
      return P.withPuff ? r(P.to) === r(P.from) + 'h' : r(P.from) === r(P.to) + 'h';
    },
  });

  // [curled back, on the teeth], and words that start with each
  const CURL = [['ट', 'त'], ['ठ', 'थ'], ['ड', 'द'], ['ढ', 'ध'], ['ण', 'न']];
  const CURL_WORDS = [['टमाटर', 'tamaatar', 'tomato', 'ट'], ['ठंडा', 'thandaa', 'cold', 'ठ'], ['डमरू', 'damroo', 'hand drum', 'ड'], ['ढोल', 'dhol', 'drum', 'ढ'], ['ताला', 'taalaa', 'lock', 'त'], ['थाली', 'thaalee', 'plate', 'थ'], ['दरवाज़ा', 'darvaazaa', 'door', 'द'], ['धूप', 'dhoop', 'sunshine', 'ध'], ['नल', 'nal', 'tap', 'न'], ['तारा', 'taaraa', 'star', 'त'], ['डाक', 'daak', 'mail', 'ड'], ['दवा', 'davaa', 'medicine', 'द']];
  A.skill({
    id: 'hi.curled', title: 'Two kinds of t and d',
    learn: p(`English has one t and one d, but Hindi has two of each. For <b>${hi('ट ठ ड ढ ण')}</b>, curl the tip of the tongue back and touch the roof of the mouth. For <b>${hi('त थ द ध न')}</b>, touch the back of the top teeth with the tongue.`) +
      grid(CURL.map(([c, t]) => cell(c + ' ' + t, consOf(c)[1] + ', ' + consOf(t)[1])), CURL.map(x => x.join(' ')).join(' ')) +
      p(`The English t and d are closest to the curled-back ones, so Hindi speakers often write English words with ${hi('ट')} and ${hi('ड')}: ${hi('टेबल')} (table), ${hi('डॉक्टर')} (doctor). Learn each word with its own letter.`) +
      example('Example', `${hi('टमाटर')} (tamaatar, tomato) starts with the curled-back ${hi('ट')}. ${hi('ताला')} (taalaa, lock) starts with ${hi('त')}, on the teeth.`),
    make(rng) {
      if (rng.chance(0.55)) {
        const [w, wr, we, first] = rng.pick(CURL_WORDS), pair = CURL.find(x => x.includes(first)), row = CURL.flat().filter(x => !pair.includes(x)), answer = hi(first);
        return { prompt: `${q(we)} is ${q(wr)} in Hindi. Which letter does it start with?${big(w)}`, type: 'choice', answer, choices: options(answer, [hi(pair[0] === first ? pair[1] : pair[0])].concat(rng.shuffle(row).map(hi))), params: { kind: 'word', w, wr, first },
          hints: [`Look closely at the first letter of ${hi(w)}.`, `${hi(w)} starts with <b>${answer}</b>, said ${pair[0] === first ? 'with the tongue curled back' : 'with the tongue on the teeth'}.`] };
      }
      const [c, t] = rng.pick(CURL), curled = rng.bool(), answer = hi(curled ? c : t);
      return { prompt: `${hi(c)} and ${hi(t)} sound alike. Which one is said with the tongue ${curled ? 'curled back to the roof of the mouth' : 'touching the back of the top teeth'}?`, type: 'choice', keepOrder: true, answer, choices: [hi(c), hi(t)], params: { kind: 'pair', c, t, curled },
        hints: [`The curled-back letters are ${hi('ट ठ ड ढ ण')}; the ones on the teeth are ${hi('त थ द ध न')}.`, `It's <b>${answer}</b>.`] };
    },
    verify(qq) {
      const P = qq.params, curledSet = 'टठडढण';
      if (P.kind === 'word') return P.w.normalize('NFD')[0] === P.first && spells(P.w, P.wr) && qq.answer === hi(P.first);
      return qq.answer === hi(P.curled ? P.c : P.t) && curledSet.includes(P.c) && !curledSet.includes(P.t);
    },
  });

  /* ---------- Unit 3: vowel signs ---------- */
  const SIGNS = VOWELS.filter(v => v[3]);
  const SYL_CONS = 'क ख ग घ च छ ज झ ट ठ ड त थ द ध न प फ ब भ म य र ल व श स ह'.split(' ');
  const syl = (c, v) => c + v[3];
  const sylSaid = (c, v) => consOf(c)[1].replace(/a$/, '') + v[1];
  A.skill({
    id: 'hi.matras', title: 'Vowel signs (matras)',
    learn: p(`After a consonant, a vowel is written as a small <b>sign called a matra</b>, not as a whole letter. The sign can sit after the letter, above it, below it, or even before it. Here is ${hi('क')} with each one:`) +
      grid(SIGNS.map(v => cell(syl('क', v), 'k' + v[1])), SIGNS.map(v => syl('क', v)).join(' ')) +
      p(`<b>${hi('ि')} is written before the letter but said after it</b>: ${hi('कि')} is “ki”. With ${hi('र')}, the u signs join the letter in a special way: ${hi('रु')} (ru) and ${hi('रू')} (roo).`) +
      example('Example', `${hi('क')} + ${hi(ring('ी'))} = ${hi('की')}, said “kee”. ${hi('क')} + ${hi(ring('ो'))} = ${hi('को')}, said “ko”.`),
    make(rng) {
      const v = rng.pick(SIGNS), others = rng.shuffle(SIGNS.filter(x => x !== v)), c = rng.pick(['क', 'क', 'म', 'स']);
      const form = rng.pick(['which', 'read', 'sign']);
      if (form === 'which') {
        const answer = hi(syl(c, v));
        return { prompt: `Which one says ${q(sylSaid(c, v))}?`, type: 'choice', answer, choices: options(answer, others.map(x => hi(syl(c, x)))), params: { form, c, m: v[3], said: sylSaid(c, v) },
          hints: [`Find the sign for ${q(v[1])}: ${hi(ring(v[3]))}.`, `${q(sylSaid(c, v))} is <b>${answer}</b>.`] };
      }
      if (form === 'read') {
        const answer = sylSaid(c, v);
        return { prompt: `How do you read this?${big(syl(c, v))}`, type: 'choice', answer, choices: options(answer, others.map(x => sylSaid(c, x))), params: { form, c, m: v[3] },
          hints: [`The letter is ${hi(c)} (${consOf(c)[1]}) and the sign is ${hi(ring(v[3]))}, which says ${q(v[1])}.`, `It says <b>${answer}</b>.`] };
      }
      const answer = hi(ring(v[3]));
      return { prompt: `Which vowel sign says ${q(v[1])}, as in ${v[2]}?`, type: 'choice', answer, choices: options(answer, others.map(x => hi(ring(x[3])))), params: { form, m: v[3], said: v[1] },
        hints: [`Each sign matches a vowel letter: ${q(v[1])} is the letter ${hi(v[0])}.`, `The sign is <b>${answer}</b>, as in ${hi(syl('क', v))} (k${v[1]}).`] };
    },
    verify(qq) {
      const P = qq.params;
      if (P.form === 'which') return qq.answer === hi(P.c + P.m) && A.normText(translit(P.c + P.m)) === A.normText(P.said);
      if (P.form === 'read') return A.normText(qq.answer) === A.normText(translit(P.c + P.m));
      return qq.answer === hi(ring(P.m)) && translit('क' + P.m) === 'k' + P.said;
    },
  });

  A.skill({
    id: 'hi.syllables', title: 'Letters with vowel signs',
    learn: p(`Any consonant can take any vowel sign. To read one, <b>say the consonant without its “a”, then the vowel</b>: ${hi('म')} (ma) + ${hi(ring('ू'))} (oo) = ${hi('मू')}, “moo”.`) +
      grid(SIGNS.map(v => cell(syl('स', v), 's' + v[1])), SIGNS.map(v => syl('स', v)).join(' ')) +
      p(`Watch the signs that look alike: ${hi(ring('े'))} (e) has one stroke on top and ${hi(ring('ै'))} (ai) has two; ${hi(ring('ो'))} (o) has one and ${hi(ring('ौ'))} (au) has two.`) +
      example('Example', `${hi('बे')} is ${hi('ब')} + ${hi(ring('े'))}: “be”. ${hi('बै')} has two strokes: “bai”.`),
    make(rng) {
      const c = rng.pick(SYL_CONS), v = rng.pick(SIGNS), others = rng.shuffle(SIGNS.filter(x => x !== v));
      if (rng.bool()) {
        const answer = sylSaid(c, v);
        return { prompt: `How do you read this?${big(syl(c, v))}`, type: 'choice', answer, choices: options(answer, others.map(x => sylSaid(c, x))), params: { form: 'read', s: syl(c, v) },
          hints: [`Say ${hi(c)} without its “a”: ${q(consOf(c)[1].replace(/a$/, ''))}. Then add the vowel of ${hi(ring(v[3]))}.`, `It says <b>${answer}</b>.`] };
      }
      const answer = hi(syl(c, v)), near = rng.shuffle(SYL_CONS.filter(x => x !== c)).slice(0, 2);
      const cands = others.slice(0, 2).map(x => hi(syl(c, x))).concat(near.map(x => hi(syl(x, v))));
      return { prompt: `Which one says ${q(sylSaid(c, v))}?`, type: 'choice', answer, choices: options(answer, rng.shuffle(cands)), params: { form: 'which', s: syl(c, v), said: sylSaid(c, v) },
        hints: [`Find the letter ${hi(c)} (${consOf(c)[1]}) with the sign for ${q(v[1])}.`, `${q(sylSaid(c, v))} is <b>${answer}</b>.`] };
    },
    verify(qq) {
      const P = qq.params;
      if (P.form === 'read') return A.normText(qq.answer) === A.normText(translit(P.s));
      return qq.answer === hi(P.s) && A.normText(translit(P.s)) === A.normText(P.said);
    },
  });

  A.skill({
    id: 'hi.nasal', title: 'The nasal signs',
    learn: p(`Two signs above a letter add a sound through the nose. <b>The dot ${hi(ring('ं'))} (bindu, or anusvara)</b> usually adds an n or m sound before the next letter: ${hi('अंडा')} is “andaa”, egg, and ${hi('हिंदी')} is “hindee”.`) +
      p(`<b>The moon with a dot ${hi(ring('ँ'))} (chandrabindu)</b> makes the vowel itself nasal, as if you said it through your nose: ${hi('माँ')} (maa, mother), ${hi('हाँ')} (haan, yes), ${hi('चाँद')} (chaand, moon). When a vowel sign already sits above the line, only the dot fits, as in ${hi('मैं')} (main, I) and ${hi('नहीं')} (naheen, no).`) +
      wordTable(NASAL.slice(0, 8)) +
      example('Example', `${hi('पंखा')} (pankhaa, fan) has the dot over ${hi('प')}: say “pan”, then “khaa”.`),
    make(rng) {
      const w = rng.pick(NASAL), form = rng.pick(['which', 'read', 'read']);
      if (form === 'which') {
        const answer = hi(w[0]);
        return { prompt: `Which word has a nasal sign (${hi(ring('ं'))} or ${hi(ring('ँ'))})?`, type: 'choice', answer, choices: options(answer, rng.sample(NOT_NASAL, 3).map(x => hi(x[0]))), params: { form, w: w[0] },
          hints: [`Look above the letters for a dot, or a moon with a dot.`, `<b>${answer}</b> (${w[1]}, ${w[2]}) has one.`] };
      }
      const answer = w[1];
      return { prompt: `How do you read this word?${big(w[0])}`, type: 'choice', answer, choices: options(answer, rng.shuffle(NASAL.filter(x => x !== w)).map(x => x[1])), params: { form, w: w[0] },
        hints: [`Read it letter by letter, and let the sign above add a nasal sound.`, `${hi(w[0])} says <b>${answer}</b> and means ${w[2]}.`] };
    },
    verify(qq) {
      const P = qq.params;
      if (P.form === 'which') return qq.answer === hi(P.w) && /[ंँ]/.test(P.w) && qq.choices.filter(c => /[ंँ]/.test(c)).length === 1;
      return spells(P.w, qq.answer) && /n/.test(translit(P.w));
    },
  });

  A.skill({
    id: 'hi.joined', title: 'Half letters and joined letters',
    learn: p(`When two consonants come together with no vowel between them, the first one loses its “a” and is written as a <b>half letter</b> joined to the next: ${hi('स')} + ${hi('क')} becomes ${hi('स्क')}, as in ${hi('स्कूल')} (skool, school). A small slanted stroke under a letter, ${hi('्')}, does the same job when there's no half form.`) +
      p(`A few joined letters look new: ${hi('क्ष')} (ksh), ${hi('त्र')} (tr), ${hi('ज्ञ')} (gy) and ${hi('श्र')} (shr). ${hi('र')} changes shape too: after a letter it's a small slanted stroke, as in ${hi('प्रश्न')} (prashn, question); before a letter it's a hook on top, as in ${hi('गर्म')} (garm, hot).`) +
      wordTable(JOINED.slice(0, 8)) +
      example('Example', `${hi('बच्चा')} is ${hi('ब')} + half ${hi('च')} + ${hi('चा')}: “bach-chaa”, child.`),
    make(rng) {
      const w = rng.pick(JOINED), others = rng.shuffle(JOINED.filter(x => x !== w));
      if (rng.bool()) {
        return { prompt: `How do you read this word?${big(w[0])}`, type: 'choice', answer: w[1], choices: options(w[1], others.map(x => x[1])), params: { form: 'read', w: w[0] },
          hints: [`Find the joined letters first, and say the half letter with no “a” after it.`, `${hi(w[0])} says <b>${w[1]}</b> and means ${w[2]}.`] };
      }
      const answer = hi(w[0]);
      return { prompt: `Which word says ${q(w[1])} (${w[2]})?`, type: 'choice', answer, choices: options(answer, others.map(x => hi(x[0]))), params: { form: 'which', w: w[0], said: w[1] },
        hints: [`Sound out each choice, joined letters together.`, `${q(w[1])} is <b>${answer}</b>.`] };
    },
    verify(qq) {
      const P = qq.params;
      return /्/.test(P.w) && (P.form === 'read' ? spells(P.w, qq.answer) : qq.answer === hi(P.w) && spells(P.w, P.said));
    },
  });

  /* ---------- Unit 4: reading words ---------- */
  function readingSkill(id, title, list, learn) {
    A.skill({
      id, title, learn,
      make(rng) {
        const w = rng.pick(list), others = rng.shuffle(list.filter(x => x !== w)), form = rng.pick(['read', 'which', 'mean']);
        if (form === 'read') {
          return { prompt: `How do you read this word?${big(w[0])}`, type: 'choice', answer: w[1], choices: options(w[1], others.map(x => x[1])), params: { form, w: w[0] },
            hints: [`Read it a piece at a time: ${aksharas(w[0]).map(hi).join(' + ')}.`, `${hi(w[0])} says <b>${w[1]}</b> (${w[2]}).`] };
        }
        if (form === 'which') {
          const answer = hi(w[0]);
          return { prompt: `Which word says ${q(w[1])}?`, type: 'choice', answer, choices: options(answer, others.map(x => hi(x[0]))), params: { form, w: w[0], said: w[1] },
            hints: [`Sound out each word slowly. Words that look alike can have their letters in a different order.`, `${q(w[1])} is <b>${answer}</b>.`] };
        }
        const answer = cap(w[2]);
        return { prompt: `Read this word. What does it mean?${big(w[0])}`, type: 'choice', answer, choices: options(answer, others.map(x => cap(x[2]))), params: { form, w: w[0], en: w[2] },
          hints: [`Sound it out first: it says ${q(w[1])}.`, `${hi(w[0])} (${w[1]}) means <b>${w[2]}</b>.`] };
      },
      verify(qq) {
        const P = qq.params;
        if (P.form === 'read') return spells(P.w, qq.answer);
        if (P.form === 'which') return qq.answer === hi(P.w) && spells(P.w, P.said);
        return meaningOf(P.w) === P.en && A.normText(qq.answer) === A.normText(P.en);
      },
    });
  }
  readingSkill('hi.read-plain', 'Words with no vowel signs', PLAIN,
    p(`The easiest words to read have no vowel signs at all: every letter keeps its short “a”. <b>The “a” of the last letter is usually silent</b>, so ${hi('घर')} is “ghar”, not “ghara”, and ${hi('कमल')} is “kamal”.`) +
    p(`In longer words a middle “a” can drop too: ${hi('अदरक')} (ginger) is said “adrak”. Look carefully at the order of the letters: ${hi('कमल')} (kamal) is a lotus, but ${hi('कलम')} (kalam) is a pen.`) +
    wordTable(PLAIN.slice(0, 8)) +
    example('Example', `${hi('नमक')} is ${hi('न')} + ${hi('म')} + ${hi('क')}: na-ma-k, said <b>namak</b>. It means salt.`));
  readingSkill('hi.read-signs', 'Words with vowel signs', SIGNED,
    p(`Most words mix letters and vowel signs. <b>Read each letter together with its sign</b>, then put the pieces together. Remember that ${hi(ring('ि'))} comes before its letter on the page but is said after it.`) +
    wordTable(SIGNED.slice(0, 8)) +
    p(`A letter with no sign still says its short “a”, except usually at the end of the word: ${hi('किताब')} is ki-taa-b, “kitaab”.`) +
    example('Example', `${hi('पानी')} is ${hi('पा')} (paa) + ${hi('नी')} (nee): <b>paanee</b>, water.`));

  /* ---------- Unit 5: numbers ---------- */
  const DIG = n => String(n).replace(/\d/g, d => String.fromCharCode(0x966 + Number(d)));
  const fromDig = s => Number(String(s).replace(/[०-९]/g, d => String(d.charCodeAt(0) - 0x966)));
  function numberSkill(id, title, nums, learn, extra) {
    A.skill({
      id, title, learn,
      make(rng) {
        const [n, w, wr] = rng.pick(nums), others = rng.shuffle(nums.filter(x => x[0] !== n));
        const form = rng.pick(['value', 'word', 'value', extra ? 'extra' : 'word']);
        if (form === 'value') {
          return { prompt: `What number is this?${big(w)}`, type: 'number', answer: n, params: { form, w },
            hints: [`It's said ${q(wr)}.`, `${hi(w)} is <b>${n}</b>.`] };
        }
        if (form === 'word') {
          const answer = hi(w);
          return { prompt: `How do you write ${n} in Hindi?`, type: 'choice', answer, choices: options(answer, others.map(x => hi(x[1]))), params: { form, n },
            hints: [`${n} is said ${q(wr)}.`, `${n} is <b>${answer}</b> (${wr}).`] };
        }
        return extra(rng, n, w, wr, others);
      },
      verify(qq) {
        const P = qq.params, look = new Map(NUMS.map(x => [x[1], x[0]]));
        if (P.form === 'value') return look.get(P.w) === qq.answer && spells(P.w, NUMS.find(x => x[1] === P.w)[2]);
        if (P.form === 'word') return look.get(A.stripTags(qq.answer).trim()) === P.n;
        if (P.form === 'next') return look.get(A.stripTags(qq.answer).trim()) === look.get(P.w) + P.step;
        if (P.form === 'sum') return qq.answer === look.get(P.a) + look.get(P.b);
        return false;
      },
    });
  }
  const nextExtra = step => (rng, n, w, wr, others) => {
    const after = numWord(n + step);
    if (!after) { const a = numWord(n - step); return { prompt: `Which number comes just before ${hi(w)} (${wr})?`, type: 'choice', answer: hi(a[1]), choices: options(hi(a[1]), others.map(x => hi(x[1]))), params: { form: 'next', w, step: -step }, hints: [`${hi(w)} is ${n}. Count back ${step}.`, `${n - step} is <b>${hi(a[1])}</b> (${a[2]}).`] }; }
    return { prompt: `Which number comes right after ${hi(w)} (${wr})?`, type: 'choice', answer: hi(after[1]), choices: options(hi(after[1]), others.map(x => hi(x[1]))), params: { form: 'next', w, step },
      hints: [`${hi(w)} is ${n}. Count on ${step}.`, `${n + step} is <b>${hi(after[1])}</b> (${after[2]}).`] };
  };
  numberSkill('hi.numbers-10', 'Numbers 1 to 10', NUMS.slice(0, 10),
    p(`Counting is one of the most useful things to learn first. Here are the numbers one to ten (<span lang="hi">गिनती</span>, gintee, means counting):`) +
    grid(NUMS.slice(0, 10).map(([n, w, r]) => cell(w, `${r}, ${n}`)), NUMS.slice(0, 10).map(x => x[1]).join(' ')) +
    p(`<b>Learn them aloud, in order</b>, a few at a time. Six is also written ${hi('छः')}, with the same sound, chhah.`) +
    example('Example', `${hi('तीन')} (teen) is 3, and ${hi('सात')} (saat) is 7. ${hi('तीन')} + ${hi('चार')} = ${hi('सात')}: 3 + 4 = 7.`), nextExtra(1));
  numberSkill('hi.numbers-20', 'Numbers 11 to 20', NUMS.slice(10, 20),
    p(`The numbers from eleven to twenty each have their own word, but <b>most of them end in ${hi('ह')} (-ah)</b>, like the English -teen. Many of them echo one to ten: ${hi('चार')} (chaar, 4) and ${hi('चौदह')} (chaudah, 14).`) +
    grid(NUMS.slice(10, 20).map(([n, w, r]) => cell(w, `${r}, ${n}`)), NUMS.slice(10, 20).map(x => x[1]).join(' ')) +
    p(`${hi('उन्नीस')} (unnees, 19) means “one less than twenty”, ${hi('बीस')} (bees).`) +
    example('Example', `${hi('पंद्रह')} (pandrah) is 15, a little like ${hi('पाँच')} (paanch), 5.`), nextExtra(1));
  numberSkill('hi.tens', 'Tens to 100', NUMS.filter(x => x[0] % 10 === 0),
    p(`Here are the tens. Hindi has a separate word for every number up to 100, so <b>the tens are good landmarks</b> to learn first.`) +
    grid(NUMS.filter(x => x[0] % 10 === 0).map(([n, w, r]) => cell(w, `${r}, ${n}`)), NUMS.filter(x => x[0] % 10 === 0).map(x => x[1]).join(' ')) +
    p(`A thousand is ${hi('हज़ार')} (hazaar). Prices in rupees often use these words: ${hi('पचास रुपये')} (pachaas rupaye) is fifty rupees.`) +
    example('Example', `${hi('बीस')} + ${hi('तीस')} = ${hi('पचास')}: 20 + 30 = 50.`),
    (rng, n, w, wr) => {
      const tens = NUMS.filter(x => x[0] % 10 === 0), small = tens.filter(x => x[0] <= 50), a = rng.pick(small), b = rng.pick(tens.filter(x => x[0] + a[0] <= 100));
      return { prompt: `Add. Write the answer as a number.${big(`${a[1]} + ${b[1]}`, true)}`, type: 'number', answer: a[0] + b[0], params: { form: 'sum', a: a[1], b: b[1] },
        hints: [`${hi(a[1])} is ${a[0]} and ${hi(b[1])} is ${b[0]}.`, `${a[0]} + ${b[0]} = <b>${a[0] + b[0]}</b>.`] };
    });
  A.skill({
    id: 'hi.digits', title: 'Devanagari digits',
    learn: p(`Hindi can be written with the same digits as English (1, 2, 3), but books, signs and calendars often use the <b>Devanagari digits</b>. They work exactly the same way, with place value: only the shapes are different.`) +
      grid([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => cell(DIG(d), String(d)))) +
      p(`Watch out for look-alikes: <b>${hi('१')} is 1, not 9</b>, and ${hi('४')} is 4, even though it looks a little like an 8. ${hi('९')} is 9.`) +
      example('Example', `${hi('४७')} is 47: ${hi('४')} is 4 tens and ${hi('७')} is 7 ones.`),
    make(rng) {
      const n = rng.pick([rng.int(10, 99), rng.int(10, 99), rng.int(100, 999), rng.int(1, 9)]), form = rng.pick(['read', 'read', 'write']);
      if (form === 'read') return { prompt: `What number is this?${big(DIG(n), true)}`, type: 'number', answer: n, params: { form, shown: DIG(n) },
        hints: [`Read each digit: ${[...DIG(n)].map(d => `${hi(d)} is ${fromDig(d)}`).join(', ')}.`, `${hi(DIG(n))} is <b>${n}</b>.`] };
      const s = String(n), cands = [s.split('').reverse().join(''), s.replace(/1/g, '9'), s.replace(/9/g, '1'), s.replace(/4/g, '8'), String(n + 10), String(Math.max(1, n - 1)), String(n + 1)].filter(x => x !== s && !/^0/.test(x));
      const answer = hi(DIG(n));
      return { prompt: `Which shows ${n} in Devanagari digits?`, type: 'choice', answer, choices: options(answer, rng.shuffle(cands).map(x => hi(DIG(x)))), params: { form, n },
        hints: [`Write each digit of ${n} in turn: ${s.split('').map(d => `${d} is ${hi(DIG(d))}`).join(', ')}.`, `${n} is <b>${answer}</b>.`] };
    },
    verify(qq) {
      const P = qq.params;
      if (P.form === 'read') return fromDig(P.shown) === qq.answer;
      return fromDig(A.stripTags(qq.answer).trim()) === P.n;
    },
  });

  /* ---------- Units 6 to 8: everyday words ---------- */
  /** a vocabulary skill: meaning, the word for a meaning, and the word for a sound */
  function vocabSkill(id, title, list, learn, extra) {
    A.skill({
      id, title, learn,
      make(rng) {
        const w = rng.pick(list), others = rng.shuffle(list.filter(x => x !== w && x[2] !== w[2]));
        const form = rng.pick(['mean', 'mean', 'word', 'said'].concat(extra ? ['extra', 'extra'] : []));
        if (form === 'extra') { const x = extra(rng, w, others); if (x) return x; }
        if (form === 'mean' || form === 'extra') {
          const answer = cap(w[2]);
          return { prompt: `What does this mean?${big(w[0])}<p class="hi-say-it">Say it: ${rom(w[1])}</p>`, type: 'choice', answer, choices: options(answer, others.map(x => cap(x[2]))), params: { form: 'mean', w: w[0], en: w[2], said: w[1] },
            hints: [`Think of where you'd hear ${q(w[1])}.`, `${hi(w[0])} (${w[1]}) means <b>${w[2]}</b>.`] };
        }
        const answer = hi(w[0]);
        if (form === 'word') {
          return { prompt: `Which is the Hindi for ${q(w[2])}?`, type: 'choice', answer, choices: options(answer, others.map(x => hi(x[0]))), params: { form, w: w[0], en: w[2] },
            hints: [`It's said ${q(w[1])}. Sound out each choice.`, `${q(w[2])} is <b>${answer}</b> (${w[1]}).`] };
        }
        return { prompt: `Which word is said ${q(w[1])}?`, type: 'choice', answer, choices: options(answer, others.map(x => hi(x[0]))), params: { form, w: w[0], said: w[1] },
          hints: [`Read each choice letter by letter.`, `${q(w[1])} is <b>${answer}</b>, which means ${w[2]}.`] };
      },
      verify(qq) {
        const P = qq.params;
        if (P.form === 'mean') return meaningOf(P.w) === P.en && A.normText(qq.answer) === A.normText(P.en) && spells(P.w, P.said);
        if (P.form === 'word') return meaningOf(A.stripTags(qq.answer).trim()) === P.en;
        if (P.form === 'said') return qq.answer === hi(P.w) && spells(P.w, P.said);
        if (P.form === 'agree') return A.stripTags(qq.answer).trim() === P.color.slice(0, -1) + { m: 'ा', f: 'ी', mp: 'े' }[P.g];
        if (P.form === 'swatch') return meaningOf(A.stripTags(qq.answer).trim()) === P.en;
        if (P.form === 'next-day') { const i = DAYS.findIndex(d => d[0] === P.w); return A.stripTags(qq.answer).trim() === DAYS[(i + P.step + 7) % 7][0]; }
        if (P.form === 'next-month') { const i = MONTHS.findIndex(d => d[0] === P.w); return A.stripTags(qq.answer).trim() === MONTHS[(i + 1) % 12][0]; }
        if (P.form === 'month-days') return qq.answer === new Date(2026, P.m + 1, 0).getDate();
        if (P.form === 'time') return meaningOf(P.w) === P.en && A.normText(qq.answer) === A.normText(P.en);
        return false;
      },
    });
  }
  vocabSkill('hi.greetings', 'Greetings and polite words', GREETINGS,
    p(`<b>${hi('नमस्ते')} (namaste)</b> is the everyday way to say hello, and goodbye too, often with the palms pressed together. It's polite with anyone, young or old.`) +
    p(`Hindi has a polite “you”, ${hi('आप')} (aap), and a friendly one, ${hi('तुम')} (tum). Use ${hi('आप')} with adults and people you don't know well. ${hi('शुक्रिया')} (shukriyaa) is another common way to say thank you.`) +
    wordTable(GREETINGS) + cardsLink +
    example('Example', `“${hi('आपका नाम क्या है?')}” (aapkaa naam kyaa hai?) means “What's your name?” Answer: “${hi('मेरा नाम अनु है।')}” (meraa naam Anu hai), “My name is Anu.”`));
  vocabSkill('hi.family', 'Family', FAMILY,
    p(`Hindi is more exact than English about family. <b>Grandparents and uncles and aunts have different words on the father's side and the mother's side</b>: your father's mother is ${hi('दादी')} (daadee), and your mother's mother is ${hi('नानी')} (naanee).`) +
    wordTable(FAMILY) +
    p(`Many families also say ${hi('मम्मी')} (mummy) and ${hi('पापा')} (papa). Older relatives are spoken of politely, with ${hi('आप')} and plural verbs. ${hi('चाचा')}'s wife is ${hi('चाची')} (chaachee), and ${hi('मामा')}'s wife is ${hi('मामी')} (maamee).`) + cardsLink +
    example('Example', `${hi('यह मेरी बहन है।')} (yah meree bahan hai) means “This is my sister.”`));
  vocabSkill('hi.food', 'Food and drink', FOOD,
    p(`Food words are some of the most useful words to know. A typical meal might be <b>${hi('दाल')}, ${hi('चावल')}, ${hi('रोटी')} and ${hi('सब्ज़ी')}</b>: lentils, rice, flatbread and cooked vegetables.`) +
    wordTable(FOOD) +
    p(`${hi('खाना')} (khaanaa) means food, and also “to eat”. To say you like something, use ${hi('मुझे … पसंद है')}: ${hi('मुझे आम पसंद है।')} (mujhe aam pasand hai), “I like mango.”`) + cardsLink +
    example('Example', `${hi('पानी')} (paanee) is water and ${hi('दूध')} (doodh) is milk.`));
  vocabSkill('hi.animals', 'Animals', ANIMALS,
    p(`Here are common animals (<span lang="hi">जानवर</span>, jaanvar). The <b>peacock, ${hi('मोर')} (mor), is India's national bird</b>, and the tiger, ${hi('बाघ')} (baagh), is its national animal.`) +
    wordTable(ANIMALS) +
    p(`Many animal words change their ending for male and female: ${hi('कुत्ता')} (kuttaa) is a dog and ${hi('कुतिया')} (kutiyaa) is a female dog; ${hi('घोड़ा')} (ghoraa) is a horse and ${hi('घोड़ी')} (ghoree) is a mare.`) + cardsLink +
    example('Example', `${hi('बिल्ली दूध पीती है।')} (billee doodh peetee hai) means “The cat drinks milk.”`));
  vocabSkill('hi.body', 'The body', BODY,
    p(`These are the parts of the body (<span lang="hi">शरीर</span>, shareer). <b>Several have a nasal sign</b>: ${hi('आँख')} (aankh, eye), ${hi('मुँह')} (munh, mouth) and ${hi('दाँत')} (daant, tooth).`) +
    wordTable(BODY) +
    p(`${hi('पैर')} (pair) means foot, and also the whole leg. ${hi('हाथ')} (haath) is the hand, and also the arm.`) + cardsLink +
    example('Example', `${hi('मेरे दो हाथ हैं।')} (mere do haath hain) means “I have two hands.”`));
  vocabSkill('hi.school', 'School', SCHOOL,
    p(`Here are words for school. Hindi often borrows English words for new things: <b>${hi('स्कूल')} (skool), ${hi('पेंसिल')} (pensil) and ${hi('कॉपी')} (kopee, a notebook)</b>. The more formal word for a school is ${hi('विद्यालय')} (vidyaalay).`) +
    wordTable(SCHOOL) +
    p(`A woman teacher is ${hi('अध्यापिका')} (adhyaapikaa), and a girl student is ${hi('छात्रा')} (chhaatraa). Many students also call a teacher ${hi('सर')} (sir) or ${hi('मैडम')} (madam).`) + cardsLink +
    example('Example', `${hi('मेरी किताब बस्ते में है।')} (meree kitaab baste mein hai) means “My book is in the school bag.”`));

  const swatch = c => `<svg class="hi-swatch" width="44" height="28" viewBox="0 0 44 28" aria-hidden="true" focusable="false"><rect x="1" y="1" width="42" height="26" rx="6" fill="${c}" stroke="var(--line-strong)" stroke-width="1.5"/></svg>`;
  // nouns with their gender, for words that change with the noun: [word, romanized, meaning, m | f | mp]
  const COLOR_NOUNS = [['गेंद', 'gend', 'ball', 'f'], ['बस्ता', 'bastaa', 'school bag', 'm'], ['कमीज़', 'kameez', 'shirt', 'f'], ['घर', 'ghar', 'house', 'm'], ['टोपी', 'topee', 'hat', 'f'], ['दरवाज़ा', 'darvaazaa', 'door', 'm'], ['कार', 'kaar', 'car', 'f'], ['जूते', 'joote', 'shoes', 'mp']];
  vocabSkill('hi.colors', 'Colors', COLORS.map(c => c.slice(0, 3)),
    p(`The word for color is ${hi('रंग')} (rang). Most color words never change, but <b>colors that end in ${hi(ring('ा'))} (-aa) change to match the noun</b>, like ${hi('मेरा')} and ${hi('मेरी')}: ${hi('नीला')} for a masculine noun, ${hi('नीली')} for a feminine one, and ${hi('नीले')} for masculine plurals.`) +
    wordTable(COLORS.map(c => c.slice(0, 3))) +
    p(`So a blue school bag is ${hi('नीला बस्ता')} (neelaa bastaa), but a blue ball is ${hi('नीली गेंद')} (neelee gend). ${hi('लाल')} (red) stays the same: ${hi('लाल बस्ता')}, ${hi('लाल गेंद')}.`) + cardsLink +
    example('Example', `${hi('हरे जूते')} (hare joote) means green shoes: ${hi('हरा')} becomes ${hi('हरे')} for a masculine plural.`),
    (rng, w) => {
      if (rng.bool()) {
        const c = rng.pick(COLORS), others = rng.shuffle(COLORS.filter(x => x !== c)), answer = hi(c[0]);
        return { prompt: `Which word names this color?<div class="hi-swatch-row">${swatch(c[4])}<span class="small muted">${cap(c[2])}</span></div>`, type: 'choice', answer, choices: options(answer, others.map(x => hi(x[0]))), params: { form: 'swatch', en: c[2] },
          hints: [`${cap(c[2])} is said ${q(c[1])}.`, `It's <b>${answer}</b> (${c[1]}).`] };
      }
      const c = rng.pick(COLORS.filter(x => x[3])), n = rng.pick(COLOR_NOUNS), stem = c[0].slice(0, -1), forms = { m: stem + 'ा', f: stem + 'ी', mp: stem + 'े' };
      const answer = hi(forms[n[3]]), gName = { m: 'masculine', f: 'feminine', mp: 'a masculine plural' }[n[3]];
      return { prompt: `Fill in the blank: ${q(`${n[3] === 'mp' ? '' : 'a '}${c[2]} ${n[2]}`)}.${big(`___ ${n[0]}`, true)}`, type: 'choice', keepOrder: true, answer, choices: [hi(forms.m), hi(forms.f), hi(forms.mp)], params: { form: 'agree', color: c[0], g: n[3], noun: n[0] },
        hints: [`${hi(n[0])} (${n[1]}) is ${gName}.`, `${n[3] === 'm' ? 'Masculine nouns keep -aa' : n[3] === 'f' ? 'Feminine nouns take -ee' : 'Masculine plurals take -e'}: <b>${answer} ${hi(n[0])}</b>.`] };
    });

  vocabSkill('hi.days', 'Days of the week', DAYS.map(d => d.slice(0, 3)),
    p(`Every day of the week ends in ${hi('वार')} (vaar), “day”. <b>The days are named after the sun, the moon and the planets</b>, just as Sunday, Monday and Saturday are in English.`) +
    M.table(['Hindi', 'Say it', 'Day', 'Named after'], DAYS.map(d => [hi(d[0]), d[1], d[2], d[3].replace(/^(\S+),/, (m, x) => hi(x) + ','),])) +
    p(`Thursday is also called ${hi('बृहस्पतिवार')} (brihaspativaar). Useful time words: ${hi('आज')} (aaj) is today, and <b>${hi('कल')} (kal) means both yesterday and tomorrow</b>; the verb shows which one.`) + cardsLink +
    example('Example', `${hi('आज सोमवार है।')} (aaj somvaar hai) means “Today is Monday.”`),
    (rng) => {
      if (rng.chance(0.4)) {
        const t = rng.pick(TIME_WORDS), answer = cap(t[2]);
        return { prompt: `What does this mean?${big(t[0])}<p class="hi-say-it">Say it: ${rom(t[1])}</p>`, type: 'choice', answer, choices: options(answer, rng.shuffle(TIME_WORDS.filter(x => x !== t)).map(x => cap(x[2]))), params: { form: 'time', w: t[0], en: t[2] },
          hints: [`It's a word for time.`, `${hi(t[0])} (${t[1]}) means <b>${t[2]}</b>.`] };
      }
      const i = rng.int(0, 6), step = rng.pick([1, 1, -1]), d = DAYS[i], ans = DAYS[(i + step + 7) % 7], answer = hi(ans[0]);
      return { prompt: `Which day comes ${step === 1 ? 'after' : 'before'} ${hi(d[0])} (${d[1]})?`, type: 'choice', answer, choices: options(answer, rng.shuffle(DAYS.filter(x => x !== ans && x !== d)).map(x => hi(x[0]))), params: { form: 'next-day', w: d[0], step },
        hints: [`${hi(d[0])} is ${d[2]}.`, `The day ${step === 1 ? 'after' : 'before'} ${d[2]} is ${ans[2]}: <b>${answer}</b> (${ans[1]}).`] };
    });
  vocabSkill('hi.months', 'Months of the year', MONTHS,
    p(`In everyday Hindi, the months of the calendar have <b>the same names as in English</b>, written in Devanagari. Reading them is good practice with the vowel signs and half letters.`) +
    wordTable(MONTHS) +
    p(`India also uses a traditional calendar with its own months, such as ${hi('सावन')} (saavan), the rainy season, and ${hi('कार्तिक')} (kaartik), when Diwali usually falls.`) + cardsLink +
    example('Example', `${hi('मेरा जन्मदिन मई में है।')} (meraa janmadin maee mein hai) means “My birthday is in May.”`),
    (rng) => {
      const i = rng.int(0, 11), m = MONTHS[i];
      if (rng.bool() && i !== 1) {
        return { prompt: `How many days are there in ${hi(m[0])} (${m[1]})?`, type: 'number', answer: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i], params: { form: 'month-days', m: i },
          hints: [`${hi(m[0])} is ${m[2]}.`, `${m[2]} has <b>${[31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i]}</b> days.`] };
      }
      const nx = MONTHS[(i + 1) % 12], answer = hi(nx[0]);
      return { prompt: `Which month comes after ${hi(m[0])} (${m[1]})?`, type: 'choice', answer, choices: options(answer, rng.shuffle(MONTHS.filter(x => x !== nx && x !== m)).map(x => hi(x[0]))), params: { form: 'next-month', w: m[0] },
        hints: [`${hi(m[0])} is ${m[2]}.`, `After ${m[2]} comes ${nx[2]}: <b>${answer}</b> (${nx[1]}).`] };
    });

  /* ---------- Unit 10: simple sentences ---------- */
  // to be: [subject, romanized, English subject, verb]
  const SUBJ = [['मैं', 'main', 'I', 'हूँ'], ['तुम', 'tum', 'You', 'हो'], ['आप', 'aap', 'You', 'हैं'], ['वह', 'vah', 'He', 'है'], ['हम', 'ham', 'We', 'हैं'], ['वे', 've', 'They', 'हैं'], ['रवि', 'Ravi', 'Ravi', 'है'], ['मीना', 'Meena', 'Meena', 'है']];
  const BE_ROM = { 'हूँ': 'hoon', 'हो': 'ho', 'है': 'hai', 'हैं': 'hain' };
  const COMP = [['ठीक', 'theek', 'fine'], ['खुश', 'khush', 'happy'], ['तैयार', 'taiyaar', 'ready'], ['घर पर', 'ghar par', 'at home'], ['स्कूल में', 'skool mein', 'at school'], ['यहाँ', 'yahaan', 'here'], ['बीमार', 'beemaar', 'sick']];
  const enBe = s => (s === 'I' ? 'am' : ['You', 'We', 'They'].includes(s) ? 'are' : 'is');
  const enSubj = (s, dev) => (dev === 'वह' ? 'He (or she)' : dev === 'आप' ? 'You (polite)' : dev === 'तुम' ? 'You (to a friend)' : s);
  A.skill({
    id: 'hi.to-be', title: 'Am, is and are',
    learn: p(`Hindi puts the verb at the <b>end</b> of the sentence. The verb “to be” has four present forms, chosen by the subject:`) +
      M.table(['Subject', 'Verb', 'Example'], [[`${hi('मैं')} (main), I`, `${hi('हूँ')} (hoon)`, `${hi('मैं खुश हूँ।')} I am happy.`], [`${hi('तुम')} (tum), you, to a friend`, `${hi('हो')} (ho)`, `${hi('तुम तैयार हो।')} You are ready.`], [`${hi('आप')} (aap), you, polite`, `${hi('हैं')} (hain)`, `${hi('आप कैसे हैं?')} How are you?`], [`${hi('वह')} (vah), he or she; a name`, `${hi('है')} (hai)`, `${hi('रवि घर पर है।')} Ravi is at home.`], [`${hi('हम')} (ham), we; ${hi('वे')} (ve), they`, `${hi('हैं')} (hain)`, `${hi('हम स्कूल में हैं।')} We are at school.`]]) +
      p(`<b>${hi('है')} has no dot; ${hi('हैं')} has one</b>, and the dot makes it plural or polite. A sentence ends with ${hi('।')}, the Hindi full stop.`) +
      example('Example', `${hi('वे बीमार ___।')} They are sick. ${hi('वे')} (they) takes <b>${hi('हैं')}</b>: ${hi('वे बीमार हैं।')}`),
    make(rng) {
      const s = rng.pick(SUBJ), c = rng.pick(COMP), answer = hi(s[3]), en = `${enSubj(s[2], s[0])} ${enBe(s[2])} ${c[2]}.`;
      return { prompt: `Choose the verb so the sentence means ${q(en)}${big(`${s[0]} ${c[0]} ___।`)}<p class="hi-say-it">Say it: ${rom(`${s[1]} ${c[1]} …`)}</p>`, type: 'choice', keepOrder: true, answer, choices: ['हूँ', 'हो', 'है', 'हैं'].map(hi), params: { subj: s[0], c: c[0] },
        hints: [`The subject is ${hi(s[0])} (${s[1]}). ${s[0] === 'मैं' ? `With ${hi('मैं')}, use ${hi('हूँ')}.` : s[0] === 'तुम' ? `With ${hi('तुम')}, use ${hi('हो')}.` : ['आप', 'हम', 'वे'].includes(s[0]) ? 'Plural and polite subjects take the form with a dot.' : `One person, not you or me, takes ${hi('है')}.`}`, `<b>${hi(`${s[0]} ${c[0]} ${s[3]}।`)}</b> (${s[1]} ${c[1]} ${BE_ROM[s[3]]})`] };
    },
    verify(qq) {
      const subj = qq.params.subj, want = subj === 'मैं' ? 'हूँ' : subj === 'तुम' ? 'हो' : ['आप', 'हम', 'वे', 'ये'].includes(subj) ? 'हैं' : 'है';
      return qq.answer === hi(want);
    },
  });

  // my, your, our: [masculine, feminine, plural, romanized stem, English]
  const POSS = [['मेरा', 'मेरी', 'मेरे', 'mer', 'my'], ['तुम्हारा', 'तुम्हारी', 'तुम्हारे', 'tumhaar', 'your'], ['हमारा', 'हमारी', 'हमारे', 'hamaar', 'our']];
  const NOUNS_G = [['घर', 'ghar', 'house', 'm'], ['भाई', 'bhaai', 'brother', 'm'], ['कमरा', 'kamraa', 'room', 'm'], ['बस्ता', 'bastaa', 'school bag', 'm'], ['कुत्ता', 'kuttaa', 'dog', 'm'], ['दोस्त', 'dost', 'friend', 'm'],
    ['किताब', 'kitaab', 'book', 'f'], ['बहन', 'bahan', 'sister', 'f'], ['कुर्सी', 'kursee', 'chair', 'f'], ['बिल्ली', 'billee', 'cat', 'f'], ['कलम', 'kalam', 'pen', 'f'], ['साइकिल', 'saaikil', 'bicycle', 'f'], ['गेंद', 'gend', 'ball', 'f'],
    ['जूते', 'joote', 'shoes', 'mp'], ['दोस्त', 'dost', 'friends', 'mp'], ['केले', 'kele', 'bananas', 'mp'], ['किताबें', 'kitaaben', 'books', 'fp']];
  const possForm = (P, g) => (g === 'm' ? P[0] : g === 'mp' ? P[2] : P[1]);
  A.skill({
    id: 'hi.my', title: 'My, your and our',
    learn: p(`Every Hindi noun is <b>masculine or feminine</b>, and words like “my” change to match it. Use ${hi('मेरा')} (meraa) with a masculine noun, ${hi('मेरी')} (meree) with a feminine noun, and ${hi('मेरे')} (mere) with a masculine plural.`) +
      M.table(['', 'Masculine', 'Feminine', 'Masculine plural'], POSS.map(P => [P[4], hi(P[0]), hi(P[1]), hi(P[2])])) +
      p(`Many masculine nouns end in ${hi(ring('ा'))} (-aa), like ${hi('कमरा')}, and many feminine ones in ${hi(ring('ी'))} (-ee), like ${hi('कुर्सी')}, but not all: ${hi('घर')} is masculine and ${hi('किताब')} is feminine, so learn each noun with ${hi('मेरा')} or ${hi('मेरी')}. Feminine plurals still take ${hi('मेरी')}: ${hi('मेरी किताबें')}, my books.`) +
      example('Example', `${hi('यह ___ किताब है।')} This is my book. ${hi('किताब')} is feminine, so it's <b>${hi('मेरी')}</b>: ${hi('यह मेरी किताब है।')}`),
    make(rng) {
      const P = rng.pick(POSS), n = rng.pick(NOUNS_G), plural = n[3] === 'mp' || n[3] === 'fp', answer = hi(possForm(P, n[3]));
      const sentence = plural ? `ये ___ ${n[0]} हैं।` : `यह ___ ${n[0]} है।`, en = `${plural ? 'These are' : 'This is'} ${P[4]} ${n[2]}.`;
      const gName = { m: 'masculine', f: 'feminine', mp: 'masculine and plural', fp: 'feminine and plural' }[n[3]];
      return { prompt: `Fill in the blank so the sentence means ${q(en)}${big(sentence)}`, type: 'choice', keepOrder: true, answer, choices: [hi(P[0]), hi(P[1]), hi(P[2])], params: { p: P[4], noun: n[0], g: n[3] },
        hints: [`${hi(n[0])} (${n[1]}) is ${gName}.`, `<b>${hi(sentence.replace('___', possForm(P, n[3])))}</b>`] };
    },
    verify(qq) {
      const P = qq.params, stem = { my: 'मेर', your: 'तुम्हार', our: 'हमार' }[P.p], end = P.g === 'm' ? 'ा' : P.g === 'mp' ? 'े' : 'ी';
      return A.stripTags(qq.answer).trim() === stem + end;
    },
  });

  // where things are: [sentence with ___, the word, English]
  const PLACES = [['किताब बस्ते ___ है।', 'में', 'The book is in the school bag.'], ['किताब मेज़ ___ है।', 'पर', 'The book is on the table.'], ['बिल्ली मेज़ ___ है।', 'के नीचे', 'The cat is under the table.'], ['स्कूल घर ___ है।', 'के पास', 'The school is near the house.'],
    ['पानी गिलास ___ है।', 'में', 'The water is in the glass.'], ['चिड़िया पेड़ ___ है।', 'पर', 'The bird is on the tree.'], ['कुत्ता कुर्सी ___ है।', 'के नीचे', 'The dog is under the chair.'], ['मछली पानी ___ है।', 'में', 'The fish is in the water.'],
    ['कलम कॉपी ___ है।', 'पर', 'The pen is on the notebook.'], ['दुकान स्कूल ___ है।', 'के पास', 'The shop is near the school.'], ['गेंद बिस्तर ___ है।', 'के नीचे', 'The ball is under the bed.'], ['बच्चे कक्षा ___ हैं।', 'में', 'The children are in the classroom.'],
    ['मेरा घर पार्क ___ है।', 'के पास', 'My house is near the park.'], ['टोपी मेरे सिर ___ है।', 'पर', 'The hat is on my head.']];
  const PLACE_WORDS = ['में', 'पर', 'के नीचे', 'के पास'], PLACE_EN = { 'में': 'in', 'पर': 'on', 'के नीचे': 'under', 'के पास': 'near' };
  A.skill({
    id: 'hi.place-words', title: 'In, on, under and near',
    learn: p(`English says “in the bag”, but Hindi says “the bag in”: <b>the little place words come after the noun</b>. They're called postpositions.`) +
      M.table(['Hindi', 'Say it', 'Meaning'], PLACE_WORDS.map(w => [hi(w), { 'में': 'mein', 'पर': 'par', 'के नीचे': 'ke neeche', 'के पास': 'ke paas' }[w], PLACE_EN[w]])) +
      p(`A masculine noun ending in ${hi(ring('ा'))} changes to ${hi(ring('े'))} before a place word: ${hi('बस्ता')} (bastaa) becomes ${hi('बस्ते में')} (baste mein), in the school bag.`) +
      example('Example', `${hi('किताब मेज़ पर है।')} (kitaab mez par hai) means “The book is on the table.”`),
    make(rng) {
      const [s, w, en] = rng.pick(PLACES), answer = hi(w);
      return { prompt: `Fill in the blank so the sentence means ${q(en)}${big(s)}`, type: 'choice', keepOrder: true, answer, choices: PLACE_WORDS.map(hi), params: { s, en },
        hints: [`Which word in the English sentence says where? Find its Hindi partner, which comes after the noun.`, `<b>${hi(s.replace('___', w))}</b>`] };
    },
    verify(qq) {
      const en = qq.params.en, want = Object.keys(PLACE_EN).find(k => new RegExp(`\\b${PLACE_EN[k]}\\b`).test(en.replace(/^The \w+/, '')));
      return A.stripTags(qq.answer).trim() === want;
    },
  });

  // asking: [sentence with ___, the word, English]
  const ASK = [['आपका नाम ___ है?', 'क्या', 'What is your name?'], ['आप ___ रहते हैं?', 'कहाँ', 'Where do you live?'], ['आप ___ हैं?', 'कैसे', 'How are you?'], ['यह ___ है?', 'कौन', 'Who is this?'],
    ['तुम्हारा जन्मदिन ___ है?', 'कब', 'When is your birthday?'], ['तुम ___ हँस रहे हो?', 'क्यों', 'Why are you laughing?'], ['इसका दाम ___ है?', 'कितना', 'How much does this cost?'], ['तुम्हारी कक्षा में ___ बच्चे हैं?', 'कितने', 'How many children are in your class?'],
    ['तुम्हें ___ रंग पसंद है?', 'कौन-सा', 'Which color do you like?'], ['बस ___ आएगी?', 'कब', 'When will the bus come?'], ['दुकान ___ है?', 'कहाँ', 'Where is the shop?'], ['यह ___ है?', 'क्या', 'What is this?'],
    ['तुम स्कूल ___ जाते हो?', 'कैसे', 'How do you go to school?'], ['वह ___ रो रहा है?', 'क्यों', 'Why is he crying?']];
  const QEN = { 'क्या': 'what', 'कौन': 'who', 'कहाँ': 'where', 'कब': 'when', 'क्यों': 'why', 'कैसे': 'how', 'कितना': 'how much', 'कितने': 'how many', 'कौन-सा': 'which' };
  A.skill({
    id: 'hi.question-words', title: 'Question words',
    learn: p(`Most Hindi question words start with ${hi('क')} (k), the way many English ones start with wh. <b>The question word usually goes just before the verb</b>, not at the start: ${hi('आप कहाँ रहते हैं?')} is “you where live?”, meaning “Where do you live?”`) +
      wordTable(QWORDS) +
      p(`${hi('क्या')} (kyaa) at the very start turns a sentence into a yes-or-no question: ${hi('क्या तुम तैयार हो?')} means “Are you ready?” Use ${hi('कितना')} for how much and ${hi('कितने')} for how many.`) + cardsLink +
      example('Example', `${hi('दुकान कहाँ है?')} (dukaan kahaan hai?) means “Where is the shop?”`),
    make(rng) {
      if (rng.chance(0.4)) {
        const w = rng.pick(QWORDS), answer = cap(w[2]);
        return { prompt: `What does this question word mean?${big(w[0])}<p class="hi-say-it">Say it: ${rom(w[1])}</p>`, type: 'choice', answer, choices: options(answer, rng.shuffle(QWORDS.filter(x => x !== w)).map(x => cap(x[2]))), params: { kind: 'mean', w: w[0], en: w[2] },
          hints: [`Most question words start with ${hi('क')}, like wh in English.`, `${hi(w[0])} (${w[1]}) means <b>${w[2]}</b>.`] };
      }
      const [s, w, en] = rng.pick(ASK), answer = hi(w);
      return { prompt: `Fill in the blank so the question means ${q(en)}${big(s)}`, type: 'choice', answer, choices: options(answer, rng.shuffle(QWORDS.filter(x => x[0] !== w)).map(x => hi(x[0]))), params: { kind: 'ask', s, en },
        hints: [`The English question starts with ${q(en.split(' ').slice(0, /^How (much|many)/.test(en) ? 2 : 1).join(' '))}.`, `<b>${hi(s.replace('___', w))}</b>`] };
    },
    verify(qq) {
      const P = qq.params;
      if (P.kind === 'mean') return meaningOf(P.w) === P.en && A.normText(qq.answer) === A.normText(P.en);
      const first = P.en.toLowerCase().match(/^(how much|how many|what|who|where|when|why|how|which)\b/)[1];
      return QEN[A.stripTags(qq.answer).trim()] === first;
    },
  });

  // whole sentences, read and understood: each template gives [Hindi, romanized, English] and wrong English readings
  const NAMES = [['रवि', 'Ravi'], ['मीना', 'Meena'], ['अनु', 'Anu'], ['समीर', 'Sameer'], ['प्रिया', 'Priya'], ['अर्जुन', 'Arjun']];
  const LIKES = [['चाय', 'chaay', 'tea'], ['दूध', 'doodh', 'milk'], ['दाल', 'daal', 'dal'], ['चावल', 'chaaval', 'rice'], ['दही', 'dahee', 'yogurt'], ['मिठाई', 'mithaai', 'sweets'], ['रोटी', 'rotee', 'roti']];
  const SENT = {
    name(rng) { const [n, nr] = rng.pick(NAMES), o = rng.pick(NAMES.filter(x => x[0] !== n)); return { hi: `मेरा नाम ${n} है।`, rom: `meraa naam ${nr} hai`, en: `My name is ${nr}.`, wrong: [`Your name is ${nr}.`, `My name is ${o[1]}.`, `${nr} is my friend.`, `Is your name ${nr}?`], p: { t: 'name', n } }; },
    mine(rng) {
      const n = rng.pick(NOUNS_G.filter(x => x[3] === 'm' || x[3] === 'f')), o = rng.pick(NOUNS_G.filter(x => x[2] !== n[2] && (x[3] === 'm' || x[3] === 'f'))), P = n[3] === 'm' ? 'मेरा' : 'मेरी';
      return { hi: `यह ${P} ${n[0]} है।`, rom: `yah ${P === 'मेरा' ? 'meraa' : 'meree'} ${n[1]} hai`, en: `This is my ${n[2]}.`, wrong: [`This is your ${n[2]}.`, `This is my ${o[2]}.`, `Where is my ${n[2]}?`, `This is not my ${n[2]}.`], p: { t: 'mine', n: n[0] } };
    },
    like(rng) { const f = rng.pick(LIKES), o = rng.pick(LIKES.filter(x => x !== f)); return { hi: `मुझे ${f[0]} पसंद है।`, rom: `mujhe ${f[1]} pasand hai`, en: `I like ${f[2]}.`, wrong: [`I don’t like ${f[2]}.`, `I like ${o[2]}.`, `Do you like ${f[2]}?`, `I want ${f[2]}.`], p: { t: 'like', f: f[0] } }; },
    be(rng) {
      const s = rng.pick(SUBJ.filter(x => ['मैं', 'हम', 'वे', 'रवि', 'मीना'].includes(x[0]))), c = rng.pick(COMP), o = rng.pick(COMP.filter(x => x !== c));
      const en = (subj, comp) => `${subj} ${enBe(subj)} ${comp}.`, swap = { I: 'We', We: 'I', They: 'I', Ravi: 'They', Meena: 'They' }[s[2]];
      return { hi: `${s[0]} ${c[0]} ${s[3]}।`, rom: `${s[1]} ${c[1]} ${BE_ROM[s[3]]}`, en: en(s[2], c[2]), wrong: [en(swap, c[2]), en(s[2], o[2]), en(swap, o[2])], p: { t: 'be', s: s[0], c: c[0] } };
    },
    place(rng) {
      const [s, w, en] = rng.pick(PLACES), others = PLACE_WORDS.filter(x => x !== w);
      return { hi: s.replace('___', w), rom: '', en, wrong: others.map(x => en.replace(new RegExp(`\\b${PLACE_EN[w]}( the)?\\b`), m => m.replace(PLACE_EN[w], PLACE_EN[x]))), p: { t: 'place', s, w } };
    },
    ask(rng) { const [s, w, en] = rng.pick(ASK), others = rng.shuffle(ASK.filter(x => x[0] !== s && x[2] !== en)); return { hi: s.replace('___', w), rom: '', en, wrong: others.map(x => x[2]), p: { t: 'ask', s, w } }; },
  };
  A.skill({
    id: 'hi.meaning', title: 'Reading sentences',
    learn: p(`To read a Hindi sentence, <b>find the verb at the end first</b>, then the subject at the start, then everything in between. Little words such as ${hi('में')} (in) and ${hi('पर')} (on) come after their nouns.`) +
      p(`Two patterns are worth knowing by heart. ${hi('मेरा नाम … है।')} (meraa naam … hai) means “My name is ….” ${hi('मुझे … पसंद है।')} (mujhe … pasand hai) means “I like ….”`) +
      example('Example', `${hi('यह मेरी कलम है।')} (yah meree kalam hai): ${hi('यह')} this, ${hi('मेरी')} my, ${hi('कलम')} pen, ${hi('है')} is. It means <b>“This is my pen.”</b>`),
    make(rng) {
      const t = rng.pick(Object.keys(SENT)), s = SENT[t](rng);
      return { prompt: `What does this sentence mean?${big(s.hi)}${s.rom ? `<p class="hi-say-it">Say it: ${rom(s.rom)}</p>` : ''}`, type: 'choice', answer: s.en, choices: options(s.en, rng.shuffle(s.wrong)), params: s.p,
        hints: [`Start with the verb at the end, then find the subject.`, `${hi(s.hi)} means <b>${q(s.en)}</b>`] };
    },
    verify(qq) {
      const P = qq.params, en = qq.answer;
      if (P.t === 'name') return en === `My name is ${NAMES.find(n => n[0] === P.n)[1]}.`;
      if (P.t === 'mine') return en === `This is my ${NOUNS_G.find(n => n[0] === P.n && (n[3] === 'm' || n[3] === 'f'))[2]}.`;
      if (P.t === 'like') return en === `I like ${LIKES.find(f => f[0] === P.f)[2]}.`;
      if (P.t === 'be') { const s = SUBJ.find(x => x[0] === P.s), c = COMP.find(x => x[0] === P.c); return en === `${s[2]} ${s[2] === 'I' ? 'am' : ['We', 'They'].includes(s[2]) ? 'are' : 'is'} ${c[2]}.`; }
      if (P.t === 'place') return new RegExp(`\\b${PLACE_EN[P.w]}\\b`).test(en.replace(/^The \w+/, '')) && PLACES.some(x => x[0] === P.s && x[2] === en);
      if (P.t === 'ask') return ASK.some(x => x[0] === P.s && x[1] === P.w && x[2] === en);
      return false;
    },
  });

  /* ---------- the words, for the flashcards ---------- */
  const TOPICS = [['Greetings', GREETINGS], ['Family', FAMILY], ['Food and drink', FOOD], ['Animals', ANIMALS], ['The body', BODY], ['School', SCHOOL], ['Colors', COLORS.map(c => c.slice(0, 3))], ['Days and time', DAYS.map(d => d.slice(0, 3)).concat(TIME_WORDS)], ['Months', MONTHS], ['Question words', QWORDS], ['Numbers', NUMS.map(([n, w, r]) => [w, r, String(n)])]];
  const cardId = r => 'h-' + A.normText(r).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 38);
  const WORDS = [];
  const seenIds = new Set();
  TOPICS.forEach(([topic, list], ti) => list.forEach(([dev, r, en]) => {
    let id = cardId(r);
    if (seenIds.has(id)) return;                    // a word in two topics is one card
    seenIds.add(id);
    WORDS.push({ id, dev, rom: r, en, topic, order: ti });
  }));
  window.HINDI = { say, listen, hiVoice, translit, spells, WORDS, TOPICS: TOPICS.map(t => t[0]) };
})();
