// Badge generique avec accent color, dot optionnel et pulse animation.
// Utilise pour status candidatures + tunnels + signaux (nouveau, retard, etc.).

interface Props {
  children: React.ReactNode
  color: string
  size?: 'sm' | 'lg'
  dot?: boolean
  pulse?: boolean
}

export default function Badge({ children, color, size = 'sm', dot = false, pulse = false }: Props) {
  return (
    <span
      className={size === 'lg' ? 'adm-badge adm-badge--lg' : 'adm-badge'}
      style={{
        ['--adm-badge-color' as string]: color,
        // color-mix et pas `${color}1a` : la concatenation hex+alpha est invalide
        // quand color est un var(--x) (fond transparent + bordure 100% saturee).
        ['--adm-badge-bg' as string]: `color-mix(in srgb, ${color} 10%, transparent)`,
        ['--adm-badge-border' as string]: `color-mix(in srgb, ${color} 25%, transparent)`,
      }}
    >
      {dot && (
        <span
          className={pulse ? 'adm-badge-dot adm-badge-dot--pulse' : 'adm-badge-dot'}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}
