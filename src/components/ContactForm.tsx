'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Icon from './Icon'
import { trackConversion } from '@/lib/gtag'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const SUBJECT_VALUES = ['general', 'partenariat', 'clubs', 'presse', 'autre'] as const

export default function ContactForm() {
  const locale = useLocale()
  const t = useTranslations('contact.form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [hp, setHp] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, _hp: hp, submission_language: locale }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setError(data.error || t('error_generic'))
        setStatus('error')
        return
      }
      setStatus('success')
      // Enhanced conversions : email transmis a la balise (hache SHA-256 par
      // gtag.js, envoye seulement si ad_user_data granted).
      trackConversion('contact', { subject: subject || undefined }, { email })
    } catch {
      setError(t('error_network'))
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="contact-form" role="status" aria-live="polite">
        <div className="cand-field" style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ color: 'var(--primary)', margin: '0 auto 0.8rem', display: 'flex', justifyContent: 'center' }}>
            <Icon name="check-circle" size={40} />
          </div>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '0.4rem' }}>{t('success.title')}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            {t('success.body')}
          </p>
        </div>
      </div>
    )
  }

  const submitting = status === 'submitting'

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="cand-field">
        <label className="cand-label" htmlFor="contact-name">{t('fields.name.label')}</label>
        <input
          id="contact-name"
          type="text"
          className="cand-input"
          placeholder={t('fields.name.placeholder')}
          autoComplete="name"
          required
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
        />
      </div>
      <div className="cand-field">
        <label className="cand-label" htmlFor="contact-email">{t('fields.email.label')}</label>
        <input
          id="contact-email"
          type="email"
          inputMode="email"
          className="cand-input"
          placeholder={t('fields.email.placeholder')}
          autoComplete="email"
          required
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
        />
      </div>
      <div className="cand-field">
        <label className="cand-label" htmlFor="contact-subject">{t('fields.subject.label')}</label>
        <select
          id="contact-subject"
          className="cand-select"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={submitting}
        >
          <option value="" disabled>{t('fields.subject.placeholder')}</option>
          {SUBJECT_VALUES.map((value) => (
            <option key={value} value={value}>{t(`subjects.${value}`)}</option>
          ))}
        </select>
      </div>
      <div className="cand-field">
        <label className="cand-label" htmlFor="contact-message">{t('fields.message.label')}</label>
        <textarea
          id="contact-message"
          className="cand-textarea"
          rows={5}
          placeholder={t('fields.message.placeholder')}
          required
          maxLength={5000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={submitting}
        />
      </div>

      {/* Honeypot anti-bot : invisible aux humains, rempli par les bots. */}
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
        disabled={submitting || !name || !email || !subject || !message}
      >
        {submitting ? t('submit_sending') : t('submit')}
      </button>

      {error && (
        <p role="alert" style={{ color: 'var(--cta, #E11D2A)', fontSize: '0.85rem', marginTop: '0.6rem' }}>
          {error}
        </p>
      )}
    </form>
  )
}
