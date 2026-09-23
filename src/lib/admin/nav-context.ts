// Contexte precedent/suivant d'une fiche : la derniere liste vue (ordre des ids et
// URL de retour, filtres compris). sessionStorage : propre a l'onglet, efface a la
// fermeture. Toutes les lectures sont gardees (navigation privee, stockage bloque).
const KEY = 'mkr-admin-nav'

export interface NavContext { ids: string[]; backHref: string; label: string }

export function saveNavContext(ctx: NavContext): void {
  try { sessionStorage.setItem(KEY, JSON.stringify(ctx)) } catch { /* stockage indisponible */ }
}

export function readNavContext(): NavContext | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const v = JSON.parse(raw) as Partial<NavContext>
    if (!Array.isArray(v.ids) || typeof v.backHref !== 'string' || !v.backHref.startsWith('/admin')) return null
    return { ids: v.ids.filter((x): x is string => typeof x === 'string'), backHref: v.backHref, label: typeof v.label === 'string' ? v.label : '' }
  } catch {
    return null
  }
}

export function neighbors(ctx: NavContext | null, id: string): { prev: string | null; next: string | null; position: number; total: number } {
  const i = ctx ? ctx.ids.indexOf(id) : -1
  if (!ctx || i === -1) return { prev: null, next: null, position: 0, total: 0 }
  return { prev: ctx.ids[i - 1] ?? null, next: ctx.ids[i + 1] ?? null, position: i + 1, total: ctx.ids.length }
}
