'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'

interface Props {
  variant?: 'desktop' | 'mobile'
}

/**
 * LocaleSwitcher — stub T5 (i18n FR+EN, 2026-05-27).
 * Sera affine en T12 (animations, dropdown, icones). Pour l'instant : 2 boutons
 * FR / EN qui swap la locale via next-intl router + cookie NEXT_LOCALE.
 */
export default function LocaleSwitcher({ variant = 'desktop' }: Props) {
  const currentLocale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('common.locale_switcher')

  function switchTo(target: Locale) {
    if (target === currentLocale) return
    document.cookie = `NEXT_LOCALE=${target}; max-age=31536000; path=/; SameSite=Lax`
    // Cast: usePathname() retourne le path canonique (incluant dynamic segments
    // type "/blog/[slug]"), router.replace exige une union typee plus stricte.
    // Le runtime gere correctement les dynamic segments ; on bypass le check TS.
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
