import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '@/components/PageHero'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: 'Blog | MKR Caucasian Camp | MMA, Lutte & Caucase',
  description: "Articles sur le MMA, la lutte, le Dagestan, la preparation et la culture du combat. Par MKR Caucasian Camp.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/blog' },
}

const ARTICLES = [
  {
    slug: 'pourquoi-le-dagestan-domine-le-mma',
    title: 'Pourquoi le Dagestan domine le MMA mondial',
    excerpt: "Analyse des methodes d'entrainement, de la culture et du systeme qui produit les meilleurs fighters de la planete.",
    date: '15 mars 2026',
    category: 'Culture',
    featured: true,
    img: '/images/blog/dagestan-mma.webp',
  },
  {
    slug: 'preparer-son-premier-camp',
    title: 'Comment preparer son premier camp au Caucase',
    excerpt: "Guide pratique : condition physique, equipement, mindset. Tout ce qu'il faut savoir avant de partir.",
    date: '28 fevrier 2026',
    category: 'Preparation',
    img: '/images/blog/prep-camp.webp',
  },
  {
    slug: 'lutte-daghestanaise-guide-complet',
    title: 'La lutte daghestanaise : guide complet',
    excerpt: "Techniques, histoire et philosophie de la lutte au Dagestan. Pourquoi ces methodes sont superieures.",
    date: '10 fevrier 2026',
    category: 'Technique',
    img: '/images/blog/lutte-guide.webp',
  },
  {
    slug: 'securite-dagestan-2026',
    title: 'Securite au Dagestan en 2026 : la realite du terrain',
    excerpt: "Etat des lieux factuel. Ce que disent les autorites, ce que vivent les athletes sur place.",
    date: '25 janvier 2026',
    category: 'Logistique',
    img: '/images/blog/securite-dagestan.webp',
  },
  {
    slug: 'nutrition-athlete-combat',
    title: 'Nutrition d\'un athlete de combat au Caucase',
    excerpt: "Ce qu'on mange pendant le camp. Cuisine caucasienne, proteines, et regime adapte a l'effort.",
    date: '8 janvier 2026',
    category: 'Preparation',
    img: '/images/blog/nutrition.webp',
  },
  {
    slug: 'khabib-methode-entrainement',
    title: 'La methode d\'entrainement de Khabib',
    excerpt: "Analyse de la preparation de Khabib Nurmagomedov. Ce que le camp MKR partage avec ses methodes.",
    date: '20 decembre 2025',
    category: 'Culture',
    img: '/images/blog/khabib-methode.webp',
  },
]

export default function BlogPage() {
  const featured = ARTICLES.find(a => a.featured)
  const rest = ARTICLES.filter(a => !a.featured)

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcaucasiancamp.com/' },
        { name: 'Blog', url: 'https://mkrcaucasiancamp.com/blog' },
      ]} />


      <PageHero
        label="BLOG"
        title="LE JOURNAL DU CAMP"
        compact
      />

      <section className="blog-section fx-grid fx-glow fx-stack-1">
        <div className="fx-glow-orb fx-glow-orb--top" />
        <div className="inner">
          {/* Featured */}
          {featured && (
            <Link href={`/blog/${featured.slug}`} className="blog-featured reveal">
              <div className="blog-featured-img">
                <img
                  src={featured.img}
                  alt={featured.title}
                  width={1200}
                  height={500}
                  loading="lazy"
                  className="section-photo-img"
                  style={{ aspectRatio: '21/9', objectFit: 'cover', width: '100%' }}
                />
                <div className="blog-featured-overlay" />
                <span className="blog-featured-img-label">{featured.category}</span>
              </div>
              <div className="blog-featured-content">
                <span className="blog-date">{featured.date}</span>
                <h2>{featured.title}</h2>
                <p>{featured.excerpt}</p>
                <span className="blog-read-more">Lire l&apos;article</span>
              </div>
            </Link>
          )}

          {/* Grid */}
          <div className="grid-2" style={{ marginTop: '3rem' }}>
            {rest.map((article, i) => (
              <Link key={i} href={`/blog/${article.slug}`} className="blog-card reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <img
                  src={article.img}
                  alt={article.title}
                  width={800}
                  height={450}
                  loading="lazy"
                  className="section-photo-img"
                  style={{ aspectRatio: '16/9', objectFit: 'cover', width: '100%', marginBottom: '1rem' }}
                />
                <span className="blog-date">{article.date}</span>
                <h3 className="blog-card-title">{article.title}</h3>
                <p className="blog-card-excerpt">{article.excerpt}</p>
                <span className="blog-category">{article.category}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
