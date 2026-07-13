import type { Metadata } from 'next'
import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import Topbar from '@/components/admin/ui/Topbar'
import Badge from '@/components/admin/ui/Badge'
import Icon from '@/components/admin/ui/Icon'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Leads Guide · MKR Admin',
}

interface LeadRow {
  id: string
  email: string
  locale: string | null
  source: string
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  referrer: string | null
  ip: string | null
  user_agent: string | null
  created_at: string
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

// Domaine lisible du referrer (l'URL complete est dans le title au survol).
function referrerHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export default async function AdminGuideLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; format?: string }>
}) {
  const params = await searchParams
  const supabase = getSupabaseAdmin()

  let query = supabase
    .from('guide_leads')
    .select('id, email, locale, source, utm_source, utm_medium, utm_campaign, referrer, ip, user_agent, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  if (params.source) {
    query = query.eq('source', params.source)
  }

  const { data: rawLeads, error } = await query
  const leads: LeadRow[] = (rawLeads ?? []) as LeadRow[]

  // Liste des sources distinctes pour le filtre
  const { data: sourceData } = await supabase
    .from('guide_leads')
    .select('source')
    .limit(2000)
  const sources = Array.from(new Set((sourceData ?? []).map((r: { source: string }) => r.source))).sort()

  // Export CSV
  if (params.format === 'csv') {
    const header = 'email,source,utm_source,utm_medium,utm_campaign,referrer,ip,created_at\n'
    const rows = leads.map(l => [
      l.email,
      l.source,
      l.utm_source ?? '',
      l.utm_medium ?? '',
      l.utm_campaign ?? '',
      l.referrer ?? '',
      l.ip ?? '',
      l.created_at,
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    return new Response(header + rows, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="guide-leads-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    }) as never
  }

  const csvHref = `/admin/guide-leads?format=csv${params.source ? `&source=${encodeURIComponent(params.source)}` : ''}`

  return (
    <>
      <Topbar nav="guide-leads" />
      <main className="adm-container">
        <h1 className="adm-h1">Leads Guide Caucase</h1>
        <p className="adm-h-meta">
          {leads.length} lead{leads.length > 1 ? 's' : ''}
          {params.source ? ` sur la source « ${params.source} »` : ' au total (500 max affichés)'}
          {sources.length > 1 && ` · ${sources.length} sources`}
        </p>

        {error && (
          <div
            style={{
              margin: '1.25rem 0',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.06)',
              color: 'var(--adm-status-refusee)',
              fontSize: '0.85rem',
            }}
          >
            Erreur Supabase : {error.message}
          </div>
        )}

        <div className="adm-toolbar" style={{ marginTop: '1.25rem' }}>
          <div className="adm-filter-row">
            <span className="adm-filter-row-label">Source</span>
            <Link
              href="/admin/guide-leads"
              className={!params.source ? 'adm-pill adm-pill--active' : 'adm-pill'}
            >
              Toutes
            </Link>
            {sources.map((s) => (
              <Link
                key={s}
                href={`/admin/guide-leads?source=${encodeURIComponent(s)}`}
                className={params.source === s ? 'adm-pill adm-pill--active' : 'adm-pill'}
              >
                {s}
              </Link>
            ))}
            <a
              href={csvHref}
              download
              className="adm-pill"
              style={{ marginLeft: 'auto', gap: '0.4rem' }}
              title="Télécharge les leads affichés en CSV"
            >
              <Icon name="file-text" size={13} strokeWidth={2.2} />
              Export CSV
            </a>
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="adm-list-empty" style={{ marginTop: '1rem' }}>
            <div className="adm-list-empty-icon" aria-hidden="true" style={{ color: 'var(--adm-text-muted)', fontSize: 'inherit' }}>
              <Icon name="inbox" size={40} strokeWidth={1.6} />
            </div>
            <p className="adm-list-empty-title">Aucun lead pour ce filtre</p>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              Les emails capturés par le formulaire du guide apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Email</th>
                  <th>Source</th>
                  <th>UTM</th>
                  <th>Referrer</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--adm-text-muted)', fontSize: '0.82rem', fontVariantNumeric: 'tabular-nums' }}>
                      {formatDate(lead.created_at)}
                    </td>
                    <td>
                      <a href={`mailto:${lead.email}`} style={{ color: 'var(--adm-text-primary)' }}>
                        {lead.email}
                      </a>
                      {lead.locale === 'en' && (
                        <span style={{ marginLeft: '0.45rem', display: 'inline-flex', verticalAlign: 'middle' }} title="Lead capté sur le site EN">
                          <Badge color="#3b82f6">EN</Badge>
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{lead.source}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)' }}>
                      {lead.utm_source && <div>src : {lead.utm_source}</div>}
                      {lead.utm_medium && <div>med : {lead.utm_medium}</div>}
                      {lead.utm_campaign && <div>cmp : {lead.utm_campaign}</div>}
                      {!lead.utm_source && !lead.utm_medium && !lead.utm_campaign && <span>·</span>}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)' }} title={lead.referrer ?? undefined}>
                      {lead.referrer ? referrerHost(lead.referrer) : '·'}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                      {lead.ip || '·'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
