// Valida los niveles de lengua 5-8 con comprobaciones independientes del gen.
require('../js/rng.js');
require('../js/lengua/words.js');
require('../js/lengua/images.js');
require('../js/lengua/lib.js');
require('../levels/lengua/lengua_5_8.js');

const W = LENGUA_WORDS, IMGS = LENGUA_IMGS;
const LV = LENGUA_LEVELS.filter((l) => [5, 6, 7, 8].includes(l.id));
let bad = 0, n = 0;
const fail = (id, m, e) => { if (bad++ < 25) console.log('FAIL', id, m, JSON.stringify(e)); };
const strip = (s) => s.replace(/[áéíóú]/g, (c) => ({ á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' }[c]));
const bySig = (w, img) => W.find((x) => x.w === w && (img === undefined || x.img === img));
const nounsAll = W.filter((w) => w.g === 'm' || w.g === 'f');
const adjSet = new Set(W.filter((w) => w.cat === 'adjetivos').map((w) => w.w));
const verbSet = new Set(W.filter((w) => w.cat === 'verbos').map((w) => w.w));
const nounSet = new Set(nounsAll.map((w) => w.w));

if (LV.length !== 4) { console.log('FALTAN NIVELES', LV.map((l) => l.id)); process.exit(1); }

function strings(e) {
  const out = [];
  const add = (v) => { if (typeof v === 'string') out.push(v); else if (Array.isArray(v)) v.forEach(add); else if (v && typeof v === 'object') Object.values(v).forEach((x) => typeof x !== 'number' && add(x)); };
  ['tokens', 'options', 'answer', 'text', 'left', 'right'].forEach((k) => e[k] !== undefined && add(e[k]));
  return out;
}
function shape(id, e) {
  if (!['pic', 'choice', 'match', 'copy'].includes(e.kind)) return fail(id, 'kind', e);
  if (e.img !== undefined && !IMGS[e.img]) fail(id, 'img inexistente', e);
  strings(e).forEach((s) => { if (!/^[ -ÿ]*$/.test(s)) fail(id, 'caracter no Latin-1', s); });
  if (e.kind === 'choice') {
    if (!Array.isArray(e.options) || e.options.length < 2 || e.options.length > 4 || new Set(e.options).size !== e.options.length) fail(id, 'options', e);
    if (typeof e.answer !== 'string' || !e.options.includes(e.answer)) fail(id, 'answer no esta en options', e);
    if (e.options.some((o) => typeof o !== 'string' || o.length > 14)) fail(id, 'opcion larga', e);
    if (e.tokens && (!e.tokens.every((t) => typeof t === 'string') || e.tokens.filter((t) => t === '__').length > 1)) fail(id, 'tokens choice', e);
  } else if (e.kind === 'pic') {
    if (!e.img) fail(id, 'pic sin img', e);
    const holes = e.tokens.filter((t) => t === '__' || (t && t.box)).length;
    if (holes !== [].concat(e.answer).length || [].concat(e.answer).some((a) => typeof a !== 'string')) fail(id, 'huecos', e);
  } else if (e.kind === 'match') {
    const k = e.left.length;
    if (k < 3 || k > 5 || e.right.length !== k || e.answer.length !== k) fail(id, 'match tamano', e);
    if (new Set(e.answer).size !== k || !e.answer.every((a) => typeof a === 'string' && +a >= 0 && +a < k)) fail(id, 'match permutacion', e);
    const imgs = e.left.map((x) => x.img);
    if (new Set(imgs).size !== k || imgs.some((i) => !IMGS[i])) fail(id, 'match imgs', e);
    if (new Set(e.right.map((r) => r.t)).size !== k) fail(id, 'match right repetido', e);
  }
}

// ----- validadores por tema (devuelven true/false)
const art = (g) => (g === 'f' ? 'la' : 'el');
const v51 = (e) => { const w = bySig(e.tokens[1], e.img); return e.kind === 'choice' && e.tokens[0] === '__' && !!w && e.options.join() === 'el,la' && e.answer === art(w.g); };
const v52 = (e) => { const w = bySig(e.tokens[1], e.img); return e.kind === 'choice' && !!w && e.options.join() === 'un,una' && e.answer === (w.g === 'f' ? 'una' : 'un'); };
const v53 = (e) => { const w = bySig(e.tokens[0], e.img); return e.kind === 'choice' && !!w && e.answer === (w.g === 'f' ? 'femenino' : 'masculino') && e.options.join() === 'masculino,femenino'; };
const plEx = (e, filt) => {
  if (e.kind !== 'pic') return false;
  const m = /^(el|la|los|las) (\S+)$/.exec(e.tokens[0]);
  if (!m) return false;
  const toPl = e.tokens[1] === 'en plural:';
  if (!toPl && e.tokens[1] !== 'en singular:') return false;
  const w = toPl ? bySig(m[2], e.img) : W.find((x) => x.pl === m[2] && x.img === e.img);
  if (!w || !w.pl) return false;
  if (toPl && (m[1] !== art(w.g) || e.tokens[2] !== (w.g === 'f' ? 'las' : 'los') || e.answer !== w.pl)) return false;
  if (!toPl && (m[1] !== (w.g === 'f' ? 'las' : 'los') || e.tokens[2] !== art(w.g) || e.answer !== w.w)) return false;
  return filt(w);
};
const v54 = (e) => plEx(e, (w) => /[aeiouáéó]$/.test(w.w) && w.pl === w.w + 's');
const v55 = (e) => plEx(e, (w) => !/[aeiouáéóíúsz]$/.test(w.w) && strip(w.pl) === strip(w.w) + 'es');
const v56 = (e) => {
  if (e.kind === 'pic') return plEx(e, (w) => /z$/.test(w.w) && w.pl === w.w.slice(0, -1) + 'ces');
  const m = /^singular: (\S+)$/.exec(e.tokens[0]);
  return !!m && /z$/.test(m[1]) && e.tokens[1] === 'plural:' && e.answer === m[1].slice(0, -1) + 'ces' && e.options.includes(m[1] + 'es');
};
const v57 = (e) => {
  const w = W.find((x) => (x.w === e.tokens[1] || x.pl === e.tokens[1]) && x.img === e.img && x.g);
  if (!w || e.options.join() !== 'el,la,los,las') return false;
  const pl = e.tokens[1] === w.pl && w.pl !== w.w;
  return e.answer === (pl ? (w.g === 'f' ? 'las' : 'los') : art(w.g));
};
const v61 = (e) => {
  const w = e.tokens[0];
  if (e.options.join() !== 'común,propio') return false;
  if (/^[A-ZÁÉÍÓÚ]/.test(w)) return e.answer === 'propio' && !nounSet.has(w) && !nounSet.has(w.toLowerCase());
  return e.answer === 'común' && !!bySig(w, e.img) && nounSet.has(w) && !adjSet.has(w) && !verbSet.has(w);
};
const clsOfWord = (w) => (nounSet.has(w) && !adjSet.has(w) && !verbSet.has(w) ? 'sustantivo' : adjSet.has(w) && !nounSet.has(w) && !verbSet.has(w) ? 'adjetivo' : verbSet.has(w) && !nounSet.has(w) && !adjSet.has(w) ? 'verbo' : null);
const mk62 = (opts) => (e) => e.options.join() === opts && e.tokens[1] === ':' && clsOfWord(e.tokens[0]) === e.answer;
const v62 = mk62('sustantivo,adjetivo');
const v63 = mk62('sustantivo,adjetivo,verbo');
const v64 = (e) => {
  const m = /^¿Cómo es (el|la) (\S+)\?$/.exec(e.tokens[0]);
  if (!m) return false;
  const n = bySig(m[2], e.img);
  if (!n || art(n.g) !== m[1] || e.options.length !== 3) return false;
  const fem = (a) => (/o$/.test(a) ? a.slice(0, -1) + 'a' : a);
  const isAdj = (x) => adjSet.has(x) || [...adjSet].some((a) => fem(a) === x);
  const adjs = e.options.filter(isAdj);
  if (adjs.length !== 1 || adjs[0] !== e.answer) return false;
  const ok = e.options.filter((x) => x !== e.answer);
  return ok.every((x) => !isAdj(x) && (nounSet.has(x) || verbSet.has(x)));
};
const v65 = (e) => {
  if (e.kind !== 'match') return false;
  return e.left.every((l, i) => {
    const w = W.find((x) => x.img === l.img);
    return w && w.cat === 'verbos' && e.right[+e.answer[i]].t === w.w;
  });
};

// ----- ortografia
const BLACK = new Set(['baca', 'baso', 'vota', 'bello', 'vello', 'jira', 'jeta', 'pollo', 'poyo', 'valla', 'vaya', 'halla', 'haya', 'arrollo', 'arroyo', 'maya', 'malla',
  'pero', 'perro', 'caro', 'carro', 'cero', 'cerro', 'coro', 'corro', 'para', 'parra', 'pera', 'perra', 'careta', 'carreta', 'jara', 'bario', 'buro', 'ola', 'hola',
  'asta', 'hasta', 'onda', 'honda', 'uso', 'huso', 'echo', 'hecho', 'ato', 'hato', 'ala', 'hala', 'tubo', 'tuvo', 'cabo', 'cavo', 'mallo', 'mayo', 'hollo', 'hoyo', 'rallo', 'rayo']);
const V = 'aeiouáéíóú';
function spellCheck(id, e) {
  if (e.kind !== 'choice') return fail(id, 'kind', e);
  const hi = e.tokens.indexOf('__');
  if (hi < 0) return fail(id, 'sin hueco', e);
  const pre = e.tokens.slice(0, hi).join(''), post = e.tokens.slice(hi + 1).join('');
  const ans = e.answer === 'sin h' ? '' : e.answer;
  const word = pre + ans + post;
  if (!/^[a-záéíóúüñ]+$/.test(word)) return fail(id, 'palabra rara', e);
  const alt = e.options.filter((o) => o !== e.answer).map((o) => pre + (o === 'sin h' ? '' : o) + post);
  alt.forEach((a) => BLACK.has(a) && fail(id, 'alternativa valida', { e, a }));
  if (BLACK.has(word)) fail(id, 'palabra en lista negra', word);
  const key = e.options.join('/');
  const nx = post[0] || '', pv = pre[pre.length - 1] || '';
  if (key === 'g/j' && e.answer === 'g' && !'eiéí'.includes(nx)) fail(id, 'g sin e/i', e);
  if (key === 'h/sin h') {
    if (e.answer === 'h' && !V.includes(nx)) fail(id, 'h sin vocal detras', e);
    if (e.answer === 'sin h' && (pre !== '' || !V.includes(nx))) fail(id, 'sin h debe ser al inicio ante vocal', e);
    if (e.answer === 'sin h' && pre === '' && ['ola', 'asta', 'onda', 'uso', 'echo', 'ato', 'ala'].includes(post)) fail(id, 'par minimo h', e);
  }
  if (key === 'll/y') {
    if (e.answer === 'll' && !V.includes(nx)) fail(id, 'll sin vocal', e);
    if (e.answer === 'y' && nx !== '' && !V.includes(nx)) fail(id, 'y sin vocal', e);
  }
  if (key === 'x/s' && !V.includes(pv)) fail(id, 'x/s contexto', e);
  if (key === 'x/s' && e.answer === 's' && (pre !== 'e' || V.includes(nx))) fail(id, 'e+s+consonante', e);
  if (key === 'mp/mb') { if (pv !== 'a' && pv !== 'e' && pv !== 'i' && pv !== 'o' && pv !== 'u') fail(id, 'mp/mb contexto', e); if (V.includes(nx) && e.answer === 'mp' && nx === 'b') fail(id, 'mpb', e); }
  if (key === 'r/rr') {
    if (e.answer === 'rr' && !(V.includes(pv) && V.includes(nx))) fail(id, 'rr no intervocalica', e);
    if (e.answer === 'r' && pre === '' && !V.includes(nx)) fail(id, 'r inicial sin vocal', e);
    if (e.answer === 'r' && pv && !V.includes(pv) && !'nls'.includes(pv)) fail(id, 'r tras consonante rara', e);
  }
  return word;
}
const SPELL_KEYS = { '7.1': 'b/v', '7.2': 'g/j', '7.3': 'h/sin h', '7.4': 'll/y', '7.5': 'x/s', '7.6': 'mp/mb', '7.7': 'r/rr' };

// ----- acentuacion (reglas independientes)
const ownMap = new Map();
(LENGUA_5_8_DATA.OWN_RAW || []).forEach((s) => {
  const parts = s.split('-'); const t = parts.findIndex((p) => p[0] === '^');
  const syl = parts.map((p) => p.replace('^', '')); ownMap.set(syl.join(''), { w: syl.join(''), syl, t });
});
const entryOf = (w) => ownMap.get(w) || (() => { const b = W.find((x) => x.w === w && x.syl); return b && { w: b.w, syl: b.syl, t: b.t }; })();
// sílaba tónica a partir de la ortografía y la regla general (independiente de t)
function tonicByRule(syl) {
  const w = syl.join('');
  const ac = syl.findIndex((s) => /[áéíóú]/.test(s));
  if (ac >= 0) return ac;
  if (syl.length === 1) return 0;
  return /[aeiouns]$/.test(w) ? syl.length - 2 : syl.length - 1;
}
const classByRule = (syl) => ['aguda', 'llana', 'esdrújula'][syl.length - 1 - tonicByRule(syl)];
function vowelGroups(w) {
  const s = w.replace(/qu(?=[eiéí])/g, 'q').replace(/gu(?=[eiéí])/g, 'g');
  const strong = /[aeoáéó]/, weakAcc = /[íú]/;
  let n = 0, prev = '';
  for (const c of s) {
    const isV = /[aeiouáéíóúü]/.test(c);
    if (!isV) { prev = ''; continue; }
    if (!prev) n++;
    else if ((strong.test(prev) && strong.test(c)) || weakAcc.test(prev) || weakAcc.test(c)) n++;
    prev = c;
  }
  return n;
}
const needsTilde = (w, cls) => cls === 'esdrújula' || (cls === 'aguda' ? /[aeiouns]$/.test(strip(w)) : !/[aeiouns]$/.test(strip(w)));

const seenIds = new Set();
const report = [];
for (const lv of LV) {
  if (lv.sublevels.length < 4 || lv.sublevels.length > 8) fail(lv.id, 'numero de temas', lv.sublevels.length);
  for (const s of lv.sublevels) {
    if (seenIds.has(s.id)) fail(s.id, 'id repetido'); seenIds.add(s.id);
    if (!['cols2', 'wide'].includes(s.layout) || !(s.perSheet >= 3)) fail(s.id, 'layout/perSheet', s);
    const r = makeRng(7), seen = new Set(), words = new Set();
    for (let i = 0; i < 400; i++) {
      const e = s.gen(r); n++;
      seen.add(JSON.stringify(e));
      const before = bad;
      shape(s.id, e);
      if (bad !== before) continue;
      const id = s.id;
      let ok = true;
      switch (id) {
        case '5.1': ok = v51(e); break;
        case '5.2': ok = v52(e); break;
        case '5.3': ok = v53(e); break;
        case '5.4': ok = v54(e); break;
        case '5.5': ok = v55(e); break;
        case '5.6': ok = v56(e); break;
        case '5.7': ok = v57(e); break;
        case '5.8': ok = [v51, v52, v53, v54, v55, v56, v57].some((f) => f(e)); break;
        case '6.1': ok = v61(e); break;
        case '6.2': ok = v62(e); break;
        case '6.3': ok = v63(e); break;
        case '6.4': ok = v64(e); break;
        case '6.5': ok = v65(e); break;
        case '6.6': ok = [v61, v62, v63, v64].some((f) => f(e)); break;
        default: break;
      }
      if (!ok) fail(id, 'respuesta/estructura incorrecta', e);
      if (id.startsWith('7.')) {
        const w = spellCheck(id, e);
        if (w) words.add(w);
        if (SPELL_KEYS[id] && e.options.join('/') !== SPELL_KEYS[id]) fail(id, 'opciones del tema', e);
      }
      if (id.startsWith('8.')) {
        const chk = (cond, m) => { if (!cond) fail(id, m, e); };
        const mix = id === '8.6';
        if (id === '8.1' || mix && e.options.every((o) => /^\d$/.test(o))) {
          const w = e.tokens[0]; const en = entryOf(w);
          chk(en && en.syl.length === +e.answer && vowelGroups(w) === +e.answer && e.options.includes(e.answer), '8.1 silabas');
        } else if (id === '8.2' || mix && e.tokens[1] === 'sílaba tónica:') {
          const syl = e.tokens[0].split('-'); const en = entryOf(syl.join(''));
          chk(en && en.syl.join() === syl.join() && e.options.join() === syl.join() && new Set(syl).size === syl.length, '8.2 opciones');
          chk(e.answer === syl[tonicByRule(syl)] && en.syl[en.t] === e.answer, '8.2 tonica');
        } else if (id === '8.3' || mix && e.options.join() === 'aguda,llana,esdrújula') {
          const syl = e.tokens[0].split('-');
          chk(entryOf(syl.join('')) && e.answer === classByRule(syl) && vowelGroups(syl.join('')) === syl.length, '8.3 clase');
        } else if (id === '8.4' || mix && e.options.join() === 'sí,no') {
          const m = /^(\S+) \((aguda|llana|esdrújula)\)$/.exec(e.tokens[0]);
          chk(!!m, '8.4 formato');
          if (m) {
            const en = [...ownMap.values(), ...W.filter((x) => x.syl)].find((x) => strip(x.w) === m[1] && (x.syl.length > 1));
            chk(en && classByRule(en.syl) === m[2] && (e.answer === 'sí') === needsTilde(en.w, m[2]) && (e.answer === 'sí') === /[áéíóú]/.test(en.w), '8.4 respuesta');
          }
        } else {
          const cm = /^\((aguda|llana|esdrújula)\)$/.exec(e.tokens[0]);
          chk(!!cm && e.options.length === 3, '8.5 formato');
          if (cm) {
            const bases = new Set(e.options.map(strip));
            chk(bases.size === 1, '8.5 bases distintas');
            const en = entryOf(e.answer);
            chk(en && classByRule(en.syl) === cm[1] && (/[áéíóú]/.test(e.answer)) === needsTilde(e.answer, cm[1]), '8.5 regla');
            chk(e.options.filter((o) => o === e.answer).length === 1 && e.options.every((o) => o === e.answer || o !== en.w), '8.5 unica');
            chk(e.options.every((o) => (o.match(/[áéíóú]/g) || []).length <= 1), '8.5 una tilde');
          }
        }
      }
    }
    const minVar = s.sublevels ? 0 : (s.id === '6.5' ? 12 : 30);
    if (seen.size < minVar) fail(s.id, 'poca variedad', seen.size);
    if (seen.size < s.perSheet * 2) fail(s.id, 'variedad < 2*perSheet', seen.size);
    if (s.id.startsWith('7.') && s.id !== '7.8' && words.size < 25) fail(s.id, 'menos de 25 palabras', words.size);
    if (s.id === '7.8' && words.size < 100) fail(s.id, 'repaso 7 pocas palabras', words.size);
    report.push(s.id + ':' + seen.size + (words.size ? '/' + words.size + 'w' : ''));
  }
}

// ----- datos propios del nivel 8
ownMap.forEach((e) => {
  if (e.t < 0 || e.syl.join('') !== e.w) fail('8 own', 'datos', e);
  else if (e.syl.length > 1 && tonicByRule(e.syl) !== e.t) fail('8 own', 'tonica no coincide con la regla', e);
  else if (vowelGroups(e.w) !== e.syl.length) fail('8 own', 'silabas vs grupos vocalicos', e);
});

console.log(report.join('  '));
console.log(bad ? 'FALLOS: ' + bad + ' de ' + n + ' ejercicios' : 'OK ' + n + ' ejercicios');
process.exit(bad ? 1 : 0);
