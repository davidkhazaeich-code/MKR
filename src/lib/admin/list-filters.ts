import { getUnfinishedSessions, sessionFromId } from '@/data/sessions'
import { getActiveCodes } from '@/data/referral-codes'
import { STATUS_VALUES, type Status } from '@/lib/admin-transitions'
import type { CampDiscipline, DossierRow, Lang, TunnelType } from '@/lib/admin/types'
import type { NextStep, StepKind } from '@/lib/admin/next-step'
import { ACTIVE_STATUSES, DISCIPLINE_LABEL, LANG_LABEL, TUNNEL_LABEL, sessionShortName } from '@/lib/admin/labels'
import { buildSessionsOverview, placesSummary } from '@/lib/admin/sessions-stats'
import { sourceLabel } from '@/lib/admin/row-helpers'
import { formatDayMonth } from '@/lib/admin/format'

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
  { value: 'visio', label: 'Visio à venir', kinds: ['visio_a_venir', 'visio_reservee'] },
  { value: 'a_trancher', label: 'Visio passée, à trancher', kinds: ['visio_passee'] },
  { value: 'a_relancer', label: 'À relancer', kinds: ['a_relancer'] },
  { value: 'nouvelle', label: 'Nouvelles', kinds: ['nouvelle'] },
  { value: 'devis', label: 'Devis à envoyer', kinds: ['devis_a_envoyer'] },
  { value: 'contrat', label: 'Contrat à envoyer', kinds: ['contrat_a_envoyer', 'contrat_sans_echeance'] },
  { value: 'paiement', label: 'Paiement attendu ou en retard', kinds: ['paiement_attendu', 'paiement_en_retard', 'a_solder'] },
  { value: 'camp_parti', label: 'Camp parti', kinds: ['camp_parti'] },
  { value: 'depart', label: 'Soldés, départ à venir', kinds: ['depart_a_venir'] },
  { value: 'a_cloturer', label: 'Camp terminé, à clôturer', kinds: ['camp_a_cloturer'] },
]
const TRI_VALUES: TriKey[] = ['recentes', 'anciennes', 'nom', 'depart']
const STATUT_VALUES: StatutFilter[] = ['actifs', 'tous', ...STATUS_VALUES]
const EXTRA_KEYS = ['session', 'tunnel', 'discipline', 'source', 'partenaire', 'langue', 'etape'] as const
/** Filtres du panneau (hors recherche, statut et tri) : compteur "Filtres (n)" et pastilles. */
export type ExtraKey = (typeof EXTRA_KEYS)[number]

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

// `now` : l'horloge de la page (nowIso du serveur), pour que "Camps a venir"
// donne le meme resultat au rendu serveur et a l'hydratation.
export function matchesFilters(item: ListItem, f: ListFilters, skip?: keyof ListFilters, now: Date = new Date()): boolean {
  const r = item.row
  if (skip !== 'statut' && !matchesStatut(r.status, f.statut)) return false
  if (skip !== 'session' && f.session) {
    if (f.session === 'none') { if (r.session_id) return false }
    else if (f.session === 'upcoming') { if (!r.session_id || !getUnfinishedSessions(now).some((s) => s.id === r.session_id)) return false }
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

export function statusCounts(items: ListItem[], f: ListFilters, now: Date = new Date()): Record<StatutFilter, number> {
  const out = Object.fromEntries(STATUT_VALUES.map((s) => [s, 0])) as Record<StatutFilter, number>
  for (const it of items) {
    if (!matchesFilters(it, f, 'statut', now)) continue
    out.tous += 1
    out[it.row.status] += 1
    if (ACTIVE_STATUSES.includes(it.row.status)) out.actifs += 1
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Options des filtres et libelles des pastilles                        */
/* ------------------------------------------------------------------ */

export interface FilterOption { value: string; label: string }
export type FilterOptions = Record<ExtraKey | 'tri', FilterOption[]>

/** Libelle de chaque controle du panneau de filtres. */
export const FILTER_LABEL: Record<ExtraKey | 'tri', string> = {
  session: 'Session', tunnel: 'Tunnel', discipline: 'Discipline', source: 'Source',
  partenaire: 'Partenaire', langue: 'Langue', etape: 'Étape', tri: 'Tri',
}

export const TRI_OPTIONS: FilterOption[] = [
  { value: 'recentes', label: 'Plus récentes' },
  { value: 'anciennes', label: 'Plus anciennes' },
  { value: 'nom', label: 'Nom' },
  { value: 'depart', label: 'Date de départ' },
]

// Sources connues, dans l'ordre du filtre (Google Ads en tete : priorite business).
const SOURCE_ORDER = ['google_ads', 'meta_ads', 'instagram', 'facebook', 'google_organic', 'referral', 'other', 'direct']
const PARTENAIRE_SPECIAL: Record<string, string> = { invalid: 'Code invalide', none: 'Sans code', due: 'Bonus dû' }

/** Libelle court d'une valeur de filtre (pastille "Session : Toussaint 2026"). */
export function filterValueLabel(key: ExtraKey, value: string): string {
  switch (key) {
    case 'session': {
      if (value === 'upcoming') return 'Camps à venir'
      if (value === 'none') return 'Sans session'
      const s = sessionFromId(value)
      return s ? sessionShortName(s) : value
    }
    case 'tunnel': return TUNNEL_LABEL[value as TunnelType] ?? value
    case 'discipline': return DISCIPLINE_LABEL[value as CampDiscipline] ?? value
    case 'source': return value === 'inconnue' ? 'Inconnue' : sourceLabel(value)
    case 'partenaire': return PARTENAIRE_SPECIAL[value] ?? value
    case 'langue': return LANG_LABEL[value as Lang] ?? value
    case 'etape': return ETAPE_OPTIONS.find((o) => o.value === value)?.label ?? value
  }
}

/** Une pastille par filtre actif, dans l'ordre du panneau. */
export function activeFilterChips(f: ListFilters): { key: ExtraKey; label: string }[] {
  return EXTRA_KEYS.filter((k) => f[k]).map((k) => ({ key: k, label: `${FILTER_LABEL[k]} : ${filterValueLabel(k, f[k])}` }))
}

/**
 * Options des `select` du panneau (le libelle du champ nomme le filtre :
 * l'option neutre dit seulement "Tous" ou "Toutes", sauf pour la session,
 * dont le champ est large). Session : toutes, camps a venir, chaque
 * session non terminee avec sa date et ses places, les sessions passees qui
 * portent un dossier, les ids inconnus du calendrier, puis sans session.
 * Une valeur courante absente des options (lien ancien, code desactive)
 * est ajoutee telle quelle : le `select` montre toujours le filtre applique.
 */
export function buildFilterOptions(rows: DossierRow[], now: Date, current: ListFilters = DEFAULT_FILTERS): FilterOptions {
  const overview = buildSessionsOverview(rows, now)
  const session: FilterOption[] = [
    { value: '', label: 'Toutes les sessions' },
    { value: 'upcoming', label: 'Camps à venir' },
    ...overview.current.map((s) => ({ value: s.id, label: `${s.name} · ${formatDayMonth(s.startDate)} · ${placesSummary(s)}` })),
    ...overview.past.map((s) => ({ value: s.id, label: `${s.name} (passée)` })),
    ...overview.orphans.map((o) => ({ value: o.id, label: `${o.id} (inconnue)` })),
  ]
  if (current.session && current.session !== 'none' && !session.some((o) => o.value === current.session)) {
    const known = sessionFromId(current.session)
    session.push({ value: current.session, label: known ? sessionShortName(known) : `${current.session} (inconnue)` })
  }
  session.push({ value: 'none', label: 'Sans session (sur mesure)' })

  const present = new Set(rows.map((r) => r.attribution_source).filter((v): v is string => !!v))
  const sources = [
    ...SOURCE_ORDER.filter((v) => present.has(v)),
    ...[...present].filter((v) => !SOURCE_ORDER.includes(v)).sort(),
  ]

  const withCurrent = (key: ExtraKey, options: FilterOption[]): FilterOption[] => {
    const v = current[key]
    return !v || options.some((o) => o.value === v) ? options : [...options, { value: v, label: filterValueLabel(key, v) }]
  }

  return {
    session,
    tunnel: withCurrent('tunnel', [
      { value: '', label: 'Tous' },
      ...(Object.keys(TUNNEL_LABEL) as TunnelType[]).map((v) => ({ value: v, label: TUNNEL_LABEL[v] })),
    ]),
    discipline: withCurrent('discipline', [
      { value: '', label: 'Toutes' },
      ...(Object.keys(DISCIPLINE_LABEL) as CampDiscipline[]).map((v) => ({ value: v, label: DISCIPLINE_LABEL[v] })),
    ]),
    source: withCurrent('source', [
      { value: '', label: 'Toutes' },
      ...sources.map((v) => ({ value: v, label: sourceLabel(v) })),
      { value: 'inconnue', label: 'Inconnue' },
    ]),
    partenaire: withCurrent('partenaire', [
      { value: '', label: 'Tous' },
      ...getActiveCodes().map((c) => ({ value: c.code, label: `${c.code} · ${c.partnerName}` })),
      ...Object.entries(PARTENAIRE_SPECIAL).map(([value, label]) => ({ value, label })),
    ]),
    langue: withCurrent('langue', [
      { value: '', label: 'Toutes' },
      ...(Object.keys(LANG_LABEL) as Lang[]).map((v) => ({ value: v, label: LANG_LABEL[v] })),
    ]),
    etape: withCurrent('etape', [
      { value: '', label: 'Toutes' },
      ...ETAPE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
    ]),
    tri: TRI_OPTIONS,
  }
}
