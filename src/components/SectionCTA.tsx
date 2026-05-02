import Link from 'next/link'

interface SectionCTAProps {
  primaryHref: string
  primaryLabel: string
  ghostHref?: string
  ghostLabel?: string
}

export default function SectionCTA({ primaryHref, primaryLabel, ghostHref, ghostLabel }: SectionCTAProps) {
  return (
    <section className="section-cta" data-scroll-section data-scroll-label="Passer à l'action">
      <div className="inner reveal">
        <div className="section-cta-buttons">
          <Link href={primaryHref} className="btn-primary">{primaryLabel}</Link>
          {ghostHref && ghostLabel && (
            <Link href={ghostHref} className="btn-ghost">{ghostLabel}</Link>
          )}
        </div>
      </div>
    </section>
  )
}
