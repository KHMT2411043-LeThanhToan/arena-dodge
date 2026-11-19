#!/usr/bin/env node
/* Kiểm tra tự động:  node tools/check.js          (kiểm tra dữ liệu + chạy thử game)
                      node tools/check.js --no-smoke   (chỉ kiểm tra dữ liệu, không cần cài jsdom) */
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const errors=[],warns=[];
const err=m=>errors.push(m),warn=m=>warns.push(m);
const rd=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
function load(f){try{return JSON.parse(rd('content/'+f+'.json'))}catch(e){err(`content/${f}.json: lỗi cú pháp JSON – ${e.message}`);return null}}
const skins=load('skins'),maps=load('maps'),bosses=load('bosses'),cores=load('cores'),bullets=load('bullets'),questions=load('questions');
const game=rd('game.js');
const isStr=v=>typeof v==='string'&&v.trim()!=='';
const isNum=v=>typeof v==='number'&&isFinite(v);
function dupes(arr,key,label){const seen=new Set();arr.forEach(x=>{if(seen.has(x[key]))err(`${label}: trùng ${key} "${x[key]}"`);seen.add(x[key])})}
function img(p,where){if(!isStr(p))return err(`${where}: thiếu đường dẫn ảnh`);if(!exists(p))err(`${where}: không thấy ảnh "${p}"`)}

// ---- bullets
const tun=(bullets&&bullets.tuning)||{};
Object.entries(tun).forEach(([id,v])=>{
  if(!new RegExp('\\n\\s*'+id+'\\s*:\\s*\\{').test(game))err(`bullets.json: đạn "${id}" chưa có code trong game.js (đạn mới hoàn toàn cần viết code)`);
  if(!isNum(v.at)||v.at<1)err(`bullets.json: "${id}".at phải là số ≥ 1 (vòng xuất hiện đầu tiên)`);
  if(v.wt!==undefined&&!isNum(v.wt))err(`bullets.json: "${id}".wt phải là số`);
  if(v.c!==undefined&&!/^#[0-9a-f]{3,8}$/i.test(v.c))err(`bullets.json: "${id}".c phải là mã màu #rrggbb`);
});
if(bullets&&Array.isArray(bullets.help)){dupes(bullets.help,'id','bullets.help');bullets.help.forEach((h,i)=>{
  if(!isStr(h.id)||!isStr(h.name)||!isStr(h.desc))err(`bullets.help[${i}]: cần id, name, desc`);
  if(h.id&&!tun[h.id]&&!new RegExp('\\n\\s*'+h.id+'\\s*:\\s*\\{').test(game))warn(`bullets.help: "${h.id}" không có code đạn tương ứng`)})}

// ---- skins
if(Array.isArray(skins)){
  dupes(skins,'id','skins.json');
  if(!skins.length||skins[0].price!==0)err('skins.json: skin đầu tiên phải miễn phí (price 0) và là skin mặc định');
  skins.forEach((s,i)=>{const w=`skins.json[${i}] ${s.id||'?'}`;
    if(!isStr(s.id)||!/^[a-z0-9_]+$/.test(s.id))err(`${w}: id chỉ gồm a-z, 0-9, _`);
    if(!isStr(s.name))err(`${w}: thiếu name`);
    if(!isNum(s.price)||s.price<0)err(`${w}: price phải là số ≥ 0`);
    img(s.img,w);
    if(s.fx!==undefined&&!isStr(s.fx))err(`${w}: fx phải là chuỗi`);
  });
}
// ---- maps
if(Array.isArray(maps)){
  dupes(maps,'id','maps.json');
  maps.forEach((m,i)=>{const w=`maps.json[${i}] ${m.id||'?'}`;
    if(!isStr(m.id)||!isStr(m.name))err(`${w}: thiếu id/name`);
    if(!Array.isArray(m.c)||m.c.length!==2)err(`${w}: c phải có 2 màu nền`);
    ['acc','fl'].forEach(k=>{if(!isStr(m[k]))err(`${w}: thiếu ${k}`)});
    if(!Array.isArray(m.plat)||m.plat.some(p=>!Array.isArray(p)||p.length!==3||p.some(x=>!isNum(x))))err(`${w}: plat phải là danh sách [x,y,rộng]`);
    ['fav','no'].forEach(k=>{if(m[k]!==undefined){if(!Array.isArray(m[k]))err(`${w}: ${k} phải là danh sách`);else m[k].forEach(b=>{if(!tun[b])err(`${w}: ${k} chứa đạn "${b}" không có trong bullets.json`)})}});
    if(m.bg)img(m.bg,w+' (bg)');
  });
}
// ---- bosses
if(bosses&&maps){Object.entries(bosses).forEach(([id,b])=>{const w=`bosses.json "${id}"`;
  if(!maps.some(m=>m.id===id))err(`${w}: không có map cùng id`);
  if(!isStr(b.n)||!isStr(b.e)||!isStr(b.c))err(`${w}: cần n (tên), e (emoji), c (màu)`);
  if(!Array.isArray(b.pool))err(`${w}: pool phải là danh sách đạn`);else b.pool.forEach(x=>{if(!tun[x])err(`${w}: pool chứa đạn "${x}" không có trong bullets.json`)});
  if(b.img)img(b.img,w);
  if(b.ai&&!new RegExp(b.ai+'AI').test(game))err(`${w}: ai "${b.ai}" chưa có code`);
})}
// ---- cores
const TIERS=['bac','vang','kim'];
if(Array.isArray(cores)){
  dupes(cores,'t','cores.json');
  cores.forEach((c,i)=>{const w=`cores.json[${i}] ${c.t||'?'}`;
    if(!isStr(c.t)||!isStr(c.ic)||!isStr(c.d))err(`${w}: cần t (tên), ic (emoji), d (mô tả)`);
    if(!TIERS.includes(c.tier))err(`${w}: tier phải là ${TIERS.join(' / ')}`);
    if(!(c.dur==='vinh'||c.dur==='tuc'||(Number.isInteger(c.dur)&&c.dur>=1)))err(`${w}: dur phải là "vinh", "tuc" hoặc số vòng ≥ 1`);
    if(c.effect!==undefined){
      if(!['coins','heal'].includes(c.effect))err(`${w}: effect "${c.effect}" chưa hỗ trợ (coins | heal)`);
      if(!isNum(c.amount)||c.amount<=0)err(`${w}: effect cần amount > 0`);
    }else if(!game.includes("t:'"+c.t+"'"))err(`${w}: lõi chưa có code trong game.js; muốn thêm lõi chỉ bằng JSON hãy dùng "effect": "coins" hoặc "heal"`);
  });
}
// ---- questions
if(Array.isArray(questions)){
  const seen=new Set();
  questions.forEach((q,i)=>{const w=`questions.json[${i+1}]`;
    if(!isStr(q.question))err(`${w}: thiếu question`);
    if(!Array.isArray(q.options)||q.options.length<2||q.options.some(o=>!isStr(o)))err(`${w}: options phải có ≥ 2 đáp án không rỗng`);
    else if(new Set(q.options.map(o=>o.trim().toLowerCase())).size!==q.options.length)err(`${w}: có đáp án trùng nhau`);
    if(!Number.isInteger(q.answer)||!q.options||q.answer<0||q.answer>=q.options.length)err(`${w}: answer phải là chỉ số 0..${(q.options||[]).length-1}`);
    if(![1,2,3].includes(q.difficulty))err(`${w}: difficulty phải là 1, 2 hoặc 3`);
    const k=String(q.question).toLowerCase().replace(/\s+/g,' ').trim();if(seen.has(k))warn(`${w}: câu hỏi trùng nội dung`);seen.add(k);
  });
}
// ---- game.js không còn dữ liệu nhúng
if(/data:image\//.test(game))warn('game.js chứa ảnh base64: nên chuyển vào img/');

function report(){
  warns.forEach(w=>console.log('⚠️ ',w));
  if(errors.length){console.log('\n❌ '+errors.length+' lỗi:');errors.forEach(e=>console.log('  - '+e));process.exit(1)}
  console.log('✅ Dữ liệu hợp lệ:',`${skins.length} skin, ${maps.length} map, ${Object.keys(bosses).length} boss, ${cores.length} lõi, ${Object.keys(tun).length} đạn, ${questions.length} câu hỏi`);
}
if(errors.length||process.argv.includes('--no-smoke')){report();process.exit(0)}

// ================= CHẠY THỬ GAME =================
let JSDOM;try{({JSDOM}=require('jsdom'))}catch(e){report();console.log('ℹ️  Chưa cài jsdom nên bỏ qua bước chạy thử. Chạy "npm install" rồi thử lại.');process.exit(0)}
const {build}=require('./build.js');
const html=build();
const jsErrors=[];
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/',beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:(t,k)=>k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):k==='measureText'?()=>({width:10}):()=>{},set:()=>true});
  w.matchMedia=()=>({matches:false});w.AudioContext=function(){};
  w.addEventListener('error',e=>jsErrors.push('Lỗi script: '+e.message));
}});
const w=dom.window;
function t(label,code){try{w.eval(code)}catch(e){err(`Chạy thử – ${label}: ${e&&e.message||e}`)}}
setTimeout(()=>{
  if(jsErrors.length)jsErrors.forEach(err);
  const frames=(n)=>`for(let i=0;i<${n};i++){G.hp=999;P.inv=0.5;step(1/60);draw()}`;
  const n=JSON.parse(w.eval('JSON.stringify({q:QUESTIONS.length,skins:SKINS.length,maps:MAPS.length,buffs:BUFFS.length})'));
  if(n.skins!==skins.length)err(`Game nạp ${n.skins} skin nhưng skins.json có ${skins.length}`);
  if(n.maps!==maps.length)err(`Game nạp ${n.maps} map nhưng maps.json có ${maps.length}`);
  if(n.q!==questions.length)warn(`Game có ${n.q} câu hỏi, questions.json có ${questions.length}`);
  skins.forEach(s=>t(`skin ${s.id}`,`startRun();SHOP.equip='${s.id}';${frames(10)}`));
  maps.forEach(m=>t(`map ${m.id}`,`startRun();G.map=MAPS.find(m=>m.id==='${m.id}');G.envPool=null;${frames(90)}`));
  Object.keys(tun).forEach(b=>t(`đạn ${b}`,`if(BT['${b}'].mk){startRun();G.round=${Math.max(1,tun[b].at)};for(let k=0;k<3;k++)spawnType('${b}');${frames(80)}}`));
  Object.keys(bosses).forEach(id=>t(`boss ${id}`,`startRun();BOSS_ALWAYS=true;G.round=5;G.map=MAPS.find(m=>m.id==='${id}');startBoss();if(!G.boss)throw new Error('không tạo được boss');${frames(500)};BOSS_ALWAYS=false`));
  cores.forEach(c=>t(`lõi ${c.t}`,`startRun();G.round=3;const b=BUFFS.find(x=>x.t===${JSON.stringify(c.t)});if(!b)throw new Error('không tìm thấy lõi');if(b.skill)addSkill(b.skill);else b.apply();${frames(40)}`));
  t('hộp mù',`startRun();for(let k=0;k<40;k++){startRun();BUFFS.find(x=>x.t==='Hộp Mù').apply()}`);
  t('xuất/nhập dữ liệu','const d=exportSave();importSave(JSON.parse(JSON.stringify(d)));renderShop()');
  t('vẽ menu','G.mode="menu";draw()');
  report();console.log('✅ Chạy thử xong: skin, map, đạn, boss, lõi, xuất/nhập dữ liệu đều không lỗi');
  process.exit(0);
},700);
