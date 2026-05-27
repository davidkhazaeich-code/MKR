import { buildMetadata } from '@/lib/seo'
import PageHero from '@/components/PageHero'
import FAQTabs from '@/components/FAQTabs'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import { getAllFaqItems } from '@/data/faq'

export const metadata = buildMetadata({
  title: 'FAQ Camp MMA Daghestan | MKR Caucasian Camp',
  description: "Toutes les réponses à tes questions : sécurité, visa Russie, niveau requis, prix, équipement, inscription. FAQ complète du camp MKR.",
  path: '/faq',
})
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
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'FAQ', url: 'https://mkrcamp.com/faq' },
      ]} />

      <PageHero
        label="FAQ"
        title="QUESTIONS FRÉQUENTES"
        subtitle="Tout ce que tu dois savoir avant de postuler."
      />
      <FAQTabs />
      <SectionCTA
        primaryHref="/sessions"
        primaryLabel="VOIR LES SESSIONS"
        ghostHref="/contact"
        ghostLabel="PAS TROUVÉ TA RÉPONSE ?"
      />
    </>
  )
}
