import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import FAQTabs from '@/components/FAQTabs'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: 'FAQ | MKR Caucasian Camp | Questions Frequentes',
  description: "Toutes les reponses a vos questions : securite, visa, niveau requis, prix, equipement, inscription. FAQ complete.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/faq' },
}

export default function FAQPage() {
  return (
    <>
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
