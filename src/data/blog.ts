/**
 * Source unique des articles de blog MKR Caucasian Camp.
 * Lu par /blog (liste) et /blog/[slug] (article individuel).
 *
 * Pour ajouter un article : ajouter une entrée dans BLOG_POSTS + l'ajouter
 * à `BLOG_SLUGS` dans `app/sitemap.ts` pour qu'il apparaisse dans le sitemap.
 */

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  dateISO: string
  readTime: string
  category: string
  featured?: boolean
  img: string
  content: string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'pourquoi-le-dagestan-domine-le-mma',
    title: 'Pourquoi le Daghestan domine le MMA mondial',
    excerpt: "Analyse des méthodes d'entraînement, de la culture et du système qui produit les meilleurs fighters de la planète.",
    date: '15 mars 2026',
    dateISO: '2026-03-15',
    readTime: '8 min',
    category: 'Culture',
    featured: true,
    img: '/images/blog/dagestan-mma.webp',
    content: `
    <p>Le Daghestan, petite république du Caucase russe, a produit plus de champions de combat par habitant que n'importe quel autre endroit sur Terre. Ce n'est pas un hasard.</p>

    <h2>UNE CULTURE DU COMBAT</h2>
    <p>Dans les villages de montagne du Daghestan, la lutte n'est pas un sport. C'est un rite de passage. Dès l'âge de 5-6 ans, les garçons sont inscrits dans les salles locales. La compétition commence tôt, et seuls les plus déterminés progressent.</p>

    <blockquote><p>La différence entre un athlète occidental et un athlète daghestanais, c'est que le Daghestanais s'entraîne comme s'il se battait pour sa vie. Parce que historiquement, c'était le cas.</p></blockquote>

    <h2>LE SYSTÈME D'ENTRAÎNEMENT</h2>
    <p>Le système d'entraînement daghestanais repose sur trois piliers : la répétition, le sparring réel, et la compétition permanente. Pas de simulation, pas de drills vides. Chaque session est une mise en situation réelle.</p>

    <h3>LA RÉPÉTITION</h3>
    <p>Une technique n'est considérée comme acquise qu'après des milliers de répétitions. Les coachs locaux ne passent à la suite que lorsque le geste est devenu un réflexe.</p>

    <h3>LE SPARRING RÉEL</h3>
    <p>Au Daghestan, le sparring n'est pas un exercice de style. C'est un combat contrôlé mais intense. Les partenaires ne font pas semblant, et c'est cette intensité qui forge des combattants capables de gérer la pression en compétition.</p>

    <h2>CE QUE MKR T'APPORTE</h2>
    <p>Le camp MKR te donne accès à ces méthodes. Pendant 1 à 3 semaines (selon ton choix), tu t'entraînes avec les mêmes coachs, dans les mêmes salles, avec les mêmes méthodes qui ont produit les champions. C'est un raccourci que tu ne trouveras nulle part ailleurs.</p>
  `,
  },
  {
    slug: 'preparer-son-premier-camp',
    title: 'Comment préparer son premier camp au Caucase',
    excerpt: "Guide pratique : condition physique, équipement, mindset. Tout ce qu'il faut savoir avant de partir.",
    date: '28 février 2026',
    dateISO: '2026-02-28',
    readTime: '6 min',
    category: 'Préparation',
    img: '/images/blog/prep-camp.webp',
    content: `
    <p>Tu as réservé ta place pour un camp MKR. Maintenant, il faut te préparer. Voici le guide complet pour arriver dans les meilleures conditions.</p>

    <h2>CONDITION PHYSIQUE</h2>
    <p>6 semaines avant le départ, commence un programme spécifique : cardio haute intensité (HIIT), gainage fonctionnel, course à intervalles. L'objectif : tenir 2 sessions par jour pendant toute la durée de ton camp (1, 2 ou 3 semaines au choix).</p>

    <h2>ÉQUIPEMENT</h2>
    <p>Gants de MMA (4oz et 16oz), protège-tibias, protège-dents, coquille. Rashguard et short de grappling. Chaussures de lutte optionnelles mais recommandées.</p>

    <h2>MINDSET</h2>
    <p>Viens avec l'humilité d'un débutant, même si tu as 10 ans de pratique. Le niveau au Caucase est différent. Accepte de te faire dominer les premiers jours. C'est là que l'apprentissage commence.</p>
  `,
  },
  {
    slug: 'lutte-daghestanaise-guide-complet',
    title: 'La lutte daghestanaise : guide complet',
    excerpt: "Techniques, histoire et philosophie de la lutte au Daghestan. Pourquoi ces méthodes sont supérieures.",
    date: '10 février 2026',
    dateISO: '2026-02-10',
    readTime: '10 min',
    category: 'Technique',
    img: '/images/blog/lutte-guide.webp',
    content: `
    <p>La lutte au Daghestan n'est pas simplement un sport. C'est une institution culturelle, un système éducatif et une voie de vie. Ce guide explore les méthodes, l'histoire et la philosophie de la lutte daghestanaise.</p>

    <h2>L'HISTOIRE</h2>
    <p>La lutte au Daghestan remonte à des siècles. Chaque village possédait sa propre tradition de combat. Les tournois inter-villages étaient des événements majeurs, et le meilleur lutteur du village était respecté comme un héros.</p>

    <h2>LES MÉTHODES</h2>
    <p>L'entraînement daghestanais met l'accent sur le sparring réel dès les premières années. Les jeunes lutteurs affrontent des partenaires plus expérimentés quotidiennement. Cette exposition constante à des niveaux supérieurs accélère la progression.</p>

    <h2>POURQUOI CES MÉTHODES FONCTIONNENT</h2>
    <p>Le volume d'entraînement, la qualité des partenaires de sparring, et la culture de compétition permanente créent un environnement où seuls les plus adaptés progressent. C'est la sélection naturelle appliquée au sport de combat.</p>
  `,
  },
  {
    slug: 'securite-dagestan-2026',
    title: 'Sécurité au Daghestan en 2026 : la réalité du terrain',
    excerpt: "État des lieux factuel. Ce que disent les autorités, ce que vivent les athlètes sur place.",
    date: '25 janvier 2026',
    dateISO: '2026-01-25',
    readTime: '7 min',
    category: 'Logistique',
    img: '/images/blog/securite-dagestan.webp',
    content: `
    <p>La question de la sécurité au Daghestan revient systématiquement. Voici un état des lieux factuel, basé sur notre expérience sur le terrain depuis 2018.</p>

    <h2>LA SITUATION ACTUELLE</h2>
    <p>Les zones urbaines où se déroulent nos camps (Makhachkala, Kaspiysk) sont stables et fréquentées par des athlètes internationaux. Le tourisme sportif est en croissance depuis plusieurs années.</p>

    <h2>LE PROTOCOLE MKR</h2>
    <p>Équipe francophone présente en permanence, contact d'urgence 24/7, briefing sécurité avant départ, suivi des recommandations du Quai d'Orsay. Assurance rapatriement obligatoire pour chaque participant.</p>
  `,
  },
  {
    slug: 'nutrition-athlete-combat',
    title: "Nutrition d'un athlète de combat au Caucase",
    excerpt: "Ce qu'on mange pendant le camp. Cuisine caucasienne, protéines et régime adapté à l'effort.",
    date: '8 janvier 2026',
    dateISO: '2026-01-08',
    readTime: '5 min',
    category: 'Préparation',
    img: '/images/blog/nutrition.webp',
    content: `
    <p>La cuisine caucasienne est naturellement adaptée aux athlètes de combat. Riche en protéines, en graisses saines et en glucides complexes, elle fournit l'énergie nécessaire pour 2 sessions d'entraînement par jour.</p>

    <h2>LES BASES</h2>
    <p>Agneau, poulet, produits laitiers, pain frais, légumes du jardin. Les repas sont préparés sur place, en grande quantité, avec des produits locaux.</p>

    <h2>PENDANT LE CAMP</h2>
    <p>2 repas principaux par jour pris en charge par MKR (petit-déjeuner copieux et déjeuner), plus des collations entre les sessions. L'hydratation est cruciale en altitude. L'équipe MKR adapte les portions et le timing des repas au programme d'entraînement.</p>
  `,
  },
  {
    slug: 'khabib-methode-entrainement',
    title: "La méthode d'entraînement de Khabib",
    excerpt: "Analyse de la préparation de Khabib Nurmagomedov. Ce que le camp MKR partage avec ses méthodes.",
    date: '20 décembre 2025',
    dateISO: '2025-12-20',
    readTime: '9 min',
    category: 'Culture',
    img: '/images/blog/khabib-methode.webp',
    content: `
    <p>Khabib Nurmagomedov, 29-0, considéré comme l'un des plus grands combattants de l'histoire du MMA. Sa méthode d'entraînement est directement liée à son environnement : le Daghestan.</p>

    <h2>LES FONDAMENTAUX</h2>
    <p>Lutte depuis l'âge de 5 ans, sparring quotidien avec les meilleurs, courses en montagne, entraînement en altitude. Khabib n'a jamais eu besoin d'une salle high-tech. Les montagnes du Daghestan étaient son terrain d'entraînement.</p>

    <h2>CE QUE LE CAMP MKR PARTAGE AVEC SES MÉTHODES</h2>
    <p>Les coachs MKR utilisent les mêmes fondamentaux : répétition, sparring réel, conditioning naturel. Tu t'entraînes dans les mêmes conditions, avec des coachs qui ont côtoyé le même système.</p>
  `,
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug)
}

export function getAllBlogSlugs(): string[] {
  return BLOG_POSTS.map(p => p.slug)
}
