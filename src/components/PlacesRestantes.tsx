'use client'

// Composant reutilisable qui affiche les places restantes d'une session MKR.
// Fetch /api/places (cache edge 60s), refresh toutes les 60s.
// Plusieurs variantes d'affichage selon l'usage.

import { useEffect, useState } from 'react'

interface ApiSession {
  session_id: string
  label: string
  dates: string
  max_capacity: number
  places_prises: number
  places_restantes: number
  status: 'open' | 'limited' | 'closed'
  is_full: boolean
}

type Variant = 'inline' | 'badge' | 'compact'

interface Props {
  sessionId: string
  fallbackMax?: number
  variant?: Variant
  className?: string
}

const REFRESH_MS = 60_000

export default function PlacesRestantes({
  sessionId,
  fallbackMax,
  variant = 'inline',
  className,
}: Props) {
  const [data, setData] = useState<ApiSession | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/places', { cache: 'no-store' })
        if (!res.ok) throw new Error('load failed')
        const json = (await res.json()) as { sessions: ApiSession[] }
        if (cancelled) return
        const found = json.sessions.find((s) => s.session_id === sessionId)
        if (found) {
          setData(found)
          setError(false)
        }
      } catch {
        if (!cancelled) setError(true)
      }
    }

    load()
    const interval = setInterval(load, REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [sessionId])

  // Fallback initial pendant le chargement : on montre fallbackMax pour eviter
  // un flash UI vide. Si l'API echoue, on garde le fallback statique.
  const restantes = data?.places_restantes ?? fallbackMax ?? null
  const max = data?.max_capacity ?? fallbackMax ?? null
  const isFull = data?.is_full ?? false
  const isLimited = data?.status === 'limited'

  if (variant === 'badge') {
    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.25rem 0.65rem',
          borderRadius: 999,
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          background: isFull
            ? 'rgba(239, 68, 68, 0.12)'
            : isLimited
              ? 'rgba(251, 191, 36, 0.12)'
              : 'rgba(34, 197, 94, 0.12)',
          color: isFull ? '#ef4444' : isLimited ? '#fbbf24' : '#4ade80',
          border: `1px solid ${isFull ? 'rgba(239,68,68,0.4)' : isLimited ? 'rgba(251,191,36,0.4)' : 'rgba(34,197,94,0.4)'}`,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'currentColor',
            display: 'inline-block',
            animation: !isFull && isLimited ? 'pulse-dot 2s ease-in-out infinite' : undefined,
          }}
        />
        {isFull
          ? 'Session complète'
          : restantes !== null && max !== null
            ? `${restantes}/${max} places`
            : 'Chargement…'}
      </span>
    )
  }

  if (variant === 'compact') {
    if (restantes === null) return <span className={className}>Chargement…</span>
    if (isFull) return <span className={className} style={{ color: '#ef4444', fontWeight: 700 }}>Complet</span>
    return (
      <span className={className}>
        <strong>{restantes}</strong> {restantes > 1 ? 'places' : 'place'}
      </span>
    )
  }

  // Variant 'inline' (default) : phrase complete adaptee au contexte
  if (restantes === null && error) {
    return null
  }
  if (restantes === null) {
    return <span className={className}>Calcul des places…</span>
  }
  if (isFull) {
    return (
      <span className={className} style={{ color: '#ef4444', fontWeight: 700 }}>
        Session complète — liste d&apos;attente
      </span>
    )
  }
  if (isLimited) {
    return (
      <span className={className}>
        Plus que <strong style={{ color: '#fbbf24' }}>{restantes}</strong>{' '}
        place{restantes > 1 ? 's' : ''} sur {max}
      </span>
    )
  }
  return (
    <span className={className}>
      <strong>{restantes}</strong> place{restantes > 1 ? 's' : ''} disponible
      {restantes > 1 ? 's' : ''} sur {max}
    </span>
  )
}
