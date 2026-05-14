'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function GuideForm() {
  const searchParams = useSearchParams()
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
          locale: 'fr',
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
        setErrorMsg(data.error || 'Erreur inconnue, reessaye dans un instant')
        setStatus('error')
        return
      }
      setDownloadUrl(data.downloadUrl ?? '/guide-caucase.pdf')
      setStatus('success')
      if (typeof window !== 'undefined' && data.downloadUrl) {
        window.open(data.downloadUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('Impossible de joindre le serveur')
      setStatus('error')
    }
  }

  if (status === 'success' && downloadUrl) {
    return (
      <div className="guide-form-card">
        <h3>TON GUIDE EST PRET</h3>
        <p>Le telechargement a demarre. Si rien ne se passe, clique sur le bouton ci-dessous.</p>
        <a
          href={downloadUrl}
          className="btn-primary"
          style={{ width: '100%', display: 'block', textAlign: 'center', marginTop: '0.5rem' }}
          download
        >
          TELECHARGER LE GUIDE (PDF)
        </a>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block', marginTop: '0.75rem' }}>
          Conserve-le, partage-le. Aucun spam, aucun suivi commercial sans ton accord.
        </span>
      </div>
    )
  }

  return (
    <div className="guide-form-card">
      <h3>TELECHARGE LE GUIDE</h3>
      <p>Recois le guide complet (20 pages) en un clic. Gratuit, sans engagement.</p>
      <form className="guide-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="guide-email" className="sr-only">Ton adresse email</label>
        <input
          id="guide-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Ton adresse email"
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
          {status === 'submitting' ? 'ENVOI EN COURS...' : 'TELECHARGER GRATUITEMENT'}
        </button>
        {errorMsg && (
          <p role="alert" style={{ color: 'var(--cta, #E11D2A)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            {errorMsg}
          </p>
        )}
      </form>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block', marginTop: '0.5rem' }}>
        Pas de spam. 1 email max. Desinscription en 1 clic.
      </span>
    </div>
  )
}
