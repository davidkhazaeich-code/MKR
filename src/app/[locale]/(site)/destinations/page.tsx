import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { buildMetadata } from '@/lib/seo'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'destinations.root' })
  return buildMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    path: '/destinations',
  })
}

const DEST_KEYS = ['daghestan', 'tchetchenie'] as const

const DEST_HREFS = {
  daghestan: '/destinations/dagestan',
  tchetchenie: '/destinations/tchetchenie',
} as const satisfies Record<typeof DEST_KEYS[number], Parameters<typeof Link>[0]['href']>

const DEST_IMAGES: Record<typeof DEST_KEYS[number], string> = {
  daghestan: '/images/environment/dagestan-panorama.webp',
  tchetchenie: '/images/environment/mosque-grozny.webp',
}

const COMPARATIF_ROW_KEYS = ['discipline', 'capitale', 'aeroport', 'transfert', 'signature', 'ambiance', 'pour_qui'] as const

export default async function DestinationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('destinations.root')

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/destinations' },
      ]} />
      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
      />

      <section className="dest-hub fx-grid fx-glow">
        <div className="fx-glow-orb" />
        <div className="inner">
          <div className="dest-hub-grid">
            {DEST_KEYS.map((key, i) => (
              <Link href={DEST_HREFS[key]} key={key} className="dest-hub-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <img
                  src={DEST_IMAGES[key]}
                  alt={t(`cards.${key}.alt`)}
                  width={1200}
                  height={600}
                  className="dest-hub-bg-img"
                  aria-hidden="true"
                />
                <div className="dest-hub-overlay" aria-hidden="true" />
                <div className="dest-hub-content">
                  <span className="dest-hub-region">{t(`cards.${key}.region`)}</span>
                  <h2>{t(`cards.${key}.name`)}</h2>
                  <p>{t(`cards.${key}.tagline`)}</p>
                  <p style={{ marginTop: '0.4rem', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {t(`cards.${key}.camp_prefix`)}{t(`cards.${key}.discipline`)}
                  </p>
                  <span className="btn-ghost" style={{ marginTop: '1rem', fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
                    {t(`cards.${key}.cta`)}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="reveal" style={{ maxWidth: '760px', margin: '2.5rem auto 0', textAlign: 'center', padding: '1.5rem 1.75rem', border: '1px solid var(--surface-lowest)', background: 'rgba(200,75,49,0.06)' }}>
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>{t('combo_note.label')}</span>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {t('combo_note.body')}
            </p>
            <Link href="/sur-mesure" className="btn-ghost" style={{ marginTop: '1rem', fontSize: '0.85rem', padding: '0.55rem 1.4rem' }}>
              {t('combo_note.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Comparatif Daghestan vs Tchétchénie */}
      <section className="logi-section fx-texture-basalt fx-mask-b fx-stack-3">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              {t('comparatif.label')}
            </span>
            <h2>{t('comparatif.title')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.6rem', maxWidth: '720px' }}>
              {t('comparatif.intro')}
            </p>
          </div>
          <div className="reveal" style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
            <table className="table-tonal" style={{ minWidth: '640px', width: '100%' }}>
              <thead>
                <tr>
                  <th></th>
                  <th>{t('comparatif.headers.daghestan')}</th>
                  <th>{t('comparatif.headers.tchetchenie')}</th>
                </tr>
              </thead>
              <tbody>
                {COMPARATIF_ROW_KEYS.map((rowKey) => (
                  <tr key={rowKey}>
                    <td><strong>{t(`comparatif.rows.${rowKey}.label`)}</strong></td>
                    <td>{t(`comparatif.rows.${rowKey}.daghestan`)}</td>
                    <td>{t(`comparatif.rows.${rowKey}.tchetchenie`)}</td>
                  </tr>
                ))}
                <tr>
                  <td><strong>{t('comparatif.rows.combo.label')}</strong></td>
                  <td colSpan={2} style={{ textAlign: 'center' }}>{t('comparatif.rows.combo.value')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/inscription?type=session"
        primaryLabel={t('section_cta.primary_label')}
        ghostHref="/programme"
        ghostLabel={t('section_cta.ghost_label')}
      />
    </>
  )
}
