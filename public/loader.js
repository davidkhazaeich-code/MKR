(function () {
  var d = document;

  var s = d.createElement('style');
  s.textContent = [
    /* Wrapper */
    '#mkr-loader{position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;overflow:hidden;pointer-events:none}',
    /* Split halves */
    '#mkr-loader .h{position:absolute;left:0;width:100%;height:50%;background:#0A0A0A;animation:mkrSplit .8s cubic-bezier(.76,0,.24,1) 2.4s forwards}',
    '#mkr-loader .ht{top:0}',
    '#mkr-loader .hb{top:50%}',
    /* Center content */
    '#mkr-loader .ct{position:absolute;z-index:2;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:clamp(20px,4vh,32px);animation:mkrFadeIn .5s ease-out forwards,mkrFadeOut .25s ease 2.2s forwards}',
    /* Logo */
    '#mkr-loader .ct img{width:clamp(120px,28vw,180px);height:auto}',
    /* Bar track */
    '#mkr-loader .tr{width:clamp(160px,50vw,280px);height:3px;background:rgba(255,255,255,.12);border-radius:3px;overflow:hidden}',
    /* Bar fill — single animation 0% → 100% over 2s */
    '#mkr-loader .fl{height:100%;width:0%;background:#C84B31;border-radius:3px;box-shadow:0 0 8px rgba(200,75,49,.5);animation:mkrBar 2s cubic-bezier(.4,0,.2,1) .3s forwards}',
    /* Keyframes */
    '@keyframes mkrBar{0%{width:0%}60%{width:70%}90%{width:95%}100%{width:100%}}',
    '@keyframes mkrFadeIn{from{opacity:0;transform:translate(-50%,-50%) translateY(10px)}to{opacity:1;transform:translate(-50%,-50%)}}',
    '@keyframes mkrFadeOut{to{opacity:0;transform:translate(-50%,-50%) scale(.92)}}',
    '@keyframes mkrSplit{to{transform:translateY(var(--d))}}',
    '#mkr-loader .ht{--d:-100%}',
    '#mkr-loader .hb{--d:100%}'
  ].join('');
  (d.head || d.documentElement).appendChild(s);

  var html = '<div id="mkr-loader" aria-hidden="true"><div class="h ht"></div><div class="h hb"></div><div class="ct"><img src="/logo-white.webp" alt=""><div class="tr"><div class="fl"></div></div></div></div>';

  function init() {
    d.body.insertAdjacentHTML('afterbegin', html);
    var w = d.getElementById('mkr-loader');
    setTimeout(function () { w.remove(); s.remove() }, 3400);
  }

  if (d.body) {
    init();
  } else {
    d.addEventListener('DOMContentLoaded', init);
  }
})();
