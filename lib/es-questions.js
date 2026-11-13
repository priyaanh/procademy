/* Spanish question text (Preguntas en español), an option per learner in the practice player's Options menu
   (profile.player.es). Translations are written here by hand, never made by a machine on the fly: each covered
   skill has the English sentence patterns its generator uses, with the Spanish for each. Numbers, names,
   drawings, tables and the math itself are kept exactly as they are; only the words change. A question whose
   wording doesn't match one of its skill's patterns simply stays in English, so a learner never sees half a
   translation. The English is a tap away (Show in English), and hints, choices and the tutor stay in English.

   ESQ.prompt(q) is the one hook: the player draws ESQ.prompt(q) where it would draw q.prompt.
   ESQ.translate(q) gives the Spanish HTML or null; ESQ.SKILLS lists every covered skill. */
'use strict';
(function () {
  /* ---------- matching a prompt to a pattern ---------- */
  // in a pattern: # a number ($12.50, −3, 1,250, 0.5), @ a piece kept as it is (a drawing, a table, a fraction,
  // the math on its own line), ~ a name, * a few words (passed to a function); everything else must match exactly
  const TOKENS = { '#': '([−-]?\\$?\\d+(?:,\\d{3})*(?:\\.\\d+)?)', '@': '(\\{\\{\\d+\\}\\})', '~': '([A-Z][a-z]+)', '*': '(.+?)' };
  const compile = t => new RegExp('^' + [...t].map(ch => TOKENS[ch] || ch.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('') + '$');
  const words = html => html.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, ' ');
  /** the prompt with the parts that stay as they are swapped for {{n}} */
  function protect(html) {
    const kept = [];
    const keep = s => `{{${kept.push(s) - 1}}}`;
    let s = String(html)
      .replace(/<svg[\s\S]*?<\/svg>/g, keep)
      .replace(/<table[\s\S]*?<\/table>/g, keep)
      .replace(/<span class="frac">(?:(?!<span class="frac">)[\s\S])*?<\/span><\/span>/g, keep)
      .replace(/(\d+)?<span class="mixed">(\{\{\d+\}\})<\/span>/g, keep)
      .replace(/<div class="big">([\s\S]*?)<\/div>/g, (m, x) => (/[A-Za-z]{2,}/.test(words(x).replace(/\{\{\d+\}\}/g, '')) ? m : keep(m)));
    s = s.replace(/\s+/g, ' ').trim();
    return { s, kept };
  }
  const restore = (s, kept) => s.replace(/\{\{(\d+)\}\}/g, (m, k) => (kept[k] != null ? restore(kept[k], kept) : m));

  /* ---------- Spanish words that change with gender and number ---------- */
  // [singular, plural, gender]
  const NOUN = {
    apple: ['manzana', 'manzanas', 'f'], banana: ['plátano', 'plátanos', 'm'], berry: ['baya', 'bayas', 'f'], cookie: ['galleta', 'galletas', 'f'], star: ['estrella', 'estrellas', 'f'],
    flower: ['flor', 'flores', 'f'], frog: ['rana', 'ranas', 'f'], fish: ['pez', 'peces', 'm'], ladybug: ['mariquita', 'mariquitas', 'f'], ball: ['pelota', 'pelotas', 'f'], duck: ['pato', 'patos', 'm'],
    bird: ['pájaro', 'pájaros', 'm'], car: ['carro', 'carros', 'm'], block: ['bloque', 'bloques', 'm'], book: ['libro', 'libros', 'm'], pencil: ['lápiz', 'lápices', 'm'], crayon: ['crayón', 'crayones', 'm'],
    sticker: ['calcomanía', 'calcomanías', 'f'], marble: ['canica', 'canicas', 'f'], shell: ['concha', 'conchas', 'f'], balloon: ['globo', 'globos', 'm'], cupcake: ['pastelito', 'pastelitos', 'm'], egg: ['huevo', 'huevos', 'm'],
    circle: ['círculo', 'círculos', 'm'], square: ['cuadrado', 'cuadrados', 'm'], triangle: ['triángulo', 'triángulos', 'm'], heart: ['corazón', 'corazones', 'm'], diamond: ['rombo', 'rombos', 'm'], rectangle: ['rectángulo', 'rectángulos', 'm'], hexagon: ['hexágono', 'hexágonos', 'm'],
  };
  const PLURALS = Object.fromEntries(Object.entries(NOUN).flatMap(([k, v]) => [[k, k], [k === 'fish' ? 'fish' : k === 'berry' ? 'berries' : k + 's', k]]));
  const COLOR = { red: ['rojo', 'roja', 'rojos', 'rojas'], blue: ['azul', 'azul', 'azules', 'azules'], green: ['verde', 'verde', 'verdes', 'verdes'], orange: ['anaranjado', 'anaranjada', 'anaranjados', 'anaranjadas'], purple: ['morado', 'morada', 'morados', 'moradas'] };
  /** "apples" → { word: 'manzanas', g: 'f', pl: true } (count decides for words like fish); throws for a word not written here, so the question stays in English */
  function noun(en, count) {
    const k = PLURALS[en];
    if (!k) throw new Error('no Spanish for ' + en);
    const [one, many, g] = NOUN[k], pl = count != null ? String(count) !== '1' : en !== k;
    return { word: pl ? many : one, one, many, g, pl };
  }
  const color = (en, g, pl) => { const c = COLOR[en]; if (!c) throw new Error('no Spanish for ' + en); return c[(pl ? 2 : 0) + (g === 'f' ? 1 : 0)]; };
  const cuantos = g => (g === 'f' ? 'Cuántas' : 'Cuántos');
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  /** "6 red circles" (an M.items picture's label) → "6 círculos rojos" */
  const itemsLabel = label => label.split(' and ').map(part => {
    const m = part.match(/^(\d+) (empty |crossed out )?(red|blue|green|orange|purple) (\w+)$/);
    if (!m) throw new Error('label');
    const n = noun(m[4]);
    return `${m[1]} ${n.word} ${color(m[3], n.g, n.pl)}`;
  }).join(' y ');
  /** a kept drawing with its spoken label in Spanish too, where it's a picture of things to count */
  const drawing = svg => (/class="figure items"/.test(svg) ? svg.replace(/aria-label="([^"]*)"/, (m, l) => { try { return `aria-label="${itemsLabel(l)}"`; } catch (e) { return m; } }).replace(/<desc>([^<]*)<\/desc>/, (m, l) => { try { return `<desc>${itemsLabel(l)}</desc>`; } catch (e) { return m; } }) : svg);

  /* ---------- the patterns, skill by skill ---------- */
  const SIMPLEST = ' en su mínima expresión';
  const COMMON = [
    ['Add.@', 'Suma.$1'], ['Add.@@', 'Suma.$1$2'], ['Subtract.@', 'Resta.$1'], ['Subtract.@@', 'Resta.$1$2'], ['Multiply.@', 'Multiplica.$1'], ['Divide.@', 'Divide.$1'],
    ['Evaluate.@', 'Calcula.$1'], ['Simplify.@', 'Simplifica.$1'], ['Expand.@', 'Desarrolla.$1'], ['Solve for <i>x</i>.@', 'Despeja <i>x</i>.$1'],
    ['Fill in the missing number.@', 'Escribe el número que falta.$1'], ['What number goes in the box?@', '¿Qué número va en el recuadro?$1'],
    ['Multiply in your head.@', 'Multiplica mentalmente.$1'], ['Add in your head.@', 'Suma mentalmente.$1'], ['Subtract in your head.@', 'Resta mentalmente.$1'],
  ];
  const R = {};
  const add = (ids, rules) => ids.split(' ').forEach(id => { R[id] = (R[id] || []).concat(rules); });

  /* place value and rounding words */
  const PLACE = { ones: 'unidades', one: 'unidad', tens: 'decenas', ten: 'decena', hundreds: 'centenas', hundred: 'centena', thousands: 'millares', thousand: 'millar', tenths: 'décimas', tenth: 'décima', hundredths: 'centésimas', hundredth: 'centésima', thousandths: 'milésimas', thousandth: 'milésima' };
  const place = w => { if (!PLACE[w]) throw new Error('place ' + w); return PLACE[w]; };
  /** "3 hundreds, 4 tens, and 5 ones" → "3 centenas, 4 decenas y 5 unidades" */
  const placeList = s => s.replace(/,? and /, ' y ').replace(/(\d+) ([a-z]+)/g, (m, k, w) => `${k} ${place(w)}`);
  const NEAREST = { ten: 'a la decena más cercana', hundred: 'a la centena más cercana', thousand: 'al millar más cercano', 'ten thousand': 'a la decena de millar más cercana', 'hundred thousand': 'a la centena de millar más cercana', '10': 'a la decena más cercana', '100': 'a la centena más cercana', '1,000': 'al millar más cercano', '1000': 'al millar más cercano' };
  const nearest = w => { if (!NEAREST[w]) throw new Error('nearest ' + w); return NEAREST[w]; };
  const DAY = { Monday: 'el lunes', Tuesday: 'el martes', Wednesday: 'el miércoles', Thursday: 'el jueves', Friday: 'el viernes', Saturday: 'el sábado', Sunday: 'el domingo' };
  const day = w => { if (!DAY[w]) throw new Error('day ' + w); return DAY[w]; };
  /** a noun with its article: "the pencil" → "el lápiz" */
  const the = en => { const n = noun(en); return `${n.g === 'f' ? (n.pl ? 'las' : 'la') : (n.pl ? 'los' : 'el')} ${n.word}`; };
  Object.assign(NOUN, {
    chick: ['pollito', 'pollitos', 'm'], turtle: ['tortuga', 'tortugas', 'f'], bead: ['cuenta', 'cuentas', 'f'], button: ['botón', 'botones', 'm'], stamp: ['estampilla', 'estampillas', 'f'], card: ['tarjeta', 'tarjetas', 'f'],
    tank: ['pecera', 'peceras', 'f'], vase: ['florero', 'floreros', 'm'], net: ['red', 'redes', 'f'], bag: ['bolsa', 'bolsas', 'f'], plate: ['plato', 'platos', 'm'], carrot: ['zanahoria', 'zanahorias', 'f'], chair: ['silla', 'sillas', 'f'],
    dot: ['punto', 'puntos', 'm'], muffin: ['panquecito', 'panquecitos', 'm'], page: ['página', 'páginas', 'f'], pack: ['paquete', 'paquetes', 'm'], box: ['caja', 'cajas', 'f'], spoon: ['cuchara', 'cucharas', 'f'],
  });
  Object.keys(NOUN).forEach(k => { PLURALS[k] = k; PLURALS[k === 'fish' ? 'fish' : k === 'berry' ? 'berries' : k === 'box' ? 'boxes' : k + 's'] = k; });

  /* Kindergarten */
  add('k.count-objects', [['How many * *?@', m => { const n = noun(m[2]); return `¿${cuantos(n.g)} ${n.many} ${color(m[1], n.g, true)} hay?${m[3]}`; }]]);
  add('k.count-to-100', [['What number comes after #?@', '¿Qué número viene después del $1?$2'], ['What number comes before #?@', '¿Qué número viene antes del $1?$2'], ['What number is missing?@', '¿Qué número falta?$1'], ['Count by tens. What comes next?@', 'Cuenta de diez en diez. ¿Qué número sigue?$1']]);
  add('k.add-within-10', [
    ['How many * in all?@', m => { const n = noun(m[1]); return `¿${cuantos(n.g)} ${n.many} hay en total?${m[2]}`; }],
    ['~ has # *. ~ gets # more. How many * does ~ have now?', m => { const n = noun(m[3], m[2]); return `${m[1]} tiene ${m[2]} ${n.word}. ${m[4]} consigue ${m[5]} más. ¿${cuantos(n.g)} ${n.many} tiene ${m[7]} ahora?`; }],
  ]);
  add('k.sub-within-10', [
    ['~ has # *. ~ eats #. How many * are left?', m => { const n = noun(m[3], m[2]); return `${m[1]} tiene ${m[2]} ${n.word}. ${m[4]} se come ${m[5]}. ¿${cuantos(n.g)} ${n.many} quedan?`; }],
    ['Take away # *. How many are left?@', m => { const n = noun(m[2], m[1]); return `Quita ${m[1]} ${n.word}. ¿${cuantos(n.g)} quedan?${m[3]}`; }],
  ]);
  add('k.make-10', [['How many more dots make #?@', '¿Cuántos puntos más hacen falta para llegar a $1?$2'], ['What number makes #?@', '¿Qué número hace falta para formar $1?$2']]);
  add('k.sides-corners', [
    ['How many sides does this shape have?@', '¿Cuántos lados tiene esta figura?$1'], ['How many corners does this shape have?@', '¿Cuántas esquinas tiene esta figura?$1'],
    ['How many sides does a * have?', m => `¿Cuántos lados tiene un ${noun(m[1]).one}?`], ['How many corners does a * have?', m => `¿Cuántas esquinas tiene un ${noun(m[1]).one}?`],
  ]);

  /* 1st grade */
  add('g1.count-120', [['What number goes where the ? is?@', '¿Qué número va en el lugar de “?”?$1']]);
  add('g1.tens-ones', [
    ['What number do the blocks show?@', '¿Qué número muestran los bloques?$1'], ['How many <b>ones</b> are in this number?@', '¿Cuántas <b>unidades</b> hay en este número?$1'], ['How many <b>tens</b> are in this number?@', '¿Cuántas <b>decenas</b> hay en este número?$1'],
    ['What number is this?<div class="big">*</div>', m => `¿Qué número es este?<div class="big">${placeList(m[1])}</div>`],
  ]);
  add('g1.compare-two-digit g2.compare-numbers', [['Which sign makes this true?@', '¿Qué signo hace que esto sea verdadero?$1']]);
  add('g1.add-within-20 g1.sub-within-20 g1.missing-number g1.add-sub-tens g1.add-two-digit g2.add-sub-20 g2.add-sub-100', []);
  add('g1.ten-more-less', [['What is <b># less</b> than #?@', '¿Qué número es <b>$1 menos</b> que $2?$3'], ['What is <b># more</b> than #?@', '¿Qué número es <b>$1 más</b> que $2?$3']]);

  /* 2nd grade */
  add('g2.even-odd', [['# is even. Which shows # as two <b>equal</b> numbers added together?', '$1 es par. ¿Qué suma muestra $2 como dos números <b>iguales</b> sumados?'], ['Which number is <b>odd</b>?', '¿Qué número es <b>impar</b>?'], ['Which number is <b>even</b>?', '¿Qué número es <b>par</b>?']]);
  add('g2.place-value', [
    ['What number is this?<div class="big">*</div>', m => `¿Qué número es este?<div class="big">${placeList(m[1])}</div>`],
    ['What is the value of the <b>#</b> in #?', '¿Cuál es el valor del <b>$1</b> en $2?'],
    ['What digit is in the <b>*</b> place?@', m => `¿Qué dígito está en el lugar de las <b>${place(m[1])}</b>?${m[2]}`],
  ]);
  add('g2.expanded-form', [['Which is # in expanded form?', '¿Cuál es $1 en forma desarrollada?'], ['What number is this?@', '¿Qué número es este?$1']]);
  add('g2.word-problems-100', [
    ['~ has # *. ~ gets # more. How many * does ~ have now?', m => { const n = noun(m[3], m[2]); return `${m[1]} tiene ${m[2]} ${n.word}. ${m[4]} consigue ${m[5]} más. ¿${cuantos(n.g)} ${n.many} tiene ${m[7]} ahora?`; }],
    ['~ wants # *. ~ has # now. How many more * does ~ need?', m => { const n = noun(m[3], m[2]); return `${m[1]} quiere ${m[2]} ${n.word}. Ahora ${m[4]} tiene ${m[5]}. ¿${cuantos(n.g)} ${n.many} más necesita ${m[7]}?`; }],
    ['~ has # *. ~ has # *. How many more * does ~ have than ~?', m => { const n = noun(m[3], m[2]), n2 = noun(m[6], m[5]); return `${m[1]} tiene ${m[2]} ${n.word}. ${m[4]} tiene ${m[5]} ${n2.word}. ¿${cuantos(n.g)} ${n.many} más tiene ${m[8]} que ${m[9]}?`; }],
    ['~ has # *. ~ gives # to ~. How many * does ~ have left?', m => { const n = noun(m[3], m[2]); return `${m[1]} tiene ${m[2]} ${n.word}. ${m[4]} le da ${m[5]} a ${m[6]}. ¿${cuantos(n.g)} ${n.many} le quedan a ${m[8]}?`; }],
    ['~ has # *. ~ has # *. How many * do they have in all?', m => { const n = noun(m[3], m[2]), n2 = noun(m[6], m[5]); return `${m[1]} tiene ${m[2]} ${n.word}. ${m[4]} tiene ${m[5]} ${n2.word}. ¿${cuantos(n.g)} ${n.many} tienen en total?`; }],
    ['~ has # *. ~ gives ~ some more. Now ~ has #. How many * did ~ give?', m => { const n = noun(m[3], m[2]); return `${m[1]} tiene ${m[2]} ${n.word}. ${m[4]} le da ${n.g === 'f' ? 'algunas' : 'algunos'} más. Ahora ${m[6]} tiene ${m[7]}. ¿${cuantos(n.g)} ${n.many} le dio ${m[9]}?`; }],
  ]);
  add('g2.add-sub-1000', [['What is # less than #?', '¿Qué número es $1 menos que $2?'], ['What is # more than #?', '¿Qué número es $1 más que $2?']]);
  add('g2.skip-count', [['Skip count by #s. What number goes in the blank?@', 'Cuenta de $1 en $1. ¿Qué número va en el espacio en blanco?$2']]);
  add('g2.tell-time', [['What time does the clock show?@', '¿Qué hora marca el reloj?$1']]);
  add('g2.arrays', [
    ['This rectangle is cut into same-size squares. How many squares are there?@', 'Este rectángulo está dividido en cuadrados del mismo tamaño. ¿Cuántos cuadrados hay?$1'],
    ['Which addition adds the <b>rows</b> of this array?@', '¿Qué suma junta las <b>filas</b> de este arreglo?$1'],
    ['How many * are there in all?@', m => { const n = noun(m[1]); return `¿${cuantos(n.g)} ${n.many} hay en total?${m[2]}`; }],
  ]);

  /* 3rd grade */
  add('g3.equal-groups', [
    ['Which multiplication matches the picture?@', '¿Qué multiplicación corresponde al dibujo?$1'],
    ['How many * are there in all?@', m => { const n = noun(m[1]); return `¿${cuantos(n.g)} ${n.many} hay en total?${m[2]}`; }],
    ['~ has # *. Each * has # *. How many * does ~ have in all?', m => { const a = noun(m[3], m[2]), b = noun(m[4], 1), c = noun(m[6], m[5]); return `${m[1]} tiene ${m[2]} ${a.word}. Cada ${b.one} tiene ${m[5]} ${c.word}. ¿${cuantos(c.g)} ${c.many} tiene ${m[8]} en total?`; }],
  ]);
  add('g3.arrays', [
    ['Which multiplication matches this array? (rows × number in each row)@', '¿Qué multiplicación corresponde a este arreglo? (filas × número en cada fila)$1'],
    ['How many * are in this array?@', m => { const n = noun(m[1]); return `¿${cuantos(n.g)} ${n.many} hay en este arreglo?${m[2]}`; }],
    ['~ planted carrots in # rows. There are # carrots in each row. How many carrots are there in all?', '$1 sembró zanahorias en $2 filas. Hay $3 zanahorias en cada fila. ¿Cuántas zanahorias hay en total?'],
    ['~ lined up cupcakes in # rows. There are # cupcakes in each row. How many cupcakes are there in all?', '$1 acomodó pastelitos en $2 filas. Hay $3 pastelitos en cada fila. ¿Cuántos pastelitos hay en total?'],
    ['~ put stickers in # rows. There are # stickers in each row. How many stickers are there in all?', '$1 pegó calcomanías en $2 filas. Hay $3 calcomanías en cada fila. ¿Cuántas calcomanías hay en total?'],
    ['~ set out chairs in # rows. There are # chairs in each row. How many chairs are there in all?', '$1 acomodó sillas en $2 filas. Hay $3 sillas en cada fila. ¿Cuántas sillas hay en total?'],
  ]);
  add('g3.mult-facts', [['What is # groups of #?@', '¿Cuánto es $1 grupos de $2?$3']]);
  add('g3.mult-properties', [
    ['# × # = #. Use this to find the answer.@', '$1 × $2 = $3. Usa esto para hallar la respuesta.$4'],
    ['Fill in the missing number.@<p>Hint: # is # × #.</p>', 'Escribe el número que falta.$1<p>Pista: $2 es $3 × $4.</p>'],
    ['Break # into # + # to find the answer.@', 'Descompón $1 en $2 + $3 para hallar la respuesta.$4'],
    ['Which one has the same answer as # × #?', '¿Cuál tiene el mismo resultado que $1 × $2?'],
  ]);
  add('g3.rounding', [['Round to the nearest #.@', m => `Redondea ${nearest(m[1])}.${m[2]}`]]);
  add('g3.add-sub-1000', [
    ['A farm has # chickens and # ducks. How many birds are there in all?', 'Una granja tiene $1 gallinas y $2 patos. ¿Cuántas aves hay en total?'],
    ['~ needs # points to win a game. ~ has # points so far. How many more points does ~ need?', '$1 necesita $2 puntos para ganar un juego. Hasta ahora, $3 tiene $4 puntos. ¿Cuántos puntos más necesita $5?'],
    ['A library had # books. It gave away # books. How many books are left?', 'Una biblioteca tenía $1 libros. Regaló $2 libros. ¿Cuántos libros quedan?'],
    ['~ read # pages last month and # pages this month. How many pages did ~ read in all?', '$1 leyó $2 páginas el mes pasado y $3 páginas este mes. ¿Cuántas páginas leyó $4 en total?'],
  ]);
  const shareOut = (m, tail) => (m[2] === 'apples' ? `Hay ${m[1]} manzanas. Ponlas en ${m[3]} bolsas, con la misma cantidad en cada una. ¿Cuántas manzanas van en cada bolsa?${tail}` : `Hay ${m[1]} galletas. Ponlas en ${m[3]} platos, con la misma cantidad en cada uno. ¿Cuántas galletas van en cada plato?${tail}`);
  add('g3.div-facts', [
    ['# × # = #. Use this to divide.@', '$1 × $2 = $3. Usa esto para dividir.$4'],
    ['There are # *. Put them in # bags with the same number in each. How many apples go in each bag?', m => shareOut(m, '')], ['There are # *. Put them in # bags with the same number in each. How many apples go in each bag?@', m => shareOut(m, m[4])],
    ['There are # *. Put them in # plates with the same number on each. How many cookies go on each plate?', m => shareOut(m, '')], ['There are # *. Put them in # plates with the same number on each. How many cookies go on each plate?@', m => shareOut(m, m[4])],
  ]);
  add('g3.mult-div-word-problems', [
    ['Find the missing number.@', 'Halla el número que falta.$1'],
    ['~ has # cookies. ~ puts # cookies in each bag. How many bags does ~ fill?', '$1 tiene $2 galletas. $3 pone $4 galletas en cada bolsa. ¿Cuántas bolsas llena $5?'],
    ['A garden has # rows of beans. Each row has # plants. How many bean plants are there?', 'Un huerto tiene $1 hileras de frijoles. Cada hilera tiene $2 plantas. ¿Cuántas plantas de frijol hay?'],
    ['# children are going on a trip. Each van holds # children. How many vans do they need?', '$1 niños van de excursión. En cada camioneta caben $2 niños. ¿Cuántas camionetas necesitan?'],
    ['# crayons are put into # boxes, the same number in each box. How many crayons are in each box?', 'Se reparten $1 crayones en $2 cajas, con la misma cantidad en cada caja. ¿Cuántos crayones hay en cada caja?'],
    ['~ buys # packs of pencils. Each pack has # pencils. How many pencils does ~ buy?', '$1 compra $2 paquetes de lápices. Cada paquete tiene $3 lápices. ¿Cuántos lápices compra $4?'],
    ['~ has # stickers to share equally with # friends. How many stickers does each friend get?', '$1 tiene $2 calcomanías para repartir en partes iguales entre $3 amigos. ¿Cuántas calcomanías le tocan a cada amigo?'],
  ]);
  const FOOD = { pie: ['un pastel', 'del pastel', 'rebanada', 'rebanadas'], pizza: ['una pizza', 'de la pizza', 'rebanada', 'rebanadas'], 'chocolate bar': ['una barra de chocolate', 'de la barra de chocolate', 'pedazo', 'pedazos'] };
  add('g3.unit-fractions', [
    ['What fraction of the circle is shaded?@', '¿Qué fracción del círculo está sombreada?$1'], ['What fraction of the bar is shaded?@', '¿Qué fracción de la barra está sombreada?$1'],
    ['The bar is split into equal parts. What fraction is the one shaded part?@', 'La barra está dividida en partes iguales. ¿Qué fracción es la parte sombreada?$1'],
    ['The circle is split into equal parts. What fraction is the one shaded part?@', 'El círculo está dividido en partes iguales. ¿Qué fracción es la parte sombreada?$1'],
    ['A * is cut into # equal *. ~ eats # *. What fraction of the * does ~ eat?', m => { const f = FOOD[m[1]]; if (!f) return null; const cut = f[0].startsWith('una') ? 'cortada' : 'cortado'; return `${cap(f[0])} está ${cut} en ${m[2]} ${f[3]} iguales. ${m[4]} se come ${m[5]} ${m[5] === '1' ? f[2] : f[3]}. ¿Qué fracción ${f[1]} se come ${m[8]}?`; }],
  ]);
  add('g3.fractions-number-line', [['What fraction does the dot show?@', '¿Qué fracción muestra el punto?$1'], ['Which point is at @?@', '¿Qué punto está en $1?$2']]);
  add('g3.equivalent-fractions', [['Which fraction is equal to @?', '¿Qué fracción es igual a $1?'], ['What whole number is this fraction equal to?@', '¿A qué número entero es igual esta fracción?$1'], ['Fill in the missing number.@@@', 'Escribe el número que falta.$1$2$3']]);
  add('g3.mult-multiples-10', [
    ['~ rides a bike for # minutes a day for # days. How many minutes is that in all?', '$1 anda en bicicleta $2 minutos al día durante $3 días. ¿Cuántos minutos son en total?'],
    ['~ saves # cents each week for # weeks. How many cents does ~ save?', '$1 ahorra $2 centavos cada semana durante $3 semanas. ¿Cuántos centavos ahorra $4?'],
    ['Each box holds # crayons. How many crayons are in # boxes?', 'En cada caja caben $1 crayones. ¿Cuántos crayones hay en $2 cajas?'],
  ]);

  /* 4th grade */
  add('g4.place-value', [['What is the value of the digit <b>#</b> in this number?@', '¿Cuál es el valor del dígito <b>$1</b> en este número?$2'], ['Which symbol makes this true?@', '¿Qué símbolo hace que esto sea verdadero?$1'], ['Write this number in standard form.@', 'Escribe este número en forma estándar.$1']]);
  add('g4.round-whole', [
    ['Round # to the nearest *.', m => `Redondea ${m[1]} ${nearest(m[2])}.`],
    ['A stadium had # visitors this year. Round that number to the nearest *.', m => `Un estadio tuvo ${m[1]} visitantes este año. Redondea ese número ${nearest(m[2])}.`],
    ['~\'s class collected # bottle caps. Round to the nearest *.', m => `La clase de ${m[1]} juntó ${m[2]} tapas de botella. Redondea ${nearest(m[3])}.`],
  ]);
  add('g4.add-sub-multi-digit', [
    ['A town had # trees. A storm knocked down # of them. How many trees are still standing?', 'Un pueblo tenía $1 árboles. Una tormenta derribó $2 de ellos. ¿Cuántos árboles siguen en pie?'],
    ['A library has # books for adults and # books for children. How many books is that in all?', 'Una biblioteca tiene $1 libros para adultos y $2 libros para niños. ¿Cuántos libros son en total?'],
    ['~ needs # points to win a game and has # so far. How many more points does ~ need?', '$1 necesita $2 puntos para ganar un juego y lleva $3 hasta ahora. ¿Cuántos puntos más necesita $4?'],
    ['A farm grew # apples last year and # apples this year. How many apples is that altogether?', 'Una granja cosechó $1 manzanas el año pasado y $2 manzanas este año. ¿Cuántas manzanas son en total?'],
  ]);
  add('g4.multiply-1-digit', [
    ['A theater has # rows with # seats in each row. How many seats are there?', 'Un teatro tiene $1 filas con $2 asientos en cada fila. ¿Cuántos asientos hay?'],
    ['A box holds # paper clips. How many paper clips are in # boxes?', 'En una caja caben $1 clips. ¿Cuántos clips hay en $2 cajas?'],
    ['~ walks # steps to school. How many steps is that in # trips?', '$1 camina $2 pasos para llegar a la escuela. ¿Cuántos pasos son en $3 viajes?'],
  ]);
  add('g4.multiply-2-digit', [
    ['A bus can carry # students. How many students can # buses carry?', 'En un autobús caben $1 estudiantes. ¿Cuántos estudiantes caben en $2 autobuses?'],
    ['A garden has # rows of tulips with # tulips in each row. How many tulips are there?', 'Un jardín tiene $1 hileras de tulipanes con $2 tulipanes en cada hilera. ¿Cuántos tulipanes hay?'],
    ['~ reads # pages every day. How many pages does ~ read in # days?', '$1 lee $2 páginas cada día. ¿Cuántas páginas lee $3 en $4 días?'],
  ]);
  add('g4.divide-remainders', [
    ['~ has # *. Each * holds # *. How many * does ~ need to fit all of them?', m => { const it = noun(m[3], m[2]), b = noun(m[4], 1); return `${m[1]} tiene ${m[2]} ${it.word}. En cada ${b.one} caben ${m[5]} ${noun(m[6], m[5]).word}. ¿${cuantos(b.g)} ${b.many} necesita ${m[8]} para que quepan ${it.g === 'f' ? 'todas' : 'todos'}?`; }],
    ['~ has # *. Each * holds # *. How many * can ~ fill all the way?', m => { const it = noun(m[3], m[2]), b = noun(m[4], 1); return `${m[1]} tiene ${m[2]} ${it.word}. En cada ${b.one} caben ${m[5]} ${noun(m[6], m[5]).word}. ¿${cuantos(b.g)} ${b.many} puede llenar por completo ${m[8]}?`; }],
    ['~ has # *. Each * holds # *. ~ fills as many * as possible. How many * are left over?', m => { const it = noun(m[3], m[2]), b = noun(m[4], 1); return `${m[1]} tiene ${m[2]} ${it.word}. En cada ${b.one} caben ${m[5]} ${noun(m[6], m[5]).word}. ${m[7]} llena ${b.g === 'f' ? 'todas las' : 'todos los'} ${b.many} que puede. ¿${cuantos(it.g)} ${it.many} sobran?`; }],
  ]);
  add('g4.number-patterns', [
    ['What number comes next in this pattern?@', '¿Qué número sigue en este patrón?$1'], ['What number is missing from this pattern?@', '¿Qué número falta en este patrón?$1'],
    ['A pattern starts at #. The rule is "add #". What is the #th number in the pattern?', 'Un patrón empieza en $1. La regla es “suma $2”. ¿Cuál es el número que ocupa la posición $3 en el patrón?'],
  ]);
  add('g4.equivalent-fractions', [['Which fraction is equivalent to @?', '¿Qué fracción es equivalente a $1?']]);
  add('g4.add-sub-fractions', [
    ['~ painted @ of a fence on Saturday and @ of the fence on Sunday. What fraction of the fence did ~ paint in all?', '$1 pintó $2 de una cerca el sábado y $3 de la cerca el domingo. ¿Qué fracción de la cerca pintó $4 en total?'],
    ['~ had @ of a ribbon. ~ used @ of the ribbon for a craft. What fraction of the ribbon is left?', '$1 tenía $2 de una cinta. $3 usó $4 de la cinta para una manualidad. ¿Qué fracción de la cinta queda?'],
  ]);
  add('g4.mixed-numbers', [
    ['Subtract. Give your answer as a mixed number.@', 'Resta. Da tu respuesta como número mixto.$1'], ['Add. Give your answer as a mixed number.@', 'Suma. Da tu respuesta como número mixto.$1'],
    ['Which fraction is the same as @?', '¿Qué fracción es igual a $1?'],
    ['~ had @ cups of flour and used @ cups to bake bread. How many cups of flour are left?', '$1 tenía $2 tazas de harina y usó $3 tazas para hornear pan. ¿Cuántas tazas de harina quedan?'],
    ['~ walked @ miles on Monday and @ miles on Tuesday. How many miles is that in all?', '$1 caminó $2 millas el lunes y $3 millas el martes. ¿Cuántas millas son en total?'],
  ]);
  add('g4.fraction-times-whole', [
    ['Which is equal to this?@', '¿Cuál es igual a esto?$1'],
    ['A recipe needs @ cup of sugar. ~ makes the recipe # times. How many cups of sugar is that?', 'Una receta lleva $1 de taza de azúcar. $2 prepara la receta $3 veces. ¿Cuántas tazas de azúcar son?'],
    ['~ drinks @ of a liter of water every hour. How many liters does ~ drink in # hours?', '$1 bebe $2 de litro de agua cada hora. ¿Cuántos litros bebe $3 en $4 horas?'],
    ['Each lap around the park is @ of a mile. ~ runs # laps. How many miles is that?', 'Cada vuelta al parque mide $1 de milla. $2 corre $3 vueltas. ¿Cuántas millas son?'],
  ]);
  add('g4.decimal-fractions', [
    ['Write this as a decimal.@', 'Escríbelo como número decimal.$1'], ['Add. Give the number that goes on top.@', 'Suma. Escribe el número que va arriba.$1'],
    ['What digit is in the <b>*</b> place?@', m => `¿Qué dígito está en el lugar de las <b>${place(m[1])}</b>?${m[2]}`],
  ]);
  add('g4.compare-decimals', [['Which symbol makes this true?@', '¿Qué símbolo hace que esto sea verdadero?$1'], ['Which decimal is the <b>least</b>?', '¿Qué número decimal es el <b>menor</b>?'], ['Which decimal is the <b>greatest</b>?', '¿Qué número decimal es el <b>mayor</b>?']]);
  add('g4.estimate-sum-diff', [
    ['Which is the best estimate of the sum?@', '¿Cuál es la mejor estimación de la suma?$1'], ['Which is the best estimate of the difference?@', '¿Cuál es la mejor estimación de la diferencia?$1'],
    ['Estimate by rounding each number to the nearest *.@', m => `Estima redondeando cada número ${nearest(m[1])}.${m[2]}`],
    ['~\'s school collected # cans in March and # cans in April. Estimate how many more cans were collected in March, rounding each number to the nearest *.', m => `La escuela de ${m[1]} juntó ${m[2]} latas en marzo y ${m[3]} latas en abril. Estima cuántas latas más se juntaron en marzo, redondeando cada número ${nearest(m[4])}.`],
    ['A theater sold # tickets on ~ and # on ~. Estimate the total, rounding each number to the nearest *.', m => `Un teatro vendió ${m[1]} boletos ${day(m[2])} y ${m[3]} ${day(m[4])}. Estima el total, redondeando cada número ${nearest(m[5])}.`],
  ]);
  add('g4.mental-math', []);

  /* 5th grade */
  add('g5.decimal-place-value', [
    ['What is the value of the digit <b>#</b> in this number?@', '¿Cuál es el valor del dígito <b>$1</b> en este número?$2'],
    ['Write this as a decimal number.@', 'Escríbelo como número decimal.$1'],
    ['Write this as a decimal number.<div class="big">*</div>', m => `Escríbelo como número decimal.<div class="big">${placeList(m[1])}</div>`],
    ['In #, the # in the * place is worth how many times as much as the # in the * place?@', m => `En ${m[1]}, ¿cuántas veces vale el ${m[2]} del lugar de las ${place(m[3])} lo que vale el ${m[4]} del lugar de las ${place(m[5])}?${m[6]}`],
  ]);
  add('g5.compare-round-decimals', [
    ['Which symbol makes this true?@', '¿Qué símbolo hace que esto sea verdadero?$1'], ['Round to the nearest <b>whole number</b>.@', 'Redondea al <b>número entero</b> más cercano.$1'],
    ['Round to the nearest <b>hundredth</b>.@', 'Redondea a la <b>centésima</b> más cercana.$1'], ['Round to the nearest <b>tenth</b>.@', 'Redondea a la <b>décima</b> más cercana.$1'],
  ]);
  add('g5.add-sub-decimals', [
    ['~ buys a book for # and a snack for #. How much does ~ spend in all?', '$1 compra un libro por $2 y un refrigerio por $3. ¿Cuánto gasta $4 en total?'],
    ['~ has #. A kite costs #. How much money will ~ have left after buying the kite?', '$1 tiene $2. Una cometa cuesta $3. ¿Cuánto dinero le quedará a $4 después de comprar la cometa?'],
    ['A tank holds # liters of water. ~ uses # liters to water the garden. How many liters are left in the tank?', 'Un tanque tiene $1 litros de agua. $2 usa $3 litros para regar el jardín. ¿Cuántos litros quedan en el tanque?'],
    ['~ rides a bike # km to the park and then # km to the library. How far does ~ ride in all?', '$1 va en bicicleta $2 km hasta el parque y luego $3 km hasta la biblioteca. ¿Qué distancia recorre $4 en total?'],
  ]);
  add('g5.multiply-multi-digit', [
    ['A farm packs # crates of apples. Each crate holds # apples. How many apples is that in all?', 'Una granja empaca $1 cajas de manzanas. En cada caja caben $2 manzanas. ¿Cuántas manzanas son en total?'],
    ['A train travels # miles every day. How many miles does it travel in # days?', 'Un tren recorre $1 millas cada día. ¿Cuántas millas recorre en $2 días?'],
    ['~\'s school orders # boxes of pencils. Each box holds # pencils. How many pencils does the school get?', 'La escuela de $1 pide $2 cajas de lápices. En cada caja caben $3 lápices. ¿Cuántos lápices recibe la escuela?'],
  ]);
  add('g5.powers-of-ten', [['Write # as a power of ten. What is the exponent?@', 'Escribe $1 como potencia de diez. ¿Cuál es el exponente?$2']]);
  add('g5.order-of-operations', [
    ['Without calculating, how many times as large is the first expression as the second?<div class="big"># × (# + #) &nbsp;&nbsp; and &nbsp;&nbsp; # + #</div>', 'Sin hacer el cálculo: ¿por qué número hay que multiplicar la segunda expresión para obtener la primera?<div class="big">$1 × ($2 + $3) &nbsp;&nbsp; y &nbsp;&nbsp; $4 + $5</div>'],
    ['Which expression matches these words?<div class="big">Multiply # by #, then subtract #.</div>', '¿Qué expresión corresponde a estas palabras?<div class="big">Multiplica $1 por $2 y luego resta $3.</div>'],
    ['Which expression matches these words?<div class="big">Add # and #, then multiply by #.</div>', '¿Qué expresión corresponde a estas palabras?<div class="big">Suma $1 y $2 y luego multiplica por $3.</div>'],
    ['Which expression matches these words?<div class="big">Subtract # from #, then divide by #.</div>', '¿Qué expresión corresponde a estas palabras?<div class="big">Resta $1 de $2 y luego divide entre $3.</div>'],
    ['Which expression matches these words?<div class="big"># times the sum of # and #.</div>', '¿Qué expresión corresponde a estas palabras?<div class="big">$1 veces la suma de $2 y $3.</div>'],
  ]);
  const ORD = /^(\d+)(?:st|nd|rd|th)$/;
  const nth = s => { const m = String(s).match(ORD); if (!m) throw new Error('ordinal'); return m[1]; };
  add('g5.numerical-patterns', [
    ['What number is missing from this pattern?@', '¿Qué número falta en este patrón?$1'],
    ['Pattern A starts at # and adds #. Pattern B starts at # and adds #. Each term in pattern B is how many times the matching term in pattern A?@', 'El patrón A empieza en $1 y suma $2. El patrón B empieza en $3 y suma $4. ¿Por qué número hay que multiplicar cada término del patrón A para obtener el término correspondiente del patrón B?$5'],
    ['Pattern A starts at # and adds #. Pattern B starts at # and adds #. Which ordered pair is made from the * term of A and the * term of B?', m => `El patrón A empieza en ${m[1]} y suma ${m[2]}. El patrón B empieza en ${m[3]} y suma ${m[4]}. ¿Qué par ordenado se forma con el término número ${nth(m[5])} de A y el término número ${nth(m[6])} de B?`],
    ['The rule is “start at # and add #.” The pattern begins * What is the * number in the pattern?', m => `La regla es “empieza en ${m[1]} y suma ${m[2]}”. El patrón comienza así: ${m[3]} ¿Cuál es el número que ocupa la posición ${nth(m[4])} en el patrón?`],
  ]);
  add('g5.times-11', []);
  add('g5.estimate-products', [['Estimate the product by rounding each factor to its leading digit.@', 'Estima el producto redondeando cada factor a su primer dígito (el de mayor valor).$1'], ['Which is the best estimate?@', '¿Cuál es la mejor estimación?$1']]);

  /* 6th grade */
  add('g6.percents', [
    ['# is what percent of #?', '¿Qué porcentaje de $2 es $1?'], ['# is #% of what number?', '$1 es el $2% de ¿qué número?'],
    ['~ has saved #. That is #% of the price of a bike. How much does the bike cost?', '$1 ha ahorrado $2. Eso es el $3% del precio de una bicicleta. ¿Cuánto cuesta la bicicleta?'],
    ['A test has # questions. ~ got #% of them right. How many questions did ~ get right?', 'Un examen tiene $1 preguntas. $2 contestó bien el $3% de ellas. ¿Cuántas preguntas contestó bien $4?'],
    ['What is #% of #?<div class="big">#% of # = ?</div>', '¿Cuánto es el $1% de $2?<div class="big">$3% de $4 = ?</div>'],
  ]);
  add('g6.decimals', []);
  add('g6.distributive-factor', [
    ['Use the greatest common factor and the distributive property to write the sum as a product.@', 'Usa el máximo común divisor y la propiedad distributiva para escribir la suma como un producto.$1'],
    ['Fill in the missing number. Use the greatest common factor.@', 'Escribe el número que falta. Usa el máximo común divisor.$1'],
    ['Use the distributive property to find the product.@', 'Usa la propiedad distributiva para hallar el producto.$1'],
  ]);
  add('g6.evaluate-expressions', [['Evaluate the expression when <i>x</i> = #.@', 'Evalúa la expresión cuando <i>x</i> = $1.$2'], ['Evaluate the expression when <i>x</i> = # and <i>y</i> = #.@', 'Evalúa la expresión con <i>x</i> = $1 y con <i>y</i> = $2.$3']]);
  const INEQ = [['An elevator can carry <b>at most</b> # people. Which inequality shows this, using <i>p</i>?', 'En un elevador caben <b>como máximo</b> $1 personas. ¿Qué desigualdad lo muestra, usando <i>p</i>?'],
    ['You need a <b>minimum</b> of # points to win a prize. Which inequality shows this, using <i>k</i>?', 'Necesitas un <b>mínimo</b> de $1 puntos para ganar un premio. ¿Qué desigualdad lo muestra, usando <i>k</i>?'],
    ['You must be <b>at least</b> # years old to join the club. Which inequality shows this, using <i>a</i>?', 'Debes tener <b>por lo menos</b> $1 años para entrar al club. ¿Qué desigualdad lo muestra, usando <i>a</i>?'],
    ['Each team can have <b>no more than</b> # players. Which inequality shows this, using <i>p</i>?', 'Cada equipo puede tener <b>no más de</b> $1 jugadores. ¿Qué desigualdad lo muestra, usando <i>p</i>?'],
    ['The temperature stayed <b>above</b> #°F all day. Which inequality shows this, using <i>t</i>?', 'La temperatura se mantuvo <b>por encima de</b> $1 °F todo el día. ¿Qué desigualdad lo muestra, usando <i>t</i>?'],
    ['The book has <b>more than</b> # pages. Which inequality shows this, using <i>n</i>?', 'El libro tiene <b>más de</b> $1 páginas. ¿Qué desigualdad lo muestra, usando <i>n</i>?'],
    ['There are <b>fewer than</b> # seats left. Which inequality shows this, using <i>s</i>?', 'Quedan <b>menos de</b> $1 asientos. ¿Qué desigualdad lo muestra, usando <i>s</i>?'],
    ['The bag weighs <b>less than</b> # pounds. Which inequality shows this, using <i>w</i>?', 'La bolsa pesa <b>menos de</b> $1 libras. ¿Qué desigualdad lo muestra, usando <i>w</i>?']];
  add('g6.inequalities', [['Which value of <i>x</i> is a solution of the inequality?@', '¿Qué valor de <i>x</i> es una solución de la desigualdad?$1'], ['Which inequality does the number line show?@', '¿Qué desigualdad muestra la recta numérica?$1']].concat(INEQ));
  add('g6.mean-median', [
    ['Find the <b>median</b>.@', 'Halla la <b>mediana</b>.$1'], ['Find the <b>mean</b>.@', 'Halla la <b>media</b>.$1'],
    ['~ scored these points in # basketball games. What is the mean number of points per game?@', '$1 anotó estos puntos en $2 partidos de básquetbol. ¿Cuál es la media de puntos por partido?$3'],
    ['The mean of # numbers is #. Here are # of them: *. What is the missing number?', 'La media de $1 números es $2. Estos son $3 de ellos: $4. ¿Cuál es el número que falta?'],
  ]);
  add('g6.percent-in-head', [
    ['Sneakers cost #. They are #% off. What is the sale price?', 'Unos tenis cuestan $1. Tienen $2% de descuento. ¿Cuál es el precio de oferta?'],
    ['A meal costs #. Work out a #% tip in your head.', 'Una comida cuesta $1. Calcula mentalmente una propina del $2%.'],
    ['A jacket costs # and is #% off. How much is taken off the price?', 'Una chaqueta cuesta $1 y tiene $2% de descuento. ¿Cuánto se descuenta del precio?'],
    ['Sales tax is #%. How much tax is added to a # bike helmet?', 'El impuesto sobre la venta es del $1%. ¿Cuánto impuesto se suma a un casco de bicicleta de $2?'],
    ['A game costs #. How much is #% of the price?', 'Un juego cuesta $1. ¿Cuánto es el $2% del precio?'],
    ['A haircut costs #. What is a #% tip?', 'Un corte de pelo cuesta $1. ¿De cuánto es una propina del $2%?'],
  ]);
  const RECIPE = { pancakes: ['panqueques', 'panqueques', 'm'], soup: ['sopa', 'tazones', 'm'], cookies: ['galletas', 'galletas', 'f'], muffins: ['panquecitos', 'panquecitos', 'm'], lemonade: ['limonada', 'vasos', 'm'], 'granola bars': ['barras de granola', 'barras', 'f'] };
  const STUFF = { 'cups of flour': 'tazas de harina', 'teaspoons of salt': 'cucharaditas de sal', 'cups of sugar': 'tazas de azúcar', 'cups of milk': 'tazas de leche', 'cups of lemon juice': 'tazas de jugo de limón', 'cups of oats': 'tazas de avena' };
  add('g6.recipe-scaling', [['~\'s recipe for * makes # * and uses # *. How many * are needed for # *?', m => {
    const r = RECIPE[m[2]], s = STUFF[m[6]];
    if (!r || !s || STUFF[m[7]] !== s) return null;
    return `La receta de ${r[0]} de ${m[1]} rinde ${m[3]} ${r[1]} y lleva ${m[5]} ${s}. ¿Cuántas ${s} se necesitan para ${m[8]} ${r[1]}?`;
  }]]);
  const BUY = { 'bags of seeds': ['bolsas de semillas', 'a watering can', 'una regadera', 'f'], notebooks: ['cuadernos', 'a pen', 'una pluma', 'm'], 'packs of cards': ['paquetes de tarjetas', 'a drink', 'una bebida', 'm'], 'comic books': ['cómics', 'a bookmark', 'un separador', 'm'] };
  const WANT = { 'a telescope': ['un telescopio', 'cuesta'], 'a pair of headphones': ['unos audífonos', 'cuestan'], 'a bike': ['una bicicleta', 'cuesta'], 'a video game': ['un videojuego', 'cuesta'], 'a tablet case': ['una funda para tableta', 'cuesta'], 'a skateboard': ['una patineta', 'cuesta'] };
  add('g6.money-plans', [
    ['~ has #. ~ buys # * at # each and * for #. How much money is left?', m => { const b = BUY[m[5]]; if (!b || b[1] !== m[7]) return null; return `${m[1]} tiene ${m[2]}. ${m[3]} compra ${m[4]} ${b[0]} a ${m[6]} ${b[3] === 'f' ? 'cada una' : 'cada uno'} y ${b[2]} por ${m[8]}. ¿Cuánto dinero le queda?`; }],
    ['~ wants * that costs #. ~ has # saved and saves # each week. How many weeks until ~ has enough?', m => { const w = WANT[m[2]]; if (!w) return null; return `${m[1]} quiere ${w[0]} que ${w[1]} ${m[3]}. ${m[4]} tiene ${m[5]} ahorrados y ahorra ${m[6]} cada semana. ¿Cuántas semanas faltan para que ${m[7]} tenga suficiente?`; }],
  ]);

  /* 7th grade */
  const SIMPLE = { 'as a fraction in simplest form': 'como fracción en su mínima expresión', 'as a fraction or whole number in simplest form': 'como fracción o número entero en su mínima expresión', 'as a fraction or mixed number in simplest form': 'como fracción o número mixto en su mínima expresión', 'in simplest form': 'en su mínima expresión', 'as a fraction': 'como fracción', 'as a percent': 'como porcentaje' };
  const giveAs = w => { if (!SIMPLE[w]) throw new Error('give ' + w); return SIMPLE[w]; };
  add('math7.add-negatives math7.sub-negatives math7.mul-div-negatives math7.order-ops-negatives math7.combine-like-terms math7.distribute math7.two-step-inequalities math8.variables-both-sides math8.distributive-equations', []);
  const GIVE = [['Add. Give your answer *.@', m => `Suma. Da tu respuesta ${giveAs(m[1])}.${m[2]}`], ['Subtract. Give your answer *.@', m => `Resta. Da tu respuesta ${giveAs(m[1])}.${m[2]}`], ['Multiply. Give your answer *.@', m => `Multiplica. Da tu respuesta ${giveAs(m[1])}.${m[2]}`], ['Divide. Give your answer *.@', m => `Divide. Da tu respuesta ${giveAs(m[1])}.${m[2]}`], ['Evaluate. Give your answer *.@', m => `Calcula. Da tu respuesta ${giveAs(m[1])}.${m[2]}`]];
  add('math7.add-sub-fractions math7.mul-div-fractions', GIVE);
  add('math7.abs-distance', [
    ['How far apart are # and # on the number line?', '¿A qué distancia están $1 y $2 en la recta numérica?'],
    ['The temperature at dawn was #°C. By noon it was #°C. By how many degrees did it change?', 'Al amanecer, la temperatura era de $1 °C. Al mediodía era de $2 °C. ¿Cuántos grados cambió?'],
  ]);
  add('math7.convert-fdp', [
    ['Write #% as a decimal.', 'Escribe $1% como número decimal.'], ['Write @ as a decimal.', 'Escribe $1 como número decimal.'], ['Write @ as a percent.', 'Escribe $1 como porcentaje.'], ['Write # as a percent.', 'Escribe $1 como porcentaje.'],
    ['Write # as a fraction in simplest form.', 'Escribe $1 como fracción en su mínima expresión.'], ['Write #% as a fraction in simplest form.', 'Escribe $1% como fracción en su mínima expresión.'],
  ]);
  add('math7.percent-of', [
    ['What is #% of #?', '¿Cuánto es el $1% de $2?'],
    ['~ has saved # and spends #% of it on a game. How much does the game cost?', '$1 ha ahorrado $2 y gasta el $3% en un juego. ¿Cuánto cuesta el juego?'],
    ['A class has # students and #% of them walk to school. How many students walk?', 'Una clase tiene $1 estudiantes y el $2% de ellos va caminando a la escuela. ¿Cuántos estudiantes van caminando?'],
    ['A #-page book is #% read. How many pages have been read?', 'Ya se leyó el $2% de un libro de $1 páginas. ¿Cuántas páginas se han leído?'],
  ]);
  add('math7.constant-k', [
    ['<i>y</i> is proportional to <i>x</i>. When <i>x</i> = #, <i>y</i> = #. What is the constant of proportionality?', '<i>y</i> es proporcional a <i>x</i>. Cuando <i>x</i> = $1, <i>y</i> = $2. ¿Cuál es la constante de proporcionalidad?'],
    ['<i>y</i> is proportional to <i>x</i>. What is the constant of proportionality?@', '<i>y</i> es proporcional a <i>x</i>. ¿Cuál es la constante de proporcionalidad?$1'],
    ['~ pays # for # kg of apples. Apples cost the same per kilogram. What is the constant of proportionality, in dollars per kilogram?', '$1 paga $2 por $3 kg de manzanas. Las manzanas cuestan lo mismo por kilogramo. ¿Cuál es la constante de proporcionalidad, en dólares por kilogramo?'],
    ['What is the constant of proportionality in <i>y</i> = #<i>x</i>?', '¿Cuál es la constante de proporcionalidad en <i>y</i> = $1<i>x</i>?'],
    ['What is the constant of proportionality in <i>y</i> = <i>x</i> × #?', '¿Cuál es la constante de proporcionalidad en <i>y</i> = <i>x</i> × $1?'],
  ]);
  add('math7.percent-change', [
    ['~ buys a # pair of shoes at #% off. What is the sale price?', '$1 compra un par de zapatos de $2 con $3% de descuento. ¿Cuál es el precio de oferta?'],
    ['A town\'s population changed from # to #. What was the percent increase?', 'La población de un pueblo pasó de $1 a $2. ¿Cuál fue el porcentaje de aumento?'],
    ['A town\'s population changed from # to #. What was the percent decrease?', 'La población de un pueblo pasó de $1 a $2. ¿Cuál fue el porcentaje de disminución?'],
    ['A price went from # to #. What was the percent decrease?', 'Un precio pasó de $1 a $2. ¿Cuál fue el porcentaje de disminución?'],
    ['A price went from # to #. What was the percent increase?', 'Un precio pasó de $1 a $2. ¿Cuál fue el porcentaje de aumento?'],
    ['A meal costs # and ~ adds a #% tip. What is the total?', 'Una comida cuesta $1 y $2 agrega una propina del $3%. ¿Cuál es el total?'],
    ['A # item has #% tax added. What is the total price?', 'A un artículo de $1 se le suma un impuesto del $2%. ¿Cuál es el precio total?'],
  ]);
  add('math7.two-step-equations', [['~ buys # notebooks and a # pen, and pays # in total. How much does one notebook cost, in dollars?', '$1 compra $2 cuadernos y una pluma de $3, y paga $4 en total. ¿Cuánto cuesta un cuaderno, en dólares?']]);
  add('math7.angle-pairs', [
    ['Two angles of a triangle measure #° and #°. What is the third angle?', 'Dos ángulos de un triángulo miden $1° y $2°. ¿Cuánto mide el tercer ángulo?'],
    ['Two angles sit side by side on a straight line. One measures #°. What is the other?', 'Dos ángulos están uno junto al otro sobre una línea recta. Uno mide $1°. ¿Cuánto mide el otro?'],
    ['Two lines cross. One of the angles formed measures #°. What is the measure of the angle directly opposite it (its vertical angle)?', 'Dos rectas se cruzan. Uno de los ángulos que se forman mide $1°. ¿Cuánto mide el ángulo directamente opuesto (su ángulo opuesto por el vértice)?'],
    ['Two angles are complementary. One measures #°. What is the other?', 'Dos ángulos son complementarios. Uno mide $1°. ¿Cuánto mide el otro?'],
    ['Two angles are supplementary. One measures #°. What is the other?', 'Dos ángulos son suplementarios. Uno mide $1°. ¿Cuánto mide el otro?'],
  ]);
  add('math7.scale-drawings', [
    ['A map uses a scale of # cm : # km. Two towns are # cm apart on the map. How far apart are they in real life?', 'Un mapa usa una escala de $1 cm : $2 km. Dos pueblos están a $3 cm de distancia en el mapa. ¿A qué distancia están en la realidad?'],
    ['A floor plan uses a scale of # cm : # m. A room is # m long. How long is it on the plan?', 'Un plano usa una escala de $1 cm : $2 m. Una habitación mide $3 m de largo. ¿Cuánto mide en el plano?'],
    ['A triangle with sides # cm and # cm is enlarged so that the # cm side becomes # cm. How long does the # cm side become?', 'Un triángulo con lados de $1 cm y $2 cm se amplía de modo que el lado de $3 cm pasa a medir $4 cm. ¿Cuánto pasa a medir el lado de $5 cm?'],
  ]);
  add('math7.mean-median', [['Find the <b>median</b> of this data set.@', 'Halla la <b>mediana</b> de este conjunto de datos.$1'], ['Find the <b>mean</b> of this data set.@', 'Halla la <b>media</b> de este conjunto de datos.$1'], ['Find the <b>mode</b> of this data set.@', 'Halla la <b>moda</b> de este conjunto de datos.$1'], ['Find the <b>range</b> of this data set.@', 'Halla el <b>rango</b> de este conjunto de datos.$1']]);
  add('math7.compound-probability', [
    ['You roll two six-sided dice. What is the probability that the numbers add to #? Give your answer as a fraction.', 'Lanzas dos dados de seis caras. ¿Cuál es la probabilidad de que los números sumen $1? Da tu respuesta como fracción.'],
    ['A bag has # red and # blue marbles. You pick one, put it back, and pick again. What is the probability of a red then a blue? Give your answer as a fraction.', 'Una bolsa tiene $1 canicas rojas y $2 azules. Sacas una, la vuelves a meter y sacas otra. ¿Cuál es la probabilidad de sacar una roja y luego una azul? Da tu respuesta como fracción.'],
    ['A spinner has # equal sections and # of them are red. You spin it twice. What is the probability of red both times? Give your answer as a fraction.', 'Una ruleta tiene $1 secciones iguales y $2 de ellas son rojas. La giras dos veces. ¿Cuál es la probabilidad de que salga rojo las dos veces? Da tu respuesta como fracción.'],
    ['A spinner has # equal sections and # of them is red. You spin it twice. What is the probability of red both times? Give your answer as a fraction.', 'Una ruleta tiene $1 secciones iguales y $2 de ellas es roja. La giras dos veces. ¿Cuál es la probabilidad de que salga rojo las dos veces? Da tu respuesta como fracción.'],
    ['You flip # fair coins. What is the probability of all heads? Give your answer as a fraction.', 'Lanzas $1 monedas sin trucos. ¿Cuál es la probabilidad de que todas salgan cara? Da tu respuesta como fracción.'],
    ['You flip # fair coins. What is the probability of all tails? Give your answer as a fraction.', 'Lanzas $1 monedas sin trucos. ¿Cuál es la probabilidad de que todas salgan cruz? Da tu respuesta como fracción.'],
    ['You flip # fair coins. What is the probability of exactly one head? Give your answer as a fraction.', 'Lanzas $1 monedas sin trucos. ¿Cuál es la probabilidad de que salga exactamente una cara? Da tu respuesta como fracción.'],
    ['You flip a coin and roll a six-sided die. What is the probability of getting tails and a #? Give your answer as a fraction.', 'Lanzas una moneda y un dado de seis caras. ¿Cuál es la probabilidad de que salga cruz y un $1? Da tu respuesta como fracción.'],
    ['You flip a coin and roll a six-sided die. What is the probability of getting heads and a #? Give your answer as a fraction.', 'Lanzas una moneda y un dado de seis caras. ¿Cuál es la probabilidad de que salga cara y un $1? Da tu respuesta como fracción.'],
    ['You flip a coin and roll a six-sided die. What is the probability of getting * and an * number? Give your answer as a fraction.', m => (/^(heads|tails)$/.test(m[1]) && /^(even|odd)$/.test(m[2]) ? `Lanzas una moneda y un dado de seis caras. ¿Cuál es la probabilidad de que salga ${m[1] === 'heads' ? 'cara' : 'cruz'} y un número ${m[2] === 'even' ? 'par' : 'impar'}? Da tu respuesta como fracción.` : null)],
    ['You flip a coin and roll a six-sided die. What is the probability of getting tails and a number greater than #? Give your answer as a fraction.', 'Lanzas una moneda y un dado de seis caras. ¿Cuál es la probabilidad de que salga cruz y un número mayor que $1? Da tu respuesta como fracción.'],
    ['You flip a coin and roll a six-sided die. What is the probability of getting heads and a number greater than #? Give your answer as a fraction.', 'Lanzas una moneda y un dado de seis caras. ¿Cuál es la probabilidad de que salga cara y un número mayor que $1? Da tu respuesta como fracción.'],
  ]);
  add('math7.repeating-decimals', [
    ['Write this repeating decimal as a fraction in simplest form.@The * # repeats forever. In bar notation the number is *.', m => `Escribe este decimal periódico como fracción en su mínima expresión.${m[1]}${m[2] === 'digit' ? 'El dígito' : m[2] === 'block' ? 'El bloque' : null} ${m[3]} se repite sin fin. Con la barra, el número se escribe ${m[4]}.`],
    ['Write this repeating decimal as a fraction in simplest form (it is greater than #, so the fraction will be too).@The * # repeats forever. In bar notation the number is *.', m => `Escribe este decimal periódico como fracción en su mínima expresión (es mayor que ${m[1]}, así que la fracción también lo será).${m[2]}${m[3] === 'digit' ? 'El dígito' : m[3] === 'block' ? 'El bloque' : null} ${m[4]} se repite sin fin. Con la barra, el número se escribe ${m[5]}.`],
    ['Which of these fractions has a decimal form that <b>repeats</b> forever?', '¿Cuál de estas fracciones tiene una forma decimal que se <b>repite</b> sin fin?'],
    ['Which of these fractions has a decimal form that <b>terminates</b> (stops)?', '¿Cuál de estas fracciones tiene una forma decimal <b>finita</b> (que termina)?'],
  ]);
  add('math7.fraction-busters', [['You want to clear every fraction from this equation by multiplying both sides by one whole number. What is the <b>smallest</b> number that works?@', 'Quieres eliminar todas las fracciones de esta ecuación multiplicando ambos lados por un mismo número entero. ¿Cuál es el número <b>más pequeño</b> que sirve?$1']]);
  add('math7.population-estimate', [
    ['A factory checks a random sample of # light bulbs from a batch of # and finds # that do not work. About how many bulbs in the whole batch do not work?', 'Una fábrica revisa una muestra aleatoria de $1 focos de un lote de $2 y encuentra $3 que no funcionan. ¿Aproximadamente cuántos focos de todo el lote no funcionan?'],
    ['In a random sample of # of the # students at a school, # said they bike to school. Estimate how many of the # students bike to school.', 'En una muestra aleatoria de $1 de los $2 estudiantes de una escuela, $3 dijeron que van en bicicleta a la escuela. Estima cuántos de los $4 estudiantes van en bicicleta a la escuela.'],
    ['A random sample of # of the # voters in a town finds # in favor of a new park. Estimate how many of the town’s voters favor the park.', 'Una muestra aleatoria de $1 de los $2 votantes de un pueblo encuentra $3 a favor de un parque nuevo. Estima cuántos votantes del pueblo están a favor del parque.'],
    ['~ asks a random sample of # of the # people at a fair, and # of them say they would buy a ticket for the raffle. About how many people at the fair would buy one?', '$1 les pregunta a una muestra aleatoria de $2 de las $3 personas de una feria, y $4 dicen que comprarían un boleto para la rifa. ¿Aproximadamente cuántas personas de la feria comprarían uno?'],
    ['Scientists want to estimate the number of * in a *. They catch #, tag them and release them. A week later they catch #, and # of those have tags. About how many * are there in all?', m => {
      const A = { fish: ['peces', 'lake', 'un lago', 'm'], rabbits: ['conejos', 'park', 'un parque', 'm'], frogs: ['ranas', 'marsh', 'un pantano', 'f'], turtles: ['tortugas', 'pond', 'un estanque', 'f'] }[m[1]];
      if (!A || A[1] !== m[2] || m[6] !== m[1]) return null;
      const f = A[3] === 'f';
      return `Unos científicos quieren estimar cuánt${f ? 'as' : 'os'} ${A[0]} hay en ${A[2]}. Atrapan ${m[3]}, ${f ? 'las' : 'los'} marcan y ${f ? 'las' : 'los'} sueltan. Una semana después atrapan ${m[4]}, y ${m[5]} de ${f ? 'ellas' : 'ellos'} tienen marca. ¿Aproximadamente cuánt${f ? 'as' : 'os'} ${A[0]} hay en total?`;
    }],
  ]);

  add('math7.add-sub-rationals', GIVE.concat([
    ['At # a.m. the temperature was #°C. By noon it had * by #°C. What was the temperature at noon?', m => (/^(risen|fallen)$/.test(m[3]) ? `A las ${m[1]} a. m., la temperatura era de ${m[2]} °C. Al mediodía había ${m[3] === 'risen' ? 'subido' : 'bajado'} ${m[4]} °C. ¿Cuál era la temperatura al mediodía?` : null)],
    ['A diver is at an elevation of # m (below the surface). She dives down # m. What is her new elevation?', 'Una buceadora está a una elevación de $1 m (bajo la superficie). Baja $2 m más. ¿Cuál es su nueva elevación?'],
    ['A diver is at an elevation of # m (below the surface). She swims up # m. What is her new elevation?', 'Una buceadora está a una elevación de $1 m (bajo la superficie). Sube nadando $2 m. ¿Cuál es su nueva elevación?'],
  ]));
  add('math7.triangle-inequality', [
    ['Which set of side lengths can form a triangle?', '¿Con qué medidas de lados se puede formar un triángulo?'],
    ['Two sides of a triangle are # cm and # cm long. How many different whole-number lengths, in centimeters, could the third side have?', 'Dos lados de un triángulo miden $1 cm y $2 cm. ¿Cuántas longitudes distintas, en centímetros enteros, podría tener el tercer lado?'],
    ['Two sides of a triangle are # cm and # cm long. Which inequality describes every possible length <i>x</i> of the third side, in centimeters?', 'Dos lados de un triángulo miden $1 cm y $2 cm. ¿Qué desigualdad describe todas las longitudes posibles <i>x</i> del tercer lado, en centímetros?'],
    ['Two sides of a triangle are # cm and # cm long. What is the <b>shortest</b> whole number of centimeters the third side could be?', 'Dos lados de un triángulo miden $1 cm y $2 cm. ¿Cuál es la <b>menor</b> cantidad entera de centímetros que podría medir el tercer lado?'],
    ['Two sides of a triangle are # cm and # cm long. What is the <b>longest</b> whole number of centimeters the third side could be?', 'Dos lados de un triángulo miden $1 cm y $2 cm. ¿Cuál es la <b>mayor</b> cantidad entera de centímetros que podría medir el tercer lado?'],
  ]);
  const mathOnly = s => (/[A-Za-z]{2,}/.test(s.replace(/<[^>]+>/g, '')) ? null : s);
  const yList = s => s.replace(/,? and /, ' y ');
  const SPORT = { 'In soccer, ~ made # of # penalty kicks.': 'En fútbol, $1 anotó $2 de $3 penales.', 'In hockey, ~ made # of # shots on goal.': 'En hockey, $1 anotó $2 de $3 tiros a gol.', 'In basketball, ~ made # of # free throws.': 'En básquetbol, $1 encestó $2 de $3 tiros libres.', 'In volleyball, ~ made # of # serves in.': 'En voleibol, $1 metió $2 de $3 saques dentro de la cancha.' };
  add('math7.sports-stats', [
    ['~ has scored * points in # games. How many points does ~ need in the next game to average # points per game?', m => `${m[1]} ha anotado ${yList(m[2])} puntos en ${m[3]} partidos. ¿Cuántos puntos necesita ${m[4]} en el próximo partido para tener un promedio de ${m[5]} puntos por partido?`],
    ['~ scored * points in # games. What is ~\'s average number of points per game?', m => `${m[1]} anotó ${yList(m[2])} puntos en ${m[3]} partidos. ¿Cuál es el promedio de puntos por partido de ${m[4]}?`],
  ].concat(Object.entries(SPORT).map(([en, es]) => [en + ' What percent is that?', es + ' ¿Qué porcentaje es?'])));
  add('g6.number-line', [
    ['Which temperature is the <b>coldest</b>?', '¿Qué temperatura es la <b>más fría</b>?'], ['Which is true?@', '¿Cuál es verdadera?$1'], ['What number is at point A?@', '¿Qué número está en el punto A?$1'],
    ['Put these numbers in order from <b>least to greatest</b>.@', 'Ordena estos números de <b>menor a mayor</b>.$1'], ['What is the opposite of #?', '¿Cuál es el opuesto de $1?'],
    ['A submarine is at an elevation of # m. How far is that from sea level?', 'Un submarino está a una elevación de $1 m. ¿A qué distancia está del nivel del mar?'],
    ['A diver is # feet from the surface (written as an elevation). How far is that from the surface?', 'Una buceadora está a $1 pies de la superficie (escrito como elevación). ¿A qué distancia está de la superficie?'],
    ['~’s bank balance is #. How far is that from #?', 'El saldo bancario de $1 es $2. ¿A qué distancia está de $3?'],
  ]);

  /* 8th grade */
  add('math8.exponent-properties', [['Write as a single power of #.@', 'Escríbelo como una sola potencia de $1.$2'], ['Write as a single power of <i>*</i>.@', 'Escríbelo como una sola potencia de <i>$1</i>.$2']]);
  add('math8.negative-exponents', GIVE.concat([['Write as a decimal.@', 'Escríbelo como número decimal.$1']]));
  add('math8.scientific-notation', [['Write in scientific notation.@', 'Escríbelo en notación científica.$1'], ['Multiply. Give the answer in scientific notation.@', 'Multiplica. Da la respuesta en notación científica.$1'], ['Write in standard form (as an ordinary number).@', 'Escríbelo en forma estándar (como un número común).$1']]);
  add('math8.slope-intercept-form', [['Which equation describes the line that passes through (#, #) and (#, #)?', '¿Qué ecuación describe la recta que pasa por ($1, $2) y ($3, $4)?'], ['Which equation describes the line that has slope # and passes through (#, #)?', '¿Qué ecuación describe la recta que tiene pendiente $1 y pasa por ($2, $3)?'], ['Which equation describes the line that has slope @ and passes through (#, #)?', '¿Qué ecuación describe la recta que tiene pendiente $1 y pasa por ($2, $3)?']]);
  add('math8.solve-systems', [['Solve the system of equations.@', 'Resuelve el sistema de ecuaciones.$1'], ['Solve the system. What is the value of <i>x</i>?@', 'Resuelve el sistema. ¿Cuál es el valor de <i>x</i>?$1']]);
  add('math8.point-on-line', [['Which point lies on the line *?', m => (mathOnly(m[1]) ? `¿Qué punto está sobre la recta ${m[1]}?` : null)], ['The point * lies on the line *. What is the value of <i>k</i>?', m => (mathOnly(m[1] + m[2]) ? `El punto ${m[1]} está sobre la recta ${m[2]}. ¿Cuál es el valor de <i>k</i>?` : null)]]);
  const SOLID = { cone: 'un cono', sphere: 'una esfera', cylinder: 'un cilindro' };
  const solid = w => { if (!SOLID[w]) throw new Error('solid'); return SOLID[w]; };
  add('math8.volume', [
    ['What is the volume of a * with * # cm and height # cm? Use # for π and round to two decimal places.', m => `¿Cuál es el volumen de ${solid(m[1])} con ${m[2] === 'radius' ? 'radio' : m[2] === 'diameter' ? 'diámetro' : null} de ${m[3]} cm y altura de ${m[4]} cm? Usa ${m[5]} para π y redondea a dos decimales.`],
    ['What is the volume of a * with * # cm? Use # for π and round to two decimal places.', m => `¿Cuál es el volumen de ${solid(m[1])} con ${m[2] === 'radius' ? 'radio' : m[2] === 'diameter' ? 'diámetro' : null} de ${m[3]} cm? Usa ${m[4]} para π y redondea a dos decimales.`],
  ]);
  add('math8.triangle-angles', [
    ['Two angles of a triangle measure #° and #°. What is the third angle?', 'Dos ángulos de un triángulo miden $1° y $2°. ¿Cuánto mide el tercer ángulo?'],
    ['The angles of a triangle are #°, <i>x</i>°, and (#<i>x</i> + #)°. What is the value of <i>x</i>?', 'Los ángulos de un triángulo miden $1°, <i>x</i>° y ($2<i>x</i> + $3)°. ¿Cuál es el valor de <i>x</i>?'],
    ['The angles of a triangle are #°, <i>x</i>°, and (#<i>x</i> − #)°. What is the value of <i>x</i>?', 'Los ángulos de un triángulo miden $1°, <i>x</i>° y ($2<i>x</i> − $3)°. ¿Cuál es el valor de <i>x</i>?'],
    ['In a triangle, two interior angles measure #° and #°. What is the exterior angle at the third vertex?', 'En un triángulo, dos ángulos interiores miden $1° y $2°. ¿Cuánto mide el ángulo exterior en el tercer vértice?'],
    ['An exterior angle of a triangle measures #°. One of the two remote interior angles measures #°. What is the other remote interior angle?', 'Un ángulo exterior de un triángulo mide $1°. Uno de los dos ángulos interiores no adyacentes mide $2°. ¿Cuánto mide el otro ángulo interior no adyacente?'],
  ]);
  add('math8.transformations', [
    ['The point (#, #) is rotated #° clockwise about the origin. What are the coordinates of its image?', 'El punto ($1, $2) se gira $3° en el sentido de las manecillas del reloj alrededor del origen. ¿Cuáles son las coordenadas de su imagen?'],
    ['The point (#, #) is rotated #° counterclockwise about the origin. What are the coordinates of its image?', 'El punto ($1, $2) se gira $3° en sentido contrario a las manecillas del reloj alrededor del origen. ¿Cuáles son las coordenadas de su imagen?'],
    ['The point (#, #) is rotated #° about the origin. What are the coordinates of its image?', 'El punto ($1, $2) se gira $3° alrededor del origen. ¿Cuáles son las coordenadas de su imagen?'],
    ['The point (#, #) is reflected over the <i>x</i>-axis. What are the coordinates of its image?', 'El punto ($1, $2) se refleja sobre el eje <i>x</i>. ¿Cuáles son las coordenadas de su imagen?'],
    ['The point (#, #) is reflected over the <i>y</i>-axis. What are the coordinates of its image?', 'El punto ($1, $2) se refleja sobre el eje <i>y</i>. ¿Cuáles son las coordenadas de su imagen?'],
    ['The point (#, #) is translated # * * and # * *. What are the coordinates of its image?', m => {
      const u = k => (m[k] === '1' ? 'unidad' : 'unidades'), dir = { left: 'a la izquierda', right: 'a la derecha', up: 'hacia arriba', down: 'hacia abajo' };
      if (!/^units?$/.test(m[4]) || !/^units?$/.test(m[7]) || !dir[m[5]] || !dir[m[8]]) return null;
      return `El punto (${m[1]}, ${m[2]}) se traslada ${m[3]} ${u(3)} ${dir[m[5]]} y ${m[6]} ${u(6)} ${dir[m[8]]}. ¿Cuáles son las coordenadas de su imagen?`;
    }],
  ]);

  /* ---------- translating, and the hook ---------- */
  const compiled = {};
  function rulesFor(id) {
    if (!R[id]) return null;
    if (!compiled[id]) compiled[id] = R[id].concat(COMMON).map(([t, out]) => [compile(t), out]);
    return compiled[id];
  }
  /** the Spanish for a question's prompt, or null */
  function translate(q) {
    const rules = q && rulesFor(q.skillId);
    if (!rules) return null;
    const { s, kept } = protect(q.prompt);
    for (const [re, out] of rules) {
      const m = s.match(re);
      if (!m) continue;
      try {
        const es = typeof out === 'function' ? out(m) : out.replace(/\$(\d+)/g, (x, k) => m[Number(k)]);
        if (es == null) return null;
        return restore(es, kept.map(drawing));
      } catch (e) { return null; }
    }
    return null;
  }
  const on = () => { const p = window.STORE && STORE.get().profile.player; return !!(p && p.es); };
  const covers = id => !!R[id];
  let n = 0;
  const shown = new Map();                       // id → { es, en }: the last few, for Show in English
  /** what the player draws: the Spanish (with the English a tap away) when the learner chose it and it's written, else the prompt */
  function prompt(q) {
    if (!on()) return q.prompt;
    const es = translate(q);
    if (!es) return q.prompt;
    const id = 'esq' + (++n);
    shown.set(id, { es, en: q.prompt });
    if (shown.size > 20) shown.delete(shown.keys().next().value);
    return `<div class="es-q" lang="es" id="${id}">${es}</div><button type="button" class="btn ghost sm es-switch" data-es="${id}" aria-pressed="false" aria-label="Show this question in English">Show in English</button>`;
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('click', ev => {
      const b = ev.target.closest && ev.target.closest('.es-switch');
      if (!b) return;
      const box = document.getElementById(b.dataset.es), t = shown.get(b.dataset.es);
      if (!box || !t) return;
      const english = b.getAttribute('aria-pressed') !== 'true';
      box.innerHTML = english ? t.en : t.es;
      box.setAttribute('lang', english ? 'en' : 'es');
      b.setAttribute('aria-pressed', String(english));
      b.textContent = english ? 'Ver en español' : 'Show in English';
      b.setAttribute('aria-label', english ? 'Ver esta pregunta en español' : 'Show this question in English');
    });
    // Enter on the switch changes the language; it doesn't also check the answer
    document.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.closest && ev.target.closest('.es-switch')) ev.stopPropagation(); }, true);
  }
  window.ESQ = { prompt, translate, on, covers, protect, get SKILLS() { return Object.keys(R); } };
})();
