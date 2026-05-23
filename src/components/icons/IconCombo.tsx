/**
 * IconCombo — IconLutte (gauche) + petit séparateur + IconMMA (droite)
 * dans un viewBox 48×24 (proportion 2:1). Style stroke unifié maintenant
 * que IconLutte est passé en stroke (cf. IconLutte.tsx).
 *
 * À utiliser avec une taille CSS dédiée (cf. .insc-discipline-card--combo
 * dans globals.css) pour rester proportionné face aux icônes simples 24×24.
 */
export default function IconCombo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 24"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Lutte (gauche, occupe 0-22) */}
      <g>
        <IconLutteInner />
      </g>
      {/* Séparateur central + (signe combo) */}
      <g transform="translate(22, 0)" opacity="0.55">
        <line x1="2" y1="9" x2="2" y2="15" />
        <line x1="-1" y1="12" x2="5" y2="12" />
      </g>
      {/* MMA (droite, occupe 26-48) */}
      <g transform="translate(24, 0)">
        <IconMMAInner />
      </g>
    </svg>
  )
}

// Inlining the paths avoids nested <svg> tags (which would reset viewBox).
// Mirror of IconLutte.tsx (single-leg takedown silhouette).
function IconLutteInner() {
  return (
    <>
      {/* ATTAQUANT (gauche, en shoot) */}
      <circle cx="5" cy="10.5" r="1.6" />
      <path d="M6.3 11.2 L 11.5 12.3" />
      <path d="M9.5 11.5 L 13.5 11.3" />
      <path d="M11.5 12.3 L 9.5 16 L 9.5 21.5" />
      <path d="M5.5 12 L 3.5 16 L 3 21.5" />
      {/* DÉFENSEUR (droite, en sprawl) */}
      <circle cx="17" cy="3.8" r="1.5" />
      <path d="M17 5.3 L 16 11.3" />
      <path d="M16.3 8 L 12.5 10" />
      <path d="M16.5 8.5 L 18.5 11" />
      <path d="M16 11.3 L 13.5 11.3" />
      <path d="M16 11.3 L 19 17 L 21.5 21.5" />
    </>
  )
}

function IconMMAInner() {
  return (
    <>
      <path d="M5.5 9 C 5.5 6, 7 4.5, 9 4.5 L 15 4.5 C 17 4.5, 18.5 6, 18.5 9 L 18.5 11 L 5.5 11 Z" />
      <line x1="8" y1="5.5" x2="8" y2="11" />
      <line x1="10.7" y1="4.7" x2="10.7" y2="11" />
      <line x1="13.3" y1="4.7" x2="13.3" y2="11" />
      <line x1="16" y1="5.5" x2="16" y2="11" />
      <path d="M5.5 11 L 6 16.5 C 6.2 18, 7.2 19, 8.5 19 L 15.5 19 C 16.8 19, 17.8 18, 18 16.5 L 18.5 11 Z" />
      <path d="M8 19 L 8 21.5 L 16 21.5 L 16 19" />
      <path d="M5.5 12 C 4 12.5, 3 14, 3.5 15.5 L 5.5 16" />
    </>
  )
}
