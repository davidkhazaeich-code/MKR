(function () {
  var d = document, b = d.body;

  // 1. Inject styles into head
  var s = d.createElement('style');
  s.textContent = [
    '#mkr-loader{position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;overflow:hidden}',
    '#mkr-loader .h{position:absolute;left:0;width:100%;height:50%;background:#0A0A0A;will-change:transform;transition:transform .8s cubic-bezier(.76,0,.24,1)}',
    '#mkr-loader .ht{top:0}',
    '#mkr-loader .hb{top:50%}',
    '#mkr-loader .h.go.ht{transform:translateY(-100%)}',
    '#mkr-loader .h.go.hb{transform:translateY(100%)}',
    '#mkr-loader .ct{position:absolute;z-index:2;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:16px;transition:opacity .25s ease,transform .25s ease}',
    '#mkr-loader .ct.out{opacity:0;transform:translate(-50%,-50%) scale(.9)}',
    '#mkr-loader .ct img{width:clamp(40px,10vw,60px);height:auto}',
    '#mkr-loader .tr{width:clamp(80px,25vw,140px);height:2px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden}',
    '#mkr-loader .fl{height:100%;width:0%;background:#C84B31;border-radius:2px;transition:width 1s cubic-bezier(.25,.46,.45,.94)}'
  ].join('');
  (d.head || d.documentElement).appendChild(s);

  // 2. Create loader DOM
  var w = d.createElement('div');
  w.id = 'mkr-loader';
  w.innerHTML = '<div class="h ht"></div><div class="h hb"></div><div class="ct"><img src="/logo-white.webp" width="60" height="60" alt=""><div class="tr"><div class="fl" id="mkr-f"></div></div></div>';
  b.insertBefore(w, b.firstChild);
  b.style.overflow = 'hidden';

  var f = d.getElementById('mkr-f');

  // 3. Force paint, then run 2.5s timeline
  void w.offsetHeight;
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      // 0ms: bar → 70%
      if (f) f.style.width = '70%';
      // 1000ms: bar → 100%
      setTimeout(function () { if (f) f.style.width = '100%' }, 1000);
      // 1500ms: fade out center
      setTimeout(function () { var c = w.querySelector('.ct'); if (c) c.classList.add('out') }, 1500);
      // 1750ms: split open
      setTimeout(function () { var a = w.querySelectorAll('.h'); for (var i = 0; i < a.length; i++) a[i].classList.add('go') }, 1750);
      // 2500ms: cleanup
      setTimeout(function () { w.remove(); s.remove(); b.style.overflow = '' }, 2600);
    });
  });
})();
