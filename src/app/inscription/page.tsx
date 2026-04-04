import type { Metadata } from 'next'
import InscriptionLayout from '@/components/InscriptionLayout'

export const metadata: Metadata = {
  title: "Inscription · MKR Caucasian Camp",
  description:
    "Dépose ta candidature pour rejoindre le camp d'entraînement MMA & Lutte au Caucase. Formulaire en 5 étapes, places limitées à 15 athlètes par session.",
  alternates: {
    canonical: 'https://mkrcaucasiancamp.com/inscription',
  },
}

export default function InscriptionPage() {
  return <InscriptionLayout />
}
