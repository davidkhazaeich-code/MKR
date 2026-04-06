export default function Philosophie() {
  return (
    <section id="philosophie" aria-labelledby="philosophie-heading">
      <div className="inner">
        <div className="bento-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            PHILOSOPHIE
          </span>
          <h2 id="philosophie-heading" className="bento-title">
            POURQUOI<br />LE CAUCASE
          </h2>
          <div className="bento-title-line"></div>
        </div>

        <div className="bento-grid">
          {/* Card 1 -large */}
          <article className="bento-card bento-card--large reveal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bento-img" src="/images/action/sparring-mma-wall.webp" alt="" aria-hidden="true" />
            <span className="bento-card-label">Héritage · Tradition · Combat</span>
            <h3 className="bento-card-title">LÀ OÙ TOUT<br />A COMMENCÉ</h3>
            <p className="bento-card-body">
              Les meilleurs combattants de la planète sortent tous du même endroit. Le Caucase. Khabib, Makhachev, des centaines de champions olympiques de lutte. Ce n&apos;est pas un hasard : les traditions de combat ici se transmettent <strong>de père en fils depuis des siècles</strong>.<br /><br />
              MKR Caucasian Camp te donne accès à cet héritage. Tu t&apos;entraînes dans les mêmes salles, avec les mêmes coachs, selon les mêmes méthodes. Pas en touriste. En athlète qui veut <strong>franchir un cap</strong>.<br /><br />
              Quand tu reviens de ces trois semaines, ta façon de combattre, de t&apos;entraîner et de te voir <strong>n&apos;est plus la même</strong>.
            </p>
          </article>

          {/* Card 2 -small top right */}
          <article className="bento-card bento-card--small reveal" style={{ transitionDelay: '0.1s' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bento-img" src="/images/environment/gym-interior.webp" alt="" aria-hidden="true" />
            <span className="bento-card-label">Coaching · Méthodes · Progression</span>
            <h3 className="bento-card-title">LE MEILLEUR<br />NIVEAU</h3>
            <p className="bento-card-body">
              Sparring quotidien avec des combattants locaux. Drills d&apos;intensité, récupération guidée. Les méthodes qui ont produit des champions du monde <strong>appliquées à ta progression</strong>.
            </p>
          </article>

          {/* Card 3 -small bottom right */}
          <article className="bento-card bento-card--small reveal" style={{ transitionDelay: '0.2s' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bento-img" src="/images/environment/communal-meal.webp" alt="" aria-hidden="true" />
            <span className="bento-card-label">Immersion · Culture · Vie de camp</span>
            <h3 className="bento-card-title">UNE EXPÉRIENCE<br />UNIQUE</h3>
            <p className="bento-card-body">
              Tu vis avec eux, tu manges avec eux. Zéro distraction, zéro confort superflu. Juste l&apos;entraînement, la culture locale, et une <strong>connexion humaine</strong> que tu ne trouveras dans aucun gym en Europe.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
