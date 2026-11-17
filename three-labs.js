const THREE_URL="https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const labNames={
 density:"Плотность цилиндра",motion:"Средняя скорость",spring:"Жёсткость пружины",archimedes:"Сила Архимеда",
 lever:"Равновесие рычага",pendulum:"Период маятника",heat:"Тепловой баланс",ohm:"Закон Ома",
 induction:"Электромагнитная индукция",lens:"Фокусное расстояние линзы",uncertainty:"Точность измерений",friction:"Коэффициент трения"
};

export async function mountThreeLab(host,id,options={}){
 if(host._threeLab&&host._threeLab.dispose)host._threeLab.dispose();
 host.innerHTML='<div class="vlab-three-shell"><div class="vlab-three-toolbar"><div><span class="eyebrow">ИНТЕРАКТИВНЫЙ 3D-СТЕНД</span><b>'+labNames[id]+'</b></div><div class="vlab-three-toolbar-actions"><button type="button" data-three-action="camera">↗ Камера</button><button type="button" data-three-action="reset">↻ Сброс</button></div></div><div class="vlab-three-stage"><div class="vlab-three-canvas"></div><div class="vlab-three-hint">Перетаскивай предметы · вращай сцену · колесо мыши — приближение</div><div class="vlab-three-readouts" data-three-readouts></div><div class="vlab-three-loading" data-three-loading>Загружаем 3D-лабораторию…</div></div><div class="vlab-three-controls" data-three-controls></div><div class="vlab-three-footer"><span>🖱️ Зажми фон и двигай мышь, чтобы повернуть камеру</span><span>На телефоне: один палец — вращение, два — масштаб</span></div></div>';
 const stage=host.querySelector(".vlab-three-stage");
 const canvasHost=host.querySelector(".vlab-three-canvas");
 const loading=host.querySelector("[data-three-loading]");
 const readouts=host.querySelector("[data-three-readouts]");
 const controls=host.querySelector("[data-three-controls]");
 let THREE;
 try{
  THREE=await import(THREE_URL);
 }catch(error){
  loading.innerHTML='<b>Не удалось загрузить 3D-движок.</b><span>Проверь подключение к интернету и нажми «Повторить».</span><button type="button" data-three-action="retry">Повторить</button>';
  const retry=loading.querySelector("[data-three-action=retry]");retry?.addEventListener("click",()=>mountThreeLab(host,id,options),{once:true});
  host._threeLab={dispose:()=>{host.innerHTML=""}};
  return host._threeLab;
 }
 if(!host.isConnected){host.innerHTML="";return {dispose:()=>{}};}
 const scene=new THREE.Scene();
 scene.background=new THREE.Color("#eaf0f7");
 scene.fog=new THREE.Fog("#eaf0f7",14,30);
 const camera=new THREE.PerspectiveCamera(42,1,.1,80);
 const target=new THREE.Vector3(0,1,0);
 let radius=10,theta=Math.PI*.25,phi=1.02;
 const updateCamera=()=>{
  phi=Math.max(.25,Math.min(1.48,phi));
  radius=Math.max(5,Math.min(17,radius));
  const spherical=new THREE.Spherical(radius,phi,theta);
  camera.position.copy(target).add(new THREE.Vector3().setFromSpherical(spherical));
  camera.lookAt(target);
 };
 updateCamera();
 let renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:"high-performance"});}
 catch(error){
  loading.innerHTML='<b>На этом устройстве не удалось запустить WebGL.</b><span>Открой лабораторную в браузере с аппаратным ускорением или используй режим 2D.</span>';
  host._threeLab={dispose:()=>{host.innerHTML=""}};return host._threeLab;
 }
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.05;
 canvasHost.appendChild(renderer.domElement);
 const ambient=new THREE.HemisphereLight("#ffffff","#9eabbc",2.0);scene.add(ambient);
 const keyLight=new THREE.DirectionalLight("#ffffff",3.0);keyLight.position.set(-4,9,6);keyLight.castShadow=true;keyLight.shadow.mapSize.set(1024,1024);scene.add(keyLight);
 const fillLight=new THREE.DirectionalLight("#c9e0ff",1.2);fillLight.position.set(5,5,-6);scene.add(fillLight);
 const mat=(color,roughness=.56,metalness=0,extra={})=>new THREE.MeshStandardMaterial({color,roughness,metalness,...extra});
 const materials={
  dark:mat("#344256",.42),steel:mat("#aebbc9",.28,.78),steelDark:mat("#687b90",.32,.7),
  blue:mat("#3478c9",.35,.25),blueSoft:mat("#8dc4ed",.25,.12),red:mat("#df5d5b",.38,.12),
  yellow:mat("#f1bf55",.45,.08),wood:mat("#b78b60",.72),rubber:mat("#303a49",.88),
  glass:new THREE.MeshPhysicalMaterial({color:"#a8d9ec",roughness:.12,metalness:0,transparent:true,opacity:.2,side:THREE.DoubleSide}),
  water:new THREE.MeshPhysicalMaterial({color:"#45a9e6",roughness:.15,transparent:true,opacity:.65,transmission:.1}),
  white:mat("#f7f9fc",.38),green:mat("#53a889",.4),black:mat("#172333",.32)
 };
 const add=(geometry,material,x=0,y=0,z=0,parent=scene)=>{
  const object=new THREE.Mesh(geometry,material);object.position.set(x,y,z);object.castShadow=true;object.receiveShadow=true;parent.add(object);return object;
 };
 const box=(w,h,d,material,x=0,y=0,z=0,parent=scene)=>add(new THREE.BoxGeometry(w,h,d),material,x,y,z,parent);
 const cylinder=(rt,rb,h,material,x=0,y=0,z=0,segments=32,parent=scene)=>add(new THREE.CylinderGeometry(rt,rb,h,segments),material,x,y,z,parent);
 const sphere=(r,material,x=0,y=0,z=0,parent=scene)=>add(new THREE.SphereGeometry(r,24,18),material,x,y,z,parent);
 const rod=(a,b,r,material,parent=scene)=>{
  const start=new THREE.Vector3(a[0],a[1],a[2]),end=new THREE.Vector3(b[0],b[1],b[2]),delta=end.clone().sub(start);
  const object=cylinder(r,r,delta.length(),material,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,12,parent);
  object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return object;
 };
 function orientRod(mesh,a,b){
  const start=new THREE.Vector3(a[0],a[1],a[2]),end=new THREE.Vector3(b[0],b[1],b[2]),delta=end.clone().sub(start);
  mesh.position.copy(start.add(end).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());mesh.scale.y=delta.length();
 }
 const torus=(radius,tube,material,x,y,z,rotation=null)=>{
  const object=add(new THREE.TorusGeometry(radius,tube,12,64),material,x,y,z);
  if(rotation)object.rotation.set(rotation[0],rotation[1],rotation[2]);return object;
 };
 const label=(text,x,y,z,size=1.1)=>{
  const canvas=document.createElement("canvas");canvas.width=512;canvas.height=128;
  const ctx=canvas.getContext("2d");ctx.fillStyle="rgba(255,255,255,.92)";ctx.strokeStyle="rgba(72,91,117,.25)";ctx.lineWidth=4;
  const rr=18;ctx.beginPath();ctx.roundRect(5,5,502,118,rr);ctx.fill();ctx.stroke();
  ctx.fillStyle="#26384d";ctx.font="bold 38px Arial";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(String(text),256,65,470);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));
  sprite.position.set(x,y,z);sprite.scale.set(size*2.3,size*.58,1);scene.add(sprite);return sprite;
 };
 const setLabel=(sprite,text)=>{
  if(!sprite)return;
  const canvas=sprite.material.map.image,ctx=canvas.getContext("2d");ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="rgba(255,255,255,.94)";ctx.strokeStyle="rgba(72,91,117,.25)";ctx.lineWidth=4;ctx.beginPath();ctx.roundRect(5,5,502,118,18);ctx.fill();ctx.stroke();
  ctx.fillStyle="#26384d";ctx.font="bold 38px Arial";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(String(text),256,65,470);sprite.material.map.needsUpdate=true;
 };
 const floor=box(11,.18,7,mat("#d9e1eb",.86),0,-.12,0);
 const table=box(9,.22,5.3,mat("#e6ebf2",.72),0,.08,0);
 for(const x of [-3.8,3.8])for(const z of [-2,2])box(.16,1.45,.16,materials.steelDark,x,-.68,z);
 const grid=new THREE.GridHelper(10,20,"#a8b6c8","#d0d9e4");grid.position.y=.205;scene.add(grid);
 const draggables=[];
 const addDrag=(object,role,axis="xyz")=>{object.userData.draggable=true;object.userData.role=role;object.userData.axis=axis;draggables.push(object);return object;};
 const display={};
 const addDisplay=(key,text,x,y,z)=>{display[key]=label(text,x,y,z,.85);return display[key];};
 const addPillar=(x,z,height=2.2)=>{cylinder(.08,.1,height,materials.steelDark,x,.2+height/2,z);};
 const addDigitalScale=(x,z)=>{
  box(1.5,.18,1.05,materials.dark,x,.34,z);box(1.3,.08,.92,materials.steel,x,.46,z);
  box(.58,.12,.24,materials.black,x,.57,z-.22);addDisplay("scale","0,0 г",x,.78,z-.22);
  box(.08,.08,.08,materials.red,x-.48,.58,z-.22);label("ЭЛЕКТРОННЫЕ ВЕСЫ",x,.17,z+1.0,.75);
 };
 const addBeaker=(x,z,waterLevel=.85)=>{
  cylinder(.55,.55,1.25,materials.glass,x,.95,z,48);
  torus(.55,.035,materials.steel,x,1.58,z);
  const water=cylinder(.49,.49,waterLevel,materials.water,x,.34+waterLevel/2,z,40);
  display.water=addDisplay("water","40 мл",x,.8,z+.62);
  return {water};
 };
 const addWeight=(x,y,z,role,mass=200)=>{
  const group=new THREE.Group();group.position.set(x,y,z);scene.add(group);
  cylinder(.32,.32,.2,materials.steelDark,0,0,0,32,group);
  cylinder(.23,.23,.24,materials.blue,0,.21,0,32,group);
  torus(.13,.035,materials.steel,0,.4,0);
  const weightLabel=label(mass+" г",x,y+.7,z,.55);group.userData.label=weightLabel;
  addDrag(group,role,"x");return group;
 };
 const addStand=(x,z)=>{
  box(1.4,.14,.7,materials.dark,x,.34,z);cylinder(.08,.1,3.4,materials.steelDark,x,2.0,z);
  rod([x,.5,z],[x+1.1,3.6,z],.075,materials.steel);sphere(.12,materials.red,x+1.1,3.6,z);
 };
 let data={};
 let customControls="";
 let readoutValues=[];
 const setData=(next,message)=>{
  data={...data,...next};
  if(message)status(message);
  renderReadouts();
  if(options.onUpdate)options.onUpdate({...data});
 };
 const status=(message)=>{const el=host.querySelector("[data-three-status]");if(el)el.textContent=message;};
 const renderReadouts=()=>{
  if(!readouts)return;
  const rows=readoutValues.map(item=>'<span><small>'+item[0]+'</small><b>'+item[1]+'</b></span>').join("");
  readouts.innerHTML=rows;
 };
 const setReadouts=(rows)=>{readoutValues=rows;renderReadouts();};
 const addControl=(html)=>{customControls=html;controls.innerHTML=html;};
 let objects={},animationState={running:false,start:0,cycles:0,period:0,length:50},motionStart=0,inductionInside=false,inductionLog=[],ohmReadings=[],measurements=[];
 const sceneLabel=(text)=>label(text,0,3.7,-1.8,.75);
 const makeRuler=(x1,x2,z,y=.34)=>{
  box(x2-x1,.035,.12,materials.white,(x1+x2)/2,y,z);
  for(let i=0;i<=10;i++){
   const x=x1+(x2-x1)*i/10;box(.018,i%2===0?.2:.1,.04,materials.dark,x,y+.1,z);
  }
 };
 function buildDensity(){
  addDigitalScale(-2.2,0);const beaker=addBeaker(2,0,.6);
  const sample=cylinder(.25,.25,.75,materials.steel,0,.72,1.4,32);sample.userData.baseY=.72;
  addDrag(sample,"sample","xyz");objects.sample=sample;objects.water=beaker.water;
  setReadouts([["Масса","не измерена"],["Объём","40 мл"],["Плотность","—"]]);
  setData({massMeasured:false,submerged:false,mass:54,before:40,after:60});
 }
 function buildMotion(){
  box(7,.18,.8,materials.dark,0,.37,0);box(6.7,.035,.55,materials.steel,0,.49,0);
  for(let i=0;i<=10;i++){const x=-3.1+i*.62;box(.025,.09,.58,materials.black,x,.55,0);}
  box(.12,.55,.8,materials.green,-3.2,.7,0);box(.12,.55,.8,materials.red,3.2,.7,0);
  const cart=new THREE.Group();cart.position.set(-2.8,.75,0);scene.add(cart);
  box(.95,.2,.48,materials.blue,0,.12,0,cart);box(.35,.23,.38,materials.white,.05,.34,0,cart);
  for(const x of [-.3,.3])add(new THREE.TorusGeometry(.13,.055,10,24),materials.rubber,x,0,0,cart).rotation.x=Math.PI/2;
  addDrag(cart,"cart","x");objects.cart=cart;
  setReadouts([["Путь","0,00 м"],["Время","0,00 с"],["Скорость","—"]]);
  setData({cartMoved:false,cartTime:0,distance:1});
 }
 function buildSpring(){
  addStand(-1.5,0);const springTop=3.55,weightY=1.75;
  const weight=addWeight(-1.5,weightY,0,"weight",100);objects.weight=weight;
  objects.springTop=springTop;objects.springBaseY=weightY;
  const coil=makeSpringCoil(-1.5,springTop,weightY+.42);objects.coil=coil;
  makeRuler(-.8,2.1,-.55,.35);
  setReadouts([["Груз","100 г"],["Удлинение","5,0 см"],["Сила","1,00 Н"],["Жёсткость","20 Н/м"]]);
  setData({mass:100,extension:5});
 }
 function makeSpringCoil(x,top,bottom){
  const pts=[];const turns=11;
  for(let i=0;i<=turns*12;i++){const t=i/(turns*12),a=t*turns*Math.PI*2;pts.push(new THREE.Vector3(x+Math.cos(a)*.16,top+(bottom-top)*t,Math.sin(a)*.16));}
  const curve=new THREE.CatmullRomCurve3(pts);return add(new THREE.TubeGeometry(curve,180,.035,8,false),materials.yellow,0,0,0);
 }
 function rebuildSpring(){
  if(objects.coil){scene.remove(objects.coil);objects.coil.geometry.dispose();}
  objects.coil=makeSpringCoil(-1.5,objects.springTop,objects.weight.position.y+.42);
 }
 function buildArchimedes(){
  addStand(-2.4,0);
  const dyna=cylinder(.22,.22,.9,materials.white,-1.3,2.8,0);torus(.2,.04,materials.steel,-1.3,3.28,0);
  addDisplay("dyna","3,90 Н",-1.3,2.9,.25);
  const beaker=addBeaker(1.8,0,1.0);
  const body=cylinder(.28,.28,.65,materials.steel,0,2.0,0,32);torus(.16,.04,materials.steel,0,2.36,0);addDrag(body,"body","xyz");objects.body=body;objects.beaker=beaker;
  setReadouts([["Вес в воздухе","3,90 Н"],["Вес в воде","ожидает"],["Сила Архимеда","—"]]);
  setData({submerged:false,air:3.9,water:3.4});
 }
 function buildLever(){
  cylinder(.12,.12,1.2,materials.steelDark,0,.82,0,24);
  const beam=box(6.6,.16,.25,materials.wood,0,1.45,0);objects.beam=beam;
  const left=addWeight(-2,1.7,0,"leftWeight",200),right=addWeight(2,1.7,0,"rightWeight",200);
  objects.left=left;objects.right=right;objects.pivot=0;
  makeRuler(-3,3,.45,.42);
  setReadouts([["Левое плечо","20 см"],["Правое плечо","20 см"],["Моменты","равны"]]);
  setData({m1:200,l1:20,m2:200,l2:20});
 }
 function buildPendulum(){
  addStand(-1.8,0);
  const pivot=new THREE.Vector3(-.7,3.7,0);objects.pivot=pivot;
  const bob=sphere(.34,materials.blueSoft,.1,2.45,0);addDrag(bob,"bob","xyz");objects.bob=bob;
  const string=cylinder(.025,.025,1,materials.steel,pivot.x,(pivot.y+bob.position.y)/2,0,10);objects.string=string;orientRod(string,[pivot.x,pivot.y,pivot.z],[bob.position.x,bob.position.y,0]);
  animationState.length=50;animationState.period=2*Math.PI*Math.sqrt(.5/10);
  addControl('<label class="vlab-three-control"><span>Длина нити <b data-three-length>50 см</b></span><input type="range" min="20" max="100" step="5" value="50" data-three-control="length"></label><div class="vlab-three-control-actions"><button type="button" data-three-action="pendulum-start">▶ Запустить</button><button type="button" data-three-action="pendulum-stop">■ Остановить</button></div>');
  setReadouts([["Длина","50 см"],["Время","0,00 с"],["Колебаний","0"]]);
  setData({length:.5,time:0,count:0});
 }
 function buildHeat(){
  const bath=addBeaker(-1.9,0,1.0);label("ВОДЯНАЯ БАНЯ · 90 °C",-1.9,2.0,.7,.7);
  const calorimeter=addBeaker(2,0,.6);objects.calorimeter=calorimeter;
  const metal=cylinder(.25,.25,.7,materials.steel,0,.75,1.2,32);addDrag(metal,"hotMetal","xyz");objects.hotMetal=metal;
  setReadouts([["Вода до опыта","20 °C"],["Металл до опыта","90 °C"],["Итоговая температура","ожидает"]]);
  setData({hotMetalIn:false,mw:100,mm:100,tw:20,tm:90,tf:32.6});
 }
 function buildOhm(){
  const board=box(6,.18,3,materials.dark,0,.34,0);
  for(const x of [-2.4,-1.2,0,1.2,2.4])cylinder(.08,.08,.12,materials.steel,x,.5,0);
  box(.9,.42,.6,materials.blue,-2,.72,0);label("4,5 В",-2,1.15,.2,.55);
  cylinder(.35,.35,.28,materials.white,-.4,.68,0);label("A",-0.4,1.05,.3,.5);
  cylinder(.35,.35,.28,materials.white,1.4,.68,0);label("V",1.4,1.05,.3,.5);
  box(1.1,.35,.55,materials.red,.2,.65,1);label("R = 5,7 Ом",.2,1.1,1,.55);
  objects.switchLever=rod([.85,.72,-.9],[1.35,.72,-.9],.045,materials.red);
  addControl('<div class="vlab-three-control-row"><button type="button" data-three-action="switch">Замкнуть ключ</button><label class="vlab-three-control"><span>Реостат <b data-three-rheostat>9,3 Ом</b></span><input type="range" min="3.3" max="9.3" step="0.05" value="9.3" data-three-control="rheostat"></label></div><button type="button" data-three-action="record-ohm">＋ Записать показания</button><small data-three-count>0 / 3 измерения</small>');
  setReadouts([["Ключ","разомкнут"],["Ток","0,00 А"],["Напряжение","0,00 В"],["Измерений","0 / 3"]]);
  data={keyClosed:false,rheostat:9.3,readings:[]};renderReadouts();
 }
 function buildInduction(){
  for(let i=0;i<10;i++){const x=-.55+i*.12;torus(.57,.045,materials.copper,x,1.45,0,[0,Math.PI/2,0]);}
  const magnet=new THREE.Group();magnet.position.set(-2.4,1.45,0);scene.add(magnet);
  box(.65,.28,.3,materials.red,-.34,0,0,magnet);box(.65,.28,.3,materials.blue,.34,0,0,magnet);
  label("N",-2.7,1.9,0,.45);label("S",-2.0,1.9,0,.45);
  addDrag(magnet,"magnet","x");objects.magnet=magnet;objects.magnetLabels=[label("N",-2.7,1.9,0,.45),label("S",-2.0,1.9,0,.45)];
  cylinder(.48,.48,.18,materials.dark,2.1,1.0,0);torus(.4,.035,materials.steel,2.1,1.1,0);
  const needle=box(.04,.05,.65,materials.red,2.1,1.22,0);objects.needle=needle;
  addDisplay("galvanometer","0",2.1,1.75,.2);
  setReadouts([["Стрелка","0"],["Наблюдений","0"],["Направление","нет тока"]]);
  setData({inductionObserved:0,inductionLog:[]});
 }
 function buildLens(){
  box(7,.1,.25,materials.dark,0,.35,0);
  makeRuler(-3,3,.3,.44);
  const object=cylinder(.12,.12,1.1,materials.yellow,-2,.95,0,24);sphere(.18,materials.yellow,-2,1.55,0);addDrag(object,"object","x");objects.object=object;
  const lens=cylinder(.05,.05,1.5,materials.blueSoft,0,1.15,0,32);lens.material=materials.glass;addDrag(lens,"lens","x");objects.lens=lens;
  const screen=box(.12,1.4,.9,materials.white,2,1.1,0);addDrag(screen,"screen","x");objects.screen=screen;
  setReadouts([["Предмет — линза","30 см"],["Линза — экран","30 см"],["Изображение","резкое"]]);
  setData({a:30,b:30,sharp:true});
 }
 function buildUncertainty(){
  box(6,.12,.6,materials.white,0,.38,0);
  makeRuler(-2.5,2.5,0,.47);
  const marker=box(.12,.85,.16,materials.red,0,.95,0);sphere(.12,materials.red,0,1.42,0);addDrag(marker,"marker","x");objects.marker=marker;
  measurements=[];
  addControl('<button type="button" data-three-action="record-measurement">＋ Записать измерение</button><small data-three-count>0 / 5 измерений</small>');
  setReadouts([["Показание","2,5 см"],["Серия","0 / 5"],["Среднее","—"]]);
  data={measurements:[]};renderReadouts();
 }
 function buildFriction(){
  box(6,.22,2.3,materials.wood,0,.38,0);
  const block=box(.9,.55,.8,materials.blue,0,.78,0);addDrag(block,"frictionBlock","x");objects.block=block;
  rod([-.7,1.05,0],[-1.4,1.05,0],.045,materials.steel);cylinder(.2,.2,.25,materials.dark,-1.55,1.05,0);
  addControl('<label class="vlab-three-control"><span>Масса бруска <b data-three-mass>200 г</b></span><input type="range" min="100" max="600" step="50" value="200" data-three-control="mass"></label><label class="vlab-three-control"><span>Сила тяги <b data-three-pull>0,00 Н</b></span><input type="range" min="0" max="4" step="0.05" value="0" data-three-control="pull"></label>');
  setReadouts([["Масса","200 г"],["Сила тяги","0,00 Н"],["Сила трения","0,50 Н"],["Состояние","покой"]]);
  data={mass:.2,pull:0,force:0,sliding:false};renderReadouts();
 }
 const builders={density:buildDensity,motion:buildMotion,spring:buildSpring,archimedes:buildArchimedes,lever:buildLever,pendulum:buildPendulum,heat:buildHeat,ohm:buildOhm,induction:buildInduction,lens:buildLens,uncertainty:buildUncertainty,friction:buildFriction};
 if(builders[id])builders[id]();else buildDensity();
 if(options.onUpdate)options.onUpdate({...data});
 const updateMeters=()=>{
  if(id==="density"){
   setReadouts([["Масса",data.massMeasured?"54,0 г":"не измерена"],["Объём",data.submerged?"60 мл":"40 мл"],["Плотность",data.submerged&&data.massMeasured?"2,70 г/см³":"—"]]);
  }else if(id==="motion"){
   setReadouts([["Путь",data.cartMoved?"1,00 м":"0,00 м"],["Время",data.cartMoved?Number(data.time).toFixed(2).replace(".",",")+" с":"0,00 с"],["Скорость",data.cartMoved?(1/data.time).toFixed(2).replace(".",",")+" м/с":"—"]]);
  }else if(id==="spring"){
   const ext=data.extension||5;setReadouts([["Груз",(data.mass||100)+" г"],["Удлинение",ext.toFixed(1).replace(".",",")+" см"],["Сила",((data.mass||100)/1000*10).toFixed(2).replace(".",",")+" Н"],["Жёсткость",(((data.mass||100)/1000*10)/(ext/100)).toFixed(1).replace(".",",")+" Н/м"]]);
  }else if(id==="archimedes"){
   setReadouts([["Вес в воздухе","3,90 Н"],["Вес в воде",data.submerged?"3,40 Н":"ожидает"],["Сила Архимеда",data.submerged?"0,50 Н":"—"]]);
  }else if(id==="lever"){
   setReadouts([["Левое плечо",Number(data.l1||20).toFixed(1)+" см"],["Правое плечо",Number(data.l2||20).toFixed(1)+" см"],["Моменты",Math.abs((data.m1||200)*(data.l1||20)-(data.m2||200)*(data.l2||20))<20?"равны":"различаются"]]);
  }else if(id==="pendulum"){
   setReadouts([["Длина",animationState.length+" см"],["Время",Number(data.time||0).toFixed(2).replace(".",",")+" с"],["Колебаний",String(data.count||0)]]);
  }else if(id==="heat"){
   setReadouts([["Вода до опыта","20 °C"],["Металл до опыта","90 °C"],["Итоговая температура",data.hotMetalIn?"32,6 °C":"ожидает"]]);
  }else if(id==="ohm"){
   const i=data.keyClosed?4.5/(5.7+data.rheostat):0,u=i*5.7;
   setReadouts([["Ключ",data.keyClosed?"замкнут":"разомкнут"],["Ток",i.toFixed(2).replace(".",",")+" А"],["Напряжение",u.toFixed(2).replace(".",",")+" В"],["Измерений",ohmReadings.length+" / 3"]]);
  }else if(id==="induction"){
   setReadouts([["Стрелка",data.needle>0?"вправо":data.needle<0?"влево":"0"],["Наблюдений",inductionLog.length.toString()],["Направление",inductionLog.length?inductionLog[inductionLog.length-1].direction:"нет тока"]]);
  }else if(id==="lens"){
   setReadouts([["Предмет — линза",Number(data.a||30).toFixed(1)+" см"],["Линза — экран",Number(data.b||30).toFixed(1)+" см"],["Изображение",data.sharp?"резкое":"размытое"]]);
  }else if(id==="uncertainty"){
   const avg=measurements.length?measurements.reduce((a,b)=>a+b,0)/measurements.length:null;
   setReadouts([["Показание",(objects.marker.position.x+2.5).toFixed(1)+" см"],["Серия",measurements.length+" / 5"],["Среднее",avg===null?"—":avg.toFixed(2)+" см"]]);
  }else if(id==="friction"){
   setReadouts([["Масса",Math.round((data.mass||.2)*1000)+" г"],["Сила тяги",Number(data.pull||0).toFixed(2)+" Н"],["Сила трения",Number(data.force||0).toFixed(2)+" Н"],["Состояние",data.sliding?"скольжение":"покой"]]);
  }
 };
 const emit=(message)=>{
  updateMeters();
  if(options.onUpdate)options.onUpdate({...data});
  if(message)status(message);
 };
 const setAxisPosition=(object,point)=>{
  const axis=object.userData.axis||"xyz";
  if(axis.includes("x"))object.position.x=THREE.MathUtils.clamp(point.x,-3.2,3.2);
  if(axis.includes("y"))object.position.y=THREE.MathUtils.clamp(point.y,.48,3.5);
  if(axis.includes("z"))object.position.z=THREE.MathUtils.clamp(point.z,-1.8,1.8);
 };
 const updateDuringDrag=(object)=>{
  if(id==="spring"&&object===objects.weight){
   const extension=Math.max(1,Math.min(12,(2.25-object.position.y)*10));
   data={...data,mass:100,extension:extension};rebuildSpring();
  }
  if(object.userData.label)object.userData.label.position.set(object.position.x,object.position.y+.7,object.position.z);
  if(id==="induction"&&object===objects.magnet&&objects.magnetLabels){objects.magnetLabels[0].position.x=object.position.x-.3;objects.magnetLabels[1].position.x=object.position.x+.35;}
  if(id==="ohm"&&objects.switchLever)objects.switchLever.rotation.z=data.keyClosed?-.55:0;
  if(id==="lever"&&(object===objects.left||object===objects.right)){
   const l1=Math.max(1,Math.abs(objects.left.position.x)*10),l2=Math.max(1,Math.abs(objects.right.position.x)*10);
   data={...data,m1:200,l1:l1,m2:200,l2:l2};
   objects.beam.rotation.z=THREE.MathUtils.clamp((200*l1-200*l2)*.00012,-.16,.16);
  }
  if(id==="lens"){
   const a=Math.abs(objects.lens.position.x-objects.object.position.x)*15,b=Math.max(.1,(objects.screen.position.x-objects.lens.position.x)*15);
   const expected=a>15?15*a/(a-15):Infinity;const sharp=Number.isFinite(expected)&&Math.abs(expected-b)<1.6;
   data={...data,a:a,b:b,sharp:sharp};
  }
  if(id==="uncertainty"){
   const value=THREE.MathUtils.clamp(objects.marker.position.x+2.5,0,5);data={...data,value:value};
  }
  if(id==="friction"){
   const threshold=.25*(data.mass||.2)*10;
   data={...data,force:Math.min(data.pull||0,threshold),sliding:(data.pull||0)>=threshold};
  }
  if(id==="density"&&object===objects.sample){
   // The sample is placed on the scale or into the measuring cylinder on release.
  }
  updateMeters();
 };
 const finishDrag=(object)=>{
  if(id==="density"&&object===objects.sample){
   const p=object.position;
   if(Math.hypot(p.x+2.2,p.z)<1.0){object.position.set(-2.2,.95,0);setData({massMeasured:true,mass:54},"Весы зафиксировали массу цилиндра: 54,0 г.");}
   else if(Math.hypot(p.x-2,p.z)<1.0&&data.massMeasured){object.position.set(2,.95,0);setData({submerged:true,before:40,after:60},"Цилиндр погружён. Уровень воды поднялся с 40 до 60 мл.");}
   else if(Math.hypot(p.x-2,p.z)<1.0&&!data.massMeasured){object.position.set(0,.72,1.4);status("Сначала взвесь цилиндр на электронных весах.");}
   else status("Перетащи цилиндр на весы, затем в мензурку.");
  }else if(id==="motion"&&object===objects.cart){
   if(object.position.x>2.35){
    const elapsed=Math.max(.15,(performance.now()-motionStart)/1000);
    object.position.x=2.65;setData({cartMoved:true,cartTime:elapsed,distance:1,time:elapsed},"Финиш! Время движения записано.");
   }else if(object.position.x< -2.2){object.position.x=-2.8;status("Тележка установлена на старт.");}
  }else if(id==="archimedes"&&object===objects.body){
   const submerged=object.position.x>.9&&object.position.y<1.55&&object.position.y>.45;
   if(submerged){object.position.set(1.8,1.05,0);setData({submerged:true,air:3.9,water:3.4},"Тело погружено. Динамометр показывает 3,40 Н.");}
   else{object.position.set(0,2,0);setData({submerged:false},"Подвесь тело в воздухе или погрузи в сосуд.");}
  }else if(id==="lever"){
   emit("Положение грузов изменено. Сравни моменты сил.");
  }else if(id==="spring"){
   emit("Удлинение пружины измерено по шкале.");
  }else if(id==="lens"){
   emit(data.sharp?"Получено резкое изображение.":"Изображение пока размыто. Передвинь экран или линзу.");
  }else if(id==="induction"&&object===objects.magnet){
   emit("Наблюдение сохранено.");
  }else if(id==="heat"&&object===objects.hotMetal){
   if(object.position.x>1.0&&object.position.y<1.5){object.position.set(2,1.0,0);setData({hotMetalIn:true,mw:100,mm:100,tw:20,tm:90,tf:32.6},"Металл перенесён в калориметр. Тепловое равновесие установлено.");}
   else status("Перенеси цилиндр в калориметр.");
  }else if(id==="uncertainty"&&object===objects.marker){
   emit("Положение указателя измерено.");
  }else if(id==="friction"&&object===objects.block){
   if(!data.sliding){object.position.x=0;status("Брусок не сдвинулся: увеличь силу тяги выше силы трения.");}
   else emit("Брусок скользит. Сила трения измерена.");
  }
  emit();
 };
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),dragPlane=new THREE.Plane(),planeNormal=new THREE.Vector3(),hitPoint=new THREE.Vector3();
 let activePointer=null,dragObject=null,orbiting=false,lastX=0,lastY=0,pointers=new Map(),pinchStart=0,pinchRadius=radius;
 const pointerPosition=event=>{
  const rect=renderer.domElement.getBoundingClientRect();
  pointer.x=((event.clientX-rect.left)/rect.width)*2-1;
  pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;
 };
 const onPointerDown=event=>{
  pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
  if(pointers.size===2){pinchStart=pointerDistance();pinchRadius=radius;orbiting=false;dragObject=null;activePointer=null;return;}
  if(pointers.size>2)return;
  pointerPosition(event);raycaster.setFromCamera(pointer,camera);
  const hits=raycaster.intersectObjects(draggables,true);
  const found=hits.find(hit=>{let obj=hit.object;while(obj&&!obj.userData.draggable)obj=obj.parent;return !!obj;});
  if(found){
   let obj=found.object;while(obj&&!obj.userData.draggable)obj=obj.parent;
   if(id==="friction"&&obj===objects.block&&!data.sliding){status("Увеличь силу тяги до начала скольжения.");return;}
   dragObject=obj;activePointer=event.pointerId;
   planeNormal.copy(camera.getWorldDirection(new THREE.Vector3()));
   dragPlane.setFromNormalAndCoplanarPoint(planeNormal,obj.position);
   renderer.domElement.setPointerCapture(event.pointerId);
   if(id==="motion"&&obj===objects.cart)motionStart=performance.now();
   if(id==="pendulum"&&obj===objects.bob){animationState.running=false;animationState.dragging=true;}
   event.preventDefault();
  }else{
   orbiting=true;activePointer=event.pointerId;lastX=event.clientX;lastY=event.clientY;
   renderer.domElement.setPointerCapture(event.pointerId);
  }
 };
 const onPointerMove=event=>{
  if(pointers.has(event.pointerId))pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
  if(pointers.size>=2){const d=pointerDistance();if(pinchStart>0){radius=THREE.MathUtils.clamp(pinchRadius-(d-pinchStart)*.018,5,17);updateCamera();}return;}
  if(event.pointerId!==activePointer)return;
  if(dragObject){
   pointerPosition(event);raycaster.setFromCamera(pointer,camera);
   if(raycaster.ray.intersectPlane(dragPlane,hitPoint)){
    setAxisPosition(dragObject,hitPoint);
    updateDuringDrag(dragObject);
    if(id==="induction"&&dragObject===objects.magnet){
     const inside=Math.abs(dragObject.position.x)<.72;
     if(inside!==inductionInside){
      const action=inside?"Магнит входит в катушку":"Магнит выходит из катушки";
      const direction=inside?(dragObject.position.x<0?"Отклонение вправо":"Отклонение влево"):(dragObject.position.x<0?"Отклонение влево":"Отклонение вправо");
      inductionLog.push({action,direction});inductionInside=inside;
      data={...data,needle:inside?(dragObject.position.x<0?1:-1):(dragObject.position.x<0?-1:1),inductionLog:inductionLog.slice(),inductionObserved:inductionLog.length};
      objects.needle.rotation.z=data.needle*.5;setLabel(display.galvanometer,data.needle>0?"→":"←");emit();
     }
    }
   }
  }else if(orbiting){
   const dx=event.clientX-lastX,dy=event.clientY-lastY;theta-=dx*.008;phi-=dy*.006;lastX=event.clientX;lastY=event.clientY;updateCamera();
  }
 };
 const onPointerUp=event=>{
  pointers.delete(event.pointerId);
  if(event.pointerId===activePointer){
   if(dragObject){const obj=dragObject;dragObject=null;activePointer=null;if(id==="pendulum"&&obj===objects.bob){animationState.dragging=false;animationState.amplitude=Math.atan2(obj.position.x-objects.pivot.x,objects.pivot.y-obj.position.y);status("Маятник отклонён. Нажми «Запустить» для измерения.");}finishDrag(obj);}
   else{orbiting=false;activePointer=null;}
  }
  if(pointers.size<2)pinchStart=0;
 };
 const pointerDistance=()=>{
  const values=[...pointers.values()];if(values.length<2)return 0;
  return Math.hypot(values[0].x-values[1].x,values[0].y-values[1].y);
 };
 const onWheel=event=>{radius=THREE.MathUtils.clamp(radius+event.deltaY*.008,5,17);updateCamera();event.preventDefault();};
 renderer.domElement.addEventListener("pointerdown",onPointerDown);
 renderer.domElement.addEventListener("pointermove",onPointerMove);
 renderer.domElement.addEventListener("pointerup",onPointerUp);
 renderer.domElement.addEventListener("pointercancel",onPointerUp);
 renderer.domElement.addEventListener("wheel",onWheel,{passive:false});
 const onControl=event=>{
  const control=event.target.closest("[data-three-control]");if(!control)return;
  if(control.dataset.threeControl==="length"){
   animationState.length=Number(control.value);animationState.period=2*Math.PI*Math.sqrt((animationState.length/100)/10);
   const out=host.querySelector("[data-three-length]");if(out)out.textContent=animationState.length+" см";
   data={...data,length:animationState.length/100};if(!animationState.running)positionPendulum(0);
   emit();
  }else if(control.dataset.threeControl==="rheostat"){
   data={...data,rheostat:Number(control.value)};
   const out=host.querySelector("[data-three-rheostat]");if(out)out.textContent=Number(control.value).toFixed(1).replace(".",",")+" Ом";
   emit();
  }else if(control.dataset.threeControl==="mass"){
   data={...data,mass:Number(control.value)/1000};
   const out=host.querySelector("[data-three-mass]");if(out)out.textContent=control.value+" г";
   if(objects.block)objects.block.scale.setScalar(1+Number(control.value)/1500);
   emit();
  }else if(control.dataset.threeControl==="pull"){
   const pull=Number(control.value),mass=data.mass||.2,threshold=.25*mass*10;
   data={...data,pull,force:Math.min(pull,threshold),sliding:pull>=threshold};
   const out=host.querySelector("[data-three-pull]");if(out)out.textContent=pull.toFixed(2).replace(".",",")+" Н";
   emit();
  }
 };
 const positionPendulum=(t)=>{
  if(!objects.bob||!objects.pivot)return;
  const L=animationState.length/100*2.5,period=animationState.period||2*Math.PI*Math.sqrt((animationState.length/100)/10);
  const amplitude=animationState.amplitude||.28,angle=animationState.running?amplitude*Math.cos(2*Math.PI*t/period):amplitude;
  objects.bob.position.set(objects.pivot.x+Math.sin(angle)*L,objects.pivot.y-Math.cos(angle)*L,0);
  orientRod(objects.string,[objects.pivot.x,objects.pivot.y,objects.pivot.z],[objects.bob.position.x,objects.bob.position.y,objects.bob.position.z]);
 };
 const onAction=event=>{
  const button=event.target.closest("[data-three-action]");if(!button)return;
  const action=button.dataset.threeAction;
  if(action==="camera"){theta=Math.PI*.25;phi=1.02;radius=10;updateCamera();return;}
  if(action==="reset"){mountThreeLab(host,id,options);return;}
  if(action==="retry"){mountThreeLab(host,id,options);return;}
  if(action==="pendulum-start"&&id==="pendulum"){
   if(animationState.running)return;
   animationState.running=true;animationState.start=performance.now();animationState.cycles=0;status("Маятник движется. Измерь время нескольких полных колебаний.");
  }else if(action==="pendulum-stop"&&id==="pendulum"){
   if(!animationState.running)return;
   const elapsed=(performance.now()-animationState.start)/1000;
   const cycles=Math.max(1,Math.floor(elapsed/(animationState.period||1)));
   animationState.running=false;data={...data,time:elapsed,count:cycles};emit("Измерение остановлено. Колебаний: "+cycles+".");
  }else if(action==="switch"&&id==="ohm"){
   data={...data,keyClosed:!data.keyClosed};if(objects.switchLever)objects.switchLever.rotation.z=data.keyClosed?-.55:0;button.textContent=data.keyClosed?"Разомкнуть ключ":"Замкнуть ключ";emit();
  }else if(action==="record-ohm"&&id==="ohm"){
   if(!data.keyClosed){status("Сначала замкни ключ.");return;}
   if(ohmReadings.length>=3){status("Уже записаны три измерения.");return;}
   const current=4.5/(5.7+data.rheostat),voltage=current*5.7;
   ohmReadings.push({i:current,u:voltage,r:data.rheostat});data={...data,readings:ohmReadings.slice()};const count=host.querySelector("[data-three-count]");if(count)count.textContent=ohmReadings.length+" / 3 измерения";emit("Пара показаний записана.");
  }else if(action==="record-measurement"&&id==="uncertainty"){
   if(measurements.length>=5){status("Уже записаны пять измерений.");return;}
   const value=THREE.MathUtils.clamp(objects.marker.position.x+2.5,0,5);measurements.push(value);data={...data,measurements:measurements.slice()};
   const count=host.querySelector("[data-three-count]");if(count)count.textContent=measurements.length+" / 5 измерений";emit("Измерение №"+measurements.length+" записано: "+value.toFixed(1)+" см.");
  }
 };
 controls.addEventListener("input",onControl);
 host.addEventListener("click",onAction);
 const resize=()=>{
  const width=Math.max(280,canvasHost.clientWidth||host.clientWidth||700),height=Math.max(300,stage.clientHeight||480);
  camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);
 };
 const observer=typeof ResizeObserver!=="undefined"?new ResizeObserver(resize):null;
 if(observer)observer.observe(stage);else window.addEventListener("resize",resize);
 resize();loading.classList.add("hidden");
 const clock=new THREE.Clock();let raf=0,disposed=false;
 const animate=()=>{
  if(disposed)return;raf=requestAnimationFrame(animate);
  const elapsed=clock.getElapsedTime();
  if(id==="pendulum"&&animationState.running){
   const t=(performance.now()-animationState.start)/1000;animationState.cycles=Math.floor(t/(animationState.period||1));
   positionPendulum(t);
   const time=host.querySelector("[data-three-readouts]");
   if(time&&Math.floor(t*5)!==animate.lastTick){animate.lastTick=Math.floor(t*5);data={...data,time:t,count:animationState.cycles};updateMeters();}
  }
  if(id==="induction"&&objects.needle)objects.needle.rotation.z+=(0-objects.needle.rotation.z)*.04;
  renderer.render(scene,camera);
 };
 animate();
 const dispose=()=>{
  if(disposed)return;disposed=true;cancelAnimationFrame(raf);
  if(observer)observer.disconnect();else window.removeEventListener("resize",resize);
  renderer.domElement.removeEventListener("pointerdown",onPointerDown);
  renderer.domElement.removeEventListener("pointermove",onPointerMove);
  renderer.domElement.removeEventListener("pointerup",onPointerUp);
  renderer.domElement.removeEventListener("pointercancel",onPointerUp);
  renderer.domElement.removeEventListener("wheel",onWheel);
  controls.removeEventListener("input",onControl);controls.removeEventListener("click",onAction);host.removeEventListener("click",onAction);
  scene.traverse(object=>{if(object.geometry)object.geometry.dispose();if(object.material){const mats=Array.isArray(object.material)?object.material:[object.material];mats.forEach(m=>{if(m.map)m.map.dispose();m.dispose();});}});
  renderer.dispose();renderer.forceContextLoss();host.innerHTML="";
 };
 host._threeLab={dispose,scene,camera,renderer};
 return host._threeLab;
}
