interface BreadcrumbProps {
  items: { href: string; label: string }[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="breadcrumb" aria-label="Fil d'Ariane">
      <a href="/">Accueil</a>
      {items.map((item, i) => (
        <span key={i}>
          <span aria-hidden="true">/</span>
          {i === items.length - 1 ? (
            <span aria-current="page">{item.label}</span>
          ) : (
            <a href={item.href}>{item.label}</a>
          )}
        </span>
      ))}
    </nav>
  )
}
