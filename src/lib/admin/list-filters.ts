import { getUnfinishedSessions, sessionFromId } from '@/data/sessions'
import { STATUS_VALUES, type Status } from '@/lib/admin-transitions'
import type { DossierRow } from '@/lib/admin/types'
import type { NextStep, StepKind } from '@/lib/admin/next-step'
import { ACTIVE_STATUSES } from '@/lib/admin/labels'

export type StatutFilter = 'actifs' | 'tous' | Status
export type TriKey = 'recentes' | 'anciennes' | 'nom' | 'depart'
export interface ListFilters {
  q: string; statut: StatutFilter; session: string; tunnel: string; discipline: string
  source: string; partenaire: string; langue: string; etape: string; tri: TriKey
}
export interface ListItem { row: DossierRow; step: NextStep }

export const DEFAULT_FILTERS: ListFilters = {
  q: '', statut: 'actifs', session: '', tunnel: '', discipline: '', source: '', partenaire: '', langue: '', etape: '', tri: 'recentes',
}
export const ETAPE_OPTIONS: { value: string; label: string; kinds: StepKind[] }[] = [
  { value: 'visio', label: 'Visio a venir', kinds: ['visio_a_venir', 'visio_reservee'] },
  { value: 'a_trancher', label: 'Visio passee, a trancher', kinds: ['visio_passee'] },
  { value: 'a_relancer', label: 'A relancer', kinds: ['a_relancer'] },
  { value: 'nouvelle', label: 'Nouvelles', kinds: ['nouvelle'] },
  { value: 'devis', label: 'Devis a envoyer', kinds: ['devis_a_envoyer'] },
  { value: 'contrat', label: 'Contrat a envoyer', kinds: ['contrat_a_envoyer', 'contrat_sans_echeance'] },
  { value: 'paiement', label: 'Paiement attendu ou en retard', kinds: ['paiement_attendu', 'paiement_en_retard', 'a_solder'] },
  { value: 'camp_parti', label: 'Camp parti', kinds: ['camp_parti'] },
  { value: 'depart', label: 'Soldes, depart a venir', kinds: ['depart_a_venir'] },
  { value: 'a_cloturer', label: 'Camp termine, a cloturer', kinds: ['camp_a_cloturer'] },
]
const TRI_VALUES: TriKey[] = ['recentes', 'anciennes', 'nom', 'depart']
const STATUT_VALUES: StatutFilter[] = ['actifs', 'tous', ...STATUS_VALUES]
const EXTRA_KEYS = ['session', 'tunnel', 'discipline', 'source', 'partenaire', 'langue', 'etape'] as const

export function normalizeSearch(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

export function parseFilters(sp: URLSearchParams): ListFilters {
  const statutRaw = sp.get('statut') ?? sp.get('status') ?? ''
  const triRaw = sp.get('tri') ?? ''
  return {
    q: sp.get('q') ?? '',
    statut: (STATUT_VALUES as string[]).includes(statutRaw) ? (statutRaw as StatutFilter) : DEFAULT_FILTERS.statut,
    session: sp.get('session') ?? '',
    tunnel: sp.get('tunnel') ?? '',
    discipline: sp.get('discipline') ?? '',
    source: sp.get('source') ?? '',
    partenaire: sp.get('partenaire') ?? sp.get('referralCode') ?? '',
    langue: sp.get('langue') ?? '',
    etape: sp.get('etape') ?? '',
    tri: (TRI_VALUES as string[]).includes(triRaw) ? (triRaw as TriKey) : DEFAULT_FILTERS.tri,
  }
}

export function filtersToQuery(f: ListFilters): string {
  const usp = new URLSearchParams()
  if (f.q.trim()) usp.set('q', f.q.trim())
  if (f.statut !== DEFAULT_FILTERS.statut) usp.set('statut', f.statut)
  for (const k of EXTRA_KEYS) if (f[k]) usp.set(k, f[k])
  if (f.tri !== DEFAULT_FILTERS.tri) usp.set('tri', f.tri)
  return usp.toString()
}

export function countExtraFilters(f: ListFilters): number {
  return EXTRA_KEYS.filter((k) => f[k]).length
}

function matchesStatut(status: Status, statut: StatutFilter): boolean {
  if (statut === 'tous') return true
  if (statut === 'actifs') return ACTIVE_STATUSES.includes(status)
  return status === statut
}

export function matchesFilters(item: ListItem, f: ListFilters, skip?: keyof ListFilters): boolean {
  const r = item.row
  if (skip !== 'statut' && !matchesStatut(r.status, f.statut)) return false
  if (skip !== 'session' && f.session) {
    if (f.session === 'none') { if (r.session_id) return false }
    else if (f.session === 'upcoming') { if (!r.session_id || !getUnfinishedSessions().some((s) => s.id === r.session_id)) return false }
    else if (r.session_id !== f.session) return false
  }
  if (skip !== 'tunnel' && f.tunnel && r.tunnel_type !== f.tunnel) return false
  if (skip !== 'discipline' && f.discipline && r.camp_discipline !== f.discipline) return false
  if (skip !== 'source' && f.source) {
    const src = r.attribution_source ?? 'inconnue'
    if (src !== f.source) return false
  }
  if (skip !== 'partenaire' && f.partenaire) {
    if (f.partenaire === 'invalid') { if (r.referral_code_valid !== false) return false }
    else if (f.partenaire === 'none') { if (r.referral_code) return false }
    else if (f.partenaire === 'due') { if (r.referral_payout_status !== 'due') return false }
    else if (r.referral_code !== f.partenaire) return false
  }
  if (skip !== 'langue' && f.langue && (r.submission_language ?? 'fr') !== f.langue) return false
  if (skip !== 'etape' && f.etape) {
    const opt = ETAPE_OPTIONS.find((o) => o.value === f.etape)
    if (opt && !opt.kinds.includes(item.step.kind)) return false
  }
  if (skip !== 'q' && f.q.trim()) {
    const q = normalizeSearch(f.q)
    const c = r.candidate
    if (!c) return false
    // Telephone : la base stocke du E.164 (+33612...), Ruslan tape souvent le format
    // national (06 12...). On compare sans le 0 de tete.
    const digits = q.replace(/\D/g, '').replace(/^0+/, '')
    const phone = (c.telephone ?? '').replace(/\D/g, '')
    const hay = normalizeSearch(`${c.prenom} ${c.nom} ${c.nom} ${c.prenom} ${c.email} ${c.pays ?? ''}`)
    const textHit = hay.includes(q)
    const phoneHit = digits.length >= 6 && phone.includes(digits)
    if (!textHit && !phoneHit) return false
  }
  return true
}

// Date de depart d'un dossier : session officielle, sinon contrat, sinon souhait.
const startOf = (r: DossierRow): string | null =>
  sessionFromId(r.session_id)?.startDate ?? r.contract_start_date ?? r.date_debut_souhaitee ?? null

export function sortItems(items: ListItem[], tri: TriKey): ListItem[] {
  const copy = [...items]
  if (tri === 'anciennes') return copy.sort((a, b) => a.row.created_at.localeCompare(b.row.created_at))
  if (tri === 'nom') return copy.sort((a, b) => `${a.row.candidate?.nom ?? ''} ${a.row.candidate?.prenom ?? ''}`.localeCompare(`${b.row.candidate?.nom ?? ''} ${b.row.candidate?.prenom ?? ''}`, 'fr'))
  if (tri === 'depart') return copy.sort((a, b) => {
    const sa = startOf(a.row), sb = startOf(b.row)
    if (!sa && !sb) return 0
    if (!sa) return 1
    if (!sb) return -1
    return sa.localeCompare(sb)
  })
  return copy.sort((a, b) => b.row.created_at.localeCompare(a.row.created_at))
}

export function statusCounts(items: ListItem[], f: ListFilters): Record<StatutFilter, number> {
  const out = Object.fromEntries(STATUT_VALUES.map((s) => [s, 0])) as Record<StatutFilter, number>
  for (const it of items) {
    if (!matchesFilters(it, f, 'statut')) continue
    out.tous += 1
    out[it.row.status] += 1
    if (ACTIVE_STATUSES.includes(it.row.status)) out.actifs += 1
  }
  return out
}
