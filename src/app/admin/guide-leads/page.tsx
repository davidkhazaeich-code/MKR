import type { Metadata } from 'next'
import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import Topbar from '@/components/admin/ui/Topbar'

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

  return (
    <>
      <Topbar
        crumbs={[
          { label: 'Candidatures', href: '/admin/inscriptions' },
          { label: 'Leads Guide' },
        ]}
      />

      <div className="adm-container">
        <div className="adm-h-meta">
          <h1 className="adm-h1">Leads Guide Caucase</h1>
          <p style={{ color: 'var(--adm-text-muted, #94a3b8)', margin: '0.25rem 0 0' }}>
            {leads.length} {leads.length > 1 ? 'leads captés' : 'lead capté'}
            {params.source ? ` sur la source « ${params.source} »` : ' au total (500 max affichés)'}
            {sources.length > 1 && ` · ${sources.length} sources distinctes`}
          </p>
        </div>

        <div className="adm-toolbar" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="adm-filter-row">
            <span className="adm-filter-row-label">Source :</span>
            <Link
              href="/admin/guide-leads"
              className="adm-filter-chip"
              data-active={!params.source}
              style={{ background: !params.source ? 'var(--adm-accent, #E11D2A)' : 'var(--adm-surface-2, #1e293b)', color: !params.source ? '#fff' : 'var(--adm-text, #cbd5e1)' }}
            >
              Toutes
            </Link>
            {sources.map(s => (
              <Link
                key={s}
                href={`/admin/guide-leads?source=${encodeURIComponent(s)}`}
                className="adm-filter-chip"
                data-active={params.source === s}
                style={{ background: params.source === s ? 'var(--adm-accent, #E11D2A)' : 'var(--adm-surface-2, #1e293b)', color: params.source === s ? '#fff' : 'var(--adm-text, #cbd5e1)' }}
              >
                {s}
              </Link>
            ))}
          </div>
          <a
            href={`/admin/guide-leads?format=csv${params.source ? `&source=${encodeURIComponent(params.source)}` : ''}`}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '6px',
              background: 'var(--adm-accent, #E11D2A)',
              color: '#fff',
              textDecoration: 'none',
              fontFamily: "'Roboto Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '0.85rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
            download
          >
            Export CSV
          </a>
        </div>

        {error && (
          <p style={{ color: 'crimson', padding: '1rem 0' }}>Erreur DB : {error.message}</p>
        )}

        {leads.length === 0 ? (
          <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--adm-text-muted, #94a3b8)' }}>
            <p>Aucun lead pour ce filtre.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', background: 'var(--adm-surface, #0f172a)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--adm-surface-2, #1e293b)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--adm-text-muted, #94a3b8)' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--adm-text-muted, #94a3b8)' }}>Email</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--adm-text-muted, #94a3b8)' }}>Source</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--adm-text-muted, #94a3b8)' }}>UTM</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--adm-text-muted, #94a3b8)' }}>Referrer</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--adm-text-muted, #94a3b8)' }}>IP</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr key={lead.id} style={{ borderTop: i > 0 ? '1px solid var(--adm-surface-2, #1e293b)' : 'none' }}>
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', color: 'var(--adm-text-muted, #94a3b8)', fontSize: '0.85rem' }}>{formatDate(lead.created_at)}</td>
                    <td style={{ padding: '0.75rem 1rem' }}><a href={`mailto:${lead.email}`} style={{ color: 'var(--adm-text, #cbd5e1)', textDecoration: 'none' }}>{lead.email}</a></td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{lead.source}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--adm-text-muted, #94a3b8)' }}>
                      {lead.utm_source && <div>src : {lead.utm_source}</div>}
                      {lead.utm_medium && <div>med : {lead.utm_medium}</div>}
                      {lead.utm_campaign && <div>cmp : {lead.utm_campaign}</div>}
                      {!lead.utm_source && !lead.utm_medium && !lead.utm_campaign && <span>·</span>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--adm-text-muted, #94a3b8)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lead.referrer || '·'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--adm-text-muted, #94a3b8)' }}>{lead.ip || '·'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
