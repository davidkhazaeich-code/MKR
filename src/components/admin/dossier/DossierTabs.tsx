'use client'

// Contenu de la fiche en quatre panneaux (spec 6.3) :
// - sous 1024 px : onglets Profil, Suivi, Paiement, Historique (barre collee
//   sous l'en-tete, fleches gauche et droite, Debut, Fin ; onglet dans le
//   hash, cf. DossierProvider) ; un seul panneau affiche ;
// - a partir de 1024 px : deux colonnes (gauche : Profil puis Historique ;
//   droite : Suivi puis Paiement), barre d'onglets masquee, plus de colonne
//   collante.
// Les panneaux restent tous montes (etat des cartes et sauvegarde des notes
// conserves d'un onglet a l'autre) ; le CSS masque les inactifs en mobile.
// Roles tablist, tab et tabpanel seulement en mode onglets (lu apres le
// montage : le rendu serveur et l'hydratation partent du mode onglets).

import { useRef, useSyncExternalStore } from 'react'
import { useDossier } from './DossierProvider'
import { DOSSIER_TABS, type DossierTab } from '@/lib/admin/dossier'

const DESKTOP = '(min-width: 1024px)'
/** Ecart entre la barre d'onglets et le panneau (.adm-dossier-tabs, admin.css). */
const PANEL_GAP = 16

function subscribe(callback: () => void): () => void {
  const media = window.matchMedia(DESKTOP)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => false)
}

const tabId = (id: DossierTab) => `adm-dossier-tab-${id}`
const panelId = (id: DossierTab) => `adm-dossier-panel-${id}`

export interface DossierTabsProps {
  profil: React.ReactNode
  suivi: React.ReactNode
  paiement: React.ReactNode
  historique: React.ReactNode
}

export default function DossierTabs({ profil, suivi, paiement, historique }: DossierTabsProps) {
  const { tab, setTab } = useDossier()
  const desktop = useIsDesktop()
  const tablistRef = useRef<HTMLDivElement>(null)
  const colsRef = useRef<HTMLDivElement>(null)

  // Changement d'onglet quand la barre est collee : le panneau repart de son
  // debut, juste sous la barre (sinon on arriverait au milieu du suivant).
  const select = (next: DossierTab) => {
    setTab(next)
    const list = tablistRef.current
    const cols = colsRef.current
    if (!list || !cols) return
    requestAnimationFrame(() => {
      const stuckAt = list.getBoundingClientRect().bottom
      const top = cols.getBoundingClientRect().top
      if (top < stuckAt) window.scrollBy({ top: top - stuckAt - PANEL_GAP })
    })
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const i = DOSSIER_TABS.findIndex((t) => t.id === tab)
    const j =
      e.key === 'ArrowRight' ? (i + 1) % DOSSIER_TABS.length
        : e.key === 'ArrowLeft' ? (i - 1 + DOSSIER_TABS.length) % DOSSIER_TABS.length
          : e.key === 'Home' ? 0
            : e.key === 'End' ? DOSSIER_TABS.length - 1
              : -1
    if (j === -1) return
    e.preventDefault()
    select(DOSSIER_TABS[j].id)
    tablistRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[j]?.focus()
  }

  const panel = (id: DossierTab, content: React.ReactNode) => (
    <div
      id={panelId(id)}
      className="adm-dossier-panel"
      data-active={tab === id ? 'true' : undefined}
      {...(desktop ? {} : { role: 'tabpanel', 'aria-labelledby': tabId(id), tabIndex: 0 })}
    >
      {content}
    </div>
  )

  return (
    <div className="adm-dossier-body">
      <div
        ref={tablistRef}
        role={desktop ? undefined : 'tablist'}
        aria-label="Sections du dossier"
        className="adm-tabs adm-dossier-tabs"
        onKeyDown={onKeyDown}
      >
        {DOSSIER_TABS.map((t) => {
          const selected = t.id === tab
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={tabId(t.id)}
              aria-selected={selected}
              aria-controls={panelId(t.id)}
              tabIndex={selected ? 0 : -1}
              className="adm-tabs-item adm-dossier-tab"
              onClick={() => select(t.id)}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      <div ref={colsRef} className="adm-dossier-cols">
        <div className="adm-dossier-col">
          {panel('profil', profil)}
          {panel('historique', historique)}
        </div>
        <div className="adm-dossier-col">
          {panel('suivi', suivi)}
          {panel('paiement', paiement)}
        </div>
      </div>
    </div>
  )
}
