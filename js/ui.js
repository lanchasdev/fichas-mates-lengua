(function () {
  const $ = (id) => document.getElementById(id);
  let url = null, levels = [];

  function setMateria(m, save) {
    $('materia').value = m;
    document.body.classList.toggle('lengua', m === 'lengua');
    document.querySelectorAll('.seg button').forEach((b) => b.classList.toggle('on', b.dataset.m === m));
    $('title').textContent = m === 'lengua' ? 'Fichas de lengua' : 'Fichas de mates';
    document.title = $('title').textContent;
    if (save) { try { localStorage.setItem('materia', m); } catch (e) {} }
    loadLevels();
    schedule();
  }
  document.querySelectorAll('.seg button').forEach((b) => b.addEventListener('click', () => setMateria(b.dataset.m, true)));

  function loadLevels() {
    levels = ($('materia').value === 'lengua' ? LENGUA_LEVELS : KUMON_LEVELS).slice().sort((a, b) => a.id - b.id);
    $('level').innerHTML = levels.map((l) => `<option value="${l.id}">Nivel ${l.id} · ${l.name} (${l.age})</option>`).join('');
    $('attr').hidden = $('materia').value !== 'lengua';
    fillSubs();
  }
  function fillSubs() {
    const lv = levels.find((l) => String(l.id) === $('level').value);
    if (!lv) { $('sub').innerHTML = ''; $('subHint').textContent = 'Todavía no hay niveles de esta materia.'; return; }
    $('sub').innerHTML = '<option value="all">Todo el nivel (en orden de dificultad)</option>' +
      lv.sublevels.map((s) => `<option value="${s.id}">${s.id} · ${s.name}</option>`).join('');
    showHint();
  }
  const LETRAS = 'm p l s t r d n c b f g v j z h q ñ a e i o u'.split(' ');
  $('chips').innerHTML = LETRAS.map((c) => `<button type="button" data-l="${c}">${c}</button>`).join('');
  function curLevel() { return levels.find((l) => String(l.id) === $('level').value); }
  function letraUI() {
    const lv = curLevel(), on = !!(lv && lv.needsLetter);
    $('letraWrap').hidden = !on;
    if (!on) return;
    const L = ($('letra').value || '').trim().toLowerCase();
    document.querySelectorAll('#chips button').forEach((b) => b.classList.toggle('on', b.dataset.l === L));
    const n = LENGUA_LETRA.count(L), m = LENGUA_LETRA.countAny(L);
    $('letraHint').textContent = L ? `${n} palabras con dibujo empiezan por «${L}»; ${m} la contienen.` + (n < 6 ? ' Con pocas palabras se repetirán.' : '') : 'Escribe una letra.';
  }
  $('letra').addEventListener('input', letraUI);
  $('chips').addEventListener('click', (e) => { if (e.target.dataset.l) { $('letra').value = e.target.dataset.l; letraUI(); } });
  // Nº de fichas automático: todo el nivel = una ficha por tema; un tema concreto = 1 ficha.
  function autoSheets() {
    const lv = curLevel();
    if (!lv) return;
    $('sheets').value = $('sub').value === 'all' ? Math.min(30, lv.sublevels.length) : 1;
  }
  function showHint() {
    letraUI();
    autoSheets();
    const lv = levels.find((l) => String(l.id) === $('level').value);
    if (!lv) return;
    const s = lv.sublevels.find((x) => x.id === $('sub').value);
    $('subHint').textContent = s ? (s.hint || '') : `${lv.sublevels.length} temas; las fichas avanzan del más fácil al más difícil.`;
  }
  $('level').addEventListener('change', () => { fillSubs(); schedule(); });
  $('sub').addEventListener('change', () => { showHint(); schedule(); });
  ['sheets', 'letra'].forEach((id) => $(id).addEventListener('input', () => schedule()));
  ['per', 'sol'].forEach((id) => $(id).addEventListener('change', () => schedule()));
  $('chips').addEventListener('click', (e) => { if (e.target.dataset.l) schedule(); });

  function opts() {
    return {
      materia: $('materia').value,
      letra: $('letra').value,
      levelId: $('level').value,
      subId: $('sub').value,
      sheets: Math.max(1, Math.min(30, +$('sheets').value || 1)),
      perSheet: +$('per').value,
      solutions: $('sol').checked,
    };
  }

  // Cada vez sale una ficha nueva (semilla aleatoria). Al descargar justo después de la vista previa,
  // con los mismos ajustes, se descarga la misma ficha que se ha visto.
  const newSeed = () => 1 + Math.floor(Math.random() * 2000000000);
  let last = null;
  const PDF_VIEW = '#navpanes=0&pagemode=none';
  // La vista previa se rehace sola con cada cambio (y al abrir la página).
  let timer = null, frame = null;
  function preview() {
    const lv = curLevel();
    if (!lv) { $('pv').innerHTML = '<div class="empty">Todavía no hay niveles de esta materia.</div>'; return; }
    const o = opts(), seed = newSeed();
    let doc;
    try { doc = buildPdf({ ...o, seed }); } catch (e) { $('pv').innerHTML = '<div class="empty">No se pudo generar esta ficha.</div>'; return; }
    last = { key: JSON.stringify(o), seed };
    const old = url;
    url = doc.output('bloburl') + PDF_VIEW;
    if (!frame || !frame.isConnected) {
      $('pv').innerHTML = '<iframe title="Vista previa del PDF"></iframe>';
      frame = $('pv').querySelector('iframe');
    }
    frame.src = url;
    if (old) setTimeout(() => URL.revokeObjectURL(old.split('#')[0]), 3000);
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(preview, 300); }
  $('dl').addEventListener('click', () => {
    const o = opts();
    const seed = last && last.key === JSON.stringify(o) ? last.seed : newSeed();
    buildPdf({ ...o, seed }).save(`fichas-${o.materia}-nivel${o.levelId}-${o.subId}.pdf`);
  });

  let saved = 'mates';
  try { saved = localStorage.getItem('materia') || 'mates'; } catch (e) {}
  setMateria(saved === 'lengua' && LENGUA_LEVELS.length ? 'lengua' : 'mates', false);
  preview();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
