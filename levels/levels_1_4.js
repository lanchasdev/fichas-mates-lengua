// Niveles 1 a 4 (7-8 años). Código plano, usa solo rng.
(function () {
  const S = String;
  const T = (a, op, b, ans) => ({ kind: 'tokens', tokens: [a, op, b, '=', '__'], answer: S(ans) });
  const COL = (a, op, b, ans) => ({ kind: 'col', a: S(a), b: S(b), op, answer: S(ans) });

  // Serie numérica: len elementos, paso step, ascendente o descendente, valores en [min,max].
  function seq(rng, o) {
    const span = o.step * (o.len - 1);
    let start;
    if (o.mult) {
      const kLo = Math.ceil(o.min / o.step), kHi = Math.floor((o.max - span) / o.step);
      start = rng.int(kLo, kHi) * o.step;
    } else {
      start = rng.int(o.min, o.max - span);
    }
    let vals = [];
    for (let i = 0; i < o.len; i++) vals.push(start + i * o.step);
    if (o.down) vals.reverse();
    const idx = rng.shuffle(vals.map((_, i) => i)).slice(0, o.holes).sort((a, b) => a - b);
    const items = vals.map((v, i) => (idx.indexOf(i) >= 0 ? null : v));
    return { kind: 'seq', items, answer: idx.map((i) => S(vals[i])) };
  }

  function compare(rng) {
    const a = rng.int(1, 100);
    let b;
    if (rng.chance(0.15)) b = a;
    else if (rng.chance(0.5)) b = Math.min(100, Math.max(1, a + rng.int(-9, 9)));
    else b = rng.int(1, 100);
    const sign = a < b ? '<' : a > b ? '>' : '=';
    return { kind: 'tokens', tokens: [a, { box: 9 }, b], answer: sign };
  }

  function antesDespues(rng) {
    if (rng.chance(0.5)) {
      const n = rng.int(2, 100);
      return { kind: 'tokens', tokens: ['Antes de', n, 'va', '__'], answer: S(n - 1) };
    }
    const n = rng.int(1, 99);
    return { kind: 'tokens', tokens: ['Después de', n, 'va', '__'], answer: S(n + 1) };
  }

  // ---- Nivel 2
  const suma10 = (rng) => { const a = rng.int(1, 9), b = rng.int(1, 10 - a); return T(a, '+', b, a + b); };
  const resta10 = (rng) => { const a = rng.int(2, 10), b = rng.int(1, a - 1); return T(a, '-', b, a - b); };
  const cero_uno = (rng) => {
    const a = rng.int(0, 19), z = rng.int(0, 1);
    return rng.chance(0.5) ? T(a, '+', z, a + z) : T(z, '+', a, a + z);
  };
  const suma20s = (rng) => {
    const u = rng.int(0, 8), a = 10 + u, b = rng.int(1, 9 - u);
    return rng.chance(0.5) ? T(a, '+', b, a + b) : T(b, '+', a, a + b);
  };
  const resta20s = (rng) => {
    if (rng.chance(0.15)) { const a = rng.int(10, 19); return T(a, '-', 10, a - 10); }
    const u = rng.int(1, 9), a = 10 + u, b = rng.int(1, u);
    return T(a, '-', b, a - b);
  };

  // ---- Nivel 3
  const rev = (tokens, ans) => ({ kind: 'tokens', tokens, answer: S(ans) });
  const suma_pasa = (rng) => {
    const a = rng.int(2, 9), b = rng.int(Math.max(2, 11 - a), 9), c = a + b;
    return rng.chance(0.25) ? rev(['__', '=', a, '+', b], c) : T(a, '+', b, c);
  };
  const resta_pasa = (rng) => {
    const a = rng.int(10, 18), b = rng.int(Math.max(1, (a % 10) + 1), 9), c = a - b;
    return rng.chance(0.25) ? rev(['__', '=', a, '-', b], c) : T(a, '-', b, c);
  };
  const compl10 = (rng) => {
    const a = rng.int(1, 9), b = 10 - a;
    switch (rng.int(0, 5)) {
      case 0: return rev([a, '+', '__', '=', 10], b);
      case 1: return rev(['__', '+', a, '=', 10], b);
      case 2: return rev([10, '-', a, '=', '__'], b);
      case 3: return rev([10, '-', '__', '=', a], b);
      case 4: return rev([10, '=', a, '+', '__'], b);
      default: return rev([10, '=', '__', '+', a], b);
    }
  };
  const huecos = (rng) => {
    const c = rng.int(11, 20), y = rng.int(1, c - 1), x = c - y;
    switch (rng.int(0, 3)) {
      case 0: return rev([x, '+', '__', '=', c], y);
      case 1: return rev(['__', '+', y, '=', c], x);
      case 2: return rev([c, '-', '__', '=', x], y);
      default: return rev(['__', '-', y, '=', x], c);
    }
  };
  const dobles = (rng) => {
    const a = rng.int(1, 10);
    switch (rng.int(0, 4)) {
      case 0: return rev([a, '+', a, '=', '__'], 2 * a);
      case 1: return rev(['__', '+', a, '=', 2 * a], a);
      case 2: return rev([a, '+', '__', '=', 2 * a], a);
      case 3: return rev([2 * a, '-', a, '=', '__'], a);
      default: return rev([2 * a, '-', '__', '=', a], a);
    }
  };

  // ---- Nivel 4
  const col_suma = (rng) => {
    const t1 = rng.int(1, 8), t2 = rng.int(1, 9 - t1), u1 = rng.int(0, 9), u2 = rng.int(0, 9 - u1);
    const a = t1 * 10 + u1, b = t2 * 10 + u2;
    return COL(a, '+', b, a + b);
  };
  const col_resta = (rng) => {
    let t1 = rng.int(1, 9), t2 = rng.int(1, t1), u1 = rng.int(0, 9), u2 = rng.int(0, u1);
    if (t1 === t2 && u1 === u2) { if (u1 > 0) u2 = u1 - 1; else t1 = Math.min(9, t1 + 1); }
    const a = t1 * 10 + u1, b = t2 * 10 + u2;
    return COL(a, '-', b, a - b);
  };
  const decenas = (rng) => {
    if (rng.chance(0.5)) { const a = rng.int(1, 9), b = rng.int(1, 10 - a); return T(a * 10, '+', b * 10, (a + b) * 10); }
    const a = rng.int(2, 10), b = rng.int(1, a - 1); return T(a * 10, '-', b * 10, (a - b) * 10);
  };
  const dos_uno = (rng) => {
    const t = rng.int(1, 9), u = rng.int(0, 9), a = t * 10 + u;
    if (rng.chance(0.5) && u < 9) { const b = rng.int(1, 9 - u); return COL(a, '+', b, a + b); }
    if (u >= 1) { const b = rng.int(1, u); return COL(a, '-', b, a - b); }
    const u2 = rng.int(0, 8), a2 = t * 10 + u2, b2 = rng.int(1, 9 - u2);
    return COL(a2, '+', b2, a2 + b2);
  };

  const mix = (fns) => (rng) => rng.pick(fns)(rng);
  const mix2 = [suma10, resta10, cero_uno, suma20s, resta20s];
  const mix3 = [suma_pasa, resta_pasa, compl10, huecos, dobles];
  const mix4 = [col_suma, col_resta, decenas, dos_uno];

  KUMON_LEVELS.push({
    id: 1, name: 'Números y series', age: '7 años',
    sublevels: [
      { id: '1.1', name: 'Series hasta 50', layout: 'cols2',
        gen: (rng) => seq(rng, { len: 6, step: 1, min: 1, max: 50, holes: 2 }) },
      { id: '1.2', name: 'Series hasta 100', layout: 'cols2',
        gen: (rng) => seq(rng, { len: 7, step: 1, min: 45, max: 100, holes: 2 }) },
      { id: '1.3', name: 'Series hacia atrás', layout: 'cols2',
        gen: (rng) => seq(rng, { len: 7, step: 1, min: 1, max: 100, holes: 2, down: true }) },
      { id: '1.4', name: 'Saltos de 2, 5 y 10', layout: 'wide',
        gen: (rng) => {
          const step = rng.pick([2, 5, 10]);
          return seq(rng, { len: 8, step, min: step === 2 ? 2 : 0, max: 100, holes: 3, mult: step !== 2 });
        } },
      { id: '1.5', name: 'Número anterior y siguiente', layout: 'cols2', gen: antesDespues },
      { id: '1.6', name: 'Comparar con < > = (repaso)', layout: 'cols2',
        gen: (rng) => {
          const r = rng.next();
          if (r < 0.7) return compare(rng);
          if (r < 0.85) return antesDespues(rng);
          return seq(rng, { len: 6, step: 1, min: 1, max: 100, holes: 2, down: rng.chance(0.5) });
        } },
    ],
  });

  KUMON_LEVELS.push({
    id: 2, name: 'Sumas y restas hasta 20', age: '7 años',
    sublevels: [
      { id: '2.1', name: 'Sumas hasta 10', layout: 'cols3', gen: suma10 },
      { id: '2.2', name: 'Restas hasta 10', layout: 'cols3', gen: resta10 },
      { id: '2.3', name: 'Sumar 0 y 1', layout: 'cols3', gen: cero_uno },
      { id: '2.4', name: 'Sumas hasta 20 sin pasar la decena', layout: 'cols3', gen: suma20s },
      { id: '2.5', name: 'Restas hasta 20 sin pasar la decena', layout: 'cols3', gen: resta20s },
      { id: '2.6', name: 'Repaso mixto', layout: 'cols3', gen: mix(mix2) },
    ],
  });

  KUMON_LEVELS.push({
    id: 3, name: 'Pasando la decena', age: '7-8 años',
    sublevels: [
      { id: '3.1', name: 'Sumas pasando la decena', layout: 'cols3', gen: suma_pasa },
      { id: '3.2', name: 'Restas pasando la decena', layout: 'cols3', gen: resta_pasa },
      { id: '3.3', name: 'Complementos a 10', layout: 'cols2', gen: compl10 },
      { id: '3.4', name: 'Huecos hasta 20', layout: 'cols2', gen: huecos },
      { id: '3.5', name: 'Dobles', layout: 'cols2', gen: dobles },
      { id: '3.6', name: 'Repaso mixto', layout: 'cols2', gen: mix(mix3) },
    ],
  });

  KUMON_LEVELS.push({
    id: 4, name: 'Operaciones de dos cifras', age: '8 años',
    sublevels: [
      { id: '4.1', name: 'Sumas de 2 cifras sin llevar', layout: 'cols3', gen: col_suma },
      { id: '4.2', name: 'Restas de 2 cifras sin llevar', layout: 'cols3', gen: col_resta },
      { id: '4.3', name: 'Decenas exactas', layout: 'cols3', gen: decenas },
      { id: '4.4', name: '2 cifras más o menos 1 cifra', layout: 'cols3', gen: dos_uno },
      { id: '4.5', name: 'Repaso mixto', layout: 'cols3', gen: mix(mix4) },
    ],
  });
})();
