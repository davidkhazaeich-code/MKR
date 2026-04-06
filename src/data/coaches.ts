export interface Coach {
  id: string
  firstName: string
  lastName: string
  discipline: string
  jobTitle: string
  bio: string
  bioShort: string
  image: string
  knowsAbout: string[]
}

export const COACHES: Coach[] = [
  {
    id: 'zurab-khabelov',
    firstName: 'Zurab',
    lastName: 'Khabelov',
    discipline: 'Lutte Gréco-romaine',
    jobTitle: 'Coach Lutte gréco-romaine',
    bio: "Champion de Géorgie, 3x médaillé aux championnats d'Europe juniors. 18 ans d'entraînement en salle. Sa méthode : intensité maximale, précision absolue.",
    bioShort: "Champion de Géorgie de lutte gréco-romaine, 3x médaillé aux championnats d'Europe juniors. 18 ans d'entraînement. Formateur équipe olympique junior.",
    image: '/images/coaches/zurab-khabelov.webp',
    knowsAbout: ['Lutte gréco-romaine', 'Lutte libre', 'Combat sports'],
  },
  {
    id: 'giorgi-meladze',
    firstName: 'Giorgi',
    lastName: 'Meladze',
    discipline: 'MMA',
    jobTitle: 'Coach MMA',
    bio: 'Vétéran du circuit MMA caucasien, 14 victoires professionnelles. Spécialiste des transitions sol-debout. Formé en Géorgie, Caucase, enraciné dans la tradition.',
    bioShort: 'Vétéran du circuit MMA caucasien, 14 victoires professionnelles. Spécialiste des transitions sol-debout. 22 combats pro, formateur fighters Eagle FC.',
    image: '/images/coaches/giorgi-meladze.webp',
    knowsAbout: ['MMA', 'Grappling', 'Striking'],
  },
  {
    id: 'tamaz-kvaratskhelia',
    firstName: 'Tamaz',
    lastName: 'Kvaratskhelia',
    discipline: 'Boxe',
    jobTitle: 'Coach Boxe',
    bio: "Ex-boxeur professionnel, 22 combats. Aujourd'hui il affûte la précision des poings de la prochaine génération. Son travail aux mitaines est légendaire dans la région.",
    bioShort: 'Ex-boxeur professionnel, 22 combats. Champion régional de boxe. Spécialiste du travail aux mitaines et des fondamentaux de frappe.',
    image: '/images/coaches/tamaz-kvaratskhelia.webp',
    knowsAbout: ['Boxe', 'Striking', 'Kickboxing'],
  },
  {
    id: 'levan-skhirtladze',
    firstName: 'Levan',
    lastName: 'Skhirtladze',
    discipline: 'Sambo',
    jobTitle: 'Coach Sambo',
    bio: "Maître du Sambo depuis 1998. Projections, soumissions debout et au sol. Il maîtrise les deux dimensions. Héritier de la grande école de Sambo caucasienne.",
    bioShort: 'Maître du Sambo depuis 1998. Instructeur fédéral. Multiple médaillé Sambo. Spécialiste des projections et soumissions debout et au sol.',
    image: '/images/coaches/levan-skhirtladze.webp',
    knowsAbout: ['Sambo sportif', 'Sambo combat', 'Judo'],
  },
]
