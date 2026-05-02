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
              Les meilleurs combattants du monde sortent tous du même berceau : le Caucase. Khabib, Makhachev, des centaines de champions olympiques de lutte. Rien d&apos;un hasard. Ici, le combat se transmet <strong>de père en fils depuis des siècles</strong>.<br /><br />
              MKR Caucasian Camp ouvre cet héritage aux athlètes étrangers. Mêmes salles, mêmes coachs, mêmes méthodes. Pas en touriste. En athlète venu <strong>franchir un cap</strong>.<br /><br />
              Au retour de ton camp au Daghestan (de une à trois semaines), tu ne combats plus pareil. Tu ne t&apos;entraînes plus pareil. <strong>Et tu ne te vois plus pareil non plus.</strong>
            </p>
          </article>

          {/* Card 2 -small top right */}
          <article className="bento-card bento-card--small reveal" style={{ transitionDelay: '0.1s' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bento-img" src="/images/environment/gym-interior.webp" alt="" aria-hidden="true" />
            <span className="bento-card-label">Coaching · Méthodes · Progression</span>
            <h3 className="bento-card-title">LA MÉTHODE<br />QUI FORGE</h3>
            <p className="bento-card-body">
              Sparring quotidien avec des combattants locaux. Travail technique, intensité maîtrisée, récupération encadrée. Les méthodes qui ont fabriqué des champions du monde <strong>mises au service de ta progression</strong>.
            </p>
          </article>

          {/* Card 3 -small bottom right */}
          <article className="bento-card bento-card--small reveal" style={{ transitionDelay: '0.2s' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bento-img" src="/images/environment/communal-meal.webp" alt="" aria-hidden="true" />
            <span className="bento-card-label">Immersion · Culture · Vie de camp</span>
            <h3 className="bento-card-title">UNE IMMERSION<br />QUI MARQUE</h3>
            <p className="bento-card-body">
              Tu vis avec eux, tu manges avec eux. Zéro distraction, zéro superflu. Juste l&apos;entraînement, la culture caucasienne, et une <strong>fraternité du tapis</strong> que tu ne croiseras dans aucune salle européenne.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
