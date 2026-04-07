(function () {
  var d = document, b = d.body;

  /* --- 1. Inject critical styles --- */
  var s = d.createElement('style');
  s.textContent = [
    '#mkr-loader{position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;overflow:hidden;pointer-events:none}',
    '#mkr-loader .h{position:absolute;left:0;width:100%;height:50%;background:#0A0A0A}',
    '#mkr-loader .ht{top:0}',
    '#mkr-loader .hb{top:50%}',
    '#mkr-loader .ct{position:absolute;z-index:2;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:14px;opacity:0}',
    '#mkr-loader .ct img{width:clamp(40px,10vw,56px);height:auto}',
    '#mkr-loader .tr{width:clamp(80px,25vw,140px);height:2px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden}',
    '#mkr-loader .fl{height:100%;width:0%;background:#C84B31;border-radius:2px}'
  ].join('');
  (d.head || d.documentElement).appendChild(s);

  /* --- 2. Create loader DOM --- */
  var w = d.createElement('div');
  w.id = 'mkr-loader';
  w.setAttribute('aria-hidden', 'true');
  w.innerHTML = [
    '<div class="h ht"></div>',
    '<div class="h hb"></div>',
    '<div class="ct">',
      '<img src="/logo-white.webp" width="56" height="56" alt="">',
      '<div class="tr"><div class="fl" id="mkr-f"></div></div>',
    '</div>'
  ].join('');
  b.appendChild(w);

  var f = d.getElementById('mkr-f');
  var ct = w.querySelector('.ct');

  /* --- 3. Animation timeline (3s total) --- */
  void w.offsetHeight;

  // 0ms: Fade in logo + bar
  ct.style.transition = 'opacity .5s ease-out';
  ct.style.opacity = '1';

  // 150ms: Bar → 75%
  setTimeout(function () {
    if (f) {
      f.style.transition = 'width 1.5s cubic-bezier(.25,.46,.45,.94)';
      f.style.width = '75%';
    }
  }, 150);

  // 1700ms: Bar → 100%
  setTimeout(function () {
    if (f) {
      f.style.transition = 'width .5s ease-out';
      f.style.width = '100%';
    }
  }, 1700);

  // 2200ms: Fade out center
  setTimeout(function () {
    ct.style.transition = 'opacity .2s ease, transform .2s ease';
    ct.style.opacity = '0';
    ct.style.transform = 'translate(-50%,-50%) scale(.92)';
  }, 2200);

  // 2400ms: Split open
  setTimeout(function () {
    var halves = w.querySelectorAll('.h');
    for (var i = 0; i < halves.length; i++) {
      halves[i].style.transition = 'transform .8s cubic-bezier(.76,0,.24,1)';
    }
    void halves[0].offsetHeight;
    halves[0].style.transform = 'translateY(-100%)';
    halves[1].style.transform = 'translateY(100%)';
  }, 2400);

  // 3200ms: Cleanup
  setTimeout(function () {
    w.remove();
    s.remove();
  }, 3200);
})();
