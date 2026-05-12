import Link from 'next/link'

const LANDSCAPES = [
  {
    src: '/images/environment/canyon-sulak.webp',
    alt: 'Canyon de Sulak, Daghestan',
    label: 'DAGHESTAN · LUTTE',
    caption: 'Canyon de Sulak',
    text: 'Plus profond que le Grand Canyon. Excursion jour de repos depuis Makhachkala.',
    href: '/destinations/dagestan',
  },
  {
    src: '/images/environment/mosque-grozny.webp',
    alt: 'Mosquée de Grozny, Tchétchénie',
    label: 'TCHÉTCHÉNIE · MMA',
    caption: 'Grozny',
    text: "Capitale de la Tchétchénie, ville moderne et écosystème MMA dense.",
    href: '/destinations/tchetchenie',
  },
  {
    src: '/images/environment/gamsutl-village.webp',
    alt: 'Village perché de Gamsutl, Daghestan',
    label: 'DAGHESTAN · LUTTE',
    caption: 'Gamsutl',
    text: 'Village fantôme perché à 1 500 m. Daghestan ancestral.',
    href: '/destinations/dagestan',
  },
  {
    src: '/images/environment/vainakh-towers.webp',
    alt: 'Tours médiévales vaïnakh dans les montagnes de Tchétchénie',
    label: 'TCHÉTCHÉNIE · MMA',
    caption: 'Tours vaïnakh',
    text: "Forteresses de pierre dressées il y a 800 ans dans les vallées tchétchènes.",
    href: '/destinations/tchetchenie',
  },
  {
    src: '/images/environment/lake-kezenoy.webp',
    alt: 'Lac Kezenoy-Am, frontière entre Daghestan et Tchétchénie',
    label: 'CAUCASE NORD',
    caption: 'Lac Kezenoy-Am',
    text: 'Plus grand lac de haute altitude du Caucase Nord, entre Daghestan et Tchétchénie.',
    href: '/destinations',
  },
]

export default function DestinationShowcase() {
  return (
    <section id="destination-showcase" aria-labelledby="dest-showcase-heading">
      <div className="dest-showcase-glow" aria-hidden="true" />
      <div className="inner">
        <div className="dest-showcase-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            DEUX TERRES DU CAUCASE
          </span>
          <h2 id="dest-showcase-heading" className="dest-showcase-title">
            DAGHESTAN ·<br />TCHÉTCHÉNIE
          </h2>
          <p className="dest-showcase-sub">
            Lutte au Daghestan, MMA en Tchétchénie. Deux destinations frontalières du Caucase russe,
            une discipline par camp. Le combo se vit uniquement en sur-mesure.
          </p>
        </div>

        <div className="dest-showcase-grid">
          {LANDSCAPES.map((img, i) => (
            <Link key={i} href={img.href} className="dest-showcase-card reveal" style={i > 0 ? { transitionDelay: `${i * 0.1}s` } : undefined}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt}
                className="dest-showcase-img"
                loading="lazy"
              />
              <div className="dest-showcase-caption">
                <span className="dest-showcase-caption-label">{img.label}</span>
                <span className="dest-showcase-caption-title">{img.caption}</span>
                <span className="dest-showcase-caption-text">{img.text}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="dest-showcase-footer reveal" style={{ transitionDelay: '0.3s' }}>
          <Link href="/destinations" className="btn-ghost" style={{ fontSize: '0.82rem' }}>
            EXPLORER LES DEUX DESTINATIONS
          </Link>
        </div>
      </div>
    </section>
  )
}
