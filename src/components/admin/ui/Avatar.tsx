// Avatar circle avec initiales et couleur dérivée de l'identifiant.
// Hash deterministe : meme nom = meme couleur a chaque fois.

const PALETTE = [
  '#FF6B00', // brand orange
  '#60a5fa', // blue
  '#4ade80', // green
  '#a78bfa', // purple
  '#f472b6', // pink
  '#fbbf24', // amber
  '#2dd4bf', // teal
  '#fb7185', // rose
  '#34d399', // emerald
  '#818cf8', // indigo
] as const

function hashString(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function initials(prenom: string | null | undefined, nom: string | null | undefined): string {
  const first = (prenom?.trim()?.[0] ?? '').toUpperCase()
  const last = (nom?.trim()?.[0] ?? '').toUpperCase()
  if (first && last) return first + last
  if (first) return first
  if (last) return last
  return '?'
}

export default function Avatar({
  prenom,
  nom,
  seed,
  size = 'md',
}: {
  prenom?: string | null
  nom?: string | null
  seed?: string | null
  size?: 'md' | 'lg'
}) {
  const hashSeed = seed || `${prenom ?? ''}-${nom ?? ''}` || 'default'
  const color = PALETTE[hashString(hashSeed) % PALETTE.length]
  return (
    <span
      className={size === 'lg' ? 'adm-avatar adm-avatar--lg' : 'adm-avatar'}
      style={{ ['--adm-avatar-bg' as string]: color }}
      aria-hidden="true"
    >
      {initials(prenom, nom)}
    </span>
  )
}
