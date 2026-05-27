'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export default function StickyMobileCTA() {
  const t = useTranslations('common.sticky_mobile_cta')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Link
      href="/inscription"
      className={`sticky-cta-mobile${visible ? ' is-visible' : ''}`}
      aria-label={t('apply_aria')}
    >
      {t('apply')}
    </Link>
  )
}
