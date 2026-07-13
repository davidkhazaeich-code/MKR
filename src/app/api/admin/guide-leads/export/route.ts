import { getSupabaseAdmin } from '@/lib/supabase-admin'

// GET /api/admin/guide-leads/export[?source=...]
// Export CSV des leads guide. Route handler dedie : retourner une Response
// depuis le server component de la page (ancien hack `as never`) ne produisait
// pas de CSV, Next renvoyait le HTML de la page. Protege par le proxy
// (cookie mkr_admin) comme toute route /api/admin/*.

export const dynamic = 'force-dynamic'

interface LeadRow {
  email: string
  source: string
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  referrer: string | null
  ip: string | null
  created_at: string
}

function csvCell(v: string): string {
  return `"${v.replace(/"/g, '""')}"`
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const source = url.searchParams.get('source')

  let query = getSupabaseAdmin()
    .from('guide_leads')
    .select('email, source, utm_source, utm_medium, utm_campaign, referrer, ip, created_at')
    .order('created_at', { ascending: false })
    .limit(2000)

  if (source) {
    query = query.eq('source', source)
  }

  const { data, error } = await query
  if (error) {
    return new Response(`Erreur Supabase : ${error.message}`, { status: 500 })
  }

  const leads = (data ?? []) as LeadRow[]
  const header = 'email,source,utm_source,utm_medium,utm_campaign,referrer,ip,created_at\n'
  const rows = leads
    .map((l) =>
      [
        l.email,
        l.source,
        l.utm_source ?? '',
        l.utm_medium ?? '',
        l.utm_campaign ?? '',
        l.referrer ?? '',
        l.ip ?? '',
        l.created_at,
      ]
        .map((v) => csvCell(String(v)))
        .join(','),
    )
    .join('\n')

  return new Response(header + rows, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="guide-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
