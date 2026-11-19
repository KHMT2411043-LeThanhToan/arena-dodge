/* Nạp dữ liệu trong content/*.json rồi mới chạy game.js.
   Chạy được trên GitHub Pages hoặc máy chủ cục bộ (npx serve).
   Mở trực tiếp file bằng Zalo/Chrome (content:// hay file://) KHÔNG nạp được JSON:
   khi đó hãy dùng file gộp từ `node tools/build.js` (dist/arena-dodge.html). */
(async function(){
  var FILES=['skins','maps','bosses','cores','bullets','questions'];
  try{
    var res=await Promise.all(FILES.map(function(f){
      return fetch('content/'+f+'.json').then(function(r){
        if(!r.ok)throw new Error('content/'+f+'.json → HTTP '+r.status);
        return r.json();
      });
    }));
    window.CONTENT={};
    FILES.forEach(function(f,i){window.CONTENT[f]=res[i]});
    document.getElementById('embedded-questions').textContent=JSON.stringify(window.CONTENT.questions);
    var s=document.createElement('script');
    s.src='game.js';
    s.onerror=function(){fail('Không tải được game.js')};
    document.body.appendChild(s);
  }catch(e){fail(e.message)}
  function fail(msg){
    document.body.insertAdjacentHTML('afterbegin',
      '<pre style="position:fixed;inset:0;margin:0;padding:16px;background:#7f1d1d;color:#fff;font:14px/1.5 sans-serif;white-space:pre-wrap;z-index:999">'+
      'Không nạp được dữ liệu game:\n'+msg+
      '\n\nHãy mở game qua http (GitHub Pages hoặc "npx serve"), không mở trực tiếp file.\n'+
      'Muốn gửi 1 file duy nhất qua Zalo: chạy "node tools/build.js" rồi gửi dist/arena-dodge.html.</pre>');
  }
})();
