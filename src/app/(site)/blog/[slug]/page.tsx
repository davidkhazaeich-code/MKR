import Link from 'next/link'
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
    title: 'Pourquoi le Dagestan domine le MMA mondial',
    date: '15 mars 2026',
    dateISO: '2026-03-15',
    readTime: '8 min',
    img: '/images/blog/dagestan-mma.webp',
    content: `
    <p>Le Dagestan, petite republique du Caucase russe, a produit plus de champions de combat par habitant que n'importe quel autre endroit sur Terre. Ce n'est pas un hasard.</p>

    <h2>UNE CULTURE DU COMBAT</h2>
    <p>Dans les villages de montagne du Dagestan, la lutte n'est pas un sport. C'est un rite de passage. Des l'age de 5-6 ans, les garcons sont inscrits dans les salles locales. La competition commence tot, et seuls les plus determines progressent.</p>

    <blockquote><p>La difference entre un athlete occidental et un athlete daghestanais, c'est que le Daghestanais s'entraine comme s'il se battait pour sa vie. Parce que historiquement, c'etait le cas.</p></blockquote>

    <h2>LE SYSTEME D'ENTRAINEMENT</h2>
    <p>Le systeme d'entrainement daghestanais repose sur trois piliers : la repetition, le sparring reel, et la competition permanente. Pas de simulation, pas de drills vides. Chaque session est une mise en situation reelle.</p>

    <h3>LA REPETITION</h3>
    <p>Une technique n'est consideree comme acquise qu'apres des milliers de repetitions. Les coachs locaux ne passent a la suite que lorsque le geste est devenu un reflexe.</p>

    <h3>LE SPARRING REEL</h3>
    <p>Au Dagestan, le sparring n'est pas un exercice de style. C'est un combat controle mais intense. Les partenaires ne font pas semblant, et c'est cette intensite qui forge des combattants capables de gerer la pression en competition.</p>

    <h2>CE QUE MKR T'APPORTE</h2>
    <p>Le camp MKR te donne acces a ces methodes. Pendant 3 semaines, tu t'entraines avec les memes coachs, dans les memes salles, avec les memes methodes qui ont produit les champions. C'est un raccourci que tu ne trouveras nulle part ailleurs.</p>
  `,
  },
  'preparer-son-premier-camp': {
    title: 'Comment preparer son premier camp au Caucase',
    date: '28 fevrier 2026',
    dateISO: '2026-02-28',
    readTime: '6 min',
    img: '/images/blog/prep-camp.webp',
    content: `
    <p>Tu as reserve ta place pour un camp MKR. Maintenant, il faut te preparer. Voici le guide complet pour arriver dans les meilleures conditions.</p>

    <h2>CONDITION PHYSIQUE</h2>
    <p>6 semaines avant le depart, commence un programme specifique : cardio haute intensite (HIIT), gainage fonctionnel, course a intervalles. L'objectif : tenir 2 sessions par jour pendant 3 semaines.</p>

    <h2>EQUIPEMENT</h2>
    <p>Gants de MMA (4oz et 16oz), protege-tibias, protege-dents, coquille. Rashguard et short de grappling. Chaussures de lutte optionnelles mais recommandees.</p>

    <h2>MINDSET</h2>
    <p>Viens avec l'humilite d'un debutant, meme si tu as 10 ans de pratique. Le niveau au Caucase est different. Accepte de te faire dominer les premiers jours. C'est la que l'apprentissage commence.</p>
  `,
  },
  'lutte-daghestanaise-guide-complet': {
    title: 'La lutte daghestanaise : guide complet',
    date: '10 fevrier 2026',
    dateISO: '2026-02-10',
    readTime: '10 min',
    img: '/images/blog/lutte-guide.webp',
    content: `
    <p>La lutte au Dagestan n'est pas simplement un sport. C'est une institution culturelle, un systeme educatif et une voie de vie. Ce guide explore les methodes, l'histoire et la philosophie de la lutte daghestanaise.</p>

    <h2>L'HISTOIRE</h2>
    <p>La lutte au Dagestan remonte a des siecles. Chaque village possedait sa propre tradition de combat. Les tournaments inter-villages etaient des evenements majeurs, et le meilleur lutteur du village etait respecte comme un heros.</p>

    <h2>LES METHODES</h2>
    <p>L'entrainement daghestanais met l'accent sur le sparring reel des les premieres annees. Les jeunes lutteurs affrontent des partenaires plus experimentes quotidiennement. Cette exposition constante a des niveaux superieurs accelere la progression.</p>

    <h2>POURQUOI CES METHODES FONCTIONNENT</h2>
    <p>Le volume d'entrainement, la qualite des partenaires de sparring, et la culture de competition permanente creent un environnement ou seuls les plus adaptes progressent. C'est la selection naturelle appliquee au sport de combat.</p>
  `,
  },
  'securite-dagestan-2026': {
    title: 'Securite au Dagestan en 2026 : la realite du terrain',
    date: '25 janvier 2026',
    dateISO: '2026-01-25',
    readTime: '7 min',
    img: '/images/blog/securite-dagestan.webp',
    content: `
    <p>La question de la securite au Dagestan revient systematiquement. Voici un etat des lieux factuel, base sur notre experience sur le terrain depuis 2018.</p>

    <h2>LA SITUATION ACTUELLE</h2>
    <p>Les zones urbaines ou se deroulent nos camps (Makhachkala, Kaspiysk) sont stables et frequentees par des athletes internationaux. Le tourisme sportif est en croissance depuis plusieurs annees.</p>

    <h2>LE PROTOCOLE MKR</h2>
    <p>Equipe francophone presente en permanence, contact d'urgence 24/7, briefing securite avant depart, suivi des recommandations du Quai d'Orsay. Assurance rapatriement obligatoire pour chaque participant.</p>
  `,
  },
  'nutrition-athlete-combat': {
    title: "Nutrition d'un athlete de combat au Caucase",
    date: '8 janvier 2026',
    dateISO: '2026-01-08',
    readTime: '5 min',
    img: '/images/blog/nutrition.webp',
    content: `
    <p>La cuisine caucasienne est naturellement adaptee aux athletes de combat. Riche en proteines, en graisses saines et en glucides complexes, elle fournit l'energie necessaire pour 2 sessions d'entrainement par jour.</p>

    <h2>LES BASES</h2>
    <p>Agneau, poulet, produits laitiers, pain frais, legumes du jardin. Les repas sont prepares sur place, en grande quantite, avec des produits locaux.</p>

    <h2>PENDANT LE CAMP</h2>
    <p>3 repas par jour, plus des collations entre les sessions. L'hydratation est cruciale en altitude. L'equipe MKR adapte les portions et le timing des repas au programme d'entrainement.</p>
  `,
  },
  'khabib-methode-entrainement': {
    title: "La methode d'entrainement de Khabib",
    date: '20 decembre 2025',
    dateISO: '2025-12-20',
    readTime: '9 min',
    img: '/images/blog/khabib-methode.webp',
    content: `
    <p>Khabib Nurmagomedov, 29-0, considere comme l'un des plus grands combattants de l'histoire du MMA. Sa methode d'entrainement est directement liee a son environnement : le Dagestan.</p>

    <h2>LES FONDAMENTAUX</h2>
    <p>Lutte depuis l'age de 5 ans, sparring quotidien avec les meilleurs, courses en montagne, entrainement en altitude. Khabib n'a jamais eu besoin d'une salle high-tech. Les montagnes du Dagestan etaient son terrain d'entrainement.</p>

    <h2>CE QUE LE CAMP MKR PARTAGE AVEC SES METHODES</h2>
    <p>Les coachs MKR utilisent les memes fondamentaux : repetition, sparring reel, conditioning naturel. Tu t'entraines dans les memes conditions, avec des coachs qui ont cotoye le meme systeme.</p>
  `,
  },
}

function getArticle(slug: string): Article {
  return ARTICLES_MAP[slug] ?? {
    title: 'Article en cours de redaction',
    date: '',
    dateISO: '',
    readTime: '',
    img: '/images/blog/dagestan-mma.webp',
    content: '<p>Cet article sera bientot disponible.</p>',
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
    alternates: { canonical: `https://mkrcaucasiancamp.com/blog/${slug}` },
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
    author: { '@id': 'https://mkrcaucasiancamp.com/#organization' },
    publisher: { '@id': 'https://mkrcaucasiancamp.com/#organization' },
    image: `https://mkrcaucasiancamp.com${article.img}`,
    mainEntityOfPage: `https://mkrcaucasiancamp.com/blog/${slug}`,
    inLanguage: 'fr',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcaucasiancamp.com/' },
        { name: 'Blog', url: 'https://mkrcaucasiancamp.com/blog' },
        { name: article.title, url: `https://mkrcaucasiancamp.com/blog/${slug}` },
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

      {/* CTA fin d'article */}
      <section className="logi-section">
        <div className="inner">
          <div className="group-card reveal" style={{ textAlign: 'center' }}>
            <h2>PRET A PASSER A L&apos;ACTION ?</h2>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/sessions" className="btn-primary">VOIR LES SESSIONS</Link>
              <Link href="/inscription" className="btn-ghost">S&apos;INSCRIRE</Link>
            </div>
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/blog"
        primaryLabel="TOUS LES ARTICLES"
      />
    </>
  )
}
