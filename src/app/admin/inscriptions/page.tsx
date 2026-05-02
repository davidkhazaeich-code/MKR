import type { Metadata } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import InscriptionsList from '@/components/admin/InscriptionsList'
import StatsBand from '@/components/admin/StatsBand'
import Pipeline from '@/components/admin/ui/Pipeline'
import Topbar from '@/components/admin/ui/Topbar'
import { STATUS_LABEL, STATUS_VALUES, type Status } from '@/lib/admin-transitions'
import { SESSIONS } from '@/data/sessions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Candidatures · MKR Admin',
}

type TunnelType = 'session' | 'custom' | 'famille' | 'groupe'

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

interface StatsRow {
  status: Status
  status_changed_at: string
  session_id: string | null
  tunnel_type: TunnelType
}

const TUNNELS: TunnelType[] = ['session', 'custom', 'famille', 'groupe']
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

// Special values du parametre ?session=
const SESSION_UPCOMING = 'upcoming'
const SESSION_NONE = 'none'

export default async function AdminInscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tunnel?: string; status?: string; session?: string }>
}) {
  const params = await searchParams

  let rows: ListRow[] = []
  let allRowsForStats: StatsRow[] = []
  let configError: string | null = null
  let queryError: string | null = null

  // Sessions officielles connues, triees par startDate desc (futures en haut)
  const knownSessionIds = SESSIONS.map((s) => s.id)
  const todayIso = new Date().toISOString().slice(0, 10)
  const upcomingIds = SESSIONS.filter((s) => s.endDate >= todayIso).map((s) => s.id)
  const sortedSessions = [...SESSIONS].sort((a, b) => b.startDate.localeCompare(a.startDate))

  try {
    const supabase = getSupabaseAdmin()

    // Stats : toute la base avec session_id + tunnel pour pouvoir agreger
    const statsRes = await supabase
      .from('candidatures')
      .select('status, status_changed_at, session_id, tunnel_type')
      .limit(2000)
    allRowsForStats = (statsRes.data ?? []) as unknown as StatsRow[]

    // Liste : appliquer les filtres URL
    let q = supabase
      .from('candidatures')
      .select(`
        id, created_at, status_changed_at, tunnel_type, session_id, duree_semaines,
        date_debut_souhaitee, status, registration_fee_paid_at, notes_admin,
        candidate:candidates ( prenom, nom, email, telephone, pays )
      `)
      .order('created_at', { ascending: false })
      .limit(200)

    if (params.tunnel && (TUNNELS as string[]).includes(params.tunnel)) {
      q = q.eq('tunnel_type', params.tunnel)
    }
    if (params.status && (STATUS_VALUES as readonly string[]).includes(params.status)) {
      q = q.eq('status', params.status)
    }

    if (params.session === SESSION_NONE) {
      q = q.is('session_id', null)
    } else if (params.session === SESSION_UPCOMING) {
      if (upcomingIds.length > 0) {
        q = q.in('session_id', upcomingIds)
      }
    } else if (params.session && knownSessionIds.includes(params.session)) {
      q = q.eq('session_id', params.session)
    }

    const { data, error } = await q
    queryError = error?.message ?? null
    rows = ((data ?? []) as unknown) as ListRow[]
  } catch (err) {
    configError = (err as Error).message
  }

  if (configError) {
    return (
      <>
        <Topbar />
        <div className="adm-container">
          <h1 className="adm-h1">Candidatures MKR</h1>
          <p style={{ color: 'var(--adm-status-refusee)' }}>Configuration manquante : {configError}</p>
        </div>
      </>
    )
  }

  // Stats : breakdown par status global
  const statusCounts = STATUS_VALUES.reduce<Record<Status, number>>((acc, s) => {
    acc[s] = 0
    return acc
  }, {} as Record<Status, number>)
  let staleVisioCount = 0
  for (const r of allRowsForStats) {
    statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1
    if (r.status === 'recue' && Date.now() - new Date(r.status_changed_at).getTime() > SEVEN_DAYS) {
      staleVisioCount += 1
    }
  }

  // Counts par session_id (toutes sessions connues + orphans + null)
  const sessionCounts: Record<string, number> = {}
  let nullSessionCount = 0
  let upcomingCount = 0
  for (const r of allRowsForStats) {
    if (r.session_id === null) {
      nullSessionCount += 1
    } else {
      sessionCounts[r.session_id] = (sessionCounts[r.session_id] ?? 0) + 1
      if (upcomingIds.includes(r.session_id)) upcomingCount += 1
    }
  }
  const orphanSessionIds = Object.keys(sessionCounts).filter((id) => !knownSessionIds.includes(id))

  // Tunnel counts (basé sur rows actuelles pour montrer ce qui s'affiche)
  const tunnelCounts: Record<TunnelType, number> = { session: 0, custom: 0, famille: 0, groupe: 0 }
  for (const r of rows) {
    tunnelCounts[r.tunnel_type] = (tunnelCounts[r.tunnel_type] ?? 0) + 1
  }

  const buildHref = (overrides: Partial<{ tunnel: string; status: string; session: string }>): string => {
    const merged = { tunnel: params.tunnel, status: params.status, session: params.session, ...overrides }
    const usp = new URLSearchParams()
    if (merged.tunnel) usp.set('tunnel', merged.tunnel)
    if (merged.status) usp.set('status', merged.status)
    if (merged.session) usp.set('session', merged.session)
    const qs = usp.toString()
    return qs ? `/admin/inscriptions?${qs}` : '/admin/inscriptions'
  }

  const generatedAt = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const total = allRowsForStats.length

  return (
    <>
      <Topbar subtitle="Candidatures" />
      <main className="adm-container">
        <h1 className="adm-h1">Candidatures</h1>
        <p className="adm-h-meta">
          {total} dossier{total > 1 ? 's' : ''} au total · Mis à jour à {generatedAt}{' '}
          <a href="/admin/inscriptions">↻ Rafraîchir</a>
        </p>

        <StatsBand countsByStatus={statusCounts} staleVisioCount={staleVisioCount} total={total} />

        <Pipeline counts={statusCounts} />

        {queryError && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.06)',
              color: 'var(--adm-status-refusee)',
              fontSize: '0.85rem',
            }}
          >
            Erreur Supabase : {queryError}
          </div>
        )}

        <div className="adm-toolbar">
          {/* === Session filter (en premier — c'est le plus impactant business) === */}
          <div className="adm-filter-row">
            <span className="adm-filter-row-label">Session</span>
            <a
              href={buildHref({ session: undefined })}
              className={!params.session ? 'adm-pill adm-pill--active' : 'adm-pill'}
            >
              Toutes
              <span style={{ color: 'var(--adm-text-faint)', fontWeight: 500 }}>{total}</span>
            </a>
            {upcomingIds.length > 0 && (
              <a
                href={buildHref({ session: SESSION_UPCOMING })}
                data-accent
                className={params.session === SESSION_UPCOMING ? 'adm-pill adm-pill--active' : 'adm-pill'}
                style={{ ['--adm-pill-accent' as string]: 'var(--adm-status-validee)' }}
              >
                À venir
                <span style={{ color: 'var(--adm-text-faint)', fontWeight: 500 }}>{upcomingCount}</span>
              </a>
            )}
            {sortedSessions.map((s) => {
              const isUpcoming = upcomingIds.includes(s.id)
              return (
                <a
                  key={s.id}
                  href={buildHref({ session: s.id })}
                  data-accent
                  className={params.session === s.id ? 'adm-pill adm-pill--active' : 'adm-pill'}
                  style={{
                    ['--adm-pill-accent' as string]: isUpcoming
                      ? 'var(--adm-tunnel-session)'
                      : 'var(--adm-text-muted)',
                  }}
                  title={`${s.seasonLabel} (${s.dates}) · capacité ${s.maxCapacity}`}
                >
                  {s.label}
                  <span style={{ fontSize: '0.7rem', opacity: 0.7, marginLeft: '0.1rem' }}>
                    · {s.dates.split(' - ')[0]}
                  </span>
                  <span style={{ color: 'var(--adm-text-faint)', fontWeight: 500 }}>
                    {sessionCounts[s.id] ?? 0}
                  </span>
                </a>
              )
            })}
            {orphanSessionIds.map((id) => (
              <a
                key={id}
                href={buildHref({ session: id })}
                className={params.session === id ? 'adm-pill adm-pill--active' : 'adm-pill'}
                title="Session non listée dans data/sessions.ts (orpheline)"
              >
                {id} (?)
                <span style={{ color: 'var(--adm-text-faint)', fontWeight: 500 }}>
                  {sessionCounts[id]}
                </span>
              </a>
            ))}
            {nullSessionCount > 0 && (
              <a
                href={buildHref({ session: SESSION_NONE })}
                className={params.session === SESSION_NONE ? 'adm-pill adm-pill--active' : 'adm-pill'}
                title="Tunnels custom / famille (sur mesure) / groupe sans session officielle"
              >
                Sur mesure
                <span style={{ color: 'var(--adm-text-faint)', fontWeight: 500 }}>{nullSessionCount}</span>
              </a>
            )}
          </div>

          <div className="adm-filter-row">
            <span className="adm-filter-row-label">Tunnel</span>
            <a
              href={buildHref({ tunnel: undefined })}
              className={!params.tunnel ? 'adm-pill adm-pill--active' : 'adm-pill'}
            >
              Tous
            </a>
            {TUNNELS.map((t) => (
              <a
                key={t}
                href={buildHref({ tunnel: t })}
                data-accent
                className={params.tunnel === t ? 'adm-pill adm-pill--active' : 'adm-pill'}
                style={{ ['--adm-pill-accent' as string]: TUNNEL_COLOR[t] }}
              >
                {TUNNEL_LABEL[t]}
                <span style={{ color: 'var(--adm-text-faint)', fontWeight: 500 }}>
                  {tunnelCounts[t] || 0}
                </span>
              </a>
            ))}
          </div>

          <div className="adm-filter-row">
            <span className="adm-filter-row-label">Statut</span>
            <a
              href={buildHref({ status: undefined })}
              className={!params.status ? 'adm-pill adm-pill--active' : 'adm-pill'}
            >
              Tous
            </a>
            {STATUS_VALUES.map((s) => (
              <a
                key={s}
                href={buildHref({ status: s })}
                className={params.status === s ? 'adm-pill adm-pill--active' : 'adm-pill'}
              >
                {STATUS_LABEL[s]}
              </a>
            ))}
          </div>
        </div>

        <InscriptionsList rows={rows} />
      </main>
    </>
  )
}
