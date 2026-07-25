import Image from 'next/image'

interface SceneBandProps {
  image: string
  alt: string
  label?: string
  title?: string
  tagline?: string
  /** priority : uniquement si la bande est au-dessus de la ligne de flottaison. */
  priority?: boolean
  className?: string
}

/**
 * Bande d'ambiance pleine largeur, hauteur bornee.
 *
 * Remplace CinematicReveal, qui immobilisait l'image en `position: sticky` sur
 * 1900px de scroll a 1440x900 (2,1 viewports pour UNE photo, mesure du
 * 2026-07-25). Ici la bande coute au maximum 46vh : on garde le moment
 * cinematographique, on rend le scroll a la page.
 *
 * Le titre est un <h2> reel (contenu, pas decoration) : ces bandes portaient
 * deja de la copy indexable dans CinematicReveal, mais en <h3> orphelin.
 */
export default function SceneBand({ image, alt, label, title, tagline, priority, className }: SceneBandProps) {
  const hasContent = Boolean(label || title || tagline)

  return (
    <section className={`scene-band${className ? ` ${className}` : ''}`} data-scroll-section data-scroll-label={label}>
      <div className="scene-band-frame reveal">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="100vw"
          className="scene-band-img"
          priority={priority}
        />
        <div className="scene-band-scrim" aria-hidden="true" />
        {hasContent && (
          <div className="scene-band-content">
            {label && <span className="label-tag scene-band-label">{label}</span>}
            {title && <h2 className="scene-band-title" dangerouslySetInnerHTML={{ __html: title }} />}
            {tagline && <p className="scene-band-tagline">{tagline}</p>}
          </div>
        )}
      </div>
    </section>
  )
}
