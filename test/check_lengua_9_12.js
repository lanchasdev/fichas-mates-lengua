// Test de los niveles de lengua 9 a 12. Valida con datos propios (no reutiliza la lógica del gen).
require('../js/rng.js'); require('../js/lengua/words.js'); require('../js/lengua/images.js'); require('../js/lengua/lib.js');
const before = LENGUA_LEVELS.length;
require('../levels/lengua/lengua_9_12.js');
const LV = LENGUA_LEVELS.slice(before);

let fails = 0;
const bad = (id, m, ex) => { if (fails++ < 40) console.log('FALLO', id, m, JSON.stringify(ex).slice(0, 400)); };
const lc = (s) => s.toLowerCase();
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const W = LENGUA_WORDS;
const bankBy = (f) => W.filter(f);
const wordsOf = (s) => s.replace(/[«»¿?¡!.,]/g, ' ').split(/\s+/).filter(Boolean);

// ---------- verbos: paradigmas propios ----------
const REG = ('cantar saltar bailar mirar pintar nadar lavar comprar ayudar estudiar caminar dibujar cocinar limpiar escuchar cortar trabajar llevar esperar ' +
  'trepar pasear montar planchar ordenar saludar llorar gritar mojar llenar soplar mezclar empujar llamar bajar peinar besar ' +
  'comer beber correr aprender vender barrer responder romper coser comprender temer ' +
  'vivir escribir subir abrir partir decidir recibir repartir descubrir unir aplaudir').split(' ');
const PARA = {
  ar: { pres: ['o', 'as', 'a', 'amos', 'an'], pret: ['é', 'aste', 'ó', 'amos', 'aron'] },
  er: { pres: ['o', 'es', 'e', 'emos', 'en'], pret: ['í', 'iste', 'ió', 'imos', 'ieron'] },
  ir: { pres: ['o', 'es', 'e', 'imos', 'en'], pret: ['í', 'iste', 'ió', 'imos', 'ieron'] },
};
const FUT = ['é', 'ás', 'á', 'emos', 'án'];
const FORMS = {};
const INDEX = new Map(); // forma -> [{inf,tense,p}]
for (const inf of REG) {
  const c = inf.slice(-2), st = inf.slice(0, -2);
  if (!/(ar|er|ir)$/.test(inf) || /(car|gar|zar|guar|ger|gir|cer|cir|uir|eer)$/.test(inf)) throw new Error('verbo no regular ' + inf);
  FORMS[inf] = { pres: PARA[c].pres.map((e) => st + e), pret: PARA[c].pret.map((e) => st + e), fut: FUT.map((e) => inf + e) };
  for (const t of ['pres', 'pret', 'fut']) FORMS[inf][t].forEach((f, p) => { if (!INDEX.has(f)) INDEX.set(f, []); INDEX.get(f).push({ inf, tense: t, p }); });
}
// comprobación de paradigmas completos escritos a mano
const HAND = {
  cantar: { pres: 'canto cantas canta cantamos cantan', pret: 'canté cantaste cantó cantamos cantaron', fut: 'cantaré cantarás cantará cantaremos cantarán' },
  comer: { pres: 'como comes come comemos comen', pret: 'comí comiste comió comimos comieron', fut: 'comeré comerás comerá comeremos comerán' },
  vivir: { pres: 'vivo vives vive vivimos viven', pret: 'viví viviste vivió vivimos vivieron', fut: 'viviré vivirás vivirá viviremos vivirán' },
};
for (const k in HAND) for (const t in HAND[k]) if (HAND[k][t] !== FORMS[k][t].join(' ')) throw new Error('paradigma ' + k + t);
const isForm = (w) => INDEX.has(lc(w));
const PLURAL_START = /^(Los|Las|Mis|Ellos|Ellas)\b/;
function personOf(subj) {
  const s = subj.trim();
  if (/^(Yo|yo)$/.test(s)) return 0;
  if (/^(Tú|tú)$/.test(s)) return 1;
  if (/^(Nosotros|Nosotras|nosotros|nosotras)$/.test(s)) return 3;
  if (PLURAL_START.test(s) || /^(los|las|mis|ellos|ellas)\b/.test(s)) return 4;
  return 2;
}
const PAST_M = ['ayer', 'anoche', 'el año pasado', 'hace un rato', 'el lunes pasado'];
const PRES_M = ['ahora', 'hoy', 'ahora mismo', 'cada día'];
const FUT_M = ['mañana', 'esta noche', 'el próximo lunes', 'pronto', 'el año que viene'];

// ---------- datos propios de vocabulario ----------
const ROOTS = ['mar', 'pan', 'flor', 'libr', 'pesc', 'dent', 'zapat', 'lech', 'frut', 'jard', 'cant', 'cas', 'agu', 'sol', 'pel'];
const rootsOf = (w) => ROOTS.filter((r) => lc(w).includes(r));
const SYNT = 'bonito=hermoso rápido=veloz feliz=contento pequeño=diminuto grande=enorme casa=hogar coche=automóvil miedo=temor cansado=agotado listo=inteligente enfadado=furioso empezar=comenzar terminar=acabar hablar=conversar mirar=observar andar=caminar regalo=obsequio cerca=próximo fácil=sencillo difícil=complicado tranquilo=sereno'.split(' ').map((s) => s.split('='));
const synOf = (w) => { const r = []; SYNT.forEach((p) => { if (p[0] === w) r.push(p[1]); if (p[1] === w) r.push(p[0]); }); return r; };
const DIMT = { gato: 'gatito', perro: 'perrito', casa: 'casita', libro: 'librito', mesa: 'mesita', pelota: 'pelotita', pájaro: 'pajarito', mano: 'manita', ojo: 'ojito', cuchara: 'cucharita', silla: 'sillita', coche: 'cochecito', árbol: 'arbolito', bolsa: 'bolsita', cama: 'camita', vaso: 'vasito', plato: 'platito', ventana: 'ventanilla', campana: 'campanilla', flor: 'florecilla', pan: 'panecillo', ratón: 'ratoncillo' };
const AUMT = { casa: 'casona', perro: 'perrazo', gato: 'gatazo', mano: 'manaza', boca: 'bocaza', cuchara: 'cucharón', silla: 'sillón', botella: 'botellón', hombre: 'hombrón', mujer: 'mujerona', golpe: 'golpazo', ojo: 'ojazo' };
const PROPER = ['Lucía', 'Pablo', 'Marta', 'Hugo', 'Sara', 'Daniel', 'Elena', 'Álvaro', 'Madrid', 'Sevilla', 'Valencia', 'Bilbao', 'Granada', 'Toledo', 'Cádiz', 'Zaragoza', 'Salamanca', 'España', 'Francia', 'Italia', 'Portugal', 'México', 'Argentina', 'Alemania'];

// contaminación cruzada de raíces (datos del test sobre las familias: sacadas del gen vía salida)
// ---------- comprobaciones genéricas ----------
function checkGeneric(id, ex, spec) {
  if (!ex || typeof ex !== 'object') return bad(id, 'no es objeto', ex);
  if (!spec.kinds.includes(ex.kind)) bad(id, 'kind ' + ex.kind, ex);
  const js = JSON.stringify(ex);
  for (const ch of js) if (ch.charCodeAt(0) > 255) { bad(id, 'caracter no Latin-1 ' + ch, ex); break; }
  const imgs = [];
  if (ex.img) imgs.push(ex.img);
  (ex.left || []).concat(ex.right || []).forEach((it) => { if (it.img) imgs.push(it.img); });
  imgs.forEach((k) => { if (!LENGUA_IMGS[k]) bad(id, 'imagen inexistente ' + k, ex); });
  const ans = ex.answer;
  const okS = (a) => typeof a === 'string' && a.length > 0;
  if (ex.kind !== 'reading') {
    if (!(okS(ans) || (Array.isArray(ans) && ans.length && ans.every(okS)))) bad(id, 'answer no string', ex);
  }
  if (ex.tokens) ex.tokens.forEach((t) => { if (!(typeof t === 'string' || typeof t === 'number' || (t && typeof t.box === 'number'))) bad(id, 'token invalido', ex); });
  if (ex.kind === 'choice') {
    if (!Array.isArray(ex.options) || ex.options.length < 2 || ex.options.length > 4) bad(id, 'options nº', ex);
    else {
      if (new Set(ex.options.map(lc)).size !== ex.options.length && !spec.caseOpts) bad(id, 'options repetidas', ex);
      if (new Set(ex.options).size !== ex.options.length) bad(id, 'options repetidas', ex);
      if (!ex.options.includes(ans)) bad(id, 'answer fuera de options', ex);
      if (ex.options.some((o) => typeof o !== 'string' || o.length > 24)) bad(id, 'option larga', ex);
    }
    if (ex.tokens && ex.tokens.some((t) => t === '__') && ex.tokens.filter((t) => t === '__').length !== 1) bad(id, 'huecos', ex);
  }
  if (ex.kind === 'match') {
    const n = ex.left.length;
    if (n < 3 || n > 5 || ex.right.length !== n || ex.answer.length !== n) bad(id, 'match tamaño', ex);
    if (new Set(imgs).size !== imgs.length) bad(id, 'imagen repetida en match', ex);
    if (new Set(ex.answer).size !== n || ex.answer.some((a) => !(+a >= 0 && +a < n))) bad(id, 'match answer', ex);
    const rt = ex.right.map((r) => r.t);
    if (new Set(rt).size !== n) bad(id, 'right repetido', ex);
  }
  if (ex.kind === 'pic') {
    if (!ex.img) bad(id, 'pic sin img', ex);
    const boxes = ex.tokens.filter((t) => t === '__' || (t && t.box)).length;
    if (boxes !== (Array.isArray(ans) ? ans.length : 1)) bad(id, 'huecos/answer', ex);
  }
}

// ---------- validadores por tipo ----------
const V = {};
V.fam = (id, ex) => {
  const m = /^Familia de «(.+)»:$/.exec(ex.tokens[0]); if (!m) return bad(id, 'fam label', ex);
  const cue = m[1], rc = rootsOf(cue);
  if (rc.length !== 1) return bad(id, 'raiz cue', ex);
  ex.options.forEach((o) => { if (rootsOf(o).length !== 1) bad(id, 'raiz opcion ' + o, ex); });
  if (rootsOf(ex.answer)[0] !== rc[0] || ex.answer === cue) bad(id, 'respuesta no es de la familia', ex);
  ex.options.filter((o) => o !== ex.answer).forEach((o) => { if (rootsOf(o)[0] === rc[0]) bad(id, 'distractor de la misma familia', ex); });
};
V.syn = (id, ex) => {
  ex.left.forEach((l, i) => {
    const r = ex.right[+ex.answer[i]].t;
    if (!synOf(l.t).includes(r)) bad(id, 'no sinonimos ' + l.t + '/' + r, ex);
    ex.right.forEach((o, j) => { if (j !== +ex.answer[i] && synOf(l.t).includes(o.t)) bad(id, 'sinonimo ambiguo', ex); });
  });
};
V.ant = (id, ex) => {
  ex.left.forEach((l, i) => {
    const adj = bankBy((w) => w.cat === 'adjetivos' && w.img === l.img)[0];
    if (!adj) return bad(id, 'adjetivo no encontrado', ex);
    if (ex.right[+ex.answer[i]].t !== adj.ant) bad(id, 'antonimo erroneo', ex);
  });
  // ambiguedad: ningun par (a,b) distinto debe ser antonimo cruzado
  const adjs = ex.left.map((l) => bankBy((w) => w.cat === 'adjetivos' && w.img === l.img)[0]);
  const ants = adjs.map((a) => a.ant);
  if (new Set(ants).size !== ants.length) bad(id, 'ant repetidos', ex);
  const size = ['grande', 'pequeño', 'alto', 'bajo', 'largo', 'corto', 'ancho', 'estrecho', 'gordo', 'delgado'];
  if (adjs.filter((a) => size.includes(a.w)).length > 1) bad(id, 'varios de tamano', ex);
  if (adjs.some((a) => ['contento', 'enfadado'].includes(a.w))) bad(id, 'ant ambiguo feliz/contento', ex);
};
V.dim = V.aum = (id, ex) => {
  const m = /^(Diminutivo|Aumentativo) de «(.+)»:$/.exec(ex.tokens[0]); if (!m) return bad(id, 'label der', ex);
  const T = m[1] === 'Diminutivo' ? DIMT : AUMT, base = m[2];
  if (T[base] !== ex.answer) bad(id, 'derivado erroneo', ex);
  if (ex.options.length !== 4) bad(id, 'opciones != 4', ex);
  ex.options.filter((o) => o !== ex.answer).forEach((o) => { if (DIMT[base] === o || AUMT[base] === o) bad(id, 'distractor derivado de la misma base', ex); if (!Object.values(DIMT).includes(o) && !Object.values(AUMT).includes(o)) bad(id, 'distractor desconocido', ex); });
  if (ex.img) { const b = bankBy((w) => w.w === base && w.img === ex.img); if (!b.length) bad(id, 'img no es de la base', ex); }
};
V.field = (id, ex) => {
  if (ex.options.length !== 4) return bad(id, 'campo 4 opciones', ex);
  const cats = ['animales', 'frutas', 'ropa', 'cuerpo', 'transporte', 'profesiones', 'naturaleza', 'casa'];
  const inCat = (c, w) => bankBy((x) => x.cat === c && x.w === w).length > 0;
  const good = cats.filter((c) => ex.options.filter((o) => inCat(c, o)).length === 3 && !inCat(c, ex.answer));
  if (good.length !== 1) bad(id, 'campo semantico no cuadra', ex);
  const others = ex.options.filter((o) => o !== ex.answer);
  if (good[0] && !others.every((o) => inCat(good[0], o))) bad(id, 'campo: no todos del grupo', ex);
};
V.synC = (id, ex) => {
  const m = /^Sinónimo de «(.+)»:$/.exec(ex.tokens[0]); if (!m) return bad(id, 'syn label', ex);
  if (!synOf(m[1]).includes(ex.answer)) bad(id, 'sinonimo erroneo', ex);
  ex.options.filter((o) => o !== ex.answer).forEach((o) => { if (synOf(m[1]).includes(o) || o === m[1]) bad(id, 'distractor sinonimo', ex); });
};
V.antC = (id, ex) => {
  const m = /^Antónimo de «(.+)»:$/.exec(ex.tokens[0]); if (!m) return bad(id, 'ant label', ex);
  const adj = bankBy((w) => w.cat === 'adjetivos' && w.w === m[1])[0];
  if (!adj || adj.ant !== ex.answer || adj.img !== ex.img) bad(id, 'antonimo erroneo', ex);
  ex.options.filter((o) => o !== ex.answer).forEach((o) => { if (o === m[1]) bad(id, 'distractor = palabra', ex); });
};
const sentOf = (tok) => tok.replace(/^«|»$/g, '');
V.verbRec = (id, ex) => {
  const s = sentOf(ex.tokens[1]), ws = wordsOf(s);
  if (!isForm(ex.answer)) bad(id, 'respuesta no es verbo', ex);
  if (ws.filter(isForm).length !== 1) bad(id, 'frase con 0 o varios verbos', ex);
  const ent = INDEX.get(lc(ex.answer)) || [];
  if (!ent.some((e) => e.tense === 'pres' && (e.p === 2 || e.p === 4))) bad(id, 'no es presente 3a', ex);
  ex.options.forEach((o) => { if (!ws.map(lc).includes(lc(o))) bad(id, 'opcion fuera de la frase ' + o, ex); if (o !== ex.answer && isForm(o)) bad(id, 'otro verbo en options', ex); });
};
V.tiempo = (id, ex) => {
  const s = sentOf(ex.tokens[1]), ws = wordsOf(s), vs = ws.filter(isForm);
  if (vs.length !== 1) return bad(id, 'frase con 0 o varios verbos', ex);
  const ent = INDEX.get(lc(vs[0]));
  const ts = new Set(ent.map((e) => e.tense));
  if (ts.size !== 1) return bad(id, 'tiempo ambiguo', ex);
  const t = [...ts][0], name = { pret: 'pasado', pres: 'presente', fut: 'futuro' }[t];
  if (ex.answer !== name) bad(id, 'tiempo erroneo', ex);
  const low = lc(s);
  const inM = (arr) => arr.some((m) => low.startsWith(m + ',') || low.startsWith(m + ' '));
  if (inM(PAST_M) && t !== 'pret') bad(id, 'marcador pasado inconsistente', ex);
  if (inM(FUT_M) && t !== 'fut') bad(id, 'marcador futuro inconsistente', ex);
  if (inM(PRES_M) && t !== 'pres') bad(id, 'marcador presente inconsistente', ex);
  if (JSON.stringify(ex.options) !== JSON.stringify(['pasado', 'presente', 'futuro'])) bad(id, 'opciones tiempo', ex);
};
const tenseOfTheme = { '10.3': 'pres', '10.4': 'pret', '10.5': 'fut' };
V.conjPic = (id, ex, theme) => {
  const t = tenseOfTheme[theme];
  const inf = /^\((\w+)\)$/.exec(ex.tokens[ex.tokens.length - 1]); if (!inf) return bad(id, 'sin infinitivo', ex);
  if (!FORMS[inf[1]]) return bad(id, 'verbo no regular ' + inf[1], ex);
  const b = bankBy((w) => w.cat === 'verbos' && w.w === inf[1] && w.img === ex.img);
  if (!b.length) bad(id, 'imagen no es del verbo', ex);
  const mark = t === 'pres' ? null : (t === 'pret' ? 'Ayer' : 'Mañana');
  const idx = mark ? 1 : 0;
  if (mark && ex.tokens[0] !== mark) bad(id, 'marcador', ex);
  const p = personOf(ex.tokens[idx]);
  if (FORMS[inf[1]][t][p] !== ex.answer) bad(id, 'forma erronea', ex);
};
V.concord = (id, ex) => {
  const h = ex.tokens.indexOf('__');
  const mark = /^(Ayer|Mañana),$/.exec(ex.tokens[0]);
  const t = mark ? (mark[1] === 'Ayer' ? 'pret' : 'fut') : 'pres';
  const p = personOf(ex.tokens[h - 1]);
  const ent = (INDEX.get(ex.answer) || []).filter((e) => e.tense === t && e.p === p);
  if (ent.length !== 1) return bad(id, 'respuesta no concuerda', ex);
  const inf = ent[0].inf;
  const seen = new Set();
  ex.options.forEach((o) => {
    const e = (INDEX.get(o) || []).filter((x) => x.inf === inf && x.tense === t);
    if (!e.length) return bad(id, 'opcion no es forma del verbo ' + o, ex);
    if (o !== ex.answer && e.some((x) => x.p === p)) bad(id, 'opcion tambien concuerda', ex);
    if (seen.has(o)) bad(id, 'dup', ex); seen.add(o);
  });
  const comp = ex.tokens[h + 1];
  if (p < 2 || p === 3) { if (/\bsus?\b/.test(comp)) bad(id, 'posesivo con 1a/2a persona', ex); }
};
V.conjC = (id, ex) => {
  const mk = /^(Hoy|Ayer|Mañana),$/.exec(ex.tokens[0]); if (!mk) return bad(id, 'marca', ex);
  const t = { Hoy: 'pres', Ayer: 'pret', 'Mañana': 'fut' }[mk[1]];
  const inf = /^\((\w+)\)$/.exec(ex.tokens[3]); if (!inf || !FORMS[inf[1]]) return bad(id, 'verbo', ex);
  const p = personOf(ex.tokens[1]);
  if (FORMS[inf[1]][t][p] !== ex.answer) bad(id, 'forma erronea', ex);
  ex.options.filter((o) => o !== ex.answer).forEach((o) => { if (FORMS[inf[1]][t].includes(o) && FORMS[inf[1]][t][p] === o) bad(id, 'dup', ex); if (o === ex.answer) bad(id, 'dup', ex); });
};
const wordsOnly = (s) => s.replace(/[«».]/g, '').split(' ');
V.order = (id, ex, theme) => {
  const toks = ex.tokens, n = toks.length;
  if (toks[n - 2] !== ':' || !toks[n - 1].box || toks[n - 1].box < 50) return bad(id, 'formato ordenar', ex);
  const sc = toks.slice(0, n - 2);
  if (sc.some((t) => typeof t !== 'string')) return bad(id, 'token no string', ex);
  const ans = ex.answer;
  if (!/\.$/.test(ans) || ans.length > 40) bad(id, 'respuesta larga/sin punto', ex);
  const aw = ans.split(' ');
  if (JSON.stringify(aw.slice().sort()) !== JSON.stringify(sc.slice().sort())) bad(id, 'palabras no coinciden', ex);
  if (JSON.stringify(aw) === JSON.stringify(sc)) bad(id, 'no desordenada', ex);
  if (new Set(aw.map(lc)).size !== aw.length) bad(id, 'palabras repetidas (ambiguo)', ex);
  if (aw.filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w)).length !== 1 || !/^[A-ZÁÉÍÓÚÑ]/.test(aw[0])) bad(id, 'mayusculas en frase', ex);
  const [lo, hi] = theme === '11.1' ? [3, 4] : [5, 6];
  if (aw.length < lo || aw.length > hi) bad(id, 'nº palabras ' + aw.length, ex);
  const vs = aw.filter(isForm);
  if (vs.length !== 1) bad(id, 'verbos en frase ordenar', ex);
  const vi = aw.findIndex(isForm);
  if (vi < 1 || vi > 2) bad(id, 'posicion del verbo', ex);
  // orden rigido: el sujeto va delante; el complemento no puede empezar igual que el sujeto
  if (lc(aw[0]) === lc(aw[vi + 1])) bad(id, 'sujeto/complemento ambiguos', ex);
  if (theme === '11.1' && aw.length - vi - 1 !== 1) bad(id, 'complemento no es de 1 palabra', ex);
  if (theme === '11.2' && aw.length - vi - 1 < 2) bad(id, 'complemento corto', ex);
};
V.sujpred = (id, ex) => {
  const lab = ex.tokens[0], s = sentOf(ex.tokens[1]);
  if (!/^(Sujeto|Predicado) de:$/.test(lab)) return bad(id, 'label', ex);
  const aw = s.replace(/\.$/, '').split(' '), vi = aw.findIndex(isForm);
  if (aw.filter(isForm).length !== 1 || vi < 1) return bad(id, 'verbo', ex);
  const subj = aw.slice(0, vi).join(' '), pred = aw.slice(vi).join(' ');
  const exp = lab === 'Sujeto de:' ? subj : pred;
  if (ex.answer !== exp) bad(id, 'sujeto/predicado erroneo', ex);
  if (ex.options.length !== 4) bad(id, 'opciones != 4', ex);
  ex.options.filter((o) => o !== ex.answer).forEach((o) => { if (o === exp) bad(id, 'distractor correcto', ex); });
};
V.clase = (id, ex) => {
  if (ex.tokens[0] !== 'Esta oración es:') return bad(id, 'label', ex);
  const s = sentOf(ex.tokens[1]);
  let c;
  if (/^¿.*\?$/.test(s)) c = 'interrogativa';
  else if (/^¡.*!$/.test(s)) c = 'exclamativa';
  else if (/\bno\b/i.test(s)) c = 'negativa';
  else if (/[¿¡?!]/.test(s)) c = 'ERROR';
  else c = 'afirmativa';
  if (c !== ex.answer) bad(id, 'clase erronea ' + c, ex);
  if (JSON.stringify(ex.options) !== JSON.stringify(['afirmativa', 'negativa', 'interrogativa', 'exclamativa'])) bad(id, 'opciones clase', ex);
};
V.signo = (id, ex) => {
  const t = ex.tokens;
  if (t.length !== 2) return bad(id, 'tokens signo', ex);
  if (t[1] === '__') {
    const s = t[0];
    if (/[.?!]$/.test(s)) bad(id, 'ya lleva signo final', ex);
    const exp = /^¿/.test(s) ? '?' : /^¡/.test(s) ? '!' : '.';
    if (/[¿¡]/.test(s.slice(1))) bad(id, 'signo dentro', ex);
    if (ex.answer !== exp) bad(id, 'signo final erroneo', ex);
    if (JSON.stringify(ex.options) !== JSON.stringify(['.', '?', '!'])) bad(id, 'opciones', ex);
  } else {
    const r = t[1], exp = /\?$/.test(r) ? '¿' : /!$/.test(r) ? '¡' : null;
    if (!exp || ex.answer !== exp || /^[¿¡]/.test(r)) bad(id, 'signo inicial erroneo', ex);
    if (JSON.stringify(ex.options) !== JSON.stringify(['¿', '¡', '.'])) bad(id, 'opciones', ex);
  }
};
V.punto = (id, ex) => {
  const [a, h, b] = ex.tokens;
  if (h !== '__' || ex.tokens.length !== 3) return bad(id, 'tokens', ex);
  if (JSON.stringify(ex.options.slice().sort()) !== JSON.stringify([',', '.', '?'].sort())) bad(id, 'opciones', ex);
  if (/[.,?!]$/.test(a)) bad(id, 'a lleva signo', ex);
  if (!/\.$/.test(b)) bad(id, 'b sin punto', ex);
  if (/^[A-ZÁÉÍÓÚÑ]/.test(b)) { if (ex.answer !== '.') bad(id, 'deberia ser punto', ex); }
  else {
    if (ex.answer !== ',') bad(id, 'deberia ser coma', ex);
    if (/^y /.test(b) || !/ y [^ ]+\.$/.test(b)) bad(id, 'coma antes de y / sin enumeracion', ex);
    const items = (a.split(' ').slice(-1).length) + b.replace(/\./, '').split(/, | y /).length;
    if (items < 3) bad(id, 'enumeracion corta', ex);
    if (/\b(y|e)\s*$/.test(a)) bad(id, 'a acaba en y', ex);
    const last = b.replace(/\.$/, '').split(' y ').pop();
    if (/^h?i/i.test(last)) bad(id, 'y ante i', ex);
  }
};
V.mayus = (id, ex) => {
  const h = ex.tokens.indexOf('__'); if (h < 0 || ex.options.length !== 2) return bad(id, 'formato', ex);
  if (lc(ex.options[0]) !== lc(ex.options[1]) || ex.options[0] === ex.options[1]) bad(id, 'opciones no son variantes de caja', ex);
  const a = ex.answer, prev = h > 0 ? ex.tokens[h - 1] : null;
  const initial = h === 0 || /\.$/.test(prev);
  const isCap = /^[A-ZÁÉÍÓÚÑ]/.test(a);
  if (initial) { if (!isCap) bad(id, 'inicio debe llevar mayuscula', ex); }
  else if (PROPER.includes(cap(a))) { if (!isCap) bad(id, 'nombre propio sin mayuscula', ex); }
  else if (isCap) bad(id, 'mayuscula injustificada', ex);
  if (!initial && !PROPER.includes(cap(a)) && PROPER.includes(cap(lc(a)))) bad(id, 'x', ex);
};
V.read = (id, ex) => {
  if (ex.kind !== 'reading') return;
  const wc = ex.text.split(/\s+/).length;
  if (wc < 45 || wc > 110) bad(id, 'palabras ' + wc, ex);
  if (!ex.title || ex.title.length > 60) bad(id, 'titulo', ex);
  if (ex.qs.length < 4 || ex.qs.length > 5) bad(id, 'nº preguntas', ex);
  const t = lc(ex.text);
  ex.qs.forEach((q) => {
    if (!/^¿.*\?$/.test(q.q)) bad(id, 'pregunta mal formada', q);
    if (!t.includes(lc(q.answer))) bad(id, 'respuesta no esta en el texto', q);
    if (q.options) {
      if (q.options.length < 3 || q.options.length > 4 || new Set(q.options).size !== q.options.length || !q.options.includes(q.answer)) bad(id, 'options lectura', q);
      q.options.filter((o) => o !== q.answer).forEach((o) => {
        if (t.includes(lc(o))) bad(id, 'distractor aparece en el texto: ' + o, q);
        if (lc(o).includes(lc(q.answer)) || lc(q.answer).includes(lc(o))) bad(id, 'distractor solapa con respuesta', q);
      });
    } else if (q.answer.length < 3) bad(id, 'respuesta corta demasiado breve', q);
  });
  if (new Set(ex.qs.map((q) => q.q)).size !== ex.qs.length) bad(id, 'preguntas repetidas', ex);
};

// ---------- clasificador ----------
function classify(ex) {
  if (ex.kind === 'reading') return 'read';
  if (ex.kind === 'match') return ex.left[0].img ? 'ant' : 'syn';
  if (ex.kind === 'pic') return 'conjPic';
  if (ex.kind === 'tokens') return 'order';
  const t0 = ex.tokens && ex.tokens[0];
  if (/^Familia de/.test(t0)) return 'fam';
  if (/^Diminutivo/.test(t0)) return 'dim';
  if (/^Aumentativo/.test(t0)) return 'aum';
  if (/^Sinónimo/.test(t0)) return 'synC';
  if (/^Antónimo/.test(t0)) return 'antC';
  if (t0 === 'Intruso:') return 'field';
  if (t0 === 'Verbo en:') return 'verbRec';
  if (t0 === 'Tiempo de:') return 'tiempo';
  if (/^(Sujeto|Predicado) de:/.test(t0)) return 'sujpred';
  if (t0 === 'Esta oración es:') return 'clase';
  if (ex.tokens.length === 2 && (ex.tokens[1] === '__' || ex.tokens[0] === '__') && ex.options.some((o) => /[.?!¿¡]/.test(o)) && !ex.options.includes(',')) return 'signo';
  if (ex.options && ex.options.includes(',')) return 'punto';
  if (ex.options && ex.options.length === 2 && lc(ex.options[0]) === lc(ex.options[1])) return 'mayus';
  if (ex.tokens.includes('__') && /^\(/.test(ex.tokens[ex.tokens.length - 1])) return 'conjC';
  if (ex.tokens.includes('__')) return 'concord';
  return '?';
}

const PLAN = {
  '9.1': ['fam'], '9.2': ['syn'], '9.3': ['ant'], '9.4': ['dim'], '9.5': ['aum'], '9.6': ['field'],
  '9.7': ['fam', 'synC', 'antC', 'dim', 'aum', 'field'],
  '10.1': ['verbRec'], '10.2': ['tiempo'], '10.3': ['conjPic'], '10.4': ['conjPic'], '10.5': ['conjPic'], '10.6': ['concord'],
  '10.7': ['verbRec', 'tiempo', 'concord', 'conjC'],
  '11.1': ['order'], '11.2': ['order'], '11.3': ['sujpred'], '11.4': ['clase'], '11.5': ['signo'], '11.6': ['punto'], '11.7': ['mayus'],
  '11.8': ['sujpred', 'clase', 'signo', 'punto', 'mayus'],
  '12.1': ['read'], '12.2': ['read'], '12.3': ['read'], '12.4': ['read'], '12.5': ['read'],
};
const MINVAR = { match: 30, reading: 12, other: 80 };
const N = 500;

if (LV.length !== 4) { console.log('FALLO: se esperaban 4 niveles'); fails++; }
let total = 0;
for (const lv of LV) {
  const n = lv.sublevels.length;
  if (n < 4 || n > 8) bad(lv.id, 'nº de temas ' + n, {});
  if (!/Repaso/.test(lv.sublevels[n - 1].name)) bad(lv.id, 'ultimo tema no es repaso', {});
  for (const sl of lv.sublevels) {
    const exp = PLAN[sl.id];
    if (!exp) { bad(sl.id, 'tema sin plan', {}); continue; }
    if (!['cols2', 'wide'].includes(sl.layout)) bad(sl.id, 'layout', {});
    const rng = makeRng(777 + total);
    const seen = new Set(), classes = new Set(), texts = new Set();
    let kind = null;
    for (let i = 0; i < N; i++) {
      let ex;
      try { ex = sl.gen(rng); } catch (e) { bad(sl.id, 'excepcion ' + e.message, {}); break; }
      total++;
      kind = kind || ex.kind;
      const cl = classify(ex);
      classes.add(cl);
      if (!exp.includes(cl)) { bad(sl.id, 'tipo inesperado ' + cl, ex); continue; }
      const spec = { kinds: ['choice', 'match', 'pic', 'tokens', 'reading'], caseOpts: cl === 'mayus' };
      checkGeneric(sl.id, ex, spec);
      if (cl === 'read') V.read(sl.id, ex); else V[cl](sl.id, ex, sl.id);
      seen.add(JSON.stringify(ex));
      if (ex.text) texts.add(ex.text);
    }
    if (kind === 'match' && sl.perSheet > 4) bad(sl.id, 'perSheet match', {});
    if (kind === 'reading' && sl.perSheet !== 1) bad(sl.id, 'perSheet reading', {});
    if (kind !== 'match' && kind !== 'reading' && !(sl.perSheet >= 8 && sl.perSheet <= 10)) bad(sl.id, 'perSheet', { p: sl.perSheet });
    const minV = kind === 'match' ? MINVAR.match : kind === 'reading' ? MINVAR.reading : MINVAR.other;
    const dist = kind === 'reading' ? texts.size : seen.size;
    if (dist < minV) bad(sl.id, 'poca variedad ' + dist, {});
    if (exp.length > 1 && classes.size < exp.length) bad(sl.id, 'repaso no mezcla todos los tipos: ' + [...classes], {});
    console.log(sl.id.padEnd(5), sl.name.padEnd(42), 'variantes distintas:', String(dist).padStart(4), '/', N);
  }
}
// raices: ninguna palabra de otra familia contiene la raiz (se comprueba con lo generado en 9.1)
{
  const fam = LV[0].sublevels[0], rng = makeRng(4242), all = new Set();
  for (let i = 0; i < 3000; i++) { const e = fam.gen(rng); all.add(/«(.+)»/.exec(e.tokens[0])[1]); e.options.forEach((o) => all.add(o)); }
  const fm = {}; ROOTS.forEach((r) => { fm[r] = [...all].filter((w) => lc(w).includes(r)); });
  console.log('palabras de familias vistas:', all.size, '| familias con >= 4 miembros:', ROOTS.filter((r) => fm[r].length >= 4).length, '/', ROOTS.length);
  if (ROOTS.filter((r) => fm[r].length >= 4).length < 12) bad('9.1', 'menos de 12 familias con 4 miembros', {});
  [...all].forEach((w) => { if (rootsOf(w).length !== 1) bad('9.1', 'palabra con raiz ambigua ' + w, {}); });
}
console.log(fails ? 'HAY ' + fails + ' FALLOS' : 'OK: ' + total + ' ejercicios validados');
process.exit(fails ? 1 : 0);
