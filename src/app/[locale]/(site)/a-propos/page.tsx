import { getTranslations, setRequestLocale } from 'next-intl/server'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import SceneBand from '@/components/SceneBand'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'a-propos' })
  return localizedMetadata('/a-propos', locale as Locale, t('meta.title'), t('meta.description'))
}

const PILLAR_KEYS = ['authenticity', 'discipline', 'fraternity', 'transmission'] as const

const PILLAR_ICONS: Record<typeof PILLAR_KEYS[number], React.ReactNode> = {
  authenticity: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-7.5 8-13a8 8 0 1 0-16 0c0 5.5 8 13 8 13z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  discipline: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 1.5" />
      <path d="M9 2h6" />
    </svg>
  ),
  fraternity: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  transmission: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 21v-5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v5" />
      <path d="M12 3v10" />
      <path d="m8 7 4-4 4 4" />
    </svg>
  ),
}

export default async function AProposPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('a-propos')

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
          { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/a-propos' },
        ]}
      />

      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        image="/images/ruslan/heritage/priere-collective-mkr.webp"
        /* focus 40% : groupe en priere : 40% garde la salle et le collectif */
        imageFocusY="40%"
        imageAlt={t('hero.image_alt')}
      />

      {/* L'histoire — editorial 2-col full inner */}
      <section className="logi-section fx-grid fx-stack-1" aria-labelledby="histoire-heading">
        <div className="inner">
          <div className="apropos-history-grid reveal">
            <div className="apropos-history-head">
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.7rem' }}>
                {t('history.label')}
              </span>
              <h2 id="histoire-heading">{t('history.title')}</h2>
              <span className="apropos-history-rule" aria-hidden="true" />
            </div>
            <div className="apropos-history-copy">
              <p>{t('history.p1')}</p>
              <p>{t('history.p2')}</p>
              <p className="apropos-history-quote">{t('history.quote')}</p>
            </div>
          </div>

          {/* Logo MKR — brand seal centre */}
          <div className="reveal apropos-brand-seal" aria-hidden="true">
            <span className="apropos-brand-seal-rule" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-white.webp"
              alt=""
              width={260}
              height={120}
              className="apropos-brand-seal-logo"
              loading="lazy"
            />
            <span className="apropos-brand-seal-rule" />
          </div>
        </div>
      </section>

      {/* Cinematic reveal */}
      <SceneBand
        image="/images/ruslan/heritage/priere-collective-mkr.webp"
        /* focus 40% : groupe en priere */
        focusY="40%"
        alt={t('cinematic.alt')}
        label={t('cinematic.label')}
        title={t('cinematic.title')}
        tagline={t('cinematic.tagline')}
      />

      {/* Mission — quote centree (volontairement compact) */}
      <section className="dag-security fx-texture-concrete fx-glow fx-glow-breathe fx-mask-b fx-stack-2">
        <div className="fx-glow-orb" />
        <div className="inner">
          <div
            className="reveal"
            style={{ maxWidth: '820px', textAlign: 'center', margin: '0 auto' }}
          >
            <p
              style={{
                fontFamily: 'var(--font-teko)',
                fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                fontWeight: 600,
                lineHeight: 1.25,
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              {t('mission.quote')}
            </p>
          </div>
        </div>
      </section>

      {/* NOS PILIERS — 4 cards full inner */}
      <section className="logi-section fx-grid fx-stack-3" aria-labelledby="piliers-heading">
        <div className="inner">
          <div className="apropos-section-head reveal">
            <span className="label-tag">{t('pillars.label')}</span>
            <h2 id="piliers-heading">{t('pillars.title')}</h2>
            <p>{t('pillars.subtitle')}</p>
          </div>
          <div className="reveal apropos-pillars-grid">
            {PILLAR_KEYS.map((key) => (
              <article key={key} className="apropos-pillar">
                <div className="apropos-pillar-icon">{PILLAR_ICONS[key]}</div>
                <h3 className="apropos-pillar-title">{t(`pillars.items.${key}.title`)}</h3>
                <p className="apropos-pillar-body">{t(`pillars.items.${key}.body`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Equipe — Ruslan slider + bio + sub-cards EN FRANCE / SUR PLACE */}
      <section className="logi-section fx-grid fx-stack-4" aria-labelledby="equipe-heading">
        <div className="inner">
          <div className="apropos-section-head reveal">
            <span className="label-tag">{t('team.label')}</span>
            <h2 id="equipe-heading">{t('team.title')}</h2>
            <p>{t('team.subtitle')}</p>
          </div>

          <div className="reveal apropos-split apropos-split--featured">
            <div className="ruslan-portrait-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/ruslan/ruslan-costard-detoure.webp"
                alt={t('team.ruslan_portrait_alt')}
                loading="lazy"
                width={702}
                height={840}
              />
              <span className="ruslan-portrait-card-caption">{t('team.ruslan_portrait_caption')}</span>
            </div>
            <div>
              <span
                className="label-tag"
                style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.55rem' }}
              >
                {t('team.ruslan_label')}
              </span>
              <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>{t('team.ruslan_name')}</h3>
              <p className="coach-ext-bio" style={{ marginBottom: '0.9rem', lineHeight: 1.65 }}>
                {t('team.ruslan_bio_p1_before_strong')}<strong>{t('team.ruslan_bio_p1_strong')}</strong>{t('team.ruslan_bio_p1_after_strong')}
              </p>
              <p className="coach-ext-bio" style={{ marginBottom: '0.9rem', lineHeight: 1.65 }}>
                {t('team.ruslan_bio_p2')}
              </p>
              <p className="coach-ext-bio" style={{ lineHeight: 1.65 }}>
                {t('team.ruslan_bio_p3')}
              </p>
            </div>
          </div>

          {/* Notre force : équipe en France + référents sur place */}
          <div className="reveal apropos-support-grid">
            <div className="content-card fx-grain">
              <span
                className="label-tag"
                style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.55rem' }}
              >
                {t('team.france_label')}
              </span>
              <h3 className="card-title">{t('team.france_title')}</h3>
              <p className="card-body">{t('team.france_body')}</p>
            </div>
            <div className="content-card fx-grain">
              <span
                className="label-tag"
                style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.55rem' }}
              >
                {t('team.onsite_label')}
              </span>
              <h3 className="card-title">{t('team.onsite_title')}</h3>
              <p className="card-body">{t('team.onsite_body')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Galerie parcours Ruslan */}
      <section
        className="logi-section fx-grid fx-stack-5"
        aria-labelledby="ruslan-galerie-heading"
      >
        <div className="inner">
          <div className="apropos-section-head reveal">
            <span className="label-tag">{t('parcours.label')}</span>
            <h2 id="ruslan-galerie-heading">{t('parcours.title')}</h2>
            <p>{t('parcours.subtitle')}</p>
          </div>
          <div className="reveal ruslan-galerie-grid">
            <figure className="ruslan-galerie-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/ruslan/ruslan-championnat-france-takedown.webp"
                alt={t('parcours.takedown_alt')}
                loading="lazy"
                width={1600}
                height={1066}
              />
              <figcaption className="ruslan-galerie-caption">
                {t('parcours.takedown_caption')}
              </figcaption>
            </figure>
            <figure className="ruslan-galerie-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/ruslan/ruslan-championnat-france-ffl.webp"
                alt={t('parcours.ffl_alt')}
                loading="lazy"
                width={1600}
                height={1066}
              />
              <figcaption className="ruslan-galerie-caption">
                {t('parcours.ffl_caption')}
              </figcaption>
            </figure>
            <figure className="ruslan-galerie-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/ruslan/ruslan-lutte-clinch-nb.webp"
                alt={t('parcours.clinch_alt')}
                loading="lazy"
                width={716}
                height={1074}
              />
              <figcaption className="ruslan-galerie-caption">{t('parcours.clinch_caption')}</figcaption>
            </figure>
            <figure className="ruslan-galerie-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/ruslan/ruslan-entrainement-besancon.webp"
                alt={t('parcours.besancon_alt')}
                loading="lazy"
                width={635}
                height={635}
              />
              <figcaption className="ruslan-galerie-caption">{t('parcours.besancon_caption')}</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Partenaire DKDP — David Khazaei */}
      <section
        className="logi-section fx-texture-concrete fx-glow fx-mask-c fx-stack-6"
        aria-labelledby="dkdp-heading"
      >
        <div className="fx-glow-orb" />
        <div className="inner">
          <div className="apropos-section-head reveal">
            <span className="label-tag">{t('dkdp.label')}</span>
            <h2 id="dkdp-heading">{t('dkdp.title')}</h2>
            <p>{t('dkdp.subtitle')}</p>
          </div>
          <div className="reveal apropos-split apropos-split--featured">
            <div className="david-photo-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/team/david-khazaei.webp"
                alt={t('dkdp.david_photo_alt')}
                loading="lazy"
                width={896}
                height={1200}
              />
            </div>
            <div>
              <span
                className="label-tag"
                style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.55rem' }}
              >
                {t('dkdp.david_label')}
              </span>
              <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>{t('dkdp.david_name')}</h3>
              <p className="coach-ext-bio" style={{ marginBottom: '1rem', lineHeight: 1.65 }}>
                {t('dkdp.david_bio_p1_before_link')}
                <a
                  href="https://dkdp.ch"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--primary)',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    fontWeight: 600,
                  }}
                >
                  {t('dkdp.david_bio_p1_link')}
                </a>
                {t('dkdp.david_bio_p1_after_link')}
              </p>
              <p className="coach-ext-bio" style={{ lineHeight: 1.65 }}>
                {t('dkdp.david_bio_p2_before_strong')}<strong>{t('dkdp.david_bio_p2_strong')}</strong>{t('dkdp.david_bio_p2_after_strong')}
              </p>

              {/* Container DKDP : compact, sous le bio, dans la colonne droite */}
              <div className="dkdp-info-card dkdp-info-card--compact" aria-label={t('dkdp.info_aria')}>
                <div className="dkdp-info-head">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="dkdp-info-logo"
                    src="/images/team/dkdp-logo-white.webp"
                    alt={t('dkdp.info_logo_alt')}
                    loading="lazy"
                    width={2180}
                    height={374}
                  />
                  <p className="dkdp-info-tagline">
                    <strong>{t('dkdp.info_tagline_strong')}</strong>{t('dkdp.info_tagline_rest')}
                  </p>
                </div>

                <div className="dkdp-info-grid">
                  <div className="dkdp-info-service">
                    <span className="dkdp-info-service-dot" aria-hidden="true" />
                    <span className="dkdp-info-service-label">{t('dkdp.info_services.web')}</span>
                  </div>
                  <div className="dkdp-info-service">
                    <span className="dkdp-info-service-dot" aria-hidden="true" />
                    <span className="dkdp-info-service-label">{t('dkdp.info_services.seo')}</span>
                  </div>
                  <div className="dkdp-info-service">
                    <span className="dkdp-info-service-dot" aria-hidden="true" />
                    <span className="dkdp-info-service-label">{t('dkdp.info_services.ai')}</span>
                  </div>
                  <div className="dkdp-info-service">
                    <span className="dkdp-info-service-dot" aria-hidden="true" />
                    <span className="dkdp-info-service-label">{t('dkdp.info_services.training')}</span>
                  </div>
                </div>

                <div className="dkdp-info-foot">
                  <div className="dkdp-info-stats">
                    <div>
                      <span className="dkdp-info-stat-num">{t('dkdp.info_stats.clients_num')}</span>
                      <span className="dkdp-info-stat-label">{t('dkdp.info_stats.clients_label')}</span>
                    </div>
                    <div>
                      <span className="dkdp-info-stat-num">{t('dkdp.info_stats.experience_num')}</span>
                      <span className="dkdp-info-stat-label">{t('dkdp.info_stats.experience_label')}</span>
                    </div>
                  </div>
                  <a
                    className="dkdp-info-cta"
                    href="https://dkdp.ch"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{t('dkdp.info_cta')}</span>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/sessions"
        primaryLabel={t('section_cta.primary_label')}
        ghostHref="/contact"
        ghostLabel={t('section_cta.ghost_label')}
      />
    </>
  )
}
