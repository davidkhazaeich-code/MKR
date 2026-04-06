import { COACHES } from '@/data/coaches'

export default function Coaches() {
  return (
    <section id="coaches" aria-labelledby="coaches-heading">
      <div className="coaches-glow" aria-hidden="true" />
      <div className="inner">
        <div className="coaches-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            NOS ENTRAÎNEURS
          </span>
          <h2 id="coaches-heading" className="coaches-title">
            TES<br />COACHS
          </h2>
        </div>

        <div className="coaches-grid no-scrollbar">
          {COACHES.map((coach, i) => (
            <article key={coach.id} className="coach-card reveal" style={i > 0 ? { transitionDelay: `${i * 0.08}s` } : undefined}>
              <div className="coach-photo-wrap reveal-clip">
                <div
                  className="coach-photo-placeholder"
                  role="img"
                  aria-label={`Photo de ${coach.firstName} ${coach.lastName}`}
                  style={{ backgroundImage: `url('${coach.image}')` }}
                ></div>
                <div className="coach-photo-overlay" aria-hidden="true"></div>
              </div>
              <div className="coach-info">
                <h3 className="coach-name">{coach.firstName.toUpperCase()}<br />{coach.lastName.toUpperCase()}</h3>
                <p className="coach-discipline">{coach.discipline}</p>
                <p className="coach-bio">{coach.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
