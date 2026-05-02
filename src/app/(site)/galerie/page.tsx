import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import GalerieContent from '@/components/GalerieContent'

export const metadata: Metadata = {
  title: 'Galerie photos du camp MMA au Daghestan | MKR Caucasian Camp',
  description: "Photos et vidéos du camp MKR au Caucase. Entraînements, montagnes, coachs, culture. Découvre le camp en images.",
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
        primaryLabel="VIENS CRÉER TES PROPRES SOUVENIRS"
      />
    </>
  )
}
