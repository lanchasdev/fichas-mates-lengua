// Verifica con cálculo independiente: sumas repetidas, tablas y división en caja.
require('../js/rng.js');
['1_4','5_8','9_11','tablas'].forEach(f => require('../levels/levels_' + f + '.js'));
require('../js/order.js');
let bad = 0, n = 0;
const fail = (id, m, e) => { if (bad++ < 10) console.log('FAIL', id, m, JSON.stringify(e)); };
const L = KUMON_LEVELS;
console.log(L.map(l => l.id + ':' + l.name + '(' + l.sublevels.length + ')').join(' | '));
for (const lv of L) for (const s of lv.sublevels) {
  const r = makeRng(11), seen = new Set();
  for (let i = 0; i < 400; i++) {
    const e = s.gen(r); n++; seen.add(JSON.stringify(e));
    const ans = [].concat(e.answer).map(Number);
    if (lv.name === 'Dividir con caja' && e.kind === 'divbox') {
      const a = +e.a, b = +e.b;
      if (ans.length === 2 ? !(Math.floor(a / b) === ans[0] && a % b === ans[1] && ans[1] > 0) : !(a % b === 0 && a / b === ans[0])) fail(s.id, 'div', e);
      const m = /entre (\d+)(?:, (\d+))?(?: y (\d+))?/.exec(s.name);
      if (m && /Dividir entre/.test(s.name)) { const ok = [m[1], m[2], m[3]].filter(Boolean).map(Number); if (!ok.includes(b)) fail(s.id, 'divisor fuera del tema', e); }
    } else if (lv.name === 'Sumas repetidas') {
      const t = e.tokens, sum = (arr) => arr.filter(x => typeof x === 'number');
      const eq = t.indexOf('=');
      if (/Sumar siempre el (\d+)/.test(s.name)) {
        const n0 = +/(\d+)/.exec(s.name)[1];
        const nums = t.filter(x => typeof x === 'number');
        if (!nums.every(x => x === n0)) fail(s.id, 'número distinto', e);
        const k = nums.length; if (ans[0] !== k * n0) fail(s.id, 'suma', e);
      }
      if (/Cuántas veces/.test(s.name)) { const nums = t.slice(0, eq).filter(x => typeof x === 'number'); if (ans[0] !== nums.length || nums.some(x => x !== t[t.length - 1])) fail(s.id, 'veces', e); }
      if (/suma repetida a la mult/.test(s.name)) { const nums = t.slice(0, eq).filter(x => typeof x === 'number'); if (ans[0] !== nums.length * nums[0] || t[eq + 1] !== nums.length || t[eq + 3] !== nums[0]) fail(s.id, 's->p', e); }
      if (/multiplicación a la suma/.test(s.name)) { const k = t[0], v = t[2]; if (ans.length !== k + 1 || ans.slice(0, k).some(x => x !== v) || ans[k] !== k * v) fail(s.id, 'p->s', e); }
    } else if (lv.name === 'Tablas de multiplicar') {
      let a, b, p;
      if (e.kind === 'col') { a = +e.a; b = +e.b; p = ans[0]; if (a * b !== p) fail(s.id, 'col', e); }
      else {
        const t = e.tokens; const xs = t.filter(x => x !== '×' && x !== '=');
        const blank = xs.indexOf('__'); const vals = xs.map(x => x === '__' ? ans[0] : x);
        if (vals[0] * vals[1] !== vals[2]) fail(s.id, 'tabla', e);
        a = vals[0]; b = vals[1];
      }
      const m = /^Tabla del (\d+)$/.exec(s.name);
      if (m && a !== +m[1] && b !== +m[1]) fail(s.id, 'no es de la tabla', e);
      if (a < 1 || b < 1 || a > 10 || b > 10) fail(s.id, 'rango', e);
    }
  }
  s._d = seen.size;
}
console.log(n, 'ejercicios; fallos:', bad);
const low = L.flatMap(l => l.sublevels.filter(s => s._d < 20).map(s => s.id + '=' + s._d));
console.log('subniveles con <20 distintos:', low.join(' ') || 'ninguno');
process.exit(bad ? 1 : 0);
