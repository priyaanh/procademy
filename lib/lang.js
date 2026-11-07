/* Menus and buttons in Spanish or Hindi (Settings → Language; profile.lang). The interface's own words (the menu,
   headings, buttons, levels, settings) are swapped for the chosen language as each page draws; lessons,
   questions, hints, notes, names and the tutor's replies stay as they are, in English. Only exact phrases in the
   lists below change (plus a few with numbers in them), so nothing a learner wrote is ever touched, and each
   changed element is marked with its language for screen readers. English is the page as written. */
'use strict';
(function () {
  const DICT = {
    es: {
      'Home': 'Inicio', 'Courses': 'Cursos', 'Practice': 'Práctica', 'Tutor': 'Tutor', 'Tools': 'Herramientas', 'Progress': 'Progreso', 'More': 'Más', 'Cancel': 'Cancelar',
      'Search skills, courses and tools': 'Buscar habilidades, cursos y herramientas', 'Skip to content': 'Ir al contenido', 'Ask the tutor': 'Pregúntale al tutor', 'Your profile': 'Tu perfil', 'Main': 'Principal', 'More pages': 'Más páginas',
      'CPM books': 'Libros CPM', 'Your class book, lesson by lesson': 'Tu libro de clase, lección por lección', 'Calculators, labs and puzzles': 'Calculadoras, laboratorios y acertijos', 'Your skills, streak and badges': 'Tus habilidades, racha e insignias',
      'My notes': 'Mis notas', 'What you wrote on each lesson': 'Lo que escribiste en cada lección', 'Family and class': 'Familia y clase', 'Progress for everyone you help': 'El progreso de todos a quienes ayudas', 'Profile': 'Perfil', 'Your account, and who is learning': 'Tu cuenta y quién está aprendiendo',
      'Settings': 'Ajustes', 'Theme, text size and more': 'Colores, tamaño del texto y más', 'Updates': 'Novedades', 'What’s new in Procademy': 'Novedades de Procademy',
      'Welcome to Procademy': 'Te damos la bienvenida a Procademy', 'Who is learning?': '¿Quién está aprendiendo?', 'Kindergarten': 'Kínder', '1st grade': '1.er grado', '2nd grade': '2.º grado', '3rd grade': '3.er grado', '4th grade': '4.º grado', '5th grade': '5.º grado', '6th grade': '6.º grado', '7th grade': '7.º grado', '8th grade': '8.º grado', '9th grade': '9.º grado', '10th grade': '10.º grado', '11th grade': '11.º grado', '12th grade': '12.º grado',
      'Adult: everyday math': 'Adulto: matemáticas cotidianas', 'Adult: algebra': 'Adulto: álgebra', 'A daily goal': 'Una meta diaria', 'Casual': 'Tranquila', 'Regular': 'Regular', 'Serious': 'Intensa',
      'Find my starting point': 'Encontrar mi punto de partida', 'Start practicing now': 'Empezar a practicar ahora', 'Look around first': 'Explorar primero', 'Pick a skill to get started.': 'Elige una habilidad para empezar.',
      'Today': 'Hoy', 'Today’s practice': 'La práctica de hoy', 'Puzzle of the day': 'Acertijo del día', 'Facts round': 'Ronda de operaciones', 'Daily goal': 'Meta diaria', 'Start': 'Empezar', 'Play': 'Jugar', 'Practice again': 'Practicar de nuevo', 'See it again': 'Verlo de nuevo', 'Done': 'Hecho',
      'days in a row': 'días seguidos', 'day in a row': 'día seguido', 'today’s goal': 'meta de hoy', 'badges earned': 'insignias ganadas', 'My courses': 'Mis cursos', 'Browse courses →': 'Ver cursos →', 'Browse courses': 'Ver cursos', 'Up next': 'A continuación', 'Learn': 'Aprender',
      'Challenge a friend': 'Reta a un amigo', 'More ways to practice': 'Más formas de practicar', 'Search': 'Buscar', 'Every course and CPM book': 'Todos los cursos y libros CPM', 'All tools →': 'Todas las herramientas →', 'This week': 'Esta semana', 'Progress →': 'Progreso →', 'Saved': 'Guardado', 'Save': 'Guardar', 'Your week in review': 'Tu semana en resumen', 'Got it': 'Entendido', 'See the full report': 'Ver el informe completo',
      'Get the Procademy app': 'Obtén la app de Procademy', 'Install': 'Instalar', 'Not now': 'Ahora no', 'Show me how': 'Muéstrame cómo', 'New in Procademy': 'Novedades en Procademy', 'Dismiss': 'Descartar', 'View all updates →': 'Ver todas las novedades →',
      'Mastered': 'Dominado', 'Proficient': 'Competente', 'Familiar': 'Familiarizado', 'Attempted': 'Intentado', 'Not started': 'Sin empezar', 'Your skill map': 'Tu mapa de habilidades',
      'Course challenge': 'Desafío del curso', 'Start course challenge': 'Empezar el desafío del curso', 'Mastery challenge': 'Desafío de dominio', 'Not available yet': 'Aún no disponible', 'Start unit test': 'Empezar la prueba de la unidad', 'Unit test': 'Prueba de la unidad',
      'New to this course?': '¿Nuevo en este curso?', 'Start here': 'Empieza aquí', 'Check again': 'Volver a comprobar',
      'Check': 'Comprobar', 'Next question': 'Siguiente pregunta', 'Finish': 'Terminar', 'Hint': 'Pista', 'I don’t know': 'No lo sé', 'Back': 'Volver', 'Your answer': 'Tu respuesta', 'Read aloud': 'Leer en voz alta', 'End session': 'Terminar la sesión',
      'Excellent work': 'Excelente trabajo', 'Nice work': 'Buen trabajo', 'Keep practicing': 'Sigue practicando', 'Session complete': 'Sesión completada', 'Second chance': 'Segunda oportunidad', 'New skill': 'Habilidad nueva', 'Review': 'Repaso',
      'All': 'Todos', 'Elementary': 'Primaria', 'Middle school': 'Escuela intermedia', 'High school': 'Escuela secundaria',
      'Practice any topic': 'Practica cualquier tema', 'Topic': 'Tema', 'Grade': 'Grado', 'Any grade': 'Cualquier grado', 'Suggested topics': 'Temas sugeridos', 'More topics, ready right away': 'Más temas, listos al instante', 'Find any skill': 'Busca cualquier habilidad',
      'Unlimited practice': 'Práctica ilimitada', 'Practice the whole course': 'Practicar todo el curso', 'Practice this unit': 'Practicar esta unidad', 'Everything': 'Todo',
      'You': 'Tú', 'Your name': 'Tu nombre', 'Colors': 'Colores', 'Match my device': 'Igual que mi dispositivo', 'Light': 'Claro', 'Dark': 'Oscuro', 'Weekly goal': 'Meta semanal', 'Text size': 'Tamaño del texto', 'Normal': 'Normal', 'Large': 'Grande', 'Extra large': 'Muy grande',
      'Easier-to-read text': 'Texto más fácil de leer', 'Read each practice question aloud': 'Leer en voz alta cada pregunta', 'Your progress': 'Tu progreso', 'Save a copy': 'Guardar una copia', 'Load a copy': 'Cargar una copia', 'Get the app': 'Obtén la app', 'Start over': 'Empezar de nuevo', 'About': 'Acerca de', 'Privacy': 'Privacidad',
      'Language for menus and buttons': 'Idioma de menús y botones',
      'Report for a parent or teacher': 'Informe para la familia o el maestro', 'Activity': 'Actividad', 'Mastery': 'Dominio', 'Due for review': 'Para repasar', 'Badges': 'Insignias',
      'Review your mistakes': 'Repasa tus errores', 'Review them all': 'Repasarlos todos', 'Practice these': 'Practicar estos', 'By kind of mistake': 'Por tipo de error', 'By skill': 'Por habilidad',
      'On this device': 'En este dispositivo', 'Shared with you': 'Compartido contigo', 'Full report →': 'Informe completo →',
      'Practice today to start a streak · earn a streak saver with 7 days in a row': 'Practica hoy para empezar una racha · gana un salvavidas de racha con 7 días seguidos', 'earn a streak saver with 7 days in a row': 'gana un salvavidas de racha con 7 días seguidos',
      'Today’s Balance puzzle: place every weight so the seesaw is level.': 'El acertijo Balance de hoy: coloca cada pesa para que el balancín quede nivelado.', 'Today’s Leap puzzle: reach the flag using every card once.': 'El acertijo Leap de hoy: llega a la bandera usando cada tarjeta una vez.',
      'One minute of addition facts. Try to beat your best.': 'Un minuto de sumas. Intenta superar tu mejor marca.', 'Your answer': 'Tu respuesta',
    },
    hi: {
      'Home': 'होम', 'Courses': 'पाठ्यक्रम', 'Practice': 'अभ्यास', 'Tutor': 'ट्यूटर', 'Tools': 'उपकरण', 'Progress': 'प्रगति', 'More': 'और', 'Cancel': 'रद्द करें',
      'Search skills, courses and tools': 'कौशल, पाठ्यक्रम और उपकरण खोजें', 'Skip to content': 'सामग्री पर जाएँ', 'Ask the tutor': 'ट्यूटर से पूछें', 'Your profile': 'आपकी प्रोफ़ाइल', 'Main': 'मुख्य', 'More pages': 'और पेज',
      'CPM books': 'CPM किताबें', 'Your class book, lesson by lesson': 'आपकी कक्षा की किताब, पाठ दर पाठ', 'Calculators, labs and puzzles': 'कैलकुलेटर, प्रयोग और पहेलियाँ', 'Your skills, streak and badges': 'आपके कौशल, लगातार दिन और बैज',
      'My notes': 'मेरे नोट्स', 'What you wrote on each lesson': 'हर पाठ पर आपने जो लिखा', 'Family and class': 'परिवार और कक्षा', 'Progress for everyone you help': 'जिनकी आप मदद करते हैं, उन सबकी प्रगति', 'Profile': 'प्रोफ़ाइल', 'Your account, and who is learning': 'आपका खाता, और कौन सीख रहा है',
      'Settings': 'सेटिंग्स', 'Theme, text size and more': 'रंग, अक्षरों का आकार और भी बहुत कुछ', 'Updates': 'नया क्या है', 'What’s new in Procademy': 'Procademy में नया क्या है',
      'Welcome to Procademy': 'Procademy में आपका स्वागत है', 'Who is learning?': 'कौन सीख रहा है?', 'Kindergarten': 'किंडरगार्टन', '1st grade': 'पहली कक्षा', '2nd grade': 'दूसरी कक्षा', '3rd grade': 'तीसरी कक्षा', '4th grade': 'चौथी कक्षा', '5th grade': 'पाँचवीं कक्षा', '6th grade': 'छठी कक्षा', '7th grade': 'सातवीं कक्षा', '8th grade': 'आठवीं कक्षा', '9th grade': 'नौवीं कक्षा', '10th grade': 'दसवीं कक्षा', '11th grade': 'ग्यारहवीं कक्षा', '12th grade': 'बारहवीं कक्षा',
      'Adult: everyday math': 'वयस्क: रोज़मर्रा का गणित', 'Adult: algebra': 'वयस्क: बीजगणित', 'A daily goal': 'रोज़ का लक्ष्य', 'Casual': 'हल्का', 'Regular': 'नियमित', 'Serious': 'गंभीर',
      'Find my starting point': 'मेरा शुरुआती स्तर खोजें', 'Start practicing now': 'अभी अभ्यास शुरू करें', 'Look around first': 'पहले देख लें', 'Pick a skill to get started.': 'शुरू करने के लिए एक कौशल चुनें।',
      'Today': 'आज', 'Today’s practice': 'आज का अभ्यास', 'Puzzle of the day': 'आज की पहेली', 'Facts round': 'तेज़ अभ्यास', 'Daily goal': 'रोज़ का लक्ष्य', 'Start': 'शुरू करें', 'Play': 'खेलें', 'Practice again': 'फिर से अभ्यास करें', 'See it again': 'फिर से देखें', 'Done': 'पूरा हुआ',
      'days in a row': 'लगातार दिन', 'day in a row': 'लगातार दिन', 'today’s goal': 'आज का लक्ष्य', 'badges earned': 'मिले बैज', 'My courses': 'मेरे पाठ्यक्रम', 'Browse courses →': 'पाठ्यक्रम देखें →', 'Browse courses': 'पाठ्यक्रम देखें', 'Up next': 'आगे क्या', 'Learn': 'सीखें',
      'Challenge a friend': 'दोस्त को चुनौती दें', 'More ways to practice': 'अभ्यास के और तरीके', 'Search': 'खोजें', 'Every course and CPM book': 'हर पाठ्यक्रम और CPM किताबें', 'All tools →': 'सभी उपकरण →', 'This week': 'इस सप्ताह', 'Progress →': 'प्रगति →', 'Saved': 'सहेजा गया', 'Save': 'सहेजें', 'Your week in review': 'आपका सप्ताह', 'Got it': 'ठीक है', 'See the full report': 'पूरी रिपोर्ट देखें',
      'Get the Procademy app': 'Procademy ऐप पाएँ', 'Install': 'इंस्टॉल करें', 'Not now': 'अभी नहीं', 'Show me how': 'तरीका दिखाएँ', 'New in Procademy': 'Procademy में नया', 'Dismiss': 'हटाएँ', 'View all updates →': 'सभी अपडेट देखें →',
      'Mastered': 'महारत', 'Proficient': 'कुशल', 'Familiar': 'परिचित', 'Attempted': 'प्रयास किया', 'Not started': 'शुरू नहीं किया', 'Your skill map': 'आपका कौशल नक्शा',
      'Course challenge': 'पाठ्यक्रम चुनौती', 'Start course challenge': 'पाठ्यक्रम चुनौती शुरू करें', 'Mastery challenge': 'महारत चुनौती', 'Not available yet': 'अभी उपलब्ध नहीं', 'Start unit test': 'इकाई परीक्षा शुरू करें', 'Unit test': 'इकाई परीक्षा',
      'New to this course?': 'इस पाठ्यक्रम में नए हैं?', 'Start here': 'यहाँ से शुरू करें', 'Check again': 'फिर से जाँचें',
      'Check': 'जाँचें', 'Next question': 'अगला प्रश्न', 'Finish': 'समाप्त करें', 'Hint': 'संकेत', 'I don’t know': 'मुझे नहीं पता', 'Back': 'वापस', 'Your answer': 'आपका उत्तर', 'Read aloud': 'ज़ोर से पढ़ें', 'End session': 'सत्र समाप्त करें',
      'Excellent work': 'बहुत बढ़िया', 'Nice work': 'अच्छा काम', 'Keep practicing': 'अभ्यास जारी रखें', 'Session complete': 'सत्र पूरा हुआ', 'Second chance': 'दूसरा मौका', 'New skill': 'नया कौशल', 'Review': 'दोहराना',
      'All': 'सभी', 'Elementary': 'प्राथमिक', 'Middle school': 'मिडिल स्कूल', 'High school': 'हाई स्कूल',
      'Practice any topic': 'किसी भी विषय का अभ्यास करें', 'Topic': 'विषय', 'Grade': 'कक्षा', 'Any grade': 'कोई भी कक्षा', 'Suggested topics': 'सुझाए गए विषय', 'More topics, ready right away': 'और विषय, तुरंत तैयार', 'Find any skill': 'कोई भी कौशल खोजें',
      'Unlimited practice': 'असीमित अभ्यास', 'Practice the whole course': 'पूरे पाठ्यक्रम का अभ्यास करें', 'Practice this unit': 'इस इकाई का अभ्यास करें', 'Everything': 'सब कुछ',
      'You': 'आप', 'Your name': 'आपका नाम', 'Colors': 'रंग', 'Match my device': 'मेरे डिवाइस जैसा', 'Light': 'हल्का', 'Dark': 'गहरा', 'Weekly goal': 'साप्ताहिक लक्ष्य', 'Text size': 'अक्षरों का आकार', 'Normal': 'सामान्य', 'Large': 'बड़ा', 'Extra large': 'बहुत बड़ा',
      'Easier-to-read text': 'पढ़ने में आसान अक्षर', 'Read each practice question aloud': 'हर प्रश्न ज़ोर से पढ़ें', 'Your progress': 'आपकी प्रगति', 'Save a copy': 'एक प्रति सहेजें', 'Load a copy': 'प्रति खोलें', 'Get the app': 'ऐप पाएँ', 'Start over': 'फिर से शुरू करें', 'About': 'परिचय', 'Privacy': 'गोपनीयता',
      'Language for menus and buttons': 'मेन्यू और बटन की भाषा',
      'Report for a parent or teacher': 'माता-पिता या शिक्षक के लिए रिपोर्ट', 'Activity': 'गतिविधि', 'Mastery': 'महारत', 'Due for review': 'दोहराने के लिए', 'Badges': 'बैज',
      'Review your mistakes': 'अपनी गलतियाँ दोहराएँ', 'Review them all': 'सभी को दोहराएँ', 'Practice these': 'इनका अभ्यास करें', 'By kind of mistake': 'गलती के प्रकार से', 'By skill': 'कौशल से',
      'On this device': 'इस डिवाइस पर', 'Shared with you': 'आपके साथ साझा', 'Full report →': 'पूरी रिपोर्ट →',
      'Practice today to start a streak · earn a streak saver with 7 days in a row': 'लगातार दिनों की शुरुआत के लिए आज अभ्यास करें · लगातार 7 दिन पर एक बचाव मिलेगा', 'earn a streak saver with 7 days in a row': 'लगातार 7 दिन पर एक बचाव मिलेगा',
      'Today’s Balance puzzle: place every weight so the seesaw is level.': 'आज की Balance पहेली: हर वज़न ऐसे रखें कि झूला बराबर हो जाए।', 'Today’s Leap puzzle: reach the flag using every card once.': 'आज की Leap पहेली: हर कार्ड एक बार इस्तेमाल करके झंडे तक पहुँचें।',
      'One minute of addition facts. Try to beat your best.': 'जोड़ का एक मिनट का अभ्यास। अपना सबसे अच्छा स्कोर तोड़ें।', 'Your answer': 'आपका उत्तर',
    },
  };
  /** phrases with numbers or names in them: [pattern, { es, hi }] with $1, $2 for the parts kept */
  const PAT = [
    [/^Good morning(,.*)?$/, { es: 'Buenos días$1', hi: 'सुप्रभात$1' }], [/^Good afternoon(,.*)?$/, { es: 'Buenas tardes$1', hi: 'नमस्ते$1' }], [/^Good evening(,.*)?$/, { es: 'Buenas noches$1', hi: 'शुभ संध्या$1' }],
    [/^Unit (\d+)$/, { es: 'Unidad $1', hi: 'इकाई $1' }], [/^(\d+) units? · (\d+) skills?$/, { es: '$1 unidades · $2 habilidades', hi: '$1 इकाइयाँ · $2 कौशल' }],
    [/^Course mastery: (\d+)%$/, { es: 'Dominio del curso: $1 %', hi: 'पाठ्यक्रम में महारत: $1%' }], [/^(\d+)% mastered$/, { es: '$1 % dominado', hi: '$1% महारत' }],
    [/^(\d+) of (\d+) questions answered today$/, { es: '$1 de $2 preguntas respondidas hoy', hi: 'आज $2 में से $1 प्रश्न हल किए' }], [/^This week: (\d+) of (\d+) days$/, { es: 'Esta semana: $1 de $2 días', hi: 'इस सप्ताह: $2 में से $1 दिन' }],
    [/^Continue: (.+)$/, { es: 'Continuar: $1', hi: 'जारी रखें: $1' }], [/^Next: (.+)$/, { es: 'Siguiente: $1', hi: 'अगला: $1' }],
    [/^Practice · (\d+) questions$/, { es: 'Practicar · $1 preguntas', hi: 'अभ्यास · $1 प्रश्न' }], [/^Next skill: (.+)$/, { es: 'Siguiente habilidad: $1', hi: 'अगला कौशल: $1' }], [/^Badges to earn \((\d+)\)$/, { es: 'Insignias por ganar ($1)', hi: 'मिलने बाकी बैज ($1)' }],
    [/^(\d+) questions a day$/, { es: '$1 preguntas al día', hi: 'रोज़ $1 प्रश्न' }], [/^(\d+) days a week$/, { es: '$1 días por semana', hi: 'सप्ताह में $1 दिन' }],
    [/^(\d+) questions a day, about (\d+) minutes$/, { es: '$1 preguntas al día, unos $2 minutos', hi: 'रोज़ $1 प्रश्न, लगभग $2 मिनट' }],
    [/^\((\d+) remaining\)$/, { es: '(quedan $1)', hi: '($1 बाकी)' }], [/^(\d+)-day streak( ·)?$/, { es: 'Racha de $1 días$2', hi: 'लगातार $1 दिन$2' }],
    [/^(\d+) questions · about (\d+) minutes$/, { es: '$1 preguntas · unos $2 minutos', hi: '$1 प्रश्न · लगभग $2 मिनट' }],
    [/^(\d+) questions · about (\d+) minutes · (\d+) new skills?$/, { es: '$1 preguntas · unos $2 minutos · $3 habilidades nuevas', hi: '$1 प्रश्न · लगभग $2 मिनट · $3 नए कौशल' }],
  ];
  // words inside these are content (questions, lessons, hints, notes, the tutor's replies) and are never changed
  const KEEP = '.question, .learn, .choices, .hint, .we-q, .we-choices, .tmsg, .note-text, .tutor-body, textarea, #lang, script, style, code, pre, svg, [data-raw]';      // a field's typed value is never a text node, so only its placeholder can change
  let lang = 'en', watching = null;

  /** the chosen language's words for an English phrase, or null */
  function tr(t, code) {
    const L = code || lang, d = DICT[L];
    if (!d) return null;
    if (Object.prototype.hasOwnProperty.call(d, t)) return d[t];
    for (const [re, out] of PAT) { const m = re.exec(t); if (m && out[L]) return out[L].replace(/\$(\d)/g, (_, k) => m[k] || ''); }
    return null;
  }
  function fixText(node) {
    const raw = node.nodeValue, t = raw.trim();
    if (!t || t.length > 90) return;
    const x = tr(t);
    if (x == null || x === t) return;
    node.nodeValue = raw.replace(t, x);
    const p = node.parentElement;
    if (p && !p.hasAttribute('lang')) p.setAttribute('lang', lang);
  }
  function fixAttrs(el) {
    for (const a of ['placeholder', 'aria-label', 'title']) { const v = el.getAttribute(a); if (v) { const x = tr(v.trim()); if (x) el.setAttribute(a, x); } }
  }
  /** change the interface words in root (and below) to the chosen language */
  function apply(root) {
    if (lang === 'en' || !root) return;
    if (root.nodeType === 3) { if (!(root.parentElement && root.parentElement.closest(KEEP))) fixText(root); return; }
    if (root.nodeType !== 1 || root.closest(KEEP)) return;
    fixAttrs(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, { acceptNode: n => (n.nodeType === 1 && n.matches(KEEP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    const texts = [];
    while (w.nextNode()) { const n = w.currentNode; if (n.nodeType === 3) texts.push(n); else fixAttrs(n); }
    texts.forEach(fixText);
  }
  /** use a language: 'en', 'es' or 'hi' (changing back to English reloads the page, which is written in English) */
  function set(code) {
    lang = DICT[code] ? code : 'en';
    if (watching) { watching.disconnect(); watching = null; }
    if (lang === 'en' || typeof MutationObserver === 'undefined') return;
    watching = new MutationObserver(list => list.forEach(m => m.addedNodes.forEach(apply)));
    watching.observe(document.body, { childList: true, subtree: true });
    apply(document.body);
  }

  window.LANG = { set, tr, apply, get: () => lang, NAMES: { en: 'English', es: 'Español', hi: 'हिन्दी' } };
  set((window.STORE && STORE.get().profile.lang) || 'en');
})();
