// Comprueba los niveles de lengua 1-4 con reglas escritas de forma independiente del generador.
const path = require('path');
const root = path.join(__dirname, '..');
require(path.join(root, 'js/rng.js'));
require(path.join(root, 'js/lengua/words.js'));
require(path.join(root, 'js/lengua/images.js'));
require(path.join(root, 'js/lengua/lib.js'));
require(path.join(root, 'levels/lengua/lengua_1_4.js'));

const N = 400;
let errors = 0;
function fail(id, msg, ex) { if (errors++ < 30) console.log('FALLO ' + id + ': ' + msg + ' -> ' + JSON.stringify(ex)); }

const BANK = LENGUA_WORDS.filter((w) => w.img);
const byWord = {}; BANK.forEach((w) => { (byWord[w.w] = byWord[w.w] || []).push(w); });
const byImg = {}; BANK.forEach((w) => { (byImg[w.img] = byImg[w.img] || []).push(w); });
const ALL = new Set(LENGUA_WORDS.map((w) => w.w));
const D = LENGUA_1_4_DATA;
const OWN = new Set(); Object.keys(D.ORT).forEach((k) => D.ORT[k].forEach((w) => OWN.add(w)));
const NEED = new Set([...D.ORT.rrNeed, ...D.ORT.rNeed]);
const known = (w) => ALL.has(w) || OWN.has(w);
const wordOf = (img) => (byImg[img] || []).map((w) => w.w);
const ALPHA = 'abcdefghijklmnñopqrstuvwxyz';
const V = 'aeiou';
const GRP = ['bv', 'ckqz', 'gj'];
const conf = (a, b) => a === b || GRP.some((g) => g.includes(a) && g.includes(b));
const eqA = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Rellena huecos de tokens con las respuestas (en orden) y concatena strings.
function fill(ex) {
  const ans = Array.isArray(ex.answer) ? ex.answer.slice() : [ex.answer];
  const parts = ex.tokens.map((t) => (t === '__' ? ans.shift() : typeof t === 'string' ? t : null));
  return { parts, left: ans.length };
}

const val = {};
val['1.1'] = (ex) => {
  if (ex.kind !== 'choice' || ex.img || ex.tokens || ex.options.length !== 4) return 'forma';
  const v = ex.options.filter((o) => V.includes(o.toLowerCase()));
  if (v.length !== 1 || v[0] !== ex.answer) return 'vocal unica';
  const up = ex.options.every((o) => o === o.toUpperCase());
  const lo = ex.options.every((o) => o === o.toLowerCase());
  return up || lo ? null : 'mezcla de caso';
};
val['1.2'] = (ex) => {
  if (ex.kind !== 'choice' || !ex.tokens || ex.tokens.length !== 2 || ex.tokens[0] !== '__' || ex.options.length !== 3) return 'forma';
  const w = ex.answer + ex.tokens[1];
  if (!wordOf(ex.img).includes(w)) return 'palabra/imagen ' + w;
  if (w[0] === 'h') return 'h inicial';
  if (ex.options.some((o) => o !== ex.answer && conf(o, ex.answer))) return 'letras confundibles';
  if (ex.answer.length !== 1) return 'letra';
  return null;
};
val['1.3'] = (ex) => {
  if (ex.kind !== 'pic' || typeof ex.answer !== 'string' || !V.includes(ex.answer)) return 'forma';
  const f = fill(ex);
  if (f.left || f.parts.includes(null) || f.tokens) return 'huecos';
  if (ex.tokens.filter((t) => t === '__').length !== 1) return 'un hueco';
  const w = f.parts.join('');
  return wordOf(ex.img).includes(w) ? null : 'palabra/imagen ' + w;
};
val['1.4'] = (ex) => {
  if (ex.kind !== 'match' || ex.left.length !== 4 || ex.right.length !== 4) return 'forma';
  const firsts = [];
  for (let i = 0; i < 4; i++) {
    const ws = wordOf(ex.left[i].img);
    const r = ex.right[+ex.answer[i]].t;
    if (!ws.length || !ws.every((w) => w[0] === r)) return 'pareja ' + i;
    firsts.push(r);
  }
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (conf(firsts[i], firsts[j])) return 'letras confundibles';
  return new Set(ex.answer).size === 4 && new Set(ex.left.map((l) => l.img)).size === 4 ? null : 'repetidos';
};
val['1.5'] = (ex) => {
  if (ex.kind !== 'tokens' || typeof ex.answer !== 'string') return 'forma';
  const t = ex.tokens;
  if (t[0] === 'Después de la') return ALPHA[ALPHA.indexOf(t[1]) + 1] === ex.answer && t[3] === '__' ? null : 'siguiente';
  if (t[0] === 'Antes de la') return ALPHA[ALPHA.indexOf(t[1]) - 1] === ex.answer && ALPHA.indexOf(t[1]) > 0 && t[3] === '__' ? null : 'anterior';
  if (t.length !== 4 || t.filter((x) => x === '__').length !== 1) return 'serie';
  const letters = t.map((x) => (x === '__' ? ex.answer : x));
  const up = letters[letters[0] === letters[0].toUpperCase() ? 0 : 0] === letters[0].toUpperCase();
  const idx = letters.map((c) => ALPHA.indexOf(c.toLowerCase()));
  if (idx.some((i) => i < 0)) return 'letra';
  if (!idx.every((v, k) => k === 0 || v === idx[k - 1] + 1)) return 'no consecutivas';
  return letters.every((c) => (c === c.toUpperCase()) === up) ? null : 'caso';
};
val['1.6'] = (ex) => {
  if (ex.kind !== 'match' || ex.left.length !== 4) return 'forma';
  for (let i = 0; i < 4; i++) if (ex.right[+ex.answer[i]].t !== ex.left[i].t.toLowerCase() || ex.left[i].t === ex.left[i].t.toLowerCase()) return 'pareja';
  return new Set(ex.left.map((l) => l.t)).size === 4 ? null : 'repetidas';
};

// Nivel 2
const sylOf = (img) => (byImg[img] || []).map((w) => w.syl);
val['2.1'] = (ex) => {
  if (ex.kind !== 'choice' || ex.tokens || !eqA(ex.options, ['1', '2', '3'])) return 'forma';
  const n = +ex.answer;
  return sylOf(ex.img).some((s) => s.length === n) && n <= 2 ? null : 'cuenta';
};
const sepV = (n) => (ex) => {
  if (ex.kind !== 'pic' || !Array.isArray(ex.answer) || ex.answer.length !== n || ex.tokens.length !== n) return 'forma';
  if (!ex.tokens.every((t) => t && typeof t.box === 'number')) return 'cajas';
  return sylOf(ex.img).some((s) => eqA(s, ex.answer)) ? null : 'silabas';
};
val['2.2'] = sepV(2);
val['2.3'] = (ex) => {
  if (ex.kind !== 'pic' || ex.tokens.length !== 4 || ex.tokens[2] !== ':' || !ex.tokens[3].box) return 'forma';
  const a = [ex.tokens[0], ex.tokens[1]];
  const sy = sylOf(ex.img).find((s) => s.join('') === ex.answer);
  if (!sy || sy.length !== 2) return 'palabra';
  if (eqA(a, sy) || !eqA(a.slice().sort(), sy.slice().sort())) return 'orden';
  return sy[0] !== sy[1] ? null : 'iguales';
};
val['2.4'] = (ex) => {
  if (ex.kind !== 'pic' || typeof ex.answer !== 'string' || ex.tokens.length !== 2 || ex.tokens.filter((t) => t === '__').length !== 1) return 'forma';
  const s = ex.tokens.map((t) => (t === '__' ? ex.answer : t));
  return sylOf(ex.img).some((x) => eqA(x, s)) ? null : 'silabas';
};
const cntV = (n, opts) => (ex) => {
  if (ex.kind !== 'choice' || ex.tokens || !eqA(ex.options, opts) || +ex.answer !== n) return 'forma';
  return sylOf(ex.img).some((s) => s.length === n) ? null : 'cuenta';
};
val['2.5'] = (ex) => (ex.kind === 'choice' ? cntV(3, ['2', '3', '4'])(ex) : sepV(3)(ex));
val['2.6'] = (ex) => (ex.kind === 'choice' ? cntV(4, ['3', '4', '5'])(ex) : sepV(4)(ex));
val['2.7'] = (ex) => {
  if (ex.kind !== 'match' || ex.left.length !== 4) return 'forma';
  const words = new Set(LENGUA_WORDS.map((w) => w.w));
  for (let i = 0; i < 4; i++) {
    const w = ex.left[i].t + ex.right[+ex.answer[i]].t;
    if (!(byWord[w] || []).some((x) => x.syl.length === 2 && x.syl[0] === ex.left[i].t)) return 'pareja ' + w;
    for (let j = 0; j < 4; j++) if (j !== i && words.has(ex.left[i].t + ex.right[+ex.answer[j]].t)) return 'cruce';
  }
  return new Set(ex.answer).size === 4 ? null : 'repetidas';
};

// Nivel 3
const art = (w) => (w.g === 'f' ? 'una' : 'un');
val['3.1'] = (ex) => (ex.kind === 'copy' && ex.reps >= 1 && ex.answer === ex.text && wordOf(ex.img).includes(ex.text) ? null : 'copy');
val['3.2'] = (ex) => (ex.kind === 'pic' && ex.tokens.length === 1 && ex.tokens[0].box >= 30 && wordOf(ex.img).includes(ex.answer) && typeof ex.answer === 'string' ? null : 'nombre');
val['3.3'] = (ex) => {
  if (ex.kind !== 'match' || ex.left.length !== 4) return 'forma';
  for (let i = 0; i < 4; i++) if (!wordOf(ex.left[i].img).includes(ex.right[+ex.answer[i]].t)) return 'pareja';
  return new Set(ex.left.map((l) => l.img)).size === 4 && new Set(ex.answer).size === 4 ? null : 'repetidos';
};
val['3.4'] = (ex) => {
  if (ex.kind !== 'pic' || typeof ex.answer !== 'string') return 'forma';
  const i = ex.tokens.indexOf(':');
  const letters = ex.tokens.slice(0, i);
  if (!wordOf(ex.img).includes(ex.answer) || !ex.tokens[i + 1].box || i + 2 !== ex.tokens.length) return 'palabra';
  if (letters.join('') === ex.answer || letters.slice().sort().join('') !== ex.answer.split('').sort().join('')) return 'letras';
  return null;
};
val['3.5'] = (ex) => {
  if (ex.kind !== 'pic' || !Array.isArray(ex.answer) || ex.answer.length !== 2 || !ex.answer.every((a) => V.includes(a))) return 'forma';
  const f = fill(ex);
  if (f.left || f.parts.includes(null)) return 'huecos';
  if (ex.tokens.indexOf('__') === -1 || ex.tokens.indexOf('__') === ex.tokens.lastIndexOf('__')) return 'dos huecos';
  const w = f.parts.join('');
  if (!wordOf(ex.img).includes(w)) return 'palabra ' + w;
  return ex.tokens.some((t, k) => t === '__' && ex.tokens[k + 1] === '__') ? 'huecos juntos' : null;
};
const sentRe = /^(Veo|Dibujo|Tengo|Como) (un|una) ([a-zñáéíóúü]+)\.$/;
val['3.6'] = (ex) => {
  if (ex.kind === 'copy') {
    const m = sentRe.exec(ex.text);
    if (!m || ex.text.length > 22 || ex.answer !== ex.text) return 'frase';
    const w = (byImg[ex.img] || []).find((x) => x.w === m[3]);
    return w && art(w) === m[2] && !/s$/.test(w.w) ? null : 'articulo';
  }
  if (ex.kind === 'lines') {
    const m = /^Escribe una frase con la palabra "([a-zñáéíóúü]+)"\.$/.exec(ex.text);
    const m2 = sentRe.exec(ex.answer);
    if (!m || !m2 || m[1] !== m2[3] || ex.n !== 2 || !wordOf(ex.img).includes(m[1])) return 'lines';
    const w = byWord[m[1]].find((x) => x.img === ex.img);
    return art(w) === m2[2] ? null : 'articulo';
  }
  return 'kind';
};
val['3.7'] = (ex) => {
  if (ex.kind !== 'choice' || ex.tokens.length !== 2 || ex.options.length !== 2) return 'forma';
  let s;
  if (ex.tokens[0] === '__') {
    const o = ex.options.slice().sort();
    if (o[0].toLowerCase() !== o[1].toLowerCase() || ex.answer !== ex.answer[0].toUpperCase() + ex.answer.slice(1) || !/^[A-Z]/.test(ex.answer)) return 'mayuscula';
    s = ex.answer + ' ' + ex.tokens[1];
  } else {
    if (ex.tokens[1] !== '__' || ex.answer !== '.' || !eqA(ex.options.slice().sort(), [',', '.'])) return 'punto';
    s = ex.tokens[0] + '.';
  }
  const m = sentRe.exec(s);
  if (!m) return 'frase ' + s;
  const w = (byImg[ex.img] || []).find((x) => x.w === m[3]);
  return w && art(w) === m[2] ? null : 'articulo';
};

// Nivel 4
function ortV(rule, opts) {
  return (ex) => {
    if (ex.kind !== 'choice' || !ex.tokens || ex.tokens.filter((t) => t === '__').length !== 1) return 'forma';
    const k = ex.tokens.indexOf('__');
    const pre = ex.tokens.slice(0, k).join(''), post = ex.tokens.slice(k + 1).join('');
    const w = pre + ex.answer + post;
    if (!known(w)) return 'palabra desconocida ' + w;
    if (ex.img) { if (!wordOf(ex.img).includes(w)) return 'imagen ' + w; } else if (!ALL.has(w) && !OWN.has(w)) return 'sin img ' + w;
    if (!ex.img && NEED.has(w) && !ALL.has(w)) return 'necesita imagen';
    if (!ex.img) for (const o of ex.options) if (o !== ex.answer && known(pre + o + post)) return 'ambigua sin imagen ' + (pre + o + post);
    const r = rule(ex.answer, pre, post, ex);
    if (r) return r;
    return opts(ex) ? null : 'opciones ' + ex.options;
  };
}
const nx = (p) => p[0] || '';
val['4.1'] = ortV((a, pre, post) => (a === 'm' ? ('pb'.includes(nx(post)) ? null : 'm') : a === 'n' ? (/^[ctdgfzsl]/.test(post) ? null : 'n') : 'resp'), (ex) => eqA(ex.options.slice().sort(), ['m', 'n']));
val['4.2'] = ortV((a, pre, post) => {
  const lastV = /[aeiouáéíóú]$/.test(pre), nextV = /^[aeiouáéíóú]/.test(post);
  if (a === 'rr') return lastV && nextV ? null : 'rr';
  if (a === 'r') return (pre === '' && nextV) || (lastV && nextV) ? null : 'r';
  return 'resp';
}, (ex) => eqA(ex.options.slice().sort(), ['r', 'rr']));
val['4.3'] = ortV((a, pre, post) => (a === 'c' ? (/^[aouáóú]/.test(post) ? null : 'c') : a === 'qu' ? (/^[eiéí]/.test(post) ? null : 'qu') : 'resp'), (ex) => eqA(ex.options.slice().sort(), ['c', 'qu']));
val['4.4'] = ortV((a, pre, post) => (a === 'z' ? (/^[aouáóú]/.test(post) ? null : 'z') : a === 'c' ? (/^[eiéí]/.test(post) ? null : 'c') : 'resp'), (ex) => eqA(ex.options.slice().sort(), ['c', 'z']));
val['4.5'] = ortV((a, pre, post, ex) => (a === 'g' ? (/^[aoáó]/.test(post) ? null : 'g') : a === 'gu' ? (/^[eiéí]/.test(post) ? null : 'gu') : 'resp'), (ex) => eqA(ex.options.slice().sort(), ['g', 'gu']));
val['4.6'] = ortV((a, pre, post) => ((a === 'g' || a === 'j') && /^[eiéí]/.test(post) ? null : 'gj'), (ex) => eqA(ex.options.slice().sort(), ['g', 'j']));
val['4.7'] = ortV((a) => (a === 'ch' ? null : 'resp'), (ex) => ex.options.length === 3 && new Set(ex.options).size === 3 && ex.options.every((o) => ['ch', 'c', 'll', 'x'].includes(o)));

const mixes = {
  '1.7': ['1.1', '1.2', '1.3', '1.5'],
  '2.8': ['2.1', '2.2', '2.3', '2.4', '2.5', '2.6'],
  '3.8': ['3.1', '3.2', '3.4', '3.5', '3.6', '3.7'],
  '4.8': ['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7'],
};
const KINDS = ['pic', 'choice', 'match', 'copy', 'lines', 'tokens'];

function generic(id, ex, sub) {
  if (!KINDS.includes(ex.kind)) return fail(id, 'kind', ex);
  const js = JSON.stringify(ex);
  if (/[^\u0000-ÿ]/.test(js)) return fail(id, 'caracter no Latin-1', ex);
  const ans = Array.isArray(ex.answer) ? ex.answer : [ex.answer];
  if (ex.kind !== 'match' && !ans.every((a) => typeof a === 'string' && a.length)) return fail(id, 'answer no string', ex);
  if (ex.kind === 'match' && !(Array.isArray(ex.answer) && ex.answer.every((a) => typeof a === 'string'))) return fail(id, 'answer match', ex);
  if (ex.img && !LENGUA_IMGS[ex.img]) return fail(id, 'imagen inexistente', ex);
  const allImgs = [];
  if (ex.kind === 'match') {
    if (ex.left.length < 3 || ex.left.length > 5 || ex.right.length !== ex.left.length || ex.answer.length !== ex.left.length) return fail(id, 'match tamaño', ex);
    [...ex.left, ...ex.right].forEach((x) => { if (x.img) { allImgs.push(x.img); if (!LENGUA_IMGS[x.img]) fail(id, 'imagen inexistente', ex); } });
    if (new Set(allImgs).size !== allImgs.length) fail(id, 'imagen repetida', ex);
    if (sub.layout !== 'wide' || sub.perSheet > 4) fail(id, 'layout match', sub.layout);
  }
  if (ex.kind === 'choice') {
    if (!ex.options || ex.options.length < 2 || ex.options.length > 4 || new Set(ex.options).size !== ex.options.length || !ex.options.includes(ex.answer)) return fail(id, 'choice options', ex);
    if (ex.tokens && ex.tokens.filter((t) => t === '__').length !== 1) return fail(id, 'choice hueco', ex);
  }
  if (ex.kind === 'copy' && ex.text.length > 22) fail(id, 'copy largo', ex);
  if (ex.kind === 'pic' || ex.kind === 'tokens') {
    const holes = ex.tokens.filter((t) => t === '__').length + ex.tokens.filter((t) => t && t.box).length;
    if (holes !== ans.length) fail(id, 'huecos != answers', ex);
  }
}

LENGUA_LEVELS.forEach((lv) => {
  lv.sublevels.forEach((sub, si) => {
    const id = sub.id;
    const checks = mixes[id] ? mixes[id].map((k) => val[k]) : [val[id]];
    if (checks.some((c) => !c)) return fail(id, 'sin validador');
    if (!['wide', 'cols2'].includes(sub.layout) || !(sub.perSheet >= 3 && sub.perSheet <= 10)) fail(id, 'layout/perSheet', [sub.layout, sub.perSheet]);
    const seen = new Set();
    for (let s = 1; s <= N; s++) {
      const rng = makeRng(s * 7919 + si * 31 + lv.id);
      const ex = sub.gen(rng);
      generic(id, ex, sub);
      const errs = checks.map((c) => { try { return c(ex); } catch (e) { return 'excepcion ' + e.message; } });
      if (!errs.some((e) => e === null)) fail(id, errs.filter(Boolean).join(' | '), ex);
      seen.add(JSON.stringify(ex));
      // determinismo
      if (s <= 5 && JSON.stringify(sub.gen(makeRng(s * 7919 + si * 31 + lv.id))) !== JSON.stringify(ex)) fail(id, 'no determinista', ex);
    }
    const need = sub.perSheet <= 4 ? 12 : sub.perSheet * 4;
    if (seen.size < need) fail(id, 'poca variedad: ' + seen.size + ' < ' + need);
    console.log(id.padEnd(4), sub.name.padEnd(42), 'distintos:', seen.size);
  });
});
console.log(errors ? errors + ' FALLOS' : 'OK');
process.exit(errors ? 1 : 0);
