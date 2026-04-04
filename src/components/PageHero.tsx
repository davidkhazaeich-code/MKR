import Breadcrumb from './Breadcrumb'

interface PageHeroProps {
  label: string
  title: string
  subtitle?: string
  breadcrumb?: { href: string; label: string }[]
  compact?: boolean
}

export default function PageHero({ label, title, subtitle, breadcrumb, compact }: PageHeroProps) {
  return (
    <section className={`page-hero${compact ? ' page-hero--compact' : ''}`}>
      <div className="inner reveal">
        {breadcrumb && <Breadcrumb items={breadcrumb} />}
        <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
          {label}
        </span>
        <h1 dangerouslySetInnerHTML={{ __html: title }} />
        {subtitle && <p className="hero-sub">{subtitle}</p>}
      </div>
    </section>
  )
}
