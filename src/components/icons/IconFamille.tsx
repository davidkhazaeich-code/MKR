/**
 * IconFamille — silhouette adulte + enfant côte à côte, mains jointes.
 * Style stroke aligné sur IconMMA (strokeWidth 1.6, linecap round) pour
 * homogénéité visuelle avec les autres icônes du tunnel d'inscription.
 *
 * Utilisée dans le tunnel famille du form /inscription (Step 0).
 */
export default function IconFamille({ className }: { className?: string }) {
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
      {/* Adulte (gauche, plus grand) */}
      <circle cx="6.5" cy="4.6" r="2.3" />
      <path d="M6.5 7.4 L 6.5 14.2" />
      <path d="M4 10.4 L 6.5 10.2" />
      <path d="M6.5 14.2 L 4.7 21" />
      <path d="M6.5 14.2 L 8.3 21" />

      {/* Enfant (droite, plus petit) */}
      <circle cx="17.2" cy="9" r="1.9" />
      <path d="M17.2 11.2 L 17.2 16.5" />
      <path d="M19.6 13 L 17.2 12.8" />
      <path d="M17.2 16.5 L 15.6 21" />
      <path d="M17.2 16.5 L 18.8 21" />

      {/* Mains jointes : bras adulte tendu rejoignant le bras de l'enfant */}
      <path d="M6.5 10.2 L 12 12 L 17.2 12.8" />
    </svg>
  )
}
