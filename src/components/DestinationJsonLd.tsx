interface Attraction {
  name: string
  description: string
}

interface DestinationJsonLdProps {
  name: string
  description: string
  /** URL canonique de la page (deja localisee par l'appelant). */
  url: string
  image: string
  addressRegion: string
  addressCountry: string
  latitude: number
  longitude: number
  /** Les excursions de la page, publiees en TouristAttraction. */
  attractions?: Attraction[]
  /** Langue de la page, pour ne pas declarer du francais sur /en. */
  inLanguage: string
}

/**
 * TouristDestination pour les pages /destinations/*.
 *
 * Ces pages decrivent un lieu et ses attractions, mais n'emettaient qu'un
 * BreadcrumbList et une FAQPage : rien ne disait a Google ni aux moteurs IA
 * de quel endroit on parle. Les excursions deja presentes dans le corps de la
 * page sont reprises ici en `includesAttraction`, sans inventer de donnee.
 */
export default function DestinationJsonLd({
  name,
  description,
  url,
  image,
  addressRegion,
  addressCountry,
  latitude,
  longitude,
  attractions = [],
  inLanguage,
}: DestinationJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name,
    description,
    url,
    image,
    inLanguage,
    address: {
      '@type': 'PostalAddress',
      addressRegion,
      addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude,
      longitude,
    },
    ...(attractions.length > 0 && {
      includesAttraction: attractions.map(attraction => ({
        '@type': 'TouristAttraction',
        name: attraction.name,
        description: attraction.description,
      })),
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
