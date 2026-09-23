'use client'

// Filtres de la liste, hors recherche et statut. Rendu en fragment dans la
// barre d'outils de la liste (une grille) :
//   - bouton "Filtres (n)" (secondaire, sans icone) a droite de la recherche,
//     sous 1024 px seulement ; n = filtres actifs du panneau ;
//   - panneau de `select` natifs (session, tunnel, discipline, source,
//     langue, partenaire, etape, tri) : replie sous 1024 px, etat memorise
//     pour l'onglet (sessionStorage, lu apres le montage : le rendu serveur et
//     l'hydratation partent du panneau replie) ; ouvert, champs courts sur
//     deux colonnes, session et partenaire (libelles longs) sur toute la
//     largeur, puis "Voir les N candidatures" qui referme le panneau, garde
//     le focus sur "Filtres (n)" et ramene le haut de la liste a l'ecran ;
//     toujours affiche au-dessus de 1024 px, ses champs rejoignent alors la
//     grille de la barre (admin.css), sans ce bouton ;
//   - pastilles des filtres actifs : clic = retrait du filtre (le focus passe
//     a la pastille suivante, ou a la recherche), puis "Tout effacer".

import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import Button from '@/components/admin/ui/Button'
import Icon from '@/components/admin/ui/Icon'
import {
  FILTER_LABEL, activeFilterChips, countExtraFilters,
  type ExtraKey, type FilterOptions, type ListFilters,
} from '@/lib/admin/list-filters'

const OPEN_KEY = 'mkr-admin-filters-open'
const PANEL_ID = 'adm-cand-filters'
// Ordre du panneau (et des pastilles) : les champs courts vont par paires
// sous 1024 px, session et partenaire prennent toute la largeur.
const FIELDS: (ExtraKey | 'tri')[] = ['session', 'tunnel', 'discipline', 'source', 'langue', 'partenaire', 'etape', 'tri']
const FULL_WIDTH: (ExtraKey | 'tri')[] = ['session', 'partenaire']

function rememberOpen(open: boolean) {
  try {
    sessionStorage.setItem(OPEN_KEY, open ? '1' : '0')
  } catch {
    /* stockage indisponible : l'etat vaut pour cette page seulement */
  }
}

function resultsLabel(count: number): string {
  if (count === 0) return 'Aucune candidature'
  return count === 1 ? 'Voir 1 candidature' : `Voir les ${count} candidatures`
}

export interface FiltersPanelProps {
  filters: ListFilters
  options: FilterOptions
  onChange: (patch: Partial<ListFilters>) => void
  /** Rend le focus a la recherche (plus aucune pastille a focaliser). */
  onFocusSearch: () => void
  /** Nombre de candidatures de la liste filtree (bouton "Voir les N candidatures"). */
  resultCount: number
  /** Ramene le haut de la liste a l'ecran (panneau referme). */
  onShowResults: () => void
}

export default function FiltersPanel({ filters, options, onChange, onFocusSearch, resultCount, onShowResults }: FiltersPanelProps) {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const chipsRef = useRef<HTMLDivElement>(null)
  const focusChipAt = useRef<number | null>(null)
  const count = countExtraFilters(filters)
  const chips = activeFilterChips(filters)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(OPEN_KEY) === '1') setOpen(true)
    } catch {
      /* stockage indisponible : panneau replie */
    }
  }, [])

  // Apres le retrait d'une pastille : focus sur celle qui a pris sa place.
  useEffect(() => {
    const index = focusChipAt.current
    if (index === null) return
    focusChipAt.current = null
    const left = chipsRef.current?.querySelectorAll<HTMLButtonElement>('button.adm-chip')
    if (left && left.length > 0) left[Math.min(index, left.length - 1)].focus()
    else onFocusSearch()
  })

  const toggle = () => {
    const next = !open
    setOpen(next)
    rememberOpen(next)
  }

  // Panneau referme avant de focaliser et de faire defiler : la liste est
  // alors a sa place definitive.
  const showResults = () => {
    flushSync(() => setOpen(false))
    rememberOpen(false)
    toggleRef.current?.focus({ preventScroll: true })
    onShowResults()
  }

  const clearAll = () => {
    onChange(Object.fromEntries(chips.map((chip) => [chip.key, ''])) as Partial<ListFilters>)
    onFocusSearch()
  }

  return (
    <>
      <Button
        ref={toggleRef}
        className="adm-only-mobile adm-cand-filters-toggle"
        aria-expanded={open}
        aria-controls={PANEL_ID}
        onClick={toggle}
      >
        {count > 0 ? `Filtres (${count})` : 'Filtres'}
      </Button>

      <div id={PANEL_ID} className="adm-cand-filters" data-open={open ? 'true' : 'false'}>
        {FIELDS.map((key) => (
          <div
            key={key}
            className={[
              'adm-field adm-cand-filter',
              key === 'session' ? 'adm-cand-filter--session' : '',
              FULL_WIDTH.includes(key) ? 'adm-cand-filter--full' : '',
            ].filter(Boolean).join(' ')}
          >
            <label htmlFor={`adm-cand-${key}`} className="adm-field-label">
              {FILTER_LABEL[key]}
            </label>
            <select
              id={`adm-cand-${key}`}
              className="adm-select"
              value={filters[key]}
              onChange={(e) => onChange({ [key]: e.target.value } as Partial<ListFilters>)}
            >
              {options[key].map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
        <Button className="adm-only-mobile adm-cand-filters-done" disabled={resultCount === 0} onClick={showResults}>
          {resultsLabel(resultCount)}
        </Button>
      </div>

      {chips.length > 0 && (
        <div ref={chipsRef} className="adm-chips adm-cand-chips">
          {chips.map((chip, i) => (
            <button
              key={chip.key}
              type="button"
              className="adm-chip"
              aria-label={`Retirer le filtre ${chip.label}`}
              onClick={() => {
                focusChipAt.current = i
                onChange({ [chip.key]: '' } as Partial<ListFilters>)
              }}
            >
              {chip.label}
              <Icon name="x" size={14} />
            </button>
          ))}
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Tout effacer
          </Button>
        </div>
      )}
    </>
  )
}
