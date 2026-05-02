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
    id: 'magomed-magomedov',
    firstName: 'Magomed',
    lastName: 'Magomedov',
    discipline: 'Lutte Libre',
    jobTitle: 'Coach Lutte libre',
    bio: "Champion du Daghestan en lutte libre, multiple médaillé aux Jeux du Caucase. 18 ans d'entraînement à Makhachkala. Sa méthode : intensité maximale, précision absolue.",
    bioShort: "Champion du Daghestan en lutte libre, multiple médaillé aux Jeux du Caucase. 18 ans d'entraînement. Formateur équipe junior daghestanaise.",
    image: '/images/coaches/magomed-magomedov.webp',
    knowsAbout: ['Lutte libre', 'Lutte freestyle', 'Combat sports'],
  },
  {
    id: 'khasan-akhmedov',
    firstName: 'Khasan',
    lastName: 'Akhmedov',
    discipline: 'MMA',
    jobTitle: 'Coach MMA',
    bio: 'Vétéran du circuit MMA caucasien, 14 victoires professionnelles. Spécialiste des transitions sol-debout. Formé au Daghestan, enraciné dans la tradition guerrière caucasienne.',
    bioShort: 'Vétéran du circuit MMA caucasien, 14 victoires professionnelles. Spécialiste des transitions sol-debout. 22 combats pro, formateur fighters Eagle FC.',
    image: '/images/coaches/khasan-akhmedov.webp',
    knowsAbout: ['MMA', 'Grappling', 'Striking'],
  },
  {
    id: 'akhmed-bashaev',
    firstName: 'Akhmed',
    lastName: 'Bashaev',
    discipline: 'Boxe',
    jobTitle: 'Coach Boxe',
    bio: "Ex-boxeur professionnel, 22 combats. Aujourd'hui il affûte la précision des poings de la prochaine génération à Makhachkala. Son travail aux mitaines est légendaire dans la région.",
    bioShort: 'Ex-boxeur professionnel, 22 combats. Champion régional de boxe. Spécialiste du travail aux mitaines et des fondamentaux de frappe.',
    image: '/images/coaches/akhmed-bashaev.webp',
    knowsAbout: ['Boxe', 'Striking', 'Kickboxing'],
  },
  {
    id: 'shamil-khalilov',
    firstName: 'Shamil',
    lastName: 'Khalilov',
    discipline: 'Sambo',
    jobTitle: 'Coach Sambo',
    bio: "Maître du Sambo depuis 1998. Projections, soumissions debout et au sol. Il maîtrise les deux dimensions. Héritier de la grande école de Sambo daghestanaise.",
    bioShort: 'Maître du Sambo depuis 1998. Instructeur fédéral. Multiple médaillé Sambo. Spécialiste des projections et soumissions debout et au sol.',
    image: '/images/coaches/shamil-khalilov.webp',
    knowsAbout: ['Sambo sportif', 'Sambo combat', 'Judo'],
  },
]
