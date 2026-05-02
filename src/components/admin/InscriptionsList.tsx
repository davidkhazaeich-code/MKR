'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
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
  session: '#FF6B00',
  custom: '#60a5fa',
  famille: '#4ade80',
  groupe: '#a78bfa',
}

const STATUS_COLOR: Record<Status, string> = {
  recue: '#FF8C00',
  validee: '#4ade80',
  refusee: '#fca5a5',
  soldee: '#60a5fa',
  camp_fait: '#a78bfa',
  annulee: '#71717a',
  reportee: '#fbbf24',
}

const ONE_DAY = 24 * 60 * 60 * 1000
const SEVEN_DAYS = 7 * ONE_DAY

function formatRelative(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `il y a ${diffD}j`
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function InscriptionsList({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState('')

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

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher par nom, email, pays, téléphone…"
        style={{
          width: '100%',
          padding: '0.7rem 0.9rem',
          marginBottom: '1.5rem',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(0,0,0,0.4)',
          color: '#fff',
          fontSize: '0.9rem',
        }}
      />

      {filtered.length === 0 ? (
        <div
          style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#71717a',
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: '16px',
          }}
        >
          {rows.length === 0 ? 'Aucune candidature pour ce filtre.' : 'Aucun résultat pour cette recherche.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {filtered.map((row) => (
            <CandidatureRow key={row.id} row={row} />
          ))}
        </div>
      )}
    </div>
  )
}

function CandidatureRow({ row }: { row: Row }) {
  const c = row.candidate
  const tunnelColor = TUNNEL_COLOR[row.tunnel_type]
  const statusColor = STATUS_COLOR[row.status]
  const fullName = c ? `${c.prenom} ${c.nom}` : '(candidat manquant)'

  const ageMs = Date.now() - new Date(row.created_at).getTime()
  const isNew = ageMs < ONE_DAY
  const sinceStatusMs = Date.now() - new Date(row.status_changed_at).getTime()
  const isStaleVisio = row.status === 'recue' && sinceStatusMs > SEVEN_DAYS

  return (
    <Link
      href={`/admin/inscriptions/${row.id}`}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        padding: '1rem 1.1rem',
        borderRadius: '14px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'background 0.15s, border-color 0.15s',
      }}
      className="admin-list-row"
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          alignItems: 'center',
          marginBottom: '0.5rem',
        }}
      >
        <Pill color={tunnelColor}>{TUNNEL_LABEL[row.tunnel_type]}</Pill>
        <Pill color={statusColor}>{STATUS_LABEL[row.status]}</Pill>
        {isNew && <Pill color="#FF8C00">🆕 Nouveau</Pill>}
        {isStaleVisio && <Pill color="#fca5a5">⚠️ Visio en retard</Pill>}
        {row.registration_fee_paid_at && <Pill color="#4ade80">✓ 100€ payés</Pill>}
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#71717a' }}>
          {formatRelative(row.created_at)}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          gap: '0.5rem 1rem',
        }}
      >
        <h2 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>{fullName}</h2>
        {c && (
          <>
            <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>{c.email}</span>
            {c.pays && <span style={{ color: '#71717a', fontSize: '0.8rem' }}>· {c.pays}</span>}
            {row.duree_semaines && (
              <span style={{ color: '#71717a', fontSize: '0.8rem' }}>· {row.duree_semaines} sem.</span>
            )}
          </>
        )}
      </div>

      {row.notes_admin && (
        <p
          style={{
            margin: '0.6rem 0 0',
            fontSize: '0.8rem',
            color: '#fbbf24',
            fontStyle: 'italic',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          📝 {row.notes_admin}
        </p>
      )}
    </Link>
  )
}

function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        padding: '0.18rem 0.55rem',
        borderRadius: '999px',
        fontSize: '0.68rem',
        fontWeight: 700,
        color,
        background: `${color}1a`,
        border: `1px solid ${color}40`,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {children}
    </span>
  )
}
