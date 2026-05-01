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
    bio: "Champion du Daghestan en lutte libre, multiple medaille aux Jeux du Caucase. 18 ans d'entrainement a Makhachkala. Sa methode : intensite maximale, precision absolue.",
    bioShort: "Champion du Daghestan en lutte libre, multiple medaille aux Jeux du Caucase. 18 ans d'entrainement. Formateur equipe junior daghestanaise.",
    image: '/images/coaches/magomed-magomedov.webp',
    knowsAbout: ['Lutte libre', 'Lutte freestyle', 'Combat sports'],
  },
  {
    id: 'khasan-akhmedov',
    firstName: 'Khasan',
    lastName: 'Akhmedov',
    discipline: 'MMA',
    jobTitle: 'Coach MMA',
    bio: 'Veteran du circuit MMA caucasien, 14 victoires professionnelles. Specialiste des transitions sol-debout. Forme au Daghestan, enracine dans la tradition guerriere caucasienne.',
    bioShort: 'Veteran du circuit MMA caucasien, 14 victoires professionnelles. Specialiste des transitions sol-debout. 22 combats pro, formateur fighters Eagle FC.',
    image: '/images/coaches/khasan-akhmedov.webp',
    knowsAbout: ['MMA', 'Grappling', 'Striking'],
  },
  {
    id: 'akhmed-bashaev',
    firstName: 'Akhmed',
    lastName: 'Bashaev',
    discipline: 'Boxe',
    jobTitle: 'Coach Boxe',
    bio: "Ex-boxeur professionnel, 22 combats. Aujourd'hui il affute la precision des poings de la prochaine generation a Makhachkala. Son travail aux mitaines est legendaire dans la region.",
    bioShort: 'Ex-boxeur professionnel, 22 combats. Champion regional de boxe. Specialiste du travail aux mitaines et des fondamentaux de frappe.',
    image: '/images/coaches/akhmed-bashaev.webp',
    knowsAbout: ['Boxe', 'Striking', 'Kickboxing'],
  },
  {
    id: 'shamil-khalilov',
    firstName: 'Shamil',
    lastName: 'Khalilov',
    discipline: 'Sambo',
    jobTitle: 'Coach Sambo',
    bio: "Maitre du Sambo depuis 1998. Projections, soumissions debout et au sol. Il maitrise les deux dimensions. Heritier de la grande ecole de Sambo daghestanaise.",
    bioShort: 'Maitre du Sambo depuis 1998. Instructeur federal. Multiple medaille Sambo. Specialiste des projections et soumissions debout et au sol.',
    image: '/images/coaches/shamil-khalilov.webp',
    knowsAbout: ['Sambo sportif', 'Sambo combat', 'Judo'],
  },
]
