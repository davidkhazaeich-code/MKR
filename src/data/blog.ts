/**
 * Blog: structural metadata only.
 * Display copy (title, excerpt, meta_title, meta_description, content_html,
 * tldr, faq, keywords, about, category label) lives in:
 *   - messages/<locale>/blog.json (list/index, one entry per slug)
 *   - messages/<locale>/blog/<slug>.json (full article)
 *
 * Use `getBlogList(t)` and `getBlogPost(slug, t)` at render time to hydrate.
 */

import type { TFn } from '@/lib/session-display'

/** Internal slug used for /blog/[slug] routes. Stable URLs. */
export type BlogSlug =
  | 'pourquoi-le-dagestan-domine-le-mma'
  | 'preparer-son-premier-camp'
  | 'lutte-daghestanaise-guide-complet'
  | 'securite-dagestan-2026'
  | 'nutrition-athlete-combat'
  | 'khabib-methode-entrainement'

export interface BlogPostMeta {
  slug: BlogSlug
  /** ISO publication date (e.g. 2026-03-15). */
  dateISO: string
  /** ISO last-updated date (optional). */
  dateModifiedISO?: string
  /** Featured flag - one entry is highlighted in /blog list. */
  featured?: boolean
  /** Hero image asset path. */
  img: string
  /** Related slugs explicitly chosen by the editor (else fallback to category). */
  relatedSlugs?: BlogSlug[]
}

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: 'pourquoi-le-dagestan-domine-le-mma',
    dateISO: '2026-03-15',
    dateModifiedISO: '2026-05-14',
    featured: true,
    img: '/images/blog/dagestan-mma.webp',
    relatedSlugs: [
      'khabib-methode-entrainement',
      'lutte-daghestanaise-guide-complet',
      'preparer-son-premier-camp',
    ],
  },
  {
    slug: 'preparer-son-premier-camp',
    dateISO: '2026-03-10',
    dateModifiedISO: '2026-05-14',
    img: '/images/blog/prep-camp.webp',
    relatedSlugs: [
      'nutrition-athlete-combat',
      'securite-dagestan-2026',
      'pourquoi-le-dagestan-domine-le-mma',
    ],
  },
  {
    slug: 'lutte-daghestanaise-guide-complet',
    dateISO: '2026-03-05',
    dateModifiedISO: '2026-05-14',
    img: '/images/blog/lutte-guide.webp',
    relatedSlugs: [
      'pourquoi-le-dagestan-domine-le-mma',
      'khabib-methode-entrainement',
      'preparer-son-premier-camp',
    ],
  },
  {
    slug: 'securite-dagestan-2026',
    dateISO: '2026-02-28',
    dateModifiedISO: '2026-05-14',
    img: '/images/blog/securite-dagestan.webp',
    relatedSlugs: [
      'preparer-son-premier-camp',
      'pourquoi-le-dagestan-domine-le-mma',
    ],
  },
  {
    slug: 'nutrition-athlete-combat',
    dateISO: '2026-02-20',
    dateModifiedISO: '2026-05-14',
    img: '/images/blog/nutrition.webp',
    relatedSlugs: [
      'preparer-son-premier-camp',
      'khabib-methode-entrainement',
    ],
  },
  {
    slug: 'khabib-methode-entrainement',
    dateISO: '2026-02-15',
    dateModifiedISO: '2026-05-14',
    img: '/images/blog/khabib-methode.webp',
    relatedSlugs: [
      'pourquoi-le-dagestan-domine-le-mma',
      'lutte-daghestanaise-guide-complet',
      'nutrition-athlete-combat',
    ],
  },
]

export interface BlogListEntry {
  slug: BlogSlug
  title: string
  excerpt: string
  date: string
  read_time: string
  category: string
  img_alt: string
  img: string
  dateISO: string
  dateModifiedISO?: string
  featured?: boolean
}

export interface BlogPostFull extends BlogListEntry {
  author_name: string
  author_role: string | null
  meta_title: string | null
  meta_description: string | null
  keywords: string[] | null
  about: string[] | null
  tldr: string[] | null
  faq: { q: string; a: string }[] | null
  content_html: string
  relatedSlugs?: BlogSlug[]
}

/**
 * Builds the blog list (one entry per post, sorted by dateISO desc).
 * `t` must be scoped to the `blog` namespace.
 */
export function getBlogList(t: TFn): BlogListEntry[] {
  return [...BLOG_POSTS]
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO))
    .map(meta => {
      const raw = t.raw(meta.slug) as
        | {
            title: string
            excerpt: string
            date: string
            read_time: string
            category: string
            img_alt: string
          }
        | undefined
      return {
        slug: meta.slug,
        title: raw?.title ?? meta.slug,
        excerpt: raw?.excerpt ?? '',
        date: raw?.date ?? '',
        read_time: raw?.read_time ?? '',
        category: raw?.category ?? '',
        img_alt: raw?.img_alt ?? '',
        img: meta.img,
        dateISO: meta.dateISO,
        dateModifiedISO: meta.dateModifiedISO,
        featured: meta.featured,
      }
    })
}

/**
 * Hydrate a single post with full content. `t` must be scoped to the
 * `blog.<slug>` namespace (one namespace per post).
 */
export function hydrateBlogPost(slug: BlogSlug, t: TFn): BlogPostFull | undefined {
  const meta = BLOG_POSTS.find(p => p.slug === slug)
  if (!meta) return undefined
  const title = t('title')
  return {
    slug,
    title,
    excerpt: t('excerpt'),
    date: t('date'),
    read_time: t('read_time'),
    category: t('category'),
    img_alt: t('img_alt'),
    img: meta.img,
    dateISO: meta.dateISO,
    dateModifiedISO: meta.dateModifiedISO,
    featured: meta.featured,
    author_name: t('author_name'),
    author_role: safeString(t.raw('author_role')),
    meta_title: safeString(t.raw('meta_title')),
    meta_description: safeString(t.raw('meta_description')),
    keywords: safeStringArray(t.raw('keywords')),
    about: safeStringArray(t.raw('about')),
    tldr: safeStringArray(t.raw('tldr')),
    faq: safeFaqArray(t.raw('faq')),
    content_html: t('content_html'),
    relatedSlugs: meta.relatedSlugs,
  }
}

function safeString(v: unknown): string | null {
  return typeof v === 'string' ? v : null
}
function safeStringArray(v: unknown): string[] | null {
  return Array.isArray(v) && v.every(x => typeof x === 'string') ? (v as string[]) : null
}
function safeFaqArray(v: unknown): { q: string; a: string }[] | null {
  return Array.isArray(v) &&
    v.every(x => x && typeof x === 'object' && 'q' in x && 'a' in x)
    ? (v as { q: string; a: string }[])
    : null
}

export function getAllBlogSlugs(): BlogSlug[] {
  return BLOG_POSTS.map(p => p.slug)
}

export function isBlogSlug(value: string): value is BlogSlug {
  return BLOG_POSTS.some(p => p.slug === value)
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function wordCount(html: string): number {
  const text = stripHtml(html)
  if (!text) return 0
  return text.split(/\s+/).length
}
