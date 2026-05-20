'use client'

import { useState } from 'react'
import Icon from './Icon'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const SUBJECT_OPTIONS = [
  { value: 'general', label: 'Question générale' },
  { value: 'partenariat', label: 'Partenariat' },
  { value: 'clubs', label: 'Clubs et groupes' },
  { value: 'presse', label: 'Presse et médias' },
  { value: 'autre', label: 'Autre' },
] as const

export default function ContactForm() {
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
        body: JSON.stringify({ name, email, subject, message, _hp: hp }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setError(data.error || 'Une erreur est survenue. Réessaie dans un instant.')
        setStatus('error')
        return
      }
      setStatus('success')
    } catch {
      setError('Connexion impossible. Vérifie ton réseau et réessaie.')
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
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '0.4rem' }}>MESSAGE BIEN REÇU</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            On revient vers toi sous 48h sur l&apos;email indiqué. Tu peux aussi nous écrire sur WhatsApp si ta question est urgente.
          </p>
        </div>
      </div>
    )
  }

  const submitting = status === 'submitting'

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="cand-field">
        <label className="cand-label" htmlFor="contact-name">Nom complet</label>
        <input
          id="contact-name"
          type="text"
          className="cand-input"
          placeholder="Ton nom"
          autoComplete="name"
          required
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
        />
      </div>
      <div className="cand-field">
        <label className="cand-label" htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          type="email"
          inputMode="email"
          className="cand-input"
          placeholder="ton@email.com"
          autoComplete="email"
          required
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
        />
      </div>
      <div className="cand-field">
        <label className="cand-label" htmlFor="contact-subject">Sujet</label>
        <select
          id="contact-subject"
          className="cand-select"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={submitting}
        >
          <option value="" disabled>Choisis un sujet</option>
          {SUBJECT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="cand-field">
        <label className="cand-label" htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          className="cand-textarea"
          rows={5}
          placeholder="Ton message..."
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
        {submitting ? 'ENVOI EN COURS...' : 'ENVOYER'}
      </button>

      {error && (
        <p role="alert" style={{ color: 'var(--cta, #E11D2A)', fontSize: '0.85rem', marginTop: '0.6rem' }}>
          {error}
        </p>
      )}
    </form>
  )
}
