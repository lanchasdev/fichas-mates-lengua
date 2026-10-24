# Contrato de los niveles (generador de fichas estilo Kumon)

Cada archivo `levels/*.js` añade niveles a `KUMON_LEVELS` (definido en `js/rng.js`, que ya existe).
Código JS plano (sin módulos, sin `import`), funciona en navegador (`window`) y en Node (`globalThis`).

```js
KUMON_LEVELS.push({
  id: 6,                       // número de nivel, único
  name: 'Tablas de multiplicar',
  age: '8-9 años',
  sublevels: [
    {
      id: '6.1',               // "nivel.subnivel"
      name: 'Tabla del 2',
      layout: 'cols3',         // 'cols3' | 'cols2' | 'wide'  (columnas de la ficha)
      gen(rng) { return { kind: 'tokens', tokens: [3, '×', 2, '=', '__'], answer: '6' }; },
    },
  ],
});
```

`gen(rng)` devuelve UN ejercicio. `rng` tiene `int(a,b)` (inclusivo), `pick(arr)`, `chance(p)`, `shuffle(arr)`, `next()`.
Usa SIEMPRE `rng` (nunca `Math.random`) para que la misma semilla dé la misma ficha.
Todas las `answer` son strings. Si hay varios huecos, `answer` es un array de strings en orden de aparición.

## Tipos de ejercicio (`kind`)

1. `col` — operación en vertical (suma, resta, multiplicación). Layout recomendado `cols3` (3 por fila) o `cols2`.
   `{ kind:'col', a:'47', b:'25', op:'+', answer:'72' }`  (`op` es `+`, `-` o `×`). `a` y `b` strings.
2. `tokens` — línea horizontal con piezas: strings/números se dibujan tal cual, `'__'` es un hueco (caja),
   `{box: 8}` hueco de 8 mm de ancho, `{n:1, d:4}` fracción. Layout recomendado `cols2` (o `cols3` si es corto).
   Ej.: `{kind:'tokens', tokens:[7,'+','__','=',11], answer:'4'}`.
   Comparar: `{kind:'tokens', tokens:[12,{box:9},15], answer:'<'}`.
   Fracciones: `tokens:[{n:1,d:4},'+',{n:2,d:4},'=',{n:'__',d:4}]`: `n` y `d` pueden ser número o `'__'` (hueco pequeño). Respuesta en `answer`.
3. `seq` — serie numérica con huecos: `{kind:'seq', items:[12,13,null,15,null], answer:['14','16']}`
   (`null` = hueco). Máx. 7 elementos en `cols2`, 10 en `wide`.
4. `problem` — problema con enunciado corto (1-3 frases) en layout `wide`:
   `{kind:'problem', text:'Ana tiene 12 canicas y le regalan 5. ¿Cuántas tiene ahora?', answer:'17'}`.

## Reglas
- Solo estos símbolos: `+ - × ÷ = < >` y letras latinas con tilde/ñ/¿/¡. NADA de emojis, `−`, `≤`, `½` ni Unicode raro (la fuente del PDF es Helvetica estándar). Fracciones solo con `{n,d}`.
- Idioma: español de España.
- No debe haber resultados negativos, divisiones inexactas (salvo el subnivel de resto, que se escribe `tokens:[17,'÷',5,'=','__','resto','__']`, answer `['3','2']`) ni resultados fuera del rango del subnivel.
- Cada subnivel introduce UNA sola novedad respecto al anterior (progresión gradual al estilo Kumon). Entre 3 y 6 subniveles por nivel; el último puede ser "repaso mixto".
- Debe poder generarse una hoja de hasta 30 ejercicios sin repetir mucho: el motor reintenta si sale un duplicado, así que el espacio de ejercicios posibles por subnivel debe ser claramente mayor que 30 (si es pequeño, el motor acepta repetidos tras 60 intentos; mejor evitarlo).
- `gen` debe ser rápido y sin bucles infinitos.
- Verifica tu trabajo con un script Node propio en `test/` que recalcule las respuestas de forma independiente (no reutilices la fórmula de `gen`) para cientos de ejercicios por subnivel.
