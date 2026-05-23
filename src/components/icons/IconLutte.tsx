/**
 * IconLutte — Silhouette pleine inspirée du pictogramme classique de la lutte :
 * 2 lutteurs en clinch, bras croisés en collar-tie, corps inclinés en stance
 * basse. Style fill="currentColor" pour s'adapter à la couleur du contexte
 * (mega menu sombre, cards claires, hover, etc.).
 *
 * Composition (viewBox 0 0 24 24) :
 *   - 2 têtes au-dessus en cercles
 *   - Bras du lutteur de gauche qui s'étendent vers la droite en clinch
 *   - Bras du lutteur de droite qui se croisent par-dessous
 *   - Corps + jambes massifs en stance large
 */
export default function IconLutte({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {/* Têtes */}
      <circle cx="7.5" cy="3.4" r="2.1" />
      <circle cx="13.5" cy="4.4" r="1.9" />

      {/* Bras supérieur du lutteur 1 — clinch passant par-dessus */}
      <path d="M5.8 6.5 C 5.8 5.6, 6.6 5, 7.5 5.1 C 9 5.2, 10.5 5.7, 12 6.3 L 17.5 6 C 18.4 6, 19 6.7, 19 7.5 C 19 8.3, 18.4 8.9, 17.6 9 L 13 9.6 C 11 9.6, 8.8 9.1, 7 8.5 C 6.2 8.2, 5.8 7.4, 5.8 6.5 Z" />

      {/* Bras inférieur du lutteur 1 — saisie à la taille de l'adversaire */}
      <path d="M6.5 11 C 6.5 10.2, 7.2 9.6, 8 9.7 C 9.5 10, 11 10.4, 12.5 10.6 L 16 10.3 C 16.9 10.3, 17.5 11, 17.5 11.8 C 17.5 12.5, 17 13.2, 16.2 13.3 L 12.5 13.7 C 10.8 13.7, 9 13.3, 7.5 12.7 C 6.9 12.5, 6.5 11.8, 6.5 11 Z" />

      {/* Corps + jambes lutteur 1 (gauche, en stance arrière) */}
      <path d="M5 8.5 C 5 9.5, 4.5 10.5, 4 11.5 L 1.6 17 C 1.2 18, 1.5 19.3, 2.5 19.7 C 3.5 20.2, 4.6 19.7, 5 18.8 L 7 14.4 L 7 19.5 C 7 20.7, 7.8 21.7, 9 21.7 C 10.2 21.7, 11 20.7, 11 19.5 L 11 12.5 C 11 11.5, 10.4 10.6, 9.4 10.2 C 8.4 9.7, 7.4 9.2, 6.6 8.5 Z" />

      {/* Corps + jambes lutteur 2 (droit, jambe avant pliée + jambe arrière en extension) */}
      <path d="M12 12.5 L 12.4 14 L 13 19.6 C 13.1 20.8, 14 21.7, 15.1 21.6 C 16.2 21.5, 17 20.5, 16.9 19.3 L 16.5 15.2 L 18.4 17.4 L 20.5 21.3 C 21 22.2, 22.2 22.4, 23 21.8 C 23 21.6, 23 21.4, 23 21.2 C 23 21.1, 22.9 20.9, 22.8 20.7 L 20.7 16.5 L 19 12.5 C 18.4 11.3, 17.2 10.5, 15.9 10.5 L 13.3 10.5 C 12.5 10.5, 12 11.3, 12 12.1 Z" />
    </svg>
  )
}
