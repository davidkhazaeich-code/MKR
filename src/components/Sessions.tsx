import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { getSessions, sessionYearRange } from '@/data/sessions'
import { hydrateSessions } from '@/lib/session-display'
import PlacesRestantes from '@/components/PlacesRestantes'
import { DUO_ONE_LINE_BARE, FAMILY_BASE_1WEEK_LABEL, MIN_PRICE_PER_ADULT_LABEL } from '@/lib/pricing-copy'

export default function Sessions() {
  const t = useTranslations('home.sessions')
  const tData = useTranslations('data.sessions')
  // Fenetre glissante : la saison qui vient de demarrer sort d'elle-meme,
  // celle de l'annee suivante entre a sa place.
  const sessions = hydrateSessions(getSessions(), tData as never)
  const priceFrom = `${tData('price_from_prefix')} ${MIN_PRICE_PER_ADULT_LABEL}`
  return (
    <section id="sessions" aria-labelledby="sessions-heading">
      <div className="inner">
        <div className="sessions-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            {t('label', { years: sessionYearRange(sessions) })}
          </span>
          <h2 id="sessions-heading" className="sessions-title">
            {t('title_line1')}<br />{t('title_line2')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.8rem', maxWidth: '640px' }}>
            {t('subtitle')}
          </p>
        </div>

        <div className="sessions-grid">
          {sessions.map((session, i) => {
            return (
              <article key={session.id} className="session-card reveal" style={i > 0 ? { transitionDelay: `${i * 0.12}s` } : undefined}>
                <div className="session-month-bg" aria-hidden="true">{session.month_abbr}</div>
                <div className="session-card-body">
                  <span className="session-season">{session.season_label}</span>
                  <h3 className="session-name">
                    {session.name_line1}{session.name_line2 && <><br />{session.name_line2}</>}
                  </h3>
                  <p className="session-dates">{session.dates_full}</p>
                </div>
                <div className="session-meta">
                  <div className="session-meta-item">
                    <span className="session-meta-label">{t('meta_intensity')}</span>
                    <span className="session-meta-value">{session.intensity}</span>
                  </div>
                  <div className="session-meta-item">
                    <span className="session-meta-label">{t('meta_places')}</span>
                    <span className="session-meta-value">
                      <PlacesRestantes
                        sessionId={session.id}
                        variant="dual"
                      />
                    </span>
                  </div>
                  <div className="session-meta-item">
                    <span className="session-meta-label">{t('meta_duration')}</span>
                    <span className="session-meta-value">{session.duration}</span>
                  </div>
                </div>
                <div className="session-divider"></div>
                <div className="session-card-footer">
                  <div>
                    <div className="session-price">{priceFrom}</div>
                    <div className="session-price-sub">{t('price_sub_prefix')}{DUO_ONE_LINE_BARE}{t('price_sub_middle')}{FAMILY_BASE_1WEEK_LABEL}{t('price_sub_suffix')}</div>
                  </div>
                  <Link href={`/inscription?type=session&session=${session.id}` as Parameters<typeof Link>[0]['href']} className="session-cta">{t('card_cta')}</Link>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
