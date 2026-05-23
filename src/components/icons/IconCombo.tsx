/**
 * IconCombo — IconLutte (gauche, silhouette pleine) + petit séparateur +
 * IconMMA (droite, gant stroke) dans un viewBox 48×24 (proportion 2:1).
 * Mixed style assumed : Lutte est passée en fill silhouette (cf. IconLutte.tsx),
 * MMA reste en stroke. Chaque sous-icône override son style via un <g> wrapper.
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
      {/* Lutte (gauche, occupe 0-22) — fill silhouette */}
      <g fill="currentColor" stroke="none">
        <IconLutteInner />
      </g>
      {/* Séparateur central + (signe combo) */}
      <g transform="translate(22, 0)" opacity="0.55">
        <line x1="2" y1="9" x2="2" y2="15" />
        <line x1="-1" y1="12" x2="5" y2="12" />
      </g>
      {/* MMA (droite, occupe 26-48) — stroke gant */}
      <g transform="translate(24, 0)">
        <IconMMAInner />
      </g>
    </svg>
  )
}

// Inlining the paths avoids nested <svg> tags (which would reset viewBox).
// Mirror of IconLutte.tsx (silhouette pleine, 2 lutteurs en clinch).
function IconLutteInner() {
  return (
    <>
      <circle cx="7.5" cy="3.4" r="2.1" />
      <circle cx="13.5" cy="4.4" r="1.9" />
      <path d="M5.8 6.5 C 5.8 5.6, 6.6 5, 7.5 5.1 C 9 5.2, 10.5 5.7, 12 6.3 L 17.5 6 C 18.4 6, 19 6.7, 19 7.5 C 19 8.3, 18.4 8.9, 17.6 9 L 13 9.6 C 11 9.6, 8.8 9.1, 7 8.5 C 6.2 8.2, 5.8 7.4, 5.8 6.5 Z" />
      <path d="M6.5 11 C 6.5 10.2, 7.2 9.6, 8 9.7 C 9.5 10, 11 10.4, 12.5 10.6 L 16 10.3 C 16.9 10.3, 17.5 11, 17.5 11.8 C 17.5 12.5, 17 13.2, 16.2 13.3 L 12.5 13.7 C 10.8 13.7, 9 13.3, 7.5 12.7 C 6.9 12.5, 6.5 11.8, 6.5 11 Z" />
      <path d="M5 8.5 C 5 9.5, 4.5 10.5, 4 11.5 L 1.6 17 C 1.2 18, 1.5 19.3, 2.5 19.7 C 3.5 20.2, 4.6 19.7, 5 18.8 L 7 14.4 L 7 19.5 C 7 20.7, 7.8 21.7, 9 21.7 C 10.2 21.7, 11 20.7, 11 19.5 L 11 12.5 C 11 11.5, 10.4 10.6, 9.4 10.2 C 8.4 9.7, 7.4 9.2, 6.6 8.5 Z" />
      <path d="M12 12.5 L 12.4 14 L 13 19.6 C 13.1 20.8, 14 21.7, 15.1 21.6 C 16.2 21.5, 17 20.5, 16.9 19.3 L 16.5 15.2 L 18.4 17.4 L 20.5 21.3 C 21 22.2, 22.2 22.4, 23 21.8 C 23 21.6, 23 21.4, 23 21.2 C 23 21.1, 22.9 20.9, 22.8 20.7 L 20.7 16.5 L 19 12.5 C 18.4 11.3, 17.2 10.5, 15.9 10.5 L 13.3 10.5 C 12.5 10.5, 12 11.3, 12 12.1 Z" />
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
