import type { Metadata } from 'next'
import { Teko, Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'

const teko = Teko({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-teko',
  display: 'swap',
})

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal'],
  variable: '--font-barlow',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
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
    images: [
      {
        url: 'https://mkrcaucasiancamp.com/images/social/og-image.webp',
        width: 1200,
        height: 630,
        alt: "MKR Caucasian Camp - Camp d'entrainement MMA & Lutte au Caucase",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "MKR Caucasian Camp · Camp d'Entraînement MMA & Lutte au Caucase",
    description:
      "Camp d'entraînement MMA, Lutte et Arts Martiaux au cœur du Caucase, Géorgie. Méthodes d'élite, coaches champions, immersion totale.",
    images: ['https://mkrcaucasiancamp.com/images/social/og-image.webp'],
  },
}

/* ==========================================================================
   STRUCTURED DATA — JSON-LD
   ==========================================================================
   All schema blocks are defined here in the root layout so they appear on
   every page. Page-specific schema (BreadcrumbList, Article, etc.) should
   be added in the corresponding page.tsx files.
   ========================================================================== */

// ---------------------------------------------------------------------------
// 1. WebSite — enables sitelinks search box in Google
// ---------------------------------------------------------------------------
const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://mkrcaucasiancamp.com/#website',
  name: 'MKR Caucasian Camp',
  url: 'https://mkrcaucasiancamp.com/',
  description:
    "Camp d'entraînement MMA, Lutte et Arts Martiaux au cœur du Caucase, Géorgie.",
  inLanguage: 'fr',
  publisher: {
    '@id': 'https://mkrcaucasiancamp.com/#organization',
  },
}

// ---------------------------------------------------------------------------
// 2. Main @graph — Organization, SportsActivityLocation, Events, Persons,
//    AggregateRating
// ---------------------------------------------------------------------------
const jsonLdMain = {
  '@context': 'https://schema.org',
  '@graph': [
    // ----- Organization -----
    {
      '@type': 'Organization',
      '@id': 'https://mkrcaucasiancamp.com/#organization',
      name: 'MKR Caucasian Camp',
      url: 'https://mkrcaucasiancamp.com/',
      logo: {
        '@type': 'ImageObject',
        url: 'https://mkrcaucasiancamp.com/images/logo-mkr.png',
        width: 512,
        height: 512,
      },
      image: 'https://mkrcaucasiancamp.com/images/og-image.jpg',
      description:
        "Camp d'entraînement MMA, Lutte et Arts Martiaux au cœur du Caucase, Géorgie. Méthodes d'élite, coaches champions, immersion totale.",
      email: 'contact@mkrcaucasiancamp.com',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'contact@mkrcaucasiancamp.com',
        availableLanguage: ['French', 'English'],
      },
      sameAs: [
        'https://instagram.com/mkr.caucasiancamp',
        'https://facebook.com/mkrcaucasiancamp',
        'https://youtube.com/@mkrcaucasiancamp',
      ],
      foundingDate: '2018',
      areaServed: {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: 42.2679,
          longitude: 43.3569,
        },
        geoRadius: '500 km',
      },
      knowsAbout: [
        'MMA',
        'Lutte gréco-romaine',
        'Sambo',
        'Boxe',
        'Arts martiaux',
        'Camp d\'entraînement',
      ],
    },

    // ----- SportsActivityLocation -----
    {
      '@type': 'SportsActivityLocation',
      '@id': 'https://mkrcaucasiancamp.com/#location',
      name: 'MKR Caucasian Camp',
      url: 'https://mkrcaucasiancamp.com/le-camp',
      description:
        "Camp d'entraînement MMA, Lutte et Sambo au cœur du Caucase, Géorgie. Salles d'entraînement avec tapis olympiques, cage MMA et équipement de frappe.",
      image: 'https://mkrcaucasiancamp.com/images/environment/gym-interior.webp',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'GE',
        addressRegion: 'Géorgie',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 42.2679,
        longitude: 43.3569,
      },
      sport: ['MMA', 'Lutte gréco-romaine', 'Sambo', 'Boxe'],
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        opens: '06:00',
        closes: '21:00',
      },
      amenityFeature: [
        {
          '@type': 'LocationFeatureSpecification',
          name: 'Hébergement inclus',
          value: true,
        },
        {
          '@type': 'LocationFeatureSpecification',
          name: '3 repas/jour',
          value: true,
        },
        {
          '@type': 'LocationFeatureSpecification',
          name: 'Transfert aéroport',
          value: true,
        },
      ],
    },

    // ----- Event: Session Printemps 2026 -----
    {
      '@type': 'Event',
      '@id': 'https://mkrcaucasiancamp.com/#event-printemps-2026',
      name: 'MKR Caucasian Camp - Session Printemps 2026',
      description:
        "Camp d'entraînement intensif de 3 semaines en MMA et lutte au Caucase. Coaching d'élite, hébergement et repas inclus. Maximum 14 participants.",
      startDate: '2026-04-15',
      endDate: '2026-05-06',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: {
        '@type': 'Place',
        name: 'MKR Caucasian Camp, Géorgie',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'GE',
          addressRegion: 'Géorgie',
        },
      },
      image: 'https://mkrcaucasiancamp.com/images/og-image.jpg',
      url: 'https://mkrcaucasiancamp.com/sessions',
      organizer: {
        '@id': 'https://mkrcaucasiancamp.com/#organization',
      },
      performer: [
        { '@id': 'https://mkrcaucasiancamp.com/#person-zurab-khabelov' },
        { '@id': 'https://mkrcaucasiancamp.com/#person-giorgi-meladze' },
        { '@id': 'https://mkrcaucasiancamp.com/#person-tamaz-kvaratskhelia' },
        { '@id': 'https://mkrcaucasiancamp.com/#person-levan-skhirtladze' },
      ],
      offers: {
        '@type': 'Offer',
        name: 'Session Printemps 2026',
        price: '2900',
        priceCurrency: 'CHF',
        availability: 'https://schema.org/InStock',
        url: 'https://mkrcaucasiancamp.com/inscription',
        validFrom: '2025-12-01',
      },
      maximumAttendeeCapacity: 14,
      inLanguage: ['fr', 'en'],
    },

    // ----- Event: Session Ete 2026 -----
    {
      '@type': 'Event',
      '@id': 'https://mkrcaucasiancamp.com/#event-ete-2026',
      name: 'MKR Caucasian Camp - Session Ete 2026',
      description:
        "Session intensive d'été de 3 semaines. MMA et lutte au Caucase. Intensité maximale. Coaching d'élite, hébergement et repas inclus. Maximum 12 participants.",
      startDate: '2026-07-08',
      endDate: '2026-07-29',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: {
        '@type': 'Place',
        name: 'MKR Caucasian Camp, Géorgie',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'GE',
          addressRegion: 'Géorgie',
        },
      },
      image: 'https://mkrcaucasiancamp.com/images/og-image.jpg',
      url: 'https://mkrcaucasiancamp.com/sessions',
      organizer: {
        '@id': 'https://mkrcaucasiancamp.com/#organization',
      },
      performer: [
        { '@id': 'https://mkrcaucasiancamp.com/#person-zurab-khabelov' },
        { '@id': 'https://mkrcaucasiancamp.com/#person-giorgi-meladze' },
        { '@id': 'https://mkrcaucasiancamp.com/#person-tamaz-kvaratskhelia' },
        { '@id': 'https://mkrcaucasiancamp.com/#person-levan-skhirtladze' },
      ],
      offers: {
        '@type': 'Offer',
        name: 'Session Ete 2026',
        price: '3200',
        priceCurrency: 'CHF',
        availability: 'https://schema.org/InStock',
        url: 'https://mkrcaucasiancamp.com/inscription',
        validFrom: '2025-12-01',
      },
      maximumAttendeeCapacity: 12,
      inLanguage: ['fr', 'en'],
    },

    // ----- Event: Session Automne 2026 -----
    {
      '@type': 'Event',
      '@id': 'https://mkrcaucasiancamp.com/#event-automne-2026',
      name: 'MKR Caucasian Camp - Session Automne 2026',
      description:
        "Session d'automne de 3 semaines au Caucase. MMA et lutte. Coaching d'élite, hébergement et repas inclus. Maximum 15 participants, places limitées.",
      startDate: '2026-09-16',
      endDate: '2026-10-07',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: {
        '@type': 'Place',
        name: 'MKR Caucasian Camp, Géorgie',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'GE',
          addressRegion: 'Géorgie',
        },
      },
      image: 'https://mkrcaucasiancamp.com/images/og-image.jpg',
      url: 'https://mkrcaucasiancamp.com/sessions',
      organizer: {
        '@id': 'https://mkrcaucasiancamp.com/#organization',
      },
      performer: [
        { '@id': 'https://mkrcaucasiancamp.com/#person-zurab-khabelov' },
        { '@id': 'https://mkrcaucasiancamp.com/#person-giorgi-meladze' },
        { '@id': 'https://mkrcaucasiancamp.com/#person-tamaz-kvaratskhelia' },
        { '@id': 'https://mkrcaucasiancamp.com/#person-levan-skhirtladze' },
      ],
      offers: {
        '@type': 'Offer',
        name: 'Session Automne 2026',
        price: '2750',
        priceCurrency: 'CHF',
        availability: 'https://schema.org/LimitedAvailability',
        url: 'https://mkrcaucasiancamp.com/inscription',
        validFrom: '2025-12-01',
      },
      maximumAttendeeCapacity: 15,
      inLanguage: ['fr', 'en'],
    },

    // ----- Person: Zurab Khabelov -----
    {
      '@type': 'Person',
      '@id': 'https://mkrcaucasiancamp.com/#person-zurab-khabelov',
      name: 'Zurab Khabelov',
      jobTitle: 'Coach Lutte gréco-romaine',
      description:
        "Champion de Géorgie de lutte gréco-romaine, 3x médaillé aux championnats d'Europe juniors. 18 ans d'entraînement. Formateur équipe olympique junior.",
      image: 'https://mkrcaucasiancamp.com/images/coaches/zurab-khabelov.webp',
      url: 'https://mkrcaucasiancamp.com/coachs',
      worksFor: {
        '@id': 'https://mkrcaucasiancamp.com/#organization',
      },
      knowsAbout: ['Lutte gréco-romaine', 'Lutte libre', 'Combat sports'],
    },

    // ----- Person: Giorgi Meladze -----
    {
      '@type': 'Person',
      '@id': 'https://mkrcaucasiancamp.com/#person-giorgi-meladze',
      name: 'Giorgi Meladze',
      jobTitle: 'Coach MMA',
      description:
        'Vétéran du circuit MMA caucasien, 14 victoires professionnelles. Spécialiste des transitions sol-debout. 22 combats pro, formateur fighters Eagle FC.',
      image: 'https://mkrcaucasiancamp.com/images/coaches/giorgi-meladze.webp',
      url: 'https://mkrcaucasiancamp.com/coachs',
      worksFor: {
        '@id': 'https://mkrcaucasiancamp.com/#organization',
      },
      knowsAbout: ['MMA', 'Grappling', 'Striking'],
    },

    // ----- Person: Tamaz Kvaratskhelia -----
    {
      '@type': 'Person',
      '@id': 'https://mkrcaucasiancamp.com/#person-tamaz-kvaratskhelia',
      name: 'Tamaz Kvaratskhelia',
      jobTitle: 'Coach Boxe',
      description:
        'Ex-boxeur professionnel, 22 combats. Champion régional de boxe. Spécialiste du travail aux mitaines et des fondamentaux de frappe.',
      image:
        'https://mkrcaucasiancamp.com/images/coaches/tamaz-kvaratskhelia.webp',
      url: 'https://mkrcaucasiancamp.com/coachs',
      worksFor: {
        '@id': 'https://mkrcaucasiancamp.com/#organization',
      },
      knowsAbout: ['Boxe', 'Striking', 'Kickboxing'],
    },

    // ----- Person: Levan Skhirtladze -----
    {
      '@type': 'Person',
      '@id': 'https://mkrcaucasiancamp.com/#person-levan-skhirtladze',
      name: 'Levan Skhirtladze',
      jobTitle: 'Coach Sambo',
      description:
        'Maître du Sambo depuis 1998. Instructeur fédéral. Multiple médaillé Sambo. Spécialiste des projections et soumissions debout et au sol.',
      image:
        'https://mkrcaucasiancamp.com/images/coaches/levan-skhirtladze.webp',
      url: 'https://mkrcaucasiancamp.com/coachs',
      worksFor: {
        '@id': 'https://mkrcaucasiancamp.com/#organization',
      },
      knowsAbout: ['Sambo sportif', 'Sambo combat', 'Judo'],
    },

    // ----- AggregateRating -----
    {
      '@type': 'SportsActivityLocation',
      '@id': 'https://mkrcaucasiancamp.com/#location-rated',
      name: 'MKR Caucasian Camp',
      url: 'https://mkrcaucasiancamp.com/temoignages',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5',
        bestRating: '5',
        worstRating: '1',
        ratingCount: '9',
        reviewCount: '9',
      },
    },
  ],
}

// ---------------------------------------------------------------------------
// 3. FAQPage — kept for AI/LLM citation value (commercial site; Google rich
//    results restricted since Aug 2023, but still indexable and beneficial
//    for GEO/AI discoverability)
// ---------------------------------------------------------------------------
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
      name: 'Le visa est-il nécessaire pour la Géorgie ?',
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
    {
      '@type': 'Question',
      name: 'Est-ce que le Dagestan est sûr ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "La région où se déroule le camp est stable et fréquentée par des athlètes du monde entier. Nous suivons en permanence les recommandations du Quai d'Orsay et du DFAE. Un protocole de sécurité MKR est en place : contacts d'urgence 24/7, assurance rapatriement recommandée, équipe locale présente en permanence.",
      },
    },
    {
      '@type': 'Question',
      name: "Comment fonctionne le processus d'inscription ?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "1. Tu remplis le formulaire en ligne (5 minutes). 2. On te rappelle sous 48h pour un entretien de validation. 3. Si ta candidature est acceptée, tu verses un acompte de 30%. 4. Tu reçois le guide de préparation. 5. Le solde est dû 30 jours avant le départ.",
      },
    },
    {
      '@type': 'Question',
      name: 'Puis-je annuler après inscription ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Oui. Annulation gratuite jusqu'à 60 jours avant le départ (remboursement 100%). Entre 30 et 60 jours : remboursement 50%. Moins de 30 jours : non remboursable. Détail complet dans nos CGV.",
      },
    },
  ],
}

// ---------------------------------------------------------------------------
// 4. Review markup — individual reviews supporting the AggregateRating
// ---------------------------------------------------------------------------
const jsonLdReviews = {
  '@context': 'https://schema.org',
  '@type': 'SportsActivityLocation',
  name: 'MKR Caucasian Camp',
  url: 'https://mkrcaucasiancamp.com/',
  review: [
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Mehdi R.' },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      reviewBody:
        "Trois semaines qui ont changé ma façon de me battre. La dureté des entraînements m'a obligé à aller chercher ce que je n'avais jamais touché.",
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Karim D.' },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      reviewBody:
        "Le niveau des coachs est inégalable. Zurab t'apprend des prises que tu ne verras nulle part en Europe. J'y retourne l'année prochaine.",
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Thomas B.' },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      reviewBody:
        "Deux semaines après le retour, j'ai remporté mon premier titre régional. Ce que j'ai construit là-bas, aucun gym en France ne pouvait me donner.",
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Yassine K.' },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      reviewBody:
        "Un mois de camp qui vaut deux ans de salle. Les Dagestanais t'apprennent à souffrir avec le sourire. Je suis revenu transformé.",
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Romain V.' },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      reviewBody:
        "Je suis parti seul, sans parler russe. L'accueil est incroyable. Sur le tapis, le niveau est brutal. Exactement ce que je cherchais.",
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Adam S.' },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      reviewBody:
        "Le Caucase, c'est une autre planète. Les entraînements du matin à 6h t'apprennent ce que c'est que la discipline. Je repars l'été prochain.",
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Lucas M.' },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      reviewBody:
        "Trois semaines, six kilos de transpiration et une vision du combat totalement différente. Ce camp m'a redonné faim de compétition.",
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Amine B.' },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      reviewBody:
        "Les coachs du camp connaissent des techniques que tu ne trouveras dans aucun livre. Une expérience sportive et humaine que je conseille à tout compétiteur.",
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Pierre L.' },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      reviewBody:
        "Le groupe, l'ambiance, les montagnes en fond de tapis. On touche quelque chose de rare. Revenu avec une médaille et des souvenirs pour la vie.",
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdMain) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdReviews) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
