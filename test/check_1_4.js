// Comprueba niveles 1-4 recalculando las respuestas de forma independiente.
const path = require('path');
require(path.join(__dirname, '..', 'js', 'rng.js'));
require(path.join(__dirname, '..', 'levels', 'levels_1_4.js'));

const N = 600;
let errors = 0;
function fail(id, msg, ex) {
  if (errors++ < 25) console.log('FALLO ' + id + ': ' + msg + ' -> ' + JSON.stringify(ex));
}

// Convierte un ejercicio en {x, op, y, r, holes} rellenando los huecos con la respuesta.
function parseArith(ex) {
  if (ex.kind === 'col') {
    if (typeof ex.a !== 'string' || typeof ex.b !== 'string') return null;
    return { x: +ex.a, op: ex.op, y: +ex.b, r: +ex.answer, holes: 0, col: true, eq: true };
  }
  if (ex.kind !== 'tokens' || ex.tokens.indexOf('=') < 0) return null;
  const ans = Array.isArray(ex.answer) ? ex.answer.slice() : [ex.answer];
  let holes = 0;
  const t = ex.tokens.map((k) => (k === '__' ? (holes++, +ans.shift()) : k));
  if (ans.length) return null;
  const e = t.indexOf('=');
  const L = t.slice(0, e), R = t.slice(e + 1);
  const val = (s) => {
    if (s.length === 1) return s[0];
    if (s.length !== 3) return NaN;
    return s[1] === '+' ? s[0] + s[2] : s[1] === '-' ? s[0] - s[2] : NaN;
  };
  const ex3 = L.length === 3 ? L : R;
  const other = L.length === 3 ? R : L;
  const eq = val(L) === val(R);
  return { x: ex3[0], op: ex3[1], y: ex3[2], r: other[0], holes, eq };
}

const inR = (v, a, b) => Number.isInteger(v) && v >= a && v <= b;

const arith = {
  '2.1': (p) => p.op === '+' && inR(p.x, 1, 9) && inR(p.y, 1, 9) && p.r <= 10,
  '2.2': (p) => p.op === '-' && inR(p.x, 2, 10) && inR(p.y, 1, 9) && inR(p.r, 1, 9),
  '2.3': (p) => p.op === '+' && inR(p.r, 0, 20) && ((p.x <= 1 && p.y <= 19) || (p.y <= 1 && p.x <= 19)),
  '2.4': (p) => p.op === '+' && p.r <= 19 && p.x >= 0 && p.y >= 0 && Math.max(p.x, p.y) >= 10 && Math.min(p.x, p.y) <= 9 && (p.x % 10) + (p.y % 10) <= 9,
  '2.5': (p) => p.op === '-' && inR(p.x, 10, 19) && inR(p.y, 1, 10) && inR(p.r, 0, 19) && (p.y === 10 || p.y <= p.x % 10),
  '3.1': (p) => p.op === '+' && inR(p.x, 2, 9) && inR(p.y, 2, 9) && inR(p.r, 11, 18),
  '3.2': (p) => p.op === '-' && inR(p.x, 10, 18) && inR(p.y, 1, 9) && inR(p.r, 1, 9) && p.y > p.x % 10,
  '3.3': (p) => (p.op === '+' && p.r === 10 && inR(p.x, 1, 9) && inR(p.y, 1, 9)) || (p.op === '-' && p.x === 10 && inR(p.y, 1, 9) && inR(p.r, 1, 9)),
  '3.4': (p) => p.holes === 1 && ((p.op === '+' && inR(p.r, 11, 20) && p.x >= 1 && p.y >= 1) || (p.op === '-' && inR(p.x, 11, 20) && p.y >= 1 && p.r >= 1 && p.x - p.y === p.r)),
  '3.5': (p) => (p.op === '+' && p.x === p.y && p.r === 2 * p.x && inR(p.x, 1, 10)) || (p.op === '-' && p.x === 2 * p.y && p.r === p.y && inR(p.y, 1, 10)),
  '4.1': (p) => p.col && p.op === '+' && inR(p.x, 10, 99) && inR(p.y, 10, 99) && (p.x % 10) + (p.y % 10) <= 9 && Math.floor(p.x / 10) + Math.floor(p.y / 10) <= 9,
  '4.2': (p) => p.col && p.op === '-' && inR(p.x, 10, 99) && inR(p.y, 10, 99) && p.x > p.y && (p.x % 10) >= (p.y % 10) && p.r >= 1,
  '4.3': (p) => !p.col && p.x % 10 === 0 && p.y % 10 === 0 && p.r % 10 === 0 && p.holes === 1 && p.x >= 10 && p.y >= 10 && p.r >= 0 && p.r <= 100 && p.x <= 100,
  '4.4': (p) => p.col && inR(p.x, 10, 99) && inR(p.y, 1, 9) && ((p.op === '+' && (p.x % 10) + p.y <= 9) || (p.op === '-' && p.y <= p.x % 10)),
};
const mixes = {
  '2.6': ['2.1', '2.2', '2.3', '2.4', '2.5'],
  '3.6': ['3.1', '3.2', '3.3', '3.4', '3.5'],
  '4.5': ['4.1', '4.2', '4.3', '4.4'],
};

function checkSeq(ex, id) {
  const a = ex.answer.slice();
  const v = ex.items.map((i) => (i === null ? +a.shift() : i));
  if (a.length) return 'respuestas sobrantes';
  const d = v[1] - v[0];
  for (let i = 1; i < v.length; i++) if (v[i] - v[i - 1] !== d) return 'no es serie';
  if (ex.items.filter((i) => i === null).length < 1) return 'sin huecos';
  if (ex.items.filter((i) => i !== null).length < 3) return 'pocos datos';
  const lo = Math.min(...v), hi = Math.max(...v);
  if (id === '1.1') return d === 1 && lo >= 1 && hi <= 50 && v.length === 6 ? '' : 'rango 1.1';
  if (id === '1.2') return d === 1 && lo >= 1 && hi <= 100 && v.length <= 7 && hi > 50 && lo >= 45 ? '' : 'rango 1.2';
  if (id === '1.3') return d === -1 && lo >= 1 && hi <= 100 && v.length <= 7 ? '' : 'rango 1.3';
  if (id === '1.4') return [2, 5, 10].includes(d) && lo >= 0 && hi <= 100 && v.length <= 10 && (d === 2 || (lo % d === 0)) ? '' : 'rango 1.4';
  if (id === '1.6') return Math.abs(d) === 1 && lo >= 1 && hi <= 100 ? '' : 'rango 1.6';
  return 'id seq';
}

function checkCompare(ex) {
  if (ex.tokens.length !== 3 || typeof ex.tokens[1] !== 'object' || !('box' in ex.tokens[1])) return false;
  const [a, , b] = ex.tokens;
  if (!inR(a, 1, 100) || !inR(b, 1, 100)) return false;
  return ex.answer === (a < b ? '<' : a > b ? '>' : '=');
}
function checkAnt(ex) {
  const t = ex.tokens;
  if (t.length !== 4 || t[2] !== 'va' || t[3] !== '__') return false;
  if (t[0] === 'Antes de') return inR(t[1], 2, 100) && ex.answer === String(t[1] - 1);
  if (t[0] === 'Después de') return inR(t[1], 1, 99) && ex.answer === String(t[1] + 1);
  return false;
}

const okChars = /^[\x20-\x7E¿¡áéíóúüñÁÉÍÓÚÑ]*$/;
const levels = KUMON_LEVELS.filter((l) => l.id >= 1 && l.id <= 4);
if (levels.length !== 4) { console.log('Faltan niveles'); process.exit(1); }

for (const lv of levels) {
  if (lv.sublevels.length < 4 || lv.sublevels.length > 6) fail(lv.id, 'num subniveles', {});
  for (const sl of lv.sublevels) {
    if (!['cols3', 'cols2', 'wide'].includes(sl.layout)) fail(sl.id, 'layout', sl.layout);
    const seen = new Set();
    for (let s = 1; s <= N; s++) {
      const ex = sl.gen(makeRng(s * 7919 + lv.id));
      const j = JSON.stringify(ex);
      seen.add(j);
      if (!okChars.test(j.replace(/"[^"]*":/g, ''))) fail(sl.id, 'caracteres', ex);
      const arr = Array.isArray(ex.answer) ? ex.answer : [ex.answer];
      if (!arr.every((x) => typeof x === 'string')) { fail(sl.id, 'answer no string', ex); continue; }
      if (!arr.every((x) => /^(\d+|<|>|=)$/.test(x))) fail(sl.id, 'answer rara', ex);
      let ok = false, why = '';
      if (ex.kind === 'seq') {
        why = checkSeq(ex, sl.id); ok = why === '';
        if (sl.layout !== 'wide' && ex.items.length > 7) ok = false;
        if (ex.items.length > 10) ok = false;
      } else if (sl.id === '1.5') ok = checkAnt(ex);
      else if (sl.id === '1.6') ok = ex.kind === 'seq' ? checkSeq(ex, '1.6') === '' : checkCompare(ex) || checkAnt(ex);
      else {
        const p = parseArith(ex);
        if (!p) why = 'no parseable';
        else if (!p.eq) why = 'ecuacion falsa';
        else if (!(p.r >= 0)) why = 'negativo';
        else {
          const ids = mixes[sl.id] || [sl.id];
          const a = (p.col ? p.x + (p.op === '+' ? p.y : -p.y) === p.r : true);
          ok = a && ids.some((i) => arith[i](p));
          if (!ok) why = 'fuera de subnivel';
        }
        if (p && p.holes === 0 && !p.col) ok = false;
      }
      if (!ok) fail(sl.id, why || 'invalido', ex);
    }
    if (seen.size < 40) fail(sl.id, 'espacio pequeno: ' + seen.size, {});
    console.log(sl.id.padEnd(4), sl.layout.padEnd(6), String(seen.size).padStart(4) + ' distintos', sl.name);
  }
}
if (errors) { console.log('ERRORES: ' + errors); process.exit(1); }
console.log('OK: todos los subniveles pasan (' + N + ' ejercicios cada uno)');
