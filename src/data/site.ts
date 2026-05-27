export const SITE_URL = 'https://mkrcamp.com'
export const SITE_NAME = 'MKR Caucasian Camp'
export const SITE_EMAIL = 'contact@mkrcamp.com'

// FR fallback ; les traductions vivent dans messages/fr/meta.json (meta.site.description)
// et messages/en/meta.json (T13). Server Components qui ont besoin de la version
// localisée doivent appeler getTranslations('meta.site'). Cette constante reste
// utilisée par les fichiers statiques (sitemap, robots, fallback dev) qui n'ont
// pas accès au contexte de requête next-intl.
export const SITE_DESCRIPTION =
  "Camps d'entraînement MMA et Lutte au cœur du Caucase. Lutte adultes et enfants au Daghestan, MMA en Tchétchénie. Une discipline par camp. Immersion 1 à 3 semaines, encadrement local."

// FR fallback ; traductions dans messages/fr/meta.json (meta.site.slogan)
export const SITE_SLOGAN = "L'immersion au milieu des champions"

export const SOCIALS = {
  instagram: 'https://instagram.com/mkrcamp',
} as const

export const GEO = {
  latitude: 42.9849,
  longitude: 47.5047,
  country: 'RU',
  region: 'Daghestan',
} as const
