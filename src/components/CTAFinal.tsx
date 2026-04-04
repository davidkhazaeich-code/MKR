import Link from 'next/link'

export default function CTAFinal() {
  return (
    <section id="cta-final" aria-labelledby="cta-heading">
      <div className="cta-glow" aria-hidden="true"></div>
      <div className="cta-inner">
        <span className="cta-label reveal">Les places sont limitées. L&apos;engagement est total.</span>
        <h2 id="cta-heading" className="cta-title reveal">
          LE SOMMET<br /><span>T&apos;ATTEND</span>
        </h2>
        <p className="cta-subtitle reveal" style={{ transitionDelay: '0.1s' }}>
          Prochain camp · Printemps 2026 · Caucase, Géorgie
        </p>
        <Link href="/inscription" className="cta-btn reveal" style={{ transitionDelay: '0.2s' }}>
          DÉPOSER MA CANDIDATURE
        </Link>
      </div>

      {/* Mountain silhouette */}
      <svg
        className="cta-mountains"
        viewBox="0 0 1440 140"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="horizonGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(200,75,49,0.20)" />
            <stop offset="100%" stopColor="rgba(200,75,49,0)" />
          </linearGradient>
        </defs>
        <rect x="0" y="55" width="1440" height="85" fill="url(#horizonGlow)" />
        <polygon
          fill="#0D0D0D"
          points="0,140 0,110 60,95 120,80 190,68 260,78 330,60 395,72 450,50 500,62 545,40 580,55 610,35 640,48 665,28 690,42 715,22 740,36 765,18 790,32 820,50 860,38 900,60 950,48 1005,68 1060,58 1115,75 1170,62 1225,80 1285,70 1340,88 1400,78 1440,92 1440,140"
        />
        <polygon
          fill="#0A0A0A"
          points="0,140 0,118 80,105 160,116 240,96 310,112 380,86 450,100 510,76 570,93 625,66 675,83 720,56 765,74 808,50 850,68 895,48 940,66 985,80 1035,66 1085,86 1140,73 1195,93 1255,80 1315,98 1375,86 1440,103 1440,140"
        />
        <polygon
          fill="#0E0E0E"
          points="0,140 0,128 120,120 240,130 360,115 480,128 600,110 720,125 840,112 960,128 1080,118 1200,130 1320,120 1440,132 1440,140"
        />
      </svg>
    </section>
  )
}
