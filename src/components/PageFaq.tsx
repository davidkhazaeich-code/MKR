import FAQAccordion, { type FAQItem } from './FAQAccordion'

interface PageFaqProps {
  label: string
  title: string
  items: FAQItem[]
  id: string
}

/**
 * FAQ de page (objections locales) avec JSON-LD FAQPage.
 * Les questions doivent etre specifiques a la page (pas un copier-coller de /faq)
 * pour rester citables par les moteurs IA sans dupliquer le contenu.
 */
export default function PageFaq({ label, title, items, id }: PageFaqProps) {
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
        <div className="pfaq-list reveal">
          <FAQAccordion items={items} id={id} />
        </div>
      </div>
    </section>
  )
}
