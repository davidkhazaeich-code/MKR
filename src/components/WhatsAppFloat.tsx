'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { WHATSAPP, whatsappUrl } from '@/data/site'

/**
 * Bulle WhatsApp flottante, contact direct avec Ruslan.
 *
 * Pourquoi un panneau et pas un simple lien wa.me : le camp se vend sur le fait
 * que Ruslan valide et repond en personne. Ouvrir sur son visage + une phrase a
 * la premiere personne dit QUI decroche, ce qu'un lien nu ne dit pas.
 *
 * Montee dans `(site)/layout.tsx` uniquement : volontairement absente du tunnel
 * `/inscription` (hors du group `(site)`), ou toute sortie est une friction.
 *
 * Ce n'est PAS une modale : pas de scroll-lock, pas de piege de focus, la page
 * reste lisible derriere. Fermeture Echap + clic exterieur.
 */

const WA_PATH =
  'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'

function WhatsAppGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d={WA_PATH} />
    </svg>
  )
}

export default function WhatsAppFloat() {
  const t = useTranslations('common.whatsapp_float')
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false)
    if (restoreFocus) btnRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(true)
    }
    // pointerdown et pas click : ferme aussi au premier contact tactile, avant
    // que le geste ne se transforme en scroll.
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open, close])

  // Focus sur le CTA a l'ouverture. Le panneau ferme est en `visibility: hidden`,
  // donc ses liens sortent naturellement de l'ordre de tabulation.
  useEffect(() => {
    if (open) ctaRef.current?.focus()
  }, [open])

  const href = whatsappUrl(t('prefill'))

  return (
    <div className="wa-float-root" ref={rootRef}>
      <div
        id="wa-panel"
        className={`wa-panel${open ? ' is-open' : ''}`}
        role="dialog"
        aria-labelledby="wa-panel-title"
        aria-hidden={!open}
      >
        <button
          type="button"
          className="wa-panel-close"
          aria-label={t('close_aria')}
          onClick={() => close(true)}
          tabIndex={open ? undefined : -1}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="wa-panel-head">
          <span className="wa-panel-avatar">
            <Image
              src="/images/ruslan/ruslan-portrait-chemise-noire.webp"
              alt=""
              width={96}
              height={96}
              aria-hidden="true"
            />
            <span className="wa-panel-dot" aria-hidden="true" />
          </span>
          <span className="wa-panel-ident">
            <span className="wa-panel-eyebrow">{t('eyebrow')}</span>
            <span className="wa-panel-name" id="wa-panel-title">{t('name')}</span>
            <span className="wa-panel-role">{t('role')}</span>
          </span>
        </div>

        <div className="wa-panel-body">
          <p className="wa-panel-message">{t('message')}</p>
          <p className="wa-panel-status">
            <span className="wa-panel-status-dot" aria-hidden="true" />
            {t('status')}
          </p>
        </div>

        {/* QR : DESKTOP UNIQUEMENT (masque par CSS sous 769px). Sur ordinateur,
            beaucoup de visiteurs n'ont ni WhatsApp Web ni l'app : le bouton vert
            les mene a une page de connexion, le QR les mene a la conversation.
            Le QR encode EXACTEMENT la meme URL que le bouton, message pre-rempli
            compris (fichiers generes par locale, cf. public/images/whatsapp-qr-*.svg).
            Regenerer les 2 SVG si le numero ou le message pre-rempli change. */}
        <div className="wa-panel-qr">
          <p className="wa-panel-qr-intro">{t('qr_intro')}</p>
          <span className="wa-panel-qr-frame">
            {/* <img> brut et non next/image : SVG statique deja optimise, aucun
                besoin de srcset, et l'optimiseur ne transforme pas les SVG. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/whatsapp-qr-${locale === 'en' ? 'en' : 'fr'}.svg`}
              alt={t('qr_alt')}
              width={160}
              height={160}
              loading="lazy"
              decoding="async"
            />
          </span>
        </div>

        <div className="wa-panel-foot">
          <a
            ref={ctaRef}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="wa-panel-cta"
            tabIndex={open ? undefined : -1}
            onClick={() => close(false)}
          >
            <WhatsAppGlyph size={20} />
            {t('cta')}
          </a>
          <p className="wa-panel-number">
            {t('number_prefix')} <span dir="ltr">{WHATSAPP.display}</span>
          </p>
        </div>
      </div>

      <button
        ref={btnRef}
        type="button"
        className={`wa-float${open ? ' is-open' : ''}`}
        aria-label={open ? t('close_aria') : t('open_aria')}
        aria-expanded={open}
        aria-controls="wa-panel"
        onClick={() => (open ? close(false) : setOpen(true))}
      >
        <span className="wa-float-icon wa-float-icon--wa" aria-hidden="true">
          <WhatsAppGlyph size={28} />
        </span>
        <span className="wa-float-icon wa-float-icon--close" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </span>
      </button>
    </div>
  )
}
