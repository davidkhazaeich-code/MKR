'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing, getBlogSlug, getCanonicalBlogSlug, type Locale } from '@/i18n/routing'

interface Props {
  variant?: 'desktop' | 'mobile'
}

/**
 * LocaleSwitcher — T12 (i18n FR+EN, 2026-05-27).
 * Two pill-style buttons (FR / EN, ISO short, no flags per spec).
 * Sets cookie NEXT_LOCALE, persists across reloads, uses next-intl router
 * to keep the same logical route (pathnames map FR↔EN automatically via
 * the routing config). WCAG 2.1 AA : aria-current, lang, focus state,
 * 44x44 mobile tap target. `data-hreflang` is exposed for crawlers/QA
 * (the `hreflang` attribute itself is invalid on <button>).
 */
export default function LocaleSwitcher({ variant = 'desktop' }: Props) {
  const currentLocale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const t = useTranslations('common.locale_switcher')

  function switchTo(target: Locale) {
    if (target === currentLocale) return
    document.cookie = `NEXT_LOCALE=${target}; max-age=31536000; path=/; SameSite=Lax`
    // On dynamic routes, usePathname() returns the TEMPLATE ("/blog/[slug]"):
    // router.replace needs the params too, otherwise next-intl cannot build
    // the URL and the switch silently fails. Blog slugs are also localized
    // (BLOG_SLUG_MAP), so remap the slug for the target locale.
    if (pathname === '/blog/[slug]' && typeof params?.slug === 'string') {
      const canonical = getCanonicalBlogSlug(params.slug) ?? params.slug
      router.replace(
        { pathname: '/blog/[slug]', params: { slug: getBlogSlug(canonical, target) } },
        { locale: target },
      )
      return
    }
    // Cast: static pathnames only from here; bypass the strict typed union.
    router.replace(pathname as Parameters<typeof router.replace>[0], { locale: target })
  }

  return (
    <div
      className={`locale-switcher locale-switcher--${variant}`}
      role="group"
      aria-label={t('label')}
    >
      {routing.locales.map((locale) => {
        const isActive = locale === currentLocale
        const labelKey = locale === 'fr' ? 'fr' : 'en'
        const ariaKey = locale === 'fr' ? 'switch_to_fr_aria' : 'switch_to_en_aria'
        return (
          <button
            key={locale}
            type="button"
            className={`locale-switcher-btn${isActive ? ' is-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            aria-label={t(ariaKey)}
            data-hreflang={locale}
            lang={locale}
            onClick={() => switchTo(locale)}
            disabled={isActive}
          >
            {t(labelKey)}
          </button>
        )
      })}
    </div>
  )
}
