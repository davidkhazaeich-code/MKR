interface TldrBoxProps {
  title?: string
  facts: string[]
  className?: string
}

export default function TldrBox({ title = 'En bref', facts, className }: TldrBoxProps) {
  return (
    <aside
      className={`tldr-box${className ? ` ${className}` : ''}`}
      aria-label={title}
    >
      <span className="tldr-box-label">{title}</span>
      <ul className="tldr-box-list">
        {facts.map((f, i) => (
          <li key={i} className="tldr-box-item">{f}</li>
        ))}
      </ul>
    </aside>
  )
}
