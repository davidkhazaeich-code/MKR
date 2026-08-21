'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import Icon from './Icon'
import { trackConversion } from '@/lib/gtag'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const SUBJECT_VALUES = ['general', 'partenariat', 'clubs', 'presse', 'autre'] as const
type SubjectValue = (typeof SUBJECT_VALUES)[number]

function isSubjectValue(value: string | null): value is SubjectValue {
  return value !== null && (SUBJECT_VALUES as readonly string[]).includes(value)
}

export default function ContactForm() {
  const locale = useLocale()
  const t = useTranslations('contact.form')
  // Les cartes d'aiguillage de la page renvoient vers `?sujet=presse` : le sujet
  // est pre-selectionne et le formulaire remonte sous les yeux du visiteur.
  // Lecture cote client (et non via le `searchParams` de la page) pour que
  // /contact reste une page statique. Impose un <Suspense> chez l'appelant,
  // meme contrainte que GuideForm.
  const searchParams = useSearchParams()
  const prefilledSubject = searchParams.get('sujet')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState(() => (isSubjectValue(prefilledSubject) ? prefilledSubject : ''))
  const [message, setMessage] = useState('')
  const [hp, setHp] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Une navigation CLIENTE vers /contact?sujet=... (la carte « Presse ou
  // partenariat » de la page) reutilise l'instance du composant : React ne
  // rejoue pas l'initialiseur de useState. Sans cette synchronisation, l'URL
  // changeait mais le select restait vide. Bug attrape en QA, ne pas retirer.
  // L'effet ne se declenche qu'au CHANGEMENT du parametre, donc un choix
  // manuel du visiteur n'est jamais ecrase.
  useEffect(() => {
    if (!isSubjectValue(prefilledSubject)) return
    setSubject(prefilledSubject)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    formRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }, [prefilledSubject])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message, _hp: hp, submission_language: locale }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setError(data.error || t('error_generic'))
        setStatus('error')
        return
      }
      setStatus('success')
      // Enhanced conversions : email et telephone transmis a la balise (haches
      // SHA-256 par gtag.js, envoyes seulement si ad_user_data granted). Le
      // telephone n'est retenu que s'il est convertible en E.164.
      trackConversion('contact', { subject: subject || undefined }, { email, phone })
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
    <form ref={formRef} id="formulaire" className="contact-form" onSubmit={handleSubmit} noValidate>
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
        <label className="cand-label" htmlFor="contact-phone">{t('fields.phone.label')}</label>
        <input
          id="contact-phone"
          type="tel"
          inputMode="tel"
          className="cand-input"
          placeholder={t('fields.phone.placeholder')}
          autoComplete="tel"
          maxLength={30}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={submitting}
          aria-describedby="contact-phone-hint"
        />
        <p id="contact-phone-hint" className="contact-field-hint">{t('optional_hint')}</p>
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
