import { Link } from '@/i18n/navigation'

// Le Link i18n localise le pathname (ex: /inscription -> /en/apply cote EN).
// L'ancien next/link brut envoyait les visiteurs EN vers les routes FR.
type LocalizedHref = Parameters<typeof Link>[0]['href']

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
          <Link href={primaryHref as LocalizedHref} className="btn-primary">{primaryLabel}</Link>
          {ghostHref && ghostLabel && (
            <Link href={ghostHref as LocalizedHref} className="btn-ghost">{ghostLabel}</Link>
          )}
        </div>
      </div>
    </section>
  )
}
