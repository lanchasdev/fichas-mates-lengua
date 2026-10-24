// Lengua, niveles 1 a 4. Usa solo rng. Lee el banco (LENGUA_WORDS) de forma perezosa.
(function (g) {
  const LIB = g.LENGUA_LIB;
  const memo = {};
  const cache = (k, f) => (k in memo ? memo[k] : (memo[k] = f()));
  const PLAIN = /^[a-zñáéíóúü]+$/;
  const imgs = () => g.LENGUA_IMGS || {};

  // Sustantivos con imagen, palabra sin espacios y sílabas coherentes.
  const nouns = () => cache('nouns', () => LIB.nouns((w) => PLAIN.test(w.w) && w.img && imgs()[w.img] && Array.isArray(w.syl) && w.syl.join('') === w.w));
  const bySyl = (n, f) => cache('syl' + n + (f ? f.toString() : ''), () => nouns().filter((w) => w.syl.length === n && (!f || f(w))));
  const byImg = (w) => cache('byw', () => { const m = {}; nouns().forEach((x) => { m[x.w] = x; }); return m; })[w];

  function distinct(rng, arr, n, ok) {
    const out = [], si = new Set(), sw = new Set();
    for (const x of rng.shuffle(arr)) {
      if (si.has(x.img) || sw.has(x.w)) continue;
      if (ok && !ok(x, out)) continue;
      si.add(x.img); sw.add(x.w); out.push(x);
      if (out.length === n) break;
    }
    return out;
  }
  const bx = (s, k) => ({ box: Math.max(14, Math.round((k || 6) * s.length + 4)) });
  const S = String;
  function mkMatch(rng, left, rightInOrder) {
    const perm = rng.shuffle(left.map((_, i) => i));
    return { kind: 'match', left, right: perm.map((p) => rightInOrder[p]), answer: left.map((_, i) => S(perm.indexOf(i))) };
  }

  // Letras
  const INIT = 'abcdefgijlmnopqrstuvz';
  const GROUP = { b: 'bv', v: 'bv', c: 'ckqz', k: 'ckqz', q: 'ckqz', z: 'ckqz', g: 'gj', j: 'gj' };
  const conf = (a, b) => a === b || (GROUP[a] && GROUP[a] === GROUP[b]);
  const ALPHA = 'abcdefghijklmnñopqrstuvwxyz'.split('');
  const CONS = 'bcdfglmnprstvz'.split('');
  const VOWELS = 'aeiou'.split('');
  const initWords = () => cache('init', () => nouns().filter((w) => INIT.includes(w.w[0])));

  function vowelIdx(word) {
    const r = [];
    for (let i = 0; i < word.length; i++) {
      if (VOWELS.includes(word[i]) && !(word[i] === 'u' && i > 0 && 'qg'.includes(word[i - 1]))) r.push(i);
    }
    return r;
  }
  const clean = (a) => a.filter((x) => x !== '');

  // ---------- Nivel 1 ----------
  const g11 = (rng) => {
    const v = rng.pick(VOWELS);
    const up = rng.chance(0.5);
    const f = (c) => (up ? c.toUpperCase() : c);
    const opts = rng.shuffle([v, ...LIB.sample(rng, CONS, 3)]).map(f);
    return { kind: 'choice', options: opts, answer: f(v) };
  };
  const g12 = (rng) => {
    const w = LIB.pick(rng, initWords());
    const L = w.w[0];
    const ds = LIB.sample(rng, INIT.split('').filter((c) => !conf(c, L)), 2);
    return { kind: 'choice', img: w.img, tokens: ['__', w.w.slice(1)], options: rng.shuffle([L, ...ds]), answer: L };
  };
  const g13 = (rng) => {
    const w = LIB.pick(rng, nouns().filter((x) => x.w.length >= 3 && x.w.length <= 7 && vowelIdx(x.w).length));
    const i = LIB.pick(rng, vowelIdx(w.w));
    return { kind: 'pic', img: w.img, tokens: clean([w.w.slice(0, i), '__', w.w.slice(i + 1)]), answer: w.w[i] };
  };
  const g14 = (rng) => {
    const ws = distinct(rng, initWords(), 4, (x, out) => out.every((o) => !conf(o.w[0], x.w[0])));
    return mkMatch(rng, ws.map((w) => ({ img: w.img })), ws.map((w) => ({ t: w.w[0] })));
  };
  const g15 = (rng) => {
    const t = rng.int(0, 2);
    if (t === 0) { const i = rng.int(0, 25); return { kind: 'tokens', tokens: ['Después de la', ALPHA[i], 'va la', '__'], answer: ALPHA[i + 1] }; }
    if (t === 1) { const i = rng.int(1, 26); return { kind: 'tokens', tokens: ['Antes de la', ALPHA[i], 'va la', '__'], answer: ALPHA[i - 1] }; }
    const s = rng.int(0, 23), h = rng.int(0, 3), up = rng.chance(0.3);
    const f = (c) => (up ? c.toUpperCase() : c);
    const tk = [0, 1, 2, 3].map((k) => (k === h ? '__' : f(ALPHA[s + k])));
    return { kind: 'tokens', tokens: tk, answer: f(ALPHA[s + h]) };
  };
  const g16 = (rng) => {
    const ls = LIB.sample(rng, ALPHA, 4);
    return mkMatch(rng, ls.map((c) => ({ t: c.toUpperCase() })), ls.map((c) => ({ t: c })));
  };
  const mixer = (gens, layout, perSheet, id, name) => ({ id, name, layout, perSheet, gen: (rng) => rng.pick(gens)(rng) });

  g.LENGUA_LEVELS.push({
    id: 1, name: 'Letras y vocales', age: '6-7 años',
    sublevels: [
      { id: '1.1', name: 'Rodea la vocal', layout: 'cols2', perSheet: 10, gen: g11 },
      { id: '1.2', name: 'Con qué letra empieza', layout: 'cols2', perSheet: 8, gen: g12 },
      { id: '1.3', name: 'Escribe la vocal que falta', layout: 'cols2', perSheet: 8, gen: g13 },
      { id: '1.4', name: 'Une cada dibujo con su letra inicial', layout: 'wide', perSheet: 3, gen: g14 },
      { id: '1.5', name: 'El abecedario: antes y después', layout: 'cols2', perSheet: 10, gen: g15 },
      { id: '1.6', name: 'Une la mayúscula con su minúscula', layout: 'wide', perSheet: 3, gen: g16 },
      mixer([g11, g12, g13, g15], 'cols2', 10, '1.7', 'Repaso de letras y vocales'),
    ],
  });

  // ---------- Nivel 2 ----------
  const pool2 = () => bySyl(2, (w) => w.syl[0] !== w.syl[1]);
  const sylBoxes = (w) => w.syl.map((s) => bx(s, 5.5));
  const count = (n, opts) => (rng) => {
    const w = LIB.pick(rng, bySyl(n));
    return { kind: 'choice', img: w.img, options: opts, answer: S(n) };
  };
  const sep = (n) => (rng) => {
    const w = LIB.pick(rng, bySyl(n));
    return { kind: 'pic', img: w.img, tokens: sylBoxes(w), answer: w.syl.slice() };
  };
  const g21 = (rng) => {
    const n = rng.pick([1, 2]);
    const w = LIB.pick(rng, bySyl(n));
    return { kind: 'choice', img: w.img, options: ['1', '2', '3'], answer: S(n) };
  };
  const g23 = (rng) => {
    const w = LIB.pick(rng, pool2());
    return { kind: 'pic', img: w.img, tokens: [w.syl[1], w.syl[0], ':', bx(w.w, 6)], answer: w.w };
  };
  const g24 = (rng) => {
    const w = LIB.pick(rng, pool2());
    const h = rng.int(0, 1);
    return { kind: 'pic', img: w.img, tokens: w.syl.map((s, i) => (i === h ? '__' : s)), answer: w.syl[h] };
  };
  const g25 = (rng) => (rng.chance(0.5) ? count(3, ['2', '3', '4'])(rng) : sep(3)(rng));
  const g26 = (rng) => (rng.chance(0.5) ? count(4, ['3', '4', '5'])(rng) : sep(4)(rng));
  const g27 = (rng) => {
    const all = cache('allw', () => new Set(LIB.words().map((w) => w.w)));
    const ws = [];
    for (const w of rng.shuffle(pool2())) {
      if (ws.some((o) => o.syl[0] === w.syl[0] || o.syl[1] === w.syl[1] || o.syl[0] === w.syl[1] || o.syl[1] === w.syl[0] || all.has(o.syl[0] + w.syl[1]) || all.has(w.syl[0] + o.syl[1]))) continue;
      ws.push(w);
      if (ws.length === 4) break;
    }
    return mkMatch(rng, ws.map((w) => ({ t: w.syl[0] })), ws.map((w) => ({ t: w.syl[1] })));
  };
  const g22 = sep(2);
  g.LENGUA_LEVELS.push({
    id: 2, name: 'Las sílabas', age: '7 años',
    sublevels: [
      { id: '2.1', name: 'Cuenta las sílabas (1 y 2)', layout: 'cols2', perSheet: 10, gen: g21 },
      { id: '2.2', name: 'Separa en sílabas (2 sílabas)', layout: 'cols2', perSheet: 8, gen: g22 },
      { id: '2.3', name: 'Ordena las sílabas', layout: 'cols2', perSheet: 8, gen: g23 },
      { id: '2.4', name: 'Completa la sílaba que falta', layout: 'cols2', perSheet: 8, gen: g24 },
      { id: '2.5', name: 'Palabras de 3 sílabas', layout: 'wide', perSheet: 8, gen: g25 },
      { id: '2.6', name: 'Palabras de 4 sílabas', layout: 'wide', perSheet: 8, gen: g26 },
      { id: '2.7', name: 'Une las sílabas y forma la palabra', layout: 'wide', perSheet: 3, gen: g27 },
      mixer([g21, g22, g23, g24, g25, g26], 'wide', 8, '2.8', 'Repaso de sílabas'),
    ],
  });

  // ---------- Nivel 3 ----------
  const pool3 = () => nouns().filter((w) => w.w.length >= 3 && w.w.length <= 9);
  const wbox = (w) => ({ box: Math.max(30, Math.round(6.2 * w.length)) });
  const SENT_CATS = ['animales', 'frutas', 'verduras', 'comida', 'ropa', 'casa', 'escuela', 'juguetes', 'objetos', 'transporte', 'naturaleza'];
  const START = {
    frutas: ['Veo', 'Dibujo', 'Como'], verduras: ['Veo', 'Dibujo', 'Como'], comida: ['Veo', 'Dibujo', 'Como'],
    juguetes: ['Veo', 'Dibujo', 'Tengo'], ropa: ['Veo', 'Dibujo', 'Tengo'], objetos: ['Veo', 'Dibujo', 'Tengo'], escuela: ['Veo', 'Dibujo', 'Tengo'], animales: ['Veo', 'Dibujo'],
  };
  const sentPool = () => cache('sent', () => nouns().filter((w) => SENT_CATS.includes(w.cat) && !/s$/.test(w.w) && !(w.g === 'f' && /^h?[aá]/.test(w.w))));
  function sentence(rng) {
    const w = LIB.pick(rng, sentPool());
    const st = LIB.pick(rng, START[w.cat] || ['Veo', 'Dibujo']);
    return { w, st, ind: w.g === 'f' ? 'una' : 'un', rest: '' };
  }
  const g31 = (rng) => { const w = LIB.pick(rng, pool3()); return { kind: 'copy', img: w.img, text: w.w, reps: 2, answer: w.w }; };
  const g32 = (rng) => { const w = LIB.pick(rng, pool3()); return { kind: 'pic', img: w.img, tokens: [wbox(w.w)], answer: w.w }; };
  const g33 = (rng) => {
    const ws = distinct(rng, pool3(), 4);
    return mkMatch(rng, ws.map((w) => ({ img: w.img })), ws.map((w) => ({ t: w.w })));
  };
  const g34 = (rng) => {
    const w = LIB.pick(rng, nouns().filter((x) => x.w.length >= 3 && x.w.length <= 6 && new Set(x.w).size > 1));
    let a;
    do { a = rng.shuffle(w.w.split('')); } while (a.join('') === w.w);
    return { kind: 'pic', img: w.img, tokens: [...a, ':', wbox(w.w)], answer: w.w };
  };
  const g35 = (rng) => {
    const cand = nouns().filter((w) => w.w.length >= 4 && w.w.length <= 8 && vowelIdx(w.w).some((i, k, v) => v.some((j) => j - i > 1)));
    const w = LIB.pick(rng, cand);
    const v = vowelIdx(w.w);
    let i, j;
    do { i = LIB.pick(rng, v); j = LIB.pick(rng, v); } while (j - i < 2);
    return { kind: 'pic', img: w.img, tokens: clean([w.w.slice(0, i), '__', w.w.slice(i + 1, j), '__', w.w.slice(j + 1)]), answer: [w.w[i], w.w[j]] };
  };
  const g36copy = (rng) => {
    let s, t;
    do { s = sentence(rng); t = `${s.st} ${s.ind} ${s.w.w}.`; } while (t.length > 22);
    return { kind: 'copy', img: s.w.img, text: t, reps: 1, answer: t };
  };
  const g36lines = (rng) => {
    const w = LIB.pick(rng, pool3());
    const ind = w.g === 'f' ? 'una' : 'un';
    return { kind: 'lines', img: w.img, text: `Escribe una frase con la palabra "${w.w}".`, n: 2, answer: `Veo ${ind} ${w.w}.` };
  };
  const g36 = (rng) => (rng.chance(0.5) ? g36copy(rng) : g36lines(rng));
  const g37 = (rng) => {
    const s = sentence(rng);
    if (rng.chance(0.5)) {
      return { kind: 'choice', img: s.w.img, tokens: ['__', `${s.ind} ${s.w.w}.`], options: rng.shuffle([s.st, s.st.toLowerCase()]), answer: s.st };
    }
    return { kind: 'choice', img: s.w.img, tokens: [`${s.st} ${s.ind} ${s.w.w}`, '__'], options: rng.shuffle(['.', ',']), answer: '.' };
  };
  g.LENGUA_LEVELS.push({
    id: 3, name: 'Leer y escribir palabras', age: '7 años',
    sublevels: [
      { id: '3.1', name: 'Copia la palabra', layout: 'cols2', perSheet: 8, gen: g31 },
      { id: '3.2', name: 'Escribe el nombre del dibujo', layout: 'cols2', perSheet: 8, gen: g32 },
      { id: '3.3', name: 'Une cada dibujo con su palabra', layout: 'wide', perSheet: 3, gen: g33 },
      { id: '3.4', name: 'Ordena las letras', layout: 'wide', perSheet: 8, gen: g34 },
      { id: '3.5', name: 'Completa con las vocales que faltan', layout: 'cols2', perSheet: 8, gen: g35 },
      { id: '3.6', name: 'Frases: copia y escribe', layout: 'wide', perSheet: 6, gen: g36 },
      { id: '3.7', name: 'Mayúscula al empezar y punto al final', layout: 'cols2', perSheet: 8, gen: g37 },
      mixer([g31, g32, g34, g35, g36copy, g37], 'wide', 8, '3.8', 'Repaso de leer y escribir'),
    ],
  });

  // ---------- Nivel 4 ----------
  // Listas propias revisadas. "safe": la palabra no tiene variante real con la otra grafía (valen sin imagen).
  // "needImg": solo se usan si el banco tiene imagen de esa palabra.
  const ORT = {
    mp: ['campo', 'lámpara', 'rampa', 'trompeta', 'siempre', 'tiempo', 'ejemplo', 'campana', 'trampa', 'compra', 'cumpleaños', 'campeón', 'compañero', 'importante', 'trompo', 'pompa', 'empezar', 'simple'],
    mb: ['hombre', 'bombero', 'tambor', 'cambio', 'bomba', 'sombra', 'timbre', 'ambulancia', 'bombilla', 'alfombra', 'también', 'hambre', 'ombligo', 'lombriz', 'nombre', 'sombrero', 'bombón'],
    n: ['planta', 'monte', 'mundo', 'cuento', 'tienda', 'banco', 'pingüino', 'manzana', 'cinta', 'punta', 'mantel', 'cantar', 'blanco', 'sandía', 'ventana', 'pintura', 'lente', 'fuente', 'diente'],
    rr: ['torre', 'tierra', 'gorra', 'jarra', 'guitarra', 'zorro', 'correr', 'pizarra', 'serrucho', 'sierra', 'cigarro', 'barro', 'ferrocarril', 'terraza'],
    rrNeed: ['perro', 'carro', 'cerro', 'barrio', 'burro'],
    r: ['pirata', 'mirar', 'camarero', 'gorila', 'girasol', 'pared', 'arena', 'cereza', 'mariposa', 'maravilla', 'parecer', 'ratón', 'rana', 'rosa', 'rueda', 'regalo', 'río', 'rojo', 'reloj', 'ramo', 'rey', 'rápido', 'rico'],
    rNeed: ['pera', 'toro', 'cara', 'oro'],
    c: ['casa', 'cama', 'copa', 'cuna', 'cubo', 'camisa', 'cabeza', 'carta', 'coche', 'cuchara', 'colegio', 'cometa', 'cuento', 'caracol', 'cohete', 'cocina'],
    qu: ['quince', 'pequeño', 'chaqueta', 'máquina', 'esquina', 'bosque', 'parque', 'mosquito', 'raqueta', 'esqueleto'],
    z: ['zapato', 'zumo', 'zanahoria', 'azúcar', 'taza', 'lazo', 'zapatilla', 'azul', 'cabeza', 'tiza'],
    ce: ['cena', 'cine', 'cielo', 'cereza', 'ciudad', 'cebolla', 'cinco', 'centro', 'cerca', 'círculo', 'cepillo', 'cocina'],
    g: ['gato', 'goma', 'gafas', 'gallo', 'galleta', 'gorro', 'ganso', 'amigo', 'mago', 'lago', 'hormiga', 'tortuga', 'gorila', 'pegamento'],
    gu: ['guitarra', 'guisante', 'guerra', 'juguete', 'hamburguesa', 'manguera', 'higuera', 'merengue', 'espagueti', 'guiso'],
    ge: ['gigante', 'genio', 'gente', 'girasol', 'gemelo', 'gelatina', 'general', 'gimnasio', 'agencia', 'imagen', 'urgente', 'dirigir', 'elegir', 'coger', 'escoger', 'corregir', 'ingeniero'],
    je: ['jirafa', 'jefe', 'jinete', 'jeringa', 'ajedrez', 'mujer', 'viaje', 'cajero', 'cerrajero', 'ejército', 'mensaje'],
    ch: ['chocolate', 'leche', 'coche', 'mochila', 'cuchara', 'noche', 'chaqueta', 'ficha', 'muchacho', 'techo', 'chico', 'churro', 'cuchillo', 'ducha', 'lechuga', 'escuchar', 'bicho', 'mucho', 'gancho', 'chiste', 'chicle'],
  };
  const EXCLUDE = ['cebra', 'zebra', 'zeta', 'jengibre', 'jenjibre', 'gineta', 'jineta'];

  // Crea el generador de un tema de ortografía: buscadores (regex con lookahead que casa SOLO la grafía dudosa).
  function ortTopic(finders, lists, needLists, extraFilter, optsFn) {
    const pool = () => cache('ort' + lists.join(',') + finders.map((f) => f.re).join(), () => {
      const m = {};
      const ok = (w) => PLAIN.test(w) && !EXCLUDE.includes(w) && !/ü|cc/.test(w) && (!extraFilter || extraFilter(w)) && finders.some((f) => f.re.test(w));
      nouns().forEach((x) => { if (ok(x.w)) m[x.w] = x.img; });
      lists.forEach((k) => ORT[k].forEach((w) => { if (ok(w) && !(w in m)) m[w] = (byImg(w) || {}).img || null; }));
      (needLists || []).forEach((k) => ORT[k].forEach((w) => { if (ok(w) && !(w in m) && byImg(w)) m[w] = byImg(w).img; }));
      return Object.keys(m).map((w) => ({ w, img: m[w] }));
    });
    return (rng) => {
      const it = LIB.pick(rng, pool());
      let best = null;
      for (const f of finders) {
        const mt = f.re.exec(it.w);
        if (mt && (!best || mt.index < best.i)) best = { i: mt.index, len: mt[0].length, a: f.ans };
      }
      const ex = {
        kind: 'choice',
        tokens: clean([it.w.slice(0, best.i), '__', it.w.slice(best.i + best.len)]),
        options: rng.shuffle(optsFn ? optsFn(rng, best.a) : finders.map((f) => f.ans).filter((a, k, v) => v.indexOf(a) === k)),
        answer: best.a,
      };
      if (it.img) ex.img = it.img;
      return ex;
    };
  }
  const MPB = [{ re: /m(?=[pb])/, ans: 'm' }, { re: /n(?=[ctdgfzsl])/, ans: 'n' }];
  const g41 = ortTopic(MPB, ['mp', 'mb', 'n'], null, null, () => ['m', 'n']);
  const g42 = ortTopic([{ re: /rr/, ans: 'rr' }, { re: /(?<=[aeiouáéíóú])r(?=[aeiouáéíóú])/, ans: 'r' }, { re: /^r(?=[aeiouáéíóú])/, ans: 'r' }], ['rr', 'r'], ['rrNeed', 'rNeed'], null, () => ['r', 'rr']);
  const g43 = ortTopic([{ re: /c(?=[aouáóú])/, ans: 'c' }, { re: /qu(?=[eiéí])/, ans: 'qu' }], ['c', 'qu'], null, null, () => ['c', 'qu']);
  const g44 = ortTopic([{ re: /z(?=[aouáóú])/, ans: 'z' }, { re: /c(?=[eiéí])/, ans: 'c' }], ['z', 'ce'], null, null, () => ['z', 'c']);
  const g45 = ortTopic([{ re: /g(?=[aoáó])/, ans: 'g' }, { re: /gu(?=[eiéí])/, ans: 'gu' }], ['g', 'gu'], null, null, () => ['g', 'gu']);
  const g46 = ortTopic([{ re: /g(?=[eiéí])/, ans: 'g' }, { re: /j(?=[eiéí])/, ans: 'j' }], ['ge', 'je'], null, null, () => ['g', 'j']);
  const g47 = ortTopic([{ re: /ch/, ans: 'ch' }], ['ch'], null, null, (rng) => ['ch', ...LIB.sample(rng, ['c', 'll', 'x'], 2)]);
  g.LENGUA_LEVELS.push({
    id: 4, name: 'Ortografía básica', age: '7-8 años',
    sublevels: [
      { id: '4.1', name: 'M antes de P y B', layout: 'cols2', perSheet: 10, gen: g41 },
      { id: '4.2', name: 'R y RR', layout: 'cols2', perSheet: 10, gen: g42 },
      { id: '4.3', name: 'C y QU', layout: 'cols2', perSheet: 10, gen: g43 },
      { id: '4.4', name: 'Z y C (za, zo, zu, ce, ci)', layout: 'cols2', perSheet: 10, gen: g44 },
      { id: '4.5', name: 'G y GU', layout: 'cols2', perSheet: 10, gen: g45 },
      { id: '4.6', name: 'ge, gi, je, ji', layout: 'cols2', perSheet: 10, gen: g46 },
      { id: '4.7', name: 'La CH', layout: 'cols2', perSheet: 10, gen: g47 },
      mixer([g41, g42, g43, g44, g45, g46, g47], 'cols2', 10, '4.8', 'Repaso de ortografía'),
    ],
  });
  g.LENGUA_1_4_DATA = { ORT, EXCLUDE };
})(typeof window !== 'undefined' ? window : globalThis);
