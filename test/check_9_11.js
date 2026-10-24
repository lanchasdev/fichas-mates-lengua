const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..');
vm.runInThisContext(fs.readFileSync(path.join(root, 'js/rng.js'), 'utf8'));
vm.runInThisContext(fs.readFileSync(path.join(root, 'levels/levels_9_11.js'), 'utf8'));

let fails = 0, total = 0;
const bad = (id, m, ex) => { if (fails++ < 25) console.log('FALLO', id, m, JSON.stringify(ex)); };

// mini parser: verifica división exacta y restas sin negativos
function evalTok(toks) {
  let i = 0;
  const num = () => {
    const t = toks[i++];
    if (t === '(') { const v = expr(); if (toks[i++] !== ')') throw new Error('par'); return v; }
    if (typeof t !== 'number') throw new Error('num ' + t);
    return t;
  };
  const term = () => { let v = num(); while (toks[i] === '×' || toks[i] === '÷') { const o = toks[i++], r = num();
    if (o === '×') v *= r; else { if (r === 0 || v % r) throw new Error('div inexacta'); v /= r; } } return v; };
  const expr = () => { let v = term(); while (toks[i] === '+' || toks[i] === '-') { const o = toks[i++], r = term();
    v = o === '+' ? v + r : v - r; if (v < 0) throw new Error('negativo'); } return v; };
  const v = expr(); if (i !== toks.length) throw new Error('resto'); return v;
}
const dec = (s) => { const m = /^(\d+),(\d)$/.exec(s); if (!m) throw new Error('decimal ' + s); return +m[1] * 10 + +m[2]; };
const cmp = (a, b) => (a < b ? '<' : a > b ? '>' : '=');
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

const PROB = [
  [1, /^\S+ tiene (\d+) [^.]* y le regalan (\d+)\. ¿/, (a, b) => a + b],
  [1, /^\S+ tenía (\d+) [^.]* y ha perdido (\d+)\. ¿/, (a, b) => a - b],
  [1, /^En una caja hay (\d+) bolsas con (\d+) [^.]* cada una\. ¿/, (a, b) => a * b],
  [1, /^\S+ reparte (\d+) [^.]* entre (\d+) amigos por igual\. ¿/, (t, k) => { if (t % k) throw new Error('inexacta'); return t / k; }],
  [1, /^\S+ tiene (\d+) [^.]*\. Su hermana tiene el doble\. ¿/, (a) => 2 * a],
  [1, /^\S+ tiene (\d+) [^.]*\. Su hermana tiene la mitad\. ¿/, (a) => { if (a % 2) throw new Error('impar'); return a / 2; }],
  [1, /^Un \S+ cuesta (\d+) euros\. ¿Cuánto cuestan (\d+) \S+\?$/, (p, k) => p * k],
  [2, /^\S+ tiene (\d+) [^.]*\. Compra (\d+) bolsas con (\d+) [^.]* cada una\. ¿/, (a, b, c) => a + b * c],
  [2, /^\S+ tenía (\d+) [^.]*\. Regala (\d+) a cada uno de sus (\d+) amigos\. ¿/, (a, b, c) => a - b * c],
  [2, /^\S+ tiene (\d+) [^.]* y \S+ tiene (\d+)\. Se juntan y se reparten por igual entre (\d+) niños\. ¿/, (a, b, k) => { if ((a + b) % k) throw new Error('inexacta'); return (a + b) / k; }],
  [2, /^Un \S+ cuesta (\d+) euros\. \S+ compra (\d+) y paga con (\d+) euros\. ¿Cuántos euros le devuelven\?$/, (p, k, m) => m - p * k],
  [2, /^En una clase hay (\d+) niños y (\d+) niñas\. Se colocan en grupos de (\d+)\. ¿Cuántos grupos se forman\?$/, (a, b, c) => { if ((a + b) % c) throw new Error('inexacta'); return (a + b) / c; }],
  [2, /^\S+ lee (\d+) páginas cada día durante (\d+) días y aún le faltan (\d+) páginas para terminar el libro\. ¿/, (a, b, c) => a * b + c],
];

// devuelve { ans, steps? }
function solve(ex) {
  if (ex.kind === 'col') {
    const a = +ex.a, b = +ex.b;
    if (ex.op === '×') return a * b; if (ex.op === '+') return a + b; return a - b;
  }
  if (ex.kind === 'problem') {
    const hits = PROB.filter((p) => p[1].test(ex.text));
    if (hits.length !== 1) throw new Error('plantilla ' + hits.length);
    const m = ex.text.match(hits[0][1]);
    ex._steps = hits[0][0];
    return hits[0][2](...m.slice(1).map(Number));
  }
  const t = ex.tokens;
  if (typeof t[0] === 'object' && t[0].n !== undefined) {
    if (t[1] === '=') { // equivalente
      const [f, , g] = t; if (g.n !== '__') throw new Error('eq'); return (f.n * g.d) / f.d; }
    if (t[1] && t[1].box) { return cmp(t[0].n * t[2].d, t[2].n * t[0].d) ; }
    if (t[0].d !== t[2].d) throw new Error('den'); 
    const r = t[1] === '+' ? t[0].n + t[2].n : t[0].n - t[2].n;
    if (r <= 0 || r >= t[0].d) throw new Error('rango frac');
    return r + '/' + t[0].d;
  }
  if (typeof t[0] === 'string' && /^\d+,\d$/.test(t[0])) {
    if (t[1] && t[1].box) return cmp(dec(t[0]), dec(t[2]));
    const a = dec(t[0]), b = dec(t[2]), r = t[1] === '+' ? a + b : a - b;
    if (r < 0) throw new Error('neg');
    return Math.floor(r / 10) + ',' + (r % 10);
  }
  if (typeof t[0] === 'string' && /^(La|El) /.test(t[0])) {
    const n = t[1]; const w = t[0];
    if (w === 'La mitad de') { if (n % 2) throw new Error('impar'); return n / 2; }
    if (w === 'El doble de') return 2 * n; if (w === 'El triple de') return 3 * n;
    if (w === 'La cuarta parte de') { if (n % 4) throw new Error('no div 4'); return n / 4; }
    throw new Error('frase ' + w);
  }
  const eq = t.indexOf('=');
  if (t[eq + 1] !== '__' || t.length !== eq + 2) throw new Error('hueco');
  return evalTok(t.slice(0, eq));
}

const FORBID = /[^\x20-\x7E¿¡áéíóúüñÁÉÍÓÚÑ×÷]/;
const digits = (n) => String(n).length;
function extra(id, ex) {
  const t = ex.tokens;
  switch (id) {
    case '9.1': if (+ex.b % 10 || +ex.b < 20 || ex.a.length !== 2) return 'forma'; break;
    case '9.2': if (ex.b.length !== 1 || ex.a.length !== 2 || (+ex.a % 10) * +ex.b < 10) return 'sin llevada'; break;
    case '9.3': if (ex.a.length !== 2 || ex.b.length !== 2 || +ex.answer > 900) return 'forma'; break;
    case '9.4': if (t[1] !== '÷' || digits(t[0]) !== 2 || t[2] < 2 || t[2] > 9) return 'forma'; break;
    case '9.5': if (t[1] !== '÷' || digits(t[0]) !== 3 || t[2] < 2 || t[2] > 9) return 'forma'; break;
    case '11.1': if (t.includes('(') || !(t.includes('×') || t.includes('÷'))) return 'forma'; break;
    case '11.2': if (!t.includes('(')) return 'forma'; break;
    case '11.4': if (ex.kind !== 'problem' || ex._steps !== 1) return 'pasos'; break;
    case '11.5': if (ex.kind !== 'problem' || ex._steps !== 2) return 'pasos'; break;
  }
  if (ex.kind === 'problem' && +ex.answer > 999) return 'respuesta grande';
  return null;
}

for (const lv of KUMON_LEVELS.filter((l) => [9, 10, 11].includes(l.id))) {
  if (lv.sublevels.length < 4 || lv.sublevels.length > 6) bad(lv.id, 'nº subniveles', {});
  for (const sl of lv.sublevels) {
    const seen = new Set(); let n = 0;
    for (let seed = 1; seed <= 600; seed++) {
      const ex = sl.gen(makeRng(seed * 7919 + 13)); total++; n++;
      try {
        const exp = solve(ex);
        const want = Array.isArray(ex.answer) ? ex.answer : [ex.answer];
        if (want.length !== 1 || typeof want[0] !== 'string') throw new Error('answer no string');
        if (want[0] !== String(exp)) throw new Error('respuesta ' + want[0] + ' != ' + exp);
        if (/^-/.test(want[0])) throw new Error('negativa');
        const e = extra(sl.id, ex); if (e) throw new Error(e);
        const s = JSON.stringify(ex, (k, v) => (k === '_steps' ? undefined : v));
        if (FORBID.test(s.replace(/\\u[0-9a-f]{4}/g, ''))) throw new Error('caracter raro');
        seen.add(s);
      } catch (err) { bad(sl.id, err.message, ex); }
    }
    // determinismo
    if (JSON.stringify(sl.gen(makeRng(5))) !== JSON.stringify(sl.gen(makeRng(5)))) bad(sl.id, 'no determinista', {});
    if (seen.size < 60) bad(sl.id, 'poca variedad: ' + seen.size, {});
    if (!/^(cols2|cols3|wide)$/.test(sl.layout)) bad(sl.id, 'layout', {});
    console.log(sl.id.padEnd(5), sl.name.padEnd(38), sl.layout.padEnd(6), 'distintos:', seen.size);
  }
}
console.log(fails ? `FALLOS: ${fails}` : `OK: ${total} ejercicios verificados`);
process.exit(fails ? 1 : 0);
