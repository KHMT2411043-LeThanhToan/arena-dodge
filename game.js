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
const P={x:450,y:FLOOR,vx:0,vy:0,face:1,cr:false,gnd:true,jumps:1,maxJ:1,dash:0,dashCD:0,hasDash:false,inv:0,frozen:0,slow:0,poison:[],pt:0,scale:1,shrinks:0,speedM:1,jumpM:1,shield:0,dot:false,walk:0};
const G={mode:'menu',round:1,t:0,hp:3,map:MAPS[0],bulletM:1,healPerQ:1,imm:{},corrects:0,storm:0,stormCD:0,timeLeft:20,spawnT:.6,bullets:[],parts:[],texts:[],flash:0,shake:0,banner:null,bannerT:0,best:0};
const Q={kind:'',n:0,cur:null};
const K={l:false,r:false,d:false,u:false,ju:false,jd:false};
let jumpPressed=false,dashPressed=false;
const pw=()=>28*P.scale, ph=()=>(P.cr?28:56)*P.scale;

function drawMapX(m,t){
 const im=MAPIMG[m.id];if(!im)return;
 if(im.complete&&im.naturalWidth){
  const sc=FLOOR/im.naturalHeight,vw=W/sc,sx=(im.naturalWidth-vw)*(.5+.5*Math.sin(t*.06));
  ctx.drawImage(im,sx,0,vw,im.naturalHeight,0,0,W,FLOOR);
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(0,0,W,FLOOR);
 }
 if(m.id==='ice'){ctx.fillStyle='rgba(255,255,255,.8)';for(const s of STARS){const x=(s.x+t*(40+s.s*30)+Math.sin(t+s.y)*14)%W,y=(s.y+t*(50+s.s*40))%FLOOR;ctx.fillRect(x,y,s.s+.5,s.s+.5)}}
 if(m.id==='casino'){const w=G.wh,sp=w&&w.k?t*9:t*.8,cx=W/2,cy=38,R=24,col=['#dc2626','#fbbf24','#16a34a','#2563eb','#a855f7','#f97316'];
  ctx.save();ctx.translate(cx,cy);ctx.rotate(sp);for(let i=0;i<6;i++){ctx.fillStyle=col[i];ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R,i*Math.PI/3,(i+1)*Math.PI/3);ctx.fill()}ctx.restore();
  ctx.strokeStyle='#fde047';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,R+2,0,7);ctx.stroke();ctx.fillStyle='#fde047';ctx.beginPath();ctx.moveTo(cx-6,cy-R-8);ctx.lineTo(cx+6,cy-R-8);ctx.lineTo(cx,cy-R+4);ctx.fill()}
 if(m.id==='void'&&G.gf&&G.gf.k){ctx.fillStyle=G.gf.k==='low'?'rgba(125,211,252,.10)':'rgba(168,85,247,.14)';ctx.fillRect(0,0,W,FLOOR);
  if(G.gf.k==='pull'){ctx.fillStyle='rgba(216,180,254,.5)';ctx.font='bold 40px sans-serif';ctx.textAlign='center';for(let i=0;i<5;i++){const x=((t*160*G.gf.dir+i*180)%W+W)%W;ctx.fillText(G.gf.dir>0?'»':'«',x,260)}}}
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
   up:(b,dt)=>{b.vx*=1;b.x+=Math.sin(b.y/40)*40*dt}},
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
  bghost:{at:99,wt:0,c:'#e5e7eb',alpha:.18,sh:'circle',up:(b,dt,out)=>{b.age+=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
    if((G.round>=6||(G.boss&&(G.boss.pz||1)>=2))&&!b.sp&&b.age>.55){b.sp=1;const a=Math.atan2(b.vy,b.vx),v=Math.hypot(b.vx,b.vy);b.vx=Math.cos(a+.35)*v;b.vy=Math.sin(a+.35)*v;out.push({type:'bghost',x:b.x,y:b.y,vx:Math.cos(a-.35)*v,vy:Math.sin(a-.35)*v,r:10,s:b.s,age:1,sp:1})}}},
  bswell:{at:99,wt:0,c:'#e2e8f0',sh:'circle',up:(b,dt)=>{b.age+=dt;const tel=b.tel||.9;b.noHit=b.age<tel;if(b.age>=tel)b.r=Math.min(b.mx,6+(b.age-tel)*(b.gs||70));if(b.age>tel+1.7)b.dead=true}},
  bbounce:{at:99,wt:0,c:'#22d3ee',sh:'circle',trail:1,up:(b,dt)=>{b.age+=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;const hw=Math.min(430,polyHW(b.y)),l=450-hw,rr=450+hw;
    if(b.x<l+b.r){b.x=l+b.r;b.vx=Math.abs(b.vx)}if(b.x>rr-b.r){b.x=rr-b.r;b.vx=-Math.abs(b.vx)}
    if(b.y<b.r){b.y=b.r;b.vy=Math.abs(b.vy)}if(b.y>FLOOR-b.r){b.y=FLOOR-b.r;b.vy=-Math.abs(b.vy)}if(b.age>6)b.dead=true}},
  card:{at:2,maps:['casino'],wt:5,c:'#f8fafc',sh:'card',mk:()=>({x:WL,y:300,vx:340,vy:0,r:9,rot:0,red:Math.random()<.5}),up:(b,dt)=>{b.x+=b.vx*dt;b.y+=b.vy*dt;b.rot+=dt*13}},
  dice:{at:2,maps:['casino'],wt:4,c:'#f1f5f9',sh:'dice',mk:()=>({x:rnd(150,750),y:-10,vx:rnd(-90,90),vy:120,r:11,rot:0,n:0,v:1+Math.floor(Math.random()*6)}),
    up:(b,dt)=>{b.vy+=1000*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.rot+=b.vx*dt*.02+dt*4;
      if(b.x<WL+b.r||b.x>WR-b.r){b.vx*=-1;b.x=clamp(b.x,WL+b.r,WR-b.r)}
      if(b.y>=FLOOR-b.r){b.y=FLOOR-b.r;b.vy=-rnd(380,520);b.vx=rnd(-300,300);b.v=1+Math.floor(Math.random()*6);b.n++;burstParts(b.x,FLOOR,'#f1f5f9',6);if(b.n>=3)b.dead=true}}},
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
      if(b.age>1.1&&b.age<1.4&&boltHit(b))contDmg(dmgOf(G.round),.8)}},
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
function gainHP(n){G.hp=P.hpCap?Math.min(P.hpCap,G.hp+n):G.hp+n}
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
 if(P.fat&&Math.random()<.5){dmg=Math.ceil(dmg/2);popText('🥩 giảm',P.x,P.y-ph()-30,'#a3e635')}
 if(G.easyRound)dmg=Math.max(1,dmg-1);if(G.dmgAdd)dmg=Math.max(1,dmg+G.dmgAdd);if(P.pact)dmg+=2;G.hp-=dmg;if(G.boss&&G.boss.d.ai==='cube'&&!G.boss.dead)G.dark=1.1;P.inv=P.delay?2:1;G.flash=.25;G.shake=.3;beep(150,.2,.08,'sawtooth');
 popText('-'+dmg,P.x,P.y-ph()-12,'#ef4444');
 if(G.hp<=0)handleZero();
}
function damageHP(n){G.hp-=n;if(G.hp<=0)handleZero()}
function handleZero(){
 G.hp=0;
 if(P.decoy){P.decoy=false;P.decoyUsed=true;G.hp=1;P.inv=1.5;popText('👼 Thế Thân',P.x,P.y-80,'#fde68a');beep(660,.3,.06,'triangle');return}
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

function circRect(b){
 const w=pw(),h=ph();
 const cx=clamp(b.x,P.x-w/2,P.x+w/2),cy=clamp(b.y,P.y-h,P.y);
 return Math.hypot(b.x-cx,b.y-cy)<b.r;
}

function onBulletHit(b){
 if(P.ghostT>0&&b.type!=='heart')return;
 if(b.type==='heart'){gainHP(1);popText('+1 HP',b.x,b.y,'#f472b6');b.dead=true;return}
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
 if(G.challengeRound&&Math.random()<.25)G.bullets.push(makeBullet('bomb'));
 if(G.breed){G.heartT-=dt;if(G.heartT<=0){G.heartT=3.5;const L=Math.random()<.5;G.bullets.push({type:'heart',x:L?WL:WR,y:rnd(200,400),vx:L?120:-120,vy:0,r:11})}}
 G.spawnT-=dt;if(G.spawnT>0)return;
 const storm=G.storm>0;
  if(G.ev&&G.ev.k==='disaster'){G.spawnT=G.ev.d.iv*(1.25-Math.min(.35,G.round*.03))/(storm?1.5:1);spawnType(G.ev.d.type);return}
 G.spawnT=Math.max(.32,1.6-G.round*.06)/(storm?1.8:1)/DIFF.spawn*((G.boss&&!G.boss.dead&&G.boss.d.ai==='cube')?(G.round<=2?1.5:G.round===3?1.3:1.2):1);
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
   if(b.x<-60||b.x>W+60||b.y>H+60||b.y<-120){b.dead=true;if(b.type!=='heart'&&!b.noHit){P.dodge++;if(P.absorb&&P.dodge>=10){P.dodge=0;gainHP(1);popText('🕸️ +1 HP',P.x,P.y-80,'#a78bfa')}}}
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
 const frozen=P.frozen>0;
 if(P.charge&&!P.hasDash){P.chargeT+=dt;if(P.chargeT>=10){P.chargeT=0;P.shield=Math.min(1,P.shield+1);popText('🏃 Lá chắn',P.x,P.y-80,'#38bdf8')}}
 P.blastCD=Math.max(0,P.blastCD-dt);
 for(const k in P.skCD)P.skCD[k]=Math.max(0,P.skCD[k]-dt);
 P.sprintT=Math.max(0,(P.sprintT||0)-dt);P.ghostT=Math.max(0,(P.ghostT||0)-dt);
 if(P.regen&&G.mode==='playing'){P.regenT+=dt;if(P.regenT>=3/DIFF.heal){P.regenT=0;gainHP(1)}}
 if(P.frozen>0&&(jumpPressed||dashPressed)){P.frozen=Math.max(0,P.frozen-.3);burstParts(P.x,P.y-ph()/2,'#bae6fd',5)}
 P.frozen=Math.max(0,P.frozen-dt);P.slow=Math.max(0,P.slow-dt);P.inv=Math.max(0,P.inv-dt);
 P.dashCD=Math.max(0,P.dashCD-dt);P.dash=Math.max(0,P.dash-dt);
 P.cr=K.d&&P.gnd&&!frozen&&!P.wings;
 const ax=(K.r?1:0)-(K.l?1:0);
 const sp=260*P.speedM*(P.speedRound||1)*(P.sprintT>0?1.2:1)*(P.slow>0?.55:1)*(P.cr?.5:1);
 if(!frozen){if(ax)P.face=ax;P.vx=ax*sp}else P.vx=0;
 if(P.dash>0)P.vx=P.face*900;
  if(G.map.id==='ice'&&P.dash<=0&&!frozen){P.iv=P.iv||0;P.iv+=(P.vx-P.iv)*Math.min(1,(P.gnd?(ax?7:1.8):4)*dt);P.vx=P.iv}else P.iv=P.vx;
 if(dashPressed&&P.hasDash&&P.dashCD<=0&&!frozen){P.dash=.3;P.dashCD=3;P.inv=Math.max(P.inv,.3);if(P.charge)P.shield=Math.min(1,P.shield+1)}
 if(jumpPressed&&!frozen&&!P.wings){
   if(P.gnd){P.vy=-640*P.jumpM*(P.slow>0?.8:1);P.gnd=false;P.jumps=P.maxJ-1}
   else if(P.jumps>0){P.vy=-600*P.jumpM;P.jumps--}
 }
 if(P.wings&&!frozen){const ay=((K.u||K.ju)?-1:0)+((K.d||K.jd)?1:0);P.vy=ay*240}else P.vy+=1800*dt*((G.gf&&G.gf.k==='low')?.45:1);
 P.x+=P.vx*dt;
 const w=pw();if(P.inf){if(P.x<-w/2)P.x=W+w/2;else if(P.x>W+w/2)P.x=-w/2}else P.x=clamp(P.x,WL+w/2,WR-w/2);
 if(G.poly&&!P.inf){const hw=Math.min(430,polyHW(P.y-ph()/2));P.x=clamp(P.x,450-hw+w/2,450+hw-w/2)}
 const prev=P.y;P.y+=P.vy*dt;P.gnd=false;
 if(P.y>=FLOOR){P.y=FLOOR;P.vy=0;P.gnd=true}
 if(P.wings&&P.y<ph()+6){P.y=ph()+6;if(P.vy<0)P.vy=0}
 if(P.vy>=0&&!P.wings){
   for(const[px,py,pwid]of G.map.plat){
     if(prev<=py+1&&P.y>=py&&P.x+w/2>px&&P.x-w/2<px+pwid){P.y=py;P.vy=0;P.gnd=true;break}
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
 G.storm=Math.max(0,G.storm-dt);G.flash=Math.max(0,G.flash-dt);G.shake=Math.max(0,G.shake-dt);
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
   case 'nshot':{glow('#fb7185',10);dot(r,'#fb7185');glow('transparent',0);dot(r*.45,'#fff1f2');break}
  case 'heart':glow('#f472b6',14);ctx.fillStyle='#f472b6';ctx.beginPath();ctx.moveTo(0,r*.9);ctx.bezierCurveTo(-r*1.6,-r*.2,-r*.6,-r*1.4,0,-r*.4);ctx.bezierCurveTo(r*.6,-r*1.4,r*1.6,-r*.2,0,r*.9);ctx.fill();glow('transparent',0);break;
     case 'bghost':{ctx.globalAlpha=b.age<.4?.8-(b.age/.4)*.5:.32+.08*Math.sin(b.age*9);ctx.rotate(b.age*3);ctx.strokeStyle=b.sp?'#67e8f9':(G.round>=8&&b.age>.9?'#fda4af':'#e5e7eb');ctx.lineWidth=2;ctx.beginPath();
    if(b.s===0){ctx.moveTo(0,-r);ctx.lineTo(r,r);ctx.lineTo(-r,r);ctx.closePath()}else if(b.s===1)ctx.rect(-r*.8,-r*.8,r*1.6,r*1.6);else{ctx.moveTo(0,-r*1.2);ctx.lineTo(r,0);ctx.lineTo(0,r*1.2);ctx.lineTo(-r,0);ctx.closePath()}ctx.stroke();break}
   case 'bswell':{const tel=b.tel||.9;
    if(b.age<tel){ctx.globalAlpha=.4+.3*Math.sin(b.age*16);ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.setLineDash([5,5]);ctx.beginPath();ctx.arc(0,0,b.mx,0,7);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=.9;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,4,0,7);ctx.fill()}
    else{ctx.fillStyle='rgba(226,232,240,.35)';ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();ctx.stroke()}break}
   case 'bbounce':glow('#22d3ee',16);dot(r,'#a5f3fc');break;
   case 'card':ctx.rotate(b.rot||0);glow('#fff',8);ctx.fillStyle='#f8fafc';ctx.fillRect(-7,-10,14,20);glow('transparent',0);ctx.fillStyle=b.red?'#dc2626':'#111827';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(b.red?'♥':'♠',0,1);break;
   case 'dice':{ctx.rotate(b.rot||0);glow('#fff',6);ctx.fillStyle='#f1f5f9';ctx.fillRect(-r,-r,2*r,2*r);glow('transparent',0);ctx.fillStyle='#b91c1c';
    const PIP={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]};
    for(const[a,d2]of PIP[b.v||1]){ctx.beginPath();ctx.arc(a*r*.55,d2*r*.55,r*.17,0,7);ctx.fill()}break}
   case 'coin':ctx.scale(Math.max(.15,Math.abs(Math.cos(t*8+(b.ph||0)))),1);glow('#fde047',10);ctx.fillStyle='#facc15';ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();glow('transparent',0);ctx.strokeStyle='#a16207';ctx.lineWidth=2;ctx.stroke();break;
   case 'icicle':{if(!b.fall)ctx.translate(Math.sin(t*50)*(Math.abs(b.x-P.x)<90?2:0),0);glow('#7dd3fc',10);ctx.fillStyle='#bae6fd';ctx.strokeStyle='#38bdf8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-r,-r*1.8);ctx.lineTo(r,-r*1.8);ctx.lineTo(0,r*1.5);ctx.closePath();ctx.fill();ctx.stroke();break}
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
 if(P.frozen>0)return 'stun';
 if(P.dash>0)return 'dash';
 if(P.cr)return 'crouch';
 if(!P.gnd)return P.vy<0?'jump':'fall';
 if(Math.abs(P.vx)>10)return 'run';
 return 'idle';
}
function drawPlayer(){
 const st=animState(),list=ANIM[st];
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
  ctx.save();
 if(G.contrast)ctx.filter='brightness(0) invert(1)';
 if(P.inv>0&&Math.floor(P.inv*12)%2===0)ctx.globalAlpha=.35;
 ctx.translate(P.x,P.y);
 ctx.scale(P.face,1);
 if(curSpr().complete&&curSpr().naturalWidth)ctx.drawImage(curSpr(),sx,sy,96,96,-size/2,-size*.92,size,size);
 else{ctx.fillStyle='#f9a8d4';ctx.fillRect(-14*P.scale,-56*P.scale,28*P.scale,56*P.scale)}
 ctx.restore();
 if(P.shield>0){ctx.strokeStyle='#38bdf8';ctx.globalAlpha=.6;ctx.lineWidth=2;ctx.beginPath();ctx.arc(P.x,P.y-ph()/2,Math.max(pw(),ph())*.7,0,7);ctx.stroke();ctx.globalAlpha=1}
 if(P.frozen>0){ctx.fillStyle='rgba(103,232,249,.35)';ctx.fillRect(P.x-pw()/2,P.y-ph(),pw(),ph())}
 if(P.dot){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(P.x,P.y-ph()/2,2.5,0,7);ctx.fill()}
}

function drawHUD(){
 $('hp').textContent=G.hp;$('rd').textContent=G.round;
 $('tm').textContent=G.timeLeft.toFixed(1);$('dm').textContent=dmgOf(G.round);
 $('mp').textContent=G.map.name;
 const s=[];if(G.boss&&!G.boss.dead)s.push('🔫 J: bắn boss');
 if(G.wh&&G.wh.k)s.push(WHN[G.wh.k]);if(G.gf&&G.gf.k)s.push(G.gf.k==='low'?'🪐 Trọng lực yếu':'🌀 Bị kéo');
 if(P.shield)s.push('🛡️x'+P.shield);if(P.poison.length)s.push('☠️x'+P.poison.length);
 if(P.slow>0)s.push('🥶chậm');if(G.ev&&EVN[G.ev.k])s.push(EVN[G.ev.k]);if(G.ev&&G.ev.k==='disaster')s.push('🌪 '+G.ev.d.name);if(P.frozen>0)s.push('❄️băng');if(P.hasDash)s.push('💨Lướt');if(P.wings)s.push('🪽Cánh');if(P.inf)s.push('♾️Vô hạn');if(P.delay)s.push('⏳Trì hoãn');if(P.lamp)s.push('🔦Đèn pin');if(G.quickRound)s.push('⚡Nhanh gọn');
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
 Object.assign(G,{jack:null,contrast:false,easyRound:false,upgradeDraw:false,bet2:null,dmgAdd:0,speedAdj:1,sizeAdj:1,betPrev:undefined,calmRound:false,nextB:null,nextType:null,timeStop:0,challengeRound:false,hp:3,round:1,bulletM:1,bulletSlowR:1,healPerQ:1,imm:{},corrects:0,storm:0,stormCD:0,parts:[],texts:[],bullets:[],banner:null,bannerT:0,mode:'playing',map:MAPS[0],envPool:null,breed:false,heartT:1.5,pend:{immune:{},slow:1,speed:1,env:null,breed:false}});
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
 G.wh=null;G.gf=null;P.iv=0;startBoss();P.inv=pd.invincible||1.2;G.mode='playing';
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
 $('qs').textContent='Không bắt buộc. Trả lời đúng +1 HP, sai không bị phạt.';
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
 const act=$('qa');act.innerHTML='';
 if(Q.kind==='pop'){popResolve(ok,false)}else if(Q.kind==='revive'){
   if(ok){
     Q.n++;G.corrects++;gainHP(G.healPerQ);popText(`+${G.healPerQ} HP`,P.x,P.y-80,'#10b981');
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
const ENV_POOL={lab:['sine','orb','laser','boomerang','chain'],temple:['orb','accel','burst','homing','expanding'],dungeon:['roller','spike','bomb','venom','high'],minimal:['high','rain','splitter','phantom','accel'],space:['frost','freeze','blackhole','gravity','phantom'],casino:['card','dice','coin','bouncer','orb'],ice:['icicle','frost','freeze','rain','roller'],void:['blackhole','portal','phantom','gravity','accel']};
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
 {ic:'📚',t:'Thỏa Ước Học Giả',d:'Đạn nhanh hơn 20%; mỗi câu đúng khi hồi sinh +2 HP.',risk:true,ok:()=>true,apply:()=>{G.bulletM*=1.2;G.healPerQ=2}},
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
 {ic:'🌳',t:'Trưởng Thành',d:'Giới hạn HP tối đa 30 và ngay lập tức đầy 30 HP.',risk:true,ok:()=>!P.hpCap,apply:()=>{P.hpCap=30;G.hp=30}},
 {ic:'👻',t:'Tàng Hình',d:'Kỹ năng chủ động (G): đi xuyên qua đạn trong 3 giây, hồi 18 giây.',ok:()=>!P.skills.includes('ghost'),skill:'ghost'},
 ];
const NEW2=[
 {ic:'🐣',t:'Khổng Lồ Tí Hon',d:'Mỗi vòng bắt đầu cộng thêm 2 HP.',ok:()=>!P.tiny,apply:()=>{P.tiny=true}},
 {ic:'🧠',t:'Thử Thách Thông Minh',d:'Từ giờ toàn câu hỏi khó. Trả lời đúng +3 HP.',risk:true,ok:()=>!P.smart,apply:()=>{P.smart=true}},
 {ic:'🎲',t:'Đánh Cược',d:'Máu hiện tại về 1. Nếu thắng vòng tiếp theo, hoàn trả lại toàn bộ máu đã mất.',risk:true,ok:()=>G.betPrev===undefined,apply:()=>{G.betPrev=G.hp;G.hp=1}},
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
 G.cuts=[];G.poly=null;G.dark=0;
 G.boss=null;G.shots=[];const d=BOSSES[G.map.id];
 if(!d||(!BOSS_ALWAYS&&(G.lastBoss||Math.random()>BOSS_CHANCE))){G.lastBoss=false;return}
 G.lastBoss=true;const r=G.round,fight=r>=4,hp=fight?220+r*50:260+r*20;
 G.boss={d,fight,hp,max:hp,dur:Math.max(5,G.timeLeft),x:W/2,y:-90,t:0,at:2.2,n:0,enr:false,dead:false,hit:0};
 if(fight)G.timeLeft=Math.max(G.timeLeft,55);
}
function bossIntro(){banner('⚠️ BOSS: '+G.boss.d.n+(G.boss.fight?' — HẠ GỤC!':' — SỐNG SÓT!'));G.bannerT=3.5;G.flash=.5;beep(120,.6,.1,'sawtooth')}
function playerShoot(){
 const b=G.boss;if(G.mode!=='playing'||!b||b.dead||(P.shCD||0)>0)return;
 P.shCD=.35;const sx=P.x,sy=P.y-ph()/2,a=Math.atan2(b.y-sy,b.x-sx);
 G.shots.push({x:sx,y:sy,vx:Math.cos(a)*720,vy:Math.sin(a)*720,dmg:10+Math.floor(G.round/3)*2});beep(700,.05,.04,'square');
}
function bossWin(){
 const b=G.boss;if(!b||b.dead)return;b.dead=true;G.poly=null;G.cuts=[];G.dark=0;
 const r=G.round,gold=b.fight?80+r*20:40+r*10;
 addCoin(gold);gainHP(b.fight?5:3);P.shield=Math.max(P.shield,1);
 G.pend.slow=Math.min(G.pend.slow,.8);G.pend.invincible=Math.max(G.pend.invincible||0,3);
 G.bullets=[];G.shots=[];burstParts(b.x,b.y,b.d.c,60);beep(880,.3,.08,'triangle');
 G.boxNote='🏆 Hạ '+b.d.n+': +'+gold+' xu, +HP, giáp, đạn chậm 20%';
}
function bossTick(dt){
 const b=G.boss;P.shCD=Math.max(0,(P.shCD||0)-dt);G.dark=Math.max(0,(G.dark||0)-dt);
 if(G.poly){G.poly.t-=dt;if(G.poly.t<=0)G.poly=null}
 for(const c of G.cuts||[]){c.t-=dt;if(c.t<=0){if(!c.done){c.done=true;c.f=.25;const w=pw(),h=ph();if(b&&!b.dead&&P.x+w/2>c.x&&P.x-w/2<c.x+100&&P.y>c.y&&P.y-h<c.y+100)hurt(dmgOf(G.round));burstParts(c.x+50,c.y+50,'#fff',8)}else c.f-=dt}}
 G.cuts=(G.cuts||[]).filter(c=>!(c.done&&c.f<=0));
 for(const s of G.shots){s.x+=s.vx*dt;s.y+=s.vy*dt;
  if(b&&!b.dead&&Math.hypot(s.x-b.x,s.y-b.y)<50){s.dead=true;b.hp-=s.dmg;b.hit=.12;burstParts(s.x,s.y,b.d.c,6)}
  if(s.x<-20||s.x>W+20||s.y<-20||s.y>H+20)s.dead=true}
 G.shots=G.shots.filter(s=>!s.dead);
 if(!b||b.dead)return false;
 b.t+=dt;b.hit=Math.max(0,b.hit-dt);
 if(b.d.ai==='cube'){const pc=b.hp/b.max,mx=b.fight?3:G.round>=3?2:1,np=Math.min(mx,pc<=.33?3:pc<=.66?2:1);if(np>(b.pz||1))bossPhase(b,np);cubeAI(b,dt)}else{b.y=Math.min(110,b.y+160*dt);b.x=W/2+Math.sin(b.t*(.6+G.round*.02)*(b.enr?1.5:1))*300}
 if(!b.fight)b.hp-=b.max/b.dur*dt*.9;
 if(b.t>2&&b.d.ai!=='cube'){b.at-=dt;if(b.at<=0){
  b.at=(b.d.ai==='thunder'?Math.max(1.8,2.9-G.round*.05):Math.max(.7,2.1-G.round*.06))*(b.enr?.6:1);b.n++;
  const m=b.n%3,sp=(240+G.round*7)*(b.enr?1.2:1);
  if(b.d.ai==='thunder')thunderAI(b);
  else if(m===1)spawnType(pick(b.d.pool));
  else if(m===2){const a=Math.atan2(P.y-ph()/2-b.y,P.x-b.x);for(let i=-1;i<=(G.round>=8?1:0);i++){const q=a+i*.22;G.bullets.push({type:'bshot',x:b.x,y:b.y,vx:Math.cos(q)*sp,vy:Math.sin(q)*sp,r:8})}}
  else{const n=8+Math.floor(G.round/4),o=rnd(0,6.28);for(let i=0;i<n;i++){const q=o+i*6.283/n;G.bullets.push({type:'bshot',x:b.x,y:b.y,vx:Math.cos(q)*sp*.8,vy:Math.sin(q)*sp*.8,r:7})}}
  beep(200,.08,.05,'square')}}
 if(b.hp<=0){b.hp=0;bossWin();openBonus();return true}
 return false;
}
/* Thiên Kiếp Thượng Nhân: chu kỳ lôi kiếp 3 → 6 → 9 đạo sét, lặp lại */
function thunderAI(b){const k=3*((b.n-1)%3+1);
 for(let i=0;i<k;i++)setTimeout(()=>{if(G.boss&&!G.boss.dead&&G.mode==='playing')spawnType('bolt')},i*160);
 beep(260+k*20,.1,.05,'square');}
function polyHW(y){const p=G.poly;if(!p||!G.boss||G.boss.dead)return 1e9;
 if(p.k==='tri')return 200+(y/FLOOR)*240;
 if(p.k==='hex')return Math.max(240,340-Math.abs(y-235)*.45);
 return Math.max(230,Math.sqrt(Math.max(0,90000-(y-250)*(y-250))))}
/* Đổi pha: 100–66% pha 1 · 66–33% pha 2 (Lưới Quét) · dưới 33% pha 3 (Sụp Đổ) */
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
 if(b.cdw<=0){const pz=(b.pz||1)-1;b.cdw=Math.max(1.5,3.6-.18*r)*sp*[1,.78,.62][pz];b.tp=[.5,.4,.33][pz];b.moved=false}
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
 const b=G.boss;if(!b||b.dead)return;
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
 if(b.d.ai==='cube'){ctx.fillStyle='rgba(255,255,255,.85)';ctx.fillRect(x+w*.66-1.5,y-4,3,26);ctx.fillRect(x+w*.33-1.5,y-4,3,26)}
 ctx.fillStyle='#fff';ctx.font='bold 13px Segoe UI,Arial';ctx.textAlign='center';
 ctx.fillText('👑 '+b.d.n+(b.d.ai==='cube'?' · PHA '+(b.pz||1)+'/3':'')+' · '+(b.fight?'Hạ gục':'Sống sót')+(b.enr?' · NỔI GIẬN':''),W/2,y+14);ctx.restore();
}
const WHN={jackpot:'🎰 Jackpot: đạn nhanh +30%',wind:'🌬️ Gió đẩy ngang',chips:'🪙 Mưa chip'};
function mapTick(dt){
  const id=G.map.id;
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
    }else{g.cd-=dt;if(g.cd<=0&&G.timeLeft>5){g.k=pick(['low','pull']);g.t=5;g.dir=pick([-1,1]);banner(g.k==='low'?'🪐 TRỌNG LỰC YẾU: nhảy bổng hơn':(g.dir>0?'🌀 XÉ KHÔNG GIAN: bị kéo sang phải':'🌀 XÉ KHÔNG GIAN: bị kéo sang trái'));beep(180,.3,.06,'sine')}}
  }
}
function evTick(dt){
  if(G.round<2)return;
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
        else{G.flash=.5;G.shake=.6;popText('💀 Diệt thế!',P.x,P.y-ph()-14,'#ef4444');damageHP(G.hp)}}
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
 if(P.sixth&&G.nextB)drawHint();
 drawPlayer();
 for(const p of G.parts){ctx.globalAlpha=clamp(p.life*2,0,1);ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,4,4)}
 ctx.globalAlpha=1;
 for(const t of G.texts){ctx.globalAlpha=clamp(t.life*1.5,0,1);ctx.fillStyle=t.c;ctx.font='bold 16px Segoe UI,Arial';ctx.textAlign='center';ctx.fillText(t.s,t.x,t.y)}
 ctx.globalAlpha=1;ctx.textAlign='left';
 drawEvFront();drawBossUI();drawDark();if(G.bannerT>0&&G.banner){ctx.globalAlpha=Math.min(1,G.bannerT);ctx.fillStyle='#fff';ctx.font='bold 26px Segoe UI,Arial';ctx.textAlign='center';ctx.fillText(G.banner,W/2,120);ctx.globalAlpha=1;ctx.textAlign='left'}
 ctx.restore();
 if(G.flash>0){ctx.fillStyle=`rgba(239,68,68,${G.flash*.6})`;ctx.fillRect(0,0,W,H)}
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
