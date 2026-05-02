import type { Metadata } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import InscriptionsList from '@/components/admin/InscriptionsList'
import StatsBand from '@/components/admin/StatsBand'
import Pipeline from '@/components/admin/ui/Pipeline'
import Topbar from '@/components/admin/ui/Topbar'
import { STATUS_LABEL, STATUS_VALUES, type Status } from '@/lib/admin-transitions'

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

const TUNNELS: TunnelType[] = ['session', 'custom', 'famille', 'groupe']
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

export default async function AdminInscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tunnel?: string; status?: string }>
}) {
  const params = await searchParams

  let rows: ListRow[] = []
  let allRowsForStats: { status: Status; status_changed_at: string }[] = []
  let configError: string | null = null
  let queryError: string | null = null

  try {
    const supabase = getSupabaseAdmin()

    // Stats : on compte sur toute la base (pas filtree par tunnel/status)
    const statsRes = await supabase
      .from('candidatures')
      .select('status, status_changed_at')
      .limit(2000)
    allRowsForStats = (statsRes.data ?? []) as unknown as typeof allRowsForStats

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

  // Calcule stats globales
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

  // Counts tunnel pour les pills (basé sur rows filtres OU global ?
  // On utilise global pour que les pills affichent toujours le total reel)
  const tunnelCounts: Record<TunnelType, number> = { session: 0, custom: 0, famille: 0, groupe: 0 }
  for (const r of rows) {
    tunnelCounts[r.tunnel_type] = (tunnelCounts[r.tunnel_type] ?? 0) + 1
  }

  const buildHref = (overrides: Partial<{ tunnel: string; status: string }>): string => {
    const merged = { tunnel: params.tunnel, status: params.status, ...overrides }
    const usp = new URLSearchParams()
    if (merged.tunnel) usp.set('tunnel', merged.tunnel)
    if (merged.status) usp.set('status', merged.status)
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
