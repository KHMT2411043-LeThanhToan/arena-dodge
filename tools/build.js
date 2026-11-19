#!/usr/bin/env node
/* Gộp toàn bộ thành MỘT file HTML (ảnh nhúng dạng base64) để gửi qua Zalo/mở offline.
   Dùng:  node tools/build.js   →  dist/arena-dodge.html            */
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const rd=p=>fs.readFileSync(path.join(root,p),'utf8');
const FILES=['skins','maps','bosses','cores','bullets','questions'];

function mime(p){return /\.jpe?g$/i.test(p)?'image/jpeg':/\.webp$/i.test(p)?'image/webp':/\.gif$/i.test(p)?'image/gif':'image/png'}
function dataUri(p){return 'data:'+mime(p)+';base64,'+fs.readFileSync(path.join(root,p)).toString('base64')}

function buildContent(){
  const C={};
  FILES.forEach(f=>C[f]=JSON.parse(rd('content/'+f+'.json')));
  C.skins.forEach(s=>{if(s.img)s.img=dataUri(s.img)});
  C.maps.forEach(m=>{if(m.bg)m.bg=dataUri(m.bg)});
  Object.values(C.bosses).forEach(b=>{if(b.img)b.img=dataUri(b.img)});
  return C;
}
function build(){
  const C=buildContent();
  let html=rd('index.html');
  const game=rd('game.js');
  if(/<\/script/i.test(game))throw new Error('game.js chứa chuỗi </script>, hãy viết thành <\\/script>');
  const safe=s=>s.replace(/</g,'\\u003c');
  const qjson=safe(JSON.stringify(C.questions));
  html=html.replace(/(<script id="embedded-questions"[^>]*>)[\s\S]*?(<\/script>)/,(m,a,b)=>a+qjson+b);
  const inline='<script>window.CONTENT='+safe(JSON.stringify(C))+';window.CONTENT_BUILT=true;</script>\n<script>\n'+game+'\n</script>';
  if(!html.includes('<script src="boot.js"></script>'))throw new Error('index.html không có thẻ boot.js');
  html=html.replace('<script src="boot.js"></script>',()=>inline);
  return html;
}
module.exports={build,buildContent};
if(require.main===module){
  const out=path.join(root,'dist');fs.mkdirSync(out,{recursive:true});
  const html=build(),file=path.join(out,'arena-dodge.html');
  fs.writeFileSync(file,html);
  console.log('Đã tạo',path.relative(process.cwd(),file),'('+(html.length/1048576).toFixed(2)+' MB)');
}
