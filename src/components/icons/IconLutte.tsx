/**
 * IconLutte — 2 lutteurs face-à-face en stance basse, mains en prise.
 * Style stroke aligné sur IconMMA / IconFamille (strokeWidth 1.6, linecap round)
 * pour homogénéité visuelle dans le tunnel d'inscription et les pages programme.
 *
 * L'ancienne version (vectorisation potrace, fill currentColor) a été remplacée
 * pour rester lisible à 24×24 et cohérente avec le reste du jeu d'icônes MKR.
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
      {/* Lutteur gauche : tête, torse incliné, bras en prise, jambes en stance */}
      <circle cx="5.6" cy="5" r="1.9" />
      <path d="M5.6 6.9 L 7.4 11.2" />
      <path d="M7.4 11.2 L 6 16" />
      <path d="M7.4 11.2 L 11 12.6" />
      <path d="M5.6 6.9 L 3.4 10.6" />
      <path d="M6 16 L 3.4 20.5" />
      <path d="M6 16 L 8.2 20.5" />

      {/* Lutteur droite : symétrique */}
      <circle cx="18.4" cy="5" r="1.9" />
      <path d="M18.4 6.9 L 16.6 11.2" />
      <path d="M16.6 11.2 L 18 16" />
      <path d="M16.6 11.2 L 13 12.6" />
      <path d="M18.4 6.9 L 20.6 10.6" />
      <path d="M18 16 L 20.6 20.5" />
      <path d="M18 16 L 15.8 20.5" />

      {/* Prise centrale (mains accrochées) */}
      <path d="M11 12.6 L 13 12.6" />
    </svg>
  )
}
