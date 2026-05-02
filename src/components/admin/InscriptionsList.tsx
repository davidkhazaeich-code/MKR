'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Avatar from './ui/Avatar'
import Badge from './ui/Badge'
import Icon from './ui/Icon'
import { STATUS_LABEL, type Status } from '@/lib/admin-transitions'

type TunnelType = 'session' | 'custom' | 'famille' | 'groupe'

interface Row {
  id: string
  created_at: string
  status_changed_at: string
  tunnel_type: TunnelType
  session_id: string | null
  duree_semaines: number | null
  date_debut_souhaitee: string | null
  status: Status
  registration_fee_paid_at: string | null
  notes_admin: string | null
  candidate: {
    prenom: string
    nom: string
    email: string
    telephone: string | null
    pays: string | null
  } | null
}

const TUNNEL_LABEL: Record<TunnelType, string> = {
  session: 'MKR Camp 2026',
  custom: 'Sur Mesure',
  famille: 'Famille',
  groupe: 'Club & Groupe',
}

const TUNNEL_COLOR: Record<TunnelType, string> = {
  session: 'var(--adm-tunnel-session)',
  custom: 'var(--adm-tunnel-custom)',
  famille: 'var(--adm-tunnel-famille)',
  groupe: 'var(--adm-tunnel-groupe)',
}

const STATUS_COLOR: Record<Status, string> = {
  recue: 'var(--adm-status-recue)',
  validee: 'var(--adm-status-validee)',
  refusee: 'var(--adm-status-refusee)',
  soldee: 'var(--adm-status-soldee)',
  camp_fait: 'var(--adm-status-camp_fait)',
  annulee: 'var(--adm-status-annulee)',
  reportee: 'var(--adm-status-reportee)',
}

const ONE_DAY = 24 * 60 * 60 * 1000
const SEVEN_DAYS = 7 * ONE_DAY
const SEARCH_STORAGE_KEY = 'mkr-admin-search'

function formatRelative(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `il y a ${diffD}j`
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default function InscriptionsList({ rows }: { rows: Row[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const lastQueryHydrated = useRef(false)

  // Restaure la recherche depuis sessionStorage (au mount uniquement)
  useEffect(() => {
    if (lastQueryHydrated.current) return
    lastQueryHydrated.current = true
    try {
      const saved = sessionStorage.getItem(SEARCH_STORAGE_KEY)
      if (saved) setQuery(saved)
    } catch {
      /* sessionStorage indispo : ignore */
    }
  }, [])

  // Persiste la recherche
  useEffect(() => {
    try {
      if (query) sessionStorage.setItem(SEARCH_STORAGE_KEY, query)
      else sessionStorage.removeItem(SEARCH_STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [query])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => {
      const c = r.candidate
      if (!c) return false
      return (
        c.prenom.toLowerCase().includes(q) ||
        c.nom.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.pays?.toLowerCase().includes(q) ?? false) ||
        (c.telephone?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [rows, query])

  // Reset focus quand la liste change
  useEffect(() => {
    if (focusedIdx !== null && focusedIdx >= filtered.length) {
      setFocusedIdx(filtered.length === 0 ? null : Math.max(0, filtered.length - 1))
    }
  }, [filtered.length, focusedIdx])

  // Scroll into view
  useEffect(() => {
    if (focusedIdx === null) return
    const el = itemRefs.current[focusedIdx]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [focusedIdx])

  // Prefetch detail on hover (limite a 5 items, fenetre glissante)
  const prefetched = useRef<Set<string>>(new Set())
  const prefetchOnHover = useCallback(
    (id: string) => {
      if (prefetched.current.has(id)) return
      prefetched.current.add(id)
      router.prefetch(`/admin/inscriptions/${id}`)
    },
    [router],
  )

  // Raccourcis clavier
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const isInput =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

      // / : focus search (ne marche que hors input pour pas casser la frappe)
      if (e.key === '/' && !isInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
        return
      }

      // Esc dans le search : clear ou blur
      if (e.key === 'Escape' && target === inputRef.current) {
        if (query) {
          e.preventDefault()
          setQuery('')
        } else {
          inputRef.current?.blur()
        }
        return
      }

      if (isInput) return // ne pas hijack les flèches dans une autre input

      // J / ↓ : next
      if ((e.key === 'j' || e.key === 'ArrowDown') && !e.metaKey && !e.ctrlKey) {
        if (filtered.length === 0) return
        e.preventDefault()
        setFocusedIdx((i) => {
          if (i === null) return 0
          return Math.min(filtered.length - 1, i + 1)
        })
        return
      }

      // K / ↑ : prev
      if ((e.key === 'k' || e.key === 'ArrowUp') && !e.metaKey && !e.ctrlKey) {
        if (filtered.length === 0) return
        e.preventDefault()
        setFocusedIdx((i) => {
          if (i === null) return 0
          return Math.max(0, i - 1)
        })
        return
      }

      // Enter : ouvrir l'item focus
      if (e.key === 'Enter' && focusedIdx !== null && filtered[focusedIdx]) {
        e.preventDefault()
        const id = filtered[focusedIdx].id
        router.push(`/admin/inscriptions/${id}`)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [filtered, focusedIdx, query, router])

  return (
    <div>
      <div className="adm-search">
        <span className="adm-search-icon" aria-hidden="true">
          <Icon name="search" size={16} />
        </span>
        <input
          ref={inputRef}
          type="search"
          className="adm-search-input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setFocusedIdx(null)
          }}
          placeholder="Rechercher (nom, email, pays, téléphone) — astuce : / pour focus"
          aria-label="Rechercher dans les candidatures"
        />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          margin: '0.6rem 0 0.4rem',
          fontSize: '0.72rem',
          color: 'var(--adm-text-muted)',
        }}
        className="adm-hide-mobile"
      >
        <span>Raccourcis :</span>
        <span>
          <kbd className="adm-kbd">/</kbd> rechercher
        </span>
        <span>
          <kbd className="adm-kbd">J</kbd> <kbd className="adm-kbd">K</kbd> naviguer
        </span>
        <span>
          <kbd className="adm-kbd">↵</kbd> ouvrir
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="adm-list-empty" style={{ marginTop: '1rem' }}>
          <div className="adm-list-empty-icon" aria-hidden="true">
            {rows.length === 0 ? '📭' : '🔍'}
          </div>
          <p className="adm-list-empty-title">
            {rows.length === 0 ? 'Aucune candidature pour ce filtre' : 'Aucun résultat'}
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            {rows.length === 0
              ? 'Les candidatures apparaîtront ici dès leur soumission.'
              : 'Essaie avec d’autres mots-clés ou retire les filtres.'}
          </p>
        </div>
      ) : (
        <ul className="adm-list" style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0' }}>
          {filtered.map((row, i) => (
            <li key={row.id} style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
              <CandidatureRow
                row={row}
                focused={focusedIdx === i}
                rowRef={(el) => {
                  itemRefs.current[i] = el
                }}
                onMouseEnter={() => prefetchOnHover(row.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CandidatureRow({
  row,
  focused,
  rowRef,
  onMouseEnter,
}: {
  row: Row
  focused: boolean
  rowRef: (el: HTMLAnchorElement | null) => void
  onMouseEnter: () => void
}) {
  const c = row.candidate
  const fullName = c ? `${c.prenom} ${c.nom}` : '(candidat manquant)'

  const ageMs = Date.now() - new Date(row.created_at).getTime()
  const isNew = ageMs < ONE_DAY
  const sinceStatusMs = Date.now() - new Date(row.status_changed_at).getTime()
  const isStaleVisio = row.status === 'recue' && sinceStatusMs > SEVEN_DAYS

  return (
    <Link
      ref={rowRef}
      href={`/admin/inscriptions/${row.id}`}
      className={focused ? 'adm-list-item adm-list-item--focused' : 'adm-list-item'}
      onMouseEnter={onMouseEnter}
    >
      <div className="adm-list-row">
        <Avatar prenom={c?.prenom ?? '?'} nom={c?.nom ?? ''} seed={row.id} />
        <div className="adm-list-row-main">
          <h3 className="adm-list-name">{fullName}</h3>
          {c && (
            <div className="adm-list-meta">
              <span style={{ color: 'var(--adm-text-secondary)' }}>{c.email}</span>
              {c.pays && <span className="adm-list-meta-sep">·</span>}
              {c.pays && <span>{c.pays}</span>}
              {row.duree_semaines && <span className="adm-list-meta-sep">·</span>}
              {row.duree_semaines && <span>{row.duree_semaines} sem.</span>}
            </div>
          )}

          <div className="adm-list-badges">
            <Badge color={TUNNEL_COLOR[row.tunnel_type]} dot>
              {TUNNEL_LABEL[row.tunnel_type]}
            </Badge>
            <Badge
              color={STATUS_COLOR[row.status]}
              dot
              pulse={row.status === 'recue'}
            >
              {STATUS_LABEL[row.status]}
            </Badge>
            {isNew && <Badge color="var(--adm-brand)">Nouveau</Badge>}
            {isStaleVisio && (
              <Badge color="var(--adm-status-refusee)">⚠ Visio en retard</Badge>
            )}
            {row.registration_fee_paid_at && (
              <Badge color="var(--adm-status-validee)">100€ ✓</Badge>
            )}
          </div>
        </div>
        <div className="adm-list-time">{formatRelative(row.created_at)}</div>
      </div>

      {row.notes_admin && <p className="adm-list-note">📝 {row.notes_admin}</p>}
    </Link>
  )
}
