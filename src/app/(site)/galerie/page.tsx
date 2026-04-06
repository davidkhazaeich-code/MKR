import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import GalerieContent from '@/components/GalerieContent'

export const metadata: Metadata = {
  title: 'Galerie | MKR Caucasian Camp | Photos du camp MMA au Caucase',
  description: "Photos et videos du camp MKR au Caucase. Entrainements, montagnes, coachs, culture. Decouvre le camp en images.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/galerie' },
}

export default function GaleriePage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcaucasiancamp.com/' },
        { name: 'Galerie', url: 'https://mkrcaucasiancamp.com/galerie' },
      ]} />

      <PageHero
        label="GALERIE"
        title="LE CAMP EN IMAGES"
        compact
      />

      <GalerieContent />

      <SectionCTA
        primaryHref="/sessions"
        primaryLabel="VIENS CREER TES PROPRES SOUVENIRS"
      />
    </>
  )
}
