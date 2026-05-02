import type { Metadata } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Page admin protegee par middleware (cookie httpOnly 'mkr_admin').
// Le middleware (src/middleware.ts) rewrite vers /admin/login si non authentifie.
// Aucun token n'apparait dans l'URL ici.

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Candidatures MKR',
}

type TunnelType = 'session' | 'custom' | 'famille' | 'groupe'
type Status = 'recue' | 'validee' | 'refusee' | 'soldee' | 'camp_fait' | 'annulee' | 'reportee'

interface Row {
  id: string
  created_at: string
  tunnel_type: TunnelType
  session_id: string | null
  duree_semaines: number | null
  date_debut_souhaitee: string | null
  status: Status
  registration_fee_paid_at: string | null
  form_data: Record<string, unknown>
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

const STATUS_LABEL: Record<Status, string> = {
  recue: 'Reçue',
  validee: 'Validée',
  refusee: 'Refusée',
  soldee: 'Soldée',
  camp_fait: 'Camp fait',
  annulee: 'Annulée',
  reportee: 'Reportée',
}

function formatRelative(iso: string): string {
  const d = new Date(iso)
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000)
  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `il y a ${diffD}j`
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminInscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tunnel?: string; status?: string }>
}) {
  const params = await searchParams

  let query
  try {
    const supabase = getSupabaseAdmin()
    query = supabase
      .from('candidatures')
      .select(`
        id, created_at, tunnel_type, session_id, duree_semaines,
        date_debut_souhaitee, status, registration_fee_paid_at, form_data,
        candidate:candidates ( prenom, nom, email, telephone, pays )
      `)
      .order('created_at', { ascending: false })
      .limit(200)
  } catch (err) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>Candidatures MKR</h1>
        <p style={{ color: '#fca5a5' }}>
          Configuration manquante : {(err as Error).message}
        </p>
      </div>
    )
  }

  if (params.tunnel && ['session', 'custom', 'famille', 'groupe'].includes(params.tunnel)) {
    query = query.eq('tunnel_type', params.tunnel)
  }
  if (params.status && Object.keys(STATUS_LABEL).includes(params.status)) {
    query = query.eq('status', params.status)
  }

  const { data, error } = await query
  const rows = ((data ?? []) as unknown) as Row[]

  const counts = rows.reduce<Record<TunnelType, number>>(
    (acc, r) => {
      acc[r.tunnel_type] = (acc[r.tunnel_type] ?? 0) + 1
      return acc
    },
    { session: 0, custom: 0, famille: 0, groupe: 0 },
  )

  const generatedAt = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const linkBase = '?'

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 600, margin: 0 }}>Candidatures MKR</h1>
            <p style={{ color: '#9CA3AF', fontSize: '0.85rem', margin: '0.4rem 0 0' }}>
              Mis à jour à {generatedAt}.{' '}
              <a href="/admin/inscriptions" style={{ color: '#FF8C00', textDecoration: 'underline' }}>
                Rafraîchir
              </a>
              {' · '}
              <span style={{ color: '#71717a' }}>{rows.length} dossier{rows.length > 1 ? 's' : ''}</span>
            </p>
          </div>
          <form method="POST" action="/api/admin/logout">
            <button
              type="submit"
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'transparent',
                color: '#9CA3AF',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Deconnexion
            </button>
          </form>
        </header>

        {error && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid rgba(252,165,165,0.3)',
              background: 'rgba(252,165,165,0.05)',
              color: '#fca5a5',
            }}
          >
            Erreur Supabase : {error.message}
          </div>
        )}

        {/* Filters */}
        <nav
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <FilterPill href="/admin/inscriptions" label={`Tous (${rows.length})`} active={!params.tunnel} />
          {(Object.keys(TUNNEL_LABEL) as TunnelType[]).map((t) => (
            <FilterPill
              key={t}
              href={`/admin/inscriptions?tunnel=${t}`}
              label={`${TUNNEL_LABEL[t]} (${counts[t]})`}
              active={params.tunnel === t}
              accent={TUNNEL_COLOR[t]}
            />
          ))}
        </nav>

        {rows.length === 0 ? (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: '#71717a',
              border: '1px dashed rgba(255,255,255,0.1)',
              borderRadius: '16px',
            }}
          >
            Aucune candidature pour ce filtre.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {rows.map((row) => (
              <CandidatureCard key={row.id} row={row} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterPill({
  href,
  label,
  active,
  accent,
}: {
  href: string
  label: string
  active: boolean
  accent?: string
}) {
  const color = accent ?? '#FF8C00'
  return (
    <a
      href={href}
      style={{
        padding: '0.5rem 1rem',
        borderRadius: '999px',
        fontSize: '0.85rem',
        fontWeight: 600,
        textDecoration: 'none',
        color: active ? '#fff' : '#9CA3AF',
        background: active ? `${color}1a` : 'rgba(255,255,255,0.04)',
        border: active ? `1px solid ${color}80` : '1px solid rgba(255,255,255,0.08)',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </a>
  )
}

function CandidatureCard({ row }: { row: Row }) {
  const accent = TUNNEL_COLOR[row.tunnel_type]
  const candidate = row.candidate
  const fullName = candidate ? `${candidate.prenom} ${candidate.nom}` : '(candidat manquant)'
  const phoneTel = candidate?.telephone?.replace(/[^+0-9]/g, '') ?? ''
  const tel = candidate?.telephone

  return (
    <article
      style={{
        padding: '1.25rem',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}
      >
        <span
          style={{
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: accent,
            background: `${accent}1a`,
            border: `1px solid ${accent}40`,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {TUNNEL_LABEL[row.tunnel_type]}
        </span>
        <span
          style={{
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#9CA3AF',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {STATUS_LABEL[row.status]}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#71717a', marginLeft: 'auto' }}>
          {formatRelative(row.created_at)} · {formatDate(row.created_at)}
        </span>
      </header>

      <div style={{ marginBottom: '0.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>{fullName}</h2>
        {candidate && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginTop: '0.4rem',
              fontSize: '0.85rem',
            }}
          >
            <a href={`mailto:${candidate.email}`} style={{ color: '#FF8C00' }}>
              {candidate.email}
            </a>
            {tel && (
              <a href={`tel:${phoneTel}`} style={{ color: '#fff' }}>
                {tel}
              </a>
            )}
            {candidate.pays && <span style={{ color: '#9CA3AF' }}>{candidate.pays}</span>}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '0.5rem',
          fontSize: '0.8rem',
          color: '#9CA3AF',
          marginBottom: '0.75rem',
        }}
      >
        {row.session_id && <span><strong style={{ color: '#fff' }}>Session :</strong> {row.session_id}</span>}
        {row.duree_semaines && <span><strong style={{ color: '#fff' }}>Durée :</strong> {row.duree_semaines} sem.</span>}
        {row.date_debut_souhaitee && (
          <span><strong style={{ color: '#fff' }}>Début souhaité :</strong> {row.date_debut_souhaitee}</span>
        )}
        <span>
          <strong style={{ color: '#fff' }}>Frais 100€ :</strong>{' '}
          {row.registration_fee_paid_at ? '✓ payés' : 'à venir (Stripe à activer)'}
        </span>
      </div>

      <details>
        <summary
          style={{
            cursor: 'pointer',
            fontSize: '0.75rem',
            color: '#71717a',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 600,
          }}
        >
          Voir form_data complet
        </summary>
        <pre
          style={{
            marginTop: '0.5rem',
            padding: '1rem',
            background: 'rgba(0,0,0,0.4)',
            borderRadius: '8px',
            fontSize: '0.7rem',
            overflowX: 'auto',
            color: '#e4e4e7',
            maxHeight: '300px',
          }}
        >
          {JSON.stringify(row.form_data, null, 2)}
        </pre>
      </details>
    </article>
  )
}
