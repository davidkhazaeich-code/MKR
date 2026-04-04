import Link from 'next/link'
import { SESSIONS, formatPrice } from '@/data/sessions'

export default function Sessions() {
  return (
    <section id="sessions" aria-labelledby="sessions-heading">
      <div className="inner">
        <div className="sessions-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            PROGRAMME 2026
          </span>
          <h2 id="sessions-heading" className="sessions-title">
            LES<br />SESSIONS
          </h2>
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
                  <span className="session-meta-value">{session.maxCapacity} max.</span>
                </div>
                <div className="session-meta-item">
                  <span className="session-meta-label">Durée</span>
                  <span className="session-meta-value">{session.duration}</span>
                </div>
              </div>
              <div className="session-divider"></div>
              <div className="session-card-footer">
                <div>
                  <div className="session-price">{formatPrice(session)}</div>
                  <div className="session-price-sub">Hébergement &amp; repas inclus · Vol non inclus</div>
                </div>
                <Link href="/inscription" className="session-cta">POSTULER</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
