'use client'

import { useTranslations } from 'next-intl'

export default function ScrollIndicator() {
  const t = useTranslations('common.scroll_indicator')
  return (
    <div className="dest-reveal-scroll-hint" aria-hidden="true">
      <span className="dest-reveal-scroll-text">{t('scroll')}</span>
      <div className="dest-reveal-scroll-line">
        <div className="dest-reveal-scroll-dot" />
      </div>
    </div>
  )
}
