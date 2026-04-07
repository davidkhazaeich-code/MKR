(function () {
  var d = document;

  /* --- 1. Inject styles immediately (head always exists) --- */
  var s = d.createElement('style');
  s.textContent = [
    '#mkr-loader{position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;overflow:hidden;pointer-events:none}',
    '#mkr-loader .h{position:absolute;left:0;width:100%;height:50%;background:#0A0A0A}',
    '#mkr-loader .ht{top:0}',
    '#mkr-loader .hb{top:50%}',
    '#mkr-loader .ct{position:absolute;z-index:2;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:clamp(20px,4vh,32px);opacity:0}',
    '#mkr-loader .ct img{width:clamp(120px,28vw,180px);height:auto}',
    '#mkr-loader .tr{width:clamp(160px,50vw,280px);height:3px;background:rgba(255,255,255,.12);border-radius:3px;overflow:hidden}',
    '#mkr-loader .fl{height:100%;width:0%;background:#C84B31;border-radius:3px;box-shadow:0 0 8px rgba(200,75,49,.5)}'
  ].join('');
  (d.head || d.documentElement).appendChild(s);

  /* --- 2. Create loader HTML string --- */
  var html = '<div id="mkr-loader" aria-hidden="true"><div class="h ht"></div><div class="h hb"></div><div class="ct"><img src="/logo-white.webp" alt=""><div class="tr"><div class="fl" id="mkr-f"></div></div></div></div>';

  function init() {
    /* Insert loader as first child of body */
    d.body.insertAdjacentHTML('afterbegin', html);

    var w = d.getElementById('mkr-loader');
    var f = d.getElementById('mkr-f');
    var ct = w.querySelector('.ct');

    /* Force paint */
    void w.offsetHeight;

    /* --- 3s timeline --- */

    /* 0ms: Fade in center */
    ct.style.transition = 'opacity .5s ease-out';
    ct.style.opacity = '1';

    /* 150ms: Bar → 75% */
    setTimeout(function () {
      f.style.transition = 'width 1.5s cubic-bezier(.25,.46,.45,.94)';
      f.style.width = '75%';
    }, 150);

    /* 1700ms: Bar → 100% */
    setTimeout(function () {
      f.style.transition = 'width .5s ease-out';
      f.style.width = '100%';
    }, 1700);

    /* 2200ms: Fade out center */
    setTimeout(function () {
      ct.style.transition = 'opacity .2s ease, transform .2s ease';
      ct.style.opacity = '0';
      ct.style.transform = 'translate(-50%,-50%) scale(.92)';
    }, 2200);

    /* 2400ms: Split open */
    setTimeout(function () {
      var ht = w.querySelector('.ht');
      var hb = w.querySelector('.hb');
      ht.style.transition = 'transform .8s cubic-bezier(.76,0,.24,1)';
      hb.style.transition = 'transform .8s cubic-bezier(.76,0,.24,1)';
      void ht.offsetHeight;
      ht.style.transform = 'translateY(-100%)';
      hb.style.transform = 'translateY(100%)';
    }, 2400);

    /* 3200ms: Cleanup */
    setTimeout(function () {
      w.remove();
      s.remove();
    }, 3200);
  }

  /* Ensure body exists before inserting */
  if (d.body) {
    init();
  } else {
    d.addEventListener('DOMContentLoaded', init);
  }
})();
