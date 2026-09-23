'use client'

// Filtres de la liste, hors recherche et statut. Rendu en fragment dans la
// barre d'outils de la liste (une grille) :
//   - bouton "Filtres (n)" (secondaire, sans icone) a droite de la recherche,
//     sous 1024 px seulement ; n = filtres actifs du panneau ;
//   - panneau de `select` natifs (session, tunnel, discipline, source,
//     partenaire, langue, etape, tri) : replie sous 1024 px, etat memorise
//     pour l'onglet (sessionStorage, lu apres le montage : le rendu serveur et
//     l'hydratation partent du panneau replie) ; toujours affiche au-dessus,
//     ses champs rejoignent alors la grille de la barre (admin.css) ;
//   - pastilles des filtres actifs : clic = retrait du filtre (le focus passe
//     a la pastille suivante, ou a la recherche), puis "Tout effacer".

import { useEffect, useRef, useState } from 'react'
import Button from '@/components/admin/ui/Button'
import Icon from '@/components/admin/ui/Icon'
import {
  FILTER_LABEL, activeFilterChips, countExtraFilters,
  type ExtraKey, type FilterOptions, type ListFilters,
} from '@/lib/admin/list-filters'

const OPEN_KEY = 'mkr-admin-filters-open'
const PANEL_ID = 'adm-cand-filters'
const FIELDS: (ExtraKey | 'tri')[] = ['session', 'tunnel', 'discipline', 'source', 'partenaire', 'langue', 'etape', 'tri']

export interface FiltersPanelProps {
  filters: ListFilters
  options: FilterOptions
  onChange: (patch: Partial<ListFilters>) => void
  /** Rend le focus a la recherche (plus aucune pastille a focaliser). */
  onFocusSearch: () => void
}

export default function FiltersPanel({ filters, options, onChange, onFocusSearch }: FiltersPanelProps) {
  const [open, setOpen] = useState(false)
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
    try {
      sessionStorage.setItem(OPEN_KEY, next ? '1' : '0')
    } catch {
      /* stockage indisponible : l'etat vaut pour cette page seulement */
    }
  }

  const clearAll = () => {
    onChange(Object.fromEntries(chips.map((chip) => [chip.key, ''])) as Partial<ListFilters>)
    onFocusSearch()
  }

  return (
    <>
      <Button
        className="adm-only-mobile adm-cand-filters-toggle"
        aria-expanded={open}
        aria-controls={PANEL_ID}
        onClick={toggle}
      >
        {count > 0 ? `Filtres (${count})` : 'Filtres'}
      </Button>

      <div id={PANEL_ID} className="adm-cand-filters" data-open={open ? 'true' : 'false'}>
        {FIELDS.map((key) => (
          <div key={key} className={key === 'session' ? 'adm-field adm-cand-filter adm-cand-filter--session' : 'adm-field adm-cand-filter'}>
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
