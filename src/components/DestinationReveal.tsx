import Image from 'next/image'

interface DestinationRevealProps {
  image: string
  alt: string
  label: string
  title: string
  facts: { label: string; value: string }[]
  badges?: string[]
}

/**
 * En-tete de destination : bande photo a hauteur bornee + bandeau de chiffres.
 *
 * Avant le 2026-07-25, ce bloc mesurait `calc(1400px + 100vh)` et immobilisait
 * l'image en sticky, soit environ 2,6 viewports de scroll a 1440x900 pour UNE
 * photo, sur /destinations/dagestan qui est la meilleure page SEO du site.
 * C'est exactement le comportement que David voulait supprimer.
 *
 * La version actuelle garde le meme contrat de props (drop-in) et le meme
 * contenu (label, titre, chiffres, badges) mais tient dans environ 0,6 viewport.
 * Les chiffres passent SOUS la photo, ou ils sont plus lisibles qu'en
 * surimpression, et le composant redevient un server component : plus de hook
 * de scroll, donc plus aucun JS client pour ce bloc.
 */
export default function DestinationReveal({ image, alt, label, title, facts, badges }: DestinationRevealProps) {
  return (
    <section className="dest-head" data-scroll-section data-scroll-label={label}>
      <div className="dest-head-frame reveal">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="100vw"
          className="dest-head-img"
          priority
        />
        <div className="dest-head-scrim" aria-hidden="true" />
        <div className="dest-head-caption">
          <span className="label-tag dest-head-label">{label}</span>
          <h2 className="dest-head-title" dangerouslySetInnerHTML={{ __html: title }} />
        </div>
      </div>

      <div className="inner">
        <div className="dest-head-facts reveal">
          {facts.map((f, i) => (
            <div key={i} className="dest-head-fact">
              <span className="dest-head-fact-value">{f.value}</span>
              <span className="dest-head-fact-label">{f.label}</span>
            </div>
          ))}
        </div>

        {badges && badges.length > 0 && (
          <div className="dest-head-badges reveal">
            {badges.map((b, i) => (
              <span key={i} className="voyage-badge">{b}</span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
