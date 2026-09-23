'use client'

// Liens d'affiliation des partenaires actifs, chacun avec "Copier".
// Copie reussie : le bouton dit "Copie" 2 s et une region aria-live (polite)
// l'annonce. Presse-papiers indisponible (http non securise, permission
// refusee) : le lien est selectionne pour une copie manuelle, et le message
// le dit.

import { useEffect, useRef, useState } from 'react'
import Button from './ui/Button'

export interface ReferralLinkItem {
  code: string
  partnerName: string
  url: string
}

const COPIED_MS = 2000

export default function ReferralLinks({ items }: { items: ReferralLinkItem[] }) {
  const [copied, setCopied] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copy(item: ReferralLinkItem, row: HTMLElement | null) {
    window.clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(item.url)
      setCopied(item.code)
      setMessage(`Lien de ${item.partnerName} copié`)
      timer.current = window.setTimeout(() => {
        setCopied(null)
        setMessage('')
      }, COPIED_MS)
    } catch {
      setCopied(null)
      const url = row?.querySelector('code')
      const selection = window.getSelection()
      if (url && selection) {
        const range = document.createRange()
        range.selectNodeContents(url)
        selection.removeAllRanges()
        selection.addRange(range)
      }
      setMessage(`Copie automatique impossible : le lien de ${item.partnerName} est sélectionné, copie-le à la main.`)
    }
  }

  if (items.length === 0) return null

  return (
    <section className="adm-card adm-links" aria-labelledby="adm-links-title">
      <h2 id="adm-links-title" className="adm-card-title">
        Liens d&apos;affiliation à partager
      </h2>
      <p className="adm-links-help">
        Chaque partenaire actif partage son lien. Le code est attribué automatiquement (cookie 90 jours).
      </p>
      <ul className="adm-links-list">
        {items.map((it) => (
          <li key={it.code} className="adm-links-row">
            <div className="adm-links-main">
              <p className="adm-links-name">{it.partnerName}</p>
              <code className="adm-links-url">{it.url}</code>
            </div>
            <Button
              size="sm"
              className="adm-links-copy"
              onClick={(e) => copy(it, e.currentTarget.closest('li'))}
            >
              {copied === it.code ? (
                'Copié'
              ) : (
                <>
                  Copier<span className="adm-sr-only"> le lien de {it.partnerName}</span>
                </>
              )}
            </Button>
          </li>
        ))}
      </ul>
      <p className="adm-sr-only" role="status" aria-live="polite">
        {message}
      </p>
      {message && !copied && (
        <p className="adm-links-fallback adm-tone--warn" aria-hidden="true">
          {message}
        </p>
      )}
    </section>
  )
}
