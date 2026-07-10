import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

type LandscapeKey = 'sulak' | 'grozny' | 'gamsutl' | 'vainakh' | 'kezenoy'
type LinkHref = Parameters<typeof Link>[0]['href']

// Lac Kezenoy-Am est le lac frontalier entre les deux terres : on le fait pointer
// vers le combo sur-mesure plutot que vers la page courante (/destinations).
const LANDSCAPES: Array<{ key: LandscapeKey; src: string; href: LinkHref }> = [
  { key: 'sulak', src: '/images/environment/canyon-sulak.webp', href: '/destinations/dagestan' },
  { key: 'grozny', src: '/images/environment/mosque-grozny.webp', href: '/destinations/tchetchenie' },
  { key: 'gamsutl', src: '/images/environment/gamsutl-village.webp', href: '/destinations/dagestan' },
  { key: 'vainakh', src: '/images/environment/vainakh-towers.webp', href: '/destinations/tchetchenie' },
  { key: 'kezenoy', src: '/images/environment/lake-kezenoy.webp', href: '/sur-mesure' },
]

export default function DestinationShowcase() {
  const t = useTranslations('destinations.root.showcase')
  return (
    <section id="destination-showcase" aria-label={t('label')}>
      <div className="dest-showcase-glow" aria-hidden="true" />
      <div className="inner">
        <div className="dest-showcase-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block' }}>
            {t('label')}
          </span>
        </div>

        <div className="dest-showcase-grid">
          {LANDSCAPES.map((img, i) => (
            <Link key={i} href={img.href} className="dest-showcase-card reveal" style={i > 0 ? { transitionDelay: `${i * 0.1}s` } : undefined}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={t(`landscapes.${img.key}.alt`)}
                className="dest-showcase-img"
                loading="lazy"
              />
              <div className="dest-showcase-caption">
                <span className="dest-showcase-caption-label">{t(`landscapes.${img.key}.label`)}</span>
                <span className="dest-showcase-caption-title">{t(`landscapes.${img.key}.caption`)}</span>
                <span className="dest-showcase-caption-text">{t(`landscapes.${img.key}.text`)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
