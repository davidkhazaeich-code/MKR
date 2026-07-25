'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'

/**
 * Tunnel d'inscription deduit de la page courante.
 *
 * Le CTA sticky est le SEUL appel a l'action disponible pendant les premiers
 * ecrans de scroll en mobile. Il pointait vers `/inscription` sans parametre :
 * le visiteur retombait sur l'ecran de choix du type d'inscription et devait
 * re-selectionner ce qu'il venait de lire. Une etape de friction offerte, sur
 * le support majoritaire de ce business.
 *
 * `usePathname` vient de `@/i18n/navigation` : il renvoie le chemin SANS
 * prefixe de locale, donc les cles ci-dessous marchent aussi sur /en.
 * Seuls `type` et `session` sont acceptes par la page d'inscription
 * (cf. src/app/[locale]/inscription/page.tsx), on n'invente pas de parametre.
 */
const TUNNEL_BY_PATH: Record<string, 'session' | 'custom' | 'famille' | 'groupe'> = {
  '/programme': 'session',
  '/programme/lutte': 'session',
  '/programme/mma': 'session',
  '/sessions': 'session',
  '/mkr-camp-2026': 'session',
  '/le-camp': 'session',
  '/destinations': 'session',
  '/destinations/dagestan': 'session',
  '/destinations/tchetchenie': 'session',
  '/programme/lutte-enfants': 'famille',
  '/familles': 'famille',
  '/clubs-groupes': 'groupe',
  '/sur-mesure': 'custom',
}

export default function StickyMobileCTA() {
  const t = useTranslations('common.sticky_mobile_cta')
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const tunnel = TUNNEL_BY_PATH[pathname]

  return (
    <Link
      href={tunnel ? { pathname: '/inscription', query: { type: tunnel } } : '/inscription'}
      className={`sticky-cta-mobile${visible ? ' is-visible' : ''}`}
      aria-label={t('apply_aria')}
    >
      {t('apply')}
    </Link>
  )
}
