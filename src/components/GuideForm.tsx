'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { trackConversion } from '@/lib/gtag'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function GuideForm() {
  const searchParams = useSearchParams()
  const locale = useLocale()
  const t = useTranslations('guide-caucase.form')
  const [email, setEmail] = useState('')
  const [hp, setHp] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg(null)
    try {
      const referrer = typeof document !== 'undefined' ? document.referrer || null : null
      const res = await fetch('/api/guide-caucase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          locale,
          submission_language: locale,
          utm_source: searchParams.get('utm_source') ?? undefined,
          utm_medium: searchParams.get('utm_medium') ?? undefined,
          utm_campaign: searchParams.get('utm_campaign') ?? undefined,
          utm_term: searchParams.get('utm_term') ?? undefined,
          utm_content: searchParams.get('utm_content') ?? undefined,
          referrer,
          _hp: hp,
        }),
      })
      const data = (await res.json()) as { ok: boolean; downloadUrl?: string; error?: string }
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || t('error_generic'))
        setStatus('error')
        return
      }
      setDownloadUrl(data.downloadUrl ?? '/guide-caucase.pdf')
      setStatus('success')
      // Enhanced conversions : email transmis a la balise (hache SHA-256 par
      // gtag.js, envoye seulement si ad_user_data granted).
      trackConversion('guide', {}, { email })
      if (typeof window !== 'undefined' && data.downloadUrl) {
        window.open(data.downloadUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (err) {
      console.error(err)
      setErrorMsg(t('error_network'))
      setStatus('error')
    }
  }

  if (status === 'success' && downloadUrl) {
    return (
      <div className="guide-form-card">
        <h3>{t('card_title_success')}</h3>
        <p>{t('card_subtitle_success')}</p>
        <a
          href={downloadUrl}
          className="btn-primary"
          style={{ width: '100%', display: 'block', textAlign: 'center', marginTop: '0.5rem' }}
          download
        >
          {t('download_button')}
        </a>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block', marginTop: '0.75rem' }}>
          {t('success_footer')}
        </span>
      </div>
    )
  }

  return (
    <div className="guide-form-card">
      <h3>{t('card_title_idle')}</h3>
      <p>{t('card_subtitle_idle')}</p>
      <form className="guide-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="guide-email" className="sr-only">{t('email_label')}</label>
        <input
          id="guide-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={t('email_placeholder')}
          className="cand-input"
          required
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'submitting'}
        />
        <input
          type="text"
          name="_hp"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
        />
        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%' }}
          disabled={status === 'submitting' || !email}
        >
          {status === 'submitting' ? t('submit_sending') : t('submit')}
        </button>
        {errorMsg && (
          <p role="alert" style={{ color: 'var(--cta, #E11D2A)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            {errorMsg}
          </p>
        )}
      </form>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block', marginTop: '0.5rem' }}>
        {t('footer_note')}
      </span>
    </div>
  )
}
