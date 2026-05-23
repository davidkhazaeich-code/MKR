/**
 * IconLutte — Single-leg takedown : geste signature de la lutte libre daghestanaise.
 * Un lutteur courbé (gauche) saisit la jambe du défenseur debout (droite, en sprawl).
 * Composition asymétrique dynamique au lieu des 2 stick figures symétriques précédents,
 * pour signifier vraiment « lutte » plutôt que « 2 silhouettes ».
 *
 * Style stroke aligné sur IconMMA / IconFamille (strokeWidth 1.6, linecap round).
 */
export default function IconLutte({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* ATTAQUANT (gauche, en shoot / plongée basse, saisit la jambe) */}
      <circle cx="5" cy="10.5" r="1.6" />
      <path d="M6.3 11.2 L 11.5 12.3" />              {/* torse horizontal */}
      <path d="M9.5 11.5 L 13.5 11.3" />              {/* bras qui saisit la cuisse */}
      <path d="M11.5 12.3 L 9.5 16 L 9.5 21.5" />     {/* jambe arrière pliée */}
      <path d="M5.5 12 L 3.5 16 L 3 21.5" />          {/* jambe avant en propulsion */}

      {/* DÉFENSEUR (droite, debout en sprawl, sa jambe gauche est saisie) */}
      <circle cx="17" cy="3.8" r="1.5" />
      <path d="M17 5.3 L 16 11.3" />                  {/* torse penché en avant */}
      <path d="M16.3 8 L 12.5 10" />                  {/* bras gauche posé sur dos attaquant */}
      <path d="M16.5 8.5 L 18.5 11" />                {/* bras droit qui s'agrippe */}
      <path d="M16 11.3 L 13.5 11.3" />               {/* JAMBE saisie horizontale (saisie visible) */}
      <path d="M16 11.3 L 19 17 L 21.5 21.5" />       {/* jambe debout en sprawl arrière */}
    </svg>
  )
}
