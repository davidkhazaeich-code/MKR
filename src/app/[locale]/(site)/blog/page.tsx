import { getTranslations, setRequestLocale } from 'next-intl/server'
import { localizedMetadata } from '@/lib/i18n-helpers'
import { type Locale, getBlogSlug } from '@/i18n/routing'
import { Link } from '@/i18n/navigation'
import PageHero from '@/components/PageHero'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import { getBlogList } from '@/data/blog'

const BLOG_LIST_META = {
  fr: {
    title: 'Blog MKR Caucasian Camp : MMA, Lutte et Caucase',
    description: "Articles sur le MMA, la lutte, le Daghestan, la préparation et la culture du combat. Par MKR Caucasian Camp.",
  },
  en: {
    title: 'MKR Caucasian Camp Blog: MMA, Wrestling and the Caucasus',
    description: 'Articles on MMA, wrestling, Dagestan, training preparation and combat culture. By MKR Caucasian Camp.',
  },
} as const

const BLOG_LIST_HERO = {
  fr: { label: 'BLOG', title: 'LE JOURNAL DU CAMP', home: 'Accueil' },
  en: { label: 'BLOG', title: 'THE CAMP JOURNAL', home: 'Home' },
} as const

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const lang = (locale as Locale) ?? 'fr'
  const copy = BLOG_LIST_META[lang as 'fr' | 'en'] ?? BLOG_LIST_META.fr
  return localizedMetadata('/blog', lang, copy.title, copy.description)
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const lang: Locale = locale === 'en' ? 'en' : 'fr'
  const tBlog = await getTranslations('blog')

  const posts = getBlogList(tBlog as never)
  const featured = posts.find(a => a.featured)
  const rest = posts.filter(a => !a.featured)
  const hero = BLOG_LIST_HERO[lang] ?? BLOG_LIST_HERO.fr

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: hero.home, url: 'https://mkrcamp.com/' },
        { name: 'Blog', url: 'https://mkrcamp.com/blog' },
      ]} />


      <PageHero
        label={hero.label}
        title={hero.title}
        compact
      />

      <section className="blog-section fx-grid fx-glow fx-stack-1">
        <div className="fx-glow-orb fx-glow-orb--top" />
        <div className="inner">
          {/* Featured */}
          {featured && (
            <Link href={{ pathname: '/blog/[slug]', params: { slug: getBlogSlug(featured.slug, lang) } }} className="blog-featured reveal">
              <div className="blog-featured-img">
                <img
                  src={featured.img}
                  alt={featured.img_alt}
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
                <span className="blog-read-more">{tBlog('read_article')}</span>
              </div>
            </Link>
          )}

          {/* Grid */}
          <div className="grid-2" style={{ marginTop: '3rem' }}>
            {rest.map((article, i) => (
              <Link key={i} href={{ pathname: '/blog/[slug]', params: { slug: getBlogSlug(article.slug, lang) } }} className="blog-card reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <img
                  src={article.img}
                  alt={article.img_alt}
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
