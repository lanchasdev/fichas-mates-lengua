(function () {
  const L = KUMON_LEVELS;
  const ri = (rng, a, b) => rng.int(a, b);
  const fmt = (t) => Math.floor(t / 10) + ',' + (t % 10);
  const frac = (n, d) => ({ n: n, d: d });

  // ---------- Nivel 9 ----------
  function g91(rng) {
    const a = ri(rng, 12, 49), b = ri(rng, 2, 9) * 10;
    return { kind: 'col', a: String(a), b: String(b), op: '×', answer: String(a * b) };
  }
  function g92(rng) {
    const b = ri(rng, 2, 9);
    const u = ri(rng, Math.ceil(10 / b), 9), t = ri(rng, 1, 9);
    const a = t * 10 + u;
    return { kind: 'col', a: String(a), b: String(b), op: '×', answer: String(a * b) };
  }
  function g93(rng) {
    const ok = (lo, hi) => { const x = []; for (let i = lo; i <= hi; i++) if (i % 10) x.push(i); return x; };
    const a = rng.pick(ok(12, 35)), b = rng.pick(ok(12, 25));
    return { kind: 'col', a: String(a), b: String(b), op: '×', answer: String(a * b) };
  }
  function divG(lo, hi) {
    return function (rng) {
      const b = ri(rng, 2, 9);
      const q = ri(rng, Math.ceil(lo / b), Math.floor(hi / b));
      return { kind: 'divbox', a: String(b * q), b: String(b), answer: String(q) };
    };
  }
  const g94 = divG(10, 99), g95 = divG(100, 999);
  function g96(rng) { return rng.pick([g91, g92, g93, g94, g95])(rng); }

  // ---------- Nivel 10 ----------
  function g101(rng) {
    const d = ri(rng, 2, 8), n = ri(rng, 1, d - 1), k = ri(rng, 2, 5);
    return { kind: 'tokens', tokens: [frac(n, d), '=', frac('__', d * k)], answer: String(n * k) };
  }
  function g102(rng) {
    const d = ri(rng, 3, 12);
    if (rng.chance(0.5)) {
      const s = ri(rng, 2, d - 1), n1 = ri(rng, 1, s - 1), n2 = s - n1;
      return { kind: 'tokens', tokens: [frac(n1, d), '+', frac(n2, d), '=', '__'], answer: s + '/' + d };
    }
    const n1 = ri(rng, 2, d - 1), n2 = ri(rng, 1, n1 - 1);
    return { kind: 'tokens', tokens: [frac(n1, d), '-', frac(n2, d), '=', '__'], answer: (n1 - n2) + '/' + d };
  }
  function g103(rng) {
    const d = ri(rng, 3, 12);
    const a = ri(rng, 1, d - 1);
    const b = rng.chance(0.12) ? a : ri(rng, 1, d - 1);
    return { kind: 'tokens', tokens: [frac(a, d), { box: 9 }, frac(b, d)], answer: a < b ? '<' : a > b ? '>' : '=' };
  }
  function g104(rng) {
    for (let i = 0; i < 50; i++) {
      const a = ri(rng, 11, 99), b = ri(rng, 11, 99);
      if (a % 10 === 0 || b % 10 === 0) continue;
      if (rng.chance(0.5)) {
        if ((a + b) % 10 === 0 || a + b > 150) continue;
        return { kind: 'tokens', tokens: [fmt(a), '+', fmt(b), '=', '__'], answer: fmt(a + b) };
      }
      const x = Math.max(a, b), y = Math.min(a, b);
      if (x === y || (x - y) % 10 === 0) continue;
      return { kind: 'tokens', tokens: [fmt(x), '-', fmt(y), '=', '__'], answer: fmt(x - y) };
    }
    return { kind: 'tokens', tokens: ['2,5', '+', '1,3', '=', '__'], answer: '3,8' };
  }
  function g105(rng) {
    let a, b;
    if (rng.chance(0.4)) { const e = ri(rng, 0, 9) * 10; a = e + ri(rng, 0, 9); b = e + ri(rng, 0, 9); }
    else { a = ri(rng, 5, 99); b = ri(rng, 5, 99); }
    if (rng.chance(0.1)) b = a;
    return { kind: 'tokens', tokens: [fmt(a), { box: 9 }, fmt(b)], answer: a < b ? '<' : a > b ? '>' : '=' };
  }
  function g106(rng) { return rng.pick([g101, g102, g103, g104, g105])(rng); }

  // ---------- Nivel 11 ----------
  function g111(rng) {
    const f = ri(rng, 0, 5);
    const b = ri(rng, 2, 9), c = ri(rng, 2, 9);
    if (f === 0) { const a = ri(rng, 2, 30); return { kind: 'tokens', tokens: [a, '+', b, '×', c, '=', '__'], answer: String(a + b * c) }; }
    if (f === 1) { const a = ri(rng, 2, 30); return { kind: 'tokens', tokens: [b, '×', c, '+', a, '=', '__'], answer: String(a + b * c) }; }
    if (f === 2) { const a = b * c + ri(rng, 1, 30); return { kind: 'tokens', tokens: [a, '-', b, '×', c, '=', '__'], answer: String(a - b * c) }; }
    const q = ri(rng, 2, 9), bb = c * q;
    if (f === 3) { const a = ri(rng, 2, 30); return { kind: 'tokens', tokens: [a, '+', bb, '÷', c, '=', '__'], answer: String(a + q) }; }
    if (f === 4) { const a = q + ri(rng, 1, 30); return { kind: 'tokens', tokens: [a, '-', bb, '÷', c, '=', '__'], answer: String(a - q) }; }
    const a = ri(rng, 2, 30);
    return { kind: 'tokens', tokens: [bb, '÷', c, '+', a, '=', '__'], answer: String(a + q) };
  }
  function g112(rng) {
    const f = ri(rng, 0, 3), c = ri(rng, 2, 9);
    if (f === 2) {
      const q = ri(rng, 3, 9), s = c * q, a = ri(rng, 1, s - 1);
      return { kind: 'tokens', tokens: ['(', a, '+', s - a, ')', '÷', c, '=', '__'], answer: String(q) };
    }
    const a = ri(rng, 1, 20), b = ri(rng, 1, 20);
    if (f === 0) return { kind: 'tokens', tokens: ['(', a, '+', b, ')', '×', c, '=', '__'], answer: String((a + b) * c) };
    if (f === 3) return { kind: 'tokens', tokens: [c, '×', '(', a, '+', b, ')', '=', '__'], answer: String((a + b) * c) };
    const x = Math.max(a, b) + ri(rng, 0, 0), y = Math.min(a, b);
    const xx = x === y ? x + 1 : x;
    return { kind: 'tokens', tokens: ['(', xx, '-', y, ')', '×', c, '=', '__'], answer: String((xx - y) * c) };
  }
  function g113(rng) {
    const f = ri(rng, 0, 3);
    if (f === 0) { const n = ri(rng, 1, 50) * 2; return { kind: 'tokens', tokens: ['La mitad de', n, '=', '__'], answer: String(n / 2) }; }
    if (f === 1) { const n = ri(rng, 2, 50); return { kind: 'tokens', tokens: ['El doble de', n, '=', '__'], answer: String(n * 2) }; }
    if (f === 2) { const n = ri(rng, 2, 30); return { kind: 'tokens', tokens: ['El triple de', n, '=', '__'], answer: String(n * 3) }; }
    const n = ri(rng, 2, 25) * 4;
    return { kind: 'tokens', tokens: ['La cuarta parte de', n, '=', '__'], answer: String(n / 4) };
  }

  const NAMES = ['Ana', 'Luis', 'Marta', 'Pablo', 'Lucía', 'Hugo', 'Carmen', 'Daniel', 'Sofía', 'Álvaro', 'Nuria', 'Iván', 'Elena', 'Jorge'];
  const OBJS = [['cromos', 'm'], ['canicas', 'f'], ['pegatinas', 'f'], ['lápices', 'm'], ['galletas', 'f'], ['libros', 'm'], ['globos', 'm'], ['caramelos', 'm']];
  const ITEMS = [['bocadillo', 'bocadillos'], ['cuaderno', 'cuadernos'], ['helado', 'helados'], ['bolígrafo', 'bolígrafos'], ['juguete', 'juguetes']];
  function ctx(rng) {
    const names = rng.shuffle(NAMES), ob = rng.pick(OBJS);
    return { N: names[0], M: names[1], o: ob[0], Cu: ob[1] === 'm' ? 'Cuántos' : 'Cuántas' };
  }
  const P = (text, answer) => ({ kind: 'problem', text: text, answer: String(answer) });

  const ONE = [
    function (rng) { const c = ctx(rng), a = ri(rng, 10, 60), b = ri(rng, 5, 40);
      return P(`${c.N} tiene ${a} ${c.o} y le regalan ${b}. ¿${c.Cu} ${c.o} tiene ahora?`, a + b); },
    function (rng) { const c = ctx(rng), b = ri(rng, 5, 30), a = b + ri(rng, 5, 40);
      return P(`${c.N} tenía ${a} ${c.o} y ha perdido ${b}. ¿${c.Cu} ${c.o} le quedan?`, a - b); },
    function (rng) { const c = ctx(rng), a = ri(rng, 3, 9), b = ri(rng, 3, 12);
      return P(`En una caja hay ${a} bolsas con ${b} ${c.o} cada una. ¿${c.Cu} ${c.o} hay en total?`, a * b); },
    function (rng) { const c = ctx(rng), k = ri(rng, 2, 9), q = ri(rng, 3, 12);
      return P(`${c.N} reparte ${k * q} ${c.o} entre ${k} amigos por igual. ¿${c.Cu} ${c.o} recibe cada amigo?`, q); },
    function (rng) { const c = ctx(rng);
      if (rng.chance(0.5)) { const a = ri(rng, 5, 45); return P(`${c.N} tiene ${a} ${c.o}. Su hermana tiene el doble. ¿${c.Cu} ${c.o} tiene su hermana?`, a * 2); }
      const a = ri(rng, 3, 40) * 2; return P(`${c.N} tiene ${a} ${c.o}. Su hermana tiene la mitad. ¿${c.Cu} ${c.o} tiene su hermana?`, a / 2); },
    function (rng) { const it = rng.pick(ITEMS), p = ri(rng, 2, 9), k = ri(rng, 2, 9);
      return P(`Un ${it[0]} cuesta ${p} euros. ¿Cuánto cuestan ${k} ${it[1]}?`, p * k); },
  ];
  const TWO = [
    function (rng) { const c = ctx(rng), a = ri(rng, 5, 30), b = ri(rng, 2, 6), d = ri(rng, 2, 9);
      return P(`${c.N} tiene ${a} ${c.o}. Compra ${b} bolsas con ${d} ${c.o} cada una. ¿${c.Cu} ${c.o} tiene ahora?`, a + b * d); },
    function (rng) { const c = ctx(rng), b = ri(rng, 2, 6), d = ri(rng, 2, 5), a = b * d + ri(rng, 2, 20);
      return P(`${c.N} tenía ${a} ${c.o}. Regala ${b} a cada uno de sus ${d} amigos. ¿${c.Cu} ${c.o} le quedan?`, a - b * d); },
    function (rng) { const c = ctx(rng), k = ri(rng, 2, 6), q = ri(rng, 3, 9), t = k * q, a = ri(rng, 1, t - 1);
      return P(`${c.N} tiene ${a} ${c.o} y ${c.M} tiene ${t - a}. Se juntan y se reparten por igual entre ${k} niños. ¿${c.Cu} ${c.o} recibe cada niño?`, q); },
    function (rng) { const c = ctx(rng), it = rng.pick(ITEMS), p = ri(rng, 2, 9), k = ri(rng, 2, 5), t = p * k;
      const m = rng.pick([10, 20, 50].filter((x) => x > t));
      return P(`Un ${it[0]} cuesta ${p} euros. ${c.N} compra ${k} y paga con ${m} euros. ¿Cuántos euros le devuelven?`, m - t); },
    function (rng) { const c = ri(rng, 2, 6), q = ri(rng, 3, 8), t = c * q, a = ri(rng, 4, t - 4);
      return P(`En una clase hay ${a} niños y ${t - a} niñas. Se colocan en grupos de ${c}. ¿Cuántos grupos se forman?`, q); },
    function (rng) { const c = ctx(rng), a = ri(rng, 5, 15), b = ri(rng, 3, 9), d = ri(rng, 5, 40);
      return P(`${c.N} lee ${a} páginas cada día durante ${b} días y aún le faltan ${d} páginas para terminar el libro. ¿Cuántas páginas tiene el libro?`, a * b + d); },
  ];
  const g114 = (rng) => rng.pick(ONE)(rng);
  const g115 = (rng) => rng.pick(TWO)(rng);
  function g116(rng) {
    const f = ri(rng, 0, 9);
    if (f < 2) return g111(rng);
    if (f < 4) return g112(rng);
    if (f < 5) return g113(rng);
    if (f < 7) return g114(rng);
    return g115(rng);
  }

  L.push({
    id: 9, name: 'Multiplicar por 2 cifras y dividir', age: '9-10 años',
    sublevels: [
      { id: '9.1', name: 'Multiplicar por múltiplos de 10', layout: 'cols3', gen: g91 },
      { id: '9.2', name: 'Multiplicar por 1 cifra llevando', layout: 'cols3', gen: g92 },
      { id: '9.3', name: 'Multiplicar 2 cifras por 2 cifras', layout: 'cols3', gen: g93 },
      { id: '9.4', name: 'Dividir 2 cifras entre 1 cifra', layout: 'cols3', gen: g94 },
      { id: '9.5', name: 'Dividir 3 cifras entre 1 cifra', layout: 'cols3', gen: g95 },
      { id: '9.6', name: 'Repaso mixto', layout: 'cols3', gen: g96 },
    ],
  });
  L.push({
    id: 10, name: 'Fracciones y decimales', age: '10 años',
    sublevels: [
      { id: '10.1', name: 'Fracciones equivalentes', layout: 'cols2', gen: g101 },
      { id: '10.2', name: 'Sumar y restar fracciones', layout: 'cols2', gen: g102 },
      { id: '10.3', name: 'Comparar fracciones', layout: 'cols3', gen: g103 },
      { id: '10.4', name: 'Sumar y restar decimales', layout: 'cols2', gen: g104 },
      { id: '10.5', name: 'Comparar decimales', layout: 'cols3', gen: g105 },
      { id: '10.6', name: 'Repaso mixto', layout: 'cols2', gen: g106 },
    ],
  });
  L.push({
    id: 11, name: 'Operaciones combinadas y problemas', age: '10 años',
    sublevels: [
      { id: '11.1', name: 'Prioridad de × y ÷', layout: 'cols2', gen: g111 },
      { id: '11.2', name: 'Paréntesis', layout: 'cols2', gen: g112 },
      { id: '11.3', name: 'Mitad, doble, triple y cuarta parte', layout: 'cols2', gen: g113 },
      { id: '11.4', name: 'Problemas de un paso', layout: 'wide', gen: g114 },
      { id: '11.5', name: 'Problemas de dos pasos', layout: 'wide', gen: g115 },
      { id: '11.6', name: 'Repaso final mixto', layout: 'wide', gen: g116 },
    ],
  });
})();
