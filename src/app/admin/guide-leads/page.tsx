import type { Metadata } from 'next'
import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import AdminShell from '@/components/admin/shell/AdminShell'
import RefreshButton from '@/components/admin/shell/RefreshButton'
import { ButtonLink } from '@/components/admin/ui/Button'
import Icon from '@/components/admin/ui/Icon'
import { formatNumericDate, formatTime, plural } from '@/lib/admin/format'

// Leads du guide (spec 6.5) : memes requetes que l'ancienne page (500 leads
// au plus, filtre ?source= lu cote serveur, sources distinctes sur 2 000
// lignes), filtres de source en pastilles, export CSV par la route dediee
// (meme parametre source), tableau quand sa largeur le permet, lignes
// empilees sinon (admin.css, "Partenaires et Leads guide").

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Leads guide · MKR Admin',
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

type SearchParams = Promise<{ source?: string | string[] }>

const formatDate = (iso: string): string => `${formatNumericDate(iso)} ${formatTime(iso)}`

// Domaine lisible du referrer (l'URL complete est dans le title au survol).
function referrerHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** Termes UTM presents : "src : google", "med : cpc", "cmp : mkr-guide-caucase". */
function utmParts(lead: LeadRow): string[] {
  const parts: string[] = []
  if (lead.utm_source) parts.push(`src : ${lead.utm_source}`)
  if (lead.utm_medium) parts.push(`med : ${lead.utm_medium}`)
  if (lead.utm_campaign) parts.push(`cmp : ${lead.utm_campaign}`)
  return parts
}

const sourceHref = (source: string | null): string =>
  source ? `/admin/guide-leads?source=${encodeURIComponent(source)}` : '/admin/guide-leads'

/** Email en lien mailto, puis "EN" pour un lead du site anglais. `stretched` : le lien couvre la ligne (liste mobile). */
function Email({ lead, stretched = false }: { lead: LeadRow; stretched?: boolean }) {
  // Coupure permise seulement apres l'arobase (jamais au milieu d'un mot).
  const at = lead.email.indexOf('@')
  return (
    <span className="adm-leads-email-line">
      <a href={`mailto:${lead.email}`} className={stretched ? 'adm-leads-email adm-row-link' : 'adm-leads-email'}>
        {at > 0 ? (
          <>
            {lead.email.slice(0, at + 1)}
            <wbr />
            {lead.email.slice(at + 1)}
          </>
        ) : (
          lead.email
        )}
      </a>
      {lead.locale === 'en' && (
        <span className="adm-leads-lang" title="Lead capté sur le site EN">
          <span aria-hidden="true">EN</span>
          <span className="adm-sr-only">site anglais</span>
        </span>
      )}
    </span>
  )
}

function LoadError({ title, message, retry }: { title: string; message: string; retry: string | null }) {
  return (
    <AdminShell active="leads" title="Leads guide">
      <div className="adm-container">
        <div className="adm-page-head">
          <h1 className="adm-h1">Leads guide</h1>
        </div>
        <section className="adm-empty adm-tone--danger" aria-labelledby="leads-error-title">
          <span className="adm-empty-icon" aria-hidden="true">
            <Icon name="alert-triangle" size={28} />
          </span>
          <h2 id="leads-error-title" className="adm-empty-title">
            {title}
          </h2>
          <p className="adm-empty-text">{message}</p>
          {retry && (
            <div className="adm-empty-actions">
              <ButtonLink href={retry} variant="primary" icon="refresh">
                Réessayer
              </ButtonLink>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  )
}

export default async function AdminGuideLeadsPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = (await searchParams).source
  const source = (Array.isArray(raw) ? raw[0] : raw) || null

  let leads: LeadRow[] = []
  let sourceRows: { source: string }[] = []
  try {
    const supabase = getSupabaseAdmin()
    let query = supabase
      .from('guide_leads')
      .select('id, email, locale, source, utm_source, utm_medium, utm_campaign, referrer, ip, user_agent, created_at')
      .order('created_at', { ascending: false })
      .limit(500)
    if (source) query = query.eq('source', source)

    const { data: rawLeads, error } = await query
    if (error) {
      return <LoadError title="Chargement impossible" message={`Les leads n'ont pas pu être lus (${error.message}).`} retry={sourceHref(source)} />
    }
    leads = (rawLeads ?? []) as LeadRow[]

    // Liste des sources distinctes pour le filtre
    const { data: sourceData } = await supabase.from('guide_leads').select('source').limit(2000)
    sourceRows = (sourceData ?? []) as { source: string }[]
  } catch (err) {
    return <LoadError title="Configuration manquante" message={err instanceof Error ? err.message : String(err)} retry={null} />
  }

  const perSource = new Map<string, number>()
  for (const r of sourceRows) perSource.set(r.source, (perSource.get(r.source) ?? 0) + 1)
  const sources = Array.from(perSource.keys()).sort()

  // Export CSV : route handler dediee (retourner une Response depuis un server
  // component ne marche pas, Next servait le HTML de la page a la place du CSV).
  const csvHref = `/api/admin/guide-leads/export${source ? `?source=${encodeURIComponent(source)}` : ''}`

  const chips: { label: string; value: string | null; count: number }[] = [
    { label: 'Toutes', value: null, count: sourceRows.length },
    ...sources.map((s) => ({ label: s, value: s, count: perSource.get(s) ?? 0 })),
  ]
  if (source && !perSource.has(source)) chips.push({ label: source, value: source, count: 0 })

  return (
    <AdminShell active="leads" title="Leads guide">
      <div className="adm-container adm-leads">
        <header className="adm-page-head adm-leads-head">
          <div>
            <h1 className="adm-h1">Leads guide</h1>
            <p className="adm-page-meta">
              {leads.length === 0 ? 'Aucun lead' : plural(leads.length, 'lead', 'leads')}
              {source ? ` sur la source « ${source} »` : leads.length > 0 ? ' au total (500 au plus affichés)' : ''}
              {sources.length > 1 && ` · ${sources.length} sources`}
            </p>
          </div>
          <RefreshButton variant="secondary" size="sm" className="adm-only-desktop" />
        </header>

        <div className="adm-leads-toolbar">
          <nav className="adm-chips adm-leads-sources" aria-label="Filtrer par source">
            {chips.map((c) => {
              const active = c.value === source
              return (
                <Link
                  key={c.value ?? ''}
                  href={sourceHref(c.value)}
                  className={active ? 'adm-chip adm-chip--active' : 'adm-chip'}
                  aria-current={active ? 'true' : undefined}
                >
                  {c.label} <span className="adm-chip-count">{c.count}</span>
                </Link>
              )
            })}
          </nav>
          <ButtonLink href={csvHref} download size="sm" className="adm-leads-export">
            Exporter en CSV
          </ButtonLink>
        </div>

        {leads.length === 0 ? (
          <section className="adm-empty" aria-labelledby="leads-empty-title">
            <span className="adm-empty-icon" aria-hidden="true">
              <Icon name="inbox" size={28} />
            </span>
            <h2 id="leads-empty-title" className="adm-empty-title">
              {source ? 'Aucun lead pour cette source' : "Aucun lead pour l'instant"}
            </h2>
            <p className="adm-empty-text">Les emails capturés par le formulaire du guide apparaîtront ici.</p>
            {source && (
              <div className="adm-empty-actions">
                <ButtonLink href="/admin/guide-leads">Voir toutes les sources</ButtonLink>
              </div>
            )}
          </section>
        ) : (
          <div className="adm-leads-list">
            <div className="adm-table-wrap adm-leads-table">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Email</th>
                    <th scope="col">Source</th>
                    <th scope="col">UTM</th>
                    <th scope="col">Référent</th>
                    <th scope="col">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const utm = utmParts(lead)
                    return (
                      <tr key={lead.id}>
                        <td className="adm-leads-date">{formatDate(lead.created_at)}</td>
                        <td>
                          <Email lead={lead} />
                        </td>
                        <td className="adm-leads-nowrap">{lead.source}</td>
                        <td className="adm-leads-muted">
                          {utm.length > 0 ? utm.map((u) => <span key={u} className="adm-leads-utm">{u}</span>) : 'Aucun'}
                        </td>
                        <td className="adm-leads-muted adm-leads-nowrap" title={lead.referrer ?? undefined}>
                          {lead.referrer ? referrerHost(lead.referrer) : 'Aucun'}
                        </td>
                        <td className="adm-leads-muted adm-leads-ip">{lead.ip || 'Non renseigné'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <ul className="adm-rows adm-leads-rows">
              {leads.map((lead) => {
                const utm = utmParts(lead)
                return (
                  <li key={lead.id} className="adm-row adm-leads-row">
                    <Email lead={lead} stretched />
                    <p className="adm-meta">
                      <span>{lead.source}</span>
                      <span>{formatDate(lead.created_at)}</span>
                    </p>
                    <p className="adm-leads-detail">{utm.length > 0 ? utm.join(' · ') : 'UTM : aucun'}</p>
                    <p className="adm-leads-detail">
                      Référent : {lead.referrer ? referrerHost(lead.referrer) : 'aucun'} · IP : {lead.ip || 'non renseignée'}
                    </p>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
