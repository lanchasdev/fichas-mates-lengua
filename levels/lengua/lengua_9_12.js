// Lengua, niveles 9 a 12: Vocabulario, El verbo, La oración, Comprensión lectora.
(function (g) {
  const L = g.LENGUA_LIB;
  const P = (rng, a) => a[Math.floor(rng.next() * a.length)];
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const low1 = (s) => s.charAt(0).toLowerCase() + s.slice(1);
  const imgOk = (k) => !!(k && g.LENGUA_IMGS && g.LENGUA_IMGS[k]);
  const lastWord = (s) => s.split(' ').pop();

  function choice(rng, tokens, correct, wrong, img) {
    const ex = { kind: 'choice', tokens, options: rng.shuffle([correct].concat(wrong)), answer: correct };
    if (img) ex.img = img;
    return ex;
  }
  function mkMatch(rng, lefts, rights) {
    let ord, tries = 0;
    do { ord = rng.shuffle(lefts.map((_, i) => i)); tries++; } while (tries < 10 && ord.every((v, i) => v === i));
    return { kind: 'match', left: lefts, right: ord.map((i) => rights[i]), answer: lefts.map((_, i) => String(ord.indexOf(i))) };
  }
  function wordImg(w) {
    const e = L.words((x) => x.w === w && imgOk(x.img))[0];
    return e ? e.img : null;
  }

  // ===================== NIVEL 9: VOCABULARIO =====================
  const FAMILIES = [
    { r: 'mar', w: ['mar', 'marino', 'marinero', 'marítimo', 'submarino'] },
    { r: 'pan', w: ['pan', 'panadero', 'panadería', 'panecillo', 'empanada'] },
    { r: 'flor', w: ['flor', 'florero', 'florecer', 'floristería', 'florista'] },
    { r: 'libr', w: ['libro', 'librería', 'librero', 'libreta'] },
    { r: 'pesc', w: ['pescar', 'pescador', 'pescado', 'pescadería'] },
    { r: 'dent', w: ['dentista', 'dental', 'dentadura', 'dentífrico'] },
    { r: 'zapat', w: ['zapato', 'zapatero', 'zapatería', 'zapatilla'] },
    { r: 'lech', w: ['leche', 'lechero', 'lechería', 'lechera'] },
    { r: 'frut', w: ['fruta', 'frutero', 'frutería', 'frutal'] },
    { r: 'jard', w: ['jardín', 'jardinero', 'jardinería', 'jardinera'] },
    { r: 'cant', w: ['cantar', 'cantante', 'cantor', 'canturrear'] },
    { r: 'cas', w: ['casa', 'casita', 'casero', 'caserío', 'casona'] },
    { r: 'agu', w: ['agua', 'aguador', 'aguacero', 'aguado'] },
    { r: 'sol', w: ['sol', 'solar', 'soleado', 'parasol'] },
    { r: 'pel', w: ['pelo', 'peludo', 'peluquero', 'peluquería', 'pelirrojo'] },
  ];
  const SYN = [
    ['bonito', 'hermoso'], ['rápido', 'veloz'], ['feliz', 'contento'], ['pequeño', 'diminuto'], ['grande', 'enorme'],
    ['casa', 'hogar'], ['coche', 'automóvil'], ['miedo', 'temor'], ['cansado', 'agotado'], ['listo', 'inteligente'],
    ['enfadado', 'furioso'], ['empezar', 'comenzar'], ['terminar', 'acabar'], ['hablar', 'conversar'], ['mirar', 'observar'],
    ['andar', 'caminar'], ['regalo', 'obsequio'], ['cerca', 'próximo'], ['fácil', 'sencillo'], ['difícil', 'complicado'],
    ['tranquilo', 'sereno'],
  ];
  const DIM = [
    ['gato', 'gatito'], ['perro', 'perrito'], ['casa', 'casita'], ['libro', 'librito'], ['mesa', 'mesita'], ['pelota', 'pelotita'],
    ['pájaro', 'pajarito'], ['mano', 'manita'], ['ojo', 'ojito'], ['cuchara', 'cucharita'], ['silla', 'sillita'], ['coche', 'cochecito'],
    ['árbol', 'arbolito'], ['bolsa', 'bolsita'], ['cama', 'camita'], ['vaso', 'vasito'], ['plato', 'platito'], ['ventana', 'ventanilla'],
    ['campana', 'campanilla'], ['flor', 'florecilla'], ['pan', 'panecillo'], ['ratón', 'ratoncillo'],
  ];
  const AUM = [
    ['casa', 'casona'], ['perro', 'perrazo'], ['gato', 'gatazo'], ['mano', 'manaza'], ['boca', 'bocaza'], ['cuchara', 'cucharón'],
    ['silla', 'sillón'], ['botella', 'botellón'], ['hombre', 'hombrón'], ['mujer', 'mujerona'], ['golpe', 'golpazo'], ['ojo', 'ojazo'],
  ];
  const ANT_GROUP = (a) => {
    if (['grande', 'pequeño', 'alto', 'bajo', 'largo', 'corto', 'ancho', 'estrecho', 'gordo', 'delgado'].includes(a.w)) return 'tamano';
    if (['fuerte', 'débil', 'duro', 'blando', 'pesado', 'ligero'].includes(a.w)) return 'fuerza';
    return [a.w, a.ant].sort().join('|');
  };
  const antPool = () => L.byCat('adjetivos').filter((a) => a.ant && imgOk(a.img) && !['contento', 'enfadado'].includes(a.w));
  const FIELD_CATS = ['animales', 'frutas', 'ropa', 'cuerpo', 'transporte', 'profesiones', 'naturaleza', 'casa'];
  // sustantivos del banco que coinciden con formas verbales (la llama / él llama): no usarlos en frases con verbo
  const HOMOGRAFO = ['llama', 'cría', 'pinta', 'pica', 'canta', 'cuenta', 'muda', 'salta', 'toca', 'corta', 'baña', 'duerme', 'sube', 'come', 'lava', 'riega', 'peina', 'pesca', 'rema', 'nada', 'trepa', 'pega', 'sella', 'ronca', 'busca', 'cubre', 'mira', 'pisa', 'cierra', 'abre', 'vuela', 'ladra', 'brinca'];
  const FIELD_BAD = ['tos', 'sed', 'cuerpo', 'mes', 'camino', 'vid', 'fruta', 'verdura', 'bar'];

  function genFam(rng) {
    const f = P(rng, FAMILIES);
    const cue = P(rng, f.w);
    const ok = P(rng, f.w.filter((x) => x !== cue));
    const wrong = rng.shuffle(FAMILIES.filter((x) => x !== f)).slice(0, 3).map((x) => P(rng, x.w));
    return choice(rng, ['Familia de «' + cue + '»:', '__'], ok, wrong);
  }
  function genSyn(rng) {
    const pairs = rng.shuffle(SYN).slice(0, 4).map((p) => (rng.chance(0.5) ? p : [p[1], p[0]]));
    return mkMatch(rng, pairs.map((p) => ({ t: p[0] })), pairs.map((p) => ({ t: p[1] })));
  }
  function genAnt(rng) {
    const all = antPool();
    let sel = [];
    for (let tries = 0; tries < 50 && sel.length < 4; tries++) {
      sel = [];
      const used = new Set();
      const ants = new Set();
      for (const a of rng.shuffle(all)) {
        const k = ANT_GROUP(a);
        if (used.has(k) || ants.has(a.ant)) continue;
        used.add(k); ants.add(a.ant); sel.push(a);
        if (sel.length === 4) break;
      }
    }
    return mkMatch(rng, sel.map((a) => ({ img: a.img })), sel.map((a) => ({ t: a.ant })));
  }
  function derived(kind, rng) {
    const list = kind === 'dim' ? DIM : AUM;
    const [b, d] = P(rng, list);
    const others = DIM.concat(AUM).filter((x) => x[0] !== b);
    const picked = [];
    for (const x of rng.shuffle(others)) {
      if (!picked.find((y) => y[1] === x[1]) && x[1] !== d) picked.push(x);
      if (picked.length === 3) break;
    }
    const label = (kind === 'dim' ? 'Diminutivo' : 'Aumentativo') + ' de «' + b + '»:';
    return choice(rng, [label, '__'], d, picked.map((x) => x[1]), wordImg(b));
  }
  const genDim = (rng) => derived('dim', rng);
  const genAum = (rng) => derived('aum', rng);
  function genField(rng) {
    for (let t = 0; t < 30; t++) {
      const [a, b] = rng.shuffle(FIELD_CATS).slice(0, 2);
      const ok = (w) => w.w.indexOf(' ') < 0 && !FIELD_BAD.includes(w.w);
      const A = L.byCat(a).filter(ok), B = L.byCat(b).filter(ok);
      const inter = rng.shuffle(A).slice(0, 3);
      const out = P(rng, B.filter((x) => !A.find((y) => y.w === x.w)));
      if (inter.length === 3 && out) return choice(rng, ['Intruso:', '__'], out.w, inter.map((x) => x.w));
    }
    throw new Error('campo semantico');
  }
  function genSynChoice(rng) {
    const [a, b] = P(rng, SYN);
    const [cue, ok] = rng.chance(0.5) ? [a, b] : [b, a];
    const wrong = rng.shuffle(SYN.filter((p) => p[0] !== a)).slice(0, 3).map((p) => P(rng, p));
    return choice(rng, ['Sinónimo de «' + cue + '»:', '__'], ok, wrong);
  }
  function genAntChoice(rng) {
    const all = antPool();
    const a = P(rng, all);
    const wrong = [];
    for (const x of rng.shuffle(all)) {
      if (ANT_GROUP(x) === ANT_GROUP(a) || x.w === a.ant || x.ant === a.ant || wrong.includes(x.ant)) continue;
      wrong.push(x.ant);
      if (wrong.length === 3) break;
    }
    return choice(rng, ['Antónimo de «' + a.w + '»:', '__'], a.ant, wrong, a.img);
  }
  const genRepaso9 = (rng) => P(rng, [genFam, genSynChoice, genAntChoice, genDim, genAum, genField])(rng);

  // ===================== VERBOS (niveles 10 y 11) =====================
  const VERBS_RAW = [
    'cantar|una canción;en el coro;muy bien', 'saltar|la cuerda;muy alto;en la cama', 'bailar|con su amiga;en la fiesta;un vals',
    'mirar|la tele;el mar;por la ventana', 'pintar|un cuadro;la pared;un paisaje', 'nadar|en la piscina;en el mar;muy rápido',
    'lavar|los platos;la ropa;el coche', 'comprar|pan;fruta;un libro', 'ayudar|a su madre;en casa;a sus amigos',
    'estudiar|la lección;en la biblioteca;mucho', 'caminar|por el parque;por la calle;despacio', 'dibujar|una casa;un árbol;un gato',
    'cocinar|la cena;arroz;una tortilla', 'limpiar|la mesa;el suelo;los cristales', 'escuchar|música;un cuento;la radio',
    'cortar|el papel;el pan;la tarta', 'trabajar|en la tienda;en el huerto;mucho', 'llevar|la mochila;un paraguas;el abrigo',
    'esperar|el autobús;a su amigo;en la puerta', 'trepar|al árbol;por la pared;a la valla', 'pasear|por el parque;por la playa;con su perro',
    'montar|en bicicleta;a caballo;en el tren', 'planchar|la camisa;la ropa;un pañuelo', 'ordenar|la habitación;los libros;los juguetes',
    'saludar|a la vecina;a su amigo;a la maestra', 'llorar|mucho;poco;en silencio', 'gritar|muy fuerte;en el patio;mucho',
    'mojar|la toalla;el suelo;las flores', 'llenar|el vaso;la jarra;la botella', 'soplar|las velas;el globo;muy fuerte',
    'mezclar|la harina;los colores;la masa', 'empujar|la puerta;el carro;la silla', 'llamar|a su amigo;por teléfono;a la puerta',
    'bajar|la escalera;del autobús;al sótano', 'peinar|a su hermana;a su muñeca;el pelo', 'besar|a su madre;a su abuelo;a su hermano',
    'comer|pan;una manzana;en el patio', 'beber|agua;leche;zumo', 'correr|por el parque;muy rápido;en la playa',
    'aprender|inglés;la lección;mucho', 'vender|flores;fruta;pan', 'barrer|el suelo;la terraza;el portal',
    'responder|a la pregunta;con calma;en voz alta', 'romper|el vaso;un plato;la hoja', 'coser|un botón;la falda;una bufanda',
    'comprender|la lección;el juego;el cuento', 'temer|a la tormenta;a los truenos;a la oscuridad',
    'vivir|en una casa;en el pueblo;en la ciudad', 'escribir|una carta;un cuento;en la pizarra', 'subir|la escalera;al autobús;al monte',
    'abrir|la puerta;la ventana;el libro', 'partir|la tarta;el pan;una naranja', 'decidir|un plan;con calma;rápido',
    'recibir|una carta;un regalo;a los invitados', 'repartir|los libros;caramelos;las cartas', 'descubrir|un tesoro;una cueva;un secreto',
    'unir|las piezas;dos cuerdas;los puntos', 'aplaudir|en el teatro;con fuerza;a la actriz',
  ];
  const ANIMAL_OK = ['nadar', 'correr', 'saltar', 'beber', 'comer', 'mirar', 'caminar', 'trepar'];
  const VERBS = VERBS_RAW.map((s) => {
    const [inf, c] = s.split('|');
    return { inf, conj: inf.slice(-2), c: c.split(';'), animal: ANIMAL_OK.includes(inf) };
  });
  const VMAP = {};
  VERBS.forEach((v) => { VMAP[v.inf] = v; });
  const END = {
    pres: { ar: ['o', 'as', 'a', 'amos', 'an'], er: ['o', 'es', 'e', 'emos', 'en'], ir: ['o', 'es', 'e', 'imos', 'en'] },
    pret: { ar: ['é', 'aste', 'ó', 'amos', 'aron'], er: ['í', 'iste', 'ió', 'imos', 'ieron'], ir: ['í', 'iste', 'ió', 'imos', 'ieron'] },
    fut: ['é', 'ás', 'á', 'emos', 'án'],
  };
  function conj(v, t, p) {
    if (t === 'fut') return v.inf + END.fut[p];
    return v.inf.slice(0, -2) + END[t][v.conj][p];
  }
  const NAMES = ['Lucía', 'Pablo', 'Marta', 'Hugo', 'Sara', 'Daniel', 'Elena', 'Álvaro'];
  const ART_S = ['El abuelo', 'La niña', 'El niño', 'La maestra', 'Mi madre', 'Mi hermano', 'El profesor', 'La vecina'];
  const ART_P = ['Los niños', 'Las niñas', 'Mis primos', 'Los vecinos', 'Los abuelos', 'Las maestras', 'Mis amigas'];
  const subjMid = (s) => (s.name ? s.t : low1(s.t));
  const subjHead = (s) => lastWord(s.t);
  // sujeto de tercera persona (p=2 singular, p=4 plural) para la frase
  function subj3(rng, p, animal) {
    if (animal && rng.chance(0.35)) {
      const an = L.byCat('animales').filter((w) => !HOMOGRAFO.includes(w.w) && w.w.indexOf(' ') < 0 && w.pl && w.pl.indexOf(' ') < 0 && w.g);
      const a = P(rng, an);
      if (p === 2) return { t: cap(L.art(a)) + ' ' + a.w };
      return { t: (a.g === 'f' ? 'Las' : 'Los') + ' ' + a.pl };
    }
    if (p === 2) return rng.chance(0.4) ? { t: P(rng, NAMES), name: true } : { t: P(rng, ART_S) };
    return { t: P(rng, ART_P) };
  }
  function subjAny(rng, p) {
    if (p === 0) return { t: 'Yo' };
    if (p === 1) return { t: 'Tú' };
    if (p === 3) return { t: P(rng, ['Nosotros', 'Nosotras']) };
    if (p === 2) return P(rng, [{ t: 'Él' }, { t: 'Ella' }, { t: P(rng, NAMES), name: true }, { t: P(rng, ART_S) }]);
    return P(rng, [{ t: 'Ellos' }, { t: 'Ellas' }, { t: P(rng, ART_P) }]);
  }
  const PAST_M = ['Ayer', 'Anoche', 'El año pasado', 'Hace un rato', 'El lunes pasado'];
  const PRES_M = ['Ahora', 'Hoy', 'Ahora mismo', 'Cada día'];
  const FUT_M = ['Mañana', 'Esta noche', 'El próximo lunes', 'Pronto', 'El año que viene'];
  const MARK = { pret: PAST_M, pres: PRES_M, fut: FUT_M };
  const TENSE_NAME = { pret: 'pasado', pres: 'presente', fut: 'futuro' };
  const quote = (s) => '«' + s + '»';
  const sentText = (words) => words.join(' ') + '.';

  function bankVerbs() {
    return L.byCat('verbos').filter((b) => VMAP[b.w] && VMAP[b.w].conj === b.conj && imgOk(b.img) && !['andar', 'jugar', 'pegar', 'tocar', 'cruzar', 'regar', 'abrazar'].includes(b.w));
  }

  // ---- 10.1 reconocer el verbo
  function genVerboRec(rng) {
    for (let t = 0; t < 40; t++) {
      const v = P(rng, VERBS);
      const p = rng.chance(0.65) ? 2 : 4;
      const s = subj3(rng, p, v.animal);
      const form = conj(v, 'pres', p);
      const comp = P(rng, v.c);
      const text = sentText(s.t.split(' ').concat([form], comp.split(' ')));
      const opts = [form, subjHead(s), lastWord(comp)];
      if (rng.chance(0.5)) {
        const ex = [s.t.split(' ')[0], comp.split(' ')[0]].map((x) => x.toLowerCase()).filter((x) => x !== subjHead(s).toLowerCase() && x !== lastWord(comp).toLowerCase());
        if (ex.length) opts.push(P(rng, ex));
      }
      const set = new Set(opts.map((o) => o.toLowerCase()));
      if (set.size !== opts.length) continue;
      return { kind: 'choice', tokens: ['Verbo en:', quote(text)], options: rng.shuffle(opts), answer: form };
    }
    throw new Error('verbo rec');
  }
  // ---- 10.2 tiempo de la frase
  function genTiempo(rng) {
    for (let t = 0; t < 40; t++) {
      const tense = P(rng, ['pret', 'pres', 'fut']);
      const v = P(rng, VERBS);
      const p = rng.chance(0.65) ? 2 : 4;
      const s = subj3(rng, p, v.animal);
      const form = conj(v, tense, p);
      const comp = P(rng, v.c);
      const mark = rng.chance(0.7) ? P(rng, MARK[tense]) : null;
      const body = (mark ? mark + ', ' + subjMid(s) : s.t) + ' ' + form + ' ' + comp + '.';
      if (body.length > 52) continue;
      return { kind: 'choice', tokens: ['Tiempo de:', quote(body)], options: ['pasado', 'presente', 'futuro'], answer: TENSE_NAME[tense] };
    }
    throw new Error('tiempo');
  }
  // ---- 10.3 a 10.5 conjugar con imagen
  function genConjPic(tense) {
    return (rng) => {
      const bv = P(rng, bankVerbs());
      const v = VMAP[bv.w];
      const p = P(rng, [0, 1, 2, 3, 4]);
      const s = subjAny(rng, p);
      const mark = tense === 'pres' ? null : (tense === 'pret' ? 'Ayer' : 'Mañana');
      const tokens = [];
      if (mark) tokens.push(mark);
      tokens.push(mark ? subjMid(s) : s.t, { box: 46 }, '(' + v.inf + ')');
      return { kind: 'pic', img: bv.img, tokens, answer: conj(v, tense, p) };
    };
  }
  // ---- concordancia sujeto-verbo
  function genConcord(rng) {
    for (let t = 0; t < 60; t++) {
      const tense = P(rng, ['pres', 'pres', 'pret', 'fut']);
      const v = P(rng, VERBS);
      const p = P(rng, [0, 1, 2, 3, 4, 2, 4]);
      const comp = P(rng, v.c);
      if (p !== 2 && p !== 4 && /\bsus?\b/.test(comp)) continue;
      const s = p === 2 || p === 4 ? subj3(rng, p, v.animal) : subjAny(rng, p);
      const mark = tense === 'pres' ? null : (tense === 'pret' ? 'Ayer' : 'Mañana');
      const tokens = [];
      if (mark) tokens.push(mark + ',');
      tokens.push(mark ? subjMid(s) : s.t, '__', comp + '.');
      const ok = conj(v, tense, p);
      const wrong = rng.shuffle([0, 1, 2, 3, 4].filter((q) => q !== p)).map((q) => conj(v, tense, q)).filter((x) => x !== ok).slice(0, 2);
      return choice(rng, tokens, ok, wrong);
    }
    throw new Error('concord');
  }
  // ---- conjugar con opciones (repaso)
  function genConjChoice(rng) {
    const v = P(rng, VERBS);
    const tense = P(rng, ['pres', 'pret', 'fut']);
    const p = P(rng, [0, 1, 2, 4]);
    const s = subjAny(rng, p);
    const mark = tense === 'pres' ? 'Hoy' : (tense === 'pret' ? 'Ayer' : 'Mañana');
    const ok = conj(v, tense, p);
    const cand = [];
    ['pres', 'pret', 'fut'].filter((x) => x !== tense).forEach((x) => cand.push(conj(v, x, p)));
    cand.push(conj(v, tense, P(rng, [0, 1, 2, 3, 4].filter((q) => q !== p))));
    const wrong = [];
    cand.forEach((x) => { if (x !== ok && !wrong.includes(x)) wrong.push(x); });
    return choice(rng, [mark + ',', subjMid(s), '__', '(' + v.inf + ')'], ok, wrong.slice(0, 3));
  }
  const genRepaso10 = (rng) => P(rng, [genVerboRec, genTiempo, genConcord, genConjChoice, genConjChoice])(rng);

  // ===================== NIVEL 11: LA ORACIÓN =====================
  function mkSent(rng, opt) {
    for (let t = 0; t < 80; t++) {
      const v = P(rng, VERBS);
      const p = rng.chance(0.7) ? 2 : 4;
      const s = subj3(rng, p, v.animal);
      const cs = v.c.filter((c) => (opt.comp === 'one' ? c.indexOf(' ') < 0 : opt.comp === 'multi' ? c.indexOf(' ') > 0 : true));
      if (!cs.length) continue;
      const comp = P(rng, cs);
      const words = s.t.split(' ').concat([conj(v, 'pres', p)], comp.split(' '));
      const lc = words.map((w) => w.toLowerCase());
      if (new Set(lc).size !== lc.length) continue;
      if (opt.min && words.length < opt.min) continue;
      if (opt.max && words.length > opt.max) continue;
      const text = sentText(words);
      if (opt.maxLen && text.length > opt.maxLen) continue;
      return { v, p, s, comp, form: words[s.t.split(' ').length], words, text, pred: words.slice(s.t.split(' ').length).join(' ') };
    }
    throw new Error('sent');
  }
  function genOrder(opt) {
    return (rng) => {
      const S = mkSent(rng, opt);
      const w = S.words.slice();
      w[w.length - 1] += '.';
      let sc, tries = 0;
      do { sc = rng.shuffle(w); tries++; } while (tries < 20 && sc.every((x, i) => x === w[i]));
      return { kind: 'tokens', tokens: sc.concat([':', { box: Math.min(150, Math.round(S.text.length * 3.3 + 10)) }]), answer: S.text };
    };
  }
  function genSujPred(rng) {
    for (let t = 0; t < 40; t++) {
      const S = mkSent(rng, { maxLen: 34 });
      if (S.pred.length > 22) continue;
      const askSubj = rng.chance(0.5);
      const comp = S.comp;
      const sub = S.s.t;
      let ok, wrong;
      if (askSubj) { ok = sub; wrong = [S.pred, S.form, comp]; }
      else { ok = S.pred; wrong = [sub, sub + ' ' + S.form, comp]; }
      if (new Set(wrong.concat([ok]).map((x) => x.toLowerCase())).size !== 4) continue;
      if (wrong.concat([ok]).some((x) => x.length > 22)) continue;
      return choice(rng, [askSubj ? 'Sujeto de:' : 'Predicado de:', quote(S.text)], ok, wrong);
    }
    throw new Error('sujpred');
  }
  const ADJ = [['alto', 'alta'], ['bonito', 'bonita'], ['rápido', 'rápida'], ['grande', 'grande'], ['pequeño', 'pequeña'], ['bueno', 'buena'], ['listo', 'lista'], ['simpático', 'simpática']];
  const EXCL = ['¡Qué susto!', '¡Feliz cumpleaños!', '¡Cuidado!', '¡Qué alegría!', '¡Qué calor hace!', '¡Viva el recreo!', '¡Socorro!', '¡Qué rico está el pastel!', '¡Cuánto me alegro!', '¡Qué frío hace hoy!', '¡Hola, amigos!'];
  const QUEST = ['¿Cómo te llamas?', '¿Dónde vives?', '¿Qué hora es?', '¿Cuántos años tienes?', '¿Quieres jugar conmigo?', '¿Tienes hermanos?', '¿Te gusta el helado?', '¿Qué estás haciendo?', '¿Quién es tu mejor amigo?', '¿Dónde está mi mochila?', '¿Qué quieres comer?', '¿A qué hora salimos?'];
  const AFIRM = ['Hoy hay clase.', 'Tengo hambre.', 'Mi hermano quiere helado.', 'Hace frío.'];
  const NEG = ['Hoy no hay clase.', 'No tengo hambre.', 'Mi hermano no quiere helado.', 'No hace frío.'];
  function animalNoun(rng) {
    return P(rng, L.byCat('animales').filter((w) => !HOMOGRAFO.includes(w.w) && w.w.indexOf(' ') < 0 && w.g && w.pl && w.pl.indexOf(' ') < 0));
  }
  function mkAfirm(rng) {
    if (rng.chance(0.3)) return P(rng, AFIRM);
    return mkSent(rng, { maxLen: 40 }).text;
  }
  function mkNeg(rng) {
    if (rng.chance(0.3)) return P(rng, NEG);
    const S = mkSent(rng, { maxLen: 40 });
    const n = S.s.t.split(' ').length;
    const w = S.words.slice(); w.splice(n, 0, 'no');
    return sentText(w);
  }
  function mkQuest(rng) {
    const r = rng.next();
    if (r < 0.4) return P(rng, QUEST);
    if (r < 0.6) { const a = animalNoun(rng); return '¿Dónde está ' + L.art(a) + ' ' + a.w + '?'; }
    if (r < 0.75) { const a = P(rng, L.byCat('frutas').filter((w) => w.g && w.pl && w.pl.indexOf(' ') < 0 && w.w !== 'fruta')); return '¿Cuánt' + (a.g === 'f' ? 'as ' : 'os ') + a.pl + ' hay?'; }
    const S = mkSent(rng, { maxLen: 40, comp: 'one' });
    const n = S.s.t.split(' ').length;
    const rest = S.words.slice(n + 1);
    return '¿' + cap(S.form) + ' ' + subjMid(S.s) + ' ' + rest.join(' ') + '?';
  }
  function mkExcl(rng) {
    const r = rng.next();
    if (r < 0.4) return P(rng, EXCL);
    if (r < 0.7) {
      const a = animalNoun(rng), adj = P(rng, ADJ);
      return '¡Qué ' + (a.g === 'f' ? adj[1] : adj[0]) + ' es ' + L.art(a) + ' ' + a.w + '!';
    }
    const S = mkSent(rng, { maxLen: 40, comp: 'one' });
    const n = S.s.t.split(' ').length;
    return '¡Cómo ' + S.form + ' ' + subjMid(S.s) + '!';
  }
  const CLASES = ['afirmativa', 'negativa', 'interrogativa', 'exclamativa'];
  function genClase(rng) {
    const k = rng.int(0, 3);
    const text = [mkAfirm, mkNeg, mkQuest, mkExcl][k](rng);
    return { kind: 'choice', tokens: ['Esta oración es:', quote(text)], options: CLASES.slice(), answer: CLASES[k] };
  }
  const SIGNS_FINAL = ['.', '?', '!'];
  function genSignos(rng) {
    const k = rng.int(0, 3);
    if (k === 0) { const t = mkAfirm(rng); return choice0(rng, [t.slice(0, -1), '__'], '.', SIGNS_FINAL); }
    if (k === 1) { const t = mkQuest(rng); return choice0(rng, [t.slice(0, -1), '__'], '?', SIGNS_FINAL); }
    if (k === 2) { const t = mkExcl(rng); return choice0(rng, [t.slice(0, -1), '__'], '!', SIGNS_FINAL); }
    const q = rng.chance(0.5);
    const t = q ? mkQuest(rng) : mkExcl(rng);
    return choice0(rng, ['__', t.slice(1)], q ? '¿' : '¡', ['¿', '¡', '.']);
  }
  function choice0(rng, tokens, ok, options) {
    return { kind: 'choice', tokens, options: options.slice(), answer: ok };
  }
  const ENUM_FRAMES = {
    frutas: ['En la cesta hay', 'Mi madre compra', 'En el frutero hay'],
    verduras: ['En el huerto crecen', 'Para la sopa necesito'],
    animales: ['En la granja viven', 'En el zoo vimos'],
    ropa: ['En el armario hay', 'En la maleta puse'],
    juguetes: ['En la caja hay', 'Mi hermano tiene'],
  };
  const SECOND = ['Es muy divertido', 'Después descansamos un rato', 'Todos lo pasamos bien', 'A mi hermana le gusta mucho', 'Luego volvemos a casa'];
  function genComa(rng) {
    for (let t = 0; t < 40; t++) {
      const cat = P(rng, Object.keys(ENUM_FRAMES));
      const n = rng.chance(0.5) ? 3 : 4;
      const items = rng.shuffle(L.byCat(cat).filter((w) => w.pl && w.w !== 'fruta' && w.w !== 'verdura' && w.w !== 'bar')).slice(0, n).map((w) => w.pl);
      if (items.length < n || /^h?i/i.test(items[n - 1])) continue;
      const frame = P(rng, ENUM_FRAMES[cat]);
      const pos = rng.int(0, n - 3); // hueco tras el elemento pos (0..n-3), nunca antes de la "y"
      const before = frame + ' ' + items.slice(0, pos + 1).join(', ');
      const after = items.slice(pos + 1, n - 1).concat([]);
      const rest = after.length ? after.join(', ') + ' y ' + items[n - 1] + '.' : '';
      const toks = [before, '__', rest];
      return { kind: 'choice', tokens: toks, options: rng.shuffle([',', '.', '?']), answer: ',' };
    }
    throw new Error('coma');
  }
  function genPunto(rng) {
    const S = mkSent(rng, { maxLen: 34 });
    const s2 = P(rng, SECOND);
    return { kind: 'choice', tokens: [S.text.slice(0, -1), '__', s2 + '.'], options: rng.shuffle([',', '.', '?']), answer: '.' };
  }
  const genPuntoComa = (rng) => (rng.chance(0.55) ? genComa(rng) : genPunto(rng));
  const CITIES = ['Madrid', 'Sevilla', 'Valencia', 'Bilbao', 'Granada', 'Toledo', 'Cádiz', 'Zaragoza', 'Salamanca'];
  const COUNTRIES = ['España', 'Francia', 'Italia', 'Portugal', 'México', 'Argentina', 'Alemania'];
  const DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const mayOpts = (rng, w) => rng.shuffle([w, cap(w) === w ? low1(w) : cap(w)]);
  function genMayus(rng) {
    const k = rng.int(0, 5);
    if (k === 0) { // inicio de frase
      const S = mkSent(rng, { maxLen: 40 });
      const first = S.words[0];
      const rest = S.words.slice(1).join(' ');
      return { kind: 'choice', tokens: ['__', rest + '.'], options: mayOpts(rng, first), answer: first };
    }
    if (k === 1) { // nombre propio de persona
      const n = P(rng, NAMES), c = P(rng, CITIES);
      return { kind: 'choice', tokens: [P(rng, ['Mi amiga', 'Mi amigo', 'Mi primo', 'Mi vecina']), '__', 'vive en ' + c + '.'], options: mayOpts(rng, n), answer: n };
    }
    if (k === 2) { // ciudad o país
      const c = P(rng, CITIES.concat(COUNTRIES));
      const fr = P(rng, [['Voy de viaje a', 'con mi familia.'], ['En', 'hace mucho calor.'], ['Mi abuela nació en', 'hace años.'], ['Quiero conocer', 'algún día.']]);
      return { kind: 'choice', tokens: [fr[0], '__', fr[1]], options: mayOpts(rng, c), answer: c };
    }
    if (k === 3) { // nombre común en medio de la frase: minúscula
      for (let t = 0; t < 30; t++) {
        const S = mkSent(rng, { maxLen: 40 });
        const sw = S.s.t.split(' ');
        if (sw.length < 2 || S.s.name) continue;
        const noun = sw[1];
        const pre = sw[0];
        const post = S.words.slice(2).join(' ') + '.';
        return { kind: 'choice', tokens: [pre, '__', post], options: rng.shuffle([noun, cap(noun)]), answer: noun };
      }
      throw new Error('mayus3');
    }
    if (k === 4) { // días y meses van en minúscula
      const m = rng.chance(0.5);
      const w = m ? P(rng, MONTHS) : P(rng, DAYS);
      const fr = m ? P(rng, [['En', 'nos vamos de vacaciones.'], ['En', 'celebramos una fiesta en el colegio.']]) : P(rng, [['El', 'vamos al parque.'], ['El', 'tenemos clase de música.'], ['Todos los', 'voy a nadar.']]);
      return { kind: 'choice', tokens: [fr[0], '__', fr[1]], options: rng.shuffle([w, cap(w)]), answer: w };
    }
    // después de punto: mayúscula
    const S = mkSent(rng, { maxLen: 34 });
    const sec = P(rng, SECOND);
    const f = sec.split(' ')[0];
    return { kind: 'choice', tokens: [S.text, '__', sec.split(' ').slice(1).join(' ') + '.'], options: rng.shuffle([f, low1(f)]), answer: f };
  }
  const genRepaso11 = (rng) => P(rng, [genSujPred, genClase, genSignos, genPuntoComa, genMayus, genClase, genSignos])(rng);

  // ===================== NIVEL 12: COMPRENSIÓN LECTORA =====================
  function pickWrong(rng, pool, correct, text, n) {
    const t = text.toLowerCase();
    const w = rng.shuffle(Array.from(new Set(pool))).filter((x) => x.toLowerCase() !== correct.toLowerCase() && !t.includes(x.toLowerCase()) && !correct.toLowerCase().includes(x.toLowerCase()) && !x.toLowerCase().includes(correct.toLowerCase()));
    return w.slice(0, n);
  }
  function mcq(rng, q, correct, pool, text) {
    return { q, options: rng.shuffle([correct].concat(pickWrong(rng, pool, correct, text, 2))), answer: correct };
  }
  function pickQs(rng, qs) {
    const n = rng.int(4, 5);
    const keep = rng.shuffle(qs.map((_, i) => i)).slice(0, n).sort((a, b) => a - b);
    return keep.map((i) => qs[i]);
  }

  const ANIMALS = [
    { n: 'el elefante', size: 'muy grande', cover: 'piel', color: 'gris', trait: 'una trompa muy larga', home: 'la sabana', food: 'hierba, hojas y frutas', habit: 'se baña en el río' },
    { n: 'la jirafa', size: 'muy alto', cover: 'piel', color: 'amarillo', trait: 'un cuello larguísimo', home: 'la sabana africana', food: 'hojas de árbol', habit: 'duerme muy poco' },
    { n: 'la tortuga', size: 'pequeño', cover: 'caparazón', color: 'verde', trait: 'cuatro patas cortas', home: 'un estanque', food: 'lechuga y flores', habit: 'camina muy despacio' },
    { n: 'el loro', size: 'pequeño', cover: 'plumaje', color: 'rojo', trait: 'un pico curvo', home: 'la selva', food: 'semillas y frutas', habit: 'repite las palabras' },
    { n: 'el oso', size: 'grande', cover: 'pelo', color: 'marrón', trait: 'unas garras fuertes', home: 'el bosque', food: 'miel, peces y bayas', habit: 'duerme todo el invierno' },
    { n: 'el conejo', size: 'pequeño', cover: 'pelo', color: 'blanco', trait: 'las orejas largas', home: 'una madriguera', food: 'zanahorias y hierba', habit: 'salta por el campo' },
    { n: 'el delfín', size: 'grande', cover: 'piel', color: 'azul', trait: 'una aleta en la espalda', home: 'el mar', food: 'peces pequeños', habit: 'juega con las olas' },
    { n: 'el pingüino', size: 'mediano', cover: 'plumaje', color: 'negro', trait: 'dos alas pequeñas', home: 'el polo sur', food: 'peces y gambas', habit: 'se desliza sobre el hielo' },
    { n: 'el león', size: 'grande', cover: 'pelo', color: 'dorado', trait: 'una gran melena', home: 'la sabana', food: 'carne', habit: 'descansa a la sombra' },
    { n: 'la rana', size: 'pequeño', cover: 'piel', color: 'verde', trait: 'las patas muy largas', home: 'una charca', food: 'moscas y mosquitos', habit: 'canta por las noches' },
    { n: 'el búho', size: 'mediano', cover: 'plumaje', color: 'marrón', trait: 'unos ojos enormes', home: 'un viejo árbol', food: 'ratones e insectos', habit: 'caza de noche' },
    { n: 'la cebra', size: 'grande', cover: 'pelo', color: 'blanco y negro', trait: 'rayas por todo el cuerpo', home: 'la llanura', food: 'hierba', habit: 'corre en manada' },
    { n: 'el pulpo', size: 'mediano', cover: 'piel', color: 'rosa', trait: 'ocho brazos largos', home: 'el fondo del mar', food: 'cangrejos y almejas', habit: 'se esconde entre las rocas' },
    { n: 'la abeja', size: 'pequeño', cover: 'cuerpo', color: 'amarillo y negro', trait: 'dos alas muy finas', home: 'una colmena', food: 'el néctar de las flores', habit: 'vuela de flor en flor' },
  ];
  const ANI_END = [
    'A los niños les gusta mucho este animal. Por eso, cuando visitan el zoo, se paran a mirarlo un buen rato.',
    'Mucha gente se acerca a verlo con curiosidad. Es un animal que nunca deja de sorprendernos.',
    'Los científicos lo estudian desde hace muchos años. Gracias a ellos sabemos cada vez más cosas sobre su vida.',
  ];
  function genDescripcion(rng) {
    const a = P(rng, ANIMALS);
    const N = cap(a.n);
    const sents = rng.chance(0.5)
      ? [N + ' es un animal ' + a.size + '.', 'Su ' + a.cover + ' es de color ' + a.color + ' y tiene ' + a.trait + '.', 'Vive en ' + a.home + ' y se alimenta de ' + a.food + '.', 'Todos los días ' + a.habit + '.']
      : [N + ' vive en ' + a.home + '.', 'Es un animal ' + a.size + '.', 'Su ' + a.cover + ' es de color ' + a.color + ' y tiene ' + a.trait + '.', 'Se alimenta de ' + a.food + ' y todos los días ' + a.habit + '.'];
    const text = sents.concat([P(rng, ANI_END)]).join(' ');
    const qs = [
      mcq(rng, '¿De qué color es su ' + a.cover + '?', a.color, ANIMALS.map((x) => x.color), text),
      mcq(rng, '¿Dónde vive ' + a.n + '?', a.home, ANIMALS.map((x) => x.home), text),
      { q: '¿De qué se alimenta?', answer: a.food },
      { q: '¿Qué tiene ' + a.n + '?', answer: a.trait },
      mcq(rng, '¿Qué hace ' + a.n + ' todos los días?', a.habit, ANIMALS.map((x) => x.habit), text),
    ];
    return { kind: 'reading', title: N, text, qs: pickQs(rng, qs) };
  }

  const HEROES = ['Lucía', 'Pablo', 'Marta', 'Hugo', 'Sara', 'Daniel', 'Elena', 'Álvaro', 'Carmen', 'Mateo', 'Julia', 'Leo', 'Nora', 'Iván'];
  const FRIENDS = ['su abuelo', 'su hermana', 'su primo', 'su vecina', 'su perro', 'su tía', 'su padre', 'su amiga Ana', 'su amigo Rubén', 'su gato', 'su madre', 'su abuela', 'su tío', 'su hermano'];
  const PLACES = ['a la playa', 'al parque', 'al bosque', 'a la montaña', 'al río', 'al zoo', 'a la granja', 'al museo', 'a la biblioteca', 'al lago', 'al campo', 'a la plaza', 'a la piscina', 'al mercado'];
  const FOUND = ['una caja de madera', 'un mapa antiguo', 'una moneda de oro', 'una llave pequeña', 'un gatito perdido', 'una pelota roja', 'un sombrero viejo', 'una carta misteriosa', 'un reloj roto', 'una concha enorme', 'una brújula', 'un paraguas amarillo', 'un balón de fútbol', 'un pájaro herido'];
  const WHEN = ['un sábado por la mañana', 'un domingo por la tarde', 'un viernes después de clase', 'un día de verano', 'una tarde de otoño', 'una mañana de primavera', 'un día de invierno'];
  const DID = ['jugaron un buen rato', 'comieron un bocadillo', 'dieron un largo paseo', 'sacaron muchas fotos', 'corrieron sin parar', 'cantaron sus canciones favoritas', 'buscaron piedras de colores', 'se hicieron cosquillas'];
  const ENDS = ['volvieron a casa muy contentos', 'se lo contaron a toda la familia', 'prometieron volver otro día', 'hicieron una foto para recordarlo', 'cenaron juntos y se rieron mucho', 'se quedaron a ver el atardecer'];
  const WEATHER = ['Hacía un día precioso y no había ni una nube.', 'El cielo estaba azul y soplaba una brisa suave.', 'Brillaba el sol y todo olía a limpio.'];
  function genNarracion(rng) {
    const hero = P(rng, HEROES), fr = P(rng, FRIENDS), pl = P(rng, PLACES), ob = P(rng, FOUND), wh = P(rng, WHEN), did = P(rng, DID), en = P(rng, ENDS);
    const w = P(rng, WEATHER);
    const s1 = cap(wh) + ', ' + hero + ' fue ' + pl + ' con ' + fr + '.';
    const s2 = 'Primero ' + did + '.';
    const s3 = 'De pronto, vieron algo raro en el suelo: era ' + ob + '.';
    const s4 = 'Los dos se miraron muy sorprendidos y decidieron cogerlo con cuidado.';
    const s5 = 'Al final, ' + en + '.';
    const text = (rng.chance(0.5) ? [s1, w, s2, s3, s4, s5] : [w, s1, s2, s3, s4, s5]).join(' ');
    const qs = [
      mcq(rng, '¿Quién es el protagonista del cuento?', hero, HEROES, text),
      mcq(rng, '¿Con quién fue?', fr, FRIENDS, text),
      mcq(rng, '¿A dónde fueron?', pl, PLACES, text),
      { q: '¿Qué encontraron en el suelo?', answer: ob },
      mcq(rng, '¿Qué hicieron primero?', did, DID, text),
      mcq(rng, '¿Qué hicieron al final?', en, ENDS, text),
    ];
    return { kind: 'reading', title: P(rng, ['Una aventura', 'Un día especial', 'Una sorpresa', 'El hallazgo']) + ' de ' + hero, text, qs: pickQs(rng, qs) };
  }

  const RECIPES = [
    { t: 'Tortilla de patatas', k: 'f', ing: ['cuatro huevos', 'tres patatas', 'aceite', 'sal'], s: ['pela y corta las patatas', 'fríe las patatas en la sartén', 'mezcla las patatas con los huevos batidos'], time: '25 minutos' },
    { t: 'Bocadillo de queso', k: 'f', ing: ['pan', 'queso', 'tomate'], s: ['corta el pan por la mitad', 'pon unas lonchas de queso', 'añade rodajas de tomate y cierra el pan'], time: '5 minutos' },
    { t: 'Ensalada de tomate', k: 'f', ing: ['tomates', 'lechuga', 'aceite', 'sal'], s: ['lava bien la lechuga', 'corta los tomates en trozos', 'mezcla todo con aceite y sal'], time: '10 minutos' },
    { t: 'Macedonia de frutas', k: 'f', ing: ['manzanas', 'naranjas', 'plátanos'], s: ['pela las naranjas y los plátanos', 'corta toda la fruta en cuadritos', 'mezcla los trozos en un bol grande'], time: '15 minutos' },
    { t: 'Batido de fresa', k: 'f', ing: ['fresas', 'leche', 'azúcar'], s: ['lava las fresas', 'echa todo en la batidora', 'bate durante un minuto'], time: '6 minutos' },
    { t: 'Sopa de fideos', k: 'f', ing: ['caldo', 'fideos', 'zanahoria'], s: ['pon el caldo a hervir', 'echa los fideos y la zanahoria cortada', 'deja cocer hasta que esté lista'], time: '20 minutos' },
    { t: 'Tostadas con tomate', k: 'f', ing: ['pan', 'tomate', 'aceite'], s: ['tuesta el pan', 'tritura el tomate con un tenedor', 'unta el tomate y echa un chorro de aceite'], time: '8 minutos' },
    { t: 'Arroz blanco', k: 'f', ing: ['arroz', 'agua', 'sal'], s: ['pon agua con sal en una olla', 'cuando hierva, echa el arroz', 'deja cocer hasta que esté blando'], time: '18 minutos' },
    { t: 'Cómo plantar una semilla', k: 'm', ing: ['una maceta', 'tierra', 'una semilla', 'agua'], s: ['llena la maceta con tierra', 'haz un agujero y pon la semilla', 'tápala y riégala con un poco de agua'], time: '12 minutos' },
    { t: 'Cómo hacer un avión de papel', k: 'm', ing: ['una hoja de papel', 'un lápiz de colores'], s: ['dobla la hoja por la mitad', 'dobla las esquinas hacia el centro', 'dobla las alas y lanza el avión'], time: '7 minutos' },
    { t: 'Cómo lavarse las manos', k: 'm', ing: ['agua', 'jabón', 'una toalla'], s: ['moja tus manos con agua', 'frótalas con jabón durante veinte segundos', 'aclara el jabón y sécate con la toalla'], time: '2 minutos' },
    { t: 'Cómo hacer una pulsera', k: 'm', ing: ['hilos de colores', 'unas tijeras', 'cuentas'], s: ['corta tres hilos del mismo largo', 'trenza los hilos con cuidado', 'añade las cuentas y haz un nudo'], time: '30 minutos' },
    { t: 'Cómo preparar un zumo de naranja', k: 'm', ing: ['naranjas', 'un exprimidor', 'un vaso'], s: ['corta las naranjas por la mitad', 'exprime las naranjas con el exprimidor', 'sirve el zumo en un vaso'], time: '9 minutos' },
    { t: 'Pan con chocolate', k: 'f', ing: ['pan', 'chocolate'], s: ['corta una rebanada de pan', 'calienta un poco el chocolate', 'coloca el chocolate sobre el pan'], time: '4 minutos' },
  ];
  function genInstrucciones(rng) {
    const r = P(rng, RECIPES);
    const lab = r.k === 'f' ? 'Ingredientes' : 'Materiales';
    const ings = r.ing.slice(0, -1).join(', ') + (r.ing.length > 1 ? ' y ' : '') + r.ing[r.ing.length - 1];
    const intro = r.k === 'f' ? 'Esta receta es fácil y la pueden preparar los niños con ayuda de un adulto.' : 'Estas instrucciones son sencillas y las puedes seguir tú solo si vas con cuidado.';
    const text = [r.t + '.', intro, lab + ': ' + ings + '.', 'Primero, ' + r.s[0] + '.', 'Después, ' + r.s[1] + '.', 'Por último, ' + r.s[2] + '.', 'En total necesitarás unos ' + r.time + '.', 'Pide ayuda a un adulto si tienes alguna duda.'].join(' ');
    const allIng = [].concat.apply([], RECIPES.map((x) => x.ing));
    const timeOnly = r.time;
    const qs = [
      mcq(rng, '¿Qué se prepara en este texto?', r.t, RECIPES.map((x) => x.t), text),
      mcq(rng, '¿Qué necesitas?', P(rng, r.ing), allIng, text),
      { q: '¿Qué hay que hacer primero?', answer: r.s[0] },
      mcq(rng, '¿Qué hay que hacer por último?', r.s[2], RECIPES.map((x) => x.s[2]), text),
      mcq(rng, '¿Cuánto tiempo se necesita?', timeOnly, RECIPES.map((x) => x.time), text),
    ];
    // la pregunta de ingrediente debe usar el mismo ingrediente que muestra la respuesta
    return { kind: 'reading', title: r.t, text, qs: pickQs(rng, qs) };
  }

  const NEWS = [
    { h: 'Gran mercadillo solidario en el colegio', when: 'El sábado por la mañana', who: 'los alumnos de quinto', what: 'organizaron un mercadillo', where: 'el colegio San Isidro', n: '200', ns: 'Más de {n} personas visitaron los puestos del mercadillo.', nq: '¿Cuántas personas visitaron los puestos?', close: 'Con el dinero recogido se comprarán libros para la biblioteca.' },
    { h: 'Nueva biblioteca en el barrio', when: 'Ayer por la tarde', who: 'el alcalde del pueblo', what: 'inauguró una nueva biblioteca', where: 'el barrio de La Paz', n: '3000', ns: 'La biblioteca cuenta con {n} libros para todas las edades.', nq: '¿Cuántos libros tiene la biblioteca?', close: 'Los niños podrán pedir libros prestados desde la semana próxima.' },
    { h: 'Carrera popular en el parque', when: 'El domingo a primera hora', who: 'muchos vecinos', what: 'corrieron una carrera popular', where: 'el parque del pueblo', n: '150', ns: 'En total participaron {n} corredores de todas las edades.', nq: '¿Cuántos corredores participaron?', close: 'La meta estaba junto a la fuente y todos recibieron una medalla.' },
    { h: 'Concierto del coro escolar', when: 'Este viernes por la noche', who: 'el coro del colegio', what: 'ofreció un concierto', where: 'la plaza mayor', n: '400', ns: 'Asistieron {n} personas y todas aplaudieron al final.', nq: '¿Cuántas personas asistieron?', close: 'El coro cantó canciones populares durante una hora.' },
    { h: 'Limpieza de la playa', when: 'La semana pasada', who: 'los alumnos de tercero', what: 'recogieron papel y plástico', where: 'la playa del pueblo', n: '60', ns: 'Entre todos llenaron {n} bolsas de basura.', nq: '¿Cuántas bolsas llenaron?', close: 'Ahora la playa está mucho más limpia para el verano.' },
    { h: 'Nuevos árboles en el parque', when: 'El martes por la mañana', who: 'un grupo de voluntarios', what: 'plantó nuevos árboles', where: 'el parque del río', n: '80', ns: 'Pusieron {n} árboles de varios tipos.', nq: '¿Cuántos árboles pusieron?', close: 'Dentro de unos años darán sombra a todos los paseantes.' },
    { h: 'Nace una cría de jirafa', when: 'Ayer', who: 'el zoo de la ciudad', what: 'presentó a una cría de jirafa', where: 'su jardín principal', n: '55', ns: 'La pequeña pesa {n} kilos y ya camina sola.', nq: '¿Cuántos kilos pesa la cría?', close: 'Los cuidadores dicen que come y crece muy bien.' },
    { h: 'Victoria en el torneo de fútbol', when: 'El sábado por la tarde', who: 'el equipo del colegio', what: 'ganó el torneo de fútbol', where: 'el polideportivo municipal', n: '12', ns: 'Se jugaron {n} partidos en dos días.', nq: '¿Cuántos partidos se jugaron?', close: 'Los jugadores celebraron el triunfo con sus familias.' },
    { h: 'Llega la feria del libro', when: 'Desde el lunes', who: 'la feria del libro', what: 'abre sus puertas', where: 'la plaza del ayuntamiento', n: '30', ns: 'Hay {n} puestos con libros de todo tipo.', nq: '¿Cuántos puestos hay?', close: 'La entrada es gratis y se puede visitar hasta el domingo.' },
    { h: 'Los bomberos visitan una escuela', when: 'Esta mañana', who: 'los bomberos', what: 'visitaron una escuela infantil', where: 'el barrio de San Pedro', n: '45', ns: 'Hablaron con {n} niños sobre cómo actuar en una emergencia.', nq: '¿Con cuántos niños hablaron?', close: 'Los pequeños pudieron subir al camión y probar la manguera.' },
    { h: 'Primera cosecha del huerto escolar', when: 'El jueves', who: 'los alumnos de primero', what: 'recogieron las primeras verduras del huerto', where: 'el patio del colegio', n: '25', ns: 'Sacaron {n} tomates y varias lechugas.', nq: '¿Cuántos tomates sacaron?', close: 'Las verduras se usarán para hacer una ensalada en el comedor.' },
    { h: 'Dibujos infantiles en el museo', when: 'Desde hoy', who: 'el museo de la ciudad', what: 'muestra una exposición de dibujos infantiles', where: 'su sala principal', n: '100', ns: 'Hay {n} dibujos hechos por niños de toda la región.', nq: '¿Cuántos dibujos hay?', close: 'La exposición se podrá ver durante todo el mes.' },
    { h: 'Una gran nevada cubre el pueblo', when: 'Esta noche', who: 'la nieve', what: 'cubrió las calles', where: 'el pueblo de Valdenieve', n: '20', ns: 'Cayeron {n} centímetros de nieve en pocas horas.', nq: '¿Cuántos centímetros de nieve cayeron?', close: 'Los niños pudieron hacer muñecos de nieve en la plaza.' },
    { h: 'Jornada de adopción de mascotas', when: 'El domingo', who: 'una protectora de animales', what: 'celebró una jornada de adopción', where: 'el centro cívico', n: '18', ns: 'Un total de {n} perros y gatos encontraron un hogar.', nq: '¿Cuántos perros y gatos encontraron un hogar?', close: 'Los voluntarios esperan repetir la jornada el próximo mes.' },
  ];
  const NEWS_PAD = ['Los vecinos opinan que fue un día muy especial para todos.', 'Muchos asistentes sacaron fotos para recordar el momento.', 'La noticia ha alegrado a toda la comunidad.'];
  const NUMS = ['12', '18', '20', '25', '30', '45', '55', '60', '80', '100', '150', '200', '400', '3000'];
  function genNoticia(rng) {
    const r = P(rng, NEWS);
    const text = [r.when + ', ' + r.who + ' ' + r.what + ' en ' + r.where + '.', r.ns.replace('{n}', r.n), P(rng, NEWS_PAD), r.close, P(rng, ['Esta noticia ha llamado la atención de muchas familias de la zona.', 'Todos esperan que pronto vuelva a haber una actividad parecida.'])].join(' ');
    const qs = [
      mcq(rng, '¿Qué ocurrió?', r.what, NEWS.map((x) => x.what), text),
      mcq(rng, '¿Dónde ocurrió?', r.where, NEWS.map((x) => x.where), text),
      mcq(rng, '¿Cuándo ocurrió?', r.when, NEWS.map((x) => x.when), text),
      { q: '¿Quién es el protagonista de la noticia?', answer: r.who },
      mcq(rng, r.nq, r.n, NUMS, text),
    ];
    return { kind: 'reading', title: r.h, text, qs: pickQs(rng, qs) };
  }
  const genRepaso12 = (rng) => P(rng, [genDescripcion, genNarracion, genInstrucciones, genNoticia])(rng);

  // ===================== DEFINICIÓN DE NIVELES =====================
  g.LENGUA_LEVELS.push({
    id: 9, name: 'Vocabulario', age: '9 años',
    sublevels: [
      { id: '9.1', name: 'Familias de palabras', layout: 'cols2', perSheet: 8, gen: genFam },
      { id: '9.2', name: 'Sinónimos', layout: 'wide', perSheet: 3, gen: genSyn },
      { id: '9.3', name: 'Antónimos', layout: 'wide', perSheet: 3, gen: genAnt },
      { id: '9.4', name: 'Diminutivos', layout: 'wide', perSheet: 8, gen: genDim },
      { id: '9.5', name: 'Aumentativos', layout: 'wide', perSheet: 8, gen: genAum },
      { id: '9.6', name: 'Campos semánticos: la palabra intrusa', layout: 'cols2', perSheet: 8, gen: genField },
      { id: '9.7', name: 'Repaso de vocabulario', layout: 'wide', perSheet: 8, gen: genRepaso9 },
    ],
  });
  g.LENGUA_LEVELS.push({
    id: 10, name: 'El verbo', age: '9-10 años',
    sublevels: [
      { id: '10.1', name: 'Reconocer el verbo', layout: 'wide', perSheet: 8, gen: genVerboRec },
      { id: '10.2', name: 'Pasado, presente y futuro', layout: 'wide', perSheet: 8, gen: genTiempo },
      { id: '10.3', name: 'Conjugar en presente', layout: 'wide', perSheet: 8, gen: genConjPic('pres') },
      { id: '10.4', name: 'Conjugar en pasado', layout: 'wide', perSheet: 8, gen: genConjPic('pret') },
      { id: '10.5', name: 'Conjugar en futuro', layout: 'wide', perSheet: 8, gen: genConjPic('fut') },
      { id: '10.6', name: 'Concordancia entre sujeto y verbo', layout: 'wide', perSheet: 8, gen: genConcord },
      { id: '10.7', name: 'Repaso del verbo', layout: 'wide', perSheet: 8, gen: genRepaso10 },
    ],
  });
  g.LENGUA_LEVELS.push({
    id: 11, name: 'La oración', age: '10 años',
    sublevels: [
      { id: '11.1', name: 'Ordenar frases cortas', layout: 'wide', perSheet: 8, gen: genOrder({ comp: 'one', min: 3, max: 4 }) },
      { id: '11.2', name: 'Ordenar frases largas', layout: 'wide', perSheet: 8, gen: genOrder({ comp: 'multi', min: 5, max: 6 }) },
      { id: '11.3', name: 'Sujeto y predicado', layout: 'wide', perSheet: 8, gen: genSujPred },
      { id: '11.4', name: 'Clases de oración', layout: 'wide', perSheet: 8, gen: genClase },
      { id: '11.5', name: 'Signos de interrogación y exclamación', layout: 'wide', perSheet: 8, gen: genSignos },
      { id: '11.6', name: 'El punto y la coma', layout: 'wide', perSheet: 8, gen: genPuntoComa },
      { id: '11.7', name: 'Las mayúsculas', layout: 'wide', perSheet: 8, gen: genMayus },
      { id: '11.8', name: 'Repaso de la oración', layout: 'wide', perSheet: 8, gen: genRepaso11 },
    ],
  });
  g.LENGUA_LEVELS.push({
    id: 12, name: 'Comprensión lectora', age: '10 años',
    sublevels: [
      { id: '12.1', name: 'Textos descriptivos', layout: 'wide', perSheet: 1, gen: genDescripcion },
      { id: '12.2', name: 'Textos narrativos', layout: 'wide', perSheet: 1, gen: genNarracion },
      { id: '12.3', name: 'Instrucciones y recetas', layout: 'wide', perSheet: 1, gen: genInstrucciones },
      { id: '12.4', name: 'La noticia', layout: 'wide', perSheet: 1, gen: genNoticia },
      { id: '12.5', name: 'Repaso de lectura', layout: 'wide', perSheet: 1, gen: genRepaso12 },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
