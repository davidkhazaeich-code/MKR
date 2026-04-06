import Link from 'next/link'

const LANDSCAPES = [
  {
    src: '/images/environment/canyon-sulak.webp',
    alt: 'Canyon de Sulak, Dagestan',
    label: 'DAGESTAN',
    caption: 'Canyon de Sulak',
    text: 'Plus profond que le Grand Canyon. Excursion jour de repos.',
  },
  {
    src: '/images/environment/lake-kezenoy.webp',
    alt: 'Lac Kezenoy-Am, Caucase',
    label: 'TCHETCHENIE',
    caption: 'Lac Kezenoy-Am',
    text: 'Plus grand lac de montagne du Caucase Nord.',
  },
  {
    src: '/images/environment/mountain-road.webp',
    alt: 'Route de montagne dans le Caucase georgien',
    label: 'GEORGIE',
    caption: 'Route du Caucase',
    text: 'Les routes qui menent au camp traversent les plus beaux paysages.',
  },
  {
    src: '/images/environment/gamsutl-village.webp',
    alt: 'Village perche de Gamsutl, Dagestan',
    label: 'DAGESTAN',
    caption: 'Gamsutl',
    text: 'Village fantome perche a 1 500 m. Dagestan ancestral.',
  },
]

export default function DestinationShowcase() {
  return (
    <section id="destination-showcase" aria-labelledby="dest-showcase-heading">
      <div className="dest-showcase-glow" aria-hidden="true" />
      <div className="inner">
        <div className="dest-showcase-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            LE CAUCASE
          </span>
          <h2 id="dest-showcase-heading" className="dest-showcase-title">
            UN LIEU<br />HORS DU TEMPS
          </h2>
          <p className="dest-showcase-sub">
            Entre les montagnes les plus sauvages d&apos;Europe et des traditions millénaires,
            le Caucase offre un cadre d&apos;entraînement qu&apos;aucune salle au monde ne peut reproduire.
          </p>
        </div>

        <div className="dest-showcase-grid">
          {LANDSCAPES.map((img, i) => (
            <figure key={i} className="dest-showcase-card reveal" style={i > 0 ? { transitionDelay: `${i * 0.1}s` } : undefined}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt}
                className="dest-showcase-img"
                loading="lazy"
              />
              <figcaption className="dest-showcase-caption">
                <span className="dest-showcase-caption-label">{img.label}</span>
                <span className="dest-showcase-caption-title">{img.caption}</span>
                <span className="dest-showcase-caption-text">{img.text}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="dest-showcase-footer reveal" style={{ transitionDelay: '0.3s' }}>
          <Link href="/destinations" className="btn-ghost" style={{ fontSize: '0.82rem' }}>
            EXPLORER LES DESTINATIONS
          </Link>
        </div>
      </div>
    </section>
  )
}
