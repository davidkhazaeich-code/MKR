// Avatar avec initiales et teinte derivee de l'identifiant.
// Hash deterministe : meme nom = meme teinte a chaque fois. Les teintes
// (classes adm-avatar--c0 a c5) sont des jetons clair et sombre de admin.css,
// sourdes et distinctes des tons semantiques des statuts.

const HUE_COUNT = 6

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
  const hue = hashString(hashSeed) % HUE_COUNT
  const cls = ['adm-avatar', `adm-avatar--c${hue}`]
  if (size === 'lg') cls.push('adm-avatar--lg')
  return (
    <span className={cls.join(' ')} aria-hidden="true">
      {initials(prenom, nom)}
    </span>
  )
}
