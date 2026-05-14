import type { Metadata } from 'next'
import SectionCTA from '@/components/SectionCTA'
import Breadcrumb from '@/components/Breadcrumb'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import { getBlogPost, getAllBlogSlugs, type BlogPost } from '@/data/blog'

const FALLBACK: BlogPost = {
  slug: '',
  title: 'Article en cours de rédaction',
  excerpt: '',
  date: '',
  dateISO: '',
  readTime: '',
  category: '',
  img: '/images/blog/dagestan-mma.webp',
  content: '<p>Cet article sera bientôt disponible.</p>',
}

export function generateStaticParams() {
  return getAllBlogSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = getBlogPost(slug) ?? FALLBACK
  return {
    title: `${article.title} | MKR Caucasian Camp`,
    description: article.excerpt || article.content.replace(/<[^>]*>/g, '').substring(0, 160),
    alternates: { canonical: `https://mkrcamp.com/blog/${slug}` },
  }
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getBlogPost(slug) ?? FALLBACK

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
