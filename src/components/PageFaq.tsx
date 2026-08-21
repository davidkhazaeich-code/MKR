import Image from 'next/image'
import FAQAccordion, { type FAQItem } from './FAQAccordion'

interface PageFaqProps {
  label: string
  title: string
  items: FAQItem[]
  id: string
  /**
   * Illustration posee A COTE de la liste en desktop (2026-08-21).
   * `.pfaq-list` est bornee a 820px : sur une colonne de 1240px il restait
   * ~420px de vide a droite. Optionnel, et sans lui le rendu est exactement
   * celui d'avant sur les pages qui utilisaient deja ce composant.
   * Masquee sous 1024px : en mobile elle allongerait la page pour rien.
   */
  image?: { src: string; alt: string }
}

/**
 * FAQ de page (objections locales) avec JSON-LD FAQPage.
 * Les questions doivent etre specifiques a la page (pas un copier-coller de /faq)
 * pour rester citables par les moteurs IA sans dupliquer le contenu.
 */
export default function PageFaq({ label, title, items, id, image }: PageFaqProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <section className="pfaq fx-grid" id={id}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="inner">
        <div className="logi-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{label}</span>
          <h2>{title}</h2>
        </div>
        <div className={image ? 'pfaq-grid' : undefined}>
          <div className="pfaq-list reveal">
            <FAQAccordion items={items} id={id} />
          </div>
          {image && (
            <figure className="pfaq-aside reveal" style={{ transitionDelay: '0.1s' }}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 1023px) 0px, 400px"
                className="pfaq-aside-img"
              />
            </figure>
          )}
        </div>
      </div>
    </section>
  )
}
