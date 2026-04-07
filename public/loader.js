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

  /* --- 3. Animation timeline (2.5s total) --- */
  // Force initial paint
  void w.offsetHeight;

  // Phase 1: Fade in logo + bar (0-400ms)
  ct.style.transition = 'opacity .4s ease-out';
  ct.style.opacity = '1';

  // Phase 2: Bar fills (100ms-1400ms)
  setTimeout(function () {
    if (f) {
      f.style.transition = 'width 1.2s cubic-bezier(.25,.46,.45,.94)';
      f.style.width = '75%';
    }
  }, 100);

  // Phase 3: Bar completes (1400ms)
  setTimeout(function () {
    if (f) {
      f.style.transition = 'width .4s ease-out';
      f.style.width = '100%';
    }
  }, 1400);

  // Phase 4: Fade out center (1800ms)
  setTimeout(function () {
    ct.style.transition = 'opacity .2s ease, transform .2s ease';
    ct.style.opacity = '0';
    ct.style.transform = 'translate(-50%,-50%) scale(.92)';
  }, 1800);

  // Phase 5: Split open (2000ms)
  setTimeout(function () {
    var halves = w.querySelectorAll('.h');
    for (var i = 0; i < halves.length; i++) {
      halves[i].style.transition = 'transform .7s cubic-bezier(.76,0,.24,1)';
    }
    // Force reflow before applying transform
    void halves[0].offsetHeight;
    halves[0].style.transform = 'translateY(-100%)';
    halves[1].style.transform = 'translateY(100%)';
  }, 2000);

  // Phase 6: Cleanup (2700ms)
  setTimeout(function () {
    w.remove();
    s.remove();
  }, 2700);
})();
