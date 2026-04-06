import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import FAQTabs from '@/components/FAQTabs'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import { getAllFaqItems } from '@/data/faq'

export const metadata: Metadata = {
  title: 'FAQ | MKR Caucasian Camp | Questions Frequentes',
  description: "Toutes les reponses a vos questions : securite, visa, niveau requis, prix, equipement, inscription. FAQ complete.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/faq' },
}

const allFaqItems = getAllFaqItems()
const jsonLdFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: allFaqItems.map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
}

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcaucasiancamp.com/' },
        { name: 'FAQ', url: 'https://mkrcaucasiancamp.com/faq' },
      ]} />

      <PageHero
        label="FAQ"
        title="QUESTIONS FREQUENTES"
        subtitle="Tout ce que tu dois savoir avant de postuler."
      />
      <FAQTabs />
      <SectionCTA
        primaryHref="/sessions"
        primaryLabel="VOIR LES SESSIONS"
        ghostHref="/contact"
        ghostLabel="PAS TROUVE TA REPONSE ?"
      />
    </>
  )
}
