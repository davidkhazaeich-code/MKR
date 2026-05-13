/**
 * IconMMA — gant MMA ouvert (4 doigts visibles + wrap poignet + pouce).
 * L'élément le plus iconique pour signifier « MMA » à petite taille.
 */
export default function IconMMA({ className }: { className?: string }) {
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
      <path d="M5.5 9 C 5.5 6, 7 4.5, 9 4.5 L 15 4.5 C 17 4.5, 18.5 6, 18.5 9 L 18.5 11 L 5.5 11 Z"/>
      <line x1="8" y1="5.5" x2="8" y2="11"/>
      <line x1="10.7" y1="4.7" x2="10.7" y2="11"/>
      <line x1="13.3" y1="4.7" x2="13.3" y2="11"/>
      <line x1="16" y1="5.5" x2="16" y2="11"/>
      <path d="M5.5 11 L 6 16.5 C 6.2 18, 7.2 19, 8.5 19 L 15.5 19 C 16.8 19, 17.8 18, 18 16.5 L 18.5 11 Z"/>
      <path d="M8 19 L 8 21.5 L 16 21.5 L 16 19"/>
      <path d="M5.5 12 C 4 12.5, 3 14, 3.5 15.5 L 5.5 16"/>
    </svg>
  )
}
