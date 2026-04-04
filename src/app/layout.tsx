import type { Metadata } from 'next'
import { Teko, Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'

const teko = Teko({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-teko',
  display: 'swap',
})

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-barlow',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "MKR Caucasian Camp · Camp d'Entraînement MMA & Lutte au Caucase",
  description:
    "Camp d'entraînement MMA, Lutte et Arts Martiaux au cœur du Caucase, Géorgie. Méthodes d'élite, coaches champions, immersion totale. Rejoignez MKR Caucasian Camp.",
  metadataBase: new URL('https://mkrcaucasiancamp.com'),
  alternates: {
    canonical: 'https://mkrcaucasiancamp.com/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_CH',
    title: "MKR Caucasian Camp · Camp d'Entraînement MMA & Lutte au Caucase",
    description:
      "Camp d'entraînement MMA, Lutte et Arts Martiaux au cœur du Caucase, Géorgie. Méthodes d'élite, coaches champions, immersion totale.",
    url: 'https://mkrcaucasiancamp.com/',
  },
  twitter: {
    card: 'summary_large_image',
    title: "MKR Caucasian Camp · Camp d'Entraînement MMA & Lutte au Caucase",
    description:
      "Camp d'entraînement MMA, Lutte et Arts Martiaux au cœur du Caucase, Géorgie. Méthodes d'élite, coaches champions, immersion totale.",
  },
}

const jsonLdMain = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://mkrcaucasiancamp.com/#organization',
      name: 'MKR Caucasian Camp',
      url: 'https://mkrcaucasiancamp.com/',
      description:
        "Camp d'entraînement MMA, Lutte et Arts Martiaux au coeur du Caucase, Géorgie.",
      telephone: '+41 XX XXX XX XX',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['French', 'English'],
      },
      sameAs: [
        'https://instagram.com/mkrcaucasiancamp',
        'https://facebook.com/mkrcaucasiancamp',
      ],
    },
    {
      '@type': 'SportsActivityLocation',
      '@id': 'https://mkrcaucasiancamp.com/#location',
      name: 'MKR Caucasian Camp',
      description:
        "Camp d'entraînement MMA, Lutte et Sambo au coeur du Caucase, Géorgie.",
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'GE',
        addressRegion: 'Géorgie',
      },
      sport: ['MMA', 'Lutte Gréco-romaine', 'Sambo', 'Boxe'],
    },
    {
      '@type': 'Event',
      name: 'MKR Caucasian Camp · Session Printemps 2026',
      startDate: '2026-04-15',
      endDate: '2026-05-06',
      location: {
        '@type': 'Place',
        name: 'Caucase, Géorgie',
        address: { '@type': 'PostalAddress', addressCountry: 'GE' },
      },
      organizer: { '@id': 'https://mkrcaucasiancamp.com/#organization' },
      offers: {
        '@type': 'Offer',
        price: '2900',
        priceCurrency: 'CHF',
        availability: 'https://schema.org/InStock',
      },
    },
    {
      '@type': 'Event',
      name: "MKR Caucasian Camp · Session Été 2026",
      startDate: '2026-07-08',
      endDate: '2026-07-29',
      location: {
        '@type': 'Place',
        name: 'Caucase, Géorgie',
        address: { '@type': 'PostalAddress', addressCountry: 'GE' },
      },
      organizer: { '@id': 'https://mkrcaucasiancamp.com/#organization' },
      offers: {
        '@type': 'Offer',
        price: '3200',
        priceCurrency: 'CHF',
        availability: 'https://schema.org/InStock',
      },
    },
    {
      '@type': 'Event',
      name: 'MKR Caucasian Camp · Session Automne 2026',
      startDate: '2026-09-16',
      endDate: '2026-10-07',
      location: {
        '@type': 'Place',
        name: 'Caucase, Géorgie',
        address: { '@type': 'PostalAddress', addressCountry: 'GE' },
      },
      organizer: { '@id': 'https://mkrcaucasiancamp.com/#organization' },
      offers: {
        '@type': 'Offer',
        price: '2750',
        priceCurrency: 'CHF',
        availability: 'https://schema.org/LimitedAvailability',
      },
    },
    {
      '@type': 'Person',
      name: 'Zurab Khabelov',
      jobTitle: 'Coach Lutte Gréco-romaine',
      worksFor: { '@id': 'https://mkrcaucasiancamp.com/#organization' },
    },
    {
      '@type': 'Person',
      name: 'Giorgi Meladze',
      jobTitle: 'Coach MMA',
      worksFor: { '@id': 'https://mkrcaucasiancamp.com/#organization' },
    },
    {
      '@type': 'Person',
      name: 'Tamaz Kvaratskhelia',
      jobTitle: 'Coach Boxe',
      worksFor: { '@id': 'https://mkrcaucasiancamp.com/#organization' },
    },
    {
      '@type': 'Person',
      name: 'Levan Skhirtladze',
      jobTitle: 'Coach Sambo',
      worksFor: { '@id': 'https://mkrcaucasiancamp.com/#organization' },
    },
  ],
}

const jsonLdFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Quel niveau est requis pour participer ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Le camp est ouvert aux pratiquants intermédiaires et avancés. Une pratique régulière d'au moins 2 ans en MMA, lutte ou art martial de combat est requise. Le niveau est évalué lors de l'entretien vidéo.",
      },
    },
    {
      '@type': 'Question',
      name: "Le visa est-il nécessaire pour la Géorgie ?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Les ressortissants de l'UE, Suisse, France et Canada n'ont pas besoin de visa pour la Géorgie pour des séjours inférieurs à 365 jours. L'entrée se fait avec le passeport.",
      },
    },
    {
      '@type': 'Question',
      name: "Qu'est-ce qui est inclus dans le prix ?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Le tarif comprend l'hébergement en logement de camp, les repas (3 repas/jour), les séances d'entraînement biquotidiennes, les transferts aéroport-camp, et le suivi préparatoire à distance. Le vol international n'est pas inclus.",
      },
    },
    {
      '@type': 'Question',
      name: "Quelle est la langue d'entraînement ?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Les entraînements se déroulent principalement en géorgien et en russe. Un interprète est présent pour le français et l'anglais. L'immersion linguistique fait partie de l'expérience.",
      },
    },
    {
      '@type': 'Question',
      name: 'Quel équipement dois-je apporter ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Kimono (si tu pratiques la lutte), gants de boxe (16 oz), protège-tibias, protège-dents et coquille. Un guide complet de préparation est envoyé après confirmation de ta candidature.",
      },
    },
    {
      '@type': 'Question',
      name: 'Combien de participants par session ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Maximum 15 participants par session pour garantir un suivi individualisé. Les places sont limitées volontairement. La sélection est réelle.',
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${teko.variable} ${barlow.variable} ${barlowCondensed.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdMain) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
