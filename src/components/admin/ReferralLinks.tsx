'use client'

import { useState } from 'react'
import Icon from './ui/Icon'

export interface ReferralLinkItem {
  code: string
  partnerName: string
  url: string
}

export default function ReferralLinks({ items }: { items: ReferralLinkItem[] }) {
  const [copied, setCopied] = useState<string | null>(null)

  async function copy(code: string, url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(code)
      setTimeout(() => setCopied((c) => (c === code ? null : c)), 2000)
    } catch {
      // clipboard indisponible (http non securise) : fallback silencieux
    }
  }

  if (items.length === 0) return null

  return (
    <section className="adm-card" style={{ marginBottom: '1.5rem' }}>
      <h2 className="adm-card-title">
        <Icon name="zap" size={14} />
        Liens d&apos;affiliation à partager
      </h2>
      <p style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)', margin: '0 0 0.9rem' }}>
        Chaque partenaire actif partage son lien. Le code est attribué automatiquement (cookie 90 jours).
      </p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.5rem' }}>
        {items.map((it) => (
          <li
            key={it.code}
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', padding: '0.5rem 0', borderBottom: '1px solid var(--adm-border-soft, rgba(255,255,255,0.05))' }}
          >
            <span style={{ fontWeight: 600, minWidth: 160 }}>{it.partnerName}</span>
            <code style={{ flex: 1, minWidth: 220, fontSize: '0.8rem', color: 'var(--adm-text-secondary)', wordBreak: 'break-all' }}>
              {it.url}
            </code>
            <button
              type="button"
              className="adm-btn adm-btn--ghost"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => copy(it.code, it.url)}
            >
              {copied === it.code ? 'Copié ✓' : 'Copier'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
