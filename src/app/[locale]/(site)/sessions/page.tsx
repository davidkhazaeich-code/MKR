import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import AudienceSwitcher from '@/components/AudienceSwitcher'
import PricingTable from '@/components/PricingTable'
import PlacesRestantes from '@/components/PlacesRestantes'
import RefundPolicyTable from '@/components/RefundPolicyTable'
import {
  MIN_PRICE_PER_ADULT_LABEL,
  FAMILY_BASE_1WEEK_LABEL,
  SOLO_PRICE_1WEEK_LABEL,
} from '@/lib/pricing-copy'
import { PRICING_TIERS, formatEUR } from '@/data/pricing'
import { getSessions, sessionYearRange } from '@/data/sessions'
import { hydrateSessions } from '@/lib/session-display'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'sessions' })
  const years = sessionYearRange()
  return localizedMetadata(
    '/sessions',
    locale as Locale,
    t('meta.title', { years }),
    t('meta.description'),
  )
}

export default async function SessionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('sessions')
  const tSessions = await getTranslations('data.sessions')
  // Les cartes sont generees depuis la fenetre glissante : une saison qui a
  // demarre disparait d'elle-meme, la meme saison de l'annee suivante arrive.
  const sessions = hydrateSessions(getSessions(), tSessions as never)

  const PRICE_FROM_LABEL = `${t('price_from_prefix')} ${MIN_PRICE_PER_ADULT_LABEL}`
  const clubPrice = formatEUR(PRICING_TIERS.club.perAdult[1])
  const trioPrice = formatEUR(PRICING_TIERS.trio.perAdult[1])

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/sessions' },
      ]} />

      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        image="/images/galerie-real/quad-golden-hour.webp"
        /* focus 42% : silhouette sur le quad legerement sous le centre */
        imageFocusY="42%"
        imageAlt={t('hero.image_alt')}
      />

      {/* Audience Switcher : 3 types d'inscription */}
      <AudienceSwitcher withHeader={false} />

      {/* Session officielle : carte mise en avant */}
      <section className="sessions-page-section fx-grid fx-glow fx-mask-a fx-stack-2" aria-labelledby="sessions-list-heading">
        <div className="fx-glow-orb fx-glow-orb--top fx-glow-breathe" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              {t('sessions.label', { years: sessionYearRange(sessions) })}
            </span>
            <h2 id="sessions-list-heading" style={{ scrollMarginTop: '120px' }}>{t('sessions.title')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.8rem', maxWidth: '720px' }}>
              {t('sessions.subtitle')}
            </p>
          </div>
          <div className="sessions-grid">
            {sessions.map((s, i) => (
              <article key={s.id} id={s.id} className="session-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.08}s`, scrollMarginTop: '120px' }}>
                <div className="session-month-bg" aria-hidden="true">{s.month_abbr}</div>
                <div className="session-card-body">
                  <span className="session-season">{s.season_label}</span>
                  <h3 className="session-name">
                    {s.name_line1}<br />{s.name_line2}
                  </h3>
                  <p className="session-dates">{s.dates_full}</p>
                </div>
                <div className="session-meta">
                  <div className="session-meta-item">
                    <span className="session-meta-label">{t('sessions.meta_intensity')}</span>
                    <span className="session-meta-value">{s.intensity}</span>
                  </div>
                  <div className="session-meta-item">
                    <span className="session-meta-label">{t('sessions.meta_duration')}</span>
                    <span className="session-meta-value">{s.duration}</span>
                  </div>
                </div>
                <div className="session-divider" />
                <div className="session-card-footer">
                  <div>
                    <div className="session-price">{PRICE_FROM_LABEL}</div>
                    <div className="session-price-sub">
                      {t('sessions.price_sub', {
                        soloPrice: SOLO_PRICE_1WEEK_LABEL,
                        clubPrice: clubPrice,
                        familyPrice: FAMILY_BASE_1WEEK_LABEL,
                      })}
                    </div>
                  </div>
                  <Link href={`/inscription?type=session&session=${s.id}` as Parameters<typeof Link>[0]['href']} className="session-cta">{t('sessions.cta_apply')}</Link>
                  <div className="session-places-bottom" data-status="open">
                    <PlacesRestantes
                      sessionId={s.id}
                      discipline="lutte"
                      fallbackMax={s.maxCapacity.lutte}
                      variant="badge"
                    />
                    <PlacesRestantes
                      sessionId={s.id}
                      discipline="mma"
                      fallbackMax={s.maxCapacity.mma}
                      variant="badge"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="logi-updated" style={{ marginTop: '2rem', textAlign: 'center' }}>
            {t('sessions.custom_prompt')}{' '}
            <Link href={'/inscription?type=custom' as Parameters<typeof Link>[0]['href']} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
              {t('sessions.custom_link')}
            </Link>
            {t('sessions.custom_suffix')}
          </p>
        </div>
      </section>

      {/* Pricing Table : grille tarifaire publique */}
      <PricingTable />

      {/* Renvoi /le-camp pour le détail "Inclus / Non inclus" */}
      <section className="logi-section fx-grid fx-stack-3b">
        <div className="inner">
          <div className="group-card reveal" style={{ textAlign: 'center' }}>
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('tout_compris.label')}</span>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.9rem)' }}>{t('tout_compris.title')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.8rem', maxWidth: '620px', margin: '0.8rem auto 0' }}>
              {t('tout_compris.body')}
            </p>
            <div style={{ marginTop: '1.4rem' }}>
              <Link href="/le-camp" className="btn-ghost" style={{ fontSize: '0.85rem', padding: '0.6rem 1.4rem' }}>
                {t('tout_compris.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tarif groupe */}
      <section className="sessions-group fx-grid fx-stack-5" aria-labelledby="group-heading">
        <div className="inner">
          <div className="group-card fx-grain fx-corner-glow reveal">
            <h2 id="group-heading">{t('group.title')}</h2>
            <p>{t('group.body', { trioPrice, clubPrice })}</p>
            <img
              src="/images/environment/communal-meal.webp"
              alt={t('group.img_alt')}
              width={800}
              height={343}
              loading="lazy"
              className="group-card-img"
            />
            <div className="group-card-cta">
              <a href="https://wa.me/33666177691" target="_blank" rel="noopener noreferrer" className="btn-primary">
                {t('group.cta_whatsapp')}
              </a>
              <Link href={'/contact?type=clubs' as Parameters<typeof Link>[0]['href']} className="btn-ghost">
                {t('group.cta_quote')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modalites */}
      <section className="sessions-terms fx-texture-basalt fx-glow fx-mask-d fx-stack-6">
        <div className="fx-glow-orb fx-glow-orb--right fx-glow-breathe" />
        <div className="inner">
          <div className="layout-split layout-split--balanced reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
                {t('terms.label')}
              </span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>
                {t('terms.title')}
              </h2>
              <ul className="terms-list">
                {(t.raw('terms.items') as string[]).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link href="/cgv" className="btn-ghost" style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>{t('terms.cta_cgv')}</Link>
                <Link href="/comment-ca-marche" className="btn-ghost" style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>{t('terms.cta_how')}</Link>
              </div>
            </div>
            <div>
              <RefundPolicyTable delayHeader={t('terms.delay_header')} />
            </div>
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/inscription"
        primaryLabel={t('section_cta.primary_label')}
        ghostHref="/faq"
        ghostLabel={t('section_cta.ghost_label')}
      />
    </>
  )
}
