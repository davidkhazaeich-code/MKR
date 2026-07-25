import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { TESTIMONIALS, hydrateTestimonial } from '@/data/testimonials'

interface DestinationProofProps {
  /** Ids de `data/testimonials.ts`, choisis pour coller a la destination. */
  ids: string[]
  label: string
  title: string
  intro?: string
  /** Lien contextuel vers /temoignages : cette page en recevait zero. */
  ctaLabel: string
  /** Label a11y de la bande scrollable (elle est focusable au clavier). */
  scrollAriaLabel: string
}

/**
 * Preuve sociale sur une page de decision.
 *
 * Constat de l'audit du 2026-07-25 : les temoignages ne sortaient jamais de la
 * home et de /temoignages, alors que la decision se prend ici. Ce bloc en
 * ramene trois, choisis par destination, et donne a /temoignages son premier
 * lien contextuel entrant.
 *
 * Server component : le defilement est du scroll-snap CSS, rien a hydrater.
 */
export default async function DestinationProof({
  ids,
  label,
  title,
  intro,
  ctaLabel,
  scrollAriaLabel,
}: DestinationProofProps) {
  const tData = await getTranslations('data.testimonials')

  const items = ids
    .map(id => TESTIMONIALS.find(item => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map(item => hydrateTestimonial(item, tData as never))

  if (items.length === 0) return null

  return (
    <section className="dproof fx-grid" aria-labelledby="dproof-title">
      <div className="inner">
        <div className="dproof-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            {label}
          </span>
          <h2 id="dproof-title">{title}</h2>
          {intro && <p className="dproof-intro">{intro}</p>}
        </div>

        {/* tabIndex : un conteneur scrollable doit rester atteignable au clavier. */}
        <div
          className="dproof-track reveal"
          role="group"
          aria-label={scrollAriaLabel}
          tabIndex={0}
        >
          {items.map((item, i) => (
            <figure key={item.id} className="dproof-card" style={{ transitionDelay: `${i * 0.06}s` }}>
              <div className="dproof-card-head">
                <Image
                  src={item.img}
                  alt={item.alt}
                  width={72}
                  height={72}
                  sizes="72px"
                  className="dproof-avatar"
                />
                <figcaption className="dproof-id">
                  <span className="dproof-name">{item.name}</span>
                  <span className="dproof-discipline">{item.discipline}</span>
                </figcaption>
              </div>
              <blockquote className="dproof-quote">{item.quote}</blockquote>
            </figure>
          ))}
        </div>

        <div className="dproof-cta reveal">
          <Link href="/temoignages" className="btn-ghost">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
