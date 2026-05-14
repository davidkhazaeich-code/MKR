import type { Metadata } from 'next'
import Link from 'next/link'
import SectionCTA from '@/components/SectionCTA'
import Breadcrumb from '@/components/Breadcrumb'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import {
  getBlogPost,
  getAllBlogSlugs,
  getRelatedPosts,
  stripHtml,
  wordCount,
  type BlogPost,
} from '@/data/blog'

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

const SITE_URL = 'https://mkrcamp.com'

export function generateStaticParams() {
  return getAllBlogSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = getBlogPost(slug) ?? FALLBACK
  const url = `${SITE_URL}/blog/${slug}`
  const title = article.metaTitle ?? `${article.title} | MKR Caucasian Camp`
  const description =
    article.metaDescription ??
    article.excerpt ??
    stripHtml(article.content).substring(0, 160)
  const imageUrl = article.img.startsWith('http') ? article.img : `${SITE_URL}${article.img}`

  return {
    title,
    description,
    alternates: { canonical: url },
    keywords: article.keywords,
    authors: [{ name: article.authorName ?? 'MKR Caucasian Camp' }],
    robots: { index: false, follow: false },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      siteName: 'MKR Caucasian Camp',
      locale: 'fr_CH',
      publishedTime: article.dateISO || undefined,
      modifiedTime: article.dateModifiedISO || article.dateISO || undefined,
      authors: [article.authorName ?? 'MKR Caucasian Camp'],
      section: article.category,
      tags: article.keywords,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.imgAlt ?? article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getBlogPost(slug) ?? FALLBACK
  const url = `${SITE_URL}/blog/${slug}`
  const imageUrl = article.img.startsWith('http') ? article.img : `${SITE_URL}${article.img}`
  const description = article.metaDescription ?? article.excerpt ?? stripHtml(article.content).substring(0, 200)
  const authorName = article.authorName ?? 'L\'équipe MKR Caucasian Camp'
  const related = getRelatedPosts(slug, 3)
  const contentText = stripHtml(article.content)
  const words = wordCount(article.content)

  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: article.title,
    description,
    datePublished: article.dateISO,
    dateModified: article.dateModifiedISO || article.dateISO,
    inLanguage: 'fr',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: {
      '@type': 'Organization',
      name: authorName,
      url: SITE_URL,
    },
    publisher: { '@id': `${SITE_URL}/#organization` },
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1200,
      height: 630,
    },
    keywords: article.keywords?.join(', '),
    articleSection: article.category,
    articleBody: contentText,
    wordCount: words,
    about: article.about?.map(name => ({ '@type': 'Thing', name })),
  }

  const jsonLdFaq = article.faq && article.faq.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: article.faq.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      }
    : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      {jsonLdFaq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
      )}
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: `${SITE_URL}/` },
        { name: 'Blog', url: `${SITE_URL}/blog` },
        { name: article.title, url },
      ]} />

      <article className="blog-article">
        <div className="inner">
          <Breadcrumb items={[
            { href: '/blog', label: 'Blog' },
            { href: '#', label: article.title },
          ]} />

          <div className="blog-article-meta">
            {article.category && <span className="blog-article-category">{article.category}</span>}
            {article.date && <span>{article.date}</span>}
            {article.readTime && <><span>·</span><span>{article.readTime} de lecture</span></>}
          </div>

          <h1 className="blog-article-title">{article.title}</h1>

          <div className="blog-article-byline">
            <span>Par {authorName}</span>
            {article.dateModifiedISO && article.dateModifiedISO !== article.dateISO && (
              <span className="blog-article-updated"> · Mis à jour le {formatDate(article.dateModifiedISO)}</span>
            )}
          </div>

          <div className="blog-article-hero">
            <img
              src={article.img}
              alt={article.imgAlt ?? article.title}
              width={1200}
              height={500}
              className="section-photo-img"
              style={{ aspectRatio: '21/9', objectFit: 'cover', width: '100%', maxHeight: '480px' }}
            />
          </div>

          {article.tldr && article.tldr.length > 0 && (
            <aside className="blog-tldr" aria-label="À retenir">
              <div className="blog-tldr-label">À RETENIR</div>
              <ul className="blog-tldr-list">
                {article.tldr.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </aside>
          )}

          <div className="prose" dangerouslySetInnerHTML={{ __html: article.content }} />

          {article.faq && article.faq.length > 0 && (
            <section className="blog-faq" aria-labelledby="blog-faq-title">
              <h2 id="blog-faq-title" className="blog-faq-title">QUESTIONS FRÉQUENTES</h2>
              <div className="blog-faq-list">
                {article.faq.map((item, i) => (
                  <details key={i} className="blog-faq-item">
                    <summary className="blog-faq-question">{item.q}</summary>
                    <div className="blog-faq-answer">{item.a}</div>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="blog-related fx-grid" aria-labelledby="blog-related-title">
          <div className="inner">
            <div className="blog-related-header">
              <span className="blog-related-label">À LIRE ENSUITE</span>
              <h2 id="blog-related-title" className="blog-related-title">SUR LE MÊME SUJET</h2>
            </div>
            <div className="blog-related-grid">
              {related.map(post => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-related-card">
                  <div className="blog-related-img">
                    <img
                      src={post.img}
                      alt={post.imgAlt ?? post.title}
                      width={400}
                      height={225}
                      loading="lazy"
                      style={{ aspectRatio: '16/9', objectFit: 'cover', width: '100%' }}
                    />
                  </div>
                  <div className="blog-related-body">
                    <span className="blog-related-category">{post.category}</span>
                    <h3 className="blog-related-card-title">{post.title}</h3>
                    <p className="blog-related-excerpt">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <SectionCTA
        primaryHref="/inscription"
        primaryLabel="POSTULER AU CAMP"
        ghostHref="/blog"
        ghostLabel="TOUS LES ARTICLES"
      />
    </>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}
