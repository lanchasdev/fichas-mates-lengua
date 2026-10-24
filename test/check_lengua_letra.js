require('../js/rng.js'); require('../js/lengua/words.js'); require('../js/lengua/images.js'); require('../js/lengua/lib.js');
require('../levels/lengua/lengua_letra.js');
const lv = LENGUA_LEVELS.find((l) => l.needsLetter);
const strip = (s) => s.toLowerCase().replace(/[áéíóú]/g, (c) => 'aeiou'['áéíóú'.indexOf(c)]);
let bad = 0, n = 0; const fail = (m, e) => { if (bad++ < 10) console.log('FAIL', m, JSON.stringify(e)); };
for (const L of ['m', 'p', 'l', 's', 't', 'r', 'd', 'c', 'ch', 'a', 'ñ', 'z', 'k']) for (const s of lv.sublevels) {
  const rng = makeRng(7);
  for (let i = 0; i < 150; i++) {
    const e = s.gen(rng, { letra: L }); n++;
    const word = e.img && LENGUA_WORDS.find((w) => w.img === e.img);
    if (e.img && !word) { fail('img', e); continue; }
    if (e.img && !LENGUA_IMGS[e.img]) fail('sin imagen', e);
    if (JSON.stringify(e).match(/[^\x20-\x7e -ÿ]/)) fail('caracter', e);
    if (e.kind === 'pic' && e.tokens.length === 2 && e.tokens[0] === '__') { if (e.answer !== L || !word.w.startsWith(L) || e.tokens[1] !== word.w.slice(L.length)) fail('inicial', e); }
    else if (e.kind === 'pic' && e.tokens[1] === '__') { if (e.tokens[0] + e.answer + e.tokens[2] !== word.w || e.answer !== L) fail('falta', e); }
    else if (e.kind === 'pic' && e.tokens[1] === '+') { if (e.answer !== L + e.tokens[2] || !word.w.startsWith(e.answer)) fail('silaba', e); }
    else if (e.kind === 'pic') { if (e.answer !== word.w) fail('nombre', e); }
    else if (e.kind === 'choice' && e.options[0] === 'sí') { const yes = strip(word.w).startsWith(L) && !(L === 'c' && strip(word.w).startsWith('ch')) && !(L === 'l' && strip(word.w).startsWith('ll')); if ((e.answer === 'sí') !== yes) fail('sí/no', e); }
    else if (e.kind === 'choice') { const c = (strip(word.w).match(new RegExp(L.length > 1 ? L : '', 'g')) || []).length; if (L.length === 1 && L !== 'c' && L !== 'l' && L !== 'r' && L !== 'h') { const k = strip(word.w).split(L).length - 1; if (String(k) !== e.answer) fail('cuantas', e); } }
    else if (e.kind === 'match') { e.left.forEach((l, k) => { const w = LENGUA_WORDS.find((x) => x.img === l.img); if (e.right[+e.answer[k]].t !== w.w) fail('match', e); }); }
    else if (e.kind === 'copy') { if (!e.answer) fail('copy', e); }
  }
}
console.log(n, 'ejercicios; fallos:', bad);
process.exit(bad ? 1 : 0);
