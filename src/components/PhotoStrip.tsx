import Image from 'next/image'

export interface PhotoStripItem {
  src: string
  alt: string
  /** Legende editoriale affichee sous la photo (contenu indexable, pas decoratif). */
  caption?: string
  /** Position verticale du recadrage (« 50% » par defaut). Cadre 4/5 ou 4/3. */
  focusY?: string
}

interface PhotoStripProps {
  items: PhotoStripItem[]
  label?: string
  title?: string
  intro?: string
  /** Label a11y du conteneur scrollable (obligatoire : la bande est focusable au clavier). */
  scrollAriaLabel: string
  /**
   * grid   : colonnes egales en desktop (planche contact, 4 a 6 photos).
   * mosaic : premiere photo en grand format (2x2), les autres autour (5 a 7 photos).
   */
  variant?: 'grid' | 'mosaic'
  className?: string
}

/**
 * Bande de photos reelles : bandeau scroll-snap horizontal en mobile (le geste
 * natif du telephone, aucun JS), grille en desktop.
 *
 * Remplace l'ancien parti pris "une seule image plein ecran en sticky"
 * (CinematicReveal, 2,1 viewports de scroll pour UNE photo). Ici, 4 a 7 photos
 * pour environ 0,5 viewport, avec des legendes indexables.
 *
 * Server component : le scroll-snap est 100% CSS, rien a hydrater.
 */
export default function PhotoStrip({
  items,
  label,
  title,
  intro,
  scrollAriaLabel,
  variant = 'grid',
  className,
}: PhotoStripProps) {
  if (items.length === 0) return null
  const hasHeader = Boolean(label || title || intro)

  // Nombre de colonnes desktop calcule pour ne JAMAIS laisser une photo
  // orpheline sur la derniere ligne. `auto-fit` donnait 5 colonnes a 1440px
  // pour 6 photos, soit une rangee de 5 puis une seule photo perdue en dessous.
  const columns = items.length <= 5 ? items.length : items.length % 3 === 0 ? 3 : 4

  return (
    <section className={`pstrip-photos${className ? ` ${className}` : ''}`}>
      <div className="inner">
        {hasHeader && (
          <div className="pstrip-photos-header reveal">
            {label && (
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
                {label}
              </span>
            )}
            {title && <h2>{title}</h2>}
            {intro && <p className="pstrip-photos-intro">{intro}</p>}
          </div>
        )}

        {/* tabIndex : un conteneur scrollable doit rester atteignable au clavier. */}
        <div
          className={`pstrip-photos-track pstrip-photos-track--${variant} reveal`}
          style={{ '--pstrip-cols': columns } as React.CSSProperties}
          role="group"
          aria-label={scrollAriaLabel}
          tabIndex={0}
        >
          {items.map((item, i) => (
            <figure key={item.src} className="pstrip-photo" style={{ transitionDelay: `${Math.min(i, 5) * 0.05}s` }}>
              <div className="pstrip-photo-media">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 700px) 78vw, (max-width: 1100px) 45vw, 30vw"
                  className="pstrip-photo-img"
                  style={item.focusY ? { objectPosition: `center ${item.focusY}` } : undefined}
                />
              </div>
              {item.caption && <figcaption className="pstrip-photo-caption">{item.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
