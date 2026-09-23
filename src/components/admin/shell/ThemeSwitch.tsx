'use client'

// Selecteur d'apparence : Auto, Clair, Sombre (groupe de boutons radio,
// fleches du clavier comme un groupe radio natif).
// - Clair / Sombre : cookie mkr_admin_theme (1 an, path /admin, SameSite=Lax,
//   lisible par JS) et <html data-theme> mis a jour tout de suite, sans recharger ;
// - Auto : cookie supprime et attribut retire (admin.css suit alors le systeme).
// Le layout relit le cookie cote serveur : le choix tient apres rechargement.
// L'etat affiche vient de document.documentElement.dataset.theme, observe :
// deux selecteurs montes en meme temps (barre laterale, panneau Plus) restent
// d'accord. Au rendu serveur rien n'est coche (valeur inconnue), la bonne
// option apparait a l'hydratation.

import { useId, useRef, useSyncExternalStore } from 'react'
import Icon, { type IconName } from '@/components/admin/ui/Icon'

export type AdminTheme = 'auto' | 'light' | 'dark'

const THEME_COOKIE = 'mkr_admin_theme'
const ONE_YEAR = 60 * 60 * 24 * 365

const OPTIONS: { value: AdminTheme; label: string; icon: IconName }[] = [
  { value: 'auto', label: 'Auto', icon: 'monitor' },
  { value: 'light', label: 'Clair', icon: 'sun' },
  { value: 'dark', label: 'Sombre', icon: 'moon' },
]

function readTheme(): AdminTheme {
  const value = document.documentElement.dataset.theme
  return value === 'light' || value === 'dark' ? value : 'auto'
}

function readServerTheme(): AdminTheme | null {
  return null
}

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

function applyTheme(theme: AdminTheme) {
  const root = document.documentElement
  if (theme === 'auto') {
    delete root.dataset.theme
    document.cookie = `${THEME_COOKIE}=; path=/admin; max-age=0; SameSite=Lax`
  } else {
    root.dataset.theme = theme
    document.cookie = `${THEME_COOKIE}=${theme}; path=/admin; max-age=${ONE_YEAR}; SameSite=Lax`
  }
}

export interface ThemeSwitchProps {
  /** Libelles seuls, sans icone (barre laterale, trop etroite pour les deux). */
  compact?: boolean
}

export default function ThemeSwitch({ compact = false }: ThemeSwitchProps) {
  const current = useSyncExternalStore(subscribe, readTheme, readServerTheme)
  const labelId = useId()
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  const choose = (index: number, moveFocus: boolean) => {
    applyTheme(OPTIONS[index].value)
    if (moveFocus) buttons.current[index]?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = OPTIONS.length - 1
    let next: number
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = index === last ? 0 : index + 1
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        next = index === 0 ? last : index - 1
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = last
        break
      default:
        return
    }
    e.preventDefault()
    choose(next, true)
  }

  return (
    <div className="adm-theme">
      <p id={labelId} className="adm-label">
        Apparence
      </p>
      <div role="radiogroup" aria-labelledby={labelId} className="adm-seg adm-seg--block">
        {OPTIONS.map((option, index) => {
          const checked = current === option.value
          // Avant l'hydratation rien n'est coche : la premiere option reste atteignable.
          const tabbable = current === null ? index === 0 : checked
          return (
            <button
              key={option.value}
              ref={(el) => {
                buttons.current[index] = el
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={tabbable ? 0 : -1}
              className="adm-seg-item"
              onClick={() => choose(index, false)}
              onKeyDown={(e) => onKeyDown(e, index)}
            >
              {!compact && <Icon name={option.icon} size={16} />}
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
