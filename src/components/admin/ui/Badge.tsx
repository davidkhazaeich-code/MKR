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
        ['--adm-badge-bg' as string]: `${color}1a`,
        ['--adm-badge-border' as string]: `${color}40`,
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
