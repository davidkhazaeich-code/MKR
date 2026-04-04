import Link from 'next/link'

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
          <Link href={primaryHref} className="btn-primary">{primaryLabel}</Link>
          {ghostHref && ghostLabel && (
            <Link href={ghostHref} className="btn-ghost">{ghostLabel}</Link>
          )}
        </div>
      </div>
    </section>
  )
}
