import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '@/components/PageHero'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import { BLOG_POSTS } from '@/data/blog'

export const metadata: Metadata = {
  title: 'Blog MKR Caucasian Camp : MMA, Lutte et Caucase',
  description: "Articles sur le MMA, la lutte, le Daghestan, la préparation et la culture du combat. Par MKR Caucasian Camp.",
  alternates: { canonical: 'https://mkrcamp.com/blog' },
  robots: { index: false, follow: false },
}

export default function BlogPage() {
  const featured = BLOG_POSTS.find(a => a.featured)
  const rest = BLOG_POSTS.filter(a => !a.featured)

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'Blog', url: 'https://mkrcamp.com/blog' },
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
