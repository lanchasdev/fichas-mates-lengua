// Lengua, niveles 5 a 8: género y número, clases de palabras, ortografía y acentuación.
(function (g) {
  const LIB = () => g.LENGUA_LIB;
  const IM = () => g.LENGUA_IMGS || {};
  const hasImg = (w) => !!(w && w.img && IM()[w.img]);
  const memo = (fn) => { let v; return () => (v === undefined ? (v = fn()) : v); };
  const pick = (rng, arr) => rng.pick(arr);
  const ACC = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' };
  const strip = (s) => s.replace(/[áéíóú]/g, (c) => ACC[c]);
  const plain = (w) => !/[\s-]/.test(w.w);

  // ---------------------------------------------------------------- NIVEL 5
  const BAD_G = new Set(['mar', 'cometa', 'orden', 'radio', 'capital', 'policía', 'frente', 'guía', 'editorial', 'vocal', 'cura', 'corte', 'parte', 'pendiente', 'final']);
  const okNoun = (w) => hasImg(w) && (w.g === 'm' || w.g === 'f') && typeof w.pl === 'string' && w.pl && plain(w) &&
    !BAD_G.has(w.w) && !(w.g === 'f' && /^h?[aá]/i.test(w.w) && (w.t === undefined || w.t === 0));
  const nounsOK = memo(() => LIB().nouns(okNoun));
  const vowelNouns = memo(() => nounsOK().filter((w) => /[aeiouáéó]$/.test(w.w) && w.pl === w.w + 's'));
  const consNouns = memo(() => nounsOK().filter((w) => /[bcdfghjklmnñpqrtvwxy]$/.test(w.w) && strip(w.pl) === strip(w.w) + 'es'));
  const zNouns = memo(() => nounsOK().filter((w) => /z$/.test(w.w) && w.pl === w.w.slice(0, -1) + 'ces'));
  const Z_OWN = [['pez', 'peces'], ['lápiz', 'lápices'], ['nariz', 'narices'], ['luz', 'luces'], ['cruz', 'cruces'], ['vez', 'veces'],
    ['actriz', 'actrices'], ['lombriz', 'lombrices'], ['codorniz', 'codornices'], ['avestruz', 'avestruces'], ['tapiz', 'tapices'],
    ['matriz', 'matrices'], ['raíz', 'raíces'], ['nuez', 'nueces'], ['voz', 'voces'], ['antifaz', 'antifaces'], ['disfraz', 'disfraces'],
    ['perdiz', 'perdices'], ['cicatriz', 'cicatrices'], ['juez', 'jueces']];
  const art = (w) => (w.g === 'f' ? 'la' : 'el');
  const PL = (w) => (w.g === 'f' ? 'las' : 'los');

  const b51 = (rng) => { const w = pick(rng, nounsOK()); return { kind: 'choice', img: w.img, tokens: ['__', w.w], options: ['el', 'la'], answer: art(w) }; };
  const b52 = (rng) => { const w = pick(rng, nounsOK()); return { kind: 'choice', img: w.img, tokens: ['__', w.w], options: ['un', 'una'], answer: w.g === 'f' ? 'una' : 'un' }; };
  const b53 = (rng) => { const w = pick(rng, nounsOK()); return { kind: 'choice', img: w.img, tokens: [w.w, ':', '__'], options: ['masculino', 'femenino'], answer: w.g === 'f' ? 'femenino' : 'masculino' }; };
  const numberEx = (rng, w) => (rng.chance(0.5)
    ? { kind: 'pic', img: w.img, tokens: [art(w) + ' ' + w.w, 'en plural:', PL(w), { box: 60 }], answer: w.pl }
    : { kind: 'pic', img: w.img, tokens: [PL(w) + ' ' + w.pl, 'en singular:', art(w), { box: 60 }], answer: w.w });
  const b54 = (rng) => numberEx(rng, pick(rng, vowelNouns()));
  const b55 = (rng) => numberEx(rng, pick(rng, consNouns()));
  const b56 = (rng) => {
    const zs = zNouns();
    if (zs.length >= 3 && rng.chance(0.5)) {
      const w = pick(rng, zs);
      return { kind: 'pic', img: w.img, tokens: [art(w) + ' ' + w.w, 'en plural:', PL(w), { box: 60 }], answer: w.pl };
    }
    const [s, p] = pick(rng, Z_OWN);
    return { kind: 'choice', tokens: ['singular: ' + s, 'plural:', '__'], options: rng.shuffle([p, s + 'es']), answer: p };
  };
  const b57 = (rng) => {
    const w = pick(rng, nounsOK());
    const plural = rng.chance(0.5);
    const a = plural ? PL(w) : art(w);
    return { kind: 'choice', img: w.img, tokens: ['__', plural ? w.pl : w.w], options: ['el', 'la', 'los', 'las'], answer: a };
  };
  const mix5 = [b51, b52, b53, b54, b55, b56, b57];

  g.LENGUA_LEVELS.push({
    id: 5, name: 'Género y número', age: '8 años',
    sublevels: [
      { id: '5.1', name: 'El o la', layout: 'cols2', perSheet: 10, gen: b51 },
      { id: '5.2', name: 'Un o una', layout: 'cols2', perSheet: 10, gen: b52 },
      { id: '5.3', name: 'Masculino y femenino', layout: 'cols2', perSheet: 10, gen: b53 },
      { id: '5.4', name: 'Singular y plural (-s)', layout: 'wide', perSheet: 8, gen: b54 },
      { id: '5.5', name: 'Plural de palabras acabadas en consonante (-es)', layout: 'wide', perSheet: 8, gen: b55 },
      { id: '5.6', name: 'Plural de palabras acabadas en -z', layout: 'wide', perSheet: 8, gen: b56 },
      { id: '5.7', name: 'Concordancia: el, la, los, las', layout: 'cols2', perSheet: 10, gen: b57 },
      { id: '5.8', name: 'Repaso de género y número', layout: 'wide', perSheet: 8, gen: (rng) => pick(rng, mix5)(rng) },
    ],
  });

  // ---------------------------------------------------------------- NIVEL 6
  const PROPER = ['Lucía', 'Pablo', 'Marta', 'Álvaro', 'Carmen', 'Javier', 'Sara', 'Daniel', 'Elena', 'Hugo', 'Madrid', 'Sevilla', 'Valencia',
    'Toledo', 'Valladolid', 'España', 'Francia', 'Italia', 'Portugal', 'Ebro', 'Tajo', 'Duero', 'Teide', 'Pirineos', 'Mallorca', 'Bilbao',
    'Segovia', 'Andrés', 'Irene', 'Mateo'];
  const FB_ADJ = ['grande', 'pequeño', 'rápido', 'lento', 'gordo', 'delgado', 'bonito', 'feo', 'limpio', 'sucio', 'contento', 'triste', 'fuerte', 'alegre', 'frío', 'largo', 'corto', 'ancho'];
  const FB_VERB = ['correr', 'saltar', 'cantar', 'comer', 'beber', 'dormir', 'leer', 'escribir', 'pintar', 'nadar', 'bailar', 'jugar'];
  const CL = memo(() => {
    const allNouns = LIB().nouns();
    const ns = new Set(allNouns.map((w) => w.w));
    let adjs = LIB().byCat('adjetivos').filter(plain);
    let verbs = LIB().byCat('verbos').filter(plain);
    const as = new Set(adjs.map((w) => w.w));
    const vs = new Set(verbs.map((w) => w.w));
    const nouns = allNouns.filter((w) => hasImg(w) && plain(w) && !as.has(w.w) && !vs.has(w.w));
    adjs = adjs.filter((w) => !ns.has(w.w) && !vs.has(w.w));
    verbs = verbs.filter((w) => !ns.has(w.w) && !as.has(w.w));
    if (adjs.length < 8) adjs = FB_ADJ.map((w) => ({ w }));
    if (verbs.length < 8) verbs = FB_VERB.map((w) => ({ w }));
    return { nouns, adjs, verbs };
  });
  const withImg = (ex, w) => { if (hasImg(w)) ex.img = w.img; return ex; };
  const CLASS_OPTS = { n: 'sustantivo', a: 'adjetivo', v: 'verbo' };
  const b61 = (rng) => {
    if (rng.chance(0.5)) {
      const w = pick(rng, CL().nouns);
      return { kind: 'choice', img: w.img, tokens: [w.w, ':', '__'], options: ['común', 'propio'], answer: 'común' };
    }
    return { kind: 'choice', tokens: [pick(rng, PROPER), ':', '__'], options: ['común', 'propio'], answer: 'propio' };
  };
  const classEx = (rng, kinds) => {
    const k = pick(rng, kinds);
    const c = CL();
    const w = pick(rng, k === 'n' ? c.nouns : k === 'a' ? c.adjs : c.verbs);
    const opts = kinds.map((x) => CLASS_OPTS[x]);
    return withImg({ kind: 'choice', tokens: [w.w, ':', '__'], options: opts, answer: CLASS_OPTS[k] }, w);
  };
  const b62 = (rng) => classEx(rng, ['n', 'a']);
  const b63 = (rng) => classEx(rng, ['n', 'a', 'v']);
  const b64 = (rng) => {
    const c = CL();
    const n = pick(rng, c.nouns);
    const adjs = c.adjs.filter((a) => !/(or|ón|án|ín|és)$/.test(a.w));
    const a = pick(rng, adjs);
    const form = n.g === 'f' && /o$/.test(a.w) ? a.w.slice(0, -1) + 'a' : a.w;
    const other = pick(rng, c.nouns.filter((x) => x.w !== n.w));
    const verb = pick(rng, c.verbs);
    return { kind: 'choice', img: n.img, tokens: ['¿Cómo es ' + art(n) + ' ' + n.w + '?', '__'], options: rng.shuffle([form, other.w, verb.w]), answer: form };
  };
  const b65 = (rng) => {
    const c = CL();
    let pool = c.verbs.filter(hasImg);
    if (pool.length < 4) pool = c.nouns;
    const seen = new Set();
    pool = pool.filter((w) => (seen.has(w.img) ? false : (seen.add(w.img), true)));
    const ch = rng.shuffle(pool).slice(0, rng.int(3, 4));
    const right = rng.shuffle(ch.map((w) => ({ t: w.w })));
    return { kind: 'match', left: ch.map((w) => ({ img: w.img })), right, answer: ch.map((w) => String(right.findIndex((r) => r.t === w.w))) };
  };
  const mix6 = [b61, b62, b63, b64];

  g.LENGUA_LEVELS.push({
    id: 6, name: 'Clases de palabras', age: '8 años',
    sublevels: [
      { id: '6.1', name: 'Nombres comunes y propios', layout: 'cols2', perSheet: 10, gen: b61 },
      { id: '6.2', name: 'Sustantivo o adjetivo', layout: 'cols2', perSheet: 10, gen: b62 },
      { id: '6.3', name: 'Sustantivo, adjetivo o verbo', layout: 'cols2', perSheet: 10, gen: b63 },
      { id: '6.4', name: 'El adjetivo acompaña al nombre', layout: 'wide', perSheet: 8, gen: b64 },
      { id: '6.5', name: 'Une cada verbo con su dibujo', layout: 'wide', perSheet: 3, gen: b65 },
      { id: '6.6', name: 'Repaso de clases de palabras', layout: 'wide', perSheet: 8, gen: (rng) => pick(rng, mix6)(rng) },
    ],
  });

  // ---------------------------------------------------------------- NIVEL 7
  // Cada palabra lleva el hueco entre corchetes; [-] significa "sin h".
  const BV_B = ['[b]arco', '[b]otella', '[b]ombero', '[b]urro', '[b]icicleta', '[b]andera', '[b]allena', '[b]añera', '[b]olsa', '[b]oca', '[b]ruja',
    '[b]alón', '[b]razo', '[b]onito', '[b]osque', 'sá[b]ado', 'ca[b]eza', 'ca[b]allo', 'lo[b]o', 'li[b]ro', 'to[b]illo', 'nu[b]e', 'cu[b]o',
    'ár[b]ol', 'ca[b]ra', 'ce[b]olla', '[b]ufanda', '[b]ocadillo', '[b]andeja', 'sá[b]ana'];
  const BV_V = ['[v]entana', '[v]estido', '[v]erde', '[v]entilador', '[v]olar', '[v]iento', '[v]ela', '[v]erano', '[v]iolín', '[v]olcán', '[v]ecino',
    '[v]isita', '[v]idrio', '[v]ida', '[v]iaje', '[v]ino', 'nue[v]e', 'lle[v]ar', 'cue[v]a', 'pa[v]o', 'o[v]eja', 'na[v]e', 'ni[v]el', 'no[v]ela',
    'jue[v]es', 'cuer[v]o', 'cla[v]o', 'lla[v]e', '[v]erdura'];
  const GJ_G = ['[g]igante', '[g]irasol', '[g]imnasia', '[g]enio', '[g]ente', '[g]emelo', '[g]elatina', 'ener[g]ía', 'ima[g]en', 'má[g]ico', 'pá[g]ina',
    'án[g]el', 'ori[g]en', 'co[g]er', 'prote[g]er', 'diri[g]ir', 'exi[g]ir', 'ele[g]ir', 'ur[g]ente', 'a[g]enda', 've[g]etal', '[g]eografía',
    '[g]eneral', 'in[g]eniero', '[g]imnasio', 'cole[g]io', 'vi[g]ilar'];
  const GJ_J = ['[j]ardín', '[j]abón', '[j]amón', '[j]uego', '[j]ugar', '[j]ersey', '[j]oven', '[j]efe', 'ca[j]a', 'o[j]o', 'bru[j]a', 'ore[j]a', 'abe[j]a',
    'cone[j]o', 'relo[j]', 'mu[j]er', 'via[j]e', 'gara[j]e', 'mensa[j]e', 'extran[j]ero', 'traba[j]o', 'naran[j]a', 'ca[j]ón', 'te[j]ado', 'mon[j]a',
    '[j]arra', 'nava[j]a'];
  const H_H = ['[h]ormiga', '[h]uevo', '[h]ueso', '[h]elado', '[h]oja', '[h]ermano', '[h]ospital', '[h]ombre', '[h]amburguesa', '[h]arina', '[h]ilo', '[h]ielo',
    '[h]istoria', '[h]umo', '[h]uerto', '[h]otel', '[h]erida', '[h]erramienta', '[h]ierba', '[h]acha', '[h]ambre', '[h]ijo', '[h]ipopótamo', '[h]ogar',
    '[h]orno', 'zana[h]oria', 'a[h]ora', 'bú[h]o', 'almo[h]ada', 'caca[h]uete', 'al[h]aja'];
  const H_N = ['[-]oso', '[-]uva', '[-]isla', '[-]ojo', '[-]abeja', '[-]avión', '[-]uña', '[-]oreja', '[-]arena', '[-]escuela', '[-]estrella', '[-]ardilla',
    '[-]azul', '[-]ocho', '[-]once', '[-]iglesia', '[-]invierno', '[-]elefante', '[-]árbol', '[-]escalera', '[-]avestruz', '[-]oveja', '[-]oliva',
    '[-]aceite', '[-]amigo', '[-]abuelo'];
  const LL_L = ['[ll]ave', '[ll]uvia', '[ll]ama', '[ll]amar', '[ll]orar', '[ll]eno', '[ll]egar', '[ll]evar', '[ll]anta', '[ll]ano', 'ca[ll]e', 'bri[ll]ar',
    'si[ll]a', 'ga[ll]ina', 'caba[ll]o', 'toa[ll]a', 'se[ll]o', 'pi[ll]ar', 'bo[ll]o', 'cebo[ll]a', 'ardi[ll]a', 'torti[ll]a', 'ca[ll]ar', 'vi[ll]a',
    'cepi[ll]o', 'estre[ll]a', 'mue[ll]e', 'cuchi[ll]o', 'ba[ll]ena', 'bi[ll]ete', 'ta[ll]er'];
  const LL_Y = ['[y]ate', '[y]ema', '[y]ogur', '[y]eso', '[y]egua', 'pla[y]a', 'pa[y]aso', 'jo[y]a', 'a[y]uda', 'a[y]er', 'le[y]enda', 'apo[y]o', 'le[y]',
    'ho[y]', 'mu[y]', 're[y]', 'bue[y]', 'in[y]ección', 'ba[y]eta', '[y]oga', 'cu[y]o', 'ma[y]or', 'co[y]ote', 'ma[y]oría', 'a[y]uno', 'ra[y]uela'];
  const XS_X = ['e[x]amen', 'ta[x]i', 'e[x]celente', 'e[x]tra', 'e[x]cursión', 'e[x]plicar', 'e[x]tranjero', 'e[x]perto', 'e[x]istir', 'bo[x]eo', 'fle[x]ible',
    'má[x]imo', 'e[x]traño', 'e[x]ploradora', 'e[x]tintor', 'e[x]perimento', 'e[x]tender', 'e[x]terior', 'é[x]ito', 'e[x]tremo', 'tó[x]ico',
    'e[x]actamente', 'e[x]cepto', 'e[x]plosión', 'e[x]pedición'];
  const XS_S = ['e[s]tación', 'e[s]trella', 'e[s]cuela', 'e[s]pejo', 'e[s]tuche', 'e[s]tudiar', 'e[s]caleras', 'e[s]tómago', 'e[s]palda', 'e[s]pañol',
    'e[s]pacio', 'e[s]tufa', 'e[s]tanque', 'e[s]quina', 'e[s]cribir', 'e[s]tadio', 'e[s]pecial', 'e[s]perar', 'e[s]coba', 'e[s]cuchar', 'e[s]tatua',
    'e[s]trecho', 'e[s]pinacas', 'e[s]tirar', 'e[s]tilo', 'e[s]pada', 'e[s]queleto', 'e[s]cudo', 'e[s]pectáculo'];
  const MP = ['ca[mp]o', 'ca[mp]ana', 'la[mp]ara', 'tie[mp]o', 'sie[mp]re', 'ro[mp]er', 'e[mp]ezar', 'e[mp]ujar', 'co[mp]rar', 'ca[mp]eón', 'i[mp]ortante',
    'e[mp]anada', 'eje[mp]lo', 'si[mp]le', 'te[mp]rano', 'co[mp]añero', 'co[mp]leto', 'e[mp]resa', 'te[mp]estad', 'tra[mp]olín', 'cu[mp]leaños',
    'li[mp]io', 'co[mp]ás', 'co[mp]ota', 'te[mp]eratura'];
  const MB = ['so[mb]rero', 'ho[mb]re', 'ho[mb]ro', 'ca[mb]iar', 'bo[mb]ero', 'bo[mb]illa', 'ta[mb]or', 'ca[mb]io', 'co[mb]inar', 'alfo[mb]ra', 'so[mb]ra',
    'bo[mb]a', 'co[mb]atir', 'a[mb]os', 'ti[mb]re', 'ala[mb]re', 'te[mb]lar', 'ha[mb]re', 'ro[mb]o', 'no[mb]re', 'a[mb]ulancia', 'co[mb]ustible',
    'ga[mb]as', 'cu[mb]re', 'lo[mb]riz', 'e[mb]udo', 'a[mb]iente', 'se[mb]rar'];
  const R_1 = ['[r]atón', '[r]opa', '[r]ueda', '[r]eloj', '[r]ey', '[r]osa', '[r]ío', '[r]egalo', '[r]ojo', '[r]ana', '[r]aqueta', 'hon[r]a', 'al[r]ededor',
    'en[r]edar', 'pa[r]ada', 'ma[r]iposa', 'ce[r]ebro', 'mi[r]ar', 'ca[r]amelo', 'to[r]o', 'ba[r]ato', 'vi[r]ar', 'a[r]ena', 'co[r]azón', 'dine[r]o',
    'pi[r]ata', 'camare[r]o'];
  const R_2 = ['ca[rr]etera', 'to[rr]e', 'guita[rr]a', 'go[rr]ión', 'co[rr]er', 'ba[rr]er', 'ce[rr]ar', 'te[rr]or', 'bo[rr]ar', 'bo[rr]ador', 'a[rr]oz',
    'a[rr]iba', 'a[rr]astrar', 'pa[rr]oquia', 'ho[rr]ible', 'se[rr]ucho', 'na[rr]ar', 'a[rr]ancar', 'a[rr]eglar', 'e[rr]or', 'sie[rr]a', 'piza[rr]a',
    'tie[rr]a', 'gue[rr]a', 'to[rr]ente', 'bo[rr]ego', 'ciga[rr]o', 'ca[rr]era'];

  const IMGBY = memo(() => {
    const m = new Map();
    LIB().words(hasImg).forEach((w) => { if (!m.has(w.w)) m.set(w.w, w.img); });
    return m;
  });
  function spell(rng, entry, opts) {
    const m = /^(.*?)\[(.+?)\](.*)$/.exec(entry);
    const pre = m[1], mid = m[2], post = m[3];
    const answer = mid === '-' ? 'sin h' : mid;
    const word = pre + (mid === '-' ? '' : mid) + post;
    const ex = { kind: 'choice', tokens: [pre, '__', post].filter((s) => s !== ''), options: opts.slice(), answer };
    const im = IMGBY().get(word);
    if (im) ex.img = im;
    return ex;
  }
  const spellGen = (opts, ...groups) => (rng) => spell(rng, pick(rng, pick(rng, groups)), opts);
  const T7 = {
    bv: spellGen(['b', 'v'], BV_B, BV_V),
    gj: spellGen(['g', 'j'], GJ_G, GJ_J),
    h: spellGen(['h', 'sin h'], H_H, H_N),
    lly: spellGen(['ll', 'y'], LL_L, LL_Y),
    xs: spellGen(['x', 's'], XS_X, XS_S),
    mpmb: spellGen(['mp', 'mb'], MP, MB),
    rrr: spellGen(['r', 'rr'], R_1, R_2),
  };
  const mix7 = Object.keys(T7).map((k) => T7[k]);

  g.LENGUA_LEVELS.push({
    id: 7, name: 'Ortografía: b/v, g/j, h, ll/y', age: '8-9 años',
    sublevels: [
      { id: '7.1', name: 'B o V', layout: 'cols2', perSheet: 10, gen: T7.bv },
      { id: '7.2', name: 'G o J', layout: 'cols2', perSheet: 10, gen: T7.gj },
      { id: '7.3', name: 'Con H o sin H', layout: 'cols2', perSheet: 10, gen: T7.h },
      { id: '7.4', name: 'LL o Y', layout: 'cols2', perSheet: 10, gen: T7.lly },
      { id: '7.5', name: 'X o S', layout: 'cols2', perSheet: 10, gen: T7.xs },
      { id: '7.6', name: 'MP o MB', layout: 'cols2', perSheet: 10, gen: T7.mpmb },
      { id: '7.7', name: 'R o RR', layout: 'cols2', perSheet: 10, gen: T7.rrr },
      { id: '7.8', name: 'Repaso de ortografía', layout: 'cols2', perSheet: 10, gen: (rng) => pick(rng, mix7)(rng) },
    ],
  });

  // ---------------------------------------------------------------- NIVEL 8
  // Palabras propias revisadas: la sílaba tónica va marcada con ^.
  const OWN_RAW = [
    // agudas
    'ca-^mión', 'ra-^tón', 'ba-^lón', 'pa-^pel', 're-^loj', 'can-^tar', 'ju-^gar', 'co-^mer', 'vi-^vir', 'so-^fá', 'ma-^má', 'pa-^pá', 'ca-^fé',
    'be-^bé', 'jar-^dín', 'del-^fín', 'pas-^tel', 'co-^lor', 'co-^llar', 'can-^ción', 'co-ra-^zón', 'me-^lón', 'li-^món', 'sa-^lón', 'a-^vión',
    'la-^drón', 'es-ta-^ción', 'ja-^món', 'es-pa-^ñol', 'hos-pi-^tal', 'a-ni-^mal', 'a-^zul', 'pan-ta-^lón', 'ca-ma-^rón', 'bal-^cón', 'bo-^tón',
    'cal-ce-^tín', 'tam-^bor', 'sa-^bor', 'do-^lor', 'a-^mor', 'es-co-^ger',
    // llanas
    '^ca-sa', '^me-sa', 'za-^pa-to', 'ven-^ta-na', '^li-bro', 'ca-mi-^se-ta', '^lá-piz', '^ár-bol', '^fá-cil', 'di-^fí-cil', 'a-^zú-car', '^cár-cel',
    '^mó-vil', '^cés-ped', '^már-mol', '^án-gel', '^á-gil', '^ú-til', '^dé-bil', '^ál-bum', '^crá-ter', 'ca-^rác-ter', 'ca-^dá-ver', '^más-til',
    '^ti-gre', 'ma-ri-^po-sa', 'cua-^der-no', 'ar-^ma-rio',
    // esdrújulas
    'te-^lé-fo-no', '^sá-ba-do', '^mé-di-co', '^mú-si-ca', '^pá-ja-ro', '^plá-ta-no', '^nú-me-ro', 'mur-^cié-la-go', '^cá-ma-ra', '^lám-pa-ra',
    '^pá-gi-na', '^má-qui-na', '^pé-ta-lo', '^cán-ta-ro', '^cír-cu-lo', '^trián-gu-lo', '^fós-fo-ro', '^brú-ju-la', 'bo-^lí-gra-fo', '^sí-la-ba',
    '^úl-ti-mo', '^pú-bli-co', 'o-^cé-a-no', 've-^hí-cu-lo', '^lá-gri-ma', '^más-ca-ra', '^có-mo-do', '^rá-pi-do', '^tí-mi-do', 'fan-^tás-ti-co',
    '^má-gi-co', 'e-^léc-tri-co', 'pi-^rá-mi-de', 'ma-te-^má-ti-cas', '^ár-bo-les', '^án-ge-les', 'rec-^tán-gu-lo',
  ];
  const parseOwn = (s) => {
    const parts = s.split('-');
    const t = parts.findIndex((p) => p[0] === '^');
    const syl = parts.map((p) => p.replace('^', ''));
    return { w: syl.join(''), syl, t };
  };
  const ENDS_VNS = (w) => /[aeiouns]$/.test(strip(w));
  const clsOf = (e) => ['aguda', 'llana', 'esdrújula'][e.syl.length - 1 - e.t];
  const hasTilde = (w) => /[áéíóú]/.test(w);
  const groupCount = (w) => {
    const V = 'aeiouáéíóúü', S = 'aeoáéó';
    let n = 0, prev = null;
    for (let i = 0; i < w.length; i++) {
      const c = w[i];
      let v = V.includes(c);
      if (v && c === 'u' && i > 0 && w[i - 1] === 'q') v = false;
      if (v && c === 'u' && i > 0 && w[i - 1] === 'g' && 'eiéí'.includes(w[i + 1] || '#')) v = false;
      if (!v) { prev = null; continue; }
      if (prev === null) n++;
      else if ((S.includes(prev) && S.includes(c)) || 'íú'.includes(prev) || 'íú'.includes(c)) n++;
      prev = c;
    }
    return n;
  };
  const POOL = memo(() => {
    const map = new Map();
    LIB().words((w) => Array.isArray(w.syl) && Number.isInteger(w.t) && plain(w)).forEach((w) => map.set(w.w, { w: w.w, syl: w.syl, t: w.t }));
    OWN_RAW.map(parseOwn).forEach((e) => map.set(e.w, e));
    const out = [];
    map.forEach((e) => {
      if (e.syl.join('') !== e.w || !/^[a-záéíóúüñ]+$/.test(e.w) || e.t < 0 || e.t >= e.syl.length) return;
      if (groupCount(e.w) !== e.syl.length) return;
      const im = IMGBY().get(e.w);
      if (im) e.img = im;
      if (e.syl.length === 1) { e.cls = null; out.push(e); return; }
      const cls = clsOf(e);
      if (!cls) return;
      const tl = hasTilde(e.w);
      const exp = cls === 'esdrújula' || (cls === 'aguda' ? ENDS_VNS(e.w) : !ENDS_VNS(e.w));
      if (tl !== exp) return;
      if (tl && !(hasTilde(e.syl[e.t]) && e.syl.every((s, i) => i === e.t || !hasTilde(s)))) return;
      e.cls = cls; e.tilde = tl;
      out.push(e);
    });
    return out;
  });
  const multi = memo(() => POOL().filter((e) => e.syl.length >= 2));
  const byClass = (rng, arr) => {
    const cs = ['aguda', 'llana', 'esdrújula'].filter((c) => arr.some((e) => e.cls === c));
    const c = pick(rng, cs);
    return pick(rng, arr.filter((e) => e.cls === c));
  };
  const imgOf = (ex, e) => { if (e.img) ex.img = e.img; return ex; };

  const b81 = (rng) => {
    const e = pick(rng, POOL().filter((x) => x.syl.length <= 5));
    const n = e.syl.length;
    const set = new Set([n]);
    const others = rng.shuffle([1, 2, 3, 4, 5].filter((x) => x !== n));
    set.add(others[0]); set.add(others[1]);
    const opts = Array.from(set).sort((a, b) => a - b).map(String);
    return imgOf({ kind: 'choice', tokens: [e.w, ':', '__'], options: opts, answer: String(n) }, e);
  };
  const b82 = (rng) => {
    const e = pick(rng, multi().filter((x) => x.syl.length <= 4 && new Set(x.syl).size === x.syl.length));
    return imgOf({ kind: 'choice', tokens: [e.syl.join('-'), 'sílaba tónica:', '__'], options: e.syl.slice(), answer: e.syl[e.t] }, e);
  };
  const b83 = (rng) => {
    const e = byClass(rng, multi());
    return imgOf({ kind: 'choice', tokens: [e.syl.join('-'), ':', '__'], options: ['aguda', 'llana', 'esdrújula'], answer: e.cls }, e);
  };
  const b84 = (rng) => {
    const want = rng.chance(0.5);
    const e = byClass(rng, multi().filter((x) => x.tilde === want));
    return { kind: 'choice', tokens: [strip(e.w) + ' (' + e.cls + ')', '¿Lleva tilde?', '__'], options: ['sí', 'no'], answer: want ? 'sí' : 'no' };
  };
  const ACC_OF = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' };
  const accentSyl = (s) => {
    let i = s.search(/[aeo]/);
    if (i < 0) for (let k = s.length - 1; k >= 0; k--) if ('iu'.includes(s[k])) { i = k; break; }
    if (i < 0) return null;
    return s.slice(0, i) + ACC_OF[s[i]] + s.slice(i + 1);
  };
  const b85 = (rng) => {
    for (let tries = 0; tries < 50; tries++) {
      const e = byClass(rng, multi());
      const base = e.syl.map(strip);
      const cand = (i) => { const a = accentSyl(base[i]); return a === null ? null : base.map((s, k) => (k === i ? a : s)).join(''); };
      if (e.tilde && cand(e.t) !== e.w) continue;
      const wrong = new Set();
      wrong.add(e.tilde ? base.join('') : cand(e.t));
      for (let i = 0; i < base.length; i++) if (i !== e.t) wrong.add(cand(i));
      wrong.delete(null); wrong.delete(e.w);
      const ws = Array.from(wrong);
      if (ws.length < 2) continue;
      const opts = rng.shuffle([e.w].concat(rng.shuffle(ws).slice(0, 2)));
      return imgOf({ kind: 'choice', tokens: ['(' + e.cls + ')', '__'], options: opts, answer: e.w }, e);
    }
    throw new Error('b85 sin ejercicio');
  };
  const mix8 = [b81, b82, b83, b84, b85];

  g.LENGUA_LEVELS.push({
    id: 8, name: 'Acentuación', age: '9 años',
    sublevels: [
      { id: '8.1', name: 'Contar sílabas', layout: 'cols2', perSheet: 10, gen: b81 },
      { id: '8.2', name: 'La sílaba tónica', layout: 'wide', perSheet: 8, gen: b82 },
      { id: '8.3', name: 'Agudas, llanas y esdrújulas', layout: 'cols2', perSheet: 10, gen: b83 },
      { id: '8.4', name: '¿Lleva tilde?', layout: 'wide', perSheet: 8, gen: b84 },
      { id: '8.5', name: 'Pon la tilde', layout: 'wide', perSheet: 8, gen: b85 },
      { id: '8.6', name: 'Repaso de acentuación', layout: 'wide', perSheet: 8, gen: (rng) => pick(rng, mix8)(rng) },
    ],
  });

  g.LENGUA_5_8_DATA = { OWN_RAW };
})(typeof window !== 'undefined' ? window : globalThis);
