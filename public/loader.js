(function () {
  var d = document;
  var b = d.body;
  if (!b) return;

  /* Remove the static dark cover (rendered by React in layout) */
  var cover = d.getElementById('mkr-loader-init');
  if (cover) cover.remove();

  /* --- 1. Inject styles --- */
  var s = d.createElement('style');
  s.id = 'mkr-loader-css';
  s.textContent = [
    '#mkr-loader{position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;overflow:hidden}',
    '#mkr-loader .h{position:absolute;left:0;width:100%;height:50%;background:#0A0A0A}',
    '#mkr-loader .ht{top:0;--d:-100%}',
    '#mkr-loader .hb{top:50%;--d:100%}',
    '#mkr-loader .ct{position:absolute;z-index:2;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:clamp(20px,4vh,32px);animation:mkrIn .5s ease-out forwards}',
    '#mkr-loader .ct img{width:clamp(120px,28vw,180px);height:auto}',
    '#mkr-loader .tr{width:clamp(160px,50vw,280px);height:3px;background:rgba(255,255,255,.12);border-radius:3px;overflow:hidden}',
    '#mkr-loader .fl{height:100%;width:0;background:#C84B31;border-radius:3px;box-shadow:0 0 8px rgba(200,75,49,.5);animation:mkrBar 2s cubic-bezier(.4,0,.2,1) .3s forwards}',
    '@keyframes mkrIn{from{opacity:0;transform:translate(-50%,-50%) translateY(10px)}to{opacity:1;transform:translate(-50%,-50%)}}',
    '@keyframes mkrBar{0%{width:0}60%{width:70%}90%{width:95%}100%{width:100%}}',
    '@keyframes mkrOut{to{opacity:0;transform:translate(-50%,-50%) scale(.92)}}',
    '@keyframes mkrSplit{to{transform:translateY(var(--d))}}'
  ].join('');
  d.head.appendChild(s);

  /* --- 2. Create animated loader on top --- */
  var w = d.createElement('div');
  w.id = 'mkr-loader';
  w.innerHTML = '<div class="h ht"></div><div class="h hb"></div><div class="ct"><img src="/logo-white.webp" alt=""><div class="tr"><div class="fl"></div></div></div>';
  b.appendChild(w);

  /* --- 3. Timeline (3s) --- */

  /* 2.2s: fade out center */
  setTimeout(function () {
    var ct = w.querySelector('.ct');
    if (ct) ct.style.animation = 'mkrOut .25s ease forwards';
  }, 2200);

  /* 2.5s: split open */
  setTimeout(function () {
    var ht = w.querySelector('.ht');
    var hb = w.querySelector('.hb');
    if (ht) ht.style.animation = 'mkrSplit .8s cubic-bezier(.76,0,.24,1) forwards';
    if (hb) hb.style.animation = 'mkrSplit .8s cubic-bezier(.76,0,.24,1) forwards';
  }, 2500);

  /* 3.4s: cleanup */
  setTimeout(function () {
    w.remove();
    s.remove();
  }, 3400);
})();
