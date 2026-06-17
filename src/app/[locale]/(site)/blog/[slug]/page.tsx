import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import SectionCTA from '@/components/SectionCTA'
import Breadcrumb from '@/components/Breadcrumb'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import { localizedMetadata, getBlogAlternateLinks } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import {
  hydrateBlogPost,
  getAllBlogSlugs,
  getBlogList,
  isBlogSlug,
  stripHtml,
  wordCount,
  type BlogPostFull,
} from '@/data/blog'

const SITE_URL = 'https://mkrcamp.com'

export function generateStaticParams() {
  return getAllBlogSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params
  if (!isBlogSlug(slug)) return {}
  const tPost = await getTranslations({ locale, namespace: `blog.${slug}` })
  const article = hydrateBlogPost(slug, tPost as never)
  if (!article) return {}

  const lang = (locale as Locale) ?? 'fr'
  const alternates = getBlogAlternateLinks(slug, lang)

  const title = article.meta_title ?? `${article.title} | MKR Caucasian Camp`
  const description =
    article.meta_description ??
    article.excerpt ??
    stripHtml(article.content_html).substring(0, 160)

  return localizedMetadata('/blog/[slug]' as never, lang, title, description, {
    alternates,
    images: [{ url: article.img, width: 1200, height: 630, alt: article.img_alt }],
    ogType: 'article',
    publishedTime: article.dateISO || undefined,
    modifiedTime: article.dateModifiedISO || article.dateISO || undefined,
    authors: [article.author_name],
    extra: {
      keywords: article.keywords ?? undefined,
      authors: [{ name: article.author_name }],
    },
  })
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params
  setRequestLocale(locale)

  if (!isBlogSlug(slug)) {
    return <BlogFallback />
  }

  const tPost = await getTranslations(`blog.${slug}`)
  const tList = await getTranslations('blog')
  const article = hydrateBlogPost(slug, tPost as never)
  if (!article) return <BlogFallback />

  const url = `${SITE_URL}/blog/${slug}`
  const imageUrl = article.img.startsWith('http') ? article.img : `${SITE_URL}${article.img}`
  const description = article.meta_description ?? article.excerpt ?? stripHtml(article.content_html).substring(0, 200)
  const authorName = article.author_name
  const related = getRelatedPostsForArticle(article, tList as never)
  const contentText = stripHtml(article.content_html)
  const words = wordCount(article.content_html)

  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: article.title,
    description,
    datePublished: article.dateISO,
    dateModified: article.dateModifiedISO || article.dateISO,
    inLanguage: locale,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@id': `${SITE_URL}/#person-ruslan` },
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
            {article.read_time && <><span>·</span><span>{article.read_time} de lecture</span></>}
          </div>

          <h1 className="blog-article-title">{article.title}</h1>

          <div className="blog-article-byline">
            <span>{locale === 'en' ? 'By' : 'Par'} {authorName}{article.author_role ? ` · ${article.author_role}` : ''}</span>
            {article.dateModifiedISO && article.dateModifiedISO !== article.dateISO && (
              <span className="blog-article-updated"> · {locale === 'en' ? 'Updated' : 'Mis à jour le'} {formatDate(article.dateModifiedISO, locale)}</span>
            )}
          </div>

          <div className="blog-article-hero">
            <img
              src={article.img}
              alt={article.img_alt}
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

          <div className="prose" dangerouslySetInnerHTML={{ __html: article.content_html }} />

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
            <div className="blog-related-header reveal">
              <span className="blog-related-label">{tList('related.eyebrow')}</span>
              <h2 id="blog-related-title" className="blog-related-title">{tList('related.title')}</h2>
            </div>
            <div className="blog-related-grid">
              {related.map((post, i) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="blog-related-card reveal"
                  style={{ transitionDelay: `${0.08 * (i + 1)}s` }}
                >
                  <div className="blog-related-img">
                    <img
                      src={post.img}
                      alt={post.img_alt}
                      width={400}
                      height={225}
                      loading="lazy"
                      decoding="async"
                      style={{ aspectRatio: '16/9', objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
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

function BlogFallback() {
  return (
    <article className="blog-article">
      <div className="inner">
        <h1 className="blog-article-title">Article en cours de rédaction</h1>
        <p>Cet article sera bientôt disponible.</p>
      </div>
    </article>
  )
}

function formatDate(iso: string, locale: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// Resolve related posts via the post's relatedSlugs + fallback to category neighbors.
function getRelatedPostsForArticle(
  article: BlogPostFull,
  tList: Parameters<typeof getBlogList>[0],
) {
  const all = getBlogList(tList)
  const others = all.filter(p => p.slug !== article.slug)
  if (article.relatedSlugs && article.relatedSlugs.length > 0) {
    const explicit = article.relatedSlugs
      .map(s => others.find(p => p.slug === s))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
    if (explicit.length >= 3) return explicit.slice(0, 3)
    const remaining = others.filter(p => !article.relatedSlugs!.includes(p.slug))
    return [...explicit, ...remaining].slice(0, 3)
  }
  const sameCategory = others.filter(p => p.category === article.category)
  const restOthers = others.filter(p => p.category !== article.category)
  return [...sameCategory, ...restOthers].slice(0, 3)
}
