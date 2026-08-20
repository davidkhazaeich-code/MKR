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

/**
 * WhatsApp direct de Ruslan (2026-08-20, remplace l'ancien +33 6 66 17 76 91).
 * SOURCE UNIQUE : tout lien wa.me du site, des emails et du JSON-LD part d'ici.
 * Ne jamais recoder un numero en dur ailleurs.
 *  - `display` : affichage humain (espaces insecables interdits, on garde des espaces simples)
 *  - `e164`    : format telephone/JSON-LD
 *  - `digits`  : format attendu par wa.me (indicatif sans + ni espace)
 */
export const WHATSAPP = {
  display: '+33 7 83 10 96 81',
  e164: '+33783109681',
  digits: '33783109681',
  url: 'https://wa.me/33783109681',
} as const

/**
 * Lien WhatsApp, avec message pre-rempli optionnel (localise cote appelant).
 * Sans argument, renvoie WHATSAPP.url tel quel.
 */
export function whatsappUrl(text?: string): string {
  return text ? `${WHATSAPP.url}?text=${encodeURIComponent(text)}` : WHATSAPP.url
}

export const GEO = {
  latitude: 42.9849,
  longitude: 47.5047,
  country: 'RU',
  region: 'Daghestan',
} as const
