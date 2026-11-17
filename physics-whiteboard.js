const BOARD_WIDTH = 1600;
const BOARD_HEIGHT = 1000;
const BOARD_NAMES = {
  egor: { label: "Егор", title: "Доска Егора" },
  daniil: { label: "Даниил", title: "Доска Даниила" },
  shared: { label: "Совместная", title: "Общая доска" }
};
const SYMBOLS = ["Δ","ρ","μ","Ω","π","α","β","λ","φ","θ","√","∑","≈","≠","≤","≥","→","⇄","·","×","²","³","₀","₁","ₙ","°","±","∞"];
const clone = value => JSON.parse(JSON.stringify(value));
const makeId = () => (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : "wb-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));

export function compilePhysicsExpression(source) {
  let text = String(source || "").trim().replace(/^y\s*=\s*/i, "").replace(/(\d),(\d)/g, "$1.$2");
  if (!text || text.length > 100) throw new Error("Введи выражение длиной до 100 символов.");
  const tokens = [];
  const pattern = /\s*(\d+(?:\.\d*)?(?:e[+-]?\d+)?|\.\d+(?:e[+-]?\d+)?|[a-zA-Z]+|[+\-*/^(),])/iy;
  let pos = 0;
  while (pos < text.length) {
    pattern.lastIndex = pos;
    const match = pattern.exec(text);
    if (!match) throw new Error("Не удалось разобрать выражение около: " + text.slice(pos, pos + 12));
    tokens.push(match[1]);
    pos = pattern.lastIndex;
  }
  let index = 0;
  const peek = () => tokens[index];
  const take = () => tokens[index++];
  const expect = token => { if (take() !== token) throw new Error("Ожидался символ " + token); };
  const functions = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan, sqrt: Math.sqrt,
    abs: Math.abs, log: Math.log10, ln: Math.log, exp: Math.exp,
    asin: Math.asin, acos: Math.acos, atan: Math.atan
  };
  function expression() {
    let left = term();
    while (peek() === "+" || peek() === "-") {
      const op = take(), right = term(), prev = left;
      left = x => op === "+" ? prev(x) + right(x) : prev(x) - right(x);
    }
    return left;
  }
  function term() {
    let left = unary();
    while (peek() === "*" || peek() === "/") {
      const op = take(), right = unary(), prev = left;
      left = x => op === "*" ? prev(x) * right(x) : prev(x) / right(x);
    }
    return left;
  }
  function unary() {
    if (peek() === "+") { take(); return unary(); }
    if (peek() === "-") { take(); const value = unary(); return x => -value(x); }
    return power();
  }
  function power() {
    let left = primary();
    if (peek() === "^") {
      take();
      const right = unary(), prev = left;
      left = x => Math.pow(prev(x), right(x));
    }
    return left;
  }
  function primary() {
    const token = take();
    if (token === undefined) throw new Error("Выражение неожиданно закончилось.");
    if (token === "(") {
      const value = expression();
      expect(")");
      return value;
    }
    if (/^(?:\d|\.)/.test(token)) {
      const number = Number(token);
      if (!Number.isFinite(number)) throw new Error("Некорректное число.");
      return () => number;
    }
    if (/^[a-z]+$/i.test(token)) {
      const name = token.toLowerCase();
      if (name === "x") return x => x;
      if (name === "pi") return () => Math.PI;
      if (name === "e") return () => Math.E;
      if (!functions[name]) throw new Error("Неизвестная функция: " + token);
      expect("(");
      const first = expression();
      let second = null;
      if (peek() === ",") { take(); second = expression(); }
      expect(")");
      return x => functions[name](first(x), second ? second(x) : undefined);
    }
    throw new Error("Неожиданный символ: " + token);
  }
  const fn = expression();
  if (index !== tokens.length) throw new Error("Лишняя часть выражения: " + tokens.slice(index).join(""));
  return x => {
    const result = fn(x);
    return Number.isFinite(result) ? result : NaN;
  };
}

export function mountPhysicsWhiteboard(root, options = {}) {
  if (!root) return { refresh() {}, dispose() {} };
  const { db, user, member, doc, setDoc, onSnapshot, runTransaction, serverTimestamp, toast = () => {} } = options;
  root.innerHTML = [
    '<div class="wb-app">',
      '<header class="wb-header">',
        '<div class="wb-heading"><span class="eyebrow">PHYSICS WORKSPACE</span><h2>Интерактивная доска</h2><p>Рисуй схемы, строй графики и оформляй решения задач в одном месте.</p></div>',
        '<div class="wb-header-tools">',
          '<label class="wb-board-select"><span>Рабочая область</span><select data-wb-board><option value="egor">Доска Егора</option><option value="daniil">Доска Даниила</option><option value="shared">Совместная доска</option></select></label>',
          '<span class="wb-save-state" data-wb-save-state><i></i> Подключение…</span>',
          '<button type="button" class="wb-button wb-button-primary" data-wb-action="export">↓ PNG</button>',
        '</div>',
      '</header>',
      '<div class="wb-toolbar" role="toolbar" aria-label="Инструменты доски">',
        '<div class="wb-toolset">',
          '<button type="button" class="wb-tool active" data-wb-tool="select" title="Выбрать и переместить" aria-label="Выбрать">↖</button>',
          '<button type="button" class="wb-tool" data-wb-tool="pen" title="Карандаш" aria-label="Карандаш">✎</button>',
          '<button type="button" class="wb-tool" data-wb-tool="eraser" title="Ластик" aria-label="Ластик">⌫</button>',
          '<button type="button" class="wb-tool" data-wb-tool="line" title="Линия" aria-label="Линия">／</button>',
          '<button type="button" class="wb-tool" data-wb-tool="arrow" title="Стрелка / вектор" aria-label="Стрелка">↗</button>',
          '<button type="button" class="wb-tool" data-wb-tool="rect" title="Прямоугольник" aria-label="Прямоугольник">▭</button>',
          '<button type="button" class="wb-tool" data-wb-tool="ellipse" title="Окружность / эллипс" aria-label="Эллипс">◯</button>',
          '<button type="button" class="wb-tool" data-wb-tool="text" title="Текст на доске" aria-label="Текст">T</button>',
          '<button type="button" class="wb-tool" data-wb-tool="graph" title="Построить график" aria-label="График">⌁</button>',
        '</div>',
        '<div class="wb-tool-divider"></div>',
        '<label class="wb-color-control" title="Цвет линии"><input type="color" data-wb-color value="#25324a"><span>Цвет</span></label>',
        '<label class="wb-width-control"><span>Толщина</span><input type="range" min="1" max="18" value="4" data-wb-width><b data-wb-width-label>4</b></label>',
        '<label class="wb-grid-toggle"><input type="checkbox" data-wb-grid checked><span>Сетка</span></label>',
        '<div class="wb-toolset wb-history-tools">',
          '<button type="button" class="wb-tool" data-wb-action="undo" title="Отменить (Ctrl+Z)">↶</button>',
          '<button type="button" class="wb-tool" data-wb-action="redo" title="Повторить (Ctrl+Y)">↷</button>',
          '<button type="button" class="wb-tool wb-danger-tool" data-wb-action="clear" title="Очистить доску">⌫</button>',
        '</div>',
      '</div>',
      '<div class="wb-layout">',
        '<section class="wb-paper-card">',
          '<div class="wb-paper-head"><input class="wb-title-input" data-wb-title maxlength="70" value="Доска Егора" aria-label="Название доски"><div class="wb-paper-head-meta"><span data-wb-element-count>0 объектов</span><span>1600 × 1000</span></div></div>',
          '<div class="wb-canvas-wrap"><canvas data-wb-canvas width="1600" height="1000" tabindex="0" aria-label="Рабочая область для рисования"></canvas><div class="wb-canvas-empty" data-wb-empty><span>✎</span><b>Твоя рабочая область</b><small>Выбери инструмент и начни рисовать. На телефоне можно работать пальцем.</small></div></div>',
          '<div class="wb-paper-foot"><span data-wb-tool-hint>Выбор: нажми на объект и перетащи его.</span><span>Ctrl + Z — отмена · Ctrl + Y — повтор</span></div>',
        '</section>',
        '<aside class="wb-side-panel">',
          '<section class="wb-side-card">',
            '<div class="wb-side-title"><div><span class="eyebrow">ЗАПИСИ</span><h3>Текст и формулы</h3></div><span class="wb-side-icon">∑</span></div>',
            '<textarea data-wb-note rows="3" maxlength="500" placeholder="Например: Дано: m = 2 кг, v = 3 м/с&#10;E = mv² / 2"></textarea>',
            '<div class="wb-symbols" aria-label="Математические символы">'+SYMBOLS.map(s => '<button type="button" data-wb-symbol="'+s+'">'+s+'</button>').join("")+'</div>',
            '<button type="button" class="wb-button wb-button-primary wb-full" data-wb-action="add-note">Добавить запись на доску</button>',
          '</section>',
          '<section class="wb-side-card" data-wb-graph-panel>',
            '<div class="wb-side-title"><div><span class="eyebrow">КООРДИНАТЫ</span><h3>Построить график</h3></div><span class="wb-side-icon">⌁</span></div>',
            '<label class="wb-field-label">Функция y = f(x)<input data-wb-expression value="2*x + 1" placeholder="Например: 2*x + 1"></label><small class="wb-formula-hint">Поддерживаются +, −, ×, ÷, степени, скобки, sin, cos, tan, sqrt, log и ln. Углы — в радианах.</small>',
            '<div class="wb-inline-fields"><label class="wb-field-label">X от<input type="number" data-wb-xmin value="-5" step="0.5"></label><label class="wb-field-label">X до<input type="number" data-wb-xmax value="5" step="0.5"></label></div>',
            '<button type="button" class="wb-button wb-button-primary wb-full" data-wb-action="add-function">Построить функцию</button>',
            '<div class="wb-subdivider"></div>',
            '<span class="wb-small-label">Или добавь экспериментальные точки</span>',
            '<div class="wb-inline-fields"><label class="wb-field-label">X<input type="number" data-wb-point-x step="any" placeholder="0"></label><label class="wb-field-label">Y<input type="number" data-wb-point-y step="any" placeholder="0"></label></div>',
            '<button type="button" class="wb-button wb-full" data-wb-action="add-point">＋ Добавить точку</button>',
            '<div class="wb-point-draft" data-wb-point-list>Точки пока не добавлены</div>',
            '<button type="button" class="wb-button wb-full" data-wb-action="add-points-graph" disabled>Построить график по точкам</button>',
          '</section>',
          '<section class="wb-side-card">',
            '<div class="wb-side-title"><div><span class="eyebrow">ГОТОВЫЕ ЗАГОТОВКИ</span><h3>Физические схемы</h3></div><span class="wb-side-icon">⚡</span></div>',
            '<div class="wb-presets"><button type="button" data-wb-diagram="forces"><span>↗</span><b>Силы и векторы</b><small>Вес, тяжесть, реакция опоры</small></button><button type="button" data-wb-diagram="circuit"><span>⌁</span><b>Электрическая цепь</b><small>Источник, ключ, резистор, лампа</small></button><button type="button" data-wb-diagram="optics"><span>◉</span><b>Оптика</b><small>Линза, ось и световые лучи</small></button></div>',
          '</section>',
          '<section class="wb-side-card wb-tips-card"><b>Как пользоваться</b><p>Выбирай инструмент, рисуй прямо на листе. Готовые схемы можно перемещать, а графики строятся по формуле или по результатам измерений.</p><div class="wb-tip-keys"><kbd>P</kbd> карандаш <kbd>E</kbd> ластик <kbd>T</kbd> текст</div></section>',
        '</aside>',
      '</div>',
    '</div>'
  ].join("");

  const q = selector => root.querySelector(selector);
  const canvas = q("[data-wb-canvas]");
  const ctx = canvas.getContext("2d");
  const boardSelect = q("[data-wb-board]");
  const titleInput = q("[data-wb-title]");
  const saveLabel = q("[data-wb-save-state]");
  const noteInput = q("[data-wb-note]");
  const pointDraft = [];
  const localKey = id => "oge-whiteboard-v1-" + id;
  let activeBoard = member && member.id === "daniil" ? "daniil" : "egor";
  let title = BOARD_NAMES[activeBoard].title;
  let elements = [];
  let deletedIds = new Set();
  let restoredIds = new Set();
  let history = [[]];
  let historyIndex = 0;
  let currentTool = "select";
  let currentColor = "#25324a";
  let currentWidth = 4;
  let gridVisible = true;
  let dirty = false;
  let localUpdatedAt = 0;
  let editRevision = 0;
  let saveTimer = null;
  let stopSnapshot = null;
  let disposed = false;
  let drawing = null;
  let dragState = null;
  let selectedId = null;
  let erasing = false;
  let eraserChanged = false;
  let lastRemoteUpdate = 0;

  function setStatus(text, mode = "ok") {
    saveLabel.className = "wb-save-state " + mode;
    saveLabel.innerHTML = '<i></i> ' + escapeHtml(text);
  }
  function boardRef(boardId) {
    return doc(db, "rooms", "oge2027", "whiteboards", "whiteboard_" + boardId);
  }
  function rememberLocal(boardId, payload) {
    try { localStorage.setItem(localKey(boardId), JSON.stringify(payload)); } catch (error) {}
  }
  function readLocal(boardId) {
    try {
      const value = JSON.parse(localStorage.getItem(localKey(boardId)) || "null");
      if (value && Array.isArray(value.elements)) return value;
    } catch (error) {}
    return null;
  }
  function resetHistory() {
    history = [clone(elements)];
    historyIndex = 0;
    updateHistoryButtons();
  }
  function updateHistoryButtons() {
    const undo = q('[data-wb-action="undo"]');
    const redo = q('[data-wb-action="redo"]');
    if (undo) undo.disabled = historyIndex <= 0;
    if (redo) redo.disabled = historyIndex >= history.length - 1;
  }
  function saveLocalNow(boardId = activeBoard) {
    rememberLocal(boardId, { title, elements, deletedIds: [...deletedIds], restoredIds: [...restoredIds], updatedAt: Date.now() });
  }
  function markDirty() {
    dirty = true;
    editRevision += 1;
    localUpdatedAt = Date.now();
    saveLocalNow();
    setStatus("Есть изменения", "pending");
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveToCloud(activeBoard), 850);
  }
  function commit(nextElements) {
    const previousIds = new Set(elements.map(item => item.id));
    const nextIds = new Set(nextElements.map(item => item.id));
    previousIds.forEach(id => { if (!nextIds.has(id)) { deletedIds.add(id); restoredIds.delete(id); } });
    nextIds.forEach(id => { if (deletedIds.has(id)) restoredIds.add(id); deletedIds.delete(id); });
    elements = nextElements;
    history = history.slice(0, historyIndex + 1);
    history.push(clone(elements));
    if (history.length > 70) history.shift();
    historyIndex = history.length - 1;
    markDirty();
    render();
  }
  function undo() {
    if (historyIndex <= 0) return;
    const oldIds = new Set(elements.map(item => item.id));
    historyIndex -= 1;
    elements = clone(history[historyIndex]);
    const newIds = new Set(elements.map(item => item.id));
    oldIds.forEach(id => { if (!newIds.has(id)) { deletedIds.add(id); restoredIds.delete(id); } });
    newIds.forEach(id => { if (deletedIds.has(id)) restoredIds.add(id); deletedIds.delete(id); });
    markDirty();
    render();
  }
  function redo() {
    if (historyIndex >= history.length - 1) return;
    const oldIds = new Set(elements.map(item => item.id));
    historyIndex += 1;
    elements = clone(history[historyIndex]);
    const newIds = new Set(elements.map(item => item.id));
    oldIds.forEach(id => { if (!newIds.has(id)) { deletedIds.add(id); restoredIds.delete(id); } });
    newIds.forEach(id => { if (deletedIds.has(id)) restoredIds.add(id); deletedIds.delete(id); });
    markDirty();
    render();
  }
  function mergeElements(remoteElements, remoteDeleted) {
    const removed = new Set([...(remoteDeleted || []), ...deletedIds]);
    restoredIds.forEach(id => removed.delete(id));
    const merged = new Map();
    (remoteElements || []).forEach(item => { if (item && item.id && !removed.has(item.id)) merged.set(item.id, item); });
    elements.forEach(item => { if (item && item.id && !removed.has(item.id)) merged.set(item.id, item); });
    return [...merged.values()].slice(-500);
  }
  async function saveToCloud(boardId = activeBoard) {
    if (disposed || !db || !user || !dirty) return;
    const revision = editRevision;
    const payload = {
      title,
      elements: clone(elements),
      deletedIds: [...deletedIds],
      restoredIds: [...restoredIds],
      updatedBy: user.uid,
      updatedByName: member ? member.name : "Ученик",
      updatedAt: serverTimestamp ? serverTimestamp() : Date.now()
    };
    localUpdatedAt = Date.now();
    rememberLocal(boardId, { title: payload.title, elements: payload.elements, deletedIds: payload.deletedIds, restoredIds: payload.restoredIds, updatedAt: localUpdatedAt });
    setStatus("Сохраняю…", "pending");
    try {
      if (runTransaction) {
        let mergedResult = null;
        let mergedDeletedResult = null;
        await runTransaction(db, async transaction => {
          const ref = boardRef(boardId);
          const snap = await transaction.get(ref);
          const remote = snap.exists() ? snap.data() : {};
          const removed = new Set([...(remote.deletedIds || []), ...payload.deletedIds]);
          (payload.restoredIds || []).forEach(id => removed.delete(id));
          const map = new Map();
          (remote.elements || []).forEach(item => { if (item && item.id && !removed.has(item.id)) map.set(item.id, item); });
          payload.elements.forEach(item => { if (item && item.id && !removed.has(item.id)) map.set(item.id, item); });
          mergedResult = [...map.values()].slice(-500);
          mergedDeletedResult = [...removed].slice(-1200);
          transaction.set(ref, {
            boardId,
            title: payload.title,
            elements: mergedResult,
            deletedIds: mergedDeletedResult,
            updatedBy: payload.updatedBy,
            updatedByName: payload.updatedByName,
            updatedAt: payload.updatedAt
          }, { merge: true });
        });
        rememberLocal(boardId, { title: payload.title, elements: mergedResult || payload.elements, deletedIds: mergedDeletedResult || payload.deletedIds, restoredIds: [], updatedAt: 0 });
        if (activeBoard === boardId && revision === editRevision) {
          elements = mergedResult || elements;
          deletedIds = new Set(mergedDeletedResult || payload.deletedIds);
          restoredIds.clear();
          dirty = false;
          localUpdatedAt = 0;
          resetHistory();
          render();
          setStatus("Сохранено", "ok");
        } else if (activeBoard === boardId) {
          setStatus("Есть новые изменения", "pending");
          if (saveTimer) clearTimeout(saveTimer);
          saveTimer = setTimeout(() => saveToCloud(boardId), 500);
        }
      } else {
        await setDoc(boardRef(boardId), { boardId, ...payload }, { merge: true });
        rememberLocal(boardId, { title: payload.title, elements: payload.elements, deletedIds: payload.deletedIds, restoredIds: [], updatedAt: 0 });
        if (activeBoard === boardId && revision === editRevision) {
          dirty = false;
          restoredIds.clear();
          localUpdatedAt = 0;
          setStatus("Сохранено", "ok");
        }
      }
    } catch (error) {
      rememberLocal(boardId, { title: payload.title, elements: payload.elements, deletedIds: payload.deletedIds, restoredIds: payload.restoredIds, updatedAt: Date.now() });
      if (activeBoard === boardId) setStatus("Сохранено на устройстве", "offline");
      console.warn("Whiteboard save failed:", error);
    }
  }
  function subscribeBoard(boardId) {
    if (stopSnapshot) stopSnapshot();
    if (!db || !onSnapshot || !user) {
      setStatus("Локальный режим", "offline");
      return;
    }
    const ref = boardRef(boardId);
    stopSnapshot = onSnapshot(ref, snap => {
      if (disposed || activeBoard !== boardId) return;
      if (!snap.exists()) {
        if (dirty || elements.length || deletedIds.size) {
          dirty = true;
          editRevision += 1;
          saveToCloud(boardId);
        } else {
          setStatus("Новая доска · готова к работе", "ok");
        }
        return;
      }
      const data = snap.data();
      lastRemoteUpdate = Date.now();
      const remoteElements = Array.isArray(data.elements) ? data.elements : [];
      const remoteDeleted = Array.isArray(data.deletedIds) ? data.deletedIds : [];
      const remoteUpdatedAt = data.updatedAt && typeof data.updatedAt.toMillis === "function" ? data.updatedAt.toMillis() : Number(data.updatedAt || 0);
      if (!dirty && localUpdatedAt > remoteUpdatedAt) {
        dirty = true;
        editRevision += 1;
        elements = mergeElements(remoteElements, remoteDeleted);
        deletedIds = new Set([...remoteDeleted, ...deletedIds]);
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(() => saveToCloud(boardId), 250);
        render();
        setStatus("Восстанавливаю локальные изменения…", "pending");
        return;
      }
      if (dirty) {
        elements = mergeElements(remoteElements, remoteDeleted);
        deletedIds = new Set([...remoteDeleted, ...deletedIds].filter(id => !restoredIds.has(id)));
        render();
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(() => saveToCloud(boardId), 500);
      } else {
        elements = remoteElements.filter(item => item && item.id && !remoteDeleted.includes(item.id));
        deletedIds = new Set(remoteDeleted);
        restoredIds = new Set();
        title = data.title || BOARD_NAMES[boardId].title;
        titleInput.value = title;
        resetHistory();
        localUpdatedAt = remoteUpdatedAt;
        rememberLocal(boardId, { title, elements, deletedIds: [...deletedIds], restoredIds: [], updatedAt: remoteUpdatedAt });
        render();
      }
      setStatus("Синхронизировано", "ok");
    }, error => {
      if (activeBoard === boardId) setStatus("Локально · нет связи", "offline");
      console.warn("Whiteboard listener failed:", error);
    });
  }
  function loadBoard(boardId) {
    activeBoard = boardId;
    selectedId = null;
    const local = readLocal(boardId);
    localUpdatedAt = local ? Number(local.updatedAt || 0) : 0;
    elements = local ? local.elements : [];
    deletedIds = new Set(local && Array.isArray(local.deletedIds) ? local.deletedIds : []);
    restoredIds = new Set(local && Array.isArray(local.restoredIds) ? local.restoredIds : []);
    title = local && local.title ? local.title : BOARD_NAMES[boardId].title;
    titleInput.value = title;
    dirty = false;
    resetHistory();
    render();
    setStatus("Подключение…", "pending");
    subscribeBoard(boardId);
  }
  function switchBoard(boardId) {
    if (!BOARD_NAMES[boardId] || boardId === activeBoard) return;
    if (saveTimer) clearTimeout(saveTimer);
    if (dirty) saveToCloud(activeBoard);
    if (stopSnapshot) { stopSnapshot(); stopSnapshot = null; }
    loadBoard(boardId);
  }

  function drawArrow(context, x1, y1, x2, y2, color, width) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const head = Math.max(12, width * 3.5);
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = width;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.beginPath();
    context.moveTo(x2, y2);
    context.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
    context.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
    context.closePath();
    context.fill();
  }
  function drawGrid(context) {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
    if (!gridVisible) return;
    context.save();
    context.lineWidth = 1;
    for (let x = 0; x <= BOARD_WIDTH; x += 40) {
      context.strokeStyle = x % 200 === 0 ? "#dfe5ef" : "#edf0f5";
      context.beginPath(); context.moveTo(x, 0); context.lineTo(x, BOARD_HEIGHT); context.stroke();
    }
    for (let y = 0; y <= BOARD_HEIGHT; y += 40) {
      context.strokeStyle = y % 200 === 0 ? "#dfe5ef" : "#edf0f5";
      context.beginPath(); context.moveTo(0, y); context.lineTo(BOARD_WIDTH, y); context.stroke();
    }
    context.restore();
  }
  function drawGraph(context, item) {
    const x = item.x, y = item.y, w = item.w, h = item.h;
    context.save();
    context.fillStyle = "#ffffff";
    context.strokeStyle = "#cfd7e4";
    context.lineWidth = 2;
    context.beginPath(); context.roundRect(x, y, w, h, 14); context.fill(); context.stroke();
    const left = x + 66, right = x + w - 28, top = y + 58, bottom = y + h - 58;
    const xMin = Number(item.xMin), xMax = Number(item.xMax);
    const samples = Array.isArray(item.samples) ? item.samples : [];
    const values = samples.map(point => point.y).filter(Number.isFinite);
    const yMin = Number.isFinite(item.yMin) ? item.yMin : Math.min(-1, ...values);
    const yMax = Number.isFinite(item.yMax) ? item.yMax : Math.max(1, ...values);
    const xRange = Math.max(.0001, xMax - xMin), yRange = Math.max(.0001, yMax - yMin);
    const px = value => left + (value - xMin) / xRange * (right - left);
    const py = value => bottom - (value - yMin) / yRange * (bottom - top);
    context.fillStyle = "#1f2c42";
    context.font = "bold 25px Inter, Arial";
    context.fillText(item.label || "График функции", x + 28, y + 34);
    context.strokeStyle = "#e6ebf2";
    context.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const gx = left + (right - left) * i / 10;
      const gy = top + (bottom - top) * i / 8;
      context.beginPath(); context.moveTo(gx, top); context.lineTo(gx, bottom); context.stroke();
      context.beginPath(); context.moveTo(left, gy); context.lineTo(right, gy); context.stroke();
    }
    if (xMin <= 0 && xMax >= 0) {
      context.strokeStyle = "#8996a9"; context.lineWidth = 2;
      context.beginPath(); context.moveTo(px(0), top); context.lineTo(px(0), bottom); context.stroke();
    }
    if (yMin <= 0 && yMax >= 0) {
      context.strokeStyle = "#8996a9"; context.lineWidth = 2;
      context.beginPath(); context.moveTo(left, py(0)); context.lineTo(right, py(0)); context.stroke();
    }
    context.fillStyle = "#65738a";
    context.font = "16px Inter, Arial";
    context.fillText("x", right + 9, bottom + 26);
    context.fillText("y", left - 25, top - 12);
    context.fillText(String(xMin), left - 8, bottom + 26);
    context.fillText(String(xMax), right - 20, bottom + 26);
    context.fillText(String(yMax), left - 42, top + 5);
    context.fillText(String(yMin), left - 42, bottom + 5);
    if (samples.length) {
      context.strokeStyle = item.color || "#625cf6";
      context.lineWidth = 4;
      context.lineJoin = "round";
      context.beginPath();
      let started = false;
      samples.forEach(point => {
        if (!Number.isFinite(point.x) || !Number.isFinite(point.y) || point.y < yMin || point.y > yMax) { started = false; return; }
        const sx = px(point.x), sy = py(point.y);
        if (!started) { context.moveTo(sx, sy); started = true; } else context.lineTo(sx, sy);
      });
      context.stroke();
      if (item.dataPoints) {
        context.fillStyle = "#e05d5d";
        item.dataPoints.forEach(point => {
          if (point.x < xMin || point.x > xMax || point.y < yMin || point.y > yMax) return;
          context.beginPath(); context.arc(px(point.x), py(point.y), 6, 0, Math.PI * 2); context.fill();
        });
      }
    }
    context.restore();
  }
  function drawDiagram(context, item) {
    const x = item.x, y = item.y, sx = item.w / 560, sy = item.h / 360;
    context.save();
    context.translate(x, y);
    context.scale(sx, sy);
    context.fillStyle = "#ffffff";
    context.strokeStyle = "#cfd7e4";
    context.lineWidth = 2;
    context.beginPath(); context.roundRect(0, 0, 560, 360, 14); context.fill(); context.stroke();
    const label = (text, tx, ty, size = 19) => { context.fillStyle = "#26344b"; context.font = "600 " + size + "px Inter, Arial"; context.fillText(text, tx, ty); };
    const line = (x1, y1, x2, y2, color = "#34445c", width = 3) => { context.strokeStyle = color; context.lineWidth = width; context.beginPath(); context.moveTo(x1, y1); context.lineTo(x2, y2); context.stroke(); };
    if (item.kind === "forces") {
      label("СИЛЫ, ДЕЙСТВУЮЩИЕ НА ТЕЛО", 28, 38, 18);
      context.fillStyle = "#dfe8f5"; context.strokeStyle = "#5c6c82"; context.lineWidth = 3;
      context.fillRect(220, 155, 120, 80); context.strokeRect(220, 155, 120, 80);
      drawArrow(context, 280, 155, 280, 72, "#dc5a5a", 6);
      drawArrow(context, 280, 235, 280, 315, "#4b8be8", 6);
      drawArrow(context, 340, 195, 455, 195, "#d69a35", 5);
      label("N", 298, 88, 22); label("Fтяж", 298, 330, 20); label("Fтр", 390, 180, 20); label("Тело", 235, 205, 18);
      line(140, 275, 420, 275, "#8996a9", 3);
      label("Опора", 420, 294, 16);
    } else if (item.kind === "circuit") {
      label("ПРОСТЕЙШАЯ ЭЛЕКТРИЧЕСКАЯ ЦЕПЬ", 24, 38, 18);
      line(90, 100, 470, 100); line(470, 100, 470, 270); line(470, 270, 90, 270); line(90, 270, 90, 100);
      line(78, 155, 102, 155, "#dc5a5a", 5); line(83, 180, 97, 180, "#dc5a5a", 5);
      label("+", 55, 154, 22); label("−", 55, 190, 22); label("Источник", 30, 315, 17);
      line(235, 100, 235, 125); line(235, 125, 255, 135); line(255, 135, 235, 145); line(235, 145, 255, 155); line(255, 155, 235, 165); line(235, 165, 255, 175); line(255, 175, 235, 185); line(235, 185, 235, 270);
      label("R", 267, 157, 20);
      context.strokeStyle = "#34445c"; context.lineWidth = 3; context.beginPath(); context.arc(385, 185, 33, 0, Math.PI * 2); context.stroke();
      line(362, 162, 408, 208, "#dc9b43", 3); line(408, 162, 362, 208, "#dc9b43", 3);
      label("Лампа", 352, 240, 17);
      label("Ключ", 130, 290, 17);
      line(130, 270, 130, 250); line(130, 250, 175, 225, "#34445c", 4);
    } else {
      label("СОБИРАЮЩАЯ ЛИНЗА", 28, 38, 18);
      line(40, 180, 520, 180, "#8a96a8", 2);
      context.strokeStyle = "#4d8fe9"; context.lineWidth = 6; context.beginPath(); context.ellipse(280, 180, 18, 105, 0, 0, Math.PI * 2); context.stroke();
      drawArrow(context, 115, 180, 115, 75, "#dc5a5a", 5);
      drawArrow(context, 445, 180, 445, 115, "#249a75", 5);
      line(115, 75, 280, 75, "#dc9b43", 3); line(280, 75, 445, 115, "#dc9b43", 3);
      line(115, 75, 280, 180, "#dc9b43", 2); line(280, 180, 445, 115, "#dc9b43", 2);
      label("Предмет", 65, 55, 17); label("Линза", 245, 315, 17); label("Изображение", 395, 95, 17);
      label("F", 210, 200, 16); label("F", 350, 200, 16);
    }
    context.restore();
  }
  function drawElement(context, item) {
    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";
    if (item.type === "stroke") {
      if (!item.points || item.points.length < 1) { context.restore(); return; }
      context.strokeStyle = item.color || "#25324a";
      context.lineWidth = item.width || 4;
      context.beginPath();
      context.moveTo(item.points[0].x, item.points[0].y);
      item.points.forEach(point => context.lineTo(point.x, point.y));
      if (item.points.length === 1) context.lineTo(item.points[0].x + .1, item.points[0].y + .1);
      context.stroke();
    } else if (item.type === "shape") {
      context.strokeStyle = item.color || "#25324a";
      context.lineWidth = item.width || 4;
      if (item.shape === "line") {
        context.beginPath(); context.moveTo(item.x1, item.y1); context.lineTo(item.x2, item.y2); context.stroke();
      } else if (item.shape === "arrow") {
        drawArrow(context, item.x1, item.y1, item.x2, item.y2, item.color || "#25324a", item.width || 4);
      } else if (item.shape === "rect") {
        context.strokeRect(item.x1, item.y1, item.x2 - item.x1, item.y2 - item.y1);
      } else if (item.shape === "ellipse") {
        context.beginPath(); context.ellipse((item.x1 + item.x2) / 2, (item.y1 + item.y2) / 2, Math.max(1, Math.abs(item.x2 - item.x1) / 2), Math.max(1, Math.abs(item.y2 - item.y1) / 2), 0, 0, Math.PI * 2); context.stroke();
      }
    } else if (item.type === "text") {
      context.fillStyle = item.color || "#25324a";
      context.font = (item.bold ? "700 " : "500 ") + (item.size || 30) + "px Inter, Arial, sans-serif";
      String(item.text || "").split("\n").forEach((line, index) => context.fillText(line, item.x, item.y + index * (item.size || 30) * 1.35));
    } else if (item.type === "graph") {
      drawGraph(context, item);
    } else if (item.type === "diagram") {
      drawDiagram(context, item);
    }
    context.restore();
  }
  function objectBounds(item) {
    if (item.type === "shape") return { x: Math.min(item.x1, item.x2), y: Math.min(item.y1, item.y2), w: Math.abs(item.x2 - item.x1), h: Math.abs(item.y2 - item.y1) };
    if (item.type === "stroke") {
      const xs = item.points.map(p => p.x), ys = item.points.map(p => p.y);
      return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
    }
    if (item.type === "text") return { x: item.x, y: item.y - (item.size || 30), w: Math.max(60, String(item.text).length * (item.size || 30) * .65), h: (String(item.text).split("\n").length + .3) * (item.size || 30) * 1.35 };
    return { x: item.x, y: item.y, w: item.w, h: item.h };
  }
  function renderSelection(context, item) {
    const bounds = objectBounds(item);
    context.save();
    context.strokeStyle = "#625cf6";
    context.lineWidth = 3;
    context.setLineDash([10, 7]);
    context.strokeRect(bounds.x - 9, bounds.y - 9, bounds.w + 18, bounds.h + 18);
    context.restore();
  }
  function render() {
    if (!ctx) return;
    drawGrid(ctx);
    elements.forEach(item => drawElement(ctx, item));
    if (drawing) drawElement(ctx, drawing);
    if (selectedId) {
      const selected = elements.find(item => item.id === selectedId);
      if (selected) renderSelection(ctx, selected);
    }
    q("[data-wb-element-count]").textContent = elements.length + " " + (elements.length === 1 ? "объект" : elements.length < 5 ? "объекта" : "объектов");
    q("[data-wb-empty]").classList.toggle("visible", elements.length === 0 && !drawing);
    updateHistoryButtons();
  }
  function pointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: Math.max(0, Math.min(BOARD_WIDTH, (event.clientX - rect.left) / rect.width * BOARD_WIDTH)), y: Math.max(0, Math.min(BOARD_HEIGHT, (event.clientY - rect.top) / rect.height * BOARD_HEIGHT)) };
  }
  function distanceToSegment(point, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const length = dx * dx + dy * dy;
    if (!length) return Math.hypot(point.x - a.x, point.y - a.y);
    const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / length));
    return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
  }
  function hitTest(point, radius = 18) {
    for (let i = elements.length - 1; i >= 0; i--) {
      const item = elements[i];
      if (item.type === "stroke") {
        for (let j = 1; j < item.points.length; j++) if (distanceToSegment(point, item.points[j - 1], item.points[j]) <= radius + (item.width || 3)) return item;
        if (item.points.length === 1 && Math.hypot(point.x - item.points[0].x, point.y - item.points[0].y) <= radius) return item;
      } else if (item.type === "shape") {
        const b = objectBounds(item);
        if (point.x >= b.x - radius && point.x <= b.x + b.w + radius && point.y >= b.y - radius && point.y <= b.y + b.h + radius) return item;
      } else {
        const b = objectBounds(item);
        if (point.x >= b.x - radius && point.x <= b.x + b.w + radius && point.y >= b.y - radius && point.y <= b.y + b.h + radius) return item;
      }
    }
    return null;
  }
  function moveObject(item, dx, dy, original) {
    const copy = clone(original);
    if (copy.type === "stroke") copy.points = copy.points.map(point => ({ x: point.x + dx, y: point.y + dy }));
    else if (copy.type === "shape") { copy.x1 += dx; copy.x2 += dx; copy.y1 += dy; copy.y2 += dy; }
    else { copy.x += dx; copy.y += dy; }
    return copy;
  }
  function addObject(item) {
    commit([...elements, { id: makeId(), ...item }]);
  }
  function eraseAt(point) {
    const target = hitTest(point, 28);
    if (!target) return false;
    elements = elements.filter(item => item.id !== target.id);
    if (selectedId === target.id) selectedId = null;
    deletedIds.add(target.id);
    eraserChanged = true;
    render();
    return true;
  }
  function setTool(tool) {
    currentTool = tool;
    root.querySelectorAll("[data-wb-tool]").forEach(button => button.classList.toggle("active", button.dataset.wbTool === tool));
    const hints = {
      select: "Выбор: нажми на объект и перетащи его.",
      pen: "Карандаш: рисуй мышью, стилусом или пальцем.",
      eraser: "Ластик: проведи по объектам, которые нужно удалить.",
      line: "Линия: протяни от начальной точки к конечной.",
      arrow: "Вектор: протяни стрелку в нужном направлении.",
      rect: "Прямоугольник: протяни диагональ фигуры.",
      ellipse: "Эллипс: протяни диагональ фигуры.",
      text: "Текст: нажми на лист и введи запись.",
      graph: "График: настрой функцию или точки в правой панели."
    };
    q("[data-wb-tool-hint]").textContent = hints[tool] || "";
    canvas.style.cursor = tool === "select" ? "default" : tool === "text" ? "text" : "crosshair";
    if (tool === "graph") q("[data-wb-expression]").focus();
  }
  function addNote() {
    const text = noteInput.value.trim();
    if (!text) { toast("Сначала введи текст или формулу."); noteInput.focus(); return; }
    addObject({ type: "text", x: 180, y: 170 + elements.filter(item => item.type === "text").length * 58, text, color: currentColor, size: 30 });
    noteInput.value = "";
  }
  function addFunctionGraph() {
    const expression = q("[data-wb-expression]").value.trim();
    const xMin = Number(q("[data-wb-xmin]").value), xMax = Number(q("[data-wb-xmax]").value);
    if (!Number.isFinite(xMin) || !Number.isFinite(xMax) || xMax <= xMin || xMax - xMin > 10000) { toast("Проверь границы X: правая граница должна быть больше левой."); return; }
    try {
      const fn = compilePhysicsExpression(expression);
      const samples = [];
      for (let i = 0; i <= 180; i++) {
        const x = xMin + (xMax - xMin) * i / 180;
        const y = fn(x);
        samples.push({ x, y });
      }
      const finite = samples.map(point => point.y).filter(Number.isFinite);
      if (!finite.length) throw new Error("На выбранном интервале функция не имеет конечных значений.");
      const min = Math.min(...finite), max = Math.max(...finite);
      const padding = Math.max(.5, (max - min) * .12);
      addObject({
        type: "graph", x: 130, y: 120 + elements.filter(item => item.type === "graph").length * 35,
        w: 900, h: 650, label: "y = " + expression, expression, xMin, xMax,
        yMin: min - padding, yMax: max + padding, samples, color: currentColor
      });
      setTool("select");
      toast("График построен. Его можно переместить инструментом выбора.");
    } catch (error) { toast(error.message || "Не удалось построить график."); }
  }
  function renderPointDraft() {
    const list = q("[data-wb-point-list]");
    list.innerHTML = pointDraft.length ? pointDraft.map((point, index) => '<span>(' + point.x + '; ' + point.y + ') <button type="button" data-wb-remove-point="' + index + '" aria-label="Удалить точку">×</button></span>').join("") : "Точки пока не добавлены";
    q('[data-wb-action="add-points-graph"]').disabled = pointDraft.length < 2;
  }
  function addPoint() {
    const x = Number(q("[data-wb-point-x]").value), y = Number(q("[data-wb-point-y]").value);
    if (q("[data-wb-point-x]").value.trim() === "" || q("[data-wb-point-y]").value.trim() === "" || !Number.isFinite(x) || !Number.isFinite(y)) { toast("Введи корректные координаты X и Y."); return; }
    pointDraft.push({ x, y });
    q("[data-wb-point-x]").value = "";
    q("[data-wb-point-y]").value = "";
    renderPointDraft();
  }
  function addPointsGraph() {
    if (pointDraft.length < 2) return;
    const points = clone(pointDraft).sort((a, b) => a.x - b.x);
    const xMin = Math.min(...points.map(p => p.x)), xMax = Math.max(...points.map(p => p.x));
    const yMin = Math.min(...points.map(p => p.y)), yMax = Math.max(...points.map(p => p.y));
    const xPad = Math.max(.5, (xMax - xMin) * .12), yPad = Math.max(.5, (yMax - yMin) * .12);
    addObject({
      type: "graph", x: 130, y: 120 + elements.filter(item => item.type === "graph").length * 35,
      w: 900, h: 650, label: "График по экспериментальным данным",
      xMin: xMin - xPad, xMax: xMax + xPad, yMin: yMin - yPad, yMax: yMax + yPad,
      samples: points, dataPoints: points, color: currentColor
    });
    pointDraft.length = 0;
    renderPointDraft();
    setTool("select");
    toast("График по измерениям добавлен на доску.");
  }
  function addDiagram(kind) {
    const count = elements.filter(item => item.type === "diagram").length;
    addObject({ type: "diagram", kind, x: 180 + count * 35, y: 180 + count * 28, w: 560, h: 360 });
    setTool("select");
    toast("Физическая схема добавлена. Перемести её в нужное место.");
  }
  function addTextAt(point) {
    const text = window.prompt("Текст или формула для доски:");
    if (text && text.trim()) addObject({ type: "text", x: point.x, y: point.y, text: text.trim().slice(0, 500), color: currentColor, size: 30 });
  }
  function exportPng() {
    try {
      const link = document.createElement("a");
      link.download = "physics-board-" + activeBoard + ".png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast("Изображение доски подготовлено.");
    } catch (error) { toast("Не удалось экспортировать доску."); }
  }
  function clearBoard() {
    if (!elements.length) return;
    if (!window.confirm("Очистить все объекты на этой доске?")) return;
    selectedId = null;
    commit([]);
    toast("Доска очищена. Изменение сохранится автоматически.");
  }

  canvas.addEventListener("pointerdown", event => {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    if (currentTool === "pen") {
      drawing = { id: makeId(), type: "stroke", points: [point], color: currentColor, width: currentWidth };
      render();
    } else if (currentTool === "eraser") {
      erasing = true; eraserChanged = false; eraseAt(point);
    } else if (["line", "arrow", "rect", "ellipse"].includes(currentTool)) {
      drawing = { id: makeId(), type: "shape", shape: currentTool, x1: point.x, y1: point.y, x2: point.x, y2: point.y, color: currentColor, width: currentWidth };
      render();
    } else if (currentTool === "text") {
      addTextAt(point);
    } else if (currentTool === "select") {
      const target = hitTest(point, 22);
      if (target) {
        selectedId = target.id;
        dragState = { id: target.id, start: point, original: clone(target), initialElements: clone(elements), moved: false };
        render();
      } else {
        selectedId = null;
        dragState = null; render();
      }
    } else if (currentTool === "graph") {
      q("[data-wb-expression]").focus();
    }
  });
  canvas.addEventListener("pointermove", event => {
    const point = pointFromEvent(event);
    if (drawing && drawing.type === "stroke") {
      const last = drawing.points[drawing.points.length - 1];
      if (Math.hypot(point.x - last.x, point.y - last.y) > 1.8) drawing.points.push(point);
      render();
    } else if (drawing && drawing.type === "shape") {
      drawing.x2 = point.x; drawing.y2 = point.y; render();
    } else if (erasing) {
      eraseAt(point);
    } else if (dragState && dragState.id) {
      const dx = point.x - dragState.start.x, dy = point.y - dragState.start.y;
      if (Math.hypot(dx, dy) > 1) dragState.moved = true;
      elements = dragState.initialElements.map(item => item.id === dragState.id ? moveObject(item, dx, dy, dragState.original) : item);
      render();
    }
  });
  function finishPointer() {
    if (drawing) {
      const item = drawing; drawing = null;
      if (item.type === "stroke" && item.points.length < 2) item.points.push({ x: item.points[0].x + .1, y: item.points[0].y + .1 });
      if (item.type !== "shape" || Math.hypot(item.x2 - item.x1, item.y2 - item.y1) > 3) commit([...elements, item]);
      else render();
    }
    if (erasing) {
      erasing = false;
      if (eraserChanged) { history = history.slice(0, historyIndex + 1); history.push(clone(elements)); historyIndex = history.length - 1; markDirty(); render(); }
    }
    if (dragState) {
      const changed = dragState.moved;
      dragState = null;
      if (changed) commit(elements); else render();
    }
  }
  canvas.addEventListener("pointerup", finishPointer);
  canvas.addEventListener("pointercancel", finishPointer);
  canvas.addEventListener("lostpointercapture", finishPointer);

  root.addEventListener("click", event => {
    const tool = event.target.closest("[data-wb-tool]");
    if (tool) { setTool(tool.dataset.wbTool); return; }
    const action = event.target.closest("[data-wb-action]");
    if (action) {
      const name = action.dataset.wbAction;
      if (name === "undo") undo();
      if (name === "redo") redo();
      if (name === "clear") clearBoard();
      if (name === "export") exportPng();
      if (name === "add-note") addNote();
      if (name === "add-function") addFunctionGraph();
      if (name === "add-point") addPoint();
      if (name === "add-points-graph") addPointsGraph();
      return;
    }
    const symbol = event.target.closest("[data-wb-symbol]");
    if (symbol) {
      const start = noteInput.selectionStart ?? noteInput.value.length;
      const end = noteInput.selectionEnd ?? noteInput.value.length;
      noteInput.setRangeText(symbol.dataset.wbSymbol, start, end, "end");
      noteInput.focus();
      return;
    }
    const diagram = event.target.closest("[data-wb-diagram]");
    if (diagram) addDiagram(diagram.dataset.wbDiagram);
    const removePoint = event.target.closest("[data-wb-remove-point]");
    if (removePoint) { pointDraft.splice(Number(removePoint.dataset.wbRemovePoint), 1); renderPointDraft(); }
  });
  root.addEventListener("input", event => {
    if (event.target.matches("[data-wb-color]")) currentColor = event.target.value;
    if (event.target.matches("[data-wb-width]")) {
      currentWidth = Number(event.target.value);
      q("[data-wb-width-label]").textContent = String(currentWidth);
    }
    if (event.target.matches("[data-wb-title]")) {
      title = event.target.value.trim() || BOARD_NAMES[activeBoard].title;
      markDirty();
    }
  });
  root.addEventListener("change", event => {
    if (event.target.matches("[data-wb-board]")) switchBoard(event.target.value);
    if (event.target.matches("[data-wb-grid]")) { gridVisible = event.target.checked; render(); }
  });
  const handleGlobalKeydown = event => {
    if (disposed || document.body.dataset.currentTab !== "whiteboard") return;
    const tag = event.target && event.target.tagName;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") { event.preventDefault(); undo(); }
    else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") { event.preventDefault(); redo(); }
    else if (event.key === "Delete" || event.key === "Backspace") {
      if (selectedId) {
        const next = elements.filter(item => item.id !== selectedId);
        selectedId = null; dragState = null; commit(next);
      }
    } else if (event.key.toLowerCase() === "p") setTool("pen");
    else if (event.key.toLowerCase() === "e") setTool("eraser");
    else if (event.key.toLowerCase() === "t") setTool("text");
  };
  window.addEventListener("keydown", handleGlobalKeydown);

  boardSelect.value = activeBoard;
  q("[data-wb-grid]").checked = gridVisible;
  renderPointDraft();
  loadBoard(activeBoard);

  return {
    refresh() { render(); },
    dispose() {
      if (saveTimer) clearTimeout(saveTimer);
      if (dirty) saveToCloud(activeBoard);
      disposed = true;
      if (stopSnapshot) stopSnapshot();
      window.removeEventListener("keydown", handleGlobalKeydown);
    }
  };
}
