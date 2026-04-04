export default function Coaches() {
  return (
    <section id="coaches" aria-labelledby="coaches-heading">
      <div className="inner">
        <div className="coaches-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            NOS ENTRAÎNEURS
          </span>
          <h2 id="coaches-heading" className="coaches-title">
            LES MAÎTRES<br />DE LA FORGE
          </h2>
        </div>

        <div className="coaches-grid no-scrollbar">

          {/* Coach 1 */}
          <article className="coach-card reveal">
            <div className="coach-photo-wrap">
              <div className="coach-photo-placeholder" role="img" aria-label="Photo de Zurab Khabelov"></div>
              <div className="coach-photo-overlay" aria-hidden="true"></div>
            </div>
            <div className="coach-info">
              <h3 className="coach-name">ZURAB<br />KHABELOV</h3>
              <p className="coach-discipline">Lutte Gréco-romaine</p>
              <p className="coach-bio">Champion de Géorgie, 3x médaillé aux championnats d&apos;Europe juniors. 18 ans d&apos;entraînement en salle. Sa méthode : brutalité contrôlée, précision absolue.</p>
            </div>
          </article>

          {/* Coach 2 */}
          <article className="coach-card reveal" style={{ transitionDelay: '0.08s' }}>
            <div className="coach-photo-wrap">
              <div className="coach-photo-placeholder" role="img" aria-label="Photo de Giorgi Meladze"></div>
              <div className="coach-photo-overlay" aria-hidden="true"></div>
            </div>
            <div className="coach-info">
              <h3 className="coach-name">GIORGI<br />MELADZE</h3>
              <p className="coach-discipline">MMA</p>
              <p className="coach-bio">Vétéran du circuit MMA caucasien, 14 victoires professionnelles. Spécialiste des transitions sol-debout. Formé en Géorgie, Caucase, enraciné dans la tradition.</p>
            </div>
          </article>

          {/* Coach 3 */}
          <article className="coach-card reveal" style={{ transitionDelay: '0.16s' }}>
            <div className="coach-photo-wrap">
              <div className="coach-photo-placeholder" role="img" aria-label="Photo de Tamaz Kvaratskhelia"></div>
              <div className="coach-photo-overlay" aria-hidden="true"></div>
            </div>
            <div className="coach-info">
              <h3 className="coach-name">TAMAZ<br />KVARATSKHELIA</h3>
              <p className="coach-discipline">Boxe</p>
              <p className="coach-bio">Ex-boxeur professionnel, 22 combats. Aujourd&apos;hui il forge la précision des poings de la prochaine génération. Son travail aux mitaines est légendaire dans la région.</p>
            </div>
          </article>

          {/* Coach 4 */}
          <article className="coach-card reveal" style={{ transitionDelay: '0.24s' }}>
            <div className="coach-photo-wrap">
              <div className="coach-photo-placeholder" role="img" aria-label="Photo de Levan Skhirtladze"></div>
              <div className="coach-photo-overlay" aria-hidden="true"></div>
            </div>
            <div className="coach-info">
              <h3 className="coach-name">LEVAN<br />SKHIRTLADZE</h3>
              <p className="coach-discipline">Sambo</p>
              <p className="coach-bio">Maître du Sambo depuis 1998. Projections, soumissions debout et au sol. Il maîtrise les deux dimensions. Disciple de la tradition martiale soviéto-caucasienne.</p>
            </div>
          </article>

        </div>
      </div>
    </section>
  )
}
