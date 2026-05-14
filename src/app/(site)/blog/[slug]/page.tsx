import type { Metadata } from 'next'
import SectionCTA from '@/components/SectionCTA'
import Breadcrumb from '@/components/Breadcrumb'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'

interface Article {
  title: string
  date: string
  dateISO: string
  readTime: string
  img: string
  content: string
}

const ARTICLES_MAP: Record<string, Article> = {
  'pourquoi-le-dagestan-domine-le-mma': {
    title: 'Pourquoi le Daghestan domine le MMA mondial',
    date: '15 mars 2026',
    dateISO: '2026-03-15',
    readTime: '8 min',
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
  'preparer-son-premier-camp': {
    title: 'Comment préparer son premier camp au Caucase',
    date: '28 février 2026',
    dateISO: '2026-02-28',
    readTime: '6 min',
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
  'lutte-daghestanaise-guide-complet': {
    title: 'La lutte daghestanaise : guide complet',
    date: '10 février 2026',
    dateISO: '2026-02-10',
    readTime: '10 min',
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
  'securite-dagestan-2026': {
    title: 'Sécurité au Daghestan en 2026 : la réalité du terrain',
    date: '25 janvier 2026',
    dateISO: '2026-01-25',
    readTime: '7 min',
    img: '/images/blog/securite-dagestan.webp',
    content: `
    <p>La question de la sécurité au Daghestan revient systématiquement. Voici un état des lieux factuel, basé sur notre expérience sur le terrain depuis 2018.</p>

    <h2>LA SITUATION ACTUELLE</h2>
    <p>Les zones urbaines où se déroulent nos camps (Makhachkala, Kaspiysk) sont stables et fréquentées par des athlètes internationaux. Le tourisme sportif est en croissance depuis plusieurs années.</p>

    <h2>LE PROTOCOLE MKR</h2>
    <p>Équipe francophone présente en permanence, contact d'urgence 24/7, briefing sécurité avant départ, suivi des recommandations du Quai d'Orsay. Assurance rapatriement obligatoire pour chaque participant.</p>
  `,
  },
  'nutrition-athlete-combat': {
    title: "Nutrition d'un athlète de combat au Caucase",
    date: '8 janvier 2026',
    dateISO: '2026-01-08',
    readTime: '5 min',
    img: '/images/blog/nutrition.webp',
    content: `
    <p>La cuisine caucasienne est naturellement adaptée aux athlètes de combat. Riche en protéines, en graisses saines et en glucides complexes, elle fournit l'énergie nécessaire pour 2 sessions d'entraînement par jour.</p>

    <h2>LES BASES</h2>
    <p>Agneau, poulet, produits laitiers, pain frais, légumes du jardin. Les repas sont préparés sur place, en grande quantité, avec des produits locaux.</p>

    <h2>PENDANT LE CAMP</h2>
    <p>2 repas principaux par jour pris en charge par MKR (petit-déjeuner copieux et déjeuner), plus des collations entre les sessions. L'hydratation est cruciale en altitude. L'équipe MKR adapte les portions et le timing des repas au programme d'entraînement.</p>
  `,
  },
  'khabib-methode-entrainement': {
    title: "La méthode d'entraînement de Khabib",
    date: '20 décembre 2025',
    dateISO: '2025-12-20',
    readTime: '9 min',
    img: '/images/blog/khabib-methode.webp',
    content: `
    <p>Khabib Nurmagomedov, 29-0, considéré comme l'un des plus grands combattants de l'histoire du MMA. Sa méthode d'entraînement est directement liée à son environnement : le Daghestan.</p>

    <h2>LES FONDAMENTAUX</h2>
    <p>Lutte depuis l'âge de 5 ans, sparring quotidien avec les meilleurs, courses en montagne, entraînement en altitude. Khabib n'a jamais eu besoin d'une salle high-tech. Les montagnes du Daghestan étaient son terrain d'entraînement.</p>

    <h2>CE QUE LE CAMP MKR PARTAGE AVEC SES MÉTHODES</h2>
    <p>Les coachs MKR utilisent les mêmes fondamentaux : répétition, sparring réel, conditioning naturel. Tu t'entraînes dans les mêmes conditions, avec des coachs qui ont côtoyé le même système.</p>
  `,
  },
}

function getArticle(slug: string): Article {
  return ARTICLES_MAP[slug] ?? {
    title: 'Article en cours de rédaction',
    date: '',
    dateISO: '',
    readTime: '',
    img: '/images/blog/dagestan-mma.webp',
    content: '<p>Cet article sera bientôt disponible.</p>',
  }
}

export function generateStaticParams() {
  return Object.keys(ARTICLES_MAP).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = getArticle(slug)
  return {
    title: `${article.title} | MKR Caucasian Camp`,
    description: article.content.replace(/<[^>]*>/g, '').substring(0, 160),
    alternates: { canonical: `https://mkrcamp.com/blog/${slug}` },
  }
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticle(slug)

  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    datePublished: article.dateISO,
    author: { '@id': 'https://mkrcamp.com/#organization' },
    publisher: { '@id': 'https://mkrcamp.com/#organization' },
    image: `https://mkrcamp.com${article.img}`,
    mainEntityOfPage: `https://mkrcamp.com/blog/${slug}`,
    inLanguage: 'fr',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'Blog', url: 'https://mkrcamp.com/blog' },
        { name: article.title, url: `https://mkrcamp.com/blog/${slug}` },
      ]} />
      <article className="blog-article">
        <div className="inner">
          <Breadcrumb items={[
            { href: '/blog', label: 'Blog' },
            { href: '#', label: article.title },
          ]} />
          <div className="blog-article-meta">
            {article.date && <span>{article.date}</span>}
            {article.readTime && <><span>·</span><span>{article.readTime} de lecture</span></>}
          </div>
          <h1 className="blog-article-title">{article.title}</h1>
          <div className="blog-article-hero">
            <img
              src={article.img}
              alt={article.title}
              width={1200}
              height={500}
              className="section-photo-img"
              style={{ aspectRatio: '21/9', objectFit: 'cover', width: '100%', maxHeight: '480px' }}
            />
          </div>
          <div className="prose" dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </article>

      <SectionCTA
        primaryHref="/inscription"
        primaryLabel="POSTULER AU CAMP"
        ghostHref="/blog"
        ghostLabel="TOUS LES ARTICLES"
      />
    </>
  )
}
