(function (g) {
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  g.makeRng = function (seed) {
    const r = mulberry32(seed >>> 0);
    return {
      next: r,
      int: (a, b) => a + Math.floor(r() * (b - a + 1)),
      pick: (arr) => arr[Math.floor(r() * arr.length)],
      chance: (p) => r() < p,
      shuffle(arr) {
        const x = arr.slice();
        for (let i = x.length - 1; i > 0; i--) {
          const j = Math.floor(r() * (i + 1));
          [x[i], x[j]] = [x[j], x[i]];
        }
        return x;
      },
    };
  };
  g.KUMON_LEVELS = g.KUMON_LEVELS || [];
  g.LENGUA_LEVELS = g.LENGUA_LEVELS || [];
})(typeof window !== 'undefined' ? window : globalThis);
