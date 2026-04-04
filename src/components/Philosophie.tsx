export default function Philosophie() {
  return (
    <section id="philosophie" aria-labelledby="philosophie-heading">
      <div className="inner">
        <div className="bento-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            PHILOSOPHIE
          </span>
          <h2 id="philosophie-heading" className="bento-title">
            LA VOIE<br />DU GUERRIER
          </h2>
          <div className="bento-title-line"></div>
        </div>

        <div className="bento-grid">
          {/* Card 1 — large */}
          <article className="bento-card bento-card--large reveal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bento-img" src="/images/action/sparring-mma-wall.webp" alt="" aria-hidden="true" />
            <span className="bento-card-label">Héritage · Tradition · Combat</span>
            <h3 className="bento-card-title">L&apos;ÂME<br />DU GUERRIER</h3>
            <p className="bento-card-body">
              Le Caucase n&apos;est pas une destination. C&apos;est une <strong>confrontation avec soi-même</strong>. Depuis des siècles, ces montagnes taillent des guerriers dans la roche brute. Les traditions de lutte et de combat du Caucase géorgien sont parmi les plus anciennes et les plus éprouvées du monde.<br /><br />
              MKR Caucasian Camp plonge chaque athlète dans cet héritage millénaire. Tu t&apos;entraînes avec des hommes qui ont grandi dans cette discipline, dans ces salles, sur ces tapis. Pas en touriste. En compétiteur.<br /><br />
              La souffrance est le premier professeur. La discipline, le deuxième. <strong>Le reste est une question de volonté.</strong>
            </p>
          </article>

          {/* Card 2 — small top right */}
          <article className="bento-card bento-card--small reveal" style={{ transitionDelay: '0.1s' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bento-img" src="/images/environment/gym-interior.webp" alt="" aria-hidden="true" />
            <span className="bento-card-label">Méthodes · Protocole</span>
            <h3 className="bento-card-title">MÉTHODES<br />ÉPROUVÉES</h3>
            <p className="bento-card-body">
              Sparring quotidien, drills de haute intensité, récupération guidée. Chaque session est construite sur des décennies de pédagogie martiale caucasienne. Ici, les méthodes ne s&apos;inventent pas. Elles <strong>se transmettent</strong>.
            </p>
          </article>

          {/* Card 3 — small bottom right */}
          <article className="bento-card bento-card--small reveal" style={{ transitionDelay: '0.2s' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bento-img" src="/images/environment/communal-meal.webp" alt="" aria-hidden="true" />
            <span className="bento-card-label">Immersion · Culture · Langue</span>
            <h3 className="bento-card-title">IMMERSION<br />TOTALE</h3>
            <p className="bento-card-body">
              Tu vis avec eux. Tu manges avec eux. Tu apprends leur langue, tu découvres leur culture. L&apos;immersion n&apos;est pas optionnelle : elle est <strong>le cœur du programme</strong>. C&apos;est ce qui transforme un stage en expérience fondatrice.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
