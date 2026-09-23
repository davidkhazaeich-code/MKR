'use client'

// Liste des candidatures (spec 6.2). La page serveur charge toutes les lignes
// en une requete ; recherche, filtres et tri s'appliquent ici, instantanement.
//
// Filtres : etat local initialise depuis l'URL (anciens parametres `status` et
// `referralCode` acceptes) ; chaque changement reecrit l'URL par
// history.replaceState (integre au routeur Next, sans rechargement). Le
// routeur applique ces URL en transition, parfois apres la frappe suivante :
// les echos de nos propres ecritures sont reconnus et ignores. Une autre URL
// (lien "Candidatures" de la navigation, alors que la liste est ouverte)
// reinitialise l'etat depuis l'URL.
//
// Une seule horloge : `now` vient de nowIso (serveur), aucune autre lecture
// de l'heure au rendu (meme resultat au rendu serveur et a l'hydratation).
//
// Clavier : / recherche ; Echap dans la recherche efface, puis rend le focus
// a la page ; J / K et fleches deplacent le focus entre les liens des lignes,
// Entree les suit (natif) ; onglets : fleches gauche et droite, Debut, Fin.
// Au clic sur un dossier, contexte precedent/suivant de la fiche = toute la
// liste filtree dans l'ordre affiche (pas seulement les lignes rendues).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/components/admin/ui/Button'
import Icon from '@/components/admin/ui/Icon'
import RefreshButton from '@/components/admin/shell/RefreshButton'
import CandidatureRow from './CandidatureRow'
import FiltersPanel from './FiltersPanel'
import { computeNextStep } from '@/lib/admin/next-step'
import {
  DEFAULT_FILTERS, buildFilterOptions, filtersToQuery, matchesFilters, parseFilters, sortItems, statusCounts,
  type ListFilters, type ListItem, type StatutFilter,
} from '@/lib/admin/list-filters'
import { saveNavContext } from '@/lib/admin/nav-context'
import { dossierHref } from '@/lib/admin/row-helpers'
import { formatTime, plural } from '@/lib/admin/format'
import type { DossierRow } from '@/lib/admin/types'

/** Lignes rendues d'un coup, puis par tranche avec "Afficher les N suivantes". */
const PAGE_SIZE = 150
const LIST_PATH = '/admin/inscriptions'
const RESULTS_ID = 'adm-cand-results'
const DOSSIER_LINK = 'a[data-dossier-id]'

// "Toutes" d'abord : la liste s'ouvre sur tous les dossiers, refuses compris
// (comme l'ancienne admin) ; "Actifs" reste a un geste.
const TABS: { value: StatutFilter; label: string }[] = [
  { value: 'tous', label: 'Toutes' },
  { value: 'actifs', label: 'Actifs' },
  { value: 'recue', label: 'Reçues' },
  { value: 'validee', label: 'Validées' },
  { value: 'soldee', label: 'Soldées' },
  { value: 'camp_fait', label: 'Camp fait' },
  { value: 'refusee', label: 'Refusées' },
  { value: 'annulee', label: 'Annulées' },
  { value: 'reportee', label: 'Reportées' },
]

const FILTER_KEYS = Object.keys(DEFAULT_FILTERS) as (keyof ListFilters)[]
const sameFilters = (a: ListFilters, b: ListFilters): boolean => FILTER_KEYS.every((k) => a[k] === b[k])

/** Focus reel sur le lien d'une ligne, ligne entiere ramenee a l'ecran. */
function focusRowLink(link: HTMLAnchorElement) {
  link.focus({ preventScroll: true })
  link.closest('li')?.scrollIntoView({ block: 'nearest' })
}

export interface CandidaturesViewProps {
  rows: DossierRow[]
  nowIso: string
}

export default function CandidaturesView({ rows, nowIso }: CandidaturesViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlQuery = searchParams.toString()

  const [filters, setFilters] = useState<ListFilters>(() => parseFilters(searchParams))
  const [visible, setVisible] = useState(PAGE_SIZE)
  const filtersRef = useRef(filters)
  const writtenRef = useRef<string[]>([])
  const seenQueryRef = useRef(urlQuery)
  const searchRef = useRef<HTMLInputElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const focusRowAt = useRef<number | null>(null)
  const prefetched = useRef(new Set<string>())

  const now = useMemo(() => new Date(nowIso), [nowIso])
  const items = useMemo<ListItem[]>(() => rows.map((row) => ({ row, step: computeNextStep(row, now) })), [rows, now])
  // Options : ne dependent que des filtres du panneau (pas de la recherche,
  // du statut ni du tri) ; pas de recalcul a chaque frappe.
  const { session, tunnel, discipline, source, partenaire, langue, etape } = filters
  const options = useMemo(
    () => buildFilterOptions(rows, now, { ...DEFAULT_FILTERS, session, tunnel, discipline, source, partenaire, langue, etape }),
    [rows, now, session, tunnel, discipline, source, partenaire, langue, etape],
  )
  const counts = useMemo(() => statusCounts(items, filters, now), [items, filters, now])
  const filtered = useMemo(
    () => sortItems(items.filter((item) => matchesFilters(item, filters, undefined, now)), filters.tri),
    [items, filters, now],
  )
  const query = filtersToQuery(filters)
  const shown = filtered.slice(0, visible)
  const remaining = filtered.length - shown.length

  const commit = useCallback((next: ListFilters) => {
    if (sameFilters(next, filtersRef.current)) return
    filtersRef.current = next
    setFilters(next)
    setVisible(PAGE_SIZE)
    const q = filtersToQuery(next)
    if (q === window.location.search.replace(/^\?/, '')) return
    writtenRef.current = [...writtenRef.current.slice(-20), q]
    window.history.replaceState(null, '', q ? `?${q}` : window.location.pathname)
  }, [])

  const update = useCallback(
    (patch: Partial<ListFilters>) => commit({ ...filtersRef.current, ...patch }),
    [commit],
  )

  // L'URL a change sans passer par commit : echo d'une de nos ecritures, ou
  // navigation vers la liste avec d'autres parametres (l'URL fait alors foi).
  useEffect(() => {
    if (urlQuery === seenQueryRef.current) return
    seenQueryRef.current = urlQuery
    if (urlQuery === filtersToQuery(filtersRef.current)) {
      writtenRef.current = []
      return
    }
    if (writtenRef.current.includes(urlQuery)) return
    writtenRef.current = []
    const next = parseFilters(new URLSearchParams(urlQuery))
    filtersRef.current = next
    setFilters(next)
    setVisible(PAGE_SIZE)
  }, [urlQuery])

  // Bande d'onglets qui deborde (ecrans etroits, desktop de 1024 a 1279 px) :
  // data-fade dit de quel cote des onglets sont masques (fondu en CSS), mis a
  // jour au defilement et au redimensionnement de la bande ou d'un onglet.
  useEffect(() => {
    const list = tabsRef.current
    if (!list) return
    const sync = () => {
      const max = list.scrollWidth - list.clientWidth
      const start = list.scrollLeft > 1
      const end = list.scrollLeft < max - 1
      list.dataset.fade = start && end ? 'both' : start ? 'start' : end ? 'end' : 'none'
    }
    sync()
    list.addEventListener('scroll', sync, { passive: true })
    const observer = new ResizeObserver(sync)
    observer.observe(list)
    for (const tab of Array.from(list.children)) observer.observe(tab)
    return () => {
      list.removeEventListener('scroll', sync)
      observer.disconnect()
    }
  }, [])

  // Onglet actif ramene dans la bande des onglets (defilement horizontal
  // seulement : jamais de saut vertical de la page).
  useEffect(() => {
    const list = tabsRef.current
    const tab = list?.querySelector<HTMLElement>('[aria-selected="true"]')
    if (!list || !tab) return
    const style = getComputedStyle(list)
    const box = list.getBoundingClientRect()
    const rect = tab.getBoundingClientRect()
    const start = box.left + parseFloat(style.paddingLeft)
    const end = box.right - parseFloat(style.paddingRight)
    if (rect.left < start) list.scrollLeft -= start - rect.left
    else if (rect.right > end) list.scrollLeft += rect.right - end
  }, [filters.statut])

  // Apres "Afficher les N suivantes" : focus sur la premiere ligne ajoutee.
  useEffect(() => {
    const index = focusRowAt.current
    if (index === null) return
    focusRowAt.current = null
    const link = listRef.current?.querySelectorAll<HTMLAnchorElement>(DOSSIER_LINK)[index]
    if (link) focusRowLink(link)
  })

  // Raccourcis globaux : / recherche ; J, K et fleches entre les lignes.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target instanceof HTMLElement ? e.target : null
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return
      if (e.key === '/') {
        e.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
        return
      }
      const key = e.key.toLowerCase()
      const step = key === 'j' || key === 'arrowdown' ? 1 : key === 'k' || key === 'arrowup' ? -1 : 0
      if (step === 0) return
      const links = Array.from(listRef.current?.querySelectorAll<HTMLAnchorElement>(DOSSIER_LINK) ?? [])
      if (links.length === 0) return
      e.preventDefault()
      const active = document.activeElement
      const current = active instanceof Element ? active.closest('li')?.querySelector<HTMLAnchorElement>(DOSSIER_LINK) : null
      const index = current ? links.indexOf(current) : -1
      focusRowLink(links[index === -1 ? 0 : Math.min(links.length - 1, Math.max(0, index + step))])
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const prefetch = useCallback(
    (id: string) => {
      if (prefetched.current.has(id)) return
      prefetched.current.add(id)
      router.prefetch(dossierHref(id))
    },
    [router],
  )

  const focusSearch = useCallback(() => searchRef.current?.focus(), [])
  const showResults = useCallback(() => document.getElementById(RESULTS_ID)?.scrollIntoView({ block: 'start' }), [])

  const onTabsKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const i = TABS.findIndex((tab) => tab.value === filters.statut)
    const j =
      e.key === 'ArrowRight' ? (i + 1) % TABS.length
        : e.key === 'ArrowLeft' ? (i - 1 + TABS.length) % TABS.length
          : e.key === 'Home' ? 0
            : e.key === 'End' ? TABS.length - 1
              : -1
    if (j === -1) return
    e.preventDefault()
    update({ statut: TABS[j].value })
    tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[j]?.focus()
  }

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Escape') return
    if (e.currentTarget.value) {
      e.preventDefault()
      update({ q: '' })
    } else {
      e.currentTarget.blur()
    }
  }

  // Capture : l'enregistrement precede la navigation de next/link (clic,
  // clic molette, Entree sur un lien focalise).
  const rememberList = (e: React.MouseEvent) => {
    if (!(e.target instanceof Element) || !e.target.closest(DOSSIER_LINK)) return
    saveNavContext({
      ids: filtered.map((item) => item.row.id),
      backHref: query ? `${LIST_PATH}?${query}` : LIST_PATH,
      label: 'Candidatures',
    })
  }

  const showMore = () => {
    focusRowAt.current = shown.length
    setVisible((v) => v + PAGE_SIZE)
  }

  const resetFilters = () => {
    update({ ...DEFAULT_FILTERS, tri: filtersRef.current.tri })
    focusSearch()
  }

  const next = Math.min(PAGE_SIZE, remaining)
  const restricted = filtersToQuery({ ...filters, tri: DEFAULT_FILTERS.tri }) !== ''

  return (
    <div className="adm-container adm-cand">
      <header className="adm-page-head adm-cand-head">
        <div>
          <h1 className="adm-h1">Candidatures</h1>
          <p className="adm-page-meta">
            {rows.length === 0 ? 'Aucune candidature' : `${plural(rows.length, 'candidature', 'candidatures')} au total`}
            {' · '}mis à jour à {formatTime(nowIso)}
          </p>
        </div>
        <RefreshButton variant="secondary" size="sm" className="adm-only-desktop" />
      </header>

      <div
        ref={tabsRef}
        role="tablist"
        aria-label="Statut des candidatures"
        className="adm-tabs adm-cand-tabs"
        onKeyDown={onTabsKeyDown}
      >
        {TABS.map((tab) => {
          const selected = tab.value === filters.statut
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              id={`adm-cand-tab-${tab.value}`}
              aria-selected={selected}
              aria-controls={RESULTS_ID}
              tabIndex={selected ? 0 : -1}
              className="adm-tabs-item"
              onClick={() => update({ statut: tab.value })}
            >
              {tab.label}{' '}
              <span className="adm-tabs-count">{counts[tab.value]}</span>
            </button>
          )
        })}
      </div>

      <div className="adm-cand-controls">
        <div className="adm-cand-toolbar">
          <div className="adm-cand-search">
            <label htmlFor="adm-cand-q" className="adm-sr-only">
              Rechercher une candidature
            </label>
            <Icon name="search" size={18} className="adm-cand-search-icon" />
            <input
              ref={searchRef}
              id="adm-cand-q"
              type="search"
              className="adm-input adm-cand-search-input"
              placeholder="Nom, email ou téléphone"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
              aria-keyshortcuts="/"
              value={filters.q}
              onChange={(e) => update({ q: e.target.value })}
              onKeyDown={onSearchKeyDown}
            />
            <kbd className="adm-kbd adm-cand-search-kbd" aria-hidden="true">
              /
            </kbd>
          </div>
          <FiltersPanel
            filters={filters}
            options={options}
            onChange={update}
            onFocusSearch={focusSearch}
            resultCount={filtered.length}
            onShowResults={showResults}
          />
        </div>
      </div>

      <p className="adm-sr-only" role="status">
        {filtered.length === 0 ? 'Aucune candidature' : plural(filtered.length, 'candidature', 'candidatures')}
      </p>

      <div id={RESULTS_ID} className="adm-cand-results" onClickCapture={rememberList} onAuxClickCapture={rememberList}>
        {filtered.length > 0 ? (
          <>
            <ul ref={listRef} className="adm-rows adm-cand-list">
              {shown.map((item) => (
                <CandidatureRow key={item.row.id} item={item} now={now} onIntent={prefetch} />
              ))}
            </ul>
            {remaining > 0 && (
              <div className="adm-cand-more">
                <Button onClick={showMore}>
                  {next === 1 ? 'Afficher la suivante' : `Afficher les ${next} suivantes`}
                </Button>
              </div>
            )}
          </>
        ) : rows.length === 0 ? (
          <section className="adm-empty" aria-labelledby="adm-cand-empty-title">
            <span className="adm-empty-icon" aria-hidden="true">
              <Icon name="inbox" size={28} />
            </span>
            <h2 id="adm-cand-empty-title" className="adm-empty-title">
              Aucune candidature pour l&apos;instant
            </h2>
            <p className="adm-empty-text">Les candidatures apparaîtront ici dès leur envoi.</p>
          </section>
        ) : (
          <section className="adm-empty" aria-labelledby="adm-cand-empty-title">
            <span className="adm-empty-icon" aria-hidden="true">
              <Icon name="search" size={28} />
            </span>
            <h2 id="adm-cand-empty-title" className="adm-empty-title">
              {restricted ? 'Aucune candidature ne correspond' : 'Aucune candidature active'}
            </h2>
            <div className="adm-empty-actions">
              {restricted ? (
                <Button onClick={resetFilters}>Effacer les filtres</Button>
              ) : (
                <Button onClick={() => update({ statut: 'tous' })}>Voir toutes les candidatures</Button>
              )}
            </div>
          </section>
        )}
      </div>

      <p className="adm-cand-keys adm-only-desktop">
        <span>
          <kbd className="adm-kbd">/</kbd> rechercher
        </span>
        <span>
          <kbd className="adm-kbd">J</kbd> <kbd className="adm-kbd">K</kbd> naviguer
        </span>
        <span>
          <kbd className="adm-kbd">Entrée</kbd> ouvrir
        </span>
        <span>
          <kbd className="adm-kbd">Échap</kbd> effacer la recherche
        </span>
      </p>
    </div>
  )
}
