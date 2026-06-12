'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { findReferralCode } from '@/data/referral-codes'
import Icon from './Icon'

const DISMISS_KEY = 'mkr_ref_banner_dismissed'

export default function ReferralBanner() {
  const t = useTranslations('common.referral_banner')
  const [partnerName, setPartnerName] = useState<string | null>(null)

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === '1') return
    const match = document.cookie.match(/(?:^|;\s*)mkr_ref=([^;]+)/)
    if (!match) return
    const partner = findReferralCode(decodeURIComponent(match[1]))
    if (partner) setPartnerName(partner.partnerName)
  }, [])

  if (!partnerName) return null

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '0.5rem 1rem',
        /* MKR Mountain Glow : no dedicated CSS token exists for gold/yellow,
           using the brand signature warm gold (#c8a04a) as literal value. */
        background: '#c8a04a',
        color: '#1a1a1a',
        fontSize: '0.9rem',
        fontWeight: 600,
        textAlign: 'center',
      }}
    >
      <span>{t('text', { partner: partnerName })}</span>
      <button
        type="button"
        aria-label={t('dismiss')}
        onClick={() => {
          sessionStorage.setItem(DISMISS_KEY, '1')
          setPartnerName(null)
        }}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.1rem',
          lineHeight: 1,
          color: 'inherit',
          minWidth: 44,
          minHeight: 44,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="x" size={18} />
      </button>
    </div>
  )
}
