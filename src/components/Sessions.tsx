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

          {/* Session Printemps */}
          <article className="session-card reveal">
            <div className="session-month-bg" aria-hidden="true">AVR</div>
            <div className="session-card-body">
              <span className="session-season">Session Printemps · Avril 2026</span>
              <h3 className="session-name">PRINTEMPS<br />GÉORGIEN</h3>
              <p className="session-dates">15 AVRIL · 6 MAI 2026</p>
            </div>
            <div className="session-meta">
              <div className="session-meta-item">
                <span className="session-meta-label">Intensité</span>
                <span className="session-meta-value">Élevée</span>
              </div>
              <div className="session-meta-item">
                <span className="session-meta-label">Places</span>
                <span className="session-meta-value">14 max.</span>
              </div>
              <div className="session-meta-item">
                <span className="session-meta-label">Durée</span>
                <span className="session-meta-value">3 semaines</span>
              </div>
            </div>
            <div className="session-divider"></div>
            <div className="session-card-footer">
              <div>
                <div className="session-price">2 900 CHF</div>
                <div className="session-price-sub">Hébergement &amp; repas inclus · Vol non inclus</div>
              </div>
              <a href="#contact" className="session-cta">RÉSERVER</a>
            </div>
          </article>

          {/* Session Été */}
          <article className="session-card reveal" style={{ transitionDelay: '0.12s' }}>
            <div className="session-month-bg" aria-hidden="true">JUL</div>
            <div className="session-card-body">
              <span className="session-season">Session Été · Juillet 2026</span>
              <h3 className="session-name">FORGE<br />D&apos;ÉTÉ</h3>
              <p className="session-dates">8 JUILLET · 29 JUILLET 2026</p>
            </div>
            <div className="session-meta">
              <div className="session-meta-item">
                <span className="session-meta-label">Intensité</span>
                <span className="session-meta-value">Maximale</span>
              </div>
              <div className="session-meta-item">
                <span className="session-meta-label">Places</span>
                <span className="session-meta-value">12 max.</span>
              </div>
              <div className="session-meta-item">
                <span className="session-meta-label">Durée</span>
                <span className="session-meta-value">3 semaines</span>
              </div>
            </div>
            <div className="session-divider"></div>
            <div className="session-card-footer">
              <div>
                <div className="session-price">3 200 CHF</div>
                <div className="session-price-sub">Hébergement &amp; repas inclus · Vol non inclus</div>
              </div>
              <a href="#contact" className="session-cta">RÉSERVER</a>
            </div>
          </article>

          {/* Session Automne */}
          <article className="session-card reveal" style={{ transitionDelay: '0.24s' }}>
            <div className="session-month-bg" aria-hidden="true">SEP</div>
            <div className="session-card-body">
              <span className="session-season">Session Automne · Septembre 2026</span>
              <h3 className="session-name">SOMMET<br />D&apos;AUTOMNE</h3>
              <p className="session-dates">16 SEPT · 7 OCTOBRE 2026</p>
            </div>
            <div className="session-meta">
              <div className="session-meta-item">
                <span className="session-meta-label">Intensité</span>
                <span className="session-meta-value">Élevée</span>
              </div>
              <div className="session-meta-item">
                <span className="session-meta-label">Places</span>
                <span className="session-meta-value">10 restantes</span>
              </div>
              <div className="session-meta-item">
                <span className="session-meta-label">Durée</span>
                <span className="session-meta-value">3 semaines</span>
              </div>
            </div>
            <div className="session-divider"></div>
            <div className="session-card-footer">
              <div>
                <div className="session-price">2 750 CHF</div>
                <div className="session-price-sub">Hébergement &amp; repas inclus · Vol non inclus</div>
              </div>
              <a href="#contact" className="session-cta">RÉSERVER</a>
            </div>
          </article>

        </div>
      </div>
    </section>
  )
}
