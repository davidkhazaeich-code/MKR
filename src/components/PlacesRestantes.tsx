'use client'

// Composant reutilisable qui affiche les places restantes d'une session MKR.
// Depuis 2026-05-12 : 2 compteurs separes par session (Lutte / MMA).
//
// Props :
// - sessionId : id de la session
// - discipline : 'lutte' | 'mma' | undefined. Si defini, affiche cette discipline.
//                Si undefined, affiche les 2 cote a cote (variant 'dual' uniquement).
// - variant : 'inline' | 'badge' | 'compact' | 'dual'
//
// Fetch /api/places (cache edge 60s), refresh toutes les 60s.

import { useEffect, useState } from 'react'

interface DisciplinePlaces {
  max_capacity: number
  places_prises: number
  places_restantes: number
  status: 'open' | 'limited' | 'closed'
  is_full: boolean
}

interface ApiSession {
  session_id: string
  label: string
  dates: string
  lutte: DisciplinePlaces
  mma: DisciplinePlaces
  status: 'open' | 'limited' | 'closed'
  total_restantes: number
  is_full: boolean
}

type Variant = 'inline' | 'badge' | 'compact' | 'dual'
type Discipline = 'lutte' | 'mma'

interface Props {
  sessionId: string
  /** Si defini, affiche cette discipline. Si undefined avec variant !== 'dual', somme Lutte+MMA. */
  discipline?: Discipline
  /** Fallback max si l'API ne repond pas (capacite par discipline, pas total). */
  fallbackMax?: number
  variant?: Variant
  className?: string
}

const REFRESH_MS = 60_000
const DISCIPLINE_LABEL: Record<Discipline, string> = {
  lutte: 'Lutte',
  mma: 'MMA',
}

export default function PlacesRestantes({
  sessionId,
  discipline,
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

  // Variant DUAL : 2 mini-pills cote a cote (Lutte 12/15 · MMA 8/15)
  if (variant === 'dual') {
    if (!data) {
      return (
        <span className={className} style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
          Chargement places…
        </span>
      )
    }
    return (
      <span
        className={className}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}
      >
        <DualPill label="Lutte" places={data.lutte} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>·</span>
        <DualPill label="MMA" places={data.mma} />
      </span>
    )
  }

  // Pour les autres variants, si pas de discipline precise, on affiche le total des 2.
  // Sinon, on affiche la discipline demandee.
  const slice: DisciplinePlaces | null = discipline
    ? (data ? data[discipline] : null)
    : (data
        ? {
            max_capacity: data.lutte.max_capacity + data.mma.max_capacity,
            places_prises: data.lutte.places_prises + data.mma.places_prises,
            places_restantes: data.total_restantes,
            status: data.status,
            is_full: data.is_full,
          }
        : null)

  const restantes = slice?.places_restantes ?? fallbackMax ?? null
  const max = slice?.max_capacity ?? (fallbackMax ? fallbackMax : null)
  const isFull = slice?.is_full ?? false
  const isLimited = slice?.status === 'limited'
  const disciplineLabel = discipline ? DISCIPLINE_LABEL[discipline] : null

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
          ? disciplineLabel ? `${disciplineLabel} complète` : 'Session complète'
          : restantes !== null && max !== null
            ? `${restantes}/${max} ${disciplineLabel ? disciplineLabel + ' ' : ''}places`
            : 'Chargement…'}
      </span>
    )
  }

  if (variant === 'compact') {
    if (restantes === null) return <span className={className}>Chargement…</span>
    if (isFull) {
      return (
        <span className={className} style={{ color: '#ef4444', fontWeight: 700 }}>
          {disciplineLabel ? `${disciplineLabel} complet` : 'Complet'}
        </span>
      )
    }
    return (
      <span className={className}>
        <strong>{restantes}</strong>{' '}
        {disciplineLabel ? `${disciplineLabel.toLowerCase()} ` : ''}
        {restantes > 1 ? 'places' : 'place'}
      </span>
    )
  }

  // Variant 'inline' (default)
  if (restantes === null && error) {
    return null
  }
  if (restantes === null) {
    return <span className={className}>Calcul des places…</span>
  }
  if (isFull) {
    return (
      <span className={className} style={{ color: '#ef4444', fontWeight: 700 }}>
        {disciplineLabel ? `${disciplineLabel} complète` : 'Session complète'} — liste d&apos;attente
      </span>
    )
  }
  if (isLimited) {
    return (
      <span className={className}>
        Plus que <strong style={{ color: '#fbbf24' }}>{restantes}</strong>{' '}
        place{restantes > 1 ? 's' : ''} {disciplineLabel ? disciplineLabel + ' ' : ''}sur {max}
      </span>
    )
  }
  return (
    <span className={className}>
      <strong>{restantes}</strong> place{restantes > 1 ? 's' : ''}{' '}
      {disciplineLabel ? disciplineLabel + ' ' : ''}
      disponible{restantes > 1 ? 's' : ''} sur {max}
    </span>
  )
}

function DualPill({ label, places }: { label: string; places: DisciplinePlaces }) {
  const isFull = places.is_full
  const isLimited = places.status === 'limited'
  const color = isFull ? '#ef4444' : isLimited ? '#fbbf24' : '#4ade80'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.18rem 0.55rem',
        borderRadius: 999,
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background: `${color}22`,
        color,
        border: `1px solid ${color}66`,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: 'currentColor',
          display: 'inline-block',
        }}
      />
      {label}{' '}
      {isFull ? 'complet' : `${places.places_restantes}/${places.max_capacity}`}
    </span>
  )
}
