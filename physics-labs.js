export const labCatalog = [
  {id:"density",title:"Плотность цилиндра",kit:"Комплект № 1",group:"Масса и объём",time:"15–20 мин",scene:"density",goal:"Измерить массу металлического цилиндра и его объём методом вытеснения воды, затем определить плотность."},
  {id:"motion",title:"Средняя скорость тележки",kit:"Кинематика",group:"Движение",time:"10–15 мин",scene:"motion",goal:"Провести тележку по измерительному треку, снять путь и время, вычислить среднюю скорость."},
  {id:"spring",title:"Жёсткость пружины",kit:"Комплект № 2",group:"Силы и упругость",time:"15–20 мин",scene:"spring",goal:"Подвесить груз к пружине, измерить удлинение и проверить закон Гука."},
  {id:"archimedes",title:"Сила Архимеда",kit:"Комплект № 1",group:"Жидкости и газы",time:"15 мин",scene:"archimedes",goal:"Измерить вес тела в воздухе и воде, определить выталкивающую силу."},
  {id:"lever",title:"Равновесие рычага",kit:"Комплект № 6",group:"Механика",time:"15 мин",scene:"lever",goal:"Передвигать грузы по рычагу, измерять плечи и сравнивать моменты сил."},
  {id:"pendulum",title:"Период маятника",kit:"Комплект № 5 · тренировка",group:"Колебания",time:"15–20 мин",scene:"pendulum",goal:"Изменить длину нити, запустить маятник и измерить время нескольких колебаний."},
  {id:"heat",title:"Тепловой баланс",kit:"Комплект № 7 · тренировка",group:"Тепловые явления",time:"20 мин",scene:"heat",goal:"Перенести нагретый металлический цилиндр в калориметр и исследовать теплообмен."},
  {id:"ohm",title:"Закон Ома на цепи",kit:"Комплект № 3",group:"Электричество",time:"20–25 мин",scene:"ohm",goal:"Собрать электрическую цепь, менять сопротивление реостата и снять три пары показаний амперметра и вольтметра."},
  {id:"induction",title:"Электромагнитная индукция",kit:"Комплект № 3 · тренировка",group:"Электромагнетизм",time:"10–15 мин",scene:"induction",goal:"Перемещать магнит относительно катушки и наблюдать направление отклонения гальванометра."},
  {id:"lens",title:"Фокусное расстояние линзы",kit:"Комплект № 4",group:"Оптика",time:"15–20 мин",scene:"lens",goal:"Передвигать экран по оптической скамье, получить резкое изображение и определить фокусное расстояние."},
  {id:"uncertainty",title:"Точность измерений",kit:"Измерительный практикум",group:"Измерения",time:"10–15 мин",scene:"uncertainty",goal:"Снять серию измерений по шкале, найти среднее значение и оценить разброс результатов."},
  {id:"friction",title:"Коэффициент трения",kit:"Комплект № 2",group:"Силы и упругость",time:"15–20 мин",scene:"friction",goal:"Перемещать брусок по поверхности, менять нагрузку и измерять силу трения."}
];

const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const lab = id => labCatalog.find(item => item.id === id) || labCatalog[0];

export function renderLabCatalog(activeId, progress = {}) {
  return labCatalog.map((item, index) => {
    const saved = progress[item.id];
    const status = saved && saved.completed ? '<span class="vlab-catalog-status done">✓ Пройдено</span>' : '<span class="vlab-catalog-status">Практика</span>';
    return '<button type="button" class="vlab-catalog-item '+(activeId === item.id ? "active" : "")+'" data-virtual-lab="'+esc(item.id)+'">'+
      '<span class="vlab-catalog-number">'+String(index + 1).padStart(2,"0")+'</span>'+
      '<span class="vlab-catalog-copy"><b>'+esc(item.title)+'</b><small>'+esc(item.kit)+' · '+esc(item.time)+'</small>'+status+'</span>'+
      '<span class="vlab-catalog-arrow">↗</span></button>';
  }).join("");
}

function field(key,label,unit,placeholder) {
  return '<label class="vlab-field"><span>'+esc(label)+'</span><div><input class="field" type="number" step="any" inputmode="decimal" data-vlab-field="'+esc(key)+'" placeholder="'+esc(placeholder || "Сними показание")+'"><small>'+esc(unit || "")+'</small></div></label>';
}
function reportChecks() {
  return '<div class="vlab-report-checks"><label><input type="checkbox" data-vlab-check="scheme"> Перенёс схему установки в бланк</label><label><input type="checkbox" data-vlab-check="units"> Указал единицы и погрешности</label></div><label class="vlab-conclusion-field"><span>Вывод по эксперименту</span><textarea data-vlab-conclusion rows="2" placeholder="Что показал опыт? Как связаны измеренные величины?"></textarea></label>';
}
function densityScene() {
  return '<div class="vlab-scene vlab-density-scene" data-scene="density">'+
    '<div class="vlab-scene-caption">РАБОЧИЙ СТОЛ · КОМПЛЕКТ № 1</div>'+
    '<div class="vlab-scale-apparatus" data-dropzone="scale"><div class="vlab-scale-platform"></div><div class="vlab-scale-screen" data-readout="mass">— — —</div><small>ЭЛЕКТРОННЫЕ ВЕСЫ</small></div>'+
    '<div class="vlab-measuring-cylinder vlab-drag" data-drag-object="menzurka" data-dropzone="cylinder" style="left:475px;top:76px"><div class="vlab-cylinder-top"></div><div class="vlab-cylinder-glass"><div class="vlab-cylinder-water" data-water></div><div class="vlab-cylinder-ticks"><i>100</i><i>80</i><i>60</i><i>40</i><i>20</i></div><div class="vlab-cylinder-value" data-readout="volume">40 мл</div></div><small>МЕНЗУРКА</small></div>'+
    '<div class="vlab-metal-sample vlab-drag" data-drag-object="sample" style="left:285px;top:225px"><span></span><b>Al</b><small>цилиндр</small></div>'+
    '<div class="vlab-scene-note">Перетащи цилиндр сначала на весы, затем опусти его в мензурку.</div>'+
    '<div class="vlab-readout-pills"><span>Масса: <b data-readout="mass-pill">не измерена</b></span><span>Объём воды: <b data-readout="volume-pill">40 мл</b></span></div>'+
  '</div>';
}
function motionScene() {
  return '<div class="vlab-scene vlab-motion-scene" data-scene="motion">'+
    '<div class="vlab-scene-caption">ТРЕК ДЛЯ ИЗМЕРЕНИЯ ДВИЖЕНИЯ</div><div class="vlab-track-line"></div>'+
    '<div class="vlab-track-mark start">СТАРТ</div><div class="vlab-track-mark finish">ФИНИШ</div>'+
    '<div class="vlab-track-ruler"><i>0</i><i>20</i><i>40</i><i>60</i><i>80</i><i>100 см</i></div>'+
    '<div class="vlab-cart vlab-drag" data-drag-object="cart" data-drag-axis="x" style="left:105px;top:155px"><span class="vlab-cart-body"></span><i></i><i></i><small>тележка</small></div>'+
    '<div class="vlab-motion-timer"><span>Секундомер</span><b data-readout="time">0,00 с</b><small data-readout="motion-state">Перетащи тележку к финишу</small></div>'+
    '<div class="vlab-scene-note">Перетащи тележку от старта к финишу. Время движения измеряется автоматически.</div>'+
  '</div>';
}
function springScene() {
  return '<div class="vlab-scene vlab-spring-scene" data-scene="spring">'+
    '<div class="vlab-scene-caption">ШТАТИВ · ПРУЖИНА · НАБОР ГРУЗОВ</div>'+
    '<div class="vlab-stand"><span class="vlab-stand-foot"></span><span class="vlab-stand-pole"></span><span class="vlab-stand-arm"></span></div>'+
    '<div class="vlab-spring-anchor"></div><div class="vlab-spring-coil" data-spring-coil></div><div class="vlab-spring-hook" data-dropzone="hook"></div>'+
    ''+
    '<div class="vlab-ruler-vertical"><i>0</i><i>2</i><i>4</i><i>6</i><i>8</i><i>10 см</i></div>'+
    '<div class="vlab-weight-tray" data-dropzone="tray"><span>Лоток для грузов · перетащи груз на крючок</span></div>'+
      '<button type="button" class="vlab-weight vlab-drag" data-drag-object="weight" data-mass="50" style="left:525px;top:286px">50 г</button>'+
      '<button type="button" class="vlab-weight vlab-drag" data-drag-object="weight" data-mass="100" style="left:595px;top:286px">100 г</button>'+
      '<button type="button" class="vlab-weight vlab-drag" data-drag-object="weight" data-mass="150" style="left:665px;top:286px">150 г</button>'+
    '<div class="vlab-spring-readouts"><span>Масса <b data-readout="mass">—</b></span><span>Удлинение <b data-readout="extension">—</b></span><span>Сила <b data-readout="force">—</b></span></div>'+
    '<div class="vlab-scene-note">Перетащи груз на крючок. Пружина растянется, а линейка покажет удлинение.</div>'+
  '</div>';
}
function archimedesScene() {
  return '<div class="vlab-scene vlab-arch-scene" data-scene="archimedes">'+
    '<div class="vlab-scene-caption">ДИНАМОМЕТР · ТЕЛО · СОСУД С ВОДОЙ</div>'+
    '<div class="vlab-dynamometer"><div class="vlab-dyna-top"></div><div class="vlab-dyna-glass"><span data-readout="dyna-value">3,90 Н</span><div class="vlab-dyna-scale"></div><div class="vlab-dyna-spring"></div></div><small>ДИНАМОМЕТР</small></div>'+
    '<div class="vlab-beaker vlab-drag" data-drag-object="beaker" style="left:455px;top:142px"><div class="vlab-beaker-rim"></div><div class="vlab-beaker-water"></div><div class="vlab-beaker-markings">100<br>75<br>50<br>25 мл</div><small>ВОДА</small></div>'+
    '<div class="vlab-hanging-body vlab-drag" data-drag-object="body" style="left:280px;top:95px"><span></span><b>сталь</b></div>'+
    '<div class="vlab-scene-note">Перетащи тело в воду, не касаясь дна и стенок. Показание динамометра уменьшится.</div>'+
    '<div class="vlab-readout-pills"><span>В воздухе: <b>3,90 Н</b></span><span>В воде: <b data-readout="water-force">ожидает погружения</b></span></div>'+
  '</div>';
}
function leverScene() {
  return '<div class="vlab-scene vlab-lever-scene" data-scene="lever">'+
    '<div class="vlab-scene-caption">РЫЧАГ · ОПОРА · ПОДВЕСНЫЕ ГРУЗЫ</div>'+
    '<div class="vlab-lever-beam" data-lever-beam></div><div class="vlab-lever-pivot"></div>'+
    '<div class="vlab-lever-weight left vlab-drag" data-drag-object="leftWeight" data-drag-axis="x" style="left:230px;top:128px"><b>200 г</b><small>груз A</small></div>'+
    '<div class="vlab-lever-weight right vlab-drag" data-drag-object="rightWeight" data-drag-axis="x" style="left:480px;top:128px"><b>200 г</b><small>груз B</small></div>'+
    '<div class="vlab-lever-scale"><i>40</i><i>30</i><i>20</i><i>10</i><i>0</i><i>10</i><i>20</i><i>30</i><i>40 см</i></div>'+
    '<div class="vlab-balance-indicator" data-readout="balance">● Рычаг уравновешен</div>'+
    '<div class="vlab-readout-pills"><span>Левое плечо: <b data-readout="left-arm">25 см</b></span><span>Правое плечо: <b data-readout="right-arm">25 см</b></span><span>Моменты: <b data-readout="moments">равны</b></span></div>'+
    '<div class="vlab-scene-note">Перемещай грузы вдоль рычага. Добейся равновесия моментов сил.</div>'+
  '</div>';
}
function pendulumScene() {
  return '<div class="vlab-scene vlab-pendulum-scene" data-scene="pendulum">'+
    '<div class="vlab-scene-caption">ШТАТИВ · НИТЬ · МАЯТНИК · СЕКУНДОМЕР</div>'+
    '<div class="vlab-pendulum-support"></div><div class="vlab-pendulum-string" data-pendulum-string></div><div class="vlab-pendulum-bob vlab-drag" data-drag-object="bob" style="left:365px;top:205px"></div>'+
    '<div class="vlab-pendulum-ruler">Длина нити: <b data-readout="pendulum-length">50 см</b><input type="range" min="20" max="100" step="5" value="50" data-vlab-control="pendulum-length"></div>'+
    '<div class="vlab-pendulum-actions"><button type="button" class="btn" data-vlab-action="pendulum-start">▶ Запустить</button><button type="button" class="btn" data-vlab-action="pendulum-stop">■ Остановить</button><span data-readout="pendulum-time">0,00 с</span></div>'+
    '<div class="vlab-scene-note">Отклони шарик мышкой, отпусти и измерь время 10 полных колебаний.</div>'+
  '</div>';
}
function heatScene() {
  return '<div class="vlab-scene vlab-heat-scene" data-scene="heat">'+
    '<div class="vlab-scene-caption">ВОДЯНАЯ БАНЯ · МЕТАЛЛ · КАЛОРИМЕТР</div>'+
    '<div class="vlab-hot-bath"><div class="vlab-hot-water"></div><small>ГОРЯЧАЯ ВОДА<br>90 °C</small></div>'+
    '<div class="vlab-calorimeter vlab-drag" data-drag-object="calorimeter" style="left:455px;top:145px"><div class="vlab-calorimeter-lid"></div><div class="vlab-calorimeter-water"></div><div class="vlab-calorimeter-thermometer" data-readout="thermometer">20,0 °C</div><small>КАЛОРИМЕТР</small></div>'+
    '<div class="vlab-hot-metal vlab-drag" data-drag-object="hotMetal" style="left:250px;top:105px"><span></span><b>Al</b><small>цилиндр</small></div>'+
    '<div class="vlab-scene-note">Перетащи нагретый цилиндр из водяной бани в калориметр. Дождись установления температуры.</div>'+
    '<div class="vlab-readout-pills"><span>Вода до опыта: <b>20,0 °C</b></span><span>Металл до опыта: <b>90,0 °C</b></span><span>Смесь: <b data-readout="final-temp">ожидает опыта</b></span></div>'+
  '</div>';
}
function ohmScene() {
  return '<div class="vlab-scene vlab-ohm-scene" data-scene="ohm">'+
    '<div class="vlab-scene-caption">ЭКСПЕРИМЕНТ ПО ДЕМОПРОЕКТУ ОГЭ-2027 · КОМПЛЕКТ № 3</div>'+
    '<svg class="vlab-circuit-svg" viewBox="0 0 760 300" role="img" aria-label="Источник 4,5 вольта, ключ, амперметр, реостат и резистор R2 с вольтметром параллельно">'+
      '<path class="circuit-wire" d="M120 80 V125 M120 185 V220 H350 M470 220 H630 V185 M630 125 V80 H480 M430 80 H305 M245 80 H120"/>'+
      '<path class="circuit-wire" d="M520 80 V125 M520 185 V220"/>'+
      '<g class="circuit-device"><path d="M100 145h40 M108 164h24"/><text x="120" y="198">4,5 В</text><text x="120" y="115">Источник</text></g>'+
      '<g class="circuit-device"><circle cx="275" cy="80" r="30"/><text x="275" y="87">A</text><text x="275" y="28">Амперметр</text></g>'+
      '<g class="circuit-device"><path d="M430 80h13 M477 80h13 M443 80l25 -16" /><text x="460" y="42">Ключ</text></g>'+
      '<g class="circuit-device"><rect x="610" y="125" width="40" height="60" rx="5"/><path d="M616 155h28"/><text x="630" y="207">R2 · 5,7 Ом</text></g>'+
      '<g class="circuit-device"><circle cx="520" cy="155" r="25"/><text x="520" y="162">V</text><text x="520" y="112">Вольтметр</text></g>'+
      '<g class="circuit-device"><rect x="350" y="202" width="120" height="36" rx="6"/><path d="M360 220h100 M395 195l30 48" class="circuit-slider"/><text x="410" y="275">Реостат 10 Ом</text></g>'+
    '</svg>'+
    '<div class="vlab-ohm-controls"><div><span>Ключ</span><button type="button" class="vlab-switch" data-vlab-action="toggle-switch" aria-pressed="false">Разомкнут</button></div><label><span>Реостат: <b data-readout="rheostat">9,3 Ом</b></span><input type="range" min="3.3" max="9.3" step="0.05" value="9.3" data-vlab-control="rheostat"></label></div>'+
    '<div class="vlab-meter-row"><div class="vlab-meter"><small>АМПЕРМЕТР</small><b data-readout="current">0,00 А</b></div><div class="vlab-meter"><small>ВОЛЬТМЕТР</small><b data-readout="voltage">0,00 В</b></div><div class="vlab-meter"><small>R2</small><b>5,7 Ом</b></div></div>'+
    '<div class="vlab-ohm-actions"><button type="button" class="btn primary" data-vlab-action="record-ohm">＋ Записать пару U и I</button><span data-readout="ohm-count">0 / 3 измерения</span></div>'+
    '<div class="vlab-ohm-table" data-readout="ohm-table">Пока нет измерений</div>'+
    '<div class="vlab-scene-note">Замкни ключ. Реостатом установи ток 0,3 А, 0,4 А и 0,5 А. Погрешности: ΔI = ±0,02 А; ΔU = ±0,1 В.</div>'+
  '</div>';
}
function inductionScene() {
  return '<div class="vlab-scene vlab-induction-scene" data-scene="induction">'+
    '<div class="vlab-scene-caption">КАТУШКА · ПОЛОСОВОЙ МАГНИТ · ГАЛЬВАНОМЕТР</div>'+
    '<div class="vlab-induction-coil" data-dropzone="coil"><i></i><i></i><i></i><i></i><i></i><small>КАТУШКА</small></div>'+
    '<div class="vlab-magnet vlab-drag" data-drag-object="magnet" data-drag-axis="x" style="left:120px;top:145px"><span>N</span><span>S</span></div>'+
    '<div class="vlab-galvanometer"><div class="vlab-galvanometer-face"><span>−</span><span>0</span><span>+</span><i data-readout="needle"></i></div><small>ГАЛЬВАНОМЕТР</small><b data-readout="induction-state">Нет изменения потока</b></div>'+
    '<div class="vlab-scene-note">Двигай магнит внутрь и наружу катушки. При неподвижном магните стрелка возвращается к нулю.</div>'+
  '</div>';
}
function lensScene() {
  return '<div class="vlab-scene vlab-lens-scene" data-scene="lens">'+
    '<div class="vlab-scene-caption">ОПТИЧЕСКАЯ СКАМЬЯ · СОБИРАЮЩАЯ ЛИНЗА · ЭКРАН</div>'+
    '<div class="vlab-optical-rail"></div>'+
    '<div class="vlab-candle vlab-drag" data-drag-object="object" data-drag-axis="x" style="left:95px;top:110px"><span></span><b>предмет</b></div>'+
    '<div class="vlab-lens vlab-drag" data-drag-object="lens" data-drag-axis="x" style="left:420px;top:70px"><i></i><small>линза</small></div>'+
    '<div class="vlab-screen vlab-drag" data-drag-object="screen" data-drag-axis="x" style="left:590px;top:82px"><div class="vlab-screen-image" data-screen-image></div><small>экран</small></div>'+
    '<div class="vlab-optical-scale"><i>0</i><i>20</i><i>40</i><i>60</i><i>80</i><i>100 см</i></div>'+
    '<div class="vlab-readout-pills"><span>Расстояние до предмета: <b data-readout="object-distance">65 см</b></span><span>До изображения: <b data-readout="image-distance">—</b></span><span>Фокус: <b data-readout="focus-state">не настроен</b></span></div>'+
    '<div class="vlab-scene-note">Передвигай экран и линзу. Добейся чёткого изображения на экране.</div>'+
  '</div>';
}
function uncertaintyScene() {
  return '<div class="vlab-scene vlab-uncertainty-scene" data-scene="uncertainty">'+
    '<div class="vlab-scene-caption">ЛИНЕЙКА · ИЗМЕРИТЕЛЬНЫЙ УКАЗАТЕЛЬ</div>'+
    '<div class="vlab-ruler-board"><div class="vlab-ruler-strip"><i>0</i><i>1</i><i>2</i><i>3</i><i>4</i><i>5 см</i></div><div class="vlab-ruler-object"></div><div class="vlab-ruler-marker vlab-drag" data-drag-object="marker" data-drag-axis="x" style="left:310px;top:125px"><span></span><b data-readout="ruler-value">3,0 см</b></div></div>'+
    '<div class="vlab-uncertainty-actions"><button type="button" class="btn primary" data-vlab-action="record-measurement">＋ Записать измерение</button><span data-readout="measure-count">0 / 5 измерений</span></div>'+
    '<div class="vlab-measure-list" data-readout="measure-list">Сними пять показаний, немного меняя положение указателя.</div>'+
    '<div class="vlab-scene-note">Перетаскивай указатель по шкале. Запиши пять измерений одного и того же размера.</div>'+
  '</div>';
}
function frictionScene() {
  return '<div class="vlab-scene vlab-friction-scene" data-scene="friction">'+
    '<div class="vlab-scene-caption">БРУСОК · ГОРИЗОНТАЛЬНАЯ ПОВЕРХНОСТЬ · ДИНАМОМЕТР</div>'+
    '<div class="vlab-friction-track"></div><div class="vlab-friction-block vlab-drag" data-drag-object="frictionBlock" data-drag-axis="x" style="left:170px;top:155px"><span></span><b>брусок</b></div>'+
    '<div class="vlab-friction-gauge"><small>ДИНАМОМЕТР</small><b data-readout="friction-force">0,00 Н</b><div class="vlab-gauge-scale"></div></div>'+
    '<div class="vlab-friction-controls"><label>Масса бруска с грузом: <b data-readout="friction-mass">200 г</b><input type="range" min="100" max="600" step="50" value="200" data-vlab-control="friction-mass"></label><label>Сила тяги: <b data-readout="pull-force">0,00 Н</b><input type="range" min="0" max="4" step="0.05" value="0" data-vlab-control="pull-force"></label></div>'+
    '<div class="vlab-scene-note">Меняй нагрузку и силу тяги. Перетащи брусок по поверхности, чтобы увидеть начало скольжения.</div>'+
  '</div>';
}

function sceneMarkup(id) {
  const scenes = {density:densityScene,motion:motionScene,spring:springScene,archimedes:archimedesScene,lever:leverScene,pendulum:pendulumScene,heat:heatScene,ohm:ohmScene,induction:inductionScene,lens:lensScene,uncertainty:uncertaintyScene,friction:frictionScene};
  return scenes[id] ? scenes[id]() : densityScene();
}
function fieldsMarkup(id) {
  const sets = {
    density:[["mass","Масса цилиндра","г"],["before","Начальный объём воды","мл"],["after","Объём после погружения","мл"]],
    motion:[["distance","Пройденный путь","м"],["time","Время движения","с"]],
    spring:[["mass","Масса груза","г"],["extension","Удлинение пружины","см"]],
    archimedes:[["air","Вес в воздухе","Н"],["water","Вес в воде","Н"]],
    lever:[["m1","Масса слева","г"],["l1","Плечо слева","см"],["m2","Масса справа","г"],["l2","Плечо справа","см"]],
    pendulum:[["length","Длина нити","м"],["time","Время измерения","с"],["count","Число колебаний","шт"]],
    heat:[["mw","Масса воды","г"],["mm","Масса металла","г"],["tw","Температура воды до опыта","°C"],["tm","Температура металла до опыта","°C"],["tf","Конечная температура смеси","°C"]],
    lens:[["a","Расстояние от предмета до линзы","см"],["b","Расстояние от линзы до экрана","см"]],
    uncertainty:[["x1","Измерение 1","см"],["x2","Измерение 2","см"],["x3","Измерение 3","см"],["x4","Измерение 4","см"],["x5","Измерение 5","см"]],
    friction:[["mass","Масса бруска с грузом","кг"],["force","Сила трения","Н"]]
  };
  if (id === "ohm" || id === "induction") return "";
  return (sets[id] || []).map(item => field(item[0],item[1],item[2])).join("");
}
function formulaFor(id) {
  const formulas = {
    density:"V = V₂ − V₁   ·   ρ = m / V",
    motion:"vср = s / t",
    spring:"Fупр = mg   ·   k = F / Δl",
    archimedes:"FА = Fвозд − Fв воде",
    lever:"M = Fl   ·   F₁l₁ = F₂l₂",
    pendulum:"T = t / N   ·   T = 2π√(l / g)",
    heat:"Qотданное = Qполученное",
    ohm:"I = U / R   ·   R = U / I",
    induction:"Индукционный ток возникает при изменении магнитного потока",
    lens:"1 / F = 1 / a + 1 / b",
    uncertainty:"xср = (x₁ + … + x₅) / 5",
    friction:"μ = Fтр / (mg)"
  };
  return formulas[id] || "";
}
function reportMarkup(id) {
  const fields = fieldsMarkup(id);
  const special = id === "ohm" ? '<p class="vlab-report-hint">Запиши три пары показаний с погрешностями: ΔI = ±0,02 А и ΔU = ±0,1 В. Для максимального балла отметь схему установки, единицы измерения и вывод.</p>' :
    id === "induction" ? '<p class="vlab-report-hint">Выполни три наблюдения: внесение магнита, удаление магнита, неподвижный магнит. Стрелка прибора покажет направление.</p>' :
    '<div class="vlab-fields-grid">'+fields+'</div>';
  return '<section class="vlab-report-panel"><div class="vlab-report-heading"><div><span class="eyebrow">ПРОТОКОЛ ОПЫТА</span><h3>Измерения и расчёт</h3><p>Сними показания с виртуальных приборов и перенеси их в поля.</p></div><div class="vlab-formula"><small>Формула</small><b>'+esc(formulaFor(id))+'</b></div></div>'+
    special+reportChecks()+
    '<button type="button" class="btn primary vlab-calculate" data-vlab-action="calculate">Проверить расчёт и отчёт</button>'+
    '<div class="vlab-result" data-vlab-result><span>После проверки появится результат эксперимента и оценка.</span></div></section>';
}
function instructionsMarkup(item) {
  const steps = {
    density:["Перетащи алюминиевый цилиндр на электронные весы и запиши массу.","Перемести мензурку, если нужно, затем погрузи цилиндр в воду.","Сними начальный и конечный объём по шкале мензурки.","Вычисли объём цилиндра и его плотность."],
    motion:["Установи тележку у отметки «Старт».","Перетащи её к финишной отметке.","Сними путь и время движения.","Вычисли среднюю скорость."],
    spring:["Перетащи груз из лотка на крючок пружины.","Дождись остановки груза и посмотри удлинение по линейке.","Запиши массу и удлинение.","Вычисли жёсткость пружины."],
    archimedes:["Сними показание динамометра в воздухе.","Перетащи тело в сосуд с водой, не касаясь дна.","Сними новое показание динамометра.","Найди выталкивающую силу как разность показаний."],
    lever:["Передвигай левый и правый грузы по рычагу.","Смотри на индикатор равновесия и значения плеч.","Запиши массы и плечи сил.","Сравни моменты сил слева и справа."],
    pendulum:["Измени длину нити, если нужно.","Отклони шарик и запусти маятник.","Измерь время десяти полных колебаний.","Найди период одного колебания."],
    heat:["Сними массу воды и металлического цилиндра.","Перенеси горячий цилиндр в калориметр.","Дождись установления общей температуры.","Используй тепловой баланс для расчёта."],
    ohm:["Замкни ключ электрической цепи.","Передвинь реостат так, чтобы получить ток 0,3 А.","Запиши показания амперметра и вольтметра.","Повтори для 0,4 А и 0,5 А, затем сравни U/I."],
    induction:["Поднеси магнит к катушке и наблюдай гальванометр.","Введи магнит внутрь катушки.","Вытащи магнит и сравни направление отклонения.","Останови магнит и проверь возвращение стрелки к нулю."],
    lens:["Передвигай линзу по оптической скамье.","Передвигай экран, пока изображение не станет чётким.","Сними расстояния a и b.","Вычисли фокусное расстояние."],
    uncertainty:["Передвинь указатель на шкале.","Запиши показание.","Повтори измерение пять раз, меняя положение указателя на доли деления.","Найди среднее значение и разброс."],
    friction:["Установи массу бруска с грузом.","Настрой силу тяги динамометра.","Перетащи брусок по поверхности.","Запиши силу трения при равномерном движении."]
  };
  return '<div class="vlab-procedure"><div><span class="eyebrow">ХОД ЭКСПЕРИМЕНТА</span><h3>Что нужно сделать</h3></div><ol>'+((steps[item.id]||[]).map((step,i)=>'<li><span>'+String(i+1)+'</span>'+esc(step)+'</li>').join(""))+'</ol><div class="vlab-safety"><b>Техника безопасности</b><p>'+esc(item.id==="ohm"?"Работай только с низким напряжением 4,5 В. Никогда не подключай схему к бытовой розетке.":item.id==="heat"?"В реальной лаборатории используй только тёплую воду и работай под наблюдением учителя.":item.id==="spring"||item.id==="lever"?"Не перегружай пружину и не располагай лицо под подвешенными грузами.": "Не роняй приборы и не допускай резких движений оборудования.")+'</p></div></div>';
}
function workspaceMarkup(item) {
  return '<div class="vlab-workspace-head"><div><span class="eyebrow">'+esc(item.kit)+' · '+esc(item.group)+'</span><h2>'+esc(item.title)+'</h2><p>'+esc(item.goal)+'</p></div><div class="vlab-workspace-actions"><span class="vlab-time">◷ '+esc(item.time)+'</span><button type="button" class="btn" data-vlab-action="reset">↻ Сбросить опыт</button></div></div>'+
    '<div class="vlab-scene-scroll">'+sceneMarkup(item.id)+'</div>'+
    '<div class="vlab-lower-grid">'+instructionsMarkup(item)+reportMarkup(item.id)+'</div>';
}

export function mountLabSimulator(container,id,options = {}) {
  const item = lab(id);
  if (container._vlabTimer) { clearInterval(container._vlabTimer); container._vlabTimer=null; }
  if (container._vlabAbort) container._vlabAbort.abort();
  const controller = new AbortController();
  container._vlabAbort = controller;
  const signal = controller.signal;
  const saved = options.saved || {};
  let state = {mass:0,massMeasured:false,submerged:false,readings:[],keyClosed:false,rheostat:9.3,magnetInside:false,needle:0,inductionObserved:0,measurements:[],pendulumStarted:0,pendulumElapsed:0,pendulumTimer:null,cartStarted:0,cartTime:0,cartMoved:false,hotMetalIn:false,frictionMoving:false,frictionPosition:170};
  container.innerHTML = workspaceMarkup(item);
  const q = selector => container.querySelector(selector);
  const scene = q(".vlab-scene");
  const read = key => q('[data-readout="'+key+'"]');
  const setRead = (key,value) => { const node=read(key); if(node)node.textContent=value; };
  const fmt = (value,digits=2) => Number(value).toFixed(digits).replace(".",",");
  const fieldValue = key => { const input=q('[data-vlab-field="'+key+'"]'); return input ? Number(String(input.value).replace(",",".")) : NaN; };
  const showResult = (message,good=false) => { const target=q("[data-vlab-result]"); if(target)target.innerHTML='<div class="vlab-result-state '+(good?"good":"bad")+'">'+message+'</div>'; };
  const save = async (result,values,readings={}) => {
    const checks = {};
    container.querySelectorAll("[data-vlab-check]").forEach(input => { checks[input.dataset.vlabCheck]=input.checked; });
    const checkCount=Object.values(checks).filter(Boolean).length;
    const report={labId:item.id,labTitle:item.title,score:result.score,maxScore:result.maxScore||3,result:result.value,detail:result.detail,values,readings,checks,checkCount,conclusion:q("[data-vlab-conclusion]")?.value.trim()||"",completed:true};
    try {
      if(options.onSave) await options.onSave(report);
      showResult('<b>Опыт проверен · '+result.score+'/'+(result.maxScore||3)+' балла</b><p>'+esc(result.value)+'</p><p>'+esc(result.detail)+'</p><small>Отчёт сохранён в личном прогрессе.</small>',true);
    } catch(error) {
      showResult('<b>Расчёт выполнен, но сохранение не удалось.</b><p>'+esc(error?.message||error)+'</p>',false);
    }
  };
  const updateDensity = () => {
    const water=q("[data-water]");
    if(water)water.style.height=state.submerged?"92px":"62px";
    setRead("mass",state.massMeasured?"54,0 г":"— — —");
    setRead("mass-pill",state.massMeasured?"54,0 г":"не измерена");
    setRead("volume",state.submerged?"60 мл":"40 мл");
    setRead("volume-pill",state.submerged?"60 мл":"40 мл");
    const sample=q('[data-drag-object="sample"]');
    if(sample){sample.classList.toggle("in-water",state.submerged);sample.classList.toggle("on-scale",state.massMeasured&&!state.submerged);}
  };
  const updateSpring = () => {
    const extension=state.mass/1000*9.8/20*1000;
    const coil=q("[data-spring-coil]"),hook=q('[data-dropzone="hook"]');
    if(coil)coil.style.height=(70+extension)+"px";
    if(hook)hook.style.top=(155+extension)+"px";
    setRead("mass",state.mass?state.mass+" г":"—");
    setRead("extension",state.mass?fmt(extension/10,2)+" см":"—");
    setRead("force",state.mass?fmt(state.mass/1000*9.8,2)+" Н":"—");
    const weight=q('[data-drag-object="weight"][data-mass="'+state.mass+'"]');
    if(weight&&state.mass){weight.style.left=(hook.offsetLeft+18)+"px";weight.style.top=(hook.offsetTop+25)+"px";}
  };
  const updateArch = () => {
    setRead("dyna-value",state.submerged?"3,41 Н":"3,90 Н");
    setRead("water-force",state.submerged?"3,41 Н":"ожидает погружения");
    const body=q('[data-drag-object="body"]');
    if(body)body.classList.toggle("in-water",state.submerged);
  };
  const updateLever = () => {
    const left=q('[data-drag-object="leftWeight"]'),right=q('[data-drag-object="rightWeight"]');
    if(!left||!right)return;
    const pivot=380,cm=5;
    const l1=Math.max(1,(pivot-(left.offsetLeft+left.offsetWidth/2))/cm);
    const l2=Math.max(1,((right.offsetLeft+right.offsetWidth/2)-pivot)/cm);
    const m1=200,m2=200,t1=m1*l1,t2=m2*l2,diff=Math.abs(t1-t2)/Math.max(t1,t2)*100;
    setRead("left-arm",fmt(l1,0)+" см");setRead("right-arm",fmt(l2,0)+" см");
    setRead("moments",diff<5?"практически равны":fmt(t1,0)+" : "+fmt(t2,0));
    setRead("balance",diff<5?"● Рычаг уравновешен":"↗ Есть перевес");
    const beam=q("[data-lever-beam]");
    if(beam)beam.style.transform="rotate("+Math.max(-5,Math.min(5,(t1-t2)*0.0015))+"deg)";
    state.lever={m1,l1,m2,l2,diff,t1,t2};
  };
  const updateLens = () => {
    const object=q('[data-drag-object="object"]'),lens=q('[data-drag-object="lens"]'),screen=q('[data-drag-object="screen"]');
    if(!object||!lens||!screen)return;
    const a=Math.abs((lens.offsetLeft+20)-(object.offsetLeft+18))/5;
    const b=Math.max(0,(screen.offsetLeft-lens.offsetLeft)/5);
    const expected=a>15?15*a/(a-15):Infinity;
    const sharp=Number.isFinite(expected)&&Math.abs(expected-b)<1.6;
    setRead("object-distance",fmt(a,1)+" см");setRead("image-distance",fmt(b,1)+" см");
    setRead("focus-state",sharp?"резкое изображение":"нужно настроить");
    const image=q("[data-screen-image]");
    if(image){image.style.filter=sharp?"blur(0)":"blur(4px)";image.style.opacity=sharp?"1":".45";}
    state.lens={a,b,expected,sharp};
  };
  const updateOhm = () => {
    const current=state.keyClosed?4.5/(5.7+state.rheostat):0,voltage=current*5.7;
    setRead("rheostat",fmt(state.rheostat,1)+" Ом");setRead("current",fmt(current,2)+" А");setRead("voltage",fmt(voltage,2)+" В");
    const button=q('[data-vlab-action="toggle-switch"]');
    if(button){button.textContent=state.keyClosed?"Замкнут":"Разомкнут";button.classList.toggle("closed",state.keyClosed);button.setAttribute("aria-pressed",String(state.keyClosed));}
    setRead("ohm-count",state.readings.length+" / 3 измерения");
    const table=q('[data-readout="ohm-table"]');
    if(table)table.innerHTML=state.readings.length?'<table><thead><tr><th>№</th><th>I, А</th><th>U, В</th><th>R = U/I, Ом</th></tr></thead><tbody>'+state.readings.map((r,i)=>'<tr><td>'+(i+1)+'</td><td>'+fmt(r.i,2)+' ± 0,02</td><td>'+fmt(r.u,1)+' ± 0,1</td><td>'+fmt(r.u/r.i,2)+'</td></tr>').join("")+'</tbody></table>':"Пока нет измерений";
  };
  const updateInduction = () => {
    const needle=q("[data-readout='needle']");
    if(needle)needle.style.transform="rotate("+state.needle+"deg)";
    setRead("induction-state",state.needle>0?"Ток одного направления":state.needle<0?"Ток противоположного направления":"Нет изменения магнитного потока");
  };
  const updateMotion = () => {
    setRead("time",state.cartTime?fmt(state.cartTime,2)+" с":"0,00 с");
    setRead("motion-state",state.cartTime?"Измерение завершено":"Перетащи тележку к финишу");
  };
  const updatePendulum = () => {
    const slider=q('[data-vlab-control="pendulum-length"]');
    const length=slider?Number(slider.value):50;
    const period=2*Math.PI*Math.sqrt((length/100)/9.81);
    setRead("pendulum-length",length+" см");
    if(!state.pendulumStarted)setRead("pendulum-time",state.pendulumElapsed?fmt(state.pendulumElapsed,2)+" с":"0,00 с");
    const string=q("[data-pendulum-string]"),bob=q('[data-drag-object="bob"]');
    if(string)string.style.height=(length*1.25)+"px";
    if(bob&&!state.pendulumStarted)bob.style.top=(75+length*1.25)+"px";
    state.pendulumPeriod=period;
  };
  const updateHeat = () => {
    setRead("thermometer",state.hotMetalIn?"32,6 °C":"20,0 °C");
    setRead("final-temp",state.hotMetalIn?"32,6 °C":"ожидает опыта");
  };
  const updateUncertainty = () => {
    const marker=q('[data-drag-object="marker"]');
    const value=marker?Math.max(0,Math.min(5,(marker.offsetLeft-80)/100)):0;
    setRead("ruler-value",fmt(value,1)+" см");
    setRead("measure-count",state.measurements.length+" / 5 измерений");
    const list=q('[data-readout="measure-list"]');
    if(list)list.innerHTML=state.measurements.length?state.measurements.map((v,i)=>'<span>'+(i+1)+'. '+fmt(v,1)+' см</span>').join(""):"Сними пять показаний, немного меняя положение указателя.";
  };
  const updateFriction = () => {
    const massInput=q('[data-vlab-control="friction-mass"]'),pullInput=q('[data-vlab-control="pull-force"]');
    const mass=massInput?Number(massInput.value):200,pull=pullInput?Number(pullInput.value):0;
    const force=.25*(mass/1000)*9.81;
    setRead("friction-mass",mass+" г");setRead("pull-force",fmt(pull,2)+" Н");setRead("friction-force",fmt(force,2)+" Н");
    state.friction={mass:mass/1000,pull,force,sliding:pull>=force};
    const block=q('[data-drag-object="frictionBlock"]');
    if(block)block.classList.toggle("sliding",pull>=force);
  };
  const update = () => {
    if(item.id==="density")updateDensity();
    if(item.id==="spring")updateSpring();
    if(item.id==="archimedes")updateArch();
    if(item.id==="lever")updateLever();
    if(item.id==="lens")updateLens();
    if(item.id==="ohm")updateOhm();
    if(item.id==="induction")updateInduction();
    if(item.id==="motion")updateMotion();
    if(item.id==="pendulum")updatePendulum();
    if(item.id==="heat")updateHeat();
    if(item.id==="uncertainty")updateUncertainty();
    if(item.id==="friction")updateFriction();
  };
  const inside = (x,y,zone) => !!zone && x>=zone.offsetLeft && x<=zone.offsetLeft+zone.offsetWidth && y>=zone.offsetTop && y<=zone.offsetTop+zone.offsetHeight;
  let drag=null;
  if(scene){
    scene.addEventListener("pointerdown",event=>{
      const object=event.target.closest("[data-drag-object]");
      if(!object)return;
      if(item.id==="density"&&object.dataset.dragObject==="sample"&&!state.massMeasured){/* weighing is optional until dropped on the scale */}
      event.preventDefault();
      const rect=scene.getBoundingClientRect();
      drag={object,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,left:object.offsetLeft,top:object.offsetTop,sceneRect:rect};
      object.classList.add("dragging");
      try{object.setPointerCapture(event.pointerId)}catch(error){}
      if(item.id==="motion"&&object.dataset.dragObject==="cart"&&!state.cartMoved){state.cartStarted=Date.now();state.cartTime=0;}
    },{signal});
    scene.addEventListener("pointermove",event=>{
      if(!drag||event.pointerId!==drag.pointerId)return;
      const dx=event.clientX-drag.startX,dy=event.clientY-drag.startY,obj=drag.object;
      let left=drag.left+dx,top=drag.top+dy;
      if(obj.dataset.dragAxis==="x")top=drag.top;
      if(obj.dataset.dragAxis==="y")left=drag.left;
      left=Math.max(4,Math.min(scene.clientWidth-obj.offsetWidth-4,left));
      top=Math.max(4,Math.min(scene.clientHeight-obj.offsetHeight-4,top));
      obj.style.left=left+"px";obj.style.top=top+"px";
      if(item.id==="induction"&&obj.dataset.dragObject==="magnet"){
        const coil=q('[data-dropzone="coil"]');
        const center=left+obj.offsetWidth/2;
        const inCoil=coil&&center>coil.offsetLeft&&center<coil.offsetLeft+coil.offsetWidth;
        if(inCoil){state.needle=dx>=0?28:-28;if(!state.magnetInside)state.inductionObserved=(state.inductionObserved||0)+1;state.magnetInside=true;}else{if(state.magnetInside)state.inductionObserved=(state.inductionObserved||0)+1;state.needle=0;state.magnetInside=false;}
        updateInduction();
      }
      if(item.id==="friction"&&obj.dataset.dragObject==="frictionBlock"){state.frictionPosition=left;updateFriction();}
      if(item.id==="uncertainty"&&obj.dataset.dragObject==="marker")updateUncertainty();
    },{signal});
    scene.addEventListener("pointerup",event=>{
      if(!drag||event.pointerId!==drag.pointerId)return;
      const obj=drag.object,centerX=obj.offsetLeft+obj.offsetWidth/2,centerY=obj.offsetTop+obj.offsetHeight/2;
      obj.classList.remove("dragging");
      if(item.id==="density"&&obj.dataset.dragObject==="sample"){
        const scale=q('[data-dropzone="scale"]'),cylinder=q('[data-dropzone="cylinder"]');
        if(inside(centerX,centerY,scale)){
          state.massMeasured=true;state.submerged=false;
          obj.style.left=(scale.offsetLeft+58)+"px";obj.style.top=(scale.offsetTop-28)+"px";
        }else if(inside(centerX,centerY,cylinder)){
          state.submerged=true;
          obj.style.left=(cylinder.offsetLeft+47)+"px";obj.style.top=(cylinder.offsetTop+128)+"px";
        }else state.submerged=false;
        updateDensity();
      }
      if(item.id==="density"&&obj.dataset.dragObject==="menzurka"&&state.submerged){
        const sample=q('[data-drag-object="sample"]');
        if(sample){sample.style.left=(obj.offsetLeft+47)+"px";sample.style.top=(obj.offsetTop+128)+"px";}
      }
      if(item.id==="archimedes"&&obj.dataset.dragObject==="body"){
        const beaker=q('[data-drag-object="beaker"]');
        state.submerged=inside(centerX,centerY,beaker);
        if(state.submerged){obj.style.left=(beaker.offsetLeft+55)+"px";obj.style.top=(beaker.offsetTop+90)+"px";}
        updateArch();
      }
      if(item.id==="archimedes"&&obj.dataset.dragObject==="beaker"&&state.submerged){
        const body=q('[data-drag-object="body"]');
        if(body){body.style.left=(obj.offsetLeft+55)+"px";body.style.top=(obj.offsetTop+90)+"px";}
      }
      if(item.id==="spring"&&obj.dataset.dragObject==="weight"){
        const hook=q('[data-dropzone="hook"]'),tray=q('[data-dropzone="tray"]');
        if(inside(centerX,centerY,hook)){
          state.mass=Number(obj.dataset.mass||100);
          scene.querySelectorAll('[data-drag-object="weight"]').forEach(weight=>{
            if(weight!==obj){const home={50:525,100:595,150:665};weight.style.left=(home[Number(weight.dataset.mass)]||525)+"px";weight.style.top="286px";}
          });
          obj.style.left=(hook.offsetLeft+18)+"px";obj.style.top=(hook.offsetTop+25)+"px";
        }else if(inside(centerX,centerY,tray)){
          state.mass=0;
          const home={50:525,100:595,150:665};obj.style.left=(home[Number(obj.dataset.mass)]||525)+"px";obj.style.top="286px";
        }
        updateSpring();
      }
      if(item.id==="motion"&&obj.dataset.dragObject==="cart"){
        const finish=q(".vlab-track-mark.finish");
        if(finish&&obj.offsetLeft>finish.offsetLeft-45){
          state.cartMoved=true;
          state.cartTime=Math.max(.2,(Date.now()-(state.cartStarted||Date.now()))/1000);
          obj.style.left=(finish.offsetLeft-5)+"px";
        }
        updateMotion();
      }
      if(item.id==="heat"&&obj.dataset.dragObject==="hotMetal"){
        const calorimeter=q('[data-drag-object="calorimeter"]');
        state.hotMetalIn=inside(centerX,centerY,calorimeter);
        if(state.hotMetalIn){obj.style.left=(calorimeter.offsetLeft+42)+"px";obj.style.top=(calorimeter.offsetTop+62)+"px";}
        updateHeat();
      }
      if(item.id==="heat"&&obj.dataset.dragObject==="calorimeter"&&state.hotMetalIn){
        const metal=q('[data-drag-object="hotMetal"]');
        if(metal){metal.style.left=(obj.offsetLeft+42)+"px";metal.style.top=(obj.offsetTop+62)+"px";}
      }
      if(item.id==="lever")updateLever();
      if(item.id==="lens")updateLens();
      if(item.id==="uncertainty")updateUncertainty();
      if(item.id==="friction")updateFriction();
      drag=null;
    },{signal});
    scene.addEventListener("pointercancel",()=>{if(drag){drag.object.classList.remove("dragging");drag=null;}},{signal});
  }
  container.addEventListener("input",event=>{
    const control=event.target.closest("[data-vlab-control]");
    if(!control)return;
    if(control.dataset.vlabControl==="rheostat")state.rheostat=Number(control.value);
    update();
  },{signal});
  container.addEventListener("click",async event=>{
    const button=event.target.closest("[data-vlab-action]");
    if(!button)return;
    const action=button.dataset.vlabAction;
    if(action==="reset"){mountLabSimulator(container,item.id,options);return;}
    if(action==="toggle-switch"){state.keyClosed=!state.keyClosed;updateOhm();return;}
    if(action==="record-ohm"){
      if(!state.keyClosed){showResult("Сначала замкни ключ цепи.",false);return;}
      if(state.readings.length>=3){showResult("Уже записаны три измерения. Проверь таблицу.",false);return;}
      const i=4.5/(5.7+state.rheostat),u=i*5.7;
      state.readings.push({i,u,r:state.rheostat});
      updateOhm();
      return;
    }
    if(action==="record-measurement"){
      if(state.measurements.length>=5){showResult("Уже записаны пять измерений. Проверь серию.",false);return;}
      const marker=q('[data-drag-object="marker"]');
      const value=marker?Math.max(0,Math.min(5,(marker.offsetLeft-80)/100)):0;
      state.measurements.push(value);updateUncertainty();return;
    }
    if(action==="pendulum-start"){
      if(state.pendulumStarted)return;
      state.pendulumStarted=Date.now();
      const bob=q('[data-drag-object="bob"]');if(bob)bob.classList.add("swinging");
      const string=q("[data-pendulum-string]");if(string)string.classList.add("swinging");
      state.pendulumTimer=setInterval(()=>{setRead("pendulum-time",fmt((Date.now()-state.pendulumStarted)/1000,2)+" с");},100);container._vlabTimer=state.pendulumTimer;
      return;
    }
    if(action==="pendulum-stop"){
      if(!state.pendulumStarted)return;
      state.pendulumElapsed=(Date.now()-state.pendulumStarted)/1000;
      clearInterval(state.pendulumTimer);container._vlabTimer=null;state.pendulumTimer=null;state.pendulumStarted=0;
      const bob=q('[data-drag-object="bob"]');if(bob)bob.classList.remove("swinging");
      const string=q("[data-pendulum-string]");if(string)string.classList.remove("swinging");
      updatePendulum();return;
    }
    if(action==="calculate")calculate();
  },{signal});
  const calculate = async () => {
    let result={valid:false,score:0,maxScore:3,value:"",detail:""};
    const values={};
    if(item.id==="density"){
      values.mass=fieldValue("mass");values.before=fieldValue("before");values.after=fieldValue("after");
      if(!state.massMeasured||!state.submerged){showResult("Сначала взвесь цилиндр и погрузи его в мензурку.",false);return;}
      const volume=values.after-values.before,rho=values.mass/volume;
      if(!(values.mass>0&&volume>0)){showResult("Проверь массу и разность объёмов.",false);return;}
      const ok=Math.abs(rho-2.7)<.18;
      result={valid:true,score:ok?3:1,value:fmt(rho,2)+" г/см³",detail:"V = "+fmt(values.after,0)+" − "+fmt(values.before,0)+" = "+fmt(volume,0)+" см³. ρ = "+fmt(values.mass,1)+" / "+fmt(volume,0)+" = "+fmt(rho,2)+" г/см³. Для алюминия табличная плотность около 2,7 г/см³."};
    } else if(item.id==="spring"){
      values.mass=fieldValue("mass");values.extension=fieldValue("extension");
      if(!state.mass||!(values.mass>0&&values.extension>0)){showResult("Подвесь груз и внеси массу с удлинением по шкале.",false);return;}
      const k=(values.mass/1000*9.81)/(values.extension/100),ok=Math.abs(k-20)<2;
      result={valid:true,score:ok?3:1,value:fmt(k,1)+" Н/м",detail:"F = mg = "+fmt(values.mass/1000*9.81,2)+" Н. k = F/Δl = "+fmt(k,1)+" Н/м. Сравни значение с жёсткостью пружины в установке."};
    } else if(item.id==="archimedes"){
      values.air=fieldValue("air");values.water=fieldValue("water");
      if(!state.submerged||!(values.air>values.water&&values.water>=0)){showResult("Погрузи тело в воду и запиши два показания динамометра.",false);return;}
      const fa=values.air-values.water,ok=Math.abs(fa-.49)<.08;
      result={valid:true,score:ok?3:1,value:fmt(fa,2)+" Н",detail:"FА = Fвозд − Fв воде = "+fmt(values.air,2)+" − "+fmt(values.water,2)+" = "+fmt(fa,2)+" Н. Выталкивающая сила направлена вверх."};
    } else if(item.id==="lever"){
      values.m1=fieldValue("m1");values.l1=fieldValue("l1");values.m2=fieldValue("m2");values.l2=fieldValue("l2");
      if(Object.values(values).some(v=>!(v>0))){showResult("Заполни массы и плечи по показаниям установки.",false);return;}
      const t1=values.m1*values.l1,t2=values.m2*values.l2,diff=Math.abs(t1-t2)/Math.max(t1,t2)*100,ok=diff<5;
      result={valid:true,score:ok?3:1,value:ok?"Равновесие подтверждено":"Моменты различаются на "+fmt(diff,1)+"%",detail:"M₁ = F₁l₁, M₂ = F₂l₂. В пропорциональных единицах: "+fmt(t1,1)+" и "+fmt(t2,1)+" г·см. При равновесии моменты сил равны."};
    } else if(item.id==="lens"){
      values.a=fieldValue("a");values.b=fieldValue("b");
      if(!(values.a>15&&values.b>0)){showResult("Настрой резкое изображение и введи расстояния a и b.",false);return;}
      const f=values.a*values.b/(values.a+values.b),ok=Math.abs(f-15)<1.8&&state.lens?.sharp;
      result={valid:true,score:ok?3:1,value:fmt(f,1)+" см",detail:"1/F = 1/a + 1/b, поэтому F = ab/(a+b) = "+fmt(f,1)+" см. Резкое изображение получается, когда экран находится в плоскости изображения."};
    } else if(item.id==="ohm"){
      if(state.readings.length!==3){showResult("Нужно записать ровно три пары показаний при токах 0,3 А, 0,4 А и 0,5 А.",false);return;}
      const targetsI=[.3,.4,.5],targetsU=[1.7,2.3,2.9],matches=state.readings.filter((r,i)=>Math.abs(r.i-targetsI[i])<.025&&Math.abs(r.u-targetsU[i])<=.3&&Math.abs(r.u/r.i-5.7)<.6).length;
      const scheme=q('[data-vlab-check="scheme"]')?.checked,units=q('[data-vlab-check="units"]')?.checked,conclusionText=String(q("[data-vlab-conclusion]")?.value||"").toLowerCase(),conclusionOk=/ток/.test(conclusionText)&&(/напряж/.test(conclusionText)||/увелич/.test(conclusionText)||/пропорц/.test(conclusionText)),allReport=scheme&&units&&conclusionOk;
      result={valid:true,score:matches===3?(allReport?3:2):matches>=1?1:0,value:matches+"/3 измерений соответствуют закону Ома",detail:"Для R2 = 5,7 Ом отношение U/I остаётся примерно постоянным. Ориентиры демопроекта: 0,30 А — 1,7 В; 0,40 А — 2,3 В; 0,50 А — 2,9 В. Полные 3 балла требуют схемы, таблицы с погрешностями и правильного вывода."};
      values.readings=state.readings;
    } else if(item.id==="motion"){
      values.distance=fieldValue("distance");values.time=fieldValue("time");
      if(!state.cartMoved||!(values.distance>0&&values.time>0)){showResult("Проведи тележку до финиша и внеси путь и время.",false);return;}
      const v=values.distance/values.time,ok=Math.abs(values.time-state.cartTime)<1.5;
      result={valid:true,score:ok?3:2,value:fmt(v,2)+" м/с",detail:"vср = s/t = "+fmt(values.distance,2)+" / "+fmt(values.time,2)+" = "+fmt(v,2)+" м/с. Секундомер фиксирует время перемещения тележки."};
    } else if(item.id==="pendulum"){
      values.length=fieldValue("length");values.time=fieldValue("time");values.count=fieldValue("count");
      if(!(values.length>0&&values.time>0&&values.count>0)||!state.pendulumElapsed){showResult("Запусти маятник, останови секундомер и внеси длину, время и число колебаний.",false);return;}
      const period=values.time/values.count,theory=2*Math.PI*Math.sqrt(values.length/9.81),ok=Math.abs(period-theory)<.15;
      result={valid:true,score:ok?3:1,value:fmt(period,3)+" с",detail:"T = t/N = "+fmt(period,3)+" с. Теоретическое значение для этой длины около "+fmt(theory,3)+" с."};
    } else if(item.id==="heat"){
      values.mw=fieldValue("mw");values.mm=fieldValue("mm");values.tw=fieldValue("tw");values.tm=fieldValue("tm");values.tf=fieldValue("tf");
      if(!state.hotMetalIn||!(values.mw>0&&values.mm>0&&values.tf>values.tw&&values.tm>values.tf)){showResult("Перенеси металл в калориметр и проверь массы и температуры.",false);return;}
      const den=(values.mm/1000)*(values.tm-values.tf),num=4200*(values.mw/1000)*(values.tf-values.tw),c=num/den,ok=Math.abs(c-920)<180;
      result={valid:true,score:ok?3:1,value:Math.round(c)+" Дж/(кг·°C)",detail:"Qводы = cmΔt = "+Math.round(num)+" Дж. По тепловому балансу Qметалла = Qводы; cметалла ≈ "+Math.round(c)+" Дж/(кг·°C)."};
    } else if(item.id==="induction"){
      if(!state.inductionObserved){showResult("Проведи магнитом через катушку, чтобы увидеть отклонение гальванометра.",false);return;}
      result={valid:true,score:state.inductionObserved>=2?3:2,value:"Электромагнитная индукция наблюдается",detail:"При внесении и удалении магнита магнитный поток меняется, поэтому возникает индукционный ток. При неподвижном магните поток не меняется — ток исчезает."};
      values.observations=state.inductionObserved;
    } else if(item.id==="uncertainty"){
      if(state.measurements.length!==5){showResult("Запиши пять измерений указателя.",false);return;}
      const avg=state.measurements.reduce((a,b)=>a+b,0)/5,spread=Math.max(...state.measurements.map(x=>Math.abs(x-avg)));
      values.measurements=state.measurements;
      result={valid:true,score:3,value:fmt(avg,2)+" ± "+fmt(spread,2)+" см",detail:"Среднее значение xср = "+fmt(avg,2)+" см. Максимальное отклонение от среднего Δx = "+fmt(spread,2)+" см."};
    } else if(item.id==="friction"){
      values.mass=fieldValue("mass");values.force=fieldValue("force");
      if(!(values.mass>0&&values.force>0)||!state.friction?.sliding){showResult("Установи нагрузку, увеличь силу тяги до начала скольжения и внеси показания.",false);return;}
      const mu=values.force/(values.mass*9.81),ok=Math.abs(mu-.25)<.06;
      result={valid:true,score:ok?3:1,value:"μ = "+fmt(mu,3),detail:"При равномерном движении сила тяги равна силе трения. μ = Fтр/(mg) = "+fmt(mu,3)+"."};
    }
    if(!result.valid)return;
    await save(result,values,{scene:item.scene,progress:saved});
  };
  update();
  if(item.id==="pendulum"){
    const bob=q('[data-drag-object="bob"]');
    if(bob)bob.addEventListener("pointerup",()=>{bob.classList.add("released");},{signal});
  }
  if(item.id==="uncertainty"){
    const marker=q('[data-drag-object="marker"]');
    if(marker)marker.addEventListener("pointerup",updateUncertainty,{signal});
  }
  if(item.id==="friction"){
    const block=q('[data-drag-object="frictionBlock"]');
    if(block)block.addEventListener("pointerup",()=>{state.frictionMoving=true;updateFriction();},{signal});
  }
}
