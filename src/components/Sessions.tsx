import Link from 'next/link'
import { SESSIONS, formatPriceFrom } from '@/data/sessions'
import PlacesRestantes from '@/components/PlacesRestantes'

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
            Une session par saison, calée sur les vacances scolaires francophones (France, Suisse romande, Belgique).
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
                      fallbackMax={session.maxCapacity}
                      variant="compact"
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
                  <div className="session-price-sub">Tarif adulte selon durée (1 500 € / 1 sem · 2 200 € / 2 sem · 2 900 € / 3 sem). Hébergement, 2 repas/jour, vol Istanbul-Makhachkala inclus.</div>
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
