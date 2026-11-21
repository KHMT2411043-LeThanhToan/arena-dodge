/* ===== ĐỘ KHÓ: chỉnh 3 hệ số này ===== spawn: số đạn (>1 = nhiều hơn), speed: tốc độ đạn (>1 = nhanh hơn), heal: lượng máu hồi bị động (<1 = ít hơn) */
const DIFF={spawn:1.2,speed:1.1,heal:0.5};
const CONTENT=window.CONTENT;
const ORIG_HTML='<!DOCTYPE html>\n'+document.documentElement.outerHTML;
/* ============ CONSTANTS & UTILS ============ */
const W=900,H=520,FLOOR=470,WL=20,WR=880;
const cv=document.getElementById('c');let ctx=cv.getContext('2d');
const $=id=>document.getElementById(id);
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let AC=null;
let SOUND=true;
function beep(f=440,d=.08,v=.04,type='square'){if(!SOUND)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;g.gain.value=v;o.connect(g);g.connect(AC.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.stop(AC.currentTime+d)}catch(e){}}

/* ============ QUESTION BANK (mở rộng bằng cách thêm vào mảng) ============ */
const QUESTIONS=[
 {q:'Ngôn ngữ nào chạy trực tiếp trên trình duyệt?',o:['Python','JavaScript','C++','Java'],a:1,d:1},
 {q:'HTML viết tắt của?',o:['HyperText Markup Language','High Tech Modern Language','Home Tool Markup Language','Hyperlink Text Markup'],a:0,d:1},
 {q:'Thủ đô của Việt Nam?',o:['Hà Nội','Huế','Đà Nẵng','Cần Thơ'],a:0,d:1},
 {q:'Bánh tét thường được ăn vào dịp nào?',o:['Trung thu','Tết Nguyên Đán','Giáng sinh','Quốc khánh'],a:1,d:1},
 {q:'Màu nào KHÔNG thuộc nhóm màu cơ bản RGB?',o:['Đỏ','Lục','Lam','Vàng'],a:3,d:1},
 {q:'2^10 bằng bao nhiêu?',o:['512','1024','2048','100'],a:1,d:2},
 {q:'Độ phức tạp của tìm kiếm nhị phân?',o:['O(n)','O(n²)','O(log n)','O(1)'],a:2,d:2},
 {q:'Đơn vị của lực trong hệ SI?',o:['Joule','Newton','Watt','Pascal'],a:1,d:2},
 {q:'Trong Canvas, phương thức nào vẽ đường tròn qua path?',o:['circle()','arc()','round()','ellipse2()'],a:1,d:2},
 {q:'Quy tắc Bayes dùng để?',o:['Tính xác suất có điều kiện','Sắp xếp dữ liệu','Mã hóa','Nén ảnh'],a:0,d:3},
 {q:'Dijkstra giải bài toán nào?',o:['Đường đi ngắn nhất (trọng số không âm)','Cây khung nhỏ nhất','Sắp xếp mảng','Tô màu đồ thị'],a:0,d:3},
 {q:'Random Forest thuộc nhóm phương pháp nào?',o:['Ensemble','Phân cụm thuần','Tiền xử lý','Chỉ là KNN'],a:0,d:3},
 {q:'Hệ số Gini dùng để đo?',o:['Độ bất bình đẳng','Nhiệt độ','Tốc độ','Độ sáng'],a:0,d:3}
];
const Qstate={used:[]};

/* ============ MAPS (ngẫu nhiên mỗi vòng) ============ */
const MAPS=CONTENT.maps;
const STARS=Array.from({length:80},()=>({x:Math.random()*W,y:Math.random()*H,s:Math.random()*2+.5}));

function drawMap(m,t){drawMap0(m,t);drawMapX(m,t)}
function drawMap0(m,t){
 // nền gradient
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,m.c[0]);g.addColorStop(1,m.c[1]);
 ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.save();
 if(m.id==='lab'){ // Phòng thí nghiệm: tấm kim loại, ống neon, đèn cảnh báo
   ctx.strokeStyle='rgba(148,163,184,.12)';ctx.lineWidth=2;
   for(let x=0;x<W;x+=90){ctx.strokeRect(x+4,20,82,FLOOR-40)}
   const pipes=[[60,0,60,300],[180,120,180,H],[320,0,320,200],[600,0,600,160],[760,0,760,260],[860,90,860,H]];
   pipes.forEach((p,i)=>{ctx.lineWidth=4;ctx.strokeStyle=i%2?'rgba(168,85,247,.35)':'rgba(34,211,238,.35)';ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(p[2],p[3]);ctx.stroke();
     ctx.fillStyle='rgba(34,211,238,.5)';ctx.fillRect(p[0]-3,p[3]-4,6,6)});
   ctx.fillStyle=`rgba(239,68,68,${.15+.1*Math.sin(t*5)})`;ctx.beginPath();ctx.arc(450,40,10,0,7);ctx.fill();
   for(const gx of[90,700]){ctx.strokeStyle='rgba(148,163,184,.25)';ctx.lineWidth=5;ctx.beginPath();ctx.arc(gx,FLOOR-14,24,0,7);ctx.stroke();ctx.lineWidth=2;for(let i=0;i<6;i++){const a=i*Math.PI/3+t*2;ctx.beginPath();ctx.moveTo(gx,FLOOR-14);ctx.lineTo(gx+Math.cos(a)*20,FLOOR-14+Math.sin(a)*20);ctx.stroke()}}
 }
 if(m.id==='temple'){ // Độ kiếp: sương mù, bùa đỏ, âm dương, cột đá
   ctx.fillStyle='rgba(180,200,210,.08)';ctx.fillRect(0,0,W,H);
   for(let i=0;i<4;i++){const cx=((t*12+i*260)%(W+200))-100;ctx.fillStyle='rgba(203,213,225,.07)';ctx.beginPath();ctx.ellipse(cx,120+i*60,160,30,0,0,7);ctx.fill()}
   ctx.fillStyle='#334155';for(let x=0;x<W;x+=120){ctx.fillRect(x+8,FLOOR-190,8,150)}
   const talis=[[90,140],[800,130],[280,260],[640,300]];
   for(const[x,y]of talis){ctx.fillStyle='#fde68a';ctx.fillRect(x-14,y-40,28,80);ctx.strokeStyle='#b91c1c';ctx.lineWidth=3;ctx.strokeRect(x-14,y-40,28,80);ctx.fillStyle='#b91c1c';ctx.fillRect(x-8,y-22,16,4);ctx.fillRect(x-8,y-6,16,4);ctx.fillRect(x-8,y+10,16,4)}
   ctx.save();ctx.translate(760,200);ctx.rotate(t*.5);ctx.fillStyle='#f8fafc';ctx.beginPath();ctx.arc(0,0,30,0,7);ctx.fill();ctx.fillStyle='#0f172a';ctx.beginPath();ctx.arc(0,0,30,Math.PI/2,Math.PI*1.5);ctx.fill();ctx.restore();
   ctx.strokeStyle=`rgba(251,191,36,${.35+.25*Math.sin(t*4)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(450,150,70,0,7);ctx.stroke();
 }
 if(m.id==='dungeon'){ // Hầm ngục: tường gạch, đuốc, xích, lồng sắt
   ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=2;
   for(let y=0;y<H;y+=28)for(let x=((y/28)%2)*36;x<W;x+=72)ctx.strokeRect(x,y,72,28);
   ctx.fillStyle='rgba(20,30,20,.35)';ctx.fillRect(0,0,W,H);
   ctx.strokeStyle='#52525b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(60,0);ctx.lineTo(60,140);ctx.stroke();ctx.beginPath();ctx.moveTo(840,0);ctx.lineTo(840,120);ctx.stroke();
   for(const x of[120,780]){ctx.fillStyle='#78350f';ctx.fillRect(x-3,190,6,40);const fl=Math.sin(t*12+x)*3;ctx.fillStyle='#f97316';ctx.beginPath();ctx.ellipse(x,186+fl*.3,8,14+fl,0,0,7);ctx.fill();
     ctx.fillStyle=`rgba(249,115,22,${.22+.1*Math.sin(t*9+x)})`;ctx.beginPath();ctx.arc(x,200,70,0,7);ctx.fill()}
   ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(0,FLOOR-24,W,24);
 }
 if(m.id==='minimal'){ // Tối giản: khung tương phản cao
   ctx.strokeStyle='rgba(255,255,255,.15)';ctx.lineWidth=1;ctx.strokeRect(WL+6,6,WR-WL-12,FLOOR-6);
 }
 if(m.id==='space'){ // Trạm vũ trụ: sao, hành tinh
   ctx.fillStyle='#fff';
   for(const s of STARS){ctx.globalAlpha=.4+.6*Math.abs(Math.sin(t+s.x));ctx.fillRect(s.x,s.y,s.s,s.s)}
   ctx.globalAlpha=1;
   const pg=ctx.createRadialGradient(780,110,10,780,110,70);pg.addColorStop(0,'#f0abfc');pg.addColorStop(1,'#4c1d95');
   ctx.fillStyle=pg;ctx.beginPath();ctx.arc(780,110,60,0,7);ctx.fill();
   ctx.strokeStyle='rgba(216,180,254,.5)';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(780,110,90,14,-.3,0,7);ctx.stroke();
 }
 ctx.restore();
 // vignette
 const v=ctx.createRadialGradient(W/2,H/2,H*.4,W/2,H/2,W*.65);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.45)');
 ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
 // sàn, tường, trần
 ctx.fillStyle=m.fl;ctx.fillRect(0,FLOOR,W,H-FLOOR);if(!P.inf){ctx.fillRect(0,0,WL,H);ctx.fillRect(WR,0,W-WR,H)}
 ctx.fillStyle='rgba(255,255,255,.05)';for(let x=WL;x<WR;x+=40)ctx.fillRect(x,FLOOR+8,1,H-FLOOR);
 ctx.fillStyle=m.acc;ctx.fillRect(0,FLOOR,W,3);if(!P.inf){ctx.fillRect(WL-2,0,2,H);ctx.fillRect(WR,0,2,H)}
 for(const[x,y,w]of m.plat){ctx.shadowColor=m.acc;ctx.shadowBlur=10;ctx.fillStyle=m.acc;ctx.fillRect(x,y,w,6);ctx.shadowBlur=0}
}

/* ============ GAME STATE ============ */
const P={x:450,y:FLOOR,vx:0,vy:0,face:1,cr:false,gnd:true,jumps:1,maxJ:1,dash:0,dashCD:0,hasDash:false,inv:0,para:0,frozen:0,slow:0,poison:[],pt:0,scale:1,shrinks:0,speedM:1,jumpM:1,shield:0,dot:false,walk:0};
const G={mode:'menu',round:1,t:0,hp:30,map:MAPS[0],bulletM:1,healPerQ:1,imm:{},corrects:0,storm:0,stormCD:0,timeLeft:20,spawnT:.6,bullets:[],parts:[],texts:[],flash:0,shake:0,banner:null,bannerT:0,best:0};
const Q={kind:'',n:0,cur:null};
const K={l:false,r:false,d:false,u:false,ju:false,jd:false};
let jumpPressed=false,dashPressed=false;
const pw=()=>28*P.scale, ph=()=>(P.cr?28:56)*P.scale;

function drawMapX(m,t){
 const im=MAPIMG[m.id];if(!im)return;
 if(im.complete&&im.naturalWidth){
  const sc=Math.max(FLOOR/im.naturalHeight,W/im.naturalWidth),vw=W/sc,vh=FLOOR/sc,sx=(im.naturalWidth-vw)*(.5+.5*Math.sin(t*.06));
  ctx.drawImage(im,sx,im.naturalHeight-vh,vw,vh,0,0,W,FLOOR);
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(0,0,W,FLOOR);
  mapPlats(m,t);
 }
 mapFx(m,t);
 if(m.id==='ice'){ctx.fillStyle='rgba(255,255,255,.8)';for(const s of STARS){const x=(s.x+t*(40+s.s*30)+Math.sin(t+s.y)*14)%W,y=(s.y+t*(50+s.s*40))%FLOOR;ctx.fillRect(x,y,s.s+.5,s.s+.5)}}
 if(m.id==='casino'){const w=G.wh,sp=w&&w.k?t*9:t*.8,cx=W/2,cy=38,R=24,col=['#dc2626','#fbbf24','#16a34a','#2563eb','#a855f7','#f97316'];
  ctx.save();ctx.translate(cx,cy);ctx.rotate(sp);for(let i=0;i<6;i++){ctx.fillStyle=col[i];ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R,i*Math.PI/3,(i+1)*Math.PI/3);ctx.fill()}ctx.restore();
  ctx.strokeStyle='#fde047';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,R+2,0,7);ctx.stroke();ctx.fillStyle='#fde047';ctx.beginPath();ctx.moveTo(cx-6,cy-R-8);ctx.lineTo(cx+6,cy-R-8);ctx.lineTo(cx,cy-R+4);ctx.fill()}
 if(m.id==='void'&&(G.vtel>0||G.vflip>0)&&G.boss&&!G.boss.dead){const tl=G.vtel>0;ctx.fillStyle=tl?`rgba(244,114,182,${.06+.06*Math.sin(t*20)})`:'rgba(124,58,237,.16)';ctx.fillRect(0,0,W,FLOOR);ctx.fillStyle='rgba(233,213,255,.5)';ctx.font='bold 40px sans-serif';ctx.textAlign='center';for(let i=0;i<5;i++){const yy=((t*(tl?-140:-220)+i*110)%FLOOR+FLOOR)%FLOOR;ctx.fillText('▲',90+i*180,yy)}}
 if(m.id==='void'&&G.gf&&G.gf.k){ctx.fillStyle=G.gf.k==='low'?'rgba(125,211,252,.10)':'rgba(168,85,247,.14)';ctx.fillRect(0,0,W,FLOOR);
  if(G.gf.k==='pull'){ctx.fillStyle='rgba(216,180,254,.5)';ctx.font='bold 40px sans-serif';ctx.textAlign='center';for(let i=0;i<5;i++){const x=((t*160*G.gf.dir+i*180)%W+W)%W;ctx.fillText(G.gf.dir>0?'»':'«',x,260)}}}
}

/* ---- bệ đứng vẽ lại sau ảnh nền (ảnh phủ kín nên bệ phải vẽ sau) + hiệu ứng riêng 3 map mới ---- */
function mapPlats(m,t){
 for(const[x,y,w]of m.plat){
  if(m.id==='bamboo'){ctx.fillStyle='#3f4a3c';ctx.fillRect(x,y-2,w,11);ctx.fillStyle='#6b7a63';ctx.fillRect(x,y-2,w,3);ctx.fillStyle='#1f2a1e';for(let k=18;k<w;k+=34)ctx.fillRect(x+k,y-3,3,13);ctx.fillStyle='#b91c1c';ctx.beginPath();ctx.moveTo(x+w*.3,y-2);ctx.lineTo(x+w*.3+12,y-9);ctx.lineTo(x+w*.3+18,y-2);ctx.fill()}
  else if(m.id==='woods'){ctx.shadowColor='#2dd4bf';ctx.shadowBlur=12;ctx.fillStyle='#14b8a6';ctx.beginPath();ctx.ellipse(x+w/2,y+3,w/2,6,0,0,7);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#5eead4';ctx.fillRect(x+6,y,w-12,2)}
  else{ctx.shadowColor=m.acc;ctx.shadowBlur=10;ctx.fillStyle=m.acc;ctx.fillRect(x,y,w,6);ctx.shadowBlur=0}
 }
}
function mapFx(m,t){
 const cur=G.map===m,S=cur?G.mp:null;
 if(m.id==='woods'){
  ctx.save();
  for(let i=0;i<26;i++){const x=(i*97+Math.sin(t*.5+i)*30)%W,y=60+((i*53)%330)+Math.sin(t*.8+i*1.7)*16,a=.35+.55*Math.abs(Math.sin(t*1.3+i));ctx.globalAlpha=a;ctx.shadowColor='#fde047';ctx.shadowBlur=8;ctx.fillStyle='#fef08a';ctx.fillRect(x,y,2.5,2.5)}
  ctx.restore();
  for(const[px,py,pw2]of m.pads||[]){const sq=cur&&P.padT>0?.55:1,cx=px+pw2/2,c1=((px>450)?'#c084fc':'#22d3ee');
   ctx.fillStyle='#134e4a';ctx.fillRect(cx-6,py+4,12,FLOOR-py-4);
   ctx.shadowColor=c1;ctx.shadowBlur=16;ctx.fillStyle=c1;ctx.beginPath();ctx.ellipse(cx,py+2,pw2/2,11*sq,0,Math.PI,0);ctx.fill();ctx.shadowBlur=0;
   ctx.fillStyle='rgba(255,255,255,.55)';for(let k=-1;k<=1;k++){ctx.beginPath();ctx.arc(cx+k*pw2*.24,py-4*sq,3,0,7);ctx.fill()}
   ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(px+4,py+1,pw2-8,3)}
  if(S&&S.pol)for(const q of S.pol){ctx.save();ctx.shadowColor=q.c?'#c084fc':'#fde047';ctx.shadowBlur=10;ctx.fillStyle=q.c?'#d8b4fe':'#fef08a';ctx.beginPath();ctx.arc(q.x,q.y,5,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(q.x,q.y,2,0,7);ctx.fill();ctx.restore()}
 }else if(m.id==='cityz'){
  if(cur){
   if(S&&S.el!==undefined&&S.el<1.9){ctx.fillStyle=`rgba(239,68,68,${.07+.09*Math.max(0,Math.sin(S.el*18))})`;ctx.fillRect(0,0,W,FLOOR)}
   for(const k of G.blocks||[]){
    const x0=k.x-k.w/2;
    if(k.st==='tel'){const a=.4+.4*Math.sin(G.t*28);ctx.save();ctx.strokeStyle=`rgba(248,113,113,${a})`;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(k.x,FLOOR-2,k.w/2+12,8,0,0,7);ctx.stroke();ctx.setLineDash([6,8]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(k.x,0);ctx.lineTo(k.x,FLOOR-8);ctx.stroke();ctx.restore();continue}
    const top=k.y-k.h;ctx.save();if(k.st==='land'&&k.life<1)ctx.globalAlpha=.4+.4*Math.abs(Math.sin(G.t*20));
    if(k.car){ctx.fillStyle='#57534e';ctx.fillRect(x0,top+k.h*.35,k.w,k.h*.65);ctx.fillStyle='#78716c';ctx.fillRect(x0+k.w*.15,top,k.w*.7,k.h*.4);ctx.fillStyle='#1c1917';ctx.fillRect(x0+k.w*.22,top+3,k.w*.56,k.h*.22);ctx.beginPath();ctx.arc(x0+k.w*.2,k.y,6,0,7);ctx.arc(x0+k.w*.8,k.y,6,0,7);ctx.fill()}
    else{ctx.fillStyle='#78716c';ctx.fillRect(x0,top,k.w,k.h);ctx.fillStyle='#a8a29e';ctx.fillRect(x0,top,k.w,5);ctx.fillStyle='#44403c';ctx.fillRect(x0+k.w*.3,top+10,3,k.h-10);ctx.fillRect(x0+k.w*.65,top+6,2,k.h-6);ctx.strokeStyle='#92400e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0+k.w*.2,top);ctx.lineTo(x0+k.w*.12,top-9);ctx.moveTo(x0+k.w*.8,top);ctx.lineTo(x0+k.w*.88,top-8);ctx.stroke()}
    ctx.restore()}
  }
  ctx.fillStyle=Math.sin(t*5)>0?'rgba(239,68,68,.9)':'rgba(120,20,20,.6)';ctx.fillRect(m.id==='cityz'?893:0,50,3,3);
 }else if(m.id==='bamboo'){
  ctx.save();ctx.fillStyle='#b91c1c';
  for(let i=0;i<14;i++){const x=((i*131+t*(14+i%4*6))%(W+40))-20,y=((i*71+t*(26+i%3*10))%FLOOR);ctx.save();ctx.translate(x,y);ctx.rotate(t*.8+i);ctx.globalAlpha=.8;ctx.beginPath();ctx.ellipse(0,0,6,2.2,0,0,7);ctx.fill();ctx.restore()}
  ctx.restore();
  if(S&&S.t>0){ctx.strokeStyle='rgba(30,30,30,.22)';ctx.lineWidth=1.5;for(let i=0;i<9;i++){const y=40+i*48,x=((t*520*S.dir+i*210)%(W+240)+W+240)%(W+240)-120;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+S.dir*90,y+rnd(-3,3));ctx.stroke()}
   for(const l of S.lv){ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.r);ctx.fillStyle='#b91c1c';ctx.beginPath();ctx.ellipse(0,0,8,2.6,0,0,7);ctx.fill();ctx.restore()}}
 }
}
/* ============ BULLET TYPES ============ */
const BT={
 rain:{min:1,wt:10,c:'#67e8f9',sh:'streak',mk:()=>({x:rnd(WL+10,WR-10),y:-10,vx:0,vy:rnd(300,380),r:5})},
 high:{min:1,wt:6,c:'#f87171',sh:'bar',mk:()=>{const L=Math.random()<.5;return{x:L?WL:WR,y:FLOOR-40,vx:L?400:-400,vy:0,r:8}}},
 roller:{min:1,wt:6,c:'#fb923c',sh:'bar',mk:()=>{const L=Math.random()<.5;return{x:L?WL:WR,y:FLOOR-7,vx:L?330:-330,vy:0,r:7}}},
 sine:{min:2,wt:6,c:'#c084fc',sh:'circle',trail:1,mk:()=>{const L=Math.random()<.5,y=rnd(180,380);return{x:L?WL:WR,y,by:y,vx:L?240:-240,vy:0,r:8,t:0}},
   up:(b,dt)=>{b.t+=dt;b.x+=b.vx*dt;b.y=b.by+Math.sin(b.t*4)*60}},
 orb:{min:2,wt:5,c:'#fde047',sh:'glow',mk:()=>({x:rnd(200,700),y:rnd(80,300),vx:pick([-260,260]),vy:rnd(-200,200),r:10,bounce:6}),
   up:(b,dt)=>{b.x+=b.vx*dt;b.y+=b.vy*dt;
     if(b.x<WL+b.r||b.x>WR-b.r){b.vx*=-1;b.bounce--;b.x=clamp(b.x,WL+b.r,WR-b.r)}
     if(b.y<b.r||b.y>FLOOR-b.r){b.vy*=-1;b.bounce--;b.y=clamp(b.y,b.r,FLOOR-b.r)}
     if(b.bounce<0)b.dead=true}},
 homing:{min:3,wt:3,c:'#f472b6',sh:'missile',trail:1,mk:()=>({x:rnd(100,800),y:-10,vx:0,vy:150,r:8,age:0}),
   up:(b,dt)=>{b.age+=dt;const dx=P.x-b.x,dy=(P.y-ph()/2)-b.y,d=Math.hypot(dx,dy)||1;
     b.vx+=(dx/d*260-b.vx)*dt*2;b.vy+=(dy/d*260-b.vy)*dt*2;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.age>3.5)b.dead=true}},
 burst:{min:3,wt:3,c:'#fca5a5',sh:'star',mk:()=>({x:rnd(150,750),y:-10,vx:0,vy:320,r:7}),
   up:(b,dt,out)=>{b.x+=b.vx*dt;b.y+=b.vy*dt;
     if(b.y>130){b.dead=true;for(let i=0;i<7;i++){const a=Math.PI/2+(i-3)*.28;out.push({type:'ray',x:b.x,y:b.y,vx:Math.cos(a)*280,vy:Math.sin(a)*280,r:6})}}}},
 splitter:{min:3,wt:3,c:'#4ade80',sh:'circle',mk:()=>{const L=Math.random()<.5;return{x:L?WL:WR,y:rnd(200,380),vx:L?320:-320,vy:0,r:10,age:0}},
   up:(b,dt,out)=>{b.age+=dt;b.x+=b.vx*dt;
     if((b.vx>0&&b.x>=WL+(WR-WL)*.35+ (WR-WL)*.25)||(b.vx<0&&b.x<=WR-(WR-WL)*.6)||b.age>1){
       b.dead=true;for(let i=0;i<5;i++){const a=rnd(0,Math.PI*2);out.push({type:'frag',x:b.x,y:b.y,vx:Math.cos(a)*220,vy:Math.sin(a)*220,r:5})}}}},
 gravity:{min:4,wt:3,c:'#60a5fa',sh:'diamond',mk:()=>({x:rnd(150,750),y:50,vx:rnd(-260,260),vy:0,r:9,fall:false}),
   up:(b,dt)=>{if(!b.fall){b.x+=b.vx*dt;if(b.x<WL+10)b.vx=Math.abs(b.vx);if(b.x>WR-10)b.vx=-Math.abs(b.vx);
       if(Math.abs(b.x-P.x)<14){b.fall=true;b.vy=350}}
     else{b.vy+=200*dt;b.y+=b.vy*dt}
     if(b.y>H+20)b.dead=true}},
 laser:{min:4,wt:2,c:'#ef4444',sh:'laser',mk:()=>{const L=Math.random()<.5;return{x:L?WL:WR,y:0,vx:L?250:-250,vy:0,r:0,gap:rnd(100,360)}},
   up:(b,dt)=>{b.x+=b.vx*dt;if(b.x<-20||b.x>W+20)b.dead=true}},
 spike:{min:5,wt:3,c:'#e5e7eb',sh:'spike',mk:()=>({x:rnd(120,780),y:FLOOR,vx:0,vy:0,r:0,t:0}),
   up:(b,dt)=>{b.t+=dt;if(b.t>1.6)b.dead=true}},
 bomb:{min:5,wt:3,c:'#374151',sh:'bomb',mk:()=>({x:rnd(150,750),y:-10,vx:rnd(-80,80),vy:100,r:12,age:0,boom:0}),
   up:(b,dt)=>{if(b.boom>0){b.boom-=dt;if(b.boom<=0)b.dead=true;return}
     b.age+=dt;b.vy+=500*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
     if(b.y>=FLOOR-b.r||b.age>3){b.boom=.35;b.y=Math.min(b.y,FLOOR-b.r);b.noHit=true;explodeAt(b.x,b.y,110,'bomb')}}},
 chain:{min:5,wt:4,c:'#38bdf8',sh:'arc',mk:()=>({x:WL+5,y:rnd(150,380),vx:200,vy:0,r:11,age:0,boom:0}),
   up:(b,dt)=>{if(b.boom>0){b.boom-=dt;if(b.boom<=0)b.dead=true;return}
     b.age+=dt;b.x+=b.vx*dt;if(b.x>WR){b.vx=-Math.abs(b.vx)}if(b.x<WL){b.vx=Math.abs(b.vx)}
     if(Math.hypot(P.x-b.x,(P.y-ph()/2)-b.y)<30||b.age>2.6){b.boom=.35;b.noHit=true;explodeAt(b.x,b.y,110,'elec')}}},
 frost:{min:6,wt:4,c:'#e0f2fe',sh:'snow',trail:1,mk:()=>({x:rnd(WL+20,WR-20),y:-10,vx:rnd(-120,120),vy:200,r:9}),
   up:(b,dt,out)=>{b.x+=Math.sin(b.y/40)*40*dt;if(G.boss&&G.boss.d.ai==='yuki')b.x+=b.vx*dt;if(G.boss&&!G.boss.dead&&G.boss.d.ai==='yuki'&&(b.x<WL+b.r||b.x>WR-b.r)&&!b.split){b.split=1;b.dead=true;for(const q of[Math.PI/4,3*Math.PI/4,-Math.PI/4,-3*Math.PI/4])out.push({type:'bshot',x:clamp(b.x,WL+10,WR-10),y:b.y,vx:Math.cos(q)*240,vy:Math.sin(q)*240,r:7});burstParts(clamp(b.x,WL+10,WR-10),b.y,'#e0f2fe',8)}}},
 venom:{min:6,wt:4,c:'#22c55e',sh:'circle',mk:()=>{const L=Math.random()<.5;return{x:L?WL:WR,y:FLOOR-rnd(20,120),vx:L?140:-140,vy:0,r:11}}},
 freeze:{min:7,wt:3,c:'#67e8f9',sh:'diamond',mk:()=>{const L=Math.random()<.5;return{x:L?WL:WR,y:rnd(200,400),vx:L?520:-520,vy:0,r:8}}},
 blackhole:{min:7,wt:2,c:'#7c3aed',sh:'hole',noHit:true,mk:()=>({x:rnd(220,680),y:rnd(180,380),vx:0,vy:0,r:30,age:0}),
   up:(b,dt)=>{b.age+=dt;if(b.age>4.5)b.dead=true;
     if(!G.imm.gravity){const dx=b.x-P.x;if(Math.abs(dx)<300)P.x+=clamp(dx*1.4,-260,260)*dt}}},
 accel:{min:7,wt:3,c:'#fb7185',sh:'tri',mk:()=>{const L=Math.random()<.5;return{x:L?WL:WR,y:rnd(250,400),vx:L?40:-40,vy:0,r:9,age:0}},
   up:(b,dt)=>{b.age+=dt;if(b.age>1)b.vx=Math.sign(b.vx||1)*700;b.x+=b.vx*dt;if(b.x<-30||b.x>W+30)b.dead=true}},
 phantom:{min:6,wt:3,c:'#e2e8f0',sh:'circle',alpha:.08,mk:()=>{const L=Math.random()<.5;return{x:L?WL:WR,y:rnd(150,430),vx:L?380:-380,vy:0,r:9}}},
 expanding:{min:6,wt:3,c:'#f0abfc',sh:'circle',mk:()=>({x:rnd(200,700),y:-10,vx:0,vy:180,r:4,age:0}),
   up:(b,dt)=>{b.age+=dt;b.r=4+Math.min(11,b.age*8);b.y+=b.vy*dt;if(b.y>H)b.dead=true}},
 portal:{min:8,wt:3,c:'#2dd4bf',sh:'ring',trail:1,mk:()=>{const L=Math.random()<.5;return{x:L?WL+5:WR-5,y:rnd(200,400),vx:L?300:-300,vy:0,r:9,age:0}},
   up:(b,dt)=>{b.age+=dt;b.x+=b.vx*dt;if(b.x<WL-8)b.x=WR-10;if(b.x>WR+8)b.x=WL+10;if(b.age>6)b.dead=true}},
  bshot:{at:99,wt:0,c:'#f43f5e',trail:1,sh:'circle'},
  sinfire:{at:99,wt:0,c:'#f0abfc',trail:1,sh:'circle'},
  yukibloom:{at:99,wt:0,c:'#e0f2fe',sh:'circle',up:(b,dt)=>{b.age+=dt;b.life-=dt;if(b.life<=0){b.dead=true;return}
    const g=G.gust,w=g&&g.k==='blow'?g.dir*190:0;
    if(b.age<1){b.x+=(b.tx-b.x)*Math.min(1,3*dt);b.y+=(b.ty-b.y)*Math.min(1,3*dt)}
    else{b.x+=(w+Math.sin(b.age*.9+b.ph)*14)*dt;b.y=b.ty+Math.sin(b.age*1.4+b.ph)*10}}},
  yukiicicle:{at:99,wt:0,c:'#bae6fd',sh:'circle',up:(b,dt,out)=>{b.age+=dt;
    if(!b.fall){if(b.age>=b.tel){b.fall=true;b.vy=120}}
    else{b.vy+=1600*dt;b.y+=b.vy*dt;if(b.y>=FLOOR-6){b.dead=true;burstParts(b.x,FLOOR,'#bae6fd',10);for(const d of[-1,1])out.push({type:'yukishard',x:b.x,y:FLOOR-8,vx:d*300,vy:0,r:8,age:0})}}}},
  yukishard:{at:99,wt:0,c:'#7dd3fc',trail:1,sh:'circle'},
  svacid:{at:99,wt:0,c:'#84cc16',trail:1,sh:'circle',up:(b,dt)=>{b.age+=dt;b.vy+=900*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.y>FLOOR-b.r&&b.vy>0){b.y=FLOOR-b.r;b.vy=-690;b.bn++;burstParts(b.x,FLOOR,'#a3e635',6);beep(260,.05,.03,'sine');if(b.bn>=b.mx){b.dead=true;burstParts(b.x,FLOOR-6,'#84cc16',12)}}
    if(b.y<34&&b.vy<0){b.y=34;b.vy=Math.abs(b.vy)*.5}
    if(b.x<WL+10&&b.vx<0)b.vx=-b.vx;else if(b.x>WR-10&&b.vx>0)b.vx=-b.vx}},
  svpod:{at:99,wt:0,c:'#a3e635',sh:'circle',noHit:true,up:(b,dt,out)=>{b.age+=dt;b.y+=(b.ty-b.y)*Math.min(1,4*dt);b.x+=(b.tx-b.x)*Math.min(1,3*dt)+Math.sin(b.age*2+b.ph)*12*dt;
    if(b.age>=b.life){b.dead=true;burstParts(b.x,b.y,'#a3e635',14);beep(420,.08,.05,'square');
     const dirs=b.one?[P.x<b.x?-1:1]:[-1,1],sp=270+G.round*9;
     for(const d of dirs)out.push({type:'svlarva',x:b.x,y:b.y,vx:d*sp,vy:0,r:10,age:0})}}},
  svlarva:{at:99,wt:0,c:'#4ade80',sh:'circle',up:(b,dt)=>{b.age+=dt;if(b.y>=FLOOR-b.r-1){b.hopT=(b.hopT===undefined?rnd(.4,.8):b.hopT)-dt;if(b.hopT<=0){b.vy=-520;b.hopT=rnd(.9,1.2)}}if(b.y<FLOOR-b.r){b.vy+=1400*dt;b.y=Math.min(FLOOR-b.r,b.y+b.vy*dt)}else{b.y=FLOOR-b.r;b.vy=0}b.x+=b.vx*dt}},
  svring:{at:99,wt:0,c:'#86efac',sh:'circle',noHit:true,up:(b,dt)=>{b.age+=dt;b.rad+=b.sp*dt;if(b.rad>640){b.dead=true;return}
    if(!b.done&&G.mode==='playing'&&P.inv<=0&&P.ghostT<=0){const px=P.x-b.x,py=P.y-ph()/2-b.y,d=Math.hypot(px,py);
     if(Math.abs(d-b.rad)<10+pw()/4){let da=Math.atan2(py,px)-b.gap;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)>b.gw){b.done=true;hurt(dmgOf(G.round))}}}}},
  sinspike:{at:99,wt:0,c:'#4ade80',trail:1,sh:'circle'},
  sinshard:{at:99,wt:0,c:'#fcd34d',sh:'circle',up:(b,dt)=>{b.age=(b.age||0)+dt;b.x+=b.vx*dt;b.y+=b.vy*dt}},
  sinorb:{at:99,wt:0,c:'#0b0b12',sh:'circle'},
  sinshade:{at:99,wt:0,c:'#14532d',sh:'circle',up:(b,dt)=>{b.life-=dt;if(b.life<=0){b.dead=true;return}const h=G.hist,tt=G.t-b.lag;let e=null;for(let i=h.length-1;i>=0;i--)if(h[i].t<=tt){e=h[i];break}if(e){b.x=e.x;b.y=e.y-26}}},
  bghost:{at:99,wt:0,c:'#e5e7eb',alpha:.18,sh:'circle',up:(b,dt,out)=>{b.age+=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
    if((G.round>=6||(G.boss&&(G.boss.pz||1)>=2))&&!b.sp&&b.age>.55){b.sp=1;const a=Math.atan2(b.vy,b.vx),v=Math.hypot(b.vx,b.vy);b.vx=Math.cos(a+.35)*v;b.vy=Math.sin(a+.35)*v;out.push({type:'bghost',x:b.x,y:b.y,vx:Math.cos(a-.35)*v,vy:Math.sin(a-.35)*v,r:10,s:b.s,age:1,sp:1})}}},
  bswell:{at:99,wt:0,c:'#e2e8f0',sh:'circle',up:(b,dt)=>{b.age+=dt;const tel=b.tel||.9;b.noHit=b.age<tel;if(b.age>=tel)b.r=Math.min(b.mx,6+(b.age-tel)*(b.gs||70));if(b.age>tel+1.7)b.dead=true}},
  bbounce:{at:99,wt:0,c:'#22d3ee',sh:'circle',trail:1,up:(b,dt)=>{b.age+=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;const hw=Math.min(430,polyHW(b.y)),l=450-hw,rr=450+hw;
    if(b.x<l+b.r){b.x=l+b.r;b.vx=Math.abs(b.vx)}if(b.x>rr-b.r){b.x=rr-b.r;b.vx=-Math.abs(b.vx)}
    if(b.y<b.r){b.y=b.r;b.vy=Math.abs(b.vy)}if(b.y>FLOOR-b.r){b.y=FLOOR-b.r;b.vy=-Math.abs(b.vy)}if(b.age>6)b.dead=true}},
  cardlaser:{at:99,wt:0,c:'#22d3ee',sh:'cardlaser',mk:()=>({x:0,y:0,vx:0,vy:0,r:8,rot:0}),up:(b,dt)=>{b.x+=b.vx*dt;b.y+=b.vy*dt;b.rot+=dt*16}},
  boomerang:{at:99,wt:0,c:'#fde047',sh:'boomerang',mk:()=>({x:0,y:190,vx:380,vy:0,r:18,rot:0,bounced:false}),up:(b,dt)=>{b.x+=b.vx*dt;b.rot+=dt*20;if(b.x<WL+b.r||b.x>WR-b.r){b.x=clamp(b.x,WL+b.r,WR-b.r);if(b.bounced){b.dead=true;return}b.bounced=true;b.vx*=-1;b.y=FLOOR-b.r-14;burstParts(b.x,b.y,'#fde047',8)}}},
  diceray:{at:99,wt:0,c:'#f87171',sh:'diceray',mk:()=>({x:0,y:0,vx:0,vy:0,r:6}),up:(b,dt)=>{b.x+=b.vx*dt;b.y+=b.vy*dt}},
  zegg:{at:99,wt:0,c:'#84cc16',sh:'circle',noHit:true,up:(b,dt,out)=>{b.age+=dt;if(b.age>=1.4){b.dead=true;out.push({type:b.hatch,x:b.x,y:FLOOR-14,vx:0,vy:0,r:14,age:0,sp:60,life:14,hopT:rnd(.5,1),hp:b.hatch==='zdreg'?2:1});burstParts(b.x,FLOOR-14,'#84cc16',10)}}},
  zdreg:{at:99,wt:0,c:'#64748b',sh:'circle',up:(b,dt)=>{b.age+=dt;b.x+=Math.sign(P.x-b.x)*(b.sp||60)*dt;b.y=FLOOR-b.r;if(b.age>(b.life||14))b.dead=true}},
  ztank:{at:99,wt:0,c:'#4d7c0f',sh:'circle',up:(b,dt)=>{b.age+=dt;b.x+=Math.sign(P.x-b.x)*(b.sp||40)*dt;b.y=FLOOR-b.r;if(b.age>(b.life||16))b.dead=true}},
  zbounce:{at:99,wt:0,c:'#a3e635',sh:'circle',up:(b,dt)=>{b.age+=dt;b.hopT-=dt;b.x+=Math.sign(P.x-b.x)*(b.sp||110)*dt;if(b.y>=FLOOR-b.r-1&&b.hopT<=0){b.vy=-430;b.hopT=b.evo?.7:1.1}b.vy=(b.vy||0)+1200*dt;b.y+=b.vy*dt;if(b.y>FLOOR-b.r){b.y=FLOOR-b.r;b.vy=0}if(b.age>12)b.dead=true}},
  spore:{at:99,wt:0,c:'#a3e635',sh:'circle',up:(b,dt)=>{b.age+=dt;b.vy=Math.min(240,(b.vy||0)+260*dt);b.y+=b.vy*dt;if(b.y>FLOOR-14||b.age>5)b.dead=true}},
  zgol:{at:99,wt:0,c:'#365314',sh:'circle',up:(b,dt,out)=>{b.age+=dt;b.x+=Math.sign(P.x-b.x)*(b.sp||25)*dt;b.y=FLOOR-b.r;b.sweepT=(b.sweepT===undefined?3.5:b.sweepT)-dt;if(b.sweepT<=0){b.sweepT=4.5;out.push({type:'gsweep',x:b.x,y:FLOOR-26,vx:Math.sign(P.x-b.x||1)*420,vy:0,r:14,age:0})}}},
  gsweep:{at:99,wt:0,c:'#4d7c0f',sh:'circle',up:(b,dt)=>{b.age+=dt;b.x+=b.vx*dt;if(b.age>1.6||b.x<WL-40||b.x>WR+40)b.dead=true}},
  brood:{at:99,wt:0,c:'#7e22ce',sh:'circle',up:(b,dt,out)=>{b.age+=dt;b.y=FLOOR-b.r;b.spT=(b.spT===undefined?4:b.spT)-dt;if(b.spT<=0){b.spT=5;out.push({type:'zdreg',x:b.x,y:FLOOR-14,vx:0,vy:0,r:14,age:0,sp:60,life:14,hp:2})}}},
  card:{at:2,maps:['casino'],wt:5,c:'#f8fafc',sh:'card',mk:()=>({x:WL,y:300,vx:340,vy:0,r:9,rot:0,red:Math.random()<.5}),up:(b,dt)=>{b.x+=b.vx*dt;b.y+=b.vy*dt;b.rot+=dt*13}},
  dice:{at:2,maps:['casino'],wt:4,c:'#f1f5f9',sh:'dice',mk:()=>({x:rnd(150,750),y:-10,vx:rnd(-90,90),vy:120,r:11,rot:0,n:0,v:1+Math.floor(Math.random()*6)}),
    up:(b,dt,out)=>{b.vy+=1000*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.rot+=b.vx*dt*.02+dt*4;
      if(b.x<WL+b.r||b.x>WR-b.r){b.vx*=-1;b.x=clamp(b.x,WL+b.r,WR-b.r)}
      if(b.y>=FLOOR-b.r){b.y=FLOOR-b.r;b.vy=-rnd(380,520);b.vx=rnd(-300,300);b.v=1+Math.floor(Math.random()*6);b.n++;burstParts(b.x,FLOOR,'#f1f5f9',6);if(b.n>=3){b.dead=true;diceFire(b,out)}}}},
  coin:{at:3,maps:['casino'],wt:4,c:'#facc15',sh:'coin',mk:()=>({x:rnd(WL+20,WR-20),y:-10,vx:0,vy:340,r:7,ph:Math.random()*6})},
  icicle:{at:2,maps:['ice'],wt:5,c:'#bae6fd',sh:'icicle',mk:()=>({x:rnd(100,800),y:28,vx:0,vy:0,r:10,fall:false,age:0}),
    up:(b,dt)=>{b.age+=dt;if(!b.fall){if(Math.abs(b.x-P.x)<46||b.age>4.5){b.fall=true;b.vy=80}}else{b.vy+=1500*dt;b.y+=b.vy*dt;if(b.y>FLOOR){b.dead=true;burstParts(b.x,FLOOR,'#bae6fd',10)}}}},
  /* ---- đạn mới ---- */
  bouncer:{wt:5,c:'#a3e635',sh:'bouncer',mk:()=>{const L=Math.random()<.5;return{x:L?WL:WR,y:rnd(150,300),vx:L?270:-270,vy:0,r:10}},
    up:(b,dt)=>{b.vy+=900*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.y>FLOOR-b.r){b.y=FLOOR-b.r;b.vy=-Math.max(430,Math.abs(b.vy)*.9)}}},
  boomerang:{wt:4,c:'#38bdf8',sh:'boomerang',mk:()=>{const L=Math.random()<.5;return{x:L?WL:WR,y:rnd(200,430),vx:L?430:-430,vy:0,r:11}},
    up:(b,dt)=>{if(!b.ac){b.ac=b.vx*b.vx/700;b.dir=Math.sign(b.vx)}b.vx-=b.dir*b.ac*dt;b.x+=b.vx*dt}},
  shock:{wt:4,c:'#fbbf24',sh:'shock',mk:()=>{const L=Math.random()<.5;return{x:L?WL:WR,y:FLOOR-16,vx:L?330:-330,vy:0,r:15}}},
  meteor:{wt:3,c:'#bae6fd',sh:'comet',mk:()=>({x:0,y:0,vx:0,vy:0,r:8})},
  stalac:{wt:3,c:'#d4d4d8',sh:'stalac',mk:()=>({x:clamp(P.x+rnd(-220,220),WL+20,WR-20),y:14,vx:0,vy:0,r:12,tel:.9}),
    up:(b,dt)=>{if(b.tel>0){b.tel-=dt;b.y=14;return}b.vy+=1500*dt;b.y+=b.vy*dt;if(b.y>FLOOR-8){b.dead=true;burstParts(b.x,FLOOR,'#a1a1aa',10)}}},
  boulder:{wt:3,c:'#78716c',sh:'boulder',noHit:true,mk:()=>{const L=Math.random()<.5;return{x:L?WL-20:WR+20,y:FLOOR-27,vx:L?170:-170,vy:0,r:27,rot:0}},
    up:(b,dt)=>{b.x+=b.vx*dt;b.rot+=b.vx*dt/27;
      if(circRect(b)){P.x=clamp(P.x+b.vx*dt*1.15,WL+pw()/2,WR-pw()/2);contDmg(Math.max(1,dmgOf(G.round)>>1),.6)}}},
  beam:{wt:3,c:'#f43f5e',sh:'beam',noHit:true,mk:()=>({x:W/2,y:pick([FLOOR-18,FLOOR-48]),vx:0,vy:0,r:0,age:0}),
    up:(b,dt)=>{b.age+=dt;if(b.age>1.9){b.dead=true;return}
      if(b.age>1.2&&b.age<1.75&&P.y-ph()<b.y+8&&P.y>b.y-8)contDmg(dmgOf(G.round),.8)}},
  pendulum:{wt:2,c:'#94a3b8',sh:'pend',noHit:false,mk:()=>({x:450,y:0,vx:0,vy:0,r:17,px:rnd(250,650),py:0,len:rnd(390,440),t:0,amp:.78,f:1.9*Math.min(1,speedOf(G.round)+.2)}),
    up:(b,dt)=>{b.t+=dt;const a=b.amp*Math.cos(b.t*b.f);b.x=b.px+Math.sin(a)*b.len;b.y=b.py+Math.cos(a)*b.len;if(b.t>5.5)b.dead=true}},
  mine:{wt:3,c:'#f97316',sh:'mine',noHit:true,mk:()=>({x:rnd(100,800),y:FLOOR-8,vx:0,vy:0,r:10,age:0}),
    up:(b,dt)=>{b.age+=dt;
      if(b.boom>0){b.boom-=dt;if(b.boom<=0)b.dead=true;return}
      if(b.fuse===undefined&&b.age>.9&&Math.abs(P.x-b.x)<95)b.fuse=.6;
      if(b.fuse===undefined&&b.age>7)b.fuse=.2;
      if(b.fuse!==undefined){b.fuse-=dt;if(b.fuse<=0){b.boom=.3;explodeAt(b.x,b.y,90,'mine')}}}},
  sniper:{wt:2,c:'#f87171',sh:'sniper',noHit:true,mk:()=>({x:P.x,y:FLOOR,vx:0,vy:0,r:0,age:0}),
    up:(b,dt)=>{b.age+=dt;
      if(b.age<1.1)b.x+=clamp(P.x-b.x,-260*dt,260*dt);
      if(b.age>1.6&&b.age<1.95&&!b.hit&&Math.abs(P.x-b.x)<22+pw()/2){b.hit=1;hurt(dmgOf(G.round))}
      if(b.age>2.1)b.dead=true}},
  bolt:{wt:2,c:'#fde047',sh:'bolt',noHit:true,mk:()=>{const x0=rnd(120,780),x1=clamp(x0+rnd(-160,160),60,840),n=9,pts=[];
      for(let i=0;i<=n;i++){const t=i/n;pts.push([x0+(x1-x0)*t+(i&&i<n?rnd(-26,26):0),FLOOR*t])}
      return{x:x0,y:0,vx:0,vy:0,r:0,age:0,pts}},
    up:(b,dt)=>{b.age+=dt;if(b.age>1.5){b.dead=true;return}
      if(b.age>1.1&&b.age<1.4&&boltHit(b)){contDmg(dmgOf(G.round),.8);if((G.paraCD||0)<=0){G.paraCD=2.5;P.frozen=Math.max(P.frozen||0,.6)}popText('⚡ Tê liệt',P.x,P.y-ph()-30,'#fde047')}}},
  nova:{wt:2,c:'#fb7185',sh:'nova',noHit:true,mk:()=>({x:rnd(220,680),y:rnd(110,300),vx:0,vy:0,r:14,age:0,waves:2,next:1.1,rot:rnd(0,6)}),
    up:(b,dt,out)=>{b.age+=dt;
      if(b.age>=b.next){const n=12+Math.min(8,G.round>>1),sp=175*Math.min(1.05,speedOf(G.round)+.05);
        for(let i=0;i<n;i++){const a=b.rot+i*Math.PI*2/n;out.push({type:'nshot',x:b.x,y:b.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:6})}
        b.rot+=Math.PI/n;b.waves--;b.next+=.85;beep(520,.1,.04);if(b.waves<=0)b.dead=true}}},
  nshot:{min:99,wt:0,c:'#fb7185',sh:'nshot'},
  doom:{min:99,wt:0,c:'#fb923c',sh:'doom',noHit:true,up:(b,dt)=>{b.y+=b.vy*dt;if(b.y>FLOOR){b.dead=true;burstParts(b.x,FLOOR,'#fb923c',3)}}},
  firezone:{min:99,wt:0,c:'#f97316',sh:'fire',
    up:(b,dt)=>{b.age+=dt;if(b.age>3)b.dead=true;
      if(b.age>.15&&Math.abs(P.x-b.x)<70+pw()/2&&P.y>FLOOR-38)contDmg(Math.max(1,dmgOf(G.round)>>1),.7)}},
  // loại phụ sinh ra từ đạn khác (không xuất hiện ngẫu nhiên)
 heart:{min:99,wt:0,c:'#f472b6',sh:'heart'},
  /* --- Truy Phong Đao Khách (chỉ boss gọi ra) --- */
  bwave:{at:99,wt:0,c:'#b91c1c',sh:'bwave',noHit:true,
    up:(b,dt)=>{b.x+=b.vx*dt;b.age+=dt;
      if(P.x+pw()/2>b.x-b.hw&&P.x-pw()/2<b.x+b.hw&&P.y-ph()<b.y+b.hh&&P.y>b.y-b.hh){b.dead=true;hurt(b.dmg)}}},
  bfish:{at:99,wt:0,c:'#b91c1c',sh:'bfish',noHit:true,
    up:(b,dt)=>{b.vy+=700*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.y>FLOOR+6){b.dead=true;return}if(circRect(b)){b.dead=true;hurt(b.dmg)}}},
  bleaf:{at:99,wt:0,c:'#b91c1c',sh:'bleaf',noHit:true,
    up:(b,dt)=>{b.age+=dt;if(b.age>b.tel+b.life){b.dead=true;return}
      if(b.age>=b.tel&&Math.abs(P.x-b.x)<b.w/2+pw()/2){b.cd-=dt;if(b.cd<=0){b.cd=.7;hurt(b.dmg)}}}},
  bdust:{at:99,wt:0,c:'#1c1917',sh:'bdust',noHit:true,
    up:(b,dt)=>{b.x+=b.vx*dt;b.age+=dt;if(circRect({x:b.x,y:FLOOR-12,r:14})){b.dead=true;const h=G.hp;hurt(b.dmg);if(G.hp<h){P.vy=-300;P.gnd=false;P.x=clamp(P.x+Math.sign(b.vx)*45*(P.lo_stable?.3:1),WL+pw()/2,WR-pw()/2)}}}},
  bfx:{at:99,wt:0,c:'#b91c1c',sh:'bfx',noHit:true,up:(b,dt)=>{b.age+=dt;if(b.age>b.life)b.dead=true}},
  /* --- Tinh Linh Vương (chỉ boss gọi ra) --- */
  eshot:{at:99,wt:0,c:'#38bdf8',sh:'eshot',noHit:true,
    up:(b,dt)=>{b.age+=dt;if(b.life&&b.age>b.life){b.dead=true;return}
      if(b.om){const v=Math.hypot(b.vx,b.vy),a=Math.atan2(b.vy,b.vx)+b.om*dt;b.vx=Math.cos(a)*v;b.vy=Math.sin(a)*v}
      if(b.g)b.vy+=b.g*dt;
      b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.sway)b.x+=Math.sin(b.age*3+b.ph)*b.sway*dt;
      if(b.bn!==undefined&&b.y>FLOOR-b.r){b.y=FLOOR-b.r;if(b.bn>0){b.bn--;b.vy=-Math.abs(b.vy)*.86}else{b.dead=true;return}}
      if(b.y>FLOOR+10){b.dead=true;return}
      if(circRect(b)){b.dead=true;tsHit(b)}}},
  efx:{at:99,wt:0,c:'#facc15',sh:'efx',noHit:true,up:(b,dt)=>{b.age+=dt;if(b.age>b.life)b.dead=true}},
  /* --- Lõi Trí Tuệ Quá Tải (chỉ boss gọi ra) --- */
  lbeam:{at:99,wt:0,c:'#ef4444',sh:'lbeam',noHit:true,
    up:(b,dt)=>{b.age+=dt;
      if(b.age>=b.tel&&!b.fired){b.fired=1;G.shake=Math.max(G.shake,.18);beep(170,.3,.06,'sawtooth')}
      if(b.fired&&b.age<b.tel+b.hold){const y=b.y2===undefined?b.by:b.by+(b.y2-b.by)*clamp((P.x-WL)/(WR-WL),0,1),m=b.y2===undefined?6:9;
        if(P.y-ph()<y+m&&P.y>y-m)ovHit(b.dmg)}
      if(b.age>b.tel+b.hold+.12)b.dead=true}},
  apulse:{at:99,wt:0,c:'#fb923c',sh:'apulse',noHit:true,
    up:(b,dt)=>{b.age+=dt;
      if(b.ph===0){b.x+=b.vx*dt;if(b.trk)b.x+=clamp(P.x-b.x,-240*dt,240*dt);if(b.age>=b.drift){b.ph=1;b.t=0}}
      else if(b.ph===1){b.t+=dt;const q=Math.floor(b.t*12);if(q!==b.bp){b.bp=q;if(q%3===0)beep(1300,.04,.03,'square')}if(b.t>=b.hold){b.ph=2;b.vy=80}}
      else{b.vy+=2600*dt;b.y+=b.vy*dt;if(b.y>=FLOOR-4){b.dead=true;burstParts(b.x,FLOOR,'#fb923c',8)}}
      if(circRect(b)){b.dead=true;ovHit(b.dmg)}}},
  esph:{at:99,wt:0,c:'#38bdf8',sh:'esph',noHit:true,
    up:(b,dt,out)=>{b.age+=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.age>=b.life){esphBoom(b,out);b.dead=true;return}
      if(circRect(b)){esphBoom(b,out);b.dead=true;ovHit(b.dmg)}}},
  espk:{at:99,wt:0,c:'#7dd3fc',sh:'espk',noHit:true,
    up:(b,dt)=>{b.x+=b.vx*dt;b.y+=b.vy*dt;if(circRect(b)){b.dead=true;ovHit(Math.max(1,b.dmg>>1))}}},
  pdrop:{at:99,wt:0,c:'#a3e635',sh:'pdrop',noHit:true,
    up:(b,dt)=>{b.vy+=520*dt;b.y+=b.vy*dt;if(b.y>FLOOR){b.dead=true;return}if(circRect(b)){b.dead=true;ovHit(Math.max(1,b.dmg>>1))}}},
  /* --- Thiên Kiếp Thượng Nhân (chỉ boss gọi ra) --- */
  tstrike:{at:99,wt:0,c:'#38bdf8',sh:'tstrike',noHit:true,
    up:(b,dt,out)=>{b.age+=dt;
      if(b.age>=b.tel&&!b.fired){b.fired=1;G.shake=Math.max(G.shake,.25);beep(80+rnd(0,40),.25,.08,'sawtooth');burstParts(b.x,FLOOR,b.col,10);
        if(b.pulse)for(const s of[-1,1])out.push({type:'tpulse',x:b.x,y:FLOOR-10,vx:s*330,vy:0,r:11,dmg:Math.max(1,b.dmg>>1),col:b.col})}
      if(b.fired&&!b.hd&&b.age<b.tel+.15&&Math.abs(P.x-b.x)<pw()/2+18){b.hd=1;hurt(b.dmg)}
      if(b.age>b.tel+.35)b.dead=true}},
  tpulse:{at:99,wt:0,c:'#38bdf8',sh:'tpulse',noHit:true,
    up:(b,dt)=>{b.x+=b.vx*dt;if(circRect(b)){b.dead=true;thHit(b.dmg,.3)}}},
  tsnake:{at:99,wt:0,c:'#fde047',trail:1,sh:'tsnake',noHit:true,
    up:(b,dt)=>{b.age+=dt;b.zt-=dt;if(b.zt<=0){b.zt=rnd(.16,.28);b.vy=(Math.random()<.5?-1:1)*b.sa}
      b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.y<180){b.y=180;b.vy=Math.abs(b.vy)}if(b.y>FLOOR-12){b.y=FLOOR-12;b.vy=-Math.abs(b.vy)}
      if(circRect(b)){b.dead=true;thHit(b.dmg,.45)}}},
  /* --- Thực Thể Dị Dạng (chỉ boss gọi ra) --- */
  vmine:{at:99,wt:0,c:'#a855f7',sh:'vmine',noHit:true,
    up:(b,dt)=>{b.age+=dt;const left=b.life-b.age;
      b.vis=b.age<.7?1:b.age<1.2?1-(b.age-.7)/.5*.9:.1;   /* rõ 0.7s → mờ dần → gần tàng hình */
      if(left<=0){b.dead=true;burstParts(b.x,b.y,'#a855f7',8);return}
      if(b.age>.45&&circRect(b)){b.dead=true;burstParts(b.x,b.y,'#c084fc',14);hurt(b.dmg)}}},
  vwarp:{at:99,wt:0,c:'#e879f9',trail:1,sh:'vwarp',noHit:true,
    up:(b,dt)=>{b.age+=dt;b.x+=b.vx*dt;
      if((b.vx<0&&b.x<WL-10)||(b.vx>0&&b.x>WR+10)){
        if(b.wr>=b.mw){b.dead=true;return}
        b.wr++;b.x=b.vx<0?WR+8:WL-8;b.tr=[];burstParts(b.x,b.y,'#e879f9',5)}   /* chui qua cổng, ra ở mép đối diện */
      if(b.age>7){b.dead=true;return}
      if(circRect(b)){b.dead=true;hurt(b.dmg)}}},
  vwell:{at:99,wt:0,c:'#7c3aed',sh:'vwell',noHit:true,
    up:(b,dt)=>{b.age+=dt;if(b.age>b.life){b.dead=true;return}
      if(b.age>.6&&!G.imm.gravity){const dx=b.x-P.x,dy=b.y-(P.y-ph()/2),d=Math.hypot(dx,dy);
        if(d<260){const f=(1-d/260)*b.st*dt;
          if(b.sg>0)P.x+=Math.sign(dx||1)*Math.min(Math.abs(dx),f);else P.x-=Math.sign(dx||1)*f;
          P.x=clamp(P.x,WL+pw()/2,WR-pw()/2)}}}},
  vslit:{at:99,wt:0,c:'#c084fc',sh:'vslit',noHit:true,
    up:(b,dt)=>{b.age+=dt;
      if(b.age>=b.tel&&!b.fired){b.fired=1;G.shake=Math.max(G.shake,.3);beep(120,.25,.08,'sawtooth');burstParts((b.x1+b.x2)/2,(b.y1+b.y2)/2,'#e9d5ff',16)}
      if(b.fired&&!b.hd&&b.age<b.tel+.28){const h=ph();
        for(const k of[.15,.5,.85])if(segDist(P.x,P.y-h*k,b.x1,b.y1,b.x2,b.y2)<b.hw+8){b.hd=1;hurt(b.dmg);break}}
      if(b.age>b.tel+.4)b.dead=true}},
 ray:{min:99,wt:0,c:'#fca5a5',sh:'star'},
  frag:{min:99,wt:0,c:'#4ade80',sh:'circle'}
};
/* Vòng bắt đầu xuất hiện của từng loại đạn */
Object.entries(CONTENT.bullets.tuning||{}).forEach(([k,v])=>{if(BT[k])Object.assign(BT[k],v)});

/* ============ HELPERS ============ */
function spikeH(b){const t=b.t;const p=t<.35?t/.35:t<1.1?1:Math.max(0,1-(t-1.1)/.5);return 44*p}
function dmgOf(r){return r<=3?1:r<=6?2:r<=9?3:r<=12?4:5+Math.floor((r-13)/3)}
/* Độ khó tăng dần: tốc độ đạn, nhịp spawn, thời điểm mở khóa loại đạn */
const speedOf=r=>Math.min(1.2,.62+.04*(r-1));
const unlockOf=m=>m<=1?1:Math.ceil(1+(m-1)*1.5);
function contDmg(d,gap){if(P.inv<=0&&G.mode==='playing'){hurt(d);P.inv=Math.min(P.inv,gap)}}
function segDist(px,py,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1,l=dx*dx+dy*dy||1;let t=clamp(((px-x1)*dx+(py-y1)*dy)/l,0,1);return Math.hypot(px-(x1+t*dx),py-(y1+t*dy))}
function boltHit(b){const pa=[P.y-ph(),P.y-ph()/2,P.y-2];
  for(let i=0;i<b.pts.length-1;i++)for(const py of pa)if(segDist(P.x,py,b.pts[i][0],b.pts[i][1],b.pts[i+1][0],b.pts[i+1][1])<pw()/2+8)return true;
  return false}
function popText(s,x,y,c){G.texts.push({s,x,y,c,life:1})}
function banner(s){G.banner=s;G.bannerT=2}
function burstParts(x,y,c,n=24){for(let i=0;i<n;i++)G.parts.push({x,y,vx:rnd(-260,260),vy:rnd(-260,260),life:.6,c})}

/* ============ LÕI MỚI: GIỚI HẠN MÁU, KỸ NĂNG CHỦ ĐỘNG ============ */
function gainHP(n){n*=10;G.hp=P.hpCap?Math.min(P.hpCap,G.hp+n):G.hp+n}
const SKDEF={blast:{n:'💥 Bộc Phá',cd:12,k:'q'},holy:{n:'✨ Khiên Thánh Quang',cd:15,k:'e'},stop:{n:'⏸️ Ngưng Đọng',cd:25,k:'r'},sprint:{n:'⚡ Siêu Tốc',cd:14,k:'f'},ghost:{n:'👻 Tàng Hình',cd:18,k:'g'},frost:{n:'❄️ Băng Sương',cd:20,k:'h'}};
function useSkill(id){
 if(id==='blast'){useBlast();return}
 if(!SKDEF[id]||!P.skills.includes(id)||G.mode!=='playing'||(P.skCD[id]||0)>0)return;
 P.skCD[id]=SKDEF[id].cd;
 if(id==='holy'){P.shield=Math.min(3,P.shield+1);popText('✨ Khiên Thánh Quang',P.x,P.y-80,'#fde68a')}
 if(id==='stop'){G.timeStop=3;banner('⏸️ NGƯNG ĐỌNG 3 GIÂY')}
 if(id==='sprint'){P.sprintT=5;popText('⚡ Siêu tốc!',P.x,P.y-80,'#fde047')}
 if(id==='frost'){P.frozen=2;P.inv=2;popText('❄️ Băng sương',P.x,P.y-80,'#67e8f9')}
 if(id==='ghost'){P.ghostT=3;popText('👻 Tàng hình',P.x,P.y-80,'#e2e8f0')}
 beep(700,.12,.05,'triangle');
}
let SKBAR_KEY=null;
function updSkBar(){
 const bar=$('skbar');if(!bar)return;
 const want=P.skills.filter(id=>id!=='dash'&&id!=='blast');
 const key=want.join(',');
 if(SKBAR_KEY!==key){
   SKBAR_KEY=key;bar.innerHTML='';
   want.forEach(id=>{const b=document.createElement('button');b.className='tb';b.id='sk_'+id;
     b.addEventListener('pointerdown',e=>{e.preventDefault();useSkill(id)});bar.appendChild(b)});
 }
 want.forEach(id=>{const b=$('sk_'+id);if(b)b.textContent=SKDEF[id].n+((P.skCD[id]||0)>0?' '+Math.ceil(P.skCD[id]):'')});
 bar.style.display=want.length?'':'none';
}
function coinGain(n){
 if(G.jack&&G.jack.left>0){G.jack.pool+=n;popText('🎰 +'+n+' (dồn)',P.x,P.y-95,'#fde047')}
 else addCoin(n);
}
function bet2Track(ok){
 const b=G.bet2;if(!b||b.state!=='run')return;
 if(ok){b.streak++;if(b.streak>=10){b.state='win';G.dmgAdd=(G.dmgAdd||0)-1;G.speedAdj*=.8;banner('🎯 Đánh Cược II thắng: đạn yếu hơn')}}
 else{b.state='lose';G.dmgAdd=(G.dmgAdd||0)+1;G.speedAdj*=1.2;G.sizeAdj*=1.2;banner('🎯 Đánh Cược II thua: đạn mạnh hơn')}
}
function hurt(dmg){
 if(P.inv>0||G.mode!=='playing'||P.ghostT>0)return;
 if(P.shield>0){P.shield--;P.inv=P.delay?2:1;popText('🛡️ Chặn',P.x,P.y-ph()-12,'#38bdf8');beep(600,.1);return}
 if(G.luckShield>0){G.luckShield--;P.inv=P.delay?2:1;popText('🍀 Khiên May Mắn',P.x,P.y-ph()-12,'#fbbf24');beep(700,.1);return}
 if(P.cr&&P.lo_crouch)dmg=Math.max(1,Math.round(dmg*.65));
 if(P.fat&&Math.random()<.5){dmg=Math.ceil(dmg/2);popText('🥩 giảm',P.x,P.y-ph()-30,'#a3e635')}
 if(G.easyRound)dmg=Math.max(1,dmg-1);if(G.dmgAdd)dmg=Math.max(1,dmg+G.dmgAdd);if(P.pact)dmg+=2;G.hp-=dmg*10;if(G.boss&&G.boss.d.ai==='cube'&&!G.boss.dead)G.dark=1.1;P.inv=P.delay?2:1;G.flash=.25;G.shake=.3;beep(150,.2,.08,'sawtooth');
 popText('-'+dmg*10,P.x,P.y-ph()-12,'#ef4444');
 if(G.hp<=0)handleZero();
}
function damageHP(n){G.hp-=n*10;if(G.hp<=0)handleZero()}
function handleZero(){
 G.hp=0;
 if(P.decoy){P.decoy=false;P.decoyUsed=true;G.hp=10;P.inv=1.5;popText('👼 Thế Thân',P.x,P.y-80,'#fde68a');beep(660,.3,.06,'triangle');return}
 startRevive();
}

function explodeAt(x,y,rad,kind){
 burstParts(x,y,kind==='elec'?'#38bdf8':'#f97316',kind==='elec'?18:30);
  G.shake=.4;
  if(kind==='bomb')G.bullets.push({type:'firezone',x:x,y:FLOOR,vx:0,vy:0,r:0,age:0,noHit:true});
  const cx=P.x,cy=P.y-ph()/2,d=Math.hypot(cx-x,cy-y);
 if(d>=rad)return;
 if(kind==='elec'&&G.imm.elec)return;
 if(kind==='bomb'&&!G.imm.gravity){P.vx=Math.sign(cx-x||1)*900;P.vy=-380;P.gnd=false}
 hurt(dmgOf(G.round));
}

/* Phản Chấn Xung Kích: phá đạn quanh người khi tiếp đất sau cú nhảy cao */
function loShock(air){
 const R=(P.lo_shockPlus?150:110)*(air>.6?1.15:1);
 let n=0;for(const q of G.bullets){if(q.type==='heart'||q.dead||q.noHit&&!q.hp)continue;if(Math.hypot(q.x-P.x,q.y-(P.y-ph()/2))<R+(q.r||8)){if(P.lo_shockPlus&&q.vx!==undefined){q.vx*=.5;q.vy=(q.vy||0)*.5;if(q.hp)continue}q.dead=true;n++;burstParts(q.x,q.y,'#38bdf8',4)}}
 if(G.boss&&!G.boss.dead&&Math.hypot(G.boss.x-P.x,G.boss.y-P.y)<R+G.boss.hr){burstParts(P.x,P.y,'#38bdf8',10);if(P.lo_shockPlus){G.boss.at=(G.boss.at||0)+.8;G.boss.hp-=G.boss.max*.015}}
 if(n||P.lo_shockPlus){popText('🌀 Chấn động',P.x,P.y-ph()-18,'#38bdf8');beep(260,.1,.05,'triangle')}
}
function circRect(b){
 const k=(P.cr&&P.lo_crouch)?.8:1;const w=pw()*k,h=ph()*k;
 const cx=clamp(b.x,P.x-w/2,P.x+w/2),cy=clamp(b.y,P.y-h,P.y);
 return Math.hypot(b.x-cx,b.y-cy)<b.r;
}

function onBulletHit(b){
 if(P.ghostT>0&&b.type!=='heart')return;
 if(b.type==='heart'){gainHP(1);popText('+10 HP',b.x,b.y,'#f472b6');b.dead=true;return}
 if(b.type==='yukibloom'||b.type==='yukishard'){frostHit(1,yWeak());return}
 if(b.type==='yukiicicle'){hurt(yStrong());return}
 const d=dmgOf(G.round);
 if(b.type==='venom'){if(!G.imm.poison){P.poison.push(7.5);popText('☠️ Trúng độc',P.x,P.y-ph()-22,'#22c55e')}return}
 if(b.type==='frost'&&!G.imm.ice){P.slow=3.5}
 if(b.type==='freeze'&&!G.imm.ice){P.frozen=1.5}
 hurt(d);
}

/* ============ SPAWNING ============ */
function pickType(){
  const m=G.map,list=[];
  for(const[k,v]of Object.entries(BT)){
    if(!(v.wt>0))continue;if(v.maps&&!v.maps.includes(m.id))continue;if(G.envPool&&!G.envPool.includes(k))continue;
    const at=v.at!==undefined?v.at:unlockOf(v.min);if(at>G.round)continue;
    let w=v.wt;if(m.fav&&m.fav.includes(k))w*=3;if(m.no&&m.no.includes(k))w=0;
    if(w>0)list.push([k,w]);
  }
  if(!list.length)return 'rain';
  let r=Math.random()*list.reduce((s,x)=>s+x[1],0);
  for(const[k,w]of list){r-=w;if(r<=0)return k}
  return 'rain';
}
function makeBullet(type){
 const b=BT[type].mk();b.type=type;if(BT[type].noHit)b.noHit=true;
 const sm=speedOf(G.round)*G.bulletM*DIFF.speed;const k2=sm*(G.bulletSlowR||1)*(G.speedAdj||1)*(G.quickRound?1.25:1)*((G.wh&&G.wh.k==='jackpot')?1.3:1);b.vx*=k2;b.vy*=k2;if(G.sizeAdj)b.r*=G.sizeAdj;if(P.lamp)b.r*=.8;
 return b;
}
function spawnType(type){
   if(type==='card'){const L=Math.random()<.5,y0=rnd(200,300),vy=rnd(-50,50);for(let i=0;i<3;i++){const b=makeBullet('card');b.x=L?WL:WR;b.vx=Math.abs(b.vx)*(L?1:-1);b.y=y0+i*64;b.vy=vy;G.bullets.push(b)}return}
   if(type==='coin'){const cx=rnd(140,760);for(let i=0;i<8;i++){const b=makeBullet('coin');b.x=cx+rnd(-34,34);b.y=-10-i*36;G.bullets.push(b)}return}
  if(type==='shock'){const a=makeBullet('shock'),c=makeBullet('shock');c.x=a.x===WL?WR:WL;c.vx=-a.vx;G.bullets.push(a,c);return}
  if(type==='meteor'){
    const dir=Math.random()<.5?1:-1,n=5+Math.min(3,Math.floor(G.round/6)),sm=speedOf(G.round)*G.bulletM*(G.quickRound?1.25:1);
    for(let i=0;i<n;i++)G.bullets.push({type:'meteor',x:WL+(i+rnd(.1,.9))*(WR-WL)/n-dir*50,y:-20-rnd(0,170),vx:dir*190*sm,vy:330*sm,r:8*(P.lamp?.8:1)});
    return;
  }
  G.bullets.push(makeBullet(type));
}
function spawnTick(dt){
 if(G.timeStop>0)return;
 if(G.challengeRound&&!(G.boss&&!G.boss.dead)&&Math.random()<.25)G.bullets.push(makeBullet('bomb'));
 if(G.breed){G.heartT-=dt;if(G.heartT<=0){G.heartT=3.5;const L=Math.random()<.5;G.bullets.push({type:'heart',x:L?WL:WR,y:rnd(200,400),vx:L?120:-120,vy:0,r:11})}}
 if(G.boss&&!G.boss.dead)return;   /* vòng có boss: không sinh đạn thường */
 G.spawnT-=dt;if(G.spawnT>0)return;
 const storm=G.storm>0;
  if(G.ev&&G.ev.k==='disaster'){G.spawnT=G.ev.d.iv*(1.25-Math.min(.35,G.round*.03))/(storm?1.5:1);spawnType(G.ev.d.type);return}
 G.spawnT=Math.max(.32,1.6-G.round*.06)/(storm?1.8:1)/DIFF.spawn*((G.boss&&!G.boss.dead&&G.boss.d.ai==='cube')?(G.round<=2?1.5:G.round===3?1.3:1.2):1)*((G.boss&&!G.boss.dead&&(G.boss.d.ai==='thunder'||G.boss.d.ai==='overload'||G.boss.d.ai==='void'))?(G.round<=3?2.2:1.8):1)*((G.boss&&!G.boss.dead&&G.boss.d.ai==='blade')?(G.round<=3?1.7:1.35):1)*((G.boss&&!G.boss.dead&&G.boss.d.ai==='spirit')?(G.round<=3?1.7:1.35):1);
  if(G.nextB){G.bullets.push(G.nextB);G.nextB=null}else spawnType(pickType());
 { const nt=pickType(); G.nextB=(nt==='shock'||nt==='meteor')?null:makeBullet(nt); if(!G.nextB)G.nextType=nt; }
 if(G.round>=9&&Math.random()<.25)G.bullets.push(makeBullet('rain'));
}

/* ============ UPDATE ============ */
function updBullets(dt){
 const out=[];
 for(const b of G.bullets){
   if(b.dead)continue;
   if(BT[b.type].trail){b.tr=(b.tr||[]);b.tr.push([b.x,b.y]);if(b.tr.length>10)b.tr.shift()}
   const up=BT[b.type].up;
   if(G.timeStop<=0){if(up)up(b,dt,out);else{b.x+=b.vx*dt;b.y+=b.vy*dt}}
   if(b.x<-60||b.x>W+60||b.y>H+60||b.y<-120){b.dead=true;if(b.type!=='heart'&&!b.noHit){P.dodge++;if(P.absorb&&P.dodge>=10){P.dodge=0;gainHP(1);popText('🕸️ +10 HP',P.x,P.y-80,'#a78bfa')}}}
   if(b.dead)continue;
   if(b.type==='laser'){
     if(Math.abs(P.x-b.x)<pw()/2+7){const top=P.y-ph();const inGap=top>=b.gap&&P.y<=b.gap+130;if(!inGap)hurt(dmgOf(G.round))}
   }else if(b.type==='spike'){
     const h=spikeH(b);
     if(h>0&&Math.abs(P.x-b.x)<pw()/2+12&&P.y>FLOOR-h)hurt(dmgOf(G.round));
   }else if(!b.noHit&&circRect(b)){
     onBulletHit(b);b.dead=true;
   }
 }
 G.bullets.push(...out);
 G.bullets=G.bullets.filter(b=>!b.dead);
}

function updPlayer(dt){
 const frozen=P.frozen>0||P.para>0;
 if(P.charge&&!P.hasDash){P.chargeT+=dt;if(P.chargeT>=10){P.chargeT=0;P.shield=Math.min(1,P.shield+1);popText('🏃 Lá chắn',P.x,P.y-80,'#38bdf8')}}
 P.blastCD=Math.max(0,P.blastCD-dt);
 for(const k in P.skCD)P.skCD[k]=Math.max(0,P.skCD[k]-dt);
 P.sprintT=Math.max(0,(P.sprintT||0)-dt);P.ghostT=Math.max(0,(P.ghostT||0)-dt);
 if(P.regen&&G.mode==='playing'){P.regenT+=dt;if(P.regenT>=3/DIFF.heal){P.regenT=0;gainHP(1)}}
 if(P.frozen>0&&(jumpPressed||dashPressed)){P.frozen=Math.max(0,P.frozen-.3);burstParts(P.x,P.y-ph()/2,'#bae6fd',5)}
 P.para=Math.max(0,(P.para||0)-dt);P.frozen=Math.max(0,P.frozen-dt);P.slow=Math.max(0,P.slow-dt);P.inv=Math.max(0,P.inv-dt);
 if(P.lo_dash&&P.dash>0&&P.dash-dt<=0){P.sprintT=Math.max(P.sprintT||0,1.5);P.postDash=true}
 P.dashCD=Math.max(0,P.dashCD-dt);P.dash=Math.max(0,P.dash-dt);
 if(P.lo_warm){P.frozen=Math.max(0,(P.frozen||0)-dt*.5);P.para=Math.max(0,(P.para||0)-dt*.5);P.slow=0}
 if(P.gnd){if(P.lo_shock&&!P.wasG&&(P.lastAir||0)>.25)loShock(P.lastAir);P.lastAir=0}else P.lastAir=(P.lastAir||0)+dt;P.wasG=P.gnd;
 P.lowBoost=!!P.lo_low&&G.hp<=(P.hpCap||300)*.3;
 P.cr=K.d&&P.gnd&&!frozen&&!P.wings;
 const ax=(K.r?1:0)-(K.l?1:0);
 const sp=260*P.speedM*(P.speedRound||1)*(P.sprintT>0?1.2:1)*(P.slow>0?.55:1)*(P.psT>0?1.2:1)*((P.frost||0)>=2?.75:(P.frost||0)>=1?.88:1)*(P.cr?.5:1)*(P.lowBoost?1.25:1);
 if(!frozen){if(ax)P.face=ax;P.vx=ax*sp}else P.vx=0;
 if(P.dash>0)P.vx=P.face*900;
  if(G.map.id==='ice'&&P.dash<=0&&!frozen){P.iv=P.iv||0;P.iv+=(P.vx-P.iv)*Math.min(1,(P.gnd?(ax?7:1.8):4)*dt);P.vx=P.iv}else P.iv=P.vx;
 if(dashPressed&&P.hasDash&&P.dashCD<=0&&!frozen){P.dash=.3;P.dashCD=3*(P.lo_dash?.75:1);P.inv=Math.max(P.inv,.3);if(P.charge)P.shield=Math.min(1,P.shield+1)}
 if(jumpPressed&&!frozen&&!P.wings){
   if(P.gnd){P.vy=-640*(vFlip()?-1:1)*P.jumpM*(P.slow>0?.8:1)*(P.pjT>0?.894:1);P.gnd=false;P.jumps=P.maxJ-1}
   else if(P.jumps>0){P.vy=-600*(vFlip()?-1:1)*P.jumpM*(P.pjT>0?.894:1);P.jumps--}
 }
 if(P.wings&&!frozen){const ay=((K.u||K.ju)?-1:0)+((K.d||K.jd)?1:0);P.vy=ay*240}else P.vy+=1800*dt*(vFlip()?-1:1)*((G.gf&&G.gf.k==='low')?.45:1)*((G.boss&&!G.boss.dead&&G.boss.d.ai==='sv0')?.8:1);
 const px0=P.x;P.x+=P.vx*dt;
 const w=pw();if(P.inf){if(P.x<-w/2)P.x=W+w/2;else if(P.x>W+w/2)P.x=-w/2}else P.x=clamp(P.x,WL+w/2,WR-w/2);
 for(const k of G.blocks||[]){if(k.st!=='land')continue;if(P.y>FLOOR-k.h+3&&P.x+w/2>k.x-k.w/2&&P.x-w/2<k.x+k.w/2){P.x=clamp(px0<k.x?k.x-k.w/2-w/2:k.x+k.w/2+w/2,WL+w/2,WR-w/2)}}
 if(G.poly&&!P.inf){const hw=Math.min(430,polyHW(P.y-ph()/2));P.x=clamp(P.x,450-hw+w/2,450+hw-w/2)}
 const prev=P.y;P.y+=P.vy*dt;P.gnd=false;
 if(vFlip()&&!P.wings){   /* trọng lực đảo: trần nhà thành 'sàn' */
   if(P.y<=ph()){P.y=ph();P.vy=0;P.gnd=true}else if(P.y>=FLOOR){P.y=FLOOR;P.vy=0}
 }else{
 if(P.y>=FLOOR){P.y=FLOOR;P.vy=0;P.gnd=true}
 if(P.wings&&P.y<ph()+6){P.y=ph()+6;if(P.vy<0)P.vy=0}
 if(P.vy>=0&&!P.wings){
   for(const[px,py,pwid]of G.map.pads||[]){if(prev<=py+1&&P.y>=py&&P.x+w/2>px&&P.x-w/2<px+pwid){P.y=py;P.vy=-640*1.3*P.jumpM;P.gnd=false;P.jumps=P.maxJ-1;P.padT=.35;beep(520,.14,.05,'triangle');popText('🍄',P.x,P.y-ph()-8,'#5eead4');break}}
   for(const k of G.blocks||[]){if(k.st!=='land')continue;const top=FLOOR-k.h;if(prev<=top+1&&P.y>=top&&P.x+w/2>k.x-k.w/2&&P.x-w/2<k.x+k.w/2){P.y=top;P.vy=0;P.gnd=true;break}}
   for(const[px,py,pwid]of G.map.plat){
     if(prev<=py+1&&P.y>=py&&P.x+w/2>px&&P.x-w/2<px+pwid){P.y=py;P.vy=0;P.gnd=true;break}
   }
 }
 }
 if(P.gnd)P.jumps=P.maxJ;
 if(P.gnd&&Math.abs(P.vx)>10)P.walk+=dt*12;
 // độc đốt: mỗi 2.5s gây 1 HP cho mỗi tầng
 if(P.poison.length){
   P.poison=P.poison.map(t=>t-dt).filter(t=>t>0);
   P.pt+=dt;
   if(P.pt>=2.5){P.pt=0;if(P.poison.length)damageHP(P.poison.length)}
 }else P.pt=0;
}

function step(dt){
 G.timeStop=Math.max(0,(G.timeStop||0)-dt);
 G.t+=dt;G.timeLeft-=dt;
 if(G.timeLeft<=0&&G.boss&&G.boss.fight&&!G.boss.dead){G.timeLeft=0;if(!G.boss.enr){G.boss.enr=true;banner('🔥 BOSS NỔI GIẬN!')}}else if(G.timeLeft<=0){G.timeLeft=0;if(G.boss&&!G.boss.dead)bossWin();if(G.jack&&G.jack.left>0){G.jack.left--;if(G.jack.left===0){const w=G.jack.pool*2;SHOP.coins+=w;saveShop();updateCoinUI();banner('🎰 Nổ hũ: +'+w+' xu');G.jack=null}}if(G.betPrev!==undefined){const back=G.betPrev;G.betPrev=undefined;gainHP(back);banner('🎲 Đánh cược thắng: hoàn trả máu')}if(G.challengeRound){G.challengeRound=false;gainHP(10);banner('🏆 Thử thách thành công: +10 HP')}return openBonus()}
 if(G.round>=5){G.stormCD-=dt;if(G.stormCD<=0){G.storm=4;G.stormCD=rnd(12,18);banner('⚠️ BÃO ĐẠN!')}}
 G.storm=Math.max(0,G.storm-dt);G.flash=Math.max(0,G.flash-dt);G.glitch=Math.max(0,(G.glitch||0)-dt);G.shake=Math.max(0,G.shake-dt);
 G.bannerT=Math.max(0,G.bannerT-dt);
  evTick(dt);mapTick(dt);if(bossTick(dt))return;
 updPlayer(dt);
 spawnTick(dt);
 updBullets(dt);
 for(const p of G.parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.life-=dt}
 G.parts=G.parts.filter(p=>p.life>0);
 for(const t of G.texts){t.y-=40*dt;t.life-=dt}
 G.texts=G.texts.filter(t=>t.life>0);
}

/* ============ DRAW ============ */
function drawBullet(b){
 const T=BT[b.type],c=T.c,x=b.x,y=b.y,r=b.r,t=G.t,al=T.alpha||1;
 const ang=Math.atan2(b.vy||0,b.vx||1);
 ctx.save();
 if(G.contrast)ctx.filter='brightness(0)';
 ctx.globalAlpha=al;
 if(b.tr){b.tr.forEach((p,i)=>{const k=i/b.tr.length;ctx.globalAlpha=k*.35*al;ctx.fillStyle=c;ctx.beginPath();ctx.arc(p[0],p[1],r*k*.8,0,7);ctx.fill()});ctx.globalAlpha=al}
 ctx.translate(x,y);
 const glow=(col,bl)=>{ctx.shadowColor=col;ctx.shadowBlur=bl};
 const dot=(rad,col)=>{ctx.fillStyle=col;ctx.beginPath();ctx.arc(0,0,rad,0,7);ctx.fill()};
 switch(b.type){
  case 'vmine':{const v=b.vis===undefined?1:b.vis,p=1+.12*Math.sin(t*10+b.age*8);
   ctx.globalAlpha=v;glow('#a855f7',14*v);ctx.fillStyle='#4c1d95';ctx.beginPath();ctx.arc(0,0,r*p,0,7);ctx.fill();glow('transparent',0);
   ctx.strokeStyle='#d8b4fe';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*p,0,7);ctx.stroke();
   ctx.fillStyle='#f0abfc';ctx.beginPath();ctx.arc(0,0,r*.28,0,7);ctx.fill();
   if(v<.5){ctx.globalAlpha=.16+.08*Math.sin(t*25+b.x);ctx.strokeStyle='#c084fc';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-r*1.3,0);ctx.lineTo(r*1.3,0);ctx.moveTo(0,-r*1.3);ctx.lineTo(0,r*1.3);ctx.stroke()}   /* gợn nhiễu nhạt */
   if(b.life-b.age<=.3&&Math.floor(t*30)%2){ctx.globalAlpha=1;ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r*1.35,0,7);ctx.stroke()}   /* lóe sáng 0.3s cuối */
   break}
  case 'vwarp':{glow('#e879f9',14);ctx.fillStyle='#f5d0fe';ctx.beginPath();ctx.ellipse(0,0,r*1.5,r*.8,0,0,7);ctx.fill();glow('transparent',0);ctx.strokeStyle='#a21caf';ctx.lineWidth=2;ctx.stroke();break}
  case 'vwell':{const on=b.age>.6,k=on?1:b.age/.6,rr=34*k,col=b.sg>0?'#a78bfa':'#f9a8d4';
   glow(col,18);ctx.fillStyle='#09040f';ctx.beginPath();ctx.arc(0,0,rr*.55,0,7);ctx.fill();glow('transparent',0);
   ctx.strokeStyle=col;ctx.lineWidth=2;for(let i=0;i<3;i++){const a0=t*(b.sg>0?-4:4)+i*2.094;ctx.beginPath();ctx.arc(0,0,rr*(.7+.1*i),a0,a0+1.6);ctx.stroke()}
   if(on){ctx.globalAlpha=.12;ctx.setLineDash([4,8]);ctx.beginPath();ctx.arc(0,0,260,0,7);ctx.stroke();ctx.setLineDash([])}
   break}
  case 'vslit':{const tl=b.age<b.tel,k=tl?b.age/b.tel:1,x1=b.x1-x,y1=b.y1-y,x2=b.x2-x,y2=b.y2-y;ctx.lineCap='round';
   if(tl){ctx.globalAlpha=.3+.35*k+.15*Math.sin(t*30*k);ctx.strokeStyle='#c084fc';ctx.lineWidth=2+k*3;glow('#a855f7',12);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.globalAlpha=.07+.12*k;ctx.lineWidth=b.hw*2;ctx.stroke()}
   else{const f=Math.max(0,1-(b.age-b.tel)/.4);ctx.globalAlpha=f;glow('#e879f9',24);ctx.strokeStyle='#e879f9';ctx.lineWidth=b.hw*2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.strokeStyle='#fdf4ff';ctx.lineWidth=b.hw*.7;ctx.stroke()}
   break}
  case 'rain': // giọt nước xanh
   glow(c,12);ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(0,-14);ctx.quadraticCurveTo(7,0,0,7);ctx.quadraticCurveTo(-7,0,0,-14);ctx.fill();
   ctx.fillStyle='#e0f7ff';ctx.beginPath();ctx.arc(-2,1,2,0,7);ctx.fill();break;
  case 'high': // đạn laser đỏ có tia lửa
   glow('#ef4444',14);ctx.rotate(ang);ctx.fillStyle='#fecaca';ctx.fillRect(-22,-2,44,4);
   ctx.fillStyle=c;ctx.fillRect(-14,-4,28,8);ctx.fillStyle='#fff';ctx.fillRect(4,-2,12,4);break;
  case 'roller': // quả gai sắt lăn
   glow('#fb923c',8);ctx.fillStyle='#3f3f46';ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();
   ctx.strokeStyle='#52525b';ctx.lineWidth=3;
   for(let i=0;i<8;i++){const a=i*Math.PI/4+t*6;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.7,Math.sin(a)*r*.7);ctx.lineTo(Math.cos(a)*(r+5),Math.sin(a)*(r+5));ctx.stroke()}
   dot(2.5,'#a1a1aa');break;
  case 'sine': // ruy băng năng lượng tím
   glow('#c084fc',14);dot(r*.8,c);ctx.globalAlpha=al*.5;dot(r*1.5,'#e9d5ff');break;
  case 'orb': // quả cầu vàng xoáy
   glow('#fde047',18);const gr=ctx.createRadialGradient(0,0,2,0,0,r*1.6);
   gr.addColorStop(0,'#fff7ad');gr.addColorStop(.5,'#facc15');gr.addColorStop(1,'rgba(250,204,21,0)');
   ctx.fillStyle=gr;ctx.beginPath();ctx.arc(0,0,r*1.6,0,7);ctx.fill();
   glow('transparent',0);ctx.strokeStyle='#fef08a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*.75,t*4,t*4+4.5);ctx.stroke();break;
  case 'homing': // ma trơi xanh có đầu lâu
   glow('#2dd4bf',16);ctx.fillStyle='#2dd4bf';ctx.beginPath();ctx.moveTo(0,-r*1.6);ctx.quadraticCurveTo(r*1.1,-r*.2,r*.6,r*.7);ctx.quadraticCurveTo(0,r*1.2,-r*.6,r*.7);ctx.quadraticCurveTo(-r*1.1,-r*.2,0,-r*1.6);ctx.fill();
   glow('transparent',0);ctx.fillStyle='#ecfeff';ctx.beginPath();ctx.arc(0,0,r*.55,0,7);ctx.fill();
   ctx.fillStyle='#0f766e';ctx.fillRect(-3,-2,2,2);ctx.fillRect(2,-2,2,2);break;
  case 'burst': // thiên thạch lửa
   glow('#f97316',14);ctx.rotate(ang);ctx.fillStyle='#f97316';ctx.beginPath();ctx.moveTo(-r*1.8,0);ctx.lineTo(-r*.5,-r*.9);ctx.lineTo(r*.5,-r*.9);ctx.lineTo(r*.9,0);ctx.lineTo(r*.5,r*.9);ctx.lineTo(-r*.5,r*.9);ctx.fill();
   glow('transparent',0);ctx.fillStyle='#7c2d12';dot(r*.35,'#7c2d12');break;
  case 'ray': // tia lửa tỏa ra từ thiên thạch
   glow('#fca5a5',8);ctx.rotate(ang);ctx.fillStyle='#fca5a5';ctx.fillRect(-10,-2,20,4);break;
  case 'splitter': // bong bóng pha lê nứt
   glow('#a78bfa',12);ctx.fillStyle='rgba(196,181,253,.7)';ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();
   glow('transparent',0);ctx.strokeStyle='#ede9fe';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.stroke();
   ctx.beginPath();ctx.moveTo(-r*.6,-r*.2);ctx.lineTo(0,r*.2);ctx.lineTo(r*.5,-r*.4);ctx.stroke();break;
  case 'frag': // mảnh pha lê nhỏ
   glow('#a78bfa',8);ctx.rotate(t*5);ctx.fillStyle='#c4b5fd';ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r*.7,0);ctx.lineTo(0,r);ctx.lineTo(-r*.7,0);ctx.fill();break;
  case 'gravity': // khối kim loại có mũi tên xuống
   glow('#60a5fa',8);ctx.fillStyle='#64748b';ctx.fillRect(-r,-r,r*2,r*2);ctx.strokeStyle='#cbd5e1';ctx.lineWidth=2;ctx.strokeRect(-r,-r,r*2,r*2);
   glow('transparent',0);ctx.fillStyle='#e2e8f0';ctx.beginPath();ctx.moveTo(0,r*.6);ctx.lineTo(-r*.5,0);ctx.lineTo(r*.5,0);ctx.fill();ctx.fillRect(-r*.2,-r*.6,r*.4,r*.6);break;
  case 'accel': // mũi tên vàng tăng tốc
   glow('#facc15',12);ctx.rotate(ang);ctx.fillStyle='#facc15';ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-6,-8);ctx.lineTo(-2,0);ctx.lineTo(-6,8);ctx.fill();
   ctx.globalAlpha=al*.5;ctx.beginPath();ctx.moveTo(-6,-4);ctx.lineTo(-18,0);ctx.lineTo(-6,4);ctx.fill();break;
  case 'boomerang': // lưỡi liềm xanh xoay
   glow('#38bdf8',16);ctx.rotate(t*10);ctx.strokeStyle='#38bdf8';ctx.lineWidth=5;ctx.lineCap='round';
   ctx.beginPath();ctx.arc(0,0,r*1.2,-1.2,1.2);ctx.stroke();ctx.strokeStyle='#e0f2fe';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*1.2,-1.1,1.1);ctx.stroke();break;
  case 'portal': // cổng xoáy xanh ngọc
   glow('#2dd4bf',16);ctx.rotate(t*6);ctx.strokeStyle='#2dd4bf';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,r,0,4.8);ctx.stroke();
   ctx.strokeStyle='#ccfbf1';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*.5,3,6.5);ctx.stroke();break;
  case 'ground_spike': break;
  case 'bomb': // quả bom đỏ có ngòi
   glow('#ef4444',6);ctx.fillStyle='#b91c1c';ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();
   glow('transparent',0);ctx.fillStyle='#fca5a5';ctx.fillRect(-r*.7,-2,r*1.4,3);
   ctx.strokeStyle='#fbbf24';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(5,-r-6);ctx.stroke();
   ctx.fillStyle='#fbbf24';dot(2,'#fbbf24');break;
  case 'chain': // cầu sấm sét xanh
   glow('#38bdf8',18);dot(r,'#1d4ed8');glow('transparent',0);ctx.strokeStyle='#e0f2fe';ctx.lineWidth=2;ctx.beginPath();
   ctx.moveTo(-r*.5,-r*.2);ctx.lineTo(0,0);ctx.lineTo(-2,r*.4);ctx.lineTo(r*.4,r*.2);ctx.stroke();break;
  case 'frost': // bông hoa băng
   glow('#bae6fd',10);ctx.rotate(t*2);ctx.strokeStyle='#bae6fd';ctx.lineWidth=2;
   for(let i=0;i<6;i++){ctx.rotate(Math.PI/3);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-r*1.3);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-r*.7);ctx.lineTo(3,-r*.9);ctx.stroke()}
   glow('transparent',0);dot(r*.35,'#e0f2fe');break;
  case 'freeze': // tinh thể băng nhọn
   glow('#67e8f9',12);ctx.rotate(ang);ctx.fillStyle='#22d3ee';ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-4,-6);ctx.lineTo(-10,0);ctx.lineTo(-4,6);ctx.fill();
   glow('transparent',0);ctx.fillStyle='#cffafe';ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(-2,-2);ctx.lineTo(-2,2);ctx.fill();break;
  case 'venom': // giọt độc xanh lá
   glow('#22c55e',12);ctx.fillStyle='#16a34a';ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();
   glow('transparent',0);ctx.fillStyle='#bbf7d0';ctx.beginPath();ctx.arc(-3,-3,2.5,0,7);ctx.fill();break;
  case 'blackhole': // xoáy tím đen
   glow('#7c3aed',20);const hg=ctx.createRadialGradient(0,0,4,0,0,40);hg.addColorStop(0,'#000');hg.addColorStop(.45,'#4c1d95');hg.addColorStop(1,'rgba(124,58,237,0)');
   ctx.fillStyle=hg;ctx.beginPath();ctx.arc(0,0,40,0,7);ctx.fill();
   glow('transparent',0);ctx.strokeStyle='#a855f7';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,22,t*5,t*5+4);ctx.stroke();break;
  case 'phantom': // hồn ma mờ
   glow('#e2e8f0',10);ctx.fillStyle='#e2e8f0';ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();break;
  case 'expanding': // cầu lửa đỏ có vòng lửa
   glow('#f97316',16);ctx.fillStyle='#dc2626';ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();
   glow('transparent',0);ctx.strokeStyle='#fb923c';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r*1.25,0,7);ctx.stroke();
   ctx.fillStyle='#fde047';dot(r*.4,'#fde047');break;
  case 'laser':{ // tia dọc có khe hở
    glow('#ef4444',14);const g=b.gap,g2=Math.min(FLOOR,g+130);
    ctx.fillStyle='rgba(239,68,68,.85)';ctx.fillRect(-3,0,6,g);ctx.fillRect(-3,g2,6,FLOOR-g2);
    ctx.fillStyle='#fff';ctx.fillRect(-1,0,2,g);ctx.fillRect(-1,g2,2,FLOOR-g2);
    ctx.fillStyle='#fecaca';ctx.fillRect(-9,g-4,18,4);ctx.fillRect(-9,g2,18,4);break}
   case 'spike':{ // gai sàn trồi lên
    const h=spikeH(b);
    if(b.t<.45){ctx.fillStyle='rgba(239,68,68,.55)';ctx.fillRect(-16,-3,32,3)}
    if(h>0){glow('#e5e7eb',8);ctx.fillStyle='#e5e7eb';
      for(const k of[-10,0,10]){ctx.beginPath();ctx.moveTo(k-6,0);ctx.lineTo(k,-h*(k?.8:1));ctx.lineTo(k+6,0);ctx.fill()}}
    break}
   case 'bouncer':{glow('#a3e635',12);dot(r,c);glow('transparent',0);ctx.strokeStyle='#ecfccb';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*.6,t*8,t*8+3);ctx.stroke();break}
   case 'shock':{const sd=Math.sign(b.vx)||1;ctx.scale(sd,1);glow('#fbbf24',14);ctx.lineCap='round';
    ctx.strokeStyle='#f59e0b';ctx.lineWidth=7;ctx.beginPath();ctx.arc(-10,0,22,-1.15,1.15);ctx.stroke();
    ctx.strokeStyle='#fef3c7';ctx.lineWidth=3;ctx.beginPath();ctx.arc(-10,0,22,-1.1,1.1);ctx.stroke();break}
   case 'meteor':{ctx.rotate(ang);glow('#7dd3fc',14);ctx.globalAlpha=.4;ctx.fillStyle='#7dd3fc';
    ctx.beginPath();ctx.moveTo(0,-r*.9);ctx.lineTo(-r*7,0);ctx.lineTo(0,r*.9);ctx.fill();ctx.globalAlpha=1;
    dot(r,'#e0f2fe');glow('transparent',0);dot(r*.5,'#fff');break}
   case 'stalac':{
    if(b.tel>0){ctx.translate(Math.sin(t*60)*1.5,0);ctx.globalAlpha=.3+.25*Math.sin(t*20);ctx.strokeStyle='#f87171';ctx.setLineDash([4,8]);ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(0,16);ctx.lineTo(0,FLOOR-y);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1}
    ctx.fillStyle='#a1a1aa';ctx.beginPath();ctx.moveTo(-10,-30);ctx.lineTo(10,-30);ctx.lineTo(0,14);ctx.fill();
    ctx.fillStyle='#e4e4e7';ctx.beginPath();ctx.moveTo(-3,-30);ctx.lineTo(3,-30);ctx.lineTo(0,8);ctx.fill();break}
   case 'boulder':{ctx.rotate(b.rot);ctx.fillStyle='#78716c';ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();
    ctx.strokeStyle='#44403c';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#a8a29e';
    ctx.beginPath();ctx.arc(-9,-10,6,0,7);ctx.fill();ctx.beginPath();ctx.arc(10,7,8,0,7);ctx.fill();
    ctx.strokeStyle='#292524';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-4,4);ctx.lineTo(4,12);ctx.lineTo(0,r-2);ctx.moveTo(6,-14);ctx.lineTo(14,-6);ctx.stroke();break}
   case 'beam':{const a=b.age,L=-W/2+WL,R=W/2-(W-WR);
    if(a<1.2){ctx.globalAlpha=.25+.25*Math.sin(a*18);ctx.fillStyle=c;ctx.fillRect(L,-2,R-L,4);
      ctx.globalAlpha=.9;ctx.fillRect(L,-9,10,18);ctx.fillRect(R-10,-9,10,18)}
    else{ctx.globalAlpha=a<1.75?1:Math.max(0,(1.9-a)/.15);glow('#f43f5e',20);ctx.fillStyle=c;ctx.fillRect(L,-8,R-L,16);
      glow('transparent',0);ctx.fillStyle='#fff';ctx.fillRect(L,-3,R-L,6)}
    break}
   case 'pendulum':{ctx.strokeStyle='#64748b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(b.px-x,b.py-y);ctx.lineTo(0,0);ctx.stroke();
    ctx.fillStyle='#475569';ctx.beginPath();ctx.arc(b.px-x,b.py-y,6,0,7);ctx.fill();
    glow('#94a3b8',8);dot(r,'#334155');glow('transparent',0);ctx.strokeStyle='#94a3b8';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.stroke();
    for(let i=0;i<8;i++){const a=i*Math.PI/4+t;ctx.beginPath();ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);ctx.lineTo(Math.cos(a)*(r+6),Math.sin(a)*(r+6));ctx.stroke()}break}
   case 'mine':{const fast=b.fuse!==undefined;
    ctx.fillStyle='#374151';ctx.beginPath();ctx.arc(0,6,13,Math.PI,0);ctx.fill();ctx.fillStyle='#1f2937';ctx.fillRect(-13,6,26,4);
    ctx.fillStyle=Math.floor(t*(fast?14:3))%2?'#ef4444':'#7f1d1d';ctx.beginPath();ctx.arc(0,-3,3.5,0,7);ctx.fill();
    if(fast){ctx.strokeStyle='rgba(239,68,68,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,90,0,7);ctx.stroke()}break}
   case 'firezone':{const life=3-b.age;ctx.globalAlpha=Math.min(1,life*1.5)*(b.age<.15?b.age/.15:1);glow('#f97316',16);
    const g=ctx.createRadialGradient(0,0,4,0,0,80);g.addColorStop(0,'rgba(253,224,71,.55)');g.addColorStop(1,'rgba(239,68,68,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,80,24,0,Math.PI,2*Math.PI);ctx.fill();
    for(let i=-3;i<=3;i++){const h=24+12*Math.sin(t*14+i*1.7)+(3-Math.abs(i))*6;ctx.fillStyle=i%2?'#f97316':'#fb923c';
      ctx.beginPath();ctx.moveTo(i*20-9,0);ctx.quadraticCurveTo(i*20-3,-h*.6,i*20,-h);ctx.quadraticCurveTo(i*20+3,-h*.6,i*20+9,0);ctx.fill()}break}
   case 'sniper':{const a=b.age;
    if(a<1.6){ctx.strokeStyle=c;ctx.lineWidth=2;ctx.globalAlpha=.85;ctx.beginPath();ctx.ellipse(0,-2,26,9,0,0,7);ctx.stroke();
      ctx.beginPath();ctx.moveTo(-34,-2);ctx.lineTo(34,-2);ctx.moveTo(0,-14);ctx.lineTo(0,8);ctx.stroke();
      if(a>1.1){ctx.globalAlpha=.25+.2*Math.sin(a*40);ctx.setLineDash([6,8]);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-FLOOR);ctx.stroke();ctx.setLineDash([])}}
    else if(a<2.1){ctx.globalAlpha=Math.max(0,1-(a-1.6)/.5);glow('#f87171',22);ctx.fillStyle='#fecaca';ctx.fillRect(-22,-FLOOR,44,FLOOR);glow('transparent',0);ctx.fillStyle='#fff';ctx.fillRect(-8,-FLOOR,16,FLOOR)}
    break}
   case 'bolt':{ctx.translate(-x,-y);const a=b.age,st=a>1.1&&a<1.4,pts=b.pts;ctx.lineJoin='round';
    const path=()=>{ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]))};
    if(a<1.1){ctx.globalAlpha=.15+.25*(Math.sin(a*30)>0?1:.3);ctx.strokeStyle='#fde68a';ctx.lineWidth=2;ctx.setLineDash([8,10]);path();ctx.stroke();ctx.setLineDash([]);
      const e=pts[pts.length-1];ctx.beginPath();ctx.ellipse(e[0],FLOOR-2,24,7,0,0,7);ctx.stroke()}
    else{ctx.globalAlpha=Math.max(0,Math.min(1,(1.5-a)/.1));glow('#fde047',24);ctx.strokeStyle='#fde047';ctx.lineWidth=st?10:4;path();ctx.stroke();
      glow('transparent',0);ctx.strokeStyle='#fff';ctx.lineWidth=st?4:2;path();ctx.stroke()}
    break}
   case 'nova':{const p=Math.max(0,b.next-b.age),pulse=1+.15*Math.sin(t*18);
    glow(c,20);dot(r*pulse,c);glow('transparent',0);dot(r*.5,'#fff1f2');
    ctx.strokeStyle=c;ctx.lineWidth=2;ctx.globalAlpha=.6;ctx.beginPath();ctx.arc(0,0,r+6+p*60,0,7);ctx.stroke();
    ctx.globalAlpha=.8;for(let i=0;i<8;i++){const a2=b.rot+i*Math.PI/4+t*2;ctx.beginPath();ctx.moveTo(Math.cos(a2)*(r+2),Math.sin(a2)*(r+2));ctx.lineTo(Math.cos(a2)*(r+10),Math.sin(a2)*(r+10));ctx.stroke()}break}
   case 'doom':{glow('#fb923c',10);ctx.fillStyle='#fdba74';ctx.fillRect(-3,-90,6,90);glow('transparent',0);ctx.fillStyle='#fff';ctx.fillRect(-1,-90,2,90);break}
   case 'tstrike':{ctx.translate(-x,-y);const a=b.age,pts=b.pts,col=b.col;ctx.lineJoin='round';ctx.lineCap='round';
    const path=()=>{ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]))};
    if(a<b.tel){const k=a/b.tel;ctx.globalAlpha=.25+.35*k+.1*Math.sin(a*40);ctx.strokeStyle=col;ctx.lineWidth=1.5+2*k;ctx.setLineDash([10,8]);
      ctx.beginPath();ctx.moveTo(b.x,0);ctx.lineTo(b.x,FLOOR);ctx.stroke();ctx.setLineDash([]);
      ctx.globalAlpha=.55;ctx.beginPath();ctx.ellipse(b.x,FLOOR-2,12+34*k,5+6*k,0,0,7);ctx.stroke()}
    else{const f=Math.max(0,1-(a-b.tel)/.35);ctx.globalAlpha=f;glow(col,26);ctx.strokeStyle=col;ctx.lineWidth=14*f+4;path();ctx.stroke();
      glow('transparent',0);ctx.strokeStyle='#fff';ctx.lineWidth=5*f+1;path();ctx.stroke();ctx.fillStyle=col;ctx.globalAlpha=.3*f;ctx.fillRect(b.x-24,0,48,FLOOR)}
    break}
   case 'tpulse':{glow(b.col,14);ctx.fillStyle=b.col;ctx.beginPath();ctx.ellipse(0,0,18,9,0,0,7);ctx.fill();glow('transparent',0);
    ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(0,0,9,4,0,0,7);ctx.fill();
    ctx.strokeStyle='#fff';ctx.lineWidth=1.5;for(let i=0;i<3;i++){const s=Math.sign(b.vx)||1;ctx.beginPath();ctx.moveTo(-s*(12+i*7),rnd(-6,6));ctx.lineTo(-s*(20+i*7),rnd(-8,8));ctx.stroke()}break}
   case 'tsnake':{glow('#fde047',16);dot(r,'#fde047');glow('transparent',0);dot(r*.45,'#fff');break}
   case 'lbeam':{const y1=b.by,y2=b.y2===undefined?b.by:b.y2;
    if(b.age<b.tel){ctx.globalAlpha=.25+.4*Math.pow(Math.sin(b.age*(14+30*b.age/b.tel)),2);ctx.strokeStyle='#f87171';ctx.lineWidth=1.5;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(WL,y1);ctx.lineTo(WR,y2);ctx.stroke();ctx.setLineDash([])}
    else if(b.age<b.tel+b.hold){glow('#ef4444',18);ctx.strokeStyle='#ef4444';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(WL,y1);ctx.lineTo(WR,y2);ctx.stroke();glow('transparent',0);ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(WL,y1);ctx.lineTo(WR,y2);ctx.stroke()}
    break}
   case 'apulse':{const fl=b.ph===1&&Math.floor(b.t*14)%2===0;
    if(b.ph===2){ctx.strokeStyle='rgba(251,146,60,.5)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-Math.min(120,b.vy*.08));ctx.stroke()}
    if(b.ph===1){ctx.strokeStyle='rgba(248,113,113,.35)';ctx.lineWidth=1;ctx.setLineDash([4,6]);ctx.beginPath();ctx.moveTo(0,10);ctx.lineTo(0,FLOOR-b.y);ctx.stroke();ctx.setLineDash([])}
    glow(fl?'#ef4444':'#fb923c',14);dot(r,fl?'#fecaca':'#fb923c');glow('transparent',0);dot(r*.45,fl?'#ef4444':'#fff7ed');break}
   case 'esph':{const k=b.age/b.life;glow('#38bdf8',18);dot(r+Math.sin(t*12)*1.5,'rgba(56,189,248,.55)');glow('transparent',0);dot(r*.55,'#e0f2fe');
    ctx.strokeStyle=`rgba(125,211,252,${.3+.5*k})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,r+5+k*6,0,7);ctx.stroke();break}
   case 'espk':{glow('#7dd3fc',10);dot(r,'#7dd3fc');glow('transparent',0);dot(r*.45,'#fff');break}
   case 'pdrop':{glow('#a3e635',10);ctx.fillStyle='#a3e635';ctx.beginPath();ctx.moveTo(0,-r*2.2);ctx.quadraticCurveTo(r*1.1,-r*.2,0,r);ctx.quadraticCurveTo(-r*1.1,-r*.2,0,-r*2.2);ctx.fill();break}
   case 'bwave':{const d=Math.sign(b.vx)||1,hh=b.hh*1.15;ctx.scale(d,1);
    ctx.strokeStyle='rgba(17,17,17,.35)';ctx.lineWidth=2;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(-14,i*hh*.6);ctx.lineTo(-50-i*i*10,i*hh*.6);ctx.stroke()}
    glow('#b91c1c',12);ctx.fillStyle='#111';ctx.strokeStyle='#dc2626';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-10,-hh);ctx.quadraticCurveTo(40,0,-10,hh);ctx.quadraticCurveTo(12,0,-10,-hh);ctx.fill();ctx.stroke();break}
   case 'bfish':{ctx.rotate(Math.atan2(b.vy,b.vx));glow('#b91c1c',8);ctx.fillStyle='#111';ctx.strokeStyle='#dc2626';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-13,0);ctx.lineTo(0,-6);ctx.lineTo(15,0);ctx.lineTo(0,6);ctx.closePath();ctx.fill();ctx.stroke();break}
   case 'bleaf':{const on=b.age>=b.tel,x0=-b.w/2;
    if(!on){ctx.globalAlpha=.25+.2*Math.sin(b.age*20);ctx.strokeStyle='#dc2626';ctx.lineWidth=2;ctx.setLineDash([10,8]);ctx.strokeRect(x0,2,b.w,FLOOR-2);ctx.setLineDash([])}
    else{ctx.fillStyle='rgba(185,28,28,.10)';ctx.fillRect(x0,0,b.w,FLOOR);ctx.fillStyle='#b91c1c';
     for(let i=0;i<30;i++){const lx=x0+((i*53+b.age*(40+i%5*18))%b.w),ly=(i*97+b.age*(230+i%4*40))%FLOOR;ctx.save();ctx.translate(lx,ly);ctx.rotate(b.age*5+i);ctx.beginPath();ctx.ellipse(0,0,7,2.6,0,0,7);ctx.fill();ctx.restore()}}
    break}
   case 'bdust':{glow('#000',10);ctx.fillStyle='#1c1917';ctx.beginPath();ctx.ellipse(0,0,20,8,0,0,7);ctx.fill();ctx.fillStyle='#b91c1c';ctx.fillRect(-14,-3,28,2);
    for(let i=0;i<3;i++){ctx.fillStyle='#292524';ctx.beginPath();ctx.moveTo(-10+i*10,2);ctx.lineTo(-6+i*10,-12-i%2*5);ctx.lineTo(-2+i*10,2);ctx.fill()}break}
   case 'bfx':{const k=b.age/b.life;
    if(b.k==='tg'){ctx.globalAlpha=.35+.35*Math.sin(b.age*40);ctx.strokeStyle='#ef4444';ctx.lineWidth=2;ctx.setLineDash([12,9]);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(b.dir*(b.dir>0?WR-b.x:b.x-WL),0);ctx.stroke();ctx.setLineDash([])}
    else if(b.k==='arc'){ctx.scale(b.dir,1);ctx.globalAlpha=1-k;glow('#dc2626',16);ctx.strokeStyle='#111';ctx.lineWidth=14*(1-k)+3;ctx.beginPath();ctx.arc(-10,0,64,-1.1,1.1);ctx.stroke();ctx.strokeStyle='#ef4444';ctx.lineWidth=3;ctx.beginPath();ctx.arc(-10,0,68,-1.1,1.1);ctx.stroke()}
    else if(b.k==='ring'){ctx.globalAlpha=1-k;glow('#dc2626',14);ctx.strokeStyle='#111';ctx.lineWidth=9*(1-k)+2;ctx.beginPath();ctx.ellipse(0,0,40+70*k,9+7*k,0,0,7);ctx.stroke();ctx.strokeStyle='#ef4444';ctx.lineWidth=2;ctx.stroke()}
    else if(b.k==='zr'){ctx.fillStyle=`rgba(239,68,68,${.12+.2*Math.sin(b.age*50)**2})`;ctx.fillRect(-b.w/2,-b.h/2,b.w,b.h)}
    else if(b.k==='rl'){ctx.globalAlpha=.3+.3*Math.sin(b.age*40);ctx.strokeStyle='#ef4444';ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(b.x0-b.x,0);ctx.lineTo(b.x1-b.x,0);ctx.stroke()}
    break}
   case 'eshot':{const col={ice:'#38bdf8',poison:'#22c55e',spore:'#bef264',fire:'#fb923c',void:'#c084fc',light:'#fde047'}[b.el]||'#fff';
    if(b.el==='ice'){ctx.rotate(Math.atan2(b.vy,b.vx));glow(col,12);ctx.fillStyle='#e0f2fe';ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-r*1.6,0);ctx.lineTo(0,-r*.8);ctx.lineTo(r*1.8,0);ctx.lineTo(0,r*.8);ctx.closePath();ctx.fill();ctx.stroke()}
    else if(b.el==='light'){ctx.rotate(Math.atan2(b.vy,b.vx));glow(col,16);ctx.strokeStyle='rgba(253,224,71,.4)';ctx.lineWidth=r*1.4;ctx.beginPath();ctx.moveTo(-26,0);ctx.lineTo(0,0);ctx.stroke();dot(r,col);glow('transparent',0);dot(r*.5,'#fff')}
    else if(b.el==='spore'){ctx.globalAlpha=.55+.15*Math.sin(b.age*5);glow(col,14);dot(r,col);glow('transparent',0);ctx.globalAlpha=.9;dot(r*.4,'#f7fee7');ctx.strokeStyle='#d9f99d';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,r+3+Math.sin(b.age*6)*2,0,7);ctx.stroke()}
    else if(b.el==='fire'){const hue=(b.age*260)%360;glow(`hsl(${hue},95%,60%)`,16);dot(r,`hsl(${hue},95%,60%)`);glow('transparent',0);dot(r*.5,'#fff7ed')}
    else if(b.el==='void'){glow(col,14);dot(r,'#7e22ce');glow('transparent',0);ctx.strokeStyle='#e9d5ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*.65,b.age*8,b.age*8+4);ctx.stroke()}
    else{glow(col,10);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,-r*2);ctx.quadraticCurveTo(r*1.1,-r*.2,0,r);ctx.quadraticCurveTo(-r*1.1,-r*.2,0,-r*2);ctx.fill();glow('transparent',0);ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(-1,-r,2,r*.8)}
    break}
   case 'efx':{ctx.globalAlpha=.35+.5*Math.abs(Math.sin(b.age*45));ctx.strokeStyle='#facc15';ctx.lineWidth=1.8;ctx.setLineDash([8,7]);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(b.x1-b.x,b.y1-b.y);ctx.stroke();ctx.setLineDash([]);break}
   case 'nshot':{glow('#fb7185',10);dot(r,'#fb7185');glow('transparent',0);dot(r*.45,'#fff1f2');break}
  case 'heart':glow('#f472b6',14);ctx.fillStyle='#f472b6';ctx.beginPath();ctx.moveTo(0,r*.9);ctx.bezierCurveTo(-r*1.6,-r*.2,-r*.6,-r*1.4,0,-r*.4);ctx.bezierCurveTo(r*.6,-r*1.4,r*1.6,-r*.2,0,r*.9);ctx.fill();glow('transparent',0);break;
     case 'bghost':{ctx.globalAlpha=b.age<.4?.8-(b.age/.4)*.5:.32+.08*Math.sin(b.age*9);ctx.rotate(b.age*3);ctx.strokeStyle=b.sp?'#67e8f9':(G.round>=8&&b.age>.9?'#fda4af':'#e5e7eb');ctx.lineWidth=2;ctx.beginPath();
    if(b.s===0){ctx.moveTo(0,-r);ctx.lineTo(r,r);ctx.lineTo(-r,r);ctx.closePath()}else if(b.s===1)ctx.rect(-r*.8,-r*.8,r*1.6,r*1.6);else{ctx.moveTo(0,-r*1.2);ctx.lineTo(r,0);ctx.lineTo(0,r*1.2);ctx.lineTo(-r,0);ctx.closePath()}ctx.stroke();break}
   case 'bswell':{const tel=b.tel||.9;
    if(b.age<tel){ctx.globalAlpha=.4+.3*Math.sin(b.age*16);ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.setLineDash([5,5]);ctx.beginPath();ctx.arc(0,0,b.mx,0,7);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=.9;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,4,0,7);ctx.fill()}
    else{ctx.fillStyle='rgba(226,232,240,.35)';ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();ctx.stroke()}break}
   case 'bbounce':glow('#22d3ee',16);dot(r,'#a5f3fc');break;
   case 'zegg':case 'zdreg':case 'ztank':case 'zbounce':case 'zgol':case 'gsweep':case 'brood':drawZSprite(b);break;
   case 'cardlaser':glow('#22d3ee',10);ctx.rotate(b.rot||0);ctx.fillStyle='#ecfeff';ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(9,0);ctx.lineTo(0,14);ctx.lineTo(-9,0);ctx.closePath();ctx.fill();glow('transparent',0);break;
   case 'boomerang':glow('#fde047',12);ctx.rotate(b.rot||0);ctx.fillStyle='#fefce8';ctx.fillRect(-16,-22,32,44);ctx.fillStyle='#111827';ctx.font='bold 22px sans-serif';ctx.textAlign='center';ctx.fillText('\u2660',0,8);glow('transparent',0);break;
   case 'diceray':glow('#f87171',10);ctx.strokeStyle='#fca5a5';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-(b.vx||0)*.05,-(b.vy||0)*.05);ctx.lineTo((b.vx||0)*.05,(b.vy||0)*.05);ctx.stroke();glow('transparent',0);break;
   case 'card':ctx.rotate(b.rot||0);glow('#fff',8);ctx.fillStyle='#f8fafc';ctx.fillRect(-7,-10,14,20);glow('transparent',0);ctx.fillStyle=b.red?'#dc2626':'#111827';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(b.red?'♥':'♠',0,1);break;
   case 'dice':{ctx.rotate(b.rot||0);glow('#fff',6);ctx.fillStyle='#f1f5f9';ctx.fillRect(-r,-r,2*r,2*r);glow('transparent',0);ctx.fillStyle='#b91c1c';
    const PIP={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]};
    for(const[a,d2]of PIP[b.v||1]){ctx.beginPath();ctx.arc(a*r*.55,d2*r*.55,r*.17,0,7);ctx.fill()}break}
   case 'coin':ctx.scale(Math.max(.15,Math.abs(Math.cos(t*8+(b.ph||0)))),1);glow('#fde047',10);ctx.fillStyle='#facc15';ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();glow('transparent',0);ctx.strokeStyle='#a16207';ctx.lineWidth=2;ctx.stroke();break;
   case 'icicle':{if(!b.fall)ctx.translate(Math.sin(t*50)*(Math.abs(b.x-P.x)<90?2:0),0);glow('#7dd3fc',10);ctx.fillStyle='#bae6fd';ctx.strokeStyle='#38bdf8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-r,-r*1.8);ctx.lineTo(r,-r*1.8);ctx.lineTo(0,r*1.5);ctx.closePath();ctx.fill();ctx.stroke();break}
   case 'sinspike':ctx.rotate(Math.atan2(b.vy,b.vx));glow('#22c55e',10);ctx.fillStyle='#14532d';ctx.strokeStyle='#4ade80';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-10,-6);ctx.lineTo(-6,0);ctx.lineTo(-10,6);ctx.closePath();ctx.fill();ctx.stroke();break;
   case 'sinshard':ctx.rotate((b.age||0)*4);glow('#fbbf24',8);ctx.fillStyle='#fcd34d';ctx.beginPath();ctx.moveTo(0,-r*1.6);ctx.lineTo(r,0);ctx.lineTo(0,r*1.6);ctx.lineTo(-r,0);ctx.closePath();ctx.fill();break;
   case 'sinfire':glow('#d946ef',14);dot(r,'#f0abfc');break;
   case 'sinorb':glow('#64748b',16);ctx.fillStyle='#0b0b12';ctx.strokeStyle='#64748b';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();ctx.stroke();break;
   case 'sinshade':glow('#22c55e',14);dot(r,'#14532d');break;
   case 'yukibloom':{ctx.rotate(b.age*.6);glow('#bae6fd',14);ctx.strokeStyle='#e0f2fe';ctx.lineWidth=3;ctx.lineCap='round';for(let i=0;i<6;i++){ctx.rotate(Math.PI/3);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-r);ctx.moveTo(0,-r*.6);ctx.lineTo(-r*.25,-r*.85);ctx.moveTo(0,-r*.6);ctx.lineTo(r*.25,-r*.85);ctx.stroke()}break}
   case 'yukiicicle':{if(!b.fall){ctx.translate(Math.sin(t*50)*2,0);ctx.strokeStyle='rgba(186,230,253,.35)';ctx.lineWidth=2;ctx.setLineDash([6,8]);ctx.beginPath();ctx.moveTo(0,r);ctx.lineTo(0,FLOOR-b.y);ctx.stroke();ctx.setLineDash([])}
    glow('#7dd3fc',10);ctx.fillStyle='#e0f2fe';ctx.strokeStyle='#38bdf8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-r,-r*1.8);ctx.lineTo(r,-r*1.8);ctx.lineTo(0,r*1.6);ctx.closePath();ctx.fill();ctx.stroke();break}
   case 'yukishard':glow('#7dd3fc',8);ctx.fillStyle='#bae6fd';ctx.beginPath();ctx.moveTo(-r*1.3,r*.6);ctx.lineTo(0,-r);ctx.lineTo(r*1.3,r*.6);ctx.closePath();ctx.fill();break;
   case 'svacid':{glow('#84cc16',16);ctx.fillStyle='#65a30d';ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();glow('transparent',0);ctx.fillStyle='#bef264';ctx.beginPath();ctx.arc(-r*.3,-r*.3,r*.45,0,7);ctx.fill();ctx.fillStyle='#ecfccb';ctx.beginPath();ctx.arc(-r*.4,-r*.4,r*.18,0,7);ctx.fill();break}
   case 'svpod':{const open=b.age>b.life-.55,sk=open?Math.sin(t*70)*2.5:0;ctx.translate(sk,0);ctx.rotate(Math.sin(b.age*2+b.ph)*.15);glow(open?'#ef4444':'#a3e635',open?16:8);
    ctx.fillStyle='#cbd5e1';ctx.strokeStyle='#64748b';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,12,19,0,0,7);ctx.fill();ctx.stroke();glow('transparent',0);
    ctx.fillStyle=open&&Math.floor(t*14)%2?'#ef4444':'#4ade80';ctx.beginPath();ctx.arc(0,-2,6,0,7);ctx.fill();ctx.strokeStyle='#475569';ctx.beginPath();ctx.moveTo(-12,6);ctx.lineTo(12,6);ctx.stroke();break}
   case 'svlarva':{const dr=Math.sign(b.vx)||1;glow('#4ade80',8);ctx.fillStyle='#0f172a';ctx.strokeStyle='#22c55e';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,12,7,0,0,7);ctx.fill();ctx.stroke();
    ctx.fillStyle='#4ade80';ctx.beginPath();ctx.arc(dr*7,-2,2.5,0,7);ctx.fill();ctx.lineWidth=1.5;for(let i=-1;i<=1;i++){const l=Math.sin(t*40+i*2)*3;ctx.beginPath();ctx.moveTo(i*5,5);ctx.lineTo(i*5+l,10);ctx.stroke()}break}
   case 'svring':{ctx.translate(0,0);const gw=b.gw,a0=b.gap+gw,a1=b.gap-gw+Math.PI*2,fa=clamp(1.2-b.rad/640,.35,1);
    ctx.globalAlpha=fa;glow('#4ade80',18);ctx.strokeStyle='#86efac';ctx.lineWidth=9;ctx.beginPath();ctx.arc(0,0,b.rad,a0,a1);ctx.stroke();
    glow('transparent',0);ctx.strokeStyle='#fb923c';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,b.rad,a0,a1);ctx.stroke();break}
   default: dot(r,c);
 }
 ctx.restore();
 // trạng thái nổ của bom/điện
 if(b.boom>0){ctx.save();ctx.globalAlpha=Math.min(1,b.boom*2);ctx.strokeStyle=b.type==='chain'?'#38bdf8':'#f97316';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,110*(1-b.boom/.35*.4),0,7);ctx.stroke();ctx.restore()}
}

const SKINS=CONTENT.skins.map(s=>{const im=new Image();im.src=s.img;return Object.assign({},s,{img:()=>im})});
const SPR=SKINS[0].img();
const MAPIMG={};
MAPS.forEach(m=>{if(m.bg){const im=new Image();im.src=m.bg;MAPIMG[m.id]=im}});
// Mapping 23 frame (đánh số từ 1, đọc theo hàng)
const ANIM={idle:[1,2],run:[5,6,7,8,9,10,11,12,13],jump:[15],fall:[17],land:[14],crouch:[18,19,20],dash:[21],hurt:[22],stun:[23]};
function animState(){
 if(P.inv>(P.delay?1.85:0.85))return 'hurt';
 if(P.frozen>0||P.para>0)return 'stun';
 if(P.dash>0)return 'dash';
 if(P.cr)return 'crouch';
 if(!P.gnd)return P.vy<0?'jump':'fall';
 if(Math.abs(P.vx)>10)return 'run';
 return 'idle';
}
/* ============ HIỆU ỨNG SKIN (fx) ============
   Không lưu trạng thái: mọi hạt đều tính từ G.t nên không tốn bộ nhớ, không rò rỉ.
   moon = Thủy Thủ Mặt Trăng · puddle = Heo Peppa · cards = Thủ Lĩnh Thẻ Bài · beach = Tiệc Bãi Biển
   'back' vẽ trước sprite, 'front' vẽ sau sprite. Khi trọng lực bị đảo, hiệu ứng tự lật theo (up). */
const fxH=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
function fxStar(x,y,r,col,al){ctx.save();ctx.globalAlpha=al;ctx.fillStyle=col;ctx.beginPath();
 ctx.moveTo(x,y-r);ctx.lineTo(x+r*.28,y-r*.28);ctx.lineTo(x+r,y);ctx.lineTo(x+r*.28,y+r*.28);ctx.lineTo(x,y+r);ctx.lineTo(x-r*.28,y+r*.28);ctx.lineTo(x-r,y);ctx.lineTo(x-r*.28,y-r*.28);ctx.closePath();ctx.fill();ctx.restore()}
function fxDrops(cols,st,gy,up){   /* giọt bắn phía sau khi chạy, rơi từ chân khi ở trên không */
 const cx=P.x,n=7;ctx.save();
 if(st==='run'||st==='dash'){
  for(let i=0;i<n;i++){const t=(G.t*2.2+i/n)%1,x=cx-P.face*(8+t*58)+(fxH(i)-.5)*8,y=gy+up*Math.sin(t*Math.PI)*(9+15*fxH(i+3));
   ctx.globalAlpha=(1-t*.75);ctx.fillStyle=cols[i%cols.length];ctx.beginPath();ctx.arc(x,y,2.4-t*1.1,0,7);ctx.fill()}
 }else if(!P.gnd){
  for(let i=0;i<5;i++){const t=(G.t*1.7+i/5)%1,x=cx+(fxH(i+7)-.5)*pw()*.8,y=gy-up*(2+t*26);
   ctx.globalAlpha=(1-t);ctx.fillStyle=cols[i%cols.length];ctx.beginPath();ctx.arc(x,y,2.1,0,7);ctx.fill()}
 }
 ctx.restore()}
function fxFall(items,cols,up,gy,kind){   /* vật rơi nhẹ quanh nhân vật (cánh hoa, hoa giấy) */
 const cx=P.x,H=ph();
 for(let i=0;i<items;i++){const t=(G.t*(kind==='petal'?.42:.33)+i/items)%1,x=cx+(fxH(i+9)-.5)*pw()*2.6+Math.sin(G.t*2.3+i)*7,y=gy+up*H*1.15*(1-t);
  ctx.save();ctx.translate(x,y);ctx.rotate(G.t*(2+fxH(i))+i);ctx.globalAlpha=Math.min(1,(1-t)*1.6)*.9;ctx.fillStyle=cols[i%cols.length];
  if(kind==='petal'){ctx.beginPath();ctx.ellipse(0,0,3.6,2,0,0,7);ctx.fill()}else ctx.fillRect(-2.2,-1.2,4.4,2.4);
  ctx.restore()}}
/* Cổ tự: ký tự phù văn nét thẳng tự sinh (không phụ thuộc font) */
function fxRune(x,y,s,seed,col,al){ctx.save();ctx.translate(x,y);ctx.globalAlpha=al;ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.beginPath();
 const n=3+Math.floor(fxH(seed)*3);for(let k=0;k<n;k++){const a=Math.floor(fxH(seed*13+k*5)*4)*Math.PI/4,ox=(fxH(seed*3+k)-.5)*s*.7,oy=(fxH(seed*5+k)-.5)*s*.7,l=s*(.35+.4*fxH(seed+k*9));
  ctx.moveTo(ox-Math.cos(a)*l/2,oy-Math.sin(a)*l/2);ctx.lineTo(ox+Math.cos(a)*l/2,oy+Math.sin(a)*l/2)}
 ctx.stroke();ctx.restore()}
/* Quạ đen: thân + cánh vỗ */
function fxCrow(x,y,s,flap,dir,al){ctx.save();ctx.translate(x,y);ctx.scale(dir,1);ctx.globalAlpha=al;ctx.fillStyle='#0b0b12';
 ctx.beginPath();ctx.ellipse(0,0,s,s*.42,0,0,7);ctx.fill();ctx.beginPath();ctx.arc(s*.85,-s*.12,s*.3,0,7);ctx.fill();
 ctx.beginPath();ctx.moveTo(s*1.1,-s*.18);ctx.lineTo(s*1.55,-s*.06);ctx.lineTo(s*1.1,-s*.02);ctx.fill();
 ctx.beginPath();ctx.moveTo(-s*.9,0);ctx.lineTo(-s*1.7,s*.25);ctx.lineTo(-s*.9,s*.3);ctx.fill();
 ctx.beginPath();ctx.moveTo(-s*.35,-s*.2);ctx.lineTo(-s*.95,-s*(.3+flap*1.2));ctx.lineTo(s*.45,-s*.25);ctx.fill();
 ctx.fillStyle='#ef4444';ctx.beginPath();ctx.arc(s*.95,-s*.17,s*.07,0,7);ctx.fill();ctx.restore()}
function skinFx(kind,layer,st){
 const cx=P.x,H=ph(),Wd=pw(),fl=vFlip(),up=fl?1:-1,gy=fl?P.y-H:P.y,cy=P.y-H/2,onG=P.gnd&&!(P.wings),mv=st==='run'||st==='dash';
 ctx.save();ctx.lineCap='round';
 if(kind==='moon'){
  if(layer==='back'){
   const pl=.8+.2*Math.sin(G.t*4),r=Math.max(Wd,H)*.95,g=ctx.createRadialGradient(cx,cy,r*.1,cx,cy,r);
   g.addColorStop(0,'rgba(255,244,170,.34)');g.addColorStop(.6,'rgba(255,226,140,.16)');g.addColorStop(1,'rgba(255,226,140,0)');
   ctx.globalAlpha=pl;ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fill();
   /* trăng lưỡi liềm sau lưng */
   const mx=cx-P.face*Wd*.62,my=cy+up*H*.2+Math.sin(G.t*2)*3,mr=H*.34;
   ctx.save();ctx.translate(mx,my);ctx.scale(-P.face,1);ctx.globalAlpha=.85;ctx.shadowColor='#fde047';ctx.shadowBlur=14;
   ctx.beginPath();ctx.arc(0,0,mr,0,7);ctx.clip();ctx.fillStyle='#fde68a';ctx.beginPath();ctx.rect(-2*mr,-2*mr,4*mr,4*mr);ctx.arc(mr*.5,-mr*.12,mr*.82,0,7);ctx.fill('evenodd');ctx.restore();
  }else{
   for(let i=0;i<6;i++){const a=G.t*.9+i*1.047,tw=.5+.5*Math.sin(G.t*6+i*2);
    fxStar(cx+Math.cos(a)*Wd*.95,cy+Math.sin(a)*H*.46,2.5+3*tw,i%2?'#fbcfe8':'#fff7b0',.35+.65*tw)}
   if(mv)for(let i=0;i<9;i++){const t=(G.t*1.7+i/9)%1;fxStar(cx-P.face*(Wd*.4+t*74),cy+(fxH(i)-.5)*H*.9,2+3.2*(1-t),i%2?'#fbcfe8':'#fde047',1-t)}
   else if(!P.gnd)for(let i=0;i<5;i++){const t=(G.t*1.4+i/5)%1;fxStar(cx+(fxH(i+4)-.5)*Wd*.9,gy-up*(4+t*34),2+2*(1-t),'#fde68a',1-t)}
  }
 }else if(kind==='puddle'){
  if(layer==='back'&&onG&&!fl){
   const rx=Wd*.95;ctx.fillStyle='rgba(88,56,30,.6)';ctx.beginPath();ctx.ellipse(cx,gy+2,rx,6.5,0,0,7);ctx.fill();
   ctx.fillStyle='rgba(150,104,62,.45)';ctx.beginPath();ctx.ellipse(cx-3,gy+1,rx*.7,4,0,0,7);ctx.fill();
   ctx.lineWidth=1.5;for(let k=0;k<2;k++){const t=(G.t*.9+k*.5)%1;ctx.globalAlpha=(1-t)*.7;ctx.strokeStyle='#d8b184';ctx.beginPath();ctx.ellipse(cx,gy+2,rx*(.25+.75*t),6.5*(.25+.75*t),0,0,7);ctx.stroke()}
  }else if(layer==='front')fxDrops(['#7a4a22','#9a6a3a','#5b3719'],st,gy,up);
 }else if(kind==='cards'){
  if(layer==='back'&&onG&&!fl){
   const rx=Wd*1.05,ry=7;ctx.fillStyle='rgba(255,182,215,.28)';ctx.beginPath();ctx.ellipse(cx,gy+3,rx,ry,0,0,7);ctx.fill();
   ctx.strokeStyle='rgba(255,150,200,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(cx,gy+3,rx,ry,0,0,7);ctx.stroke();
   ctx.strokeStyle='rgba(253,224,71,.8)';ctx.lineWidth=1.4;ctx.beginPath();
   for(let i=0;i<=6;i++){const a=G.t*.9+i*2.0944;const x=cx+Math.cos(a)*rx*.92,y=gy+3+Math.sin(a)*ry*.92;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();
   ctx.beginPath();for(let i=0;i<=6;i++){const a=G.t*.9+Math.PI/3+i*2.0944;const x=cx+Math.cos(a)*rx*.92,y=gy+3+Math.sin(a)*ry*.92;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();
  }
  for(let i=0;i<3;i++){const a=G.t*1.5+i*2.0944,z=Math.sin(a);
   if((z>0)!==(layer==='front'))continue;
   const x=cx+Math.cos(a)*Wd*.98,y=cy+z*H*.2-up*H*.06,sc=.85+.2*z,w=14*sc*(.35+.65*Math.abs(Math.cos(G.t*3+i))),h=20*sc;
   ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(G.t*2+i)*.25);ctx.shadowColor='#f9a8d4';ctx.shadowBlur=8;
   ctx.fillStyle='#ffd1e6';ctx.strokeStyle='#e0508f';ctx.lineWidth=1.6;ctx.beginPath();ctx.rect(-w/2,-h/2,w,h);ctx.fill();ctx.stroke();ctx.shadowBlur=0;
   fxStar(0,0,Math.min(w,h)*.32,'#facc15',1);ctx.restore()}
  if(layer==='front')fxFall(8,['#ffb7d5','#ff8fbf','#ffd6e8'],up,gy,'petal');
 }else if(kind==='xianxia'){
  if(layer==='back'){
   const pl=.8+.2*Math.sin(G.t*3),r=Math.max(Wd,H)*1.05,g=ctx.createRadialGradient(cx,cy,r*.1,cx,cy,r);
   g.addColorStop(0,'rgba(253,230,138,.3)');g.addColorStop(.6,'rgba(125,211,252,.13)');g.addColorStop(1,'rgba(253,230,138,0)');
   ctx.globalAlpha=pl;ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fill();
   if(onG&&!fl){ /* trận pháp dưới chân: vòng sáng + vạch xoay */
    const rx=Wd*1.15;ctx.globalAlpha=.8;ctx.strokeStyle='#fde68a';ctx.lineWidth=1.6;ctx.shadowColor='#f59e0b';ctx.shadowBlur=8;
    ctx.beginPath();ctx.ellipse(cx,gy+2,rx,6,0,0,7);ctx.stroke();ctx.beginPath();ctx.ellipse(cx,gy+2,rx*.62,3.8,0,0,7);ctx.stroke();ctx.shadowBlur=0;
    for(let i=0;i<8;i++){const a=G.t*.7+i*.785;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*rx*.62,gy+2+Math.sin(a)*3.8);ctx.lineTo(cx+Math.cos(a)*rx,gy+2+Math.sin(a)*6);ctx.stroke()}}
  }
  for(let i=0;i<6;i++){const a=G.t*(mv?1.5:.8)+i*1.047,z=Math.sin(a);if((z>0)!==(layer==='front'))continue;
   const x=cx+Math.cos(a)*Wd*1.2,y=cy+z*H*.16+Math.sin(G.t*2+i)*4-up*H*.02,sz=8+2*z;
   ctx.shadowColor='#f59e0b';ctx.shadowBlur=6;fxRune(x,y,sz,i+3,i%2?'#fde68a':'#fef3c7',.35+.3*Math.abs(z))}
  if(layer==='front'){ctx.shadowBlur=0;
   for(let i=0;i<6;i++){const t=(G.t*.55+i/6)%1;fxStar(cx+(fxH(i+4)-.5)*Wd*1.5+Math.sin(G.t*2+i)*5,gy+up*H*(.1+1.1*t),1.8+2*(1-t),i%2?'#fde68a':'#bae6fd',(1-t)*.9)}
   fxFall(5,['#fbcfe8','#fff1f2'],up,gy,'petal')}
 }else if(kind==='sharingan'){
  if(layer==='back'){
   const pl=.75+.25*Math.sin(G.t*5),r=Math.max(Wd,H)*1.0,g=ctx.createRadialGradient(cx,cy,r*.1,cx,cy,r);
   g.addColorStop(0,'rgba(220,38,38,.16)');g.addColorStop(.6,'rgba(127,29,29,.08)');g.addColorStop(1,'rgba(127,29,29,0)');
   ctx.globalAlpha=pl;ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fill();
   if(onG&&!fl){ctx.globalAlpha=.4;ctx.fillStyle='#450a0a';ctx.beginPath();ctx.ellipse(cx,gy+2,Wd*1.0,6,0,0,7);ctx.fill()}
  }
  for(let i=0;i<3;i++){const a=G.t*(mv?2.6:1.4)+i*2.094,z=Math.sin(a);if((z>0)!==(layer==='front'))continue;
   const x=cx+Math.cos(a)*Wd*1.25,y=cy-up*H*.0+z*H*.12-H*.32*up*-1+Math.sin(G.t*3+i)*5,dir=Math.cos(a+1.57)>0?1:-1;
   fxCrow(x,y,6+1.5*z,Math.sin(G.t*16+i*2),dir,.9)}
  if(layer==='front'){
   fxFall(8,['#111827','#1f2937','#7f1d1d'],up,gy,'petal');
   const ex=cx+P.face*Wd*.2,ey=cy+up*H*.2,rot=G.t*3,pl=.55+.45*Math.sin(G.t*6);
   ctx.save();ctx.translate(ex,ey);ctx.globalAlpha=pl;ctx.shadowColor='#ef4444';ctx.shadowBlur=10;ctx.fillStyle='#dc2626';ctx.beginPath();ctx.arc(0,0,3,0,7);ctx.fill();
   ctx.fillStyle='#0b0b12';for(let k=0;k<3;k++){const a=rot+k*2.094;ctx.beginPath();ctx.arc(Math.cos(a)*1.7,Math.sin(a)*1.7,.6,0,7);ctx.fill()}ctx.restore();
   if(mv)for(let i=0;i<5;i++){const t=(G.t*2+i/5)%1;ctx.globalAlpha=1-t;fxCrow(cx-P.face*(Wd*.6+t*70),cy+(fxH(i)-.5)*H*.9,4,Math.sin(G.t*18+i),P.face,1-t)}}
 }else if(kind==='beach'){
  if(layer==='back'){
   if(onG&&!fl){const rx=Wd*.95;ctx.fillStyle='rgba(125,211,252,.28)';ctx.beginPath();ctx.ellipse(cx,gy+2,rx,6,0,0,7);ctx.fill();
    ctx.lineWidth=1.5;for(let k=0;k<2;k++){const t=(G.t*.8+k*.5)%1;ctx.globalAlpha=(1-t)*.8;ctx.strokeStyle='#e0f2fe';ctx.beginPath();ctx.ellipse(cx,gy+2,rx*(.3+.7*t),6*(.3+.7*t),0,0,7);ctx.stroke()}}
  }else{
   for(let i=0;i<7;i++){const t=(G.t*.5+i/7)%1,x=cx+Math.sin(G.t*1.6+i*2)*Wd*.8+(fxH(i)-.5)*Wd*.5,y=gy+up*H*(.1+1.05*t),r=2+3*fxH(i+2);
    ctx.globalAlpha=Math.min(1,(1-t)*1.8)*.9;ctx.strokeStyle='#bae6fd';ctx.fillStyle='rgba(186,230,253,.2)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.stroke();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-r*.35,y-r*.35,r*.25,0,7);ctx.fill()}
   ctx.globalAlpha=1;fxFall(10,['#fb7185','#fde047','#38bdf8','#fb923c','#a3e635'],up,gy,'confetti');
   fxDrops(['#f5d79a','#7dd3fc','#e0f2fe'],st,gy,up);
   const tw=.5+.5*Math.sin(G.t*5);fxStar(cx+P.face*Wd*.55,cy+up*H*.42,2+3*tw,'#fef9c3',.4+.6*tw);
  }
 }
 ctx.restore()}
function drawPlayer(){
 const st=animState(),_sk0=SKINS.find(x=>x.id===SHOP.equip),AN=(_sk0&&_sk0.anim)?Object.assign({},ANIM,_sk0.anim):ANIM;
 let list=AN[st];if(AN.apex&&(st==='jump'||st==='fall')&&Math.abs(P.vy)<150)list=AN.apex;
 const fps={run:12,idle:2}[st]||0;
 const fr=list[fps?Math.floor(G.t*fps)%list.length:0];
 const sx=((fr-1)%6)*96,sy=Math.floor((fr-1)/6)*96;
 const size=64*P.scale;
  if(P.wings){const fl=Math.sin(G.t*14)*.25,k=P.scale;ctx.save();ctx.translate(P.x,P.y-ph()*.62);ctx.globalAlpha=.85;ctx.fillStyle='#e0f2fe';ctx.strokeStyle='#7dd3fc';ctx.lineWidth=2;
    for(const sd of[-1,1]){ctx.save();ctx.scale(sd,1);ctx.rotate(-.5+fl);ctx.beginPath();ctx.moveTo(8*k,0);ctx.quadraticCurveTo(46*k,-26*k,40*k,10*k);ctx.quadraticCurveTo(26*k,2*k,8*k,8*k);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
    ctx.restore()}
  const _sk=SKINS.find(x=>x.id===SHOP.equip);
  if(_sk&&_sk.fx==='hero'&&!G.contrast){
    const cx=P.x,cy=P.y-ph()/2,r=Math.max(pw(),ph())*.85,pl=.75+.25*Math.sin(G.t*6);
    ctx.save();ctx.globalAlpha=pl;
    const gr=ctx.createRadialGradient(cx,cy,r*.1,cx,cy,r);
    gr.addColorStop(0,'rgba(250,204,21,.28)');gr.addColorStop(.55,'rgba(56,189,248,.16)');gr.addColorStop(1,'rgba(56,189,248,0)');
    ctx.fillStyle=gr;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fill();
    if(st==='run'||st==='dash'||!P.gnd){
      ctx.strokeStyle=st==='dash'?'rgba(186,230,253,.9)':'rgba(186,230,253,.55)';ctx.lineWidth=2;ctx.lineCap='round';
      for(let k=0;k<4;k++){
        const ly=P.y-ph()*(.2+.2*k),ln=16+((G.t*90+k*23)%22),off=((G.t*140+k*37)%26);
        const x0=cx-P.face*(pw()*.55+off);
        ctx.beginPath();ctx.moveTo(x0,ly);ctx.lineTo(x0-P.face*ln,ly);ctx.stroke();
      }
    }
    ctx.restore();
  }
  if(_sk&&_sk.fx&&_sk.fx!=='hero'&&!G.contrast)skinFx(_sk.fx,'back',st);
  ctx.save();
 if(G.contrast)ctx.filter='brightness(0) invert(1)';
 if(P.inv>0&&Math.floor(P.inv*12)%2===0)ctx.globalAlpha=.35;
 if(vFlip()){ctx.translate(P.x,P.y-ph());ctx.scale(P.face,-1)}else{ctx.translate(P.x,P.y);ctx.scale(P.face,1)}
 if(curSpr().complete&&curSpr().naturalWidth)ctx.drawImage(curSpr(),sx,sy,96,96,-size/2,-size*.92,size,size);
 else{ctx.fillStyle='#f9a8d4';ctx.fillRect(-14*P.scale,-56*P.scale,28*P.scale,56*P.scale)}
 ctx.restore();
 if(_sk&&_sk.fx&&_sk.fx!=='hero'&&!G.contrast)skinFx(_sk.fx,'front',st);
 if(P.shield>0){ctx.strokeStyle='#38bdf8';ctx.globalAlpha=.6;ctx.lineWidth=2;ctx.beginPath();ctx.arc(P.x,P.y-ph()/2,Math.max(pw(),ph())*.7,0,7);ctx.stroke();ctx.globalAlpha=1}
 if(P.frozen>0){ctx.fillStyle='rgba(103,232,249,.35)';ctx.fillRect(P.x-pw()/2,P.y-ph(),pw(),ph())}
 if(P.para>0){ctx.fillStyle='rgba(250,204,21,.35)';ctx.fillRect(P.x-pw()/2,P.y-ph(),pw(),ph());ctx.strokeStyle='#fef08a';ctx.lineWidth=2;
  for(let i=0;i<3;i++){const sx=P.x+rnd(-pw()/2,pw()/2),sy=P.y-rnd(0,ph());ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+rnd(-9,9),sy+rnd(-9,9));ctx.stroke()}}
 if(P.dot){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(P.x,P.y-ph()/2,2.5,0,7);ctx.fill()}
}

function drawHUD(){
 $('hp').textContent=Math.ceil(G.hp);{const mx=Math.max(10,P.hpCap||300),unit=Math.max(10,Math.ceil(mx/30)),seg=Math.ceil(mx/unit),on=Math.ceil(G.hp/unit);$('hpbar').innerHTML=Array.from({length:seg},(_,i)=>`<i style="display:inline-block;width:6px;height:12px;margin-right:1px;border-radius:2px;background:${i<on?(G.hp/mx<.35?'#ef4444':'#22c55e'):'#374151'}"></i>`).join('')}$('rd').textContent=G.round;
 $('tm').textContent=G.timeLeft.toFixed(1);$('dm').textContent=dmgOf(G.round);
 $('mp').textContent=G.map.name;
 const s=[];if(G.boss&&!G.boss.dead)s.push('🔫 J: bắn boss');
 if(G.wh&&G.wh.k)s.push(WHN[G.wh.k]);if(G.gf&&G.gf.k)s.push(G.gf.k==='low'?'🪐 Trọng lực yếu':'🌀 Bị kéo');
 if(P.shield)s.push('🛡️x'+P.shield);if(P.poison.length)s.push('☠️x'+P.poison.length);
 if(P.slow>0)s.push('🥶chậm');if(G.ev&&EVN[G.ev.k])s.push(EVN[G.ev.k]);if(G.ev&&G.ev.k==='disaster')s.push('🌪 '+G.ev.d.name);if(P.frozen>0)s.push('❄️băng');if(P.para>0)s.push('⚡tê liệt');if(P.psT>0)s.push('🌼nhanh');if(P.pjT>0)s.push('💜nhảy thấp');if(P.hasDash)s.push('💨Lướt');if(P.wings)s.push('🪽Cánh');if(P.inf)s.push('♾️Vô hạn');if(P.delay)s.push('⏳Trì hoãn');if(P.lamp)s.push('🔦Đèn pin');if(G.quickRound)s.push('⚡Nhanh gọn');
 $('hstat').textContent=s.join('  ');
 $('tsh').style.display=(G.boss&&!G.boss.dead)?'':'none';
 $('td').style.display=P.hasDash?'':'none';
 $('tbl').style.display=P.skills.includes('blast')?'':'none';
 $('tbl').textContent=P.blastCD>0?'💥'+Math.ceil(P.blastCD):'💥';
 updSkBar();
}

/* ============ FLOW ============ */
function hideAll(){['m-menu','m-quiz','m-buff','m-over'].forEach(id=>$(id).classList.add('hide'))}

function startRun(){
 Object.assign(P,{quick:false,wings:false,inf:false,lamp:false,delay:false,exp:{},tiny:false,smart:false,invest:false,sixth:false,skCD:{},pact:false,regen:false,regenT:0,hpCap:0,sprintT:0,ghostT:0,x:450,y:FLOOR,vx:0,vy:0,face:1,cr:false,gnd:true,jumps:1,maxJ:1,dash:0,dashCD:0,hasDash:false,skills:[],blastCD:0,inv:1,frozen:0,slow:0,poison:[],pt:0,scale:1,shrinks:0,speedM:1,speedRound:1,jumpM:1,shield:0,dot:false,walk:0,fat:false,charge:false,chargeT:0,decoy:false,decoyUsed:false,absorb:false,dodge:0});
 Object.assign(G,{luckShield:0,jack:null,contrast:false,easyRound:false,upgradeDraw:false,bet2:null,dmgAdd:0,speedAdj:1,sizeAdj:1,betPrev:undefined,calmRound:false,nextB:null,nextType:null,timeStop:0,challengeRound:false,hp:30,round:1,bulletM:1,bulletSlowR:1,healPerQ:1,imm:{},corrects:0,storm:0,stormCD:0,parts:[],texts:[],bullets:[],banner:null,bannerT:0,mode:'playing',map:MAPS[0],envPool:null,breed:false,heartT:1.5,pend:{immune:{},slow:1,speed:1,env:null,breed:false}});
 Qstate.used=[];
 setupRound();
}

function setupRound(){
 const pd=G.pend;
 for(const k in P.exp){if(G.round>P.exp[k]){P[k]=false;delete P.exp[k]}}
 G.timeLeft=Math.min(45,20+(G.round-1)*3);G.spawnT=.6;G.heartT=1.5;G.bullets=[];
 G.imm=pd.immune;G.bulletSlowR=pd.slow;P.speedRound=pd.speed;G.breed=pd.breed;
 G.pend={immune:{},slow:1,speed:1,env:null,breed:false};
 G.ev=null;G.evCD=rnd(7,12);
 G.challengeRound=!!pd.challenge;if(G.challengeRound)G.timeLeft*=2;
 G.quickRound=!!pd.quick;if(G.quickRound)G.timeLeft=Math.max(8,Math.round(G.timeLeft*.65));
 G.calmRound=!!pd.calm;G.contrast=!!pd.contrast;G.easyRound=!!pd.easy;if(P.tiny)gainHP(Math.max(1,Math.round(2*DIFF.heal)));
 if(pd.env){G.map=MAPS.find(m=>m.id===pd.env);G.envPool=ENV_POOL[pd.env]}
 else{G.envPool=null;G.map=pick(MAPS.filter(m=>m!==G.map))}
 G.wh=null;G.gf=null;G.mp=null;G.blocks=[];P.psT=0;P.pjT=0;P.padT=0;P.iv=0;startBoss();P.inv=pd.invincible||1.2;G.mode='playing';
 hideAll();
 banner(G.boxNote?(G.boxNote+' · Vòng '+G.round):`Vòng ${G.round} — ${G.map.name}`);G.boxNote=null;if(G.boss)bossIntro();
 updateHUDStatic();
}
function updateHUDStatic(){drawHUD()}

function startRevive(){
 G.mode='quiz';Q.kind='revive';Q.n=0;
 $('qt').textContent='💔 Hồi sinh sinh tử';
 $('qs').textContent='Trả lời ĐÚNG câu này để hồi sinh. Sai ngay câu đầu = Game Over.';
 nextQ();
}
function openBonus(){
 G.mode='quiz';Q.kind='bonus';Q.n=0;
 $('qt').textContent='🎓 Câu hỏi thưởng';
 $('qs').textContent='Không bắt buộc. Trả lời đúng +10 HP, sai không bị phạt.';
 nextQ();
}

function nextQ(){
 const d=P.smart?3:(G.round<=4?1:G.round<=9?2:3);
 let pool=QUESTIONS.filter(q=>q.d===d&&!Qstate.used.includes(q));
 if(!pool.length)pool=QUESTIONS.filter(q=>!Qstate.used.includes(q));
 if(!pool.length){Qstate.used=[];pool=QUESTIONS}
 Q.cur=pick(pool);Qstate.used.push(Q.cur);
 renderQ();
}

function renderQ(){
 const q=Q.cur,box=$('qo');box.innerHTML='';Q.qt=(P.quick&&Q.kind!=='pop')?5:0;
 $('qx').textContent=q.q;
 const ord=q.o.map((_,k)=>k);
 for(let k=ord.length-1;k>0;k--){const r=Math.floor(Math.random()*(k+1));[ord[k],ord[r]]=[ord[r],ord[k]]}
 Q.ca=ord.indexOf(q.a);
 ord.forEach((src,i)=>{
   const b=document.createElement('button');b.className='opt';b.textContent=String.fromCharCode(65+i)+'. '+q.o[src];
   b.onclick=()=>answer(i);box.appendChild(b);
 });
 $('qexp').textContent='';$('qa').innerHTML='';
 if(Q.kind==='bonus')addBtn($('qa'),'Bỏ qua',showBuffs,'o');
 $('m-quiz').classList.remove('hide');
}

function addBtn(parent,label,fn,cls){
 const b=document.createElement('button');b.className='btn '+(cls||'');b.textContent=label;b.onclick=fn;parent.appendChild(b);
}

function answer(i){
 const q=Q.cur,ok=i===Q.ca;const qleft=Q.qt||0;Q.qt=0;bet2Track(ok);
 if(ok){coinGain(P.invest?2:1);if(P.pact)gainHP(1);if(P.smart)gainHP(3);if(P.quick&&Q.kind!=='pop')gainHP(Math.max(1,Math.ceil(qleft)))}
 [...$('qo').children].forEach((b,j)=>{
   b.disabled=true;
   if(j===Q.ca)b.classList.add('ok');else if(j===i&&!ok)b.classList.add('bad');
 });
 $('qexp').textContent=(ok?'✅ Chính xác! ':'❌ Chưa đúng. ')+(q.e||'');
 if(ok&&G.mode==='playing'&&G.boss&&!G.boss.dead&&G.boss.d.ai==='casino'){G.luckShield=Math.min(1,(G.luckShield||0)+1);popText('🍀 Khiên May Mắn sẵn sàng',P.x,P.y-110,'#fbbf24')}
 const act=$('qa');act.innerHTML='';
 if(Q.kind==='pop'){popResolve(ok,false)}else if(Q.kind==='revive'){
   if(ok){
     Q.n++;G.corrects++;gainHP(G.healPerQ);popText(`+${G.healPerQ*10} HP`,P.x,P.y-80,'#10b981');
     addBtn(act,'⚔️ Vào chơi ngay',resumeGame,'g');
     addBtn(act,'➕ Trả lời tiếp để tích máu',nextQ,'');
   }else{
     if(Q.n===0)addBtn(act,'💀 Xem kết quả',()=>gameOver('Trả lời sai câu hỏi đầu tiên!'),'r');
     else addBtn(act,'⚔️ Vào chơi tiếp',resumeGame,'g');
   }
 }else{
   if(ok){gainHP(P.smart?0:1);G.corrects++}
   addBtn(act,'🎁 Chọn thẻ hiệu ứng',showBuffs,'g');
 }
}

function resumeGame(){
 hideAll();
 G.bullets=G.bullets.filter(b=>{const dx=b.x-P.x,dy=b.y-(P.y-ph()/2);return Math.hypot(dx,dy)>140});
 P.inv=1.5;G.mode='playing';
}

/* ============ BUFFS ============ */
const SKN={dash:'💨 Lướt Dash',blast:'💥 Bộc Phá'};
const ENVS=[{id:'lab',n:'Phòng Thí Nghiệm',ic:'🧪'},{id:'temple',n:'Độ Kiếp Trận Pháp',ic:'⛩️'},{id:'dungeon',n:'Hầm Ngục Cổ',ic:'🏚️'},{id:'minimal',n:'Tối Giản',ic:'⬛'},{id:'space',n:'Trạm Vũ Trụ',ic:'🪐'}];
const ENV_POOL={lab:['sine','orb','laser','boomerang','chain'],temple:['orb','accel','burst','homing','expanding'],dungeon:['roller','spike','bomb','venom','high'],minimal:['high','rain','splitter','phantom','accel'],space:['frost','freeze','blackhole','gravity','phantom'],casino:['card','dice','coin','bouncer','orb'],ice:['icicle','frost','freeze','rain','roller'],void:['blackhole','portal','phantom','gravity','accel'],woods:['homing','phantom','orb','sine','splitter'],cityz:['meteor','roller','high','mine','boulder'],bamboo:['boomerang','rain','sine','sniper','high']};
const BASE_BUFFS=[
 {ic:'🦘',t:'Nhảy Kép',d:'Thêm 1 lần nhảy trên không.',ok:()=>P.maxJ<2,apply:()=>{P.maxJ=2}},
 {ic:'💨',t:'Lướt Dash',d:'Kỹ năng chủ động: lướt 0.3s xuyên đạn, hồi 3s (Shift).',ok:()=>!P.skills.includes('dash'),skill:'dash'},
 {ic:'💥',t:'Bộc Phá',d:'Kỹ năng chủ động: làm nổ mọi đạn trong bán kính 260px, hồi 12s (Q).',ok:()=>!P.skills.includes('blast'),skill:'blast'},
 {ic:'🔽',t:'Thu Nhỏ',d:'-15% kích thước và hitbox (tối đa 3 lần).',ok:()=>P.shrinks<3,apply:()=>{P.shrinks++;P.scale*=.85}},
 {ic:'⚡',t:'Tăng Tốc & Bật Cao',d:'+15% tốc độ chạy và lực nhảy.',ok:()=>true,apply:()=>{P.speedM*=1.15;P.jumpM*=1.15}},
 {ic:'🛡️',t:'Giáp Năng Lượng',d:'Chặn miễn phí 1 đòn trúng.',ok:()=>true,apply:()=>{P.shield++}},
 {ic:'💚',t:'Hồi Phục & Thanh Tẩy',d:'+3 HP và xóa Độc, Băng, Tuyết.',ok:()=>true,apply:()=>{gainHP(3);P.poison=[];P.slow=0;P.frozen=0}},
 {ic:'🎯',t:'Tâm Điểm',d:'Hiện chấm sáng ở tâm hitbox.',ok:()=>!P.dot,apply:()=>{P.dot=true}},
 {ic:'🧊',t:'Kháng Băng',d:'Miễn nhiễm Băng và Tuyết trong vòng kế tiếp.',ok:()=>true,apply:()=>{G.pend.immune.ice=true}},
 {ic:'🔌',t:'Kháng Điện',d:'Miễn nhiễm Đạn điện lan trong vòng kế tiếp.',ok:()=>true,apply:()=>{G.pend.immune.elec=true}},
 {ic:'☠️',t:'Kháng Độc',d:'Miễn nhiễm Đạn độc trong vòng kế tiếp.',ok:()=>true,apply:()=>{G.pend.immune.poison=true}},
 {ic:'🕳️',t:'Kháng Hố Đen',d:'Miễn nhiễm Hố đen và Bom đẩy lùi trong vòng kế tiếp.',ok:()=>true,apply:()=>{G.pend.immune.gravity=true}},
 {ic:'🧬',t:'Khổng Lồ Hóa',d:'Nhân đôi HP hiện tại, kích thước +45% vĩnh viễn.',risk:true,ok:()=>true,apply:()=>{G.hp*=2;P.scale*=1.45}},
 {ic:'📚',t:'Thỏa Ước Học Giả',d:'Đạn nhanh hơn 20%; mỗi câu đúng khi hồi sinh +20 HP.',risk:true,ok:()=>true,apply:()=>{G.bulletM*=1.2;G.healPerQ=2}},
 {ic:'👼',t:'Thế Thân',d:'Một lần duy nhất: khi về 0 HP tự hồi 1 HP, không cần trả lời câu hỏi.',ok:()=>!P.decoy&&!P.decoyUsed,apply:()=>{P.decoy=true}},
 {ic:'🕸️',t:'Hấp Thụ Đạn',d:'Cứ né được 10 viên đạn thì hồi 1 HP.',ok:()=>!P.absorb,apply:()=>{P.absorb=true}},
 {ic:'🧭',t:'Bậc Thầy Né Tránh',d:'Vòng kế tiếp: bạn nhanh hơn 20%, đạn chậm hơn 20%.',ok:()=>true,apply:()=>{G.pend.speed*=1.2;G.pend.slow*=.8}},
 {ic:'💗',t:'Sinh Sôi Nảy Nở',d:'Vòng kế tiếp xuất hiện đạn trái tim: chạm vào để hồi 1 HP.',ok:()=>!G.pend.breed,apply:()=>{G.pend.breed=true}},
 {ic:'🥩',t:'Da Dày Thịt Béo',d:'Mỗi lần trúng đạn có 50% cơ hội giảm một nửa sát thương.',ok:()=>!P.fat,apply:()=>{P.fat=true}},
 {ic:'🏃',t:'Xung Phong',d:'Cứ 10 giây có 1 lá chắn. Nếu có Lướt Dash, mỗi lần lướt tạo lá chắn.',ok:()=>!P.charge,apply:()=>{P.charge=true}}
];
const EXTRA_CARDS=[
 {ic:'😈',t:'Khế Ước Quỷ Dữ',d:'Đạn gây thêm 2 sát thương. Mỗi câu trả lời đúng cộng thêm 1 HP.',risk:true,ok:()=>!P.pact,apply:()=>{P.pact=true}},
 {ic:'🌱',t:'Tái Sinh',d:'Cứ 3 giây hồi 1 HP.',ok:()=>!P.regen,apply:()=>{P.regen=true}},
 {ic:'✨',t:'Khiên Thánh Quang',d:'Kỹ năng chủ động (E): tạo 1 lớp khiên, hồi 15 giây.',ok:()=>!P.skills.includes('holy'),skill:'holy'},
 {ic:'⏸️',t:'Ngưng Đọng Thời Gian',d:'Kỹ năng chủ động (R): đạn đứng yên 3 giây, hồi 25 giây.',ok:()=>!P.skills.includes('stop'),skill:'stop'},
 {ic:'⚡',t:'Siêu Tốc',d:'Kỹ năng chủ động (F): tăng 20% tốc độ trong 5 giây, hồi 14 giây.',ok:()=>!P.skills.includes('sprint'),skill:'sprint'},
 {ic:'🎲',t:'Thử Thách Mưa Bom',d:'Vòng sau gấp đôi thời gian và có mưa bom. Thắng thêm 10 HP.',risk:true,ok:()=>!G.pend.challenge,apply:()=>{G.pend.challenge=true}},
 {ic:'🌳',t:'Trưởng Thành',d:'Giới hạn HP tối đa 300 và ngay lập tức đầy 300 HP.',risk:true,ok:()=>!P.hpCap,apply:()=>{P.hpCap=300;G.hp=300}},
 {ic:'👻',t:'Tàng Hình',d:'Kỹ năng chủ động (G): đi xuyên qua đạn trong 3 giây, hồi 18 giây.',ok:()=>!P.skills.includes('ghost'),skill:'ghost'},
 ];
const NEW2=[
 {ic:'🐣',t:'Khổng Lồ Tí Hon',d:'Mỗi vòng bắt đầu cộng thêm 2 HP.',ok:()=>!P.tiny,apply:()=>{P.tiny=true}},
 {ic:'🧠',t:'Thử Thách Thông Minh',d:'Từ giờ toàn câu hỏi khó. Trả lời đúng +3 HP.',risk:true,ok:()=>!P.smart,apply:()=>{P.smart=true}},
 {ic:'🎲',t:'Đánh Cược',d:'Máu hiện tại về 10. Nếu thắng vòng tiếp theo, hoàn trả lại toàn bộ máu đã mất.',risk:true,ok:()=>G.betPrev===undefined,apply:()=>{G.betPrev=G.hp;G.hp=10}},
 {ic:'👁️',t:'Giác Quan Thứ 6',d:'Hiện đường đi dự kiến của viên đạn sắp xuất hiện.',ok:()=>!P.sixth,apply:()=>{P.sixth=true}},
 {ic:'🕊️',t:'Bình Yên',d:'Vòng sau không có thiên tai.',ok:()=>!G.pend.calm,apply:()=>{G.pend.calm=true}},
 {ic:'💰',t:'Đầu Tư',d:'Mỗi câu trả lời đúng nhận x2 xu.',ok:()=>!P.invest,apply:()=>{P.invest=true}},
 {ic:'💱',t:'Lấy Tiền Đổi Mạng',d:'Trừ 50% xu (tối đa 100 xu) và nhận lại HP bằng 1/2 số xu đã trừ.',risk:true,ok:()=>SHOP.coins>0,apply:()=>{const d=Math.min(100,Math.floor(SHOP.coins*.5));SHOP.coins-=d;saveShop();updateCoinUI();gainHP(Math.floor(d/2));popText('💱 +'+Math.floor(d/2)+' HP',P.x,P.y-80,'#fde047')}},
 {ic:'🛡️',t:'Không Thể Cản Phá',d:'Bất tử 5 giây đầu vòng sau.',ok:()=>!G.pend.invincible,apply:()=>{G.pend.invincible=5}}
];
const NEW3=[
 {ic:'🌙',t:'Tương Phản',d:'Map tiếp theo: nhân vật hóa trăng sáng, đạn đen.',ok:()=>!G.pend.contrast,apply:()=>{G.pend.contrast=true}},
 {ic:'🎰',t:'Nổ Hũ',d:'3 vòng tới: câu đúng không nhận xu ngay mà dồn lại. Sống hết 3 vòng nhận x2 số xu dồn; chết thì mất hết.',risk:true,ok:()=>!G.jack,apply:()=>{G.jack={left:3,pool:0}}},
 {ic:'💎',t:'Đầu Tư II',d:'Trả 100 xu: lượt rút thẻ sau có tỷ lệ Vàng và Kim cương cao hơn.',ok:()=>SHOP.coins>=100&&!G.upgradeDraw,apply:()=>{SHOP.coins-=100;saveShop();updateCoinUI();G.upgradeDraw=true}},
 {ic:'⏱️',t:'Kiểm Tra Nhanh',d:'Mỗi câu hỏi có 5 giây. Trả lời càng nhanh càng nhiều HP (5 giảm dần).',ok:()=>!P.quick,apply:()=>{P.quick=true}},
 {ic:'❄️',t:'Băng Sương',d:'Kỹ năng chủ động (H): đứng yên và miễn sát thương trong 2 giây, hồi 20 giây.',ok:()=>!P.skills.includes('frost'),skill:'frost'},
 {ic:'🕹️',t:'Chế Độ Dễ',d:'Vòng sau: đạn gây ít hơn 1 sát thương.',ok:()=>!G.pend.easy,apply:()=>{G.pend.easy=true}},
 {ic:'🎯',t:'Đánh Cược II',d:'Trả lời đúng 10 câu liên tiếp: đạn -1 sát thương và chậm hơn 20%. Nếu sai trước đó: đạn +1 sát thương, nhanh hơn 20%, to hơn 20%.',risk:true,ok:()=>!G.bet2,apply:()=>{G.bet2={state:'run',streak:0}}}
];
const NEW4=[
 {ic:'🪽',t:'Đôi Cánh Tự Do',d:'3 vòng tới: không còn bị trói vào mặt đất, bay tự do mọi hướng (Nhảy/↑ bay lên, Cúi/↓ hạ xuống). Không thể cúi.',ok:()=>!P.wings,apply:()=>{P.wings=true}},
 {ic:'🎁',t:'Hộp Mù',d:'Mở ngay 1 lõi ngẫu nhiên (không trúng lõi tiêu xu).',ok:()=>true,apply:()=>{
   const bad=['Hộp Mù','Đầu Tư II','Lấy Tiền Đổi Mạng'];
   let pool=BUFFS.filter(b=>!bad.includes(b.t)&&b.ok());
   if(P.skills.length>=3)pool=pool.filter(b=>!b.skill);
   if(!pool.length)return;
   const c=pick(pool);
   if(c.skill)addSkill(c.skill);else c.apply();
   G.boxNote='🎁 '+c.ic+' '+c.t;
   popText(c.ic+' '+c.t,P.x,P.y-90,'#fde68a');
 }},
 {ic:'🪙',t:'Bão Vàng I',d:'Nhận ngay 10 xu.',ok:()=>true,apply:()=>{addCoin(10);popText('🪙 +10 xu',P.x,P.y-90,'#fde047')}},
 {ic:'🟡',t:'Bão Vàng II',d:'Nhận ngay 20 xu.',ok:()=>true,apply:()=>{addCoin(20);popText('🪙 +20 xu',P.x,P.y-90,'#fde047')}},
 {ic:'🌕',t:'Bão Vàng III',d:'Nhận ngay 30 xu.',ok:()=>true,apply:()=>{addCoin(30);popText('🪙 +30 xu',P.x,P.y-90,'#fde047')}},
 {ic:'♾️',t:'Vô Hạn',d:'3 vòng tới: bỏ tường hai bên, đi hết mép này sẽ xuất hiện ở mép bên kia.',ok:()=>!P.inf,apply:()=>{P.inf=true}},
 {ic:'⚡',t:'Nhanh Gọn',d:'Vòng sau ngắn hơn 35% nhưng đạn nhanh hơn 25%.',risk:true,ok:()=>!G.pend.quick,apply:()=>{G.pend.quick=true}},
 {ic:'⏳',t:'Trì Hoãn',d:'3 vòng tới: thời gian bất tử sau khi dính đòn tăng từ 1 giây lên 2 giây.',ok:()=>!P.delay,apply:()=>{P.delay=true}},
 {ic:'🔦',t:'Đèn Pin Thu Nhỏ',d:'2 vòng tới: đạn nhỏ đi 20% (hitbox nhỏ theo).',ok:()=>!P.lamp,apply:()=>{P.lamp=true}},

 {ic:'🥾',t:'Bước Chân Vũng Bùn',d:'Giảm 25% hồi chiêu Dash; sau khi lướt xong, +20% tốc độ chạy trong 1.5 giây.',ok:()=>!P.lo_dash,apply:()=>{P.lo_dash=true}},
 {ic:'🧎',t:'Thế Thủ Thấp Trọng Tâm',d:'Khi cúi người: thu hẹp hitbox 20%, giảm 35% sát thương nhận vào.',ok:()=>!P.lo_crouch,apply:()=>{P.lo_crouch=true}},
 {ic:'🌀',t:'Phản Chấn Xung Kích',d:'Tiếp đất sau cú nhảy cao: sóng chấn động phá hủy đạn quanh người.',ok:()=>!P.lo_shock,apply:()=>{P.lo_shock=true}},
 {ic:'🔥',t:'Thân Nhiệt Sục Sôi',d:'Giảm 50% thời gian khống chế (đóng băng, choáng, hoảng loạn); miễn nhiễm làm chậm.',ok:()=>!P.lo_warm,apply:()=>{P.lo_warm=true}},
 {ic:'⚓',t:'Trọng Tâm Vững Chắc',d:'Giảm 70% lực đẩy lùi; miễn nhiễm gió và lực hút môi trường.',ok:()=>!P.lo_stable,apply:()=>{P.lo_stable=true}},
 {ic:'🐺',t:'Nanh Vuốt Sắc Bén',d:'+15% sát thương cơ bản cho mọi đòn đánh.',ok:()=>!P.lo_dmg,apply:()=>{P.lo_dmg=true}},
 {ic:'💪',t:'Thể Lực Dẻo Dai',d:'+20% máu tối đa và hồi ngay lượng máu tương ứng.',ok:()=>!P.lo_hpPct,apply:()=>{P.lo_hpPct=true;const m=P.hpCap||300,add=Math.round(m*.2);P.hpCap=Math.round(m*1.2);G.hp=Math.min(P.hpCap,G.hp+add)}},
 {ic:'⚔️',t:'Cuồng Nộ Cận Chiến',d:'+45% sát thương khi đứng gần Boss; -35% sát thương khi đánh từ xa.',ok:()=>!P.lo_close,apply:()=>{P.lo_close=true}},
 {ic:'🌟',t:'Linh Hồn Cường Hóa',d:'+12% sát thương, +12% máu tối đa, +10% tốc độ chạy.',ok:()=>!P.lo_soul,apply:()=>{P.lo_soul=true;P.speedM*=1.10;const m=P.hpCap||300;P.hpCap=Math.round(m*1.12)}},
 {ic:'🗡️',t:'Đột Kích Sau Lướt',d:'Phát bắn đầu tiên sau Dash: +40% sát thương, đạn bay xa hơn.',ok:()=>!P.lo_post,apply:()=>{P.lo_post=true}},
 {ic:'🌊',t:'Dư Chấn Nặng Nề',d:'Phản Chấn Xung Kích rộng thêm 35%, gây sát thương phá choáng Boss và làm chậm đạn bay qua.',ok:()=>P.lo_shock&&!P.lo_shockPlus,apply:()=>{P.lo_shockPlus=true}},
 {ic:'🩸',t:'Bản Năng Sinh Tồn',d:'Khi máu dưới 30%: +25% tốc độ chạy cho đến khi máu vượt 30%.',ok:()=>!P.lo_low,apply:()=>{P.lo_low=true}},
];
const BUFFS=BASE_BUFFS.concat(EXTRA_CARDS).concat(NEW2).concat(NEW3).concat(NEW4).concat(ENVS.map(e=>({ic:e.ic,t:'Môi trường: '+e.n,d:'Vòng kế tiếp diễn ra ở '+e.n+', chỉ có đạn đặc trưng của bản đồ này.',ok:()=>!G.pend.env,apply:()=>{G.pend.env=e.id}})));

/* ============ BẬC & THỜI HẠN CỦA LÕI ============ */
const TIERS={};
(CONTENT.cores||[]).forEach(c=>{
  TIERS[c.t]=[c.tier,c.dur];
  let b=BUFFS.find(x=>x.t===c.t);
  if(!b&&c.effect){
    const n=+c.amount||0;
    if(c.effect==='coins')b={t:c.t,ok:()=>true,apply:()=>{addCoin(n);popText('🪙 +'+n+' xu',P.x,P.y-90,'#fde047')}};
    else if(c.effect==='heal')b={t:c.t,ok:()=>true,apply:()=>{gainHP(n);popText('+'+n+' HP',P.x,P.y-90,'#34d399')}};
    if(b)BUFFS.push(b);
  }
  if(b){b.ic=c.ic;if(c.d)b.d=c.d;b.risk=!!c.risk}
});
const FLAG={'Tái Sinh':'regen','Giác Quan Thứ 6':'sixth','Đầu Tư':'invest','Thử Thách Thông Minh':'smart'};
Object.assign(FLAG,{'Đôi Cánh Tự Do':'wings','Vô Hạn':'inf','Trì Hoãn':'delay','Đèn Pin Thu Nhỏ':'lamp'});
const TIER_NAME={bac:'🥈 Bạc',vang:'🥇 Vàng',kim:'💎 Kim cương'};
const TIER_COL={bac:'#cbd5e1',vang:'#fbbf24',kim:'#c4b5fd'};
function durText(d){return d==='vinh'?'Vĩnh viễn':d==='tuc'?'Tức thì':d+' vòng'}
function tierOf(t){if(t.startsWith('Môi trường:'))return ['vang',1];return TIERS[t]||['bac','vinh']}
BUFFS.forEach(b=>{
  const [tier,dur]=tierOf(b.t);b.tier=tier;b.dur=dur;
  const f=FLAG[b.t];
  if(f&&typeof dur==='number'&&b.apply){const o=b.apply;b.apply=()=>{o();P.exp=P.exp||{};P.exp[f]=G.round+dur}}
});
// Rút 3 thẻ: 60% Bạc, 30% Vàng, 10% Kim cương (nếu hết loại thì lấy loại khác)
function drawCards(n){const up0=G.upgradeDraw;G.upgradeDraw=false;
  const avail=BUFFS.filter(b=>b.ok()),out=[];
  for(let i=0;i<n&&avail.length;i++){
    const r=Math.random()*100,tier=up0?(r<30?'bac':r<80?'vang':'kim'):(r<60?'bac':r<90?'vang':'kim');
    let pool=avail.filter(b=>b.tier===tier);if(!pool.length)pool=avail;
    const c=pick(pool);out.push(c);avail.splice(avail.indexOf(c),1);
  }
  return out;
}
function showBuffs(){
 hideAll();
 const pool=drawCards(3);
 const box=$('bc');box.innerHTML='';
 pool.forEach(b=>{
   const c=document.createElement('div');c.className='card tier-'+b.tier+(b.risk?' risk':'');
   c.innerHTML=`<div class="ic">${b.ic}</div><div class="t">${b.t}</div><div class="d">${b.d}</div><div class="tag" style="color:${TIER_COL[b.tier]}">${TIER_NAME[b.tier]} · ${durText(b.dur)}</div>`;
   c.onclick=()=>pickCard(b);
   box.appendChild(c);
 });
 $('m-buff').classList.remove('hide');
}
function pickCard(b){
 beep(880,.12,.05,'triangle');
 if(b.skill){
   if(!P.skills.includes(b.skill)&&P.skills.length>=3){openReplace(b.skill);return}
   addSkill(b.skill);
 }else b.apply();
 finishPick();
}
function finishPick(){
 $('m-buff').classList.add('hide');$('m-skill').classList.add('hide');
 G.round++;setupRound();
}
function openReplace(id){
 $('sk-p').textContent='Bạn đã có đủ 3 kỹ năng chủ động. Chọn 1 để thay bằng '+SKN[id]+':';
 const box=$('sk-c');box.innerHTML='';
 P.skills.forEach((s,i)=>{
   const c=document.createElement('div');c.className='card';
   c.innerHTML=`<div class="t">${SKN[s]}</div><div class="d">Thay bằng ${SKN[id]}</div>`;
   c.onclick=()=>{P.skills[i]=id;syncSkills();finishPick()};
   box.appendChild(c);
 });
 $('m-skill').classList.remove('hide');
}
function addSkill(id){if(!P.skills.includes(id)&&P.skills.length<3)P.skills.push(id);syncSkills()}
function syncSkills(){P.hasDash=P.skills.includes('dash')}
function useBlast(){
 if(!P.skills.includes('blast')||G.mode!=='playing'||P.blastCD>0)return;
 P.blastCD=12;
 const cx=P.x,cy=P.y-ph()/2;let n=0;
 for(const b of G.bullets){
   if(b.type==='heart')continue;
   if(Math.hypot(b.x-cx,b.y-cy)<260){b.dead=true;n++;burstParts(b.x,b.y,BT[b.type].c,8)}
 }
 burstParts(cx,cy,'#f97316',30);G.shake=.5;beep(220,.3,.08,'sawtooth');
 popText('💥 '+n+' đạn',cx,cy-60,'#fbbf24');
}


$('tbl').addEventListener('pointerdown',e=>{e.preventDefault();useBlast()});
const DIS=[
 {type:'rain',name:'Mưa Bão',col:'103,232,249',iv:.3},
 {type:'meteor',name:'Mưa Sao Băng',col:'125,211,252',iv:1.6},
 {type:'stalac',name:'Sập Hang',col:'161,161,170',iv:.6},
 {type:'boulder',name:'Lũ Đá',col:'168,162,158',iv:2.2},
 {type:'bolt',name:'Giông Bão Sấm Sét',col:'253,224,71',iv:1.0},
 {type:'bomb',name:'Núi Lửa Phun Trào',col:'249,115,22',iv:1.1},
 {type:'frost',name:'Bão Tuyết',col:'224,242,254',iv:.4},
 {type:'venom',name:'Mưa Axit',col:'34,197,94',iv:.7},
 {type:'shock',name:'Sóng Thần',col:'251,191,36',iv:1.3},
 {type:'homing',name:'Bầy Ma Trơi',col:'45,212,191',iv:1.1},
 {type:'nova',name:'Bão Năng Lượng',col:'251,113,133',iv:2.2},
 {type:'accel',name:'Lốc Xoáy',col:'250,204,21',iv:.55},
 {type:'boomerang',name:'Bão Lưỡi Liềm',col:'56,189,248',iv:.9}
];
const EVN={quake:'🌋 Động đất',fog:'🌫️ Sương mù',doom:'☄️ Diệt thế'};
function startEvent(){
  const r=G.round;
  if(G.timeLeft<7){G.evCD=99;return}
  const ops=[['quake',3]];
  if(r>=3)ops.push(['fog',3],['pop',2]);
  if(r>=4&&!G.calmRound)ops.push(['disaster',3]);
  if(r>=6&&G.timeLeft>=10)ops.push(['doom',2]);
  let t=Math.random()*ops.reduce((s,o)=>s+o[1],0),k=ops[0][0];
  for(const o of ops){t-=o[1];if(t<=0){k=o[0];break}}
  if(k==='quake'){G.ev={k,t:5,dur:5,tr:.5,dust:0};banner('🌋 ĐỘNG ĐẤT!');beep(80,.5,.08,'sawtooth')}
  else if(k==='fog'){const w=rnd(240,320);G.ev={k,t:9,dur:9,w,x:rnd(w/2+40,W-w/2-40),vx:pick([-1,1])*rnd(18,40)};banner('🌫️ SƯƠNG MÙ DÀY ĐẶC!')}
  else if(k==='disaster'){const d=pick(DIS);G.ev={k,t:8,dur:8,d};G.spawnT=.3;banner('🌪 THIÊN TAI: '+d.name.toUpperCase());beep(220,.3,.06,'triangle')}
  else if(k==='doom'){const zw=170;G.ev={k,ph:0,t:Math.max(3.5,5-r*.1),zw,zx:rnd(zw/2+40,W-zw/2-40),t2:0};banner('☄️ DIỆT THẾ — CHẠY VÀO KHU AN TOÀN!')}
  else if(k==='pop'){G.evCD=rnd(14,20);startPop()}
}
function endEvent(){G.ev=null;G.evCD=rnd(10,16)}
/* ============ BOSS ============ */
const BOSS_CHANCE=.25;
var BOSS_ALWAYS=false;try{BOSS_ALWAYS=localStorage.getItem('ad_boss_always')==='1'}catch(e){}
function refreshBossBtn(){$('bBoss').textContent='👑 Boss: '+(BOSS_ALWAYS?'Mỗi vòng (thử)':'Ngẫu nhiên')}
$('bBoss').onclick=()=>{BOSS_ALWAYS=!BOSS_ALWAYS;try{localStorage.setItem('ad_boss_always',BOSS_ALWAYS?'1':'0')}catch(e){}refreshBossBtn()};
refreshBossBtn();
/* Thêm ảnh boss sau này: BOSSES.lab.img=new Image(); BOSSES.lab.img.src='...'; (ô vẽ 140x140) */
const BOSSES=CONTENT.bosses;
for(const k in BOSSES){const bi=BOSSES[k].img;if(bi){const im=new Image();im.src=bi;BOSSES[k].atlas=im}}
function startBoss(){
 G.cuts=[];G.poly=null;G.dark=0;G.vflip=0;G.vtel=0;G.vdCorpse=null;G.sz=[];G.hist=[];G.snowP=[];G.firePatch=[];G.pull=null;P.frost=0;P.frostT=0;G.gust=null;G.yFreeze=false;G.svA=0;
 G.boss=null;G.shots=[];const d=BOSSES[G.map.id];
 if(!d||(!BOSS_ALWAYS&&(G.lastBoss||Math.random()>BOSS_CHANCE))){G.lastBoss=false;return}
 G.lastBoss=true;const r=G.round,fight=r>=4,bars=Math.min(15,Math.max(1,r)),total=fight?Math.round(1.5*(220+50*r)):Math.round(1.3*(260+20*r)),per=total/bars,hp=total;
 G.boss={d,fight,hp,max:hp,bars,barMax:per,dur:Math.max(5,G.timeLeft),x:W/2,y:-90,t:0,at:2.2,n:0,enr:false,dead:false,hit:0,camp:0};
 if(fight)G.timeLeft=Math.max(G.timeLeft,55);
}
function bossIntro(){banner('⚠️ BOSS: '+G.boss.d.n+(G.boss.fight?' — HẠ GỤC!':' — SỐNG SÓT!'));G.bannerT=3.5;G.flash=.5;beep(120,.6,.1,'sawtooth')}
function playerShoot(){
 const b=G.boss;if(G.mode!=='playing'||!b||b.dead||(P.shCD||0)>0)return;
 P.shCD=.35;const sx=P.x,sy=P.y-ph()/2;let tg=b;
 if(b.d.ai==='zombie'){let bd=1e9;for(const q of G.bullets){if(!ZOMBIE_HP[q.type]||q.dead)continue;const dd=Math.hypot(q.x-sx,q.y-sy);if(dd<bd){bd=dd;tg=q}}}   /* còn zombie -> tự nhắm zombie gần nhất */
 const a=Math.atan2(tg.y-sy,tg.x-sx);
 {let m=1,sp=1;const d=Math.abs(P.x-b.x);
  if(P.lo_dmg)m*=1.15;if(P.lo_soul)m*=1.12;
  if(P.lo_close)m*=d<220?1.45:.65;
  if(P.lo_post&&P.postDash){m*=1.4;sp=1.25;P.postDash=false;popText('🗡️ Chí mạng!',P.x,P.y-ph()-30,'#f97316')}
  G.shots.push({x:sx,y:sy,vx:Math.cos(a)*720*sp,vy:Math.sin(a)*720*sp,dmg:Math.round((10+Math.floor(G.round/3)*2)*m)})}beep(700,.05,.04,'square');
}
function bossWin(){
 const b=G.boss;if(!b||b.dead)return;b.dead=true;G.sz=[];G.svA=0;P.frost=0;G.gust=null;G.poly=null;G.cuts=[];G.dark=0;G.vflip=0;G.vtel=0;if(b.d.ai==='void')G.vdCorpse={x:b.x,y:b.y,t:1.4};
 const r=G.round,gold=b.fight?80+r*20:40+r*10;
 addCoin(gold);gainHP(b.fight?5:3);P.shield=Math.max(P.shield,1);
 G.pend.slow=Math.min(G.pend.slow,.8);G.pend.invincible=Math.max(G.pend.invincible||0,3);
 G.bullets=[];G.shots=[];burstParts(b.x,b.y,b.d.c,60);beep(880,.3,.08,'triangle');
 G.boxNote='🏆 Hạ '+b.d.n+': +'+gold+' xu, +HP, giáp, đạn chậm 20%';
}
function bossTick(dt){
 if(G.vdCorpse){G.vdCorpse.t-=dt;if(G.vdCorpse.t<=0)G.vdCorpse=null}
 const b=G.boss;P.shCD=Math.max(0,(P.shCD||0)-dt);G.dark=Math.max(0,(G.dark||0)-dt);
 if(G.poly){G.poly.t-=dt;if(G.poly.t<=0)G.poly=null}
 for(const c of G.cuts||[]){c.t-=dt;if(c.t<=0){if(!c.done){c.done=true;c.f=.25;const w=pw(),h=ph();if(b&&!b.dead&&P.x+w/2>c.x&&P.x-w/2<c.x+100&&P.y>c.y&&P.y-h<c.y+100)hurt(dmgOf(G.round));burstParts(c.x+50,c.y+50,'#fff',8)}else c.f-=dt}}
 G.cuts=(G.cuts||[]).filter(c=>!(c.done&&c.f<=0));
 for(const s of G.shots){s.x+=s.vx*dt;s.y+=s.vy*dt;
  if(!s.dead){for(const q of G.bullets){if(ZOMBIE_HP[q.type]&&!q.dead&&Math.hypot(q.x-s.x,q.y-s.y)<(q.r||12)+8){s.dead=true;q.hp-=1;burstParts(q.x,q.y,'#84cc16',5);if(q.hp<=0){q.dead=true;burstParts(q.x,q.y,'#65a30d',16);if(q.type==='zgol')zGoliathDown(b)}break}}}
  if(s.dead){}
  else if(b&&!b.dead&&b.ts&&tsAbsorb(s))s.dead=true;
  else if(b&&!b.dead&&Math.hypot(s.x-b.x,s.y-b.y)<(b.hr||50)){s.dead=true;if(!b.shield)b.hp-=s.dmg;b.hit=.12;burstParts(s.x,s.y,b.d.c,6)}
  if(s.x<-20||s.x>W+20||s.y<-20||s.y>H+20)s.dead=true}
 G.shots=G.shots.filter(s=>!s.dead);
 if(!b||b.dead)return false;
 b.t+=dt;b.hit=Math.max(0,b.hit-dt);
 if(!b.enr&&b.hp/b.max<.4){b.enr=true;banner('🔥 BOSS NỔI GIẬN!');G.bannerT=2.5;beep(180,.3,.1,'sawtooth')}
 // Khóa góc: người chơi đứng sát mép quá 2.5 giây -> boss phóng đòn nhắm thẳng vào vị trí đó
 const edge=P.x<WL+90||P.x>WR-90;
 if(edge&&G.mode==='playing'&&!P.ghostT){b.camp+=dt;if(b.camp>=2.5){b.camp=0;const sx=P.x<W/2?WL+10:WR-10,a=Math.atan2(P.y-ph()/2-b.y,sx-b.x);for(let i=-1;i<=1;i++){const q=a+i*.12;G.bullets.push({type:'bshot',x:b.x,y:b.y,vx:Math.cos(q)*300,vy:Math.sin(q)*300,r:8})}banner('⚠️ Khóa góc!');G.bannerT=1.2}}
 else b.camp=Math.max(0,b.camp-dt*2);
 if(b.d.ai==='cube'){const pc=b.hp/b.max,mx=b.fight?3:G.round>=3?2:1,np=Math.min(mx,pc<=.33?3:pc<=.66?2:1);if(np>(b.pz||1))bossPhase(b,np);cubeAI(b,dt)}else if(b.d.ai==='thunder'){thunderAI(b,dt)}else if(b.d.ai==='overload'){overloadAI(b,dt)}else if(b.d.ai==='blade'){bladeAI(b,dt)}else if(b.d.ai==='spirit'){spiritAI(b,dt)}else if(b.d.ai==='void'){voidAI(b,dt)}else if(b.d.ai==='sins'){sinAI(b,dt)}else if(b.d.ai==='yuki'){yukiAI(b,dt)}else if(b.d.ai==='sv0'){sv0AI(b,dt)}else if(b.d.ai==='zombie'){if(!b.fight)b.hp-=b.max/b.dur*dt*.9;zombieAI(b,dt)}else if(b.d.ai==='casino'){casinoAI(b,dt)}else{b.y=Math.min(110,b.y+160*dt);b.x=W/2+Math.sin(b.t*(.6+G.round*.02)*(b.enr?1.5:1))*300}
 if(!b.fight)b.hp-=b.max/b.dur*dt*.9;
 if(b.t>2&&b.d.ai!=='cube'&&b.d.ai!=='thunder'&&b.d.ai!=='overload'&&b.d.ai!=='blade'&&b.d.ai!=='spirit'&&b.d.ai!=='void'&&b.d.ai!=='sins'&&b.d.ai!=='yuki'&&b.d.ai!=='sv0'&&b.d.ai!=='casino'&&b.d.ai!=='zombie'){b.at-=dt;if(b.at<=0){
  b.at=(b.d.ai==='thunder'?Math.max(1.8,2.9-G.round*.05):Math.max(.7,2.1-G.round*.06))*(b.enr?.6:1);b.n++;
  const m=b.n%3,sp=(240+G.round*7)*(b.enr?1.2:1);
  if(m===1)spawnType(pick(b.d.pool));
  else if(m===2){const a=Math.atan2(P.y-ph()/2-b.y,P.x-b.x);for(let i=-1;i<=(G.round>=8?1:0);i++){const q=a+i*.22;G.bullets.push({type:'bshot',x:b.x,y:b.y,vx:Math.cos(q)*sp,vy:Math.sin(q)*sp,r:8})}}
  else{const n=8+Math.floor(G.round/4),o=rnd(0,6.28);for(let i=0;i<n;i++){const q=o+i*6.283/n;G.bullets.push({type:'bshot',x:b.x,y:b.y,vx:Math.cos(q)*sp*.8,vy:Math.sin(q)*sp*.8,r:7})}}
  beep(200,.08,.05,'square')}}
 if(b.hp<=0){b.hp=0;bossWin();openBonus();return true}
 return false;
}
/* ============ TRUY PHONG ĐAO KHÁCH (boss map Mặc Trúc Lâm, ai: "blade") ============
   Đao khách lãng tử, đánh công thủ toàn diện, chuyển liên tục giữa tầm xa và cận chiến.
   Chiêu: Phong Kính Trảm (đao khí cao ép cúi / thấp ép nhảy) · Truy Phong Đoạt Mệnh (tụ lực 0.65s, lướt vồ, chém chéo rồi quét 360° sát đất)
          Mặc Trúc Loạn Đao (mưa đao khí vảy cá + bão lá trúc đỏ) · Ngự Đao Trảm Trúc (nhảy lên bệ trúc, bổ chéo xuống, hất văng)
          Cuồng Phong Mặc Đao (dưới 40% máu): lướt xuyên màn hình 3 lần, mỗi lần kèm đao khí phản chấn.
   Combo: Khóa tầm xa + Vồ cận chiến · Mưa đao khí + Bạt đất. Sau đòn nặng có 0.9–1.1 giây sơ hở (khung "suy yếu"). */
function blTel(){const b=G.boss;return Math.max(.4,.7-.02*G.round)*(b&&b.enr?.85:1)}
function blAt(bl,t,fn){bl.q.push([bl.c+t,fn]);bl.q.sort((a,c)=>a[0]-c[0])}
function bladeInit(b){b.hr=50;b.bl={m:'in',c:0,q:[],endT:0,rest:1.3,face:-1,fy:-80,vy:0,fr:8,dash:null,jmp:null,dive:null,tr:[],perch:0,dcd:5,last:'',chg:0,aim:null,aimT:0,lock:false,tl:null,fade:0,was:false}}
function blStrike(b,kind,dm){
 const bl=b.bl,d=bl.face,fy=b.fy||bl.fy;let hit;
 if(kind==='mid'){const x0=b.x+(d>0?-15:-95);hit=P.x+pw()/2>x0&&P.x-pw()/2<x0+110&&P.y>fy-100&&P.y-ph()<fy-34;
  G.bullets.push({type:'bfx',k:'arc',x:b.x,y:fy-66,dir:d,age:0,life:.22,vx:0,vy:0,r:0})}
 else{hit=Math.abs(P.x-b.x)<100+pw()/2&&P.y>fy-26;
  G.bullets.push({type:'bfx',k:'ring',x:b.x,y:fy-8,age:0,life:.3,vx:0,vy:0,r:0})}
 G.shake=Math.max(G.shake,.18);beep(kind==='mid'?220:140,.12,.07,'sawtooth');
 if(hit)hurt(dm);
}
function blZone(b,kind){const bl=b.bl,fy=bl.fy,d=bl.face;
 G.bullets.push(kind==='mid'?{type:'bfx',k:'zr',x:b.x+d*40,y:fy-67,w:110,h:66,age:0,life:.18,vx:0,vy:0,r:0}:{type:'bfx',k:'zr',x:b.x,y:fy-13,w:200,h:26,age:0,life:.18,vx:0,vy:0,r:0})}
/* Phong Kính Trảm: kinds = ['H','L',...] (H: tầm cao ép cúi, L: sát đất ép nhảy), cách nhau 0.45 giây */
function blWave(b,kinds,t0){
 const bl=b.bl,tel=blTel(),r=G.round,dm=dmgOf(r),gap=.45*(b.enr?.9:1),sp=Math.min(780,540+10*r)*(b.enr?1.12:1);
 blAt(bl,t0,()=>{bl.face=P.x>=b.x?1:-1;bl.fr=3});
 kinds.forEach((k,i)=>{const tf=t0+tel+i*gap,y=k==='H'?46:12;
  blAt(bl,Math.max(t0,tf-.4),()=>G.bullets.push({type:'bfx',k:'tg',x:b.x+bl.face*30,y:bl.fy-y,dir:bl.face,age:0,life:.4,vx:0,vy:0,r:0}));
  blAt(bl,tf,()=>{bl.fr=i%2?5:4;const d=bl.face;G.bullets.push({type:'bwave',x:b.x+d*40,y:bl.fy-y,vx:d*sp,vy:0,r:0,hw:24,hh:k==='H'?15:12,dmg:dm,age:0});G.shake=Math.max(G.shake,.12);beep(260,.08,.05,'sawtooth')})});
 const e=t0+tel+(kinds.length-1)*gap;blAt(bl,e+.3,()=>{bl.fr=0});return e+.55;
}
/* Truy Phong Đoạt Mệnh: tụ lực → lướt vồ → chém chéo tầm trung (cúi / dash) → quét 360° sát đất (nhảy / dash) */
function blDash(b,t0){
 const bl=b.bl,r=G.round,dm=dmgOf(r),ct=.65*(b.enr?.85:1),sp=Math.min(1700,1150+25*r);
 blAt(bl,t0,()=>{bl.face=P.x>=b.x?1:-1;bl.fr=3;bl.chg=ct});
 blAt(bl,t0+ct,()=>{const tx=clamp(P.x+bl.face*30,60,840);bl.face=tx>=b.x?1:-1;const dur=Math.max(.12,Math.abs(tx-b.x)/sp);
  bl.fr=2;bl.chg=0;bl.dash={x:tx,sp,hit:false,dm};beep(150,.18,.06,'sawtooth');
  blAt(bl,dur+.03,()=>{bl.dash=null;bl.face=P.x>=b.x?1:-1;bl.fr=3});
  const s1=dur+.25,s2=s1+.5;
  blAt(bl,s1-.18,()=>blZone(b,'mid'));
  blAt(bl,s1,()=>{bl.fr=4;blStrike(b,'mid',dm)});
  blAt(bl,s2-.18,()=>blZone(b,'sweep'));
  blAt(bl,s2,()=>{bl.fr=6;blStrike(b,'sweep',dm)});
  blAt(bl,s2+.4,()=>{bl.fr=0})});
 return t0+ct+1.95;
}
/* Mặc Trúc Loạn Đao: mưa đao khí vảy cá + vùng bão lá trúc đỏ gây sát thương liên tục */
function blRain(b,t0){
 const bl=b.bl,r=G.round,dm=dmgOf(r),tel=blTel()+.1,n=Math.min(11,7+(r/3|0)),fd=Math.max(1,Math.ceil(dm*.6));
 blAt(bl,t0,()=>{bl.face=P.x>=b.x?1:-1;bl.fr=7;bl.chg=tel;
  const zx=clamp(P.x+rnd(-80,80),130,770);
  G.bullets.push({type:'bleaf',x:zx,y:0,vx:0,vy:0,r:0,w:260,age:0,tel:tel+.2,life:4.2,cd:0,dmg:Math.max(1,fd)});
  if(b.enr)G.bullets.push({type:'bleaf',x:zx>450?zx-320:zx+320,y:0,vx:0,vy:0,r:0,w:200,age:0,tel:tel+.2,life:4.2,cd:.3,dmg:Math.max(1,fd)})});
 for(let i=0;i<n;i++)blAt(bl,t0+tel+i*.07,()=>{const d=bl.face;
  G.bullets.push({type:'bfish',x:b.x+d*30,y:bl.fy-100,vx:d*rnd(60,470)+rnd(-90,90),vy:-rnd(520,720),r:9,dmg:fd});if(i===0){G.shake=Math.max(G.shake,.2);beep(200,.2,.06,'sawtooth')}});
 blAt(bl,t0+tel+.9,()=>{bl.fr=0});return t0+tel+1.0;
}
/* Ngự Đao Trảm Trúc: nhảy lên bệ trúc gần nhất, ngắm, rồi bổ chéo xuống chỗ người chơi, bụi mực hất văng */
function blDive(b,t0){
 const bl=b.bl,pl=G.map.plat;if(!pl.length)return t0;
 const r=G.round,dm=dmgOf(r),tel=Math.max(.45,.65-.02*r)*(b.enr?.85:1);
 const pp=pl.reduce((a,c)=>Math.abs(c[0]+c[2]/2-b.x)<Math.abs(a[0]+a[2]/2-b.x)?c:a),px=pp[0]+pp[2]/2,py=pp[1];
 blAt(bl,t0,()=>{bl.face=px>=b.x?1:-1;bl.fr=2;bl.jmp={t:0,dur:.45,x0:b.x,y0:bl.fy,x1:px,y1:py}});
 blAt(bl,t0+.45,()=>{bl.jmp=null;b.x=px;bl.fy=py;bl.fr=3;bl.aim=P.x;bl.aimT=tel;bl.lock=false;bl.chg=tel});
 blAt(bl,t0+.45+tel-.2,()=>{bl.lock=true});
 blAt(bl,t0+.45+tel,()=>{const tx=clamp(bl.aim,60,840),dist=Math.hypot(tx-b.x,FLOOR-bl.fy),dur=Math.max(.18,dist/1500);
  bl.aimT=0;bl.chg=0;bl.face=tx>=b.x?1:-1;bl.fr=8;bl.dive={x0:b.x,y0:bl.fy,x1:tx,y1:FLOOR,t:0,dur,hit:false,dm};beep(120,.2,.07,'sawtooth');
  blAt(bl,dur+.01,()=>blLand(b,dm));
  blAt(bl,dur+1.0,()=>{bl.fr=0})});
 return t0+.45+tel+1.6;
}
function blLand(b,dm){
 const bl=b.bl,r=G.round;bl.dive=null;bl.fy=FLOOR;bl.fr=11;
 G.shake=Math.max(G.shake,.55);burstParts(b.x,FLOOR,'#292524',26);beep(70,.3,.1,'sawtooth');
 G.bullets.push({type:'bfx',k:'ring',x:b.x,y:FLOOR-8,age:0,life:.35,vx:0,vy:0,r:0});
 if(Math.abs(P.x-b.x)<80+pw()/2&&P.y>FLOOR-70){const h=G.hp;hurt(dm);if(G.hp<h){P.vy=-400;P.gnd=false;P.x=clamp(P.x+(P.x>=b.x?1:-1)*70,WL+pw()/2,WR-pw()/2)}}
 const sp=380+8*r,fd=Math.max(1,Math.ceil(dm*.6));
 for(const d of[-1,1])G.bullets.push({type:'bdust',x:b.x+d*30,y:FLOOR-12,vx:d*sp,vy:0,r:0,age:0,dmg:fd});
}
/* Cuồng Phong Mặc Đao (nổi giận): 3 lần lướt xuyên màn hình, mỗi lần kèm đao khí phản chấn */
function blRush(b,t0){
 const bl=b.bl,r=G.round,dm=dmgOf(r),sp=Math.min(1800,1350+25*r),wsp=Math.min(800,580+10*r)*1.1;let t=t0;
 const from0=P.x<450?830:70;
 for(let i=0;i<3;i++){
  const from=i===0?from0:(i%2?(from0===830?70:830):from0),to=from===830?70:830,dir=to>from?1:-1,tel=i===0?.6:.42,dur=Math.abs(to-from)/sp;
  blAt(bl,t,()=>{if(i===0){bl.fade=.25;b.x=from;burstParts(from,FLOOR-30,'#111',14)}bl.face=dir;bl.fr=3;bl.chg=tel;
   G.bullets.push({type:'bfx',k:'rl',x:from,x0:from,x1:to,y:bl.fy-6,age:0,life:tel,vx:0,vy:0,r:0})});
  blAt(bl,t+tel,()=>{bl.fr=2;bl.chg=0;bl.dash={x:to,sp,hit:false,dm};beep(130,.25,.07,'sawtooth')});
  blAt(bl,t+tel+dur+.02,()=>{bl.dash=null;bl.fr=4;const kinds=i===2?['H','L']:[i%2?'L':'H'];
   kinds.forEach((k,j)=>blAt(bl,j*.3,()=>{G.bullets.push({type:'bwave',x:to,y:bl.fy-(k==='H'?46:12),vx:-dir*wsp,vy:0,r:0,hw:24,hh:k==='H'?15:12,dmg:dm,age:0});G.shake=Math.max(G.shake,.15);beep(240,.1,.05,'sawtooth')}))});
  t+=tel+dur+.02+(i===2?.7:.3);
 }
 blAt(bl,t,()=>{bl.fr=11});blAt(bl,t+1.0,()=>{bl.fr=0});
 return t+1.0;
}
function blChoose(b){
 const bl=b.bl,r=G.round,pl=G.map.plat.length>0,E=!!b.enr,W=[];
 const add=(n,w)=>{if(w>0&&n!==bl.last)W.push([n,w])};
 add('wave',r<2?4:2);add('waveHL',r>=2?3:0);add('wave3',r>=5||E?2:0);add('dash',3);
 add('c1',r>=2?3:0);add('rain',r>=3?3:r>=2?1:0);add('c2',pl&&r>=4?3:0);add('rush',E&&r>=3?3:0);add('c3',r>=4?3:0);
 let tot=0;W.forEach(x=>tot+=x[1]);let k=Math.random()*tot,n=W[0][0];for(const x of W){k-=x[1];if(k<=0){n=x[0];break}}
 bl.last=n;let end=0;
 if(n==='wave'){end=blWave(b,[Math.random()<.5?'H':'L'],0)}
 else if(n==='waveHL'){end=blWave(b,Math.random()<.5?['H','L']:['L','H'],0)}
 else if(n==='wave3'){end=blWave(b,['H','L','H'],0)}
 else if(n==='dash'){end=blDash(b,0)}
 else if(n==='c1'){const e1=blWave(b,['H'],0);end=Math.max(e1,blDash(b,Math.max(.45,blTel()-.2)))}
 else if(n==='rain'){end=blRain(b,0)}
 else if(n==='c2'){const e1=blRain(b,0);end=blDive(b,Math.max(.9,blTel()+.35))}
 else if(n==='rush'){end=blRush(b,0)}
 else if(n==='c3'){const e1=blWave(b,['L'],0);end=Math.max(e1,blRush(b,Math.max(.5,blTel()-.2)))}
 bl.endT=bl.c+end;
}
function bladeAI(b,dt){
 if(G.timeStop>0)return;
 if(!b.bl)bladeInit(b);const bl=b.bl,r=G.round;b.vis=1;
 if(bl.m==='in'){bl.vy+=2200*dt;bl.fy+=bl.vy*dt;if(bl.fy>=FLOOR){bl.fy=FLOOR;bl.m='go';bl.fr=11;G.shake=.5;burstParts(b.x,FLOOR,'#292524',22);beep(80,.3,.09,'sawtooth')}b.y=bl.fy-70;return}
 bl.c+=dt;bl.fade=Math.max(0,bl.fade-dt);bl.dcd-=dt;
 while(bl.q.length&&bl.q[0][0]<=bl.c)bl.q.shift()[1]();
 if(bl.aimT>0){bl.aimT-=dt;if(!bl.lock)bl.aim=clamp(bl.aim+clamp(P.x-bl.aim,-520*dt,520*dt),60,840)}
 if(bl.dash){const d=bl.dash,dx=d.x-b.x,st=d.sp*dt;if(Math.abs(dx)<=st)b.x=d.x;else b.x+=Math.sign(dx)*st;
  bl.tr.push({x:b.x,fy:bl.fy,f:bl.face,t:.22});
  if(!d.hit&&Math.abs(P.x-b.x)<30+pw()/2&&P.y>bl.fy-72&&G.mode==='playing'){d.hit=true;hurt(d.dm)}}
 bl.tr.forEach(q=>q.t-=dt);bl.tr=bl.tr.filter(q=>q.t>0);
 if(bl.jmp){const j=bl.jmp;j.t+=dt;const u=Math.min(1,j.t/j.dur);b.x=j.x0+(j.x1-j.x0)*u;bl.fy=j.y0+(j.y1-j.y0)*u-Math.sin(u*Math.PI)*110}
 if(bl.dive){const v=bl.dive;v.t+=dt;const u=Math.min(1,v.t/v.dur);b.x=v.x0+(v.x1-v.x0)*u;bl.fy=v.y0+(v.y1-v.y0)*u;
  bl.tr.push({x:b.x,fy:bl.fy,f:bl.face,t:.2});
  if(!v.hit&&Math.hypot(P.x-b.x,P.y-ph()/2-(bl.fy-60))<48&&G.mode==='playing'){v.hit=true;hurt(v.dm)}}
 const busy=bl.q.length>0||bl.dash||bl.jmp||bl.dive||bl.c<bl.endT;
 if(bl.was&&!busy)bl.rest=Math.max(.5,1.25-.04*r)*(b.enr?.7:1);
 bl.was=busy;
 if(P.gnd&&P.y<FLOOR-20&&G.mode==='playing')bl.perch+=dt;else bl.perch=Math.max(0,bl.perch-dt*2);
 if(!busy){
  bl.face=P.x>=b.x?1:-1;bl.chg=0;
  const dx=P.x-b.x,ad=Math.abs(dx),mv=(110+3*r)*(b.enr?1.3:1);
  let v=0;if(ad>340)v=bl.face;else if(ad<190)v=-bl.face;
  if((b.x<110&&v<0)||(b.x>790&&v>0))v=-v*0+(b.x<450?1:-1);
  b.x=clamp(b.x+v*mv*dt,60,840);bl.fy=FLOOR;
  bl.fr=Math.floor(G.t*2.5)%2?(b.enr?9:1):0;
  bl.rest-=dt;
  if(bl.rest<=0){
   if(bl.perch>1.8&&bl.dcd<=0&&G.map.plat.length){bl.dcd=8;bl.perch=0;bl.last='dive';bl.endT=bl.c+blDive(b,0)}
   else blChoose(b);
  }
 }
 b.y=bl.fy-70;
}
function drawBlade(b){
 const bl=b.bl,at=b.d.atlas;if(!bl)return;
 const D=150,k=D/192;
 const sprite=(x,fy,f,face,a)=>{if(!(at&&at.complete&&at.naturalWidth))return;ctx.save();ctx.translate(x,fy+4*k);ctx.scale(face,1);ctx.globalAlpha=a;ctx.drawImage(at,(f%6)*192,Math.floor(f/6)*192,192,192,-D/2,-D,D,D);ctx.restore()};
 /* dấu hiệu ngắm Ngự Đao */
 if(bl.aimT>0&&bl.aim!==null){ctx.save();ctx.globalAlpha=.4+.3*Math.sin(G.t*30);ctx.strokeStyle='#ef4444';ctx.lineWidth=2;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(b.x,bl.fy-70);ctx.lineTo(bl.aim,FLOOR);ctx.stroke();ctx.setLineDash([]);ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(bl.aim,FLOOR-2,34,7,0,0,7);ctx.stroke();ctx.restore()}
 /* bóng mực khi lướt */
 for(const q of bl.tr)sprite(q.x,q.fy,2,q.f,Math.max(0,q.t)*1.1);
 /* tụ lực: cát bụi thủy mặc xoáy dưới chân + mắt lóe đỏ */
 if(bl.chg>0){ctx.save();for(let i=0;i<9;i++){const a=G.t*7+i*.7,rr=22+(i%3)*14;ctx.globalAlpha=.7;ctx.fillStyle=i%3?'#111':'#b91c1c';ctx.beginPath();ctx.ellipse(b.x+Math.cos(a)*rr,bl.fy-4+Math.sin(a)*5,5,2,0,0,7);ctx.fill()}
  ctx.globalAlpha=.4+.5*Math.abs(Math.sin(G.t*18));ctx.shadowColor='#ef4444';ctx.shadowBlur=18;ctx.fillStyle='#ef4444';ctx.beginPath();ctx.arc(b.x+bl.face*6,bl.fy-100,5,0,7);ctx.fill();ctx.restore()}
 ctx.save();
 if(b.enr){ctx.shadowColor='#ef4444';ctx.shadowBlur=26}
 if(b.hit>0)ctx.filter='brightness(2.2)';
 sprite(b.x,bl.fy,bl.fr,bl.face,bl.fade>0?1-bl.fade/.25:1);
 ctx.restore();
}
/* ============ TINH LINH VƯƠNG (boss map Rừng Tinh Linh, ai: "spirit") ============
   Đại tinh linh lơ lửng, đổi màu ngọc trên vương miện 0.65s trước mỗi loạt đạn nguyên tố:
   Băng (xanh lam: quạt / bắn đơn nhanh, tích Sương Giá) · Độc (xanh lục: mưa đạn + bào tử làm nhảy thấp)
   Lửa (cam: đạn cầu vồng nảy sàn) · Hư Không (tím: đạn xoắn ốc uốn cong) · Lôi (vàng: 3 phát bắn thẳng nhắm theo người chơi).
   Gối đầu: loạt sau nối đuôi khi loạt trước đi được ~60%; pha 2 (dưới 40% máu) bắn cặp 2 nguyên tố chồng nhau.
   Rừng Tinh Linh Chúc Phúc: mỗi khi mất ~25% máu, hạ xuống giữa sân niệm 3.5s (pha 2: 2.8s), hồi tổng ~14% máu.
   Vòng 4 viên đạn nguyên tố quay quanh chặn đạn của người chơi; gây đủ sát thương trong lúc niệm sẽ phá vỡ -> Boss choáng 1.5s
   (pha 2: còn mất thêm 7% máu). Chỉ niệm khi người chơi có thể bắn (vòng 4 trở lên). */
const TS_EL={ice:'#38bdf8',poison:'#22c55e',fire:'#f97316',void:'#a855f7',light:'#facc15'};
function tsAt(ts,t,fn){ts.q.push([ts.c+t,fn]);ts.q.sort((a,c)=>a[0]-c[0])}
function tsSm(b){return(1+.02*Math.min(G.round,10))*(b.enr?1.12:1)}
function tsTel(b){return Math.max(.45,.65-.015*G.round)*(b.enr?.9:1)}
function tsHit(b){
 const h=G.hp;hurt(b.dmg);if(G.hp>=h)return;
 if(b.el==='ice')addFrost(1);
 else if(b.el==='spore'){P.pjT=2;popText('💚 nhảy thấp',P.x,P.y-ph()-14,'#bef264')}
}
function tsInit(b){b.hr=52;b.ts={m:'in',c:0,q:[],endT:0,rest:1.3,fr:2,gem:'#86efac',gemT:0,tx:450,ty:150,pos:1,last:'',nextB:b.max*.75,st:0,bc:0,pre:.6,cast:3.5,orbs:[],acc:0,tickT:0,dropT:0,was:false,hpPrev:b.hp,face:1}}
function tsAbsorb(s){const ts=G.boss.ts;if(!ts||ts.m!=='bless'||ts.bc<ts.pre)return false;
 for(const o of ts.orbs)if(Math.hypot(s.x-o.x,s.y-o.y)<16){burstParts(o.x,o.y,TS_EL[o.el],5);return true}return false}
function tsVolley(b,el,t0){
 const ts=b.ts,r=G.round,dm=dmgOf(r),tel=tsTel(b),sm=tsSm(b),F=t0+tel;
 tsAt(ts,t0,()=>{ts.gem=TS_EL[el];ts.gemT=tel;ts.fr=3});
 const shot=(x,y,vx,vy,o)=>G.bullets.push(Object.assign({type:'eshot',x,y,vx,vy,r:8,el,age:0,dmg:dm},o||{}));
 const aimA=()=>Math.atan2(P.y-ph()/2-b.y,P.x-b.x);
 if(el==='ice'){
  if(Math.random()<.6){const n=Math.min(8,5+(r/4|0));
   tsAt(ts,F,()=>{ts.fr=6;const a=aimA();for(let i=0;i<n;i++){const q=a+(i-(n-1)/2)*(.95/(n-1));shot(b.x,b.y,Math.cos(q)*320*sm,Math.sin(q)*320*sm)}beep(700,.1,.05,'triangle')});return F+.6}
  for(let i=0;i<2;i++)tsAt(ts,F+i*.28,()=>{ts.fr=4;const a=aimA();shot(b.x,b.y,Math.cos(a)*700*sm,Math.sin(a)*700*sm,{r:9});beep(900,.06,.05,'triangle')});return F+.7}
 if(el==='poison'){const n=Math.min(22,14+r);
  tsAt(ts,F,()=>{ts.fr=5;for(let i=0;i<4;i++)G.bullets.push({type:'eshot',x:rnd(80,820),y:rnd(260,400),vx:rnd(-30,30),vy:rnd(-12,12),r:11,el:'spore',age:0,dmg:Math.max(1,dm>>1),life:6,sway:36,ph:rnd(0,6)})});
  for(let i=0;i<n;i++)tsAt(ts,F+i*.1,()=>{const x=i%3===0?clamp(P.x+rnd(-90,90),40,860):rnd(40,860);G.bullets.push({type:'eshot',x,y:-10,vx:0,vy:rnd(250,330)*sm,r:7,el:'poison',age:0,dmg:dm})});
  return F+n*.1+.5}
 if(el==='fire'){
  for(let i=0;i<3;i++)tsAt(ts,F+i*.25,()=>{ts.fr=5;const d=P.x>=b.x?1:-1;shot(b.x,b.y,d*(200+r*6+i*45)*sm,-120,{r:11,g:900,bn:3});beep(300,.1,.05,'triangle')});return F+.9}
 if(el==='void'){
  for(let i=0;i<14;i++)tsAt(ts,F+i*.09,()=>{ts.fr=6;const a=aimA()+(i%2?.55:-.55);shot(b.x,b.y,Math.cos(a)*250*sm,Math.sin(a)*250*sm,{r:7,om:(i%2?-1.5:1.5),life:3.2})});return F+14*.09+.6}
 /* light: 3 phát bắn thẳng, mỗi phát có vạch ngắm 0.28s */
 for(let i=0;i<3;i++){const t=F+i*.4,g=[0,0];
  tsAt(ts,t-.28,()=>{g[0]=P.x+P.vx*.12;g[1]=P.y-ph()/2;G.bullets.push({type:'efx',x:b.x,y:b.y,x1:g[0],y1:g[1],vx:0,vy:0,r:0,age:0,life:.28})});
  tsAt(ts,t,()=>{ts.fr=4;const a=Math.atan2(g[1]-b.y,g[0]-b.x);shot(b.x,b.y,Math.cos(a)*660*sm,Math.sin(a)*660*sm,{r:6});beep(1100,.05,.05,'square')})}
 return F+2*.4+.5;
}
function tsChoose(b){
 const ts=b.ts,r=G.round,E=!!b.enr,pc=b.hp/b.max,EL=['ice','poison','fire','void','light'];
 const one=ex=>pick(EL.filter(e=>e!==ts.last&&e!==ex));
 ts.pos=pick([0,1,2].filter(i=>i!==ts.pos));ts.tx=[170,450,730][ts.pos]+rnd(-30,30);ts.ty=rnd(125,195);
 let end=0;
 if(E){const pr=pick([['poison','light'],['ice','void'],['fire','ice'],['void','light'],['poison','fire']].filter(p=>!p.includes(ts.last)));
  end=Math.max(tsVolley(b,pr[0],0),tsVolley(b,pr[1],.12));ts.last=pr[1];
  if(r>=6&&Math.random()<.45){const e3=one(pr[0]);end=Math.max(end,tsVolley(b,e3,end*.6));ts.last=e3}}
 else if((r>=2&&Math.random()<.25)||(r>=3&&pc<.8&&Math.random()<.55)){const e1=one(),e2=one(e1),e1end=tsVolley(b,e1,0);end=Math.max(e1end,tsVolley(b,e2,Math.max(.5,e1end*.6)));ts.last=e2}
 else{const e=one();end=tsVolley(b,e,0);ts.last=e}
 ts.endT=ts.c+end;
}
function tsBless(b){
 const ts=b.ts;ts.m='bless';ts.bc=0;ts.cast=b.enr?2.8:3.5;ts.acc=0;ts.tickT=0;ts.dropT=.4;ts.tx=450;ts.ty=285;ts.gem='#fde047';ts.gemT=0;
 ts.orbs=['ice','poison','fire','light'].map((el,i)=>({a:i*1.5708,x:b.x,y:b.y,el,cd:0}));
 banner('🌿 CHÚC PHÚC: bắn dồn để phá vòng hồi máu!');G.bannerT=2.2;beep(520,.3,.06,'sine');
}
function tsBlessEnd(b,broken){
 const ts=b.ts;ts.orbs=[];ts.nextB=b.hp-b.max*.25;
 if(broken){ts.m='stun';ts.st=1.5;ts.fr=11;G.shake=Math.max(G.shake,.4);burstParts(b.x,b.y,'#fde047',40);beep(110,.4,.1,'sawtooth');
  banner('💥 PHÁ VỠ CHÚC PHÚC! Boss choáng');G.bannerT=2;
  if(b.enr){const d=b.max*.07;b.hp-=d;popText('-'+Math.round(d),b.x,b.y-70,'#fde047')}}
 else{ts.m='float';ts.rest=.9;ts.fr=0}
}
function spiritAI(b,dt){
 if(G.timeStop>0)return;
 if(!b.ts)tsInit(b);const ts=b.ts,r=G.round;b.vis=1;
 const dmg=ts.hpPrev-b.hp;
 if(ts.m==='in'){b.y=Math.min(150,b.y+160*dt);if(b.y>=150){ts.m='float';ts.rest=1.2;ts.fr=0}ts.hpPrev=b.hp;return}
 ts.face=P.x>=b.x?1:-1;ts.gemT=Math.max(0,ts.gemT-dt);
 const sp=(b.enr?420:320),dx=ts.tx-b.x;
 b.x+=clamp(dx,-sp*dt,sp*dt);b.y+=(ts.ty+(ts.m==='bless'?0:Math.sin(G.t*2.4)*8)-b.y)*Math.min(1,3*dt);
 if(ts.m==='stun'){ts.st-=dt;ts.fr=11;if(ts.st<=0){ts.m='float';ts.rest=.7;ts.fr=0}}
 else if(ts.m==='bless'){
  ts.bc+=dt;
  if(ts.bc<ts.pre)ts.fr=3;
  else{
   ts.fr=Math.floor(G.t*4)%2?8:7;
   if(dmg>0)ts.acc+=dmg;
   ts.tickT+=dt;
   if(ts.tickT>=.5){ts.tickT-=.5;const h=b.max*.14*(.5/ts.cast);b.hp=Math.min(b.max,b.hp+h);popText('+'+Math.round(h),b.x+rnd(-20,20),b.y-70,'#86efac');burstParts(b.x,b.y,'#86efac',6)}
   const dm=dmgOf(r),w=b.enr?2.8:2.2;
   ts.orbs.forEach((o,i)=>{o.a+=w*dt;o.x=b.x+Math.cos(o.a)*88;o.y=b.y+Math.sin(o.a)*72;o.cd-=dt;
    if(o.cd<=0&&G.mode==='playing'&&Math.hypot(P.x-o.x,P.y-ph()/2-o.y)<ph()/2+8){o.cd=.8;hurt(dm)}});
   ts.dropT-=dt;if(ts.dropT<=0){ts.dropT=.55*(b.enr?.8:1);const el=pick(['ice','poison','fire']);G.bullets.push({type:'eshot',x:clamp(P.x+rnd(-170,170),40,860),y:-10,vx:0,vy:230,r:7,el,age:0,dmg:dm})}
   if(ts.acc>=b.max*.085*(b.enr?.9:1))tsBlessEnd(b,true);
   else if(ts.bc-ts.pre>=ts.cast)tsBlessEnd(b,false);
  }
 }else{
  ts.c+=dt;while(ts.q.length&&ts.q[0][0]<=ts.c)ts.q.shift()[1]();
  const busy=ts.q.length>0||ts.c<ts.endT;
  if(ts.was&&!busy)ts.rest=Math.max(.5,1.15-.04*r)*(b.enr?.75:1);
  ts.was=busy;
  if(!busy){
   ts.fr=Math.abs(dx)>50?2:(Math.floor(G.t*2.5)%2?(b.enr?9:1):0);
   ts.rest-=dt;
   if(ts.rest<=0){if(b.fight&&b.hp<=ts.nextB&&b.hp>0)tsBless(b);else tsChoose(b)}
  }
 }
 ts.hpPrev=b.hp;
}
function drawSpirit(b){
 const ts=b.ts,at=b.d.atlas;if(!ts)return;
 const D=150,k=D/192,bob=ts.m==='bless'?0:Math.sin(G.t*2.4)*4;
 if(ts.m==='bless'){const on=ts.bc>=ts.pre,pu=.5+.5*Math.sin(G.t*6);ctx.save();
  ctx.globalAlpha=on?.28+.12*pu:.12;ctx.fillStyle='#fde68a';ctx.beginPath();ctx.arc(b.x,b.y,108,0,7);ctx.fill();
  ctx.globalAlpha=on?.9:.4;ctx.strokeStyle='#5eead4';ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x,b.y,100+pu*5,0,7);ctx.stroke();ctx.strokeStyle='#fde047';ctx.lineWidth=2;ctx.beginPath();ctx.arc(b.x,b.y,108+pu*4,0,7);ctx.stroke();
  if(on){ctx.fillStyle='#fef08a';for(let i=0;i<14;i++){const a=i*.45+G.t*1.3,rr=40+((i*37+G.t*60)%70);ctx.globalAlpha=.8;ctx.fillRect(b.x+Math.cos(a)*rr,b.y+Math.sin(a)*rr*.8-((G.t*40+i*9)%30),3,3)}
   const pr=clamp(ts.acc/(b.max*.085*(b.enr?.9:1)),0,1);ctx.globalAlpha=1;ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(b.x-40,b.y+88,80,7);ctx.fillStyle=pr>.7?'#f87171':'#fde047';ctx.fillRect(b.x-39,b.y+89,78*pr,5);ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.strokeRect(b.x-40.5,b.y+87.5,81,8)}
  ctx.restore();
  for(const o of ts.orbs){ctx.save();ctx.shadowColor=TS_EL[o.el];ctx.shadowBlur=16;ctx.fillStyle=TS_EL[o.el];ctx.beginPath();ctx.arc(o.x,o.y,11,0,7);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(o.x-3,o.y-3,3.5,0,7);ctx.fill();ctx.restore()}}
 /* báo trước: ngọc vương miện đổi màu + vòng sáng thu nhỏ */
 if(ts.gemT>0&&ts.m==='float'){const tl=tsTel(b),u=ts.gemT/tl;ctx.save();ctx.globalAlpha=.8;ctx.strokeStyle=ts.gem;ctx.shadowColor=ts.gem;ctx.shadowBlur=14;ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x,b.y-40,16+60*u,0,7);ctx.stroke();ctx.restore()}
 ctx.save();ctx.translate(b.x,b.y+bob);
 if(b.enr){ctx.shadowColor='#34d399';ctx.shadowBlur=26}
 else if(ts.gemT>0){ctx.shadowColor=ts.gem;ctx.shadowBlur=18}
 if(b.hit>0)ctx.filter='brightness(2.2)';
 if(at&&at.complete&&at.naturalWidth){ctx.scale(ts.face,1);ctx.drawImage(at,(ts.fr%6)*192,Math.floor(ts.fr/6)*192,192,192,-D/2,-D*.58,D,D)}
 ctx.restore();
 ctx.save();ctx.shadowColor=ts.gem;ctx.shadowBlur=16;ctx.fillStyle=ts.gem;ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(b.x,b.y-44+bob,5,0,7);ctx.fill();ctx.restore();
}
/* ============ LÕI TRÍ TUỆ QUÁ TẢI (boss map Phòng Thí Nghiệm) ============
   Treo trên ray trần, trượt ngang. 3 chu kỳ lặp lại, nghỉ 1.5–2 giây giữa các chu kỳ:
   1 Nhịp nhẹ (đạn gia tốc nối tiếp + laser tầm cao) · 2 Nhịp dồn (laser tầm thấp + cầu điện từ + đạn bám trục X)
   3 Quá Tải (lõi đỏ: laser chéo/kép, mưa plasma, đạn trần khựng ngắn). Trúng đòn gây nhiễu sóng (glitch). */
function ovTel(){return Math.max(.5,1-.04*G.round)*((G.boss&&G.boss.enr)?.85:1)}
function ovHold(c){return Math.max(.22,.5-.02*G.round)*(c===2?.8:1)}
function ovHit(d){const h=G.hp;hurt(d);if(G.hp<h)G.glitch=1.3}
function esphBoom(b,out){burstParts(b.x,b.y,'#38bdf8',14);beep(500,.12,.05,'triangle');
 const n=8,sp=190+G.round*4,o=Math.random()*6.28;
 for(let i=0;i<n;i++){const a=o+i*6.2832/n;out.push({type:'espk',x:b.x,y:b.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:5,dmg:b.dmg})}}
function ovInit(b){b.ov={cyc:0,mode:'rest',t:1.6,wt:0,len:0,evs:[],heat:0,tx:b.x,arm:0,side:1}}
function ovPick(b){const o=b.ov;let x;do{x=rnd(110,790)}while(Math.abs(x-b.x)<220);o.tx=x}
function overloadAI(b,dt){
 if(G.timeStop>0)return;
 if(!b.ov)ovInit(b);const o=b.ov;
 b.vis=1;
 if(b.t<1.2){b.y=Math.min(110,b.y+150*dt);return}
 b.y+=(110-b.y)*Math.min(1,4*dt);
 const sp=Math.min(700,300+G.round*12)*(o.cyc===2&&o.mode==='wave'?1.5:1)*(o.mode==='rest'?.6:1);
 if(Math.abs(o.tx-b.x)<4)ovPick(b);
 b.x+=clamp(o.tx-b.x,-sp*dt,sp*dt);
 o.arm=Math.max(0,o.arm-dt);
 o.heat+=((o.mode==='wave'?[0,.35,1][o.cyc]:0)-o.heat)*Math.min(1,2.5*dt);
 if(o.mode==='rest'){o.t-=dt;if(o.t<=0)ovStart(b)}else ovWave(b,dt);
}
function ovStart(b){
 const o=b.ov,c=o.cyc,r=G.round,tel=ovTel(),hd=ovHold(c),E=o.evs=[],B=tel+.3,dm=dmgOf(r);
 o.mode='wave';o.wt=0;
 const lb=(t,k,by,y2)=>E.push({t,k:'beam',by,y2,tel:B});
 const pu=(t,x,trk)=>E.push({t,k:'pulse',x,trk,hold:hd});
 const HI=FLOOR-42,LO=FLOOR-8;
 if(c===0){
  /* Chu kỳ 1: đạn gia tốc rơi nối tiếp như phím đàn + 1 laser tầm cao (ép cúi) */
  const n=r<=3?5:6,rev=Math.random()<.5,gap=n===5?170:150;
  for(let i=0;i<n;i++)pu(.9+i*.22,80+(rev?n-1-i:i)*gap);
  lb(1.1,0,HI);
  o.len=3.9;
 }else if(c===1){
  /* Chu kỳ 2: laser tầm thấp (ép nhảy) + cầu điện từ + đạn bám trục X */
  lb(.9,0,LO);
  E.push({t:.5,k:'esph',x:60,vx:90,y:230},{t:.5,k:'esph',x:840,vx:-90,y:290});
  for(let i=0;i<3;i++)pu(1.5+i*.8,0,true);
  if(r>=6)lb(3.0,0,HI);
  o.len=r>=6?4.9:4.4;
 }else{
  /* Chu kỳ 3: quá tải — nổ cầu, laser chéo đan nhau, laser kép lệch nhịp, mưa plasma, đạn trần nhanh */
  E.push({t:.15,k:'boom'});
  lb(.9,0,150,LO);lb(.9,0,LO,150);
  lb(2.7,0,HI);lb(3.2,0,LO);
  const pn=r<=3?3:5;for(let i=0;i<pn;i++)pu(3.4+i*.16,100+i*(700/(pn-1)));
  for(let t=1.0;t<3.4;t+=Math.max(.14,.26-.01*r))E.push({t,k:'drop'});
  o.len=5.6;
 }
 E.sort((a,b)=>a.t-b.t);
}
function ovFire(b,e){
 const o=b.ov,dm=dmgOf(G.round);o.arm=.4;
 if(e.k==='beam'){G.bullets.push({type:'lbeam',x:0,y:0,vx:0,vy:0,r:0,age:0,tel:e.tel,hold:.55,by:e.by,y2:e.y2,dmg:dm});beep(900,.1,.04,'square')}
 else if(e.k==='pulse'){const dr=.3,vx=e.trk?0:(Math.random()<.5?-40:40),x=e.trk?clamp(P.x+rnd(-60,60),60,840):e.x-vx*dr;
  G.bullets.push({type:'apulse',x,y:34,vx,vy:0,r:11,age:0,drift:e.trk?.7:dr,ph:0,t:0,bp:-1,hold:e.hold,trk:!!e.trk,dmg:dm})}
 else if(e.k==='esph')G.bullets.push({type:'esph',x:e.x,y:e.y,vx:e.vx,vy:0,r:15,age:0,life:2.3,dmg:dm});
 else if(e.k==='drop')G.bullets.push({type:'pdrop',x:rnd(50,850),y:30,vx:0,vy:rnd(120,220),r:6,dmg:dm});
 else if(e.k==='boom'){for(const q of G.bullets)if(q.type==='esph')q.age=q.life;G.shake=Math.max(G.shake,.3);beep(120,.4,.08,'sawtooth')}
}
function ovWave(b,dt){
 const o=b.ov;o.wt+=dt;
 while(o.evs.length&&o.evs[0].t<=o.wt)ovFire(b,o.evs.shift());
 if(o.wt>=o.len&&!o.evs.length){o.mode='rest';o.cyc=(o.cyc+1)%3;o.t=clamp(2-.03*G.round,1.5,2);ovPick(b)}
}
function drawOverload(b){
 const o=b.ov;if(!o)return;
 const h=o.heat,ov=o.cyc===0&&o.mode==='wave'?0:h,col=[34+h*205,211-h*143,238-h*170].map(Math.round).join(','),t=G.t;
 const jit=h>.6?rnd(-1.5,1.5):0;
 /* ray trần */
 ctx.save();ctx.fillStyle='#1f2937';ctx.fillRect(0,10,W,10);ctx.fillStyle='#4b5563';ctx.fillRect(0,10,W,3);
 ctx.fillStyle='#374151';for(let x=20;x<W;x+=60)ctx.fillRect(x,8,4,14);
 const bx=b.x+jit,by=b.y;
 if(b.hit>0)ctx.filter='brightness(2.2)';
 /* móc + cáp thủy lực */
 ctx.fillStyle='#111827';ctx.fillRect(bx-26,6,52,18);ctx.fillStyle='#6b7280';ctx.fillRect(bx-22,8,44,4);
 ctx.strokeStyle='#374151';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(bx,22);ctx.lineTo(bx,by-36);ctx.stroke();
 ctx.strokeStyle='#9ca3af';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bx-3,22);ctx.lineTo(bx-3,by-36);ctx.stroke();
 /* hai cánh tay pháo laser */
 const ext=o.arm>0?10:0;
 for(const s of[-1,1]){ctx.fillStyle='#1f2937';ctx.fillRect(bx+s*50-(s<0?18+ext:0),by-8,18+ext,16);ctx.fillStyle='#4b5563';ctx.fillRect(bx+s*50-(s<0?18+ext:0),by-8,18+ext,4);
  if(o.arm>0){ctx.fillStyle='#ef4444';ctx.shadowColor='#ef4444';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(bx+s*(68+ext),by,4,0,7);ctx.fill();ctx.shadowBlur=0}}
 /* thân cầu cơ khí */
 const g=ctx.createRadialGradient(bx-14,by-16,6,bx,by,46);g.addColorStop(0,'#9ca3af');g.addColorStop(.5,'#4b5563');g.addColorStop(1,'#111827');
 ctx.shadowColor=`rgb(${col})`;ctx.shadowBlur=14+h*14;ctx.fillStyle=g;ctx.beginPath();ctx.arc(bx,by,44,0,7);ctx.fill();ctx.shadowBlur=0;
 ctx.strokeStyle='#1f2937';ctx.lineWidth=2;ctx.beginPath();ctx.arc(bx,by,44,0,7);ctx.stroke();
 ctx.beginPath();ctx.moveTo(bx-40,by-14);ctx.quadraticCurveTo(bx,by-34,bx+40,by-14);ctx.moveTo(bx-30,by+26);ctx.quadraticCurveTo(bx,by+40,bx+30,by+26);ctx.stroke();
 ctx.fillStyle='#6b7280';ctx.fillRect(bx-10,by-44,20,8);
 /* mắt lõi */
 const pl=.75+.25*Math.sin(t*(4+h*14));
 ctx.fillStyle='#0b1220';ctx.beginPath();ctx.arc(bx,by,22,0,7);ctx.fill();
 ctx.shadowColor=`rgb(${col})`;ctx.shadowBlur=22;ctx.fillStyle=`rgba(${col},${pl})`;ctx.beginPath();ctx.arc(bx,by,15,0,7);ctx.fill();ctx.shadowBlur=0;
 ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(bx-4,by-4,4,0,7);ctx.fill();
 /* ống cáp thõng bên dưới */
 ctx.strokeStyle='#1f2937';ctx.lineWidth=4;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(bx+i*14,by+38);ctx.quadraticCurveTo(bx+i*22+Math.sin(t*(2+h*10)+i)*(3+h*6),by+62,bx+i*8,by+60);ctx.stroke()}
 ctx.filter='none';
 /* hơi nước + tia lửa khi quá nhiệt */
 if(h>.3){ctx.fillStyle=`rgba(229,231,235,${.25*h})`;for(let i=0;i<5;i++){const ph=(t*.9+i*.37)%1;ctx.beginPath();ctx.arc(bx+(i-2)*22+Math.sin(t*3+i)*6,by-40-ph*50,8+ph*12,0,7);ctx.fill()}}
 if(h>.6){ctx.strokeStyle='#fde047';ctx.lineWidth=1.5;for(let i=0;i<4;i++){const a=rnd(0,6.28),r0=44;ctx.beginPath();ctx.moveTo(bx+Math.cos(a)*r0,by+Math.sin(a)*r0);ctx.lineTo(bx+Math.cos(a)*(r0+rnd(8,20)),by+Math.sin(a)*(r0+rnd(8,20))+rnd(-6,6));ctx.stroke()}}
 ctx.restore();
}
/* ============ THIÊN KIẾP THƯỢNG NHÂN (boss map Độ Kiếp Trận Pháp) ============
   Chu kỳ lôi kiếp 3 → 6 → 9 đạo sét, xen khoảng nghỉ "mắt bão" 1.5–2 giây rồi lặp lại.
   Không có chữ cảnh báo: 3 Lôi Cầu tự đổi màu/tốc độ xoay để báo từng đợt
   (xanh lam = Khởi Kiếp · tím = Chuyển Kiếp · vàng kim = Tuyệt Kiếp).
   Càng lên vòng cao: tia định vị ngắn dần (còn 0.45s), mỗi đạo sét đau hơn (theo dmgOf). */
const TH_POS=[170,450,730];
const TH_HEX=['#38bdf8','#a855f7','#facc15'];
const TH_COL={rest:[147,197,253],w0:[56,189,248],w1:[168,85,247],w2:[250,204,21]};
const TH_SPIN={rest:1.2,w0:2.4,w1:4.8,w2:7.5};
function thTel(){return Math.max(.45,1-.04*G.round)*((G.boss&&G.boss.enr)?.8:1)}
function thDmg(){return dmgOf(G.round)}
function thZig(x){const n=9,pts=[];for(let i=0;i<=n;i++)pts.push([x+(i&&i<n?rnd(-24,24):0),FLOOR*i/n]);return pts}
/* Trúng điện: mất máu rồi khựng (Tê Liệt) một tích tắc; Kháng Điện thì không bị khựng */
function thHit(d,para){const h=G.hp;hurt(d);if(G.hp<h&&para&&!G.imm.elec)P.para=Math.max(P.para||0,para)}
function thInit(b){b.th={mode:'rest',k:0,wave:0,t:1.6,wt:0,len:0,evs:[],ang:0,spin:1.2,cl:0,cast:0,pos:1,gx:b.x,tp:0,moved:true,snT:0,wire:null,
  col:TH_COL.rest.slice(),orbs:[0,1,2].map(()=>({x:b.x,y:b.y}))}}
function thMove(b){const th=b.th,i=pick([0,1,2].filter(j=>j!==th.pos));th.pos=i;th.gx=TH_POS[i]+rnd(-30,30);
 if(Math.abs(th.gx-b.x)>300&&Math.random()<.7){th.tp=.5;th.moved=false}}   /* xa thì thuấn di, gần thì ngự phong lướt */
function thunderAI(b,dt){
 if(G.timeStop>0)return;
 G.paraCD=Math.max(0,(G.paraCD||0)-dt);
 if(!b.th)thInit(b);const th=b.th;
 if(b.t<1.4){b.y=Math.min(120,b.y+160*dt);b.vis=1;thOrbs(b,dt);return}
 if(th.tp>0){th.tp-=dt;b.vis=th.tp>.25?(th.tp-.25)*4:(.25-th.tp)*4;
  if(th.tp<=.25&&!th.moved){th.moved=true;b.x=th.gx}
  if(th.tp<=0){th.tp=0;b.vis=1}}
 else{b.vis=1;b.x+=clamp(th.gx-b.x,-420*dt,420*dt)}
 b.y+=(120-b.y)*Math.min(1,3*dt);th.cast=Math.max(0,th.cast-dt);
 if(th.mode==='rest'){th.t-=dt;if(th.t<=0)thStartWave(b)}else thWave(b,dt);
 thOrbs(b,dt);
}
function thStartWave(b){
 const th=b.th,k=th.wave,r=G.round,tel=thTel(),E=th.evs=[];
 th.mode='wave';th.k=k;th.wt=0;th.cast=.7;th.wire=null;th.snT=1.4;
 if(k===0){
  /* Đợt 1 · Khởi Kiếp: 3 đạo, nhịp giãn vừa phải, mỗi đạo tỏa xung điện sát sàn */
  const gap=Math.max(.5,1.15-.03*r);let t=.9;
  for(let i=0;i<3;i++){E.push({t,k:'strike',tel,aim:i?rnd(-80,80):0,pulse:true});t+=tel+gap}
  th.len=t-gap+.8;
 }else if(k===1){
  /* Đợt 2 · Chuyển Kiếp: 6 đạo liên tiếp (tia báo đạo sau hiện ngay khi đạo trước đánh xuống) + dây điện ngang giữa 2 Lôi Cầu */
  const t2=Math.max(.4,tel*.85);
  th.wire={hi:Math.random()<.5,state:'tel',t:.9+t2};
  for(let i=0;i<6;i++)E.push({t:.9+i*t2,k:'strike',tel:t2,aim:i?pick([-1,1])*rnd(30,130):0});
  th.len=.9+6*t2+.9;
 }else if(Math.random()<.5){
  /* Đợt 3 · Tuyệt Kiếp (kiểu quét ngang): 9 đạo lần lượt từ một đầu phòng, phải lướt đúng nhịp */
  const dir=Math.random()<.5?1:-1,gs=Math.max(.26,tel*.4);
  for(let i=0;i<9;i++)E.push({t:.9+i*gs,k:'strike',tel,x:(dir>0?i:8-i)*100+50});
  th.len=.9+8*gs+tel+.9;
 }else{
  /* Đợt 3 · Tuyệt Kiếp (kiểu gọng kìm): 4 cặp từ hai rìa dồn vào giữa, rồi 1 đạo đánh thẳng vào tâm */
  const sp=Math.max(.38,tel*.75+.1);
  for(let i=0;i<4;i++)E.push({t:.9+i*sp,k:'strike',tel,x:60+i*100},{t:.9+i*sp,k:'strike',tel,x:840-i*100});
  E.push({t:.9+4*sp,k:'strike',tel:tel*1.1,aim:0,pulse:true});
  th.len=.9+4*sp+tel*1.1+.9;
 }
 E.sort((a,c)=>a.t-c.t);
}
function thFire(b,e){
 const th=b.th;th.cast=.35;
 const x=e.x!==undefined?e.x:clamp(P.x+(e.aim||0),50,850);
 G.bullets.push({type:'tstrike',x,y:0,vx:0,vy:0,r:0,age:0,tel:e.tel,dmg:thDmg(),pulse:!!e.pulse,col:TH_HEX[th.k],pts:thZig(x)});
 beep(300+th.k*80,.06,.04,'square');
}
function thSnake(){
 const L=Math.random()<.5,sp=(220+G.round*6)*((G.boss&&G.boss.enr)?1.2:1);
 G.bullets.push({type:'tsnake',x:L?WL:WR,y:rnd(250,FLOOR-30),vx:L?sp:-sp,vy:0,r:9,age:0,zt:0,sa:rnd(150,230),dmg:Math.max(1,thDmg()>>1)});
}
function thWave(b,dt){
 const th=b.th,k=th.k;th.wt+=dt;
 while(th.evs.length&&th.evs[0].t<=th.wt)thFire(b,th.evs.shift());
 const w=th.wire;
 if(w){
  w.t-=dt;
  if(w.state==='tel'&&w.t<=0){w.state='live';w.t=1.5}
  else if(w.state==='live'&&w.t<=0){w.hi=!w.hi;w.state='tel';w.t=Math.max(.6,thTel()*.85)}
  /* Lôi Châu Liên Kết: dây điện ngang tầm đầu (phải cúi) hoặc sát sàn (phải nhảy) */
  if(w.state==='live'){const o=th.orbs[0],o2=th.orbs[1],wy=w.hi?FLOOR-48:FLOOR-16;
   if(Math.abs(o.y-wy)<4&&Math.abs(o2.y-wy)<4&&o.x<WL+30&&o2.x>WR-30&&P.y-ph()<wy+8&&P.y>wy-8&&P.inv<=0&&G.mode==='playing'){thHit(Math.max(1,thDmg()>>1),.3);P.inv=Math.min(P.inv,.6)}}
 }
 if(k===2){th.snT-=dt;if(th.wt>1&&th.wt<th.len-.9&&th.snT<=0){th.snT=Math.max(.8,1.5-.04*G.round)*(b.enr?.8:1);thSnake()}}
 if(th.wt>=th.len&&!th.evs.length){th.mode='rest';th.wave=(th.wave+1)%3;th.wire=null;th.t=clamp(2-.03*G.round,1.5,2);thMove(b)}
}
function thOrbs(b,dt){
 const th=b.th,key=th.mode==='rest'?'rest':'w'+th.k,tc=TH_COL[key];
 for(let i=0;i<3;i++)th.col[i]+=(tc[i]-th.col[i])*Math.min(1,4*dt);
 th.spin+=(TH_SPIN[key]-th.spin)*Math.min(1,3*dt);th.ang+=th.spin*dt;
 th.cl+=((th.mode==='wave'?1:0)-th.cl)*Math.min(1,3*dt);
 for(let i=0;i<3;i++){
  const o=th.orbs[i],a=th.ang+i*2.0944;let tx,ty,sp=900;
  if(th.wire&&i<2){tx=i?WR-14:WL+14;ty=th.wire.hi?FLOOR-48:FLOOR-16;sp=700}
  else if(th.mode==='wave'&&th.k===2){tx=b.x+Math.cos(a)*46;ty=b.y-78+Math.sin(a)*14}   /* vòng lôi ấn trên đỉnh đầu */
  else{tx=b.x+Math.cos(a)*62;ty=b.y+Math.sin(a)*22-4}
  const dx=tx-o.x,dy=ty-o.y,d=Math.hypot(dx,dy)||1,st=Math.min(d,sp*dt);o.x+=dx/d*st;o.y+=dy/d*st;
 }
}
function thArc(p,q,w,jit){ctx.beginPath();ctx.moveTo(p.x,p.y);const n=10;
 for(let i=1;i<n;i++){const t=i/n;ctx.lineTo(p.x+(q.x-p.x)*t+rnd(-jit,jit),p.y+(q.y-p.y)*t+rnd(-jit,jit))}
 ctx.lineTo(q.x,q.y);ctx.lineWidth=w;ctx.stroke()}
function drawThunder(b){
 const th=b.th;if(!th)return;
 const vis=b.vis===undefined?1:clamp(b.vis,0,1),bob=Math.sin(b.t*3)*6,col='rgb('+th.col.map(Math.round).join(',')+')';
 /* mây đen trên trần khi đang gieo kiếp */
 if(th.cl>.02){ctx.save();ctx.globalAlpha=.6*th.cl;ctx.fillStyle='#0b0f1a';
  for(let i=0;i<9;i++){ctx.beginPath();ctx.ellipse(i*110-10+Math.sin(G.t*.6+i)*14,16+(i%2)*10,72,30,0,0,7);ctx.fill()}
  ctx.globalAlpha=.1*th.cl;ctx.fillStyle=col;ctx.fillRect(0,0,W,46);ctx.restore()}
 /* thân */
 ctx.save();ctx.translate(b.x,b.y+bob);
 const weak=b.hp/b.max<.25;ctx.globalAlpha=vis*(weak?.85+.15*Math.sin(G.t*30):1);
 if(b.hit>0)ctx.filter='brightness(2.2)';
 const g=ctx.createRadialGradient(0,0,6,0,0,80);g.addColorStop(0,'rgba(255,255,255,.18)');g.addColorStop(1,'rgba(0,0,0,0)');
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,80,0,7);ctx.fill();
 const at=b.d.atlas;
 if(at&&at.complete&&at.naturalWidth){  /* sprite Thiên Kiếp Thượng Nhân (img/bosses/temple.png: 6 cột × 2 hàng, ô 192px) */
  const k=th.k,f=b.hit>0?10:weak?11:th.tp>0?3:th.cast>0?(b.enr?9:k===0?6:7):th.mode==='wave'?2:(Math.floor(G.t*1.6)%2?1:0),D=170;
  ctx.shadowColor=b.enr?'#ef4444':col;ctx.shadowBlur=b.enr?30:14;
  ctx.drawImage(at,(f%6)*192,Math.floor(f/6)*192,192,192,-D/2,-D/2-6,D,D);ctx.shadowBlur=0;
 }else{
 ctx.shadowColor=col;ctx.shadowBlur=b.enr?34:20;
 ctx.fillStyle='#e5e7eb';ctx.beginPath();ctx.ellipse(0,-20,25,36,0,0,7);ctx.fill();                      /* tóc bạc dài phía sau */
 ctx.shadowBlur=0;
 ctx.fillStyle='#111218';ctx.strokeStyle='#fbbf24';ctx.lineWidth=3;ctx.beginPath();                          /* đạo bào đen viền vàng kim */
 ctx.moveTo(-18,-12);ctx.lineTo(18,-12);ctx.lineTo(36,40);ctx.quadraticCurveTo(22,58,12,46);ctx.quadraticCurveTo(0,60,-12,46);ctx.quadraticCurveTo(-22,58,-36,40);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(-14,-12);ctx.lineTo(0,14);ctx.lineTo(14,-12);ctx.stroke();
 ctx.fillStyle='#f59e0b';ctx.fillRect(-20,24,40,6);
 const up=th.cast>0;ctx.lineCap='round';
 for(const s of[-1,1]){                                                                                         /* tay áo: kết ấn / giơ cao gọi sét */
  ctx.strokeStyle='#0b0b10';ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(s*17,-6);ctx.lineTo(up?s*28:s*6,up?-34:12);ctx.stroke();
  ctx.strokeStyle='#fbbf24';ctx.lineWidth=3;ctx.beginPath();ctx.arc(up?s*28:s*6,up?-34:12,7,0,7);ctx.stroke();
  ctx.fillStyle='#e8c4a0';ctx.beginPath();ctx.arc(up?s*28:s*6,up?-34:12,4,0,7);ctx.fill()}
 ctx.fillStyle='#e8c4a0';ctx.beginPath();ctx.arc(0,-27,14,0,7);ctx.fill();                                      /* mặt */
 ctx.fillStyle='#f3f4f6';ctx.beginPath();ctx.arc(0,-29,15,Math.PI,0);ctx.fill();                                /* tóc mái */
 ctx.beginPath();ctx.arc(0,-47,6,0,7);ctx.fill();ctx.fillStyle='#fbbf24';ctx.fillRect(-10,-45,20,5);ctx.fillRect(-1.5,-50,3,10);   /* búi tóc + đạo quan vàng */
 ctx.fillStyle='#f9fafb';ctx.beginPath();ctx.moveTo(-10,-21);ctx.quadraticCurveTo(-15,12,0,36);ctx.quadraticCurveTo(15,12,10,-21);ctx.quadraticCurveTo(0,-14,-10,-21);ctx.fill();   /* râu bạc */
 ctx.fillStyle=b.enr?'#ef4444':col;ctx.shadowColor=b.enr?'#ef4444':col;ctx.shadowBlur=8;ctx.fillRect(-9,-31,7,2.6);ctx.fillRect(2,-31,7,2.6);ctx.shadowBlur=0;   /* mắt phát sáng */
 ctx.fillStyle='#f3f4f6';ctx.fillRect(-10,-35,8,2);ctx.fillRect(2,-35,8,2);                                    /* lông mày */
 }
 ctx.restore();
 /* Lôi Cầu + dây điện */
 ctx.save();ctx.globalAlpha=vis;ctx.lineCap='round';ctx.lineJoin='round';
 const o=th.orbs;
 if(th.mode==='wave'&&th.k===2){ctx.strokeStyle=col;ctx.shadowColor=col;ctx.shadowBlur=12;for(let i=0;i<3;i++)thArc(o[i],o[(i+1)%3],2.5,3)}
 else if(th.mode==='rest'){ctx.globalAlpha=vis*.45;ctx.strokeStyle=col;ctx.lineWidth=1;for(let i=0;i<3;i++)if(Math.sin(G.t*9+i*2)>.6)thArc(o[i],o[(i+1)%3],1,4)}
 const w=th.wire;
 if(w&&Math.abs(o[0].y-(w.hi?FLOOR-48:FLOOR-16))<4){
  if(w.state==='tel'){ctx.globalAlpha=vis*(.3+.2*Math.sin(G.t*30));ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.setLineDash([8,10]);ctx.beginPath();ctx.moveTo(o[0].x,o[0].y);ctx.lineTo(o[1].x,o[1].y);ctx.stroke();ctx.setLineDash([])}
  else{ctx.strokeStyle=col;ctx.shadowColor=col;ctx.shadowBlur=18;thArc(o[0],o[1],5,5);ctx.shadowBlur=0;ctx.strokeStyle='#fff';thArc(o[0],o[1],2,3)}}
 ctx.shadowBlur=0;ctx.globalAlpha=vis;
 for(let i=0;i<3;i++){const q=o[i];
  ctx.shadowColor=col;ctx.shadowBlur=20;ctx.fillStyle=col;ctx.beginPath();ctx.arc(q.x,q.y,11,0,7);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(q.x,q.y,5,0,7);ctx.fill();
  ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.globalAlpha=vis*.8;
  for(let j=0;j<3;j++){const a=rnd(0,6.28);ctx.beginPath();ctx.moveTo(q.x+Math.cos(a)*11,q.y+Math.sin(a)*11);ctx.lineTo(q.x+Math.cos(a)*(17+rnd(0,6)),q.y+Math.sin(a)*(17+rnd(0,6)));ctx.stroke()}
  ctx.globalAlpha=vis}
 ctx.restore();
}

/* ============ THẤT DIỆN QUỶ VƯƠNG (boss map Hầm Ngục Tối, ai: "sins") ============
   7 mặt nạ = 7 đại tội = 7 kỹ năng. Báo bằng vòng sáng + tên đúng màu mặt nạ ~1 giây rồi mới ra đòn.
   Vòng 1–5: 1 mặt nạ mỗi lượt · vòng 6+: 2 mặt nạ hợp kích (SIN_PAIRS). Giữa các lượt boss đổi chỗ: độn thổ hoặc lướt chém (từ vòng 3).
   Sprite img/bosses/dungeon.png (6 cột × 2 hàng, ô 192px): 0-1 đứng · 2 lướt · 3 Kiêu Ngạo · 4 Phẫn Nộ · 5 Tham Lam · 6 Đố Kỵ · 7 Dục Vọng · 8 Phàm Ăn · 9 Lười Biếng · 10 trúng đòn · 11 độn thổ */
const SINS={pride:{n:'Kiêu Ngạo',c:'#facc15',f:3},wrath:{n:'Phẫn Nộ',c:'#ef4444',f:4},greed:{n:'Tham Lam',c:'#d97706',f:5},envy:{n:'Đố Kỵ',c:'#22c55e',f:6},lust:{n:'Dục Vọng',c:'#d946ef',f:7},glut:{n:'Phàm Ăn',c:'#f97316',f:8},sloth:{n:'Lười Biếng',c:'#cbd5e1',f:9}};
const SIN_PAIRS=[['sloth','wrath'],['glut','pride'],['greed','lust'],['envy','sloth'],['wrath','glut']];
const SIN_Y=FLOOR-76;
function sinZ(z){G.sz.push(Object.assign({t0:.6,t1:.4,hit:true},z))}
function sinZones(dt){
 const pl=P.x-pw()/2,pr=P.x+pw()/2,pt=P.y-ph(),pb=P.y;
 for(const z of G.sz){
  if(z.t0>0){z.t0-=dt;continue}
  z.t1-=dt;if(z.vx)z.x+=z.vx*dt;
  if(pr>z.x&&pl<z.x+z.w&&pb>z.y&&pt<z.y+z.h){if(z.fn)z.fn(z,dt);else if(z.slow){P.slow=Math.max(P.slow,.3)}else if(z.hit)hurt(dmgOf(G.round))}}
 G.sz=G.sz.filter(z=>z.t1>0);
}
function sinPick(sn){
 const r=G.round;let c;
 do{c=r>=6?pick(SIN_PAIRS).slice():[pick(Object.keys(SINS))];if(c.length>1&&Math.random()<.5)c.reverse()}while(c[0]===sn.last);
 sn.last=c[0];return c;
}
/* Khóa góc: xích từ mép tường gần người chơi nhất */
function sinChain(){const left=P.x<450;sinZ({k:'chain',x:left?WL:WR-64,y:FLOOR-260,w:64,h:260,t0:.5,t1:.35,hit:true,c:'#d97706'});}
/* Sàn lửa: Phẫn Nộ đốt sàn ở nửa xa người chơi */
function sinFire(){const far=P.x<450?WR-200:WL;sinZ({k:'fire',x:far,y:FLOOR-22,w:200,h:22,t0:.4,t1:1.4,hit:true,c:'#ef4444'});}
const SK={
 pride(b,a,dt,r){
  b.x+=(450-b.x)*Math.min(1,3*dt);b.y+=(96-b.y)*Math.min(1,3*dt);
  const n=r>=8?3:2;a.s=a.s||0;
  while(a.s<n&&a.t>.8+a.s*1.3){const d=a.s%2?-1:1;a.s++;
   sinZ({k:'band',x:d>0?-240:W,y:FLOOR-50,w:240,h:18,tx:0,tw:W,t0:.55,t1:2.3,vx:d*520,c:'#facc15'})}
  a.cd=(a.cd||0)-dt;
  if(a.t>.8&&a.cd<=0&&P.y<FLOOR-34){a.cd=1.3;sinZ({k:'pillar',x:P.x-28,y:0,w:56,h:FLOOR,t0:.5,t1:.3,c:'#fde047'})}
  return a.t>.8+(n-1)*1.3+3;
 },
 wrath(b,a,dt,r){
  b.y+=(SIN_Y-b.y)*Math.min(1,8*dt);
  if(!a.s&&a.t>.5){a.s=1;a.N=7+Math.min(3,Math.floor(r/4));G.shake=.5;beep(90,.3,.1,'sawtooth');
   for(const d of[-1,1])for(let i=1;i<=a.N;i++){const x=b.x+d*i*62;if(x<WL||x>WR||i%4===0)continue;
    sinZ({k:'fire',x:x-24,y:FLOOR-92,w:48,h:92,t0:.45+i*.16,t1:.55,c:'#ef4444'})}}
  return a.s&&a.t>.5+a.N*.16+1.1;
 },
 greed(b,a,dt,r){
  const sn=b.sn;b.y+=(SIN_Y-b.y)*Math.min(1,8*dt);
  if(!a.s&&a.t>.6){a.s=1;a.pull=1.7;sn.ch={x:P.x,y:FLOOR-6};beep(200,.15,.06,'square')}
  if(a.pull>0){a.pull-=dt;sn.ch.y=FLOOR-6;const d=Math.sign(b.x-P.x);
   if(P.dash>0){a.pull=0;popText('Thoát!',P.x,P.y-70,'#fbbf24')}
   else if(Math.abs(b.x-P.x)<56){a.pull=0;hurt(dmgOf(r))}
   else if(P.frozen<=0&&P.para<=0)P.x=clamp(P.x+d*230*dt,WL+pw()/2,WR-pw()/2);
   sn.ch.x=P.x}else sn.ch=null;
  a.sh=(a.sh||0)-dt;
  if(a.t>.3&&a.t<2.9&&a.sh<=0){a.sh=.34;const x=a.k=!a.k?rnd(WL+20,WR-20):clamp(P.x+rnd(-90,90),WL+20,WR-20);G.bullets.push({type:'sinshard',x,y:-10,vx:0,vy:260+r*6,r:8})}
  return a.t>3.2;
 },
 envy(b,a,dt,r){
  const sn=b.sn;
  if(a.t<.4){b.vis=1-a.t/.4;sn.fr=11}
  else if(a.t<.8){if(!a.m){a.m=1;b.x=clamp(P.x-P.face*150,70,830);b.y=SIN_Y}b.vis=(a.t-.4)/.4;sn.fr=11}
  else{const tx=clamp(P.x-P.face*150,70,830);b.x+=clamp(tx-b.x,-200*dt,200*dt);b.y+=(SIN_Y-b.y)*Math.min(1,8*dt)}
  a.v=(a.v||0);
  if(a.t>.9+a.v*.5&&a.v<5){a.v++;const sp=380+r*8,ang=Math.atan2(P.y-ph()/2-(b.y-20),P.x-b.x),m=r>=7?1:0;
   for(let i=-m;i<=m;i++){const q=ang+i*.2;G.bullets.push({type:'sinspike',x:b.x,y:b.y-20,vx:Math.cos(q)*sp,vy:Math.sin(q)*sp,r:7})}
   if(a.v===1||(r>=7&&a.v===3))G.bullets.push({type:'sinshade',x:P.x,y:P.y-26,vx:0,vy:0,r:15,lag:1.1,life:2.6})}
  return a.t>3.7;
 },
 lust(b,a,dt,r){
  b.x+=(450-b.x)*Math.min(1,4*dt);b.y+=(SIN_Y-b.y)*Math.min(1,8*dt);
  a.th=(a.th||0)+dt*2.4;a.e=(a.e||0)-dt;
  if(a.t>.6&&a.t<3.2&&a.e<=0){a.e=.11;a.n=(a.n||0)+1;const arms=2+(r>=5?1:0)+(r>=9?1:0),sp=150+(a.n%2)*40;
   for(let k=0;k<arms;k++){const q=a.th+k*6.283/arms;G.bullets.push({type:'sinfire',x:b.x,y:b.y-24,vx:Math.cos(q)*sp,vy:Math.sin(q)*sp,r:7})}}
  return a.t>3.4;
 },
 glut(b,a,dt,r){
  b.y+=(SIN_Y-b.y)*Math.min(1,8*dt);
  if(!a.s){a.s=1;a.x=pick([130,450,770]);sinZ({k:'maw',x:a.x-80,y:FLOOR-130,w:160,h:130,t0:.9,t1:.3,c:'#f97316'})}
  if(!a.p&&a.t>1.3){a.p=1;for(let i=-1;i<=1;i++){const x=a.x+i*100;if(x<WL||x>WR)continue;sinZ({k:'acid',x:x-45,y:FLOOR-16,w:90,h:16,t0:.2,t1:3.4,c:'#84cc16'})}}
  return a.t>1.6;
 },
 sloth(b,a,dt,r){
  b.y+=(SIN_Y-b.y)*Math.min(1,8*dt);
  if(!a.s){a.s=1;const L=P.x<450;sinZ({k:'slow',x:L?0:450,y:0,w:450,h:FLOOR,t0:.6,t1:4,hit:false,slow:true,c:'#94a3b8'});
   const n=r>=6?3:2;for(let i=0;i<n;i++)G.bullets.push({type:'sinorb',x:(i+.5)*W/n+rnd(-60,60),y:-40-i*90,vx:rnd(-18,18),vy:62,r:34})}
  return a.t>1.6;
 }
};
function sinAI(b,dt){
 if(G.timeStop>0)return;
 /* Cầu hắc ám (Lười Biếng): hút nhẹ người chơi về phía boss */
 if(G.pull&&P.lo_stable){G.pull=null}
 if(G.pull){if(G.pull.w>0)G.pull.w-=dt;else G.pull.t-=dt;if(G.pull.t<=0)G.pull=null;else if(G.pull.w<=0&&G.mode==='playing'&&!P.frozen){P.x+=clamp(G.pull.x-P.x,-130*dt,130*dt);P.x=clamp(P.x,WL+pw()/2,WR-pw()/2)}}
 const r=G.round,sn=b.sn||(b.sn={m:'in',t:0,cur:[],act:{},last:'',ht:0,fr:0});
 b.hr=64;sinZones(dt);
 sn.ht-=dt;if(sn.ht<=0){sn.ht=.05;G.hist.push({t:G.t,x:P.x,y:P.y});if(G.hist.length>60)G.hist.shift()}
 sn.t-=dt;b.vis=1;sn.fr=Math.floor(G.t*1.6)%2;
 if(sn.m==='in'){b.y=Math.min(SIN_Y,b.y+300*dt);if(b.t>1.6){sn.m='wait';sn.t=.8}}
 else if(sn.m==='wait'){b.y+=(SIN_Y-b.y)*Math.min(1,6*dt);if(sn.t<=0){sn.cur=sinPick(sn);sn.m='tel';sn.t=(r>=6?.9:1.1)*(b.enr?.75:1)}}
 else if(sn.m==='tel'){if(sn.t<=0){sn.m='cast';sn.act={};for(const k of sn.cur)sn.act[k]={t:0};if(sn.cur.includes('greed'))sinChain();if(sn.cur.includes('wrath'))sinFire();if(sn.cur.includes('sloth'))G.pull={x:b.x,t:1.2,w:.5}}}
 else if(sn.m==='cast'){
  let done=true;
  for(const k of sn.cur){const a=sn.act[k];if(a.done)continue;a.t+=dt;if(SK[k](b,a,dt,r))a.done=true;else done=false}
  if(sn.fr<11)sn.fr=SINS[sn.cur[0]].f;
  if(done){sn.m='mv';sn.mv=null;sn.ch=null}
 }else if(sn.m==='mv')sinMove(b,sn,dt,r);
 b.fr=b.hit>0?10:sn.fr;
}
function sinMove(b,sn,dt,r){
 const end=()=>{sn.m='wait';sn.t=Math.max(.9,2-.07*r)*(b.enr?.75:1)};
 if(sn.mv===null){sn.mv=(r>=3&&Math.random()<.5)?'dash':'sink';sn.ph=0;sn.t=sn.mv==='dash'?.7:.45;
  sn.dest=P.x<450?pick([620,780]):pick([120,280]);
  if(sn.mv==='dash')sinZ({k:'dashtel',x:Math.min(b.x,sn.dest)-30,y:FLOOR-70,w:Math.abs(sn.dest-b.x)+60,h:70,t0:.7,t1:.01,hit:false,c:'#ef4444'})}
 b.y+=(SIN_Y-b.y)*Math.min(1,8*dt);
 if(sn.mv==='sink'){
  sn.fr=11;
  if(sn.ph===0){b.vis=Math.max(0,sn.t/.45);if(sn.t<=0){sn.ph=1;sn.t=.4;b.x=sn.dest}}
  else{b.vis=1-Math.max(0,sn.t/.4);if(sn.t<=0){b.vis=1;end()}}
 }else{
  sn.fr=2;
  if(sn.ph===0){if(sn.t<=0)sn.ph=1}
  else{const d=Math.sign(sn.dest-b.x)||1;b.x+=d*820*dt;if(Math.abs(P.x-b.x)<50&&P.y>FLOOR-72)hurt(dmgOf(G.round));if((sn.dest-b.x)*d<=0){b.x=sn.dest;end()}}
 }
}
function drawSinZ(){
 for(const z of G.sz||[]){
  ctx.save();const tel=z.t0>0;
  if(tel){const x=z.tx!==undefined?z.tx:z.x,w=z.tw!==undefined?z.tw:z.w;
   ctx.globalAlpha=.14+.1*Math.sin(G.t*20);ctx.fillStyle=z.c;
   if(z.k==='maw'){ctx.beginPath();ctx.ellipse(z.x+z.w/2,z.y+z.h/2,z.w/2*(1-z.t0/1.2),z.h/2*(1-z.t0/1.2),0,0,7);ctx.fill()}else ctx.fillRect(x,z.y,w,z.h);
   ctx.globalAlpha=.7;ctx.strokeStyle=z.c;ctx.lineWidth=2;if(z.k!=='maw')ctx.strokeRect(x,z.y,w,z.h)}
  else if(z.slow){ctx.globalAlpha=.22;ctx.fillStyle='#64748b';ctx.fillRect(z.x,z.y,z.w,z.h);ctx.globalAlpha=.5;ctx.strokeStyle='#cbd5e1';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(z.x+z.w/2,FLOOR,60+((G.t*90+i*70)%210),Math.PI,0);ctx.stroke()}}
  else if(z.k==='maw'){ctx.globalAlpha=.9;ctx.fillStyle='#7c2d12';ctx.beginPath();ctx.ellipse(z.x+z.w/2,z.y+z.h/2,z.w/2,z.h/2,0,0,7);ctx.fill();ctx.fillStyle='#fff';for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(z.x+z.w/2+i*20-8,z.y+8);ctx.lineTo(z.x+z.w/2+i*20+8,z.y+8);ctx.lineTo(z.x+z.w/2+i*20,z.y+34);ctx.fill();ctx.beginPath();ctx.moveTo(z.x+z.w/2+i*20-8,z.y+z.h-8);ctx.lineTo(z.x+z.w/2+i*20+8,z.y+z.h-8);ctx.lineTo(z.x+z.w/2+i*20,z.y+z.h-34);ctx.fill()}}
  else if(z.k==='fire'){const g=ctx.createLinearGradient(0,z.y+z.h,0,z.y);g.addColorStop(0,'#fde047');g.addColorStop(.5,'#f97316');g.addColorStop(1,'rgba(239,68,68,0)');ctx.fillStyle=g;ctx.fillRect(z.x,z.y,z.w,z.h)}
  else if(z.k==='acid'){ctx.globalAlpha=.8+.15*Math.sin(G.t*6);ctx.fillStyle='#84cc16';ctx.fillRect(z.x,z.y,z.w,z.h);ctx.fillStyle='#d9f99d';ctx.fillRect(z.x,z.y,z.w,3)}
  else{ctx.globalAlpha=.8;ctx.shadowColor=z.c;ctx.shadowBlur=16;ctx.fillStyle=z.c;ctx.fillRect(z.x,z.y,z.w,z.h);ctx.fillStyle='#fff';ctx.globalAlpha=.5;ctx.fillRect(z.x+z.w*.3,z.y,z.w*.4,z.h)}
  ctx.restore();
 }
}
function drawSin(b){
 drawSinZ();const sn=b.sn;if(!sn)return;
 if(sn.ch){ctx.save();ctx.strokeStyle='#92400e';ctx.lineWidth=4;ctx.setLineDash([10,6]);ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(sn.ch.x,sn.ch.y);ctx.stroke();ctx.restore()}
 const at=b.d.atlas;ctx.save();ctx.translate(b.x,b.y);
 if(sn.m==='tel'||sn.m==='cast'){
  sn.cur.forEach((k,i)=>{const s=SINS[k],a=sn.m==='tel'?.3+.15*Math.sin(G.t*14):.14;
   ctx.globalAlpha=a;ctx.fillStyle=s.c;ctx.beginPath();ctx.arc(0,-8,98+i*10,0,7);ctx.fill();
   if(sn.m==='tel'){ctx.globalAlpha=1;ctx.font='bold 15px Segoe UI,Arial';ctx.textAlign='center';ctx.shadowColor=s.c;ctx.shadowBlur=10;ctx.fillStyle=s.c;ctx.fillText('👺 '+s.n,0,-112-i*20)}});
 }
 ctx.globalAlpha=clamp(b.vis===undefined?1:b.vis,0,1);ctx.shadowBlur=b.enr?24:0;ctx.shadowColor='#ef4444';
 if(at&&at.complete&&at.naturalWidth){const f=b.fr||0,D=170;ctx.drawImage(at,(f%6)*192,Math.floor(f/6)*192,192,192,-D/2,-D/2,D,D)}
 else{ctx.fillStyle='#7f1d1d';ctx.beginPath();ctx.arc(0,0,50,0,7);ctx.fill()}
 ctx.restore();
}

/* ============ TUYẾT NỮ (boss map Bão Tuyết Đỉnh Băng, ai: "yuki") ============
   Boss yếu nhất, ít chiêu nhất, thiên về khống chế. Tích tầng Sương Giá (0→5): mỗi tầng -6% tốc độ chạy, đủ 5 tầng thì đóng băng 1.8s
   (bấm nhảy/lướt liên tục để phá sớm), né sạch 3.8s thì tan dần -1 tầng/giây. Gió bão tuyết 10–12s/lần: trên không bị đẩy mạnh hơn dưới sàn.
   3 chiêu: Hơi Thở Hàn Sương (quét tầm cao → cúi, tầm thấp → nhảy) · Hoa Tuyết Trôi Gió (trôi theo gió) · Nhũ Băng Vỡ Mảnh (ưu tiên tung khi vừa bị đóng băng).
   Sprite img/bosses/ice.png (6 cột × 2 hàng, ô 192px): 0-1 lơ lửng · 2 lướt · 3 tan thành lốc · 4 gió bão · 5 phất quạt · 6 hơi thở · 7 hoa tuyết · 8 nhũ băng · 9 trừng phạt · 10 trúng đòn · 11 suy yếu */
function yWeak(){return Math.max(1,Math.ceil(dmgOf(G.round)/2))}
function yStrong(){return Math.max(1,dmgOf(G.round)-1)+(P.frozen>0?1:0)}
function addFrost(n){
 if(G.imm.ice)return;
 P.frostT=0;P.frost=(P.frost||0)+n;popText('❄️'+Math.min(3,P.frost),P.x,P.y-ph()-24,'#a5f3fc');
 if(P.frost>=3){P.frost=0;P.frozen=Math.max(P.frozen,1.6);G.yFreeze=true;burstParts(P.x,P.y-ph()/2,'#bae6fd',16);beep(300,.25,.08,'triangle');
  if(G.boss&&!G.boss.dead){const a=Math.atan2(P.y-ph()/2-G.boss.y,P.x-G.boss.x);for(let i=-1;i<=1;i++){const q=a+i*.2;G.bullets.push({type:'bshot',x:G.boss.x,y:G.boss.y,vx:Math.cos(q)*320,vy:Math.sin(q)*320,r:8})}}}
}
function frostHit(n,d){
 if(P.inv>0||G.mode!=='playing'||P.ghostT>0)return;
 const sh=P.shield;if(d>0)hurt(d);if(P.shield<sh)return;addFrost(n);
}
function breathFn(z,dt){
 z.in=(z.in||0)+dt;
 if(!z.h1){z.h1=1;frostHit(1,yWeak())}else if(z.in>.6&&!z.h2){z.h2=1;addFrost(1)}
 P.x=clamp(P.x+Math.sign(z.vx)*120*dt,WL+pw()/2,WR-pw()/2);
}
const YK={
 breath(b,a,dt,r){
  if(!a.s){a.s=1;a.hi=Math.random()<.5;a.side=P.x<450?1:-1;a.bx=a.side>0?840:60}
  b.x+=(a.bx-b.x)*Math.min(1,6*dt);b.y+=((a.hi?372:410)-b.y)*Math.min(1,6*dt);
  if(a.s===1&&a.t>.5){a.s=2;sinZ({k:'mist',x:a.side>0?W:-300,y:a.hi?FLOOR-52:FLOOR-24,w:300,h:a.hi?22:24,tx:0,tw:W,t0:.8,t1:2.3,vx:-a.side*560,c:'#a5f3fc',fn:breathFn})}
  return a.s===2&&a.t>3.6;
 },
 bloom(b,a,dt,r){
  b.x+=(450-b.x)*Math.min(1,2*dt);b.y+=(250-b.y)*Math.min(1,3*dt);
  if(!a.s&&a.t>.4){a.s=1;const n=2+(r>=5?1:0);for(let i=0;i<n;i++)G.bullets.push({type:'yukibloom',x:b.x,y:b.y,vx:0,vy:0,r:22,age:0,ph:rnd(0,6),life:7,tx:rnd(140,760),ty:rnd(350,415)})}
  return a.t>1;
 },
 icicle(b,a,dt,r){
  const d0=a.punish?.05:.5;
  b.x+=(450-b.x)*Math.min(1,2*dt);b.y+=(150-b.y)*Math.min(1,4*dt);
  if(!a.s&&a.t>d0){a.s=1;const n=a.punish?3:3+Math.min(3,Math.floor(r/4));
   for(let i=0;i<n;i++){const x=clamp(a.punish?P.x+(i-1)*70:(i?rnd(WL+30,WR-30):P.x),WL+20,WR-20);G.bullets.push({type:'yukiicicle',x,y:26,vx:0,vy:0,r:11,age:0,tel:a.punish?.5:.8,fall:false})}}
  return a.s&&a.t>d0+1.8;
 }
};
function yukiGust(b,sn,dt){
 let g=G.gust;if(!g)g=G.gust={k:null,t:0,dir:1,cd:sn.gt};
 if(g.k===null){g.cd-=dt;if(g.cd<=0){g.k='warn';g.t=1.6;g.dir=pick([-1,1]);banner('🌬️ BÃO TUYẾT '+(g.dir>0?'→':'←'))}}
 else if(g.k==='warn'){g.t-=dt;if(g.t<=0){g.k='blow';g.t=3.2}}
 else{g.t-=dt;P.x=clamp(P.x+(P.gnd?60:150)*g.dir*dt,WL+pw()/2,WR-pw()/2);if(g.t<=0){g.k=null;g.cd=rnd(10,12)*(b.enr?.75:1)}}
}
function yukiAI(b,dt){
 if(G.timeStop>0)return;
 const r=G.round,sn=b.sn||(b.sn={m:'in',t:0,cur:[],act:{},last:'',fr:0,gt:rnd(7,9),pt:rnd(5,7)});
 /* Vệt sương: tồn tại 2 giây, dẫm vào thì cộng +1 tầng Sương Giá (tối đa 1 lần / 0.5 giây) */
 G.snowP=G.snowP||[];sn.pt-=dt;if(sn.pt<=0){sn.pt=rnd(5,7);G.snowP.push({x:P.x,w:120,t:2,cd:0})}
 for(const p of G.snowP){p.t-=dt;if(Math.abs(P.x-p.x)<p.w/2&&P.gnd&&G.mode==='playing'){p.cd-=dt;if(p.cd<=0){p.cd=.5;addFrost(1)}}}
 G.snowP=G.snowP.filter(p=>p.t>0);
 b.hr=58;sinZones(dt);
 P.frostT=(P.frostT||0)+dt;
 if(P.frost>0&&P.frostT>3.8){P.frostD=(P.frostD||0)+dt;if(P.frostD>=1){P.frostD=0;P.frost--;popText('❄️'+P.frost,P.x,P.y-ph()-24,'#7dd3fc')}}else P.frostD=0;
 yukiGust(b,sn,dt);
 if(G.yFreeze){G.yFreeze=false;if(sn.m!=='in'){sn.m='cast';sn.cur=['icicle'];sn.act={icicle:{t:0,punish:1}}}}
 sn.t-=dt;b.vis=1;sn.fr=Math.floor(G.t*1.6)%2;
 const g=G.gust,hov=()=>{b.y+=((300+Math.sin(G.t*1.5)*14)-b.y)*Math.min(1,4*dt)};
 if(sn.m==='in'){b.y=Math.min(300,b.y+260*dt);if(b.t>1.5){sn.m='wait';sn.t=.8}}
 else if(sn.m==='wait'){hov();if(g&&g.k)sn.fr=4;else if(b.hp/b.max<.25)sn.fr=11;
  if(sn.t<=0){let k;do{k=pick(['breath','bloom','icicle'])}while(k===sn.last);sn.last=k;sn.cur=[k];sn.m='tel';sn.t=(r>=6?.8:1)*(b.enr?.75:1)}}
 else if(sn.m==='tel'){sn.fr=({breath:6,bloom:7,icicle:8})[sn.cur[0]];if(sn.t<=0){sn.m='cast';sn.act={};for(const k of sn.cur)sn.act[k]={t:0}}}
 else if(sn.m==='cast'){
  let done=true;for(const k of sn.cur){const a=sn.act[k];if(!a||a.done)continue;a.t+=dt;if(YK[k](b,a,dt,r))a.done=true;else done=false}
  sn.fr=sn.act.icicle&&sn.act.icicle.punish?9:({breath:6,bloom:7,icicle:8})[sn.cur[0]];
  if(done){sn.m='mv';sn.mv=null}
 }else if(sn.m==='mv'){
  const end=()=>{sn.m='wait';sn.t=Math.max(1.1,2.3-.08*r)*(b.enr?.75:1)};
  if(sn.mv===null){sn.mv=Math.random()<.5?'vanish':'glide';sn.ph=0;sn.t=sn.mv==='vanish'?.4:.9;sn.dest=P.x<450?pick([620,740]):pick([160,280])}
  if(sn.mv==='vanish'){sn.fr=3;
   if(sn.ph===0){b.vis=Math.max(0,sn.t/.4);if(sn.t<=0){sn.ph=1;sn.t=.4;b.x=sn.dest;b.y=300}}
   else{b.vis=1-Math.max(0,sn.t/.4);if(sn.t<=0){b.vis=1;end()}}}
  else{sn.fr=2;b.x+=(sn.dest-b.x)*Math.min(1,4*dt);b.y+=((300-Math.sin((sn.t/.9)*3.14)*70)-b.y)*Math.min(1,6*dt);if(sn.t<=0)end()}
 }
 b.fr=b.hit>0?10:sn.fr;
}
function drawYuki(b){
 drawSinZ();const sn=b.sn;if(!sn)return;const g=G.gust;
 if(g&&g.k){ctx.save();ctx.strokeStyle='#e0f2fe';ctx.lineWidth=1.5;const w=g.k==='blow';ctx.globalAlpha=w?.5:.28;
  for(let i=0;i<46;i++){const x=(((i*97+G.t*(140+(i%5)*40)*g.dir*(w?1.6:.5))%W)+W)%W,y=(i*53+G.t*(w?30:90)*(1+i%3))%FLOOR,l=w?26:10;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-g.dir*l,y+(w?3:l));ctx.stroke()}ctx.restore()}
 if(P.frost>0){ctx.save();for(let i=0;i<5;i++){ctx.fillStyle=i<P.frost?'#7dd3fc':'rgba(148,163,184,.35)';ctx.fillRect(P.x-27+i*11,P.y-ph()-18,9,6)}ctx.restore()}
 const at=b.d.atlas;ctx.save();ctx.translate(b.x,b.y);
 if(sn.m==='tel'){ctx.globalAlpha=.22+.1*Math.sin(G.t*14);ctx.fillStyle='#a5f3fc';ctx.beginPath();ctx.arc(0,0,92,0,7);ctx.fill()}
 ctx.globalAlpha=clamp(b.vis===undefined?1:b.vis,0,1);ctx.shadowColor=b.enr?'#f87171':'#7dd3fc';ctx.shadowBlur=b.enr?22:14;
 if(at&&at.complete&&at.naturalWidth){const f=b.fr||0,D=170;ctx.drawImage(at,(f%6)*192,Math.floor(f/6)*192,192,192,-D/2,-D/2,D,D)}
 else{ctx.fillStyle='#a5f3fc';ctx.beginPath();ctx.arc(0,0,44,0,7);ctx.fill()}
 ctx.restore();
}
/* ============ SINH VẬT 000 (boss map Trạm Vũ Trụ, ai: "sv0") ============
   Mẫu vật thí nghiệm lai sinh học – cơ khí. Trọng lực thấp 80% suốt trận (nhảy cao/rơi chậm hơn).
   4 chiêu, nghỉ 1.1–2.3s giữa các lần, chỉ ghép combo từ vòng 5:
   • Cầu Axit Nảy (acid)   : 2–3 cầu nảy vòng cung giữa sàn, 2–3 nhịp rồi vỡ → luồn dưới hoặc né chỗ chạm sàn.
   • Khóa Laser Trần (laser): bám trần, tia đỏ đuổi theo bạn 0.6–0.75s, khóa 0.2s, lao chéo xuống rồi chém đuôi sát sàn (báo trước 0.4s) → nhảy.
   • Kén Ký Sinh (pods)    : 2 kén lơ lửng (vô hại), sau 2s nứt ra thả 2 ấu trùng chạy sát sàn mỗi kén → nhảy.
   • Xung Điện Đột Biến (emp, từ vòng 3): còi báo động 1s rồi 2–3 vòng sóng nở rộng có khe hở, đồng thời kích nổ sớm các kén (mỗi kén chỉ ra 1 ấu trùng).
   Combo (vòng 5+): Cầu Axit→Laser · Kén→Cầu Axit · (vòng 8+) Kén→Xung Điện.
   Sprite img/bosses/space.png (6×2, ô 192px): 0-1 lơ lửng · 2 lướt phản lực · 3 bám trần+laser · 4 vồ · 5 giương pháo · 6 bắn · 7 kén · 8 xung điện · 9 chém đuôi · 10 trúng đòn · 11 choáng */
const SV_FR={acid:5,laser:2,pods:7,emp:8,claw:6},SV_N={acid:'Cầu Axit Nảy',laser:'Khóa Laser Trần',pods:'Kén Ký Sinh',emp:'⚡ XUNG ĐIỆN ĐỘT BIẾN',claw:'Vuốt & Đuôi'},SV_C={acid:'#84cc16',laser:'#ef4444',pods:'#a3e635',emp:'#fb923c',claw:'#f97316'};
const SV={
 /* Vuốt & Đuôi: lao tới người chơi, quét vuốt lưỡi liềm tầm đầu (cúi), rồi quất đuôi sát sàn (nhảy/dash) */
 claw(b,a,dt,r){
  a.lj=a.lj||0;if(a.lj<3&&a.t>=.3+a.lj*.32){a.lj++;a.lx=P.x;}
  if(a.lj>0&&a.lj<=3&&a.lx!==undefined&&a.t<.3+3*.32){b.x+=(a.lx-b.x)*Math.min(1,12*dt);a.fr=2}
  if(a.t<.3){a.fr=2;return false}
  if(!a.c1){a.c1=1;const base=Math.atan2(P.y-ph()/2-b.y,P.x-b.x),sp=260+r*6;for(let i=-2;i<=2;i++){const q=base+i*.16;G.bullets.push({type:'bshot',x:b.x,y:b.y,vx:Math.cos(q)*sp,vy:Math.sin(q)*sp,r:8})}beep(300,.1,.05,'square')}
  if(a.t>=.75&&!a.c2){a.c2=1;const d=P.x<b.x?-1:1;G.bullets.push({type:'bshot',x:b.x,y:FLOOR-14,vx:d*(320+r*8),vy:0,r:9});beep(220,.1,.05,'square')}
  a.fr=a.t<.75?6:5;
  return a.t>1.3;
 },
 acid(b,a,dt,r){
  if(!a.s){a.s=1;a.side=P.x<450?1:-1;a.bx=a.side>0?790:110;a.n=0;a.cnt=r>=5?4:r>=3?3:2;a.fl=0}
  b.x+=(a.bx-b.x)*Math.min(1,5*dt);b.y+=(300-b.y)*Math.min(1,5*dt);
  a.fl-=dt;a.fr=a.fl>0?6:5;
  if(a.n<a.cnt&&a.t>.5+a.n*.4){const k=a.n++,dir=-a.side;a.fl=.25;
   /* nhắm cú chạm sàn đầu tiên vào chỗ người chơi đang đứng (các cầu sau lệch ±60 để chặn đường chạy) */
   const x0=b.x+dir*40,y0=b.y-10,vy0=-140,c=y0-(FLOOR-15),tt=(-vy0+Math.sqrt(vy0*vy0-1800*c))/900,
    tx=clamp(P.x+(k===0?0:(k%2?60:-60)),WL+20,WR-20);
   G.bullets.push({type:'svacid',x:x0,y:y0,vx:clamp((tx-x0)/tt,-470,470),vy:vy0,r:15,age:0,bn:0,mx:r<3?2:3});beep(340,.07,.05,'square')}
  return a.n>=a.cnt&&a.t>.5+a.cnt*.4+.4;
 },
 laser(b,a,dt,r){
  const lk=r<4?.55:.45;
  if(!a.s){a.s=1;a.bx=P.x<450?780:120;a.fr=2}
  if(a.s===1){b.x+=(a.bx-b.x)*Math.min(1,7*dt);b.y+=(84-b.y)*Math.min(1,7*dt);if(a.t>.55){a.s=2;a.t2=0;a.fr=3}}
  else if(a.s===2){a.t2+=dt;b.lz={x:b.x,y:b.y,tx:P.x,ty:P.y-ph()/2,k:a.t2/lk,lock:0};if(a.t2>=lk){a.s=3;a.t3=0;beep(900,.08,.06,'square')}}
  else if(a.s===3){a.t3+=dt;b.lz.lock=1;
   if(a.t3>=.15){a.s=4;let dx=b.lz.tx-b.x,dy=b.lz.ty-b.y,L=Math.hypot(dx,dy)||1;dx/=L;dy/=L;if(dy<.3){dy=.3;const q=Math.hypot(dx,dy);dx/=q;dy/=q}a.ux=dx;a.uy=dy;a.fr=4;beep(160,.2,.08,'sawtooth')}}
  else if(a.s===4){const sp=1100+r*20;b.x+=a.ux*sp*dt;b.y+=a.uy*sp*dt;
   if(!a.hit&&Math.hypot(b.x-P.x,b.y-(P.y-ph()/2))<44+pw()/2){a.hit=1;hurt(dmgOf(G.round))}
   if(b.y>=FLOOR-48||b.x<WL+40||b.x>WR-40){b.x=clamp(b.x,WL+40,WR-40);b.y=Math.min(b.y,FLOOR-48);a.s=5;a.lt=a.t;a.fr=9;b.lz=null;
    sinZ({k:'slash',x:clamp(b.x-190,WL,WR-380),y:FLOOR-64,w:380,h:64,t0:.35,t1:.24,c:'#a3e635'});burstParts(b.x,FLOOR,'#a3e635',10)}}
  else if(a.s===5&&r>=3&&!a.s2&&a.t>a.lt+.5){a.s2=1;a.fr=4;sinZ({k:'slash',x:clamp(P.x-130,WL,WR-260),y:FLOOR-64,w:260,h:64,t0:.4,t1:.22,c:'#a3e635'})}
  return a.s===5&&a.t>a.lt+(r>=3?1.3:.9);
 },
 pods(b,a,dt,r){
  b.x+=(450-b.x)*Math.min(1,3*dt);b.y+=(230-b.y)*Math.min(1,4*dt);a.fr=7;
  if(!a.s&&a.t>.4){a.s=1;const xs=[clamp(P.x+rnd(-90,90),120,780),rnd(120,780)];if(r>=4)xs.push(P.x<450?rnd(520,780):rnd(120,380));
   for(const x of xs)G.bullets.push({type:'svpod',x:b.x,y:b.y,vx:0,vy:0,r:16,age:0,ph:rnd(0,6),life:1.7,tx:x,ty:rnd(190,280)});beep(300,.1,.05,'triangle')}
  return a.t>.9;
 },
 emp(b,a,dt,r){
  b.x+=(450-b.x)*Math.min(1,3*dt);b.y+=(240-b.y)*Math.min(1,4*dt);a.fr=8;
  if(!a.s){a.s=1;a.n=0;a.ring=r>=4?3:2;a.bp=0}
  if(a.t<.9){G.svA=Math.max(G.svA,.2);a.bp-=dt;if(a.bp<=0){a.bp=.33;a.al=!a.al;beep(a.al?880:660,.12,.06,'square')}}
  if(a.n<a.ring&&a.t>=.9+a.n*.65){const k=a.n++;
   if(k===0)for(const q of G.bullets)if(q.type==='svpod'){q.one=true;q.life=q.age}
   let gap;
   if(k===0){const th=Math.atan2(P.y-ph()/2-b.y,P.x-b.x),off=rnd(1,1.35);gap=th+(P.x<450?-1:P.x>450?1:pick([-1,1]))*off}
   else gap=a.gp+rnd(-.3,.3);
   gap=clamp(gap,.45,2.7);a.gp=gap;
   G.bullets.push({type:'svring',x:b.x,y:b.y,vx:0,vy:0,r:0,noHit:true,age:0,rad:40,sp:235,gap,gw:r>=6?.4:.45});beep(180,.18,.07,'sawtooth');G.shake=Math.max(G.shake||0,.12)}
  return a.n>=a.ring&&a.t>.9+(a.ring-1)*.65+.5;
 }
};
/* ============ NHÀ CÁI BÓNG ĐÊM (boss map Sòng Bạc Ánh Đèn, ai: "casino") ============
   Ẩn mình trên không, luân phiên 3 chiêu: Phi Bài (card) · Xúc Xắc Gian Lận (dice) · Mưa Jackpot (coin).
   Sau mỗi chiêu dịch sang vị trí khác và nghỉ 1.2–2.6 giây tùy vòng.
   Khung sprite (img/bosses/casino.png, ô 128px, 6 cột × 2 hàng):
   0 lơ lửng · 2 lướt ngang · 4 chuẩn bị chiêu · 5 phóng bài · 7 thả xúc xắc · 8 mưa xu · 10 trúng đòn */
const CS_WHEEL=[{k:'cyan',w:3,n:'⚡ Ô Tốc Độ: Nhà Cái nhanh hơn 7 giây'},{k:'gold',w:3,n:'💰 Ô Nhân Đôi x2: chiêu kế tiếp gấp đôi'},{k:'red',w:2,n:'🔥 ALL-IN: chiêu kế tiếp gấp đôi'},{k:'grey',w:1,n:'🎡 Kẹt máy: Nhà Cái khựng lại 1.5 giây'}];
function casinoPickWheel(){let s=CS_WHEEL.reduce((a,x)=>a+x.w,0),p=Math.random()*s;for(const x of CS_WHEEL){p-=x.w;if(p<0)return x}return CS_WHEEL[0]}
/* Quạt Bài Laze: 3–5 lá bài xòe nan quạt nhắm vào người chơi */
function casinoFan(b,n){const base=Math.atan2(P.y-ph()/2-b.y,P.x-b.x);for(let i=0;i<n;i++){const a=base+(i-(n-1)/2)*.17;G.bullets.push({type:'cardlaser',x:b.x,y:b.y,vx:Math.cos(a)*430,vy:Math.sin(a)*430,r:8,rot:0})}}
/* Bài Át Boomerang: bay ngang đầu (ép cúi), chạm tường thì hạ thấp và quay lại sát sàn (ép nhảy) */
function casinoBoom(b,n){const left=b.x<W/2;for(let i=0;i<n;i++)setTimeout(()=>{if(G.boss&&!G.boss.dead&&G.mode==='playing')G.bullets.push({type:'boomerang',x:(i%2===0)===left?WL+18:WR-18,y:190,vx:(i%2===0)===left?380:-380,vy:0,r:18,rot:0,bounced:false})},i*700)}
/* Mưa Jackpot: mỗi hàng xu có một khe trống để luồn lách */
function casinoRain(n){for(let row=0;row<n;row++)setTimeout(()=>{if(!G.boss||G.boss.dead||G.mode!=='playing')return;const gap=Math.floor(rnd(0,(WR-WL)/40-3));for(let x=WL+20,i=0;x<=WR-20;x+=40,i++){if(i===gap||i===gap+1)continue;const c=makeBullet('coin');c.x=x;c.y=-10-row*18;G.bullets.push(c)}},row*650)}
/* Xúc Xắc Gian Lận: mặt ngửa khi dừng quyết định hướng tia */
function diceFire(b,out){G.firePatch=G.firePatch||[];G.firePatch.push({x:b.x,w:70,t:1.5,cd:0});const add=a=>out.push({type:'diceray',x:b.x,y:b.y-b.r,vx:Math.cos(a)*300,vy:Math.sin(a)*300,r:6});
 if(b.v===2){add(0);add(Math.PI)}
 else if(b.v===4){for(const a of[-Math.PI/4,-3*Math.PI/4,Math.PI/4,3*Math.PI/4])add(a)}
 else if(b.v===6){for(let i=0;i<6;i++)add(i*Math.PI/3)}}
function casinoCast(b,k,r,cnt){
 const rep=(n,f)=>{for(let i=0;i<n;i++)setTimeout(()=>{if(G.boss&&!G.boss.dead&&G.mode==='playing')f()},i*260)};
 if(k==='cards')casinoFan(b,Math.min(7,cnt));
 else if(k==='dice')rep(Math.min(4,cnt),()=>spawnType('dice'));
 else if(k==='coin')casinoRain(Math.min(4,cnt));
 else casinoBoom(b,Math.min(4,cnt));
}

/* ============ NỮ HOÀNG SÀO ZOMBIE (boss map Thành Phố Z, ai: "zombie") ============
   Không di chuyển, không đánh trực tiếp. Chu kỳ: phát sáng báo hiệu -> thả 3-4 bọc trứng (nở thành Zombie sau 1.4s)
   -> mỗi 3 chu kỳ phun bào tử (chạm = nhiễm độc chậm; chạm zombie = tiến hóa thành Giáp) -> mỗi 4 chu kỳ Tiến Hóa toàn sân.
   Lớp Giáp Sinh Thể: boss miễn sát thương, chỉ lộ điểm yếu 1.6 giây ngay sau khi thả trứng. */
function zombieAI(b,dt){
 if(G.timeStop>0)return;
 const r=G.round,z=b.zm||(b.zm={m:'in',t:0,cool:3.5,cyc:0,weak:0,fr:0});
 b.hr=60;b.vis=1;
 if(z.m==='in'){b.y=Math.min(112,b.y+180*dt);if(b.t>1.2)z.m='run'}
 else b.y+=((112+Math.sin(G.t*1.4)*6)-b.y)*Math.min(1,4*dt);
 let mine=0,alive=0;for(const x of G.bullets){if(x.dead)continue;if(x.type==='zdreg'||x.type==='ztank'||x.type==='zbounce')mine++;if(ZOMBIE_HP[x.type])alive++}
 /* Lớp Giáp Sinh Thể: còn bất kỳ zombie/trứng/túi sào nào thì Nữ Hoàng miễn sát thương; diệt sạch mới lộ điểm yếu */
 b.shield=alive>0||z.m==='in';
 if(z.prevAlive>0&&alive===0&&z.m!=='in'){z.cool=Math.max(z.cool,3.2);banner('💥 Hết zombie! Bắn Nữ Hoàng!');G.bannerT=1.6;beep(700,.12,.07,'triangle')}
 z.prevAlive=alive;
 if(z.m==='run'){z.cool-=dt;z.fr=b.shield?0:10;z.weak=b.shield?0:1;if(z.cool<=0){z.m='tel';z.t=.8;z.fr=2}}
 else if(z.m==='tel'){z.t-=dt;z.fr=2;if(z.t<=0){z.m='run';z.cyc++;z.cool=(b.enr?.65:1)*rnd(4.6,5.6);
   const n=(r>=6?4:3)+(b.enr?1:0),xs=[WL+50,WR-50,rnd(WL+150,WR-150),rnd(WL+150,WR-150)];
   if(mine<10)for(let i=0;i<n;i++)G.bullets.push({type:'zegg',x:xs[i%4],y:FLOOR-14,vx:0,vy:0,r:14,age:0,hatch:Math.random()<.6?'zdreg':'zbounce'});
   z.weak=1.6;z.fr=3;beep(180,.12,.06,'sawtooth');banner('🥚 Nữ Hoàng thả bọc trứng!');G.bannerT=1.5;
   if(z.cyc%3===0)for(let i=0;i<4;i++)G.bullets.push({type:'spore',x:b.x+(i-1.5)*60,y:b.y+30,vx:0,vy:0,r:8,age:0});
   if(z.cyc%4===0)zombieSurge(b,r);
   if(z.cyc%6===0&&G.bullets.filter(x=>x.type==='brood').length<2)G.bullets.push({type:'brood',x:rnd(WL+120,WR-120),y:FLOOR-22,vx:0,vy:0,r:22,age:0,hp:6});
   if(b.enr&&!z.gol&&z.cyc>=2){z.gol=1;G.bullets.push({type:'zgol',x:b.x<W/2?WR-60:WL+60,y:FLOOR-26,vx:0,vy:0,r:26,age:0,hp:12,sp:30,sweepT:3.5})}
   if(z.cyc%3===0)banner('☣️ Phun Bào Tử!');
 }}
 for(const s of G.bullets){if(s.type!=='spore'||s.dead)continue;
   if(!P.ghostT&&Math.abs(s.x-P.x)<26&&Math.abs(s.y-(P.y-ph()/2))<ph()/2+8){s.dead=true;P.slow=Math.max(P.slow||0,2.5);popText('☣️ Nhiễm độc',P.x,P.y-ph()-30,'#a3e635')}
   for(const q of G.bullets){if((q.type==='zdreg'||q.type==='zbounce')&&!q.dead&&Math.hypot(q.x-s.x,q.y-s.y)<22){s.dead=true;if(q.type==='zdreg'){q.type='ztank';q.sp=40;q.r=20;q.life=16;q.hp=4}else{q.evo=1}popText('🧟 Tiến hóa',q.x,q.y-30,'#84cc16');burstParts(q.x,q.y,'#84cc16',8);break}}}
}
/* Số đạn cần bắn trúng để hạ gục từng loại (đạn người chơi) */
const ZOMBIE_HP={zegg:1,zdreg:2,zbounce:1,ztank:4,zgol:12,brood:6};
function zGoliathDown(b){
 /* Lõi năng lượng độc ném ngược: Nữ Hoàng mất 15% máu */
 if(b&&!b.dead){b.hp=Math.max(1,b.hp-b.max*.15);banner('💥 Lõi Độc phản đòn: Nữ Hoàng mất 15% máu!');G.bannerT=2.5;beep(90,.4,.1,'sawtooth')}
}
function zombieSurge(b,r){
 for(const q of G.bullets){if(q.type==='zdreg'){q.type='ztank';q.sp=40;q.r=20;q.life=16;q.hp=4}else if(q.type==='zbounce'){q.evo=1}}
 banner('🧬 TIẾN HÓA TOÀN SÂN!');G.bannerT=2.5;beep(120,.5,.1,'sawtooth');burstParts(b.x,b.y,'#a3e635',24);
}
/* Sprite zombie: img/zombies.png, ô 64px, 6 cột × 4 hàng (0 trứng, 2–5 Thường, 6–11 Nhảy/Nổ, 12–17 Giáp, 18–23 Goliath) */
const ZS=new Image();ZS.src='img/zombies.png';
function drawZSprite(b){
 if(!ZS.complete||!ZS.naturalWidth){ctx.fillStyle='#4d7c0f';ctx.beginPath();ctx.arc(0,0,b.r||12,0,7);ctx.fill();return}
 const a=b.age||0;let f=0,s=64;
 if(b.type==='zegg'){f=a<.9?0:1;s=56}
 else if(b.type==='brood'){f=0;s=84}
 else if(b.type==='zdreg'){f=3+(Math.floor(a*5)%2)}
 else if(b.type==='ztank'){f=13+(Math.floor(a*3)%2);s=84}
 else if(b.type==='zbounce'){f=(b.y<FLOOR-b.r-3)?8:6}
 else if(b.type==='zgol'){f=19+(Math.floor(a*2)%2);s=104}
 else if(b.type==='gsweep'){f=21;s=96}
 ctx.save();
 if(P.x<b.x&&b.type!=='brood'&&b.type!=='zegg')ctx.scale(-1,1);
 ctx.drawImage(ZS,(f%6)*64,Math.floor(f/6)*64,64,64,-s/2,-s+10,s,s);
 ctx.restore();
}
function drawZombie(b){
 const at=b.d.atlas,z=b.zm||{};
 ctx.save();ctx.translate(b.x,b.y+Math.sin(b.t*3)*4);
 if(at&&at.complete&&at.naturalWidth){const f=b.fr||0;ctx.drawImage(at,(f%6)*128,Math.floor(f/6)*128,128,128,-80,-80,160,160)}
 else{ctx.fillStyle=b.d.c;ctx.beginPath();ctx.arc(0,0,44,0,7);ctx.fill()}
 if(z.m==='tel'){const k=1-z.t/.8;ctx.globalAlpha=.6*k;ctx.strokeStyle='#fde047';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,40+k*90,0,7);ctx.stroke()}
 if(b.shield&&z.m!=='in'){ctx.globalAlpha=.35+.15*Math.sin(G.t*6);ctx.strokeStyle='#bef264';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,64,0,7);ctx.stroke()}
 ctx.restore();
}
function casinoAI(b,dt){
 if(G.timeStop>0)return;
 G.firePatch=(G.firePatch||[]).filter(p=>(p.t-=dt)>0);
 for(const p of G.firePatch){if(Math.abs(P.x-p.x)<p.w/2&&P.gnd&&G.mode==='playing'){p.cd-=dt;if(p.cd<=0){p.cd=.6;hurt(dmgOf(G.round))}}}
 const r=G.round,cs=b.cs||(b.cs={m:'in',t:0,last:'',fr:0,k:'',dest:W/2,done:false,wt:12+Math.random()*3,buff:null,x2:false,allin:false,pend:null,spinT:0});
 b.hr=56;b.vis=1;cs.t-=dt;
 const low=b.hp/b.max<.5;
 if(cs.buff){cs.buff.t-=dt;if(cs.buff.t<=0)cs.buff=null}
 const sp=(cs.buff&&cs.buff.k==='cyan')?.7:1;
 /* Vòng quay chạy ngầm: quay trong 1.5 giây trong khi boss vẫn ra chiêu; kết quả áp dụng khi dừng */
 if(cs.m!=='in'&&cs.m!=='stuck'){cs.wt-=dt;if(cs.wt<=0&&cs.spinT<=0){cs.spinT=1.5;cs.wt=12+Math.random()*3;cs.pend=casinoPickWheel();banner('🎡 Vòng Quay May Mắn đang quay...');G.bannerT=1.2}}
 if(cs.spinT>0){cs.spinT-=dt;if(cs.spinT<=0){const o=cs.pend;cs.pend=null;cs.spinT=0;banner(o.n);G.bannerT=2.5;
   if(o.k==='cyan')cs.buff={k:'cyan',t:7};
   else if(o.k==='gold')cs.x2=true;
   else if(o.k==='red')cs.allin=true;
   else if(o.k==='grey'){cs.m='stuck';cs.t=1.5}
 }}
 if(cs.m==='in'){b.y=Math.min(120,b.y+200*dt);if(b.t>1.2){cs.m='wait';cs.t=1}}
 else if(cs.m==='stuck'){b.y+=(110-b.y)*Math.min(1,4*dt);cs.fr=0;if(cs.t<=0){cs.m='wait';cs.t=.6}}
 else if(cs.m==='wait'){
  b.y+=((110+Math.sin(G.t*1.6)*8)-b.y)*Math.min(1,4*dt);cs.fr=0;
  if(cs.t<=0){
   let k;do{k=pick(['cards','dice','coin','boom'])}while(k===cs.last&&Math.random()<.6);
   cs.last=k;cs.k=k;cs.m='tel';cs.t=(k==='dice'?.9:.7)*(b.enr?.75:1)*sp;
  }
 }
 else if(cs.m==='tel'){cs.fr=4;if(cs.t<=0){cs.m='cast';cs.t=.5;cs.done=false}}
 else if(cs.m==='cast'){
  cs.fr=cs.k==='cards'?5:cs.k==='dice'?7:cs.k==='coin'?8:6;
  if(!cs.done){cs.done=true;
   const base=cs.k==='cards'?(r>=6?5:3):cs.k==='dice'?(r>=5?2:1):cs.k==='coin'?(r>=7?2:1):(r>=7?2:1);
   const cnt=base*(cs.x2?2:1)*(cs.allin?2:1);casinoCast(b,cs.k,r,cnt);cs.x2=false;cs.allin=false}
  if(cs.t<=0){cs.m='mv';cs.t=.7*sp;cs.dest=pick([200,480,760].filter(x=>Math.abs(x-b.x)>120))}
 }
 else if(cs.m==='mv'){
  cs.fr=2;b.x+=(cs.dest-b.x)*Math.min(1,4*dt);
  if(cs.t<=0){cs.m='wait';cs.t=Math.max(1.2,2.6-.06*r)*(b.enr?.75:1)*(low?.85:1)*sp}
 }
 b.fr=b.hit>0?10:cs.fr;
}
function drawCasino(b){
 const at=b.d.atlas,cs=b.cs||{};
 ctx.save();ctx.translate(b.x,b.y+Math.sin(b.t*3)*6);
 if(at&&at.complete&&at.naturalWidth){const f=b.fr||0;ctx.globalAlpha=b.vis===undefined?1:clamp(b.vis,0,1);ctx.drawImage(at,(f%6)*128,Math.floor(f/6)*128,128,128,-80,-80,160,160)}
 else{ctx.fillStyle=b.d.c;ctx.beginPath();ctx.arc(0,0,44,0,7);ctx.fill()}
 ctx.globalAlpha=1;
 if(cs.spinT>0){
  const cx=0,cy=-124,R=36,rot=G.t*(cs.spinT>.5?14:4),col={cyan:'#22d3ee',gold:'#fbbf24',red:'#dc2626',grey:'#9ca3af'};
  CS_WHEEL.forEach((s,i)=>{const a0=rot+i*Math.PI/2,a1=a0+Math.PI/2;ctx.fillStyle=col[s.k];ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R,a0,a1);ctx.closePath();ctx.fill()});
  ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.stroke();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(0,cy+R+4);ctx.lineTo(-6,cy+R-6);ctx.lineTo(6,cy+R-6);ctx.closePath();ctx.fill();
 }
 ctx.restore();
}
function sv0AI(b,dt){
 if(G.timeStop>0)return;
 const r=G.round,sn=b.sn||(b.sn={m:'in',t:0,q:[],qi:0,act:{t:0},last:'',fr:0});
 b.hr=56;sinZones(dt);G.svA=Math.max(0,(G.svA||0)-dt);
 sn.t-=dt;b.vis=1;sn.fr=Math.floor(G.t*1.6)%2;
 const hov=()=>{b.y+=((300+Math.sin(G.t*1.5)*14)-b.y)*Math.min(1,4*dt)};
 if(sn.m==='in'){b.y=Math.min(300,b.y+260*dt);if(b.t>1.5){sn.m='wait';sn.t=.9}}
 else if(sn.m==='wait'){hov();if(b.hp/b.max<.25)sn.fr=11;
  if(sn.t<=0){let q;
   if(r>=3&&Math.random()<(r>=5?.55:.4)){const cb=[['acid','laser'],['pods','acid']];if(r>=4)cb.push(['claw','acid']);if(r>=6)cb.push(['pods','emp'],['laser','pods']);do{q=pick(cb).slice()}while(q[0]===sn.last)}
   else{const ks=['acid','laser','pods'];if(r>=3)ks.push('emp');if(r>=4)ks.push('claw');do{q=[pick(ks)]}while(q[0]===sn.last)}
   sn.last=q[0];sn.q=q;sn.qi=0;sn.m='tel';sn.t=(q[0]==='emp'?.4:r>=4?.7:.9)*(b.enr?.75:1)}}
 else if(sn.m==='tel'){hov();sn.fr=SV_FR[sn.q[0]];if(sn.t<=0){sn.m='cast';sn.qi=0;sn.act={t:0}}}
 else if(sn.m==='cast'){
  const k=sn.q[sn.qi],a=sn.act;a.t+=dt;const done=SV[k](b,a,dt,r);sn.fr=a.fr!==undefined?a.fr:SV_FR[k];
  if(done){sn.qi++;if(sn.qi<sn.q.length)sn.act={t:-.3};else{sn.m='mv';sn.mv=null}}
 }else{
  const end=()=>{sn.m='wait';sn.t=Math.max(.8,1.8-.07*r)*(b.enr?.75:1)};
  if(sn.mv===null){sn.mv=1;sn.t=.8;b.lz=null;sn.dest=P.x<450?pick([600,720,800]):pick([100,180,300])}
  sn.fr=2;b.x+=(sn.dest-b.x)*Math.min(1,4*dt);b.y+=((300-Math.sin((sn.t/.8)*3.14)*60)-b.y)*Math.min(1,6*dt);if(sn.t<=0)end();
 }
 b.fr=b.hit>0?10:sn.fr;
}
function drawSv0(b){
 drawSinZ();const sn=b.sn;if(!sn)return;
 if(G.svA>0){ctx.save();ctx.globalAlpha=.1+.12*Math.max(0,Math.sin(G.t*18));ctx.fillStyle='#ef4444';ctx.fillRect(0,0,W,H);
  if(Math.floor(G.t*6)%2){ctx.globalAlpha=.85;ctx.fillStyle='#fecaca';ctx.font='bold 20px Segoe UI,Arial';ctx.textAlign='center';ctx.shadowColor='#ef4444';ctx.shadowBlur=12;ctx.fillText('🚨 BÁO ĐỘNG RÒ RỈ BUỒNG GIAM 🚨',W/2,44)}ctx.restore()}
 const lz=b.lz;
 if(lz){ctx.save();const k=lz.lock?1:clamp(lz.k,0,1);ctx.strokeStyle='#ef4444';ctx.shadowColor='#ef4444';ctx.shadowBlur=10;ctx.globalAlpha=lz.lock?.95:.35+.4*k;ctx.lineWidth=lz.lock?3:1.5;
  const dx=lz.tx-lz.x,dy=lz.ty-lz.y,L=Math.hypot(dx,dy)||1;ctx.beginPath();ctx.moveTo(lz.x,lz.y);ctx.lineTo(lz.x+dx/L*1200,lz.y+dy/L*1200);ctx.stroke();
  ctx.fillStyle='#fca5a5';ctx.beginPath();ctx.arc(lz.tx,lz.ty,5+4*k,0,7);ctx.fill();ctx.restore()}
 const at=b.d.atlas;ctx.save();ctx.translate(b.x,b.y);
 if(sn.m==='tel'){const k=sn.q[0],c=SV_C[k];ctx.globalAlpha=.2+.1*Math.sin(G.t*14);ctx.fillStyle=c;ctx.beginPath();ctx.arc(0,0,96,0,7);ctx.fill();
  ctx.globalAlpha=1;ctx.font='bold 15px Segoe UI,Arial';ctx.textAlign='center';ctx.shadowColor=c;ctx.shadowBlur=10;ctx.fillStyle=c;ctx.fillText(SV_N[k],0,-104)}
 ctx.globalAlpha=1;ctx.shadowColor=b.enr?'#f87171':'#4ade80';ctx.shadowBlur=b.enr?24:12;
 if(at&&at.complete&&at.naturalWidth){const f=b.fr||0,D=170;ctx.drawImage(at,(f%6)*192,Math.floor(f/6)*192,192,192,-D/2,-D/2,D,D)}
 else{ctx.fillStyle='#4ade80';ctx.beginPath();ctx.arc(0,0,44,0,7);ctx.fill()}
 ctx.restore();
}
function polyHW(y){const p=G.poly;if(!p||!G.boss||G.boss.dead)return 1e9;
 if(p.k==='tri')return 200+(y/FLOOR)*240;
 if(p.k==='hex')return Math.max(240,340-Math.abs(y-235)*.45);
 return Math.max(230,Math.sqrt(Math.max(0,90000-(y-250)*(y-250))))}
/* Đổi pha: 100–66% pha 1 · 66–33% pha 2 (Lưới Quét) · dưới 33% pha 3 (Sụp Đổ) */
/* ============ THỰC THỂ DỊ DẠNG (boss map Hố Đen Kỳ Dị, ai: "void") ============
   Khối năng lượng tối dịch chuyển qua Cổng Không Gian, rồi tung 1 chiêu hoặc combo 2–3 chiêu, nghỉ 1.6–2.8 giây giữa các lần.
   Chiêu: Mìn không gian (vmine: hiện rõ 0.7s → gần tàng hình → lóe 0.3s cuối → tan) · Hố đen mini (vwell: hút/đẩy, không sát thương)
          Đạn xuyên cổng (vwarp: chui qua mép màn hình, sát sàn) · Vết cắt không gian (vslit: báo trước rồi bùng nổ)
          Đảo trọng lực (rơi lên trần 3.2–3.6s, có 1s báo trước) · Trọng lực yếu (dùng lại hiệu ứng của map).
   Khung hình sprite (img/bosses/void.png, ô 192px, 6 cột × 2 hàng):
   0 dập dềnh · 1 xúc tu · 2 xoáy (chìm) · 3 cổng đen · 4 trồi ra · 5 cổng + xúc tu bắn · 6 triệu hồi mìn · 7 vết cắt · 8 hố đen · 9 cuồng nộ · 10 trúng đòn · 11 tan rã */
const vFlip=()=>G.vflip>0&&!!G.boss&&!G.boss.dead&&!(G.imm&&G.imm.gravity);
function vdDmg(){return dmgOf(G.round)}
function vdTel(){return Math.max(1.05,1.7-.05*G.round)*((G.boss&&G.boss.enr)?.85:1)}
function vdInit(b){b.vd={mode:'rest',t:1.6,tp:0,moved:true,gx:b.x,gy:110,ox:b.x,oy:b.y,ct:0,end:0,pose:0,evs:[],last:'',mines:null,warpSide:1,big:false}}
function vdGrav(dt){
 if(G.vtel>0){G.vtel-=dt;if(G.vtel<=0){G.vtel=0;G.vflip=G.vflipLen||3.2;G.shake=Math.max(G.shake,.4);beep(90,.4,.1,'sine')}}
 else if(G.vflip>0)G.vflip-=dt;
}
function voidAI(b,dt){
 if(G.timeStop>0)return;
 if(!b.vd)vdInit(b);const vd=b.vd;
 if(b.t<1.3){b.y=Math.min(110,b.y+160*dt);b.vis=1;b.fr=0;return}
 vdGrav(dt);b.ph=(b.ph||0)+dt;
 if(vd.tp>0){
  vd.tp-=dt;b.vis=vd.tp>.3?(vd.tp-.3)/.25:(.3-vd.tp)/.3;
  if(vd.tp<=.3&&!vd.moved){vd.moved=true;b.x=vd.gx;b.y=vd.gy}
  b.fr=vd.tp>.3?2:vd.tp>.15?3:4;
  if(vd.tp<=0){vd.tp=0;b.vis=1;vdCast(b)}
  return}
 b.vis=1;const hv=b.hit>0;
 if(vd.mode==='rest'){
  vd.t-=dt;b.fr=hv?10:b.enr?[9,1][Math.floor(b.ph*6)%2]:[0,1][Math.floor(b.ph*2.2)%2];
  if(vd.t<=0)vdTeleport(b)
 }else{
  vd.ct+=dt;while(vd.evs.length&&vd.evs[0].t<=vd.ct)vdFire(b,vd.evs.shift());
  b.fr=hv?10:vd.pose;
  if(!vd.evs.length&&vd.ct>=vd.end){vd.mode='rest';vd.t=clamp(3-.1*G.round,1.6,2.8)*(b.enr?.75:1)}
 }
}
function vdTeleport(b){
 const vd=b.vd;vd.tp=.55;vd.moved=false;vd.ox=b.x;vd.oy=b.y;
 let x,g=0;do{x=rnd(150,750)}while(Math.abs(x-b.x)<200&&g++<20);
 vd.gx=x;vd.gy=rnd(95,175);beep(260,.15,.05,'sine');
}
function vdPick(b){
 const r=G.round,vd=b.vd;let c,g=0;
 do{
  if(r<=2)c=pick([['mine'],['warp'],['slit'],['slit']]);
  else if(r<=4)c=pick([['mine','well'],['warp','mine'],['slit','warp'],['well','slit'],['slit','slit'],['slit','mine']]);
  else if(r<=7)c=pick([['mine','well'],['warp','mine'],['flip','slit'],['slit','warp'],['low','mine'],['slit','slit'],['slit','well']]);
  else c=pick([['mine','well','warp'],['flip','slit','mine'],['warp','mine','slit'],['low','well','mine'],['flip','slit'],['slit','slit','warp'],['slit','slit','mine']]);
 }while(c.join()===vd.last&&g++<4);
 vd.last=c.join();return c;
}
function vdCast(b){
 const vd=b.vd,r=G.round,E=vd.evs=[],combo=vdPick(b),en=!!b.enr,tel=vdTel();
 vd.mode='cast';vd.ct=0;vd.mines=null;vd.big=combo.length>=3;vd.warpSide=Math.random()<.5?1:-1;
 let t=.25,end=0;
 for(const k of combo){
  if(k==='mine'){E.push({t,k});end=Math.max(end,t+.8);t+=.95}
  else if(k==='well'){E.push({t,k});end=Math.max(end,t+.6);t+=.6}
  else if(k==='warp'){const n=3+(r>=6?1:0)+(r>=10?1:0)+(en?1:0),gp=Math.max(.38,.6-.02*r);
   for(let i=0;i<n;i++)E.push({t:t+i*gp,k});end=Math.max(end,t+(n-1)*gp+.4);t+=(n-1)*gp+.3}
  else if(k==='slit'){const top=combo.includes('flip');E.push({t,k,top});end=Math.max(end,t+tel+(top?.5:0)+.5);t+=.7}
  else if(k==='flip'){E.push({t,k});t+=1.3;end=Math.max(end,t)}
  else if(k==='low'){E.push({t,k});end=Math.max(end,t+.4);t+=.5}
 }
 vd.end=end+.2;
}
function vdFire(b,e){
 const vd=b.vd,r=G.round;
 if(e.k==='mine'){vd.pose=6;vdMines(b)}
 else if(e.k==='well'){vd.pose=8;vdWell(b)}
 else if(e.k==='warp'){vd.pose=5;vdWarp(b)}
 else if(e.k==='slit'){vd.pose=7;vdSlit(b,e.top)}
 else if(e.k==='flip'){vd.pose=9;G.vtel=1.0;G.vflipLen=r>=8?3.6:3.2;banner('🔃 ĐẢO TRỌNG LỰC! Sắp rơi lên trần');G.bannerT=2;G.flash=.2;beep(110,.5,.09,'sine')}
 else if(e.k==='low'){vd.pose=8;G.gf={cd:rnd(6,9),k:'low',t:4.5,dir:1};banner('🪐 TRỌNG LỰC YẾU: nhảy bổng hơn');beep(180,.3,.06,'sine')}
 burstParts(b.x,b.y,'#a855f7',10);
}
function vdMines(b){
 const r=G.round,vd=b.vd,fl=vFlip(),n=(r<=2?3:r<=4?4:5)-(vd.big?1:0)+(b.enr?1:0),pos=[];let g=0;
 while(pos.length<n&&g++<80){
  let x=rnd(70,830);const y=fl?rnd(70,190):rnd(FLOOR-190,FLOOR-70);
  if(!pos.length)x=clamp(P.x+pick([-1,1])*rnd(110,220),70,830);   /* mìn đầu tiên đặt gần đường nhảy của người chơi */
  if(Math.abs(x-P.x)<95&&Math.abs(y-(P.y-ph()/2))<110)continue;
  if(pos.some(q=>Math.hypot(q.x-x,q.y-y)<105))continue;
  pos.push({x,y})}
 for(const q of pos)G.bullets.push({type:'vmine',x:q.x,y:q.y,vx:0,vy:0,r:15,age:0,life:4,vis:1,dmg:vdDmg()});
 vd.mines=pos;
}
function vdWell(b){
 const vd=b.vd,ms=vd.mines;let x,y,sg=1;
 if(ms&&ms.length){const m=ms.reduce((a,c)=>Math.abs(c.x-P.x)<Math.abs(a.x-P.x)?c:a);   /* đặt sau lưng bãi mìn để kéo người chơi trôi xuyên qua */
  x=clamp(m.x+(Math.sign(m.x-P.x)||1)*105,WL+40,WR-40);y=m.y}
 else{x=clamp(P.x+pick([-1,1])*rnd(130,200),WL+40,WR-40);y=clamp(P.y-ph()/2+rnd(-60,40),150,FLOOR-60);sg=pick([1,-1])}
 G.bullets.push({type:'vwell',x,y,vx:0,vy:0,r:0,age:0,life:4.2,st:Math.min(200,(150+G.round*6)*(b.enr?1.15:1)),sg});
 burstParts(x,y,'#7c3aed',12);
}
function vdWarp(b){
 const r=G.round,L=b.vd.warpSide>0,sp=(250+r*6)*(b.enr?1.15:1)*(G.bulletSlowR||1);
 G.bullets.push({type:'vwarp',x:L?WL:WR,y:vFlip()?18:FLOOR-16,vx:L?sp:-sp,vy:0,r:9,age:0,wr:0,mw:r>=8?2:1,dmg:vdDmg()});
}
function vdSlit(b,top){
 const r=G.round,vd=b.vd,tel=vdTel()+(top?.5:0),dm=vdDmg(),hw=r>=9?20:17;
 const mk=(x1,y1,x2,y2,dl=0)=>G.bullets.push({type:'vslit',x:(x1+x2)/2,y:(y1+y2)/2,vx:0,vy:0,r:0,age:0,tel:tel+dl,x1,y1,x2,y2,hw,dmg:dm});
 if(top){mk(0,40,W,40);if(r>=6)mk(0,40,W,40,.0);return}   /* sát trần: người chơi đang bị đảo trọng lực phải nhảy xuống */
 /* Nhiều kiểu chém, mỗi lần chọn 1 kiểu khác lần trước: chéo · ngang sàn · dọc · chữ X · quạt · chuỗi quét liên tiếp · hai vết song song */
 const pats=['diag','diag','horiz','vert'];if(r>=3)pats.push('cross','vert');if(r>=5)pats.push('fan','sweep','sweep');if(r>=7)pats.push('dbl');
 let k;do{k=pick(pats)}while(k===vd.ls&&pats.length>1);vd.ls=k;
 const cx=clamp(P.x+pick([-1,1])*rnd(35,80),170,730),sl=pick([-1,1]);
 if(k==='horiz')mk(0,FLOOR-12,W,FLOOR-12);   /* ngang sát sàn: phải nhảy đúng lúc */
 else if(k==='diag')mk(cx-sl*170,6,cx+sl*170,FLOOR);
 else if(k==='vert'){const x=clamp(P.x+rnd(-30,30),40,860);mk(x,0,x,FLOOR);if(r>=4)mk(clamp(x+(x<450?1:-1)*300,40,860),0,clamp(x+(x<450?1:-1)*300,40,860),FLOOR,.35)}
 else if(k==='cross'){mk(cx-170,6,cx+170,FLOOR);mk(cx+170,6,cx-170,FLOOR)}
 else if(k==='fan'){const px=clamp(P.x,200,700);for(const d of[-300,0,300])mk(px,6,px+d,FLOOR,d?.25:0)}
 else if(k==='sweep'){const d0=sl;for(let i=0;i<3;i++){const c=clamp(P.x+(i-1)*140,150,750),q=i%2?-d0:d0;mk(c-q*170,6,c+q*170,FLOOR,i*.42)}}
 else{const o2=(cx<450?1:-1)*280;mk(cx-sl*170,6,cx+sl*170,FLOOR);mk(cx+o2-sl*170,6,cx+o2+sl*170,FLOOR,.2)}   /* hai vết song song, luôn chừa hành lang giữa */
}
function drawVoid(b){
 const vd=b.vd,at=b.d.atlas,C=b.d.fw||192,f=b.fr||0;
 ctx.save();
 if(vd&&vd.tp>0){   /* Cổng Không Gian: đóng ở chỗ cũ, mở ở chỗ mới */
  const o=vd.tp>.3?(vd.tp-.3)/.25:0,n=vd.tp<.45?clamp((.45-vd.tp)/.3,0,1):0;
  ctx.lineWidth=3;ctx.strokeStyle='#c084fc';ctx.shadowColor='#a855f7';ctx.shadowBlur=16;
  if(o>0){ctx.globalAlpha=o;ctx.beginPath();ctx.ellipse(vd.ox,vd.oy,22+40*o,52*o+10,0,0,7);ctx.stroke()}
  if(n>0){ctx.globalAlpha=n;ctx.beginPath();ctx.ellipse(vd.gx,vd.gy,22+36*n,52*n+10,0,0,7);ctx.stroke()}
  ctx.shadowBlur=0}
 ctx.translate(b.x,b.y+Math.sin(b.t*2.6)*5);
 const sq=1+Math.sin(b.t*5)*.035;ctx.scale(sq,2-sq);   /* dập dềnh vô định hình */
 ctx.globalAlpha=clamp(b.vis===undefined?1:b.vis,0,1);
 if(at&&at.complete&&at.naturalWidth){ctx.imageSmoothingEnabled=false;
  if(b.enr&&Math.floor(G.t*14)%5===0)ctx.translate(rnd(-4,4),0);   /* nhiễu khi nổi giận */
  ctx.drawImage(at,(f%6)*C,Math.floor(f/6)*C,C,C,-C/2,-C/2,C,C)}
 else{ctx.shadowColor=b.d.c;ctx.shadowBlur=b.enr?40:22;ctx.fillStyle=b.hit>0?'#fff':b.d.c;ctx.globalAlpha*=.85;ctx.beginPath();ctx.arc(0,0,48,0,7);ctx.fill();ctx.shadowBlur=0;ctx.globalAlpha=1;ctx.font='56px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(b.d.e,0,4)}
 ctx.restore();
}
function drawVdCorpse(){
 const c=G.vdCorpse,d=BOSSES.void,at=d&&d.atlas;if(!c||!at||!at.complete||!at.naturalWidth)return;
 const C=d.fw||192,k=clamp(c.t/1.4,0,1);
 ctx.save();ctx.globalAlpha=k;ctx.imageSmoothingEnabled=false;ctx.drawImage(at,5*C,C,C,C,c.x-C/2,c.y-C/2+30*(1-k),C,C);ctx.restore();
}
function bossPhase(b,np){
 b.pz=np;G.bullets=G.bullets.filter(x=>x.type==='heart');G.cuts=[];if(np===2)G.poly=null;
 b.stun=1.5;b.tp=0;b.cdw=2.4;P.inv=Math.max(P.inv,1.8);G.flash=.6;G.shake=.5;
 banner(np===2?'⚡ PHA 2 — LƯỚI QUÉT XUẤT HIỆN!':'🔥 PHA 3 — KHỐI HÌNH SỤP ĐỔ!');G.bannerT=3;
 burstParts(b.x,b.y,np===2?'#67e8f9':'#f87171',40);beep(np===2?300:180,.5,.1,'sawtooth');
}
function cubeAI(b,dt){
 const r=G.round,sp=b.enr?.7:1;b.ph=(b.ph||0)+dt;b.ct=Math.max(0,(b.ct||0)-dt);
 if(b.t<1.2){b.y=Math.min(110,b.y+160*dt);b.vis=1;b.fr=0;return}
 if(b.stun>0){b.stun-=dt;b.vis=1;b.fr=17;return}
 if(b.tp>0){b.tp-=dt;b.vis=b.tp>.25?(b.tp-.25)*4:(.25-b.tp)*4;
  if(b.tp<=.25&&!b.moved){b.moved=true;b.x=rnd(200,700);b.y=rnd(105,175)}
  b.fr=b.tp>.25?9:10;if(b.tp<=0){b.tp=0;b.vis=1;cubeCast(b)}return}
 b.vis=1;b.cdw=(b.cdw===undefined?1.2:b.cdw)-dt;
 b.fr=b.hit>0?17:b.ct>0?b.pose:((b.enr||(b.pz||1)>=3)?[19,7,20,8,21,23][Math.floor(b.ph*10)%6]:[0,1,2,3,4,5,6,0,1,2,3,4,5,6,7,8][Math.floor(b.ph*8)%16]);
 if(b.cdw<=0){const pz=(b.pz||1)-1;b.cdw=Math.max(2.1,3.6-.18*r)*sp*[1,.78,.62][pz];b.tp=[.5,.4,.33][pz];b.moved=false}
}
function cubeCast(b){
 const r=G.round;let ch;
 /* Phân tầng theo vòng + combo trong thiết kế: 1–2 đơn chiêu · 3 chồng 2 · 4–5 thêm đa giác · 6+ chồng 3 */
 if(r<=2)ch=[pick(['ghost','swell','bounce','grid'])];
 else if(r===3)ch=pick([['grid','swell'],['bounce','ghost'],['swell','ghost'],['grid','bounce']]);
 else if(r<=5)ch=pick([['grid','swell'],['poly','bounce'],['poly','ghost'],['swell','bounce'],['grid','ghost']]);
 else ch=pick([['grid','swell','ghost'],['poly','bounce','ghost'],['grid','bounce','swell'],['poly','grid','ghost'],['poly','swell','bounce']]);
 const pz=b.pz||1;
 if(pz>=2){
  if(!ch.includes('sweep')&&Math.random()<(pz===2?.65:.85))ch.push('sweep');
  if(ch.includes('sweep'))ch=ch.filter(k=>k!=='grid'&&k!=='swell');   /* đòn quét có cột an toàn riêng: không chồng lưới/phình to để khỏi bịt cột đó */
  if(pz>=3&&!G.poly&&!ch.includes('poly'))ch.push('poly');
  if(ch.length>3)ch.splice(0,ch.length-3);
 }
 /* Giới hạn độ dày: vòng cao không chồng quá nhiều đạn trên màn hình */
 if(r>=9&&ch.length>2)ch.splice(0,ch.length-2);
 if(G.bullets.length>150)ch=ch.slice(0,1);
 const sf=pz>=3?1.12:1;
 b.ct=.7;
 for(const k of ch){
  if(k==='ghost'){b.pose=13;const m=2+Math.min(4,Math.floor(r/2))+(pz>=2?1:0),a=Math.atan2(P.y-ph()/2-b.y,P.x-b.x),v=(200+r*8)*sf;
   for(let i=0;i<m;i++){const q=a+(i-(m-1)/2)*.24;G.bullets.push({type:'bghost',x:b.x,y:b.y,vx:Math.cos(q)*v,vy:Math.sin(q)*v,r:10,s:i%3,age:0})}}
  else if(k==='swell'){b.pose=18;
   /* Chuỗi cầu nhỏ báo trước (chưa gây sát thương) rồi phình to bịt lối; luôn chừa 1 khe người chơi kịp tới */
   const cols=r<=2?3:4,mx=30+Math.min(6,r),tel=Math.max(.55,.95-.04*r),gs=70+Math.min(40,r*5);
   const slots=(r<=2?[-1,1]:[-2,-1,1,2]).filter(i=>{const x=P.x+i*68;return x>=WL+24&&x<=WR-24}),gap=slots.length?pick(slots):0;
   for(let i=-cols;i<=cols;i++){const x=P.x+i*68;if(i===gap||x<WL||x>WR)continue;G.bullets.push({type:'bswell',x,y:FLOOR-36,vx:0,vy:0,r:6,age:0,mx,tel,gs,noHit:true})}}
  else if(k==='bounce'){b.pose=15;const m=Math.min(3,1+Math.floor(r/4))+(pz>=3?1:0),v=(270+r*8)*sf;
   for(let i=0;i<m;i++){const a=rnd(.5,2.6);G.bullets.push({type:'bbounce',x:b.x,y:b.y,vx:Math.cos(a)*v*(Math.random()<.5?1:-1),vy:Math.sin(a)*v,r:11,age:0})}}
  else if(k==='grid'){b.pose=13;
   const c=(r<=2?3:r===3?5:Math.min(10,6+Math.floor(r/3)))+(pz>=3?2:0),px=clamp(Math.floor(P.x/100),0,8),py=clamp(Math.floor((FLOOR-1-(P.y-ph()/2))/100),0,3);
   const cells=[[px,py]];if(py>0)cells.push([px,0]);
   const sd=[-1,1].filter(s2=>px+s2>=0&&px+s2<=8),safe=px+(sd.length?pick(sd):0);/* luôn chừa 1 cột bên cạnh để thoát */
   let guard=0;while(cells.length<c&&guard++<80){const a=[Math.floor(rnd(0,9)),Math.floor(rnd(0,4))];if(a[0]===safe||cells.some(q=>q[0]===a[0]&&q[1]===a[1]))continue;cells.push(a)}
   G.cuts=(G.cuts||[]).concat(cells.map(q=>({x:q[0]*100,y:FLOOR-100*(q[1]+1),t:2,f:0})))}
  else if(k==='poly'){b.pose=16;G.poly={k:pick(['tri','hex','circ']),t:6}}
  else if(k==='sweep'){b.pose=13;
   /* Lưới Quét: cả hàng ô nổ lần lượt từ một đầu; chừa cột an toàn gần người chơi. Pha 3 phủ 2 tầng nên nhảy cũng không thoát */
   G.cuts=G.cuts||[];const pc=clamp(Math.floor(P.x/100),0,8),dir=Math.random()<.5?1:-1,near=[];
   for(let c=Math.max(0,pc-3);c<=Math.min(8,pc+3);c++)near.push(c);
   const safe=new Set([pick(near)]);if(pz===2)safe.add(pick(near));
   const rows=pz>=3?[0,1]:[0];
   for(let c=0;c<9;c++){if(safe.has(c))continue;const k2=dir>0?c:8-c;for(const rw of rows)G.cuts.push({x:c*100,y:FLOOR-100*(rw+1),t:1.5+k2*.15,f:0})}}
 }
}
function drawCube(){
 if(G.poly&&G.boss&&!G.boss.dead){ctx.save();ctx.fillStyle='rgba(0,0,0,.82)';ctx.strokeStyle='#e5e7eb';ctx.lineWidth=2;
  for(let y=0;y<FLOOR;y+=10){const hw=Math.min(430,polyHW(y+5));ctx.fillRect(0,y,450-hw,10);ctx.fillRect(450+hw,y,450-hw,10)}
  for(const sd of[-1,1]){ctx.beginPath();for(let y=0;y<=FLOOR;y+=10){const x=450+sd*Math.min(430,polyHW(y));y?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}ctx.restore()}
 for(const c of G.cuts||[]){ctx.save();const w=c.t>0,a=w?.18+.18*Math.sin(G.t*18):.7*Math.max(0,c.f/.25);
  ctx.fillStyle=w?`rgba(239,68,68,${a})`:`rgba(255,255,255,${a})`;ctx.fillRect(c.x,c.y,100,100);ctx.strokeStyle=w?'#ef4444':'#fff';ctx.strokeRect(c.x+1,c.y+1,98,98);ctx.restore()}
}
function drawDark(){if(!(G.dark>0))return;ctx.save();ctx.globalAlpha=Math.min(.5,G.dark*.45);ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.globalAlpha=.5;
 for(let i=0;i<120;i++){ctx.fillStyle=Math.random()<.5?'#fff':'#6b7280';ctx.fillRect(rnd(0,W),rnd(0,H),rnd(2,14),2)}ctx.restore()}
function drawBoss(){
 for(const s of G.shots||[]){ctx.save();ctx.fillStyle='#fde047';ctx.shadowColor='#fde047';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(s.x,s.y,5,0,7);ctx.fill();ctx.restore()}
 if(G.vdCorpse)drawVdCorpse();
 const b=G.boss;if(!b||b.dead)return;
 if(b.d.ai==='void'){drawVoid(b);return}
 if(b.d.ai==='sins'){drawSin(b);return}
 if(b.d.ai==='yuki'){drawYuki(b);return}
 if(b.d.ai==='sv0'){drawSv0(b);return}
 if(b.d.ai==='thunder'){drawThunder(b);return}if(b.d.ai==='blade'){drawBlade(b);return}if(b.d.ai==='spirit'){drawSpirit(b);return}if(b.d.ai==='casino'){drawCasino(b);return}if(b.d.ai==='zombie'){drawZombie(b);return}if(b.d.ai==='overload'){drawOverload(b);return}
 ctx.save();ctx.translate(b.x,b.y+Math.sin(b.t*3)*6);const im=b.d.img;
 const at=b.d.atlas;if(at&&at.complete&&at.naturalWidth){const f=b.fr||0;ctx.globalAlpha=b.vis===undefined?1:clamp(b.vis,0,1);ctx.drawImage(at,(f%6)*128,Math.floor(f/6)*128,128,128,-80,-80,160,160)}
 else if(im&&im.complete&&im.naturalWidth)ctx.drawImage(im,-70,-70,140,140);
 else{ctx.shadowColor=b.d.c;ctx.shadowBlur=b.enr?40:22;ctx.fillStyle=b.hit>0?'#fff':b.d.c;ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(0,0,48,0,7);ctx.fill();ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.font='56px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(b.d.e,0,4)}
 ctx.restore();
}
function drawBossUI(){
 const b=G.boss;if(!b||b.dead)return;const x=200,w=500,y=document.body.classList.contains('short')?52:14;
 ctx.save();ctx.textBaseline='alphabetic';ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(x-2,y-2,w+4,22);
 ctx.fillStyle=b.enr?'#f97316':'#ef4444';ctx.fillRect(x,y,w*Math.max(0,b.hp/b.max),18);
 ctx.fillStyle='rgba(255,255,255,.55)';for(let i=1;i<(b.bars||1);i++)ctx.fillRect(x+w*i/(b.bars||1)-1,y,2,18);
 if(b.d.ai==='cube'){ctx.fillStyle='rgba(255,255,255,.85)';ctx.fillRect(x+w*.66-1.5,y-4,3,26);ctx.fillRect(x+w*.33-1.5,y-4,3,26)}
 ctx.fillStyle='#fff';ctx.font='bold 13px Segoe UI,Arial';ctx.textAlign='center';
 ctx.fillText('👑 '+b.d.n+(b.d.ai==='cube'?' · PHA '+(b.pz||1)+'/3':'')+' · '+(b.fight?'Hạ gục':'Sống sót')+(b.enr?' · NỔI GIẬN':''),W/2,y+14);ctx.restore();
}
const WHN={jackpot:'🎰 Jackpot: đạn nhanh +30%',wind:'🌬️ Gió đẩy ngang',chips:'🪙 Mưa chip'};
function mapTick(dt){
  const id=G.map.id;
  P.psT=Math.max(0,(P.psT||0)-dt);P.pjT=Math.max(0,(P.pjT||0)-dt);P.padT=Math.max(0,(P.padT||0)-dt);
  if(id==='casino'){
    let w=G.wh;if(!w)w=G.wh={cd:rnd(5,8),k:null,t:0,dir:1,sp:0};
    if(w.k){
      w.t-=dt;
      if(w.k==='wind')P.x=clamp(P.x+w.dir*120*dt,WL+pw()/2,WR-pw()/2);
      if(w.k==='chips'){w.sp-=dt;if(w.sp<=0){w.sp=.3;G.bullets.push(makeBullet('coin'))}}
      if(w.t<=0){w.k=null;w.cd=rnd(7,10)}
    }else{w.cd-=dt;if(w.cd<=0&&G.timeLeft>5){w.k=pick(['jackpot','wind','chips']);w.t=4.5;w.dir=pick([-1,1]);w.sp=0;banner(WHN[w.k]+(w.k==='wind'?(w.dir>0?' →':' ←'):''));beep(520,.15,.06,'triangle')}}
  }else if(id==='void'){
    let g=G.gf;if(!g)g=G.gf={cd:rnd(5,8),k:null,t:0,dir:1};
    if(g.k){
      g.t-=dt;
      if(g.k==='pull'&&!G.imm.gravity)P.x=clamp(P.x+g.dir*140*dt,WL+pw()/2,WR-pw()/2);
      if(g.t<=0){g.k=null;g.cd=rnd(6,9)}
    }else if(!(G.boss&&!G.boss.dead&&G.boss.d.ai==='void')){g.cd-=dt;if(g.cd<=0&&G.timeLeft>5){g.k=pick(['low','pull']);g.t=5;g.dir=pick([-1,1]);banner(g.k==='low'?'🪐 TRỌNG LỰC YẾU: nhảy bổng hơn':(g.dir>0?'🌀 XÉ KHÔNG GIAN: bị kéo sang phải':'🌀 XÉ KHÔNG GIAN: bị kéo sang trái'));beep(180,.3,.06,'sine')}}
  }else if(id==='woods'){
    let m=G.mp;if(!m)m=G.mp={cd:rnd(5,8),t:0,dir:1,sp:0,pol:[]};
    if(m.t>0){m.t-=dt;m.sp-=dt;
      if(m.sp<=0){m.sp=.09;const y=rnd(50,FLOOR-30);m.pol.push({x:m.dir>0?-10:W+10,y,by:y,vx:m.dir*rnd(300,380),c:Math.random()<.5?0:1,ph:rnd(0,6.28),life:0})}
      if(m.t<=0)m.cd=rnd(12,15);
    }else if(G.timeLeft>3){m.cd-=dt;if(m.cd<=0){m.t=3;m.dir=pick([-1,1]);m.sp=0;banner('🌸 GIÓ PHẤN HOA'+(m.dir>0?' →':' ←')+': vàng = chạy nhanh · tím = nhảy thấp');beep(660,.2,.05,'sine')}}
    for(const q of m.pol){q.life+=dt;q.x+=q.vx*dt;q.y=q.by+Math.sin(q.life*4+q.ph)*18;
      if(circRect({x:q.x,y:q.y,r:8})){q.dead=true;if(q.c){P.pjT=2;popText('💜 nhảy thấp',P.x,P.y-ph()-14,'#c084fc')}else{P.psT=2.5;popText('🌼 +20% tốc độ',P.x,P.y-ph()-14,'#fde047')}}}
    m.pol=m.pol.filter(q=>!q.dead&&q.x>-30&&q.x<W+30);
  }else if(id==='cityz'){
    let s=G.mp;if(!s)s=G.mp={cd:rnd(6,9),el:99,spawned:true};
    const B=G.blocks||(G.blocks=[]);
    if(s.el<1.9){s.el+=dt;G.shake=Math.max(G.shake,.3);
      if(!s.spawned&&s.el>=.8){s.spawned=true;const n=G.round<=3?2:3,xs=[];
        for(let i=0;i<n;i++)for(let a=0;a<25;a++){const x=rnd(100,800);if(Math.abs(x-P.x)<50||xs.some(v=>Math.abs(v-x)<150)||B.some(k=>k.st==='land'&&Math.abs(k.x-x)<130))continue;xs.push(x);
          B.push({x,w:rnd(70,100),h:rnd(40,54),y:-80,vy:0,st:'tel',tel:.8,life:0,car:Math.random()<.4});break}}
    }else if(G.timeLeft>5&&!B.some(k=>k.st!=='land')){s.cd-=dt;if(s.cd<=0){s.el=0;s.spawned=false;s.cd=rnd(12,16);banner('🚨 CÒI BÁO ĐỘNG: mảnh vỡ sắp rơi!');beep(440,.5,.07,'sawtooth')}}
    for(const k of B){
      if(k.st==='tel'){k.tel-=dt;if(k.tel<=0)k.st='fall'}
      else if(k.st==='fall'){k.vy+=2600*dt;k.y+=k.vy*dt;
        if(!k.hit&&P.x+pw()/2>k.x-k.w/2&&P.x-pw()/2<k.x+k.w/2&&P.y>k.y-k.h&&P.y-ph()<k.y){k.hit=1;hurt(dmgOf(G.round))}
        if(k.y>=FLOOR){k.y=FLOOR;k.st='land';k.life=rnd(5,6);G.shake=Math.max(G.shake,.4);burstParts(k.x,FLOOR,'#a8a29e',14);beep(70,.25,.08,'sawtooth')}}
      else{k.life-=dt}
    }
    G.blocks=B.filter(k=>!(k.st==='land'&&k.life<=0));
  }else if(id==='bamboo'){
    let g=G.mp;if(!g)g=G.mp={cd:rnd(5,7),t:0,dir:1,lv:[]};
    if(g.t>0){g.t-=dt;P.x=clamp(P.x+g.dir*110*dt,WL+pw()/2,WR-pw()/2);
      if(Math.random()<dt*22)g.lv.push({x:g.dir>0?-10:W+10,y:rnd(20,FLOOR),vx:g.dir*rnd(420,600),vy:rnd(-30,60),r:rnd(0,6)});
      if(g.t<=0)g.cd=9;
    }else if(G.timeLeft>3){g.cd-=dt;if(g.cd<=0){g.t=3;g.dir=pick([-1,1]);banner('🍂 GIÓ THU XUYÊN TRÚC '+(g.dir>0?'→':'←')+': gió đẩy ngang');beep(300,.4,.04,'sine')}}
    for(const l of g.lv){l.x+=l.vx*dt;l.y+=l.vy*dt;l.r+=dt*6}
    g.lv=g.lv.filter(l=>l.x>-30&&l.x<W+30);
  }
}
function evTick(dt){
  if(G.round<2||(G.boss&&!G.boss.dead&&!G.ev))return;
  const e=G.ev;
  if(!e){G.evCD-=dt;if(G.evCD<=0)startEvent();return}
  if(e.k==='quake'){
    e.t-=dt;G.shake=Math.max(G.shake,1.25);
    e.dust-=dt;if(e.dust<=0){e.dust=.12;burstParts(rnd(WL,WR),FLOOR,'#a8a29e',3)}
    e.tr-=dt;if(e.tr<=0){e.tr=rnd(.7,1.3);P.x=clamp(P.x+rnd(-55,55),WL+pw()/2,WR-pw()/2);beep(70,.2,.06,'sawtooth')}
    if(e.t<=0)endEvent();
  }else if(e.k==='fog'){
    e.t-=dt;e.x+=e.vx*dt;
    if(e.x<WL+e.w/2)e.vx=Math.abs(e.vx);if(e.x>WR-e.w/2)e.vx=-Math.abs(e.vx);
    if(e.t<=0)endEvent();
  }else if(e.k==='disaster'){
    e.t-=dt;if(e.t<=0)endEvent();
  }else if(e.k==='doom'){
    if(e.ph===0){
      e.t-=dt;
      if(e.t<=0){e.ph=1;e.t2=0;G.shake=.9;beep(110,.5,.09,'sawtooth');
        for(let i=0;i<90;i++){const x=rnd(WL,WR);if(Math.abs(x-e.zx)<e.zw/2+6)continue;G.bullets.push({type:'doom',x,y:-rnd(0,380),vx:0,vy:1300,r:0,noHit:true})}}
    }else{
      e.t2+=dt;
      if(e.ph===1&&e.t2>=.45){e.ph=2;
        if(Math.abs(P.x-e.zx)<e.zw/2)popText('✅ An toàn!',P.x,P.y-ph()-14,'#34d399');
        else if(P.shield>0){P.shield--;P.inv=1;popText('🛡️ Giáp cứu mạng',P.x,P.y-ph()-14,'#38bdf8')}
        else if(P.inv>0)popText('💨 Né kịp!',P.x,P.y-ph()-14,'#fde047');
        else{G.flash=.5;G.shake=.6;popText('💀 Diệt thế!',P.x,P.y-ph()-14,'#ef4444');damageHP(G.hp/10)}}
      if(e.t2>1.4&&G.ev===e)endEvent();
    }
  }
}
/* Kiểm tra đột xuất: dừng game, 10 giây trả lời */
function startPop(){
  G.mode='quiz';Q.kind='pop';Q.n=0;Q.pt=10;
  $('qt').textContent='📝 Kiểm tra đột xuất!';
  $('qs').textContent='⏱ Còn 10.0s — Đúng: +50% máu · Sai/hết giờ: -50% máu';
  nextQ();
  beep(660,.15,.06,'triangle');
}
function popTick(dt){
  Q.pt-=dt;
  $('qs').textContent='⏱ Còn '+Math.max(0,Q.pt).toFixed(1)+'s — Đúng: +50% máu · Sai/hết giờ: -50% máu';
  if(Q.pt<=0){
    [...$('qo').children].forEach((b,j)=>{b.disabled=true;if(j===Q.ca)b.classList.add('ok')});
    $('qexp').textContent='⏰ '+(Q.cur.e||'');
    popResolve(false,true);
  }
}
function popResolve(ok,timeout){
  Q.kind='popdone';
  const act=$('qa');act.innerHTML='';
  const before=G.hp,delta=Math.ceil(before/2);
  G.hp=ok?before+delta:Math.max(1,before-delta);
  $('qs').textContent=ok?`✅ Chính xác! +50% máu (+${G.hp-before} HP)`:`${timeout?'⏰ Hết giờ!':'❌ Sai rồi!'} -50% máu (${G.hp-before} HP)`;
  popText((ok?'+':'')+(G.hp-before)+' HP',P.x,P.y-80,ok?'#10b981':'#ef4444');
  addBtn(act,'⚔️ Tiếp tục',resumeGame,'g');
}
function drawEvBack(){
  const e=G.ev;if(!e)return;
  if(e.k==='fog'){
    const a=clamp(Math.min(e.t/.8,(e.dur-e.t)/.8),0,1),x0=e.x-e.w/2;
    ctx.save();ctx.globalAlpha=a;
    const g=ctx.createLinearGradient(x0,0,x0+e.w,0);
    g.addColorStop(0,'rgba(203,213,225,0)');g.addColorStop(.22,'rgba(203,213,225,.94)');g.addColorStop(.78,'rgba(203,213,225,.94)');g.addColorStop(1,'rgba(203,213,225,0)');
    ctx.fillStyle=g;ctx.fillRect(x0,0,e.w,FLOOR);
    ctx.fillStyle='rgba(241,245,249,.35)';
    for(let i=0;i<5;i++){const wx=x0+(((G.t*30*(i%2?1:-1)+i*70)%e.w)+e.w)%e.w;ctx.beginPath();ctx.ellipse(wx,60+i*80,50,22,0,0,7);ctx.fill()}
    ctx.restore();
  }else if(e.k==='doom'){
    const x0=e.zx-e.zw/2;ctx.save();
    const g=ctx.createLinearGradient(0,FLOOR-170,0,FLOOR);g.addColorStop(0,'rgba(16,185,129,0)');g.addColorStop(1,'rgba(16,185,129,.45)');
    ctx.fillStyle=g;ctx.fillRect(x0,FLOOR-170,e.zw,170);
    ctx.strokeStyle='#34d399';ctx.lineWidth=3;ctx.setLineDash([10,8]);ctx.strokeRect(x0,FLOOR-170,e.zw,170);ctx.setLineDash([]);
    ctx.fillStyle='#6ee7b7';ctx.font='bold 14px Segoe UI,Arial';ctx.textAlign='center';ctx.fillText('KHU AN TOÀN',e.zx,FLOOR-176);
    ctx.restore();
  }
}
function drawEvFront(){
  const e=G.ev;if(!e)return;
  ctx.save();ctx.textAlign='center';
  if(e.k==='disaster'){
    ctx.fillStyle=`rgba(${e.d.col},.09)`;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#fff';ctx.globalAlpha=.9;ctx.font='bold 17px Segoe UI,Arial';
    ctx.fillText(`🌪 THIÊN TAI: ${e.d.name.toUpperCase()} — ${Math.ceil(e.t)}s`,W/2,48);
  }else if(e.k==='doom'){
    if(e.ph===0){
      const pul=.5+.5*Math.sin(G.t*10);
      ctx.fillStyle=`rgba(239,68,68,${.06+.08*pul})`;ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#fecaca';ctx.shadowColor='#ef4444';ctx.shadowBlur=20;ctx.font='bold 84px Segoe UI,Arial';ctx.fillText(Math.ceil(e.t),W/2,260);
      ctx.shadowBlur=0;ctx.font='bold 18px Segoe UI,Arial';ctx.fillText('☄️ DIỆT THẾ — VÀO KHU AN TOÀN!',W/2,300);
    }else{ctx.fillStyle=`rgba(255,255,255,${Math.max(0,.85-e.t2*.9)})`;ctx.fillRect(0,0,W,H)}
  }
  ctx.restore();
}

/* ============ GAME OVER & STORAGE ============ */
function loadBest(){try{G.best=+localStorage.getItem('ad_best')||0}catch(e){}}
function saveBest(){try{localStorage.setItem('ad_best',String(G.best))}catch(e){}}
function gameOver(reason){
 G.jack=null;
 G.mode='over';
 const reached=G.round;
 if(reached>G.best){G.best=reached;saveBest()}
 $('ov-r').textContent=reason;$('ov-round').textContent=reached;
 $('ov-cor').textContent=G.corrects;$('ov-best').textContent=G.best;
 hideAll();$('m-over').classList.remove('hide');
}

/* ============ INPUT ============ */
addEventListener('keydown',e=>{
 const k=e.key.toLowerCase();
 if(['arrowleft','a'].includes(k))K.l=true;
 if(['arrowright','d'].includes(k))K.r=true;
 if(['arrowdown','s'].includes(k))K.d=true;
 if(['arrowup','w',' '].includes(k)){if(!e.repeat)jumpPressed=true;K.u=true;e.preventDefault()}
 if(k==='shift'&&!e.repeat)dashPressed=true;
 if(k==='j')playerShoot();
 const skk=Object.keys(SKDEF).find(id=>SKDEF[id].k===k);if(skk&&!e.repeat)useSkill(skk);
});
addEventListener('keyup',e=>{
 const k=e.key.toLowerCase();
 if(['arrowleft','a'].includes(k))K.l=false;
 if(['arrowright','d'].includes(k))K.r=false;
 if(['arrowdown','s'].includes(k))K.d=false;
 if(['arrowup','w',' '].includes(k))K.u=false;
});
function holdBtn(id,fn){
 const el=$(id);
 el.addEventListener('pointerdown',e=>{e.preventDefault();fn(true)});
 ['pointerup','pointerleave','pointercancel'].forEach(ev=>el.addEventListener(ev,()=>fn(false)));
}
holdBtn('tsh',v=>{if(v)playerShoot()});
holdBtn('tc',v=>K.d=v);
(function(){
  const j=$('joy'),k=$('knob');let pid=null;
  function set(e){
    const r=j.getBoundingClientRect(),R=r.width/2,max=R-k.offsetWidth/2+2;
    let dx=e.clientX-(r.left+R),dy=e.clientY-(r.top+R);
    const d=Math.hypot(dx,dy);if(d>max){dx*=max/d;dy*=max/d}
    k.style.transform='translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px))';
    const dz=max*.22;K.l=dx<-dz;K.r=dx>dz;K.ju=dy<-max*.35;K.jd=dy>max*.35;
  }
  function end(){pid=null;k.style.transform='translate(-50%,-50%)';K.l=K.r=K.ju=K.jd=false;j.classList.remove('act')}
  j.addEventListener('pointerdown',e=>{e.preventDefault();pid=e.pointerId;try{j.setPointerCapture(pid)}catch(_){}j.classList.add('act');set(e)});
  j.addEventListener('pointermove',e=>{if(e.pointerId===pid){e.preventDefault();set(e)}});
  ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>j.addEventListener(ev,e=>{if(e.pointerId===pid)end()}));
})();
$('tj').addEventListener('pointerdown',e=>{e.preventDefault();jumpPressed=true;K.u=true});['pointerup','pointerleave','pointercancel'].forEach(ev=>$('tj').addEventListener(ev,()=>{K.u=false}));
$('td').addEventListener('pointerdown',e=>{e.preventDefault();dashPressed=true});
if('ontouchstart' in window)$('touch').classList.add('on');

$('bStart').onclick=()=>{startRun()};
$('bRetry').onclick=()=>{startRun()};
$('bMenu').onclick=()=>{G.mode='menu';hideAll();$('best').textContent=G.best;$('m-menu').classList.remove('hide')};

/* ============ MENU SCENE ============ */
function needRotate(){return window.matchMedia('(pointer:coarse)').matches&&window.innerHeight>window.innerWidth}
function drawMenuScene(){
 const idx=Math.max(0,Math.floor(G.t/6))%MAPS.length;
 drawMap(MAPS[idx],G.t);
 if(curSpr().complete&&curSpr().naturalWidth){const s=170;ctx.drawImage(curSpr(),0,0,96,96,W/2-s/2,FLOOR-s*.92,s,s)}
}
function drawHint(){
 const b=G.nextB;const L=110,n=Math.hypot(b.vx,b.vy)||1;
 ctx.save();ctx.globalAlpha=.55;ctx.strokeStyle='#a5f3fc';ctx.lineWidth=2;ctx.setLineDash([6,6]);
 const ex=b.x+b.vx/n*L,ey=b.y+b.vy/n*L;
 ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(ex,ey);ctx.stroke();
 ctx.setLineDash([]);ctx.fillStyle='#a5f3fc';const a=Math.atan2(b.vy,b.vx);
 ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex-Math.cos(a-.4)*10,ey-Math.sin(a-.4)*10);ctx.lineTo(ex-Math.cos(a+.4)*10,ey-Math.sin(a+.4)*10);ctx.fill();
 ctx.restore();
}
function draw(){
 if(G.mode==='menu'){drawMenuScene();return}
 ctx.save();
 if(G.shake>0)ctx.translate(rnd(-6,6)*G.shake,rnd(-6,6)*G.shake);
 drawMap(G.map,G.t);
 drawCube();drawBoss();G.bullets.forEach(drawBullet);drawEvBack();
if(G.pull&&G.pull.w>0){ctx.save();ctx.globalAlpha=.5+.4*Math.sin(G.t*20);ctx.strokeStyle='#a855f7';ctx.lineWidth=4;ctx.beginPath();ctx.arc(G.pull.x,FLOOR-150,40+(0.5-G.pull.w)*120,0,7);ctx.stroke();ctx.restore()}
(G.firePatch||[]).forEach(p=>{ctx.save();ctx.globalAlpha=.5+.3*Math.sin(G.t*14);ctx.fillStyle='#f97316';ctx.shadowColor='#f97316';ctx.shadowBlur=12;ctx.fillRect(p.x-p.w/2,FLOOR-8,p.w,10);ctx.restore()});
(G.snowP||[]).forEach(p=>{ctx.save();ctx.globalAlpha=.35+.25*Math.sin(G.t*8);ctx.fillStyle='#bae6fd';ctx.fillRect(p.x-p.w/2,FLOOR-6,p.w,10);ctx.restore()});
 if(P.sixth&&G.nextB)drawHint();
 drawPlayer();
 for(const p of G.parts){ctx.globalAlpha=clamp(p.life*2,0,1);ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,4,4)}
 ctx.globalAlpha=1;
 for(const t of G.texts){ctx.globalAlpha=clamp(t.life*1.5,0,1);ctx.fillStyle=t.c;ctx.font='bold 16px Segoe UI,Arial';ctx.textAlign='center';ctx.fillText(t.s,t.x,t.y)}
 ctx.globalAlpha=1;ctx.textAlign='left';
 drawEvFront();drawBossUI();drawDark();if(G.bannerT>0&&G.banner){ctx.globalAlpha=Math.min(1,G.bannerT);ctx.fillStyle='#fff';ctx.font='bold 26px Segoe UI,Arial';ctx.textAlign='center';ctx.fillText(G.banner,W/2,120);ctx.globalAlpha=1;ctx.textAlign='left'}
 ctx.restore();
 if(G.flash>0){ctx.fillStyle=`rgba(239,68,68,${G.flash*.6})`;ctx.fillRect(0,0,W,H)}
 if(G.glitch>0){ /* nhiễu sóng: xé hình ngang + vạch đen che tầm nhìn */
  const k=Math.min(1,G.glitch),sx=cv.width/W,sy=cv.height/H;
  for(let i=0;i<4+k*6;i++){const y=rnd(0,H-40),h=rnd(8,30),dx=rnd(-28,28)*k;ctx.drawImage(cv,0,y*sy,cv.width,h*sy,dx,y,W,h)}
  ctx.fillStyle=`rgba(0,255,255,${.07*k})`;ctx.fillRect(0,0,W,H);
  ctx.fillStyle=`rgba(0,0,0,${.55*k})`;for(let i=0;i<5;i++)ctx.fillRect(rnd(0,W-120),rnd(0,H),rnd(40,160),rnd(3,14))}
}

/* ============ SETTINGS & MENU ============ */
function refreshSound(){$('bSound').textContent='🔊 Âm thanh: '+(SOUND?'Bật':'Tắt')}
$('bSound').onclick=()=>{SOUND=!SOUND;try{localStorage.setItem('ad_sound',SOUND?'1':'0')}catch(e){}refreshSound()};
/* ============ CÁCH CHƠI: ĐẠN & HÌNH ============ */
const HELP_BULLETS=CONTENT.bullets.help.map(h=>[h.id,h.name,h.desc].concat(h.icon?[h.icon]:[]));
let helpBuilt=false;
function renderHelpBullets(){
 if(helpBuilt)return;helpBuilt=true;
 const box=$('help');
 const title=document.createElement('div');title.style.cssText='margin-top:12px;font-weight:800;color:#e2e8f0';
 title.textContent='💥 Các loại đạn ('+HELP_BULLETS.length+')';box.appendChild(title);
 const sk=document.createElement('div');sk.style.cssText='font-size:12px;color:#94a3b8;margin-bottom:8px';sk.innerHTML='<b style="color:#e2e8f0">⚔️ Kỹ năng chủ động:</b> Shift Lướt · Q Bộc phá · E Khiên Thánh Quang · R Ngưng đọng · F Siêu tốc · G Tàng hình. Mỗi lần chơi tối đa 3 kỹ năng.';box.appendChild(sk);
 HELP_BULLETS.forEach(([t,n,d,icon])=>{
   const row=document.createElement('div');row.style.cssText='display:flex;gap:10px;align-items:center;margin:6px 0';
   let vis;
   if(icon){
     vis=document.createElement('div');
     vis.style.cssText='width:56px;height:56px;border-radius:8px;background:#0b1220;flex:none;display:flex;align-items:center;justify-content:center;font-size:28px';
     vis.textContent=icon;
   }else{
     vis=document.createElement('canvas');vis.width=56;vis.height=56;
     vis.style.cssText='width:56px;height:56px;border-radius:8px;background:#0b1220;flex:none';
     const g2=vis.getContext('2d');const old=ctx;ctx=g2;
     try{
       g2.clearRect(0,0,56,56);
       const b=BT[t].mk();b.type=t;b.x=28;b.y=28;b.vx=1;b.vy=0;b.age=0;b.noHit=true;
       if(BT[t].trail)b.tr=[];
       drawBullet(b);
     }catch(e){}
     finally{ctx=old}
   }
   const txt=document.createElement('div');
   txt.innerHTML='<b style="color:#e2e8f0">'+n+'</b><br><span style="font-size:12px;color:#94a3b8">'+d+'</span>';
   row.append(vis,txt);box.appendChild(row);
 });
}
$('bHelp').onclick=()=>{$('help').classList.toggle('hide');renderHelpBullets()};

document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('gesturestart',e=>e.preventDefault());

/* ============ CỬA HÀNG & XU ============ */
let SHOP={coins:0,owned:['pig'],equip:'pig'};
function loadShop(){try{const r=JSON.parse(localStorage.getItem('ad_shop')||'null');if(r)SHOP=Object.assign(SHOP,r)}catch(e){}updateCoinUI()}
function saveShop(){try{localStorage.setItem('ad_shop',JSON.stringify(SHOP))}catch(e){}}
function addCoin(n=1){SHOP.coins+=n;saveShop();updateCoinUI()}
function updateCoinUI(){$('cn').textContent=SHOP.coins;$('cnm').textContent=SHOP.coins}
function curSpr(){const s=SKINS.find(x=>x.id===SHOP.equip)||SKINS[0];return s.img()}
function renderShop(){
 $('shc').textContent=SHOP.coins;
 const box=$('shl');box.innerHTML='';
 SKINS.forEach(s=>{
   const owned=SHOP.owned.includes(s.id),eq=SHOP.equip===s.id;
   const c=document.createElement('div');c.className='card';
   c.innerHTML=`<div class="skprev" style="background-image:url(${s.img().src})"></div><div class="t">${s.name}${s.fx?' ✨':''}</div><div class="d">${owned?(eq?'✅ Đang dùng':'Đã sở hữu'):'🪙 '+s.price}</div>`;
   const b=document.createElement('button');
   b.className='btn '+(owned?(eq?'o':'g'):'');
   b.textContent=owned?(eq?'Đang dùng':'Trang bị'):'Mua';
   b.disabled=owned&&eq;
   b.onclick=()=>{
     if(!owned){
       if(SHOP.coins<s.price){$('shm').textContent='Không đủ 🪙 để mua '+s.name;return}
       SHOP.coins-=s.price;SHOP.owned.push(s.id);
     }
     SHOP.equip=s.id;saveShop();updateCoinUI();
     $('shm').textContent=(owned?'Đã trang bị ':'Đã mua & trang bị ')+s.name;
     renderShop();
   };
   c.appendChild(b);box.appendChild(c);
 });
}
$('bShop').onclick=()=>{$('shm').textContent='';renderShop();$('m-shop').classList.remove('hide')};
$('bShopClose').onclick=()=>$('m-shop').classList.add('hide');

/* ============ LOOP ============ */
let last=performance.now();
function loop(now){
 requestAnimationFrame(loop);
 const dt=Math.max(0,Math.min(.033,(now-last)/1000));last=now;
 const rot=needRotate();
 $('rot').classList.toggle('hide',!rot);
 if(!rot){
   if(G.mode==='playing')step(dt);
   else if(G.mode==='menu')G.t+=dt;
   else if(G.mode==='quiz'&&Q.kind==='pop')popTick(dt);
   else if(G.mode==='quiz'&&Q.qt>0&&Q.kind!=='pop'){Q.qt-=dt;$('qexp').textContent='⏱ '+Math.max(0,Q.qt).toFixed(1)+'s';if(Q.qt<=0)answer(-1)}
   if(G.mode==='playing'||G.mode==='quiz'||G.mode==='over'||G.mode==='buff')drawHUD();
   draw();
 }
 jumpPressed=false;dashPressed=false;
}
loadShop();
loadBest();
try{SOUND=localStorage.getItem('ad_sound')!=='0'}catch(e){}
refreshSound();
$('best').textContent=G.best;
$('qn').textContent=QUESTIONS.length;
requestAnimationFrame(loop);

/* ============ FIT SCREEN ============ */
let STRETCH=true;try{STRETCH=localStorage.getItem('ad_stretch')!=='0'}catch(e){}
function refreshFit(){$('bFit').textContent='📐 Khung hình: '+(STRETCH?'Phóng to':'Chuẩn tỉ lệ')}
$('bFit').onclick=()=>{STRETCH=!STRETCH;try{localStorage.setItem('ad_stretch',STRETCH?'1':'0')}catch(e){}refreshFit();fitScreen()};
refreshFit();
function fitScreen(){
 const cv=$('c'),hud=$('hud'),tc=$('touch');
 const short=window.innerHeight<560;
 document.body.classList.toggle('short',short);
 const pad=short?6:12,gap=short?3:6;
 const touchOn=tc.classList.contains('on')&&!short;
 let availH=window.innerHeight-pad-(short?0:hud.offsetHeight+gap)-(touchOn?tc.offsetHeight+gap:0);
 let availW=window.innerWidth-pad;
 const sc=Math.max(0.2,Math.min(availW/900,availH/520,1.6));
 let w=Math.floor(900*sc),h=Math.floor(520*sc);
 if(short&&STRETCH){w=Math.floor(Math.min(availW,availH*2.1));h=Math.floor(Math.min(availH,w/1.45))}
 cv.style.width=w+'px';cv.style.height=h+'px';cv.style.maxWidth='none';cv.style.aspectRatio='auto';
 hud.style.width=w+'px';tc.style.width=short?'':w+'px';
}
window.addEventListener('resize',fitScreen);
window.addEventListener('orientationchange',()=>setTimeout(fitScreen,150));
if(window.ResizeObserver){let rq=0;new ResizeObserver(()=>{if(rq)return;rq=requestAnimationFrame(()=>{rq=0;fitScreen()})}).observe($('hud'))}
fitScreen();setTimeout(fitScreen,300);

/* ============ QUESTION MANAGER ============ */
const SAMPLE_Q=QUESTIONS.map(q=>({...q,o:q.o.slice()}));
const qKey=t=>String(t).toLowerCase().replace(/\s+/g,' ').trim();
const normH=h=>String(h).toLowerCase().replace(/đ/g,'d').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
function parseAns(v,opts){
 if(typeof v==='number')return v>=0&&v<opts.length?v:-1;
 v=String(v==null?'':v).trim();
 if(/^[A-Za-z]$/.test(v)){const i=v.toUpperCase().charCodeAt(0)-65;return i<opts.length?i:-1}
 if(/^\d$/.test(v)){const i=+v;return i<opts.length?i:-1}
 const i=opts.findIndex(o=>qKey(o)===qKey(v));return i;
}
function parseDiff(v){
 const t=normH(v);
 if(t==='1'||t==='2'||t==='3')return +t;
 if(['de','easy','d'].includes(t))return 1;
 if(['trungbinh','tb','medium','vua'].includes(t))return 2;
 if(['kho','hard','k'].includes(t))return 3;
 return 2;
}
function mkQ(q,opts,ans,diff,exp){
 q=String(q||'').trim();opts=opts.map(o=>String(o==null?'':o).trim()).filter(o=>o!=='');
 if(!q||opts.length<2)return null;
 const a=parseAns(ans,opts);if(a<0)return null;
 return {q,o:opts,a,d:parseDiff(diff),e:String(exp||'').trim()};
}
function fromJsonItem(r){
 if(!r||typeof r!=='object')return null;
 const g=(...ks)=>{for(const k of Object.keys(r))if(ks.includes(normH(k))&&r[k]!=null&&r[k]!=='')return r[k]};
 let opts=g('options','o','choices','luachon');
 if(typeof opts==='string')opts=opts.split('|');
 if(!Array.isArray(opts))opts=['a','b','c','d'].map(k=>g(k,'option'+k,'dapan'+k)).filter(x=>x!=null);
 return mkQ(g('question','q','cauhoi'),opts,g('answer','a','correct','dapan','dapandung'),g('difficulty','d','level','dokho'),g('explanation','e','giaithich'));
}
function parseCSVText(text){
 text=text.replace(/^\uFEFF/,'');
 const first=text.split(/\r?\n/)[0]||'';
 const delim=[',',';','\t'].map(d=>[d,first.split(d).length]).sort((x,y)=>y[1]-x[1])[0][0];
 const rows=[];let row=[],f='',inQ=false;
 for(let i=0;i<text.length;i++){
   const c=text[i];
   if(inQ){if(c==='"'){if(text[i+1]==='"'){f+='"';i++}else inQ=false}else f+=c}
   else if(c==='"')inQ=true;
   else if(c===delim){row.push(f);f=''}
   else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(f);f='';if(row.some(x=>x.trim()!==''))rows.push(row);row=[]}
   else f+=c;
 }
 row.push(f);if(row.some(x=>x.trim()!==''))rows.push(row);
 return rows;
}
function fromCSV(text){
 const rows=parseCSVText(text);if(!rows.length)return [];
 const H=['question','cauhoi','q'];
 let hasHead=rows[0].some(c=>H.includes(normH(c)));
 let idx={q:0,a:1,b:2,c:3,d:4,ans:5,diff:6,exp:7};
 if(hasHead){
   const names=rows.shift().map(normH);
   const find=(...ks)=>names.findIndex(n=>ks.includes(n));
   idx={q:find('question','cauhoi','q'),a:find('a','optiona','dapana','option1','opt1','choice1','luachon1'),
        b:find('b','optionb','dapanb','option2','opt2','choice2','luachon2'),
        c:find('c','optionc','dapanc','option3','opt3','choice3','luachon3'),
        d:find('d','optiond','dapand','option4','opt4','choice4','luachon4'),
        ans:find('answer','dapan','correct','dapandung','dapanchinhxac'),
        diff:find('difficulty','level','dokho','mucdo','diff'),
        exp:find('explanation','giaithich','note')};
 }
 const at=(r,i)=>i>=0&&i<r.length?r[i]:'';
 return rows.map(r=>mkQ(at(r,idx.q),[at(r,idx.a),at(r,idx.b),at(r,idx.c),at(r,idx.d)],at(r,idx.ans),at(r,idx.diff),at(r,idx.exp)));
}
function parseFileText(name,text){
 const t=text.replace(/^\uFEFF/,'').trim();
 if(/\.json$/i.test(name)||t[0]==='['||t[0]==='{'){
   let j=JSON.parse(t);if(!Array.isArray(j))j=j.questions||j.data||[j];
   return j.map(fromJsonItem);
 }
 return fromCSV(text);
}
function addQuestions(list){
 const seen=new Set(QUESTIONS.map(q=>qKey(q.q)));let add=0,dup=0,bad=0;
 for(const q of list){
   if(!q){bad++;continue}
   const k=qKey(q.q);if(seen.has(k)){dup++;continue}
   seen.add(k);QUESTIONS.push(q);add++;
 }
 return {add,dup,bad};
}
function saveBank(){try{localStorage.setItem('ad_questions',JSON.stringify(QUESTIONS))}catch(e){}}
const toSpec=q=>({question:q.q,options:q.o,answer:q.a,difficulty:q.d,explanation:q.e||''});
function bankSig(arr){return arr.length+':'+qKey(arr.length?arr[0].question||arr[0].q||'':'')+':'+qKey(arr.length?(arr[arr.length-1].question||arr[arr.length-1].q||''):'')}
function loadBank(){
 let emb=[];
 try{const raw=$('embedded-questions').textContent.trim();if(raw)emb=(JSON.parse(raw)||[]).map(fromJsonItem).filter(Boolean)}catch(e){}
 let saved=null;
 try{const raw=localStorage.getItem('ad_questions');if(raw)saved=JSON.parse(raw).filter(q=>q&&q.q&&Array.isArray(q.o)&&q.o.length>=2)}catch(e){}
 if(saved&&saved.length){QUESTIONS.length=0;saved.forEach(q=>QUESTIONS.push(q))}
 else if(emb.length){QUESTIONS.length=0;emb.forEach(q=>QUESTIONS.push(q))}
 if(emb.length){
   const sig=bankSig(emb);let old=null;try{old=localStorage.getItem('ad_emb_sig')}catch(e){}
   if(saved&&saved.length&&old!==sig){addQuestions(emb)}
   try{localStorage.setItem('ad_emb_sig',sig)}catch(e){}
   saveBank();
 }
}
function dl(name,text,mime){
 const b=new Blob([text],{type:mime}),u=URL.createObjectURL(b),a=document.createElement('a');
 a.href=u;a.download=name;document.body.appendChild(a);a.click();
 setTimeout(()=>{URL.revokeObjectURL(u);a.remove()},1500);
}
function renderQM(){
 const c=[0,0,0,0];QUESTIONS.forEach(q=>c[q.d]++);
 $('qstat').innerHTML=`<span>Tổng: ${QUESTIONS.length}</span><span style="color:#34d399">Dễ: ${c[1]}</span><span style="color:#fbbf24">Vừa: ${c[2]}</span><span style="color:#f87171">Khó: ${c[3]}</span>`;
 const L=$('qlist');L.innerHTML='';
 QUESTIONS.forEach((q,i)=>{
   const r=document.createElement('div');r.className='qrow';
   const b=document.createElement('span');b.className='bd d'+q.d;b.textContent=['','Dễ','Vừa','Khó'][q.d];
   const t=document.createElement('span');t.className='tx';t.textContent=q.q;
   const x=document.createElement('button');x.className='x';x.textContent='✕';x.title='Xóa câu này';
   x.onclick=()=>{
     if(QUESTIONS.length<=1){$('qmsg').textContent='Cần giữ lại ít nhất 1 câu hỏi.';return}
     QUESTIONS.splice(i,1);saveBank();renderQM();
   };
   r.append(b,t,x);L.appendChild(r);
 });
 $('qn').textContent=QUESTIONS.length;
}
$('bQM').onclick=()=>{$('qmsg').textContent='';renderQM();$('m-qm').classList.remove('hide')};
$('bQClose').onclick=()=>$('m-qm').classList.add('hide');
$('qfile').onchange=async e=>{
 const files=[...e.target.files];let msg=[];
 for(const f of files){
   try{
     const r=addQuestions(parseFileText(f.name,await f.text()));
     msg.push(`📄 ${f.name}: +${r.add} câu mới, ${r.dup} trùng, ${r.bad} lỗi`);
   }catch(err){msg.push(`📄 ${f.name}: không đọc được (${err.message})`)}
 }
 saveBank();renderQM();$('qmsg').textContent=msg.join('\n');e.target.value='';
};
$('bQReset').onclick=()=>{
 if(!confirm('Xóa toàn bộ câu hỏi đã nạp và quay về bộ câu mẫu?'))return;
 QUESTIONS.length=0;SAMPLE_Q.forEach(q=>QUESTIONS.push({...q,o:q.o.slice()}));
 saveBank();renderQM();$('qmsg').textContent='Đã đặt lại về bộ câu mẫu.';
};
$('bTpl').onclick=()=>{
 const csv='\uFEFFquestion,A,B,C,D,answer,difficulty,explanation\r\n"Thủ đô của Việt Nam là gì?","Hà Nội","Huế","Đà Nẵng","Cần Thơ",A,1,"Hà Nội là thủ đô."\r\n"2 + 2 bằng mấy?","3","4","5","6",B,1,"2 + 2 = 4."\r\n';
 dl('mau_cau_hoi.csv',csv,'text/csv;charset=utf-8');
};
$('bExport').onclick=()=>{
 if(!window.CONTENT_BUILT){dl('questions.json',JSON.stringify(QUESTIONS.map(toSpec),null,1),'application/json');$('qmsg').textContent='Đã tải questions.json. Chép file này vào thư mục content/ của repo để cập nhật câu hỏi.';return}
 const json=JSON.stringify(QUESTIONS.map(toSpec)).replace(/</g,'\\u003c');
 const out=ORIG_HTML.replace(/(<script id="embedded-questions"[^>]*>)[\s\S]*?(<\/script>)/,(m,a,b)=>a+json+b);
 dl('Arena_Dodge_Quiz_Survival_cauhoi.html',out,'text/html;charset=utf-8');
 $('qmsg').textContent=`Đã xuất file game kèm ${QUESTIONS.length} câu hỏi. Gửi file .html này cho người khác là chơi được ngay.`;
};
loadBank();$('qn').textContent=QUESTIONS.length;
/* ============ XUẤT / NHẬP DỮ LIỆU NGƯỜI CHƠI ============ */
const SAVE_VERSION=1;
function exportSave(){
 return {app:'arena-dodge',v:SAVE_VERSION,at:new Date().toISOString(),
  shop:{coins:SHOP.coins,owned:SHOP.owned,equip:SHOP.equip},best:G.best||0,
  settings:{sound:SOUND,stretch:STRETCH,bossAlways:BOSS_ALWAYS},
  questions:QUESTIONS.map(toSpec)};
}
function migrateSave(d){ /* khi đổi cấu trúc, thêm các bước nâng cấp v1→v2… ở đây */ return d }
function importSave(d){
 if(!d||d.app!=='arena-dodge')throw new Error('Không phải file dữ liệu của game này');
 if(typeof d.v!=='number'||d.v>SAVE_VERSION)throw new Error('File dữ liệu từ phiên bản game mới hơn (v'+d.v+'), hãy cập nhật game');
 d=migrateSave(d);
 if(d.shop){
  SHOP.coins=Math.max(0,+d.shop.coins||0);
  const ids=SKINS.map(s=>s.id);
  SHOP.owned=Array.from(new Set(['pig'].concat((d.shop.owned||[]).filter(x=>ids.includes(x)))));
  SHOP.equip=SHOP.owned.includes(d.shop.equip)?d.shop.equip:'pig';
  saveShop();updateCoinUI();
 }
 if(typeof d.best==='number'){G.best=Math.max(G.best||0,d.best);saveBest()}
 if(d.settings){
  try{
   if(typeof d.settings.sound==='boolean'){SOUND=d.settings.sound;refreshSound()}
   if(typeof d.settings.stretch==='boolean'){STRETCH=d.settings.stretch;localStorage.setItem('ad_stretch',STRETCH?'1':'0');refreshFit();fitScreen()}
   if(typeof d.settings.bossAlways==='boolean'){BOSS_ALWAYS=d.settings.bossAlways;localStorage.setItem('ad_boss_always',BOSS_ALWAYS?'1':'0');refreshBossBtn()}
  }catch(e){}
 }
 if(Array.isArray(d.questions)&&d.questions.length){
  const list=d.questions.map(fromJsonItem).filter(Boolean);
  if(list.length){QUESTIONS.length=0;list.forEach(q=>QUESTIONS.push(q));saveBank();$('qn').textContent=QUESTIONS.length}
 }
}
$('bSaveOut').onclick=()=>{
 dl('arena-dodge-save-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(exportSave(),null,1),'application/json');
 $('savem').textContent='Đã xuất dữ liệu (xu, skin, kỷ lục, cài đặt, ngân hàng câu hỏi).';
};
$('saveIn').onchange=async e=>{
 const f=e.target.files[0];if(!f)return;
 try{importSave(JSON.parse(await f.text()));renderShop();$('savem').textContent='Đã nhập dữ liệu từ '+f.name+'.'}
 catch(err){$('savem').textContent='Không nhập được: '+err.message}
 e.target.value='';
};

function showErr(t){var b=document.getElementById('errbox');if(!b)return;b.style.display='block';b.textContent=t;b.onclick=function(){b.style.display='none'};clearTimeout(window.__et);window.__et=setTimeout(function(){b.style.display='none'},6000)}
window.addEventListener('error',function(ev){if(/ResizeObserver/i.test(ev.message||''))return;showErr('Lỗi: '+ev.message+' (dòng '+ev.lineno+')')});
window.addEventListener('unhandledrejection',function(ev){if(/ResizeObserver/i.test(String(ev.reason)))return;showErr('Lỗi: '+ev.reason)});
