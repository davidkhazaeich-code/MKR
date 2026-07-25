import Breadcrumb from './Breadcrumb'

interface PageHeroProps {
  label: string
  title: string
  subtitle?: string
  breadcrumb?: { href: string; label: string }[]
  compact?: boolean
  image?: string
  imageAlt?: string
  /**
   * Position verticale du recadrage, en pourcentage (« 35% » par defaut).
   * Le cadre du hero est court et large : `object-fit: cover` sacrifie donc
   * beaucoup de hauteur, et la valeur par defaut coupait les visages sur
   * plusieurs photos (mesure du 2026-07-25). A regler PAR IMAGE.
   */
  imageFocusY?: string
}

export default function PageHero({ label, title, subtitle, breadcrumb, compact, image, imageAlt, imageFocusY }: PageHeroProps) {
  const hasImage = Boolean(image)
  return (
    <section
      className={`page-hero${compact ? ' page-hero--compact' : ''}${hasImage ? ' page-hero--image' : ''}`}
      data-scroll-section
      data-scroll-label={label}
    >
      {hasImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={imageAlt || ''}
            className="page-hero-bg"
            style={imageFocusY ? { objectPosition: `center ${imageFocusY}` } : undefined}
            aria-hidden={imageAlt ? undefined : true}
          />
          <div className="page-hero-overlay" aria-hidden="true" />
        </>
      )}
      <div className="inner reveal">
        {breadcrumb && <Breadcrumb items={breadcrumb} />}
        {/* La couleur etait posee en style INLINE, donc impossible a surcharger
            en CSS : sur les hero illustres, l'eyebrow rust restait a 1,4-2,8:1
            sur la photo. Passe en classe pour que `.page-hero--image` puisse
            lui donner la variante claire et une ombre portee. */}
        <span className="label-tag page-hero-eyebrow">{label}</span>
        <h1 dangerouslySetInnerHTML={{ __html: title }} />
        {subtitle && <p className="hero-sub">{subtitle}</p>}
      </div>
    </section>
  )
}
