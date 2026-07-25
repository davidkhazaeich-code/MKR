import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getBlogSlug, type Locale } from '@/i18n/routing'

export interface RelatedReadingItem {
  /** Slug canonical FR (celui de `BLOG_SLUG_MAP`), localise au rendu. */
  slug: string
  /** Ancre editoriale, pas le titre brut de l'article. */
  label: string
  hint: string
}

interface RelatedReadingProps {
  label: string
  title: string
  items: RelatedReadingItem[]
}

/**
 * Liens contextuels vers le blog depuis une page commerciale.
 *
 * Constat de l'audit du 2026-07-25 : le blog etait un silo ferme, aucune page
 * commerciale ne liait un article. Les ancres sont editoriales (« ce que coute
 * vraiment un camp ») et non le titre brut, pour porter un sens de lecture.
 */
export default async function RelatedReading({ label, title, items }: RelatedReadingProps) {
  if (items.length === 0) return null
  const locale = (await getLocale()) as Locale

  return (
    <section className="related-reading" aria-labelledby="related-reading-title">
      <div className="inner">
        <div className="related-reading-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            {label}
          </span>
          <h2 id="related-reading-title">{title}</h2>
        </div>
        <ul className="related-reading-list reveal">
          {items.map(item => (
            <li key={item.slug}>
              <Link
                href={{ pathname: '/blog/[slug]', params: { slug: getBlogSlug(item.slug, locale) } }}
                className="related-reading-link"
              >
                <span className="related-reading-label">{item.label}</span>
                <span className="related-reading-hint">{item.hint}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
