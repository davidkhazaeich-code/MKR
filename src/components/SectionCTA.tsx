interface SectionCTAProps {
  primaryHref: string
  primaryLabel: string
  ghostHref?: string
  ghostLabel?: string
}

export default function SectionCTA({ primaryHref, primaryLabel, ghostHref, ghostLabel }: SectionCTAProps) {
  return (
    <section className="section-cta">
      <div className="inner reveal">
        <div className="section-cta-buttons">
          <a href={primaryHref} className="btn-primary">{primaryLabel}</a>
          {ghostHref && ghostLabel && (
            <a href={ghostHref} className="btn-ghost">{ghostLabel}</a>
          )}
        </div>
      </div>
    </section>
  )
}
