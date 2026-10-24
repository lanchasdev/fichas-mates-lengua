// Motor: genera fichas desde un subnivel + semilla y las dibuja en un PDF (jsPDF).
(function (g) {
  const PAGE = { w: 210, h: 297, mx: 15 };
  const COLS = { cols3: 3, cols2: 2, wide: 1 };
  const MAX_H = { pic: 34, choice: 34, match: 80, copy: 34, reading: 230, lines: 40, col: 52, divbox: 52, tokens: 24, seq: 24, problem: 40 };
  const ANS = [30, 90, 200];

  function keyOf(ex) {
    const { answer, ...rest } = ex;
    return JSON.stringify(rest);
  }

  function levelsOf(materia) { return materia === 'lengua' ? g.LENGUA_LEVELS : g.KUMON_LEVELS; }

  function findSub(levelId, subId, materia) {
    const lv = levelsOf(materia).find((l) => String(l.id) === String(levelId));
    return { lv, sub: lv && lv.sublevels.find((s) => s.id === subId) };
  }

  function makeSheet(sub, seed, count, ctx) {
    const rng = g.makeRng(seed);
    const seen = new Set();
    const items = [];
    for (let i = 0; i < count; i++) {
      let ex, tries = 0;
      do { ex = sub.gen(rng, ctx); tries++; } while (seen.has(keyOf(ex)) && tries < 60);
      seen.add(keyOf(ex));
      items.push(ex);
    }
    return { sub, seed, items, ctx };
  }

  // ---------- dibujo ----------
  function drawBox(doc, x, y, w, h) {
    doc.setDrawColor(60); doc.setLineWidth(0.4);
    doc.rect(x, y, w, h);
  }

  function ansText(doc, str, cx, base, size) {
    doc.setTextColor(...ANS); doc.setFontSize(size);
    doc.text(String(str), cx, base, { align: 'center' });
    doc.setTextColor(0);
  }

  function drawCol(doc, ex, x, y, w, h, answers, take) {
    const fs = 20, numW = 30;
    const right = x + w / 2 + numW / 2;
    const top = y + h * 0.28;
    doc.setFontSize(fs); doc.setTextColor(0);
    doc.text(String(ex.a), right, top, { align: 'right' });
    doc.text(String(ex.b), right, top + 10, { align: 'right' });
    doc.text(ex.op, right - numW + 2, top + 10);
    doc.setLineWidth(0.6); doc.setDrawColor(0);
    doc.line(right - numW, top + 13, right + 2, top + 13);
    if (answers) ansText(doc, take(), right - numW / 2 + 2, top + 24, fs);
  }

  // División en caja japonesa (método Kumon): divisor a la izquierda, dividendo dentro de la caja
  // y el cociente encima de la raya.
  let divStyle = 'jp';
  // Caja española: dividendo | divisor, cociente bajo el divisor (464 | 7).
  function drawDivBoxEs(doc, ex, x, y, w, h, answers, take) {
    const fs = 20, x0 = x + w / 2 - 22, top = y + h * 0.24, base = top + 8, vx = x0 + 20;
    doc.setFontSize(fs); doc.setTextColor(0);
    doc.text(String(ex.a), vx - 3, base, { align: 'right' });
    doc.text(String(ex.b), vx + 4, base);
    doc.setLineWidth(0.7); doc.setDrawColor(0);
    doc.line(vx, top - 2, vx, top + 34);
    doc.line(vx, base + 3, vx + 24, base + 3);
    const withRest = Array.isArray(ex.answer);
    if (answers) {
      ansText(doc, take(), vx + 12, base + 15, fs);
      if (withRest) ansText(doc, take(), x0 + 6, base + 25, 14);
    }
    if (withRest) {
      doc.setFontSize(9); doc.setTextColor(120);
      doc.text('resto', x0 - 9, base + 25);
      doc.setTextColor(0);
      drawBox(doc, x0 + 1, base + 19, 10, 8);
    }
  }

  function drawDivBox(doc, ex, x, y, w, h, answers, take) {
    if (divStyle === 'es') return drawDivBoxEs(doc, ex, x, y, w, h, answers, take);
    const fs = 20;
    doc.setFontSize(fs);
    const dw = Math.max(24, doc.getTextWidth(String(ex.a)) + 10);
    const x0 = x + w / 2 - (14 + dw) / 2, vx = x0 + 14;
    const top = y + h * 0.36, base = top + 8;
    doc.setTextColor(0);
    doc.text(String(ex.b), vx - 3, base, { align: 'right' });
    doc.text(String(ex.a), vx + 4, base);
    doc.setLineWidth(0.7); doc.setDrawColor(0);
    doc.line(vx, top - 2, vx, base + 3);
    doc.line(vx, top - 2, vx + dw, top - 2);
    const withRest = Array.isArray(ex.answer);
    if (answers) {
      ansText(doc, take(), vx + dw / 2 + 2, top - 5, fs);
    }
    if (withRest) {
      const by = base + 8;
      doc.setFontSize(9); doc.setTextColor(120);
      doc.text('resto', vx + 4, by + 5.5);
      doc.setTextColor(0);
      drawBox(doc, vx + 15, by, 10, 8);
      if (answers) ansText(doc, take(), vx + 20, by + 6, 14);
    }
  }

  function tokenWidth(doc, t, fs, bs) {
    if (t && typeof t === 'object' && 'n' in t) {
      const wn = t.n === '__' ? 7 : doc.getTextWidth(String(t.n));
      const wd = t.d === '__' ? 7 : doc.getTextWidth(String(t.d));
      return Math.max(wn, wd) + 3;
    }
    if (t === '__') return 14;
    if (t && typeof t === 'object' && 'box' in t) return t.box * (bs || 1);
    return doc.getTextWidth(String(t)) + 2;
  }

  function drawTokens(doc, tokens, x, base, maxW, answers, take, fs) {
    doc.setFontSize(fs);
    let bs = 1;
    const isBox = (t) => t && typeof t === 'object' && 'box' in t;
    let total = tokens.reduce((s, t) => s + tokenWidth(doc, t, fs, 1), 0);
    if (total > maxW) {
      const boxes = tokens.filter(isBox).reduce((s, t) => s + t.box, 0);
      if (boxes) bs = Math.max(0.45, (maxW - (total - boxes)) / boxes);
      total = tokens.reduce((s, t) => s + tokenWidth(doc, t, fs, bs), 0);
    }
    if (total > maxW) { fs = Math.max(11, fs * maxW / total); doc.setFontSize(fs); }
    let cx = x;
    for (const t of tokens) {
      const w = tokenWidth(doc, t, fs, bs);
      if (t && typeof t === 'object' && 'n' in t) {
        const mid = base - fs * 0.13;
        const part = (v, yy) => {
          if (v === '__') { drawBox(doc, cx + w / 2 - 3.5, yy - 5.5, 7, 6.5); if (answers) ansText(doc, take(), cx + w / 2, yy - 0.5, fs * 0.8); }
          else { doc.setTextColor(0); doc.text(String(v), cx + w / 2, yy, { align: 'center' }); }
        };
        part(t.n, mid - 2);
        doc.setLineWidth(0.5); doc.setDrawColor(0); doc.line(cx + 0.5, mid, cx + w - 0.5, mid);
        part(t.d, mid + 8);
      } else if (t === '__' || (t && typeof t === 'object' && 'box' in t)) {
        const bw = t === '__' ? 14 : t.box * bs;
        drawBox(doc, cx, base - 8, bw, 11);
        if (answers) ansText(doc, take(), cx + bw / 2, base, fs);
      } else {
        doc.setTextColor(0);
        doc.text(String(t), cx + 1, base);
      }
      cx += w;
    }
  }

  function drawSeq(doc, items, x, y, w, h, answers, take) {
    const sq = Math.min(12, (w - 8) / items.length);
    const fs = Math.min(16, sq * 1.3);
    const top = y + h / 2 - sq / 2;
    items.forEach((v, i) => {
      const bx = x + i * sq;
      drawBox(doc, bx, top, sq, sq);
      if (v === null) { if (answers) ansText(doc, take(), bx + sq / 2, top + sq * 0.72, fs); }
      else { doc.setFontSize(fs); doc.setTextColor(0); doc.text(String(v), bx + sq / 2, top + sq * 0.72, { align: 'center' }); }
    });
  }

  function drawProblem(doc, ex, x, y, w, h, answers, take) {
    doc.setFontSize(12); doc.setTextColor(0);
    const lines = doc.splitTextToSize(ex.text, w - 4);
    doc.text(lines, x, y + 6);
    const by = y + 6 + lines.length * 5.5 + 5;
    doc.text('Respuesta:', x, by);
    doc.setLineWidth(0.4); doc.setDrawColor(60); doc.line(x + 26, by + 1, x + 70, by + 1);
    if (answers) ansText(doc, take(), x + 48, by, 13);
  }

  // ---------- lengua: imágenes y ejercicios nuevos ----------
  function drawImg(doc, key, x, y, s) {
    const d = g.LENGUA_IMGS && g.LENGUA_IMGS[key];
    if (d) doc.addImage(d, 'PNG', x, y, s, s);
    else { doc.setDrawColor(150); doc.setLineWidth(0.3); doc.rect(x, y, s, s); }
  }

  function drawOptions(doc, options, x, y, maxW, answer, answers) {
    doc.setFontSize(12);
    const ws = options.map((o) => Math.max(14, doc.getTextWidth(String(o)) + 8));
    const total = ws.reduce((a, b) => a + b, 0) + 4 * (options.length - 1);
    const k = total > maxW ? maxW / total : 1;
    let cx = x;
    options.forEach((o, i) => {
      const w = ws[i] * k, hit = answers && String(o) === String(answer);
      doc.setDrawColor(...(hit ? ANS : [90, 90, 90])); doc.setLineWidth(hit ? 0.9 : 0.4);
      doc.roundedRect(cx, y, w, 8, 3, 3);
      doc.setTextColor(...(hit ? ANS : [0, 0, 0])); doc.setFontSize(12 * k);
      doc.text(String(o), cx + w / 2, y + 5.6, { align: 'center' });
      cx += w + 4 * k;
    });
    doc.setTextColor(0); doc.setDrawColor(0);
  }

  function drawPic(doc, ex, x, y, w, h, answers, take) {
    const s = Math.min(h - 4, 24);
    drawImg(doc, ex.img, x, y + (h - s) / 2, s);
    drawTokens(doc, ex.tokens, x + s + 4, y + h / 2 + 4, w - s - 4, answers, take, 20);
  }

  function drawChoice(doc, ex, x, y, w, h, answers, take) {
    const s = ex.img ? Math.min(h - 6, 20) : 0;
    if (ex.img) drawImg(doc, ex.img, x, y + 2, s);
    const tx = x + (s ? s + 4 : 0), tw = w - (s ? s + 4 : 0);
    if (ex.tokens) drawTokens(doc, ex.tokens, tx, y + 11, tw, answers, () => ex.answer, 18);
    drawOptions(doc, ex.options, tx, y + (ex.tokens ? 16 : 6), tw, ex.answer, answers);
  }

  function drawMatch(doc, ex, x, y, w, h, answers) {
    const n = ex.left.length, rs = Math.min(20, (h - 4) / n);
    const lx = x + 4, ld = x + w * 0.36, rd = x + w * 0.56, rx = x + w * 0.60;
    const item = (it, px, align) => {
      if (it.img) drawImg(doc, it.img, align === 'right' ? px - rs * 0.8 : px, 0, 0);
    };
    const place = (it, side, row) => {
      const cy = y + 2 + row * rs, isz = Math.min(rs - 3, 16);
      doc.setTextColor(0);
      if (it.img) {
        drawImg(doc, it.img, side === 'l' ? ld - 4 - isz : rx, cy + (rs - isz) / 2 - 1, isz);
      } else {
        doc.setFontSize(15);
        if (side === 'l') doc.text(String(it.t), ld - 4, cy + rs / 2 + 2, { align: 'right' });
        else doc.text(String(it.t), rx, cy + rs / 2 + 2);
      }
      doc.setFillColor(40); doc.circle(side === 'l' ? ld : rd, cy + rs / 2 - 1, 1.2, 'F');
    };
    ex.left.forEach((it, i) => place(it, 'l', i));
    ex.right.forEach((it, i) => place(it, 'r', i));
    if (answers) {
      doc.setDrawColor(...ANS); doc.setLineWidth(0.8);
      ex.answer.forEach((j, i) => {
        doc.line(ld, y + 2 + i * rs + rs / 2 - 1, rd, y + 2 + +j * rs + rs / 2 - 1);
      });
      doc.setDrawColor(0);
    }
  }

  function drawCopy(doc, ex, x, y, w, h, answers) {
    const s = ex.img ? Math.min(h - 6, 22) : 0;
    if (ex.img) drawImg(doc, ex.img, x, y + 3, s);
    const tx = x + (s ? s + 4 : 0);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(22); doc.setTextColor(170);
    const reps = Array(ex.reps || 2).fill(ex.text).join('   ');
    doc.text(reps, tx, y + 11);
    doc.setTextColor(0); doc.setDrawColor(120); doc.setLineWidth(0.3);
    doc.line(tx, y + 12.5, x + w - 2, y + 12.5);
    doc.line(tx, y + 23, x + w - 2, y + 23);
    doc.setDrawColor(190); doc.setLineDashPattern([1, 1.2], 0); doc.line(tx, y + 18, x + w - 2, y + 18); doc.setLineDashPattern([], 0);
    if (answers) { doc.setTextColor(...ANS); doc.setFontSize(18); doc.text(ex.text, tx, y + 21.5); doc.setTextColor(0); }
  }

  function drawLines(doc, ex, x, y, w, h, answers) {
    doc.setFontSize(12); doc.setTextColor(0);
    const lines = doc.splitTextToSize(ex.text, w - 4);
    doc.text(lines, x, y + 6);
    const n = ex.n || 2; let ly = y + 6 + lines.length * 5.5 + 8;
    doc.setDrawColor(100); doc.setLineWidth(0.3);
    for (let i = 0; i < n; i++) { doc.line(x, ly, x + w - 2, ly); ly += 9; }
    if (answers) {
      doc.setTextColor(...ANS); doc.setFontSize(12);
      doc.text(doc.splitTextToSize(String(ex.answer), w - 4), x, y + 6 + lines.length * 5.5 + 6.5);
      doc.setTextColor(0);
    }
  }

  function drawReading(doc, ex, x, y, w, h, answers) {
    let cy = y + 4;
    if (ex.title) { doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(0); doc.text(ex.title, x, cy); cy += 8; }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(12.5); doc.setTextColor(0);
    const body = doc.splitTextToSize(ex.text, w - 4);
    doc.text(body, x, cy, { lineHeightFactor: 1.5 });
    cy += body.length * 6.6 + 8;
    ex.qs.forEach((q, i) => {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(0);
      const ql = doc.splitTextToSize((i + 1) + '. ' + q.q, w - 4);
      doc.text(ql, x, cy); cy += ql.length * 5.8 + 2;
      doc.setFont('helvetica', 'normal');
      if (q.options) { drawOptions(doc, q.options, x + 4, cy, w - 8, q.answer, answers); cy += 14; }
      else {
        doc.setDrawColor(100); doc.setLineWidth(0.3); doc.line(x + 4, cy + 6, x + w - 4, cy + 6);
        if (answers) { doc.setTextColor(...ANS); doc.text(String(q.answer), x + 5, cy + 4.5); doc.setTextColor(0); }
        cy += 14;
      }
    });
  }

  function drawExercise(doc, ex, num, x, y, w, h, answers) {
    const ans = Array.isArray(ex.answer) ? ex.answer.slice() : [ex.answer];
    const take = () => (ans.length ? ans.shift() : '');
    doc.setFontSize(9); doc.setTextColor(140);
    doc.text(num + ')', x, y + 5);
    doc.setTextColor(0); doc.setFont('helvetica', 'normal');
    const ix = x + 9, iw = w - 11;
    if (ex.kind === 'col') drawCol(doc, ex, x, y, w, h, answers, take);
    else if (ex.kind === 'pic') drawPic(doc, ex, ix, y, iw, h, answers, take);
    else if (ex.kind === 'choice') drawChoice(doc, ex, ix, y, iw, h, answers, take);
    else if (ex.kind === 'match') drawMatch(doc, ex, ix, y, iw, h, answers);
    else if (ex.kind === 'copy') drawCopy(doc, ex, ix, y, iw, h, answers);
    else if (ex.kind === 'lines') drawLines(doc, ex, ix, y, iw, h, answers);
    else if (ex.kind === 'reading') drawReading(doc, ex, ix, y, iw, h, answers);
    else if (ex.kind === 'divbox') drawDivBox(doc, ex, x, y, w, h, answers, take);
    else if (ex.kind === 'seq') drawSeq(doc, ex.items, ix, y, iw, h, answers, take);
    else if (ex.kind === 'problem') drawProblem(doc, ex, ix, y, iw, h, answers, take);
    else drawTokens(doc, ex.tokens, ix, y + h / 2 + 4, iw, answers, take, 20);
  }

  function drawSheet(doc, sheet, num, info, answers) {
    const { w, mx } = PAGE;
    doc.setTextColor(0); doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
    const title = answers ? `Soluciones · Ficha ${num}` : `Ficha ${num}`;
    doc.text(title, mx, 20);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    doc.text(`Nivel ${info.lv.id}: ${info.lv.name}   ·   ${sheet.sub.id} ${sheet.sub.name}`, mx, 27);
    if (!answers) {
      doc.setFontSize(11);
      doc.text('Nombre:', mx, 37); doc.setLineWidth(0.3); doc.setDrawColor(80); doc.line(mx + 16, 37.5, mx + 85, 37.5);
      if (info.name) { doc.setTextColor(...ANS); doc.text(info.name, mx + 18, 36.5); doc.setTextColor(0); }
      doc.text('Fecha:', mx + 92, 37); doc.line(mx + 104, 37.5, mx + 135, 37.5);
      doc.text('Tiempo:', w - mx - 38, 20); doc.line(w - mx - 22, 20.5, w - mx, 20.5);
      doc.text('Nota:', w - mx - 38, 28); doc.line(w - mx - 22, 28.5, w - mx, 28.5);
    }
    if (info.lv.needsLetter && sheet.ctx) {
      const L = sheet.ctx.letra;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(30); doc.setTextColor(...ANS);
      doc.text(L.toUpperCase() + ' ' + L, w / 2 + 32, 25, { align: 'center' });
      doc.setFont('helvetica', 'normal'); doc.setTextColor(0);
    }
    doc.setDrawColor(0); doc.setLineWidth(0.8); doc.line(mx, 42, w - mx, 42);

    const cols = COLS[sheet.sub.layout] || 2;
    const n = sheet.items.length;
    const rows = Math.ceil(n / cols);
    const bodyTop = 46, bodyH = PAGE.h - 14 - bodyTop;
    const cap = MAX_H[sheet.items[0].kind] || 24;
    const rh = Math.min(cap, bodyH / rows);
    const cw = (w - 2 * mx) / cols;
    sheet.items.forEach((ex, i) => {
      const r = Math.floor(i / cols), c = i % cols;
      drawExercise(doc, ex, i + 1, mx + c * cw, bodyTop + r * rh, cw, rh, answers);
    });

    doc.setFontSize(8); doc.setTextColor(140);
    doc.text(`Semilla ${sheet.seed}`, mx, PAGE.h - 8);
    if (info.materia === 'lengua') doc.text('Pictogramas: ARASAAC (arasaac.org), Gobierno de Aragón, autor Sergio Palao. CC BY-NC-SA', w - mx, PAGE.h - 8, { align: 'right' });
    doc.text(`${num}`, w / 2, PAGE.h - 8, { align: 'center' });
    doc.setTextColor(0);
  }

  // opts: { levelId, subId ('all' = todos los subniveles del nivel), sheets, perSheet, name, solutions, seed }
  g.buildPdf = function (opts) {
    const { jsPDF } = g.jspdf;
    const materia = opts.materia || 'mates';
    divStyle = opts.divStyle === 'es' ? 'es' : 'jp';
    const lv = levelsOf(materia).find((l) => String(l.id) === String(opts.levelId));
    const subs = opts.subId === 'all' ? lv.sublevels : [lv.sublevels.find((s) => s.id === opts.subId)];
    const letra = (String(opts.letra || 'm').trim().toLowerCase().match(/^[a-zñü]{1,2}$/) || ['m'])[0];
    const ctx = { letra };
    const sheets = [];
    for (let i = 0; i < opts.sheets; i++) {
      // con "todos", reparte las hojas por subniveles en orden creciente
      const sub = subs[Math.min(subs.length - 1, Math.floor(i * subs.length / opts.sheets))];
      sheets.push(makeSheet(sub, opts.seed + i * 7919, sub.perSheet || opts.perSheet, ctx));
    }
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const info = { lv, name: opts.name, materia };
    sheets.forEach((s, i) => { if (i) doc.addPage(); drawSheet(doc, s, i + 1, info, false); });
    if (opts.solutions) sheets.forEach((s, i) => { doc.addPage(); drawSheet(doc, s, i + 1, info, true); });
    return doc;
  };
  g.makeSheet = makeSheet;
  g.findSub = findSub;
})(typeof window !== 'undefined' ? window : globalThis);
