import Link from 'next/link'
import { SESSIONS, formatPriceFrom } from '@/data/sessions'
import PlacesRestantes from '@/components/PlacesRestantes'
import { DUO_ONE_LINE_BARE, FAMILY_BASE_1WEEK_LABEL } from '@/lib/pricing-copy'

export default function Sessions() {
  return (
    <section id="sessions" aria-labelledby="sessions-heading">
      <div className="inner">
        <div className="sessions-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            CALENDRIER 2026 / 2027
          </span>
          <h2 id="sessions-heading" className="sessions-title">
            LES 4<br />SESSIONS
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.8rem', maxWidth: '640px' }}>
            Une session par saison, calée sur les vacances scolaires francophones (France, Suisse romande, Belgique). Lutte au Daghestan ou MMA en Tchétchénie selon la discipline choisie à l&apos;inscription.
          </p>
        </div>

        <div className="sessions-grid">
          {SESSIONS.map((session, i) => (
            <article key={session.id} className="session-card reveal" style={i > 0 ? { transitionDelay: `${i * 0.12}s` } : undefined}>
              <div className="session-month-bg" aria-hidden="true">{session.monthAbbr}</div>
              <div className="session-card-body">
                <span className="session-season">{session.seasonLabel}</span>
                <h3 className="session-name">
                  {session.name.includes(' ')
                    ? <>{session.name.split(' ')[0]}<br />{session.name.split(' ').slice(1).join(' ')}</>
                    : session.name}
                </h3>
                <p className="session-dates">{session.datesFull}</p>
              </div>
              <div className="session-meta">
                <div className="session-meta-item">
                  <span className="session-meta-label">Intensité</span>
                  <span className="session-meta-value">{session.intensity}</span>
                </div>
                <div className="session-meta-item">
                  <span className="session-meta-label">Places</span>
                  <span className="session-meta-value">
                    <PlacesRestantes
                      sessionId={session.id}
                      variant="dual"
                    />
                  </span>
                </div>
                <div className="session-meta-item">
                  <span className="session-meta-label">Durée</span>
                  <span className="session-meta-value">{session.duration}</span>
                </div>
              </div>
              <div className="session-divider"></div>
              <div className="session-card-footer">
                <div>
                  <div className="session-price">{formatPriceFrom(session)}</div>
                  <div className="session-price-sub">Tarif Solo / Duo : {DUO_ONE_LINE_BARE} par adulte. Dégressif dès 3 personnes. Forfait Famille (1P+1E) à partir de {FAMILY_BASE_1WEEK_LABEL}. Visa russe, vol intérieur Istanbul → Makhachkala ou Grozny, transferts, hébergement et 2 repas/jour inclus. Vol international à charge.</div>
                </div>
                <Link href={`/inscription?type=session&session=${session.id}`} className="session-cta">POSTULER</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
