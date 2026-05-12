export interface Testimonial {
  img: string
  alt: string
  name: string
  discipline: string
  quote: string
  video?: string
  videoPoster?: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    img: '/images/galerie-real/antoine-petit-jean.webp',
    alt: 'Antoine Petit-Jean - MMA, Genève',
    name: 'Antoine Petit-Jean',
    discipline: 'MMA · Genève',
    quote: "Avant MKR, je plafonnais sur mes patterns. Trois semaines au Daghestan ont fait sauter le verrou. Le niveau te tire vers le haut, chaque session te force à chercher plus loin. On dort bien, on mange bien, et sur le tapis c'est plein régime du matin au soir. Mon MMA d'avant et celui d'aujourd'hui, ce sont deux athlètes différents.",
    video: '/videos/testimonials/antoine-testimonie.mp4',
    videoPoster: '/videos/testimonials/antoine-poster.jpg',
  },
  {
    img: '/images/testimonials/lamp-w.webp',
    alt: 'LAMP - MMA professionnel, à Makhachkala avec un combattant daghestanais',
    name: 'LAMP',
    discipline: 'MMA pro · Session Daghestan',
    quote: "Je suis arrivé compétiteur, je repars professionnel. Le camp m'a fait passer un palier que je n'aurais jamais atteint en Europe. Tu t'entraînes côte à côte avec des gars qui vivent le combat à un autre niveau, et ça te tire vers le haut, chaque session.",
    video: '/videos/testimonials/lamp-testimonie.mp4',
    videoPoster: '/videos/testimonials/lamp-poster.jpg',
  },
  {
    img: '/images/testimonials/mehdi-r.webp',
    alt: 'Mehdi R. - Lutte Libre, Paris',
    name: 'Mehdi R.',
    discipline: 'Lutte Libre · Paris',
    quote: "Trois semaines qui ont changé ma façon de me battre. La dureté des entraînements m'a obligé à aller chercher ce que je n'avais jamais touché.",
  },
  {
    img: '/images/testimonials/karim-d.webp',
    alt: 'Karim D. - MMA, Genève',
    name: 'Karim D.',
    discipline: 'MMA · Genève',
    quote: "Le niveau des coachs est rare. Magomed t'apprend des prises que tu ne verras nulle part en Europe. J'y retourne l'année prochaine.",
  },
  {
    img: '/images/testimonials/thomas-b.webp',
    alt: 'Thomas B. - Boxe, Lyon',
    name: 'Thomas B.',
    discipline: 'Boxe · Lyon',
    quote: "Deux semaines après le retour, j'ai remporté mon premier titre régional. Ce que j'ai construit là-bas, aucun gym en France ne pouvait me donner.",
  },
  {
    img: '/images/testimonials/yassine-k.webp',
    alt: 'Yassine K. - Grappling, Bruxelles',
    name: 'Yassine K.',
    discipline: 'Grappling · Bruxelles',
    quote: "Un mois de camp qui vaut deux ans de salle. Les Daghestanais t'apprennent à souffrir avec le sourire. Je suis revenu transformé.",
  },
  {
    img: '/images/testimonials/romain-v.webp',
    alt: 'Romain V. - Sambo, Toulouse',
    name: 'Romain V.',
    discipline: 'Sambo · Toulouse',
    quote: "Je suis parti seul, sans parler russe. L'accueil est chaleureux. Sur le tapis, le niveau est brutal, exactement ce que je cherchais.",
  },
  {
    img: '/images/testimonials/adam-s.webp',
    alt: 'Adam S. - Lutte, Montréal',
    name: 'Adam S.',
    discipline: 'Lutte · Montréal',
    quote: "Le Caucase, c'est une autre planète. Les entraînements du matin à 6h t'apprennent ce que c'est que la discipline. Je repars l'été prochain.",
  },
  {
    img: '/images/testimonials/lucas-m.webp',
    alt: 'Lucas M. - MMA, Zurich',
    name: 'Lucas M.',
    discipline: 'MMA · Zurich',
    quote: "Trois semaines, six kilos de transpiration et une vision du combat totalement différente. Ce camp m'a redonné faim de compétition.",
  },
  {
    img: '/images/testimonials/amine-b.webp',
    alt: 'Amine B. - Jiu-Jitsu, Lyon',
    name: 'Amine B.',
    discipline: 'Jiu-Jitsu · Lyon',
    quote: "Les coachs du camp connaissent des techniques que tu ne trouveras dans aucun livre. Une expérience sportive et humaine que je conseille à tout compétiteur.",
  },
  {
    img: '/images/testimonials/pierre-l.webp',
    alt: 'Pierre L. - Kickboxing, Nantes',
    name: 'Pierre L.',
    discipline: 'Kickboxing · Nantes',
    quote: "Le groupe, l'ambiance, les montagnes en fond de tapis... On touche quelque chose de rare. Revenu avec une médaille et des souvenirs pour la vie.",
  },
]
