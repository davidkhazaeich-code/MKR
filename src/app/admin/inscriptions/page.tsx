import type { Metadata } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import InscriptionsList from '@/components/admin/InscriptionsList'
import { STATUS_LABEL, STATUS_VALUES, type Status } from '@/lib/admin-transitions'

// Page admin protegee par middleware (cookie httpOnly 'mkr_admin').
// Le proxy (src/proxy.ts) rewrite vers /admin/login si non authentifie.

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Candidatures MKR',
}

type TunnelType = 'session' | 'custom' | 'famille' | 'groupe'

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

interface ListRow {
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

const TUNNELS: TunnelType[] = ['session', 'custom', 'famille', 'groupe']

export default async function AdminInscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tunnel?: string; status?: string }>
}) {
  const params = await searchParams

  let rows: ListRow[] = []
  let configError: string | null = null
  let queryError: string | null = null

  try {
    const supabase = getSupabaseAdmin()
    let query = supabase
      .from('candidatures')
      .select(`
        id, created_at, status_changed_at, tunnel_type, session_id, duree_semaines,
        date_debut_souhaitee, status, registration_fee_paid_at, notes_admin,
        candidate:candidates ( prenom, nom, email, telephone, pays )
      `)
      .order('created_at', { ascending: false })
      .limit(200)

    if (params.tunnel && (TUNNELS as string[]).includes(params.tunnel)) {
      query = query.eq('tunnel_type', params.tunnel)
    }
    if (params.status && (STATUS_VALUES as readonly string[]).includes(params.status)) {
      query = query.eq('status', params.status)
    }

    const { data, error } = await query
    queryError = error?.message ?? null
    rows = ((data ?? []) as unknown) as ListRow[]
  } catch (err) {
    configError = (err as Error).message
  }

  if (configError) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>Candidatures MKR</h1>
        <p style={{ color: '#fca5a5' }}>Configuration manquante : {configError}</p>
      </div>
    )
  }

  // Counts par tunnel pour les pills
  const tunnelCounts = rows.reduce<Record<TunnelType, number>>(
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

  // Construit URL en preservant le filtre opposé
  const buildHref = (overrides: Partial<{ tunnel: string; status: string }>): string => {
    const merged = { tunnel: params.tunnel, status: params.status, ...overrides }
    const usp = new URLSearchParams()
    if (merged.tunnel) usp.set('tunnel', merged.tunnel)
    if (merged.status) usp.set('status', merged.status)
    const qs = usp.toString()
    return qs ? `/admin/inscriptions?${qs}` : '/admin/inscriptions'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <header
          style={{
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 600, margin: 0 }}>Candidatures MKR</h1>
            <p style={{ color: '#9CA3AF', fontSize: '0.85rem', margin: '0.4rem 0 0' }}>
              Mis à jour à {generatedAt}.{' '}
              <a href="/admin/inscriptions" style={{ color: '#FF8C00', textDecoration: 'underline' }}>
                Rafraîchir
              </a>
              {' · '}
              <span style={{ color: '#71717a' }}>
                {rows.length} dossier{rows.length > 1 ? 's' : ''}
              </span>
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
              Déconnexion
            </button>
          </form>
        </header>

        {queryError && (
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
            Erreur Supabase : {queryError}
          </div>
        )}

        {/* Filtres tunnel */}
        <nav style={filterNav}>
          <span style={filterLabel}>Tunnel :</span>
          <FilterPill href={buildHref({ tunnel: undefined })} label="Tous" active={!params.tunnel} />
          {TUNNELS.map((t) => (
            <FilterPill
              key={t}
              href={buildHref({ tunnel: t })}
              label={`${TUNNEL_LABEL[t]} (${tunnelCounts[t]})`}
              active={params.tunnel === t}
              accent={TUNNEL_COLOR[t]}
            />
          ))}
        </nav>

        {/* Filtres status */}
        <nav style={{ ...filterNav, marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={filterLabel}>Statut :</span>
          <FilterPill href={buildHref({ status: undefined })} label="Tous" active={!params.status} />
          {STATUS_VALUES.map((s) => (
            <FilterPill
              key={s}
              href={buildHref({ status: s })}
              label={STATUS_LABEL[s]}
              active={params.status === s}
            />
          ))}
        </nav>

        <InscriptionsList rows={rows} />
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
        padding: '0.4rem 0.85rem',
        borderRadius: '999px',
        fontSize: '0.78rem',
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

const filterNav: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '0.75rem',
}

const filterLabel: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 700,
  color: '#71717a',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginRight: '0.4rem',
}
